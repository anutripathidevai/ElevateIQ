"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  BookOpen,
  ClipboardList,
  Clock,
  GitBranch,
  Lightbulb,
  Link2,
  ListChecks,
  ListOrdered,
  Network,
  Printer,
  Repeat,
  Share2,
  Table2,
  Target,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { Markdown } from "@/components/practice/markdown";
import { ACCENT_STYLES, type AccentKey } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { GraphSection, MarkComplete } from "@/features/graph-algorithms/components";
import type { LLDConceptContent, LLDProblemMeta } from "../types";
import { LLD_TIERS } from "../registry";
import { MermaidDiagram } from "./mermaid-diagram";
import { Quiz } from "./quiz";
import { Flashcards } from "./flashcards";
import {
  recordRecentlyViewed,
  toggleBookmark,
  useIsBookmarked,
} from "./progress-store";

interface RelatedTarget {
  slug: string;
  title: string;
  note?: string;
}

/**
 * Renders a Low Level Design *concept* lesson (OOP, SOLID, patterns, UML,
 * concurrency, …) — lighter than a full problem: intro, objectives, theory
 * blocks with optional Java + diagrams, comparisons, best practices, common
 * mistakes, quiz, flashcards, cheat sheet, references.
 */
export function ConceptView({
  meta,
  content,
  readingMinutes,
  related,
  tierLabel,
}: {
  meta: LLDProblemMeta;
  content: LLDConceptContent;
  readingMinutes: number;
  related: RelatedTarget[];
  tierLabel: string;
}) {
  const accent: AccentKey =
    LLD_TIERS.find((t) => t.id === meta.tier)?.accent ?? "emerald";
  const a = ACCENT_STYLES[accent];
  const [interviewMode, setInterviewMode] = useState(false);
  const bookmarked = useIsBookmarked(meta.slug);
  const [copied, setCopied] = useState(false);
  const open = !interviewMode;

  useEffect(() => {
    recordRecentlyViewed(meta.slug);
  }, [meta.slug]);

  const share = async () => {
    try {
      const url = typeof window !== "undefined" ? window.location.href : "";
      if (navigator.share) {
        await navigator.share({ title: meta.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href="/learning/lld"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All low level design problems
      </Link>

      <header
        className={cn(
          "overflow-hidden rounded-2xl border bg-gradient-to-br p-6 sm:p-8",
          a.border,
          a.gradient,
        )}
      >
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <span>Low Level Design</span>
          <span>/</span>
          <span>{tierLabel}</span>
          <span>/</span>
          <span className="inline-flex items-center gap-1">
            <BookOpen className="h-3 w-3" /> Concept
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {meta.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <MarkComplete slug={meta.slug} />
            <button
              type="button"
              onClick={() => toggleBookmark(meta.slug)}
              aria-pressed={bookmarked}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                bookmarked
                  ? cn(a.border, a.bg, a.text)
                  : "border-border bg-card text-foreground hover:bg-muted/50",
              )}
            >
              <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
              {bookmarked ? "Saved" : "Save"}
            </button>
          </div>
        </div>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground sm:text-base">
          {meta.summary}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> {readingMinutes}m read
          </span>
          {meta.tags.slice(0, 5).map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setInterviewMode((m) => !m)}
            aria-pressed={interviewMode}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              interviewMode
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            <Target className="h-3.5 w-3.5" />
            {interviewMode ? "Focus mode: on" : "Focus mode"}
          </button>
          <button
            type="button"
            onClick={share}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Share2 className="h-3.5 w-3.5" /> {copied ? "Link copied" : "Share"}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Printer className="h-3.5 w-3.5" /> Download PDF
          </button>
        </div>
      </header>

      <div className="space-y-5">
        {/* Introduction */}
        <GraphSection id="intro" title="Introduction" icon={Lightbulb} accent={accent} defaultOpen>
          <Markdown>{content.introMD}</Markdown>
        </GraphSection>

        {/* Learning objectives */}
        <GraphSection id="objectives" title="Learning Objectives" icon={ListChecks} accent={accent} defaultOpen={open}>
          <ul className="space-y-2">
            {content.learningObjectives.map((o, i) => (
              <li key={i} className="flex gap-2.5 text-sm">
                <ListChecks className={cn("mt-0.5 h-4 w-4 shrink-0", a.text)} />
                <Markdown className="[&_p]:m-0">{o}</Markdown>
              </li>
            ))}
          </ul>
        </GraphSection>

        {/* Theory */}
        <GraphSection id="theory" title="Core Theory" icon={BookOpen} accent={accent} defaultOpen={open}>
          <div className="space-y-4">
            {content.theory.map((t, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-4">
                <h4 className={cn("text-sm font-semibold", a.text)}>{t.title}</h4>
                <Markdown className="mt-1.5">{t.detailMD}</Markdown>
                {t.code && (
                  <pre className="mt-2 overflow-x-auto rounded-md border border-border bg-background p-3 font-mono text-xs">
                    {t.code}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </GraphSection>

        {/* Diagrams */}
        {content.diagrams && content.diagrams.length > 0 && (
          <GraphSection id="diagrams" title="Diagrams" icon={Network} accent={accent} defaultOpen={open}>
            <div className="space-y-4">
              {content.diagrams.map((d, i) => (
                <div key={i}>
                  <p className="mb-1.5 text-sm font-semibold">{d.title}</p>
                  <MermaidDiagram title={d.title} chart={d.mermaid} captionMD={d.captionMD} />
                </div>
              ))}
            </div>
          </GraphSection>
        )}

        {/* Comparisons */}
        {content.comparisons && content.comparisons.length > 0 && (
          <GraphSection id="comparisons" title="Comparisons" icon={Table2} accent={accent} defaultOpen={open}>
            <div className="space-y-5">
              {content.comparisons.map((c, i) => (
                <div key={i}>
                  <p className="mb-1.5 text-sm font-semibold">{c.title}</p>
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          {c.columns.map((col) => (
                            <th key={col} className="whitespace-nowrap border-b border-border px-3 py-2 text-left font-semibold">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {c.rows.map((row, ri) => (
                          <tr key={ri} className="odd:bg-background even:bg-muted/20">
                            {row.map((cell, ci) => (
                              <td key={ci} className="border-b border-border px-3 py-2 align-top">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </GraphSection>
        )}

        {/* Best practices */}
        <GraphSection id="best-practices" title="Best Practices" icon={Target} accent={accent} defaultOpen={open}>
          <ul className="space-y-1.5 text-sm">
            {content.bestPractices.map((b, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-bold text-success">✓</span>
                <Markdown className="[&_p]:m-0">{b}</Markdown>
              </li>
            ))}
          </ul>
        </GraphSection>

        {/* Common mistakes */}
        <GraphSection id="mistakes" title="Common Mistakes" icon={TriangleAlert} accent={accent} defaultOpen={open}>
          <ul className="space-y-1.5 text-sm">
            {content.commonMistakes.map((m, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-bold text-danger">×</span>
                <Markdown className="[&_p]:m-0">{m}</Markdown>
              </li>
            ))}
          </ul>
        </GraphSection>

        {/* Quiz */}
        <GraphSection id="quiz" title="Quiz" icon={ListOrdered} accent={accent} defaultOpen={open}>
          <Quiz items={content.quiz} />
        </GraphSection>

        {/* Flashcards */}
        <GraphSection id="flashcards" title="Flashcards" icon={Repeat} accent={accent} defaultOpen={open}>
          <Flashcards cards={content.flashcards} />
        </GraphSection>

        {/* Cheat sheet */}
        <GraphSection id="cheat-sheet" title="Cheat Sheet" icon={ClipboardList} accent={accent} defaultOpen={open}>
          <div className={cn("rounded-lg border p-4", a.border, a.bg)}>
            <Markdown>{content.cheatSheetMD}</Markdown>
          </div>
        </GraphSection>

        {/* References */}
        <GraphSection id="references" title="References" icon={Link2} accent={accent} defaultOpen={open}>
          <ul className="space-y-2 text-sm">
            {content.references.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="rounded-md border border-border px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">{r.kind}</span>
                <span>
                  {r.url ? (
                    <a href={r.url} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">{r.title}</a>
                  ) : (
                    <span className="font-medium">{r.title}</span>
                  )}
                  {r.author && <span className="text-muted-foreground"> — {r.author}</span>}
                </span>
              </li>
            ))}
          </ul>
        </GraphSection>

        {/* Related */}
        {related.length > 0 && (
          <GraphSection id="related" title="Related" icon={GitBranch} accent={accent} defaultOpen={open}>
            <div className="grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/learning/lld/${r.slug}`}
                  className="rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/40"
                >
                  <p className="text-sm font-semibold">{r.title}</p>
                  {r.note && <p className="mt-0.5 text-xs text-muted-foreground">{r.note}</p>}
                </Link>
              ))}
            </div>
          </GraphSection>
        )}
      </div>
    </div>
  );
}
