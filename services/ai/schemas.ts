import { z } from "zod";

export const reviewSectionSchema = z.object({
  title: z.string(),
  rating: z.enum(["good", "ok", "poor"]),
  detail: z.string(),
});

/** Structured AI review, stored on Submission.aiFeedback and rendered in the UI. */
export const reviewSchema = z.object({
  score: z.number().min(0).max(100),
  summary: z.string(),
  sections: z.array(reviewSectionSchema).min(1),
  suggestions: z.array(z.string()),
});

export type ReviewSection = z.infer<typeof reviewSectionSchema>;
export type Review = z.infer<typeof reviewSchema>;
