import type { SDQuestionContent } from "../types";

export const slackContent: SDQuestionContent = {
  slug: "slack",
  statementMD: `
Design Slack, a team messaging platform where users belong to workspaces, join public and private channels, exchange direct messages, reply in threads, search message history, receive mention notifications, and see presence in real time.

At interview scale, assume millions of concurrent WebSocket connections, very large enterprises with hundreds of thousands of users, channels ranging from small project rooms to huge announcement channels, and strict requirements around tenant isolation, message retention, compliance exports, and eDiscovery. The core challenge is not just storing chat messages; it is combining durable per-channel history, ordered real-time delivery, unread state, search, presence, and notifications without letting any one hot channel or tenant dominate the system.

This differs from WhatsApp-style personal chat. Slack is workspace and channel oriented, optimized for searchable organizational knowledge, granular permissions, integrations, and compliance. The default design should prioritize reliable team communication, fast catch-up from history, and operational controls over global end-to-end encrypted personal messaging.
`,
  businessUseCaseMD: `
Slack helps teams coordinate work across projects, incidents, departments, and external partners. Channels become a shared knowledge base where decisions, files, threads, and context are discoverable long after the real-time conversation ends.

Enterprises pay for secure collaboration, retention controls, legal holds, eDiscovery, identity integration, and uptime. The design must therefore support both consumer-like responsiveness and enterprise-grade governance.
`,
  functionalRequirements: [
    "Create and manage workspaces with users, roles, teams, and tenant-level settings.",
    "Create public channels, private channels, direct messages, and group direct messages.",
    "Send, edit, delete, and retrieve messages with attachments, reactions, and threaded replies.",
    "Deliver new messages to online channel members in real time over WebSocket connections.",
    "Maintain per-user read cursors, unread counts, mentions, and notification preferences per channel.",
    "Expose user presence such as active, away, offline, and do-not-disturb status.",
    "Search messages within a workspace while enforcing channel membership and retention policy.",
    "Support enterprise retention, audit logs, compliance exports, legal hold, and eDiscovery workflows.",
  ],
  nonFunctionalRequirements: [
    {
      label: "Latency",
      detailMD: `
Message send acknowledgment should complete in under 200ms p99 within a region after durable persistence. Real-time delivery to online members in normal-sized channels should target under 500ms p99, while search and history reads can tolerate higher latency.
`,
    },
    {
      label: "Availability",
      detailMD: `
Core messaging and message history should target 99.99 percent availability. Non-critical features such as search freshness, typing indicators, presence fanout, and push notifications should degrade without preventing message sends and reads.
`,
    },
    {
      label: "Scalability",
      detailMD: `
The system must handle millions of concurrent WebSocket connections, billions of messages per day, and channels with member counts ranging from two users to hundreds of thousands. Fanout, WebSocket gateways, storage partitions, and search indexing must all scale independently.
`,
    },
    {
      label: "Ordering",
      detailMD: `
Users expect a consistent order within each channel or thread. The design should assign a monotonic per-channel sequence after authorization and before fanout, while allowing different channels to progress independently.
`,
    },
    {
      label: "Durability",
      detailMD: `
Messages are business records. A sent message should not be acknowledged until it is durably stored and an outbox event can drive downstream fanout, indexing, and notifications. Backups, replication, and retention controls are mandatory.
`,
    },
    {
      label: "Tenant isolation",
      detailMD: `
Workspace data, permissions, encryption keys, search results, retention policies, and operational limits must be isolated by tenant. A bug or spike in one enterprise workspace must not expose or starve another tenant.
`,
    },
    {
      label: "Compliance",
      detailMD: `
Enterprise customers need audit logs, retention policies, legal holds, exports, and eDiscovery search. These requirements must be designed as first-class workflows rather than bolted onto best-effort chat logs.
`,
    },
  ],
  capacityEstimation: {
    assumptionsMD: `
Assume 50M daily active users across many workspaces, 5M average concurrent WebSocket connections, 15M peak concurrent connections, and 1B messages per day. Average channel messages are delivered to 20 online or recently active members, but a small number of huge channels can have 100K or more members.

Assume each persisted message record averages 2 KB before replication and search indexing. The record includes workspace id, channel id, message id, channel sequence, sender, timestamps, thread root, text pointer, edit metadata, retention flags, and small attachment metadata. Large file bytes are stored separately.
`,
    metrics: [
      {
        label: "Daily active users",
        value: "50M users",
        note: "Across free, paid, and enterprise workspaces",
      },
      {
        label: "Peak WebSocket connections",
        value: "15M concurrent",
        note: "About 30 percent of daily users connected at the busiest point",
      },
      {
        label: "Messages per day",
        value: "1B messages",
        note: "Includes channel messages, DMs, thread replies, and edits as events",
      },
      {
        label: "Average message write QPS",
        value: "11,600 writes per second",
        note: "1B divided by 86,400 seconds",
      },
      {
        label: "Peak message write QPS",
        value: "116,000 writes per second",
        note: "10x average peak across regions and tenants",
      },
      {
        label: "Average real-time fanout",
        value: "231,000 deliveries per second",
        note: "11,600 messages per second times 20 online recipients",
      },
      {
        label: "Peak real-time fanout",
        value: "2.3M deliveries per second",
        note: "10x average delivery rate before huge-channel spikes",
      },
      {
        label: "Raw message storage",
        value: "2 TB per day",
        note: "1B messages times 2 KB per record",
      },
      {
        label: "One-year replicated hot storage",
        value: "2.2 PB",
        note: "2 TB per day times 365 days times 3 replicas before indexes",
      },
      {
        label: "Presence heartbeats",
        value: "500,000 heartbeats per second",
        note: "15M peak connections sending a heartbeat every 30 seconds",
      },
      {
        label: "Read cursor writes",
        value: "58,000 writes per second average",
        note: "50M users updating about 100 channel cursors per day",
      },
    ],
    calculationsMD: `
- Message writes: 1B messages per day divided by 86,400 seconds is about 11,574 writes per second, rounded to 11,600. A 10x peak gives about 116,000 writes per second.
- Real-time fanout: if each message has 20 online or recently active recipients, average delivery attempts are 11,600 times 20, or about 231,000 per second. Peak delivery attempts are about 2.3M per second before special handling for huge channels.
- Storage: 1B messages times 2 KB is about 2 TB raw message data per day. For one year, 2 TB times 365 is about 730 TB raw. With 3 replicas, compaction overhead, indexes, and retention metadata, plan for multiple petabytes.
- WebSocket state: 15M peak connections times roughly 8 KB of gateway connection state is about 120 GB of memory before runtime overhead, TLS buffers, and per-process overhead. This requires many gateway hosts and careful connection sharding.
- Presence: 15M peak connections with one heartbeat every 30 seconds creates 500,000 heartbeat events per second. Gateways should aggregate and suppress unchanged presence updates.
- Read cursors: 50M users times 100 channel cursor updates per day is 5B cursor updates per day. 5B divided by 86,400 is about 57,870 writes per second. Coalescing and idempotent upserts are important.
- Huge channels: a 100K-member announcement channel cannot be treated like a 20-member project channel. The system should deliver to online members immediately, materialize history once, and compute unread state lazily where possible.
`,
  },
  apiDesign: {
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/realtime/connect",
        descriptionMD: `
Upgrades an authenticated HTTP request to a WebSocket session. The response includes a connection id and resume token so the client can reconnect and request missed events.
`,
        response: `
HTTP/1.1 101 Switching Protocols
Connection: Upgrade
Upgrade: websocket

{
  "connectionId": "conn_8f31",
  "resumeToken": "resume_72a9",
  "lastEventId": "evt_901234"
}
`,
        statusCodes: [
          { code: 101, meaning: "WebSocket upgrade accepted" },
          { code: 401, meaning: "Missing or invalid authentication" },
          { code: 403, meaning: "User is not allowed to access the workspace" },
          { code: 429, meaning: "Connection rate limit exceeded" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/workspaces/{workspaceId}/channels/{channelId}/messages",
        descriptionMD: `
Sends a message to a channel, DM, or thread. The clientMessageId makes retries idempotent, and threadRootMessageId is present for threaded replies.
`,
        request: `
{
  "clientMessageId": "client_9b7c",
  "text": "Deploy is complete in production.",
  "threadRootMessageId": "msg_1001",
  "mentions": ["U123", "group_oncall"],
  "attachments": [
    { "fileId": "file_44", "title": "release-notes.pdf" }
  ]
}
`,
        response: `
{
  "workspaceId": "W123",
  "channelId": "C456",
  "messageId": "msg_2048",
  "channelSequence": 9823144,
  "createdAt": "2026-07-26T07:10:00Z",
  "deliveryState": "accepted"
}
`,
        statusCodes: [
          { code: 201, meaning: "Message persisted and accepted for fanout" },
          { code: 400, meaning: "Invalid message body or attachment reference" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Sender is not a member of the channel" },
          { code: 409, meaning: "Duplicate clientMessageId already accepted" },
          { code: 429, meaning: "Workspace, user, or channel rate limit exceeded" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/workspaces/{workspaceId}/channels/{channelId}/messages",
        descriptionMD: `
Reads channel history in reverse chronological or sequence order. The caller must be a channel member, and results are filtered by retention, deletion, and legal policy.
`,
        request: `
beforeSequence=9823144&limit=50&includeThreadSummary=true
`,
        response: `
{
  "messages": [
    {
      "messageId": "msg_2048",
      "channelSequence": 9823144,
      "senderUserId": "U123",
      "text": "Deploy is complete in production.",
      "createdAt": "2026-07-26T07:10:00Z",
      "threadReplyCount": 3
    }
  ],
  "nextCursor": "seq_9823094"
}
`,
        statusCodes: [
          { code: 200, meaning: "History returned" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Caller cannot read this channel" },
          { code: 404, meaning: "Channel not found" },
        ],
      },
      {
        method: "PATCH",
        path: "/api/v1/workspaces/{workspaceId}/channels/{channelId}/read-cursor",
        descriptionMD: `
Advances the caller's read cursor for a channel. This drives unread counts, bold channel state, mention badges, and notification suppression.
`,
        request: `
{
  "lastReadMessageId": "msg_2048",
  "lastReadSequence": 9823144,
  "readAt": "2026-07-26T07:10:05Z"
}
`,
        response: `
{
  "channelId": "C456",
  "lastReadSequence": 9823144,
  "unreadCount": 0,
  "mentionCount": 0
}
`,
        statusCodes: [
          { code: 200, meaning: "Cursor updated" },
          { code: 400, meaning: "Cursor does not belong to this channel" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Caller is not a channel member" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/workspaces/{workspaceId}/search/messages",
        descriptionMD: `
Searches messages in the workspace. The search service must filter results to channels and DMs the user is allowed to read.
`,
        request: `
q=deploy%20complete&channel=C456&from=2026-07-01&limit=20
`,
        response: `
{
  "results": [
    {
      "messageId": "msg_2048",
      "channelId": "C456",
      "snippet": "Deploy is complete in production.",
      "createdAt": "2026-07-26T07:10:00Z"
    }
  ],
  "nextCursor": "search_after_41"
}
`,
        statusCodes: [
          { code: 200, meaning: "Search results returned" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Workspace search disabled or restricted" },
          { code: 429, meaning: "Search rate limit exceeded" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/workspaces/{workspaceId}/channels",
        descriptionMD: `
Creates a public channel, private channel, direct message, or group direct message. For DMs, the channel name can be omitted and membership is explicit.
`,
        request: `
{
  "type": "private",
  "name": "incident-db-latency",
  "memberUserIds": ["U123", "U456", "U789"],
  "retentionPolicyId": "ret_90_days"
}
`,
        response: `
{
  "workspaceId": "W123",
  "channelId": "C999",
  "type": "private",
  "name": "incident-db-latency",
  "createdAt": "2026-07-26T07:11:00Z"
}
`,
        statusCodes: [
          { code: 201, meaning: "Channel created" },
          { code: 400, meaning: "Invalid name, type, members, or policy" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Caller cannot create this channel type" },
          { code: 409, meaning: "Channel name already exists in workspace" },
        ],
      },
    ],
    notesMD: `
Separate HTTP APIs from the WebSocket event stream. Message creation, history, channel management, search, and cursor updates are request-response APIs. Real-time message delivery, presence deltas, typing indicators, and reconnect catch-up are event streams. Message send should be idempotent because clients retry aggressively during mobile and network failures.
`,
  },
  databaseDesign: {
    schemaMD: `
The primary data model is tenant scoped. Every durable row starts with **workspace_id** so authorization, retention, backups, exports, and cost attribution can be enforced per tenant. Channels represent public channels, private channels, DMs, and group DMs; the type and membership determine visibility.

Messages are appended to a channel log with a monotonic **channel_sequence**. This gives stable pagination, per-channel ordering, unread cursor math, and replay after WebSocket reconnect. Threads are represented by **thread_root_message_id**, so a thread is a filtered view over the same message log plus optional secondary indexes.
`,
    tables: [
      {
        name: "workspaces",
        columns: [
          { name: "workspace_id", type: "uuid", note: "Primary tenant identifier" },
          { name: "name", type: "varchar(200)", note: "Workspace display name" },
          { name: "plan", type: "varchar(32)", note: "Free, business, enterprise, or grid" },
          { name: "created_at", type: "timestamp", note: "Tenant creation time" },
          { name: "default_retention_policy_id", type: "uuid nullable", note: "Default message retention policy" },
          { name: "region", type: "varchar(32)", note: "Home region for writes and compliance residency" },
          { name: "status", type: "varchar(20)", note: "Active, suspended, exporting, or deleted" },
        ],
      },
      {
        name: "channels",
        columns: [
          { name: "workspace_id", type: "uuid", note: "Partition and tenant scope" },
          { name: "channel_id", type: "uuid", note: "Unique channel, DM, or group DM id" },
          { name: "type", type: "varchar(20)", note: "Public, private, dm, group_dm, or announcement" },
          { name: "name", type: "varchar(80) nullable", note: "Required for named channels, nullable for DMs" },
          { name: "created_by_user_id", type: "uuid", note: "Creator or system user" },
          { name: "created_at", type: "timestamp", note: "Creation time" },
          { name: "member_count", type: "bigint", note: "Approximate count used for fanout strategy" },
          { name: "last_sequence", type: "bigint", note: "Latest assigned per-channel sequence" },
          { name: "retention_policy_id", type: "uuid nullable", note: "Overrides workspace default when present" },
        ],
      },
      {
        name: "channel_memberships",
        columns: [
          { name: "workspace_id", type: "uuid", note: "Tenant scope" },
          { name: "channel_id", type: "uuid", note: "Channel membership belongs to" },
          { name: "user_id", type: "uuid", note: "Member user id" },
          { name: "role", type: "varchar(20)", note: "Member, admin, guest, or bot" },
          { name: "joined_at", type: "timestamp", note: "Membership start for history visibility" },
          { name: "last_read_sequence", type: "bigint", note: "Read cursor for unread computation" },
          { name: "last_read_at", type: "timestamp", note: "Cursor update time" },
          { name: "notification_level", type: "varchar(20)", note: "All, mentions, muted, or none" },
          { name: "is_archived", type: "boolean", note: "Whether the user has hidden the channel" },
        ],
      },
      {
        name: "messages",
        columns: [
          { name: "workspace_id", type: "uuid", note: "Tenant scope and first partition key component" },
          { name: "channel_id", type: "uuid", note: "Channel log partition" },
          { name: "message_id", type: "uuid", note: "Globally unique message id" },
          { name: "channel_sequence", type: "bigint", note: "Monotonic order within the channel" },
          { name: "sender_user_id", type: "uuid", note: "Human, bot, or app sender" },
          { name: "thread_root_message_id", type: "uuid nullable", note: "Null for root messages" },
          { name: "text", type: "text", note: "Normalized message text or pointer to encrypted content" },
          { name: "created_at", type: "timestamp", note: "Authoritative server timestamp" },
          { name: "edited_at", type: "timestamp nullable", note: "Latest edit time" },
          { name: "deleted_at", type: "timestamp nullable", note: "Soft deletion for audit and retention" },
          { name: "version", type: "int", note: "Optimistic concurrency for edits" },
          { name: "compliance_state", type: "varchar(20)", note: "Normal, retained, legal_hold, redacted" },
        ],
      },
    ],
    indexesMD: `
- **messages(workspace_id, channel_id, channel_sequence)** is the main history index and supports ordered pagination.
- **messages(workspace_id, thread_root_message_id, channel_sequence)** supports thread views without scanning the whole channel.
- **channel_memberships(workspace_id, user_id)** lists a user's channels for sidebar rendering and reconnect subscription.
- **channel_memberships(workspace_id, channel_id, user_id)** authorizes send, history, and search result visibility.
- **channels(workspace_id, name)** is unique for public and private named channels.
- The search index stores tokenized message text with workspace id, channel id, message id, created_at, and access-filter metadata. Search results must still be permission checked.
`,
    relationshipsMD: `
A workspace owns channels, memberships, messages, retention policies, and audit logs. A channel has many memberships and many messages. A DM is modeled as a channel with fixed membership, which keeps message storage and unread logic uniform. Message edits and deletes are best represented as new events linked to the original message id so compliance systems can reconstruct history when policy requires it.
`,
    noSqlAlternativesMD: `
At production scale, the message log is better served by a distributed wide-column or log-structured store such as Cassandra, DynamoDB, Bigtable, or a custom append log. Partition by workspace and channel, order by channel_sequence, and split very hot channels into time buckets or virtual shards while preserving a logical sequence.

Membership and read cursors can live in a low-latency key-value store with write coalescing. Presence should be ephemeral in Redis or a purpose-built in-memory state service, not in the durable message database. Search belongs in OpenSearch, Elasticsearch, Vespa, or a similar inverted index fed from the message event stream. Compliance archives can be stored in immutable object storage with tenant-specific retention policies.
`,
  },
  architecture: {
    width: 960,
    height: 560,
    nodes: [
      { id: "client", label: "Client Apps", kind: "client", x: 80, y: 230, sublabel: "Desktop, web, mobile" },
      { id: "api-gateway", label: "API Gateway", kind: "gateway", x: 230, y: 140, sublabel: "Auth, rate limits" },
      { id: "realtime-gateway", label: "Realtime Gateway", kind: "gateway", x: 230, y: 320, sublabel: "WebSocket fleet" },
      { id: "message-service", label: "Message Service", kind: "service", x: 420, y: 180, sublabel: "Send, edit, history" },
      { id: "channel-fanout", label: "Channel Fanout", kind: "service", x: 430, y: 360, sublabel: "Member routing" },
      { id: "pubsub-bus", label: "Pub/Sub Bus", kind: "queue", x: 600, y: 270, sublabel: "Kafka, Pulsar" },
      { id: "message-store", label: "Message Store", kind: "database", x: 620, y: 100, sublabel: "Channel logs" },
      { id: "membership-cache", label: "Membership and Cursor Cache", kind: "cache", x: 620, y: 440, sublabel: "Members, cursors" },
      { id: "presence-service", label: "Presence Service", kind: "service", x: 410, y: 500, sublabel: "Heartbeats" },
      { id: "search-index", label: "Search and eDiscovery", kind: "search", x: 820, y: 160, sublabel: "Index, retention" },
      { id: "notification-workers", label: "Notification Workers", kind: "worker", x: 820, y: 360, sublabel: "Mentions, push" },
    ],
    edges: [
      { from: "client", to: "api-gateway", label: "HTTP APIs" },
      { from: "client", to: "realtime-gateway", label: "WebSocket" },
      { from: "api-gateway", to: "message-service", label: "send and read" },
      { from: "message-service", to: "message-store", label: "append and fetch" },
      { from: "message-service", to: "membership-cache", label: "auth and cursors" },
      { from: "message-service", to: "pubsub-bus", label: "message event", dashed: true },
      { from: "pubsub-bus", to: "channel-fanout", label: "channel events" },
      { from: "channel-fanout", to: "membership-cache", label: "resolve recipients" },
      { from: "channel-fanout", to: "realtime-gateway", label: "deliver to sessions" },
      { from: "realtime-gateway", to: "client", label: "push event" },
      { from: "pubsub-bus", to: "search-index", label: "index stream", dashed: true },
      { from: "pubsub-bus", to: "notification-workers", label: "mentions", dashed: true },
      { from: "realtime-gateway", to: "presence-service", label: "heartbeats", dashed: true },
      { from: "api-gateway", to: "search-index", label: "search query" },
    ],
    captionMD: `
The hot write path persists the message, emits an event, and lets fanout, search, notifications, presence, and compliance progress independently. WebSocket gateways own connections; channel fanout decides where each message should be pushed.
`,
  },
  architectureNotesMD: `
Slack has two primary planes. The durable collaboration plane handles authentication, channel membership, message ordering, message storage, history, retention, and search. The real-time plane maintains millions of WebSocket connections and pushes events to online users with low latency.

The Message Service should not directly write to every recipient. It appends a message to the channel log, records a durable event, and returns an acknowledgment. Channel Fanout consumes the event, resolves members and active sessions, and pushes only to online clients. Offline users catch up from history and read cursors rather than requiring every message to be precomputed into a per-user inbox.

Enterprise features are not side features. Workspace id is present in every data path, search index document, audit log, and compliance export. This is the key difference from a personal messenger: channels are organizational spaces with searchable history, access control, retention, and legal governance.
`,
  requestFlow: [
    {
      title: "Client establishes real-time session",
      detailMD: `
The client authenticates through the API Gateway and opens a WebSocket to the Realtime Gateway. The gateway stores connection id, user id, workspace ids, device metadata, and last seen event id. It also starts heartbeats for presence.
`,
    },
    {
      title: "User sends a channel message",
      detailMD: `
The client calls **POST /messages** with workspace id, channel id, clientMessageId, text, optional threadRootMessageId, and attachments. The Message Service validates size, rate limits, idempotency, and sender identity.
`,
    },
    {
      title: "Membership and policy are checked",
      detailMD: `
The service checks whether the user is a member of the channel, whether posting is allowed, whether retention or legal hold policies require special handling, and whether the message violates workspace policy.
`,
    },
    {
      title: "Channel sequence is assigned",
      detailMD: `
The service allocates the next monotonic channel_sequence for this channel. This can be done by a per-channel sequencer, a partition-local counter, or a log append offset. The sequence is the order clients use for history and replay.
`,
    },
    {
      title: "Message is persisted with an outbox event",
      detailMD: `
The message row and a fanout event are committed durably before the caller receives success. The outbox pattern prevents a message from being stored without a corresponding fanout, search, notification, and compliance event.
`,
    },
    {
      title: "Fanout resolves online recipients",
      detailMD: `
Channel Fanout consumes the message event, reads cached channel membership and notification preferences, finds active sessions for online members, and sends the event to the right Realtime Gateway shards.
`,
    },
    {
      title: "Clients receive and acknowledge",
      detailMD: `
The Realtime Gateway pushes the message to connected clients. Clients render it in sequence order and later update read cursors. Missed events during disconnect are recovered by replaying from the last known sequence or by fetching history.
`,
    },
    {
      title: "Unread, mentions, search, and compliance update asynchronously",
      detailMD: `
Workers update mention counters, push notifications, search indexes, audit logs, and compliance archives. These systems can lag temporarily, but they must be replayable from the durable message event log.
`,
    },
  ],
  coreComponents: [
    {
      name: "Realtime Gateway",
      kind: "gateway",
      role: "Terminates WebSocket connections and pushes events to online clients.",
      detailMD: `
The gateway maintains connection state, handles heartbeats, tracks resume tokens, applies backpressure per connection, and forwards messages only to sessions assigned to that gateway shard. It should be stateless enough that clients can reconnect elsewhere after failure.
`,
    },
    {
      name: "Message Service",
      kind: "service",
      role: "Owns message validation, ordering, persistence, edits, deletes, and history reads.",
      detailMD: `
This service is the consistency boundary for the channel log. It checks authorization, assigns channel_sequence, writes the message, records the outbox event, and serves paginated history. It should not depend on search or push notifications for the send path.
`,
    },
    {
      name: "Channel Fanout Service",
      kind: "service",
      role: "Turns committed channel events into targeted WebSocket deliveries.",
      detailMD: `
Fanout workers consume message events, load membership and session mappings, split work by channel and gateway shard, and deliver to online users. They choose different strategies for small channels, large channels, and announcement channels.
`,
    },
    {
      name: "Membership and Cursor Store",
      kind: "cache",
      role: "Answers who can see a channel and where each user has read up to.",
      detailMD: `
Membership data is used by send authorization, history reads, search filtering, fanout, and unread computation. Read cursors are high-write-volume records and should be idempotent, coalesced, and cached aggressively.
`,
    },
    {
      name: "Message Store",
      kind: "database",
      role: "Durable ordered log for channel messages and thread replies.",
      detailMD: `
The store is partitioned by workspace and channel, sorted by channel_sequence, replicated across availability zones, and backed up for retention. It supports history pagination and replay after reconnect.
`,
    },
    {
      name: "Presence Service",
      kind: "service",
      role: "Maintains ephemeral active and away state for users and devices.",
      detailMD: `
Presence receives heartbeats from gateways, computes coarse state transitions, suppresses noisy updates, and publishes deltas to interested users. It should not be treated as durable truth and can degrade during overload.
`,
    },
    {
      name: "Search and eDiscovery Pipeline",
      kind: "search",
      role: "Indexes messages and supports secure search, retention, and legal workflows.",
      detailMD: `
The pipeline consumes message events, tokenizes text, stores permission metadata, applies retention policies, and exports immutable records for compliance. Search results must be filtered by membership and policy at query time or through secure index partitioning.
`,
    },
    {
      name: "Notification Workers",
      kind: "worker",
      role: "Sends mention, keyword, mobile push, and email notifications.",
      detailMD: `
Notification workers evaluate mentions, mute rules, do-not-disturb windows, user presence, device tokens, and workspace policy. They should deduplicate aggressively because the same user may have multiple devices and sessions.
`,
    },
  ],
  deepDives: [
    {
      topic: "Per-channel ordering",
      detailMD: `
Slack users expect everyone in a channel to agree on message order. The simplest mental model is an append-only log per channel: each accepted message receives a monotonically increasing channel_sequence, and clients render messages by that sequence.

A single global order is unnecessary and harmful because two unrelated channels do not need to coordinate. Per-channel ordering lets the system partition by channel, scale independent hot paths, and make replay straightforward. The hard part is hot channels. A channel with very high write QPS can bottleneck on one sequencer or partition.

Common mitigations include partition-local log offsets, a lightweight per-channel sequencer, leasing sequence ranges to a leader, or splitting huge announcement channels into virtual fanout shards while preserving one logical display order. Edits and deletes should not reorder the log; they are versioned events attached to the original message.
`,
    },
    {
      topic: "Fanout strategy for small and huge channels",
      detailMD: `
Small channels can use push fanout: when a message is committed, fanout workers resolve online members and push the event to each active connection. This gives low latency and simple client behavior.

Huge channels need a different approach. Pushing a single message to 100K members synchronously can overload membership stores, WebSocket gateways, and network links. For announcement channels, deliver immediately to online users in batches, shard by gateway, and let offline users catch up from the channel log. Avoid writing one inbox row per recipient unless a product feature truly requires it.

A strong answer separates durable history from delivery attempts. The message exists once in the channel log. Real-time delivery is a best-effort acceleration for online users. This keeps the system closer to Slack than to an email queue.
`,
    },
    {
      topic: "Unread counts and read cursors",
      detailMD: `
Unread state is deceptively expensive. A naive design increments a counter for every member on every message. That explodes for huge channels and creates high write amplification.

A better design stores a per-user per-channel last_read_sequence and computes unread as latest_channel_sequence minus last_read_sequence, adjusted for joins, deletes, muted channels, and mention-only counters. For small channels or sidebar performance, maintain cached summary counters that can be repaired from the authoritative cursor and message log.

Mention counts are separate from general unread counts. Mentions are sparse enough to materialize as per-user mention events, but they still need deduplication, retention handling, and mute logic. Cursor writes should be idempotent and monotonic so repeated client updates are safe.
`,
    },
    {
      topic: "Presence at millions of connections",
      detailMD: `
Presence is high-volume and low-criticality. At 15M peak connections and one heartbeat every 30 seconds, the raw heartbeat stream is about 500K events per second. Persisting every heartbeat would be wasteful.

Realtime Gateways should aggregate heartbeats locally, publish only state changes, and use TTLs for liveness. The Presence Service stores ephemeral device and user state in memory or Redis, then emits coarse deltas such as active, away, or offline. Clients do not need second-by-second accuracy.

Degrade presence first during incidents. Messaging should remain available even if presence is stale or disabled. Interviewers like to see this priority because it shows that not all real-time features have the same reliability target.
`,
    },
    {
      topic: "Search indexing and compliance",
      detailMD: `
Search is essential in Slack because channels form an organizational memory. The message send path should publish durable events to an indexing pipeline. Indexers tokenize text, extract mentions and attachments, apply language analyzers, and store workspace id, channel id, message id, timestamp, and access metadata.

Search must enforce permissions. A user should never see private-channel or DM results after leaving the channel unless policy explicitly allows it. This can be enforced with filtered queries over membership, per-tenant index partitions, or secure document-level access filters.

Enterprise compliance adds retention, legal hold, immutable audit history, and eDiscovery exports. Deletes may hide content from normal users while preserving it for legal hold. Therefore, the system needs policy-aware storage rather than a single hard-delete path.
`,
    },
    {
      topic: "Multi-tenant workspace isolation",
      detailMD: `
Every layer should know the workspace boundary. API auth, message partitions, search indexes, encryption keys, audit logs, quotas, and operational dashboards should be scoped by workspace or enterprise organization.

Isolation protects privacy and reliability. A large customer's export job, search spike, or huge channel should not starve smaller tenants. Apply per-tenant rate limits, queue partitions, storage quotas, and noisy-neighbor controls. For highly regulated customers, isolate indexes, keys, or even clusters by enterprise tier.

This is another major contrast with WhatsApp. Slack's core unit is the workspace with admin policy and channels; WhatsApp's core unit is personal conversations. That difference drives the whole HLD.
`,
    },
  ],
  scaling: [
    {
      stage: "Prototype: one region and durable relational storage",
      detailMD: `
Start with a stateless API service, a WebSocket gateway fleet, a relational database for workspaces, channels, memberships, and messages, and Redis for presence. Use simple per-channel counters for ordering and a background worker for notifications and search.
`,
    },
    {
      stage: "Growth: event bus, caches, and separated workers",
      detailMD: `
Introduce a pub/sub bus for message events, separate fanout workers from the Message Service, cache channel memberships and read cursors, and move search indexing and notification delivery to independent consumers. This prevents optional features from slowing message sends.
`,
    },
    {
      stage: "Large scale: partitioned message logs and WebSocket sharding",
      detailMD: `
Move message history to a distributed store partitioned by workspace and channel. Shard WebSocket connections by user, workspace, or gateway assignment. Fanout workers publish to gateway shards instead of holding direct client connections.
`,
    },
    {
      stage: "Enterprise scale: huge channels and tenant isolation",
      detailMD: `
Use special fanout modes for announcement channels, virtual shards for hot channels, per-tenant quotas, dedicated search indexes for large customers, and lazy unread computation for massive memberships. Add detailed audit logs, retention policies, and export pipelines.
`,
    },
    {
      stage: "Global scale: regional routing and data residency",
      detailMD: `
Route users to nearby WebSocket gateways while keeping workspace writes in the workspace home region when data residency requires it. Replicate read-only history, search, and presence summaries where allowed. Design reconnect and catch-up so regional failover does not lose messages.
`,
    },
  ],
  bottlenecks: [
    {
      issue: "Huge channel fanout explosion",
      optimizationMD: `
Do not synchronously write a per-user delivery row for every member. Batch by gateway shard, push to online users only, rely on history catch-up for offline users, and compute unread lazily from cursors. For announcement channels, consider broadcast topics and rate-shaped delivery.
`,
    },
    {
      issue: "WebSocket gateway connection pressure",
      optimizationMD: `
Shard connections across many gateway hosts, use efficient heartbeat intervals, cap per-connection buffers, support resume tokens, and shed low-priority events such as typing indicators before message events. Keep reconnect storms under control with jittered backoff.
`,
    },
    {
      issue: "Membership lookup amplification",
      optimizationMD: `
Fanout, search, history, and send authorization all need membership data. Cache memberships by channel and user, version membership lists, invalidate on joins and leaves, and avoid scanning full membership lists for every small decision.
`,
    },
    {
      issue: "Hot channel write partition",
      optimizationMD: `
A busy incident or company-wide channel can overload one channel partition or sequencer. Use per-channel sequencer leases, time-bucketed partitions, virtual shards for fanout, and careful backpressure when one channel exceeds safe write QPS.
`,
    },
    {
      issue: "Read cursor write amplification",
      optimizationMD: `
Clients can update cursors frequently while users scroll. Coalesce cursor updates per user and channel, accept only monotonic advances, batch writes, and derive sidebar counts from cached latest channel sequence plus the authoritative cursor.
`,
    },
    {
      issue: "Search indexing lag",
      optimizationMD: `
Search consumers can fall behind during traffic spikes. Partition index streams by workspace, autoscale consumers, expose freshness indicators, and keep message history usable even when search is stale. Rebuild indexes from the durable message log.
`,
    },
  ],
  failureHandling: [
    {
      scenario: "Realtime Gateway failure",
      strategyMD: `
Clients reconnect with exponential backoff and a resume token. The new gateway asks for events after the last acknowledged sequence or directs the client to fetch history. Presence may flicker, but messages remain durable in the channel log.
`,
    },
    {
      scenario: "Message store degradation",
      strategyMD: `
If writes cannot be durably committed, message send should fail fast or queue only when the product accepts delayed sends. Do not acknowledge messages that may be lost. Read paths can fall back to replicas with clear freshness tradeoffs.
`,
    },
    {
      scenario: "Pub/sub or fanout lag",
      strategyMD: `
Message sends still succeed once persisted, but real-time delivery becomes delayed. Monitor consumer lag, scale fanout workers, and let clients recover by polling history or replaying after reconnect. The durable log is the source of truth.
`,
    },
    {
      scenario: "Search index unavailable",
      strategyMD: `
Disable or degrade search while preserving send, history, and real-time delivery. Keep indexing offsets so consumers can catch up later. Show freshness or outage indicators instead of returning incomplete results as authoritative.
`,
    },
    {
      scenario: "Notification provider outage",
      strategyMD: `
Queue notifications with expiration, deduplicate on retry, and suppress stale mobile pushes after the user reads the message elsewhere. Never block message persistence or WebSocket delivery on push provider availability.
`,
    },
    {
      scenario: "Authorization or tenant isolation bug",
      strategyMD: `
Fail closed for private channels and DMs, use defense-in-depth checks in API, fanout, search, and history, and keep audit logs for access decisions. Roll back quickly and invalidate potentially leaked search or membership caches.
`,
    },
  ],
  security: [
    {
      label: "Authentication and authorization",
      detailMD: `
All APIs and WebSocket sessions require authenticated users or apps. Every send, history read, search result, export, and fanout decision must verify workspace membership, channel membership, role, guest restrictions, and app permissions.
`,
    },
    {
      label: "Tenant isolation",
      detailMD: `
Workspace id must be part of storage keys, cache keys, search documents, metrics, audit logs, and rate limits. Large enterprises may require dedicated encryption keys, isolated indexes, or region-specific clusters.
`,
    },
    {
      label: "Private channels and DMs",
      detailMD: `
Private-channel and DM content should never be delivered, indexed for visibility, or exposed in notifications to unauthorized users. Membership changes must invalidate caches and search filters quickly.
`,
    },
    {
      label: "Encryption and key management",
      detailMD: `
Use TLS for clients and service-to-service traffic, encrypt data at rest, and support tenant-specific key management for enterprise customers. Some customers may require customer-managed keys and auditable key access.
`,
    },
    {
      label: "Retention, deletion, and legal hold",
      detailMD: `
Normal deletion, retention expiry, and legal hold can conflict. The system must apply policy before physical deletion, preserve immutable audit history where required, and make user-visible redaction separate from compliance retention.
`,
    },
    {
      label: "Abuse and spam controls",
      detailMD: `
Rate-limit message sends, mentions, channel creation, app integrations, file sharing, and search. Detect mention spam, compromised bots, suspicious invite patterns, and automated scraping of workspace history.
`,
    },
    {
      label: "Auditability",
      detailMD: `
Admin actions, permission changes, exports, retention policy changes, app installations, and compliance searches should be logged immutably with actor, target, timestamp, and workspace context.
`,
    },
  ],
  tradeoffs: {
    pros: [
      "Per-channel logs give simple history, replay, ordering, and cursor math.",
      "Separating persistence from fanout keeps message sends durable even when real-time delivery lags.",
      "WebSocket gateways scale independently from message storage and search.",
      "Lazy unread computation avoids huge per-recipient write amplification.",
      "Tenant-scoped data models support enterprise isolation and compliance.",
    ],
    cons: [
      "Per-channel ordering can create hot partitions for extremely active channels.",
      "Search and compliance pipelines introduce eventual consistency and operational complexity.",
      "Presence and WebSocket connection management require large memory and reconnect-storm handling.",
      "Permission filtering across search, history, fanout, and notifications is easy to get wrong.",
      "Huge channels force special fanout and unread strategies that are more complex than small chat rooms.",
    ],
    alternativesMD: `
Alternative one is fanout-on-write to per-user inboxes. It makes each user's unread and sidebar views fast, but it explodes for huge channels and creates many writes per message.

Alternative two is pure fanout-on-read from channel logs. It minimizes write amplification and works well for offline users, but online real-time delivery and unread badges need additional caches and event streams.

Alternative three is an end-to-end encrypted personal messenger model. It improves message privacy from the provider, but it conflicts with Slack-like enterprise search, retention, moderation, and eDiscovery requirements.
`,
    whenNotToUseMD: `
Do not use this design when the product requires default provider-blind end-to-end encryption for personal conversations. Slack-like workspace messaging intentionally supports organizational search, admin policy, compliance exports, and integrations, which require different tradeoffs from private personal messaging.
`,
  },
  followUpQuestions: [
    {
      question: "How do you guarantee message ordering?",
      answerMD: `
Guarantee order within a channel, not globally. Assign a monotonic channel_sequence when the message is durably appended, and have clients render by that sequence. Different channels can be ordered independently.
`,
    },
    {
      question: "What happens when a user is offline?",
      answerMD: `
The message remains in the channel log. Offline users do not need real-time delivery rows for every message. When they reconnect, the client uses read cursors, last seen sequence, and history APIs to catch up.
`,
    },
    {
      question: "How should unread counts be computed?",
      answerMD: `
Store a per-user per-channel last_read_sequence and compare it with the channel's latest sequence. Cache sidebar summaries for speed, but keep the cursor and message log as the repairable source of truth. Mention counts can be materialized separately because they are sparse.
`,
    },
    {
      question: "How do you handle a 100K-member channel?",
      answerMD: `
Use special fanout. Persist the message once, push to online members in gateway-sharded batches, avoid per-member writes for offline users, and compute unread lazily. Apply rate limits and backpressure if one channel begins to dominate capacity.
`,
    },
    {
      question: "How accurate does presence need to be?",
      answerMD: `
Presence is useful but not as critical as messages. Use heartbeats with TTLs, publish only state changes, tolerate staleness, and degrade presence first during overload. Do not persist every heartbeat to the message database.
`,
    },
    {
      question: "How do you keep search secure?",
      answerMD: `
Include workspace id, channel id, message id, and access metadata in the index, then filter results by current membership and policy. For sensitive tenants, use isolated indexes or stronger document-level access controls. Recheck permissions before opening a result.
`,
    },
    {
      question: "How is this different from WhatsApp?",
      answerMD: `
Slack is organized around workspaces, channels, searchable history, admin policy, integrations, and compliance. WhatsApp is centered on personal or small-group conversations and often emphasizes end-to-end encryption. The storage, search, fanout, and governance choices differ accordingly.
`,
    },
  ],
  companyVariations: [
    {
      company: "Amazon",
      angleMD: `
Amazon interviewers may push on operational excellence: DynamoDB-style partition keys, noisy-tenant isolation, alarms, backpressure, and how the system keeps sending messages when search, notifications, or presence fail. Be ready to discuss cost of fanout and read cursor writes.
`,
    },
    {
      company: "Microsoft",
      angleMD: `
Microsoft is likely to emphasize Teams-like enterprise collaboration, identity integration, tenant administration, compliance, data residency, eDiscovery, and customer-managed keys. Explain how workspace policy flows into storage, search, export, and audit logs.
`,
    },
    {
      company: "Meta",
      angleMD: `
Meta may focus on massive real-time fanout, WebSocket connection management, presence, feed-like delivery tradeoffs, and ranking notification importance. Contrast channel-based workplace messaging with personal messaging and discuss privacy boundaries.
`,
    },
    {
      company: "LinkedIn",
      angleMD: `
LinkedIn may frame this around professional communities, enterprise messaging, search relevance, spam control, and notification quality. Emphasize member graph permissions, search filtering, and avoiding noisy mention notifications.
`,
    },
  ],
  relatedQuestions: [
    {
      slug: "whatsapp",
      note: "Useful contrast for personal chat, encryption expectations, and smaller group messaging.",
    },
    {
      slug: "discord",
      note: "Shares real-time communities, servers, channels, voice-adjacent presence, and large fanout challenges.",
    },
    {
      slug: "notification-service",
      note: "Mention, keyword, mobile push, and email alerts rely on robust notification delivery.",
    },
    {
      slug: "autocomplete",
      note: "Channel, user, emoji, and mention suggestions require low-latency prefix search.",
    },
    {
      slug: "kafka",
      note: "A durable event log is central to fanout, indexing, notifications, and replay.",
    },
  ],
  interviewTips: {
    commonMistakes: [
      "Treating Slack like a simple two-person chat app and ignoring workspaces, channels, and tenant policy.",
      "Acknowledging message sends before durable persistence.",
      "Writing one unread or inbox row per member for every huge-channel message.",
      "Forgetting per-channel ordering and reconnect replay.",
      "Letting search or notifications block the send path.",
      "Ignoring private-channel permissions in search and fanout.",
    ],
    redFlags: [
      "No concrete capacity math for WebSocket connections, fanout, storage, or presence.",
      "No strategy for channels with tens or hundreds of thousands of members.",
      "No workspace isolation model for enterprise tenants.",
      "No read cursor design for unread counts.",
      "No failure story for fanout lag or gateway reconnects.",
      "No compliance, retention, or eDiscovery discussion.",
    ],
    expectations: [
      "Start with workspace, channel, membership, message, and cursor data models.",
      "Separate durable message append from asynchronous fanout, search, notifications, and compliance.",
      "Use WebSocket gateways for online delivery and history replay for offline catch-up.",
      "Explain per-channel ordering and why global ordering is unnecessary.",
      "Discuss huge-channel fanout, presence heartbeats, and read cursor write amplification.",
      "Call out enterprise-grade tenant isolation, retention, audit logs, and eDiscovery.",
    ],
    communicationMD: `
Lead with the core domain difference: Slack is workspace and channel messaging, not just personal chat. Draw the message send path first: auth, sequence, durable append, event bus, fanout to WebSocket gateways. Then add unread cursors, presence, search, notifications, and compliance as separate systems. Keep repeating the reliability hierarchy: messages and history first, then real-time delivery, then presence and typing indicators.
`,
  },
  revisionNotesMD: `
- Slack is built around workspaces, channels, DMs modeled as channels, threads, memberships, and per-user read cursors.
- The send path should authenticate, authorize, assign a per-channel sequence, durably append the message, publish an event, and acknowledge.
- Real-time delivery over WebSocket is an acceleration path for online users. Offline users catch up from history.
- At 1B messages per day, average write QPS is about 11,600 and 10x peak is about 116,000.
- With 20 online recipients per message, average fanout is about 231,000 deliveries per second and peak is about 2.3M deliveries per second.
- Millions of WebSocket connections require sharded gateways, heartbeat aggregation, resume tokens, per-connection backpressure, and reconnect-storm control.
- Use per-user per-channel last_read_sequence for unread counts. Avoid per-recipient writes for every huge-channel message.
- Search indexing is asynchronous but must enforce workspace, channel, retention, and membership permissions.
- Presence is ephemeral and can be stale. Degrade presence before message sending or history.
- Enterprise Slack requires tenant isolation, audit logs, retention policies, legal hold, compliance exports, and eDiscovery.
`,
  flashcards: [
    {
      front: "What is the core data model for Slack?",
      back: "Workspaces contain channels, DMs are modeled as channels, memberships control access, messages form per-channel logs, and read cursors track per-user progress.",
    },
    {
      front: "Why use per-channel ordering instead of global ordering?",
      back: "Users need consistent order within a channel, but unrelated channels do not need coordination. Per-channel ordering scales better and keeps replay simple.",
    },
    {
      front: "When should a send request be acknowledged?",
      back: "After authorization, sequence assignment, durable message persistence, and durable creation of an event that downstream workers can replay.",
    },
    {
      front: "How are messages delivered to online users?",
      back: "Fanout workers consume message events, resolve online recipients and gateway shards, then push events over WebSocket connections.",
    },
    {
      front: "How do offline users catch up?",
      back: "They reconnect with a resume token or fetch channel history after their last seen sequence. The channel log is the source of truth.",
    },
    {
      front: "Why not write an unread row for every member on every message?",
      back: "It creates massive write amplification for large channels. Store read cursors and compute unread from latest channel sequence, with caches for sidebar summaries.",
    },
    {
      front: "What makes presence expensive?",
      back: "Millions of connections send periodic heartbeats, creating hundreds of thousands of events per second unless gateways aggregate and suppress unchanged state.",
    },
    {
      front: "How should Slack search enforce privacy?",
      back: "Index workspace and channel metadata, then filter by current membership, retention, and policy before returning or opening results.",
    },
    {
      front: "What enterprise features affect the HLD?",
      back: "Tenant isolation, audit logs, data residency, retention policies, legal holds, compliance exports, eDiscovery, and customer-managed keys.",
    },
  ],
  quiz: [
    {
      question: "What ordering guarantee is most appropriate for Slack messages?",
      options: ["One total global order for all workspaces", "Per-channel ordering with independent channels", "Ordering only by client clock", "No ordering because WebSocket is real time"],
      answerIndex: 1,
      explanationMD: `
Users need a consistent order within each channel or thread. A global order would add unnecessary coordination across unrelated channels and tenants.
`,
    },
    {
      question: "Why should message fanout be asynchronous after persistence?",
      options: ["It makes messages disappear faster", "It lets the send path acknowledge durable messages without waiting for every recipient delivery", "It removes the need for authorization", "It prevents users from reading history"],
      answerIndex: 1,
      explanationMD: `
The message log is the source of truth. Fanout, search, and notifications can lag or retry from durable events without causing message loss.
`,
    },
    {
      question: "What is the best source of truth for general unread counts?",
      options: ["A per-user per-channel read cursor and the latest channel sequence", "The number of active WebSocket connections", "The search index document count", "The sender's local timestamp"],
      answerIndex: 0,
      explanationMD: `
Unread count can be derived from the latest visible channel sequence and the user's last_read_sequence, with cached summaries for performance.
`,
    },
    {
      question: "At 15M peak WebSocket connections with one heartbeat every 30 seconds, what is the approximate heartbeat rate?",
      options: ["5,000 per second", "50,000 per second", "500,000 per second", "5M per second"],
      answerIndex: 2,
      explanationMD: `
15M divided by 30 seconds is 500,000 heartbeats per second. Gateways should aggregate and publish only meaningful state changes.
`,
    },
    {
      question: "What should happen if the search index is down?",
      options: ["Block all message sends", "Keep messaging and history working while search degrades", "Delete unindexed messages", "Disable WebSocket connections"],
      answerIndex: 1,
      explanationMD: `
Search is important but not on the critical send path. The system should keep durable messaging available and let indexers catch up from the event log.
`,
    },
    {
      question: "Which design is most appropriate for a 100K-member announcement channel?",
      options: ["Synchronously write a delivery row for every member before acknowledging", "Persist once, push to online members in batches, and let offline users catch up from history", "Disable history for the channel", "Require all members to keep WebSocket open"],
      answerIndex: 1,
      explanationMD: `
Huge channels require avoiding per-member synchronous fanout. Durable history plus gateway-sharded online delivery keeps cost and latency manageable.
`,
    },
    {
      question: "What is the main product difference between Slack and WhatsApp in HLD terms?",
      options: ["Slack never needs real-time delivery", "Slack is workspace and channel oriented with searchable enterprise history and compliance", "WhatsApp requires channels but Slack does not", "Slack messages cannot have threads"],
      answerIndex: 1,
      explanationMD: `
Slack prioritizes team workspaces, channels, search, admin policy, integrations, and compliance. That changes storage, search, security, and fanout tradeoffs.
`,
    },
  ],
  cheatSheetMD: `
**Goal**: design workspace-based team messaging with channels, DMs, threads, real-time WebSocket delivery, durable history, unread cursors, presence, search, mentions, notifications, and enterprise compliance.

**Core model**: workspace, user, channel, membership, message, channel_sequence, thread_root_message_id, read cursor, notification preference, retention policy.

**Send path**: client calls send API, service authenticates, checks membership, assigns per-channel sequence, appends message, writes outbox event, acknowledges, then workers fan out, index, notify, and archive.

**Real-time path**: clients maintain WebSocket connections to Realtime Gateways. Fanout workers push committed events to online sessions. Offline clients replay from history using sequence and read cursor.

**Scale math**: 1B messages per day is about 11,600 write QPS average and 116,000 peak. With 20 online recipients, fanout is about 231,000 deliveries per second average and 2.3M peak. 15M connections with 30-second heartbeats is 500,000 heartbeats per second.

**Storage**: 2 KB per message times 1B per day is about 2 TB raw per day. One year with replicas and indexes reaches petabyte scale.

**Ordering**: guarantee per-channel order through channel_sequence. Do not require global ordering across workspaces or channels.

**Unread**: store last_read_sequence per user and channel. Compute unread from latest channel sequence, with cached sidebar summaries and separate mention events.

**Huge channels**: persist once, fan out to online users by gateway shard, avoid per-member synchronous writes, and rely on history for offline users.

**Search and compliance**: index asynchronously from durable events, enforce membership and retention, preserve audit and legal hold records, and support tenant-scoped eDiscovery exports.

**Reliability hierarchy**: durable messages and history first, real-time delivery second, search and notifications third, presence and typing indicators last.
`,
  references: [
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
      title: "Apache Kafka Documentation",
      kind: "Docs",
      url: "https://kafka.apache.org/documentation/",
      author: "Apache Software Foundation",
    },
    {
      title: "Elasticsearch Guide",
      kind: "Docs",
      url: "https://www.elastic.co/guide/index.html",
      author: "Elastic",
    },
    {
      title: "Slack Engineering Blog",
      kind: "Blog",
      url: "https://slack.engineering/",
      author: "Slack Engineering",
    },
  ],
};
