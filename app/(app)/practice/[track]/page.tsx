import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import type { Difficulty } from "@prisma/client";
import { trackBySlug } from "@/lib/tracks";
import { listProblems, listTagsForTrack } from "@/services/problems";
import { DSA_TOTALS } from "@/features/dsa";
import { FilterBar } from "@/components/practice/filter-bar";
import { ProblemList } from "@/components/practice/problem-list";

export const dynamic = "force-dynamic";

const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;

function parseDifficulty(value?: string): Difficulty | undefined {
  return DIFFICULTIES.includes(value as Difficulty)
    ? (value as Difficulty)
    : undefined;
}

export async function generateMetadata({
  params,
}: {
  params: { track: string };
}) {
  const cfg = trackBySlug(params.track);
  return { title: cfg ? cfg.title : "Practice" };
}

export default async function TrackListPage({
  params,
  searchParams,
}: {
  params: { track: string };
  searchParams: { difficulty?: string; tag?: string };
}) {
  const cfg = trackBySlug(params.track);
  if (!cfg) notFound();

  const difficulty = parseDifficulty(searchParams.difficulty);
  const tag = searchParams.tag || undefined;

  const [problems, tags] = await Promise.all([
    listProblems({ track: cfg.key, difficulty, tag }),
    listTagsForTrack(cfg.key),
  ]);

  const Icon = cfg.icon;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <Icon className={`h-6 w-6 ${cfg.accent}`} />
          <h1 className="text-2xl font-bold">{cfg.title}</h1>
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {cfg.description}
        </p>
      </header>

      <FilterBar tags={tags} />

      {cfg.key === "DSA" && (
        <Link
          href="/learning/dsa"
          className="group flex items-center gap-4 rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/15 to-violet-500/0 p-4 transition-colors hover:border-violet-500/50"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/15">
            <Layers className="h-6 w-6 text-violet-400" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">DSA Learning Hub</h2>
              <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-xs font-medium text-violet-300">
                New
              </span>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Structured, intuition-first courses across {DSA_TOTALS.topics}{" "}
              DSA topics — including Dynamic Programming and Graph Algorithms —
              with Java&nbsp;17 solutions, dry runs, and interview tips.
            </p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-violet-400 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}

      <ProblemList items={problems} trackSlug={cfg.slug} />
    </div>
  );
}
