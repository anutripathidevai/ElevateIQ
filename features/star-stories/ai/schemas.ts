import { z } from "zod";

/**
 * AI I/O contracts for the STAR Story Generator. The input schema validates the
 * user's generation request; the output schema validates the model's JSON so a
 * malformed completion fails loudly instead of corrupting saved stories.
 */

export const starGenerationInputSchema = z.object({
  /** Free-form description of the project / accomplishment to mine for stories. */
  project: z
    .string()
    .trim()
    .min(40, "Add more detail about the project (at least 40 characters).")
    .max(4000, "That's a lot of detail — please trim to 4000 characters."),
  /** Target role, e.g. "Senior Backend Engineer". */
  role: z.string().trim().max(120).optional(),
  /** Target company, used to align leadership principles (e.g. Amazon LPs). */
  company: z.string().trim().max(120).optional(),
  /** How many distinct stories to generate. */
  count: z.number().int().min(1).max(5).default(3),
  /** Optional comma-separated skills/principles to emphasize. */
  focus: z.string().trim().max(300).optional(),
});

export type StarGenerationInput = z.infer<typeof starGenerationInputSchema>;

export const generatedStarStorySchema = z.object({
  title: z.string().min(1),
  situation: z.string().min(1),
  task: z.string().min(1),
  action: z.string().min(1),
  result: z.string().min(1),
  skills: z.array(z.string()).default([]),
  leadershipPrinciples: z.array(z.string()).default([]),
  suggestedQuestions: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

export const starGenerationResultSchema = z.object({
  stories: z.array(generatedStarStorySchema).min(1),
});

export type GeneratedStarStoryDto = z.infer<typeof generatedStarStorySchema>;
