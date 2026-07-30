import type { SDQuestionContent } from "../types";

export const amazonContent: SDQuestionContent = {
  slug: "amazon",
  statementMD: `
Design Amazon, a global e-commerce platform where shoppers can discover products, compare offers, add items to a cart, check out, pay, and track orders. The system must support read-heavy product discovery while protecting the correctness of scarce inventory and money movement.

At interview scale, assume a catalog with around one billion active SKUs across many marketplaces, hundreds of thousands of product-page requests per second during peak events, and several thousand orders per second on a large shopping day. The hard parts are separating fast browse traffic from strongly controlled checkout traffic, keeping search and product pages fresh enough, and making order placement safe under retries and concurrent buyers.

The target design should optimize product pages and search through caching, CDN, and an inverted index, while treating inventory, orders, and payments as state machines with idempotency and auditability. Eventual consistency is acceptable between catalog, inventory, recommendations, and orders, but checkout must make final decisions from authoritative services.
`,
  businessUseCaseMD: `
Amazon-style commerce converts product discovery into trusted purchase fulfillment. Buyers expect accurate product information, relevant search results, fast pages, transparent prices, and confidence that a placed order will not be lost or charged twice.

The platform also serves sellers, warehouse operations, finance, fraud review, recommendations, ads, and customer support. A strong HLD answer should show how the customer-facing path stays fast while downstream systems receive reliable events for fulfillment, analytics, and personalization.
`,
  functionalRequirements: [
    "Browse product detail pages with title, images, description, seller offers, price, availability, ratings, and delivery promise.",
    "Search and filter products by query, category, brand, attributes, price range, ratings, seller, delivery speed, and availability.",
    "Add, update, and remove items in a shopping cart across anonymous and signed-in sessions.",
    "Start checkout by validating cart items, current prices, shipping address, tax, promotions, and delivery options.",
    "Reserve or decrement inventory safely so concurrent purchases do not oversell limited stock.",
    "Create orders and process payments with idempotency so client retries do not duplicate charges or orders.",
    "Emit order, catalog, inventory, pricing, and behavioral events for fulfillment, recommendations, search freshness, and analytics.",
    "Show order status and support cancellation or compensation when payment, inventory, or fulfillment fails.",
  ],
  nonFunctionalRequirements: [
    {
      label: "Latency",
      detailMD: `
Product detail pages should render in under 200ms p99 from the edge for cacheable fragments, and search should return the first page in under 300ms p99 inside a region. Checkout can be slower because it coordinates inventory, payment, tax, and order state, but the synchronous path should still target under two seconds p99.
`,
    },
    {
      label: "Availability",
      detailMD: `
Browsing and cart operations should degrade gracefully during downstream failures. Product pages can serve stale catalog data for a short window, recommendations can disappear, and analytics can lag. Order placement and payment must fail closed when authoritative inventory or payment state cannot be confirmed.
`,
    },
    {
      label: "Scalability",
      detailMD: `
The workload is extremely read-heavy before checkout. Scale product pages through CDN, fragment caches, service caches, and denormalized catalog documents. Scale search with partitioned inverted indexes and replicas. Scale checkout with partitioned inventory, order, and payment workflows keyed by customer, cart, SKU, and order identifiers.
`,
    },
    {
      label: "Correctness",
      detailMD: `
Inventory and payment state must be protected from race conditions and retries. Use conditional writes, version checks, inventory ledgers, idempotency keys, unique constraints, and explicit order state transitions rather than best-effort updates.
`,
    },
    {
      label: "Eventual consistency",
      detailMD: `
Catalog edits, price changes, inventory availability, order status, and recommendation signals propagate through events. Product pages and search results may be slightly stale, but checkout must re-read authoritative price and inventory before placing the order.
`,
    },
    {
      label: "Durability and auditability",
      detailMD: `
Orders, payment attempts, inventory reservations, and ledger entries are financial or operational records. Persist them durably before acknowledging success, use an outbox for events, retain immutable audit trails, and make recovery idempotent.
`,
    },
    {
      label: "Security and compliance",
      detailMD: `
Protect customer identity, addresses, payment tokens, seller data, and order history. Payment card handling should be tokenized through a compliant payment provider, while internal APIs require authentication, authorization, encryption, and audit logging.
`,
    },
  ],
  capacityEstimation: {
    assumptionsMD: `
Assume 300M monthly active shoppers, one billion active SKUs, 2B product detail page views per day on average, 400M searches per day, 500M cart mutations per day, and a peak shopping event that reaches 80M orders in one day. Assume an average order has three line items and peak traffic is roughly ten times average for browse and eight to nine times average for order placement.

Assume each catalog document has about 8 KB of searchable and renderable metadata after normalization, not counting images and videos. Product media is stored in object storage and served through the CDN. Order records average 4 KB including line items and state history pointers, while inventory ledger records average 300 bytes.
`,
    metrics: [
      {
        label: "Active catalog",
        value: "1B SKUs",
        note: "Across marketplaces, sellers, variants, and offerable items",
      },
      {
        label: "Catalog metadata",
        value: "8 TB raw",
        note: "1B catalog documents times about 8 KB before indexes and replicas",
      },
      {
        label: "Search index footprint",
        value: "25 to 40 TB",
        note: "Inverted index, doc values for facets, replicas, and segment overhead",
      },
      {
        label: "Average product-page QPS",
        value: "23,000 reads per second",
        note: "2B product views per day divided by 86,400 seconds",
      },
      {
        label: "Peak product-page QPS",
        value: "250,000 reads per second",
        note: "Large sales events with about 10x average traffic plus headroom",
      },
      {
        label: "Average search QPS",
        value: "4,600 searches per second",
        note: "400M searches per day divided by 86,400 seconds",
      },
      {
        label: "Peak search QPS",
        value: "60,000 searches per second",
        note: "Peak events, autocomplete spillover, and retries",
      },
      {
        label: "Peak orders",
        value: "8,000 orders per second",
        note: "80M orders in a peak day averages about 925 orders per second, with an 8x to 9x peak",
      },
      {
        label: "Peak inventory writes",
        value: "50,000 writes per second",
        note: "Three order lines per order plus reservation, release, replenishment, and compensation events",
      },
      {
        label: "Order storage",
        value: "320 GB per peak day raw",
        note: "80M orders times about 4 KB before indexes, replicas, and ledgers",
      },
      {
        label: "Behavioral event stream",
        value: "500,000 events per second peak",
        note: "Views, clicks, cart mutations, search impressions, order events, and recommendation signals",
      },
    ],
    calculationsMD: `
- Product-page reads: 2B product views per day divided by 86,400 seconds is about 23,000 reads per second on average. A major sale can reach about ten times average, so plan for roughly 250,000 product detail reads per second globally.
- Search reads: 400M searches per day divided by 86,400 seconds is about 4,600 searches per second on average. During peak browsing windows, plan for 60,000 search requests per second because search traffic is bursty and users refine filters repeatedly.
- Catalog storage: one billion SKUs times 8 KB of normalized title, attributes, offer summary, category, and ranking fields is about 8 TB raw. The search index adds token postings, doc values, sort fields, facets, replicas, and segment overhead, so 25 to 40 TB is a more realistic operational footprint.
- Orders: 80M orders in a peak day divided by 86,400 seconds averages about 925 orders per second. Peak windows can be 8x to 9x average, so provision the order path for about 8,000 orders per second before retries.
- Inventory writes: three line items per order at 8,000 orders per second is 24,000 item-level reservation or decrement operations per second. Add releases, failed payment compensation, warehouse adjustments, restocks, and duplicate-safe ledger writes, and provision around 50,000 inventory writes per second.
- Order storage: 80M orders times 4 KB is about 320 GB raw for a peak day. With order item indexes, state history, payment attempts, replication, and audit retention, daily durable storage can be several times higher.
- Cache: if the top five percent of products drive half of product-page views, caching tens of millions of hot product summaries and rendered fragments can remove most reads from catalog databases. Product media should be almost entirely CDN-served.
`,
  },
  apiDesign: {
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/products/{productId}",
        descriptionMD: `
Returns a product detail view assembled from catalog data, current offer summaries, price, availability estimate, ratings, and recommendation slots. It may serve cached or slightly stale browse data, but must mark final price and availability as subject to checkout validation.
`,
        response: `
{
  "productId": "B000123",
  "title": "Noise Cancelling Headphones",
  "brand": "Acme Audio",
  "categoryId": "electronics.headphones",
  "images": ["https://cdn.example.com/products/B000123/main.jpg"],
  "primaryOffer": {
    "skuId": "SKU-123-BLACK",
    "sellerId": "seller_42",
    "priceCents": 12999,
    "currency": "USD",
    "availability": "in_stock",
    "deliveryPromise": "Arrives tomorrow"
  },
  "recommendations": ["B000999", "B000777"]
}
`,
        statusCodes: [
          { code: 200, meaning: "Product detail returned" },
          { code: 404, meaning: "Product not found or not sellable" },
          { code: 429, meaning: "Client throttled" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/search",
        descriptionMD: `
Searches the product catalog using a query, category, and filter set. The search service uses an inverted index for text and faceted filters for structured attributes such as brand, color, price bucket, rating, seller, and delivery promise.
`,
        request: `
GET /api/v1/search?q=headphones&category=electronics&brand=Acme&minPriceCents=5000&maxPriceCents=20000&primeEligible=true&pageSize=24
`,
        response: `
{
  "query": "headphones",
  "results": [
    {
      "productId": "B000123",
      "title": "Noise Cancelling Headphones",
      "priceCents": 12999,
      "rating": 4.6,
      "availability": "in_stock"
    }
  ],
  "facets": {
    "brand": [{ "value": "Acme", "count": 1240 }],
    "price": [{ "value": "10000-15000", "count": 830 }]
  },
  "nextPageToken": "search_after_token"
}
`,
        statusCodes: [
          { code: 200, meaning: "Search results returned" },
          { code: 400, meaning: "Invalid filters or page token" },
          { code: 429, meaning: "Client throttled" },
        ],
      },
      {
        method: "PUT",
        path: "/api/v1/carts/{cartId}/items/{skuId}",
        descriptionMD: `
Adds or updates a cart item. Cart writes are user-facing but not financially authoritative; prices, promotions, and inventory are revalidated at checkout.
`,
        request: `
{
  "quantity": 2,
  "clientCartVersion": 17
}
`,
        response: `
{
  "cartId": "cart_abc",
  "version": 18,
  "items": [
    {
      "skuId": "SKU-123-BLACK",
      "quantity": 2,
      "displayPriceCents": 12999,
      "availabilityHint": "in_stock"
    }
  ]
}
`,
        statusCodes: [
          { code: 200, meaning: "Cart updated" },
          { code: 400, meaning: "Invalid quantity or SKU" },
          { code: 409, meaning: "Cart version conflict" },
          { code: 404, meaning: "Cart or SKU not found" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/checkout/sessions",
        descriptionMD: `
Creates a checkout session by loading the cart, repricing items, applying promotions, calculating tax and shipping, and presenting the final payable amount before order placement.
`,
        request: `
{
  "cartId": "cart_abc",
  "shippingAddressId": "addr_123",
  "promotionCodes": ["SAVE10"]
}
`,
        response: `
{
  "checkoutSessionId": "chk_123",
  "cartId": "cart_abc",
  "expiresAt": "2026-07-26T14:54:46Z",
  "items": [
    {
      "skuId": "SKU-123-BLACK",
      "quantity": 2,
      "currentPriceCents": 12999,
      "availability": "available"
    }
  ],
  "totalCents": 27798,
  "currency": "USD"
}
`,
        statusCodes: [
          { code: 201, meaning: "Checkout session created" },
          { code: 400, meaning: "Invalid address, cart, or promotion" },
          { code: 409, meaning: "Cart contains unavailable or changed items" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/orders",
        descriptionMD: `
Places an order from a checkout session. The caller supplies an idempotency key so retries return the same order result rather than creating duplicate orders or duplicate charges.
`,
        request: `
{
  "checkoutSessionId": "chk_123",
  "paymentToken": "tok_payment_abc",
  "idempotencyKey": "client-generated-order-key-123"
}
`,
        response: `
{
  "orderId": "ord_789",
  "status": "confirmed",
  "paymentStatus": "authorized",
  "inventoryStatus": "reserved",
  "totalCents": 27798,
  "currency": "USD"
}
`,
        statusCodes: [
          { code: 201, meaning: "Order created" },
          { code: 200, meaning: "Existing idempotent result returned" },
          { code: 402, meaning: "Payment authorization failed" },
          { code: 409, meaning: "Inventory unavailable or checkout expired" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/orders/{orderId}",
        descriptionMD: `
Returns the durable order state and latest fulfillment view. This endpoint reads from the order store and may include eventually consistent shipment, refund, or cancellation state from downstream systems.
`,
        response: `
{
  "orderId": "ord_789",
  "status": "confirmed",
  "items": [
    {
      "skuId": "SKU-123-BLACK",
      "quantity": 2,
      "status": "allocated"
    }
  ],
  "paymentStatus": "authorized",
  "fulfillmentStatus": "pending_pick"
}
`,
        statusCodes: [
          { code: 200, meaning: "Order returned" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Caller cannot access the order" },
          { code: 404, meaning: "Order not found" },
        ],
      },
    ],
    notesMD: `
Browse APIs are optimized for cacheability and graceful staleness. Checkout APIs are optimized for correctness, explicit state transitions, and idempotent retries.

Do not trust product-page price, cart price, or search availability during order placement. The order API should revalidate price, promotions, tax, shipping, inventory, and payment authorization before confirming the order.
`,
  },
  databaseDesign: {
    schemaMD: `
The platform uses different storage models for different access patterns. Catalog data is document-oriented and search-indexed. Cart data is a mutable per-user document. Inventory is a concurrency-sensitive ledger plus counters. Orders and payments are durable state machines with immutable audit records.

A single relational schema is useful for explanation, but production systems usually split these tables across specialized stores: a document or wide-column catalog store, an inverted search index, a low-latency cart store, a transactional inventory store, and an order ledger.
`,
    tables: [
      {
        name: "products",
        columns: [
          { name: "product_id", type: "varchar(64)", note: "Primary product identifier shown on product pages" },
          { name: "sku_id", type: "varchar(64)", note: "Sellable variant identifier for color, size, bundle, or marketplace" },
          { name: "title", type: "text", note: "Searchable display title" },
          { name: "brand", type: "varchar(128)", note: "Facet and ranking signal" },
          { name: "category_id", type: "varchar(128)", note: "Taxonomy path for browse and filters" },
          { name: "attributes", type: "json", note: "Structured attributes used for filters and product rendering" },
          { name: "description_ref", type: "varchar(256)", note: "Pointer to rich content or object storage" },
          { name: "status", type: "varchar(32)", note: "Draft, active, suppressed, discontinued, or deleted" },
          { name: "catalog_version", type: "bigint", note: "Monotonic version emitted to search and caches" },
          { name: "updated_at", type: "timestamp", note: "Last catalog update time" },
        ],
      },
      {
        name: "inventory_stock",
        columns: [
          { name: "sku_id", type: "varchar(64)", note: "Partition key with warehouse_id for stock accounting" },
          { name: "warehouse_id", type: "varchar(64)", note: "Fulfillment location or virtual inventory pool" },
          { name: "on_hand", type: "integer", note: "Physical units known to the system" },
          { name: "reserved", type: "integer", note: "Units held for checkout sessions or confirmed orders" },
          { name: "available", type: "integer", note: "Derived or materialized as on_hand minus reserved minus safety stock" },
          { name: "version", type: "bigint", note: "Used for conditional updates and optimistic concurrency" },
          { name: "updated_at", type: "timestamp", note: "Last inventory mutation time" },
        ],
      },
      {
        name: "carts",
        columns: [
          { name: "cart_id", type: "uuid", note: "Primary key for anonymous or signed-in cart" },
          { name: "user_id", type: "uuid nullable", note: "Owner after login, null for anonymous session" },
          { name: "items", type: "json", note: "SKU, quantity, display price snapshot, and seller hint" },
          { name: "version", type: "bigint", note: "Optimistic concurrency token for concurrent device updates" },
          { name: "status", type: "varchar(32)", note: "Active, converted, abandoned, or merged" },
          { name: "updated_at", type: "timestamp", note: "Used for TTL and abandonment cleanup" },
        ],
      },
      {
        name: "orders",
        columns: [
          { name: "order_id", type: "uuid", note: "Primary order identifier" },
          { name: "user_id", type: "uuid", note: "Buyer identity" },
          { name: "idempotency_key", type: "varchar(128)", note: "Unique per buyer or checkout session to deduplicate retries" },
          { name: "checkout_session_id", type: "uuid", note: "Source checkout session" },
          { name: "items", type: "json", note: "Immutable order line items, prices, taxes, and seller allocations" },
          { name: "status", type: "varchar(32)", note: "Pending, confirmed, cancelled, fulfilled, refunded, or failed" },
          { name: "total_cents", type: "bigint", note: "Final committed amount in minor currency units" },
          { name: "currency", type: "char(3)", note: "ISO currency code" },
          { name: "created_at", type: "timestamp", note: "Order creation time" },
        ],
      },
      {
        name: "payment_attempts",
        columns: [
          { name: "payment_attempt_id", type: "uuid", note: "Primary payment attempt identifier" },
          { name: "order_id", type: "uuid", note: "Related order" },
          { name: "provider_reference", type: "varchar(128)", note: "External payment provider idempotency or authorization reference" },
          { name: "idempotency_key", type: "varchar(128)", note: "Deduplicates retries to the payment provider" },
          { name: "amount_cents", type: "bigint", note: "Authorized or captured amount" },
          { name: "status", type: "varchar(32)", note: "Initiated, authorized, captured, failed, voided, or refunded" },
          { name: "created_at", type: "timestamp", note: "Attempt creation time" },
        ],
      },
    ],
    indexesMD: `
- **products.product_id** and **products.sku_id** support product-page lookups. Secondary indexes on category, brand, and status help back-office workflows, but search traffic should go to the inverted index.
- The search index stores token postings for title, brand, description, and attributes, plus doc values or columnar structures for facets such as price, rating, brand, category, seller, and delivery promise.
- **inventory_stock.sku_id, warehouse_id** is the authoritative stock key. Conditional updates must check available units or version before reserving or decrementing.
- **carts.cart_id** is the primary lookup key. **carts.user_id, updated_at** supports active cart lookup and cleanup.
- **orders.user_id, created_at** supports customer order history. A unique constraint on **orders.user_id, idempotency_key** or **checkout_session_id, idempotency_key** prevents duplicate orders.
- **payment_attempts.order_id** and **payment_attempts.provider_reference** support reconciliation and duplicate-safe payment callbacks.
`,
    relationshipsMD: `
Products are referenced by cart items and order items, but cart and order records store snapshots of title, price, seller, and tax-relevant attributes so later catalog changes do not rewrite purchase history. Inventory rows belong to SKU and warehouse pairs, and orders create inventory ledger entries rather than directly trusting cart state.

The search index is a derived projection of products, offers, availability hints, ratings, and ranking signals. It is not the source of truth. Orders and payment attempts form a state machine where each transition is durable and event-emitting.
`,
    noSqlAlternativesMD: `
Use a document store or wide-column store for catalog documents keyed by product ID and SKU ID. Use OpenSearch, Elasticsearch, Solr, or a custom search service for inverted indexes and faceting. Use DynamoDB conditional update, FoundationDB transactions, Spanner, or a strongly consistent relational store for inventory reservations and order idempotency.

Cart data can live in DynamoDB, Cassandra, Redis with persistence, or another low-latency key-value store with TTL. Orders usually deserve a transactional store or event-sourced ledger because payments, refunds, audits, and support workflows need durable history.
`,
  },
  architecture: {
    width: 960,
    height: 560,
    nodes: [
      { id: "client", label: "Client", kind: "client", x: 70, y: 250, sublabel: "Web, mobile, bots" },
      { id: "cdn-edge", label: "CDN and Edge", kind: "cdn", x: 210, y: 120, sublabel: "Static media, page cache" },
      { id: "api-gateway", label: "API Gateway", kind: "gateway", x: 210, y: 310, sublabel: "Auth, routing, limits" },
      { id: "product-page-service", label: "Product Page Service", kind: "service", x: 390, y: 150, sublabel: "PDP, browse orchestration" },
      { id: "catalog-service", label: "Catalog Service", kind: "service", x: 560, y: 80, sublabel: "Product documents" },
      { id: "search-index", label: "Search Index", kind: "search", x: 760, y: 80, sublabel: "Inverted index, facets" },
      { id: "catalog-store", label: "Catalog Store", kind: "database", x: 760, y: 190, sublabel: "Document and offer store" },
      { id: "pricing-reco-service", label: "Pricing and Recommendations", kind: "analytics", x: 560, y: 220, sublabel: "Prices, promos, ranking" },
      { id: "cart-service", label: "Cart Service", kind: "service", x: 390, y: 330, sublabel: "Mutable carts" },
      { id: "checkout-service", label: "Checkout and Order Service", kind: "service", x: 560, y: 370, sublabel: "Saga, idempotency" },
      { id: "inventory-service", label: "Inventory Service", kind: "service", x: 760, y: 320, sublabel: "Reserve, decrement" },
      { id: "inventory-store", label: "Inventory Store", kind: "database", x: 900, y: 320, sublabel: "Counters, ledger" },
      { id: "order-store", label: "Order and Payment Store", kind: "database", x: 760, y: 460, sublabel: "Orders, attempts" },
      { id: "event-bus", label: "Event Bus", kind: "queue", x: 560, y: 500, sublabel: "Kafka, Kinesis" },
      { id: "payment-provider", label: "Payment Provider", kind: "external", x: 900, y: 440, sublabel: "Tokenized payments" },
    ],
    edges: [
      { from: "client", to: "cdn-edge", label: "product pages, media" },
      { from: "client", to: "api-gateway", label: "cart and checkout APIs" },
      { from: "cdn-edge", to: "api-gateway", label: "cache miss or dynamic API" },
      { from: "api-gateway", to: "product-page-service", label: "PDP and search" },
      { from: "api-gateway", to: "cart-service", label: "cart mutations" },
      { from: "api-gateway", to: "checkout-service", label: "checkout and orders" },
      { from: "product-page-service", to: "catalog-service", label: "product document" },
      { from: "product-page-service", to: "search-index", label: "query and filters" },
      { from: "product-page-service", to: "pricing-reco-service", label: "price, promos, recs" },
      { from: "catalog-service", to: "catalog-store", label: "source of truth" },
      { from: "catalog-service", to: "event-bus", label: "catalog updates", dashed: true },
      { from: "event-bus", to: "search-index", label: "index refresh", dashed: true },
      { from: "cart-service", to: "checkout-service", label: "cart snapshot" },
      { from: "checkout-service", to: "pricing-reco-service", label: "reprice cart" },
      { from: "checkout-service", to: "inventory-service", label: "reserve stock" },
      { from: "inventory-service", to: "inventory-store", label: "conditional write" },
      { from: "checkout-service", to: "payment-provider", label: "authorize payment" },
      { from: "checkout-service", to: "order-store", label: "order state" },
      { from: "checkout-service", to: "event-bus", label: "order events", dashed: true },
      { from: "event-bus", to: "pricing-reco-service", label: "behavior signals", dashed: true },
    ],
    captionMD: `
Browse traffic flows through CDN and product-page services into catalog, search, pricing, and recommendation projections. Checkout traffic bypasses stale browse projections and calls authoritative pricing, inventory, payment, and order state services.
`,
  },
  architectureNotesMD: `
The architecture intentionally separates the fast read path from the correctness-sensitive write path. Product pages and search are denormalized, cached, and replicated because small freshness delays are acceptable. Catalog service owns product documents, while the search index is a derived inverted index optimized for text relevance and faceted filtering.

Cart and checkout are separate because a cart is a convenience object, not a purchase contract. Checkout reprices, checks promotions, validates shipping, reserves inventory through conditional writes, authorizes payment through an idempotent provider call, and persists order state before emitting downstream events.

Events connect catalog, inventory, orders, recommendations, and analytics. This makes the platform scalable, but it also means user-visible surfaces need freshness indicators and checkout-time validation. The design should be explicit about which reads can be stale and which decisions require authoritative state.
`,
  requestFlow: [
    {
      title: "Product page or search request reaches the edge",
      detailMD: `
The shopper opens a product page or search results page. Static images, scripts, and cacheable page fragments are served from CDN. Dynamic requests go through the API Gateway to the Product Page Service, which applies authentication context, marketplace, locale, and personalization hints.
`,
    },
    {
      title: "Catalog and search projections answer browse traffic",
      detailMD: `
For product detail pages, the Product Page Service reads a denormalized product document from the Catalog Service or cache. For search, it queries the Search Index, where tokens map to posting lists and structured filters use facet data. Price, availability hints, and ranking features are overlaid from derived projections.
`,
    },
    {
      title: "Pricing and recommendations decorate the page",
      detailMD: `
The Pricing and Recommendation Service returns current display price, promotions, sponsored or personalized recommendations, and ranking signals. If this dependency is slow, the page can render without personalized recommendations and with a conservative price freshness indicator.
`,
    },
    {
      title: "Cart mutation stores intent, not a purchase guarantee",
      detailMD: `
When the shopper adds an item, the Cart Service writes SKU, quantity, seller hint, display price snapshot, and cart version. Concurrent cart updates use optimistic version checks. The cart may show availability hints, but it does not reserve inventory by default because most carts are abandoned.
`,
    },
    {
      title: "Checkout revalidates cart state",
      detailMD: `
Checkout loads the latest cart, product sellability, price, tax, shipping options, promotions, and seller constraints. If price or availability changed, the shopper sees a conflict instead of silently placing a different order.
`,
    },
    {
      title: "Inventory is reserved with a conditional write",
      detailMD: `
For each line item, Checkout calls Inventory Service with SKU, warehouse or pool, quantity, checkout session, and idempotency key. Inventory performs an atomic conditional update that succeeds only when available units are at least the requested quantity, increments reserved units, and writes a ledger record. Holds have TTL so failed checkouts release stock.
`,
    },
    {
      title: "Order and payment are processed idempotently",
      detailMD: `
Checkout creates or finds an order using the shopper-scoped idempotency key. It then authorizes payment with a provider idempotency key tied to the order. Repeated client submissions return the same order and payment attempt instead of duplicating charges.
`,
    },
    {
      title: "Confirmation commits durable state and emits events",
      detailMD: `
After payment authorization and inventory reservation succeed, the Order Service transitions the order to confirmed, persists state, records payment and inventory references, and writes outbox events. Consumers update fulfillment, customer notifications, search availability hints, recommendations, seller dashboards, and analytics.
`,
    },
    {
      title: "Asynchronous projections converge",
      detailMD: `
Catalog, inventory, and order events update caches and derived indexes over time. A product page might briefly show stale stock or price, but checkout remains correct because it revalidates with authoritative services. This is the main consistency boundary to explain in the interview.
`,
    },
  ],
  coreComponents: [
    {
      name: "Product Catalog Service",
      kind: "service",
      role: "Owns product and offer documents used by product pages and search ingestion.",
      detailMD: `
The catalog service stores normalized product documents, variant and offer metadata, category taxonomy, seller status, and versioned updates. It publishes catalog change events so caches and search indexes can refresh without coupling browse reads to write workflows.
`,
    },
    {
      name: "Search Index",
      kind: "search",
      role: "Provides low-latency full-text search, ranking, sorting, and faceted filters.",
      detailMD: `
The search system maintains an inverted index over titles, brands, descriptions, and attributes, plus facet structures for category, brand, price, rating, seller, delivery promise, and availability hints. It is a derived projection and can lag behind catalog or inventory by seconds.
`,
    },
    {
      name: "Inventory Service",
      kind: "service",
      role: "Authoritative owner of stock reservations, decrements, releases, and ledgers.",
      detailMD: `
Inventory uses conditional updates or transactions on SKU and warehouse rows. It writes an immutable ledger entry for every reservation, release, decrement, and adjustment so retries, reconciliation, and warehouse corrections are auditable.
`,
    },
    {
      name: "Cart Service",
      kind: "service",
      role: "Stores shopper intent before checkout.",
      detailMD: `
Carts are mutable documents with optimistic versions and TTL. They can store display price snapshots and availability hints for UX, but final price and inventory checks happen at checkout. Anonymous carts can be merged into account carts after login with conflict rules.
`,
    },
    {
      name: "Checkout and Order Service",
      kind: "service",
      role: "Coordinates price validation, inventory reservation, payment authorization, and order state.",
      detailMD: `
This service runs the order-placement saga. It uses idempotency keys, unique order constraints, durable state transitions, and an outbox so retries and downstream failures do not create duplicate orders or missing fulfillment events.
`,
    },
    {
      name: "Pricing and Recommendation Service",
      kind: "analytics",
      role: "Computes prices, promotions, ranking signals, and personalized recommendations.",
      detailMD: `
Pricing must be authoritative at checkout and cacheable for browse. Recommendations are best-effort and can be served from offline and near-real-time models fed by product views, purchases, cart actions, and catalog metadata.
`,
    },
    {
      name: "CDN and Product Cache",
      kind: "cdn",
      role: "Serves static media and read-heavy product-page fragments close to users.",
      detailMD: `
The CDN serves images, videos, CSS, JavaScript, and cacheable product summary fragments. Internal caches store product documents, offer summaries, and search results with short TTLs and event-driven invalidation for high-impact changes.
`,
    },
    {
      name: "Event Bus",
      kind: "queue",
      role: "Decouples service-of-record updates from derived projections.",
      detailMD: `
Kafka, Kinesis, Pulsar, or a similar log carries catalog, inventory, order, payment, click, and cart events. Consumers build search indexes, recommendation features, analytics dashboards, seller views, fulfillment tasks, and cache invalidations.
`,
    },
  ],
  deepDives: [
    {
      topic: "Product catalog storage and search ingestion",
      detailMD: `
A product catalog is not one table. It includes parent products, sellable SKUs, seller offers, category taxonomy, attributes, images, compliance data, ratings summaries, and suppression state. The source of truth should be versioned by product ID and SKU ID so edits can be audited and emitted as ordered catalog events.

Product pages need a denormalized read model. Rather than joining product, seller, media, rating, and offer tables on every page view, build a product document that contains the fields needed to render the page. Large images and rich media stay in object storage and CDN; the catalog document stores references, metadata, and cache invalidation versions.

Search ingestion consumes catalog events, normalizes text, expands synonyms, maps attributes to typed fields, and writes index segments. Because indexing is asynchronous, the system should expose catalog_version and index_version metrics, monitor lag, and make checkout independent from search freshness.
`,
    },
    {
      topic: "Product search and filtering with an inverted index",
      detailMD: `
The search index maps terms such as headphone, wireless, and brand names to posting lists of matching product documents. Ranking can combine textual relevance, sales velocity, conversion rate, price competitiveness, freshness, personalization, and sponsored placements.

Filters are not implemented by scanning product rows. Category, brand, seller, rating, color, size, price range, shipping speed, and availability are stored as facet-friendly fields. Search engines represent these as doc values, bitsets, or columnar side structures so the query can intersect posting lists with filters efficiently.

Dynamic fields require care. Price and availability can change faster than title or description. Common approaches are short-lived overlays, partial index updates, or a two-phase result assembly where search returns product IDs and a ranking score, then the Product Page Service overlays current price and availability hints. Checkout still revalidates the final values.
`,
    },
    {
      topic: "Inventory decrement under concurrency",
      detailMD: `
The inventory service must prevent oversell when many buyers attempt to purchase the same SKU. Use a stock row or shard keyed by SKU and warehouse with on_hand, reserved, safety_stock, and version. A reservation request succeeds only if available units are at least the requested quantity at the moment of the conditional update.

The conditional operation can be a SQL transaction with row lock, a DynamoDB conditional update, a FoundationDB transaction, or another compare-and-swap primitive. The mutation must also write a ledger entry with request ID, order ID or checkout session ID, quantity, reason, previous version, and new version. This makes retries idempotent and makes reconciliation possible.

For extremely hot drops, a single SKU can become a bottleneck. Options include a short-lived purchase queue, splitting inventory into reservation buckets, preallocating stock per region, or using a token bucket where each token represents one purchasable unit. The tradeoff is fairness and complexity versus raw throughput.
`,
    },
    {
      topic: "Shopping cart and checkout boundary",
      detailMD: `
A cart should be fast and forgiving. It stores intent, not guaranteed allocation. It can accept updates while prices, seller eligibility, delivery promises, and availability are changing in other systems. Use a cart version so two devices do not silently overwrite each other.

Checkout is the boundary where intent becomes a contract. It reloads the cart, resolves each SKU and seller, reprices items, applies promotions, calculates tax and shipping, and checks inventory. If any item changed materially, the system should return a clear conflict and require shopper confirmation.

Do not reserve inventory on every add-to-cart by default at Amazon scale. Cart abandonment is too high and it would artificially hide stock from real buyers. Reserve only during checkout with a short TTL, or for special cases such as limited flash sales.
`,
    },
    {
      topic: "Idempotent order and payment processing",
      detailMD: `
Order placement receives retries from browsers, mobile clients, gateways, and payment providers. The client should send an idempotency key for the order request, and the server should scope it to the shopper or checkout session. A unique constraint maps that key to exactly one order outcome.

Payment calls need their own idempotency key with the external provider. The order service records a payment_attempt before or atomically with the provider call, stores provider references, and handles callbacks idempotently. Duplicate callbacks should advance the same payment attempt or be ignored if the state is already terminal.

The workflow is a saga, not a single distributed transaction across inventory, payment, and fulfillment. If payment fails after inventory reservation, release the reservation. If inventory fails after payment authorization, void or refund the authorization. Use durable state transitions and an outbox so recovery workers can resume incomplete steps.
`,
    },
    {
      topic: "Pricing, promotions, and recommendations",
      detailMD: `
Pricing has two personalities. Browse pricing must be fast, cacheable, and close to current, while checkout pricing must be authoritative and explainable. Keep price rules versioned, store the rule version used for an order, and snapshot final line-item prices, taxes, discounts, and currency on the order.

Promotions and coupons need conflict rules, eligibility checks, budget limits, and abuse prevention. These checks should be deterministic at checkout and must not depend on a stale product page cache.

Recommendations are best-effort. They can use offline models for similar products and near-real-time signals from views, searches, carts, and purchases. Recommendation failure should never block product pages or checkout; return popular items or omit the module.
`,
    },
    {
      topic: "Caching, CDN, and eventual consistency",
      detailMD: `
Read-heavy product pages should be served from multiple cache layers: CDN for media and static fragments, edge or regional caches for product summaries, service caches for catalog documents, and search result caches for common queries. Use short TTLs for volatile fields and event-driven invalidation for suppressions, compliance changes, or major price updates.

Eventual consistency is the price of scale. Catalog updates flow to search, cache, recommendations, and seller dashboards asynchronously. Inventory updates flow to availability hints and search filters. Orders flow to fulfillment, customer notifications, recommendations, and analytics. Each projection must tolerate duplicates, out-of-order events, and replay.

The user contract is preserved by revalidation. Search may show an item that just sold out, and a product page may show a price that changed seconds ago, but checkout must consult authoritative inventory and pricing before confirmation. Explain this boundary clearly.
`,
    },
  ],
  scaling: [
    {
      stage: "Prototype: single marketplace and simple catalog",
      detailMD: `
Start with a relational database for products, carts, inventory, and orders; a basic search engine; a CDN for images; and a monolithic checkout service. Use row locks or transactions for inventory and unique constraints for order idempotency.
`,
    },
    {
      stage: "Growth: separated browse and checkout services",
      detailMD: `
Split product pages, search, cart, checkout, inventory, pricing, and orders into separate services. Add Redis or Memcached for product summaries and carts, asynchronous events for catalog changes, and read replicas or document stores for product rendering.
`,
    },
    {
      stage: "Large scale: partitioned catalog, search, and inventory",
      detailMD: `
Shard catalog by product ID or marketplace, partition search indexes by category or product ID ranges, and replicate search shards for query throughput. Partition inventory by SKU and warehouse, use conditional writes, and keep carts in a horizontally scalable key-value store.
`,
    },
    {
      stage: "Peak commerce: event-driven projections and hot SKU controls",
      detailMD: `
Use an event log for catalog, inventory, order, and behavior streams. Prewarm CDN and service caches for promoted products. Add queue-based admission control, regional stock allocation, hot SKU reservation buckets, and automatic degradation for recommendations and analytics.
`,
    },
    {
      stage: "Global marketplace: multi-region and marketplace isolation",
      detailMD: `
Serve product pages and search locally in each region with replicated projections. Keep inventory authoritative near fulfillment locations, route checkout to the correct region, isolate marketplace-specific compliance rules, and use cross-region order replication for support and analytics.
`,
    },
  ],
  bottlenecks: [
    {
      issue: "Search cluster overload from broad filters",
      optimizationMD: `
Precompute facet fields, cache common queries, cap deep pagination, use search-after tokens, add replicas for query-heavy shards, and separate autocomplete from full search. For expensive ranking models, retrieve candidates first and rerank only the top set.
`,
    },
    {
      issue: "Catalog database pressure from product-page reads",
      optimizationMD: `
Serve product summaries from CDN and regional caches, denormalize product read models, prewarm promoted products, and use event-driven invalidation. Avoid joining source-of-truth tables on every product-page view.
`,
    },
    {
      issue: "Hot inventory row for limited products",
      optimizationMD: `
Use conditional writes with retry bounds, reserve stock in per-region or per-bucket pools, introduce a waiting room or purchase queue for flash sales, and keep a ledger so failed attempts can be audited without corrupting stock.
`,
    },
    {
      issue: "Duplicate orders or duplicate charges under retries",
      optimizationMD: `
Require idempotency keys, enforce unique constraints, store payment attempts durably, pass idempotency keys to payment providers, and make callbacks idempotent. Recovery workers should resume by reading order state rather than re-running blind side effects.
`,
    },
    {
      issue: "Stale price or availability on cached pages",
      optimizationMD: `
Use short TTLs for volatile fields, event invalidation for critical changes, freshness labels for browse, and authoritative revalidation during checkout. Separate display hints from final purchase decisions.
`,
    },
    {
      issue: "Event backlog delaying derived systems",
      optimizationMD: `
Partition event topics by product ID, SKU, order ID, or customer ID depending on consumer needs. Monitor consumer lag, scale consumers independently, use dead-letter queues for poison messages, and design projections to replay safely.
`,
    },
  ],
  failureHandling: [
    {
      scenario: "Search index outage or severe lag",
      strategyMD: `
Product detail pages can continue from catalog caches. Search can degrade to cached popular queries, category browse, or a reduced index. Checkout remains available because it does not depend on the search index for authoritative state.
`,
    },
    {
      scenario: "Catalog update pipeline fails",
      strategyMD: `
Continue serving the last good product projection while alerting on index lag and cache invalidation failures. Suppression or safety changes should have a high-priority invalidation path that can bypass normal batch indexing.
`,
    },
    {
      scenario: "Inventory service unavailable",
      strategyMD: `
Do not confirm orders without authoritative inventory reservation. Product pages can show unknown availability, carts can accept intent, and checkout should return a retryable failure or queue only if the business accepts delayed confirmation.
`,
    },
    {
      scenario: "Payment provider timeout after authorization attempt",
      strategyMD: `
Persist the payment attempt before calling the provider and reconcile using the provider reference and idempotency key. The order can remain payment_pending until a callback, retry, or reconciliation job decides whether to confirm, void, or fail.
`,
    },
    {
      scenario: "Order event outbox stuck",
      strategyMD: `
The confirmed order remains durable in the order store. Outbox workers retry with exponential backoff, consumers deduplicate events, and fulfillment dashboards alert on orders that are confirmed but not yet published downstream.
`,
    },
    {
      scenario: "CDN or cache serving stale unsafe content",
      strategyMD: `
Use versioned cache keys for normal changes and purge APIs for safety, legal, or seller-suppression events. Product pages should check a small deny or suppression list before rendering high-risk cached content.
`,
    },
  ],
  security: [
    {
      label: "Authentication and authorization",
      detailMD: `
Customer, seller, and internal operations require strong identity. Enforce ownership checks for carts and orders, seller authorization for catalog edits, and least-privilege service-to-service access.
`,
    },
    {
      label: "Payment protection",
      detailMD: `
Do not store raw card data in the commerce platform. Use payment tokens, provider-side vaulting, encryption, strict audit logs, fraud checks, and limited-scope credentials for payment operations.
`,
    },
    {
      label: "Abuse and fraud prevention",
      detailMD: `
Detect account takeover, coupon abuse, fake reviews, bot traffic, inventory hoarding, refund fraud, and seller catalog manipulation. Apply rate limits, risk scoring, step-up authentication, and manual review for high-risk transactions.
`,
    },
    {
      label: "Data privacy",
      detailMD: `
Protect addresses, order history, behavioral events, and recommendation features. Minimize raw event retention, separate analytics identifiers from direct identity where possible, and honor deletion or export requirements.
`,
    },
    {
      label: "Operational safety",
      detailMD: `
Catalog suppression, price changes, and inventory adjustments need audit trails and approval controls. Internal tools should use role-based access, reason codes, and change history because mistakes can affect millions of shoppers.
`,
    },
  ],
  tradeoffs: {
    pros: [
      "Separates browse scale from checkout correctness, allowing product pages to be heavily cached while orders remain authoritative.",
      "Uses inverted indexes and denormalized documents for fast search and filtering over a huge catalog.",
      "Protects inventory and payments with conditional writes, ledgers, idempotency keys, and durable state machines.",
      "Event-driven projections let catalog, inventory, orders, recommendations, and analytics evolve independently.",
      "Graceful degradation keeps browsing usable when recommendations, analytics, or noncritical services fail.",
    ],
    cons: [
      "Eventual consistency means browse pages and search filters can briefly show stale price or availability.",
      "The checkout saga is operationally complex because inventory, payment, tax, shipping, and order state can fail independently.",
      "Search relevance, faceting, and dynamic overlays require specialized indexing and freshness monitoring.",
      "Hot SKUs and peak events can overload a single inventory partition without special controls.",
      "Multiple derived projections increase debugging complexity and require strong observability.",
    ],
    alternativesMD: `
Alternative one is a simpler monolithic commerce application with a relational database and synchronous joins. It is easier to build for a small store but cannot serve Amazon-scale read traffic or peak checkout concurrency.

Alternative two is to reserve inventory when an item is added to cart. This improves availability confidence but wastes stock because cart abandonment is high and malicious users can hoard inventory.

Alternative three is to make search query the catalog database directly. That avoids indexing lag but makes filtering and ranking slow, expensive, and hard to scale across hundreds of millions of products.
`,
    whenNotToUseMD: `
Do not use this architecture for a small merchant with thousands of products and low order volume. A managed commerce platform or monolithic application is cheaper and simpler until the business needs large-scale search, event-driven fulfillment, independent service ownership, and high-concurrency inventory protection.
`,
  },
  followUpQuestions: [
    {
      question: "How do you prevent overselling when thousands of shoppers buy the same SKU at once?",
      answerMD: `
Use the Inventory Service as the only writer for stock reservations and decrements. Each reservation performs a conditional update that checks available quantity and version, writes a ledger entry with an idempotency key, and expires the hold if checkout does not complete. For extreme hot SKUs, add queues or preallocated reservation buckets.
`,
    },
    {
      question: "Why not trust the product page price during checkout?",
      answerMD: `
Product pages are cached and may be assembled from eventually consistent projections. Checkout must re-read authoritative pricing rules, promotion eligibility, taxes, shipping, and inventory before creating the order. The order stores the final price snapshot for audit and support.
`,
    },
    {
      question: "How does product search support filters efficiently?",
      answerMD: `
Text terms use an inverted index, while structured filters use facet-friendly fields such as category, brand, price bucket, rating, color, seller, and delivery promise. The query intersects posting lists with facet bitsets or doc values, then ranks the candidate set.
`,
    },
    {
      question: "How do you handle duplicate checkout submissions from a mobile client?",
      answerMD: `
Require a shopper-scoped idempotency key. Store the first order outcome under that key and return it for retries. Use a separate provider idempotency key for payment authorization, and make payment callbacks idempotent as well.
`,
    },
    {
      question: "What consistency guarantees should the system provide?",
      answerMD: `
Browse and search can be eventually consistent for catalog, price hints, availability hints, and recommendations. Checkout needs authoritative validation for price, inventory, payment, and order creation. Order status should be durable and monotonic from the customer perspective.
`,
    },
    {
      question: "How should recommendations be integrated without hurting latency?",
      answerMD: `
Serve recommendations from precomputed or near-real-time projections with tight timeouts. If personalization is slow, fall back to popular or related products, or omit the module. Recommendations should not block product page rendering or checkout.
`,
    },
  ],
  companyVariations: [
    {
      company: "Amazon",
      angleMD: `
Amazon interviewers are likely to push on retail-specific correctness: product catalog modeling, search facets, inventory oversell prevention, checkout idempotency, payment safety, warehouse-aware availability, and graceful degradation on Prime Day-style peaks.
`,
    },
    {
      company: "Microsoft",
      angleMD: `
Microsoft may frame this as a cloud commerce platform with multi-tenant sellers, compliance, Azure Front Door or CDN, Cosmos DB-style partitioning, reliable event processing, observability, and enterprise-grade identity and audit requirements.
`,
    },
    {
      company: "Google",
      angleMD: `
Google often emphasizes search relevance, indexing freshness, ranking quality, serving latency, and large-scale distributed systems. Be ready to explain inverted indexes, facet computation, cache invalidation, and separation between source-of-truth data and projections.
`,
    },
    {
      company: "Stripe",
      angleMD: `
Stripe would probe payment idempotency, ledger correctness, retries, reconciliation, refunds, and exactly-once effects around money movement. Make clear that order and payment workflows are durable state machines with compensating actions.
`,
    },
  ],
  relatedQuestions: [
    {
      slug: "shopping-cart",
      note: "Cart design is a core subproblem and highlights versioning, merge rules, and checkout validation.",
    },
    {
      slug: "payment-gateway",
      note: "Order placement depends on idempotent payment authorization, capture, refund, and reconciliation.",
    },
    {
      slug: "autocomplete",
      note: "Product discovery commonly includes low-latency search suggestions and query understanding.",
    },
    {
      slug: "google-search",
      note: "Large-scale product search shares inverted indexing, ranking, sharding, and freshness tradeoffs.",
    },
    {
      slug: "distributed-transaction",
      note: "Checkout is a saga across inventory, payment, orders, and fulfillment rather than one global transaction.",
    },
  ],
  interviewTips: {
    commonMistakes: [
      "Designing one database schema and using it for product pages, search, carts, inventory, orders, and analytics.",
      "Trusting cached product-page price or availability during order placement.",
      "Forgetting idempotency keys for order creation and payment authorization.",
      "Decrementing inventory with a read-then-write race instead of a conditional update or transaction.",
      "Blocking product pages on recommendations, analytics, or other noncritical services.",
      "Ignoring eventual consistency and failing to state which service is authoritative for each decision.",
    ],
    redFlags: [
      "No concrete capacity estimates for catalog size, product-page QPS, peak orders, or inventory writes.",
      "No inverted index or faceted filtering strategy for product search.",
      "No safe concurrency control for hot inventory.",
      "No durable order state machine or payment reconciliation plan.",
      "No cache invalidation or staleness strategy for read-heavy product pages.",
    ],
    expectations: [
      "Start by separating browse, cart, checkout, inventory, orders, payment, and event-driven projections.",
      "Compute realistic scale numbers and identify the product-page and search read path as the largest traffic source.",
      "Draw the inverted search index and catalog store as separate systems.",
      "Explain inventory reservation with conditional writes, holds, TTL, and ledger entries.",
      "Use idempotency keys and state machines for orders and payments.",
      "Make eventual consistency explicit and enforce authoritative validation at checkout.",
    ],
    communicationMD: `
Lead with the split between read-heavy discovery and correctness-sensitive checkout. Draw product pages, catalog, search, CDN, and caches first, then draw cart, inventory, order, and payment as a stricter state machine. For every stale projection, say which authoritative service checkout uses before confirmation. This framing shows senior-level judgment.
`,
  },
  revisionNotesMD: `
- Amazon-scale commerce is two systems glued together: a massive read-optimized discovery platform and a correctness-focused order-placement platform.
- The catalog source of truth stores versioned product and SKU documents. Product pages use denormalized documents and CDN-backed media, while search uses a derived inverted index.
- Search text uses posting lists; filters use facets, doc values, or bitsets for category, brand, price, rating, seller, delivery promise, and availability hints.
- Product pages are allowed to be slightly stale. Checkout is not. Always revalidate price, promotion, tax, shipping, and inventory before confirming an order.
- Carts store shopper intent and should not reserve stock by default. Cart abandonment makes early reservation expensive and unfair.
- Inventory uses conditional writes or transactions on SKU and warehouse rows, plus immutable ledger entries and reservation TTLs.
- Order placement must be idempotent. Use shopper-scoped idempotency keys for orders and provider-scoped idempotency keys for payments.
- Payment, inventory, and order workflows are sagas with compensating actions, not one giant distributed transaction.
- Events update search availability hints, recommendations, analytics, fulfillment, seller dashboards, and notifications. Consumers must handle duplicates, replay, and out-of-order events.
- Capacity anchor numbers: one billion SKUs, about 250,000 peak product-page reads per second, about 8,000 peak orders per second, and around 50,000 peak inventory writes per second.
`,
  flashcards: [
    {
      front: "What is the main architectural split in Amazon-style commerce?",
      back: "Separate read-heavy discovery from correctness-sensitive checkout. Browse can be cached and eventually consistent; checkout must use authoritative price, inventory, payment, and order state.",
    },
    {
      front: "How should product search support text queries?",
      back: "Use an inverted index where terms map to posting lists of product documents, then rank candidates using relevance, popularity, price, availability, and personalization signals.",
    },
    {
      front: "How are filters such as brand and price handled efficiently?",
      back: "Store structured fields as facets, doc values, bitsets, or columnar side data so the search engine intersects them with the text candidate set without scanning product rows.",
    },
    {
      front: "Why should add-to-cart not usually reserve inventory?",
      back: "Most carts are abandoned, so reserving on cart add would hide stock from real buyers and enable hoarding. Reserve during checkout with a short TTL.",
    },
    {
      front: "How does inventory prevent oversell?",
      back: "Perform an atomic conditional update on SKU and warehouse stock that succeeds only when enough units are available, and record a ledger entry with an idempotency key.",
    },
    {
      front: "Why are order idempotency keys required?",
      back: "Clients and gateways retry. An idempotency key maps repeated submissions to the same order outcome, preventing duplicate orders and duplicate charges.",
    },
    {
      front: "What should happen if payment succeeds but inventory later fails?",
      back: "The saga should void or refund the payment authorization, mark the order failed or cancelled, emit audit events, and release any partial reservations.",
    },
    {
      front: "Which data can be eventually consistent?",
      back: "Catalog projections, search results, availability hints, recommendations, analytics, and product-page caches can lag. Checkout decisions cannot rely on those stale projections.",
    },
    {
      front: "What is a realistic peak product-page QPS target in this design?",
      back: "Using 2B product views per day and a 10x peak multiplier gives roughly 250,000 product detail reads per second globally.",
    },
  ],
  quiz: [
    {
      question: "Which component should be considered authoritative for preventing oversell?",
      options: ["Search index", "Product page cache", "Inventory Service", "Recommendation Service"],
      answerIndex: 2,
      explanationMD: `
The Inventory Service owns stock reservations and decrements. Search and product pages can show availability hints, but checkout must call the authoritative inventory path.
`,
    },
    {
      question: "Why is an inverted index used for product search?",
      options: ["It stores payment attempts durably", "It maps search terms to matching product documents and supports efficient candidate retrieval", "It reserves stock for checkout", "It replaces the need for product IDs"],
      answerIndex: 1,
      explanationMD: `
An inverted index maps terms to posting lists of matching documents. Filters and facets then narrow the candidate set before ranking.
`,
    },
    {
      question: "What is the safest default for add-to-cart inventory behavior at large scale?",
      options: ["Reserve inventory for every cart forever", "Do not reserve by default; revalidate and reserve during checkout", "Immediately decrement warehouse stock permanently", "Trust the product page availability field"],
      answerIndex: 1,
      explanationMD: `
Cart abandonment is high. Reserving on every cart add would waste scarce stock and invite hoarding. Checkout is the right boundary for short-lived reservations.
`,
    },
    {
      question: "Given 80M orders in a peak day, what is the approximate average order rate?",
      options: ["About 93 orders per second", "About 925 orders per second", "About 8,000 orders per second", "About 80,000 orders per second"],
      answerIndex: 1,
      explanationMD: `
80M orders divided by 86,400 seconds is about 925 orders per second on average. The design still provisions much higher peak throughput.
`,
    },
    {
      question: "What prevents duplicate orders when a mobile client retries the place-order request?",
      options: ["A CDN cache", "A shopper-scoped idempotency key with a unique constraint", "A search facet", "A recommendation fallback"],
      answerIndex: 1,
      explanationMD: `
The order service stores the first result for the idempotency key and returns it for retries. This prevents duplicate order creation under network retries.
`,
    },
    {
      question: "Which statement best describes consistency between search and checkout?",
      options: ["Search must be perfectly consistent with inventory at all times", "Search may show stale availability, but checkout must revalidate with authoritative services", "Checkout should trust search results to reduce latency", "Inventory updates should be written only to the search index"],
      answerIndex: 1,
      explanationMD: `
Search and product pages are derived projections and can lag. Checkout preserves correctness by consulting authoritative pricing and inventory before confirmation.
`,
    },
  ],
  cheatSheetMD: `
**Goal**: design a global e-commerce platform with fast product discovery, safe inventory handling, and idempotent order and payment processing.

**Scale anchors**: one billion SKUs, 8 TB raw catalog metadata, 25 to 40 TB search index footprint, 250,000 peak product-page reads per second, 60,000 peak search requests per second, 8,000 peak orders per second, and 50,000 peak inventory writes per second.

**Browse path**: client to CDN to Product Page Service. Read denormalized catalog documents, query the inverted search index for search and filters, overlay price, availability hints, ratings, and recommendations. Serve media and fragments from CDN.

**Search**: inverted index for terms; facets, doc values, or bitsets for brand, category, price, rating, seller, delivery speed, and availability. Search is a projection, not the source of truth.

**Cart**: stores intent with item quantity, display price snapshot, seller hint, and version. Use optimistic concurrency. Do not reserve inventory on normal cart add.

**Checkout**: revalidate product sellability, price, promotions, tax, shipping, and inventory. Return conflicts for changed items. Reserve stock with conditional writes and short TTL holds.

**Inventory**: authoritative service with SKU and warehouse counters, version checks, conditional updates, and immutable ledger entries. For hot SKUs, use queues, buckets, or regional stock allocation.

**Orders and payments**: use idempotency keys, unique constraints, durable state transitions, payment attempt records, provider idempotency, and compensation for partial failures.

**Consistency**: catalog, search, inventory hints, recommendations, and analytics are eventually consistent. Checkout is the boundary where authoritative state is required.

**Degradation**: product pages can omit recommendations, serve stale fragments briefly, and show unknown availability. Checkout should fail closed if inventory or payment authority is unavailable.
`,
  references: [
    {
      title: "Designing Data-Intensive Applications",
      kind: "Book",
      author: "Martin Kleppmann",
    },
    {
      title: "The Amazon Builders' Library - Making retries safe with idempotent APIs",
      kind: "Blog",
      url: "https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/",
      author: "Malcolm Featonby",
    },
    {
      title: "The Amazon Builders' Library - Avoiding insurmountable queue backlogs",
      kind: "Blog",
      url: "https://aws.amazon.com/builders-library/avoiding-insurmountable-queue-backlogs/",
      author: "AWS",
    },
    {
      title: "Elasticsearch Guide - Inverted index and analysis",
      kind: "Docs",
      url: "https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis.html",
      author: "Elastic",
    },
  ],
};
