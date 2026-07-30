import type { SDQuestionContent } from "../types";

export const googleCalendarContent: SDQuestionContent = {
  slug: "google-calendar",
  statementMD: `
Design Google Calendar: a shared calendar system where users create calendars, add single or recurring events, invite attendees, RSVP, query availability, receive reminders, and keep multiple devices synchronized.

At interview scale, assume hundreds of millions of active users, many subscribed calendars per user, heavy read traffic for day and week views, and correctness requirements that are easy to underestimate. The hard parts are not just storing events; they are representing recurring series, preserving timezone intent across daylight-saving transitions, keeping attendee state consistent, answering free/busy queries quickly, delivering reminders on time, enforcing calendar permissions, and giving every device an efficient incremental sync stream.

The default design should optimize for reliable event correctness first, then low-latency reads. Recurrence expansion, notification fan-out, search, analytics, and external calendar imports should be layered around a durable calendar data model rather than baked into the primary write transaction.
`,
  businessUseCaseMD: `
Calendars coordinate work, school, travel, family schedules, interviews, and on-call rotations. A product like Google Calendar becomes the shared source of truth for where people are expected to be and whether they are available.

For businesses, the calendar is also an integration platform. Meeting schedulers, video conferencing, rooms, email invitations, mobile push reminders, CRM workflows, and productivity tools all depend on a trustworthy event graph with clear permissions and predictable sync semantics.
`,
  functionalRequirements: [
    "Create, update, delete, and list calendars and events.",
    "Support one-off events and recurring events described by RRULE-style recurrence rules.",
    "Support exceptions to a recurring series, including edited instances and cancelled instances.",
    "Invite attendees, track per-attendee RSVP state, and notify attendees about changes.",
    "Query day, week, and month views across multiple calendars with expanded occurrences.",
    "Answer free/busy queries and detect conflicts for people and resources.",
    "Schedule reminders through email, push, and in-app notification channels.",
    "Synchronize changes across devices using incremental sync tokens.",
  ],
  nonFunctionalRequirements: [
    {
      label: "Latency",
      detailMD: `
Day and week views should render in under 200ms p99 for a typical user after authentication and network overhead. Event writes can target under 300ms p99 because they involve permission checks, attendee updates, and reminder scheduling. Free/busy queries for tens of attendees should usually complete under 500ms.
`,
    },
    {
      label: "Availability",
      detailMD: `
Calendar reads and reminder delivery are user-visible daily workflows. The core event read path should target 99.99 percent availability, while non-critical features such as search indexing, analytics, and some external calendar imports can degrade without preventing users from seeing their schedules.
`,
    },
    {
      label: "Consistency",
      detailMD: `
Users expect read-after-write on their own events and invitations. Attendees should eventually converge to the same event sequence and RSVP state, but the organizer write should remain the authoritative source for event details unless the product explicitly supports attendee-local notes or private copies.
`,
    },
    {
      label: "Timezone correctness",
      detailMD: `
The system must preserve the originating IANA timezone and local wall-clock intent, not only UTC instants. A weekly 9 AM meeting in America/Los_Angeles should remain 9 AM local time across daylight-saving changes even though the corresponding UTC offset changes.
`,
    },
    {
      label: "Scalability",
      detailMD: `
Reads dominate writes because users open day and week views many times per day. Scale the expanded event read path, free/busy aggregation, sync tokens, and reminder fan-out independently from the primary event write path.
`,
    },
    {
      label: "Durability",
      detailMD: `
Events are personal and business-critical records. Persist event mutations, attendee state, ACL changes, and sync change-log entries durably before acknowledging success. Reminder tasks can be reconstructed from events but should still be stored durably for timely delivery.
`,
    },
    {
      label: "Privacy and authorization",
      detailMD: `
Calendars frequently contain sensitive information. Every read must enforce calendar ACLs, event visibility, attendee privacy, resource permissions, and tenant or enterprise policy. Free/busy can expose busy intervals without exposing titles or descriptions.
`,
    },
  ],
  capacityEstimation: {
    assumptionsMD: `
Assume 500M monthly active users, 100M daily active users, an average of 8 visible calendars per daily user including owned, shared, holidays, and subscriptions, and 300 retained event records per active user after compacting old data into colder storage.

Assume 25M event creates, updates, deletes, and exception writes per day, 50M RSVP updates per day, 1B day or week view reads per day, 120M free/busy queries per day, 600M reminder triggers per day, and a peak multiplier of 10x over average. A stored event or override averages about 1 KB before indexes, while attendee rows average about 200 bytes.
`,
    metrics: [
      {
        label: "Monthly active users",
        value: "500M users",
        note: "Large consumer calendar scale with many mobile devices",
      },
      {
        label: "Average event write QPS",
        value: "290 writes per second",
        note: "25M event mutations divided by 86,400 seconds",
      },
      {
        label: "Peak event write QPS",
        value: "2,900 writes per second",
        note: "10x average peak",
      },
      {
        label: "Average RSVP write QPS",
        value: "580 writes per second",
        note: "50M attendee responses divided by 86,400 seconds",
      },
      {
        label: "Average day or week read QPS",
        value: "11,600 reads per second",
        note: "1B calendar view reads per day",
      },
      {
        label: "Peak day or week read QPS",
        value: "116,000 reads per second",
        note: "10x peak for morning workday traffic",
      },
      {
        label: "Average free/busy QPS",
        value: "1,400 queries per second",
        note: "120M free/busy queries per day",
      },
      {
        label: "Reminder trigger fan-out",
        value: "600M reminder triggers per day",
        note: "About 6,900 timer firings per second on average and about 69,000 at 10x peak",
      },
      {
        label: "Channel notifications",
        value: "840M sends per day",
        note: "Reminder triggers times 1.4 channels on average across push, email, and in-app",
      },
      {
        label: "Primary event storage",
        value: "150 TB raw events",
        note: "150B event and override records times about 1 KB each",
      },
      {
        label: "Attendee storage",
        value: "60 TB raw attendees",
        note: "300B attendee rows times about 200 bytes each",
      },
      {
        label: "Replicated storage",
        value: "700 TB to 1 PB",
        note: "Raw data plus indexes, change log, reminders, replication, and compaction headroom",
      },
    ],
    calculationsMD: `
- Event writes: 25M event mutations per day divided by 86,400 seconds is about 289 writes per second, rounded to 290. With a 10x peak multiplier, plan for about 2,900 writes per second.
- RSVP writes: 50M RSVP updates per day divided by 86,400 seconds is about 579 writes per second, rounded to 580. Peak is about 5,800 writes per second.
- Calendar views: 1B day or week view reads per day divided by 86,400 seconds is about 11,574 reads per second, rounded to 11,600. Morning traffic and Monday planning can drive 10x peaks, so size the read path for about 116,000 reads per second.
- Free/busy: 120M queries per day divided by 86,400 seconds is about 1,389 queries per second, rounded to 1,400. A large meeting query with 50 attendees fans out internally, so the service must batch and cache busy windows.
- Reminders: 600M reminder triggers per day divided by 86,400 seconds is about 6,944 timer firings per second. With 1.4 delivery channels per trigger, channel sends are about 840M per day, or about 9,700 sends per second on average.
- Event storage: 500M active users times 300 retained event or override records is 150B records. At about 1 KB each, raw event storage is about 150 TB.
- Attendees: if each event averages 2 attendee rows, 150B events produce about 300B attendee rows. At about 200 bytes each, raw attendee storage is about 60 TB.
- Total storage: after secondary indexes by calendar and time, attendee indexes, change logs, reminder tasks, three-way replication, backups, and compaction overhead, a production system should plan for roughly 700 TB to 1 PB.
`,
  },
  apiDesign: {
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/calendars/{calendarId}/events",
        descriptionMD: `
Creates a one-off event or recurring series on a calendar. The caller must have write access to the calendar. The service stores UTC instants plus the originating timezone and local wall-clock fields.
`,
        request: `
{
  "summary": "Weekly product review",
  "description": "Roadmap and launch risks",
  "start": {
    "localDateTime": "2026-08-03T09:00:00",
    "timeZone": "America/Los_Angeles"
  },
  "end": {
    "localDateTime": "2026-08-03T10:00:00",
    "timeZone": "America/Los_Angeles"
  },
  "recurrence": ["RRULE:FREQ=WEEKLY;BYDAY=MO;COUNT=12"],
  "attendees": [
    { "email": "alex@example.com", "optional": false },
    { "email": "room-12@example.com", "resource": true }
  ],
  "reminders": [
    { "minutesBeforeStart": 10, "channel": "push" },
    { "minutesBeforeStart": 60, "channel": "email" }
  ]
}
`,
        response: `
{
  "eventId": "evt_7f3a",
  "calendarId": "cal_primary_123",
  "status": "confirmed",
  "sequence": 1,
  "startUtc": "2026-08-03T16:00:00Z",
  "endUtc": "2026-08-03T17:00:00Z",
  "timeZone": "America/Los_Angeles",
  "etag": "v1_evt_7f3a"
}
`,
        statusCodes: [
          { code: 201, meaning: "Event created" },
          { code: 400, meaning: "Invalid time, recurrence rule, attendee, or reminder" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Caller lacks write permission" },
          { code: 409, meaning: "Resource conflict or stale client version" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/calendars/{calendarId}/events",
        descriptionMD: `
Lists expanded event instances for a time window. For recurring series, the service expands only the requested window and overlays cancelled or modified exceptions.
`,
        response: `
{
  "calendarId": "cal_primary_123",
  "timeMin": "2026-08-03T00:00:00Z",
  "timeMax": "2026-08-10T00:00:00Z",
  "items": [
    {
      "eventId": "evt_7f3a",
      "instanceId": "evt_7f3a_20260803T160000Z",
      "summary": "Weekly product review",
      "startUtc": "2026-08-03T16:00:00Z",
      "endUtc": "2026-08-03T17:00:00Z",
      "timeZone": "America/Los_Angeles",
      "responseStatus": "accepted"
    }
  ],
  "nextSyncToken": "sync_234991"
}
`,
        statusCodes: [
          { code: 200, meaning: "Events returned" },
          { code: 400, meaning: "Invalid time range" },
          { code: 403, meaning: "Caller cannot read this calendar" },
          { code: 410, meaning: "Sync token is too old and a full sync is required" },
        ],
      },
      {
        method: "PATCH",
        path: "/api/v1/calendars/{calendarId}/events/{eventId}",
        descriptionMD: `
Updates a single event, an entire recurring series, or one instance of a recurring series. Instance edits create override records linked to the parent series and original start time.
`,
        request: `
{
  "etag": "v1_evt_7f3a",
  "updateScope": "THIS_INSTANCE",
  "originalStartUtc": "2026-08-10T16:00:00Z",
  "summary": "Product review with launch team",
  "start": {
    "localDateTime": "2026-08-10T11:00:00",
    "timeZone": "America/Los_Angeles"
  },
  "end": {
    "localDateTime": "2026-08-10T12:00:00",
    "timeZone": "America/Los_Angeles"
  }
}
`,
        response: `
{
  "eventId": "evt_override_91b2",
  "seriesEventId": "evt_7f3a",
  "originalStartUtc": "2026-08-10T16:00:00Z",
  "sequence": 2,
  "status": "confirmed",
  "etag": "v2_evt_override_91b2"
}
`,
        statusCodes: [
          { code: 200, meaning: "Event updated" },
          { code: 400, meaning: "Invalid update scope or time" },
          { code: 403, meaning: "Caller lacks edit permission" },
          { code: 404, meaning: "Event not found" },
          { code: 409, meaning: "Version conflict" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/events/{eventId}/rsvp",
        descriptionMD: `
Records the caller's RSVP state for an event or recurring instance. The organizer's event sequence remains authoritative, while each attendee has independent response state.
`,
        request: `
{
  "attendeeEmail": "alex@example.com",
  "responseStatus": "accepted",
  "comment": "Joining remotely",
  "instanceId": "evt_7f3a_20260803T160000Z"
}
`,
        response: `
{
  "eventId": "evt_7f3a",
  "attendeeEmail": "alex@example.com",
  "responseStatus": "accepted",
  "updatedAt": "2026-07-26T07:24:00Z"
}
`,
        statusCodes: [
          { code: 200, meaning: "RSVP updated" },
          { code: 400, meaning: "Invalid attendee or response" },
          { code: 403, meaning: "Caller cannot respond for this attendee" },
          { code: 404, meaning: "Invitation not found" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/freebusy/query",
        descriptionMD: `
Returns busy intervals for users, rooms, or resources over a requested time range. The response hides private event details unless the caller has read access.
`,
        request: `
{
  "timeMin": "2026-08-03T00:00:00Z",
  "timeMax": "2026-08-04T00:00:00Z",
  "items": [
    { "id": "alex@example.com" },
    { "id": "room-12@example.com" }
  ]
}
`,
        response: `
{
  "groups": {},
  "calendars": {
    "alex@example.com": {
      "busy": [
        { "start": "2026-08-03T16:00:00Z", "end": "2026-08-03T17:00:00Z" }
      ]
    },
    "room-12@example.com": {
      "busy": []
    }
  }
}
`,
        statusCodes: [
          { code: 200, meaning: "Availability returned" },
          { code: 400, meaning: "Invalid time range or too many calendars" },
          { code: 403, meaning: "Caller cannot query one or more calendars" },
          { code: 429, meaning: "Free/busy rate limit exceeded" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/sync",
        descriptionMD: `
Returns changes since a previous sync token for one device. Tokens encode or reference a monotonically increasing calendar change sequence, not a client-side timestamp.
`,
        response: `
{
  "syncToken": "sync_234900",
  "changes": [
    {
      "sequenceId": 234991,
      "entityType": "event",
      "entityId": "evt_7f3a",
      "operation": "updated"
    }
  ],
  "nextSyncToken": "sync_234991",
  "hasMore": false
}
`,
        statusCodes: [
          { code: 200, meaning: "Delta returned" },
          { code: 400, meaning: "Invalid token" },
          { code: 401, meaning: "Authentication required" },
          { code: 410, meaning: "Token expired and full sync is required" },
        ],
      },
    ],
    notesMD: `
Keep event writes versioned with etags or sequence numbers so offline devices cannot overwrite newer changes silently. Calendar view reads should accept a time window and return expanded instances, while sync reads should return entity deltas. Free/busy deliberately returns intervals rather than event details.
`,
  },
  databaseDesign: {
    schemaMD: `
The model separates calendar ownership, calendar sharing, event definitions, attendee state, reminder tasks, and sync change logs. A recurring series is stored once as a master event with an RRULE, while edits to specific instances are stored as override events linked by parent_series_id and original_start_utc.

The serving read pattern is calendar_id plus time range. The write pattern is event_id with optimistic version checks. The sync pattern is calendar_id plus monotonically increasing sequence_id.
`,
    tables: [
      {
        name: "calendars",
        columns: [
          { name: "calendar_id", type: "uuid", note: "Primary key" },
          { name: "owner_user_id", type: "uuid", note: "Owner or tenant principal" },
          { name: "summary", type: "varchar(255)", note: "Calendar display name" },
          { name: "default_time_zone", type: "varchar(64)", note: "IANA timezone used for defaults" },
          { name: "visibility", type: "varchar(32)", note: "Private, shared, public, or domain" },
          { name: "etag", type: "varchar(64)", note: "Calendar version for clients" },
          { name: "created_at", type: "timestamp", note: "Creation time" },
          { name: "updated_at", type: "timestamp", note: "Last metadata update" },
        ],
      },
      {
        name: "calendar_acl",
        columns: [
          { name: "calendar_id", type: "uuid", note: "Calendar being shared" },
          { name: "principal_id", type: "varchar(320)", note: "User, group, domain, or resource id" },
          { name: "principal_type", type: "varchar(32)", note: "User, group, domain, service, or resource" },
          { name: "role", type: "varchar(32)", note: "Owner, writer, reader, free_busy_reader, or none" },
          { name: "inherited", type: "boolean", note: "True when inherited from domain policy" },
          { name: "created_at", type: "timestamp", note: "Grant creation time" },
          { name: "updated_at", type: "timestamp", note: "Grant update time" },
        ],
      },
      {
        name: "events",
        columns: [
          { name: "event_id", type: "uuid", note: "Primary key for single event, series master, or override" },
          { name: "calendar_id", type: "uuid", note: "Calendar containing the organizer copy" },
          { name: "organizer_user_id", type: "uuid", note: "Principal that owns organizer authority" },
          { name: "summary", type: "varchar(512)", note: "Title, hidden from free/busy-only readers" },
          { name: "description", type: "text nullable", note: "Optional details" },
          { name: "start_utc", type: "timestamp", note: "Resolved instant for one-off event or first occurrence" },
          { name: "end_utc", type: "timestamp", note: "Resolved end instant" },
          { name: "local_start", type: "varchar(32)", note: "Original wall-clock start without timezone conversion" },
          { name: "local_end", type: "varchar(32)", note: "Original wall-clock end without timezone conversion" },
          { name: "time_zone", type: "varchar(64)", note: "Originating IANA timezone such as Europe/London" },
          { name: "recurrence_rule", type: "text nullable", note: "RRULE string for recurring series masters" },
          { name: "recurrence_until_utc", type: "timestamp nullable", note: "Upper bound for indexed expansion and pruning" },
          { name: "parent_series_id", type: "uuid nullable", note: "Set for overridden or cancelled instances" },
          { name: "original_start_utc", type: "timestamp nullable", note: "Identifies the series occurrence being overridden" },
          { name: "status", type: "varchar(32)", note: "Confirmed, tentative, cancelled, or deleted" },
          { name: "visibility", type: "varchar(32)", note: "Default, private, public, or confidential" },
          { name: "sequence", type: "bigint", note: "Monotonic event version used by sync and invitations" },
          { name: "etag", type: "varchar(64)", note: "Optimistic concurrency token" },
          { name: "updated_at", type: "timestamp", note: "Last mutation time" },
        ],
      },
      {
        name: "event_attendees",
        columns: [
          { name: "event_id", type: "uuid", note: "Series master, single event, or override" },
          { name: "attendee_email", type: "varchar(320)", note: "Human attendee, group, or resource identity" },
          { name: "attendee_user_id", type: "uuid nullable", note: "Linked account when known" },
          { name: "response_status", type: "varchar(32)", note: "Needs_action, accepted, tentative, declined" },
          { name: "optional", type: "boolean", note: "Whether attendance is optional" },
          { name: "resource", type: "boolean", note: "True for rooms and equipment" },
          { name: "comment", type: "text nullable", note: "Optional RSVP comment" },
          { name: "updated_at", type: "timestamp", note: "Last response update" },
        ],
      },
      {
        name: "reminder_tasks",
        columns: [
          { name: "reminder_id", type: "uuid", note: "Primary key" },
          { name: "event_id", type: "uuid", note: "Event or override to remind about" },
          { name: "user_id", type: "uuid", note: "Recipient" },
          { name: "trigger_at_utc", type: "timestamp", note: "Exact delivery time computed from event start" },
          { name: "channel", type: "varchar(32)", note: "Push, email, or in_app" },
          { name: "dedupe_key", type: "varchar(128)", note: "Idempotency key for retries" },
          { name: "status", type: "varchar(32)", note: "Scheduled, claimed, sent, failed, or cancelled" },
          { name: "updated_at", type: "timestamp", note: "Last state transition" },
        ],
      },
      {
        name: "calendar_change_log",
        columns: [
          { name: "calendar_id", type: "uuid", note: "Calendar whose sync stream changed" },
          { name: "sequence_id", type: "bigint", note: "Monotonic per-calendar or per-shard sequence" },
          { name: "entity_type", type: "varchar(32)", note: "Calendar, acl, event, attendee, or reminder" },
          { name: "entity_id", type: "uuid", note: "Changed entity id" },
          { name: "operation", type: "varchar(32)", note: "Created, updated, deleted, cancelled, or permission_changed" },
          { name: "changed_at", type: "timestamp", note: "Commit time" },
          { name: "changed_by", type: "uuid nullable", note: "User or system actor" },
        ],
      },
    ],
    indexesMD: `
- **events.calendar_id, start_utc, end_utc** supports bounded day and week reads for non-recurring events and materialized overrides.
- **events.parent_series_id, original_start_utc** finds overrides and cancellations for a recurring series within a requested window.
- **event_attendees.attendee_user_id, updated_at** supports invitation inboxes and attendee-specific sync.
- **calendar_acl.principal_id, calendar_id** supports listing calendars visible to a user and enforcing access quickly.
- **reminder_tasks.trigger_at_utc, status** lets timer workers claim due reminders in order.
- **calendar_change_log.calendar_id, sequence_id** supports incremental sync tokens and replay.
`,
    relationshipsMD: `
A calendar has many ACL entries and many organizer event records. A recurring series master has zero or more override event rows. Attendee rows reference the event version they apply to, and response_status can differ by attendee. Reminder tasks reference event records but are derived data and can be rebuilt after a scheduler failure. Change-log rows are append-only records emitted in the same transaction as the mutation they describe.
`,
    noSqlAlternativesMD: `
At large scale, use a distributed wide-column or document store partitioned by calendar_id and time bucket for event reads, plus a separate event_id lookup table for direct edits. Bigtable, Spanner, DynamoDB, Cosmos DB, or Cassandra can work if the design preserves conditional writes, time-range scans, and durable change-log ordering.

For recurrence, avoid blindly materializing all future occurrences into the primary store. Store the RRULE and exceptions as source of truth, optionally materialize a rolling horizon such as the next 90 or 180 days for hot calendars, and regenerate that horizon when the series or timezone rules change.
`,
  },
  architecture: {
    width: 960,
    height: 560,
    nodes: [
      { id: "client", label: "Clients", kind: "client", x: 80, y: 230, sublabel: "Web, mobile, desktop" },
      { id: "api-gateway", label: "API Gateway", kind: "gateway", x: 230, y: 230, sublabel: "Auth, rate limits" },
      { id: "calendar-service", label: "Calendar Service", kind: "service", x: 410, y: 220, sublabel: "Events, invites, sync" },
      { id: "permission-service", label: "Permission Service", kind: "service", x: 410, y: 80, sublabel: "ACLs, visibility" },
      { id: "event-cache", label: "Event Window Cache", kind: "cache", x: 610, y: 90, sublabel: "Hot day/week views" },
      { id: "event-store", label: "Event Store", kind: "database", x: 620, y: 230, sublabel: "Events, ACLs, attendees" },
      { id: "change-log", label: "Sync Change Log", kind: "storage", x: 620, y: 380, sublabel: "Incremental tokens" },
      { id: "recurrence-service", label: "Recurrence Expander", kind: "service", x: 810, y: 120, sublabel: "RRULE plus exceptions" },
      { id: "freebusy-service", label: "Free/Busy Service", kind: "service", x: 810, y: 260, sublabel: "Busy intervals" },
      { id: "timer-service", label: "Reminder Timer Service", kind: "queue", x: 810, y: 410, sublabel: "Scheduled delivery" },
      { id: "notification-service", label: "Notification Service", kind: "external", x: 930, y: 410, sublabel: "Push, email, in-app" },
    ],
    edges: [
      { from: "client", to: "api-gateway", label: "calendar APIs" },
      { from: "api-gateway", to: "calendar-service", label: "authenticated request" },
      { from: "calendar-service", to: "permission-service", label: "authorize" },
      { from: "permission-service", to: "event-store", label: "ACL lookup" },
      { from: "calendar-service", to: "event-cache", label: "read window" },
      { from: "event-cache", to: "calendar-service", label: "expanded hit" },
      { from: "calendar-service", to: "event-store", label: "read or write source of truth" },
      { from: "calendar-service", to: "change-log", label: "append sync mutation" },
      { from: "calendar-service", to: "recurrence-service", label: "expand time range" },
      { from: "recurrence-service", to: "event-store", label: "series plus overrides" },
      { from: "calendar-service", to: "freebusy-service", label: "availability query" },
      { from: "freebusy-service", to: "event-store", label: "busy window scan" },
      { from: "calendar-service", to: "timer-service", label: "schedule reminders", dashed: true },
      { from: "timer-service", to: "notification-service", label: "due notification", dashed: true },
    ],
    captionMD: `
The write path persists event, attendee, reminder, ACL, and change-log mutations before acknowledging. The read path authorizes the caller, loads hot expanded windows from cache when possible, and otherwise expands source-of-truth events through the recurrence service.
`,
  },
  architectureNotesMD: `
The architecture separates source-of-truth event storage from derived views. The event store keeps calendars, ACLs, event masters, overrides, attendee state, reminder tasks, and sync log records. The Event Window Cache stores already-expanded windows for hot day and week views but can be invalidated and rebuilt because recurrence rules and exceptions remain authoritative.

The Calendar Service owns API semantics, optimistic concurrency, invitation fan-out, and sync tokens. It delegates ACL decisions to the Permission Service, recurrence math to the Recurrence Expander, availability aggregation to the Free/Busy Service, and reminder execution to the Timer Service. Those services can scale independently because view reads, free/busy queries, and reminders have very different traffic shapes.

Sync uses an append-only change log rather than timestamp polling. Each device presents a token, receives ordered changes, and advances to the next token. If a token is older than the retained log window, the service returns a full-sync-required response.
`,
  requestFlow: [
    {
      title: "Client authenticates and selects visible calendars",
      detailMD: `
The client calls the API Gateway with an access token. The Calendar Service asks the Permission Service for calendars where the user has owner, writer, reader, or free_busy_reader access. The response hides calendars and event fields the caller cannot see.
`,
    },
    {
      title: "Event write validates time and permissions",
      detailMD: `
For create or update, the service validates local start and end times, IANA timezone, RRULE syntax, attendee identities, resource booking rules, and reminder limits. It converts the local time to UTC for the first affected occurrence while preserving local_start, local_end, and time_zone.
`,
    },
    {
      title: "Source-of-truth records commit atomically",
      detailMD: `
The write transaction updates the event or override row, attendee rows, reminder tasks, and calendar_change_log entries with a new sequence. Optimistic etag checks prevent stale offline devices from overwriting newer changes.
`,
    },
    {
      title: "Invitations and RSVP state propagate",
      detailMD: `
Invited users receive attendee records or inbox entries with response_status set to needs_action. When an attendee accepts, declines, or marks tentative, only that attendee response changes unless organizer-controlled event fields are edited.
`,
    },
    {
      title: "Recurring events are expanded for views",
      detailMD: `
When the user opens a day or week view, the service fetches series masters that intersect the window, expands RRULE occurrences lazily for that window, and overlays exceptions keyed by series_event_id and original_start_utc. Cancelled overrides remove one generated occurrence; edited overrides replace it.
`,
    },
    {
      title: "Free/busy collapses details into intervals",
      detailMD: `
For scheduling, the Free/Busy Service gathers busy intervals from each requested calendar over the time range, expands recurring events as needed, filters out declined or transparent events, and returns only start and end intervals when the caller lacks full read access.
`,
    },
    {
      title: "Reminder timers fire at due times",
      detailMD: `
On event writes, reminder_tasks are computed using start_utc minus the requested lead time. Timer workers claim due tasks by trigger_at_utc and status, send idempotent messages to push or email providers, and mark tasks sent or retryable.
`,
    },
    {
      title: "Devices perform incremental sync",
      detailMD: `
Each device stores the latest sync token. On sync, the service reads calendar_change_log after that sequence, returns changed entity ids and tombstones, and supplies a nextSyncToken. If too many changes were compacted, the client must perform a full windowed resync.
`,
    },
  ],
  coreComponents: [
    {
      name: "Calendar Service",
      kind: "service",
      role: "Owns event APIs, invitations, concurrency, and sync semantics.",
      detailMD: `
This stateless service validates requests, enforces etags, writes source-of-truth records, appends sync log entries, invalidates expanded-window cache keys, and coordinates downstream invitation and reminder work. It should not embed complex recurrence math directly in every handler.
`,
    },
    {
      name: "Event Store",
      kind: "database",
      role: "Durable source of truth for calendars, events, overrides, attendees, ACLs, and reminder tasks.",
      detailMD: `
The store supports direct lookup by event_id, time-range reads by calendar_id, conditional updates by etag, and append-only change-log writes. Data is partitioned so a single hot organization or popular public calendar cannot overload one shard.
`,
    },
    {
      name: "Recurrence Expander",
      kind: "service",
      role: "Converts RRULE series into concrete occurrences for bounded windows.",
      detailMD: `
The expander implements RFC 5545 recurrence behavior, handles COUNT and UNTIL limits, respects IANA timezone rules, and applies exception rows. It can cache expanded windows but treats RRULE plus overrides as the canonical model.
`,
    },
    {
      name: "Invitation and RSVP Manager",
      kind: "service",
      role: "Maintains attendee state and organizer-to-attendee propagation.",
      detailMD: `
This component creates attendee records, tracks needs_action, accepted, tentative, and declined states, handles resource responses, and sends change notifications. Organizer edits increment the sequence so attendees and devices can detect stale invitations.
`,
    },
    {
      name: "Free/Busy Service",
      kind: "service",
      role: "Answers availability queries without leaking private event details.",
      detailMD: `
The service merges busy intervals from many calendars, excludes transparent or declined events, handles recurring occurrences, and enforces that free_busy_reader access returns only occupied time ranges. It can cache short windows for popular users and rooms.
`,
    },
    {
      name: "Reminder Timer Service",
      kind: "queue",
      role: "Delivers notifications at computed due times.",
      detailMD: `
The timer service stores scheduled tasks by trigger_at_utc, claims due tasks with leases, retries transient failures, and uses dedupe keys to avoid duplicate push or email reminders. It must tolerate bursts around common meeting boundaries such as the top of the hour.
`,
    },
    {
      name: "Permission Service",
      kind: "service",
      role: "Evaluates calendar ACLs, event visibility, and enterprise sharing policy.",
      detailMD: `
The Permission Service resolves direct grants, group grants, domain policy, and event-level visibility. It should cache common ACL decisions but invalidate quickly when sharing settings change.
`,
    },
    {
      name: "Sync Change Log",
      kind: "storage",
      role: "Feeds incremental sync tokens for every device.",
      detailMD: `
Every committed mutation appends an ordered change record. Sync tokens reference the last delivered sequence and are safer than timestamp polling because clock skew and out-of-order writes cannot skip changes.
`,
    },
  ],
  deepDives: [
    {
      topic: "Event data model",
      detailMD: `
A strong design starts with the event model. A calendar is a container with ACLs. An event row can be a one-off event, a recurring series master, or an override for one instance. The organizer copy owns title, location, conferencing data, start and end, recurrence, visibility, and sequence. Attendee rows own per-attendee response state and optional comments.

Store both UTC instants and the originating timezone context. UTC is used for ordering, reminders, and range scans. The local wall-clock fields and IANA timezone are used to preserve user intent and regenerate future occurrences when daylight-saving rules change. For all-day events, store dates separately from timestamps so they do not shift when viewed from another timezone.

Do not model each invited attendee as a fully independent event unless the product needs attendee-local edits. That approach makes organizer updates, cancellations, and conflict detection harder. Instead, use organizer event plus attendee state, and optionally create attendee-visible projections derived from the authoritative event and RSVP rows.
`,
    },
    {
      topic: "Recurring events, RRULE expansion, and exceptions",
      detailMD: `
RRULE from RFC 5545 can express daily, weekly, monthly, yearly, count-limited, until-limited, and rule-by-field recurrences. Materializing every future occurrence is dangerous because an unbounded daily rule could create thousands of rows per user and timezone rule changes would require huge rewrites.

The preferred model stores the series master with recurrence_rule, recurrence_until_utc, local start and end, and timezone. For a view request, expand only the requested window, such as one week or one month, then overlay exceptions. An exception is keyed by parent_series_id plus original_start_utc. A cancelled exception suppresses one generated occurrence; an edited exception replaces the generated occurrence with its own start, end, title, reminders, or attendee changes.

Selective materialization is still useful. For hot calendars, materialize a rolling horizon such as the next 90 days into a cache or derived table to accelerate day views and free/busy queries. The materialized horizon is derived data and must be invalidated when the RRULE, timezone, or exceptions change.
`,
    },
    {
      topic: "Invitations, RSVP state, and sharing permissions",
      detailMD: `
Invitations require separating organizer-controlled event fields from attendee-controlled response fields. The organizer can change time, title, recurrence, conferencing data, and attendee list. Each attendee can set response_status to accepted, tentative, declined, or needs_action. Resource attendees such as rooms may auto-accept or decline based on availability and policy.

Organizer edits increment the event sequence and generate sync changes for every visible attendee. RSVP updates should not rewrite the organizer event body; they update event_attendees and notify the organizer if the product needs that signal. If an attendee is removed from a meeting, future sync responses should include a tombstone so their devices delete the invitation.

Sharing permissions exist at calendar level and sometimes event level. Owner and writer roles can mutate events, reader can view details, and free_busy_reader can only see busy blocks. Enterprise policies may restrict external sharing or hide guest lists. Every day view, event detail, free/busy response, and sync delta must apply the same visibility rules.
`,
    },
    {
      topic: "Free/busy queries and conflict detection",
      detailMD: `
Free/busy is a derived availability view. It should include confirmed and tentative events that block time, exclude declined events, exclude events marked transparent, and hide titles or descriptions from callers who only have availability access.

A simple query fetches each calendar's events over the requested time range, expands recurring series within the range, overlays exceptions, and merges intervals. For a meeting with many attendees, fan-out can be expensive. Batch calendars by shard, cap the time range, cache common windows for rooms and active users, and return partial errors per calendar rather than failing the whole query.

Conflict detection is advisory for humans but often strict for rooms and resources. For human attendees, the create API can warn about conflicts while allowing the organizer to proceed. For conference rooms, use a conditional booking record or resource calendar write so two organizers cannot reserve the same room at the same time.
`,
    },
    {
      topic: "Reminders and scheduled delivery",
      detailMD: `
Reminders are scheduled tasks derived from event start times and user preferences. On event create or update, compute trigger_at_utc for each reminder by subtracting the lead time from the occurrence start. For recurring events, either lazily generate reminder tasks for a rolling horizon or materialize the next due occurrence per reminder and advance it after delivery.

The timer service should store tasks ordered by trigger_at_utc, claim due tasks with leases, and send to a notification service with an idempotency key. It must handle common spikes at 5 minutes before the hour, retry provider failures, and cancel or update pending reminders when an event changes or an attendee declines.

Reminder delivery is at-least-once internally and effectively-once at the user experience layer. Duplicate sends are prevented with dedupe keys such as user, event or instance id, channel, and trigger time. If the timer service is delayed, it should deliver late reminders only within a bounded grace window to avoid waking users for stale meetings.
`,
    },
    {
      topic: "Timezone, DST, and incremental sync correctness",
      detailMD: `
Timezone bugs are common in calendar interviews. Store start_utc and end_utc for efficient ordering, but also store local_start, local_end, and the IANA time_zone that expressed the user's intent. A weekly 9 AM meeting should be expanded as 9 AM in that timezone for each occurrence, then converted to UTC using the timezone database version in effect.

DST creates nonexistent local times, repeated local times, and changing offsets. The API should reject impossible times or apply an explicit product rule, such as choosing the later valid instant. All-day events should be stored as local dates and rendered in the calendar timezone, not converted through midnight UTC.

Incremental sync should use sequence-based tokens, not updated_at polling. Every mutation appends to calendar_change_log with a monotonic sequence. Devices ask for changes after their last sequence and receive updates plus tombstones. If a device is offline longer than the retained log window, return 410 Gone and force a full resync so it cannot silently miss deletes or ACL changes.
`,
    },
  ],
  scaling: [
    {
      stage: "Prototype: single region and relational database",
      detailMD: `
Start with a relational schema for calendars, events, attendees, reminders, ACLs, and change logs. Expand recurrence in application code for bounded windows. Use optimistic etags and a background worker for reminders. This is enough to prove correctness for one-off events, simple RRULEs, and sync tokens.
`,
    },
    {
      stage: "Growth: caches, workers, and read replicas",
      detailMD: `
Add event-window caches for hot day and week views, read replicas for calendar range reads, a dedicated timer worker pool, and asynchronous invitation notifications. Keep writes routed to the primary region or database leader to preserve event sequence ordering.
`,
    },
    {
      stage: "Large scale: sharded calendar storage",
      detailMD: `
Shard by calendar_id or tenant and time bucket. Move recurrence expansion, free/busy, reminder scheduling, and sync serving into separately scalable services. Use a durable change-log partition per shard so incremental sync can replay ordered mutations efficiently.
`,
    },
    {
      stage: "Global scale: multi-region reads and regional writes",
      detailMD: `
Replicate calendar data across regions for low-latency reads, route writes to the calendar's home region or a consensus-backed multi-region database, and fan out invalidations to regional caches. Preserve user-visible read-after-write by routing the writer to a fresh replica or by reading from the write region briefly after mutation.
`,
    },
  ],
  bottlenecks: [
    {
      issue: "Expanding large recurring series on every view",
      optimizationMD: `
Expand only bounded windows, cache expanded results, cap pathological RRULEs, and materialize a rolling horizon for hot calendars. Keep exceptions indexed by parent_series_id and original_start_utc so overlays are cheap.
`,
    },
    {
      issue: "Free/busy fan-out for large meetings",
      optimizationMD: `
Batch calendar reads by shard, limit query ranges, cache room and user busy windows, merge intervals in memory, and return per-calendar errors. For resource booking, use conditional writes on the resource calendar to prevent double booking.
`,
    },
    {
      issue: "Reminder spikes near common meeting times",
      optimizationMD: `
Partition timer tasks by trigger_at_utc and user or shard, claim tasks with leases, autoscale workers before top-of-hour bursts, and use provider-specific rate limits with retry queues.
`,
    },
    {
      issue: "Hot calendars and public subscriptions",
      optimizationMD: `
Cache expanded windows for popular public calendars, replicate cache entries across regions, and serve subscribed read-only calendars from derived projections. Isolate public calendar traffic from private user event writes.
`,
    },
    {
      issue: "Sync token replay over long offline periods",
      optimizationMD: `
Retain change logs for a bounded window, compact older mutations into snapshots, and return a full-sync-required response when the token is too old. This avoids keeping infinite per-device logs.
`,
    },
  ],
  failureHandling: [
    {
      scenario: "Reminder timer service falls behind",
      strategyMD: `
Track scheduling lag, due-task backlog, and provider failure rates. Scale workers, prioritize imminent reminders, skip very stale reminders after a grace window, and rebuild missing tasks from the event store if a partition is lost.
`,
    },
    {
      scenario: "Recurrence expansion bug or timezone database update",
      strategyMD: `
Version recurrence expansion code and timezone data, canary changes with shadow comparisons, and invalidate affected expanded-window caches. Because RRULE plus exceptions remain source of truth, derived occurrences can be regenerated.
`,
    },
    {
      scenario: "Primary event store shard unavailable",
      strategyMD: `
Serve recently cached read windows if safe, return degraded read-only responses where possible, and fail writes fast with retryable errors. Replicate shards across availability zones and restore from the change log plus backups.
`,
    },
    {
      scenario: "Change-log retention gap for a device",
      strategyMD: `
Return 410 Gone for the stale sync token and force the client to perform a full sync. Never pretend the token succeeded because missing a delete or ACL change can expose private data.
`,
    },
    {
      scenario: "Notification provider outage",
      strategyMD: `
Queue provider-specific retries with exponential backoff, fail over to alternate channels when user preferences allow it, and expose delivery status. Event reads and writes should continue even if email or push delivery is degraded.
`,
    },
  ],
  security: [
    {
      label: "Calendar ACL enforcement",
      detailMD: `
Every endpoint must authorize calendar visibility and role before returning data. Free/busy access should reveal only busy intervals, not titles, guests, locations, conference links, or descriptions.
`,
    },
    {
      label: "Enterprise sharing policy",
      detailMD: `
Organizations may block external invites, hide guest lists, restrict public calendars, or require audit logs. Apply policy at invite creation, ACL mutation, event reads, and sync delta generation.
`,
    },
    {
      label: "Conference link and description safety",
      detailMD: `
Event descriptions and locations can contain malicious links or HTML. Sanitize rendered content, protect conference links, and avoid leaking private meeting metadata through notifications or previews.
`,
    },
    {
      label: "Token and device security",
      detailMD: `
Sync tokens should be scoped to user, device, calendar set, and authorization state. If permissions are revoked, the change log should send tombstones and the server should reject old tokens that would expose inaccessible events.
`,
    },
    {
      label: "Abuse and spam prevention",
      detailMD: `
Calendar invites can be abused for spam. Rate-limit invite creation, detect suspicious guest lists, allow users to block organizers, and quarantine events from unknown senders until accepted.
`,
    },
  ],
  tradeoffs: {
    pros: [
      "RRULE plus exceptions keeps recurring series compact and correct.",
      "Lazy expansion avoids unbounded storage growth for future occurrences.",
      "Sequence-based sync tokens prevent missed changes from clock skew.",
      "Separating free/busy from event details preserves privacy.",
      "Timer-based reminders scale independently from event writes.",
    ],
    cons: [
      "Lazy recurrence expansion increases read-path complexity.",
      "Calendar correctness depends on high-quality timezone and DST handling.",
      "Invitation state introduces multi-party consistency and notification fan-out.",
      "Incremental sync requires durable change-log retention and token invalidation.",
      "Permissions must be enforced consistently across many derived views.",
    ],
    alternativesMD: `
Alternative one is full occurrence materialization. It makes reads simple, but recurring events with no end date can explode storage and require expensive rewrites after timezone or RRULE changes.

Alternative two is purely lazy expansion with no caches. It is storage efficient and correct, but popular calendars and large free/busy queries may suffer high p99 latency.

Alternative three is a consensus-backed global relational database for all calendar writes. It simplifies consistency and cross-region failover, but increases write latency and cost compared with home-region writes plus replicated reads.
`,
    whenNotToUseMD: `
Do not use this full calendar architecture for a simple reminder app or personal to-do list with no sharing, no recurrence complexity, no multi-device sync, and no attendee workflow. A local-first task store with simple alarms is much cheaper when collaboration and free/busy semantics are not required.
`,
  },
  followUpQuestions: [
    {
      question: "Why not materialize every recurring event forever?",
      answerMD: `
Unbounded recurrence can create infinite or very large future occurrence sets. Materializing forever wastes storage, makes edits expensive, and breaks when timezone rules change. Store the RRULE as source of truth, materialize only a bounded horizon or cache, and expand lazily for requested windows.
`,
    },
    {
      question: "How do you represent an edited instance in a recurring series?",
      answerMD: `
Create an override row with parent_series_id and original_start_utc. During expansion, generate the normal occurrence, look for an override with the same original start, and either replace it with the edited event or suppress it if the override is cancelled.
`,
    },
    {
      question: "How do you keep a weekly 9 AM meeting correct across DST?",
      answerMD: `
Store the local wall-clock time and IANA timezone along with UTC instants. Expand each occurrence as 9 AM in the event timezone, then convert that occurrence to UTC using timezone rules for that date. Do not add seven days to the previous UTC instant.
`,
    },
    {
      question: "How should free/busy handle private events?",
      answerMD: `
Return only occupied intervals for callers with free_busy_reader access. Hide title, description, location, conferencing data, and guest list. For callers with full read access, the normal event listing endpoint can return details.
`,
    },
    {
      question: "How do sync tokens avoid missed updates?",
      answerMD: `
Tokens reference a monotonically increasing change sequence. Every event, attendee, ACL, or deletion mutation appends a change-log entry. Devices replay changes after their last sequence. If the sequence is too old, the server forces a full sync.
`,
    },
    {
      question: "How do you avoid duplicate reminders?",
      answerMD: `
Use leases when claiming due reminder tasks and send notifications with idempotency keys based on user, event instance, channel, and trigger time. Retries are safe because downstream providers or the notification service can deduplicate.
`,
    },
  ],
  companyVariations: [
    {
      company: "Google",
      angleMD: `
Google interviewers are likely to push on calendar-specific correctness: RRULE semantics, timezone and DST behavior, sync tokens, privacy-preserving free/busy, large-scale reminders, and global read latency. Be precise about what is source of truth versus derived cache.
`,
    },
    {
      company: "Microsoft",
      angleMD: `
Microsoft may frame the problem around Outlook-style enterprise calendars, Exchange interoperability, room booking, tenant policy, auditability, and offline desktop sync. Emphasize permissions, organizational sharing rules, resource calendars, and conflict resolution for offline edits.
`,
    },
    {
      company: "Amazon",
      angleMD: `
Amazon may focus on operational partitioning, queue backlogs, reminder delivery SLOs, and cost. Be ready to explain DynamoDB-style conditional writes for resource booking, CloudWatch-style alarms for timer lag, and graceful degradation when notification providers fail.
`,
    },
    {
      company: "LinkedIn",
      angleMD: `
LinkedIn could connect the design to recruiting interviews, scheduling assistants, messaging integrations, and member privacy. Discuss invite spam prevention, calendar availability sharing, and how sync tokens protect a mobile-heavy user base.
`,
    },
  ],
  relatedQuestions: [
    {
      slug: "notification-service",
      note: "Calendar reminders and invitation updates depend on reliable scheduled notification delivery.",
    },
    {
      slug: "distributed-cache",
      note: "Expanded event windows, ACL decisions, and free/busy intervals rely on careful cache invalidation.",
    },
    {
      slug: "distributed-queue",
      note: "Reminder timers and invitation fan-out use queued asynchronous workers.",
    },
    {
      slug: "google-drive",
      note: "Both systems require sharing permissions, sync tokens, conflict handling, and multi-device consistency.",
    },
  ],
  interviewTips: {
    commonMistakes: [
      "Materializing all future recurring occurrences without bounds.",
      "Adding seven days in UTC for weekly meetings instead of preserving local timezone intent.",
      "Treating RSVP state as a single global event field.",
      "Returning private event details from free/busy queries.",
      "Using updated_at polling instead of sequence-based sync tokens.",
    ],
    redFlags: [
      "No explanation of RRULE, exceptions, or cancelled instances.",
      "No plan for reminder delivery at exact times and retry safety.",
      "No calendar ACL or event visibility model.",
      "No concrete capacity numbers for read QPS, reminders, and storage.",
      "No strategy for offline devices and stale sync tokens.",
    ],
    expectations: [
      "Define the event, attendee, recurrence, override, reminder, ACL, and change-log models.",
      "Separate source-of-truth data from expanded-window caches and derived reminder tasks.",
      "Explain lazy recurrence expansion plus bounded materialization.",
      "Call out timezone and DST correctness explicitly.",
      "Show how free/busy and reminders scale independently.",
      "Use sequence tokens for incremental sync and tombstones for deletes.",
    ],
    communicationMD: `
Start by naming the correctness traps: recurrence, exceptions, timezones, sharing, RSVP, reminders, and sync. Then draw the source-of-truth write path and the derived read path separately. When tradeoffs appear, tie them to user impact: lazy recurrence saves storage but needs a strong expander, free/busy protects privacy but loses details, and sync tokens add storage but prevent missed updates.
`,
  },
  revisionNotesMD: `
- Store calendars, ACLs, event masters, overrides, attendees, reminders, and change-log entries as separate concepts.
- A recurring series is an event master with an RRULE. Edited or cancelled instances are override rows keyed by parent_series_id and original_start_utc.
- Expand recurrence lazily for requested windows, optionally materializing a rolling 90 or 180 day horizon for hot calendars.
- Store UTC instants for ordering and reminders, but preserve local wall-clock fields and IANA timezone for user intent and DST correctness.
- Invitations need per-attendee response_status. Organizer event details and attendee RSVP state should not overwrite each other.
- Free/busy returns busy intervals and should hide private event details from callers without full read access.
- Reminder tasks are scheduled by trigger_at_utc, claimed with leases, retried with idempotency keys, and delivered through push, email, or in-app channels.
- Incremental sync should use sequence-based tokens over an append-only change log. Too-old tokens must force full resync.
- At 1B day or week reads per day, expect about 11,600 average read QPS and about 116,000 peak read QPS. At 600M reminder triggers per day, expect about 6,900 average timer firings per second and about 69,000 peak.
`,
  flashcards: [
    {
      front: "What is the source of truth for a recurring event?",
      back: "The series master with RRULE, local time, timezone, and exception or override rows. Expanded occurrences are derived.",
    },
    {
      front: "Why store both UTC and originating timezone?",
      back: "UTC supports ordering and reminders, while the IANA timezone and local time preserve wall-clock intent across DST changes.",
    },
    {
      front: "How is a cancelled recurring instance represented?",
      back: "As an override keyed by parent_series_id and original_start_utc with status cancelled, which suppresses the generated occurrence.",
    },
    {
      front: "What should free/busy return for a private event?",
      back: "Only the busy start and end interval unless the caller has permission to see event details.",
    },
    {
      front: "Why are sync tokens sequence-based?",
      back: "A monotonic sequence avoids missed changes caused by clock skew, timestamp ties, or out-of-order writes.",
    },
    {
      front: "What is the biggest risk of materializing all recurrence forever?",
      back: "Unbounded storage growth and expensive rewrites when the series, exceptions, or timezone rules change.",
    },
    {
      front: "How do reminders avoid duplicate sends?",
      back: "Workers claim due tasks with leases and send with idempotency keys based on user, event instance, channel, and trigger time.",
    },
    {
      front: "What is the difference between organizer event state and attendee state?",
      back: "Organizer state controls event details, while attendee state records each participant's RSVP and comments.",
    },
  ],
  quiz: [
    {
      question: "What is the best source-of-truth model for an unbounded weekly recurring meeting?",
      options: ["Materialize every future occurrence immediately", "Store the RRULE series master plus bounded exceptions", "Store only the first occurrence and ignore the rule", "Create a separate calendar per occurrence"],
      answerIndex: 1,
      explanationMD: `
RRULE plus exceptions keeps the series compact and correct. Occurrences can be expanded lazily for requested windows or materialized only for a rolling horizon.
`,
    },
    {
      question: "How should a weekly 9 AM meeting be expanded across daylight-saving changes?",
      options: ["Add seven days to the previous UTC timestamp", "Expand 9 AM in the event's IANA timezone for each date, then convert to UTC", "Store only the user's current offset", "Convert the event to the viewer's timezone before storing it"],
      answerIndex: 1,
      explanationMD: `
The event's local wall-clock time and originating timezone preserve intent. UTC offsets can change across DST, so each occurrence must be converted using timezone rules for that date.
`,
    },
    {
      question: "What should a free/busy response reveal to a caller with only free_busy_reader access?",
      options: ["Full event title and description", "Guest list and conference link", "Busy intervals only", "Organizer comments"],
      answerIndex: 2,
      explanationMD: `
Free/busy access is designed to support scheduling while protecting privacy. It returns occupied intervals without event details.
`,
    },
    {
      question: "What is the safest way to support incremental sync across offline devices?",
      options: ["Poll all events updated after the device's local clock time", "Use a monotonic server-side change sequence and sync token", "Ask the client to diff titles locally", "Send only future events and ignore deletes"],
      answerIndex: 1,
      explanationMD: `
A server-side sequence avoids clock skew and timestamp races. The change log can also include tombstones for deletes and permission changes.
`,
    },
    {
      question: "How should reminder delivery handle retries?",
      options: ["Block event reads until the reminder is sent", "Retry with idempotency keys and leased task claims", "Send every retry without deduplication", "Store reminders only in mobile clients"],
      answerIndex: 1,
      explanationMD: `
Timer workers should claim tasks with leases and send through notification providers using idempotency keys so transient failures do not create duplicate user-visible reminders.
`,
    },
    {
      question: "Where should an attendee's accepted or declined state be stored?",
      options: ["As a global field on the organizer event only", "In per-attendee response records linked to the event or instance", "Only in the email notification", "In the reminder task row"],
      answerIndex: 1,
      explanationMD: `
Each attendee has independent response state. The organizer event remains authoritative for event details, while event_attendees stores RSVP state.
`,
    },
  ],
  cheatSheetMD: `
**Goal**: design Google Calendar for events, recurrence, invitations, reminders, free/busy, sharing, and device sync.

**Core model**: calendar plus ACLs, event master, recurrence rule, override rows, attendee rows, reminder tasks, and append-only change log.

**Recurrence**: store RRULE as source of truth. Expand lazily for requested day or week windows. Overlay exceptions by parent_series_id and original_start_utc. Materialize only a bounded rolling horizon for hot calendars.

**Timezone**: store UTC instants for sorting and reminders, but preserve local_start, local_end, and IANA timezone for wall-clock intent and DST correctness.

**Invites and RSVP**: organizer event details are separate from per-attendee response_status. Resource calendars can require conditional booking to prevent double reservations.

**Free/busy**: expand and merge busy intervals, exclude transparent or declined events, and hide details from callers without read permission.

**Reminders**: compute trigger_at_utc, store scheduled tasks, claim with leases, retry safely, and deduplicate by user, instance, channel, and trigger time.

**Sync**: use sequence-based tokens over calendar_change_log. Return tombstones for deletes. Force full sync when tokens are too old.

**Scale numbers**: 1B day or week reads per day is about 11,600 average read QPS and about 116,000 peak. 600M reminders per day is about 6,900 average timer firings per second and about 69,000 peak.

**Tradeoff**: correctness comes from compact source-of-truth records; speed comes from derived caches, bounded materialization, and independent reminder and free/busy services.
`,
  references: [
    {
      title: "RFC 5545 Internet Calendaring and Scheduling Core Object Specification",
      kind: "Docs",
      url: "https://www.rfc-editor.org/rfc/rfc5545",
      author: "IETF",
    },
    {
      title: "Google Calendar API Events",
      kind: "Docs",
      url: "https://developers.google.com/calendar/api/v3/reference/events",
      author: "Google",
    },
    {
      title: "Google Calendar API Synchronize Resources",
      kind: "Docs",
      url: "https://developers.google.com/calendar/api/guides/sync",
      author: "Google",
    },
    {
      title: "Designing Data-Intensive Applications",
      kind: "Book",
      author: "Martin Kleppmann",
    },
  ],
};
