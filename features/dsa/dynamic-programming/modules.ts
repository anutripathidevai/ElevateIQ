import type { DsaModule } from "../types";

/**
 * The 8 modules of the Dynamic Programming course, in learning order. Module 1
 * is concept lessons (the DP mental model); modules 2–8 are curated interview
 * problems grouped by pattern. Lesson content lives in `data/` keyed by these
 * slugs; the course API joins the two.
 */
export const DP_MODULES: DsaModule[] = [
  {
    id: "dp-fundamentals",
    order: 1,
    title: "Dynamic Programming Fundamentals",
    summary:
      "The mental model: spot overlapping subproblems and optimal substructure, then choose memoization or tabulation.",
    pattern: "Identify state, transition, and base cases",
    lessonSlugs: [
      "dp-what-is-dynamic-programming",
      "dp-overlapping-subproblems",
      "dp-optimal-substructure",
      "dp-recursion-vs-dp",
      "dp-memoization",
      "dp-tabulation",
      "dp-top-down-vs-bottom-up",
      "dp-state-definition",
      "dp-state-transition",
      "dp-base-cases",
      "dp-space-optimization",
    ],
  },
  {
    id: "dp-1d",
    order: 2,
    title: "1D Dynamic Programming",
    summary:
      "A single array of state where each cell depends on a constant number of previous cells — the gateway pattern.",
    pattern: "dp[i] from dp[i-1], dp[i-2] …",
    lessonSlugs: [
      "dp-fibonacci-number",
      "dp-climbing-stairs",
      "dp-min-cost-climbing-stairs",
      "dp-house-robber",
      "dp-house-robber-ii",
      "dp-decode-ways",
    ],
  },
  {
    id: "dp-grid",
    order: 3,
    title: "Grid Dynamic Programming",
    summary:
      "Two-dimensional state over a grid where each cell is reached from its top and left neighbours.",
    pattern: "dp[i][j] from dp[i-1][j], dp[i][j-1]",
    lessonSlugs: [
      "dp-unique-paths",
      "dp-unique-paths-ii",
      "dp-minimum-path-sum",
      "dp-triangle",
      "dp-dungeon-game",
    ],
  },
  {
    id: "dp-sequence",
    order: 4,
    title: "Sequence Dynamic Programming",
    summary:
      "State indexed by positions in one or two sequences — subsequences, alignment, and edit operations.",
    pattern: "dp[i][j] over two sequence indices",
    lessonSlugs: [
      "dp-longest-increasing-subsequence",
      "dp-longest-common-subsequence",
      "dp-edit-distance",
      "dp-longest-palindromic-subsequence",
    ],
  },
  {
    id: "dp-knapsack",
    order: 5,
    title: "Knapsack Pattern",
    summary:
      "Choose or skip each item to hit a target capacity — the 0/1 and unbounded knapsack family.",
    pattern: "dp[capacity] over items, choose or skip",
    lessonSlugs: [
      "dp-partition-equal-subset-sum",
      "dp-target-sum",
      "dp-coin-change",
      "dp-coin-change-ii",
      "dp-ones-and-zeroes",
    ],
  },
  {
    id: "dp-decision",
    order: 6,
    title: "Decision Dynamic Programming",
    summary:
      "Partition a value or string into pieces, where each cut is a decision validated against a set.",
    pattern: "dp[i] = OR / min over valid cuts j < i",
    lessonSlugs: [
      "dp-word-break",
      "dp-perfect-squares",
      "dp-integer-break",
    ],
  },
  {
    id: "dp-string",
    order: 7,
    title: "String Dynamic Programming",
    summary:
      "Count or match over substrings, where state spans a range or a pair of positions in the strings.",
    pattern: "dp over substring ranges / index pairs",
    lessonSlugs: [
      "dp-distinct-subsequences",
      "dp-palindromic-substrings",
      "dp-longest-palindromic-substring",
    ],
  },
  {
    id: "dp-advanced",
    order: 8,
    title: "Advanced Dynamic Programming",
    summary:
      "Interval DP, game theory, and multi-dimensional state — the hardest patterns interviewers reach for.",
    pattern: "Interval DP, game DP, k-dimensional state",
    lessonSlugs: [
      "dp-burst-balloons",
      "dp-stone-game",
      "dp-cherry-pickup",
      "dp-best-time-to-buy-and-sell-stock-iv",
    ],
  },
];
