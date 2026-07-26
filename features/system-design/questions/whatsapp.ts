import type { SDQuestionContent } from "../types";

export const whatsappContent: SDQuestionContent = {
  slug: "whatsapp",
  statementMD: `
Design WhatsApp, a global real-time messaging system for one-on-one chats, groups, media sharing, delivery receipts, read receipts, presence, typing indicators, and offline sync. Clients keep long-lived encrypted connections to a connection gateway layer, and servers route ciphertext without being able to read message contents.

At interview scale, assume billions of registered users, more than a billion users online during peak periods, tens of billions of messages per day, and large regional traffic spikes. The crux is not a simple chat API; it is maintaining persistent connections, mapping each online user and device to a gateway, delivering messages at least once with idempotency, preserving per-conversation ordering, and syncing offline devices after reconnect.

The default design should separate the hot online delivery path from durable mailbox storage, group fanout, media transfer, receipts, and presence. End-to-end encryption shapes the entire architecture: application servers store and route encrypted envelopes, while key exchange and message decryption remain on user devices.
`,
  businessUseCaseMD: `
WhatsApp lets people and businesses communicate instantly across unreliable mobile networks. Users expect messages to be sent, delivered, read, and synced across devices even when either side is briefly offline or moving between networks.

For the business, messaging reliability drives user trust and daily engagement. The platform also supports high-value surfaces such as business messaging, customer support, media sharing, communities, and notifications while preserving privacy through end-to-end encryption.
`,
  functionalRequirements: [
    "Maintain long-lived client connections for online users across mobile, desktop, and web clients.",
    "Send and receive one-on-one encrypted messages with delivery acknowledgements.",
    "Support group messaging with membership management and fanout to all recipients.",
    "Persist encrypted messages for offline users and sync missed messages on reconnect.",
    "Expose sent, delivered, and read receipts per conversation and per device where appropriate.",
    "Support presence, last-seen, online status, and typing indicators with graceful degradation.",
    "Support encrypted media upload and download through object storage using message metadata pointers.",
    "Provide idempotent retries so clients can resend safely after network timeouts.",
  ],
  nonFunctionalRequirements: [
    {
      label: "Latency",
      detailMD: `
For online recipients in the same broad region, target under 200ms p99 from accepted send to gateway delivery. The sender acknowledgement should return in under 150ms p99 after durable enqueue. Offline sync can be slower, but initial reconnect should begin returning missed messages within one to two seconds.
`,
    },
    {
      label: "Availability",
      detailMD: `
Messaging must remain available during cache, receipt, presence, analytics, or media metadata degradation. A practical target is 99.99 percent or higher for sending and receiving text messages, with typing indicators and read receipts treated as best-effort features.
`,
    },
    {
      label: "Scalability",
      detailMD: `
The system must support billions of registered users, more than a billion concurrent connections, millions of message sends per second at peak, and even higher recipient-delivery events after group fanout. Connection gateways, queues, stores, and workers must all scale horizontally.
`,
    },
    {
      label: "Durability",
      detailMD: `
After the server acknowledges a send, the encrypted message envelope must not be lost. Store it in a replicated message log or mailbox before acknowledgement, retain it until recipient devices have synced or the retention window expires, and keep enough metadata to recover from worker retries.
`,
    },
    {
      label: "Ordering",
      detailMD: `
Users expect messages inside a conversation to appear in a stable order. Provide per-conversation sequence numbers or per-sender ordered streams, and make clients handle duplicates and small reordering windows during retries and multi-region failover.
`,
    },
    {
      label: "Consistency and idempotency",
      detailMD: `
Delivery is at-least-once, not exactly-once. Clients include a stable client message id and servers store an idempotency record so duplicate sends, worker retries, and reconnect sync do not create duplicate visible messages.
`,
    },
    {
      label: "Privacy",
      detailMD: `
Servers should only see encrypted envelopes, routing metadata, timestamps, and coarse delivery state. Message bodies, media plaintext, and user keys remain on devices. Metadata access should be minimized, audited, and protected with strict controls.
`,
    },
  ],
  capacityEstimation: {
    assumptionsMD: `
Assume 3B registered users, 1.2B daily active users, 1.0B users concurrently online at peak, 70B user-authored messages per day, and an average recipient fanout of 1.7 after one-on-one and group traffic are blended.

Assume each encrypted text message envelope plus metadata is 1 KB before replication, 5 percent of messages include media, average encrypted media object size is 2 MB, each message produces two receipt events on average, and peak traffic is 4x the daily average. A connection gateway can safely hold 500K concurrent long-lived connections with headroom.
`,
    metrics: [
      {
        label: "Registered users",
        value: "3B users",
        note: "Global account population",
      },
      {
        label: "Peak concurrent connections",
        value: "1.0B sockets",
        note: "Mobile, web, and desktop sessions during peak hours",
      },
      {
        label: "Gateway fleet size",
        value: "about 2,600 active gateways",
        note: "1.0B connections divided by 500K per gateway plus 30 percent headroom",
      },
      {
        label: "Average send QPS",
        value: "810K sends per second",
        note: "70B messages divided by 86,400 seconds",
      },
      {
        label: "Peak send QPS",
        value: "3.2M sends per second",
        note: "4x the average send rate",
      },
      {
        label: "Average recipient deliveries",
        value: "1.38M deliveries per second",
        note: "70B messages times 1.7 recipients divided by 86,400 seconds",
      },
      {
        label: "Peak recipient deliveries",
        value: "5.5M deliveries per second",
        note: "4x the average recipient-delivery rate",
      },
      {
        label: "Receipt events",
        value: "140B events per day",
        note: "Delivered and read receipts, about 1.62M events per second average",
      },
      {
        label: "Message envelope storage",
        value: "70 TB raw per day",
        note: "70B messages times 1 KB before replication and indexes",
      },
      {
        label: "Media ingest",
        value: "7 PB raw per day",
        note: "5 percent of 70B messages times 2 MB average encrypted media object",
      },
    ],
    calculationsMD: `
- Sends: 70B messages per day divided by 86,400 seconds is about 810K sends per second on average. With a 4x peak multiplier, plan for about 3.2M sends per second.
- Recipient deliveries: 70B messages times 1.7 average recipients is 119B recipient deliveries per day. 119B divided by 86,400 seconds is about 1.38M deliveries per second on average and about 5.5M at peak.
- Gateways: 1.0B concurrent sockets divided by 500K sockets per gateway is 2,000 gateways. Adding 30 percent headroom gives about 2,600 active gateways before disaster recovery spare capacity.
- Receipts: two receipt events per message gives 140B receipt events per day. 140B divided by 86,400 seconds is about 1.62M events per second on average and about 6.5M at peak.
- Message storage: 70B encrypted envelopes times 1 KB is 70 TB raw per day. With 3x replication and index overhead, reserve roughly 250 TB per day for the hot retention tier before compaction and deletion.
- Media: 5 percent of 70B messages is 3.5B media messages per day. 3.5B times 2 MB is about 7 PB raw media ingest per day, so media must use object storage and CDN-style delivery rather than the message database.
- Session registry writes: every connected device refreshes a lease periodically. If 1.0B sessions refresh every 30 seconds, that is about 33M lease refreshes per second, so refreshes must be batched, sharded, and handled by a specialized presence/session tier.
`,
  },
  apiDesign: {
    endpoints: [
      {
        method: "GET",
        path: "/ws/v1/connect",
        descriptionMD: `
Upgrades the client to a long-lived encrypted WebSocket or TCP-like session. The gateway authenticates the device, registers a session lease, and returns a resume cursor for missed messages.
`,
        request: `
GET /ws/v1/connect?deviceId=device_7&resumeCursor=conv_42:88421
Authorization: Bearer access_token
X-Client-Capabilities: e2ee,media,multidevice
`,
        response: `
HTTP/1.1 101 Switching Protocols
Connection: Upgrade
Upgrade: websocket

{
  "connectionId": "conn_9af",
  "gatewayId": "gw_us_east_318",
  "leaseExpiresAt": "2026-07-26T07:45:00Z",
  "syncCursor": "global_884210"
}
`,
        statusCodes: [
          { code: 101, meaning: "Connection upgraded" },
          { code: 401, meaning: "Invalid or expired authentication token" },
          { code: 409, meaning: "Device session conflict requires reconnect" },
          { code: 429, meaning: "Connection rate limit exceeded" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/messages",
        descriptionMD: `
Sends an encrypted message envelope to a one-on-one conversation or group. The server validates membership, assigns ordering metadata, persists the envelope, and enqueues per-recipient delivery records.
`,
        request: `
{
  "clientMessageId": "cmsg_01J4",
  "conversationId": "conv_42",
  "senderDeviceId": "device_7",
  "ciphertext": "base64_encrypted_payload",
  "mediaId": "media_abc",
  "clientCreatedAt": "2026-07-26T07:10:00Z"
}
`,
        response: `
{
  "messageId": "msg_905",
  "conversationId": "conv_42",
  "serverSequence": 88422,
  "serverAcceptedAt": "2026-07-26T07:10:00Z",
  "deliveryState": "queued"
}
`,
        statusCodes: [
          { code: 202, meaning: "Accepted and durably queued" },
          { code: 400, meaning: "Malformed encrypted envelope or unsupported message type" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Sender is not a conversation member" },
          { code: 409, meaning: "Duplicate client message id returned existing message result" },
          { code: 429, meaning: "Sender or conversation rate limited" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/conversations/{conversationId}/receipts",
        descriptionMD: `
Records delivered or read state for one or more messages. Receipts are small, high-volume, and eventually consistent; they should not block message delivery.
`,
        request: `
{
  "deviceId": "device_7",
  "receiptType": "read",
  "upToServerSequence": 88422,
  "observedAt": "2026-07-26T07:10:05Z"
}
`,
        response: `
{
  "conversationId": "conv_42",
  "receiptType": "read",
  "acknowledgedUpTo": 88422
}
`,
        statusCodes: [
          { code: 200, meaning: "Receipt accepted" },
          { code: 400, meaning: "Invalid receipt cursor" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Device is not authorized for the conversation" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/sync",
        descriptionMD: `
Fetches missed encrypted messages, receipts, and conversation metadata after a reconnect or when a secondary device catches up. The cursor is per device so multiple devices can advance independently.
`,
        request: `
GET /api/v1/sync?deviceId=device_7&afterCursor=global_884000&limit=500
Authorization: Bearer access_token
`,
        response: `
{
  "nextCursor": "global_884500",
  "hasMore": true,
  "messages": [
    {
      "messageId": "msg_905",
      "conversationId": "conv_42",
      "serverSequence": 88422,
      "ciphertext": "base64_encrypted_payload"
    }
  ]
}
`,
        statusCodes: [
          { code: 200, meaning: "Sync page returned" },
          { code: 400, meaning: "Cursor is invalid or too old" },
          { code: 401, meaning: "Authentication required" },
          { code: 410, meaning: "Requested cursor is outside retention and full resync is required" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/media/upload-url",
        descriptionMD: `
Returns a short-lived signed upload URL for encrypted media. The client encrypts media locally, uploads it to object storage, and then sends a normal message containing the media pointer and encrypted media key material.
`,
        request: `
{
  "conversationId": "conv_42",
  "contentType": "image/jpeg",
  "encryptedSizeBytes": 2048000,
  "sha256": "client_computed_hash"
}
`,
        response: `
{
  "mediaId": "media_abc",
  "uploadUrl": "https://objects.example.com/upload/media_abc?signature=signed",
  "downloadUrl": "https://media.example.com/media_abc?signature=signed",
  "expiresAt": "2026-07-26T07:25:00Z"
}
`,
        statusCodes: [
          { code: 201, meaning: "Signed upload URL created" },
          { code: 400, meaning: "Unsupported media type or size" },
          { code: 401, meaning: "Authentication required" },
          { code: 413, meaning: "Media object too large" },
          { code: 429, meaning: "Upload quota exceeded" },
        ],
      },
    ],
    notesMD: `
The public API is only part of the story. Most real traffic flows over the persistent gateway protocol after connection establishment. Send, ack, receipt, typing, and presence frames can use compact binary envelopes over the long-lived connection, while REST endpoints are useful for sync, media URL issuance, and management operations.

Every send request must carry a client-generated idempotency key. The server should return the same message id and sequence for duplicate retries instead of creating another visible message.
`,
  },
  databaseDesign: {
    schemaMD: `
The database stores encrypted message envelopes and routing metadata, not plaintext. The hot model is a combination of append-only conversation logs, per-recipient mailboxes, group membership tables, and an ephemeral session registry.

Conversation ordering is represented by a server sequence scoped to a conversation. Delivery is represented by mailbox rows scoped to recipient user and device, which lets offline sync read missed work without scanning global message logs.
`,
    tables: [
      {
        name: "conversations",
        columns: [
          { name: "conversation_id", type: "uuid", note: "Primary key for one-on-one or group conversation" },
          { name: "conversation_type", type: "varchar(20)", note: "Direct, group, community, or broadcast-like product type" },
          { name: "created_at", type: "timestamp", note: "Creation time" },
          { name: "created_by_user_id", type: "uuid", note: "User that created the group or direct conversation" },
          { name: "latest_sequence", type: "bigint", note: "Monotonic sequence assigned within this conversation" },
          { name: "membership_version", type: "bigint", note: "Changes when members join, leave, or rotate keys" },
        ],
      },
      {
        name: "conversation_members",
        columns: [
          { name: "conversation_id", type: "uuid", note: "Partition key paired with user_id" },
          { name: "user_id", type: "uuid", note: "Conversation participant" },
          { name: "role", type: "varchar(20)", note: "Member, admin, owner, or removed" },
          { name: "joined_at", type: "timestamp", note: "Membership start time" },
          { name: "left_at", type: "timestamp nullable", note: "Membership end time for access checks" },
          { name: "device_key_version", type: "bigint", note: "Helps clients know when sender keys or sessions changed" },
        ],
      },
      {
        name: "messages",
        columns: [
          { name: "conversation_id", type: "uuid", note: "Partition key for the ordered conversation log" },
          { name: "server_sequence", type: "bigint", note: "Sort key within the conversation" },
          { name: "message_id", type: "uuid", note: "Globally unique stable message id" },
          { name: "client_message_id", type: "varchar(128)", note: "Idempotency key unique per sender device" },
          { name: "sender_user_id", type: "uuid", note: "Author account" },
          { name: "sender_device_id", type: "uuid", note: "Author device for multi-device sync" },
          { name: "ciphertext_ref", type: "text", note: "Encrypted envelope or pointer to encrypted blob storage" },
          { name: "media_id", type: "uuid nullable", note: "Optional encrypted media pointer" },
          { name: "server_accepted_at", type: "timestamp", note: "Ordering and retention timestamp" },
          { name: "expires_at", type: "timestamp nullable", note: "Retention or disappearing-message deadline" },
        ],
      },
      {
        name: "user_mailboxes",
        columns: [
          { name: "user_id", type: "uuid", note: "Recipient partition key" },
          { name: "device_id", type: "uuid", note: "Recipient device, or logical all-devices mailbox" },
          { name: "mailbox_sequence", type: "bigint", note: "Per-recipient ordered sync cursor" },
          { name: "conversation_id", type: "uuid", note: "Conversation containing the message" },
          { name: "message_id", type: "uuid", note: "Message to deliver or sync" },
          { name: "delivery_state", type: "varchar(20)", note: "Queued, delivered, read, expired, or failed" },
          { name: "visible_after", type: "timestamp", note: "Supports delayed retry and backoff" },
          { name: "ttl_expires_at", type: "timestamp", note: "Mailbox retention deadline" },
        ],
      },
      {
        name: "connection_sessions",
        columns: [
          { name: "user_id", type: "uuid", note: "Online user id" },
          { name: "device_id", type: "uuid", note: "Online device id" },
          { name: "gateway_id", type: "varchar(64)", note: "Connection server currently holding the socket" },
          { name: "connection_id", type: "varchar(128)", note: "Opaque session handle on the gateway" },
          { name: "region", type: "varchar(32)", note: "Serving region for routing" },
          { name: "lease_expires_at", type: "timestamp", note: "Short lease refreshed by gateway heartbeat" },
          { name: "capabilities", type: "json", note: "Client protocol and device features" },
        ],
      },
    ],
    indexesMD: `
- **messages.conversation_id, server_sequence** is the primary read path for ordered conversation history.
- **messages.sender_device_id, client_message_id** must be unique enough to implement idempotent send retries.
- **user_mailboxes.user_id, device_id, mailbox_sequence** supports reconnect sync without scanning conversations.
- **conversation_members.conversation_id, user_id** supports membership checks and group fanout.
- **connection_sessions.user_id, device_id** maps an online recipient to the current gateway and connection id.
`,
    relationshipsMD: `
A conversation has many members and many ordered messages. Each accepted message creates one or more mailbox records, one per recipient device or per recipient logical inbox depending on the multi-device model. Connection sessions are short-lived leases, not the source of truth for message durability.

Receipts can be stored as compact per-user cursors such as delivered_up_to and read_up_to per conversation instead of one row per message when semantics allow. This reduces receipt storage from per-message state to per-conversation cursors.
`,
    noSqlAlternativesMD: `
Use a log-structured or wide-column store such as Cassandra, HBase, Bigtable, or DynamoDB for conversation logs and mailboxes. Partition conversation logs by conversation id plus sequence buckets to avoid oversized partitions in very large groups. Partition mailboxes by user id and device id because reconnect sync is recipient-oriented.

Use Redis, Aerospike, or a custom sharded in-memory store for the session registry because connection leases are extremely hot and short-lived. Use object storage for encrypted media and a separate streaming system such as Kafka, Pulsar, or Kinesis for fanout, receipts, and analytics.
`,
  },
  architecture: {
    width: 980,
    height: 560,
    nodes: [
      { id: "mobile-client", label: "Client Devices", kind: "client", x: 80, y: 260, sublabel: "Mobile, web, desktop" },
      { id: "global-lb", label: "Global Load Balancer", kind: "loadBalancer", x: 230, y: 260, sublabel: "Geo and health routing" },
      { id: "connection-gateway", label: "Connection Gateway", kind: "gateway", x: 390, y: 180, sublabel: "WebSocket, TCP" },
      { id: "presence-service", label: "Presence Service", kind: "service", x: 390, y: 420, sublabel: "Last seen, typing" },
      { id: "message-service", label: "Message Service", kind: "service", x: 560, y: 180, sublabel: "Validate, sequence, route" },
      { id: "session-registry", label: "Session Registry", kind: "cache", x: 560, y: 60, sublabel: "User to gateway" },
      { id: "group-service", label: "Group Service", kind: "service", x: 560, y: 360, sublabel: "Membership, keys" },
      { id: "mailbox-queue", label: "Mailbox Queue", kind: "queue", x: 740, y: 120, sublabel: "Per-recipient work" },
      { id: "message-store", label: "Message Store", kind: "database", x: 740, y: 300, sublabel: "Encrypted logs" },
      { id: "fanout-workers", label: "Fanout Workers", kind: "worker", x: 740, y: 460, sublabel: "Groups, retries, sync" },
      { id: "media-store", label: "Media Object Store", kind: "storage", x: 900, y: 300, sublabel: "Encrypted media" },
    ],
    edges: [
      { from: "mobile-client", to: "global-lb", label: "connect or send" },
      { from: "global-lb", to: "connection-gateway", label: "sticky route" },
      { from: "connection-gateway", to: "session-registry", label: "register lease" },
      { from: "connection-gateway", to: "message-service", label: "send ciphertext" },
      { from: "message-service", to: "session-registry", label: "lookup recipient" },
      { from: "message-service", to: "message-store", label: "persist envelope" },
      { from: "message-service", to: "mailbox-queue", label: "enqueue delivery" },
      { from: "message-service", to: "group-service", label: "check membership" },
      { from: "group-service", to: "fanout-workers", label: "recipient set" },
      { from: "fanout-workers", to: "mailbox-queue", label: "group fanout" },
      { from: "mailbox-queue", to: "connection-gateway", label: "deliver online" },
      { from: "mailbox-queue", to: "message-store", label: "offline retention" },
      { from: "connection-gateway", to: "presence-service", label: "presence frames", dashed: true },
      { from: "presence-service", to: "session-registry", label: "online status", dashed: true },
      { from: "message-service", to: "media-store", label: "signed media URLs", dashed: true },
      { from: "mobile-client", to: "media-store", label: "encrypted upload or download", dashed: true },
    ],
    captionMD: `
Clients hold long-lived connections to gateways. Gateways register short leases in the session registry so message routing can find the server that currently owns each recipient device. Durable message state lives in logs and mailboxes, while presence, typing, receipts, and media are adjacent systems with weaker coupling.
`,
  },
  architectureNotesMD: `
The architecture has two hot paths. The online path routes a ciphertext envelope from sender device to connection gateway, through the message service, into durable storage and recipient mailboxes, then back to a recipient gateway if the session registry says the recipient is online. The offline path leaves the encrypted envelope in a recipient mailbox until reconnect sync reads it by cursor.

The connection gateway layer is intentionally stateful for sockets but stateless for correctness. If a gateway dies, clients reconnect through the load balancer, create a new session registry lease, and resume from the last acknowledged mailbox cursor. The message store and mailbox queue remain the correctness boundary.

End-to-end encryption means servers route opaque payloads and store ciphertext. Media is encrypted on the client and uploaded to object storage through signed URLs; messages carry only media pointers and encrypted keys for recipient devices.
`,
  requestFlow: [
    {
      title: "Client connects and registers presence",
      detailMD: `
The client authenticates and establishes a long-lived connection to a nearby gateway. The gateway creates a short session lease mapping user id and device id to gateway id, connection id, region, and protocol capabilities. Presence is updated as best effort.
`,
    },
    {
      title: "Sender encrypts locally",
      detailMD: `
Before sending, the client encrypts the message using recipient device sessions from the Signal protocol style key exchange. For a group, the client uses group sender-key material or per-recipient encrypted key envelopes. The server receives only ciphertext and routing metadata.
`,
    },
    {
      title: "Gateway forwards send to message service",
      detailMD: `
The sender gateway validates authentication freshness, attaches connection metadata, and forwards the encrypted envelope plus client message id to the message service. If the client retries after a timeout, the same client message id is reused.
`,
    },
    {
      title: "Message service checks membership and idempotency",
      detailMD: `
The service verifies that the sender belongs to the conversation, checks whether the client message id was already accepted, and either returns the existing message id or assigns a new message id and per-conversation sequence number.
`,
    },
    {
      title: "Envelope is persisted before acknowledgement",
      detailMD: `
The encrypted envelope is written to the conversation log and recipient mailbox records are created or enqueued. Only after this durable boundary does the service acknowledge the sender with a sent state and server sequence.
`,
    },
    {
      title: "Online recipients are routed through gateways",
      detailMD: `
Delivery workers read recipient mailbox work, query the session registry, and push the message to the gateway that owns each online device. The gateway sends the frame over the existing socket and records a delivery acknowledgement when the client confirms receipt.
`,
    },
    {
      title: "Offline recipients sync later",
      detailMD: `
If no active session exists, the mailbox entry remains durable. On reconnect, the device calls sync with its last cursor and receives missed messages, receipts, and membership changes in mailbox order. The client deduplicates by message id.
`,
    },
    {
      title: "Receipts and presence propagate asynchronously",
      detailMD: `
Delivered and read receipts are written as compact cursors and fanned out to interested participants. Typing and online indicators are ephemeral; they can be dropped during overload because they are not correctness-critical.
`,
    },
    {
      title: "Media follows a separate object-store path",
      detailMD: `
For media, the sender encrypts the file locally, uploads it through a signed URL, and sends a normal message containing a media id and encrypted metadata. Recipients download the object directly and decrypt locally.
`,
    },
  ],
  coreComponents: [
    {
      name: "Connection Gateway",
      kind: "gateway",
      role: "Terminates long-lived client connections and pushes frames to online devices.",
      detailMD: `
Gateways manage WebSocket or long-lived TCP sessions, heartbeats, reconnect tokens, backpressure, per-connection rate limits, and protocol framing. They keep socket state in memory but write short leases to the session registry so routing services can find online devices.
`,
    },
    {
      name: "Session Registry",
      kind: "cache",
      role: "Maps user and device sessions to the gateway currently holding the connection.",
      detailMD: `
The registry stores short-lived leases keyed by user id and device id. It must handle extreme write rates from heartbeats and reconnects, tolerate stale entries through lease expiry, and provide fast lookups for delivery workers.
`,
    },
    {
      name: "Message Service",
      kind: "service",
      role: "Validates sends, assigns ordering metadata, persists encrypted envelopes, and creates delivery work.",
      detailMD: `
This service is the correctness boundary for send acceptance. It checks membership, enforces idempotency, allocates per-conversation sequence numbers, stores ciphertext, and enqueues recipient mailbox records before acknowledging the sender.
`,
    },
    {
      name: "Mailbox Queue",
      kind: "queue",
      role: "Buffers per-recipient delivery work for online push and offline sync.",
      detailMD: `
A mailbox is the durable inbox for each recipient device or logical user. It supports at-least-once delivery, cursor-based reconnect sync, delayed retries, expiration, and deduplication by message id.
`,
    },
    {
      name: "Group Service",
      kind: "service",
      role: "Owns group membership, admin actions, and membership versions used during fanout.",
      detailMD: `
The group service answers who should receive a group message at a specific membership version. It also coordinates key-rotation metadata so clients know when group encryption state changes after joins, leaves, and device changes.
`,
    },
    {
      name: "Fanout Workers",
      kind: "worker",
      role: "Expand group messages and retry delivery without blocking sender acknowledgement.",
      detailMD: `
Workers consume group fanout tasks, create per-recipient mailbox work, shard large groups, retry transient failures, and protect the message service from doing unbounded fanout synchronously.
`,
    },
    {
      name: "Presence Service",
      kind: "service",
      role: "Provides online, last-seen, and typing signals as best-effort metadata.",
      detailMD: `
Presence is high-volume and low-criticality. The service should aggregate heartbeat state, apply privacy settings, expire typing indicators quickly, and degrade before it harms core message delivery.
`,
    },
    {
      name: "Media Object Store",
      kind: "storage",
      role: "Stores encrypted media blobs outside the messaging database.",
      detailMD: `
Clients upload encrypted media through signed URLs and include media pointers in messages. Object storage and CDN-like delivery handle large bytes, while the message service stores only small metadata and encrypted keys.
`,
    },
  ],
  deepDives: [
    {
      topic: "Persistent connections and session routing",
      detailMD: `
A WhatsApp-like system is built around long-lived connections, not polling. Each online device has a socket to one gateway. The gateway periodically refreshes a lease in a session registry containing user id, device id, gateway id, connection id, region, and expiration time.

Delivery workers should not broadcast to all gateways. They query the registry for a recipient device and send to the owning gateway. Because registry entries can be stale, gateway delivery must be conditional: if the connection id no longer exists, the worker leaves the mailbox entry for later sync or retries after a fresh lookup.

Heartbeats are the scale hazard. Refreshing 1B sessions every few seconds would overload any ordinary cache. Use longer leases, gateway-level batching, sharded registries, delta heartbeats, and local gateway state. Presence freshness can be approximate; routing correctness comes from durable mailboxes and client acknowledgements.
`,
    },
    {
      topic: "At-least-once delivery, idempotency, and mailbox design",
      detailMD: `
Exactly-once delivery across mobile networks, retries, queues, and reconnects is not realistic. The server should provide at-least-once delivery and make every stage idempotent. The client sends a stable client message id. The message service stores a mapping from sender device plus client message id to server message id and sequence. If the client retries, it gets the same result.

Each recipient has a mailbox entry referencing the message id and conversation sequence. Delivery workers may retry the same mailbox item many times. Gateways may push duplicates after reconnect races. Clients deduplicate by message id and can acknowledge up to a mailbox cursor.

The sender can see sent after durable enqueue, delivered after a recipient device acknowledges receipt, and read after the recipient opens the conversation or advances a read cursor. These states are monotonic but eventually consistent.
`,
    },
    {
      topic: "Ordering per conversation",
      detailMD: `
Users expect a conversation to feel ordered even when messages are sent from multiple devices and regions. A common design assigns a monotonically increasing server sequence per conversation at acceptance time. The client displays messages by server sequence, with client timestamp only as secondary metadata.

The challenge is large groups and hot conversations. A single per-conversation sequencer can become hot. For ordinary chats, a leader shard per conversation is simple. For very large groups, use sequence allocation in ranges, conversation partitioning, or accept looser ordering with deterministic merge rules. The interview answer should explicitly state that global ordering across all conversations is unnecessary.

Retries must preserve sequence. If the same client message id is retried, the server returns the original server sequence. If failover occurs before acknowledgement, recovery must decide whether the sequence was committed by checking the idempotency record and message log.
`,
    },
    {
      topic: "Group messaging fanout",
      detailMD: `
One-on-one messaging creates one recipient delivery per send. Group messaging can create hundreds or thousands. Small and medium groups can use fanout-on-write: expand the recipient set at send time and enqueue one mailbox item per recipient. This gives fast offline sync because each user's mailbox already contains the message.

Very large communities may need hybrid fanout. Store one group message in the conversation log, enqueue for online active members first, and let inactive members pull from the group log on sync. This reduces write amplification but makes read and cursor logic more complex.

Membership version matters. A user who joins after a message should not receive old ciphertext unless history sharing is enabled, and a user who leaves should not receive future messages. Fanout tasks should include the membership version and clients should rotate group encryption keys when membership changes.
`,
    },
    {
      topic: "Offline sync and multi-device",
      detailMD: `
Offline support is a first-class requirement. When a device reconnects, it should not ask every conversation for missing messages. It should read a recipient mailbox or device sync log using a single cursor. The response contains encrypted messages, receipt updates, membership changes, and tombstones in a bounded page.

Multi-device increases complexity because a user may have phone, web, desktop, and companion devices with independent encryption sessions and cursors. The system can either create mailbox entries per device or maintain a logical user inbox plus device-specific delivery state. Per-device mailboxes are more expensive but make sync correctness clearer.

Retention policies matter. If a device is offline longer than the mailbox retention window, the server should return a cursor expired response and require a fuller resync from conversation logs or a client backup, depending on product policy and encryption constraints.
`,
    },
    {
      topic: "End-to-end encryption and media",
      detailMD: `
End-to-end encryption changes what servers can do. Servers cannot inspect message text for search, spam decisions, previews, or smart replies unless clients provide separate privacy-preserving signals. The server stores ciphertext, sender and recipient identifiers, timestamps, envelope size, and delivery state.

The Signal protocol family uses device identity keys, prekeys, sessions, and ratcheting so each device can decrypt only messages intended for it. For groups, clients can use sender keys or per-recipient key wrapping to avoid encrypting the full payload separately for every member.

Media should never flow through the message database. The client encrypts the media, uploads it to object storage, and sends a message containing a media id, content hash, size, and encrypted media key material. Recipients fetch the object and decrypt locally.
`,
    },
  ],
  scaling: [
    {
      stage: "Prototype: single region and simple chat service",
      detailMD: `
Start with one regional WebSocket gateway fleet, a message service, a relational or document store for conversations, and a simple Redis-backed online registry. Support one-on-one messaging, basic offline storage, and idempotent client message ids before adding large groups.
`,
    },
    {
      stage: "Growth: sharded gateways and durable mailboxes",
      detailMD: `
Shard gateways by region and connection id, move messages and mailboxes into a partitioned wide-column or log store, and introduce queue-backed delivery workers. Separate presence and receipts from the core send path so they can fail independently.
`,
    },
    {
      stage: "Large scale: group fanout and multi-device",
      detailMD: `
Add group membership versioning, asynchronous fanout workers, per-device sync cursors, media object storage, and hot conversation protection. Split high-cardinality receipt streams from message envelope storage and compact receipts into per-conversation cursors.
`,
    },
    {
      stage: "Global scale: billions of users and regional isolation",
      detailMD: `
Use geo-routing to connect clients to nearby gateways, keep conversations homed to a region or shard group for ordering, replicate metadata across regions, and provide disaster recovery with explicit tradeoffs around ordering and duplicate delivery. Keep online routing regional whenever possible to avoid cross-region hops on every message.
`,
    },
    {
      stage: "Extreme scale: communities and business messaging",
      detailMD: `
Use hybrid fanout for massive groups, capacity isolation for business senders, adaptive rate limits, spam scoring based on metadata and reports, and specialized stores for media, receipts, search metadata allowed by clients, and analytics. Preserve the core invariant: acknowledged messages are durably recoverable.
`,
    },
  ],
  bottlenecks: [
    {
      issue: "Session registry write amplification",
      optimizationMD: `
Do not write every heartbeat as an independent global cache update. Batch leases at the gateway, refresh only when a lease is near expiry, shard by user id and device id, and treat presence freshness as approximate. Use durable mailboxes as the source of truth when registry state is stale.
`,
    },
    {
      issue: "Group fanout write explosion",
      optimizationMD: `
Fanout small groups on write, but shard large groups into batches and process asynchronously. For very large communities, use hybrid fanout where inactive users pull from a group log during sync. Apply per-group rate limits and protect fanout workers from a single hot group.
`,
    },
    {
      issue: "Hot conversations and sequencing contention",
      optimizationMD: `
A single sequence allocator can bottleneck on active groups. Assign conversations to sequencer shards, allocate sequence ranges, use partitioned logs for large groups, and avoid global ordering. Monitor per-conversation queue depth and p99 sequence allocation latency.
`,
    },
    {
      issue: "Receipt event volume",
      optimizationMD: `
Delivered and read receipts can exceed message volume. Store compact monotonic cursors such as delivered up to and read up to, batch updates, coalesce repeated reads, and drop low-value receipt fanout during overload before dropping messages.
`,
    },
    {
      issue: "Media overwhelming message infrastructure",
      optimizationMD: `
Keep media out of gateways and message databases. Use signed URLs, client-side encryption, object storage multipart upload, virus scanning where product policy allows, CDN-style download acceleration, and separate quotas for media senders.
`,
    },
    {
      issue: "Offline reconnect storms",
      optimizationMD: `
After an outage or app update, millions of clients may reconnect and sync at once. Use randomized backoff, resume tokens, paginated sync, per-user limits, gateway admission control, and priority for small recent mailbox pages.
`,
    },
  ],
  failureHandling: [
    {
      scenario: "Connection gateway crashes",
      strategyMD: `
All sockets on that gateway disconnect. Clients reconnect through the load balancer, old session leases expire quickly, and new leases are written. Messages acknowledged before the crash are still in durable mailboxes, so reconnect sync replays missed envelopes.
`,
    },
    {
      scenario: "Session registry outage or stale entries",
      strategyMD: `
Continue accepting sends by writing message logs and mailboxes. Online push may degrade, but recipients can recover through sync. Delivery workers should treat registry misses as offline state and stale hits as retryable failures, not message loss.
`,
    },
    {
      scenario: "Message store partition unavailable",
      strategyMD: `
If the durable write path is unavailable for a conversation shard, do not acknowledge new sends for that shard. Queue briefly only if durability is preserved elsewhere. Fail over to a replica or home region, then use idempotency records to avoid duplicate accepted messages.
`,
    },
    {
      scenario: "Fanout worker backlog",
      strategyMD: `
Sender acknowledgement can still happen after durable enqueue, but delivered receipts will lag. Scale workers by shard, prioritize one-on-one and small groups, expose delayed delivery metrics, and apply sender or group rate limits if backlog threatens retention.
`,
    },
    {
      scenario: "Regional outage",
      strategyMD: `
Route new connections to healthy regions. Conversations homed in the failed region may become read-only or temporarily unavailable unless replicated write ownership can move safely. Prefer duplicate-tolerant recovery over pretending exactly-once delivery survived failover.
`,
    },
    {
      scenario: "Object storage or media CDN degraded",
      strategyMD: `
Text messaging should continue. Media upload URL creation can fail or return retryable errors, while existing media downloads can use alternate replicas. Message envelopes with media pointers should clearly show pending or failed media state on clients.
`,
    },
  ],
  security: [
    {
      label: "End-to-end encryption",
      detailMD: `
Message plaintext and media plaintext stay on devices. Servers store and route ciphertext, manage prekey distribution, enforce device identity changes, and never require plaintext to provide delivery. Clients should warn users when safety numbers or device identities change.
`,
    },
    {
      label: "Authentication and device trust",
      detailMD: `
Every connection and send frame is authenticated with a user and device identity. Device enrollment, session revocation, token refresh, and suspicious login detection are critical because a stolen session can send valid encrypted messages.
`,
    },
    {
      label: "Spam and abuse controls",
      detailMD: `
Because servers cannot inspect plaintext, abuse detection relies on metadata, rate patterns, user reports, block lists, business sender reputation, link safety signals, and client-side protections. Controls must avoid weakening encryption guarantees.
`,
    },
    {
      label: "Metadata minimization",
      detailMD: `
Routing metadata is sensitive even without message content. Limit retention of IPs, device identifiers, contact graph signals, and precise presence. Use access controls, audit logs, aggregation, and privacy settings for last-seen and read receipts.
`,
    },
    {
      label: "Media safety",
      detailMD: `
Media is encrypted before upload, so server-side scanning may be limited by privacy policy. Enforce size limits, signed URLs, short token lifetimes, abuse reporting flows, quarantine mechanisms for reported media, and safe client rendering.
`,
    },
    {
      label: "Transport security and replay protection",
      detailMD: `
Use TLS for client-to-gateway transport, signed protocol frames, nonce or sequence checks where applicable, and idempotency windows to prevent replayed sends from creating duplicate messages or forged receipts.
`,
    },
  ],
  tradeoffs: {
    pros: [
      "Persistent connections give low-latency delivery without client polling.",
      "Durable per-recipient mailboxes make offline sync and retry semantics explicit.",
      "At-least-once delivery with idempotent clients is realistic for mobile networks.",
      "End-to-end encryption protects message content even from server compromise.",
      "Separating media, presence, receipts, and messages lets non-critical features degrade independently.",
    ],
    cons: [
      "Maintaining a billion long-lived connections requires a large stateful gateway fleet.",
      "End-to-end encryption prevents server-side plaintext search, moderation, and rich previews unless clients cooperate.",
      "Group fanout creates heavy write amplification and hot-conversation risks.",
      "Per-device multi-device sync significantly increases mailbox and receipt complexity.",
      "Strong per-conversation ordering can conflict with multi-region availability during failover.",
    ],
    alternativesMD: `
Alternative one is client polling against a REST API. It is simpler, but it wastes battery and bandwidth and cannot meet real-time latency at global scale.

Alternative two is a pure pub-sub system with no durable mailbox. It works for online-only chat, but offline users lose messages and reconnect sync becomes unreliable.

Alternative three is fanout-on-read for all groups. It reduces write amplification, but reconnect sync becomes expensive because each user must scan group logs and compute visibility on demand.

Alternative four is server-visible plaintext to support search, spam filtering, and previews. It simplifies product features but violates the privacy requirement and is not acceptable for a WhatsApp-like design.
`,
    whenNotToUseMD: `
Do not use this design for low-volume enterprise chat where compliance requires server-side retention, eDiscovery, and plaintext indexing; a Slack-like system may be more appropriate. Also do not use it for public broadcast feeds where follower fanout, ranking, and timeline storage dominate rather than private encrypted delivery.
`,
  },
  followUpQuestions: [
    {
      question: "Why not use HTTP polling instead of persistent connections?",
      answerMD: `
Polling is easier but inefficient for mobile clients and adds latency between polls. Persistent connections let the server push messages, receipts, and typing indicators immediately while also supporting heartbeats and backpressure. The tradeoff is stateful gateway operation at very large scale.
`,
    },
    {
      question: "How do you guarantee exactly-once delivery?",
      answerMD: `
You generally do not. The practical design is at-least-once delivery with idempotency. The sender uses a stable client message id, the server maps it to one message id and sequence, delivery workers retry mailbox records, and clients deduplicate by message id.
`,
    },
    {
      question: "How is ordering handled in group chats?",
      answerMD: `
Assign a server sequence number scoped to the conversation or to a sequence shard for very large groups. Clients display by that sequence. The system should not attempt global ordering across all conversations. For hot groups, use range allocation or relaxed deterministic ordering to reduce sequencer contention.
`,
    },
    {
      question: "What happens when the recipient is offline?",
      answerMD: `
The message remains in the recipient mailbox with a cursor. The sender can see sent after durable enqueue, but delivered waits until a recipient device reconnects, syncs, and acknowledges receipt. Retention policy determines how long offline messages are kept.
`,
    },
    {
      question: "How does end-to-end encryption affect backend design?",
      answerMD: `
Servers cannot inspect or transform message bodies. Backend services route ciphertext, store encrypted envelopes, manage metadata, and distribute public prekeys. Features that need content, such as search or previews, must be implemented on device or with explicit privacy-preserving client support.
`,
    },
    {
      question: "How do you scale to very large groups?",
      answerMD: `
Use fanout-on-write for normal groups because it makes recipient sync simple. For massive groups or communities, shard fanout, prioritize active online users, and let inactive users pull from a group log. Include membership versioning so visibility and encryption state are correct.
`,
    },
    {
      question: "How do you handle reconnect storms after an outage?",
      answerMD: `
Gateways enforce admission control and ask clients to use exponential backoff with jitter. Sync is paginated by mailbox cursor, recent small pages are prioritized, and old large syncs are throttled so the system can restore online delivery first.
`,
    },
  ],
  companyVariations: [
    {
      company: "Meta",
      angleMD: `
Meta interviewers are likely to push on the true WhatsApp crux: billions of persistent connections, Signal protocol constraints, group fanout, presence privacy, abuse without plaintext inspection, and multi-region failure behavior. Be ready to explain why durable mailboxes are the correctness boundary.
`,
    },
    {
      company: "Amazon",
      angleMD: `
Amazon may frame this around operational excellence, sharded queues, DynamoDB or Kinesis-style primitives, noisy-tenant isolation for business messaging, and clear failure modes. Expect pressure on capacity math, backpressure, retry storms, and cost of media storage.
`,
    },
    {
      company: "Microsoft",
      angleMD: `
Microsoft may compare the design with Teams-style enterprise messaging. Discuss device identity, compliance tradeoffs, Azure Front Door-like routing, tenant and region isolation, auditability of metadata access, and how end-to-end encryption limits server-side search.
`,
    },
    {
      company: "Google",
      angleMD: `
Google tends to probe distributed systems fundamentals: long-lived connection balancing, tail latency, per-conversation ordering, hot shard mitigation, global replication, and SRE metrics for delivery freshness and reconnect storms.
`,
    },
    {
      company: "LinkedIn",
      angleMD: `
LinkedIn may connect messaging to professional identity, spam prevention, invitations, and notification fanout. Emphasize abuse controls, rate limits, inbox sync, and the difference between private encrypted chat and feed or notification systems.
`,
    },
  ],
  relatedQuestions: [
    {
      slug: "slack",
      note: "Contrasts encrypted mobile-first messaging with enterprise chat, search, channels, and compliance.",
    },
    {
      slug: "discord",
      note: "Shares real-time gateway, presence, and group communication concerns at high concurrency.",
    },
    {
      slug: "notification-service",
      note: "Offline delivery, mobile push fallback, retries, and user-device routing are closely related.",
    },
    {
      slug: "distributed-queue",
      note: "Mailbox queues, fanout workers, retries, and at-least-once semantics depend on queue design.",
    },
    {
      slug: "kafka",
      note: "Streaming logs are useful for fanout, receipt processing, and ordered event pipelines.",
    },
  ],
  interviewTips: {
    commonMistakes: [
      "Designing only REST polling and ignoring persistent connection gateways.",
      "Claiming exactly-once delivery instead of at-least-once with idempotency.",
      "Forgetting offline mailboxes and reconnect sync cursors.",
      "Sending media through the message database or gateways.",
      "Ignoring end-to-end encryption and accidentally relying on server plaintext access.",
      "Treating typing indicators and read receipts as equally critical as message durability.",
    ],
    redFlags: [
      "No session registry mapping online users to gateway servers.",
      "No capacity math for concurrent sockets, fanout, receipts, or media.",
      "No per-conversation ordering story.",
      "No duplicate handling for client retries and worker retries.",
      "No separation between durable message storage and ephemeral presence.",
      "No plan for stale gateway leases, reconnect storms, or offline retention.",
    ],
    expectations: [
      "Start with requirements for one-on-one, groups, offline sync, receipts, presence, media, and encryption.",
      "Draw client to load balancer to connection gateway to message service to mailbox and store.",
      "Explain session registry leases and why stale entries are safe with mailbox recovery.",
      "Use at-least-once delivery with idempotent message ids and client deduplication.",
      "Quantify billions of sockets, millions of sends per second, receipt volume, and media storage.",
      "Discuss group fanout, per-conversation ordering, multi-device sync, and failure handling.",
    ],
    communicationMD: `
Lead with the connection-oriented nature of the system. Draw the gateway and session registry first, then the durable message log and recipient mailbox, then group fanout, receipts, presence, and media. Keep repeating the key invariant: once the sender sees accepted, the encrypted envelope is durable and recoverable even if online push fails.

When discussing tradeoffs, separate correctness-critical features from best-effort features. Message persistence, idempotency, and sync are critical. Typing indicators, last-seen freshness, and analytics can lag or drop during overload.
`,
  },
  revisionNotesMD: `
- WhatsApp is a persistent-connection system: online devices hold WebSocket or long-lived TCP sessions to connection gateways.
- The session registry maps user id and device id to gateway id, connection id, region, and lease expiry.
- The registry is an optimization for online push, not the source of truth. Durable mailboxes and message logs provide correctness.
- Delivery is at-least-once. Use client message ids, server message ids, idempotency records, and client deduplication.
- A sender can see sent after durable enqueue, delivered after recipient device acknowledgement, and read after recipient read cursor advances.
- Preserve order per conversation with a server sequence. Do not promise global ordering across all chats.
- One-on-one sends create small fanout. Groups require membership-versioned fanout and may need hybrid fanout for massive communities.
- Offline sync reads a per-user or per-device mailbox cursor and returns encrypted messages, receipts, and metadata changes in pages.
- End-to-end encryption means servers route ciphertext and cannot inspect message bodies. Media is encrypted client-side and stored in object storage.
- Presence, typing, and last-seen are best-effort. They should degrade before message sending and offline sync.
- Capacity hotspots are concurrent sockets, heartbeat leases, recipient fanout, receipt events, media bytes, and reconnect storms.
`,
  flashcards: [
    {
      front: "What is the role of the connection gateway?",
      back: "It holds long-lived client sockets, handles heartbeats and protocol frames, and pushes messages to online devices.",
    },
    {
      front: "What does the session registry store?",
      back: "A short-lived mapping from user and device to gateway id, connection id, region, capabilities, and lease expiry.",
    },
    {
      front: "Why is delivery at-least-once instead of exactly-once?",
      back: "Mobile retries, queues, gateway failures, and reconnect races make exactly-once unrealistic, so the system uses idempotency and client deduplication.",
    },
    {
      front: "When should the sender receive a sent acknowledgement?",
      back: "After the encrypted envelope and recipient mailbox work are durably persisted or safely enqueued.",
    },
    {
      front: "How are offline messages delivered?",
      back: "They remain in a recipient mailbox and are returned during reconnect sync using a per-user or per-device cursor.",
    },
    {
      front: "Why not store media in the message database?",
      back: "Media objects are huge compared with message envelopes, so encrypted media belongs in object storage with signed upload and download URLs.",
    },
    {
      front: "How is ordering scoped?",
      back: "Ordering is scoped to a conversation using server sequence numbers or deterministic merge rules, not globally across all chats.",
    },
    {
      front: "How does end-to-end encryption affect the server?",
      back: "The server routes and stores ciphertext, manages metadata and prekeys, but cannot read message or media plaintext.",
    },
  ],
  quiz: [
    {
      question: "Which component maps an online recipient device to the server holding its socket?",
      options: ["Media object store", "Session registry", "Receipt aggregator", "Group membership table"],
      answerIndex: 1,
      explanationMD: `
The session registry stores short-lived leases mapping user and device ids to gateway and connection ids. Delivery workers use it to push to online recipients.
`,
    },
    {
      question: "What delivery guarantee is most realistic for WhatsApp-style messaging?",
      options: ["At-most-once with no retries", "Exactly-once across all services", "At-least-once with idempotency and deduplication", "No persistence for offline users"],
      answerIndex: 2,
      explanationMD: `
Queues, retries, reconnects, and gateway failures make exactly-once impractical. The robust design uses at-least-once delivery and deduplicates by stable message ids.
`,
    },
    {
      question: "When should the server acknowledge a send as accepted?",
      options: ["Before any validation", "After the recipient reads it", "After durable message and mailbox persistence", "Only after media download completes"],
      answerIndex: 2,
      explanationMD: `
The accepted or sent state should mean the encrypted envelope is durably recoverable. Delivered and read states happen later.
`,
    },
    {
      question: "Why is a per-recipient mailbox useful?",
      options: ["It lets reconnect sync read missed work by cursor", "It lets servers decrypt messages", "It removes the need for client ids", "It guarantees global ordering"],
      answerIndex: 0,
      explanationMD: `
A mailbox gives each user or device a durable ordered sync stream. Offline devices can catch up without scanning every conversation.
`,
    },
    {
      question: "Which feature should degrade first during overload?",
      options: ["Durable message persistence", "Offline sync for recent messages", "Typing indicators", "Idempotency records"],
      answerIndex: 2,
      explanationMD: `
Typing indicators are ephemeral and best effort. Message durability, sync, and idempotency are correctness-critical.
`,
    },
    {
      question: "What is the best storage path for encrypted media files?",
      options: ["The connection gateway memory", "The message sequence counter", "Object storage accessed through signed URLs", "The receipt cursor table"],
      answerIndex: 2,
      explanationMD: `
Media is large and should bypass the message database. Clients upload encrypted objects to object storage and send media pointers in normal messages.
`,
    },
    {
      question: "What does end-to-end encryption prevent the server from doing by default?",
      options: ["Routing by recipient id", "Persisting ciphertext", "Reading message plaintext", "Returning delivery receipts"],
      answerIndex: 2,
      explanationMD: `
With end-to-end encryption, servers can route and store encrypted envelopes but cannot read the plaintext content.
`,
    },
  ],
  cheatSheetMD: `
**Goal**: global private messaging with persistent connections, one-on-one and group delivery, receipts, presence, offline sync, encrypted media, and end-to-end encryption.

**Scale**: 3B registered users, 1B peak concurrent sockets, 70B messages per day, about 810K average sends per second, about 3.2M peak sends per second, and about 5.5M peak recipient deliveries per second after fanout.

**Connection layer**: clients connect to regional gateways through a global load balancer. Gateways hold sockets and refresh leases in a sharded session registry mapping user and device to gateway and connection id.

**Send path**: sender encrypts locally, gateway forwards ciphertext, message service checks membership and idempotency, assigns per-conversation sequence, persists the encrypted envelope, creates mailbox work, and acknowledges sent.

**Delivery path**: workers read mailbox items, look up recipient sessions, push to online gateways, and retain items for offline sync if no valid session exists. Clients acknowledge and deduplicate by message id.

**Ordering**: order within a conversation using server sequence numbers. Avoid global ordering. For hot groups, shard fanout and protect the sequencer.

**Offline sync**: each user or device has a cursor over mailbox work. Reconnect sync returns missed messages, receipts, membership changes, and tombstones in pages.

**Groups**: fanout-on-write for normal groups. Use membership versions and asynchronous workers. Use hybrid fanout for massive communities.

**Receipts and presence**: sent is durable enqueue, delivered is device receipt, read is read cursor. Presence, last-seen, and typing are best effort and privacy controlled.

**E2EE**: servers route ciphertext and manage metadata. Device keys and plaintext stay on clients. Media is encrypted client-side and stored in object storage via signed URLs.

**Failure rule**: if online push fails, do not lose the message. Let leases expire, reconnect, and replay from durable mailboxes.
`,
  references: [
    {
      title: "The Double Ratchet Algorithm",
      kind: "Docs",
      url: "https://signal.org/docs/specifications/doubleratchet/",
      author: "Signal",
    },
    {
      title: "The X3DH Key Agreement Protocol",
      kind: "Docs",
      url: "https://signal.org/docs/specifications/x3dh/",
      author: "Signal",
    },
    {
      title: "Designing Data-Intensive Applications",
      kind: "Book",
      author: "Martin Kleppmann",
    },
    {
      title: "Kafka: a Distributed Messaging System for Log Processing",
      kind: "Paper",
      url: "https://www.microsoft.com/en-us/research/wp-content/uploads/2017/09/Kafka.pdf",
      author: "Jay Kreps, Neha Narkhede, and Jun Rao",
    },
    {
      title: "RFC 6455 The WebSocket Protocol",
      kind: "Docs",
      url: "https://www.rfc-editor.org/rfc/rfc6455",
      author: "IETF",
    },
  ],
};
