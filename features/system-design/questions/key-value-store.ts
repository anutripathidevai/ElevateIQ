import type { SDQuestionContent } from "../types";

export const keyValueStoreContent: SDQuestionContent = {
  slug: "key-value-store",
  statementMD: `
Design a distributed Key-Value Store like Amazon DynamoDB, Apache Cassandra, or the storage layer behind a large metadata platform. The system accepts keys and opaque values, stores them durably, and returns values with predictable low latency under petabyte-scale data and very high write throughput.

At interview scale, assume trillions of keys, multiple petabytes of logical data, millions of writes per second, and failures as a normal condition. The hard part is not a hash map API; it is partitioning keys across a changing fleet, replicating every mutation, providing tunable consistency, detecting failures without a central coordinator, repairing divergent replicas, and keeping the write-optimized storage engine healthy.

The default design should resemble Dynamo or Cassandra: consistent hashing with virtual nodes, replication factor N, quorum reads and writes where R + W > N when stronger consistency is needed, eventual consistency for availability, vector clocks or last-write-wins for conflict handling, Merkle-tree anti-entropy, hinted handoff, read repair, gossip membership, and an LSM-tree storage engine.
`,
  businessUseCaseMD: `
Key-value stores power shopping carts, feature state, user preferences, session metadata, device state, event deduplication, counters, IoT telemetry, catalog metadata, and high-throughput serving layers where access is dominated by direct lookup by key.

Businesses choose this architecture when they need predictable scale-out, high availability during node and zone failures, and operational control over the consistency versus latency tradeoff. It is especially valuable when the workload is write-heavy and the product can tolerate eventual consistency for some reads.
`,
  functionalRequirements: [
    "Put, get, and delete an opaque value by table name and key.",
    "Support configurable consistency levels such as one, quorum, and all for reads and writes.",
    "Partition keys across a dynamic node fleet using consistent hashing and virtual nodes.",
    "Replicate each item to N distinct nodes, preferably across racks or availability zones.",
    "Return version metadata so clients or services can detect and resolve conflicting writes.",
    "Support TTL expiration and tombstones without blocking foreground reads and writes.",
    "Handle node additions, removals, and rebalancing with minimal customer-visible downtime.",
    "Expose operational APIs for ring state, replica health, repair progress, and throttling.",
  ],
  nonFunctionalRequirements: [
    {
      label: "Latency",
      detailMD: `
Single-key reads and writes should complete in single-digit milliseconds at p50 and under 50ms p99 inside a region for normal object sizes. Quorum operations cost more because the coordinator waits for multiple replicas, so the system must hedge, timeout, and avoid slow replicas dominating the tail.
`,
    },
    {
      label: "Availability",
      detailMD: `
The store should continue serving reads and writes when individual nodes, disks, racks, or an availability zone fail. A common target is 99.99 percent or higher per region for operations at consistency one or quorum, with clearly documented degradation for all-replica operations.
`,
    },
    {
      label: "Write scalability",
      detailMD: `
Writes must scale by adding nodes, not by increasing coordination on one leader. The write path should be append-oriented through a WAL and memtable, then flushed to immutable SSTables. Coordinators should be stateless so write traffic can be spread across the fleet.
`,
    },
    {
      label: "Durability",
      detailMD: `
A write acknowledged at the selected consistency level must survive process crashes and common disk failures. Each accepting replica appends to a WAL before acknowledging, data is stored on N replicas, and anti-entropy repairs missed or corrupted copies.
`,
    },
    {
      label: "Tunable consistency",
      detailMD: `
Clients should choose the consistency level that matches the use case. With replication factor N, read quorum R, and write quorum W, choosing R + W > N makes at least one replica overlap between a successful read and write in the absence of concurrent writes and failed repairs. Lower consistency improves latency and availability but allows stale reads.
`,
    },
    {
      label: "Elastic rebalancing",
      detailMD: `
Adding or removing nodes should move only a bounded fraction of token ranges. Virtual nodes smooth capacity differences, and streaming should be throttled so rebalancing does not starve foreground traffic.
`,
    },
    {
      label: "Operational safety",
      detailMD: `
The design needs observability for hot partitions, quorum failures, gossip convergence, compaction debt, hint backlog, read repair rate, tombstone pressure, and disk utilization. Operators need guardrails before small imbalances become cluster-wide incidents.
`,
    },
  ],
  capacityEstimation: {
    assumptionsMD: `
Assume a regional cluster storing 5 PB of logical user data with an average logical record size of 4 KB including key, value, metadata, version, checksum, and TTL fields. Use replication factor 3 across failure domains. The workload averages 1M writes per second and 2M reads per second, with a 5x peak multiplier.

The storage engine is LSM-based, so physical capacity must include replicas, WALs, indexes, Bloom filters, tombstones, and compaction headroom. Assume 8 TB of safe usable data per storage node after reserving local disk for operating system, logs, and emergency free space.
`,
    metrics: [
      {
        label: "Logical data",
        value: "5 PB",
        note: "User-visible data before replication and LSM overhead",
      },
      {
        label: "Average record size",
        value: "4 KB",
        note: "Includes key, value, metadata, version, checksum, and TTL",
      },
      {
        label: "Stored keys",
        value: "About 1.25T records",
        note: "5 PB divided by 4 KB per record",
      },
      {
        label: "Replication factor",
        value: "N = 3",
        note: "Replicas placed across distinct failure domains",
      },
      {
        label: "Replicated data",
        value: "15 PB",
        note: "5 PB logical times 3 replicas before storage-engine overhead",
      },
      {
        label: "Physical capacity target",
        value: "25 to 30 PB",
        note: "Replicated data plus 1.7x to 2.0x LSM and compaction headroom",
      },
      {
        label: "Average write QPS",
        value: "1M writes per second",
        note: "4 GB per second logical ingest at 4 KB per write",
      },
      {
        label: "Peak write QPS",
        value: "5M writes per second",
        note: "5x peak multiplier",
      },
      {
        label: "Average read QPS",
        value: "2M reads per second",
        note: "Direct key lookups, usually one or quorum replicas",
      },
      {
        label: "Peak read QPS",
        value: "10M reads per second",
        note: "5x peak multiplier",
      },
      {
        label: "Replicated ingest bandwidth",
        value: "12 GB per second average",
        note: "1M writes per second times 4 KB times 3 replicas",
      },
      {
        label: "Storage nodes",
        value: "About 4,000 to 4,500 nodes",
        note: "30 PB physical divided by 8 TB safe usable per node, plus spare headroom",
      },
    ],
    calculationsMD: `
- Records: 5 PB divided by 4 KB per record is about 1.25 trillion records.
- Replication: with N = 3, 5 PB logical becomes 15 PB replicated before LSM overhead.
- LSM overhead: compaction, tombstones, Bloom filters, partition indexes, and WAL reserve commonly require 1.7x to 2.0x headroom, so 15 PB becomes 25.5 to 30 PB physical capacity.
- Node count: 30 PB divided by 8 TB safe usable per node is about 3,750 nodes. Add spare capacity for repairs, drains, and skew, so plan for roughly 4,000 to 4,500 storage nodes.
- Write bandwidth: 1M writes per second times 4 KB is 4 GB per second logical. With 3 replicas, the cluster writes about 12 GB per second before protocol overhead, compaction rewrite, and repair traffic.
- Peak writes: a 5x multiplier turns 1M average writes per second into 5M peak writes per second.
- Reads: 2M average reads per second and 10M peak reads per second require coordinators, network, and replica thread pools sized independently from compaction and repair work.
- Virtual nodes: with 4,000 nodes and 256 virtual nodes per physical node, the ring has about 1,024,000 token ranges, which gives fine-grained balancing and manageable streaming units.
`,
  },
  apiDesign: {
    endpoints: [
      {
        method: "PUT",
        path: "/v1/tables/{table}/items/{key}",
        descriptionMD: `
Writes or overwrites a value for a key. The caller chooses a consistency level and may provide expected version metadata for conditional updates or conflict-aware writes.
`,
        request: `
{
  "valueBase64": "AAECAwQFBgc",
  "contentType": "application/octet-stream",
  "ttlSeconds": 86400,
  "consistency": "quorum",
  "expectedVersion": {
    "client-a": 7,
    "client-b": 2
  },
  "clientTimestamp": "2026-07-26T06:59:19Z"
}
`,
        response: `
{
  "table": "sessions",
  "key": "user_123",
  "version": {
    "node-17": 481,
    "node-42": 910
  },
  "replicasAcknowledged": 2,
  "status": "stored"
}
`,
        statusCodes: [
          { code: 200, meaning: "Value stored or replaced" },
          { code: 400, meaning: "Invalid table, key, value, TTL, or consistency level" },
          { code: 409, meaning: "Expected version did not match current version" },
          { code: 413, meaning: "Value exceeds maximum item size" },
          { code: 429, meaning: "Table or tenant write limit exceeded" },
          { code: 503, meaning: "Requested consistency level unavailable" },
        ],
      },
      {
        method: "GET",
        path: "/v1/tables/{table}/items/{key}",
        descriptionMD: `
Reads a value by key. At consistency one, the coordinator can return the fastest healthy replica. At quorum, it reads enough replicas to compare versions and detect stale or conflicting copies.
`,
        response: `
{
  "table": "sessions",
  "key": "user_123",
  "valueBase64": "AAECAwQFBgc",
  "version": {
    "node-17": 481,
    "node-42": 910
  },
  "readConsistency": "quorum",
  "conflict": false,
  "ttlExpiresAt": "2026-07-27T06:59:19Z"
}
`,
        statusCodes: [
          { code: 200, meaning: "Value found" },
          { code: 404, meaning: "Key not found or tombstone has expired from serving view" },
          { code: 409, meaning: "Conflicting siblings exist and caller requested strict conflict detection" },
          { code: 429, meaning: "Read limit exceeded" },
          { code: 503, meaning: "Requested consistency level unavailable" },
        ],
      },
      {
        method: "DELETE",
        path: "/v1/tables/{table}/items/{key}",
        descriptionMD: `
Writes a tombstone for a key. Deletes must be replicated and retained long enough for anti-entropy to prevent old values from reappearing on repaired replicas.
`,
        request: `
{
  "consistency": "quorum",
  "expectedVersion": {
    "node-17": 481,
    "node-42": 910
  },
  "tombstoneTtlSeconds": 604800
}
`,
        response: `
{
  "table": "sessions",
  "key": "user_123",
  "status": "tombstoned",
  "replicasAcknowledged": 2
}
`,
        statusCodes: [
          { code: 200, meaning: "Delete tombstone written" },
          { code: 404, meaning: "Key did not exist and idempotent delete was not enabled" },
          { code: 409, meaning: "Expected version did not match" },
          { code: 503, meaning: "Requested consistency level unavailable" },
        ],
      },
      {
        method: "POST",
        path: "/v1/tables/{table}/batch-get",
        descriptionMD: `
Fetches multiple independent keys. The service groups keys by token range and replica preference list, then fans out subrequests while enforcing per-request limits.
`,
        request: `
{
  "keys": ["user_123", "user_456", "user_789"],
  "consistency": "one",
  "includeVersion": true
}
`,
        response: `
{
  "items": [
    {
      "key": "user_123",
      "found": true,
      "valueBase64": "AAECAwQFBgc"
    },
    {
      "key": "user_456",
      "found": false
    }
  ],
  "partialFailures": []
}
`,
        statusCodes: [
          { code: 200, meaning: "Batch completed, possibly with per-key misses" },
          { code: 400, meaning: "Too many keys or invalid request" },
          { code: 429, meaning: "Batch read limit exceeded" },
          { code: 503, meaning: "Too many partitions unavailable" },
        ],
      },
      {
        method: "GET",
        path: "/v1/admin/tables/{table}/ring",
        descriptionMD: `
Returns ring ownership, vnode placement, replica health, and rebalancing state for operators. This is a privileged operational endpoint, not a customer data path.
`,
        response: `
{
  "table": "sessions",
  "replicationFactor": 3,
  "vnodes": 1024000,
  "unavailableRanges": 12,
  "streamingRanges": 340,
  "hotRanges": [
    {
      "tokenStart": "8800000000000000000",
      "tokenEnd": "8810000000000000000",
      "owner": "node-313"
    }
  ]
}
`,
        statusCodes: [
          { code: 200, meaning: "Ring state returned" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Caller is not an operator" },
        ],
      },
    ],
    notesMD: `
Keep the public API intentionally small. The core data path is single-key get, put, and delete with explicit consistency selection. Batch APIs are convenience wrappers around independent key lookups and must not promise cross-key transactions.

Large values should be rejected or redirected to object storage with the KV record storing only metadata and a pointer. Otherwise compaction, repair, and read amplification become dominated by a few oversized records.
`,
  },
  databaseDesign: {
    schemaMD: `
This question designs the database itself, so the schema below represents internal logical records rather than an application schema. The serving row is addressed by table name and key hash, then stored on the N replicas selected by the token ring.

Each storage node persists mutations in a WAL, applies them to an in-memory memtable, and flushes immutable SSTables. Metadata tables track token ownership, gossip state, hinted handoff, repairs, and compaction progress. Secondary indexes are intentionally not part of the core design because they change the problem from a key-value store into a distributed indexing system.
`,
    tables: [
      {
        name: "kv_records",
        columns: [
          { name: "table_name", type: "varchar(128)", note: "Logical customer table or namespace" },
          { name: "key_hash", type: "uint64", note: "Token produced by hashing the key" },
          { name: "item_key", type: "bytes", note: "Original key bytes used for exact match after token routing" },
          { name: "value_blob", type: "bytes", note: "Opaque customer value, normally bounded to a small maximum size" },
          { name: "version_clock", type: "json or binary map", note: "Vector clock or dotted version vector for conflict detection" },
          { name: "last_write_time", type: "timestamp", note: "Used for last-write-wins when the table chooses that policy" },
          { name: "ttl_expires_at", type: "timestamp nullable", note: "Null means no TTL expiration" },
          { name: "tombstone", type: "boolean", note: "Delete marker retained until repair safety window passes" },
          { name: "checksum", type: "uint32", note: "Detects disk or transfer corruption" },
        ],
      },
      {
        name: "token_ring",
        columns: [
          { name: "table_name", type: "varchar(128)", note: "Ring can differ by table if capacity isolation is required" },
          { name: "vnode_id", type: "uuid", note: "Virtual node identifier" },
          { name: "token_start", type: "uint64", note: "Inclusive start of token range" },
          { name: "token_end", type: "uint64", note: "Exclusive end of token range" },
          { name: "owner_node_id", type: "varchar(128)", note: "Physical node that owns this virtual range" },
          { name: "replica_rank", type: "int", note: "Primary, secondary, tertiary, and so on in preference list" },
          { name: "state", type: "varchar(32)", note: "Active, bootstrapping, leaving, draining, or down" },
        ],
      },
      {
        name: "node_membership",
        columns: [
          { name: "node_id", type: "varchar(128)", note: "Stable node identity" },
          { name: "region", type: "varchar(64)", note: "Geographic or cloud region" },
          { name: "availability_zone", type: "varchar(64)", note: "Failure domain used for replica placement" },
          { name: "rack", type: "varchar(64)", note: "Optional lower-level failure domain" },
          { name: "gossip_generation", type: "bigint", note: "Monotonic generation for node restarts" },
          { name: "heartbeat_version", type: "bigint", note: "Incremented through gossip heartbeats" },
          { name: "status", type: "varchar(32)", note: "Up, suspect, down, joining, leaving, or decommissioned" },
          { name: "owned_vnodes", type: "json", note: "Compact list or pointer to the node token assignments" },
        ],
      },
      {
        name: "repair_and_hint_log",
        columns: [
          { name: "entry_id", type: "uuid", note: "Hint, read repair, or anti-entropy task id" },
          { name: "target_node_id", type: "varchar(128)", note: "Replica that should receive the missed mutation or repair" },
          { name: "table_name", type: "varchar(128)", note: "Table containing the affected key range" },
          { name: "token_start", type: "uint64", note: "Start token for range repair, or key token for a hint" },
          { name: "token_end", type: "uint64", note: "End token for range repair, or same as start for a point mutation" },
          { name: "mutation_blob", type: "bytes nullable", note: "Serialized missed write for hinted handoff entries" },
          { name: "created_at", type: "timestamp", note: "Used for expiry, retries, and repair scheduling" },
          { name: "state", type: "varchar(32)", note: "Pending, replaying, complete, expired, or failed" },
        ],
      },
    ],
    indexesMD: `
- The primary serving lookup is **table_name plus key_hash plus item_key** inside the owning token range.
- Token ring metadata is indexed by **table_name plus token_start** so coordinators can find the replica preference list for a key hash.
- Membership is indexed by **node_id** and also queried by status for operator workflows.
- Repair and hint logs are indexed by **target_node_id plus created_at** to replay missed mutations in order and expire old hints.
- Avoid general secondary indexes in the core KV store. If needed, build them as separate asynchronous projection tables with their own partitioning and repair model.
`,
    relationshipsMD: `
A logical item belongs to exactly one token range and is stored on N replica nodes selected from the ring preference list. Each physical node owns many virtual nodes, which allows fine-grained rebalancing. Membership state feeds ring placement, ring placement feeds coordinator routing, and repair logs reconcile mutations that were missed because a replica was down or partitioned.
`,
    noSqlAlternativesMD: `
The closest production systems are Dynamo-style and Cassandra-style stores. Dynamo emphasizes consistent hashing, sloppy quorums, hinted handoff, vector clocks, and application-assisted conflict resolution. Cassandra emphasizes wide-column storage, tunable consistency, gossip, hinted handoff, read repair, and an LSM-tree engine.

If the product needs strict serializable transactions, FoundationDB, Spanner, or a consensus-backed database may be a better fit. If the product mostly stores large immutable blobs, object storage plus a smaller metadata store is often cheaper than putting blobs directly into the KV engine.
`,
  },
  architecture: {
    width: 960,
    height: 560,
    nodes: [
      { id: "client-sdk", label: "Client SDK", kind: "client", x: 80, y: 245, sublabel: "Get, put, delete" },
      { id: "regional-lb", label: "Regional Load Balancer", kind: "loadBalancer", x: 230, y: 245, sublabel: "Healthy coordinators" },
      { id: "coordinator", label: "Request Coordinator", kind: "gateway", x: 390, y: 245, sublabel: "Hash key, fan out" },
      { id: "ring-map", label: "Partition Ring", kind: "service", x: 390, y: 90, sublabel: "Consistent hash, vnodes" },
      { id: "gossip", label: "Gossip Membership", kind: "monitoring", x: 575, y: 90, sublabel: "Failure detection" },
      { id: "replica-a", label: "Replica Node A", kind: "database", x: 590, y: 205, sublabel: "AZ 1" },
      { id: "replica-b", label: "Replica Node B", kind: "database", x: 590, y: 320, sublabel: "AZ 2" },
      { id: "replica-c", label: "Replica Node C", kind: "database", x: 590, y: 435, sublabel: "AZ 3" },
      { id: "lsm-engine", label: "LSM Storage Engine", kind: "storage", x: 785, y: 265, sublabel: "WAL, memtable, SSTables" },
      { id: "hint-queue", label: "Hinted Handoff Queue", kind: "queue", x: 785, y: 420, sublabel: "Missed writes" },
      { id: "repair-workers", label: "Repair Workers", kind: "worker", x: 785, y: 95, sublabel: "Merkle trees, read repair" },
      { id: "metrics", label: "Metrics and Alerts", kind: "monitoring", x: 875, y: 525, sublabel: "Hot ranges, compaction" },
    ],
    edges: [
      { from: "client-sdk", to: "regional-lb", label: "KV request" },
      { from: "regional-lb", to: "coordinator", label: "route to healthy node" },
      { from: "coordinator", to: "ring-map", label: "lookup token range" },
      { from: "ring-map", to: "gossip", label: "membership updates", dashed: true },
      { from: "coordinator", to: "replica-a", label: "replica request" },
      { from: "coordinator", to: "replica-b", label: "replica request" },
      { from: "coordinator", to: "replica-c", label: "replica request" },
      { from: "replica-a", to: "lsm-engine", label: "append and flush" },
      { from: "replica-b", to: "lsm-engine", label: "append and flush" },
      { from: "replica-c", to: "lsm-engine", label: "append and flush" },
      { from: "coordinator", to: "hint-queue", label: "store hint on failure", dashed: true },
      { from: "hint-queue", to: "replica-c", label: "replay when healthy", dashed: true },
      { from: "repair-workers", to: "replica-a", label: "compare ranges", dashed: true },
      { from: "repair-workers", to: "replica-b", label: "stream repairs", dashed: true },
      { from: "gossip", to: "coordinator", label: "suspect and down state", dashed: true },
      { from: "lsm-engine", to: "metrics", label: "compaction and disk signals", dashed: true },
    ],
    captionMD: `
The coordinator hashes the key, consults the consistent hash ring, sends the operation to the N replica nodes, waits for the requested read or write quorum, and lets repair paths reconcile lagging replicas in the background.
`,
  },
  architectureNotesMD: `
The cluster has no single leader for the full keyspace. Any healthy coordinator can accept a request, compute the token for the key, find the replica preference list, and coordinate a read or write. This keeps the API tier horizontally scalable while preserving deterministic placement.

Data nodes combine coordination and storage in many real systems, but the diagram separates the coordinator role from the replica and LSM engine for clarity. Each replica persists writes locally with a WAL and memtable before acknowledging, then flushes and compacts SSTables over time. Reads use Bloom filters, partition indexes, and sometimes multiple SSTables until compaction reduces overlap.

Gossip, hinted handoff, read repair, and Merkle-tree anti-entropy are not optional add-ons at this scale. They are the mechanisms that let the system remain available during failures while eventually converging after replicas miss writes or diverge.
`,
  requestFlow: [
    {
      title: "Client selects operation and consistency",
      detailMD: `
The client sends a get, put, or delete with a table, key, optional TTL, and desired consistency such as one, quorum, or all. The SDK can retry idempotent operations, but it should attach request identifiers and version metadata so duplicate writes do not create ambiguous state.
`,
    },
    {
      title: "Coordinator hashes the key",
      detailMD: `
The load balancer routes to a healthy coordinator. The coordinator hashes the table and key into a token, consults the ring metadata, and identifies the ordered replica preference list across availability zones or racks.
`,
    },
    {
      title: "Write is sent to N replicas",
      detailMD: `
For a put or delete, the coordinator sends the mutation to the N replicas. Each available replica validates limits, appends the mutation to its WAL, updates the memtable, records version metadata, and acknowledges after the durable append.
`,
    },
    {
      title: "Coordinator waits for W acknowledgements",
      detailMD: `
The write succeeds after W replicas acknowledge. If a replica is down and sloppy quorum is allowed, the coordinator can write a hint to another healthy node so the missed mutation can be replayed later. If W acknowledgements cannot be reached before timeout, the request returns unavailable or timeout.
`,
    },
    {
      title: "Read contacts R replicas",
      detailMD: `
For a get, the coordinator sends requests to enough replicas for the selected consistency level. At consistency one it may return the fastest healthy response. At quorum it compares versions or digests from multiple replicas and uses the latest non-conflicting value or returns siblings.
`,
    },
    {
      title: "Conflict policy is applied",
      detailMD: `
If versions are concurrent, the table policy decides whether to return multiple siblings, merge with application logic, or apply last-write-wins. Last-write-wins is simple but can lose writes when clocks skew or concurrent updates race.
`,
    },
    {
      title: "Read repair fixes stale replicas",
      detailMD: `
When a read discovers that one replica is stale, the coordinator can send the fresh value or tombstone back to the lagging replica asynchronously. This improves convergence for hot keys without waiting for full anti-entropy repair.
`,
    },
    {
      title: "Background repair and handoff continue",
      detailMD: `
Hinted handoff replays missed writes after failed nodes recover. Anti-entropy workers compare Merkle trees for token ranges and stream only differing data. Compaction eventually removes overwritten values and tombstones after the safety window.
`,
    },
  ],
  coreComponents: [
    {
      name: "Client SDK",
      kind: "client",
      role: "Provides a simple API while exposing consistency and retry semantics.",
      detailMD: `
The SDK hashes no secrets and owns no data placement authority, but it can handle endpoint discovery, deadlines, idempotency tokens, retries, backoff, and surfacing version metadata. Good client behavior is important because aggressive retries can amplify overload.
`,
    },
    {
      name: "Request Coordinator",
      kind: "gateway",
      role: "Routes each operation to the correct replica set and enforces quorum rules.",
      detailMD: `
The coordinator is stateless with respect to durable data. It reads ring metadata, fans out to replicas, tracks acknowledgements, compares versions, stores hints when allowed, and returns the result once the requested consistency level is satisfied.
`,
    },
    {
      name: "Consistent Hash Ring",
      kind: "service",
      role: "Maps key tokens to virtual nodes and physical replicas.",
      detailMD: `
The ring assigns many virtual token ranges to each physical node. Replica placement walks the ring while respecting region, zone, rack, and capacity constraints. Ring changes are versioned so coordinators and storage nodes can converge safely during rebalancing.
`,
    },
    {
      name: "Replica Manager",
      kind: "database",
      role: "Owns local reads, writes, tombstones, and version metadata for assigned ranges.",
      detailMD: `
Each replica accepts mutations for its token ranges, persists them locally, serves reads from memtables and SSTables, participates in repairs, and reports health. It must isolate foreground traffic from compaction, streaming, and repair work.
`,
    },
    {
      name: "LSM Storage Engine",
      kind: "storage",
      role: "Optimizes high write throughput using append-only structures.",
      detailMD: `
The engine writes to a WAL, applies changes to a memtable, flushes immutable SSTables, and compacts SSTables to reduce read amplification and reclaim overwritten data. Bloom filters and indexes avoid unnecessary disk reads.
`,
    },
    {
      name: "Gossip and Failure Detector",
      kind: "monitoring",
      role: "Spreads membership state and identifies suspect nodes without a central master.",
      detailMD: `
Nodes exchange heartbeat and state digests with peers. A phi accrual style failure detector can mark nodes suspect based on observed heartbeat delays, reducing false positives compared with fixed timeouts.
`,
    },
    {
      name: "Hinted Handoff",
      kind: "queue",
      role: "Preserves writes for temporarily unavailable replicas.",
      detailMD: `
When a target replica is down but the write can still meet its consistency level, another node stores a hint containing the missed mutation. The hint is replayed when the replica returns, bounded by expiry and capacity limits.
`,
    },
    {
      name: "Anti-Entropy Repair",
      kind: "worker",
      role: "Finds and repairs divergent replicas over time.",
      detailMD: `
Repair workers build Merkle trees for token ranges, compare tree roots and subtrees across replicas, and stream only mismatched rows. This is essential for cold data that may never be read and therefore never benefits from read repair.
`,
    },
  ],
  deepDives: [
    {
      topic: "Consistent hashing and virtual nodes",
      detailMD: `
Consistent hashing maps the output of a hash function onto a logical ring. A key is assigned to the first token range at or after its hash, and replicas are selected by continuing around the ring while respecting failure-domain rules. When nodes join or leave, only nearby token ranges need to move instead of reshuffling the entire dataset.

Virtual nodes improve balance. Instead of giving each physical node one large range, assign it hundreds of smaller ranges. A powerful node can own more virtual nodes, a weaker node can own fewer, and rebalancing can stream small ranges gradually. This also smooths random skew in token assignment.

The tradeoff is metadata and operational complexity. More virtual nodes mean more ring entries, more streams during repair and bootstrap, and more small compaction histories. A practical design keeps enough vnodes for balance but not so many that membership changes become noisy.
`,
    },
    {
      topic: "Replication factor and quorum consistency",
      detailMD: `
With replication factor N, every key has N preferred replicas. A write consistency W means the coordinator waits for W acknowledgements. A read consistency R means it consults R replicas. If R + W > N, then a successful read and successful write overlap on at least one replica, which reduces stale reads when there is no unresolved concurrent write.

For N = 3, common choices are W = 2 and R = 2 for quorum, W = 1 and R = 1 for lowest latency, or W = 3 and R = 1 for write durability with fast reads. The right choice is per workload. Shopping carts may prefer availability and mergeable conflicts. Payment state should not rely on this alone and may need a transactional system.

Quorums are not magic. Network partitions, timeouts, hinted writes, clock skew, sloppy quorum, and concurrent updates can still produce conflicts or stale reads. A strong candidate explains both the usefulness and limits of R + W > N.
`,
    },
    {
      topic: "Eventual consistency, vector clocks, and last-write-wins",
      detailMD: `
In an always-writable distributed store, two clients can update the same key through different coordinators while replicas are partitioned. If neither update causally follows the other, the system must preserve or resolve the conflict.

Vector clocks track causal history by keeping counters for writers or replica actors. If one clock dominates another, the dominated version is older and can be discarded. If neither dominates, the versions are concurrent siblings. The safest approach returns siblings to the application for a semantic merge, such as combining shopping cart items.

Last-write-wins stores a timestamp and picks the largest timestamp. It is operationally simple and works for cache-like or idempotent state, but it can silently lose a valid concurrent update. If using LWW, use server-assigned hybrid logical clocks where possible and make the data loss tradeoff explicit.
`,
    },
    {
      topic: "LSM-tree storage engine",
      detailMD: `
The write path is optimized for sequential IO. A replica appends the mutation to the WAL, applies it to an in-memory memtable, and acknowledges after durable logging. When the memtable reaches a threshold, it is flushed to an immutable SSTable sorted by key. Reads check the memtable, then recent SSTables, aided by Bloom filters and sparse indexes.

Compaction merges SSTables, drops overwritten values, purges expired tombstones after the repair safety window, and reduces the number of files a read must check. Size-tiered compaction improves write throughput but can increase space amplification. Leveled compaction improves read latency but writes more data during compaction.

At petabyte scale, compaction is often the hidden bottleneck. The design needs backpressure, compaction debt metrics, per-tenant throttles, and enough spare disk to survive a node rebuild while compaction is behind.
`,
    },
    {
      topic: "Anti-entropy, Merkle trees, hinted handoff, and read repair",
      detailMD: `
Hinted handoff handles short outages. If replica C is down and a write reaches replicas A and B, the coordinator can store a hint for C. When C returns, the hint is replayed so C catches up. Hints should expire because a long-dead node may be too stale and should be rebuilt from streaming repair instead.

Read repair handles hot data opportunistically. When a quorum read discovers that one replica has an older version or missing tombstone, the coordinator sends the correct version back to the stale replica asynchronously. This converges keys that are frequently read.

Merkle-tree anti-entropy handles cold data. Replicas build hash trees over token ranges. If roots differ, workers descend the tree to find mismatching subranges and stream only those rows. This avoids comparing every key over the network while still proving that replicas converge.
`,
    },
    {
      topic: "Hot partitions, rebalancing, and failure detection",
      detailMD: `
Consistent hashing balances keys, not traffic. A single celebrity key, tenant, or time-bucketed key prefix can overload one replica set even if storage bytes are balanced. Mitigations include better key design, write sharding, adaptive key splitting, hot-key caching, per-tenant throttling, and moving hot virtual nodes to stronger hardware.

Rebalancing must be controlled. When a node joins, it receives token ranges and streams data from existing replicas. If too many nodes bootstrap or repair at once, streaming competes with customer traffic and compaction. Rate-limit streams, preserve spare capacity, and avoid ring churn during incidents.

Gossip-based failure detection is eventually consistent. Marking a node down too quickly causes unnecessary hinted handoff and replica churn; marking it down too slowly increases tail latency. The failure detector should incorporate recent heartbeat variance, network conditions, and operator override states.
`,
    },
  ],
  scaling: [
    {
      stage: "Starter: one region, small replicated cluster",
      detailMD: `
Begin with a few storage nodes, replication factor 3, one table namespace, and simple quorum reads and writes. Use a basic LSM engine, WAL durability, operator-visible ring metadata, and manual repair jobs. This demonstrates correctness, but it has limited isolation and rebalancing sophistication.
`,
    },
    {
      stage: "Growth: dozens of nodes and high write throughput",
      detailMD: `
Introduce virtual nodes, rack-aware replica placement, client-visible consistency levels, compaction tuning, Bloom filters, backpressure, and automated hinted handoff. Add dashboards for p99 latency, compaction debt, disk fullness, dropped mutations, and hot token ranges.
`,
    },
    {
      stage: "Petabyte scale: thousands of nodes",
      detailMD: `
Use hundreds of vnodes per node, token-aware routing, repair scheduling, per-tenant quotas, streaming throttles, incremental Merkle repair, and automated node replacement. Keep at least 20 to 30 percent spare capacity so repairs and rebalances do not run the fleet at full disk or network utilization.
`,
    },
    {
      stage: "Multi-region active-active",
      detailMD: `
Replicate between regions asynchronously for low-latency local writes, or synchronously only for tables that can afford higher latency. Use region-aware version metadata, conflict policies per table, failover runbooks, and clear customer-facing consistency guarantees.
`,
    },
    {
      stage: "Extreme scale and noisy tenants",
      detailMD: `
Add tenant isolation through dedicated tables, partitions, or fleets. Detect hot keys automatically, split or replicate hot ranges, isolate compaction pools, and provide admission control so one tenant's write burst or repair backlog does not impact unrelated workloads.
`,
    },
  ],
  bottlenecks: [
    {
      issue: "Hot partition or hot key",
      optimizationMD: `
Consistent hashing cannot fix a key that receives disproportionate traffic. Use key-salting for write-heavy counters, application-level sharding, hot-key caching for reads, adaptive virtual range movement, and tenant throttles. Also teach customers to avoid monotonically increasing or time-bucket-only keys when all writes land in the newest bucket.
`,
    },
    {
      issue: "Compaction debt and write amplification",
      optimizationMD: `
Monitor pending compaction bytes, SSTable count, tombstone density, and disk free space. Tune compaction strategy per workload, throttle writes before disks fill, separate compaction IO from foreground reads, and avoid storing very large values in the LSM path.
`,
    },
    {
      issue: "Quorum tail latency",
      optimizationMD: `
Quorum reads and writes wait for multiple replicas, so the slowest needed replica determines user latency. Use replica health scoring, speculative reads, hedged requests, fast failure detection, and careful timeout budgets. Do not hedge so aggressively that it doubles load during incidents.
`,
    },
    {
      issue: "Repair backlog",
      optimizationMD: `
If anti-entropy cannot keep up, replicas diverge and tombstones become dangerous to purge. Run incremental repair continuously, prioritize ranges with recent failures, cap concurrent streams, and alert on repair age by token range.
`,
    },
    {
      issue: "Gossip storms and ring churn",
      optimizationMD: `
Frequent membership changes can destabilize coordinators and cause unnecessary streaming. Use staged node state transitions, operator approval for large decommissions, dampened failure detection, and separate transient network blips from true node loss.
`,
    },
    {
      issue: "Large values in a small-object store",
      optimizationMD: `
Large values increase read latency, compaction cost, repair bandwidth, and cache inefficiency. Enforce item size limits and store large blobs in object storage, with the KV store holding metadata, checksum, and object pointer.
`,
    },
  ],
  failureHandling: [
    {
      scenario: "Single replica node fails",
      strategyMD: `
Gossip marks the node suspect and then down. Coordinators stop sending it foreground traffic, continue operations if the requested consistency can be met, and create hints for missed writes when policy allows. When the node returns, it replays hints and runs repair for ranges that may have diverged.
`,
    },
    {
      scenario: "Availability zone outage",
      strategyMD: `
Replica placement across zones allows the remaining zones to serve lower or quorum consistency depending on N, R, and W. The system may temporarily reject all-replica operations, reduce repair traffic, and reserve capacity for foreground requests until the zone recovers.
`,
    },
    {
      scenario: "Network partition creates concurrent writes",
      strategyMD: `
Both sides may accept writes if consistency rules allow. Version clocks identify concurrent siblings after healing. The table policy either returns siblings to clients, invokes a merge function, or applies last-write-wins with explicit acknowledgement that one update can be lost.
`,
    },
    {
      scenario: "Disk corruption or SSTable loss",
      strategyMD: `
Checksums detect corrupted blocks. The node stops serving affected ranges, fetches clean copies from other replicas through repair, and reports data-loss risk if the number of healthy replicas falls below the durability threshold. Backups protect against correlated corruption or operator error.
`,
    },
    {
      scenario: "Coordinator crashes mid-request",
      strategyMD: `
Because the coordinator is stateless, clients can retry against another coordinator. Idempotency tokens, version checks, and read-before-return policies prevent duplicate mutations from being mistaken for separate successful writes.
`,
    },
    {
      scenario: "Bad compaction or tombstone configuration",
      strategyMD: `
If tombstones are purged before all replicas have seen the delete, deleted values can reappear. Keep a repair safety window, monitor maximum repair age, and block tombstone purging for ranges that have not been repaired recently.
`,
    },
  ],
  security: [
    {
      label: "Authentication and authorization",
      detailMD: `
Require signed requests from applications or tenants. Authorize table-level and operation-level access, separate data-plane credentials from operator credentials, and make admin ring APIs private.
`,
    },
    {
      label: "Encryption",
      detailMD: `
Use TLS for client and node-to-node traffic. Encrypt data at rest on every storage node, rotate keys through a managed key service, and protect WALs, snapshots, hints, and repair streams with the same policy as primary data.
`,
    },
    {
      label: "Tenant isolation and quotas",
      detailMD: `
A multi-tenant KV store needs per-tenant throughput limits, storage quotas, burst budgets, and noisy-neighbor protection. Without admission control, one tenant can create hot partitions, compaction debt, or repair pressure for the whole fleet.
`,
    },
    {
      label: "Auditability",
      detailMD: `
Log control-plane actions such as table creation, ring changes, node decommissioning, repair overrides, and permission changes. Data-plane audit logs should be sampled or scoped because full logging of every key read can become its own large-scale system.
`,
    },
    {
      label: "Backup and deletion safety",
      detailMD: `
Snapshots and incremental backups must preserve encryption and access controls. Deletes should write tombstones first, then satisfy retention and legal deletion workflows without allowing old replicas or backups to resurrect data unexpectedly.
`,
    },
  ],
  tradeoffs: {
    pros: [
      "Scales horizontally because keys are partitioned by hash and coordinators are stateless.",
      "High availability because writes can succeed without a single global leader.",
      "Tunable consistency lets each workload choose latency, availability, and freshness tradeoffs.",
      "LSM storage provides excellent write throughput for append-heavy workloads.",
      "Virtual nodes make node additions, removals, and heterogeneous capacity easier to manage.",
    ],
    cons: [
      "Eventual consistency exposes stale reads and conflict resolution complexity to applications.",
      "Quorum semantics are subtle and do not provide full transactions or serializability.",
      "LSM compaction, tombstones, and repair can create operational surprises at scale.",
      "Hot keys and poor key design can overload a replica set despite balanced storage.",
      "Secondary indexes and cross-key queries are hard to support without separate systems.",
    ],
    alternativesMD: `
Alternative one is a leader-based sharded database. It is easier to reason about for single-key linearizability, but leader failover and cross-region writes can reduce availability or increase latency.

Alternative two is a consensus-backed distributed SQL or transactional KV system. It provides stronger guarantees and transactions, but every write typically pays consensus latency and throughput is lower for write-heavy, globally distributed workloads.

Alternative three is object storage plus a metadata database. This is better for large blobs and cheap durability, but it does not provide low-latency fine-grained updates for trillions of small keys.
`,
    whenNotToUseMD: `
Do not use a Dynamo or Cassandra-style key-value store when the core requirement is ad hoc querying, joins, strict cross-key transactions, global serializability, or large blob streaming. It is also a poor fit when the application cannot tolerate stale reads or cannot define a safe conflict resolution policy.
`,
  },
  followUpQuestions: [
    {
      question: "Why does R + W > N matter?",
      answerMD: `
It ensures that the set of replicas used by a successful read overlaps with the set used by a successful write, so at least one replica can carry the latest acknowledged version under normal assumptions. It improves freshness but does not eliminate conflicts from concurrent writes, sloppy quorum, failed repairs, or clock issues.
`,
    },
    {
      question: "How do virtual nodes help during rebalancing?",
      answerMD: `
Virtual nodes divide ownership into many small token ranges. When a physical node joins or leaves, the cluster moves many small ranges instead of a few huge ranges, which improves balance, allows heterogeneous node capacity, and makes streaming easier to throttle.
`,
    },
    {
      question: "What happens when vector clocks grow too large?",
      answerMD: `
The system can prune old entries, use dotted version vectors, cap the number of actors, or move conflict resolution to a higher layer. Pruning reduces metadata but can make some causal relationships ambiguous, so it must be paired with a clear conflict policy.
`,
    },
    {
      question: "Why are tombstones retained after deletes?",
      answerMD: `
Deletes must be replicated like writes. If a tombstone is removed before every replica has learned about it, an old value from a stale replica can be repaired back into the cluster. Tombstones are kept until the repair safety window has passed.
`,
    },
    {
      question: "How would you handle a hot key with millions of reads per second?",
      answerMD: `
Use read-through caches, request coalescing, local replica caches, and possibly replicate the value beyond its normal N replicas. If it is a write-hot key, redesign the data model with sharded counters, time buckets, or application-level aggregation.
`,
    },
    {
      question: "What is the difference between hinted handoff and anti-entropy repair?",
      answerMD: `
Hinted handoff records specific missed mutations while a replica is temporarily unavailable and replays them when it returns. Anti-entropy repair compares ranges across replicas, often with Merkle trees, and fixes any divergence whether or not a hint exists.
`,
    },
    {
      question: "Why are secondary indexes difficult in this design?",
      answerMD: `
The base store partitions by primary key. A secondary index partitions by another attribute, so every write must update another distributed data structure with its own consistency, repair, backfill, and hot-key problems. Many systems build indexes asynchronously as separate projection tables.
`,
    },
  ],
  companyVariations: [
    {
      company: "Amazon",
      angleMD: `
Amazon interviewers often expect Dynamo-style thinking: consistent hashing, replication factor, sloppy quorum, hinted handoff, vector clocks, operational alarms, and DynamoDB-like partition hot-spot mitigation. Be ready to discuss why availability is prioritized and where the application handles conflicts.
`,
    },
    {
      company: "Databricks",
      angleMD: `
Databricks may frame the problem around high-throughput metadata, job state, feature storage, or lakehouse control-plane scale. Emphasize write amplification, compaction, multi-tenant isolation, and how repair or rebalancing avoids disrupting analytical workloads.
`,
    },
    {
      company: "Snowflake",
      angleMD: `
Snowflake may focus on metadata correctness, separation of compute and storage, tenant isolation, and failure recovery. Discuss when a highly available KV store is appropriate for serving metadata and when stronger transactional guarantees are required.
`,
    },
    {
      company: "LinkedIn",
      angleMD: `
LinkedIn can push on large-scale serving systems, member data, activity metadata, and operational reliability. Expect questions about hot keys from celebrity accounts, backfills, online rebalancing, and observability for massive fleets.
`,
    },
    {
      company: "Google",
      angleMD: `
Google interviewers may compare this with Bigtable, Spanner, or internal distributed storage systems. Be clear about why this design chooses availability and tunable consistency rather than global consensus for every write.
`,
    },
  ],
  relatedQuestions: [
    {
      slug: "distributed-cache",
      note: "Hot-key mitigation and low-latency serving often add cache layers on top of the KV store.",
    },
    {
      slug: "multi-region-database",
      note: "Extends the same replication and consistency questions across geographic regions.",
    },
    {
      slug: "consensus",
      note: "Useful contrast for designs that need stronger ordering or leader election instead of tunable eventual consistency.",
    },
    {
      slug: "distributed-transaction",
      note: "Explains why cross-key atomicity is expensive and usually avoided in a Dynamo-style KV store.",
    },
  ],
  interviewTips: {
    commonMistakes: [
      "Treating the system like a single hash map and skipping partitioning, replication, and repair.",
      "Claiming R + W > N gives full strong consistency without discussing concurrent writes and failure modes.",
      "Ignoring tombstones, compaction, and read amplification in an LSM storage engine.",
      "Using last-write-wins without acknowledging clock skew and lost updates.",
      "Forgetting hot partitions and assuming hashing balances traffic as well as data size.",
      "Skipping operational workflows for node join, drain, repair, and replacement.",
    ],
    redFlags: [
      "No clear replica placement strategy across failure domains.",
      "No conflict resolution story for writes accepted during partitions.",
      "No anti-entropy mechanism for cold data that is never read.",
      "No capacity math for petabytes, replicas, compaction headroom, or node count.",
      "No backpressure plan for compaction, repair, or streaming overload.",
    ],
    expectations: [
      "Start with the API, then immediately define partitioning by consistent hashing and virtual nodes.",
      "Explain N, R, and W with concrete quorum examples and tradeoffs.",
      "Describe the write path through WAL, memtable, SSTable flush, and compaction.",
      "Cover hinted handoff, read repair, and Merkle-tree anti-entropy as separate mechanisms.",
      "Discuss conflict resolution options and when LWW is acceptable.",
      "Call out hot keys, rebalancing, monitoring, and failure-domain-aware placement.",
    ],
    communicationMD: `
Frame the design around the main tension: the product wants always-on writes and petabyte-scale throughput, but that means accepting eventual consistency and repair complexity. Draw the ring and replica set first, then explain a write, a read, and a failure. Use N = 3 with R = 2 and W = 2 as the concrete baseline, then vary consistency levels to show tradeoffs.
`,
  },
  revisionNotesMD: `
- A distributed key-value store maps each key to a token using a hash function, then uses a consistent hash ring to find the replica preference list.
- Virtual nodes split ownership into many small ranges, improving balance and making node join, leave, and heterogeneous capacity easier.
- Replication factor N stores each item on N replicas across failure domains. R and W are read and write quorum sizes.
- R + W > N gives overlapping read and write quorums, but it is not the same as serializable transactions.
- Writes append to a WAL, update a memtable, and later flush to SSTables. Compaction merges SSTables, removes old versions, and purges safe tombstones.
- Bloom filters and indexes reduce read amplification by skipping SSTables that cannot contain the key.
- Vector clocks detect causal ordering and concurrent siblings. Last-write-wins is simpler but can silently lose updates.
- Hinted handoff replays missed writes after short outages. Read repair fixes stale replicas discovered by reads. Merkle-tree anti-entropy repairs cold ranges in the background.
- Hot keys require special handling because hash partitioning balances key distribution, not request distribution.
- At 5 PB logical data, replication factor 3, and LSM headroom, plan for roughly 25 to 30 PB physical capacity and thousands of storage nodes.
`,
  flashcards: [
    {
      front: "What does consistent hashing provide?",
      back: "It maps keys to token ranges so adding or removing nodes moves only a bounded subset of data instead of reshuffling the entire keyspace.",
    },
    {
      front: "Why use virtual nodes?",
      back: "They smooth data distribution, support heterogeneous node capacity, and make rebalancing happen in smaller streaming units.",
    },
    {
      front: "What does R + W > N mean?",
      back: "The read and write quorums overlap on at least one replica, improving the chance that a read sees the latest acknowledged write.",
    },
    {
      front: "Why is last-write-wins risky?",
      back: "It can discard a valid concurrent update when timestamps race or clocks skew.",
    },
    {
      front: "What is hinted handoff?",
      back: "A healthy node stores a missed mutation for a temporarily unavailable replica and replays it when that replica recovers.",
    },
    {
      front: "What do Merkle trees do in repair?",
      back: "They summarize token ranges so replicas can find mismatched subranges without comparing every key.",
    },
    {
      front: "Why does an LSM engine need a WAL?",
      back: "The WAL makes acknowledged writes durable before the in-memory memtable is flushed to SSTables.",
    },
    {
      front: "What are Bloom filters used for?",
      back: "They tell the read path which SSTables definitely do not contain a key, reducing unnecessary disk reads.",
    },
    {
      front: "Why retain delete tombstones?",
      back: "They prevent stale replicas from resurrecting deleted values during repair until every replica has had time to learn the delete.",
    },
    {
      front: "Why can a hot key still overload the cluster?",
      back: "Hashing spreads keys, not traffic. One popular key can overload its replica set even when total data is balanced.",
    },
  ],
  quiz: [
    {
      question: "In a Dynamo-style store with N = 3, which R and W combination gives overlapping quorums?",
      options: ["R = 1 and W = 1", "R = 1 and W = 2", "R = 2 and W = 2", "R = 0 and W = 3"],
      answerIndex: 2,
      explanationMD: `
R + W must be greater than N. With N = 3, R = 2 and W = 2 gives 4, so the successful read and write quorums overlap.
`,
    },
    {
      question: "What is the main benefit of virtual nodes?",
      options: ["They remove the need for replication", "They make range ownership and rebalancing more fine-grained", "They guarantee serializable transactions", "They store values only in memory"],
      answerIndex: 1,
      explanationMD: `
Virtual nodes split the ring into many small ranges per physical node. This improves balance and makes joins, leaves, and capacity differences easier to manage.
`,
    },
    {
      question: "Which component makes acknowledged writes durable before an SSTable flush?",
      options: ["Bloom filter", "WAL", "Merkle tree", "Gossip heartbeat"],
      answerIndex: 1,
      explanationMD: `
The WAL is append-only durable storage for recent mutations. If the process crashes before the memtable flushes, the node replays the WAL.
`,
    },
    {
      question: "What does a vector clock help detect?",
      options: ["Disk fullness", "Concurrent versions of a value", "The fastest load balancer", "The number of virtual nodes per server"],
      answerIndex: 1,
      explanationMD: `
Vector clocks encode causal history. If neither version dominates the other, the writes are concurrent and may need merging.
`,
    },
    {
      question: "Why is Merkle-tree anti-entropy useful?",
      options: ["It compresses all values for reads", "It finds divergent replica ranges without comparing every key", "It replaces the need for a WAL", "It prevents every hot key"],
      answerIndex: 1,
      explanationMD: `
Merkle trees summarize ranges with hashes. Replicas compare roots and subtrees to find only the ranges that differ, then stream repairs.
`,
    },
    {
      question: "What is the risk of purging tombstones too early?",
      options: ["Bloom filters become too accurate", "Deleted values can be resurrected by stale replicas", "Writes become strongly consistent", "The ring loses all virtual nodes"],
      answerIndex: 1,
      explanationMD: `
If a stale replica still has the old value and the tombstone disappears before repair, anti-entropy can copy the old value back to healthy replicas.
`,
    },
    {
      question: "Which issue is not solved by consistent hashing alone?",
      options: ["Mapping keys to partitions", "Moving fewer ranges when nodes join", "A single key receiving massive traffic", "Distributing stored bytes across many nodes"],
      answerIndex: 2,
      explanationMD: `
Consistent hashing spreads keys and bytes statistically. It cannot split one extremely popular key across many replica sets without additional application or storage-layer techniques.
`,
    },
    {
      question: "When is last-write-wins a reasonable policy?",
      options: ["When losing concurrent updates is unacceptable", "For cache-like or idempotent state where timestamp-based overwrite is acceptable", "For all payment ledger updates", "Only when replication factor is zero"],
      answerIndex: 1,
      explanationMD: `
Last-write-wins is simple and sometimes acceptable for cache-like data. It is risky for data where every concurrent update must be preserved.
`,
    },
  ],
  cheatSheetMD: `
**Goal**: store opaque values by key at petabyte scale with high write throughput, low latency, high availability, and tunable consistency.

**Partitioning**: hash each key to a token. Use consistent hashing so node changes move limited ranges. Use virtual nodes so physical nodes own many small ranges and rebalancing is smoother.

**Replication**: store each item on N replicas across failure domains. With N = 3, quorum often means R = 2 and W = 2. Use lower consistency for lower latency and higher availability when stale reads are acceptable.

**Write path**: coordinator finds replicas, sends mutation, replicas append to WAL, update memtable, acknowledge, then later flush SSTables. Success depends on W acknowledgements.

**Read path**: coordinator asks R replicas, compares versions or digests, returns latest non-conflicting value or siblings, and may trigger read repair for stale replicas.

**Consistency**: eventual consistency is the default availability tradeoff. Vector clocks detect concurrent writes. Last-write-wins is simple but can lose updates.

**Repair**: hinted handoff covers short outages. Read repair fixes hot stale keys. Merkle-tree anti-entropy compares ranges and repairs cold data.

**Storage engine**: LSM tree with WAL, memtable, SSTables, compaction, Bloom filters, sparse indexes, tombstones, and checksums.

**Scaling**: watch hot ranges, compaction debt, repair age, disk fullness, gossip convergence, p99 quorum latency, and tenant-level throttling.

**Do not overpromise**: this design is not a general SQL database, not a global serializable transaction system, and not ideal for ad hoc secondary-index queries.
`,
  references: [
    {
      title: "Dynamo: Amazon's Highly Available Key-value Store",
      kind: "Paper",
      url: "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf",
      author: "Giuseppe DeCandia and others",
    },
    {
      title: "Cassandra: A Decentralized Structured Storage System",
      kind: "Paper",
      url: "https://www.cs.cornell.edu/projects/ladis2009/papers/lakshman-ladis2009.pdf",
      author: "Avinash Lakshman and Prashant Malik",
    },
    {
      title: "Designing Data-Intensive Applications",
      kind: "Book",
      author: "Martin Kleppmann",
    },
    {
      title: "Bigtable: A Distributed Storage System for Structured Data",
      kind: "Paper",
      url: "https://research.google/pubs/bigtable-a-distributed-storage-system-for-structured-data/",
      author: "Fay Chang and others",
    },
    {
      title: "Apache Cassandra Documentation",
      kind: "Docs",
      url: "https://cassandra.apache.org/doc/latest/",
      author: "Apache Cassandra Project",
    },
  ],
};
