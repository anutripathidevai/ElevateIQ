import type { Metadata } from "next";
import { Boxes, Building2, Layers, ListChecks, Rocket, Shapes } from "lucide-react";
import { StatTile } from "@/components/blocks/primitives";
import {
  LLD_CATALOG,
  LLD_CATEGORIES,
  LLD_COMPANIES,
  LLD_DIFFICULTIES,
  LLD_PATTERNS,
  LLD_TIERS,
  getTotals,
} from "@/features/lld";
import { DashboardView } from "@/features/lld/components";

export const metadata: Metadata = {
  title: "Low Level Design — Object-Oriented Design Interviews",
  description:
    "A structured, interview-focused Low Level Design (LLD) curriculum — from OOP and SOLID foundations through machine-coding classics like Parking Lot, Vending Machine, and LRU Cache to expert systems. Every problem is a full design walkthrough: requirements, UML, patterns, complete Java, dry run, and follow-ups.",
};

/**
 * The Low Level Design (LLD) dashboard. Fully metadata-driven: it renders the
 * problem + concept catalog, a five-tier learning path, and interactive
 * search / filter / sort. Adding a problem is a data change in
 * `features/lld/registry.ts` (plus a content file to publish it) — this page
 * needs no edits.
 */
export default function LldHubPage() {
  const totals = getTotals();

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 to-emerald-500/0 p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-emerald-400">
          <span>Learning</span>
          <span>/</span>
          <span>Low Level Design</span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15">
            <Boxes className="h-6 w-6 text-emerald-400" />
          </span>
          <h1 className="text-3xl font-bold tracking-tight">
            Low Level Design — Machine Coding &amp; OOD
          </h1>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          A structured path through the object-oriented design interview — from
          OOP and SOLID foundations to machine-coding classics and expert
          systems. Every problem is a full walkthrough: requirements, an
          interactive UML class diagram, patterns, complete Java, a dry run,
          complexity, and follow-up questions.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile
            icon={Boxes}
            label="Problems &amp; concepts"
            value={totals.total}
            accent="emerald"
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
            value={LLD_TIERS.length}
            accent="violet"
          />
          <StatTile
            icon={Shapes}
            label="Design patterns"
            value={`${totals.patterns}+`}
            accent="orange"
          />
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <ListChecks className="h-4 w-4 text-emerald-400" />
          {LLD_CATEGORIES.length} categories · {totals.companies}+ companies
          across {LLD_TIERS.length} tiers · new problems added regularly
        </div>
      </section>

      <DashboardView
        catalog={LLD_CATALOG}
        tiers={LLD_TIERS}
        categories={LLD_CATEGORIES}
        companies={LLD_COMPANIES}
        difficulties={LLD_DIFFICULTIES}
        patterns={LLD_PATTERNS}
      />
    </div>
  );
}
