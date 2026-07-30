import { z } from "zod";
import { PERSONA_IDS, VERDICTS } from "../types";

/**
 * Zod contract for the AI-produced panel scorecard. Validating the model's JSON
 * means a malformed completion fails loudly instead of persisting a broken
 * scorecard on the interview record.
 */

const verdictEnum = z.enum(VERDICTS);

export const panelResultSchema = z.object({
  competencyScores: z
    .array(
      z.object({
        competency: z.string().min(1),
        score: z.number().min(1).max(5),
        rationale: z.string().min(1),
      }),
    )
    .min(1),
  interviewerFeedback: z
    .array(
      z.object({
        personaId: z.enum(PERSONA_IDS),
        strengths: z.array(z.string()).default([]),
        improvements: z.array(z.string()).default([]),
        verdict: verdictEnum,
      }),
    )
    .min(1),
  overallRecommendation: z.object({
    decision: verdictEnum,
    summary: z.string().min(1),
  }),
  improvementPlan: z
    .array(z.object({ focus: z.string().min(1), action: z.string().min(1) }))
    .default([]),
});

export type PanelResultDto = z.infer<typeof panelResultSchema>;
