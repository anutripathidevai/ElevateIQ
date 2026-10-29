import argparse
import ctypes
import json
import os
from pathlib import Path
import subprocess
import sys
import time

import openpyxl
import pytest

HOME = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(HOME / "audit"))
import checks as kit
import execution
from config import input_root


@pytest.fixture
def ctx(tmp_path):
    root = tmp_path / "source"
    out = tmp_path / "results"
    root.mkdir()
    out.mkdir()
    layout = kit.task_layout("1")
    for model, relative in layout["implementations"].items():
        path = root / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text("ANSWER = 42\n", encoding="utf-8")
    prompt = root / layout["prompt"]
    prompt.parent.mkdir(parents=True)
    prompt.write_text("# Synthetic\n")
    tests = root / layout["tests"]
    tests.mkdir()
    (tests / "test_hidden.py").write_text(
        "import pytest\nfrom solution import ANSWER\n"
        "@pytest.mark.parametrize('expected', [42, 42])\n"
        "def test_answer(expected): assert ANSWER == expected\n"
    )
    workbook = openpyxl.Workbook()
    sheet = workbook.active
    sheet.title = "eval_tasks"
    sheet.append(kit.HEADERS)
    rubric = json.dumps([dict(description="Synthetic", importance="custom", points=5,
                              type="tests", rationale="Synthetic only", source="tests/test_hidden.py")])
    sheet.append(["1", "Fixture", "# Synthetic\n", rubric, 2, 2, 5, 2, 5, 2, 5])
    workbook.save(root / "EvalTasks.xlsx")
    workbook.close()
    config = dict(expected_tasks=1, timeout_seconds=20, probes="probe.py", report="report.md",
                  report_sections=["Your process"], submission_paths=[])
    return dict(root=root, out=out, config_dir=tmp_path, run_id="synthetic", config=config)


def args(**values):
    return argparse.Namespace(**dict(dict(task_id=["1"], model=["reference"], probe_file=None,
                                         timeout=None, hash_seed=0, allow_native_execution=True), **values))


def results(ctx, probe=False):
    return kit.load_json(ctx["out"] / ("probe_results.json" if probe else "baseline_results.json"))["records"]


def test_native_full_baseline_and_reconciliation(ctx):
    layout = kit.task_layout("1")
    (ctx["root"] / layout["implementations"]["b"]).write_text("ANSWER = 7\n")
    (ctx["root"] / layout["implementations"]["c"]).write_text("from helper_not_delivered import ANSWER\n")
    kit.inventory(ctx)
    execution.execute(ctx, args(model=None))
    records = results(ctx)
    assert [row["status"] for row in records] == ["passed", "passed", "test_failed", "collection_failed"]
    assert records[0]["counts"]["collected"] == 2
    assert records[2]["counts"]["passed"] == 0
    assert records[3]["exit_code"] == 2
    log_dir = (ctx["out"] / records[0]["log"]).parent
    report = kit.load_json(log_dir / "pytest.json")
    assert report["solution"]["matches_selected"]
    assert report["solution"]["sha256"] == records[0]["implementation_sha256"]
    assert (log_dir / "environment.json").exists()
    assert (log_dir / "stdout.log").stat().st_size > 0
    kit.reconcile(ctx)
    comparison = kit.load_json(ctx["out"] / "result_reconciliation.json")["records"]["comparisons"]
    assert any(row["status"] == "difference" and row["model"] == "b" for row in comparison)
    assert all(row["status"] == "incomparable" for row in comparison if row["model"] == "c")
    assert kit.integrity(ctx, kit.read_inventory(ctx)) == []


def test_native_requires_explicit_acknowledgement(ctx):
    kit.inventory(ctx)
    with pytest.raises(ValueError, match="required"):
        execution.execute(ctx, args(allow_native_execution=False))
    assert not (ctx["out"] / "baseline_results.json").exists()


def test_baseline_never_overwrites(ctx):
    kit.inventory(ctx)
    execution.execute(ctx, args())
    with pytest.raises(ValueError, match="already exists"):
        execution.execute(ctx, args())


def test_source_changed_blocks_execution(ctx, monkeypatch):
    kit.inventory(ctx)
    (ctx["root"] / kit.task_layout("1")["prompt"]).write_text("changed")
    monkeypatch.setattr(execution, "run_process", lambda *a, **k: pytest.fail("Must not execute modified snapshot"))
    execution.execute(ctx, args())
    assert results(ctx)[0]["status"] == "blocked"
    assert results(ctx)[0]["counts"] is None


def test_missing_implementation_not_zero(ctx):
    layout = kit.task_layout("1")
    (ctx["root"] / layout["implementations"]["a"]).unlink()
    kit.inventory(ctx)
    execution.execute(ctx, args(model=["a"]))
    assert results(ctx)[0]["status"] == "unavailable"
    assert results(ctx)[0]["counts"] is None


def test_native_probes_separate_and_seed_recorded(ctx, tmp_path):
    probe = tmp_path / "test_probe.py"
    probe.write_text(
        '"""Synthetic selected probe, expected ANSWER=42 from authored fixture."""\n'
        "import os\nfrom solution import ANSWER\n"
        "def test_selected():\n    assert ANSWER == 42\n    assert os.environ['PYTHONHASHSEED'] == '123'\n"
    )
    kit.inventory(ctx)
    execution.execute(ctx, args(probe_file=probe, hash_seed=123), probes=True)
    row = results(ctx, probe=True)[0]
    assert row["status"] == "passed"
    assert row["counts"]["collected"] == 1
    assert not (ctx["out"] / "baseline_results.json").exists()
    log = kit.load_json(ctx["out"] / row["log"])
    assert log["probe"]["audit_only"]
    assert log["probe"]["sha256"] == kit.digest(probe)


def test_probe_template_and_selection_required(ctx, tmp_path):
    kit.inventory(ctx)
    with pytest.raises(ValueError, match="explicit"):
        execution.execute(ctx, args(task_id=None), probes=True)
    probe = tmp_path / "probe.py"
    probe.write_text('"""Empty template."""\n')
    with pytest.raises(ValueError, match="no test_"):
        execution.execute(ctx, args(probe_file=probe), probes=True)


def process_alive(pid):
    if os.name == "nt":
        from ctypes import wintypes
        kernel = ctypes.WinDLL("kernel32", use_last_error=True)
        kernel.OpenProcess.argtypes = [wintypes.DWORD, wintypes.BOOL, wintypes.DWORD]
        kernel.OpenProcess.restype = wintypes.HANDLE
        kernel.WaitForSingleObject.argtypes = [wintypes.HANDLE, wintypes.DWORD]
        kernel.WaitForSingleObject.restype = wintypes.DWORD
        kernel.CloseHandle.argtypes = [wintypes.HANDLE]
        handle = kernel.OpenProcess(0x00100000, False, pid)  # SYNCHRONIZE
        if not handle:
            return False
        try:
            return kernel.WaitForSingleObject(handle, 0) == 258
        finally:
            kernel.CloseHandle(handle)
    try:
        os.kill(pid, 0)
        return True
    except ProcessLookupError:
        return False


def test_timeout_kills_trusted_synthetic_child_tree(ctx, tmp_path):
    marker = tmp_path / "descendant.pid"
    test = ctx["root"] / kit.task_layout("1")["tests"] / "test_hidden.py"
    test.write_text(
        "import subprocess, sys, time\nfrom pathlib import Path\n"
        "def test_sleep():\n"
        "    child = subprocess.Popen([sys.executable, '-c', 'import time; time.sleep(60)'])\n"
        f"    Path({str(marker)!r}).write_text(str(child.pid))\n"
        "    time.sleep(60)\n"
    )
    kit.inventory(ctx)
    execution.execute(ctx, args(timeout=3))
    assert results(ctx)[0]["status"] == "timeout"
    assert results(ctx)[0]["counts"] is None
    assert marker.exists(), "Synthetic child not started before timeout"
    pid = int(marker.read_text())
    for _ in range(30):
        if not process_alive(pid):
            break
        time.sleep(0.1)
    assert not process_alive(pid), f"Descendant PID {pid} survived native timeout cleanup"


def test_process_control_setup_failure_does_not_run_tests(ctx, monkeypatch):
    kit.inventory(ctx)
    def reject(process):
        raise OSError("synthetic process control failure")
    monkeypatch.setattr(execution, "ProcessTree", reject)
    execution.execute(ctx, args())
    row = results(ctx)[0]
    assert row["status"] == "setup_error"
    assert not (ctx["out"] / row["log"]).parent.joinpath("pytest.json").exists()


@pytest.mark.parametrize("text", ["[{'a':1}]", "NaN", "[NaN]", "{}"])
def test_invalid_rubric(text):
    assert kit.parse_rubric(text)[1]


def test_no_invented_scoring_formula(ctx):
    kit.inventory(ctx)
    kit.scoring(ctx)
    rows = kit.load_json(ctx["out"] / "scoring_validation.json")["records"]["scores"]
    assert len(rows) == 3
    assert all(row["reconstruction_status"] == "unavailable" for row in rows)


def test_input_root_resolution_and_path_guard(ctx):
    assert input_root(ctx["root"] / "Data") == ctx["root"]
    assert input_root(ctx["root"].parent) == ctx["root"]
    with pytest.raises(ValueError, match="escapes"):
        kit.safe_path(ctx["root"], "../outside")




def test_artifact_checks_parse_without_import(ctx):
    test = ctx["root"] / kit.task_layout("1")["tests"] / "test_hidden.py"
    test.write_text("from missing_helper import value\nraise RuntimeError('Never import for static checks')\n")
    kit.inventory(ctx)
    assert any(row["check"] == "import_resolution" for row in kit.artifacts(ctx))


def test_wrong_module_hash_not_accepted():
    value = dict(exit_code=0, collected=["synthetic"], counts=dict(
        collected=1, passed=1, failed=0, skipped=0, errors=0, xfailed=0, xpassed=0),
        solution=dict(sha256="wrong", matches_selected=False))
    assert execution.classify(value, 0, "expected")[0] == "instrumentation_error"


def test_environment_does_not_forward_secret_variables(tmp_path, monkeypatch):
    monkeypatch.setenv("SYNTHETIC_SECRET_TOKEN", "fixture-not-a-secret")
    env = execution.child_environment(tmp_path, tmp_path, tmp_path / "solution.py", 0)
    assert "SYNTHETIC_SECRET_TOKEN" not in env
    assert env["PYTEST_DISABLE_PLUGIN_AUTOLOAD"] == "1"

