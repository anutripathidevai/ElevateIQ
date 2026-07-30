import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Clock,
  ListChecks,
  Map as MapIcon,
  Route,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import {
  DashboardCard,
  SectionHeader,
  StatTile,
} from "@/components/blocks/primitives";
import { Badge } from "@/components/ui/badge";
import { ACCENT_STYLES } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import {
  ModuleCard,
  Roadmap,
  TrackProgress,
  formatMinutes,
  type ModuleCardData,
  type RoadmapModule,
} from "@/features/graph-algorithms/components";
import type { DsaCourse, DsaTopicMeta } from "../types";
import {
  allCompanies,
  allTags,
  authoredProblemCount,
  lessonsInOrder,
  moduleStats,
  plannedLessonCount,
  totalMinutes,
} from "../course-api";
import { DSA_ICONS } from "./ui";
import { LessonIndex, type LessonIndexItem } from "./lesson-index";

/**
 * Landing page for a published DSA course. Fully generic over any `DsaCourse` +
 * registry entry, so Graph, Dynamic Programming, and every future course share
 * one implementation. Mirrors the original Graph hub layout (overview, progress,
 * roadmap, modules, curriculum, techniques).
 */
export function CourseLanding({
  topic,
  course,
  basePath,
}: {
  topic: DsaTopicMeta;
  course: DsaCourse;
  basePath: string;
}) {
  const stats = moduleStats(course);
  const ordered = lessonsInOrder(course);
  const authoredSlugs = ordered.map((l) => l.slug);
  const plannedTotal = plannedLessonCount(course);
  const minutes = totalMinutes(course);
  const companies = allCompanies(course);
  const tags = allTags(course);
  const Icon = DSA_ICONS[topic.iconKey];
  const accent = topic.accent;
  const a = ACCENT_STYLES[accent];

  const moduleTitleBySlug = new Map<string, string>();
  for (const s of stats) {
    for (const l of s.lessons) moduleTitleBySlug.set(l.slug, s.module.title);
  }

  const moduleCards: ModuleCardData[] = stats.map((s) => ({
    id: s.module.id,
    order: s.module.order,
    title: s.module.title,
    summary: s.module.summary,
    pattern: s.module.pattern,
    authoredSlugs: s.lessons.map((l) => l.slug),
    plannedCount: s.module.lessonSlugs.length,
    estimatedMinutes: s.estimatedMinutes,
  }));

  const roadmapModules: RoadmapModule[] = stats.map((s) => ({
    order: s.module.order,
    title: s.module.title,
    pattern: s.module.pattern,
    summary: s.module.summary,
    authoredCount: s.lessonCount,
    plannedCount: s.module.lessonSlugs.length,
    estimatedMinutes: s.estimatedMinutes,
  }));

  const lessonItems: LessonIndexItem[] = ordered.map((lesson) => ({
    lesson,
    moduleTitle: moduleTitleBySlug.get(lesson.slug) ?? "",
  }));

  return (
    <div className="space-y-8">
      <Link
        href="/learning/dsa"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> DSA
      </Link>

      {/* Overview / hero */}
      <section
        id="overview"
        className={cn(
          "scroll-mt-20 overflow-hidden rounded-2xl border bg-gradient-to-br p-6 sm:p-8",
          a.border,
          a.gradient,
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2 text-xs font-medium uppercase tracking-wide",
            a.text,
          )}
        >
          <span>DSA</span>
          <span>/</span>
          <span>{topic.name}</span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", a.bg)}>
            <Icon className={cn("h-6 w-6", a.text)} />
          </span>
          <h1 className="text-3xl font-bold tracking-tight">{topic.name}</h1>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {course.meta.descriptionMD}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile
            icon={ListChecks}
            label="Curated lessons"
            value={topic.lessonCount}
            accent={accent}
          />
          <StatTile
            icon={Route}
            label="Learning modules"
            value={course.modules.length}
            accent="blue"
          />
          <StatTile
            icon={Clock}
            label="Est. study time"
            value={formatMinutes(minutes)}
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

      {/* What you'll learn */}
      {course.meta.objectives.length > 0 && (
        <section className="space-y-4">
          <SectionHeader
            title="What you'll learn"
            icon={Target}
            accent={accent}
          />
          <DashboardCard>
            <ul className="grid gap-2 sm:grid-cols-2">
              {course.meta.objectives.map((o, i) => (
                <li key={i} className="flex gap-2.5 text-sm">
                  <Target className={cn("mt-0.5 h-4 w-4 shrink-0", a.text)} />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </DashboardCard>
        </section>
      )}

      {/* Progress */}
      <section id="progress" className="scroll-mt-20">
        <DashboardCard title="Your progress" icon={Trophy} accent={accent}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TrackProgress
              authoredSlugs={authoredSlugs}
              plannedCount={plannedTotal}
            />
            <p className="max-w-sm text-sm text-muted-foreground">
              Mark lessons complete as you work through them. Progress is saved on
              this device and syncs to your account when you sign in.
            </p>
          </div>
        </DashboardCard>
      </section>

      {/* Learning roadmap */}
      <section id="roadmap" className="scroll-mt-20 space-y-4">
        <SectionHeader
          title="Learning roadmap"
          description="Work top to bottom — each module builds on the last."
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
          description={`${course.modules.length} themed modules from fundamentals to advanced.`}
          icon={Route}
          accent="emerald"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {moduleCards.map((m) => (
            <ModuleCard key={m.id} data={m} basePath={basePath} />
          ))}
        </div>
      </section>

      {/* Curriculum */}
      <section id="problems" className="scroll-mt-20 space-y-4">
        <SectionHeader
          title="Full curriculum"
          description={`${authoredProblemCount(course)} problems and ${
            ordered.length - authoredProblemCount(course)
          } concept lessons in learning order.`}
          icon={ListChecks}
          accent="orange"
        />
        <LessonIndex items={lessonItems} basePath={basePath} />
      </section>

      {/* Techniques / tags */}
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
