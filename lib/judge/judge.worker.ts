/**
 * Web Worker entry for the DSA judge. User code runs here (off the main thread)
 * so an infinite loop can be killed with `worker.terminate()` without freezing
 * the UI. See `client.ts` for the timeout logic.
 */
import { runSpec } from "./harness";
import type { JudgeSpec } from "./types";

const ctx = self as unknown as {
  onmessage: ((e: MessageEvent) => void) | null;
  postMessage: (msg: unknown) => void;
};

ctx.onmessage = (e: MessageEvent<{ code: string; spec: JudgeSpec }>) => {
  const { code, spec } = e.data;
  try {
    ctx.postMessage({ ok: true, out: runSpec(code, spec) });
  } catch (err) {
    ctx.postMessage({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
};

export {};
