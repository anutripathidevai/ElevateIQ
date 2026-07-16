/**
 * Content model for the Graph Algorithms learning track (a curated, course-style
 * module that lives under the DSA section). The shape is intentionally richer
 * than the flat `Problem` model: every problem is a full learning page with an
 * intuition-first narrative, one or two optimal Java solutions, a dry run, and
 * interview guidance.
 *
 * Content is authored as typed data (see `data/`) — no database required — so it
 * renders identically in guest mode and, later, when a DB is attached.
 */

export type GraphDifficulty = "Easy" | "Medium" | "Hard";

/** A worked input/output example for the problem statement. */
export interface GraphExample {
  input: string;
  output: string;
  /** Optional Markdown explanation of why the output is what it is. */
  explanation?: string;
}

/** A compact time/space complexity summary rendered as a pair of cards. */
export interface Complexity {
  /** e.g. "O(m · n)" */
  time: string;
  /** e.g. "O(m · n)" */
  space: string;
  /** Optional one-line justification. */
  note?: string;
}

/**
 * One optimal solution. At most two are ever authored per problem (brute-force
 * approaches are deliberately excluded — see the module guidelines).
 */
export interface GraphSolution {
  /** e.g. "BFS", "Union-Find", "Dijkstra". */
  name: string;
  /** When this approach is preferred over the alternative (Markdown). */
  whenToUseMD?: string;
  /** Algorithm explanation for this specific approach (Markdown). */
  approachMD: string;
  /** Step-by-step walkthrough of the implementation (Markdown). */
  walkthroughMD: string;
  complexity: Complexity;
  /** Monaco file name, e.g. "Solution.java". */
  filename: string;
  /** Clean, compilable Java 17 source. */
  code: string;
}

/**
 * A tabular dry run: `columns` are the tracked state (Queue, Visited, Dist…) and
 * each row is one iteration. Rendered as a scrollable table so any algorithm's
 * state can be visualised without bespoke components.
 */
export interface DryRun {
  /** Sample input, as Markdown (may include a small code block/diagram). */
  inputMD: string;
  /** Column headers, e.g. ["Step", "Node", "Queue", "Visited", "Dist"]. */
  columns: string[];
  /** One array of cell strings per row; length must match `columns`. */
  rows: string[][];
  /** Optional closing narrative summarising the trace (Markdown). */
  narrativeMD?: string;
}

/** A related problem suggestion (internal link and/or external LeetCode URL). */
export interface SimilarProblem {
  title: string;
  difficulty: GraphDifficulty;
  /** Slug of another Graph Algorithms problem to link internally. */
  slug?: string;
  /** External URL (e.g. LeetCode) when not part of this track. */
  url?: string;
  /** Optional one-line reason it's related. */
  note?: string;
}

/** A single fully-authored problem page. */
export interface GraphProblem {
  /** Globally-unique slug, always prefixed `graph-`. */
  slug: string;
  /** The owning module's id (see GraphModule.id). */
  moduleId: string;
  /** 1-based position in the overall learning order (1..25). */
  order: number;
  title: string;
  difficulty: GraphDifficulty;
  /** External reference (LeetCode) for the canonical problem. */
  leetcodeUrl?: string;

  // 2. Interview tags
  tags: string[];
  companies: string[];

  // Reading/solving estimates (minutes) shown in the meta bar.
  estimatedReadingMin: number;
  estimatedSolvingMin: number;

  // 1. Problem statement
  statementMD: string;
  constraints: string[];
  inputMD: string;
  outputMD: string;
  examples: GraphExample[];

  // 3. Learning objectives — what this teaches, why it's asked, where it's useful.
  learningObjectives: string[];

  // 4. Intuition — how to think about it + how to recognise the pattern.
  intuitionMD: string;
  commonMistakes: string[];

  // 5. Algorithm explanation — step-by-step, with complexity per solution below.
  algorithmMD: string;

  // 6. Solutions (one or two optimal approaches).
  solutions: GraphSolution[];

  // 7. Dry run.
  dryRun: DryRun;

  // 8. Interview tips.
  interviewTipsMD: string;
  followUps: string[];

  // 9. Similar problems (3–5).
  similarProblems: SimilarProblem[];

  // 10. Key takeaways.
  keyTakeaways: string[];
  /** One-line reusable template/pattern the learner should remember. */
  pattern: string;
}

/** A themed group of problems within the track (Module 1..10). */
export interface GraphModule {
  /** Stable id, e.g. "traversal". */
  id: string;
  /** 1-based module order. */
  order: number;
  title: string;
  /** Short description shown on module cards and the roadmap. */
  summary: string;
  /** The core pattern this module teaches. */
  pattern: string;
  /** Problem slugs, in learning order. */
  problemSlugs: string[];
}

/** Derived, display-ready stats for a module (computed in index.ts). */
export interface GraphModuleStats {
  module: GraphModule;
  problems: GraphProblem[];
  problemCount: number;
  /** Sum of solving estimates, in minutes. */
  estimatedMinutes: number;
}
