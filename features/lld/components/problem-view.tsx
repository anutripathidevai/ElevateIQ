"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Bookmark,
  Boxes,
  Building2,
  CheckCircle2,
  ClipboardList,
  Clock,
  Code2,
  FileCode2,
  FileText,
  Flame,
  GitBranch,
  Layers,
  Lightbulb,
  Link2,
  ListChecks,
  ListOrdered,
  ListTree,
  MessagesSquare,
  Network,
  Printer,
  Puzzle,
  Repeat,
  Share2,
  Sparkles,
  Target,
  TrendingUp,
  Workflow,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { Markdown } from "@/components/practice/markdown";
import { CodeViewer } from "@/components/practice/code-viewer";
import { ACCENT_STYLES, type AccentKey } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import {
  ComplexityCards,
  DryRunTable,
  GraphSection,
  MarkComplete,
} from "@/features/graph-algorithms/components";
import type { LLDProblemContent, LLDProblemMeta } from "../types";
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

const SECTIONS: { id: string; label: string }[] = [
  { id: "statement", label: "Problem Statement" },
  { id: "functional", label: "Functional Requirements" },
  { id: "non-functional", label: "Non-Functional Requirements" },
  { id: "clarification", label: "Requirement Clarification" },
  { id: "class-diagram", label: "UML Class Diagram" },
  { id: "sequence-diagram", label: "Sequence Diagram" },
  { id: "entities", label: "Entity Identification" },
  { id: "patterns", label: "Design Patterns Used" },
  { id: "design", label: "Step-by-Step Design" },
  { id: "implementation", label: "Java Implementation" },
  { id: "class-explanations", label: "Class Explanations" },
  { id: "dry-run", label: "Dry Run" },
  { id: "complexity", label: "Complexity Analysis" },
  { id: "extensibility", label: "Extensibility" },
  { id: "alternatives", label: "Alternative Designs" },
  { id: "mistakes", label: "Common Mistakes" },
  { id: "followups", label: "Follow-up Questions" },
  { id: "production", label: "Production Considerations" },
  { id: "interview-notes", label: "What Interviewers Look For" },
  { id: "quiz", label: "Quiz" },
  { id: "variants", label: "Practice Variants" },
  { id: "flashcards", label: "Flashcards" },
  { id: "cheat-sheet", label: "Cheat Sheet" },
  { id: "references", label: "References" },
  { id: "related", label: "Related Problems" },
];

/**
 * Renders a full Low Level Design problem — all ~20 sections — from typed
 * content. Client component so it can host the Mermaid diagrams, Monaco code
 * viewer, quiz, flashcards, bookmark + completion state, interview mode, print,
 * and share. Sections render only when the content provides them.
 */
export function ProblemView({
  meta,
  content,
  readingMinutes,
  related,
  tierLabel,
}: {
  meta: LLDProblemMeta;
  content: LLDProblemContent;
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

  useEffect(() => {
    recordRecentlyViewed(meta.slug);
  }, [meta.slug]);

  const open = !interviewMode;

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
        href="/learning/lld"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All low level design problems
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
          <span>Low Level Design</span>
          <span>/</span>
          <span>{tierLabel}</span>
          <span>/</span>
          <span>{meta.category}</span>
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
          <MetaChip icon={Boxes}>{meta.difficulty}</MetaChip>
          <MetaChip icon={Clock}>{meta.estimatedMinutes}m interview</MetaChip>
          <MetaChip icon={FileText}>{readingMinutes}m read</MetaChip>
          <MetaChip icon={Flame}>{meta.frequency} frequency</MetaChip>
          <MetaChip icon={TrendingUp}>Popularity {meta.popularity}</MetaChip>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {meta.patterns.map((p) => (
            <span
              key={p}
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px]",
                a.border,
                a.text,
              )}
            >
              <Puzzle className="h-3 w-3" /> {p}
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
            Sections are collapsed so you can attempt the design first. Expand
            each to check your approach.
          </p>
        )}
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="min-w-0 space-y-5">
          {/* 1 — Problem statement */}
          <GraphSection id="statement" title="Problem Statement" icon={FileText} accent={accent} defaultOpen>
            <div className="space-y-4">
              <Markdown>{content.statementMD}</Markdown>
              <div className={cn("rounded-lg border p-4", a.border, a.bg)}>
                <h4 className="mb-1 flex items-center gap-2 text-sm font-semibold">
                  <Lightbulb className={cn("h-4 w-4", a.text)} /> Business context
                </h4>
                <Markdown>{content.businessContextMD}</Markdown>
              </div>
            </div>
          </GraphSection>

          {/* 2 — Functional requirements */}
          <GraphSection id="functional" title="Functional Requirements" icon={ListChecks} accent={accent} defaultOpen={open}>
            <ul className="space-y-2">
              {content.functionalRequirements.map((r, i) => (
                <li key={i} className="flex gap-2.5 text-sm">
                  <CheckCircle2 className={cn("mt-0.5 h-4 w-4 shrink-0", a.text)} />
                  <Markdown className="[&_p]:m-0">{r}</Markdown>
                </li>
              ))}
            </ul>
          </GraphSection>

          {/* 3 — Non-functional requirements */}
          <GraphSection id="non-functional" title="Non-Functional Requirements" icon={Layers} accent={accent} defaultOpen={open}>
            <NamedDetailList items={content.nonFunctionalRequirements} accent={accent} />
          </GraphSection>

          {/* 4 — Requirement clarification */}
          <GraphSection id="clarification" title="Requirement Clarification" icon={MessagesSquare} accent={accent} defaultOpen={open}>
            <QAList items={content.requirementClarification} accent={accent} />
          </GraphSection>

          {/* 5 — UML class diagram */}
          <GraphSection id="class-diagram" title="UML Class Diagram" icon={Network} accent={accent} defaultOpen={open}>
            <MermaidDiagram
              title={`${meta.title} — Class Diagram`}
              chart={content.classDiagramMermaid}
              captionMD={content.classDiagramCaptionMD}
            />
          </GraphSection>

          {/* 6 — Sequence diagram */}
          <GraphSection id="sequence-diagram" title="Sequence Diagram" icon={Workflow} accent={accent} defaultOpen={open}>
            <MermaidDiagram
              title={`${meta.title} — Sequence Diagram`}
              chart={content.sequenceDiagramMermaid}
              captionMD={content.sequenceDiagramCaptionMD}
            />
          </GraphSection>

          {/* 7 — Entity identification */}
          <GraphSection id="entities" title="Entity Identification" icon={Boxes} accent={accent} defaultOpen={open}>
            <div className="space-y-3">
              {content.entities.map((e, i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-4">
                  <h4 className={cn("text-sm font-semibold", a.text)}>{e.name}</h4>
                  <Markdown className="mt-1 [&_p]:m-0">{e.responsibilityMD}</Markdown>
                  {e.attributes && e.attributes.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {e.attributes.map((attr) => (
                        <span
                          key={attr}
                          className="rounded-md border border-border bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                        >
                          {attr}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </GraphSection>

          {/* 8 — Design patterns used */}
          <GraphSection id="patterns" title="Design Patterns Used" icon={Puzzle} accent={accent} defaultOpen={open}>
            <div className="space-y-3">
              {content.patternsUsed.map((p, i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-4">
                  <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium", a.border, a.bg, a.text)}>
                    <Puzzle className="h-3 w-3" /> {p.name}
                  </span>
                  <Markdown className="mt-2 [&_p]:m-0">{p.whyMD}</Markdown>
                </div>
              ))}
            </div>
          </GraphSection>

          {/* 9 — Step-by-step design */}
          <GraphSection id="design" title="Step-by-Step Design" icon={ListTree} accent={accent} defaultOpen={open}>
            <ol className="space-y-4">
              {content.designSteps.map((s, i) => (
                <li key={i} className="rounded-lg border border-border bg-card p-4">
                  <h4 className="flex items-center gap-2 text-sm font-semibold">
                    <span className={cn("flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold", a.bg, a.text)}>
                      {i + 1}
                    </span>
                    {s.title}
                  </h4>
                  <Markdown className="mt-2">{s.detailMD}</Markdown>
                  {s.code && <CodeBlock body={s.code} />}
                </li>
              ))}
            </ol>
          </GraphSection>

          {/* 10 — Complete implementation */}
          <GraphSection id="implementation" title="Complete Java Implementation" icon={FileCode2} accent={accent} defaultOpen={open}>
            <CodeViewer files={content.implementation} height="520px" />
          </GraphSection>

          {/* 11 — Class explanations */}
          <GraphSection id="class-explanations" title="Explanation of Every Class" icon={Code2} accent={accent} defaultOpen={open}>
            <div className="space-y-3">
              {content.classExplanations.map((c, i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-4">
                  <h4 className={cn("font-mono text-sm font-semibold", a.text)}>{c.className}</h4>
                  <Markdown className="mt-1">{c.detailMD}</Markdown>
                </div>
              ))}
            </div>
          </GraphSection>

          {/* 12 — Dry run */}
          <GraphSection id="dry-run" title="Dry Run" icon={ListOrdered} accent={accent} defaultOpen={open}>
            <DryRunTable dryRun={content.dryRun} />
          </GraphSection>

          {/* 13 — Complexity analysis */}
          <GraphSection id="complexity" title="Complexity Analysis" icon={TrendingUp} accent={accent} defaultOpen={open}>
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="border-b border-border px-3 py-2 text-left font-semibold">Operation</th>
                      <th className="border-b border-border px-3 py-2 text-left font-semibold">Time</th>
                      <th className="border-b border-border px-3 py-2 text-left font-semibold">Space</th>
                      <th className="border-b border-border px-3 py-2 text-left font-semibold">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.complexity.map((row, i) => (
                      <tr key={i} className="odd:bg-background even:bg-muted/20">
                        <td className="border-b border-border px-3 py-2 font-medium">{row.operation}</td>
                        <td className="border-b border-border px-3 py-2 font-mono text-xs">{row.time}</td>
                        <td className="border-b border-border px-3 py-2 font-mono text-xs">{row.space}</td>
                        <td className="border-b border-border px-3 py-2 text-xs text-muted-foreground">{row.note ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {content.complexityNotesMD && <Markdown>{content.complexityNotesMD}</Markdown>}
            </div>
          </GraphSection>

          {/* 14 — Extensibility */}
          <GraphSection id="extensibility" title="Extensibility" icon={GitBranch} accent={accent} defaultOpen={open}>
            <NamedDetailList items={content.extensibility} accent={accent} />
          </GraphSection>

          {/* 15 — Alternative designs */}
          <GraphSection id="alternatives" title="Alternative Designs" icon={Network} accent={accent} defaultOpen={open}>
            <div className="space-y-3">
              {content.alternativeDesigns.map((alt, i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-4">
                  <h4 className="text-sm font-semibold">{alt.name}</h4>
                  <Markdown className="mt-1">{alt.detailMD}</Markdown>
                  {alt.tradeoffsMD && (
                    <div className="mt-2 rounded-md border border-border bg-muted/30 p-3">
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Tradeoffs</p>
                      <Markdown className="[&_p]:m-0">{alt.tradeoffsMD}</Markdown>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </GraphSection>

          {/* 16 — Common mistakes */}
          <GraphSection id="mistakes" title="Common Mistakes" icon={AlertTriangle} accent={accent} defaultOpen={open}>
            <ul className="space-y-1.5 text-sm">
              {content.commonMistakes.map((m, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-bold text-danger">×</span>
                  <Markdown className="[&_p]:m-0">{m}</Markdown>
                </li>
              ))}
            </ul>
          </GraphSection>

          {/* 17 — Follow-up questions */}
          <GraphSection id="followups" title="Follow-up Interview Questions" icon={MessagesSquare} accent={accent} defaultOpen={open}>
            <QAList items={content.followUps} accent={accent} />
          </GraphSection>

          {/* 18 — Production considerations */}
          <GraphSection id="production" title="Production Considerations" icon={Wrench} accent={accent} defaultOpen={open}>
            <NamedDetailList items={content.productionConsiderations} accent={accent} />
          </GraphSection>

          {/* 19 — What interviewers look for */}
          <GraphSection id="interview-notes" title="What Interviewers Look For" icon={Target} accent={accent} defaultOpen={open}>
            <ul className="space-y-1.5 text-sm">
              {content.interviewNotes.map((n, i) => (
                <li key={i} className="flex gap-2">
                  <CheckCircle2 className={cn("mt-0.5 h-4 w-4 shrink-0", a.text)} />
                  <Markdown className="[&_p]:m-0">{n}</Markdown>
                </li>
              ))}
            </ul>
          </GraphSection>

          {/* 20 — Quiz */}
          <GraphSection id="quiz" title="Quiz" icon={ListOrdered} accent={accent} defaultOpen={open}>
            <Quiz items={content.quiz} />
          </GraphSection>

          {/* 21 — Practice variants */}
          <GraphSection id="variants" title="Practice Variants" icon={Sparkles} accent={accent} defaultOpen={open}>
            <div className="space-y-3">
              {content.practiceVariants.map((v, i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold">{v.title}</h4>
                    {v.difficulty && (
                      <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                        {v.difficulty}
                      </span>
                    )}
                  </div>
                  <Markdown className="mt-1 [&_p]:m-0">{v.detailMD}</Markdown>
                </div>
              ))}
            </div>
          </GraphSection>

          {/* 22 — Flashcards */}
          <GraphSection id="flashcards" title="Flashcards" icon={Repeat} accent={accent} defaultOpen={open}>
            <Flashcards cards={content.flashcards} />
          </GraphSection>

          {/* 23 — Cheat sheet */}
          <GraphSection id="cheat-sheet" title="Cheat Sheet" icon={ClipboardList} accent={accent} defaultOpen={open}>
            <div className={cn("rounded-lg border p-4", a.border, a.bg)}>
              <Markdown>{content.cheatSheetMD}</Markdown>
            </div>
          </GraphSection>

          {/* 24 — References */}
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

          {/* 25 — Related problems */}
          {related.length > 0 && (
            <GraphSection id="related" title="Related Problems" icon={GitBranch} accent={accent} defaultOpen={open}>
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

        {/* TOC */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">On this page</p>
            <nav className="max-h-[calc(100vh-8rem)] space-y-0.5 overflow-y-auto border-l border-border">
              {SECTIONS.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="block border-l-2 border-transparent px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground">
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

function MetaChip({ icon: Icon, children }: { icon: typeof Boxes; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-muted-foreground">
      <Icon className="h-3.5 w-3.5" /> {children}
    </span>
  );
}

function CodeBlock({ body }: { body: string }) {
  return (
    <pre className="mt-2 overflow-x-auto rounded-md border border-border bg-background p-3 font-mono text-xs">
      {body}
    </pre>
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
          <h4 className={cn("mb-1 text-sm font-semibold", a.text)}>{item.label}</h4>
          <Markdown>{item.detailMD}</Markdown>
        </div>
      ))}
    </div>
  );
}

function QAList({
  items,
  accent,
}: {
  items: { question: string; answerMD: string }[];
  accent: AccentKey;
}) {
  const a = ACCENT_STYLES[accent];
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-4">
          <h4 className="flex items-start gap-2 text-sm font-semibold">
            <span className={cn("mt-0.5 shrink-0", a.text)}>Q</span>
            {item.question}
          </h4>
          <Markdown className="mt-1.5">{item.answerMD}</Markdown>
        </div>
      ))}
    </div>
  );
}
