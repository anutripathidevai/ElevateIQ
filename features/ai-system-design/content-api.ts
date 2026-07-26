import type {
  AISDCompany,
  AISDDifficulty,
  AISDLesson,
  AISDLessonContent,
  AISDLessonMeta,
  AISDTierId,
  AISDTopic,
} from "./types";
import { AISD_CATALOG, AISD_TIERS } from "./registry";
import { AISD_CONTENT } from "./questions";

/**
 * Public API for the AI System Design module. The dashboard and the dynamic
 * `[lesson]` route consume only these helpers, so the content model (registry
 * + content files) can evolve without touching UI/routing code.
 */

// ---- Catalog access --------------------------------------------------------

/** All lesson metadata, in catalog order. */
export function getCatalog(): AISDLessonMeta[] {
  return AISD_CATALOG;
}

/** All published lessons (i.e. those with authored content). */
export function getPublishedCatalog(): AISDLessonMeta[] {
  return AISD_CATALOG.filter((q) => q.status === "published");
}

/** Metadata for a single lesson by slug. */
export function getLessonMeta(slug: string): AISDLessonMeta | undefined {
  return AISD_CATALOG.find((q) => q.slug === slug);
}

/** Authored content for a single lesson by slug (undefined if coming-soon). */
export function getLessonContent(slug: string): AISDLessonContent | undefined {
  return AISD_CONTENT[slug];
}

/** Fully-assembled lesson (meta + content), or undefined if not published. */
export function getLesson(slug: string): AISDLesson | undefined {
  const meta = getLessonMeta(slug);
  const content = getLessonContent(slug);
  if (!meta || !content) return undefined;
  return { meta, content };
}

// ---- Tier grouping ---------------------------------------------------------

export interface AISDTierGroup {
  tier: (typeof AISD_TIERS)[number];
  lessons: AISDLessonMeta[];
}

/** Lessons grouped by learning-path tier, tiers in display order. */
export function getTierGroups(
  lessons: AISDLessonMeta[] = AISD_CATALOG,
): AISDTierGroup[] {
  return [...AISD_TIERS]
    .sort((a, b) => a.order - b.order)
    .map((tier) => ({
      tier,
      lessons: lessons
        .filter((q) => q.tier === tier.id)
        .sort((a, b) => b.addedOrder - a.addedOrder),
    }));
}

// ---- Aggregate stats -------------------------------------------------------

export interface AISDTotals {
  total: number;
  published: number;
  companies: number;
  topics: number;
}

export function getTotals(): AISDTotals {
  const companies = new Set<AISDCompany>();
  const topics = new Set<AISDTopic>();
  for (const q of AISD_CATALOG) {
    q.companies.forEach((c) => companies.add(c));
    q.topics.forEach((t) => topics.add(t));
  }
  return {
    total: AISD_CATALOG.length,
    published: AISD_CATALOG.filter((q) => q.status === "published").length,
    companies: companies.size,
    topics: topics.size,
  };
}

// ---- Filtering & sorting (used by the dashboard) ---------------------------

export type AISDSort = "newest" | "popular" | "difficulty" | "frequency";

export interface AISDFilters {
  query?: string;
  difficulty?: AISDDifficulty | "All";
  topic?: AISDTopic | "All";
  company?: AISDCompany | "All";
  tier?: AISDTierId | "All";
  tag?: string | "All";
}

const DIFFICULTY_RANK: Record<AISDDifficulty, number> = {
  Beginner: 0,
  Intermediate: 1,
  Advanced: 2,
};

const FREQUENCY_RANK: Record<string, number> = {
  "Very High": 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

/** Apply the dashboard's search + facet filters to a list of lessons. */
export function filterLessons(
  lessons: AISDLessonMeta[],
  filters: AISDFilters,
): AISDLessonMeta[] {
  const q = filters.query?.trim().toLowerCase() ?? "";
  return lessons.filter((item) => {
    if (
      filters.difficulty &&
      filters.difficulty !== "All" &&
      item.difficulty !== filters.difficulty
    )
      return false;
    if (
      filters.topic &&
      filters.topic !== "All" &&
      !item.topics.includes(filters.topic)
    )
      return false;
    if (
      filters.company &&
      filters.company !== "All" &&
      !item.companies.includes(filters.company)
    )
      return false;
    if (filters.tier && filters.tier !== "All" && item.tier !== filters.tier)
      return false;
    if (filters.tag && filters.tag !== "All" && !item.tags.includes(filters.tag))
      return false;
    if (!q) return true;
    const haystack = [
      item.title,
      item.summary,
      ...item.tags,
      ...item.topics,
      ...item.companies,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

/** Sort lessons by the chosen dashboard sort mode (returns a new array). */
export function sortLessons(
  lessons: AISDLessonMeta[],
  sort: AISDSort,
): AISDLessonMeta[] {
  const copy = [...lessons];
  switch (sort) {
    case "popular":
      return copy.sort((a, b) => b.popularity - a.popularity);
    case "difficulty":
      return copy.sort(
        (a, b) => DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty],
      );
    case "frequency":
      return copy.sort(
        (a, b) => FREQUENCY_RANK[a.frequency] - FREQUENCY_RANK[b.frequency],
      );
    case "newest":
    default:
      return copy.sort((a, b) => b.addedOrder - a.addedOrder);
  }
}

/** Distinct tags across the catalog, alphabetically sorted. */
export function getAllTags(): string[] {
  const tags = new Set<string>();
  for (const q of AISD_CATALOG) q.tags.forEach((t) => tags.add(t));
  return [...tags].sort((a, b) => a.localeCompare(b));
}

// ---- Reading time ----------------------------------------------------------

/**
 * Estimate reading time in minutes for authored content by counting words
 * across every Markdown field at ~200 wpm (min 1 minute).
 */
export function estimateReadingMinutes(content: AISDLessonContent): number {
  const parts: string[] = [
    content.introductionMD,
    content.realWorldMD,
    ...content.learningObjectives,
    ...content.theory.map((d) => d.detailMD),
    content.architectureNotesMD ?? "",
    ...content.requestFlow.map((s) => s.detailMD),
    ...content.deepDives.map((d) => d.detailMD),
    ...content.productionConsiderations.map((d) => d.detailMD),
    ...content.interview.whatInterviewersLookFor,
    ...content.interview.followUps.map((f) => f.answerMD),
    ...content.interview.alternativeDesigns.map((a) => a.detailMD),
    ...content.interview.commonMistakes,
    ...content.interviewHints,
    ...content.handsOn.map((h) => h.detailMD),
    content.decisionGuideMD ?? "",
    content.cheatSheetMD,
  ];
  const words = parts.join(" ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
