/**
 * Candidate-facing copy for the adaptive interview.
 *
 * This module deliberately owns the *only* place that turns an internal planner
 * decision (competency + question kind) into words shown to the candidate. It
 * never mentions scores, thresholds, confidence, or any internal grading signal
 * — during a live interview we explain *what we're focusing on next*, not *how
 * you're doing*. The same helper is reused by the scorecard so the after-the-fact
 * "interview path" reads identically to what the candidate saw live.
 */
import type { QuestionKind } from "./types";

/**
 * A short, encouraging explanation of why the next question was chosen. Safe to
 * show mid-interview: it coaches, it does not reveal the evaluation.
 */
export function describeSelection(
  kind: QuestionKind,
  competencyName: string,
  opts?: { first?: boolean },
): string {
  const name = competencyName;
  if (opts?.first) {
    return `Starting with ${name}, one of the highest-impact areas for this role.`;
  }
  switch (kind) {
    case "probe":
      return `Now exploring ${name} — a new area we haven't covered yet.`;
    case "follow_up":
      return `Going deeper on ${name} to build on what you just described.`;
    case "advance":
      return `You're handling this well — raising the challenge on ${name}.`;
    default:
      return `Next up: ${name}.`;
  }
}

/** One-word label for a question's role in the adaptive path (scorecard only). */
export function selectionKindLabel(kind: QuestionKind): string {
  switch (kind) {
    case "probe":
      return "New area";
    case "follow_up":
      return "Follow-up";
    case "advance":
      return "Stretch";
    default:
      return "Question";
  }
}

/** Suggested answer length/time shown near the composer, tuned by seniority. */
export function answerHint(seniority: string): string {
  switch (seniority) {
    case "junior":
      return "Aim for ~2–3 min. Explain your thinking step by step.";
    case "mid":
      return "Aim for ~3–4 min. Structure your answer and note trade-offs.";
    case "staff":
      return "Aim for ~4–6 min. Frame the problem, then go deep on trade-offs and impact.";
    case "senior":
    default:
      return "Aim for ~3–5 min. Lead with structure, then depth and trade-offs.";
  }
}
