"use client";

import { useMemo, useState } from "react";
import {
  Bookmark,
  History,
  LayoutGrid,
  ListTree,
  Search,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSolvedSet } from "@/lib/progress-store";
import type {
  LLDCategory,
  LLDCompany,
  LLDDifficulty,
  LLDPattern,
  LLDProblemMeta,
  LLDTierMeta,
} from "../types";
import {
  filterProblems,
  sortProblems,
  getRecommended,
  type LLDFilters,
  type LLDSort,
} from "../content-api";
import { ProblemCard } from "./problem-card";
import { useBookmarks, useRecentlyViewed } from "./progress-store";

type ViewMode = "path" | "grid";

const SORTS: { key: LLDSort; label: string }[] = [
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
 * The Low Level Design dashboard: search + difficulty/category/pattern filters,
 * four sort modes, a bookmarks + recently-viewed + recommended shelf, and two
 * views — a tier-grouped Beginner → Expert roadmap and a flat filtered grid.
 * Entirely data-driven off the catalog, so new entries appear automatically.
 */
export function DashboardView({
  catalog,
  tiers,
  categories,
  companies,
  difficulties,
  patterns,
}: {
  catalog: LLDProblemMeta[];
  tiers: LLDTierMeta[];
  categories: LLDCategory[];
  companies: LLDCompany[];
  difficulties: LLDDifficulty[];
  patterns: LLDPattern[];
}) {
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<LLDDifficulty | "All">("All");
  const [category, setCategory] = useState<LLDCategory | "All">("All");
  const [company, setCompany] = useState<LLDCompany | "All">("All");
  const [pattern, setPattern] = useState<LLDPattern | "All">("All");
  const [sort, setSort] = useState<LLDSort>("newest");
  const [view, setView] = useState<ViewMode>("path");

  const metaBySlug = useMemo(() => {
    const m = new Map<string, LLDProblemMeta>();
    catalog.forEach((q) => m.set(q.slug, q));
    return m;
  }, [catalog]);

  const bookmarks = useBookmarks();
  const recent = useRecentlyViewed();
  const solved = useSolvedSet();

  const publishedCount = catalog.filter((q) => q.status === "published").length;
  const solvedCount = catalog.filter(
    (q) => q.status === "published" && solved.has(q.slug),
  ).length;
  const progressPct =
    publishedCount === 0 ? 0 : Math.round((solvedCount / publishedCount) * 100);

  const filters: LLDFilters = { query, difficulty, category, company, pattern };
  const hasFilters =
    query.trim() !== "" ||
    difficulty !== "All" ||
    category !== "All" ||
    company !== "All" ||
    pattern !== "All";

  const filtered = useMemo(
    () => sortProblems(filterProblems(catalog, filters), sort),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [catalog, query, difficulty, category, company, pattern, sort],
  );

  const effectiveView: ViewMode = hasFilters ? "grid" : view;

  const bookmarkMetas = bookmarks
    .map((s) => metaBySlug.get(s))
    .filter((m): m is LLDProblemMeta => Boolean(m));
  const recentMetas = recent
    .map((s) => metaBySlug.get(s))
    .filter((m): m is LLDProblemMeta => Boolean(m));
  const recommended = useMemo(
    () => getRecommended([...recent, ...bookmarks]),
    [recent, bookmarks],
  );

  const continueMeta = recentMetas.find((m) => !solved.has(m.slug));

  return (
    <div className="space-y-8">
      {/* Progress + continue */}
      <section className="grid gap-4 md:grid-cols-[1fr_1.3fr]">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Your progress
          </p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-3xl font-bold">{solvedCount}</span>
            <span className="mb-1 text-sm text-muted-foreground">
              / {publishedCount} completed
            </span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {continueMeta ? (
          <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/0 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Continue learning
            </p>
            <div className="mt-2">
              <ProblemCard meta={continueMeta} />
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Recommended next
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {recommended.slice(0, 2).map((m) => (
                <ProblemCard key={m.slug} meta={m} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Shelves */}
      {bookmarkMetas.length > 0 && (
        <Shelf title="Bookmarked" icon={Bookmark} metas={bookmarkMetas} />
      )}
      {recentMetas.length > 0 && (
        <Shelf title="Recently viewed" icon={History} metas={recentMetas} />
      )}
      {bookmarkMetas.length === 0 && recentMetas.length === 0 && (
        <Shelf title="Recommended" icon={Sparkles} metas={recommended} />
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
              placeholder="Search problems, patterns, companies…"
              aria-label="Search low level design problems"
              className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="lld-sort">
              Sort
            </label>
            <select
              id="lld-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as LLDSort)}
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
                label="Roadmap"
              />
              <ViewToggle
                active={effectiveView === "grid"}
                onClick={() => setView("grid")}
                icon={LayoutGrid}
                label="All problems"
              />
            </div>
          </div>
        </div>

        {/* Facets */}
        <div className="space-y-2">
          <FacetRow label="Difficulty">
            <Pill active={difficulty === "All"} onClick={() => setDifficulty("All")}>
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
          <FacetRow label="Category">
            <Pill active={category === "All"} onClick={() => setCategory("All")}>
              All
            </Pill>
            {categories.map((c) => (
              <Pill key={c} active={category === c} onClick={() => setCategory(c)}>
                {c}
              </Pill>
            ))}
          </FacetRow>
          <FacetRow label="Pattern">
            <Pill active={pattern === "All"} onClick={() => setPattern("All")}>
              All
            </Pill>
            {patterns.map((p) => (
              <Pill key={p} active={pattern === p} onClick={() => setPattern(p)}>
                {p}
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
              <ProblemCard key={q.slug} meta={q} />
            ))}
          </div>
        )
      ) : (
        <div className="space-y-10">
          {tiers
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((tier) => {
              const items = sortProblems(
                catalog.filter((q) => q.tier === tier.id),
                sort,
              );
              if (items.length === 0) return null;
              const availableCount = items.filter(
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
                      {availableCount}/{items.length} available
                    </span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((q) => (
                      <ProblemCard key={q.slug} meta={q} />
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
  metas: LLDProblemMeta[];
}) {
  if (metas.length === 0) return null;
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metas.slice(0, 3).map((q) => (
          <ProblemCard key={q.slug} meta={q} />
        ))}
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <p className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
      No problems match your filters. Try clearing the search or facets.
    </p>
  );
}
