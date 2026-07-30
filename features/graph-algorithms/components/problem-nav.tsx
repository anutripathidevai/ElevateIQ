import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavTarget {
  slug: string;
  title: string;
}

/** Previous / Next problem navigation shown at the foot of each problem page. */
export function ProblemNav({
  prev,
  next,
  basePath = "/practice/graph-algorithms",
}: {
  prev?: NavTarget;
  next?: NavTarget;
  basePath?: string;
}) {
  return (
    <nav className="grid gap-3 sm:grid-cols-2">
      {prev ? (
        <Link
          href={`${basePath}/${prev.slug}`}
          className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
        >
          <ArrowLeft className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
          <span className="min-w-0">
            <span className="block text-xs text-muted-foreground">Previous</span>
            <span className="block truncate font-medium">{prev.title}</span>
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link
          href={`${basePath}/${next.slug}`}
          className={cn(
            "group flex items-center justify-end gap-3 rounded-xl border border-border bg-card p-4 text-right transition-colors hover:border-primary/40 hover:bg-muted/40",
          )}
        >
          <span className="min-w-0">
            <span className="block text-xs text-muted-foreground">Next</span>
            <span className="block truncate font-medium">{next.title}</span>
          </span>
          <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </nav>
  );
}
