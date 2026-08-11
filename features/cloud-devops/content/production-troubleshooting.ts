import type { CDModuleContent } from "../types";

/**
 * Module 7 — Production Troubleshooting.
 * Senior-level focus: a repeatable framework for diagnosing and resolving live
 * incidents, plus the classic failure scenarios and how to handle them.
 */
export const productionTroubleshootingContent: CDModuleContent = {
  slug: "production-troubleshooting",
  introMD: `When production breaks, seniority shows in **method**, not heroics. Interviews test whether you have a repeatable framework — stabilise first, then diagnose from user-facing symptoms down to root cause — and whether you recognise the classic failure modes.

This module gives you that framework and then walks the incidents that come up again and again: memory leaks, cascading failures, connection-pool exhaustion, thundering herds, and intermittent timeouts.`,
  coreFlow: {
    title: "Incident response framework",
    body: `1. Stabilise  : stop the bleeding (rollback, scale, shed load)
2. Assess     : blast radius, user impact, when did it start
3. Diagnose   : symptom -> metric -> trace -> log -> root cause
4. Resolve    : fix or mitigate, verify recovery
5. Prevent    : blameless post-mortem, add guardrail + alert`,
  },
  seniorFocus: [
    "Stabilise before diagnosing — mitigate user impact first.",
    "Diagnose top-down from user-facing symptoms, not from a hunch.",
    "Correlate change: most incidents start with a deploy or a traffic shift.",
    "Recognise classic failure modes fast instead of debugging from scratch.",
    "Close the loop with a blameless post-mortem and a concrete guardrail.",
  ],
  concepts: [
    {
      id: "response-framework",
      title: "A repeatable incident framework",
      whatMD: `A framework keeps you calm and fast under pressure: **stabilise, assess, diagnose, resolve, prevent**. Stopping the bleeding (rollback, scale, shed load) comes before finding the perfect root cause.`,
      howMD: `Anchor on "what changed" — most incidents follow a deploy, config change, or traffic shift. Work from the user-facing symptom down through metrics, traces, and logs. Once mitigated, a blameless post-mortem turns the incident into a guardrail so it cannot recur silently.`,
      interviewPoints: [
        "Mitigate first (rollback/scale/shed) — root cause can wait.",
        "Ask what changed: deploy, config, or traffic almost always.",
        "Diagnose top-down: symptom -> metric -> trace -> log.",
        "Blameless post-mortem plus a new alert closes the loop.",
      ],
      realWorldMD: `Errors spike right after a deploy; the on-call rolls back first (users recover in minutes), then investigates the bad change calmly — mitigation before diagnosis.`,
      interviewQuestions: [
        "Walk me through how you handle a Sev1 in production.",
      ],
    },
    {
      id: "classic-failure-modes",
      title: "Classic failure modes",
      whatMD: `A handful of failures recur across systems: **memory leaks**, **cascading failures**, **connection-pool exhaustion**, **thundering herds**, and **intermittent timeouts**. Recognising the pattern lets you skip straight to the likely cause.`,
      howMD: `Each has a signature: a slow steady memory climb ending in OOM; a slow dependency that ties up threads and takes down healthy services; requests queueing on an exhausted pool; a synchronised retry storm after recovery; or tail-latency timeouts from one bad node or GC pause. Timeouts, retries with jitter, circuit breakers, and bulkheads are the standard defences.`,
      diagram: {
        title: "Cascading failure",
        body: `slow dependency
   -> callers block threads waiting
      -> caller thread pools fill
         -> healthy services now fail too (cascade)
defence: timeout + circuit breaker + bulkhead`,
      },
      interviewPoints: [
        "Timeouts on every remote call — never wait forever.",
        "Circuit breakers stop a slow dependency from cascading.",
        "Retries need jitter and a cap to avoid a thundering herd.",
        "Bulkheads isolate pools so one dependency cannot sink everything.",
        "A steady memory climb to OOM points at a leak, not a spike.",
      ],
      realWorldMD: `A slow downstream ties up every request thread; a circuit breaker trips and sheds those calls, keeping the rest of the service healthy while the dependency recovers.`,
      interviewQuestions: [
        "How do you stop one slow dependency from taking down the whole system?",
      ],
    },
  ],
  scenarios: [
    {
      id: "memory-leak",
      title: "Memory climbing to OOM",
      symptomsMD: `Memory rises steadily over hours or days and pods restart with **OOMKilled**; latency degrades before each restart as GC thrashes.`,
      whatToCheck: [
        "Memory trend: steady climb (leak) vs spiky (load).",
        "Correlate the climb start with a recent deploy.",
        "Heap dump / profiler for the growing object set.",
        "Unbounded caches, growing collections, or unclosed resources.",
      ],
      possibleCauses: [
        "An in-memory cache with no eviction or size bound.",
        "Listeners/connections/streams never closed.",
        "Accumulating references in a static or long-lived collection.",
      ],
      resolutionMD: `Stabilise by raising the limit or scheduling restarts to buy time, then fix the leak — bound the cache, close the resource, or drop the retained reference. Confirm memory plateaus after the fix.`,
      preventionMD: `Bound every cache, close resources in finally/using blocks, and alert on the memory-growth trend so the leak is caught long before OOM.`,
    },
    {
      id: "connection-pool-exhaustion",
      title: "Database connection-pool exhaustion",
      symptomsMD: `Requests hang or fail with **timeout acquiring connection**; the database has spare capacity but the app cannot get a connection.`,
      whatToCheck: [
        "Pool size vs active/idle connections in flight.",
        "Slow queries holding connections open too long.",
        "Connections leaked by paths that never return them to the pool.",
        "A traffic spike exceeding pool capacity.",
      ],
      possibleCauses: [
        "A slow query holding connections while requests queue.",
        "A code path that borrows a connection and never releases it.",
        "Pool sized too small for peak concurrency.",
      ],
      resolutionMD: `Stabilise by shedding load or restarting to reclaim leaked connections, then find the culprit query or leak. Fix the slow query or the missing release; size the pool to real peak concurrency.`,
      preventionMD: `Always release connections in a finally/using block, set query timeouts, and alert on pool-utilisation and wait-time before exhaustion.`,
    },
    {
      id: "thundering-herd",
      title: "Thundering herd after recovery",
      symptomsMD: `A dependency recovers, then immediately falls over again as every client retries at once and a cache-miss stampede hits the origin.`,
      whatToCheck: [
        "Synchronised retry timing across clients.",
        "Cache expiry that dumps many keys at the same instant.",
        "Whether retries use jitter and a cap.",
        "Whether a single-flight / lock guards cache rebuilds.",
      ],
      possibleCauses: [
        "Fixed-interval retries with no jitter synchronising clients.",
        "Many hot cache keys expiring simultaneously.",
        "No request coalescing on cache miss.",
      ],
      resolutionMD: `Stabilise by shedding load and ramping traffic gradually, then add jittered exponential backoff and coalesce concurrent rebuilds so only one request hits the origin per key.`,
      preventionMD: `Use exponential backoff with jitter, stagger cache TTLs, and single-flight cache rebuilds so recovery does not trigger a synchronised stampede.`,
    },
    {
      id: "intermittent-timeout",
      title: "Intermittent request timeouts",
      symptomsMD: `A small fraction of requests time out with no clear pattern; p50 looks fine but **p99 latency** is bad.`,
      whatToCheck: [
        "Tail latency (p99) vs median, not just averages.",
        "Whether failures cluster on one node/pod/AZ.",
        "GC pauses or CPU throttling on specific instances.",
        "A slow downstream hop via distributed tracing.",
      ],
      possibleCauses: [
        "One unhealthy node or noisy neighbour skewing the tail.",
        "GC pauses or CPU throttling under load.",
        "An occasionally slow downstream dependency.",
      ],
      resolutionMD: `Use tracing to localise the slow hop or node; drain or replace the bad instance. Add timeouts and hedged/retryable requests so a single slow hop does not fail the user request.`,
      preventionMD: `Track and alert on p99 (not just averages), set per-hop timeouts, and use health-based load balancing so traffic avoids sick instances.`,
    },
  ],
  keyTakeaways: [
    "Stabilise first, diagnose second — mitigate user impact before root cause.",
    "Ask what changed: deploy, config, or traffic explains most incidents.",
    "Diagnose top-down from symptom through metric, trace, and log.",
    "Defend with timeouts, jittered retries, circuit breakers, and bulkheads.",
    "Close every incident with a blameless post-mortem and a concrete guardrail.",
  ],
  relatedQuestionIds: [
    "prod-memory-leak",
    "prod-cascading-failure",
    "prod-db-connection-exhaustion",
    "prod-thundering-herd",
    "prod-intermittent-timeout",
    "k8s-503-debug",
  ],
};
