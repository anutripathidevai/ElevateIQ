"use client";

import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { useSolvedSet } from "@/lib/progress-store";
import { cn } from "@/lib/utils";
import type { GraphDifficulty } from "../types";
import { GraphDifficultyBadge } from "./graph-difficulty-badge";

export interface ProblemIndexItem {
  slug: string;
  order: number;
  title: string;
  difficulty: GraphDifficulty;
  moduleTitle: string;
}

/** Full, ordered list of authored problems with per-problem solved state. */
export function ProblemIndex({
  problems,
  basePath = "/practice/graph-algorithms",
}: {
  problems: ProblemIndexItem[];
  basePath?: string;
}) {
  const solved = useSolvedSet();

  if (problems.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
        Problems are being authored — check back soon.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
      {problems.map((p) => {
        const done = solved.has(p.slug);
        return (
          <li key={p.slug}>
            <Link
              href={`${basePath}/${p.slug}`}
              className="flex items-center gap-3 bg-card px-4 py-3 transition-colors hover:bg-muted/40"
            >
              {done ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
              ) : (
                <Circle className="h-5 w-5 shrink-0 text-muted-foreground/50" />
              )}
              <span className="w-6 shrink-0 text-sm font-medium tabular-nums text-muted-foreground">
                {p.order}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block truncate font-medium",
                    done && "text-muted-foreground",
                  )}
                >
                  {p.title}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {p.moduleTitle}
                </span>
              </span>
              <GraphDifficultyBadge difficulty={p.difficulty} />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
