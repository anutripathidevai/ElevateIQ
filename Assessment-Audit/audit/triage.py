"""Turn captured observations into a small, traceable human decision queue."""
from __future__ import annotations

from collections import defaultdict
import hashlib
import json
import re
from typing import Any


def build_review(result: dict[str, Any]) -> dict[str, Any]:
    observations = result["observations"]
    tasks = {task["task_id"]: task for task in result["inventory"]["tasks"]}
    baseline = result["baseline"]
    observations_by_task: dict[str, list[dict[str, Any]]] = defaultdict(list)
    comparisons_by_task: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for item in observations:
        observations_by_task[item["task_id"]].append(item)
    for comparison in result["comparisons"]:
        comparisons_by_task[comparison["task_id"]].append(comparison)
    by_task: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for run in baseline:
        by_task[run["task_id"]].append(run)
    queue: list[dict[str, Any]] = []
    consumed: set[str] = set()

    def grouped(items: list[dict[str, Any]], category: str, key: str,
                description: str, decision: str, steps: str, impact: str) -> dict[str, Any]:
        first = items[0]
        identity = json.dumps([first["task_id"], category, key], ensure_ascii=True)
        models = sorted({model for item in items for model in item["model"].split(",") if model})
        row = {
            **first, "finding_id": "F-" + hashlib.sha256(identity.encode()).hexdigest()[:12],
            "category": category, "model": ",".join(models), "affected_models": models,
            "description": description, "decision_needed": decision,
            "reproduction": "Inspect the cited artifacts and captured results first; a rerun is optional. "
                            "The cited run.json/environment.json retain the original command and interpreter. "
                            "For a selected rerun use the persistent source root and selected solution directory, "
                            "not an expired temporary-copy path; execute only the cited suite/test in an appropriate VM.",
            "manual_verification_steps": steps, "impact_area_preliminary": impact,
            "artifact_path": "; ".join(sorted({item["artifact_path"] for item in items})),
            "evidence": sorted({path for item in items for path in item["evidence"]}),
            "related_observation_ids": sorted({item["finding_id"] for item in items}),
            "related_finding_ids": [],
        }
        consumed.update(row["related_observation_ids"])
        queue.append(row)
        return row

    unavailable: dict[tuple[str, str, str], list[dict[str, Any]]] = defaultdict(list)
    for item in observations:
        if item["category"] != "baseline_execution" or item["observation_type"] != "blocked":
            continue
        errors = item["observed"].get("collection_errors", [])
        text = "\n".join(error.get("error", "") for error in errors)
        missing = re.search(r"ModuleNotFoundError: No module named ['\"]([^'\"]+)['\"]", text)
        # A shared missing module is directly evidenced; other states are grouped by outcome, not assumed cause.
        cause = "missing module " + missing[1] if missing else item["description"]
        status = item["observed"]["status"]
        unavailable[(item["task_id"], status, cause)].append(item)
    for (task, status, cause), items in unavailable.items():
        models = {item["model"] for item in items}
        related = [
            item for item in observations_by_task[task] if (
                item["category"] == "recorded_result_comparison" and item["model"] in models
                and item["observation_type"] == "blocked"
                or item["category"] == "import_resolution"
                and any(f"Import '{module}'" in item["description"] for module in [cause.removeprefix("missing module ")])
            )
        ]
        row = grouped(
            items + related, "evaluation_blocked", status + ":" + cause,
            f"{len(models)} implementation evaluation(s) unavailable: {cause}. Dependent comparisons are not numeric results.",
            "Establish the missing input or execution blocker and which component owns it; do not assign a correctness zero.",
            "Read the cited stdout/pytest collection error and the importing line. Locate the authentic dependency "
            "or confirm it was not supplied. Preserve the baseline; test any correction in a separately labeled copy.",
            "Preliminary: affected implementations cannot be compared or scored from this execution.",
        )
        row["expected"] = "The intended delivered suite can collect and execute."
        row["observed"] = {"status": status, "affected_models": sorted(models), "blocker": cause,
                           "dependent_comparisons": sum(x["category"] == "recorded_result_comparison" for x in related)}

    comparisons: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for item in observations:
        if item["category"] == "recorded_result_comparison" and item["observation_type"] == "mechanical_discrepancy":
            comparisons[item["task_id"]].append(item)
    for task, items in comparisons.items():
        discovery = [item for item in observations_by_task[task] if item["category"] == "test_discovery"]
        differences = list(dict.fromkeys(
            f"{item['description'].split(':', 1)[0]}: {item['expected']} recorded vs {item['observed']} observed"
            for item in items
        ))
        row = grouped(
            items + discovery, "recorded_result_comparison", "recorded-counts",
            "; ".join(differences) + "."
            + (" Multiple test files are discoverable; verify intended suite scope." if discovery else ""),
            "Determine whether the workbook, selected suite/version, or execution conditions account for the differences.",
            "Compare each cited workbook cell with its model's recorded passed/collected counts. "
            "Inspect collected test node IDs and any additional test files. Check suite hashes and environment "
            "before choosing a cause; rerun only if the existing evidence cannot resolve it.",
            "Preliminary: engineers may compare models using counts from a different or inconsistent evaluation scope.",
        )
        row["expected"] = [{"model": x["model"], "cell": x["artifact_path"], "recorded": x["expected"]} for x in items]
        row["observed"] = [{"model": x["model"], "cell": x["artifact_path"], "executed": x["observed"]} for x in items]

    for item in observations:
        category = item["category"]
        if item["finding_id"] in consumed:
            continue
        if item["observation_type"] == "informational" or category in (
            "baseline_execution", "score_reconstruction_unresolved", "recorded_result_comparison",
            "additional_file", "directory_mapping", "import_resolution",
        ) or category.startswith("audit_stage_"):
            continue
        if category == "audit_authored_probe" and item["observed"].get("status") == "passed":
            continue
        if category.startswith("review_") and category != "review_prompt_examples":
            # A failing model's suspicious pattern alone is still a measurement, not a dataset claim.
            failed_models = {run["model"] for run in by_task[item["task_id"]]
                             if run["model"] != "reference" and run["status"] == "test_failed"}
            eligible = [signal for signal in item["observed"]["signals"] if signal["model"] not in failed_models]
            if not eligible:
                continue
            item = {**item, "model": ",".join(sorted({signal["model"] for signal in eligible if signal["model"]})),
                    "observed": {**item["observed"], "signals": eligible,
                                 "model_failure_context": [signal for signal in item["observed"]["signals"]
                                                           if signal["model"] in failed_models]}}
        if category == "reference_test_failure":
            failed = [x["node_id"] for x in item["observed"]["failed_assertions"]]
            decision = "Establish whether the reference, expected result, or task contract is wrong or ambiguous."
            steps = ("Read the task requirement exercised by " + ", ".join(failed) + ". "
                     "Compare the captured actual/expected values with that requirement and the reference implementation. "
                     "Do not assume the failing oracle is correct; rerun only the cited test if necessary.")
            impact = "Preliminary: the gold implementation and delivered test oracle disagree, undermining evaluation trust."
        elif category == "score_upper_bound":
            decision = "Verify that the cited proportional scoring rule applies to this exact suite and recorded score."
            steps = (f"Read rubric and score cell {item['artifact_path']}; compare the captured passed/collected counts "
                     "with the stated test-point allocation. Grant every nonnegative review point and verify the "
                     f"upper bound ({item['expected']}) against recorded {item['observed']}. "
                     "Do not reconstruct subjective criterion awards.")
            impact = "Preliminary: the recorded score may be incompatible with its stated scoring rule and distort comparisons."
        elif category.startswith("rubric"):
            decision = "Verify the cited rubric format/criterion error and identify the intended valid representation."
            steps = (f"Inspect the raw rubric at {item['artifact_path']} and the cited parser/schema diagnostic. "
                     "Check against required criterion fields. Keep the original value and record any correction separately.")
            impact = "Preliminary: engineers cannot reliably parse or apply the supplied rubric."
        elif category == "test_discovery":
            decision = "Confirm which delivered test files belong to the intended evaluation suite."
            steps = "Compare discovered test files and collected node IDs with the workbook's intended test count; do not infer obsolescence from a filename."
            impact = "Preliminary: unintended discovery can change the evaluation denominator and results."
        elif category == "explicit_score_reconstruction":
            decision = "Verify the supplied criterion awards and explicit aggregation rule against the recorded score."
            steps = "Inspect the supplied awards/rules and scoring_validation.json; reproduce the documented arithmetic without inventing missing awards."
            impact = "Preliminary: supplied awards and the recorded total may disagree."
        elif category == "audit_authored_probe":
            decision = "Check that the audit-authored experiment faithfully represents the cited contract."
            steps = "Review the configured rationale, expected behavior, probe source and captured output; this is not a delivered baseline result."
            impact = "Preliminary: a contract-based experiment suggests behavior not established by baseline tests."
        elif category.startswith("review_"):
            rule = category.removeprefix("review_")
            signals = item["observed"]["signals"]
            decision = "Validate the generic " + rule + " screen against the exact contract, source lines and captured execution evidence."
            steps = "Inspect the signals and source hashes in review_checks.json, then the cited artifact lines. "
            if rule == "prompt_examples":
                steps += ("Review each extracted call and expected value against the original prompt; compare generated "
                          "test source and run.json/pytest logs. Unmatched literal calls do not prove absence from dynamic tests. "
                          "A prompt example can itself be inconsistent; do not assume the reference is the oracle.")
            else:
                steps += ("This is a syntactic concern, not an executed semantic counterexample. Check preprocessing, "
                          "assertion canonicalization, regex flags and any context before confirming it.")
            impact = "Preliminary: " + (signals[0]["impact"] if signals else "Explicit prompt behavior may not agree with an implementation.")
        else:
            decision = "Verify this specific artifact or source-integrity discrepancy against the supplied requirement."
            steps = f"Inspect {item['artifact_path']} and the cited diagnostic: {item['description']} Check the affected artifact only; no blanket rerun is required."
            impact = "Preliminary: the documented artifact, mapping, or reproducibility requirement may not be satisfied."
        description = item["description"]
        if category == "reference_test_failure":
            counts = item["observed"]["counts"]
            names = [name.rsplit("::", 1)[-1] for name in failed]
            description = (f"Reference passes {counts['passed']}/{counts['collected']}; failing tests: "
                           + ", ".join(names[:3]) + (f" (+{len(names) - 3} more)" if len(names) > 3 else "")
                           + ". Verify contract/oracle agreement.")
        elif category == "score_upper_bound":
            description = f"Recorded score {item['observed']}; supported bound: {item['expected']}. This is not a reconstructed total."
        elif category == "rubric_json":
            description = f"Rubric JSON cannot be parsed at {item['artifact_path']}: {item['description']}"
        row = grouped([item], category, item["finding_id"], description, decision, steps, impact)
        # Keep existing identities for unchanged individual claims.
        row["finding_id"] = item["finding_id"]

    priorities = {"evaluation_blocked": 0, "reference_test_failure": 1, "rubric_json": 2,
                  "recorded_result_comparison": 3, "score_upper_bound": 4}
    queue.sort(key=lambda row: (priorities.get(row["category"], 5), row["task_id"], row["finding_id"]))
    queue_by_task: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in queue:
        queue_by_task[row["task_id"]].append(row)
    for index, row in enumerate(queue, 1):
        row["review_order"] = index
        row["related_finding_ids"] = [other["finding_id"] for other in queue_by_task[row["task_id"]] if other is not row]

    unresolved = [item for item in observations if item["category"] == "score_reconstruction_unresolved"]
    unresolved_tasks = {item["task_id"] for item in unresolved}
    limitations = [{
        "id": "manual-contract-review", "description": "Passing tests do not establish contract coverage, oracle correctness, or subjective rubric quality.",
        "affected_task_ids": sorted(tasks), "evidence": ["logs/stages/inventory.json"],
    }]
    if unresolved:
        limitations.append({
            "id": "criterion-awards-unavailable",
            "description": "Full rubric totals cannot be reconstructed without complete criterion-level awards and explicit supported rules; this is one shared limitation, not one defect per task.",
            "affected_task_ids": sorted(unresolved_tasks),
            "evidence": ["logs/stages/scoring_validation.json"],
        })
    matrix = []
    review_by_task = {entry["task_id"]: entry for entry in result.get("review_checks", {}).get("tasks", [])}
    artifact_checks_completed = any(
        stage["name"] == "validate_artifacts" and stage["status"] in ("completed", "completed_with_observations")
        for stage in result["stages"]
    )
    for task, inventory_task in sorted(tasks.items()):
        runs = by_task[task]
        reference = next((r for r in runs if r["model"] == "reference"), None)
        candidates = [r for r in runs if r["model"] in ("a", "b", "c") and r["comparable_counts"] is not None]
        issues = queue_by_task[task]
        differences = [r for r in comparisons_by_task[task] if r["status"] == "difference"]
        incomparable = [r for r in comparisons_by_task[task] if r["status"] == "incomparable"]
        reconciliation = ("differences + blocked" if differences and incomparable else "differences" if differences
                          else "blocked" if incomparable else "matches" if comparisons_by_task[task] else "not available")
        blocked = [r for r in runs if r["comparable_counts"] is None]
        compatible = (len(candidates) == 3 and reference is not None
                      and reference["comparable_counts"] is not None
                      and len({r["comparable_counts"]["collected"] for r in candidates + [reference]}) == 1)
        if not reference or reference["status"] != "passed" or not compatible or issues or reconciliation != "matches":
            utility = "Not ranked: quality/evidence review required."
        elif all(r["status"] == "passed" for r in candidates):
            utility = "Sample saturation: all 3 models pass."
        elif len({r["comparable_counts"]["passed"] for r in candidates}) > 1:
            utility = "Observed pass-count separation; unvalidated."
        else:
            utility = "Same pass count; inspect failure patterns."
        matrix.append({
            "task_id": task, "expected_evaluations": 4, "attempted_evaluations": len(runs),
            "completed_evaluations": len(runs) - len(blocked), "blocked_evaluations": len(blocked),
            "reference_result": reference["status"] if reference else "not_executed",
            "reconciliation": reconciliation,
            "rubric_schema": "violation detected" if any(r["category"].startswith("rubric") for r in issues)
                             else "no violation detected" if artifact_checks_completed else "not established",
            "scoring": "full reconstruction unavailable" if task in unresolved_tasks
                       else "inspect explicit scoring evidence",
            "contract_coverage_review": "Pending Manual Review", "rubric_quality_review": "Pending Manual Review",
            "differentiation": utility, "finding_ids": [r["finding_id"] for r in issues],
            "model_results": {r["model"]: {"status": r["status"], "counts": r["comparable_counts"]} for r in runs},
            "artifact_paths": inventory_task["layout"]["implementations"],
            "generic_review": {
                "status": "recorded" if task in review_by_task else "not_recorded",
                "checks": review_by_task.get(task, {}).get("checks", []),
                "experiment_status": review_by_task.get(task, {}).get("experiment_status", "not_executed"),
            },
        })
    expected = {(task, model) for task in tasks for model in ("reference", "a", "b", "c")}
    actual = {(run["task_id"], run["model"]) for run in baseline}
    return {
        "findings": queue, "task_quality_matrix": matrix, "shared_limitations": limitations,
        "review_policy": {
            "review_order": "Workflow order, not severity: unblock evaluations, inspect reference/oracle failures, then artifact/count/scoring discrepancies.",
            "ordinary_model_failures": "Measurements, not dataset issues unless separate evidence establishes a contradiction.",
            "manual_decisions": "Never automatically confirmed or carried into another report; previous CSV edits remain preserved.",
            "differentiation": "Descriptive signals from three supplied models only; no validated ranking or model trend is inferred.",
        },
        "coverage": {
            "expected_pairs": len(expected), "attempted_unique_pairs": len(actual & expected),
            "missing_pairs": [{"task_id": t, "model": m} for t, m in sorted(expected - actual)],
            "unexpected_pairs": [{"task_id": t, "model": m} for t, m in sorted(actual - expected)],
            "duplicate_records": len(baseline) - len(actual),
        },
        "operational_issues": [stage for stage in result["stages"] if stage["status"] in ("tool_error", "blocked", "interrupted")],
        "context_observations": [item["finding_id"] for item in observations if item["finding_id"] not in consumed],
    }
