"""Centralized, strict configuration for the single-command audit."""
from __future__ import annotations

from dataclasses import dataclass
import json
from pathlib import Path
from typing import Any


PROJECT = Path(__file__).resolve().parents[1]


@dataclass(frozen=True)
class Config:
    path: Path
    root: Path
    output: Path
    expected_tasks: int | None
    timeout: int
    hash_seed: int
    run_baseline: bool
    probes: list[dict[str, Any]]
    criterion_awards: Path | None
    scoring_rules: Path | None
    report: Path | None

    def legacy(self) -> dict[str, Any]:
        return dict(
            expected_tasks=self.expected_tasks, timeout_seconds=self.timeout,
            probes="unused", high_score_threshold=None,
            criterion_awards=str(self.criterion_awards) if self.criterion_awards else None,
            scoring_rules=str(self.scoring_rules) if self.scoring_rules else None,
        )


def input_root(path: Path) -> Path:
    """Resolve the documented Data/root/immediate-wrapper forms without a broad search."""
    path = path.expanduser().resolve()
    if path.name.casefold() == "data":
        path = path.parent
    if (path / "Data").is_dir() or (path / "EvalTasks.xlsx").is_file():
        return path
    candidates = [child for child in path.iterdir() if child.is_dir()
                  and ((child / "Data").is_dir() or (child / "EvalTasks.xlsx").is_file())] if path.is_dir() else []
    if len(candidates) != 1:
        raise ValueError(f"Expected one assessment under {path}; found {len(candidates)}. Set assessment_root.")
    return candidates[0].resolve()


def discover_root(project: Path) -> Path:
    candidates: set[Path] = set()
    for parent in (project, project.parent):
        if (parent / "Data").is_dir() or (parent / "EvalTasks.xlsx").is_file():
            candidates.add(parent.resolve())
        for wrapper in parent.glob("SpaceXAI_SWE_TakeHome*"):
            if wrapper.is_dir():
                candidates.add(input_root(wrapper))
    if len(candidates) != 1:
        raise ValueError("Cannot uniquely find the assessment beside this project. Set assessment_root in audit-config.json.")
    return candidates.pop()


def load_config(path: Path, root_override: Path | None = None) -> Config:
    path = path.resolve()
    raw = json.loads(path.read_text(encoding="utf-8-sig"))
    if not isinstance(raw, dict):
        raise ValueError("Configuration must be a JSON object.")
    allowed = {"assessment_root", "output_directory", "expected_tasks", "timeout_seconds",
               "hash_seed", "run_baseline", "probes", "criterion_awards", "scoring_rules", "user_report"}
    unknown = set(raw) - allowed
    if unknown:
        raise ValueError(f"Unknown configuration keys: {sorted(unknown)}")

    def relative(value: Any, label: str) -> Path:
        if not isinstance(value, str) or not value.strip():
            raise ValueError(f"{label} must be a nonempty path string.")
        candidate = Path(value).expanduser()
        return (candidate if candidate.is_absolute() else path.parent / candidate).resolve()

    def integer(name: str, default: int, minimum: int, maximum: int) -> int:
        value = raw.get(name, default)
        if type(value) is not int or not minimum <= value <= maximum:
            raise ValueError(f"{name} must be an integer in {minimum}..{maximum}.")
        return value

    selected = root_override or (relative(raw["assessment_root"], "assessment_root")
                                 if raw.get("assessment_root") is not None else None)
    root = input_root(selected) if selected else discover_root(path.parent)
    output = relative(raw.get("output_directory", "outputs"), "output_directory")
    if output == root or output.is_relative_to(root) or root.is_relative_to(output):
        raise ValueError("Outputs and assessment inputs must be separate, non-nested directories.")
    run_baseline = raw.get("run_baseline", True)
    if type(run_baseline) is not bool:
        raise ValueError("run_baseline must be true or false.")
    probes = raw.get("probes", [])
    if not isinstance(probes, list):
        raise ValueError("probes must be an array.")
    normalized = []
    for index, probe in enumerate(probes):
        if not isinstance(probe, dict) or set(probe) != {"task_id", "models", "file", "rationale", "expected"}:
            raise ValueError(f"Probe {index}: required keys are task_id, models, file, rationale, expected.")
        task = probe["task_id"]
        if not isinstance(task, str) or not task.isascii() or not task.isdigit():
            raise ValueError(f"Probe {index}: task_id must be a numeric string.")
        models = probe["models"]
        if not isinstance(models, list) or not models or any(m not in ("reference", "a", "b", "c") for m in models):
            raise ValueError(f"Probe {index}: models must name reference/a/b/c.")
        if any(not isinstance(probe[key], str) or not probe[key].strip() for key in ("rationale", "expected")):
            raise ValueError(f"Probe {index}: rationale and expected behavior must be explicit.")
        file = relative(probe["file"], f"probe {index} file")
        if not file.is_file():
            raise ValueError(f"Probe file absent: {file}")
        normalized.append({**probe, "file": str(file)})
    optional = {name: relative(raw[name], name) if raw.get(name) is not None else None
                for name in ("criterion_awards", "scoring_rules", "user_report")}
    for name in ("criterion_awards", "scoring_rules"):
        if optional[name] is not None and not optional[name].is_file():
            raise ValueError(f"{name} file absent: {optional[name]}")
    expected_tasks = integer("expected_tasks", 1, 1, 100000) if raw.get("expected_tasks") is not None else None
    return Config(
        path, root, output, expected_tasks,
        integer("timeout_seconds", 120, 1, 86400), integer("hash_seed", 0, 0, 4294967295),
        run_baseline, normalized, optional["criterion_awards"], optional["scoring_rules"],
        optional["user_report"],
    )
