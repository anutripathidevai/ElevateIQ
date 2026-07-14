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
