"use client";

import { Check, Circle } from "lucide-react";
import { markSolved, unmarkSolved, useSolved } from "@/lib/progress-store";
import { cn } from "@/lib/utils";

/**
 * Toggles a topic's completion state using the shared localStorage-backed
 * progress store (same store the DSA tracks use, so a single "solved" set drives
 * progress everywhere). Renders a stable, non-mismatching label during SSR.
 */
export function MarkComplete({ slug }: { slug: string }) {
  const done = useSolved(slug);

  return (
    <button
      type="button"
      onClick={() => (done ? unmarkSolved(slug) : markSolved(slug))}
      aria-pressed={done}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
        done
          ? "border-success/40 bg-success/10 text-success hover:bg-success/15"
          : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted/40",
      )}
    >
      {done ? (
        <>
          <Check className="h-4 w-4" /> Completed
        </>
      ) : (
        <>
          <Circle className="h-4 w-4" /> Mark as complete
        </>
      )}
    </button>
  );
}
