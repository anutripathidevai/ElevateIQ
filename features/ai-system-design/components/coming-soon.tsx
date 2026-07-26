import Link from "next/link";
import { ArrowLeft, Bell, Building2, Clock, Gauge, Lock } from "lucide-react";
import { ACCENT_STYLES, type AccentKey } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { AISDLessonMeta } from "../types";

/**
 * Placeholder shown for catalog lessons that don't yet have authored content.
 * Renders the known metadata (so the page is still useful) and clearly marks the
 * lesson as coming soon.
 */
export function ComingSoon({
  meta,
  tierLabel,
  accent,
}: {
  meta: AISDLessonMeta;
  tierLabel: string;
  accent: AccentKey;
}) {
  const a = ACCENT_STYLES[accent];
  return (
    <div className="space-y-6">
      <Link
        href="/learning/ai-system-design"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All AI system design lessons
      </Link>

      <header
        className={cn(
          "overflow-hidden rounded-2xl border bg-gradient-to-br p-6 sm:p-8",
          a.border,
          a.gradient,
        )}
      >
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <span>AI System Design</span>
          <span>/</span>
          <span>{tierLabel}</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {meta.title}
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            <Lock className="h-3.5 w-3.5" /> Coming soon
          </span>
        </div>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground sm:text-base">
          {meta.summary}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-muted-foreground">
            <Gauge className="h-3.5 w-3.5" /> {meta.difficulty}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> ~{meta.estimatedMinutes}m
          </span>
          {meta.companies.slice(0, 4).map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-muted-foreground"
            >
              <Building2 className="h-3.5 w-3.5" /> {c}
            </span>
          ))}
        </div>
      </header>

      <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
        <span
          className={cn(
            "mx-auto flex h-12 w-12 items-center justify-center rounded-xl",
            a.bg,
          )}
        >
          <Bell className={cn("h-6 w-6", a.text)} />
        </span>
        <h2 className="mt-4 text-lg font-semibold">
          This deep-dive is in the works
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          We&apos;re authoring a full breakdown for{" "}
          <span className="font-medium text-foreground">{meta.title}</span> —
          theory, an interactive architecture diagram, request flow, deep dives,
          production considerations, an interview perspective, and hands-on
          examples. In the meantime, explore the published lessons in this track.
        </p>
        <Link
          href="/learning/ai-system-design"
          className={cn(
            "mt-5 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-transform hover:translate-x-0.5",
            a.solid,
          )}
        >
          Browse available lessons
        </Link>
      </div>
    </div>
  );
}
