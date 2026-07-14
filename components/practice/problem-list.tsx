import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ProblemListItem } from "@/services/problems";
import { Badge } from "@/components/ui/badge";
import { DifficultyBadge } from "./difficulty-badge";
import { SolvedIndicator } from "./solved-indicator";

export function ProblemList({
  items,
  trackSlug,
}: {
  items: ProblemListItem[];
  trackSlug: string;
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No problems match these filters.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
      {items.map((p) => (
        <li key={p.id}>
          <Link
            href={`/practice/${trackSlug}/${p.slug}`}
            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/50"
          >
            <div className="w-16 shrink-0">
              <DifficultyBadge difficulty={p.difficulty} />
            </div>
            <span className="min-w-0 flex-1 truncate font-medium">
              {p.title}
            </span>
            <SolvedIndicator slug={p.slug} className="shrink-0" />
            <div className="hidden gap-1 sm:flex">
              {p.tags.slice(0, 3).map((t) => (
                <Badge key={t} variant="outline">
                  {t}
                </Badge>
              ))}
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
