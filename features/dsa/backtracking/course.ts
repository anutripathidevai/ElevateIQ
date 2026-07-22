import type { DsaCourseMeta } from "../types";

/** Landing-page metadata for the Backtracking course. */
export const BT_COURSE_META: DsaCourseMeta = {
  topic: "backtracking",
  title: "Backtracking",
  subtitle:
    "Search a space of decisions the disciplined way: choose, explore, and undo — pruning dead branches before they cost you.",
  descriptionMD:
    "This is a premium interview-preparation course built around one template that solves a whole family of problems: **choose, explore, unchoose**. Backtracking is depth-first search over a decision tree — at each node you make a choice, recurse to explore its consequences, then undo the choice so the next branch starts clean. The art is not the recursion itself but knowing **what a state is**, **how choices branch**, and **when to prune** so an exponential space stays tractable. You will start with the mental model (decision trees, state-space search, the recursion tree, and how to reason about complexity), then work through curated problems grouped by the patterns interviewers actually test: subsets, permutations, combinations, string partitioning, board search, and advanced pruning. Every lesson recognises the pattern first, draws the recursion tree, explains the pruning, then shows a clean Java 17 implementation.",
  objectives: [
    "Recognise the backtracking signal: build every valid configuration by making and undoing sequential choices.",
    "Model state, choices, and the base case so the choose/explore/unchoose template writes itself.",
    "Prune aggressively — sort-and-skip duplicates, bound checks, and early termination — to tame the search tree.",
    "Reason about the size of the decision tree to state honest time and space complexity.",
  ],
  skills: [
    "Choose / explore / unchoose",
    "Decision-tree modelling",
    "Duplicate pruning",
    "Constraint propagation",
    "Recursion-tree analysis",
    "Board & grid search",
  ],
  accent: "violet",
};
