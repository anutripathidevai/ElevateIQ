"""Evidence-only pytest plugin loaded in each native evaluation process."""

from collections import Counter
import hashlib
import json
import os
from pathlib import Path
import sys


DATA = dict(collected=[], collection_errors=[], phases=[], solution=None)


def pytest_collection_finish(session):
    DATA["collected"] = [item.nodeid for item in session.items]


def pytest_collectreport(report):
    if report.failed:
        DATA["collection_errors"].append(dict(nodeid=report.nodeid, error=str(report.longrepr)))


def pytest_runtest_logreport(report):
    DATA["phases"].append(dict(
        nodeid=report.nodeid, when=report.when, outcome=report.outcome,
        duration=report.duration, wasxfail=getattr(report, "wasxfail", None),
        detail=str(report.longrepr) if report.longrepr else "",
        captured=list(report.sections),
    ))


def pytest_sessionfinish(session, exitstatus):
    module = sys.modules.get("solution")
    location = getattr(module, "__file__", None)
    if location:
        path = Path(location).resolve()
        DATA["solution"] = dict(path=str(path), sha256=hashlib.sha256(path.read_bytes()).hexdigest(),
                                matches_selected=path == Path(os.environ["AUDIT_SELECTED"]).resolve())
    phases = {}
    for phase in DATA["phases"]:
        phases.setdefault(phase["nodeid"], []).append(phase)
    counts = Counter(collected=len(DATA["collected"]), passed=0, failed=0, skipped=0, errors=0, xfailed=0, xpassed=0)
    for nodeid, reports in phases.items():
        if any(report["outcome"] == "failed" and report["when"] != "call" for report in reports):
            counts["errors"] += 1
        elif any(report["outcome"] == "failed" for report in reports):
            counts["failed"] += 1
        elif any(report["outcome"] == "skipped" for report in reports):
            counts["xfailed" if any(report["wasxfail"] for report in reports) else "skipped"] += 1
        elif any(report["when"] == "call" and report["outcome"] == "passed" for report in reports):
            counts["xpassed" if any(report["wasxfail"] for report in reports) else "passed"] += 1
    DATA["counts"] = dict(counts)
    DATA["exit_code"] = int(exitstatus)
    Path(os.environ["AUDIT_REPORT"]).write_text(json.dumps(DATA), encoding="utf-8")
