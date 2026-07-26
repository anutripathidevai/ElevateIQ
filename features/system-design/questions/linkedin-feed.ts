import type { SDQuestionContent } from "../types";

export const linkedinFeedContent: SDQuestionContent = {
  slug: "linkedin-feed",
  statementMD: `
Design the LinkedIn Feed: a personalized professional feed showing posts, articles, videos, polls, job updates, company updates, and network activity from a member's connections, followed people, companies, groups, and second-degree network.

At interview scale, assume hundreds of millions of active members, a massive professional graph, heavy read traffic, bursty content creation around work hours, and strict relevance expectations. The feed must rank items by professional value, relationship strength, engagement, freshness, and intent while avoiding spam, repeated stories, and consumer-social noise.

The hard part is not rendering a list of posts. It is maintaining a continuously changing economic graph, producing low-latency personalized rankings, blending bidirectional connections with one-way follows, supporting hybrid fanout, logging dwell-time signals, and preserving trust because professional recommendations can affect jobs, hiring, sales, and reputation.
`,
  businessUseCaseMD: `
LinkedIn Feed keeps members engaged with useful professional updates: colleagues changing jobs, hiring posts, industry articles, company news, events, skill content, and opportunities. It drives sessions, ad inventory, creator reach, job discovery, sales engagement, and network growth.

Unlike a generic social feed, the value comes from professional relevance and economic graph context. A weaker but professionally aligned second-degree signal can beat a strong entertainment signal, and employers, recruiters, creators, and members all care about trust, deduplication, and fair distribution.
`,
  functionalRequirements: [
    "Serve a personalized ranked feed for a member with cursor-based pagination.",
    "Ingest posts, articles, videos, polls, job updates, company updates, reactions, comments, follows, and connection changes.",
    "Support bidirectional connections, one-way follows, company follows, group follows, and second-degree candidate discovery.",
    "Rank feed items using relevance, relationship strength, freshness, engagement, dwell time, content quality, and member intent.",
    "Deduplicate repeated stories, reshares, job updates, and notifications for the same professional event.",
    "Support hybrid fanout so highly connected creators and companies do not overload follower inboxes.",
    "Emit notifications for important network activity without duplicating the feed experience.",
    "Provide moderation, privacy filtering, and blocked-member filtering before content is shown.",
  ],
  nonFunctionalRequirements: [
    {
      label: "Latency",
      detailMD: `
Feed open should return the first page in under 300ms p99 within a region, with the ranking service budget kept below roughly 120ms. Post creation can tolerate 500ms to 1s p99 because fanout and notifications are asynchronous.
`,
    },
    {
      label: "Availability",
      detailMD: `
The read path should target 99.99 percent availability. If ranking, notifications, or analytics degrade, the system should still serve a safe cached or fallback feed rather than an empty page.
`,
    },
    {
      label: "Read-heavy scalability",
      detailMD: `
Members read far more feed pages than they create posts. Scale feed reads independently with precomputed candidate lists, per-member feed caches, stateless feed services, and ranking services that can shed expensive features under load.
`,
    },
    {
      label: "Freshness",
      detailMD: `
Important professional events such as new jobs, hiring posts, and close connection updates should appear within seconds to minutes. Less critical articles and viral posts can arrive through slower batch candidate generation.
`,
    },
    {
      label: "Consistency and privacy",
      detailMD: `
Connection acceptances, blocks, visibility changes, deleted posts, and company permissions must be enforced before display. Feed order can be eventually consistent, but privacy filters cannot be stale in a way that leaks restricted content.
`,
    },
    {
      label: "Ranking quality",
      detailMD: `
The system must optimize for professional relevance, not only clicks. Dwell time, hides, skips, follows, connection degree, job intent, company interest, and content quality should influence ranking while preventing engagement bait.
`,
    },
    {
      label: "Cost efficiency",
      detailMD: `
Avoid full recomputation of every member's feed on every graph or content update. Use hybrid fanout, candidate pools, approximate counters, tiered storage, and feature computation pipelines so high-degree entities remain affordable.
`,
    },
  ],
  capacityEstimation: {
    assumptionsMD: `
Assume 300M daily active members, each opening feed 8 times per day, and each request returning 20 visible items after scoring roughly 500 candidates. Assume 30M new feed-eligible items per day across posts, articles, videos, job updates, polls, reshared updates, and company updates.

Assume 5B engagement and impression events per day, including views, clicks, reactions, comments, hides, skips, and dwell-time beacons. Assume 15B graph edges after storing bidirectional connections as two directed edges and one-way follows as one directed edge. Use a 10x peak multiplier for regional daytime spikes.
`,
    metrics: [
      {
        label: "Daily feed opens",
        value: "2.4B requests per day",
        note: "300M daily active members times 8 feed opens",
      },
      {
        label: "Average feed read QPS",
        value: "27,800 reads per second",
        note: "2.4B divided by 86,400 seconds",
      },
      {
        label: "Peak feed read QPS",
        value: "278,000 reads per second",
        note: "10x average peak during workday windows",
      },
      {
        label: "New feed items",
        value: "30M per day",
        note: "Posts, articles, videos, polls, company updates, jobs, and reshared items",
      },
      {
        label: "Average content write QPS",
        value: "347 writes per second",
        note: "30M divided by 86,400 seconds",
      },
      {
        label: "Peak content write QPS",
        value: "3,470 writes per second",
        note: "10x peak for creator and company activity bursts",
      },
      {
        label: "Ranking candidates scored",
        value: "1.2T candidates per day",
        note: "2.4B feed opens times 500 candidates before pruning",
      },
      {
        label: "Engagement events",
        value: "5B events per day",
        note: "Impressions, clicks, reactions, comments, hides, skips, and dwell pings",
      },
      {
        label: "Feed item storage",
        value: "90 GB raw per day",
        note: "30M items times roughly 3 KB metadata before media payloads",
      },
      {
        label: "Graph storage",
        value: "about 1 TB raw",
        note: "15B directed edges times about 64 bytes per edge before replication and indexes",
      },
      {
        label: "Hot feed cache",
        value: "500 GB to 1 TB",
        note: "Cached candidate IDs, cursors, and features for tens of millions of recently active members",
      },
    ],
    calculationsMD: `
- Feed requests: 300M daily active members times 8 feed opens is 2.4B requests per day. 2.4B divided by 86,400 seconds is about 27,778 read QPS, rounded to 27,800. With a 10x peak, plan for about 278,000 read QPS.
- Content writes: 30M feed-eligible items per day divided by 86,400 seconds is about 347 writes per second. With a 10x peak, plan for about 3,470 writes per second.
- Ranking work: 2.4B daily feed opens times 500 candidate items means 1.2T candidate scoring decisions per day before pruning, deduplication, and pagination.
- Visible impressions: if each feed open shows about 20 items, the system records about 48B potential visible slots per day. Not all become true impressions because users may stop scrolling before every item is viewed.
- Event volume: 5B engagement and dwell-time events per day at 300 bytes each is about 1.5 TB raw per day. A 90-day hot analytics window is about 135 TB raw before replication, compression, and indexes.
- Feed item storage: 30M items per day times about 3 KB metadata is about 90 GB raw per day. One year is about 33 TB raw before media storage, search indexes, replicas, and compaction overhead.
- Graph storage: 15B directed edges times roughly 64 bytes is about 960 GB raw. With replicas, adjacency indexes, tombstones, and edge attributes, reserve several TB.
- Cache memory: caching 200 candidate IDs plus small feature snapshots for 50M recently active members can exceed 500 GB after object overhead. Use tiered cache and refresh lazily.
`,
  },
  apiDesign: {
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/feed?memberId={memberId}&cursor={cursor}&limit=20",
        descriptionMD: `
Returns a personalized ranked feed page. The cursor encodes the pagination window, dedup state, and ranking session so refreshes do not show the same professional story repeatedly.
`,
        response: `
{
  "memberId": "member_123",
  "items": [
    {
      "feedItemId": "feed_987",
      "contentType": "job_update",
      "actorId": "company_42",
      "reason": "Hiring update from a company you follow",
      "rankScore": 0.931,
      "createdAt": "2026-07-26T07:05:00Z"
    }
  ],
  "nextCursor": "cursor_after_ranked_page",
  "servedAt": "2026-07-26T07:06:00Z"
}
`,
        statusCodes: [
          { code: 200, meaning: "Ranked feed returned" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Member cannot access this feed" },
          { code: 429, meaning: "Rate limit exceeded" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/posts",
        descriptionMD: `
Creates a feed-eligible item such as a text post, article share, video, poll, job update, or company update. The synchronous path stores content and emits an activity event; fanout and notifications run asynchronously.
`,
        request: `
{
  "actorId": "member_123",
  "actorType": "member",
  "contentType": "article",
  "visibility": "connections_and_followers",
  "text": "Lessons from scaling a professional feed",
  "mediaRefs": ["media_555"],
  "targetCompanyId": null
}
`,
        response: `
{
  "feedItemId": "feed_987",
  "status": "accepted",
  "createdAt": "2026-07-26T07:05:00Z",
  "fanoutState": "queued"
}
`,
        statusCodes: [
          { code: 201, meaning: "Post accepted" },
          { code: 400, meaning: "Invalid content, visibility, or media" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Actor cannot post for this entity" },
          { code: 429, meaning: "Creator rate limit exceeded" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/feed/events",
        descriptionMD: `
Records feed interactions such as impressions, clicks, reactions, comments, hides, skips, and dwell-time measurements. These events update ranking features asynchronously.
`,
        request: `
{
  "memberId": "member_123",
  "feedItemId": "feed_987",
  "eventType": "dwell",
  "dwellMs": 4200,
  "position": 3,
  "rankingSessionId": "session_abc",
  "occurredAt": "2026-07-26T07:06:12Z"
}
`,
        response: `
{
  "accepted": true
}
`,
        statusCodes: [
          { code: 202, meaning: "Event queued" },
          { code: 400, meaning: "Invalid event payload" },
          { code: 401, meaning: "Authentication required" },
          { code: 429, meaning: "Event rate limit exceeded" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/connections",
        descriptionMD: `
Creates or accepts a bidirectional connection. The graph service stores two directed edges, updates relationship features, and emits activity for feed and notification pipelines.
`,
        request: `
{
  "requesterId": "member_123",
  "targetMemberId": "member_456",
  "action": "accept"
}
`,
        response: `
{
  "connectionId": "conn_789",
  "status": "connected",
  "connectedAt": "2026-07-26T07:04:30Z"
}
`,
        statusCodes: [
          { code: 200, meaning: "Connection updated" },
          { code: 400, meaning: "Invalid connection transition" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Connection blocked by privacy rules" },
          { code: 409, meaning: "Conflicting graph state" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/follows",
        descriptionMD: `
Creates a one-way follow edge for a member, company, school, group, creator, topic, or hashtag. Follow edges influence candidate generation but do not imply bidirectional access.
`,
        request: `
{
  "followerId": "member_123",
  "targetId": "company_42",
  "targetType": "company"
}
`,
        response: `
{
  "followId": "follow_456",
  "status": "following"
}
`,
        statusCodes: [
          { code: 201, meaning: "Follow created" },
          { code: 400, meaning: "Invalid target" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Follow not allowed" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/notifications?memberId={memberId}&cursor={cursor}",
        descriptionMD: `
Returns network activity notifications such as connection accepts, job changes, mentions, comments, hiring updates, and high-signal post activity.
`,
        response: `
{
  "memberId": "member_123",
  "notifications": [
    {
      "notificationId": "notif_111",
      "type": "connection_job_change",
      "actorId": "member_456",
      "feedItemId": "feed_987",
      "read": false
    }
  ],
  "nextCursor": "cursor_after_notification"
}
`,
        statusCodes: [
          { code: 200, meaning: "Notifications returned" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Member cannot access these notifications" },
        ],
      },
    ],
    notesMD: `
Keep feed reads separate from interaction logging and notification reads. Feed reads are latency-sensitive and should be allowed to degrade to cached candidate lists, while events and notifications can be queued, deduplicated, and processed asynchronously.
`,
  },
  databaseDesign: {
    schemaMD: `
The logical data model separates the professional graph, feed content, event stream, and materialized candidate caches. The serving path should avoid joins across all of these stores on every request; instead, candidate generation and feature pipelines prepare compact records for the feed service.

Connections are bidirectional professional relationships, but they are stored as two directed adjacency edges after acceptance. Follows are one-way and can target people, companies, groups, schools, topics, or hashtags. Feed items reference actors and entities so ranking can reason about economic graph context.
`,
    tables: [
      {
        name: "members",
        columns: [
          { name: "member_id", type: "uuid", note: "Primary key for a LinkedIn member" },
          { name: "headline", type: "varchar(256)", note: "Professional headline used by ranking and display" },
          { name: "industry", type: "varchar(128)", note: "Industry affinity signal" },
          { name: "geo_region", type: "varchar(64)", note: "Coarse region for relevance and compliance" },
          { name: "profile_visibility", type: "varchar(32)", note: "Public, connections, private, or restricted" },
          { name: "created_at", type: "timestamp", note: "Account creation time" },
          { name: "status", type: "varchar(32)", note: "Active, restricted, deleted, or spam-suspected" },
        ],
      },
      {
        name: "graph_edges",
        columns: [
          { name: "source_id", type: "uuid", note: "Member or entity that owns the outgoing edge" },
          { name: "target_id", type: "uuid", note: "Member, company, group, school, topic, or hashtag target" },
          { name: "target_type", type: "varchar(32)", note: "member, company, group, school, topic, or hashtag" },
          { name: "edge_type", type: "varchar(32)", note: "connection, follow, block, mute, or invitation" },
          { name: "strength_score", type: "float", note: "Recent interaction and professional affinity score" },
          { name: "status", type: "varchar(32)", note: "Pending, active, blocked, muted, or removed" },
          { name: "created_at", type: "timestamp", note: "Edge creation or acceptance time" },
          { name: "updated_at", type: "timestamp", note: "Last interaction or privacy update time" },
        ],
      },
      {
        name: "feed_items",
        columns: [
          { name: "feed_item_id", type: "uuid", note: "Primary key for a feed-eligible story" },
          { name: "actor_id", type: "uuid", note: "Member, company, or system entity that produced the item" },
          { name: "actor_type", type: "varchar(32)", note: "member, company, group, job, or platform" },
          { name: "content_type", type: "varchar(32)", note: "text, article, video, job, poll, reshare, or company_update" },
          { name: "visibility", type: "varchar(64)", note: "Public, connections, followers, group, company_admins, or targeted" },
          { name: "dedupe_key", type: "varchar(128)", note: "Groups repeated stories such as the same job change or reshared article" },
          { name: "quality_score", type: "float", note: "Spam, trust, content quality, and policy score" },
          { name: "created_at", type: "timestamp", note: "Creation time used for freshness" },
          { name: "status", type: "varchar(32)", note: "Active, deleted, hidden, under_review, or blocked" },
        ],
      },
      {
        name: "feed_events",
        columns: [
          { name: "event_id", type: "uuid", note: "Unique event id for deduplication" },
          { name: "member_id", type: "uuid", note: "Member who saw or interacted with the item" },
          { name: "feed_item_id", type: "uuid", note: "Feed item involved in the event" },
          { name: "event_type", type: "varchar(32)", note: "impression, click, dwell, reaction, comment, hide, skip, or report" },
          { name: "position", type: "int", note: "Ranked position at serving time" },
          { name: "dwell_ms", type: "int nullable", note: "Dwell time for ranking feedback" },
          { name: "ranking_session_id", type: "varchar(64)", note: "Correlates a served page with subsequent events" },
          { name: "occurred_at", type: "timestamp", note: "Client or server event time" },
        ],
      },
      {
        name: "materialized_feed_candidates",
        columns: [
          { name: "member_id", type: "uuid", note: "Target member whose candidate inbox is materialized" },
          { name: "feed_item_id", type: "uuid", note: "Candidate item id" },
          { name: "source_reason", type: "varchar(64)", note: "Connection, follow, second_degree, job_match, group, or company" },
          { name: "pre_rank_score", type: "float", note: "Cheap score used before online ranking" },
          { name: "inserted_at", type: "timestamp", note: "When the candidate was added" },
          { name: "expires_at", type: "timestamp", note: "Candidate expiry for staleness control" },
        ],
      },
    ],
    indexesMD: `
- **graph_edges.source_id, edge_type, status** supports adjacency lookup for candidate generation.
- **graph_edges.target_id, edge_type** supports reverse fanout and audience estimation.
- **feed_items.actor_id, created_at** supports fetching recent actor activity.
- **feed_items.dedupe_key** helps suppress repeated stories.
- **feed_events.member_id, occurred_at** supports recent negative feedback and dwell features.
- **materialized_feed_candidates.member_id, pre_rank_score, inserted_at** supports quick candidate reads for active members.
`,
    relationshipsMD: `
Members create feed items and own outgoing graph edges. A bidirectional connection is represented by two active directed edges, while a follow is one directed edge. Feed events reference both the member and the feed item so the ranking pipeline can learn from impressions, reactions, hides, and dwell time.

The online feed service should not perform a relational join across all tables for each page. It reads candidate IDs from cache or materialized candidate storage, hydrates compact item records, asks the graph and privacy layer for eligibility, and sends features to the ranker.
`,
    noSqlAlternativesMD: `
At large scale, use specialized stores: a graph or adjacency-list KV store for edges, a document or wide-column store for feed item metadata, an event log such as Kafka for interactions, an OLAP lake for analytics, and Redis or a distributed cache for materialized candidates.

The graph store should support fast outgoing adjacency lookup, reverse lookup for fanout estimation, and edge attributes such as relationship strength. The feed item store should be partitioned by feed_item_id and optionally by actor_id for creator timelines. The materialized candidate store is naturally keyed by member_id with time-bucketed candidate lists.
`,
  },
  architecture: {
    width: 960,
    height: 560,
    nodes: [
      { id: "client", label: "Client", kind: "client", x: 70, y: 240, sublabel: "Web and mobile" },
      { id: "cdn-edge", label: "CDN and Edge", kind: "cdn", x: 210, y: 120, sublabel: "Media, TLS, static assets" },
      { id: "api-gateway", label: "API Gateway", kind: "gateway", x: 210, y: 300, sublabel: "Auth, rate limits" },
      { id: "feed-service", label: "Feed Service", kind: "service", x: 390, y: 245, sublabel: "Candidates, hydrate, paginate" },
      { id: "feed-cache", label: "Feed Cache", kind: "cache", x: 555, y: 95, sublabel: "Member candidate lists" },
      { id: "graph-service", label: "Graph Service", kind: "service", x: 555, y: 245, sublabel: "Connections, follows" },
      { id: "ranking-service", label: "Ranking Service", kind: "service", x: 555, y: 400, sublabel: "Professional relevance" },
      { id: "graph-store", label: "Graph Store", kind: "database", x: 745, y: 215, sublabel: "Adjacency lists" },
      { id: "content-store", label: "Content Store", kind: "database", x: 745, y: 360, sublabel: "Posts, articles, jobs" },
      { id: "activity-bus", label: "Activity Event Bus", kind: "queue", x: 745, y: 500, sublabel: "Kafka, streams" },
      { id: "notification-workers", label: "Notification and Fanout Workers", kind: "worker", x: 875, y: 120, sublabel: "Hybrid fanout" },
    ],
    edges: [
      { from: "client", to: "cdn-edge", label: "media and assets" },
      { from: "client", to: "api-gateway", label: "feed and actions" },
      { from: "cdn-edge", to: "api-gateway", label: "API miss" },
      { from: "api-gateway", to: "feed-service", label: "authenticated request" },
      { from: "feed-service", to: "feed-cache", label: "candidate page" },
      { from: "feed-cache", to: "feed-service", label: "cached IDs" },
      { from: "feed-service", to: "graph-service", label: "privacy and graph signals" },
      { from: "graph-service", to: "graph-store", label: "adjacency lookup" },
      { from: "feed-service", to: "content-store", label: "hydrate items" },
      { from: "feed-service", to: "ranking-service", label: "score candidates" },
      { from: "ranking-service", to: "feed-service", label: "ranked list" },
      { from: "feed-service", to: "activity-bus", label: "impressions and dwell", dashed: true },
      { from: "api-gateway", to: "activity-bus", label: "posts and graph changes", dashed: true },
      { from: "activity-bus", to: "notification-workers", label: "activity stream", dashed: true },
      { from: "notification-workers", to: "feed-cache", label: "fanout candidates", dashed: true },
      { from: "notification-workers", to: "client", label: "push notifications", dashed: true },
    ],
    captionMD: `
The online read path is client to API gateway to feed service, which reads cached candidates, checks graph and privacy constraints, hydrates content, ranks candidates, and returns a page. Posting, graph changes, fanout, feature updates, dwell logging, and notifications are asynchronous through the activity bus.
`,
  },
  architectureNotesMD: `
The design uses a hybrid feed architecture. Active members and normal-degree creators get materialized candidate lists so feed open is fast. High-degree creators, companies, jobs, and viral posts are pulled or selectively fanned out at read time so one update does not write to tens of millions of inboxes.

The graph service is a first-class dependency because professional relevance depends on connection degree, follows, muted edges, blocked members, shared companies, schools, groups, skills, and second-degree context. This is the main distinction from a generic Facebook-style friend feed: relationship type and economic context matter as much as raw engagement.

Ranking is isolated behind a service so models and feature sets can evolve. The feed service should be able to fall back to a simpler freshness plus graph-strength score when the online ranker or feature store is degraded.
`,
  requestFlow: [
    {
      title: "Feed request is authenticated",
      detailMD: `
The client calls **GET /api/v1/feed**. The API gateway validates the member session, applies rate limits, extracts locale and device context, and forwards the request to the feed service with the member id and cursor.
`,
    },
    {
      title: "Candidate list is loaded",
      detailMD: `
The feed service reads a per-member candidate list from the feed cache or materialized candidate store. The candidate list contains recent items from connections, followed entities, groups, jobs, topics, and selected second-degree sources.
`,
    },
    {
      title: "Cache miss triggers online candidate generation",
      detailMD: `
If the candidate cache misses or is stale, the feed service asks the graph service for adjacency lists and relationship features, fetches recent actor items, adds promoted professional opportunities, and limits the candidate set before ranking.
`,
    },
    {
      title: "Privacy and eligibility filters run",
      detailMD: `
The service removes deleted posts, blocked actors, muted authors, restricted company updates, private group content, expired jobs, spam-suspected content, and items that violate the member's visibility rules.
`,
    },
    {
      title: "Content is hydrated",
      detailMD: `
The feed service fetches compact item metadata from the content store and media metadata from the edge-backed media layer. Hydration is bounded so missing attachments do not block the entire page.
`,
    },
    {
      title: "Ranking scores professional relevance",
      detailMD: `
The ranking service scores candidates using relationship strength, connection degree, follow intent, industry match, job-seeking intent, freshness, engagement quality, dwell-time history, hides, reports, and content quality.
`,
    },
    {
      title: "Deduplication and diversity are applied",
      detailMD: `
The feed service collapses repeated stories by dedupe key, limits consecutive posts from the same author or company, balances content types, and avoids showing the same job update or article reshare repeatedly across pages.
`,
    },
    {
      title: "Page and cursor are returned",
      detailMD: `
The service returns the top items, ranking reasons, and a cursor that preserves pagination state. The cursor helps avoid duplicates when the member scrolls while new professional activity is arriving.
`,
    },
    {
      title: "Engagement events update future ranking",
      detailMD: `
Impressions, clicks, reactions, comments, hides, skips, and dwell-time pings are written to the activity bus. Stream processors update counters, member features, graph strength, notification rules, and future candidate generation.
`,
    },
  ],
  coreComponents: [
    {
      name: "Feed Service",
      kind: "service",
      role: "Coordinates candidate retrieval, filtering, hydration, ranking, pagination, and deduplication.",
      detailMD: `
The Feed Service is stateless and latency-sensitive. It reads candidate IDs, calls graph and content services, invokes ranking, applies business rules, returns a page, and emits impression events asynchronously. It owns graceful degradation when dependencies fail.
`,
    },
    {
      name: "Graph Service",
      kind: "service",
      role: "Serves the professional graph used for eligibility and relevance.",
      detailMD: `
It stores bidirectional connections as two directed edges and one-way follows as directed edges. It also supports blocks, mutes, shared entities, second-degree expansion, relationship strength, and reverse fanout estimation.
`,
    },
    {
      name: "Ranking Service",
      kind: "service",
      role: "Scores feed candidates for professional value.",
      detailMD: `
The ranker combines model scores and rules using relationship features, content features, member intent, dwell time, engagement quality, freshness, and trust signals. It should support feature fallbacks, model versioning, and online experiments.
`,
    },
    {
      name: "Feed Cache",
      kind: "cache",
      role: "Stores hot per-member candidate lists and pagination state.",
      detailMD: `
The cache keeps feed open fast for active members. Entries should expire quickly, include dedup state, and be refreshable in the background. It should tolerate partial misses and avoid stampedes through request coalescing.
`,
    },
    {
      name: "Content Store",
      kind: "database",
      role: "Durable source of truth for feed items and metadata.",
      detailMD: `
It stores posts, articles, job updates, polls, videos, company updates, moderation status, visibility, dedupe keys, and quality scores. Large media payloads belong in object storage and CDN, while the feed serving record remains compact.
`,
    },
    {
      name: "Activity Event Bus",
      kind: "queue",
      role: "Connects writes, interactions, fanout, notifications, and ranking features.",
      detailMD: `
Kafka, Pulsar, or a similar log receives post creates, graph changes, impressions, dwell events, reactions, comments, hides, reports, and notification triggers. Consumers update candidate stores, feature stores, analytics, and alerts.
`,
    },
    {
      name: "Notification and Fanout Workers",
      kind: "worker",
      role: "Materialize candidate updates and send high-signal network notifications.",
      detailMD: `
Workers decide whether to push a story into follower candidate lists, delay it for pull-based retrieval, or create a notification. They apply audience limits, dedupe keys, priority, quiet hours, and relevance thresholds.
`,
    },
    {
      name: "Trust and Moderation Layer",
      kind: "external",
      role: "Protects the feed from spam, scams, scraping, and low-quality professional content.",
      detailMD: `
The moderation layer scores content, actors, companies, jobs, and engagement patterns. It can downrank, remove, review, or block items before fanout and before display. This is essential because professional feeds influence hiring and reputation.
`,
    },
  ],
  deepDives: [
    {
      topic: "Professional graph modeling",
      detailMD: `
LinkedIn has more relationship types than a generic friend graph. A connection is bidirectional and usually implies stronger visibility and trust. A follow is one-way and means interest without reciprocal access. Companies, schools, groups, topics, newsletters, creators, and jobs are also graph entities.

A practical store represents everything as directed edges with attributes: edge type, status, created time, source, target type, interaction strength, privacy flags, and recent engagement. When two members connect, write two active directed edges. When one member follows a company, write one edge.

Candidate generation should weight degree differently. First-degree connection posts are strong candidates, followed company updates are intent-driven candidates, and second-degree posts need proof such as shared industry, mutual connections, job relevance, or high-quality engagement. Blocks and mutes must be negative edges checked before ranking.
`,
    },
    {
      topic: "Hybrid fanout strategy",
      detailMD: `
Pure fanout-on-write is expensive for high-degree creators, large companies, and job boards because one post could write to millions of member inboxes. Pure fanout-on-read is too slow for every feed open because it must scan many actors and rank too much fresh content.

Use hybrid fanout. Normal members and moderate-degree creators fan out candidate IDs to active followers and close connections. High-degree creators, companies, jobs, and viral stories are stored in actor timelines and pulled during feed read based on relevance and quotas. Inactive members receive fewer precomputed candidates and are refreshed lazily when they return.

The threshold should be dynamic. Fan out more when the author has a small, high-affinity audience. Pull more when the audience is huge, low-affinity, or content quality is uncertain. This keeps freshness without turning celebrity and company posts into write amplification events.
`,
    },
    {
      topic: "Ranking for professional relevance",
      detailMD: `
Professional relevance is not the same as entertainment engagement. A job opening, hiring manager post, industry article, or colleague promotion may be valuable even if it generates fewer likes than a viral meme. The ranking objective should combine member value, professional intent, trusted engagement, and long-term satisfaction.

Feature groups include graph strength, connection degree, shared employer or school, industry overlap, skills, job-seeking intent, content type, author reputation, freshness, quality, topic embedding similarity, dwell time, hides, reports, and downstream actions such as follows or applications. Dwell time is useful but must be normalized by content type because long articles and videos naturally produce longer dwell.

The ranker should use guardrails: downrank engagement bait, enforce content diversity, protect close-network updates, and avoid over-personalization that traps members in one industry or company bubble. Explainability matters because members may ask why they saw a professional update.
`,
    },
    {
      topic: "Deduplication, diversity, and pagination",
      detailMD: `
LinkedIn generates many repeated stories: multiple people congratulate the same job change, several connections reshare the same article, a company posts a job that also appears in job recommendations, and a poll may receive many comments. Without deduplication, the feed feels noisy.

Assign a dedupe key by canonical entity and event type, such as job_change plus member id, article_url plus normalized URL, job_id plus company id, or poll_id. Collapse repeated stories into one feed card with social context. Keep a per-ranking-session seen set in the cursor so pagination remains stable while fresh items arrive.

Diversity rules should cap consecutive items from the same actor, company, content type, or story family. The goal is not random variety; it is a balanced professional feed that mixes close-network updates, followed entities, jobs, articles, and timely conversations.
`,
    },
    {
      topic: "Second-degree network and economic graph",
      detailMD: `
Second-degree candidates are important because they expose opportunities beyond direct connections: a hiring manager followed by a colleague, a founder in the same industry, or a post gaining traction among people with similar skills. They also risk feeling irrelevant or privacy-invasive if overused.

The feed should require stronger evidence for second-degree content than for first-degree content. Useful signals include multiple mutual connections, shared company or school, industry affinity, topic interest, recruiter or job-seeking intent, and high-quality engagement from trusted members. The ranking reason should be explicit, such as popular among people in your network or from a company you follow.

The economic graph angle means entities such as members, companies, jobs, skills, schools, industries, and content topics all participate in relevance. A feed item can be relevant because it connects a member to a job opportunity, a sales prospect, a hiring trend, or a professional learning topic.
`,
    },
    {
      topic: "Notifications versus feed",
      detailMD: `
Notifications should not be a copy of the feed. They should be reserved for high-signal events: connection requests, accepted connections, mentions, comments on your post, job changes from close connections, hiring updates matching intent, and important company activity.

The notification pipeline consumes the same activity bus but applies stricter thresholds, deduplication, quiet hours, channel preferences, and fatigue controls. It may send push, email, in-app badges, or no alert. Feed ranking can show lower-priority items later without interrupting the member.

This separation improves trust. A noisy feed can be tolerated briefly; noisy professional notifications cause churn and can feel like spam. The system should coordinate dedupe keys so a member does not receive repeated notifications and then see the same story multiple times in feed.
`,
    },
  ],
  scaling: [
    {
      stage: "Prototype: single region and simple ranking",
      detailMD: `
Start with a relational store for posts and graph edges, a feed service that fetches recent posts from first-degree connections and followed companies, and a simple score combining freshness and relationship type. Add cursor pagination and basic privacy filtering before adding machine learning.
`,
    },
    {
      stage: "1M to 10M members: cache and event pipeline",
      detailMD: `
Add Redis candidate caches, asynchronous event logging, background fanout workers, and a search or timeline index for recent actor items. Store engagement events in a durable log and begin computing simple relationship strength and content quality features.
`,
    },
    {
      stage: "50M to 100M members: graph partitioning and hybrid fanout",
      detailMD: `
Move graph edges to a partitioned adjacency store, split content metadata from media storage, and introduce hybrid fanout thresholds. Add a ranking service with feature snapshots and online experiments. Build dedupe and diversity controls into the serving path.
`,
    },
    {
      stage: "Hundreds of millions of members: global read scale",
      detailMD: `
Replicate read-heavy candidate stores and content metadata across regions, keep graph writes in home shards, and use regional feed services. Precompute candidates for active members, pull high-degree actors at read time, and use load shedding for expensive ranking features.
`,
    },
    {
      stage: "Staff scale: economic graph and trust platform",
      detailMD: `
Unify members, companies, jobs, skills, schools, topics, and ads into feature pipelines with privacy-aware boundaries. Add model governance, explainability, fairness monitoring, creator distribution controls, spam defenses, and capacity isolation for feed, jobs, ads, and notifications.
`,
    },
  ],
  bottlenecks: [
    {
      issue: "High-degree creators and companies causing fanout storms",
      optimizationMD: `
Use hybrid fanout with dynamic thresholds. Push candidate IDs for normal-degree actors, pull high-degree actors at read time, and cap fanout based on audience size, affinity, quality score, and active-follower count.
`,
    },
    {
      issue: "Graph adjacency lookups on every feed open",
      optimizationMD: `
Cache member adjacency lists and relationship features, precompute second-degree candidate pools, and keep graph filters compact. Use short TTLs for privacy-sensitive edges such as blocks and mutes.
`,
    },
    {
      issue: "Ranking service p99 latency",
      optimizationMD: `
Limit the number of candidates sent to the ranker, use cheap pre-rank scores, batch feature reads, keep hot features in memory, and fall back to a simpler ranker when model inference or feature stores are slow.
`,
    },
    {
      issue: "Dwell and engagement event volume",
      optimizationMD: `
Batch client events, sample low-value telemetry when allowed, deduplicate by ranking session and item, and write events to a durable log instead of synchronously updating feed item rows.
`,
    },
    {
      issue: "Repeated stories crowding out useful updates",
      optimizationMD: `
Use canonical dedupe keys, session-level seen sets, author and content-type diversity caps, and story aggregation cards that combine multiple reactions or reshares into one professional context.
`,
    },
    {
      issue: "Hot cache keys for very active members",
      optimizationMD: `
Shard candidate caches by member id, use request coalescing, refresh candidate lists asynchronously, and limit cursor state size. For power users, generate smaller windows more frequently rather than one huge feed payload.
`,
    },
  ],
  failureHandling: [
    {
      scenario: "Ranking service unavailable",
      strategyMD: `
Serve a fallback feed using cached pre-rank scores, freshness, connection degree, and content quality. Log the degraded ranking mode and continue to enforce privacy, moderation, deduplication, and blocked-member filters.
`,
    },
    {
      scenario: "Feed cache outage",
      strategyMD: `
Regenerate candidates from graph and actor timelines with strict limits, protect graph and content stores with circuit breakers, and serve a smaller page if necessary. Warm cache gradually after recovery to avoid a stampede.
`,
    },
    {
      scenario: "Graph store partition",
      strategyMD: `
Use cached adjacency and relationship features for non-sensitive ranking, but consult a small strongly refreshed block and privacy cache before display. If privacy cannot be verified, suppress questionable items rather than risk leakage.
`,
    },
    {
      scenario: "Activity event bus lag",
      strategyMD: `
Feed reads and post creation continue, but ranking features and notifications may be stale. Expose lag metrics, prioritize high-signal events, and avoid replaying old notifications that would annoy members after recovery.
`,
    },
    {
      scenario: "Content store degradation",
      strategyMD: `
Return partial pages using cached item metadata and skip items that cannot be hydrated within the latency budget. Do not show stale deleted or moderated content if the status cannot be validated.
`,
    },
    {
      scenario: "Bad ranking model deployment",
      strategyMD: `
Use canary rollout, shadow evaluation, guardrail metrics, and fast rollback. Keep a known-good ranking policy and feature schema so the feed can recover without waiting for model retraining.
`,
    },
  ],
  security: [
    {
      label: "Privacy enforcement",
      detailMD: `
Visibility rules, blocks, mutes, private groups, company admin permissions, deleted content, and restricted profiles must be checked before display. Privacy filtering should be fail-closed for uncertain content.
`,
    },
    {
      label: "Spam and trust",
      detailMD: `
Professional feeds attract scams, fake jobs, engagement pods, scraped content, and impersonation. Use actor reputation, content quality, link safety, graph anomaly detection, and report feedback to downrank or remove abusive items.
`,
    },
    {
      label: "Access control",
      detailMD: `
Only authorized members and entity admins can post for a company, edit articles, manage jobs, or view analytics. Feed APIs should never expose private engagement details or restricted profile attributes.
`,
    },
    {
      label: "Data minimization",
      detailMD: `
Dwell time, job intent, profile views, and professional interests are sensitive. Keep raw events in controlled stores with retention limits, aggregate where possible, and avoid leaking ranking features in client responses.
`,
    },
    {
      label: "Abuse rate limiting",
      detailMD: `
Rate-limit feed scraping, reaction spam, connection spam, follow bursts, and notification-triggering actions. Detect automated scrolling and suspicious event patterns so engagement signals cannot be cheaply manipulated.
`,
    },
    {
      label: "Model integrity",
      detailMD: `
Protect ranking models and feature pipelines from poisoned engagement, coordinated pods, and fake accounts. Monitor feature drift, unusual lift from suspicious cohorts, and content that receives low dwell but high artificial reactions.
`,
    },
  ],
  tradeoffs: {
    pros: [
      "Hybrid fanout keeps feed reads fast without exploding writes for high-degree creators and companies.",
      "Separating graph, content, ranking, and events lets each subsystem scale for its access pattern.",
      "Professional graph features improve relevance beyond generic engagement metrics.",
      "Asynchronous event processing keeps feed reads and post creation resilient during analytics lag.",
      "Deduplication and diversity controls improve perceived feed quality and trust.",
    ],
    cons: [
      "Hybrid fanout is operationally complex and requires careful threshold tuning.",
      "Ranking depends on many features, which increases latency, observability, and model governance burden.",
      "Eventual consistency can make fresh posts, graph updates, and notifications appear at different times.",
      "Strict privacy and trust filtering can reduce cacheability and increase read-time checks.",
      "Second-degree expansion can become expensive and noisy without strong relevance filters.",
    ],
    alternativesMD: `
Alternative one is pure fanout-on-write. It is simple for reads and works for small networks, but high-degree creators, companies, and jobs create huge write amplification.

Alternative two is pure fanout-on-read. It avoids materialized inboxes but makes every feed open scan graph edges and actor timelines, which is too slow for hundreds of millions of members.

Alternative three is a chronological feed. It is easy to explain and cheap to rank, but it misses professional relevance, job intent, second-degree opportunities, and content quality signals.

Alternative four is an ML-only black-box ranker. It may optimize engagement, but without rules and guardrails it can over-promote noisy content, weaken trust, and fail to explain professional relevance.
`,
    whenNotToUseMD: `
Do not use this full design for a small internal company news feed or a simple chronological activity stream. A single database, basic follow table, and freshness ordering are enough until graph size, ranking quality, and fanout cost become real constraints.
`,
  },
  followUpQuestions: [
    {
      question: "How is LinkedIn Feed different from Facebook Feed?",
      answerMD: `
LinkedIn is centered on the professional and economic graph. Connections are professional relationships, follows can target companies and jobs, second-degree content needs professional justification, and ranking should value career relevance, hiring intent, industry learning, and trust instead of only social engagement.
`,
    },
    {
      question: "When do you fan out a post on write versus pull it on read?",
      answerMD: `
Fan out on write for normal-degree authors with high-affinity audiences and active followers. Pull on read for high-degree creators, large companies, jobs, viral posts, and uncertain-quality content. Use dynamic thresholds based on audience size, activity, quality, and freshness requirements.
`,
    },
    {
      question: "How do you support second-degree recommendations safely?",
      answerMD: `
Require stronger relevance evidence than for first-degree content: mutual connections, shared industry, followed company, skills match, job intent, or trusted engagement. Apply privacy filters and provide clear ranking reasons so the item does not feel random or invasive.
`,
    },
    {
      question: "How should dwell time influence ranking?",
      answerMD: `
Dwell time is a useful satisfaction signal, especially for articles and videos, but it must be normalized by content type, length, device, and position. Combine it with hides, reports, follows, comments, applications, and long-term retention so the ranker does not reward clickbait.
`,
    },
    {
      question: "What consistency is required for blocks and deletes?",
      answerMD: `
Feed ordering can be eventually consistent, but blocks, deletes, and visibility restrictions should be enforced quickly and fail-closed. Keep a small strongly refreshed privacy cache and invalidate feed candidates when sensitive graph or content status changes.
`,
    },
    {
      question: "How do you avoid repeated job changes or article reshares?",
      answerMD: `
Use canonical dedupe keys for the underlying professional event or URL, maintain a seen set in the ranking cursor, and aggregate social context into one card rather than showing every reshare or congratulation as a separate feed item.
`,
    },
    {
      question: "How do notifications relate to feed ranking?",
      answerMD: `
Both consume the activity stream, but notifications use stricter thresholds, fatigue controls, quiet hours, and channel preferences. Feed can show many relevant items passively; notifications should interrupt only for high-signal professional events.
`,
    },
  ],
  companyVariations: [
    {
      company: "LinkedIn",
      angleMD: `
LinkedIn interviewers will focus on the economic graph: connections versus follows, second-degree candidates, job and company updates, professional relevance, dwell-time features, trust, and hybrid fanout for high-degree creators and companies.
`,
    },
    {
      company: "Meta",
      angleMD: `
Meta may compare this directly with Facebook Feed. Be ready to explain why professional relevance, connection-degree weighting, company and job entities, dedupe, creator distribution, and privacy constraints change the ranking objective and fanout design.
`,
    },
    {
      company: "Microsoft",
      angleMD: `
Microsoft may frame the design around enterprise identity, Outlook and Teams notifications, Viva-style employee updates, compliance, and tenant boundaries. Emphasize access control, admin-owned company pages, auditability, and safe integration with productivity signals.
`,
    },
    {
      company: "Google",
      angleMD: `
Google may probe large-scale ranking systems, feature freshness, distributed graph storage, tail latency, experimentation, and abuse resistance. Expect follow-ups on model fallback, feature stores, and measuring long-term member value.
`,
    },
  ],
  relatedQuestions: [
    {
      slug: "facebook-feed",
      note: "Closest comparison point for feed ranking and fanout, but with different professional graph weighting.",
    },
    {
      slug: "twitter",
      note: "Shares follows, timelines, high-degree creators, fanout thresholds, and real-time ranking challenges.",
    },
    {
      slug: "instagram",
      note: "Useful contrast for media-heavy ranking, engagement signals, and creator distribution.",
    },
    {
      slug: "notification-service",
      note: "LinkedIn network activity requires notification dedupe, fanout, priority, and fatigue controls.",
    },
    {
      slug: "distributed-cache",
      note: "Feed candidate lists, graph features, and pagination state rely heavily on cache design.",
    },
  ],
  interviewTips: {
    commonMistakes: [
      "Treating LinkedIn Feed as a generic chronological social feed.",
      "Ignoring the difference between bidirectional connections and one-way follows.",
      "Using pure fanout-on-write for companies, celebrities, and jobs without discussing write amplification.",
      "Optimizing only for clicks while ignoring dwell time, hides, trust, and professional relevance.",
      "Forgetting privacy filters for blocks, mutes, private groups, deleted posts, and restricted company updates.",
      "Not explaining deduplication for repeated job changes, article reshares, and network activity.",
    ],
    redFlags: [
      "No concrete capacity estimate for hundreds of millions of feed readers.",
      "No graph model or second-degree candidate strategy.",
      "No fallback plan when the ranking service or feature store is slow.",
      "No moderation, spam, or engagement-manipulation protection.",
      "No separation between feed, notifications, and analytics event processing.",
    ],
    expectations: [
      "State read-heavy assumptions and compute feed QPS, content write QPS, event volume, and storage.",
      "Draw a hybrid architecture with feed service, graph service, ranker, content store, cache, event bus, and notification workers.",
      "Explain fanout-on-write versus fanout-on-read and choose hybrid thresholds.",
      "Discuss professional ranking features including connection degree, follows, jobs, companies, dwell time, and quality.",
      "Call out privacy, deduplication, diversity, and ranking fallback explicitly.",
      "Differentiate the design from Facebook Feed by emphasizing professional and economic graph relevance.",
    ],
    communicationMD: `
Start by defining the product distinction: LinkedIn Feed optimizes professional relevance and economic opportunity, not generic social entertainment. Then split the design into read path, write path, graph, ranking, event pipeline, and notifications. Use capacity math to justify caching and hybrid fanout, and repeatedly mention that privacy and trust filters are mandatory before any item is displayed.
`,
  },
  revisionNotesMD: `
- LinkedIn Feed is a read-heavy professional feed with hundreds of millions of members, not a simple chronological activity stream.
- The graph has bidirectional connections, one-way follows, company and group follows, blocks, mutes, and second-degree relationships.
- With 300M daily active members opening feed 8 times per day, expect about 2.4B feed opens daily, about 27,800 average read QPS, and about 278,000 peak read QPS.
- Use hybrid fanout: push candidate IDs for normal-degree actors and pull high-degree creators, companies, jobs, and viral posts at read time.
- Ranking should combine graph strength, connection degree, follow intent, industry and skill affinity, job intent, freshness, engagement quality, dwell time, hides, reports, and content quality.
- Dwell time is useful but must be normalized by content type and combined with negative feedback so clickbait does not win.
- Deduplicate repeated professional stories with canonical dedupe keys and preserve seen state in the cursor.
- Feed and notifications share an activity stream, but notifications need stricter thresholds, dedupe, fatigue controls, and channel preferences.
- Privacy filtering for blocks, deletes, restricted profiles, and private groups should fail closed.
- The key distinction from Facebook Feed is professional and economic graph relevance: jobs, companies, skills, industries, hiring, and second-degree opportunities matter.
`,
  flashcards: [
    {
      front: "What is the core challenge in LinkedIn Feed?",
      back: "Low-latency personalized ranking over a professional graph while handling hybrid fanout, privacy, deduplication, dwell signals, and notifications.",
    },
    {
      front: "How are connections different from follows?",
      back: "Connections are bidirectional professional relationships, usually stored as two directed edges after acceptance. Follows are one-way interest edges and do not imply reciprocal access.",
    },
    {
      front: "Why use hybrid fanout?",
      back: "It keeps reads fast for normal-degree authors while avoiding write amplification for high-degree creators, companies, jobs, and viral posts.",
    },
    {
      front: "What makes LinkedIn ranking different from Facebook ranking?",
      back: "LinkedIn prioritizes professional relevance, economic graph context, jobs, companies, skills, connection degree, trust, and long-term member value rather than only social engagement.",
    },
    {
      front: "Why is dwell time not enough by itself?",
      back: "Dwell varies by content type and can reward clickbait. It must be normalized and combined with hides, reports, comments, follows, applications, and quality signals.",
    },
    {
      front: "What should happen if the ranking service fails?",
      back: "Serve a fallback feed using cached pre-rank scores, freshness, connection degree, and quality while still enforcing privacy and moderation.",
    },
    {
      front: "How do you deduplicate repeated professional stories?",
      back: "Use canonical dedupe keys for events such as job changes, article URLs, job IDs, and polls, then aggregate social context into one card.",
    },
    {
      front: "Why separate notifications from feed?",
      back: "Notifications interrupt the member and need stricter priority, dedupe, fatigue, and quiet-hour rules, while feed can passively show a broader set of relevant items.",
    },
    {
      front: "What consistency is critical in LinkedIn Feed?",
      back: "Feed order can be eventually consistent, but privacy, blocks, deletes, and restricted visibility must be enforced quickly and fail closed.",
    },
  ],
  quiz: [
    {
      question: "Which relationship type should be treated as bidirectional in the graph after acceptance?",
      options: ["Follow", "Connection", "Company follow", "Topic follow"],
      answerIndex: 1,
      explanationMD: `
A connection is a reciprocal professional relationship and is commonly represented as two active directed edges. Follows are one-way interest edges.
`,
    },
    {
      question: "Why is pure fanout-on-write risky for LinkedIn Feed?",
      options: ["It prevents cursor pagination", "It writes every high-degree creator or company update to huge audiences", "It makes posts impossible to delete", "It removes the need for ranking"],
      answerIndex: 1,
      explanationMD: `
High-degree creators, companies, and jobs can have massive audiences. Writing every update to every follower inbox creates write amplification and cache churn.
`,
    },
    {
      question: "Given 300M daily active members and 8 feed opens per day, how many feed requests happen per day?",
      options: ["24M", "300M", "2.4B", "24B"],
      answerIndex: 2,
      explanationMD: `
300M members times 8 feed opens equals 2.4B feed requests per day.
`,
    },
    {
      question: "Which signal best captures whether a member spent meaningful time on an article or video?",
      options: ["Short code length", "Dwell time", "Connection invitation count", "Database replica count"],
      answerIndex: 1,
      explanationMD: `
Dwell time measures how long the member stayed with the item. It is useful for long-form professional content when normalized by content type and position.
`,
    },
    {
      question: "What should the feed do when privacy status cannot be verified for an item?",
      options: ["Show the item because ranking already selected it", "Fail closed and suppress the item", "Send a notification instead", "Mark the item as sponsored"],
      answerIndex: 1,
      explanationMD: `
Professional privacy and visibility rules are mandatory. If a block, delete, or restricted visibility check cannot be verified, suppress the item rather than risk leaking content.
`,
    },
    {
      question: "Which related system is most directly responsible for network activity alerts?",
      options: ["Notification service", "URL shortener", "Pastebin", "Distributed lock"],
      answerIndex: 0,
      explanationMD: `
LinkedIn network activity uses notification service concepts: priority, dedupe, fanout, channel preferences, quiet hours, and fatigue controls.
`,
    },
    {
      question: "What is the best reason to use dedupe keys in LinkedIn Feed?",
      options: ["To encrypt all post text", "To collapse repeated stories such as job changes and article reshares", "To replace the graph service", "To make every feed chronological"],
      answerIndex: 1,
      explanationMD: `
Dedupe keys group repeated professional events so the feed can show one aggregated story instead of many nearly identical updates.
`,
    },
  ],
  cheatSheetMD: `
**Goal**: serve a low-latency personalized professional feed of posts, articles, videos, polls, jobs, company updates, and network activity.

**Scale**: 300M daily active members, 8 feed opens each, about 2.4B feed requests per day, about 27,800 average read QPS, and about 278,000 peak read QPS with a 10x multiplier.

**Graph**: connections are bidirectional and strong; follows are one-way; companies, groups, schools, jobs, topics, and hashtags are graph entities; second-degree content needs stronger relevance proof.

**Architecture**: API gateway to feed service to feed cache, graph service, content store, and ranking service. Activity bus feeds fanout, notifications, ranking features, and analytics.

**Fanout**: use hybrid fanout. Push normal-degree author candidates to active members. Pull high-degree creators, companies, jobs, and viral posts at read time.

**Ranking**: combine relationship strength, connection degree, follow intent, industry and skill affinity, job intent, freshness, engagement quality, dwell time, hides, reports, and trust signals.

**Deduplication**: use canonical dedupe keys for job changes, article URLs, job IDs, polls, reshares, and company events. Keep seen state in the cursor.

**Consistency**: feed order can be eventually consistent, but privacy, blocks, deletes, restricted visibility, and moderation status must be enforced before display.

**Notifications**: consume the same activity stream but apply stricter priority, dedupe, fatigue, channel, and quiet-hour policies.

**Interview angle**: explicitly distinguish from Facebook Feed by emphasizing the professional network, connection-degree weighting, economic graph, and career relevance.
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
      title: "The Tail at Scale",
      kind: "Paper",
      url: "https://research.google/pubs/the-tail-at-scale/",
      author: "Jeffrey Dean and Luiz Andre Barroso",
    },
    {
      title: "Kafka: a Distributed Messaging System for Log Processing",
      kind: "Paper",
      url: "https://www.microsoft.com/en-us/research/publication/kafka-a-distributed-messaging-system-for-log-processing/",
      author: "Jay Kreps, Neha Narkhede, and Jun Rao",
    },
    {
      title: "LinkedIn Engineering Blog",
      kind: "Blog",
      url: "https://www.linkedin.com/blog/engineering",
      author: "LinkedIn Engineering",
    },
  ],
};
