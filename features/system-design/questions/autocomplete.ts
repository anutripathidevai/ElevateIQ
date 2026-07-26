import type { SDQuestionContent } from "../types";

export const autocompleteContent: SDQuestionContent = {
  slug: "autocomplete",
  statementMD: `
Design Search Autocomplete, also called Typeahead. As a user types a prefix in a search box, the system returns a small ranked list of likely full queries or entities before the user submits the final search.

At interview scale, assume hundreds of millions of daily users, billions of typed prefixes per day, many languages and markets, and a strict user-perceived latency target under 100ms. The core challenge is not calling a search engine on every keystroke; it is precomputing high-quality suggestions, serving prefix matches from memory, blending personalization and freshness, and keeping the system safe and reliable during traffic spikes.

The default design should use a trie or compressed prefix tree where each prefix node stores precomputed top-k completions. An offline pipeline aggregates query logs to rebuild ranked trie snapshots, while a real-time overlay handles fast-moving trends and recent user behavior.
`,
  businessUseCaseMD: `
Autocomplete reduces typing effort, improves search success, and increases conversion by guiding users toward popular, valid, and fresh queries. In consumer search, e-commerce, media, and professional networks, better typeahead directly affects engagement and revenue.

It is also a discovery surface. The suggestions shown after a few characters can expose trending topics, products, people, jobs, or documents, but that same visibility means the system must control latency, safety, privacy, and ranking quality carefully.
`,
  functionalRequirements: [
    "Return the top N suggestions for a normalized prefix, locale, device, and optional user context.",
    "Support prefix matching over query strings and optionally over entities such as people, products, jobs, or documents.",
    "Rank suggestions using global popularity, frequency, recency, personalization, location or locale, and safety filters.",
    "Serve suggestions on every debounced keystroke with stable ordering and highlighted matched prefixes.",
    "Log impressions, clicks, accepted suggestions, typed queries, and abandonment for offline ranking and analytics.",
    "Handle misspellings and near-prefix typos without making the common exact-prefix path slow.",
    "Roll out rebuilt trie snapshots without downtime and support rollback to a previous known-good version.",
  ],
  nonFunctionalRequirements: [
    {
      label: "Latency",
      detailMD: `
Autocomplete is on the interactive typing path. The browser should debounce input for 100 to 200ms, and the backend should target under 50ms p99 inside a region so the end-to-end experience stays under 100ms excluding long client network delays.
`,
    },
    {
      label: "Availability",
      detailMD: `
Suggestion serving should target 99.99 percent availability. Search can still work without autocomplete, but a broken typeahead is highly visible and creates a poor first impression, so the system should degrade to cached popular prefixes rather than fail closed.
`,
    },
    {
      label: "Scalability",
      detailMD: `
Every final search query creates multiple prefix requests. The serving tier must handle hundreds of thousands of global peak QPS, shard the trie by prefix, keep shards in memory, and scale independently from the full search engine.
`,
    },
    {
      label: "Freshness",
      detailMD: `
The system needs two freshness modes. Stable popularity can be rebuilt in batch every few hours or daily, while breaking news, viral products, and recent user history need a small real-time overlay that can change within seconds or minutes.
`,
    },
    {
      label: "Relevance",
      detailMD: `
Top suggestions should be useful, safe, deduplicated, localized, and diverse. Ranking must avoid overfitting to raw frequency because raw logs contain spam, navigational noise, repeated bot traffic, and personally sensitive queries.
`,
    },
    {
      label: "Memory efficiency",
      detailMD: `
Trie snapshots are served from RAM. Use compressed tries, finite-state transducers, shared suffix storage, integer suggestion ids, and top-k arrays only for prefixes that pass a frequency threshold.
`,
    },
    {
      label: "Privacy and safety",
      detailMD: `
Do not leak private or rare queries. Apply minimum frequency thresholds, remove sensitive terms, hash user identifiers in logs, and separate personalized suggestions from globally cacheable responses.
`,
    },
  ],
  capacityEstimation: {
    assumptionsMD: `
Assume 200M daily active users, each averaging five search sessions per day. That gives 1B final search queries per day. A user may type eight characters, but client-side debouncing and minimum prefix length reduce backend autocomplete calls to about three requests per final query.

Assume 3B autocomplete requests per day, a 10x peak multiplier over average, five active serving regions, top 10 suggestions per response, 200M distinct normalized query terms in the weekly corpus, 30M indexed hot prefixes after frequency filtering, and a compressed trie snapshot of about 120 GB per region across all shards.
`,
    metrics: [
      {
        label: "Daily final searches",
        value: "1B queries per day",
        note: "200M daily users times five search sessions",
      },
      {
        label: "Daily autocomplete requests",
        value: "3B requests per day",
        note: "Three debounced prefix requests per final search",
      },
      {
        label: "Average autocomplete QPS",
        value: "35,000 requests per second",
        note: "3B divided by 86,400 seconds, rounded up",
      },
      {
        label: "Peak global autocomplete QPS",
        value: "350,000 requests per second",
        note: "10x average peak",
      },
      {
        label: "Peak regional QPS",
        value: "70,000 requests per second",
        note: "350,000 peak QPS divided across five active regions",
      },
      {
        label: "Distinct suggestion terms",
        value: "200M normalized queries",
        note: "After deduplication, normalization, spam removal, and locale splitting",
      },
      {
        label: "Indexed prefix cardinality",
        value: "30M hot prefixes",
        note: "Only prefixes above frequency and safety thresholds get stored top-k lists",
      },
      {
        label: "Trie memory per region",
        value: "120 GB across shards",
        note: "Compressed term graph, top-k arrays, scores, metadata, and rollout headroom",
      },
      {
        label: "Shard memory",
        value: "500 MB to 1 GB per shard",
        note: "120 GB split across 256 prefix shards with replica and overhead planning",
      },
      {
        label: "Query log volume",
        value: "1.4 TB raw events per day",
        note: "Autocomplete events plus final search events before compression and retention policies",
      },
      {
        label: "Hot prefix edge cache",
        value: "2 to 5 GB raw responses",
        note: "One million hottest cacheable prefixes times roughly two KB per response, plus overhead",
      },
    ],
    calculationsMD: `
- Final searches: 200M daily active users times five searches per day gives 1B final search queries per day.
- Autocomplete calls: with client debounce, minimum prefix length, and request cancellation, assume three backend calls per final search. That gives 3B autocomplete requests per day.
- Average QPS: 3B requests divided by 86,400 seconds is about 34,700 requests per second, rounded to 35,000.
- Peak QPS: a 10x multiplier gives about 350,000 global autocomplete requests per second. With five active regions, each region should handle roughly 70,000 peak QPS before failover headroom.
- Prefix cardinality: 200M normalized query terms with an average of 10 useful prefixes would produce up to 2B raw term-prefix pairs, but most are rare. Keeping only prefixes with enough traffic and safe content can reduce the served set to about 30M hot prefixes.
- Trie memory: a compressed trie or finite-state transducer for 200M terms might take 20 to 40 GB. Top 10 suggestion arrays for 30M prefixes, storing compact ids and scores, can add 4 to 10 GB raw. Metadata, locale splits, personalization features, duplicate snapshot rollout, and allocator overhead make 120 GB per region a realistic capacity target.
- Shards: 120 GB divided by 256 shards is about 470 MB per shard. Plan for 500 MB to 1 GB per shard so a server can hold multiple shards and a second snapshot during rollout.
- Latency budget: target 100ms p99 end to end. Spend about 20ms on network and TLS, 5ms on edge cache lookup, 10ms on gateway and routing, 15ms on trie lookup and ranking, and 10ms on logging and serialization, leaving tail headroom.
- Log volume: 3B autocomplete events at about 300 bytes each is about 900 GB per day. 1B final search events at about 500 bytes each is about 500 GB per day. Together this is about 1.4 TB raw before compression.
`,
  },
  apiDesign: {
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/autocomplete",
        descriptionMD: `
Returns ranked suggestions for a prefix. The endpoint accepts anonymous traffic, but uses an optional authenticated or hashed user context for personalization when available.
`,
        request: `
Query parameters:
prefix=iph
limit=10
locale=en-US
device=mobile
userContext=user_hash_123
sessionId=sess_456
`,
        response: `
{
  "prefix": "iph",
  "locale": "en-US",
  "suggestions": [
    {
      "text": "iphone 17 pro",
      "type": "query",
      "score": 0.982,
      "source": "global_and_personalized",
      "matchedPrefixLength": 3
    },
    {
      "text": "iphone charger",
      "type": "query",
      "score": 0.941,
      "source": "global"
    }
  ],
  "snapshotVersion": "2026-07-26-0900",
  "servedFrom": "trie-shard"
}
`,
        statusCodes: [
          { code: 200, meaning: "Suggestions returned" },
          { code: 400, meaning: "Invalid prefix, locale, or limit" },
          { code: 429, meaning: "Rate limit exceeded" },
          { code: 503, meaning: "Autocomplete temporarily unavailable" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/autocomplete/events",
        descriptionMD: `
Records user interaction events such as suggestion impressions, accepted suggestions, final submitted searches, and abandonment. The serving path should enqueue these events asynchronously.
`,
        request: `
{
  "eventType": "suggestion_clicked",
  "prefix": "iph",
  "suggestionText": "iphone 17 pro",
  "position": 1,
  "locale": "en-US",
  "sessionId": "sess_456",
  "userContext": "user_hash_123",
  "timestamp": "2026-07-26T07:24:46Z"
}
`,
        response: `
{
  "accepted": true
}
`,
        statusCodes: [
          { code: 202, meaning: "Event accepted for asynchronous processing" },
          { code: 400, meaning: "Invalid event payload" },
          { code: 429, meaning: "Event rate limit exceeded" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/autocomplete/trending",
        descriptionMD: `
Returns trending suggestions for a locale or category. This is useful for empty-prefix states, search home pages, and fallback when prefix-specific serving is degraded.
`,
        request: `
Query parameters:
locale=en-US
category=all
limit=10
`,
        response: `
{
  "locale": "en-US",
  "window": "last_15_minutes",
  "suggestions": [
    { "text": "world cup highlights", "score": 0.91 },
    { "text": "summer sale shoes", "score": 0.88 }
  ]
}
`,
        statusCodes: [
          { code: 200, meaning: "Trending suggestions returned" },
          { code: 400, meaning: "Invalid locale or limit" },
          { code: 503, meaning: "Trending overlay unavailable" },
        ],
      },
      {
        method: "POST",
        path: "/internal/v1/autocomplete/snapshots",
        descriptionMD: `
Registers a newly built trie snapshot. Serving hosts download, verify, warm, and atomically switch to the version after health checks pass.
`,
        request: `
{
  "snapshotVersion": "2026-07-26-0900",
  "locale": "en-US",
  "shardCount": 256,
  "manifestUri": "s3://autocomplete-snapshots/2026-07-26-0900/manifest.json",
  "checksum": "sha256:manifest_checksum"
}
`,
        response: `
{
  "registered": true,
  "rolloutState": "warming"
}
`,
        statusCodes: [
          { code: 202, meaning: "Snapshot accepted for rollout" },
          { code: 400, meaning: "Invalid manifest" },
          { code: 409, meaning: "Snapshot version already registered" },
        ],
      },
      {
        method: "PATCH",
        path: "/internal/v1/autocomplete/safety-rules",
        descriptionMD: `
Applies emergency suppression rules for unsafe or policy-violating suggestions. These rules are small and can be pushed faster than a full trie rebuild.
`,
        request: `
{
  "action": "suppress",
  "terms": ["unsafe example query"],
  "locale": "en-US",
  "reason": "policy_violation"
}
`,
        response: `
{
  "updated": true,
  "effectiveWithinSeconds": 30
}
`,
        statusCodes: [
          { code: 200, meaning: "Safety rules updated" },
          { code: 400, meaning: "Invalid rule" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Caller is not allowed to change safety rules" },
        ],
      },
    ],
    notesMD: `
The read endpoint must stay simple and cache-aware. It should normalize the prefix, find candidates, rank, filter, and return a compact response. Logging and analytics should not block the response.

Personalized responses should be marked private or routed away from shared edge caches. Generic popular-prefix responses can use short TTL edge caching because autocomplete tolerates small freshness delays.
`,
  },
  databaseDesign: {
    schemaMD: `
The serving system is primarily an in-memory index, not a database lookup on every keystroke. Persistent stores hold raw logs, normalized suggestion terms, precomputed prefix top-k lists, user features, and snapshot manifests.

The offline pipeline reads append-only logs, computes popularity and quality features, builds compact trie shards, writes them to object storage, and publishes a manifest for serving hosts to load.
`,
    tables: [
      {
        name: "query_events",
        columns: [
          { name: "event_id", type: "uuid", note: "Unique event id for deduplication" },
          { name: "event_type", type: "varchar(32)", note: "Impression, click, accepted suggestion, final query, or abandonment" },
          { name: "prefix", type: "varchar(128)", note: "Normalized prefix seen by autocomplete" },
          { name: "query_text", type: "varchar(512)", note: "Final submitted query or clicked suggestion when present" },
          { name: "locale", type: "varchar(16)", note: "Language and market for ranking and filtering" },
          { name: "user_hash", type: "varchar(128) nullable", note: "Privacy-preserving user identifier" },
          { name: "session_id", type: "varchar(128)", note: "Short-lived session id for measuring acceptance" },
          { name: "created_at", type: "timestamp", note: "Event time for batch and streaming aggregation" },
        ],
      },
      {
        name: "suggestion_terms",
        columns: [
          { name: "suggestion_id", type: "bigint", note: "Compact integer id stored in trie top-k arrays" },
          { name: "normalized_text", type: "varchar(512)", note: "Canonical form used for matching" },
          { name: "display_text", type: "varchar(512)", note: "Text shown to users after casing and localization" },
          { name: "locale", type: "varchar(16)", note: "Locale or language bucket" },
          { name: "global_score", type: "double", note: "Popularity, acceptance, quality, and freshness features combined" },
          { name: "safety_status", type: "varchar(32)", note: "Allowed, suppressed, sensitive, or review required" },
          { name: "last_seen_at", type: "timestamp", note: "Most recent query event observed" },
        ],
      },
      {
        name: "prefix_topk",
        columns: [
          { name: "prefix", type: "varchar(128)", note: "Normalized prefix key" },
          { name: "locale", type: "varchar(16)", note: "Locale bucket" },
          { name: "snapshot_version", type: "varchar(64)", note: "Version used by serving hosts" },
          { name: "suggestion_ids", type: "array<bigint>", note: "Precomputed top-k ids for this prefix" },
          { name: "score_vector", type: "array<double>", note: "Scores aligned with suggestion_ids" },
          { name: "updated_at", type: "timestamp", note: "Build time for freshness and auditing" },
        ],
      },
      {
        name: "snapshot_manifests",
        columns: [
          { name: "snapshot_version", type: "varchar(64)", note: "Primary version identifier" },
          { name: "locale", type: "varchar(16)", note: "Locale covered by the snapshot" },
          { name: "shard_count", type: "int", note: "Number of trie shard files" },
          { name: "manifest_uri", type: "text", note: "Object storage path for shard metadata" },
          { name: "checksum", type: "varchar(128)", note: "Integrity check before loading" },
          { name: "status", type: "varchar(32)", note: "Built, warming, active, failed, or rolled back" },
          { name: "created_at", type: "timestamp", note: "Snapshot creation time" },
        ],
      },
    ],
    indexesMD: `
- **query_events.created_at, locale** supports time-windowed aggregation and retention.
- **suggestion_terms.locale, normalized_text** enforces deduplication and lookup during build.
- **prefix_topk.locale, prefix, snapshot_version** is useful for validation, but serving hosts should read compact shard files instead of querying this table per request.
- **snapshot_manifests.snapshot_version, locale** identifies the active snapshot and enables rollback.
`,
    relationshipsMD: `
A suggestion term can appear in many prefix top-k lists. Query events feed both suggestion term scoring and prefix aggregates. Snapshot manifests point to immutable object-storage files that serving hosts load into memory.
`,
    noSqlAlternativesMD: `
Append-only query events fit Kafka, Kinesis, Pub/Sub, S3, BigQuery, Snowflake, or a lakehouse table. Prefix aggregates can be stored in Bigtable, DynamoDB, Cassandra, RocksDB files, or columnar tables during build.

The serving path should not depend on a remote database. It should memory-map or load trie shards locally, with optional Redis or in-process caches for hot prefixes and small overlay stores for real-time trend deltas.
`,
  },
  architecture: {
    width: 960,
    height: 560,
    nodes: [
      { id: "client", label: "Client", kind: "client", x: 80, y: 210, sublabel: "Debounce, cancel stale" },
      { id: "edge-cache", label: "Edge Hot Prefix Cache", kind: "cdn", x: 250, y: 110, sublabel: "CDN, private bypass" },
      { id: "load-balancer", label: "Load Balancer", kind: "loadBalancer", x: 250, y: 300, sublabel: "Regional routing" },
      { id: "autocomplete-service", label: "Autocomplete Service", kind: "service", x: 440, y: 210, sublabel: "Normalize, rank, filter" },
      { id: "prefix-router", label: "Prefix Router", kind: "service", x: 610, y: 120, sublabel: "Shard by prefix" },
      { id: "trie-shards", label: "In-Memory Trie Shards", kind: "search", x: 790, y: 120, sublabel: "Top-k per node" },
      { id: "personalization-store", label: "Personalization Store", kind: "cache", x: 610, y: 310, sublabel: "Recent user features" },
      { id: "query-log-queue", label: "Query Log Queue", kind: "queue", x: 440, y: 420, sublabel: "Kafka, Kinesis" },
      { id: "batch-builder", label: "Batch Trie Builder", kind: "worker", x: 610, y: 450, sublabel: "Aggregate logs" },
      { id: "snapshot-store", label: "Snapshot Store", kind: "storage", x: 790, y: 450, sublabel: "Immutable shard files" },
      { id: "trend-updater", label: "Trend Updater", kind: "worker", x: 790, y: 300, sublabel: "Real-time deltas" },
    ],
    edges: [
      { from: "client", to: "edge-cache", label: "debounced prefix" },
      { from: "edge-cache", to: "client", label: "generic cache hit" },
      { from: "edge-cache", to: "load-balancer", label: "cache miss" },
      { from: "client", to: "load-balancer", label: "private request" },
      { from: "load-balancer", to: "autocomplete-service", label: "route" },
      { from: "autocomplete-service", to: "prefix-router", label: "normalized prefix" },
      { from: "prefix-router", to: "trie-shards", label: "lookup shard" },
      { from: "trie-shards", to: "autocomplete-service", label: "top-k candidates" },
      { from: "autocomplete-service", to: "personalization-store", label: "user features" },
      { from: "autocomplete-service", to: "edge-cache", label: "cacheable response" },
      { from: "autocomplete-service", to: "query-log-queue", label: "events", dashed: true },
      { from: "query-log-queue", to: "batch-builder", label: "batch windows", dashed: true },
      { from: "batch-builder", to: "snapshot-store", label: "write snapshot", dashed: true },
      { from: "snapshot-store", to: "trie-shards", label: "load version", dashed: true },
      { from: "query-log-queue", to: "trend-updater", label: "stream counts", dashed: true },
      { from: "trend-updater", to: "trie-shards", label: "fresh overlay", dashed: true },
    ],
    captionMD: `
The hot path is client debounce to edge cache or load balancer to autocomplete service to prefix router to in-memory trie shard, then ranking and response. Batch building, logs, snapshots, and trend overlays are outside the critical request path.
`,
  },
  architectureNotesMD: `
Autocomplete should be treated as a specialized low-latency serving system. Calling the full search engine for every prefix is too slow and expensive. Instead, normalized suggestion terms are compacted into trie shards, and each reachable prefix node stores a precomputed top-k candidate list.

The serving tier is stateless except for locally loaded trie shards and small caches. A prefix router maps the normalized prefix and locale to one or more trie shard replicas. The autocomplete service fetches the precomputed candidates, applies safety filters and optional personalization, then returns a small response.

The data pipeline is just as important as the serving layer. Query logs are aggregated offline into high-quality ranked snapshots, while a streaming trend updater produces bounded deltas for fast-moving topics. Snapshots are immutable, checksummed, warmed, and rolled out gradually.
`,
  requestFlow: [
    {
      title: "Client debounces typing",
      detailMD: `
The client waits 100 to 200ms after a keystroke, skips prefixes shorter than two or three characters, and cancels stale in-flight requests when the user keeps typing. This reduces backend traffic and prevents outdated suggestions from flashing in the UI.
`,
    },
    {
      title: "Edge cache checks generic hot prefixes",
      detailMD: `
For anonymous or non-personalized requests, the CDN can cache the hottest prefixes for a short TTL such as 30 to 120 seconds. Personalized requests should bypass shared caching or use private cache controls.
`,
    },
    {
      title: "Autocomplete service normalizes the prefix",
      detailMD: `
On a miss, the request reaches the service. It lowercases or case-folds, trims spaces, normalizes Unicode, applies locale rules, validates the limit, and removes unsafe control characters before lookup.
`,
    },
    {
      title: "Prefix router selects trie shard replicas",
      detailMD: `
The router uses locale and the leading characters or a consistent hash of the prefix to find the trie shard. Very hot prefixes can be replicated across multiple shards or served from local process memory.
`,
    },
    {
      title: "Trie shard returns precomputed top-k candidates",
      detailMD: `
The shard walks the trie by prefix characters. At the terminal prefix node, it reads the stored top-k suggestion ids and scores. This makes exact-prefix lookup proportional to prefix length plus response size rather than proportional to the number of matching terms.
`,
    },
    {
      title: "Ranking blends global and contextual signals",
      detailMD: `
The service starts from the global top-k list, then reranks or interleaves candidates using recent user searches, location, language, device, recency, trend boosts, safety suppressions, and diversity rules. If personalization data is unavailable, the global list is still usable.
`,
    },
    {
      title: "Response is returned and optionally cached",
      detailMD: `
The service returns a compact list with display text, type, score, and matched prefix metadata. Generic responses can be cached at the edge for short TTLs. Personalized responses are marked private.
`,
    },
    {
      title: "Events feed offline and streaming pipelines",
      detailMD: `
Impressions, clicks, accepted suggestions, final searches, and abandonment are published asynchronously. Batch jobs rebuild the ranked trie from stable aggregate logs, while streaming jobs compute real-time trend deltas for fast freshness.
`,
    },
  ],
  coreComponents: [
    {
      name: "Client Typeahead Controller",
      kind: "client",
      role: "Controls debounce, cancellation, rendering, and perceived latency.",
      detailMD: `
The client should delay requests briefly, cancel stale responses, avoid querying for very short prefixes, render loading states carefully, and keep keyboard navigation accessible. Good client behavior can reduce backend QPS by more than half.
`,
    },
    {
      name: "Edge Hot Prefix Cache",
      kind: "cdn",
      role: "Serves generic popular-prefix responses close to users.",
      detailMD: `
Edge caching works well for non-personalized prefixes such as common products, celebrities, or navigational searches. TTLs should be short enough to allow trend updates, and private responses must not be stored in shared caches.
`,
    },
    {
      name: "Autocomplete Service",
      kind: "service",
      role: "Owns request validation, normalization, ranking, filtering, and serialization.",
      detailMD: `
This stateless service receives prefix requests, calls the prefix router and personalization store, applies policy filters and reranking, emits logs asynchronously, and returns small JSON responses under a tight p99 budget.
`,
    },
    {
      name: "Prefix Router and Trie Shards",
      kind: "search",
      role: "Serve exact-prefix candidates from memory.",
      detailMD: `
Trie shards store compressed prefix structures with top-k completions at nodes. The router directs each prefix to a shard replica based on locale and prefix range or hash. The shard lookup should avoid allocations and remote database calls.
`,
    },
    {
      name: "Personalization Store",
      kind: "cache",
      role: "Provides recent and long-term user features for reranking.",
      detailMD: `
The store can hold recent queries, clicked entities, interests, locale preferences, and lightweight embeddings or topic ids. It must have strict timeouts because autocomplete should degrade to global ranking when personalization is slow.
`,
    },
    {
      name: "Batch Trie Builder",
      kind: "worker",
      role: "Aggregates logs and builds immutable ranked trie snapshots.",
      detailMD: `
The builder cleans query logs, applies spam and safety filters, computes popularity and acceptance features, generates prefix top-k lists, compacts them into shard files, writes checksums, and publishes manifests for rollout.
`,
    },
    {
      name: "Trend Updater",
      kind: "worker",
      role: "Adds fast freshness without rebuilding the full trie on every change.",
      detailMD: `
The updater consumes recent query streams, detects statistically significant surges, and maintains a bounded overlay of trend boosts or inserted suggestions. The overlay must expire quickly and be guarded by safety filters.
`,
    },
  ],
  deepDives: [
    {
      topic: "Trie with precomputed top-k completions",
      detailMD: `
A trie stores characters along edges, so finding a prefix is a walk from the root through each normalized prefix character. The expensive part is not finding the node; it is finding the best completions below that node. If every request scans descendants, common prefixes such as **a** or **new** would touch millions of terms.

The production approach is to store a precomputed top-k list at each prefix node that passes traffic and quality thresholds. For prefix **iph**, the node already contains the best suggestion ids such as popular phone queries, with scores and optional type metadata. Serving becomes a memory lookup and array read.

To control memory, use compressed tries, radix trees, or finite-state transducers. Store integer ids instead of full strings in top-k arrays, keep full display strings in a term table, and omit top-k lists for rare prefixes. Rebuild snapshots offline so node-level top-k data is globally consistent and sorted before serving.
`,
    },
    {
      topic: "Ranking signals and personalization",
      detailMD: `
Raw frequency is a strong baseline but not enough. A good ranker combines query count, unique users, suggestion acceptance rate, click-through rate after acceptance, recency decay, locale, device, safety status, and duplicate suppression.

Personalization should be a reranking layer over a safe global candidate set. For example, a user who recently searched for cameras may see camera-related completions above generic completions for the same prefix. A LinkedIn-style product may boost people, companies, jobs, or skills based on the viewer's network and recent activity.

Keep the personalized layer bounded. Do not generate arbitrary private queries into a shared global list, and avoid leaking rare user-specific terms. If the personalization store times out, serve the global top-k list and record a degradation metric.
`,
    },
    {
      topic: "Offline pipeline and snapshot rebuilds",
      detailMD: `
The offline pipeline starts with query and interaction logs. It normalizes text, removes bots and spam, groups by locale, filters sensitive or low-frequency queries, computes aggregate features, and generates a candidate score for each suggestion term.

Then it expands each term into useful prefixes and keeps the best top-k terms for each prefix. The builder writes immutable trie shard files and a manifest with version, shard count, checksums, model version, and safety rule version. Serving hosts download the files, verify checksums, warm memory, run probes, and atomically switch from the old snapshot to the new one.

This design favors correctness and operational safety. If a bad ranking model or corrupt snapshot is published, hosts can roll back by switching the active manifest pointer to the previous version without rebuilding data.
`,
    },
    {
      topic: "Sharding the trie by prefix",
      detailMD: `
A single global trie becomes too large and too hot. Split by locale first, then by leading prefix ranges or a hash of normalized prefixes. Prefix-range sharding keeps related prefixes together and can improve compression, while hash sharding balances load better. Many systems combine the two: locale plus first characters for routing, with hot-prefix replication for skew.

Serving shards should live in memory and avoid remote calls. With a 120 GB regional snapshot and 256 shards, each shard is roughly 500 MB before replica and rollout headroom. A host with 64 to 128 GB RAM can hold many shard replicas, but rollout needs space for both old and new versions during warmup.

Hot prefixes need special care. The prefix **a** or an empty-prefix trending panel can overload one shard. Use edge caching, replicate very hot nodes, cache local responses in each service process, and route hot keys across multiple replicas.
`,
    },
    {
      topic: "Caching, debouncing, and p99 latency",
      detailMD: `
The user experience depends on both client and backend choices. Client debouncing avoids sending a request for every physical keypress. A 100 to 200ms debounce, minimum prefix length, stale request cancellation, and response ordering logic prevent unnecessary work and UI flicker.

On the backend, cache the hottest generic prefixes at the edge for short TTLs, then use in-process or Redis caches for repeated regional requests. Cache keys should include normalized prefix, locale, device class if it changes ranking, and a flag for generic versus personalized mode.

A realistic p99 budget is under 100ms end to end: network and TLS around 20ms, edge or gateway around 5 to 10ms, trie lookup under 5ms, reranking and filtering under 15ms, serialization under 5ms, and tail headroom. Do not synchronously wait for logging or analytics.
`,
    },
    {
      topic: "Fuzzy matching and real-time trends",
      detailMD: `
Typo tolerance is useful but dangerous if it slows the common path. For exact prefixes, use the trie. For fuzzy matching, keep separate structures such as deletion dictionaries, character n-gram indexes, phonetic keys, or edit-distance automata over only high-frequency terms. Trigger fuzzy lookup only when exact-prefix results are weak or the prefix is long enough.

Real-time trends should be an overlay, not a full trie mutation on every event. The trend updater can maintain recent counts in short windows, compare them to a baseline, and produce boosts or insertions that expire quickly. Safety and spam filters must run before any trend appears to users.

Batch rebuilds provide stable global quality, while trend overlays provide freshness. The interview tradeoff is consistency versus speed: daily or hourly snapshots are easier to reason about, but trending topics require controlled, reversible, small updates between snapshots.
`,
    },
  ],
  scaling: [
    {
      stage: "Prototype: one service and one in-memory trie",
      detailMD: `
Start with a single service loading a trie from a file built from recent query logs. Store top 10 completions at prefix nodes, use simple popularity ranking, and log events asynchronously. This proves prefix matching, ranking shape, and UI behavior.
`,
    },
    {
      stage: "Growth: cache and periodic rebuilds",
      detailMD: `
Add Redis or in-process caches for hot prefixes, run scheduled rebuilds from logs, introduce locale-specific tries, and add a safe rollout process with versioned snapshots. Client debouncing and minimum prefix lengths become important as traffic grows.
`,
    },
    {
      stage: "Large scale: sharded trie serving fleet",
      detailMD: `
Shard the trie by locale and prefix, keep shards in memory across a fleet, route requests through a prefix router, replicate hot shards, and isolate autocomplete from the full search backend. Add strict p99 SLOs and load shedding for abusive clients.
`,
    },
    {
      stage: "Global scale: edge caching and regional snapshots",
      detailMD: `
Deploy the serving fleet in multiple regions, cache generic hot prefixes at the CDN, distribute immutable snapshots through object storage, and route users to the closest healthy region. Rollouts should be gradual per locale and per region.
`,
    },
    {
      stage: "Extreme scale: personalization and real-time overlays",
      detailMD: `
Add low-latency user features, context-aware reranking, trend overlays, fuzzy matching indexes, A/B experimentation, and safety automation. Keep all advanced layers optional so the system can fall back to global prefix suggestions.
`,
    },
  ],
  bottlenecks: [
    {
      issue: "Hot prefixes overload one shard",
      optimizationMD: `
Replicate top-level and celebrity prefixes, cache hot generic responses at the edge, keep local process caches, and route hot keys across multiple shard replicas. Monitor QPS by prefix, not only by host.
`,
    },
    {
      issue: "Trie memory grows too large",
      optimizationMD: `
Use compressed tries or finite-state transducers, store ids instead of strings, threshold rare prefixes, limit top-k size, split by locale, and avoid storing personalized candidates inside the global trie.
`,
    },
    {
      issue: "Fuzzy matching explodes candidate count",
      optimizationMD: `
Run exact prefix lookup first. Use fuzzy lookup only for long prefixes or weak exact results, cap edit distance, restrict to high-frequency terms, and keep fuzzy indexes separate from the hot exact-prefix trie.
`,
    },
    {
      issue: "Personalization store adds tail latency",
      optimizationMD: `
Use short deadlines, colocate feature caches with serving regions, store compact recent features, and fall back to global ranking on timeout. Never make personalized reranking a hard dependency for suggestions.
`,
    },
    {
      issue: "Offline build cannot finish in time",
      optimizationMD: `
Incrementally aggregate logs by time window, use distributed processing, precompute term scores before prefix expansion, parallelize shard writing, and validate each shard independently before publishing the manifest.
`,
    },
    {
      issue: "Event logging backpressure affects serving",
      optimizationMD: `
Publish events asynchronously with bounded queues, sample low-value impressions if needed, and drop non-critical analytics under severe pressure. Serving suggestions is more important than perfect logging.
`,
    },
  ],
  failureHandling: [
    {
      scenario: "Trie shard process crashes",
      strategyMD: `
The prefix router removes the replica from rotation after health checks fail and routes to another replica. Hosts should load shards from immutable snapshots on restart and warm before accepting traffic.
`,
    },
    {
      scenario: "Bad snapshot or ranking regression",
      strategyMD: `
Canary new snapshots by locale and traffic percentage, compare click-through and latency metrics, run synthetic prefix probes, and keep the previous manifest loaded or quickly reloadable for rollback.
`,
    },
    {
      scenario: "Personalization store unavailable",
      strategyMD: `
Serve non-personalized global suggestions, mark the response source accordingly, and emit degradation metrics. The user experience should remain functional even if relevance is less tailored.
`,
    },
    {
      scenario: "Edge cache outage",
      strategyMD: `
Route requests to regional serving clusters and rely on in-process caches and trie shards. Apply rate limits for anonymous traffic if regional QPS rises sharply after the edge layer fails.
`,
    },
    {
      scenario: "Query log queue backlog",
      strategyMD: `
Continue serving from the active snapshot. Buffer events for a bounded time, scale consumers, and accept that future ranking freshness may degrade. Do not block autocomplete responses on log ingestion.
`,
    },
    {
      scenario: "Trend overlay produces unsafe suggestions",
      strategyMD: `
Use emergency suppression rules, require safety filters before overlay publication, keep trend deltas small and expiring, and provide a kill switch that disables the overlay without unloading the base trie.
`,
    },
  ],
  security: [
    {
      label: "Sensitive query suppression",
      detailMD: `
Autocomplete can leak what other users searched for. Suppress rare queries, health, financial, adult, private identifiers, credentials, and policy-violating terms. Use minimum unique-user thresholds before any query becomes globally suggestible.
`,
    },
    {
      label: "Privacy-preserving logs",
      detailMD: `
Hash or tokenize user identifiers, minimize raw query retention, enforce access controls, and aggregate before sharing with ranking jobs. Personalized suggestions should not be written into globally cached responses.
`,
    },
    {
      label: "Abuse and spam resistance",
      detailMD: `
Attackers may try to stuff query logs to make spam appear in suggestions. Detect bots, weight unique users more than raw counts, apply reputation filters, and require sustained acceptance before boosting a term.
`,
    },
    {
      label: "Rate limiting",
      detailMD: `
Apply per-IP, per-device, per-session, and anonymous traffic limits. Prefix endpoints are cheap individually but can be abused for scraping, enumeration, or denial-of-service attacks.
`,
    },
    {
      label: "Cache isolation",
      detailMD: `
Shared edge caches should store only generic suggestions. Responses that depend on user context, account state, network, or private history must use private cache controls or bypass the CDN cache.
`,
    },
    {
      label: "Input normalization safety",
      detailMD: `
Normalize Unicode, reject control characters, cap prefix length, and defend downstream logs and dashboards from injection through suggestion text. Render suggestions as text, not trusted HTML.
`,
    },
  ],
  tradeoffs: {
    pros: [
      "Precomputed top-k lists make exact-prefix serving extremely fast and predictable.",
      "In-memory trie shards avoid remote database reads on the typing path.",
      "Batch snapshots provide stable ranking quality and safe rollbacks.",
      "A real-time overlay adds freshness without constantly rebuilding the full trie.",
      "Edge caching and client debouncing reduce peak backend load substantially.",
    ],
    cons: [
      "Storing top-k lists at many prefix nodes increases memory footprint.",
      "Batch snapshots can be stale for breaking trends unless an overlay is added.",
      "Personalization complicates caching and privacy controls.",
      "Fuzzy matching can become expensive if it is not carefully gated.",
      "Prefix sharding must handle heavy skew for very short or popular prefixes.",
    ],
    alternativesMD: `
Alternative one is to call the full search engine for each prefix. It is simple to explain but usually too slow and expensive because search ranking, retrieval, and blending are heavier than autocomplete needs.

Alternative two is a relational or key-value lookup per prefix using a precomputed prefix_topk table. It can work at moderate scale, but network and database tail latency are worse than local memory and high-QPS hot prefixes can overload partitions.

Alternative three is a pure cache of popular prefixes without a trie. It is cheap and fast for head traffic but has poor coverage for the long tail and makes fuzzy matching, locale support, and rebuild validation harder.
`,
    whenNotToUseMD: `
Do not overbuild autocomplete for a small internal product with low query volume and no strict latency target. A simple database query, full-text search prefix query, or hosted search service may be enough until traffic and relevance requirements justify a dedicated trie serving system.
`,
  },
  followUpQuestions: [
    {
      question: "Why not query the main search engine on every keystroke?",
      answerMD: `
The main search engine is optimized for final submitted queries, not hundreds of thousands of tiny prefix requests per second. Autocomplete needs a small set of precomputed candidates with lower latency, lower cost, and predictable p99 behavior.
`,
    },
    {
      question: "How do you store top-k suggestions in the trie?",
      answerMD: `
Each prefix node stores a compact ordered list of suggestion ids and scores. The full display strings and metadata live in a separate term table. This avoids scanning descendants at request time and keeps response generation bounded.
`,
    },
    {
      question: "How do you personalize without leaking private data?",
      answerMD: `
Start from globally safe candidates, then rerank them with private user features inside the serving service. Do not insert rare private queries into shared global tries or edge caches, and fall back to global ranking when user features are unavailable.
`,
    },
    {
      question: "How do batch rebuilds and real-time trends work together?",
      answerMD: `
Batch rebuilds produce stable, validated snapshots from large log windows. Real-time trends are small expiring overlays that boost or insert fast-moving suggestions between rebuilds. The overlay should be bounded, filtered, and easy to disable.
`,
    },
    {
      question: "How do you handle typos?",
      answerMD: `
Use exact-prefix lookup first. If it returns weak results and the prefix is long enough, query a separate fuzzy structure such as deletion variants, n-grams, or edit-distance automata over frequent terms. Cap candidate count and edit distance.
`,
    },
    {
      question: "How do you shard the trie?",
      answerMD: `
Partition by locale and then by prefix range or prefix hash. Prefix ranges preserve compression and locality, while hashing improves load balance. Replicate hot prefixes and route around unhealthy replicas.
`,
    },
    {
      question: "What should be cached at the edge?",
      answerMD: `
Cache only generic, non-personalized hot prefixes with short TTLs. Include locale and device class in the cache key if they affect ranking. Personalized responses should bypass shared caches or be marked private.
`,
    },
  ],
  companyVariations: [
    {
      company: "Google",
      angleMD: `
Google interviewers are likely to push on global scale, trie compression, tail latency, query-log pipelines, spam resistance, freshness, and multilingual ranking. Be ready to explain why top-k is stored at trie nodes and how trends are overlaid safely.
`,
    },
    {
      company: "Amazon",
      angleMD: `
Amazon may frame autocomplete around product search and conversion. Expect discussion of marketplace abuse, sponsored or business signals, regional traffic peaks, DynamoDB or S3-backed build pipelines, and cost-aware caching of hot prefixes.
`,
    },
    {
      company: "LinkedIn",
      angleMD: `
LinkedIn often emphasizes people, jobs, companies, and skills rather than only query strings. Discuss personalization from the professional graph, privacy boundaries, entity blending, and ranking suggestions differently for recruiters, job seekers, and feed search.
`,
    },
  ],
  relatedQuestions: [
    {
      slug: "google-search",
      note: "Autocomplete is the low-latency prefix companion to full search retrieval and ranking.",
    },
    {
      slug: "distributed-cache",
      note: "Hot prefixes and generic responses rely heavily on cache TTLs, hit ratios, and hot-key handling.",
    },
    {
      slug: "key-value-store",
      note: "Precomputed prefix top-k tables and snapshot manifests can be modeled as compact key-value data before serving from memory.",
    },
    {
      slug: "rate-limiter",
      note: "Autocomplete endpoints need protection from scraping, prefix enumeration, and bot-generated ranking manipulation.",
    },
  ],
  interviewTips: {
    commonMistakes: [
      "Querying the full search backend for every keystroke without discussing cost or p99 latency.",
      "Using a trie but forgetting to store top-k completions at prefix nodes.",
      "Ignoring client-side debouncing and stale response cancellation.",
      "Putting private personalized suggestions into shared caches.",
      "Treating raw frequency as ranking without spam, safety, recency, or acceptance signals.",
      "Rebuilding or mutating the global trie synchronously for every trending event.",
    ],
    redFlags: [
      "No concrete QPS, prefix cardinality, or memory footprint estimates.",
      "No clear separation between offline build pipeline and online serving path.",
      "No plan for hot prefixes such as one-character or viral queries.",
      "No privacy or sensitive-query suppression strategy.",
      "No rollback plan for a bad snapshot or ranking model.",
    ],
    expectations: [
      "State assumptions and compute autocomplete QPS from final search volume and debounce behavior.",
      "Draw an in-memory sharded trie serving fleet with edge caching and async logging.",
      "Explain top-k at each prefix node and why it avoids descendant scans.",
      "Discuss ranking using popularity, recency, personalization, and safety filters.",
      "Cover batch snapshot rebuilds plus a bounded real-time trend overlay.",
      "Address fuzzy matching, hot-prefix sharding, privacy, and p99 latency budget.",
    ],
    communicationMD: `
Lead with the interactive latency constraint: autocomplete has to respond while the user is typing, so the serving path must be memory-first and predictable. Then introduce the trie with precomputed top-k nodes, sharding, cache layers, and the offline pipeline that creates snapshots.

When discussing ranking, separate candidate generation from reranking. Candidate generation should be fast and safe from the trie; reranking can blend personalization and trends under strict timeouts. Tie every advanced feature back to graceful fallback, because the global top-k list should still work when personalization, trends, or logging degrade.
`,
  },
  revisionNotesMD: `
- Autocomplete serves multiple prefix requests per final search, so QPS is much higher than submitted search QPS.
- Client debouncing, minimum prefix length, and cancellation are part of the system design, not just UI polish.
- Use a trie, radix tree, or finite-state transducer for prefix matching, and store precomputed top-k completions at prefix nodes.
- Exact-prefix serving should be a memory lookup: normalize prefix, route to shard, walk the trie, read the top-k array, rerank, filter, and return.
- At 200M daily users and five searches per user, expect 1B final searches per day. With three debounced autocomplete requests per search, expect about 3B autocomplete requests per day, about 35,000 average QPS, and about 350,000 peak global QPS.
- Plan for around 30M indexed hot prefixes and about 120 GB of compressed trie, top-k arrays, metadata, and rollout headroom per region.
- Cache generic hot prefixes at the edge, but never put private personalized suggestions into shared caches.
- Batch rebuilds provide stable ranking from query logs; real-time overlays provide freshness for trends without constantly rebuilding the full trie.
- Ranking should combine popularity, unique users, acceptance rate, click-through, recency, personalization, locale, diversity, and safety.
- Fuzzy matching should be separate and gated so typo tolerance does not slow the common exact-prefix path.
`,
  flashcards: [
    {
      front: "Why is autocomplete higher QPS than search?",
      back: "Each final search can create multiple debounced prefix requests while the user types, commonly around three backend autocomplete requests per submitted query.",
    },
    {
      front: "What does each trie prefix node store?",
      back: "A precomputed top-k list of suggestion ids and scores, so serving does not scan all descendants under the prefix.",
    },
    {
      front: "Why serve trie shards from memory?",
      back: "Autocomplete has a tight p99 latency target and high QPS, so remote database lookups on every keystroke add too much tail latency and cost.",
    },
    {
      front: "How does personalization fit safely?",
      back: "Start from globally safe candidates, rerank with private user features under strict timeouts, and fall back to global suggestions when features are unavailable.",
    },
    {
      front: "What is the role of the offline pipeline?",
      back: "It aggregates query logs, filters unsafe or spammy terms, computes scores, builds top-k prefix lists, and publishes immutable trie snapshots.",
    },
    {
      front: "How should real-time trends be handled?",
      back: "Use a small expiring overlay of boosts or insertions between batch snapshots, guarded by safety filters and a kill switch.",
    },
    {
      front: "Why is edge caching tricky?",
      back: "Generic hot prefixes are cacheable, but personalized responses can leak private context if stored in shared CDN caches.",
    },
    {
      front: "When should fuzzy matching run?",
      back: "Only when exact-prefix results are weak or the prefix is long enough, using separate bounded fuzzy indexes over frequent terms.",
    },
  ],
  quiz: [
    {
      question: "Why store top-k completions at trie nodes?",
      options: ["To avoid scanning all descendants for each prefix", "To make query logs unnecessary", "To remove the need for ranking", "To force every request to hit the database"],
      answerIndex: 0,
      explanationMD: `
The trie locates the prefix node quickly, but without stored top-k lists the system would still need to scan many descendants for common prefixes. Precomputed top-k arrays bound request work.
`,
    },
    {
      question: "With 3B autocomplete requests per day, what is the approximate average QPS?",
      options: ["3,500 requests per second", "35,000 requests per second", "350,000 requests per second", "3.5M requests per second"],
      answerIndex: 1,
      explanationMD: `
3B divided by 86,400 seconds is about 34,700 requests per second, rounded to 35,000.
`,
    },
    {
      question: "Which response is safest to cache at a shared CDN edge?",
      options: ["A personalized response based on recent private searches", "A generic response for a hot prefix and locale", "A response containing account-specific job recommendations", "A response with unfiltered rare queries"],
      answerIndex: 1,
      explanationMD: `
Generic hot-prefix responses can be cached briefly. Personalized or rare-query responses can leak private context and should not be stored in shared caches.
`,
    },
    {
      question: "What should happen if the personalization store times out?",
      options: ["Fail the autocomplete request", "Serve global suggestions and record degradation", "Block until the store recovers", "Rebuild the trie synchronously"],
      answerIndex: 1,
      explanationMD: `
Personalization should improve relevance but not be required for availability. The global top-k list is the fallback.
`,
    },
    {
      question: "What is the best way to handle fast-moving trends?",
      options: ["Mutate every trie node synchronously per event", "Use a bounded real-time overlay between batch snapshots", "Disable all batch rebuilds", "Only update suggestions once per year"],
      answerIndex: 1,
      explanationMD: `
Batch snapshots provide stable quality, while a small expiring overlay can safely add trend freshness without constantly rebuilding the full trie.
`,
    },
    {
      question: "When should fuzzy matching be invoked?",
      options: ["For every prefix before exact lookup", "Only when exact results are weak or the prefix is long enough", "Only during snapshot rollback", "Never, because typos are impossible"],
      answerIndex: 1,
      explanationMD: `
Fuzzy matching can be expensive. Run exact-prefix lookup first and gate fuzzy work to cases where it is likely to improve results.
`,
    },
    {
      question: "Which signal is most suspicious if used alone for ranking?",
      options: ["Raw query frequency", "Accepted suggestion rate", "Locale match", "Safety status"],
      answerIndex: 0,
      explanationMD: `
Raw frequency can be manipulated by bots and can contain spam or unsafe terms. Ranking should combine multiple quality, safety, and engagement signals.
`,
    },
  ],
  cheatSheetMD: `
**Goal**: return useful typeahead suggestions while the user is typing, with backend p99 under about 50ms and user-perceived latency under 100ms.

**Workload**: final search QPS is not enough. Estimate autocomplete requests as final searches times debounced prefix calls per search. With 1B final searches per day and three autocomplete calls per search, expect about 3B requests per day, 35,000 average QPS, and 350,000 peak global QPS.

**Core data structure**: use a trie, radix tree, or finite-state transducer. Each prefix node stores precomputed top-k suggestion ids and scores. Full strings and metadata live in a compact suggestion table.

**Serving path**: client debounce to edge cache to load balancer to autocomplete service to prefix router to in-memory trie shard. The service reranks, filters, serializes, returns, and logs asynchronously.

**Ranking**: combine popularity, unique users, acceptance rate, click-through, recency, personalization, locale, entity type, diversity, and safety. Raw frequency alone is not enough.

**Pipeline**: query logs feed batch aggregation. The builder normalizes, filters, scores, expands terms into prefixes, builds trie shards, writes immutable snapshots, verifies checksums, and rolls out gradually.

**Freshness**: use stable batch snapshots for quality and a bounded real-time trend overlay for breaking topics. Keep overlays expiring, filtered, and easy to disable.

**Scale**: shard by locale and prefix. Keep shards in memory. Replicate hot prefixes, cache generic hot responses at the edge, and use short deadlines for personalization.

**Fuzzy matching**: keep it separate from exact prefix lookup. Use edit-distance, deletion, phonetic, or n-gram structures only when exact results are weak.

**Privacy and safety**: suppress rare or sensitive queries, hash identifiers in logs, protect shared caches from personalized data, rate-limit scraping, and provide emergency suppression rules.
`,
  references: [
    {
      title: "The Tail at Scale",
      kind: "Paper",
      url: "https://research.google/pubs/the-tail-at-scale/",
      author: "Jeffrey Dean and Luiz Andre Barroso",
    },
    {
      title: "Designing Data-Intensive Applications",
      kind: "Book",
      author: "Martin Kleppmann",
    },
    {
      title: "Introduction to Information Retrieval",
      kind: "Book",
      url: "https://nlp.stanford.edu/IR-book/",
      author: "Christopher D. Manning, Prabhakar Raghavan, and Hinrich Schutze",
    },
    {
      title: "Apache Lucene Suggesters",
      kind: "Docs",
      url: "https://lucene.apache.org/core/",
      author: "Apache Lucene",
    },
    {
      title: "Weighted Finite-State Transducers in Speech Recognition",
      kind: "Paper",
      author: "Mehryar Mohri, Fernando Pereira, and Michael Riley",
    },
  ],
};
