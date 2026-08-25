"use client";

import { useState } from "react";
import { Lightbulb, Target } from "lucide-react";
import { Markdown } from "@/components/practice/markdown";
import { cn } from "@/lib/utils";
import type { LabChallenge } from "../types";

/**
 * The lab's hands-on challenge: a prompt, progressively-revealed hints, and a
 * hidden expected approach the user can check after attempting it.
 */
export function LabChallengeView({ challenge }: { challenge: LabChallenge }) {
  const [revealedHints, setRevealedHints] = useState(0);
  const [showApproach, setShowApproach] = useState(false);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-5">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-violet-500">
          <Target className="h-4 w-4" /> Your challenge
        </p>
        <Markdown className="mt-2 text-sm">{challenge.promptMD}</Markdown>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <p className="inline-flex items-center gap-2 text-sm font-semibold">
            <Lightbulb className="h-4 w-4 text-orange-500" /> Hints
          </p>
          <span className="text-xs text-muted-foreground">
            {revealedHints} / {challenge.hints.length}
          </span>
        </div>

        {revealedHints > 0 && (
          <ul className="mt-3 space-y-2">
            {challenge.hints.slice(0, revealedHints).map((h, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                <span className="font-mono text-xs text-orange-500">{i + 1}.</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        )}

        {revealedHints < challenge.hints.length && (
          <button
            type="button"
            onClick={() => setRevealedHints((n) => n + 1)}
            className="mt-3 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted/50"
          >
            {revealedHints === 0 ? "Show a hint" : "Show next hint"}
          </button>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <button
          type="button"
          aria-expanded={showApproach}
          onClick={() => setShowApproach((s) => !s)}
          className={cn(
            "text-sm font-medium transition-colors",
            showApproach ? "text-foreground" : "text-violet-500 hover:underline",
          )}
        >
          {showApproach ? "Hide expected approach" : "Reveal expected approach"}
        </button>
        {showApproach && (
          <Markdown className="mt-3 text-sm text-muted-foreground">
            {challenge.expectedApproachMD}
          </Markdown>
        )}
      </div>
    </div>
  );
}
