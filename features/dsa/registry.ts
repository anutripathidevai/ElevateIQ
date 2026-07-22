import type { DsaTopicMeta } from "./types";

/**
 * The single source of truth for which DSA topics exist and their availability.
 *
 * Only **Graph Algorithms** and **Dynamic Programming** are authored today; every
 * other topic renders a polished "Coming Soon" page (content in
 * `coming-soon-content.ts`). Adding a topic = appending an entry here and, when
 * ready, flipping `status` to "published" once its course exists in `courses/`.
 *
 * Order here is the display order on the hub (published topics first feels wrong
 * pedagogically, so the list follows a natural beginner→advanced progression and
 * the hub sorts published topics to the top of their difficulty band).
 */
export const DSA_TOPICS: DsaTopicMeta[] = [
  {
    slug: "arrays",
    name: "Arrays & Hashing",
    tagline: "The bedrock: scanning, prefix sums, and hashing for O(1) lookups.",
    description:
      "Master the array manipulations and hashing tricks that underpin almost every other topic — frequency maps, prefix sums, and in-place transformations.",
    status: "coming-soon",
    accent: "blue",
    iconKey: "arrays",
    difficulty: "Easy",
    lessonCount: 18,
    problemCount: 16,
    durationHours: 8,
    tags: ["Array", "Hashing", "Prefix Sum", "Fundamentals"],
  },
  {
    slug: "two-pointers",
    name: "Two Pointers",
    tagline: "Converging and fast/slow pointers to turn O(n²) scans into O(n).",
    description:
      "Learn when a pair of indices moving through a sequence collapses a quadratic brute force into a single linear pass.",
    status: "coming-soon",
    accent: "emerald",
    iconKey: "two-pointers",
    difficulty: "Easy",
    lessonCount: 12,
    problemCount: 11,
    durationHours: 6,
    tags: ["Two Pointers", "Array", "String"],
  },
  {
    slug: "binary-search",
    name: "Binary Search",
    tagline: "Halving the search space — on arrays and on the answer itself.",
    description:
      "Go beyond textbook binary search into search-on-answer, rotated arrays, and boundary-finding templates that never off-by-one.",
    status: "coming-soon",
    accent: "violet",
    iconKey: "binary-search",
    difficulty: "Medium",
    lessonCount: 14,
    problemCount: 12,
    durationHours: 7,
    tags: ["Binary Search", "Array", "Search on Answer"],
  },
  {
    slug: "sorting",
    name: "Sorting",
    tagline: "Comparison sorts, counting sorts, and sorting as a pre-processing step.",
    description:
      "Understand the sorting algorithms interviewers expect you to know, and — more importantly — when a sort unlocks an elegant greedy or two-pointer solution.",
    status: "coming-soon",
    accent: "orange",
    iconKey: "sorting",
    difficulty: "Medium",
    lessonCount: 12,
    problemCount: 10,
    durationHours: 6,
    tags: ["Sorting", "Merge Sort", "Quick Sort"],
  },
  {
    slug: "hashmap-hashset",
    name: "HashMap & HashSet",
    tagline: "Trade space for time: constant-time membership and grouping.",
    description:
      "Use hash-based structures to deduplicate, group, and look up in O(1), and learn the patterns that make them the right tool.",
    status: "coming-soon",
    accent: "cyan",
    iconKey: "hashmap",
    difficulty: "Easy",
    lessonCount: 12,
    problemCount: 11,
    durationHours: 6,
    tags: ["HashMap", "HashSet", "Grouping"],
  },
  {
    slug: "linked-list",
    name: "Linked List",
    tagline: "Pointer surgery: reversal, cycle detection, and merging.",
    description:
      "Manipulate nodes without losing the list — reversal in place, fast/slow cycle detection, and clean dummy-head techniques.",
    status: "coming-soon",
    accent: "rose",
    iconKey: "linked-list",
    difficulty: "Medium",
    lessonCount: 13,
    problemCount: 12,
    durationHours: 6,
    tags: ["Linked List", "Two Pointers", "Recursion"],
  },
  {
    slug: "stack",
    name: "Stack",
    tagline: "LIFO thinking: monotonic stacks and expression parsing.",
    description:
      "From balanced-parentheses to the monotonic-stack pattern that answers next-greater-element in a single pass.",
    status: "coming-soon",
    accent: "blue",
    iconKey: "stack",
    difficulty: "Medium",
    lessonCount: 12,
    problemCount: 11,
    durationHours: 6,
    tags: ["Stack", "Monotonic Stack", "Parsing"],
  },
  {
    slug: "queue",
    name: "Queue & Deque",
    tagline: "FIFO and sliding windows with a double-ended queue.",
    description:
      "Model streaming and level-by-level processing, and use a deque to answer sliding-window maximum in linear time.",
    status: "coming-soon",
    accent: "emerald",
    iconKey: "queue",
    difficulty: "Medium",
    lessonCount: 10,
    problemCount: 9,
    durationHours: 5,
    tags: ["Queue", "Deque", "Sliding Window"],
  },
  {
    slug: "tree",
    name: "Trees & BST",
    tagline: "Traversals, recursion, and binary-search-tree invariants.",
    description:
      "DFS and BFS on binary trees, the recursion patterns behind them, and the ordering invariant that makes a BST powerful.",
    status: "coming-soon",
    accent: "emerald",
    iconKey: "tree",
    difficulty: "Medium",
    lessonCount: 18,
    problemCount: 16,
    durationHours: 9,
    tags: ["Tree", "BST", "DFS", "BFS", "Recursion"],
  },
  {
    slug: "trie",
    name: "Trie",
    tagline: "Prefix trees for fast word lookup and autocomplete.",
    description:
      "Build and query prefix trees to power word search, autocomplete, and prefix-matching problems efficiently.",
    status: "coming-soon",
    accent: "violet",
    iconKey: "trie",
    difficulty: "Medium",
    lessonCount: 8,
    problemCount: 7,
    durationHours: 4,
    tags: ["Trie", "Prefix Tree", "String"],
  },
  {
    slug: "heap-priority-queue",
    name: "Heap / Priority Queue",
    tagline: "Always-available min/max: top-k, merging, and scheduling.",
    description:
      "Use heaps to keep the smallest or largest element one pop away — top-k, k-way merge, and streaming-median patterns.",
    status: "coming-soon",
    accent: "orange",
    iconKey: "heap",
    difficulty: "Medium",
    lessonCount: 12,
    problemCount: 11,
    durationHours: 6,
    tags: ["Heap", "Priority Queue", "Top K"],
  },
  {
    slug: "intervals",
    name: "Intervals",
    tagline: "Sort, merge, and sweep overlapping ranges.",
    description:
      "Recognise the interval pattern — sort by start, then merge or sweep — behind meeting rooms, merges, and insertions.",
    status: "coming-soon",
    accent: "cyan",
    iconKey: "intervals",
    difficulty: "Medium",
    lessonCount: 9,
    problemCount: 8,
    durationHours: 4,
    tags: ["Intervals", "Sorting", "Greedy"],
  },
  {
    slug: "sliding-window",
    name: "Sliding Window",
    tagline: "Expand and contract a window for subarray/substring problems.",
    description:
      "Master fixed and variable-size windows that answer longest/shortest-substring problems in a single linear pass, from frequency-map matching to monotonic-deque tricks.",
    status: "published",
    accent: "rose",
    iconKey: "sliding-window",
    difficulty: "Medium",
    lessonCount: 24,
    problemCount: 17,
    durationHours: 11,
    tags: [
      "Sliding Window",
      "Two Pointers",
      "String",
      "Frequency Map",
      "Monotonic Deque",
    ],
  },
  {
    slug: "backtracking",
    name: "Backtracking",
    tagline: "Systematic search: build, recurse, undo.",
    description:
      "Generate permutations, combinations, and subsets — and prune the search tree — with the choose/explore/unchoose template.",
    status: "coming-soon",
    accent: "violet",
    iconKey: "backtracking",
    difficulty: "Hard",
    lessonCount: 14,
    problemCount: 12,
    durationHours: 8,
    tags: ["Backtracking", "Recursion", "DFS"],
  },
  {
    slug: "greedy",
    name: "Greedy Algorithms",
    tagline: "Locally optimal choices that prove globally optimal.",
    description:
      "Learn to spot when a greedy choice is provably correct — and how to argue it — across scheduling, intervals, and jump problems.",
    status: "published",
    accent: "emerald",
    iconKey: "greedy",
    difficulty: "Medium",
    lessonCount: 27,
    problemCount: 21,
    durationHours: 11,
    tags: ["Greedy", "Sorting", "Intervals", "Scheduling", "Heap"],
  },
  {
    slug: "dynamic-programming",
    name: "Dynamic Programming",
    tagline:
      "Identify DP patterns under interview pressure — state, transition, and space optimization.",
    description:
      "A premium, interview-focused DP course: recognise the pattern, derive the state, write the recurrence, and code a clean Java 17 tabulation — from 1D DP to advanced interval and game DP.",
    status: "published",
    accent: "orange",
    iconKey: "dynamic-programming",
    difficulty: "Hard",
    lessonCount: 41,
    problemCount: 30,
    durationHours: 18,
    tags: [
      "Dynamic Programming",
      "Memoization",
      "Tabulation",
      "Knapsack",
      "Grid DP",
      "Sequence DP",
    ],
  },
  {
    slug: "graph-algorithms",
    name: "Graph Algorithms",
    tagline:
      "Intuition-first graph mastery — traversal, union-find, shortest paths, and advanced graphs.",
    description:
      "25 hand-picked graph problems progressing from grid traversal to Tarjan's bridges. Every page teaches the pattern first, then the algorithm, then a clean Java 17 implementation.",
    status: "published",
    accent: "violet",
    iconKey: "graph",
    difficulty: "Hard",
    lessonCount: 25,
    problemCount: 25,
    durationHours: 12,
    tags: [
      "Graph",
      "BFS",
      "DFS",
      "Union Find",
      "Topological Sort",
      "Dijkstra",
    ],
  },
];

export function getTopic(slug: string): DsaTopicMeta | undefined {
  return DSA_TOPICS.find((t) => t.slug === slug);
}

export function publishedTopics(): DsaTopicMeta[] {
  return DSA_TOPICS.filter((t) => t.status === "published");
}

export function comingSoonTopics(): DsaTopicMeta[] {
  return DSA_TOPICS.filter((t) => t.status === "coming-soon");
}

/** Aggregate hub stats derived from the registry. */
export const DSA_TOTALS = {
  topics: DSA_TOPICS.length,
  published: DSA_TOPICS.filter((t) => t.status === "published").length,
  problems: DSA_TOPICS.reduce((n, t) => n + t.problemCount, 0),
  hours: DSA_TOPICS.reduce((n, t) => n + t.durationHours, 0),
};
