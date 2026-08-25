"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Markdown } from "@/components/practice/markdown";
import { cn } from "@/lib/utils";
import type { LabInterviewQuestion } from "../types";

/**
 * Collapsible list of senior-level interview questions for the lab. Each item
 * expands to a model answer, key points, and follow-ups — the "study for the
 * interview" payoff after running the demo.
 */
export function InterviewQuestions({
  questions,
}: {
  questions: LabInterviewQuestion[];
}) {
  const [openId, setOpenId] = useState<string | null>(questions[0]?.id ?? null);

  return (
    <div className="space-y-3">
      {questions.map((q) => {
        const open = openId === q.id;
        return (
          <div key={q.id} className="overflow-hidden rounded-xl border border-border bg-card">
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpenId(open ? null : q.id)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
            >
              <span className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-medium",
                    q.difficulty === "Advanced"
                      ? "bg-rose-500/10 text-rose-500"
                      : q.difficulty === "Intermediate"
                        ? "bg-orange-500/10 text-orange-500"
                        : "bg-emerald-500/10 text-emerald-500",
                  )}
                >
                  {q.difficulty}
                </span>
                <span className="text-sm font-medium">{q.question}</span>
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                  open && "rotate-180",
                )}
              />
            </button>

            {open && (
              <div className="border-t border-border px-4 py-4">
                <Markdown className="text-sm text-muted-foreground">{q.answerMD}</Markdown>

                {q.keyPoints.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Key points
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {q.keyPoints.map((p, i) => (
                        <li key={i} className="flex gap-2 text-sm">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {q.followUps.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Likely follow-ups
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {q.followUps.map((f, i) => (
                        <li key={i} className="text-sm text-muted-foreground">
                          — {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
