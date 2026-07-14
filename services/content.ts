/**
 * File-backed problem provider used when no database is configured
 * (local dev / demo mode). Reads the curated banks from content/*.json and
 * shapes them exactly like the Prisma `Problem` model so the services layer
 * can swap between DB and file sources transparently.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Difficulty, TrackKey } from "@prisma/client";
import type { JudgeSpec } from "@/lib/judge/types";
import type { LldSolution } from "@/lib/lld/types";

export interface ProblemRecord {
  id: string;
  track: TrackKey;
  slug: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  statementMD: string;
  constraints: string | null;
  hints: string[];
  referenceSolution: string | null;
  judge: JudgeSpec | null;
  solution: LldSolution | null;
  createdAt: Date;
}

const SOURCES: { file: string; track: TrackKey }[] = [
  { file: "dsa.json", track: "DSA" },
  { file: "system-design.json", track: "SYSTEM_DESIGN" },
  { file: "lld.json", track: "LLD" },
  { file: "behavioral.json", track: "BEHAVIORAL" },
];

const DIFF_RANK: Record<Difficulty, number> = { EASY: 0, MEDIUM: 1, HARD: 2 };

type RawProblem = {
  slug: string;
  title: string;
  difficulty: Difficulty;
  tags?: string[];
  statementMD: string;
  constraints?: string;
  hints?: string[];
  referenceSolution?: string;
  judge?: JudgeSpec;
  solution?: LldSolution;
};

let cache: ProblemRecord[] | null = null;

function load(): ProblemRecord[] {
  if (cache) return cache;
  const dir = join(process.cwd(), "content");
  const all: ProblemRecord[] = [];
  for (const { file, track } of SOURCES) {
    let items: RawProblem[] = [];
    try {
      items = JSON.parse(readFileSync(join(dir, file), "utf8")) as RawProblem[];
    } catch {
      items = [];
    }
    for (const p of items) {
      all.push({
        id: p.slug,
        track,
        slug: p.slug,
        title: p.title,
        difficulty: p.difficulty,
        tags: p.tags ?? [],
        statementMD: p.statementMD,
        constraints: p.constraints ?? null,
        hints: p.hints ?? [],
        referenceSolution: p.referenceSolution ?? null,
        judge: p.judge ?? null,
        solution: p.solution ?? null,
        createdAt: new Date(0),
      });
    }
  }
  cache = all;
  return all;
}

export function contentByTrack(
  track: TrackKey,
  opts?: { difficulty?: Difficulty; tag?: string },
): ProblemRecord[] {
  let items = load().filter((p) => p.track === track);
  if (opts?.difficulty) items = items.filter((p) => p.difficulty === opts.difficulty);
  if (opts?.tag) items = items.filter((p) => p.tags.includes(opts.tag!));
  return items.sort(
    (a, b) =>
      DIFF_RANK[a.difficulty] - DIFF_RANK[b.difficulty] ||
      a.title.localeCompare(b.title),
  );
}

export function contentBySlug(slug: string): ProblemRecord | null {
  return load().find((p) => p.slug === slug) ?? null;
}

export function contentTags(track: TrackKey): string[] {
  const tags = new Set<string>();
  for (const p of load()) if (p.track === track) p.tags.forEach((t) => tags.add(t));
  return Array.from(tags).sort();
}

export function contentCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of load()) counts[p.track] = (counts[p.track] ?? 0) + 1;
  return counts;
}
