import type { SDQuestionContent } from "../types";

export const tiktokContent: SDQuestionContent = {
  slug: "tiktok",
  statementMD: `
Design TikTok's For You experience: a short-video platform where users open the app and receive an endless, low-latency stream of personalized videos. The core product is not social-graph fanout. The hard part is continuously selecting, ranking, and delivering the next few videos using fresh engagement signals while keeping playback smooth.

At interview scale, assume hundreds of millions of daily active users, billions of video views per day, massive CDN egress, and a rapid upload pipeline. The system must ingest videos, transcode them into adaptive bitrate renditions, moderate content, index eligible inventory, generate recommendation candidates, run ML ranking, and return feed pages fast enough that the user can keep swiping without waiting.

The default design should optimize for the For You Page. Follows, comments, creator pages, live streaming, and messaging are adjacent product areas, but the recommendation-driven feed, feedback loop, video delivery path, cold-start handling, and safety controls are the crux of this question.
`,
  businessUseCaseMD: `
TikTok's business depends on keeping users engaged with relevant short videos, helping creators find audiences, and monetizing attention through ads and commerce. The For You feed is the discovery surface that turns unknown creators into viral hits and keeps sessions long.

A strong design balances product quality and infrastructure cost. Better ranking improves retention, but each swipe creates event ingestion, feature updates, model scoring, CDN bandwidth, and moderation pressure. The architecture must support rapid experimentation without making the playback path fragile.
`,
  functionalRequirements: [
    "Upload videos from creators and process them into multiple adaptive bitrate renditions.",
    "Moderate videos before or during distribution using automated and human review workflows.",
    "Serve a personalized For You feed page containing ranked video candidates and playback metadata.",
    "Collect engagement signals including impressions, watch time, completion, replay, like, share, comment, follow, skip, and report.",
    "Update user, video, creator, and context features quickly so recommendations react within seconds to minutes.",
    "Handle cold-start for new users, new videos, new creators, and anonymous sessions.",
    "Deliver video segments through CDN with prefetching so the next videos start instantly.",
    "Support ranking experiments, policy filters, diversity constraints, and ad insertion without disrupting feed latency.",
  ],
  nonFunctionalRequirements: [
    {
      label: "Feed latency",
      detailMD: `
The feed API should return the next page in under 150ms p99 within a region for warm users. The response should include enough ranked items and prefetch hints that the client rarely blocks on a network call while swiping.
`,
    },
    {
      label: "Playback startup latency",
      detailMD: `
The first frame should appear in under one second for most sessions, and subsequent swipes should feel instant. Achieve this through CDN placement, ABR manifests, short segment durations, client buffering, and prefetching the next few videos.
`,
    },
    {
      label: "Recommendation freshness",
      detailMD: `
Engagement signals such as watch time, completion, replay, likes, skips, and reports should influence online features within seconds to minutes. Offline training can lag by hours, but online ranking needs fresh session and video momentum features.
`,
    },
    {
      label: "Availability",
      detailMD: `
The For You feed and playback path should target 99.99 percent availability. Upload, analytics dashboards, and creator tools may degrade independently, but users should still receive safe cached or fallback recommendations during partial failures.
`,
    },
    {
      label: "Scalability",
      detailMD: `
The system must scale read-heavy video delivery, high-QPS feed requests, high-volume event ingestion, and expensive model scoring independently. CDN egress, feature-store reads, and ranker CPU or GPU capacity are separate scaling axes.
`,
    },
    {
      label: "Safety and policy enforcement",
      detailMD: `
Unsafe videos, policy violations, age-restricted content, copyright issues, and spam must be blocked or downranked quickly. The recommender must enforce policy filters before ranking, during ranking, and after ranking.
`,
    },
    {
      label: "Experiment velocity",
      detailMD: `
Ranking features, model versions, candidate sources, diversity rules, and ads should be controlled by experiment configuration. The platform needs guardrails so bad models can be canaried, rolled back, or shadow-tested without a full service redeploy.
`,
    },
  ],
  capacityEstimation: {
    assumptionsMD: `
Assume 500M daily active users. Each active user watches or starts 120 videos per day on average, so the platform serves about 60B video plays per day. A feed page returns 20 ranked items. Each play emits about 4 engagement events on average, such as impression, start, progress or completion, and an optional action.

Assume 20M video uploads per day. The average original upload is 80 MB, and transcoded adaptive bitrate renditions plus thumbnails and metadata average 200 MB per accepted video. Assume 70 percent of uploads pass initial moderation and become eligible for recommendation. Average delivered bytes per play are 5 MB because many short videos are watched partially and ABR selects mobile-friendly bitrates.

Use a 4x peak multiplier for feed and playback traffic because usage is globally distributed but still has regional peaks. Use a 3x replication and overhead factor for media storage.
`,
    metrics: [
      {
        label: "Video plays",
        value: "60B per day",
        note: "500M daily users times 120 starts per day",
      },
      {
        label: "Feed page requests",
        value: "3B per day",
        note: "60B plays divided by 20 items per page",
      },
      {
        label: "Average feed QPS",
        value: "34,700 requests per second",
        note: "3B divided by 86,400 seconds",
      },
      {
        label: "Peak feed QPS",
        value: "139,000 requests per second",
        note: "4x average peak",
      },
      {
        label: "Engagement events",
        value: "240B per day",
        note: "60B plays times 4 events per play",
      },
      {
        label: "Average event ingest",
        value: "2.8M events per second",
        note: "240B divided by 86,400 seconds",
      },
      {
        label: "CDN egress",
        value: "300 PB per day",
        note: "60B plays times 5 MB delivered per play",
      },
      {
        label: "Average egress rate",
        value: "3.5 TB per second",
        note: "300 PB divided by 86,400 seconds before protocol overhead",
      },
      {
        label: "Accepted videos",
        value: "14M per day",
        note: "70 percent of 20M uploads pass initial moderation",
      },
      {
        label: "New media storage",
        value: "8 to 10 PB per day replicated",
        note: "14M accepted videos times 200 MB times 3x replication and overhead",
      },
      {
        label: "Online ranking scores",
        value: "17M candidates per second average",
        note: "34,700 feed QPS times 500 candidates scored per request",
      },
    ],
    calculationsMD: `
- Plays: 500M daily active users times 120 video starts per day equals 60B plays per day.
- Feed requests: if each feed response carries 20 items, 60B divided by 20 equals 3B feed pages per day. 3B divided by 86,400 seconds is about 34,700 feed QPS average. With a 4x peak, plan for about 139,000 feed QPS.
- Event ingestion: 60B plays times 4 engagement events equals 240B events per day. 240B divided by 86,400 seconds is about 2.78M events per second average, with regional peaks above 10M events per second.
- CDN egress: 60B plays times 5 MB delivered equals 300B MB per day, or about 300 PB per day. 300 PB divided by 86,400 seconds is about 3.5 TB per second average egress before protocol overhead.
- Upload storage: 20M uploads times 70 percent accepted equals 14M eligible videos per day. 14M times 200 MB of renditions and thumbnails is about 2.8 PB raw per day. With 3x replication and overhead, reserve roughly 8 to 10 PB per day.
- Ranking capacity: if the ranker scores 500 candidates per feed page, 34,700 feed QPS requires about 17M candidate scores per second average. Peak can exceed 70M scores per second, so ranking must use batching, staged models, and fallback lists.
`,
  },
  apiDesign: {
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/videos/uploads:init",
        descriptionMD: `
Starts a resumable upload session. The service returns a video id and signed upload URLs for the original media and thumbnail candidates.
`,
        request: `
{
  "creatorId": "user_123",
  "filename": "dance.mov",
  "contentType": "video/quicktime",
  "sizeBytes": 83886080,
  "caption": "Practice round",
  "clientRegion": "IN"
}
`,
        response: `
{
  "videoId": "vid_789",
  "uploadSessionId": "upl_456",
  "parts": [
    {
      "partNumber": 1,
      "uploadUrl": "https://upload.example.com/upl_456/part/1"
    }
  ],
  "expiresAt": "2026-07-26T13:10:48Z"
}
`,
        statusCodes: [
          { code: 201, meaning: "Upload session created" },
          { code: 400, meaning: "Invalid file metadata" },
          { code: 401, meaning: "Authentication required" },
          { code: 413, meaning: "Upload too large" },
          { code: 429, meaning: "Creator or IP upload rate limit exceeded" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/videos/{videoId}/complete",
        descriptionMD: `
Marks an upload complete and enqueues transcoding, thumbnail extraction, fingerprinting, and moderation. The video is not broadly recommendable until required processing and safety checks pass.
`,
        request: `
{
  "uploadSessionId": "upl_456",
  "parts": [
    {
      "partNumber": 1,
      "etag": "abc123"
    }
  ],
  "durationMs": 18400
}
`,
        response: `
{
  "videoId": "vid_789",
  "status": "PROCESSING",
  "nextSteps": ["TRANSCODING", "MODERATION", "FEATURE_EXTRACTION"]
}
`,
        statusCodes: [
          { code: 202, meaning: "Processing accepted" },
          { code: 400, meaning: "Missing upload parts or invalid duration" },
          { code: 403, meaning: "Caller does not own this upload" },
          { code: 404, meaning: "Video or upload session not found" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/feed/for-you",
        descriptionMD: `
Returns a ranked For You feed page. The cursor carries pagination, served-item history, and experiment state so the next request can avoid duplicates and continue the session.
`,
        request: `
GET /api/v1/feed/for-you?cursor=cur_abc&pageSize=20&region=IN&network=wifi
Authorization: Bearer user_token
`,
        response: `
{
  "requestId": "req_001",
  "cursor": "cur_next",
  "items": [
    {
      "videoId": "vid_789",
      "creatorId": "user_123",
      "rank": 1,
      "playback": {
        "manifestUrl": "https://cdn.example.com/vid_789/master.m3u8",
        "thumbnailUrl": "https://cdn.example.com/vid_789/thumb.jpg"
      },
      "reason": "personalized"
    }
  ],
  "prefetchCount": 5,
  "experimentIds": ["ranker_v42"]
}
`,
        statusCodes: [
          { code: 200, meaning: "Feed page returned" },
          { code: 401, meaning: "Authentication required for logged-in feed" },
          { code: 429, meaning: "Client is polling too aggressively" },
          { code: 503, meaning: "Feed temporarily served from fallback or unavailable" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/events/watch",
        descriptionMD: `
Ingests client engagement signals. The endpoint should be low-latency and durable enough for ranking feedback, but it must not block playback when a client retries or batches events.
`,
        request: `
{
  "requestId": "req_001",
  "userId": "user_999",
  "deviceId": "dev_abc",
  "events": [
    {
      "videoId": "vid_789",
      "eventType": "COMPLETE",
      "watchMs": 18400,
      "videoDurationMs": 18400,
      "position": 1,
      "occurredAt": "2026-07-26T12:40:48Z"
    }
  ]
}
`,
        response: `
{
  "accepted": 1,
  "dropped": 0,
  "serverTime": "2026-07-26T12:40:49Z"
}
`,
        statusCodes: [
          { code: 202, meaning: "Events accepted for asynchronous processing" },
          { code: 400, meaning: "Malformed event batch" },
          { code: 413, meaning: "Batch too large" },
          { code: 429, meaning: "Event rate limit exceeded" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/videos/{videoId}/report",
        descriptionMD: `
Allows users to report unsafe or policy-violating content. Reports are routed to moderation and can immediately reduce distribution while review completes.
`,
        request: `
{
  "userId": "user_999",
  "reason": "self_harm",
  "details": "Unsafe challenge",
  "requestId": "req_001"
}
`,
        response: `
{
  "reportId": "rep_123",
  "status": "RECEIVED"
}
`,
        statusCodes: [
          { code: 202, meaning: "Report accepted" },
          { code: 400, meaning: "Invalid report reason" },
          { code: 404, meaning: "Video not found" },
          { code: 429, meaning: "Report rate limit exceeded" },
        ],
      },
    ],
    notesMD: `
The feed API returns metadata and CDN URLs, not video bytes. Playback happens through CDN using HLS or DASH manifests. Engagement events should be accepted asynchronously and deduplicated by request id, device id, video id, event type, and event time.
`,
  },
  databaseDesign: {
    schemaMD: `
Use different stores for different workloads. Video metadata needs strongly indexed reads by video id and creator id. Media bytes belong in object storage. Feed serving depends on online feature stores, candidate indexes, and model-serving caches. Raw engagement events belong in a log and data lake, not in the transactional metadata database.

The logical schema below shows core entities. At production scale these tables are usually implemented across a distributed metadata store, object storage, Kafka or Pulsar, an online feature store, and offline warehouse tables.
`,
    tables: [
      {
        name: "videos",
        columns: [
          { name: "video_id", type: "varchar(32)", note: "Primary key generated before upload" },
          { name: "creator_id", type: "varchar(32)", note: "Creator account that owns the video" },
          { name: "caption", type: "text", note: "Normalized caption and hashtags" },
          { name: "duration_ms", type: "integer", note: "Video duration after validation" },
          { name: "language", type: "varchar(16)", note: "Detected or declared primary language" },
          { name: "region_policy", type: "json", note: "Distribution rules by region and age gate" },
          { name: "status", type: "varchar(32)", note: "Uploading, processing, active, limited, removed, or failed" },
          { name: "moderation_state", type: "varchar(32)", note: "Pending, approved, limited, rejected, or human_review" },
          { name: "created_at", type: "timestamp", note: "Upload creation time" },
          { name: "published_at", type: "timestamp nullable", note: "Time video became eligible for recommendation" },
        ],
      },
      {
        name: "video_variants",
        columns: [
          { name: "video_id", type: "varchar(32)", note: "Partition key with videos.video_id" },
          { name: "variant_id", type: "varchar(32)", note: "Rendition id such as 240p, 480p, 720p, or audio-only" },
          { name: "codec", type: "varchar(32)", note: "H.264, H.265, AV1, or platform-specific codec" },
          { name: "bitrate_kbps", type: "integer", note: "Target bitrate for ABR selection" },
          { name: "width", type: "integer", note: "Encoded width" },
          { name: "height", type: "integer", note: "Encoded height" },
          { name: "object_key", type: "text", note: "Object storage key for manifest or segment prefix" },
          { name: "size_bytes", type: "bigint", note: "Stored bytes for cost accounting" },
          { name: "ready_at", type: "timestamp", note: "Rendition availability time" },
        ],
      },
      {
        name: "user_profiles",
        columns: [
          { name: "user_id", type: "varchar(32)", note: "Primary key for logged-in users" },
          { name: "home_region", type: "varchar(16)", note: "Primary serving and compliance region" },
          { name: "languages", type: "json", note: "Preferred and inferred languages" },
          { name: "age_gate", type: "varchar(16)", note: "Safety and content eligibility bucket" },
          { name: "onboarding_interests", type: "json", note: "Initial explicit interests for cold-start" },
          { name: "created_at", type: "timestamp", note: "Account creation time" },
          { name: "last_active_at", type: "timestamp", note: "Recent activity for retention and feature freshness" },
        ],
      },
      {
        name: "recommendation_features",
        columns: [
          { name: "entity_id", type: "varchar(64)", note: "User id, video id, creator id, or session id" },
          { name: "entity_type", type: "varchar(16)", note: "user, video, creator, session, or context" },
          { name: "feature_version", type: "integer", note: "Schema and transformation version" },
          { name: "features", type: "json or vector", note: "Online features used by candidate generation and ranking" },
          { name: "updated_at", type: "timestamp", note: "Freshness timestamp for online serving" },
          { name: "ttl_seconds", type: "integer nullable", note: "Short TTL for session and trend features" },
        ],
      },
    ],
    indexesMD: `
- **videos.video_id** is the primary point lookup for feed rendering, playback metadata, and moderation actions.
- **videos.creator_id, created_at** supports creator profiles and creator tooling, but should not be used to build the For You feed.
- **videos.status, moderation_state, published_at** supports candidate eligibility scans and backfills.
- **video_variants.video_id, variant_id** supports manifest assembly and repair jobs.
- **recommendation_features.entity_type, entity_id, feature_version** supports online feature hydration with one or a few batched lookups.
`,
    relationshipsMD: `
Each video belongs to one creator and has multiple ABR variants. A user profile owns preference and safety metadata. Recommendation features are denormalized and versioned because ranking cannot afford joins across transactional tables during a feed request. Raw engagement events are linked by user id, device id, session id, video id, and request id in the event log.
`,
    noSqlAlternativesMD: `
Use object storage for original uploads, transcoded segments, manifests, thumbnails, and perceptual hashes. Use a wide-column or KV store such as Bigtable, DynamoDB, Cassandra, or FoundationDB for video metadata and online features. Use Kafka, Pulsar, Kinesis, or Pub/Sub for engagement streams. Use a vector index or approximate nearest-neighbor service for embedding-based candidate retrieval. Use an OLAP warehouse or lakehouse for offline training, analytics, and experimentation.

The online feature store is usually split into hot memory or SSD-backed serving for low-latency features and offline parquet or warehouse tables for training. Consistency is best-effort for most recommendation features, but policy and moderation state must be strongly enforced before content is shown.
`,
  },
  architecture: {
    width: 980,
    height: 580,
    nodes: [
      { id: "client", label: "Mobile Client", kind: "client", x: 70, y: 230, sublabel: "Swipe, buffer, events" },
      { id: "cdn", label: "CDN Edge", kind: "cdn", x: 230, y: 110, sublabel: "ABR segments" },
      { id: "gateway", label: "API Gateway", kind: "gateway", x: 230, y: 330, sublabel: "Auth, rate limits" },
      { id: "feed-service", label: "Feed Service", kind: "service", x: 410, y: 300, sublabel: "For You API" },
      { id: "candidate-service", label: "Candidate Generation", kind: "service", x: 590, y: 190, sublabel: "Recall sources" },
      { id: "ranking-service", label: "Ranking Service", kind: "service", x: 760, y: 190, sublabel: "Blend, diversify" },
      { id: "model-serving", label: "Model Serving", kind: "service", x: 900, y: 300, sublabel: "Batch scoring" },
      { id: "feature-store", label: "Online Feature Store", kind: "database", x: 590, y: 420, sublabel: "User, video, session" },
      { id: "event-stream", label: "Engagement Stream", kind: "queue", x: 410, y: 500, sublabel: "Kafka, Pulsar" },
      { id: "media-pipeline", label: "Media Pipeline", kind: "worker", x: 410, y: 90, sublabel: "Transcode, moderate" },
      { id: "video-storage", label: "Video Storage", kind: "storage", x: 590, y: 70, sublabel: "Objects, manifests" },
      { id: "metadata-store", label: "Metadata Store", kind: "database", x: 760, y: 70, sublabel: "Video state" },
    ],
    edges: [
      { from: "client", to: "gateway", label: "feed, upload, events" },
      { from: "client", to: "cdn", label: "play and prefetch" },
      { from: "cdn", to: "video-storage", label: "origin fill" },
      { from: "gateway", to: "feed-service", label: "GET For You" },
      { from: "feed-service", to: "candidate-service", label: "retrieve candidates" },
      { from: "candidate-service", to: "metadata-store", label: "eligible inventory" },
      { from: "candidate-service", to: "feature-store", label: "retrieval features" },
      { from: "candidate-service", to: "ranking-service", label: "candidate set" },
      { from: "ranking-service", to: "feature-store", label: "hydrate features" },
      { from: "ranking-service", to: "model-serving", label: "score batch" },
      { from: "model-serving", to: "ranking-service", label: "scores" },
      { from: "feed-service", to: "gateway", label: "ranked feed page" },
      { from: "gateway", to: "event-stream", label: "watch signals", dashed: true },
      { from: "event-stream", to: "feature-store", label: "fresh features", dashed: true },
      { from: "gateway", to: "media-pipeline", label: "upload complete", dashed: true },
      { from: "media-pipeline", to: "video-storage", label: "ABR renditions", dashed: true },
      { from: "media-pipeline", to: "metadata-store", label: "moderation state", dashed: true },
    ],
    captionMD: `
The hot feed path is client to gateway to feed service to candidate generation to ranking and model serving, then back with CDN playback metadata. Video bytes are served separately from CDN. Engagement events and media processing update the feature and metadata stores asynchronously.
`,
  },
  architectureNotesMD: `
TikTok is best understood as two coupled systems. The serving system returns the next ranked page quickly: candidate generation retrieves thousands of possible videos, ranking scores a smaller set with fresh features, post-ranking applies policy and diversity, and the client prefetches video segments through CDN. This path must have strict latency budgets and fallbacks.

The ingestion and learning system runs continuously behind it. Uploads flow through object storage, transcoding, fingerprinting, moderation, thumbnail extraction, and feature extraction before becoming eligible. Watch-time and interaction events stream into real-time aggregations that update user, video, creator, and session features. Offline pipelines train new models from the same event log.

The architecture intentionally separates media delivery, recommendation serving, and analytics. CDN egress dominates cost, model serving dominates compute, and event ingestion dominates write throughput. Treating these as independent planes keeps failures contained.
`,
  requestFlow: [
    {
      title: "Creator uploads a video",
      detailMD: `
The client requests a resumable upload session, sends the original media to object storage using signed URLs, and then marks the upload complete. Metadata is created with status **processing** so the video cannot be broadly recommended yet.
`,
    },
    {
      title: "Media pipeline prepares inventory",
      detailMD: `
Workers validate the file, extract thumbnails, transcode into HLS or DASH adaptive bitrate renditions, compute perceptual fingerprints, run copyright checks, and submit the video to automated moderation. Passing videos move to **active** or **limited** distribution.
`,
    },
    {
      title: "Feed request arrives",
      detailMD: `
The mobile client asks for a For You page with a cursor, device context, network quality, locale, and recent served history. The gateway authenticates the user, applies rate limits, and forwards the request to the feed service.
`,
    },
    {
      title: "Candidate generation recalls possible videos",
      detailMD: `
The candidate service retrieves a few thousand videos from multiple sources: embedding similarity, trending by region and language, fresh uploads needing exploration, creator affinity, topic interest, and ads. It filters out already served, blocked, unsafe, or ineligible videos before ranking.
`,
    },
    {
      title: "Features are hydrated",
      detailMD: `
The ranker fetches batched online features for the user, session, candidate videos, creators, and context. Important features include recent watch time by topic, completion rates, replay rate, skip history, freshness, creator quality, moderation risk, and device or network constraints.
`,
    },
    {
      title: "Models score and post-rank candidates",
      detailMD: `
Model serving scores candidates in batches for predicted watch time, completion, engagement, negative feedback, and policy risk. Post-ranking blends objectives, enforces diversity, caps repeated creators, inserts ads if applicable, and creates an ordered page.
`,
    },
    {
      title: "Feed response enables prefetch",
      detailMD: `
The feed service returns video ids, ranking metadata, thumbnails, ABR manifest URLs, experiment ids, and prefetch hints for the next few videos. The client starts fetching manifests and early segments from CDN before the user swipes.
`,
    },
    {
      title: "Playback uses CDN and ABR",
      detailMD: `
The client chooses renditions based on network and buffer health. CDN edge nodes serve manifests and segments, filling from origin storage only on misses. ABR keeps playback smooth even as network conditions change.
`,
    },
    {
      title: "Engagement closes the loop",
      detailMD: `
The client emits impression, start, watch progress, completion, replay, like, share, comment, follow, skip, and report events. Stream processors deduplicate and aggregate them into online features so future feed requests react quickly.
`,
    },
  ],
  coreComponents: [
    {
      name: "Feed Service",
      kind: "service",
      role: "Owns the For You API and coordinates retrieval, ranking, and response shaping.",
      detailMD: `
The feed service handles cursors, served-history suppression, experiment assignment, fallback selection, response assembly, and prefetch metadata. It should be stateless apart from short-lived request context so it can scale horizontally.
`,
    },
    {
      name: "Candidate Generation Service",
      kind: "service",
      role: "Retrieves a broad set of eligible videos before expensive ranking.",
      detailMD: `
Candidate generation uses multiple recall sources such as embeddings, trends, fresh-upload exploration, user-topic affinity, and creator affinity. Its goal is high recall under tight latency, not final ordering. It must also apply hard eligibility filters before ranking.
`,
    },
    {
      name: "Ranking Service",
      kind: "service",
      role: "Scores, blends, filters, diversifies, and orders candidate videos.",
      detailMD: `
The ranker batches feature reads and model-scoring calls, combines multiple objectives, applies policy constraints, enforces diversity, and returns the final page. It should support model versioning, canaries, shadow scoring, and safe fallbacks.
`,
    },
    {
      name: "Model Serving Layer",
      kind: "service",
      role: "Runs low-latency inference for recommendation models.",
      detailMD: `
Model serving hosts ranking models, calibrators, and lightweight rerankers. It needs batching, hardware-aware autoscaling, model-version routing, timeouts, and a degraded path that can use cached scores or a smaller model.
`,
    },
    {
      name: "Online Feature Store",
      kind: "database",
      role: "Serves fresh features for users, videos, creators, sessions, and context.",
      detailMD: `
The feature store exposes low-latency batched reads and streaming writes. It holds recent engagement aggregates, video quality signals, creator reputation, session interests, freshness counters, and trend features with explicit versions and TTLs.
`,
    },
    {
      name: "Media Pipeline",
      kind: "worker",
      role: "Turns raw uploads into safe, playable, recommendable inventory.",
      detailMD: `
The pipeline validates media, transcodes variants, creates ABR manifests, extracts thumbnails, computes embeddings and fingerprints, checks copyright, and triggers moderation. It publishes readiness and feature-extraction events after each stage.
`,
    },
    {
      name: "Engagement Pipeline",
      kind: "queue",
      role: "Streams watch signals into real-time features and offline training data.",
      detailMD: `
Kafka, Pulsar, or a similar log ingests hundreds of billions of events per day. Stream processors deduplicate, sessionize, aggregate, and publish online features while also writing immutable raw events to the data lake for training and experimentation.
`,
    },
    {
      name: "CDN and Prefetch Layer",
      kind: "cdn",
      role: "Delivers video segments close to users and hides swipe latency.",
      detailMD: `
The CDN serves ABR manifests, segments, and thumbnails. The client prefetches the next few ranked videos based on feed hints and network state. CDN configuration should protect origin storage, support regional invalidation, and report playback telemetry.
`,
    },
  ],
  deepDives: [
    {
      topic: "Candidate generation is the feed crux, not social fanout",
      detailMD: `
A common mistake is to design TikTok like a follower-feed system. The For You Page does not primarily fan out creator posts to followers. It selects from a massive global inventory and ranks videos for each user at request time.

Candidate generation should retrieve thousands of possible videos in tens of milliseconds. Use multiple recall channels: approximate nearest-neighbor search over user and video embeddings, regional trending videos, topic-interest buckets, fresh uploads in exploration pools, similar creators, collaborative filtering, and sponsored candidates. Each channel contributes a bounded number of candidates and metadata about why the candidate was retrieved.

The service must remove videos the user has already seen, blocked creators, unsafe content, unavailable regions, age-ineligible content, and videos that violate freshness or frequency caps. Final ranking only works if retrieval includes enough diverse high-quality options, so candidate-generation metrics should track recall, source diversity, latency, and downstream engagement.
`,
    },
    {
      topic: "Feature store and model-serving latency",
      detailMD: `
Ranking quality depends on fresh features. User features include recent watch time by topic, skip patterns, language preference, session momentum, repeated interests, negative feedback, and social actions. Video features include completion rate, replay rate, like rate, report rate, freshness, topic embeddings, creator reputation, and moderation signals. Context features include network type, device, time of day, region, and app version.

Online ranking cannot join across transactional stores. The ranker should issue batched feature-store lookups keyed by user id, session id, video ids, and creator ids. Feature values must carry a version and freshness timestamp so models can reject stale or incompatible features.

Model serving should score candidates in batches and use staged ranking. A lightweight model can reduce thousands of candidates to hundreds, then a heavier model scores the final set. If model serving is slow, use cached scores, smaller models, or fallback ranking rather than timing out the whole feed.
`,
    },
    {
      topic: "Rapid feedback loop from engagement signals",
      detailMD: `
TikTok's recommendation quality depends on interpreting weak and strong signals. Watch time and completion are often stronger than likes because they capture implicit interest. Replays are a high-intent signal. Skips, short watch time, reports, and **not interested** actions are negative signals. Shares, follows, comments, and profile visits are explicit positive signals.

The event pipeline should deduplicate client retries, sequence events by session, and compute real-time aggregates such as video velocity, topic affinity, creator affinity, fatigue, and recent negative feedback. Hot video features may need updates every few seconds because viral distribution can change quickly.

Not every signal should immediately amplify distribution. Reports and moderation risk should dampen exposure. New videos need controlled exploration so the system can estimate quality without overexposing unsafe or low-quality content. The feedback loop is therefore both a ranking asset and a safety risk.
`,
    },
    {
      topic: "Cold-start for users, videos, and creators",
      detailMD: `
New users have little behavioral history. Start with onboarding interests, region, language, device context, broad trending content, and short exploration sessions. After a few swipes, session-level features can dominate long-term profile assumptions because watch time and skips provide quick signal.

New videos have no engagement history. Use creator reputation, content embeddings, caption and hashtag features, audio features, visual topics, language, safety score, and similarity to known successful videos. Place each new video into small exploration buckets and expand distribution only when early cohorts show healthy completion, replay, and low negative feedback.

New creators need a fairness mechanism so established creators do not monopolize recommendations. Use quotas or calibrated exploration for new creators, but cap exposure until moderation and quality signals are reliable. Cold-start policy should be measurable through creator retention, user satisfaction, and safety incidents.
`,
    },
    {
      topic: "Video upload, transcoding, CDN delivery, and prefetch",
      detailMD: `
Upload should be resumable and direct to object storage so API servers do not proxy large files. After completion, workers transcode into multiple renditions for adaptive bitrate playback, create manifests, extract thumbnails, compute fingerprints, and store segment metadata. Failed variants can be retried independently.

Playback uses CDN because origin egress would be unaffordable and too slow. The feed response should include manifest URLs, thumbnail URLs, expected duration, and prefetch count. The client fetches manifests and the first segments for the next few videos while the current video plays. This turns recommendation latency and network variability into background work.

Prefetch has a cost tradeoff. Aggressive prefetch reduces swipe latency but wastes bandwidth when users skip quickly or leave the app. The client should adapt prefetch depth based on network type, battery, buffer health, and predicted session length. The server can avoid prefetching risky or low-confidence recommendations too far ahead.
`,
    },
    {
      topic: "Moderation and policy-aware ranking",
      detailMD: `
Moderation is not a separate afterthought. It is part of candidate eligibility and ranking. Automated classifiers, perceptual hashes, copyright fingerprints, text analysis, audio analysis, creator history, and user reports all produce policy features. Some decisions block content globally, while others limit reach by age, region, topic, or confidence.

The system should support pre-publish checks, post-publish monitoring, human review queues, and fast takedown propagation. Ranking should downrank borderline content before final moderation confidence is reached. Reports from trusted users or high-severity categories can trigger immediate exposure reduction.

Policy decisions need auditability. Store model version, rule version, reviewer decision, reason codes, and distribution changes. This matters for user appeals, regulatory requests, and debugging why a video was or was not shown.
`,
    },
  ],
  scaling: [
    {
      stage: "Prototype: single region and simple ranking",
      detailMD: `
Start with one upload service, one transcoding queue, object storage, a metadata database, and a feed service that ranks by recency, region, language, and simple engagement aggregates. Use CDN for playback from the beginning because serving video directly from application servers is the wrong architecture even at small scale.
`,
    },
    {
      stage: "Growth: real-time events and feature store",
      detailMD: `
Add an engagement stream, stream processors, an online feature store, and separate candidate-generation sources. Introduce ABR variants, client prefetch, moderation queues, and a first ML ranker. Keep feature computation versioned so training and serving stay aligned.
`,
    },
    {
      stage: "Large scale: staged retrieval and model serving",
      detailMD: `
Split ranking into retrieval, lightweight ranking, heavy ranking, and post-ranking. Add vector search, regional trending indexes, hot feature caches, model-serving autoscaling, feed fallbacks, and experiment configuration. Isolate upload and transcoding workloads from feed serving capacity.
`,
    },
    {
      stage: "Global scale: regional serving and massive CDN egress",
      detailMD: `
Serve feed requests regionally, place media in multi-region object storage behind CDN, replicate feature stores with locality, and run regional event ingestion with global offline aggregation. Use geo-aware candidate pools, policy rules by jurisdiction, and traffic steering during regional failures.
`,
    },
    {
      stage: "Staff scale: continuous learning and governance",
      detailMD: `
Add automated model canaries, shadow scoring, counterfactual logging, fairness and safety guardrails, creator marketplace constraints, ad blending, data retention controls, and lineage for every feature and model. Optimize CDN spend with cache-aware ranking and adaptive prefetch policies.
`,
    },
  ],
  bottlenecks: [
    {
      issue: "Model-serving latency and cost",
      optimizationMD: `
Use staged ranking, batch scoring, vectorized inference, hardware-aware autoscaling, model distillation, cached video-side embeddings, and strict timeouts. Keep a smaller fallback model and precomputed popular lists ready when the heavy ranker is overloaded.
`,
    },
    {
      issue: "Feature-store hot keys and fanout reads",
      optimizationMD: `
Batch feature reads, denormalize user and video features, cache hot video and creator features, shard by entity id, and avoid per-candidate joins. Store session features with short TTLs and replicate viral video features to reduce hot-partition pressure.
`,
    },
    {
      issue: "Engagement event ingestion spikes",
      optimizationMD: `
Use partitioned logs, client batching, compression, backpressure, idempotency keys, and regional ingestion. Prioritize high-value events such as completion, replay, like, skip, and report if low-value progress events must be sampled under extreme pressure.
`,
    },
    {
      issue: "CDN egress cost and origin overload",
      optimizationMD: `
Keep popular videos at edge, tune segment size and cache headers, use regional origin shields, adapt prefetch depth, and rank with some awareness of media availability when quality is otherwise similar. Protect origin with request coalescing and rate limits.
`,
    },
    {
      issue: "Cold-start exploration consuming feed quality",
      optimizationMD: `
Use controlled exploration buckets, per-user exploration budgets, safety gates, and early-cohort evaluation. Expand distribution gradually as completion, replay, and negative feedback metrics improve.
`,
    },
    {
      issue: "Moderation lag on viral videos",
      optimizationMD: `
Apply risk-aware distribution caps, raise review priority as velocity increases, use trusted-reporter signals, and propagate takedowns through metadata, candidate indexes, feature store, and CDN invalidation paths.
`,
    },
  ],
  failureHandling: [
    {
      scenario: "Ranking model-serving outage",
      strategyMD: `
Fall back to cached scores, a smaller local model, regional trending lists personalized by language and safety filters, or the last successful feed page with duplicate suppression. Keep timeouts strict so one ranker dependency cannot exhaust feed-service threads.
`,
    },
    {
      scenario: "Feature store degraded or stale",
      strategyMD: `
Use stale-but-marked features for a bounded window, fall back to offline features or popular lists, and disable feature-dependent experiments. The ranker should know feature freshness and avoid models that require missing critical features.
`,
    },
    {
      scenario: "Engagement stream lag",
      strategyMD: `
Continue playback and feed serving with older features while exposing freshness metrics. Prioritize report and negative-feedback events, shed low-value progress events if needed, and replay buffered logs after recovery to repair offline training data.
`,
    },
    {
      scenario: "Transcoding workers fail",
      strategyMD: `
Keep uploaded videos in processing state, retry failed jobs with idempotent task ids, and publish only variants that pass validation. Existing videos continue serving from CDN and object storage because feed serving is isolated from transcoding.
`,
    },
    {
      scenario: "CDN regional outage or origin pressure",
      strategyMD: `
Steer traffic to another CDN region or provider, reduce prefetch depth, prefer already-cached popular videos temporarily, and use origin shields to prevent thundering herds. The feed service can avoid recommending videos whose media is currently unhealthy in that region.
`,
    },
    {
      scenario: "Moderation service unavailable",
      strategyMD: `
Do not broadly distribute newly uploaded videos until minimum automated checks pass. Existing low-risk videos can continue, but high-risk categories receive conservative downranking or temporary holds. Reports should still be queued durably.
`,
    },
  ],
  security: [
    {
      label: "Upload abuse prevention",
      detailMD: `
Authenticate creators, enforce upload quotas, scan files for malware, validate codecs and durations, reject malformed containers, and isolate processing workers. Use signed upload URLs with short expiration and least privilege.
`,
    },
    {
      label: "Content safety and age policy",
      detailMD: `
Apply automated classifiers, human review, age gates, regional policy rules, and user-report workflows. Safety state must be checked before candidate generation or final ranking so blocked videos do not leak through cached recommendations.
`,
    },
    {
      label: "Privacy and data minimization",
      detailMD: `
Engagement data can reveal sensitive interests. Minimize raw retention, restrict feature access, aggregate where possible, support deletion and export requests, and apply stricter controls for minors and sensitive regions.
`,
    },
    {
      label: "Signed media access",
      detailMD: `
Use signed or tokenized URLs when content access must be controlled, and keep origin buckets private. CDN tokens should expire quickly enough to reduce scraping while still allowing smooth playback and retry behavior.
`,
    },
    {
      label: "Bot and manipulation resistance",
      detailMD: `
Attackers will try to inflate watch time, likes, follows, and reports. Use device reputation, rate limits, anomaly detection, graph-based fraud signals, and delayed trust for suspicious engagement before it affects ranking.
`,
    },
    {
      label: "Experiment and model governance",
      detailMD: `
Restrict who can launch ranking experiments, require guardrail metrics, log model and feature versions, and keep rollback controls. Bad ranking changes can create safety, fairness, and business incidents very quickly.
`,
    },
  ],
  tradeoffs: {
    pros: [
      "Recommendation-driven retrieval avoids expensive social-graph fanout and can surface new creators quickly.",
      "Separating feed metadata from CDN video delivery keeps API latency independent of media bytes.",
      "Streaming engagement updates make recommendations responsive to watch time, completion, replays, likes, skips, and reports.",
      "Staged ranking balances model quality with latency and infrastructure cost.",
      "Controlled exploration solves cold-start while limiting safety and quality risk.",
    ],
    cons: [
      "The system is operationally complex because upload processing, event ingestion, feature serving, model inference, CDN delivery, and moderation all interact.",
      "Aggressive personalization can create filter bubbles and safety concerns without diversity and policy guardrails.",
      "Real-time features and model serving add expensive low-latency dependencies to the feed path.",
      "Prefetch improves perceived latency but can waste substantial CDN bandwidth.",
      "Cold-start exploration can hurt short-term engagement if not carefully budgeted.",
    ],
    alternativesMD: `
Alternative one is a follower-feed design similar to Instagram or Twitter. It is simpler for social subscriptions, but it misses TikTok's core discovery product and does not solve global inventory ranking.

Alternative two is a mostly offline precomputed feed. It can reduce online latency, but it reacts poorly to session behavior, fresh viral videos, and real-time safety signals.

Alternative three is a pure trending feed by region and language. It is robust and cheap, and it is useful as a fallback, but it under-personalizes and makes it harder for niche interests and new creators to find the right audience.
`,
    whenNotToUseMD: `
Do not use this architecture for a small private video app where users only watch subscriptions or team-owned content. The cost and complexity of real-time recommendation, feature stores, model serving, and massive CDN optimization are justified only when discovery quality and engagement are the primary product differentiators.
`,
  },
  followUpQuestions: [
    {
      question: "Why is TikTok not primarily a fanout problem?",
      answerMD: `
The For You Page is recommendation-driven. It chooses from global and regional inventory at request time using candidate generation, features, and ML ranking. Follower relationships can be a candidate source, but the core feed is not built by pushing every creator post to follower inboxes.
`,
    },
    {
      question: "Which engagement signals matter most for ranking?",
      answerMD: `
Watch time, completion rate, replay rate, skip behavior, and negative feedback are usually stronger than simple likes because they reflect actual attention. Likes, shares, comments, follows, and profile visits add explicit intent. Reports and **not interested** actions should reduce distribution.
`,
    },
    {
      question: "How do you keep the feed API under a tight latency budget?",
      answerMD: `
Use staged candidate retrieval, batched feature reads, batched model inference, timeouts, cached video features, precomputed embeddings, and fallback candidate lists. Return enough items per page so the client can prefetch and avoid calling the feed API on every swipe.
`,
    },
    {
      question: "How do you handle a brand-new video with no engagement history?",
      answerMD: `
Use content embeddings, caption and hashtag features, audio and visual topics, language, creator reputation, and safety score. Put the video into small exploration cohorts, measure completion and negative feedback, then expand distribution gradually if early signals are healthy.
`,
    },
    {
      question: "How should prefetch depth be chosen?",
      answerMD: `
Prefetch enough upcoming videos to hide network latency, but not so many that bandwidth is wasted. The client and server can adapt based on network type, battery, buffer health, CDN cache state, predicted session length, and confidence in the ranked list.
`,
    },
    {
      question: "What happens when the engagement pipeline is delayed?",
      answerMD: `
Feed serving should continue with older features and clear freshness markers. High-priority safety signals should use a priority path if possible. After recovery, replay logs to repair aggregates and offline training data, but do not block playback on event freshness.
`,
    },
    {
      question: "How do moderation decisions propagate quickly?",
      answerMD: `
Moderation state should be part of hard eligibility filters and final ranking checks. Takedowns update metadata, invalidate candidate indexes, update feature-store policy fields, and purge or block CDN access when required. Viral videos should receive higher moderation priority.
`,
    },
  ],
  companyVariations: [
    {
      company: "Meta",
      angleMD: `
Meta interviewers may compare this to Reels, Instagram feed, and Facebook feed. Emphasize the difference between recommendation retrieval and social fanout, then discuss integrity, creator fairness, experimentation, and cross-surface ranking.
`,
    },
    {
      company: "Google",
      angleMD: `
Google tends to probe large-scale ML serving, YouTube-like video infrastructure, feature freshness, ABR delivery, and global reliability. Be ready to quantify CDN egress, candidate scoring rate, and fallback behavior under model-serving failures.
`,
    },
    {
      company: "Netflix",
      angleMD: `
Netflix may focus on personalization quality, playback reliability, ABR, CDN efficiency, experimentation, and cold-start. Contrast long-form recommendation with TikTok's rapid swipe feedback loop and much higher per-session item turnover.
`,
    },
    {
      company: "Amazon",
      angleMD: `
Amazon interviewers often push on operational ownership, cost, queue backpressure, DynamoDB or KV modeling, and service isolation. Explain how feed serving remains available when uploads, analytics, or moderation queues are degraded.
`,
    },
  ],
  relatedQuestions: [
    {
      slug: "youtube",
      note: "Shares upload, transcoding, ABR playback, CDN delivery, and video metadata challenges.",
    },
    {
      slug: "netflix",
      note: "Useful for comparing recommendation quality, CDN playback, ABR, and prefetch tradeoffs.",
    },
    {
      slug: "instagram",
      note: "Contrasts social graph and creator-follow surfaces with a recommendation-heavy short-video feed.",
    },
    {
      slug: "model-serving-platform",
      note: "The ranking layer depends on low-latency batched inference, model versioning, and fallback models.",
    },
    {
      slug: "distributed-cache",
      note: "Hot video metadata, features, manifests, and fallback feeds all depend on caching strategy.",
    },
  ],
  interviewTips: {
    commonMistakes: [
      "Designing TikTok as only a follower fanout feed.",
      "Ignoring the video upload, transcoding, moderation, and CDN delivery pipeline.",
      "Treating likes as the only engagement signal while missing watch time, completion, replays, skips, and reports.",
      "Putting expensive model scoring or feature joins directly on the critical path without batching or fallbacks.",
      "Forgetting cold-start for new users, new videos, and new creators.",
      "Ignoring the cost and waste created by aggressive prefetch.",
    ],
    redFlags: [
      "No capacity math for views, event ingestion, CDN egress, or ranking scores.",
      "No feature store or model-serving layer in a recommendation-heavy design.",
      "No safety or moderation enforcement before content is recommended.",
      "No degradation path when rankers, feature stores, or event pipelines fail.",
      "No distinction between metadata APIs and video byte delivery through CDN.",
    ],
    expectations: [
      "Lead with For You candidate generation and ML ranking rather than social graph fanout.",
      "Show the separate planes: upload processing, feed serving, event feedback, and CDN playback.",
      "Use concrete numbers for feed QPS, event volume, egress, storage, and model scoring.",
      "Discuss cold-start, exploration, and safety-aware distribution.",
      "Explain ABR, CDN, and prefetch because perceived latency is as important as API latency.",
      "Name fallbacks for stale features, model outages, CDN problems, and moderation lag.",
    ],
    communicationMD: `
Start by saying the crux is a recommendation-driven For You feed. Draw the hot path first: feed request, candidate generation, feature hydration, ML ranking, post-ranking, and CDN playback metadata. Then add the upload and transcoding pipeline, the engagement feedback loop, and moderation controls. Keep returning to the three budgets interviewers care about: feed latency, model quality, and video delivery cost.
`,
  },
  revisionNotesMD: `
- TikTok's For You Page is not mainly social-graph fanout. It is request-time candidate generation plus ML ranking over global and regional video inventory.
- Use multiple candidate sources: embeddings, trends, fresh uploads, topic affinity, creator affinity, collaborative filtering, and ads.
- Ranking uses fresh features from users, sessions, videos, creators, and context. Watch time, completion, replays, skips, likes, shares, follows, comments, and reports all matter.
- At 500M DAU and 120 plays per user per day, plan for about 60B plays per day, 3B feed pages per day, 34,700 average feed QPS, and 139,000 peak feed QPS.
- Event volume is enormous: 60B plays times 4 events equals 240B events per day, or about 2.8M events per second average.
- CDN dominates cost. At 5 MB delivered per play, 60B plays produce about 300 PB of egress per day.
- Uploads need direct-to-object-storage, resumable sessions, transcoding into ABR renditions, thumbnails, fingerprinting, feature extraction, and moderation.
- Client prefetch hides latency but wastes bandwidth if too aggressive. Adapt prefetch depth to network, battery, buffer health, and recommendation confidence.
- Cold-start is solved through onboarding interests, region and language trends, content embeddings, creator reputation, and controlled exploration cohorts.
- Moderation must be part of eligibility and ranking, not a side system. Takedowns must update metadata, candidate indexes, features, and CDN access.
- Ranking failures should degrade to cached scores, smaller models, regional trends, or last-good fallback feeds rather than taking down playback.
`,
  flashcards: [
    {
      front: "What is the core crux of designing TikTok?",
      back: "A recommendation-driven For You feed using candidate generation, fresh features, ML ranking, CDN delivery, prefetch, feedback loops, cold-start handling, and moderation.",
    },
    {
      front: "Why is TikTok not primarily a fanout problem?",
      back: "The For You Page selects from broad inventory at request time; follower relationships are only one possible candidate source.",
    },
    {
      front: "Which signals are strongest for ranking?",
      back: "Watch time, completion, replays, skips, and negative feedback are especially important, with likes, shares, comments, follows, and reports adding explicit signals.",
    },
    {
      front: "Why does TikTok need an online feature store?",
      back: "The ranker needs low-latency, fresh user, video, creator, session, and context features without joining transactional databases during feed requests.",
    },
    {
      front: "How does TikTok handle new videos?",
      back: "Use content embeddings, caption, audio, visual features, creator reputation, safety score, and controlled exploration cohorts before broad distribution.",
    },
    {
      front: "Why is ABR important for TikTok?",
      back: "Adaptive bitrate lets the client switch renditions based on network and buffer health, reducing startup delay and rebuffering.",
    },
    {
      front: "What is the role of prefetching?",
      back: "The client downloads manifests and early segments for upcoming ranked videos so swipes feel instant, balanced against bandwidth waste.",
    },
    {
      front: "What should happen if model serving is down?",
      back: "Use cached scores, a smaller fallback model, regional trends, or last-good feeds while keeping timeouts strict.",
    },
    {
      front: "Why is moderation part of ranking?",
      back: "Unsafe or borderline content must be blocked, limited, or downranked before recommendation so viral distribution does not amplify harm.",
    },
  ],
  quiz: [
    {
      question: "What is the best high-level framing for TikTok's For You Page?",
      options: ["A write-heavy social graph fanout system", "A recommendation-driven feed using candidate generation and ranking", "A simple chronological upload list", "A file backup and sharing system"],
      answerIndex: 1,
      explanationMD: `
The For You Page is primarily built through request-time retrieval and ML ranking over eligible video inventory, not by fanout to followers.
`,
    },
    {
      question: "Which signal is usually more informative for short-video ranking than a simple like?",
      options: ["Original filename length", "Watch time and completion behavior", "Upload part number", "HTTP user-agent length"],
      answerIndex: 1,
      explanationMD: `
Watch time, completion, replay, and skip behavior capture actual attention and are often stronger implicit signals than a like alone.
`,
    },
    {
      question: "With 500M daily users and 120 video starts per user per day, how many video plays happen per day?",
      options: ["600M", "6B", "60B", "600B"],
      answerIndex: 2,
      explanationMD: `
500M times 120 equals 60B video starts or plays per day.
`,
    },
    {
      question: "Why should video bytes be served through CDN instead of the feed API?",
      options: ["The feed API cannot return JSON", "CDN reduces latency and origin load for massive media egress", "CDN is required for database writes", "It removes the need for moderation"],
      answerIndex: 1,
      explanationMD: `
The feed API returns metadata and playback URLs. CDN edge nodes serve manifests and segments close to users, reducing latency, origin load, and egress cost.
`,
    },
    {
      question: "What is a good cold-start strategy for a new video?",
      options: ["Never show it until it has millions of views", "Use content features and controlled exploration cohorts", "Only show it to the creator", "Randomly show it globally with no safety checks"],
      answerIndex: 1,
      explanationMD: `
New videos need initial estimates from content embeddings, metadata, creator reputation, and safety scores, then controlled exploration to gather real engagement signals.
`,
    },
    {
      question: "What should the feed do when the heavy ranking model times out?",
      options: ["Fail every feed request", "Block playback until the model recovers", "Use cached scores, smaller models, or safe fallback lists", "Skip moderation checks"],
      answerIndex: 2,
      explanationMD: `
Feed serving needs strict timeouts and graceful degradation. Cached scores, lightweight models, and safe popular lists preserve availability while model serving recovers.
`,
    },
    {
      question: "Why can aggressive prefetch be dangerous?",
      options: ["It prevents adaptive bitrate playback", "It wastes CDN bandwidth when users skip or leave", "It makes engagement events impossible", "It disables candidate generation"],
      answerIndex: 1,
      explanationMD: `
Prefetch hides swipe latency, but downloading too many upcoming videos wastes bandwidth and CDN cost when users skip quickly or end the session.
`,
    },
  ],
  cheatSheetMD: `
**Goal**: design TikTok's recommendation-driven For You Page, not just a follower feed.

**Hot path**: mobile client calls feed API, feed service retrieves candidates, ranker hydrates features, model serving scores candidates, post-ranking applies policy and diversity, response returns CDN playback metadata, client prefetches next videos.

**Upload path**: signed resumable upload to object storage, then validation, transcoding, ABR manifests, thumbnails, fingerprinting, content embeddings, moderation, metadata update, and eligibility indexing.

**Capacity**: 500M DAU times 120 plays equals 60B plays per day. With 20 items per feed page, expect 3B feed pages per day, about 34,700 average feed QPS, and about 139,000 peak feed QPS.

**Events**: 60B plays times 4 events equals 240B engagement events per day, about 2.8M events per second average. Deduplicate, sessionize, aggregate, and update online features quickly.

**CDN**: 60B plays times 5 MB delivered equals about 300 PB per day. CDN, ABR, origin shielding, and adaptive prefetch are mandatory.

**Ranking**: use multiple recall sources, batched feature-store reads, staged ranking, model-serving timeouts, diversity, safety filters, and fallback feeds.

**Cold-start**: new users use onboarding, region, language, trends, and rapid session signals. New videos use embeddings, metadata, creator reputation, safety score, and exploration cohorts.

**Moderation**: safety state is a hard eligibility input and a ranking feature. Reports and takedowns must propagate through metadata, candidate indexes, feature store, and CDN controls.

**Failure handling**: if ranker or features fail, use cached scores, smaller models, regional trends, or last-good feeds. If event ingestion lags, continue serving with stale features and repair later. If CDN fails, steer traffic and reduce prefetch.
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
      title: "The YouTube Video Recommendation System",
      kind: "Paper",
      url: "https://research.google/pubs/the-youtube-video-recommendation-system/",
      author: "Google Research",
    },
    {
      title: "The Tail at Scale",
      kind: "Paper",
      url: "https://research.google/pubs/the-tail-at-scale/",
      author: "Jeffrey Dean and Luiz Andre Barroso",
    },
    {
      title: "HTTP Live Streaming",
      kind: "Docs",
      url: "https://developer.apple.com/streaming/",
      author: "Apple Developer",
    },
  ],
};
