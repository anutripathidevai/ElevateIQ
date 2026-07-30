import type { SDQuestionContent } from "../types";

export const notificationServiceContent: SDQuestionContent = {
  slug: "notification-service",
  statementMD: `
Design a Notification Service that can send push, email, SMS, and in-app notifications for products such as marketplaces, social networks, ride sharing apps, and enterprise SaaS. The system exposes a channel-agnostic ingestion API, accepts notification requests from many internal services, applies templates and user preferences, queues work durably, and delivers through providers such as APNs, FCM, SES, SendGrid, and SMS gateways.

At interview scale, assume billions of notifications per day, spiky campaign traffic, provider rate limits, retries, and a mix of high-priority transactional notifications and low-priority marketing notifications. The hard part is not sending one message; it is preventing duplicate sends, respecting preferences and quiet hours, isolating provider failures, tracking delivery states, and scaling fanout without letting campaigns starve transactional traffic.

The default design should optimize for durable accepted requests, asynchronous delivery, clear priority isolation, compliance, and operational control. Exact delivery is impossible because external providers and client devices are unreliable, so the system should provide at-least-once processing internally, idempotent dispatch, best-effort provider delivery, and transparent status tracking.
`,
  businessUseCaseMD: `
Notifications drive user engagement and trust. A ride app needs trip updates and driver arrival alerts, a marketplace needs order and fraud notifications, a social network needs mentions and connection updates, and a SaaS product needs billing, security, and collaboration alerts.

The platform also gives product teams a single place to manage templates, localization, user preferences, unsubscribe rules, provider choice, analytics, and compliance. Without a shared service, every product team reimplements retry logic, rate limits, and provider integrations inconsistently.
`,
  functionalRequirements: [
    "Accept notification requests through a channel-agnostic ingestion API with tenant, recipient, priority, template, payload, and idempotency key.",
    "Support push notifications through APNs and FCM, email through SES or SendGrid, SMS through provider gateways, and in-app delivery through WebSocket or mailbox storage.",
    "Render templates with localization, variables, versioning, and channel-specific layouts.",
    "Respect user preferences, subscriptions, unsubscribe choices, locale, timezone, and quiet hours.",
    "Fan out high-volume campaigns to large audiences without blocking transactional notifications.",
    "Deduplicate requests and delivery jobs using idempotency keys and notification identifiers.",
    "Retry transient failures with exponential backoff, jitter, provider failover, and dead-letter handling.",
    "Track accepted, rendered, sent, delivered, bounced, opened, clicked, unsubscribed, failed, and suppressed events for analytics and audit.",
  ],
  nonFunctionalRequirements: [
    {
      label: "Latency",
      detailMD: `
The ingestion API should acknowledge durable acceptance in under 100ms to 200ms p99 for normal traffic. Transactional delivery should usually start within seconds, while marketing campaigns can be scheduled and rate-limited over minutes or hours.
`,
    },
    {
      label: "Availability",
      detailMD: `
Notification acceptance and transactional dispatch should target 99.99 percent availability. Provider outages must not take down ingestion; the system should queue, retry, fail over, or degrade channel by channel.
`,
    },
    {
      label: "Scalability",
      detailMD: `
The platform must handle billions of notifications per day and sudden spikes from campaigns, incidents, or viral events. Queues, workers, template rendering, preference reads, and provider adapters should scale horizontally and independently per channel and priority.
`,
    },
    {
      label: "Durability",
      detailMD: `
Once the API accepts a notification, the request and enough metadata to retry it must be durably stored before returning success. Losing accepted transactional notifications breaks user trust and can create compliance or safety incidents.
`,
    },
    {
      label: "Idempotency",
      detailMD: `
Clients retry API calls, queues redeliver messages, and provider calls time out. The design needs idempotency keys, dedupe windows, stable notification IDs, and provider message IDs so retries do not produce duplicate user-visible messages.
`,
    },
    {
      label: "Compliance",
      detailMD: `
The system must enforce unsubscribe, opt-in, GDPR deletion, retention, consent, and country-specific SMS and email rules. Compliance checks must happen before dispatch, not only during analytics cleanup.
`,
    },
    {
      label: "Observability",
      detailMD: `
Operators need visibility into queue lag, provider error rates, suppression reasons, retry counts, template failures, delivery receipts, and campaign progress. Analytics should be rich but should not block delivery.
`,
    },
  ],
  capacityEstimation: {
    assumptionsMD: `
Assume 300M daily active users, an average of 20 logical notifications per active user per day, and a peak multiplier of 20x during campaigns, incidents, and regional spikes. That gives 6B logical notifications per day before retries.

Assume channel mix is 65 percent push, 20 percent email, 5 percent SMS, and 10 percent in-app. Average logical notification metadata and rendered payload references are 1 KB, average delivery status event is 400 bytes, and each logical notification produces 2.5 status events on average including accepted, sent, delivered or failed, and engagement events. Retries add 15 percent more provider attempts on average, but more during incidents.
`,
    metrics: [
      {
        label: "Logical notifications",
        value: "6B per day",
        note: "300M daily active users times 20 notifications per day",
      },
      {
        label: "Average ingestion QPS",
        value: "69,500 requests per second",
        note: "6B divided by 86,400 seconds",
      },
      {
        label: "Peak ingestion QPS",
        value: "1.39M requests per second",
        note: "20x average peak during campaigns or incidents",
      },
      {
        label: "Provider attempts",
        value: "6.9B per day",
        note: "6B logical notifications plus 15 percent retry overhead",
      },
      {
        label: "Push volume",
        value: "3.9B per day",
        note: "65 percent of logical notifications",
      },
      {
        label: "Email volume",
        value: "1.2B per day",
        note: "20 percent of logical notifications",
      },
      {
        label: "SMS volume",
        value: "300M per day",
        note: "5 percent of logical notifications, usually the most expensive channel",
      },
      {
        label: "Queue ingress",
        value: "6 TB per day raw",
        note: "6B logical jobs times 1 KB before replication and queue overhead",
      },
      {
        label: "Status events",
        value: "15B events per day",
        note: "2.5 tracking events per logical notification",
      },
      {
        label: "Tracking storage",
        value: "6 TB per day raw",
        note: "15B events times 400 bytes before compression, indexes, and replicas",
      },
      {
        label: "Preference storage",
        value: "2 TB raw",
        note: "1B users times roughly 2 KB of preferences, subscriptions, locale, timezone, and consent metadata",
      },
    ],
    calculationsMD: `
- Logical notifications: 300M daily active users times 20 notifications per day is 6B per day.
- Average ingestion QPS: 6B divided by 86,400 seconds is about 69,444 per second, rounded to 69,500.
- Peak ingestion QPS: a 20x burst multiplier gives about 1.39M notifications per second.
- Channel split: 65 percent push is 3.9B per day, 20 percent email is 1.2B per day, 5 percent SMS is 300M per day, and 10 percent in-app is 600M per day.
- Retry overhead: if transient failures add 15 percent more attempts, 6B logical notifications become 6.9B provider attempts per day.
- Queue ingress: 6B jobs times 1 KB is 6 TB raw per day. With replication, headers, and retention, provision several times that amount.
- Status events: 6B logical notifications times 2.5 events each is 15B status events per day.
- Tracking storage: 15B events times 400 bytes is 6 TB raw per day. Compression helps, but indexes and replication add overhead.
- Preferences: 1B users times 2 KB is about 2 TB raw. Hot preference cache size depends on active users and campaign fanout patterns.
`,
  },
  apiDesign: {
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/notifications",
        descriptionMD: `
Accepts one notification request for one recipient or a small explicit recipient list. The request is channel-agnostic; downstream policy chooses eligible channels and provider adapters.
`,
        request: `
{
  "tenantId": "marketplace",
  "idempotencyKey": "order-9821-shipped-user-123",
  "priority": "transactional",
  "templateId": "order_shipped",
  "locale": "en-US",
  "recipient": {
    "userId": "user_123",
    "email": "pat@example.com",
    "phone": "+14155550123",
    "deviceTokens": ["fcm_token_1"]
  },
  "channels": ["push", "email"],
  "variables": {
    "orderId": "9821",
    "trackingUrl": "https://example.com/track/9821"
  },
  "sendAfter": "2026-07-26T07:00:00Z"
}
`,
        response: `
{
  "notificationId": "notif_7d4c",
  "status": "accepted",
  "deduped": false,
  "acceptedAt": "2026-07-26T07:00:00Z"
}
`,
        statusCodes: [
          { code: 202, meaning: "Accepted and durably queued" },
          { code: 400, meaning: "Invalid template, recipient, channel, or variables" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Tenant is not allowed to use the requested channel" },
          { code: 409, meaning: "Conflicting idempotency key payload" },
          { code: 429, meaning: "Tenant or client rate limit exceeded" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/campaigns",
        descriptionMD: `
Creates a high-volume campaign that targets an audience segment. The service stores campaign metadata and lets fanout workers expand the audience asynchronously into per-recipient jobs.
`,
        request: `
{
  "tenantId": "marketplace",
  "campaignId": "summer_sale_2026",
  "priority": "marketing",
  "templateId": "sale_announcement",
  "audience": {
    "segmentId": "buyers_us_active_90d"
  },
  "channels": ["push", "email"],
  "schedule": {
    "startAt": "2026-07-27T15:00:00Z",
    "maxPerMinute": 1000000
  }
}
`,
        response: `
{
  "campaignId": "summer_sale_2026",
  "status": "scheduled",
  "estimatedRecipients": 85000000
}
`,
        statusCodes: [
          { code: 202, meaning: "Campaign scheduled for asynchronous fanout" },
          { code: 400, meaning: "Invalid campaign, segment, schedule, or template" },
          { code: 403, meaning: "Tenant lacks campaign permission" },
          { code: 409, meaning: "Campaign ID already exists" },
          { code: 429, meaning: "Campaign creation limit exceeded" },
        ],
      },
      {
        method: "PATCH",
        path: "/api/v1/users/{userId}/notification-preferences",
        descriptionMD: `
Updates user-level channel preferences, subscriptions, quiet hours, locale, timezone, and unsubscribe choices. Preference changes must affect future dispatch quickly.
`,
        request: `
{
  "locale": "en-US",
  "timezone": "America/Los_Angeles",
  "quietHours": {
    "start": "22:00",
    "end": "07:00"
  },
  "channels": {
    "push": true,
    "email": true,
    "sms": false,
    "inApp": true
  },
  "subscriptions": {
    "marketing": false,
    "orderUpdates": true,
    "security": true
  }
}
`,
        response: `
{
  "userId": "user_123",
  "status": "updated",
  "updatedAt": "2026-07-26T07:01:00Z"
}
`,
        statusCodes: [
          { code: 200, meaning: "Preferences updated" },
          { code: 400, meaning: "Invalid preference shape" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Caller cannot update this user" },
          { code: 404, meaning: "User not found" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/notifications/{notificationId}",
        descriptionMD: `
Returns the current delivery state and attempt history for debugging, customer support, audit, or user-facing status pages.
`,
        response: `
{
  "notificationId": "notif_7d4c",
  "status": "partially_delivered",
  "channels": [
    {
      "channel": "push",
      "provider": "fcm",
      "status": "delivered",
      "providerMessageId": "projects/app/messages/123"
    },
    {
      "channel": "email",
      "provider": "ses",
      "status": "deferred",
      "nextRetryAt": "2026-07-26T07:05:00Z"
    }
  ]
}
`,
        statusCodes: [
          { code: 200, meaning: "Status returned" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Caller cannot access this notification" },
          { code: 404, meaning: "Notification not found" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/provider-receipts/{provider}",
        descriptionMD: `
Receives provider callbacks for delivery, bounce, complaint, open, click, unsubscribe, and token invalidation events. The endpoint validates signatures and writes events to the tracking pipeline.
`,
        request: `
{
  "providerMessageId": "provider_msg_123",
  "eventType": "delivered",
  "occurredAt": "2026-07-26T07:02:00Z",
  "recipient": "pat@example.com",
  "metadata": {
    "smtpResponse": "250 OK"
  }
}
`,
        response: `
{
  "status": "accepted"
}
`,
        statusCodes: [
          { code: 202, meaning: "Receipt accepted" },
          { code: 400, meaning: "Invalid receipt payload" },
          { code: 401, meaning: "Invalid provider signature" },
          { code: 404, meaning: "Unknown provider route" },
        ],
      },
      {
        method: "DELETE",
        path: "/api/v1/users/{userId}/notification-data",
        descriptionMD: `
Starts GDPR deletion or anonymization for notification history, device tokens, and preference data where legally allowed. Some audit records may be retained with personal data removed.
`,
        response: `
{
  "userId": "user_123",
  "status": "deletion_requested",
  "requestedAt": "2026-07-26T07:03:00Z"
}
`,
        statusCodes: [
          { code: 202, meaning: "Deletion workflow started" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Caller cannot delete this user's data" },
          { code: 404, meaning: "User not found" },
        ],
      },
    ],
    notesMD: `
The API acknowledges durable acceptance, not final delivery. Delivery is asynchronous because provider latency, quiet hours, retries, and user device availability are outside the request path. Use idempotency keys on ingestion and stable provider receipt IDs on callbacks.
`,
  },
  databaseDesign: {
    schemaMD: `
The serving model separates durable notification intent from per-channel delivery attempts. A notification request captures who should be notified, why, with which priority and template. Delivery attempts capture each channel/provider try and can be retried independently.

Preferences and templates are read on the dispatch path, so they need cache-friendly keys and fast invalidation. High-volume tracking events should flow to an append-only event store and analytics pipeline, while relational or key-value tables keep the latest status and operational metadata.
`,
    tables: [
      {
        name: "notification_requests",
        columns: [
          { name: "notification_id", type: "uuid", note: "Primary key generated by the service" },
          { name: "tenant_id", type: "varchar(64)", note: "Product or business unit sending the notification" },
          { name: "idempotency_key", type: "varchar(256)", note: "Client-provided dedupe key scoped by tenant" },
          { name: "priority", type: "varchar(32)", note: "Transactional, high, normal, or marketing" },
          { name: "template_id", type: "varchar(128)", note: "Logical template name" },
          { name: "recipient_ref", type: "varchar(256)", note: "User ID or audience member reference" },
          { name: "channels", type: "json", note: "Requested channels and fallback order" },
          { name: "payload_ref", type: "varchar(512)", note: "Pointer to encrypted variables or payload blob" },
          { name: "status", type: "varchar(32)", note: "Accepted, rendering, queued, sent, partial, suppressed, failed" },
          { name: "created_at", type: "timestamp", note: "Acceptance time" },
          { name: "expires_at", type: "timestamp nullable", note: "Deadline after which delivery should stop" },
        ],
      },
      {
        name: "delivery_attempts",
        columns: [
          { name: "attempt_id", type: "uuid", note: "Primary key for a single channel/provider attempt" },
          { name: "notification_id", type: "uuid", note: "Parent notification request" },
          { name: "user_id", type: "varchar(128)", note: "Recipient, nullable for external contacts if policy allows" },
          { name: "channel", type: "varchar(32)", note: "Push, email, sms, or in_app" },
          { name: "provider", type: "varchar(64)", note: "FCM, APNs, SES, SendGrid, Twilio, or internal" },
          { name: "provider_message_id", type: "varchar(256) nullable", note: "Provider receipt correlation key" },
          { name: "attempt_number", type: "int", note: "Retry count starting at one" },
          { name: "status", type: "varchar(32)", note: "Queued, sent, delivered, bounced, throttled, failed, dead_lettered" },
          { name: "scheduled_at", type: "timestamp", note: "When this attempt becomes eligible to run" },
          { name: "sent_at", type: "timestamp nullable", note: "When the provider accepted the attempt" },
          { name: "last_error_code", type: "varchar(128) nullable", note: "Provider or internal error code" },
        ],
      },
      {
        name: "user_preferences",
        columns: [
          { name: "user_id", type: "varchar(128)", note: "Primary key" },
          { name: "tenant_id", type: "varchar(64)", note: "Tenant scope for multi-tenant products" },
          { name: "locale", type: "varchar(16)", note: "Preferred language and region" },
          { name: "timezone", type: "varchar(64)", note: "Used for quiet hours and scheduling" },
          { name: "channel_preferences", type: "json", note: "Per-channel opt-in and opt-out settings" },
          { name: "subscriptions", type: "json", note: "Topic and notification-type subscriptions" },
          { name: "quiet_hours", type: "json", note: "Local time windows for non-urgent notifications" },
          { name: "consent_version", type: "varchar(64)", note: "Latest consent policy accepted by the user" },
          { name: "gdpr_deleted_at", type: "timestamp nullable", note: "Set when personal data must no longer be used" },
          { name: "updated_at", type: "timestamp", note: "Cache invalidation version source" },
        ],
      },
      {
        name: "templates",
        columns: [
          { name: "template_id", type: "varchar(128)", note: "Logical template name" },
          { name: "tenant_id", type: "varchar(64)", note: "Owner tenant" },
          { name: "version", type: "int", note: "Immutable version number" },
          { name: "locale", type: "varchar(16)", note: "Language and region variant" },
          { name: "channel", type: "varchar(32)", note: "Push, email, sms, or in_app" },
          { name: "subject", type: "text nullable", note: "Email subject or push title" },
          { name: "body_uri", type: "varchar(512)", note: "Pointer to rendered template body in object storage or CMS" },
          { name: "variables_schema", type: "json", note: "Allowed variables and validation rules" },
          { name: "status", type: "varchar(32)", note: "Draft, active, deprecated, blocked" },
          { name: "updated_at", type: "timestamp", note: "Version cache invalidation timestamp" },
        ],
      },
    ],
    indexesMD: `
- **notification_requests.tenant_id, idempotency_key** must be unique for the idempotency window.
- **notification_requests.created_at** and **tenant_id, created_at** support audit and operational queries.
- **delivery_attempts.notification_id** supports status lookup for one notification.
- **delivery_attempts.provider_message_id** supports provider receipt correlation.
- **delivery_attempts.status, scheduled_at** supports retry workers finding due attempts if the queue needs repair.
- **user_preferences.user_id** is the primary read key; **updated_at** drives cache invalidation.
- **templates.template_id, tenant_id, locale, channel, version** supports deterministic template lookup.
`,
    relationshipsMD: `
One notification request can create multiple delivery attempts, one per selected channel and retry. User preferences influence whether attempts are created or suppressed. Templates are immutable by version so in-flight notifications can be audited against the exact content that was rendered.
`,
    noSqlAlternativesMD: `
At high scale, keep recent notification status in a wide-column or key-value store keyed by notification_id and partitioned by tenant. Store delivery attempts in an append-friendly table keyed by notification_id plus attempt_id, with a secondary lookup by provider_message_id for receipts.

Queues hold the operational source of work. Analytics events belong in Kafka, Kinesis, Pub/Sub, or another log, then flow to OLAP storage such as ClickHouse, Druid, BigQuery, or Snowflake. User preferences can live in DynamoDB, Cassandra, Spanner, or a sharded relational store with Redis in front for hot reads during fanout.
`,
  },
  architecture: {
    width: 1060,
    height: 560,
    nodes: [
      { id: "clients", label: "Product Services", kind: "client", x: 80, y: 200, sublabel: "Orders, social, billing" },
      { id: "api-gateway", label: "API Gateway", kind: "gateway", x: 230, y: 200, sublabel: "Auth, quotas" },
      { id: "notification-api", label: "Notification API", kind: "service", x: 400, y: 200, sublabel: "Validate, persist, enqueue" },
      { id: "config-store", label: "Preferences and Templates", kind: "database", x: 585, y: 85, sublabel: "User prefs, templates" },
      { id: "dedupe-cache", label: "Dedupe and Rate Cache", kind: "cache", x: 585, y: 205, sublabel: "Redis, token buckets" },
      { id: "priority-queues", label: "Priority Queues", kind: "queue", x: 585, y: 335, sublabel: "Transactional, marketing" },
      { id: "fanout-workers", label: "Fanout Workers", kind: "worker", x: 780, y: 130, sublabel: "Campaign expansion" },
      { id: "dispatch-workers", label: "Dispatch Workers", kind: "worker", x: 780, y: 335, sublabel: "Render, policy, retry" },
      { id: "provider-adapters", label: "Channel Adapters", kind: "service", x: 950, y: 265, sublabel: "Push, email, SMS, in-app" },
      { id: "external-providers", label: "External Providers", kind: "external", x: 950, y: 95, sublabel: "APNs, FCM, SES, SMS" },
      { id: "tracking-analytics", label: "Tracking and Analytics", kind: "analytics", x: 950, y: 455, sublabel: "Receipts, dashboards" },
    ],
    edges: [
      { from: "clients", to: "api-gateway", label: "send request" },
      { from: "api-gateway", to: "notification-api", label: "auth and route" },
      { from: "notification-api", to: "config-store", label: "template and preference lookup" },
      { from: "notification-api", to: "dedupe-cache", label: "idempotency and quotas" },
      { from: "notification-api", to: "priority-queues", label: "durable enqueue" },
      { from: "notification-api", to: "tracking-analytics", label: "accepted event", dashed: true },
      { from: "priority-queues", to: "fanout-workers", label: "campaign jobs" },
      { from: "fanout-workers", to: "config-store", label: "segments and preferences" },
      { from: "fanout-workers", to: "priority-queues", label: "per-recipient jobs", dashed: true },
      { from: "priority-queues", to: "dispatch-workers", label: "delivery jobs" },
      { from: "dispatch-workers", to: "config-store", label: "render and policy" },
      { from: "dispatch-workers", to: "dedupe-cache", label: "rate limit and dedupe" },
      { from: "dispatch-workers", to: "provider-adapters", label: "normalized send" },
      { from: "provider-adapters", to: "external-providers", label: "provider API call" },
      { from: "external-providers", to: "provider-adapters", label: "receipts", dashed: true },
      { from: "provider-adapters", to: "tracking-analytics", label: "status events", dashed: true },
    ],
    captionMD: `
The critical path is durable acceptance into priority queues. Delivery then happens asynchronously through fanout workers, dispatch workers, channel adapters, and external providers, while tracking events flow to analytics.
`,
  },
  architectureNotesMD: `
The architecture deliberately separates ingestion from delivery. The Notification API authenticates callers, validates templates and payloads, checks idempotency, persists the request, and enqueues work into priority queues. This lets callers retry safely and prevents slow providers from blocking product services.

Priority queues isolate transactional traffic from marketing campaigns. Fanout workers expand large audiences into per-recipient jobs at controlled rates, while dispatch workers apply preferences, quiet hours, localization, dedupe, provider quotas, and retry policy. Channel adapters hide provider-specific APIs and normalize receipts.

Tracking and analytics are asynchronous. They provide dashboards, delivery status, provider health, and campaign metrics, but delivery should not depend on analytics storage being healthy.
`,
  requestFlow: [
    {
      title: "Client submits a notification",
      detailMD: `
An internal product service calls **POST /api/v1/notifications** with tenant, recipient, template, variables, requested channels, priority, and an idempotency key. The API gateway authenticates the caller and applies coarse tenant quotas.
`,
    },
    {
      title: "API validates and deduplicates",
      detailMD: `
The Notification API validates the template ID, payload schema, recipient fields, priority, and allowed channels. It checks the idempotency key scoped by tenant. If the same key and payload were already accepted, it returns the original notification ID instead of creating duplicate work.
`,
    },
    {
      title: "Request is persisted and enqueued",
      detailMD: `
The service writes the notification request and minimal payload reference durably, then publishes a job to the correct priority queue. The client receives 202 Accepted after the queue write is durable, not after provider delivery.
`,
    },
    {
      title: "Campaign fanout expands audiences",
      detailMD: `
For campaigns, fanout workers read the audience segment in shards, apply coarse suppression rules, and create per-recipient jobs gradually. They respect campaign send rate, tenant budgets, and queue backpressure so a huge campaign does not flood workers.
`,
    },
    {
      title: "Dispatch worker applies policy",
      detailMD: `
A dispatch worker consumes a delivery job, reads user preferences and template version, checks unsubscribe and quiet hours, chooses channels, and either suppresses, schedules for later, or proceeds to rendering.
`,
    },
    {
      title: "Template is rendered and localized",
      detailMD: `
The worker renders channel-specific content using locale fallback, validates required variables, enforces size limits, and strips unsafe content. Rendering failures are recorded as terminal or retryable depending on the cause.
`,
    },
    {
      title: "Provider adapter sends the message",
      detailMD: `
The worker calls a normalized channel adapter. The adapter enforces per-provider token buckets, chooses a healthy provider, sends the request, records the provider message ID, and returns accepted, retryable failure, or terminal failure.
`,
    },
    {
      title: "Retries and failover are scheduled",
      detailMD: `
Transient errors such as timeouts, throttling, or 5xx responses are retried with exponential backoff and jitter. If the primary provider is unhealthy, the adapter can fail over to a secondary provider when compliance, cost, and message semantics allow it.
`,
    },
    {
      title: "Receipts and analytics update state",
      detailMD: `
Providers later send delivery, bounce, complaint, token invalidation, open, click, or unsubscribe callbacks. The receipt endpoint validates signatures, emits tracking events, updates latest status, invalidates dead device tokens, and feeds analytics dashboards.
`,
    },
  ],
  coreComponents: [
    {
      name: "Notification API",
      kind: "service",
      role: "Accepts channel-agnostic notification requests and makes them durable.",
      detailMD: `
This stateless API validates callers, schemas, templates, priorities, channels, and idempotency keys. It persists accepted requests, enqueues jobs, and returns a stable notification ID. It should not call external providers synchronously.
`,
    },
    {
      name: "Preference and Template Store",
      kind: "database",
      role: "Stores user policy and reusable content definitions.",
      detailMD: `
Preferences include channel opt-ins, subscriptions, quiet hours, locale, timezone, consent, and GDPR deletion flags. Templates are immutable by version and vary by tenant, locale, and channel. Both are heavily cached because fanout can create massive read bursts.
`,
    },
    {
      name: "Priority Queues",
      kind: "queue",
      role: "Buffer accepted work and isolate traffic classes.",
      detailMD: `
Use separate queues or weighted partitions for transactional, high-priority, normal, and marketing traffic. Queue metadata should include due time, priority, tenant, channel, attempt number, and dedupe identifiers. Delayed queues or scheduled topics support quiet hours and backoff.
`,
    },
    {
      name: "Fanout Workers",
      kind: "worker",
      role: "Expand campaigns and audience segments into per-recipient delivery jobs.",
      detailMD: `
Fanout workers shard audience scans, apply tenant and campaign send rates, skip clearly ineligible users, and enqueue per-recipient jobs gradually. They checkpoint progress so a worker crash does not restart an entire 100M recipient campaign from the beginning.
`,
    },
    {
      name: "Dispatch Workers",
      kind: "worker",
      role: "Apply policy, render content, and execute retry decisions.",
      detailMD: `
Dispatch workers consume queue jobs, load preferences and templates, enforce compliance, render content, choose channels, and call adapters. They are scaled independently by priority and channel so SMS throttling does not slow push or email.
`,
    },
    {
      name: "Channel Adapters",
      kind: "service",
      role: "Normalize provider APIs and hide channel-specific details.",
      detailMD: `
Adapters encapsulate APNs, FCM, SES, SendGrid, SMS providers, and in-app/WebSocket delivery. They translate payload formats, manage provider credentials, enforce provider quotas, map provider errors into common categories, and correlate provider message IDs with internal attempts.
`,
    },
    {
      name: "Dedupe and Rate Limiter",
      kind: "cache",
      role: "Prevents duplicate sends and protects users and providers.",
      detailMD: `
Redis or a similar low-latency store maintains idempotency keys, per-user notification budgets, per-tenant quotas, per-provider token buckets, and short-lived suppression records. Durable tables backstop longer dedupe windows when needed.
`,
    },
    {
      name: "Tracking and Analytics Pipeline",
      kind: "analytics",
      role: "Collects status events, receipts, and campaign metrics.",
      detailMD: `
The pipeline ingests accepted, rendered, suppressed, sent, delivered, bounced, opened, clicked, and unsubscribed events. It updates latest status for support use cases and aggregates metrics for product teams without blocking dispatch workers.
`,
    },
  ],
  deepDives: [
    {
      topic: "Channel-agnostic ingestion versus channel-specific dispatch",
      detailMD: `
A clean design accepts a logical notification intent first: who should receive something, why, how urgent it is, which template to use, and which channels are allowed. This lets product services stay independent of APNs payload rules, email headers, SMS character limits, and WebSocket session state.

Dispatch is where channel-specific behavior belongs. Push payloads need device tokens, platform-specific fields, collapse keys, and token cleanup. Email needs subject, HTML and text bodies, bounce handling, complaint handling, and unsubscribe headers. SMS needs strict length control, country rules, sender IDs, and cost controls. In-app needs mailbox persistence or online WebSocket delivery.

The boundary is important in interviews. If callers send provider-specific payloads directly, the platform cannot centralize preference enforcement, localization, fallback, analytics, or provider failover. If the core API hides every channel detail, it still needs extensible channel options for legitimate provider features.
`,
    },
    {
      topic: "Fanout for high-volume campaigns",
      detailMD: `
Campaigns are dangerous because one API call can create tens or hundreds of millions of recipient jobs. Do not enqueue all recipients in one transaction or scan the audience from a single worker. Store campaign metadata, split the audience into shards, and let fanout workers checkpoint progress per shard.

Fanout should be paced by campaign budget, tenant quota, queue lag, provider quota, and time windows. A campaign for 100M users may need to run over hours to avoid provider throttling and user fatigue. Transactional queues must have reserved worker capacity so password reset or order updates are not stuck behind marketing sends.

Deduplication is also a fanout concern. The same user may appear in multiple segments or devices. Use campaign_id plus user_id plus notification_type as a dedupe key when product semantics require one message per user.
`,
    },
    {
      topic: "Preferences, subscriptions, quiet hours, and compliance",
      detailMD: `
Preference enforcement must happen close to dispatch because user choices can change after ingestion but before delivery. The worker should read the current preference version and evaluate channel opt-in, topic subscription, quiet hours, timezone, age restrictions, country rules, and GDPR deletion flags.

Quiet hours are not always terminal suppression. A marketing push can be rescheduled until the next allowed local window, while a security alert or delivery driver arrival may bypass quiet hours based on policy. The request should include priority and notification type so the policy engine can make that distinction.

Unsubscribe and consent rules need special care. Email marketing must honor unsubscribe headers and suppression lists. SMS often needs explicit opt-in and STOP handling. GDPR deletion should remove or anonymize personal data from preferences, device tokens, and historical analytics according to retention policy.
`,
    },
    {
      topic: "Idempotency, dedupe, and exactly-once myths",
      detailMD: `
Exactly-once delivery to users is not realistic. Clients retry API calls, queues redeliver messages, workers crash after provider calls, provider responses time out, and devices may show or drop notifications unpredictably. The practical goal is at-least-once internal processing with idempotent side effects and strong duplicate suppression.

On ingestion, use tenant_id plus idempotency_key to return the same notification_id for retried requests. On dispatch, use notification_id plus channel plus recipient plus attempt semantics to avoid sending the same user-visible message twice. If a provider call times out after the provider accepted it, the adapter should correlate provider_message_id when available and apply cautious retry policy.

Dedupe windows differ by use case. Password reset may allow a short resend window, order shipped should dedupe per order state transition, and daily digest should dedupe per day. The design should make dedupe keys explicit rather than guessing from rendered content.
`,
    },
    {
      topic: "Rate limiting, retries, backoff, and provider failover",
      detailMD: `
There are multiple rate limits: per-user to prevent spam, per-tenant to enforce fairness, per-campaign to smooth fanout, and per-provider to stay within APNs, FCM, email, or SMS quotas. Token buckets in Redis work well for fast decisions, backed by configuration stored durably.

Retries should be based on error class. Retry timeouts, 429, and 5xx with exponential backoff and jitter. Do not retry invalid tokens, unsubscribed recipients, malformed payloads, or permanent bounces. Put attempts that exceed retry limits into a dead-letter queue with enough context for replay after fixes.

Failover is not always safe. Email can often fail over from SES to SendGrid if sender reputation, DKIM, and unsubscribe state are aligned. SMS failover may change sender identity or cost. Push failover is limited because APNs and FCM are platform-specific. A good answer describes channel-specific failover constraints.
`,
    },
    {
      topic: "Delivery tracking and analytics",
      detailMD: `
A notification has multiple states. Accepted means the platform durably received the request. Sent means a provider accepted an API call. Delivered usually means the provider or device reported delivery, which is not available for every channel. Opened and clicked are engagement events and may be sampled or delayed.

Track events append-only, then compute latest status and aggregates asynchronously. This supports audit and analytics without turning the dispatch path into a transactional analytics workflow. Correlate events using notification_id, attempt_id, provider_message_id, user_id, campaign_id, channel, provider, and template version.

Analytics must tolerate duplicates and late arrivals because providers may retry webhooks. Use receipt IDs or provider message IDs for dedupe, watermark late events, and surface freshness in dashboards. For privacy, avoid storing raw IPs or full message bodies in analytics unless necessary.
`,
    },
  ],
  scaling: [
    {
      stage: "Prototype: one service and one queue",
      detailMD: `
Start with a Notification API, a relational database, one durable queue, a small worker fleet, and one provider per channel. Implement idempotency, templates, preferences, and basic status tracking from the beginning because retrofitting them after duplicate sends is painful.
`,
    },
    {
      stage: "Growth: separate channels and priorities",
      detailMD: `
Split queues and workers by priority and channel. Add Redis for idempotency, preference caching, and rate limiting. Add provider adapters, retry queues, dead-letter queues, and dashboards for queue lag, send rate, and error categories.
`,
    },
    {
      stage: "Large scale: campaign fanout and distributed stores",
      detailMD: `
Introduce campaign metadata, sharded fanout workers, checkpointed audience scans, per-tenant quotas, and distributed storage for preferences and status. Keep transactional capacity reserved and use backpressure so marketing work expands only as fast as downstream queues can absorb it.
`,
    },
    {
      stage: "Global scale: regional dispatch and provider routing",
      detailMD: `
Run ingestion and dispatch in multiple regions. Route users to nearby regions for in-app/WebSocket and route provider traffic based on channel, geography, compliance, and provider health. Replicate preferences and templates globally with versioning and clear consistency expectations.
`,
    },
    {
      stage: "Extreme scale: automated control plane",
      detailMD: `
Add automated provider health scoring, adaptive rate limits, campaign pacing, anomaly detection, template safety checks, privacy workflows, and self-service tenant controls. At this stage, operating the platform safely is as important as raw send throughput.
`,
    },
  ],
  bottlenecks: [
    {
      issue: "Campaign fanout overwhelms queues",
      optimizationMD: `
Shard audience scans, checkpoint fanout progress, pace per campaign, and use queue backpressure. Reserve capacity for transactional queues and pause or slow marketing fanout when queue lag or provider throttling rises.
`,
    },
    {
      issue: "Provider rate limits and throttling",
      optimizationMD: `
Maintain per-provider and per-region token buckets, smooth traffic, classify retryable errors, and add jitter. Use secondary providers only when sender identity, compliance, and content semantics remain valid.
`,
    },
    {
      issue: "Preference store hot reads during large fanout",
      optimizationMD: `
Cache preferences by user and version, batch reads by shard, prefetch hot segments, and keep preference records small. Use invalidation streams so recent unsubscribe or GDPR updates reach dispatch quickly.
`,
    },
    {
      issue: "Template rendering CPU and payload size",
      optimizationMD: `
Precompile templates, cache active versions, validate schemas at publish time, enforce size limits per channel, and scale rendering workers independently. Reject or quarantine templates that create invalid provider payloads.
`,
    },
    {
      issue: "Retry storms during provider incidents",
      optimizationMD: `
Use exponential backoff, jitter, circuit breakers, retry budgets, and dead-letter queues. When a provider is down, slow new attempts instead of allowing every worker to retry aggressively.
`,
    },
    {
      issue: "High-cardinality analytics writes",
      optimizationMD: `
Append raw events to a log, aggregate asynchronously by tenant, campaign, channel, provider, and time bucket, and use sampling or approximate sketches where product requirements allow. Do not synchronously update dashboards from dispatch workers.
`,
    },
  ],
  failureHandling: [
    {
      scenario: "Primary email or SMS provider outage",
      strategyMD: `
Open a circuit breaker for the failing provider, slow or pause attempts, and route eligible traffic to a secondary provider. Preserve provider-specific compliance rules and avoid failover if it would violate opt-in, sender identity, or regional policy.
`,
    },
    {
      scenario: "Queue backlog grows rapidly",
      strategyMD: `
Autoscale workers, prioritize transactional queues, slow campaign fanout, shed low-priority marketing work if allowed, and expose delayed delivery status. Backpressure should reach campaign creation before storage or providers are overwhelmed.
`,
    },
    {
      scenario: "Preference store or cache is unavailable",
      strategyMD: `
Use short-lived cached preferences when safe, fail closed for marketing, and allow critical transactional notifications only if policy permits. Do not send messages that may violate unsubscribe or GDPR flags because preference data is unavailable.
`,
    },
    {
      scenario: "Template bug affects a live campaign",
      strategyMD: `
Version templates immutably, canary new templates, validate required variables before activation, and keep a kill switch to pause a campaign or block a template version. Already queued jobs should reference the exact version used for audit.
`,
    },
    {
      scenario: "Worker crashes after provider accepted a send",
      strategyMD: `
Record attempt state before and after provider calls, use provider_message_id when available, and retry cautiously with idempotency metadata. Reconciliation jobs can query providers or process receipts to repair uncertain states.
`,
    },
    {
      scenario: "Receipt endpoint receives duplicate or late callbacks",
      strategyMD: `
Validate signatures, dedupe by provider receipt ID or provider_message_id plus event type and timestamp, and process events idempotently. Late receipts should update analytics while respecting state transition rules.
`,
    },
  ],
  security: [
    {
      label: "Authentication and tenant isolation",
      detailMD: `
Only authorized services can send notifications for a tenant, template, or channel. Enforce tenant-scoped quotas, template ownership, provider credentials, and access to status or analytics data.
`,
    },
    {
      label: "PII protection",
      detailMD: `
Recipients, phone numbers, emails, device tokens, and template variables are sensitive. Encrypt payloads at rest, minimize what is written to logs, use access controls for support tools, and redact personal data in analytics where possible.
`,
    },
    {
      label: "Unsubscribe, consent, and GDPR",
      detailMD: `
Honor unsubscribe and STOP events quickly, store consent state with versioning, and delete or anonymize personal data according to GDPR workflows. Marketing should fail closed when consent state is uncertain.
`,
    },
    {
      label: "Template and content safety",
      detailMD: `
Validate templates at publish time, restrict unsafe HTML, prevent header injection in email, validate URLs, and apply tenant-specific branding rules. Template variables should be escaped according to channel.
`,
    },
    {
      label: "Provider credential security",
      detailMD: `
Store provider credentials in a secret manager, rotate keys, scope credentials per tenant or environment, and audit adapter access. Do not expose provider tokens to product services or client applications.
`,
    },
    {
      label: "Abuse and spam prevention",
      detailMD: `
Apply per-user, per-tenant, and per-channel limits, detect suspicious campaigns, and support manual or automated campaign review. SMS and email abuse can damage sender reputation and create direct cost.
`,
    },
  ],
  tradeoffs: {
    pros: [
      "Asynchronous queues decouple product services from slow or failing providers.",
      "Priority isolation protects transactional notifications from marketing campaigns.",
      "Centralized templates, preferences, and compliance reduce duplicate logic across teams.",
      "Provider adapters make failover and observability consistent across channels.",
      "Append-only tracking supports analytics, audit, and debugging without blocking delivery.",
    ],
    cons: [
      "Final delivery is eventually consistent and cannot be guaranteed for every channel.",
      "The platform has significant operational complexity around queues, retries, quotas, and providers.",
      "Preference and compliance reads can become expensive during large fanout.",
      "Provider failover can affect cost, sender reputation, and user experience.",
      "Strong dedupe across all retries and provider uncertainty is difficult to make perfect.",
    ],
    alternativesMD: `
Alternative one is direct provider integration from each product service. It is simple initially but leads to inconsistent templates, retries, compliance, and analytics.

Alternative two is a managed vendor such as Braze, Iterable, Customer.io, or Firebase for most messaging needs. This reduces engineering effort but may limit customization, data control, cost optimization, and deep product integration.

Alternative three is a pure event-bus model where product events are consumed by notification rules. This is powerful for automation, but it still needs the same dispatch, preference, dedupe, and provider layers underneath.
`,
    whenNotToUseMD: `
Do not build a full notification platform for a small product with one low-volume channel and no compliance complexity. A direct provider integration or managed notification tool is usually better until the organization needs shared templates, preference enforcement, fanout, multi-channel delivery, and operational analytics.
`,
  },
  followUpQuestions: [
    {
      question: "Why should ingestion return 202 Accepted instead of waiting for delivery?",
      answerMD: `
External providers and devices can be slow or unavailable, and quiet hours may delay delivery intentionally. Returning 202 after durable enqueue gives callers a reliable contract while allowing asynchronous retries, scheduling, and provider failover.
`,
    },
    {
      question: "How do you prevent duplicate notifications when clients retry?",
      answerMD: `
Require tenant-scoped idempotency keys on ingestion and store the original notification ID and payload hash for a dedupe window. If the same key and payload arrives again, return the original result. If the same key has a different payload, return a conflict.
`,
    },
    {
      question: "How should quiet hours work?",
      answerMD: `
Quiet hours should be evaluated in the user's timezone at dispatch time. Low-priority notifications can be delayed until the next allowed window, while security or transactional alerts may bypass quiet hours according to product policy and legal rules.
`,
    },
    {
      question: "How do you handle a provider timeout after sending?",
      answerMD: `
Treat the state as uncertain. If the provider supports idempotency or a provider message ID, use it to reconcile. Otherwise retry cautiously based on notification type and duplicate tolerance. For low-duplicate-tolerance channels such as SMS, prefer reconciliation or delayed retry over aggressive resend.
`,
    },
    {
      question: "How do you keep campaigns from starving transactional notifications?",
      answerMD: `
Use separate queues, reserved worker pools, weighted scheduling, campaign pacing, and backpressure. Transactional queues should have strict latency SLOs and capacity reservations, while marketing queues can be delayed or paused.
`,
    },
    {
      question: "Which delivery states are reliable?",
      answerMD: `
Accepted and queued are internal and reliable if the system is durable. Sent means the provider accepted the request. Delivered, opened, and clicked depend on provider and client behavior, so they are eventually consistent and sometimes unavailable.
`,
    },
    {
      question: "Where should unsubscribe be enforced?",
      answerMD: `
Unsubscribe should be enforced before dispatch and updated from provider receipts quickly. Email and SMS adapters should also add required unsubscribe metadata, but the core policy engine should suppress ineligible notifications before provider calls.
`,
    },
  ],
  companyVariations: [
    {
      company: "Amazon",
      angleMD: `
Amazon interviewers often emphasize operational excellence, DynamoDB-style scaling, SES integration, per-tenant quotas, alarms, cost controls, and blast-radius isolation. Be ready to explain durable queues, provider throttling, and how transactional notifications survive campaign spikes.
`,
    },
    {
      company: "Uber",
      angleMD: `
Uber may frame this around trip lifecycle alerts, driver and rider push/SMS, regional failover, and low-latency transactional delivery. Discuss priority isolation, SMS fallback for critical trip events, mobile push token management, and provider degradation during regional incidents.
`,
    },
    {
      company: "LinkedIn",
      angleMD: `
LinkedIn tends to probe feed, messaging, email digests, connection requests, and notification fatigue. Emphasize preference modeling, relevance, batching, digests, unsubscribe compliance, and analytics for opens, clicks, and suppressions.
`,
    },
    {
      company: "Airbnb",
      angleMD: `
Airbnb may focus on host and guest booking flows, trust and safety messages, localization, timezone-aware quiet hours, and global SMS/email reliability. Explain template localization, transactional versus promotional policy, and fallback when travelers are offline.
`,
    },
  ],
  relatedQuestions: [
    {
      slug: "distributed-queue",
      note: "Notification delivery relies on durable queues, delayed retries, backpressure, and dead-letter handling.",
    },
    {
      slug: "kafka",
      note: "Tracking events and receipts fit naturally into an append-only event log and analytics pipeline.",
    },
    {
      slug: "rate-limiter",
      note: "The service needs per-user, per-tenant, per-campaign, and per-provider rate limiting.",
    },
    {
      slug: "whatsapp",
      note: "Messaging systems share delivery receipts, fanout, device state, and notification reliability concerns.",
    },
  ],
  interviewTips: {
    commonMistakes: [
      "Calling APNs, FCM, email, or SMS providers synchronously from the ingestion API.",
      "Mixing transactional and marketing traffic in one queue with no priority isolation.",
      "Ignoring preferences, unsubscribe, quiet hours, and GDPR until after dispatch.",
      "Promising exactly-once user delivery instead of idempotent at-least-once processing.",
      "Retrying permanent provider failures such as invalid tokens or unsubscribed recipients.",
    ],
    redFlags: [
      "No capacity math for billions of notifications per day and spiky campaigns.",
      "No dedupe or idempotency strategy for client retries and queue redelivery.",
      "No plan for provider throttling, failover, or circuit breakers.",
      "No distinction between accepted, sent, delivered, opened, and clicked states.",
      "No compliance story for unsubscribe, consent, SMS opt-in, or data deletion.",
    ],
    expectations: [
      "Draw ingestion, durable queues, fanout, dispatch workers, provider adapters, and analytics separately.",
      "Explain priority queues and reserved capacity for transactional notifications.",
      "Compute average and peak QPS, queue volume, retry overhead, and tracking event volume.",
      "Discuss preferences, quiet hours, localization, and template versioning.",
      "Describe idempotency keys, dedupe windows, exponential backoff, jitter, and dead-letter queues.",
      "Call out provider-specific constraints for push, email, SMS, and in-app delivery.",
    ],
    communicationMD: `
Start by clarifying notification types, channels, and delivery guarantees. Then draw the ingestion path and explicitly say the API returns after durable enqueue, not after delivery. From there, layer in priority queues, fanout, policy checks, rendering, provider adapters, retries, receipts, and analytics. Keep returning to the core tradeoff: fast reliable acceptance and controlled asynchronous delivery are more realistic than pretending every provider send is immediate and exactly once.
`,
  },
  revisionNotesMD: `
- The Notification API should accept channel-agnostic requests, validate idempotency, persist intent, enqueue work, and return 202 Accepted.
- At 300M daily active users and 20 notifications each, plan for 6B logical notifications per day, about 69,500 average ingestion QPS, and about 1.39M peak QPS at 20x.
- Separate transactional and marketing queues. Reserve capacity for urgent notifications and pace campaigns with backpressure.
- Fanout workers expand large audiences gradually and checkpoint progress. Do not enqueue 100M recipient jobs in one synchronous request.
- Dispatch workers enforce preferences, subscriptions, quiet hours, locale, consent, GDPR flags, and channel policy before provider calls.
- Templates should be versioned and localized. Store enough version metadata to audit exactly what was sent.
- Use idempotency keys at ingestion and dedupe keys at dispatch. Exactly-once user delivery is not realistic.
- Retry transient failures with exponential backoff and jitter. Do not retry permanent bounces, invalid tokens, malformed payloads, or unsubscribed recipients.
- Provider adapters normalize APNs, FCM, email, SMS, and in-app delivery, manage quotas, and map provider errors into common categories.
- Track accepted, queued, sent, delivered, bounced, opened, clicked, unsubscribed, suppressed, failed, and dead-lettered events asynchronously.
- Compliance is part of the hot dispatch decision, not an offline reporting feature.
`,
  flashcards: [
    {
      front: "Why should notification ingestion be asynchronous?",
      back: "Provider delivery can be slow, throttled, delayed by quiet hours, or unavailable. The API should return after durable enqueue and let workers deliver asynchronously.",
    },
    {
      front: "What is the main purpose of priority queues?",
      back: "They prevent marketing campaigns and bulk fanout from starving transactional notifications such as password resets, order updates, and safety alerts.",
    },
    {
      front: "What should an idempotency key be scoped by?",
      back: "At minimum by tenant and client-provided idempotency key, usually with a payload hash to detect conflicting retries.",
    },
    {
      front: "Why is exactly-once notification delivery unrealistic?",
      back: "Clients retry, queues redeliver, workers crash, provider calls time out, and devices may duplicate or drop messages. The practical goal is idempotent at-least-once processing with duplicate suppression.",
    },
    {
      front: "When should quiet hours be checked?",
      back: "At dispatch time using the user's current timezone and preferences, because settings may change after ingestion but before delivery.",
    },
    {
      front: "Which failures should not be retried?",
      back: "Invalid device tokens, permanent bounces, unsubscribed recipients, malformed payloads, and policy suppressions should be terminal rather than retried.",
    },
    {
      front: "What does sent mean versus delivered?",
      back: "Sent means the provider accepted the request. Delivered means a provider or device later reported delivery, which is channel-dependent and eventually consistent.",
    },
    {
      front: "Why version templates?",
      back: "Versioning makes sends auditable, allows safe rollout and rollback, and ensures in-flight jobs render with the intended content.",
    },
    {
      front: "What is provider failover constrained by?",
      back: "Channel semantics, sender identity, compliance, cost, credentials, provider-specific features, and whether failover could create duplicates or reputation issues.",
    },
  ],
  quiz: [
    {
      question: "What should the ingestion API return after it durably stores and queues a notification?",
      options: ["200 OK only after the user opens it", "202 Accepted with a notification ID", "301 Moved Permanently", "204 No Content with no tracking ID"],
      answerIndex: 1,
      explanationMD: `
Delivery is asynchronous and may be delayed by providers, retries, or quiet hours. 202 Accepted communicates that the platform durably accepted the request and provides a notification ID for tracking.
`,
    },
    {
      question: "What is the best way to protect transactional notifications during a huge marketing campaign?",
      options: ["Use one FIFO queue for every notification", "Disable retries for transactional notifications", "Use separate priority queues and reserved worker capacity", "Send all marketing notifications synchronously"],
      answerIndex: 2,
      explanationMD: `
Priority isolation and reserved capacity keep urgent work from waiting behind bulk marketing fanout. Campaigns can be paced or paused when downstream systems are saturated.
`,
    },
    {
      question: "Which provider result should usually be treated as terminal rather than retried?",
      options: ["HTTP 503 from an email provider", "Network timeout before any response", "Invalid push device token", "HTTP 429 throttling response"],
      answerIndex: 2,
      explanationMD: `
An invalid device token is a permanent error and should trigger token cleanup. 503, timeout, and 429 are often retryable with backoff or throttling.
`,
    },
    {
      question: "Why are idempotency keys required on notification ingestion?",
      options: ["They make provider delivery exactly once", "They let retried client requests return the same notification instead of creating duplicates", "They replace user preferences", "They remove the need for queues"],
      answerIndex: 1,
      explanationMD: `
Clients may retry after timeouts. A tenant-scoped idempotency key lets the API detect a duplicate request and return the original notification ID safely.
`,
    },
    {
      question: "Where should unsubscribe and quiet-hour checks happen?",
      options: ["Only in monthly analytics jobs", "Only inside external providers", "Before dispatch, using current preferences and policy", "After the provider reports delivered"],
      answerIndex: 2,
      explanationMD: `
Compliance and user preference checks must happen before provider calls. Analytics can report suppressions, but it cannot undo an already sent message.
`,
    },
    {
      question: "What is the safest retry pattern for transient provider failures?",
      options: ["Retry immediately in a tight loop", "Use exponential backoff with jitter and retry budgets", "Drop all transactional messages", "Switch every failed push notification to SMS"],
      answerIndex: 1,
      explanationMD: `
Backoff with jitter prevents retry storms and gives providers time to recover. Retry budgets, circuit breakers, and dead-letter queues keep failures bounded.
`,
    },
    {
      question: "What does a provider delivery receipt usually mean?",
      options: ["The user definitely read the message", "The notification was created exactly once", "The provider or device reported a channel-specific status asynchronously", "The system no longer needs analytics dedupe"],
      answerIndex: 2,
      explanationMD: `
Receipts are asynchronous and channel-specific. They may indicate delivery, bounce, complaint, open, click, or invalid token, but they are not a universal guarantee that the user read the message.
`,
    },
  ],
  cheatSheetMD: `
**Goal**: accept channel-agnostic notification requests, queue them durably, apply templates and preferences, deliver through push, email, SMS, and in-app channels, and track outcomes.

**Scale**: 300M daily active users times 20 notifications per day gives 6B logical notifications per day. Average ingestion is about 69,500 QPS, with 20x peaks around 1.39M QPS. Retry overhead can add 15 percent or more provider attempts.

**API contract**: return 202 Accepted after durable persistence and enqueue. Use tenant-scoped idempotency keys and stable notification IDs. Do not wait for provider delivery in the request path.

**Queues**: split by priority and channel. Reserve capacity for transactional notifications. Use delayed queues for quiet hours and retry backoff. Use dead-letter queues for exhausted or poisoned jobs.

**Fanout**: campaign creation stores metadata. Fanout workers shard audience scans, checkpoint progress, dedupe recipients, pace delivery, and emit per-recipient jobs gradually.

**Policy**: dispatch workers check preferences, subscriptions, unsubscribe, consent, timezone, quiet hours, GDPR flags, and notification type before rendering or sending.

**Templates**: version templates by tenant, locale, and channel. Validate variables at publish and render time. Enforce channel size limits and escaping rules.

**Providers**: adapters normalize APNs, FCM, SES, SendGrid, SMS, and in-app/WebSocket. Enforce per-provider token buckets, classify errors, handle credentials, and support cautious failover.

**Retries**: retry transient errors with exponential backoff and jitter. Do not retry invalid tokens, permanent bounces, unsubscribed users, malformed payloads, or policy suppressions.

**Tracking**: append accepted, queued, rendered, suppressed, sent, delivered, bounced, opened, clicked, unsubscribed, failed, and dead-lettered events. Update latest status and analytics asynchronously.

**Compliance**: unsubscribe, opt-in, STOP, GDPR deletion, retention, and audit are first-class requirements. Marketing should fail closed if consent is uncertain.
`,
  references: [
    {
      title: "Designing Data-Intensive Applications",
      kind: "Book",
      author: "Martin Kleppmann",
    },
    {
      title: "Enterprise Integration Patterns",
      kind: "Book",
      author: "Gregor Hohpe and Bobby Woolf",
    },
    {
      title: "Firebase Cloud Messaging Documentation",
      kind: "Docs",
      url: "https://firebase.google.com/docs/cloud-messaging",
      author: "Google",
    },
    {
      title: "Apple Push Notification Service Documentation",
      kind: "Docs",
      url: "https://developer.apple.com/documentation/usernotifications",
      author: "Apple",
    },
    {
      title: "Amazon Simple Email Service Developer Guide",
      kind: "Docs",
      url: "https://docs.aws.amazon.com/ses/latest/dg/Welcome.html",
      author: "Amazon Web Services",
    },
  ],
};
