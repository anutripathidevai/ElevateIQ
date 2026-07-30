import type {
  LLDCategory,
  LLDCompany,
  LLDConcept,
  LLDConceptContent,
  LLDDifficulty,
  LLDFrequency,
  LLDPattern,
  LLDProblem,
  LLDProblemContent,
  LLDProblemMeta,
  LLDTierId,
} from "./types";
import { LLD_CATALOG, LLD_TIERS } from "./registry";
import { LLD_CONCEPT_CONTENT, LLD_PROBLEM_CONTENT } from "./content";

/**
 * Public API for the Low Level Design (LLD) module. The dashboard and the
 * dynamic `[problem]` route consume only these helpers, so the content model
 * (registry + content files) can evolve without touching UI/routing code.
 */

// ---- Catalog access --------------------------------------------------------

/** All entry metadata, in catalog order. */
export function getCatalog(): LLDProblemMeta[] {
  return LLD_CATALOG;
}

/** All published entries (i.e. those with authored content). */
export function getPublishedCatalog(): LLDProblemMeta[] {
  return LLD_CATALOG.filter((q) => q.status === "published");
}

/** Metadata for a single entry by slug. */
export function getMeta(slug: string): LLDProblemMeta | undefined {
  return LLD_CATALOG.find((q) => q.slug === slug);
}

/** Authored problem content by slug (undefined if concept / coming-soon). */
export function getProblemContent(slug: string): LLDProblemContent | undefined {
  return LLD_PROBLEM_CONTENT[slug];
}

/** Authored concept content by slug (undefined if problem / coming-soon). */
export function getConceptContent(slug: string): LLDConceptContent | undefined {
  return LLD_CONCEPT_CONTENT[slug];
}

/** Fully-assembled problem (meta + content), or undefined if not published. */
export function getProblem(slug: string): LLDProblem | undefined {
  const meta = getMeta(slug);
  const content = getProblemContent(slug);
  if (!meta || !content || meta.kind !== "problem") return undefined;
  return { meta, content };
}

/** Fully-assembled concept (meta + content), or undefined if not published. */
export function getConcept(slug: string): LLDConcept | undefined {
  const meta = getMeta(slug);
  const content = getConceptContent(slug);
  if (!meta || !content || meta.kind !== "concept") return undefined;
  return { meta, content };
}

/** Whether an entry has authored content of the correct kind for its slug. */
export function isPublished(slug: string): boolean {
  const meta = getMeta(slug);
  if (!meta) return false;
  return meta.kind === "concept"
    ? Boolean(LLD_CONCEPT_CONTENT[slug])
    : Boolean(LLD_PROBLEM_CONTENT[slug]);
}

// ---- Tier grouping ---------------------------------------------------------

export interface LLDTierGroup {
  tier: (typeof LLD_TIERS)[number];
  entries: LLDProblemMeta[];
}

/** Entries grouped by learning-path tier, tiers in display order. */
export function getTierGroups(
  entries: LLDProblemMeta[] = LLD_CATALOG,
): LLDTierGroup[] {
  return [...LLD_TIERS]
    .sort((a, b) => a.order - b.order)
    .map((tier) => ({
      tier,
      entries: entries
        .filter((q) => q.tier === tier.id)
        .sort((a, b) => b.addedOrder - a.addedOrder),
    }));
}

// ---- Aggregate stats -------------------------------------------------------

export interface LLDTotals {
  total: number;
  published: number;
  companies: number;
  patterns: number;
}

export function getTotals(): LLDTotals {
  const companies = new Set<LLDCompany>();
  const patterns = new Set<LLDPattern>();
  for (const q of LLD_CATALOG) {
    q.companies.forEach((c) => companies.add(c));
    q.patterns.forEach((p) => patterns.add(p));
  }
  return {
    total: LLD_CATALOG.length,
    published: LLD_CATALOG.filter((q) => q.status === "published").length,
    companies: companies.size,
    patterns: patterns.size,
  };
}

// ---- Filtering & sorting (used by the dashboard) ---------------------------

export type LLDSort = "newest" | "popular" | "difficulty" | "frequency";

export interface LLDFilters {
  query?: string;
  difficulty?: LLDDifficulty | "All";
  category?: LLDCategory | "All";
  company?: LLDCompany | "All";
  pattern?: LLDPattern | "All";
  tier?: LLDTierId | "All";
}

const DIFFICULTY_RANK: Record<LLDDifficulty, number> = {
  Beginner: 0,
  Intermediate: 1,
  Advanced: 2,
  Expert: 3,
};

const FREQUENCY_RANK: Record<LLDFrequency, number> = {
  "Very High": 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

/** Apply the dashboard's search + facet filters to a list of entries. */
export function filterProblems(
  entries: LLDProblemMeta[],
  filters: LLDFilters,
): LLDProblemMeta[] {
  const q = filters.query?.trim().toLowerCase() ?? "";
  return entries.filter((item) => {
    if (
      filters.difficulty &&
      filters.difficulty !== "All" &&
      item.difficulty !== filters.difficulty
    )
      return false;
    if (
      filters.category &&
      filters.category !== "All" &&
      item.category !== filters.category
    )
      return false;
    if (
      filters.company &&
      filters.company !== "All" &&
      !item.companies.includes(filters.company)
    )
      return false;
    if (
      filters.pattern &&
      filters.pattern !== "All" &&
      !item.patterns.includes(filters.pattern)
    )
      return false;
    if (filters.tier && filters.tier !== "All" && item.tier !== filters.tier)
      return false;
    if (!q) return true;
    const haystack = [
      item.title,
      item.summary,
      ...item.tags,
      item.category,
      ...item.companies,
      ...item.patterns,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

/** Sort entries by the chosen dashboard sort mode (returns a new array). */
export function sortProblems(
  entries: LLDProblemMeta[],
  sort: LLDSort,
): LLDProblemMeta[] {
  const copy = [...entries];
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
  for (const q of LLD_CATALOG) q.tags.forEach((t) => tags.add(t));
  return [...tags].sort((a, b) => a.localeCompare(b));
}

/**
 * Recommended next problems: published entries the learner is most likely to
 * want next, ranked by popularity. Excludes the given slugs (e.g. already
 * viewed/bookmarked).
 */
export function getRecommended(
  exclude: string[] = [],
  limit = 3,
): LLDProblemMeta[] {
  const skip = new Set(exclude);
  return getPublishedCatalog()
    .filter((q) => !skip.has(q.slug))
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

// ---- Reading time ----------------------------------------------------------

function countWords(parts: (string | undefined)[]): number {
  return parts
    .filter(Boolean)
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

/** Estimate reading time (minutes, ~200 wpm) for a problem's prose + code. */
export function estimateProblemMinutes(content: LLDProblemContent): number {
  const parts: (string | undefined)[] = [
    content.statementMD,
    content.businessContextMD,
    ...content.functionalRequirements,
    ...content.nonFunctionalRequirements.map((d) => d.detailMD),
    ...content.requirementClarification.map((c) => c.answerMD),
    ...content.entities.map((e) => e.responsibilityMD),
    ...content.patternsUsed.map((p) => p.whyMD),
    ...content.designSteps.map((s) => s.detailMD),
    ...content.implementation.map((f) => f.content),
    ...content.classExplanations.map((c) => c.detailMD),
    ...content.extensibility.map((e) => e.detailMD),
    ...content.alternativeDesigns.map((a) => a.detailMD),
    ...content.followUps.map((f) => f.answerMD),
    ...content.productionConsiderations.map((p) => p.detailMD),
    content.complexityNotesMD,
    content.cheatSheetMD,
  ];
  return Math.max(1, Math.round(countWords(parts) / 200));
}

/** Estimate reading time (minutes, ~200 wpm) for a concept's prose. */
export function estimateConceptMinutes(content: LLDConceptContent): number {
  const parts: (string | undefined)[] = [
    content.introMD,
    ...content.learningObjectives,
    ...content.theory.map((t) => t.detailMD),
    ...content.bestPractices,
    ...content.commonMistakes,
    content.cheatSheetMD,
  ];
  return Math.max(1, Math.round(countWords(parts) / 200));
}
