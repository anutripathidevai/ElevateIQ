# AI Reliability & Observability

This document describes the resilience + telemetry layer that sits behind the
shared Azure OpenAI client (`services/ai/client.ts`). It was added without
changing any public function signature or the request/response contract of any
call site — every existing graceful-fallback path (503 on mock/review, seed
questions on the panel, demo provider in AI Labs) still works exactly as before.

## What was added

| Concern | Where | Behaviour |
| --- | --- | --- |
| Per-attempt **timeout** | `services/ai/reliability.ts` → `runResilient` | Aborts the request after `AI_REQUEST_TIMEOUT_MS` (default 30s) and raises `AiTimeoutError`. |
| Bounded **retry** | `runResilient` | Up to `AI_MAX_RETRIES` (default 2) extra attempts per model on **transient** errors (HTTP 408/409/425/429, any 5xx, timeouts, network faults) with exponential backoff + full jitter (`AI_RETRY_BASE_MS`, default 500ms). Non-transient errors (4xx, auth, `AiNotConfiguredError`, input-too-large) are surfaced immediately. |
| Model **fallback** | `runResilient` | After the primary deployment is exhausted, the request is retried on `AZURE_OPENAI_FALLBACK_DEPLOYMENT` (same endpoint/key) with a fresh retry cycle. Disabled when unset. |
| **Token / request limits** | `reliability.ts` | `assertInputWithinBudget` rejects prompts over `AI_MAX_INPUT_TOKENS` (default 12k) with `AiInputTooLargeError`; `clampOutputTokens` caps every request's output budget at `AI_MAX_OUTPUT_TOKENS` (default 2k). Per-user daily request caps (`DAILY_AI_LIMIT`, `AI_LABS_DAILY_LIMIT`) are unchanged. |
| **Telemetry** | `services/ai/telemetry.ts` → `recordAiCall` | Every call emits a structured `[ai.telemetry] {...}` console line **and** (optionally) an Application Insights `AiCall` custom event + metrics. |

All call sites route through two helpers in `services/ai/completion.ts`:
`runChatCompletion` (non-streaming) and `runChatCompletionStream` (streaming).
The AI Labs provider (`services/ai-labs/providers/azure-llm.ts`) wraps stream
establishment in `runResilient` directly to preserve its `LLMResult` contract.

> **Streaming note:** reliability covers stream *establishment* (before the
> first byte). Once tokens start flowing, the stream is never restarted —
> retry/fallback only apply pre-stream, matching how the UI consumes it.

## Telemetry fields (all PII-free)

`operation`, `model`, `promptVersion`, `correlationId`, `latencyMs`, `success`,
`retryCount`, `fallbackUsed`, `streamed`, `inputTokens`, `outputTokens`,
`estimatedCostUsd`, `errorType` (PII-free label, e.g. `timeout`, `http_429`).

**Prompt text, candidate answers, secrets and message contents are never
captured.** Cost is estimated from token counts via the existing
`estimateCost()` pricing table (`services/ai-labs/usage.ts`) — it is for
intuition, not billing.

## Configuration

All variables are optional; safe defaults apply. See `.env.example`.

```
AZURE_OPENAI_FALLBACK_DEPLOYMENT=      # optional second deployment for fallback
AI_REQUEST_TIMEOUT_MS=30000
AI_MAX_RETRIES=2
AI_RETRY_BASE_MS=500
AI_MAX_INPUT_TOKENS=12000
AI_MAX_OUTPUT_TOKENS=2000
APPLICATIONINSIGHTS_CONNECTION_STRING= # optional; enables App Insights export
```

`applicationinsights` is an **optional** dependency, loaded via dynamic import
and marked external in `next.config.mjs`. If the package is missing or the
connection string is unset, telemetry silently falls back to the console line —
nothing breaks.

## Viewing AI telemetry in Azure Application Insights

1. In the Azure Portal, set **App Service → Configuration → Application settings
   → `APPLICATIONINSIGHTS_CONNECTION_STRING`** to your App Insights resource's
   connection string, then restart the app.
2. **Custom events** — Application Insights → *Usage → Events*, or run a KQL
   query in *Logs*:

   ```kql
   customEvents
   | where name == "AiCall"
   | extend model = tostring(customDimensions.model),
            operation = tostring(customDimensions.operation),
            success = tostring(customDimensions.success),
            latencyMs = todouble(customMeasurements.latencyMs),
            costUsd = todouble(customMeasurements.estimatedCostUsd)
   | summarize calls = count(),
               p95_latency = percentile(latencyMs, 95),
               total_cost = sum(costUsd),
               failures = countif(success == "false")
     by operation, model
   | order by calls desc
   ```

3. **Metrics** — `AiCallLatencyMs` and `AiEstimatedCostUsd` are emitted as
   custom metrics for charting/alerts.
4. **Without App Insights** — the same data is always available in App Service
   log stream / Log Analytics via the structured line:

   ```kql
   traces
   | where message startswith "[ai.telemetry] "
   | extend p = parse_json(substring(message, 15))
   | project timestamp, operation = p.operation, model = p.model,
             success = p.success, latencyMs = p.latencyMs,
             retryCount = p.retryCount, fallbackUsed = p.fallbackUsed,
             errorType = p.errorType, correlationId = p.correlationId
   ```

## Tests

`services/ai/__tests__/` covers timeout, retry (with retry counting), model
fallback, token limits (input rejection + output clamp), error classification,
and telemetry shape/PII-safety (`reliability.test.ts`, `telemetry.test.ts`,
`completion.test.ts`).
