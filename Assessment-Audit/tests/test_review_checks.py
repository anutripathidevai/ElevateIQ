import ast
import json
from pathlib import Path
import shutil
import sys

import openpyxl
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "audit"))
import checks
from config import load_config
import execution
import main as pipeline
import review_checks as review


def source_fixture(tmp_path, task_id="987654"):
    root = tmp_path / "source"
    layout = checks.task_layout(task_id)
    paths = [layout["prompt"], layout["tests"] + "/test_hidden.py", *layout["implementations"].values()]
    for relative in paths:
        path = root / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text("", encoding="utf-8")
    task = dict(task_id=task_id, layout=layout, workbook_rows=[])
    return root, task


def write(root, relative, text):
    (root / relative).write_text(text, encoding="utf-8")


def scan(root, task):
    manifest, errors = checks.files_in(root)
    assert not errors
    return review.scan_task(root, task, {entry["path"]: entry for entry in manifest})


def rules(value):
    return {entry["rule"] for entry in value["signals"]}


def test_literal_examples_missing_none_are_source_concerns_for_unseen_id(tmp_path):
    root, task = source_fixture(tmp_path)
    layout = task["layout"]
    write(root, layout["implementations"]["reference"], "def smooth(values, window=2): return values\n")
    write(root, layout["prompt"], "smooth([1, 2], 2) # [1.5]\nsmooth([1, None], 2) # [None]\n")
    write(root, layout["tests"] + "/test_hidden.py",
          "from solution import smooth as fn\ndef test_first(): assert fn([1, 2]) == [1.5]\n")
    result = scan(root, task)
    assert result["task_id"] == "987654"
    assert [example["baseline_input_match"] for example in result["examples"]] == [True, False]
    assert "prompt_examples" in rules(result)
    assert "example_only_tests" in rules(result)
    assert all(item["check_result"] == "not_executed" for item in result["signals"])
    assert result["source_files"]


def test_doctest_strings_with_hash_and_malicious_expressions_are_not_evaluated(tmp_path):
    definition = review.functions(ast.parse("def slug(title): return title"))
    marker = tmp_path / "MUST_NOT_EXIST"
    prompt = (
        '>>> slug("C#")\n"c"\n'
        f'slug(__import__("pathlib").Path({str(marker)!r}).touch()) # "x"\n'
        f'slug("x") # __import__("pathlib").Path({str(marker)!r}).touch()\n'
        'slug("A#B") # "a-b"\n'
    )
    examples = review.prompt_examples(prompt, definition)
    assert len(examples) == 2
    assert examples[0]["expected"] == "'c'"
    assert not marker.exists()
    generated = review.probe_source(examples)
    ast.parse(generated)
    assert "__import__" not in generated


def test_lookup_signal_requires_example_overlap_and_is_not_a_proven_defect(tmp_path):
    root, task = source_fixture(tmp_path)
    layout = task["layout"]
    definition = "def slug(title, maximum=50): return title\n"
    write(root, layout["implementations"]["reference"], definition)
    write(root, layout["implementations"]["a"], "_KNOWN = {('Hello!', 50): 'hello', ('Bye!', 50): 'bye'}\n" + definition)
    write(root, layout["implementations"]["b"], "_OTHER = {'x': 1, 'y': 2}\n" + definition)
    write(root, layout["prompt"], 'slug("Hello!") # "hello"\nslug("Bye!") # "bye"\n')
    result = scan(root, task)
    signals = [item for item in result["signals"] if item["rule"] == "example_lookup"]
    assert len(signals) == 1 and signals[0]["model"] == "a"
    assert signals[0]["evidence_basis"] == "source_inspection"


def test_dynamic_tests_do_not_get_called_example_only(tmp_path):
    root, task = source_fixture(tmp_path)
    layout = task["layout"]
    write(root, layout["implementations"]["reference"], "def f(x): return x")
    write(root, layout["prompt"], "f(None) # None\n")
    write(root, layout["tests"] + "/test_hidden.py",
          "from solution import f\ndef test_case():\n    value = None\n    assert f(value) is None\n")
    result = scan(root, task)
    assert "example_only_tests" not in rules(result)
    assert result["checks"][0]["unresolved_test_calls"] == 1
    assert "prompt_examples" not in rules(result)


def test_order_contract_and_unordered_expected_value_are_separate_screens(tmp_path):
    root, task = source_fixture(tmp_path)
    layout = task["layout"]
    write(root, layout["prompt"], "The order of paths does not matter.")
    write(root, layout["tests"] + "/test_hidden.py",
          "def test_order(): assert actual == [['a', 'b']]\n"
          "def test_set():\n    expected = {'x', 'y'}\n    assert actual == list(expected)\n")
    result = scan(root, task)
    assert {"ordering_contract", "unordered_oracle"} <= rules(result)
    assert not result["examples"]


def test_regex_checks_accept_constant_fstrings_and_do_not_execute_grammar(tmp_path):
    root, task = source_fixture(tmp_path)
    layout = task["layout"]
    write(root, layout["prompt"], "Only ASCII digits are allowed; separators may contain spaces or tabs.")
    write(root, layout["implementations"]["reference"],
          "import re\n_DIGIT = r'\\d+'\n_PATTERN = re.compile(rf'^\\s*{_DIGIT}\\s*$')\n"
          "def parse(s): return _PATTERN.match(s)\n")
    result = scan(root, task)
    assert {"parser_matching", "ascii_digits", "whitespace_contract"} <= rules(result)
    assert review.static_string(ast.parse('f"{unknown()}"', mode="eval").body, {}) is None


def test_explicit_boundaries_and_fullmatch_do_not_trigger_corresponding_screens(tmp_path):
    root, task = source_fixture(tmp_path)
    layout = task["layout"]
    write(root, layout["prompt"], "Select between start and end inclusive; only ASCII digits.")
    write(root, layout["implementations"]["reference"],
          "import re\n_PATTERN = re.compile(r'^[0-9]+$')\ndef f(s): return _PATTERN.fullmatch(s)\n")
    write(root, layout["tests"] + "/test_hidden.py", "def test_start_equals_end(): pass\n")
    assert not {"endpoint_contract", "parser_matching", "ascii_digits"} & rules(scan(root, task))


def test_ascii_regex_flag_and_unrelated_match_are_respected(tmp_path):
    root, task = source_fixture(tmp_path)
    layout = task["layout"]
    write(root, layout["prompt"], "ASCII digits only.")
    write(root, layout["implementations"]["reference"],
          "import re\n_PATTERN = re.compile(r'\\d+', re.ASCII | re.IGNORECASE)\n"
          "def f(s):\n    unrelated.match(s)\n    return _PATTERN.fullmatch(s)\n")
    assert not {"ascii_digits", "parser_matching"} & rules(scan(root, task))


def test_source_change_after_manifest_blocks_review(tmp_path):
    root, task = source_fixture(tmp_path)
    manifest, _ = checks.files_in(root)
    write(root, task["layout"]["prompt"], "Changed")
    with pytest.raises(ValueError, match="changed since inventory"):
        review.scan_task(root, task, {entry["path"]: entry for entry in manifest})


def configure_examples(fixture):
    layout = fixture.layout
    code = "def moving(values, window=2):\n    return [None] if None in values else [sum(values) / len(values)]\n"
    for model, relative in layout["implementations"].items():
        write(fixture.root, relative, code if model != "b" else
              "def moving(values, window=2): return [sum(values) / len(values)]\n")
    write(fixture.root, layout["prompt"], "moving([1, 2], 2) # [1.5]\nmoving([1, None], 2) # [None]\n")
    write(fixture.root, layout["tests"] + "/test_hidden.py",
          "from solution import moving\ndef test_public(): assert moving([1, 2]) == [1.5]\n")


from test_pipeline import fixture  # Reuse trusted synthetic workbook/runner fixture.


def test_full_pipeline_replays_examples_without_replacing_baseline(fixture):
    configure_examples(fixture)
    before = checks.files_in(fixture.root)[0]
    state = pipeline.run_pipeline(fixture.config, allow_native=True)
    latest = fixture.config.output / "latest"
    value = checks.load_json(latest / "results.json")
    assert state["exit_code"] == 1
    assert len(value["baseline"]) == 4 and all(run["status"] == "passed" for run in value["baseline"])
    task = value["review_checks"]["tasks"][0]
    assert len(task["executions"]) == 4
    assert {run["model"] for run in task["executions"] if run["status"] == "test_failed"} == {"b"}
    finding = next(item for item in value["findings"] if item["category"] == "review_prompt_examples")
    assert finding["check_result"] == "reproduced"
    assert finding["model"] == "b" and finding["verification_status"] == "Pending Manual Review"
    assert checks.files_in(fixture.root)[0] == before
    for item in value["findings"]:
        for path in item["evidence"]:
            assert (latest / path).is_file()
    assert "source_inspection;executed_prompt_examples" in (latest / "findings.csv").read_text(encoding="utf-8-sig")
    assert "Generic review-check coverage" in (latest / "summary.md").read_text()


def test_static_only_never_executes_generated_examples(fixture, monkeypatch):
    configure_examples(fixture)
    monkeypatch.setattr(execution, "execute", lambda *a, **k: pytest.fail("No source execution in static mode"))
    state = pipeline.run_pipeline(fixture.config, static_only=True)
    value = checks.load_json(fixture.config.output / "latest" / "results.json")
    assert state["exit_code"] == 2
    task = value["review_checks"]["tasks"][0]
    assert task["examples"] and not task["executions"]
    assert task["experiment_status"] == "not_executed"
    assert all(item["check_result"] == "not_executed" for item in value["findings"]
               if item["category"].startswith("review_"))


@pytest.mark.parametrize("configured", [None, "omitted", 1])
def test_task_count_is_discovered_unless_explicitly_configured(fixture, configured):
    if configured == "omitted":
        fixture.raw.pop("expected_tasks")
    else:
        fixture.raw["expected_tasks"] = configured
    fixture.path.write_text(json.dumps(fixture.raw))
    config = load_config(fixture.path)
    assert config.expected_tasks == (1 if configured == 1 else None)
    state = pipeline.run_pipeline(config, static_only=True)
    assert state["exit_code"] == 2
    value = checks.load_json(config.output / "latest" / "results.json")
    assert len(value["inventory"]["tasks"]) == 1
    assert not any(item["category"] == "expected_count" for item in value["observations"])


def test_report_refresh_retains_review_evidence_without_rescanning(fixture, monkeypatch):
    configure_examples(fixture)
    pipeline.run_pipeline(fixture.config, static_only=True)
    old = checks.load_json(fixture.config.output / "latest" / "results.json")
    monkeypatch.setattr(review, "review", lambda *a, **k: pytest.fail("Report refresh must not scan sources"))
    monkeypatch.setattr(execution, "execute", lambda *a, **k: pytest.fail("Report refresh must not execute"))
    pipeline.refresh_report(fixture.config)
    refreshed = checks.load_json(fixture.config.output / "latest" / "results.json")
    assert refreshed["review_checks"] == old["review_checks"]


def test_interrupted_generated_replay_keeps_partial_records_and_exit_130(fixture, monkeypatch):
    configure_examples(fixture)
    original = execution.run_process
    calls = []

    def interrupt_probe(command, cwd, environment, log_dir, timeout):
        calls.append(log_dir)
        if "experiments" in log_dir.parts:
            return dict(status="interrupted", reason="Synthetic interruption", exit_code=None, duration_seconds=0)
        return original(command, cwd, environment, log_dir, timeout)

    monkeypatch.setattr(execution, "run_process", interrupt_probe)
    state = pipeline.run_pipeline(fixture.config, allow_native=True)
    value = checks.load_json(fixture.config.output / "latest" / "results.json")
    assert state["exit_code"] == 130
    task = value["review_checks"]["tasks"][0]
    assert task["executions"][0]["status"] == "interrupted"
    assert task["experiment_status"] == "interrupted"
    assert len(calls) == 5


def test_cleanup_failure_prevents_later_generated_execution(fixture, monkeypatch):
    configure_examples(fixture)
    calls = []

    def failure(command, cwd, environment, log_dir, timeout):
        calls.append(log_dir)
        return dict(status="cleanup_error", reason="Synthetic cleanup failure", exit_code=None, duration_seconds=0)

    monkeypatch.setattr(execution, "run_process", failure)
    state = pipeline.run_pipeline(fixture.config, allow_native=True)
    value = checks.load_json(fixture.config.output / "latest" / "results.json")
    assert state["exit_code"] == 2
    assert len(calls) == 1
    assert value["review_checks"]["tasks"][0]["experiment_status"] == "not_executed"


def test_ordinary_model_failure_remains_measurement_even_on_example_replay(fixture):
    configure_examples(fixture)
    write(fixture.root, fixture.layout["tests"] + "/test_hidden.py",
          "from solution import moving\n"
          "def test_first(): assert moving([1, 2]) == [1.5]\n"
          "def test_missing(): assert moving([1, None]) == [None]\n")
    pipeline.run_pipeline(fixture.config, allow_native=True)
    value = checks.load_json(fixture.config.output / "latest" / "results.json")
    assert any(run["model"] == "b" and run["status"] == "test_failed" for run in value["baseline"])
    assert not any(item["category"] == "review_prompt_examples" for item in value["findings"])
    assert any(run["model"] == "b" and run["status"] == "test_failed"
               for run in value["review_checks"]["tasks"][0]["executions"])


def test_new_tasks_are_discovered_without_adding_rules_or_notes(fixture):
    configure_examples(fixture)
    for group in ("Task", "ExpertSolution", "ModelOutputs"):
        shutil.copytree(fixture.root / "Data" / f"{group}_123", fixture.root / "Data" / f"{group}_7654321")
    book = openpyxl.load_workbook(fixture.root / "EvalTasks.xlsx")
    row = [cell.value for cell in book.active[2]]
    row[0] = "7654321"
    book.active.append(row)
    book.save(fixture.root / "EvalTasks.xlsx")
    book.close()
    fixture.raw["expected_tasks"] = None
    fixture.path.write_text(json.dumps(fixture.raw))
    pipeline.run_pipeline(load_config(fixture.path), static_only=True)
    value = checks.load_json(fixture.config.output / "latest" / "results.json")
    assert {task["task_id"] for task in value["review_checks"]["tasks"]} == {"123", "7654321"}
    assert all(task["examples"] for task in value["review_checks"]["tasks"])
    assert not any(item["category"] == "expected_count" for item in value["observations"])


def test_arbitrary_order_prompt_does_not_get_an_invented_exact_order_oracle(fixture, monkeypatch):
    code = "def paths(values): return list(reversed(values))\n"
    for relative in fixture.layout["implementations"].values():
        write(fixture.root, relative, code)
    write(fixture.root, fixture.layout["prompt"], "Any order is permitted.\npaths(['a', 'b']) # ['a', 'b']\n")
    write(fixture.root, fixture.layout["tests"] + "/test_hidden.py",
          "from solution import paths\ndef test_paths(): assert set(paths(['a', 'b'])) == {'a', 'b'}\n")
    original = execution.execute

    def only_baseline(ctx, args, probes=False):
        assert not probes, "Do not impose exact list ordering for an arbitrary-order contract."
        return original(ctx, args, probes=probes)

    monkeypatch.setattr(execution, "execute", only_baseline)
    pipeline.run_pipeline(fixture.config, allow_native=True)
    value = checks.load_json(fixture.config.output / "latest" / "results.json")
    task = value["review_checks"]["tasks"][0]
    assert task["examples"] and not task["executions"]
    assert task["experiment_status"] == "unsupported"
    assert "Order-insensitive" in task["replay_reason"]
