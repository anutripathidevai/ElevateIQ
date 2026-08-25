"use client";

import { Info, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Small presentational building blocks shared across the AI Labs interactive
 * demos, so each lab's demo stays focused on its logic and the demos look and
 * behave consistently. Purely presentational — no lab-specific logic lives here.
 */

/**
 * Honest, consistent banner explaining that a demo runs locally (deterministic
 * simulation) rather than calling a hosted model — the same transparency the
 * LLM Playground uses for its demo-mode fallback.
 */
export function SimNotice({ children }: { children?: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>
        {children ??
          "This demo runs entirely in your browser with real, inspectable logic. Any model-generated text is a deterministic local stand-in so the lab always works — no API key required."}
      </span>
    </p>
  );
}

/** Two-column responsive layout: controls on the left, output on the right. */
export function DemoColumns({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 lg:grid-cols-2">{children}</div>;
}

/** A bordered output panel with a titled header and optional right-side chip. */
export function OutputPanel({
  title,
  chip,
  children,
  className,
}: {
  title: string;
  chip?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col rounded-xl border border-border bg-card", className)}>
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="inline-flex items-center gap-2 text-sm font-medium">
          <Sparkles className="h-4 w-4 text-violet-500" /> {title}
        </span>
        {chip && (
          <span className="font-mono text-[11px] text-muted-foreground">{chip}</span>
        )}
      </div>
      <div className="min-h-[280px] flex-1 p-4">{children}</div>
    </div>
  );
}

/** Placeholder shown in an output panel before the first run. */
export function EmptyHint({ running, children }: { running?: boolean; children: React.ReactNode }) {
  return (
    <p className={cn("text-sm text-muted-foreground", running && "animate-pulse")}>{children}</p>
  );
}

/** Inline error message consistent with the LLM Playground. */
export function DemoError({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
      {children}
    </p>
  );
}

/** A labelled range slider with a live value read-out. */
export function RangeControl({
  id,
  label,
  value,
  min,
  max,
  step,
  onChange,
  hint,
  format,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  hint?: string;
  format?: (value: number) => string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <span className="font-mono text-xs text-muted-foreground">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-violet-500"
      />
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** A small score bar (0–1) used by search/eval demos. */
export function ScoreBar({ score, className }: { score: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(score * 100)));
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div className="h-full rounded-full bg-violet-500" style={{ width: `${pct}%` }} />
    </div>
  );
}
