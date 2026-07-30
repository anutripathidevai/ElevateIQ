import type { SDQuestionContent } from "../types";

export const pastebinContent: SDQuestionContent = {
  slug: "pastebin",
  statementMD: `
Design a Pastebin-style service for sharing text snippets. A user creates a paste containing plain text or code and receives a compact, unique key that can be shared as a short URL. Readers open the key to view the content with low latency, optional syntax highlighting, and policy controls such as expiration, one-time access, visibility, and password protection.

At interview scale, the system is read-heavy but has a modest write rate. The important distinction from a URL shortener is that the service stores and serves the content itself rather than just returning a redirect. Small pastes can live inline with metadata for a single lookup, while large pastes should move to object storage with the metadata database holding a pointer.

The default design should optimize for durable paste creation, fast public reads through cache and CDN, safe handling of private or burn-after-read content, and abuse controls that prevent the platform from becoming a spam, malware, or data-exfiltration hub.
`,
  businessUseCaseMD: `
Paste services are useful for developers sharing logs, stack traces, code snippets, configuration examples, incident notes, and temporary text with teammates or support staff. They reduce friction when the content is too large for chat but too lightweight for a document system.

Businesses use this pattern inside support tooling, developer portals, incident response, interview platforms, and collaboration products. Public or unlisted pastes prioritize simple sharing, while enterprise variants need private access, audit trails, retention controls, and abuse operations.
`,
  functionalRequirements: [
    "Create a paste from text content and return a unique, compact paste key and URL.",
    "Retrieve and render a paste by key, including raw text and syntax-highlighted views.",
    "Store small pastes inline in the metadata database and large pastes in object storage with a pointer.",
    "Support expiration or TTL so pastes stop serving after a configured deadline.",
    "Support one-time burn-after-read pastes that become unavailable after the first successful read.",
    "Support visibility modes: public, unlisted, private, plus optional password protection.",
    "Scan content for abuse, spam, malware indicators, secrets, or policy violations.",
    "Collect view analytics such as total views, referrer, coarse geography, and device class.",
  ],
  nonFunctionalRequirements: [
    {
      label: "Latency",
      detailMD: `
Public paste reads should complete under 100ms p99 inside a region for cached small pastes and under 250ms p99 for large pastes that require object storage access. Create requests can be slower because they validate size, persist content, and enqueue scanning, but should usually finish under 300ms p99.
`,
    },
    {
      label: "Availability",
      detailMD: `
Reading active public pastes is the critical path and should target 99.99 percent availability. Management APIs, analytics dashboards, and asynchronous scanning can degrade without taking down safe paste reads.
`,
    },
    {
      label: "Read-heavy scalability",
      detailMD: `
Assume roughly 50 reads per paste creation. CDN caching, Redis or Memcached, and object-storage edge caching should absorb hot public reads, while private, password-protected, or one-time pastes bypass shared caches.
`,
    },
    {
      label: "Durability",
      detailMD: `
A successfully created paste should not disappear before its retention deadline. Persist metadata and inline content in a replicated database, write large bodies durably to object storage, and only acknowledge creation after both metadata and required content are committed.
`,
    },
    {
      label: "Consistency",
      detailMD: `
Creation needs read-after-write behavior for the author. Expiration, deletion, abuse takedowns, and burn-after-read state need strong enough consistency to prevent stale content from being served after it should be unavailable.
`,
    },
    {
      label: "Privacy and access control",
      detailMD: `
Private and password-protected pastes must not leak through public caches, search indexing, analytics, referrer headers, or predictable keys. One-time pastes require atomic read consumption.
`,
    },
    {
      label: "Cost efficiency",
      detailMD: `
Text bodies can dominate storage and bandwidth. Inline only small content, compress large objects, apply retention policies, cache hot reads, and avoid storing full view events in the serving database.
`,
    },
  ],
  capacityEstimation: {
    assumptionsMD: `
Assume 30M new pastes per month, a 50:1 read to write ratio, 30 days per month, a 10x peak multiplier, and a default retention window of 12 months after TTL cleanup. Average metadata is 1 KB per paste.

Assume 85 percent of pastes are small enough to store inline with an average body size of 8 KB. The remaining 15 percent are large pastes with an average compressed object size of 512 KB. Enforce a maximum paste size such as 10 MB for anonymous users and higher limits for trusted accounts.
`,
    metrics: [
      {
        label: "New pastes",
        value: "30M per month",
        note: "About 1M per day",
      },
      {
        label: "Average write QPS",
        value: "12 writes per second",
        note: "30M divided by 30 days divided by 86,400 seconds",
      },
      {
        label: "Peak write QPS",
        value: "120 writes per second",
        note: "10x average peak",
      },
      {
        label: "Average read QPS",
        value: "580 reads per second",
        note: "50 reads per write",
      },
      {
        label: "Peak read QPS",
        value: "5,800 reads per second",
        note: "10x average peak",
      },
      {
        label: "Monthly inline content",
        value: "204 GB raw",
        note: "25.5M small pastes times 8 KB",
      },
      {
        label: "Monthly object content",
        value: "2.3 TB raw",
        note: "4.5M large pastes times 512 KB",
      },
      {
        label: "Twelve-month raw content",
        value: "About 30 TB",
        note: "Inline plus object content before replication, compression variance, and lifecycle cleanup",
      },
      {
        label: "Metadata storage",
        value: "360 GB raw per year",
        note: "360M paste records times 1 KB",
      },
      {
        label: "Hot cache memory",
        value: "30 to 50 GB",
        note: "A few million hot small paste records plus Redis overhead and replication",
      },
      {
        label: "Keyspace",
        value: "8-character base62 gives about 218T keys",
        note: "Enough headroom for random, non-enumerable keys over many years",
      },
    ],
    calculationsMD: `
- Writes: 30M creates per month divided by 30 days is 1M creates per day. 1M divided by 86,400 seconds is about 11.6 writes per second, rounded to 12.
- Reads: with a 50:1 read to write ratio, average read traffic is about 580 reads per second.
- Peak: using a 10x multiplier gives about 120 write QPS and 5,800 read QPS.
- Inline content: 85 percent of 30M is 25.5M small pastes. 25.5M times 8 KB is about 204 GB per month.
- Object content: 15 percent of 30M is 4.5M large pastes. 4.5M times 512 KB is about 2.3 TB per month.
- Retention: monthly content of about 2.5 TB for 12 months gives about 30 TB raw before database replication, object-storage durability overhead, compression differences, and lifecycle cleanup.
- Metadata: 30M records per month times 12 months is 360M records. At 1 KB each, metadata is about 360 GB raw.
- Cache: if a few million popular small pastes drive most public reads, caching them at roughly 8 to 10 KB each plus memory overhead requires tens of GB, so plan 30 to 50 GB across the replicated hot cache tier.
- Keyspace: 62 to the power of 8 is about 218 trillion combinations. That provides large safety margin and makes random guessing harder than short sequential keys.
`,
  },
  apiDesign: {
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/pastes",
        descriptionMD: `
Creates a paste. The caller may be anonymous or authenticated. The service validates size, visibility, TTL, password policy, and language hint, then stores content inline or in object storage based on size.
`,
        request: `
{
  "content": "public class Example { }",
  "language": "java",
  "visibility": "unlisted",
  "expiresAt": "2026-08-02T12:29:19Z",
  "burnAfterRead": false,
  "password": "optional-client-supplied-password"
}
`,
        response: `
{
  "pasteKey": "aB7kP9xQ",
  "pasteUrl": "https://paste.example.com/aB7kP9xQ",
  "visibility": "unlisted",
  "contentLocation": "inline",
  "createdAt": "2026-07-26T12:29:19Z",
  "expiresAt": "2026-08-02T12:29:19Z",
  "scanStatus": "pending"
}
`,
        statusCodes: [
          { code: 201, meaning: "Created" },
          { code: 400, meaning: "Invalid content, size, TTL, language, or visibility" },
          { code: 401, meaning: "Authentication required for private or account-only features" },
          { code: 413, meaning: "Paste exceeds size limit" },
          { code: 429, meaning: "Rate limit exceeded" },
        ],
      },
      {
        method: "GET",
        path: "/{pasteKey}",
        descriptionMD: `
Returns the rendered paste page. Public and unlisted pastes can be served through CDN when policy allows. Private, password-protected, expired, blocked, or one-time pastes require service-side checks.
`,
        response: `
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Cache-Control: public, max-age=300

Rendered paste page with escaped content and syntax highlighting.
`,
        statusCodes: [
          { code: 200, meaning: "Paste rendered" },
          { code: 401, meaning: "Authentication or password required" },
          { code: 403, meaning: "Caller is not allowed to view this paste" },
          { code: 404, meaning: "Unknown paste key" },
          { code: 410, meaning: "Expired, deleted, blocked, or already burned" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/pastes/{pasteKey}/raw",
        descriptionMD: `
Returns the raw text body for clients, command-line tools, or copy workflows. The endpoint applies the same access, expiration, password, and burn-after-read checks as the rendered view.
`,
        response: `
HTTP/1.1 200 OK
Content-Type: text/plain; charset=utf-8
Cache-Control: private, no-store

public class Example { }
`,
        statusCodes: [
          { code: 200, meaning: "Raw paste returned" },
          { code: 401, meaning: "Authentication or password required" },
          { code: 404, meaning: "Unknown paste key" },
          { code: 410, meaning: "Expired, deleted, blocked, or already burned" },
        ],
      },
      {
        method: "DELETE",
        path: "/api/v1/pastes/{pasteKey}",
        descriptionMD: `
Soft-deletes a paste owned by the authenticated user or disabled by an abuse operator. The metadata remains for audit and analytics retention, but reads return 410 Gone.
`,
        response: `
{
  "pasteKey": "aB7kP9xQ",
  "status": "deleted"
}
`,
        statusCodes: [
          { code: 200, meaning: "Deleted or disabled" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Caller does not own the paste" },
          { code: 404, meaning: "Paste not found" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/pastes/{pasteKey}/analytics",
        descriptionMD: `
Returns aggregate view analytics for an owned paste. The endpoint reads from the analytics store and should not query raw event streams on demand.
`,
        response: `
{
  "pasteKey": "aB7kP9xQ",
  "totalViews": 18420,
  "uniqueVisitorsEstimate": 9720,
  "topReferrers": ["direct", "docs", "chat"],
  "dailyViews": [
    { "date": "2026-07-26", "views": 620 }
  ]
}
`,
        statusCodes: [
          { code: 200, meaning: "Analytics returned" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Caller cannot view analytics for this paste" },
          { code: 404, meaning: "Paste not found" },
        ],
      },
    ],
    notesMD: `
Keep the anonymous read endpoint simple, but do not treat every paste as cacheable. CDN caching is safe for public, non-password, non-burn, non-private pastes with a future TTL and clean scan status. Private and one-time reads must be served by the application so authorization and atomic state changes happen before content is returned.
`,
  },
  databaseDesign: {
    schemaMD: `
The serving record is keyed by **paste_key** because every read starts with that key. The metadata row should be enough to decide visibility, expiration, status, content location, cacheability, and whether additional checks are required.

Small text is stored inline to make common reads a single database or cache lookup. Large text is stored in object storage, and the metadata row stores the object URI, content hash, size, and scan state. This split avoids bloating database pages and keeps large byte serving cost-efficient.
`,
    tables: [
      {
        name: "pastes",
        columns: [
          { name: "paste_key", type: "varchar(16)", note: "Primary key; generated base62 key or validated custom key" },
          { name: "owner_user_id", type: "uuid nullable", note: "Owner for private pastes, deletion, and analytics" },
          { name: "visibility", type: "varchar(20)", note: "Public, unlisted, or private" },
          { name: "content_location", type: "varchar(16)", note: "Inline or object" },
          { name: "inline_content", type: "text nullable", note: "Small paste body stored directly in the row" },
          { name: "object_uri", type: "text nullable", note: "Pointer to compressed large content in object storage" },
          { name: "content_size_bytes", type: "integer", note: "Original text size before storage overhead" },
          { name: "content_hash", type: "char(64)", note: "Digest used for deduplication, integrity checks, and abuse signals" },
          { name: "language", type: "varchar(64)", note: "User-selected or detected language for syntax highlighting" },
          { name: "password_hash", type: "varbinary nullable", note: "Strong salted password hash; never store the clear password" },
          { name: "expires_at", type: "timestamp nullable", note: "Null only when product policy allows no explicit expiration" },
          { name: "burn_after_read", type: "boolean", note: "If true, the first successful read consumes the paste" },
          { name: "remaining_reads", type: "integer nullable", note: "Usually 1 for burn-after-read pastes; updated conditionally" },
          { name: "scan_status", type: "varchar(20)", note: "Pending, clean, suspicious, blocked, or failed" },
          { name: "status", type: "varchar(20)", note: "Active, deleted, expired, blocked, or burned" },
          { name: "created_at", type: "timestamp", note: "Creation time for retention and audit" },
          { name: "updated_at", type: "timestamp", note: "Last metadata or policy update" },
        ],
      },
      {
        name: "users",
        columns: [
          { name: "user_id", type: "uuid", note: "Primary key" },
          { name: "email", type: "varchar(320)", note: "Unique login identity" },
          { name: "plan", type: "varchar(32)", note: "Free, paid, enterprise, or internal" },
          { name: "created_at", type: "timestamp", note: "Account creation time" },
          { name: "status", type: "varchar(20)", note: "Active, suspended, or deleted" },
        ],
      },
      {
        name: "paste_views_daily",
        columns: [
          { name: "paste_key", type: "varchar(16)", note: "Paste identifier for analytics aggregation" },
          { name: "event_date", type: "date", note: "Daily bucket" },
          { name: "views", type: "bigint", note: "Aggregated view count" },
          { name: "unique_visitors_estimate", type: "bigint", note: "Approximate unique visitors from sketches" },
          { name: "top_referrers", type: "json", note: "Small aggregate for dashboard display" },
        ],
      },
      {
        name: "abuse_review_events",
        columns: [
          { name: "event_id", type: "uuid", note: "Primary key for moderation and audit" },
          { name: "paste_key", type: "varchar(16)", note: "Paste being scanned or actioned" },
          { name: "event_type", type: "varchar(40)", note: "Created, scanned, flagged, blocked, appealed, or restored" },
          { name: "reason", type: "text", note: "Policy or scanner reason" },
          { name: "created_at", type: "timestamp", note: "Event time" },
        ],
      },
    ],
    indexesMD: `
- **pastes.paste_key** is the primary key and must support a single point lookup.
- **pastes.owner_user_id, created_at** supports account dashboards and deletion workflows.
- **pastes.expires_at** supports TTL cleanup, background sweeps, and lifecycle reporting.
- **pastes.scan_status, updated_at** helps scanners and moderators find pending or suspicious content.
- **paste_views_daily.paste_key, event_date** supports analytics dashboards.
- Do not index the full paste body. Use content hashes and external scanning systems for abuse workflows.
`,
    relationshipsMD: `
A paste may belong to one user, but anonymous pastes have no owner. Analytics aggregates and abuse events reference **paste_key** and can be rebuilt or retained separately from the serving record. The read path should not join users, analytics, and abuse tables unless the paste is private or policy requires an access check.
`,
    noSqlAlternativesMD: `
A distributed key-value database such as DynamoDB, Cassandra, Bigtable, or FoundationDB fits the serving path because reads are point lookups by paste key. Keep small inline content below item-size limits and move larger bodies to object storage such as S3, Azure Blob Storage, or Google Cloud Storage.

Use conditional writes to reserve paste keys and atomic conditional updates to consume burn-after-read pastes. Store analytics in an append-friendly stream and OLAP store instead of updating the paste row on every view. Object storage lifecycle policies can expire large bodies after the metadata TTL passes.
`,
  },
  architecture: {
    width: 960,
    height: 560,
    nodes: [
      { id: "client", label: "Client", kind: "client", x: 80, y: 230, sublabel: "Browser, CLI, app" },
      { id: "cdn", label: "CDN and Edge", kind: "cdn", x: 245, y: 120, sublabel: "Public cache" },
      { id: "load-balancer", label: "Load Balancer", kind: "loadBalancer", x: 245, y: 310, sublabel: "Regional routing" },
      { id: "paste-api", label: "Paste API Service", kind: "service", x: 455, y: 230, sublabel: "Create, read, policy" },
      { id: "hot-cache", label: "Hot Paste Cache", kind: "cache", x: 665, y: 105, sublabel: "Redis" },
      { id: "metadata-db", label: "Metadata DB", kind: "database", x: 665, y: 255, sublabel: "KV or SQL" },
      { id: "object-store", label: "Object Storage", kind: "storage", x: 665, y: 420, sublabel: "Large content" },
      { id: "keygen-service", label: "Key Generation Service", kind: "worker", x: 455, y: 430, sublabel: "Base62 keys" },
      { id: "scan-queue", label: "Scan Queue", kind: "queue", x: 840, y: 120, sublabel: "Async jobs" },
      { id: "abuse-scanner", label: "Abuse Scanner", kind: "external", x: 840, y: 255, sublabel: "Spam, malware" },
      { id: "analytics-pipeline", label: "Analytics Pipeline", kind: "analytics", x: 840, y: 410, sublabel: "Events, OLAP" },
    ],
    edges: [
      { from: "client", to: "cdn", label: "public read" },
      { from: "client", to: "load-balancer", label: "create or private read" },
      { from: "cdn", to: "load-balancer", label: "miss or uncacheable" },
      { from: "load-balancer", to: "paste-api", label: "route request" },
      { from: "paste-api", to: "hot-cache", label: "lookup or warm" },
      { from: "hot-cache", to: "paste-api", label: "cache hit" },
      { from: "paste-api", to: "metadata-db", label: "metadata and inline text" },
      { from: "paste-api", to: "object-store", label: "large body put or get" },
      { from: "paste-api", to: "keygen-service", label: "allocate key" },
      { from: "keygen-service", to: "metadata-db", label: "reserve key" },
      { from: "paste-api", to: "scan-queue", label: "scan job", dashed: true },
      { from: "scan-queue", to: "abuse-scanner", label: "inspect content", dashed: true },
      { from: "abuse-scanner", to: "metadata-db", label: "mark status", dashed: true },
      { from: "paste-api", to: "analytics-pipeline", label: "view event", dashed: true },
    ],
    captionMD: `
Public reads are served from CDN or cache when policy allows. The Paste API remains the source of truth for private, password-protected, one-time, expired, blocked, or cache-miss requests. Large bodies live in object storage, while metadata and small bodies stay in the serving database.
`,
  },
  architectureNotesMD: `
Pastebin has two serving modes. The common public read path should be extremely simple: edge cache if possible, then stateless Paste API, hot cache, metadata lookup, and optional object fetch. The create path performs validation, key allocation, persistence, and asynchronous scanning.

The design intentionally separates metadata from large content. Metadata is latency-sensitive and small enough for a key-value store or relational table. Large text bodies are byte-heavy and better suited for object storage with compression, lifecycle policies, and CDN integration.

Policy determines cacheability. Public, clean, non-password, non-burn pastes can use CDN and Redis TTLs. Private and burn-after-read pastes must bypass shared caches because each read requires authorization or an atomic state transition.
`,
  requestFlow: [
    {
      title: "Create request arrives",
      detailMD: `
The client sends **POST /api/v1/pastes** with text, optional language, visibility, expiration, burn-after-read flag, and optional password. The API authenticates if needed, validates size and TTL policy, normalizes line endings, and applies per-IP and per-user rate limits.
`,
    },
    {
      title: "Paste key is allocated",
      detailMD: `
For generated keys, the API requests a random base62 key from the Key Generation Service or generates one and performs a conditional insert. Custom keys, if offered, must be validated and inserted atomically to prevent races.
`,
    },
    {
      title: "Content storage location is chosen",
      detailMD: `
If the body is below the inline threshold, such as 32 KB or 64 KB, the service stores it in the paste row. Larger bodies are compressed, written to object storage, and referenced by object URI and content hash in metadata.
`,
    },
    {
      title: "Metadata is committed",
      detailMD: `
The service writes the paste metadata, visibility, TTL, password hash, scan status, content location, and initial status. Creation is acknowledged only after the metadata and any required object are durable.
`,
    },
    {
      title: "Scanning and cache warming start",
      detailMD: `
The API enqueues a scan job with content hash, metadata, and a safe pointer to the body. Low-risk public pastes may be served immediately with pending status, while high-risk or anonymous large pastes can remain limited until scanning completes.
`,
    },
    {
      title: "Read request reaches edge or API",
      detailMD: `
A browser requests **GET /{pasteKey}**. CDN serves cacheable public content if present. Otherwise the request goes to the Paste API, which loads the record from Redis or the metadata database.
`,
    },
    {
      title: "Policy checks run before content is returned",
      detailMD: `
The service checks existence, status, expiration, scan status, visibility, authentication, password verification, and burn-after-read state. For one-time pastes, it performs an atomic conditional update from remaining reads of 1 to 0 before returning the body.
`,
    },
    {
      title: "Content is rendered or streamed",
      detailMD: `
Inline content is returned directly from the record or cache. Large content is fetched from object storage, optionally cached at the edge if policy allows, escaped safely, and rendered with syntax highlighting or returned as raw text.
`,
    },
    {
      title: "Analytics event is emitted asynchronously",
      detailMD: `
After a successful read decision, the service emits a view event with paste key, timestamp, referrer, coarse geography, client type, and cache status. Analytics must not block the read response.
`,
    },
  ],
  coreComponents: [
    {
      name: "Paste API Service",
      kind: "service",
      role: "Owns create, read, policy checks, rendering, and raw text serving.",
      detailMD: `
This stateless service validates inputs, chooses inline or object storage, enforces visibility and TTL, verifies passwords, consumes one-time reads atomically, escapes output, and emits analytics. It should keep slow dependencies behind timeouts and circuit breakers.
`,
    },
    {
      name: "Key Generation Service",
      kind: "worker",
      role: "Produces compact unique paste keys with low collision risk.",
      detailMD: `
The service generates random base62 keys, reserves them with conditional writes, and monitors collision rate. Random keys are preferred over sequential keys because unlisted pastes rely partly on key unguessability.
`,
    },
    {
      name: "Metadata Store",
      kind: "database",
      role: "Durable source of truth for paste metadata and small inline bodies.",
      detailMD: `
The store is keyed by paste key and contains the policy fields needed to answer a read. It supports conditional writes for key reservation and conditional updates for burn-after-read consumption.
`,
    },
    {
      name: "Object Storage",
      kind: "storage",
      role: "Stores large paste bodies outside the serving metadata record.",
      detailMD: `
Large content is compressed and written to object storage. Object storage provides durable, inexpensive byte storage, lifecycle expiration, range reads for very large text, and CDN integration for cacheable public bodies.
`,
    },
    {
      name: "Hot Paste Cache",
      kind: "cache",
      role: "Absorbs repeated reads for popular public pastes.",
      detailMD: `
Redis or Memcached stores paste metadata and small inline bodies when policy allows. TTL is bounded by paste expiration and scan status, and private or one-time pastes should not use shared cache entries.
`,
    },
    {
      name: "Abuse Scanner",
      kind: "external",
      role: "Protects the platform from malicious or prohibited content.",
      detailMD: `
The scanner checks content hashes, URLs inside pastes, malware signatures, spam patterns, leaked secrets, and policy rules. It updates metadata to clean, suspicious, or blocked and supports manual review workflows.
`,
    },
    {
      name: "Analytics Pipeline",
      kind: "analytics",
      role: "Captures view metrics without slowing reads.",
      detailMD: `
View events go to a durable stream and are aggregated by paste key, time bucket, referrer, geography, and client class. Dashboards read aggregates, not the serving database or raw event stream.
`,
    },
  ],
  deepDives: [
    {
      topic: "Inline content versus object storage",
      detailMD: `
The central Pastebin tradeoff is where to store the text body. Inline storage is fast and simple for small pastes because a single cache or database lookup returns metadata and content. It also simplifies atomic creation and deletion.

Large inline bodies are dangerous. They inflate database storage, reduce cache efficiency, increase replication cost, and make hot rows expensive to move. A practical design sets an inline threshold such as 32 KB or 64 KB. Content above that threshold is compressed and stored in object storage, while the metadata row stores object URI, size, hash, and content location.

This differs from a URL shortener. A shortener stores a small redirect target and returns a Location header. Pastebin stores user content and must handle body size, rendering safety, object fetches, and content moderation.
`,
    },
    {
      topic: "Key generation and unguessability",
      detailMD: `
Paste keys have two jobs: uniqueness and reasonable resistance to guessing. A sequential counter encoded as base62 is easy to implement, but it exposes creation volume and lets attackers enumerate unlisted pastes. That is a serious privacy issue because unlisted links are often treated as share-by-link resources.

Random base62 keys with enough length are the better default. Eight characters provide about 218 trillion combinations, which is far more than the expected number of active pastes. The create path can generate a candidate and perform a conditional insert, retrying on rare collisions. A pre-generated key pool also works if operational complexity is acceptable.

Custom aliases should be optional and subject to stricter validation. They are easier to guess, can impersonate brands or users, and require atomic reservation just like generated keys.
`,
    },
    {
      topic: "Expiration and burn-after-read consistency",
      detailMD: `
Expiration can be enforced lazily on read by checking **expires_at** and returning 410 Gone when the deadline has passed. Background cleanup and object-storage lifecycle policies reclaim space later. Correctness should not depend on cleanup running exactly on time.

Burn-after-read is stricter. Two clients may request the same paste concurrently, so the service must consume the read atomically before returning content. Use a conditional update such as remaining reads equals 1 and status equals active, then set remaining reads to 0 and status to burned. Only the request that wins returns the body.

Do not cache burn-after-read content in a shared CDN or Redis entry. A stale cache hit would bypass the atomic consumption step and leak the paste multiple times.
`,
    },
    {
      topic: "Caching and CDN policy",
      detailMD: `
Caching is safe only when the access policy is cache-safe. Public, clean, non-password, non-burn pastes with future expiration can be cached at CDN and Redis with TTL capped by the paste expiration time. Negative caching for unknown keys should be short to avoid hiding newly created pastes after replication delay.

Private, password-protected, pending-review, and one-time pastes should bypass public caches and usually use **Cache-Control: private, no-store**. For unlisted but public pastes, cacheability is a product decision: caching improves cost and latency, but shared caches must not expose analytics or owner metadata.

Hot viral pastes can become single-key hot spots. Mitigate with CDN, replicated cache entries, request coalescing on misses, compression, and serving large object bodies directly from edge caches when allowed.
`,
    },
    {
      topic: "Abuse scanning and rendering safety",
      detailMD: `
A paste service can host phishing kits, malware snippets, stolen secrets, spam lists, and offensive content. The create path should apply rate limits, size limits, content hashes, deny lists, and lightweight synchronous checks. Heavier scanners run asynchronously and can mark a paste suspicious or blocked.

Rendering is also security-sensitive. Syntax highlighting must treat paste content as untrusted text, escape HTML, block script execution, and avoid storing unsafe highlighted HTML unless the sanitizer is trusted. Raw views should send text/plain and avoid content sniffing.

Scanner results affect cache invalidation. If a paste is later blocked, the system must evict CDN and Redis entries or maintain a small blocked-key cache checked before serving cached content.
`,
    },
    {
      topic: "Analytics without slowing reads",
      detailMD: `
View analytics are useful, but the read path should not synchronously update a counter in the paste row. Popular pastes would create write hot spots, and analytics outages would become read outages.

Emit view events asynchronously after the policy decision. Consumers aggregate by paste key and time bucket, using approximate unique visitor sketches where needed. Product dashboards can tolerate eventual consistency and freshness indicators.

For privacy, avoid storing raw IP addresses longer than necessary. Prefer coarse geography, hashed or truncated identifiers, retention limits, and tenant-specific access controls for detailed analytics.
`,
    },
  ],
  scaling: [
    {
      stage: "Prototype: single region and relational database",
      detailMD: `
Start with one stateless Paste API, one relational database table keyed by paste key, and local disk or basic object storage for large bodies. Add size limits, TTL checks, and safe rendering from the beginning.
`,
    },
    {
      stage: "Growth: cache, object storage, and async scanning",
      detailMD: `
Move large bodies to object storage, introduce Redis for hot public pastes, add CDN for cacheable rendered and raw responses, and run scanning plus analytics through queues. Separate read and create autoscaling policies.
`,
    },
    {
      stage: "Large scale: distributed metadata store",
      detailMD: `
Move the metadata table to a distributed KV store partitioned by paste key. Use conditional writes for key reservation and burn consumption, object lifecycle policies for TTL cleanup, hot-key detection, and per-tenant or per-IP quotas.
`,
    },
    {
      stage: "Global scale: regional reads and controlled writes",
      detailMD: `
Route users to the nearest healthy region for reads. Replicate metadata and object pointers asynchronously, keep creates durable in a home region or multi-region database, and use global CDN invalidation for deletes, burns, expirations, and abuse takedowns.
`,
    },
  ],
  bottlenecks: [
    {
      issue: "Database bloat from storing every paste inline",
      optimizationMD: `
Set an inline threshold and move large bodies to object storage. Store only metadata, object URI, hash, size, and policy fields in the database. Compress large content and apply lifecycle expiration.
`,
    },
    {
      issue: "Viral paste hot spot",
      optimizationMD: `
Cache public clean pastes at CDN and Redis, replicate hot cache entries, use request coalescing on object-storage misses, and cap cache TTL by expiration and takedown policy.
`,
    },
    {
      issue: "One-time paste race condition",
      optimizationMD: `
Consume burn-after-read pastes with an atomic conditional update before returning content. Bypass shared caches and return 410 Gone to concurrent readers that lose the condition.
`,
    },
    {
      issue: "Object storage latency for large content",
      optimizationMD: `
Compress bodies, keep metadata in cache, use CDN for cache-safe objects, support range or streaming reads, and apply connection pooling plus retries with tight timeouts.
`,
    },
    {
      issue: "Synchronous scanner or analytics dependency",
      optimizationMD: `
Run heavy scanning and all analytics asynchronously. Use lightweight synchronous checks for obvious abuse, and let safe reads continue when analytics is degraded.
`,
    },
    {
      issue: "Random key guessing and invalid-key scans",
      optimizationMD: `
Use sufficiently long random keys, rate-limit 404-heavy clients, negative-cache invalid keys briefly, and monitor entropy or prefix scan patterns.
`,
    },
  ],
  failureHandling: [
    {
      scenario: "Cache outage",
      strategyMD: `
The Paste API falls back to the metadata store and object storage with strict timeouts and rate limiting. Use circuit breakers to prevent stampedes, and gradually warm cache after recovery.
`,
    },
    {
      scenario: "Metadata database degradation",
      strategyMD: `
Serve safe cached public pastes until their TTL expires, but block private and burn-after-read reads that require fresh policy checks. Pause creates if key reservation or metadata durability cannot be guaranteed.
`,
    },
    {
      scenario: "Object storage unavailable",
      strategyMD: `
Small inline pastes can continue serving. Large pastes should return a retryable 503 or friendly error if the object cannot be read. Creates for large bodies can fail fast or queue uploads only if durability semantics are clear.
`,
    },
    {
      scenario: "Scanner backlog or outage",
      strategyMD: `
Apply stricter rate limits to anonymous creates, keep known-bad signatures and deny lists cached, mark high-risk pastes as pending, and allow trusted low-risk pastes with delayed scanning. Alert on backlog age, not just queue depth.
`,
    },
    {
      scenario: "Analytics pipeline unavailable",
      strategyMD: `
Continue serving reads. Buffer a bounded number of events locally or drop non-critical analytics under pressure, and show freshness warnings in dashboards. Never block paste reads on analytics recovery.
`,
    },
    {
      scenario: "Stale cache after delete or takedown",
      strategyMD: `
Invalidate CDN and Redis entries on status changes, keep cache TTLs bounded, and maintain a small blocked-key or deleted-key cache checked before serving sensitive entries. Use synthetic probes for high-priority takedowns.
`,
    },
  ],
  security: [
    {
      label: "Access control",
      detailMD: `
Private pastes require authenticated authorization checks. Owners and privileged operators can delete, view analytics, or change policy. Public reads must not reveal owner email, private metadata, or moderation details.
`,
    },
    {
      label: "Password protection",
      detailMD: `
Store only strong salted password hashes, apply rate limits to password attempts, and avoid caching password-protected content in shared caches. Passwords protect the paste, not the underlying object URI, so object keys must remain private.
`,
    },
    {
      label: "Abuse and malware scanning",
      detailMD: `
Scan content, embedded URLs, hashes, and user reputation signals. Support blocking, warning pages, appeal workflows, and rapid cache invalidation for malicious or policy-violating pastes.
`,
    },
    {
      label: "XSS and content sniffing prevention",
      detailMD: `
Escape all paste content before rendering, use a hardened syntax highlighter, set safe content types for raw text, prevent browser content sniffing, and use a restrictive content security policy.
`,
    },
    {
      label: "Rate limits and quotas",
      detailMD: `
Apply per-IP, per-user, per-token, and per-tenant limits on creation, reads, password attempts, and invalid-key scans. Enforce content size limits and account-specific retention policy.
`,
    },
    {
      label: "Privacy and analytics minimization",
      detailMD: `
Limit raw event retention, store coarse geography instead of raw IP when possible, protect analytics behind ownership checks, and avoid indexing private or unlisted paste content in search engines.
`,
    },
  ],
  tradeoffs: {
    pros: [
      "Simple key-based read path that can be optimized with cache and CDN.",
      "Inline small content keeps common reads fast and operationally simple.",
      "Object storage for large content controls database growth and bandwidth cost.",
      "Asynchronous scanning and analytics keep create and read latency predictable.",
      "Random keys and TTL policies support safe unlisted sharing for a beginner design.",
    ],
    cons: [
      "One-time and private pastes reduce cacheability and require stronger consistency.",
      "Large content introduces object-storage latency, lifecycle coordination, and CDN invalidation complexity.",
      "Abuse scanning can delay availability or require later takedowns after content was shared.",
      "Unlisted links are not true authorization and can leak if the key is forwarded.",
      "Exact real-time analytics can conflict with low-latency read serving.",
    ],
    alternativesMD: `
Alternative one is to store all content in a relational database. It is easy for a prototype but becomes expensive and slow as large pastes accumulate.

Alternative two is to store every body in object storage, including tiny pastes. It simplifies database size but adds object fetch latency to the common case and complicates atomic creation.

Alternative three is a document-sharing system with full ACLs, collaboration, search, and versioning. It is more powerful but overbuilt for temporary snippets and anonymous sharing.
`,
    whenNotToUseMD: `
Do not use Pastebin as a secure secret manager, source-control system, or long-term compliance archive. If the content is highly sensitive, needs strong identity-based access, version history, legal retention, or guaranteed deletion semantics, design a secure document store or secrets platform instead.
`,
  },
  followUpQuestions: [
    {
      question: "What threshold should decide inline versus object storage?",
      answerMD: `
Choose a threshold that keeps the metadata record small and cache-efficient, commonly 32 KB or 64 KB. The exact value depends on database item-size limits, p99 latency, cache memory, and average paste size. The key is to keep common small reads to one lookup while moving large byte-heavy content to object storage.
`,
    },
    {
      question: "How do you make burn-after-read correct under concurrent reads?",
      answerMD: `
Do an atomic conditional update before returning content. The update checks that status is active and remaining reads equals 1, then sets status to burned and remaining reads to 0. Only the request that wins the condition gets the body; all others return 410 Gone.
`,
    },
    {
      question: "Can public pastes be cached at the CDN?",
      answerMD: `
Yes, if they are public, clean, not password-protected, not private, not burn-after-read, and have a cache TTL no longer than their expiration. Private and one-time pastes must bypass shared caches because each read requires a fresh policy decision.
`,
    },
    {
      question: "How is this different from designing a URL shortener?",
      answerMD: `
Both systems generate short keys and are read-heavy, but URL shorteners store small redirect mappings and return HTTP redirects. Pastebin stores user content, serves bytes, manages large object storage, renders syntax highlighting safely, scans content for abuse, and enforces visibility or burn policies before returning the body.
`,
    },
    {
      question: "Should the service scan synchronously or asynchronously?",
      answerMD: `
Use lightweight synchronous checks for obvious abuse, size, known-bad hashes, and rate limits. Run heavier malware, spam, secret, and policy scanning asynchronously. High-risk content can remain pending until the scan finishes, while trusted low-risk content can be available quickly with takedown support.
`,
    },
    {
      question: "How do you prevent unlisted paste enumeration?",
      answerMD: `
Use long random keys, avoid sequential exposed IDs, rate-limit invalid-key scans, negative-cache repeated misses briefly, and detect prefix or distributed scanning patterns. Unlisted is convenience sharing, not strong authorization, so sensitive content should use private access controls.
`,
    },
    {
      question: "Where should syntax highlighting happen?",
      answerMD: `
For small or popular pastes, highlighting can be generated on read and cached as escaped rendered HTML if the sanitizer is trusted. For large or uncommon pastes, render on demand or client-side to avoid storing many variants. Raw text should always remain available and safely typed as text/plain.
`,
    },
  ],
  companyVariations: [
    {
      company: "Amazon",
      angleMD: `
Amazon interviewers may push on DynamoDB partitioning, S3 object lifecycle, conditional writes for burn-after-read, operational alarms, and cost. Be ready to explain inline thresholds, object pointers, cache invalidation, and how public reads survive scanner or analytics failures.
`,
    },
    {
      company: "Microsoft",
      angleMD: `
Microsoft may frame the system around enterprise snippets, Azure Blob Storage, Azure Front Door, identity integration, tenant policy, compliance retention, and private sharing. Discuss access control, audit logs, password handling, and safe rendering inside corporate tools.
`,
    },
    {
      company: "Google",
      angleMD: `
Google tends to probe global caching, tail latency, abuse detection, privacy, and consistency. Expect follow-ups on random key entropy, CDN cacheability, one-time read races, and large-object serving at edge scale.
`,
    },
    {
      company: "Meta",
      angleMD: `
Meta may emphasize abuse, spam, viral hot spots, content safety pipelines, and privacy for shared links. Explain how asynchronous review, takedowns, cache invalidation, and analytics aggregation work without coupling to the read path.
`,
    },
  ],
  relatedQuestions: [
    {
      slug: "url-shortener",
      note: "Shares short-key generation and read-heavy access patterns, but Pastebin serves stored content instead of redirects.",
    },
    {
      slug: "key-value-store",
      note: "The metadata serving path is a point lookup by paste key with conditional writes for keys and one-time reads.",
    },
    {
      slug: "distributed-cache",
      note: "Hot public pastes rely on cache hit ratio, TTLs, invalidation, and hot-key handling.",
    },
    {
      slug: "cloud-storage",
      note: "Large paste bodies fit object storage, lifecycle expiration, compression, and CDN delivery patterns.",
    },
    {
      slug: "rate-limiter",
      note: "Creation, password attempts, raw reads, and invalid-key scans all need rate limiting.",
    },
  ],
  interviewTips: {
    commonMistakes: [
      "Treating Pastebin as just a URL shortener and forgetting that it stores and serves content bytes.",
      "Storing all large pastes inline in the primary database.",
      "Caching private, password-protected, or burn-after-read pastes in shared caches.",
      "Implementing burn-after-read with a non-atomic read then update.",
      "Rendering user text without escaping or content security controls.",
      "Updating analytics synchronously on every view.",
    ],
    redFlags: [
      "No content size limits or inline versus object storage split.",
      "No concrete capacity math for content storage and read QPS.",
      "No plan for expiration, deletion, and cache invalidation.",
      "No abuse scanning or rate limiting for anonymous content creation.",
      "No distinction between public, unlisted, private, password, and one-time cache policy.",
    ],
    expectations: [
      "State assumptions for paste count, average size, retention, read ratio, and peak traffic.",
      "Use paste_key as the serving key and keep reads to cache or one metadata lookup plus optional object fetch.",
      "Explain why small content can be inline and large content belongs in object storage.",
      "Discuss TTL, burn-after-read atomicity, and visibility semantics clearly.",
      "Add CDN, Redis, async analytics, abuse scanning, and safe syntax rendering.",
      "Call out how this differs from URL shortener and cloud storage designs.",
    ],
    communicationMD: `
Lead with the read path and the storage split. Say that most pastes are small and can be served quickly from cache or metadata, but large pastes must move to object storage. Then layer in policy: TTL, one-time reads, visibility, password checks, scanning, and analytics. Whenever you mention caching, immediately state which paste types are safe to cache and which must bypass shared caches.
`,
  },
  revisionNotesMD: `
- Pastebin stores and serves text content; it is not just a redirect mapping like URL Shortener.
- Use **paste_key** as the primary lookup key. A read should hit CDN, Redis, or one metadata lookup plus optional object fetch.
- Small pastes can be inline in the metadata database. Large pastes should be compressed in object storage with URI, hash, size, and policy in metadata.
- With 30M creates per month and 50:1 reads, expect about 12 write QPS average, 580 read QPS average, and 10x peaks around 120 writes and 5,800 reads per second.
- Twelve months of content at the assumed mix is about 30 TB raw before replication and lifecycle cleanup.
- Use long random base62 keys. Eight characters provide about 218T combinations and reduce enumeration risk.
- Cache only public, clean, non-password, non-burn pastes. TTL must not exceed expiration, and takedowns need invalidation.
- Burn-after-read requires an atomic conditional update before returning content.
- Scan content for spam, malware, secrets, and policy violations. Escape rendered output and serve raw text safely.
- Emit view analytics asynchronously and aggregate outside the serving database.
`,
  flashcards: [
    {
      front: "What is the primary key for Pastebin reads?",
      back: "paste_key, because every shared link contains the paste key and the read path should be a point lookup.",
    },
    {
      front: "Why not store every paste inline in the database?",
      back: "Large bodies bloat the database, reduce cache efficiency, increase replication cost, and are better suited for object storage.",
    },
    {
      front: "Which pastes are safe to cache publicly?",
      back: "Public, clean, non-password, non-private, non-burn pastes with cache TTL capped by expiration.",
    },
    {
      front: "How should burn-after-read be implemented?",
      back: "Use an atomic conditional update that consumes the remaining read before returning content.",
    },
    {
      front: "How is Pastebin different from URL Shortener?",
      back: "Pastebin stores and serves content bytes, handles rendering, size limits, object storage, and abuse scanning; URL Shortener stores redirect mappings.",
    },
    {
      front: "Why use random keys instead of sequential keys?",
      back: "Random keys reduce enumeration risk and hide creation volume, which matters for unlisted pastes.",
    },
    {
      front: "Where should view analytics be updated?",
      back: "In an asynchronous event pipeline, not synchronously in the paste row during reads.",
    },
    {
      front: "What should expired or deleted pastes return?",
      back: "410 Gone, with cache invalidation and later cleanup of metadata and object bodies.",
    },
  ],
  quiz: [
    {
      question: "Why does Pastebin need object storage in addition to a metadata database?",
      options: ["To store large paste bodies without bloating the serving database", "To generate random paste keys", "To replace all access control checks", "To make one-time reads unnecessary"],
      answerIndex: 0,
      explanationMD: `
Large text bodies are byte-heavy and can make the metadata database expensive and slow. Object storage is better for durable large content, while metadata stays small and fast.
`,
    },
    {
      question: "Which paste type should not be served from a shared CDN cache?",
      options: ["A public clean paste with no password", "A burn-after-read paste", "A popular public documentation snippet", "A public paste with a long TTL"],
      answerIndex: 1,
      explanationMD: `
Burn-after-read requires an atomic state change before content is returned. A shared cache could serve it multiple times and bypass the burn semantics.
`,
    },
    {
      question: "Given 30M creates per month and 30 days per month, what is the approximate average write QPS?",
      options: ["1 write per second", "12 writes per second", "120 writes per second", "1,200 writes per second"],
      answerIndex: 1,
      explanationMD: `
30M divided by 30 days is 1M per day. 1M divided by 86,400 seconds is about 11.6 writes per second, rounded to 12.
`,
    },
    {
      question: "What is the safest way to consume a one-time paste under concurrent reads?",
      options: ["Read the content first and update the row later", "Use an atomic conditional update before returning the body", "Cache it at the CDN for one minute", "Delete all expired pastes once per day"],
      answerIndex: 1,
      explanationMD: `
The conditional update ensures only one request transitions the paste from active to burned. Losing concurrent requests return 410 Gone.
`,
    },
    {
      question: "Why are long random paste keys preferred for unlisted pastes?",
      options: ["They make syntax highlighting faster", "They reduce enumeration risk and hide creation volume", "They remove the need for TTL", "They make object storage cheaper"],
      answerIndex: 1,
      explanationMD: `
Sequential keys are easy to crawl and reveal volume. Long random keys make guessing valid unlisted pastes much harder.
`,
    },
    {
      question: "Where should view analytics be processed?",
      options: ["Synchronously in the paste metadata row on every read", "In an asynchronous event pipeline and aggregate store", "Only inside the CDN access log with no application events", "In the password hash table"],
      answerIndex: 1,
      explanationMD: `
Asynchronous events avoid read latency and write hot spots. Aggregates can be eventually consistent for dashboards.
`,
    },
    {
      question: "What is the main security concern when rendering syntax-highlighted pastes?",
      options: ["The paste key may be too short", "User text can cause XSS if not escaped", "Object storage may compress the body", "View analytics may be delayed"],
      answerIndex: 1,
      explanationMD: `
Paste content is untrusted input. Rendering must escape HTML, use safe content types, and apply a restrictive content security policy.
`,
    },
  ],
  cheatSheetMD: `
**Goal**: create text pastes, return compact keys, and serve content quickly while enforcing TTL, visibility, password, one-time read, and abuse policy.

**Workload**: 30M creates per month, 50:1 reads, about 12 write QPS average, about 580 read QPS average, and 10x peaks around 120 writes and 5,800 reads per second.

**Storage split**: small pastes inline in metadata for one lookup. Large pastes compressed in object storage with metadata pointer, size, hash, language, status, and TTL.

**Key generation**: random base62 keys with conditional insert. Eight characters gives about 218T combinations and helps resist enumeration.

**Serving path**: client to CDN for cacheable public reads. On miss or private policy, go to load balancer, Paste API, Redis, metadata DB, and object storage if needed.

**Cache policy**: cache public clean non-password non-burn pastes only. Cap TTL by expiration and invalidate on delete, burn, or takedown.

**Burn-after-read**: perform atomic conditional update before returning the body. Never serve through shared cache.

**Security**: escape rendered text, use safe raw content types, rate-limit creates and invalid scans, hash passwords, scan abuse, and protect private analytics.

**Analytics**: publish view events asynchronously and aggregate outside the serving database.
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
      title: "Amazon S3 User Guide",
      kind: "Docs",
      url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html",
      author: "Amazon Web Services",
    },
    {
      title: "Amazon DynamoDB Developer Guide",
      kind: "Docs",
      url: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html",
      author: "Amazon Web Services",
    },
    {
      title: "OWASP Cross Site Scripting Prevention Cheat Sheet",
      kind: "Docs",
      url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html",
      author: "OWASP",
    },
  ],
};
