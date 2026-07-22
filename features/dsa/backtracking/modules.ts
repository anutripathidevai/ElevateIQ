import type { DsaModule } from "../types";

/**
 * The 7 modules of the Backtracking course, in learning order. Module 1 is
 * concept lessons (the decision-tree mental model); modules 2–7 are curated
 * interview problems grouped by pattern. Lesson content lives in `data/` keyed
 * by these slugs; the course API joins the two.
 */
export const BT_MODULES: DsaModule[] = [
  {
    id: "bt-fundamentals",
    order: 1,
    title: "Backtracking Fundamentals",
    summary:
      "The mental model: a decision tree over a state space, the choose/explore/unchoose template, pruning, and how to reason about the recursion tree's size.",
    pattern: "DFS over choices: choose, explore, unchoose",
    lessonSlugs: [
      "bt-what-is-backtracking",
      "bt-decision-tree",
      "bt-state-space-search",
      "bt-choose-explore-unchoose",
      "bt-pruning",
      "bt-recursion-tree",
      "bt-time-complexity",
      "bt-when-to-use",
    ],
  },
  {
    id: "bt-subset",
    order: 2,
    title: "Subset Pattern",
    summary:
      "Include-or-exclude each element to enumerate the power set, then learn the sort-and-skip trick that removes duplicate subsets.",
    pattern: "Take / skip each index; sort-skip duplicates",
    lessonSlugs: ["bt-subsets", "bt-subsets-ii"],
  },
  {
    id: "bt-permutation",
    order: 3,
    title: "Permutation Pattern",
    summary:
      "Order matters: place every unused element at each position, and prune duplicate permutations with a used-array plus sorted skip.",
    pattern: "Fix each position with an unused element",
    lessonSlugs: ["bt-permutations", "bt-permutations-ii"],
  },
  {
    id: "bt-combination",
    order: 4,
    title: "Combination Pattern",
    summary:
      "Choose k of n without regard to order using a start index, then add target sums, reuse rules, and duplicate skipping.",
    pattern: "Start-index recursion; bound and skip",
    lessonSlugs: [
      "bt-combinations",
      "bt-combination-sum",
      "bt-combination-sum-ii",
      "bt-combination-sum-iii",
    ],
  },
  {
    id: "bt-string",
    order: 5,
    title: "String Backtracking",
    summary:
      "Partition and map strings: expand phone digits, cut a string into palindromes, and place dots to form valid IP addresses.",
    pattern: "Choose a prefix / cut point, recurse on the rest",
    lessonSlugs: [
      "bt-letter-combinations-of-a-phone-number",
      "bt-palindrome-partitioning",
      "bt-restore-ip-addresses",
    ],
  },
  {
    id: "bt-board",
    order: 6,
    title: "Board Search",
    summary:
      "Search a grid with constraints: walk a word through a matrix, place non-attacking queens, and solve Sudoku with constraint propagation.",
    pattern: "Place, validate, recurse, undo the cell",
    lessonSlugs: ["bt-word-search", "bt-n-queens", "bt-sudoku-solver"],
  },
  {
    id: "bt-advanced",
    order: 7,
    title: "Advanced Backtracking",
    summary:
      "Harder search spaces where pruning is the whole game: inject operators between digits, fill buckets to equal sums, and split into descending values.",
    pattern: "Aggressive pruning over a wide decision tree",
    lessonSlugs: [
      "bt-expression-add-operators",
      "bt-matchsticks-to-square",
      "bt-split-string-into-descending-consecutive-values",
    ],
  },
];
