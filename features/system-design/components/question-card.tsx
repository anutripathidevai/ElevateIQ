"use client";

import Link from "next/link";
import {
  Bookmark,
  CheckCircle2,
  Clock,
  Flame,
  Lock,
  TrendingUp,
} from "lucide-react";
import { ACCENT_STYLES } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useSolved } from "@/lib/progress-store";
import type { SDQuestionMeta } from "../types";
import { SD_TIERS } from "../registry";
import { toggleBookmark, useIsBookmarked } from "./bookmark-store";

const DIFFICULTY_ACCENT = {
  Beginner: "emerald",
  Intermediate: "blue",
  Advanced: "orange",
} as const;

function tierAccent(tier: SDQuestionMeta["tier"]) {
  return SD_TIERS.find((t) => t.id === tier)?.accent ?? "blue";
}

/**
 * A single question card for the dashboard. Published questions link to their
 * page and expose bookmark + solved state; coming-soon questions render a
 * disabled, clearly-labelled placeholder. Purely data-driven.
 */
export function QuestionCard({ meta }: { meta: SDQuestionMeta }) {
  const published = meta.status === "published";
  const solved = useSolved(meta.slug);
  const bookmarked = useIsBookmarked(meta.slug);
  const accent = tierAccent(meta.tier);
  const a = ACCENT_STYLES[accent];
  const da = ACCENT_STYLES[DIFFICULTY_ACCENT[meta.difficulty]];

  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-[11px] font-medium",
              da.border,
              da.text,
            )}
          >
            {meta.difficulty}
          </span>
          {published ? (
            solved && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                <CheckCircle2 className="h-3 w-3" /> Done
              </span>
            )
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              <Lock className="h-3 w-3" /> Coming soon
            </span>
          )}
        </div>
        {published && (
          <button
            type="button"
            aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
            aria-pressed={bookmarked}
            onClick={(e) => {
              e.preventDefault();
              toggleBookmark(meta.slug);
            }}
            className={cn(
              "-m-1 rounded-md p-1 transition-colors",
              bookmarked
                ? a.text
                : "text-muted-foreground/50 hover:text-foreground",
            )}
          >
            <Bookmark
              className={cn("h-4 w-4", bookmarked && "fill-current")}
            />
          </button>
        )}
      </div>

      <div className="mt-3">
        <h3 className="font-semibold leading-tight tracking-tight">
          {meta.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {meta.summary}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {meta.categories.slice(0, 2).map((c) => (
          <span
            key={c}
            className="rounded-md border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground"
          >
            {c}
          </span>
        ))}
        {meta.companies.slice(0, 3).map((c) => (
          <span
            key={c}
            className="rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground"
          >
            {c}
          </span>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-3 border-t border-border pt-3 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" /> {meta.estimatedMinutes}m
        </span>
        <span className="inline-flex items-center gap-1">
          <Flame className="h-3 w-3" /> {meta.frequency}
        </span>
        <span className="ml-auto inline-flex items-center gap-1">
          <TrendingUp className="h-3 w-3" /> {meta.popularity}
        </span>
      </div>
    </>
  );

  const cardClass = cn(
    "flex flex-col rounded-xl border bg-card p-4 shadow-sm transition-colors",
    published
      ? "border-border hover:border-primary/40"
      : "border-dashed border-border opacity-75",
  );

  if (!published) {
    return (
      <div className={cardClass} aria-disabled>
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={`/learning/system-design/${meta.slug}`}
      className={cn(cardClass, "focus:outline-none focus:ring-2 focus:ring-primary/40")}
    >
      {inner}
    </Link>
  );
}
