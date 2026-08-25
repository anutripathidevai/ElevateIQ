"use client";

import { AlertCircle, CheckCircle2, Coins, Gauge, Hash, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LiveTrace } from "./demo-types";

/**
 * Renders the live execution trace for the most recent run: each pipeline stage
 * with its duration + status, followed by the final metrics (model, tokens,
 * latency, cost). Before the first run it shows guidance so the tab is never
 * blank.
 */
export function ExecutionTrace({ trace }: { trace: LiveTrace | null }) {
  if (!trace || trace.steps.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
        <Gauge className="mx-auto h-6 w-6 opacity-60" />
        <p className="mt-2 font-medium text-foreground">No run yet</p>
        <p className="mt-1">
          Run the demo, then come back here to see every stage of the AI call with
          real timings, token counts, latency, and cost.
        </p>
      </div>
    );
  }

  const m = trace.metrics;

  return (
    <div className="space-y-5">
      <ol className="relative space-y-3 border-l border-border pl-5">
        {trace.steps.map((step, i) => {
          const error = step.status === "error";
          return (
            <li key={i} className="relative">
              <span
                className={cn(
                  "absolute -left-[26px] flex h-4 w-4 items-center justify-center rounded-full",
                  error ? "bg-danger/15" : "bg-emerald-500/15",
                )}
              >
                {error ? (
                  <AlertCircle className="h-3 w-3 text-danger" />
                ) : (
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                )}
              </span>
              <div className="flex items-baseline justify-between gap-3">
                <p className={cn("text-sm font-medium", error && "text-danger")}>
                  {step.label}
                </p>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  +{step.durationMs}ms
                </span>
              </div>
              {step.detail && (
                <p className="mt-0.5 text-xs text-muted-foreground">{step.detail}</p>
              )}
            </li>
          );
        })}
      </ol>

      {m && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric icon={Hash} label="Input tokens" value={m.inputTokens.toLocaleString()} />
          <Metric icon={Hash} label="Output tokens" value={m.outputTokens.toLocaleString()} />
          <Metric icon={Timer} label="Latency" value={`${m.latencyMs} ms`} />
          <Metric
            icon={Coins}
            label="Est. cost"
            value={m.demo ? "Demo" : `$${m.costUsd.toFixed(5)}`}
          />
        </div>
      )}
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Hash;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </p>
      <p className="mt-1 font-mono text-sm font-semibold">{value}</p>
    </div>
  );
}
