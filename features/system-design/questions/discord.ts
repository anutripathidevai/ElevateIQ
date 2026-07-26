import type { SDQuestionContent } from "../types";

export const discordContent: SDQuestionContent = {
  slug: "discord",
  statementMD: `
Design Discord, a real-time communication platform where users join guilds, create text and voice channels, send messages, receive presence updates, and participate in low-latency voice or video sessions. The system must support small private servers as well as very large public communities with millions of members.

At interview scale, the hard parts are not basic chat CRUD. The hard parts are maintaining millions of persistent WebSocket gateway connections, routing text messages through pub-sub fanout, avoiding impossible fanout for very large guilds, storing message history at massive write volume, tracking read and unread state, and keeping voice latency low through a separate media plane.

The default design should separate the control plane for guilds, channels, permissions, and session routing from the data planes for text delivery, presence, and voice media. Text messages can tolerate small delivery delays and eventual consistency in some metadata; voice needs tight packet latency, region selection, and failure isolation from the chat stack.
`,
  businessUseCaseMD: `
Discord lets communities coordinate around persistent spaces instead of temporary group calls. Gaming groups, creators, education cohorts, companies, open-source projects, and fan communities all need a blend of durable channel history, real-time chat, presence, notifications, and low-latency voice.

The business value comes from being always-on. Users expect messages to appear immediately, unread state to be accurate enough across devices, and voice channels to feel live. A degraded gateway, noisy presence system, or overloaded media server directly damages engagement and retention.
`,
  functionalRequirements: [
    "Create and manage guilds, channels, roles, permissions, and memberships.",
    "Send, edit, delete, and fetch text messages in guild channels and direct messages.",
    "Deliver new messages to online channel subscribers through a WebSocket gateway.",
    "Track read and unread state per user and channel across devices.",
    "Maintain user presence such as online, idle, do not disturb, and offline with coarse activity signals.",
    "Support voice and video channel join, leave, mute, speaking state, and media relay.",
    "Support push notifications for offline users without duplicating online gateway delivery.",
    "Handle very large guilds without broadcasting every message or presence change to every member.",
  ],
  nonFunctionalRequirements: [
    {
      label: "Text latency",
      detailMD: `
Message send acknowledgement should usually complete under 200ms p99 inside a region after durable persistence. Gateway delivery to online subscribers should target under 500ms p99 for normal guilds, with graceful degradation for very large fanout.
`,
    },
    {
      label: "Voice latency",
      detailMD: `
Voice is more sensitive than text. The media path should target under 150ms mouth-to-ear latency for most participants, use UDP where possible, keep jitter low, and move users to a closer voice region when needed.
`,
    },
    {
      label: "Availability",
      detailMD: `
Users should still read and send text messages when presence, search, analytics, or push notifications are degraded. Voice media failures should be isolated to affected media regions or rooms instead of cascading into the gateway or message store.
`,
    },
    {
      label: "Scalability",
      detailMD: `
The design must scale to millions of concurrent WebSocket sessions, billions of messages per day, and millions of concurrent voice participants. Gateway shards, pub-sub partitions, and media regions must scale independently.
`,
    },
    {
      label: "Durability",
      detailMD: `
Accepted text messages must not be lost. Persist the message before acknowledging success, replicate across availability zones, and make downstream fanout idempotent so retries do not create duplicate user-visible messages.
`,
    },
    {
      label: "Consistency",
      detailMD: `
Message order must be stable within a channel. Cross-channel ordering is not required. Presence and unread counts may be eventually consistent, but the latest read marker and channel history should converge quickly across the user's devices.
`,
    },
    {
      label: "Fanout control",
      detailMD: `
Large guilds create an extreme fanout problem. The system should deliver only to users who are online, subscribed to a channel, or actively viewing a guild section, and should aggregate or suppress high-volume presence updates.
`,
    },
  ],
  capacityEstimation: {
    assumptionsMD: `
Assume 200M monthly active users, 50M daily active users, 10M peak concurrent WebSocket connections, 3M peak concurrent voice participants, 20M guilds, and 4B text messages per day. Average text message storage record is 1 KB after metadata, indexes, and small attachment references, but not including large file blobs.

Assume a peak multiplier of 10x over average message writes. Average online fanout per message is 20 recipients for normal channels, but very large guilds may have millions of members and only a much smaller active channel subscriber set. Voice uses an SFU where each participant sends one upstream audio stream and receives selected downstream streams.
`,
    metrics: [
      {
        label: "Peak gateway connections",
        value: "10M concurrent sockets",
        note: "Requires many gateway shards and connection draining during deploys",
      },
      {
        label: "Text messages",
        value: "4B per day",
        note: "Average about 46,300 message writes per second",
      },
      {
        label: "Peak text writes",
        value: "463,000 writes per second",
        note: "10x average peak across all regions",
      },
      {
        label: "Average gateway deliveries",
        value: "926,000 events per second",
        note: "46,300 messages per second times 20 online recipients on average",
      },
      {
        label: "Peak gateway deliveries",
        value: "9.3M events per second",
        note: "Peak writes times 20 average online recipients",
      },
      {
        label: "Raw message storage",
        value: "4 TB per day",
        note: "4B messages times 1 KB before replication and compaction overhead",
      },
      {
        label: "Replicated message storage",
        value: "12 to 20 TB per day",
        note: "3x replication plus indexes, tombstones, and compaction headroom",
      },
      {
        label: "Peak voice participants",
        value: "3M concurrent users",
        note: "Distributed across voice regions and SFU clusters",
      },
      {
        label: "Voice ingress",
        value: "150 Gbps",
        note: "3M participants times about 50 Kbps upstream including packet overhead",
      },
      {
        label: "Presence changes",
        value: "16,700 updates per second average",
        note: "10M online users changing presence 6 times per hour",
      },
    ],
    calculationsMD: `
- Message writes: 4B messages per day divided by 86,400 seconds is about 46,300 writes per second on average.
- Peak writes: using a 10x multiplier gives about 463,000 message writes per second.
- Gateway fanout: if each message reaches 20 online recipients on average, average delivery traffic is about 926,000 gateway events per second and peak is about 9.3M events per second.
- Storage: 4B messages times 1 KB is about 4 TB raw per day. With 3 replicas plus compaction and index overhead, plan for 12 to 20 TB per day.
- Hot storage: 30 days of replicated message history is about 360 to 600 TB. Older messages can move to colder storage tiers while remaining queryable.
- Voice ingress: 3M participants times roughly 50 Kbps upstream is about 150 Gbps entering media servers. SFU egress is higher because each listener receives selected streams from active speakers.
- Presence: 10M concurrent users times 6 presence transitions per hour is 60M transitions per hour, or about 16,700 per second before fanout. Naive fanout to every guild member would be unbounded, so presence must be subscription-based, batched, and suppressed for very large guilds.
`,
  },
  apiDesign: {
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/guilds/{guildId}/channels/{channelId}/messages",
        descriptionMD: `
Sends a text message to a channel. The service validates membership and channel permissions, assigns a time-ordered message id, persists the message, and then publishes a fanout event for gateway delivery.
`,
        request: `
{
  "clientNonce": "nonce_9f4a",
  "content": "Anyone ready for raid night?",
  "attachmentIds": ["att_123"],
  "replyToMessageId": "1199000000000000000"
}
`,
        response: `
{
  "messageId": "1200000000123456789",
  "channelId": "chan_123",
  "guildId": "guild_456",
  "authorId": "user_789",
  "createdAt": "2026-07-26T07:10:48Z",
  "status": "persisted"
}
`,
        statusCodes: [
          { code: 201, meaning: "Message accepted and persisted" },
          { code: 400, meaning: "Invalid content, nonce, or attachment reference" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Caller lacks permission in the channel" },
          { code: 429, meaning: "Rate limit exceeded" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/channels/{channelId}/messages",
        descriptionMD: `
Fetches message history for a channel using cursor pagination. The cursor is usually a Snowflake-style message id so reads can move backward or forward through time without offset scans.
`,
        request: `
before=1200000000123456789&limit=50
`,
        response: `
{
  "channelId": "chan_123",
  "messages": [
    {
      "messageId": "1199999999999999999",
      "authorId": "user_101",
      "content": "Queue starts in five minutes",
      "createdAt": "2026-07-26T07:09:10Z"
    }
  ],
  "hasMore": true
}
`,
        statusCodes: [
          { code: 200, meaning: "Messages returned" },
          { code: 403, meaning: "Caller cannot read the channel" },
          { code: 404, meaning: "Channel not found" },
          { code: 429, meaning: "Rate limit exceeded" },
        ],
      },
      {
        method: "PATCH",
        path: "/api/v1/channels/{channelId}/read-state",
        descriptionMD: `
Updates the user's read marker for a channel. The server stores the highest message id read and uses it to compute unread badges, mention counts, and cross-device synchronization.
`,
        request: `
{
  "lastReadMessageId": "1200000000123456789"
}
`,
        response: `
{
  "channelId": "chan_123",
  "lastReadMessageId": "1200000000123456789",
  "updatedAt": "2026-07-26T07:11:03Z"
}
`,
        statusCodes: [
          { code: 200, meaning: "Read state updated" },
          { code: 400, meaning: "Invalid message id" },
          { code: 403, meaning: "Caller cannot access the channel" },
          { code: 409, meaning: "Read marker moved backward without override" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/gateway",
        descriptionMD: `
Returns a gateway URL and recommended shard information. Clients then open a WebSocket connection, identify, resume previous sessions when possible, and receive guild, channel, message, and presence events.
`,
        response: `
{
  "gatewayUrl": "wss://gateway.discord.example",
  "recommendedShardCount": 4096,
  "heartbeatIntervalMs": 45000,
  "resumeSupported": true
}
`,
        statusCodes: [
          { code: 200, meaning: "Gateway routing details returned" },
          { code: 401, meaning: "Authentication required" },
          { code: 503, meaning: "Gateway admission temporarily limited" },
        ],
      },
      {
        method: "PATCH",
        path: "/api/v1/users/@me/presence",
        descriptionMD: `
Updates the caller's presence state. The presence service stores the current state in an ephemeral store and publishes batched deltas only to subscribers who should see them.
`,
        request: `
{
  "status": "online",
  "activity": "Playing Space Raiders",
  "since": "2026-07-26T07:10:00Z"
}
`,
        response: `
{
  "userId": "user_789",
  "status": "online",
  "version": 184467
}
`,
        statusCodes: [
          { code: 200, meaning: "Presence updated" },
          { code: 400, meaning: "Invalid presence payload" },
          { code: 401, meaning: "Authentication required" },
          { code: 429, meaning: "Presence update rate limited" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/guilds/{guildId}/voice/{channelId}/join",
        descriptionMD: `
Allocates a user to a voice session and returns media connection details. The control plane chooses a voice region and SFU based on guild preference, participant geography, server load, and health.
`,
        request: `
{
  "clientRegionHint": "us-east",
  "supportsVideo": true,
  "preferredTransport": "udp"
}
`,
        response: `
{
  "voiceSessionId": "voice_abc",
  "mediaServer": "voice-us-east-17.discord.example",
  "transport": "webrtc",
  "sfuToken": "token_redacted",
  "iceServers": ["stun:stun.discord.example"]
}
`,
        statusCodes: [
          { code: 200, meaning: "Voice session allocated" },
          { code: 403, meaning: "Caller cannot join the voice channel" },
          { code: 404, meaning: "Voice channel not found" },
          { code: 503, meaning: "No healthy media capacity in selected region" },
        ],
      },
    ],
    notesMD: `
HTTP APIs manage durable state and control-plane decisions. Real-time delivery happens through the WebSocket gateway, and media packets flow through voice servers instead of the HTTP stack. Keep gateway events versioned and idempotent because clients reconnect, resume, and may receive retries.
`,
  },
  databaseDesign: {
    schemaMD: `
Discord-like systems use different stores for different workloads. Guilds, channels, roles, and permissions are metadata that can begin in a relational store or a strongly consistent distributed SQL store. Message history is a high-volume append and range-read workload, so a Cassandra or ScyllaDB style wide-column store partitioned by channel and time bucket is a natural fit.

Messages should carry Snowflake-style ids that encode time and provide stable ordering within a channel. Presence should not be stored in the durable message database; it belongs in an ephemeral cache with TTLs and versioned updates.
`,
    tables: [
      {
        name: "guilds",
        columns: [
          { name: "guild_id", type: "bigint", note: "Primary key generated by Snowflake-style id service" },
          { name: "owner_user_id", type: "bigint", note: "Guild owner" },
          { name: "name", type: "varchar(120)", note: "Display name" },
          { name: "preferred_voice_region", type: "varchar(64)", note: "Optional region override" },
          { name: "member_count", type: "bigint", note: "Eventually consistent count for product display" },
          { name: "created_at", type: "timestamp", note: "Creation time" },
          { name: "status", type: "varchar(32)", note: "Active, locked, deleted, or quarantined" },
        ],
      },
      {
        name: "channels",
        columns: [
          { name: "channel_id", type: "bigint", note: "Primary key" },
          { name: "guild_id", type: "bigint", note: "Parent guild" },
          { name: "channel_type", type: "varchar(32)", note: "Text, voice, announcement, forum, or direct message" },
          { name: "name", type: "varchar(120)", note: "Channel display name" },
          { name: "permission_overrides", type: "json", note: "Role and user-specific overrides" },
          { name: "created_at", type: "timestamp", note: "Creation time" },
          { name: "status", type: "varchar(32)", note: "Active, archived, or deleted" },
        ],
      },
      {
        name: "guild_memberships",
        columns: [
          { name: "guild_id", type: "bigint", note: "Partition key for member listing" },
          { name: "user_id", type: "bigint", note: "Member user id" },
          { name: "role_ids", type: "array", note: "Roles used for permission evaluation" },
          { name: "joined_at", type: "timestamp", note: "Join time" },
          { name: "nickname", type: "varchar(120) nullable", note: "Guild-specific nickname" },
          { name: "membership_state", type: "varchar(32)", note: "Active, pending, banned, or left" },
        ],
      },
      {
        name: "messages_by_channel_bucket",
        columns: [
          { name: "channel_id", type: "bigint", note: "Partition key part one" },
          { name: "bucket_start", type: "date", note: "Partition key part two, such as daily or hourly bucket" },
          { name: "message_id", type: "bigint", note: "Clustering key ordered by Snowflake timestamp" },
          { name: "author_id", type: "bigint", note: "Message author" },
          { name: "content", type: "text", note: "Normalized message body" },
          { name: "attachment_refs", type: "array", note: "Pointers to blob storage objects" },
          { name: "created_at", type: "timestamp", note: "Derived from message id but stored for convenience" },
          { name: "edit_version", type: "int", note: "Increments on edits" },
          { name: "delete_state", type: "varchar(32)", note: "Visible, soft_deleted, or hard_deleted" },
        ],
      },
      {
        name: "read_state_by_user_channel",
        columns: [
          { name: "user_id", type: "bigint", note: "Partition key part one" },
          { name: "channel_id", type: "bigint", note: "Partition key part two or clustering key depending on store" },
          { name: "last_read_message_id", type: "bigint", note: "Highest message observed by the user" },
          { name: "mention_count", type: "int", note: "Eventually consistent unread mention count" },
          { name: "updated_at", type: "timestamp", note: "Last update time" },
        ],
      },
    ],
    indexesMD: `
- **guilds.guild_id** and **channels.channel_id** are primary keys for metadata lookups.
- **guild_memberships.guild_id, user_id** supports permission checks and member listing. A reverse index by **user_id, guild_id** supports listing a user's guilds at login.
- **messages_by_channel_bucket.channel_id, bucket_start, message_id** supports channel history range reads without scanning across all messages.
- **read_state_by_user_channel.user_id, channel_id** supports cross-device unread synchronization.
- Avoid secondary indexes on message content in the serving store. Search should use a separate indexing pipeline.
`,
    relationshipsMD: `
A guild owns many channels and memberships. A channel owns many message buckets. A user's read state references the latest message id they have read in each channel. Attachment blobs, search indexes, analytics, and audit logs are derived or side stores and should not be required for the message send hot path.
`,
    noSqlAlternativesMD: `
Cassandra or ScyllaDB fits message history because writes are append-heavy and reads are usually bounded ranges within a channel. Use time buckets to prevent a single popular channel partition from growing without bound. Store recent messages on fast nodes and use retention or tiering for cold history.

Redis or a similar in-memory store fits presence because presence is ephemeral and naturally TTL-based. Kafka, Pulsar, or a managed pub-sub service fits gateway fanout because message delivery should be asynchronous and retryable after persistence.
`,
  },
  architecture: {
    width: 980,
    height: 600,
    nodes: [
      { id: "client", label: "Client Apps", kind: "client", x: 70, y: 250, sublabel: "Desktop, web, mobile" },
      { id: "edge-lb", label: "Edge Load Balancer", kind: "loadBalancer", x: 230, y: 250, sublabel: "TLS, routing, health" },
      { id: "http-api", label: "HTTP API", kind: "service", x: 400, y: 110, sublabel: "Guilds, channels, reads" },
      { id: "gateway-service", label: "WebSocket Gateway", kind: "gateway", x: 400, y: 300, sublabel: "Session shards" },
      { id: "guild-service", label: "Guild Service", kind: "service", x: 585, y: 80, sublabel: "Roles, permissions" },
      { id: "message-service", label: "Message Service", kind: "service", x: 585, y: 210, sublabel: "Validate, persist" },
      { id: "presence-service", label: "Presence Service", kind: "service", x: 585, y: 390, sublabel: "Subscriptions, batching" },
      { id: "fanout-bus", label: "Fanout Bus", kind: "queue", x: 760, y: 255, sublabel: "Kafka, Pulsar" },
      { id: "message-store", label: "Message Store", kind: "database", x: 760, y: 95, sublabel: "Cassandra, ScyllaDB" },
      { id: "presence-cache", label: "Presence Cache", kind: "cache", x: 760, y: 430, sublabel: "Redis with TTL" },
      { id: "media-control", label: "Voice Control", kind: "service", x: 585, y: 520, sublabel: "Region selection" },
      { id: "voice-sfu", label: "Voice SFU Cluster", kind: "external", x: 875, y: 520, sublabel: "UDP, WebRTC media" },
    ],
    edges: [
      { from: "client", to: "edge-lb", label: "HTTPS and WSS" },
      { from: "edge-lb", to: "http-api", label: "REST calls" },
      { from: "edge-lb", to: "gateway-service", label: "WebSocket" },
      { from: "http-api", to: "guild-service", label: "metadata and permissions" },
      { from: "http-api", to: "message-service", label: "send and history" },
      { from: "message-service", to: "guild-service", label: "permission check" },
      { from: "message-service", to: "message-store", label: "persist message" },
      { from: "message-service", to: "fanout-bus", label: "message event", dashed: true },
      { from: "fanout-bus", to: "gateway-service", label: "deliver to shards", dashed: true },
      { from: "gateway-service", to: "presence-service", label: "session state" },
      { from: "presence-service", to: "presence-cache", label: "read and write TTL state" },
      { from: "presence-service", to: "fanout-bus", label: "batched presence", dashed: true },
      { from: "http-api", to: "media-control", label: "join voice" },
      { from: "media-control", to: "voice-sfu", label: "allocate room" },
      { from: "client", to: "voice-sfu", label: "UDP or WebRTC media" },
      { from: "voice-sfu", to: "media-control", label: "health and speaking state", dashed: true },
    ],
    captionMD: `
The architecture separates durable control and message storage from real-time delivery and media. Text messages are persisted first, then asynchronously fanned out to gateway shards; voice media bypasses the gateway and flows directly between clients and SFU clusters.
`,
  },
  architectureNotesMD: `
The HTTP API handles management operations, history reads, read-state updates, and voice join requests. It delegates permission decisions to the guild service and sends text writes to the message service. The message service assigns an ordered id, persists to the message store, and publishes a fanout event. Gateway services hold long-lived WebSocket sessions and translate fanout events into client payloads.

Presence is intentionally separated. The presence service observes gateway session changes, stores current state in a TTL cache, and publishes only batched deltas to interested sessions. This prevents a single status change from becoming a broadcast to every shared guild member.

Voice and video use a separate media plane. The voice control service chooses a region and SFU, issues short-lived credentials, and monitors room health. Media servers forward selected streams over UDP or WebRTC and should continue operating even if text chat or presence has a partial outage.
`,
  requestFlow: [
    {
      title: "Client connects to gateway",
      detailMD: `
The client calls the gateway discovery endpoint, opens a WebSocket to the assigned gateway shard, identifies with an auth token, and starts heartbeats. If it reconnects, it attempts session resume using the last acknowledged sequence number.
`,
    },
    {
      title: "Initial guild and subscription state is loaded",
      detailMD: `
The gateway service loads the user's guild list, channel visibility, and coarse presence subscriptions. For very large guilds, it does not eagerly load every member; it lazily subscribes to channels and member windows the client actually views.
`,
    },
    {
      title: "User sends a message",
      detailMD: `
The client sends a message through the HTTP API or gateway command path. The API authenticates the user, checks channel permissions, validates attachments and content limits, and forwards the write to the message service.
`,
    },
    {
      title: "Message id is assigned and persisted",
      detailMD: `
The message service assigns a Snowflake-style id that preserves time ordering, writes the message to the channel and time bucket in Cassandra or ScyllaDB, and records the client nonce for idempotency.
`,
    },
    {
      title: "Fanout event is published",
      detailMD: `
After persistence, the message service publishes a channel message event to the fanout bus. The event contains the guild id, channel id, message id, author id, permission version, and enough metadata for gateway shards to route it.
`,
    },
    {
      title: "Gateway shards deliver to subscribed sessions",
      detailMD: `
Gateway consumers map the channel event to online sessions currently subscribed to that channel. They skip offline users, suppress delivery for users without permission, and avoid sending every message to every member of a large guild.
`,
    },
    {
      title: "Read state and notifications update",
      detailMD: `
The sender's read marker can move immediately. Other users' unread state is computed from last read message id and mention counters. Offline users receive push notifications through a separate notification pipeline if their preferences allow it.
`,
    },
    {
      title: "Voice join uses a media control path",
      detailMD: `
When the user joins a voice channel, the HTTP API asks voice control to pick a region and SFU. The client receives credentials and connects directly to the media server. Speaking events can flow back to the gateway as lightweight state, but audio packets do not pass through the gateway.
`,
    },
  ],
  coreComponents: [
    {
      name: "WebSocket Gateway",
      kind: "gateway",
      role: "Maintains persistent client sessions and delivers real-time events.",
      detailMD: `
Gateway nodes are sharded by user id or session id. They handle identify, resume, heartbeats, backpressure, event sequencing, and client subscriptions. They should be stateless enough to drain and replace, while session resume data is stored in a fast shared cache or replicated log.
`,
    },
    {
      name: "Message Service",
      kind: "service",
      role: "Owns text message validation, ordering, persistence, and fanout publication.",
      detailMD: `
The service enforces channel permissions, validates payload size, assigns message ids, writes to the message store, and emits events. It must make retries idempotent by client nonce and must not acknowledge a message before durable persistence.
`,
    },
    {
      name: "Fanout Bus",
      kind: "queue",
      role: "Decouples durable message writes from gateway delivery.",
      detailMD: `
Kafka, Pulsar, or a similar log carries message, presence, typing, and lightweight voice state events. Partition by guild id or channel id for locality, but isolate extremely hot channels so one guild cannot starve unrelated traffic.
`,
    },
    {
      name: "Message Store",
      kind: "database",
      role: "Stores channel history for append writes and cursor reads.",
      detailMD: `
Cassandra or ScyllaDB stores messages by channel and time bucket with Snowflake-style ids as clustering keys. This supports efficient recent-history reads and avoids cross-channel transactions.
`,
    },
    {
      name: "Guild Service",
      kind: "service",
      role: "Manages guild metadata, channel structure, roles, and permissions.",
      detailMD: `
This service answers permission checks for message sends, history reads, and voice joins. It should cache role resolution and permission versions because every hot path needs an authorization decision.
`,
    },
    {
      name: "Presence Service",
      kind: "service",
      role: "Tracks online state and publishes subscription-scoped presence deltas.",
      detailMD: `
Presence is ephemeral and high churn. The service stores current state with TTL, coalesces frequent changes, scopes updates to interested clients, and applies special policies for very large guilds where full member presence is too expensive.
`,
    },
    {
      name: "Voice Control Service",
      kind: "service",
      role: "Places users onto healthy media servers and manages voice sessions.",
      detailMD: `
Voice control uses user geography, guild preference, room size, SFU load, packet loss, and health checks to select a region. It issues short-lived media tokens and can move rooms during regional incidents.
`,
    },
    {
      name: "Voice SFU Cluster",
      kind: "external",
      role: "Forwards selected audio and video streams with low latency.",
      detailMD: `
Media servers receive upstream streams and forward selected streams to participants rather than mixing every stream for everyone. UDP and WebRTC are preferred, with TCP fallback only when necessary. SFUs must be isolated from text and presence failures.
`,
    },
  ],
  deepDives: [
    {
      topic: "Gateway sharding and session resume",
      detailMD: `
A Discord-like product has millions of long-lived WebSocket connections. One gateway node cannot hold arbitrary users, so the system shards sessions by user id, guild id affinity, or assigned shard id. Clients receive a gateway URL and shard plan, then identify and heartbeat at a fixed interval.

Session resume is critical because mobile networks and deploys cause frequent disconnects. The gateway attaches monotonically increasing sequence numbers to events and stores a short replay buffer per session or shard. On reconnect, the client presents its session id and last sequence. If the buffer still contains missed events, the gateway resumes; otherwise the client performs a full state sync.

Backpressure must be explicit. If a client cannot consume events, the gateway can drop typing indicators and presence deltas first, then require a resync for less critical state. It should not let one slow client block a shard's event loop.
`,
    },
    {
      topic: "Text fanout and very large guilds",
      detailMD: `
The naive model sends every guild message to every guild member. That fails when a public guild has millions of members. The correct model is channel-scoped and activity-aware. A message event should go to online sessions that have permission to read the channel and are currently subscribed to that guild or channel view.

For normal guilds, fanout-on-write through gateway shards is efficient. For very large guilds or announcement channels, combine fanout-on-write for active viewers with fanout-on-read for inactive members. Users who open the channel later fetch history from the message store rather than receiving every event while away.

Membership and permission checks also need caching. Include a permission version in fanout events, and make gateways refresh or reject delivery if their cached view is stale. Large guilds should use lazy member lists, page-based member search, and aggregate counts rather than full rosters.
`,
    },
    {
      topic: "Presence optimization",
      detailMD: `
Presence looks simple but becomes one of the largest fanout sources. If a user belongs to 100 guilds, and each guild has thousands of members, broadcasting every online or activity change to every shared member is impossible.

The system should store presence as ephemeral state with a TTL and version. Gateway nodes subscribe users only to presence needed for open guilds, visible channel member lists, direct message friends, and active voice channels. For very large guilds, show approximate online counts or presence for a visible member window rather than every member.

Coalescing matters. Batch frequent activity updates, suppress no-op transitions, debounce flapping mobile clients, and prioritize status changes over rich activity changes. Presence should degrade before text or voice when the system is under pressure.
`,
    },
    {
      topic: "Message storage with channel and time buckets",
      detailMD: `
Message history is append-heavy and read by channel ranges. Partitioning only by channel can create huge partitions for active channels. Partitioning by channel and time bucket, such as day or hour, bounds partition size and keeps recent history efficient.

Snowflake-style ids encode time, worker, and sequence. They give globally unique ids and make pagination simple: fetch messages before or after a known id. Within a channel, order by message id. Cross-channel total ordering is unnecessary and would add coordination cost.

Edits and deletes should not rewrite large histories. Store edit version and delete state, append audit events if needed, and allow compaction to clean old tombstones. Attachments should live in blob storage with metadata references in the message row.
`,
    },
    {
      topic: "Read and unread state",
      detailMD: `
Unread count is not a separate counter that must be incremented on every message for every member. That would recreate the large fanout problem in the database. The scalable primitive is a per-user, per-channel last read message id.

When a user opens a channel, the client advances the read marker. Unread can be computed as messages after the marker, often with cached channel high-water marks and mention counters. Mention counts may be maintained asynchronously because exact counts for every inactive user are expensive.

Cross-device behavior should be monotonic. A stale mobile client should not move the read marker backward unless it explicitly requests a reset. Updates should be idempotent and compare message ids before writing.
`,
    },
    {
      topic: "Voice and video media plane",
      detailMD: `
Voice should not use the text gateway as the media transport. Clients join through a control API, receive media credentials, and send audio or video to a regional SFU. The SFU forwards selected streams to listeners, handles packet loss and jitter, and emits lightweight state such as speaking indicators.

Region selection is a product and reliability tradeoff. Pick a region near most participants, respect guild or channel preference, and watch load, packet loss, and round-trip time. If a region degrades, new joins should move elsewhere and existing rooms may be migrated with a brief reconnect.

Audio generally tolerates some packet loss better than high latency. Prefer UDP, use jitter buffers, forward error correction or packet loss concealment where appropriate, and avoid expensive server-side mixing unless the product needs recording or special effects.
`,
    },
  ],
  scaling: [
    {
      stage: "Prototype: one region and small guilds",
      detailMD: `
Start with a relational metadata store, a simple WebSocket gateway fleet, a single message service, Redis for session state, and a durable database table for messages. Voice can use a small regional media cluster. This proves permissions, message ordering, read markers, and basic reconnect behavior.
`,
    },
    {
      stage: "Growth: sharded gateway and asynchronous fanout",
      detailMD: `
Shard gateway connections, introduce a fanout bus, split message persistence from delivery, and move message history to a wide-column store partitioned by channel and bucket. Add push notifications for offline users and cache guild permission evaluations.
`,
    },
    {
      stage: "Large scale: multi-region text and presence",
      detailMD: `
Route clients to nearby gateway regions, replicate guild metadata, keep message writes in a home region or multi-region store, and localize gateway fanout. Presence becomes subscription-scoped with batching, large-guild suppression, and regional aggregation.
`,
    },
    {
      stage: "Voice scale: regional SFU fleets",
      detailMD: `
Deploy SFU clusters in many regions, use voice control to place rooms, and monitor packet loss, jitter, and CPU per room. Isolate media traffic from text traffic at the network, process, and failure-domain levels.
`,
    },
    {
      stage: "Extreme scale: very large guild specialization",
      detailMD: `
Use lazy member loading, active-channel subscriptions, fanout-on-read for inactive members, separate hot-channel partitions, and specialized rate limits. Provide approximate counts and degraded presence rather than attempting full real-time state for every member.
`,
    },
  ],
  bottlenecks: [
    {
      issue: "Gateway shard overload",
      optimizationMD: `
Shard by user or session, enforce admission control, drain connections gradually during deploys, and move noisy guilds or channels to isolated fanout partitions. Track event loop lag, outbound queue length, heartbeat misses, and reconnect storms.
`,
    },
    {
      issue: "Very large guild fanout explosion",
      optimizationMD: `
Deliver only to active channel subscribers and visible member windows. Use fanout-on-read for inactive users, batch events, suppress low-value events, and avoid loading all guild members into every gateway session.
`,
    },
    {
      issue: "Presence update storms",
      optimizationMD: `
Debounce mobile reconnect flaps, coalesce activity changes, use TTL state, publish versioned deltas, and degrade rich activity before status. For very large guilds, send aggregate online counts instead of per-user updates.
`,
    },
    {
      issue: "Hot channel message partitions",
      optimizationMD: `
Partition messages by channel and time bucket, split extreme channels by sub-bucket if needed, cache recent history, and ensure compaction settings handle tombstones from edits and deletes.
`,
    },
    {
      issue: "Unread counter write amplification",
      optimizationMD: `
Avoid per-user counter increments on every message. Store last read message id per user and channel, derive unread from channel high-water marks, and maintain mention counts asynchronously.
`,
    },
    {
      issue: "Voice region saturation",
      optimizationMD: `
Continuously measure SFU CPU, bandwidth, packet loss, and room count. Place new rooms in less loaded regions, cap video quality under pressure, and migrate rooms during regional incidents with client reconnect support.
`,
    },
  ],
  failureHandling: [
    {
      scenario: "Gateway node failure",
      strategyMD: `
Clients detect missed heartbeats and reconnect to another gateway node. Session resume uses the last sequence number if the replay buffer is available; otherwise the client performs a full sync. Load balancers should stop routing new sessions before terminating old nodes.
`,
    },
    {
      scenario: "Fanout bus lag or partition outage",
      strategyMD: `
Message persistence continues if the store is healthy, but gateway delivery may lag. Expose lag metrics, replay from the log when partitions recover, and let clients fetch missed channel history by message id if real-time delivery falls behind.
`,
    },
    {
      scenario: "Message store regional failure",
      strategyMD: `
Fail reads to replicas or another region when possible. If write quorum is unavailable, stop acknowledging new messages rather than pretending they are durable. Keep already connected gateway sessions alive and show degraded send status to clients.
`,
    },
    {
      scenario: "Presence cache outage",
      strategyMD: `
Do not block text messaging or voice. Mark presence freshness as degraded, rebuild state from gateway sessions after cache recovery, and temporarily reduce presence fanout to aggregate counts or unknown status.
`,
    },
    {
      scenario: "Voice SFU failure",
      strategyMD: `
Voice control detects failed media servers through heartbeats and packet metrics, stops placing new rooms there, and instructs affected clients to reconnect to a replacement SFU. Text chat and gateway sessions should remain unaffected.
`,
    },
    {
      scenario: "Reconnect storm after network incident",
      strategyMD: `
Use jittered client reconnect backoff, gateway admission limits, session resume priority, and regional traffic shedding. Serve static guild state from caches and delay non-critical presence refreshes until the storm clears.
`,
    },
  ],
  security: [
    {
      label: "Authentication and authorization",
      detailMD: `
Every gateway identify, message send, history read, and voice join must validate the user and permission version. Cache permission decisions carefully, expire them on role changes, and never rely only on client-side channel visibility.
`,
    },
    {
      label: "Abuse and spam control",
      detailMD: `
Apply per-user, per-guild, per-channel, and per-IP rate limits. Detect spam bursts, mention abuse, invite scams, malicious attachments, and compromised accounts. Moderation actions should propagate quickly to gateway and message services.
`,
    },
    {
      label: "Message privacy",
      detailMD: `
Channel history must be accessible only to authorized members. Logs, analytics, and search indexes should avoid exposing private guild content to operators or unrelated tenants. Deleted content needs clear retention and audit policy.
`,
    },
    {
      label: "Voice media protection",
      detailMD: `
Voice tokens should be short-lived and scoped to a room. Media should use encrypted transports, validate SSRC or stream identity, and protect SFUs from packet floods and unauthorized room joins.
`,
    },
    {
      label: "Gateway abuse resistance",
      detailMD: `
The gateway needs identify rate limits, heartbeat validation, payload size limits, compression bomb protection, and disconnect rules for clients that fall behind or send invalid frames repeatedly.
`,
    },
    {
      label: "Data retention and compliance",
      detailMD: `
Support account deletion, guild deletion, legal holds, moderation audit logs, and retention windows. Separate durable message history from ephemeral presence so privacy-sensitive online state is not stored indefinitely.
`,
    },
  ],
  tradeoffs: {
    pros: [
      "Separating gateway, message storage, presence, and voice lets each plane scale independently.",
      "Persist-before-fanout protects message durability while keeping delivery asynchronous.",
      "Channel and time bucket storage matches the dominant message history access pattern.",
      "Subscription-scoped presence and large-guild lazy loading avoid impossible fanout.",
      "A separate SFU media plane keeps voice latency and failures independent from text chat.",
    ],
    cons: [
      "Asynchronous fanout means online delivery can lag behind persistence during bus or gateway pressure.",
      "Read and unread state becomes eventually consistent and requires careful cross-device semantics.",
      "Large-guild optimizations add product complexity such as approximate counts and lazy member views.",
      "Cassandra or ScyllaDB schema design requires careful bucket sizing, compaction tuning, and tombstone management.",
      "Multi-region voice and gateway placement introduce operational complexity and capacity fragmentation.",
    ],
    alternativesMD: `
Alternative one is a simpler WebSocket chat system with a relational database and Redis pub-sub. It works for small communities but does not handle large guild fanout, high write volume, or durable replay well.

Alternative two is fanout-on-read for all messages, where clients fetch new history instead of receiving gateway pushes. It reduces delivery fanout but makes chat feel less real-time and increases polling or sync costs.

Alternative three is server-side audio mixing instead of SFU forwarding. Mixing simplifies clients and can help recording, but it increases server CPU and can add latency. SFU forwarding is usually better for interactive voice and video rooms.
`,
    whenNotToUseMD: `
Do not use this full architecture for a small team chat or support widget. The cost of gateway sharding, wide-column storage, presence suppression, and SFU operations is only justified when the product needs large communities, persistent history, and high-concurrency voice.
`,
  },
  followUpQuestions: [
    {
      question: "Why not broadcast every message to every guild member?",
      answerMD: `
Large guilds may have millions of members, but only a fraction are online and viewing a channel. Broadcasting to every member wastes gateway bandwidth and creates huge offline unread writes. Deliver to active authorized subscribers, use push for selected offline notifications, and let inactive users fetch history when they open the channel.
`,
    },
    {
      question: "How do you guarantee message ordering?",
      answerMD: `
Guarantee stable ordering within a channel by assigning Snowflake-style message ids and storing messages with message id as the clustering order inside a channel and time bucket. Cross-channel ordering is not required. If two messages arrive concurrently, their ids define display order.
`,
    },
    {
      question: "Why is presence harder than message delivery?",
      answerMD: `
Presence changes are frequent, low-value, and potentially visible to many shared guilds or friends. Naive fanout can exceed message fanout. The system must use TTL state, subscription windows, batching, deduplication, and large-guild suppression.
`,
    },
    {
      question: "What happens when a user reconnects after missing gateway events?",
      answerMD: `
The client tries to resume with its previous session id and last sequence number. If the gateway replay buffer still has the missing events, it replays them. If not, the client performs a full sync by fetching guild state and channel history from durable stores.
`,
    },
    {
      question: "Why use Cassandra or ScyllaDB for messages?",
      answerMD: `
The workload is high-volume append writes and bounded range reads by channel. A wide-column store handles horizontal write scaling and partitioned range queries well when the schema uses channel id plus time bucket and message id ordering.
`,
    },
    {
      question: "How should unread counts be stored?",
      answerMD: `
Store a per-user, per-channel last read message id. Derive unread from the channel high-water mark and message ranges. Mention counts can be maintained asynchronously. Avoid writing an unread row for every member on every message.
`,
    },
    {
      question: "Why should voice use separate media servers?",
      answerMD: `
Voice needs low packet latency, UDP or WebRTC transport, jitter handling, and region selection. Running audio through the text gateway would add latency and couple media failures to chat delivery. SFUs isolate media and forward only selected streams.
`,
    },
  ],
  companyVariations: [
    {
      company: "Meta",
      angleMD: `
Meta interviewers may push on social graph scale, real-time fanout, presence semantics, and multi-region availability. Be ready to explain why very large groups need subscription-scoped delivery and how clients recover from missed events.
`,
    },
    {
      company: "Amazon",
      angleMD: `
Amazon often emphasizes operational excellence, fault isolation, capacity math, and managed primitives. Discuss DynamoDB or key-value metadata options, Kinesis-style fanout, alarms for gateway lag, and how text remains available during presence or analytics degradation.
`,
    },
    {
      company: "Netflix",
      angleMD: `
Netflix may frame the problem around low-latency media, regional failover, client experience, and adaptive degradation. Voice region selection, SFU health, network quality metrics, and graceful video quality reduction are important talking points.
`,
    },
    {
      company: "Microsoft",
      angleMD: `
Microsoft may steer toward Teams-like enterprise requirements: tenant isolation, compliance, audit logs, retention policy, identity integration, and reliable calls. Tie guild permissions to enterprise access control and explain media plane security.
`,
    },
  ],
  relatedQuestions: [
    {
      slug: "slack",
      note: "Shares workspace channels, unread state, message history, and real-time gateway delivery.",
    },
    {
      slug: "whatsapp",
      note: "Useful contrast for real-time messaging, offline delivery, and end-to-end messaging expectations.",
    },
    {
      slug: "youtube",
      note: "Relevant for large live chat fanout, creator communities, and high-volume real-time events.",
    },
    {
      slug: "key-value-store",
      note: "Core storage principles apply to message ids, read state, presence state, and metadata lookups.",
    },
    {
      slug: "distributed-cache",
      note: "Presence, permissions, session resume, and hot channel metadata all depend on cache design.",
    },
  ],
  interviewTips: {
    commonMistakes: [
      "Treating Discord as a simple group chat without guilds, channels, roles, and gateway sessions.",
      "Broadcasting all messages or presence changes to every guild member.",
      "Storing unread counts by updating every member on every message.",
      "Sending voice packets through the WebSocket gateway.",
      "Using one generic database schema without channel and time partitioning for messages.",
      "Ignoring reconnect storms, session resume, and client backpressure.",
    ],
    redFlags: [
      "No concrete capacity numbers for gateway connections, messages, storage, and voice bandwidth.",
      "No plan for very large guilds with millions of members.",
      "No distinction between durable message persistence and best-effort real-time delivery.",
      "No presence optimization or degradation strategy.",
      "No low-latency media design with SFUs, UDP, WebRTC, or region selection.",
      "No authorization model for channel reads, message sends, and voice joins.",
    ],
    expectations: [
      "Draw separate paths for HTTP control, WebSocket gateway delivery, message storage, presence, and voice media.",
      "Persist messages before fanout and make gateway delivery asynchronous and idempotent.",
      "Use channel and time buckets with Snowflake-style message ids for history.",
      "Explain fanout-on-write versus fanout-on-read for very large guilds.",
      "Use per-user, per-channel read markers instead of per-message unread writes.",
      "Discuss voice region selection, SFU forwarding, and media failure isolation.",
    ],
    communicationMD: `
Start by saying Discord is multiple systems sharing a product surface: durable text chat, real-time gateway, presence, and low-latency voice. Draw those planes separately. Then focus on the two interview cruxes: fanout control for large guilds and media isolation for voice. Keep returning to the rule that durable state should be persisted first, while high-churn signals such as presence, typing, and speaking can be batched, dropped, or resynced.
`,
  },
  revisionNotesMD: `
- Discord has guilds, channels, roles, durable messages, WebSocket gateway sessions, presence, push notifications, and a separate voice or video media plane.
- Persist text messages before fanout. Acknowledge only after durable storage, then publish an event to gateway shards.
- At 4B messages per day, average writes are about 46,300 per second and 10x peak is about 463,000 per second.
- With 20 online recipients per message, peak gateway deliveries can reach about 9.3M events per second before presence and typing events.
- Store messages by **channel_id plus time bucket**, ordered by Snowflake-style **message_id**. This supports cursor pagination and keeps partitions bounded.
- Very large guilds cannot receive full fanout. Use active channel subscriptions, lazy member loading, fanout-on-read for inactive users, and approximate counts.
- Presence is ephemeral. Store it with TTL, version it, batch it, and scope it to visible friends, active guild views, and voice channels.
- Unread state should be a per-user, per-channel last read message id. Do not update every member's unread row on every message.
- Voice uses control-plane allocation plus SFU media servers. Clients send UDP or WebRTC media directly to the selected voice region.
- Degrade low-value real-time signals first: typing, rich activity, presence detail, and exact unread counts. Protect text send, history read, and voice media.
`,
  flashcards: [
    {
      front: "What are the main planes in a Discord design?",
      back: "HTTP control plane, WebSocket gateway, durable message storage, presence service, fanout bus, notification pipeline, and separate voice or video media plane.",
    },
    {
      front: "Why persist before fanout?",
      back: "Persistence gives durability and a source of truth. Gateway fanout can retry or lag, but accepted messages should not disappear.",
    },
    {
      front: "How should message history be partitioned?",
      back: "By channel id and time bucket, ordered by Snowflake-style message id for efficient append writes and cursor reads.",
    },
    {
      front: "Why are very large guilds difficult?",
      back: "A guild can have millions of members, so naive message and presence fanout to every member is too expensive.",
    },
    {
      front: "What is the scalable unread primitive?",
      back: "A per-user, per-channel last read message id, with unread and mention counts derived or updated asynchronously.",
    },
    {
      front: "Why is presence ephemeral?",
      back: "Presence changes frequently, expires naturally, and can be rebuilt from gateway sessions, so it should live in a TTL cache rather than durable message storage.",
    },
    {
      front: "What does an SFU do for voice?",
      back: "It receives each participant's upstream media and forwards selected audio or video streams to other participants with low latency.",
    },
    {
      front: "How do clients recover missed gateway events?",
      back: "They resume with a session id and last sequence number if replay is available; otherwise they perform a full sync from durable stores.",
    },
    {
      front: "Which signals should degrade first under pressure?",
      back: "Typing indicators, rich presence, exact online lists, and non-critical activity updates should degrade before text send, history, or voice media.",
    },
  ],
  quiz: [
    {
      question: "What is the safest default order for sending a text message?",
      options: ["Fan out first, then write to storage", "Persist the message, then publish a fanout event", "Update every member's unread count, then persist", "Send only a push notification"],
      answerIndex: 1,
      explanationMD: `
Persisting first makes the message durable. Gateway fanout can then retry or clients can fetch missed messages from history if real-time delivery lags.
`,
    },
    {
      question: "Why is naive presence fanout dangerous?",
      options: ["Presence never changes", "It can broadcast frequent updates to huge numbers of shared guild members", "It makes voice latency lower", "It removes the need for WebSockets"],
      answerIndex: 1,
      explanationMD: `
Presence changes are frequent and may be visible across many guilds. Without subscriptions, batching, and suppression, one user's status change can become a massive fanout event.
`,
    },
    {
      question: "Which storage model best fits channel message history at high scale?",
      options: ["One relational row per guild with all messages embedded", "A wide-column table partitioned by channel and time bucket", "A single global append-only text file", "A cache-only store with no durable database"],
      answerIndex: 1,
      explanationMD: `
Message history is usually read by channel ranges. Channel plus time bucket partitions bound partition size, while message ids provide ordering and pagination.
`,
    },
    {
      question: "What is the best scalable primitive for unread state?",
      options: ["Increment an unread counter for every member on every message", "Store no read state", "Store last read message id per user and channel", "Use only client-side local storage"],
      answerIndex: 2,
      explanationMD: `
A per-user, per-channel read marker avoids write amplification. Unread counts can be derived from the marker and channel high-water marks, with mention counts updated asynchronously.
`,
    },
    {
      question: "Why should voice media bypass the WebSocket gateway?",
      options: ["WebSocket gateways cannot authenticate users", "Voice needs low-latency UDP or WebRTC transport and media-specific failure isolation", "Messages and audio must be stored in the same table", "Presence updates require audio packets"],
      answerIndex: 1,
      explanationMD: `
The gateway is good for events, not real-time audio packets. Voice needs media servers, jitter handling, region selection, and transport choices optimized for latency.
`,
    },
    {
      question: "What should happen if a client misses too many gateway events to resume?",
      options: ["The client should permanently disconnect", "The gateway should invent missing messages", "The client should perform a full sync from durable stores", "The message store should delete old messages"],
      answerIndex: 2,
      explanationMD: `
If the replay buffer no longer contains missed events, the client cannot safely resume. A full sync reloads guild state and channel history from durable sources.
`,
    },
    {
      question: "In a very large guild, which users should receive a channel message through immediate gateway fanout?",
      options: ["Every historical guild member", "Only users with active authorized subscriptions to that channel or guild view", "Only offline users", "Only the guild owner"],
      answerIndex: 1,
      explanationMD: `
Immediate fanout should target online sessions that are authorized and actively subscribed. Inactive members can fetch history later, and selected offline users can receive push notifications.
`,
    },
  ],
  cheatSheetMD: `
**Goal**: design Discord with guilds, channels, real-time text, presence, unread state, and low-latency voice or video.

**Core split**: HTTP API for control and history, WebSocket gateway for real-time events, message service for durable writes, fanout bus for delivery, presence cache for ephemeral state, and SFU clusters for voice media.

**Capacity**: 10M peak gateway connections, 4B messages per day, about 46,300 average writes per second, about 463,000 peak writes per second, and about 9.3M peak gateway deliveries per second at 20 online recipients per message.

**Message storage**: Cassandra or ScyllaDB style table keyed by channel id and time bucket, clustered by Snowflake-style message id. Recent history stays hot; older history can be tiered.

**Fanout**: persist first, publish event, gateway shards deliver to active authorized subscribers. Use fanout-on-read for inactive users and large-guild cases.

**Presence**: store current state in Redis with TTL, version updates, batch deltas, scope subscriptions, and degrade rich activity or full member lists for large guilds.

**Unread**: store last read message id per user and channel. Avoid per-member writes on every message.

**Voice**: clients join through voice control, receive region and SFU credentials, then send UDP or WebRTC media directly to media servers. SFUs forward selected streams and report health.

**Failure handling**: gateway resume for reconnects, durable history fetch for missed events, fanout replay from log, presence degradation during cache issues, and voice room relocation during SFU failures.

**Security**: enforce permissions on every read, send, and voice join; rate-limit spam; protect gateway identify; encrypt media; use short-lived room tokens; define retention for messages and presence.
`,
  references: [
    {
      title: "How Discord Stores Trillions of Messages",
      kind: "Blog",
      url: "https://discord.com/blog/how-discord-stores-trillions-of-messages",
      author: "Discord",
    },
    {
      title: "The WebSocket Protocol RFC 6455",
      kind: "Docs",
      url: "https://www.rfc-editor.org/rfc/rfc6455",
      author: "IETF",
    },
    {
      title: "WebRTC API",
      kind: "Docs",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API",
      author: "MDN Web Docs",
    },
    {
      title: "Dynamo: Amazon's Highly Available Key-value Store",
      kind: "Paper",
      url: "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf",
      author: "Giuseppe DeCandia and coauthors",
    },
    {
      title: "Designing Data-Intensive Applications",
      kind: "Book",
      author: "Martin Kleppmann",
    },
  ],
};
