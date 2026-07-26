import type { SDQuestionContent } from "../types";

export const googleSearchContent: SDQuestionContent = {
  slug: "google-search",
  statementMD: `
Design Google Search, a web search engine that lets users submit a free-text query and receive a ranked page of relevant web results in a fraction of a second. The system must continuously discover, crawl, process, index, rank, and serve a web-scale corpus while keeping the online query path isolated from slow offline ingestion work.

At interview scale, assume tens of billions of indexed documents, hundreds of billions of discovered URLs, globally distributed users, and hundreds of thousands of peak queries per second. The core challenge is not just returning documents that contain query terms. It is maintaining a fresh inverted index, partitioning that index across many serving shards, scattering each query to the right shard replicas, merging top candidates quickly, and applying ranking signals without violating a tight latency budget.

The default design should separate the crawler and indexing pipeline from the online serving path. Crawling, parsing, deduplication, link analysis, and index building can run asynchronously and publish immutable index generations. Query serving should read from loaded index shards, caches, and document stores, then return ranked results even when crawl freshness or rebuild jobs are temporarily delayed.
`,
  businessUseCaseMD: `
Web search is the primary navigation layer for the public internet. Users depend on it to find pages, products, news, documentation, local businesses, and answers without knowing the exact destination URL.

For the business, search quality drives trust, traffic, ads, commerce, and ecosystem value. A better index and ranking system improves user engagement, while freshness lets the product respond to breaking news, newly published pages, and rapidly changing content.
`,
  functionalRequirements: [
    "Accept free-text search queries with pagination, localization, safe-search options, and device-aware result formatting.",
    "Return a ranked list of web results with title, URL, snippet, freshness metadata, and optional rich features.",
    "Continuously discover URLs through sitemaps, links, feeds, user-submitted seeds, and recrawl scheduling.",
    "Fetch pages while respecting robots.txt, host politeness, crawl budgets, redirects, and content errors.",
    "Process fetched documents into normalized text, metadata, duplicate groups, language, anchors, and link graph signals.",
    "Build and update an inverted index mapping terms to compressed posting lists across many shards.",
    "Support heavy caching for popular queries, navigational queries, snippets, and static ranking features.",
    "Collect query logs, click signals, crawl metrics, and index freshness signals for quality and operations.",
  ],
  nonFunctionalRequirements: [
    {
      label: "Latency",
      detailMD: `
Search result pages should return in under 200ms p95 and under 500ms p99 from the serving region, excluding long client network delays. The index shard fan-out budget is usually 15 to 25ms per contacted shard replica, with another 20 to 40ms for merging, ranking, snippets, and rendering.
`,
    },
    {
      label: "Availability",
      detailMD: `
The online serving path should remain available even when crawling, indexing, query logging, or machine-learning feature refresh is degraded. A practical target is 99.99 percent availability for basic search results, with graceful degradation to older index generations or simpler ranking.
`,
    },
    {
      label: "Scalability",
      detailMD: `
The system must scale independently along three axes: crawl throughput, index build throughput, and query serving QPS. Adding crawler workers should not change query latency, and adding index serving replicas should absorb query peaks without changing the offline pipeline.
`,
    },
    {
      label: "Freshness",
      detailMD: `
Popular and fast-changing pages should be discovered and refreshed within minutes, while low-value stable pages can be recrawled days or weeks later. Freshness is a ranking and product requirement, but it should not block query serving when the newest index delta is delayed.
`,
    },
    {
      label: "Relevance",
      detailMD: `
Ranking must combine lexical relevance, field boosts, anchor text, PageRank-style link authority, freshness, location, personalization where allowed, spam scores, and learned ranking models. The design should make it easy to add signals without rebuilding the entire serving stack.
`,
    },
    {
      label: "Storage efficiency",
      detailMD: `
The inverted index, document store, link graph, and crawl history are petabyte-scale. Posting lists need compression, block-level skip data, compact term dictionaries, immutable segment storage, and tiered retention so the system stays cost-effective.
`,
    },
    {
      label: "Operational isolation",
      detailMD: `
Crawler mistakes, bad parsers, corrupt index segments, or ranking model rollouts must not take down the online search path. Use versioned index generations, canaries, validation, staged rollout, and the ability to pin serving clusters to a known-good generation.
`,
    },
  ],
  capacityEstimation: {
    assumptionsMD: `
Assume 50B indexed documents, 120B discovered URL records, 2T directed links in the link graph, an average compressed document representation of 20 KB, an average inverted-index contribution of 20 KB per document including terms, positions, fields, skip blocks, and metadata, and 3 replicas for online serving.

Assume 100K average query QPS globally, 500K peak query QPS, 30 percent of queries served from full-result cache, and 2,000 primary document-sharded index partitions. Each primary shard holds about 25M documents. Query fan-out contacts one healthy replica of each required shard group, and each shard returns a local top 100 to top 1,000 candidate set.
`,
    metrics: [
      {
        label: "Indexed corpus",
        value: "50B documents",
        note: "Public web-scale interview assumption after deduplication and quality filtering",
      },
      {
        label: "Discovered URL frontier",
        value: "120B URL records",
        note: "Includes known, canonicalized, queued, failed, and scheduled-for-recrawl URLs",
      },
      {
        label: "Compressed document store",
        value: "1 PB raw logical",
        note: "50B documents times 20 KB of compressed text, metadata, and pointers",
      },
      {
        label: "Compressed inverted index",
        value: "1 PB logical",
        note: "50B documents times 20 KB of postings, positions, field data, and skips",
      },
      {
        label: "Serving storage with replicas",
        value: "6 to 9 PB",
        note: "Document store plus inverted index plus 3 replicas, link data, and operational overhead",
      },
      {
        label: "Primary index shards",
        value: "2,000 shards",
        note: "About 25M documents per primary shard before replicas",
      },
      {
        label: "Query traffic",
        value: "100K average QPS, 500K peak QPS",
        note: "Global search traffic before result-cache hits are removed",
      },
      {
        label: "Result-cache offload",
        value: "30 percent of queries",
        note: "Popular navigational and repeated queries can skip shard fan-out briefly",
      },
      {
        label: "Shard latency budget",
        value: "15 to 25ms per shard replica",
        note: "Local posting-list lookup and top candidate scoring before broker timeout",
      },
      {
        label: "Crawl throughput",
        value: "2B fetches per day",
        note: "About 23K fetches per second average across crawler fleets",
      },
    ],
    calculationsMD: `
- Document store: 50B indexed documents times 20 KB compressed representation is about 1,000,000,000,000 KB, or about 1 PB logical.
- Inverted index: using another 20 KB per document for compressed postings, positions, field annotations, term statistics, and skip data gives about 1 PB logical.
- Replication: 1 PB document store plus 1 PB inverted index is 2 PB before replicas. With 3 serving replicas, link graph storage, crawl metadata, index generations, and compaction headroom, plan for roughly 6 to 9 PB.
- Shards: 50B documents divided by 2,000 primary shards gives 25M documents per primary shard. With 3 replicas, the serving fleet runs about 6,000 shard copies.
- Query load: 500K peak QPS with 30 percent full-result cache hits leaves about 350K QPS that need query planning and shard fan-out.
- Per-shard load: if every uncached query fans out to all 2,000 primary shard groups, the aggregate shard request rate is enormous, so production systems use tiering, early termination, query routing, replicas, and cached posting blocks. In interviews, call out that each shard does bounded local work and returns only top candidates.
- Crawl rate: 2B fetches per day divided by 86,400 seconds is about 23K fetches per second. Politeness spreads this across hosts so a single host may receive only one request every few seconds even while the global fleet is large.
- Latency: a 200ms p95 page budget might allocate 10ms to query parsing and cache lookup, 35ms to shard fan-out waiting, 25ms to merge candidates, 40ms to ranking and feature fetches, 30ms to snippets and rendering, and the rest to network and safety margin.
`,
  },
  apiDesign: {
    endpoints: [
      {
        method: "GET",
        path: "/search",
        descriptionMD: `
Serves the user-facing search result page. The response can be HTML for browsers or JSON for an API client, but the internal flow is the same: normalize query, check caches, fan out to index shards, merge, rank, fetch snippets, and return results.
`,
        request: `
GET /search?q=distributed%20systems&hl=en&region=US&safe=active&pageToken=cursor_1
`,
        response: `
{
  "query": "distributed systems",
  "results": [
    {
      "title": "Distributed systems guide",
      "url": "https://www.example.com/distributed-systems",
      "snippet": "A practical guide to replication, consensus, sharding, and fault tolerance.",
      "rank": 1,
      "freshness": "2026-07-25T10:20:00Z"
    }
  ],
  "nextPageToken": "cursor_2",
  "servedFromCache": false
}
`,
        statusCodes: [
          { code: 200, meaning: "Results returned" },
          { code: 400, meaning: "Invalid query parameters" },
          { code: 429, meaning: "Client or tenant rate limit exceeded" },
          { code: 503, meaning: "Search temporarily degraded or unavailable" },
        ],
      },
      {
        method: "GET",
        path: "/suggest",
        descriptionMD: `
Returns autocomplete suggestions while the user is typing. This is a separate low-latency system fed by query logs and trending data, but it shares normalization, language, and safety rules with search.
`,
        request: `
GET /suggest?q=dist&hl=en&region=US
`,
        response: `
{
  "suggestions": [
    "distributed systems",
    "distributed tracing",
    "distance calculator"
  ]
}
`,
        statusCodes: [
          { code: 200, meaning: "Suggestions returned" },
          { code: 400, meaning: "Invalid query prefix" },
          { code: 429, meaning: "Rate limit exceeded" },
        ],
      },
      {
        method: "POST",
        path: "/internal/crawl/seeds",
        descriptionMD: `
Adds seed URLs or sitemap URLs to the crawl frontier. This is an internal or partner-facing control-plane endpoint, not part of the query serving path.
`,
        request: `
{
  "source": "sitemap",
  "urls": [
    "https://www.example.com/sitemap.xml"
  ],
  "priority": "normal"
}
`,
        response: `
{
  "accepted": 1,
  "deduplicated": 0,
  "frontierBatchId": "frontier_20260726_001"
}
`,
        statusCodes: [
          { code: 202, meaning: "Seed accepted for asynchronous scheduling" },
          { code: 400, meaning: "Invalid URL or priority" },
          { code: 401, meaning: "Unauthorized internal caller" },
          { code: 429, meaning: "Seed submission throttled" },
        ],
      },
      {
        method: "GET",
        path: "/internal/documents/{docId}/status",
        descriptionMD: `
Returns crawl, processing, and index status for a document. Operators use this to debug freshness, canonicalization, duplicate grouping, and why a page is or is not visible in search.
`,
        response: `
{
  "docId": "doc_918273645",
  "canonicalUrl": "https://www.example.com/distributed-systems",
  "crawlState": "fetched",
  "lastFetchedAt": "2026-07-26T06:11:00Z",
  "indexGeneration": "gen_4382",
  "duplicateClusterId": "dup_991",
  "servingShard": "shard_0142"
}
`,
        statusCodes: [
          { code: 200, meaning: "Status returned" },
          { code: 401, meaning: "Unauthorized internal caller" },
          { code: 404, meaning: "Document not found" },
        ],
      },
      {
        method: "POST",
        path: "/internal/index/generations/{generationId}/activate",
        descriptionMD: `
Activates a validated index generation for serving clusters. The operation is staged and reversible so a bad index can be rolled back without redeploying query-serving code.
`,
        request: `
{
  "regions": ["us", "eu", "apac"],
  "canaryPercent": 5,
  "rollbackGenerationId": "gen_4381"
}
`,
        response: `
{
  "generationId": "gen_4382",
  "activationState": "canarying",
  "startedAt": "2026-07-26T07:30:00Z"
}
`,
        statusCodes: [
          { code: 202, meaning: "Activation started" },
          { code: 400, meaning: "Generation failed validation or request is invalid" },
          { code: 401, meaning: "Unauthorized internal caller" },
          { code: 409, meaning: "Another activation is already in progress" },
        ],
      },
    ],
    notesMD: `
The public search API is read-only and must not depend on crawler writes. Internal crawl and index-generation APIs are control-plane operations used by workers and operators. They are useful in an interview because they show that crawling, index building, and activation are explicit workflows rather than hidden magic inside the query endpoint.
`,
  },
  databaseDesign: {
    schemaMD: `
The logical schema is split by workload. Crawl state tracks URLs and fetch scheduling. Document storage tracks canonical documents and processed metadata. The link graph stores edges for PageRank-style analysis. Index metadata tracks immutable index segments and generations loaded by online serving clusters.

The inverted index itself is not a normal relational table at production scale. It is a set of compressed segment files where each term maps to posting lists containing document ids, term frequency, positions, fields, and skip data. Metadata tables make those files discoverable and versioned.
`,
    tables: [
      {
        name: "url_frontier",
        columns: [
          { name: "url_key", type: "bytes", note: "Hash of normalized URL; primary key for crawl state" },
          { name: "canonical_url", type: "text", note: "Normalized URL after redirects and canonical rules" },
          { name: "host_key", type: "bytes", note: "Host or site partition used for politeness queues" },
          { name: "priority", type: "int", note: "Higher priority for important, fresh, or frequently changing pages" },
          { name: "next_fetch_at", type: "timestamp", note: "Recrawl scheduler time respecting freshness and politeness" },
          { name: "last_fetch_status", type: "varchar(32)", note: "HTTP status, robots blocked, timeout, or parse error" },
          { name: "robots_policy_version", type: "varchar(64)", note: "Robots.txt policy version used for the last scheduling decision" },
        ],
      },
      {
        name: "documents",
        columns: [
          { name: "doc_id", type: "uint64", note: "Stable internal document identifier used by posting lists" },
          { name: "canonical_url", type: "text", note: "Canonical URL shown to users when the document is served" },
          { name: "content_hash", type: "bytes", note: "Hash for exact duplicate detection" },
          { name: "simhash", type: "uint64", note: "Near-duplicate fingerprint used for duplicate clustering" },
          { name: "language", type: "varchar(16)", note: "Detected language for routing and ranking" },
          { name: "quality_score", type: "float", note: "Spam, safety, and quality aggregate used by ranking" },
          { name: "doc_store_uri", type: "text", note: "Pointer to compressed text, title, anchors, and snippet data" },
          { name: "indexed_generation", type: "varchar(64)", note: "Latest index generation containing this document" },
        ],
      },
      {
        name: "link_edges",
        columns: [
          { name: "source_doc_id", type: "uint64", note: "Document containing the outgoing link" },
          { name: "target_doc_id", type: "uint64", note: "Canonical target document" },
          { name: "anchor_text_hash", type: "bytes", note: "Compact pointer to normalized anchor text features" },
          { name: "nofollow", type: "boolean", note: "Whether the source instructed crawlers not to transfer authority" },
          { name: "edge_weight", type: "float", note: "Weight after spam, placement, and site-level adjustments" },
        ],
      },
      {
        name: "index_generations",
        columns: [
          { name: "generation_id", type: "varchar(64)", note: "Immutable index generation identifier" },
          { name: "shard_id", type: "varchar(64)", note: "Document-sharded serving partition" },
          { name: "segment_uri", type: "text", note: "Object storage path for compressed index segment files" },
          { name: "doc_id_range", type: "varchar(64)", note: "Document id range or hash range covered by the shard" },
          { name: "created_at", type: "timestamp", note: "Build completion time" },
          { name: "validated", type: "boolean", note: "True only after checksum, recall, and serving tests pass" },
          { name: "serving_state", type: "varchar(32)", note: "Building, canarying, active, pinned, or rolled_back" },
        ],
      },
    ],
    indexesMD: `
- **url_frontier.host_key, next_fetch_at** supports per-host politeness queues and due-for-fetch scans.
- **url_frontier.url_key** deduplicates discovered URLs before they enter the frontier.
- **documents.doc_id** is the stable key stored in posting lists and used by serving shards.
- **documents.content_hash** and **documents.simhash** support exact and near-duplicate clustering.
- **link_edges.target_doc_id** supports link analysis jobs that aggregate incoming authority.
- **index_generations.generation_id, shard_id** lets serving clusters discover the exact segment set to load.
`,
    relationshipsMD: `
URLs become documents only after canonicalization, fetching, and duplicate handling. Many discovered URLs can map to one canonical document. Documents emit outgoing link edges, and link analysis writes authority features back into document or ranking-feature stores. Index generations reference immutable segment files, and online search clusters load only validated generations.
`,
    noSqlAlternativesMD: `
Use Bigtable, HBase, Cassandra, DynamoDB, or Spanner-like storage for crawl state and document metadata, partitioned by URL hash, host key, or document id depending on access pattern. Store large compressed bodies and index segments in distributed object storage or a Colossus-like file system. The inverted index is best represented as immutable segment files plus compact serving metadata, not as row-per-posting records in a transactional database.
`,
  },
  architecture: {
    width: 980,
    height: 580,
    nodes: [
      { id: "client", label: "Client", kind: "client", x: 70, y: 170, sublabel: "Browser, mobile app" },
      { id: "edge-cache", label: "Edge and Result Cache", kind: "cdn", x: 230, y: 110, sublabel: "Popular queries" },
      { id: "global-lb", label: "Global Load Balancer", kind: "loadBalancer", x: 230, y: 250, sublabel: "Nearest region" },
      { id: "search-api", label: "Search API", kind: "service", x: 405, y: 180, sublabel: "Normalize, render" },
      { id: "query-cache", label: "Query Cache", kind: "cache", x: 405, y: 55, sublabel: "SERP, features" },
      { id: "query-broker", label: "Query Broker", kind: "service", x: 585, y: 180, sublabel: "Scatter, gather" },
      { id: "index-shards", label: "Index Serving Shards", kind: "search", x: 770, y: 145, sublabel: "Doc-sharded postings" },
      { id: "ranker", label: "Ranking and Snippets", kind: "analytics", x: 770, y: 315, sublabel: "ML ranker, snippets" },
      { id: "doc-store", label: "Document Store", kind: "storage", x: 930, y: 315, sublabel: "Titles, bodies, features" },
      { id: "telemetry-queue", label: "Logs and Signals Queue", kind: "queue", x: 585, y: 410, sublabel: "Queries, clicks" },
      { id: "crawl-frontier", label: "Crawl Frontier", kind: "queue", x: 125, y: 470, sublabel: "Priority, politeness" },
      { id: "crawler-workers", label: "Crawler Workers", kind: "worker", x: 315, y: 470, sublabel: "Fetch web pages" },
      { id: "index-pipeline", label: "Processing and Indexing", kind: "worker", x: 515, y: 520, sublabel: "Parse, dedup, build" },
      { id: "index-storage", label: "Index Storage", kind: "storage", x: 770, y: 500, sublabel: "Segments, generations" },
    ],
    edges: [
      { from: "client", to: "edge-cache", label: "search request" },
      { from: "edge-cache", to: "client", label: "cached result" },
      { from: "edge-cache", to: "global-lb", label: "cache miss" },
      { from: "global-lb", to: "search-api", label: "route to region" },
      { from: "search-api", to: "query-cache", label: "result lookup" },
      { from: "query-cache", to: "search-api", label: "hit" },
      { from: "search-api", to: "query-broker", label: "normalized query" },
      { from: "query-broker", to: "index-shards", label: "scatter fan-out" },
      { from: "index-shards", to: "query-broker", label: "local top K" },
      { from: "query-broker", to: "ranker", label: "merged candidates" },
      { from: "ranker", to: "doc-store", label: "snippets and features" },
      { from: "ranker", to: "search-api", label: "ranked results" },
      { from: "search-api", to: "telemetry-queue", label: "query and click logs", dashed: true },
      { from: "crawl-frontier", to: "crawler-workers", label: "scheduled URLs" },
      { from: "crawler-workers", to: "index-pipeline", label: "fetched content", dashed: true },
      { from: "index-pipeline", to: "doc-store", label: "documents and features", dashed: true },
      { from: "index-pipeline", to: "index-storage", label: "new segments", dashed: true },
      { from: "index-storage", to: "index-shards", label: "load generation", dashed: true },
      { from: "telemetry-queue", to: "index-pipeline", label: "quality signals", dashed: true },
    ],
    captionMD: `
The top half is the online path: cache, search API, query broker, index shards, ranking, and document store. The bottom half is the offline path: crawl frontier, crawlers, processing, index building, and index generation rollout.
`,
  },
  architectureNotesMD: `
The most important architectural boundary is between online serving and offline indexing. Online services should only depend on already-loaded index shards, result caches, ranking features, and document stores. Crawling and index building publish versioned artifacts that serving clusters can load, validate, canary, and roll back.

Document sharding is the default serving model. Each shard owns a subset of documents and contains posting lists for those documents. A query broker scatters a query to many shard replicas, each shard computes local top candidates from its posting lists, and the broker merges those candidates before running heavier ranking and snippet work.

Caches appear at multiple layers because the same query distribution is highly skewed. Edge caches and result caches help repeated navigational queries, posting-list block caches help common terms, and feature caches keep ranking from turning every query into many storage reads.
`,
  requestFlow: [
    {
      title: "Query arrives and is normalized",
      detailMD: `
The client sends a search request with query text, locale, region, device, safety mode, and pagination token. The Search API trims and normalizes text, detects language, applies spelling or synonym expansion where appropriate, enforces rate limits, and creates a query plan.
`,
    },
    {
      title: "Popular-result cache is checked",
      detailMD: `
The serving layer checks edge and regional result caches for the normalized query, locale, safety mode, and freshness window. Navigational and trending queries can often be served directly from cache for a few seconds or minutes, which avoids scatter-gather work entirely.
`,
    },
    {
      title: "Query broker scatters to index shards",
      detailMD: `
On a cache miss, the Query Broker chooses healthy replicas for the active index generation and sends the query to document-sharded index servers. It uses deadlines, hedged requests, and replica health to keep the fan-out tail within budget.
`,
    },
    {
      title: "Each shard reads posting lists and scores local candidates",
      detailMD: `
Each index shard looks up the query terms in its term dictionary, scans compressed posting-list blocks, uses skip data to avoid unnecessary work, applies lexical scoring and lightweight static signals, and returns a bounded local top K result set.
`,
    },
    {
      title: "Broker gathers and merges candidates",
      detailMD: `
The broker merges local top candidates from all contacted shards, normalizes scores using global term statistics, removes duplicates or clustered near-duplicates, and keeps a larger candidate set for final ranking.
`,
    },
    {
      title: "Ranking and snippet services enrich the result set",
      detailMD: `
The ranking layer combines lexical scores, PageRank-style authority, anchor text, freshness, language, geography, spam scores, and learned ranking features. It fetches titles, URLs, and snippet material from the document store or feature cache.
`,
    },
    {
      title: "Response is rendered and logged asynchronously",
      detailMD: `
The Search API renders the result page or JSON response, stores eligible results in cache, and publishes query and click telemetry asynchronously. Logging failures should not block a user from receiving results.
`,
    },
    {
      title: "Offline pipeline refreshes future results",
      detailMD: `
Separately, the crawl frontier schedules URLs, crawler workers fetch pages, processing jobs parse and deduplicate content, index builders create new segments, and serving clusters load validated generations. This pipeline improves future query results but is not synchronously invoked by the search request.
`,
    },
  ],
  coreComponents: [
    {
      name: "Search API",
      kind: "service",
      role: "Owns the user-facing request lifecycle and response rendering.",
      detailMD: `
The Search API handles query normalization, language and region context, pagination tokens, safety settings, rate limits, cache keys, response formatting, and asynchronous telemetry. It should stay stateless and avoid direct dependence on crawler or index-builder jobs.
`,
    },
    {
      name: "Query Broker",
      kind: "service",
      role: "Coordinates scatter-gather query execution across index shard replicas.",
      detailMD: `
The broker selects shard replicas for the active index generation, sends the query with strict deadlines, gathers local top K results, merges candidates, retries or hedges slow shards, and degrades gracefully when a small fraction of shards miss the deadline.
`,
    },
    {
      name: "Index Serving Shard",
      kind: "search",
      role: "Stores posting lists for a document partition and returns local top candidates.",
      detailMD: `
Each shard owns a slice of the document corpus. It stores a term dictionary, compressed posting lists, positions, field information, skip blocks, and lightweight rank features. It is optimized for fast top K retrieval rather than full scans.
`,
    },
    {
      name: "Ranking and Snippet Service",
      kind: "analytics",
      role: "Applies heavier ranking models and produces user-visible result summaries.",
      detailMD: `
This service combines shard scores with link authority, freshness, user context where allowed, document quality, spam signals, and learned ranking models. It also fetches or generates snippets and may run a second-stage or third-stage reranker on a smaller candidate set.
`,
    },
    {
      name: "Crawl Frontier",
      kind: "queue",
      role: "Schedules which URLs should be fetched next.",
      detailMD: `
The frontier deduplicates discovered URLs, groups them by host, enforces robots.txt and politeness, prioritizes high-value or stale pages, and emits due URLs to crawler workers. It is a large distributed priority queue with host-level rate controls.
`,
    },
    {
      name: "Crawler Workers",
      kind: "worker",
      role: "Fetch web pages safely and politely at massive scale.",
      detailMD: `
Crawler workers resolve DNS, fetch robots.txt, follow redirects, download content with timeouts and byte limits, respect per-host crawl delay, classify fetch errors, and write raw responses for processing. They should not directly update online index shards.
`,
    },
    {
      name: "Document Processing Pipeline",
      kind: "worker",
      role: "Turns raw web pages into clean documents, features, and graph edges.",
      detailMD: `
Processing jobs parse HTML, remove boilerplate, extract title and headings, detect language, canonicalize URLs, compute exact and near-duplicate fingerprints, extract links and anchor text, generate snippets, and emit document and ranking features.
`,
    },
    {
      name: "Index Builder and Generation Store",
      kind: "storage",
      role: "Builds immutable inverted-index segments and publishes serving generations.",
      detailMD: `
Index builders sort terms, create compressed posting lists, add positions and skip data, compute term statistics, merge small segments, validate checksums and recall tests, and publish versioned generations that online shards can load without stopping traffic.
`,
    },
  ],
  deepDives: [
    {
      topic: "Crawler frontier, politeness, deduplication, and freshness",
      detailMD: `
The crawler starts from seeds such as sitemaps, known high-quality domains, feeds, and links extracted from fetched pages. Every discovered URL is normalized, stripped of obvious tracking noise, hashed, and checked against a distributed seen set before it enters the frontier. This prevents infinite loops over calendar pages, faceted navigation, and duplicate URL variants.

The frontier is not a simple FIFO queue. It is closer to a distributed priority scheduler with per-host queues. It must honor robots.txt, crawl-delay directives where applicable, host health, DNS failures, and site-specific crawl budgets. Even if the global fleet can fetch tens of thousands of pages per second, one host may be limited to a request every few seconds.

Freshness is priority-driven. News homepages, popular documents, and pages with known frequent changes receive short recrawl intervals. Stable long-tail pages can wait days or weeks. The freshness model uses last-modified headers, ETags, historical change rates, PageRank-style importance, query demand, and publisher signals. The key tradeoff is that crawling more often improves freshness but increases cost and can harm external sites if politeness is weak.
`,
    },
    {
      topic: "Document processing and inverted index construction",
      detailMD: `
Fetched HTML is messy. The processing pipeline must parse malformed documents, follow canonical tags, extract visible text, remove boilerplate, detect language, extract title and structured metadata, identify spam, compute content hashes, and cluster near-duplicates with fingerprints such as SimHash. It also extracts outgoing links and anchor text for graph analysis.

The inverted index maps each term to a posting list. A posting usually contains document id, term frequency, positions, field flags such as title or heading, and sometimes compact quality or payload data. Posting lists are sorted by document id, delta-encoded, block-compressed, and augmented with skip pointers so shards can intersect terms and jump over low-value regions quickly.

Index builders create immutable segments. New crawls first produce small delta segments, and background jobs merge them into larger optimized segments. Serving shards load a generation consisting of base segments plus deltas. This design avoids rewriting a petabyte-scale index for every new crawl while still allowing periodic full rebuilds to fix tokenizer, ranking-feature, or dedup logic.
`,
    },
    {
      topic: "Document sharding and scatter-gather query fan-out",
      detailMD: `
The standard interview design shards by document, not by term. Each shard stores all terms for its subset of documents. A query is sent to every primary shard group or to a selected tier of shards, and each shard independently returns its local top K documents. The broker then merges the local candidates into a global ranking set.

Document sharding makes ranking easier because all features for a document partition are local, and every shard can run the same retrieval logic. It also avoids a single hot shard for very common terms. The cost is fan-out: every uncached query may touch many shard groups, so tail latency becomes the main serving challenge.

The broker controls that tail with replica selection, deadlines, hedged requests, shard health, and early termination. It can also use tiered indexes: search a high-quality or high-PageRank tier first, then expand to more shards if recall is insufficient. For rare or long-tail queries, the system may need broader fan-out; for navigational queries, caches or shortcuts can avoid it.
`,
    },
    {
      topic: "Ranking signals and learned ranking",
      detailMD: `
First-stage ranking usually combines lexical relevance with static document signals. Lexical relevance includes BM25-like term matching, phrase matches, field boosts for title or headings, anchor text matches, and freshness. Static signals include PageRank-style link authority, site quality, spam scores, language, locality, and historical engagement.

Link analysis is computed offline over the link graph. The graph can have tens of billions of nodes and trillions of edges, so PageRank-style jobs run in distributed batch systems and write compact authority features for serving. Anchor text is also valuable because other pages often describe a target better than the target describes itself.

Learned ranking runs in stages. Shards apply cheap retrieval and first-stage scoring to return candidates. A second-stage ranker uses richer features on hundreds or thousands of candidates. A final reranker may use neural or transformer-based models on a much smaller set. The design must bound model cost and have fallbacks to simpler ranking if feature stores or model servers are slow.
`,
    },
    {
      topic: "Caching and tight latency budgets",
      detailMD: `
Search has a skewed query distribution. A large fraction of traffic is repeated navigational, celebrity, sports, weather, news, or product queries. Full result pages can be cached for short TTLs keyed by normalized query, locale, safety setting, and freshness class. Even a 30 percent cache hit ratio removes enormous fan-out load at peak.

Below full-result caching, serving shards cache term dictionaries, hot posting-list blocks, document features, and shard-local results for common query fragments. Ranking services cache static features such as link authority and site quality. Snippet stores cache titles and precomputed summaries. These caches must respect freshness and safety updates, so invalidation is often generation-based rather than per-document.

Latency budgets should be explicit. The API might spend 10ms on parsing and cache checks, the broker might wait 35ms for shards, merging might take 25ms, ranking and snippets might take 40 to 70ms, and the rest is network and rendering. If a shard misses its deadline, the broker should prefer slightly lower recall over blowing the entire page latency budget.
`,
    },
    {
      topic: "Index storage, rebuilds, incremental updates, and serving isolation",
      detailMD: `
Index storage is versioned. Builders publish immutable segment files plus manifests that describe shard id, term statistics, checksums, document ranges, and compatibility. Serving clusters load a manifest, warm caches, run validation queries, and then gradually shift traffic to the new generation.

Periodic full rebuilds are necessary because changes in tokenization, deduplication, spam scoring, link analysis, or schema may require recomputing the entire index. Incremental updates are necessary because users expect fresh pages quickly. A practical design combines daily or weekly base builds with frequent delta segments for new or changed documents.

The online path never waits for a rebuild. If an incremental pipeline is delayed, users see a slightly older but still valid index. If a new generation is bad, serving can roll back to the previous manifest. This separation is what keeps a search engine available while the web crawler and index builder process petabytes of changing data.
`,
    },
  ],
  scaling: [
    {
      stage: "Prototype: millions of documents",
      detailMD: `
Start with a crawler, a simple URL frontier, a document store, and a single inverted index built by batch jobs. Serve queries from one or a few index servers. This validates parsing, tokenization, ranking basics, and the user-facing search API.
`,
    },
    {
      stage: "Growth: billions of documents",
      detailMD: `
Split crawl state by host and URL hash, build immutable index segments, shard the index by document id, add a query broker, and replicate shard servers. Add result caching, posting-list block caching, and asynchronous query logging.
`,
    },
    {
      stage: "Web scale: tens of billions of documents",
      detailMD: `
Run large distributed crawl fleets, petabyte-scale document and index storage, thousands of primary shards, and multiple serving replicas. Add PageRank-style graph computation, learned ranking stages, near-duplicate clustering, spam classifiers, and generation-based index rollout.
`,
    },
    {
      stage: "Global scale: many regions and strict latency",
      detailMD: `
Replicate active index generations to regional serving clusters, route users to nearby healthy regions, keep query caches local, and use global load balancing for failover. Separate crawling regions from serving regions so fetch locality and user latency can be optimized independently.
`,
    },
    {
      stage: "Fresh and personalized search",
      detailMD: `
Add near-real-time delta indexes for news and high-demand pages, richer query understanding, personalization where privacy policy allows, and specialized vertical indexes for images, video, local, shopping, or code. Maintain hard fallbacks to generic web ranking.
`,
    },
  ],
  bottlenecks: [
    {
      issue: "Scatter-gather tail latency",
      optimizationMD: `
Use shard replicas, hedged requests, strict deadlines, adaptive fan-out, early termination, and degraded partial results. Monitor per-shard p99 latency and avoid letting a few slow shards determine every query response time.
`,
    },
    {
      issue: "Common terms with huge posting lists",
      optimizationMD: `
Compress postings in blocks, use skip data, maintain impact-sorted or tiered posting lists, drop stop words when safe, and score only enough candidates to meet recall goals. Cache hot posting blocks aggressively.
`,
    },
    {
      issue: "Crawler traps and duplicate URLs",
      optimizationMD: `
Canonicalize URLs, strip tracking parameters, enforce per-site crawl budgets, detect infinite URL patterns, use Bloom filters or seen sets, and cluster near-duplicate content before it pollutes the index.
`,
    },
    {
      issue: "Index freshness lag",
      optimizationMD: `
Use priority recrawling, small delta segments, stream processing for high-value pages, and freshness-aware ranking. Keep full rebuilds for correctness while incremental updates carry time-sensitive changes.
`,
    },
    {
      issue: "Ranking feature and model cost",
      optimizationMD: `
Use staged ranking. Shards run cheap first-stage retrieval, the second stage ranks a bounded candidate set, and expensive neural models run only on the final small set. Cache static features and define fallbacks.
`,
    },
    {
      issue: "Bad index generation rollout",
      optimizationMD: `
Validate segment checksums, run golden queries, canary by region and traffic percentage, compare metrics against the previous generation, and keep rollback manifests ready. Never overwrite the only serving generation in place.
`,
    },
  ],
  failureHandling: [
    {
      scenario: "Crawler or fetcher outage",
      strategyMD: `
Query serving continues from the last active index generation. The frontier preserves scheduled URLs, freshness metrics show increasing lag, and workers resume fetching later. High-priority crawl queues can be drained first after recovery.
`,
    },
    {
      scenario: "Index builder publishes corrupt segments",
      strategyMD: `
Do not activate segments until validation passes. Use checksums, manifest consistency checks, sample query evaluation, duplicate-rate checks, and canary serving. If errors appear after activation, roll back to the previous generation.
`,
    },
    {
      scenario: "Index shard replica becomes slow or unavailable",
      strategyMD: `
The broker routes to another replica, sends hedged requests, or returns partial results after a deadline. Load balancers remove unhealthy shard servers, and background repair reloads the active generation from index storage.
`,
    },
    {
      scenario: "Query cache fleet is degraded",
      strategyMD: `
Serve uncached queries through the normal fan-out path, but apply rate limits and load shedding for abusive traffic. Rebuild caches gradually to avoid stampedes and protect index shards from sudden full traffic.
`,
    },
    {
      scenario: "Ranking model or feature store outage",
      strategyMD: `
Fall back to lexical ranking plus cached static features such as link authority, freshness, and spam scores. Keep the result page available and mark ranking quality as degraded in monitoring.
`,
    },
    {
      scenario: "Regional serving failure",
      strategyMD: `
Global load balancing shifts traffic to another region with a recent index generation. Because index generations are immutable, the recovery region can serve slightly older results safely while the failed region reloads or repairs shards.
`,
    },
  ],
  security: [
    {
      label: "Crawler safety and robots compliance",
      detailMD: `
Respect robots.txt, noindex, crawl-delay where applicable, site-specific rate limits, and legal removal workflows. Prevent SSRF-style crawler misuse by blocking internal address ranges and unsafe protocols.
`,
    },
    {
      label: "Spam and abuse detection",
      detailMD: `
Detect link farms, cloaking, malware pages, phishing, keyword stuffing, scraped content, and hacked sites. Feed spam scores into both indexing decisions and ranking so unsafe or low-quality pages do not dominate results.
`,
    },
    {
      label: "Query abuse and scraping protection",
      detailMD: `
Rate-limit automated clients, detect result scraping, protect expensive query patterns, and isolate tenant or API traffic from consumer search. Use bot detection and quotas without harming legitimate accessibility or research use cases.
`,
    },
    {
      label: "Privacy of query and click logs",
      detailMD: `
Query logs can contain sensitive personal data. Minimize retention, anonymize or aggregate where possible, restrict access, separate raw logs from training datasets, and honor deletion and compliance requirements.
`,
    },
    {
      label: "Index poisoning prevention",
      detailMD: `
Attackers may try to manipulate ranking through artificial links, duplicate pages, or generated content. Use link-spam classifiers, site reputation, anomaly detection, manual review workflows, and robust ranking features.
`,
    },
    {
      label: "Control-plane authorization",
      detailMD: `
Internal crawl seeding, removal, index activation, and ranking rollout endpoints need strong identity, authorization, audit logs, and change management. A compromised control plane can change what the search engine shows.
`,
    },
  ],
  tradeoffs: {
    pros: [
      "Separation of offline indexing from online serving keeps search available during crawl or build delays.",
      "Document-sharded inverted indexes keep ranking features local and avoid common-term hot shards.",
      "Scatter-gather with replicas scales read traffic horizontally and gives predictable shard responsibilities.",
      "Immutable index generations make validation, canary rollout, and rollback operationally safe.",
      "Layered caching removes a large fraction of repeated query traffic from the expensive fan-out path.",
    ],
    cons: [
      "Document sharding can require very wide fan-out for uncached queries.",
      "Freshness is eventually consistent because crawling and index building are asynchronous.",
      "Petabyte-scale index storage and multiple replicas are expensive.",
      "Learned ranking improves relevance but adds feature, model, debugging, and latency complexity.",
      "Crawling the public web creates legal, safety, spam, and politeness obligations.",
    ],
    alternativesMD: `
Alternative one is term sharding, where each shard owns a subset of terms. It can reduce work for some rare terms but creates severe hot spots for common terms and makes document-level ranking features harder to combine.

Alternative two is a smaller vertical search engine such as product, code, or document search. It can use fewer shards, stronger structured filters, and simpler crawling, but the same inverted-index and ranking principles apply.

Alternative three is a purely neural retrieval system over embeddings. It can improve semantic matching, but it is not a replacement for web-scale lexical retrieval, freshness, exact phrase matching, and explainable filtering. A practical search engine often uses lexical retrieval first and neural reranking or hybrid retrieval later.
`,
    whenNotToUseMD: `
Do not build a web-scale search engine if the problem is only searching a small application database, a private document corpus, or a single website. Use a managed search service, a relational full-text index, Elasticsearch, OpenSearch, Solr, or a vector database depending on the corpus and query type. Web search is justified only when crawling, ranking, freshness, and global-scale serving are core product requirements.
`,
  },
  followUpQuestions: [
    {
      question: "Why shard the index by document rather than by term?",
      answerMD: `
Document sharding keeps all ranking features for a subset of documents local and avoids putting a common term such as the or news on one overloaded shard. The tradeoff is wide query fan-out, which is handled with replicas, deadlines, caching, and tiered retrieval.
`,
    },
    {
      question: "How do you keep the index fresh without making queries wait for crawling?",
      answerMD: `
Use an offline pipeline that publishes immutable index generations. High-priority pages flow through small delta segments quickly, while larger full rebuilds run periodically. Query serving uses the latest validated generation and never synchronously calls the crawler.
`,
    },
    {
      question: "What does a posting list contain?",
      answerMD: `
A posting list maps a term to documents that contain it. Each posting can include document id, term frequency, positions, field flags such as title or heading, and compact payloads. Lists are sorted, compressed, and equipped with skip data for fast retrieval.
`,
    },
    {
      question: "How do you handle duplicate or near-duplicate pages?",
      answerMD: `
Canonicalize URLs first, then use content hashes for exact duplicates and fingerprints such as SimHash for near duplicates. Keep one representative document for ranking, cluster alternatives, consolidate link signals, and avoid showing many copies in one result page.
`,
    },
    {
      question: "What happens if some index shards time out?",
      answerMD: `
The broker should use replica retries or hedged requests before the deadline. If a small number of shards still fail, the system can return partial results with degraded recall rather than timing out the whole page, while monitoring records the shard failure.
`,
    },
    {
      question: "Where does PageRank-style link analysis run?",
      answerMD: `
It runs offline over the extracted link graph, not in the query request. Batch jobs compute authority and spam-adjusted link features, write compact values to document feature stores, and serving rankers read those features during ranking.
`,
    },
    {
      question: "How would you support breaking-news freshness?",
      answerMD: `
Use high-priority crawl queues for trusted news sources, feeds and sitemaps, streaming processing, small delta indexes, and freshness-aware ranking. Keep the old base index active while fresh deltas are loaded and canaried.
`,
    },
  ],
  companyVariations: [
    {
      company: "Google",
      angleMD: `
Google interviewers will push on web-scale crawling, inverted-index design, scatter-gather latency, PageRank-style link analysis, freshness, duplicate detection, spam, and graceful degradation. Be precise about separating offline indexing from online serving.
`,
    },
    {
      company: "Microsoft",
      angleMD: `
Microsoft may frame this through Bing-scale search, enterprise search, compliance, Azure regional serving, freshness for news, and integration with knowledge panels or ads. Expect discussion of operational rollout, privacy, and abuse controls.
`,
    },
    {
      company: "Amazon",
      angleMD: `
Amazon may adapt the problem to product search. Emphasize indexing, query understanding, ranking features, availability, latency, and business metrics, while noting that product search has more structured filters than open web search.
`,
    },
    {
      company: "LinkedIn",
      angleMD: `
LinkedIn may connect this to people, jobs, posts, or feed search. Discuss freshness, access control, ranking signals, personalization boundaries, and how a smaller trusted corpus changes crawling and spam assumptions.
`,
    },
  ],
  relatedQuestions: [
    {
      slug: "autocomplete",
      note: "Search suggestions share query normalization, popularity signals, caches, and strict latency goals.",
    },
    {
      slug: "distributed-cache",
      note: "Popular queries, posting blocks, snippets, and ranking features rely heavily on layered caching.",
    },
    {
      slug: "key-value-store",
      note: "Crawl metadata, document features, and serving manifests need large-scale partitioned storage.",
    },
    {
      slug: "kafka",
      note: "Query logs, crawl events, and indexing deltas commonly flow through durable streaming pipelines.",
    },
    {
      slug: "metrics-collection",
      note: "Search quality, crawl freshness, shard latency, cache hit ratio, and index rollout all require strong observability.",
    },
  ],
  interviewTips: {
    commonMistakes: [
      "Treating Google Search as a single database full-text query.",
      "Forgetting that crawling and indexing are offline pipelines separate from the online query path.",
      "Sharding by term without discussing common-term hot spots and ranking complexity.",
      "Ignoring duplicate pages, spam, robots.txt, and crawl politeness.",
      "Promising real-time freshness for the entire web without explaining delta indexes and prioritization.",
      "Leaving ranking as magic instead of naming lexical, link, freshness, quality, and learned signals.",
    ],
    redFlags: [
      "No inverted index or posting-list explanation.",
      "No scatter-gather fan-out and merge path.",
      "No concrete capacity numbers for documents, index size, QPS, or shard latency.",
      "No rollback or validation plan for new index generations.",
      "No strategy for crawler traps, duplicate content, or public-web abuse.",
    ],
    expectations: [
      "Draw two paths: offline crawl and indexing, plus online query serving.",
      "Explain document processing and how terms become compressed posting lists.",
      "Use document sharding, query fan-out, local top K, global merge, and staged ranking.",
      "State capacity assumptions in petabytes, shards, peak QPS, and latency budgets.",
      "Discuss PageRank-style link analysis, learned ranking, freshness, caching, and failure handling.",
      "Call out politeness, robots compliance, spam, and privacy as first-class concerns.",
    ],
    communicationMD: `
Lead with the split between offline indexing and online serving. Then draw the online request path because interviewers care about latency: cache, API, broker, shards, merge, rank, snippets. After that, draw the crawler and index builder that feed versioned generations into serving. Use numbers early so your sharding and latency choices feel grounded rather than hand-wavy.
`,
  },
  revisionNotesMD: `
- Google Search has two major systems: an offline crawler and indexing pipeline, and an online low-latency query serving path.
- Crawling uses a frontier with URL deduplication, per-host politeness, robots compliance, priority scheduling, and freshness-based recrawl intervals.
- Document processing parses HTML, extracts text and links, canonicalizes URLs, detects language, filters spam, and clusters exact or near duplicates.
- The inverted index maps terms to compressed posting lists containing document ids, positions, term frequency, field flags, and skip data.
- Document sharding is the usual HLD answer: each shard owns a subset of documents and all terms for those documents. Queries scatter to shard replicas and gather local top K results.
- Ranking combines lexical relevance, PageRank-style link authority, anchor text, freshness, location, quality, spam signals, and learned ranking models in stages.
- For 50B documents, 20 KB document representation, and 20 KB index contribution per document, plan for roughly 1 PB document store, 1 PB inverted index, and 6 to 9 PB with replicas and overhead.
- For 500K peak QPS and 30 percent result-cache hits, roughly 350K QPS still needs the online fan-out path.
- Keep per-shard work bounded to about 15 to 25ms and use deadlines, hedged requests, replicas, and partial degradation for tail latency.
- Index generations are immutable. Use delta segments for freshness, periodic full rebuilds for correctness, canary activation, and rollback.
`,
  flashcards: [
    {
      front: "What is the core data structure behind web search?",
      back: "An inverted index that maps each term to compressed posting lists of documents containing that term.",
    },
    {
      front: "Why separate offline indexing from online serving?",
      back: "Crawling and index building are slow and failure-prone, while query serving needs tight latency and high availability from validated index generations.",
    },
    {
      front: "Why is document sharding common for search indexes?",
      back: "It keeps document features local and avoids common-term hot shards, at the cost of wider query fan-out.",
    },
    {
      front: "What does the query broker do?",
      back: "It scatters the query to shard replicas, gathers local top K candidates, merges them, and enforces deadlines or hedged retries.",
    },
    {
      front: "How does the crawler avoid overloading websites?",
      back: "It uses per-host politeness queues, robots.txt rules, crawl budgets, backoff, and scheduled recrawl intervals.",
    },
    {
      front: "Where is PageRank-style analysis computed?",
      back: "Offline over the link graph, then stored as compact authority features used by online ranking.",
    },
    {
      front: "How are fresh pages added without a full rebuild?",
      back: "They flow into small delta index segments that are loaded alongside the base generation until later compaction or full rebuild.",
    },
    {
      front: "Why cache full search results?",
      back: "Popular and navigational queries repeat often, so short-lived result caching can remove a large fraction of expensive shard fan-out.",
    },
    {
      front: "What happens when a few shards miss the deadline?",
      back: "The broker can use replicas or hedged requests, then return degraded partial results if necessary rather than timing out the whole page.",
    },
  ],
  quiz: [
    {
      question: "What is the main purpose of an inverted index in web search?",
      options: ["Store user sessions", "Map terms to posting lists of documents", "Schedule crawler politeness delays", "Render HTML result pages"],
      answerIndex: 1,
      explanationMD: `
The inverted index maps each term to documents containing that term, with additional data such as frequency, positions, fields, and skip blocks for efficient retrieval.
`,
    },
    {
      question: "Why is document sharding often preferred over term sharding for a web search HLD?",
      options: ["It eliminates all fan-out", "It makes every query cacheable", "It keeps document features local and avoids common-term hot shards", "It removes the need for ranking"],
      answerIndex: 2,
      explanationMD: `
Document sharding stores all terms for a subset of documents, making ranking features local and avoiding one overloaded shard for common terms. The tradeoff is broad scatter-gather fan-out.
`,
    },
    {
      question: "Which work should be outside the synchronous user query path?",
      options: ["Crawling and index building", "Reading posting lists from serving shards", "Merging local top K results", "Returning snippets to the client"],
      answerIndex: 0,
      explanationMD: `
Crawling, parsing, deduplication, link analysis, and index building are offline or asynchronous workflows. Query serving should use already validated and loaded index generations.
`,
    },
    {
      question: "What is the best way to handle a bad newly built index generation?",
      options: ["Overwrite the old index immediately", "Block all queries until it is fixed", "Canary, validate, and roll back to the previous generation if needed", "Ask crawlers to slow down"],
      answerIndex: 2,
      explanationMD: `
Index generations should be immutable and versioned. Serving clusters can canary a new generation and roll back to the previous manifest if quality, latency, or correctness checks fail.
`,
    },
    {
      question: "For 50B documents and 2,000 primary document shards, how many documents are in each primary shard on average?",
      options: ["25K documents", "250K documents", "25M documents", "25B documents"],
      answerIndex: 2,
      explanationMD: `
50B divided by 2,000 is 25M documents per primary shard before replicas.
`,
    },
    {
      question: "Which signal is typically computed offline from the link graph?",
      options: ["PageRank-style authority", "HTTP request id", "Client TCP retransmits", "CSS rendering time"],
      answerIndex: 0,
      explanationMD: `
PageRank-style authority requires graph computation over links between documents, so it is computed offline and stored as a ranking feature.
`,
    },
    {
      question: "Why can full-result caching be valuable even for a very large search engine?",
      options: ["Every query is unique", "Popular and navigational queries repeat frequently", "Caching removes the need for an index", "Caching replaces robots.txt"],
      answerIndex: 1,
      explanationMD: `
Search traffic is skewed. Repeated popular queries can be served from short-lived caches, reducing expensive fan-out to index shards.
`,
    },
  ],
  cheatSheetMD: `
**Goal**: crawl the web, build a fresh inverted index, and serve ranked search results under tight latency budgets.

**Offline path**: URL discovery to crawl frontier to polite fetchers to document processing to deduplication to link graph to index builder to immutable index generations.

**Online path**: client to edge or result cache to Search API to Query Broker to document-sharded index replicas to merge to ranking and snippets to response.

**Crawler**: prioritize URLs by importance and freshness, deduplicate normalized URLs, respect robots.txt, enforce per-host politeness, avoid traps, and schedule recrawls based on change rate and demand.

**Index**: terms map to compressed posting lists containing doc ids, term frequency, positions, fields, and skip data. Store as immutable segments with periodic merges and delta updates.

**Sharding**: document sharding is the default. Each shard returns local top K; the broker merges global candidates. Use replicas, deadlines, hedging, and partial degradation for tail latency.

**Ranking**: combine BM25-like lexical relevance, phrase and field matches, anchor text, PageRank-style authority, freshness, location, spam and quality signals, and learned ranking stages.

**Capacity**: 50B documents with 20 KB document representation and 20 KB index data each is about 1 PB document store plus 1 PB inverted index. With 3 replicas and overhead, plan for 6 to 9 PB.

**Traffic**: 100K average QPS and 500K peak QPS are plausible interview-scale numbers. If 30 percent hits full-result cache, about 350K peak QPS still enters scatter-gather serving.

**Latency**: target under 200ms p95. Keep shard work around 15 to 25ms, broker fan-out around 35ms, and reserve time for ranking, snippets, rendering, and network overhead.

**Freshness**: use high-priority recrawls and delta indexes for fresh content, plus periodic full rebuilds for correctness. Query serving should use the latest validated generation and never wait on crawlers.

**Reliability**: validate index generations, canary activation, support rollback, route around slow shards, and keep lexical ranking fallbacks when expensive ranking features fail.
`,
  references: [
    {
      title: "The Anatomy of a Large-Scale Hypertextual Web Search Engine",
      kind: "Paper",
      url: "https://research.google/pubs/the-anatomy-of-a-large-scale-hypertextual-web-search-engine/",
      author: "Sergey Brin and Lawrence Page",
    },
    {
      title: "Introduction to Information Retrieval",
      kind: "Book",
      url: "https://nlp.stanford.edu/IR-book/",
      author: "Christopher D. Manning, Prabhakar Raghavan, and Hinrich Schutze",
    },
    {
      title: "Web Search for a Planet: The Google Cluster Architecture",
      kind: "Paper",
      url: "https://research.google/pubs/web-search-for-a-planet-the-google-cluster-architecture/",
      author: "Luiz Andre Barroso, Jeffrey Dean, and Urs Holzle",
    },
    {
      title: "The Tail at Scale",
      kind: "Paper",
      url: "https://research.google/pubs/the-tail-at-scale/",
      author: "Jeffrey Dean and Luiz Andre Barroso",
    },
    {
      title: "Lucene Scoring and Indexing Documentation",
      kind: "Docs",
      url: "https://lucene.apache.org/core/",
      author: "Apache Lucene",
    },
  ],
};
