import type { DsaModule } from "../types";

/**
 * The 7 modules of the Greedy Algorithms course, in learning order. Module 1 is
 * concept lessons (the greedy mental model and correctness arguments); modules
 * 2–7 are curated interview problems grouped by pattern. Lesson content lives in
 * `data/` keyed by these slugs; the course API joins the two.
 */
export const GREEDY_MODULES: DsaModule[] = [
  {
    id: "greedy-fundamentals",
    order: 1,
    title: "Greedy Fundamentals",
    summary:
      "The mental model: what makes a greedy choice safe, and how to prove it with an exchange argument before writing any code.",
    pattern: "Greedy-choice property + optimal substructure",
    lessonSlugs: [
      "greedy-what-is-greedy",
      "greedy-greedy-choice-property",
      "greedy-optimal-substructure",
      "greedy-exchange-argument",
      "greedy-vs-dynamic-programming",
      "greedy-common-interview-patterns",
    ],
  },
  {
    id: "greedy-intervals",
    order: 2,
    title: "Interval Greedy",
    summary:
      "Sort by start or end, then sweep — the interval family behind merging, overlap removal, and point covering.",
    pattern: "Sort by endpoint, then sweep and compare boundaries",
    lessonSlugs: [
      "greedy-merge-intervals",
      "greedy-non-overlapping-intervals",
      "greedy-insert-interval",
      "greedy-minimum-arrows-burst-balloons",
    ],
  },
  {
    id: "greedy-scheduling",
    order: 3,
    title: "Scheduling",
    summary:
      "Order events by the right key — start, end, or deadline — to pack the most work into limited time or resources.",
    pattern: "Sort by deadline/end, allocate with a heap or counter",
    lessonSlugs: [
      "greedy-meeting-rooms",
      "greedy-meeting-rooms-ii",
      "greedy-task-scheduler",
      "greedy-maximum-events-attended",
    ],
  },
  {
    id: "greedy-array",
    order: 4,
    title: "Array Greedy",
    summary:
      "Track a single running best — farthest reach, running balance, or local demand — in one linear pass.",
    pattern: "Maintain a running frontier / balance in one sweep",
    lessonSlugs: [
      "greedy-jump-game",
      "greedy-jump-game-ii",
      "greedy-gas-station",
      "greedy-candy",
    ],
  },
  {
    id: "greedy-string",
    order: 5,
    title: "String Greedy",
    summary:
      "Use last-occurrence and frequency information to cut, prune, or arrange characters optimally.",
    pattern: "Last-occurrence boundaries + monotonic stack / frequency",
    lessonSlugs: [
      "greedy-partition-labels",
      "greedy-remove-duplicate-letters",
      "greedy-reorganize-string",
    ],
  },
  {
    id: "greedy-heap",
    order: 6,
    title: "Heap + Greedy",
    summary:
      "Let a priority queue undo or upgrade earlier greedy choices, keeping the best feasible set at every step.",
    pattern: "Greedy selection with a heap to swap out the worst pick",
    lessonSlugs: [
      "greedy-course-schedule-iii",
      "greedy-furthest-building",
      "greedy-ipo",
    ],
  },
  {
    id: "greedy-advanced",
    order: 7,
    title: "Advanced Greedy",
    summary:
      "Non-obvious sort keys and two-pointer pairings that turn a hard construction into a clean linear or log-linear pass.",
    pattern: "Clever sort order + insertion / two-pointer pairing",
    lessonSlugs: [
      "greedy-queue-reconstruction-by-height",
      "greedy-hand-of-straights",
      "greedy-boats-to-save-people",
    ],
  },
];
