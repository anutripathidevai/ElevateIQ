import type { DsaModule } from "../types";

/**
 * The 6 modules of the Sliding Window course, in learning order. Module 1 is
 * concept lessons (the window mental model); modules 2–6 are curated interview
 * problems grouped by pattern. Lesson content lives in `data/` keyed by these
 * slugs; the course API joins the two.
 */
export const SW_MODULES: DsaModule[] = [
  {
    id: "sw-fundamentals",
    order: 1,
    title: "Sliding Window Fundamentals",
    summary:
      "The mental model: fixed vs variable windows, when to expand and when to shrink, and the two-pointer invariant that keeps a window valid.",
    pattern: "Carry window state; slide instead of rebuild",
    lessonSlugs: [
      "sw-fixed-window",
      "sw-variable-window",
      "sw-expanding-window",
      "sw-shrinking-window",
      "sw-two-pointer-relationship",
      "sw-frequency-maps",
      "sw-common-interview-patterns",
    ],
  },
  {
    id: "sw-fixed",
    order: 2,
    title: "Fixed Window",
    summary:
      "A window of constant size k: add the entering element, drop the leaving one, and read the answer at every step.",
    pattern: "Constant-size window: add right, remove left-k",
    lessonSlugs: [
      "sw-maximum-average-subarray-i",
      "sw-maximum-sum-subarray-of-size-k",
      "sw-contains-duplicate-ii",
    ],
  },
  {
    id: "sw-variable",
    order: 3,
    title: "Variable Window",
    summary:
      "Grow the window while it stays valid, then shrink from the left the moment it breaks — the expand/shrink template.",
    pattern: "Expand right; shrink left while invariant is violated",
    lessonSlugs: [
      "sw-longest-substring-without-repeating-characters",
      "sw-longest-repeating-character-replacement",
      "sw-minimum-size-subarray-sum",
      "sw-minimum-window-substring",
    ],
  },
  {
    id: "sw-frequency",
    order: 4,
    title: "Frequency Based Windows",
    summary:
      "Track character or number counts inside the window to match anagrams, permutations, and bounded-distinct constraints.",
    pattern: "Window + frequency map / match counter",
    lessonSlugs: [
      "sw-permutation-in-string",
      "sw-find-all-anagrams-in-a-string",
      "sw-fruit-into-baskets",
    ],
  },
  {
    id: "sw-advanced",
    order: 5,
    title: "Advanced Sliding Window",
    summary:
      "Count windows with an exact property using the atMost(K) minus atMost(K-1) trick, and map binary/parity conditions onto it.",
    pattern: "exactly(K) = atMost(K) - atMost(K-1)",
    lessonSlugs: [
      "sw-subarrays-with-k-different-integers",
      "sw-binary-subarrays-with-sum",
      "sw-count-number-of-nice-subarrays",
      "sw-max-consecutive-ones-iii",
    ],
  },
  {
    id: "sw-premium",
    order: 6,
    title: "Premium Problems",
    summary:
      "Windows that need a monotonic deque to answer max/min in O(1), or a prefix-sum reframing to become a window at all.",
    pattern: "Monotonic deque / complement reframing",
    lessonSlugs: [
      "sw-sliding-window-maximum",
      "sw-longest-continuous-subarray-absolute-diff-limit",
      "sw-minimum-operations-to-reduce-x-to-zero",
    ],
  },
];
