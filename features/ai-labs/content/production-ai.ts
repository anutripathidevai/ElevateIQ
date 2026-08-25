import type { LabContent } from "../types";

/**
 * Lab 12 — Production AI.
 *
 * Teaches the runtime controls that make an AI feature operationally safe:
 * cache first, enforce rate limits, fail over providers, track cost, and expose
 * observability. The demo implements those mechanics entirely in the browser.
 */
export const productionAiContent: LabContent = {
  slug: "production-ai",

  overviewMD: `
## Why production AI is different

A prototype can call a model directly and print the answer. A production AI
system needs a reliability layer around that call: caching, rate limits,
provider fallback, cost controls, and observability. Without those controls, a
popular feature becomes slow, expensive, and hard to debug.

This lab simulates a production request path. You send prompts through a cache,
a rolling rate limiter, a primary provider, an optional fallback provider, and a
request log that tracks latency and cost.

## The core problem

AI calls are high-latency, non-free, and provider-dependent. Users retry. Models
rate-limit. Vendors have outages. Identical prompts may be asked repeatedly. A
good gateway handles those realities before the UI has to care.

## Where it is used

- Chat products with repeated FAQs and high traffic spikes
- AI gateways that need multiple providers or models
- SaaS applications enforcing per-user quotas and budgets
- Observability dashboards for latency, cost, cache hits, and failures
`.trim(),

  whatYouBuild: [
    "A prompt-keyed response cache that returns fast zero-cost hits",
    "A rolling in-memory rate limiter with a configurable request cap",
    "A primary-provider call path that can be forced into outage",
    "A cheaper fallback-provider path with separate latency and cost",
    "A dashboard and request log for requests, hit rate, rate limits, cost, and provider",
  ],

  architecture: {
    title: "Production AI request path",
    flow: [
      "[ Prompt selection ]",
      "      |",
      "      v",
      "[ Check cache ] -- hit --> [ Return cached answer + log HIT ]",
      "      | miss",
      "      v",
      "[ Rate-limit check ] -- over limit --> [ 429 result + log RATE-LIMITED ]",
      "      | allowed",
      "      v",
      "[ Primary provider ] -- outage --> [ Secondary fallback ]",
      "      | success                     | success",
      "      v                             v",
      "[ Store in cache ] <---------------'",
      "      |",
      "      v",
      "[ Metrics + request log ]",
    ].join("\n"),
    nodes: [
      {
        id: "request-router",
        label: "Request router",
        whatMD:
          "A single gateway path receives the prompt and decides which operational checks to run before any provider call.",
        whyMD:
          "Centralizing the path keeps caching, limits, fallback, and telemetry consistent across every AI feature.",
        input: "Prompt key and runtime controls",
        output: "A cache hit, rate-limit result, or provider call",
        commonFailure:
          "Scattering model calls across UI components so there is no shared policy or usage accounting.",
        interviewQuestion:
          "Why should AI calls go through a gateway instead of direct feature code?",
      },
      {
        id: "response-cache",
        label: "Response cache",
        whatMD:
          "The demo checks a prompt-keyed cache first. A hit returns in a tiny simulated latency with zero model cost.",
        whyMD:
          "Caching repeated or deterministic work improves latency, protects providers, and lowers spend.",
        input: "Prompt text",
        output: "Cached answer or cache miss",
        commonFailure:
          "Caching personalized or stale answers without including user, permissions, or freshness in the key.",
        interviewQuestion:
          "What belongs in the cache key for an AI response?",
      },
      {
        id: "rate-limiter",
        label: "Rate limiter",
        whatMD:
          "A rolling timestamp window counts recent sends and blocks cache misses once the configured limit is reached.",
        whyMD:
          "Rate limits protect cost, provider quotas, and downstream systems during retries or abuse.",
        input: "Recent request timestamps and max requests per window",
        output: "Allowed or 429 rate-limited",
        commonFailure:
          "Only rate-limiting at the provider account level, after one noisy user can affect everyone.",
        interviewQuestion:
          "How would you design per-user and global AI rate limits?",
      },
      {
        id: "provider-failover",
        label: "Provider failover",
        whatMD:
          "If the primary provider is forced into outage, the demo routes to a secondary provider with different cost and latency.",
        whyMD:
          "Provider outages should degrade gracefully instead of taking the entire AI feature down.",
        input: "Allowed cache miss and outage state",
        output: "Primary or fallback answer",
        commonFailure:
          "Retrying the same failing provider until the user times out, with no fallback or circuit breaker.",
        interviewQuestion:
          "When should a gateway retry, fail over, or return an error?",
      },
      {
        id: "observability",
        label: "Observability + cost",
        whatMD:
          "Every request writes a log row with result type, provider, latency, and cost, then updates dashboard metrics.",
        whyMD:
          "You cannot operate AI without knowing cost, latency, cache effectiveness, and failure rates by provider.",
        input: "Result metadata from cache, limiter, or provider",
        output: "Dashboard cards and request log",
        commonFailure:
          "Logging only the final answer and losing the operational context needed to debug latency or spend.",
        interviewQuestion:
          "Which metrics would you put on a production AI dashboard?",
      },
    ],
  },

  demo: "production-ai",

  executionMD: `
## What the execution trace shows

Each send follows the same production decision tree:

1. **Check cache** — if the selected prompt already has an answer, the demo
   returns a fast HIT with zero cost and skips rate limiting and providers.
2. **Rate-limit check** — cache misses count against a rolling request window.
   If the window is full, the request returns a simulated 429.
3. **Call primary provider** — allowed misses call the primary provider unless
   you force an outage.
4. **Fallback to secondary** — during primary outage, the request uses a cheaper
   secondary provider with a slower simulated latency.
5. **Store in cache** — successful provider answers are cached and logged with
   latency, provider, and cost.

The trace teaches how production systems keep model work behind deterministic
controls that the UI can observe and explain.
`.trim(),

  learnMD: `
## Production AI is a gateway problem

The model call is only one step. The gateway owns the policies around that call:
who can call it, how often, what it costs, what happens on failure, and how the
system is observed.

### Cache carefully

Cache deterministic, non-personalized answers first. Include prompt version,
model, tenant, locale, permissions, and freshness in the key when those factors
change the answer. Never cache private output under a shared key.

### Rate-limit before spending

Rate limits should run before provider calls. Most products combine per-user,
per-tenant, and global limits, then return a clear retry-after message instead
of letting one burst consume the shared quota.

### Fail over deliberately

Fallback providers help reliability, but they may differ in quality, latency,
cost, and safety behavior. Gateways should track which provider served the
answer and use circuit breakers so an outage does not trigger endless retries.

### Observe everything

Production dashboards need request counts, cache-hit rate, p95 latency, cost per
feature, rate-limit events, provider errors, and fallback rate. Without those
numbers, prompt tuning and incident response are guesswork.
`.trim(),

  challenge: {
    promptMD: `
Design the next version of the simulator for a multi-tenant SaaS product.

Add:

1. A cache key strategy that avoids leaking tenant-specific answers.
2. A rate-limit policy with both per-user and global limits.
3. An observability metric that would alert you before the monthly AI budget is exhausted.
`.trim(),
    hints: [
      "Cache keys should include every dimension that can change the answer: tenant, user permissions, prompt version, model, and locale.",
      "Per-user limits prevent abuse; global limits protect provider quotas and company budget.",
      "Budget alerts need burn rate, not just total spend after the fact.",
    ],
    expectedApproachMD: `
A strong design treats the AI gateway like shared infrastructure:

- Cache keys include tenant id, permission scope, prompt template version, model,
  locale, and any freshness window. Personalized answers either skip caching or
  use a private key.
- Rate limiting runs in layers: per-user burst, per-tenant quota, and global
  provider/budget cap. The response returns retry-after guidance for recoverable
  limits.
- Observability tracks cost burn rate by tenant and feature, projected month-end
  spend, fallback rate, cache-hit rate, and rate-limit count. Alert when projected
  spend crosses a threshold, not when the bill arrives.
`.trim(),
  },

  interviewQuestions: [
    {
      id: "prod-q1",
      question: "What are the main differences between an AI prototype and production AI?",
      difficulty: "Intermediate",
      answerMD:
        "A prototype proves the model can answer. Production AI must control reliability, cost, safety, latency, and observability. That means server-side access, authentication, rate limits, caching, retries, fallbacks, input/output guardrails, usage tracking, and dashboards. The goal shifts from one good answer to predictable behavior under load and failure.",
      keyPoints: [
        "Prototype validates capability",
        "Production controls cost, latency, and failures",
        "Gateway owns auth, limits, cache, fallback, telemetry",
        "Predictability matters more than a single good demo",
      ],
      followUps: [
        "Which production control would you add first?",
        "How do guardrails interact with caching?",
      ],
    },
    {
      id: "prod-q2",
      question: "How do you cache LLM responses safely?",
      difficulty: "Advanced",
      answerMD:
        "Cache only when the answer is deterministic enough and safe to reuse. The key should include prompt template version, normalized user prompt, model, sampling settings, tenant, locale, permissions, and data freshness version when relevant. Avoid shared caching for personalized or permissioned data. Add TTLs and invalidation, and measure hit rate versus stale or unsafe responses.",
      keyPoints: [
        "Cache deterministic and reusable work",
        "Key on prompt, model, params, tenant, permissions, freshness",
        "Avoid shared cache for private output",
        "Use TTLs, invalidation, and hit-rate metrics",
      ],
      followUps: [
        "How does temperature affect cacheability?",
        "When should semantic caching be avoided?",
      ],
    },
    {
      id: "prod-q3",
      question: "Design a rate limiter for AI requests.",
      difficulty: "Advanced",
      answerMD:
        "Use layered limits: per-user burst limits for abuse, per-tenant quotas for fairness and billing, and global/provider limits to protect shared capacity. Implement a rolling window or token bucket before provider calls. Return a clear 429 with retry-after guidance, and log limit type, user or tenant, and remaining quota. Cache hits may bypass model-call limits but should still be observed.",
      keyPoints: [
        "Layer per-user, tenant, and global limits",
        "Run before provider calls",
        "Rolling window or token bucket",
        "Return retry-after and log remaining quota",
      ],
      followUps: [
        "Should cache hits count against limits?",
        "How would you handle paid-plan quota upgrades?",
      ],
    },
    {
      id: "prod-q4",
      question: "How should a system handle provider outages and fallback models?",
      difficulty: "Advanced",
      answerMD:
        "Use timeouts, bounded retries, circuit breakers, and failover to a secondary provider or smaller model when the primary is unhealthy. Fallback must be observable because quality, cost, latency, and safety behavior can differ. Some tasks can degrade to cached or template answers; others should fail closed. The gateway should encode that policy per task instead of every feature inventing its own behavior.",
      keyPoints: [
        "Timeouts, bounded retries, circuit breakers",
        "Fail over only when the task permits it",
        "Fallback changes quality, cost, latency, and safety",
        "Observe provider and fallback rate",
      ],
      followUps: [
        "When would you not fall back to a cheaper model?",
        "How do you test failover before a real incident?",
      ],
    },
    {
      id: "prod-q5",
      question: "Which metrics are essential for a production AI dashboard?",
      difficulty: "Intermediate",
      answerMD:
        "Track volume, success rate, error categories, rate-limit events, cache-hit rate, latency percentiles, provider selection, fallback rate, input/output tokens, and cost by feature, tenant, model, and time window. Add quality and safety signals such as validation failures or user feedback. The dashboard should answer: is it working, is it fast, is it safe, and what is it costing?",
      keyPoints: [
        "Request volume and success/error rates",
        "Latency percentiles and provider/fallback split",
        "Tokens and cost by feature or tenant",
        "Safety failures and user feedback",
      ],
      followUps: [
        "How would you estimate cost before final usage arrives?",
        "What alert would catch runaway prompt output?",
      ],
    },
  ],
};
