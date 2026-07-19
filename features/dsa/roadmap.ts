import type { DsaDifficulty } from "./types";

/**
 * The DSA learning roadmap: an ordered set of phases that groups the topic
 * registry into a recommended learning path. Purely presentational metadata
 * consumed by the hub's roadmap / learning-path visualisation. Adding a topic to
 * a phase is a one-line data change.
 */
export interface RoadmapPhase {
  id: string;
  order: number;
  title: string;
  /** What this phase builds toward. */
  summary: string;
  difficulty: DsaDifficulty;
  /** Topic slugs (must exist in the registry) in recommended order. */
  topicSlugs: string[];
}

export const DSA_ROADMAP: RoadmapPhase[] = [
  {
    id: "foundations",
    order: 1,
    title: "Foundations",
    summary:
      "Build fluency with the data structures every other pattern relies on: arrays, hashing, and pointer techniques.",
    difficulty: "Easy",
    topicSlugs: ["arrays", "hashmap-hashset", "two-pointers", "sliding-window"],
  },
  {
    id: "searching-sorting",
    order: 2,
    title: "Searching & Sorting",
    summary:
      "Halve the search space and use ordering as a pre-processing step that unlocks greedy and two-pointer solutions.",
    difficulty: "Medium",
    topicSlugs: ["binary-search", "sorting", "intervals", "greedy"],
  },
  {
    id: "linear-structures",
    order: 3,
    title: "Linear Structures",
    summary:
      "Model order and recency with linked lists, stacks, and queues — including the monotonic-stack and deque patterns.",
    difficulty: "Medium",
    topicSlugs: ["linked-list", "stack", "queue", "heap-priority-queue"],
  },
  {
    id: "hierarchical",
    order: 4,
    title: "Trees & Tries",
    summary:
      "Recurse over hierarchical data — binary trees, BST invariants, and prefix trees for fast word lookup.",
    difficulty: "Medium",
    topicSlugs: ["tree", "trie"],
  },
  {
    id: "search-and-graphs",
    order: 5,
    title: "Search & Graphs",
    summary:
      "Explore state spaces exhaustively with backtracking, then model relationships and paths with graph algorithms.",
    difficulty: "Hard",
    topicSlugs: ["backtracking", "graph-algorithms"],
  },
  {
    id: "optimization",
    order: 6,
    title: "Optimization",
    summary:
      "The capstone: recognise overlapping subproblems and optimal substructure to solve with dynamic programming.",
    difficulty: "Hard",
    topicSlugs: ["dynamic-programming"],
  },
];
