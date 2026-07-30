"use client";

import { useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ExternalLink,
  Lightbulb,
  ListChecks,
} from "lucide-react";
import type { ProgressStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { DifficultyBadge } from "@/components/practice/difficulty-badge";
import { Markdown } from "@/components/practice/markdown";
import { cn } from "@/lib/utils";
import {
  CATEGORY_LABELS,
  EXPERIENCE_LABELS,
  type CompanyQuestion,
} from "../types";

const STATUS_OPTIONS: { value: ProgressStatus; label: string }[] = [
  { value: "TODO", label: "To do" },
  { value: "ATTEMPTED", label: "Attempted" },
  { value: "SOLVED", label: "Solved" },
];

export interface QuestionCardProps {
  question: CompanyQuestion;
  bookmarked: boolean;
  status: ProgressStatus;
  canPersist: boolean;
  onToggleBookmark: () => void;
  onSetStatus: (status: ProgressStatus) => void;
}

export function QuestionCard({
  question,
  bookmarked,
  status,
  canPersist,
  onToggleBookmark,
  onSetStatus,
}: QuestionCardProps) {
  const [open, setOpen] = useState(false);
  const panelId = `q-${question.id}`;

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-start gap-3 p-4">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
        >
          <ChevronDown
            className={cn(
              "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
          <div className="min-w-0 space-y-2">
            <p className="font-medium leading-snug">{question.question}</p>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="outline">
                {CATEGORY_LABELS[question.category]}
              </Badge>
              <DifficultyBadge difficulty={question.difficulty} />
              <Badge variant="default">
                {EXPERIENCE_LABELS[question.experienceLevel]}
              </Badge>
              {status === "SOLVED" && <Badge variant="success">Solved</Badge>}
              {status === "ATTEMPTED" && (
                <Badge variant="warning">Attempted</Badge>
              )}
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={onToggleBookmark}
          disabled={!canPersist}
          aria-pressed={bookmarked}
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark question"}
          title={
            canPersist
              ? bookmarked
                ? "Remove bookmark"
                : "Bookmark"
              : "Sign in to bookmark"
          }
          className={cn(
            "shrink-0 rounded-md p-2 transition-colors",
            bookmarked
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground",
            !canPersist && "opacity-40",
          )}
        >
          {bookmarked ? (
            <BookmarkCheck className="h-5 w-5" />
          ) : (
            <Bookmark className="h-5 w-5" />
          )}
        </button>
      </div>

      {open && (
        <div id={panelId} className="space-y-5 border-t border-border p-4 pt-4">
          <section>
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Expected answer
            </h4>
            <Markdown>{question.expectedAnswer}</Markdown>
          </section>

          {question.hints.length > 0 && (
            <section>
              <h4 className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Lightbulb className="h-3.5 w-3.5" /> Hints
              </h4>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {question.hints.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </section>
          )}

          {question.followUps.length > 0 && (
            <section>
              <h4 className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <ListChecks className="h-3.5 w-3.5" /> Follow-up prompts
              </h4>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {question.followUps.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </section>
          )}

          {question.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {question.tags.map((t) => (
                <Badge key={t} variant="outline">
                  {t}
                </Badge>
              ))}
            </div>
          )}

          {question.resources.length > 0 && (
            <section>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Related resources
              </h4>
              <ul className="space-y-1 text-sm">
                {question.resources.map((r) => (
                  <li key={r.url}>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      {r.label} <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <span className="text-xs font-medium text-muted-foreground">
              Progress:
            </span>
            <div
              role="group"
              aria-label="Set progress"
              className="inline-flex overflow-hidden rounded-md border border-border"
            >
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={!canPersist}
                  aria-pressed={status === opt.value}
                  onClick={() => onSetStatus(opt.value)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium transition-colors",
                    status === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:bg-accent",
                    !canPersist && "cursor-not-allowed opacity-50",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {!canPersist && (
              <span className="text-xs text-muted-foreground">
                Sign in to track progress
              </span>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
