/**
 * Rich content for the "Coming Soon" pages of unpublished DSA topics. Keyed by
 * topic slug. Each entry drives the polished coming-soon page (overview, why it
 * matters, expected coverage, interview relevance, estimates). Adding a topic's
 * coming-soon detail is a pure data change — no UI edits required.
 *
 * If a topic has no entry here, the coming-soon page falls back to the registry
 * `description` and sensible defaults, so the app never breaks on a new topic.
 */
export interface ComingSoonContent {
  /** Longer overview paragraph (Markdown, no backticks — use **bold**). */
  overviewMD: string;
  /** Why mastering this topic matters (Markdown). */
  whyItMattersMD: string;
  /** Bulleted list of what the course will cover. */
  expectedCoverage: string[];
  /** How the topic shows up in interviews (Markdown). */
  interviewRelevanceMD: string;
}

export const COMING_SOON_CONTENT: Record<string, ComingSoonContent> = {
  arrays: {
    overviewMD:
      "Arrays and hashing are the first tools you reach for and the foundation of nearly every other pattern. This course covers in-place manipulation, prefix and suffix sums, frequency counting, and the hash-map tricks that turn nested loops into single passes.",
    whyItMattersMD:
      "Roughly a third of all coding-interview questions are array or hashing problems, and the techniques here — **prefix sums**, **frequency maps**, **two-pass scans** — reappear inside harder topics like sliding window, intervals, and dynamic programming.",
    expectedCoverage: [
      "In-place array transformations and the two-pass technique",
      "Prefix and suffix sums for range queries",
      "Frequency maps and grouping with hashing",
      "Kadane's algorithm and running aggregates",
      "Common patterns: Two Sum, Product of Array Except Self, Subarray Sum",
    ],
    interviewRelevanceMD:
      "Expect at least one array or hashing warm-up in almost every screen. Interviewers use them to check that you can reach an optimal solution quickly and reason about **time-space trade-offs**.",
  },
  "two-pointers": {
    overviewMD:
      "The two-pointer pattern uses a pair of indices moving through a sequence to replace a quadratic brute force with a single linear pass. You'll learn converging pointers, fast/slow pointers, and partitioning.",
    whyItMattersMD:
      "Two pointers is one of the highest-leverage patterns: once you recognise it, an **O(n²)** solution collapses to **O(n)** with **O(1)** extra space — exactly the optimisation interviewers are looking for.",
    expectedCoverage: [
      "Converging pointers on sorted arrays",
      "Fast and slow pointers for cycle detection",
      "Partitioning and the Dutch national flag problem",
      "Pair, triplet, and container problems",
      "Patterns: Two Sum II, 3Sum, Trapping Rain Water",
    ],
    interviewRelevanceMD:
      "Two-pointer problems are a staple of phone screens and often the **follow-up optimisation** an interviewer expects after your first brute-force attempt.",
  },
  "binary-search": {
    overviewMD:
      "Binary search is more than finding a value in a sorted array. This course covers boundary-finding templates, search-on-answer, and rotated-array variants that never produce an off-by-one.",
    whyItMattersMD:
      "Binary search turns **O(n)** scans into **O(log n)** and, via search-on-answer, cracks optimisation problems that look nothing like search. A reliable template removes the boundary bugs that sink candidates.",
    expectedCoverage: [
      "The canonical lower-bound / upper-bound template",
      "Search on the answer (minimise the maximum, etc.)",
      "Rotated and mountain arrays",
      "Binary search on floating-point answers",
      "Patterns: Koko Eating Bananas, Search in Rotated Sorted Array",
    ],
    interviewRelevanceMD:
      "When an input is sorted or a problem asks for the **minimum feasible value**, interviewers expect binary search. Getting the boundaries right on the whiteboard is a strong signal.",
  },
  sorting: {
    overviewMD:
      "Sorting is both an algorithm to know and a pre-processing step that unlocks elegant solutions. You'll implement the classic comparison sorts and learn when a sort is the key insight.",
    whyItMattersMD:
      "Knowing **merge sort** and **quick sort** cold is table stakes, but the real skill is recognising that sorting first makes a greedy or two-pointer solution obvious.",
    expectedCoverage: [
      "Merge sort, quick sort, and their trade-offs",
      "Counting and bucket sort for bounded inputs",
      "Custom comparators and stability",
      "Sorting as a setup for greedy and intervals",
      "Patterns: Merge Intervals, Largest Number, Sort Colors",
    ],
    interviewRelevanceMD:
      "Interviewers probe whether you know each sort's **complexity and stability**, and whether you can spot that sorting simplifies the problem in front of you.",
  },
  "hashmap-hashset": {
    overviewMD:
      "Hash-based structures give constant-time membership, counting, and grouping. This course shows how to trade space for time and when a hash map is the right tool.",
    whyItMattersMD:
      "A hash map is often the difference between **O(n²)** and **O(n)**. Knowing when it's worth the extra space — and when a sort is cleaner — is a core interview judgement call.",
    expectedCoverage: [
      "Frequency counting and anagram grouping",
      "Set membership for de-duplication and cycles",
      "Hashing composite keys and coordinates",
      "Collision behaviour and load factor at a high level",
      "Patterns: Group Anagrams, Longest Consecutive Sequence",
    ],
    interviewRelevanceMD:
      "Hashing shows up everywhere as the optimisation step. Interviewers expect you to reach for it naturally and articulate the **space cost** you're accepting.",
  },
  "linked-list": {
    overviewMD:
      "Linked lists test whether you can manipulate pointers without losing the list. You'll master in-place reversal, cycle detection, and the dummy-head technique.",
    whyItMattersMD:
      "Pointer manipulation is a distinct skill from array indexing. Clean **dummy-head** and **fast/slow pointer** techniques prevent the null-pointer bugs that trip up candidates under pressure.",
    expectedCoverage: [
      "In-place reversal (iterative and recursive)",
      "Fast/slow pointers for cycle detection and midpoints",
      "Merging and partitioning lists",
      "The dummy-head pattern for clean edge handling",
      "Patterns: Reverse Linked List, LRU Cache, Reorder List",
    ],
    interviewRelevanceMD:
      "Linked-list questions are a favourite for testing **careful pointer bookkeeping**. Interviewers watch how you handle the head, the tail, and the empty-list edge cases.",
  },
  stack: {
    overviewMD:
      "The stack's LIFO discipline solves matching, parsing, and next-greater-element problems. The star of this course is the monotonic stack.",
    whyItMattersMD:
      "The **monotonic stack** answers next-greater / next-smaller queries in a single **O(n)** pass — an optimisation that feels like magic until you internalise it.",
    expectedCoverage: [
      "Balanced parentheses and expression evaluation",
      "Monotonic increasing / decreasing stacks",
      "Next greater element and daily temperatures",
      "Histogram and rectangle problems",
      "Patterns: Valid Parentheses, Largest Rectangle in Histogram",
    ],
    interviewRelevanceMD:
      "When a problem involves **nearest larger/smaller** elements or nested structure, interviewers expect a stack — ideally a monotonic one.",
  },
  queue: {
    overviewMD:
      "Queues and deques model FIFO processing and sliding windows. You'll use a double-ended queue to answer sliding-window maximum in linear time.",
    whyItMattersMD:
      "A **monotonic deque** solves sliding-window extremes in **O(n)**, and queues are the backbone of BFS and level-order traversal you'll reuse in trees and graphs.",
    expectedCoverage: [
      "Queue vs deque and their operations",
      "BFS and level-order processing",
      "Monotonic deque for sliding-window maximum",
      "Circular queues and design problems",
      "Patterns: Sliding Window Maximum, Design Circular Queue",
    ],
    interviewRelevanceMD:
      "Deque-based window problems are a common **medium/hard** filter. Interviewers look for the linear-time deque insight rather than a heap.",
  },
  tree: {
    overviewMD:
      "Trees are where recursion clicks. This course covers DFS and BFS traversals, the recursion patterns behind them, and the ordering invariant that makes a BST powerful.",
    whyItMattersMD:
      "Tree problems appear in nearly every on-site. The **return-value recursion** pattern you learn here generalises directly to dynamic programming on trees.",
    expectedCoverage: [
      "Pre/in/post-order and level-order traversal",
      "Recursion that returns aggregated subtree information",
      "BST insert, search, and validation",
      "Lowest common ancestor and path problems",
      "Patterns: Diameter of Binary Tree, Validate BST, Serialize/Deserialize",
    ],
    interviewRelevanceMD:
      "Interviewers use trees to test **clean recursion** and base-case reasoning. Expect at least one tree question in most on-site loops.",
  },
  trie: {
    overviewMD:
      "A trie (prefix tree) stores strings by shared prefixes for fast lookup and autocomplete. You'll build one from scratch and apply it to word problems.",
    whyItMattersMD:
      "When a problem involves many **prefix queries** or word dictionaries, a trie beats repeated string scans and is the expected data structure.",
    expectedCoverage: [
      "Trie node design and insertion",
      "Prefix and full-word search",
      "Wildcard and pattern matching",
      "Combining tries with DFS/backtracking on grids",
      "Patterns: Implement Trie, Word Search II, Design Add and Search Words",
    ],
    interviewRelevanceMD:
      "Tries are a **medium/hard** signal. Recognising that a dictionary of words should be a trie — not a hash set — is exactly what interviewers reward.",
  },
  "heap-priority-queue": {
    overviewMD:
      "A heap keeps the smallest or largest element one pop away. This course covers top-k, k-way merge, and the two-heap streaming-median pattern.",
    whyItMattersMD:
      "Heaps turn 'find the k largest' from a sort into an **O(n log k)** streaming solution, and the two-heap trick answers running-median queries interviewers love.",
    expectedCoverage: [
      "Heap operations and heapify",
      "Top-k elements and k-th largest",
      "K-way merge with a min-heap",
      "Two heaps for running median",
      "Patterns: Kth Largest Element, Merge K Sorted Lists, Find Median from Data Stream",
    ],
    interviewRelevanceMD:
      "Whenever a problem says **top k**, **k-th**, or **median of a stream**, interviewers expect a heap and will probe your complexity analysis.",
  },
  intervals: {
    overviewMD:
      "Interval problems are about overlapping ranges. The pattern is almost always: sort by start, then merge or sweep. You'll learn to apply it fluently.",
    whyItMattersMD:
      "A single insight — **sort, then sweep** — solves the entire interval family. Interviewers use these problems to check that you spot the pattern quickly.",
    expectedCoverage: [
      "Merging and inserting intervals",
      "Detecting overlaps and counting rooms",
      "Sweep-line and event processing",
      "Interval scheduling as a greedy problem",
      "Patterns: Merge Intervals, Meeting Rooms II, Non-overlapping Intervals",
    ],
    interviewRelevanceMD:
      "Interval questions are a frequent **medium** filter. The expected solution is nearly always sort-then-merge, so recognition speed matters.",
  },
  "sliding-window": {
    overviewMD:
      "The sliding-window pattern maintains a moving range over a sequence to answer longest/shortest-substring problems in a single pass. You'll master fixed and variable windows.",
    whyItMattersMD:
      "Sliding window converts many **O(n²)** substring scans into **O(n)**. Knowing when to grow versus shrink the window is the core skill.",
    expectedCoverage: [
      "Fixed-size windows and running aggregates",
      "Variable windows with a validity condition",
      "Windows with a frequency map",
      "At-most-k / exactly-k counting trick",
      "Patterns: Longest Substring Without Repeating Characters, Minimum Window Substring",
    ],
    interviewRelevanceMD:
      "Substring and subarray optimisation problems almost always want a sliding window. Interviewers watch for a clean **grow/shrink** invariant.",
  },
  backtracking: {
    overviewMD:
      "Backtracking explores a search tree by making a choice, recursing, and undoing it. You'll learn the choose/explore/unchoose template and how to prune.",
    whyItMattersMD:
      "The **choose / explore / unchoose** template generates permutations, combinations, and subsets uniformly — and pruning it is what separates a passing solution from a timeout.",
    expectedCoverage: [
      "The universal backtracking template",
      "Subsets, permutations, and combinations",
      "Constraint propagation and pruning",
      "Grid backtracking (word search, sudoku)",
      "Patterns: Subsets, Combination Sum, N-Queens, Word Search",
    ],
    interviewRelevanceMD:
      "Backtracking is a **hard** on-site favourite. Interviewers look for a clean template, correct state restoration, and thoughtful pruning.",
  },
  greedy: {
    overviewMD:
      "Greedy algorithms make the locally optimal choice at each step. The hard part is knowing when that choice is provably globally optimal — this course teaches you to argue it.",
    whyItMattersMD:
      "Greedy solutions are short and fast, but only correct when you can **justify the exchange argument**. Interviewers reward candidates who prove correctness rather than guess.",
    expectedCoverage: [
      "Greedy-choice property and exchange arguments",
      "Interval scheduling and activity selection",
      "Jump and reachability problems",
      "Greedy vs dynamic programming — how to tell",
      "Patterns: Jump Game, Gas Station, Partition Labels",
    ],
    interviewRelevanceMD:
      "Interviewers use greedy problems to see if you can **prove** a strategy works. A correct greedy with a crisp justification is a strong signal.",
  },
};

export function comingSoonContent(slug: string): ComingSoonContent | undefined {
  return COMING_SOON_CONTENT[slug];
}
