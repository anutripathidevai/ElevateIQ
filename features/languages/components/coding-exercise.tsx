"use client";

import { useState } from "react";
import { Clock, Cpu, Lightbulb } from "lucide-react";
import type { CodingExercise } from "../types";
import { Markdown } from "@/components/practice/markdown";
import { CodeBlock } from "./code-block";
import { exerciseDifficultyClass } from "./ui";
import { cn } from "@/lib/utils";

/**
 * Hands-on coding exercises with progressive help: read the prompt, reveal
 * hints one at a time, and finally unlock the reference solution and its
 * complexity/explanation. Gating the solution keeps the learner attempting the
 * problem first, the way a real interview rewards.
 */
export function CodingExercises({ items }: { items: CodingExercise[] }) {
  return (
    <div className="space-y-5">
      {items.map((item, i) => (
        <ExerciseCard key={i} item={item} />
      ))}
    </div>
  );
}

function ExerciseCard({ item }: { item: CodingExercise }) {
  const [shownHints, setShownHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">{item.title}</h3>
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
            exerciseDifficultyClass(item.difficulty),
          )}
        >
          {item.difficulty}
        </span>
      </div>

      <Markdown>{item.promptMD}</Markdown>

      {item.hints.length > 0 && (
        <div className="mt-3 space-y-2">
          {shownHints > 0 &&
            item.hints.slice(0, shownHints).map((hint, i) => (
              <div
                key={i}
                className="flex gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm"
              >
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <span>{hint}</span>
              </div>
            ))}
          {shownHints < item.hints.length && (
            <button
              type="button"
              onClick={() => setShownHints((n) => n + 1)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Lightbulb className="h-3.5 w-3.5" />
              {shownHints === 0
                ? `Show a hint (${item.hints.length})`
                : `Next hint (${shownHints}/${item.hints.length})`}
            </button>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowSolution((s) => !s)}
        className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {showSolution ? "Hide solution" : "Reveal solution"}
      </button>

      {showSolution && (
        <div className="mt-3 space-y-3">
          <CodeBlock code={item.solutionCode} />
          {item.complexity && (
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1 text-xs">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" /> Time:{" "}
                <span className="font-mono">{item.complexity.time}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1 text-xs">
                <Cpu className="h-3.5 w-3.5 text-muted-foreground" /> Space:{" "}
                <span className="font-mono">{item.complexity.space}</span>
              </span>
            </div>
          )}
          <Markdown>{item.explanationMD}</Markdown>
        </div>
      )}
    </div>
  );
}
