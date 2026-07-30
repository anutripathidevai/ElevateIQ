"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, ListChecks } from "lucide-react";
import { ProgressBar } from "@/components/blocks/primitives";
import { Badge } from "@/components/ui/badge";
import { useSolvedSet } from "@/lib/progress-store";
import { ACCENT_STYLES } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { formatMinutes, moduleAccent } from "./ui";

export interface ModuleCardData {
  id: string;
  order: number;
  title: string;
  summary: string;
  pattern: string;
  /** Slugs of authored problems in this module (may be fewer than planned). */
  authoredSlugs: string[];
  /** Total planned problems for this module. */
  plannedCount: number;
  estimatedMinutes: number;
}

/** A module tile on the hub: pattern, problem count, est. time, completion %. */
export function ModuleCard({
  data,
  basePath = "/practice/graph-algorithms",
}: {
  data: ModuleCardData;
  basePath?: string;
}) {
  const solved = useSolvedSet();
  const done = data.authoredSlugs.filter((s) => solved.has(s)).length;
  const pct = data.plannedCount
    ? Math.round((done / data.plannedCount) * 100)
    : 0;
  const accent = moduleAccent(data.order);
  const a = ACCENT_STYLES[accent];
  const firstSlug = data.authoredSlugs[0];
  const available = Boolean(firstSlug);

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold",
              a.bg,
              a.text,
            )}
          >
            {data.order}
          </span>
          <h3 className="font-semibold leading-tight">{data.title}</h3>
        </div>
        {available ? (
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <Badge variant="outline" className="shrink-0">
            Coming soon
          </Badge>
        )}
      </div>

      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
        {data.summary}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <ListChecks className="h-3.5 w-3.5" />
          {data.authoredSlugs.length}/{data.plannedCount} problems
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {formatMinutes(data.estimatedMinutes)}
        </span>
        {done > 0 && (
          <span className="inline-flex items-center gap-1.5 text-success">
            <CheckCircle2 className="h-3.5 w-3.5" /> {done} done
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <ProgressBar value={pct} accent={accent} className="flex-1" />
        <span className="w-9 text-right text-xs font-medium tabular-nums text-muted-foreground">
          {pct}%
        </span>
      </div>
    </>
  );

  const className = cn(
    "block rounded-xl border bg-card p-4 shadow-sm transition-colors",
    available
      ? "border-border hover:border-primary/40 hover:bg-muted/30"
      : "border-dashed border-border opacity-80",
  );

  if (!available) {
    return <div className={className}>{body}</div>;
  }
  return (
    <Link href={`${basePath}/${firstSlug}`} className={className}>
      {body}
    </Link>
  );
}
