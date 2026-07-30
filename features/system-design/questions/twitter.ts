import type { SDQuestionContent } from "../types";

export const twitterContent: SDQuestionContent = {
  slug: "twitter",
  statementMD: `
Design Twitter, now commonly known as X. The system lets users publish short posts, follow other users, open a personalized home timeline, view user profiles, search public tweets, see trends, and attach media. The interview focus is not a CRUD feed; it is delivering fresh, low-latency timelines to hundreds of millions of daily users while writes can fan out to millions of followers.

At scale, the central design decision is home-timeline generation. Fanout-on-write pushes a new tweet into follower timeline caches when it is posted. Fanout-on-read pulls recent tweets from followed accounts when a reader opens the app. A strong production design uses a hybrid: push ordinary authors to follower timelines, but pull celebrity and high-follower accounts at read time to avoid fanout storms.

The default architecture should separate tweet storage, social graph storage, timeline caches, fanout queues, media storage, search, trending, and ranking. Reads are much heavier than writes, fanout is extremely skewed, and the system must degrade gracefully when queue backlogs, cache misses, celebrity events, or ranking failures happen.
`,
  businessUseCaseMD: `
Twitter is a real-time public conversation product. Users expect to publish instantly, follow news as it happens, discover creators, search public discussion, and consume media with low latency across mobile and web clients.

For a business, the feed drives engagement, ads, creator growth, brand monitoring, support, emergency communication, and live-event discovery. A reliable timeline system becomes a distribution platform where ranking, freshness, safety, and relevance directly affect retention and revenue.
`,
  functionalRequirements: [
    "Allow users to create, delete, and view tweets with text, metadata, and optional media attachments.",
    "Allow users to follow and unfollow other users and maintain the social graph.",
    "Serve a home timeline containing recent and ranked tweets from followed accounts.",
    "Serve a user profile timeline containing tweets from a single author.",
    "Support search over public tweets and trending topics by region or language.",
    "Support likes, replies, reposts, and counters without slowing timeline reads.",
    "Handle media upload, processing, storage, and delivery through object storage and CDN.",
    "Apply privacy, blocking, muting, safety, and visibility rules before returning content.",
  ],
  nonFunctionalRequirements: [
    {
      label: "Timeline latency",
      detailMD: `
Home timeline opens should return the first page in under 200ms p99 inside a region after authentication. The service should use cached tweet IDs, batched hydration, and bounded ranking work so mobile users see content quickly.
`,
    },
    {
      label: "Write freshness",
      detailMD: `
Tweets from ordinary accounts should appear in follower home timelines within a few seconds. For celebrities, freshness can be achieved by pulling their recent tweets during reads rather than pushing millions of entries synchronously.
`,
    },
    {
      label: "Availability",
      detailMD: `
Timeline reads must remain available even if search, trends, media processing, analytics, or some ranking features degrade. A practical target is 99.99 percent availability for read APIs, with graceful fallback to cached chronological timelines.
`,
    },
    {
      label: "Scalability under fanout skew",
      detailMD: `
The system must support a heavy-tailed follower graph where most users have small audiences and a small number of accounts have tens or hundreds of millions of followers. The design must isolate celebrity writes from normal fanout work.
`,
    },
    {
      label: "Durability",
      detailMD: `
Once a tweet is accepted, the canonical tweet record and media references must be durably stored before the client receives success. Timeline cache entries are derived data and can be rebuilt from tweet storage and the graph.
`,
    },
    {
      label: "Consistency and correctness",
      detailMD: `
Tweet creation needs read-after-write for the author profile. Home timelines can be eventually consistent by a few seconds, but deletes, protected accounts, blocks, and safety takedowns must be enforced quickly through cache invalidation and final visibility checks.
`,
    },
    {
      label: "Cost efficiency",
      detailMD: `
Pushing every tweet to every follower is wasteful for high-follower authors and inactive users. Store only recent tweet IDs in timeline cache, pull celebrity content on demand, expire inactive-user timelines, and keep media bytes outside tweet storage.
`,
    },
  ],
  capacityEstimation: {
    assumptionsMD: `
Assume 300M daily active users, each opening the home timeline 10 times per day on average, with each first page returning 50 tweet IDs and hydrated tweet objects. Assume 150M new tweets per day, a 10x peak traffic multiplier, an average tweet metadata record of 1 KB before replication, and 20 percent of tweets containing media.

For fanout math, assume an ordinary author has 200 followers on average. The follower distribution is heavy-tailed, so celebrity accounts are not pushed to all followers. Timeline caches keep about 1,000 recent tweet IDs for recently active users, not for every registered user forever.
`,
    metrics: [
      {
        label: "Daily active users",
        value: "300M DAU",
        note: "Hundreds of millions of users opening feeds globally",
      },
      {
        label: "Home timeline reads",
        value: "3B reads per day",
        note: "300M users times 10 home opens per day",
      },
      {
        label: "Average timeline QPS",
        value: "35K reads per second",
        note: "3B divided by 86,400 seconds",
      },
      {
        label: "Peak timeline QPS",
        value: "350K reads per second",
        note: "10x average peak for live events and regional bursts",
      },
      {
        label: "Tweet writes",
        value: "150M tweets per day",
        note: "About 1,736 tweet creates per second on average",
      },
      {
        label: "Peak tweet writes",
        value: "17K writes per second",
        note: "10x average write peak",
      },
      {
        label: "Naive fanout work",
        value: "30B timeline inserts per day",
        note: "150M tweets times 200 average followers before celebrity exceptions",
      },
      {
        label: "Average fanout insert rate",
        value: "347K inserts per second",
        note: "30B divided by 86,400 seconds",
      },
      {
        label: "Tweet storage",
        value: "150 GB raw per day",
        note: "150M tweet records times 1 KB before indexes and replication",
      },
      {
        label: "Timeline cache memory",
        value: "About 2 TB for active users",
        note: "60M recently active users times roughly 32 KB per cached timeline",
      },
      {
        label: "Media ingest",
        value: "30 TB raw per day",
        note: "20 percent of 150M tweets with 1 MB average media payload",
      },
    ],
    calculationsMD: `
- Home timeline reads: 300M DAU times 10 opens per day equals 3B timeline reads per day. 3B divided by 86,400 seconds is about 34,722 reads per second, rounded to 35K average QPS.
- Peak reads: applying a 10x multiplier for traffic bursts gives about 350K home timeline reads per second.
- Tweet writes: 150M tweets per day divided by 86,400 seconds is about 1,736 writes per second. With 10x peak, plan for about 17K tweet creates per second.
- Naive fanout: if every tweet were pushed to 200 followers, the system would create 30B home timeline entries per day. 30B divided by 86,400 seconds is about 347K timeline inserts per second on average, before peaks.
- Tweet storage: 150M tweets times 1 KB is 150 GB raw per day. With 3x replication, indexes, counters, and compaction headroom, plan for several hundred GB per day.
- Timeline cache: 1,000 tweet IDs per user at 16 bytes each is 16 KB raw. With scores, timestamps, Redis or cache overhead, and fragmentation, budget roughly 32 KB. Caching 60M recently active users requires about 1.9 TB.
- Media: if 20 percent of tweets have media, 30M media tweets per day at 1 MB average is 30 TB raw per day before transcoding variants, thumbnails, replication, and CDN cache copies.
`,
  },
  apiDesign: {
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/tweets",
        descriptionMD: `
Creates a tweet for the authenticated user. The tweet record is persisted first, then asynchronous indexing, fanout, counter initialization, and safety processing begin.
`,
        request: `
{
  "authorId": "user_123",
  "text": "Designing timelines is mostly about fanout tradeoffs.",
  "mediaIds": ["media_456"],
  "replyToTweetId": null,
  "visibility": "public"
}
`,
        response: `
{
  "tweetId": "tweet_789",
  "authorId": "user_123",
  "createdAt": "2026-07-26T06:59:18Z",
  "fanoutMode": "push",
  "status": "created"
}
`,
        statusCodes: [
          { code: 201, meaning: "Tweet created" },
          { code: 400, meaning: "Invalid text, media, reply, or visibility" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "User is suspended or cannot post" },
          { code: 429, meaning: "Rate limit exceeded" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/timelines/home",
        descriptionMD: `
Returns the authenticated user's home timeline. The service reads cached timeline IDs, pulls celebrity candidates, applies visibility filters, ranks candidates, hydrates tweet objects, and returns a cursor.
`,
        response: `
{
  "items": [
    {
      "tweetId": "tweet_789",
      "authorId": "user_123",
      "text": "Designing timelines is mostly about fanout tradeoffs.",
      "createdAt": "2026-07-26T06:59:18Z",
      "media": [
        { "mediaId": "media_456", "cdnUrl": "https://cdn.example.com/media_456" }
      ],
      "rankScore": 0.94
    }
  ],
  "nextCursor": "cursor_abc",
  "generatedAt": "2026-07-26T07:00:02Z"
}
`,
        statusCodes: [
          { code: 200, meaning: "Timeline returned" },
          { code: 401, meaning: "Authentication required" },
          { code: 429, meaning: "Read rate limit exceeded" },
          { code: 503, meaning: "Timeline temporarily degraded" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/users/{userId}/tweets",
        descriptionMD: `
Returns a user profile timeline in reverse chronological order. This path is simpler than home timeline because it reads one author's tweet index and applies visibility checks.
`,
        response: `
{
  "userId": "user_123",
  "items": [
    { "tweetId": "tweet_789", "createdAt": "2026-07-26T06:59:18Z" }
  ],
  "nextCursor": "profile_cursor_1"
}
`,
        statusCodes: [
          { code: 200, meaning: "Profile tweets returned" },
          { code: 401, meaning: "Authentication required for protected profiles" },
          { code: 403, meaning: "Viewer cannot access this profile" },
          { code: 404, meaning: "User not found" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/follows",
        descriptionMD: `
Creates a follow edge from the authenticated user to another account. The graph update may trigger timeline backfill so the follower sees recent tweets from the followed user.
`,
        request: `
{
  "followerId": "user_456",
  "followeeId": "user_123"
}
`,
        response: `
{
  "followerId": "user_456",
  "followeeId": "user_123",
  "state": "active",
  "createdAt": "2026-07-26T07:00:10Z"
}
`,
        statusCodes: [
          { code: 201, meaning: "Follow created" },
          { code: 400, meaning: "Invalid follow request" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Blocked, protected, or policy restricted" },
          { code: 409, meaning: "Follow edge already exists" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/search/tweets",
        descriptionMD: `
Searches public tweets by query, language, region, and cursor. Search is served from a separate index so timeline serving does not scan the tweet store.
`,
        response: `
{
  "query": "timeline fanout",
  "items": [
    { "tweetId": "tweet_789", "authorId": "user_123", "createdAt": "2026-07-26T06:59:18Z" }
  ],
  "nextCursor": "search_cursor_1"
}
`,
        statusCodes: [
          { code: 200, meaning: "Search results returned" },
          { code: 400, meaning: "Invalid query" },
          { code: 401, meaning: "Authentication required for this search" },
          { code: 429, meaning: "Search rate limit exceeded" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/trends",
        descriptionMD: `
Returns trending topics for a region, language, or global scope. Trends are computed asynchronously from tweet and engagement streams.
`,
        response: `
{
  "scope": "global",
  "topics": [
    { "label": "World Cup", "tweetVolume": 1250000, "score": 98.7 }
  ],
  "freshnessSeconds": 30
}
`,
        statusCodes: [
          { code: 200, meaning: "Trends returned" },
          { code: 400, meaning: "Invalid region or language" },
          { code: 429, meaning: "Rate limit exceeded" },
        ],
      },
    ],
    notesMD: `
Do not expose the fanout implementation through the API. Clients ask for timelines, tweets, follows, search, and trends. The server decides whether a tweet was pushed into the user's cached timeline, pulled from celebrity accounts, or blended by ranking.

Tweet creation should not wait for home-timeline fanout to every follower. It should wait for durable tweet storage, then publish events to queues for fanout, search indexing, trends, notifications, counters, and safety.
`,
  },
  databaseDesign: {
    schemaMD: `
The canonical tweet store is keyed by **tweet_id** and optimized for immutable append-heavy writes plus point hydration. The social graph is a separate high-cardinality relationship store optimized for both following and followers queries. Home timeline entries are derived data keyed by **user_id** and recent time.

A relational schema can describe the model, but production scale usually uses distributed key-value, wide-column, graph, search, and object stores for different access patterns.
`,
    tables: [
      {
        name: "tweets",
        columns: [
          { name: "tweet_id", type: "bigint or uuid", note: "Primary key; time-sortable Snowflake-style ID is common" },
          { name: "author_id", type: "bigint", note: "User who created the tweet" },
          { name: "text", type: "varchar(280)", note: "Tweet body after validation and normalization" },
          { name: "media_ids", type: "json", note: "Small list of object-store media references" },
          { name: "reply_to_tweet_id", type: "bigint nullable", note: "Parent tweet for replies" },
          { name: "created_at", type: "timestamp", note: "Creation time derived from ID or server clock" },
          { name: "visibility", type: "varchar(20)", note: "Public, protected, deleted, limited, or takedown" },
          { name: "language", type: "varchar(16)", note: "Detected or declared language for ranking and search" },
        ],
      },
      {
        name: "follow_edges",
        columns: [
          { name: "follower_id", type: "bigint", note: "User who follows another account" },
          { name: "followee_id", type: "bigint", note: "User being followed" },
          { name: "created_at", type: "timestamp", note: "Follow creation time" },
          { name: "state", type: "varchar(20)", note: "Active, pending, blocked, muted, or removed" },
          { name: "notification_level", type: "varchar(20)", note: "Optional preference for push notifications" },
        ],
      },
      {
        name: "home_timeline_entries",
        columns: [
          { name: "user_id", type: "bigint", note: "Partition key for the receiving user" },
          { name: "tweet_id", type: "bigint", note: "Tweet candidate stored as an ID, not a full tweet object" },
          { name: "author_id", type: "bigint", note: "Used for filtering and pull deduplication" },
          { name: "source", type: "varchar(20)", note: "Push, backfill, ad, recommendation, or system entry" },
          { name: "inserted_at", type: "timestamp", note: "When the entry was added to the cached timeline" },
          { name: "rank_hint", type: "double", note: "Optional precomputed score for candidate ordering" },
        ],
      },
      {
        name: "media_objects",
        columns: [
          { name: "media_id", type: "uuid", note: "Primary key for uploaded media" },
          { name: "owner_id", type: "bigint", note: "Uploader" },
          { name: "object_key", type: "varchar(512)", note: "Path in object storage" },
          { name: "media_type", type: "varchar(32)", note: "Image, video, gif, or thumbnail" },
          { name: "processing_state", type: "varchar(32)", note: "Uploaded, scanning, transcoding, ready, or rejected" },
          { name: "created_at", type: "timestamp", note: "Upload time" },
        ],
      },
    ],
    indexesMD: `
- **tweets.tweet_id** is the primary key for hydration and delete checks.
- **tweets.author_id, created_at** supports profile timelines and author history.
- **follow_edges.follower_id, followee_id** supports home timeline pulls from accounts a user follows.
- **follow_edges.followee_id, follower_id** supports fanout workers finding followers of an author.
- **home_timeline_entries.user_id, inserted_at** supports recent home timeline reads and bounded trimming.
- Search terms, hashtags, and entities belong in a dedicated inverted index, not as secondary indexes on the tweet store.
`,
    relationshipsMD: `
Tweets belong to authors. Follow edges connect followers to followees and drive both push fanout and read-time pull. Home timeline entries reference tweets but are not source of truth; they can be deleted, trimmed, or rebuilt. Media records reference object storage and are linked from tweets through **media_ids**.
`,
    noSqlAlternativesMD: `
Use a distributed wide-column or key-value store such as Manhattan, Cassandra, DynamoDB, Bigtable, or FoundationDB for tweets and timeline entries. Partition tweets by **tweet_id** or author-time buckets, and partition home timelines by **user_id** with reverse-time ordering. Use a graph-optimized store or carefully sharded edge tables for follow relationships.

Use Elasticsearch, OpenSearch, Solr, or a custom inverted index for search. Use object storage such as S3, GCS, or Azure Blob for media and serve through CDN. Keep counters, analytics, and trend aggregates in streaming and OLAP systems rather than updating canonical tweet rows synchronously.
`,
  },
  architecture: {
    width: 980,
    height: 580,
    nodes: [
      { id: "client", label: "Client", kind: "client", x: 70, y: 230, sublabel: "Mobile, web" },
      { id: "cdn", label: "CDN", kind: "cdn", x: 210, y: 90, sublabel: "Media, edge cache" },
      { id: "api-gateway", label: "API Gateway", kind: "gateway", x: 230, y: 250, sublabel: "Auth, routing" },
      { id: "tweet-service", label: "Tweet Service", kind: "service", x: 420, y: 120, sublabel: "Create, delete" },
      { id: "timeline-service", label: "Timeline Service", kind: "service", x: 430, y: 290, sublabel: "Home reads" },
      { id: "ranking-service", label: "Ranking Service", kind: "service", x: 430, y: 455, sublabel: "Candidate scoring" },
      { id: "fanout-queue", label: "Fanout Queue", kind: "queue", x: 610, y: 70, sublabel: "Kafka, Pulsar" },
      { id: "fanout-worker", label: "Fanout Workers", kind: "worker", x: 770, y: 80, sublabel: "Push timelines" },
      { id: "timeline-cache", label: "Timeline Cache", kind: "cache", x: 760, y: 245, sublabel: "Redis, Memcached" },
      { id: "tweet-store", label: "Tweet Store", kind: "database", x: 610, y: 210, sublabel: "KV, wide-column" },
      { id: "graph-store", label: "Graph Store", kind: "database", x: 620, y: 365, sublabel: "Followers" },
      { id: "media-store", label: "Media Store", kind: "storage", x: 770, y: 430, sublabel: "Object storage" },
      { id: "search-trending", label: "Search and Trends", kind: "search", x: 885, y: 285, sublabel: "Index, stream jobs" },
    ],
    edges: [
      { from: "client", to: "cdn", label: "media fetch" },
      { from: "client", to: "api-gateway", label: "API request" },
      { from: "cdn", to: "media-store", label: "origin miss" },
      { from: "api-gateway", to: "tweet-service", label: "post or delete" },
      { from: "api-gateway", to: "timeline-service", label: "home timeline" },
      { from: "tweet-service", to: "tweet-store", label: "persist tweet" },
      { from: "tweet-service", to: "media-store", label: "media refs", dashed: true },
      { from: "tweet-service", to: "fanout-queue", label: "tweet event", dashed: true },
      { from: "tweet-service", to: "search-trending", label: "index event", dashed: true },
      { from: "fanout-queue", to: "fanout-worker", label: "consume" },
      { from: "fanout-worker", to: "graph-store", label: "load followers" },
      { from: "fanout-worker", to: "timeline-cache", label: "push tweet ids" },
      { from: "timeline-service", to: "timeline-cache", label: "read cached ids" },
      { from: "timeline-service", to: "graph-store", label: "pull follows" },
      { from: "timeline-service", to: "tweet-store", label: "hydrate tweets" },
      { from: "timeline-service", to: "ranking-service", label: "rank candidates" },
      { from: "ranking-service", to: "tweet-store", label: "features" },
      { from: "timeline-service", to: "search-trending", label: "search, trends" },
    ],
    captionMD: `
Tweet creation persists the canonical tweet, then publishes asynchronous events for fanout, search, trends, counters, and safety. Home timeline reads combine cached pushed IDs with read-time pulls, rank them, hydrate tweet objects, and return media URLs served separately through CDN.
`,
  },
  architectureNotesMD: `
The architecture intentionally separates source-of-truth data from derived serving views. The tweet store and graph store are durable. Home timeline cache is a derived, bounded list of tweet IDs per active user. If the cache is lost, the system can rebuild or serve a degraded pull-based timeline from the graph and tweet store.

Fanout workers consume tweet events from a durable queue. For normal authors, workers load followers and append tweet IDs into follower timeline caches. For celebrity or high-follower authors, workers skip or limit push fanout and mark the author for read-time pull. This hybrid keeps ordinary timelines fresh without letting one celebrity tweet create a storm of millions of writes.

Media is not stored in the tweet database. Clients upload media to an object store through a media service, background jobs scan and transcode it, and tweets reference media IDs. CDN delivers media bytes so timeline APIs only return metadata and URLs.
`,
  requestFlow: [
    {
      title: "Tweet creation request arrives",
      detailMD: `
The authenticated client sends text, optional media IDs, reply metadata, and visibility. The API gateway validates identity, applies rate limits, and routes the request to the Tweet Service.
`,
    },
    {
      title: "Tweet is validated and persisted",
      detailMD: `
The Tweet Service validates length, media readiness, reply existence, user status, and safety policy. It creates a time-sortable tweet ID and writes the canonical record to the Tweet Store before acknowledging success.
`,
    },
    {
      title: "Asynchronous events are published",
      detailMD: `
After durable storage, the service publishes events for fanout, search indexing, trend aggregation, notification delivery, counters, and safety review. The write path does not wait for all follower timelines to update.
`,
    },
    {
      title: "Fanout strategy is selected",
      detailMD: `
The Fanout Service checks the author's follower count, activity distribution, and account class. Ordinary authors use fanout-on-write. Celebrity authors are put on a pull list or receive capped push fanout only to highly active followers.
`,
    },
    {
      title: "Push fanout updates timeline caches",
      detailMD: `
Fanout workers read follower IDs from the graph store in pages and append the tweet ID to each follower's home timeline cache. Workers trim each list to a bounded recent window and record progress so retries are idempotent.
`,
    },
    {
      title: "Home timeline read starts from cache",
      detailMD: `
When a user opens the app, the Timeline Service reads recent tweet IDs from the user's timeline cache. Cache entries contain IDs, timestamps, source hints, and optional precomputed rank hints, not full tweet objects.
`,
    },
    {
      title: "Celebrity and gap candidates are pulled",
      detailMD: `
The Timeline Service uses the social graph to find followed celebrity accounts and pulls their recent tweets from author timelines. It can also pull additional candidates if the cached timeline is sparse, stale, or was never warmed for an inactive user.
`,
    },
    {
      title: "Visibility filters and ranking run",
      detailMD: `
Candidates are deduplicated and filtered for deletes, blocks, mutes, protected accounts, safety labels, and language preferences. The Ranking Service scores candidates using freshness, relationship strength, engagement, and quality signals.
`,
    },
    {
      title: "Tweets are hydrated and returned",
      detailMD: `
The Timeline Service batch-fetches tweet objects, author snippets, counters, and media metadata. It returns the first page with a cursor and leaves analytics, impression logging, and counter updates to asynchronous streams.
`,
    },
  ],
  coreComponents: [
    {
      name: "Tweet Service",
      kind: "service",
      role: "Owns tweet creation, deletion, validation, and canonical persistence.",
      detailMD: `
The Tweet Service creates IDs, validates text and media references, writes durable tweet records, records delete or visibility changes, and publishes events. It should be stateless and idempotent so client retries do not create duplicate tweets.
`,
    },
    {
      name: "Social Graph Service",
      kind: "database",
      role: "Stores follower and following edges used by fanout and read-time pulls.",
      detailMD: `
The graph supports two critical queries: accounts a user follows and followers of an author. It must handle high-degree celebrity nodes, fast pagination, block and mute relationships, and follow changes that trigger timeline backfill or cleanup.
`,
    },
    {
      name: "Fanout Service",
      kind: "worker",
      role: "Consumes tweet events and updates follower timeline caches.",
      detailMD: `
Fanout workers batch graph reads, append tweet IDs to recipient timelines, track progress, retry safely, and skip or cap celebrity fanout. Work should be partitioned by author or recipient ranges to avoid duplicate inserts and preserve operational control.
`,
    },
    {
      name: "Home Timeline Service",
      kind: "service",
      role: "Serves the main read path for personalized timelines.",
      detailMD: `
This service reads cached IDs, pulls celebrity candidates, applies visibility filters, calls ranking, hydrates tweets, and returns a cursor. It should degrade to chronological cached timelines if ranking or feature services are slow.
`,
    },
    {
      name: "Timeline Cache",
      kind: "cache",
      role: "Stores bounded recent tweet ID lists for active users.",
      detailMD: `
Redis, Memcached, or a custom timeline store keeps recent tweet IDs per user. The cache enables fast reads and decouples home timeline serving from scanning the graph on every request. It is derived state and can be rebuilt.
`,
    },
    {
      name: "Ranking Service",
      kind: "service",
      role: "Scores and orders candidates for engagement and relevance.",
      detailMD: `
Ranking combines freshness, relationship strength, engagement signals, author quality, language, safety, and user preferences. It must have strict latency budgets, cached features, and fallbacks to avoid blocking timeline reads.
`,
    },
    {
      name: "Search and Trending Pipeline",
      kind: "search",
      role: "Indexes tweets and computes trending topics from streams.",
      detailMD: `
Tweet and engagement events flow into stream processors that update inverted indexes and trend aggregates. Search and trends should be fresh enough for real-time discovery but isolated from home timeline availability.
`,
    },
    {
      name: "Media Service and Object Store",
      kind: "storage",
      role: "Handles uploads, scanning, transcoding, storage, and CDN delivery.",
      detailMD: `
Media bytes are stored separately from tweet metadata. The service issues upload URLs, scans for abuse, creates thumbnails and video variants, stores objects durably, and returns CDN URLs for timeline hydration.
`,
    },
  ],
  deepDives: [
    {
      topic: "Fanout-on-write versus fanout-on-read",
      detailMD: `
Fanout-on-write pushes a new tweet into follower home timelines when the tweet is created. It makes reads very fast because opening the home timeline is mostly a cache lookup plus hydration. It works well for ordinary accounts because follower counts are modest and writes are less frequent than timeline reads.

The downside is write amplification. An account with 50M followers would create 50M timeline inserts for one tweet. That can overwhelm queues, graph reads, cache shards, and storage, especially during live events when many high-follower accounts post together.

Fanout-on-read does the opposite. It stores the tweet once and, when a user opens the app, reads recent tweets from all followed accounts. It avoids write storms and handles celebrity accounts naturally, but read latency grows with the number of follows and requires many author timeline reads. Pure pull is hard for users who follow thousands of accounts.

The strong answer is hybrid. Push ordinary authors to active followers. Pull high-follower authors during reads. Optionally push celebrity tweets only to the most active or notification-enabled followers. This matches the skewed graph and keeps both writes and reads bounded.
`,
    },
    {
      topic: "Hybrid celebrity handling and fanout thresholds",
      detailMD: `
Celebrity classification should not be a single static number. Use follower count, active follower count, posting rate, engagement, queue pressure, regional traffic, and recent virality. An account with 5M followers but few active followers may still be pushable during off-peak periods, while an account with 500K very active followers can be expensive.

A practical policy has bands. Small and medium authors use full push. Large authors use capped push to active followers and pull for everyone else. Mega celebrities use pull-only for home timelines, with optional notifications handled by a separate system. The Fanout Service should make this decision at event time and include enough metadata for timeline reads to pull the right accounts.

Timeline reads maintain a list of followed pull-author IDs. For each request, the Timeline Service fetches recent tweets from those authors, merges them with cached pushed IDs, deduplicates by tweet ID, and ranks the combined candidate set. This avoids fanout storms while preserving freshness for famous accounts.
`,
    },
    {
      topic: "Timeline cache design",
      detailMD: `
The home timeline cache should store tweet IDs, timestamps, author IDs, source, and small rank hints, not full tweet objects. Full objects change when counters, labels, media processing, or deletes change. Storing IDs keeps cache entries compact and allows batch hydration from the Tweet Store and feature services.

Each user's cached list should be bounded, commonly hundreds to a few thousand IDs. Fanout workers append new IDs and trim old entries. Inactive users can have their cache expired and rebuilt lazily from recent follows when they return. This saves memory because caching every registered user's timeline forever is not economical.

Cache correctness requires final visibility checks. A cached ID may refer to a deleted tweet, a newly blocked author, a protected account, or a safety-limited tweet. The Timeline Service filters after hydration and can remove invalid entries asynchronously. For hard takedowns, maintain a small deny-list cache checked before returning results.
`,
    },
    {
      topic: "Social graph storage and sharding",
      detailMD: `
The graph has two access patterns with different hot spots. Home timeline reads need the list of accounts a user follows. Fanout workers need the followers of an author. Store both directions or maintain two materialized edge indexes because reversing one index at runtime is too expensive.

Shard by user ID for following lists and by followee ID for follower lists. Celebrity follower lists become huge partitions, so split them into pages or shards by follower ID ranges. Fanout workers can process pages independently and checkpoint progress. Follow and unfollow operations update both directions with idempotent writes.

Blocks, mutes, protected follows, and privacy rules are graph-adjacent state. Some can be stored as separate edge types, but timeline serving should receive a compact visibility decision or filter set so it does not perform many graph lookups per tweet.
`,
    },
    {
      topic: "Ranking, hydration, and read latency",
      detailMD: `
A home timeline request should not rank the entire social graph. It should rank a bounded candidate set, such as a few hundred pushed IDs plus recent pull candidates from celebrity accounts. Candidate generation must be fast and predictable before the ranking model runs.

Hydration is often the hidden latency bottleneck. The service needs tweet text, author info, media metadata, counters, viewer relationship state, and safety labels. Use batch APIs, cache hot tweet and author objects, parallelize independent fetches, and enforce deadlines. Return a good enough timeline rather than waiting for every feature.

Ranking should have tiered fallbacks. If the model service is healthy, use personalized ranking. If it is slow, use cached rank hints and freshness. If feature fetches fail, use reverse chronological order. The user should still see a timeline.
`,
    },
    {
      topic: "Search, trends, and media separation",
      detailMD: `
Search and trends are not served from the home timeline cache. Tweet events flow into a search index for keyword, hashtag, author, and entity queries. Engagement and tweet streams feed trend detectors that compare recent volume against baselines by region and language.

Search freshness matters, but it should not block tweet creation. The create response can succeed before the tweet is searchable. Indexing systems should support retries, duplicate events, deletes, and safety labels so removed content disappears from search quickly.

Media follows a separate lifecycle. Uploads are scanned, transcoded, and stored in object storage. Timelines return metadata and CDN URLs. This prevents large media payloads from bloating tweet records, timeline caches, queues, and replication traffic.
`,
    },
  ],
  scaling: [
    {
      stage: "Prototype: single region and simple pull timeline",
      detailMD: `
Start with one API service, a relational database for tweets and follows, and a simple pull model that reads recent tweets from followed accounts. Add basic Redis caching for tweet objects and profile timelines. This proves correctness, APIs, and privacy rules.
`,
    },
    {
      stage: "Growth: split stores and add fanout-on-write",
      detailMD: `
Move tweets and graph edges to separately scaled stores. Add a fanout queue and workers that push tweet IDs into Redis home timelines for ordinary authors. Keep search indexing and media processing asynchronous. Add batch hydration and timeline cursors.
`,
    },
    {
      stage: "Large scale: hybrid fanout and sharded timeline cache",
      detailMD: `
Introduce celebrity thresholds, active-follower targeting, pull lists, and bounded home timeline caches. Shard graph follower lists and timeline cache by user ID. Track queue lag by author class and isolate high-fanout work from normal fanout.
`,
    },
    {
      stage: "Global scale: regional reads and event replication",
      detailMD: `
Serve home timelines from nearby regions using replicated tweet stores, regional timeline caches, and regional media CDNs. Write tweets in a home region or globally replicated log, then stream events to other regions. Keep deletes and safety takedowns on a faster invalidation path.
`,
    },
    {
      stage: "Staff scale: ML ranking, real-time search, and resilience",
      detailMD: `
Add feature stores, online ranking models, experimentation, trend detection, ads blending, abuse automation, and operational controls. Use graceful degradation paths for model outages, queue backlogs, cache loss, and celebrity spikes. Continuously measure freshness, p99 latency, and bad-content exposure.
`,
    },
  ],
  bottlenecks: [
    {
      issue: "Celebrity fanout storm",
      optimizationMD: `
Do not push every celebrity tweet to every follower. Classify high-follower authors, cap push to active followers, pull celebrity tweets at read time, and isolate celebrity fanout queues from normal author queues.
`,
    },
    {
      issue: "Timeline cache memory growth",
      optimizationMD: `
Store only tweet IDs and small metadata, bound each user's list, trim aggressively, expire inactive timelines, and rebuild lazily. Keep full tweet objects in a separate cache or store.
`,
    },
    {
      issue: "Graph hot partitions",
      optimizationMD: `
Shard celebrity follower lists into pages or ranges, checkpoint fanout progress per shard, store both follower and following indexes, and throttle graph scans under queue pressure.
`,
    },
    {
      issue: "Fanout queue backlog",
      optimizationMD: `
Partition queues by author class and region, autoscale workers, batch cache writes, make fanout idempotent, skip stale entries when necessary, and expose freshness metrics per cohort.
`,
    },
    {
      issue: "Hydration and ranking latency",
      optimizationMD: `
Limit candidate count, batch tweet and author fetches, cache hot objects, run independent calls in parallel, set strict deadlines, and fall back to chronological ranking when model or feature services are slow.
`,
    },
    {
      issue: "Search and trend freshness lag",
      optimizationMD: `
Use durable event streams, idempotent index updates, stream processors with lag monitoring, regional trend windows, and separate catch-up workers so search delays do not affect home timeline reads.
`,
    },
  ],
  failureHandling: [
    {
      scenario: "Timeline cache outage",
      strategyMD: `
Serve a degraded pull-based timeline for active follows, use profile timeline caches where available, reduce page size, and avoid stampeding the tweet and graph stores. Rewarm caches gradually after recovery.
`,
    },
    {
      scenario: "Fanout queue unavailable or badly delayed",
      strategyMD: `
Continue accepting tweets after durable storage, mark fanout freshness as degraded, pull more candidates at read time, and drain the backlog later. If lag grows too large, skip stale push entries and rely on pull for freshness.
`,
    },
    {
      scenario: "Graph store partial failure",
      strategyMD: `
Use cached follow lists for timeline reads, pause expensive backfills, retry fanout graph pages with checkpoints, and return cached timelines with clear internal degradation signals. Do not corrupt follow state with partial writes.
`,
    },
    {
      scenario: "Celebrity live-event spike",
      strategyMD: `
Switch affected authors to pull-only or capped fanout, isolate their queues, increase cache replication for hot tweet objects, and temporarily reduce ranking complexity. Protect ordinary user fanout from starvation.
`,
    },
    {
      scenario: "Media processing or CDN outage",
      strategyMD: `
Continue serving text timelines, show placeholders for unavailable media, retry processing jobs, and route CDN traffic to another region or origin. Tweet storage and timeline reads should not depend on media bytes being ready.
`,
    },
    {
      scenario: "Bad ranking deployment",
      strategyMD: `
Use canaries, shadow scoring, automated rollback, and kill switches. Fall back to cached rank hints or reverse chronological ordering if ranking quality, latency, or error rate crosses thresholds.
`,
    },
  ],
  security: [
    {
      label: "Authentication and authorization",
      detailMD: `
Require authenticated writes and enforce ownership for deletes. Timeline reads must respect protected accounts, blocks, mutes, suspensions, takedowns, age restrictions, and regional legal restrictions.
`,
    },
    {
      label: "Spam and abuse prevention",
      detailMD: `
Apply rate limits, reputation scoring, duplicate-content detection, bot signals, link scanning, and coordinated-abuse detection. Abuse controls should operate before fanout when possible to avoid distributing harmful content widely.
`,
    },
    {
      label: "Privacy filtering",
      detailMD: `
Do not rely only on fanout-time checks. A viewer may block an author or lose access after a tweet was cached. Apply final visibility filters during timeline serving and remove invalid cache entries asynchronously.
`,
    },
    {
      label: "Media safety",
      detailMD: `
Scan uploaded media for malware, policy violations, illegal content, and sensitive imagery. Keep unprocessed media out of public timelines until it is ready or serve it with appropriate labels and restrictions.
`,
    },
    {
      label: "API abuse and scraping controls",
      detailMD: `
Protect read APIs with per-user, per-IP, device, and token limits. Detect automated timeline scraping, search scraping, and follow graph harvesting. Use cursors and response shaping that avoid exposing unnecessary internal ranking signals.
`,
    },
    {
      label: "Data minimization and retention",
      detailMD: `
Keep raw impression, device, and location data in restricted analytics systems with retention limits. Public tweet data may be long-lived, but private signals used for ranking and safety should be access-controlled and auditable.
`,
    },
  ],
  tradeoffs: {
    pros: [
      "Hybrid fanout keeps normal home timeline reads fast while avoiding celebrity write storms.",
      "Derived timeline caches make the read path predictable and rebuildable.",
      "Separating tweet, graph, media, search, and ranking stores lets each access pattern scale independently.",
      "Asynchronous fanout and indexing keep tweet creation latency bounded.",
      "Final visibility filtering protects correctness when blocks, deletes, or takedowns happen after fanout.",
    ],
    cons: [
      "Hybrid fanout is operationally complex and needs careful thresholds, backfills, and monitoring.",
      "Timeline cache is large and can become expensive for inactive or low-value users.",
      "Eventual consistency means some followers may see tweets later than others.",
      "Ranking and hydration introduce many dependencies into the read path.",
      "Deletes and privacy changes require invalidating or filtering many derived views.",
    ],
    alternativesMD: `
Alternative one is pure fanout-on-write. It gives very fast reads and a simple home timeline cache, but it fails for celebrity accounts and produces enormous write amplification.

Alternative two is pure fanout-on-read. It minimizes write work and handles celebrities naturally, but home timeline latency grows with follow count and it becomes expensive for highly connected readers.

Alternative three is a fully ranked recommendation feed built from global candidate retrieval rather than only follows. This can improve engagement, but it is more complex and should be layered after the follow-based timeline is correct.
`,
    whenNotToUseMD: `
Do not use this full architecture for a small community feed, an internal activity log, or a product where users follow only a few accounts. A simpler pull model with relational storage and cache is easier to operate until follower graph skew and timeline read volume justify fanout infrastructure.
`,
  },
  followUpQuestions: [
    {
      question: "How do you choose the celebrity threshold?",
      answerMD: `
Use active follower count, total follower count, posting rate, queue lag, cache write cost, and live traffic. Start with a conservative threshold such as hundreds of thousands or millions of followers, then tune using fanout cost and freshness metrics. The threshold should be dynamic, not a hard-coded interview constant.
`,
    },
    {
      question: "What happens when a user follows a new account?",
      answerMD: `
Write the follow edge, update both graph indexes, and optionally backfill recent tweets from the followed account into the follower's home timeline cache. For large followed accounts, record them as pull candidates instead of inserting a huge backfill. The new follow should affect future timeline reads immediately.
`,
    },
    {
      question: "How do you delete a tweet that was already fanned out?",
      answerMD: `
Mark the canonical tweet as deleted or visibility-limited, publish an invalidation event, remove the ID from hot timeline caches where feasible, and always apply a final visibility check during hydration. Correctness should not depend on removing every cached ID instantly.
`,
    },
    {
      question: "How do you serve inactive users who have no warm timeline cache?",
      answerMD: `
Build a timeline lazily by reading their follow list, fetching recent tweets from followed authors, pulling celebrity accounts, ranking a bounded candidate set, and then warming the cache. The first request may be slower, so use smaller pages and progressive loading.
`,
    },
    {
      question: "How do you prevent one author from overwhelming fanout workers?",
      answerMD: `
Partition fanout work by author class, cap work per author, use separate queues for celebrity accounts, checkpoint follower-list pages, and switch expensive authors to pull-only when lag or write amplification crosses thresholds.
`,
    },
    {
      question: "Where should likes, reposts, and counters be stored?",
      answerMD: `
Store engagement events in append-only streams or write-optimized stores and aggregate counters asynchronously. Timeline hydration can read eventually consistent counters from cache. Do not update the tweet row synchronously for every like or impression.
`,
    },
    {
      question: "How do you blend search and trends with the home timeline?",
      answerMD: `
Keep search and trends as separate serving paths fed by tweet and engagement streams. The home timeline can use trend or topic signals as ranking features, but it should not depend on search index availability to serve followed-account content.
`,
    },
  ],
  companyVariations: [
    {
      company: "Meta",
      angleMD: `
Meta interviewers often probe feed ranking, fanout tradeoffs, privacy enforcement, social graph scale, and cache invalidation. Be ready to compare this design with Facebook Feed and Instagram, especially around ranking features and final visibility checks.
`,
    },
    {
      company: "Amazon",
      angleMD: `
Amazon may emphasize operational excellence, queue backpressure, DynamoDB-style partitioning, multi-AZ availability, cost control, and graceful degradation. Explain alarms for queue lag, cache hit ratio, hot partitions, and fanout freshness.
`,
    },
    {
      company: "LinkedIn",
      angleMD: `
LinkedIn tends to frame this as professional feed distribution with strong graph semantics, relevance ranking, notifications, and spam control. Discuss follower graph updates, creator reach, feed freshness, and ranking with professional identity signals.
`,
    },
    {
      company: "Google",
      angleMD: `
Google interviewers often push on global scale, search indexing, tail latency, stream processing, and storage choices. Expect follow-ups on real-time search freshness, celebrity spikes, and how to maintain p99 timeline latency under degraded dependencies.
`,
    },
  ],
  relatedQuestions: [
    {
      slug: "instagram",
      note: "Shares feed ranking, media storage, celebrity fanout, and CDN-heavy serving concerns.",
    },
    {
      slug: "facebook-feed",
      note: "The closest feed-system comparison, with similar ranking, graph, and privacy tradeoffs.",
    },
    {
      slug: "linkedin-feed",
      note: "A professional social feed with graph-driven distribution and relevance ranking.",
    },
    {
      slug: "distributed-cache",
      note: "Home timeline serving depends on large, hot, bounded per-user timeline caches.",
    },
  ],
  interviewTips: {
    commonMistakes: [
      "Choosing only fanout-on-write and ignoring the celebrity problem.",
      "Choosing only fanout-on-read and ignoring users who follow thousands of accounts.",
      "Storing full tweet objects in every follower timeline cache.",
      "Letting tweet creation wait for fanout to all followers.",
      "Forgetting final visibility checks for deletes, blocks, protected accounts, and takedowns.",
      "Mixing media bytes, search indexing, counters, and timeline serving into one database path.",
    ],
    redFlags: [
      "No concrete capacity math for timeline reads, tweet writes, fanout inserts, and cache size.",
      "No explicit hybrid strategy for high-follower accounts.",
      "No queue, retry, or idempotency story for fanout workers.",
      "No plan for cache rebuilds or degraded timeline reads.",
      "No separation between canonical tweet storage and derived timeline entries.",
      "No discussion of abuse, privacy, and safety filtering before content reaches users.",
    ],
    expectations: [
      "Start by stating workload assumptions and showing that home timeline reads dominate.",
      "Explain fanout-on-write, fanout-on-read, and why hybrid is the production choice.",
      "Draw separate tweet store, graph store, fanout queue, timeline cache, ranking, search, and media paths.",
      "Use tweet IDs in timeline caches and hydrate in batches.",
      "Discuss queue lag, cache loss, graph hot spots, celebrity spikes, and ranking fallbacks.",
      "Call out eventual consistency and final visibility enforcement for deletes and privacy.",
    ],
    communicationMD: `
Lead with the crux: home timeline generation under a heavy-tailed social graph. Draw the write path for posting a tweet, then the read path for opening the home timeline. Compare push and pull, choose hybrid, and explain exactly how celebrity accounts are handled.

Keep the narrative anchored in bounded work. Tweet creation waits for durable storage, not global fanout. Home timeline reads rank a bounded candidate set, not the whole graph. Media, search, trends, counters, and analytics are asynchronous or separate serving paths. This framing shows senior-level control of latency, cost, and failure isolation.
`,
  },
  revisionNotesMD: `
- Twitter's core HLD problem is home-timeline generation at massive read scale with highly skewed follower counts.
- Fanout-on-write pushes ordinary authors into follower timeline caches so reads are fast.
- Fanout-on-read pulls high-follower or celebrity authors during timeline reads to avoid write storms.
- The production answer is hybrid: push most authors, pull celebrities, and cap fanout based on active followers and queue pressure.
- Store canonical tweets in a durable Tweet Store. Store social graph edges separately in both follower and following directions.
- Timeline cache should contain bounded lists of tweet IDs and small metadata, not full tweet objects.
- Tweet creation persists the tweet and publishes asynchronous events for fanout, search, trends, counters, notifications, and safety.
- Reads merge cached pushed IDs with pulled celebrity candidates, filter visibility, rank, hydrate, and return a cursor.
- Deletes, blocks, protected accounts, and takedowns require final visibility checks because cached timeline entries can become stale.
- Media belongs in object storage plus CDN, with scan and transcode workflows outside the tweet database.
- Search and trends use separate indexes and stream processors; they should not be required for home timeline availability.
- Watch fanout queue lag, timeline cache hit ratio, cache memory, graph hot partitions, hydration latency, ranking p99, and freshness by user cohort.
`,
  flashcards: [
    {
      front: "What is the core scaling challenge in Twitter home timelines?",
      back: "Generating fresh personalized timelines for hundreds of millions of users while avoiding write storms from high-follower accounts.",
    },
    {
      front: "What is fanout-on-write?",
      back: "When a tweet is created, the system pushes its tweet ID into follower home timeline caches.",
    },
    {
      front: "What is fanout-on-read?",
      back: "When a user opens the timeline, the system pulls recent tweets from followed accounts and builds the feed on demand.",
    },
    {
      front: "Why is a hybrid fanout strategy preferred?",
      back: "It gives fast reads for ordinary accounts while avoiding massive push fanout for celebrity accounts.",
    },
    {
      front: "What should home timeline cache entries store?",
      back: "Tweet IDs, timestamps, author IDs, source, and small rank hints, not full tweet objects.",
    },
    {
      front: "Why should tweet creation not wait for fanout?",
      back: "Fanout can involve millions of follower updates and queue retries; creation should only wait for durable tweet storage.",
    },
    {
      front: "How are deletes enforced after fanout?",
      back: "Mark the canonical tweet deleted, publish invalidations, remove hot cache entries where feasible, and apply final visibility checks during hydration.",
    },
    {
      front: "Why is media stored separately?",
      back: "Media bytes are large and need scanning, transcoding, object storage, and CDN delivery outside the tweet metadata and timeline cache paths.",
    },
    {
      front: "What are key timeline health metrics?",
      back: "Timeline p99 latency, fanout lag, cache hit ratio, cache memory, graph query latency, ranking latency, hydration failures, and freshness delay.",
    },
  ],
  quiz: [
    {
      question: "Which strategy best handles ordinary users with modest follower counts?",
      options: ["Fanout-on-write into follower timeline caches", "Full table scans on every read", "Synchronous search indexing before acknowledgement", "Storing media bytes in Redis"],
      answerIndex: 0,
      explanationMD: `
Fanout-on-write makes ordinary users' tweets appear quickly in follower caches and keeps home timeline reads fast. The write amplification is acceptable for modest follower counts.
`,
    },
    {
      question: "Why should celebrity accounts usually be pulled at read time?",
      options: ["They never need to appear in timelines", "Their tweets are too large to store", "Pushing one tweet to millions of followers can create a fanout storm", "Search cannot index celebrity tweets"],
      answerIndex: 2,
      explanationMD: `
A celebrity tweet can require millions of timeline inserts if pushed to every follower. Pulling recent celebrity tweets during reads bounds write work.
`,
    },
    {
      question: "What should be the source of truth for tweet content?",
      options: ["Home timeline cache", "Canonical Tweet Store", "Trending topics cache", "Client local storage"],
      answerIndex: 1,
      explanationMD: `
The Tweet Store is durable source of truth. Home timeline entries are derived IDs that can be rebuilt or filtered.
`,
    },
    {
      question: "Given 300M users opening home timeline 10 times per day, approximately how many timeline reads happen per day?",
      options: ["30M", "300M", "3B", "30B"],
      answerIndex: 2,
      explanationMD: `
300M users times 10 opens per day equals 3B timeline reads per day.
`,
    },
    {
      question: "Why should full tweet objects not be copied into every follower timeline cache?",
      options: ["Tweet IDs are illegal to cache", "It wastes memory and makes updates, deletes, and counter changes expensive", "Ranking requires SQL joins", "Media cannot use CDN"],
      answerIndex: 1,
      explanationMD: `
Copying full objects multiplies storage and makes invalidation difficult. Caching IDs keeps entries compact and allows final hydration checks.
`,
    },
    {
      question: "What is the safest way to handle a deleted tweet that still appears as a cached timeline ID?",
      options: ["Return it because cache is source of truth", "Ignore deletes for 24 hours", "Filter it during hydration and publish cache invalidation", "Delete the user's entire timeline"],
      answerIndex: 2,
      explanationMD: `
The canonical tweet visibility state wins. The timeline service filters deleted content during hydration and invalidation removes stale IDs over time.
`,
    },
    {
      question: "Which dependency should home timeline serving be able to survive without?",
      options: ["All tweet storage forever", "Every ranking feature and model", "User authentication for private data", "Network connectivity"],
      answerIndex: 1,
      explanationMD: `
Ranking should degrade to cached hints or chronological ordering. The system still needs basic authentication and access to enough tweet data to serve content correctly.
`,
    },
  ],
  cheatSheetMD: `
**Goal**: design Twitter home timelines, tweet posting, social graph, search, trends, and media at hundreds of millions of daily users.

**Workload**: assume 300M DAU, 3B home timeline reads per day, about 35K average read QPS, about 350K peak read QPS, 150M tweets per day, and high fanout skew.

**Core crux**: fanout-on-write gives fast reads but explodes for celebrities. Fanout-on-read avoids write storms but can make reads expensive. Use hybrid: push ordinary authors, pull celebrities, and cap fanout based on active followers and queue pressure.

**Write path**: client posts tweet, Tweet Service validates and persists canonical record, then publishes events to fanout, search, trends, counters, notifications, and safety pipelines.

**Read path**: Timeline Service reads cached pushed IDs, pulls celebrity candidates, filters visibility, ranks bounded candidates, hydrates tweet and media metadata, and returns a cursor.

**Storage**: Tweet Store keyed by tweet_id, Graph Store with both follower and following indexes, Timeline Cache keyed by user_id, Search Index for public text, Object Store plus CDN for media.

**Caching**: cache tweet IDs rather than full tweet objects. Bound each user's list, trim old entries, expire inactive timelines, and rebuild lazily when needed.

**Correctness**: final visibility checks are mandatory for deletes, blocks, mutes, protected accounts, suspensions, and takedowns because cached entries can become stale.

**Failure strategy**: if cache fails, serve degraded pull timelines. If ranking fails, use chronological order. If fanout lags, pull more at read time. If media fails, serve text with placeholders.
`,
  references: [
    {
      title: "Designing Data-Intensive Applications",
      kind: "Book",
      author: "Martin Kleppmann",
    },
    {
      title: "System Design Interview",
      kind: "Book",
      author: "Alex Xu",
    },
    {
      title: "The Tail at Scale",
      kind: "Paper",
      url: "https://research.google/pubs/the-tail-at-scale/",
      author: "Jeffrey Dean and Luiz Andre Barroso",
    },
    {
      title: "Scaling Memcache at Facebook",
      kind: "Paper",
      url: "https://www.usenix.org/conference/nsdi13/technical-sessions/presentation/nishtala",
      author: "Rajesh Nishtala and others",
    },
    {
      title: "Manhattan, our real-time, multi-tenant distributed database for Twitter scale",
      kind: "Blog",
      url: "https://blog.x.com/engineering/en_us/a/2014/manhattan-our-real-time-multi-tenant-distributed-database-for-twitter-scale",
      author: "Twitter Engineering",
    },
  ],
};
