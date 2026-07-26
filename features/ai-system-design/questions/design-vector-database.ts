import type { AISDLessonContent } from "../types";

export const designVectorDatabaseContent: AISDLessonContent = {
  slug: "design-vector-database",
  introductionMD: `A vector database stores embeddings and returns the nearest vectors to a query embedding in milliseconds. In interviews, this is the flagship vector-search design problem because it sits at the intersection of algorithms, distributed systems, storage engines, and AI product quality.

The hard part is not accepting vectors. The hard part is serving approximate nearest neighbor search over billions of 768 or 1536 dimensional embeddings while supporting fresh writes, metadata filters, multi-tenant isolation, persistence, and predictable tail latency. A production system must balance recall@10, p99 latency, RAM cost, SSD cost, ingestion throughput, and operational recovery time.

A strong design starts with the workload. A RAG corpus might have 2 billion document chunks, topK 20, p99 under 100 ms, and recall@10 above 0.95 for unfiltered queries. A recommendation system might search 20 billion item vectors with fresher writes and tolerate recall@100 around 0.90. These numbers determine whether HNSW in RAM, IVF-PQ compression, DiskANN on SSD, or a hybrid tiered layout is the right core index.`,
  realWorldMD: `Vector databases appear anywhere a product needs semantic retrieval rather than exact keyword matching.

- RAG systems retrieve document chunks for grounded LLM answers.
- AI coding assistants retrieve similar files, symbols, diffs, and historical fixes.
- Recommendation systems retrieve candidate items or users from embedding spaces.
- Semantic caches reuse LLM responses for similar prompts with correctness guards.
- Trust and safety systems find near-duplicate abuse, spam, or policy violations.
- Image, audio, and multimodal search products retrieve embeddings across media types.
- Enterprise search combines metadata filters such as tenant, ACL, time, language, and product area with semantic relevance.
- Feature stores and model platforms use vector search for online candidate generation and offline evaluation.`,
  learningObjectives: [
    "Estimate memory, storage, and latency budgets for billions of 768 and 1536 dimensional vectors.",
    "Explain when to choose HNSW, IVF-PQ, or DiskANN and how efSearch, M, nlist, nprobe, and PQ code size affect recall and cost.",
    "Design an ingestion path that handles embedding generation, validation, partitioning, write ahead logs, tombstones, and asynchronous index visibility.",
    "Shard and replicate a vector database so scatter-gather queries hit many shards and still return a globally merged topK quickly.",
    "Support metadata and filtered vector search without destroying recall or scanning the full corpus.",
    "Persist index segments and recover shards from object storage with bounded data loss and rebuild time.",
    "Use quantization and tiered memory versus disk layouts to control RAM spend while preserving enough recall for RAG and recommendations.",
    "Describe the production metrics and interview tradeoffs that distinguish a toy ANN demo from a real vector database."
  ],
  theory: [
    {
      label: "Embedding storage is a cost problem before it is an algorithm problem",
      detailMD: `A 1536 dimensional FP32 embedding uses 6144 bytes before any ID, metadata, graph edge, allocator, or replication overhead. One billion such vectors is about 6.1 TB of raw vector bytes. Ten billion is about 61 TB. Moving to FP16 cuts that in half, scalar INT8 cuts it to about one quarter, and product quantization can cut it to 64 to 128 bytes per vector for 1536 dimensions.

This is why interviewers expect capacity math. If the answer says simply use HNSW, it misses the fleet size. HNSW can be excellent for recall and latency, but it normally wants vectors and graph links in memory. IVF-PQ and DiskANN exist because the RAM bill of exact-ish in-memory search at billion scale is enormous.`,
    },
    {
      label: "ANN search trades recall for latency and memory",
      detailMD: `Approximate nearest neighbor indexes avoid comparing the query to every vector. HNSW builds a navigable small-world graph and performs greedy search with a candidate queue. IVF partitions vectors into coarse clusters and searches only selected inverted lists. PQ compresses vectors into compact codes and compares approximate distances first, often rescoring a small candidate set with higher precision vectors.

The tuning knobs are the interview vocabulary. HNSW uses M for graph degree, efConstruction for build quality, and efSearch for query breadth. IVF uses nlist for the number of coarse clusters and nprobe for the number searched per query. PQ uses the number of sub-vectors and bits per code. Higher knobs increase recall and usually increase latency, RAM, or build time.`,
    },
    {
      label: "Fresh writes and high recall pull the system in opposite directions",
      detailMD: `Production vector databases need upserts, deletes, re-embeddings, and metadata updates while queries continue. HNSW supports online insertion, but deletes often become tombstones until compaction. IVF-PQ usually benefits from batch training and segment rebuilds because centroids and codebooks should match the embedding distribution.

A practical design separates the write path from the serving path. New vectors go through validation, embedding generation if needed, a durable log, partition routing, and a mutable delta index. Background compaction merges deltas into immutable optimized segments. The query path searches both optimized segments and recent deltas, then merges and filters results.`,
    },
    {
      label: "Sharding turns one ANN problem into a distributed topK problem",
      detailMD: `At billion scale, no single shard should own the full corpus. The coordinator receives a query vector and metadata filter, chooses candidate shards, scatters the ANN request, gathers per-shard topK or topK times oversampling factor candidates, and performs a global merge by distance.

Random or hash sharding balances writes and data size, but almost every query must touch every shard unless routing metadata can prune. Semantic sharding by cluster can reduce fanout, but it creates skew, hot partitions, and recall risks at cluster boundaries. In interviews, hash sharding plus scatter-gather is the default correct answer, with optional routing indexes for specialized workloads.`,
    },
    {
      label: "Filtered vector search is not just SQL plus ANN",
      detailMD: `Metadata filters such as tenant, ACL, language, timestamp, product, and document type are mandatory in enterprise RAG. The challenge is preserving recall when the predicate is selective. If the ANN index retrieves top 100 globally and the filter accepts only 1 percent, most candidates vanish and the final answer may be empty.

Good systems combine per-shard filter bitsets, pre-filtered candidate restriction when the filter is selective, post-filtering when it is broad, and adaptive oversampling. Some systems maintain separate indexes for high-cardinality tenants or route by namespace so security filters are never accidental post-processing.`,
    },
    {
      label: "Persistence is a first-class part of the index design",
      detailMD: `An ANN index is expensive to build. Losing a shard and rebuilding billions of vectors from a primary database can take hours or days. Durable systems write an ordered log of mutations, periodically publish immutable segment files and index snapshots to object storage, and store manifests that describe exactly which segments form the committed shard state.

Recovery should be boring. A replacement shard downloads the latest manifest, maps or loads segment files, replays logs after the snapshot point, warms caches, joins as a replica, and only then receives production traffic. The design should state the recovery point objective, recovery time objective, and what happens to writes during failover.`,
    }
  ],
  architecture: {
    width: 960,
    height: 560,
    nodes: [
      {
        id: "clientSdk",
        label: "Client SDK",
        kind: "client",
        x: 40,
        y: 210,
        sublabel: "query and upsert"
      },
      {
        id: "apiGateway",
        label: "API Gateway",
        kind: "gateway",
        x: 165,
        y: 210,
        sublabel: "auth, quotas, schema"
      },
      {
        id: "queryRouter",
        label: "Coordinator",
        kind: "service",
        x: 315,
        y: 205,
        sublabel: "query router"
      },
      {
        id: "mergeAggregator",
        label: "Merge Aggregator",
        kind: "service",
        x: 640,
        y: 205,
        sublabel: "global topK"
      },
      {
        id: "shardA",
        label: "Index Shard A",
        kind: "database",
        x: 480,
        y: 70,
        sublabel: "HNSW shard"
      },
      {
        id: "shardB",
        label: "Index Shard B",
        kind: "database",
        x: 480,
        y: 160,
        sublabel: "HNSW shard"
      },
      {
        id: "shardC",
        label: "Index Shard C",
        kind: "database",
        x: 480,
        y: 250,
        sublabel: "HNSW shard"
      },
      {
        id: "shardD",
        label: "Index Shard D",
        kind: "database",
        x: 480,
        y: 340,
        sublabel: "HNSW shard"
      },
      {
        id: "metadataStore",
        label: "Metadata Store",
        kind: "database",
        x: 780,
        y: 115,
        sublabel: "filters and ACLs"
      },
      {
        id: "objectStorage",
        label: "Object Storage",
        kind: "storage",
        x: 790,
        y: 315,
        sublabel: "snapshots and logs"
      },
      {
        id: "embeddingService",
        label: "Embedding Service",
        kind: "service",
        x: 315,
        y: 65,
        sublabel: "optional encoder"
      },
      {
        id: "ingestWorkers",
        label: "Ingestion Workers",
        kind: "worker",
        x: 165,
        y: 380,
        sublabel: "batch and streaming"
      },
      {
        id: "monitoring",
        label: "Monitoring",
        kind: "monitoring",
        x: 790,
        y: 455,
        sublabel: "recall, p99, drift"
      }
    ],
    edges: [
      {
        from: "clientSdk",
        to: "apiGateway",
        label: "search, upsert, delete"
      },
      {
        from: "apiGateway",
        to: "queryRouter",
        label: "authorized request"
      },
      {
        from: "queryRouter",
        to: "embeddingService",
        label: "embed text query",
        dashed: true
      },
      {
        from: "embeddingService",
        to: "queryRouter",
        label: "query vector"
      },
      {
        from: "queryRouter",
        to: "metadataStore",
        label: "filter plan"
      },
      {
        from: "queryRouter",
        to: "shardA",
        label: "scatter ANN"
      },
      {
        from: "queryRouter",
        to: "shardB",
        label: "scatter ANN"
      },
      {
        from: "queryRouter",
        to: "shardC",
        label: "scatter ANN"
      },
      {
        from: "queryRouter",
        to: "shardD",
        label: "scatter ANN"
      },
      {
        from: "shardA",
        to: "mergeAggregator",
        label: "local topK"
      },
      {
        from: "shardB",
        to: "mergeAggregator",
        label: "local topK"
      },
      {
        from: "shardC",
        to: "mergeAggregator",
        label: "local topK"
      },
      {
        from: "shardD",
        to: "mergeAggregator",
        label: "local topK"
      },
      {
        from: "mergeAggregator",
        to: "metadataStore",
        label: "hydrate payloads"
      },
      {
        from: "mergeAggregator",
        to: "apiGateway",
        label: "merged results"
      },
      {
        from: "ingestWorkers",
        to: "embeddingService",
        label: "document encoding",
        dashed: true
      },
      {
        from: "ingestWorkers",
        to: "queryRouter",
        label: "batched upserts"
      },
      {
        from: "ingestWorkers",
        to: "metadataStore",
        label: "metadata writes"
      },
      {
        from: "shardA",
        to: "objectStorage",
        label: "segment snapshots"
      },
      {
        from: "apiGateway",
        to: "monitoring",
        label: "traces and SLOs"
      }
    ],
    captionMD: `The coordinator performs scatter-gather ANN search across multiple HNSW shards, while ingestion workers build durable vector and metadata state. The object storage edge represents all shard snapshots and mutation logs, not only shard A.`
  },
  architectureNotesMD: `The API gateway is not just a load balancer. It enforces tenant authentication, namespace authorization, rate limits, request size limits, and schema validation for vectors, filters, and topK. This matters because vector databases often sit behind RAG systems that carry sensitive enterprise documents.

The coordinator owns the distributed query plan. It converts text to a vector when the caller did not provide one, validates the embedding model version, asks the metadata store or local catalog which shards are relevant, and scatters the request to shard replicas. Each shard returns more than topK candidates because the global merge and metadata filters can drop results.

The index shards are shown as HNSW shards because that is the common interview baseline for high-recall in-memory ANN. In a cost-optimized implementation, some shards may use IVF-PQ or DiskANN, but the same query router, merge, metadata, persistence, and monitoring responsibilities remain.

The metadata store is logically separate from the vector index, but high-performance filters are usually pushed into each shard as local bitsets or columnar sidecars. The central store holds authoritative metadata, ACLs, manifests, and catalog state. The object store holds immutable segment files, snapshots, quantizer codebooks, and write logs needed for recovery.`,
  requestFlow: [
    {
      step: "1. Accept and normalize the request",
      detailMD: `The client sends either a query vector or raw text plus topK, namespace, filters, and consistency preferences. The gateway validates vector dimensionality such as 768 or 1536, embedding model version, tenant authorization, maximum topK, and filter syntax before forwarding to the coordinator.`
    },
    {
      step: "2. Embed text when needed",
      detailMD: `If the request contains raw text, the coordinator calls the embedding service. The embedding model must match the index family. Mixing embeddings from different models or different normalization policies silently destroys distance quality, so the query includes an embedding_model_version and distance metric such as cosine or dot product.`
    },
    {
      step: "3. Build a shard and filter plan",
      detailMD: `The coordinator decides which shards and replicas to query. For hash-sharded collections it usually fans out to every primary or read replica. For tenant-partitioned or time-partitioned collections, metadata can prune shards. The filter is converted into local bitmap ids, timestamp ranges, or columnar predicates that shards can apply during ANN search.`
    },
    {
      step: "4. Scatter ANN search to shard replicas",
      detailMD: `Each selected shard runs ANN with per-request tuning. An HNSW shard might use efSearch 80 for normal traffic and 200 for high-recall offline evaluation. An IVF-PQ shard might search nprobe 32 out of nlist 65536 coarse lists. Shards return candidate ids, approximate distances, optional exact distances, and lightweight payload fields.`
    },
    {
      step: "5. Merge candidates globally",
      detailMD: `The merge aggregator combines local heaps from all shards into a global topK. It deduplicates ids, handles deleted tombstones, rescales distances if shards used compatible metrics, and may exact-rescore the top 100 to 1000 candidates with FP16 or FP32 vectors when the serving index used compressed codes.`
    },
    {
      step: "6. Hydrate metadata and enforce final authorization",
      detailMD: `The aggregator fetches payloads, ACL fields, source document ids, and freshness metadata. Authorization is enforced again after merge because a stale shard-local filter bitmap should never leak a result. If too many candidates are filtered out, the coordinator can retry with a higher oversampling factor or broader efSearch within a latency budget.`
    },
    {
      step: "7. Return ranked results and diagnostics",
      detailMD: `The response includes ids, scores, payloads, and optional diagnostics such as shards searched, candidates scanned, approximate versus exact score, and index version. Product APIs often hide these details, but operational headers help debug low recall, slow tenants, and filter selectivity problems.`
    },
    {
      step: "8. Ingest and make writes visible asynchronously",
      detailMD: `Writes follow a separate path. Ingestion workers validate ids, generate embeddings when needed, write durable logs, update metadata, route vectors to owning shards, and insert them into a mutable delta index. Acknowledgement can mean durable but not searchable, or durable and visible after the delta index confirms insertion. The SLA should state the expected indexing lag, often seconds for streaming RAG and minutes for large backfills.`
    }
  ],
  deepDives: [
    {
      label: "Capacity estimate for a flagship billion-vector service",
      detailMD: `Assume 3 billion document chunk embeddings, 1536 dimensions, cosine similarity, topK 20, p99 query latency under 80 ms, and recall@10 at least 0.95 for unfiltered queries. FP32 vectors alone are 3B x 1536 x 4 bytes, about 18.4 TB. FP16 cuts that to 9.2 TB. Add HNSW graph links, ids, tombstones, metadata sidecars, allocator overhead, and 30 percent headroom, and a replicated in-memory design can easily exceed 25 to 40 TB of RAM before replicas.

If each serving node safely uses 384 GB RAM for vectors and index state, 40 TB needs about 105 primary nodes. With one replica per shard, that is about 210 nodes. This may be acceptable for a premium low-latency product, but it is expensive. IVF-PQ with 96 byte codes for 1536 dimensions compresses vector payload by 64x versus FP32, which can reduce primary vector storage to about 288 GB plus codebooks, coarse lists, ids, and metadata. The cost is lower recall or a rescore stage.

Interview takeaway: the right answer is workload-dependent. For a million-vector internal tool, HNSW in RAM is obvious. For 10 billion vectors, the candidate must discuss compression, disk, tiering, and recall tradeoffs.`
    },
    {
      label: "HNSW versus IVF-PQ in system terms",
      detailMD: `HNSW is a graph index. It usually gives excellent recall at low latency, supports online inserts, and is conceptually easy to explain. The downside is memory: the vector payload plus graph links must be hot, and deletes leave tombstones until compaction. HNSW also has slower build cost when efConstruction is high.

IVF-PQ is a partitioned compressed index. The index trains coarse centroids, assigns vectors to inverted lists, and stores compact product-quantized codes. Query latency depends on how many lists are probed and how many codes are scanned. It can search billions of vectors with far less RAM, but recall depends heavily on training data, nprobe, code size, and whether exact rescoring is available.

In interviews, position HNSW as the high-recall, high-RAM serving tier and IVF-PQ as the cost-efficient billion-scale tier. Many real systems combine them: HNSW for fresh deltas and hot tenants, IVF-PQ or DiskANN for large historical segments, then exact rescore before returning results.`
    },
    {
      label: "Write path and index visibility",
      detailMD: `The write API should be idempotent by vector id and version. A vector upsert includes id, embedding or raw content, metadata, namespace, model version, and optional timestamp. The gateway rejects the wrong dimension and the coordinator routes the write to the owner shard based on namespace and id hash.

Each shard appends the mutation to a local durable log and a replicated log or object-store log before acknowledging durability. It then inserts the vector into a mutable delta structure. For HNSW this can be a small online HNSW graph. For IVF-PQ it can be an uncompressed flat buffer or small HNSW delta, because retraining a PQ codebook per write is not realistic.

Background compaction turns deltas into immutable segments. It applies tombstones, rewrites metadata bitsets, rebuilds graph or IVF structures, uploads segment files, publishes a manifest, and gradually swaps readers to the new segment set. Queries search both base and delta indexes until compaction catches up.`
    },
    {
      label: "Scatter-gather, replicas, and tail latency",
      detailMD: `Hash sharding balances storage and writes, but a semantic query normally has no idea which shard contains the nearest vectors. The coordinator therefore scatters to many shards and asks each for local topK times an oversampling factor, such as topK 20 with 100 candidates per shard. The aggregator then performs a global heap merge.

The p99 of a scatter-gather query is dominated by slow shards. If a query fans out to 64 shards, one overloaded shard can push the whole request over budget. Mitigations include shard replicas, hedged reads after a small delay, adaptive timeouts, partial result policies for non-critical use cases, and per-shard concurrency limits. The system should track p50, p95, and p99 per shard, not only global latency.

Replication has two roles. It protects availability when a shard fails, and it increases read capacity. Writes usually go to a primary and replicate asynchronously or semi-synchronously. Read-after-write consistency can be offered per id by routing to the primary or by waiting for a visibility watermark.`
    },
    {
      label: "Metadata and filtered search implementation",
      detailMD: `Filters fall into three groups. Namespace and tenant filters are security boundaries and should be part of partitioning or mandatory pre-filtering. Low-cardinality filters such as language, document type, or region can be represented as roaring bitmaps or compact bitsets per segment. Range filters such as time can use sorted columns or segment min and max statistics.

For broad filters, post-filtering is often cheapest because most candidates survive. For selective filters, pre-filtering is safer because global ANN candidates will mostly be rejected. The shard can intersect the search frontier with a filter bitset, use filtered HNSW variants, search a per-tenant sub-index, or increase efSearch and oversampling. IVF can skip inverted-list entries whose metadata bitmap does not match.

The coordinator should adapt. If the filter selectivity is 50 percent, topK 20 with per-shard 50 candidates may be enough. If selectivity is 0.1 percent, either route to a tenant-specific index or request thousands of candidates, which may blow the latency budget. This is why filtered vector search deserves its own design discussion.`
    },
    {
      label: "Memory, disk, and DiskANN-style indexes",
      detailMD: `Pure in-memory HNSW gives excellent speed but high cost. DiskANN-style systems store most vector and graph data on SSD while keeping a compact navigation structure, caches, and hot vectors in RAM. They rely on high-throughput NVMe, careful graph layout, beam search, and caching to keep random reads bounded.

A tiered design can keep hot tenant shards, recent deltas, and popular vectors in RAM, while cold historical segments live on SSD or object storage backed local disks. For RAG, this often works because many enterprise corpora have skewed access. For recommendations with aggressive latency targets, SSD may be too slow unless the first-stage candidate pool can tolerate lower recall or higher p99.

Disk is not free latency. A realistic DiskANN service might target p99 30 to 80 ms per query on NVMe for high recall, while in-memory HNSW might target 10 to 30 ms per shard under similar recall. The savings are often worth it at 10B vectors, but not always at 50M vectors.`
    },
    {
      label: "Quantization and exact rescoring",
      detailMD: `Quantization reduces memory and bandwidth by storing approximate representations. Scalar quantization converts FP32 or FP16 coordinates to INT8 or similar per-dimension scales. Product quantization splits a vector into sub-vectors and stores the nearest codeword id for each subspace. Optimized PQ rotates the vector space before quantization to reduce error.

The safest production pattern is two-stage retrieval. The compressed index returns 200 to 2000 candidates cheaply, then the system rescoring service computes exact or higher precision distances for the final topK using FP16 or FP32 vectors. This recovers much of the recall lost by compression while still reducing the memory needed for broad search.

Quantization must be evaluated per embedding model and per domain. A 768 dimensional model might tolerate 8-bit scalar quantization with less than 1 point recall@10 loss. A 1536 dimensional legal document corpus might need larger PQ codes or exact rescoring to avoid dropping rare but critical matches.`
    }
  ],
  productionConsiderations: [
    {
      label: "Observability must measure quality, not only uptime",
      detailMD: `Track query latency, fanout, shard error rate, candidate counts, filter selectivity, tombstone ratio, compaction lag, indexing lag, cache hit rate, and object-store recovery time. Also run continuous recall probes: keep a gold set of queries with brute-force or offline high-ef answers and compare production recall@10 and recall@100 by tenant and embedding model version.`
    },
    {
      label: "Backpressure and ingestion control",
      detailMD: `Embedding generation, index insertion, compaction, and snapshot upload are all expensive. The ingestion service needs queues, per-tenant quotas, retry budgets, dead-letter handling, and visible indexing lag. During a large backfill, protect query p99 by throttling compaction IO and keeping delta indexes bounded.`
    },
    {
      label: "Consistency and delete semantics",
      detailMD: `Many vector use cases tolerate eventual visibility for inserts, but deletes and ACL updates are security-sensitive. Store tombstones and ACL changes durably before acknowledging them, push them into shard-local filters quickly, and enforce final authorization during hydration. State clear SLAs such as deletes no longer returned after 5 seconds globally.`
    },
    {
      label: "Versioning of embeddings and indexes",
      detailMD: `A new embedding model creates a new vector space. Do not mix old and new embeddings in one similarity index unless an explicit alignment method exists. Use dual-write or backfill into a new collection, shadow queries against both, compare recall and product metrics, then cut traffic over by collection version.`
    },
    {
      label: "Cost controls",
      detailMD: `RAM, SSD, embedding model calls, and network fanout dominate cost. Use PQ or scalar quantization for cold corpora, replicas only where read QPS demands them, tiered storage for older segments, and adaptive topK or efSearch by product tier. Cache frequent query embeddings and metadata filter plans, but be careful caching final results when ACLs change.`
    },
    {
      label: "Failure recovery and safe operations",
      detailMD: `Every shard should have a manifest, snapshot, replay log, and checksum. Rebuilds should happen in the background and join as a replica before serving traffic. Rolling upgrades should keep index format compatibility. Compaction should be cancellable and resumable because it can run for hours on large segments.`
    },
    {
      label: "Security and tenant isolation",
      detailMD: `Treat vector ids and metadata as sensitive. Use namespace-level authorization, encryption at rest, audit logs for reads and writes, rate limits to prevent corpus scraping, and tenant-aware backups. For enterprise RAG, filtered search is a security feature, not just a relevance feature.`
    }
  ],
  interview: {
    whatInterviewersLookFor: [
      "Starts with capacity and SLOs such as vector count, dimensions, topK, recall@10, p99 latency, write rate, and filter selectivity.",
      "Chooses HNSW, IVF-PQ, or DiskANN with explicit tradeoffs rather than naming a vendor.",
      "Separates durable ingestion, mutable deltas, immutable segments, compaction, and query serving.",
      "Explains scatter-gather across shards, local topK, global merge, replicas, hedged reads, and tail latency.",
      "Handles metadata filters, ACLs, deletes, and embedding model versioning as core requirements.",
      "Discusses observability for recall and drift, not just CPU and memory."
    ],
    followUps: [
      {
        question: "How would you size a 1 billion vector corpus with 1536 dimensional embeddings?",
        answerMD: `FP32 vectors need about 6.1 TB before overhead. FP16 needs about 3.1 TB. HNSW adds graph links, ids, tombstones, allocator overhead, and headroom, so an in-memory primary footprint might be 5 to 9 TB depending on implementation and M. With one replica, double it.

If the budget cannot support that RAM, use scalar quantization, IVF-PQ, DiskANN, or a tiered design. For example, PQ with 96 byte codes stores the vector code payload in about 96 GB per billion vectors, but you still need ids, lists, metadata filters, codebooks, and often FP16 vectors for rescoring a candidate set.`
      },
      {
        question: "Why not keep one global HNSW graph across all nodes?",
        answerMD: `A single logical graph distributed across machines creates many remote pointer traversals during search. HNSW works well because graph traversal is fast and local. If every step requires network calls, p99 latency and failure modes get much worse.

The usual design shards the corpus and runs independent local indexes. The coordinator scatter-gathers to shards and globally merges candidates. This sacrifices some theoretical graph connectivity, but it is operationally simpler, scales horizontally, and avoids remote graph traversal on the critical path.`
      },
      {
        question: "How do you support highly selective metadata filters?",
        answerMD: `First classify the filter. Tenant and ACL filters should be pre-enforced through partitioning, local bitsets, and final authorization. For low-cardinality filters, maintain per-segment bitsets and intersect them during search. For range filters, use segment statistics and sorted sidecars.

If selectivity is very low, post-filtering global topK will fail. Use pre-filtered search, increase efSearch or nprobe, oversample heavily, maintain tenant-specific indexes for large tenants, or route to an exact scan when the filtered set is tiny. The coordinator should estimate selectivity and choose a plan.`
      },
      {
        question: "How do deletes work in HNSW?",
        answerMD: `Most production HNSW implementations mark deleted ids as tombstones and skip them during search. Removing nodes from the graph immediately can damage connectivity and is expensive. Tombstones are applied durably so deleted content is not returned, then background compaction rebuilds segments without deleted vectors.

The system must monitor tombstone ratio because too many deleted nodes hurt recall and latency. A common threshold is rebuilding a segment when tombstones exceed 10 to 30 percent or when query candidate rejection gets too high.`
      },
      {
        question: "When would you choose DiskANN?",
        answerMD: `Choose DiskANN-style indexing when the corpus is too large for economical RAM, the workload can tolerate SSD-level p99 latency, and the hardware has high-quality NVMe. It is compelling for multi-billion or 10B scale corpora where in-memory HNSW replicas would cost too much.

Avoid it for tiny corpora, ultra-low-latency recommendations, or workloads with heavy random writes unless there is a RAM delta index and background segment build path. DiskANN is a storage and caching design as much as an ANN algorithm.`
      },
      {
        question: "How do you roll out a new embedding model?",
        answerMD: `Create a new collection or index version. Dual-write new documents and backfill old documents using the new model. Shadow a sample of production queries against both old and new indexes, compare recall, click or answer metrics, latency, and failure cases, then gradually shift traffic.

Do not mix embeddings from unrelated models in one index. Similarity scores are not comparable across vector spaces, and nearest neighbors become meaningless without a learned alignment.`
      }
    ],
    alternativeDesigns: [
      {
        name: "High-recall in-memory HNSW tier",
        detailMD: `Use HNSW shards with vectors in RAM, one or more replicas per shard, online insert deltas, and background compaction. This is the strongest default for premium RAG over tens to hundreds of millions of vectors per collection, or for multi-tenant clusters where hot collections deserve high recall and low p99.

The tradeoff is cost. At billions of 1536 dimensional vectors, memory and replica overhead dominate. You need quantization, shard count discipline, and careful deletion compaction to keep the fleet sustainable.`
      },
      {
        name: "Compressed billion-scale IVF-PQ or DiskANN tier",
        detailMD: `Use IVF-PQ or DiskANN for large cold corpora, with a small HNSW or flat delta for fresh writes and exact rescoring for final candidates. This design reduces RAM dramatically and can scale to many billions of vectors, especially when p99 latency can be 50 to 150 ms.

The tradeoff is complexity and recall tuning. You must train codebooks, choose nlist and nprobe, manage SSD caches, evaluate quantization error, and make freshness visible through a delta path until segments are rebuilt.`
      }
    ],
    commonMistakes: [
      "Forgetting capacity math and claiming one HNSW index handles billions of 1536 dimensional FP32 vectors cheaply.",
      "Ignoring metadata filters and ACLs, then relying on post-filtering topK results after ANN search.",
      "Mixing embeddings from different model versions in the same vector space without a migration plan.",
      "Treating deletes as immediate graph removals instead of durable tombstones plus compaction.",
      "Not explaining scatter-gather merge and tail latency across many shards.",
      "Measuring only latency and uptime while ignoring recall@K, drift, and indexing lag."
    ]
  },
  interviewHints: [
    "Start by asking for vector count, dimensions, topK, recall target, p99 latency, write rate, and filter selectivity.",
    "Do the raw vector memory math before choosing an index.",
    "Use HNSW as the high-recall baseline, then explain why IVF-PQ or DiskANN may be needed at 10B scale.",
    "Separate the ingestion path from the query path with durable logs, mutable deltas, immutable segments, and compaction.",
    "For sharding, default to hash sharding plus scatter-gather and global merge, then optimize with routing only when metadata can prune safely.",
    "Treat metadata filters and ACLs as core query-planning inputs, not final cosmetic filtering."
  ],
  playground: {
    descriptionMD: `Use this static playground prompt to practice turning product requirements into an index and sharding plan. The goal is not to call a model, but to force explicit assumptions and tradeoffs.`,
    systemPrompt: `You are a staff engineer designing a vector database. Ask clarifying questions only if a requirement is missing, then propose a concrete architecture with capacity math, ANN index choice, sharding, filtering, persistence, and observability.`,
    userPrompt: `Design a vector database for 3 billion 1536 dimensional document embeddings. The service powers enterprise RAG with topK 20, tenant and ACL filters, 30 thousand QPS peak, 5 million upserts per hour during backfills, recall@10 at least 0.95, and p99 latency under 100 ms.`,
    parameters: [
      {
        name: "vector_count",
        value: "3B",
        note: "Primary sizing driver"
      },
      {
        name: "dimensions",
        value: "1536",
        note: "Common modern text embedding size"
      },
      {
        name: "topK",
        value: "20",
        note: "Final results returned to RAG"
      },
      {
        name: "recall_target",
        value: "recall@10 >= 0.95",
        note: "Quality SLO"
      },
      {
        name: "latency_target",
        value: "p99 < 100 ms",
        note: "End-to-end query budget"
      },
      {
        name: "filter_selectivity",
        value: "0.1 percent to 80 percent",
        note: "Drives filtered search strategy"
      }
    ],
    sampleOutputMD: `A strong answer would calculate that FP32 vectors alone need about 18.4 TB, so replicated in-memory HNSW likely needs tens of TB of RAM. It would propose HNSW for hot or fresh segments, IVF-PQ or DiskANN for the large base corpus, hash sharding with scatter-gather, per-shard filter bitsets, exact rescoring, durable segment snapshots, and recall probes against a brute-force evaluation set.`
  },
  comparisons: [
    {
      title: "HNSW vs IVF-PQ for billion-scale vector search",
      columns: ["Dimension", "HNSW", "IVF-PQ", "Interview implication"],
      rows: [
        ["Best fit", "High-recall low-latency serving for 10M to 500M vectors per collection or hot tier", "Compressed search for 1B to 10B plus vectors where RAM cost dominates", "Do not choose by popularity; choose by SLO and cost"],
        ["Memory for 1B x 1536", "FP16 vectors about 3.1 TB plus graph and overhead, often 5 to 9 TB primary", "96 byte PQ codes about 96 GB plus ids, lists, metadata, and optional rescore vectors", "PQ can be 30x to 60x smaller before replicas"],
        ["Recall@10 target", "0.95 to 0.99 with M 32 and efSearch 100 to 300 on many text corpora", "0.85 to 0.96 depending on nprobe, code size, OPQ, and exact rescore", "HNSW usually wins raw recall; IVF-PQ needs tuning and rescore"],
        ["Latency profile", "Often 10 to 30 ms per shard in RAM for 768 or 1536 dims at high recall", "Often 15 to 60 ms depending on nprobe and scanned codes", "Both need scatter-gather budgeting across shards"],
        ["Throughput per node", "Roughly 1K to 5K QPS for high-recall 768 dim queries on CPU-heavy nodes", "Roughly 2K to 10K QPS when compressed distance tables stay cache-friendly", "Numbers vary widely; candidate should state assumptions"],
        ["Tuning knobs", "M 16 to 64, efConstruction 100 to 500, efSearch 40 to 400", "nlist 16384 to 262144, nprobe 8 to 128, PQ m 64 to 192, 8 bits per sub-code", "Knobs trade recall for memory, build time, and p99"],
        ["Writes and deletes", "Online inserts are natural, deletes are tombstones until rebuild", "Best as batch-built segments with separate fresh delta index", "Freshness design differs by index family"],
        ["Failure mode", "RAM pressure, graph fragmentation, tombstone bloat, slow rebuilds", "Poor codebook training, low recall under selective filters, rescore vector storage", "Mention operational failure modes, not only algorithm theory"]
      ]
    },
    {
      title: "Storage representation tradeoffs",
      columns: ["Representation", "Bytes per 1536 dim vector", "Compression vs FP32", "Typical use"],
      rows: [
        ["FP32", "6144 bytes", "1x", "Offline evaluation, exact rescore, small high-quality corpora"],
        ["FP16", "3072 bytes", "2x", "In-memory HNSW where recall stays high and RAM is acceptable"],
        ["INT8 scalar", "1536 bytes plus scales", "About 4x", "Broad cost reduction with modest recall loss after calibration"],
        ["PQ 96x8", "96 bytes plus codebooks", "About 64x", "Billion-scale IVF-PQ candidate generation"],
        ["PQ 192x8", "192 bytes plus codebooks", "About 32x", "Higher recall compressed serving with larger memory budget"],
        ["Binary sketch", "192 bytes for 1536 bits", "About 32x", "Coarse prefilter or dedupe, rarely final ranking alone"]
      ]
    },
    {
      title: "Filtered search strategies",
      columns: ["Strategy", "When it works", "Risk", "Mitigation"],
      rows: [
        ["Post-filter topK", "Broad filters where 30 percent or more of candidates survive", "Empty or low-recall results for selective filters", "Adaptive oversampling and retry"],
        ["Pre-filter bitset", "Tenant, ACL, language, type, and other indexed metadata", "Search frontier can become disconnected or too small", "Increase efSearch or use filtered graph traversal"],
        ["Per-tenant index", "Large tenants or security-critical namespaces", "Too many tiny indexes and poor utilization", "Use only for large or regulated tenants"],
        ["Segment pruning", "Time ranges or collections with useful min and max metadata", "Cannot handle arbitrary predicates", "Combine with bitsets and post-filtering"],
        ["Exact scan of filtered subset", "Tiny filtered sets under about 100K vectors", "Bad when selectivity estimate is wrong", "Coordinator chooses plan using statistics"]
      ]
    }
  ],
  decisionGuideMD: `## Decision guide

Use **in-memory HNSW** when recall is the top priority, the corpus fits in affordable RAM, query p99 must be low, and writes should become searchable quickly. This is the default interview baseline for RAG collections up to tens or hundreds of millions of vectors per collection.

Use **IVF-PQ** when the corpus is in the billions, RAM is the binding constraint, and you can invest in training codebooks, exact rescoring, and recall evaluation. It is a strong answer for cost-sensitive large retrieval systems, especially with immutable batch-built segments.

Use **DiskANN or tiered SSD** when even compressed in-memory serving is too expensive or when cold historical corpora dominate. Keep hot deltas and frequently accessed vectors in RAM, use NVMe for graph and vector reads, and be honest about p99.

For filtered search, do not pick one universal strategy. Broad filters can be post-filtered. Selective filters need pre-filtering, tenant routing, or exact scan of the filtered subset. Security filters must be enforced before and after ANN search.

For freshness, do not rebuild the whole billion-vector index per write. Use a durable log, mutable delta index, immutable segments, tombstones, and compaction. State the difference between durable acknowledgement and searchable visibility.`,
  handsOn: [
    {
      title: "Estimate vector memory before selecting an ANN index",
      detailMD: `This quick estimator forces the design conversation to start with bytes. Adjust dimensions, representation, graph overhead, and replicas before arguing about HNSW or IVF-PQ.`,
      code: {
        language: "python",
        label: "capacity_estimator.py",
        body: `def estimate(vector_count, dims, bytes_per_dim, graph_bytes, metadata_bytes, replicas):
    raw_vector_gb = vector_count * dims * bytes_per_dim / 1_000_000_000
    per_vector_extra_gb = vector_count * (graph_bytes + metadata_bytes) / 1_000_000_000
    primary_gb = raw_vector_gb + per_vector_extra_gb
    total_gb = primary_gb * replicas
    return {
        "raw_vector_gb": round(raw_vector_gb, 1),
        "primary_gb": round(primary_gb, 1),
        "total_gb": round(total_gb, 1)
    }

one_billion = 1_000_000_000
hnsw_fp16 = estimate(one_billion, 1536, 2, 512, 128, 2)
pq_codes = estimate(one_billion, 96, 1, 32, 64, 2)

print("HNSW FP16 with replicas", hnsw_fp16)
print("PQ codes with replicas", pq_codes)`
      }
    },
    {
      title: "Model scatter-gather topK merge",
      detailMD: `The coordinator asks each shard for more than final topK, then merges globally. Real systems also handle timeouts, replicas, tombstones, filters, and exact rescoring, but the heap shape is the same.`,
      code: {
        language: "typescript",
        label: "scatterGather.ts",
        body: `type Hit = {
  id: string;
  score: number;
  shard: string;
};

function mergeTopK(shardResults: Hit[][], topK: number): Hit[] {
  const bestById = new Map<string, Hit>();

  for (const hits of shardResults) {
    for (const hit of hits) {
      const previous = bestById.get(hit.id);
      if (!previous || hit.score > previous.score) {
        bestById.set(hit.id, hit);
      }
    }
  }

  return Array.from(bestById.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}`
      }
    },
    {
      title: "Choose a filtered search plan from selectivity",
      detailMD: `A simple query planner can choose between post-filtering, pre-filtered ANN, or exact scan of a small filtered subset. Production planners use statistics by tenant, segment, and predicate.`,
      code: {
        language: "python",
        label: "filter_planner.py",
        body: `def choose_plan(total_vectors, estimated_matches, top_k):
    selectivity = estimated_matches / max(total_vectors, 1)

    if estimated_matches <= 100_000:
        return "exact_scan_filtered_subset"

    if selectivity < 0.01:
        return "pre_filter_with_high_ef_and_oversampling"

    if selectivity < 0.20:
        return "pre_filter_or_large_candidate_pool"

    if top_k <= 50:
        return "post_filter_with_moderate_oversampling"

    return "hybrid_filter_and_rescore"

print(choose_plan(50_000_000, 20_000, 20))
print(choose_plan(50_000_000, 30_000_000, 20))`
      }
    },
    {
      title: "Track index visibility with watermarks",
      detailMD: `Watermarks let clients understand whether a write is merely durable or already searchable. This is useful for RAG backfills, document deletion SLAs, and tests that wait for indexing.`,
      code: {
        language: "typescript",
        label: "visibilityWatermark.ts",
        body: `type Mutation = {
  sequence: number;
  vectorId: string;
  operation: "upsert" | "delete";
};

class ShardVisibility {
  durableSequence = 0;
  searchableSequence = 0;

  acknowledgeDurable(mutation: Mutation) {
    this.durableSequence = Math.max(this.durableSequence, mutation.sequence);
  }

  publishSearchable(sequence: number) {
    this.searchableSequence = Math.max(this.searchableSequence, sequence);
  }

  isSearchable(sequence: number) {
    return sequence <= this.searchableSequence;
  }
}`
      }
    }
  ],
  quiz: [
    {
      question: "Why is raw capacity math essential before choosing HNSW for 1 billion 1536 dimensional vectors?",
      options: [
        "Because HNSW cannot support cosine similarity",
        "Because FP32 vectors alone require about 6.1 TB before graph, metadata, headroom, and replicas",
        "Because vector dimensions do not affect memory usage",
        "Because IVF-PQ always has better recall than HNSW"
      ],
      answerIndex: 1,
      explanationMD: `1536 FP32 values need 6144 bytes per vector, so 1 billion vectors need about 6.1 TB before overhead. HNSW adds graph links and operational headroom, and replication can double the footprint.`
    },
    {
      question: "Which HNSW parameter most directly increases query-time search breadth and usually improves recall at higher latency?",
      options: [
        "efSearch",
        "nprobe",
        "nlist",
        "PQ code size"
      ],
      answerIndex: 0,
      explanationMD: `efSearch controls how many candidates HNSW explores during query. nprobe and nlist are IVF parameters, while PQ code size controls compression granularity.`
    },
    {
      question: "Why can post-filtering topK ANN results fail for selective metadata predicates?",
      options: [
        "Because metadata filters cannot be represented in a vector database",
        "Because ANN scores become negative after filtering",
        "Because most retrieved candidates may be rejected, leaving too few relevant results and low recall",
        "Because HNSW requires all filters to be timestamps"
      ],
      answerIndex: 2,
      explanationMD: `If a predicate accepts only 0.1 percent of the corpus, the global ANN topK will likely contain mostly disallowed items. The system needs pre-filtering, oversampling, tenant-specific indexes, or exact scan for tiny filtered subsets.`
    },
    {
      question: "What is a common production pattern for supporting fresh writes with a batch-optimized IVF-PQ base index?",
      options: [
        "Reject all writes until the next weekly rebuild",
        "Store fresh vectors in a mutable delta index and search both delta and base segments",
        "Insert vectors into object storage only and hope the query router finds them",
        "Use a different distance metric for new vectors"
      ],
      answerIndex: 1,
      explanationMD: `Batch-optimized compressed indexes are often immutable segments. A mutable delta index makes recent writes searchable while background compaction rebuilds optimized segments.`
    },
    {
      question: "In a hash-sharded vector database, why does a query usually scatter to all shards?",
      options: [
        "The coordinator cannot compute distances",
        "The closest semantic neighbors can live on any shard because partitioning by id does not preserve embedding proximity",
        "Object storage requires every shard to be contacted first",
        "Replicas only accept broadcast requests"
      ],
      answerIndex: 1,
      explanationMD: `Hash sharding balances data by id, not semantic location. Without a routing index or metadata pruning, nearest vectors may be anywhere, so the coordinator fans out and globally merges local topK results.`
    },
    {
      question: "What is the safest way to roll out a new embedding model for an existing collection?",
      options: [
        "Mix old and new embeddings in the same index and rely on cosine similarity",
        "Create a new index version, backfill or dual-write, shadow queries, evaluate, then cut over",
        "Only update metadata because vectors are model independent",
        "Quantize the old vectors and call them new vectors"
      ],
      answerIndex: 1,
      explanationMD: `Different embedding models create different vector spaces. The safe migration is versioned indexing with dual-write or backfill, shadow evaluation, and controlled traffic shift.`
    }
  ],
  flashcards: [
    {
      front: "What does efSearch control in HNSW?",
      back: "The breadth of query-time graph exploration. Higher efSearch usually improves recall and increases latency."
    },
    {
      front: "What do nlist and nprobe mean in IVF?",
      back: "nlist is the number of coarse inverted lists. nprobe is how many lists a query searches."
    },
    {
      front: "Why use product quantization?",
      back: "It compresses high-dimensional vectors into compact codes, reducing RAM and bandwidth at the cost of approximate distances."
    },
    {
      front: "What is scatter-gather in vector search?",
      back: "The coordinator sends the query to many shards, each returns local candidates, and an aggregator merges them into a global topK."
    },
    {
      front: "Why are tombstones common for vector deletes?",
      back: "Immediate graph removal can be expensive and harm connectivity, so deleted ids are skipped until compaction rebuilds clean segments."
    },
    {
      front: "What makes filtered vector search hard?",
      back: "Selective predicates can reject most ANN candidates, reducing recall unless the filter is pushed into search or the candidate pool grows."
    },
    {
      front: "When is DiskANN attractive?",
      back: "When the corpus is too large for economical RAM and NVMe-backed p99 latency is acceptable."
    },
    {
      front: "Why version embedding models?",
      back: "Different models create different vector spaces, so similarity scores are not safely comparable across versions."
    },
    {
      front: "What is exact rescoring?",
      back: "After approximate compressed search, recompute distances for a smaller candidate set using higher precision vectors."
    }
  ],
  cheatSheetMD: `## Vector database cheat sheet

### Core SLOs to ask for

- Vector count: 10M, 1B, 10B, or more.
- Dimensions: commonly 384, 768, 1024, 1536, or 3072.
- Metric: cosine, dot product, or L2. Know whether vectors are normalized.
- topK: often 10 to 100 for RAG and 100 to 1000 for candidate generation.
- Recall target: recall@10 or recall@100, not vague quality.
- Latency: p50 and p99, plus whether p99 includes embedding generation.
- Writes: streaming upserts, deletes, backfills, and required visibility lag.
- Filters: tenant, ACL, time, language, document type, and expected selectivity.

### Capacity anchors

| Item | Rule of thumb |
|---|---|
| 1536 dim FP32 | 6144 bytes per vector |
| 1536 dim FP16 | 3072 bytes per vector |
| 1B x 1536 FP32 | About 6.1 TB raw vectors |
| 1B x 1536 FP16 | About 3.1 TB raw vectors |
| PQ 96x8 | About 96 bytes per vector plus overhead |
| HNSW graph | Often hundreds of bytes per vector depending on M and implementation |
| One replica | Roughly doubles serving storage and write fanout |

### Index choice

- HNSW: best default for high recall, low latency, online inserts, and manageable corpus size.
- IVF-PQ: best for compressed billion-scale candidate generation when RAM dominates cost.
- DiskANN: best when the corpus is too large for RAM and NVMe p99 is acceptable.
- Flat exact scan: only for small filtered subsets, offline evaluation, or tiny corpora.

### HNSW knobs

- M controls graph degree. Common values: 16, 32, 48, 64.
- efConstruction controls build quality and build time. Common values: 100 to 500.
- efSearch controls query recall and latency. Common values: 40 to 400.
- Tombstone ratio above 10 to 30 percent often triggers compaction.

### IVF-PQ knobs

- nlist controls coarse partitions. Billion-scale systems may use tens or hundreds of thousands.
- nprobe controls how many lists to search. Common values: 8 to 128.
- PQ code size controls compression. 64, 96, or 192 bytes per 1536 dim vector are common discussion points.
- Exact rescoring recovers quality by recomputing distances for the top candidates.

### Query path

1. Gateway validates auth, dimensions, topK, namespace, and filter syntax.
2. Coordinator embeds text if needed and checks model version.
3. Coordinator plans shards and filters.
4. Shards run ANN with local bitsets or filter-aware traversal.
5. Aggregator merges local candidates into global topK.
6. Final hydration enforces ACLs and returns payloads.

### Write path

1. Validate id, vector dimension, metadata, namespace, and version.
2. Generate embedding if raw content was supplied.
3. Append to durable log and replicate according to policy.
4. Insert into mutable delta index.
5. Update metadata sidecars and filter bitsets.
6. Compact deltas into immutable optimized segments.
7. Upload snapshots and manifests for recovery.

### Filter strategy

- Broad filters: post-filter with modest oversampling.
- Medium filters: pre-filter bitsets or larger candidate pools.
- Selective filters: tenant-specific index, filtered ANN, or exact scan of subset.
- Security filters: pre-filter and final authorization.

### Production metrics

- recall@10 and recall@100 against offline gold sets.
- p99 by shard, tenant, filter type, and embedding model version.
- indexing lag, compaction lag, tombstone ratio, and segment count.
- query fanout, hedged read rate, timeout rate, and partial result rate.
- RAM, SSD read amplification, object-store recovery time, and cache hit rate.
- embedding drift and distribution shifts after model migrations.`,
  references: [
    {
      title: "Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs",
      kind: "Paper",
      url: "https://arxiv.org/abs/1603.09320",
      author: "Yury Malkov and Dmitry Yashunin"
    },
    {
      title: "Product Quantization for Nearest Neighbor Search",
      kind: "Paper",
      url: "https://lear.inrialpes.fr/pubs/2011/JDS11/jegou_searching_with_quantization.pdf",
      author: "Herve Jegou, Matthijs Douze, and Cordelia Schmid"
    },
    {
      title: "Billion-scale similarity search with GPUs",
      kind: "Paper",
      url: "https://arxiv.org/abs/1702.08734",
      author: "Jeff Johnson, Matthijs Douze, and Herve Jegou"
    },
    {
      title: "DiskANN: Fast Accurate Billion-point Nearest Neighbor Search on a Single Node",
      kind: "Paper",
      url: "https://www.microsoft.com/en-us/research/publication/diskann-fast-accurate-billion-point-nearest-neighbor-search-on-a-single-node/",
      author: "Subramanya et al."
    },
    {
      title: "FAISS documentation",
      kind: "Docs",
      url: "https://faiss.ai/",
      author: "Meta AI"
    },
    {
      title: "ScaNN: Efficient Vector Similarity Search at Scale",
      kind: "Paper",
      url: "https://arxiv.org/abs/1908.10396",
      author: "Ruiqi Guo et al."
    },
    {
      title: "Vector search filtering in Azure AI Search",
      kind: "Docs",
      url: "https://learn.microsoft.com/en-us/azure/search/vector-search-filters",
      author: "Microsoft"
    }
  ],
  relatedLessons: [
    {
      slug: "design-rag-pipeline",
      note: "Shows how vector retrieval fits into an end-to-end grounded generation system."
    },
    {
      slug: "hnsw-index-deep-dive",
      note: "Goes deeper on graph construction, efSearch, and M tuning."
    },
    {
      slug: "ann-algorithms",
      note: "Compares graph, partition, hashing, and quantization families."
    },
    {
      slug: "filtered-vector-search",
      note: "Expands the metadata and ACL filtering tradeoffs."
    },
    {
      slug: "hybrid-search-for-rag",
      note: "Connects dense vector search with BM25 and score fusion."
    },
    {
      slug: "design-semantic-cache",
      note: "Applies vector search to caching LLM responses safely."
    }
  ]
};
