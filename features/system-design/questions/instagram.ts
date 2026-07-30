import type { SDQuestionContent } from "../types";

export const instagramContent: SDQuestionContent = {
  slug: "instagram",
  statementMD: `
Design Instagram, a photo and video sharing platform where users upload media, publish posts and stories, follow other users, view a personalized home feed, discover content through Explore, and interact through likes, comments, saves, and views.

At interview scale, assume more than a billion daily active users, hundreds of millions of durable feed posts per day, billions of ephemeral story items per day, and tens of billions of media impressions. The hard parts are not CRUD screens; they are the media upload and processing pipeline, CDN-first media serving, metadata consistency, hybrid feed fanout, ranking, hot celebrity accounts, and approximate counters that do not melt the write path.

The default design should optimize for read-heavy media delivery from CDN, durable object storage for original and derived media, fast home feed reads, eventual consistency for social actions, and independent scaling of upload, processing, feed generation, and engagement analytics.
`,
  businessUseCaseMD: `
Instagram lets creators, friends, brands, and public figures publish visual content and reach audiences quickly. The product value comes from low-friction uploads, reliable playback, fresh feeds, social engagement, creator analytics, and discovery that keeps users returning.

For the business, the same infrastructure supports ads, commerce, creator monetization, brand safety, trend detection, and personalized recommendations. A strong design must therefore separate the user-visible posting and feed experience from background ranking, moderation, analytics, and media processing systems.
`,
  functionalRequirements: [
    "Allow users to upload photos and videos through presigned object-storage URLs.",
    "Process uploaded media asynchronously into thumbnails, previews, and multiple playback resolutions.",
    "Let users create feed posts with captions, media assets, mentions, tags, and visibility controls.",
    "Generate a personalized home feed from followed accounts using a hybrid fanout model.",
    "Support likes, comments, saves, shares, view tracking, and aggregate counters.",
    "Support stories that expire from normal viewing after a TTL such as 24 hours.",
    "Serve media through a CDN with signed or versioned URLs and origin fallback.",
    "Power Explore and recommendations from ranking signals, search indexes, and engagement events.",
  ],
  nonFunctionalRequirements: [
    {
      label: "Media read latency",
      detailMD: `
The majority of user-perceived latency comes from image and video delivery. CDN cache hits should start image delivery in under 100ms p95 in major regions, and feed metadata APIs should return the first page in under 200ms p99 excluding client network time.
`,
    },
    {
      label: "Upload durability",
      detailMD: `
Once the client finishes uploading and the object store acknowledges the object, the system must not lose the media. Originals and processed variants need checksums, replication, lifecycle policies, and idempotent processing so retries do not corrupt assets.
`,
    },
    {
      label: "Feed availability",
      detailMD: `
Home feed reads should remain available during ranking, analytics, and counter-service degradation. A practical target is 99.99 percent for feed reads and media serving, with lower availability acceptable for comments, insights, or Explore freshness.
`,
    },
    {
      label: "Scalability",
      detailMD: `
The design must scale independent dimensions: upload bandwidth, background transcoding, CDN egress, metadata reads, fanout writes, ranking inference, and engagement event ingestion. Stateless API services are not enough; storage layout and asynchronous pipelines dominate scalability.
`,
    },
    {
      label: "Consistency",
      detailMD: `
Post creation needs read-after-write for the author, but follower feeds can be eventually consistent. Likes, views, and comments can appear with small delays as long as duplicates are prevented and counters converge.
`,
    },
    {
      label: "Cost efficiency",
      detailMD: `
Billions of objects and petabytes of media make cost a first-class requirement. Store originals and derived variants in object storage, use lifecycle tiers for cold media, push reads to CDN, and avoid unnecessary reprocessing or duplicate variants.
`,
    },
    {
      label: "Safety and privacy",
      detailMD: `
Uploads, comments, and recommendations must respect account privacy, blocks, copyright, nudity, violence, spam, and minor-safety policies. Moderation should be asynchronous where possible but able to remove content quickly from feeds, caches, and CDN.
`,
    },
  ],
  capacityEstimation: {
    assumptionsMD: `
Assume 1B daily active users. Each user opens the home feed 20 times per day on average, producing 20B feed page reads per day. Each page returns about 20 candidate items. Assume 300M durable feed posts per day and 1B story items per day.

Assume processed feed media averages 12 MB per post after originals, thumbnails, and multiple resolutions. Story media averages 5 MB and is hot for 24 hours before expiring from normal viewing. Assume 80B media impressions per day, an average delivered size of 700 KB after adaptive selection, 50B engagement events per day, a 10x peak multiplier, and 95 percent CDN hit ratio for media bytes.
`,
    metrics: [
      {
        label: "Daily active users",
        value: "1B users",
        note: "Large consumer social network scale",
      },
      {
        label: "Feed post writes",
        value: "300M posts per day",
        note: "About 3,500 creates per second average and 35,000 at 10x peak",
      },
      {
        label: "Story writes",
        value: "1B story items per day",
        note: "About 11,600 creates per second average and 116,000 at 10x peak",
      },
      {
        label: "Home feed reads",
        value: "20B page reads per day",
        note: "About 231,000 reads per second average and 2.3M at 10x peak",
      },
      {
        label: "Media impressions",
        value: "80B per day",
        note: "About 926,000 media requests per second average and 9.3M at 10x peak",
      },
      {
        label: "CDN egress",
        value: "56 PB per day",
        note: "80B impressions times 700 KB, roughly 650 GB per second average before protocol overhead",
      },
      {
        label: "New durable feed media",
        value: "3.6 PB raw per day",
        note: "300M posts times 12 MB processed footprint before replication and lifecycle compaction",
      },
      {
        label: "Hot story media",
        value: "5 PB raw active window",
        note: "1B story items times 5 MB retained for the 24-hour TTL window",
      },
      {
        label: "Engagement event ingestion",
        value: "50B events per day",
        note: "About 579,000 events per second average and 5.8M at 10x peak",
      },
      {
        label: "Hybrid fanout entries",
        value: "72B timeline entries per day",
        note: "If 80 percent of posts fan out to 300 followers on average",
      },
    ],
    calculationsMD: `
- Feed writes: 300M posts per day divided by 86,400 seconds is about 3,472 posts per second, rounded to 3,500. A 10x multiplier gives about 35,000 creates per second.
- Story writes: 1B stories per day divided by 86,400 seconds is about 11,574 per second, rounded to 11,600. A 10x peak gives about 116,000 per second.
- Feed reads: 1B daily users times 20 feed opens per day gives 20B feed page reads. 20B divided by 86,400 seconds is about 231,000 reads per second average.
- Media impressions: 80B impressions per day divided by 86,400 seconds is about 926,000 media requests per second average. At 10x peak the CDN tier sees about 9.3M requests per second.
- Egress: 80B impressions times 700 KB is 56PB delivered per day. 56PB divided by 86,400 seconds is roughly 650GB per second average, with peak capacity in the multi-TB per second range.
- Durable media: 300M feed posts times 12 MB is 3.6PB of new processed media per day before replication. With three-way replication that is 10.8PB of physical writes before lifecycle optimization.
- Stories: 1B story items times 5 MB is 5PB of hot object data in the 24-hour visible window. Archive, compliance, or creator memories features can add a separate colder retention path.
- Metadata: 300M posts per day times a 2 KB post record is about 600GB of raw post metadata per day, or about 219TB per year before indexes and replicas.
- Engagement: 50B events per day divided by 86,400 seconds is about 579,000 events per second average. At 200 bytes per compact event, raw event input is about 10TB per day before compression.
- Fanout: 300M posts times 80 percent non-celebrity fanout times 300 followers produces 72B timeline entries per day. At 50 bytes per entry, that is about 3.6TB raw timeline-entry data per day before replication.
`,
  },
  apiDesign: {
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/media/upload-intents",
        descriptionMD: `
Creates a presigned upload intent for a photo or video. The client uploads directly to object storage so API servers do not proxy media bytes.
`,
        request: `
{
  "mediaType": "video",
  "contentType": "video/mp4",
  "bytes": 52428800,
  "checksum": "sha256:abc123",
  "durationMs": 18000
}
`,
        response: `
{
  "uploadId": "upl_9f3a",
  "assetId": "ast_123",
  "objectKey": "raw/2026/07/26/user_42/ast_123.mp4",
  "uploadUrl": "https://uploads.example.com/raw/2026/07/26/user_42/ast_123.mp4",
  "expiresAt": "2026-07-26T07:30:00Z",
  "requiredHeaders": {
    "x-checksum-sha256": "abc123"
  }
}
`,
        statusCodes: [
          { code: 201, meaning: "Upload intent created" },
          { code: 400, meaning: "Invalid media type, size, checksum, or duration" },
          { code: 401, meaning: "Authentication required" },
          { code: 413, meaning: "Media exceeds account limits" },
          { code: 429, meaning: "Upload rate limit exceeded" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/posts",
        descriptionMD: `
Creates a feed post from one or more uploaded media assets. The post may be visible immediately with processing placeholders or held until required variants are ready.
`,
        request: `
{
  "authorId": "user_42",
  "caption": "Sunset run",
  "assetIds": ["ast_123"],
  "visibility": "followers",
  "locationId": "loc_987",
  "taggedUserIds": ["user_84"]
}
`,
        response: `
{
  "postId": "post_456",
  "status": "processing",
  "createdAt": "2026-07-26T07:01:12Z",
  "media": [
    {
      "assetId": "ast_123",
      "state": "processing"
    }
  ]
}
`,
        statusCodes: [
          { code: 201, meaning: "Post accepted" },
          { code: 400, meaning: "Invalid caption, visibility, or asset list" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Asset does not belong to caller" },
          { code: 409, meaning: "Asset is already attached to another post" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/feed/home",
        descriptionMD: `
Returns a personalized page of home feed items for the authenticated user. The response contains metadata and CDN URLs, not media bytes.
`,
        request: `
cursor=eyJ0cyI6IjIwMjYtMDctMjZUMDc6MDA6MDBaIn0&limit=20
`,
        response: `
{
  "items": [
    {
      "postId": "post_456",
      "authorId": "user_42",
      "caption": "Sunset run",
      "createdAt": "2026-07-26T07:01:12Z",
      "media": [
        {
          "assetId": "ast_123",
          "thumbnailUrl": "https://cdn.example.com/t/ast_123.jpg",
          "playbackUrl": "https://cdn.example.com/v/ast_123_720p.mp4"
        }
      ],
      "likeCount": 12840,
      "commentCount": 317,
      "viewerState": {
        "liked": false,
        "saved": true
      }
    }
  ],
  "nextCursor": "eyJ0cyI6IjIwMjYtMDctMjZUMDY6NTk6MDBaIn0"
}
`,
        statusCodes: [
          { code: 200, meaning: "Feed page returned" },
          { code: 401, meaning: "Authentication required" },
          { code: 429, meaning: "Read rate limit exceeded" },
          { code: 503, meaning: "Feed temporarily degraded" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/posts/{postId}/likes",
        descriptionMD: `
Adds a like from the authenticated user. The operation is idempotent and updates counters asynchronously.
`,
        response: `
{
  "postId": "post_456",
  "viewerState": {
    "liked": true
  },
  "likeCountEstimate": 12841
}
`,
        statusCodes: [
          { code: 200, meaning: "Like already existed or was created" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Viewer cannot access the post" },
          { code: 404, meaning: "Post not found" },
          { code: 429, meaning: "Interaction rate limit exceeded" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/stories",
        descriptionMD: `
Creates a story item from an uploaded media asset. The story is visible to eligible viewers until the TTL expires.
`,
        request: `
{
  "authorId": "user_42",
  "assetId": "ast_789",
  "visibility": "close_friends",
  "expiresAfterSeconds": 86400
}
`,
        response: `
{
  "storyId": "story_789",
  "authorId": "user_42",
  "expiresAt": "2026-07-27T07:01:12Z",
  "state": "active"
}
`,
        statusCodes: [
          { code: 201, meaning: "Story created" },
          { code: 400, meaning: "Invalid story asset or TTL" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Asset does not belong to caller" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/explore",
        descriptionMD: `
Returns ranked Explore candidates from public or eligible content. The endpoint blends search, embeddings, trending signals, and safety filters.
`,
        request: `
cursor=rank_abc&limit=24&surface=explore_grid
`,
        response: `
{
  "items": [
    {
      "postId": "post_999",
      "rankReason": "trending_video",
      "media": [
        {
          "assetId": "ast_999",
          "thumbnailUrl": "https://cdn.example.com/t/ast_999.jpg"
        }
      ]
    }
  ],
  "nextCursor": "rank_def"
}
`,
        statusCodes: [
          { code: 200, meaning: "Explore page returned" },
          { code: 401, meaning: "Authentication required if private personalization is used" },
          { code: 429, meaning: "Read rate limit exceeded" },
          { code: 503, meaning: "Ranking service degraded" },
        ],
      },
    ],
    notesMD: `
Media bytes should not flow through the API tier. The API creates upload intents, validates ownership, writes metadata, and returns CDN URLs for variants. Object storage and CDN handle raw bytes. Engagement APIs should be idempotent because mobile clients retry aggressively.
`,
  },
  databaseDesign: {
    schemaMD: `
Use separate storage models for media objects, social graph, post metadata, timelines, comments, and analytics. The relational schema below describes the logical entities; at scale, these become sharded key-value tables, wide-column stores, object storage buckets, and search indexes.

The hot serving path should avoid joins. Feed reads should obtain post ids from a precomputed timeline or ranking service, batch-fetch post metadata, then attach already-computed counters and CDN URLs.
`,
    tables: [
      {
        name: "users",
        columns: [
          { name: "user_id", type: "uuid", note: "Primary key" },
          { name: "username", type: "varchar(64)", note: "Unique public handle" },
          { name: "profile_visibility", type: "varchar(20)", note: "Public, private, or restricted" },
          { name: "created_at", type: "timestamp", note: "Account creation time" },
          { name: "status", type: "varchar(20)", note: "Active, disabled, or deleted" },
        ],
      },
      {
        name: "media_assets",
        columns: [
          { name: "asset_id", type: "uuid", note: "Primary key for the media asset" },
          { name: "owner_id", type: "uuid", note: "User who initiated the upload" },
          { name: "media_type", type: "varchar(20)", note: "Photo, video, carousel_item, or story" },
          { name: "original_object_key", type: "varchar(512)", note: "Object storage key for the original upload" },
          { name: "variants_json", type: "json", note: "Thumbnails, resolutions, codecs, dimensions, and CDN paths" },
          { name: "processing_state", type: "varchar(24)", note: "Uploaded, processing, ready, failed, or blocked" },
          { name: "checksum", type: "varchar(128)", note: "Content checksum for dedupe and integrity" },
          { name: "created_at", type: "timestamp", note: "Upload intent or object creation time" },
        ],
      },
      {
        name: "posts",
        columns: [
          { name: "post_id", type: "uuid", note: "Primary key, usually time-sortable" },
          { name: "author_id", type: "uuid", note: "Partition and access-control dimension" },
          { name: "caption", type: "text", note: "Caption text after moderation and normalization" },
          { name: "asset_ids", type: "json", note: "Ordered list of media asset ids" },
          { name: "visibility", type: "varchar(20)", note: "Public, followers, close_friends, or private" },
          { name: "created_at", type: "timestamp", note: "Creation time used for ranking and timelines" },
          { name: "status", type: "varchar(24)", note: "Processing, published, hidden, deleted, or policy_blocked" },
          { name: "counter_snapshot", type: "json", note: "Eventually consistent likes, comments, saves, and views" },
        ],
      },
      {
        name: "follows",
        columns: [
          { name: "follower_id", type: "uuid", note: "User who follows" },
          { name: "followee_id", type: "uuid", note: "User being followed" },
          { name: "state", type: "varchar(20)", note: "Active, requested, muted, blocked, or removed" },
          { name: "created_at", type: "timestamp", note: "Follow creation time" },
          { name: "rank_weight", type: "float", note: "Optional affinity signal for feed ranking" },
        ],
      },
      {
        name: "comments",
        columns: [
          { name: "comment_id", type: "uuid", note: "Primary key" },
          { name: "post_id", type: "uuid", note: "Post partition key for comment threads" },
          { name: "author_id", type: "uuid", note: "Comment author" },
          { name: "parent_comment_id", type: "uuid nullable", note: "Supports replies" },
          { name: "body", type: "text", note: "Moderated comment text" },
          { name: "created_at", type: "timestamp", note: "Sort and pagination field" },
          { name: "status", type: "varchar(24)", note: "Visible, hidden, deleted, or policy_blocked" },
        ],
      },
    ],
    indexesMD: `
- **users.username** is unique for profile lookup.
- **media_assets.owner_id, created_at** supports upload libraries and ownership checks.
- **posts.author_id, created_at** supports profile grids and author timelines.
- **posts.created_at** is not enough for home feed; use timeline tables or ranking indexes keyed by viewer_id.
- **follows.follower_id, followee_id** should be unique and support both following and followers queries through two denormalized views.
- **comments.post_id, created_at** supports paginated comment threads.
- Counter and view events should not update the **posts** row synchronously on every action.
`,
    relationshipsMD: `
A user owns media assets and posts. A post references one or more media assets. Follows connect users and drive feed eligibility. Comments, likes, saves, and views reference posts, but high-volume interactions should be represented as idempotent event records plus aggregate counter tables rather than as hot columns on the post row.
`,
    noSqlAlternativesMD: `
Use object storage for media originals and variants. Use Cassandra, DynamoDB, Bigtable, or ScyllaDB for posts by author, timelines by viewer, story trays by viewer, and idempotent interaction records. Use a graph-shaped or denormalized follow store for follower and followee queries.

Use Redis or Memcached for feed page cache, post metadata cache, story tray cache, and hot counters. Use Elasticsearch, OpenSearch, Vespa, or a custom retrieval system for Explore candidates and text or hashtag search. Use OLAP storage such as Pinot, Druid, ClickHouse, BigQuery, or Snowflake for analytics, impressions, and creator insights.
`,
  },
  architecture: {
    width: 960,
    height: 560,
    nodes: [
      { id: "client", label: "Mobile and Web Clients", kind: "client", x: 80, y: 250, sublabel: "Upload, feed, stories" },
      { id: "media-cdn", label: "Media CDN", kind: "cdn", x: 250, y: 100, sublabel: "Images, video chunks" },
      { id: "api-gateway", label: "API Gateway", kind: "gateway", x: 250, y: 300, sublabel: "Auth, rate limits" },
      { id: "upload-service", label: "Upload Service", kind: "service", x: 430, y: 100, sublabel: "Presigned URLs" },
      { id: "object-storage", label: "Object Storage", kind: "storage", x: 630, y: 100, sublabel: "Originals and variants" },
      { id: "media-pipeline", label: "Media Pipeline", kind: "worker", x: 810, y: 100, sublabel: "Transcode, thumbnails" },
      { id: "post-feed-service", label: "Post and Feed Service", kind: "service", x: 430, y: 300, sublabel: "Posts, stories, feeds" },
      { id: "metadata-store", label: "Metadata Stores", kind: "database", x: 630, y: 285, sublabel: "Posts, follows, comments" },
      { id: "timeline-cache", label: "Timeline and Hot Cache", kind: "cache", x: 630, y: 455, sublabel: "Redis, timeline tables" },
      { id: "event-stream", label: "Event Stream", kind: "queue", x: 810, y: 300, sublabel: "Kafka, Pub/Sub" },
      { id: "ranking-search", label: "Ranking and Explore", kind: "search", x: 810, y: 455, sublabel: "Candidates, features" },
    ],
    edges: [
      { from: "client", to: "api-gateway", label: "API requests" },
      { from: "client", to: "media-cdn", label: "media reads" },
      { from: "media-cdn", to: "object-storage", label: "origin miss" },
      { from: "api-gateway", to: "upload-service", label: "upload intent" },
      { from: "upload-service", to: "object-storage", label: "presigned write" },
      { from: "client", to: "object-storage", label: "direct upload" },
      { from: "object-storage", to: "media-pipeline", label: "object event", dashed: true },
      { from: "media-pipeline", to: "object-storage", label: "write variants" },
      { from: "media-pipeline", to: "event-stream", label: "processing complete", dashed: true },
      { from: "api-gateway", to: "post-feed-service", label: "posts, feed, stories" },
      { from: "post-feed-service", to: "metadata-store", label: "read and write metadata" },
      { from: "post-feed-service", to: "timeline-cache", label: "feed read or fanout" },
      { from: "post-feed-service", to: "event-stream", label: "likes, views, comments", dashed: true },
      { from: "event-stream", to: "post-feed-service", label: "fanout workers", dashed: true },
      { from: "event-stream", to: "metadata-store", label: "counter batches", dashed: true },
      { from: "post-feed-service", to: "ranking-search", label: "rank candidates" },
      { from: "ranking-search", to: "timeline-cache", label: "ranked results" },
    ],
    captionMD: `
Media bytes bypass the API tier: clients upload directly to object storage and read variants from CDN. API services handle metadata, feed assembly, stories, and interactions, while queues decouple processing, fanout, counters, and ranking updates.
`,
  },
  architectureNotesMD: `
The architecture separates three planes. The media plane handles presigned upload, object storage, asynchronous transcoding, thumbnails, multiple resolutions, and CDN delivery. The social metadata plane stores users, posts, follows, stories, comments, visibility, and relationship state. The engagement plane ingests likes, views, comments, saves, shares, and ranking signals through an event stream.

The home feed is read-heavy and should not assemble every page by scanning all followed authors. For normal users, new posts are fanned out into follower timeline stores. For celebrities and high-follower accounts, posts are pulled at read time and merged with precomputed timelines, then ranked. Explore is a separate retrieval and ranking path that consumes public content, safety labels, embeddings, and engagement features.

Object storage remains the source of truth for media. The CDN absorbs most media reads and protects origins. Metadata services must degrade independently from media delivery: an already-loaded feed item should continue to render its image or video even if counters, comments, or Explore are stale.
`,
  requestFlow: [
    {
      title: "Client requests an upload intent",
      detailMD: `
The authenticated client sends media type, size, checksum, and optional duration to the Upload Service through the API Gateway. The service validates quota, file type, and abuse limits, creates a media asset record in uploaded-pending state, and returns a presigned object-storage URL.
`,
    },
    {
      title: "Client uploads media directly to object storage",
      detailMD: `
The client uploads bytes to object storage using the presigned URL. The object store verifies checksum and emits an object-created event. API servers are not on the byte path, which keeps upload bandwidth from scaling with application servers.
`,
    },
    {
      title: "Media pipeline creates variants",
      detailMD: `
Workers consume object events, inspect media, run safety scanning, extract metadata, generate thumbnails, transcode videos into multiple resolutions and codecs, and write derived variants back to object storage. The media asset record moves to ready or blocked.
`,
    },
    {
      title: "User creates a post or story",
      detailMD: `
The client references ready asset ids and sends caption, visibility, tags, and story TTL if applicable. The Post and Feed Service validates ownership, writes post or story metadata, and returns the created id. If variants are still processing, the post can be visible with placeholders or delayed until the minimum variant is ready.
`,
    },
    {
      title: "Feed fanout runs asynchronously",
      detailMD: `
For ordinary authors, a post-created event causes fanout workers to append post ids to follower timelines. For celebrity authors, the system stores the post in an author timeline and pulls it during feed reads to avoid writing to millions of followers at publish time.
`,
    },
    {
      title: "Home feed is read",
      detailMD: `
When a viewer opens home feed, the Feed Service reads precomputed timeline entries, merges celebrity pull candidates, filters by privacy, mute, block, and freshness, batch-fetches post metadata, attaches counter snapshots and CDN URLs, and returns a cursor page.
`,
    },
    {
      title: "Media is served from CDN",
      detailMD: `
The client requests thumbnails, images, or video chunks from the CDN. On a cache miss, the CDN fetches from object storage. URLs can be versioned or signed so purges, privacy changes, and moderation actions can invalidate stale media.
`,
    },
    {
      title: "Engagement events update asynchronously",
      detailMD: `
Likes, comments, saves, impressions, and views are written as idempotent actions or events. Counters are aggregated in batches and pushed back to counter stores and post snapshots. Feed ranking and Explore features consume the same event stream.
`,
    },
    {
      title: "Stories expire from active trays",
      detailMD: `
Story records include an expires_at timestamp. Story tray caches and story timeline tables use TTL so expired stories disappear automatically from normal reads. Object storage lifecycle rules can delete or tier media later, depending on archive and compliance requirements.
`,
    },
  ],
  coreComponents: [
    {
      name: "Upload Service",
      kind: "service",
      role: "Creates upload intents and keeps media bytes off application servers.",
      detailMD: `
The service validates user quota, media type, file size, checksum, duration, and risk signals. It writes a media asset record, returns a short-lived presigned URL, and makes upload creation idempotent so mobile retries do not allocate duplicate assets.
`,
    },
    {
      name: "Object Storage and CDN",
      kind: "storage",
      role: "Stores originals and variants while serving most reads from edge caches.",
      detailMD: `
Object storage keeps originals, thumbnails, and video renditions under versioned keys. The CDN caches hot objects near users, supports range requests for video, shields origin, and can purge or expire media after privacy changes, deletes, or moderation actions.
`,
    },
    {
      name: "Media Processing Pipeline",
      kind: "worker",
      role: "Turns raw uploads into safe, optimized assets.",
      detailMD: `
Workers transcode videos, resize photos, generate thumbnails, extract metadata, detect duplicates, run machine-learning moderation, and update media state. The pipeline must be idempotent because object notifications and worker retries can happen more than once.
`,
    },
    {
      name: "Post and Metadata Service",
      kind: "service",
      role: "Owns posts, captions, comments, visibility, and access checks.",
      detailMD: `
This service validates media ownership, stores post metadata, enforces privacy and blocks, serves profile grids, paginates comments, and exposes batch metadata fetches for feed and Explore. It should avoid synchronous counter updates on hot post rows.
`,
    },
    {
      name: "Social Graph Store",
      kind: "database",
      role: "Stores follows, follower lists, mutes, blocks, and close-friends edges.",
      detailMD: `
The graph store needs efficient queries in both directions: who a viewer follows and who follows an author. Large accounts require pagination, snapshotting, and fanout thresholds so posting does not require iterating hundreds of millions of followers synchronously.
`,
    },
    {
      name: "Feed Generation Service",
      kind: "service",
      role: "Builds home feed pages using hybrid fanout and ranking.",
      detailMD: `
The service combines pushed timeline entries, pulled celebrity posts, ads if in scope, freshness filters, viewer state, and ranking scores. It returns only metadata and CDN URLs, not media bytes.
`,
    },
    {
      name: "Ranking and Explore System",
      kind: "search",
      role: "Retrieves and ranks public or eligible content for discovery.",
      detailMD: `
Explore uses candidate generation from hashtags, embeddings, trending signals, follows, and engagement graphs, then ranks candidates with safety and personalization features. It should degrade to cached trending content if fresh ranking is unavailable.
`,
    },
    {
      name: "Counter and Analytics Pipeline",
      kind: "analytics",
      role: "Aggregates likes, comments, saves, impressions, and views at scale.",
      detailMD: `
Events flow through Kafka, Pub/Sub, Kinesis, or a similar stream. Consumers deduplicate action ids, batch increments, compute approximate unique viewers, update hot counters, and write long-term analytics into OLAP stores for creators and ranking.
`,
    },
  ],
  deepDives: [
    {
      topic: "Media upload and processing pipeline",
      detailMD: `
The clean design keeps API servers out of the media byte path. The client first requests an upload intent, receives a short-lived presigned URL, uploads directly to object storage, and then references the resulting asset id when creating a post or story.

Object-created events trigger asynchronous workers. For photos, workers validate format, strip unsafe metadata, create thumbnails, produce multiple sizes, and write immutable variant keys. For videos, workers extract duration, generate poster frames, transcode into several resolutions and bitrates, and optionally package chunks for adaptive playback. The asset record should contain state, variant metadata, dimensions, checksum, and moderation labels.

The pipeline must be idempotent. Object notifications can be delivered more than once, workers can crash after writing some variants, and clients can retry post creation. Use deterministic variant keys, compare checksums, and transition state with conditional updates. Keep original media until all required variants are durable, then apply lifecycle policies to move originals or rarely used variants to colder storage.
`,
    },
    {
      topic: "Hybrid fanout for home feed",
      detailMD: `
Pure fanout-on-write gives very fast reads because each viewer has a precomputed timeline. It works well for normal users, but celebrity accounts with millions of followers create enormous write spikes and storage amplification. Pure fanout-on-read avoids write spikes, but every feed open must query many followed authors and rank their recent posts, which is too slow for heavy users.

Use a hybrid model. For ordinary authors, append the post id to each follower's timeline asynchronously. For high-follower accounts, do not push to every follower. Store their posts in author timelines and pull a bounded number during feed read. Merge pushed and pulled candidates, remove blocked or muted authors, apply freshness and ranking, and return a cursor.

The threshold should be operational, not fixed forever. A creator can cross the celebrity threshold during a viral moment. The system should track fanout cost, follower count, write lag, and engagement rate, then dynamically decide whether to push, pull, or selectively push to highly engaged followers.
`,
    },
    {
      topic: "Ranking, Explore, and freshness",
      detailMD: `
Home feed ranking is constrained by eligibility: followed authors, privacy, mutes, blocks, close friends, age limits, and content safety labels. Within eligible candidates, rank by recency, affinity, predicted engagement, media quality, diversity, and negative feedback. Keep ranking features close to the feed service through feature caches so each feed read does not fan out to many online services.

Explore is different because it is not limited to followed accounts. It needs candidate generation from trending content, hashtags, audio, visual embeddings, collaborative filtering, and creator affinity. A retrieval service returns hundreds or thousands of candidates, then a ranker scores and filters them. For safety, content should be labeled before it is eligible for broad distribution.

Freshness and stability trade off. A feed that changes every refresh can feel random, while a stale feed reduces engagement. Use cursors, session-level dedupe, diversity constraints, and periodic reranking. When ranking is down, fall back to cached timelines, recent followed posts, and safe trending content.
`,
    },
    {
      topic: "Likes, comments, and view counters at scale",
      detailMD: `
A viral post can receive millions of views and likes in minutes. Updating one post row for every like or view creates a hot partition and makes user actions depend on counter storage. Instead, represent likes as idempotent user-post actions and views as events. Emit action and impression events to a stream, then aggregate in batches by post id and time bucket.

Exactness depends on the product surface. A viewer should see whether they personally liked a post with strong consistency by reading the user-post action record. The public like count can be eventually consistent and approximate. Views and unique viewers should use sampling, dedupe windows, and sketches such as HyperLogLog when exact uniqueness is too expensive.

Comments need stronger ordering than likes. Store comment records partitioned by post id and ordered by created_at or a time-sortable id. For very hot posts, split comments into pages, cache top comments, and separate comment_count aggregation from comment text storage.
`,
    },
    {
      topic: "Stories with TTL",
      detailMD: `
Stories are high-write, high-read, and ephemeral. A story has media variants like a feed post, but its active visibility window is usually 24 hours. Store story metadata with expires_at and keep per-viewer story trays in cache or TTL-enabled wide-column tables.

TTL should remove stories from normal reads without requiring a perfectly timed sweeper. Reads must filter expired stories even if a cache entry lingers. Object storage lifecycle rules can delete active-window variants after the TTL, move archives to cold storage if the product supports memories, and retain only policy-required metadata.

Story views are especially write-heavy because every impression may create a viewer event. Use batched view recording, approximate counts for large creators, and per-author privacy rules. Close-friends and private-account stories require access checks before returning CDN URLs.
`,
    },
    {
      topic: "Partitioning and hot accounts",
      detailMD: `
Partition posts by author_id plus time for profile grids, but partition feed timelines by viewer_id because home feed reads are viewer-centric. Partition comments by post_id, but add hot-post mitigation for celebrity comments. Partition media objects by hashed asset id and date to distribute object-store prefixes and lifecycle management.

Hot accounts create asymmetric load. A celebrity post can trigger huge fanout, ranking, notifications, counter updates, and CDN traffic. Use pull-based feed inclusion for these accounts, replicated metadata caches for hot posts, counter sharding, CDN prewarming for expected viral media, and rate-limited comment pagination.

Avoid one universal database. Instagram-like systems naturally use object storage, key-value stores, wide-column timeline tables, graph stores or denormalized follow tables, search indexes, caches, streams, and OLAP stores. The interview signal is knowing which access pattern owns each storage choice.
`,
    },
  ],
  scaling: [
    {
      stage: "Prototype: single region and simple feed",
      detailMD: `
Start with API services, a relational metadata database, object storage, a basic worker for thumbnails, and a simple reverse-chronological feed by querying followed authors. This proves product semantics, upload flow, post creation, likes, comments, and story TTL.
`,
    },
    {
      stage: "Growth: CDN, queues, and caches",
      detailMD: `
Move all media reads to CDN, use presigned uploads, add asynchronous media processing, cache post metadata and counters, and introduce a queue for engagement events. Add read replicas or sharded stores for posts and follows. Use basic fanout-on-write for ordinary users.
`,
    },
    {
      stage: "Large scale: hybrid fanout and sharded metadata",
      detailMD: `
Introduce viewer timeline tables, fanout workers, pull-based celebrity posts, counter shards, story tray caches, and batch metadata fetches. Shard posts, comments, follows, and timelines by their primary access keys. Use offline and nearline ranking features.
`,
    },
    {
      stage: "Global scale: multi-region media and feeds",
      detailMD: `
Replicate object storage across regions, serve media from global CDN, route users to nearby API regions, and keep home feed reads regional. Use home-region writes for users or multi-region databases for metadata that needs local durability. Replicate events into regional analytics and ranking pipelines.
`,
    },
    {
      stage: "Extreme scale: recommendation platform and cost optimization",
      detailMD: `
Separate Explore into retrieval, feature, ranking, and safety services. Add CDN prewarming, adaptive bitrate selection, lifecycle tiering, cold media compaction, ML-based moderation, and cost-aware variant generation. Use traffic isolation for celebrities, ads, stories, and background analytics.
`,
    },
  ],
  bottlenecks: [
    {
      issue: "API servers proxying media bytes",
      optimizationMD: `
Use presigned direct uploads to object storage and CDN delivery for reads. API servers should create intents, validate metadata, and return URLs, not stream photos and videos.
`,
    },
    {
      issue: "Transcoding backlog",
      optimizationMD: `
Scale media workers independently by queue depth, media type, duration, and priority. Generate a minimum preview quickly, process expensive variants later, and make all variant writes idempotent.
`,
    },
    {
      issue: "Celebrity fanout explosion",
      optimizationMD: `
Use hybrid fanout. Push posts from normal users to followers, but pull posts from high-follower accounts during feed reads. Dynamically adjust thresholds and selectively push to highly engaged followers.
`,
    },
    {
      issue: "Hot counters on viral posts",
      optimizationMD: `
Shard counters, batch increments, use approximate counts where acceptable, and keep viewer-specific action state separate from public aggregate counts. Do not update a single post row per view or like.
`,
    },
    {
      issue: "CDN origin overload",
      optimizationMD: `
Use origin shield, cache-control tuned per variant, prewarm predicted viral assets, version object keys, and apply negative caching for missing or deleted assets. Keep originals and hot variants in separate lifecycle classes.
`,
    },
    {
      issue: "Feed read amplification",
      optimizationMD: `
Store precomputed timeline entries, batch-fetch metadata, cache first feed pages, keep feature data close to rankers, and cap pull candidates from celebrities. Avoid querying every followed author on each feed open.
`,
    },
  ],
  failureHandling: [
    {
      scenario: "Object storage upload completes but post creation fails",
      strategyMD: `
Keep upload intents and asset records with TTL. A cleanup worker deletes unattached raw objects after a grace period. Post creation should be idempotent by asset id and client request id so retries can attach the same media safely.
`,
    },
    {
      scenario: "Media processing workers are delayed or fail",
      strategyMD: `
Show processing placeholders, retry idempotently, move poison media to a dead-letter queue, and alert on queue age. If only high-resolution variants fail, publish lower-resolution variants and repair in the background.
`,
    },
    {
      scenario: "CDN regional outage",
      strategyMD: `
Fail traffic to another edge region or CDN provider, allow origin fallback with rate limits, and reduce variant size if origin pressure rises. Feed metadata should continue to load even if some media URLs temporarily fail.
`,
    },
    {
      scenario: "Fanout pipeline lag",
      strategyMD: `
Feed reads merge precomputed timelines with recent author posts or a fallback pull query for freshness. Expose lag metrics, prioritize active users, and backfill delayed timeline entries asynchronously.
`,
    },
    {
      scenario: "Counter pipeline outage",
      strategyMD: `
Continue accepting likes, comments, and views into durable action stores or local buffers if possible. Show stale counter snapshots with freshness bounds. Recompute aggregates from the event log after recovery.
`,
    },
    {
      scenario: "Bad moderation label or takedown",
      strategyMD: `
Use reversible state transitions, audit logs, human review queues, and fast cache and CDN invalidation. Policy-blocked content should be removed from feeds and Explore quickly while preserving evidence and appeal workflows.
`,
    },
  ],
  security: [
    {
      label: "Authentication and authorization",
      detailMD: `
Every write requires authenticated identity. Feed, story, comment, and media URL generation must enforce account privacy, close-friends lists, blocks, mutes, age gates, and regional restrictions.
`,
    },
    {
      label: "Upload abuse prevention",
      detailMD: `
Validate file types, size, dimensions, duration, checksums, and content signatures. Limit upload intent creation per user and device, scan for malware and policy violations, and quarantine suspicious media before broad distribution.
`,
    },
    {
      label: "Signed URLs and CDN invalidation",
      detailMD: `
Private or restricted media should use signed URLs or tokenized access. Deleted, blocked, or privacy-changed media needs versioned keys, short TTLs, purge APIs, or deny-list checks so stale CDN copies do not remain accessible.
`,
    },
    {
      label: "Spam and engagement integrity",
      detailMD: `
Likes, comments, follows, views, and shares are abuse targets. Use rate limits, device reputation, bot detection, idempotency keys, anomaly detection, and delayed counter credit for suspicious engagement.
`,
    },
    {
      label: "Privacy and data minimization",
      detailMD: `
Store only necessary viewer signals, coarse location where possible, and apply retention windows to raw impression events. Separate public counters from private analytics and honor account deletion, data export, and legal requests.
`,
    },
    {
      label: "Content safety",
      detailMD: `
Run moderation on media, captions, comments, hashtags, and recommendations. Content that may be allowed on a profile can still be ineligible for Explore. Keep safety labels in the ranking and feed eligibility path.
`,
    },
  ],
  tradeoffs: {
    pros: [
      "Presigned upload and CDN delivery keep media bytes away from API servers.",
      "Asynchronous processing lets uploads return quickly while variants are generated independently.",
      "Hybrid fanout gives fast reads for most users without exploding writes for celebrities.",
      "Event-driven counters and analytics scale better than synchronous post-row updates.",
      "Separate storage systems match distinct access patterns for media, timelines, graph, search, and analytics.",
    ],
    cons: [
      "Eventual consistency means likes, counters, feed entries, and processing state can lag.",
      "Hybrid fanout adds operational complexity and dynamic threshold tuning.",
      "CDN caching complicates deletes, privacy changes, and moderation takedowns.",
      "Multiple storage systems increase data repair, backfill, and observability burden.",
      "Ranking and Explore introduce feature freshness, fairness, and safety tradeoffs beyond simple feed serving.",
    ],
    alternativesMD: `
Alternative one is pure fanout-on-write. It makes feed reads extremely fast but is expensive for high-follower accounts and creates large write bursts.

Alternative two is pure fanout-on-read. It is simple to reason about and avoids timeline storage, but it cannot meet low-latency feed reads for users who follow many accounts unless the candidate set is heavily cached or capped.

Alternative three is synchronous media processing during upload. It gives a clean ready-or-fail response, but mobile clients wait longer, API capacity couples to transcoding, and retry behavior becomes painful. Asynchronous processing is usually the better tradeoff.
`,
    whenNotToUseMD: `
Do not use an Instagram-style architecture for a small private photo album or enterprise document repository. If the dominant requirements are strict access control, small group sharing, exact audit trails, and low traffic, a simpler object-storage-backed application with synchronous metadata writes is cheaper and safer.
`,
  },
  followUpQuestions: [
    {
      question: "Why not upload photos and videos through the API service?",
      answerMD: `
API servers would become bandwidth bottlenecks and would scale with media bytes instead of request metadata. Presigned direct upload lets object storage handle large payloads, retries, checksums, and multipart upload while the API controls authorization and metadata.
`,
    },
    {
      question: "How do you decide fanout-on-write versus fanout-on-read?",
      answerMD: `
Use fanout-on-write for ordinary authors because it makes follower feed reads fast. Use fanout-on-read for celebrities because pushing to millions of followers on every post is too expensive. The threshold should consider follower count, active follower count, engagement, and current fanout lag.
`,
    },
    {
      question: "How do you show a newly created post immediately to the author?",
      answerMD: `
Write the post metadata durably, return the post id, and include the author's own recent posts through a read-after-write path or local client insertion. Follower fanout can happen asynchronously, but the author should not wait for all follower timelines to update.
`,
    },
    {
      question: "How should like counts be stored?",
      answerMD: `
Store the viewer's like as an idempotent user-post action so the user state is correct. Public counts should be aggregated asynchronously using sharded counters and stream processing. The count shown on the post can be eventually consistent.
`,
    },
    {
      question: "How do stories expire reliably?",
      answerMD: `
Store expires_at on story metadata, use TTL-enabled story tray tables or caches, and filter expired records on reads. A background sweeper and object-storage lifecycle rules clean up media later, but correctness should not depend on the sweeper running exactly on time.
`,
    },
    {
      question: "How do you handle private accounts in feed and CDN URLs?",
      answerMD: `
Feed generation must filter candidates by follow approval, blocks, close-friends rules, and viewer eligibility before returning URLs. For restricted media, use signed CDN URLs with short TTLs or token checks so copied URLs do not grant indefinite access.
`,
    },
    {
      question: "What happens if media processing is slow?",
      answerMD: `
The post can remain in processing state, show a thumbnail or placeholder, or publish lower-quality variants first. Workers retry idempotently, queue lag is monitored, and high-priority media such as active stories can be processed before archival variants.
`,
    },
  ],
  companyVariations: [
    {
      company: "Meta",
      angleMD: `
Meta interviewers will expect depth on social graph fanout, feed ranking, celebrity hot spots, privacy, content safety, and media storage lineage from products like Facebook and Instagram. Be ready to discuss TAO-like graph access, News Feed-style hybrid fanout, and fast takedowns.
`,
    },
    {
      company: "Google",
      angleMD: `
Google may emphasize global serving, CDN efficiency, tail latency, video processing, ranking quality, search and Explore retrieval, ML feature freshness, and abuse detection. Expect follow-ups on large-scale storage, backpressure, and graceful degradation.
`,
    },
    {
      company: "Amazon",
      angleMD: `
Amazon often probes operational ownership: S3-style object storage, CloudFront-style CDN, DynamoDB partitioning, queue-based processing, alarms, retries, cost controls, and multi-AZ resilience. Explain how each dependency fails independently.
`,
    },
    {
      company: "Netflix",
      angleMD: `
Netflix may focus on video encoding, CDN delivery, adaptive bitrate choices, playback quality, observability, and regional failover. For Instagram, translate those ideas to short-form videos, previews, stories, and heavy mobile consumption.
`,
    },
    {
      company: "LinkedIn",
      angleMD: `
LinkedIn may frame the problem around professional creator feeds, follow graph ranking, notifications, abuse-resistant comments, and feed freshness. Emphasize graph eligibility, ranking explanations, and moderation for public identity.
`,
    },
  ],
  relatedQuestions: [
    {
      slug: "twitter",
      note: "Shares hybrid feed fanout, celebrity hot spots, timelines, and engagement counters.",
    },
    {
      slug: "facebook-feed",
      note: "Closest feed-ranking and social-graph comparison for home feed generation.",
    },
    {
      slug: "youtube",
      note: "Relevant for video upload, transcoding, thumbnails, CDN playback, and creator analytics.",
    },
    {
      slug: "dropbox",
      note: "Useful contrast for object storage, upload integrity, metadata, and media lifecycle management.",
    },
    {
      slug: "tiktok",
      note: "Related recommendation-heavy short-video feed with massive media delivery and ranking needs.",
    },
  ],
  interviewTips: {
    commonMistakes: [
      "Proxying media uploads and downloads through application servers.",
      "Using pure fanout-on-write without handling celebrity accounts.",
      "Updating like and view counters synchronously on the post row.",
      "Forgetting that feed metadata and media bytes have different serving paths.",
      "Ignoring story TTL, CDN invalidation, privacy, and moderation takedowns.",
      "Designing Explore as the same system as the followed-user home feed.",
    ],
    redFlags: [
      "No capacity math for media storage, CDN egress, feed reads, or fanout writes.",
      "No asynchronous media processing pipeline for thumbnails and transcoding.",
      "No plan for hot posts, hot accounts, or viral counter spikes.",
      "No clear data model for follows, posts, media assets, comments, and timelines.",
      "No mention of content safety, private accounts, blocks, or signed media access.",
    ],
    expectations: [
      "Start with presigned uploads, object storage, async processing, and CDN delivery.",
      "Separate post metadata, social graph, timelines, counters, and media objects.",
      "Explain hybrid fanout and the celebrity exception clearly.",
      "Use event streams for fanout, counters, ranking features, and analytics.",
      "Discuss story TTL, feed freshness, cache strategy, and graceful degradation.",
      "Tie ranking and Explore to candidate generation, features, safety, and fallbacks.",
    ],
    communicationMD: `
Lead with the media path because it is the biggest cost and latency driver: direct upload to object storage, async processing, CDN delivery. Then draw the metadata and feed path: posts, follows, hybrid fanout, timeline cache, ranking, and batch metadata fetch. Finally add engagement events, counters, stories, Explore, security, and failure handling. Keep repeating which parts are strongly consistent, which are eventually consistent, and which are best-effort.
`,
  },
  revisionNotesMD: `
- Keep media bytes out of API servers. Use presigned uploads to object storage and serve variants from CDN.
- Upload flow: create upload intent, client uploads object, object event triggers processing, workers generate thumbnails and renditions, post references ready asset ids.
- At 1B daily users and 20 feed opens per user per day, expect 20B feed page reads per day, about 231,000 reads per second average.
- At 80B media impressions per day and 700 KB average delivered size, CDN egress is about 56PB per day, roughly 650GB per second average.
- Feed posts at 300M per day and 12 MB processed footprint create about 3.6PB raw durable media per day before replication.
- Use hybrid fanout: push ordinary authors to follower timelines, pull celebrity posts at read time, then merge and rank.
- Store posts by author, timelines by viewer, comments by post, follows in both directions, media in object storage, and Explore candidates in search or retrieval indexes.
- Likes and views should be idempotent events with asynchronous aggregation. Viewer-specific like state can be strong; public counts can be approximate and eventually consistent.
- Stories need expires_at, TTL-enabled tray storage, read-time filtering, and object lifecycle cleanup.
- CDN invalidation, signed URLs, moderation labels, private accounts, blocks, and rate limits are core design requirements, not optional extras.
`,
  flashcards: [
    {
      front: "Why use presigned upload URLs for Instagram media?",
      back: "They let clients upload directly to object storage so API servers handle authorization and metadata instead of large media bytes.",
    },
    {
      front: "What does the media processing pipeline produce?",
      back: "Thumbnails, resized photos, video renditions, poster frames, metadata, safety labels, and CDN-ready variant keys.",
    },
    {
      front: "Why is hybrid fanout needed?",
      back: "Fanout-on-write is fast for normal users but too expensive for celebrities; fanout-on-read handles celebrities without massive publish-time writes.",
    },
    {
      front: "What should a home feed response contain?",
      back: "Post metadata, viewer state, counter snapshots, cursors, and CDN URLs for media variants, not raw media bytes.",
    },
    {
      front: "Why not update like_count on every like?",
      back: "A viral post would create a hot row and make likes depend on counter storage. Use idempotent actions plus asynchronous aggregation.",
    },
    {
      front: "How do stories expire?",
      back: "Store expires_at, use TTL-enabled story trays or caches, filter on reads, and clean media with lifecycle rules later.",
    },
    {
      front: "Which storage system holds originals and media variants?",
      back: "Object storage, with CDN in front for read-heavy global delivery.",
    },
    {
      front: "What is the main difference between home feed and Explore?",
      back: "Home feed ranks eligible content from followed accounts, while Explore retrieves and ranks broader public or eligible content using recommendation signals.",
    },
  ],
  quiz: [
    {
      question: "What is the best reason to use presigned object-storage URLs for uploads?",
      options: ["They make captions easier to index", "They keep large media bytes off API servers", "They remove the need for authentication", "They guarantee feed ranking quality"],
      answerIndex: 1,
      explanationMD: `
Presigned URLs let clients upload directly to object storage while the API controls authorization and metadata. This prevents application servers from scaling with media bandwidth.
`,
    },
    {
      question: "Which feed strategy is best for a mix of normal users and celebrity accounts?",
      options: ["Pure fanout-on-write for everyone", "Pure fanout-on-read for everyone", "Hybrid fanout with push for normal users and pull for celebrities", "No fanout and only global trending posts"],
      answerIndex: 2,
      explanationMD: `
Hybrid fanout keeps reads fast for ordinary follow relationships while avoiding massive publish-time writes for accounts with millions of followers.
`,
    },
    {
      question: "What should happen to like and view counters on viral posts?",
      options: ["Update the post row synchronously for every event", "Disable counters for popular posts", "Aggregate events asynchronously with sharded or approximate counters", "Store every counter only in the CDN"],
      answerIndex: 2,
      explanationMD: `
Synchronous updates create hot rows. Event streams, batching, sharded counters, and approximate sketches allow counters to converge without blocking user actions.
`,
    },
    {
      question: "Which component should serve most photo and video reads?",
      options: ["The API Gateway", "The media processing worker", "The CDN", "The comments database"],
      answerIndex: 2,
      explanationMD: `
Instagram is extremely read-heavy for media. CDN edge caches should serve most images, thumbnails, and video chunks, with object storage as origin.
`,
    },
    {
      question: "Why should story reads still filter by expires_at even when using TTL storage?",
      options: ["TTL always runs early", "Caches or TTL sweeps can lag, so read-time filtering preserves correctness", "expires_at is only for analytics", "It prevents transcoding"],
      answerIndex: 1,
      explanationMD: `
TTL deletion is not an exact correctness mechanism. Read-time filtering ensures expired stories disappear even if cache entries or storage records linger briefly.
`,
    },
    {
      question: "What is a strong storage key for a viewer home timeline table?",
      options: ["viewer_id", "caption_text", "original_object_key", "comment_id"],
      answerIndex: 0,
      explanationMD: `
Home feed reads are viewer-centric, so timeline entries should be partitioned by viewer_id and ordered by time or rank cursor.
`,
    },
    {
      question: "What is the safest default for private or restricted media URLs?",
      options: ["Permanent public URLs with no invalidation", "Signed or short-lived CDN URLs after eligibility checks", "Sending raw media through comments API", "Embedding the object storage admin key in the client"],
      answerIndex: 1,
      explanationMD: `
Private media needs eligibility checks before URLs are returned. Signed or short-lived CDN URLs limit exposure if a URL is copied or privacy changes.
`,
    },
  ],
  cheatSheetMD: `
**Goal**: design Instagram for photo and video uploads, feed posts, stories, home feed, Explore, likes, comments, views, and CDN-heavy media delivery.

**Scale**: 1B daily active users, 300M feed posts per day, 1B stories per day, 20B home feed reads per day, 80B media impressions per day, 50B engagement events per day.

**Media path**: client asks Upload Service for an intent, receives a presigned URL, uploads directly to object storage, object event triggers processing, workers create thumbnails and renditions, CDN serves variants.

**Metadata path**: Post Service stores users, media assets, posts, follows, comments, visibility, and story TTL. Feed Service batch-fetches metadata and returns CDN URLs.

**Feed generation**: use hybrid fanout. Push ordinary posts to follower timelines. Pull celebrity posts during feed reads. Merge, filter by privacy and blocks, rank, dedupe, and paginate with cursors.

**Stories**: store expires_at, use TTL for story trays, filter expired stories on reads, and clean objects with lifecycle rules.

**Counters**: likes and views are idempotent actions or events. Aggregate asynchronously with sharded counters and sketches. Keep viewer-specific liked state separate from public count snapshots.

**Explore**: retrieve candidates from search, hashtags, embeddings, trending signals, and engagement graphs. Rank with personalization and safety features. Fall back to safe cached trending content.

**Storage**: object storage for media, key-value or wide-column stores for posts and timelines, denormalized graph tables for follows, search indexes for Explore, Redis for hot feed and post metadata, OLAP for analytics.

**Reliability**: degrade ranking, counters, comments, and Explore independently from feed reads and media serving. Use queues, retries, dead-letter queues, cache fallbacks, and regional CDN failover.

**Security**: enforce authentication, privacy, blocks, signed URLs, upload validation, moderation, spam limits, CDN invalidation, and data retention.
`,
  references: [
    {
      title: "Designing Data-Intensive Applications",
      kind: "Book",
      author: "Martin Kleppmann",
    },
    {
      title: "System Design Interview Volume 2",
      kind: "Book",
      author: "Alex Xu",
    },
    {
      title: "Finding a needle in Haystack: Facebook's photo storage",
      kind: "Paper",
      url: "https://www.usenix.org/legacy/event/osdi10/tech/full_papers/Beaver.pdf",
      author: "Doug Beaver et al.",
    },
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
  ],
};
