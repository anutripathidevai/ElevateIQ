import type { Metadata } from "next";
import { Building2, BrainCircuit, Layers, ListChecks, Rocket } from "lucide-react";
import { StatTile } from "@/components/blocks/primitives";
import {
  AISD_CATALOG,
  AISD_COMPANIES,
  AISD_DIFFICULTIES,
  AISD_TIERS,
  AISD_TOPICS,
  getTotals,
} from "@/features/ai-system-design";
import { DashboardView } from "@/features/ai-system-design/components";

export const metadata: Metadata = {
  title: "AI System Design",
  description:
    "A structured, interview-focused AI system design curriculum — LLM foundations, LLM application design, RAG, vector databases, AI agents, model serving, AI infrastructure, safety, and LLMOps. Each lesson is a full deep dive with an interactive architecture diagram, request flow, deep dives, an interview perspective, and hands-on examples.",
};

/**
 * The AI System Design dashboard. Fully metadata-driven: it renders the lesson
 * catalog, a ten-track learning path, and interactive search / filter / sort.
 * Adding a lesson is a data change in `features/ai-system-design/registry.ts`
 * (plus a content file to publish it) — this page needs no edits.
 */
export default function AISystemDesignHubPage() {
  const totals = getTotals();

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/15 to-cyan-500/0 p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-cyan-400">
          <span>Learning</span>
          <span>/</span>
          <span>AI System Design</span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/15">
            <BrainCircuit className="h-6 w-6 text-cyan-400" />
          </span>
          <h1 className="text-3xl font-bold tracking-tight">AI System Design</h1>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          A structured path through the AI system design interview — from LLM
          foundations to production systems like ChatGPT, RAG pipelines, vector
          databases, agents, and inference serving. Every lesson is a full deep
          dive: theory, an interactive architecture diagram, request flow, deep
          dives, production considerations, an interview perspective, and
          hands-on examples.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile
            icon={BrainCircuit}
            label="Lessons"
            value={totals.total}
            accent="cyan"
          />
          <StatTile
            icon={Rocket}
            label="Available now"
            value={totals.published}
            accent="blue"
          />
          <StatTile
            icon={Layers}
            label="Learning tracks"
            value={AISD_TIERS.length}
            accent="violet"
          />
          <StatTile
            icon={Building2}
            label="Companies"
            value={`${totals.companies}+`}
            accent="orange"
          />
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <ListChecks className="h-4 w-4 text-cyan-400" />
          {totals.topics} topics across {AISD_TIERS.length} tracks · new lessons
          added regularly
        </div>
      </section>

      <DashboardView
        catalog={AISD_CATALOG}
        tiers={AISD_TIERS}
        topics={AISD_TOPICS}
        companies={AISD_COMPANIES}
        difficulties={AISD_DIFFICULTIES}
      />
    </div>
  );
}
