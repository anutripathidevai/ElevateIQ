import Link from "next/link";
import { ArrowRight, Clock, Lock } from "lucide-react";
import { ACCENT_STYLES } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { LabMeta } from "../types";
import { resolveLabIcon } from "./lab-icons";

/**
 * A single lab card for the roadmap grid. Published labs link to the lab page;
 * coming-soon labs still link (the page renders a polished placeholder) but are
 * visually dimmed with a "Coming soon" ribbon.
 */
export function LabCard({ meta }: { meta: LabMeta }) {
  const a = ACCENT_STYLES[meta.accent];
  const Icon = resolveLabIcon(meta.icon);
  const published = meta.status === "published";

  return (
    <Link
      href={`/ai-labs/${meta.slug}`}
      className={cn(
        "group relative flex flex-col rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
        published ? a.border : "border-border",
      )}
    >
      <div className="flex items-center justify-between">
        <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", a.bg)}>
          <Icon className={cn("h-6 w-6", a.text)} />
        </span>
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Lab {meta.order}
        </span>
      </div>

      <h3 className="mt-4 flex items-center gap-2 text-base font-semibold tracking-tight">
        {meta.title}
        {!published && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
      </h3>
      <p className="mt-1.5 flex-1 text-sm text-muted-foreground">{meta.summary}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {meta.concepts.slice(0, 4).map((c) => (
          <span
            key={c}
            className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground"
          >
            {c}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" /> {meta.estimatedMinutes} min
          <span aria-hidden>·</span>
          {meta.difficulty}
        </span>
        {published ? (
          <span className={cn("inline-flex items-center gap-1 font-medium", a.text)}>
            Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        ) : (
          <span className="rounded-full bg-muted px-2 py-0.5 font-medium">
            Coming soon
          </span>
        )}
      </div>
    </Link>
  );
}
