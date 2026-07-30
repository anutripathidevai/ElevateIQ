import type { SDQuestionContent } from "../types";

export const rateLimiterContent: SDQuestionContent = {
  slug: "rate-limiter",
  statementMD: `Design a distributed rate limiter that throttles requests per client, API key, user, IP address, or endpoint while adding predictable single digit millisecond latency. The limiter must work when traffic is spread across many API gateway instances, application servers, pods, and regions, so decisions cannot rely on one process holding all counters in memory.

The rate limiter usually sits on the synchronous request path at the API gateway, edge proxy, service mesh sidecar, or middleware layer. It inspects the authenticated identity and request attributes, selects the matching rule, atomically checks allowance against a shared counter store, then either forwards the request to backend services or returns **429 Too Many Requests** with useful headers.

The design should support multiple algorithms because no single algorithm fits every product need. A payments API may require strict per minute limits, a public read API may allow short bursts, and an internal service may need smoothing to protect a fragile dependency.`,
  businessUseCaseMD: `Rate limiting protects the business from abuse, accidental traffic spikes, DDoS amplification, runaway clients, and noisy neighbor effects. It also enforces product tiers such as free, pro, enterprise, or partner quotas, which directly controls infrastructure cost and revenue boundaries.

A good limiter improves fairness: one client cannot consume all backend capacity, and well behaved clients receive stable latency even during spikes. It also gives operations teams a controlled degradation lever during incidents by lowering limits on expensive endpoints before the entire system fails.`,
  functionalRequirements: [
    "Limit requests by **API key**, authenticated user, tenant, IP address, endpoint, method, or a composite key such as tenant plus endpoint.",
    "Support configurable rules per endpoint, product tier, geography, client class, and method with priority based matching.",
    "Return **429 Too Many Requests** with **Retry-After**, **X-RateLimit-Limit**, and **X-RateLimit-Remaining** headers when a hard limit is exceeded.",
    "Provide distributed correctness so concurrent requests hitting different gateways cannot all pass because of local race conditions.",
    "Allow controlled bursts while preserving an average steady rate for clients with burst friendly plans.",
    "Support soft limits for logging, warning, shadow evaluation, or graceful degradation, and hard limits for enforcement.",
    "Expose admin APIs to create, read, update, disable, and audit rate limit rules without redeploying gateways.",
    "Emit metrics, logs, and traces for allowed, denied, near limit, and fallback decisions."
  ],
  nonFunctionalRequirements: [
    {
      label: "Low latency",
      detailMD: "The limiter is in the critical request path, so the target overhead should be less than 5 to 10 ms at p99 in-region. The hot path should use one network hop and one atomic Redis script, not multiple reads and writes."
    },
    {
      label: "High availability",
      detailMD: "The limiter must not become the single reason all APIs are down. Use Redis clustering, short timeouts, circuit breakers, local emergency fallback, and explicit fail-open or fail-closed policies per endpoint."
    },
    {
      label: "Accuracy versus performance",
      detailMD: "Precise sliding logs are expensive at high QPS, while counters and buckets trade small approximation error for much lower memory and CPU. The design should let strict endpoints choose accuracy and high volume endpoints choose bounded approximation."
    },
    {
      label: "Memory efficiency",
      detailMD: "Counter keys must expire automatically, avoid unbounded cardinality, and avoid storing every request unless the endpoint truly needs exact sliding window behavior. Token bucket state can be kept in a compact hash or string per active key."
    },
    {
      label: "Scalability",
      detailMD: "Throughput should scale by sharding limiter keys across Redis cluster slots and by running stateless gateway or limiter service instances behind load balancers."
    },
    {
      label: "Operational predictability",
      detailMD: "Rules must be observable, auditable, and safely rolled out with dry run mode. Operators need dashboards for hot keys, deny rates, Redis latency, script errors, and fallback decisions."
    }
  ],
  capacityEstimation: {
    assumptionsMD: `- 1M registered API keys or clients.
- 100K clients are concurrently active during a busy minute.
- Average active client rate is 10 requests per second, so steady load is about 1M limiter checks per second.
- Peak traffic is 3x steady load, so design for about 3M limiter checks per second.
- Most rules use token bucket or sliding window counter with one compact state record per active key and endpoint.
- A small set of sensitive endpoints use sliding window log for exactness.`,
    metrics: [
      {
        label: "Registered clients",
        value: "1M",
        note: "API keys, users, tenants, or IP based identities."
      },
      {
        label: "Steady limiter QPS",
        value: "1M checks per second",
        note: "100K active clients times 10 requests per second."
      },
      {
        label: "Peak limiter QPS",
        value: "3M checks per second",
        note: "Plan for traffic spikes, retries, campaigns, and abuse attempts."
      },
      {
        label: "Counter state",
        value: "About 1M to 5M active keys",
        note: "Composite of client, endpoint, rule, and time window or bucket state."
      },
      {
        label: "Redis memory for compact counters",
        value: "About 200 MB to 1 GB",
        note: "Assuming 200 bytes per active key including value, metadata, key name, allocator overhead, and replication headroom."
      },
      {
        label: "Sliding log memory for hot precise rules",
        value: "About 5 GB to 10 GB per 1M QPS over 60 seconds",
        note: "Storing one timestamp entry per request is accurate but expensive."
      },
      {
        label: "Redis cluster size",
        value: "30 to 60 primary shards",
        note: "At 50K to 100K script evaluations per second per shard, plus replicas and headroom."
      }
    ],
    calculationsMD: `Steady limiter checks: 100K active clients x 10 requests per second = 1M checks per second. Peak target: 1M x 3 = 3M checks per second.

Compact counter memory: if a fixed window, sliding counter, or token bucket state costs roughly 200 bytes after Redis object overhead and key name overhead, then 1M active composite keys cost about 200 MB. With 5M active composite keys across endpoint specific rules, the counter store is about 1 GB before replication. With one replica, budget roughly 2 GB plus overhead.

Sliding window log memory is much larger because it stores request events. At 1M requests per second and a 60 second window, there are 60M timestamp entries. At roughly 80 to 120 bytes per sorted set entry, that is about 4.8 GB to 7.2 GB for one minute of history, before replication. This is why exact sliding logs should be reserved for lower volume or high value rules.

Throughput sizing is usually driven by Redis script evaluations. If one primary shard handles 50K to 100K atomic checks per second with healthy p99 latency, a 3M QPS peak needs 30 to 60 primary shards plus replicas, careful client pooling, and key distribution that avoids hot shards.`,
  },
  apiDesign: {
    endpoints: [
      {
        method: "POST",
        path: "/rate-limit/check",
        descriptionMD: "Internal contract used by an API gateway, sidecar, or middleware when the rate limiter is deployed as a separate service. In many implementations this is not a public HTTP API; it is an in-process middleware call that performs the same decision logic.",
        request: `{
  "request_id": "req_123",
  "api_key": "sk_live_abc",
  "user_id": "user_42",
  "ip": "203.0.113.9",
  "method": "POST",
  "path": "/v1/payments",
  "cost": 1,
  "timestamp_ms": 1769399488000
}`,
        response: `HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 0
Retry-After: 17
Content-Type: application/json

{
  "error": "rate_limit_exceeded",
  "message": "Request limit exceeded for this API key.",
  "rule_id": "rule_payments_pro_minute",
  "limit": 1000,
  "window_seconds": 60,
  "retry_after_seconds": 17
}`,
        statusCodes: [
          {
            code: 200,
            meaning: "Request is allowed and may be forwarded to the backend."
          },
          {
            code: 429,
            meaning: "Request is denied because the matching hard limit is exceeded."
          }
        ]
      },
      {
        method: "POST",
        path: "/admin/rate-limit-rules",
        descriptionMD: "Creates or updates a rate limit rule. This API is protected by strong admin authorization, validates rule overlap, and publishes the new rule to gateways through the config service.",
        request: `{
  "scope": "api_key",
  "key_pattern": "tier:pro:*",
  "endpoint_pattern": "POST /v1/payments",
  "limit": 1000,
  "window_seconds": 60,
  "algorithm": "token_bucket",
  "burst_capacity": 200,
  "mode": "hard",
  "priority": 100
}`,
        response: `{
  "rule_id": "rule_payments_pro_minute",
  "version": 12,
  "status": "active",
  "created_at": "2026-07-26T01:11:28Z"
}`,
        statusCodes: [
          {
            code: 200,
            meaning: "Rule was created or updated."
          }
        ]
      },
      {
        method: "GET",
        path: "/admin/rate-limit-rules",
        descriptionMD: "Lists active, staged, or disabled rules so operators can audit effective limits by scope, endpoint, tier, and algorithm.",
        request: `{
  "scope": "api_key",
  "endpoint_pattern": "POST /v1/payments",
  "status": "active"
}`,
        response: `{
  "rules": [
    {
      "rule_id": "rule_payments_pro_minute",
      "scope": "api_key",
      "key_pattern": "tier:pro:*",
      "limit": 1000,
      "window_seconds": 60,
      "algorithm": "token_bucket",
      "mode": "hard",
      "priority": 100
    }
  ]
}`,
        statusCodes: [
          {
            code: 200,
            meaning: "Rules were returned."
          }
        ]
      }
    ],
    notesMD: "The normal request path is gateway middleware: identify the caller, find the best matching rule, run an atomic counter check, and return either an allow decision or **429 Too Many Requests**. The gateway should include **X-RateLimit-Limit**, **X-RateLimit-Remaining**, and **Retry-After** when the decision is known. For privacy and security, avoid revealing limits for unauthenticated or suspicious clients unless doing so is part of the product contract.",
  },
  databaseDesign: {
    schemaMD: `Use a durable relational store for rule configuration and Redis for live counters. The SQL database is the source of truth for rules, audit history, ownership, staged rollout state, and priority. Redis is intentionally not modeled as a SQL table because its keys are ephemeral and expire automatically.

The main table is **rate_limit_rules**. Rules should be versioned so gateways can cache them safely and report which version made a decision. Matching usually considers scope, key pattern, endpoint pattern, method, priority, and status. Counters are stored in Redis using keys derived from rule id plus identity plus bucket or window.`,
    tables: [
      {
        name: "rate_limit_rules",
        columns: [
          {
            name: "rule_id",
            type: "uuid",
            note: "Primary key."
          },
          {
            name: "scope",
            type: "varchar",
            note: "api_key, user, tenant, ip, endpoint, or composite."
          },
          {
            name: "key_pattern",
            type: "varchar",
            note: "Pattern or selector for identities, such as tier or tenant."
          },
          {
            name: "endpoint_pattern",
            type: "varchar",
            note: "Method and path selector."
          },
          {
            name: "limit",
            type: "integer",
            note: "Maximum units allowed in the window or refill period."
          },
          {
            name: "window_seconds",
            type: "integer",
            note: "Window size or equivalent refill horizon."
          },
          {
            name: "algorithm",
            type: "varchar",
            note: "fixed_window, sliding_log, sliding_counter, token_bucket, or leaky_bucket."
          },
          {
            name: "burst_capacity",
            type: "integer",
            note: "Maximum burst size for bucket based rules."
          },
          {
            name: "mode",
            type: "varchar",
            note: "soft, hard, dry_run, or disabled."
          },
          {
            name: "priority",
            type: "integer",
            note: "Higher priority wins when multiple rules match."
          },
          {
            name: "version",
            type: "integer",
            note: "Monotonic rule version distributed to gateways."
          },
          {
            name: "created_at",
            type: "timestamp",
            note: "Creation time."
          },
          {
            name: "updated_at",
            type: "timestamp",
            note: "Last update time."
          }
        ]
      }
    ],
    indexesMD: `Create an index on **scope, status, priority** for fast rule selection. Add indexes on **endpoint_pattern** and **key_pattern** if queries frequently filter by them in the admin UI. Enforce uniqueness on a normalized tuple such as scope, key pattern, endpoint pattern, algorithm, and active version to prevent ambiguous duplicate rules.

Rule lookup should be cached in gateways or a config service because every request cannot query SQL. Gateways should subscribe to rule version changes and fall back to the last known good rule set if the config service is unavailable.`,
    relationshipsMD: "Rules may reference tenants, product tiers, or API products in other domain tables, but the limiter should denormalize the selectors it needs for fast evaluation. Audit tables can store rule changes, actor identity, reason, and previous values for compliance.",
    noSqlAlternativesMD: `Redis data structures are the core counter store:

- **Strings with INCR and EXPIRE** for fixed window counters. This is simple and fast, but has the boundary burst problem.
- **Sorted sets** for sliding window log. Store request timestamps as scores, remove old entries, count remaining entries, and add the new event if allowed. This is exact but memory heavy.
- **Hashes or compact strings** for token bucket and leaky bucket state, storing fields such as token count, last refill time, or next allowed time.
- **Lua scripts** combine read, compute, write, and expire into one atomic operation so concurrent requests across many gateways do not race.

For very large deployments, shard Redis keys by identity or tenant. Use hash tags only when multiple keys must be co-located for a single script.`,
  },
  architecture: {
    nodes: [
      {
        id: "client",
        label: "Client",
        kind: "client",
        x: 90,
        y: 110,
        sublabel: "App, SDK, bot"
      },
      {
        id: "load-balancer",
        label: "Load Balancer",
        kind: "loadBalancer",
        x: 260,
        y: 110,
        sublabel: "TLS and routing"
      },
      {
        id: "api-gateway",
        label: "API Gateway",
        kind: "gateway",
        x: 430,
        y: 110,
        sublabel: "Auth and routing"
      },
      {
        id: "limiter-middleware",
        label: "Limiter Middleware",
        kind: "service",
        x: 610,
        y: 110,
        sublabel: "Synchronous check"
      },
      {
        id: "backend-services",
        label: "Backend Services",
        kind: "service",
        x: 820,
        y: 110,
        sublabel: "Business APIs"
      },
      {
        id: "rate-limiter-service",
        label: "Rate Limiter Service",
        kind: "service",
        x: 610,
        y: 245,
        sublabel: "Shared engine"
      },
      {
        id: "redis-cluster",
        label: "Redis Cluster",
        kind: "cache",
        x: 820,
        y: 245,
        sublabel: "Atomic counters"
      },
      {
        id: "config-service",
        label: "Config Service",
        kind: "service",
        x: 430,
        y: 360,
        sublabel: "Rule distribution"
      },
      {
        id: "rules-db",
        label: "Rules Database",
        kind: "database",
        x: 610,
        y: 420,
        sublabel: "Durable rules"
      },
      {
        id: "monitoring",
        label: "Monitoring",
        kind: "monitoring",
        x: 820,
        y: 420,
        sublabel: "Metrics and alerts"
      },
      {
        id: "admin-console",
        label: "Admin Console",
        kind: "client",
        x: 260,
        y: 360,
        sublabel: "Ops and product"
      }
    ],
    edges: [
      {
        from: "client",
        to: "load-balancer",
        label: "HTTPS request"
      },
      {
        from: "load-balancer",
        to: "api-gateway",
        label: "route"
      },
      {
        from: "api-gateway",
        to: "limiter-middleware",
        label: "identify key"
      },
      {
        from: "limiter-middleware",
        to: "redis-cluster",
        label: "Lua counter check"
      },
      {
        from: "limiter-middleware",
        to: "backend-services",
        label: "allow"
      },
      {
        from: "limiter-middleware",
        to: "rate-limiter-service",
        label: "shared logic"
      },
      {
        from: "rate-limiter-service",
        to: "redis-cluster",
        label: "state"
      },
      {
        from: "rate-limiter-service",
        to: "config-service",
        label: "rules"
      },
      {
        from: "config-service",
        to: "rules-db",
        label: "read and write"
      },
      {
        from: "admin-console",
        to: "config-service",
        label: "manage rules"
      },
      {
        from: "config-service",
        to: "limiter-middleware",
        label: "push updates",
        dashed: true
      },
      {
        from: "limiter-middleware",
        to: "monitoring",
        label: "decision metrics",
        dashed: true
      },
      {
        from: "redis-cluster",
        to: "monitoring",
        label: "latency and hot keys",
        dashed: true
      }
    ],
    width: 940,
    height: 540,
    captionMD: "The gateway makes the synchronous decision, Redis provides atomic distributed state, and the config path is separated from the request path.",
  },
  architectureNotesMD: `The preferred interview design is to run lightweight limiter middleware in the API gateway so the decision happens before expensive backend work. The middleware should not query SQL on every request. Instead, it holds a cached rule snapshot from the config service and calls Redis for the one atomic piece of shared state.

The separate rate limiter service is useful when multiple gateways, sidecars, or languages need the same algorithm implementation. At very high scale, avoid routing every request through a remote limiter service if embedding the check in the gateway can save a network hop. The key architectural idea is that request processing is stateless except for Redis counters, while configuration is durable and asynchronously distributed.`,
  requestFlow: [
    {
      title: "Receive request at the edge",
      detailMD: "The client request enters through the load balancer and API gateway. TLS termination, coarse routing, and basic request validation happen before the limiter check."
    },
    {
      title: "Authenticate and identify the rate key",
      detailMD: "The gateway derives a trustworthy key from the authenticated API key, user id, tenant id, endpoint, method, and optionally client IP. It should not trust spoofable headers unless they were set by a trusted proxy."
    },
    {
      title: "Select the best matching rule",
      detailMD: "The middleware checks its local rule snapshot and picks the highest priority active rule for the key, endpoint, tier, and mode. If no rule matches, it can use a global default rule."
    },
    {
      title: "Run atomic Redis check",
      detailMD: "The middleware sends one script to Redis with the composite counter key, limit, window, burst capacity, and request cost. The script reads state, computes allowance, updates state, sets expiry, and returns remaining allowance and retry time."
    },
    {
      title: "Allow and forward",
      detailMD: "If allowed, the gateway attaches optional rate limit headers and forwards the request to backend services. The backend does not need to repeat the same global check unless it has endpoint specific internal limits."
    },
    {
      title: "Deny with 429",
      detailMD: "If denied by a hard rule, the gateway returns **429 Too Many Requests** with **Retry-After**, limit, remaining, and a stable error payload. Soft rules log or mark the request but still allow it."
    },
    {
      title: "Observe and adapt",
      detailMD: "The middleware emits decision metrics, rule id, latency, Redis errors, and fallback state. Operators use these signals to tune limits, detect abuse, and identify hot keys."
    }
  ],
  coreComponents: [
    {
      name: "Limiter middleware",
      kind: "gateway",
      role: "Executes the synchronous allow or deny decision at the gateway or sidecar.",
      detailMD: "It extracts identity, normalizes endpoints, picks the rule, calls the algorithm engine, adds headers, and short circuits denied requests before backend services spend CPU."
    },
    {
      name: "Algorithm engine",
      kind: "service",
      role: "Implements fixed window, sliding window, token bucket, and leaky bucket semantics.",
      detailMD: "It converts a rule into Redis keys and script arguments. The engine should be deterministic, versioned, unit tested, and shared across gateway deployments to avoid inconsistent enforcement."
    },
    {
      name: "Redis counter store",
      kind: "cache",
      role: "Provides low latency atomic distributed state.",
      detailMD: "Redis stores ephemeral counters, timestamps, token states, and expirations. Lua scripts or equivalent server side functions make each decision race free even when thousands of gateways check the same key concurrently."
    },
    {
      name: "Rules and config store",
      kind: "database",
      role: "Stores durable rule definitions and distributes versioned snapshots.",
      detailMD: "SQL stores rule definitions, versions, owners, and audit history. A config service validates changes and pushes snapshots to gateways so request traffic does not depend on SQL availability."
    },
    {
      name: "Admin and policy APIs",
      kind: "service",
      role: "Allow operators and product systems to manage limits safely.",
      detailMD: "These APIs handle creation, rollout, disablement, dry run mode, and audit. They need strong authorization because a bad rule can throttle paying customers or expose infrastructure to abuse."
    },
    {
      name: "Monitoring and analytics",
      kind: "monitoring",
      role: "Measures enforcement health and product behavior.",
      detailMD: "Key metrics include allowed QPS, denied QPS, near limit clients, Redis latency, script error rate, hot key distribution, fallback rate, and per rule business impact."
    }
  ],
  deepDives: [
    {
      topic: "Fixed window counter",
      detailMD: `Fixed window is the simplest algorithm. For a rule like 1000 requests per minute, compute the current window id from the timestamp, then increment a Redis key such as rule plus identity plus minute. If the incremented count is at or below the limit, allow; otherwise deny. The key expires slightly after the window ends.

Its strength is operational simplicity: one counter key, one atomic increment, one expiry, tiny memory footprint, and easy **Retry-After** calculation. It is a good default for low risk endpoints, coarse abuse protection, and rules where exact rolling behavior is not required.

The classic weakness is the boundary burst problem. A client can send 1000 requests in the last second of minute N and 1000 more in the first second of minute N plus 1, effectively sending 2000 requests in about two seconds while still respecting 1000 per calendar minute. Mitigations include smaller sub windows, sliding window counter, token bucket, or lowering the limit to account for burst risk.`,
    },
    {
      topic: "Sliding window log and sliding window counter",
      detailMD: `Sliding window log is the most accurate rolling window approach. Store each accepted request timestamp in a Redis sorted set. On each request, remove entries older than now minus window, count the remaining entries, and allow only if the count is below the limit. This exactly answers whether the client made fewer than N requests in the last W seconds.

The downside is memory and CPU. A hot key with 10K requests per second and a 60 second window stores up to 600K entries for one client and one rule. Cleanup and counting are also more expensive than a scalar increment. Use this when correctness is worth the cost, such as write APIs, fraud sensitive operations, or low volume high value endpoints.

Sliding window counter is the common compromise. Keep counts for the current fixed window and the previous fixed window, then weight the previous count by how much of it overlaps the current rolling window. For example, estimated usage equals current count plus previous count times remaining window fraction. It removes most boundary burst behavior while storing only a few counters. It is approximate because it assumes previous window traffic was evenly distributed.`,
    },
    {
      topic: "Token bucket",
      detailMD: `Token bucket is often the best interview default for public APIs because it naturally supports bursts while enforcing a long term average rate. Each key has a bucket with capacity B and refill rate R tokens per second. A request costs C tokens. On each check, refill based on elapsed time, cap tokens at B, then allow only if at least C tokens remain.

This model maps well to product tiers. A free plan might refill at 5 requests per second with burst capacity 20. An enterprise plan might refill at 500 requests per second with burst capacity 5000. The bucket lets clients batch briefly without being punished, but sustained traffic above the refill rate eventually drains the bucket.

In Redis, store current tokens and last refill time. Use Redis server time inside the Lua script or pass gateway time only if clock skew is bounded. The script should compute remaining tokens, update state, set an expiry based on the time needed to fully refill, and return retry time when denied. Token bucket is less exact than a sliding log for a strict per minute quota, but it is much more memory efficient and user friendly.`,
    },
    {
      topic: "Leaky bucket",
      detailMD: `Leaky bucket smooths traffic rather than merely capping it. Conceptually, requests enter a bucket and leak out at a constant rate. If the bucket backlog exceeds capacity, new requests are rejected. In synchronous API limiting, it is often implemented as a virtual schedule: keep the next allowed time, move it forward by one interval for each accepted request, and reject if the next allowed time drifts too far into the future.

This is useful when the backend cannot tolerate bursts, such as an expensive downstream dependency, a legacy database, or an email sending provider. It produces smoother traffic than token bucket, but it can feel harsher to clients because even legitimate bursts may be denied or queued.

The tradeoff is latency versus rejection. If the limiter queues requests, it protects the backend but increases user visible latency and needs queue management. If it rejects instead, it is simpler and bounded, but clients must retry. In interviews, describe leaky bucket as an optional algorithm for smoothing, not as the only global limiter.`,
    },
    {
      topic: "Distributed counting and atomicity",
      detailMD: `A single node in-memory counter is correct only when all traffic for a key is routed to that node, which is rarely true after horizontal scaling. If ten gateways each enforce 100 requests per minute locally, the true global allowance becomes up to 1000 requests per minute. Sticky routing can reduce this, but it complicates failover and load balancing.

Centralized Redis fixes the core coordination problem by making the counter update atomic and shared. Do not implement the check as separate get, compare, and set calls because concurrent requests will race. Use one Lua script or server side function that performs cleanup, counting, incrementing, expiry, and retry time calculation atomically.

For Redis Cluster, every script can only atomically operate on keys in one hash slot. Design keys so a single rate limit decision uses one key, or use hash tags to co-locate the small set of keys needed by the same script. Avoid cross slot multi key operations on the hot path.`,
    },
    {
      topic: "Clocks, locality, and failure policy",
      detailMD: `Time is part of every rate limiting algorithm. Fixed windows need a window boundary, sliding logs need timestamp scores, token buckets need elapsed refill time, and leaky buckets need a next allowed time. If gateway clocks differ by hundreds of milliseconds, edge cases become inconsistent. Prefer Redis server time for centralized algorithms or ensure NTP and monotonic time discipline for local fallback.

The failure policy must be explicit. Fail-open allows traffic when Redis is slow or unavailable, preserving availability but risking abuse and cost spikes. Fail-closed blocks traffic when the limiter cannot verify allowance, protecting critical backends but potentially causing a customer visible outage. A strong design supports per rule policy: fail-open for read traffic, fail-closed or low local emergency limits for payments, login attempts, and expensive write APIs.

Multi-region systems add another tradeoff. A single global Redis region gives stronger limits but adds latency and creates a blast radius. Local regional buckets give low latency and availability but can overshoot the global limit. A practical compromise is to allocate regional budgets from a global quota and reconcile usage asynchronously.`,
    }
  ],
  scaling: [
    {
      stage: "Single instance",
      detailMD: "Start with in-memory counters in one gateway or app process. This is acceptable for prototypes and single node deployments, but it fails after horizontal scaling because each process sees only part of the traffic."
    },
    {
      stage: "Multiple gateways with centralized Redis",
      detailMD: "Move counter state to Redis and keep gateway instances stateless. Use Lua scripts for atomic decisions, local rule caching for configuration, and short Redis timeouts to keep the request path predictable."
    },
    {
      stage: "High QPS Redis cluster",
      detailMD: "Shard counters by identity, tenant, or hashed composite key across Redis Cluster. Pool connections, batch only nonblocking telemetry, protect hot keys, and avoid algorithms that store every request for very high volume rules."
    },
    {
      stage: "Multi-region and global quotas",
      detailMD: "Run regional limiters near traffic for low latency. Use local buckets for fast decisions and periodically allocate or reconcile global budgets. Accept bounded overshoot or pay the latency cost for globally synchronous checks only on critical endpoints."
    }
  ],
  bottlenecks: [
    {
      issue: "Redis hot keys for large tenants or popular endpoints",
      optimizationMD: "A single tenant may generate enough traffic to saturate one Redis shard. Split the rule by endpoint, use hierarchical limits, introduce sub keys with periodic aggregation for soft limits, or provision dedicated shards for top tenants. For strict hard limits, be careful because splitting counters can cause overshoot."
    },
    {
      issue: "Network hop on every request",
      optimizationMD: "Embed limiter logic in the gateway and call Redis directly instead of routing through a separate service when latency is critical. Use in-region Redis, persistent connections, client side timeouts, and local cached rule snapshots."
    },
    {
      issue: "Sliding window log memory growth",
      optimizationMD: "Reserve exact sorted set logs for low volume or high value endpoints. For high QPS paths, use sliding window counter or token bucket. Add TTLs and per rule safeguards so a malicious client cannot create unbounded sorted set entries."
    },
    {
      issue: "Rule matching cost at the gateway",
      optimizationMD: "Precompile rule snapshots into efficient match structures by method, normalized route, scope, and priority. Avoid scanning thousands of rules for every request. Include rule version in metrics for debugging."
    },
    {
      issue: "Global limits across regions",
      optimizationMD: "Use regional budget allocation, periodic reconciliation, and conservative burst capacity. Only route to a global strongly consistent counter for endpoints where overshoot is more expensive than added latency."
    }
  ],
  failureHandling: [
    {
      scenario: "Redis unavailable or timing out",
      strategyMD: "Use a circuit breaker and a per rule fail policy. For most read APIs, fail-open with a small local in-memory emergency limiter and emit high severity alerts. For login, payments, and expensive writes, fail-closed or fail-open with a very low local cap depending on business risk."
    },
    {
      scenario: "Redis primary failover or cluster resharding",
      strategyMD: "Expect short latency spikes and script cache misses. Clients should retry safe script loading, use small timeouts, and avoid unbounded request queues. Monitoring should distinguish limiter denials from infrastructure fallback decisions."
    },
    {
      scenario: "Config service or rules database down",
      strategyMD: "Gateways continue using the last known good versioned rule snapshot. Admin changes are paused, but request enforcement continues. Reject invalid or partial snapshots and keep rollback versions available."
    },
    {
      scenario: "Gateway clock skew",
      strategyMD: "Use Redis server time in atomic scripts for centralized decisions and monotonic clocks for local fallback. Alert on hosts with time drift because skew can cause unfair token refills or inaccurate retry times."
    },
    {
      scenario: "Monitoring pipeline delayed",
      strategyMD: "Limiter decisions must not depend on analytics ingestion. Buffer telemetry asynchronously, sample high cardinality dimensions, and keep local counters for critical health metrics until the pipeline recovers."
    }
  ],
  security: [
    {
      label: "Trusted identity extraction",
      detailMD: "Do not rate limit by raw client supplied headers. The gateway should derive API key, user id, tenant id, and source IP after authentication and trusted proxy normalization."
    },
    {
      label: "Spoofing and key rotation",
      detailMD: "Attackers may rotate IPs, API keys, or accounts. Combine per API key, per account, per tenant, per IP range, and global endpoint limits for defense in depth."
    },
    {
      label: "Admin authorization",
      detailMD: "Rule management APIs require strong authentication, role based authorization, audit logs, change reasons, staged rollout, and rollback. A malicious or mistaken rule change can become a production incident."
    },
    {
      label: "Sensitive endpoint policy",
      detailMD: "Use stricter fail policies and lower burst sizes on login, password reset, payment, invite, and expensive write APIs. Rate limiting should complement fraud detection and bot protection, not replace them."
    },
    {
      label: "Information disclosure",
      detailMD: "Headers are useful for honest clients but may reveal capacity to attackers. Consider coarse headers for unauthenticated requests and detailed headers only for authenticated API customers."
    }
  ],
  tradeoffs: {
    pros: [
      "Protects backend capacity and cost during abuse, bugs, or traffic spikes.",
      "Enforces fairness and product tier limits close to the edge.",
      "Can be implemented statelessly in gateways with Redis as the shared state.",
      "Supports multiple algorithms so strictness, burstiness, and memory can be tuned per endpoint."
    ],
    cons: [
      "Adds synchronous latency and a dependency on the counter store.",
      "Strict global limits are difficult across regions without sacrificing latency or availability.",
      "High cardinality keys and exact sliding logs can consume large Redis memory.",
      "Incorrect fail-open or fail-closed policy can either expose systems to abuse or cause self inflicted outages."
    ],
    alternativesMD: "Alternatives include application level quotas checked in service code, CDN or WAF level coarse throttling, client side SDK throttling, queue based admission control, and downstream concurrency limits. These are complementary. CDN throttling is excellent for unauthenticated volumetric abuse, while API key aware limits usually require gateway authentication and a shared counter store.",
    whenNotToUseMD: "Do not use a distributed rate limiter as the only protection for CPU intensive jobs, long running workflows, or scarce backend resources. Those need admission control, queues, per worker concurrency limits, cancellation, and capacity planning. Also avoid exact global rate limits when the product only needs approximate fairness; the latency and availability cost may not be justified.",
  },
  followUpQuestions: [
    {
      question: "How would you handle one global limit across multiple regions?",
      answerMD: "Use regional local limiters for low latency and allocate each region a budget from the global quota. Reconcile usage periodically and adjust budgets. For truly strict endpoints, route checks to a global strongly consistent store, but call out the added latency and lower availability."
    },
    {
      question: "When would you choose sliding window log over token bucket?",
      answerMD: "Choose sliding window log when exact rolling window semantics are required and traffic volume is manageable. Choose token bucket for most public APIs because it is compact, fast, burst friendly, and enforces a steady average rate."
    },
    {
      question: "What race condition happens if you use GET then SET in Redis?",
      answerMD: "Two gateways can read the same current count, both believe capacity remains, and both write back an allowed update. The fix is a single atomic operation such as INCR for simple counters or Lua for read compute write algorithms."
    },
    {
      question: "How do you calculate Retry-After for different algorithms?",
      answerMD: "For fixed window, use seconds until the next window. For sliding log, use the age of the oldest counted request relative to the window. For token bucket, divide missing tokens by refill rate. For leaky bucket, use the scheduled next allowed time."
    },
    {
      question: "How do you prevent a Redis hot key from taking down a shard?",
      answerMD: "Identify hot tenants and endpoints, isolate them onto dedicated capacity, use hierarchical limits, reduce exact log algorithms, or split soft counters. For hard limits, splitting must preserve correctness or accept a known overshoot bound."
    },
    {
      question: "What is the difference between soft and hard limits?",
      answerMD: "A soft limit records, warns, samples, or degrades but still allows the request. A hard limit denies with 429. Soft mode is valuable for validating a new rule before enforcing it on customers."
    },
    {
      question: "Should the system fail-open or fail-closed?",
      answerMD: "It depends on endpoint risk. Fail-open preserves availability for normal read APIs, while fail-closed protects expensive or abuse sensitive APIs. A mature design makes this a rule level policy with local fallback and alerting."
    }
  ],
  companyVariations: [
    {
      company: "Stripe",
      angleMD: "Stripe style interviews often emphasize API key limits, predictable developer experience, idempotent retries, and clear **429** responses. Expect discussion of token buckets for bursty payment integrations, strict protection for money moving endpoints, and headers that let SDKs back off gracefully.",
    },
    {
      company: "Amazon",
      angleMD: "Amazon and AWS framing usually focuses on service quotas, throttling at API Gateway or front door services, multi-tenant fairness, and protecting downstream dependencies. Be ready to discuss regional quotas, account level limits, and how throttling interacts with retries and backpressure.",
    },
    {
      company: "Google",
      angleMD: "Google Cloud style variants often include project quotas, global versus regional enforcement, high cardinality metrics, and SRE driven reliability. The strongest answer explains approximate distributed limits, quota allocation, and observability for hot keys and abuse patterns.",
    },
    {
      company: "Microsoft",
      angleMD: "Microsoft and Azure interviews may frame the problem as API Management throttling, tenant fairness, enterprise policy configuration, and integration with identity systems. Emphasize policy versioning, admin safety, failover behavior, and customer visible diagnostics.",
    }
  ],
  relatedQuestions: [
    {
      slug: "api-gateway",
      note: "The gateway is the most common enforcement point for API key aware limits."
    },
    {
      slug: "distributed-cache",
      note: "Redis style caches provide the low latency shared state used by most distributed limiters."
    },
    {
      slug: "distributed-lock",
      note: "Useful contrast: rate limiters need atomic counters, not coarse locks on every request."
    },
    {
      slug: "notification-service",
      note: "Notification providers often use per recipient and per provider throttling."
    },
    {
      slug: "url-shortener",
      note: "A high traffic API that can use rate limiting to prevent spam and scraping."
    }
  ],
  interviewTips: {
    commonMistakes: [
      "Using only in-memory counters after introducing multiple gateways.",
      "Forgetting the fixed window boundary burst problem.",
      "Doing Redis GET then SET instead of an atomic operation.",
      "Applying exact sliding logs to every endpoint without estimating memory.",
      "Ignoring fail-open versus fail-closed behavior when Redis is down."
    ],
    redFlags: [
      "No clear identity key or trust boundary for IP headers.",
      "No explanation of how distributed race conditions are prevented.",
      "One global Redis instance for all traffic with no sharding or hot key plan.",
      "No 429 response contract or Retry-After semantics.",
      "No observability for deny rates, Redis latency, or fallback mode."
    ],
    expectations: [
      "Start with requirements and pick an enforcement point near the edge.",
      "Compare fixed window, sliding window, token bucket, and leaky bucket with concrete tradeoffs.",
      "Use Redis atomic operations or Lua for distributed correctness.",
      "Estimate QPS, memory, and Redis shard count.",
      "Discuss multi-region, hot keys, failure policy, and client experience."
    ],
    communicationMD: `State your default design early: gateway middleware, cached rules, Redis atomic scripts, and token bucket for most API traffic. Then explain why the default changes for strict quotas, smoothing, or high value write endpoints. Interviewers reward candidates who quantify memory and latency instead of saying Redis is fast.

When challenged, separate product semantics from implementation. A quota is a customer promise, an algorithm is a way to approximate or enforce it, and Redis is one possible state store. This framing makes tradeoffs clear.`,
  },
  revisionNotesMD: `- A distributed rate limiter makes allow or deny decisions across many gateways using shared atomic state.
- The best enforcement point is usually the API gateway, middleware, or sidecar before backend work begins.
- Fixed window is cheap but allows boundary bursts.
- Sliding window log is exact but memory heavy because it stores every request timestamp.
- Sliding window counter is a weighted approximation that reduces boundary burst with small memory.
- Token bucket is a strong default for APIs because it supports bursts while enforcing a steady rate.
- Leaky bucket smooths traffic and protects fragile backends, but can reject or queue legitimate bursts.
- Redis Lua scripts prevent races by combining read, compute, write, and expiry in one atomic operation.
- Always discuss hot keys, Redis failure, fail-open versus fail-closed, and multi-region overshoot.
- Return **429** with **Retry-After** and rate limit headers for a predictable client experience.`,
  flashcards: [
    {
      front: "Where should an API rate limiter usually run?",
      back: "At the API gateway, middleware, or sidecar so requests are throttled before expensive backend work."
    },
    {
      front: "What is the fixed window boundary burst problem?",
      back: "A client can use a full quota at the end of one window and another full quota at the start of the next, causing nearly double the intended rate in a short period."
    },
    {
      front: "Why is sliding window log expensive?",
      back: "It stores one timestamp entry per request in the active window, so memory grows with request rate times window length."
    },
    {
      front: "Why is token bucket good for public APIs?",
      back: "It allows short bursts up to bucket capacity while enforcing a long term refill rate."
    },
    {
      front: "What makes Redis checks race free?",
      back: "A single atomic operation, usually INCR for simple counters or Lua for algorithms that need read compute write logic."
    },
    {
      front: "What does fail-open mean?",
      back: "If the limiter store is unavailable, requests are allowed to preserve availability, often with local emergency limits and alerts."
    },
    {
      front: "How can multi-region limits overshoot?",
      back: "Each region may allow traffic locally before global usage is reconciled, so the combined usage can exceed the global quota."
    },
    {
      front: "What should a 429 response include?",
      back: "Retry-After plus rate limit headers such as X-RateLimit-Limit and X-RateLimit-Remaining when appropriate."
    }
  ],
  quiz: [
    {
      question: "Which algorithm can allow nearly twice the intended traffic around a window boundary?",
      options: [
        "Fixed window counter",
        "Sliding window log",
        "Token bucket",
        "Leaky bucket"
      ],
      answerIndex: 0,
      explanationMD: "Fixed windows reset at fixed boundaries, so a client can spend one full quota just before reset and another just after reset."
    },
    {
      question: "What is the main benefit of using Redis Lua scripts for rate limiting?",
      options: [
        "They make Redis durable across regions",
        "They combine check and update into one atomic operation",
        "They eliminate the need for key expiry",
        "They automatically prevent all hot keys"
      ],
      answerIndex: 1,
      explanationMD: "Lua prevents races by executing the read, decision, update, and expiry logic atomically on Redis."
    },
    {
      question: "Which algorithm is usually best for burst friendly API tiers?",
      options: [
        "Fixed window only",
        "Sliding window log only",
        "Token bucket",
        "Manual admin approval"
      ],
      answerIndex: 2,
      explanationMD: "Token bucket permits bursts up to bucket capacity while enforcing a steady refill rate."
    },
    {
      question: "Why should counters live in Redis rather than only in SQL?",
      options: [
        "Redis provides low latency atomic ephemeral state with expiry",
        "SQL cannot store integers",
        "SQL has no indexes",
        "Redis is always strongly consistent globally"
      ],
      answerIndex: 0,
      explanationMD: "The hot path needs very low latency atomic increments and automatic expiry, which Redis provides more naturally than a transactional SQL row per request."
    },
    {
      question: "What is a reasonable fail policy for ordinary read APIs when Redis is temporarily unavailable?",
      options: [
        "Fail-open with local fallback and alerts",
        "Block all customers forever",
        "Delete all rules",
        "Query the rules database for every request"
      ],
      answerIndex: 0,
      explanationMD: "Fail-open preserves availability for lower risk traffic, while local emergency limits and alerts reduce abuse risk."
    },
    {
      question: "What is the primary downside of exact sliding window logs at high QPS?",
      options: [
        "They cannot calculate Retry-After",
        "They require storing every request timestamp in the active window",
        "They only work on a single gateway",
        "They do not support 429 responses"
      ],
      answerIndex: 1,
      explanationMD: "The memory and cleanup cost grow with request rate times window length."
    }
  ],
  cheatSheetMD: `**Default design**
- Enforce at API gateway, middleware, or sidecar.
- Cache versioned rules locally.
- Use Redis atomic scripts for shared counters.
- Return **429**, **Retry-After**, **X-RateLimit-Limit**, and **X-RateLimit-Remaining**.

**Algorithm choices**
- Fixed window: cheapest, but boundary burst can approach 2x.
- Sliding window log: exact rolling limit, high memory.
- Sliding window counter: approximate rolling limit, low memory.
- Token bucket: best default for APIs, burst plus steady rate.
- Leaky bucket: smooths traffic for fragile downstreams.

**Scaling**
- Single instance: in-memory only for prototypes.
- Multi instance: centralized Redis and stateless gateways.
- High QPS: Redis cluster sharded by key, hot key mitigation.
- Multi-region: regional budgets with eventual reconciliation, or pay for global synchronous checks.

**Failure policy**
- Fail-open for availability oriented reads.
- Fail-closed or low local fallback for abuse sensitive writes.
- Always alert on Redis timeout, script errors, hot shards, and fallback mode.`,
  references: [
    {
      title: "Redis INCR command patterns",
      kind: "Docs",
      url: "https://redis.io/docs/latest/commands/incr/",
      author: "Redis"
    },
    {
      title: "Redis Programmability and Lua scripting",
      kind: "Docs",
      url: "https://redis.io/docs/latest/develop/programmability/eval-intro/",
      author: "Redis"
    },
    {
      title: "Token Bucket",
      kind: "Blog",
      url: "https://en.wikipedia.org/wiki/Token_bucket",
      author: "Wikipedia"
    },
    {
      title: "Leaky Bucket",
      kind: "Blog",
      url: "https://en.wikipedia.org/wiki/Leaky_bucket",
      author: "Wikipedia"
    },
    {
      title: "Envoy Global Rate Limiting",
      kind: "Docs",
      url: "https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/other_features/global_rate_limiting",
      author: "Envoy"
    }
  ],
};
