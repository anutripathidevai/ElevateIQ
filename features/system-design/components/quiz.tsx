"use client";

import { useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import { Markdown } from "@/components/practice/markdown";
import { cn } from "@/lib/utils";
import type { SDQuizItem } from "../types";

/**
 * Interactive multiple-choice quiz. Learners pick an answer per question, get
 * immediate right/wrong feedback with an explanation, and see a running score.
 * Fully client-side; no answers are shipped as visible text before selection.
 */
export function Quiz({ items }: { items: SDQuizItem[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});

  if (items.length === 0) return null;

  const answeredCount = Object.keys(answers).length;
  const correctCount = items.reduce(
    (n, item, i) => (answers[i] === item.answerIndex ? n + 1 : n),
    0,
  );

  const reset = () => setAnswers({});

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {answeredCount}/{items.length} answered
          {answeredCount > 0 && (
            <>
              {" · "}
              <span className="font-medium text-foreground">
                {correctCount} correct
              </span>
            </>
          )}
        </p>
        {answeredCount > 0 && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        )}
      </div>

      <ol className="space-y-5">
        {items.map((item, qi) => {
          const chosen = answers[qi];
          const answered = chosen !== undefined;
          return (
            <li
              key={qi}
              className="rounded-xl border border-border bg-card p-4"
            >
              <p className="mb-3 text-sm font-medium">
                <span className="mr-2 text-muted-foreground">{qi + 1}.</span>
                {item.question}
              </p>
              <div className="space-y-2">
                {item.options.map((opt, oi) => {
                  const isChosen = chosen === oi;
                  const isCorrect = oi === item.answerIndex;
                  const showState = answered && (isChosen || isCorrect);
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={answered}
                      onClick={() =>
                        setAnswers((a) => ({ ...a, [qi]: oi }))
                      }
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                        !answered &&
                          "border-border hover:border-primary/50 hover:bg-muted/40",
                        showState && isCorrect &&
                          "border-success/50 bg-success/10 text-success",
                        showState && isChosen && !isCorrect &&
                          "border-danger/50 bg-danger/10 text-danger",
                        answered && !showState && "border-border opacity-60",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                          showState && isCorrect && "border-success text-success",
                          showState && isChosen && !isCorrect &&
                            "border-danger text-danger",
                          (!answered || !showState) &&
                            "border-muted-foreground/40 text-muted-foreground",
                        )}
                      >
                        {showState && isCorrect ? (
                          <Check className="h-3 w-3" />
                        ) : showState && isChosen ? (
                          <X className="h-3 w-3" />
                        ) : (
                          String.fromCharCode(65 + oi)
                        )}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
              {answered && item.explanationMD && (
                <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3 text-sm">
                  <Markdown>{item.explanationMD}</Markdown>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
