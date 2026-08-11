"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Lock } from "lucide-react";
import { ACCENT_STYLES } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useSolved } from "@/lib/progress-store";
import type { CDModuleMeta } from "../types";

/**
 * A single module card for the Cloud & DevOps landing page. Published modules
 * link to their page and show solved state; coming-soon modules render a
 * disabled, clearly-labelled placeholder. Purely data-driven from CDModuleMeta.
 */
export function ModuleCard({ meta }: { meta: CDModuleMeta }) {
  const published = meta.status === "published";
  const solved = useSolved(`cloud-devops:${meta.slug}`);
  const a = ACCENT_STYLES[meta.accent];

  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
            a.bg,
            a.text,
          )}
        >
          {meta.order}
        </span>
        {published ? (
          solved && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
              <CheckCircle2 className="h-3 w-3" /> Done
            </span>
          )
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            <Lock className="h-3 w-3" /> Coming soon
          </span>
        )}
      </div>

      <div className="mt-3">
        <h3 className="font-semibold leading-tight tracking-tight">
          {meta.title}
        </h3>
        <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
          {meta.summary}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {meta.topics.slice(0, 4).map((t) => (
          <span
            key={t}
            className="rounded-md border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-3 border-t border-border pt-3 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" /> {meta.estimatedMinutes}m
        </span>
        {published && (
          <span className={cn("ml-auto inline-flex items-center gap-1 font-medium", a.text)}>
            Start <ArrowRight className="h-3 w-3" />
          </span>
        )}
      </div>
    </>
  );

  const cardClass = cn(
    "flex flex-col rounded-xl border bg-card p-4 shadow-sm transition-colors",
    published
      ? "border-border hover:border-primary/40"
      : "border-dashed border-border opacity-75",
  );

  if (!published) {
    return (
      <div className={cardClass} aria-disabled>
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={`/learning/cloud-devops/${meta.slug}`}
      className={cn(
        cardClass,
        "focus:outline-none focus:ring-2 focus:ring-primary/40",
      )}
    >
      {inner}
    </Link>
  );
}
