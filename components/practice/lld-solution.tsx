"use client";

import { useState } from "react";
import { Eye, ListChecks, Puzzle } from "lucide-react";
import type { LldSolution } from "@/lib/lld/types";
import { Button } from "@/components/ui/button";
import { Markdown } from "./markdown";
import { CodeViewer } from "./code-viewer";

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </h2>
  );
}

export function LldSolutionSection({ solution }: { solution: LldSolution }) {
  const [shown, setShown] = useState(false);

  if (!shown) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
        <p className="mx-auto mb-3 max-w-md text-sm text-muted-foreground">
          Try modeling the classes yourself first. When you&apos;re ready,
          reveal a full step-by-step walkthrough with reference Java classes.
        </p>
        <Button onClick={() => setShown(true)}>
          <Eye className="h-4 w-4" /> Show solution
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <SectionTitle>Approach</SectionTitle>
        <Markdown>{solution.approachMD}</Markdown>
      </section>

      <section>
        <SectionTitle icon={ListChecks}>Step-by-step</SectionTitle>
        <ol className="space-y-5">
          {solution.steps.map((step, i) => (
            <li
              key={i}
              className="rounded-lg border border-border bg-card p-4"
            >
              <h3 className="mb-1 font-semibold">{step.title}</h3>
              <Markdown>{step.detailMD}</Markdown>
              {step.code && (
                <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-muted p-3 text-xs">
                  <code className="font-mono">{step.code.content}</code>
                </pre>
              )}
            </li>
          ))}
        </ol>
      </section>

      {solution.patterns && solution.patterns.length > 0 && (
        <section>
          <SectionTitle icon={Puzzle}>Design patterns</SectionTitle>
          <ul className="space-y-2">
            {solution.patterns.map((p) => (
              <li
                key={p.name}
                className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm"
              >
                <span className="font-semibold">{p.name}</span>
                <span className="text-muted-foreground"> — {p.why}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {solution.code.length > 0 && (
        <section>
          <SectionTitle>Reference implementation (Java)</SectionTitle>
          <CodeViewer files={solution.code} />
        </section>
      )}
    </div>
  );
}
