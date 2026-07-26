"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Bookmark,
  Building2,
  Clock,
  Code2,
  Compass,
  FileText,
  Flame,
  FlaskConical,
  Gauge,
  GitBranch,
  Layers,
  Lightbulb,
  Link2,
  ListChecks,
  ListOrdered,
  MessagesSquare,
  Network,
  Printer,
  Share2,
  Sparkles,
  Table2,
  Target,
  TrendingUp,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { Markdown } from "@/components/practice/markdown";
import { ACCENT_STYLES, type AccentKey } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { GraphSection, MarkComplete } from "@/features/graph-algorithms/components";
import { ArchitectureDiagram, Quiz, Flashcards } from "@/features/system-design/components";
import type { GenAILessonContent, GenAILessonMeta } from "../types";
import { GENAI_TIERS } from "../registry";
import {
  recordRecentlyViewed,
  toggleBookmark,
  useIsBookmarked,
} from "./bookmark-store";

interface RelatedTarget {
  slug: string;
  title: string;
  note?: string;
}

/**
 * Renders a full AI System Design lesson from typed content. Client component so
 * it can host the interactive diagram, quiz, flashcards, bookmark + completion
 * state, interview mode (collapse sections + progressive hints), print, and
 * share. Optional sections render only when the content provides them.
 */
export function LessonView({
  meta,
  content,
  readingMinutes,
  related,
  tierLabel,
}: {
  meta: GenAILessonMeta;
  content: GenAILessonContent;
  readingMinutes: number;
  related: RelatedTarget[];
  tierLabel: string;
}) {
  const accent: AccentKey =
    GENAI_TIERS.find((t) => t.id === meta.tier)?.accent ?? "blue";
  const a = ACCENT_STYLES[accent];
  const [interviewMode, setInterviewMode] = useState(false);
  const bookmarked = useIsBookmarked(meta.slug);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    recordRecentlyViewed(meta.slug);
  }, [meta.slug]);

  const open = !interviewMode;

  const hasArchitecture = Boolean(content.architecture);
  const hasPlayground = Boolean(content.playground);
  const hasComparisons =
    content.comparisons.length > 0 || Boolean(content.decisionGuideMD);

  const sections: { id: string; label: string }[] = [
    { id: "introduction", label: "Introduction" },
    { id: "objectives", label: "Learning Objectives" },
    { id: "theory", label: "Theory & Concepts" },
    ...(hasArchitecture
      ? [{ id: "architecture", label: "Architecture Diagram" }]
      : []),
    { id: "flow", label: "Request Flow" },
    { id: "deep-dive", label: "Deep Dive" },
    { id: "production", label: "Production Considerations" },
    { id: "interview", label: "Interview Perspective" },
    ...(hasPlayground ? [{ id: "playground", label: "Playground" }] : []),
    ...(hasComparisons ? [{ id: "visual", label: "Visual Learning" }] : []),
    { id: "hands-on", label: "Hands-on Examples" },
    { id: "quiz", label: "Quiz" },
    { id: "flashcards", label: "Flashcards" },
    { id: "cheat-sheet", label: "Cheat Sheet" },
    { id: "references", label: "References" },
    ...(related.length > 0 ? [{ id: "related", label: "Related Lessons" }] : []),
  ];

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
      /* user cancelled / clipboard blocked — ignore */
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href="/learning/generative-ai"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All AI system design lessons
      </Link>

      {/* Header */}
      <header
        className={cn(
          "overflow-hidden rounded-2xl border bg-gradient-to-br p-6 sm:p-8",
          a.border,
          a.gradient,
        )}
      >
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <span>Generative AI</span>
          <span>/</span>
          <span>{tierLabel}</span>
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
          <MetaChip icon={Gauge}>{meta.difficulty}</MetaChip>
          <MetaChip icon={Clock}>{meta.estimatedMinutes}m interview</MetaChip>
          <MetaChip icon={FileText}>{readingMinutes}m read</MetaChip>
          <MetaChip icon={Flame}>{meta.frequency} frequency</MetaChip>
          <MetaChip icon={TrendingUp}>Popularity {meta.popularity}</MetaChip>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {meta.topics.map((t) => (
            <span
              key={t}
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px]",
                a.border,
                a.text,
              )}
            >
              <Sparkles className="h-3 w-3" /> {t}
            </span>
          ))}
          {meta.companies.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              <Building2 className="h-3 w-3" /> {c}
            </span>
          ))}
        </div>

        {/* Toolbar */}
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
            {interviewMode ? "Interview mode: on" : "Interview mode"}
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
        {interviewMode && (
          <p className="mt-3 text-xs text-muted-foreground">
            Sections are collapsed so you can attempt the design first. Reveal
            the hints below one at a time, then expand each section to check your
            approach.
          </p>
        )}
      </header>

      {interviewMode && content.interviewHints.length > 0 && (
        <HintsPanel hints={content.interviewHints} accent={accent} />
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="min-w-0 space-y-5">
          {/* 1 — Introduction */}
          <GraphSection
            id="introduction"
            title="Introduction"
            icon={FileText}
            accent={accent}
            defaultOpen
          >
            <div className="space-y-4">
              <Markdown>{content.introductionMD}</Markdown>
              <div className={cn("rounded-lg border p-4", a.border, a.bg)}>
                <h4 className="mb-1 flex items-center gap-2 text-sm font-semibold">
                  <Lightbulb className={cn("h-4 w-4", a.text)} /> Where this shows
                  up in production
                </h4>
                <Markdown>{content.realWorldMD}</Markdown>
              </div>
            </div>
          </GraphSection>

          {/* 2 — Learning objectives */}
          <GraphSection
            id="objectives"
            title="Learning Objectives"
            icon={ListChecks}
            accent={accent}
            defaultOpen={open}
          >
            <ul className="space-y-2">
              {content.learningObjectives.map((o, i) => (
                <li key={i} className="flex gap-2.5 text-sm">
                  <ListChecks className={cn("mt-0.5 h-4 w-4 shrink-0", a.text)} />
                  <Markdown className="[&_p]:m-0">{o}</Markdown>
                </li>
              ))}
            </ul>
          </GraphSection>

          {/* 3 — Theory & concepts */}
          <GraphSection
            id="theory"
            title="Theory & Concepts"
            icon={Layers}
            accent={accent}
            defaultOpen={open}
          >
            <NamedDetailList items={content.theory} accent={accent} />
          </GraphSection>

          {/* 4 — Architecture diagram */}
          {content.architecture && (
            <GraphSection
              id="architecture"
              title="Architecture Diagram"
              icon={Network}
              accent={accent}
              defaultOpen={open}
            >
              <div className="space-y-4">
                <ArchitectureDiagram
                  architecture={content.architecture}
                  title={`${meta.title} — Architecture`}
                />
                {content.architectureNotesMD && (
                  <Markdown>{content.architectureNotesMD}</Markdown>
                )}
              </div>
            </GraphSection>
          )}

          {/* 5 — Request flow */}
          <GraphSection
            id="flow"
            title="Request Flow"
            icon={ListOrdered}
            accent={accent}
            defaultOpen={open}
          >
            <ol className="space-y-3">
              {content.requestFlow.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                      a.solid,
                    )}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold">{s.step}</h4>
                    <Markdown>{s.detailMD}</Markdown>
                  </div>
                </li>
              ))}
            </ol>
          </GraphSection>

          {/* 6 — Deep dive */}
          <GraphSection
            id="deep-dive"
            title="Deep Dive"
            icon={Compass}
            accent={accent}
            defaultOpen={open}
          >
            <NamedDetailList items={content.deepDives} accent={accent} />
          </GraphSection>

          {/* 7 — Production considerations */}
          <GraphSection
            id="production"
            title="Production Considerations"
            icon={Gauge}
            accent={accent}
            defaultOpen={open}
          >
            <NamedDetailList
              items={content.productionConsiderations}
              accent={accent}
            />
          </GraphSection>

          {/* 8 — Interview perspective */}
          <GraphSection
            id="interview"
            title="Interview Perspective"
            icon={Target}
            accent={accent}
            defaultOpen={open}
          >
            <div className="space-y-5">
              <div>
                <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  What interviewers look for
                </h4>
                <ul className="space-y-1.5 text-sm">
                  {content.interview.whatInterviewersLookFor.map((it, i) => (
                    <li key={i} className="flex gap-2">
                      <span className={cn("font-bold", a.text)}>✓</span>
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {content.interview.alternativeDesigns.length > 0 && (
                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    <GitBranch className="h-4 w-4" /> Alternative designs
                  </h4>
                  <div className="space-y-3">
                    {content.interview.alternativeDesigns.map((alt, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-border bg-card p-4"
                      >
                        <h5 className={cn("mb-1 text-sm font-semibold", a.text)}>
                          {alt.name}
                        </h5>
                        <Markdown>{alt.detailMD}</Markdown>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  <MessagesSquare className="h-4 w-4" /> Likely follow-up
                  questions
                </h4>
                <div className="space-y-2">
                  {content.interview.followUps.map((f, i) => (
                    <details
                      key={i}
                      className="group rounded-lg border border-border bg-card"
                    >
                      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium">
                        <MessagesSquare
                          className={cn("h-4 w-4 shrink-0", a.text)}
                        />
                        <span className="flex-1">{f.question}</span>
                      </summary>
                      <div className="border-t border-border px-4 py-3 text-sm">
                        <Markdown>{f.answerMD}</Markdown>
                      </div>
                    </details>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 text-warning" /> Common
                  mistakes
                </h4>
                <ul className="space-y-1.5 text-sm">
                  {content.interview.commonMistakes.map((m, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="font-bold text-danger">×</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </GraphSection>

          {/* 9 — Playground */}
          {content.playground && (
            <GraphSection
              id="playground"
              title="Interactive Playground"
              icon={FlaskConical}
              accent={accent}
              defaultOpen={open}
            >
              <div className="space-y-4">
                <Markdown>{content.playground.descriptionMD}</Markdown>
                {content.playground.systemPrompt && (
                  <CodeBlock
                    label="System prompt"
                    body={content.playground.systemPrompt}
                  />
                )}
                {content.playground.userPrompt && (
                  <CodeBlock
                    label="User prompt"
                    body={content.playground.userPrompt}
                  />
                )}
                {content.playground.parameters.length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {content.playground.parameters.map((p, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-border bg-card p-3"
                      >
                        <p className="text-xs text-muted-foreground">{p.name}</p>
                        <p className="font-mono text-sm font-bold">{p.value}</p>
                        {p.note && (
                          <p className="text-[11px] text-muted-foreground">
                            {p.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {content.playground.sampleOutputMD && (
                  <div className={cn("rounded-lg border p-4", a.border, a.bg)}>
                    <h4 className="mb-1 text-sm font-semibold">Sample output</h4>
                    <Markdown>{content.playground.sampleOutputMD}</Markdown>
                  </div>
                )}
              </div>
            </GraphSection>
          )}

          {/* 10 — Visual learning */}
          {hasComparisons && (
            <GraphSection
              id="visual"
              title="Visual Learning"
              icon={Table2}
              accent={accent}
              defaultOpen={open}
            >
              <div className="space-y-5">
                {content.comparisons.map((c, i) => (
                  <ComparisonTable key={i} comparison={c} accent={accent} />
                ))}
                {content.decisionGuideMD && (
                  <div>
                    <h4 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Decision guide
                    </h4>
                    <Markdown>{content.decisionGuideMD}</Markdown>
                  </div>
                )}
              </div>
            </GraphSection>
          )}

          {/* 11 — Hands-on examples */}
          <GraphSection
            id="hands-on"
            title="Hands-on Examples"
            icon={Wrench}
            accent={accent}
            defaultOpen={open}
          >
            <div className="space-y-4">
              {content.handsOn.map((h, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <h4 className="mb-1 text-sm font-semibold">{h.title}</h4>
                  <Markdown>{h.detailMD}</Markdown>
                  {h.code && (
                    <CodeBlock
                      label={h.code.label ?? h.code.language}
                      body={h.code.body}
                    />
                  )}
                </div>
              ))}
            </div>
          </GraphSection>

          {/* 12 — Quiz */}
          <GraphSection
            id="quiz"
            title="Quiz"
            icon={Sparkles}
            accent={accent}
            defaultOpen={open}
          >
            <Quiz items={content.quiz} />
          </GraphSection>

          {/* 13 — Flashcards */}
          <GraphSection
            id="flashcards"
            title="Flashcards"
            icon={Code2}
            accent={accent}
            defaultOpen={open}
          >
            <Flashcards cards={content.flashcards} />
          </GraphSection>

          {/* 14 — Cheat sheet */}
          <GraphSection
            id="cheat-sheet"
            title="Cheat Sheet"
            icon={ListChecks}
            accent={accent}
            defaultOpen={open}
          >
            <div className={cn("rounded-lg border p-4", a.border, a.bg)}>
              <Markdown>{content.cheatSheetMD}</Markdown>
            </div>
          </GraphSection>

          {/* 15 — References */}
          <GraphSection
            id="references"
            title="References"
            icon={Link2}
            accent={accent}
            defaultOpen={open}
          >
            <ul className="space-y-2 text-sm">
              {content.references.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="rounded-md border border-border px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                    {r.kind}
                  </span>
                  <span>
                    {r.url ? (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-primary hover:underline"
                      >
                        {r.title}
                      </a>
                    ) : (
                      <span className="font-medium">{r.title}</span>
                    )}
                    {r.author && (
                      <span className="text-muted-foreground"> — {r.author}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </GraphSection>

          {/* Related lessons */}
          {related.length > 0 && (
            <GraphSection
              id="related"
              title="Related Lessons"
              icon={GitBranch}
              accent={accent}
              defaultOpen={open}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/learning/generative-ai/${r.slug}`}
                    className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40"
                  >
                    <h4 className="text-sm font-semibold">{r.title}</h4>
                    {r.note && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {r.note}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </GraphSection>
          )}
        </div>

        {/* TOC */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              On this page
            </p>
            <nav className="space-y-0.5 border-l border-border">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block border-l-2 border-transparent px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                >
                  {s.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>
      </div>
    </div>
  );
}

function HintsPanel({ hints, accent }: { hints: string[]; accent: AccentKey }) {
  const a = ACCENT_STYLES[accent];
  const [revealed, setRevealed] = useState(0);
  return (
    <section className={cn("rounded-2xl border p-5", a.border, a.bg)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Lightbulb className={cn("h-4 w-4", a.text)} /> Progressive hints
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRevealed((n) => Math.min(n + 1, hints.length))}
            disabled={revealed >= hints.length}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-transform hover:translate-x-0.5 disabled:opacity-40",
              a.solid,
            )}
          >
            Reveal next hint ({revealed}/{hints.length})
          </button>
          {revealed > 0 && (
            <button
              type="button"
              onClick={() => setRevealed(0)}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Reset
            </button>
          )}
        </div>
      </div>
      {revealed === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Stuck? Reveal hints one at a time instead of jumping to the full
          solution.
        </p>
      ) : (
        <ol className="mt-3 space-y-2">
          {hints.slice(0, revealed).map((h, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                  a.solid,
                )}
              >
                {i + 1}
              </span>
              <span className="pt-0.5">{h}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function MetaChip({
  icon: Icon,
  children,
}: {
  icon: typeof Gauge;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-muted-foreground">
      <Icon className="h-3.5 w-3.5" /> {children}
    </span>
  );
}

function CodeBlock({ label, body }: { label: string; body: string }) {
  return (
    <div className="mt-2">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <pre className="overflow-x-auto rounded-md border border-border bg-background p-3 font-mono text-xs">
        {body}
      </pre>
    </div>
  );
}

function NamedDetailList({
  items,
  accent,
}: {
  items: { label: string; detailMD: string }[];
  accent: AccentKey;
}) {
  const a = ACCENT_STYLES[accent];
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-4">
          <h4 className={cn("mb-1 text-sm font-semibold", a.text)}>
            {item.label}
          </h4>
          <Markdown>{item.detailMD}</Markdown>
        </div>
      ))}
    </div>
  );
}

function ComparisonTable({
  comparison,
  accent,
}: {
  comparison: { title: string; columns: string[]; rows: string[][] };
  accent: AccentKey;
}) {
  const a = ACCENT_STYLES[accent];
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold">{comparison.title}</h4>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className={cn(a.bg)}>
              {comparison.columns.map((c) => (
                <th
                  key={c}
                  className="border-b border-border px-3 py-2 text-left font-semibold"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparison.rows.map((row, ri) => (
              <tr key={ri} className="odd:bg-muted/20">
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className="border-b border-border px-3 py-2 align-top"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
