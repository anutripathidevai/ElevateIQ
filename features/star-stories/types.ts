/**
 * Domain types for the AI STAR Story Generator.
 *
 * A STAR story captures a behavioral interview answer in the
 * Situation / Task / Action / Result framework, enriched with the skills and
 * leadership principles it demonstrates plus the behavioral questions it can
 * answer. Stories can be AI-generated from a free-form project description and
 * then saved, edited, duplicated, and reused.
 */

/** The narrative core of a STAR story (shared by generated + persisted stories). */
export interface StarStoryContent {
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  /** Technical / soft skills the story demonstrates. */
  skills: string[];
  /** Leadership principles / values the story maps to (e.g. Amazon LPs). */
  leadershipPrinciples: string[];
  /** Behavioral questions this story is a strong answer to. */
  suggestedQuestions: string[];
}

/** A story freshly returned by the generator, not yet persisted. */
export interface GeneratedStarStory extends StarStoryContent {
  tags: string[];
}

/** A persisted, user-owned story. Dates are ISO strings for RSC serialization. */
export interface StarStory extends StarStoryContent {
  id: string;
  tags: string[];
  /** The free-form project description the story was generated/authored from. */
  sourceProject: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Fields accepted when creating or replacing a story. */
export interface StarStoryInput extends StarStoryContent {
  tags: string[];
  sourceProject: string | null;
}

/**
 * Well-known value frameworks a user can target, so generated leadership
 * principles align with the company they're interviewing at. Free-form values
 * are still allowed — this only drives the prompt and quick-pick UI.
 */
export const AMAZON_LEADERSHIP_PRINCIPLES = [
  "Customer Obsession",
  "Ownership",
  "Invent and Simplify",
  "Are Right, A Lot",
  "Learn and Be Curious",
  "Hire and Develop the Best",
  "Insist on the Highest Standards",
  "Think Big",
  "Bias for Action",
  "Frugality",
  "Earn Trust",
  "Dive Deep",
  "Have Backbone; Disagree and Commit",
  "Deliver Results",
] as const;

/** Ordered field metadata used to render the four STAR sections consistently. */
export const STAR_SECTIONS = [
  { key: "situation", label: "Situation" },
  { key: "task", label: "Task" },
  { key: "action", label: "Action" },
  { key: "result", label: "Result" },
] as const satisfies ReadonlyArray<{
  key: keyof StarStoryContent;
  label: string;
}>;
