import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runChatCompletion } from "../completion";
import { AiInputTooLargeError } from "../reliability";
import { AiNotConfiguredError } from "../client";
import { __resetTelemetry } from "../telemetry";

/**
 * These exercise the wrapper's wiring (budget guard → telemetry → error
 * passthrough) without a live Azure endpoint. The retry/fallback/timeout logic
 * itself is unit-tested against runResilient in reliability.test.ts.
 */
const AI_ENV = [
  "AZURE_OPENAI_ENDPOINT",
  "AZURE_OPENAI_API_KEY",
  "AI_MAX_INPUT_TOKENS",
  "APPLICATIONINSIGHTS_CONNECTION_STRING",
] as const;

function clearEnv() {
  for (const k of AI_ENV) delete process.env[k];
}

describe("completion :: runChatCompletion wiring", () => {
  beforeEach(() => {
    __resetTelemetry();
    clearEnv();
  });
  afterEach(() => {
    __resetTelemetry();
    clearEnv();
    vi.restoreAllMocks();
  });

  it("rejects an over-budget prompt and records a failure telemetry event", async () => {
    process.env.AI_MAX_INPUT_TOKENS = "5"; // 20 chars
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});

    await expect(
      runChatCompletion({
        maxTokens: 100,
        meta: { operation: "review.answer", promptVersion: "v1" },
        messages: [{ role: "user", content: "x".repeat(400) }],
      }),
    ).rejects.toBeInstanceOf(AiInputTooLargeError);

    expect(spy).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(
      (spy.mock.calls[0][0] as string).replace("[ai.telemetry] ", ""),
    );
    expect(payload.success).toBe(false);
    expect(payload.errorType).toBe("input_too_large");
    expect(payload.operation).toBe("review.answer");
  });

  it("propagates AiNotConfiguredError (graceful-fallback contract) and records failure", async () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});

    await expect(
      runChatCompletion({
        meta: {
          operation: "review.answer",
          promptVersion: "v1",
          correlationId: "corr-xyz",
        },
        messages: [{ role: "user", content: "hi" }],
      }),
    ).rejects.toBeInstanceOf(AiNotConfiguredError);

    const payload = JSON.parse(
      (spy.mock.calls[0][0] as string).replace("[ai.telemetry] ", ""),
    );
    expect(payload.success).toBe(false);
    expect(payload.correlationId).toBe("corr-xyz"); // caller-supplied id is threaded
    expect(payload.errorType).toBe("AiNotConfiguredError");
  });
});
