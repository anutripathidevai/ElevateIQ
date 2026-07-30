import type { InterviewQuestion } from "../types";
import { Markdown } from "@/components/practice/markdown";

/**
 * Interview questions with model answers, rendered as expandable cards. Each may
 * list the companies that ask it and common follow-ups, so the learner can
 * rehearse the whole thread the way a real interview unfolds.
 */
export function InterviewQuestions({ items }: { items: InterviewQuestion[] }) {
  return (
    <div className="space-y-3">
      {items.map((q, i) => (
        <details
          key={i}
          className="group rounded-xl border border-border bg-card"
        >
          <summary className="flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {i + 1}
            </span>
            <span className="flex-1 font-medium">{q.question}</span>
            <svg
              className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="border-t border-border p-4">
            <Markdown>{q.answerMD}</Markdown>
            {q.companies && q.companies.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Asked at:</span>
                {q.companies.map((c) => (
                  <span
                    key={c}
                    className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}
            {q.followUps && q.followUps.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Follow-ups
                </p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {q.followUps.map((f, fi) => (
                    <li key={fi}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}
