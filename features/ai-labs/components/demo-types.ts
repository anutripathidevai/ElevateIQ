/**
 * Client-side view models shared between a lab's interactive demo and the
 * Execution Trace tab. The demo reports a `LiveTrace` up to the lab shell as the
 * user runs it; the shell hands it to `ExecutionTrace` for rendering.
 */

export interface TraceStepView {
  label: string;
  atMs: number;
  durationMs: number;
  status: "ok" | "error";
  detail?: string;
}

/** Final metrics for a completed run. */
export interface RunMetrics {
  model: string;
  demo: boolean;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  costUsd: number;
  used: number;
  limit: number;
  remaining: number;
}

export interface LiveTrace {
  steps: TraceStepView[];
  totalMs: number;
  metrics?: RunMetrics;
}

/** Props every interactive lab demo receives from the lab shell. */
export interface LabDemoProps {
  /** Model/deployment name to display (from the server env). */
  defaultModel: string;
  /** Report the latest execution trace so the Trace tab can render it. */
  onTrace: (trace: LiveTrace | null) => void;
}
