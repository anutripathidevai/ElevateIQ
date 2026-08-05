import {
  BrainCircuit,
  Boxes,
  Code2,
  Layers,
  Network,
  type LucideIcon,
} from "lucide-react";
import type { SearchResult } from "@/lib/types";
import { publishedTopics } from "@/features/dsa/registry";
import { SD_CATALOG } from "@/features/system-design/registry";
import { LLD_CATALOG } from "@/features/lld/registry";
import { GENAI_CATALOG } from "@/features/generative-ai/registry";
import { availableLanguages } from "@/features/languages/registry";

/**
 * Aggregates every published learning item across all tracks (DSA, System
 * Design, LLD, Generative AI, Programming Languages) into flat search results.
 *
 * This is the single source that makes the learning corpus discoverable from the
 * global search. It is derived directly from each track's registry, so new
 * content becomes searchable automatically with no changes here. Only metadata
 * (title + slug + status) is read — no heavy content modules are imported — so
 * this stays cheap to include in the client bundle.
 */

const TRACK_ICON: Record<string, LucideIcon> = {
  DSA: Layers,
  "System Design": Network,
  "Low Level Design": Boxes,
  "Generative AI": BrainCircuit,
  "Programming Languages": Code2,
};

export function buildLearningSearchIndex(): SearchResult[] {
  const dsa: SearchResult[] = publishedTopics().map((topic) => ({
    id: `dsa:${topic.slug}`,
    label: topic.name,
    category: "DSA",
    href: `/learning/dsa/${topic.slug}`,
    icon: TRACK_ICON["DSA"],
  }));

  const systemDesign: SearchResult[] = SD_CATALOG.filter(
    (q) => q.status === "published",
  ).map((q) => ({
    id: `sd:${q.slug}`,
    label: q.title,
    category: "System Design",
    href: `/learning/system-design/${q.slug}`,
    icon: TRACK_ICON["System Design"],
  }));

  const lld: SearchResult[] = LLD_CATALOG.filter(
    (item) => item.status === "published",
  ).map((item) => ({
    id: `lld:${item.slug}`,
    label: item.title,
    category: "Low Level Design",
    href: `/learning/lld/${item.slug}`,
    icon: TRACK_ICON["Low Level Design"],
  }));

  const genai: SearchResult[] = GENAI_CATALOG.filter(
    (lesson) => lesson.status === "published",
  ).map((lesson) => ({
    id: `genai:${lesson.slug}`,
    label: lesson.title,
    category: "Generative AI",
    href: `/learning/generative-ai/${lesson.slug}`,
    icon: TRACK_ICON["Generative AI"],
  }));

  const languages: SearchResult[] = availableLanguages().map((lang) => ({
    id: `lang:${lang.slug}`,
    label: `${lang.name} Course`,
    category: "Programming Languages",
    href: `/learning/languages/${lang.slug}`,
    icon: TRACK_ICON["Programming Languages"],
  }));

  return [...dsa, ...systemDesign, ...lld, ...genai, ...languages];
}

/** Prebuilt learning index (module-level, computed once). */
export const LEARNING_SEARCH_INDEX: SearchResult[] = buildLearningSearchIndex();
