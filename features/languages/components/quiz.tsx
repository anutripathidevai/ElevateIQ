"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import type { QuizQuestion } from "../types";
import { Markdown } from "@/components/practice/markdown";
import { cn } from "@/lib/utils";

/**
 * A short multiple-choice quiz. Each question gives immediate feedback and an
 * explanation once answered, and a running score is shown at the end. State is
 * local — a quick self-check, not a graded assessment.
 */
export function Quiz({ questions }: { questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const answeredCount = Object.keys(answers).length;
  const correctCount = questions.reduce(
    (n, q, i) => (answers[i] === q.correctIndex ? n + 1 : n),
    0,
  );

  return (
    <div className="space-y-5">
      {questions.map((q, qi) => {
        const chosen = answers[qi];
        const answered = chosen !== undefined;
        return (
          <div key={qi} className="rounded-xl border border-border bg-card p-4">
            <p className="mb-3 font-medium">
              {qi + 1}. {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => {
                const isChosen = chosen === oi;
                const isCorrect = oi === q.correctIndex;
                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={answered}
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [qi]: oi }))
                    }
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                      !answered &&
                        "border-border hover:border-primary/40 hover:bg-muted/40",
                      answered &&
                        isCorrect &&
                        "border-success/40 bg-success/10 text-foreground",
                      answered &&
                        isChosen &&
                        !isCorrect &&
                        "border-danger/40 bg-danger/10 text-foreground",
                      answered &&
                        !isChosen &&
                        !isCorrect &&
                        "border-border opacity-60",
                    )}
                  >
                    <span>{opt}</span>
                    {answered && isCorrect && (
                      <Check className="h-4 w-4 shrink-0 text-success" />
                    )}
                    {answered && isChosen && !isCorrect && (
                      <X className="h-4 w-4 shrink-0 text-danger" />
                    )}
                  </button>
                );
              })}
            </div>
            {answered && (
              <div className="mt-3 rounded-lg border border-border bg-muted/40 p-3">
                <Markdown>{q.explanationMD}</Markdown>
              </div>
            )}
          </div>
        );
      })}

      {answeredCount === questions.length && questions.length > 0 && (
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-center text-sm font-medium">
          You scored {correctCount} / {questions.length}
        </div>
      )}
    </div>
  );
}
