import type { Metadata } from "next";
import {
  BookOpen,
  Clock,
  Layers,
  ListChecks,
  Map as MapIcon,
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
  DSA_ROADMAP,
  DSA_TOPICS,
  DSA_TOTALS,
  getCourse,
  getTopic,
  lessonsInOrder,
} from "@/features/dsa";
import { HubView } from "@/features/dsa/components";
import { DSA_ICONS, formatHours } from "@/features/dsa/components";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, courseJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "DSA — Data Structures & Algorithms",
  description:
    "A structured, interview-focused DSA curriculum — from arrays and hashing to dynamic programming and advanced graphs. Intuition first, then algorithms, then clean Java 17.",
  alternates: { canonical: "/learning/dsa" },
};

/**
 * The DSA hub. Fully metadata-driven: it renders the topic registry, a
 * recommended learning roadmap, and an interactive, searchable topic grid.
 * Adding a topic is a data change in `features/dsa/registry.ts` — this page
 * needs no edits.
 */
export default function DsaHubPage() {
  // Authored lesson slugs per published topic, for live progress on the cards.
  const lessonSlugsByTopic: Record<string, string[]> = {};
  for (const topic of DSA_TOPICS) {
    if (topic.status !== "published") continue;
    const course = getCourse(topic.slug);
    if (course) {
      lessonSlugsByTopic[topic.slug] = lessonsInOrder(course).map((l) => l.slug);
    }
  }

  return (
    <div className="space-y-8">
      <JsonLd
        data={[
          courseJsonLd({
            name: "Data Structures & Algorithms",
            description:
              "A structured, interview-focused DSA curriculum — from arrays and hashing to dynamic programming and advanced graphs.",
            path: "/learning/dsa",
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Learning", path: "/learning" },
            { name: "DSA", path: "/learning/dsa" },
          ]),
        ]}
      />
      {/* Overview / hero */}
      <section className="overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/15 to-blue-500/0 p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-blue-400">
          <span>Learning</span>
          <span>/</span>
          <span>DSA</span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15">
            <Layers className="h-6 w-6 text-blue-400" />
          </span>
          <h1 className="text-3xl font-bold tracking-tight">
            Data Structures &amp; Algorithms
          </h1>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          A structured, interview-focused path through every core DSA topic —
          from arrays and hashing to dynamic programming and advanced graphs.
          Each track teaches the pattern first, then the algorithm, then a clean
          Java&nbsp;17 implementation, with dry runs and interview guidance.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile
            icon={Layers}
            label="Topics"
            value={DSA_TOTALS.topics}
            accent="blue"
          />
          <StatTile
            icon={BookOpen}
            label="Available now"
            value={DSA_TOTALS.published}
            accent="violet"
          />
          <StatTile
            icon={ListChecks}
            label="Curated problems"
            value={`${DSA_TOTALS.problems}+`}
            accent="emerald"
          />
          <StatTile
            icon={Clock}
            label="Est. study time"
            value={formatHours(DSA_TOTALS.hours)}
            accent="orange"
          />
        </div>
      </section>

      {/* Learning roadmap */}
      <section className="space-y-4">
        <SectionHeader
          title="Learning roadmap"
          description="A recommended path from foundations to optimisation. Each phase builds on the last."
          icon={MapIcon}
          accent="blue"
        />
        <DashboardCard>
          <ol className="relative space-y-6 before:absolute before:bottom-3 before:left-[15px] before:top-3 before:w-px before:bg-border">
            {DSA_ROADMAP.map((phase) => {
              const a = ACCENT_STYLES[
                phase.difficulty === "Easy"
                  ? "emerald"
                  : phase.difficulty === "Medium"
                    ? "blue"
                    : "orange"
              ];
              return (
                <li key={phase.id} className="relative flex gap-4">
                  <span
                    className={cn(
                      "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-4 ring-background",
                      a.bg,
                      a.text,
                    )}
                  >
                    {phase.order}
                  </span>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <h3 className="font-semibold">{phase.title}</h3>
                      <span className="text-xs text-muted-foreground">
                        {phase.difficulty}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {phase.summary}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {phase.topicSlugs.map((slug) => {
                        const t = getTopic(slug);
                        if (!t) return null;
                        const Icon = DSA_ICONS[t.iconKey];
                        return (
                          <span
                            key={slug}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs",
                              t.status === "published"
                                ? "border-border bg-card"
                                : "border-dashed border-border text-muted-foreground",
                            )}
                          >
                            <Icon className="h-3 w-3" />
                            {t.name}
                            {t.status === "published" && (
                              <Badge
                                variant="outline"
                                className="ml-0.5 px-1 py-0 text-[10px]"
                              >
                                Live
                              </Badge>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </DashboardCard>
      </section>

      {/* Interactive topic grid */}
      <HubView topics={DSA_TOPICS} lessonSlugsByTopic={lessonSlugsByTopic} />
    </div>
  );
}
