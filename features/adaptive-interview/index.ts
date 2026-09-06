/**
 * Adaptive Mock Interview — public module surface.
 *
 * A competency-scored, adaptive interview layered on the existing Mock Interview:
 * each answer is evaluated server-side against a per-(track, seniority) rubric,
 * the next question is selected from the weakest / least-proven competency, and a
 * final scorecard aggregates the evaluations with learning recommendations.
 *
 * Reuses the Phase-1 AI reliability + observability wrappers and persists all
 * state in the existing MockInterview.summary column (no schema migration).
 */
export * from "./types";
export {
  getFramework,
  getCompetency,
  competencyIds,
  TRACK_COMPETENCIES,
} from "./competencies";
export {
  selectNext,
  aggregateState,
  detectGaps,
  nextDifficulty,
  WEAK_THRESHOLD,
  STRONG_THRESHOLD,
} from "./planner";
export { buildScorecard, recommendTopics } from "./scorecard";
export {
  evaluateAnswer,
  heuristicEvaluateAnswer,
  type EvaluateArgs,
} from "./ai/evaluator";
export {
  generateAdaptiveQuestion,
  heuristicQuestion,
} from "./ai/interviewer";
export {
  startAdaptiveInterview,
  submitAdaptiveAnswer,
  finalizeAdaptiveInterview,
  type SubmitResult,
} from "./service";
export { AdaptiveInterview } from "./components/adaptive-interview";
export { AdaptiveScorecardView } from "./components/adaptive-scorecard";
