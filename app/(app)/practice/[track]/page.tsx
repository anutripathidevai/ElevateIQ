import { notFound } from "next/navigation";
import type { Difficulty } from "@prisma/client";
import { trackBySlug } from "@/lib/tracks";
import { listProblems, listTagsForTrack } from "@/services/problems";
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

      <ProblemList items={problems} trackSlug={cfg.slug} />
    </div>
  );
}
