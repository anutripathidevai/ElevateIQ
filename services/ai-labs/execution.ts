/**
 * Lightweight execution tracer.
 *
 * Every AI Labs run records the stages it goes through (validate → provider
 * select → first token → stream → done) with millisecond timings. The trace is
 * streamed to the client so the "Execution Trace" tab shows what actually
 * happened behind an AI call — the observability mindset the Production AI lab
 * teaches. Uses a monotonic clock so timings are unaffected by wall-clock jumps.
 */

export type TraceStatus = "ok" | "error";

export interface TraceStep {
  label: string;
  /** Elapsed ms since the trace started (when this step completed). */
  atMs: number;
  /** Duration of this step in ms. */
  durationMs: number;
  status: TraceStatus;
  detail?: string;
}

function now(): number {
  return typeof performance !== "undefined" && typeof performance.now === "function"
    ? performance.now()
    : Date.now();
}

export class ExecutionTrace {
  private readonly start = now();
  private lastMark = this.start;
  private readonly steps: TraceStep[] = [];

  /** Record a completed step, measuring from the previous mark. */
  step(label: string, detail?: string, status: TraceStatus = "ok"): TraceStep {
    const t = now();
    const step: TraceStep = {
      label,
      atMs: Math.round(t - this.start),
      durationMs: Math.round(t - this.lastMark),
      status,
      detail,
    };
    this.lastMark = t;
    this.steps.push(step);
    return step;
  }

  /** Total elapsed time since the trace began. */
  totalMs(): number {
    return Math.round(now() - this.start);
  }

  snapshot(): { steps: TraceStep[]; totalMs: number } {
    return { steps: [...this.steps], totalMs: this.totalMs() };
  }
}
