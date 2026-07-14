/**
 * Pure, isomorphic judging logic. Runs identically in a Web Worker (browser)
 * and in Node (unit tests). No DOM / no `self` references live here.
 *
 * User code is executed with `new Function` in strict mode. In the browser this
 * runs inside a Web Worker, which is terminated by the caller on timeout — that
 * is what protects against infinite loops.
 */
import type {
  CompareMode,
  JudgeOutcome,
  JudgeSpec,
  JudgeTest,
  TestResult,
} from "./types";

/* ------------------------------- comparators ------------------------------ */

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a === "number" && typeof b === "number") {
    return Number.isNaN(a) && Number.isNaN(b);
  }
  if (a === null || b === null || a === undefined || b === undefined) {
    return a === b;
  }
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  if (typeof a === "object" && typeof b === "object") {
    const ka = Object.keys(a as object);
    const kb = Object.keys(b as object);
    if (ka.length !== kb.length) return false;
    for (const k of ka) {
      if (
        !deepEqual(
          (a as Record<string, unknown>)[k],
          (b as Record<string, unknown>)[k],
        )
      ) {
        return false;
      }
    }
    return true;
  }
  return false;
}

/** Stable serialization used to sort values for order-insensitive compares. */
function canon(x: unknown): string {
  if (Array.isArray(x)) return `[${x.map(canon).join(",")}]`;
  if (x && typeof x === "object") {
    const obj = x as Record<string, unknown>;
    return `{${Object.keys(obj)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canon(obj[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(x) ?? "null";
}

function unorderedEqual(a: unknown, b: unknown): boolean {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
    return false;
  }
  const sa = a.map(canon).sort();
  const sb = b.map(canon).sort();
  return sa.every((v, i) => v === sb[i]);
}

function anagramGroupsEqual(a: unknown, b: unknown): boolean {
  const norm = (g: unknown): unknown => {
    if (!Array.isArray(g)) return g;
    return g
      .map((inner) => (Array.isArray(inner) ? [...inner].sort() : inner))
      .sort((x, y) => (canon(x) < canon(y) ? -1 : canon(x) > canon(y) ? 1 : 0));
  };
  return deepEqual(norm(a), norm(b));
}

function compareValues(
  mode: CompareMode | undefined,
  expected: unknown,
  actual: unknown,
): boolean {
  switch (mode) {
    case "unordered":
      return unorderedEqual(expected, actual);
    case "anagram-groups":
      return anagramGroupsEqual(expected, actual);
    default:
      return deepEqual(expected, actual);
  }
}

/* ---------------------------- linked-list shapes -------------------------- */

interface ListNodeLike {
  val: unknown;
  next: ListNodeLike | null;
}

function arrayToList(arr: unknown): ListNodeLike | null {
  if (!Array.isArray(arr)) return null;
  let head: ListNodeLike | null = null;
  let tail: ListNodeLike | null = null;
  for (const v of arr) {
    const node: ListNodeLike = { val: v, next: null };
    if (!head) head = node;
    else if (tail) tail.next = node;
    tail = node;
  }
  return head;
}

function listToArray(node: unknown): unknown[] {
  const out: unknown[] = [];
  let cur = node as ListNodeLike | null;
  let guard = 0;
  while (cur) {
    out.push(cur.val);
    cur = cur.next;
    if (++guard > 1_000_000) throw new Error("Result list too long (cycle?).");
  }
  return out;
}

/* -------------------------------- execution ------------------------------- */

function toMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  try {
    return String(e);
  } catch {
    return "Unknown error";
  }
}

function clone<T>(x: T): T {
  return x === undefined ? x : (JSON.parse(JSON.stringify(x)) as T);
}

/**
 * Compile the user's code and return the named entry (a function or class).
 * Throws with a friendly message if the entry cannot be found.
 */
function buildEntry(code: string, entry: string): (...a: unknown[]) => unknown {
  // eslint-disable-next-line no-new-func
  const factory = new Function(
    `"use strict";\n${code}\n;return typeof ${entry} !== "undefined" ? ${entry} : undefined;`,
  );
  const fn = factory();
  if (typeof fn === "undefined") {
    throw new Error(
      `Could not find "${entry}". Make sure it is defined (do not rename it).`,
    );
  }
  return fn as (...a: unknown[]) => unknown;
}

function runFunctionTest(
  entry: (...a: unknown[]) => unknown,
  spec: JudgeSpec,
  test: JudgeTest,
  label: string,
): TestResult {
  try {
    let args = (test.input ?? []).map((a) => clone(a));
    if (spec.kind === "linkedlist") {
      const idxs = spec.listArgs ?? [];
      args = args.map((a, i) => (idxs.includes(i) ? arrayToList(a) : a));
    }
    let actual = entry(...args);
    if (spec.kind === "linkedlist" && spec.returnsList) {
      actual = listToArray(actual);
    }
    const passed = compareValues(spec.compare, test.expected, actual);
    return {
      name: label,
      passed,
      input: test.input,
      expected: test.expected,
      actual,
      hidden: test.hidden,
    };
  } catch (e) {
    return {
      name: label,
      passed: false,
      input: test.input,
      expected: test.expected,
      error: toMessage(e),
      hidden: test.hidden,
    };
  }
}

function runDesignTest(
  Cls: (...a: unknown[]) => unknown,
  test: JudgeTest,
  label: string,
): TestResult {
  const ops = test.ops ?? [];
  const argsArr = test.args ?? [];
  try {
    const outputs: unknown[] = [];
    let instance: Record<string, unknown> | undefined;
    for (let i = 0; i < ops.length; i++) {
      const op = ops[i];
      const callArgs = (argsArr[i] ?? []).map((a) => clone(a));
      if (i === 0) {
        instance = new (Cls as unknown as new (...a: unknown[]) => object)(
          ...callArgs,
        ) as Record<string, unknown>;
        outputs.push(null);
        continue;
      }
      const method = instance?.[op];
      if (typeof method !== "function") {
        throw new Error(`Method "${op}" is not defined on the class.`);
      }
      const r = (method as (...a: unknown[]) => unknown).apply(
        instance,
        callArgs,
      );
      outputs.push(r === undefined ? null : r);
    }
    const passed = deepEqual(test.expected, outputs);
    return {
      name: label,
      passed,
      input: { ops, args: argsArr },
      expected: test.expected,
      actual: outputs,
      hidden: test.hidden,
    };
  } catch (e) {
    return {
      name: label,
      passed: false,
      input: { ops, args: argsArr },
      expected: test.expected,
      error: toMessage(e),
      hidden: test.hidden,
    };
  }
}

/** Run a user's code against a full spec and grade every test. */
export function runSpec(code: string, spec: JudgeSpec): JudgeOutcome {
  const total = spec.tests.length;
  let entry: (...a: unknown[]) => unknown;
  try {
    entry = buildEntry(code, spec.entry);
  } catch (e) {
    return {
      results: [],
      passedCount: 0,
      total,
      allPassed: false,
      compileError: toMessage(e),
    };
  }

  const results = spec.tests.map((test, i) => {
    const label = test.name ?? `Test ${i + 1}`;
    return spec.kind === "design"
      ? runDesignTest(entry, test, label)
      : runFunctionTest(entry, spec, test, label);
  });

  const passedCount = results.filter((r) => r.passed).length;
  return {
    results,
    passedCount,
    total,
    allPassed: total > 0 && passedCount === total,
  };
}

// Exported for unit tests.
export const _internals = {
  deepEqual,
  unorderedEqual,
  anagramGroupsEqual,
  arrayToList,
  listToArray,
};
