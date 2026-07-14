import { db } from "@/lib/db";
import { isDbConfigured } from "@/lib/env";
import * as content from "@/services/content";
import type { JudgeSpec } from "@/lib/judge/types";
import type { LldSolution } from "@/lib/lld/types";
import type { Difficulty, Prisma, TrackKey } from "@prisma/client";

export interface ProblemListFilter {
  track: TrackKey;
  difficulty?: Difficulty;
  tag?: string;
}

/** Lightweight fields for list views. */
export const problemListSelect = {
  id: true,
  slug: true,
  title: true,
  difficulty: true,
  tags: true,
  track: true,
} satisfies Prisma.ProblemSelect;

export type ProblemListItem = Prisma.ProblemGetPayload<{
  select: typeof problemListSelect;
}>;

export async function listProblems(
  filter: ProblemListFilter,
): Promise<ProblemListItem[]> {
  if (!isDbConfigured) {
    return content
      .contentByTrack(filter.track, {
        difficulty: filter.difficulty,
        tag: filter.tag,
      })
      .map(({ id, slug, title, difficulty, tags, track }) => ({
        id,
        slug,
        title,
        difficulty,
        tags,
        track,
      }));
  }
  return db.problem.findMany({
    where: {
      track: filter.track,
      difficulty: filter.difficulty,
      tags: filter.tag ? { has: filter.tag } : undefined,
    },
    select: problemListSelect,
    orderBy: [{ difficulty: "asc" }, { title: "asc" }],
  });
}

export async function getProblemBySlug(slug: string) {
  if (!isDbConfigured) return content.contentBySlug(slug);
  return db.problem.findUnique({ where: { slug } });
}

/**
 * The in-browser judge spec for a runnable problem (DSA), or null.
 * Works in DB-less guest mode (reads content/*.json) and DB mode alike.
 */
export async function getJudgeSpec(slug: string): Promise<JudgeSpec | null> {
  if (!isDbConfigured) return content.contentBySlug(slug)?.judge ?? null;
  const row = await db.problem.findUnique({
    where: { slug },
    select: { judgeSpec: true },
  });
  return (row?.judgeSpec as unknown as JudgeSpec | undefined) ?? null;
}

/**
 * The structured LLD solution (approach, steps, Java classes, patterns) for a
 * problem, or null. Works in DB-less guest mode and DB mode alike.
 */
export async function getSolution(slug: string): Promise<LldSolution | null> {
  if (!isDbConfigured) return content.contentBySlug(slug)?.solution ?? null;
  const row = await db.problem.findUnique({
    where: { slug },
    select: { solution: true },
  });
  return (row?.solution as unknown as LldSolution | undefined) ?? null;
}

/** Distinct, sorted tags available within a track (for filter chips). */
export async function listTagsForTrack(track: TrackKey): Promise<string[]> {
  if (!isDbConfigured) return content.contentTags(track);
  const rows = await db.problem.findMany({
    where: { track },
    select: { tags: true },
  });
  return Array.from(new Set(rows.flatMap((r) => r.tags))).sort();
}

/** Problem counts per track for landing/dashboard tiles. */
export async function countProblemsByTrack(): Promise<Record<string, number>> {
  if (!isDbConfigured) return content.contentCounts();
  const groups = await db.problem.groupBy({
    by: ["track"],
    _count: { _all: true },
  });
  return Object.fromEntries(groups.map((g) => [g.track, g._count._all]));
}
