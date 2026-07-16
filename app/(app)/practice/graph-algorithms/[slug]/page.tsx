import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  Code2,
  FileText,
  KeyRound,
  Lightbulb,
  MessagesSquare,
  Network,
  PlayCircle,
  Target,
  Workflow,
} from "lucide-react";
import { Markdown } from "@/components/practice/markdown";
import { ACCENT_STYLES } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import {
  adjacentProblems,
  getModule,
  getProblem,
  PLANNED_PROBLEM_COUNT,
  PROBLEMS_IN_ORDER,
} from "@/features/graph-algorithms";
import {
  DryRunTable,
  GraphSection,
  MarkComplete,
  ProblemMeta,
  ProblemNav,
  ProblemToc,
  SimilarProblems,
  SolutionList,
  moduleAccent,
} from "@/features/graph-algorithms/components";

export function generateStaticParams() {
  return PROBLEMS_IN_ORDER.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const problem = getProblem(params.slug);
  return { title: problem ? problem.title : "Graph problem" };
}

export default function GraphProblemPage({
  params,
}: {
  params: { slug: string };
}) {
  const problem = getProblem(params.slug);
  if (!problem) notFound();

  const mod = getModule(problem.moduleId);
  const accent = moduleAccent(mod?.order ?? 1);
  const a = ACCENT_STYLES[accent];
  const { prev, next } = adjacentProblems(problem.slug);

  return (
    <div className="space-y-6">
      <Link
        href="/practice/graph-algorithms"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Graph Algorithms
      </Link>

      <header className="space-y-3">
        {mod && (
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-2.5 py-0.5 text-xs font-medium",
              a.bg,
              a.text,
            )}
          >
            Module {mod.order} · {mod.title}
          </div>
        )}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {problem.title}
          </h1>
          <MarkComplete slug={problem.slug} />
        </div>
        <ProblemMeta problem={problem} total={PLANNED_PROBLEM_COUNT} />
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="min-w-0 space-y-5">
          {/* 1 — Problem statement */}
          <GraphSection
            id="statement"
            title="Problem Statement"
            icon={FileText}
            accent={accent}
          >
            <div className="space-y-5">
              <Markdown>{problem.statementMD}</Markdown>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Input
                  </h4>
                  <Markdown>{problem.inputMD}</Markdown>
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Output
                  </h4>
                  <Markdown>{problem.outputMD}</Markdown>
                </div>
              </div>

              <div>
                <h4 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Constraints
                </h4>
                <ul className="space-y-1 text-sm">
                  {problem.constraints.map((c, i) => (
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
                {problem.examples.map((ex, i) => (
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
              {problem.learningObjectives.map((o, i) => (
                <li key={i} className="flex gap-2.5 text-sm">
                  <Target
                    className={cn("mt-0.5 h-4 w-4 shrink-0", a.text)}
                  />
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
              <Markdown>{problem.intuitionMD}</Markdown>
              {problem.commonMistakes.length > 0 && (
                <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-warning">
                    <Lightbulb className="h-4 w-4" /> Common mistakes
                  </h4>
                  <ul className="space-y-1.5 text-sm">
                    {problem.commonMistakes.map((m, i) => (
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

          {/* 5 — Algorithm explanation */}
          <GraphSection
            id="algorithm"
            title="Algorithm Explanation"
            icon={Workflow}
            accent={accent}
          >
            <Markdown>{problem.algorithmMD}</Markdown>
          </GraphSection>

          {/* 6 — Solutions */}
          <GraphSection
            id="solutions"
            title="Solutions"
            icon={Code2}
            accent={accent}
          >
            <SolutionList solutions={problem.solutions} />
          </GraphSection>

          {/* 7 — Dry run */}
          <GraphSection
            id="dry-run"
            title="Dry Run"
            icon={PlayCircle}
            accent={accent}
          >
            <DryRunTable dryRun={problem.dryRun} />
          </GraphSection>

          {/* 8 — Interview tips */}
          <GraphSection
            id="interview-tips"
            title="Interview Tips"
            icon={MessagesSquare}
            accent={accent}
          >
            <div className="space-y-4">
              <Markdown>{problem.interviewTipsMD}</Markdown>
              {problem.followUps.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Likely follow-ups
                  </h4>
                  <ul className="space-y-1.5 text-sm">
                    {problem.followUps.map((f, i) => (
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

          {/* 9 — Similar problems */}
          <GraphSection
            id="similar"
            title="Similar Problems"
            icon={Network}
            accent={accent}
          >
            <SimilarProblems items={problem.similarProblems} />
          </GraphSection>

          {/* 10 — Key takeaways */}
          <GraphSection
            id="takeaways"
            title="Key Takeaways"
            icon={KeyRound}
            accent={accent}
          >
            <div className="space-y-4">
              <ul className="space-y-2">
                {problem.keyTakeaways.map((k, i) => (
                  <li key={i} className="flex gap-2.5 text-sm">
                    <KeyRound
                      className={cn("mt-0.5 h-4 w-4 shrink-0", a.text)}
                    />
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
                {problem.pattern}
              </div>
            </div>
          </GraphSection>

          <ProblemNav
            prev={prev ? { slug: prev.slug, title: prev.title } : undefined}
            next={next ? { slug: next.slug, title: next.title } : undefined}
          />
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <ProblemToc />
          </div>
        </aside>
      </div>
    </div>
  );
}
