import { AI_LABS_CATALOG, AI_LABS_INFO } from "./registry";
import { LAB_CONTENT } from "./content";
import type { Lab, LabContent, LabMeta } from "./types";

/**
 * Read-only query helpers over the AI Labs registry + authored content. Mirrors
 * the content-api pattern used by every other Compile Ready learning module so
 * routes stay thin and never touch the raw catalog arrays directly.
 */

/** All labs in roadmap order. */
export function getLabs(): LabMeta[] {
  return [...AI_LABS_CATALOG].sort((a, b) => a.order - b.order);
}

/** Only labs that are live (authored content + wired demo). */
export function getPublishedLabs(): LabMeta[] {
  return getLabs().filter((lab) => lab.status === "published");
}

/** Metadata for a single lab by slug, or undefined if it doesn't exist. */
export function getLabMeta(slug: string): LabMeta | undefined {
  return AI_LABS_CATALOG.find((lab) => lab.slug === slug);
}

/** Authored content for a single lab by slug, or undefined if not yet authored. */
export function getLabContent(slug: string): LabContent | undefined {
  return LAB_CONTENT[slug];
}

/** Fully-assembled lab (metadata + content) — only returns for published labs. */
export function getLab(slug: string): Lab | undefined {
  const meta = getLabMeta(slug);
  const content = getLabContent(slug);
  if (!meta || !content || meta.status !== "published") return undefined;
  return { meta, content };
}

/** Slugs that should be statically generated (published only). */
export function getPublishedLabSlugs(): string[] {
  return getPublishedLabs().map((lab) => lab.slug);
}

/** Aggregate roadmap facts for the landing hero. */
export function getLabTotals(): {
  total: number;
  published: number;
  comingSoon: number;
  minutes: number;
} {
  const labs = getLabs();
  const published = labs.filter((l) => l.status === "published").length;
  return {
    total: labs.length,
    published,
    comingSoon: labs.length - published,
    minutes: labs.reduce((sum, l) => sum + l.estimatedMinutes, 0),
  };
}

export { AI_LABS_INFO };
