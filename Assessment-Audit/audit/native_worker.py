"""Trusted child bootstrap. Wait for parent lifecycle controls before importing tests."""

import argparse
import importlib.metadata
import json
import os
from pathlib import Path
import platform
import sys


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--implementation", required=True, type=Path)
    parser.add_argument("--suite", required=True, type=Path)
    parser.add_argument("--work", required=True, type=Path)
    parser.add_argument("--temp", required=True, type=Path)
    parser.add_argument("--environment-report", required=True, type=Path)
    args = parser.parse_args()
    # The parent attaches a kill-on-close Windows Job before releasing this gate.
    if sys.stdin.readline().strip() != "RUN":
        raise SystemExit("Parent did not authorize execution.")
    os.chdir(args.work)
    sys.path[:0] = [str(args.implementation.parent), str(Path(__file__).parent), str(args.work)]
    import pytest

    args.environment_report.write_text(json.dumps(dict(
        python=platform.python_version(), executable=sys.executable,
        pytest=importlib.metadata.version("pytest"), platform=platform.platform(),
        cwd=str(Path.cwd()), hash_seed=os.environ.get("PYTHONHASHSEED"),
        selected_implementation=str(args.implementation),
        isolation="native process, NOT a filesystem or network sandbox",
    ), indent=2), encoding="utf-8")
    raise SystemExit(pytest.main([
        "-q", "-p", "no:cacheprovider", "-p", "pytest_capture",
        "--basetemp", str(args.temp), str(args.suite),
    ]))


if __name__ == "__main__":
    main()
