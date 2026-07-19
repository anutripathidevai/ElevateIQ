import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Compass,
  ListChecks,
  Sparkles,
  Target,
} from "lucide-react";
import {
  DashboardCard,
  SectionHeader,
  StatTile,
} from "@/components/blocks/primitives";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/components/practice/markdown";
import { ACCENT_STYLES } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { DsaTopicMeta } from "../types";
import type { ComingSoonContent } from "../coming-soon-content";
import { DSA_ICONS } from "./ui";
import { formatHours } from "./ui";

/**
 * A polished "Coming Soon" page for an unpublished DSA topic. Same visual
 * language as a published course landing, so the section feels complete even
 * before every topic is authored. All copy is data-driven (registry meta +
 * optional rich coming-soon content), so no code changes are needed to add one.
 */
export function DsaComingSoon({
  topic,
  content,
}: {
  topic: DsaTopicMeta;
  content?: ComingSoonContent;
}) {
  const Icon = DSA_ICONS[topic.iconKey];
  const a = ACCENT_STYLES[topic.accent];
  const coverage = content?.expectedCoverage ?? [];

  return (
    <div className="space-y-8">
      <Link
        href="/learning/dsa"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> DSA
      </Link>

      {/* Hero */}
      <section
        className={cn(
          "overflow-hidden rounded-2xl border bg-gradient-to-br p-6 sm:p-8",
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
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", a.bg)}>
            <Icon className={cn("h-6 w-6", a.text)} />
          </span>
          <h1 className="text-3xl font-bold tracking-tight">{topic.name}</h1>
          <Badge variant="outline" className="ml-1">
            Coming soon
          </Badge>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {topic.description}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile
            icon={ListChecks}
            label="Planned lessons"
            value={topic.lessonCount}
            accent={topic.accent}
          />
          <StatTile
            icon={Target}
            label="Coding problems"
            value={topic.problemCount}
            accent="blue"
          />
          <StatTile
            icon={Clock}
            label="Est. study time"
            value={formatHours(topic.durationHours)}
            accent="emerald"
          />
          <StatTile
            icon={Sparkles}
            label="Difficulty"
            value={topic.difficulty}
            accent="orange"
          />
        </div>
      </section>

      {content ? (
        <>
          <section className="space-y-4">
            <SectionHeader
              title="Overview"
              icon={Compass}
              accent={topic.accent}
            />
            <DashboardCard>
              <div className="space-y-4">
                <Markdown>{content.overviewMD}</Markdown>
                <div>
                  <h4 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Why it matters
                  </h4>
                  <Markdown>{content.whyItMattersMD}</Markdown>
                </div>
              </div>
            </DashboardCard>
          </section>

          {coverage.length > 0 && (
            <section className="space-y-4">
              <SectionHeader
                title="What the course will cover"
                icon={ListChecks}
                accent="emerald"
              />
              <DashboardCard>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {coverage.map((c, i) => (
                    <li key={i} className="flex gap-2.5 text-sm">
                      <ListChecks
                        className={cn("mt-0.5 h-4 w-4 shrink-0", a.text)}
                      />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </DashboardCard>
            </section>
          )}

          <section className="space-y-4">
            <SectionHeader
              title="Interview relevance"
              icon={Target}
              accent="violet"
            />
            <DashboardCard>
              <Markdown>{content.interviewRelevanceMD}</Markdown>
            </DashboardCard>
          </section>
        </>
      ) : (
        <DashboardCard>
          <p className="text-sm text-muted-foreground">
            We&apos;re actively building this track with the same intuition-first,
            interview-focused depth as our published courses. Check back soon.
          </p>
        </DashboardCard>
      )}

      {/* Tags */}
      {topic.tags.length > 0 && (
        <section className="space-y-3">
          <SectionHeader
            title="Topics you'll master"
            icon={Sparkles}
            accent="cyan"
          />
          <div className="flex flex-wrap gap-1.5">
            {topic.tags.map((t) => (
              <Badge key={t} variant="outline">
                {t}
              </Badge>
            ))}
          </div>
        </section>
      )}

      <DashboardCard>
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground">
            In the meantime, dive into a published track to keep your momentum.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/learning/dsa/dynamic-programming"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted/50"
            >
              Dynamic Programming
            </Link>
            <Link
              href="/learning/dsa/graph-algorithms"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted/50"
            >
              Graph Algorithms
            </Link>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
}
