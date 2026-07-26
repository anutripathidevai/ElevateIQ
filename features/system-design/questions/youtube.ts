import type { SDQuestionContent } from "../types";

export const youtubeContent: SDQuestionContent = {
  slug: "youtube",
  statementMD: `
Design YouTube, a global video platform where creators upload videos and viewers discover, stream, like, comment on, and share them. The system must accept large, unreliable uploads from browsers and mobile devices, convert each upload into adaptive bitrate renditions, and serve playback with low startup latency across the world.

At interview scale, assume hundreds of hours uploaded every minute, billions of videos watched per day, and a read-heavy playback workload where CDN segment requests dwarf all other traffic. The core challenge is not only storing video files; it is coordinating asynchronous media processing, keeping metadata and social actions fresh, counting views at massive scale, and distributing video segments close to users without overwhelming origin storage.

The default design should separate the upload and transcode path from the playback path. Uploads can take seconds or minutes and are handled by durable state machines, queues, blob storage, and worker farms. Playback should be served mostly by CDN edge caches using HLS or DASH manifests, while metadata, comments, likes, search, and recommendations evolve independently behind APIs.
`,
  businessUseCaseMD: `
YouTube connects creators, viewers, advertisers, and communities. Creators need reliable publishing, monetization, analytics, and audience reach. Viewers need fast playback, personalized discovery, search, playlists, comments, and subscriptions across web, mobile, TV, and embedded clients.

For the business, the platform turns uploaded media and engagement signals into a large content graph. That graph powers recommendations, ads, creator analytics, moderation workflows, and long-term retention, so the design must optimize for both media delivery efficiency and high-quality metadata and engagement pipelines.
`,
  functionalRequirements: [
    "Allow creators to create upload sessions, upload video chunks, resume failed uploads, and finalize an upload.",
    "Transcode uploaded videos asynchronously into multiple adaptive bitrate renditions and generate HLS or DASH manifests.",
    "Generate thumbnails and store media metadata such as title, description, duration, channel, visibility, tags, and processing status.",
    "Serve video playback through CDN URLs with manifests, segments, captions, thumbnails, and playback authorization where required.",
    "Support channels, playlists, subscriptions, likes, dislikes or reactions, comments, replies, and basic moderation states.",
    "Aggregate views and watch-time signals with batching, deduplication, and approximate counters at massive scale.",
    "Support search over video metadata and a recommendation feed based on viewer, content, and engagement signals.",
    "Expose creator dashboards for processing status, visibility changes, aggregate analytics, and video management.",
  ],
  nonFunctionalRequirements: [
    {
      label: "Playback latency",
      detailMD: `
The viewer path should optimize for fast start and smooth streaming. A practical target is under 1 second median time to first frame, under 2 seconds p95 startup in well-served regions, and very low rebuffering through CDN edge caching, adaptive bitrate selection, and client buffering.
`,
    },
    {
      label: "Upload reliability",
      detailMD: `
Uploads may be multi-gigabyte files over mobile or home networks. The system must support chunked and resumable upload sessions, idempotent part writes, integrity checks, session expiration, and safe retries without duplicating videos or losing creator progress.
`,
    },
    {
      label: "Availability",
      detailMD: `
Playback should remain available even if comments, recommendations, search indexing, or creator analytics are degraded. CDN edges can continue serving cached segments, while metadata APIs should degrade gracefully with cached watch pages and retryable errors for non-critical actions.
`,
    },
    {
      label: "Scalability",
      detailMD: `
The system must independently scale upload ingest, transcode workers, metadata reads, CDN egress, social writes, view-event ingestion, search indexing, and recommendation ranking. These workloads have different bottlenecks and should not share one database or queue.
`,
    },
    {
      label: "Durability",
      detailMD: `
Raw uploads, encoded renditions, manifests, thumbnails, subtitles, and metadata are business-critical assets. Store media in durable blob storage with checksums, replication or erasure coding, object versioning for critical outputs, and recoverable processing state.
`,
    },
    {
      label: "Eventual consistency",
      detailMD: `
It is acceptable for view counts, search results, recommendation features, and creator analytics to lag by seconds or minutes. It is not acceptable to publish a video as playable before the manifest and required renditions are durable and readable from origin.
`,
    },
    {
      label: "Cost efficiency",
      detailMD: `
Video delivery is dominated by storage and egress cost. The design should maximize CDN hit ratio, avoid repeated origin fetches, use lifecycle policies for rarely viewed formats, batch expensive counters, and choose a practical rendition ladder instead of encoding every possible profile.
`,
    },
  ],
  capacityEstimation: {
    assumptionsMD: `
Assume 500 hours of video uploaded per minute. That is 720,000 uploaded hours per day. If the average video is 12 minutes, the platform receives about 2,500 new videos per minute, or about 3.6M new videos per day.

Assume an average raw upload size of 4 GB per hour after client-side compression. Raw ingest is therefore about 2.9 PB per day. After transcoding, store an ABR ladder with several video resolutions, audio tracks, thumbnails, captions, manifests, and safety copies; budget about 12 GB of encoded media per uploaded hour, or about 8.6 PB of new encoded media per day before replication overhead.

Assume 5B video starts per day, an average watch duration of 12 minutes, 4-second media segments, and an average delivered bitrate of 3 Mbps across mobile, web, and TV. That means about 60B watch minutes per day, 900B segment requests per day, and roughly 1.35 EB of video egress per day served primarily by CDN edges.
`,
    metrics: [
      {
        label: "Upload volume",
        value: "500 hours per minute",
        note: "720,000 hours uploaded per day",
      },
      {
        label: "New video records",
        value: "3.6M per day",
        note: "500 hours per minute divided by a 12 minute average video length",
      },
      {
        label: "Raw upload storage",
        value: "2.9 PB per day",
        note: "720,000 hours times 4 GB per hour",
      },
      {
        label: "Encoded media growth",
        value: "8.6 PB per day",
        note: "720,000 hours times 12 GB per hour for ABR renditions and media outputs",
      },
      {
        label: "Durable storage growth",
        value: "12 to 15 PB per day",
        note: "Encoded media plus raw retention, thumbnails, manifests, metadata, and erasure-coding overhead",
      },
      {
        label: "Average video starts",
        value: "58,000 starts per second",
        note: "5B starts divided by 86,400 seconds",
      },
      {
        label: "Peak video starts",
        value: "580,000 starts per second",
        note: "10x average peak for regional and event-driven spikes",
      },
      {
        label: "Segment requests",
        value: "10M per second average",
        note: "900B daily HLS or DASH segment requests divided by 86,400 seconds",
      },
      {
        label: "Playback egress",
        value: "125 Tbps average global egress",
        note: "1.35 EB per day at 3 Mbps average delivered bitrate, with most traffic served from CDN",
      },
      {
        label: "View-event ingestion",
        value: "700,000 events per second average",
        note: "One watch heartbeat per active watch minute plus start and completion events",
      },
      {
        label: "Search and feed reads",
        value: "100,000 to 300,000 requests per second peak",
        note: "Home, search, related videos, and channel pages are read-heavy and cacheable by viewer cohort",
      },
    ],
    calculationsMD: `
- Upload hours: 500 hours per minute times 60 minutes times 24 hours is 720,000 uploaded hours per day.
- New videos: 500 hours per minute is 30,000 uploaded minutes per minute. Dividing by a 12 minute average video length gives about 2,500 videos per minute, or 3.6M videos per day.
- Raw ingest: 720,000 hours per day times 4 GB per hour is 2.88 PB per day. Dividing by 86,400 seconds gives about 33 GB per second of average raw upload traffic before peak multipliers.
- Encoded output: 720,000 hours per day times 12 GB per hour is 8.64 PB per day for ABR renditions, audio, manifests, and thumbnails. With raw retention and storage overhead, plan for 12 to 15 PB of durable daily growth.
- Playback starts: 5B video starts per day divided by 86,400 seconds is about 57,870 starts per second. A 10x peak gives roughly 580,000 starts per second.
- Segment requests: 5B starts times 12 minutes times 60 seconds divided by 4-second segments is about 900B segment requests per day, or about 10.4M requests per second average.
- Watch time: 5B starts times 12 minutes is 60B watch minutes, or 1B watch hours per day.
- Egress: 3 Mbps for 1B watch hours is about 1.35 EB per day. Spread across a day, that is about 125 Tbps average global delivery, with peak multiples handled by CDN capacity and regional edge caches.
- View events: one heartbeat per watch minute yields 60B heartbeat events per day. Dividing by 86,400 seconds gives about 694,000 events per second before start, pause, seek, and completion events.
`,
  },
  apiDesign: {
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/uploads",
        descriptionMD: `
Creates a resumable upload session and reserves a video id. The response contains the chunk size, upload id, object prefix, and expiration time so the client can retry chunks without restarting the upload.
`,
        request: `
{
  "channelId": "channel_123",
  "filename": "launch-demo.mp4",
  "contentType": "video/mp4",
  "expectedBytes": 2147483648,
  "title": "Launch demo",
  "visibility": "private"
}
`,
        response: `
{
  "uploadId": "upl_789",
  "videoId": "vid_456",
  "chunkSizeBytes": 8388608,
  "uploadUrl": "https://uploads.example.com/upl_789",
  "expiresAt": "2026-07-26T14:00:00Z"
}
`,
        statusCodes: [
          { code: 201, meaning: "Upload session created" },
          { code: 400, meaning: "Invalid metadata or file type" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Caller cannot upload to this channel" },
          { code: 429, meaning: "Creator or IP upload quota exceeded" },
        ],
      },
      {
        method: "PUT",
        path: "/api/v1/uploads/{uploadId}/chunks/{partNumber}",
        descriptionMD: `
Uploads one chunk for a resumable session. The operation is idempotent when the same part number, byte range, checksum, and upload id are repeated.
`,
        request: `
Content-Range: bytes 0-8388607/2147483648
Content-MD5: 6f5902ac237024bdd0c176cb93063dc4

binary video bytes
`,
        response: `
{
  "uploadId": "upl_789",
  "partNumber": 1,
  "receivedBytes": 8388608,
  "state": "part_received"
}
`,
        statusCodes: [
          { code: 200, meaning: "Chunk accepted or already present" },
          { code: 400, meaning: "Invalid range or checksum" },
          { code: 404, meaning: "Upload session not found" },
          { code: 409, meaning: "Part conflicts with a previously uploaded checksum" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/uploads/{uploadId}/complete",
        descriptionMD: `
Finalizes the upload after all parts are present. The upload service commits the raw object, records media metadata, and enqueues transcode and thumbnail jobs.
`,
        response: `
{
  "uploadId": "upl_789",
  "videoId": "vid_456",
  "processingState": "queued",
  "estimatedReadySeconds": 600
}
`,
        statusCodes: [
          { code: 202, meaning: "Upload finalized and processing queued" },
          { code: 400, meaning: "Missing parts or invalid final checksum" },
          { code: 404, meaning: "Upload session not found" },
          { code: 409, meaning: "Upload already finalized or cancelled" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/videos/{videoId}/playback",
        descriptionMD: `
Returns watch-page metadata and signed or public playback manifest URLs. The client uses the manifest to request ABR segments from the CDN.
`,
        response: `
{
  "videoId": "vid_456",
  "title": "Launch demo",
  "channelId": "channel_123",
  "durationSeconds": 720,
  "manifestType": "HLS",
  "manifestUrl": "https://cdn.example.com/v/vid_456/master.m3u8",
  "thumbnailUrl": "https://cdn.example.com/v/vid_456/thumb_720.jpg",
  "viewCountEstimate": 12803492
}
`,
        statusCodes: [
          { code: 200, meaning: "Playback metadata returned" },
          { code: 403, meaning: "Video is private or region-blocked" },
          { code: 404, meaning: "Video not found" },
          { code: 409, meaning: "Video is still processing" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/videos/{videoId}/engagement",
        descriptionMD: `
Records lightweight engagement actions such as view start, watch heartbeat, like, unlike, and comment creation. The API validates the action and publishes events so counters and recommendation features update asynchronously.
`,
        request: `
{
  "viewerId": "user_987",
  "action": "comment",
  "watchSessionId": "watch_abc",
  "positionSeconds": 215,
  "text": "Great explanation of the launch flow"
}
`,
        response: `
{
  "accepted": true,
  "eventId": "evt_555",
  "visibleAfterMs": 500
}
`,
        statusCodes: [
          { code: 202, meaning: "Engagement accepted" },
          { code: 400, meaning: "Invalid action or comment body" },
          { code: 401, meaning: "Authentication required for this action" },
          { code: 403, meaning: "Viewer cannot interact with this video" },
          { code: 429, meaning: "Rate limit exceeded" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/search",
        descriptionMD: `
Searches indexed video metadata using query text, filters, ranking signals, and viewer context. The search system returns video cards, not playback segments.
`,
        request: `
q=distributed+systems&limit=20&safeSearch=strict&region=US
`,
        response: `
{
  "query": "distributed systems",
  "results": [
    {
      "videoId": "vid_456",
      "title": "Launch demo",
      "channelTitle": "Systems Channel",
      "thumbnailUrl": "https://cdn.example.com/v/vid_456/thumb_360.jpg",
      "viewCountEstimate": 12803492
    }
  ],
  "nextPageToken": "page_2"
}
`,
        statusCodes: [
          { code: 200, meaning: "Search results returned" },
          { code: 400, meaning: "Invalid query or filter" },
          { code: 429, meaning: "Search quota exceeded" },
        ],
      },
    ],
    notesMD: `
The API should not upload media through the same path that serves playback metadata. Large chunks go to upload infrastructure and blob storage, while ordinary JSON APIs go through the gateway. Playback segment URLs should point to CDN-hosted manifests and media chunks, not to the metadata service.

The engagement endpoint is intentionally asynchronous. A view, like, or comment can be accepted quickly, then deduplicated, moderated, counted, indexed, and propagated to recommendation features by background consumers.
`,
  },
  databaseDesign: {
    schemaMD: `
Separate media bytes from metadata. Blob storage owns raw uploads, encoded renditions, thumbnails, captions, and manifests. Databases own video records, upload state, channels, playlists, comments, likes, and aggregate counters.

The metadata service needs strong enough consistency to prevent invalid publish states. A video should not become public until required renditions and manifests are committed. View counts, like counts, comment counts, search indexing, and recommendation features can be eventually consistent.
`,
    tables: [
      {
        name: "videos",
        columns: [
          { name: "video_id", type: "uuid", note: "Primary key and stable public identifier" },
          { name: "channel_id", type: "uuid", note: "Owning channel" },
          { name: "title", type: "varchar(200)", note: "Searchable title" },
          { name: "description", type: "text", note: "Searchable description and links after policy filtering" },
          { name: "visibility", type: "varchar(20)", note: "Private, unlisted, public, scheduled, or blocked" },
          { name: "processing_state", type: "varchar(32)", note: "Uploading, queued, transcoding, ready, failed, or blocked" },
          { name: "duration_seconds", type: "int", note: "Filled after media probing" },
          { name: "manifest_uri", type: "text nullable", note: "HLS or DASH manifest path once playable" },
          { name: "thumbnail_uri", type: "text nullable", note: "Default generated or creator-selected thumbnail" },
          { name: "view_count_estimate", type: "bigint", note: "Eventually consistent public count" },
          { name: "created_at", type: "timestamp", note: "Upload creation time" },
          { name: "published_at", type: "timestamp nullable", note: "Public availability time" },
        ],
      },
      {
        name: "media_assets",
        columns: [
          { name: "asset_id", type: "uuid", note: "Primary key for raw file, rendition, audio, thumbnail, or caption asset" },
          { name: "video_id", type: "uuid", note: "Associated video" },
          { name: "asset_type", type: "varchar(32)", note: "Raw, rendition, audio, manifest, thumbnail, caption" },
          { name: "profile", type: "varchar(64)", note: "For example 1080p, 720p, 480p, audio-only, or sprite" },
          { name: "object_uri", type: "text", note: "Blob storage object location" },
          { name: "bytes", type: "bigint", note: "Object size for capacity and billing" },
          { name: "checksum", type: "varchar(128)", note: "Integrity validation" },
          { name: "state", type: "varchar(32)", note: "Pending, ready, failed, or expired" },
          { name: "created_at", type: "timestamp", note: "Asset creation time" },
        ],
      },
      {
        name: "upload_sessions",
        columns: [
          { name: "upload_id", type: "uuid", note: "Primary key for resumable upload" },
          { name: "video_id", type: "uuid", note: "Reserved video id" },
          { name: "owner_user_id", type: "uuid", note: "Creator account" },
          { name: "object_prefix", type: "text", note: "Blob storage prefix for parts" },
          { name: "expected_bytes", type: "bigint", note: "Client-declared size" },
          { name: "received_parts", type: "json", note: "Part bitmap or ranges for resume" },
          { name: "state", type: "varchar(32)", note: "Open, completing, complete, cancelled, or expired" },
          { name: "expires_at", type: "timestamp", note: "Cleanup deadline for abandoned sessions" },
        ],
      },
      {
        name: "channels_playlists",
        columns: [
          { name: "entity_id", type: "uuid", note: "Channel id or playlist id" },
          { name: "entity_type", type: "varchar(20)", note: "Channel or playlist" },
          { name: "owner_user_id", type: "uuid", note: "Owner account" },
          { name: "title", type: "varchar(200)", note: "Display name" },
          { name: "description", type: "text", note: "About text or playlist description" },
          { name: "visibility", type: "varchar(20)", note: "Public, private, or unlisted" },
          { name: "video_ids", type: "json", note: "Ordered playlist entries for smaller playlists or pointer to a separate item table" },
          { name: "updated_at", type: "timestamp", note: "Used for cache invalidation and indexing" },
        ],
      },
      {
        name: "comments_reactions",
        columns: [
          { name: "event_id", type: "uuid", note: "Idempotency key for comment or reaction event" },
          { name: "video_id", type: "uuid", note: "Partition key at scale" },
          { name: "user_id", type: "uuid", note: "Actor" },
          { name: "parent_comment_id", type: "uuid nullable", note: "Null for top-level comments" },
          { name: "event_type", type: "varchar(32)", note: "Comment, like, unlike, dislike, delete, or moderation action" },
          { name: "body", type: "text nullable", note: "Comment text after validation" },
          { name: "status", type: "varchar(32)", note: "Visible, held, deleted, spam, or blocked" },
          { name: "created_at", type: "timestamp", note: "Ordering and moderation time" },
        ],
      },
    ],
    indexesMD: `
- **videos.video_id** is the primary lookup for watch pages and management.
- **videos.channel_id, published_at** supports channel pages and creator dashboards.
- **videos.visibility, published_at** helps scheduled publishing and public browsing jobs.
- **media_assets.video_id, asset_type, profile** finds manifests, renditions, thumbnails, and captions for a video.
- **upload_sessions.upload_id** supports chunk resume and idempotent finalization.
- **comments_reactions.video_id, created_at** supports comment pagination and recent activity.
- Search uses a separate inverted index over title, description, tags, channel name, language, safety labels, and engagement-derived ranking features.
`,
    relationshipsMD: `
Each video belongs to one channel and has many media assets. Playlists reference many videos in ordered lists. Comments and reactions reference a video and optionally a parent comment. Public counters on the videos row are derived summaries, not the source of truth for raw view events.
`,
    noSqlAlternativesMD: `
A production system usually mixes stores. Use a strongly consistent relational or distributed SQL store for video publish state, channel ownership, and playlist metadata. Use blob storage for media. Use Cassandra, Bigtable, DynamoDB, or sharded MySQL for comments and reactions partitioned by video id. Use Kafka, Pub/Sub, or Kinesis for watch events, then aggregate into Bigtable, Druid, Pinot, ClickHouse, or another analytics store. Use Elasticsearch, OpenSearch, Solr, or a custom search stack for metadata retrieval.
`,
  },
  architecture: {
    width: 960,
    height: 560,
    nodes: [
      { id: "client", label: "Web, Mobile, TV Clients", kind: "client", x: 70, y: 260, sublabel: "Upload and playback" },
      { id: "cdn", label: "Global CDN", kind: "cdn", x: 220, y: 120, sublabel: "HLS, DASH, thumbnails" },
      { id: "api-gateway", label: "API Gateway", kind: "gateway", x: 220, y: 320, sublabel: "Auth, quota, routing" },
      { id: "upload-service", label: "Upload Service", kind: "service", x: 410, y: 420, sublabel: "Resumable sessions" },
      { id: "metadata-service", label: "Metadata Service", kind: "service", x: 410, y: 260, sublabel: "Videos, channels, playlists" },
      { id: "engagement-service", label: "Engagement Service", kind: "service", x: 410, y: 100, sublabel: "Views, likes, comments" },
      { id: "blob-storage", label: "Blob and Origin Storage", kind: "storage", x: 630, y: 420, sublabel: "Raw and encoded media" },
      { id: "transcode-queue", label: "Transcode Queue", kind: "queue", x: 630, y: 300, sublabel: "Jobs, retries, priorities" },
      { id: "encoder-farm", label: "Encoding Worker Farm", kind: "worker", x: 820, y: 300, sublabel: "ABR and thumbnails" },
      { id: "metadata-db", label: "Metadata and Social DB", kind: "database", x: 630, y: 160, sublabel: "Video graph" },
      { id: "search-index", label: "Search Index", kind: "search", x: 820, y: 120, sublabel: "Video metadata" },
      { id: "analytics-recs", label: "Analytics and Recommendations", kind: "analytics", x: 820, y: 470, sublabel: "Views, feed ranking" },
    ],
    edges: [
      { from: "client", to: "cdn", label: "manifest and segments" },
      { from: "cdn", to: "blob-storage", label: "origin fill" },
      { from: "client", to: "api-gateway", label: "metadata and upload APIs" },
      { from: "api-gateway", to: "upload-service", label: "upload sessions" },
      { from: "api-gateway", to: "metadata-service", label: "watch, channel, playlist" },
      { from: "api-gateway", to: "engagement-service", label: "views, likes, comments" },
      { from: "api-gateway", to: "search-index", label: "search queries" },
      { from: "api-gateway", to: "analytics-recs", label: "home feed" },
      { from: "upload-service", to: "blob-storage", label: "chunked raw upload" },
      { from: "upload-service", to: "transcode-queue", label: "enqueue complete upload", dashed: true },
      { from: "transcode-queue", to: "encoder-farm", label: "dispatch jobs", dashed: true },
      { from: "encoder-farm", to: "blob-storage", label: "write renditions" },
      { from: "encoder-farm", to: "metadata-service", label: "publish manifests", dashed: true },
      { from: "metadata-service", to: "metadata-db", label: "metadata reads and writes" },
      { from: "metadata-service", to: "search-index", label: "index updates", dashed: true },
      { from: "engagement-service", to: "metadata-db", label: "comments and reactions" },
      { from: "engagement-service", to: "analytics-recs", label: "view events and counters", dashed: true },
    ],
    captionMD: `
Playback is client to CDN to cached HLS or DASH segments, with origin storage used only on edge misses. Upload and processing are separate: clients upload chunks to the upload service and blob storage, then a queue drives asynchronous encoding workers that produce ABR renditions, thumbnails, and manifests.
`,
  },
  architectureNotesMD: `
The architecture has two critical planes. The media plane handles large bytes: resumable upload sessions, blob storage, transcoding, manifest generation, CDN origin fill, and edge playback. The control plane handles small but high-QPS data: video metadata, channels, playlists, comments, likes, view events, search queries, and recommendation feeds.

The upload service should never synchronously transcode a creator request. It creates a durable session, accepts chunks, verifies checksums, commits the raw object, and writes a job to the transcode queue. Encoding workers probe the file, generate thumbnails, choose an ABR ladder, produce HLS and DASH outputs, write renditions to blob storage, and then update the metadata service when the video is playable.

The playback path is read-heavy and fanout-heavy. Watch pages call metadata, search, recommendation, and engagement APIs, but the actual bytes come from CDN edges. The metadata service can be cached aggressively for public videos, while engagement and recommendation updates are eventually consistent.
`,
  requestFlow: [
    {
      title: "Creator creates an upload session",
      detailMD: `
The client calls **POST /api/v1/uploads** with channel id, file metadata, expected size, title, and initial visibility. The upload service authenticates the creator, checks quota and policy, reserves a video id, creates an upload session, and returns a chunk size plus upload URL.
`,
    },
    {
      title: "Client uploads chunks to blob storage through ingest",
      detailMD: `
The client sends numbered chunks with byte ranges and checksums. The upload service records received ranges and writes parts to blob storage under an object prefix. Retrying the same part is safe because the service compares upload id, part number, range, and checksum.
`,
    },
    {
      title: "Upload is finalized and transcode job is queued",
      detailMD: `
After all parts are present, the client finalizes the session. The upload service composes or commits the raw object, verifies the final checksum, marks the video as queued, and publishes a transcode job containing video id, raw object URI, creator priority, and target profiles.
`,
    },
    {
      title: "Encoding workers generate ABR renditions",
      detailMD: `
Workers pull jobs from the queue, probe duration and codecs, select a rendition ladder such as 240p, 360p, 480p, 720p, 1080p, and 4K when the source supports it, then encode segmented outputs for HLS and DASH. Failed profiles can be retried without restarting the whole video.
`,
    },
    {
      title: "Thumbnails, manifests, and metadata are published",
      detailMD: `
The encoding pipeline extracts representative frames, generates thumbnails and preview sprites, writes manifests and media segments to blob storage, and updates the metadata service with duration, available profiles, thumbnail URIs, and playable state. The video can become public only after required outputs are durable.
`,
    },
    {
      title: "Viewer opens a watch page",
      detailMD: `
The client requests playback metadata for a video id. The API gateway routes to the metadata service, which checks visibility, regional restrictions, policy state, and processing state. The response includes title, channel, thumbnail, approximate view count, and a CDN manifest URL.
`,
    },
    {
      title: "Client streams through CDN edge caches",
      detailMD: `
The player downloads the HLS or DASH manifest from the CDN, chooses a bitrate based on device and network conditions, and requests small media segments. CDN edge hits return bytes directly. Edge misses fetch segments from origin blob storage and cache them for later viewers.
`,
    },
    {
      title: "Engagement events are accepted asynchronously",
      detailMD: `
The player emits view start, heartbeat, seek, pause, completion, like, and comment events. The engagement service validates them, applies rate limits and moderation checks, persists comments or reactions when needed, and publishes view events to the analytics pipeline.
`,
    },
    {
      title: "Search and recommendations refresh in the background",
      detailMD: `
Metadata changes update the search index asynchronously. Watch, like, comment, subscription, and freshness signals feed recommendation jobs. Ranked feeds and related-video lists are cached by viewer cohort or generated online with a fast candidate service and ranking model.
`,
    },
  ],
  coreComponents: [
    {
      name: "Upload Service",
      kind: "service",
      role: "Manages resumable creator uploads and raw object commit.",
      detailMD: `
This stateless service owns upload sessions, validates creator authorization, accepts idempotent chunks, tracks received ranges, verifies checksums, expires abandoned sessions, and finalizes raw objects. It should use short-lived upload tokens and keep large byte transfers away from ordinary metadata APIs.
`,
    },
    {
      name: "Blob and Origin Storage",
      kind: "storage",
      role: "Durable home for raw uploads, renditions, manifests, thumbnails, and captions.",
      detailMD: `
Blob storage stores immutable media objects addressed by video id, asset type, profile, and version. It should support high-throughput multipart writes, range reads, checksums, lifecycle policies, replication or erasure coding, and efficient origin fetches by CDN nodes.
`,
    },
    {
      name: "Transcode Queue",
      kind: "queue",
      role: "Decouples upload completion from media processing.",
      detailMD: `
The queue stores jobs for probing, encoding, thumbnail generation, caption processing, manifest publication, and retries. Priorities can favor live incidents, paid creators, or short videos, while dead-letter queues capture corrupt files and repeated encoder failures.
`,
    },
    {
      name: "Encoding Worker Farm",
      kind: "worker",
      role: "Produces ABR renditions and media derivatives.",
      detailMD: `
Workers run media probes and codecs, split content into segments, generate HLS and DASH manifests, create thumbnails and preview sprites, and write outputs to blob storage. They need autoscaling, GPU or CPU scheduling, job idempotency, and per-profile retry logic.
`,
    },
    {
      name: "Metadata Service",
      kind: "service",
      role: "Serves video, channel, playlist, and publish-state metadata.",
      detailMD: `
The metadata service is the source of truth for video status, visibility, title, description, channel ownership, playlists, available renditions, thumbnail selection, and watch-page metadata. It must guard publish transitions so users do not receive broken manifests.
`,
    },
    {
      name: "Global CDN",
      kind: "cdn",
      role: "Serves playback bytes near viewers.",
      detailMD: `
The CDN caches manifests, media segments, thumbnails, captions, and preview images. It absorbs the read-heavy fanout of playback, reduces origin bandwidth, supports regional traffic spikes, and provides cache invalidation or versioned URLs when assets are replaced.
`,
    },
    {
      name: "Engagement Service",
      kind: "service",
      role: "Accepts views, likes, comments, replies, and moderation updates.",
      detailMD: `
This service validates social actions, stores comments and reactions, rate-limits spam, emits view events, and updates eventually consistent counters. Comments and likes need user-level idempotency; view events need session-level deduplication and batching.
`,
    },
    {
      name: "Search and Recommendation Systems",
      kind: "search",
      role: "Help viewers find and discover videos.",
      detailMD: `
Search indexes video metadata and ranking features for query-time retrieval. Recommendation systems use subscriptions, watch history, freshness, embeddings, similar videos, co-watch patterns, and engagement quality to produce home feed and next-up candidates.
`,
    },
  ],
  deepDives: [
    {
      topic: "Chunked and resumable upload path",
      detailMD: `
Large video uploads fail often because browsers close, phones move networks, and files can be several GB. The upload API should create a session before any media bytes are accepted. The session stores video id, owner, expected size, chunk size, object prefix, received ranges, checksums, state, and expiration. The client uploads chunks independently and can ask which ranges are missing after a reconnect.

Idempotency is central. A repeated chunk with the same part number, byte range, and checksum should return success. A repeated part with different bytes should return a conflict. The upload service should avoid keeping entire files on local disk; it streams chunks to blob storage and keeps only session state in a database or strongly consistent cache. Abandoned sessions are cleaned by a sweeper that deletes partial objects after expiration.

Finalization is a state transition, not a best-effort flag. The service verifies all ranges, commits the object, records the raw asset, and enqueues the transcode job exactly once using an idempotency key such as upload id. If the enqueue step fails after the raw object is committed, a reconciliation job scans complete uploads with no processing job and repairs them.
`,
    },
    {
      topic: "Asynchronous transcode pipeline and ABR packaging",
      detailMD: `
The encoding pipeline is a durable workflow. After upload completion, a job enters a queue. Workers probe the raw file for duration, resolution, codecs, audio tracks, corruption, and safety metadata. The system then chooses a rendition ladder. A common ladder includes 240p, 360p, 480p, 720p, 1080p, and higher profiles only when the source and policy allow it. Generating every possible profile wastes compute and storage.

Each rendition is segmented for adaptive streaming. HLS and DASH manifests describe available bitrates and segment URLs. The player starts with a conservative bitrate and switches up or down as bandwidth changes. This is why the platform stores many small segment objects rather than one monolithic video file for playback.

Workers should be idempotent by output path and profile. A failed 1080p encode should not invalidate a successful 360p encode. The publish decision can require a minimum playable set, such as audio plus 360p and 720p, while higher profiles continue processing. Thumbnails, preview sprites, content fingerprints, captions, and moderation scans can run as separate jobs in the same workflow.
`,
    },
    {
      topic: "CDN distribution and edge caching",
      detailMD: `
Playback creates enormous fanout. One viral video can generate millions of segment requests per second across regions. The CDN should cache manifests, segments, thumbnails, captions, and preview sprites close to viewers. Versioned object names are better than overwriting media objects because edge caches can serve immutable assets safely.

The first viewer in a region may cause an origin fill from blob storage. Later viewers should hit the edge. Cache keys should include video id, asset version, profile, segment number, and authorization class if the video is private or rented. Public segments can use long TTLs. Private or region-restricted media can use signed URLs or signed cookies with short validity.

Origin protection matters. If a popular video is newly published, many edges may miss at once. Use request coalescing, origin shields, pre-warming for predicted hot videos, and tiered caching. The metadata service should not sit in the media-byte path; it issues or returns manifest URLs, while the CDN and blob origin serve the bytes.
`,
    },
    {
      topic: "View-count aggregation at massive scale",
      detailMD: `
Updating a videos row for every view is a classic bottleneck. With 5B starts per day and heartbeat events near 700,000 per second average, exact synchronous counters would create hot rows for popular videos and couple playback to analytics storage. Instead, the player emits view events and watch heartbeats to the engagement pipeline.

The pipeline deduplicates by viewer id or anonymous device id, video id, watch session id, IP bucket, and time window. Product rules define what counts as a view, for example minimum watch time and not obvious replay spam. Consumers batch increments by video id and time bucket, then update sharded counters or approximate sketches. Public counts can lag by seconds or minutes and may be rounded for very large numbers.

For massive videos, use counter shards such as video id plus shard number to spread writes. Periodic jobs merge shards into hourly and daily aggregates. Unique viewers and anti-spam checks can use approximate structures such as HyperLogLog and Bloom filters, plus abuse models. The watch page reads the latest materialized estimate rather than scanning raw events.
`,
    },
    {
      topic: "Metadata, comments, likes, search, and recommendations",
      detailMD: `
The metadata service owns videos, channels, playlists, visibility, processing state, and creator edits. This data changes far less frequently than playback segment reads but must be correct. Watch pages can cache public metadata by video id, while creator dashboards may require fresher reads and authorization checks.

Comments and likes are social workloads with different access patterns. Likes need per-user idempotency so one user cannot like a video repeatedly. Comments need pagination, moderation state, spam detection, replies, ranking, and deletion. Store comment timelines partitioned by video id and time or by comment id ranges for extremely hot videos. Keep comment writes out of the playback byte path.

Search consumes metadata updates, captions, channel authority, freshness, and engagement signals. Recommendation systems consume watch history, subscriptions, likes, comments, skips, dwell time, freshness, and embeddings. Search favors query relevance and precision; recommendations favor personalized ranking, diversity, freshness, and long-term satisfaction. Both can be eventually consistent and should degrade independently from playback.
`,
    },
    {
      topic: "Read-heavy fanout of playback",
      detailMD: `
A watch page is not one request. It may call metadata, player configuration, ads, comments, recommendations, captions, view logging, and then many segment URLs. The system should keep the critical path small: return enough metadata and a manifest quickly, let the CDN serve media bytes, and load comments or recommendations asynchronously if needed.

Fanout control is essential on home pages and related-video panels. Instead of calculating everything online, precompute candidate sets, cache ranked feeds for short windows, and use lightweight online re-ranking. For anonymous or cold-start users, use geography, language, trending videos, freshness, and device class. For logged-in users, blend subscriptions, watch history, topic embeddings, and exploration.

When non-critical services fail, playback should still work. If recommendations are unavailable, return trending or subscription fallbacks. If comments are unavailable, hide or delay comments. If view logging is delayed, buffer and retry. The viewer should not experience a playback failure because a social or analytics dependency is unhealthy.
`,
    },
  ],
  scaling: [
    {
      stage: "Prototype: single region and basic processing",
      detailMD: `
Start with a web API, relational metadata database, blob storage, a small worker pool, and CDN in front of media objects. Support resumable uploads, a small rendition ladder, generated thumbnails, basic metadata, simple comments, and a search index updated from metadata changes.
`,
    },
    {
      stage: "Growth: independent media and metadata planes",
      detailMD: `
Split upload ingest, metadata APIs, engagement APIs, transcode workers, search indexing, and recommendation jobs. Add queues, worker autoscaling, Redis or memory caches for public metadata, CDN origin shields, and asynchronous counters for views and likes.
`,
    },
    {
      stage: "Large scale: sharded data and regional CDN strategy",
      detailMD: `
Shard comments, reactions, counters, and watch events by video id and time. Move media assets to multi-region blob storage with erasure coding. Use CDN tiered caching, pre-warm predicted popular videos, and partition transcode queues by priority, media type, and region.
`,
    },
    {
      stage: "Global scale: billions of daily watches",
      detailMD: `
Deploy metadata and engagement services in multiple regions, keep reads local where possible, and replicate publish-state changes with clear ownership. Store watch events in regional streams, aggregate locally, then merge globally. Run search and recommendation serving close to users with feature freshness targets.
`,
    },
    {
      stage: "Extreme scale: cost and quality optimization",
      detailMD: `
Optimize codec choice, rendition ladders, cache hit ratio, cold-media storage tiers, and encoder scheduling. Use ML-driven prefetching, anomaly detection for view spam, personalized feed ranking, and separate isolation for premium live events or high-value creators.
`,
    },
  ],
  bottlenecks: [
    {
      issue: "Encoding worker backlog",
      optimizationMD: `
A surge in uploads can create hours of processing delay. Partition queues by priority and media type, autoscale workers, retry per rendition, publish a minimum playable set early, and expose processing status to creators. Capacity planning should track minutes of video waiting, not only job count.
`,
    },
    {
      issue: "Origin storage overload from CDN misses",
      optimizationMD: `
Use tiered caching, origin shields, request coalescing, long TTLs for immutable versioned segments, pre-warming for expected hot videos, and regional replication of popular assets. Keep media-byte serving independent from metadata services.
`,
    },
    {
      issue: "Hot video counters and comment timelines",
      optimizationMD: `
Shard counters by video id and counter shard, batch increments, and merge asynchronously. For comments, separate write ingestion from ranked display, paginate efficiently, and use moderation queues and spam controls for viral videos.
`,
    },
    {
      issue: "Search and recommendation feature freshness",
      optimizationMD: `
Use change streams from metadata, incremental indexing, near-real-time feature aggregation, and fallback indexes. Recommendation serving should tolerate stale features and fall back to cached candidates when online feature stores are degraded.
`,
    },
    {
      issue: "Storage and egress cost explosion",
      optimizationMD: `
Tune the rendition ladder, use efficient codecs where supported, expire unused intermediate files, move cold raw uploads to cheaper tiers, and maximize CDN hit ratio. Measure cost per watch hour by region, device class, codec, and content age.
`,
    },
    {
      issue: "Watch-page dependency fanout",
      optimizationMD: `
Parallelize non-dependent calls, cache public metadata, use timeouts and fallbacks for comments and recommendations, and keep manifest retrieval independent. The first frame should not wait for comments, ads, or every feed module.
`,
    },
  ],
  failureHandling: [
    {
      scenario: "Upload interrupted or client retries chunks",
      strategyMD: `
Keep upload sessions durable and range-aware. Let clients query missing parts, retry idempotently, and resume until expiration. A cleanup worker removes abandoned partial objects, while completed raw objects are reconciled against queued processing jobs.
`,
    },
    {
      scenario: "Transcode worker or codec failure",
      strategyMD: `
Retry failed profiles with bounded attempts, isolate bad input files, and move repeated failures to a dead-letter queue. Publish partial playable renditions only if product policy allows it and mark the video with clear processing status for creators.
`,
    },
    {
      scenario: "CDN regional outage",
      strategyMD: `
Route viewers to alternate CDN providers or nearby regions using DNS, anycast, or player fallback URLs. Keep origin capacity protected with shields and rate limits so failover does not stampede blob storage.
`,
    },
    {
      scenario: "Metadata database degradation",
      strategyMD: `
Serve cached public watch metadata when safe, freeze risky publish-state transitions, and continue CDN playback for already issued manifests. Creator edits, playlist changes, and comments can degrade before public playback fails.
`,
    },
    {
      scenario: "Engagement pipeline lag",
      strategyMD: `
Accept events into durable regional queues, show stale view counts with freshness markers, and protect playback from analytics backpressure. If queues are full, sample low-priority heartbeats before dropping view starts or paid reporting signals.
`,
    },
    {
      scenario: "Bad manifest or corrupted rendition published",
      strategyMD: `
Version media outputs, run validation probes before marking a video playable, and support fast rollback to the previous asset version. Synthetic players should continuously test manifests and segments across device profiles.
`,
    },
  ],
  security: [
    {
      label: "Upload authentication and quotas",
      detailMD: `
Only authenticated creators can upload to channels they control. Enforce per-user, per-channel, and per-IP quotas for sessions, bytes, and processing minutes. Use short-lived upload tokens and validate content type and size before accepting large uploads.
`,
    },
    {
      label: "Malware, copyright, and policy scanning",
      detailMD: `
Uploaded media should pass malware scanning, perceptual hashing, copyright fingerprint checks, nudity or violence classifiers, and policy review before or shortly after publication. Risky videos can remain private, limited, demonetized, or blocked by region.
`,
    },
    {
      label: "Playback authorization",
      detailMD: `
Public videos can use cacheable URLs, but private, unlisted with restrictions, paid, age-gated, or region-blocked videos need authorization checks and signed manifest or segment URLs. Do not rely on obscurity of object paths for access control.
`,
    },
    {
      label: "Spam and abuse controls",
      detailMD: `
Comments, likes, subscriptions, and views are abuse targets. Apply rate limits, reputation scoring, duplicate detection, bot detection, moderation queues, and shadow blocking. View-count rules should filter obvious replay loops and automated traffic.
`,
    },
    {
      label: "Privacy and data retention",
      detailMD: `
Watch history and recommendation features are sensitive. Minimize raw IP retention, separate analytics identifiers from public data, honor deletion requests, and enforce access controls around creator analytics and internal investigation tools.
`,
    },
    {
      label: "Object storage protection",
      detailMD: `
Use private buckets, scoped service identities, object-level checksums, encryption at rest, TLS in transit, and write-once or versioned paths for published assets. CDN origin access should be restricted so clients cannot bypass policy.
`,
    },
  ],
  tradeoffs: {
    pros: [
      "Separating upload, processing, metadata, engagement, and playback lets each workload scale independently.",
      "CDN-first playback keeps user latency low and protects origin storage from global fanout.",
      "Asynchronous encoding and counters absorb bursty uploads and engagement without blocking users.",
      "ABR renditions improve playback quality across devices and network conditions.",
      "Eventual consistency for search, recommendations, and counters reduces write amplification on hot videos.",
    ],
    cons: [
      "The asynchronous pipeline adds operational complexity, retries, reconciliation, and partial failure states.",
      "Storing multiple renditions per video multiplies storage and encoding cost.",
      "View counts and analytics are not exact in real time and require abuse-aware deduplication.",
      "CDN invalidation and signed playback URLs are complex for private or region-restricted videos.",
      "Recommendations and comments introduce moderation, privacy, and abuse problems beyond media delivery.",
    ],
    alternativesMD: `
Alternative one is a simpler file-hosting design where uploaded videos are stored as one object and streamed directly from origin. It is easier to build but fails on global latency, adaptive quality, origin load, and cost.

Alternative two is a synchronous processing design where the upload request waits for transcoding. This gives immediate success or failure but is unacceptable for long videos because requests time out, retries duplicate work, and creators wait too long.

Alternative three is an edge-heavy design that pushes popular manifests and metadata to CDN workers. This improves latency for public videos but complicates authorization, comments, freshness, and debugging. It is best as an optimization after the core system is correct.
`,
    whenNotToUseMD: `
Do not use a full YouTube-style architecture for a small internal training portal or a product with a few thousand videos. A managed video platform, object storage, CDN, and a simple metadata database are enough until upload volume, playback egress, personalization, or moderation needs justify custom media processing infrastructure.
`,
  },
  followUpQuestions: [
    {
      question: "Why not transcode synchronously during upload completion?",
      answerMD: `
Transcoding can take minutes or hours depending on video length, codec, and output profiles. Keeping it asynchronous avoids request timeouts, lets workers retry individual renditions, supports queue priorities, and allows creators to see processing status while the system scales compute independently.
`,
    },
    {
      question: "When is a video considered playable?",
      answerMD: `
After the raw upload is durable, required safety checks pass or policy allows provisional publication, a minimum rendition set is encoded, manifests are valid, thumbnails are available, and metadata points to readable origin objects. Higher quality renditions can continue processing after initial publication.
`,
    },
    {
      question: "How do you prevent a viral video from overloading the database?",
      answerMD: `
Playback bytes come from CDN, not the database. Public metadata is cached by video id. View events are written to queues and batched counters, not synchronously to the videos row. Comments and likes are partitioned and rate-limited separately.
`,
    },
    {
      question: "How should view counts be deduplicated?",
      answerMD: `
Use watch session id, viewer or anonymous device id, video id, time bucket, IP bucket, user agent, and minimum watch duration. The pipeline can use approximate sketches and abuse models to filter obvious replays and bots, then update materialized counters asynchronously.
`,
    },
    {
      question: "How does adaptive bitrate streaming help?",
      answerMD: `
The server stores multiple renditions and manifests. The player chooses segments at a bitrate that matches current bandwidth and device capability, switching up or down during playback. This reduces buffering and avoids sending 4K bytes to clients that cannot use them.
`,
    },
    {
      question: "How do search and recommendations differ?",
      answerMD: `
Search starts from an explicit query and optimizes relevance, freshness, safety, and authority for matching metadata and captions. Recommendations start from viewer and content context, then optimize candidate generation, personalized ranking, diversity, freshness, and satisfaction signals.
`,
    },
    {
      question: "How would you handle private videos with CDN caching?",
      answerMD: `
Keep authorization in metadata APIs and issue short-lived signed manifest or segment URLs. Cache keys must include the authorization class or use private-cache behavior. Public and private media should not share unrestricted object URLs.
`,
    },
  ],
  companyVariations: [
    {
      company: "Google",
      angleMD: `
Google interviewers will push on global scale, CDN efficiency, tail latency, abuse detection, search quality, recommendation ranking, and consistency boundaries. Be ready to quantify upload volume, segment request fanout, view-counter sharding, and the media processing workflow.
`,
    },
    {
      company: "Netflix",
      angleMD: `
Netflix-style discussion often emphasizes encoding ladders, playback quality, device diversity, CDN strategy, observability, and resilient streaming. Explain ABR manifests, startup latency, rebuffering, origin shielding, and how to validate media quality across profiles.
`,
    },
    {
      company: "Amazon",
      angleMD: `
Amazon may frame this around S3-like blob storage, DynamoDB-style metadata access, queue-driven workers, cost controls, multi-AZ durability, and operational alarms. Discuss idempotent uploads, lifecycle policies, queue backlogs, and isolating playback from analytics failures.
`,
    },
  ],
  relatedQuestions: [
    {
      slug: "netflix",
      note: "Shares ABR streaming, CDN delivery, playback quality, and media encoding concerns.",
    },
    {
      slug: "tiktok",
      note: "Shares video upload, feed ranking, engagement signals, and creator metadata, but with shorter-form feed dynamics.",
    },
    {
      slug: "distributed-cache",
      note: "Public video metadata, manifests, thumbnails, and feed fragments rely heavily on cache strategy.",
    },
    {
      slug: "google-search",
      note: "Video metadata search needs indexing, ranking, freshness, and safe retrieval.",
    },
    {
      slug: "key-value-store",
      note: "Comments, reactions, counters, sessions, and media metadata can use partitioned key-value access patterns.",
    },
  ],
  interviewTips: {
    commonMistakes: [
      "Treating upload, transcode, and playback as one synchronous request path.",
      "Serving video bytes through the metadata service instead of CDN and blob origin.",
      "Updating view_count synchronously on every watch event.",
      "Forgetting chunked uploads, retries, checksums, and abandoned session cleanup.",
      "Ignoring comments, likes, search, recommendations, and moderation as separate workloads.",
      "Publishing a video before manifests and required renditions are durable and validated.",
    ],
    redFlags: [
      "No concrete capacity math for upload hours, storage growth, segment requests, or egress.",
      "No ABR rendition ladder or explanation of HLS and DASH packaging.",
      "No CDN cache strategy or origin protection for viral videos.",
      "No deduplication or batching strategy for views and likes.",
      "One database schema trying to serve media bytes, comments, search, and analytics.",
      "No failure model for transcode backlog, corrupted assets, or CDN regional outages.",
    ],
    expectations: [
      "Start by separating media bytes, metadata, and engagement events.",
      "Draw both the upload pipeline and the playback path.",
      "Use real numbers for 500 hours uploaded per minute, billions of watches, storage, and egress.",
      "Explain resumable uploads, transcode queues, worker farms, thumbnails, ABR manifests, and CDN delivery.",
      "Make view counts approximate, batched, deduplicated, and eventually consistent.",
      "Cover search, recommendation feeds, comments, likes, and graceful degradation.",
    ],
    communicationMD: `
Lead with the two-plane mental model: media plane for bytes and control plane for metadata and social data. Then walk through upload to transcode to publish, followed by watch-page metadata to CDN playback. Use capacity math to justify CDN, queues, blob storage, sharded counters, and eventual consistency. When time is short, prioritize playback reliability, media processing correctness, and view-counter scalability.
`,
  },
  revisionNotesMD: `
- YouTube is dominated by media delivery: 500 uploaded hours per minute, 720,000 uploaded hours per day, 5B daily starts, and about 900B four-second segment requests per day.
- Keep upload and playback separate. Uploads use resumable sessions, chunk checksums, blob storage, and durable finalization.
- Transcoding is asynchronous. A queue feeds encoding workers that produce ABR renditions, HLS and DASH manifests, thumbnails, captions, and validation results.
- Playback should be CDN-first. The metadata service returns watch data and manifest URLs; the CDN serves manifests, segments, thumbnails, captions, and preview assets.
- Store video bytes in blob storage, video metadata in a metadata database, comments and reactions in social stores, search data in an inverted index, and watch events in analytics streams.
- View counts are approximate and eventually consistent. Batch increments, shard counters, deduplicate watch sessions, and use abuse detection.
- Comments and likes need user-level idempotency, moderation, spam control, and separate scaling from playback bytes.
- Search indexes title, description, tags, captions, channel data, safety labels, freshness, and ranking features.
- Recommendations use watch history, subscriptions, co-watch patterns, embeddings, freshness, diversity, and engagement quality.
- Graceful degradation matters: playback should continue when comments, recommendations, search indexing, or analytics are delayed.
`,
  flashcards: [
    {
      front: "Why does YouTube need resumable uploads?",
      back: "Videos are large and networks fail. Resumable sessions let clients retry missing chunks without restarting and let the server verify checksums and cleanup abandoned uploads.",
    },
    {
      front: "What happens after upload finalization?",
      back: "The raw object is committed, metadata is marked queued, and a transcode job is published for workers to generate renditions, thumbnails, and manifests.",
    },
    {
      front: "What is ABR streaming?",
      back: "Adaptive bitrate streaming stores multiple renditions and lets the player switch segment quality based on bandwidth, device, and buffer health.",
    },
    {
      front: "Why should playback bytes come from CDN?",
      back: "CDN edges reduce startup latency, absorb global segment request fanout, and protect origin blob storage from viral traffic.",
    },
    {
      front: "Why are view counts eventually consistent?",
      back: "Exact synchronous updates would create hot rows and high latency. Events are deduplicated, batched, sharded, and merged into public estimates.",
    },
    {
      front: "What data does the metadata service own?",
      back: "Video records, channel ownership, playlist metadata, visibility, processing state, available renditions, thumbnails, and watch-page metadata.",
    },
    {
      front: "How are comments different from view events?",
      back: "Comments are user-visible records needing moderation and pagination. View events are high-volume analytics signals that are deduplicated and aggregated.",
    },
    {
      front: "What is origin shielding?",
      back: "A CDN tier consolidates edge misses so many edge caches do not stampede blob origin for the same segment.",
    },
    {
      front: "What should happen if recommendations fail?",
      back: "Playback should still work. The product can show cached, trending, or subscription fallback videos while recommendation systems recover.",
    },
  ],
  quiz: [
    {
      question: "Which path should serve most video segment bytes?",
      options: ["Metadata database to client", "CDN edge cache to client", "Transcode queue to client", "Search index to client"],
      answerIndex: 1,
      explanationMD: `
Segments should be served from CDN edge caches whenever possible. This minimizes latency and prevents origin or metadata services from carrying playback byte traffic.
`,
    },
    {
      question: "Why is transcoding modeled as an asynchronous pipeline?",
      options: ["It makes videos searchable before upload", "It avoids long request blocking and lets workers retry renditions independently", "It removes the need for blob storage", "It makes view counts exact"],
      answerIndex: 1,
      explanationMD: `
Encoding can be slow and failure-prone. A queue and worker farm allow retries, prioritization, autoscaling, and partial progress without blocking the upload completion request.
`,
    },
    {
      question: "Given 500 uploaded hours per minute, how many hours are uploaded per day?",
      options: ["12,000 hours", "72,000 hours", "720,000 hours", "7.2M hours"],
      answerIndex: 2,
      explanationMD: `
500 hours per minute times 60 minutes times 24 hours is 720,000 uploaded hours per day.
`,
    },
    {
      question: "What is the safest way to update public view counts at billions of watches per day?",
      options: ["Increment the videos row synchronously on every segment request", "Batch and deduplicate view events into sharded counters", "Let the CDN edit the metadata database", "Count only comments"],
      answerIndex: 1,
      explanationMD: `
View events should be deduplicated by watch session and viewer signals, batched by video and time bucket, spread across counter shards, and merged asynchronously.
`,
    },
    {
      question: "What must be true before a video is marked playable?",
      options: ["At least one comment exists", "Required renditions and manifests are durable and validated", "The search index has fully refreshed", "The recommendation model has retrained"],
      answerIndex: 1,
      explanationMD: `
The metadata service should publish a playable state only after required media outputs are durable, readable, and validated. Search and recommendations can lag.
`,
    },
    {
      question: "Which feature belongs in the recommendation system rather than the media-byte path?",
      options: ["Choosing ranked home feed candidates", "Serving a 4-second video segment", "Committing an uploaded chunk", "Writing an encoded 720p rendition"],
      answerIndex: 0,
      explanationMD: `
Recommendations rank candidate videos using viewer and content signals. Media segments are served by CDN, chunks by upload infrastructure, and renditions by encoding workers.
`,
    },
  ],
  cheatSheetMD: `
**Goal**: design a global video platform for upload, processing, discovery, social engagement, and CDN-backed playback.

**Scale**: 500 uploaded hours per minute, 720,000 uploaded hours per day, about 3.6M new videos per day at 12 minutes average, 5B daily starts, 900B daily segment requests, and about 125 Tbps average global playback egress.

**Upload path**: create session, upload chunks with checksums, track received ranges, commit raw object, enqueue transcode job, reconcile complete uploads with missing jobs.

**Processing path**: probe media, choose ABR ladder, encode HLS and DASH renditions, create thumbnails and preview sprites, validate outputs, publish manifest URIs and playable state.

**Playback path**: client gets watch metadata and manifest URL, then CDN serves manifests, segments, captions, and thumbnails. Origin blob storage is used on CDN misses, protected by shields and coalescing.

**Metadata**: videos, channels, playlists, media assets, upload sessions, comments, likes, and visibility belong in databases and caches, not in the media-byte path.

**Views**: emit events, deduplicate sessions, batch increments, shard hot counters, use approximate sketches for uniques, and publish eventually consistent public counts.

**Search and recommendations**: search indexes metadata and captions for query relevance. Recommendations use watch history, subscriptions, engagement, embeddings, freshness, diversity, and cached candidate sets.

**Reliability**: playback degrades last. Comments, recommendations, search freshness, and analytics can be stale while CDN playback continues.

**Security**: authenticate uploads, sign restricted playback URLs, scan media, moderate comments, detect spam views, protect object storage, and enforce privacy retention.
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
      title: "HTTP Live Streaming",
      kind: "Docs",
      url: "https://developer.apple.com/streaming/",
      author: "Apple Developer",
    },
    {
      title: "Dynamic Adaptive Streaming over HTTP",
      kind: "Docs",
      url: "https://dashif.org/",
      author: "DASH Industry Forum",
    },
    {
      title: "The Tail at Scale",
      kind: "Paper",
      url: "https://research.google/pubs/the-tail-at-scale/",
      author: "Jeffrey Dean and Luiz Andre Barroso",
    },
  ],
};
