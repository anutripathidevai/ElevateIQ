import type { SDQuestionContent } from "../types";

export const apiGatewayContent: SDQuestionContent = {
  slug: "api-gateway",
  statementMD: `
Design an API Gateway for a large microservices platform. The gateway sits at the edge between external clients and internal services. It must route requests by host, path, method, headers, and tenant, terminate TLS where appropriate, enforce authentication and authorization, apply quotas, and proxy traffic to healthy backend services.

At interview scale, assume hundreds of microservices, thousands of routes, multiple client types, and traffic bursts from web, mobile, partner, and internal clients. The hard part is not forwarding HTTP packets; it is building a reliable data plane that makes fast per-request decisions while a safer control plane manages configuration, policies, rollout, and service discovery.

A strong design keeps the gateway stateless on the hot path, avoids turning it into a giant business-logic monolith, and treats the gateway as a platform primitive. Services should not each reinvent JWT validation, API key checks, rate limits, retries, logging, tracing, or TLS handling, but they must still own their domain logic and fine-grained business authorization.
`,
  businessUseCaseMD: `
API gateways let organizations expose many backend services through a small number of stable public APIs. They reduce client complexity, centralize cross-cutting concerns, and provide a consistent place to enforce security, quotas, observability, and reliability policies.

They are especially valuable for microservice platforms, partner APIs, mobile backends, and multi-tenant SaaS products. A well-designed gateway improves developer velocity because new services can publish routes and policies through configuration instead of building edge infrastructure from scratch.
`,
  functionalRequirements: [
    "Route incoming requests based on host, path prefix, method, headers, tenant, and route priority.",
    "Terminate TLS at the edge or pass through TLS when a service requires end-to-end encryption.",
    "Authenticate callers using JWT, OAuth tokens, API keys, or mTLS client certificates.",
    "Authorize requests using scopes, roles, tenant boundaries, and route-level policy rules.",
    "Apply rate limits, quotas, request size limits, and burst controls per user, token, tenant, IP, and API plan.",
    "Discover healthy backend service instances and load balance requests across them.",
    "Support request and response transformation, header enrichment, version translation, and backend-for-frontend aggregation.",
    "Emit metrics, structured access logs, audit logs, and distributed traces for every route and dependency.",
  ],
  nonFunctionalRequirements: [
    {
      label: "Latency",
      detailMD: `
The gateway is on every request, so it should add less than 5ms p50 and less than 25ms p99 overhead inside a region for simple proxy routes. Expensive features such as token introspection or aggregation must be cached or isolated so they do not dominate tail latency.
`,
    },
    {
      label: "Availability",
      detailMD: `
The data plane should target at least 99.99 percent availability and keep proxying with the last known good configuration when the control plane is unavailable. A gateway outage can take down many products at once, so every region and availability zone needs redundant gateway capacity.
`,
    },
    {
      label: "Scalability",
      detailMD: `
The gateway fleet must scale horizontally by request volume, TLS handshakes, policy evaluation CPU, and network bandwidth. Route lookup, auth checks, rate limits, and service discovery reads must be local or cached on the data plane.
`,
    },
    {
      label: "Configuration consistency",
      detailMD: `
Route and policy changes need versioned rollout, validation, canarying, rollback, and auditability. Data-plane instances can be eventually consistent for most changes, but security revocations and emergency blocks need fast propagation or deny-list overrides.
`,
    },
    {
      label: "Security isolation",
      detailMD: `
A tenant or partner should not be able to exhaust shared gateway capacity, bypass authorization, poison route configuration, or read another tenant's traffic. Enforce strict identity, tenancy, input validation, and plugin sandbox boundaries.
`,
    },
    {
      label: "Resilience",
      detailMD: `
Timeouts, retries, circuit breakers, outlier detection, and backpressure must protect backend services. The gateway should fail closed for security decisions, fail open only for explicitly safe non-critical telemetry, and avoid retry storms.
`,
    },
    {
      label: "Operability",
      detailMD: `
Operators need route-level dashboards, config diffing, synthetic probes, error budgets, trace correlation, and per-policy metrics. Debuggability matters because a wrong route or filter can look like a backend outage to clients.
`,
    },
  ],
  capacityEstimation: {
    assumptionsMD: `
Assume 20M daily active users, 250 gateway requests per active user per day, 500 backend microservices, 12,000 configured routes, three active regions, 70 percent authenticated traffic, average request metadata plus small body of 3 KB, average backend response of 8 KB, and 1 KB of structured log data per request.

Use a 10x peak multiplier for diurnal traffic and product launches. Assume a gateway instance can safely sustain 8,000 simple proxy requests per second at 60 percent CPU after reserving headroom for TLS, policy evaluation, and occasional retries.
`,
    metrics: [
      {
        label: "Gateway requests",
        value: "5B per day",
        note: "20M active users times 250 requests per day",
      },
      {
        label: "Average ingress QPS",
        value: "57,900 requests per second",
        note: "5B divided by 86,400 seconds",
      },
      {
        label: "Peak ingress QPS",
        value: "579,000 requests per second",
        note: "10x average peak",
      },
      {
        label: "Peak QPS per region",
        value: "193,000 requests per second",
        note: "Evenly spread across three active regions before failover headroom",
      },
      {
        label: "Authenticated traffic",
        value: "40,500 auth checks per second average",
        note: "70 percent of average gateway QPS",
      },
      {
        label: "Rate-limit operations",
        value: "116,000 counter operations per second average",
        note: "Two token-bucket operations per request for user and tenant dimensions",
      },
      {
        label: "Route configuration",
        value: "120 MB normalized config",
        note: "12,000 routes times about 10 KB including policies and compiled matchers",
      },
      {
        label: "Access log volume",
        value: "5 TB per day raw",
        note: "5B requests times 1 KB per structured log before compression",
      },
      {
        label: "Average response bandwidth",
        value: "463 MB per second",
        note: "57,900 requests per second times 8 KB response payload and headers",
      },
      {
        label: "Gateway fleet size",
        value: "90 to 120 instances at global peak",
        note: "579,000 peak QPS divided by 8,000 QPS per instance plus zone and rollout headroom",
      },
    ],
    calculationsMD: `
- Requests: 20M active users times 250 calls per user per day equals 5B gateway requests per day.
- Average QPS: 5B divided by 86,400 seconds is about 57,870 requests per second, rounded to 57,900.
- Peak QPS: a 10x multiplier gives about 579,000 requests per second globally. With three active regions, the steady peak is about 193,000 per region before failover reserves.
- Auth checks: 70 percent authenticated traffic means about 40,500 token or key checks per second on average. Most checks must use local JWT verification, cached public keys, or cached introspection results.
- Rate limits: if the gateway updates both user and tenant buckets, average counter traffic is about 115,800 operations per second. At peak it is about 1.16M operations per second, so the design needs local batching, sharding, or distributed token buckets.
- Config memory: 12,000 routes times 10 KB is about 120 MB of normalized route and policy data. Every data-plane instance can keep this in memory, but rollout and validation should avoid loading broken snapshots.
- Logs: 5B requests times 1 KB is about 5 TB raw logs per day. Compression and sampling help, but security audit events and error logs should remain durable.
- Bandwidth: average response egress is 57,900 times 8 KB, about 463 MB per second. Peak response egress is about 4.6 GB per second, before retries and TLS overhead.
- Fleet: at 8,000 requests per second per instance, 579,000 peak requests need about 73 instances. Add availability-zone, deployment, failover, and noisy-route headroom to plan for 90 to 120 instances globally.
`,
  },
  apiDesign: {
    endpoints: [
      {
        method: "POST",
        path: "/admin/v1/routes",
        descriptionMD: `
Creates a route definition in the control plane. The control plane validates host and path conflicts, compiles match rules, attaches a policy chain, and includes the route in the next signed config snapshot.
`,
        request: `
{
  "name": "orders-checkout-v1",
  "hosts": ["api.example.com"],
  "pathPrefix": "/orders/v1/checkout",
  "methods": ["POST"],
  "upstreamService": "orders-service",
  "policyChainId": "policy_checkout_public",
  "priority": 100
}
`,
        response: `
{
  "routeId": "route_7f3a",
  "version": 41,
  "status": "staged",
  "conflicts": []
}
`,
        statusCodes: [
          { code: 201, meaning: "Route staged" },
          { code: 400, meaning: "Invalid host, path, method, or upstream" },
          { code: 401, meaning: "Control-plane authentication required" },
          { code: 403, meaning: "Caller cannot manage this tenant or environment" },
          { code: 409, meaning: "Route overlaps with a higher-priority route" },
        ],
      },
      {
        method: "PATCH",
        path: "/admin/v1/routes/{routeId}/policies",
        descriptionMD: `
Updates the policy chain for a route, such as JWT issuer, required scopes, rate-limit plan, timeout, retry budget, cache policy, and transformation rules. The update creates a new route version rather than mutating live data-plane state directly.
`,
        request: `
{
  "requiredScopes": ["orders.write"],
  "rateLimitPolicyId": "tenant_standard_write",
  "timeoutMs": 800,
  "retryPolicy": {
    "maxAttempts": 2,
    "retryOn": ["connect-failure", "reset"]
  },
  "requestTransformId": "checkout_mobile_v2"
}
`,
        response: `
{
  "routeId": "route_7f3a",
  "version": 42,
  "status": "staged",
  "requiresRollout": true
}
`,
        statusCodes: [
          { code: 200, meaning: "Policy staged" },
          { code: 400, meaning: "Invalid policy" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Insufficient admin permission" },
          { code: 404, meaning: "Route not found" },
        ],
      },
      {
        method: "POST",
        path: "/admin/v1/consumers/{consumerId}/api-keys",
        descriptionMD: `
Issues an API key for a partner or service consumer. Only a salted hash is stored. The returned secret is shown once and is later validated by the gateway through a local or cached credential lookup.
`,
        request: `
{
  "displayName": "partner-mobile-prod",
  "scopes": ["catalog.read", "orders.write"],
  "quotaPlanId": "partner_gold",
  "expiresAt": "2027-07-26T00:00:00Z"
}
`,
        response: `
{
  "keyId": "key_b23d",
  "apiKey": "shown-once-secret-value",
  "expiresAt": "2027-07-26T00:00:00Z"
}
`,
        statusCodes: [
          { code: 201, meaning: "API key issued" },
          { code: 400, meaning: "Invalid scopes, quota plan, or expiration" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Caller cannot manage this consumer" },
          { code: 429, meaning: "Credential creation rate limit exceeded" },
        ],
      },
      {
        method: "POST",
        path: "/admin/v1/config-snapshots/{snapshotId}/rollouts",
        descriptionMD: `
Starts a controlled rollout of a signed gateway configuration snapshot. Rollouts can target one canary cell, one region, a percentage of gateway instances, or the full fleet after health checks pass.
`,
        request: `
{
  "strategy": "canary-then-linear",
  "initialPercent": 1,
  "stepPercent": 20,
  "healthGate": {
    "maxFiveXxRate": 0.01,
    "maxAddedLatencyMsP99": 10
  }
}
`,
        response: `
{
  "rolloutId": "rollout_991",
  "snapshotId": "snap_1802",
  "state": "running",
  "currentPercent": 1
}
`,
        statusCodes: [
          { code: 202, meaning: "Rollout accepted" },
          { code: 400, meaning: "Invalid rollout plan" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Caller cannot deploy gateway config" },
          { code: 409, meaning: "Another rollout is active" },
        ],
      },
      {
        method: "GET",
        path: "/admin/v1/routes/{routeId}/metrics",
        descriptionMD: `
Returns route-level metrics from the telemetry pipeline for debugging and capacity planning. Operators use this to determine whether errors come from the gateway, auth dependency, rate limiter, or backend service.
`,
        response: `
{
  "routeId": "route_7f3a",
  "window": "5m",
  "requestsPerSecond": 18420,
  "p99GatewayOverheadMs": 18,
  "backendFiveXxRate": 0.004,
  "rateLimitedRequests": 921,
  "circuitBreakerOpen": false
}
`,
        statusCodes: [
          { code: 200, meaning: "Metrics returned" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Caller cannot view route metrics" },
          { code: 404, meaning: "Route not found" },
        ],
      },
      {
        method: "POST",
        path: "/orders/v1/checkout",
        descriptionMD: `
Example data-plane request exposed through the gateway. The gateway matches the route, validates identity and scopes, applies quotas, transforms headers, selects a healthy orders-service instance, and proxies the request.
`,
        request: `
POST /orders/v1/checkout HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJSUzI1NiJ9
Idempotency-Key: idem_123

{
  "cartId": "cart_123",
  "paymentMethodId": "pm_456"
}
`,
        response: `
HTTP/1.1 201 Created
Traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
X-RateLimit-Remaining: 118

{
  "orderId": "ord_789",
  "status": "confirmed"
}
`,
        statusCodes: [
          { code: 201, meaning: "Backend service created the order" },
          { code: 400, meaning: "Request rejected by validation or backend" },
          { code: 401, meaning: "Missing or invalid token" },
          { code: 403, meaning: "Token lacks required scope or tenant access" },
          { code: 429, meaning: "Rate limit or quota exceeded" },
          { code: 503, meaning: "No healthy upstream or circuit breaker open" },
        ],
      },
    ],
    notesMD: `
Separate the control-plane API from the data-plane proxy path. Control-plane endpoints create validated, versioned configuration. Data-plane endpoints are the customer's actual APIs and should not read the control-plane database per request.

The public API examples are intentionally simple. In production, admin APIs need strong operator identity, approval workflows for risky changes, audit logs, dry-run validation, and automated rollback gates.
`,
  },
  databaseDesign: {
    schemaMD: `
The gateway's durable database stores control-plane state: routes, policies, consumers, credentials, and config snapshots. It is not in the hot path for every proxied request. Data-plane instances consume signed snapshots and keep route matchers, keys, policy rules, and service endpoint caches in memory.

Use a relational store for strong validation and transactional updates to configuration. Use a distributed key-value or cache layer for rate-limit counters, token introspection caches, JWKS keys, and short-lived response cache entries.
`,
    tables: [
      {
        name: "route_definitions",
        columns: [
          { name: "route_id", type: "uuid", note: "Primary key" },
          { name: "tenant_id", type: "uuid", note: "Owning tenant or product" },
          { name: "name", type: "varchar(128)", note: "Human-readable route name" },
          { name: "host_patterns", type: "json", note: "Exact hosts or wildcard host rules" },
          { name: "path_pattern", type: "varchar(512)", note: "Prefix, exact path, or parameterized path pattern" },
          { name: "methods", type: "json", note: "Allowed HTTP methods" },
          { name: "upstream_service", type: "varchar(128)", note: "Logical service name resolved through discovery" },
          { name: "policy_chain_id", type: "uuid", note: "Attached ordered filter chain" },
          { name: "priority", type: "int", note: "Higher priority wins for overlapping routes" },
          { name: "version", type: "bigint", note: "Monotonic route version" },
          { name: "status", type: "varchar(20)", note: "Staged, active, disabled, or deleted" },
          { name: "updated_at", type: "timestamp", note: "Last configuration change" },
        ],
      },
      {
        name: "policy_chains",
        columns: [
          { name: "policy_chain_id", type: "uuid", note: "Primary key" },
          { name: "tenant_id", type: "uuid", note: "Policy owner" },
          { name: "filters", type: "json", note: "Ordered plugin list and parameters" },
          { name: "auth_policy", type: "json", note: "JWT, API key, OAuth, or mTLS requirements" },
          { name: "rate_limit_policy", type: "json", note: "Bucket dimensions, quota plan, and burst limits" },
          { name: "resilience_policy", type: "json", note: "Timeouts, retries, circuit breakers, and hedging rules" },
          { name: "cache_policy", type: "json", note: "Response cache TTL and cache-key rules" },
          { name: "transform_policy", type: "json", note: "Header, query, body, and aggregation rules" },
          { name: "version", type: "bigint", note: "Policy version included in snapshots" },
        ],
      },
      {
        name: "consumer_credentials",
        columns: [
          { name: "credential_id", type: "uuid", note: "Primary key" },
          { name: "consumer_id", type: "uuid", note: "Partner, user, service account, or tenant principal" },
          { name: "tenant_id", type: "uuid", note: "Tenant boundary for authorization and quotas" },
          { name: "credential_type", type: "varchar(32)", note: "API key, OAuth client, certificate, or service token" },
          { name: "credential_hash", type: "varbinary", note: "Salted hash or certificate fingerprint; never store raw API keys" },
          { name: "scopes", type: "json", note: "Allowed scopes and route groups" },
          { name: "quota_plan_id", type: "uuid", note: "Default quota plan" },
          { name: "status", type: "varchar(20)", note: "Active, revoked, expired, or suspended" },
          { name: "expires_at", type: "timestamp nullable", note: "Expiration for key rotation" },
        ],
      },
      {
        name: "config_snapshots",
        columns: [
          { name: "snapshot_id", type: "uuid", note: "Primary key" },
          { name: "version", type: "bigint", note: "Global config version" },
          { name: "checksum", type: "varchar(128)", note: "Content hash verified by gateways" },
          { name: "signed_bundle_uri", type: "text", note: "Location of the compiled route and policy bundle" },
          { name: "routes_count", type: "int", note: "Number of routes in the snapshot" },
          { name: "created_by", type: "uuid", note: "Operator or automation principal" },
          { name: "created_at", type: "timestamp", note: "Snapshot creation time" },
          { name: "rollout_state", type: "varchar(32)", note: "Draft, canary, active, rolled_back, or failed" },
        ],
      },
    ],
    indexesMD: `
- **route_definitions.tenant_id, host_patterns, path_pattern** supports route conflict checks during control-plane validation.
- **route_definitions.status, version** supports snapshot creation and audit diffing.
- **consumer_credentials.consumer_id, status** supports credential management and revocation workflows.
- **config_snapshots.version** is unique so gateways can request the next signed bundle by version.
- Data-plane route lookup should use compiled in-memory tries or deterministic finite automata, not database indexes.
`,
    relationshipsMD: `
A route references one policy chain and one logical upstream service. A consumer credential references a quota plan and scopes. A config snapshot materializes many active route and policy versions into one immutable bundle. Service instance membership comes from service discovery and is intentionally separate from the route database.
`,
    noSqlAlternativesMD: `
For very large multi-tenant platforms, route snapshots can be stored as immutable objects in blob storage with metadata in a key-value database. Rate-limit counters belong in Redis, DynamoDB, Aerospike, or a purpose-built distributed counter store. Access logs, traces, and metrics belong in streaming and observability systems, not the control-plane relational database.
`,
  },
  architecture: {
    width: 960,
    height: 560,
    nodes: [
      { id: "clients", label: "Clients", kind: "client", x: 70, y: 230, sublabel: "Web, mobile, partners" },
      { id: "edge-cdn", label: "Edge CDN", kind: "cdn", x: 220, y: 120, sublabel: "DNS, WAF, TLS optional" },
      { id: "regional-lb", label: "Regional Load Balancer", kind: "loadBalancer", x: 220, y: 315, sublabel: "Health, failover" },
      { id: "gateway-fleet", label: "API Gateway Fleet", kind: "gateway", x: 430, y: 230, sublabel: "Data plane" },
      { id: "auth-provider", label: "Identity Provider", kind: "external", x: 430, y: 70, sublabel: "JWKS, OAuth, OIDC" },
      { id: "edge-state-cache", label: "Edge State Cache", kind: "cache", x: 635, y: 110, sublabel: "Keys, quotas, responses" },
      { id: "service-registry", label: "Service Registry", kind: "external", x: 635, y: 245, sublabel: "Endpoints, health" },
      { id: "backend-services", label: "Microservices", kind: "service", x: 830, y: 245, sublabel: "Orders, billing, profile" },
      { id: "control-plane", label: "Gateway Control Plane", kind: "service", x: 430, y: 430, sublabel: "Routes, policies, rollout" },
      { id: "config-store", label: "Config Store", kind: "database", x: 635, y: 430, sublabel: "Versioned snapshots" },
      { id: "telemetry", label: "Telemetry Pipeline", kind: "monitoring", x: 830, y: 420, sublabel: "Metrics, logs, traces" },
    ],
    edges: [
      { from: "clients", to: "edge-cdn", label: "HTTPS requests" },
      { from: "edge-cdn", to: "regional-lb", label: "API traffic" },
      { from: "regional-lb", to: "gateway-fleet", label: "healthy gateway" },
      { from: "gateway-fleet", to: "auth-provider", label: "keys or introspection" },
      { from: "gateway-fleet", to: "edge-state-cache", label: "quota and cache lookup" },
      { from: "edge-state-cache", to: "gateway-fleet", label: "cached decisions" },
      { from: "gateway-fleet", to: "service-registry", label: "resolve upstream" },
      { from: "service-registry", to: "gateway-fleet", label: "healthy endpoints" },
      { from: "gateway-fleet", to: "backend-services", label: "proxied call" },
      { from: "backend-services", to: "gateway-fleet", label: "service response" },
      { from: "gateway-fleet", to: "telemetry", label: "logs metrics traces", dashed: true },
      { from: "control-plane", to: "config-store", label: "persist snapshot" },
      { from: "control-plane", to: "gateway-fleet", label: "signed config push" },
      { from: "gateway-fleet", to: "control-plane", label: "heartbeat and ack", dashed: true },
      { from: "control-plane", to: "telemetry", label: "audit events", dashed: true },
    ],
    captionMD: `
The data plane handles every client request with local route, policy, auth, quota, cache, and discovery state. The control plane validates and rolls out configuration but is not required for every proxied request.
`,
  },
  architectureNotesMD: `
Split the gateway into a fast data plane and a safer control plane. The data plane is a horizontally scaled fleet of stateless proxies that hold a signed, compiled config snapshot in memory. It should continue serving with the last known good snapshot if the control plane or configuration database is down.

The control plane owns route authoring, policy validation, conflict detection, config signing, canary rollout, rollback, and audit trails. It pulls or receives service discovery data, compiles route matchers, and distributes snapshots to the gateway fleet. This separation prevents slow admin workflows from affecting live request latency.

The gateway must not become the place where every team puts business logic. Keep the plugin surface narrow, version filters carefully, sandbox risky extensions, and push domain decisions back to owning services unless the decision is genuinely cross-cutting.
`,
  requestFlow: [
    {
      title: "Connection reaches the edge",
      detailMD: `
A client connects through DNS, CDN, WAF, or a regional load balancer. TLS can terminate at the CDN, at the load balancer, or at the gateway depending on trust boundaries. The gateway receives normalized request metadata, peer identity, and trace context.
`,
    },
    {
      title: "Route matcher selects a route",
      detailMD: `
The data plane matches host, method, path, headers, and tenant against a compiled route table. Exact host and path matches win before wildcard and prefix matches. Route priority resolves intentional overlaps, and ambiguous config should have been rejected by the control plane.
`,
    },
    {
      title: "Pre-routing filters validate the request",
      detailMD: `
The gateway applies request size limits, header normalization, malformed request rejection, CORS handling, WAF signals, and optional schema validation. These checks protect backend services from wasteful or dangerous traffic before expensive work begins.
`,
    },
    {
      title: "Authentication and authorization run",
      detailMD: `
The gateway validates JWT signatures with cached public keys, checks API key hashes, performs OAuth token introspection only when needed, or verifies client certificates. It then checks route scopes, tenant boundaries, and coarse roles before forwarding identity claims to the backend.
`,
    },
    {
      title: "Rate limits and quotas are enforced",
      detailMD: `
The request consumes tokens from per-consumer, per-tenant, per-route, or per-IP buckets. Local warm counters can absorb small bursts, while shared counters enforce global quotas. Exceeded requests return 429 with retry and remaining-quota headers.
`,
    },
    {
      title: "Transform, cache, or aggregate when configured",
      detailMD: `
The gateway may rewrite paths, add correlation headers, remove unsafe headers, translate API versions, cache safe GET responses, or aggregate a small number of backend calls for a mobile backend-for-frontend route. This should remain declarative and bounded.
`,
    },
    {
      title: "Healthy upstream is chosen",
      detailMD: `
The gateway resolves the logical upstream service through service discovery, filters unhealthy instances, respects locality and tenant routing, and load balances using round robin, least outstanding requests, weighted routing, or consistent hashing.
`,
    },
    {
      title: "Proxy call runs inside a resilience envelope",
      detailMD: `
The gateway applies request deadlines, connect timeouts, retry budgets, circuit breakers, connection pooling, and backpressure. Retries are limited to safe or explicitly idempotent operations and must not multiply load during backend incidents.
`,
    },
    {
      title: "Response returns with telemetry",
      detailMD: `
The gateway records status, latency, route, tenant, upstream, auth outcome, rate-limit decision, and trace identifiers. Response filters add security headers, quota headers, and trace headers before the response is returned to the client.
`,
    },
  ],
  coreComponents: [
    {
      name: "Gateway Data Plane",
      kind: "gateway",
      role: "Processes every client request with local routing and policy state.",
      detailMD: `
This fleet terminates or accepts TLS, matches routes, executes filters, enforces policies, proxies to services, and emits telemetry. It should be stateless except for in-memory config, connection pools, short-lived caches, and local rate-limit warm buckets.
`,
    },
    {
      name: "Gateway Control Plane",
      kind: "service",
      role: "Manages route and policy lifecycle outside the hot path.",
      detailMD: `
The control plane validates route conflicts, compiles matchers, signs config snapshots, rolls them out gradually, monitors health gates, and supports rollback. It is allowed to be slower than the data plane because it is not on every customer request.
`,
    },
    {
      name: "Route Matcher",
      kind: "service",
      role: "Finds the winning route using host, path, method, and priority.",
      detailMD: `
A production matcher uses tries, prefix maps, host maps, or generated matching code so lookup remains fast even with thousands of routes. It also needs deterministic precedence rules so teams can reason about overlapping paths.
`,
    },
    {
      name: "Plugin and Filter Chain",
      kind: "worker",
      role: "Runs bounded cross-cutting logic before and after proxying.",
      detailMD: `
Filters implement authentication, authorization, rate limiting, transforms, caching, compression, request validation, and response decoration. The chain must be ordered, versioned, observable, and constrained so teams cannot deploy arbitrary unreviewed business logic into the edge.
`,
    },
    {
      name: "Auth and Authorization Offload",
      kind: "external",
      role: "Validates caller identity and coarse access policies centrally.",
      detailMD: `
JWT verification should usually be local using cached JWKS keys. API keys require hashed lookup or cache checks. OAuth introspection should be cached aggressively. The gateway enforces coarse scopes and tenant boundaries, while services retain domain-specific authorization.
`,
    },
    {
      name: "Rate Limiting and Quota Engine",
      kind: "cache",
      role: "Protects backend capacity and enforces product plans.",
      detailMD: `
The engine tracks token buckets, leaky buckets, or sliding windows across dimensions such as IP, API key, user, tenant, route, and region. It must handle hot tenants, global quotas, local bursts, and clear client feedback through 429 responses.
`,
    },
    {
      name: "Discovery, Load Balancing, and Resilience Layer",
      kind: "loadBalancer",
      role: "Chooses upstream instances and limits failure blast radius.",
      detailMD: `
This layer consumes service registry updates, health checks, outlier detection, locality hints, circuit breakers, retries, connection pools, and timeouts. It prevents slow or failing services from consuming gateway worker threads and client patience.
`,
    },
    {
      name: "Observability Pipeline",
      kind: "monitoring",
      role: "Provides route-level debugging and platform accountability.",
      detailMD: `
Every request should produce metrics and trace spans with route, tenant, upstream, status, latency, policy outcome, and error classification. Logs should be sampled for success paths but durable for security decisions, admin actions, and failures.
`,
    },
  ],
  deepDives: [
    {
      topic: "Control plane versus data plane",
      detailMD: `
The most important architectural split is between the control plane and the data plane. The data plane is the gateway fleet that handles customer requests, so it must be fast, local, horizontally scalable, and able to continue with the last known good configuration. It should not synchronously call the configuration database, admin API, or service catalog for every request.

The control plane handles humans and automation: route creation, policy authoring, validation, compilation, signing, rollout, rollback, and audit. This plane needs stronger consistency and safety checks. It can use relational transactions, approval workflows, and canary health gates because it is not in the proxy hot path.

A common failure mode is letting control-plane availability determine data-plane availability. The safer design is that gateways subscribe to signed snapshots, verify checksums, load them atomically, and keep the previous version if the new version fails validation or health checks.
`,
    },
    {
      topic: "Route matching, transformation, and filter chain ordering",
      detailMD: `
Route matching must be deterministic. A good design defines exact host before wildcard host, exact path before prefix path, explicit method before any method, and route priority as the final tie-breaker. The control plane should reject accidental overlaps or require the owner to declare precedence.

Filters should run in a predictable order. Typical request order is normalization, WAF, authentication, authorization, rate limit, request transform, cache lookup, discovery, proxy, response transform, and telemetry. If filters are unordered, teams will create subtle security bugs such as transforming an authorization header before token validation.

Request and response transformation is useful for version translation, header enrichment, mobile payload shaping, and backend-for-frontend aggregation. It must be bounded by payload size, timeout, fanout limits, and schema versioning. Heavy business workflows should live in dedicated backend services, not in gateway scripts.
`,
    },
    {
      topic: "Authentication, authorization, and identity propagation",
      detailMD: `
The gateway should offload common authentication: validate JWT signatures locally, rotate and cache JWKS keys, check API key hashes, support OAuth introspection for opaque tokens, and optionally verify mTLS client certificates. This avoids every microservice implementing the same security plumbing.

Authorization at the gateway should be coarse and route-oriented: required scopes, tenant membership, partner plan, internal versus external caller, and service-to-service identity. Domain-specific checks such as whether a user owns a particular order still belong to the backend service because the gateway should not fetch domain entities or understand business invariants.

Identity propagation must be explicit. Forward signed identity headers only after stripping any client-supplied versions, include tenant and scopes, preserve trace context, and make downstream services trust the gateway only over an authenticated internal network.
`,
    },
    {
      topic: "Rate limiting, quotas, and edge caching",
      detailMD: `
Rate limiting protects both the platform and paying customers. Token bucket works well for bursty APIs because it allows short bursts while enforcing average rates. Sliding windows give smoother semantics but can be more expensive. Production systems often combine local per-instance buckets for latency with a shared distributed counter for global quota correctness.

Dimensions matter. Per-IP limits stop anonymous abuse, per-token limits enforce customer plans, per-tenant limits protect noisy neighbors, and per-route limits protect expensive APIs. Return useful 429 responses with reset time and remaining quota where safe.

Caching can reduce backend load, but only for safe responses. Cache keys must include tenant, authorization context, query parameters, content negotiation headers, and any relevant version. Never cache personalized or privileged responses unless the key proves isolation. Cache negative auth or credential lookups briefly to protect identity stores.
`,
    },
    {
      topic: "Timeouts, retries, circuit breakers, and backpressure",
      detailMD: `
The gateway is often the first place to notice backend degradation. Every route needs a request deadline. The gateway should use short connection timeouts, bounded retry attempts, retry budgets, and circuit breakers that open when an upstream is failing. Without this, slow services tie up gateway resources and harm unrelated routes.

Retries are dangerous. Retrying GET may be acceptable, but POST requires idempotency keys or explicit backend support. Retrying after a request reached the service can duplicate side effects. The gateway should avoid retrying on application errors and should never retry so aggressively that it multiplies traffic during an incident.

Backpressure is as important as failure recovery. When queues, connection pools, or worker pools saturate, the gateway should shed load quickly with clear errors rather than allowing latency to grow until clients time out and retry from the outside.
`,
    },
    {
      topic: "Avoiding a gateway monolith and single point of failure",
      detailMD: `
An API Gateway is strategically central, which makes it risky. If every team embeds custom business logic, the gateway becomes a monolith with unclear ownership, slow releases, and broad blast radius. Keep plugins generic, declarative, reviewed, and versioned. Create dedicated backend-for-frontend services when aggregation becomes complex.

Avoid a single point of failure through multi-zone gateway fleets, health-checked load balancers, active-active regional deployment, last-known-good configuration, and independent scaling of control plane, data plane, rate limiter, and telemetry. Roll out gateway binaries and config separately so a route change does not require a full proxy deployment.

Blast-radius controls should exist at multiple levels: per-route circuit breakers, per-tenant quotas, per-cell deployment, per-region failover, and emergency route disablement. The gateway must be powerful enough to protect the platform but constrained enough that one bad plugin or config cannot break every API.
`,
    },
  ],
  scaling: [
    {
      stage: "Startup: one region and simple reverse proxy",
      detailMD: `
Start with a managed load balancer, a small gateway fleet, static route configuration, JWT validation, API key checks, simple per-IP limits, and service endpoints from deployment configuration. This is enough when the number of services and routes is small.
`,
    },
    {
      stage: "Growth: centralized control plane and service discovery",
      detailMD: `
Introduce a control plane for route ownership, policy configuration, validation, and audit. Integrate with service discovery so the gateway routes to healthy instances. Add Redis or a distributed cache for API keys, public keys, token introspection results, response cache, and quota counters.
`,
    },
    {
      stage: "Large scale: multi-zone gateway cells",
      detailMD: `
Partition the gateway fleet into cells by region, tenant group, or traffic class. Use compiled route snapshots, local rate-limit warm buckets, circuit breakers, and per-route metrics. Separate public, partner, internal, and admin gateways if their traffic and risk profiles differ.
`,
    },
    {
      stage: "Global scale: active-active edge platform",
      detailMD: `
Deploy gateways in multiple regions behind global load balancing or anycast. Keep data-plane decisions local, replicate configuration snapshots globally, and use regional service discovery. Route failover should consider data residency, tenant home region, and backend service availability.
`,
    },
    {
      stage: "Platform scale: extensible but governed gateway",
      detailMD: `
Offer self-service route onboarding, policy templates, plugin certification, traffic shadowing, canary releases, schema validation, and automated rollback. At this stage, governance and blast-radius reduction are as important as raw proxy throughput.
`,
    },
  ],
  bottlenecks: [
    {
      issue: "Route table growth and slow matching",
      optimizationMD: `
Compile routes into host maps, tries, prefix trees, or generated matchers instead of scanning route lists. Reject ambiguous overlaps in the control plane, keep route snapshots compact, and measure match latency as route count grows.
`,
    },
    {
      issue: "Auth provider dependency on the hot path",
      optimizationMD: `
Prefer local JWT verification with cached JWKS keys. Cache opaque token introspection results with short TTLs, negative-cache invalid credentials briefly, and isolate auth provider timeouts. Emergency revocation can use a small fast deny list pushed to gateways.
`,
    },
    {
      issue: "Hot rate-limit keys for large tenants",
      optimizationMD: `
Shard counters by tenant and time window, use local token buckets for bursts, periodically reconcile to global quotas, and isolate large tenants into dedicated quota partitions. Return 429 before the shared counter store melts down.
`,
    },
    {
      issue: "Gateway CPU and network saturation",
      optimizationMD: `
Use efficient TLS termination, keep-alive connection pools, HTTP/2 or HTTP/3 where useful, zero-copy proxying when available, compression policies, and horizontal autoscaling. Separate large upload or streaming routes from latency-sensitive JSON APIs.
`,
    },
    {
      issue: "Too much business logic in plugins",
      optimizationMD: `
Limit gateway plugins to cross-cutting concerns and declarative transforms. Move complex orchestration to backend-for-frontend services with clear owners, tests, and release cycles. Require plugin review, quotas, and timeout budgets.
`,
    },
  ],
  failureHandling: [
    {
      scenario: "Control plane or config database is unavailable",
      strategyMD: `
Data-plane gateways continue serving the last known good snapshot. New route changes and rollouts pause, but existing APIs keep working. Operators receive alerts for snapshot staleness, and emergency deny-list updates use a small independent channel if required.
`,
    },
    {
      scenario: "Bad route config or plugin rollout",
      strategyMD: `
Use static validation, shadow traffic, canary cells, automated health gates, and instant rollback to the previous signed snapshot. Keep config rollout separate from binary deployment so rollback is fast and low risk.
`,
    },
    {
      scenario: "Identity provider or key endpoint degrades",
      strategyMD: `
Continue validating JWTs with cached keys until their safe TTL expires. For opaque token introspection, use cached positive results within policy limits and fail closed for high-risk routes. Surface clear 503 or 401 errors rather than silently bypassing auth.
`,
    },
    {
      scenario: "Backend service becomes slow or unhealthy",
      strategyMD: `
Outlier detection removes bad instances. Circuit breakers open for failing upstreams, retries stay within a retry budget, and the gateway returns fast 503 responses when no healthy upstream remains. Unrelated routes and tenants should not share the same exhausted pools.
`,
    },
    {
      scenario: "Rate-limit or cache store is unavailable",
      strategyMD: `
Use route-specific fallback policies. Critical paid APIs may fail closed or use conservative local limits. Low-risk public APIs may fail open for a short window with local counters. Alert loudly because fail-open can create backend overload and billing leakage.
`,
    },
    {
      scenario: "Gateway region fails",
      strategyMD: `
Global load balancing shifts traffic to healthy regions. Gateways in other regions already have recent config snapshots and regional service discovery data. If backend data is region-bound, failover rules must respect tenant home region and compliance constraints.
`,
    },
  ],
  security: [
    {
      label: "Credential handling",
      detailMD: `
Never store raw API keys. Store salted hashes or fingerprints, support key rotation, log key identifiers instead of secrets, and redact authorization headers from logs. JWT public keys should rotate safely with overlapping validity windows.
`,
    },
    {
      label: "Authorization boundaries",
      detailMD: `
Strip client-supplied identity headers before adding trusted gateway identity headers. Enforce route scopes and tenant membership at the edge, but require backend services to perform domain-specific authorization for resource ownership.
`,
    },
    {
      label: "TLS and mTLS",
      detailMD: `
Terminate TLS at controlled edges with modern cipher policy and certificate automation. Use mTLS for service-to-service or partner traffic when needed, and preserve end-to-end encryption for routes with stricter compliance requirements.
`,
    },
    {
      label: "Input and protocol protection",
      detailMD: `
Reject oversized headers, malformed paths, dangerous encodings, unsupported methods, request smuggling patterns, and suspicious protocol upgrades. Apply WAF rules before expensive auth or backend work where possible.
`,
    },
    {
      label: "Plugin sandboxing and supply chain",
      detailMD: `
Gateway extensions run with broad traffic access, so they need review, signing, least privilege, resource limits, deterministic timeouts, and auditability. Do not let teams deploy arbitrary untrusted code into the shared edge.
`,
    },
    {
      label: "Audit and privacy",
      detailMD: `
Admin actions, credential changes, route changes, and security decisions need durable audit logs. Request logs should minimize personal data, redact secrets, and respect retention policies while retaining enough detail for incident response.
`,
    },
  ],
  tradeoffs: {
    pros: [
      "Centralizes cross-cutting security, rate limiting, observability, and resilience policies.",
      "Simplifies clients by exposing stable APIs while backend services evolve independently.",
      "Allows consistent route-level metrics, tracing, audits, and operational controls.",
      "Improves backend protection through quotas, circuit breakers, request validation, and load shedding.",
      "Enables self-service service onboarding through declarative route and policy configuration.",
    ],
    cons: [
      "Every request pays gateway latency and availability risk.",
      "A misconfigured route, plugin, or auth policy can affect many services at once.",
      "The gateway can become an organizational monolith if teams push business logic into it.",
      "Global rate limits and config propagation add distributed-systems complexity.",
      "Central ownership can become a bottleneck unless the control plane is self-service and well governed.",
    ],
    alternativesMD: `
Alternative one is client-side service discovery with no gateway. It removes a hop, but clients must handle auth, routing, retries, and service changes, which is poor for public APIs and mobile apps.

Alternative two is a service mesh only. A mesh is excellent for east-west service-to-service traffic, mTLS, retries, and observability, but it does not fully replace a north-south edge gateway that handles public API products, partners, WAF, quotas, and client-facing transformations.

Alternative three is one backend-for-frontend per client. This is useful for complex aggregation and mobile-specific payloads, but it still benefits from a thinner gateway in front for TLS, authentication, rate limits, and telemetry.
`,
    whenNotToUseMD: `
Do not introduce a heavy API Gateway for a small monolith, a few internal services, or a system where managed load balancers and service-level libraries are enough. Also avoid placing deep business workflows in a shared gateway; build a dedicated service when orchestration needs domain data, transactions, or independent releases.
`,
  },
  followUpQuestions: [
    {
      question: "How do you keep route matching fast with thousands of routes?",
      answerMD: `
Compile routes into deterministic data structures such as host maps and path tries. Do validation and conflict detection in the control plane. The data plane should perform local in-memory lookup, not scan all routes or call a route database.
`,
    },
    {
      question: "What authentication should happen at the gateway versus in services?",
      answerMD: `
The gateway should validate identity and enforce coarse route permissions such as scopes, tenant, and plan. Backend services should still enforce resource-level authorization because they understand domain ownership and business rules.
`,
    },
    {
      question: "How should retries be configured?",
      answerMD: `
Retries need short timeouts, a small max-attempt count, and a retry budget. Retry only safe operations or requests with idempotency support. Do not retry application-level failures or multiply load during incidents.
`,
    },
    {
      question: "How do you propagate emergency credential revocation?",
      answerMD: `
Use short token lifetimes, cached key rotation, and a fast deny-list channel to gateways. Normal config snapshots can handle routine changes, but emergency revocation needs faster propagation than a standard rollout window.
`,
    },
    {
      question: "How do you prevent the gateway from becoming a monolith?",
      answerMD: `
Keep filters generic and declarative, require ownership and review, limit plugin runtime resources, and move complex aggregation to backend-for-frontend services. The gateway should enforce cross-cutting platform policy, not own product workflows.
`,
    },
    {
      question: "What happens if the control plane is down?",
      answerMD: `
Existing traffic should continue using the last known good signed snapshot. New changes pause, stale-snapshot alerts fire, and rollback or emergency blocks use a separate minimal path if the organization requires it.
`,
    },
    {
      question: "How do global quotas work across regions?",
      answerMD: `
Use local buckets for low-latency burst handling and periodically reconcile against a shared global quota store. For strict quotas, route a tenant to a home region or use a strongly consistent counter, accepting higher latency and lower availability.
`,
    },
  ],
  companyVariations: [
    {
      company: "Amazon",
      angleMD: `
Amazon interviewers often push on multi-tenant quotas, DynamoDB or Redis counter design, availability-zone isolation, operational alarms, and cost. Be ready to explain how the gateway fails when auth, rate limiting, or service discovery dependencies degrade.
`,
    },
    {
      company: "Netflix",
      angleMD: `
Netflix tends to focus on edge reliability, client diversity, backend-for-frontend aggregation, circuit breakers, adaptive retries, and observability. Discuss how route-level resilience keeps one failing service from harming the streaming experience.
`,
    },
    {
      company: "Stripe",
      angleMD: `
Stripe may frame this around partner APIs, idempotency, API keys, versioned API contracts, strict audit logs, rate limits by account and endpoint, and safe rollout of policy changes. Security and correctness matter as much as raw throughput.
`,
    },
    {
      company: "Microsoft",
      angleMD: `
Microsoft may emphasize enterprise identity, tenant isolation, Azure-style global front doors, compliance, private endpoints, admin governance, and integration with service discovery. Explain control-plane RBAC, auditability, and regional failover.
`,
    },
  ],
  relatedQuestions: [
    {
      slug: "rate-limiter",
      note: "The gateway commonly hosts token buckets, quotas, and abuse protection at the edge.",
    },
    {
      slug: "service-discovery",
      note: "Backend routing depends on discovering healthy service instances and reacting to changes quickly.",
    },
    {
      slug: "service-mesh",
      note: "A service mesh handles east-west traffic while the API Gateway handles north-south edge traffic.",
    },
    {
      slug: "global-load-balancer",
      note: "Global traffic management decides which regional gateway fleet receives client traffic.",
    },
  ],
  interviewTips: {
    commonMistakes: [
      "Putting the control-plane database on the request path.",
      "Treating the gateway as a place for arbitrary business logic.",
      "Forgetting deterministic route precedence and conflict validation.",
      "Calling the identity provider synchronously for every request without caching.",
      "Retrying unsafe POST requests and creating duplicate side effects.",
      "Ignoring observability and making gateway failures indistinguishable from backend failures.",
    ],
    redFlags: [
      "No separation between data plane and control plane.",
      "No plan for bad config rollback or canary rollout.",
      "No rate limiting or quota model despite public APIs.",
      "No auth revocation story or identity propagation model.",
      "No circuit breakers, timeouts, or retry budgets.",
      "No explanation of how the gateway avoids becoming a single point of failure.",
    ],
    expectations: [
      "Draw clients, edge load balancing, gateway data plane, service discovery, backend services, control plane, config store, and telemetry.",
      "Explain route matching by host, path, method, and priority.",
      "Describe JWT, API key, OAuth, and mTLS handling at a high level.",
      "Quantify QPS, auth checks, rate-limit operations, logs, bandwidth, and instance count.",
      "Discuss resilience policies including timeout, retry, circuit breaker, and load shedding.",
      "Call out control-plane safety, versioning, rollout, and rollback.",
    ],
    communicationMD: `
Start by saying the gateway is a data-plane plus control-plane problem. Draw the request path first, then layer policy checks in the order they run. Keep repeating which decisions must be local on the hot path and which can happen asynchronously in the control plane. When asked to add features, decide whether they are cross-cutting gateway policy or business logic that belongs in a service.
`,
  },
  revisionNotesMD: `
- An API Gateway is the north-south edge for microservices: TLS, routing, auth, quotas, transforms, resilience, and observability.
- Keep the data plane fast and local. It should use compiled route snapshots, in-memory policy state, cached keys, service discovery caches, and shared rate-limit stores.
- Keep the control plane safe and auditable. It validates routes, compiles config, signs snapshots, canaries rollouts, and rolls back bad changes.
- Route matching needs deterministic precedence: host, method, path type, and explicit priority. Ambiguity should be rejected before deployment.
- JWT validation should usually be local with cached public keys. Opaque token introspection and API key lookup need caching and revocation strategy.
- Rate limits require dimensions: IP, token, user, tenant, route, and region. Global quotas trade latency and availability for stricter correctness.
- Timeouts, retries, circuit breakers, outlier detection, and backpressure protect services from retry storms and slow dependency collapse.
- Gateway transformations and BFF aggregation are useful but should be bounded. Complex business workflows belong in owned services.
- The gateway is a potential single point of failure, so use active-active regions, multi-zone fleets, last-known-good config, canary rollout, and blast-radius isolation.
`,
  flashcards: [
    {
      front: "What is the main split in API Gateway architecture?",
      back: "A fast data plane handles requests with local state, while a safer control plane manages routes, policies, validation, rollout, and audit.",
    },
    {
      front: "Why should the gateway not query the config database per request?",
      back: "It would add latency, create a central dependency, and make control-plane failures affect live traffic.",
    },
    {
      front: "What route fields are commonly matched?",
      back: "Host, path, method, headers, tenant, and route priority.",
    },
    {
      front: "Which auth decisions belong at the gateway?",
      back: "Identity validation and coarse route authorization such as scopes, roles, tenant, and plan.",
    },
    {
      front: "Which auth decisions stay in backend services?",
      back: "Domain-specific authorization, such as whether a user owns a particular order or can approve a particular payment.",
    },
    {
      front: "Why are retries dangerous at the gateway?",
      back: "They can duplicate side effects and multiply load during incidents unless bounded by idempotency, timeouts, and retry budgets.",
    },
    {
      front: "What should happen when the control plane is down?",
      back: "Gateways keep serving the last known good signed config snapshot while new changes and rollouts pause.",
    },
    {
      front: "How do you stop the gateway from becoming a monolith?",
      back: "Keep plugins generic, declarative, reviewed, versioned, and bounded; move complex business orchestration to backend-for-frontend services.",
    },
    {
      front: "What observability should every route expose?",
      back: "Request rate, status codes, gateway overhead, upstream latency, auth outcomes, rate-limit decisions, errors, and trace identifiers.",
    },
  ],
  quiz: [
    {
      question: "Why is the control plane separated from the data plane?",
      options: ["To make every request query the database", "To keep live request handling fast while configuration is managed safely", "To remove the need for authentication", "To force all business logic into the gateway"],
      answerIndex: 1,
      explanationMD: `
The data plane handles customer traffic with local state. The control plane validates, versions, signs, and rolls out configuration without being on every request.
`,
    },
    {
      question: "Which route matching rule should be true in a robust gateway?",
      options: ["Routes are matched in random order", "Ambiguous overlaps are allowed and resolved by clients", "Deterministic precedence is defined for host, path, method, and priority", "Every service chooses its own public DNS name at request time"],
      answerIndex: 2,
      explanationMD: `
Deterministic precedence prevents surprising behavior. The control plane should reject accidental conflicts or require explicit priority.
`,
    },
    {
      question: "What is the best default way to validate JWTs at high QPS?",
      options: ["Call the identity provider on every request", "Validate signatures locally using cached public keys", "Skip validation after the first request", "Send tokens directly to all backend services without checks"],
      answerIndex: 1,
      explanationMD: `
Local signature validation with cached JWKS keys avoids a synchronous identity-provider dependency on every request while preserving security.
`,
    },
    {
      question: "Given 5B requests per day, what is the approximate average QPS?",
      options: ["5,800 requests per second", "57,900 requests per second", "579,000 requests per second", "5.8M requests per second"],
      answerIndex: 1,
      explanationMD: `
5B divided by 86,400 seconds is about 57,870 requests per second, rounded to 57,900.
`,
    },
    {
      question: "Which operation is safest for automatic gateway retries?",
      options: ["A non-idempotent payment capture without an idempotency key", "A GET request to a read-only endpoint within a retry budget", "A request that already timed out after reaching the backend", "Every POST because gateways are transparent"],
      answerIndex: 1,
      explanationMD: `
Read-only idempotent requests are safer to retry. Mutating requests need explicit idempotency support and strict retry budgets.
`,
    },
    {
      question: "What should a gateway do when the control plane is unavailable?",
      options: ["Stop all traffic immediately", "Keep serving the last known good config snapshot", "Accept unvalidated route updates from clients", "Disable authentication to reduce dependency load"],
      answerIndex: 1,
      explanationMD: `
The data plane should continue with a verified last known good snapshot. New config changes can pause until the control plane recovers.
`,
    },
    {
      question: "What is a major risk of putting complex business workflows in gateway plugins?",
      options: ["It makes service discovery unnecessary", "It turns the gateway into a shared monolith with large blast radius", "It removes the need for observability", "It guarantees lower latency for every route"],
      answerIndex: 1,
      explanationMD: `
Gateway plugins run in a central shared layer. Complex domain logic there creates unclear ownership, harder releases, and broad failure impact.
`,
    },
  ],
  cheatSheetMD: `
**Goal**: design a reliable edge gateway that routes, secures, shapes, protects, and observes traffic into a microservice platform.

**Hot path**: client to edge to regional load balancer to gateway data plane to service discovery to backend service. The data plane should use local compiled config and cached policy state.

**Control plane**: route authoring, conflict validation, policy templates, signed snapshots, config rollout, canarying, rollback, RBAC, and audit logs.

**Routing**: match host, path, method, headers, tenant, and priority. Reject ambiguous overlaps. Use compiled tries or generated matchers rather than scanning route lists.

**Security**: validate JWTs with cached keys, hash API keys, support OAuth introspection with caching, use mTLS where needed, strip spoofed identity headers, and enforce route scopes and tenant boundaries.

**Rate limits**: use per-IP, per-user, per-token, per-tenant, per-route, and per-plan dimensions. Combine local buckets for latency with shared counters for global quotas.

**Resilience**: enforce deadlines, timeouts, retry budgets, circuit breakers, outlier detection, connection pools, and backpressure. Retry only safe or idempotent operations.

**Transforms and BFF**: useful for version translation, header enrichment, response shaping, and small aggregations. Keep them bounded and move business workflows to owned services.

**Observability**: route-level request rate, p50 and p99 gateway overhead, upstream latency, auth failures, 429s, circuit breaker state, logs, audit events, and distributed traces.

**Failure posture**: if the control plane fails, serve last known good config. If a route rollout fails, rollback. If auth or rate-limit dependencies fail, apply explicit fail-open or fail-closed policies by route risk.
`,
  references: [
    {
      title: "Envoy Proxy Documentation",
      kind: "Docs",
      url: "https://www.envoyproxy.io/docs/envoy/latest/",
      author: "Envoy Project",
    },
    {
      title: "Kong Gateway Documentation",
      kind: "Docs",
      url: "https://docs.konghq.com/gateway/",
      author: "Kong",
    },
    {
      title: "Amazon API Gateway Developer Guide",
      kind: "Docs",
      url: "https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html",
      author: "Amazon Web Services",
    },
    {
      title: "Designing Data-Intensive Applications",
      kind: "Book",
      author: "Martin Kleppmann",
    },
    {
      title: "The Tail at Scale",
      kind: "Paper",
      url: "https://research.google/pubs/the-tail-at-scale/",
      author: "Jeffrey Dean and Luiz Andre Barroso",
    },
  ],
};
