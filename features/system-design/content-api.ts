import type {
  SDCategory,
  SDCompany,
  SDDifficulty,
  SDQuestion,
  SDQuestionContent,
  SDQuestionMeta,
  SDTierId,
} from "./types";
import { SD_CATALOG, SD_TIERS } from "./registry";
import { SD_CONTENT } from "./questions";

/**
 * Public API for the System Design (HLD) module. The dashboard and the dynamic
 * `[question]` route consume only these helpers, so the content model (registry
 * + content files) can evolve without touching UI/routing code.
 */

// ---- Catalog access --------------------------------------------------------

/** All question metadata, in catalog order. */
export function getCatalog(): SDQuestionMeta[] {
  return SD_CATALOG;
}

/** All published questions (i.e. those with authored content). */
export function getPublishedCatalog(): SDQuestionMeta[] {
  return SD_CATALOG.filter((q) => q.status === "published");
}

/** Metadata for a single question by slug. */
export function getQuestionMeta(slug: string): SDQuestionMeta | undefined {
  return SD_CATALOG.find((q) => q.slug === slug);
}

/** Authored content for a single question by slug (undefined if coming-soon). */
export function getQuestionContent(
  slug: string,
): SDQuestionContent | undefined {
  return SD_CONTENT[slug];
}

/** Fully-assembled question (meta + content), or undefined if not published. */
export function getQuestion(slug: string): SDQuestion | undefined {
  const meta = getQuestionMeta(slug);
  const content = getQuestionContent(slug);
  if (!meta || !content) return undefined;
  return { meta, content };
}

// ---- Tier grouping ---------------------------------------------------------

export interface SDTierGroup {
  tier: (typeof SD_TIERS)[number];
  questions: SDQuestionMeta[];
}

/** Questions grouped by learning-path tier, tiers in display order. */
export function getTierGroups(
  questions: SDQuestionMeta[] = SD_CATALOG,
): SDTierGroup[] {
  return [...SD_TIERS]
    .sort((a, b) => a.order - b.order)
    .map((tier) => ({
      tier,
      questions: questions
        .filter((q) => q.tier === tier.id)
        .sort((a, b) => b.addedOrder - a.addedOrder),
    }));
}

// ---- Aggregate stats -------------------------------------------------------

export interface SDTotals {
  total: number;
  published: number;
  companies: number;
  categories: number;
}

export function getTotals(): SDTotals {
  const companies = new Set<SDCompany>();
  const categories = new Set<SDCategory>();
  for (const q of SD_CATALOG) {
    q.companies.forEach((c) => companies.add(c));
    q.categories.forEach((c) => categories.add(c));
  }
  return {
    total: SD_CATALOG.length,
    published: SD_CATALOG.filter((q) => q.status === "published").length,
    companies: companies.size,
    categories: categories.size,
  };
}

// ---- Filtering & sorting (used by the dashboard) ---------------------------

export type SDSort = "newest" | "popular" | "difficulty" | "frequency";

export interface SDFilters {
  query?: string;
  difficulty?: SDDifficulty | "All";
  category?: SDCategory | "All";
  company?: SDCompany | "All";
  tier?: SDTierId | "All";
  tag?: string | "All";
}

const DIFFICULTY_RANK: Record<SDDifficulty, number> = {
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

/** Apply the dashboard's search + facet filters to a list of questions. */
export function filterQuestions(
  questions: SDQuestionMeta[],
  filters: SDFilters,
): SDQuestionMeta[] {
  const q = filters.query?.trim().toLowerCase() ?? "";
  return questions.filter((item) => {
    if (
      filters.difficulty &&
      filters.difficulty !== "All" &&
      item.difficulty !== filters.difficulty
    )
      return false;
    if (
      filters.category &&
      filters.category !== "All" &&
      !item.categories.includes(filters.category)
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
      ...item.categories,
      ...item.companies,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

/** Sort questions by the chosen dashboard sort mode (returns a new array). */
export function sortQuestions(
  questions: SDQuestionMeta[],
  sort: SDSort,
): SDQuestionMeta[] {
  const copy = [...questions];
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
  for (const q of SD_CATALOG) q.tags.forEach((t) => tags.add(t));
  return [...tags].sort((a, b) => a.localeCompare(b));
}

// ---- Reading time ----------------------------------------------------------

/**
 * Estimate reading time in minutes for authored content by counting words
 * across every Markdown field at ~200 wpm (min 1 minute).
 */
export function estimateReadingMinutes(content: SDQuestionContent): number {
  const parts: string[] = [
    content.statementMD,
    content.businessUseCaseMD,
    ...content.functionalRequirements,
    ...content.nonFunctionalRequirements.map((d) => d.detailMD),
    content.capacityEstimation.assumptionsMD,
    content.capacityEstimation.calculationsMD,
    ...content.apiDesign.endpoints.map((e) => e.descriptionMD),
    content.databaseDesign.schemaMD,
    ...content.requestFlow.map((s) => s.detailMD),
    ...content.coreComponents.map((c) => c.detailMD),
    ...content.deepDives.map((d) => d.detailMD),
    ...content.scaling.map((s) => s.detailMD),
    ...content.bottlenecks.map((b) => b.optimizationMD),
    ...content.failureHandling.map((f) => f.strategyMD),
    ...content.security.map((s) => s.detailMD),
    content.tradeoffs.alternativesMD,
    content.tradeoffs.whenNotToUseMD,
    ...content.followUpQuestions.map((f) => f.answerMD),
    ...content.companyVariations.map((c) => c.angleMD),
    content.interviewTips.communicationMD,
    content.revisionNotesMD,
    content.cheatSheetMD,
  ];
  const words = parts.join(" ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
