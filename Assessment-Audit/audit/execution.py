"""Native baseline/probe runner. Not a security sandbox; explicit opt-in required."""

from __future__ import annotations

import ast
import importlib.metadata
import json
import logging
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import time

from checks import (
    MODELS, digest, envelope, integrity, is_generated_cache, observation,
    read_inventory, safe_path, save_json,
)
from process_control import ProcessTree


def classify(report, exit_code, expected_hash):
    if not isinstance(report, dict):
        return "instrumentation_error", "Missing structured pytest report; counts unavailable."
    if report.get("collection_errors"):
        return "collection_failed", "pytest collection reported errors; no score assigned."
    if exit_code not in (0, 1):
        return "setup_error", f"pytest exit code {exit_code}; no score assigned."
    if report.get("exit_code") != exit_code:
        return "instrumentation_error", "Child exit code and report exit code disagree."
    counts = report.get("counts")
    names = ("collected", "passed", "failed", "skipped", "errors", "xfailed", "xpassed")
    if not isinstance(counts, dict) or any(type(counts.get(key)) is not int or counts[key] < 0 for key in names):
        return "instrumentation_error", "Invalid or missing pytest counts."
    if not isinstance(report.get("collected"), list) or counts["collected"] != len(report["collected"]):
        return "instrumentation_error", "Collected count and node IDs disagree."
    if sum(counts[name] for name in names[1:]) != counts["collected"]:
        return "instrumentation_error", "Terminal outcomes do not cover all collected items."
    identity = report.get("solution")
    if not isinstance(identity, dict) or identity.get("sha256") != expected_hash or not identity.get("matches_selected"):
        return "instrumentation_error", "Loaded solution identity does not match the selected implementation."
    if counts["errors"]:
        return "setup_error", "Test setup or teardown errors recorded."
    return ("passed", "") if exit_code == 0 else ("test_failed", "pytest reported test failures.")


def stage_source(ctx, inv, target):
    for entry in inv["manifest"]:
        if not entry["path"].startswith("Data/") or is_generated_cache(entry["path"]):
            continue
        destination = safe_path(target, entry["path"])
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(safe_path(ctx["root"], entry["path"]), destination)
        if digest(destination) != entry["sha256"]:
            raise ValueError(f"Disposable copy hash differs from original manifest: {entry['path']}")


def child_environment(snapshot, log_dir, selected, seed):
    # Reduce accidental credential inheritance. Same-account code can still read host files.
    keep = ("SYSTEMROOT", "WINDIR", "COMSPEC", "PATH", "PATHEXT",
            "LANG", "LC_ALL", "VIRTUAL_ENV")
    environment = {key: os.environ[key] for key in keep if key in os.environ}
    environment.update(
        HOME=str(snapshot), USERPROFILE=str(snapshot), TEMP=str(snapshot / "temp"),
        TMP=str(snapshot / "temp"), TMPDIR=str(snapshot / "temp"),
        PYTEST_DISABLE_PLUGIN_AUTOLOAD="1", PYTHONDONTWRITEBYTECODE="1",
        PYTHONHASHSEED=str(seed), PYTHONIOENCODING="utf-8", PYTHONUTF8="1",
        AUDIT_SELECTED=str(selected), AUDIT_REPORT=str(log_dir / "pytest.json"),
    )
    return environment


def run_process(command, cwd, environment, log_dir, timeout):
    process, tree = None, None
    status, reason = None, ""
    started = time.monotonic()
    with (log_dir / "stdout.log").open("wb") as stdout, (log_dir / "stderr.log").open("wb") as stderr:
        try:
            process = subprocess.Popen(
                command, cwd=cwd, env=environment, stdin=subprocess.PIPE, stdout=stdout, stderr=stderr,
                start_new_session=os.name == "posix",
            )
            # Bootstrap is waiting on stdin; no task imports occur before this succeeds.
            tree = ProcessTree(process)
            process.stdin.write(b"RUN\n")
            process.stdin.flush()
            process.stdin.close()
            process.wait(timeout=timeout)
        except subprocess.TimeoutExpired:
            status, reason = "timeout", f"Exceeded {timeout}s; no comparable score assigned."
        except KeyboardInterrupt:
            status, reason = "interrupted", "Execution interrupted; process tree closed and partial evidence preserved."
        except (OSError, ValueError) as error:
            status, reason = "setup_error", f"Native process setup failed: {error}"
        finally:
            try:
                if tree:
                    tree.close()
                elif process and process.poll() is None:
                    process.kill()  # Bootstrap gate was never released.
                if process:
                    process.wait(timeout=10)
            except (OSError, subprocess.TimeoutExpired) as error:
                status, reason = "cleanup_error", f"Process-tree cleanup incomplete: {error}"
    return dict(status=status, reason=reason, exit_code=process.returncode if process else None,
                duration_seconds=round(time.monotonic() - started, 3))


def execute(ctx, args, probes=False):
    if not args.allow_native_execution:
        raise ValueError("--allow-native-execution required; native execution is not a sandbox.")
    inv = read_inventory(ctx)
    tasks = inv["tasks"]
    selected_ids = set(args.task_id or [])
    if selected_ids - {task["task_id"] for task in tasks}:
        raise ValueError(f"Unknown task IDs: {sorted(selected_ids)}")
    if probes and (not args.task_id or not args.model):
        raise ValueError("Probes require explicit --task-id and --model.")
    if selected_ids:
        tasks = [task for task in tasks if task["task_id"] in selected_ids]
    models = list(dict.fromkeys(args.model or MODELS))
    filename = "probe_results" if probes else "baseline_results"
    if not probes and (ctx["out"] / (filename + ".json")).exists():
        raise ValueError("Baseline already exists. Choose a new output snapshot and inventory first.")
    probe_file = args.probe_file
    if probes:
        if probe_file is None:
            raise ValueError("A task-specific probe file must be explicitly configured.")
        tree = ast.parse(probe_file.read_bytes(), filename=str(probe_file))
        if not any(isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and node.name.startswith("test_")
                   for node in ast.walk(tree)):
            raise ValueError("Probe template contains no test_ functions; supply your contract-based probes.")
    issues = integrity(ctx, inv)
    blocked_reason = "Source differs from inventory snapshot; no supplied code executed." if issues else ""
    try:
        importlib.metadata.version("pytest")
    except importlib.metadata.PackageNotFoundError:
        blocked_reason = "pytest is not installed for the Python executable running this command."
    timeout = args.timeout or ctx["config"]["timeout_seconds"]
    if type(timeout) is not int or timeout < 1:
        raise ValueError("timeout_seconds must be a positive integer.")
    run_directory = ctx["out"] / ("experiments" if probes else "executions") / ctx["run_id"]
    run_directory.mkdir(parents=True)
    results = []

    def persist():
        value = envelope(ctx, results)
        save_json(ctx["out"] / f"{filename}.json", value)

    logging.getLogger("audit").warning(
        "Same-account execution. No filesystem/network sandbox or hard resource limits.")
    for task in tasks:
        if ctx.get("interrupted"):
            break
        for model in models:
            layout, task_id = task["layout"], task["task_id"]
            implementation = layout["implementations"][model]
            source = safe_path(ctx["root"], implementation)
            tests = safe_path(ctx["root"], layout["tests"])
            log_dir = run_directory / f"{task_id}_{model}"
            log_dir.mkdir()
            log_path = log_dir / "run.json"
            result = dict(task_id=task_id, model=model, kind="probe" if probes else "baseline",
                          status="blocked", reason=blocked_reason, implementation=implementation,
                          implementation_sha256=None, suite=layout["tests"],
                          exit_code=None, counts=None, duration_seconds=None,
                          hash_seed=args.hash_seed, log=log_path.relative_to(ctx["out"]).as_posix())
            payload = dict(result=result, command=None, backend="native",
                           isolation="Not a security sandbox", stdout=None, stderr=None)
            if probes:
                payload["probe"] = dict(path=str(probe_file), sha256=digest(probe_file),
                                        source=probe_file.read_text(encoding="utf-8-sig"), audit_only=True)
            if not source.is_file() or not tests.is_dir():
                result.update(status="unavailable", reason="Selected implementation or delivered test directory absent.")
            elif not blocked_reason:
                try:
                    result["implementation_sha256"] = digest(source)
                    with tempfile.TemporaryDirectory(prefix="spacexai-native-") as directory:
                        snapshot = Path(directory)
                        stage_source(ctx, inv, snapshot)
                        (snapshot / "temp").mkdir()
                        suite = snapshot / layout["tests"]
                        if probes:
                            suite = snapshot / "experiments" / task_id
                            suite.mkdir(parents=True)
                            shutil.copyfile(probe_file, suite / "test_audit_probe.py")
                        selected = snapshot / implementation
                        # Do not use -I: it disables PYTHONHASHSEED. Explicit script path
                        # and sanitized environment avoid cwd/PYTHONPATH bootstrap imports.
                        command = [
                            sys.executable, "-B", str(Path(__file__).with_name("native_worker.py").resolve()),
                            "--implementation", str(selected), "--suite", str(suite),
                            "--work", str(snapshot / "Data"), "--temp", str(snapshot / "temp" / "pytest"),
                            "--environment-report", str(log_dir / "environment.json"),
                        ]
                        payload.update(command=command, cwd=str(snapshot / "Data"))
                        environment = child_environment(snapshot, log_dir, selected, args.hash_seed)
                        state = run_process(command, snapshot / "Data", environment, log_dir, timeout)
                        result.update(exit_code=state["exit_code"], duration_seconds=state["duration_seconds"])
                        if state["status"]:
                            result.update(status=state["status"], reason=state["reason"])
                        else:
                            report = None
                            report_path = log_dir / "pytest.json"
                            if report_path.is_file():
                                if report_path.stat().st_size > 16 * 1024 * 1024:
                                    raise ValueError("Structured pytest report exceeds 16 MiB.")
                                report = json.loads(report_path.read_text(encoding="utf-8"))
                            status, reason = classify(report, state["exit_code"], result["implementation_sha256"])
                            result.update(status=status, reason=reason,
                                          counts=report.get("counts") if isinstance(report, dict) else None)
                        payload.update(stdout=(log_dir / "stdout.log").relative_to(ctx["out"]).as_posix(),
                                       stderr=(log_dir / "stderr.log").relative_to(ctx["out"]).as_posix(),
                                       pytest_report=(log_dir / "pytest.json").relative_to(ctx["out"]).as_posix())
                except (OSError, ValueError) as error:
                    result.update(status="setup_error", reason=str(error))
                if result["status"] == "cleanup_error":
                    ctx["execution_halted"] = True
                    blocked_reason = "Further execution stopped after process cleanup failed."
            save_json(log_path, payload)
            results.append(result)
            persist()
            logging.getLogger("audit").info(
                "evaluation task=%s model=%s kind=%s status=%s",
                task_id, model, result["kind"], result["status"])
            if result["status"] == "interrupted":
                ctx["interrupted"] = True
                break
            if result["status"] != "passed":
                severity = "failure" if result["status"] == "test_failed" else "blocked"
                issues.append(observation(task_id, result["log"], result["kind"], severity, result["reason"] or result["status"]))
    post_checks = integrity(ctx, inv)
    issues.extend(post_checks)
    save_json(run_directory / "post_run_integrity.json", envelope(ctx, post_checks))
    persist()
    if ctx.get("interrupted"):
        raise KeyboardInterrupt
    return issues
