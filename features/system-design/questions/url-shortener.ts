import type { SDQuestionContent } from "../types";

export const urlShortenerContent: SDQuestionContent = {
  slug: "url-shortener",
  statementMD: `
Design a URL Shortener like TinyURL or bit.ly. The service accepts a long URL and returns a compact, unique short code. When a user visits the short link, the service must redirect them to the original long URL with very low latency.

At interview scale, assume billions of stored URLs, a globally distributed user base, and a strongly read-heavy workload. The core challenge is not the CRUD API itself; it is generating collision-free keys, serving redirects fast enough that users do not notice the hop, keeping redirects available during failures, and supporting analytics without slowing the redirect path.

The default design should optimize for low-latency reads, durable URL mappings, and operational simplicity. Optional features such as custom aliases, expiration, user accounts, and click analytics should be layered on without weakening the redirect critical path.
`,
  businessUseCaseMD: `
Short links are useful whenever the original URL is too long, ugly, or hard to share. They make links fit into SMS, push notifications, social posts, ads, printed material, and QR codes.

Businesses also use shorteners as an attribution layer. A single campaign can generate different short links per channel, region, or experiment and then measure clicks, referrers, devices, and conversion funnels. For consumer products, short links improve sharing and make deep links easier to distribute across apps.
`,
  functionalRequirements: [
    "Shorten a valid long URL and return a unique short URL.",
    "Redirect a request for a short code to the original long URL.",
    "Support optional custom aliases when the requested alias is available.",
    "Support optional expiration or TTL so links can stop resolving after a deadline.",
    "Support optional authenticated user accounts to list, delete, and manage links.",
    "Collect optional click analytics such as timestamp, referrer, geography, user agent, and device class.",
    "Allow deletion or disabling of a short link by its owner or by abuse operations.",
  ],
  nonFunctionalRequirements: [
    {
      label: "Latency",
      detailMD: `
Redirects are in the user-facing navigation path, so the target is under 50ms p99 inside a region excluding client network time. Shortening can be slower because it is a write path, but should still complete in under 200ms p99.
`,
    },
    {
      label: "Availability",
      detailMD: `
Redirects must remain available even when analytics, user dashboards, or key generation have degraded. A practical target is 99.99 percent or higher for redirects because a broken short link is visible to every downstream user.
`,
    },
    {
      label: "Read-heavy scalability",
      detailMD: `
Assume a read to write ratio around 100:1. The architecture should scale the read path independently through CDN caching where safe, Redis or Memcached, read replicas, and a horizontally partitioned key-value store.
`,
    },
    {
      label: "Durability",
      detailMD: `
Once a short URL is issued, losing the mapping breaks external links. Store mappings in a durable replicated database, use backups, and avoid acknowledging creates before the mapping is persisted.
`,
    },
    {
      label: "Uniqueness",
      detailMD: `
Every short code must map to at most one active long URL. Generated codes need collision avoidance or collision detection, and custom aliases need atomic conditional insert semantics.
`,
    },
    {
      label: "Consistency",
      detailMD: `
Create and delete operations need read-after-write behavior for the owner and for immediate redirects. Global propagation can be eventually consistent if regional routing and cache invalidation are handled carefully.
`,
    },
    {
      label: "Cost efficiency",
      detailMD: `
The system stores small records but serves many reads. Keep hot mappings in memory, keep analytics asynchronous, and avoid expensive cross-region synchronous writes on every redirect.
`,
    },
  ],
  capacityEstimation: {
    assumptionsMD: `
Assume 100M new short URLs per month, a 100:1 redirect to create ratio, 30 days per month, a five-year retention window, an average URL mapping record of 500 bytes, and a peak traffic multiplier of 10x over average.

The 500-byte record includes the short code, long URL pointer or normalized long URL, timestamps, owner metadata, TTL, status flags, and small counters. Large analytics events are stored separately.
`,
    metrics: [
      {
        label: "New URLs",
        value: "100M per month",
        note: "3.33M per day",
      },
      {
        label: "Average write QPS",
        value: "39 writes per second",
        note: "100M divided by 30 days divided by 86,400 seconds",
      },
      {
        label: "Peak write QPS",
        value: "390 writes per second",
        note: "10x average peak",
      },
      {
        label: "Average redirect QPS",
        value: "3,900 reads per second",
        note: "100 reads per write",
      },
      {
        label: "Peak redirect QPS",
        value: "39,000 reads per second",
        note: "10x average peak",
      },
      {
        label: "Five-year URL records",
        value: "6B mappings",
        note: "100M per month for 60 months",
      },
      {
        label: "Primary storage",
        value: "3 TB raw",
        note: "6B records times 500 bytes before replication and indexes",
      },
      {
        label: "Replicated storage",
        value: "10 to 12 TB",
        note: "3x replication plus indexes, metadata, and compaction overhead",
      },
      {
        label: "Average redirect bandwidth",
        value: "2 MB per second outbound",
        note: "3,900 redirects per second times roughly 500 bytes of HTTP response headers",
      },
      {
        label: "Hot cache memory",
        value: "20 to 30 GB",
        note: "80 percent of monthly reads served by the hottest 20M records with Redis overhead",
      },
    ],
    calculationsMD: `
- Writes: 100M URLs per month divided by 30 days is 3.33M writes per day. 3.33M divided by 86,400 seconds is about 38.6 writes per second, rounded to 39.
- Reads: with a 100:1 read to write ratio, average redirect traffic is 3,860 reads per second, rounded to 3,900.
- Peak: using a 10x traffic multiplier gives about 390 write QPS and 39,000 redirect QPS.
- Records: 100M per month for 60 months is 6B URL mappings.
- Storage: 6B records times 500 bytes is 3,000,000,000,000 bytes, about 3 TB raw. With 3 replicas, indexes, tombstones, and compaction headroom, plan for 10 to 12 TB.
- Bandwidth: redirect responses are mostly headers. 3,900 redirects per second times about 500 bytes is about 1.95 MB per second average. Peak is about 19.5 MB per second before TLS and network overhead.
- Cache: the 80/20 rule says 20 percent of URLs may drive 80 percent of reads. If the active monthly set is 100M URLs, caching 20M hot mappings at 500 bytes is 10 GB raw. Redis object overhead and fragmentation often double or triple that, so reserve 20 to 30 GB per fully replicated hot cache tier.
- Keyspace: 6 base62 characters provide 62 to the power of 6, or about 56.8B codes. That covers 6B mappings but leaves less room for reserved, expired, and custom aliases. 7 base62 characters provide about 3.5T codes and are safer.
`,
  },
  apiDesign: {
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/shorten",
        descriptionMD: `
Creates a new short URL. The caller may be anonymous or authenticated. The alias and expiration fields are optional; if alias is omitted the service allocates a generated base62 code.
`,
        request: `
{
  "longUrl": "https://www.example.com/products/very-long-campaign-url",
  "customAlias": "summer-sale",
  "expiresAt": "2027-01-01T00:00:00Z",
  "userId": "user_123"
}
`,
        response: `
{
  "shortCode": "summer-sale",
  "shortUrl": "https://sho.rt/summer-sale",
  "longUrl": "https://www.example.com/products/very-long-campaign-url",
  "createdAt": "2026-07-26T01:11:28Z",
  "expiresAt": "2027-01-01T00:00:00Z"
}
`,
        statusCodes: [
          { code: 201, meaning: "Created" },
          { code: 400, meaning: "Invalid URL, alias, or expiration" },
          { code: 401, meaning: "Authentication required for account-only features" },
          { code: 409, meaning: "Custom alias already exists" },
          { code: 429, meaning: "Rate limit exceeded" },
        ],
      },
      {
        method: "GET",
        path: "/{shortCode}",
        descriptionMD: `
Resolves a short code and returns an HTTP redirect. The default is 302 Found because it preserves the ability to count future clicks and change policy decisions.
`,
        response: `
HTTP/1.1 302 Found
Location: https://www.example.com/products/very-long-campaign-url
Cache-Control: no-store
`,
        statusCodes: [
          { code: 302, meaning: "Redirect to the long URL" },
          { code: 301, meaning: "Optional permanent redirect for immutable links without analytics needs" },
          { code: 404, meaning: "Unknown short code" },
          { code: 410, meaning: "Expired or deleted short code" },
          { code: 429, meaning: "Abusive client throttled" },
        ],
      },
      {
        method: "DELETE",
        path: "/api/v1/short-urls/{shortCode}",
        descriptionMD: `
Disables a short URL owned by the authenticated user. The record is usually soft-deleted so old analytics and abuse evidence are retained.
`,
        response: `
{
  "shortCode": "summer-sale",
  "status": "disabled"
}
`,
        statusCodes: [
          { code: 200, meaning: "Disabled" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Caller does not own the link" },
          { code: 404, meaning: "Short code not found" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/short-urls/{shortCode}/analytics",
        descriptionMD: `
Returns aggregate click analytics for an owned short URL. This endpoint reads from the analytics store, not from the redirect serving store.
`,
        response: `
{
  "shortCode": "summer-sale",
  "totalClicks": 912345,
  "uniqueVisitorsEstimate": 534210,
  "topReferrers": ["search", "social", "email"],
  "dailyClicks": [
    { "date": "2026-07-25", "clicks": 31240 }
  ]
}
`,
        statusCodes: [
          { code: 200, meaning: "Analytics returned" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Caller does not own the link" },
          { code: 404, meaning: "Short code not found" },
        ],
      },
    ],
    notesMD: `
Keep the redirect endpoint simple and cache-friendly. Authentication, ownership checks, and analytics queries belong on management APIs, not on the anonymous redirect path. For analytics correctness, the redirect service should emit an asynchronous event after it has resolved the mapping.
`,
  },
  databaseDesign: {
    schemaMD: `
The serving store is keyed by **short_code** because redirects arrive with only that value. The URL mapping record should be small and self-contained so one point lookup can produce a redirect decision.

For a relational starter design, use a **urls** table and a **users** table. At large scale, the same logical schema maps naturally to a distributed key-value store.
`,
    tables: [
      {
        name: "urls",
        columns: [
          { name: "short_code", type: "varchar(12)", note: "Primary key; generated base62 code or validated custom alias" },
          { name: "long_url", type: "text", note: "Original normalized URL or pointer to compressed overflow storage" },
          { name: "created_at", type: "timestamp", note: "Creation time used for retention and auditing" },
          { name: "expires_at", type: "timestamp nullable", note: "Null means no explicit expiration" },
          { name: "user_id", type: "uuid nullable", note: "Owner for authenticated links" },
          { name: "click_count", type: "bigint", note: "Approximate or asynchronously updated aggregate counter" },
          { name: "status", type: "varchar(20)", note: "Active, disabled, expired, or flagged" },
          { name: "created_region", type: "varchar(32)", note: "Region that accepted the write" },
        ],
      },
      {
        name: "users",
        columns: [
          { name: "user_id", type: "uuid", note: "Primary key" },
          { name: "email", type: "varchar(320)", note: "Unique login identity" },
          { name: "created_at", type: "timestamp", note: "Account creation time" },
          { name: "plan", type: "varchar(32)", note: "Free, paid, enterprise, or internal" },
          { name: "status", type: "varchar(20)", note: "Active, suspended, or deleted" },
        ],
      },
      {
        name: "click_events_daily",
        columns: [
          { name: "short_code", type: "varchar(12)", note: "Partition key for analytics aggregation" },
          { name: "event_date", type: "date", note: "Daily bucket" },
          { name: "clicks", type: "bigint", note: "Aggregated click count" },
          { name: "unique_visitors_estimate", type: "bigint", note: "Approximate cardinality from sketches" },
          { name: "top_referrers", type: "json", note: "Small aggregate, not raw events" },
        ],
      },
    ],
    indexesMD: `
- **urls.short_code** is the primary key and must support single-row point lookup.
- **urls.user_id, created_at** supports user dashboards and link history.
- **urls.expires_at** supports background expiration sweeps or database TTL policies.
- **users.email** is unique for login.
- Avoid a secondary index on **long_url** for the redirect path. Deduplication by long URL is optional and often not worth the write amplification.
`,
    relationshipsMD: `
Each URL may belong to one user, but anonymous links have no user. Analytics aggregates reference **short_code** and can be rebuilt from raw events if necessary. The redirect service should not join across tables during a redirect.
`,
    noSqlAlternativesMD: `
A distributed key-value database such as DynamoDB, Cassandra, Bigtable, or FoundationDB fits the serving path well. Use **short_code** as the partition key, store the full redirect record as the value, and make reads single-partition lookups.

The design needs conditional writes for custom aliases and generated key claims. DynamoDB conditional put, Cassandra lightweight transaction for rare alias creation, or a separate key allocation service can enforce uniqueness. Analytics belongs in a write-optimized event pipeline and OLAP store, not in the primary redirect KV table.
`,
  },
  architecture: {
    width: 940,
    height: 540,
    nodes: [
      { id: "client", label: "Client", kind: "client", x: 90, y: 200, sublabel: "Browser, app, bot" },
      { id: "cdn", label: "CDN and Edge", kind: "cdn", x: 250, y: 120, sublabel: "TLS, edge cache" },
      { id: "load-balancer", label: "Load Balancer", kind: "loadBalancer", x: 250, y: 280, sublabel: "Regional routing" },
      { id: "api-service", label: "API and Redirect Service", kind: "service", x: 450, y: 200, sublabel: "Shorten, resolve" },
      { id: "cache", label: "Hot Mapping Cache", kind: "cache", x: 650, y: 110, sublabel: "Redis" },
      { id: "url-store", label: "URL KV Store", kind: "database", x: 650, y: 260, sublabel: "DynamoDB, Cassandra" },
      { id: "keygen-service", label: "Key Generation Service", kind: "worker", x: 450, y: 400, sublabel: "Preallocates codes" },
      { id: "key-pool", label: "Unused Key Pool", kind: "database", x: 650, y: 420, sublabel: "Available codes" },
      { id: "analytics-queue", label: "Analytics Queue", kind: "queue", x: 820, y: 210, sublabel: "Kafka, Kinesis" },
      { id: "analytics-store", label: "Analytics Store", kind: "analytics", x: 820, y: 350, sublabel: "OLAP aggregates" },
      { id: "abuse-scanner", label: "Abuse Scanner", kind: "external", x: 450, y: 80, sublabel: "Malware, phishing" },
    ],
    edges: [
      { from: "client", to: "cdn", label: "short link" },
      { from: "client", to: "load-balancer", label: "API calls" },
      { from: "cdn", to: "load-balancer", label: "cache miss" },
      { from: "load-balancer", to: "api-service", label: "route request" },
      { from: "api-service", to: "cache", label: "lookup or warm" },
      { from: "cache", to: "api-service", label: "mapping hit" },
      { from: "api-service", to: "url-store", label: "read or write mapping" },
      { from: "api-service", to: "keygen-service", label: "request code" },
      { from: "keygen-service", to: "key-pool", label: "claim unused key" },
      { from: "keygen-service", to: "url-store", label: "reserve used key" },
      { from: "api-service", to: "analytics-queue", label: "click event", dashed: true },
      { from: "analytics-queue", to: "analytics-store", label: "aggregate", dashed: true },
      { from: "api-service", to: "abuse-scanner", label: "scan on create", dashed: true },
    ],
    captionMD: `
The redirect critical path is client to edge to load balancer to redirect service to cache or KV store, then back as an HTTP redirect. Key generation and analytics are intentionally off the hot path.
`,
  },
  architectureNotesMD: `
The URL Shortener has two different workloads. The create path is write-oriented, validates URLs, checks abuse signals, allocates a short code, and persists the mapping. The redirect path is read-oriented and must be as close to a single cache or key-value lookup as possible.

CDN and edge infrastructure terminate TLS and can cache safe negative responses or immutable redirects for links that do not require analytics. A regional load balancer routes to stateless API and redirect service instances. Redis stores hot mappings, while the durable KV store remains the source of truth. A key generation worker keeps a pool of unused base62 codes ready so create requests do not need to coordinate on a global counter. Analytics events are emitted asynchronously to a queue and aggregated separately.
`,
  requestFlow: [
    {
      title: "Shorten request arrives",
      detailMD: `
The client calls **POST /api/v1/shorten** with a long URL, optional custom alias, optional expiration, and optional user identity. The API service authenticates if needed, normalizes the URL, validates scheme and length, and applies per-user and per-IP rate limits.
`,
    },
    {
      title: "Abuse and policy checks run",
      detailMD: `
The service checks deny lists, malware reputation, suspicious domains, and policy rules. High-risk URLs can be rejected synchronously; uncertain cases can be accepted in a pending or limited state until asynchronous scanning completes.
`,
    },
    {
      title: "Short code is allocated",
      detailMD: `
For generated links, the API service obtains a pre-generated code from the Key Generation Service. For custom aliases, it attempts an atomic conditional insert with the requested alias. If the alias already exists, the request returns 409 Conflict.
`,
    },
    {
      title: "Mapping is persisted and cached",
      detailMD: `
The service writes the mapping to the durable URL store before acknowledging success. It then warms Redis with the new mapping and TTL. The response returns the short URL and metadata.
`,
    },
    {
      title: "Redirect request checks cache",
      detailMD: `
A browser requests **GET /{shortCode}**. After edge and load balancer routing, the redirect service looks up the code in Redis. On a cache hit, it can produce the redirect without querying the database.
`,
    },
    {
      title: "Cache miss loads from store",
      detailMD: `
If Redis misses, the service performs a single key lookup in the URL store using **short_code**. Active, unexpired mappings are placed back into cache. Missing links can be negative-cached briefly to protect the database from repeated invalid-code traffic.
`,
    },
    {
      title: "Redirect response is returned",
      detailMD: `
The service returns 302 Found with the long URL in the Location header. Expired or disabled links return 410 Gone. Unknown links return 404 Not Found. The redirect decision should not wait for analytics writes.
`,
    },
    {
      title: "Analytics event is emitted asynchronously",
      detailMD: `
After resolving the mapping, the redirect service publishes a click event containing short code, timestamp, coarse IP-derived geography, referrer, and user agent. Consumers aggregate counts and sketches in the analytics store.
`,
    },
  ],
  coreComponents: [
    {
      name: "Redirect Service",
      kind: "service",
      role: "Serves the hot path for short-code resolution.",
      detailMD: `
This stateless service validates the short code, reads Redis, falls back to the URL store, enforces expiration and disabled status, returns the HTTP redirect, and emits click events asynchronously. Its dependencies should have short timeouts and graceful degradation.
`,
    },
    {
      name: "Key Generation Service",
      kind: "worker",
      role: "Produces unique short codes without per-request global coordination.",
      detailMD: `
The service pre-generates base62 codes, keeps an unused key pool, atomically claims keys for create requests, and records used keys. It can allocate ranges to workers so create throughput scales horizontally while preserving uniqueness.
`,
    },
    {
      name: "Hot Mapping Cache",
      kind: "cache",
      role: "Absorbs the majority of redirect lookups.",
      detailMD: `
Redis or Memcached stores **short_code to redirect record** mappings with TTL aligned to link expiration. It should support high QPS, low p99 latency, request coalescing on misses, and negative caching for invalid codes.
`,
    },
    {
      name: "Primary URL Store",
      kind: "database",
      role: "Durable source of truth for all mappings.",
      detailMD: `
A key-value store persists the mapping and supports conditional writes. It is partitioned by short code, replicated for availability, backed up for durability, and sized for billions of small records.
`,
    },
    {
      name: "Analytics Pipeline",
      kind: "queue",
      role: "Captures click events without slowing redirects.",
      detailMD: `
Kafka, Kinesis, Pub/Sub, or a similar queue receives best-effort click events. Consumers deduplicate where possible, aggregate by time bucket and dimension, and store results in an OLAP database or time-series store.
`,
    },
    {
      name: "Load Balancer",
      kind: "loadBalancer",
      role: "Spreads traffic across stateless services and regions.",
      detailMD: `
The load balancer performs health checks, routes traffic to healthy redirect service instances, and can separate create API traffic from redirect traffic if the workload requires different scaling policies.
`,
    },
    {
      name: "Abuse and Safety Scanner",
      kind: "external",
      role: "Prevents the shortener from becoming a phishing amplifier.",
      detailMD: `
The scanner evaluates long URLs against malware feeds, phishing signals, domain reputation, and customer policy. It can block creation, mark links for interstitial warnings, or disable previously created links.
`,
    },
  ],
  deepDives: [
    {
      topic: "Key generation strategies",
      detailMD: `
There are three common approaches, and a strong answer compares them explicitly.

**Counter plus base62**: maintain a monotonically increasing integer and encode it using characters 0-9, a-z, and A-Z. It is compact, deterministic, and collision-free if the counter is serialized correctly. The downside is coordination. A single counter becomes a bottleneck, while distributed counters need range allocation, Snowflake-style IDs, or database sequences. Sequential codes are also enumerable, so attackers can scan links unless rate limiting and randomization are added.

**Hash long URL**: compute MD5, SHA-256, or another hash of the long URL and take the first N base62 characters. This avoids a central counter, but collisions are possible because the output is truncated. The system must check whether the candidate code already exists and retry with a salt, longer prefix, or random suffix. Hashing also makes duplicate long URLs produce the same short code unless user identity or salt is included, which may or may not be desirable.

**Pre-generated Key Generation Service**: generate random or sequential base62 codes offline and store them in two logical databases: **unused_keys** and **used_keys**. Create requests atomically move a code from unused to used and then write the URL mapping. This keeps code allocation fast, avoids collisions on the request path, and allows workers to prefetch batches. The tradeoff is operational complexity: the unused pool must be replenished, allocation must be idempotent, and lost prefetched batches need recovery.

For this question, the KGS or range-allocated counter approach is usually the cleanest interview answer because it gives uniqueness without repeated collision checks at high scale.
`,
    },
    {
      topic: "301 versus 302 redirects",
      detailMD: `
**301 Moved Permanently** tells clients and search engines that the redirect is permanent. Browsers and intermediate caches may cache it aggressively. This reduces load and latency, but it can bypass the service on later visits, which weakens click analytics, abuse takedowns, and destination changes.

**302 Found** or 307 Temporary Redirect keeps clients coming back to the shortener each time. That costs more serving capacity, but it preserves analytics accuracy, lets the service enforce expiration, and allows links to be disabled quickly. Most interview designs choose 302 by default.

A mature product can support both. For user-owned campaign links with analytics, use 302 and **Cache-Control: no-store**. For internal immutable links with no analytics requirements, 301 plus edge caching can reduce cost.
`,
    },
    {
      topic: "Cache strategy and hit ratio",
      detailMD: `
The cache should store the full redirect decision, not just the long URL. Include long URL, expiration, status, owner policy flags, and redirect type so the service does not need a database read on a hit.

Use read-through caching on misses and write-through or cache warming on creates. TTL should be the minimum of a default cache TTL and the link expiration time. Negative-cache unknown short codes for a short period such as 30 to 120 seconds to protect the database from random scans.

The 80/20 assumption is powerful here: if 20 percent of active links drive 80 percent of redirects, a modest Redis fleet can remove most database traffic. Track cache hit ratio, p99 cache latency, miss amplification, hot-key skew, and eviction rate. For celebrity or viral links, replicate hot keys across cache shards or use local in-process caching to avoid one shard becoming overloaded.
`,
    },
    {
      topic: "Custom aliases and collision handling",
      detailMD: `
Custom aliases are user-visible and must be treated differently from generated keys. Validate length, allowed characters, reserved words, impersonation risk, trademarks for enterprise customers, and case sensitivity. A good default is case-sensitive generated codes but case-insensitive custom aliases only if the product explicitly wants that behavior.

The database operation must be atomic: insert the alias only if **short_code** does not already exist. Never check then insert in two separate steps because concurrent requests can both pass the check. If an alias is taken, return 409 Conflict and let the caller choose another.

Generated-code collisions should be invisible to users. With a KGS, collisions are prevented before allocation. With hash or random generation, the create service retries with a salt or longer code after a conditional insert fails. Put a small retry bound and surface a 500 only if the keyspace or generator is unhealthy.
`,
    },
    {
      topic: "Database choice for the serving path",
      detailMD: `
A relational database is acceptable for a small single-region prototype, but the production serving path is a key-value workload: lookup by short code and return one record. That favors DynamoDB, Cassandra, Bigtable, or another horizontally scalable KV store.

Partition by **short_code**. Base62 codes generated sequentially can create hot partitions if the partitioner preserves prefix order, so use a database with hash partitioning or randomize prefixes. Replicate data across availability zones, use quorum or leader-based writes depending on the store, and keep redirect reads local to the serving region whenever possible.

Secondary indexes should not be needed for redirects. User dashboards and analytics can use separate tables optimized for user_id and time. This separation keeps the redirect store small, predictable, and highly available.
`,
    },
    {
      topic: "Analytics without hurting redirects",
      detailMD: `
Counting clicks synchronously in the **urls** row is a common beginner mistake. A viral link could turn one row into a write hotspot, and the redirect would depend on the analytics store.

Instead, the redirect service emits an event after resolving the URL. The event pipeline can batch, sample if product allows it, and aggregate by short code and time window. For unique visitors, use approximate sketches such as HyperLogLog rather than storing every visitor in the serving database.

If analytics delivery fails, redirects should continue. The system can buffer locally for a short time, drop non-critical events under pressure, or write to a durable queue with backpressure, but it should not turn analytics degradation into redirect downtime.
`,
    },
  ],
  scaling: [
    {
      stage: "Prototype: single region and relational database",
      detailMD: `
Start with one stateless API service, one relational database table keyed by short code, and simple random or counter-based code generation. Add a small Redis cache when redirect traffic grows. This is enough to demonstrate correctness, custom alias conflict handling, and expiration.
`,
    },
    {
      stage: "Growth: cache and read replicas",
      detailMD: `
Separate create and redirect endpoints behind the load balancer. Add Redis read-through caching for hot mappings, database read replicas if using relational storage, and asynchronous analytics via a queue. Keep the redirect service stateless so horizontal scaling is straightforward.
`,
    },
    {
      stage: "Large scale: sharded replicated key-value store",
      detailMD: `
Move the URL mapping table to a distributed KV store partitioned by short code. Introduce a Key Generation Service with pre-generated pools or range allocation. Replicate across availability zones, add circuit breakers, and use negative caching to absorb invalid-code scans.
`,
    },
    {
      stage: "Global scale: multi-region redirects",
      detailMD: `
Route users to the nearest healthy region using geo-DNS or anycast. Replicate mappings globally through asynchronous streams or multi-region database replication. Keep reads local, make creates strongly durable in a home region, and propagate cache invalidations for deletes and abuse takedowns.
`,
    },
    {
      stage: "Extreme scale: edge decisions and specialized analytics",
      detailMD: `
For immutable non-analytics links, push redirect mappings to edge caches. For analytics links, keep 302 at the service but use regional queues and OLAP stores. Add hot-key replication, adaptive rate limiting, abuse automation, and capacity isolation for enterprise tenants.
`,
    },
  ],
  bottlenecks: [
    {
      issue: "Single key generator bottleneck",
      optimizationMD: `
Do not coordinate every create request through one database sequence. Allocate ranges to workers, pre-generate keys in batches, or use a KGS with an unused key pool. Monitor pool depth and generation lag.
`,
    },
    {
      issue: "Database overload from cache misses",
      optimizationMD: `
Use Redis read-through caching, cache warming on create, negative caching for misses, request coalescing, and hot-key replication. Keep database lookups as single-partition reads by short code.
`,
    },
    {
      issue: "Viral link hot spot",
      optimizationMD: `
A single celebrity link can dominate traffic. Replicate that mapping across cache shards, add local in-process caching, and consider CDN edge caching if analytics accuracy can tolerate sampled or delayed counts.
`,
    },
    {
      issue: "Synchronous analytics writes",
      optimizationMD: `
Emit click events to a queue and aggregate asynchronously. Never update the URL row on every redirect. If exact counters are required, batch increments by short code and time bucket.
`,
    },
    {
      issue: "Large or malicious long URLs",
      optimizationMD: `
Set maximum URL length, normalize inputs, reject unsupported schemes, scan domains, and store very long metadata outside the hot serving record if necessary. Keep the redirect record bounded in size.
`,
    },
    {
      issue: "Cross-region consistency delays",
      optimizationMD: `
Use a home-region write model with fast replication, route immediate post-create redirects to the write region when needed, and invalidate or update regional caches after deletes, expirations, and abuse actions.
`,
    },
  ],
  failureHandling: [
    {
      scenario: "Cache outage",
      strategyMD: `
Redirect services fall back to the primary URL store with strict timeouts and rate limits to avoid a database stampede. Use circuit breakers, partial cache fleet isolation, and gradual cache warmup after recovery.
`,
    },
    {
      scenario: "Primary database partition or regional failure",
      strategyMD: `
Serve reads from replicas when possible and fail over regional traffic to a healthy region. For creates, either pause new link creation briefly or route to another write-capable region. Redirect availability should be prioritized over management features.
`,
    },
    {
      scenario: "Key pool exhaustion",
      strategyMD: `
Alert before the unused pool reaches a low watermark. KGS workers should replenish in batches, and the create API should degrade gracefully with retryable errors rather than issuing duplicate codes.
`,
    },
    {
      scenario: "Analytics queue unavailable",
      strategyMD: `
Continue redirects. Buffer events locally for a bounded time if safe, drop low-priority analytics under pressure, and expose freshness indicators in dashboards. Do not block the redirect on analytics recovery.
`,
    },
    {
      scenario: "Abuse scanner degraded",
      strategyMD: `
Apply a conservative policy for anonymous or high-risk creates, such as lower rate limits or pending status. Trusted enterprise traffic can continue with delayed scanning, while known-bad domains remain blocked from cached deny lists.
`,
    },
    {
      scenario: "Bad deployment corrupts redirect decisions",
      strategyMD: `
Use canary deployments, fast rollback, synthetic redirect probes, and shadow reads comparing cache and database records. Keep a kill switch that disables risky features such as destination rewriting without taking down redirects.
`,
    },
  ],
  security: [
    {
      label: "Malicious URL scanning",
      detailMD: `
Shorteners are frequently abused for phishing and malware. Scan long URLs at creation, rescan popular links periodically, integrate domain reputation feeds, and support warning interstitials or takedowns.
`,
    },
    {
      label: "Rate limiting",
      detailMD: `
Apply per-IP, per-user, per-token, and per-domain limits on create requests. Also throttle random-code scans on redirects to protect cache and database capacity from enumeration attacks.
`,
    },
    {
      label: "Open-redirect protection",
      detailMD: `
The product is intentionally a redirector, but it must prevent dangerous schemes and ambiguous parsing. Accept only safe schemes such as HTTP and HTTPS, normalize URLs with a trusted parser, and block internal network targets if the service later fetches metadata.
`,
    },
    {
      label: "Enumeration resistance",
      detailMD: `
Sequential short codes are easy to crawl. Randomize generated codes, use sufficiently long base62 strings, monitor scan patterns, and rate-limit 404-heavy clients.
`,
    },
    {
      label: "Access control",
      detailMD: `
Only owners or privileged operators can delete links, view detailed analytics, or edit metadata. Anonymous redirects should not reveal private owner data.
`,
    },
    {
      label: "Privacy and analytics minimization",
      detailMD: `
Click analytics can include personal data. Store coarse geography instead of raw IP where possible, apply retention windows, honor deletion requests, and separate raw events from public dashboards.
`,
    },
  ],
  tradeoffs: {
    pros: [
      "Simple redirect data model with a single primary lookup key.",
      "Read-heavy workload scales well with cache and KV storage.",
      "Asynchronous analytics keeps the user-facing path fast.",
      "Pre-generated keys provide collision-free creation with predictable latency.",
      "302 redirects preserve observability and takedown control.",
    ],
    cons: [
      "302 redirects cost more infrastructure than permanent edge-cached redirects.",
      "Custom aliases add contention, abuse risk, and support complexity.",
      "Multi-region deletes and abuse takedowns require careful cache invalidation.",
      "Exact analytics can conflict with low-latency redirects.",
      "Sequential key generation can leak volume and enable enumeration if not mitigated.",
    ],
    alternativesMD: `
Alternative one is a pure hash-based system: hash the long URL, truncate, and retry on collision. It is easy to build but collision handling and duplicate semantics become tricky.

Alternative two is a database sequence with base62 encoding. It is clean for a single region but needs range allocation or sharded sequences at scale.

Alternative three is edge-only redirect hosting for immutable links. It is extremely fast and cheap for static mappings, but weak for analytics, expiration, and abuse response.
`,
    whenNotToUseMD: `
Do not use a public URL shortener for sensitive access-control decisions. Anyone with the short link can usually access the destination. If the problem requires private sharing, signed URLs, authorization checks, or expiring secrets, design an access-controlled sharing system rather than a simple shortener.
`,
  },
  followUpQuestions: [
    {
      question: "How many characters should the short code have?",
      answerMD: `
Compute the keyspace. Base62 with 6 characters gives about 56.8B combinations, while 7 characters gives about 3.5T. For 6B five-year mappings, 6 characters is mathematically enough but operationally tight once you include reserved words, expired links, custom aliases, and collision margin. Choose 7 by default.
`,
    },
    {
      question: "Should the same long URL always return the same short code?",
      answerMD: `
Usually no. Different users and campaigns may need separate analytics and expiration policies for the same destination. If deduplication is desired for anonymous links, it should be a product decision and not required for the redirect serving path.
`,
    },
    {
      question: "How do you delete or expire a link safely?",
      answerMD: `
Use a status field and **expires_at** in the serving record. On redirect, return 410 Gone for expired or disabled records. Also evict or update caches when the status changes. A background job can compact expired records later, but correctness should not depend on the sweep running exactly on time.
`,
    },
    {
      question: "How do you support links created in one region and immediately read in another?",
      answerMD: `
Options include synchronous multi-region writes, home-region routing for a short read-after-write window, or accepting small propagation delays. For a beginner design, choose durable write in one region plus fast asynchronous replication, then route the creator to the write region for immediate validation.
`,
    },
    {
      question: "How do you prevent short-code enumeration?",
      answerMD: `
Use random or non-obvious codes, avoid plain sequential exposure, apply rate limits to 404-heavy clients, detect scan patterns, and consider longer codes for anonymous links. Enumeration is a security and privacy risk because public links may expose sensitive destinations.
`,
    },
    {
      question: "Where should click_count be updated?",
      answerMD: `
Not synchronously in the redirect transaction. Emit click events to a queue, aggregate them by short code and time bucket, and periodically update summary tables. The **click_count** in the URL row can be approximate or eventually consistent.
`,
    },
    {
      question: "What happens when Redis has stale data after a delete?",
      answerMD: `
Use cache invalidation on delete, short TTLs for sensitive links, and status checks from the database for high-risk operations. If stale redirects are unacceptable for abuse takedowns, maintain a small deny-list cache that is checked before normal mapping cache results.
`,
    },
  ],
  companyVariations: [
    {
      company: "Amazon",
      angleMD: `
Amazon interviewers often push on DynamoDB-style partitioning, availability zones, operational alarms, abuse prevention for public endpoints, and cost. Be ready to explain conditional writes for aliases and how the redirect path survives dependency failures.
`,
    },
    {
      company: "Microsoft",
      angleMD: `
Microsoft may frame this around enterprise link management, compliance, tenant isolation, Azure Front Door or CDN, and integration with identity. Discuss owner permissions, audit logs, retention, and private organizational short domains.
`,
    },
    {
      company: "Google",
      angleMD: `
Google tends to probe global scale, caching layers, tail latency, abuse detection, and data freshness. Expect follow-ups on base62 keyspace, multi-region replication, 301 versus 302 behavior, and high-QPS read serving.
`,
    },
    {
      company: "Uber",
      angleMD: `
Uber may tie short links to SMS, deep links, driver and rider notifications, and regional reliability. Emphasize low-latency mobile redirects, observability for campaigns, and graceful degradation during regional incidents.
`,
    },
  ],
  relatedQuestions: [
    {
      slug: "rate-limiter",
      note: "Protects create APIs and redirect endpoints from abuse and enumeration.",
    },
    {
      slug: "distributed-cache",
      note: "Hot short-code mappings rely on cache hit ratio, TTLs, and hot-key handling.",
    },
    {
      slug: "pastebin",
      note: "Shares key generation, expiration, and public read-heavy access patterns.",
    },
    {
      slug: "key-value-store",
      note: "The production URL mapping store is a classic KV lookup workload.",
    },
    {
      slug: "notification-service",
      note: "Short links often appear in SMS, email, and push notification delivery systems.",
    },
  ],
  interviewTips: {
    commonMistakes: [
      "Updating click_count synchronously on every redirect.",
      "Using a hash without explaining collision detection and retry.",
      "Forgetting custom alias atomicity and race conditions.",
      "Choosing 301 by default while promising accurate click analytics.",
      "Ignoring abuse, phishing, and enumeration risks.",
      "Designing joins or multi-step database reads in the redirect path.",
    ],
    redFlags: [
      "No concrete capacity math or keyspace calculation.",
      "No cache strategy for a 100:1 read-heavy workload.",
      "No durable source of truth for issued links.",
      "No plan for expiration, deletion, or takedown cache invalidation.",
      "Treating analytics as equally critical as redirects.",
    ],
    expectations: [
      "State assumptions and compute writes, reads, storage, bandwidth, and cache size.",
      "Separate create path, redirect path, key generation, and analytics.",
      "Explain at least two key generation strategies and choose one.",
      "Use short_code as the primary lookup key and avoid joins on redirects.",
      "Call out 301 versus 302 and its impact on analytics.",
      "Discuss availability, cache misses, abuse, and multi-region scaling.",
    ],
    communicationMD: `
Lead with the read-heavy nature of the system. Draw the redirect path first because that is the business-critical path, then add create, key generation, analytics, and abuse controls around it. When tradeoffs appear, tie them to product goals: analytics accuracy favors 302, raw latency favors edge caching, and operational simplicity favors a KV store plus Redis.
`,
  },
  revisionNotesMD: `
- Use **short_code** as the primary key and keep redirects to one cache lookup or one KV lookup.
- At 100M new URLs per month and 100:1 reads, expect about 39 write QPS average and 3,900 redirect QPS average, with 10x peaks around 390 and 39,000.
- Five years of mappings is about 6B records and 3 TB raw at 500 bytes each, or roughly 10 to 12 TB replicated with overhead.
- Base62 length matters: 6 chars gives 56.8B combinations, 7 chars gives about 3.5T.
- Prefer 302 when analytics, expiration, and takedowns matter. Use 301 only for immutable links where client caching is acceptable.
- Avoid synchronous analytics writes. Publish click events to a queue and aggregate asynchronously.
- KGS with **unused_keys** and **used_keys** avoids per-request collision checks but adds operational responsibility.
- Protect the system with URL scanning, rate limiting, alias validation, and enumeration detection.
`,
  flashcards: [
    {
      front: "Why is URL Shortener read-heavy?",
      back: "Each short link is created once but may be clicked many times, commonly around 100 redirects per create.",
    },
    {
      front: "What is the primary key for the serving store?",
      back: "short_code, because redirects arrive with only the short code and must resolve with one point lookup.",
    },
    {
      front: "Why choose 302 by default?",
      back: "302 keeps clients returning to the service, which preserves analytics, expiration enforcement, and takedown control.",
    },
    {
      front: "What is the risk of 301 redirects?",
      back: "Browsers and caches may bypass the shortener on later clicks, reducing analytics accuracy and slowing takedown enforcement.",
    },
    {
      front: "How does a KGS avoid collisions?",
      back: "It pre-generates unique codes, stores unused and used pools, and atomically claims an unused code during creation.",
    },
    {
      front: "Why not increment click_count synchronously?",
      back: "It creates write hotspots and makes redirects depend on analytics; use asynchronous event aggregation instead.",
    },
    {
      front: "How many codes does 7-character base62 provide?",
      back: "About 3.5 trillion combinations, enough headroom for billions of links plus reserved and expired codes.",
    },
    {
      front: "What should happen for expired links?",
      back: "Return 410 Gone, invalidate caches, and compact or delete records later through background retention jobs.",
    },
  ],
  quiz: [
    {
      question: "Which redirect status is the best default when click analytics must remain accurate?",
      options: ["301 Moved Permanently", "302 Found", "304 Not Modified", "204 No Content"],
      answerIndex: 1,
      explanationMD: `
302 keeps clients returning to the shortener on future clicks. 301 can be cached by browsers and intermediaries, which may bypass analytics.
`,
    },
    {
      question: "What is the most important lookup key in the redirect serving store?",
      options: ["user_id", "long_url", "short_code", "created_at"],
      answerIndex: 2,
      explanationMD: `
The redirect request contains the short code. The serving path should do a single lookup by **short_code** and avoid joins or scans.
`,
    },
    {
      question: "Given 100M creates per month and 30 days per month, what is the approximate average write QPS?",
      options: ["4 writes per second", "39 writes per second", "390 writes per second", "3,900 writes per second"],
      answerIndex: 1,
      explanationMD: `
100M divided by 30 days is 3.33M per day. 3.33M divided by 86,400 seconds is about 38.6 writes per second.
`,
    },
    {
      question: "Why should click analytics be asynchronous?",
      options: ["Analytics is never useful", "It prevents redirect latency and write hotspots from depending on analytics storage", "It makes short codes unique", "It removes the need for URL validation"],
      answerIndex: 1,
      explanationMD: `
The redirect path must be fast and highly available. Synchronous counters can create hot rows and couple redirects to analytics failures.
`,
    },
    {
      question: "Which key generation approach best avoids collisions on the request path?",
      options: ["Take the first 4 characters of MD5", "Use a pre-generated key pool with atomic claims", "Ask the client to choose a code", "Use the current minute as the code"],
      answerIndex: 1,
      explanationMD: `
A pre-generated pool ensures codes are unique before allocation. Create requests atomically claim unused codes instead of repeatedly discovering collisions.
`,
    },
    {
      question: "What is the best response for an expired or deliberately disabled short link?",
      options: ["200 OK with the original URL", "302 to the original URL", "410 Gone", "500 Internal Server Error"],
      answerIndex: 2,
      explanationMD: `
410 Gone communicates that the resource used to exist but is no longer available. It is more accurate than 404 for expired or disabled links.
`,
    },
    {
      question: "Why can sequential base62 codes be risky?",
      options: ["They cannot be decoded", "They make links longer than hashes", "They can reveal volume and enable enumeration", "They require analytics to be disabled"],
      answerIndex: 2,
      explanationMD: `
Sequential codes are easy to crawl and reveal approximate creation volume. Randomization, longer codes, and rate limiting reduce this risk.
`,
    },
  ],
  cheatSheetMD: `
**Goal**: map long URLs to short unique codes and redirect in under 50ms p99 within a region.

**Workload**: 100M creates per month, 100:1 reads, about 39 write QPS average, about 3,900 redirect QPS average, 10x peak.

**Storage**: 6B records over five years. At 500 bytes each, about 3 TB raw and 10 to 12 TB replicated with overhead.

**Key generation**: counter plus base62 is simple but needs coordination. Hashing needs collision retries. KGS with unused and used key pools gives predictable collision-free allocation.

**Serving path**: client to CDN or load balancer to redirect service to Redis. On miss, read URL KV store by **short_code**, fill cache, return 302.

**Database**: KV store partitioned by **short_code**. Conditional writes for custom aliases. Separate analytics and user-dashboard storage from redirect serving.

**Caching**: cache full redirect records, respect expiration TTL, negative-cache invalid codes briefly, and replicate hot keys.

**Redirect choice**: 302 for analytics and takedowns. 301 only for immutable links where client caching is acceptable.

**Analytics**: publish click events asynchronously to a queue; aggregate in OLAP or time-series storage.

**Security**: scan malicious URLs, block unsafe schemes, rate-limit creation and enumeration, protect analytics with auth, and support takedowns.
`,
  references: [
    {
      title: "System Design Interview",
      kind: "Book",
      author: "Alex Xu",
    },
    {
      title: "Designing Data-Intensive Applications",
      kind: "Book",
      author: "Martin Kleppmann",
    },
    {
      title: "Amazon DynamoDB Developer Guide",
      kind: "Docs",
      url: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html",
      author: "Amazon Web Services",
    },
    {
      title: "RFC 9110 HTTP Semantics",
      kind: "Docs",
      url: "https://www.rfc-editor.org/rfc/rfc9110",
      author: "IETF",
    },
    {
      title: "The Tail at Scale",
      kind: "Paper",
      url: "https://research.google/pubs/the-tail-at-scale/",
      author: "Jeffrey Dean and Luiz Andre Barroso",
    },
  ],
};
