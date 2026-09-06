import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  AiInputTooLargeError,
  AiTimeoutError,
  assertInputWithinBudget,
  clampOutputTokens,
  errorLabel,
  estimatePromptTokens,
  getStatus,
  isTransientError,
  newStats,
  runResilient,
  type RetryConfig,
} from "../reliability";

const LIMIT_ENV = [
  "AI_MAX_INPUT_TOKENS",
  "AI_MAX_OUTPUT_TOKENS",
  "AI_REQUEST_TIMEOUT_MS",
  "AI_MAX_RETRIES",
  "AI_RETRY_BASE_MS",
  "AZURE_OPENAI_FALLBACK_DEPLOYMENT",
] as const;

function clearEnv() {
  for (const k of LIMIT_ENV) delete process.env[k];
}

/** Deterministic config for tests: no backoff delay. */
function cfg(overrides: Partial<RetryConfig> = {}): RetryConfig {
  return { timeoutMs: 1000, maxRetries: 2, baseDelayMs: 0, ...overrides };
}

function httpError(status: number): Error & { status: number } {
  return Object.assign(new Error(`http ${status}`), { status });
}

describe("reliability :: error classification", () => {
  it("treats 429 and 5xx and timeouts as transient", () => {
    expect(isTransientError(httpError(429))).toBe(true);
    expect(isTransientError(httpError(500))).toBe(true);
    expect(isTransientError(httpError(503))).toBe(true);
    expect(isTransientError(new AiTimeoutError(10))).toBe(true);
    expect(
      isTransientError(Object.assign(new Error(), { code: "ECONNRESET" })),
    ).toBe(true);
  });

  it("treats 4xx (except 408/409/425/429), config and input errors as non-transient", () => {
    expect(isTransientError(httpError(400))).toBe(false);
    expect(isTransientError(httpError(401))).toBe(false);
    expect(isTransientError(httpError(404))).toBe(false);
    expect(isTransientError(new AiInputTooLargeError(99, 10))).toBe(false);
    expect(isTransientError(new Error("plain"))).toBe(false);
  });

  it("getStatus reads status / statusCode / response.status", () => {
    expect(getStatus(httpError(503))).toBe(503);
    expect(getStatus(Object.assign(new Error(), { statusCode: 429 }))).toBe(429);
    expect(getStatus({ response: { status: 500 } })).toBe(500);
    expect(getStatus(new Error("x"))).toBeUndefined();
  });

  it("errorLabel is PII-free (never the message text)", () => {
    expect(errorLabel(new AiTimeoutError(1))).toBe("timeout");
    expect(errorLabel(httpError(429))).toBe("http_429");
    expect(errorLabel(new AiInputTooLargeError(9, 1))).toBe("input_too_large");
    expect(
      errorLabel(
        Object.assign(new Error("secret prompt"), { code: "ETIMEDOUT" }),
      ),
    ).toBe("network");
    // A raw error's message must never leak into the label.
    expect(
      errorLabel(new Error("candidate said something private")),
    ).not.toContain("candidate");
  });
});

describe("reliability :: token limits", () => {
  beforeEach(clearEnv);
  afterEach(clearEnv);

  it("estimates prompt tokens from message length", () => {
    const tokens = estimatePromptTokens([
      { content: "a".repeat(40) },
      { content: "b".repeat(40) },
    ]);
    expect(tokens).toBe(20); // 80 chars / 4
  });

  it("clamps output tokens to the configured ceiling", () => {
    process.env.AI_MAX_OUTPUT_TOKENS = "100";
    expect(clampOutputTokens(500)).toBe(100);
    expect(clampOutputTokens(50)).toBe(50);
    expect(clampOutputTokens(undefined)).toBe(100); // defaults to the cap
  });

  it("throws AiInputTooLargeError when the prompt exceeds the input budget", () => {
    process.env.AI_MAX_INPUT_TOKENS = "10"; // 40 chars
    expect(() =>
      assertInputWithinBudget([{ content: "x".repeat(400) }]),
    ).toThrow(AiInputTooLargeError);
    expect(() => assertInputWithinBudget([{ content: "short" }])).not.toThrow();
  });
});

describe("reliability :: runResilient", () => {
  beforeEach(clearEnv);
  afterEach(clearEnv);

  it("retries transient failures then succeeds, counting retries", async () => {
    let calls = 0;
    const stats = newStats();
    const value = await runResilient(
      async (model) => {
        calls += 1;
        if (calls < 3) throw httpError(503);
        return `ok:${model}`;
      },
      { primaryModel: "primary" },
      cfg({ maxRetries: 3 }),
      stats,
    );
    expect(value).toBe("ok:primary");
    expect(calls).toBe(3);
    expect(stats.retryCount).toBe(2);
    expect(stats.fallbackUsed).toBe(false);
    expect(stats.modelUsed).toBe("primary");
  });

  it("falls back to the secondary model after the primary is exhausted", async () => {
    const seen: string[] = [];
    const stats = newStats();
    const value = await runResilient(
      async (model) => {
        seen.push(model);
        if (model === "primary") throw httpError(429);
        return `ok:${model}`;
      },
      { primaryModel: "primary", fallbackModel: "backup" },
      cfg({ maxRetries: 1 }),
      stats,
    );
    expect(value).toBe("ok:backup");
    expect(stats.fallbackUsed).toBe(true);
    expect(stats.modelUsed).toBe("backup");
    // primary tried maxRetries+1 = 2 times, then backup once.
    expect(seen).toEqual(["primary", "primary", "backup"]);
    expect(stats.retryCount).toBe(1);
  });

  it("does not retry or fall back on non-transient errors", async () => {
    let calls = 0;
    const stats = newStats();
    await expect(
      runResilient(
        async () => {
          calls += 1;
          throw httpError(400);
        },
        { primaryModel: "primary", fallbackModel: "backup" },
        cfg({ maxRetries: 3 }),
        stats,
      ),
    ).rejects.toMatchObject({ status: 400 });
    expect(calls).toBe(1);
    expect(stats.retryCount).toBe(0);
    expect(stats.fallbackUsed).toBe(false);
  });

  it("enforces a per-attempt timeout and throws AiTimeoutError", async () => {
    const stats = newStats();
    await expect(
      runResilient(
        () => new Promise((resolve) => setTimeout(() => resolve("late"), 200)),
        { primaryModel: "primary" },
        cfg({ timeoutMs: 20, maxRetries: 0 }),
        stats,
      ),
    ).rejects.toBeInstanceOf(AiTimeoutError);
  });

  it("retries a timeout (transient) and can still succeed", async () => {
    let calls = 0;
    const stats = newStats();
    const value = await runResilient(
      (_model, signal) => {
        calls += 1;
        if (calls === 1) {
          // Never resolves within the window → times out, then gets retried.
          return new Promise<string>((resolve) => {
            signal.addEventListener("abort", () => resolve("aborted"));
          });
        }
        return Promise.resolve("ok");
      },
      { primaryModel: "primary" },
      cfg({ timeoutMs: 20, maxRetries: 1 }),
      stats,
    );
    expect(value).toBe("ok");
    expect(stats.retryCount).toBe(1);
  });
});
