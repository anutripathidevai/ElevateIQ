import { z } from "zod";

/** Body of POST /api/problems/[slug]/review */
export const reviewRequestSchema = z.object({
  language: z.string().max(40).optional(),
  content: z
    .string()
    .trim()
    .min(1, "Please provide your answer before requesting a review.")
    .max(20000, "Answer is too long."),
});
export type ReviewRequest = z.infer<typeof reviewRequestSchema>;

/** Body of POST /api/mock/[id]/message */
export const mockMessageSchema = z.object({
  message: z.string().trim().min(1).max(4000),
});

export const trackKeySchema = z.enum([
  "DSA",
  "SYSTEM_DESIGN",
  "LLD",
  "BEHAVIORAL",
]);

/** Body of POST /api/ai-labs/llm — the LLM Playground (Lab 1) run request. */
export const aiLabsLlmSchema = z.object({
  systemPrompt: z.string().max(4000).optional(),
  userPrompt: z
    .string()
    .trim()
    .min(1, "Enter a prompt to run.")
    .max(8000, "Prompt is too long."),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().min(16).max(4096).optional(),
});
export type AiLabsLlmRequest = z.infer<typeof aiLabsLlmSchema>;
