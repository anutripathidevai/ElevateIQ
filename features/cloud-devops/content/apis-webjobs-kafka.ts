import type { CDModuleContent } from "../types";

/**
 * Module 5 — APIs, WebJobs & Kafka.
 * Senior-level focus: designing resilient service-to-service communication and
 * getting event streaming right (delivery, ordering, consumer lag).
 */
export const apisWebjobsKafkaContent: CDModuleContent = {
  slug: "apis-webjobs-kafka",
  introMD: `Real systems are many services talking to each other — synchronously over APIs and asynchronously over queues and event streams. Senior interviews probe whether you can make that communication **resilient**: idempotent, rate-limited, versioned, and correct under retries and failures.

This module covers API design for resilience, background processing with WebJobs, and the parts of Kafka that trip people up in interviews — delivery semantics, ordering, and consumer lag.`,
  coreFlow: {
    title: "Sync API + async event flow",
    body: `client -> API (validate, idempotency key, rate limit)
             |
             +-- write DB
             +-- publish event -> Kafka topic (partitioned)
                                     |
                                     v
                          consumer group -> WebJob / worker
                          (at-least-once, commit after work)`,
  },
  seniorFocus: [
    "Make write APIs idempotent so retries cannot double-charge or duplicate.",
    "Protect services with rate limiting and backpressure, not unbounded queues.",
    "Version APIs so clients never break on a change.",
    "Understand Kafka delivery, ordering, and rebalancing well enough to reason about correctness.",
    "Track consumer lag as the health signal for async processing.",
  ],
  concepts: [
    {
      id: "resilient-apis",
      title: "Idempotency, rate limiting & versioning",
      whatMD: `A resilient API survives retries and abuse. **Idempotency** means the same request applied twice has the same effect once. **Rate limiting** protects the service from overload. **Versioning** lets the API evolve without breaking existing clients.`,
      howMD: `An idempotency key lets the server detect and dedupe a retried write. A rate limiter (token bucket) sheds load with a clear 429 and Retry-After. Additive, backward-compatible versioning keeps old clients working while new fields ship.`,
      diagram: {
        title: "Idempotent write",
        body: `request (key=abc) -> seen key abc? 
   no  -> do work, store result under abc -> return
   yes -> return stored result (no duplicate work)`,
      },
      interviewPoints: [
        "Idempotency key dedupes retried writes — essential for payments.",
        "Token-bucket rate limiting sheds load with 429 + Retry-After.",
        "Version additively and keep changes backward compatible.",
        "Return clear error contracts so clients can retry safely.",
      ],
      realWorldMD: `A payment request times out and the client retries with the same idempotency key; the server returns the original result and the customer is charged exactly once.`,
      interviewQuestions: [
        "How do you make a payment POST safe to retry?",
        "How do you evolve an API without breaking existing clients?",
      ],
    },
    {
      id: "background-processing",
      title: "Background processing with WebJobs",
      whatMD: `Not all work belongs in the request path. **WebJobs** (and similar workers) run background jobs — sending email, processing uploads, reacting to events — so the API responds fast and heavy work happens asynchronously.`,
      howMD: `The API enqueues a message and returns immediately; a worker consumes it and does the slow work. The queue absorbs spikes, work is retried on failure, and the user-facing latency stays low. Jobs must be idempotent because messages can be delivered more than once.`,
      interviewPoints: [
        "Move slow work off the request path — enqueue and return fast.",
        "The queue absorbs spikes and provides retry on failure.",
        "Workers must be idempotent — messages can be redelivered.",
        "Use a dead-letter queue for messages that keep failing.",
      ],
      realWorldMD: `Uploading a video returns instantly; a WebJob transcodes it in the background and the queue smooths out a burst of uploads without overloading the workers.`,
      interviewQuestions: [
        "Where do you draw the line between synchronous and background work?",
      ],
    },
    {
      id: "kafka-delivery-ordering",
      title: "Kafka: delivery semantics & ordering",
      whatMD: `Kafka is a partitioned, durable log. **Delivery** is usually at-least-once (consumers can see a message twice). **Ordering** is guaranteed only within a partition, and the partition is chosen by the message key.`,
      howMD: `Because delivery is at-least-once, consumers must be idempotent or use exactly-once semantics for correctness. To keep related events ordered, give them the same key so they land in the same partition. Commit offsets only after the work succeeds so a crash reprocesses rather than loses.`,
      diagram: {
        title: "Key -> partition -> order",
        body: `key=user-1 --> partition 0 : e1, e2, e3   (ordered)
key=user-2 --> partition 1 : e1, e2       (ordered)
no cross-partition ordering guarantee`,
      },
      interviewPoints: [
        "At-least-once is the default — consumers must be idempotent.",
        "Ordering holds only within a partition; key by entity to preserve it.",
        "Commit offsets after work succeeds so crashes reprocess, not drop.",
        "Exactly-once is possible but has real throughput cost — justify it.",
      ],
      realWorldMD: `All events for one account share the account id as the key, so they stay ordered in one partition even though the topic is spread across many.`,
      interviewQuestions: [
        "How does Kafka guarantee ordering, and what are the limits?",
        "How do you achieve exactly-once processing, and is it worth it?",
      ],
    },
    {
      id: "consumer-lag",
      title: "Consumer lag & rebalancing",
      whatMD: `**Consumer lag** is how far behind the latest message a consumer group is. Rising lag means consumers cannot keep up. **Rebalancing** reassigns partitions when consumers join or leave the group.`,
      howMD: `Lag is the primary health signal for streaming: alert on it and scale consumers (up to the partition count) to catch up. Frequent rebalances stall processing, so keep sessions healthy and avoid long pauses that make a consumer look dead.`,
      interviewPoints: [
        "Lag is the health metric for async processing — alert and scale on it.",
        "Max useful parallelism equals the partition count.",
        "Rebalances pause consumption — minimise churn and long pauses.",
        "Slow consumers, not the broker, are usually the bottleneck.",
      ],
      realWorldMD: `A traffic spike pushes consumer lag up; autoscaling adds consumers up to the partition count and the group drains the backlog within minutes.`,
      interviewQuestions: [
        "Consumer lag is growing in production — how do you diagnose and fix it?",
      ],
    },
  ],
  keyTakeaways: [
    "Make write APIs idempotent so retries never double-apply.",
    "Rate-limit and version APIs so services stay protected and clients never break.",
    "Push slow work to background workers behind a queue that absorbs spikes.",
    "Kafka is at-least-once with per-partition ordering — key by entity and commit after work.",
    "Watch consumer lag as the health signal and scale consumers up to the partition count.",
  ],
  relatedQuestionIds: [
    "api-idempotency",
    "api-rate-limiting",
    "api-versioning",
    "webjobs-background-processing",
    "kafka-consumer-lag",
    "kafka-ordering-partitioning",
    "kafka-exactly-once",
  ],
};
