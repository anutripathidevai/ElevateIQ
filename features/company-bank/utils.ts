import type { Difficulty } from "@prisma/client";
import { matchesQuery, uniqueSorted } from "@/features/shared/utils";
import {
  DIFFICULTY_ORDER,
  EXPERIENCE_ORDER,
  type CompanyQuestion,
  type ExperienceLevel,
  type QuestionCategory,
} from "./types";

export type FacetFilter<T extends string> = T | "ALL";

export interface QuestionFilter {
  search?: string;
  category?: FacetFilter<QuestionCategory>;
  difficulty?: FacetFilter<Difficulty>;
  experienceLevel?: FacetFilter<ExperienceLevel>;
  tag?: string | null;
  bookmarkedOnly?: boolean;
  bookmarkedIds?: ReadonlySet<string>;
}

function facetMatches<T extends string>(
  value: T,
  filter: FacetFilter<T> | undefined,
): boolean {
  return !filter || filter === "ALL" || filter === value;
}

/** Pure, deterministic filter used by both the UI and unit tests. */
export function filterQuestions(
  questions: readonly CompanyQuestion[],
  filter: QuestionFilter = {},
): CompanyQuestion[] {
  const bookmarks = filter.bookmarkedIds;
  return questions.filter((q) => {
    if (!facetMatches(q.category, filter.category)) return false;
    if (!facetMatches(q.difficulty, filter.difficulty)) return false;
    if (!facetMatches(q.experienceLevel, filter.experienceLevel)) return false;
    if (filter.tag && !q.tags.includes(filter.tag)) return false;
    if (filter.bookmarkedOnly && !(bookmarks?.has(q.id) ?? false)) return false;
    if (filter.search) {
      const haystack = `${q.question} ${q.tags.join(" ")}`;
      if (!matchesQuery(haystack, filter.search)) return false;
    }
    return true;
  });
}

/** Stable sort: easiest first, then by seniority, then question text. */
export function sortQuestions(
  questions: readonly CompanyQuestion[],
): CompanyQuestion[] {
  return [...questions].sort(
    (a, b) =>
      DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty] ||
      EXPERIENCE_ORDER[a.experienceLevel] - EXPERIENCE_ORDER[b.experienceLevel] ||
      a.question.localeCompare(b.question),
  );
}

export function collectTags(questions: readonly CompanyQuestion[]): string[] {
  return uniqueSorted(questions.flatMap((q) => q.tags));
}

export function collectCategories(
  questions: readonly CompanyQuestion[],
): QuestionCategory[] {
  return uniqueSorted(questions.map((q) => q.category)) as QuestionCategory[];
}

/** Progress rollup for a set of questions given a status map. */
export function summarizeProgress(
  questions: readonly CompanyQuestion[],
  statusByQuestion: ReadonlyMap<string, "TODO" | "ATTEMPTED" | "SOLVED">,
): { solved: number; attempted: number; total: number; percent: number } {
  let solved = 0;
  let attempted = 0;
  for (const q of questions) {
    const status = statusByQuestion.get(q.id);
    if (status === "SOLVED") solved++;
    else if (status === "ATTEMPTED") attempted++;
  }
  const total = questions.length;
  const percent = total > 0 ? Math.round((solved / total) * 100) : 0;
  return { solved, attempted, total, percent };
}
