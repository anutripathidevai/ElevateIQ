import type { SDQuestionContent } from "../types";

export const facebookFeedContent: SDQuestionContent = {
  slug: "facebook-feed",
  statementMD: `
Design Facebook Feed, the personalized home feed that shows posts from friends, followed pages, groups, recommendations, and ads. The system must ingest new posts and engagement actions, generate relevant candidates, rank them with machine learning, and return a fresh, deduplicated feed page within a tight latency budget.

At interview scale, assume billions of daily active users, hundreds of millions of new posts per day, tens of billions of likes and comments per day, and a read path that is far hotter than the post creation path. The hard part is not storing posts chronologically. The crux is feed ranking: picking candidates from the social graph, hydrating ranking features, scoring them quickly, mixing organic and ads, honoring privacy, and keeping cached ranked post ids fresh.

A strong design uses hybrid fanout. Most ordinary producers push recent post ids into follower feed caches, while high-degree pages, celebrities, and large groups are pulled at read time to avoid enormous fanout storms. Media is stored in an object store and served by CDN, while likes, comments, shares, hides, and seen-state flow through an action store and event pipeline that continuously updates ranking features.
`,
  businessUseCaseMD: `
The feed is the primary engagement surface for a social network. It keeps users informed about friends, communities, creators, news, entertainment, and commerce while supporting monetization through relevant ads.

For the business, ranking quality directly affects retention, session length, creator distribution, ad revenue, and trust. A feed that is only chronological misses important updates and is easy to spam; a feed that over-ranks stale or low-quality posts loses user confidence.
`,
  functionalRequirements: [
    "Return a personalized ranked feed page for a user with pagination and refresh support.",
    "Ingest posts from friends, pages, groups, and creators with text and media attachments.",
    "Generate candidates from social graph edges, group membership, followed pages, recommendations, and friend-of-friend signals.",
    "Rank candidates using freshness, affinity, engagement, content quality, viewer preferences, and policy constraints.",
    "Record engagement actions such as likes, comments, shares, reactions, hides, reports, clicks, dwell time, and impressions.",
    "Deduplicate posts across surfaces and avoid showing already seen content repeatedly.",
    "Interleave organic posts and ads while respecting frequency caps and ad relevance.",
    "Serve media through object storage and CDN without putting blobs on the feed API path.",
  ],
  nonFunctionalRequirements: [
    {
      label: "Latency",
      detailMD: `
The first feed page should return in about 200ms p99 at the regional service boundary. Allocate roughly 20ms to gateway and auth, 30ms to feed cache lookup, 60ms to candidate and feature hydration, 50ms to ranking and interleaving, and the rest to serialization and network overhead. Scrolling pagination can tolerate slightly higher latency if it is prefetched.
`,
    },
    {
      label: "Availability",
      detailMD: `
Feed reads should target 99.99 percent availability or better. If ranking, ads, or engagement aggregation is degraded, the system should fall back to cached ranked post ids, simplified models, or chronological recent posts rather than showing an error.
`,
    },
    {
      label: "Read-heavy scalability",
      detailMD: `
Feed reads dominate writes. The design must scale feed cache reads, feature lookups, ranking calls, and media URL hydration independently. Read paths should avoid synchronous fanout, large graph scans, and joins across unbounded tables.
`,
    },
    {
      label: "Freshness versus relevance",
      detailMD: `
Users expect recent posts to appear quickly, but the best feed is not purely chronological. The system should update feed caches when friends post, pull very high-degree sources on demand, and let ranking balance recency against predicted engagement, relationship strength, and quality.
`,
    },
    {
      label: "Privacy and correctness",
      detailMD: `
Visibility rules are mandatory. A post should never appear to a viewer who is not allowed to see it, even if a stale feed cache contains the post id. The final hydration step must re-check audience, blocks, deletion state, group membership, and policy restrictions.
`,
    },
    {
      label: "Ranking quality observability",
      detailMD: `
The system needs online metrics, offline evaluation, A/B tests, feature freshness monitoring, and model version tracking. Ranking regressions can reduce engagement or increase harmful content even when infrastructure metrics look healthy.
`,
    },
    {
      label: "Cost efficiency",
      detailMD: `
Scoring every possible post for every request is too expensive. Use hybrid fanout, candidate pruning, cached ranked ids, approximate counters, batched feature computation, and tiered model execution to reserve heavy ranking for the most promising candidates.
`,
    },
  ],
  capacityEstimation: {
    assumptionsMD: `
Assume 2B daily active users. Each user makes about 20 feed page requests per day across app opens, refreshes, and infinite scroll. Each feed page returns 25 items. The system receives 300M new posts per day, 35 percent of posts include media, and the average media original is 2 MB before derived thumbnails and video renditions.

Assume 95 percent of posts come from ordinary users, pages, or groups that can be pushed to an average of 300 recipient feed caches. The remaining 5 percent are high-degree producers and are pulled at read time. Engagement volume is 20B actions per day. Cache each active user with about 500 ranked post ids, storing 16 bytes per id plus metadata and replication overhead.
`,
    metrics: [
      {
        label: "Daily active users",
        value: "2B users",
        note: "Large social-network scale with global traffic",
      },
      {
        label: "Feed page reads",
        value: "40B requests per day",
        note: "2B users times 20 feed page requests per day",
      },
      {
        label: "Average feed read QPS",
        value: "463K requests per second",
        note: "40B divided by 86,400 seconds",
      },
      {
        label: "Peak feed read QPS",
        value: "4.6M requests per second",
        note: "10x peak over average during regional traffic spikes",
      },
      {
        label: "New posts",
        value: "300M posts per day",
        note: "About 3,500 post writes per second average and 35,000 peak",
      },
      {
        label: "Push fanout inserts",
        value: "85B feed-cache inserts per day",
        note: "95 percent of 300M posts times 300 recipients",
      },
      {
        label: "Average fanout write QPS",
        value: "990K inserts per second",
        note: "85B divided by 86,400 seconds before batching and coalescing",
      },
      {
        label: "Engagement actions",
        value: "20B actions per day",
        note: "Likes, comments, shares, reactions, hides, reports, clicks, and impressions",
      },
      {
        label: "Hot feed cache footprint",
        value: "50 to 100 TB",
        note: "2B users times 500 ids times 16 bytes is 16 TB raw, then metadata and replication",
      },
      {
        label: "Hot action-store retention",
        value: "500 TB replicated for 30 days",
        note: "20B actions per day times 200 bytes times 30 days plus indexes and replicas",
      },
      {
        label: "Media ingest",
        value: "210 TB per day raw originals",
        note: "105M media posts per day times 2 MB, before thumbnails, transcoding, and replicas",
      },
    ],
    calculationsMD: `
- Feed reads: 2B users times 20 feed page requests per day is 40B requests per day. 40B divided by 86,400 seconds is about 463K average read QPS. A 10x regional peak gives about 4.6M read QPS.
- Items served: 40B feed pages times 25 items is 1T feed items returned per day. Ranking cannot score the entire universe online for each request, so the system must use candidate pruning and cached ranked post ids.
- Post writes: 300M posts per day divided by 86,400 seconds is about 3,500 average post writes per second. With a 10x peak, plan for about 35,000 post writes per second.
- Hybrid fanout: 95 percent of 300M posts is 285M push-fanout posts. 285M times 300 average recipients is 85.5B feed-cache inserts per day, or about 990K inserts per second average before batching.
- Engagement writes: 20B actions per day divided by 86,400 seconds is about 231K action writes per second average, with multi-million QPS peaks for viral events.
- Feed cache: 2B users times 500 cached post ids times 16 bytes is 16 TB raw ids. Add rank scores, cursors, timestamps, model versions, Redis or key-value overhead, and replication to reserve roughly 50 to 100 TB.
- Action storage: 20B actions per day times 200 bytes is 4 TB raw per day. Thirty days is 120 TB raw; with replicas, indexes, and compaction overhead, plan for about 500 TB of hot action data.
- Media: 35 percent of 300M posts is 105M media posts per day. At 2 MB each, originals require about 210 TB per day before derived formats, thumbnails, CDN cache, and object-store replication.
`,
  },
  apiDesign: {
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/feed",
        descriptionMD: `
Returns a personalized ranked feed page for the authenticated viewer. The cursor encodes position, rank version, and freshness watermark rather than exposing raw offsets.
`,
        request: `
GET /api/v1/feed?limit=25&cursor=rank_57_page_2
Authorization: Bearer viewer_token
`,
        response: `
{
  "items": [
    {
      "postId": "post_901",
      "authorId": "user_42",
      "source": "friend",
      "rankReason": "close friend and active discussion",
      "createdAt": "2026-07-26T06:45:00Z",
      "media": [
        { "mediaId": "media_88", "cdnUrl": "https://cdn.example.com/m/media_88.jpg" }
      ],
      "viewerState": { "seen": false, "liked": false }
    }
  ],
  "nextCursor": "rank_57_page_3",
  "rankVersion": "ranker_v57",
  "generatedAt": "2026-07-26T07:10:00Z"
}
`,
        statusCodes: [
          { code: 200, meaning: "Ranked feed page returned" },
          { code: 401, meaning: "Authentication required" },
          { code: 429, meaning: "Client is requesting too aggressively" },
          { code: 503, meaning: "Feed unavailable after fallback attempts" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/posts",
        descriptionMD: `
Creates a post, persists metadata, attaches uploaded media ids, and emits a fanout event. The API does not synchronously update every follower feed cache.
`,
        request: `
{
  "authorId": "user_42",
  "audience": "friends",
  "text": "Launching the new project today",
  "mediaIds": ["media_88"],
  "clientMutationId": "client_abc_123"
}
`,
        response: `
{
  "postId": "post_901",
  "authorId": "user_42",
  "visibility": "friends",
  "createdAt": "2026-07-26T06:45:00Z",
  "fanoutState": "queued"
}
`,
        statusCodes: [
          { code: 201, meaning: "Post created" },
          { code: 400, meaning: "Invalid content, audience, or media reference" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Author is not allowed to post to this audience" },
          { code: 429, meaning: "Author or client is rate limited" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/feed/actions",
        descriptionMD: `
Records a viewer action on a feed item. Actions update the durable action log immediately and update counters, ranking features, and notifications asynchronously.
`,
        request: `
{
  "postId": "post_901",
  "actionType": "like",
  "viewerId": "user_77",
  "feedSessionId": "feed_sess_55",
  "clientEventTime": "2026-07-26T07:11:03Z"
}
`,
        response: `
{
  "actionId": "act_555",
  "postId": "post_901",
  "actionType": "like",
  "accepted": true
}
`,
        statusCodes: [
          { code: 202, meaning: "Action accepted" },
          { code: 400, meaning: "Invalid action" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Viewer cannot interact with this post" },
          { code: 409, meaning: "Duplicate idempotent action" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/feed/seen",
        descriptionMD: `
Stores seen-state and impressions so the next feed refresh can deduplicate items and ranking can learn which posts were actually exposed.
`,
        request: `
{
  "feedSessionId": "feed_sess_55",
  "seenPostIds": ["post_901", "post_812"],
  "lastVisibleAt": "2026-07-26T07:12:10Z"
}
`,
        response: `
{
  "accepted": true,
  "dedupeWindowHours": 48
}
`,
        statusCodes: [
          { code: 202, meaning: "Seen-state accepted" },
          { code: 400, meaning: "Malformed post id list" },
          { code: 401, meaning: "Authentication required" },
          { code: 413, meaning: "Too many ids in one request" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/posts/{postId}/comments",
        descriptionMD: `
Returns the top comments or a paginated comment thread for a post. Comments are not embedded unbounded in feed responses because viral posts can have millions of comments.
`,
        response: `
{
  "postId": "post_901",
  "comments": [
    { "commentId": "c_1", "authorId": "user_88", "text": "Congrats", "createdAt": "2026-07-26T07:14:00Z" }
  ],
  "nextCursor": "comments_page_2"
}
`,
        statusCodes: [
          { code: 200, meaning: "Comments returned" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Viewer cannot see this post" },
          { code: 404, meaning: "Post not found or deleted" },
        ],
      },
    ],
    notesMD: `
The feed read API should return ranked post envelopes and media URLs, not raw media bytes. Mutation APIs publish events so fanout, notifications, counters, and ranking-feature updates happen asynchronously. The final feed hydration step must still enforce visibility because cached ranked ids can be stale.
`,
  },
  databaseDesign: {
    schemaMD: `
The logical model separates content, graph, feed cache, and actions. Posts and media are durable content records. The social graph answers who can produce candidates for whom. Feed cache stores precomputed ranked post ids for fast reads. The action store captures every like, comment, share, hide, report, click, dwell event, and impression used by ranking.

At large scale these are not one relational database. They are specialized stores: a graph or TAO-like store for edges, a wide-column or key-value post store, a distributed cache or key-value feed cache, a write-optimized action log, and object storage plus CDN for media.
`,
    tables: [
      {
        name: "social_edges",
        columns: [
          { name: "source_id", type: "bigint", note: "Viewer, page follower, group member, or friend source" },
          { name: "target_id", type: "bigint", note: "Friend, page, group, creator, or blocked user" },
          { name: "edge_type", type: "varchar(32)", note: "Friend, follow, group_member, block, mute, close_friend" },
          { name: "state", type: "varchar(20)", note: "Active, pending, blocked, muted, or deleted" },
          { name: "affinity_score", type: "float", note: "Precomputed relationship strength feature" },
          { name: "updated_at", type: "timestamp", note: "Used for graph freshness and cache invalidation" },
          { name: "shard_key", type: "bigint", note: "Hash or range shard for adjacency-list storage" },
        ],
      },
      {
        name: "posts",
        columns: [
          { name: "post_id", type: "bigint", note: "Primary key generated by a distributed id service" },
          { name: "author_id", type: "bigint", note: "User, page, group, or creator that produced the post" },
          { name: "author_type", type: "varchar(20)", note: "User, page, group, or recommendation source" },
          { name: "created_at", type: "timestamp", note: "Primary recency signal and partition dimension" },
          { name: "audience", type: "varchar(32)", note: "Public, friends, group, custom, or private" },
          { name: "text_ref", type: "varchar(256)", note: "Inline text or pointer to large content storage" },
          { name: "media_ids", type: "json", note: "Small ordered list of object-store media ids" },
          { name: "quality_score", type: "float", note: "Offline or nearline content-quality prior" },
          { name: "visibility_state", type: "varchar(20)", note: "Active, deleted, demoted, blocked, or under_review" },
        ],
      },
      {
        name: "feed_cache_entries",
        columns: [
          { name: "user_id", type: "bigint", note: "Partition key for one viewer feed cache" },
          { name: "rank_version", type: "varchar(32)", note: "Model and policy version used to produce this ordering" },
          { name: "position", type: "int", note: "Ranked position within the cached window" },
          { name: "post_id", type: "bigint", note: "Candidate post id, hydrated at read time" },
          { name: "rank_score", type: "float", note: "Score used for ordering and debugging" },
          { name: "reason", type: "varchar(64)", note: "Friend activity, group update, page follow, recommendation, or ad slot" },
          { name: "generated_at", type: "timestamp", note: "Cache freshness watermark" },
          { name: "expires_at", type: "timestamp", note: "Short TTL to prevent stale feeds from dominating" },
        ],
      },
      {
        name: "engagement_events",
        columns: [
          { name: "event_id", type: "uuid", note: "Idempotency and dedupe key" },
          { name: "post_id", type: "bigint", note: "Partition or clustering dimension for post-centric reads" },
          { name: "actor_id", type: "bigint", note: "User that produced the action" },
          { name: "action_type", type: "varchar(32)", note: "Like, comment, share, hide, report, click, impression, dwell" },
          { name: "created_at", type: "timestamp", note: "Event time for time-windowed features" },
          { name: "parent_comment_id", type: "bigint nullable", note: "Threading for comment replies" },
          { name: "payload_ref", type: "varchar(256) nullable", note: "Pointer to comment text or larger payload" },
          { name: "source_surface", type: "varchar(32)", note: "Feed, profile, group, notification, or search" },
        ],
      },
      {
        name: "media_objects",
        columns: [
          { name: "media_id", type: "bigint", note: "Primary id referenced by posts" },
          { name: "owner_id", type: "bigint", note: "Uploader for access checks and deletion" },
          { name: "object_uri", type: "varchar(512)", note: "Object-store location for the original" },
          { name: "renditions", type: "json", note: "CDN paths for thumbnails, resized images, or video variants" },
          { name: "content_hash", type: "varchar(128)", note: "Deduplication and abuse matching" },
          { name: "moderation_state", type: "varchar(20)", note: "Clean, blocked, pending, or sensitive" },
          { name: "created_at", type: "timestamp", note: "Upload time" },
        ],
      },
    ],
    indexesMD: `
- **social_edges.source_id, edge_type** supports candidate generation from the viewer outward.
- **social_edges.target_id, edge_type** supports reverse fanout to followers when a producer posts.
- **posts.author_id, created_at** supports pulling recent posts from high-degree pages, groups, and creators.
- **feed_cache_entries.user_id, position** supports fast ordered reads of cached ranked post ids.
- **engagement_events.post_id, created_at** supports post-centric counters, comment fetches, and ranking features.
- **engagement_events.actor_id, created_at** supports viewer history, seen-state, and dedupe.
- **media_objects.content_hash** helps deduplicate uploads and match known-bad media.
`,
    relationshipsMD: `
A feed item references a post id. The post references an author and optional media ids. Social edges define whether the author or container is eligible for a viewer. Engagement events reference both actor and post. The feed serving path should not join these tables directly in a relational sense; it should perform bounded point lookups and batched hydration from stores optimized for each access pattern.
`,
    noSqlAlternativesMD: `
Use a graph or adjacency-list store for social edges, partitioned by source id and replicated by region. Use a wide-column or key-value store for posts, partitioned by post id with secondary views by author and time. Use Redis, Memcached, or a custom distributed cache for feed_cache_entries, storing compact ranked post-id arrays per user. Use Kafka or Pulsar plus a columnar lake or OLAP store for engagement events, with nearline feature stores for ranking.

Media belongs in object storage, not in the post database. Store originals and renditions in an object store, serve them through CDN, and keep only ids, moderation state, hashes, and URLs in metadata stores.
`,
  },
  architecture: {
    width: 960,
    height: 560,
    nodes: [
      { id: "client", label: "Client Apps", kind: "client", x: 70, y: 250, sublabel: "Mobile, web" },
      { id: "media-cdn", label: "Media CDN", kind: "cdn", x: 220, y: 100, sublabel: "Images, video" },
      { id: "api-gateway", label: "API Gateway", kind: "gateway", x: 220, y: 250, sublabel: "Auth, rate limits" },
      { id: "feed-api", label: "Feed API", kind: "service", x: 390, y: 250, sublabel: "Read, hydrate" },
      { id: "media-store", label: "Object Store", kind: "storage", x: 390, y: 100, sublabel: "Originals, renditions" },
      { id: "event-bus", label: "Event Bus", kind: "queue", x: 390, y: 410, sublabel: "Kafka, Pulsar" },
      { id: "fanout-workers", label: "Fanout Workers", kind: "worker", x: 220, y: 410, sublabel: "Push for normal users" },
      { id: "feed-cache", label: "Ranked Feed Cache", kind: "cache", x: 550, y: 90, sublabel: "Post-id windows" },
      { id: "candidate-service", label: "Candidate Service", kind: "service", x: 550, y: 250, sublabel: "Friends, pages, groups" },
      { id: "graph-store", label: "Social Graph Store", kind: "database", x: 550, y: 410, sublabel: "Edges, affinity" },
      { id: "action-store", label: "Action Store", kind: "database", x: 720, y: 90, sublabel: "Likes, comments, seen" },
      { id: "ranker", label: "Ranking Service", kind: "service", x: 720, y: 250, sublabel: "ML scoring" },
      { id: "post-store", label: "Post Store", kind: "database", x: 720, y: 410, sublabel: "Posts, metadata" },
      { id: "ads-service", label: "Ads Service", kind: "external", x: 890, y: 250, sublabel: "Sponsored candidates" },
    ],
    edges: [
      { from: "client", to: "api-gateway", label: "feed, post, action APIs" },
      { from: "client", to: "media-cdn", label: "fetch media" },
      { from: "media-cdn", to: "media-store", label: "origin miss" },
      { from: "api-gateway", to: "feed-api", label: "authenticated request" },
      { from: "feed-api", to: "feed-cache", label: "read ranked ids" },
      { from: "feed-cache", to: "feed-api", label: "cache hit" },
      { from: "feed-api", to: "candidate-service", label: "cache miss or refresh" },
      { from: "candidate-service", to: "graph-store", label: "eligible producers" },
      { from: "candidate-service", to: "post-store", label: "recent posts" },
      { from: "candidate-service", to: "action-store", label: "features and seen-state" },
      { from: "candidate-service", to: "ranker", label: "candidate set" },
      { from: "ranker", to: "action-store", label: "feature hydration" },
      { from: "ranker", to: "ads-service", label: "ad candidates" },
      { from: "ranker", to: "feed-api", label: "ranked mixed list" },
      { from: "feed-api", to: "post-store", label: "hydrate and create posts" },
      { from: "feed-api", to: "media-store", label: "issue media refs", dashed: true },
      { from: "feed-api", to: "event-bus", label: "posts, actions, impressions", dashed: true },
      { from: "event-bus", to: "fanout-workers", label: "async fanout", dashed: true },
      { from: "fanout-workers", to: "graph-store", label: "followers" },
      { from: "fanout-workers", to: "feed-cache", label: "push ranked ids", dashed: true },
      { from: "fanout-workers", to: "post-store", label: "post metadata" },
    ],
    captionMD: `
The read path first tries the ranked feed cache. On a miss or refresh, candidate generation reads the graph, post store, and action signals, then the ranker scores candidates and mixes organic posts with ads. Post creation, impressions, actions, and fanout are asynchronous through the event bus.
`,
  },
  architectureNotesMD: `
The architecture is split around the ranking critical path. The Feed API is stateless and handles authentication, pagination, hydration, visibility checks, and response shaping. The ranked feed cache stores compact post-id windows so the common read path avoids graph expansion and heavy model calls. When cache entries are stale or exhausted, the candidate service rebuilds candidates from pushed feed ids, recent posts from high-degree sources, graph edges, group membership, and recommendations.

Fanout is hybrid. Normal users, small pages, and ordinary groups push new post ids to followers through fanout workers because the recipient set is bounded. Celebrity pages, large public groups, and viral sources are pulled at read time because pushing to tens or hundreds of millions of followers would dominate write capacity and create hot shards.

Ranking and aggregation are distinct. The ranker scores candidates using ML features from the action store, graph store, and post metadata. The aggregator applies business rules: dedupe by post and story, remove seen or hidden items, enforce privacy, apply freshness windows, reserve ad slots, and return media references that clients load through the CDN.
`,
  requestFlow: [
    {
      title: "Feed request enters the platform",
      detailMD: `
The client calls the feed endpoint with an auth token, cursor, device context, and limit. The API gateway authenticates the viewer, applies rate limits, and routes to a regional Feed API instance close to the user.
`,
    },
    {
      title: "Feed API checks ranked feed cache",
      detailMD: `
The Feed API reads the viewer's cached ranked post-id window. If enough fresh ids remain for the requested page, it skips expensive graph expansion and ranking. The cursor ensures stable pagination across refreshes and hides already served items.
`,
    },
    {
      title: "Candidate generation expands eligible sources",
      detailMD: `
On a cache miss or refresh, the candidate service gathers post candidates from friends, followed pages, groups, recent interactions, friend-of-friend activity, and recommendation sources. It reads social graph edges and affinity scores, but it caps each source to keep candidate size bounded.
`,
    },
    {
      title: "Hybrid fanout merges push and pull candidates",
      detailMD: `
For ordinary producers, candidate ids are already pushed into recipient feed caches by fanout workers. For celebrities, high-degree pages, and large groups, the service pulls recent posts at read time. This avoids writing one viral post into millions of caches while preserving freshness.
`,
    },
    {
      title: "Features are hydrated for ranking",
      detailMD: `
The system fetches viewer-author affinity, post age, content quality, media type, recent engagement velocity, comment quality, hides, reports, dwell-time priors, viewer preferences, and seen-state. Feature retrieval is batched and bounded by strict timeouts.
`,
    },
    {
      title: "ML ranking scores candidates",
      detailMD: `
A tiered ranker first applies cheap filters and lightweight models, then uses a heavier model on the top candidates. The output estimates relevance, meaningful interaction probability, freshness value, negative feedback risk, and policy demotion signals.
`,
    },
    {
      title: "Aggregator applies feed rules",
      detailMD: `
The aggregator deduplicates related stories, removes blocked or deleted content, applies seen-state, enforces group and privacy rules, interleaves ads with organic posts, and ensures diversity across authors and content types.
`,
    },
    {
      title: "Response is hydrated and returned",
      detailMD: `
The Feed API performs final post hydration, checks visibility again, attaches media CDN URLs, comment previews, reaction summaries, and viewer state, then returns the page and next cursor. Large media is fetched directly from the CDN by the client.
`,
    },
    {
      title: "Events update the learning loop",
      detailMD: `
Impressions, clicks, dwell time, hides, reactions, comments, and shares are emitted to the event bus. Consumers update action stores, nearline features, counters, notification pipelines, and future fanout or cache refresh decisions.
`,
    },
  ],
  coreComponents: [
    {
      name: "Feed API",
      kind: "service",
      role: "Serves feed pages and coordinates hydration and fallback.",
      detailMD: `
The Feed API is stateless. It handles auth context, cursor validation, cache reads, final visibility checks, response shaping, and graceful degradation. It should not scan the social graph or run heavy ML directly; it delegates those tasks to specialized services.
`,
    },
    {
      name: "Candidate Generation Service",
      kind: "service",
      role: "Builds a bounded candidate set from many feed sources.",
      detailMD: `
Candidate generation combines pushed cache entries, recent posts from friends, followed pages, groups, friend-of-friend activity, recommendations, and pull-based high-degree sources. It must cap per-source output, deduplicate early, and prioritize candidates likely to survive ranking.
`,
    },
    {
      name: "Ranking Service",
      kind: "service",
      role: "Scores candidates using ML models and feature stores.",
      detailMD: `
The ranker predicts relevance and negative-feedback risk from graph affinity, content features, engagement velocity, freshness, viewer history, and policy signals. Production systems commonly use a cascade: cheap filters, lightweight ranker, heavier ranker, then business-rule reordering.
`,
    },
    {
      name: "Fanout Workers",
      kind: "worker",
      role: "Push post ids into recipient feed caches for bounded producers.",
      detailMD: `
Workers consume post-created events, look up eligible recipients, and insert post ids into feed caches for normal users and smaller pages or groups. They batch writes, skip inactive recipients when cost is too high, and avoid pushing high-degree producers.
`,
    },
    {
      name: "Ranked Feed Cache",
      kind: "cache",
      role: "Stores precomputed ranked post-id windows per active user.",
      detailMD: `
The cache stores compact lists of post ids, rank scores, rank version, generation time, and cursor metadata. It absorbs most feed reads and lets the system refresh feeds incrementally instead of regenerating a full ranking on every scroll.
`,
    },
    {
      name: "Social Graph Store",
      kind: "database",
      role: "Stores friend, follow, group, block, mute, and affinity edges.",
      detailMD: `
The graph store supports adjacency-list reads from viewer to followed entities and reverse reads from producer to followers for fanout. It also stores derived affinity features such as close friends, recent interactions, and muted relationships.
`,
    },
    {
      name: "Action Store",
      kind: "database",
      role: "Captures engagement, comments, counters, seen-state, and ranking signals.",
      detailMD: `
The action store receives high-volume writes for likes, comments, shares, hides, reports, impressions, and dwell events. It maintains raw logs, aggregates, and nearline features. Ranking should tolerate stale features but must not lose critical moderation or block signals.
`,
    },
    {
      name: "Media Store and CDN",
      kind: "storage",
      role: "Stores uploaded media and serves it outside the feed API.",
      detailMD: `
Original images and videos are written to object storage and processed into multiple renditions. CDN edges serve media to clients. Feed responses include metadata and CDN URLs, keeping blob transfer out of the ranking and feed service path.
`,
    },
  ],
  deepDives: [
    {
      topic: "Feed ranking is the central problem",
      detailMD: `
A chronological feed is easy to explain but weak for a large social network. A user may follow hundreds of friends, pages, and groups. Some sources post rarely and are highly important; others post frequently and are low value. The feed must rank for predicted value, not just recency.

A mature ranker uses many signals: relationship affinity, post freshness, content type, media quality, comments from close friends, click and dwell history, hides and reports, author quality, group membership, language, location, device, and explicit preferences. The serving system must hydrate these features quickly and degrade safely if some features are stale.

The strongest interview answer separates **candidate generation** from **ranking**. Candidate generation narrows millions of possible posts down to hundreds or thousands. Ranking scores those candidates with a latency budget. Aggregation then enforces dedupe, diversity, seen-state, privacy, ad slots, and policy constraints.
`,
    },
    {
      topic: "Hybrid fanout: push for most, pull for high-degree sources",
      detailMD: `
Pure pull means every feed read scans recent posts from all friends, pages, and groups. That is too slow for users with large graphs and too expensive for billions of reads. Pure push means every post is inserted into every follower cache. That explodes for celebrities, major pages, and large groups.

Hybrid fanout is the usual answer. Push ordinary posts to follower feed caches because the recipient set is bounded and reads become cheap. Pull high-degree sources at read time because their fanout would be massive. The producer can be classified dynamically using follower count, posting rate, engagement velocity, recipient activity, and queue pressure.

Hybrid fanout also improves freshness. A close friend's post can appear quickly through push, while a viral public page can be pulled and ranked when the user opens the app. The candidate service merges both sets and removes duplicates before scoring.
`,
    },
    {
      topic: "Candidate generation from graph, groups, pages, and friend-of-friend",
      detailMD: `
Candidate generation must be bounded. The system reads the viewer's active friends, close friends, pages, groups, recently interacted authors, and friend-of-friend or recommendation edges. For each source, it takes a small number of recent or high-quality posts and applies early filters for privacy, blocks, mutes, language, and policy.

Friend-of-friend is powerful but dangerous if unconstrained. It can discover socially relevant content, but it expands the graph rapidly and can leak private context. Use explicit public interactions, privacy-safe recommendations, and caps per reason. Keep explainable candidate reasons such as close friend commented or popular in group.

For groups, membership and moderation state are essential. A public group may allow broad discovery, while a private group requires strict membership checks during candidate generation and final hydration.
`,
    },
    {
      topic: "Feed cache, freshness, pagination, and seen-state",
      detailMD: `
The feed cache should store ranked post ids, not full post bodies. Full bodies change due to edits, deletes, privacy changes, comment counts, and media processing. Storing ids lets the serving path re-check visibility and hydrate current metadata.

Freshness is handled with short TTLs, cache refresh watermarks, and incremental insertion. New close-friend posts can be inserted near the top. Older cached items can remain for pagination as long as the cursor identifies the rank version. If the user pulls to refresh, the system can generate a new head while preserving scroll stability for older pages.

Seen-state prevents repetition. The client reports impressions and visible items, and the server records a dedupe window. The aggregator filters recently seen posts, but can still resurface important updates if comments or shares make them newly relevant.
`,
    },
    {
      topic: "Ads and organic interleaving",
      detailMD: `
Ads are not simply appended after organic ranking. The feed must reserve eligible slots, request ad candidates, score them for relevance and business constraints, then interleave them without damaging user experience. Frequency caps, advertiser budgets, user preferences, sensitive categories, and policy checks apply.

The organic ranker and ads ranker can be separate, but the final aggregator must compare them through a common utility function or slot policy. It should log why an ad was shown, how it competed with organic content, and whether the user engaged or hid it.

If ads infrastructure fails, organic feed should continue. If organic ranking fails, do not fill the entire feed with ads. Monetization must degrade behind core user experience.
`,
    },
    {
      topic: "Engagement action store and feature freshness",
      detailMD: `
Likes, comments, shares, hides, reports, impressions, clicks, and dwell time form the feedback loop for ranking. The write path is enormous, so the system records append-only events, computes aggregates asynchronously, and feeds nearline features back to ranking.

Some signals must be fresh. A report or hide should affect future ranking quickly. A viral comment burst may make a post more relevant. Use separate priority lanes: critical safety and negative feedback gets low-latency processing, while bulk counters and offline model training can lag.

Counters should be approximate when needed. Exact global like counts are less important than robust ranking features and low write latency. Use sharded counters, time-windowed aggregates, sketches, and batch compaction to avoid hot rows on viral posts.
`,
    },
  ],
  scaling: [
    {
      stage: "Prototype: thousands of users",
      detailMD: `
Start with a post store, simple friendship table, chronological query by followed author ids, and a basic ranking formula using recency and affinity. Store media in object storage and serve via CDN from day one. This proves product behavior but will not handle large graphs or high read volume.
`,
    },
    {
      stage: "Growth: millions of users",
      detailMD: `
Add asynchronous fanout workers, per-user feed caches, Redis or a key-value cache for ranked ids, action logging, and simple ML features. Split post creation from feed reads, and move comment and engagement writes to an event pipeline.
`,
    },
    {
      stage: "Large scale: hundreds of millions of users",
      detailMD: `
Introduce hybrid fanout, distributed graph storage, sharded action stores, nearline feature stores, ranking model cascades, online experiments, and regional feed caches. High-degree pages and large groups become pull-based sources with bounded candidate budgets.
`,
    },
    {
      stage: "Planet scale: billions of users",
      detailMD: `
Run multi-region active-active feed serving with local caches, replicated graph and post metadata, global media CDN, per-region ranking fleets, real-time feature pipelines, safety systems, and automated fallback tiers. Keep ranking quality, freshness, and policy enforcement observable per region and cohort.
`,
    },
  ],
  bottlenecks: [
    {
      issue: "Ranking latency from feature hydration",
      optimizationMD: `
Batch feature reads, keep online feature stores close to rankers, cache stable features such as affinity, use model cascades, and set strict deadlines. If slow features miss the deadline, rank with defaults rather than delaying the whole feed.
`,
    },
    {
      issue: "Celebrity and large-page fanout storms",
      optimizationMD: `
Classify high-degree producers as pull-based, cap fanout recipients, batch writes, prioritize active users, and update cached feed heads opportunistically. Pull recent posts from high-degree sources during candidate generation instead of writing them into every follower cache.
`,
    },
    {
      issue: "Viral post hot spots in action counters",
      optimizationMD: `
Use append-only event logs, sharded counters, time-windowed aggregates, and eventual compaction. Avoid a single row for like_count or comment_count. Cache popular post summaries and update them asynchronously.
`,
    },
    {
      issue: "Feed cache memory and hot shards",
      optimizationMD: `
Store compact post-id arrays, use TTLs, cache only active users deeply, shard by user id with virtual nodes, compress ids where possible, and regenerate inactive users on demand. Replicate hot shards and rebalance before regional events.
`,
    },
    {
      issue: "Duplicate or stale feed items",
      optimizationMD: `
Track seen-state, rank version, source reason, and post canonical id. Deduplicate during candidate merge and final aggregation. Re-check deletion, block, audience, and moderation state during hydration before returning the item.
`,
    },
    {
      issue: "Media bandwidth and origin pressure",
      optimizationMD: `
Serve media through CDN, pre-generate common renditions, use adaptive image and video formats, sign URLs when needed, and keep feed API responses to metadata only. Protect object storage with origin shielding and request coalescing.
`,
    },
  ],
  failureHandling: [
    {
      scenario: "Ranking service degraded or unavailable",
      strategyMD: `
Serve cached ranked ids if available. If cache is stale, fall back to a lightweight ranking formula using recency, affinity, and content quality. Mark the response with rank version for monitoring and shed heavy model traffic until the fleet recovers.
`,
    },
    {
      scenario: "Feed cache outage",
      strategyMD: `
Bypass the cache for a small percentage of users and rebuild from candidate generation with strict quotas. Use circuit breakers to protect graph, post, and action stores. Prefer returning a smaller but valid feed over stampeding all users into full regeneration.
`,
    },
    {
      scenario: "Fanout queue backlog",
      strategyMD: `
Feeds remain available through pull-based candidate generation and older cached ids. Workers prioritize close-friend and active-recipient fanout, skip inactive users temporarily, and catch up with batch compaction. Expose freshness lag to ranking and product metrics.
`,
    },
    {
      scenario: "Social graph store partition or replication lag",
      strategyMD: `
Use last-known graph snapshots for ranking while enforcing critical block and privacy edges from a strongly replicated safety path. If graph freshness is uncertain, bias toward not showing borderline private content.
`,
    },
    {
      scenario: "Action store or feature pipeline lag",
      strategyMD: `
Rank with stale or default engagement features, but process hides, reports, blocks, and deletes through a higher-priority safety lane. Alert on feature freshness because ranking quality can degrade silently.
`,
    },
    {
      scenario: "Media CDN or object-store failure",
      strategyMD: `
Return text and metadata with degraded media placeholders, route to alternate CDN origins, and avoid blocking feed ranking on media availability. Uploads can be retried or marked processing while feed reads continue.
`,
    },
  ],
  security: [
    {
      label: "Privacy and visibility enforcement",
      detailMD: `
Every returned item must pass final authorization: audience, friendship, group membership, blocks, mutes, deletions, geographic restrictions, age gates, and moderation state. Cached feed ids are only hints, never proof of authorization.
`,
    },
    {
      label: "Abuse, spam, and coordinated manipulation",
      detailMD: `
Detect spammy posting, fake engagement, bot actions, coordinated sharing, and malicious links. Downrank or remove abusive content, quarantine suspicious actions, and keep safety features fresher than ordinary engagement counters.
`,
    },
    {
      label: "Data minimization and retention",
      detailMD: `
Feed ranking uses sensitive behavioral data. Limit raw event retention, separate personally identifiable data from aggregate features, honor deletion requests, and restrict access to action logs and experiment data.
`,
    },
    {
      label: "Scraping and enumeration resistance",
      detailMD: `
Feed APIs expose valuable social content. Enforce authentication, per-user and per-device rate limits, bot detection, cursor integrity, response watermarking, and anomaly detection for large-scale scraping behavior.
`,
    },
    {
      label: "Ad and content integrity",
      detailMD: `
Ads and organic content must pass policy checks before serving. Maintain audit logs for ad selection, targeting eligibility, frequency caps, and sensitive-category exclusions. Do not let ads bypass feed visibility or safety checks.
`,
    },
    {
      label: "Media safety",
      detailMD: `
Scan uploaded media for malware, known-bad hashes, copyright policy signals, nudity, violence, and other sensitive categories. CDN URLs should respect takedowns quickly through invalidation or deny-list checks.
`,
    },
  ],
  tradeoffs: {
    pros: [
      "Hybrid fanout keeps ordinary feed reads fast while avoiding massive celebrity fanout writes.",
      "Ranked post-id caches reduce online graph expansion and ML scoring cost for the common path.",
      "Separating posts, graph, actions, media, and features lets each store scale for its access pattern.",
      "A ranking cascade balances model quality with strict p99 latency goals.",
      "Asynchronous action processing supports enormous engagement volume without blocking feed reads.",
    ],
    cons: [
      "Feed caches can become stale and require final visibility checks on every response.",
      "Ranking quality depends on complex feature freshness, model monitoring, and experimentation systems.",
      "Hybrid fanout introduces operational complexity and source-specific behavior.",
      "Pulling high-degree sources can increase read latency during cache misses or traffic spikes.",
      "Ads and policy interleaving make the final aggregation step harder to reason about than simple ranking.",
    ],
    alternativesMD: `
Alternative one is a pure chronological pull feed. It is simple and fresh for small products, but it degrades with large graphs, misses relevance, and makes every feed read expensive.

Alternative two is pure push fanout. It gives very fast reads for bounded graphs, but celebrity pages, large groups, and viral producers create enormous write amplification and hot shards.

Alternative three is fully on-demand ML ranking without per-user feed caches. It can be freshest and most personalized, but scoring hundreds of candidates for billions of read requests is usually too expensive and risky for tail latency.
`,
    whenNotToUseMD: `
Do not build this full architecture for a small community app, an internal activity stream, or a product where chronological order is the core requirement. Start with a simpler pull model and add caching, fanout, and ranking only when graph size, read traffic, and relevance needs justify the complexity.
`,
  },
  followUpQuestions: [
    {
      question: "Why is ranking harder than storing posts chronologically?",
      answerMD: `
A user may have thousands of eligible posts from friends, pages, groups, recommendations, and ads. The system must select what is most valuable now, not simply the newest item. It needs candidate generation, feature hydration, ML scoring, dedupe, privacy checks, seen-state, and business rules within a small latency budget.
`,
    },
    {
      question: "When do you push fanout versus pull at read time?",
      answerMD: `
Push when the producer has a bounded follower set, recipient activity is high enough to justify cache writes, and freshness matters. Pull when the producer has millions of followers, posts very frequently, or belongs to a large group or public page where fanout cost would overwhelm write capacity.
`,
    },
    {
      question: "What exactly is stored in the feed cache?",
      answerMD: `
Store ranked post ids, scores, rank version, source reason, generation time, cursor metadata, and expiration. Do not store full post bodies as the source of truth. Hydrate posts on read and re-check visibility, deletion, moderation, and viewer state.
`,
    },
    {
      question: "How do you keep the feed fresh without reranking everything?",
      answerMD: `
Use incremental cache updates for close-friend and high-value posts, short TTLs for cache heads, pull high-degree sources at request time, and refresh only the top window when the user opens or pulls to refresh. Preserve older rank versions for stable scrolling.
`,
    },
    {
      question: "How should seen-state affect ranking?",
      answerMD: `
Seen-state should filter or demote recently exposed posts to reduce repetition, but the system can resurface important posts if new comments, shares, or close-friend activity make them newly relevant. Seen-state must be stored asynchronously but applied before final aggregation.
`,
    },
    {
      question: "How do ads fit into the feed design?",
      answerMD: `
Ads are generated and scored separately, then interleaved by the final aggregator using slot rules, frequency caps, relevance thresholds, policy checks, and budget constraints. Organic feed should continue if ads fail, and ads should never bypass privacy or safety constraints.
`,
    },
    {
      question: "How do you handle privacy changes after a post is cached?",
      answerMD: `
Treat cached post ids as candidates only. During hydration, check current audience, block, group membership, deletion, and moderation state. Also send invalidation events to feed caches for deletes, blocks, group removals, and policy takedowns, but correctness should not rely only on invalidation.
`,
    },
  ],
  companyVariations: [
    {
      company: "Meta",
      angleMD: `
Meta interviewers are likely to focus on News Feed ranking, graph scale, hybrid fanout, feature freshness, integrity systems, privacy checks, and ads interleaving. Be prepared to explain why the core is ML ranking plus aggregation, not a chronological timeline.
`,
    },
    {
      company: "LinkedIn",
      angleMD: `
LinkedIn may frame this around professional network feeds, creator posts, company pages, job-related content, notification-driven engagement, and relevance versus recency. Discuss graph affinity, follow edges, feed explanations, and quality controls for low-frequency but high-value updates.
`,
    },
    {
      company: "Google",
      angleMD: `
Google tends to probe ML serving, feature stores, global tail latency, experimentation, and large-scale data pipelines. Expect follow-ups on ranking cascades, candidate pruning, freshness metrics, and how to evaluate quality beyond infrastructure uptime.
`,
    },
    {
      company: "Amazon",
      angleMD: `
Amazon may emphasize operational ownership, multi-region reliability, cost, event-driven fanout, and clear degradation plans. Tie each service to alarms, SLOs, backpressure, and the customer impact of stale or unavailable feeds.
`,
    },
    {
      company: "Netflix",
      angleMD: `
Netflix can steer the discussion toward personalization quality, ranking experimentation, recommendation pipelines, and UI rows. Compare social feed ranking with recommendation ranking and explain how feedback loops and freshness differ.
`,
    },
  ],
  relatedQuestions: [
    {
      slug: "twitter",
      note: "Timeline design also uses fanout, ranking, high-degree producer handling, and real-time feed freshness.",
    },
    {
      slug: "instagram",
      note: "Shares media-heavy feed serving, ranking, stories, engagement signals, and CDN concerns.",
    },
    {
      slug: "linkedin-feed",
      note: "Professional feed ranking has similar graph, freshness, and quality tradeoffs with different product objectives.",
    },
    {
      slug: "reddit",
      note: "Community feeds highlight ranking, comments, moderation, and hotness versus recency tradeoffs.",
    },
  ],
  interviewTips: {
    commonMistakes: [
      "Designing only a chronological query over posts and missing ranking as the core problem.",
      "Using pure push fanout for celebrities and large pages without addressing write amplification.",
      "Storing full post bodies in feed cache and trusting cached ids without final privacy checks.",
      "Ignoring seen-state, deduplication, ads interleaving, and stale cache behavior.",
      "Making likes and comments synchronous dependencies of the feed read path.",
      "Forgetting media object storage and CDN, then sending blobs through the feed API.",
    ],
    redFlags: [
      "No concrete capacity math for billions of users and feed reads.",
      "No separation between candidate generation, ranking, and aggregation.",
      "No fallback when ranking, cache, graph, or action stores degrade.",
      "No privacy enforcement after feed-cache reads.",
      "No explanation of high-degree producers or hybrid fanout.",
    ],
    expectations: [
      "State assumptions for DAU, feed reads, posts, actions, fanout, cache size, and media storage.",
      "Describe candidate generation from friends, pages, groups, graph edges, recommendations, and high-degree pull sources.",
      "Explain ranking features, ML serving latency, model cascades, and final aggregation rules.",
      "Use hybrid fanout and feed caches of ranked post ids for scale.",
      "Cover seen-state, dedupe, privacy, ads, action-store updates, and media CDN.",
      "Discuss degradation and observability for ranking quality, not just service uptime.",
    ],
    communicationMD: `
Lead by saying the feed is a ranking system at massive read scale. Draw the read path first: client to Feed API, ranked feed cache, candidate generation, feature hydration, ranker, aggregator, and hydration. Then add the write path: post creation to event bus, fanout workers, post store, action store, and media pipeline. Keep returning to the central tradeoff: freshness versus relevance under a strict ranking latency budget.
`,
  },
  revisionNotesMD: `
- The core of Facebook Feed is **ranking**, not chronological storage.
- Use **candidate generation** to narrow sources from friends, pages, groups, friend-of-friend, recommendations, and high-degree producers.
- Use **hybrid fanout**: push ordinary producers to feed caches, pull celebrities, large pages, and large groups at read time.
- Store **ranked post ids** in the feed cache, not full post bodies. Hydrate posts and re-check privacy on every response.
- For 2B DAU and 20 feed page requests per day, expect 40B feed reads per day, about 463K average QPS, and multi-million QPS peaks.
- For 300M posts per day and 95 percent push fanout to 300 recipients, expect about 85B feed-cache inserts per day.
- Likes, comments, shares, hides, reports, impressions, clicks, and dwell events belong in an action store and event pipeline.
- Ranking features must be fresh enough for quality, but feed reads should tolerate stale non-critical features.
- Final aggregation handles dedupe, seen-state, diversity, privacy, policy, freshness, and ads or organic interleaving.
- Media belongs in object storage and CDN. Feed APIs return metadata and URLs.
`,
  flashcards: [
    {
      front: "What is the crux of Facebook Feed design?",
      back: "Ranking: generating candidates, hydrating features, scoring with ML, aggregating with policy rules, and serving within a tight latency budget.",
    },
    {
      front: "Why not use a purely chronological feed?",
      back: "Chronological order ignores relevance, close relationships, content quality, ads, seen-state, and spam controls across a huge set of possible posts.",
    },
    {
      front: "What is hybrid fanout?",
      back: "Push posts from ordinary producers into follower feed caches, but pull posts from high-degree pages, celebrities, and large groups at read time.",
    },
    {
      front: "What should the feed cache store?",
      back: "Compact ranked post ids plus rank version, scores, cursor metadata, and TTL. Full post content is hydrated from the post store.",
    },
    {
      front: "Why is final visibility checking required?",
      back: "Cached ids can be stale after deletes, privacy changes, blocks, group membership changes, or moderation actions.",
    },
    {
      front: "What signals feed the ranker?",
      back: "Affinity, freshness, engagement velocity, content quality, media type, viewer history, hides, reports, seen-state, and policy signals.",
    },
    {
      front: "How are ads served in the feed?",
      back: "Ad candidates are scored separately and interleaved by the aggregator with frequency caps, policy checks, relevance thresholds, and slot rules.",
    },
    {
      front: "Why keep media out of the Feed API?",
      back: "Images and video are large. Store them in object storage, process renditions, serve through CDN, and return only metadata and URLs in feed responses.",
    },
  ],
  quiz: [
    {
      question: "What is the most important design focus for Facebook Feed at scale?",
      options: ["A chronological SQL query over posts", "Candidate generation and ML ranking under latency constraints", "Uploading images through the feed API", "One global counter for all posts"],
      answerIndex: 1,
      explanationMD: `
The feed must choose relevant posts from a huge eligible set. Candidate generation, feature hydration, ranking, and aggregation are the core scaling and quality challenges.
`,
    },
    {
      question: "Why use hybrid fanout?",
      options: ["It removes the need for ranking", "It pushes every celebrity post to all followers immediately", "It keeps ordinary reads fast while avoiding enormous fanout for high-degree producers", "It stores media directly in Redis"],
      answerIndex: 2,
      explanationMD: `
Hybrid fanout pushes bounded producers to feed caches and pulls high-degree producers at read time. This balances read latency, freshness, and write amplification.
`,
    },
    {
      question: "What should be stored in a ranked feed cache?",
      options: ["Full post bodies and all media blobs", "Only raw comments", "Ranked post ids with metadata such as score, version, cursor, and TTL", "Passwords for fast authentication"],
      answerIndex: 2,
      explanationMD: `
The cache should store compact ranked ids. Post bodies, media, and mutable privacy state are hydrated and checked from source stores at read time.
`,
    },
    {
      question: "Given 2B DAU and 20 feed page requests per user per day, what is the average feed read QPS?",
      options: ["About 23K QPS", "About 463K QPS", "About 4.6M QPS", "About 40M QPS"],
      answerIndex: 1,
      explanationMD: `
2B times 20 is 40B feed page requests per day. 40B divided by 86,400 seconds is about 463K requests per second on average.
`,
    },
    {
      question: "Why must the serving path re-check visibility after reading cached post ids?",
      options: ["Because cached ids are never useful", "Because privacy, deletes, blocks, group membership, and moderation state may have changed", "Because ranking models require passwords", "Because media CDN cannot serve public files"],
      answerIndex: 1,
      explanationMD: `
Feed caches are performance hints, not authorization decisions. The latest visibility and moderation state must be enforced during hydration.
`,
    },
    {
      question: "Which engagement signals should feed into ranking and action stores?",
      options: ["Only post creation time", "Likes, comments, shares, hides, reports, impressions, clicks, and dwell time", "Only media file size", "Only ad budgets"],
      answerIndex: 1,
      explanationMD: `
The ranker needs positive and negative feedback signals plus exposure data. These arrive at high volume and should be ingested through an action store and event pipeline.
`,
    },
    {
      question: "What is the best degradation if the heavy ranking model is unavailable?",
      options: ["Return HTTP 500 for every feed request", "Serve cached ranked ids or a lightweight recency-affinity fallback", "Show only ads", "Disable privacy checks"],
      answerIndex: 1,
      explanationMD: `
Availability requires safe fallback. Cached ranked ids or a simple recency and affinity model can keep the feed usable while the heavy ranker recovers.
`,
    },
  ],
  cheatSheetMD: `
**Goal**: return a personalized, ranked, privacy-correct feed page for billions of users with about 200ms p99 regional latency.

**Core crux**: not chronological storage. The core is candidate generation, feature hydration, ML ranking, and aggregation under strict latency and cost limits.

**Workload**: 2B DAU, 20 feed pages per user per day, 40B feed reads per day, about 463K average QPS, and about 4.6M peak QPS.

**Writes**: 300M posts per day, 20B actions per day. Ordinary posts are pushed to feed caches; high-degree pages, celebrities, and large groups are pulled at read time.

**Feed cache**: per-user ranked post-id windows with rank version, cursor, score, timestamp, and TTL. Store ids only; hydrate and authorize posts on every read.

**Candidate generation**: merge friends, pages, groups, friend-of-friend, recommendations, pushed cache entries, and pull-based high-degree sources. Bound candidates per source.

**Ranking**: use affinity, freshness, engagement velocity, content quality, viewer history, negative feedback, policy, and seen-state. Use cascaded models and feature deadlines.

**Aggregation**: dedupe, filter seen or hidden posts, enforce privacy, diversify authors and content types, interleave ads, and attach media CDN URLs.

**Storage**: graph store for edges, post store for metadata, feed cache for ranked ids, action store and event log for engagement, object store plus CDN for media.

**Failure plan**: cached feed first, then lightweight ranker, then chronological or affinity fallback. Never bypass privacy or safety checks.
`,
  references: [
    {
      title: "TAO: Facebook's Distributed Data Store for the Social Graph",
      kind: "Paper",
      url: "https://www.usenix.org/conference/atc13/technical-sessions/presentation/bronson",
      author: "Nathan Bronson et al.",
    },
    {
      title: "Scaling Memcache at Facebook",
      kind: "Paper",
      url: "https://www.usenix.org/conference/nsdi13/technical-sessions/presentation/nishtala",
      author: "Rajesh Nishtala et al.",
    },
    {
      title: "Deep Learning Recommendation Model for Personalization and Recommendation Systems",
      kind: "Paper",
      url: "https://arxiv.org/abs/1906.00091",
      author: "Maxim Naumov et al.",
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
