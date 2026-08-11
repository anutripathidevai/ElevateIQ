import type { CDModuleContent } from "../types";

/**
 * Module 6 — Observability (New Relic / Splunk).
 * Senior-level focus: designing telemetry that lets you find and fix problems
 * fast — the three pillars, tracing, and alerting that pages on symptoms.
 */
export const observabilityNewrelicSplunkContent: CDModuleContent = {
  slug: "observability-newrelic-splunk",
  introMD: `Observability is the ability to ask new questions about a running system without shipping new code. Senior interviews test whether you can design telemetry that turns a 2am page into a fast diagnosis instead of a guessing game.

This module covers the three pillars (metrics, logs, traces), distributed tracing across services, and alerting that pages on user-facing symptoms with SLOs — not on noisy internal thresholds.`,
  coreFlow: {
    title: "From signal to diagnosis",
    body: `metrics (what is wrong, how bad)
   -> alert on SLO breach (symptom, user-facing)
      -> traces (which service / hop is slow)
         -> logs (why: the exact error, with request id)
            -> fix`,
  },
  seniorFocus: [
    "Design the three pillars so metrics, logs, and traces reinforce each other.",
    "Correlate telemetry with a request id / trace id across services.",
    "Alert on user-facing symptoms and SLO breaches, not raw internal thresholds.",
    "Use distributed tracing to find the slow hop in a request path.",
    "Keep cardinality and log volume under control so cost stays sane.",
  ],
  concepts: [
    {
      id: "three-pillars",
      title: "The three pillars: metrics, logs, traces",
      whatMD: `**Metrics** are cheap aggregate numbers (rate, latency, errors) — good for what and how bad. **Logs** are detailed events — good for why. **Traces** follow one request across services — good for where. You need all three, correlated.`,
      howMD: `Start from a metric that shows something is wrong, jump to the trace to find the slow or failing hop, then read the logs for that hop to find the exact cause. A shared request id links them so you are not guessing.`,
      diagram: {
        title: "What / where / why",
        body: `metrics -> WHAT is wrong (error rate up, p99 up)
traces  -> WHERE it happens (which service/hop)
logs    -> WHY it happens (the exact error + context)`,
      },
      interviewPoints: [
        "Metrics = what and how bad; logs = why; traces = where.",
        "Correlate all three with a shared request/trace id.",
        "Metrics are cheap and always-on; logs are detailed but pricey at volume.",
        "High-cardinality labels blow up metric cost — keep dimensions bounded.",
      ],
      realWorldMD: `A latency metric spikes; the trace shows one downstream call is slow; the log for that call, found by trace id, shows a connection-pool timeout — diagnosis in minutes.`,
      interviewQuestions: [
        "What are the three pillars of observability and when do you use each?",
      ],
    },
    {
      id: "distributed-tracing",
      title: "Distributed tracing",
      whatMD: `A **distributed trace** stitches together the spans of one request as it crosses services, so you can see the full path and where the time goes.`,
      howMD: `A trace id is generated at the edge and propagated in headers to every downstream call; each service adds spans. The result is a waterfall showing exactly which hop is slow or failing — instead of staring at each service in isolation.`,
      interviewPoints: [
        "A trace id propagates through headers so spans link into one request.",
        "The waterfall pinpoints the slow or failing hop immediately.",
        "Sampling controls cost — keep enough traces to be representative.",
        "Without propagation, you are debugging each service blind.",
      ],
      realWorldMD: `A checkout is slow only sometimes; the trace shows the latency is entirely in a third-party call on a subset of requests, ending an argument between two teams.`,
      interviewQuestions: [
        "How does distributed tracing help you debug a slow request across services?",
      ],
    },
    {
      id: "alerting-slo",
      title: "Alerting on symptoms & SLOs",
      whatMD: `Good alerts page a human only when users are affected. An **SLO** (service level objective) defines the target — for example a latency or error budget — and alerts fire when the budget is at risk.`,
      howMD: `Alert on symptoms (error rate, latency, budget burn) rather than internal causes (CPU 80%). Cause-based alerts are noisy and fire when nothing is user-visibly wrong; symptom-based alerts fire when it matters and reduce fatigue.`,
      diagram: {
        title: "Symptom vs cause alerting",
        body: `cause  : CPU > 80%        -> noisy, often no user impact
symptom: error budget burn -> pages only when users hurt`,
      },
      interviewPoints: [
        "Alert on user-facing symptoms, not raw resource thresholds.",
        "SLOs and error budgets decide when to page vs when to relax.",
        "Every page should be actionable — tune out the rest to fight fatigue.",
        "Burn-rate alerts catch fast and slow budget exhaustion.",
      ],
      realWorldMD: `The team stops paging on CPU and starts paging on error-budget burn; on-call volume drops sharply and every remaining page is a real user-facing incident.`,
      interviewQuestions: [
        "How do you design alerts that page on real problems without waking people for noise?",
      ],
    },
  ],
  keyTakeaways: [
    "Use metrics for what, traces for where, and logs for why — correlated by request id.",
    "Propagate a trace id so a distributed trace pinpoints the slow hop.",
    "Alert on user-facing symptoms and SLO burn, not on raw CPU or memory.",
    "Every page must be actionable — tune aggressively to fight alert fatigue.",
    "Control cardinality and log volume so observability cost stays sane.",
  ],
  relatedQuestionIds: [
    "obs-latency-triage",
    "obs-three-pillars",
    "obs-alerting-slo",
    "obs-distributed-tracing",
  ],
};
