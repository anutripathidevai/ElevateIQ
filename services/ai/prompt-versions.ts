/**
 * Central registry of prompt versions.
 *
 * Bump the version string whenever the wording/structure of the corresponding
 * prompt changes. The value is emitted with each AI telemetry event so quality
 * regressions can be correlated to a specific prompt revision. Keeping the
 * versions in one place (rather than scattered constants) means a reviewer can
 * see, at a glance, which prompts exist and when they last changed.
 */
export const PROMPT_VERSIONS = {
  mockOpening: "mock-opening@2026-01",
  mockReply: "mock-reply@2026-01",
  reviewAnswer: "review-answer@2026-01",
  panelOpening: "panel-opening@2026-01",
  panelReply: "panel-reply@2026-01",
  panelScorecard: "panel-scorecard@2026-01",
  aiLabsLlm: "ai-labs-llm@2026-01",
  adaptiveEvaluator: "adaptive-evaluator@2026-02",
  adaptiveInterviewer: "adaptive-interviewer@2026-02",
} as const;

export type PromptVersionKey = keyof typeof PROMPT_VERSIONS;
export type PromptVersion = (typeof PROMPT_VERSIONS)[PromptVersionKey];
