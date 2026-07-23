import type { DsaCourseMeta } from "../types";

/** Landing-page metadata for the Heap / Priority Queue course. */
export const HEAP_COURSE_META: DsaCourseMeta = {
  topic: "heap-priority-queue",
  title: "Heap / Priority Queue",
  subtitle:
    "Keep the best element one pop away: top-k, k-way merge, scheduling, and streaming medians.",
  descriptionMD:
    "This is a premium interview-preparation course on the **heap** — the data structure that keeps the smallest (or largest) element always one **O(log n)** pop away, without paying to keep everything sorted. In interviews it hides behind a family of recognisable phrases: **k-th largest**, **top k**, **k closest**, **merge k lists**, **schedule to minimise time**, and **running median**. The moment you hear one of those, a **priority queue** is usually the answer. This course starts with the mechanics — how a binary heap is stored in an array, how sift-up and sift-down maintain the heap property, and why building a heap is O(n) rather than O(n log n) — then works through curated problems grouped by the patterns interviewers actually test: fixed-size top-k heaps, k-way merges, greedy scheduling, the two-heap median trick, and advanced greedy-with-a-heap. Every lesson visualises the heap as both a tree and its backing array, dry-runs a concrete sequence of pushes and pops, and shows a clean Java 17 solution built on PriorityQueue.",
  objectives: [
    "Recognise the top-k, k-way-merge, scheduling, and median patterns and reach for a heap.",
    "Choose a min-heap vs a max-heap (and a fixed size k) to hit the target complexity.",
    "Explain the array layout, sift-up/sift-down, and why build-heap is O(n).",
    "Balance two heaps to answer streaming-median queries in O(log n) per element.",
  ],
  skills: [
    "Binary heap mechanics",
    "PriorityQueue in Java",
    "Top-K selection",
    "K-way merge",
    "Greedy scheduling",
    "Two-heap median",
  ],
  accent: "orange",
};
