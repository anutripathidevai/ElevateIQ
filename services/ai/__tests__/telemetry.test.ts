import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  __resetTelemetry,
  newCorrelationId,
  recordAiCall,
  type AiCallTelemetry,
} from "../telemetry";

function baseEvent(overrides: Partial<AiCallTelemetry> = {}): AiCallTelemetry {
  return {
    operation: "review.answer",
    model: "gpt-4o-mini",
    promptVersion: "review-answer@2026-01",
    correlationId: "corr-1",
    latencyMs: 123,
    success: true,
    retryCount: 0,
    fallbackUsed: false,
    streamed: false,
    inputTokens: 100,
    outputTokens: 50,
    estimatedCostUsd: 0.0004,
    ...overrides,
  };
}

describe("telemetry :: newCorrelationId", () => {
  it("returns unique non-empty ids", () => {
    const a = newCorrelationId();
    const b = newCorrelationId();
    expect(a).toBeTruthy();
    expect(b).toBeTruthy();
    expect(a).not.toBe(b);
  });
});

describe("telemetry :: recordAiCall", () => {
  beforeEach(() => {
    __resetTelemetry();
    delete process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
  });
  afterEach(() => {
    __resetTelemetry();
    delete process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
    vi.restoreAllMocks();
  });

  it("always emits a structured [ai.telemetry] console line with the metrics", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    recordAiCall(baseEvent());
    expect(spy).toHaveBeenCalledTimes(1);
    const line = spy.mock.calls[0][0] as string;
    expect(line.startsWith("[ai.telemetry] ")).toBe(true);
    const payload = JSON.parse(line.replace("[ai.telemetry] ", ""));
    expect(payload.operation).toBe("review.answer");
    expect(payload.model).toBe("gpt-4o-mini");
    expect(payload.latencyMs).toBe(123);
    expect(payload.success).toBe(true);
    expect(payload.inputTokens).toBe(100);
    expect(payload.estimatedCostUsd).toBeCloseTo(0.0004);
  });

  it("never logs prompt/answer/content or secret fields (PII-free)", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    recordAiCall(baseEvent());
    const line = spy.mock.calls[0][0] as string;
    const payload = JSON.parse(line.replace("[ai.telemetry] ", ""));
    for (const forbidden of [
      "content",
      "messages",
      "prompt",
      "answer",
      "apiKey",
      "text",
    ]) {
      expect(Object.keys(payload)).not.toContain(forbidden);
    }
  });

  it("records failures with a PII-free errorType label", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    recordAiCall(
      baseEvent({ success: false, errorType: "http_429", inputTokens: undefined }),
    );
    const payload = JSON.parse(
      (spy.mock.calls[0][0] as string).replace("[ai.telemetry] ", ""),
    );
    expect(payload.success).toBe(false);
    expect(payload.errorType).toBe("http_429");
  });

  it("does not throw when Application Insights is not configured", () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    expect(() => recordAiCall(baseEvent())).not.toThrow();
  });
});
