import { z } from "zod";
import type { Difficulty } from "@prisma/client";

/**
 * Seniority target for a question. This is content-only metadata (it lives in
 * the question JSON, not a database column), so the feature module owns the type
 * rather than importing it from Prisma.
 */
export const EXPERIENCE_LEVELS = [
  "INTERN",
  "ENTRY",
  "MID",
  "SENIOR",
  "STAFF",
  "PRINCIPAL",
] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

/**
 * Domain types for the Company Question Bank. Reference questions are authored
 * in `content/companies/*.json`, one file per company, and validated against the
 * Zod schemas below at load time so malformed content fails loudly.
 */

export const QUESTION_CATEGORIES = [
  "CODING",
  "SYSTEM_DESIGN",
  "BEHAVIORAL",
  "DOMAIN",
] as const;
export type QuestionCategory = (typeof QUESTION_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  CODING: "Coding",
  SYSTEM_DESIGN: "System Design",
  BEHAVIORAL: "Behavioral",
  DOMAIN: "CS Fundamentals",
};

export const DIFFICULTY_ORDER: Record<Difficulty, number> = {
  EASY: 0,
  MEDIUM: 1,
  HARD: 2,
};

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  INTERN: "Intern",
  ENTRY: "Entry (L3 / SDE I)",
  MID: "Mid (L4 / SDE II)",
  SENIOR: "Senior (L5 / SDE III)",
  STAFF: "Staff (L6)",
  PRINCIPAL: "Principal (L7+)",
};

export const EXPERIENCE_ORDER: Record<ExperienceLevel, number> = {
  INTERN: 0,
  ENTRY: 1,
  MID: 2,
  SENIOR: 3,
  STAFF: 4,
  PRINCIPAL: 5,
};

export interface RelatedResource {
  label: string;
  url: string;
}

/** A single, fully-resolved interview question (company fields injected). */
export interface CompanyQuestion {
  id: string;
  company: string;
  companySlug: string;
  category: QuestionCategory;
  difficulty: Difficulty;
  experienceLevel: ExperienceLevel;
  tags: string[];
  question: string;
  /** Markdown model answer / grading notes. */
  expectedAnswer: string;
  hints: string[];
  followUps: string[];
  resources: RelatedResource[];
}

export interface CompanySummary {
  slug: string;
  name: string;
  /** Short accent glyph (e.g. first letter) for the card. */
  glyph: string;
  blurb: string;
  questionCount: number;
  categories: QuestionCategory[];
}

// --- Content validation ----------------------------------------------------

const difficultyEnum = z.enum(["EASY", "MEDIUM", "HARD"]);
const experienceEnum = z.enum(EXPERIENCE_LEVELS);

export const rawQuestionSchema = z.object({
  id: z.string().min(1),
  category: z.enum(QUESTION_CATEGORIES),
  difficulty: difficultyEnum,
  experienceLevel: experienceEnum,
  tags: z.array(z.string()).default([]),
  question: z.string().min(1),
  expectedAnswer: z.string().min(1),
  hints: z.array(z.string()).default([]),
  followUps: z.array(z.string()).default([]),
  resources: z
    .array(z.object({ label: z.string(), url: z.string() }))
    .default([]),
});

export const companyFileSchema = z.object({
  company: z.string().min(1),
  slug: z.string().min(1),
  glyph: z.string().min(1).optional(),
  blurb: z.string().default(""),
  questions: z.array(rawQuestionSchema),
});

export type RawQuestion = z.infer<typeof rawQuestionSchema>;
export type CompanyFile = z.infer<typeof companyFileSchema>;
