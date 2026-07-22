import type { DsaCourseMeta } from "../types";

/** Landing-page metadata for the Sliding Window course. */
export const SW_COURSE_META: DsaCourseMeta = {
  topic: "sliding-window",
  title: "Sliding Window",
  subtitle:
    "Turn quadratic subarray and substring scans into a single linear pass by carrying a window instead of rebuilding it.",
  descriptionMD:
    "This is a premium interview-preparation course built around one insight: when a problem asks about the best contiguous subarray or substring, you rarely need to re-examine a range from scratch. A **sliding window** carries just enough state — a running sum, a frequency map, a monotonic deque — and updates it in O(1) as the window moves, collapsing an O(n^2) brute force into O(n). You will start with the mental model (fixed vs variable windows, when to expand and when to shrink, and the two-pointer relationship), then work through curated problems grouped by the patterns interviewers actually test: fixed windows, variable windows, frequency-driven windows, the exactly-K trick, and premium deque and prefix-hybrid problems. Every lesson identifies the pattern first, visualises the window, then shows a clean Java 17 implementation.",
  objectives: [
    "Recognise the sliding-window signal: contiguous subarray/substring plus a monotone feasibility condition.",
    "Choose the right window shape — fixed size, or variable with an expand/shrink invariant.",
    "Maintain window state in O(1): running aggregates, frequency maps, and monotonic deques.",
    "Apply the atMost(K) - atMost(K-1) trick to count windows with an exact property.",
  ],
  skills: [
    "Fixed & variable windows",
    "Two pointers",
    "Frequency maps",
    "Monotonic deque",
    "Exactly-K counting",
    "Amortised analysis",
  ],
  accent: "rose",
};
