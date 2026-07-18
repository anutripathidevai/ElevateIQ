import Link from "next/link";
import { ArrowLeft, BellRing, CheckCircle2 } from "lucide-react";
import type { LanguageMeta } from "../types";
import { ACCENT_STYLES } from "@/lib/navigation";
import { LANGUAGE_ICONS } from "./ui";
import { cn } from "@/lib/utils";

/**
 * Polished "Coming Soon" page for a language whose course is not yet authored.
 * Reused for every upcoming language so they feel intentional, not empty. Shows
 * what the course will cover and a (non-functional) notify CTA.
 */
export function ComingSoon({
  language,
  highlights,
}: {
  language: LanguageMeta;
  highlights: string[];
}) {
  const a = ACCENT_STYLES[language.accent];
  const Icon = LANGUAGE_ICONS[language.iconKey];

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/learning/languages"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All languages
      </Link>

      <div
        className={cn(
          "relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br p-8 sm:p-10",
          a.gradient,
        )}
      >
        <span
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-2xl",
            a.bg,
          )}
        >
          <Icon className={cn("h-8 w-8", a.text)} />
        </span>
        <h1 className="mt-5 text-3xl font-bold tracking-tight">
          {language.name}{" "}
          <span className="text-muted-foreground">course is coming soon</span>
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground">{language.tagline}</p>

        <div className="mt-6 rounded-2xl border border-border bg-card/60 p-5 backdrop-blur">
          <p className="mb-3 text-sm font-semibold">What you&apos;ll learn</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {highlights.map((h) => (
              <li key={h} className="flex items-start gap-2 text-sm">
                <CheckCircle2
                  className={cn("mt-0.5 h-4 w-4 shrink-0", a.text)}
                />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="inline-flex cursor-default items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground">
            <BellRing className="h-4 w-4" /> We&apos;ll notify you when it&apos;s
            ready
          </span>
          <Link
            href="/learning/languages/javascript"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Start with JavaScript
          </Link>
        </div>
      </div>
    </div>
  );
}
