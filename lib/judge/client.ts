"use client";

/**
 * Client-side entry point for running a solution. Spawns the judge Web Worker,
 * races it against a timeout, and terminates it if the user's code hangs
 * (infinite loop → "Time limit exceeded"). Falls back to running on the main
 * thread if workers are unavailable (loses hang protection, keeps correctness).
 */
import type { JudgeOutcome, JudgeSpec } from "./types";

function timedOut(spec: JudgeSpec): JudgeOutcome {
  return {
    results: [],
    passedCount: 0,
    total: spec.tests.length,
    allPassed: false,
    compileError: "Time limit exceeded — check for an infinite loop.",
  };
}

function failed(spec: JudgeSpec, message: string): JudgeOutcome {
  return {
    results: [],
    passedCount: 0,
    total: spec.tests.length,
    allPassed: false,
    compileError: message,
  };
}

export function runJudge(
  code: string,
  spec: JudgeSpec,
  timeoutMs = 5000,
): Promise<JudgeOutcome> {
  return new Promise((resolve) => {
    let worker: Worker;
    try {
      worker = new Worker(new URL("./judge.worker.ts", import.meta.url));
    } catch {
      // No worker support — run inline (no timeout guarantee).
      import("./harness")
        .then(({ runSpec }) => resolve(runSpec(code, spec)))
        .catch((e) => resolve(failed(spec, e?.message ?? "Failed to run.")));
      return;
    }

    let settled = false;
    const finish = (outcome: JudgeOutcome) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker.terminate();
      resolve(outcome);
    };

    const timer = setTimeout(() => finish(timedOut(spec)), timeoutMs);

    worker.onmessage = (e: MessageEvent) => {
      const d = e.data as
        | { ok: true; out: JudgeOutcome }
        | { ok: false; error: string };
      finish(d.ok ? d.out : failed(spec, d.error));
    };
    worker.onerror = (e) => finish(failed(spec, e.message || "Worker error."));

    worker.postMessage({ code, spec });
  });
}
