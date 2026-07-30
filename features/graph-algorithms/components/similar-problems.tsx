import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SimilarProblem } from "../types";
import { GraphDifficultyBadge } from "./graph-difficulty-badge";

/** Grid of related-problem cards. Internal ones deep-link within the track. */
export function SimilarProblems({
  items,
  basePath = "/practice/graph-algorithms",
}: {
  items: SimilarProblem[];
  basePath?: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => {
        const href = item.slug ? `${basePath}/${item.slug}` : item.url;
        const external = !item.slug && Boolean(item.url);
        const inner = (
          <>
            <div className="flex items-start justify-between gap-2">
              <span className="font-medium">{item.title}</span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <GraphDifficultyBadge difficulty={item.difficulty} />
              {item.note && (
                <span className="text-xs text-muted-foreground">
                  {item.note}
                </span>
              )}
            </div>
          </>
        );
        const className = cn(
          "block rounded-lg border border-border bg-card p-3 text-sm transition-colors hover:border-primary/40 hover:bg-muted/40",
        );
        if (!href) {
          return (
            <div key={item.title} className={className}>
              {inner}
            </div>
          );
        }
        return external ? (
          <a
            key={item.title}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
          >
            {inner}
          </a>
        ) : (
          <Link key={item.title} href={href} className={className}>
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
