import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { LanguageMeta } from "../types";
import { ACCENT_STYLES } from "@/lib/navigation";
import { LANGUAGE_ICONS } from "./ui";
import { cn } from "@/lib/utils";

/**
 * A language tile on the Programming Languages hub. Available courses link to
 * the course; upcoming ones link to a polished Coming Soon page. Optional stats
 * (modules/topics) are shown for available courses.
 */
export function LanguageCard({
  language,
  stats,
}: {
  language: LanguageMeta;
  stats?: { modules: number; topics: number };
}) {
  const a = ACCENT_STYLES[language.accent];
  const Icon = LANGUAGE_ICONS[language.iconKey];
  const available = language.status === "available";

  return (
    <Link
      href={`/learning/languages/${language.slug}`}
      className={cn(
        "group relative flex flex-col rounded-2xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg",
        available ? "border-border hover:border-primary/40" : "border-border",
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <span
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl",
            a.bg,
          )}
        >
          <Icon className={cn("h-6 w-6", a.text)} />
        </span>
        {available ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
            <Sparkles className="h-3 w-3" /> Available
          </span>
        ) : (
          <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            Coming soon
          </span>
        )}
      </div>

      <h3 className="text-lg font-semibold">{language.name}</h3>
      <p className="mt-1 flex-1 text-sm text-muted-foreground">
        {language.tagline}
      </p>

      <div className="mt-4 flex items-center justify-between text-sm">
        {available && stats ? (
          <span className="text-muted-foreground">
            {stats.modules} modules · {stats.topics} topics
          </span>
        ) : (
          <span className="text-muted-foreground">Preview the roadmap</span>
        )}
        <span
          className={cn(
            "inline-flex items-center gap-1 font-medium transition-colors",
            available
              ? "text-primary"
              : "text-muted-foreground group-hover:text-foreground",
          )}
        >
          {available ? "Start" : "Details"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
