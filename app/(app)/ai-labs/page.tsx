import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FlaskConical, Layers, ListChecks, Sparkles, Timer } from "lucide-react";
import { StatTile } from "@/components/blocks/primitives";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, courseJsonLd } from "@/lib/structured-data";
import { AI_LABS_INFO, getLabs, getLabTotals } from "@/features/ai-labs";
import { LabsRoadmap } from "@/features/ai-labs/components";

export const metadata: Metadata = {
  title: "AI Labs — Build Real AI Systems | Compile Ready",
  description:
    "Hands-on AI labs that teach how modern AI applications actually work. Run live demos and inspect the execution trace behind every AI call — from a single LLM request to RAG, tool-calling agents, evaluation, guardrails, and production AI.",
  alternates: { canonical: "/ai-labs" },
};

/**
 * AI Labs hub. Fully metadata-driven: renders the twelve-lab roadmap and course
 * stats from the registry. Publishing a lab is a data change in
 * `features/ai-labs` — this page needs no edits.
 */
export default function AILabsHubPage() {
  const labs = getLabs();
  const totals = getLabTotals();

  return (
    <div className="space-y-8">
      <JsonLd
        data={[
          courseJsonLd({
            name: AI_LABS_INFO.title,
            description: AI_LABS_INFO.description,
            path: "/ai-labs",
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "AI Labs", path: "/ai-labs" },
          ]),
        ]}
      />

      {/* Hero */}
      <section className="overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/15 to-violet-500/0 p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-violet-400">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Interactive · Hands-on</span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15">
            <FlaskConical className="h-6 w-6 text-violet-400" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{AI_LABS_INFO.title}</h1>
        </div>
        <p className="mt-1 text-sm font-medium text-violet-400">{AI_LABS_INFO.subtitle}</p>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {AI_LABS_INFO.description}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile icon={Layers} label="Labs" value={totals.total} accent="violet" />
          <StatTile icon={ListChecks} label="Available now" value={totals.published} accent="emerald" />
          <StatTile icon={Timer} label="Hands-on time" value={`${Math.round(totals.minutes / 60)}h`} accent="orange" />
          <StatTile icon={Sparkles} label="From LLMs to" value="Production AI" accent="blue" />
        </div>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {AI_LABS_INFO.concepts.map((t) => (
            <span
              key={t}
              className="rounded-full border border-violet-500/20 bg-card px-2.5 py-1 text-xs text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/ai-labs/llm-playground"
            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white transition-transform hover:translate-x-0.5"
          >
            Start Lab 1 <ArrowRight className="h-4 w-4" />
          </Link>
          <span className="text-xs text-muted-foreground">
            No setup required — runs in your browser.
          </span>
        </div>
      </section>

      {/* Roadmap */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-violet-500" />
          <h2 className="text-lg font-semibold tracking-tight">The lab roadmap</h2>
          <span className="text-sm text-muted-foreground">
            {totals.published} of {totals.total} available now
          </span>
        </div>
        <LabsRoadmap labs={labs} />
      </section>

      {/* Note */}
      <section className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">
          Each lab is a real, working demo — not a video. You send prompts to a live
          model, watch the response stream in, and inspect the{" "}
          <span className="font-medium text-foreground">execution trace</span> behind
          every AI call, then answer the senior-level interview questions that go with it.
        </p>
      </section>
    </div>
  );
}
