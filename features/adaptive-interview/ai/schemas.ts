import { z } from "zod";
import { DIFFICULTIES } from "../types";

/**
 * Zod contracts for the LLM-produced JSON. Validating the model output means a
 * malformed completion fails loudly (and we fall back to the deterministic
 * heuristic) instead of persisting a broken evaluation.
 */

export const competencyAssessmentSchema = z.object({
  competencyId: z.string().min(1),
  score: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1),
  matchedConcepts: z.array(z.string()).default([]),
  evidence: z.array(z.string()).default([]),
  strengths: z.array(z.string()).default([]),
  gaps: z.array(z.string()).default([]),
});

export const answerEvaluationSchema = z.object({
  assessments: z.array(competencyAssessmentSchema).min(1),
});

export type AnswerEvaluationDto = z.infer<typeof answerEvaluationSchema>;

export const nextQuestionSchema = z.object({
  question: z.string().min(1),
  /** Optional echo of the difficulty the model targeted. */
  difficulty: z.enum(DIFFICULTIES).optional(),
});

export type NextQuestionDto = z.infer<typeof nextQuestionSchema>;
