import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

export interface ProgressEntry {
  id: string;
  overallScore: number;
  createdAt: Date;
}

/**
 * Score-over-time for repeat attempts on a track. Presentational only: it
 * receives already-fetched, oldest-first entries and highlights the current one.
 * Renders nothing unless there are at least two attempts to compare.
 */
export function AdaptiveProgress({
  entries,
  currentId,
}: {
  entries: ProgressEntry[];
  currentId: string;
}) {
  if (entries.length < 2) return null;

  const max = Math.max(...entries.map((e) => e.overallScore), 1);
  const first = entries[0].overallScore;
  const latest = entries[entries.length - 1].overallScore;
  const overallDelta = latest - first;

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold">Your progress</h2>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 text-sm font-medium",
            overallDelta > 0
              ? "text-success"
              : overallDelta < 0
                ? "text-danger"
                : "text-muted-foreground",
          )}
        >
          {overallDelta > 0 ? (
            <TrendingUp className="h-4 w-4" />
          ) : overallDelta < 0 ? (
            <TrendingDown className="h-4 w-4" />
          ) : (
            <Minus className="h-4 w-4" />
          )}
          {overallDelta > 0 ? "+" : ""}
          {overallDelta} pts since first attempt
        </span>
      </div>

      <ul className="mt-4 space-y-3">
        {entries.map((e, i) => {
          const prev = i > 0 ? entries[i - 1].overallScore : null;
          const delta = prev === null ? null : e.overallScore - prev;
          const isCurrent = e.id === currentId;
          return (
            <li key={e.id} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-xs text-muted-foreground">
                {formatDate(e.createdAt)}
              </span>
              <div className="flex-1">
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      isCurrent ? "bg-primary" : "bg-primary/40",
                    )}
                    style={{ width: `${(e.overallScore / max) * 100}%` }}
                  />
                </div>
              </div>
              <span className="w-10 shrink-0 text-right text-sm font-medium tabular-nums">
                {e.overallScore}
              </span>
              <span className="w-16 shrink-0 text-right text-xs">
                {delta === null ? (
                  <span className="text-muted-foreground">—</span>
                ) : (
                  <span
                    className={cn(
                      delta > 0
                        ? "text-success"
                        : delta < 0
                          ? "text-danger"
                          : "text-muted-foreground",
                    )}
                  >
                    {delta > 0 ? "+" : ""}
                    {delta}
                  </span>
                )}
              </span>
              {isCurrent && (
                <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-medium text-primary">
                  Latest
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
