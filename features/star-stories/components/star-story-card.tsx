"use client";

import { useState } from "react";
import { Check, ChevronDown, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCopyToClipboard } from "@/features/shared/hooks/use-copy-to-clipboard";
import { truncate } from "@/features/shared/utils";
import { STAR_SECTIONS, type StarStoryContent } from "../types";
import { storyToPlainText } from "../utils";

export interface StarStoryCardProps {
  story: StarStoryContent & { tags: string[] };
  /** Small meta line (e.g. "Updated 2d ago"). */
  meta?: React.ReactNode;
  /** Action buttons rendered in the card header. */
  actions?: React.ReactNode;
  defaultOpen?: boolean;
}

/**
 * Presentational card for a STAR story — works for both AI-generated (unsaved)
 * and persisted stories. Owns only local expand + copy state; all mutations are
 * delegated to the `actions` slot supplied by the parent.
 */
export function StarStoryCard({
  story,
  meta,
  actions,
  defaultOpen = false,
}: StarStoryCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [copied, copy] = useCopyToClipboard();

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-start gap-3 p-4">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
        >
          <ChevronDown
            className={cn(
              "mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
          <div className="min-w-0 space-y-1">
            <h3 className="font-semibold leading-snug">{story.title}</h3>
            {meta && <p className="text-xs text-muted-foreground">{meta}</p>}
            {!open && (
              <p className="text-sm text-muted-foreground">
                {truncate(story.situation, 140)}
              </p>
            )}
          </div>
        </button>
        {actions && (
          <div className="flex shrink-0 items-center gap-1">{actions}</div>
        )}
      </div>

      {open && (
        <div className="space-y-5 border-t border-border p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {STAR_SECTIONS.map(({ key, label }) => (
              <section key={key}>
                <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {label}
                </h4>
                <p className="whitespace-pre-line text-sm leading-relaxed">
                  {story[key]}
                </p>
              </section>
            ))}
          </div>

          {story.skills.length > 0 && (
            <section className="space-y-1.5">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Skills demonstrated
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {story.skills.map((s) => (
                  <Badge key={s} variant="outline">
                    {s}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {story.leadershipPrinciples.length > 0 && (
            <section className="space-y-1.5">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Leadership principles
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {story.leadershipPrinciples.map((p) => (
                  <Badge key={p} variant="default">
                    {p}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {story.suggestedQuestions.length > 0 && (
            <section className="space-y-1.5">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Answers questions like
              </h4>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {story.suggestedQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </section>
          )}

          {story.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {story.tags.map((t) => (
                <Badge key={t} variant="outline">
                  #{t}
                </Badge>
              ))}
            </div>
          )}

          <div className="border-t border-border pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => copy(storyToPlainText(story))}
            >
              {copied ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied" : "Copy story"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
