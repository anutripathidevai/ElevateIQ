import argparse
from decimal import Decimal
import csv
import json
from pathlib import Path
import shutil
import subprocess
import sys

import openpyxl
import pytest

PROJECT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT / "audit"))
import checks
from config import load_config
import execution
import file_io
import main as pipeline
import report


@pytest.fixture
def fixture(tmp_path):
    root = tmp_path / "source"
    root.mkdir()
    for doc in ("README_TakeHomeAssessment.pdf", "ExpertGuidelines.pdf"):
        (root / doc).write_bytes(b"Trusted synthetic instruction placeholder; not actual assessment content.")
    layout = checks.task_layout("123")
    for model, relative in layout["implementations"].items():
        path = root / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        code = {"reference": "ANSWER = 42\n", "a": "ANSWER = 42\n", "b": "ANSWER = 7\n",
                "c": "from helper_not_delivered import ANSWER\n"}[model]
        path.write_text(code, encoding="utf-8")
    prompt = root / layout["prompt"]
    prompt.parent.mkdir(parents=True)
    prompt.write_text("# Fixture\nReturn ANSWER = 42.\n", encoding="utf-8")
    tests = root / layout["tests"]
    tests.mkdir()
    (tests / "test_hidden.py").write_text(
        "import pytest\nfrom solution import ANSWER\n"
        "@pytest.mark.parametrize('expected', [42,42])\n"
        "def test_answer(expected): assert ANSWER == expected\n", encoding="utf-8",
    )
    rubric = [
        dict(description="Passes the hidden tests (points awarded in proportion to tests passed, rounded to the nearest integer)",
             importance="required", points=60, type="tests", rationale="Behavior", source="tests/test_hidden.py"),
        dict(description="Manual review item", importance="important", points=40,
             type="code_review", rationale="Manual", source="task/prompt.md"),
    ]
    book = openpyxl.Workbook()
    sheet = book.active
    sheet.title = "eval_tasks"
    sheet.append(list(checks.HEADERS))
    sheet.append(["123", "Fixture", "# Fixture\nReturn ANSWER = 42.", json.dumps(rubric), 2,
                  2, 100, 2, 100, 2, 100])
    book.save(root / "EvalTasks.xlsx")
    book.close()
    config_path = tmp_path / "audit-config.json"
    raw = dict(assessment_root="source", output_directory="outputs", expected_tasks=1, timeout_seconds=15)
    config_path.write_text(json.dumps(raw), encoding="utf-8")
    return argparse.Namespace(root=root, path=config_path, raw=raw, layout=layout, rubric=rubric,
                              config=load_config(config_path), tmp=tmp_path)


def run(fixture, **kwargs):
    result = pipeline.run_pipeline(fixture.config, allow_native=True, **kwargs)
    latest = fixture.config.output / "latest"
    return result, json.loads((latest / "results.json").read_text(encoding="utf-8")), latest


def test_full_pipeline_neutral_findings_and_no_input_writes(fixture):
    before = checks.files_in(fixture.root)[0]
    state, value, latest = run(fixture)
    assert state["status"] == "partial"
    assert state["exit_code"] == 2
    assert checks.files_in(fixture.root)[0] == before
    assert len(value["baseline"]) == 4
    c = next(row for row in value["baseline"] if row["model"] == "c")
    assert c["execution_status"] == "blocked"
    assert c["solution_status"] == "not_evaluated"
    assert c["comparable_counts"] is None
    b = next(row for row in value["baseline"] if row["model"] == "b")
    assert b["solution_status"] == "tests_failed"
    assert any(row["category"] == "score_upper_bound" and row["model"] == "b" for row in value["findings"])
    assert any(row["category"] == "recorded_result_comparison" for row in value["findings"])
    assert any(row["category"] == "prompt_outer_whitespace" and row["observation_type"] == "informational"
               for row in value["observations"])
    assert all(row["verification_status"] == "Pending Manual Review" and not row["final_severity"]
               and not row["disposition"] for row in value["findings"])
    for finding in value["findings"]:
        for path in finding["evidence"]:
            assert (latest / path).is_file(), path
    assert (latest / "findings.csv").is_file()
    assert any(stage["name"] == "targeted_probes" and stage["status"] == "skipped" for stage in value["stages"])
    assert not (PROJECT / "evidence" / "manual_audit.xlsx").exists()


def test_reruns_preserve_prior_run_manual_edits_and_stable_ids(fixture):
    _, first, latest = run(fixture, static_only=True)
    original_ids = {row["finding_id"] for row in first["findings"]}
    original = latest / "findings.csv"
    original.write_text(original.read_text(encoding="utf-8-sig") + "\nmanual-note\n", encoding="utf-8-sig")
    _, second, latest = run(fixture, static_only=True)
    assert first["run_id"] != second["run_id"]
    assert original_ids == {row["finding_id"] for row in second["findings"]}
    assert len(list((fixture.config.output / "runs").iterdir())) == 2
    assert list((fixture.config.output / "runs" / first["run_id"]).glob("manual-review-*.csv"))
    assert (fixture.config.output / "runs" / first["run_id"] / "results.json").is_file()


def test_missing_required_input_stops_before_execution(fixture, monkeypatch):
    (fixture.root / "ExpertGuidelines.pdf").unlink()
    monkeypatch.setattr(execution, "execute", lambda *a, **k: pytest.fail("No execution on preflight failure"))
    state, value, latest = run(fixture)
    assert state["exit_code"] == 3
    assert state["status"] == "blocked"
    assert not (latest / "logs" / "stages" / "baseline_results.json").exists()
    assert "ExpertGuidelines.pdf" in (latest / "summary.md").read_text(encoding="utf-8")


def test_malformed_workbook_preflight_is_explicit(fixture):
    (fixture.root / "EvalTasks.xlsx").write_bytes(b"invalid")
    state, _, latest = run(fixture)
    assert state["status"] == "blocked"
    assert "Workbook preflight failed" in (latest / "summary.md").read_text()


def test_failed_stage_is_tool_error_not_success_and_scoring_continues(fixture, monkeypatch):
    def broken(*args, **kwargs):
        raise RuntimeError("synthetic execution tool error")
    monkeypatch.setattr(execution, "execute", broken)
    state, value, latest = run(fixture)
    assert state["exit_code"] == 3
    assert any(s["name"] == "scoring" and s["status"] == "completed_with_observations" for s in value["stages"])
    assert "synthetic execution tool error" in (latest / "logs" / "pipeline.jsonl").read_text()
    assert not value["baseline"]


def test_interrupted_stage_preserves_partial_run(fixture, monkeypatch):
    def interrupted(*args, **kwargs):
        raise KeyboardInterrupt
    monkeypatch.setattr(execution, "execute", interrupted)
    state, value, latest = run(fixture)
    assert state["exit_code"] == 130
    assert state["status"] == "interrupted"
    assert (latest / "summary.md").exists()
    assert not (fixture.config.output / ".audit.lock").exists()


def test_native_authorization_required_even_for_direct_python(fixture, monkeypatch):
    monkeypatch.setattr(execution, "execute", lambda *a, **k: pytest.fail("Unauthorized code execution"))
    result = pipeline.run_pipeline(fixture.config)
    assert result["status"] == "blocked"
    assert result["exit_code"] == 3


def test_probe_configuration_records_rationale_and_separates_baseline(fixture):
    probe = fixture.tmp / "probe.py"
    probe.write_text("from solution import ANSWER\ndef test_probe(): assert ANSWER == 7\n")
    fixture.raw["probes"] = [dict(task_id="123", models=["b"], file="probe.py",
                                  rationale="Trusted synthetic independent expectation.", expected="ANSWER is 7 for this experiment.")]
    fixture.path.write_text(json.dumps(fixture.raw))
    fixture.config = load_config(fixture.path)
    _, value, latest = run(fixture)
    assert value["probes"][0]["runs"][0]["status"] == "passed"
    assert next(row for row in value["baseline"] if row["model"] == "b")["status"] == "test_failed"
    assert value["probes"][0]["sha256"] == checks.digest(probe)
    assert any(row["category"] == "audit_authored_probe" for row in value["observations"])
    assert not any(row["category"] == "audit_authored_probe" for row in value["findings"])


@pytest.mark.parametrize("changes", [
    {"unknown": True}, {"timeout_seconds": 0}, {"expected_tasks": True}, {"run_baseline": "yes"},
    {"hash_seed": -1}, {"probes": [{}]}, {"output_directory": "source/results"},
    {"output_directory": "."}, {"criterion_awards": "absent.csv"},
])
def test_invalid_config_rejected(fixture, changes):
    fixture.path.write_text(json.dumps({**fixture.raw, **changes}))
    with pytest.raises(ValueError):
        load_config(fixture.path)


def test_root_override_and_relative_paths_do_not_depend_on_cwd(fixture, monkeypatch):
    monkeypatch.chdir(fixture.root / "Data")
    config = load_config(fixture.path, fixture.root / "Data")
    assert config.root == fixture.root
    assert config.output == fixture.tmp / "outputs"


def test_upper_bound_is_conservative_and_unrecognized_rules_stay_unresolved(fixture):
    assert report.upper_bound(fixture.rubric, 11, 12) == Decimal(95)
    assert report.upper_bound(fixture.rubric, 1, 7) == Decimal(49)
    assert report.upper_bound(fixture.rubric, 0, 0) is None
    fixture.rubric[0]["description"] = "Passes all hidden tests (proportional)"
    assert report.upper_bound(fixture.rubric, 11, 12) is None
    fixture.rubric[0]["description"] = "Passes the hidden tests (60 x passed / 12, rounded)"
    assert report.upper_bound(fixture.rubric, 11, 12) == Decimal(95)
    assert report.upper_bound(fixture.rubric, 11, 13) is None
    fixture.rubric[1]["points"] = -10
    assert report.upper_bound(fixture.rubric, 11, 12) is None


def test_missing_implementation_is_blocked_not_zero(fixture):
    (fixture.root / fixture.layout["implementations"]["a"]).unlink()
    _, value, _ = run(fixture)
    row = next(row for row in value["baseline"] if row["model"] == "a")
    assert row["solution_status"] == "not_evaluated" and row["comparable_counts"] is None


def test_source_change_after_snapshot_is_reported(fixture, monkeypatch):
    original = checks.artifacts
    def change(ctx):
        result = original(ctx)
        (fixture.root / fixture.layout["prompt"]).write_text("Changed by trusted synthetic test.")
        return result
    monkeypatch.setattr(checks, "artifacts", change)
    _, value, _ = run(fixture)
    assert value["counts"]["source_unchanged"] is False
    assert all(row["solution_status"] == "not_evaluated" for row in value["baseline"])
    assert any(row["category"] == "source_integrity" for row in value["findings"])


def test_optional_report_is_structural_only(fixture):
    path = fixture.tmp / "user-report.md"
    path.write_text("# User report\n" + "word " * 2001)
    observations = pipeline.optional_report(path)
    assert any(row["check"] == "report_word_limit" for row in observations)
    assert any(row["check"] == "report_heading" for row in observations)
    assert pipeline.optional_report(None) == []


def test_output_lock_does_not_replace_another_runs_lock(fixture):
    fixture.config.output.mkdir()
    lock = fixture.config.output / ".audit.lock"
    lock.write_text('{"pid":123}')
    with pytest.raises(FileExistsError):
        run(fixture)
    assert lock.read_text() == '{"pid":123}'


def test_powershell_entry_from_foreign_working_directory(fixture):
    shell = shutil.which("powershell") or shutil.which("pwsh")
    if not shell:
        pytest.skip("PowerShell unavailable on this test host.")
    command = [shell, "-NoProfile", "-NonInteractive", "-File", str(PROJECT / "run-audit.ps1"),
               "-Config", str(fixture.path), "-Python", sys.executable, "-AllowNativeExecution"]
    completed = subprocess.run(command, cwd=fixture.root / "Data", capture_output=True, text=True, timeout=90)
    assert completed.returncode == 2, completed.stdout + completed.stderr
    latest = fixture.config.output / "latest"
    assert (latest / "summary.md").is_file()
    assert "Findings:" in completed.stdout
    value = json.loads((latest / "results.json").read_text())
    assert len(value["baseline"]) == 4
    assert value["counts"]["source_unchanged"] is True


def test_powershell_missing_input_propagates_exit(fixture):
    shell = shutil.which("powershell") or shutil.which("pwsh")
    if not shell:
        pytest.skip("PowerShell unavailable on this test host.")
    (fixture.root / "EvalTasks.xlsx").unlink()
    completed = subprocess.run(
        [shell, "-NoProfile", "-NonInteractive", "-File", str(PROJECT / "run-audit.ps1"),
         "-Config", str(fixture.path), "-Python", sys.executable, "-StaticOnly"],
        cwd=fixture.tmp, capture_output=True, text=True, timeout=30)
    assert completed.returncode == 3
    assert "EvalTasks.xlsx" in completed.stdout + completed.stderr


def test_report_failure_is_preserved_as_tool_error(fixture, monkeypatch):
    def broken(*args, **kwargs):
        raise ValueError("synthetic report failure")
    monkeypatch.setattr(report, "write_outputs", broken)
    state, value, latest = run(fixture, static_only=True)
    assert state["exit_code"] == 3 and value["status"] == "tool_error"
    assert "synthetic report failure" in (latest / "summary.md").read_text()
    assert (latest / "logs" / "stages" / "inventory.json").is_file()


def test_dependency_failure_has_persistent_diagnostics(fixture, monkeypatch):
    def absent(name):
        raise pipeline.importlib.metadata.PackageNotFoundError(name)
    monkeypatch.setattr(pipeline.importlib.metadata, "version", absent)
    state, value, latest = run(fixture)
    assert state["exit_code"] == 3
    assert value["findings"][0]["observation_type"] == "blocked"
    assert "missing" in (latest / "summary.md").read_text()


def test_explicit_awards_are_summed_without_automatic_grading(fixture):
    awards = fixture.tmp / "awards.csv"
    awards.write_text(
        "task_id,model,criterion_index,awarded_points\n"
        + "".join(f"123,{model},0,50\n123,{model},1,30\n" for model in "abc"))
    rules = fixture.tmp / "rules.json"
    rules.write_text(json.dumps({"123": {"formula": "sum_awards", "source": "Synthetic manual awards"}}))
    fixture.raw.update(criterion_awards="awards.csv", scoring_rules="rules.json")
    fixture.path.write_text(json.dumps(fixture.raw))
    fixture.config = load_config(fixture.path)
    _, value, _ = run(fixture, static_only=True)
    assert all(row["reconstructed_score"] == 80 for row in value["scoring"]["scores"])
    assert all(row["reconstruction_status"] == "difference" for row in value["scoring"]["scores"])


def test_latest_publish_failure_restores_old_snapshot(fixture, monkeypatch):
    run(fixture, static_only=True)
    latest = fixture.config.output / "latest"
    original = (latest / "results.json").read_bytes()
    source = fixture.tmp / "new-snapshot"
    source.mkdir()
    (source / "summary.md").write_text("new")
    rename = Path.rename
    def fail_new(self, destination):
        if self.name.startswith(".latest-incoming-"):
            raise OSError("synthetic publication error")
        return rename(self, destination)
    monkeypatch.setattr(Path, "rename", fail_new)
    with pytest.raises(OSError, match="publication"):
        pipeline.publish_latest(fixture.config.output, source)
    assert (latest / "results.json").read_bytes() == original


def test_no_source_correctness_zero_for_timeout(fixture, monkeypatch):
    monkeypatch.setattr(execution, "run_process", lambda *a, **k: dict(
        status="timeout", reason="Synthetic timeout", exit_code=None, duration_seconds=1))
    _, value, _ = run(fixture)
    assert all(row["comparable_counts"] is None and row["solution_status"] == "not_evaluated"
               for row in value["baseline"])
    assert all(row["status"] == "incomparable" for row in value["comparisons"])


def test_csv_source_text_cannot_be_interpreted_as_formula(fixture):
    _, _, latest = run(fixture, static_only=True)
    state = json.loads((latest / "results.json").read_text())
    details = latest / "logs" / "stages"
    inv = json.loads((details / "inventory.json").read_text())
    inv["records"]["observations"].append(checks.observation(
        "123", "test", "synthetic_formula", "warning", "=not-a-formula-to-execute"))
    (details / "inventory.json").write_text(json.dumps(inv))
    state["output"] = str(latest)
    report.write_outputs(state, details)
    with (latest / "findings.csv").open(encoding="utf-8-sig", newline="") as stream:
        rows = list(csv.DictReader(stream))
    assert next(row for row in rows if row["category"] == "synthetic_formula")["description"].startswith("'=")


def test_generated_caches_are_recorded_but_not_staged(fixture):
    cache = fixture.root / "Data" / "__pycache__" / "solution.cpython-312.pyc"
    cache.parent.mkdir()
    cache.write_bytes(b"synthetic stale bytecode, never import")
    _, value, latest = run(fixture, static_only=True)
    assert any(row["category"] == "generated_cache" and row["observation_type"] == "informational"
               for row in value["observations"])
    snapshot = fixture.tmp / "copy"
    snapshot.mkdir()
    ctx = dict(root=fixture.root)
    execution.stage_source(ctx, value["inventory"], snapshot)
    assert not (snapshot / cache.relative_to(fixture.root)).exists()
    assert cache.read_bytes() == b"synthetic stale bytecode, never import"
    assert (snapshot / fixture.layout["implementations"]["reference"]).is_file()


def sharing_error(code=5):
    error = PermissionError("Synthetic Windows output access conflict")
    error.winerror = code
    return error


@pytest.mark.parametrize("winerror", [5, 32, 33])
def test_atomic_checkpoint_retries_windows_access_conflicts(tmp_path, monkeypatch, winerror):
    target = tmp_path / "results.json"
    target.write_text('{"old": true}\n')
    original = target.read_bytes()
    replace = Path.replace
    calls = []
    delays = []
    def temporarily_locked(self, destination):
        calls.append(self)
        if len(calls) <= 2:
            assert target.read_bytes() == original
            raise sharing_error(winerror)
        return replace(self, destination)
    monkeypatch.setattr(Path, "replace", temporarily_locked)
    monkeypatch.setattr(file_io.time, "sleep", delays.append)
    file_io.write_json(target, {"new": True})
    assert json.loads(target.read_text()) == {"new": True}
    assert len(calls) == 3 and delays == list(file_io.RETRY_DELAYS[:2])
    assert not list(tmp_path.glob("*.tmp"))


def test_permanent_checkpoint_conflict_preserves_previous_results(tmp_path, monkeypatch):
    target = tmp_path / "results.json"
    target.write_text('{"old": true}\n')
    calls = []
    def locked(self, destination):
        calls.append(self)
        raise sharing_error()
    monkeypatch.setattr(Path, "replace", locked)
    monkeypatch.setattr(file_io.time, "sleep", lambda delay: None)
    with pytest.raises(PermissionError):
        file_io.write_json(target, {"new": True})
    assert json.loads(target.read_text()) == {"old": True}
    assert len(calls) == len(file_io.RETRY_DELAYS) + 1
    assert len(list(tmp_path.glob("*.tmp"))) == 1


def test_non_windows_permission_error_is_not_silently_retried(monkeypatch):
    calls = []
    def denied():
        calls.append(True)
        raise PermissionError("Permanent access policy")
    monkeypatch.setattr(file_io.time, "sleep", lambda delay: pytest.fail("Not a sharing-conflict retry"))
    with pytest.raises(PermissionError, match="Permanent access policy"):
        file_io.retry_io(denied)
    assert len(calls) == 1


def test_pipeline_recovers_checkpoint_and_stage_output_sharing_conflicts(fixture, monkeypatch):
    replace = Path.replace
    failures = {"results.json": 0, "artifact_validation.json": 0}
    def temporarily_locked(self, destination):
        path = Path(destination)
        if path.name in failures and failures[path.name] < 2:
            failures[path.name] += 1
            raise sharing_error()
        return replace(self, destination)
    monkeypatch.setattr(Path, "replace", temporarily_locked)
    monkeypatch.setattr(file_io.time, "sleep", lambda delay: None)
    state, value, latest = run(fixture)
    assert state["exit_code"] == 2 and state["status"] == "partial"
    assert len(value["baseline"]) == 4
    assert failures == {"results.json": 2, "artifact_validation.json": 2}
    assert "file_access_retry" in (latest / "logs/pipeline.jsonl").read_text()


def test_latest_rename_recovers_transient_sharing_conflict(fixture, monkeypatch):
    run(fixture, static_only=True)
    rename = Path.rename
    failures = []
    def temporarily_locked(self, destination):
        if self.name.startswith(".latest-incoming-") and len(failures) < 2:
            failures.append(True)
            raise sharing_error(32)
        return rename(self, destination)
    monkeypatch.setattr(Path, "rename", temporarily_locked)
    monkeypatch.setattr(file_io.time, "sleep", lambda delay: None)
    state, value, _ = run(fixture, static_only=True)
    assert len(failures) == 2 and state["exit_code"] == 2
    assert state["run_id"] == value["run_id"]


def test_locked_superseded_copy_is_warning_not_failed_audit(fixture, monkeypatch):
    _, first, _ = run(fixture, static_only=True)
    remove = shutil.rmtree
    def locked_previous(path, *args, **kwargs):
        if Path(path).name.startswith(".latest-previous-"):
            raise sharing_error()
        return remove(path, *args, **kwargs)
    monkeypatch.setattr(shutil, "rmtree", locked_previous)
    monkeypatch.setattr(file_io.time, "sleep", lambda delay: None)
    state, value, latest = run(fixture, static_only=True)
    assert state["exit_code"] == 2 and state["status"] == "partial"
    assert state["run_id"] == value["run_id"] != first["run_id"]
    assert (latest / "summary.md").is_file()
    assert (fixture.config.output / "runs" / first["run_id"] / "results.json").is_file()
    assert list(fixture.config.output.glob(".latest-previous-*"))
    assert "latest_cleanup_deferred" in (Path(state["output"]) / "logs/pipeline.jsonl").read_text()


def test_triage_removes_measurements_and_shared_limitations_from_queue(fixture):
    _, value, latest = run(fixture)
    assert value["schema_version"] == 2
    assert any(row["category"] == "baseline_execution" and row["model"] == "b" for row in value["observations"])
    assert not any(row["category"] in ("baseline_execution", "score_reconstruction_unresolved", "prompt_outer_whitespace")
                   or row["observation_type"] == "informational" for row in value["findings"])
    limitation = next(row for row in value["shared_limitations"] if row["id"] == "criterion-awards-unavailable")
    assert limitation["affected_task_ids"] == ["123"]
    assert value["coverage"]["missing_pairs"] == []
    assert value["coverage"]["attempted_unique_pairs"] == 4
    raw_ids = {row["finding_id"] for row in value["observations"]}
    assert all(set(row["related_observation_ids"]) <= raw_ids for row in value["findings"])
    assert all(row["decision_needed"] and row["review_order"] for row in value["findings"])
    assert "Task-quality and usefulness matrix" in (latest / "summary.md").read_text()
    assert "Assessment preparation" in (latest / "summary.md").read_text()


def test_shared_missing_module_is_one_traceable_blocker(fixture):
    for relative in fixture.layout["implementations"].values():
        (fixture.root / relative).write_text("from helper_not_delivered import ANSWER\n")
    _, value, _ = run(fixture)
    assert len(value["findings"]) == 1
    blocker = value["findings"][0]
    assert blocker["category"] == "evaluation_blocked"
    assert blocker["affected_models"] == ["a", "b", "c", "reference"]
    assert blocker["observed"]["dependent_comparisons"] == 7
    assert len(blocker["related_observation_ids"]) >= 11
    assert all(row["solution_status"] == "not_evaluated" for row in value["baseline"])
    assert value["task_quality_matrix"][0]["blocked_evaluations"] == 4
    assert value["task_quality_matrix"][0]["contract_coverage_review"] == "Pending Manual Review"


def test_discovery_and_count_mismatches_are_grouped_without_inventing_cause(fixture):
    state, _, latest = run(fixture)
    details = latest / "logs/stages"
    artifact = json.loads((details / "artifact_validation.json").read_text())
    artifact["records"]["observations"].append(checks.observation(
        "123", "Data/ExpertSolution_123/tests", "test_discovery", "warning",
        "Multiple pytest-named test files; all retained."))
    checks.save_json(details / "artifact_validation.json", artifact)
    state["output"] = str(latest)
    value = report.write_outputs(state, details)
    grouped = [row for row in value["findings"] if row["category"] == "recorded_result_comparison"]
    assert len(grouped) == 1
    assert "verify intended suite scope" in grouped[0]["description"]
    assert not any(row["category"] == "test_discovery" for row in value["findings"])
    assert len(grouped[0]["related_observation_ids"]) == 2


def test_evidence_refresh_preserves_execution_provenance_and_manual_edits(fixture, monkeypatch):
    _, original, latest = run(fixture)
    original_run = fixture.config.output / "runs" / original["run_id"]
    original_bytes = (original_run / "results.json").read_bytes()
    csv_path = latest / "findings.csv"
    csv_path.write_text(csv_path.read_text(encoding="utf-8-sig") + "\nmanual-note-to-preserve\n", encoding="utf-8-sig")
    monkeypatch.setattr(execution, "execute", lambda *a, **k: pytest.fail("No execution during refresh"))
    refreshed = pipeline.refresh_report(fixture.config)
    assert refreshed["report_generation"]["evidence_run_id"] == original["run_id"]
    assert refreshed["report_generation"]["new_baseline_executed"] is False
    assert refreshed["baseline"] == original["baseline"]
    assert refreshed["run_id"] != original["run_id"]
    assert (original_run / "results.json").read_bytes() == original_bytes
    assert any("manual-note-to-preserve" in path.read_text(encoding="utf-8-sig")
               for path in original_run.glob("manual-review-*.csv"))
    assert {row["finding_id"] for row in refreshed["findings"]} == {row["finding_id"] for row in original["findings"]}
    again = pipeline.refresh_report(fixture.config)
    assert again["report_generation"]["evidence_run_id"] == original["run_id"]
    assert again["report_generation"]["source_report_run_id"] == refreshed["run_id"]


def test_refresh_failure_preserves_latest_and_releases_lock(fixture, monkeypatch):
    _, _, latest = run(fixture, static_only=True)
    before = (latest / "results.json").read_bytes()
    def broken(*args):
        raise ValueError("synthetic refresh failure")
    monkeypatch.setattr(report, "write_outputs", broken)
    with pytest.raises(ValueError, match="synthetic refresh failure"):
        pipeline.refresh_report(fixture.config)
    assert (latest / "results.json").read_bytes() == before
    assert not (fixture.config.output / ".audit.lock").exists()


def test_refresh_requires_evidence_and_respects_an_active_lock(fixture):
    with pytest.raises(ValueError, match="existing inventoried run"):
        pipeline.refresh_report(fixture.config)
    run(fixture, static_only=True)
    lock = fixture.config.output / ".audit.lock"
    lock.write_text('{"pid":123}')
    with pytest.raises(FileExistsError):
        pipeline.refresh_report(fixture.config)
    assert lock.read_text() == '{"pid":123}'


def test_powershell_report_only_does_not_prompt_for_native_execution(fixture):
    _, original, _ = run(fixture, static_only=True)
    shell = shutil.which("powershell") or shutil.which("pwsh")
    if not shell:
        pytest.skip("PowerShell unavailable on this test host.")
    completed = subprocess.run(
        [shell, "-NoProfile", "-NonInteractive", "-File", str(PROJECT / "run-audit.ps1"),
         "-Config", str(fixture.path), "-Python", sys.executable, "-ReportOnly"],
        cwd=fixture.root / "Data", capture_output=True, text=True, timeout=30)
    assert completed.returncode == 2, completed.stdout + completed.stderr
    latest = json.loads((fixture.config.output / "latest/results.json").read_text())
    assert latest["report_generation"]["evidence_run_id"] == original["run_id"]
    assert "no new baseline" in completed.stdout


def test_utility_signals_never_turn_into_automatic_quality_approval(fixture):
    from triage import build_review
    state, _, latest = run(fixture, static_only=True)
    state["output"] = str(latest)
    result = report.collect(state, latest / "logs/stages")
    result["observations"] = []
    result["comparisons"] = [dict(task_id="123", status="match")]
    result["baseline"] = [
        report.normalize_run(dict(task_id="123", model=model, status="passed",
                                  counts=dict(collected=2, passed=2, failed=0)))
        for model in ("reference", "a", "b", "c")
    ]
    matrix = build_review(result)["task_quality_matrix"][0]
    assert "Sample saturation" in matrix["differentiation"]
    assert matrix["rubric_quality_review"] == "Pending Manual Review"
    result["comparisons"] = []
    missing_comparison = build_review(result)["task_quality_matrix"][0]
    assert missing_comparison["reconciliation"] == "not available"
    assert "Not ranked" in missing_comparison["differentiation"]
    result["baseline"][0]["status"] = "test_failed"
    assert "Not ranked" in build_review(result)["task_quality_matrix"][0]["differentiation"]


def test_different_missing_modules_are_not_claimed_as_one_root_cause(fixture):
    for model, relative in fixture.layout["implementations"].items():
        module = "missing_first_helper" if model in ("reference", "a") else "missing_second_helper"
        (fixture.root / relative).write_text(f"from {module} import ANSWER\n")
    _, value, _ = run(fixture)
    blockers = [row for row in value["findings"] if row["category"] == "evaluation_blocked"]
    assert len(blockers) == 2
    assert {tuple(row["affected_models"]) for row in blockers} == {("a", "reference"), ("b", "c")}
    assert sum(row["observed"]["dependent_comparisons"] for row in blockers) == 7


def test_failed_probe_is_candidate_but_remains_separate_from_baseline(fixture):
    probe = fixture.tmp / "probe.py"
    probe.write_text("from solution import ANSWER\ndef test_probe(): assert ANSWER == 7\n")
    fixture.raw["probes"] = [dict(task_id="123", models=["a"], file="probe.py",
                                  rationale="Synthetic separate contract experiment.", expected="ANSWER is 7.")]
    fixture.path.write_text(json.dumps(fixture.raw))
    fixture.config = load_config(fixture.path)
    _, value, _ = run(fixture)
    assert next(row for row in value["baseline"] if row["model"] == "a")["status"] == "passed"
    finding = next(row for row in value["findings"] if row["category"] == "audit_authored_probe")
    assert "not a delivered baseline" in finding["manual_verification_steps"]
    assert value["coverage"]["attempted_unique_pairs"] == 4


def test_missing_execution_evidence_cannot_be_reported_as_completed(fixture):
    state, _, latest = run(fixture, static_only=True)
    state.update(status="completed", exit_code=0, output=str(latest))
    value = report.write_outputs(state, latest / "logs/stages")
    assert len(value["coverage"]["missing_pairs"]) == 4
    assert value["status"] == state["status"] == "partial"
    assert value["exit_code"] == state["exit_code"] == 2
    assert "partial" in (latest / "summary.md").read_text()
