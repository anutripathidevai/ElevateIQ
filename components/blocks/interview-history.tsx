"use client";

import { useMemo, useState } from "react";
import { Search, ThumbsUp, ThumbsDown, Sparkles } from "lucide-react";
import type { InterviewRecord } from "@/lib/dashboard-data";
import { ACCENT_STYLES } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const VERDICTS = ["All", "Hire", "Lean Hire", "Borderline"];

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-500";
  if (score >= 70) return "text-violet-500";
  return "text-orange-500";
}

/** Searchable, filterable interview history timeline (UI-only). */
export function InterviewHistory({ records }: { records: InterviewRecord[] }) {
  const [query, setQuery] = useState("");
  const [verdict, setVerdict] = useState("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter((r) => {
      const matchesQuery =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q);
      const matchesVerdict = verdict === "All" || r.verdict === verdict;
      return matchesQuery && matchesVerdict;
    });
  }, [records, query, verdict]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search interviews…"
            aria-label="Search interviews"
            className="h-9 w-full rounded-lg border border-border bg-muted/40 pl-9 pr-3 text-sm outline-none focus:border-primary/50 focus:bg-background"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {VERDICTS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVerdict(v)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                verdict === v
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent",
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-14 text-center">
          <p className="text-sm text-muted-foreground">No interviews match your filters.</p>
        </div>
      ) : (
        <ol className="relative space-y-4 border-l border-border pl-6">
          {filtered.map((r) => {
            const a = ACCENT_STYLES[r.accent];
            return (
              <li key={r.id} className="relative">
                <span
                  className={cn(
                    "absolute -left-[1.6rem] top-4 h-3 w-3 rounded-full ring-4 ring-background",
                    a.solid,
                  )}
                />
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{r.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {r.type} · {r.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={cn("text-xl font-bold", scoreColor(r.score))}>{r.score}</p>
                        <p className="text-[0.65rem] text-muted-foreground">score</p>
                      </div>
                      <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", a.bg, a.text)}>
                        {r.verdict}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                        <ThumbsUp className="h-3.5 w-3.5" /> Strengths
                      </p>
                      <ul className="space-y-1">
                        {r.strengths.map((s) => (
                          <li key={s} className="text-sm text-muted-foreground">• {s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-rose-500">
                        <ThumbsDown className="h-3.5 w-3.5" /> To improve
                      </p>
                      <ul className="space-y-1">
                        {r.weaknesses.map((w) => (
                          <li key={w} className="text-sm text-muted-foreground">• {w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    <Sparkles className="h-3 w-3" /> AI improvement plan
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
