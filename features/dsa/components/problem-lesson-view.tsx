import {
  ArrowRightLeft,
  Boxes,
  Code2,
  FileText,
  Gauge,
  KeyRound,
  Lightbulb,
  MessagesSquare,
  Network,
  PlayCircle,
  Target,
  Workflow,
} from "lucide-react";
import { Markdown } from "@/components/practice/markdown";
import { ACCENT_STYLES, type AccentKey } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import {
  ComplexityCards,
  DryRunTable,
  GraphSection,
  ProblemNav,
  SimilarProblems,
  SolutionList,
} from "@/features/graph-algorithms/components";
import type { DsaProblemLesson } from "../types";
import { ReadingLayout } from "@/components/focus-mode";
import { LessonMeta } from "./lesson-meta";
import { MarkComplete } from "@/features/graph-algorithms/components";
import { RecursionTree } from "./recursion-tree";
import { problemSections } from "./lesson-sections";

interface NavTarget {
  slug: string;
  title: string;
}

/**
 * Renders a full problem lesson using the shared Graph section components, so
 * Dynamic Programming and Graph Algorithms problems look and behave identically.
 * DP-specific sections (State Definition, State Transition, Complexity Analysis)
 * render only when the lesson provides that content.
 */
export function ProblemLessonView({
  lesson,
  moduleLabel,
  accent,
  position,
  total,
  basePath,
  prev,
  next,
}: {
  lesson: DsaProblemLesson;
  moduleLabel?: string;
  accent: AccentKey;
  /** 1-based position among the course's problems. */
  position: number;
  total: number;
  basePath: string;
  prev?: NavTarget;
  next?: NavTarget;
}) {
  const a = ACCENT_STYLES[accent];
  const sections = problemSections(lesson);

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        {moduleLabel && (
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-2.5 py-0.5 text-xs font-medium",
              a.bg,
              a.text,
            )}
          >
            {moduleLabel}
          </div>
        )}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {lesson.title}
          </h1>
          <MarkComplete slug={lesson.slug} />
        </div>
        <LessonMeta lesson={lesson} position={position} total={total} />
      </header>

      <ReadingLayout sections={sections}>
        <div className="min-w-0 space-y-5">
          {/* 1 — Problem statement */}
          <GraphSection
            id="statement"
            title="Problem Statement"
            icon={FileText}
            accent={accent}
          >
            <div className="space-y-5">
              <Markdown>{lesson.statementMD}</Markdown>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Input
                  </h4>
                  <Markdown>{lesson.inputMD}</Markdown>
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Output
                  </h4>
                  <Markdown>{lesson.outputMD}</Markdown>
                </div>
              </div>

              <div>
                <h4 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Constraints
                </h4>
                <ul className="space-y-1 text-sm">
                  {lesson.constraints.map((c, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-muted-foreground">•</span>
                      <code className="font-mono text-xs">{c}</code>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Examples
                </h4>
                {lesson.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border bg-muted/30 p-4"
                  >
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Example {i + 1}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Input: </span>
                        <pre className="mt-1 overflow-x-auto whitespace-pre-wrap rounded-md border border-border bg-background p-2 font-mono text-xs">
                          {ex.input}
                        </pre>
                      </div>
                      <div>
                        <span className="font-medium">Output: </span>
                        <code className="font-mono text-xs">{ex.output}</code>
                      </div>
                      {ex.explanation && (
                        <div className="text-muted-foreground">
                          <span className="font-medium text-foreground">
                            Explanation:{" "}
                          </span>
                          {ex.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GraphSection>

          {/* 3 — Learning objectives */}
          <GraphSection
            id="objectives"
            title="Learning Objectives"
            icon={Target}
            accent={accent}
          >
            <ul className="space-y-2">
              {lesson.learningObjectives.map((o, i) => (
                <li key={i} className="flex gap-2.5 text-sm">
                  <Target className={cn("mt-0.5 h-4 w-4 shrink-0", a.text)} />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </GraphSection>

          {/* 4 — Intuition */}
          <GraphSection
            id="intuition"
            title="Intuition"
            icon={Lightbulb}
            accent={accent}
          >
            <div className="space-y-4">
              <Markdown>{lesson.intuitionMD}</Markdown>
              {lesson.recursionTree && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {lesson.recursionTree.rootLabel}
                  </h4>
                  <RecursionTree
                    root={lesson.recursionTree.root}
                    accent={accent}
                  />
                  {lesson.recursionTree.captionMD && (
                    <div className="text-xs text-muted-foreground">
                      <Markdown>{lesson.recursionTree.captionMD}</Markdown>
                    </div>
                  )}
                </div>
              )}
              {lesson.commonMistakes.length > 0 && (
                <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-warning">
                    <Lightbulb className="h-4 w-4" /> Common mistakes
                  </h4>
                  <ul className="space-y-1.5 text-sm">
                    {lesson.commonMistakes.map((m, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-warning">×</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </GraphSection>

          {/* 5 — State definition (DP) */}
          {lesson.stateDefinitionMD && (
            <GraphSection
              id="state-definition"
              title="State Definition"
              icon={Boxes}
              accent={accent}
            >
              <Markdown>{lesson.stateDefinitionMD}</Markdown>
            </GraphSection>
          )}

          {/* 6 — State transition (DP) */}
          {lesson.stateTransitionMD && (
            <GraphSection
              id="state-transition"
              title="State Transition"
              icon={ArrowRightLeft}
              accent={accent}
            >
              <Markdown>{lesson.stateTransitionMD}</Markdown>
            </GraphSection>
          )}

          {/* Algorithm explanation (Graph) */}
          {lesson.algorithmMD && (
            <GraphSection
              id="algorithm"
              title="Algorithm Explanation"
              icon={Workflow}
              accent={accent}
            >
              <Markdown>{lesson.algorithmMD}</Markdown>
            </GraphSection>
          )}

          {/* 7 — Solutions */}
          <GraphSection
            id="solutions"
            title="Solutions"
            icon={Code2}
            accent={accent}
          >
            <SolutionList solutions={lesson.solutions} />
          </GraphSection>

          {/* 8 — Dry run */}
          <GraphSection
            id="dry-run"
            title="Dry Run"
            icon={PlayCircle}
            accent={accent}
          >
            <DryRunTable dryRun={lesson.dryRun} />
          </GraphSection>

          {/* 9 — Complexity analysis (DP) */}
          {(lesson.stateDefinitionMD || lesson.stateTransitionMD) && (
            <GraphSection
              id="complexity"
              title="Complexity Analysis"
              icon={Gauge}
              accent={accent}
            >
              <div className="space-y-4">
                {lesson.complexityNote && (
                  <Markdown>{lesson.complexityNote}</Markdown>
                )}
                <div className="space-y-4">
                  {lesson.solutions.map((s) => (
                    <div key={s.name} className="space-y-2">
                      <h4 className="text-sm font-semibold">{s.name}</h4>
                      <ComplexityCards complexity={s.complexity} />
                    </div>
                  ))}
                </div>
              </div>
            </GraphSection>
          )}

          {/* 10 — Interview tips */}
          <GraphSection
            id="interview-tips"
            title="Interview Tips"
            icon={MessagesSquare}
            accent={accent}
          >
            <div className="space-y-4">
              <Markdown>{lesson.interviewTipsMD}</Markdown>
              {lesson.followUps.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Likely follow-ups
                  </h4>
                  <ul className="space-y-1.5 text-sm">
                    {lesson.followUps.map((f, i) => (
                      <li key={i} className="flex gap-2">
                        <MessagesSquare
                          className={cn("mt-0.5 h-4 w-4 shrink-0", a.text)}
                        />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </GraphSection>

          {/* 11 — Similar problems */}
          <GraphSection
            id="similar"
            title="Similar Problems"
            icon={Network}
            accent={accent}
          >
            <SimilarProblems items={lesson.similarProblems} basePath={basePath} />
          </GraphSection>

          {/* 12 — Key takeaways */}
          <GraphSection
            id="takeaways"
            title="Key Takeaways"
            icon={KeyRound}
            accent={accent}
          >
            <div className="space-y-4">
              <ul className="space-y-2">
                {lesson.keyTakeaways.map((k, i) => (
                  <li key={i} className="flex gap-2.5 text-sm">
                    <KeyRound className={cn("mt-0.5 h-4 w-4 shrink-0", a.text)} />
                    <span>{k}</span>
                  </li>
                ))}
              </ul>
              <div
                className={cn(
                  "rounded-lg border p-4 text-sm",
                  a.border,
                  a.bg,
                )}
              >
                <span className="font-semibold">Reusable template: </span>
                {lesson.pattern}
              </div>
            </div>
          </GraphSection>

          <ProblemNav prev={prev} next={next} basePath={basePath} />
        </div>
      </ReadingLayout>
    </div>
  );
}
