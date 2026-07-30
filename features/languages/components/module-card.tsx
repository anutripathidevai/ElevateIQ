"use client";

import Link from "next/link";
import { CheckCircle2, ChevronDown, Circle, Clock, Lock } from "lucide-react";
import type { AccentKey } from "@/lib/navigation";
import { ACCENT_STYLES } from "@/lib/navigation";
import { useSolvedSet } from "@/lib/progress-store";
import { cn } from "@/lib/utils";
import type { TopicDifficulty } from "../types";
import { formatMinutes } from "./ui";

/** Minimal, serialisable topic reference for the roadmap (no heavy bodies). */
export interface TopicLink {
  slug: string;
  title: string;
  difficulty: TopicDifficulty;
}

/** Lightweight module view-model computed on the server. */
export interface ModuleView {
  id: string;
  order: number;
  title: string;
  summary: string;
  status: "published" | "coming-soon";
  /** Total topics planned for the module (published + not-yet-authored). */
  plannedCount: number;
  estimatedMinutes: number;
  /** Authored, linkable topics. */
  topics: TopicLink[];
}

const DIFFICULTY_DOT: Record<TopicDifficulty, string> = {
  Beginner: "bg-emerald-500",
  Intermediate: "bg-orange-500",
  Advanced: "bg-rose-500",
};

/**
 * A roadmap module card: shows order, title, topic count, estimated study time
 * and a live completion percentage, and expands to a linkable topic list.
 * Coming-soon modules are shown (per the full-journey roadmap) but locked.
 */
export function ModuleCard({
  language,
  module,
  accent,
}: {
  language: string;
  module: ModuleView;
  accent: AccentKey;
}) {
  const solved = useSolvedSet();
  const a = ACCENT_STYLES[accent];
  const done = module.topics.filter((t) => solved.has(t.slug)).length;
  const denom = module.plannedCount || module.topics.length;
  const pct = denom === 0 ? 0 : Math.round((done / denom) * 100);
  const locked = module.status === "coming-soon";

  return (
    <details className="group overflow-hidden rounded-xl border border-border bg-card">
      <summary className="flex cursor-pointer list-none items-center gap-4 p-4 [&::-webkit-details-marker]:hidden">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
            a.bg,
            a.text,
          )}
        >
          {module.order}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold">{module.title}</h3>
            {locked && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                <Lock className="h-3 w-3" /> Soon
              </span>
            )}
          </div>
          <p className="truncate text-sm text-muted-foreground">
            {module.summary}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>{module.plannedCount} topics</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatMinutes(module.estimatedMinutes)}
            </span>
            {!locked && <span>{pct}% complete</span>}
          </div>
        </div>
        <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>

      {!locked && (
        <div className="mb-1.5 px-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full transition-all", a.solid)}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      <div className="border-t border-border p-2">
        {module.topics.length === 0 ? (
          <p className="p-3 text-sm text-muted-foreground">
            Topics for this module are coming soon.
          </p>
        ) : (
          <ul className="space-y-0.5">
            {module.topics.map((t, i) => {
              const isDone = solved.has(t.slug);
              return (
                <li key={t.slug}>
                  <Link
                    href={`/learning/languages/${language}/${t.slug}`}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted/50"
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                    )}
                    <span className="w-6 shrink-0 text-xs text-muted-foreground">
                      {i + 1}.
                    </span>
                    <span className="flex-1 truncate">{t.title}</span>
                    <span
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        DIFFICULTY_DOT[t.difficulty],
                      )}
                      title={t.difficulty}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </details>
  );
}
