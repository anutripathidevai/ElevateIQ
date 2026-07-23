import type { DsaModule } from "../types";

/**
 * The 6 modules of the Heap / Priority Queue course, in learning order. Module
 * 1 is concept lessons (heap mechanics); modules 2–6 are curated interview
 * problems grouped by pattern. Lesson content lives in `data/` keyed by these
 * slugs; the course API joins the two.
 */
export const HEAP_MODULES: DsaModule[] = [
  {
    id: "heap-fundamentals",
    order: 1,
    title: "Heap Fundamentals",
    summary:
      "How a binary heap works: min vs max heaps, the priority queue abstraction, and the sift/heapify operations that build one in O(n).",
    pattern: "Keep the extreme element at the root",
    lessonSlugs: [
      "heap-min-heap",
      "heap-max-heap",
      "heap-priority-queue",
      "heap-heapify",
      "heap-build-heap",
    ],
  },
  {
    id: "heap-top-k",
    order: 2,
    title: "Top K Pattern",
    summary:
      "The workhorse pattern: hold a fixed-size heap of k elements so the k-th best is always at the root.",
    pattern: "Size-k heap; evict the worst as you scan",
    lessonSlugs: [
      "heap-kth-largest-element",
      "heap-top-k-frequent-elements",
      "heap-k-closest-points",
      "heap-k-closest-elements",
    ],
  },
  {
    id: "heap-merge",
    order: 3,
    title: "Merge Pattern",
    summary:
      "Merge k sorted sequences by always pulling the smallest current head from a heap of size k.",
    pattern: "Heap of one candidate per list",
    lessonSlugs: [
      "heap-merge-k-sorted-lists",
      "heap-smallest-range",
    ],
  },
  {
    id: "heap-scheduling",
    order: 4,
    title: "Scheduling Pattern",
    summary:
      "Greedy scheduling where a heap tracks the next resource to free up or the most urgent task to run.",
    pattern: "Heap orders events or tasks by priority",
    lessonSlugs: [
      "heap-meeting-rooms-ii",
      "heap-task-scheduler",
      "heap-single-threaded-cpu",
    ],
  },
  {
    id: "heap-median",
    order: 5,
    title: "Median Pattern",
    summary:
      "Balance a max-heap of the lower half against a min-heap of the upper half so the median sits at the two roots.",
    pattern: "Two heaps split around the middle",
    lessonSlugs: [
      "heap-find-median-data-stream",
      "heap-sliding-window-median",
    ],
  },
  {
    id: "heap-advanced",
    order: 6,
    title: "Advanced Heap",
    summary:
      "Greedy problems where a heap turns an exponential search into a series of locally optimal O(log n) choices.",
    pattern: "Greedy choice maintained by a heap",
    lessonSlugs: [
      "heap-ipo",
      "heap-furthest-building",
      "heap-min-cost-hire-k-workers",
    ],
  },
];
