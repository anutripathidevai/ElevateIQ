import type { DsaModule } from "../types";

/**
 * The 6 modules of the Linked List course, in learning order. Module 1 is
 * concept lessons (the node mental models and core techniques); modules 2–6
 * are curated interview problems grouped by pattern. Lesson content lives in
 * `data/` keyed by these slugs; the course API joins the two.
 */
export const LL_MODULES: DsaModule[] = [
  {
    id: "ll-fundamentals",
    order: 1,
    title: "Fundamentals",
    summary:
      "The node mental models — singly, doubly, and circular lists — plus the two techniques every problem leans on: the fast/slow pointer and the dummy node.",
    pattern: "Rewire references without losing the list",
    lessonSlugs: [
      "ll-singly-linked-list",
      "ll-doubly-linked-list",
      "ll-circular-linked-list",
      "ll-fast-slow-pointer",
      "ll-dummy-node-pattern",
    ],
  },
  {
    id: "ll-basic-operations",
    order: 2,
    title: "Basic Operations",
    summary:
      "The core moves you compose everywhere: reverse a list, find its middle, merge two sorted lists, and delete nodes cleanly.",
    pattern: "Iterate with prev/curr; splice with a dummy head",
    lessonSlugs: [
      "ll-reverse-linked-list",
      "ll-middle-of-linked-list",
      "ll-merge-two-sorted-lists",
      "ll-remove-linked-list-elements",
    ],
  },
  {
    id: "ll-fast-slow",
    order: 3,
    title: "Fast & Slow Pointer",
    summary:
      "Floyd's tortoise-and-hare: detect cycles, find where a cycle begins, and reframe number problems as linked-list cycles.",
    pattern: "Two speeds meet inside a cycle",
    lessonSlugs: [
      "ll-linked-list-cycle",
      "ll-linked-list-cycle-ii",
      "ll-happy-number",
      "ll-find-duplicate-number",
    ],
  },
  {
    id: "ll-reversal",
    order: 4,
    title: "Reversal Pattern",
    summary:
      "Reverse only part of a list: a sublist between two positions, fixed-size k-groups, and adjacent pairs — all in place.",
    pattern: "Reverse a segment, reconnect the boundaries",
    lessonSlugs: [
      "ll-reverse-linked-list-ii",
      "ll-reverse-nodes-in-k-group",
      "ll-swap-nodes-in-pairs",
    ],
  },
  {
    id: "ll-merge",
    order: 5,
    title: "Merge Pattern",
    summary:
      "Combine and reorder lists: merge k sorted lists with a heap, sort a list in O(n log n), and partition around a pivot value.",
    pattern: "Merge with a dummy head; divide and conquer",
    lessonSlugs: [
      "ll-merge-k-sorted-lists",
      "ll-sort-list",
      "ll-partition-list",
    ],
  },
  {
    id: "ll-advanced",
    order: 6,
    title: "Advanced",
    summary:
      "Pointer-heavy problems that combine hashing and structure design: deep-copy with random pointers, flatten a multilevel list, and design an LFU cache.",
    pattern: "Hash map + careful pointer bookkeeping",
    lessonSlugs: [
      "ll-copy-list-with-random-pointer",
      "ll-flatten-multilevel-doubly-linked-list",
      "ll-lfu-cache",
    ],
  },
];
