import type { DsaCourseMeta } from "../types";

/** Landing-page metadata for the Greedy Algorithms course. */
export const GREEDY_COURSE_META: DsaCourseMeta = {
  topic: "greedy",
  title: "Greedy Algorithms",
  subtitle:
    "Learn to recognise when a locally optimal choice is provably globally optimal — and how to argue it under interview pressure.",
  descriptionMD:
    "This is a premium interview-preparation course built around the single hardest skill in greedy problems: **knowing when greedy is correct**. Anyone can sort an array and grab the best-looking option; the interview signal is being able to say *why* that choice can never block the optimum. You will start with the mental model — the greedy-choice property, optimal substructure, and the exchange argument — and then work through curated problems grouped by the patterns interviewers actually test: interval greedy, scheduling, array reachability, string construction, heap-assisted greedy, and advanced sorting-based greedy. Every problem teaches the insight first, proves the greedy choice, then shows a clean Java 17 implementation.",
  objectives: [
    "Recognise the tell-tale signs of a greedy problem and distinguish them from problems that require dynamic programming.",
    "Justify a greedy choice with an informal exchange argument — the proof interviewers listen for.",
    "Apply the core greedy templates: sort-then-sweep intervals, earliest-deadline scheduling, farthest-reach arrays, and heap-assisted selection.",
    "Communicate correctness the way senior and staff interviewers expect: greedy insight, why it works, complexity.",
  ],
  skills: [
    "Greedy-choice property",
    "Exchange argument",
    "Interval sweeping",
    "Scheduling",
    "Heap-assisted greedy",
    "Correctness proofs",
  ],
  accent: "emerald",
};
