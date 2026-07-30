"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { OutputPrediction } from "../types";
import { Markdown } from "@/components/practice/markdown";
import { CodeBlock } from "./code-block";

/**
 * "Predict the output" challenges. The learner reads the snippet, thinks about
 * the answer, then reveals the exact output and an explanation. Encourages
 * active recall — the core of interview prep — instead of passive reading.
 */
export function OutputPredictions({ items }: { items: OutputPrediction[] }) {
  return (
    <div className="space-y-5">
      {items.map((item, i) => (
        <OutputPredictionCard key={i} index={i} item={item} />
      ))}
    </div>
  );
}

function OutputPredictionCard({
  index,
  item,
}: {
  index: number;
  item: OutputPrediction;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="mb-2 text-sm font-semibold">
        Predict the output #{index + 1}
      </p>
      <CodeBlock code={item.code} />
      <button
        type="button"
        onClick={() => setRevealed((r) => !r)}
        className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        {revealed ? (
          <>
            <EyeOff className="h-3.5 w-3.5" /> Hide answer
          </>
        ) : (
          <>
            <Eye className="h-3.5 w-3.5" /> Reveal answer
          </>
        )}
      </button>
      {revealed && (
        <div className="mt-3 space-y-3">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Output
            </p>
            <pre className="overflow-x-auto rounded-lg border border-success/30 bg-success/10 p-3 font-mono text-xs text-foreground">
              {item.answer}
            </pre>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Why
            </p>
            <Markdown>{item.explanationMD}</Markdown>
          </div>
        </div>
      )}
    </div>
  );
}
