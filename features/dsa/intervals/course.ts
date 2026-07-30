import type { DsaCourseMeta } from "../types";

/** Landing-page metadata for the Intervals course. */
export const INTERVALS_COURSE_META: DsaCourseMeta = {
  topic: "intervals",
  title: "Intervals",
  subtitle:
    "Sort, merge, and sweep overlapping ranges: the one pattern behind meeting rooms, calendars, and range merges.",
  descriptionMD:
    "This is a premium interview-preparation course on the **interval** pattern — the family of problems that model each item as a range with a **start** and an **end**, then ask you to merge, count, schedule, or detect overlaps among those ranges. Interviewers love intervals because a single insight unlocks almost the whole category: **sort by start time (or sometimes by end time), then make one left-to-right sweep**. Once the ranges are in order, overlap becomes a local comparison between the current range and the one you are carrying, and greedy choices that look risky turn out to be provably optimal. This course starts with the mechanics — how to represent an interval, when to sort by start versus end, and exactly what overlap means — then works through curated problems grouped by the patterns interviewers actually test: the merge pattern, resource scheduling with a heap, greedy interval selection, and online interval structures such as booking calendars. Every lesson draws the intervals on a number line, dry-runs a concrete input step by step, and shows a clean Java 17 solution.",
  objectives: [
    "Recognise the interval pattern from phrases like merge, overlap, meeting rooms, or booking.",
    "Decide whether to sort by start time or end time for a given problem and justify it.",
    "Sweep sorted intervals in one pass to merge, count overlaps, or schedule resources.",
    "Design online interval structures (booking calendars, disjoint interval streams).",
  ],
  skills: [
    "Interval representation",
    "Sort-then-sweep",
    "Overlap detection",
    "Greedy interval selection",
    "Heap scheduling",
    "Online interval structures",
  ],
  accent: "cyan",
};
