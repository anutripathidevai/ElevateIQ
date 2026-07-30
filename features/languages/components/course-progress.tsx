"use client";

import { useSolvedSet } from "@/lib/progress-store";

/**
 * Overall course progress across all authored topics, driven by the shared
 * progress store. Renders a neutral 0% on the server / first paint to avoid a
 * hydration mismatch, then reflects the learner's real completion.
 */
export function CourseProgress({
  topicSlugs,
  label = "Course progress",
}: {
  topicSlugs: string[];
  label?: string;
}) {
  const solved = useSolvedSet();
  const total = topicSlugs.length;
  const done = topicSlugs.filter((s) => solved.has(s)).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {done}/{total} topics · {pct}%
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
