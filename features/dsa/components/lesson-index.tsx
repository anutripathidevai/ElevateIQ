"use client";

import Link from "next/link";
import { BookOpen, CheckCircle2, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GraphDifficultyBadge } from "@/features/graph-algorithms/components";
import { useSolvedSet } from "@/lib/progress-store";
import { cn } from "@/lib/utils";
import type { DsaLesson } from "../types";

export interface LessonIndexItem {
  lesson: DsaLesson;
  moduleTitle: string;
}

/**
 * Full, ordered curriculum list with per-lesson solved state. Unlike the Graph
 * problem index, this renders both concept lessons (a "Concept" badge) and
 * problem lessons (a difficulty badge), so mixed courses like DP list correctly.
 */
export function LessonIndex({
  items,
  basePath,
}: {
  items: LessonIndexItem[];
  basePath: string;
}) {
  const solved = useSolvedSet();

  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
        Lessons are being authored — check back soon.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
      {items.map(({ lesson, moduleTitle }, i) => {
        const done = solved.has(lesson.slug);
        return (
          <li key={lesson.slug}>
            <Link
              href={`${basePath}/${lesson.slug}`}
              className="flex items-center gap-3 bg-card px-4 py-3 transition-colors hover:bg-muted/40"
            >
              {done ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
              ) : (
                <Circle className="h-5 w-5 shrink-0 text-muted-foreground/50" />
              )}
              <span className="w-6 shrink-0 text-sm font-medium tabular-nums text-muted-foreground">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block truncate font-medium",
                    done && "text-muted-foreground",
                  )}
                >
                  {lesson.title}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {moduleTitle}
                </span>
              </span>
              {lesson.kind === "problem" ? (
                <GraphDifficultyBadge difficulty={lesson.difficulty} />
              ) : (
                <Badge variant="outline" className="gap-1">
                  <BookOpen className="h-3 w-3" /> Concept
                </Badge>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
