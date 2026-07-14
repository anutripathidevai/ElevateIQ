"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import type { JudgeOutcome } from "@/lib/judge/types";
import { cn } from "@/lib/utils";

function fmt(v: unknown): string {
  if (v === undefined) return "undefined";
  try {
    const s = JSON.stringify(v);
    return s.length > 240 ? s.slice(0, 240) + "…" : s;
  } catch {
    return String(v);
  }
}

export function TestResults({ outcome }: { outcome: JudgeOutcome }) {
  if (outcome.compileError) {
    return (
      <div className="rounded-md border border-danger/40 bg-danger/10 p-3">
        <p className="text-sm font-medium text-danger">Your code didn&apos;t run</p>
        <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-xs text-danger">
          {outcome.compileError}
        </pre>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">
        {outcome.passedCount} / {outcome.total} tests passed
      </p>
      <ul className="space-y-1.5">
        {outcome.results.map((r, i) => (
          <li
            key={i}
            className={cn(
              "rounded-md border p-2.5 text-sm",
              r.passed
                ? "border-success/40 bg-success/5"
                : "border-danger/40 bg-danger/5",
            )}
          >
            <div className="flex items-center gap-2">
              {r.passed ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
              ) : (
                <XCircle className="h-4 w-4 shrink-0 text-danger" />
              )}
              <span className="font-medium">{r.name}</span>
            </div>

            {!r.passed && !r.hidden && (
              <div className="mt-1.5 space-y-0.5 pl-6 font-mono text-xs text-muted-foreground">
                {r.input !== undefined && (
                  <div>
                    <span className="text-foreground/70">input:</span>{" "}
                    {fmt(r.input)}
                  </div>
                )}
                <div>
                  <span className="text-foreground/70">expected:</span>{" "}
                  {fmt(r.expected)}
                </div>
                {r.error ? (
                  <div className="text-danger">error: {r.error}</div>
                ) : (
                  <div>
                    <span className="text-foreground/70">actual:</span>{" "}
                    {fmt(r.actual)}
                  </div>
                )}
              </div>
            )}

            {!r.passed && r.hidden && (
              <p className="mt-1 pl-6 text-xs text-muted-foreground">
                Hidden test failed.
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
