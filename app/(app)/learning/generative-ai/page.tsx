import type { Metadata } from "next";
import { Building2, BrainCircuit, Layers, ListChecks, Rocket } from "lucide-react";
import { StatTile } from "@/components/blocks/primitives";
import {
  GENAI_CATALOG,
  GENAI_COMPANIES,
  GENAI_DIFFICULTIES,
  GENAI_TIERS,
  GENAI_TOPICS,
  getTotals,
} from "@/features/generative-ai";
import { DashboardView } from "@/features/generative-ai/components";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, courseJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Generative AI",
  description:
    "The complete Generative AI curriculum for software engineers — a ten-level roadmap from AI foundations and working with LLMs, through RAG, vector databases, and AI agents, into AI system design, production AI, and advanced topics, finishing with interview preparation and hands-on projects. Each lesson is a full deep dive with theory, interactive diagrams, request flows, an interview perspective, and hands-on examples.",
  alternates: { canonical: "/learning/generative-ai" },
};

/**
 * The Generative AI hub — the single home for all AI learning in ElevateIQ.
 * Fully metadata-driven: it renders the lesson catalog, a ten-level roadmap, and
 * interactive search / filter / sort. Adding a lesson is a data change in
 * `features/generative-ai/registry.ts` (plus a content file to publish it) —
 * this page needs no edits.
 */
export default function GenerativeAiHubPage() {
  const totals = getTotals();

  return (
    <div className="space-y-8">
      <JsonLd
        data={[
          courseJsonLd({
            name: "Generative AI",
            description:
              "The complete Generative AI curriculum for software engineers — a ten-level roadmap from AI foundations and LLMs through RAG, vector databases, and agents, into AI system design, production AI, and interview prep.",
            path: "/learning/generative-ai",
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Learning", path: "/learning" },
            { name: "Generative AI", path: "/learning/generative-ai" },
          ]),
        ]}
      />
      {/* Hero */}
      <section className="overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/15 to-cyan-500/0 p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-cyan-400">
          <span>Learning</span>
          <span>/</span>
          <span>Generative AI</span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/15">
            <BrainCircuit className="h-6 w-6 text-cyan-400" />
          </span>
          <h1 className="text-3xl font-bold tracking-tight">Generative AI</h1>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          One place to master Generative AI — a structured, ten-level roadmap
          from AI foundations and working with LLMs, through RAG, vector
          databases, and agents, into AI system design (ChatGPT, coding
          assistants, answer engines), production AI, and advanced topics, and
          finishing with interview preparation and hands-on projects. Every
          lesson is a full deep dive: theory, interactive diagrams, request
          flow, production considerations, an interview perspective, and
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
            label="Roadmap levels"
            value={GENAI_TIERS.length}
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
          {totals.topics} topics across {GENAI_TIERS.length} levels · new lessons
          added regularly
        </div>
      </section>

      <DashboardView
        catalog={GENAI_CATALOG}
        tiers={GENAI_TIERS}
        topics={GENAI_TOPICS}
        companies={GENAI_COMPANIES}
        difficulties={GENAI_DIFFICULTIES}
      />
    </div>
  );
}
