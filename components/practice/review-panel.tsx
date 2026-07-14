import {
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  XCircle,
} from "lucide-react";
import type { Review } from "@/services/ai/schemas";
import { cn } from "@/lib/utils";
import { ScoreRing } from "./score-ring";

const RATING_ICON = {
  good: CheckCircle2,
  ok: AlertTriangle,
  poor: XCircle,
} as const;

const RATING_COLOR = {
  good: "text-success",
  ok: "text-warning",
  poor: "text-danger",
} as const;

export function ReviewPanel({ review }: { review: Review }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <ScoreRing score={review.score} />
        <div className="min-w-0">
          <p className="text-sm font-semibold">Overall assessment</p>
          <p className="text-sm text-muted-foreground">{review.summary}</p>
        </div>
      </div>

      <div className="space-y-3">
        {review.sections.map((section, i) => {
          const Icon = RATING_ICON[section.rating];
          return (
            <div key={i} className="rounded-lg border border-border p-3">
              <div className="flex items-center gap-2">
                <Icon className={cn("h-4 w-4", RATING_COLOR[section.rating])} />
                <span className="text-sm font-semibold">{section.title}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {section.detail}
              </p>
            </div>
          );
        })}
      </div>

      {review.suggestions.length > 0 && (
        <div className="rounded-lg border border-border bg-muted/40 p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Lightbulb className="h-4 w-4 text-primary" />
            Suggestions
          </div>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {review.suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
