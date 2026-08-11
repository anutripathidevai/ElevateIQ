"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Lightbulb,
  ListChecks,
  MessageSquareText,
  Target,
} from "lucide-react";
import { ACCENT_STYLES } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Markdown } from "@/components/practice/markdown";
import { MarkComplete } from "@/features/graph-algorithms/components/mark-complete";
import { ReadingLayout, type TocSection } from "@/components/focus-mode/reading-layout";
import type {
  CDConcept,
  CDDiagram,
  CDModuleContent,
  CDModuleMeta,
  CDScenario,
} from "../types";

/** A plain-text flow/architecture diagram rendered in a monospace panel. */
function DiagramBlock({ diagram }: { diagram: CDDiagram }) {
  return (
    <figure className="my-4 overflow-hidden rounded-xl border border-border bg-muted/30">
      {diagram.title && (
        <figcaption className="border-b border-border px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {diagram.title}
        </figcaption>
      )}
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-foreground sm:text-sm">
        {diagram.body}
      </pre>
    </figure>
  );
}

/** One teaching concept: What / How / diagram / interview points / real world. */
function ConceptSection({
  concept,
  accent,
}: {
  concept: CDConcept;
  accent: keyof typeof ACCENT_STYLES;
}) {
  const a = ACCENT_STYLES[accent];
  return (
    <section id={concept.id} className="scroll-mt-24 space-y-4 border-t border-border pt-8">
      <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
        {concept.title}
      </h2>

      <Markdown>{concept.whatMD}</Markdown>

      {concept.howMD && <Markdown>{concept.howMD}</Markdown>}

      {concept.diagram && <DiagramBlock diagram={concept.diagram} />}

      {concept.interviewPoints.length > 0 && (
        <div className={cn("rounded-xl border p-4", a.border, a.bg)}>
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
            <Target className={cn("h-4 w-4", a.text)} /> What matters in interviews
          </p>
          <ul className="space-y-1.5">
            {concept.interviewPoints.map((p, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", a.solid)} />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {concept.realWorldMD && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
            <Lightbulb className="h-4 w-4 text-amber-500" /> Real-world example
          </p>
          <div className="md">
            <Markdown>{concept.realWorldMD}</Markdown>
          </div>        </div>
      )}

      {concept.interviewQuestions && concept.interviewQuestions.length > 0 && (
        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
            <MessageSquareText className="h-4 w-4 text-muted-foreground" /> Likely
            interview questions
          </p>
          <ul className="space-y-1.5">
            {concept.interviewQuestions.map((q, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                <span className="text-muted-foreground/60">{i + 1}.</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/** A production-incident scenario card. */
function ScenarioCard({ scenario }: { scenario: CDScenario }) {
  return (
    <div id={scenario.id} className="scroll-mt-24 rounded-xl border border-border bg-card p-5">
      <h3 className="font-semibold tracking-tight">{scenario.title}</h3>
      <div className="mt-2 text-sm">
        <Markdown>{scenario.symptomsMD}</Markdown>
      </div>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            What to check
          </p>
          <ul className="mt-1.5 space-y-1">
            {scenario.whatToCheck.map((c, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Possible causes
          </p>
          <ul className="mt-1.5 space-y-1">
            {scenario.possibleCauses.map((c, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <div className="text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Resolution
          </p>
          <Markdown>{scenario.resolutionMD}</Markdown>
        </div>
        <div className="text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Prevention
          </p>
          <Markdown>{scenario.preventionMD}</Markdown>
        </div>
      </div>
    </div>
  );
}

/**
 * Full renderer for a published Cloud & DevOps module. Uses the shared
 * ReadingLayout (scroll-spy TOC) with sections built from the concepts and
 * scenarios, and reuses MarkComplete for progress. Entirely data-driven.
 */
export function ModuleView({
  meta,
  content,
  readingMinutes,
}: {
  meta: CDModuleMeta;
  content: CDModuleContent;
  readingMinutes: number;
}) {
  const a = ACCENT_STYLES[meta.accent];

  const sections: TocSection[] = [
    { id: "overview", label: "Overview" },
    ...content.concepts.map((c) => ({ id: c.id, label: c.title })),
    ...(content.scenarios && content.scenarios.length > 0
      ? [{ id: "scenarios", label: "Production Scenarios" }]
      : []),
    { id: "takeaways", label: "Key Takeaways" },
  ];

  return (
    <ReadingLayout sections={sections}>
      <article className="min-w-0 space-y-8">
        <div className="space-y-5">
          <Link
            href="/learning/cloud-devops"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> All Cloud &amp; DevOps modules
          </Link>

          <header
            id="overview"
            className={cn(
              "scroll-mt-24 overflow-hidden rounded-2xl border bg-gradient-to-br p-6 sm:p-8",
              a.border,
              a.gradient,
            )}
          >
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <span>Cloud &amp; DevOps</span>
              <span>/</span>
              <span>Module {meta.order}</span>
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              {meta.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <MarkComplete slug={`cloud-devops:${meta.slug}`} />
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> {readingMinutes} min read
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground">
                <ListChecks className="h-3.5 w-3.5" /> {content.concepts.length}{" "}
                concepts
              </span>
            </div>
          </header>

          <div className="md">
            <Markdown>{content.introMD}</Markdown>
          </div>

          {content.coreFlow && <DiagramBlock diagram={content.coreFlow} />}

          {content.seniorFocus.length > 0 && (
            <div className={cn("rounded-xl border p-4", a.border, a.bg)}>
              <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                <Target className={cn("h-4 w-4", a.text)} /> Senior-level focus
              </p>
              <ul className="space-y-1.5">
                {content.seniorFocus.map((f, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                    <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", a.solid)} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {content.concepts.map((c) => (
          <ConceptSection key={c.id} concept={c} accent={meta.accent} />
        ))}

        {content.scenarios && content.scenarios.length > 0 && (
          <section id="scenarios" className="scroll-mt-24 space-y-4 border-t border-border pt-8">
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              Production Scenarios
            </h2>
            <div className="space-y-4">
              {content.scenarios.map((s) => (
                <ScenarioCard key={s.id} scenario={s} />
              ))}
            </div>
          </section>
        )}

        <section id="takeaways" className="scroll-mt-24 space-y-4 border-t border-border pt-8">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            Key Takeaways
          </h2>
          <ul className="space-y-2">
            {content.keyTakeaways.map((t, i) => (
              <li
                key={i}
                className="flex gap-2 rounded-lg border border-border bg-card p-3 text-sm"
              >
                <span className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full", a.solid)} />
                <span>{t}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <MarkComplete slug={`cloud-devops:${meta.slug}`} />
            <Link
              href="/learning/cloud-devops/questions"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted/50"
            >
              <MessageSquareText className="h-4 w-4" /> Practice interview questions
            </Link>
          </div>
        </section>
      </article>
    </ReadingLayout>
  );
}

