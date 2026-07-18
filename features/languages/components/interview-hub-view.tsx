import { Code2, ListChecks, ScrollText, Sparkles, Wrench } from "lucide-react";
import type { HubCodingQuestion, HubQuestion, InterviewHub } from "../types";
import { Markdown } from "@/components/practice/markdown";
import { CodeBlock } from "./code-block";
import { OutputPredictions } from "./output-prediction";
import { exerciseDifficultyClass } from "./ui";
import { cn } from "@/lib/utils";

function DifficultyPill({ difficulty }: { difficulty: HubQuestion["difficulty"] }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium",
        exerciseDifficultyClass(difficulty),
      )}
    >
      {difficulty}
    </span>
  );
}

function QuestionList({ items }: { items: HubQuestion[] }) {
  return (
    <div className="space-y-3">
      {items.map((q) => (
        <details key={q.id} className="group rounded-xl border border-border bg-card">
          <summary className="flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
            <span className="flex-1 font-medium">{q.question}</span>
            <DifficultyPill difficulty={q.difficulty} />
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
            {q.tags && q.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {q.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}

function CodingList({ items }: { items: HubCodingQuestion[] }) {
  return (
    <div className="space-y-3">
      {items.map((c) => (
        <details key={c.id} className="group rounded-xl border border-border bg-card">
          <summary className="flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
            <span className="flex-1 font-medium">{c.title}</span>
            <DifficultyPill difficulty={c.difficulty} />
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
          <div className="space-y-4 border-t border-border p-4">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Problem
              </p>
              <Markdown>{c.promptMD}</Markdown>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Approach
              </p>
              <Markdown>{c.approachMD}</Markdown>
            </div>
            <CodeBlock code={c.solutionCode} />
            {c.complexity && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Time:</span>{" "}
                <span className="font-mono">{c.complexity.time}</span>
                {"  ·  "}
                <span className="font-medium text-foreground">Space:</span>{" "}
                <span className="font-mono">{c.complexity.space}</span>
              </p>
            )}
            {c.discussionMD && <Markdown>{c.discussionMD}</Markdown>}
          </div>
        </details>
      ))}
    </div>
  );
}

function HubSection({
  id,
  title,
  icon: Icon,
  description,
  children,
}: {
  id: string;
  title: string;
  icon: typeof Code2;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 space-y-3">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

/**
 * Renders the interview-prep hub for a language: curated theory questions,
 * function-implementation problems, machine-coding builds, output-prediction
 * puzzles, and quick-revision cheat sheets. Each section renders only if it has
 * content, so the hub grows gracefully as content is authored.
 */
export function InterviewHubView({ hub }: { hub: InterviewHub }) {
  const empty =
    hub.questions.length === 0 &&
    hub.codingQuestions.length === 0 &&
    hub.machineCoding.length === 0 &&
    hub.outputPredictions.length === 0 &&
    hub.cheatSheet.length === 0;

  if (empty) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Interview hub content is coming soon.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {hub.questions.length > 0 && (
        <HubSection
          id="questions"
          title="Top Interview Questions"
          icon={Sparkles}
          description="The theory questions asked most often, with model answers."
        >
          <QuestionList items={hub.questions} />
        </HubSection>
      )}

      {hub.codingQuestions.length > 0 && (
        <HubSection
          id="coding"
          title="Coding Questions"
          icon={Code2}
          description="Implement the utilities interviewers love."
        >
          <CodingList items={hub.codingQuestions} />
        </HubSection>
      )}

      {hub.machineCoding.length > 0 && (
        <HubSection
          id="machine-coding"
          title="Machine Coding"
          icon={Wrench}
          description="Build larger features end to end."
        >
          <CodingList items={hub.machineCoding} />
        </HubSection>
      )}

      {hub.outputPredictions.length > 0 && (
        <HubSection
          id="output"
          title="Output Prediction Puzzles"
          icon={ListChecks}
          description="Trace the output before you reveal it."
        >
          <OutputPredictions items={hub.outputPredictions} />
        </HubSection>
      )}

      {hub.cheatSheet.length > 0 && (
        <HubSection
          id="cheat-sheet"
          title="Cheat Sheets"
          icon={ScrollText}
          description="One-page revision for the night before."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {hub.cheatSheet.map((s) => (
              <div
                key={s.id}
                className="rounded-xl border border-border bg-card p-4"
              >
                <h3 className="mb-2 font-semibold">{s.title}</h3>
                <Markdown>{s.bodyMD}</Markdown>
              </div>
            ))}
          </div>
        </HubSection>
      )}
    </div>
  );
}
