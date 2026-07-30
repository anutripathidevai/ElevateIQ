import type { SDQuestionContent } from "../types";

export const uberContent: SDQuestionContent = {
  slug: "uber",
  statementMD: `
Design Uber, a real-time ride-hailing marketplace that lets riders request trips, matches them to nearby drivers, tracks the trip lifecycle, computes fare and ETA, sends push notifications, and charges the rider when the trip completes.

At interview scale, assume millions of online drivers, tens of millions of trips per day, driver location pings every few seconds, and intense city-level traffic spikes around commute hours, airports, sports events, and bad weather. The core challenge is not only CRUD for trips; it is ingesting high-volume location updates, maintaining a fresh geospatial index, dispatching reliably under strict latency, and preserving a correct trip state machine while multiple mobile clients and backend services race to update state.

The default design should partition the world into geo-sharded dispatch regions, keep matching local to a region whenever possible, make location data fresh but ephemeral, store trip and payment records durably, and degrade gracefully when routing, notifications, pricing, or payments are slow.
`,
  businessUseCaseMD: `
Ride-hailing converts idle driver supply into on-demand transportation. Riders care about quick pickup, predictable ETA, transparent pricing, and safe payment. Drivers care about fair dispatch, minimal idle time, accurate navigation, and reliable earnings.

The business also needs marketplace controls: surge pricing to balance supply and demand, fraud prevention, regulatory auditability, support workflows, driver quality signals, and operational dashboards for each city. These needs make the system a blend of low-latency real-time serving and durable financial transaction processing.
`,
  functionalRequirements: [
    "Let riders request a trip with pickup, dropoff, ride type, payment method, and optional preferences.",
    "Ingest driver location, heading, speed, availability, and ride state every few seconds.",
    "Find nearby eligible drivers using geospatial indexing and region-aware search.",
    "Match a rider to a driver, send a dispatch offer, handle accept, reject, timeout, and retry.",
    "Maintain a trip lifecycle from request to match to enroute to ongoing to complete to payment.",
    "Compute ETA, route distance, fare estimate, and dynamic surge multiplier.",
    "Push notifications and in-app updates to rider and driver throughout the trip.",
    "Capture payment at trip end and record driver payout, receipt, and audit metadata.",
  ],
  nonFunctionalRequirements: [
    {
      label: "Latency",
      detailMD: `
Rider request to first driver offer should usually complete in under 2 seconds p95 inside a city. Driver location writes should be accepted in under 100ms p95 at the regional edge, and nearby-driver queries should return candidates in tens of milliseconds from the local dispatch region.
`,
    },
    {
      label: "Availability",
      detailMD: `
Trip request, dispatch, trip state updates, and safety-critical location tracking should target 99.99 percent regional availability. Pricing, analytics, and non-critical notifications can degrade, but the system must not strand active trips because a secondary service is down.
`,
    },
    {
      label: "Location freshness",
      detailMD: `
The matching index should reflect active driver positions with a freshness target around 5 to 10 seconds. Stale drivers should be automatically excluded from dispatch, and clients should keep sending pings even when the app is backgrounded within platform limits.
`,
    },
    {
      label: "Write scalability",
      detailMD: `
Location ingestion is the highest-volume write path. The architecture must absorb hundreds of thousands of pings per second at peak without making every ping a durable database transaction on the hot path.
`,
    },
    {
      label: "Trip state consistency",
      detailMD: `
A trip must have one authoritative state machine. Driver acceptance, rider cancellation, arrival, start, completion, and payment capture need idempotent commands, optimistic versioning, and clear handling for duplicate or out-of-order mobile requests.
`,
    },
    {
      label: "Geo locality",
      detailMD: `
Matching should stay inside a geo-sharded dispatch region so nearby-driver queries, surge calculations, driver locks, and trip state transitions avoid cross-continent coordination. Cross-region flows are exceptions, not the normal path.
`,
    },
    {
      label: "Privacy and safety",
      detailMD: `
Location data is sensitive. Keep raw pings only as long as needed, restrict access, expose coarse history to support teams, encrypt at rest and in transit, and separate rider-driver contact details from dispatch internals.
`,
    },
  ],
  capacityEstimation: {
    assumptionsMD: `
Assume 25M completed trips per day worldwide, 3M active drivers per day, 1.5M concurrently online drivers at peak, and driver pings every 3 seconds during peak. Average online drivers across the day are lower, around 800K, with pings every 5 seconds.

Assume a location ping payload of 250 bytes before protocol overhead and about 500 bytes after metadata, headers, ingestion envelope, and replication-friendly event fields. A trip record with state history, fare, route summary, rider and driver references, and audit fields is about 2 KB raw. Peak traffic is roughly 10x average for trip requests in the busiest dispatch regions.
`,
    metrics: [
      {
        label: "Completed trips",
        value: "25M per day",
        note: "About 289 completed trips per second on average worldwide",
      },
      {
        label: "Peak matching QPS",
        value: "2,900 trip requests per second",
        note: "10x the average trip request rate before retries and re-dispatch",
      },
      {
        label: "Average location ingest",
        value: "160,000 pings per second",
        note: "800K online drivers divided by a 5 second ping interval",
      },
      {
        label: "Peak location ingest",
        value: "500,000 pings per second",
        note: "1.5M online drivers divided by a 3 second ping interval",
      },
      {
        label: "Peak location ingress bandwidth",
        value: "250 MB per second",
        note: "500,000 pings per second times about 500 bytes per event",
      },
      {
        label: "Location event volume",
        value: "13.8B pings per day average",
        note: "160,000 pings per second times 86,400 seconds",
      },
      {
        label: "Location log storage",
        value: "6.9 TB per day raw",
        note: "13.8B events times 500 bytes before compression and replication",
      },
      {
        label: "Trip storage",
        value: "50 GB per day raw",
        note: "25M trips times 2 KB per trip record",
      },
      {
        label: "One-year trip storage",
        value: "18 TB raw",
        note: "50 GB per day for 365 days before indexes and replicas",
      },
      {
        label: "Hot geo-index memory",
        value: "10 to 30 GB worldwide",
        note: "Latest location and cell membership for millions of drivers with replication and indexing overhead",
      },
    ],
    calculationsMD: `
- Trips: 25M completed trips per day divided by 86,400 seconds is about 289 trips per second on average. A 10x city and commute multiplier gives about 2,900 matching requests per second before re-dispatch attempts.
- Location writes: 800K online drivers divided by a 5 second ping interval gives 160,000 pings per second on average. At peak, 1.5M online drivers divided by 3 seconds gives 500,000 pings per second.
- Ingress bandwidth: 500,000 peak pings per second times 500 bytes per ping is about 250 MB per second before broker replication and network framing.
- Daily location events: 160,000 pings per second times 86,400 seconds is 13.824B pings per day. At 500 bytes each, that is about 6.9 TB per day raw. Keep only a short hot retention window in the streaming log and compact older data into cheaper storage if required for safety or analytics.
- Trip records: 25M trips per day times 2 KB is about 50 GB per day raw. Over one year that is about 18 TB raw. With indexes, replicas, audit history, and payment records, plan for 60 to 100 TB per year in durable stores.
- Geo-index memory: the current location index stores only the latest active driver state, not all pings. 3M active drivers times about 500 bytes is 1.5 GB raw; cell membership sets, hashes, replication, and per-region overhead can push this to 10 to 30 GB worldwide, still far smaller than the raw ping log.
`,
  },
  apiDesign: {
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/driver/location",
        descriptionMD: `
Accepts a driver's latest location ping. The ingestion path validates driver identity, assigns the ping to a dispatch region and geospatial cell, updates the current location index, and appends an event for downstream analytics.
`,
        request: `
{
  "driverId": "driver_123",
  "lat": 37.77652,
  "lng": -122.41734,
  "heading": 82,
  "speedMetersPerSecond": 8.4,
  "accuracyMeters": 9,
  "driverState": "available",
  "clientTimestamp": "2026-07-26T07:24:12Z",
  "sequence": 88421
}
`,
        response: `
{
  "accepted": true,
  "regionId": "us-sf-bay",
  "cellId": "s2_808f7",
  "serverTimestamp": "2026-07-26T07:24:12Z"
}
`,
        statusCodes: [
          { code: 202, meaning: "Location accepted" },
          { code: 400, meaning: "Invalid coordinates or stale timestamp" },
          { code: 401, meaning: "Driver authentication required" },
          { code: 409, meaning: "Out-of-order sequence ignored" },
          { code: 429, meaning: "Ping rate exceeded" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/trips/request",
        descriptionMD: `
Creates a ride request. The trip service validates the rider, payment method, pickup and dropoff, obtains price and ETA estimates, persists a requested trip, and asks dispatch to find a driver.
`,
        request: `
{
  "riderId": "rider_456",
  "pickup": { "lat": 37.77652, "lng": -122.41734 },
  "dropoff": { "lat": 37.78910, "lng": -122.40112 },
  "rideType": "standard",
  "paymentMethodId": "pm_789",
  "idempotencyKey": "request_20260726_001"
}
`,
        response: `
{
  "tripId": "trip_abc",
  "state": "request",
  "regionId": "us-sf-bay",
  "fareEstimateCents": 1840,
  "etaSeconds": 360,
  "surgeMultiplier": 1.4
}
`,
        statusCodes: [
          { code: 201, meaning: "Trip request created" },
          { code: 400, meaning: "Invalid pickup, dropoff, or ride type" },
          { code: 401, meaning: "Rider authentication required" },
          { code: 402, meaning: "Payment method cannot be authorized" },
          { code: 409, meaning: "Duplicate idempotency key or active trip conflict" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/trips/{tripId}/driver-response",
        descriptionMD: `
Records a driver's response to a dispatch offer. The command is idempotent and versioned so duplicate mobile submissions cannot create two matches for the same trip.
`,
        request: `
{
  "driverId": "driver_123",
  "offerId": "offer_555",
  "response": "accept",
  "clientTimestamp": "2026-07-26T07:24:18Z",
  "stateVersion": 3
}
`,
        response: `
{
  "tripId": "trip_abc",
  "state": "match",
  "driverId": "driver_123",
  "pickupEtaSeconds": 300
}
`,
        statusCodes: [
          { code: 200, meaning: "Response accepted" },
          { code: 400, meaning: "Invalid response" },
          { code: 403, meaning: "Driver is not eligible for this offer" },
          { code: 404, meaning: "Trip or offer not found" },
          { code: 409, meaning: "Offer expired or trip already matched" },
        ],
      },
      {
        method: "PATCH",
        path: "/api/v1/trips/{tripId}/state",
        descriptionMD: `
Advances the trip state machine for events such as driver arrived, trip started, trip completed, rider canceled, or driver canceled. The trip service validates legal transitions and writes an append-only state event.
`,
        request: `
{
  "actorId": "driver_123",
  "actorType": "driver",
  "newState": "ongoing",
  "stateVersion": 7,
  "eventTimestamp": "2026-07-26T07:31:04Z",
  "location": { "lat": 37.77652, "lng": -122.41734 }
}
`,
        response: `
{
  "tripId": "trip_abc",
  "state": "ongoing",
  "stateVersion": 8,
  "updatedAt": "2026-07-26T07:31:04Z"
}
`,
        statusCodes: [
          { code: 200, meaning: "State updated" },
          { code: 400, meaning: "Illegal transition" },
          { code: 403, meaning: "Actor cannot update this trip" },
          { code: 404, meaning: "Trip not found" },
          { code: 409, meaning: "State version conflict" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/trips/{tripId}",
        descriptionMD: `
Returns the current trip view for rider or driver. The response includes state, assigned driver or rider details permitted for the caller, ETA, route summary, fare, and payment status.
`,
        response: `
{
  "tripId": "trip_abc",
  "state": "enroute",
  "driverId": "driver_123",
  "pickupEtaSeconds": 240,
  "routePolyline": "encoded_polyline",
  "fareEstimateCents": 1840,
  "paymentStatus": "authorized"
}
`,
        statusCodes: [
          { code: 200, meaning: "Trip returned" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Caller is not part of this trip" },
          { code: 404, meaning: "Trip not found" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/pricing/estimate",
        descriptionMD: `
Returns a pre-request fare estimate using pickup, dropoff, ride type, current supply-demand ratio, route distance, ETA, and market rules. The actual captured amount is finalized at completion.
`,
        response: `
{
  "regionId": "us-sf-bay",
  "rideType": "standard",
  "estimatedFareCents": 1840,
  "surgeMultiplier": 1.4,
  "estimatedDistanceMeters": 6120,
  "estimatedDurationSeconds": 1020
}
`,
        statusCodes: [
          { code: 200, meaning: "Estimate returned" },
          { code: 400, meaning: "Invalid pickup or dropoff" },
          { code: 429, meaning: "Estimate rate limit exceeded" },
        ],
      },
    ],
    notesMD: `
Mobile clients should use idempotency keys for trip creation and state-changing commands because networks are unreliable and retries are common. The location endpoint returns 202 Accepted because the hot path updates the current index and event stream; long-term storage, analytics, and model features are downstream.

Dispatch itself is not exposed as a public API. It is an internal command from the trip service to a regional dispatch service so the backend can enforce driver eligibility, rider safety rules, payment authorization, and marketplace policy before any offer is sent.
`,
  },
  databaseDesign: {
    schemaMD: `
Use durable storage for trips, assignments, payments, and auditable state transitions. Use a separate ephemeral current-location store and geospatial index for matching because storing every ping in the primary database would be too expensive and too slow.

The authoritative trip record is keyed by **trip_id** and belongs to one dispatch region. Location events can be retained in a streaming log and object storage, while the current driver location table stores only the latest known state used for matching.
`,
    tables: [
      {
        name: "current_driver_locations",
        columns: [
          { name: "driver_id", type: "uuid", note: "Primary key for latest location state" },
          { name: "region_id", type: "varchar(64)", note: "Geo-sharded dispatch region that owns this driver" },
          { name: "cell_id", type: "varchar(32)", note: "Geohash, QuadTree leaf, or S2 cell used for nearby lookup" },
          { name: "lat", type: "decimal(9,6)", note: "Latest latitude" },
          { name: "lng", type: "decimal(9,6)", note: "Latest longitude" },
          { name: "heading", type: "smallint", note: "Vehicle heading in degrees" },
          { name: "speed_mps", type: "decimal(6,2)", note: "Current speed in meters per second" },
          { name: "driver_state", type: "varchar(24)", note: "Available, offered, enroute, ongoing, offline" },
          { name: "updated_at", type: "timestamp", note: "Server time of latest accepted ping" },
          { name: "sequence", type: "bigint", note: "Monotonic client sequence for out-of-order protection" },
        ],
      },
      {
        name: "trips",
        columns: [
          { name: "trip_id", type: "uuid", note: "Primary key" },
          { name: "rider_id", type: "uuid", note: "Rider requesting the trip" },
          { name: "driver_id", type: "uuid nullable", note: "Assigned driver after match" },
          { name: "region_id", type: "varchar(64)", note: "Dispatch region that owns the trip state machine" },
          { name: "state", type: "varchar(24)", note: "Request, match, enroute, ongoing, complete, canceled, payment_failed" },
          { name: "pickup_lat", type: "decimal(9,6)", note: "Pickup latitude" },
          { name: "pickup_lng", type: "decimal(9,6)", note: "Pickup longitude" },
          { name: "dropoff_lat", type: "decimal(9,6)", note: "Dropoff latitude" },
          { name: "dropoff_lng", type: "decimal(9,6)", note: "Dropoff longitude" },
          { name: "fare_estimate_cents", type: "integer", note: "Quoted estimate before trip starts" },
          { name: "final_fare_cents", type: "integer nullable", note: "Final charge after completion" },
          { name: "surge_multiplier", type: "decimal(4,2)", note: "Multiplier applied at request time" },
          { name: "state_version", type: "integer", note: "Optimistic concurrency control" },
          { name: "created_at", type: "timestamp", note: "Request time" },
          { name: "completed_at", type: "timestamp nullable", note: "Completion time for retention and payouts" },
        ],
      },
      {
        name: "dispatch_offers",
        columns: [
          { name: "offer_id", type: "uuid", note: "Primary key" },
          { name: "trip_id", type: "uuid", note: "Trip being offered" },
          { name: "driver_id", type: "uuid", note: "Candidate driver" },
          { name: "offer_status", type: "varchar(24)", note: "Sent, accepted, rejected, timed_out, revoked" },
          { name: "rank_score", type: "decimal(8,3)", note: "Dispatch ranking score at offer time" },
          { name: "offered_at", type: "timestamp", note: "Time offer was pushed" },
          { name: "expires_at", type: "timestamp", note: "Deadline before trying another driver" },
          { name: "responded_at", type: "timestamp nullable", note: "Driver response time" },
        ],
      },
      {
        name: "trip_state_events",
        columns: [
          { name: "event_id", type: "uuid", note: "Primary key" },
          { name: "trip_id", type: "uuid", note: "Trip whose state changed" },
          { name: "from_state", type: "varchar(24)", note: "Previous state" },
          { name: "to_state", type: "varchar(24)", note: "New state" },
          { name: "actor_id", type: "uuid", note: "Rider, driver, operator, or system actor" },
          { name: "actor_type", type: "varchar(16)", note: "Rider, driver, system, support" },
          { name: "event_time", type: "timestamp", note: "Business event time" },
          { name: "state_version", type: "integer", note: "Version after the transition" },
        ],
      },
      {
        name: "payments",
        columns: [
          { name: "payment_id", type: "uuid", note: "Primary key" },
          { name: "trip_id", type: "uuid", note: "Unique trip payment reference" },
          { name: "rider_id", type: "uuid", note: "Charged rider" },
          { name: "driver_id", type: "uuid", note: "Driver receiving payout" },
          { name: "amount_cents", type: "integer", note: "Final captured fare" },
          { name: "currency", type: "char(3)", note: "ISO currency code" },
          { name: "payment_status", type: "varchar(24)", note: "Authorized, captured, failed, refunded" },
          { name: "processor_ref", type: "varchar(128)", note: "External payment processor identifier" },
          { name: "captured_at", type: "timestamp nullable", note: "Capture completion time" },
        ],
      },
    ],
    indexesMD: `
- **current_driver_locations.region_id, cell_id, driver_state** supports nearby-driver candidate lookup by region and cell.
- **current_driver_locations.updated_at** supports stale driver eviction when pings stop.
- **trips.rider_id, created_at** and **trips.driver_id, created_at** support rider and driver trip history.
- **trips.region_id, state, created_at** supports regional operations dashboards and recovery scans.
- **dispatch_offers.trip_id, offer_status** supports finding active offers for a trip.
- **payments.trip_id** should be unique so completion retries cannot double-charge a trip.
`,
    relationshipsMD: `
One trip can have many dispatch offers, exactly one accepted driver assignment, many state events, and at most one successful payment capture. Current driver location references a driver but is not the source of truth for driver identity. Trip state events are append-only and can rebuild the current trip state during recovery.
`,
    noSqlAlternativesMD: `
At high scale, use a region-partitioned key-value or wide-column store for current locations and trip state. Current driver locations can live in Redis, Aerospike, DynamoDB, Cassandra, or a purpose-built in-memory geo index. Trips and payments need stronger durability and idempotency; they can live in a relational database per region, Spanner-like globally distributed SQL, DynamoDB with transactions, or Cassandra with carefully designed compare-and-set transitions.

Raw location pings should flow through Kafka, Pub/Sub, or Kinesis and land in object storage for short-retention analytics, safety investigations, and model training. The dispatch hot path should read the latest current location and cell membership, not scan raw event history.
`,
  },
  architecture: {
    width: 980,
    height: 600,
    nodes: [
      { id: "mobile-apps", label: "Rider and Driver Apps", kind: "client", x: 70, y: 230, sublabel: "Requests, pings, trip updates" },
      { id: "edge-gateway", label: "Regional API Gateway", kind: "gateway", x: 230, y: 230, sublabel: "Auth, rate limits, routing" },
      { id: "location-ingest", label: "Location Ingestion", kind: "service", x: 405, y: 90, sublabel: "High-write ping path" },
      { id: "location-log", label: "Location Event Log", kind: "queue", x: 600, y: 50, sublabel: "Kafka, Pub/Sub" },
      { id: "geo-index", label: "Geo Index", kind: "search", x: 600, y: 150, sublabel: "Geohash, QuadTree, S2" },
      { id: "trip-service", label: "Trip Service", kind: "service", x: 405, y: 300, sublabel: "State machine" },
      { id: "dispatch-service", label: "Dispatch Service", kind: "service", x: 600, y: 300, sublabel: "Matching and offers" },
      { id: "pricing-service", label: "Pricing Service", kind: "analytics", x: 600, y: 430, sublabel: "Surge, fare estimate" },
      { id: "maps-routing", label: "Maps and Routing", kind: "external", x: 790, y: 210, sublabel: "ETA, distance, route" },
      { id: "notification-service", label: "Notification Service", kind: "service", x: 790, y: 340, sublabel: "Push, SMS fallback" },
      { id: "payment-service", label: "Payment Service", kind: "service", x: 790, y: 470, sublabel: "Authorize, capture" },
      { id: "trip-store", label: "Trip and Payment Store", kind: "database", x: 930, y: 360, sublabel: "Trips, offers, ledger" },
    ],
    edges: [
      { from: "mobile-apps", to: "edge-gateway", label: "trip APIs and pings" },
      { from: "edge-gateway", to: "location-ingest", label: "driver pings" },
      { from: "location-ingest", to: "location-log", label: "append events", dashed: true },
      { from: "location-ingest", to: "geo-index", label: "update latest cell" },
      { from: "edge-gateway", to: "trip-service", label: "request and state commands" },
      { from: "trip-service", to: "dispatch-service", label: "find driver" },
      { from: "dispatch-service", to: "geo-index", label: "nearby candidates" },
      { from: "dispatch-service", to: "pricing-service", label: "surge and incentives" },
      { from: "dispatch-service", to: "maps-routing", label: "ETA and route" },
      { from: "dispatch-service", to: "notification-service", label: "driver offer", dashed: true },
      { from: "notification-service", to: "mobile-apps", label: "push updates", dashed: true },
      { from: "dispatch-service", to: "trip-service", label: "accepted match" },
      { from: "trip-service", to: "maps-routing", label: "route updates" },
      { from: "trip-service", to: "payment-service", label: "capture at complete" },
      { from: "trip-service", to: "trip-store", label: "persist state" },
      { from: "payment-service", to: "trip-store", label: "payment status" },
    ],
    captionMD: `
Each dispatch region owns its active drivers, geo index, trip state transitions, matching loop, and local event streams. Routing, notifications, and payments are dependencies, but dispatch and trip state remain the control plane for a ride.
`,
  },
  architectureNotesMD: `
The system separates three workloads. Location ingestion is a high-write, mostly ephemeral stream that updates current driver positions and appends pings for downstream consumers. Dispatch is a low-latency decision loop that queries local cells, ranks candidates, sends offers, and retries when drivers reject or time out. Trip and payment processing is durable, versioned, and auditable.

Geo-sharded dispatch regions are the main scaling boundary. A region can be a city, airport zone, or dense metropolitan partition, and large cities can be split into smaller polygons. Riders and drivers are assigned to the same region for matching; boundary cases query neighboring regions only when necessary. This keeps matching local and avoids global locks.

The architecture deliberately avoids putting every location ping into the transactional trip database. The current geo index stores latest driver state for matching, while the event log stores pings for short retention, analytics, anomaly detection, and route reconstruction.
`,
  requestFlow: [
    {
      title: "Driver location is ingested",
      detailMD: `
The driver app sends a signed ping with location, heading, speed, availability, timestamp, and sequence number. The gateway authenticates the driver and routes the request to the driver's current dispatch region.
`,
    },
    {
      title: "Current geo index is updated",
      detailMD: `
The location ingestion service rejects impossible jumps, stale timestamps, and out-of-order sequence numbers. It maps the coordinate to a geohash, QuadTree leaf, or S2 cell, updates the driver's latest state, moves the driver between cell membership sets if needed, and appends the ping to the location event log.
`,
    },
    {
      title: "Rider requests a trip",
      detailMD: `
The rider app sends pickup, dropoff, ride type, and payment method. The trip service validates the rider, checks for an existing active trip, authorizes the payment method, assigns the request to a dispatch region based on pickup, and creates a trip in the request state with an idempotency key.
`,
    },
    {
      title: "ETA and price estimate are prepared",
      detailMD: `
The pricing service reads local supply and demand counters, surge rules, ride type, and route distance. The maps and routing service estimates pickup ETA and trip duration. The rider sees the quoted estimate before dispatch commits to a driver.
`,
    },
    {
      title: "Dispatch queries nearby candidates",
      detailMD: `
The dispatch service asks the geo index for available drivers in the pickup cell and expanding neighboring cells. It filters stale locations, incompatible vehicle types, drivers already locked by another offer, low-quality matches, and drivers too far away by ETA.
`,
    },
    {
      title: "Candidate drivers are ranked and offered",
      detailMD: `
Candidates are ranked by pickup ETA, distance, driver acceptance probability, fairness constraints, destination mode, cancellation risk, and marketplace policy. The top driver receives a push notification with a short expiration window. The offer is recorded so retry and timeout handling are deterministic.
`,
    },
    {
      title: "Driver accepts and trip is matched",
      detailMD: `
When the driver accepts, the dispatch service atomically transitions the trip from request to match, locks the driver as enroute, revokes any competing offers, and notifies both rider and driver. Duplicate accepts are rejected by trip state version checks.
`,
    },
    {
      title: "Trip progresses through lifecycle states",
      detailMD: `
Driver arrived, trip started, rider canceled, driver canceled, and trip completed are treated as state-machine commands. The trip service validates legal transitions such as match to enroute to ongoing to complete, writes an append-only state event, updates the current trip row, and pushes status changes to both apps.
`,
    },
    {
      title: "Completion triggers payment and receipts",
      detailMD: `
At completion, the trip service computes final fare from route, duration, tolls, promotions, surge fixed at request time, and local rules. The payment service captures the rider charge, records payment status, emits payout events, and sends receipts. If capture fails, the trip remains complete but payment status moves to a recoverable failed state.
`,
    },
  ],
  coreComponents: [
    {
      name: "Location Ingestion Service",
      kind: "service",
      role: "Absorbs high-throughput driver pings and keeps current location fresh.",
      detailMD: `
This stateless regional service validates pings, deduplicates by sequence, maps coordinates to cells, updates the latest driver location, and writes a compact event to the streaming log. It should scale horizontally by region and driver id, use bounded retries, and avoid synchronous writes to the trip database.
`,
    },
    {
      name: "Geospatial Index",
      kind: "search",
      role: "Serves nearby-driver lookups for dispatch.",
      detailMD: `
The index stores active driver membership by region and cell, plus latest driver metadata needed for filtering. It can be implemented with Redis sorted sets, geohash buckets, an S2 cell hierarchy, a QuadTree, or a custom in-memory index. It must support fast updates and expanding-radius queries.
`,
    },
    {
      name: "Dispatch Service",
      kind: "service",
      role: "Pairs riders with drivers and manages offer retries.",
      detailMD: `
Dispatch queries nearby drivers, filters and ranks candidates, locks one or more drivers for offers depending on product policy, sends notifications, handles accept, reject, timeout, and cancellation, and commits the winning match through the trip service.
`,
    },
    {
      name: "Trip Service",
      kind: "service",
      role: "Owns the authoritative trip lifecycle state machine.",
      detailMD: `
The trip service persists requests, enforces legal state transitions, stores state events, handles idempotency keys, protects against duplicate matches, and publishes trip updates. It is the source of truth for whether a ride is requested, matched, enroute, ongoing, complete, canceled, or payment failed.
`,
    },
    {
      name: "Pricing Service",
      kind: "analytics",
      role: "Computes fare estimates and surge multipliers.",
      detailMD: `
Pricing combines base fare, route distance, estimated duration, city rules, promotions, rider and driver incentives, and real-time supply-demand imbalance. Surge should be updated in small geo-time windows but quoted consistently once the rider confirms a trip.
`,
    },
    {
      name: "Maps and Routing Service",
      kind: "external",
      role: "Provides ETA, distance, route, and navigation hints.",
      detailMD: `
This service estimates pickup ETA, route duration, distance, and sometimes route polyline. Because routing can be expensive, dispatch should cache common route estimates briefly, bound fanout, and degrade to distance-based heuristics when the dependency is slow.
`,
    },
    {
      name: "Notification Service",
      kind: "service",
      role: "Delivers driver offers and trip updates to mobile devices.",
      detailMD: `
The notification service sends push notifications, in-app socket messages, SMS fallbacks for critical events, and delivery receipts. Dispatch cannot assume a push was seen; offer expiration and polling should handle missed notifications.
`,
    },
    {
      name: "Payment Service",
      kind: "service",
      role: "Authorizes payment before dispatch and captures fare at completion.",
      detailMD: `
Payments must be idempotent and auditable. The service pre-authorizes or validates the rider payment method before dispatch, captures the final fare after completion, records processor references, and emits payout and receipt events without blocking trip completion forever.
`,
    },
  ],
  deepDives: [
    {
      topic: "Real-time driver location ingestion",
      detailMD: `
Driver pings dominate write volume. At 1.5M online drivers pinging every 3 seconds, peak ingestion is about 500,000 writes per second. Treat this as a streaming workload, not a transactional database workload. The hot path should validate, deduplicate, update current location, and append to a log with backpressure.

A practical design keeps latest driver state in an in-memory or low-latency key-value store keyed by driver_id and indexed by region plus cell_id. Every ping does not need to update every downstream view synchronously. Analytics, heatmaps, fraud models, and route reconstruction consume the log asynchronously.

Location freshness is more important than perfect history for dispatch. If a ping is late or out of order, the current index should ignore it. If a driver has no accepted ping for 10 to 20 seconds, dispatch should mark the driver stale and stop offering trips until a fresh ping arrives.
`,
    },
    {
      topic: "Geospatial indexing for nearby drivers",
      detailMD: `
Nearby-driver lookup needs a spatial index that supports frequent updates and low-latency radius search. Geohash buckets are simple: encode latitude and longitude to a string prefix, query the pickup bucket and neighbors, then expand precision or radius. The drawback is uneven cell shape and edge cases near boundaries.

QuadTrees recursively split space into rectangular cells and can adapt to density by splitting crowded urban cells more deeply. They work well for in-memory regional indexes but need careful rebalancing as density shifts. S2 cells project the sphere onto hierarchical cells and avoid some geohash distortion; they are a strong choice for global systems because cell IDs have stable hierarchy and neighbor operations.

Regardless of index type, dispatch should not trust cell membership alone. It should fetch candidate driver metadata, remove stale and ineligible drivers, compute real road-network ETA for a smaller candidate set, and expand to neighboring cells only until enough high-quality candidates are found.
`,
    },
    {
      topic: "Geo-sharded dispatch regions",
      detailMD: `
The world should be partitioned into dispatch regions such as cities, airport zones, or dense metropolitan shards. A region owns its current driver index, trip requests, offer locks, surge counters, and matching decisions. This avoids a global dispatch lock and lets teams scale busy cities independently.

Region assignment normally uses pickup location for riders and latest location for drivers. Boundary cases are handled by querying neighboring regions or temporarily transferring driver ownership. Large cities can be split into polygons or S2 cell groups when a single region becomes too hot.

Geo-sharding also improves failure isolation. A routing slowdown in one city, a bad surge configuration, or a broker backlog should not affect every region. Global services such as identity and payment remain shared, but dispatch should keep enough local state to continue operating through partial outages.
`,
    },
    {
      topic: "Matching and dispatch algorithm",
      detailMD: `
The simplest algorithm chooses the nearest available driver by straight-line distance. A production dispatch service ranks candidates by pickup ETA, road distance, vehicle type, driver state, recent acceptance rate, cancellation risk, fairness, driver destination preferences, rider safety constraints, and market policy.

Dispatch must handle offer contention. A driver should not receive several overlapping offers that can all be accepted. Common approaches include a short-lived driver lock in the regional store, a compare-and-set on driver state from available to offered, or a lease tied to offer expiration. If the driver rejects or times out, the lease is released and the next candidate is tried.

Batch offers can reduce rider wait time but increase driver spam and duplicate accepts. Sequential offers are simpler and fairer but can be slower. A strong interview answer starts sequential, then discusses controlled parallelism for high-demand or low-supply situations.
`,
    },
    {
      topic: "Supply-demand surge pricing",
      detailMD: `
Surge pricing balances marketplace demand and supply. Compute it over small geo-time windows such as S2 cells or city neighborhoods every 30 to 60 seconds. Inputs include open ride requests, available drivers, accepted trips, cancellations, driver arrival rates, weather, events, and historical baselines.

The multiplier should be smoothed to avoid oscillation. If one cell jumps from normal to high surge every minute, riders and drivers see confusing prices and may game boundaries. Use dampening, caps, minimum duration, and neighborhood blending. Once a rider confirms a trip, freeze the quoted multiplier for that request so the fare does not change while dispatch retries.

Surge is also an operations and trust issue. The pricing service should expose explainability, audit logs, emergency caps, and local regulatory controls. Dispatch can use incentives separately from rider surge, for example paying drivers bonuses without changing rider price.
`,
    },
    {
      topic: "Trip lifecycle, routing, notifications, and payments",
      detailMD: `
Model the trip lifecycle as a strict state machine: request, match, enroute, ongoing, complete, payment captured, plus terminal cancellation and payment failure paths. Each transition should be an idempotent command with actor authorization and expected state version. This prevents duplicate accepts, double starts, and double payments.

Routing and ETA are advisory but critical to user experience. Dispatch can use rough distance to shortlist candidates, then call maps for top candidates. During an active trip, route updates can be cached or throttled because every location ping should not trigger a full route recomputation.

Notifications are best-effort delivery mechanisms, not the source of truth. The apps should poll or maintain a socket for authoritative state. Payment capture happens after completion with an idempotency key based on trip_id, so retries cannot charge twice. If payment is delayed, the trip can still complete while collections and support workflows continue.
`,
    },
  ],
  scaling: [
    {
      stage: "Prototype: one city and simple matching",
      detailMD: `
Start with one regional API, one relational database for trips, Redis GEO or geohash buckets for available drivers, and sequential nearest-driver matching. Driver pings update Redis and write a compact log. This proves the lifecycle, dispatch offer handling, and payment flow.
`,
    },
    {
      stage: "Growth: many cities and regional isolation",
      detailMD: `
Partition drivers and riders by city-level dispatch region. Run independent location ingestion, geo index, dispatch workers, and trip databases per region or region group. Add Kafka for location and trip events, push notification retries, and dashboards for stale drivers, match latency, and cancellation rate.
`,
    },
    {
      stage: "Large scale: dense geo shards and high-write streams",
      detailMD: `
Split dense cities into smaller polygons or S2 cell groups. Use sharded in-memory geo indexes, broker partitions by region and driver id, and separate write paths for pings, trip commands, and analytics. Add controlled parallel offers, route estimate caching, and surge windows computed per cell.
`,
    },
    {
      stage: "Global scale: multi-region control plane",
      detailMD: `
Deploy dispatch regions close to users across continents. Use global identity, payment, fraud, and maps integrations, but keep active trip state local to the pickup region. Replicate completed trips and financial records to durable global stores for support, compliance, and analytics.
`,
    },
    {
      stage: "Extreme events: airports, concerts, and weather spikes",
      detailMD: `
Pre-split known hot zones, pre-warm geo index shards, reserve routing capacity, use queueing for rider requests, smooth surge updates, and show honest wait times. Protect active trips and safety flows before accepting unlimited new demand.
`,
    },
  ],
  bottlenecks: [
    {
      issue: "Location ingestion overwhelms storage",
      optimizationMD: `
Keep the hot path to current-index update plus append to a partitioned log. Compact or sample old pings, store raw history in object storage with retention, and avoid writing every ping into the transactional trip database.
`,
    },
    {
      issue: "Hot cells in dense city centers",
      optimizationMD: `
Split crowded cells dynamically, shard cell membership sets, replicate hot read cells, cap candidate counts, and use nearby subcells before expanding radius. Monitor cell update QPS and candidate-query latency by region.
`,
    },
    {
      issue: "Dispatch retries create offer storms",
      optimizationMD: `
Use short leases, offer expiration, bounded retry count, backoff, and controlled parallelism. Exclude drivers with recent rejects for similar requests and maintain per-driver offer rate limits.
`,
    },
    {
      issue: "Maps and routing calls become expensive",
      optimizationMD: `
Shortlist candidates using cheap geometry first, then call routing only for top candidates. Cache route estimates briefly by origin cell and destination cell, batch requests where possible, and degrade to distance-based ETA when maps are slow.
`,
    },
    {
      issue: "Trip state contention and duplicate commands",
      optimizationMD: `
Use optimistic state_version checks, idempotency keys, append-only state events, and compare-and-set transitions. Treat mobile retries as normal, not exceptional.
`,
    },
    {
      issue: "Payment provider latency at trip completion",
      optimizationMD: `
Make capture idempotent and asynchronous after recording completion. Show completion to rider and driver while payment status is pending, retry capture safely, and send failed-payment workflows to collections or support.
`,
    },
  ],
  failureHandling: [
    {
      scenario: "Driver location stream backlog",
      strategyMD: `
Prioritize current location updates over historical event retention. Drop or sample non-critical analytics events under pressure, mark drivers stale when freshness exceeds threshold, and scale ingestion partitions by region. Dispatch should prefer fresh pings and avoid drivers with delayed updates.
`,
    },
    {
      scenario: "Geo index shard fails",
      strategyMD: `
Rebuild the shard from latest driver snapshots and recent location log partitions. During recovery, query replicas or neighboring shards with lower confidence, reduce match radius expansion, and communicate longer pickup times instead of dispatching stale drivers.
`,
    },
    {
      scenario: "Notification delivery is delayed",
      strategyMD: `
Do not rely only on push. Driver apps should maintain a socket or poll for active offers, and offers should expire server-side. If delivery receipts are missing, dispatch retries another candidate after the deadline.
`,
    },
    {
      scenario: "Maps and routing dependency is unavailable",
      strategyMD: `
Use cached road speeds, historical ETA by cell pair, straight-line distance with conservative multipliers, and reduced candidate fanout. Continue active trips with degraded ETA while alerting users that estimates may be less accurate.
`,
    },
    {
      scenario: "Regional dispatch outage",
      strategyMD: `
Fail new requests for the affected region to a warm standby or neighboring region if it has a recent replicated snapshot of drivers and trips. Active trip state must be recovered from the trip event log. If safe failover is not possible, pause new matching but keep active trip support and emergency flows available.
`,
    },
    {
      scenario: "Payment capture fails after trip completion",
      strategyMD: `
Do not roll back the completed trip. Mark payment_failed, retry with idempotency, notify the rider, restrict future trips if necessary, and keep driver payout policy separate from immediate rider collection.
`,
    },
  ],
  security: [
    {
      label: "Location privacy",
      detailMD: `
Encrypt location in transit and at rest, restrict employee access, apply retention limits, and avoid exposing exact historical paths except for legitimate rider, driver, support, safety, or regulatory needs.
`,
    },
    {
      label: "Authentication and device trust",
      detailMD: `
Rider and driver apps need strong authentication, device binding, token rotation, and protection against replayed location pings. Driver pings should include sequence numbers and server-side sanity checks for impossible movement.
`,
    },
    {
      label: "Fraud prevention",
      detailMD: `
Detect GPS spoofing, collusion, fake trips, payment abuse, promotion abuse, and account takeover. Cross-check location with sensor signals, historical driver behavior, route plausibility, and payment risk.
`,
    },
    {
      label: "Payment security",
      detailMD: `
Store payment tokens rather than raw card data, use a compliant payment processor, make capture idempotent, and separate financial ledger permissions from general trip operations.
`,
    },
    {
      label: "Safety and emergency controls",
      detailMD: `
Provide audit trails, real-time trip sharing, emergency escalation, masked phone numbers, abuse reporting, and support tools that can see enough state to help without exposing unnecessary personal data.
`,
    },
    {
      label: "Rate limiting and abuse controls",
      detailMD: `
Rate-limit trip requests, price estimates, location pings, and driver responses by account, device, IP, and region. Protect dispatch from scripted rider requests and malicious drivers attempting to manipulate surge.
`,
    },
  ],
  tradeoffs: {
    pros: [
      "Geo-sharded dispatch keeps matching local and avoids global coordination.",
      "Separating current location from durable trip storage lets the high-write ping path scale independently.",
      "A strict trip state machine prevents duplicate matches, illegal transitions, and double payments.",
      "Asynchronous event streams support analytics and safety without slowing dispatch.",
      "Surge windows give the marketplace a real-time supply-demand control loop.",
    ],
    cons: [
      "Regional ownership adds complexity at city boundaries and during failover.",
      "Ephemeral current-location indexes can lose freshness if ingestion or shards fail.",
      "Sequential driver offers are simpler but may increase rider wait time in low-supply areas.",
      "Parallel offers improve speed but increase contention, driver spam, and duplicate-accept handling.",
      "Routing and pricing dependencies can become expensive and hard to make globally consistent.",
    ],
    alternativesMD: `
Alternative one is a central global dispatch service. It is easier to reason about initially, but it becomes a latency, availability, and coordination bottleneck as cities and location writes scale.

Alternative two is purely nearest-driver matching. It is simple and fast, but it ignores road ETA, driver acceptance probability, fairness, cancellations, and marketplace health. It works for a prototype but not for a mature ride-hailing product.

Alternative three is to outsource maps, pricing, notifications, and payments entirely. This accelerates launch, but the product still needs local fallback behavior, idempotent state transitions, and strong observability because those dependencies directly affect trips.
`,
    whenNotToUseMD: `
Do not use this architecture for scheduled long-haul logistics, public transit planning, or fleet management where dispatch can be optimized in batches over minutes or hours. Ride-hailing needs second-level decisions, mobile push reliability, and real-time location freshness; slower planning systems can trade latency for global optimization.
`,
  },
  followUpQuestions: [
    {
      question: "How do you choose between geohash, QuadTree, and S2 cells?",
      answerMD: `
Geohash is simple and widely understood, but cell shapes and boundary behavior can be awkward. QuadTrees adapt well to density but require careful split and merge management. S2 provides a global hierarchical cell system with good neighbor operations, so it is often the strongest production answer for worldwide dispatch. The key is still to filter by freshness and ETA after cell lookup.
`,
    },
    {
      question: "How do you prevent the same driver from accepting two trips?",
      answerMD: `
Use a short-lived driver lease or compare-and-set transition from available to offered, then from offered to enroute only for one trip. Store offer_id and trip_id in the driver state, expire leases quickly, and commit the final match through the trip service with state_version checks.
`,
    },
    {
      question: "What happens if the rider is near a region boundary?",
      answerMD: `
Assign the primary region by pickup location, then query neighboring regions when the pickup cell touches a boundary or there are not enough candidates. If a driver from a neighboring region wins, transfer driver ownership or create a cross-region lease for that trip. Keep the trip state owned by one region to avoid split-brain transitions.
`,
    },
    {
      question: "Should every driver ping be stored forever?",
      answerMD: `
No. Dispatch needs only the latest fresh location. Raw pings can be retained for a limited window in logs and cheaper storage for safety, support, fraud, and analytics. Long retention should be purpose-limited and privacy-reviewed because precise location history is sensitive.
`,
    },
    {
      question: "How is surge computed without oscillation?",
      answerMD: `
Compute supply-demand imbalance in small geo-time windows, then smooth changes across neighboring cells and time. Apply caps, minimum duration, and dampening. Freeze the surge multiplier when the rider confirms a request so retries do not change the quoted price.
`,
    },
    {
      question: "How do you handle a payment failure after a completed trip?",
      answerMD: `
Trip completion remains durable. The payment service marks capture failed, retries idempotently, notifies the rider, and triggers collections or support. Do not move the trip back to ongoing or charge twice. Driver payout policy can be handled by financial operations rules.
`,
    },
    {
      question: "Why not recompute routes for every location ping?",
      answerMD: `
At hundreds of thousands of pings per second, routing every ping would overwhelm maps infrastructure and add little value. Use routing for request-time estimates, top dispatch candidates, major route deviations, and periodic active-trip updates. For the rest, use cached speeds or lightweight geometry.
`,
    },
  ],
  companyVariations: [
    {
      company: "Uber",
      angleMD: `
Uber interviewers are likely to push hardest on real-time dispatch, geo-sharding, location freshness, driver locks, matching quality, surge behavior, and trip lifecycle correctness. Be ready to discuss city boundaries, airport hot zones, stale drivers, and how to keep active trips safe during regional incidents.
`,
    },
    {
      company: "Amazon",
      angleMD: `
Amazon often probes operational excellence, partitioning, failure isolation, idempotency, and cost. Frame location ingestion as a streaming write path, explain how DynamoDB or Kinesis-style partitioning would work by region and driver id, and call out alarms for lag, stale drivers, and payment retries.
`,
    },
    {
      company: "Google",
      angleMD: `
Google interviewers may focus on geospatial indexing, S2 cells, global scale, routing and ETA quality, tail latency, and data freshness. Expect follow-ups on how to reduce routing calls, how to handle boundary cells, and how to make matching robust under high write throughput.
`,
    },
  ],
  relatedQuestions: [
    {
      slug: "notification-service",
      note: "Driver offers and rider status changes depend on reliable push and fallback delivery.",
    },
    {
      slug: "payment-gateway",
      note: "Trip completion requires idempotent fare capture and payment failure recovery.",
    },
    {
      slug: "distributed-cache",
      note: "The current driver geo index and short-lived locks are cache-heavy regional workloads.",
    },
    {
      slug: "global-load-balancer",
      note: "Riders and drivers must be routed to healthy nearby regions with controlled failover.",
    },
    {
      slug: "metrics-collection",
      note: "Dispatch quality depends on real-time metrics for stale drivers, match latency, cancellations, and surge.",
    },
  ],
  interviewTips: {
    commonMistakes: [
      "Storing every driver ping synchronously in the primary relational database.",
      "Using only nearest straight-line distance and ignoring road ETA, freshness, and driver eligibility.",
      "Forgetting driver offer locks, duplicate accepts, and trip state versioning.",
      "Treating notifications as authoritative instead of best-effort delivery.",
      "Letting payment failure roll back a completed trip or charge the rider twice.",
      "Ignoring region boundaries, hot cells, and city-level failure isolation.",
    ],
    redFlags: [
      "No concrete math for millions of drivers pinging every few seconds.",
      "No geospatial index or unclear nearby-driver query strategy.",
      "No trip lifecycle state machine with legal transitions.",
      "No plan for surge pricing or supply-demand imbalance.",
      "No strategy for stale driver locations and out-of-order pings.",
      "No idempotency for trip request, driver accept, or payment capture.",
    ],
    expectations: [
      "State assumptions for trips per day, online drivers, ping interval, matching QPS, and storage.",
      "Separate location ingestion, geo index, dispatch, trip state, pricing, routing, notifications, and payments.",
      "Partition the world into dispatch regions and explain boundary handling.",
      "Describe geohash, QuadTree, or S2 cell lookup plus candidate filtering.",
      "Walk through request to match to enroute to ongoing to complete to payment.",
      "Discuss failure handling for maps, notifications, geo index, region outage, and payment failure.",
    ],
    communicationMD: `
Start by naming the crux: Uber is a real-time geo marketplace, not a simple trip table. Draw the regional boundary first, then show driver pings flowing into a current geo index, rider requests flowing into trip and dispatch, and dispatch using pricing and routing to choose a driver. After the main flow is clear, add state-machine correctness, surge pricing, notifications, payments, and failure modes.
`,
  },
  revisionNotesMD: `
- Location ingestion is the highest-write path: 1.5M peak online drivers pinging every 3 seconds is about 500,000 pings per second.
- Keep current driver location in a fresh geo index and append pings to a log. Do not synchronously store every ping in the trip database.
- Partition the world into geo-sharded dispatch regions. A region owns its active drivers, trip requests, offer locks, surge counters, and matching loop.
- Nearby-driver queries use geohash, QuadTree, or S2 cells, then filter by freshness, vehicle type, driver state, eligibility, and ETA.
- Dispatch ranks candidates by pickup ETA, road distance, acceptance probability, fairness, cancellation risk, and marketplace policy.
- The trip lifecycle should be a strict state machine: request to match to enroute to ongoing to complete to payment, with cancellation and payment failure as terminal or recoverable branches.
- Surge pricing is computed in small geo-time windows, smoothed across space and time, and frozen when the rider confirms the request.
- Notifications deliver offers and updates, but server-side state is authoritative. Offers expire even if push delivery is delayed.
- Payment capture at trip end must be idempotent and should not double-charge on retries.
`,
  flashcards: [
    {
      front: "What is the highest-volume write path in Uber?",
      back: "Driver location ingestion, because millions of online drivers send pings every few seconds.",
    },
    {
      front: "Why should location pings not all be written synchronously to the trip database?",
      back: "The volume is too high and most pings are ephemeral for matching. Update the current geo index and append pings to a streaming log instead.",
    },
    {
      front: "What does a dispatch region own?",
      back: "Active drivers, current geo index, trip requests, offer locks, surge counters, and local matching decisions.",
    },
    {
      front: "Name three geospatial indexing options for nearby-driver queries.",
      back: "Geohash buckets, QuadTrees, and S2 cells.",
    },
    {
      front: "What states should the core trip lifecycle include?",
      back: "Request, match, enroute, ongoing, complete, and payment, with cancellation and payment failure paths.",
    },
    {
      front: "How do you prevent one driver from accepting multiple trips?",
      back: "Use a short-lived driver offer lease and compare-and-set state transitions tied to offer_id and trip_id.",
    },
    {
      front: "Why is surge pricing smoothed?",
      back: "To avoid oscillation, confusing rider prices, boundary gaming, and unstable driver incentives.",
    },
    {
      front: "Why must payment capture be idempotent?",
      back: "Mobile and backend retries are common; idempotency prevents duplicate charges for the same completed trip.",
    },
  ],
  quiz: [
    {
      question: "At peak, 1.5M online drivers ping every 3 seconds. What is the approximate location ingest rate?",
      options: ["50,000 pings per second", "160,000 pings per second", "500,000 pings per second", "3,000,000 pings per second"],
      answerIndex: 2,
      explanationMD: `
1.5M online drivers divided by a 3 second ping interval is about 500,000 pings per second.
`,
    },
    {
      question: "Which component should serve nearby-driver queries on the dispatch hot path?",
      options: ["Raw location event history", "Geospatial current-location index", "Payment ledger", "Support analytics warehouse"],
      answerIndex: 1,
      explanationMD: `
Dispatch needs latest active driver positions with low latency. It should query a current geospatial index, not scan raw location history.
`,
    },
    {
      question: "Why partition the world into geo-sharded dispatch regions?",
      options: ["To make all rides globally serialized", "To keep matching local, reduce latency, and isolate failures", "To avoid storing trip records", "To remove the need for maps"],
      answerIndex: 1,
      explanationMD: `
Regional ownership keeps driver indexes, offer locks, trip requests, and surge counters close to the users and avoids global coordination on every match.
`,
    },
    {
      question: "What is the safest way to handle duplicate driver accept requests?",
      options: ["Accept both and choose later", "Ignore state and trust the mobile app", "Use idempotency and compare-and-set state transitions", "Charge the rider immediately"],
      answerIndex: 2,
      explanationMD: `
Driver accepts can be retried or delayed. The backend must use offer identity, idempotency, and state_version checks so only one legal match commits.
`,
    },
    {
      question: "Which trip lifecycle order is the best core model?",
      options: ["Request, match, enroute, ongoing, complete, payment", "Payment, request, complete, match, ongoing", "Ongoing, request, enroute, match, payment", "Match, payment, request, complete"],
      answerIndex: 0,
      explanationMD: `
The rider requests a trip, dispatch matches a driver, the driver goes enroute, the ride becomes ongoing, the trip completes, and payment capture follows completion.
`,
    },
    {
      question: "What should happen if payment capture fails after the trip is complete?",
      options: ["Undo the completed trip", "Retry idempotently and mark payment as failed or pending", "Create a second trip", "Dispatch a new driver"],
      answerIndex: 1,
      explanationMD: `
The completed trip is durable. Payment capture should be retried with an idempotency key and tracked with a recoverable failed or pending status.
`,
    },
  ],
  cheatSheetMD: `
**Goal**: design a real-time ride-hailing marketplace that matches riders to nearby drivers, tracks the trip lifecycle, computes price and ETA, notifies both sides, and captures payment.

**Workload**: 25M trips per day is about 289 trips per second average and around 2,900 matching requests per second at 10x peak. 1.5M online drivers pinging every 3 seconds is about 500,000 location pings per second.

**Location path**: driver app to gateway to location ingestion to current geo index plus location event log. Keep latest state fresh and discard stale or out-of-order pings.

**Geo index**: use geohash, QuadTree, or S2 cells. Query pickup cell and neighbors, then filter by freshness, vehicle type, availability, driver state, and ETA.

**Dispatch**: rank candidates by pickup ETA, road distance, acceptance probability, fairness, cancellation risk, and policy. Use short driver leases so one driver cannot accept multiple trips.

**Trip state**: request to match to enroute to ongoing to complete to payment, with cancellation and payment failure handled explicitly. Use idempotency keys and state_version checks.

**Surge**: compute supply-demand imbalance in geo-time windows, smooth changes, cap extremes, and freeze the multiplier when the rider confirms.

**Routing**: use cheap geometry to shortlist and maps routing for top candidates. Cache route estimates and degrade to historical ETA when maps are slow.

**Notifications**: push offers and status updates, but server state is authoritative. Offers expire server-side and apps should poll or use sockets.

**Payments**: authorize before dispatch if required, capture at completion, store payment status durably, and make retries idempotent.
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
      title: "S2 Geometry Library",
      kind: "Docs",
      url: "https://s2geometry.io/",
      author: "Google",
    },
    {
      title: "The Tail at Scale",
      kind: "Paper",
      url: "https://research.google/pubs/the-tail-at-scale/",
      author: "Jeffrey Dean and Luiz Andre Barroso",
    },
  ],
};
