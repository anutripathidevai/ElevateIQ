"""Neutral consolidation; verification and final severity remain human-owned."""
from __future__ import annotations

from collections import Counter
from decimal import Decimal, ROUND_CEILING
import hashlib
import json
from pathlib import Path
import re
from typing import Any

from checks import load_json, numeric, parse_rubric, save_csv, save_json
from file_io import atomic_write_text
from triage import build_review


FIELDS = [
    "finding_id", "task_id", "model", "category", "observation_type", "description",
    "artifact_path", "expected", "observed", "evidence", "reproduction", "manual_verification_steps",
    "impact_area_preliminary", "evidence_completeness", "verification_status",
    "manual_verification", "final_severity", "disposition", "comments",
    "review_order", "affected_models", "decision_needed", "related_observation_ids", "related_finding_ids",
    "evidence_basis", "check_result", "source_status",
]
COMPLETENESS = {
    "direct": "A captured artifact or comparable execution directly supports this observation; not human-confirmed.",
    "partial": "Some supporting evidence exists, but interpretation/contract or grading evidence is incomplete.",
    "blocked": "The intended check could not complete; no solution-correctness conclusion follows.",
}


def maybe_records(path: Path, default: Any) -> Any:
    return load_json(path)["records"] if path.is_file() else default


def upper_bound(criteria: list[dict[str, Any]], passed: int, total: int) -> Decimal | None:
    """Conservative bound for two explicitly recognized proportional scoring descriptions."""
    tests = [criterion for criterion in criteria if criterion["type"] == "tests"]
    if len(tests) != 1 or total <= 0 or not 0 <= passed <= total:
        return None
    if any(not numeric(c["points"]) or c["points"] < 0 for c in criteria):
        return None
    criterion = tests[0]
    description = criterion["description"].strip()
    general = re.fullmatch(
        r"Passes the hidden tests \(points awarded in proportion to tests passed, rounded (?:to the nearest integer|half up)\)",
        description,
    )
    explicit = re.fullmatch(r"Passes the hidden tests \((\d+) x passed / (\d+), rounded\)", description)
    if not general and not (explicit and Decimal(explicit[1]) == Decimal(str(criterion["points"]))
                            and int(explicit[2]) == total):
        return None
    contribution = Decimal(str(criterion["points"])) * passed / total
    # Ceiling is a safe upper bound even when a nearest-integer tie convention is unspecified.
    rounded_upper = contribution.to_integral_value(rounding=ROUND_CEILING)
    return rounded_upper + sum(Decimal(str(c["points"])) for c in criteria if c["type"] != "tests")


def normalize_run(run: dict[str, Any]) -> dict[str, Any]:
    valid = run["status"] in ("passed", "test_failed")
    blocked = run["status"] in ("collection_failed", "unavailable", "blocked", "timeout",
                                "setup_error", "cleanup_error", "instrumentation_error", "interrupted")
    return {
        **run, "execution_status": "blocked" if blocked else "completed",
        "solution_status": ("tests_passed" if run["status"] == "passed" else "tests_failed") if valid else "not_evaluated",
        "comparable_counts": run.get("counts") if valid else None,
        "raw_counts": run.get("counts"),
    }


def collect(state: dict[str, Any], details: Path) -> dict[str, Any]:
    inventory = maybe_records(details / "inventory.json", dict(tasks=[], observations=[], manifest=[]))
    artifacts = maybe_records(details / "artifact_validation.json", dict(observations=[], imports=[]))
    baseline = maybe_records(details / "baseline_results.json", [])
    reconciliation = maybe_records(details / "result_reconciliation.json", dict(comparisons=[], observations=[]))
    scoring = maybe_records(details / "scoring_validation.json", dict(scores=[], observations=[]))
    review = maybe_records(details / "review_checks.json", dict(version=None, tasks=[], observations=[], limitations=[
        "Generic review checks were not recorded for this evidence run. Report-only refresh does not invent them."]))
    findings: dict[str, dict[str, Any]] = {}
    reproduced = (
        "& '<project>\\run-audit.ps1' -AssessmentRoot '<assessment-root>' -AllowNativeExecution "
        "# same config; inspect this task's paired log. Use a disposable VM."
    )

    def evidence(path: str) -> str:
        relative = Path(path)
        return (Path("logs/stages") / relative).as_posix()

    def add(task: str, model: str, category: str, kind: str, description: str,
            artifact: str, expected: Any, observed: Any, references: list[str],
            completeness: str = "direct", key: str = "") -> dict[str, Any]:
        stable = json.dumps([task, model, category, artifact, key], ensure_ascii=True)
        identifier = "F-" + hashlib.sha256(stable.encode()).hexdigest()[:12]
        findings[identifier] = dict(
            finding_id=identifier, task_id=task, model=model, category=category,
            observation_type=kind, description=description, artifact_path=artifact,
            expected=expected, observed=observed, evidence=references,
            reproduction=reproduced,
            manual_verification_steps="Open the cited artifacts/logs; compare with the task prompt and guideline; "
                                      "rerun the selected pair in an appropriate environment; enter your decision.",
            impact_area_preliminary="Potential effect on evaluation reproducibility/interpretation; significance requires human review.",
            evidence_completeness=completeness, verification_status="Pending Manual Review",
            manual_verification="", final_severity="", disposition="", comments="",
            evidence_basis="recorded_evidence", check_result="not_applicable", source_status="recorded_snapshot",
        )
        return findings[identifier]

    for name, observations in [
        ("inventory.json", inventory["observations"]), ("artifact_validation.json", artifacts["observations"]),
        ("result_reconciliation.json", reconciliation["observations"]), ("scoring_validation.json", scoring["observations"]),
        ("review_checks.json", [item for item in review["observations"]
                                if item["check"] in ("source_review_unavailable", "source_integrity")]),
        ("user_report_validation.json", maybe_records(details / "user_report_validation.json", [])),
        ("source_integrity.json", state.get("integrity_observations", [])),
    ]:
        for item in observations:
            if item["status"] == "pass":
                continue
            location = item["location"]
            task = item["task_id"]
            if not task:
                match = re.search(r"(?:Task|ExpertSolution|ModelOutputs)_([0-9]+)", location)
                task = match[1] if match else ""
            informational = item["status"] == "info" or (
                item["check"] == "file_presence" and "conditional" in item["message"])
            kind = ("informational" if informational else "blocked" if item["status"] == "blocked"
                    else "mechanical_discrepancy" if item["status"] == "failure" else "potential_issue")
            add(task, "", item["check"], kind, item["message"], location,
                "Documented artifact/schema/mapping; conditional starter not mandatory.", item["status"],
                [evidence(name)], "blocked" if kind == "blocked" else "partial" if kind == "potential_issue" else "direct")
    for run in baseline:
        if run["status"] == "passed":
            continue
        valid = run["status"] == "test_failed"
        references = [evidence(run["log"])]
        if (details / Path(run["log"]).with_name("stdout.log")).is_file():
            references.append(evidence(str(Path(run["log"]).with_name("stdout.log"))))
        pytest_path = details / Path(run["log"]).with_name("pytest.json")
        runtime = load_json(pytest_path) if pytest_path.is_file() else {}
        failures = [
            dict(node_id=phase["nodeid"], phase=phase["when"], detail=phase["detail"])
            for phase in runtime.get("phases", []) if phase["outcome"] == "failed"
        ]
        add(run["task_id"], run["model"],
            "reference_test_failure" if valid and run["model"] == "reference" else "baseline_execution",
            "potential_issue" if valid else "blocked",
            ("Reference does not pass its delivered suite; inspect the contract, test oracle and implementation."
             if valid and run["model"] == "reference" else
             "Delivered tests report assertion failures; a model failure alone is not a dataset defect." if valid else
             "Evaluation unavailable: " + run["reason"] + " This is not a numeric correctness result."),
            run["implementation"], "Reference must pass; models are measured without assuming they should pass.",
            dict(status=run["status"], counts=run.get("counts") if valid else None,
                 failed_assertions=failures, collection_errors=runtime.get("collection_errors", [])),
            references,
            "direct" if valid else "blocked")
    for row in reconciliation["comparisons"]:
        if row["status"] == "match":
            continue
        blocked = row["status"] == "incomparable"
        add(row["task_id"], row["model"], "recorded_result_comparison",
            "blocked" if blocked else "mechanical_discrepancy",
            f"{row['metric']}: {row['status']}. Counts do not establish the historical cause.",
            row["workbook_location"], row["workbook_value"], None if blocked else row["observed_value"],
            [evidence("result_reconciliation.json"), evidence(row["evidence"])],
            "blocked" if blocked else "direct", row["metric"])
    by_task = {task["task_id"]: task for task in inventory["tasks"]}
    by_run = {(row["task_id"], row["model"]): row for row in baseline}
    for task_id, task in by_task.items():
        if len(task["workbook_rows"]) != 1:
            continue
        row = task["workbook_rows"][0]
        rubric, errors = parse_rubric(row["values"].get("Expert Rubric"))
        for model in ("a", "b", "c"):
            run = by_run.get((task_id, model))
            if not rubric or errors or not run or run["status"] not in ("passed", "test_failed"):
                continue
            counts = run["counts"]
            if row["values"].get("Hidden Tests") != counts["collected"]:
                continue
            # A criterion naming one file cannot safely grade a directory collecting other files.
            report_path = details / Path(run["log"]).with_name("pytest.json")
            report = load_json(report_path) if report_path.exists() else {}
            files = {node.split("::")[0] for node in report.get("collected", [])}
            if len(files) != 1:
                continue
            bound = upper_bound(rubric, counts["passed"], counts["collected"])
            recorded = row["values"].get(f"Model {model.upper()} Rubric Score")
            if bound is not None and numeric(recorded) and Decimal(str(recorded)) > bound:
                add(task_id, model, "score_upper_bound", "mechanical_discrepancy",
                    "Recorded score exceeds a conservative upper bound for the recognized proportional test rule. "
                    "This is not a reconstructed total; review awards and provenance.",
                    row["locations"][f"Model {model.upper()} Rubric Score"],
                    f"At most {bound} with every nonnegative review point granted",
                    recorded, [evidence("inventory.json"), evidence(run["log"])])
    unresolved: dict[str, list[str]] = {}
    for score in scoring["scores"]:
        if score["reconstruction_status"] == "unavailable":
            unresolved.setdefault(score["task_id"], []).append(score["model"])
        elif score["reconstruction_status"] in ("difference", "incomparable"):
            add(score["task_id"], score["model"], "explicit_score_reconstruction",
                "mechanical_discrepancy" if score["reconstruction_status"] == "difference" else "blocked",
                score["note"], score["workbook_location"], score["reconstructed_score"],
                score["recorded_score"], [evidence("scoring_validation.json")])
    for task_id, models in unresolved.items():
        add(task_id, ",".join(models), "score_reconstruction_unresolved", "inconclusive",
            "Full rubric total cannot be reconstructed without complete criterion-level awards and explicit supported rules.",
            task_id + ":rubric", "Explicit criterion awards and aggregation rule", "unavailable",
            [evidence("scoring_validation.json")], "partial")
    for probe in state.get("probes", []):
        for run in probe.get("runs", []):
            add(run["task_id"], run["model"], "audit_authored_probe",
                "potential_issue" if run["status"] in ("passed", "test_failed") else "blocked",
                "Audit-authored experiment, not delivered baseline. " + probe["rationale"],
                probe["file"], probe["expected"], dict(status=run["status"], counts=run.get("counts")),
                [evidence(run["log"])], "direct" if run["status"] in ("passed", "test_failed") else "blocked",
                probe["sha256"])
    for stage in state["stages"]:
        if stage["status"] in ("tool_error", "blocked", "interrupted"):
            add("", "", "audit_stage_" + stage["name"],
                "blocked" if stage["status"] != "tool_error" else "inconclusive",
                stage.get("error", stage["status"]), "logs/pipeline.jsonl",
                "Stage completes or documents its exact blocker.", stage["status"],
                ["logs/pipeline.jsonl"], "blocked")
    baseline_by_pair = {(run["task_id"], run["model"]): run for run in baseline}
    for task in review["tasks"]:
        by_rule: dict[str, list[dict[str, Any]]] = {}
        for signal in task["signals"]:
            by_rule.setdefault(signal["rule"], []).append(signal)
        runs = task.get("executions", [])
        failed = [run for run in runs if run["status"] == "test_failed" and (
            run["model"] == "reference" or baseline_by_pair.get((task["task_id"], run["model"]), {}).get("status") != "test_failed")]
        blocked_runs = [run for run in runs if run["status"] not in ("passed", "test_failed")]
        if failed or blocked_runs:
            by_rule.setdefault("prompt_examples", [])
        for rule, signals in by_rule.items():
            example_rule = rule == "prompt_examples"
            references = [evidence("review_checks.json")]
            if example_rule:
                references += [evidence(run["log"]) for run in runs]
                if task.get("probe_file"):
                    references.append(evidence(task["probe_file"]))
            models = sorted({signal["model"] for signal in signals if signal["model"]}
                            | ({run["model"] for run in failed + blocked_runs} if example_rule else set()))
            description = signals[0]["title"] if signals else "Explicit prompt-example replay could not establish agreement."
            if example_rule and failed:
                description += " Prompt-example replay fails for: " + ", ".join(run["model"] for run in failed) + "."
                for run in failed:
                    prior = baseline_by_pair.get((task["task_id"], run["model"]))
                    if prior and prior["status"] == "passed":
                        counts = prior["counts"]
                        description += f" {run['model']}: delivered tests pass {counts['passed']}/{counts['collected']}."
            title = add(
                task["task_id"], ",".join(models), "review_" + rule,
                "blocked" if example_rule and blocked_runs and not failed and not signals else "potential_issue",
                description, "; ".join(sorted({signal["artifact"] for signal in signals})),
                "Prompt examples and explicit contract must agree with the evaluation; screens require source review.",
                dict(signals=signals, executions=runs if example_rule else [],
                     examples=task["examples"] if example_rule else [], source_files=task["source_files"]),
                references, "partial", rule,
            )
            title.update(
                evidence_basis="source_inspection;executed_prompt_examples" if example_rule and runs else "source_inspection",
                check_result=("reproduced" if failed else "blocked" if blocked_runs else "not_reproduced" if runs else "not_executed")
                if example_rule else "not_executed",
                source_status="changed_needs_review" if state.get("integrity_observations") else "recorded_snapshot",
            )
    findings_list = sorted(findings.values(), key=lambda row: (row["task_id"], row["category"], row["model"], row["finding_id"]))
    result = {
        **state, "schema_version": 2, "inventory": inventory, "artifact_checks": artifacts,
        "baseline": [normalize_run(run) for run in baseline],
        "comparisons": reconciliation["comparisons"], "scoring": scoring,
        "review_checks": review,
        "observations": findings_list, "evidence_completeness_definitions": COMPLETENESS,
    }
    return {**result, **build_review(result)}


def write_outputs(state: dict[str, Any], details: Path) -> dict[str, Any]:
    result = collect(state, details)
    coverage = result["coverage"]
    if state["exit_code"] in (0, 1) and (
        coverage["missing_pairs"] or coverage["unexpected_pairs"] or coverage["duplicate_records"]
    ):
        state.update(status="partial", exit_code=2)
        result.update(status="partial", exit_code=2)
    output = Path(state["output"])
    categories = Counter(row["observation_type"] for row in result["findings"])
    execution = Counter(row["status"] for row in result["baseline"])
    stage_counts = Counter(stage["status"] for stage in state["stages"])
    result["counts"] = dict(
        tasks_discovered=len(result["inventory"]["tasks"]),
        tasks_with_execution_records=len({row["task_id"] for row in result["baseline"]}),
        tasks_with_comparable_results=len({row["task_id"] for row in result["baseline"]
                                           if row["comparable_counts"] is not None}),
        baseline_records=len(result["baseline"]), baseline_statuses=dict(execution),
        stage_statuses=dict(stage_counts), finding_types=dict(categories),
        finding_categories=dict(Counter(row["category"] for row in result["findings"])),
        source_unchanged=not state.get("integrity_observations") if state.get("integrity_checked") else None,
        raw_observations=len(result["observations"]), actionable_findings=len(result["findings"]),
    )
    save_json(output / "results.json", result)
    # Spreadsheet applications must not interpret untrusted source/error text as formulas.
    csv_findings = []
    for finding in result["findings"]:
        clean = {}
        for key, value in finding.items():
            if isinstance(value, (dict, list)):
                value = json.dumps(value, ensure_ascii=True)
            if isinstance(value, str) and value.lstrip().startswith(("=", "+", "-", "@")):
                value = "'" + value
            clean[key] = value
        csv_findings.append(clean)
    save_csv(output / "findings.csv", csv_findings, FIELDS)
    atomic_write_text(output / "summary.md", render_summary(result))
    return result


def render_summary(result: dict[str, Any]) -> str:
    def cell(value: Any) -> str:
        return str(value).replace("|", "/").replace("\n", " ")

    counts = result["counts"]
    coverage = result["coverage"]
    lines = [
        "# Assessment audit evidence summary", "",
        f"**Audit execution: {result['status']}** | Report: `{result['run_id']}` | Exit code: {result['exit_code']}",
        "", "This is an automated evidence summary, NOT the final assessment report or a set of confirmed defects.",
        "Candidate decisions remain **Pending Manual Review**; final severity and disposition are blank.",
        "", "## Run completeness", "",
        f"- Tasks discovered: {counts['tasks_discovered']}",
        f"- Expected pairs: {coverage['expected_pairs']}; unique expected pairs attempted: {coverage['attempted_unique_pairs']}; "
        f"missing: {len(coverage['missing_pairs'])}; unexpected: {len(coverage['unexpected_pairs'])}; duplicate records: {coverage['duplicate_records']}.",
        f"- Evaluation outcomes: `{json.dumps(counts['baseline_statuses'], sort_keys=True)}`.",
        f"- Source unchanged at the evidence run's integrity check: {counts['source_unchanged']}.",
        f"- Actionable review items: **{len(result['findings'])}**, grouped across "
        f"**{len({row['task_id'] for row in result['findings'] if row['task_id']})} tasks**. "
        f"Raw observations retained in JSON: {len(result['observations'])}.",
        "- A blocked stage means some intended checks were unavailable, not that later tasks were necessarily skipped. Missing pairs above identify actual omissions.",
    ]
    if result.get("report_generation"):
        provenance = result["report_generation"]
        lines += ["", f"**Evidence-only refresh:** execution evidence comes from `{provenance['evidence_run_id']}`. "
                  "No assessment implementations or tests were executed by this refresh. "
                  "Integrity and environment results describe the original evidence run, not a new execution."]
    if coverage["missing_pairs"]:
        lines += ["", "Missing pairs: `" + json.dumps(coverage["missing_pairs"], sort_keys=True) + "`."]
    lines += [
        "", "## Focused review queue", "",
        "Review order is workflow order, **not severity**. Related claims stay separate where their causes are not established.",
        "Ordinary model assertion failures are measurements in JSON, not automatic dataset findings.",
        "", "| Order | Task | Models | Claim | Evidence / verification | Decision needed |",
        "|---:|---|---|---|---|---|",
    ]
    for row in result["findings"]:
        lines.append(f"| {row['review_order']} | {row['task_id'] or 'global'} | {cell(row['model'])} | "
                     f"`{row['finding_id']}`: {cell(row['description'])} | {cell(row['evidence_basis'])} / "
                     f"{row['check_result']} | {cell(row['decision_needed'])} |")
    if not result["findings"]:
        lines += ["", "No actionable claim was produced by the enabled checks. This is not a declaration that all tasks are correct."]
    lines += [
        "", "## Task-quality and usefulness matrix", "",
        "Contract coverage and rubric quality require human review for every task. No automated clean/approved status is assigned.",
        "Completed/attempted counts below refer to implementation evaluations, not individual tests.",
        "Usefulness signals describe only the three supplied models: saturation does not imply obsolescence, "
        "and pass-count separation is not a validated ranking or trend. Schema validity does not establish rubric quality.",
        "", "| Task | Completed / attempted / expected | Blocked | Reference | A / B / C passed | Reconciliation | Rubric schema / full score | Contract / rubric review | Usefulness signal |",
        "|---|---|---:|---|---|---|---|---|---|",
    ]
    for row in result["task_quality_matrix"]:
        models = []
        for model in ("a", "b", "c"):
            observed = row["model_results"].get(model)
            models.append(f"{observed['counts']['passed']}/{observed['counts']['collected']}"
                          if observed and observed["counts"] is not None
                          else "blocked" if observed else "not run")
        lines.append(f"| {row['task_id']} | {row['completed_evaluations']} / {row['attempted_evaluations']} / 4 | "
                     f"{row['blocked_evaluations']} | {row['reference_result']} | {'; '.join(models)} | {row['reconciliation']} | "
                     f"{cell(row['rubric_schema'])}; {cell(row['scoring'])} | Pending / Pending | {cell(row['differentiation'])} |")
    lines += [
        "", "## Generic review-check coverage", "",
        "Checks are dataset-driven syntactic screens, not semantic approval. No predefined task IDs or review notes are used. "
        "Only safely extracted literal prompt examples supply automatic expected outputs; no unseen-input oracle is invented.",
        "", "| Task | Prompt examples | Matching literal test inputs | Unresolved test calls | Example replay | Review signals |",
        "|---|---:|---:|---:|---|---:|",
    ]
    for row in result["task_quality_matrix"]:
        entry = row["generic_review"]
        examples = next((check for check in entry["checks"] if check["rule"] == "prompt_examples"), {})
        signals = sum(check["status"] == "signal" for check in entry["checks"])
        lines.append(f"| {row['task_id']} | {examples.get('extracted', 'unsupported')} | "
                     f"{examples.get('matched_inputs', 'not assessed')} | {examples.get('unresolved_test_calls', 'not assessed')} | "
                     f"{entry['experiment_status'] if entry['status'] == 'recorded' else 'not recorded'} | {signals} |")
    for limitation in result.get("review_checks", {}).get("limitations", []):
        lines.append("- " + limitation)
    lines += ["", "## Shared limitations and context", ""]
    for limitation in result["shared_limitations"]:
        lines.append(f"- **{limitation['id']}**: {limitation['description']} "
                     f"Affected tasks: {', '.join(limitation['affected_task_ids'])}.")
    lines += [
        "- Cosmetic whitespace, conditional starters, generated caches, additional files with no established defect, "
        "and approximate static import warnings are retained in `observations`/diagnostic JSON, not repeated in the action queue.",
        "", "## Assessment preparation", "",
        "These are evidence pointers and review prompts, not final conclusions or reviewed recommendations.",
        "", "| Requested section | Available support | Human decision still required |",
        "|---|---|---|",
        "| Issues found | Focused finding IDs, task IDs, expected/observed data and evidence links. | Confirm each claim and explain its engineering impact. |",
        "| Guidelines, tests and rubrics | Reference/oracle, suite-scope, dependency, rubric-schema and scoring discrepancies where found. | Select justified controls: independent oracle review, contract-to-test mapping, clean collection, explicit scoring and calibration. |",
        "| Long-term success | Per-task quality gates and descriptive results for three supplied models. | Review coverage/duplicate families, reproducibility over time, anchor/holdout strategy and model trends; one run cannot establish them. |",
        "| Leading the team | Traceable issue categories and unresolved review gates. | Assign author/reviewer/adjudicator ownership and weekly measures: evaluability, reference failures, discrepancies, reviewer agreement, escaped defects, backlog, flakiness and saturation. |",
        "", "## Pipeline stages", "", "| Stage | Status | Detail |", "|---|---|---|",
    ]
    for stage in result["stages"]:
        lines.append(f"| {stage['name']} | {stage['status']} | {cell(stage.get('error', stage.get('note', '')))} |")
    lines.extend([
        "", "## Evidence and manual review",
        "", "Open `findings.csv` for actionable claims, task-specific decisions and editable verification/severity/disposition/comments.",
        "Each finding's related_observation_ids trace grouped evidence back to observations in results.json. "
        "Related findings link independent claims about the same task.",
        "Use `results.json` for all comparisons (including matches), raw vs comparable counts, workbook cells, hashes and grading limitations.",
        "Evidence paths are relative to this output folder; logs preserve exact commands, environment and pytest details.",
        "The original source root is recorded in results.json; do not use expired temporary-copy paths as reproduction destinations.",
        "Stable finding IDs exclude timestamps; reviewer decisions are never automatically carried into a different run.",
        "Prior output runs and any edited latest CSV are preserved; compare source hashes before reusing a prior decision.",
        "", "## Limitations",
        "", "- Collection/setup errors, missing sources, timeouts and instrumentation failures mean **not evaluated**, not correctness zero.",
        "- Assertion failures are actual delivered-test outcomes, not automatically dataset defects.",
        "- Count matches do not establish reference correctness or justify a rubric score.",
        "- Static import resolution is approximate; only collection/execution establishes runtime availability.",
        "- Unrecognized scoring formulas and missing criterion awards remain inconclusive. Conservative bounds do not regrade code-review criteria.",
        "- Native execution is NOT a security sandbox; use a standard-user disposable VM without credentials. No hard CPU/memory/disk quota.",
        "- Empty probe configuration is explicitly skipped; there is no invented requirement coverage or unseen experiment.",
        "- Framework resource/timeouts and logging cannot prove every source requirement was tested.",
        "- Final <=2,000-word five-topic assessment, judgments, recommendations and human endorsement remain manual deliverables.",
    ])
    return "\n".join(lines) + "\n"
