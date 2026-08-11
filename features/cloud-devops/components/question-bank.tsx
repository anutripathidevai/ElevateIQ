"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Circle,
  Filter,
  Search,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Markdown } from "@/components/practice/markdown";
import { markSolved, unmarkSolved, useSolved } from "@/lib/progress-store";
import type { CDArea, CDDifficulty, CDQuestion } from "../types";
import { filterQuestions } from "../content-api";

const DIFFICULTY_STYLE: Record<CDDifficulty, string> = {
  Senior: "border-blue-500/30 text-blue-500 bg-blue-500/10",
  Staff: "border-violet-500/30 text-violet-500 bg-violet-500/10",
  Architect: "border-rose-500/30 text-rose-500 bg-rose-500/10",
};

/** One expandable question with a model answer, key points, and follow-ups. */
function QuestionItem({ q }: { q: CDQuestion }) {
  const [open, setOpen] = useState(false);
  const slug = `cloud-devops:q:${q.id}`;
  const solved = useSolved(slug);

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-start gap-3 p-4">
        <button
          type="button"
          aria-pressed={solved}
          aria-label={solved ? "Mark as not done" : "Mark as done"}
          onClick={() => (solved ? unmarkSolved(slug) : markSolved(slug))}
          className={cn(
            "mt-0.5 shrink-0 transition-colors",
            solved ? "text-success" : "text-muted-foreground/40 hover:text-foreground",
          )}
        >
          {solved ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-start justify-between gap-3 text-left"
        >
          <div className="min-w-0">
            <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                  DIFFICULTY_STYLE[q.difficulty],
                )}
              >
                {q.difficulty}
              </span>
              <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground">
                {q.area}
              </span>
            </div>
            <p className="font-medium leading-snug">{q.question}</p>
          </div>
          <ChevronDown
            className={cn(
              "mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </button>
      </div>

      {open && (
        <div className="space-y-4 border-t border-border p-4">
          {q.tests.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                What the interviewer is testing
              </p>
              <ul className="space-y-1">
                {q.tests.map((t, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Strong answer
            </p>
            <Markdown>{q.strongAnswerMD}</Markdown>
          </div>

          {q.keyPoints.length > 0 && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                Key points to hit
              </p>
              <ul className="space-y-1">
                {q.keyPoints.map((k, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    <span>{k}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {q.followUps.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Likely follow-ups
              </p>
              <ul className="space-y-1">
                {q.followUps.map((f, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="text-muted-foreground/60">{i + 1}.</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {q.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              {q.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * The interactive Cloud & DevOps interview question bank: search + area +
 * difficulty facets over the full question set, with expandable answers and
 * per-question progress. Entirely client-side and data-driven.
 */
export function QuestionBank({
  questions,
  areas,
  difficulties,
}: {
  questions: CDQuestion[];
  areas: CDArea[];
  difficulties: CDDifficulty[];
}) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState<CDArea | "All">("All");
  const [difficulty, setDifficulty] = useState<CDDifficulty | "All">("All");

  const results = useMemo(
    () => filterQuestions(questions, { query, area, difficulty }),
    [questions, query, area, difficulty],
  );

  const areaCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const q of questions) counts[q.area] = (counts[q.area] ?? 0) + 1;
    return counts;
  }, [questions]);

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions, tags, areas…"
            aria-label="Search questions"
            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <Filter className="h-3.5 w-3.5" /> Area
          </span>
          <FacetButton
            label={`All (${questions.length})`}
            active={area === "All"}
            onClick={() => setArea("All")}
          />
          {areas.map((ar) => (
            <FacetButton
              key={ar}
              label={`${ar} (${areaCounts[ar] ?? 0})`}
              active={area === ar}
              onClick={() => setArea(ar)}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <Filter className="h-3.5 w-3.5" /> Level
          </span>
          <FacetButton
            label="All"
            active={difficulty === "All"}
            onClick={() => setDifficulty("All")}
          />
          {difficulties.map((d) => (
            <FacetButton
              key={d}
              label={d}
              active={difficulty === d}
              onClick={() => setDifficulty(d)}
            />
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {results.length} of {questions.length} questions
      </p>

      {results.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
          No questions match your filters. Try clearing the search or picking a
          different area.
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((q) => (
            <QuestionItem key={q.id} q={q} />
          ))}
        </div>
      )}
    </div>
  );
}

function FacetButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
