import type { Metadata } from "next";
import { Building2, Layers, ListChecks, Network, Rocket } from "lucide-react";
import { StatTile } from "@/components/blocks/primitives";
import {
  SD_CATALOG,
  SD_CATEGORIES,
  SD_COMPANIES,
  SD_DIFFICULTIES,
  SD_TIERS,
  getTotals,
} from "@/features/system-design";
import { DashboardView } from "@/features/system-design/components";

export const metadata: Metadata = {
  title: "System Design — High Level Design",
  description:
    "A structured, interview-focused High Level Design (HLD) curriculum — from foundational systems like URL shorteners and rate limiters to distributed systems, staff-level platforms, and AI system design. Each question is a full 25-section deep dive.",
};

/**
 * The System Design (HLD) dashboard. Fully metadata-driven: it renders the
 * question catalog, a five-tier learning path, and interactive search / filter /
 * sort. Adding a question is a data change in `features/system-design/registry.ts`
 * (plus a content file to publish it) — this page needs no edits.
 */
export default function SystemDesignHubPage() {
  const totals = getTotals();

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/15 to-violet-500/0 p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-violet-400">
          <span>Learning</span>
          <span>/</span>
          <span>System Design</span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15">
            <Network className="h-6 w-6 text-violet-400" />
          </span>
          <h1 className="text-3xl font-bold tracking-tight">
            System Design — High Level Design
          </h1>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          A structured path through the system design interview — from
          foundational building blocks to distributed systems, staff-level
          platforms, and modern AI systems. Every question is a full 25-section
          deep dive: requirements, capacity math, an interactive architecture
          diagram, deep dives, tradeoffs, and interview tips.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile
            icon={Network}
            label="Questions"
            value={totals.total}
            accent="violet"
          />
          <StatTile
            icon={Rocket}
            label="Available now"
            value={totals.published}
            accent="blue"
          />
          <StatTile
            icon={Layers}
            label="Learning tiers"
            value={SD_TIERS.length}
            accent="emerald"
          />
          <StatTile
            icon={Building2}
            label="Companies"
            value={`${totals.companies}+`}
            accent="orange"
          />
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <ListChecks className="h-4 w-4 text-violet-400" />
          {totals.categories} categories across {SD_TIERS.length} tiers · new
          questions added regularly
        </div>
      </section>

      <DashboardView
        catalog={SD_CATALOG}
        tiers={SD_TIERS}
        categories={SD_CATEGORIES}
        companies={SD_COMPANIES}
        difficulties={SD_DIFFICULTIES}
      />
    </div>
  );
}
