"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, ListChecks } from "lucide-react";
import { ProgressBar } from "@/components/blocks/primitives";
import { Badge } from "@/components/ui/badge";
import { GraphDifficultyBadge } from "@/features/graph-algorithms/components";
import { useSolvedSet } from "@/lib/progress-store";
import { ACCENT_STYLES } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { DsaTopicMeta } from "../types";
import { DSA_ICONS, formatHours } from "./ui";

/**
 * A topic tile on the DSA hub. For published topics it shows live completion
 * (intersecting the learner's solved set with the topic's authored lessons); for
 * coming-soon topics it shows planned counts and a "Coming soon" badge. Both are
 * clickable — the dynamic `[topic]` route renders the right page either way.
 */
export function TopicCard({
  topic,
  lessonSlugs,
}: {
  topic: DsaTopicMeta;
  /** Authored lesson slugs (published topics only) for progress. */
  lessonSlugs: string[];
}) {
  const solved = useSolvedSet();
  const a = ACCENT_STYLES[topic.accent];
  const Icon = DSA_ICONS[topic.iconKey];
  const published = topic.status === "published";
  const done = published
    ? lessonSlugs.filter((s) => solved.has(s)).length
    : 0;
  const pct = published && topic.lessonCount
    ? Math.round((done / topic.lessonCount) * 100)
    : 0;

  return (
    <Link
      href={`/learning/dsa/${topic.slug}`}
      className={cn(
        "group flex flex-col rounded-xl border bg-card p-4 shadow-sm transition-colors",
        published
          ? "border-border hover:border-primary/40 hover:bg-muted/30"
          : "border-dashed border-border hover:border-border/80 hover:bg-muted/20",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", a.bg)}>
            <Icon className={cn("h-5 w-5", a.text)} />
          </span>
          <div>
            <h3 className="font-semibold leading-tight">{topic.name}</h3>
            <GraphDifficultyBadge
              difficulty={topic.difficulty}
              className="mt-1"
            />
          </div>
        </div>
        {published ? (
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        ) : (
          <Badge variant="outline" className="shrink-0">
            Soon
          </Badge>
        )}
      </div>

      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
        {topic.tagline}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <ListChecks className="h-3.5 w-3.5" />
          {topic.problemCount} problems
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {formatHours(topic.durationHours)}
        </span>
        {published && done > 0 && (
          <span className="inline-flex items-center gap-1.5 text-success">
            <CheckCircle2 className="h-3.5 w-3.5" /> {done} done
          </span>
        )}
      </div>

      {published && (
        <div className="mt-auto pt-3">
          <div className="flex items-center gap-2">
            <ProgressBar value={pct} accent={topic.accent} className="flex-1" />
            <span className="w-9 text-right text-xs font-medium tabular-nums text-muted-foreground">
              {pct}%
            </span>
          </div>
        </div>
      )}
    </Link>
  );
}
