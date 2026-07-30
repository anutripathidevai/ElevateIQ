"use client";

import { useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { SectionHeader } from "@/components/blocks/primitives";
import { cn } from "@/lib/utils";
import { useSolvedSet } from "@/lib/progress-store";
import type { DsaDifficulty, DsaTopicMeta } from "../types";
import { TopicCard } from "./topic-card";

type DifficultyFilter = "All" | DsaDifficulty;
type StatusFilter = "All" | "published" | "coming-soon";

const DIFFICULTIES: DifficultyFilter[] = ["All", "Easy", "Medium", "Hard"];
const STATUSES: { key: StatusFilter; label: string }[] = [
  { key: "All", label: "All" },
  { key: "published", label: "Available" },
  { key: "coming-soon", label: "Coming soon" },
];

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

/**
 * The interactive DSA hub grid: search, difficulty/status filters, a
 * "Continue learning" shelf derived from the learner's solved set, and the full
 * topic grid. Fully data-driven — it renders whatever topics the registry
 * declares, so new topics appear here automatically.
 */
export function HubView({
  topics,
  lessonSlugsByTopic,
}: {
  topics: DsaTopicMeta[];
  lessonSlugsByTopic: Record<string, string[]>;
}) {
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("All");
  const [status, setStatus] = useState<StatusFilter>("All");
  const solved = useSolvedSet();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return topics.filter((t) => {
      if (difficulty !== "All" && t.difficulty !== difficulty) return false;
      if (status !== "All" && t.status !== status) return false;
      if (!q) return true;
      const haystack = [t.name, t.tagline, t.description, ...t.tags]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [topics, query, difficulty, status]);

  const continueLearning = useMemo(() => {
    return topics
      .filter((t) => t.status === "published")
      .map((t) => {
        const slugs = lessonSlugsByTopic[t.slug] ?? [];
        const done = slugs.filter((s) => solved.has(s)).length;
        return { topic: t, done, total: t.lessonCount };
      })
      .filter((x) => x.done > 0 && x.done < x.total)
      .sort((a, b) => b.done / b.total - a.done / a.total)
      .slice(0, 3);
  }, [topics, lessonSlugsByTopic, solved]);

  return (
    <div className="space-y-8">
      {continueLearning.length > 0 && (
        <section className="space-y-4">
          <SectionHeader
            title="Continue learning"
            description="Pick up where you left off."
            icon={Sparkles}
            accent="violet"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {continueLearning.map(({ topic }) => (
              <TopicCard
                key={topic.slug}
                topic={topic}
                lessonSlugs={lessonSlugsByTopic[topic.slug] ?? []}
              />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search topics, tags, techniques…"
              aria-label="Search DSA topics"
              className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {STATUSES.map((s) => (
              <FilterPill
                key={s.key}
                active={status === s.key}
                onClick={() => setStatus(s.key)}
              >
                {s.label}
              </FilterPill>
            ))}
            <span className="mx-1 hidden h-5 w-px bg-border sm:block" />
            {DIFFICULTIES.map((d) => (
              <FilterPill
                key={d}
                active={difficulty === d}
                onClick={() => setDifficulty(d)}
              >
                {d}
              </FilterPill>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
            No topics match your filters. Try clearing the search or difficulty.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => (
              <TopicCard
                key={t.slug}
                topic={t}
                lessonSlugs={lessonSlugsByTopic[t.slug] ?? []}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
