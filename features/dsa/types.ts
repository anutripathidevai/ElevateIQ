/**
 * Shared content model for the DSA learning hub (lives under Learning → DSA).
 *
 * The hub is metadata-driven: a registry of topics (see `registry.ts`) powers the
 * landing page, and each *published* topic maps to a `DsaCourse` — an ordered set
 * of modules and lessons. A lesson is either a `concept` page (teaching an idea,
 * e.g. "Memoization") or a `problem` page (a full, intuition-first interview
 * problem with one or two optimal Java solutions).
 *
 * Everything is authored as typed data — no database required — so it renders
 * identically in guest mode and, later, when a DB is attached. Adding a new DSA
 * topic means authoring data (a registry entry + optional course), not rewriting
 * routing or UI: the dynamic `[topic]` / `[topic]/[problem]` routes render any
 * course that conforms to this model.
 *
 * The Graph Algorithms course predates this model and is adapted into it (see
 * `courses/graph.ts`) so both courses share one architecture and one renderer.
 */

import type { AccentKey } from "@/lib/navigation";

export type DsaDifficulty = "Easy" | "Medium" | "Hard";

/** A topic's publish state. Only authored courses are "published". */
export type DsaTopicStatus = "published" | "coming-soon";

/**
 * Icon keys resolved to a concrete LucideIcon in the UI layer (keeps the data
 * model serialisable and free of React/icon imports).
 */
export type DsaIconKey =
  | "arrays"
  | "two-pointers"
  | "binary-search"
  | "sorting"
  | "hashmap"
  | "linked-list"
  | "stack"
  | "queue"
  | "tree"
  | "trie"
  | "heap"
  | "intervals"
  | "sliding-window"
  | "backtracking"
  | "greedy"
  | "dynamic-programming"
  | "graph";

// ---- Shared problem building blocks ----------------------------------------

/** A worked input/output example for the problem statement. */
export interface DsaExample {
  input: string;
  output: string;
  /** Optional Markdown explanation of why the output is what it is. */
  explanation?: string;
}

/** A compact time/space complexity summary rendered as a pair of cards. */
export interface DsaComplexity {
  /** e.g. "O(n)". */
  time: string;
  /** e.g. "O(1)". */
  space: string;
  /** Optional one-line justification. */
  note?: string;
}

/**
 * One optimal solution. At most two are ever authored per problem (brute-force
 * approaches are deliberately excluded — see the authoring guidelines).
 */
export interface DsaSolution {
  /** e.g. "Tabulation", "Space-optimized", "Union-Find". */
  name: string;
  /** When this approach is preferred over the alternative (Markdown). */
  whenToUseMD?: string;
  /** Algorithm explanation for this specific approach (Markdown). */
  approachMD: string;
  /** Step-by-step walkthrough of the implementation (Markdown). */
  walkthroughMD: string;
  complexity: DsaComplexity;
  /** Monaco file name, e.g. "Solution.java". */
  filename: string;
  /** Clean, compilable Java 17 source. */
  code: string;
}

/**
 * A tabular dry run: `columns` are the tracked state (DP table, cache, queue…)
 * and each row is one iteration. Rendered as a scrollable table so any
 * algorithm's state can be visualised without bespoke components.
 */
export interface DsaDryRun {
  /** Sample input, as Markdown (may include a small diagram). */
  inputMD: string;
  /** Column headers, e.g. ["i", "dp[i]", "choice"]. */
  columns: string[];
  /** One array of cell strings per row; length must match `columns`. */
  rows: string[][];
  /** Optional closing narrative summarising the trace (Markdown). */
  narrativeMD?: string;
}

/** A related problem suggestion (internal link and/or external URL). */
export interface DsaSimilar {
  title: string;
  difficulty: DsaDifficulty;
  /** Slug of another lesson in the SAME course to link internally. */
  slug?: string;
  /** External URL (e.g. LeetCode) when not part of this course. */
  url?: string;
  /** Optional one-line reason it's related. */
  note?: string;
}

/**
 * A "predict / expand" recursion-tree node used for the explanation-only
 * recursion tree visualisation. Purely presentational — never executed.
 */
export interface RecursionTreeNode {
  /** Node label, e.g. "fib(5)". */
  label: string;
  /** Child calls, left-to-right. */
  children?: RecursionTreeNode[];
  /** Optional note, e.g. "cached" or "returns 3". */
  note?: string;
}

// ---- Lessons ---------------------------------------------------------------

/** Fields shared by every lesson kind. */
interface DsaLessonBase {
  /** Globally-unique slug within the course (e.g. "dp-climbing-stairs"). */
  slug: string;
  /** The owning module's id. */
  moduleId: string;
  /** 1-based position in the overall course learning order. */
  order: number;
  title: string;
  /** Reading estimate (minutes) shown in the meta bar. */
  estimatedReadingMin: number;
  tags: string[];
}

/**
 * A concept lesson: teaches an idea rather than a specific problem. Rendered as
 * a sequence of titled Markdown sections plus optional code examples and a
 * recursion-tree / diagram. Used for "DP Fundamentals" (What is DP, Memoization…).
 */
export interface DsaConceptLesson extends DsaLessonBase {
  kind: "concept";
  /** One-line summary shown on cards and at the top of the page. */
  summaryMD: string;
  /** Ordered teaching sections. */
  sections: { heading: string; bodyMD: string }[];
  /** Optional read-only, copyable code samples. */
  codeExamples?: {
    title?: string;
    language: string;
    code: string;
    captionMD?: string;
  }[];
  /** Optional explanation-only recursion tree. */
  recursionTree?: {
    rootLabel: string;
    root: RecursionTreeNode;
    captionMD?: string;
  };
  /** Key takeaways bullet list. */
  keyTakeaways: string[];
}

/**
 * A problem lesson: a full interview problem page. Superset of the Graph problem
 * shape; DP problems additionally provide `stateDefinitionMD` and
 * `stateTransitionMD` (sections 5 & 6 of the DP structure). Optional fields let
 * the Graph course adapt cleanly (it uses `algorithmMD`, DP uses state sections).
 */
export interface DsaProblemLesson extends DsaLessonBase {
  kind: "problem";
  difficulty: DsaDifficulty;
  /** External reference (LeetCode) for the canonical problem. */
  leetcodeUrl?: string;
  companies: string[];
  /** Solving estimate (minutes) shown in the meta bar. */
  estimatedSolvingMin: number;

  // 1. Problem statement
  statementMD: string;
  constraints: string[];
  inputMD: string;
  outputMD: string;
  examples: DsaExample[];

  // 3. Learning objectives
  learningObjectives: string[];

  // 4. Intuition
  intuitionMD: string;
  commonMistakes: string[];

  // 5. State definition (DP) — optional so Graph can omit it.
  stateDefinitionMD?: string;
  // 6. State transition / recurrence (DP) — optional.
  stateTransitionMD?: string;
  /** Optional explanation-only recursion tree for deriving the recurrence. */
  recursionTree?: {
    rootLabel: string;
    root: RecursionTreeNode;
    captionMD?: string;
  };

  // Graph-style "Algorithm Explanation" — optional (DP uses state sections).
  algorithmMD?: string;

  // 7. Solutions (one or two optimal approaches; no brute force).
  solutions: DsaSolution[];

  // 8. Dry run.
  dryRun: DsaDryRun;

  // 9. Complexity — overall summary (per-solution complexity lives on solutions).
  complexityNote?: string;

  // 10. Interview tips.
  interviewTipsMD: string;
  followUps: string[];

  // 11. Similar problems (3–5).
  similarProblems: DsaSimilar[];

  // 12. Key takeaways.
  keyTakeaways: string[];
  /** One-line reusable template/pattern the learner should remember. */
  pattern: string;
}

export type DsaLesson = DsaConceptLesson | DsaProblemLesson;

// ---- Modules & courses -----------------------------------------------------

/** A themed group of lessons within a course. */
export interface DsaModule {
  /** Stable id, e.g. "dp-1d". */
  id: string;
  /** 1-based module order within the course. */
  order: number;
  title: string;
  /** Short description shown on module cards and the roadmap. */
  summary: string;
  /** The core pattern this module teaches. */
  pattern: string;
  /** Lesson slugs, in learning order. */
  lessonSlugs: string[];
}

/** Landing-page metadata for a published course. */
export interface DsaCourseMeta {
  /** Owning topic slug (matches the registry entry). */
  topic: string;
  title: string;
  subtitle: string;
  /** Longer overview paragraph (Markdown). */
  descriptionMD: string;
  /** What the learner will be able to do. */
  objectives: string[];
  /** Skills / keywords gained. */
  skills: string[];
  accent: AccentKey;
}

/**
 * A fully-authored course. `lessons` may contain fewer entries than the modules
 * plan (content can be filled in incrementally); the API only ever surfaces
 * authored, renderable lessons.
 */
export interface DsaCourse {
  meta: DsaCourseMeta;
  modules: DsaModule[];
  lessons: DsaLesson[];
}

/** Derived, display-ready stats for a module (computed in the course API). */
export interface DsaModuleStats {
  module: DsaModule;
  lessons: DsaLesson[];
  lessonCount: number;
  /** Number of `problem` lessons in the module. */
  problemCount: number;
  /** Sum of solving/reading estimates, in minutes. */
  estimatedMinutes: number;
}

// ---- Topic registry --------------------------------------------------------

/**
 * Registry entry describing a DSA topic and its availability. Drives the hub's
 * topic cards, search, and difficulty distribution. This is the single place a
 * new topic is declared.
 */
export interface DsaTopicMeta {
  /** URL slug, e.g. "dynamic-programming". */
  slug: string;
  /** Display name, e.g. "Dynamic Programming". */
  name: string;
  /** One-line positioning shown on cards. */
  tagline: string;
  /** Longer description for the topic card / coming-soon hero. */
  description: string;
  status: DsaTopicStatus;
  accent: AccentKey;
  iconKey: DsaIconKey;
  /** Overall difficulty band shown on the card and used for filtering. */
  difficulty: DsaDifficulty;
  /** Estimated number of lessons (concept + problem). */
  lessonCount: number;
  /** Estimated number of coding problems. */
  problemCount: number;
  /** Estimated study duration, in hours. */
  durationHours: number;
  /** Search / filter tags. */
  tags: string[];
}
