/**
 * AI reliability primitives: per-attempt timeouts, bounded retry with
 * exponential backoff + jitter, configurable model fallback, and token/request
 * budget guards.
 *
 * This is a thin, dependency-free layer that sits behind the existing
 * `getAzureClient()` seam (see {@link file://./client.ts}). It does NOT change
 * the request/response contract of any call site — callers still get their
 * completion (or stream) back; they just get it more reliably. All config is
 * read from `process.env` at call time (matching the codebase convention in
 * `services/ai-labs/usage.ts`) so behaviour is overridable per environment and
 * testable without module-load ordering games.
 *
 * PII: none of the error classes or helpers here ever capture prompt/answer
 * text — only counts and status codes — so they are safe to log.
 */

/** Thrown when a single attempt exceeds the configured request timeout. */
export class AiTimeoutError extends Error {
  constructor(public readonly timeoutMs: number) {
    super(`AI request timed out after ${timeoutMs}ms`);
    this.name = "AiTimeoutError";
  }
}

/** Thrown before dispatch when the prompt exceeds the input-token budget. */
export class AiInputTooLargeError extends Error {
  constructor(
    public readonly estimatedTokens: number,
    public readonly limit: number,
  ) {
    super(
      `AI request exceeds the input token budget (${estimatedTokens} > ${limit})`,
    );
    this.name = "AiInputTooLargeError";
  }
}

// --------------------------------------------------------------------------
// Config (read from env at call time; safe defaults; NaN-guarded)
// --------------------------------------------------------------------------

function readIntEnv(key: string, fallback: number, min: number): number {
  const raw = process.env[key];
  const n = raw == null || raw === "" ? NaN : Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.trunc(n));
}

export interface RetryConfig {
  /** Per-attempt timeout in milliseconds. */
  timeoutMs: number;
  /** Additional attempts after the first, per model, on transient errors. */
  maxRetries: number;
  /** Base backoff delay; grows exponentially with jitter. */
  baseDelayMs: number;
}

export function getRetryConfig(): RetryConfig {
  return {
    timeoutMs: readIntEnv("AI_REQUEST_TIMEOUT_MS", 30_000, 1),
    maxRetries: readIntEnv("AI_MAX_RETRIES", 2, 0),
    baseDelayMs: readIntEnv("AI_RETRY_BASE_MS", 500, 0),
  };
}

export interface LimitsConfig {
  maxInputTokens: number;
  maxOutputTokens: number;
}

export function getLimitsConfig(): LimitsConfig {
  return {
    maxInputTokens: readIntEnv("AI_MAX_INPUT_TOKENS", 12_000, 1),
    maxOutputTokens: readIntEnv("AI_MAX_OUTPUT_TOKENS", 2_000, 1),
  };
}

/** Optional fallback deployment tried after the primary model is exhausted. */
export function getFallbackModel(): string | undefined {
  const raw = process.env.AZURE_OPENAI_FALLBACK_DEPLOYMENT?.trim();
  return raw ? raw : undefined;
}

// --------------------------------------------------------------------------
// Token budgeting
// --------------------------------------------------------------------------

interface WithContent {
  content?: unknown;
}

/** Rough prompt-token estimate (~4 chars/token) — no tokenizer dependency. */
export function estimatePromptTokens(messages: readonly WithContent[]): number {
  return messages.reduce((sum, m) => {
    const len = typeof m.content === "string" ? m.content.length : 0;
    return sum + Math.ceil(len / 4);
  }, 0);
}

/** Clamp a requested output-token budget to the configured ceiling. */
export function clampOutputTokens(requested?: number): number {
  const { maxOutputTokens } = getLimitsConfig();
  const base =
    requested != null && Number.isFinite(requested) ? requested : maxOutputTokens;
  return Math.max(1, Math.min(Math.trunc(base), maxOutputTokens));
}

/** Throw {@link AiInputTooLargeError} if the prompt exceeds the input budget. */
export function assertInputWithinBudget(
  messages: readonly WithContent[],
): void {
  const estimated = estimatePromptTokens(messages);
  const { maxInputTokens } = getLimitsConfig();
  if (estimated > maxInputTokens) {
    throw new AiInputTooLargeError(estimated, maxInputTokens);
  }
}

// --------------------------------------------------------------------------
// Error classification (PII-free)
// --------------------------------------------------------------------------

/** Best-effort HTTP status extraction across SDK/native error shapes. */
export function getStatus(err: unknown): number | undefined {
  if (!err || typeof err !== "object") return undefined;
  const e = err as {
    status?: unknown;
    statusCode?: unknown;
    response?: { status?: unknown };
  };
  const raw = e.status ?? e.statusCode ?? e.response?.status;
  return typeof raw === "number" ? raw : undefined;
}

const TRANSIENT_CODES = new Set([
  "ECONNRESET",
  "ECONNREFUSED",
  "ETIMEDOUT",
  "EPIPE",
  "EAI_AGAIN",
  "ENOTFOUND",
]);

/**
 * A transient error is one worth retrying: request timeouts, HTTP 408/409/425/
 * 429, any 5xx, and low-level network faults. Non-transient errors (auth,
 * validation, 4xx other than the above, `AiNotConfiguredError`,
 * `AiInputTooLargeError`) are surfaced immediately so we never waste a retry or
 * a fallback on a request that can't succeed.
 */
export function isTransientError(err: unknown): boolean {
  if (err instanceof AiTimeoutError) return true;
  if (err instanceof AiInputTooLargeError) return false;

  const status = getStatus(err);
  if (status != null) {
    if (status === 408 || status === 409 || status === 425 || status === 429) {
      return true;
    }
    return status >= 500 && status <= 599;
  }

  if (err && typeof err === "object") {
    const code = (err as { code?: unknown }).code;
    if (typeof code === "string" && TRANSIENT_CODES.has(code)) return true;
    // openai SDK connection errors have this name and no status.
    const name = (err as { name?: unknown }).name;
    if (name === "APIConnectionError" || name === "APIConnectionTimeoutError") {
      return true;
    }
  }
  return false;
}

/** A short, PII-free label for telemetry — never the error message text. */
export function errorLabel(err: unknown): string {
  if (err instanceof AiTimeoutError) return "timeout";
  if (err instanceof AiInputTooLargeError) return "input_too_large";
  const status = getStatus(err);
  if (status != null) return `http_${status}`;
  if (err && typeof err === "object") {
    const code = (err as { code?: unknown }).code;
    if (typeof code === "string" && TRANSIENT_CODES.has(code)) return "network";
    const name = (err as { name?: unknown }).name;
    if (typeof name === "string" && name) return name;
  }
  return "unknown_error";
}

// --------------------------------------------------------------------------
// Resilient executor
// --------------------------------------------------------------------------

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Full jitter exponential backoff. */
function backoffDelay(base: number, attempt: number): number {
  if (base <= 0) return 0;
  const ceiling = base * 2 ** attempt;
  return Math.floor(Math.random() * ceiling);
}

async function withTimeout<T>(
  run: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      // Abort the in-flight request (so the SDK cancels the socket) AND reject.
      controller.abort();
      reject(new AiTimeoutError(timeoutMs));
    }, timeoutMs);
  });
  // Kick off the work; swallow any post-timeout rejection from the loser so it
  // never surfaces as an unhandled rejection once the race has settled.
  const runPromise = Promise.resolve().then(() => run(controller.signal));
  runPromise.catch(() => {});
  try {
    return await Promise.race([runPromise, timeout]);
  } catch (err) {
    // If the request rejected *because* we aborted it, normalise to a timeout.
    if (controller.signal.aborted && !(err instanceof AiTimeoutError)) {
      throw new AiTimeoutError(timeoutMs);
    }
    throw err;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export interface ResilientModels {
  primaryModel: string;
  /** Optional; tried with a fresh retry cycle after the primary is exhausted. */
  fallbackModel?: string;
}

/** Mutable stats surfaced to telemetry on both success and failure. */
export interface ResilientStats {
  retryCount: number;
  fallbackUsed: boolean;
  modelUsed?: string;
}

export function newStats(): ResilientStats {
  return { retryCount: 0, fallbackUsed: false };
}

/**
 * Execute `run(model, signal)` with per-attempt timeout, bounded retry on
 * transient errors, then an optional fallback model. `stats` is mutated in
 * place so callers can record retry/fallback telemetry even when the call
 * ultimately throws.
 *
 * For streaming callers, `run` resolves once the stream is *established* (before
 * the first byte); the timeout therefore covers connection establishment and
 * retry/fallback only apply pre-stream — an in-flight stream is never restarted.
 */
export async function runResilient<T>(
  run: (model: string, signal: AbortSignal) => Promise<T>,
  models: ResilientModels,
  cfg: RetryConfig = getRetryConfig(),
  stats: ResilientStats = newStats(),
): Promise<T> {
  const chain = models.fallbackModel
    ? [models.primaryModel, models.fallbackModel]
    : [models.primaryModel];

  let lastError: unknown;

  for (let modelIndex = 0; modelIndex < chain.length; modelIndex++) {
    const model = chain[modelIndex];
    const isFallback = modelIndex > 0;

    for (let attempt = 0; attempt <= cfg.maxRetries; attempt++) {
      try {
        const value = await withTimeout(
          (signal) => run(model, signal),
          cfg.timeoutMs,
        );
        stats.modelUsed = model;
        stats.fallbackUsed = isFallback;
        return value;
      } catch (err) {
        lastError = err;
        if (!isTransientError(err)) throw err;
        const moreAttempts = attempt < cfg.maxRetries;
        if (moreAttempts) {
          stats.retryCount += 1;
          await sleep(backoffDelay(cfg.baseDelayMs, attempt));
        }
      }
    }
    // Exhausted this model's attempts; loop advances to the fallback (if any).
  }

  throw lastError;
}
