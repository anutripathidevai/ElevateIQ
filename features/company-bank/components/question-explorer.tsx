"use client";

import { useMemo, useState, useTransition } from "react";
import { Bookmark, RotateCcw, Search } from "lucide-react";
import type { Difficulty, ProgressStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/features/shared/components/states";
import { useDebouncedValue } from "@/features/shared/hooks/use-debounced-value";
import { pluralize } from "@/features/shared/utils";
import {
  CATEGORY_LABELS,
  EXPERIENCE_LABELS,
  type CompanyQuestion,
  type ExperienceLevel,
  type QuestionCategory,
} from "../types";
import {
  filterQuestions,
  sortQuestions,
  summarizeProgress,
  type FacetFilter,
} from "../utils";
import {
  setQuestionStatusAction,
  toggleBookmarkAction,
} from "../actions";
import { QuestionCard } from "./question-card";

const DIFFICULTIES: Difficulty[] = ["EASY", "MEDIUM", "HARD"];
const LEVELS: ExperienceLevel[] = [
  "INTERN",
  "ENTRY",
  "MID",
  "SENIOR",
  "STAFF",
  "PRINCIPAL",
];

export interface QuestionExplorerProps {
  questions: CompanyQuestion[];
  tags: string[];
  categories: QuestionCategory[];
  initialBookmarkedIds: string[];
  initialProgress: Record<string, ProgressStatus>;
  canPersist: boolean;
}

export function QuestionExplorer({
  questions,
  tags,
  categories,
  initialBookmarkedIds,
  initialProgress,
  canPersist,
}: QuestionExplorerProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<FacetFilter<QuestionCategory>>("ALL");
  const [difficulty, setDifficulty] = useState<FacetFilter<Difficulty>>("ALL");
  const [level, setLevel] = useState<FacetFilter<ExperienceLevel>>("ALL");
  const [tag, setTag] = useState<string | null>(null);
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);

  const [bookmarked, setBookmarked] = useState<Set<string>>(
    () => new Set(initialBookmarkedIds),
  );
  const [progress, setProgress] = useState<Record<string, ProgressStatus>>(
    () => ({ ...initialProgress }),
  );
  const [, startTransition] = useTransition();

  const debouncedSearch = useDebouncedValue(search, 200);

  const filtered = useMemo(
    () =>
      sortQuestions(
        filterQuestions(questions, {
          search: debouncedSearch,
          category,
          difficulty,
          experienceLevel: level,
          tag,
          bookmarkedOnly,
          bookmarkedIds: bookmarked,
        }),
      ),
    [
      questions,
      debouncedSearch,
      category,
      difficulty,
      level,
      tag,
      bookmarkedOnly,
      bookmarked,
    ],
  );

  const summary = useMemo(
    () => summarizeProgress(questions, new Map(Object.entries(progress))),
    [questions, progress],
  );

  const filtersActive =
    Boolean(search) ||
    category !== "ALL" ||
    difficulty !== "ALL" ||
    level !== "ALL" ||
    Boolean(tag) ||
    bookmarkedOnly;

  function resetFilters() {
    setSearch("");
    setCategory("ALL");
    setDifficulty("ALL");
    setLevel("ALL");
    setTag(null);
    setBookmarkedOnly(false);
  }

  function handleToggleBookmark(id: string) {
    if (!canPersist) return;
    const nextBookmarked = !bookmarked.has(id);
    setBookmarked((prev) => {
      const next = new Set(prev);
      if (nextBookmarked) next.add(id);
      else next.delete(id);
      return next;
    });
    startTransition(async () => {
      const res = await toggleBookmarkAction(id);
      if (!res.ok || res.bookmarked !== nextBookmarked) {
        // Reconcile with the server's truth on mismatch/failure.
        setBookmarked((prev) => {
          const next = new Set(prev);
          if (res.ok && res.bookmarked) next.add(id);
          else next.delete(id);
          return next;
        });
      }
    });
  }

  function handleSetStatus(id: string, status: ProgressStatus) {
    if (!canPersist) return;
    const previous = progress[id] ?? "TODO";
    setProgress((prev) => {
      const next = { ...prev };
      if (status === "TODO") delete next[id];
      else next[id] = status;
      return next;
    });
    startTransition(async () => {
      const res = await setQuestionStatusAction(id, status);
      if (!res.ok) {
        setProgress((prev) => {
          const next = { ...prev };
          if (previous === "TODO") delete next[id];
          else next[id] = previous;
          return next;
        });
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* Progress summary */}
      {canPersist && summary.total > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">Your progress</span>
            <span className="text-muted-foreground">
              {summary.solved}/{summary.total} solved · {summary.attempted}{" "}
              attempted
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${summary.percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative flex-1 sm:min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions or tags…"
              aria-label="Search questions"
              className="pl-9"
            />
          </div>

          <Select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as FacetFilter<QuestionCategory>)
            }
            aria-label="Filter by category"
          >
            <option value="ALL">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </Select>

          <Select
            value={difficulty}
            onChange={(e) =>
              setDifficulty(e.target.value as FacetFilter<Difficulty>)
            }
            aria-label="Filter by difficulty"
          >
            <option value="ALL">All difficulties</option>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d.charAt(0) + d.slice(1).toLowerCase()}
              </option>
            ))}
          </Select>

          <Select
            value={level}
            onChange={(e) =>
              setLevel(e.target.value as FacetFilter<ExperienceLevel>)
            }
            aria-label="Filter by experience level"
          >
            <option value="ALL">All levels</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {EXPERIENCE_LABELS[l]}
              </option>
            ))}
          </Select>

          {canPersist && (
            <Button
              type="button"
              variant={bookmarkedOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setBookmarkedOnly((v) => !v)}
            >
              <Bookmark className="h-4 w-4" />
              Bookmarked
            </Button>
          )}

          {filtersActive && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetFilters}
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          )}
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTag(t === tag ? null : t)}
              >
                <Badge
                  variant={t === tag ? "default" : "outline"}
                  className={cn("cursor-pointer", t === tag && "ring-1 ring-ring")}
                >
                  {t}
                </Badge>
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {pluralize(filtered.length, "question")}
      </p>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No matching questions"
          description="Try clearing filters or searching for something else."
          action={
            filtersActive ? (
              <Button variant="outline" size="sm" onClick={resetFilters}>
                <RotateCcw className="h-4 w-4" />
                Reset filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              bookmarked={bookmarked.has(q.id)}
              status={progress[q.id] ?? "TODO"}
              canPersist={canPersist}
              onToggleBookmark={() => handleToggleBookmark(q.id)}
              onSetStatus={(status) => handleSetStatus(q.id, status)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
