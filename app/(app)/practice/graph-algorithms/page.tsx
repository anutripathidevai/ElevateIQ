import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowLeft,
  Building2,
  Clock,
  ListChecks,
  Map as MapIcon,
  Network,
  Route,
  Sparkles,
  Trophy,
} from "lucide-react";
import {
  DashboardCard,
  SectionHeader,
  StatTile,
} from "@/components/blocks/primitives";
import { Badge } from "@/components/ui/badge";
import {
  allCompanies,
  allTags,
  AUTHORED_PROBLEM_COUNT,
  getModule,
  GRAPH_MODULES,
  moduleStats,
  PLANNED_PROBLEM_COUNT,
  PROBLEMS_IN_ORDER,
} from "@/features/graph-algorithms";
import {
  ModuleCard,
  ProblemIndex,
  Roadmap,
  TrackProgress,
  formatMinutes,
  type ModuleCardData,
  type ProblemIndexItem,
  type RoadmapModule,
} from "@/features/graph-algorithms/components";

export const metadata: Metadata = {
  title: "Graph Algorithms",
  description:
    "A curated, intuition-first Graph Algorithms track — 25 interview problems from traversal to advanced graphs, with Java 17 solutions.",
};

export default function GraphAlgorithmsHubPage() {
  const stats = moduleStats();
  const authoredSlugs = PROBLEMS_IN_ORDER.map((p) => p.slug);
  const totalMinutes = stats.reduce((n, s) => n + s.estimatedMinutes, 0);
  const companies = allCompanies();
  const tags = allTags();

  const moduleCards: ModuleCardData[] = stats.map((s) => ({
    id: s.module.id,
    order: s.module.order,
    title: s.module.title,
    summary: s.module.summary,
    pattern: s.module.pattern,
    authoredSlugs: s.problems.map((p) => p.slug),
    plannedCount: s.module.problemSlugs.length,
    estimatedMinutes: s.estimatedMinutes,
  }));

  const roadmapModules: RoadmapModule[] = stats.map((s) => ({
    order: s.module.order,
    title: s.module.title,
    pattern: s.module.pattern,
    summary: s.module.summary,
    authoredCount: s.problemCount,
    plannedCount: s.module.problemSlugs.length,
    estimatedMinutes: s.estimatedMinutes,
  }));

  const problemItems: ProblemIndexItem[] = PROBLEMS_IN_ORDER.map((p) => ({
    slug: p.slug,
    order: p.order,
    title: p.title,
    difficulty: p.difficulty,
    moduleTitle: getModule(p.moduleId)?.title ?? "",
  }));

  return (
    <div className="space-y-8">
      <Link
        href="/practice/dsa"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> DSA
      </Link>

      {/* Overview / hero */}
      <section
        id="overview"
        className="scroll-mt-20 overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/15 to-violet-500/0 p-6 sm:p-8"
      >
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-violet-400">
          <span>DSA</span>
          <span>/</span>
          <span>Graph Algorithms</span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15">
            <Network className="h-6 w-6 text-violet-400" />
          </span>
          <h1 className="text-3xl font-bold tracking-tight">Graph Algorithms</h1>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          A premium, intuition-first track of {PLANNED_PROBLEM_COUNT} hand-picked
          graph problems — progressing from grid traversal to advanced graphs.
          Every page teaches the pattern first, then the algorithm, then a clean
          Java&nbsp;17 implementation, with dry runs and interview guidance.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile
            icon={ListChecks}
            label="Curated problems"
            value={PLANNED_PROBLEM_COUNT}
            accent="violet"
          />
          <StatTile
            icon={Route}
            label="Learning modules"
            value={GRAPH_MODULES.length}
            accent="blue"
          />
          <StatTile
            icon={Clock}
            label="Est. study time"
            value={formatMinutes(totalMinutes)}
            accent="emerald"
          />
          <StatTile
            icon={Building2}
            label="Target companies"
            value={companies.length}
            accent="orange"
          />
        </div>
      </section>

      {/* Progress */}
      <section id="progress" className="scroll-mt-20">
        <DashboardCard title="Your progress" icon={Trophy} accent="violet">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TrackProgress
              authoredSlugs={authoredSlugs}
              plannedCount={PLANNED_PROBLEM_COUNT}
            />
            <p className="max-w-sm text-sm text-muted-foreground">
              Mark problems complete as you work through them. Progress is saved
              on this device and syncs to your account when you sign in.
            </p>
          </div>
        </DashboardCard>
      </section>

      {/* Learning roadmap */}
      <section id="roadmap" className="scroll-mt-20 space-y-4">
        <SectionHeader
          title="Learning roadmap"
          description="Work top to bottom — each module builds on the traversal skeleton from Module 1."
          icon={MapIcon}
          accent="blue"
        />
        <DashboardCard>
          <Roadmap modules={roadmapModules} />
        </DashboardCard>
      </section>

      {/* Modules */}
      <section id="modules" className="scroll-mt-20 space-y-4">
        <SectionHeader
          title="Modules"
          description="Ten themed modules covering every core graph pattern."
          icon={Route}
          accent="emerald"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {moduleCards.map((m) => (
            <ModuleCard key={m.id} data={m} />
          ))}
        </div>
      </section>

      {/* Problems */}
      <section id="problems" className="scroll-mt-20 space-y-4">
        <SectionHeader
          title="All problems"
          description={`${AUTHORED_PROBLEM_COUNT} of ${PLANNED_PROBLEM_COUNT} available in learning order.`}
          icon={ListChecks}
          accent="orange"
        />
        <ProblemIndex problems={problemItems} />
      </section>

      {/* Skills / tags */}
      {tags.length > 0 && (
        <section className="space-y-3">
          <SectionHeader
            title="Techniques you'll master"
            icon={Sparkles}
            accent="cyan"
          />
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <Badge key={t} variant="outline">
                {t}
              </Badge>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
