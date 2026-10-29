"""Single-process orchestration of reusable assessment audit stages."""
from __future__ import annotations

import argparse
import csv
from datetime import datetime, timezone
import importlib.metadata
import json
import logging
import os
from pathlib import Path
import shutil
import sys
import uuid
from typing import Any, Callable

sys.path.insert(0, str(Path(__file__).resolve().parent))
from config import Config, PROJECT, load_config
from file_io import atomic_write_text, retry_io, write_json


class EventFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        event = dict(
            time=datetime.now(timezone.utc).isoformat(), level=record.levelname,
            message=record.getMessage(),
        )
        if record.exc_info:
            event["traceback"] = self.formatException(record.exc_info)
        return json.dumps(event, ensure_ascii=True)


def configure_logging(output: Path) -> logging.Logger:
    logger = logging.getLogger("audit")
    logger.setLevel(logging.INFO)
    for handler in list(logger.handlers):
        handler.close()
        logger.removeHandler(handler)
    file_handler = logging.FileHandler(output / "logs" / "pipeline.jsonl", encoding="utf-8")
    file_handler.setFormatter(EventFormatter())
    logger.addHandler(file_handler)
    console = logging.StreamHandler()
    console.setFormatter(logging.Formatter("%(levelname)s: %(message)s"))
    logger.addHandler(console)
    logger.propagate = False
    return logger


def publish_latest(output: Path, run: Path) -> list[str]:
    """Keep immutable runs; rotate latest only after a fully written partial/full snapshot."""
    incoming = output / f".latest-incoming-{uuid.uuid4().hex}"
    latest = output / "latest"
    previous = output / f".latest-previous-{uuid.uuid4().hex}"
    def copy_file(source: str, destination: str) -> str:
        return retry_io(lambda: shutil.copy2(source, destination))
    shutil.copytree(run, incoming, copy_function=copy_file)
    moved = False
    try:
        if latest.exists():
            # Preserve reviewer edits before replacing a generated view.
            if (latest / "findings.csv").is_file() and (latest / "results.json").is_file():
                prior = json.loads((latest / "results.json").read_text(encoding="utf-8"))
                old_run = output / "runs" / prior["run_id"]
                if old_run.is_dir():
                    manual = old_run / f"manual-review-{uuid.uuid4().hex}.csv"
                    if (latest / "findings.csv").read_bytes() != (old_run / "findings.csv").read_bytes():
                        retry_io(lambda: shutil.copy2(latest / "findings.csv", manual))
            retry_io(lambda: latest.rename(previous))
            moved = True
        retry_io(lambda: incoming.rename(latest))
    except OSError:
        if moved and not latest.exists():
            retry_io(lambda: previous.rename(latest))
        raise
    if moved:
        try:
            retry_io(lambda: shutil.rmtree(previous))
        except OSError as error:
            return [
                f"latest_cleanup_deferred path={previous}: {error}. "
                "New latest is published; prior runs remain intact. "
                "Any remaining superseded snapshot is retained; no manual deletion is required to rerun."
            ]
    return []


def preflight(config: Config, native_allowed: bool, static_only: bool) -> None:
    if sys.version_info < (3, 10):
        raise ValueError("Python 3.10+ required.")
    for name in ("openpyxl", "pytest"):
        try:
            importlib.metadata.version(name)
        except importlib.metadata.PackageNotFoundError as error:
            raise ValueError(f"{name} missing for {sys.executable}. Run .\\run-audit.ps1 -Setup explicitly.") from error
    for name in ("EvalTasks.xlsx", "README_TakeHomeAssessment.pdf", "ExpertGuidelines.pdf"):
        if not (config.root / name).is_file():
            raise ValueError(f"Required assessment input absent: {config.root / name}")
    if not (config.root / "Data").is_dir():
        raise ValueError(f"Data directory absent: {config.root / 'Data'}")
    if not static_only and (config.run_baseline or config.probes) and not native_allowed:
        raise ValueError("Native execution not authorized. Use run-audit.ps1 confirmation or --allow-native-execution in an appropriate VM.")
    if not static_only and (config.run_baseline or config.probes) and os.name == "nt":
        import ctypes
        if ctypes.windll.shell32.IsUserAnAdmin():
            raise ValueError("Native task execution in an elevated process is prohibited; use a standard-user shell.")
    from checks import source_rows
    rows, issues = source_rows(config.root)
    blockers = [item["message"] for item in issues if item["status"] in ("failure", "blocked")]
    if blockers or not rows:
        raise ValueError("Workbook preflight failed: " + "; ".join(blockers or ["no task rows"]))


def optional_report(path: Path | None) -> list[dict[str, Any]]:
    if path is None:
        return []
    import re
    from checks import observation
    if not path.is_file():
        return [observation("", str(path), "user_report", "blocked", "Configured user report absent; no narrative generated.")]
    text = path.read_text(encoding="utf-8-sig")
    issues = []
    words = len(re.findall(r"\S+", text))
    if words > 2000:
        issues.append(observation("", str(path), "report_word_limit", "failure", f"Report has {words} words; maximum 2000."))
    required = ("Your process", "Issues found", "Recommendations on guidelines, tests, and rubrics",
                "Recommendations on long-term success", "Leading the team")
    headings = {line.lstrip("#").strip().casefold() for line in text.splitlines() if re.match(r"^#{1,6}\s", line)}
    for heading in required:
        if heading.casefold() not in headings:
            issues.append(observation("", str(path), "report_heading", "warning",
                                      f"Expected topic heading not found: {heading}. This is a structural check only."))
    return issues


def write_blocked_outputs(state: dict[str, Any], run: Path, error: str) -> None:
    """Persist useful preflight diagnostics even when third-party imports cannot load."""
    import hashlib
    finding = dict(
        finding_id="F-" + hashlib.sha256(("preflight:" + error).encode()).hexdigest()[:12],
        task_id="", category="audit_preflight", observation_type="blocked", description=error,
        evidence="logs/pipeline.jsonl", verification_status="Pending Manual Review",
        final_severity="", disposition="", comments="",
    )
    state["findings"] = [finding]
    write_json(run / "results.json", {**state, "schema_version": 1})
    with (run / "findings.csv").open("w", newline="", encoding="utf-8-sig") as stream:
        writer = csv.DictWriter(stream, fieldnames=list(finding))
        writer.writeheader()
        writer.writerow(finding)
    atomic_write_text(run / "summary.md",
        "# Assessment audit evidence summary\n\n**Audit execution: blocked**\n\n"
        + error + "\n\nNo supplied code executed. No solution was assigned a numeric result.\n"
        f"Run: {state['run_id']}\n", encoding="utf-8",
    )


def run_pipeline(config: Config, allow_native: bool = False, static_only: bool = False) -> dict[str, Any]:
    run_id = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S") + "-" + uuid.uuid4().hex[:8]
    output = config.output
    output.mkdir(parents=True, exist_ok=True)
    lock = output / ".audit.lock"
    # Exclusive publication ownership avoids concurrent runs replacing each other's latest.
    with lock.open("x", encoding="utf-8") as stream:
        stream.write(json.dumps(dict(pid=os.getpid(), run_id=run_id)))
    run = output / "runs" / run_id
    state: dict[str, Any] = dict(
        run_id=run_id, output=str(run), source_root=str(config.root), config_path=str(config.path),
        status="running", exit_code=3, stages=[], probes=[], integrity_checked=False,
        integrity_observations=[], command=sys.argv, python=sys.version.split()[0],
        configuration=dict(timeout_seconds=config.timeout, hash_seed=config.hash_seed,
                           expected_tasks=config.expected_tasks, run_baseline=config.run_baseline,
                           static_only=static_only),
    )
    try:
        run.mkdir(parents=True)
        details = run / "logs" / "stages"
        details.mkdir(parents=True)
        logger = configure_logging(run)
    except BaseException:
        retry_io(lock.unlink)
        raise
    ctx: dict[str, Any] | None = None
    report_module = None

    def checkpoint() -> None:
        write_json(run / "results.json", state)

    def stage(name: str, action: Callable[[], list[dict[str, Any]]], enabled: bool = True,
              skip_reason: str = "") -> bool:
        record: dict[str, Any] = dict(name=name, status="running", started_utc=datetime.now(timezone.utc).isoformat())
        state["stages"].append(record)
        checkpoint()
        if not enabled:
            record.update(status="skipped", note=skip_reason)
            return False
        logger.info("stage_started name=%s", name)
        try:
            observations = action()
            counts = {value: sum(item["status"] == value for item in observations)
                      for value in ("pass", "failure", "blocked", "warning", "info")}
            if ctx and ctx.get("interrupted"):
                record.update(status="interrupted", error="Interrupted native execution; partial logs preserved.")
            else:
                record["status"] = "blocked" if counts["blocked"] else (
                    "completed_with_observations" if counts["failure"] or counts["warning"] else "completed")
            record["observation_counts"] = counts
            logger.info("stage_finished name=%s status=%s", name, record["status"])
            return record["status"] not in ("interrupted",)
        except KeyboardInterrupt:
            record.update(status="interrupted", error="Interrupted; partial stage evidence retained.")
            logger.warning("stage_interrupted name=%s", name)
            return False
        except Exception as error:
            # Unexpected tool bugs are logged with their traceback, never converted into passing evaluations.
            record.update(status="tool_error", error=f"{type(error).__name__}: {error}")
            logger.exception("stage_tool_error name=%s", name)
            return False
        finally:
            record["finished_utc"] = datetime.now(timezone.utc).isoformat()
            checkpoint()

    try:
        checkpoint()
        try:
            preflight(config, allow_native, static_only)
        except (OSError, ValueError, ImportError) as error:
            state["stages"].append(dict(name="preflight", status="blocked", error=str(error)))
            state.update(status="blocked", exit_code=3)
            logger.error("preflight_blocked %s", error)
            write_blocked_outputs(state, run, str(error))
            return state
        import checks
        import execution
        import report as report_module
        state["stages"].append(dict(name="preflight", status="completed"))
        ctx = dict(root=config.root, out=details, config=config.legacy(),
                   config_dir=config.path.parent, run_id=run_id + "-baseline")
        if not stage("inventory", lambda: checks.inventory(ctx)):
            return state
        state["source_snapshot"] = ctx["snapshot"]
        stage("validate_artifacts", lambda: checks.artifacts(ctx))
        if any(s["status"] == "interrupted" for s in state["stages"]):
            return state
        args = argparse.Namespace(task_id=None, model=None, probe_file=None, timeout=config.timeout,
                                  hash_seed=config.hash_seed, allow_native_execution=allow_native)
        enabled = not static_only and config.run_baseline
        stage("baseline", lambda: execution.execute(ctx, args), enabled=enabled,
              skip_reason="Static-only mode or run_baseline=false; no new baseline executed.")
        if any(s["status"] == "interrupted" for s in state["stages"]):
            return state
        stage("reconcile", lambda: checks.reconcile(ctx),
              enabled=(details / "baseline_results.json").is_file(),
              skip_reason="Baseline evidence unavailable; no numeric comparisons manufactured.")
        stage("scoring", lambda: checks.scoring(ctx))
        if any(s["status"] == "interrupted" for s in state["stages"]):
            return state
        import review_checks
        stage("review_checks", lambda: review_checks.review(ctx, args, execute_examples=enabled))
        if ctx.get("interrupted") or any(s["status"] == "interrupted" for s in state["stages"]):
            return state
        for index, probe in enumerate(config.probes):
            if static_only or ctx.get("execution_halted"):
                break
            entry = {**probe, "sha256": checks.digest(Path(probe["file"])), "runs": []}
            state["probes"].append(entry)
            ctx["run_id"] = f"{run_id}-probe-{index}"
            selected = argparse.Namespace(**{
                **vars(args), "task_id": [probe["task_id"]], "model": probe["models"],
                "probe_file": Path(probe["file"]),
            })
            stage(f"probe_{index}_{probe['task_id']}", lambda: execution.execute(ctx, selected, probes=True))
            if (details / "probe_results.json").is_file():
                entry["runs"] = checks.load_json(details / "probe_results.json")["records"]
            if ctx.get("interrupted"):
                break
        if not config.probes or static_only or ctx.get("execution_halted"):
            stage("targeted_probes", lambda: [], enabled=False,
                  skip_reason="No meaningful probes configured." if not config.probes else "Static-only mode or execution cleanup failure; configured probes not executed.")
        def check_report() -> list[dict[str, Any]]:
            observations = optional_report(config.report)
            checks.save_json(details / "user_report_validation.json", checks.envelope(ctx, observations))
            return observations
        stage("user_report_structure", check_report,
              enabled=config.report is not None, skip_reason="Final assessment narrative is a manual deliverable; no user report configured.")
        return state
    except KeyboardInterrupt:
        state["stages"].append(dict(name="orchestrator", status="interrupted", error="Interrupted outside the current stage."))
        logger.warning("orchestrator_interrupted")
        return state
    except Exception as error:
        state["stages"].append(dict(name="orchestrator", status="tool_error", error=f"{type(error).__name__}: {error}"))
        logger.exception("orchestrator_tool_error")
        return state
    finally:
        try:
            if ctx is not None and (details / "inventory.json").is_file():
                import checks
                try:
                    state["integrity_observations"] = checks.integrity(ctx, checks.read_inventory(ctx))
                    state["integrity_checked"] = True
                    checks.save_json(details / "source_integrity.json",
                                     checks.envelope(ctx, state["integrity_observations"]))
                except Exception as error:
                    logger.exception("source_integrity_check_error")
                    state["stages"].append(dict(name="source_integrity", status="tool_error", error=str(error)))
            if state["status"] != "blocked":
                statuses = {item["status"] for item in state["stages"]}
                if "interrupted" in statuses:
                    state.update(status="interrupted", exit_code=130)
                elif "tool_error" in statuses:
                    state.update(status="tool_error", exit_code=3)
                elif "blocked" in statuses or state["integrity_observations"] or static_only or not config.run_baseline:
                    state.update(status="partial", exit_code=2)
                else:
                    state.update(status="completed", exit_code=0)
                if report_module is not None:
                    try:
                        result = report_module.write_outputs(state, details)
                        if state["exit_code"] == 0 and any(row["observation_type"] != "informational" for row in result["findings"]):
                            state.update(status="completed_with_findings", exit_code=1)
                            report_module.write_outputs(state, details)
                    except Exception as error:
                        state.update(status="tool_error", exit_code=3)
                        state["stages"].append(dict(name="report", status="tool_error", error=str(error)))
                        logger.exception("report_consolidation_error")
                        checkpoint()
                        atomic_write_text(run / "summary.md",
                            "# Assessment audit evidence summary\n\n**Audit execution: tool_error**\n\n"
                            "Consolidation failed: " + str(error) + "\n"
                            "Raw diagnostic evidence remains in logs/stages; findings are incomplete.\n",
                            encoding="utf-8",
                        )
                        (run / "findings.csv").write_text(
                            "finding_id,task_id,category,description,verification_status,final_severity,disposition,comments\n",
                            encoding="utf-8-sig",
                        )
            if not (run / "summary.md").is_file():
                checkpoint()
                atomic_write_text(run / "summary.md",
                    "# Assessment audit evidence summary\n\nAudit tool failed before consolidation. "
                    "Inspect results.json and logs/pipeline.jsonl. No automated conclusions.\n", encoding="utf-8")
            logger.info("audit_finished status=%s exit_code=%s run=%s", state["status"], state["exit_code"], run_id)
            # Close files before copying on Windows, so latest is a finished snapshot.
            for handler in list(logger.handlers):
                handler.flush()
                handler.close()
                logger.removeHandler(handler)
            warnings = publish_latest(output, run)
            if warnings:
                logger = configure_logging(run)
                try:
                    for warning in warnings:
                        logger.warning("%s", warning)
                finally:
                    for handler in list(logger.handlers):
                        handler.close()
                        logger.removeHandler(handler)
            print(f"Audit: {state['status']} (exit {state['exit_code']})\n"
                  f"Run: {run}\nSummary: {output / 'latest' / 'summary.md'}\n"
                  f"Findings: {output / 'latest' / 'findings.csv'}", flush=True)
        finally:
            retry_io(lock.unlink)


def refresh_report(config: Config) -> dict[str, Any]:
    """Rebuild a new report snapshot from immutable recorded evidence, without execution."""
    import report
    output = config.output
    latest = output / "latest"
    if not (latest / "logs" / "stages" / "inventory.json").is_file():
        raise ValueError("Report-only refresh requires an existing inventoried run in outputs/latest; run the audit first.")
    run_id = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S") + "-report-" + uuid.uuid4().hex[:8]
    lock = output / ".audit.lock"
    with lock.open("x", encoding="utf-8") as stream:
        stream.write(json.dumps(dict(pid=os.getpid(), run_id=run_id)))
    run = output / "runs" / run_id
    logger = None
    try:
        original = json.loads((latest / "results.json").read_text(encoding="utf-8"))
        run.mkdir(parents=True)
        shutil.copytree(latest / "logs", run / "logs",
                        copy_function=lambda source, target: retry_io(lambda: shutil.copy2(source, target)))
        logger = configure_logging(run)
        prior = original.get("report_generation", {})
        state = {
            **original, "run_id": run_id, "output": str(run), "command": sys.argv,
            "stages": [stage for stage in original["stages"] if stage["name"] != "report_refresh"] + [
                dict(name="report_refresh", status="completed", note="Reused recorded evidence; no task code executed.")],
            "report_generation": {
                "source_report_run_id": original["run_id"],
                "evidence_run_id": prior.get("evidence_run_id", original["run_id"]),
                "evidence_command": prior.get("evidence_command", original.get("command")),
                "report_python": sys.version.split()[0], "new_baseline_executed": False,
            },
        }
        logger.info("report_refresh source=%s evidence=%s", original["run_id"], state["report_generation"]["evidence_run_id"])
        result = report.write_outputs(state, run / "logs" / "stages")
        if state["exit_code"] in (0, 1):
            state.update(status="completed_with_findings" if result["findings"] else "completed",
                         exit_code=1 if result["findings"] else 0)
            result = report.write_outputs(state, run / "logs" / "stages")
        for handler in list(logger.handlers):
            handler.close()
            logger.removeHandler(handler)
        warnings = publish_latest(output, run)
        if warnings:
            logger = configure_logging(run)
            for warning in warnings:
                logger.warning("%s", warning)
        print(f"Evidence-only report refresh: {run_id}\n"
              f"Evidence run: {state['report_generation']['evidence_run_id']} (no new baseline)\n"
              f"Audit: {result['status']} (exit {result['exit_code']})\n"
              f"Summary: {latest / 'summary.md'}\nFindings: {latest / 'findings.csv'}", flush=True)
        return result
    except Exception:
        if logger is not None:
            logger.exception("report_refresh_failed previous_latest_preserved_when_publication_not_completed")
        raise
    finally:
        if logger is not None:
            for handler in list(logger.handlers):
                handler.close()
                logger.removeHandler(handler)
        retry_io(lock.unlink)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", type=Path, default=PROJECT / "audit-config.json")
    parser.add_argument("--root", type=Path)
    parser.add_argument("--allow-native-execution", action="store_true")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--static-only", action="store_true")
    mode.add_argument("--report-only", action="store_true")
    args = parser.parse_args()
    try:
        config = load_config(args.config, args.root)
        result = refresh_report(config) if args.report_only else run_pipeline(config, args.allow_native_execution, args.static_only)
        return result["exit_code"]
    except KeyboardInterrupt:
        print("Audit interrupted. Inspect the preserved run before restarting.", file=sys.stderr)
        return 130
    except Exception as error:
        # Configuration errors can occur before a configured output directory is known.
        if not (PROJECT / "outputs" / ".audit.lock").exists():
            diagnostic = PROJECT / "outputs" / "runs" / (
                datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S") + "-preflight-" + uuid.uuid4().hex[:8])
            diagnostic.mkdir(parents=True)
            (diagnostic / "logs").mkdir()
            logger = configure_logging(diagnostic)
            logger.exception("audit_tool_error")
            failure = dict(run_id=diagnostic.name, status="blocked", exit_code=3, stages=[
                dict(name="configuration_or_publication", status="tool_error", error=str(error))])
            write_blocked_outputs(failure, diagnostic, str(error))
            for handler in list(logger.handlers):
                handler.close()
                logger.removeHandler(handler)
            print(f"Preflight diagnostics: {diagnostic}", file=sys.stderr)
        print(f"Audit-tool/preflight error: {error}\nNo successful audit is claimed.", file=sys.stderr)
        return 3


if __name__ == "__main__":
    raise SystemExit(main())
