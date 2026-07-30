import type { SDQuestionContent } from "../types";

export const metricsCollectionContent: SDQuestionContent = {
  slug: "metrics-collection",
  statementMD: `
Design a Metrics Collection platform like Prometheus, Datadog Metrics, or a cloud monitoring time-series backend. Applications, hosts, containers, and infrastructure components emit counters, gauges, histograms, and summaries. The system must ingest samples continuously, store them efficiently as time series, and answer aggregation queries over recent and historical windows.

At interview scale, assume millions of active series, hundreds of thousands of samples per second, high-cardinality labels, and many teams querying dashboards and alerts at the same time. The hard part is not accepting one metric point; it is controlling cardinality, sharding series safely, compressing time-series data, keeping writes durable, and making PromQL-like queries fast enough without scanning the world.

The default design should support both pull collection, where scrapers discover targets and periodically read metrics endpoints, and push collection, where agents or StatsD-style clients send batched metrics. It should keep raw recent data for detailed debugging, downsample older data for long retention, and isolate ingestion from query spikes.
`,
  businessUseCaseMD: `
Metrics are the operating dashboard for modern software. They power service health dashboards, SLO tracking, capacity planning, autoscaling signals, incident detection, and release validation. Teams need to ask questions such as whether checkout error rate increased after a deploy, which region is saturated, or whether database latency is breaching an objective.

Businesses also use metrics to reduce downtime and infrastructure cost. A strong metrics platform makes production behavior visible, detects regressions quickly, and gives engineering leaders reliable signals for reliability investments.
`,
  functionalRequirements: [
    "Ingest counter, gauge, histogram, and summary metrics from applications, agents, and infrastructure.",
    "Support pull-based scraping of registered targets and push-based ingestion for agents, StatsD, and remote write clients.",
    "Attach labels or dimensions to metrics and identify unique time series from metric name plus label set.",
    "Store raw samples for recent retention and downsampled rollups for long-term retention.",
    "Provide instant and range queries with filtering, grouping, aggregation, rate calculations, and percentile-style histogram queries.",
    "Expose metadata APIs for metric names, label values, active series, targets, and ingestion health.",
    "Support alert evaluation over metric expressions without blocking ingestion.",
    "Enforce per-tenant quotas, label allowlists, and cardinality limits.",
  ],
  nonFunctionalRequirements: [
    {
      label: "Ingestion throughput",
      detailMD: `
The platform should sustain hundreds of thousands of samples per second on average and scale to higher peaks by partitioning series across ingestion shards. Writes must be batched, append-oriented, and protected by a durable log or write-ahead log.
`,
    },
    {
      label: "Query latency",
      detailMD: `
Common dashboard queries over the last hour should complete in under 1 second at p95. Larger ad hoc queries over days or months can take several seconds, but they need limits, cancellation, and progressive execution so they do not starve ingestion or other users.
`,
    },
    {
      label: "Availability",
      detailMD: `
Ingestion should remain available during query outages, rollup delays, and partial storage failures. Recent data loss should be extremely rare because metrics are used during incidents, but a short query freshness gap is usually better than dropping writes.
`,
    },
    {
      label: "Durability and retention",
      detailMD: `
Recent raw samples should survive node restarts and single-zone failures. Retention should be tiered, such as 15 days of raw samples, 180 days of 5-minute rollups, and 2 years of hourly rollups.
`,
    },
    {
      label: "Cardinality control",
      detailMD: `
The system must detect and limit label combinations that create unbounded series, such as user_id, request_id, or full URL path. Cardinality protection is a first-class requirement because one bad deployment can multiply storage, indexes, and query cost.
`,
    },
    {
      label: "Multi-tenancy",
      detailMD: `
Tenants need isolated quotas, retention policies, access control, and noisy-neighbor protection. A single customer or team should not be able to exhaust global ingestion, index, or query capacity.
`,
    },
    {
      label: "Cost efficiency",
      detailMD: `
Samples are tiny but extremely numerous. The design should use delta-of-delta timestamp compression, XOR value compression, chunked storage, compaction, downsampling, and cold object storage for older blocks.
`,
    },
  ],
  capacityEstimation: {
    assumptionsMD: `
Assume 3M active time series on average, 5M active series at peak, a 15-second default scrape interval, and 30 days per month. A raw sample has an 8-byte timestamp and an 8-byte float value before compression. Labels are stored once per series in the index and metadata store rather than repeated on every sample.

Assume compressed TSDB chunks average 2 to 4 bytes per sample with delta-of-delta and XOR encoding. Use 3 replicas for recent data, 15 days of raw retention, 180 days of 5-minute rollups, and 2 years of 1-hour rollups. Query traffic is assumed to be 1,000 range queries per second at peak across dashboards, alerts, and ad hoc users.
`,
    metrics: [
      {
        label: "Active series",
        value: "3M average, 5M peak",
        note: "Each unique metric name plus label set is one series",
      },
      {
        label: "Average ingest rate",
        value: "200,000 samples per second",
        note: "3M active series divided by 15 seconds",
      },
      {
        label: "Peak ingest rate",
        value: "500,000 samples per second",
        note: "Peak series count plus shorter scrape intervals and bursts",
      },
      {
        label: "Daily raw samples",
        value: "17.3B samples per day",
        note: "200,000 samples per second times 86,400 seconds",
      },
      {
        label: "Raw sample bytes",
        value: "276 GB per day",
        note: "17.3B samples times 16 bytes before compression and metadata",
      },
      {
        label: "Compressed chunks",
        value: "35 to 70 GB per day",
        note: "2 to 4 bytes per sample before replication and indexes",
      },
      {
        label: "Recent raw retention",
        value: "1.0 to 1.5 TB compressed",
        note: "15 days of compressed chunks before replication and index overhead",
      },
      {
        label: "Recent replicated footprint",
        value: "5 to 8 TB",
        note: "3 replicas plus index, WAL, compaction, and headroom",
      },
      {
        label: "5-minute rollup samples",
        value: "864M samples per day",
        note: "3M series times 288 five-minute buckets, before dropping unused dimensions",
      },
      {
        label: "Writer shards",
        value: "128 to 256 shards",
        note: "At 500,000 peak samples per second, each shard handles roughly 2,000 to 4,000 samples per second",
      },
    ],
    calculationsMD: `
- Average ingest: 3M active series divided by a 15-second scrape interval is 200,000 samples per second.
- Daily samples: 200,000 samples per second times 86,400 seconds is 17.28B samples per day.
- Raw bytes: 17.28B samples times 16 bytes for timestamp plus value is about 276 GB per day, before labels, WAL, replication, and indexes.
- Compression: at 2 to 4 bytes per sample, daily compressed chunks are about 35 to 70 GB. This assumes stable scrape intervals, similar neighboring values, and chunk encoding with delta-of-delta timestamps and XOR values.
- Raw retention: 15 days times 35 to 70 GB is about 525 GB to 1.05 TB of compressed chunks. Add indexes, metadata, WAL, compaction workspace, and safety headroom to plan around 1.0 to 1.5 TB before replication.
- Replication: 3 replicas plus indexes and write amplification make recent storage roughly 5 to 8 TB.
- Rollups: 5-minute buckets create 288 points per series per day. For 3M series, that is 864M rollup points per day before label reduction. Dropping high-cardinality dimensions in rollups is essential.
- Sharding: at 500,000 peak samples per second, 128 shards receive about 3,900 samples per second each on average. 256 shards reduce per-shard load and provide room for hot series and tenant skew.
`,
  },
  apiDesign: {
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/remote-write",
        descriptionMD: `
Accepts batched metric samples from agents, sidecars, or compatible remote write clients. The ingestion gateway validates tenant identity, metric names, labels, timestamps, and payload size before appending to the ingestion log.
`,
        request: `
{
  "tenantId": "team_checkout",
  "samples": [
    {
      "metric": "http_requests_total",
      "type": "counter",
      "labels": {
        "service": "checkout",
        "region": "us-east-1",
        "status": "500"
      },
      "timestamp": "2026-07-26T06:59:00Z",
      "value": 12843
    }
  ]
}
`,
        response: `
{
  "acceptedSamples": 1,
  "rejectedSamples": 0,
  "nextAllowedAt": null
}
`,
        statusCodes: [
          { code: 202, meaning: "Batch accepted for durable ingestion" },
          { code: 400, meaning: "Invalid metric name, type, labels, timestamp, or value" },
          { code: 401, meaning: "Missing or invalid tenant credentials" },
          { code: 413, meaning: "Payload too large" },
          { code: 429, meaning: "Tenant ingest quota exceeded" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/targets",
        descriptionMD: `
Returns scrape targets assigned to a scraper or agent. Service discovery can be backed by Kubernetes, Consul, cloud APIs, or static configuration.
`,
        response: `
{
  "scraperId": "scraper_us_east_1_42",
  "targets": [
    {
      "targetId": "checkout_pod_17",
      "url": "https://10.24.9.17:9100/metrics",
      "intervalSeconds": 15,
      "labels": {
        "service": "checkout",
        "cluster": "prod-use1"
      }
    }
  ]
}
`,
        statusCodes: [
          { code: 200, meaning: "Targets returned" },
          { code: 401, meaning: "Scraper not authenticated" },
          { code: 403, meaning: "Scraper not allowed for tenant or region" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/targets/{targetId}/scrape-result",
        descriptionMD: `
Allows scrape managers to report scrape health, sample counts, and failures. The control plane uses this for target health, missing metrics, and alerting on collection gaps.
`,
        request: `
{
  "targetId": "checkout_pod_17",
  "scrapedAt": "2026-07-26T06:59:00Z",
  "durationMs": 82,
  "samples": 1432,
  "status": "success"
}
`,
        response: `
{
  "recorded": true
}
`,
        statusCodes: [
          { code: 202, meaning: "Scrape result recorded" },
          { code: 400, meaning: "Invalid scrape result" },
          { code: 404, meaning: "Unknown target" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/query",
        descriptionMD: `
Runs an instant PromQL-like query at a single timestamp. It supports selectors, arithmetic, aggregations, and functions such as rate over a recent window.
`,
        request: `
query=sum(rate(http_requests_total[5m])) by (service)
time=2026-07-26T07:00:00Z
tenantId=team_checkout
`,
        response: `
{
  "status": "success",
  "data": [
    {
      "metric": {
        "service": "checkout"
      },
      "value": [1785058800, 231.7]
    }
  ]
}
`,
        statusCodes: [
          { code: 200, meaning: "Query completed" },
          { code: 400, meaning: "Invalid query expression" },
          { code: 401, meaning: "Authentication required" },
          { code: 422, meaning: "Query exceeds series, time range, or cost limits" },
          { code: 503, meaning: "Query service temporarily unavailable" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/query_range",
        descriptionMD: `
Runs a range query for dashboards and graph panels. The query frontend chooses raw chunks or rollups based on range and step size.
`,
        request: `
query=histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service))
start=2026-07-26T06:00:00Z
end=2026-07-26T07:00:00Z
step=30s
`,
        response: `
{
  "status": "success",
  "resolution": "raw",
  "seriesReturned": 12,
  "data": [
    {
      "metric": {
        "service": "checkout"
      },
      "values": [
        [1785055200, 0.182],
        [1785055230, 0.191]
      ]
    }
  ]
}
`,
        statusCodes: [
          { code: 200, meaning: "Range query completed" },
          { code: 400, meaning: "Invalid query or time range" },
          { code: 401, meaning: "Authentication required" },
          { code: 422, meaning: "Query cost limit exceeded" },
          { code: 504, meaning: "Query timed out" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/labels/{labelName}/values",
        descriptionMD: `
Returns known values for a label within a tenant and optional time range. This powers dashboard dropdowns but must be protected because high-cardinality labels can produce huge responses.
`,
        request: `
tenantId=team_checkout
metric=http_requests_total
start=2026-07-26T06:00:00Z
end=2026-07-26T07:00:00Z
`,
        response: `
{
  "labelName": "region",
  "values": ["us-east-1", "us-west-2", "eu-west-1"]
}
`,
        statusCodes: [
          { code: 200, meaning: "Label values returned" },
          { code: 401, meaning: "Authentication required" },
          { code: 422, meaning: "Response would exceed configured cardinality limits" },
        ],
      },
    ],
    notesMD: `
Separate ingest APIs from query APIs. Ingestion should acknowledge only after a durable log append or local WAL persistence, while queries should be cost-limited and cancelable. Pull scraping is usually driven by internal scrape managers, but the samples should enter the same ingestion path as pushed samples after normalization.
`,
  },
  databaseDesign: {
    schemaMD: `
A metrics platform is logically a time-series database rather than a traditional relational application. The core identity is **tenant_id plus metric_name plus normalized label set**, which maps to a stable **series_id**. Samples for the same series are appended into compressed chunks ordered by time.

Use a relational-style schema to describe the entities, then implement the hot path in a distributed TSDB with an inverted index, append-only chunks, object storage blocks, and compacted rollups.
`,
    tables: [
      {
        name: "metric_series",
        columns: [
          { name: "tenant_id", type: "varchar(128)", note: "Tenant or workspace that owns the series" },
          { name: "series_id", type: "uint64", note: "Stable hash or allocated id for metric name plus labels" },
          { name: "metric_name", type: "varchar(255)", note: "Metric name such as http_requests_total" },
          { name: "metric_type", type: "varchar(32)", note: "counter, gauge, histogram, or summary" },
          { name: "label_set_hash", type: "uint64", note: "Hash of sorted labels for idempotent series lookup" },
          { name: "labels_json", type: "json", note: "Canonical sorted labels stored once per series" },
          { name: "created_at", type: "timestamp", note: "First seen time" },
          { name: "last_seen_at", type: "timestamp", note: "Used to expire inactive series and estimate active cardinality" },
          { name: "retention_policy", type: "varchar(64)", note: "Raw and rollup retention class" },
        ],
      },
      {
        name: "tsdb_chunks",
        columns: [
          { name: "tenant_id", type: "varchar(128)", note: "Tenant partition" },
          { name: "shard_id", type: "int", note: "Writer shard owning the series for this time range" },
          { name: "series_id", type: "uint64", note: "Series whose samples are encoded in the chunk" },
          { name: "chunk_start_ts", type: "timestamp", note: "Chunk lower time bound" },
          { name: "chunk_end_ts", type: "timestamp", note: "Chunk upper time bound" },
          { name: "sample_count", type: "int", note: "Number of samples in the chunk" },
          { name: "encoding", type: "varchar(32)", note: "Delta-of-delta timestamps and XOR values" },
          { name: "encoded_bytes", type: "blob", note: "Compressed sample payload" },
          { name: "checksum", type: "uint64", note: "Detects corruption during reads and compaction" },
        ],
      },
      {
        name: "label_index",
        columns: [
          { name: "tenant_id", type: "varchar(128)", note: "Tenant partition" },
          { name: "label_name", type: "varchar(255)", note: "Label key such as service or region" },
          { name: "label_value", type: "varchar(1024)", note: "Label value with size limits" },
          { name: "block_id", type: "varchar(128)", note: "Time block or index segment" },
          { name: "series_postings", type: "blob", note: "Compressed sorted list of series ids matching the label pair" },
          { name: "updated_at", type: "timestamp", note: "Index freshness time" },
        ],
      },
      {
        name: "rollup_blocks",
        columns: [
          { name: "tenant_id", type: "varchar(128)", note: "Tenant partition" },
          { name: "rollup_id", type: "varchar(128)", note: "Aggregate series or reduced-dimension identity" },
          { name: "resolution", type: "varchar(32)", note: "5m, 1h, or another retention tier" },
          { name: "bucket_start_ts", type: "timestamp", note: "Rollup bucket start" },
          { name: "count", type: "double", note: "Count of samples or events in bucket" },
          { name: "sum", type: "double", note: "Sum for averages and rates" },
          { name: "min", type: "double", note: "Minimum observed value" },
          { name: "max", type: "double", note: "Maximum observed value" },
          { name: "histogram_buckets", type: "json nullable", note: "Optional aggregated histogram buckets" },
        ],
      },
    ],
    indexesMD: `
- **metric_series.tenant_id, label_set_hash** supports idempotent series creation and lookup during ingestion.
- **metric_series.tenant_id, metric_name** supports metric discovery and query planning.
- **label_index.tenant_id, label_name, label_value, block_id** is the inverted index used to resolve label matchers into series ids.
- **tsdb_chunks.tenant_id, shard_id, series_id, chunk_start_ts** supports range scans for one series on the owning shard.
- **rollup_blocks.tenant_id, rollup_id, resolution, bucket_start_ts** supports long-range queries without reading raw chunks.
`,
    relationshipsMD: `
Each metric series has many compressed chunks. Label index entries point to sets of series ids, not to individual samples. Rollup blocks can be derived from raw chunks and may intentionally drop high-cardinality labels. Scrape targets and ingestion clients produce samples, but the durable storage model is organized around series and time.
`,
    noSqlAlternativesMD: `
At production scale, use a purpose-built distributed TSDB rather than a generic row store for samples. The hot write path resembles Kafka or a partitioned log feeding shard-local TSDB writers. Recent chunks can live on fast SSDs, compacted immutable blocks can move to object storage, and metadata can live in a strongly consistent key-value store.

Cassandra, Bigtable, or DynamoDB can store time-bucketed samples for a simpler design, but they often waste space and struggle with PromQL-style label matching unless paired with an inverted index. ClickHouse, Druid, Pinot, or other columnar OLAP systems can work well for aggregated metrics, but raw high-frequency per-series writes still need careful batching and cardinality controls.
`,
  },
  architecture: {
    width: 960,
    height: 560,
    nodes: [
      { id: "clients", label: "Services and Users", kind: "client", x: 80, y: 240, sublabel: "Exporters, dashboards" },
      { id: "scrape-manager", label: "Scrape Manager", kind: "service", x: 250, y: 120, sublabel: "Pull collection" },
      { id: "push-gateway", label: "Push Gateway", kind: "gateway", x: 250, y: 330, sublabel: "StatsD, OTLP" },
      { id: "ingest-gateway", label: "Ingest Gateway", kind: "gateway", x: 420, y: 230, sublabel: "Validate, batch" },
      { id: "metadata-store", label: "Series Catalog", kind: "database", x: 585, y: 90, sublabel: "Labels, quotas" },
      { id: "ingest-log", label: "Ingest Log", kind: "queue", x: 585, y: 230, sublabel: "Kafka, WAL" },
      { id: "rollup-worker", label: "Rollup Workers", kind: "worker", x: 585, y: 390, sublabel: "Downsample" },
      { id: "tsdb-writer", label: "TSDB Writers", kind: "worker", x: 750, y: 230, sublabel: "Shard by series" },
      { id: "hot-tsdb", label: "Hot TSDB", kind: "database", x: 890, y: 170, sublabel: "SSD chunks" },
      { id: "object-storage", label: "Object Storage", kind: "storage", x: 890, y: 350, sublabel: "Blocks, rollups" },
      { id: "query-frontend", label: "Query Frontend", kind: "service", x: 420, y: 450, sublabel: "PromQL-like" },
    ],
    edges: [
      { from: "scrape-manager", to: "clients", label: "scrape pull" },
      { from: "clients", to: "push-gateway", label: "push metrics" },
      { from: "clients", to: "query-frontend", label: "dashboards" },
      { from: "scrape-manager", to: "ingest-gateway", label: "scraped samples" },
      { from: "push-gateway", to: "ingest-gateway", label: "batched samples" },
      { from: "ingest-gateway", to: "metadata-store", label: "series lookup" },
      { from: "ingest-gateway", to: "ingest-log", label: "durable append" },
      { from: "ingest-log", to: "tsdb-writer", label: "partition stream" },
      { from: "tsdb-writer", to: "hot-tsdb", label: "append chunks" },
      { from: "tsdb-writer", to: "metadata-store", label: "update last seen", dashed: true },
      { from: "hot-tsdb", to: "object-storage", label: "compact blocks", dashed: true },
      { from: "rollup-worker", to: "hot-tsdb", label: "read raw windows" },
      { from: "rollup-worker", to: "object-storage", label: "write rollups" },
      { from: "query-frontend", to: "metadata-store", label: "match labels" },
      { from: "query-frontend", to: "hot-tsdb", label: "recent raw" },
      { from: "query-frontend", to: "object-storage", label: "historical rollups" },
    ],
    captionMD: `
Pull and push collection converge at the ingestion gateway. From there, samples are durably appended to a partitioned log, written by TSDB shards into compressed chunks, compacted into blocks, and queried through a cost-limited PromQL-like frontend.
`,
  },
  architectureNotesMD: `
The architecture separates collection, ingestion durability, storage writing, and query execution. Scrape managers handle pull collection and target health. Push gateways accept StatsD, OpenTelemetry, and remote write style traffic from places where pull is inconvenient. Both paths normalize metric types, labels, timestamps, and tenant identity before using the same ingestion pipeline.

The ingestion gateway is intentionally thin and fast. It validates payloads, checks quotas and cardinality limits, resolves or creates series ids, then appends batches to a durable log. TSDB writer shards own ranges or hash partitions of series ids, append samples to in-memory head blocks and write-ahead logs, then flush compressed immutable chunks to hot storage.

Queries go through a frontend that parses PromQL-like expressions, expands label matchers through the series catalog and inverted index, fans out to shard-local stores for recent raw data, and uses object storage rollups for long time ranges. Rollup workers and compaction run asynchronously so they do not block the write path.
`,
  requestFlow: [
    {
      title: "Targets are discovered and assigned",
      detailMD: `
Service discovery finds Kubernetes pods, VMs, databases, load balancers, and exporters. The control plane assigns targets to scrape managers with intervals, authentication settings, and static labels such as service, cluster, region, and environment.
`,
    },
    {
      title: "Metrics are collected by pull or push",
      detailMD: `
In pull mode, a scrape manager periodically calls a target metrics endpoint and parses counter, gauge, histogram, and summary samples. In push mode, applications or agents send batched metrics to the push gateway. Both modes produce normalized sample batches.
`,
    },
    {
      title: "Samples are validated and normalized",
      detailMD: `
The ingestion gateway checks tenant credentials, payload size, metric naming rules, type consistency, label count, label length, timestamp bounds, and duplicate samples. It sorts labels into canonical order so the same series always maps to the same identity.
`,
    },
    {
      title: "Series identity and cardinality limits are enforced",
      detailMD: `
The gateway looks up the metric name plus label set in the series catalog. If it is new, it creates a series id only when tenant quotas, per-metric limits, and blocked-label policies allow it. Rejected series are counted and surfaced to users.
`,
    },
    {
      title: "Batches are durably appended",
      detailMD: `
Accepted samples are appended to a partitioned ingestion log or local write-ahead log before acknowledgement. The partition key is derived from tenant and series id so samples for one series are ordered and routed to the same TSDB writer shard.
`,
    },
    {
      title: "Writer shards build compressed chunks",
      detailMD: `
TSDB writers consume their partitions, append samples to in-memory head chunks, and periodically flush immutable chunks. Timestamps use delta-of-delta compression and floating-point values use XOR compression, which works well for stable scrape intervals and slowly changing values.
`,
    },
    {
      title: "Queries resolve labels to series",
      detailMD: `
A query frontend parses the expression, identifies metric selectors and label matchers, and uses the inverted index to find matching series ids. It rejects queries that expand beyond tenant or global cost limits.
`,
    },
    {
      title: "Raw chunks or rollups are scanned",
      detailMD: `
For recent short windows, the query engine reads raw compressed chunks from hot TSDB shards. For long windows or coarse dashboard steps, it reads precomputed rollup blocks from object storage. The frontend merges partial results, applies aggregations, and returns time series values.
`,
    },
    {
      title: "Compaction, downsampling, and retention run asynchronously",
      detailMD: `
Background workers compact small chunks into larger immutable blocks, create 5-minute and 1-hour rollups, delete expired raw data, and move cold blocks to cheaper storage. These jobs are rate-limited so they do not disrupt ingestion.
`,
    },
  ],
  coreComponents: [
    {
      name: "Scrape Manager",
      kind: "service",
      role: "Performs pull-based collection from targets.",
      detailMD: `
Scrape managers receive target assignments, schedule scrapes with jitter, handle authentication, parse exposition formats, and report scrape health. They should avoid synchronized scraping storms by spreading targets over the interval.
`,
    },
    {
      name: "Push Gateway",
      kind: "gateway",
      role: "Accepts pushed metrics from agents and short-lived jobs.",
      detailMD: `
The push gateway handles StatsD-style datagrams, OpenTelemetry metrics, and remote write batches. It batches samples, applies tenant limits, and forwards normalized samples to the ingestion gateway. It should not become the durable source of truth.
`,
    },
    {
      name: "Ingest Gateway",
      kind: "gateway",
      role: "Validates samples and appends accepted batches durably.",
      detailMD: `
This stateless tier checks schemas, timestamps, labels, metric type consistency, per-tenant quotas, and cardinality budgets. It resolves series ids, rejects dangerous labels, and writes accepted batches to the ingestion log with backpressure.
`,
    },
    {
      name: "Series Catalog and Inverted Index",
      kind: "database",
      role: "Maps label sets to series ids and label matchers to postings lists.",
      detailMD: `
The catalog stores metric names, labels, types, tenant ownership, active state, and retention policy. The inverted index stores compressed postings lists for label pairs so a query can find matching series without scanning all metadata.
`,
    },
    {
      name: "TSDB Storage Engine",
      kind: "database",
      role: "Stores high-volume samples in compressed time chunks.",
      detailMD: `
The engine keeps recent samples in a write-optimized head block, persists a write-ahead log, flushes immutable chunks, and compacts blocks over time. Delta-of-delta timestamp encoding and XOR value encoding reduce storage per sample dramatically.
`,
    },
    {
      name: "Query Frontend",
      kind: "service",
      role: "Executes PromQL-like expressions with cost controls.",
      detailMD: `
The frontend parses queries, estimates cardinality and time range cost, chooses raw or rollup data, fans out to storage shards, merges partial results, and applies functions such as rate, sum by label, and histogram quantiles.
`,
    },
    {
      name: "Rollup and Retention Workers",
      kind: "worker",
      role: "Downsample and expire data for long-term retention.",
      detailMD: `
Workers aggregate raw samples into 5-minute and 1-hour summaries, compact small blocks, move cold data to object storage, and enforce retention. Rollups must preserve enough statistics for rates, averages, min, max, and histogram queries.
`,
    },
    {
      name: "Cardinality Controller",
      kind: "monitoring",
      role: "Detects and limits explosive label combinations.",
      detailMD: `
This control loop tracks active series by tenant, metric, label name, and label value. It warns on suspicious growth, blocks disallowed labels, samples or drops excessive new series, and gives users actionable reports on the source of cardinality.
`,
    },
  ],
  deepDives: [
    {
      topic: "Metric types and correctness",
      detailMD: `
Counters, gauges, histograms, and summaries have different semantics. A **counter** is monotonically increasing except for resets, so queries usually use rate over a time window. A **gauge** is an instantaneous value such as memory usage, queue depth, or temperature. A **histogram** stores counts in configured buckets plus sum and count, which allows aggregation across instances and later percentile estimation. A **summary** often calculates client-side quantiles, which can be useful locally but is hard to aggregate correctly across many instances.

The ingestion layer should enforce type consistency for a metric name within a tenant. If one service emits **request_latency_seconds** as a gauge and another emits it as a histogram, queries become misleading. Metadata should record the metric type and reject or quarantine incompatible samples.

Histograms are usually the best fit for distributed percentiles because bucket counts can be summed by service, region, or cluster. Summaries can be retained for application-specific local quantiles, but interview answers should explain why they are not generally aggregatable.
`,
    },
    {
      topic: "Pull versus push collection",
      detailMD: `
Pull collection, popularized by Prometheus, lets the monitoring system control scrape intervals, discover targets, detect missing targets, and apply backpressure centrally. It is operationally clean for long-running services and Kubernetes pods because the scraper knows whether a target failed to respond.

Push collection is useful for short-lived jobs, serverless functions, network-isolated environments, and StatsD-style UDP clients. It can be simpler for developers but makes liveness harder: if a client stops pushing, the backend must distinguish silence from success unless heartbeat metrics exist.

A production platform can support both by converging on the same internal sample format. The key is to keep push gateways stateless or lightly stateful, avoid unbounded buffering, and make pull scrape health visible as first-class metadata.
`,
    },
    {
      topic: "Labels and cardinality explosion",
      detailMD: `
A time series is defined by metric name plus the complete label set. Labels such as service, region, endpoint, method, and status are valuable because they allow slicing and aggregation. Labels such as user_id, request_id, session_id, trace_id, or raw URL can create one series per request and overwhelm the system.

Cardinality grows multiplicatively. If a metric has 100 services, 20 endpoints, 5 status classes, 10 regions, and 4 methods, it can create 400,000 series before considering instances. Adding a label with 1M possible user ids makes the metric impossible to store and query economically.

Protect the system with per-tenant active series quotas, per-metric limits, label name allowlists or denylists, value length limits, high-cardinality detection, and ingestion-time rejection for new series once budgets are exceeded. Good user feedback matters: teams need to know which metric and label caused the explosion.
`,
    },
    {
      topic: "TSDB storage engine and compression",
      detailMD: `
Metrics are append-heavy and mostly ordered by time. A TSDB writer keeps an in-memory head block for recent samples and a write-ahead log for crash recovery. Periodically it cuts immutable chunks or blocks, writes them to disk, and later compacts them into larger files.

Delta-of-delta timestamp compression stores the change in interval rather than every full timestamp. With a stable 15-second scrape interval, the delta-of-delta is often zero or very small. XOR value compression stores the XOR between neighboring floating-point values, which is compact when values change slowly or repeat. These techniques can reduce samples from 16 raw bytes to a few bytes.

Labels should not be repeated on each sample. Store labels once in the series catalog and index, then store sample chunks by series id. This avoids huge write amplification and keeps the hot path append-oriented.
`,
    },
    {
      topic: "Query engine and PromQL-like execution",
      detailMD: `
A query engine first resolves selectors. For example, a selector for metric **http_requests_total** with labels service equals checkout and region equals us-east-1 becomes an intersection of postings lists from the inverted index. The result is a set of series ids to read.

The engine then fetches chunks for the requested time range, decodes samples, aligns them to evaluation steps, and applies functions. Rate calculations need enough points before and after counter resets. Aggregations such as sum by service merge series while preserving chosen grouping labels.

The main risk is fanout. A small-looking query can match millions of series if a label matcher is broad. The frontend should estimate cost before execution, enforce maximum series and sample counts, split work by time and shard, cache common dashboard results, and cancel queries that exceed budget.
`,
    },
    {
      topic: "Downsampling, rollups, and retention tiers",
      detailMD: `
Raw 15-second samples are valuable during active incidents but expensive for multi-year retention. Older data is usually queried at coarser resolution, such as 5 minutes or 1 hour. Rollup workers can aggregate count, sum, min, max, last value, and histogram buckets into lower-resolution blocks.

Rollups are not just storage compression; they are also query acceleration. A 30-day dashboard with a 5-minute step should not decode every 15-second raw sample if a precomputed 5-minute rollup exists. The query planner should choose the lowest-cost resolution that satisfies the requested step and accuracy.

Downsampling can lose detail. Spikes shorter than the rollup interval may be hidden unless min and max are retained. Percentiles require histograms or sketches, not just average values. A good design clearly states what accuracy is preserved in each tier.
`,
    },
  ],
  scaling: [
    {
      stage: "Prototype: single-node TSDB",
      detailMD: `
Start with one Prometheus-like server that scrapes targets, stores local TSDB blocks on SSD, and serves queries. This is simple and reliable for a small team, but storage, query, and ingestion compete on the same node.
`,
    },
    {
      stage: "Team scale: replicated scrapers and remote write",
      detailMD: `
Add multiple scrape managers for availability, push gateways for short-lived jobs, and remote write to a central backend. Use a durable ingestion log so local scrape failures or backend restarts do not immediately lose samples.
`,
    },
    {
      stage: "Organization scale: sharded distributed TSDB",
      detailMD: `
Partition series by tenant and series id across many writer shards. Store metadata in a shared catalog, maintain an inverted index, replicate hot chunks, and route queries through a frontend that fans out only to relevant shards.
`,
    },
    {
      stage: "Long retention scale: object storage and rollups",
      detailMD: `
Move compacted immutable blocks and downsampled rollups to object storage. Keep recent raw chunks on SSD for fast incident debugging. Use tier-aware query planning so month-long dashboards read rollups instead of raw samples.
`,
    },
    {
      stage: "Global scale: federation and tenant isolation",
      detailMD: `
Run regional ingestion clusters close to workloads and federate selected aggregates to a global view. Keep raw data regional when possible, replicate critical service-level aggregates, and enforce per-tenant quotas across regions.
`,
    },
  ],
  bottlenecks: [
    {
      issue: "Cardinality explosion from unbounded labels",
      optimizationMD: `
Apply label policies at ingestion, maintain active series budgets, block known dangerous labels, cap label values, and alert users on the top metrics by new series growth. Prefer exemplars or traces for request-level identifiers instead of metric labels.
`,
    },
    {
      issue: "Hot ingestion shards",
      optimizationMD: `
Shard by a hash of tenant and series id rather than metric name alone. Add virtual shards, rebalance partitions gradually, and isolate very large tenants. Batch writes and keep samples for one series ordered on a single shard.
`,
    },
    {
      issue: "Write amplification from indexes and compaction",
      optimizationMD: `
Store labels once per series, append samples to chunks, batch index updates, and compact immutable blocks in the background. Rate-limit compaction and rollup workers so they do not compete with foreground writes.
`,
    },
    {
      issue: "Broad queries matching millions of series",
      optimizationMD: `
Use postings-list indexes, query cost estimation, maximum series limits, result caching for dashboards, and rollup selection for large time ranges. Require users to add selective labels for expensive queries.
`,
    },
    {
      issue: "Scrape storms at interval boundaries",
      optimizationMD: `
Add jitter to scrape schedules, spread targets across the interval, and apply per-target timeout budgets. Avoid all scrapers firing exactly every 15 seconds because synchronized scrapes create network and ingest spikes.
`,
    },
    {
      issue: "High-cardinality histograms",
      optimizationMD: `
Standardize histogram buckets, limit label combinations on bucket metrics, and aggregate bucket counts before long retention. Native histograms or sketches can reduce bucket explosion, but they still need tenant-level controls.
`,
    },
  ],
  failureHandling: [
    {
      scenario: "TSDB writer shard crashes",
      strategyMD: `
Replay the shard's ingestion log partition or write-ahead log on a replacement worker. Keep partition ownership in a coordinator, use checkpointed offsets, and make sample writes idempotent by series id and timestamp.
`,
    },
    {
      scenario: "Ingestion log is unavailable",
      strategyMD: `
Gateways should apply backpressure and return retryable errors rather than accepting samples that cannot be made durable. Agents can buffer for a bounded time, but the system should surface ingestion freshness gaps clearly.
`,
    },
    {
      scenario: "Series catalog or index is degraded",
      strategyMD: `
Existing series can continue writing from cached mappings for a short period, but new series creation should be restricted. Queries that need fresh label discovery may return partial results with warnings until the index catches up.
`,
    },
    {
      scenario: "Object storage is slow or unavailable",
      strategyMD: `
Recent dashboards should continue from hot TSDB storage. Long-range historical queries can degrade or fail gracefully. Compaction and rollup workers should retry with exponential backoff and avoid deleting source blocks before successful writes are verified.
`,
    },
    {
      scenario: "Query frontend overload",
      strategyMD: `
Protect ingestion by isolating query resources. Enforce concurrency limits, per-tenant query budgets, caching, cancellation, and priority lanes for alert evaluation. Return clear errors for queries that exceed cost limits.
`,
    },
    {
      scenario: "Bad client emits millions of new series",
      strategyMD: `
Cardinality controllers should detect sudden new-series growth, block new series for the tenant or metric, and keep accepting known safe series if possible. Notify owners with examples of offending labels and suggested fixes.
`,
    },
  ],
  security: [
    {
      label: "Tenant authentication and authorization",
      detailMD: `
All push, scrape, metadata, and query APIs need authenticated tenant identity. Query authorization should restrict users to allowed workspaces and prevent cross-tenant label or series discovery.
`,
    },
    {
      label: "Transport security",
      detailMD: `
Scrapes and pushes should use TLS where possible, with mutual TLS or signed tokens for agents. Scrapers need secure handling of credentials used to reach targets.
`,
    },
    {
      label: "Sensitive data in labels",
      detailMD: `
Labels can accidentally contain emails, customer ids, access tokens, paths, or IP addresses. Enforce label policies, value length limits, redaction rules, and retention controls. Do not treat metric labels as a safe place for personal data.
`,
    },
    {
      label: "Ingestion denial of service",
      detailMD: `
Attackers or buggy clients can send huge payloads, future timestamps, too many labels, or endless new series. Use payload limits, timestamp windows, quotas, rate limits, and per-tenant isolation.
`,
    },
    {
      label: "Query abuse prevention",
      detailMD: `
Expensive queries can consume CPU, memory, and object storage bandwidth. Require authentication, estimate query cost, cap matched series and samples, and audit repeated heavy queries.
`,
    },
    {
      label: "Auditability",
      detailMD: `
Record changes to scrape configs, retention policies, label limits, dashboard permissions, and alert rules. During incidents, teams need to know whether missing data came from a system failure, a config change, or an intentional quota.
`,
    },
  ],
  tradeoffs: {
    pros: [
      "Append-oriented TSDB storage fits high-volume time-series writes.",
      "Pull and push collection cover both long-running services and short-lived jobs.",
      "Label indexes enable flexible PromQL-like filtering and aggregation.",
      "Downsampling and object storage make long retention economically feasible.",
      "Sharding by series keeps samples ordered while scaling ingestion horizontally.",
    ],
    cons: [
      "Label flexibility creates cardinality risk and complex quota management.",
      "PromQL-like queries can fan out unpredictably and require strong cost controls.",
      "Rollups reduce cost but can hide short spikes or lose percentile accuracy if designed poorly.",
      "Distributed TSDB operation adds compaction, index consistency, and shard rebalancing complexity.",
      "Supporting both push and pull increases product and operational surface area.",
    ],
    alternativesMD: `
Alternative one is a pure Prometheus-per-team model. It is simple, easy to operate for small teams, and excellent for local reliability, but global querying, long retention, and cross-team governance become harder.

Alternative two is a StatsD-only push pipeline into a stream processor and columnar OLAP store. It is easy for applications to emit counters and timers, but target liveness, scrape health, and rich label discovery are weaker than pull-based monitoring.

Alternative three is to store metrics as logs and aggregate them later. This can reuse logging infrastructure, but it is far more expensive for high-frequency numeric time series and usually cannot match TSDB query latency or compression.
`,
    whenNotToUseMD: `
Do not use a metrics platform as the source of truth for billing, financial transactions, audit logs, or request-level debugging. Metrics are aggregated, sampled, rolled up, and eventually expired. Use logs, traces, event streams, or transactional databases when every individual event must be preserved exactly.
`,
  },
  followUpQuestions: [
    {
      question: "How do you define a unique time series?",
      answerMD: `
A unique series is the combination of tenant, metric name, and the complete normalized label set. Labels must be sorted and canonicalized so equivalent sets produce the same series id. The metric type should also be tracked and kept consistent.
`,
    },
    {
      question: "Why is high cardinality dangerous?",
      answerMD: `
Every new label combination creates a new series with metadata, index entries, chunks, memory overhead, and query fanout. One unbounded label such as request_id can create millions of series, increasing cost and slowing queries even if each series has only a few samples.
`,
    },
    {
      question: "When would you prefer pull collection over push collection?",
      answerMD: `
Prefer pull for long-running services because the monitoring system controls intervals, discovers targets, and knows when a target disappears. Use push for short-lived jobs, serverless, network-restricted environments, and legacy StatsD-style clients.
`,
    },
    {
      question: "Why are histograms usually better than summaries for fleet-wide percentiles?",
      answerMD: `
Histogram bucket counts can be summed across instances and then used to estimate quantiles. Client-side summary quantiles are already aggregated locally and cannot be combined accurately across many instances.
`,
    },
    {
      question: "How should the system shard writes?",
      answerMD: `
Shard by tenant and series id hash so samples for one series stay ordered on the same writer while different series spread across many shards. Use virtual shards and gradual rebalancing to handle growth and tenant skew.
`,
    },
    {
      question: "How do you answer a 30-day dashboard query efficiently?",
      answerMD: `
Use downsampled rollups when the requested step is coarse enough. The query planner can read 5-minute or hourly rollup blocks from object storage instead of decoding every raw 15-second sample for the full range.
`,
    },
    {
      question: "What happens to late or out-of-order samples?",
      answerMD: `
Allow a bounded lateness window and write late samples into the current mutable head block or a small correction block. Very old samples should be rejected or sent to a backfill path because rewriting compacted blocks causes high write amplification.
`,
    },
  ],
  companyVariations: [
    {
      company: "Amazon",
      angleMD: `
Amazon interviewers often push on operational excellence, multi-AZ durability, cost, noisy-neighbor isolation, and DynamoDB or Kinesis-style partitioning. Be ready to explain ingestion backpressure, shard ownership, and alarms for cardinality explosions.
`,
    },
    {
      company: "Microsoft",
      angleMD: `
Microsoft may frame the design around Azure Monitor, enterprise tenants, compliance, role-based access control, and hybrid cloud agents. Discuss secure scraping, workspace isolation, retention policies, and integration with alerting.
`,
    },
    {
      company: "Databricks",
      angleMD: `
Databricks is likely to probe large-scale time-series analytics, lakehouse storage, compaction, query planning, and separation of compute from storage. Emphasize immutable blocks, rollups, columnar or object storage tiers, and efficient aggregation.
`,
    },
    {
      company: "Snowflake",
      angleMD: `
Snowflake-style discussions may focus on multi-tenant data isolation, elastic query compute, cost governance, and long-retention analytics. Explain how raw ingest, downsampled aggregates, and metadata indexes can be separated for independent scaling.
`,
    },
  ],
  relatedQuestions: [
    {
      slug: "monitoring-system",
      note: "Metrics collection is a core data source for dashboards, alerts, and SLO monitoring.",
    },
    {
      slug: "logging-system",
      note: "Logs complement metrics with event detail and share ingestion, retention, and query tradeoffs.",
    },
    {
      slug: "distributed-cache",
      note: "Query frontends cache dashboard results, label values, and hot metadata to reduce repeated fanout.",
    },
    {
      slug: "kafka",
      note: "A partitioned durable log is a natural buffer between ingestion gateways and TSDB writers.",
    },
    {
      slug: "cloud-monitoring",
      note: "Cloud monitoring combines metrics, logs, alerts, dashboards, and tenant governance at platform scale.",
    },
  ],
  interviewTips: {
    commonMistakes: [
      "Treating labels as free-form without discussing cardinality limits.",
      "Repeating labels on every sample instead of storing series metadata once.",
      "Using summaries for global percentile aggregation without explaining the accuracy problem.",
      "Letting expensive queries compete directly with ingestion resources.",
      "Ignoring downsampling and retention tiers for long-term storage cost.",
      "Designing only push or only pull without acknowledging the tradeoffs.",
    ],
    redFlags: [
      "No concrete sample rate, storage, or retention math.",
      "No distinction between counters, gauges, histograms, and summaries.",
      "No inverted index or equivalent way to resolve label matchers.",
      "No plan for out-of-order samples, writer crashes, or replay.",
      "No cost controls for high-cardinality queries.",
    ],
    expectations: [
      "State assumptions for active series, scrape interval, sample rate, compression, and retention.",
      "Describe both pull scraping and push ingestion, then converge them into one pipeline.",
      "Explain series identity, labels, cardinality explosion, and quota enforcement.",
      "Use a TSDB storage engine with WAL, chunks, delta-of-delta timestamps, and XOR values.",
      "Separate ingestion, storage writing, rollups, and query serving.",
      "Discuss sharding by series, federation, and rollup tiers for scale.",
    ],
    communicationMD: `
Lead with the core data model: metric name plus labels becomes a series, and samples append over time. Then draw the ingestion path, emphasizing durability and cardinality checks before storage. After that, explain the query path with inverted indexes and rollups. Use concrete numbers early because capacity math makes the tradeoffs clear: millions of series and 15-second scrapes quickly become billions of samples per day.
`,
  },
  revisionNotesMD: `
- A metrics platform stores time series: tenant plus metric name plus normalized labels maps to a series id, and samples append by timestamp.
- Metric types matter: counters need rate and reset handling, gauges are instantaneous, histograms aggregate across instances, and summaries are hard to aggregate globally.
- Pull scraping gives central control and target health; push ingestion is better for short-lived jobs, serverless, network boundaries, and StatsD-style clients.
- Cardinality is the biggest product and infrastructure risk. Unbounded labels such as user_id, request_id, trace_id, and raw path can create millions of series.
- With 3M active series and 15-second scrapes, average ingestion is about 200,000 samples per second and 17.3B samples per day.
- Raw 16-byte timestamp and value pairs would be about 276 GB per day before compression. TSDB compression can reduce chunks to roughly 35 to 70 GB per day before replication and indexes.
- The write path should validate, resolve series ids, append to a durable log, and route by series id to TSDB writer shards.
- The TSDB engine uses a write-ahead log, in-memory head chunks, immutable blocks, compaction, delta-of-delta timestamps, and XOR value compression.
- Query execution resolves label selectors through an inverted index, reads raw chunks or rollups, applies functions and aggregations, and enforces cost limits.
- Long retention needs downsampling: keep raw data for recent debugging, 5-minute rollups for medium retention, and hourly rollups for long-term trends.
- Scale with shard ownership, virtual shards, regional ingestion, object storage blocks, federation for global views, and tenant-level quotas.
`,
  flashcards: [
    {
      front: "What defines a unique metric time series?",
      back: "Tenant plus metric name plus the complete normalized label set.",
    },
    {
      front: "Why are labels both powerful and dangerous?",
      back: "They enable filtering and aggregation, but each distinct label combination creates another series with storage, index, and query cost.",
    },
    {
      front: "What is the difference between a counter and a gauge?",
      back: "A counter monotonically increases except for resets and is usually queried with rate; a gauge is an instantaneous value that can go up or down.",
    },
    {
      front: "Why are histograms preferred for distributed percentiles?",
      back: "Histogram buckets can be summed across instances, while summary quantiles are computed client-side and cannot be merged accurately.",
    },
    {
      front: "What does delta-of-delta compression optimize?",
      back: "It compresses timestamps by storing changes in the sample interval, which are often zero or small for regular scrapes.",
    },
    {
      front: "What does XOR compression optimize?",
      back: "It compresses floating-point values by storing the XOR with the previous value, which is compact when values change slowly.",
    },
    {
      front: "Why use an ingestion log before TSDB writers?",
      back: "It provides durability, buffering, replay, and partitioned ordering by series before samples are appended to storage shards.",
    },
    {
      front: "Why downsample metrics?",
      back: "Older data is usually queried at coarser resolution, so rollups reduce storage and speed long-range queries while preserving trends.",
    },
    {
      front: "How should writes be sharded?",
      back: "Hash tenant and series id so one series remains ordered on one shard while many series spread across writers.",
    },
  ],
  quiz: [
    {
      question: "What creates a new time series in a metrics platform?",
      options: ["A new sample value for an existing metric", "A unique metric name plus full label set within a tenant", "A dashboard refresh", "A new query range step"],
      answerIndex: 1,
      explanationMD: `
Series identity is based on tenant, metric name, and the complete normalized label set. New sample values for the same labels append to the existing series.
`,
    },
    {
      question: "Which label is most likely to cause cardinality explosion?",
      options: ["region", "service", "request_id", "status_code"],
      answerIndex: 2,
      explanationMD: `
request_id can be unique per request, creating a new series for almost every event. Labels should describe bounded dimensions, not individual requests.
`,
    },
    {
      question: "Why are histograms generally easier to aggregate across instances than summaries?",
      options: ["Histograms do not use labels", "Histogram bucket counts can be summed across instances", "Summaries are always gauges", "Histograms avoid storage entirely"],
      answerIndex: 1,
      explanationMD: `
Histogram buckets are counters that can be summed by bucket boundary and then used for percentile estimates. Summary quantiles are precomputed locally and are not generally mergeable.
`,
    },
    {
      question: "With 3M active series and a 15-second scrape interval, what is the average ingest rate?",
      options: ["20,000 samples per second", "200,000 samples per second", "3M samples per second", "17.3B samples per second"],
      answerIndex: 1,
      explanationMD: `
3M active series divided by 15 seconds is 200,000 samples per second.
`,
    },
    {
      question: "Which storage technique is most specific to efficient TSDB sample storage?",
      options: ["Delta-of-delta timestamps and XOR value compression", "Full-text inverted documents only", "Storing labels with every sample", "Synchronous cross-region joins"],
      answerIndex: 0,
      explanationMD: `
Metrics samples are ordered by time and often change gradually, so delta-of-delta timestamp compression and XOR value compression are effective.
`,
    },
    {
      question: "What should the query engine do before executing a broad label selector?",
      options: ["Bypass authentication", "Estimate cost and enforce series or sample limits", "Delete old rollups", "Convert all counters to gauges"],
      answerIndex: 1,
      explanationMD: `
Broad selectors can match millions of series. The query frontend should estimate matched series, samples, and time range cost before execution.
`,
    },
    {
      question: "Why are rollups useful for long-range dashboards?",
      options: ["They preserve every raw sample forever", "They make push collection unnecessary", "They let queries read coarser precomputed data instead of all raw samples", "They eliminate the need for labels"],
      answerIndex: 2,
      explanationMD: `
Long-range dashboards usually need coarse steps. Precomputed 5-minute or hourly rollups reduce data scanned and speed queries at lower cost.
`,
    },
  ],
  cheatSheetMD: `
**Goal**: collect, store, and query high-volume time-series metrics from services and infrastructure.

**Data model**: tenant plus metric name plus normalized labels equals one series. Samples are timestamp and value pairs appended to that series.

**Metric types**: counters for monotonically increasing totals, gauges for current values, histograms for aggregatable distributions, summaries for client-side quantiles with limited aggregation.

**Collection**: pull scraping gives central control and target health. Push ingestion supports short-lived jobs, serverless, agents, and StatsD. Normalize both into one internal sample pipeline.

**Capacity anchor**: 3M active series at 15-second intervals is about 200,000 samples per second and 17.3B samples per day.

**Storage**: use WAL, in-memory head chunks, immutable compressed blocks, compaction, and object storage. Use delta-of-delta timestamps and XOR values. Store labels once per series, not per sample.

**Indexes**: use an inverted index from label name and value to compressed postings lists of series ids. Query selectors intersect postings lists before reading chunks.

**Cardinality**: enforce quotas on active series, labels per metric, label value length, and new series rate. Block request_id, user_id, trace_id, and raw path labels unless explicitly allowed.

**Queries**: parse PromQL-like expressions, estimate cost, select raw or rollup data, fan out to shards, merge results, and enforce timeouts.

**Retention**: keep raw recent data for debugging, 5-minute rollups for months, hourly rollups for years, and delete or compact expired blocks asynchronously.

**Scaling**: shard by tenant and series id, replicate recent data, isolate large tenants, run regional ingestion clusters, and federate selected aggregates for global views.
`,
  references: [
    {
      title: "Prometheus Documentation",
      kind: "Docs",
      url: "https://prometheus.io/docs/introduction/overview/",
      author: "Prometheus Authors",
    },
    {
      title: "Gorilla: A Fast, Scalable, In-Memory Time Series Database",
      kind: "Paper",
      url: "https://www.vldb.org/pvldb/vol8/p1816-teller.pdf",
      author: "Tuomas Pelkonen and others",
    },
    {
      title: "Designing Data-Intensive Applications",
      kind: "Book",
      author: "Martin Kleppmann",
    },
    {
      title: "OpenTelemetry Metrics Data Model",
      kind: "Docs",
      url: "https://opentelemetry.io/docs/specs/otel/metrics/data-model/",
      author: "OpenTelemetry Authors",
    },
  ],
};
