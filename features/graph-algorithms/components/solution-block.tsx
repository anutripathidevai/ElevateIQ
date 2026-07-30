import { Lightbulb } from "lucide-react";
import { Markdown } from "@/components/practice/markdown";
import { CodeViewer } from "@/components/practice/code-viewer";
import { cn } from "@/lib/utils";
import type { GraphSolution } from "../types";
import { ComplexityCards } from "./complexity-cards";

/**
 * Renders one optimal solution: name, an optional "when to prefer this" callout,
 * the approach + step-by-step walkthrough (Markdown), complexity cards, and the
 * reference Java implementation in the shared Monaco viewer (with copy button).
 */
export function SolutionBlock({
  solution,
  index,
  total,
}: {
  solution: GraphSolution;
  index: number;
  total: number;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h3 className="text-base font-semibold">
          {total > 1 ? `Solution ${index + 1}: ` : "Solution: "}
          <span className="text-primary">{solution.name}</span>
        </h3>
      </div>

      {solution.whenToUseMD && (
        <div className="flex gap-2 rounded-lg border border-border bg-muted/30 p-3 text-sm">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <div className="min-w-0">
            <span className="font-medium">When to prefer this: </span>
            <span className="[&_p]:inline">
              <Markdown className="inline">{solution.whenToUseMD}</Markdown>
            </span>
          </div>
        </div>
      )}

      <Markdown>{solution.approachMD}</Markdown>

      <div>
        <h4 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Step-by-step
        </h4>
        <Markdown>{solution.walkthroughMD}</Markdown>
      </div>

      <ComplexityCards complexity={solution.complexity} />

      <div>
        <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Java implementation
        </h4>
        <CodeViewer
          files={[
            {
              filename: solution.filename,
              language: "java",
              content: solution.code,
            },
          ]}
        />
      </div>
    </section>
  );
}

/** Renders all (one or two) solutions with a subtle divider between them. */
export function SolutionList({ solutions }: { solutions: GraphSolution[] }) {
  return (
    <div className="space-y-8">
      {solutions.map((s, i) => (
        <div
          key={s.name}
          className={cn(i > 0 && "border-t border-border pt-8")}
        >
          <SolutionBlock solution={s} index={i} total={solutions.length} />
        </div>
      ))}
    </div>
  );
}
