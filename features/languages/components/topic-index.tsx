"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, Circle, Search } from "lucide-react";
import type { TopicDifficulty } from "../types";
import { useSolvedSet } from "@/lib/progress-store";
import { topicDifficultyClass } from "./ui";
import { cn } from "@/lib/utils";

export interface TopicIndexItem {
  slug: string;
  title: string;
  difficulty: TopicDifficulty;
  moduleTitle: string;
  tags: string[];
}

const FILTERS: (TopicDifficulty | "All")[] = [
  "All",
  "Beginner",
  "Intermediate",
  "Advanced",
];

/**
 * Searchable, filterable list of every authored topic. Includes an empty state
 * so a search with no matches is handled gracefully.
 */
export function TopicIndex({
  language,
  items,
}: {
  language: string;
  items: TopicIndexItem[];
}) {
  const solved = useSolvedSet();
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<TopicDifficulty | "All">("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      if (difficulty !== "All" && it.difficulty !== difficulty) return false;
      if (!q) return true;
      return (
        it.title.toLowerCase().includes(q) ||
        it.moduleTitle.toLowerCase().includes(q) ||
        it.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [items, query, difficulty]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics, tags…"
            aria-label="Search topics"
            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary/50"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setDifficulty(f)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                difficulty === f
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No topics match your search.
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {filtered.map((it) => {
            const done = solved.has(it.slug);
            return (
              <li key={it.slug}>
                <Link
                  href={`/learning/languages/${language}/${it.slug}`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{it.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {it.moduleTitle}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium",
                      topicDifficultyClass(it.difficulty),
                    )}
                  >
                    {it.difficulty}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
