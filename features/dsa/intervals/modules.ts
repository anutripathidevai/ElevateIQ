import type { DsaModule } from "../types";

/**
 * The 5 modules of the Intervals course, in learning order. Module 1 is concept
 * lessons (interval mechanics); modules 2–5 are curated interview problems
 * grouped by pattern. Lesson content lives in `data/` keyed by these slugs; the
 * course API joins the two.
 */
export const INTERVALS_MODULES: DsaModule[] = [
  {
    id: "intervals-fundamentals",
    order: 1,
    title: "Interval Fundamentals",
    summary:
      "How to represent an interval, why sorting comes first, exactly what overlap means, and the merge strategy that powers the whole category.",
    pattern: "Sort by start, then sweep left to right",
    lessonSlugs: [
      "iv-interval-representation",
      "iv-sorting-intervals",
      "iv-overlapping-intervals",
      "iv-merge-strategy",
    ],
  },
  {
    id: "intervals-merge",
    order: 2,
    title: "Merge Pattern",
    summary:
      "Combine overlapping ranges into a minimal set of disjoint intervals — the canonical sort-then-sweep problems.",
    pattern: "Carry one interval; extend on overlap, else emit",
    lessonSlugs: [
      "iv-merge-intervals",
      "iv-insert-interval",
      "iv-non-overlapping-intervals",
    ],
  },
  {
    id: "intervals-scheduling",
    order: 3,
    title: "Scheduling Pattern",
    summary:
      "Allocate and reuse resources across overlapping intervals, tracking the earliest free time with a heap.",
    pattern: "Sort by start; a min-heap of end times frees resources",
    lessonSlugs: [
      "iv-meeting-rooms",
      "iv-meeting-rooms-ii",
      "iv-employee-free-time",
    ],
  },
  {
    id: "intervals-greedy",
    order: 4,
    title: "Greedy Interval Pattern",
    summary:
      "Select or cover intervals optimally by sorting on the right key and making a provably correct greedy choice.",
    pattern: "Sort by end (or start); keep the range that leaves the most room",
    lessonSlugs: [
      "iv-minimum-arrows-burst-balloons",
      "iv-remove-covered-intervals",
      "iv-interval-list-intersections",
    ],
  },
  {
    id: "intervals-advanced",
    order: 5,
    title: "Advanced Intervals",
    summary:
      "Online interval structures: booking calendars that reject conflicts and a stream that coalesces into disjoint intervals.",
    pattern: "Maintain sorted intervals incrementally as queries arrive",
    lessonSlugs: [
      "iv-my-calendar-i",
      "iv-my-calendar-ii",
      "iv-data-stream-disjoint-intervals",
    ],
  },
];
