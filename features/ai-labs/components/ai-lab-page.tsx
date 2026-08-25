"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Gauge } from "lucide-react";
import { Markdown } from "@/components/practice/markdown";
import { Tabs, type TabOption } from "@/components/ui/tabs";
import { ACCENT_STYLES } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { LabContent, LabDemoKey, LabMeta, LabTab } from "../types";
import { resolveLabIcon } from "./lab-icons";
import { ArchitectureDiagram } from "./architecture-diagram";
import { ExecutionTrace } from "./execution-trace";
import { InterviewQuestions } from "./interview-questions";
import { LabChallengeView } from "./lab-challenge";
import type { LabDemoProps, LiveTrace } from "./demo-types";
import { LlmPlayground } from "../labs/llm-playground";
import { StructuredOutput } from "../labs/structured-output";
import { SemanticSearch } from "../labs/semantic-search";
import { RagPipeline } from "../labs/rag-pipeline";
import { SkillBuilder } from "../labs/skill-builder";
import { ToolCalling } from "../labs/tool-calling";
import { AiAgent } from "../labs/ai-agent";
import { AiMemory } from "../labs/ai-memory";
import { MultiAgent } from "../labs/multi-agent";
import { AiEvaluation } from "../labs/ai-evaluation";
import { AiGuardrails } from "../labs/ai-guardrails";
import { ProductionAi } from "../labs/production-ai";

/**
 * The interactive shell every published lab renders. Server components pass the
 * serialisable `meta` + `content` and a `defaultModel`; this client component
 * owns the active tab and the live execution trace, and resolves the lab's
 * `demo` key to a real interactive component.
 */

/** Map a serialisable demo key to its interactive component. */
const DEMOS: Partial<Record<LabDemoKey, React.ComponentType<LabDemoProps>>> = {
  "llm-playground": LlmPlayground,
  "structured-output": StructuredOutput,
  "semantic-search": SemanticSearch,
  "rag-pipeline": RagPipeline,
  "skill-builder": SkillBuilder,
  "tool-calling": ToolCalling,
  "ai-agent": AiAgent,
  "ai-memory": AiMemory,
  "multi-agent": MultiAgent,
  "ai-evaluation": AiEvaluation,
  "ai-guardrails": AiGuardrails,
  "production-ai": ProductionAi,
};

const TAB_OPTIONS: TabOption<LabTab>[] = [
  { value: "overview", label: "Overview" },
  { value: "architecture", label: "Architecture" },
  { value: "demo", label: "Run Demo" },
  { value: "trace", label: "Execution Trace" },
  { value: "learn", label: "Learn" },
  { value: "challenge", label: "Challenge" },
  { value: "interview", label: "Interview Q&A" },
];

export function AILabPage({
  meta,
  content,
  defaultModel,
}: {
  meta: LabMeta;
  content: LabContent;
  defaultModel: string;
}) {
  const [tab, setTab] = useState<LabTab>("overview");
  const [trace, setTrace] = useState<LiveTrace | null>(null);
  const a = ACCENT_STYLES[meta.accent];
  const Icon = resolveLabIcon(meta.icon);
  const Demo = DEMOS[content.demo];

  // Jump to the Trace tab automatically once a run reports metrics.
  const handleTrace = useMemo(
    () => (t: LiveTrace | null) => setTrace(t),
    [],
  );

  return (
    <div className="space-y-6">
      <Link
        href="/ai-labs"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All labs
      </Link>

      {/* Header */}
      <header className={cn("overflow-hidden rounded-2xl border bg-gradient-to-br p-6 sm:p-7", a.border, a.gradient)}>
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <span>AI Labs</span>
          <span>/</span>
          <span>Lab {meta.order}</span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <span className={cn("flex h-12 w-12 items-center justify-center rounded-xl", a.bg)}>
            <Icon className={cn("h-6 w-6", a.text)} />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{meta.title}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{meta.summary}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> {meta.estimatedMinutes} min
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Gauge className="h-3.5 w-3.5" /> {meta.difficulty}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {meta.concepts.map((c) => (
              <span
                key={c}
                className="rounded-full border border-border bg-card px-2 py-0.5 text-[11px]"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <Tabs value={tab} onValueChange={setTab} options={TAB_OPTIONS} aria-label="Lab sections" />
      </div>

      {/* Panels */}
      <div role="tabpanel">
        {tab === "overview" && (
          <div className="space-y-6">
            <Markdown className="text-sm leading-relaxed">{content.overviewMD}</Markdown>
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold">What you'll build</h3>
              <ul className="mt-3 space-y-2">
                {content.whatYouBuild.map((item, i) => (
                  <li key={i} className="flex gap-2.5 text-sm">
                    <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", a.solid)} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === "architecture" && (
          <ArchitectureDiagram
            title={content.architecture.title}
            flow={content.architecture.flow}
            nodes={content.architecture.nodes}
            accent={meta.accent}
          />
        )}

        {tab === "demo" && (
          <div className="space-y-3">
            {Demo ? (
              <Demo defaultModel={defaultModel} onTrace={handleTrace} />
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                The interactive demo for this lab is coming soon.
              </div>
            )}
            {trace?.metrics && (
              <button
                type="button"
                onClick={() => setTab("trace")}
                className={cn("text-sm font-medium hover:underline", a.text)}
              >
                View the execution trace →
              </button>
            )}
          </div>
        )}

        {tab === "trace" && (
          <div className="space-y-4">
            <Markdown className="text-sm leading-relaxed">{content.executionMD}</Markdown>
            <ExecutionTrace trace={trace} />
          </div>
        )}

        {tab === "learn" && (
          <Markdown className="text-sm leading-relaxed">{content.learnMD}</Markdown>
        )}

        {tab === "challenge" && <LabChallengeView challenge={content.challenge} />}

        {tab === "interview" && (
          <InterviewQuestions questions={content.interviewQuestions} />
        )}
      </div>
    </div>
  );
}
