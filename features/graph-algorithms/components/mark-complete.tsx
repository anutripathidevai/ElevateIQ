"use client";

import { Check, Circle } from "lucide-react";
import { markSolved, unmarkSolved, useSolved } from "@/lib/progress-store";
import { cn } from "@/lib/utils";

/** Toggle a problem's solved state (persists to localStorage, syncs if signed in). */
export function MarkComplete({ slug }: { slug: string }) {
  const solved = useSolved(slug);
  return (
    <button
      type="button"
      onClick={() => (solved ? unmarkSolved(slug) : markSolved(slug))}
      aria-pressed={solved}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
        solved
          ? "border-success/40 bg-success/10 text-success hover:bg-success/15"
          : "border-border bg-card text-foreground hover:bg-muted/50",
      )}
    >
      {solved ? (
        <>
          <Check className="h-4 w-4" /> Completed
        </>
      ) : (
        <>
          <Circle className="h-4 w-4" /> Mark complete
        </>
      )}
    </button>
  );
}
