import type { SDQuestionContent } from "../types";

export const loggingSystemContent: SDQuestionContent = {
  slug: "logging-system",
  statementMD: `
Design a centralized Logging System like Elasticsearch, Logstash, Kibana, OpenSearch, or Grafana Loki. Applications and infrastructure running across many hosts emit structured logs, local agents collect them, and the platform must ingest, retain, search, and analyze those logs for debugging, auditing, and incident response.

At interview scale, assume hundreds of thousands of hosts, millions of log events per second, bursty traffic during incidents, and hundreds of terabytes to petabytes of logs per day. The hard part is not accepting a single log line; it is decoupling producers from indexing, applying backpressure without losing critical data, choosing what to index, controlling storage cost, enforcing tenant isolation, and making recent logs searchable fast enough for live debugging.

The default design should optimize for durable high-throughput ingestion, predictable query latency over recent data, and cost-aware retention. It should also make explicit tradeoffs between Elasticsearch-style full-text indexing and Loki-style label indexing with compressed chunks in object storage.
`,
  businessUseCaseMD: `
Logs are the forensic record of a production system. Engineers use them to debug incidents, security teams use them for audits and investigations, and operators use them to understand deployments, customer impact, and error patterns.

A strong logging platform reduces mean time to detect and recover by letting teams search recent events quickly, correlate logs with traces and metrics, and preserve older logs for compliance at lower cost. It is also a shared infrastructure service, so multi-tenancy, quota enforcement, and noisy-neighbor protection are product requirements, not afterthoughts.
`,
  functionalRequirements: [
    "Collect logs from hosts, containers, serverless workloads, and managed services through agents or direct APIs.",
    "Accept structured JSON logs and support parsing of common unstructured text formats.",
    "Durably buffer incoming logs so indexing outages or traffic spikes do not immediately drop data.",
    "Enrich events with tenant, service, environment, host, region, trace_id, deployment version, and severity metadata.",
    "Index recent logs for search by time range, labels, fields, and free text depending on the chosen backend.",
    "Support tailing live logs, historical search, aggregation by fields, and export for investigations.",
    "Apply per-tenant retention policies across hot, warm, and cold storage tiers.",
    "Enforce tenant access control, quotas, sampling, and rate limits under log storms.",
  ],
  nonFunctionalRequirements: [
    {
      label: "Ingestion throughput",
      detailMD: `
The system must sustain millions of events per second and tolerate 5x to 10x bursts during incidents. Ingestion should be horizontally scalable by tenant, topic, partition, and index shard.
`,
    },
    {
      label: "Durability",
      detailMD: `
Accepted critical logs should survive gateway, worker, and index cluster failures. Acknowledgement should happen only after a durable append to Kafka or an equivalent replicated buffer, while lower-priority debug logs may be sampled or dropped under explicit policy.
`,
    },
    {
      label: "Query latency",
      detailMD: `
Recent debugging queries over a bounded time range should return first results in under 2 seconds p95 and complete common searches in under 10 seconds. Very broad historical searches should run as asynchronous jobs with progress and partial results.
`,
    },
    {
      label: "Availability",
      detailMD: `
Ingestion availability is more important than interactive search during incidents. The design should continue accepting logs when indexing is degraded, and search should degrade by tier or time range rather than failing globally.
`,
    },
    {
      label: "Cost efficiency",
      detailMD: `
Full-text indexing every field forever is too expensive at petabyte scale. Use hot indexes for recent data, warm lower-cost nodes or reduced replicas for older searchable data, and compressed object storage for long-term cold retention.
`,
    },
    {
      label: "Multi-tenancy isolation",
      detailMD: `
One noisy tenant or runaway service must not consume all ingestion, index, or query capacity. Enforce per-tenant quotas, separate high-value tenants where needed, isolate Kafka partitions and index namespaces, and budget query fan-out.
`,
    },
    {
      label: "Freshness and ordering",
      detailMD: `
Logs should usually be searchable within seconds of being emitted. Global ordering is not required, but per-stream ordering should be preserved where practical, and late or out-of-order events must still be indexed into the correct time bucket.
`,
    },
  ],
  capacityEstimation: {
    assumptionsMD: `
Assume 200,000 hosts across production, staging, and shared infrastructure. Each host emits 10 log events per second on average, with a 5x incident burst. Average event size is 1 KB before compression, including timestamp, service, severity, message, labels, trace_id, and request context.

Assume one Kafka replica factor of 3, four-to-one compression for long-term object storage, one hot full-text searchable tier for 7 days, one warm searchable tier for 23 additional days, and one cold object-storage tier for 365 days. Hot full-text indexing is estimated at 1.5x raw event size for primary index structures and one replica for availability.
`,
    metrics: [
      {
        label: "Average event rate",
        value: "2M events per second",
        note: "200,000 hosts times 10 events per second",
      },
      {
        label: "Peak event rate",
        value: "10M events per second",
        note: "5x burst during incidents or bad deployments",
      },
      {
        label: "Events per day",
        value: "172.8B events",
        note: "2M events per second times 86,400 seconds",
      },
      {
        label: "Raw ingest volume",
        value: "173 TB per day",
        note: "172.8B events times 1 KB each",
      },
      {
        label: "Peak ingest bandwidth",
        value: "10 GB per second raw",
        note: "10M events per second times 1 KB",
      },
      {
        label: "Kafka retained buffer",
        value: "1.6 PB for 72 hours",
        note: "173 TB per day times 3 days times 3 replicas before compression savings",
      },
      {
        label: "Hot searchable storage",
        value: "3.6 PB for 7 days",
        note: "173 TB per day times 1.5 index expansion times 2 copies times 7 days",
      },
      {
        label: "Cold object storage",
        value: "15.8 PB for 365 days",
        note: "173 TB per day divided by 4 compression times 365 days",
      },
      {
        label: "Kafka partitions",
        value: "400 to 600 partitions",
        note: "Enough headroom for 10 GB per second peak at about 20 to 30 MB per second per partition",
      },
      {
        label: "Index shards per hot day",
        value: "1,000 to 2,000 primary shards",
        note: "Keeps shard sizes near 100 to 200 GB before replicas and allows tenant isolation",
      },
    ],
    calculationsMD: `
- Event rate: 200,000 hosts times 10 events per second is 2,000,000 events per second average.
- Daily events: 2,000,000 events per second times 86,400 seconds is 172,800,000,000 events per day.
- Raw volume: 172.8B events times 1 KB is about 172.8 TB per day, rounded to 173 TB per day.
- Peak bandwidth: 10M events per second during a 5x burst times 1 KB is 10 GB per second before protocol overhead.
- Kafka buffer: keeping 72 hours of raw data at 173 TB per day is 519 TB. With three replicas, reserve roughly 1.6 PB before compression and operational headroom.
- Hot index: full-text indexing can cost about 1.5 times raw size for primary data. One replica doubles it, so 173 TB times 1.5 times 2 is about 519 TB per hot day. Seven days is about 3.6 PB.
- Cold storage: object storage with four-to-one compression stores 173 TB divided by 4, or about 43.25 TB per day. One year is about 15.8 PB.
- Partitions: if a Kafka partition safely handles about 20 to 30 MB per second sustained in this workload, 10 GB per second peak needs about 334 to 500 partitions. Choose 400 to 600 plus tenant-aware partitioning.
- Shards: if one hot primary shard should stay near 100 to 200 GB, a 173 TB raw day expanded to about 260 TB primary index data needs roughly 1,300 to 2,600 shards. With tenant and tier optimization, plan around 1,000 to 2,000 primary shards per hot day and adjust based on measured shard size.
`,
  },
  apiDesign: {
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/logs/batch",
        descriptionMD: `
Ingests a compressed batch of logs from an agent, collector, or service. The gateway authenticates the tenant, validates the batch envelope, applies quotas, and appends accepted records to the durable buffer.
`,
        request: `
{
  "tenantId": "tenant_123",
  "source": "checkout-api",
  "format": "json",
  "compression": "gzip",
  "events": [
    {
      "timestamp": "2026-07-26T06:59:19Z",
      "level": "ERROR",
      "message": "payment authorization failed",
      "trace_id": "trc_abc123",
      "region": "us-east-1"
    }
  ]
}
`,
        response: `
{
  "accepted": 10000,
  "rejected": 3,
  "bufferOffset": "logs-prod-128:88420201",
  "retryAfterMs": 0
}
`,
        statusCodes: [
          { code: 202, meaning: "Batch durably accepted for processing" },
          { code: 400, meaning: "Invalid batch, schema, timestamp, or compression" },
          { code: 401, meaning: "Authentication failed" },
          { code: 413, meaning: "Batch exceeds size limit" },
          { code: 429, meaning: "Tenant or source rate limit exceeded" },
          { code: 503, meaning: "Ingestion temporarily unavailable" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/search",
        descriptionMD: `
Runs a bounded log search over recent or historical data. Small recent searches may complete synchronously; expensive searches return a job identifier and stream partial results.
`,
        request: `
{
  "tenantId": "tenant_123",
  "query": "level:ERROR service:checkout-api authorization",
  "startTime": "2026-07-26T06:00:00Z",
  "endTime": "2026-07-26T07:00:00Z",
  "limit": 200,
  "mode": "auto"
}
`,
        response: `
{
  "mode": "sync",
  "results": [
    {
      "timestamp": "2026-07-26T06:59:19Z",
      "service": "checkout-api",
      "level": "ERROR",
      "message": "payment authorization failed"
    }
  ],
  "nextCursor": "cursor_001",
  "scannedBytes": 734003200
}
`,
        statusCodes: [
          { code: 200, meaning: "Search completed synchronously" },
          { code: 202, meaning: "Search job accepted for asynchronous execution" },
          { code: 400, meaning: "Invalid query or time range" },
          { code: 403, meaning: "Caller lacks access to tenant or fields" },
          { code: 429, meaning: "Query budget exceeded" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/search/jobs/{jobId}",
        descriptionMD: `
Returns progress and partial results for a long-running historical query. The query service uses this endpoint when a search spans cold storage, many shards, or a large time window.
`,
        response: `
{
  "jobId": "job_789",
  "status": "running",
  "progressPercent": 64,
  "partialResultCount": 10000,
  "scannedBytes": 3298534883328,
  "expiresAt": "2026-07-26T08:00:00Z"
}
`,
        statusCodes: [
          { code: 200, meaning: "Job status returned" },
          { code: 403, meaning: "Caller cannot access this job" },
          { code: 404, meaning: "Job not found or expired" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/tail",
        descriptionMD: `
Streams near-real-time logs for a tenant, service, or label selector. This is optimized for debugging active incidents and should have stricter time and result limits than historical search.
`,
        request: `
tenantId=tenant_123&selector=service:checkout-api level:ERROR&follow=true
`,
        response: `
event: log
data: {"timestamp":"2026-07-26T06:59:21Z","level":"ERROR","message":"retry budget exhausted"}
`,
        statusCodes: [
          { code: 200, meaning: "Stream opened" },
          { code: 400, meaning: "Invalid selector" },
          { code: 403, meaning: "Caller lacks access" },
          { code: 429, meaning: "Too many active streams" },
        ],
      },
      {
        method: "PUT",
        path: "/api/v1/tenants/{tenantId}/retention-policy",
        descriptionMD: `
Creates or updates retention, indexing, sampling, and storage-tier policies for a tenant. Policy changes apply to new data immediately and to older data through lifecycle jobs.
`,
        request: `
{
  "hotDays": 7,
  "warmDays": 30,
  "coldDays": 365,
  "indexMode": "full_text_for_errors_label_index_for_debug",
  "samplingRules": [
    { "level": "DEBUG", "sampleRate": 0.1 }
  ]
}
`,
        response: `
{
  "tenantId": "tenant_123",
  "version": 42,
  "status": "active"
}
`,
        statusCodes: [
          { code: 200, meaning: "Policy updated" },
          { code: 400, meaning: "Invalid retention or sampling rule" },
          { code: 403, meaning: "Caller is not a tenant administrator" },
          { code: 409, meaning: "Policy version conflict" },
        ],
      },
    ],
    notesMD: `
The ingest API should acknowledge durable buffering, not full indexing. Search APIs must require a tenant, a bounded time range, and a query budget so one broad query cannot fan out across every shard and object-storage partition.
`,
  },
  databaseDesign: {
    schemaMD: `
Raw logs do not belong in a single relational database. Treat the relational schema as the control plane for tenants, streams, policies, and audit history. The data plane stores events in Kafka, hot search indexes, compressed chunks, and object storage.

The central modeling decision is the index namespace. Elasticsearch-style systems usually create time-partitioned indexes by tenant, service, and day. Loki-style systems store compressed chunks keyed by tenant and label set, while a smaller index maps labels and time ranges to chunks.
`,
    tables: [
      {
        name: "tenants",
        columns: [
          { name: "tenant_id", type: "varchar(64)", note: "Primary key for isolation, quotas, and billing" },
          { name: "name", type: "varchar(255)", note: "Display name" },
          { name: "plan", type: "varchar(32)", note: "Free, enterprise, internal, or regulated" },
          { name: "ingest_quota_bytes_per_day", type: "bigint", note: "Daily accepted ingest budget" },
          { name: "query_quota_bytes_per_day", type: "bigint", note: "Daily scanned-byte budget" },
          { name: "created_at", type: "timestamp", note: "Tenant creation time" },
          { name: "status", type: "varchar(20)", note: "Active, suspended, or deleted" },
        ],
      },
      {
        name: "log_streams",
        columns: [
          { name: "stream_id", type: "varchar(128)", note: "Stable id for tenant, service, environment, and label set" },
          { name: "tenant_id", type: "varchar(64)", note: "Owning tenant" },
          { name: "service", type: "varchar(255)", note: "Application or infrastructure component" },
          { name: "environment", type: "varchar(64)", note: "Production, staging, development, or custom" },
          { name: "labels", type: "json", note: "Indexed labels with bounded cardinality" },
          { name: "created_at", type: "timestamp", note: "First seen time" },
          { name: "last_seen_at", type: "timestamp", note: "Most recent event time" },
        ],
      },
      {
        name: "index_segments",
        columns: [
          { name: "segment_id", type: "varchar(128)", note: "Index shard, Loki chunk group, or object prefix id" },
          { name: "tenant_id", type: "varchar(64)", note: "Tenant owner" },
          { name: "tier", type: "varchar(20)", note: "Hot, warm, or cold" },
          { name: "start_time", type: "timestamp", note: "Inclusive segment start" },
          { name: "end_time", type: "timestamp", note: "Exclusive segment end" },
          { name: "storage_uri", type: "text", note: "Search index name or object storage prefix" },
          { name: "bytes", type: "bigint", note: "Compressed or indexed size" },
          { name: "status", type: "varchar(20)", note: "Open, sealed, compacting, searchable, or expired" },
        ],
      },
      {
        name: "retention_policies",
        columns: [
          { name: "tenant_id", type: "varchar(64)", note: "Primary key or part of a versioned key" },
          { name: "policy_version", type: "int", note: "Monotonic version for safe updates" },
          { name: "hot_days", type: "int", note: "Days in low-latency searchable tier" },
          { name: "warm_days", type: "int", note: "Additional days in cheaper searchable tier" },
          { name: "cold_days", type: "int", note: "Days retained in object storage" },
          { name: "index_mode", type: "varchar(64)", note: "Full-text, label-only, hybrid, or compliance mode" },
          { name: "sampling_rules", type: "json", note: "Priority-aware sampling and drop rules" },
          { name: "updated_at", type: "timestamp", note: "Last policy update time" },
        ],
      },
      {
        name: "query_audit_logs",
        columns: [
          { name: "query_id", type: "varchar(128)", note: "Primary key" },
          { name: "tenant_id", type: "varchar(64)", note: "Tenant being queried" },
          { name: "user_id", type: "varchar(128)", note: "Caller identity" },
          { name: "query_text_hash", type: "varchar(128)", note: "Hash of query text for audit without storing secrets unnecessarily" },
          { name: "time_range_start", type: "timestamp", note: "Query lower bound" },
          { name: "time_range_end", type: "timestamp", note: "Query upper bound" },
          { name: "scanned_bytes", type: "bigint", note: "Budget and billing input" },
          { name: "created_at", type: "timestamp", note: "Query submission time" },
        ],
      },
    ],
    indexesMD: `
- **tenants.tenant_id** is the primary key for control-plane lookups.
- **log_streams.tenant_id, service, environment** supports stream discovery and label validation.
- **index_segments.tenant_id, start_time, end_time, tier** supports query planning by tenant and time range.
- **retention_policies.tenant_id, policy_version** supports safe policy updates and rollbacks.
- **query_audit_logs.tenant_id, created_at** supports compliance review and quota analysis.
`,
    relationshipsMD: `
Each tenant owns many log streams, retention policies, index segments, and query audit rows. Index segments are the catalog entries that tell the query planner where data lives; they point to external search clusters and object storage rather than storing log events in the metadata database.
`,
    noSqlAlternativesMD: `
For the data plane, use Kafka or Pulsar for the durable ingestion buffer, Elasticsearch or OpenSearch for full-text hot search, Loki or a custom chunk store for label-indexed logs, ClickHouse or Druid for analytical aggregation, and S3, GCS, or Azure Blob Storage for compressed cold retention.

The metadata store can be PostgreSQL, MySQL, Spanner, FoundationDB, or DynamoDB depending on consistency and scale needs. It is low-volume compared with the log events, but it is critical for authorization, query planning, and retention enforcement.
`,
  },
  architecture: {
    width: 960,
    height: 560,
    nodes: [
      { id: "log-agents", label: "Log Agents", kind: "client", x: 80, y: 150, sublabel: "Fluentd, Vector, Beats" },
      { id: "engineers", label: "Engineers and Tools", kind: "client", x: 80, y: 405, sublabel: "Kibana, CLI, alerts" },
      { id: "ingest-lb", label: "Ingest Load Balancer", kind: "loadBalancer", x: 230, y: 150, sublabel: "Regional entry" },
      { id: "ingest-gateway", label: "Ingest Gateway", kind: "gateway", x: 390, y: 150, sublabel: "Auth, quotas, batch validation" },
      { id: "kafka-buffer", label: "Durable Buffer", kind: "queue", x: 550, y: 150, sublabel: "Kafka, Pulsar" },
      { id: "pipeline-workers", label: "Pipeline Workers", kind: "worker", x: 710, y: 150, sublabel: "Parse, enrich, route" },
      { id: "search-index", label: "Search Index", kind: "search", x: 870, y: 105, sublabel: "Elasticsearch, OpenSearch" },
      { id: "object-storage", label: "Object Storage", kind: "storage", x: 870, y: 300, sublabel: "Compressed chunks" },
      { id: "query-api", label: "Query API", kind: "service", x: 390, y: 405, sublabel: "Plan, fan out, merge" },
      { id: "metadata-store", label: "Metadata Store", kind: "database", x: 550, y: 405, sublabel: "Tenants, policies, segments" },
      { id: "query-cache", label: "Query Cache", kind: "cache", x: 710, y: 405, sublabel: "Recent results, field stats" },
      { id: "monitoring", label: "Platform Monitoring", kind: "monitoring", x: 550, y: 520, sublabel: "Lag, drops, SLOs" },
    ],
    edges: [
      { from: "log-agents", to: "ingest-lb", label: "batched logs" },
      { from: "ingest-lb", to: "ingest-gateway", label: "route by region" },
      { from: "ingest-gateway", to: "metadata-store", label: "tenant policy" },
      { from: "ingest-gateway", to: "kafka-buffer", label: "durable append" },
      { from: "kafka-buffer", to: "pipeline-workers", label: "consume partitions" },
      { from: "pipeline-workers", to: "search-index", label: "hot index" },
      { from: "pipeline-workers", to: "object-storage", label: "chunks and raw archive" },
      { from: "engineers", to: "query-api", label: "search and tail" },
      { from: "query-api", to: "metadata-store", label: "plan and authorize" },
      { from: "query-api", to: "query-cache", label: "cache lookup" },
      { from: "query-cache", to: "query-api", label: "cached hits" },
      { from: "query-api", to: "search-index", label: "hot and warm query" },
      { from: "query-api", to: "object-storage", label: "cold scan", dashed: true },
      { from: "search-index", to: "object-storage", label: "snapshots", dashed: true },
      { from: "ingest-gateway", to: "monitoring", label: "ingest metrics", dashed: true },
      { from: "pipeline-workers", to: "monitoring", label: "lag and drops", dashed: true },
    ],
    captionMD: `
The ingestion path is agents to load balancer to gateway to durable buffer to parsing workers to search and storage. The query path is engineers to query API to metadata, cache, search indexes, and cold object storage. Kafka decouples producers from indexing so the system can absorb bursts and survive downstream outages.
`,
  },
  architectureNotesMD: `
A production logging system should be designed as two related systems: an ingestion data plane and a query control plane. The ingestion plane accepts huge write volume, validates and rate-limits batches, appends to a durable buffer, and lets asynchronous workers parse, enrich, index, and archive logs. The query plane authorizes users, plans bounded searches, fans out to the right shards or chunks, and merges sorted results.

Kafka or Pulsar is the shock absorber. It allows log agents to receive fast acknowledgements after durable append while indexers can lag, scale out, or fail over. This decoupling is essential during incidents, when the very systems producing errors also produce the most logs.

The search and storage layer should be tiered. Hot data gets expensive low-latency indexing. Warm data may have fewer replicas, slower hardware, or reduced index coverage. Cold data lives as compressed chunks in object storage and is queried through slower asynchronous jobs.
`,
  requestFlow: [
    {
      title: "Agent collects and batches logs",
      detailMD: `
A host-level or sidecar agent tails files, reads stdout from containers, accepts application log streams, and batches events by tenant, service, and time. It adds local metadata such as hostname, pod, region, and source path before sending compressed batches.
`,
    },
    {
      title: "Gateway authenticates and validates",
      detailMD: `
The ingest gateway verifies tenant credentials, validates batch size and timestamps, checks schema rules, rejects obviously malformed events, and applies per-tenant and per-source rate limits. It should return partial acceptance details when only some events are invalid.
`,
    },
    {
      title: "Accepted events are appended to the durable buffer",
      detailMD: `
The gateway partitions events by tenant, stream, or time bucket and appends them to Kafka. It acknowledges the agent only after the broker quorum has accepted the write. This separates producer success from search-index availability.
`,
    },
    {
      title: "Pipeline workers parse and enrich",
      detailMD: `
Consumers read Kafka partitions, parse JSON or configured text formats, normalize fields, redact sensitive values where policy requires it, enrich with deployment and trace metadata, and assign each event to a target index or chunk stream.
`,
    },
    {
      title: "Logs are indexed and archived",
      detailMD: `
Error, warning, audit, and high-value application logs may be full-text indexed in Elasticsearch or OpenSearch. Lower-value high-volume logs may be written as compressed chunks with only labels indexed, then archived to object storage for retention.
`,
    },
    {
      title: "Lifecycle jobs move data across tiers",
      detailMD: `
As segments age, lifecycle jobs shrink, merge, snapshot, or delete indexes according to tenant policy. Hot data remains query-optimized, warm data uses cheaper resources, and cold data remains available through slower object-storage scans.
`,
    },
    {
      title: "User submits a bounded query",
      detailMD: `
The query API authenticates the caller, checks tenant and field permissions, requires a time range, estimates scanned bytes, and chooses whether to execute synchronously or create an asynchronous search job.
`,
    },
    {
      title: "Query planner fans out and merges results",
      detailMD: `
The planner uses the metadata store to find relevant indexes or chunks, sends subqueries to search shards and cold readers, merges results by timestamp, applies limits and pagination, caches safe results, and writes an audit record.
`,
    },
  ],
  coreComponents: [
    {
      name: "Log Agents and Collectors",
      kind: "client",
      role: "Collect logs near the source and protect applications from logging backend failures.",
      detailMD: `
Agents such as Fluentd, Vector, Filebeat, or OpenTelemetry Collector tail files, read container stdout, batch events, compress payloads, retry with exponential backoff, and keep a bounded local disk buffer. They should apply basic filtering and sampling rules so a broken service cannot fill local disks indefinitely.
`,
    },
    {
      name: "Ingest Gateway",
      kind: "gateway",
      role: "The stateless front door for authentication, validation, throttling, and durable append.",
      detailMD: `
The gateway terminates TLS, authenticates tenant tokens, enforces quotas, validates batch envelopes, assigns partitions, and writes accepted events to Kafka. It should avoid expensive parsing or indexing work so it can scale predictably with incoming bytes.
`,
    },
    {
      name: "Durable Ingestion Buffer",
      kind: "queue",
      role: "Decouples producers from downstream parsing, indexing, and storage.",
      detailMD: `
Kafka, Pulsar, or Kinesis absorbs bursts, provides replay for failed consumers, and exposes lag as a first-class operational signal. Topics can be separated by tenant class, environment, priority, and region to isolate high-priority logs from noisy streams.
`,
    },
    {
      name: "Parsing and Enrichment Pipeline",
      kind: "worker",
      role: "Transforms raw events into searchable, policy-compliant records.",
      detailMD: `
Pipeline workers parse structured logs, run grok-like parsers for text logs, normalize timestamp and severity fields, add metadata from service catalogs, redact sensitive fields, compute routing keys, and write to index and storage backends. They must be idempotent because Kafka replay is normal.
`,
    },
    {
      name: "Search Index",
      kind: "search",
      role: "Provides low-latency search over recent and warm logs.",
      detailMD: `
Elasticsearch or OpenSearch stores inverted indexes for free text and selected fields. It is powerful for ad hoc debugging but expensive in CPU, memory, and disk. Shard count, mapping discipline, rollover size, and replica choices dominate reliability and cost.
`,
    },
    {
      name: "Chunk and Object Storage",
      kind: "storage",
      role: "Stores compressed logs cheaply for long retention and replay.",
      detailMD: `
Compressed chunks in S3, GCS, Azure Blob Storage, or HDFS keep cold logs durable at lower cost. Loki-style systems use labels to find relevant chunks, while cold search jobs scan and filter compressed data asynchronously when full-text indexes are no longer available.
`,
    },
    {
      name: "Query Service",
      kind: "service",
      role: "Authorizes, plans, executes, and merges log searches.",
      detailMD: `
The query service validates the time range, checks access control, estimates query cost, finds relevant segments in metadata, fans out to search shards and chunk readers, merges results by timestamp, caches safe results, and records audit details.
`,
    },
    {
      name: "Tenant Metadata and Policy Store",
      kind: "database",
      role: "Stores tenants, quotas, schemas, retention policy, and segment catalogs.",
      detailMD: `
The metadata store is much smaller than the log data plane but is critical for correctness. It drives authorization, ingestion limits, lifecycle jobs, index routing, query planning, and compliance retention.
`,
    },
  ],
  deepDives: [
    {
      topic: "Durable ingestion and backpressure",
      detailMD: `
The most important design choice is where the system acknowledges writes. If the gateway acknowledges before durable buffering, a gateway crash loses accepted logs. If it waits for full indexing, every index outage becomes an ingestion outage. A strong design acknowledges after Kafka quorum append.

Backpressure should be explicit and priority-aware. The gateway can return 429 with retry-after for tenants over quota, agents can buffer locally to disk for a bounded time, and the pipeline can shed low-value debug logs before audit or error logs. Kafka lag becomes the signal for autoscaling consumers, increasing sampling, or temporarily disabling expensive enrichments.

The system should also avoid infinite buffering. Local agent buffers need size limits, Kafka retention needs enough time for index recovery, and tenants need drop policies when they exceed contractual limits. Silent loss is worse than an explicit rejected count.
`,
    },
    {
      topic: "Parsing, schema, and enrichment strategy",
      detailMD: `
Structured JSON logs are much cheaper to process than arbitrary text because fields are already named and typed. The platform should encourage services to emit structured logs with standard fields such as timestamp, level, service, environment, trace_id, request_id, customer_id hash, and region.

Unstructured logs still matter for legacy systems. Pipeline workers can use configured parsers, but parser failures must not block ingestion. Store the original message, add a parse_error flag, and route failures to a dead-letter stream for rule fixes.

Enrichment increases query value but can also increase cost and cardinality. Add stable metadata from deployment systems and service catalogs, but be careful with high-cardinality labels such as user_id, request_id, and full URL. Those belong in searchable fields or raw payloads, not always in index labels.
`,
    },
    {
      topic: "Elasticsearch full-text index versus Loki label index",
      detailMD: `
Elasticsearch and OpenSearch build inverted indexes for text and selected fields. This is excellent for ad hoc searches such as finding an error phrase across services, but it multiplies storage and CPU cost. Mapping explosions, high-cardinality fields, and too many small shards can take down the cluster.

Loki-style systems intentionally index only labels such as tenant, service, environment, region, and level. The actual log lines are compressed into chunks in object storage. Queries first use labels and time ranges to find chunks, then scan those chunks. This is cheaper and operationally simpler at very high volume, but arbitrary free-text search over broad time ranges is slower.

A premium answer proposes a hybrid. Keep full-text indexes for recent high-value logs, errors, audits, and selected services. Store debug and trace-heavy logs as label-indexed chunks. Let tenants choose policies by value and budget rather than forcing one indexing model on all data.
`,
    },
    {
      topic: "Storage tiers and lifecycle policy",
      detailMD: `
Hot storage is optimized for low query latency and write throughput. It uses fast disks, enough replicas, and recent time-based indexes. This is the most expensive tier, so retention should be short, often 3 to 14 days depending on customer needs.

Warm storage keeps data searchable but cheaper. It may use slower nodes, fewer replicas, force-merged segments, searchable snapshots, or reduced field indexes. Query latency is higher, but incident investigations can still search the last few weeks.

Cold storage is compressed object storage. It is durable and inexpensive per byte, but search is slower and should run as an asynchronous job. Lifecycle jobs must update the segment catalog atomically so queries know which tier owns each time range.
`,
    },
    {
      topic: "Query planning and tail latency",
      detailMD: `
Log search is dangerous because a single query can fan out to thousands of shards and scan terabytes. Require tenant scope and time bounds. Estimate query cost before execution using segment metadata, field statistics, and tier information.

For hot queries, fan out to relevant shards in parallel and stream the first results as soon as possible. For cold queries, create an asynchronous job with progress, partial results, and cancellation. Use time-sorted pagination so users can continue investigations without rescanning from the beginning.

Protect the cluster with query budgets, concurrency limits, shard fan-out caps, result limits, and cancellation on client disconnect. Cache common field lists, recent dashboard queries, and small repeated searches, but avoid caching sensitive cross-tenant data.
`,
    },
    {
      topic: "Multi-tenancy, sampling, and log storms",
      detailMD: `
The platform will see log storms during bad deploys, dependency outages, retry loops, and security incidents. Those are exactly the moments when logs are most useful, so the design should degrade by priority instead of failing uniformly.

Use per-tenant and per-service quotas, priority classes, and sampling rules. For example, keep all ERROR and audit logs, sample DEBUG logs after a threshold, and aggregate repeated identical messages into counters. Make dropped and sampled counts visible so engineers do not mistake absence of logs for absence of failures.

Isolation can be logical or physical. Small tenants can share Kafka topics and index clusters with strict quotas. Regulated or high-volume tenants may need dedicated topics, index namespaces, encryption keys, or even clusters. Query isolation is as important as ingest isolation because one expensive search can starve everyone.
`,
    },
  ],
  scaling: [
    {
      stage: "Starter: single region with managed search",
      detailMD: `
Run agents, a stateless ingest API, a small Kafka cluster or managed stream, a few parsing workers, and a managed Elasticsearch or OpenSearch cluster. Keep retention short, index a limited field set, and store raw archives in object storage.
`,
    },
    {
      stage: "Growth: high-volume multi-service platform",
      detailMD: `
Partition Kafka by tenant and stream, split hot indexes by tenant and day, introduce lifecycle policies, add query budgets, and scale pipeline workers independently. Add a metadata store for retention, segment catalogs, and schema management.
`,
    },
    {
      stage: "Large scale: hundreds of TB per day",
      detailMD: `
Separate tenants by class, use multiple Kafka clusters or topics, introduce hybrid indexing, run dedicated hot and warm search clusters, compact logs into object-storage chunks, and make cold queries asynchronous. Autoscale workers based on lag and bytes per second.
`,
    },
    {
      stage: "Global scale: multi-region ingestion and query",
      detailMD: `
Ingest logs in the nearest region, replicate critical Kafka topics or archived chunks across regions, keep tenant metadata globally consistent, and route queries to the region that owns the relevant time range. Use regional isolation so a search or ingest incident does not become global.
`,
    },
    {
      stage: "Extreme scale: petabytes per day with cost controls",
      detailMD: `
Use label-first indexing for high-volume logs, reserve full-text indexing for high-value streams, push sampling and aggregation to agents, place premium tenants on dedicated capacity, and continuously optimize retention based on query frequency and business value.
`,
    },
  ],
  bottlenecks: [
    {
      issue: "Index cluster write saturation",
      optimizationMD: `
Buffer through Kafka, batch index writes, tune refresh intervals, roll over indexes by size, reduce indexed fields, isolate heavy tenants, and route lower-value logs to label-indexed chunks instead of full-text indexes.
`,
    },
    {
      issue: "Kafka partition hot spots",
      optimizationMD: `
Partition by a balanced key such as tenant plus stream hash rather than only tenant. Use more partitions for large tenants, separate priority topics, monitor broker disk and network utilization, and rebalance before partitions hit sustained throughput limits.
`,
    },
    {
      issue: "High-cardinality labels and mapping explosion",
      optimizationMD: `
Reject or demote labels with unbounded cardinality, enforce schema contracts, cap dynamic fields, route request_id and user_id to raw fields instead of labels, and alert on sudden field growth.
`,
    },
    {
      issue: "Broad queries scanning too much data",
      optimizationMD: `
Require time ranges, estimate scanned bytes, limit shard fan-out, use async jobs for cold searches, add query cancellation, and educate users to filter by tenant, service, level, and labels before free-text terms.
`,
    },
    {
      issue: "Object storage cold-query latency",
      optimizationMD: `
Partition chunks by tenant and time, maintain compact segment catalogs, store bloom filters or lightweight indexes for common fields, parallelize scans, and return partial results with progress rather than blocking interactive requests.
`,
    },
    {
      issue: "Log storms from retry loops or bad deployments",
      optimizationMD: `
Apply adaptive sampling, per-service rate limits, duplicate-message aggregation, and priority queues. Preserve all audit and error logs where possible while sampling debug noise and exposing drop counters to the owning team.
`,
    },
  ],
  failureHandling: [
    {
      scenario: "Search index cluster outage",
      strategyMD: `
Keep accepting logs into Kafka as long as buffer capacity remains. Pause or slow index consumers, alert on lag, scale replacement capacity, and replay from Kafka after recovery. Recent search may be stale, but ingestion should not fail immediately.
`,
    },
    {
      scenario: "Kafka broker or partition failure",
      strategyMD: `
Use replication across availability zones, minimum in-sync replica settings, rack-aware placement, and producer retries with idempotence. If quorum is unavailable, gateways should reject or throttle rather than pretending logs were durably accepted.
`,
    },
    {
      scenario: "Pipeline parser bug corrupts fields",
      strategyMD: `
Version parser rules, canary new pipelines, preserve raw messages, write failed parses to a dead-letter stream, and support replay from Kafka or object storage after fixing the parser. Do not make destructive transformations irreversible.
`,
    },
    {
      scenario: "Object storage outage",
      strategyMD: `
Hot search can continue for recent indexed data, but cold archive writes may queue locally or in Kafka for a bounded time. Lifecycle jobs should pause, query APIs should mark cold tiers degraded, and retries should be idempotent.
`,
    },
    {
      scenario: "Tenant exceeds quota during incident",
      strategyMD: `
Apply the tenant policy: preserve high-priority logs, sample lower-priority levels, return 429 or partial acceptance to agents, and make drop counts visible. Enterprise tenants may have burst credits or emergency quota overrides.
`,
    },
    {
      scenario: "Regional ingestion failure",
      strategyMD: `
Agents should fail over to a secondary region when configured, preserving tenant identity and ordering best-effort. The secondary region writes to its local buffer and later reconciles segment metadata so queries can find the data.
`,
    },
  ],
  security: [
    {
      label: "Tenant authentication and authorization",
      detailMD: `
Agents authenticate with scoped tokens or mTLS certificates. Users authenticate through identity providers, and the query service enforces tenant, environment, service, and field-level permissions before returning logs.
`,
    },
    {
      label: "Sensitive data handling",
      detailMD: `
Logs often contain tokens, emails, IP addresses, payment references, or customer identifiers. Redact at the agent or pipeline where possible, classify fields, restrict access to sensitive streams, and avoid storing query text with raw secrets in audit logs.
`,
    },
    {
      label: "Encryption and key isolation",
      detailMD: `
Use TLS in transit and encryption at rest for Kafka, indexes, metadata, and object storage. High-security tenants may require separate encryption keys, dedicated storage prefixes, and stricter key rotation policies.
`,
    },
    {
      label: "Auditability",
      detailMD: `
Every search, export, policy change, and privileged access should create an audit record with caller, tenant, time range, fields, scanned bytes, and purpose. Audit logs should have stronger retention and tamper resistance than ordinary debug logs.
`,
    },
    {
      label: "Abuse and exfiltration protection",
      detailMD: `
Rate-limit large exports, require approval for broad historical searches, watermark exports where appropriate, and alert on unusual query patterns such as a user scanning many tenants or downloading entire audit streams.
`,
    },
    {
      label: "Data residency and deletion",
      detailMD: `
Retention and residency policies must control where logs are stored and when they are deleted. Lifecycle jobs should prove deletion from hot, warm, cold, snapshots, and derived indexes where regulations require it.
`,
    },
  ],
  tradeoffs: {
    pros: [
      "Kafka decouples log producers from indexing and gives replay for failed consumers.",
      "Tiered storage keeps recent debugging fast while making long retention affordable.",
      "Hybrid indexing lets teams pay for full-text search only where it is valuable.",
      "Per-tenant quotas and query budgets protect shared infrastructure from noisy neighbors.",
      "Structured logging and enrichment make logs useful for correlation with metrics and traces.",
    ],
    cons: [
      "Full-text search at hundreds of TB per day is expensive in CPU, memory, and disk.",
      "Loki-style label indexing is cheaper but slower for broad arbitrary text searches.",
      "Kafka buffering adds operational complexity and requires careful lag management.",
      "Sampling and rate limiting can hide individual debug events if policies are not transparent.",
      "Multi-region ingestion complicates query planning, retention, and compliance controls.",
    ],
    alternativesMD: `
Alternative one is a simple ELK stack where Logstash writes all events into Elasticsearch. It is easy to understand and powerful for search, but it becomes expensive and fragile at very high volume unless mappings, shards, and retention are tightly controlled.

Alternative two is a Loki-style architecture with label indexes and compressed chunks in object storage. It is cost-effective for high-volume logs when users usually query by labels and time, but broad free-text search over cold data is slower.

Alternative three is an analytics database such as ClickHouse for structured logs. It can be excellent for aggregations, dashboards, and columnar scans, but it is not a drop-in replacement for arbitrary full-text debugging unless paired with text indexes or careful schema design.
`,
    whenNotToUseMD: `
Do not use the logging system as the primary source for precise metrics, distributed tracing, financial ledgers, or user-facing audit state. Logs are high-volume diagnostic evidence and may be sampled, delayed, redacted, or retained by policy. Use metrics for alerting math, traces for request causality, and transactional databases for authoritative business state.
`,
  },
  followUpQuestions: [
    {
      question: "Where should the system acknowledge a log batch?",
      answerMD: `
After durable append to Kafka or an equivalent replicated buffer. Acknowledging before that can lose accepted logs, while waiting for indexing couples producers to search-cluster failures.
`,
    },
    {
      question: "Why not index every field of every log forever?",
      answerMD: `
The storage, CPU, and memory cost is too high at hundreds of TB or PB per day. Full-text indexes should be reserved for hot and high-value logs, while older or lower-value logs move to cheaper chunked object storage.
`,
    },
    {
      question: "How do you handle a log storm during a bad deployment?",
      answerMD: `
Use per-tenant and per-service quotas, Kafka buffering, autoscaling based on lag, priority classes, duplicate aggregation, and adaptive sampling. Preserve ERROR and audit logs where possible and sample DEBUG noise with visible dropped counts.
`,
    },
    {
      question: "What is the difference between Elasticsearch and Loki for this problem?",
      answerMD: `
Elasticsearch builds full-text and field indexes, so ad hoc text search is fast but expensive. Loki indexes labels and stores compressed chunks, so it is cheaper and scales well for label-scoped searches but broad text scans are slower.
`,
    },
    {
      question: "How do you prevent one tenant from hurting others?",
      answerMD: `
Enforce ingest quotas, query budgets, concurrency limits, separate topics or clusters for large tenants, per-tenant index namespaces, and fair scheduling. Monitor tenant-level lag, drops, scanned bytes, and shard pressure.
`,
    },
    {
      question: "How are late-arriving logs handled?",
      answerMD: `
Use event timestamps and ingestion timestamps separately. Route events to the correct time bucket when the lateness is within policy, keep a small window open for updates, and send very late data to cold storage or a late-events index.
`,
    },
    {
      question: "How do you search cold logs efficiently?",
      answerMD: `
Make cold searches asynchronous, use segment metadata to prune by tenant and time, store chunks with useful prefixes, add lightweight bloom filters or field stats where justified, scan in parallel, and return partial results with cancellation.
`,
    },
  ],
  companyVariations: [
    {
      company: "Amazon",
      angleMD: `
Amazon interviewers often push on operational excellence: CloudWatch-style ingestion, Kinesis or Kafka buffering, multi-AZ durability, tenant quotas, cost controls, and what alarms fire when index lag or dropped logs increase.
`,
    },
    {
      company: "Netflix",
      angleMD: `
Netflix may frame the problem around massive microservice fleets, regional outages, noisy deploys, and fast incident debugging. Emphasize resilience during log storms, high-cardinality service metadata, adaptive sampling, and developer search experience.
`,
    },
    {
      company: "Databricks",
      angleMD: `
Databricks is likely to probe data scale, lakehouse storage, structured logs, streaming ingestion, schema evolution, retention, and query engines over object storage. Be ready to compare indexing with columnar or chunked storage for PB-scale data.
`,
    },
    {
      company: "Snowflake",
      angleMD: `
Snowflake may focus on multi-tenant data isolation, cost-based query execution, storage-compute separation, governance, and historical search. Discuss query budgets, cold-tier scans, auditability, and metadata-driven pruning.
`,
    },
  ],
  relatedQuestions: [
    {
      slug: "metrics-collection",
      note: "Metrics complement logs with low-cardinality time-series signals for alerts and dashboards.",
    },
    {
      slug: "monitoring-system",
      note: "Monitoring combines logs, metrics, alerts, and incident workflows into an operational platform.",
    },
    {
      slug: "kafka",
      note: "Kafka is the durable ingestion buffer that provides backpressure, replay, and consumer decoupling.",
    },
    {
      slug: "distributed-queue",
      note: "Queue design tradeoffs apply directly to buffering, ordering, retention, and replay for logs.",
    },
    {
      slug: "cloud-monitoring",
      note: "Cloud monitoring platforms often include managed logging, tenant isolation, and retention policies.",
    },
  ],
  interviewTips: {
    commonMistakes: [
      "Acknowledging logs only after Elasticsearch indexing completes.",
      "Ignoring Kafka or another durable buffer and writing agents directly to the search cluster.",
      "Full-text indexing every field forever without discussing cost or lifecycle tiers.",
      "Forgetting multi-tenancy, quotas, and noisy-neighbor protection.",
      "Treating DEBUG logs and audit logs as having the same durability requirements.",
      "Allowing unbounded queries without time ranges, budgets, or cancellation.",
    ],
    redFlags: [
      "No concrete capacity math for events per second, bytes per day, or storage retention.",
      "No backpressure or drop policy for log storms.",
      "No explanation of Elasticsearch versus Loki-style indexing tradeoffs.",
      "No plan for sensitive data redaction and access control.",
      "No lifecycle policy for hot, warm, and cold tiers.",
    ],
    expectations: [
      "Start with agents, ingestion gateway, durable buffer, pipeline workers, search indexes, and object storage.",
      "State when data is acknowledged and how replay works after downstream failures.",
      "Show real scale numbers for millions of events per second and hundreds of TB per day.",
      "Discuss query planning, shard fan-out, time bounds, and cold searches.",
      "Explain tenant isolation, quotas, sampling, and security.",
      "Choose an indexing strategy based on cost, freshness, and query patterns.",
    ],
    communicationMD: `
Lead with the two-path framing: ingestion must be durable and elastic, while query must be bounded and cost-aware. Draw Kafka early because it is the main decoupling mechanism. Then explain what gets full-text indexed, what becomes compressed chunks, and how retention moves data through hot, warm, and cold tiers. Use the log-storm scenario to demonstrate backpressure, sampling, and tenant isolation.
`,
  },
  revisionNotesMD: `
- A logging system ingests events from agents, durably buffers them, parses and enriches them, indexes recent high-value data, and archives compressed logs for retention.
- Acknowledge ingestion after Kafka quorum append, not after full indexing and not before durable storage.
- At 200,000 hosts and 10 events per second each, expect 2M events per second average, 172.8B events per day, and about 173 TB per day at 1 KB per event.
- A 5x incident burst reaches 10M events per second and about 10 GB per second raw input.
- Hot full-text indexing is expensive: 173 TB per day times 1.5 index expansion times 2 copies is about 519 TB per hot day.
- Elasticsearch or OpenSearch gives powerful full-text search but high cost. Loki-style label indexing plus chunks is cheaper but slower for broad text search.
- Use hot, warm, and cold tiers. Hot is fast and expensive, warm is cheaper but searchable, and cold is compressed object storage with asynchronous queries.
- Protect the platform with tenant quotas, query budgets, adaptive sampling, redaction, audit logs, and high-cardinality label controls.
- Query APIs should require tenant and time bounds, estimate scanned bytes, fan out only to relevant segments, and cancel runaway searches.
`,
  flashcards: [
    {
      front: "What is the most important buffer in a large logging system?",
      back: "A durable stream such as Kafka or Pulsar between ingest gateways and indexers, because it absorbs bursts and enables replay.",
    },
    {
      front: "When should an ingest gateway acknowledge a log batch?",
      back: "After the batch is durably appended to the replicated buffer, not after indexing and not before durable storage.",
    },
    {
      front: "Why is full-text indexing every log expensive?",
      back: "Inverted indexes add CPU, memory, and storage overhead, and high-cardinality fields can explode mappings and shard pressure.",
    },
    {
      front: "What is the core Loki tradeoff?",
      back: "It indexes labels and stores compressed chunks, which is cheaper at high volume but slower for broad arbitrary text searches.",
    },
    {
      front: "How do hot, warm, and cold tiers differ?",
      back: "Hot is recent low-latency searchable data, warm is older cheaper searchable data, and cold is compressed object storage for slower historical queries.",
    },
    {
      front: "How should the system handle DEBUG logs during a storm?",
      back: "Apply policy-based sampling or duplicate aggregation while preserving higher-priority ERROR and audit logs where possible.",
    },
    {
      front: "Why require time bounds on log queries?",
      back: "Without time bounds, a query can fan out to huge numbers of shards or chunks and scan terabytes unnecessarily.",
    },
    {
      front: "What metadata is commonly added during enrichment?",
      back: "Tenant, service, environment, host, region, deployment version, severity normalization, trace_id, and request_id.",
    },
  ],
  quiz: [
    {
      question: "Which component best decouples log producers from indexing failures?",
      options: ["Query cache", "Kafka or another durable buffer", "Dashboard UI", "Cold object storage only"],
      answerIndex: 1,
      explanationMD: `
Kafka provides durable append, replay, and backpressure. Producers can be acknowledged after buffering even if indexers are lagging or temporarily down.
`,
    },
    {
      question: "At 200,000 hosts and 10 events per second per host, what is the average event rate?",
      options: ["200,000 events per second", "1M events per second", "2M events per second", "20M events per second"],
      answerIndex: 2,
      explanationMD: `
200,000 hosts times 10 events per second equals 2,000,000 events per second.
`,
    },
    {
      question: "Why is a Loki-style label index cheaper than full-text indexing?",
      options: ["It stores no logs", "It indexes selected labels and scans compressed chunks instead of indexing every word", "It requires every query to use SQL", "It avoids retention policies"],
      answerIndex: 1,
      explanationMD: `
Label indexes are much smaller than full inverted indexes. The tradeoff is that broad free-text searches must scan candidate chunks.
`,
    },
    {
      question: "What is the best default behavior for a broad historical query over cold logs?",
      options: ["Run synchronously until the HTTP request times out", "Reject all cold queries permanently", "Create an asynchronous job with progress and partial results", "Load all cold logs into memory"],
      answerIndex: 2,
      explanationMD: `
Cold queries can scan large compressed data sets. An asynchronous job allows progress tracking, cancellation, partial results, and fair scheduling.
`,
    },
    {
      question: "Which field is usually dangerous as an indexed label because of high cardinality?",
      options: ["service", "environment", "request_id", "level"],
      answerIndex: 2,
      explanationMD: `
request_id is often unique per request. Indexing it as a label creates extreme cardinality and can overload label indexes or mappings.
`,
    },
    {
      question: "If the search index is down but Kafka is healthy, what should the system do?",
      options: ["Continue accepting logs into Kafka and replay later", "Drop all logs silently", "Block agents until search recovers", "Delete cold archives"],
      answerIndex: 0,
      explanationMD: `
The durable buffer exists so ingestion can continue while indexers recover. Lag should be monitored and bounded by retention and capacity.
`,
    },
    {
      question: "What is the strongest reason to expose dropped or sampled log counts?",
      options: ["To make dashboards prettier", "To tell engineers when absence of logs may be caused by sampling or quotas", "To reduce TLS overhead", "To replace authentication"],
      answerIndex: 1,
      explanationMD: `
Transparent drop and sampling counters prevent false conclusions during incidents and help teams tune logging volume.
`,
    },
  ],
  cheatSheetMD: `
**Goal**: collect, buffer, process, search, and retain logs from many services at millions of events per second.

**Ingestion path**: agents to load balancer to ingest gateway to Kafka to pipeline workers. Acknowledge after durable buffer append.

**Scale example**: 200,000 hosts times 10 events per second is 2M events per second. At 1 KB per event, that is about 173 TB per day. A 5x burst is 10M events per second and 10 GB per second raw.

**Buffer**: Kafka or Pulsar absorbs bursts, provides replay, and exposes lag. Separate topics by tenant class, priority, region, or environment when isolation matters.

**Processing**: parse JSON, handle legacy text, normalize fields, enrich with tenant and deployment metadata, redact sensitive values, and route by policy.

**Indexing**: Elasticsearch or OpenSearch gives fast full-text search but high cost. Loki-style labels plus compressed chunks are cheaper but slower for broad text search. Hybrid is often best.

**Storage tiers**: hot for recent low-latency search, warm for cheaper searchable history, cold object storage for long retention and asynchronous scans.

**Query**: require tenant and time bounds, estimate scanned bytes, limit shard fan-out, use async jobs for cold data, cache safe repeated results, and audit every access.

**Reliability**: keep ingestion available when search is degraded, replay from Kafka, preserve raw logs before risky parsing, and monitor lag, rejected batches, indexing errors, and dropped events.

**Security**: authenticate agents and users, enforce tenant access, redact secrets, encrypt at rest and in transit, audit searches and exports, and comply with retention and residency policy.
`,
  references: [
    {
      title: "Designing Data-Intensive Applications",
      kind: "Book",
      author: "Martin Kleppmann",
    },
    {
      title: "The Log: What every software engineer should know about real-time data's unifying abstraction",
      kind: "Blog",
      url: "https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying",
      author: "Jay Kreps",
    },
    {
      title: "Elasticsearch Guide",
      kind: "Docs",
      url: "https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html",
      author: "Elastic",
    },
    {
      title: "Grafana Loki Documentation",
      kind: "Docs",
      url: "https://grafana.com/docs/loki/latest/",
      author: "Grafana Labs",
    },
    {
      title: "The Tail at Scale",
      kind: "Paper",
      url: "https://research.google/pubs/the-tail-at-scale/",
      author: "Jeffrey Dean and Luiz Andre Barroso",
    },
  ],
};
