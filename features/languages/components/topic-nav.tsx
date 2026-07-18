import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Topic } from "../types";
import { cn } from "@/lib/utils";

/** Previous / next topic navigation at the foot of a topic page. */
export function TopicNav({
  language,
  prev,
  next,
}: {
  language: string;
  prev?: Topic;
  next?: Topic;
}) {
  return (
    <nav className="grid gap-3 sm:grid-cols-2">
      {prev ? (
        <Link
          href={`/learning/languages/${language}/${prev.slug}`}
          className="group flex flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Previous
          </span>
          <span className="mt-1 font-medium group-hover:text-primary">
            {prev.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={`/learning/languages/${language}/${next.slug}`}
          className={cn(
            "group flex flex-col rounded-xl border border-border bg-card p-4 text-right",
            "transition-colors hover:border-primary/40 hover:bg-muted/40",
          )}
        >
          <span className="inline-flex items-center justify-end gap-1.5 text-xs font-medium text-muted-foreground">
            Next <ArrowRight className="h-3.5 w-3.5" />
          </span>
          <span className="mt-1 font-medium group-hover:text-primary">
            {next.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
