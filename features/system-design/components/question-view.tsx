"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Bookmark,
  Boxes,
  Building2,
  ClipboardList,
  Clock,
  Code2,
  Database,
  FileText,
  Flame,
  Gauge,
  GitBranch,
  KeyRound,
  Layers,
  Lightbulb,
  Link2,
  ListChecks,
  ListOrdered,
  MessagesSquare,
  Network,
  Printer,
  Repeat,
  Server,
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { Markdown } from "@/components/practice/markdown";
import { ACCENT_STYLES, type AccentKey } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { GraphSection } from "@/features/graph-algorithms/components";
import { MarkComplete } from "@/features/graph-algorithms/components";
import type { SDQuestionContent, SDQuestionMeta } from "../types";
import { SD_TIERS } from "../registry";
import { ArchitectureDiagram } from "./architecture-diagram";
import { Quiz } from "./quiz";
import { Flashcards } from "./flashcards";
import { SD_NODE_STYLES, SD_FALLBACK_ICON } from "./node-styles";
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

const SECTIONS: { id: string; label: string }[] = [
  { id: "statement", label: "Problem Statement" },
  { id: "functional", label: "Functional Requirements" },
  { id: "non-functional", label: "Non-Functional Requirements" },
  { id: "capacity", label: "Capacity Estimation" },
  { id: "api", label: "API Design" },
  { id: "database", label: "Database Design" },
  { id: "architecture", label: "High-Level Architecture" },
  { id: "flow", label: "Request Flow" },
  { id: "components", label: "Core Components" },
  { id: "deep-dive", label: "Deep Dive" },
  { id: "scaling", label: "Scaling" },
  { id: "bottlenecks", label: "Bottlenecks" },
  { id: "failure", label: "Failure Handling" },
  { id: "security", label: "Security" },
  { id: "tradeoffs", label: "Tradeoffs" },
  { id: "followups", label: "Follow-up Questions" },
  { id: "company-variations", label: "Company Variations" },
  { id: "related", label: "Related Questions" },
  { id: "interview-tips", label: "Interview Tips" },
  { id: "revision", label: "Revision Notes" },
  { id: "flashcards", label: "Flashcards" },
  { id: "quiz", label: "Quiz" },
  { id: "cheat-sheet", label: "Cheat Sheet" },
  { id: "references", label: "References" },
];

/**
 * Renders a full System Design question — all 25 sections — from typed content.
 * Client component so it can host the interactive diagram, quiz, flashcards,
 * bookmark + completion state, interview mode (collapse answers), print, and
 * share. Sections render only when the content provides them.
 */
export function QuestionView({
  meta,
  content,
  readingMinutes,
  related,
  tierLabel,
}: {
  meta: SDQuestionMeta;
  content: SDQuestionContent;
  readingMinutes: number;
  related: RelatedTarget[];
  tierLabel: string;
}) {
  const accent: AccentKey =
    SD_TIERS.find((t) => t.id === meta.tier)?.accent ?? "blue";
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
      const url =
        typeof window !== "undefined" ? window.location.href : "";
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
        href="/learning/system-design"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All system design questions
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
          <span>System Design</span>
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
              <Bookmark
                className={cn("h-4 w-4", bookmarked && "fill-current")}
              />
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
          {/* 2 — Problem statement */}
          <GraphSection id="statement" title="Problem Statement" icon={FileText} accent={accent} defaultOpen>
            <div className="space-y-4">
              <Markdown>{content.statementMD}</Markdown>
              <div className={cn("rounded-lg border p-4", a.border, a.bg)}>
                <h4 className="mb-1 flex items-center gap-2 text-sm font-semibold">
                  <Lightbulb className={cn("h-4 w-4", a.text)} /> Business use case
                </h4>
                <Markdown>{content.businessUseCaseMD}</Markdown>
              </div>
            </div>
          </GraphSection>

          {/* 3 — Functional requirements */}
          <GraphSection id="functional" title="Functional Requirements" icon={ListChecks} accent={accent} defaultOpen={open}>
            <ul className="space-y-2">
              {content.functionalRequirements.map((r, i) => (
                <li key={i} className="flex gap-2.5 text-sm">
                  <ListChecks className={cn("mt-0.5 h-4 w-4 shrink-0", a.text)} />
                  <Markdown className="[&_p]:m-0">{r}</Markdown>
                </li>
              ))}
            </ul>
          </GraphSection>

          {/* 4 — Non-functional requirements */}
          <GraphSection id="non-functional" title="Non-Functional Requirements" icon={ShieldCheck} accent={accent} defaultOpen={open}>
            <NamedDetailList items={content.nonFunctionalRequirements} accent={accent} />
          </GraphSection>

          {/* 5 — Capacity estimation */}
          <GraphSection id="capacity" title="Capacity Estimation" icon={Gauge} accent={accent} defaultOpen={open}>
            <div className="space-y-4">
              <div>
                <h4 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Assumptions</h4>
                <Markdown>{content.capacityEstimation.assumptionsMD}</Markdown>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {content.capacityEstimation.metrics.map((m, i) => (
                  <div key={i} className="rounded-lg border border-border bg-card p-3">
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className="text-lg font-bold">{m.value}</p>
                    {m.note && <p className="text-[11px] text-muted-foreground">{m.note}</p>}
                  </div>
                ))}
              </div>
              <div>
                <h4 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Calculations</h4>
                <Markdown>{content.capacityEstimation.calculationsMD}</Markdown>
              </div>
            </div>
          </GraphSection>

          {/* 6 — API design */}
          <GraphSection id="api" title="API Design" icon={Code2} accent={accent} defaultOpen={open}>
            <div className="space-y-4">
              {content.apiDesign.endpoints.map((ep, i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("rounded-md px-2 py-0.5 font-mono text-xs font-bold", a.bg, a.text)}>{ep.method}</span>
                    <code className="font-mono text-sm">{ep.path}</code>
                  </div>
                  <div className="mt-2 text-sm">
                    <Markdown>{ep.descriptionMD}</Markdown>
                  </div>
                  {ep.request && <CodeBlock label="Request" body={ep.request} />}
                  {ep.response && <CodeBlock label="Response" body={ep.response} />}
                  {ep.statusCodes && ep.statusCodes.length > 0 && (
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                      {ep.statusCodes.map((s) => (
                        <li key={s.code}>
                          <code className="font-mono font-semibold text-foreground">{s.code}</code> — {s.meaning}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
              {content.apiDesign.notesMD && <Markdown>{content.apiDesign.notesMD}</Markdown>}
            </div>
          </GraphSection>

          {/* 7 — Database design */}
          <GraphSection id="database" title="Database Design" icon={Database} accent={accent} defaultOpen={open}>
            <div className="space-y-4">
              <Markdown>{content.databaseDesign.schemaMD}</Markdown>
              {content.databaseDesign.tables.map((t) => (
                <div key={t.name} className="overflow-hidden rounded-lg border border-border">
                  <div className="border-b border-border bg-muted/40 px-3 py-1.5 font-mono text-xs font-semibold">{t.name}</div>
                  <table className="w-full text-sm">
                    <tbody>
                      {t.columns.map((c) => (
                        <tr key={c.name} className="border-b border-border last:border-0">
                          <td className="px-3 py-1.5 font-mono text-xs">{c.name}</td>
                          <td className="px-3 py-1.5 text-xs text-muted-foreground">{c.type}</td>
                          <td className="px-3 py-1.5 text-xs text-muted-foreground">{c.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
              {content.databaseDesign.indexesMD && (
                <DetailBlock title="Indexes" body={content.databaseDesign.indexesMD} />
              )}
              {content.databaseDesign.relationshipsMD && (
                <DetailBlock title="Relationships" body={content.databaseDesign.relationshipsMD} />
              )}
              {content.databaseDesign.noSqlAlternativesMD && (
                <DetailBlock title="NoSQL alternatives" body={content.databaseDesign.noSqlAlternativesMD} />
              )}
            </div>
          </GraphSection>

          {/* 8 — High-level architecture */}
          <GraphSection id="architecture" title="High-Level Architecture" icon={Network} accent={accent} defaultOpen={open}>
            <div className="space-y-3">
              <ArchitectureDiagram architecture={content.architecture} />
              {content.architecture.captionMD && (
                <div className="text-xs text-muted-foreground"><Markdown>{content.architecture.captionMD}</Markdown></div>
              )}
              {content.architectureNotesMD && <Markdown>{content.architectureNotesMD}</Markdown>}
            </div>
          </GraphSection>

          {/* 9 — Request flow */}
          <GraphSection id="flow" title="Request Flow" icon={Workflow} accent={accent} defaultOpen={open}>
            <ol className="relative space-y-5 before:absolute before:bottom-3 before:left-[15px] before:top-3 before:w-px before:bg-border">
              {content.requestFlow.map((step, i) => (
                <li key={i} className="relative flex gap-4">
                  <span className={cn("z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-4 ring-background", a.bg, a.text)}>{i + 1}</span>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <h4 className="font-semibold">{step.title}</h4>
                    <div className="mt-0.5 text-sm text-muted-foreground"><Markdown>{step.detailMD}</Markdown></div>
                  </div>
                </li>
              ))}
            </ol>
          </GraphSection>

          {/* 10 — Core components */}
          <GraphSection id="components" title="Core Components" icon={Boxes} accent={accent} defaultOpen={open}>
            <div className="grid gap-3 sm:grid-cols-2">
              {content.coreComponents.map((c, i) => {
                const Icon = SD_NODE_STYLES[c.kind]?.icon ?? SD_FALLBACK_ICON;
                return (
                  <div key={i} className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center gap-2">
                      <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", a.bg)}>
                        <Icon className={cn("h-4 w-4", a.text)} />
                      </span>
                      <div>
                        <h4 className="text-sm font-semibold leading-tight">{c.name}</h4>
                        <p className="text-[11px] text-muted-foreground">{c.role}</p>
                      </div>
                    </div>
                    <div className="mt-2 text-sm"><Markdown>{c.detailMD}</Markdown></div>
                  </div>
                );
              })}
            </div>
          </GraphSection>

          {/* 11 — Deep dive */}
          <GraphSection id="deep-dive" title="Deep Dive" icon={Server} accent={accent} defaultOpen={open}>
            <div className="space-y-4">
              {content.deepDives.map((d, i) => (
                <div key={i}>
                  <h4 className="mb-1 text-sm font-semibold">{d.topic}</h4>
                  <Markdown>{d.detailMD}</Markdown>
                </div>
              ))}
            </div>
          </GraphSection>

          {/* 12 — Scaling */}
          <GraphSection id="scaling" title="Scaling" icon={Layers} accent={accent} defaultOpen={open}>
            <div className="space-y-3">
              {content.scaling.map((s, i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-4">
                  <h4 className="mb-1 text-sm font-semibold">{s.stage}</h4>
                  <Markdown>{s.detailMD}</Markdown>
                </div>
              ))}
            </div>
          </GraphSection>

          {/* 13 — Bottlenecks */}
          <GraphSection id="bottlenecks" title="Bottlenecks & Optimizations" icon={TrendingUp} accent={accent} defaultOpen={open}>
            <div className="space-y-3">
              {content.bottlenecks.map((b, i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-4">
                  <p className="mb-1 flex items-center gap-2 text-sm font-semibold"><AlertTriangle className="h-4 w-4 text-warning" /> {b.issue}</p>
                  <Markdown>{b.optimizationMD}</Markdown>
                </div>
              ))}
            </div>
          </GraphSection>

          {/* 14 — Failure handling */}
          <GraphSection id="failure" title="Failure Handling" icon={Repeat} accent={accent} defaultOpen={open}>
            <div className="space-y-3">
              {content.failureHandling.map((f, i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-4">
                  <p className="mb-1 text-sm font-semibold">{f.scenario}</p>
                  <Markdown>{f.strategyMD}</Markdown>
                </div>
              ))}
            </div>
          </GraphSection>

          {/* 15 — Security */}
          <GraphSection id="security" title="Security" icon={ShieldCheck} accent={accent} defaultOpen={open}>
            <NamedDetailList items={content.security} accent={accent} />
          </GraphSection>

          {/* 16 — Tradeoffs */}
          <GraphSection id="tradeoffs" title="Tradeoffs" icon={GitBranch} accent={accent} defaultOpen={open}>
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-success/30 bg-success/5 p-4">
                  <h4 className="mb-2 text-sm font-semibold text-success">Pros</h4>
                  <ul className="space-y-1.5 text-sm">
                    {content.tradeoffs.pros.map((p, i) => (
                      <li key={i} className="flex gap-2"><span className="text-success">+</span><span>{p}</span></li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-danger/30 bg-danger/5 p-4">
                  <h4 className="mb-2 text-sm font-semibold text-danger">Cons</h4>
                  <ul className="space-y-1.5 text-sm">
                    {content.tradeoffs.cons.map((c, i) => (
                      <li key={i} className="flex gap-2"><span className="text-danger">−</span><span>{c}</span></li>
                    ))}
                  </ul>
                </div>
              </div>
              <DetailBlock title="Alternatives" body={content.tradeoffs.alternativesMD} />
              <DetailBlock title="When not to use this design" body={content.tradeoffs.whenNotToUseMD} />
            </div>
          </GraphSection>

          {/* 17 — Follow-up questions */}
          <GraphSection id="followups" title="Follow-up Questions" icon={MessagesSquare} accent={accent} defaultOpen={open}>
            <div className="space-y-2">
              {content.followUpQuestions.map((f, i) => (
                <details key={i} className="group rounded-lg border border-border bg-card">
                  <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium">
                    <MessagesSquare className={cn("h-4 w-4 shrink-0", a.text)} />
                    <span className="flex-1">{f.question}</span>
                  </summary>
                  <div className="border-t border-border px-4 py-3 text-sm"><Markdown>{f.answerMD}</Markdown></div>
                </details>
              ))}
            </div>
          </GraphSection>

          {/* 18 — Company variations */}
          <GraphSection id="company-variations" title="Company Variations" icon={Building2} accent={accent} defaultOpen={open}>
            <div className="space-y-3">
              {content.companyVariations.map((c, i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-4">
                  <h4 className="mb-1 flex items-center gap-2 text-sm font-semibold"><Building2 className={cn("h-4 w-4", a.text)} /> {c.company}</h4>
                  <Markdown>{c.angleMD}</Markdown>
                </div>
              ))}
            </div>
          </GraphSection>

          {/* 19 — Related questions */}
          <GraphSection id="related" title="Related Questions" icon={Link2} accent={accent} defaultOpen={open}>
            {related.length === 0 ? (
              <p className="text-sm text-muted-foreground">No related questions yet.</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {related.map((r) => (
                  <Link key={r.slug} href={`/learning/system-design/${r.slug}`} className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 text-sm transition-colors hover:border-primary/40">
                    <Link2 className={cn("h-4 w-4 shrink-0", a.text)} />
                    <span className="min-w-0">
                      <span className="font-medium">{r.title}</span>
                      {r.note && <span className="block truncate text-xs text-muted-foreground">{r.note}</span>}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </GraphSection>

          {/* 20 — Interview tips */}
          <GraphSection id="interview-tips" title="Interview Tips" icon={Sparkles} accent={accent} defaultOpen={open}>
            <div className="space-y-4">
              <Markdown>{content.interviewTips.communicationMD}</Markdown>
              <TipList title="What interviewers expect" items={content.interviewTips.expectations} tone="good" />
              <TipList title="Common mistakes" items={content.interviewTips.commonMistakes} tone="warn" />
              <TipList title="Red flags" items={content.interviewTips.redFlags} tone="bad" />
            </div>
          </GraphSection>

          {/* 21 — Revision notes */}
          <GraphSection id="revision" title="Revision Notes" icon={ClipboardList} accent={accent} defaultOpen={open}>
            <Markdown>{content.revisionNotesMD}</Markdown>
          </GraphSection>

          {/* 22 — Flashcards */}
          <GraphSection id="flashcards" title="Flashcards" icon={Repeat} accent={accent} defaultOpen={open}>
            <Flashcards cards={content.flashcards} />
          </GraphSection>

          {/* 23 — Quiz */}
          <GraphSection id="quiz" title="Quiz" icon={ListOrdered} accent={accent} defaultOpen={open}>
            <Quiz items={content.quiz} />
          </GraphSection>

          {/* 24 — Cheat sheet */}
          <GraphSection id="cheat-sheet" title="Cheat Sheet" icon={KeyRound} accent={accent} defaultOpen={open}>
            <div className={cn("rounded-lg border p-4", a.border, a.bg)}>
              <Markdown>{content.cheatSheetMD}</Markdown>
            </div>
          </GraphSection>

          {/* 25 — References */}
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
        </div>

        {/* TOC */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">On this page</p>
            <nav className="space-y-0.5 border-l border-border">
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

function MetaChip({ icon: Icon, children }: { icon: typeof Gauge; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-muted-foreground">
      <Icon className="h-3.5 w-3.5" /> {children}
    </span>
  );
}

function CodeBlock({ label, body }: { label: string; body: string }) {
  return (
    <div className="mt-2">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <pre className="overflow-x-auto rounded-md border border-border bg-background p-3 font-mono text-xs">{body}</pre>
    </div>
  );
}

function DetailBlock({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h4 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
      <Markdown>{body}</Markdown>
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
          <h4 className={cn("mb-1 text-sm font-semibold", a.text)}>{item.label}</h4>
          <Markdown>{item.detailMD}</Markdown>
        </div>
      ))}
    </div>
  );
}

function TipList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "good" | "warn" | "bad";
}) {
  if (items.length === 0) return null;
  const mark = tone === "good" ? "✓" : tone === "warn" ? "!" : "×";
  const color =
    tone === "good" ? "text-success" : tone === "warn" ? "text-warning" : "text-danger";
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
      <ul className="space-y-1.5 text-sm">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2">
            <span className={cn("font-bold", color)}>{mark}</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
