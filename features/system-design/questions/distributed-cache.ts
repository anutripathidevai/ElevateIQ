import type { SDQuestionContent } from "../types";

export const distributedCacheContent: SDQuestionContent = {
  slug: "distributed-cache",
  statementMD: `Design a horizontally scalable, in-memory distributed cache similar to Redis Cluster, Memcached, or a managed cache such as ElastiCache. The cache must provide very low latency reads and writes for opaque key-value data while scaling beyond the memory and network limits of a single machine.

The core challenge is not just storing key-value pairs in RAM. A strong answer explains sharding, consistent hashing, replication, eviction, TTL expiration, cache invalidation, hot-key handling, and failover without turning the cache into a second primary database.

Assume application services use this cache for hot reads, session data, counters, feature flags, and expensive derived objects. The system should remain simple for clients: ask for a key, get a value or a miss, and let the cache layer hide routing, node membership, and replica health whenever possible.`,
  businessUseCaseMD: `A distributed cache reduces database load and improves perceived product latency. A product page, news feed, profile service, search ranking feature store, or session lookup can often tolerate slightly stale data but not a database round trip on every request.

Common business uses include accelerating read-heavy APIs, storing web sessions, keeping rate-limit counters, caching ML feature vectors, protecting databases during traffic spikes, and serving hot metadata near application servers. The business value is lower infrastructure cost, higher throughput, and a smoother user experience during peak demand.`,
  functionalRequirements: [
    "Support get, put, and delete operations by opaque string or binary key.",
    "Store opaque values with optional metadata such as TTL, version, and size.",
    "Expire keys automatically after their TTL and support explicit invalidation.",
    "Evict entries when a node reaches its memory limit using configurable policies such as LRU, LFU, TTL-aware, or random.",
    "Scale horizontally by adding and removing cache nodes with limited key remapping.",
    "Provide high availability through per-shard replicas and automatic failover.",
    "Offer configurable consistency and write policies, including cache-aside, write-through, write-around, and write-back.",
    "Expose cluster membership and health so clients can route requests without a central data-plane proxy."
  ],
  nonFunctionalRequirements: [
    {
      label: "Latency",
      detailMD: "Target sub-millisecond median latency inside one region and low single-digit millisecond P99 including client routing, serialization, and one network hop. Avoid cross-region cache hits on the critical path."
    },
    {
      label: "Throughput",
      detailMD: "A well-sized node should handle 100K+ simple operations per second for small values. Cluster throughput should grow near-linearly until limited by network, hot keys, or backing-store misses."
    },
    {
      label: "Hit ratio",
      detailMD: "Optimize for high hit ratio on hot data rather than caching everything. Track hit rate by endpoint, keyspace, shard, and value size because a global average can hide bad product paths."
    },
    {
      label: "Availability",
      detailMD: "Cache availability should be higher than the backing database for read-heavy paths. A node failure should cause partial misses or replica failover, not global cache outage."
    },
    {
      label: "Consistency",
      detailMD: "Eventual consistency is acceptable for most cached objects. For sessions, authorization, and counters, use stricter routing to primary, short TTLs, version checks, or avoid caching the critical decision."
    },
    {
      label: "Memory efficiency",
      detailMD: "Budget for allocator fragmentation, key overhead, metadata, replication buffers, and eviction structures. Raw value bytes are often only 60 to 75 percent of resident memory."
    },
    {
      label: "Operability",
      detailMD: "The cluster must support rolling upgrades, safe resharding, visibility into evictions and misses, and clear runbooks for failover and cache warmup."
    }
  ],
  capacityEstimation: {
    assumptionsMD: `Assume the primary database contains 10 TB of logical data, but product traffic is skewed: about 20 percent of the dataset accounts for most reads. Average cached value size is 2 KB including serialized payload. Keys and metadata add roughly 20 percent overhead, and allocator fragmentation plus eviction structures add another 15 percent.

Assume peak demand is 5 million reads per second and 250 thousand writes or invalidations per second across the service. Each cache node has 64 GB RAM, but only 48 GB is treated as safe usable cache capacity after reserving memory for the OS, replication backlog, buffers, and headroom. Each primary shard has one replica in the same region.`,
    metrics: [
      {
        label: "Logical hot data",
        value: "2 TB",
        note: "20 percent of a 10 TB backing dataset"
      },
      {
        label: "Effective primary memory",
        value: "2.7 TB",
        note: "2 TB values plus metadata and fragmentation overhead"
      },
      {
        label: "Primary shards",
        value: "57 nodes",
        note: "2.7 TB divided by 48 GB usable memory per node, rounded up with headroom"
      },
      {
        label: "Replicated cluster size",
        value: "114 cache nodes",
        note: "One replica per primary doubles memory footprint"
      },
      {
        label: "Peak read throughput",
        value: "5M reads per second",
        note: "At 100K ops per node, throughput needs about 50 nodes, so memory is the sizing driver"
      },
      {
        label: "Peak write and invalidation throughput",
        value: "250K ops per second",
        note: "Write fanout to replicas and invalidation messages must be budgeted separately"
      }
    ],
    calculationsMD: `Hot data target: 10 TB x 20 percent = 2 TB of value bytes.

Memory overhead: 2 TB x 1.35 = 2.7 TB effective primary memory after key metadata, per-entry bookkeeping, allocator fragmentation, and eviction structures.

Usable node memory: 64 GB physical RAM minus OS, buffers, replication backlog, and safety headroom leaves about 48 GB. Primary shard count is 2.7 TB divided by 48 GB = 56.25, so choose 57 primaries or round to 64 for operational simplicity.

Replication: one same-region replica per shard makes the resident footprint about 5.4 TB and the fleet about 114 nodes. If two replicas are required for critical sessions, multiply the primary fleet by 3.

Throughput check: 5M reads per second divided by 100K reads per second per node = 50 serving nodes. Since the memory estimate already needs 57 primaries, the design is memory-bound. Add replicas can serve reads when consistency allows, raising read capacity while increasing write replication cost.`,
  },
  apiDesign: {
    endpoints: [
      {
        method: "GET",
        path: "/cache/{key}",
        descriptionMD: "Return the value for a key if present and not expired. A missing, expired, or evicted key is a cache miss, not an application error.",
        response: `{
  "key": "user:123",
  "value": "opaque bytes or application payload",
  "ttlSecondsRemaining": 298,
  "version": 42
}`,
        statusCodes: [
          {
            code: 200,
            meaning: "Cache hit"
          },
          {
            code: 404,
            meaning: "Cache miss or expired key"
          },
          {
            code: 503,
            meaning: "No healthy owner for the shard"
          }
        ]
      },
      {
        method: "PUT",
        path: "/cache/{key}",
        descriptionMD: "Store or overwrite a value with an optional TTL and optional consistency preference. The router sends the write to the current primary owner for the key.",
        request: `{
  "value": "opaque bytes or application payload",
  "ttlSeconds": 300,
  "consistency": "primary",
  "versionPrecondition": 41
}`,
        response: `{
  "stored": true,
  "version": 42,
  "expiresAt": "2026-07-26T01:16:28Z"
}`,
        statusCodes: [
          {
            code: 200,
            meaning: "Value stored or updated"
          },
          {
            code: 400,
            meaning: "Invalid key, value too large, or invalid TTL"
          },
          {
            code: 409,
            meaning: "Version precondition failed"
          },
          {
            code: 503,
            meaning: "Primary shard unavailable"
          }
        ]
      },
      {
        method: "DELETE",
        path: "/cache/{key}",
        descriptionMD: "Invalidate a key explicitly. Deletes should be idempotent and propagated to replicas before or shortly after acknowledgement depending on the configured policy.",
        response: `{
  "deleted": true,
  "version": 43
}`,
        statusCodes: [
          {
            code: 200,
            meaning: "Key existed and was deleted"
          },
          {
            code: 204,
            meaning: "Delete accepted and key is absent"
          },
          {
            code: 503,
            meaning: "Shard unavailable"
          }
        ]
      }
    ],
    notesMD: `REST endpoints are a teaching facade. Production caches usually expose a compact binary or text protocol over persistent TCP connections, such as RESP for Redis or the Memcached protocol, to avoid HTTP overhead and support pipelining.

The client library is part of the API. It owns connection pooling, timeouts, retries with budgets, key hashing, topology refresh, serialization, compression thresholds, and fallback behavior on cache miss.`,
  },
  databaseDesign: {
    schemaMD: `A distributed cache is itself a key-value store, not a relational database. Conceptually, each node holds an in-memory hash map from key to cache entry. The entry points to value bytes and metadata, and for LRU it is also linked into an intrusive doubly linked list so moving an accessed item to the head is O(1).

Expiration can be checked lazily on access and actively by background sampling. Eviction chooses victims from policy-specific metadata. Persistence is optional and should not be confused with the system of record; the backing database remains authoritative unless the design explicitly chooses write-back caching.`,
    tables: [
      {
        name: "cache_entry",
        columns: [
          {
            name: "key",
            type: "string or bytes",
            note: "Opaque binary-safe key, usually namespaced by product or tenant"
          },
          {
            name: "value",
            type: "bytes",
            note: "Serialized opaque payload, often capped at 1 MB or less"
          },
          {
            name: "expires_at",
            type: "timestamp nullable",
            note: "Absolute expiration time derived from TTL"
          },
          {
            name: "last_accessed",
            type: "timestamp",
            note: "Updated on hits for LRU or approximate recency tracking"
          },
          {
            name: "frequency_counter",
            type: "integer",
            note: "Approximate LFU score or sampled access count"
          },
          {
            name: "size_bytes",
            type: "integer",
            note: "Resident memory charged to this entry including value and selected overhead"
          },
          {
            name: "version",
            type: "integer",
            note: "Monotonic value used for compare-and-set, stale replication suppression, and invalidation ordering"
          },
          {
            name: "lru_prev_next",
            type: "pointers",
            note: "Intrusive linked-list pointers when exact LRU is enabled"
          }
        ]
      }
    ],
    indexesMD: "The primary index is the node-local hash table keyed by the exact cache key. For TTL cleanup, nodes may maintain a min-heap, timing wheel, or sampled expiration dictionary. For LRU, the linked list is not an index but an O(1) ordering structure. For LFU, use compact counters with decay so old popularity does not dominate forever.",
    relationshipsMD: "Keys are independent. The only relationship is operational ownership: a key maps through the consistent-hash ring to a primary shard and one or more replica shards. Multi-key operations are difficult because keys may live on different shards, so they should be avoided or constrained with hash tags when necessary.",
    noSqlAlternativesMD: `This design is a specialized NoSQL key-value store. Redis provides richer data structures, optional durability with snapshots or append-only files, scripting, streams, pub-sub, and Redis Cluster hash slots. It is excellent when the application benefits from server-side data structures but can be more complex to operate at very high memory density.

Memcached is intentionally simpler: opaque values, TTL, approximate LRU, no built-in persistence, and a multithreaded architecture optimized for high-throughput ephemeral caching. It is a strong fit when the cache is purely a performance layer and the database is always authoritative.`,
  },
  architecture: {
    width: 940,
    height: 540,
    nodes: [
      {
        id: "app-servers",
        label: "App Servers",
        kind: "service",
        x: 95,
        y: 120,
        sublabel: "API workers"
      },
      {
        id: "cache-client",
        label: "Cache Client Library",
        kind: "service",
        x: 290,
        y: 120,
        sublabel: "hash router"
      },
      {
        id: "config-service",
        label: "Cluster Config",
        kind: "external",
        x: 290,
        y: 305,
        sublabel: "membership"
      },
      {
        id: "shard-a-primary",
        label: "Shard A Primary",
        kind: "cache",
        x: 495,
        y: 80,
        sublabel: "hash range"
      },
      {
        id: "shard-a-replica",
        label: "Shard A Replica",
        kind: "cache",
        x: 690,
        y: 80,
        sublabel: "async copy"
      },
      {
        id: "shard-b-primary",
        label: "Shard B Primary",
        kind: "cache",
        x: 495,
        y: 200,
        sublabel: "hash range"
      },
      {
        id: "shard-b-replica",
        label: "Shard B Replica",
        kind: "cache",
        x: 690,
        y: 200,
        sublabel: "async copy"
      },
      {
        id: "shard-c-primary",
        label: "Shard C Primary",
        kind: "cache",
        x: 495,
        y: 320,
        sublabel: "hash range"
      },
      {
        id: "shard-c-replica",
        label: "Shard C Replica",
        kind: "cache",
        x: 690,
        y: 320,
        sublabel: "async copy"
      },
      {
        id: "backing-db",
        label: "Backing Database",
        kind: "database",
        x: 690,
        y: 450,
        sublabel: "source of truth"
      },
      {
        id: "observability",
        label: "Observability",
        kind: "monitoring",
        x: 855,
        y: 200,
        sublabel: "metrics and alerts"
      }
    ],
    edges: [
      {
        from: "app-servers",
        to: "cache-client",
        label: "SDK call"
      },
      {
        from: "cache-client",
        to: "config-service",
        label: "membership"
      },
      {
        from: "config-service",
        to: "cache-client",
        label: "ring updates",
        dashed: true
      },
      {
        from: "cache-client",
        to: "shard-a-primary",
        label: "route key"
      },
      {
        from: "cache-client",
        to: "shard-b-primary",
        label: "route key"
      },
      {
        from: "cache-client",
        to: "shard-c-primary",
        label: "route key"
      },
      {
        from: "shard-a-primary",
        to: "shard-a-replica",
        label: "replicate",
        dashed: true
      },
      {
        from: "shard-b-primary",
        to: "shard-b-replica",
        label: "replicate",
        dashed: true
      },
      {
        from: "shard-c-primary",
        to: "shard-c-replica",
        label: "replicate",
        dashed: true
      },
      {
        from: "cache-client",
        to: "backing-db",
        label: "miss read-through"
      },
      {
        from: "shard-a-primary",
        to: "observability",
        label: "metrics",
        dashed: true
      },
      {
        from: "shard-b-primary",
        to: "observability",
        label: "metrics",
        dashed: true
      },
      {
        from: "shard-c-primary",
        to: "observability",
        label: "metrics",
        dashed: true
      }
    ],
    captionMD: "Client libraries route keys directly to shard primaries using a consistent-hash ring. Each primary asynchronously replicates to a follower. The backing database is touched only on misses or write-through paths, and the configuration service is control plane rather than data plane.",
  },
  architectureNotesMD: `Keep the data plane short: application server to cache client to the owning cache node. A central proxy can simplify clients, but it often becomes a latency and throughput bottleneck; client-side routing is the usual interview answer for high scale.

The cluster configuration service does not serve cache values. It stores membership, shard ownership, replica placement, and epochs. Clients cache this configuration and refresh it on errors, topology updates, or a periodic lease.`,
  requestFlow: [
    {
      title: "Read: route the key",
      detailMD: "The application calls the cache client with a namespaced key. The client hashes the key, finds the nearest virtual node or slot owner in the current ring, and selects the primary or an eligible read replica based on the consistency setting."
    },
    {
      title: "Read: serve a local hit",
      detailMD: "The cache node looks up the key in its hash map, checks the expiration timestamp, updates recency or frequency metadata, and returns the value. The backing database is not contacted on a hit."
    },
    {
      title: "Read: handle a miss",
      detailMD: "If the key is absent, expired, or evicted, the cache returns a miss. In cache-aside mode the application fetches from the backing database. In read-through mode the cache layer fetches through a controlled backing-store adapter."
    },
    {
      title: "Read: populate safely",
      detailMD: "The fetched value is written back with a TTL, size check, and version. The node may reject oversized values or evict victims first. TTL jitter is applied to avoid many related keys expiring at the same instant."
    },
    {
      title: "Write: choose the policy",
      detailMD: "For cache-aside, the application writes the database then deletes or updates the cache. For write-through, the cache synchronously writes the database before acknowledging. For write-back, the cache acknowledges first and flushes later, which is faster but riskier."
    },
    {
      title: "Replicate and acknowledge",
      detailMD: "The primary appends the mutation to a replication stream with a version or epoch. Most caches acknowledge after the primary applies the write and asynchronously replicate; stricter modes wait for at least one replica."
    },
    {
      title: "Observe and adapt",
      detailMD: "Metrics for hits, misses, evictions, replication lag, stale reads, hot keys, and per-shard memory are emitted continuously. The control plane uses these signals for alerts, resharding, and capacity planning."
    }
  ],
  coreComponents: [
    {
      name: "Consistent-hash router",
      kind: "service",
      role: "Maps each key to its current primary and replica set.",
      detailMD: "The router lives in the client library or a thin proxy. It maintains the hash ring, connection pools, retry budgets, timeout settings, and topology epoch. Correctness depends on refreshing membership quickly without flooding the config service."
    },
    {
      name: "Cache node",
      kind: "cache",
      role: "Stores key-value entries in RAM and executes get, put, delete, TTL, and eviction logic.",
      detailMD: "A node is optimized for predictable memory usage and simple operations. Internally it combines a hash map, value arena or allocator, expiration metadata, eviction structures, request parser, and replication stream."
    },
    {
      name: "Eviction and expiration engine",
      kind: "worker",
      role: "Keeps memory below configured limits while preserving high-value entries.",
      detailMD: "The engine removes expired keys, samples candidates, maintains LRU or LFU metadata, and enforces max memory. Its job is to make room without creating latency spikes on foreground requests."
    },
    {
      name: "Replication manager",
      kind: "service",
      role: "Copies mutations from each primary shard to its replicas.",
      detailMD: "Replication is usually asynchronous to preserve latency. The manager tracks offsets, lag, epochs, and conflict suppression so a promoted replica does not accept stale writes from an old primary."
    },
    {
      name: "Cluster membership service",
      kind: "external",
      role: "Stores shard ownership, node health, placement, and ring versions.",
      detailMD: "This can be built with a consensus-backed store or a managed control plane. It should be highly available, but it is not on the value-serving path for every request."
    },
    {
      name: "Backing-store adapter",
      kind: "database",
      role: "Fetches source-of-truth data on misses and persists write-through mutations.",
      detailMD: "The adapter must apply backpressure, request coalescing, and circuit breakers. Without those protections, a cache outage can become a database outage within seconds."
    },
    {
      name: "Observability and admin plane",
      kind: "monitoring",
      role: "Provides metrics, logs, tracing, keyspace diagnostics, and safe administrative actions.",
      detailMD: "Operators need per-shard hit ratio, memory usage, evictions by policy, expired keys, network saturation, big-key reports, hot-key reports, replica lag, and slow-command samples."
    }
  ],
  deepDives: [
    {
      topic: "Consistent hashing with virtual nodes",
      detailMD: `Naive sharding with hash(key) modulo N looks simple, but changing N remaps most keys. If 10 nodes become 11, almost every key changes modulo result, causing a massive cold-cache event and database spike.

Consistent hashing places both keys and nodes on a circular hash space. A key belongs to the first node clockwise from the key hash. Adding a new physical node claims only the ranges between its virtual-node positions and their previous owners, so roughly 1 divided by N plus 1 keys move. Removing a node moves only its ranges to neighboring owners.

Virtual nodes improve balance. Instead of one point per machine, each physical node owns many positions on the ring, such as 100 to 1000. This smooths random hash variance, supports weighted capacity by assigning larger machines more virtual nodes, and makes rebalancing more granular.

In interviews, call out the operational detail: clients must include a ring version or epoch. During resharding, the cluster may temporarily serve both old and new owners, proxy moved keys, or use dual reads. The goal is to minimize moved bytes and avoid simultaneous cache misses for the entire fleet.`
    },
    {
      topic: "Eviction policies in depth",
      detailMD: `Eviction decides what to remove when memory is full. Exact LRU uses a hash map for O(1) key lookup and a doubly linked list ordered by recency. On every hit, move the entry to the head. On eviction, remove from the tail. This is easy to explain and works well when recently used items are likely to be used again.

LFU tracks frequency and protects repeatedly accessed items from scans that would evict hot data under LRU. It needs decay, otherwise an item popular last week can live forever. Production LFU is often approximate because exact counters for every access are expensive and can add contention.

TTL eviction removes expired entries first and is mandatory for freshness. Random eviction is simple and surprisingly acceptable for some workloads, but it wastes memory under skewed traffic. Size-aware eviction is useful when large values can crowd out many small hot entries.

Redis-style approximate LRU samples a small number of keys and evicts the least recently used among the sample rather than maintaining a perfectly ordered global list. Approximation reduces per-access overhead and lock contention while delivering nearly the same hit ratio for many workloads.

The best answer ties policy to workload: sessions often use TTL plus noeviction or controlled eviction, product objects use TTL plus LRU, recommendation features often use LFU, and negative cache entries need short TTLs to avoid hiding newly created data.`
    },
    {
      topic: "Cache invalidation and write policies",
      detailMD: `Cache invalidation is hard because the cache and database are separate systems. Cache-aside is the most common pattern: read cache first, load from database on miss, populate cache, and on write update the database then delete or update the cache. It is simple and keeps the database authoritative, but stale reads can happen between database write and cache invalidation.

Write-through sends writes through the cache layer, which updates the backing store before acknowledging. This improves cache freshness and simplifies reads, but it increases write latency and couples cache availability to write availability.

Write-back or write-behind acknowledges once the cache accepts the write, then asynchronously flushes to the database. It is fast and can batch writes, but losing the cache node before flush risks data loss unless there is a durable write-ahead log. This is usually inappropriate for ordinary ephemeral caches unless explicitly designed as a buffered storage layer.

Write-around writes directly to the database and does not populate the cache. It avoids polluting cache with rarely read data, but the first subsequent read misses. This is good for bulk imports or write-heavy objects with low immediate read probability.

A senior answer mentions ordering. Use versions or update timestamps so a delayed invalidation cannot delete a newer value. For high-risk keys, prefer delete-on-write plus short TTL over update-in-place because the next read reloads from the source of truth.`
    },
    {
      topic: "Replication, failover, and consistency",
      detailMD: `Each shard has a primary that accepts writes and one or more replicas that receive a mutation stream. Asynchronous replication keeps write latency low, but replicas can lag. If clients read from replicas, they may see stale values or miss recently written values.

Failover promotes a replica when the primary is unhealthy. The control plane must fence the old primary with epochs so split brain does not create divergent values. Clients refresh topology and route writes to the promoted primary. Some misses are expected while the fleet converges.

For consistency, expose a small set of modes rather than pretending all reads are strongly consistent. Primary reads are fresher but concentrate traffic. Replica reads improve availability and throughput but are eventual. Quorum writes and reads can improve consistency but usually add too much latency and complexity for a cache.

Replication is also a capacity tool. Hot read keys can be served from multiple replicas, or deliberately copied to all nodes in a local region. The tradeoff is more memory usage and harder invalidation. Do this only for keys proven to be hot and small.`
    },
    {
      topic: "Hot keys and thundering herd",
      detailMD: `A hot key is a single key receiving disproportionate traffic. Even with perfect shard balance, that key maps to one shard and can saturate CPU, NIC, or lock paths. Mitigations include read replicas, local in-process caching, splitting counters into subkeys, and explicitly broadcasting tiny hot objects to multiple nodes.

Thundering herd happens when many requests miss the same key at once, often after TTL expiry or node restart. Request coalescing lets only one request fetch from the database while the rest wait or serve stale data. This is one of the highest-value cache protections in real systems.

Use TTL jitter so related keys do not expire simultaneously. For example, a nominal 10 minute TTL can be randomized between 8 and 12 minutes. For very hot keys, refresh asynchronously before expiry and allow stale-while-revalidate so users keep getting a slightly old value while one worker refreshes.

Protect the database with miss budgets, per-key locks, circuit breakers, and fallback behavior. A cache should fail soft; it should not multiply database traffic during an outage.`
    },
    {
      topic: "Cache penetration and avalanche protection",
      detailMD: `Cache penetration is repeated requests for keys that do not exist in the database. Without protection, every request misses the cache and hits the database. Negative caching stores a short-lived marker for not found results, reducing repeated database work while limiting the risk of hiding newly created records.

Bloom filters can reject impossible keys before the database lookup when the keyspace is well-defined. They trade small false positives for no false negatives. This works well for product ids, user ids, or content ids loaded from a known catalog.

Cache avalanche is a large synchronized drop in hit ratio, often caused by many expirations, a bad deployment flushing key prefixes, or a shard failure. Use staggered TTLs, warmup jobs, admission control, per-service miss limits, and progressive rollouts for invalidation jobs.

Also protect against oversized or unbounded keys. A few huge values can cause eviction churn and network spikes. Enforce maximum key length, maximum value size, compression only above a threshold, and separate pools for workloads with very different value sizes.`
    }
  ],
  scaling: [
    {
      stage: "Single-node cache",
      detailMD: "Start with one Redis or Memcached node beside the application. Use TTLs, clear key naming, basic metrics, and cache-aside reads. This is simple but limited by one machine's memory, CPU, and network."
    },
    {
      stage: "Client-side sharding",
      detailMD: "Add multiple nodes and route keys with consistent hashing or fixed hash slots. The client library owns the ring and connection pools. This increases memory and throughput while avoiding a central proxy bottleneck."
    },
    {
      stage: "Replicas and automated failover",
      detailMD: "Pair each primary with replicas, store topology in a coordination service, and promote replicas on primary failure. Reads can optionally go to replicas, and resharding moves only selected hash ranges."
    },
    {
      stage: "Workload isolation and hot-key controls",
      detailMD: "Split critical sessions, counters, large objects, and general object cache into separate clusters or memory pools. Add request coalescing, stale-while-revalidate, hot-key replication, and admission policies to protect hit ratio."
    },
    {
      stage: "Multi-region cache",
      detailMD: "Run independent regional caches close to application traffic. Do not make every cache operation cross-region. Use regional invalidation streams, short TTLs, or active-active data ownership depending on the backing database and freshness requirements."
    }
  ],
  bottlenecks: [
    {
      issue: "Hot shard or hot key",
      optimizationMD: "A single key or tenant can overload one shard even when average distribution looks balanced. Detect hot keys, add local near-cache, serve from replicas, shard counters into multiple subkeys, or deliberately duplicate small hot values across nodes."
    },
    {
      issue: "Large values and big keys",
      optimizationMD: "Large payloads consume memory, increase network latency, and create eviction churn. Enforce maximum value size, compress selectively, cache derived summaries rather than full objects, and move blobs to object storage with only metadata cached."
    },
    {
      issue: "Network and serialization overhead",
      optimizationMD: "At cache latencies, serialization and network syscalls can dominate. Use persistent connections, pipelining, batching for safe operations, compact binary formats, careful timeout budgets, and avoid unnecessary JSON conversion for internal traffic."
    },
    {
      issue: "Eviction churn and memory fragmentation",
      optimizationMD: "If the working set barely fits, the cache may constantly evict and reload the same keys. Add memory, improve admission policy, isolate workloads, tune allocator settings, and track evictions per keyspace rather than only globally."
    },
    {
      issue: "Miss storm against the database",
      optimizationMD: "A node restart or bulk invalidation can suddenly expose the backing database to traffic it cannot handle. Use request coalescing, warmup, stale serving, negative caching, miss rate limits, and circuit breakers."
    },
    {
      issue: "Rebalancing bandwidth",
      optimizationMD: "Moving hash ranges copies many bytes and competes with foreground traffic. Rebalance gradually, cap migration bandwidth, prioritize hot keys, and let some data refill lazily instead of moving every cold entry."
    }
  ],
  failureHandling: [
    {
      scenario: "Primary cache node fails",
      strategyMD: "Health checks mark the primary unavailable, the control plane promotes a replica with a higher epoch, and clients refresh topology. During convergence, requests either retry the new owner, read a replica, or fall back to database with a strict miss budget."
    },
    {
      scenario: "Replica falls behind",
      strategyMD: "Track replication lag and remove stale replicas from read pools when lag exceeds the freshness budget. Rebuild from a snapshot or primary stream. For strict reads, route to primary until lag recovers."
    },
    {
      scenario: "Cold cache after restart or scaling event",
      strategyMD: "Expect hit ratio to drop. Warm critical keys from logs or recent access streams, use lazy fill for the long tail, apply TTL jitter, and throttle database refill traffic so warmup does not become an outage."
    },
    {
      scenario: "Coordination service partition",
      strategyMD: "Existing clients continue using their cached ring for a short lease. Writes require a valid topology epoch. If membership is uncertain, prefer availability for noncritical reads but fence primaries before accepting writes after recovery."
    },
    {
      scenario: "Backing database unavailable during misses",
      strategyMD: "Serve stale cached values when allowed, coalesce requests, fail fast for noncritical paths, and shed load. Do not allow every miss to queue indefinitely because that consumes threads and worsens recovery."
    },
    {
      scenario: "Bad invalidation or flush command",
      strategyMD: "Restrict destructive commands, require scoped key prefixes, use staged rollouts, emit audit logs, and keep an emergency feature flag to disable broad invalidations from application code."
    }
  ],
  security: [
    {
      label: "Network isolation",
      detailMD: "Place cache nodes on private networks or service meshes reachable only by approved application services. Never expose a cache protocol directly to the public internet."
    },
    {
      label: "Authentication and authorization",
      detailMD: "Use client authentication, ACLs, and per-service credentials. Separate administrative commands from ordinary get and put operations so app bugs cannot flush entire clusters."
    },
    {
      label: "Encryption",
      detailMD: "Use TLS for cache traffic when crossing hosts or shared networks, and encrypt snapshots or persistence files if enabled. Evaluate the latency cost but do not skip encryption for sensitive data."
    },
    {
      label: "Tenant and keyspace isolation",
      detailMD: "Namespace keys by product, tenant, and environment. Apply quotas so one tenant or service cannot evict another service's hot data."
    },
    {
      label: "Critical data handling",
      detailMD: "Do not treat cache as the only copy of critical data unless write-back durability is explicitly designed. Avoid caching secrets, or store only short-lived encrypted tokens with strict TTLs."
    },
    {
      label: "Abuse controls",
      detailMD: "Reject oversized keys and values, cap connection counts, rate-limit expensive commands, and monitor key scans or administrative operations that can degrade the cluster."
    }
  ],
  tradeoffs: {
    pros: [
      "Dramatically reduces database read load for hot objects.",
      "Provides very low latency for frequently accessed data.",
      "Scales memory and throughput horizontally with additional nodes.",
      "Can absorb traffic spikes when hit ratio remains high.",
      "Allows product teams to choose freshness and write policies per keyspace."
    ],
    cons: [
      "Introduces cache invalidation and stale-read complexity.",
      "Consumes significant memory and operational budget due to replication overhead.",
      "Can amplify outages if misses overwhelm the backing database.",
      "Multi-key operations and strong consistency are difficult under sharding.",
      "Hot keys can break the assumption of uniform hashing."
    ],
    alternativesMD: "Use an in-process cache for ultra-low latency small working sets, but it duplicates memory per application instance and is hard to invalidate globally. Use a CDN for static or edge-cacheable content. Use database read replicas or materialized views when freshness and query semantics matter more than sub-millisecond key-value access. Use a full key-value store when durability and range operations are required.",
    whenNotToUseMD: "Do not use a distributed cache as a bandage for unbounded queries, missing database indexes, or data that must be strongly consistent on every read. Avoid it when the working set is too large and too uniform to produce a meaningful hit ratio, or when the operational team cannot safely handle failover, eviction, and invalidation.",
  },
  followUpQuestions: [
    {
      question: "Why is consistent hashing better than hash modulo N for sharding?",
      answerMD: "Modulo sharding remaps most keys when N changes, causing a large cold-cache event. Consistent hashing remaps only the ranges owned by the added or removed node, roughly 1 divided by N plus 1 of keys on node addition, and virtual nodes make distribution smoother."
    },
    {
      question: "When would you choose write-through over write-back?",
      answerMD: "Choose write-through when correctness and database durability matter more than write latency. The cache updates the backing store before acknowledging, so a cache node loss does not lose accepted writes. Write-back is useful only when you can tolerate delayed persistence or have a durable log and replay mechanism."
    },
    {
      question: "How do you handle a hot key that overwhelms one shard?",
      answerMD: "First prove it with per-key metrics. Then use local in-process caching, serve from replicas, broadcast the hot value to multiple nodes, split mutable counters into subkeys, refresh asynchronously, and avoid making every request acquire the same per-key lock."
    },
    {
      question: "How do you keep cache and database consistent?",
      answerMD: "Use a clear write policy. The common answer is cache-aside with database write first, then cache delete or versioned update. Add TTL as a safety net, use version timestamps to avoid out-of-order invalidations, and route critical reads to the database or primary cache when stale data is unacceptable."
    },
    {
      question: "What happens when a cache node fails?",
      answerMD: "The control plane removes it from membership, promotes a replica if available, and clients refresh their ring. Some keys may miss or be temporarily stale. The system should throttle database fallback and gradually warm the replacement node."
    },
    {
      question: "How do you prevent cache stampede on popular keys?",
      answerMD: "Use request coalescing so one worker refills the key, stale-while-revalidate for acceptable objects, TTL jitter to avoid synchronized expiry, and miss budgets to protect the database. For extremely hot keys, refresh before expiry."
    },
    {
      question: "Should replicas serve reads?",
      answerMD: "They can improve throughput and availability, but they may be stale under asynchronous replication. Serve reads from replicas for tolerant keyspaces, track lag, and route strict reads to the primary or database."
    }
  ],
  companyVariations: [
    {
      company: "Amazon",
      angleMD: "Amazon interviewers often connect this problem to ElastiCache, DynamoDB Accelerator, and service isolation. Expect questions about cache-aside with DynamoDB, consistent hashing, multi-AZ failover, and how to prevent a regional cache event from overwhelming the source database."
    },
    {
      company: "Meta",
      angleMD: "Meta-style discussions emphasize memcache at massive fanout, TAO-like social graph reads, regional pools, invalidation pipelines, and protecting databases from miss storms. Be ready to explain leases, thundering herd prevention, and why simple Memcached semantics scale well."
    },
    {
      company: "Netflix",
      angleMD: "Netflix commonly frames this as EVCache: regional clusters, high availability, zone-aware replication, client-side routing, and graceful degradation during dependency failures. Multi-region read locality and operational metrics matter as much as the data structure."
    },
    {
      company: "Microsoft",
      angleMD: "Microsoft and Azure discussions often map to Azure Cache for Redis, session caching, enterprise security, private networking, persistence options, and SLA-driven failover. Expect follow-ups about tenant isolation, managed control planes, and Redis Cluster behavior."
    }
  ],
  relatedQuestions: [
    {
      slug: "key-value-store",
      note: "A distributed cache is a mostly ephemeral key-value store optimized for memory and latency."
    },
    {
      slug: "rate-limiter",
      note: "Rate limiters often use distributed caches for counters, token buckets, and TTL-based windows."
    },
    {
      slug: "distributed-lock",
      note: "Locking on Redis-like systems raises consistency, expiry, and failover questions."
    },
    {
      slug: "multi-region-database",
      note: "Multi-region cache invalidation depends heavily on database ownership and replication semantics."
    },
    {
      slug: "url-shortener",
      note: "URL shorteners benefit from caching hot short-code lookups and negative misses."
    }
  ],
  interviewTips: {
    commonMistakes: [
      "Treating the cache as a database without discussing durability and consistency.",
      "Using hash modulo N and ignoring the rebalancing blast radius.",
      "Forgetting TTL, eviction, and memory overhead in capacity estimates.",
      "Ignoring hot keys and assuming uniform hashing solves all imbalance.",
      "Failing to protect the backing database during cache outages or cold starts."
    ],
    redFlags: [
      "Claims strong consistency while using asynchronous replication and replica reads.",
      "No plan for node failure, replica promotion, or stale topology.",
      "No metrics for hit ratio, evictions, lag, and hot keys.",
      "Allows unlimited value sizes or public network access to cache nodes.",
      "Says just clear the cache as an invalidation strategy."
    ],
    expectations: [
      "Start with cache-aside and evolve to sharding, replication, and control-plane membership.",
      "Explain O(1) LRU using a hash map plus doubly linked list, then mention approximations.",
      "Quantify memory, throughput, replication overhead, and database fallback risk.",
      "Discuss consistency as a per-keyspace choice rather than a single global property.",
      "Name concrete protections for stampede, penetration, avalanche, and hot keys."
    ],
    communicationMD: `Lead with the workload: hot read-heavy keys, acceptable staleness, and database protection. Draw the client library and consistent-hash ring before drawing many boxes. Keep repeating that the backing database is the source of truth unless write-back durability is explicitly added.

When challenged, make tradeoffs explicit. Say which keyspaces use short TTLs, which can read replicas, which must read primary or database, and how the system behaves during failure. Interviewers reward operational realism more than listing cache buzzwords.`,
  },
  revisionNotesMD: `- Cache-aside is the default pattern: read cache, load database on miss, populate cache, invalidate on writes.
- Consistent hashing with virtual nodes minimizes key movement and smooths load when nodes change.
- Exact LRU is hash map plus doubly linked list; production systems often use approximate LRU or LFU to reduce overhead.
- TTL is both a freshness tool and a safety net, but synchronized TTLs can cause avalanches.
- Replicas improve availability and read scale, but asynchronous replication means stale reads are possible.
- Protect the database with request coalescing, negative caching, miss budgets, and stale-while-revalidate.
- Capacity is usually memory-bound after metadata, fragmentation, headroom, and replication overhead.`,
  flashcards: [
    {
      front: "What problem does consistent hashing solve in a cache cluster?",
      back: "It minimizes key remapping when nodes are added or removed, avoiding a massive cold-cache event."
    },
    {
      front: "How is exact LRU implemented in O(1)?",
      back: "Use a hash map for key lookup and a doubly linked list ordered by recency; move hits to the head and evict from the tail."
    },
    {
      front: "Why add virtual nodes to a hash ring?",
      back: "They smooth load distribution, enable weighted capacity, and make rebalancing more granular."
    },
    {
      front: "What is cache-aside?",
      back: "The application reads cache first, loads from the database on miss, populates the cache, and invalidates or updates cache after database writes."
    },
    {
      front: "What is cache stampede?",
      back: "Many requests miss or expire the same key at once and all hit the database unless coalesced or served stale."
    },
    {
      front: "Why can replica reads be stale?",
      back: "Most cache replication is asynchronous, so followers may lag behind the primary after writes or deletes."
    },
    {
      front: "What is negative caching?",
      back: "Caching a short-lived not found result to prevent repeated database lookups for nonexistent keys."
    },
    {
      front: "Why should value size be capped?",
      back: "Large values increase memory pressure, network latency, and eviction churn, hurting hit ratio for many smaller hot keys."
    }
  ],
  quiz: [
    {
      question: "Why is consistent hashing preferred over hash modulo N when cache nodes change?",
      options: [
        "It makes every read strongly consistent",
        "It remaps only a small fraction of keys on node add or removal",
        "It removes the need for replicas",
        "It guarantees no hot keys"
      ],
      answerIndex: 1,
      explanationMD: "Consistent hashing limits movement to the ranges owned by changed nodes. Modulo sharding changes the divisor and remaps most keys."
    },
    {
      question: "Which data structures implement exact LRU with O(1) get and update?",
      options: [
        "Sorted array and binary search",
        "Hash map and doubly linked list",
        "Bloom filter and queue",
        "B-tree and heap"
      ],
      answerIndex: 1,
      explanationMD: "The hash map finds entries by key, and the doubly linked list maintains recency so hits move to the head and eviction removes from the tail."
    },
    {
      question: "What is the safest default write pattern when the database is the source of truth?",
      options: [
        "Write-back with no durable log",
        "Cache-aside with database write followed by cache delete or versioned update",
        "Always write only to the cache",
        "Flush the entire cluster after every write"
      ],
      answerIndex: 1,
      explanationMD: "Cache-aside keeps durability in the database and uses invalidation plus TTL to limit stale cache entries."
    },
    {
      question: "Which technique best mitigates many requests missing the same hot key after expiry?",
      options: [
        "Request coalescing",
        "Hash modulo N",
        "Increasing key length",
        "Disabling metrics"
      ],
      answerIndex: 0,
      explanationMD: "Request coalescing allows one fetch to refill the key while other requests wait briefly or receive stale data."
    },
    {
      question: "Why is asynchronous replication common in cache clusters?",
      options: [
        "It eliminates stale reads",
        "It keeps write latency low while still providing failover copies",
        "It makes the backing database unnecessary",
        "It avoids all memory overhead"
      ],
      answerIndex: 1,
      explanationMD: "Waiting for every replica increases latency. Async replication is a pragmatic availability tradeoff, with staleness handled by policy."
    },
    {
      question: "What protects against repeated lookups for nonexistent keys?",
      options: [
        "Negative caching with a short TTL",
        "More virtual nodes",
        "Larger TCP packets",
        "Longer value serialization"
      ],
      answerIndex: 0,
      explanationMD: "A short-lived not found marker prevents repeated database hits while allowing newly created data to appear soon."
    },
    {
      question: "If raw hot values require 2 TB and each node safely stores 48 GB, what is the minimum primary count before overhead?",
      options: [
        "12",
        "21",
        "43",
        "96"
      ],
      answerIndex: 2,
      explanationMD: "2 TB is about 2048 GB. 2048 divided by 48 is about 42.7, so at least 43 primary nodes are needed before overhead and replication."
    }
  ],
  cheatSheetMD: `Design moves: cache-aside first, client-side consistent hashing, per-shard primaries, async replicas, TTL plus eviction, and database protection on misses.

Key algorithms: consistent hashing with virtual nodes for limited remapping; hash map plus doubly linked list for exact LRU; approximate LRU or LFU for lower overhead; TTL sampling for expiration.

Sizing: estimate hot working set, add metadata and fragmentation overhead, divide by usable RAM per node, then multiply by replica count. Check throughput separately; memory often dominates.

Failure posture: cache misses are allowed, database overload is not. Use request coalescing, stale-while-revalidate, negative caching, TTL jitter, miss budgets, and warmup.

Tradeoff sentence: a distributed cache buys latency and database relief by accepting extra memory cost, operational complexity, and usually eventual consistency.`,
  references: [
    {
      title: "Amazon DynamoDB: A Scalable, Predictably Performant, and Fully Managed NoSQL Database Service",
      kind: "Paper",
      url: "https://www.usenix.org/system/files/atc22-elhemali.pdf",
      author: "Elhemali et al."
    },
    {
      title: "Dynamo: Amazon's Highly Available Key-value Store",
      kind: "Paper",
      url: "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf",
      author: "DeCandia et al."
    },
    {
      title: "Scaling Memcache at Facebook",
      kind: "Paper",
      url: "https://www.usenix.org/system/files/conference/nsdi13/nsdi13-final170_update.pdf",
      author: "Nishtala et al."
    },
    {
      title: "Redis Cluster Specification",
      kind: "Docs",
      url: "https://redis.io/docs/latest/operate/oss_and_stack/reference/cluster-spec/",
      author: "Redis"
    },
    {
      title: "Memcached Documentation",
      kind: "Docs",
      url: "https://docs.memcached.org/",
      author: "Memcached"
    },
    {
      title: "Amazon ElastiCache Documentation",
      kind: "Docs",
      url: "https://docs.aws.amazon.com/elasticache/",
      author: "Amazon Web Services"
    }
  ],
};
