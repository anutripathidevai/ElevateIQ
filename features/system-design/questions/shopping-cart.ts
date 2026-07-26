import type { SDQuestionContent } from "../types";

export const shoppingCartContent: SDQuestionContent = {
  slug: "shopping-cart",
  statementMD: `
Design a Shopping Cart service for an e-commerce product. The service lets anonymous guests and authenticated shoppers add items, change quantities, remove items, view the current cart, and hand the cart off to checkout. It must work across web and mobile clients, survive page refreshes and device changes, and avoid losing user intent when a guest logs in.

At interview scale, assume tens of millions of daily shoppers, millions of active carts, bursty sale traffic, and dependencies on catalog, pricing, inventory, checkout, and payments. The hard part is not storing a list of items; it is choosing where cart state lives, preserving a good user experience under eventual consistency, reconciling guest and authenticated carts, expiring abandoned carts, and making checkout validate prices and reserve inventory safely.

The default design should optimize for fast reads and writes, durable recovery of important cart state, clear ownership semantics, and a clean boundary between cart intent and checkout commitment. A cart can be eventually consistent, but placing an order cannot be.
`,
  businessUseCaseMD: `
A shopping cart converts product discovery into purchase intent. It keeps selected items available while a shopper compares options, changes devices, applies promotions, or waits before buying.

For businesses, the cart is also a high-value signal. Abandoned carts drive remarketing, cart changes inform demand forecasting, and cart-to-checkout conversion exposes problems in pricing, inventory, shipping, and payment flows.
`,
  functionalRequirements: [
    "Create and retrieve a cart for an anonymous guest session or authenticated user.",
    "Add an item with sku, quantity, selected options, and optional seller or fulfillment metadata.",
    "Update item quantity, remove an item, and clear the cart.",
    "Persist authenticated carts across devices and browser sessions.",
    "Merge a guest cart into the authenticated user's cart on login without losing user intent.",
    "Show current price, availability, and warnings when the cart is viewed or refreshed.",
    "Hand the cart off to checkout with an immutable checkout snapshot and idempotent request.",
    "Expire abandoned guest carts and old authenticated carts according to product retention policy.",
  ],
  nonFunctionalRequirements: [
    {
      label: "Latency",
      detailMD: `
Cart reads and item mutations are in the shopping path, so target under 100ms p99 inside a region for cache-backed operations and under 250ms p99 when durable storage or product validation is needed. Checkout handoff can be slower, but should still return quickly with a reservation or a clear retryable failure.
`,
    },
    {
      label: "Availability",
      detailMD: `
The cart should remain available during catalog, recommendations, analytics, or notification failures. If pricing or inventory is degraded, the service can show stale hints with warnings, but checkout must revalidate before order creation.
`,
    },
    {
      label: "Scalability",
      detailMD: `
Cart traffic is bursty around promotions and holidays. The design should scale stateless Cart Service instances horizontally, partition cart state by cart owner or cart id, and isolate hot sale items so one SKU does not overload the entire store.
`,
    },
    {
      label: "Durability",
      detailMD: `
Authenticated carts represent meaningful purchase intent and should survive cache loss, process restarts, and regional failover. Guest carts can have shorter durability guarantees, but losing them frequently hurts conversion and user trust.
`,
    },
    {
      label: "Consistency",
      detailMD: `
A cart is allowed to be eventually consistent across devices, but mutations should be monotonic and mergeable. Checkout must use a stronger boundary: validate catalog, price, promotions, and inventory against authoritative services before reserving stock.
`,
    },
    {
      label: "Correctness at checkout",
      detailMD: `
Add-time price and availability are only hints. The system must explain price changes, item removals, quantity reductions, and out-of-stock conditions at checkout rather than silently placing an invalid order.
`,
    },
    {
      label: "Abandonment and retention",
      detailMD: `
Guest carts should expire quickly, such as 7 to 30 days. Authenticated carts can live longer, such as 90 to 180 days, but old items should be refreshed or invalidated to avoid stale price and inventory promises.
`,
    },
  ],
  capacityEstimation: {
    assumptionsMD: `
Assume 40M daily active shoppers, 25 percent of them modify a cart on a typical day, an average of 4 cart mutations per modifying shopper, and a 10x peak multiplier during large sales. Assume 30M active carts retained at any time across guests and authenticated users.

Assume an average cart has 8 line items. A cart header is about 600 bytes and each line item is about 300 bytes after including sku, quantity, selected options, seller, timestamps, version, and small validation hints. That makes the average cart about 3 KB before database indexes and cache overhead.
`,
    metrics: [
      {
        label: "Daily cart mutators",
        value: "10M shoppers per day",
        note: "25 percent of 40M daily active shoppers",
      },
      {
        label: "Cart mutations",
        value: "40M writes per day",
        note: "10M mutating shoppers times 4 add, update, or remove actions",
      },
      {
        label: "Average write QPS",
        value: "463 writes per second",
        note: "40M writes divided by 86,400 seconds",
      },
      {
        label: "Peak write QPS",
        value: "4,600 to 5,000 writes per second",
        note: "10x sale multiplier",
      },
      {
        label: "Average read QPS",
        value: "2,300 reads per second",
        note: "About 5 cart reads per cart mutation",
      },
      {
        label: "Peak read QPS",
        value: "23,000 to 25,000 reads per second",
        note: "10x peak multiplier",
      },
      {
        label: "Active carts",
        value: "30M carts",
        note: "Guest and authenticated carts retained within TTL windows",
      },
      {
        label: "Average cart size",
        value: "About 3 KB",
        note: "600-byte header plus 8 items times 300 bytes per item",
      },
      {
        label: "Primary active storage",
        value: "About 90 GB raw",
        note: "30M carts times 3 KB before indexes, replicas, and event history",
      },
      {
        label: "Replicated durable storage",
        value: "350 to 450 GB",
        note: "3 replicas, indexes, tombstones, and recent cart event history",
      },
      {
        label: "Hot cache memory",
        value: "60 to 80 GB",
        note: "8M hottest carts at 3 KB each plus Redis overhead and fragmentation",
      },
    ],
    calculationsMD: `
- Mutating shoppers: 40M daily active shoppers times 25 percent is 10M shoppers who change a cart each day.
- Writes: 10M mutating shoppers times 4 mutations is 40M cart writes per day. 40M divided by 86,400 seconds is about 463 writes per second on average. A 10x sale multiplier gives roughly 4,630 writes per second, rounded to 4,600 to 5,000.
- Reads: cart pages, header badges, mini-carts, and device refreshes create more reads than writes. At about 5 reads per write, 40M writes produce about 200M reads per day. 200M divided by 86,400 seconds is about 2,315 reads per second average and about 23,000 to 25,000 at peak.
- Storage: an average cart is 600 bytes of header plus 8 line items times 300 bytes, or about 3,000 bytes. 30M active carts times 3 KB is about 90 GB raw active state.
- Durable footprint: 90 GB raw with 3 replicas is 270 GB. Indexes, tombstones, recent cart events, and compaction headroom raise this to about 350 to 450 GB.
- Cache: if the hottest 8M carts are in Redis, 8M times 3 KB is about 24 GB raw. Redis object overhead, fragmentation, replication, and memory headroom make 60 to 80 GB a safer cache budget.
- Checkout handoff: if 2M carts reach checkout per day, average checkout-start QPS is about 23 per second, with peak around 250 per second. This is lower than cart mutation traffic but requires stronger correctness.
`,
  },
  apiDesign: {
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/cart",
        descriptionMD: `
Returns the current cart for a guest session or authenticated user. The response includes stored intent plus refreshed validation hints, such as price changed, low stock, out of stock, or item unavailable.
`,
        response: `
{
  "cartId": "cart_123",
  "ownerType": "authenticated",
  "userId": "user_456",
  "version": 42,
  "currency": "USD",
  "items": [
    {
      "lineItemId": "line_1",
      "skuId": "sku_abc",
      "quantity": 2,
      "unitPriceAtAdd": 1999,
      "currentUnitPrice": 2099,
      "availability": "available",
      "warning": "price_changed"
    }
  ],
  "expiresAt": "2026-10-24T00:00:00Z"
}
`,
        statusCodes: [
          { code: 200, meaning: "Cart returned" },
          { code: 401, meaning: "Authentication required for an authenticated-only request" },
          { code: 404, meaning: "Cart not found or expired" },
          { code: 429, meaning: "Rate limit exceeded" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/cart/items",
        descriptionMD: `
Adds a line item or increments an existing line item. The operation is idempotent through an idempotency key so retries from flaky mobile networks do not duplicate quantity unexpectedly.
`,
        request: `
{
  "guestCartId": "guest_789",
  "skuId": "sku_abc",
  "quantity": 2,
  "selectedOptions": {
    "color": "black",
    "size": "M"
  },
  "idempotencyKey": "req_001"
}
`,
        response: `
{
  "cartId": "cart_123",
  "version": 43,
  "lineItemId": "line_1",
  "quantity": 2,
  "availability": "available",
  "unitPriceAtAdd": 1999
}
`,
        statusCodes: [
          { code: 200, meaning: "Item added or quantity incremented" },
          { code: 400, meaning: "Invalid sku, quantity, or options" },
          { code: 404, meaning: "SKU does not exist" },
          { code: 409, meaning: "Version conflict if strict optimistic concurrency is requested" },
          { code: 429, meaning: "Rate limit exceeded" },
        ],
      },
      {
        method: "PATCH",
        path: "/api/v1/cart/items/{lineItemId}",
        descriptionMD: `
Updates quantity or selected options for one line item. Quantity zero can be rejected here and handled by the delete endpoint, or accepted as remove if the product wants fewer client calls.
`,
        request: `
{
  "quantity": 3,
  "expectedCartVersion": 43,
  "idempotencyKey": "req_002"
}
`,
        response: `
{
  "cartId": "cart_123",
  "version": 44,
  "lineItemId": "line_1",
  "quantity": 3
}
`,
        statusCodes: [
          { code: 200, meaning: "Item updated" },
          { code: 400, meaning: "Invalid quantity or options" },
          { code: 404, meaning: "Line item not found" },
          { code: 409, meaning: "Version conflict" },
        ],
      },
      {
        method: "DELETE",
        path: "/api/v1/cart/items/{lineItemId}",
        descriptionMD: `
Removes one line item from the cart. The operation should be idempotent so repeated deletes return the same final cart state.
`,
        response: `
{
  "cartId": "cart_123",
  "version": 45,
  "removedLineItemId": "line_1"
}
`,
        statusCodes: [
          { code: 200, meaning: "Item removed or already absent" },
          { code: 401, meaning: "Authentication required for protected cart" },
          { code: 404, meaning: "Cart not found" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/cart/merge",
        descriptionMD: `
Merges an anonymous guest cart into the authenticated user's persistent cart after login. The merge policy should be deterministic and visible in the response so clients can show what changed.
`,
        request: `
{
  "guestCartId": "guest_789",
  "userId": "user_456",
  "mergePolicy": "merge_quantities",
  "idempotencyKey": "login_merge_001"
}
`,
        response: `
{
  "cartId": "cart_123",
  "version": 51,
  "mergedLineItems": 4,
  "conflicts": [
    {
      "skuId": "sku_abc",
      "resolution": "quantity_summed"
    }
  ]
}
`,
        statusCodes: [
          { code: 200, meaning: "Carts merged" },
          { code: 400, meaning: "Invalid merge policy" },
          { code: 401, meaning: "Authentication required" },
          { code: 404, meaning: "Guest cart not found or expired" },
          { code: 409, meaning: "Merge already in progress" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/cart/checkout",
        descriptionMD: `
Creates a checkout snapshot from the current cart and asks downstream services to validate price, promotions, shipping eligibility, and inventory reservation. This is the boundary where cart intent becomes an order attempt.
`,
        request: `
{
  "cartId": "cart_123",
  "expectedCartVersion": 51,
  "shippingAddressId": "addr_1",
  "idempotencyKey": "checkout_001"
}
`,
        response: `
{
  "checkoutId": "chk_123",
  "cartId": "cart_123",
  "reservationStatus": "reserved",
  "expiresAt": "2026-07-26T13:09:46Z",
  "priceChanges": [],
  "unavailableItems": []
}
`,
        statusCodes: [
          { code: 201, meaning: "Checkout snapshot created" },
          { code: 400, meaning: "Cart is empty or invalid" },
          { code: 409, meaning: "Cart version changed, price changed, or inventory unavailable" },
          { code: 424, meaning: "Downstream validation dependency failed" },
        ],
      },
    ],
    notesMD: `
Keep the cart API centered on user intent. It can store price-at-add, availability-at-add, selected fulfillment choice, and validation hints, but it should not promise final price or stock. The checkout endpoint revalidates against authoritative pricing, promotion, tax, shipping, and inventory systems.

Use idempotency keys for mutations and checkout handoff. Mobile clients retry often, and duplicate add or checkout requests are expensive to repair after the fact.
`,
  },
  databaseDesign: {
    schemaMD: `
The logical model has one cart header and many line items. The serving path should read and write the cart by **cart_id** or by the active owner key, such as **user_id** for authenticated carts or **guest_session_id** for anonymous carts.

For an intermediate design, keep the current cart snapshot in a durable database and mirror the hot cart in Redis. A small event log is useful for merge, audit, replay, and debugging, but the product path should not need to replay the full event stream on every read.
`,
    tables: [
      {
        name: "carts",
        columns: [
          { name: "cart_id", type: "uuid", note: "Primary key for a cart" },
          { name: "owner_type", type: "varchar(20)", note: "guest or authenticated" },
          { name: "user_id", type: "uuid nullable", note: "Set for authenticated carts" },
          { name: "guest_session_id", type: "varchar(128) nullable", note: "Signed opaque guest identifier" },
          { name: "status", type: "varchar(20)", note: "active, merged, converted, abandoned, or expired" },
          { name: "version", type: "bigint", note: "Monotonic cart version for optimistic concurrency" },
          { name: "currency", type: "char(3)", note: "Cart display currency" },
          { name: "created_at", type: "timestamp", note: "Creation time" },
          { name: "updated_at", type: "timestamp", note: "Last mutation time" },
          { name: "expires_at", type: "timestamp", note: "TTL boundary for cleanup and cache expiry" },
        ],
      },
      {
        name: "cart_items",
        columns: [
          { name: "line_item_id", type: "uuid", note: "Primary key for one cart line" },
          { name: "cart_id", type: "uuid", note: "Foreign key to carts" },
          { name: "sku_id", type: "varchar(128)", note: "Catalog SKU or variant identifier" },
          { name: "seller_id", type: "varchar(128) nullable", note: "Marketplace seller when applicable" },
          { name: "quantity", type: "int", note: "Requested quantity" },
          { name: "selected_options", type: "json", note: "Size, color, warranty, personalization, or bundle choices" },
          { name: "unit_price_at_add", type: "bigint", note: "Minor currency units captured when item entered the cart" },
          { name: "availability_at_add", type: "varchar(32)", note: "Availability hint captured at add time" },
          { name: "item_version", type: "bigint", note: "Per-line version for merge and conflict handling" },
          { name: "updated_at", type: "timestamp", note: "Last line-item mutation time" },
        ],
      },
      {
        name: "cart_events",
        columns: [
          { name: "event_id", type: "uuid", note: "Primary key for idempotency and replay" },
          { name: "cart_id", type: "uuid", note: "Cart that changed" },
          { name: "event_type", type: "varchar(40)", note: "item_added, quantity_changed, item_removed, merged, checked_out" },
          { name: "idempotency_key", type: "varchar(128)", note: "Client-provided retry key" },
          { name: "actor_id", type: "varchar(128)", note: "User, guest session, or service actor" },
          { name: "payload", type: "json", note: "Small change payload for audit and asynchronous consumers" },
          { name: "created_at", type: "timestamp", note: "Event creation time" },
        ],
      },
      {
        name: "checkout_snapshots",
        columns: [
          { name: "checkout_id", type: "uuid", note: "Primary key for checkout handoff" },
          { name: "cart_id", type: "uuid", note: "Source cart" },
          { name: "cart_version", type: "bigint", note: "Cart version included in the snapshot" },
          { name: "snapshot_json", type: "json", note: "Immutable items, prices, promotions, shipping input, and validation results" },
          { name: "reservation_status", type: "varchar(32)", note: "pending, reserved, failed, released, or converted" },
          { name: "expires_at", type: "timestamp", note: "Inventory reservation expiry" },
          { name: "created_at", type: "timestamp", note: "Snapshot creation time" },
        ],
      },
    ],
    indexesMD: `
- **carts.cart_id** is the primary key for direct cart reads and writes.
- **carts.user_id, status, updated_at** finds the active authenticated cart and supports customer service views.
- **carts.guest_session_id, status** finds an anonymous cart from a signed guest cookie.
- **carts.expires_at** supports TTL sweeps for abandoned carts.
- **cart_items.cart_id, sku_id** supports merging duplicate SKUs and reading all line items for a cart.
- **cart_events.cart_id, created_at** supports replay and debugging without scanning all events.
- **cart_events.idempotency_key** should be unique within a cart or actor scope.
`,
    relationshipsMD: `
One active authenticated user usually has one active cart per marketplace, region, or business line. One cart has many line items. A guest cart can be merged into an authenticated cart and then marked merged so it is not reused. Checkout snapshots reference the cart and cart version but should be immutable after creation.
`,
    noSqlAlternativesMD: `
A document store or key-value store is a natural fit because a cart is usually fetched and written as a small aggregate. Store the active cart document by **cart_id**, and maintain lookup records from **user_id** or **guest_session_id** to the active cart id.

DynamoDB can use a partition key such as **cart_id** with line items as items under the same partition, or store one compact cart document if the item count is bounded. Cassandra can partition by cart id and cluster by line item id. Redis is excellent for hot state and TTL, but it should not be the only source of truth for authenticated carts unless the business accepts cache-loss data loss.
`,
  },
  architecture: {
    width: 960,
    height: 560,
    nodes: [
      { id: "client", label: "Client", kind: "client", x: 80, y: 240, sublabel: "Web, mobile" },
      { id: "api-gateway", label: "API Gateway", kind: "gateway", x: 230, y: 240, sublabel: "Auth, rate limits" },
      { id: "cart-service", label: "Cart Service", kind: "service", x: 410, y: 240, sublabel: "Intent, merge, versions" },
      { id: "cart-cache", label: "Cart Cache", kind: "cache", x: 610, y: 110, sublabel: "Redis" },
      { id: "cart-db", label: "Cart Store", kind: "database", x: 610, y: 250, sublabel: "KV or document DB" },
      { id: "catalog-service", label: "Catalog and Pricing", kind: "service", x: 610, y: 390, sublabel: "SKU, price, promos" },
      { id: "inventory-service", label: "Inventory Service", kind: "service", x: 800, y: 150, sublabel: "Availability, reserve" },
      { id: "checkout-service", label: "Checkout Service", kind: "service", x: 800, y: 290, sublabel: "Snapshot, order start" },
      { id: "event-queue", label: "Event Queue", kind: "queue", x: 410, y: 420, sublabel: "Kafka, Kinesis" },
      { id: "sync-service", label: "Sync Service", kind: "service", x: 230, y: 390, sublabel: "Multi-device updates" },
      { id: "ttl-worker", label: "TTL and Abandonment Worker", kind: "worker", x: 800, y: 430, sublabel: "Expiry, reminders" },
    ],
    edges: [
      { from: "client", to: "api-gateway", label: "cart API" },
      { from: "api-gateway", to: "cart-service", label: "route request" },
      { from: "cart-service", to: "cart-cache", label: "read or write hot cart" },
      { from: "cart-cache", to: "cart-service", label: "cache hit" },
      { from: "cart-service", to: "cart-db", label: "durable snapshot and events" },
      { from: "cart-db", to: "cart-service", label: "cache miss load" },
      { from: "cart-service", to: "catalog-service", label: "price and SKU hints" },
      { from: "cart-service", to: "inventory-service", label: "availability hints" },
      { from: "cart-service", to: "checkout-service", label: "checkout snapshot" },
      { from: "checkout-service", to: "inventory-service", label: "reserve stock" },
      { from: "cart-service", to: "event-queue", label: "cart changed", dashed: true },
      { from: "event-queue", to: "sync-service", label: "notify devices", dashed: true },
      { from: "sync-service", to: "client", label: "push or poll updates", dashed: true },
      { from: "event-queue", to: "ttl-worker", label: "abandonment signals", dashed: true },
      { from: "ttl-worker", to: "cart-db", label: "expire carts", dashed: true },
    ],
    captionMD: `
The hot cart path is client to API Gateway to Cart Service to Redis, with the durable Cart Store as source of truth. Catalog, pricing, and inventory provide hints during shopping and authoritative validation during checkout.
`,
  },
  architectureNotesMD: `
The Cart Service owns cart identity, item mutations, merge policy, optimistic versions, and the current cart snapshot. It writes hot state to Redis for low-latency reads, but authenticated cart changes are also persisted to a durable store before the API acknowledges success. Guest carts may be written with a lighter policy, but the safest design still persists them asynchronously or synchronously depending on conversion goals.

Catalog and inventory calls during add-to-cart are advisory. They improve the user experience by rejecting clearly invalid SKUs and showing fresh price and availability, but they are not final commitments. Checkout creates an immutable snapshot, revalidates price and promotions, reserves inventory for a short time, and then moves the shopper into payment and order creation.

Cart changes publish events. Those events feed multi-device sync, abandonment workflows, analytics, and cache invalidation. The event path must not block the main mutation path unless the business explicitly requires guaranteed downstream processing for every cart change.
`,
  requestFlow: [
    {
      title: "Guest or user opens the cart",
      detailMD: `
The client sends a signed guest cart id from a cookie or an authenticated user token. The API Gateway authenticates if present, applies rate limits, and forwards the request to the Cart Service with owner context.
`,
    },
    {
      title: "Cart Service resolves the active cart",
      detailMD: `
For a guest, the service looks up the cart by guest session id. For an authenticated user, it looks up the active cart by user id and marketplace. The lookup usually hits Redis; on a miss, the service loads the cart snapshot and line items from the durable store.
`,
    },
    {
      title: "Add or update mutation is validated",
      detailMD: `
The service validates quantity, SKU format, selected options, cart size limits, and idempotency key. It may call catalog and pricing for the current item definition and call inventory for a best-effort availability hint.
`,
    },
    {
      title: "Mutation is written with a new version",
      detailMD: `
The Cart Service updates the cart aggregate, increments the cart version, and records a per-line item version. For authenticated carts, it writes the durable store before acknowledging. It then updates Redis with a TTL aligned to the cart retention policy.
`,
    },
    {
      title: "Cart change event is published",
      detailMD: `
After the durable write succeeds, the service publishes a cart changed event containing cart id, owner, version, changed line item, and operation type. Sync, analytics, and abandonment consumers use this event asynchronously.
`,
    },
    {
      title: "Login triggers guest cart merge",
      detailMD: `
When a guest signs in, the Cart Service loads both the guest cart and the user's existing active cart. It merges line items deterministically, marks the guest cart as merged, writes the new authenticated cart version, and returns conflict details for the client to display.
`,
    },
    {
      title: "Multi-device clients refresh or receive updates",
      detailMD: `
Other devices can poll with the last seen cart version or receive push notifications through the Sync Service. If a device submits an older version, the service can apply a mergeable operation or return a conflict that includes the latest cart.
`,
    },
    {
      title: "Checkout handoff creates a snapshot",
      detailMD: `
The client calls checkout with cart id, expected version, address, and idempotency key. The Cart Service or Checkout Service freezes a cart snapshot, revalidates prices and promotions, checks item eligibility, and requests an inventory reservation.
`,
    },
    {
      title: "Reservation result is returned",
      detailMD: `
If validation and reservation succeed, the response includes checkout id and reservation expiry. If price changed or stock is unavailable, the response returns a 409-style conflict with actionable item-level changes so the shopper can accept updates or remove items.
`,
    },
  ],
  coreComponents: [
    {
      name: "Cart Service",
      kind: "service",
      role: "Owns cart identity, mutations, versions, merge policy, and checkout handoff.",
      detailMD: `
The service should be stateless except for in-flight request handling. It resolves guest versus authenticated ownership, enforces cart limits, applies idempotent item mutations, writes the durable cart snapshot, refreshes Redis, and emits cart events.
`,
    },
    {
      name: "Cart Cache",
      kind: "cache",
      role: "Serves hot cart reads and absorbs repeated mini-cart refreshes.",
      detailMD: `
Redis stores the full active cart document or a compact serialized snapshot. TTL differs by owner type: guest carts expire sooner, authenticated carts last longer. Cache entries include cart version so clients and services can detect stale updates.
`,
    },
    {
      name: "Durable Cart Store",
      kind: "database",
      role: "Source of truth for active authenticated carts and recoverable guest carts.",
      detailMD: `
A document, relational, or key-value database persists cart headers, line items, versions, idempotency records, and checkout snapshots. It supports conditional updates by cart version and lookup by user or guest owner key.
`,
    },
    {
      name: "Catalog and Pricing Integration",
      kind: "service",
      role: "Provides SKU validity, current display price, options, and promotion hints.",
      detailMD: `
The cart stores price-at-add for transparency but calls pricing when rendering or checking out. It should be resilient to catalog degradation by showing stale hints, while checkout requires authoritative validation before payment.
`,
    },
    {
      name: "Inventory Integration",
      kind: "service",
      role: "Provides availability hints while shopping and reservations during checkout.",
      detailMD: `
During add-to-cart, inventory checks can be best effort because the user has not committed to buy. During checkout, the service must reserve stock with an expiry so payment and order creation do not oversell limited inventory.
`,
    },
    {
      name: "Sync Service",
      kind: "service",
      role: "Keeps multiple devices close to the latest cart version.",
      detailMD: `
The sync layer consumes cart changed events and notifies active devices through push, WebSocket, server-sent events, or lightweight polling. Clients reconcile by cart version and fetch the latest state when they miss events.
`,
    },
    {
      name: "TTL and Abandonment Worker",
      kind: "worker",
      role: "Expires old carts and triggers abandonment workflows.",
      detailMD: `
The worker scans expiry indexes or consumes delayed events, marks carts abandoned or expired, removes cache entries, and emits reminders or analytics events. It should be rate-limited so cleanup never competes with checkout traffic.
`,
    },
    {
      name: "Checkout Service",
      kind: "service",
      role: "Turns cart intent into a validated, reserved checkout attempt.",
      detailMD: `
Checkout owns stronger correctness. It creates immutable snapshots, re-prices the cart, validates promotions and shipping constraints, reserves inventory, and passes a stable checkout id to payment and order services.
`,
    },
  ],
  deepDives: [
    {
      topic: "Guest carts, authenticated carts, and login merge",
      detailMD: `
Anonymous carts are usually keyed by a signed, opaque guest session id stored in a cookie or mobile local storage. They should not trust client-provided item prices or user ids. The server owns the cart id, signs the guest token, and applies TTL because anonymous state is easy to accumulate and expensive to retain forever.

Authenticated carts are keyed by user id and often partitioned by marketplace, region, or business line. They need stronger durability because shoppers expect the cart to follow them across devices. When a guest logs in, the system must merge rather than blindly replace. The safest policy is deterministic: load guest cart and user cart, combine distinct line items, merge identical SKU and option combinations by summing quantities up to a product limit, preserve the most recent selected options when they conflict, and return conflict details.

Avoid two common mistakes. First, do not drop the authenticated cart just because a fresher guest cart exists; a returning user may have saved intent from another device. Second, do not keep both carts active after login; mark the guest cart merged and idempotently remember the merge request so retries do not double quantities.
`,
    },
    {
      topic: "Where cart state lives and the write path",
      detailMD: `
Redis is attractive because cart reads and writes are small, frequent, and latency-sensitive. It supports TTL naturally and can serve mini-cart refreshes with low latency. However, Redis alone is risky for authenticated carts unless configured with persistence and replication and unless the business accepts rare loss. A durable database should remain the source of truth for carts that matter.

A practical write path is write-through: validate the mutation, update the durable cart record with an optimistic version condition, then update Redis and publish an event. If Redis fails after the database write, the API can still succeed and let future reads warm the cache. If the database write fails, do not acknowledge the mutation for authenticated carts. Guest carts may use a write-behind optimization during extreme traffic, but the product must accept that a cache loss can lose some anonymous carts.

The cart record should be bounded. Store the current snapshot and recent idempotency keys in the hot record, but move large event history, recommendation metadata, and analytics to separate stores. This keeps the p99 path predictable.
`,
    },
    {
      topic: "Price and availability at add time versus checkout time",
      detailMD: `
Adding an item to a cart should not reserve inventory forever or freeze price forever. It records shopper intent plus the best known price and availability at that moment. This lets the UI say the item was 19.99 when added and now is 20.99, which is transparent and avoids surprising checkout totals.

Availability at add time is also a hint. For high-demand items, stock may disappear seconds later. If the system reserved inventory on every add-to-cart, abandoned carts would lock stock away from real buyers. Instead, use soft checks while shopping and reserve only at checkout, for a short window such as 10 to 15 minutes.

At checkout, the service must call authoritative pricing, promotions, tax, shipping, and inventory. If the price changed, the item became unavailable, or the requested quantity exceeds stock, return an item-level conflict and let the shopper accept changes. The cart service should not silently mutate totals and proceed to payment.
`,
    },
    {
      topic: "Distributed cart consistency and merge semantics",
      detailMD: `
A shopping cart is a classic eventually consistent example because a perfect global total order is usually not worth the latency. If a shopper adds headphones on a phone and a charger on a laptop, the desired result is both items. Last-write-wins at the whole-cart level can lose one device's intent.

Use mergeable operations where possible: add item, remove item, set quantity, and update option. Track a cart version and per-line item versions. Distinct line items can be unioned. For the same line item, quantity changes need a policy: last-write-wins is simple for set quantity, while additive increments are better represented as operations with idempotency keys. Removes should carry a timestamp or tombstone so an old add event does not resurrect a deleted item.

For most interviews, choose eventual consistency across devices with optimistic concurrency at the cart aggregate. Return the latest version on conflict and let the client retry or merge. Reserve stronger consistency for checkout, where duplicate orders and overselling are not acceptable.
`,
    },
    {
      topic: "TTL, abandonment, and lifecycle management",
      detailMD: `
Carts have lifecycle states: active, merged, converted, abandoned, and expired. Guest carts may expire after 7 to 30 days. Authenticated carts may be retained for 90 to 180 days, but every render should refresh stale price and availability hints. Converted carts can be retained as snapshots for customer support or order attribution, then archived.

TTL belongs in both cache and durable storage. Redis should expire hot entries automatically. The durable store should have an expiry index or native TTL feature, plus a worker that marks carts abandoned, deletes old guest state, and emits analytics. Use soft deletion when legal, fraud, or customer support requirements need history.

Abandonment workflows should be asynchronous. The cart path emits events, and a worker sends reminders, updates analytics, or triggers recommendations. If the worker is down, cart mutation and checkout must continue.
`,
    },
    {
      topic: "Checkout handoff and inventory reservation",
      detailMD: `
The cart is mutable and user-controlled; checkout is controlled and auditable. The handoff creates a checkout snapshot containing items, quantities, current prices, promotions, shipping information, tax inputs, and the cart version. That snapshot should be immutable so payment, order creation, and customer support see the same data.

Inventory reservation should happen during checkout, not during add-to-cart. The reservation has an expiry, commonly 10 to 15 minutes, and is released if payment fails or the shopper abandons checkout. Use idempotency keys so retrying checkout does not create multiple reservations for the same cart version.

After successful order creation, mark the cart converted or clear purchased items. Do not delete the cart before order creation is durable, because payment retries and customer support may need the snapshot.
`,
    },
  ],
  scaling: [
    {
      stage: "Prototype: single region and relational database",
      detailMD: `
Start with one Cart Service, one relational database storing carts and cart_items, and a simple guest cookie. Add Redis when reads become frequent. Use optimistic locking with a cart version and idempotency keys from the beginning because retries and double-clicks appear even at small scale.
`,
    },
    {
      stage: "Growth: Redis hot cache and durable snapshots",
      detailMD: `
Cache active carts in Redis with owner-specific TTLs. Persist authenticated carts synchronously to a durable database. Publish cart events for sync and abandonment. Add indexes by user id and guest session id so active cart lookup does not scan.
`,
    },
    {
      stage: "Large scale: partitioned cart store and event pipeline",
      detailMD: `
Partition carts by cart id or owner id across a document or key-value store. Scale Cart Service horizontally behind an API Gateway. Move abandonment, analytics, and recommendations to consumers of a durable event stream. Use cache warming and request coalescing for popular sale traffic.
`,
    },
    {
      stage: "Multi-region: local reads with careful conflict handling",
      detailMD: `
Keep carts close to shoppers with regional caches and replicated durable storage. Choose either a home region per cart for writes or active-active writes with mergeable operations. Accept eventual multi-device sync for shopping, but route checkout to the region that can make authoritative reservations.
`,
    },
    {
      stage: "Peak commerce: sale isolation and checkout protection",
      detailMD: `
During launches or holidays, isolate hot SKUs, apply per-user and per-SKU limits, shed non-critical refreshes, and reserve capacity for checkout. Cart can degrade by showing stale hints, but checkout and inventory reservation need protected pools and strict backpressure.
`,
    },
  ],
  bottlenecks: [
    {
      issue: "Redis hot keys and large cart objects",
      optimizationMD: `
Partition carts by cart id, cap cart size, compress large snapshots if needed, and avoid repeatedly rewriting unrelated metadata. For very hot authenticated accounts or shared carts, use per-line updates or local request coalescing to avoid one Redis shard becoming overloaded.
`,
    },
    {
      issue: "Durable store write amplification",
      optimizationMD: `
Write compact cart snapshots and small event records. Batch asynchronous analytics separately. Avoid updating many secondary indexes on every quantity change. Use conditional updates by cart id and version rather than cross-table transactions for routine mutations.
`,
    },
    {
      issue: "Catalog or pricing dependency latency",
      optimizationMD: `
Cache SKU metadata and recent prices, apply short timeouts, and treat add-time validation as advisory. On dependency failure, allow the cart to retain intent with a needs refresh warning, but require authoritative validation at checkout.
`,
    },
    {
      issue: "Inventory reservation contention for hot SKUs",
      optimizationMD: `
Do not reserve on add-to-cart. At checkout, use inventory service quotas, reservation expiry, per-user limits, and queueing or waiting rooms for flash-sale items. Return clear conflicts when stock is gone.
`,
    },
    {
      issue: "Login merge races",
      optimizationMD: `
Serialize merge for the user cart with a short lock or conditional version update. Store the merge idempotency key and mark the guest cart merged so retries cannot double quantities.
`,
    },
    {
      issue: "Excessive mini-cart reads",
      optimizationMD: `
Use client-side caching with cart version, lightweight badge endpoints, push invalidations, and Redis. Avoid fetching full item details on every page view when only the item count changed.
`,
    },
  ],
  failureHandling: [
    {
      scenario: "Redis outage",
      strategyMD: `
Read from the durable cart store with strict rate limits and request coalescing. Continue authenticated cart writes to the database and skip cache refresh until Redis recovers. Warm cache gradually after recovery to avoid a stampede.
`,
    },
    {
      scenario: "Durable cart store write failure",
      strategyMD: `
For authenticated carts, return a retryable error rather than acknowledging a mutation that may be lost. For guest carts during a sale, the product may allow temporary cache-only writes, but the UI should tolerate loss and the system should drain to durable storage when possible.
`,
    },
    {
      scenario: "Catalog or pricing service degraded",
      strategyMD: `
Allow cart reads and basic mutations with stale cached hints and visible needs refresh status. Disable checkout or require revalidation before payment if authoritative pricing cannot be obtained.
`,
    },
    {
      scenario: "Inventory service degraded",
      strategyMD: `
Continue add-to-cart with an availability unknown hint if the product allows it. Block or queue checkout handoff when inventory reservation cannot be made, because accepting payment without stock creates expensive recovery.
`,
    },
    {
      scenario: "Event queue unavailable",
      strategyMD: `
Cart mutations can continue after durable writes. Buffer events locally for a bounded time or mark carts for later reconciliation. Multi-device sync, abandonment reminders, and analytics become stale, but the cart itself remains correct.
`,
    },
    {
      scenario: "Regional failure during active shopping",
      strategyMD: `
Route users to a healthy region and load carts from replicated durable storage if available. If the most recent cart changes have not replicated, merge later events by operation and cart version rather than overwriting the recovered cart wholesale.
`,
    },
  ],
  security: [
    {
      label: "Guest token integrity",
      detailMD: `
Guest cart ids should be opaque, high entropy, and signed or stored server-side. Do not let clients choose cart ids or owner ids. Rotate tokens on login and mark merged guest carts inactive.
`,
    },
    {
      label: "Authorization",
      detailMD: `
Every authenticated cart operation must verify that the user owns the cart. Customer support and admin access should be scoped, audited, and separated from shopper APIs.
`,
    },
    {
      label: "Price tampering prevention",
      detailMD: `
Never trust client-submitted prices, discounts, shipping totals, or tax amounts. The cart may echo display prices from the server, but checkout recalculates all monetary values using authoritative services.
`,
    },
    {
      label: "Abuse and scraping controls",
      detailMD: `
Attackers can use cart APIs to probe SKU availability or stress hot items. Apply per-IP, per-user, per-device, and per-SKU rate limits, plus bot detection during launches.
`,
    },
    {
      label: "PII minimization",
      detailMD: `
Cart state should not store unnecessary personal data. Shipping addresses, payment details, and identity attributes belong in dedicated services with tighter controls. Cart events should avoid raw tokens and sensitive customer information.
`,
    },
    {
      label: "Idempotency and replay protection",
      detailMD: `
Mutation and checkout endpoints need idempotency keys with bounded retention. Signed guest tokens and request authentication should prevent replay across users or carts.
`,
    },
  ],
  tradeoffs: {
    pros: [
      "Redis-backed cart reads and writes give low latency for a high-frequency shopping path.",
      "Durable snapshots protect authenticated carts from cache loss and regional restarts.",
      "Event-driven sync and abandonment features stay off the critical mutation path.",
      "Checkout snapshotting cleanly separates mutable cart intent from committed order attempts.",
      "Mergeable cart operations provide a better multi-device experience than whole-cart overwrites.",
    ],
    cons: [
      "Maintaining both Redis and a durable store adds operational complexity and consistency edge cases.",
      "Eventual consistency can show stale carts across devices unless versioning and sync are well designed.",
      "Guest-to-user merge rules are product-sensitive and can surprise users if not communicated clearly.",
      "Add-time price and availability hints require careful UI wording because they are not guarantees.",
      "Checkout requires coordination with inventory, pricing, payment, and order systems, which raises tail latency and failure modes.",
    ],
    alternativesMD: `
Alternative one is cache-only carts. This is very fast and simple for anonymous shopping, but it risks losing authenticated carts and makes support difficult after incidents.

Alternative two is database-only carts. This is durable and simpler to reason about, but repeated mini-cart reads and sale traffic can overload the database unless the system adds read replicas or aggressive client caching.

Alternative three is event-sourced carts. Every mutation is appended and snapshots are derived. This gives excellent audit and merge history, but it is more complex and usually unnecessary unless the product needs collaborative carts, deep audit, or advanced conflict resolution.
`,
    whenNotToUseMD: `
Do not use this mutable shopping cart design as the source of truth for orders, payments, or inventory ownership. Once the shopper starts checkout, move to immutable checkout snapshots, inventory reservations, payment intents, and order records with stronger consistency and audit requirements.
`,
  },
  followUpQuestions: [
    {
      question: "How do you merge a guest cart with an existing user cart on login?",
      answerMD: `
Load both carts, apply a deterministic merge policy, and write one new authenticated cart version. Distinct items are unioned. Identical SKU and option combinations can sum quantities up to a limit. Conflicts such as different sellers or options should be returned in the response. Mark the guest cart merged and store an idempotency key so retries do not double quantities.
`,
    },
    {
      question: "Should Redis be the source of truth for carts?",
      answerMD: `
For guest carts, Redis-only may be acceptable if the business tolerates occasional loss. For authenticated carts, use Redis as a hot cache and a durable database as source of truth. Acknowledge durable writes first, then refresh Redis and publish events.
`,
    },
    {
      question: "When should inventory be reserved?",
      answerMD: `
Reserve at checkout, not at add-to-cart. Add-to-cart records intent and may show an availability hint. Reserving during shopping would let abandoned carts lock scarce inventory. Checkout reservations should have a short expiry and be idempotent.
`,
    },
    {
      question: "How do you handle price changes after an item is added?",
      answerMD: `
Store price-at-add for transparency, refresh current price when rendering, and revalidate at checkout. If the price changed, return item-level conflicts and require the shopper to accept the updated total before payment.
`,
    },
    {
      question: "How do you keep carts in sync across devices?",
      answerMD: `
Use cart versions and events. Devices poll with last seen version or receive push updates. If a device submits an older version, the service applies mergeable operations when safe or returns the latest cart with a conflict response.
`,
    },
    {
      question: "Why is last-write-wins dangerous for a shopping cart?",
      answerMD: `
Whole-cart last-write-wins can drop intent from another device. If a phone adds one item and a laptop adds another, the expected result is both items. Last-write-wins is only acceptable for narrow fields such as a specific line item's latest selected option, and even then it should be explicit.
`,
    },
    {
      question: "What data should be in the checkout snapshot?",
      answerMD: `
Include cart id, cart version, line items, quantities, current prices, promotion decisions, shipping inputs, tax inputs, inventory reservation result, and expiry. The snapshot should be immutable so payment and order creation use the same facts.
`,
    },
  ],
  companyVariations: [
    {
      company: "Amazon",
      angleMD: `
Amazon interviewers are likely to push on massive sale traffic, DynamoDB-style partitioning, hot SKU protection, inventory reservation, and operational alarms. Be ready to explain why add-to-cart does not reserve inventory and how checkout avoids overselling.
`,
    },
    {
      company: "Stripe",
      angleMD: `
Stripe may frame the cart around the boundary between cart, checkout session, payment intent, idempotency, and merchant integrations. Emphasize immutable checkout snapshots, retry-safe APIs, price recalculation, and clear failure semantics before payment.
`,
    },
    {
      company: "Google",
      angleMD: `
Google tends to probe distributed consistency, multi-region replication, sync semantics, and clean abstractions. Expect follow-ups on why shopping carts are a classic eventually consistent example and how mergeable operations avoid lost updates.
`,
    },
    {
      company: "Uber",
      angleMD: `
Uber may connect carts to marketplace availability, regional inventory, mobile retries, and surge-like dynamic pricing. Focus on freshness, idempotent mutations, device sync, and the handoff from mutable intent to a committed transaction.
`,
    },
  ],
  relatedQuestions: [
    {
      slug: "distributed-cache",
      note: "Redis is central to serving hot cart state with low latency and TTL behavior.",
    },
    {
      slug: "key-value-store",
      note: "A durable KV or document store is a natural source of truth for active cart aggregates.",
    },
    {
      slug: "payment-gateway",
      note: "Checkout turns cart intent into payment and order workflows with idempotency and stronger guarantees.",
    },
    {
      slug: "distributed-transaction",
      note: "Inventory reservation, payment, and order creation require careful boundaries around consistency and compensation.",
    },
    {
      slug: "amazon",
      note: "A full e-commerce marketplace extends cart design into catalog, inventory, checkout, fulfillment, and recommendations.",
    },
  ],
  interviewTips: {
    commonMistakes: [
      "Treating add-to-cart as an inventory reservation.",
      "Using whole-cart last-write-wins and losing updates from another device.",
      "Keeping authenticated carts only in Redis without discussing data loss.",
      "Ignoring guest cart to authenticated cart merge semantics.",
      "Trusting client-submitted prices during checkout.",
      "Forgetting TTL, abandonment, and cleanup of anonymous carts.",
    ],
    redFlags: [
      "No distinction between cart intent and checkout commitment.",
      "No concrete capacity estimates for active carts, QPS, average cart size, and storage.",
      "No plan for idempotency under mobile retries.",
      "No strategy for price changes or out-of-stock items.",
      "No versioning or conflict handling for multi-device use.",
    ],
    expectations: [
      "Define guest, authenticated, merged, converted, abandoned, and expired cart states.",
      "Explain Redis versus durable database responsibilities and the write path.",
      "Use cart versions, line item versions, and idempotency keys.",
      "State that price and availability are hints until checkout validation.",
      "Describe inventory reservation at checkout with an expiry.",
      "Cover multi-device sync and eventual consistency tradeoffs.",
    ],
    communicationMD: `
Start by saying a cart is mutable purchase intent, not an order. Draw the low-latency cart path first: client, gateway, Cart Service, Redis, durable cart store. Then layer in guest identity, login merge, catalog and inventory hints, events for sync and abandonment, and checkout snapshotting. When discussing consistency, explicitly contrast eventual cart sync with strong checkout validation.
`,
  },
  revisionNotesMD: `
- A shopping cart stores purchase intent. Checkout creates a stronger, immutable snapshot.
- Guest carts are keyed by signed guest session ids and usually have shorter TTL. Authenticated carts are keyed by user id and need durable persistence.
- Login merge must be deterministic and idempotent. Union distinct line items, merge identical SKU and option combinations carefully, and mark the guest cart merged.
- Redis gives low latency and TTL for hot carts, but a durable database should be source of truth for authenticated carts.
- Use write-through for authenticated carts: durable conditional update, cache refresh, then asynchronous event publication.
- Price-at-add and availability-at-add are hints. Checkout revalidates price, promotions, shipping, tax, and inventory.
- Do not reserve inventory on add-to-cart. Reserve at checkout for a short expiry window.
- Shopping cart is a classic eventually consistent example: merge device changes instead of overwriting whole carts with last-write-wins.
- Use cart version, line item version, idempotency key, and tombstones for conflict handling.
- Capacity anchor: 40M daily active shoppers, 40M cart mutations per day, about 463 average write QPS, about 5,000 peak write QPS, 30M active carts, 8 items per cart, about 90 GB raw active storage.
`,
  flashcards: [
    {
      front: "What is the difference between cart and checkout?",
      back: "Cart is mutable user intent. Checkout is a validated snapshot with price checks, inventory reservation, and stronger audit requirements.",
    },
    {
      front: "Why not reserve inventory on add-to-cart?",
      back: "Abandoned carts would lock stock away from real buyers. Use availability hints while shopping and reserve only during checkout for a short expiry.",
    },
    {
      front: "Where should authenticated cart state live?",
      back: "In a durable database as source of truth, with Redis as a hot cache for low-latency reads and writes.",
    },
    {
      front: "How should guest carts be identified?",
      back: "By an opaque signed guest session id or server-side session mapping, never by a client-trusted user id or price payload.",
    },
    {
      front: "What makes cart merge tricky?",
      back: "A guest cart and an existing user cart can both contain intent. The merge must be deterministic, idempotent, and clear about conflicts.",
    },
    {
      front: "Why is whole-cart last-write-wins risky?",
      back: "It can lose updates from another device. Merge distinct line item operations and reserve last-write-wins for narrow fields only when intentional.",
    },
    {
      front: "What should happen when price changes before checkout?",
      back: "Return an item-level conflict or warning and require the shopper to accept the updated total before payment.",
    },
    {
      front: "What is a good TTL policy?",
      back: "Guest carts often expire after 7 to 30 days; authenticated carts can last 90 to 180 days with stale item refresh on render.",
    },
    {
      front: "Why use idempotency keys for cart APIs?",
      back: "They make retries safe so mobile network failures or double-clicks do not duplicate item quantities or create multiple checkout reservations.",
    },
  ],
  quiz: [
    {
      question: "What is the best default source of truth for authenticated carts?",
      options: ["Client local storage only", "Redis only with no persistence", "A durable database with Redis as a hot cache", "The payment provider"],
      answerIndex: 2,
      explanationMD: `
Authenticated carts should survive cache loss and device changes. Redis is valuable for speed, but the durable database should be the recoverable source of truth.
`,
    },
    {
      question: "When should inventory normally be reserved?",
      options: ["When the product page is viewed", "When an item is added to the cart", "When checkout starts and the cart is validated", "Only after delivery"],
      answerIndex: 2,
      explanationMD: `
Add-to-cart records intent and can show an availability hint. Checkout is the right boundary for short-lived inventory reservation.
`,
    },
    {
      question: "Why is whole-cart last-write-wins a poor multi-device strategy?",
      options: ["It is too expensive to store", "It can overwrite one device's additions with another device's stale cart", "It prevents TTL cleanup", "It requires payment before checkout"],
      answerIndex: 1,
      explanationMD: `
If two devices modify different line items, replacing the whole cart with the latest write can drop valid user intent. Mergeable operations preserve more intent.
`,
    },
    {
      question: "Given 40M cart mutations per day, what is the approximate average write QPS?",
      options: ["46 writes per second", "463 writes per second", "4,630 writes per second", "46,300 writes per second"],
      answerIndex: 1,
      explanationMD: `
40M divided by 86,400 seconds is about 463 writes per second. Peak sale traffic can be about 10x higher.
`,
    },
    {
      question: "What should the system do if an item price changes between add-to-cart and checkout?",
      options: ["Trust the old client price", "Silently charge the new price without telling the shopper", "Return a clear item-level conflict or warning before payment", "Delete the user's entire cart"],
      answerIndex: 2,
      explanationMD: `
Price-at-add is a hint for transparency, not a guarantee. Checkout should reprice and ask the shopper to accept changes before payment.
`,
    },
    {
      question: "What makes guest-to-user cart merge safe under retries?",
      options: ["Deleting both carts first", "Using an idempotency key and marking the guest cart merged", "Relying on browser refresh", "Skipping the existing user cart"],
      answerIndex: 1,
      explanationMD: `
The merge request may be retried. Store an idempotency key and mark the guest cart merged so quantities are not summed more than once.
`,
    },
  ],
  cheatSheetMD: `
**Goal**: design a Shopping Cart service that stores mutable purchase intent for guests and authenticated users, supports fast add, update, remove, view, login merge, multi-device sync, TTL, and checkout handoff.

**Identity**: guest carts use signed opaque guest session ids. Authenticated carts use user id plus marketplace or region. On login, merge guest cart into user cart deterministically and idempotently.

**Workload**: 40M daily active shoppers, 10M daily cart mutators, 40M mutations per day, about 463 average write QPS, about 5,000 peak write QPS, about 2,300 average read QPS, and about 25,000 peak read QPS.

**Storage**: 30M active carts, 8 items per average cart, about 3 KB per cart, about 90 GB raw active state, about 350 to 450 GB replicated durable footprint, and about 60 to 80 GB for the hot Redis cache.

**Write path**: validate mutation, enforce idempotency, update durable store with cart version, refresh Redis, publish cart changed event. If Redis fails after the durable write, succeed and let future reads warm the cache.

**Consistency**: cart sync can be eventually consistent. Use cart version, per-line versions, idempotency keys, mergeable operations, and tombstones. Avoid whole-cart last-write-wins because it can lose device updates.

**Price and inventory**: add-time price and availability are hints. Checkout revalidates price, promotions, shipping, tax, and inventory. Inventory is reserved at checkout with a short expiry, not on add-to-cart.

**TTL**: guest carts often expire after 7 to 30 days. Authenticated carts can live 90 to 180 days. Workers mark carts abandoned or expired and emit analytics or reminder events asynchronously.

**Checkout**: create an immutable checkout snapshot with cart version, items, prices, promotions, and reservation result. Payment and order creation should use the snapshot, not a mutable cart.

**Security**: sign guest tokens, verify ownership, never trust client prices, rate-limit hot APIs, avoid storing payment details in cart state, and use idempotency to protect retries.
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
      title: "Redis Keyspace Notifications and Expiration",
      kind: "Docs",
      url: "https://redis.io/docs/latest/develop/use/keyspace-notifications/",
      author: "Redis",
    },
    {
      title: "Amazon DynamoDB Developer Guide",
      kind: "Docs",
      url: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html",
      author: "Amazon Web Services",
    },
    {
      title: "Stripe Idempotent Requests",
      kind: "Docs",
      url: "https://docs.stripe.com/api/idempotent_requests",
      author: "Stripe",
    },
  ],
};
