/**
 * Types for the in-browser DSA judge.
 *
 * A `JudgeSpec` lives alongside a problem (in content/*.json → `judge`, or the
 * Prisma `Problem.judgeSpec` column) and fully describes how to run and grade a
 * user's JavaScript solution entirely on the client — no server, no infra.
 */

/** How an expected value is compared to the actual return value. */
export type CompareMode =
  | "deep" // strict deep equality (default)
  | "unordered" // top-level array compared as a multiset (order ignored)
  | "anagram-groups"; // array-of-arrays compared ignoring inner + outer order

/** Shape of the problem being judged. */
export type JudgeKind =
  | "function" // call entry(...input), compare return
  | "linkedlist" // some args / the result are linked lists (array ⇄ ListNode)
  | "design"; // instantiate a class, replay an operation sequence

export interface JudgeTest {
  /** Optional human label, e.g. "Example 1". */
  name?: string;
  /** function / linkedlist: positional arguments passed to the entry. */
  input?: unknown[];
  /** function / linkedlist: expected return value. */
  expected?: unknown;
  /** design: method names, first entry is the constructor. */
  ops?: string[];
  /** design: args for each op (parallel to `ops`). */
  args?: unknown[][];
  /** Hide expected/actual in the UI (for challenge tests). */
  hidden?: boolean;
}

export interface JudgeSpec {
  /** Only "javascript" is supported today. */
  lang: "javascript";
  kind: JudgeKind;
  /** Function name (function/linkedlist) or class name (design) to invoke. */
  entry: string;
  /** Code pre-filled into the editor. */
  starter: string;
  /** Comparison strategy for function/linkedlist kinds. Default "deep". */
  compare?: CompareMode;
  /** linkedlist: indices of arguments that are linked lists. */
  listArgs?: number[];
  /** linkedlist: true when the entry returns a linked list. */
  returnsList?: boolean;
  tests: JudgeTest[];
}

export interface TestResult {
  name: string;
  passed: boolean;
  input?: unknown;
  expected?: unknown;
  actual?: unknown;
  error?: string;
  hidden?: boolean;
}

export interface JudgeOutcome {
  results: TestResult[];
  passedCount: number;
  total: number;
  allPassed: boolean;
  /** Set when the code failed to compile or the run itself failed (e.g. TLE). */
  compileError?: string;
}
