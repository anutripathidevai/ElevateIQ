"use client";

import { useMemo, useState } from "react";
import { Bookmark, History, LayoutGrid, ListTree, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  GenAICompany,
  GenAIDifficulty,
  GenAILessonMeta,
  GenAITierMeta,
  GenAITopic,
} from "../types";
import {
  filterLessons,
  sortLessons,
  type GenAIFilters,
  type GenAISort,
} from "../content-api";
import { LessonCard } from "./lesson-card";
import { useBookmarks, useRecentlyViewed } from "./bookmark-store";

type ViewMode = "path" | "grid";

const SORTS: { key: GenAISort; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "popular", label: "Most Popular" },
  { key: "difficulty", label: "Difficulty" },
  { key: "frequency", label: "Interview Frequency" },
];

function Pill({
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
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
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
 * The AI System Design dashboard: search + difficulty/topic/company filters,
 * four sort modes, a bookmarks + recently-viewed shelf, and two views — a
 * tier-grouped learning path and a flat filtered grid. Entirely data-driven off
 * the catalog, so new lessons appear automatically.
 */
export function DashboardView({
  catalog,
  tiers,
  topics,
  companies,
  difficulties,
}: {
  catalog: GenAILessonMeta[];
  tiers: GenAITierMeta[];
  topics: GenAITopic[];
  companies: GenAICompany[];
  difficulties: GenAIDifficulty[];
}) {
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<GenAIDifficulty | "All">("All");
  const [topic, setTopic] = useState<GenAITopic | "All">("All");
  const [company, setCompany] = useState<GenAICompany | "All">("All");
  const [sort, setSort] = useState<GenAISort>("newest");
  const [view, setView] = useState<ViewMode>("path");

  const metaBySlug = useMemo(() => {
    const m = new Map<string, GenAILessonMeta>();
    catalog.forEach((q) => m.set(q.slug, q));
    return m;
  }, [catalog]);

  const bookmarks = useBookmarks();
  const recent = useRecentlyViewed();

  const filters: GenAIFilters = { query, difficulty, topic, company };
  const hasFilters =
    query.trim() !== "" ||
    difficulty !== "All" ||
    topic !== "All" ||
    company !== "All";

  const filtered = useMemo(
    () => sortLessons(filterLessons(catalog, filters), sort),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [catalog, query, difficulty, topic, company, sort],
  );

  const effectiveView: ViewMode = hasFilters ? "grid" : view;

  const bookmarkMetas = bookmarks
    .map((s) => metaBySlug.get(s))
    .filter((m): m is GenAILessonMeta => Boolean(m));
  const recentMetas = recent
    .map((s) => metaBySlug.get(s))
    .filter((m): m is GenAILessonMeta => Boolean(m));

  return (
    <div className="space-y-8">
      {/* Shelves */}
      {bookmarkMetas.length > 0 && (
        <Shelf title="Bookmarked" icon={Bookmark} metas={bookmarkMetas} />
      )}
      {recentMetas.length > 0 && (
        <Shelf title="Recently viewed" icon={History} metas={recentMetas} />
      )}

      {/* Controls */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search lessons, companies, tags…"
              aria-label="Search AI system design lessons"
              className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="genai-sort">
              Sort
            </label>
            <select
              id="genai-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as GenAISort)}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm outline-none focus:border-primary/50"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
            <div className="flex overflow-hidden rounded-lg border border-border">
              <ViewToggle
                active={effectiveView === "path"}
                disabled={hasFilters}
                onClick={() => setView("path")}
                icon={ListTree}
                label="Learning path"
              />
              <ViewToggle
                active={effectiveView === "grid"}
                onClick={() => setView("grid")}
                icon={LayoutGrid}
                label="All lessons"
              />
            </div>
          </div>
        </div>

        {/* Facets */}
        <div className="space-y-2">
          <FacetRow label="Difficulty">
            <Pill
              active={difficulty === "All"}
              onClick={() => setDifficulty("All")}
            >
              All
            </Pill>
            {difficulties.map((d) => (
              <Pill
                key={d}
                active={difficulty === d}
                onClick={() => setDifficulty(d)}
              >
                {d}
              </Pill>
            ))}
          </FacetRow>
          <FacetRow label="Topic">
            <Pill active={topic === "All"} onClick={() => setTopic("All")}>
              All
            </Pill>
            {topics.map((t) => (
              <Pill key={t} active={topic === t} onClick={() => setTopic(t)}>
                {t}
              </Pill>
            ))}
          </FacetRow>
          <FacetRow label="Company">
            <Pill active={company === "All"} onClick={() => setCompany("All")}>
              All
            </Pill>
            {companies.map((c) => (
              <Pill key={c} active={company === c} onClick={() => setCompany(c)}>
                {c}
              </Pill>
            ))}
          </FacetRow>
        </div>
      </section>

      {/* Body */}
      {effectiveView === "grid" ? (
        filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((q) => (
              <LessonCard key={q.slug} meta={q} />
            ))}
          </div>
        )
      ) : (
        <div className="space-y-10">
          {tiers
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((tier) => {
              const items = sortLessons(
                catalog.filter((q) => q.tier === tier.id),
                sort,
              );
              if (items.length === 0) return null;
              const publishedCount = items.filter(
                (q) => q.status === "published",
              ).length;
              return (
                <section key={tier.id} className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-2xl" aria-hidden>
                      {tier.emoji}
                    </span>
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight">
                        {tier.label}
                      </h2>
                      <p className="max-w-2xl text-sm text-muted-foreground">
                        {tier.description}
                      </p>
                    </div>
                    <span className="ml-auto rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
                      {publishedCount}/{items.length} available
                    </span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((q) => (
                      <LessonCard key={q.slug} meta={q} />
                    ))}
                  </div>
                </section>
              );
            })}
        </div>
      )}
    </div>
  );
}

function FacetRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-20 shrink-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

function ViewToggle({
  active,
  disabled,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon: typeof ListTree;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function Shelf({
  title,
  icon: Icon,
  metas,
}: {
  title: string;
  icon: typeof Bookmark;
  metas: GenAILessonMeta[];
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metas.slice(0, 3).map((q) => (
          <LessonCard key={q.slug} meta={q} />
        ))}
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <p className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
      No lessons match your filters. Try clearing the search or facets.
    </p>
  );
}
