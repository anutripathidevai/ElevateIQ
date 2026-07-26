import type { SDQuestionContent } from "../types";

export const monitoringSystemContent: SDQuestionContent = {
  slug: "monitoring-system",
  statementMD: `
Design a Monitoring System like Datadog, New Relic, or Azure Monitor. The platform receives telemetry from applications, hosts, containers, cloud services, and synthetic probes, then turns that telemetry into dashboards, alerts, SLOs, error budgets, traces, logs, and incident notifications.

At interview scale, assume a multi-tenant SaaS product with thousands of customer teams, hundreds of thousands of monitored resources, and large bursts during incidents. The core challenge is not pure metrics collection; this system consumes metrics, logs, traces, and health checks, correlates them, evaluates alert rules over time windows, suppresses noise, and routes actionable incidents to the right on-call owner.

The default design should optimize for reliable ingestion, bounded query latency, correct alert evaluation, durable incident history, and alert fatigue reduction. Optional advanced features such as anomaly detection, service maps, synthetic monitoring, and SLO burn-rate alerts should layer on top of the same telemetry and alerting foundations.
`,
  businessUseCaseMD: `
Engineering and operations teams use monitoring platforms to detect outages before customers complain, understand regressions after deploys, and measure whether services are meeting reliability targets. A strong platform shortens mean time to detect and mean time to recover by bringing metrics, logs, traces, dashboards, and paging workflows into one place.

For businesses, observability protects revenue and trust. It helps teams enforce SLOs, prioritize reliability work using error budgets, reduce noisy alerts, and give executives a shared view of service health across products, regions, and customer tiers.
`,
  functionalRequirements: [
    "Ingest metrics from agents, OpenTelemetry collectors, application SDKs, and cloud integrations.",
    "Ingest logs and traces, preserve correlation fields such as service, environment, host, trace ID, and request ID.",
    "Store and query time-series data with tags, rollups, retention tiers, and dashboard-friendly aggregations.",
    "Search logs and traces by time range, service, severity, labels, trace ID, and sampled request attributes.",
    "Let users create dashboards with charts, service health panels, trace waterfalls, log widgets, and SLO widgets.",
    "Evaluate alert rules over sliding windows for thresholds, missing data, anomaly signals, synthetic checks, and burn-rate conditions.",
    "Deduplicate, group, silence, acknowledge, and resolve alerts to reduce alert fatigue and flapping.",
    "Route notifications through escalation policies to email, Slack, Teams, webhooks, and PagerDuty-style on-call systems.",
  ],
  nonFunctionalRequirements: [
    {
      label: "Ingestion latency",
      detailMD: `
Fresh telemetry should become queryable within 10 to 30 seconds for metrics and within 30 to 60 seconds for logs and traces. Alert evaluation should detect most threshold violations within one evaluation interval after the relevant window closes.
`,
    },
    {
      label: "Alert availability",
      detailMD: `
The alerting path must be more reliable than dashboards. During a partial outage, ingestion and alert evaluation for critical metrics should continue even if expensive log search, trace exploration, or non-critical dashboards are degraded.
`,
    },
    {
      label: "Scalability and cardinality control",
      detailMD: `
The system must handle millions of samples per second while protecting itself from unbounded tag cardinality. Tenant quotas, label allow lists, rollups, sampling, and backpressure are required so one customer or one bad deploy cannot exhaust shared storage.
`,
    },
    {
      label: "Query performance",
      detailMD: `
Common dashboard queries over recent rollups should complete in under 1 second p95. Wider exploratory queries over raw logs, high-cardinality metrics, or long trace windows can be slower but should have timeouts, result limits, and progressive loading.
`,
    },
    {
      label: "Durability and retention",
      detailMD: `
Telemetry can be lossy under extreme pressure, but alert state, rule definitions, SLO definitions, audit logs, and incident history must be durable. Metrics, logs, and traces need configurable retention tiers with replication and backups for customer commitments.
`,
    },
    {
      label: "Correctness and idempotency",
      detailMD: `
The ingestion path should tolerate retries without double-counting counters or creating duplicate log batches. Alert evaluation must use stable windows, handle late data explicitly, and avoid repeatedly paging the same incident unless escalation policy requires it.
`,
    },
    {
      label: "Multi-tenancy and isolation",
      detailMD: `
Tenants need strict data isolation, separate quotas, per-team RBAC, and noisy-neighbor protection. Query, ingestion, and alerting capacity should be partitioned enough that a large customer's incident does not delay smaller customers' critical alerts.
`,
    },
  ],
  capacityEstimation: {
    assumptionsMD: `
Assume 100,000 monitored resources across hosts, containers, serverless functions, databases, and managed cloud services. Each resource emits 200 active metric series on average, sampled once every 10 seconds. Assume logs average 1 KB per second per resource after filtering, and traces are sampled to 500,000 spans per second across the fleet.

Assume 80 bytes per encoded metric sample before compression, 250 bytes per sampled trace span after basic attribute pruning, 30 days of log retention, 45 days of metric retention, 7 days of raw trace retention, 200,000 active alert rules, and a 10x burst multiplier during large incidents or regional outages.
`,
    metrics: [
      {
        label: "Monitored resources",
        value: "100,000 resources",
        note: "Hosts, containers, services, databases, and synthetic checks",
      },
      {
        label: "Active metric series",
        value: "20M series",
        note: "100,000 resources times 200 active series",
      },
      {
        label: "Average metric ingest",
        value: "2M samples per second",
        note: "20M active series sampled once every 10 seconds",
      },
      {
        label: "Peak metric ingest",
        value: "20M samples per second",
        note: "10x burst during incidents, autoscaling events, or bad deployments",
      },
      {
        label: "Metric storage",
        value: "155 TB compressed for 45 days",
        note: "2M samples per second times 80 bytes, compressed about 4:1",
      },
      {
        label: "Log ingest",
        value: "100 MB per second",
        note: "100,000 resources times 1 KB per second",
      },
      {
        label: "Log storage",
        value: "86 TB compressed for 30 days",
        note: "8.6 TB raw per day compressed about 3:1",
      },
      {
        label: "Trace ingest",
        value: "500K spans per second",
        note: "Sampled spans after head or tail sampling policies",
      },
      {
        label: "Trace storage",
        value: "76 TB compressed for 7 days",
        note: "500K spans per second times 250 bytes for 7 days",
      },
      {
        label: "Alert evaluations",
        value: "3,300 evaluations per second",
        note: "200,000 alert rules evaluated once per minute",
      },
      {
        label: "Dashboard query traffic",
        value: "5,000 peak QPS",
        note: "Interactive dashboards, incident war rooms, and API consumers",
      },
    ],
    calculationsMD: `
- Metric series: 100,000 monitored resources times 200 active series is 20M active series.
- Metric ingest: 20M series sampled once every 10 seconds is 2M samples per second on average. A 10x burst gives 20M samples per second.
- Metric storage: 2M samples per second times 80 bytes is 160 MB per second raw. That is about 13.8 TB per day raw. With 4:1 compression, store about 3.45 TB per day. Over 45 days, reserve about 155 TB before replicas and index overhead.
- Log ingest: 100,000 resources times 1 KB per second is 100 MB per second. That is about 8.6 TB per day raw. With 3:1 compression over 30 days, reserve about 86 TB before replicas and search index overhead.
- Trace ingest: 500,000 sampled spans per second times 250 bytes is 125 MB per second. That is about 10.8 TB per day. Over 7 days, reserve about 76 TB before replication.
- Alert evaluations: 200,000 active rules evaluated every 60 seconds means about 3,333 rule evaluations per second. The engine should evaluate from precomputed rollups rather than scanning raw samples.
- Notifications: if 1 percent of alert rules fire during a major outage, that is 2,000 initial alert events. Grouping by service, region, and severity should collapse this into far fewer incidents before paging humans.
`,
  },
  apiDesign: {
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/telemetry/metrics",
        descriptionMD: `
Receives batches of metric samples from agents, collectors, SDKs, or cloud integrations. The gateway authenticates the tenant, validates label limits, and writes the accepted batch to the ingestion stream.
`,
        request: `
{
  "tenantId": "tenant_123",
  "source": "otel-collector",
  "samples": [
    {
      "metric": "http.server.duration.p95",
      "timestamp": "2026-07-26T06:59:00Z",
      "value": 183,
      "tags": {
        "service": "checkout",
        "region": "us-east-1",
        "environment": "prod"
      }
    }
  ]
}
`,
        response: `
{
  "accepted": 4800,
  "rejected": 12,
  "nextAllowedAt": "2026-07-26T06:59:10Z"
}
`,
        statusCodes: [
          { code: 202, meaning: "Batch accepted for asynchronous processing" },
          { code: 400, meaning: "Malformed payload or invalid metric name" },
          { code: 401, meaning: "Invalid ingestion token" },
          { code: 413, meaning: "Batch too large" },
          { code: 429, meaning: "Tenant ingestion quota exceeded" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/telemetry/logs",
        descriptionMD: `
Accepts structured log batches. Logs should already be redacted by agents where possible, but the server also applies schema validation, tenant quotas, and optional sampling.
`,
        request: `
{
  "tenantId": "tenant_123",
  "logs": [
    {
      "timestamp": "2026-07-26T06:59:05Z",
      "service": "checkout",
      "severity": "ERROR",
      "traceId": "tr_abc123",
      "message": "Payment authorization timed out",
      "attributes": {
        "region": "us-east-1",
        "deploy": "2026.07.26.4"
      }
    }
  ]
}
`,
        response: `
{
  "accepted": 1000,
  "sampledOut": 200,
  "redactedFields": ["card_number"]
}
`,
        statusCodes: [
          { code: 202, meaning: "Logs accepted" },
          { code: 400, meaning: "Invalid log schema" },
          { code: 401, meaning: "Invalid ingestion token" },
          { code: 429, meaning: "Log ingestion quota exceeded" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/telemetry/traces",
        descriptionMD: `
Receives trace spans in batches. The system preserves parent-child relationships, indexes trace IDs, and supports head or tail sampling depending on tenant policy.
`,
        request: `
{
  "tenantId": "tenant_123",
  "spans": [
    {
      "traceId": "tr_abc123",
      "spanId": "sp_1",
      "parentSpanId": "sp_0",
      "service": "checkout",
      "operation": "POST /checkout",
      "startTime": "2026-07-26T06:59:01Z",
      "durationMs": 742,
      "status": "error"
    }
  ]
}
`,
        response: `
{
  "accepted": 520,
  "sampleRate": 0.1
}
`,
        statusCodes: [
          { code: 202, meaning: "Spans accepted" },
          { code: 400, meaning: "Invalid trace payload" },
          { code: 401, meaning: "Invalid ingestion token" },
          { code: 429, meaning: "Trace ingestion quota exceeded" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/query",
        descriptionMD: `
Runs a dashboard or exploration query across time-series, logs, traces, or correlated telemetry. The query service enforces RBAC, tenant limits, timeouts, and maximum result sizes.
`,
        request: `
{
  "tenantId": "tenant_123",
  "queryType": "timeseries",
  "expression": "p95:http.server.duration{service=checkout,environment=prod}",
  "from": "2026-07-26T06:00:00Z",
  "to": "2026-07-26T07:00:00Z",
  "resolutionSeconds": 60
}
`,
        response: `
{
  "series": [
    {
      "labels": {
        "service": "checkout",
        "environment": "prod"
      },
      "points": [
        { "timestamp": "2026-07-26T06:59:00Z", "value": 183 }
      ]
    }
  ],
  "partial": false
}
`,
        statusCodes: [
          { code: 200, meaning: "Query completed" },
          { code: 206, meaning: "Partial result returned before timeout" },
          { code: 400, meaning: "Invalid query expression" },
          { code: 403, meaning: "Caller lacks access to the requested tenant or resource" },
          { code: 429, meaning: "Query rate limit exceeded" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/alert-rules",
        descriptionMD: `
Creates an alert rule using a time-series query, evaluation interval, window, threshold, grouping labels, no-data behavior, and routing policy.
`,
        request: `
{
  "tenantId": "tenant_123",
  "name": "Checkout p95 latency too high",
  "query": "p95:http.server.duration{service=checkout,environment=prod}",
  "window": "5m",
  "evaluationInterval": "1m",
  "condition": {
    "operator": ">",
    "threshold": 500
  },
  "groupBy": ["service", "region"],
  "silenceWindows": [],
  "route": "payments-primary-oncall"
}
`,
        response: `
{
  "ruleId": "rule_456",
  "state": "enabled",
  "nextEvaluationAt": "2026-07-26T07:00:00Z"
}
`,
        statusCodes: [
          { code: 201, meaning: "Alert rule created" },
          { code: 400, meaning: "Invalid rule or query" },
          { code: 403, meaning: "Caller cannot create alert rules for this tenant" },
          { code: 409, meaning: "Duplicate rule name in this scope" },
        ],
      },
      {
        method: "PATCH",
        path: "/api/v1/incidents/{incidentId}",
        descriptionMD: `
Acknowledges, resolves, reassigns, or silences an active incident. This endpoint changes alert state and escalation behavior, not historical telemetry.
`,
        request: `
{
  "action": "silence",
  "durationMinutes": 60,
  "reason": "Known deploy rollback in progress",
  "actor": "user_789"
}
`,
        response: `
{
  "incidentId": "inc_789",
  "state": "silenced",
  "silencedUntil": "2026-07-26T08:00:00Z"
}
`,
        statusCodes: [
          { code: 200, meaning: "Incident state updated" },
          { code: 400, meaning: "Invalid action" },
          { code: 403, meaning: "Caller cannot modify this incident" },
          { code: 404, meaning: "Incident not found" },
          { code: 409, meaning: "State transition is no longer valid" },
        ],
      },
    ],
    notesMD: `
Ingestion APIs are asynchronous because the gateway should validate, quota-check, and enqueue telemetry quickly. Query and configuration APIs are synchronous because users expect immediate feedback when saving dashboards, rules, silences, and SLO definitions.

The monitoring system should support OpenTelemetry, Prometheus remote write, syslog-style log forwarding, and cloud provider integrations at the edge, but the internal API should normalize all formats into a tenant-aware telemetry envelope.
`,
  },
  databaseDesign: {
    schemaMD: `
The system uses different storage engines for different access patterns. Metrics are optimized for time-range scans and rollups, logs are optimized for text and attribute search, traces are optimized for trace ID lookup and service graph analysis, and alert state is optimized for durable state transitions.

The relational-looking schema below describes logical entities. At production scale, the metric and event tables map to a distributed time-series store, columnar object storage, and search indexes rather than one monolithic relational database.
`,
    tables: [
      {
        name: "metric_series",
        columns: [
          { name: "series_id", type: "uuid", note: "Stable identifier derived from tenant, metric name, and normalized tag set" },
          { name: "tenant_id", type: "uuid", note: "Tenant partition and authorization boundary" },
          { name: "metric_name", type: "varchar(255)", note: "Canonical metric name after normalization" },
          { name: "tag_hash", type: "binary(16)", note: "Hash of sorted tags for fast lookup and deduplication" },
          { name: "tag_set", type: "json", note: "Bounded set of dimensions such as service, region, host, and environment" },
          { name: "retention_tier", type: "varchar(32)", note: "Raw, hourly rollup, daily rollup, or premium long retention" },
          { name: "first_seen_at", type: "timestamp", note: "First sample time" },
          { name: "last_seen_at", type: "timestamp", note: "Most recent accepted sample time" },
        ],
      },
      {
        name: "metric_chunks",
        columns: [
          { name: "tenant_id", type: "uuid", note: "Partition key prefix" },
          { name: "series_id", type: "uuid", note: "Metric series identifier" },
          { name: "bucket_start", type: "timestamp", note: "Start of the compressed time bucket" },
          { name: "resolution_seconds", type: "int", note: "Raw or rollup resolution" },
          { name: "encoded_samples", type: "blob", note: "Compressed samples using delta and Gorilla-style encoding" },
          { name: "min_value", type: "double", note: "Precomputed minimum for faster aggregations" },
          { name: "max_value", type: "double", note: "Precomputed maximum for faster aggregations" },
          { name: "sum_value", type: "double", note: "Precomputed sum for rate and average calculations" },
          { name: "sample_count", type: "bigint", note: "Number of samples in the bucket" },
        ],
      },
      {
        name: "telemetry_event_index",
        columns: [
          { name: "tenant_id", type: "uuid", note: "Tenant partition" },
          { name: "event_type", type: "varchar(16)", note: "Log or span" },
          { name: "event_time", type: "timestamp", note: "Event timestamp" },
          { name: "service", type: "varchar(255)", note: "Service name for filtering and correlation" },
          { name: "severity", type: "varchar(32) nullable", note: "Log severity when event is a log" },
          { name: "trace_id", type: "varchar(64) nullable", note: "Trace identifier for logs and spans" },
          { name: "span_id", type: "varchar(64) nullable", note: "Span identifier when event is a trace span" },
          { name: "attributes", type: "json", note: "Indexed bounded attributes" },
          { name: "object_key", type: "varchar(512)", note: "Pointer to compressed raw payload in object storage" },
        ],
      },
      {
        name: "alert_rules",
        columns: [
          { name: "rule_id", type: "uuid", note: "Primary key" },
          { name: "tenant_id", type: "uuid", note: "Tenant owner" },
          { name: "name", type: "varchar(255)", note: "Human-readable rule name" },
          { name: "query", type: "text", note: "Time-series or synthetic check expression" },
          { name: "evaluation_interval_seconds", type: "int", note: "How often the rule evaluates" },
          { name: "window_seconds", type: "int", note: "Lookback window for the condition" },
          { name: "condition", type: "json", note: "Threshold, anomaly, no-data, or burn-rate condition" },
          { name: "group_by", type: "json", note: "Labels used for alert grouping" },
          { name: "route_id", type: "uuid", note: "Notification route or escalation policy" },
          { name: "enabled", type: "boolean", note: "Whether the rule is active" },
        ],
      },
      {
        name: "alert_incidents",
        columns: [
          { name: "incident_id", type: "uuid", note: "Primary key for an alert incident" },
          { name: "tenant_id", type: "uuid", note: "Tenant boundary" },
          { name: "rule_id", type: "uuid", note: "Alert rule that produced the incident" },
          { name: "fingerprint", type: "varchar(255)", note: "Deduplication key derived from rule, tenant, and grouping labels" },
          { name: "state", type: "varchar(32)", note: "Triggered, acknowledged, silenced, resolved, or suppressed" },
          { name: "severity", type: "varchar(32)", note: "Page, ticket, warning, or info" },
          { name: "started_at", type: "timestamp", note: "First time the condition became active" },
          { name: "last_fired_at", type: "timestamp", note: "Most recent evaluation that matched" },
          { name: "dedupe_count", type: "bigint", note: "Number of repeated firings collapsed into this incident" },
          { name: "silenced_until", type: "timestamp nullable", note: "Silence expiry if active" },
        ],
      },
    ],
    indexesMD: `
- **metric_series.tenant_id, metric_name, tag_hash** supports series lookup during ingestion and query planning.
- **metric_chunks.tenant_id, series_id, bucket_start** is the primary access path for dashboard and alert window scans.
- **telemetry_event_index.tenant_id, event_time, service** supports recent log and trace exploration by service and time.
- **telemetry_event_index.trace_id** supports direct trace waterfall retrieval and log-to-trace correlation.
- **alert_rules.tenant_id, enabled** lets scheduler shards find active rules for a tenant.
- **alert_incidents.tenant_id, fingerprint, state** enforces deduplication of active incidents.
`,
    relationshipsMD: `
Each tenant owns metric series, event indexes, alert rules, dashboards, notification routes, SLOs, and incidents. Alert rules reference metric queries or synthetic check streams and create alert incidents through a dedupe fingerprint. Logs and spans share correlation identifiers so a dashboard point can jump to related logs or a trace waterfall without joining on the ingestion hot path.
`,
    noSqlAlternativesMD: `
Metrics are usually stored in a specialized time-series database or columnar store such as M3, Cortex, Thanos, VictoriaMetrics, ClickHouse, Druid, Bigtable, or a custom LSM-backed TSDB. Logs fit object storage plus a search index or columnar lake. Traces fit a span store indexed by trace ID, service, operation, and time.

Rule definitions, silences, routes, SLO definitions, audit logs, and incident state can live in a strongly consistent relational database or a replicated key-value store because they are smaller but more correctness-sensitive than raw telemetry.
`,
  },
  architecture: {
    width: 1080,
    height: 600,
    nodes: [
      { id: "operators", label: "Operators", kind: "client", x: 80, y: 80, sublabel: "Dashboards, APIs" },
      { id: "workloads", label: "Monitored Workloads", kind: "client", x: 80, y: 250, sublabel: "Apps, hosts, cloud" },
      { id: "synthetic-probers", label: "Synthetic Probers", kind: "worker", x: 80, y: 430, sublabel: "Health checks" },
      { id: "collectors", label: "Agents and Collectors", kind: "service", x: 250, y: 250, sublabel: "OTel, logs, stats" },
      { id: "ingestion-gateway", label: "Ingestion Gateway", kind: "gateway", x: 420, y: 250, sublabel: "Auth, quotas" },
      { id: "telemetry-bus", label: "Telemetry Bus", kind: "queue", x: 570, y: 250, sublabel: "Kafka, Kinesis" },
      { id: "stream-processors", label: "Stream Processors", kind: "worker", x: 720, y: 210, sublabel: "Normalize, roll up" },
      { id: "time-series-store", label: "Time-Series Store", kind: "database", x: 910, y: 120, sublabel: "Metrics, rollups" },
      { id: "log-trace-store", label: "Log and Trace Store", kind: "search", x: 910, y: 300, sublabel: "Search, object store" },
      { id: "query-api", label: "Query and Dashboard API", kind: "service", x: 570, y: 80, sublabel: "Charts, correlation" },
      { id: "alert-engine", label: "Alert Engine", kind: "worker", x: 720, y: 460, sublabel: "Rules, SLOs" },
      { id: "alert-state-store", label: "Alert State Store", kind: "database", x: 910, y: 460, sublabel: "Incidents, silences" },
      { id: "notification-router", label: "Notification Router", kind: "service", x: 1030, y: 430, sublabel: "Escalations" },
      { id: "oncall-tools", label: "On-call Tools", kind: "external", x: 1030, y: 540, sublabel: "PagerDuty, Slack" },
    ],
    edges: [
      { from: "workloads", to: "collectors", label: "metrics, logs, traces" },
      { from: "synthetic-probers", to: "ingestion-gateway", label: "check results" },
      { from: "collectors", to: "ingestion-gateway", label: "batched telemetry" },
      { from: "ingestion-gateway", to: "telemetry-bus", label: "accepted batches" },
      { from: "telemetry-bus", to: "stream-processors", label: "consume streams" },
      { from: "stream-processors", to: "time-series-store", label: "samples and rollups" },
      { from: "stream-processors", to: "log-trace-store", label: "logs and spans" },
      { from: "operators", to: "query-api", label: "dashboard query" },
      { from: "query-api", to: "time-series-store", label: "range query" },
      { from: "query-api", to: "log-trace-store", label: "search and traces" },
      { from: "alert-engine", to: "time-series-store", label: "evaluate windows" },
      { from: "alert-engine", to: "alert-state-store", label: "dedupe state" },
      { from: "alert-state-store", to: "alert-engine", label: "silences" },
      { from: "alert-engine", to: "notification-router", label: "incident events" },
      { from: "notification-router", to: "oncall-tools", label: "page or ticket", dashed: true },
      { from: "query-api", to: "alert-state-store", label: "incident views" },
    ],
    captionMD: `
Telemetry ingestion flows from monitored workloads through agents, gateways, queues, processors, and specialized stores. Dashboards query the stores, while alert evaluation reads rollups, updates durable alert state, and sends grouped incidents to notification routing.
`,
  },
  architectureNotesMD: `
The architecture separates the ingestion path, query path, and alerting path. Ingestion must absorb bursts, normalize formats, enforce tenant quotas, and fan telemetry into the right stores. Query APIs serve dashboards and investigations, but they should not sit on the critical alert paging path.

Metrics, logs, and traces have different storage needs. Metrics use a time-series store with compressed chunks and rollups. Logs and traces use object storage plus searchable indexes. Correlation comes from shared labels, trace IDs, service names, deploy versions, and timestamps rather than from forcing all telemetry into one database.

Alerting is a first-class subsystem. The alert engine reads precomputed rollups, evaluates rules on stable windows, deduplicates by fingerprint, respects silences and maintenance windows, and hands incidents to the notification router for escalation.
`,
  requestFlow: [
    {
      title: "Telemetry is emitted by workloads",
      detailMD: `
Applications, hosts, containers, managed services, and SDKs emit metrics, logs, and spans. Agents and OpenTelemetry collectors batch data locally, attach tenant and environment metadata, redact obvious secrets, and retry on transient network failures.
`,
    },
    {
      title: "Synthetic checks create health signals",
      detailMD: `
Regional probers run HTTP checks, TCP checks, browser flows, and API canaries against customer endpoints. Their results are converted into metrics and events so they can drive dashboards, alerts, and SLO calculations alongside application telemetry.
`,
    },
    {
      title: "Ingestion gateway validates and queues",
      detailMD: `
The gateway authenticates the ingestion token, checks tenant quotas, validates schema, rejects dangerous label explosions, and writes accepted batches to the telemetry bus. It returns 202 after durable enqueue rather than waiting for downstream indexing.
`,
    },
    {
      title: "Stream processors normalize telemetry",
      detailMD: `
Consumers parse formats, normalize units, compute derived fields, enforce sampling policies, drop or quarantine malformed payloads, and attach routing keys. They also compute metric rollups so dashboards and alert rules do not scan raw samples for common windows.
`,
    },
    {
      title: "Metrics, logs, and traces land in specialized stores",
      detailMD: `
Metric chunks are written to the time-series store by tenant, series, and time bucket. Logs and spans are compressed into object storage and indexed by time, service, severity, trace ID, and selected attributes for search and correlation.
`,
    },
    {
      title: "Dashboards query recent rollups",
      detailMD: `
An operator opens a dashboard. The query API authorizes access, plans queries against the right rollup resolution, fans out to metric and event stores when needed, and returns partial results if a large panel exceeds its timeout.
`,
    },
    {
      title: "Alert rules evaluate on schedules",
      detailMD: `
Scheduler shards assign active rules to alert workers. Each worker reads the relevant rollup window, applies threshold or burn-rate logic, handles no-data behavior, and writes a stable evaluation result with a rule and group fingerprint.
`,
    },
    {
      title: "Alert state is deduplicated and grouped",
      detailMD: `
The alert engine checks existing incidents, suppression rules, silences, maintenance windows, and flapping dampeners. Repeated firings update the same incident rather than paging every minute, while resolved evaluations close incidents after a recovery window.
`,
    },
    {
      title: "Notifications route through escalation policies",
      detailMD: `
Actionable incident events go to the notification router. It selects the on-call team, delivery channel, retry policy, escalation delay, and fallback contact, then sends pages, chat messages, tickets, or webhooks with links back to dashboards and traces.
`,
    },
  ],
  coreComponents: [
    {
      name: "Agents and OpenTelemetry Collectors",
      kind: "service",
      role: "Collect local telemetry and forward it reliably.",
      detailMD: `
Agents scrape metrics, tail logs, receive spans, attach resource metadata, redact sensitive fields, batch payloads, and retry with backoff. They should buffer locally for short outages but shed low-priority telemetry when disk limits are reached.
`,
    },
    {
      name: "Ingestion Gateway",
      kind: "gateway",
      role: "Protects the platform from invalid, unauthenticated, or excessive telemetry.",
      detailMD: `
The gateway verifies tokens, maps requests to tenants, enforces rate and cardinality quotas, validates schemas, applies backpressure, and durably appends accepted data to the telemetry bus. It keeps customer-facing ingestion stable even when processors scale up or recover.
`,
    },
    {
      name: "Telemetry Bus",
      kind: "queue",
      role: "Decouples ingestion spikes from downstream processing.",
      detailMD: `
Kafka, Kinesis, Pulsar, or Pub/Sub buffers metric, log, trace, and synthetic streams by tenant and telemetry type. Retention on the bus provides replay during processor failures and allows separate consumers for storage, alerting, anomaly detection, and billing.
`,
    },
    {
      name: "Metrics Pipeline and Time-Series Store",
      kind: "database",
      role: "Stores compressed samples and rollups for dashboards and alerts.",
      detailMD: `
The metrics pipeline deduplicates retries, computes rates and percentiles where appropriate, down-samples old data, and stores compressed chunks. The store is partitioned by tenant, metric, series hash, and time to support efficient range scans.
`,
    },
    {
      name: "Log and Trace Store",
      kind: "search",
      role: "Supports search, trace waterfall retrieval, and cross-telemetry correlation.",
      detailMD: `
Logs and spans are written to compressed object storage and indexed for recent search. Trace IDs provide direct lookup, while service, operation, severity, deployment, and request attributes support incident investigation.
`,
    },
    {
      name: "Alert Evaluation Engine",
      kind: "worker",
      role: "Evaluates rules, SLO burn rates, missing data, and synthetic check failures.",
      detailMD: `
Alert workers evaluate rules on fixed schedules using precomputed rollups, handle late data policies, compute incident fingerprints, suppress flapping, and update durable alert state. They must be deterministic enough that retries do not create duplicate pages.
`,
    },
    {
      name: "Notification Router and Escalation Manager",
      kind: "service",
      role: "Turns alert incidents into targeted human notifications.",
      detailMD: `
The router applies routing rules, team ownership, severity policies, on-call schedules, retries, escalation chains, and channel preferences. It integrates with PagerDuty-style systems, Slack, Teams, email, SMS, tickets, and customer webhooks.
`,
    },
    {
      name: "Dashboard and Query API",
      kind: "service",
      role: "Provides interactive visualization and investigation workflows.",
      detailMD: `
The API plans queries, chooses raw or rollup resolution, merges metrics with related logs and traces, enforces RBAC, caches common panels, and returns progressive or partial results for expensive investigations.
`,
    },
  ],
  deepDives: [
    {
      topic: "Metrics, logs, and traces are complementary",
      detailMD: `
A monitoring system should explain the three pillars clearly. Metrics are compact numerical time series that answer what changed and when. Logs are detailed event records that explain why a specific error happened. Traces connect work across services and show where latency or errors occurred in a distributed request.

The platform should not treat them as interchangeable. Metrics power alerting, dashboards, and SLO burn-rate calculations because they are cheap to aggregate. Logs support debugging and audit trails, but they are more expensive to index and query. Traces provide request-level causality, but sampling is usually required. Correlation fields such as trace ID, service, region, deploy version, customer tier, and timestamp let users move from an alert to the relevant logs and traces quickly.
`,
    },
    {
      topic: "Time-series ingestion, rollups, and cardinality",
      detailMD: `
The time-series store is optimized around tenant, metric name, tag set, and time bucket. Compression works well when samples for the same series arrive in order and have similar timestamps or values. Rollups at 1 minute, 5 minutes, 1 hour, and 1 day resolutions keep long-range dashboards affordable.

The biggest operational risk is cardinality explosion. A label such as request_id, user_id, session_id, or raw URL can create millions of unique series and make both storage and queries fail. The ingestion gateway and processors should enforce label allow lists, drop unbounded labels, limit unique series per tenant, and surface cardinality reports so customers can fix instrumentation.
`,
    },
    {
      topic: "Alert rule evaluation over time-series windows",
      detailMD: `
Alert rules should evaluate on stable, bounded windows instead of querying arbitrary raw data every second. A threshold rule might evaluate the last 5 minutes every 1 minute. A burn-rate rule might evaluate both 5-minute and 1-hour windows to catch fast outages without paging on tiny blips.

Rule workers should shard by tenant and rule ID, read rollup chunks, apply no-data semantics, and write an idempotent evaluation result. For counters, the engine must handle resets. For percentiles, it should use histogram summaries or sketches rather than averaging p95 values incorrectly. Late data should be either ignored after a grace period or handled through explicit re-evaluation policies.
`,
    },
    {
      topic: "Deduplication, grouping, silencing, and escalation",
      detailMD: `
Paging one person for every matching time series is a common failure mode. The system should compute an incident fingerprint from tenant, rule, service, environment, region, and chosen group labels. Repeated firings update the same incident with dedupe_count and last_fired_at rather than creating a new page every minute.

Grouping collapses related alerts into one incident view. Silences and maintenance windows suppress known work. Escalation policies decide when to page primary on-call, secondary on-call, managers, or a customer webhook. Recovery windows prevent flapping by requiring the condition to remain healthy for several evaluations before resolving.
`,
    },
    {
      topic: "SLOs, SLIs, and error budgets",
      detailMD: `
An SLI is a measured reliability signal such as successful requests divided by total requests, p99 latency under a threshold, or synthetic checkout success rate. An SLO is the target for that SLI over a window, such as 99.9 percent success over 30 days. The error budget is the allowed badness left before the team violates the SLO.

The monitoring system should compute SLO windows from metrics and synthetic checks, show remaining budget, and alert on burn rate instead of only absolute error count. Multi-window burn-rate alerts reduce noise by paging when the service is burning budget both quickly and consistently.
`,
    },
    {
      topic: "Logs, traces, sampling, and cost control",
      detailMD: `
Logs and traces can dwarf metric volume. The system should encourage structured logs, field redaction, per-tenant quotas, dynamic sampling, and retention tiers. High-value error traces can be kept at a higher rate than routine successful traces.

Tail sampling can keep traces with errors, high latency, or rare routes after seeing the full request. Head sampling is cheaper and simpler but may drop the one trace needed during an incident. A premium design lets teams configure sampling by service, route, status, tenant tier, and incident mode.
`,
    },
  ],
  scaling: [
    {
      stage: "Prototype: one region and managed stores",
      detailMD: `
Start with OpenTelemetry collectors, a managed queue, a managed time-series database, a search service for logs, and a relational database for alert rules and incidents. Evaluate rules every minute and send notifications through one provider. This proves the product workflow without building every storage engine.
`,
    },
    {
      stage: "Growth: partition by tenant and telemetry type",
      detailMD: `
Split ingestion topics by tenant tier and telemetry type. Add per-tenant quotas, metric rollups, query caching, log retention tiers, and alert scheduler shards. Keep dashboards and alerting separate so expensive investigations do not delay paging.
`,
    },
    {
      stage: "Large scale: custom TSDB and distributed alert engine",
      detailMD: `
Move high-volume metrics into a horizontally sharded time-series store. Partition by tenant, metric, series hash, and time. Run alert workers as a distributed scheduler with leases, idempotent evaluations, and durable alert state. Use object storage for older logs and traces.
`,
    },
    {
      stage: "Multi-tenant SaaS scale: isolation and cost controls",
      detailMD: `
Introduce dedicated ingestion lanes for enterprise tenants, quota-aware query schedulers, cardinality analysis, storage tiering, sampled traces, and customer-visible usage reports. Add regional data residency options and stronger RBAC for regulated customers.
`,
    },
    {
      stage: "Global scale: regional ingestion and replicated control plane",
      detailMD: `
Ingest telemetry in the nearest region, keep alerting local for low latency, and replicate rule definitions, silences, dashboards, and incidents through a control plane. Global dashboards can aggregate rollups asynchronously while regional alerts continue during cross-region failures.
`,
    },
  ],
  bottlenecks: [
    {
      issue: "High-cardinality metric labels",
      optimizationMD: `
Reject or down-rank labels such as request ID, user ID, session ID, and raw URL before they create unbounded series. Enforce tenant cardinality quotas, provide label usage reports, and move high-cardinality debugging data into logs or traces instead of metrics.
`,
    },
    {
      issue: "Alert evaluation scans too much raw data",
      optimizationMD: `
Evaluate rules from precomputed rollups and histogram sketches. Shard rules by tenant and rule ID, cache query plans, limit lookback windows, and precompute SLO burn rates for popular services.
`,
    },
    {
      issue: "Incident storms and alert fatigue",
      optimizationMD: `
Group alerts by service, region, and severity; deduplicate by fingerprint; enforce recovery windows; add maintenance silences; and route warnings to tickets or chat while reserving pages for user-impacting symptoms.
`,
    },
    {
      issue: "Log and trace storage explosion",
      optimizationMD: `
Use structured logging, indexing allow lists, compression, object storage, sampling, retention tiers, and dynamic incident-mode sampling. Do not index every arbitrary field by default.
`,
    },
    {
      issue: "Expensive dashboard queries",
      optimizationMD: `
Use rollups, query result caching, panel-level timeouts, progressive loading, and resolution selection based on time range. Limit ad hoc high-cardinality group-bys and surface partial results instead of blocking the whole dashboard.
`,
    },
    {
      issue: "Hot tenants during major incidents",
      optimizationMD: `
Isolate ingestion and query capacity by tenant tier, apply fair scheduling, reserve alerting capacity, and allow non-critical telemetry to be sampled or delayed while critical SLI metrics continue to flow.
`,
    },
  ],
  failureHandling: [
    {
      scenario: "Agent or collector cannot reach the service",
      strategyMD: `
Agents buffer locally within disk limits, retry with exponential backoff, and expose self-monitoring metrics. When buffers fill, drop low-priority logs or traces before dropping critical health metrics, and mark gaps clearly in dashboards.
`,
    },
    {
      scenario: "Telemetry bus lag grows",
      strategyMD: `
Autoscale consumers, shed non-critical telemetry, increase sampling, and prioritize metric and alert-relevant streams over bulk logs. Alert operators on ingestion freshness so teams know when dashboards may be stale.
`,
    },
    {
      scenario: "Time-series store shard is unavailable",
      strategyMD: `
Route reads to replicas when possible, serve partial dashboard results with clear warnings, and keep alert rules from paging on missing data unless the rule explicitly treats no data as bad. Replay queued samples after recovery.
`,
    },
    {
      scenario: "Alert engine workers fail",
      strategyMD: `
Use scheduler leases so another worker can claim rules after a timeout. Store evaluation checkpoints and incident fingerprints durably so retries are idempotent and do not create duplicate notifications.
`,
    },
    {
      scenario: "Notification provider is down",
      strategyMD: `
Retry with backoff, fail over to secondary channels, escalate through alternate providers, and show delivery status on incidents. The alert state should remain active even if a downstream paging integration is temporarily unavailable.
`,
    },
    {
      scenario: "Bad alert rule causes a storm",
      strategyMD: `
Apply per-rule and per-route notification rate limits, automatic grouping, circuit breakers, and emergency tenant-wide silences. Keep audit logs so teams can identify who changed the rule and roll it back.
`,
    },
    {
      scenario: "Regional outage affects ingestion",
      strategyMD: `
Agents should fail over to another regional ingestion endpoint when policy allows. Control-plane data such as rules and silences should replicate across regions, while regional alert engines continue evaluating the telemetry they can still receive.
`,
    },
  ],
  security: [
    {
      label: "Tenant isolation",
      detailMD: `
Every sample, log, span, rule, dashboard, and incident must carry a tenant boundary. Enforce tenant IDs in storage partition keys, authorization checks, query planning, cache keys, and notification routing.
`,
    },
    {
      label: "Ingestion authentication",
      detailMD: `
Agents and collectors should use scoped ingestion tokens or mutual TLS. Rotate tokens, bind them to tenants and environments, and reject telemetry that attempts to spoof another tenant or reserved system labels.
`,
    },
    {
      label: "PII and secret protection",
      detailMD: `
Logs and spans often contain customer data, tokens, emails, or payment fragments. Redact at the agent when possible, apply server-side detectors, support field-level retention policies, and prevent sensitive fields from being indexed broadly.
`,
    },
    {
      label: "RBAC and auditability",
      detailMD: `
Limit who can view production telemetry, modify alert routes, silence incidents, or change SLO definitions. Record audit events for rule edits, silence creation, escalation changes, dashboard sharing, and token rotation.
`,
    },
    {
      label: "Encryption and retention controls",
      detailMD: `
Encrypt telemetry in transit and at rest. Support customer-defined retention, legal hold where required, deletion workflows, and data residency controls for regulated tenants.
`,
    },
    {
      label: "Abuse and cost controls",
      detailMD: `
Protect public ingestion endpoints from token abuse, replay storms, and deliberate cardinality attacks. Apply quotas, anomaly detection on ingestion patterns, and emergency disablement of compromised tokens.
`,
    },
  ],
  tradeoffs: {
    pros: [
      "Separating metrics, logs, and traces lets each storage engine match its access pattern.",
      "Asynchronous ingestion through a queue absorbs bursts and protects downstream stores.",
      "Rollups make dashboards and alert evaluation predictable at scale.",
      "Durable alert state enables deduplication, grouping, silencing, and escalation without duplicate pages.",
      "SLO and burn-rate alerts focus teams on user impact rather than raw symptom noise.",
    ],
    cons: [
      "Multiple storage systems increase operational complexity and consistency challenges.",
      "Sampling and retention policies can drop the exact log or trace needed for a rare incident.",
      "Strict cardinality limits can surprise customers if instrumentation is not explained well.",
      "Alert grouping reduces noise but can hide distinct root causes if fingerprints are too broad.",
      "Global multi-region ingestion and data residency requirements complicate rule replication and query planning.",
    ],
    alternativesMD: `
Alternative one is a metrics-only monitoring system. It is simpler and cheaper, and it may be enough for infrastructure health, but it cannot provide full incident investigation because logs, traces, SLO context, and notification workflows are missing.

Alternative two is a log-first observability system that stores all telemetry as events in a search engine. It gives flexible debugging, but metric alerting and long-range dashboards become expensive unless rollups and specialized time-series indexes are added.

Alternative three is to rely on separate best-of-breed tools for metrics, logs, tracing, paging, and dashboards. This reduces platform scope but weakens correlation, ownership, consistent RBAC, and alert fatigue controls.
`,
    whenNotToUseMD: `
Do not build a full Datadog-style platform for a small application with a few services and modest reliability needs. Managed monitoring, cloud provider metrics, and a simple paging integration are usually enough until telemetry volume, cross-service debugging, compliance, or alert fatigue justify the complexity.
`,
  },
  followUpQuestions: [
    {
      question: "How is this different from a metrics collection system?",
      answerMD: `
A metrics collection system focuses on scraping, receiving, storing, and querying numerical time series. A monitoring system consumes those metrics and combines them with logs, traces, health checks, dashboards, alert evaluation, deduplication, silencing, notification routing, SLOs, and incident workflows.
`,
    },
    {
      question: "How do you reduce alert fatigue?",
      answerMD: `
Alert on symptoms and SLO burn rates instead of every internal cause. Group related firings, deduplicate by fingerprint, add recovery windows, route warnings to tickets, silence maintenance, suppress known dependencies, and review noisy alerts with ownership and metrics.
`,
    },
    {
      question: "What happens when telemetry arrives late?",
      answerMD: `
Define a grace period per telemetry type. Dashboards can backfill late samples, but alert evaluation should use stable windows and avoid re-paging old incidents unless policy requires it. Late data can update history and SLO reports without rewriting already-delivered notifications.
`,
    },
    {
      question: "How should high-cardinality labels be handled?",
      answerMD: `
Block or drop unbounded labels at ingestion, enforce tenant series quotas, keep allow lists for indexed dimensions, and guide users toward logs or traces for per-request identifiers. Also provide cardinality dashboards so teams can fix instrumentation before it becomes an outage.
`,
    },
    {
      question: "How do you design SLO burn-rate alerts?",
      answerMD: `
Compute an SLI such as good requests divided by total requests, compare it with the SLO target, and calculate how quickly the error budget is being consumed. Use multi-window alerts, for example a short window plus a longer window, to page on sustained user impact while filtering transient spikes.
`,
    },
    {
      question: "How do you ensure alert evaluation is reliable?",
      answerMD: `
Shard rules deterministically, use leases, write idempotent evaluation results, read from rollups, persist incident fingerprints, and monitor the monitoring system itself. Critical rule evaluation should have reserved capacity and should not depend on expensive dashboard queries.
`,
    },
    {
      question: "How do logs and traces connect to a metric alert?",
      answerMD: `
Use shared labels and correlation IDs. A metric alert includes tenant, service, environment, region, deploy version, and time window. The UI uses those fields to pre-filter logs and traces, then trace IDs link individual logs to request waterfalls.
`,
    },
  ],
  companyVariations: [
    {
      company: "Amazon",
      angleMD: `
Amazon interviewers may emphasize CloudWatch-like scale, multi-tenant quotas, DynamoDB or S3-backed storage, operational alarms, cost controls, and keeping alerting alive during regional failures. Be ready to explain partition keys and noisy-neighbor isolation.
`,
    },
    {
      company: "Microsoft",
      angleMD: `
Microsoft may frame this around Azure Monitor, enterprise tenants, RBAC, audit logs, data residency, Teams integration, and hybrid cloud agents. Discuss control-plane durability, customer-managed retention, and strict tenant isolation.
`,
    },
    {
      company: "Netflix",
      angleMD: `
Netflix often cares about large-scale service health, streaming reliability, adaptive alerting, chaos testing, and reducing pages from cascading failures. Emphasize SLOs, regional dashboards, trace sampling, and alert grouping by customer-impacting symptoms.
`,
    },
    {
      company: "Google",
      angleMD: `
Google may push on SRE concepts: SLIs, SLOs, error budgets, burn-rate alerts, Borg-style fleet scale, and the difference between symptoms and causes. Be precise about multi-window alerting and avoiding pages for non-actionable noise.
`,
    },
    {
      company: "LinkedIn",
      angleMD: `
LinkedIn may tie the design to large microservice graphs, member-facing reliability, Kafka-based pipelines, and on-call ownership across many teams. Discuss service dependency mapping, tenant-like product isolation, and incident collaboration workflows.
`,
    },
  ],
  relatedQuestions: [
    {
      slug: "metrics-collection",
      note: "The monitoring platform consumes the metric collection pipeline and adds alerting, dashboards, SLOs, and incident workflows.",
    },
    {
      slug: "logging-system",
      note: "Logs are one of the three pillars and require separate indexing, retention, search, and privacy controls.",
    },
    {
      slug: "notification-service",
      note: "Alert routing and escalation rely on reliable notification delivery to on-call engineers and chat tools.",
    },
    {
      slug: "distributed-queue",
      note: "A durable telemetry bus decouples ingestion spikes from storage, alert evaluation, and replay consumers.",
    },
    {
      slug: "distributed-cache",
      note: "Dashboard query result caching and metadata caching help control latency and cost for repeated panels.",
    },
  ],
  interviewTips: {
    commonMistakes: [
      "Designing only metric scraping and forgetting logs, traces, dashboards, SLOs, deduplication, and paging.",
      "Letting alert rules scan raw telemetry instead of using bounded windows and rollups.",
      "Ignoring cardinality limits until one label creates millions of series.",
      "Paging on every low-level cause instead of user-impacting symptoms and burn rates.",
      "Treating notification delivery as fire-and-forget without retries, escalation, and delivery state.",
      "Assuming logs, metrics, and traces belong in one generic database.",
    ],
    redFlags: [
      "No concrete capacity math for samples per second, storage per day, or rule evaluations.",
      "No distinction between ingestion freshness, query latency, and alert detection latency.",
      "No plan for alert grouping, silencing, maintenance windows, or flapping control.",
      "No tenant isolation or quota model for a multi-tenant observability platform.",
      "No answer for high-cardinality labels, trace sampling, or log retention cost.",
    ],
    expectations: [
      "Clearly separate collection, ingestion, storage, query, alerting, and notification routing.",
      "Explain why metrics, logs, and traces use different storage and retention strategies.",
      "Use rollups and stable evaluation windows for alert rules.",
      "Discuss SLOs, SLIs, error budgets, and burn-rate alerts.",
      "Show how deduplication, grouping, and silencing reduce alert fatigue.",
      "Cover failures of the monitoring system itself, especially alerting and notifications.",
    ],
    communicationMD: `
Start by saying this is an observability and alerting platform, not just a metric scraper. Draw telemetry ingestion first, then split into metric storage, log and trace storage, query APIs, alert evaluation, alert state, and notification routing.

When discussing tradeoffs, keep tying decisions back to human outcomes: fast detection, useful context, fewer noisy pages, and reliable escalation. Interviewers reward candidates who understand that the hardest part of monitoring is turning huge telemetry volume into a small number of actionable incidents.
`,
  },
  revisionNotesMD: `
- A full monitoring system ties together metrics, logs, traces, synthetic checks, dashboards, alerting, notification routing, SLOs, and incident history.
- It consumes metrics collection rather than stopping there. The domain crux is alert evaluation, correlation, deduplication, silencing, escalation, and reducing alert fatigue.
- Metrics are compact time series for alerting and dashboards. Logs provide detailed event context. Traces show distributed request causality.
- Use asynchronous ingestion through a durable telemetry bus so agents and gateways are decoupled from storage and indexing.
- Use a time-series store with compressed chunks, rollups, and retention tiers for metrics. Use object storage plus search indexes for logs and traces.
- Control metric cardinality aggressively. Unbounded labels such as user IDs, request IDs, raw URLs, and session IDs can break ingestion and queries.
- Alert rules should evaluate from rollups over stable windows. Avoid raw scans in the paging path.
- Deduplicate by incident fingerprint, group related firings, respect silences, and use recovery windows to avoid flapping.
- Notification routing needs escalation policies, retries, delivery tracking, and integrations with PagerDuty-style systems, chat, email, SMS, tickets, and webhooks.
- SLOs use SLIs and error budgets. Burn-rate alerts page when the service is consuming budget too quickly and consistently.
- The monitoring system must monitor itself: ingestion lag, alert evaluation lag, dropped telemetry, notification failures, and query latency are all first-class signals.
`,
  flashcards: [
    {
      front: "What are the three pillars of observability?",
      back: "Metrics, logs, and traces. Metrics show numerical health over time, logs explain events, and traces show causality across services.",
    },
    {
      front: "How is monitoring different from metrics collection?",
      back: "Metrics collection gathers and stores time-series samples. Monitoring adds dashboards, alerts, SLOs, deduplication, silencing, notification routing, and incident workflows.",
    },
    {
      front: "Why are rollups important?",
      back: "Rollups make long-range dashboards and alert evaluation predictable by avoiding repeated scans over raw high-volume samples.",
    },
    {
      front: "What is cardinality explosion?",
      back: "It happens when labels create too many unique series, often from request IDs, user IDs, session IDs, or raw URLs.",
    },
    {
      front: "What is an alert fingerprint?",
      back: "A deduplication key derived from tenant, rule, and grouping labels so repeated firings update one incident instead of creating many pages.",
    },
    {
      front: "Why use recovery windows?",
      back: "They prevent flapping by requiring a condition to remain healthy for several evaluations before resolving an incident.",
    },
    {
      front: "What is an error budget?",
      back: "The amount of allowed unreliability remaining before an SLO is violated, usually computed from an SLI over a time window.",
    },
    {
      front: "Why are logs and traces often sampled or tiered?",
      back: "They are much larger than metrics, so sampling and retention tiers control storage, indexing, and query cost.",
    },
    {
      front: "What must notification routing handle?",
      back: "Team ownership, severity, delivery channels, retries, escalation chains, silences, and fallback paths when providers fail.",
    },
  ],
  quiz: [
    {
      question: "What is the best description of this monitoring system's scope?",
      options: ["Only scrape CPU and memory metrics", "Collect metrics, logs, traces, evaluate alerts, manage SLOs, and route incidents", "Only store application logs", "Only send SMS pages"],
      answerIndex: 1,
      explanationMD: `
The platform is an end-to-end observability and alerting system. It consumes metrics but also handles logs, traces, dashboards, alert state, SLOs, and notifications.
`,
    },
    {
      question: "Why should alert rules usually evaluate over rollups instead of raw samples?",
      options: ["Rollups make every alert less accurate by definition", "Raw samples cannot be stored", "Rollups bound query cost and make evaluation latency predictable", "Rollups remove the need for deduplication"],
      answerIndex: 2,
      explanationMD: `
Alert workers need predictable cost and latency. Rollups provide bounded windows and avoid scanning huge raw sample sets for every evaluation.
`,
    },
    {
      question: "Which label is most likely to cause high-cardinality problems if used on every metric?",
      options: ["environment", "region", "request_id", "service"],
      answerIndex: 2,
      explanationMD: `
request_id is unique or nearly unique per request, which can create millions of time series. It belongs in logs or traces, not as a metric label.
`,
    },
    {
      question: "What does alert deduplication primarily prevent?",
      options: ["Metric compression", "Repeated pages for the same ongoing incident", "Trace sampling", "Dashboard authorization"],
      answerIndex: 1,
      explanationMD: `
Deduplication uses an incident fingerprint so repeated firings update the same incident instead of creating a new notification every evaluation interval.
`,
    },
    {
      question: "What is a good default strategy for logs and traces at high volume?",
      options: ["Index every field forever", "Store them in the metric chunks table", "Use structured fields, sampling, retention tiers, and object storage plus search indexes", "Drop all traces because metrics are enough"],
      answerIndex: 2,
      explanationMD: `
Logs and traces are high-volume and expensive. Structured indexing, sampling, retention tiers, and object storage keep them useful without overwhelming cost.
`,
    },
    {
      question: "What is the purpose of SLO burn-rate alerting?",
      options: ["To alert when an error budget is being consumed too quickly", "To replace all dashboards", "To count raw log lines", "To page on every CPU spike"],
      answerIndex: 0,
      explanationMD: `
Burn-rate alerts compare recent bad events against the remaining error budget. They focus paging on sustained user-impacting reliability risk.
`,
    },
    {
      question: "During a notification provider outage, what should the monitoring system do?",
      options: ["Mark all incidents resolved", "Retry forever without showing status", "Retry, fail over to alternate channels, and keep incident state active", "Stop ingesting telemetry"],
      answerIndex: 2,
      explanationMD: `
Alert state should remain active. The router should retry, use fallback channels or providers, and expose delivery status so operators understand notification risk.
`,
    },
  ],
  cheatSheetMD: `
**Goal**: build an observability and alerting platform that connects metrics, logs, traces, synthetic checks, dashboards, SLOs, incidents, and notification escalation.

**Workload**: with 100,000 monitored resources and 200 active metric series each, expect about 20M active series and 2M metric samples per second. Logs at 1 KB per second per resource are about 100 MB per second. Sampled traces at 500K spans per second are another high-volume stream.

**Ingestion**: agents and collectors batch telemetry, gateways authenticate and enforce quotas, and a durable telemetry bus decouples ingestion from processing.

**Storage**: metrics go to a time-series store with compressed chunks and rollups. Logs and traces go to object storage plus search indexes. Alert rules, silences, routes, SLOs, and incidents go to a durable control-plane store.

**Query**: dashboards should use rollups, caching, timeouts, and progressive loading. Correlate telemetry using service, environment, region, deploy, timestamp, trace ID, and request ID.

**Alerting**: evaluate rules on stable windows from rollups. Handle no-data semantics, counter resets, late data, and idempotent retries.

**Noise control**: deduplicate by fingerprint, group related firings, silence maintenance, use recovery windows, and route only actionable severity to human pages.

**SLOs**: define SLIs, SLO targets, and error budgets. Use multi-window burn-rate alerts to page on sustained user impact.

**Failures**: monitor ingestion lag, processor lag, alert evaluation lag, dropped telemetry, query latency, notification delivery, and the monitoring system's own health.

**Security**: enforce tenant isolation, scoped ingestion tokens, RBAC, audit logs, encryption, retention controls, redaction, and cost protection against cardinality attacks.
`,
  references: [
    {
      title: "Site Reliability Engineering",
      kind: "Book",
      url: "https://sre.google/sre-book/table-of-contents/",
      author: "Google",
    },
    {
      title: "OpenTelemetry Documentation",
      kind: "Docs",
      url: "https://opentelemetry.io/docs/",
      author: "OpenTelemetry",
    },
    {
      title: "Prometheus Documentation",
      kind: "Docs",
      url: "https://prometheus.io/docs/introduction/overview/",
      author: "Prometheus",
    },
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
  ],
};
