"use client";

import { ScoreRing } from "@/components/blocks/primitives";
import { useSolvedSet } from "@/lib/progress-store";

/**
 * Overall track progress ring. Counts how many authored problems the learner has
 * marked solved and shows it as a percentage of all planned problems (25).
 */
export function TrackProgress({
  authoredSlugs,
  plannedCount,
}: {
  authoredSlugs: string[];
  plannedCount: number;
}) {
  const solved = useSolvedSet();
  const done = authoredSlugs.filter((s) => solved.has(s)).length;
  const pct = plannedCount ? Math.round((done / plannedCount) * 100) : 0;

  return (
    <div className="flex items-center gap-4">
      <ScoreRing value={pct} accent="violet" size={88} />
      <div>
        <p className="text-2xl font-bold leading-tight">
          {done}
          <span className="text-base font-medium text-muted-foreground">
            {" "}
            / {plannedCount}
          </span>
        </p>
        <p className="text-sm text-muted-foreground">problems completed</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {authoredSlugs.length} available now · keep going!
        </p>
      </div>
    </div>
  );
}
