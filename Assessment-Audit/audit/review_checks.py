"""Dataset-driven screening and literal prompt-example replay; never a semantic grader."""
from __future__ import annotations

import argparse
import ast
import io
import json
from pathlib import Path
import re
import tokenize
from typing import Any

from checks import digest, envelope, integrity, load_json, observation, read_inventory, safe_path, save_json
import execution


VERSION = 1
MAX_EXAMPLES = 24
RULES = (
    "prompt_examples", "example_only_tests", "example_lookup", "unordered_oracle",
    "ordering_contract", "parser_matching", "ascii_digits", "whitespace_contract",
    "endpoint_contract", "rubric_interpolation",
)


def literal(node: ast.AST) -> Any:
    if sum(1 for _ in ast.walk(node)) > 512:
        raise ValueError("Literal exceeds review limit.")
    value = ast.literal_eval(node)
    if isinstance(value, (set, bytes, complex)):
        raise ValueError("Unsupported literal type.")
    return value


def functions(tree: ast.Module) -> dict[str, ast.FunctionDef]:
    return {node.name: node for node in tree.body
            if isinstance(node, ast.FunctionDef) and not node.name.startswith("_")}


def static_string(node: ast.AST, names: dict[str, str]) -> str | None:
    if isinstance(node, ast.Constant) and isinstance(node.value, str):
        return node.value
    if isinstance(node, ast.Name):
        return names.get(node.id)
    if isinstance(node, ast.JoinedStr):
        parts = [None if isinstance(part, ast.FormattedValue) and (part.conversion != -1 or part.format_spec)
                 else static_string(part.value if isinstance(part, ast.FormattedValue) else part, names)
                 for part in node.values]
        if all(part is not None for part in parts):
            return "".join(parts)
    if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Add):
        left, right = static_string(node.left, names), static_string(node.right, names)
        if left is not None and right is not None:
            return left + right
    return None


def call_key(call: ast.Call, definitions: dict[str, ast.FunctionDef], aliases: dict[str, str]) -> str | None:
    """Bind literal calls to source signatures without importing or evaluating code."""
    if not isinstance(call.func, ast.Name):
        return None
    name = aliases.get(call.func.id, call.func.id)
    if name not in definitions:
        return None
    definition = definitions[name]
    if definition.args.vararg or definition.args.kwarg:
        return None
    names = [arg.arg for arg in definition.args.posonlyargs + definition.args.args]
    if len(call.args) > len(names):
        return None
    try:
        values = {key: literal(value) for key, value in zip(names[-len(definition.args.defaults):], definition.args.defaults)}
        for arg, default in zip(definition.args.kwonlyargs, definition.args.kw_defaults):
            if default is not None:
                values[arg.arg] = literal(default)
        values.update({key: literal(value) for key, value in zip(names, call.args)})
        supplied = set(names[:len(call.args)])
        keyword_names = {arg.arg for arg in definition.args.kwonlyargs}
        for keyword in call.keywords:
            if keyword.arg is None or keyword.arg not in set(names) | keyword_names or keyword.arg in supplied:
                return None
            values[keyword.arg] = literal(keyword.value)
            supplied.add(keyword.arg)
        if set(values) != set(names) | keyword_names:
            return None
        return name + ":" + repr(sorted(values.items()))
    except (ValueError, TypeError, SyntaxError):
        return None


def prompt_examples(text: str, definitions: dict[str, ast.FunctionDef]) -> list[dict[str, Any]]:
    """Recognize one-line literal calls with literal # outputs or doctest outputs."""
    lines = text.splitlines()
    examples = []
    for number, line in enumerate(lines, 1):
        code = line.strip()
        doctest = code.startswith(">>> ")
        if doctest:
            code = code[4:]
        try:
            comments = [token for token in tokenize.generate_tokens(io.StringIO(code).readline)
                        if token.type == tokenize.COMMENT]
            expected = comments[0].string[1:].strip() if comments else (
                lines[number].strip() if doctest and number < len(lines) else "")
            expression = code[:comments[0].start[1]].strip() if comments else code
            if not expected or len(expression) + len(expected) > 4096:
                continue
            call = ast.parse(expression, mode="eval").body
            if not isinstance(call, ast.Call):
                continue
            key = call_key(call, definitions, {})
            if key is None:
                continue
            value = literal(ast.parse(expected, mode="eval").body)
            # Sets/custom expressions and exceptions are deliberately unsupported.
            json.dumps(value, allow_nan=False)
            examples.append(dict(key=key, line=number, call=ast.unparse(call),
                                 expected=repr(value), function=call.func.id))
        except (ValueError, TypeError, SyntaxError, tokenize.TokenError, IndentationError):
            continue
    return examples


def scan_task(root: Path, task: dict[str, Any], manifest: dict[str, dict[str, Any]]) -> dict[str, Any]:
    task_id, layout = task["task_id"], task["layout"]
    result: dict[str, Any] = dict(task_id=task_id, checks=[], signals=[], examples=[], executions=[],
                                  source_files=[], probe_file=None)
    trees: dict[str, ast.Module] = {}
    texts: dict[str, str] = {}
    paths = [layout["prompt"], *layout["implementations"].values(),
             *sorted(path for path in manifest if path.startswith(layout["tests"] + "/") and path.endswith(".py"))]
    for relative in dict.fromkeys(paths):
        entry = manifest.get(relative)
        if entry is None or entry.get("error"):
            result["checks"].append(dict(rule="source_access", status="unsupported", artifact=relative,
                                         reason="Source missing or unreadable in inventory."))
            continue
        path = safe_path(root, relative)
        if digest(path) != entry["sha256"]:
            raise ValueError(f"Review source changed since inventory: {relative}")
        result["source_files"].append(dict(path=relative, sha256=entry["sha256"]))
        texts[relative] = path.read_text(encoding="utf-8-sig")
        if path.suffix == ".py":
            try:
                trees[relative] = ast.parse(texts[relative], filename=relative)
            except SyntaxError as error:
                result["checks"].append(dict(rule="source_syntax", status="unsupported", artifact=relative, reason=str(error)))
    prompt = texts.get(layout["prompt"], "")
    unordered = bool(re.search(r"(?:order[^\n.]{0,160}(?:does not matter|doesn't matter)|any order|arbitrary order)", prompt, re.I))
    result["replay_supported"] = not unordered
    result["replay_reason"] = ("Order-insensitive output requires contract-specific comparison; no generic exact-output oracle assumed."
                               if unordered else "Replay uses the explicit literal expected output; the prompt example still needs review.")
    definitions = functions(trees.get(layout["implementations"]["reference"], ast.Module(body=[], type_ignores=[])))
    examples = prompt_examples(prompt, definitions)
    result["examples"] = examples[:MAX_EXAMPLES]
    result["example_limit_reached"] = len(examples) > MAX_EXAMPLES
    test_trees = {path: tree for path, tree in trees.items() if path.startswith(layout["tests"] + "/")}
    test_calls: list[tuple[str | None, str, int]] = []
    test_functions = []
    for path, tree in test_trees.items():
        aliases = {alias.asname or alias.name: alias.name for node in tree.body
                   if isinstance(node, ast.ImportFrom) and node.module == "solution" for alias in node.names}
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef) and node.name.startswith("test_"):
                test_functions.append(node)
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and aliases.get(node.func.id, node.func.id) in definitions:
                test_calls.append((call_key(node, definitions, aliases), path, node.lineno))
    known_calls = {key for key, _, _ in test_calls if key}
    example_keys = {example["key"] for example in examples}
    for example in result["examples"]:
        example["baseline_input_match"] = example["key"] in known_calls
    result["checks"].append(dict(
        rule="prompt_examples", status="assessed" if examples else "unsupported",
        reason="Literal calls with explicit literal outputs only; matching inputs do not prove assertions or coverage.",
        extracted=len(examples), selected=min(len(examples), MAX_EXAMPLES),
        matched_inputs=sum(example["baseline_input_match"] for example in result["examples"]),
        unresolved_test_calls=sum(key is None for key, _, _ in test_calls),
    ))

    def signal(rule: str, title: str, artifact: str, line: int, detail: str,
               impact: str, model: str = "") -> None:
        result["signals"].append(dict(
            rule=rule, title=title, artifact=artifact, line=line, detail=detail,
            impact=impact, model=model, evidence_basis="source_inspection",
            check_result="not_executed", source_status="current",
        ))

    unmatched = [example for example in result["examples"] if not example["baseline_input_match"]]
    if unmatched and known_calls:
        signal("prompt_examples", f"{len(unmatched)} prompt example(s) not matched by literal-call analysis: "
               + "; ".join(example["call"][:160] for example in unmatched[:2])
               + ("; additional examples in evidence." if len(unmatched) > 2 else "."),
               layout["prompt"], unmatched[0]["line"],
               "Matched inputs only; dynamic/variable-driven tests may cover these cases. " +
               "; ".join(f"line {x['line']}: {x['call']} -> {x['expected']}" for x in unmatched),
               "Required example behavior may be unevaluated; independent replay checks the prompt's explicit expected output.")
    only_examples = bool(test_calls and example_keys and all(key in example_keys for key, _, _ in test_calls))
    if only_examples:
        signal("example_only_tests", f"All {len(test_calls)} statically identified solution calls in delivered tests use prompt-example inputs.",
               layout["tests"], 0,
               f"{len(test_calls)} calls in {len(test_functions)} test functions; dynamic calls/assertion quality are not established.",
               "Example-specific implementations may pass without demonstrating generalization.")
    for model, path in layout["implementations"].items():
        tree = trees.get(path)
        if tree is None:
            continue
        for node in ast.walk(tree):
            if isinstance(node, ast.Dict) and len(node.keys) >= 2:
                overlap = []
                for key in node.keys:
                    try:
                        value = literal(key) if key else None
                    except (ValueError, TypeError, SyntaxError):
                        continue
                    for example in examples:
                        call = ast.parse(example["call"], mode="eval").body
                        try:
                            args = tuple(literal(arg) for arg in call.args)
                        except (ValueError, TypeError, SyntaxError):
                            continue
                        parts = value if isinstance(value, tuple) else (value,)
                        if args and tuple(parts[:len(args)]) == args:
                            overlap.append(example["key"])
                if len(set(overlap)) >= 2:
                    signal("example_lookup", "A literal lookup table contains multiple public-example input keys.",
                           path, node.lineno, f"Matched {len(set(overlap))} example inputs. Table use and any general fallback require review.",
                           "Special-casing can inflate evaluation results, especially when tests repeat examples.", model)
                    break
    for path, tree in test_trees.items():
        for node in ast.walk(tree):
            if not isinstance(node, ast.Assert) or not isinstance(node.test, ast.Compare):
                continue
            compare = node.test
            if not any(isinstance(op, ast.Eq) for op in compare.ops):
                continue
            expressions = [compare.left, *compare.comparators]
            if unordered and any(isinstance(expr, ast.List) and expr.elts for expr in expressions):
                signal("ordering_contract", "Order-insensitive prompt is paired with direct list equality assertions.",
                       path, node.lineno, ast.unparse(node)[:800],
                       "Permitted output orderings may be rejected; inspect whether the other operand is canonicalized.")
                break
            if any(isinstance(expr, ast.Call) and isinstance(expr.func, ast.Name) and expr.func.id == "list"
                   and expr.args and isinstance(expr.args[0], (ast.Set, ast.SetComp)) for expr in expressions):
                signal("unordered_oracle", "An equality assertion converts an unordered set into an expected list.",
                       path, node.lineno, ast.unparse(node)[:800],
                       "An ordered expected value may depend on hash ordering; no multi-seed variation is claimed.")
        # Track the common expected = set(...); assert result == list(expected) form.
        sets = {node.targets[0].id for node in ast.walk(tree) if isinstance(node, ast.Assign)
                and len(node.targets) == 1 and isinstance(node.targets[0], ast.Name)
                and (isinstance(node.value, (ast.Set, ast.SetComp)) or isinstance(node.value, ast.Call)
                     and isinstance(node.value.func, ast.Name) and node.value.func.id == "set")}
        for node in ast.walk(tree):
            if isinstance(node, ast.Assert) and isinstance(node.test, ast.Compare) and any(
                isinstance(op, ast.Eq) for op in node.test.ops
            ) and any(isinstance(child, ast.Call) and isinstance(child.func, ast.Name) and child.func.id == "list"
                      and child.args and isinstance(child.args[0], ast.Name) and child.args[0].id in sets
                      for child in ast.walk(node)):
                signal("unordered_oracle", "An equality assertion uses a list constructed from a set-valued variable.",
                       path, node.lineno, ast.unparse(node)[:800],
                       "Hash ordering may produce incorrect expectations; variable resolution is approximate and requires review.")
                break
    for model, path in layout["implementations"].items():
        tree = trees.get(path)
        if tree is None:
            continue
        names: dict[str, str] = {}
        for node in tree.body:
            if isinstance(node, ast.Assign):
                value = static_string(node.value, names)
                if value is not None:
                    for target in node.targets:
                        if isinstance(target, ast.Name):
                            names[target.id] = value
        patterns = [node for node in ast.walk(tree) if isinstance(node, ast.Call)
                    and isinstance(node.func, ast.Attribute) and node.func.attr == "compile"
                    and node.args and static_string(node.args[0], names) is not None]
        for pattern in patterns:
            regex = static_string(pattern.args[0], names)
            pattern_names = {target.id for node in ast.walk(tree) if isinstance(node, ast.Assign) and node.value is pattern
                             for target in node.targets if isinstance(target, ast.Name)}
            matches = [node for node in ast.walk(tree) if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute)
                       and node.func.attr == "match" and (
                           node.func.value is pattern or isinstance(node.func.value, ast.Name) and node.func.value.id in pattern_names)]
            if matches and not regex.endswith(("\\Z", "\\z")):
                signal("parser_matching", "Regex .match() may accept a prefix or an input with a final newline.",
                       path, pattern.lineno, regex,
                       "Invalid suffixes may be accepted; input preprocessing and the actual grammar must be reviewed.", model)
            ascii_flags = any(isinstance(node, ast.Attribute) and node.attr in ("ASCII", "A")
                              for flag in [*pattern.args[1:], *(keyword.value for keyword in pattern.keywords if keyword.arg == "flags")]
                              for node in ast.walk(flag)) or regex.startswith("(?a)")
            if "ascii digits" in prompt.casefold() and "\\d" in regex and not ascii_flags:
                signal("ascii_digits", "ASCII-digit contract is paired with a Unicode-aware \\d pattern.",
                       path, pattern.lineno, regex, "Forbidden non-ASCII decimal inputs may be accepted; flags and preprocessing require review.", model)
            if re.search(r"spaces or tabs|spaces and tabs", prompt, re.I) and "\\s" in regex:
                signal("whitespace_contract", "Space/tab contract is paired with the broader \\s character class.",
                       path, pattern.lineno, regex, "Newlines or other whitespace may be accepted outside the stated grammar.", model)
    if re.search(r"\bbetween\b", prompt, re.I) and not re.search(
        r"\binclusive\b|\bexclusive\b|\bincluded\b|\bexcluded\b|\bhalf.open\b|<=|>=|[\[(]start,\s*end[\])]", prompt, re.I
    ):
        boundary_tests = [node.name for node in test_functions if re.search(r"exactly_at_(?:start|end)_included|includes_both|start_equals_end", node.name)]
        if boundary_tests:
            signal("endpoint_contract", "Boundary tests choose an inclusion convention not explicit in the prompt wording.",
                   layout["prompt"], 1, ", ".join(boundary_tests),
                   "Reasonable boundary interpretations may be graded differently; this needs adjudication, not an invented oracle.")
    for row in task["workbook_rows"]:
        rubric = row["values"].get("Expert Rubric", "")
        if isinstance(rubric, str) and re.search(r"inserted directly into the query|no placeholder", rubric, re.I):
            signal("rubric_interpolation", "Rubric wording appears to reward direct query interpolation over parameter binding.",
                   row["locations"]["Expert Rubric"], 0, rubric,
                   "The rubric may reward unsafe or brittle data handling; this is a source-supported concern, not an executed exploit.")
    signaled = {item["rule"] for item in result["signals"]}
    for check in result["checks"]:
        if check["rule"] == "prompt_examples" and "prompt_examples" in signaled:
            check["status"] = "signal"
    for rule in RULES:
        if rule == "prompt_examples":
            continue
        result["checks"].append(dict(rule=rule, status="signal" if rule in signaled else "no_signal" if trees and prompt else "unsupported",
                                     reason="Bounded syntactic screen only; no_signal does not establish semantic correctness."))
    return result


def probe_source(examples: list[dict[str, Any]]) -> str:
    # Only reconstructed AST literal calls are emitted; never execute arbitrary prompt text.
    lines = ["import math", "import solution", "",
             "def _equal(actual, expected):",
             "    if isinstance(expected, float):",
             "        return isinstance(actual, (float, int)) and math.isclose(actual, expected, rel_tol=1e-9, abs_tol=1e-12)",
             "    if isinstance(expected, (list, tuple)):",
             "        return type(actual) is type(expected) and len(actual) == len(expected) and all(_equal(a, e) for a, e in zip(actual, expected))",
             "    if isinstance(expected, dict):",
             "        return isinstance(actual, dict) and actual.keys() == expected.keys() and all(_equal(actual[k], expected[k]) for k in expected)",
             "    return actual == expected", ""]
    for index, example in enumerate(examples):
        call = ast.parse(example["call"], mode="eval").body
        call.func = ast.Attribute(value=ast.Name(id="solution", ctx=ast.Load()), attr=example["function"], ctx=ast.Load())
        lines += [f"def test_prompt_line_{example['line']}_{index}():",
                  f"    actual = {ast.unparse(ast.fix_missing_locations(call))}",
                  f"    expected = {example['expected']}",
                  "    assert _equal(actual, expected), (actual, expected)", ""]
    return "\n".join(lines)


def review(ctx: dict[str, Any], args: argparse.Namespace, execute_examples: bool) -> list[dict[str, Any]]:
    inventory = read_inventory(ctx)
    manifest = {entry["path"]: entry for entry in inventory["manifest"]}
    task_manifests: dict[str, dict[str, dict[str, Any]]] = {}
    for path, entry in manifest.items():
        match = re.match(r"Data/(?:Task|ExpertSolution|ModelOutputs)_([0-9]+)/", path)
        if match:
            task_manifests.setdefault(match[1], {})[path] = entry
    records: dict[str, Any] = dict(version=VERSION, tasks=[], observations=[], limitations=[
        "No task-specific notes or IDs are used. Static rules nominate concerns, not confirmed defects.",
        "Only literal one-line call/#-output or doctest examples are replayed (up to 24 per task).",
        "Tables, multiline calls, constructors, dynamic tests and full natural-language semantics are unsupported.",
        "No seed variation, unseen-input oracle or subjective rubric award is invented.",
    ])
    original_run = ctx["run_id"]
    issues = records["observations"]

    def persist() -> None:
        save_json(ctx["out"] / "review_checks.json", envelope(ctx, records))

    changes = integrity(ctx, inventory)
    if changes:
        issues.extend(changes)
        persist()
        return issues
    for index, task in enumerate(inventory["tasks"]):
        if ctx.get("interrupted"):
            break
        try:
            entry = scan_task(ctx["root"], task, task_manifests.get(task["task_id"], {}))
        except (OSError, UnicodeError, ValueError) as error:
            entry = dict(task_id=task["task_id"], signals=[], examples=[], executions=[], source_files=[],
                         checks=[dict(rule="source_access", status="unsupported", reason=str(error))])
            issues.append(observation(task["task_id"], task["layout"]["prompt"], "source_review_unavailable", "blocked", str(error)))
        records["tasks"].append(entry)
        for item in entry["signals"]:
            issues.append(observation(task["task_id"], item["artifact"], "review_" + item["rule"], "warning", item["title"]))
        examples = entry["examples"]
        supported = bool(examples and entry.get("replay_supported", False))
        entry["experiment_status"] = "not_executed" if supported else "unsupported"
        persist()
        if supported and execute_examples and not ctx.get("execution_halted"):
            folder = ctx["out"] / "generated_review" / task["task_id"]
            folder.mkdir(parents=True)
            probe = folder / "test_prompt_examples.py"
            probe.write_text(probe_source(examples), encoding="utf-8")
            entry.update(probe_file=probe.relative_to(ctx["out"]).as_posix(), probe_sha256=digest(probe))
            selected = argparse.Namespace(**{
                **vars(args), "task_id": [task["task_id"]], "model": list(execution.MODELS), "probe_file": probe,
            })
            ctx["run_id"] = f"{original_run}-review-{index}"
            try:
                outcomes = execution.execute(ctx, selected, probes=True)
                entry["executions"] = load_json(ctx["out"] / "probe_results.json")["records"]
                entry["experiment_status"] = "executed"
                issues.extend(outcomes)
            finally:
                if (ctx["out"] / "probe_results.json").is_file():
                    captured = load_json(ctx["out"] / "probe_results.json")
                    if captured["run_id"] == ctx["run_id"]:
                        entry["executions"] = captured["records"]
                        if ctx.get("interrupted"):
                            entry["experiment_status"] = "interrupted"
                ctx["run_id"] = original_run
                persist()
    persist()
    if ctx.get("interrupted"):
        raise KeyboardInterrupt
    return issues
