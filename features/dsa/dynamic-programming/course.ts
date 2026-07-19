import type { DsaCourseMeta } from "../types";

/** Landing-page metadata for the Dynamic Programming course. */
export const DP_COURSE_META: DsaCourseMeta = {
  topic: "dynamic-programming",
  title: "Dynamic Programming",
  subtitle:
    "Learn to identify Dynamic Programming patterns under interview pressure — not a generic DP tutorial.",
  descriptionMD:
    "This is a premium interview-preparation course built around one goal: teaching you to **recognise** a DP problem the moment you see it, derive its state, and write the recurrence — then implement a clean, bottom-up Java 17 solution. You will start with the mental model (overlapping subproblems, optimal substructure, memoization vs tabulation) and then work through curated problems grouped by the patterns interviewers actually test: 1D, grid, sequence, knapsack, decision, string, and advanced interval / game DP.",
  objectives: [
    "Recognise the tell-tale signs of a DP problem: choices, overlapping subproblems, and optimal substructure.",
    "Derive the state definition and state transition (recurrence) systematically from a recursive formulation.",
    "Convert top-down memoization into bottom-up tabulation and then into space-optimized DP.",
    "Communicate your approach the way senior and staff interviewers expect: state, transition, complexity.",
  ],
  skills: [
    "Pattern recognition",
    "State design",
    "Memoization",
    "Tabulation",
    "Space optimization",
    "Interval & game DP",
  ],
  accent: "orange",
};
