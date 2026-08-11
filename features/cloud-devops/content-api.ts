import type {
  CDArea,
  CDDifficulty,
  CDModule,
  CDModuleContent,
  CDModuleMeta,
  CDQuestion,
} from "./types";
import { CD_MODULES } from "./registry";
import { CD_MODULE_CONTENT } from "./content";
import { CD_QUESTIONS } from "./questions";

/**
 * Public API for the Cloud, DevOps & Production Engineering module. The landing
 * page and the dynamic `[module]` / `questions` routes consume only these
 * helpers, so the content model (registry + content files + question bank) can
 * evolve without touching UI/routing code.
 */

// ---- Module access ---------------------------------------------------------

/** All module metadata, in reading order. */
export function getModules(): CDModuleMeta[] {
  return [...CD_MODULES].sort((a, b) => a.order - b.order);
}

/** Published modules only (those with authored content). */
export function getPublishedModules(): CDModuleMeta[] {
  return getModules().filter((m) => m.status === "published");
}

/** Metadata for a single module by slug. */
export function getModuleMeta(slug: string): CDModuleMeta | undefined {
  return CD_MODULES.find((m) => m.slug === slug);
}

/** Authored content for a single module by slug (undefined if coming-soon). */
export function getModuleContent(slug: string): CDModuleContent | undefined {
  return CD_MODULE_CONTENT[slug];
}

/** Fully-assembled module (meta + content), or undefined if not published. */
export function getModule(slug: string): CDModule | undefined {
  const meta = getModuleMeta(slug);
  const content = getModuleContent(slug);
  if (!meta || !content) return undefined;
  return { meta, content };
}

// ---- Question bank access --------------------------------------------------

/** The full question bank, in authored order. */
export function getQuestions(): CDQuestion[] {
  return CD_QUESTIONS;
}

/** A single question by id. */
export function getQuestion(id: string): CDQuestion | undefined {
  return CD_QUESTIONS.find((q) => q.id === id);
}

export interface CDQuestionFilters {
  query?: string;
  area?: CDArea | "All";
  difficulty?: CDDifficulty | "All";
}

/** Apply the question bank's search + facet filters. */
export function filterQuestions(
  questions: CDQuestion[],
  filters: CDQuestionFilters,
): CDQuestion[] {
  const q = filters.query?.trim().toLowerCase() ?? "";
  return questions.filter((item) => {
    if (filters.area && filters.area !== "All" && item.area !== filters.area)
      return false;
    if (
      filters.difficulty &&
      filters.difficulty !== "All" &&
      item.difficulty !== filters.difficulty
    )
      return false;
    if (!q) return true;
    const haystack = [item.question, item.area, item.difficulty, ...item.tags]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

/** Count of questions per area (drives the area filter counts). */
export function getAreaCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const q of CD_QUESTIONS) counts[q.area] = (counts[q.area] ?? 0) + 1;
  return counts;
}

// ---- Aggregate stats -------------------------------------------------------

export interface CDTotals {
  modules: number;
  publishedModules: number;
  questions: number;
  technologies: number;
}

export function getTotals(): CDTotals {
  return {
    modules: CD_MODULES.length,
    publishedModules: CD_MODULES.filter((m) => m.status === "published").length,
    questions: CD_QUESTIONS.length,
    technologies: 11,
  };
}

// ---- Reading time ----------------------------------------------------------

/**
 * Estimate reading time in minutes for a module by counting words across every
 * Markdown field at ~200 wpm (min 1 minute).
 */
export function estimateReadingMinutes(content: CDModuleContent): number {
  const parts: string[] = [
    content.introMD,
    content.coreFlow?.body ?? "",
    ...content.seniorFocus,
    ...content.concepts.flatMap((c) => [
      c.title,
      c.whatMD,
      c.howMD ?? "",
      c.diagram?.body ?? "",
      ...c.interviewPoints,
      c.realWorldMD ?? "",
      ...(c.interviewQuestions ?? []),
    ]),
    ...(content.scenarios ?? []).flatMap((s) => [
      s.symptomsMD,
      ...s.whatToCheck,
      ...s.possibleCauses,
      s.resolutionMD,
      s.preventionMD,
    ]),
    ...content.keyTakeaways,
  ];
  const words = parts.join(" ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
