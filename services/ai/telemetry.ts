/**
 * AI observability: a single `recordAiCall` sink for every LLM request.
 *
 * Two destinations, both best-effort and non-throwing:
 *  1. A structured `[ai.telemetry] {json}` line on `console.info`. Azure App
 *     Service captures stdout, so this is queryable in Log Analytics even when
 *     Application Insights isn't wired up. It is the always-on baseline.
 *  2. Azure Application Insights (optional). When
 *     `APPLICATIONINSIGHTS_CONNECTION_STRING` is set and the SDK is installed we
 *     lazily initialise it and emit a custom `AiCall` event + metrics. The SDK
 *     is imported dynamically so the app never hard-depends on it (installs,
 *     `npm ci` in the source-zip deploy, and the demo mode all keep working if
 *     the package is absent).
 *
 * PII policy: this module only ever receives — and only ever emits — counts,
 * durations, model ids, status labels and a correlation id. Prompt text,
 * candidate answers, secrets and message contents are NEVER passed in and NEVER
 * logged. Do not add fields that could carry user content.
 */

export interface AiCallTelemetry {
  /** Logical operation, e.g. "review.answer" or "panel.reply". */
  operation: string;
  /** Deployment/model that actually served the request. */
  model: string;
  /** Prompt version from the prompt-version registry. */
  promptVersion: string;
  /** Correlation id tying this call to its request. */
  correlationId: string;
  latencyMs: number;
  success: boolean;
  retryCount: number;
  fallbackUsed: boolean;
  streamed: boolean;
  inputTokens?: number;
  outputTokens?: number;
  estimatedCostUsd?: number;
  /** PII-free failure label (e.g. "timeout", "http_429"); omit on success. */
  errorType?: string;
}

/** Generate a correlation id (falls back to a random hex if crypto absent). */
export function newCorrelationId(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (c?.randomUUID) return c.randomUUID();
  return `ai-${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`;
}

// --------------------------------------------------------------------------
// Application Insights (optional, lazily initialised, never throws)
// --------------------------------------------------------------------------

interface MinimalTelemetryClient {
  trackEvent(t: {
    name: string;
    properties?: Record<string, string>;
    measurements?: Record<string, number>;
  }): void;
  trackMetric(t: { name: string; value: number }): void;
}

type AppInsightsState = "uninitialised" | "ready" | "disabled";

let aiState: AppInsightsState = "uninitialised";
let aiClient: MinimalTelemetryClient | null = null;
let initPromise: Promise<void> | null = null;

async function ensureAppInsights(): Promise<MinimalTelemetryClient | null> {
  if (aiState === "ready") return aiClient;
  if (aiState === "disabled") return null;

  const connectionString =
    process.env.APPLICATIONINSIGHTS_CONNECTION_STRING?.trim();
  if (!connectionString) {
    aiState = "disabled";
    return null;
  }

  if (!initPromise) {
    initPromise = (async () => {
      try {
        // Dynamic import keeps `applicationinsights` an optional dependency.
        const mod: unknown = await import("applicationinsights");
        interface AiConfiguration {
          setAutoDependencyCorrelation(v: boolean): AiConfiguration;
          setAutoCollectConsole(v: boolean, c?: boolean): AiConfiguration;
          setSendLiveMetrics(v: boolean): AiConfiguration;
          start(): void;
        }
        const appInsights = ((mod as { default?: unknown }).default ??
          mod) as {
          setup?: (conn?: string) => AiConfiguration;
          defaultClient?: MinimalTelemetryClient;
        };

        if (typeof appInsights.setup === "function") {
          appInsights
            .setup(connectionString)
            // Never let the SDK slurp our console lines back in as logs.
            .setAutoCollectConsole(false, false)
            .setAutoDependencyCorrelation(true)
            .setSendLiveMetrics(false)
            .start();
          aiClient = appInsights.defaultClient ?? null;
        }
        aiState = aiClient ? "ready" : "disabled";
      } catch {
        // Package not installed or failed to init — fall back to console only.
        aiState = "disabled";
        aiClient = null;
      }
    })();
  }
  await initPromise;
  return aiClient;
}

// --------------------------------------------------------------------------
// Sink
// --------------------------------------------------------------------------

/**
 * Record one AI call. Always emits a structured console line; additionally
 * forwards to Application Insights when configured. Never throws.
 */
export function recordAiCall(t: AiCallTelemetry): void {
  // 1. Always-on structured log (captured by App Service / Log Analytics).
  try {
    // eslint-disable-next-line no-console
    console.info(`[ai.telemetry] ${JSON.stringify(t)}`);
  } catch {
    /* ignore logging faults */
  }

  // 2. Best-effort Application Insights (fire-and-forget; never awaited by caller).
  void (async () => {
    try {
      const client = await ensureAppInsights();
      if (!client) return;

      const properties: Record<string, string> = {
        operation: t.operation,
        model: t.model,
        promptVersion: t.promptVersion,
        correlationId: t.correlationId,
        success: String(t.success),
        streamed: String(t.streamed),
        fallbackUsed: String(t.fallbackUsed),
      };
      if (t.errorType) properties.errorType = t.errorType;

      const measurements: Record<string, number> = {
        latencyMs: t.latencyMs,
        retryCount: t.retryCount,
      };
      if (t.inputTokens != null) measurements.inputTokens = t.inputTokens;
      if (t.outputTokens != null) measurements.outputTokens = t.outputTokens;
      if (t.estimatedCostUsd != null) {
        measurements.estimatedCostUsd = t.estimatedCostUsd;
      }

      client.trackEvent({ name: "AiCall", properties, measurements });
      client.trackMetric({ name: "AiCallLatencyMs", value: t.latencyMs });
      if (t.estimatedCostUsd != null) {
        client.trackMetric({
          name: "AiEstimatedCostUsd",
          value: t.estimatedCostUsd,
        });
      }
    } catch {
      /* telemetry must never break a request */
    }
  })();
}

/** Test-only: reset the memoised Application Insights initialisation state. */
export function __resetTelemetry(): void {
  aiState = "uninitialised";
  aiClient = null;
  initPromise = null;
}
