import type { SDQuestionContent } from "../types";

export const paymentGatewayContent: SDQuestionContent = {
  slug: "payment-gateway",
  statementMD: `
Design a Payment Gateway like Stripe Payments, Amazon Pay, or Uber's internal payments platform. The system lets merchants create payment intents, authorize cards or wallets, capture funds, refund charges, and receive reliable status updates while integrating with external payment service providers, card networks, acquiring banks, fraud systems, and settlement rails.

At interview scale, assume thousands of merchants, global traffic spikes, strict correctness requirements, and many unreliable dependencies outside your control. The hard part is not only calling a PSP API; it is ensuring client retries do not double-charge users, maintaining an immutable double-entry ledger, coordinating state transitions across services, reconciling asynchronous webhooks and settlement files, and keeping card data out of your core systems.

The default design should optimize for correctness, auditability, fault isolation, and compliance. Latency matters for checkout conversion, but the system must prefer a delayed or pending payment over an ambiguous duplicate charge.
`,
  businessUseCaseMD: `
A payment gateway is the money movement layer for marketplaces, subscriptions, ride sharing, food delivery, e-commerce, SaaS billing, and in-app purchases. It gives product teams a stable API for collecting money without forcing every product surface to understand card network rules, regional PSP behavior, fraud scoring, refunds, chargebacks, or PCI-DSS scope.

Businesses also need payment observability. Finance teams require immutable records, settlement reconciliation, fee accounting, and audit trails; operations teams need clear retry, failure, and dispute handling; merchants need webhooks and dashboards that explain where each payment is in the lifecycle.
`,
  functionalRequirements: [
    "Create a payment intent with amount, currency, merchant, customer, payment method, and idempotency key.",
    "Authorize a payment method and place a hold without necessarily moving funds immediately.",
    "Capture a full or partial authorized amount and transition the payment through captured and settled states.",
    "Refund a full or partial captured payment while preserving original accounting history.",
    "Tokenize or vault card data so the core gateway stores only tokens and non-sensitive metadata.",
    "Integrate with multiple external PSPs, card networks, wallets, and acquiring banks through provider adapters.",
    "Deliver merchant-facing webhooks for state changes with retry, signing, deduplication, and delivery history.",
    "Run asynchronous reconciliation jobs against provider webhooks, settlement files, and the internal ledger.",
  ],
  nonFunctionalRequirements: [
    {
      label: "Correctness",
      detailMD: `
The system must prevent duplicate charges under client retries, network timeouts, worker retries, and webhook replay. Idempotency keys, unique operation identifiers, ledger constraints, and reconciliation should make the externally visible financial effect happen once.
`,
    },
    {
      label: "Latency",
      detailMD: `
Checkout authorization should typically complete in 300ms to 800ms p95 when the selected PSP is healthy, excluding 3-D Secure or bank challenge flows. Internal API overhead should stay below 100ms p95 so most latency comes from unavoidable external payment rails.
`,
    },
    {
      label: "Availability",
      detailMD: `
Payment creation and status reads should target 99.99 percent availability, but the design should allow graceful degradation. If a PSP is down, route eligible traffic to another provider, return pending for uncertain operations, and continue serving status from internal state.
`,
    },
    {
      label: "Auditability",
      detailMD: `
Every money movement must have a durable audit trail. The ledger is append-only, every provider request and response is correlated, and state transitions record who or what caused them so finance can explain balances months later.
`,
    },
    {
      label: "Consistency",
      detailMD: `
The internal state machine, idempotency records, outbox events, and ledger entries need transactional boundaries. Cross-service and provider interactions use sagas with compensating actions because a single distributed ACID transaction across banks and PSPs is not realistic.
`,
    },
    {
      label: "Compliance",
      detailMD: `
Reduce PCI-DSS scope by using hosted payment fields, network tokens, and a dedicated vault. Core payment services should never log or persist raw PAN, CVV, or magnetic stripe data.
`,
    },
    {
      label: "Operability",
      detailMD: `
Retries must use bounded exponential backoff, dead-letter queues, correlation IDs, provider-specific dashboards, reconciliation alerts, and manual repair workflows for ambiguous financial states.
`,
    },
  ],
  capacityEstimation: {
    assumptionsMD: `
Assume a mature global platform processing 100M payment attempts per day across cards, wallets, and bank methods. Average traffic is about 1,160 payment attempts per second, and peak checkout traffic is 10x average, or about 11,600 attempts per second.

Assume 85 percent of attempts are authorized, 80 percent of authorizations are captured, 5 percent of captured payments are refunded, and every payment attempt generates several durable writes: payment state, provider attempt, idempotency record, outbox event, and ledger entries. Keep seven years of transaction history for audit and finance.
`,
    metrics: [
      {
        label: "Daily payment attempts",
        value: "100M per day",
        note: "Across all merchants and payment methods",
      },
      {
        label: "Average payment TPS",
        value: "1,160 attempts per second",
        note: "100M divided by 86,400 seconds",
      },
      {
        label: "Peak payment TPS",
        value: "11,600 attempts per second",
        note: "10x average peak during campaigns and regional rush hours",
      },
      {
        label: "Authorization volume",
        value: "85M authorizations per day",
        note: "85 percent authorization success rate",
      },
      {
        label: "Capture volume",
        value: "68M captures per day",
        note: "80 percent of authorized payments are captured",
      },
      {
        label: "Refund volume",
        value: "3.4M refunds per day",
        note: "5 percent of captured payments later produce a refund",
      },
      {
        label: "Ledger write volume",
        value: "285M ledger entries per day",
        note: "At least two entries for each capture and refund, plus authorization holds, fees, and reversals",
      },
      {
        label: "Peak ledger writes",
        value: "33,000 to 45,000 entries per second",
        note: "Peak payments times several immutable ledger rows per operation",
      },
      {
        label: "Transaction history storage",
        value: "140 to 180 TB raw over seven years",
        note: "Payment, attempt, webhook, and ledger history before replication and indexes",
      },
      {
        label: "Webhook delivery volume",
        value: "250M to 400M deliveries per day",
        note: "State-change events plus retries to merchant endpoints",
      },
    ],
    calculationsMD: `
- Attempts: 100M attempts per day divided by 86,400 seconds is about 1,157 attempts per second, rounded to 1,160.
- Peak: a 10x peak multiplier gives about 11,600 payment attempts per second.
- Authorizations: 85 percent of 100M daily attempts gives 85M authorization successes per day.
- Captures: 80 percent of 85M authorizations gives 68M captures per day.
- Refunds: 5 percent of 68M captured payments gives about 3.4M refunds per day.
- Ledger entries: every capture writes at least debit and credit entries, every refund writes at least debit and credit entries, and the system also writes authorization holds, fee entries, reversals, reserves, and clearing entries. A practical planning number is around 285M immutable ledger entries per day.
- Ledger write TPS: 285M ledger entries per day divided by 86,400 seconds is about 3,300 ledger entries per second on average. With a 10x peak and extra fee or reserve lines, design for roughly 33,000 to 45,000 ledger writes per second.
- Storage: if payment intent, provider attempt, webhook, audit, and ledger data average about 2KB per payment attempt after indexing metadata is excluded, 100M attempts per day creates about 200GB raw per day. Seven years is about 511TB for the full history. With tiering, compaction, and cold object storage, keep roughly 140 to 180TB in queryable raw operational stores and archive the rest in cheaper immutable storage. Replication and indexes can multiply this by 3x or more.
- Webhooks: a payment can emit created, authorized, captured, settled, failed, and refunded events. If the average is 2.5 to 4 merchant deliveries per attempt including retries, expect 250M to 400M webhook delivery attempts per day.
`,
  },
  apiDesign: {
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/payment-intents",
        descriptionMD: `
Creates a payment intent. The merchant must send an idempotency key so retries after timeouts return the original result instead of creating a second payable object.
`,
        request: `
Idempotency-Key: idem_merchant_123_order_987

{
  "merchantId": "mer_123",
  "customerId": "cus_456",
  "amountMinor": 12500,
  "currency": "USD",
  "captureMethod": "manual",
  "paymentMethodToken": "tok_card_789",
  "orderReference": "order_987"
}
`,
        response: `
{
  "paymentIntentId": "pi_123",
  "state": "created",
  "amountMinor": 12500,
  "currency": "USD",
  "captureMethod": "manual",
  "nextAction": "authorize"
}
`,
        statusCodes: [
          { code: 201, meaning: "Created" },
          { code: 200, meaning: "Existing idempotent result returned" },
          { code: 400, meaning: "Invalid amount, currency, merchant, or payment method" },
          { code: 409, meaning: "Idempotency key reused with different request body" },
          { code: 429, meaning: "Merchant or client rate limit exceeded" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/payment-intents/{paymentIntentId}/authorize",
        descriptionMD: `
Runs fraud checks and asks the selected provider or acquiring bank to authorize the payment method. The operation is idempotent at both the gateway and provider adapter layers.
`,
        request: `
Idempotency-Key: idem_authorize_pi_123

{
  "merchantId": "mer_123",
  "clientContext": {
    "ipAddress": "203.0.113.8",
    "deviceId": "dev_abc",
    "userAgent": "mobile-app"
  }
}
`,
        response: `
{
  "paymentIntentId": "pi_123",
  "state": "authorized",
  "authorizationId": "auth_456",
  "provider": "psp_a",
  "authorizedAmountMinor": 12500,
  "expiresAt": "2026-07-31T12:54:46Z"
}
`,
        statusCodes: [
          { code: 200, meaning: "Authorized or existing authorization returned" },
          { code: 202, meaning: "Pending external authentication or provider callback" },
          { code: 402, meaning: "Card declined or insufficient funds" },
          { code: 409, meaning: "Payment intent is not in an authorizable state" },
          { code: 503, meaning: "No healthy provider route available" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/payment-intents/{paymentIntentId}/capture",
        descriptionMD: `
Captures funds for an authorized payment. Capture writes immutable ledger entries and can be full or partial depending on merchant policy and provider support.
`,
        request: `
Idempotency-Key: idem_capture_pi_123

{
  "merchantId": "mer_123",
  "amountMinor": 12500,
  "currency": "USD"
}
`,
        response: `
{
  "paymentIntentId": "pi_123",
  "state": "captured",
  "captureId": "cap_789",
  "capturedAmountMinor": 12500,
  "ledgerTransactionId": "ltx_123"
}
`,
        statusCodes: [
          { code: 200, meaning: "Captured or existing capture returned" },
          { code: 202, meaning: "Capture submitted and waiting for provider confirmation" },
          { code: 400, meaning: "Invalid amount or currency" },
          { code: 409, meaning: "Payment intent is not authorized or has already failed" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/refunds",
        descriptionMD: `
Creates a full or partial refund against a captured payment. Refunds are modeled as new money movement operations with their own idempotency keys and ledger entries.
`,
        request: `
Idempotency-Key: idem_refund_pi_123_1

{
  "paymentIntentId": "pi_123",
  "merchantId": "mer_123",
  "amountMinor": 5000,
  "reason": "customer_request"
}
`,
        response: `
{
  "refundId": "re_123",
  "paymentIntentId": "pi_123",
  "state": "refund_pending",
  "amountMinor": 5000
}
`,
        statusCodes: [
          { code: 201, meaning: "Refund created" },
          { code: 200, meaning: "Existing idempotent refund returned" },
          { code: 400, meaning: "Invalid refund amount" },
          { code: 409, meaning: "Refund exceeds captured or refundable amount" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/payment-intents/{paymentIntentId}",
        descriptionMD: `
Returns the gateway's current view of the payment state, provider references, ledger transaction references, and next actions. Merchants use this when webhooks are delayed or lost.
`,
        response: `
{
  "paymentIntentId": "pi_123",
  "state": "settled",
  "amountMinor": 12500,
  "currency": "USD",
  "authorizationId": "auth_456",
  "captureId": "cap_789",
  "settlementBatchId": "set_20260726_01"
}
`,
        statusCodes: [
          { code: 200, meaning: "Payment intent returned" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Merchant cannot access this payment" },
          { code: 404, meaning: "Payment intent not found" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/webhooks/{provider}",
        descriptionMD: `
Receives asynchronous provider events for authorization, capture, settlement, refund, chargeback, and failure updates. The endpoint verifies signatures and deduplicates provider event IDs before updating internal state.
`,
        request: `
Provider-Signature: sig_abc

{
  "providerEventId": "evt_123",
  "providerPaymentId": "psp_pay_456",
  "eventType": "capture.succeeded",
  "occurredAt": "2026-07-26T12:54:46Z"
}
`,
        response: `
{
  "received": true,
  "deduplicated": false
}
`,
        statusCodes: [
          { code: 200, meaning: "Webhook accepted" },
          { code: 202, meaning: "Webhook stored for asynchronous processing" },
          { code: 400, meaning: "Malformed event" },
          { code: 401, meaning: "Invalid provider signature" },
        ],
      },
    ],
    notesMD: `
Every mutating endpoint accepts an idempotency key scoped to merchant, operation, and request fingerprint. The gateway stores the first result and returns it for identical retries. Reusing the same key with a different amount, currency, or payment method must fail because that is usually a client bug.

The public API should expose stable payment intent states rather than raw provider codes. Provider-specific failures are normalized internally while preserving the raw response for debugging, disputes, and reconciliation.
`,
  },
  databaseDesign: {
    schemaMD: `
The core data model separates mutable workflow state from immutable accounting. Payment intent and attempt records track the operational state machine, while ledger entries are append-only and never updated in place. Provider events, idempotency keys, and outbox messages make retries and asynchronous processing safe.

Use a transactional relational database or strongly consistent distributed SQL store for payment state, idempotency, and ledger writes within one shard. Partition by merchant or payment intent for scale, but keep all rows needed for a single payment operation in the same transactional boundary whenever possible.
`,
    tables: [
      {
        name: "payment_intents",
        columns: [
          { name: "payment_intent_id", type: "uuid", note: "Primary key for the merchant-facing payment object" },
          { name: "merchant_id", type: "uuid", note: "Tenant and ownership boundary" },
          { name: "customer_id", type: "uuid nullable", note: "Optional buyer identity" },
          { name: "amount_minor", type: "bigint", note: "Amount in the smallest currency unit" },
          { name: "currency", type: "char(3)", note: "ISO currency code" },
          { name: "state", type: "varchar(32)", note: "created, authorized, captured, settled, refunded, failed" },
          { name: "capture_method", type: "varchar(16)", note: "automatic or manual" },
          { name: "payment_method_token_id", type: "uuid", note: "Reference to vaulted payment credentials" },
          { name: "created_at", type: "timestamp", note: "Creation time" },
          { name: "updated_at", type: "timestamp", note: "Last state transition time" },
        ],
      },
      {
        name: "idempotency_keys",
        columns: [
          { name: "merchant_id", type: "uuid", note: "Scope for key uniqueness" },
          { name: "idempotency_key", type: "varchar(128)", note: "Client supplied operation key" },
          { name: "request_hash", type: "char(64)", note: "Hash of method, path, and normalized body" },
          { name: "resource_id", type: "uuid nullable", note: "Payment, capture, or refund created by this key" },
          { name: "status_code", type: "int nullable", note: "Stored response status for safe replay" },
          { name: "response_body", type: "json nullable", note: "Stored response for identical retries" },
          { name: "expires_at", type: "timestamp", note: "Retention window for retry safety" },
        ],
      },
      {
        name: "payment_attempts",
        columns: [
          { name: "attempt_id", type: "uuid", note: "Primary key for one provider operation" },
          { name: "payment_intent_id", type: "uuid", note: "Parent payment intent" },
          { name: "operation", type: "varchar(24)", note: "authorize, capture, refund, void" },
          { name: "provider", type: "varchar(64)", note: "Selected PSP or acquiring route" },
          { name: "provider_request_id", type: "varchar(128)", note: "Gateway generated idempotent provider request identifier" },
          { name: "provider_reference", type: "varchar(128) nullable", note: "External provider payment or transaction ID" },
          { name: "state", type: "varchar(32)", note: "pending, succeeded, failed, ambiguous" },
          { name: "retry_count", type: "int", note: "Number of retry attempts" },
          { name: "next_retry_at", type: "timestamp nullable", note: "Backoff schedule for retry worker" },
        ],
      },
      {
        name: "ledger_entries",
        columns: [
          { name: "ledger_entry_id", type: "uuid", note: "Primary key for an immutable ledger line" },
          { name: "ledger_transaction_id", type: "uuid", note: "Groups debit and credit entries that must balance" },
          { name: "merchant_id", type: "uuid", note: "Tenant and accounting partition" },
          { name: "account_id", type: "varchar(64)", note: "Customer payable, merchant receivable, clearing, fee, reserve, or cash account" },
          { name: "direction", type: "varchar(6)", note: "debit or credit" },
          { name: "amount_minor", type: "bigint", note: "Positive amount in smallest currency unit" },
          { name: "currency", type: "char(3)", note: "Currency for this ledger entry" },
          { name: "source_type", type: "varchar(32)", note: "capture, refund, settlement, chargeback, fee" },
          { name: "source_id", type: "uuid", note: "Payment attempt or reconciliation source" },
          { name: "created_at", type: "timestamp", note: "Append-only creation time" },
        ],
      },
      {
        name: "provider_events",
        columns: [
          { name: "provider", type: "varchar(64)", note: "Source PSP or banking partner" },
          { name: "provider_event_id", type: "varchar(128)", note: "Unique event ID for deduplication" },
          { name: "provider_reference", type: "varchar(128)", note: "External payment, capture, or refund reference" },
          { name: "event_type", type: "varchar(64)", note: "Provider event name" },
          { name: "payload_hash", type: "char(64)", note: "Integrity and deduplication helper" },
          { name: "processed_at", type: "timestamp nullable", note: "Null until the event has updated internal state" },
          { name: "received_at", type: "timestamp", note: "Gateway receive timestamp" },
        ],
      },
    ],
    indexesMD: `
- **idempotency_keys.merchant_id, idempotency_key** is unique and must be checked before mutating state.
- **payment_intents.merchant_id, created_at** supports merchant dashboards and customer support lookups.
- **payment_attempts.provider, provider_request_id** is unique so provider retries cannot create duplicate attempts.
- **payment_attempts.provider_reference** supports webhook correlation from external providers.
- **ledger_entries.ledger_transaction_id** supports balance checks that every ledger transaction has equal debits and credits.
- **provider_events.provider, provider_event_id** is unique for webhook replay protection.
`,
    relationshipsMD: `
A payment intent has many payment attempts because authorization, capture, refund, and retry operations are separate. Each successful money movement references one balanced ledger transaction with two or more immutable entries. Provider events may arrive before or after synchronous responses, so they correlate through provider_reference and can update the same payment attempt idempotently.
`,
    noSqlAlternativesMD: `
Pure NoSQL storage is risky for the ledger because financial correctness needs transactions, uniqueness constraints, and balance invariants. A common production split is distributed SQL for idempotency, state, and ledger records; a log or queue for outbox events; object storage for raw provider payloads and settlement files; and an OLAP store for analytics and merchant reporting.
`,
  },
  architecture: {
    width: 960,
    height: 560,
    nodes: [
      { id: "client", label: "Buyer Client", kind: "client", x: 70, y: 180, sublabel: "Web, mobile, POS" },
      { id: "merchant-service", label: "Merchant Backend", kind: "service", x: 210, y: 180, sublabel: "Orders, checkout" },
      { id: "api-gateway", label: "Payment API Gateway", kind: "gateway", x: 350, y: 180, sublabel: "Auth, rate limits" },
      { id: "orchestrator", label: "Payment Orchestrator", kind: "service", x: 500, y: 180, sublabel: "State machine, saga" },
      { id: "idempotency-store", label: "Idempotency Store", kind: "database", x: 500, y: 60, sublabel: "Keys and responses" },
      { id: "fraud-service", label: "Fraud Service", kind: "service", x: 350, y: 330, sublabel: "Risk and rules" },
      { id: "token-vault", label: "Token Vault", kind: "storage", x: 500, y: 330, sublabel: "PCI boundary" },
      { id: "payment-store", label: "Payment State DB", kind: "database", x: 660, y: 110, sublabel: "Intents, attempts" },
      { id: "ledger-store", label: "Ledger DB", kind: "database", x: 660, y: 280, sublabel: "Double-entry" },
      { id: "provider-adapters", label: "Provider Adapters", kind: "service", x: 660, y: 430, sublabel: "PSP routing" },
      { id: "external-rails", label: "External Rails", kind: "external", x: 830, y: 430, sublabel: "PSPs, networks, acquirers" },
      { id: "event-queue", label: "Event Queue", kind: "queue", x: 830, y: 180, sublabel: "Outbox, webhooks" },
      { id: "workers", label: "Webhook and Reconciliation Workers", kind: "worker", x: 830, y: 300, sublabel: "Retries, settlement" },
      { id: "monitoring", label: "Monitoring", kind: "monitoring", x: 830, y: 60, sublabel: "Alerts, audit" },
    ],
    edges: [
      { from: "client", to: "merchant-service", label: "checkout" },
      { from: "merchant-service", to: "api-gateway", label: "payment API" },
      { from: "api-gateway", to: "orchestrator", label: "validated request" },
      { from: "orchestrator", to: "idempotency-store", label: "dedupe and replay" },
      { from: "orchestrator", to: "fraud-service", label: "risk decision" },
      { from: "orchestrator", to: "token-vault", label: "token lookup" },
      { from: "orchestrator", to: "payment-store", label: "state transition" },
      { from: "orchestrator", to: "ledger-store", label: "balanced entries" },
      { from: "orchestrator", to: "provider-adapters", label: "authorize or capture" },
      { from: "provider-adapters", to: "external-rails", label: "PSP and bank calls" },
      { from: "external-rails", to: "api-gateway", label: "provider webhook", dashed: true },
      { from: "orchestrator", to: "event-queue", label: "outbox event", dashed: true },
      { from: "event-queue", to: "workers", label: "async jobs", dashed: true },
      { from: "workers", to: "payment-store", label: "webhook state update", dashed: true },
      { from: "workers", to: "ledger-store", label: "reconciliation entries", dashed: true },
      { from: "workers", to: "external-rails", label: "retry or settlement fetch", dashed: true },
      { from: "orchestrator", to: "monitoring", label: "metrics and audit", dashed: true },
    ],
    captionMD: `
The critical synchronous path is merchant backend to payment API to orchestrator to idempotency store, fraud decision, token vault, payment state database, provider adapter, and ledger. Asynchronous webhook, reconciliation, and merchant notification work is isolated behind the event queue.
`,
  },
  architectureNotesMD: `
The Payment Orchestrator owns the state machine: created -> authorized -> captured -> settled -> refunded or failed. It should transition state only through validated commands, and each transition should be persisted with a correlated attempt, provider reference, audit record, and outbox event.

The idempotency store is in the synchronous path because duplicate charges are worse than slow checkout. It stores the request fingerprint and the first terminal or pending response, allowing clients and workers to retry safely. Provider adapters also forward stable request identifiers to PSPs so external calls are idempotent when the provider supports it.

The ledger is the accounting source of truth, not a reporting cache. Successful captures, refunds, chargebacks, fees, reserves, and settlements produce immutable balanced ledger transactions. Webhooks and reconciliation workers can update operational states, but they never rewrite old ledger history; they append corrections.
`,
  requestFlow: [
    {
      title: "Merchant creates a payment intent",
      detailMD: `
The merchant backend receives a checkout action from the buyer and calls the payment API with amount, currency, payment method token, order reference, and an idempotency key. The gateway authenticates the merchant, rate-limits the request, hashes the normalized payload, and inserts or reads the idempotency record before creating anything new.
`,
    },
    {
      title: "Card data stays inside the PCI boundary",
      detailMD: `
The buyer's raw card data is collected through hosted fields, a mobile SDK, network tokenization, or a dedicated vault. The core gateway receives only a payment method token, last four digits, card brand, and expiry metadata, which greatly reduces PCI-DSS scope for the orchestrator, ledger, and merchant systems.
`,
    },
    {
      title: "Fraud and risk checks run before authorization",
      detailMD: `
The orchestrator calls a fraud service with merchant, customer, device, IP, amount, velocity, and historical dispute signals. Low-risk transactions continue, high-risk transactions fail or require step-up authentication, and uncertain transactions may be routed to a provider that supports stronger authentication.
`,
    },
    {
      title: "Authorization saga starts",
      detailMD: `
The orchestrator persists the payment intent in created state, creates a payment attempt, writes an outbox event, and calls the selected provider adapter with a stable provider request ID. If the merchant retries the same authorization key, the idempotency store returns the original attempt rather than calling the provider again.
`,
    },
    {
      title: "External provider responds or times out",
      detailMD: `
A successful provider response moves the payment to authorized and stores the provider authorization reference. A clear decline moves it to failed. A timeout or transport failure is ambiguous, so the attempt remains pending or ambiguous until webhook, status polling, or reconciliation determines the true provider outcome.
`,
    },
    {
      title: "Capture creates immutable accounting entries",
      detailMD: `
For automatic capture, the orchestrator immediately captures after authorization; for manual capture, the merchant calls capture later. On capture success, the ledger appends balanced debit and credit entries for customer payable, merchant receivable, clearing, platform fee, and reserves as needed. The payment moves to captured only when state and ledger writes commit together.
`,
    },
    {
      title: "Webhooks update state asynchronously",
      detailMD: `
PSPs and acquiring banks send events for authorization, capture, settlement, refund, chargeback, and failure. The webhook endpoint verifies signatures, stores the event with a unique provider event ID, and workers process it idempotently. Replayed webhooks are acknowledged without reapplying state or ledger effects.
`,
    },
    {
      title: "Reconciliation closes gaps",
      detailMD: `
Scheduled jobs fetch provider transaction reports and settlement files, compare them against payment attempts and ledger balances, and flag missing webhooks, amount mismatches, duplicate provider references, and unsettled captures. Differences produce adjustment ledger entries or manual investigation tasks.
`,
    },
    {
      title: "Refunds and failures use compensating actions",
      detailMD: `
Refunds are separate idempotent operations that call the provider, update payment state, and append reversing ledger entries. If capture succeeds but merchant order fulfillment fails, the saga issues a refund or void depending on state. The system never deletes the original charge history.
`,
    },
  ],
  coreComponents: [
    {
      name: "Payment API Gateway",
      kind: "gateway",
      role: "Exposes stable merchant APIs for payment creation, authorization, capture, refunds, and status reads.",
      detailMD: `
The gateway handles merchant authentication, rate limiting, request validation, API versioning, and routing to the orchestrator. It requires idempotency keys for mutating operations and rejects key reuse with a different request fingerprint.
`,
    },
    {
      name: "Payment Orchestrator",
      kind: "service",
      role: "Owns the payment state machine and coordinates sagas across internal and external systems.",
      detailMD: `
The orchestrator validates legal state transitions, selects provider routes, calls fraud and token services, writes payment attempts, emits outbox events, and decides whether to return succeeded, failed, or pending. It treats external PSP calls as unreliable and recoverable.
`,
    },
    {
      name: "Idempotency Store",
      kind: "database",
      role: "Prevents duplicate financial effects under retries.",
      detailMD: `
This store maps merchant and idempotency key to request hash, resource ID, status, and response. It should be strongly consistent and transactionally coupled with initial resource creation. It allows safe retry after client timeouts, API gateway retries, and worker restarts.
`,
    },
    {
      name: "Provider Adapter Layer",
      kind: "service",
      role: "Normalizes integrations with PSPs, card networks, wallets, and acquiring banks.",
      detailMD: `
Adapters translate internal authorize, capture, void, refund, and status operations into provider-specific APIs. They manage provider idempotency keys, response normalization, timeouts, circuit breakers, retry policy, and routing metadata.
`,
    },
    {
      name: "Token Vault",
      kind: "storage",
      role: "Stores sensitive payment credentials behind a strict PCI-DSS boundary.",
      detailMD: `
The vault holds encrypted PAN or network token material, exposes opaque tokens to the core gateway, enforces least privilege, rotates keys, and prevents raw card data from entering logs, analytics, support tools, or merchant databases.
`,
    },
    {
      name: "Fraud Service",
      kind: "service",
      role: "Scores payment risk before committing to external authorization.",
      detailMD: `
Fraud checks combine rules, velocity counters, device fingerprinting, merchant risk, historical disputes, BIN country, IP geography, and machine learning scores. The service can approve, decline, challenge, review, or route the transaction to stronger authentication.
`,
    },
    {
      name: "Double-Entry Ledger",
      kind: "database",
      role: "Provides immutable accounting truth for captures, refunds, fees, reserves, and settlements.",
      detailMD: `
Every ledger transaction must balance: total debits equal total credits for the same currency. Rows are append-only, corrections are new entries, and database constraints or posting services prevent partial ledger writes.
`,
    },
    {
      name: "Webhook and Reconciliation Workers",
      kind: "worker",
      role: "Handle asynchronous provider truth and merchant notification delivery.",
      detailMD: `
Workers process provider webhooks, retry provider operations, deliver merchant webhooks, ingest settlement files, compare external and internal records, and route poison messages to dead-letter queues with enough context for repair.
`,
    },
  ],
  deepDives: [
    {
      topic: "Idempotency and exactly-once charge semantics",
      detailMD: `
Payment systems cannot rely on clients or networks to send a request exactly once. A buyer may tap twice, a mobile app may retry after a timeout, an API gateway may retry a 502, or a worker may crash after calling the provider but before storing the response. Without idempotency, any of those cases can double-charge the customer.

The gateway requires an idempotency key for every mutating operation. The key is scoped to merchant, operation, and request fingerprint. The first request inserts a key record and creates the resource inside the same transaction. Identical retries return the stored resource or response. A retry with the same key but a different amount, currency, or payment method fails with a conflict.

Exactly-once in payments is an effect, not a single network guarantee. Internally, the ledger enforces unique source IDs so a capture or refund can post once. Externally, provider adapters send stable provider request IDs and use PSP idempotency APIs when available. When the provider result is ambiguous, the gateway marks the attempt pending and reconciles through status polling, webhooks, or settlement files instead of issuing a blind second charge.
`,
    },
    {
      topic: "Payment state machine and saga consistency",
      detailMD: `
A clear state machine prevents illegal transitions. The core path is created -> authorized -> captured -> settled. Terminal or side states include failed, canceled, refunded, partially_refunded, chargeback_open, and chargeback_lost. Authorization reserves funds, capture starts money movement, settlement confirms funds reached the acquiring or platform account, and refunds reverse part or all of a captured payment.

No real gateway can hold a distributed transaction across merchant order service, fraud service, card network, acquiring bank, ledger, and webhook delivery. Use a saga. Each step persists local state and an outbox event before calling the next dependency. If a later step fails, the system performs compensating actions: void an authorization, refund a capture, cancel fulfillment, or open a manual review.

For operations that need local atomicity, use a two-phase local pattern: prepare the state transition and outbox record in one transaction, then have a worker perform the external call, then commit the final state and ledger effects after confirmed success. This avoids losing work when a process crashes between database commit and network call.
`,
    },
    {
      topic: "Double-entry ledger and immutable accounting",
      detailMD: `
The operational payment state answers what the checkout is doing now; the ledger answers where the money is. A ledger transaction contains two or more entries and must balance by currency. For a capture, the system may debit a customer clearing account and credit merchant receivable, platform fee revenue, tax liability, and reserve accounts. For a refund, it appends reversing entries rather than editing the original capture.

Immutability matters because finance, auditors, and regulators need a history that cannot be silently rewritten. If a provider later reports a fee adjustment, chargeback, or settlement mismatch, the gateway posts an adjustment ledger transaction with a reason and source reference. Reports are derived from ledger entries, not from mutable payment status rows.

The ledger posting service should enforce uniqueness on source_type and source_id, currency balance checks, positive amounts, monotonic sequence numbers per account, and append-only permissions. Reads can be served from replicas or OLAP stores, but writes should go through one audited posting path.
`,
    },
    {
      topic: "External PSP, card network, and acquiring bank integration",
      detailMD: `
External payment rails are heterogeneous and imperfect. One PSP may support separate authorize and capture; another may only support sale. Some return synchronous declines, some rely heavily on webhooks, and some produce settlement files hours later. Network timeouts do not mean the payment failed; they mean the gateway does not yet know.

Provider adapters isolate this complexity. They map internal operations to provider APIs, maintain provider-specific idempotency keys, translate error codes into normalized decline or retry categories, and expose capabilities such as partial capture, void, refund, 3-D Secure, network token support, and settlement timing.

Routing should consider merchant configuration, currency, country, card brand, provider health, cost, approval rate, and risk. Failover is safe before authorization. After an authorization has been created at one provider, capture and refund usually need to return to the same provider reference, so routing decisions become sticky.
`,
    },
    {
      topic: "Webhooks, reconciliation, retries, and dead letters",
      detailMD: `
Provider webhooks are asynchronous, duplicated, delayed, and sometimes out of order. The gateway should verify signatures, persist the raw payload, deduplicate by provider event ID, and process state changes idempotently. A capture webhook received before an authorization webhook should either be buffered or applied through a transition rule that can tolerate missing earlier events.

Retries need bounded exponential backoff with jitter. Retry only safe operations using provider idempotency keys. Distinguish retryable failures such as timeouts, 429, and 503 from hard declines such as stolen card or insufficient funds. After the retry budget is exhausted, the message goes to a dead-letter queue with merchant, payment, provider, request ID, payload hash, and last error.

Reconciliation is the safety net. Jobs compare internal attempts and ledger entries with provider status APIs, webhook logs, chargeback feeds, and settlement reports. The job should identify missing captures, duplicate provider references, unsettled payments, fee mismatches, and ledger transactions that do not match settlement totals.
`,
    },
    {
      topic: "PCI-DSS scope reduction and fraud controls",
      detailMD: `
The safest core gateway is one that never sees raw card data. Use hosted payment fields, mobile SDK tokenization, network tokens, or a dedicated vault service so the main payment API works with opaque tokens. Mask PAN to last four digits, never store CVV, encrypt sensitive metadata, and block sensitive fields from logs and analytics.

Fraud is part of the payment decision, not an afterthought. Score before authorization using velocity, device, IP, merchant, BIN, customer age, historical disputes, amount anomalies, and card testing patterns. High-risk traffic can be challenged, blocked, routed through stronger authentication, or throttled through rate limits.

PCI and fraud design also improve reliability. By keeping tokenization and risk evaluation explicit, the orchestrator can make deterministic decisions, explain declines, and replay safe operations without exposing sensitive data or re-running non-idempotent card collection flows.
`,
    },
  ],
  scaling: [
    {
      stage: "Prototype: one region and one provider",
      detailMD: `
Start with one API service, one relational database, one PSP adapter, hosted tokenization, and a basic ledger posting service. At this scale, 100 payment TPS is achievable with simple vertical database scaling, but still require idempotency keys, unique provider request IDs, and append-only ledger rows from day one.
`,
    },
    {
      stage: "Growth: multiple workers and asynchronous webhooks",
      detailMD: `
At 1,000 payment TPS, split synchronous API traffic from webhook, retry, and reconciliation workers. Add an outbox table, event queue, dead-letter queues, fraud service, provider health checks, and merchant webhook delivery retries. Read replicas can serve dashboards and support tools.
`,
    },
    {
      stage: "Regional scale: sharded state and ledger partitions",
      detailMD: `
At 5,000 to 10,000 payment TPS in one region, partition payment state by merchant or payment intent, scale ledger posting by account shard, isolate high-volume merchants, and move raw provider payloads to object storage. Keep idempotency, payment attempt, and ledger writes for one operation in the same shard where possible.
`,
    },
    {
      stage: "Global scale: active-active API with regional rails",
      detailMD: `
At 25,000 peak payment TPS globally, route merchants to home regions, keep payment operations sticky to the region that created the provider reference, and replicate read models globally. Use regional PSP adapters and acquiring routes because payment methods, currencies, regulations, and provider performance differ by country.
`,
    },
    {
      stage: "Enterprise scale: routing optimization and finance automation",
      detailMD: `
At very large scale, add approval-rate routing, cost-aware provider selection, automated chargeback workflows, near-real-time settlement reconciliation, ledger export pipelines, merchant-level rate isolation, and data retention tiers that keep hot history queryable while archiving old immutable records.
`,
    },
  ],
  bottlenecks: [
    {
      issue: "Idempotency store contention",
      optimizationMD: `
Hot merchants can overload a single idempotency partition during retries or flash sales. Scope keys by merchant, hash partition within high-volume merchants, keep records compact, expire old keys after the safe retry window, and avoid storing large response bodies inline when object storage pointers are enough.
`,
    },
    {
      issue: "External provider latency and outages",
      optimizationMD: `
Use short internal timeouts, provider-specific circuit breakers, health-based routing, and pending states for ambiguous outcomes. Fail over only before an operation creates a provider reference; after that, use status polling and reconciliation instead of blindly repeating the operation elsewhere.
`,
    },
    {
      issue: "Ledger write throughput",
      optimizationMD: `
Ledger writes multiply payment volume because every money movement creates multiple entries. Partition by merchant or account, batch non-user-facing fee postings, keep the posting path append-only, and serve reporting from replicas or analytical projections rather than the primary ledger writer.
`,
    },
    {
      issue: "Webhook retry storms",
      optimizationMD: `
Merchant endpoints often fail during incidents. Use per-merchant delivery queues, exponential backoff with jitter, retry budgets, circuit breakers, signed replay APIs, and dead-letter queues so one merchant cannot consume the entire webhook worker fleet.
`,
    },
    {
      issue: "Fraud service false positives and latency",
      optimizationMD: `
Cache low-risk merchant configuration, precompute velocity features, bound synchronous scoring latency, and allow risk decisions such as challenge or review instead of only approve or decline. Track approval rate and dispute rate by rule version.
`,
    },
    {
      issue: "Large reconciliation scans",
      optimizationMD: `
Use provider settlement file checkpoints, partition reconciliation by provider, merchant, currency, and settlement date, and store normalized external references. Reconcile incrementally instead of scanning all historical payments every run.
`,
    },
  ],
  failureHandling: [
    {
      scenario: "Client retries after checkout timeout",
      strategyMD: `
The merchant reuses the same idempotency key. The gateway returns the already-created payment intent, authorization, capture, or refund response. If the first attempt is still pending, return pending with the same resource ID rather than creating a new attempt.
`,
    },
    {
      scenario: "Provider call times out after the bank may have authorized",
      strategyMD: `
Mark the payment attempt ambiguous, stop automatic duplicate authorization, and schedule status polling with the same provider request ID. Resolve through provider status API, webhook, or settlement reconciliation. If still unknown after the allowed window, escalate to manual review.
`,
    },
    {
      scenario: "Webhook arrives twice or out of order",
      strategyMD: `
Deduplicate by provider event ID and process transitions idempotently. If an event references an unknown provider payment, store it in a pending correlation table and retry after related events or status polling populate the provider reference.
`,
    },
    {
      scenario: "Ledger posting fails after provider capture succeeds",
      strategyMD: `
Keep the payment in a captured_pending_accounting state, block settlement payout, and retry ledger posting through the outbox. Because provider capture succeeded, do not retry capture. If ledger posting cannot complete automatically, create a finance repair task.
`,
    },
    {
      scenario: "Merchant webhook endpoint is down",
      strategyMD: `
Persist the event, retry with exponential backoff and jitter, expose webhook delivery status in the merchant dashboard, and move exhausted deliveries to a dead-letter queue. Merchants can fetch payment status through the API while webhooks are delayed.
`,
    },
    {
      scenario: "Reconciliation finds a provider settlement mismatch",
      strategyMD: `
Freeze affected payouts if necessary, create a reconciliation case, attach provider file lines and internal ledger references, and post adjustment entries only after the discrepancy is classified. Never mutate historical ledger entries to force totals to match.
`,
    },
  ],
  security: [
    {
      label: "PCI-DSS scope reduction",
      detailMD: `
Use hosted fields, mobile SDK tokenization, and a dedicated vault so raw PAN and CVV never enter the core gateway. Mask card metadata, encrypt sensitive fields, restrict vault access, and run separate logging controls for PCI systems.
`,
    },
    {
      label: "Tokenization and vaulting",
      detailMD: `
Payment method tokens should be opaque, scoped to merchant or platform policy, and revocable. Store network tokens or vault references instead of card numbers, rotate encryption keys, and keep token lookup permissions separate from payment state permissions.
`,
    },
    {
      label: "Webhook authenticity",
      detailMD: `
Verify provider and merchant webhook signatures, reject stale timestamps, deduplicate event IDs, and store payload hashes. Outbound merchant webhooks should be signed so merchants can verify they came from the gateway.
`,
    },
    {
      label: "Fraud and abuse prevention",
      detailMD: `
Rate-limit card testing, monitor high-decline merchants, detect velocity spikes, enforce merchant risk tiers, and integrate dispute feedback into risk scoring. Protect refund APIs because refund abuse directly moves money out.
`,
    },
    {
      label: "Least privilege and audit",
      detailMD: `
Separate permissions for support, finance, risk, engineering, and automated workers. High-risk actions such as manual refund, payout freeze, or ledger adjustment require strong authentication, approval workflows, and immutable audit logs.
`,
    },
    {
      label: "Data privacy",
      detailMD: `
Minimize buyer data in payment records, redact logs, apply retention rules, and isolate merchant tenants. Reporting exports should avoid exposing full payment method metadata or unnecessary personal data.
`,
    },
  ],
  tradeoffs: {
    pros: [
      "Idempotency at every mutating layer protects buyers and merchants from duplicate financial effects.",
      "The state machine plus saga model makes external uncertainty explicit and recoverable.",
      "An immutable double-entry ledger gives finance-grade auditability and reliable settlement reporting.",
      "Provider adapters isolate PSP complexity and allow routing based on health, cost, region, and approval rate.",
      "Tokenization and vaulting reduce PCI-DSS scope for most core services.",
    ],
    cons: [
      "Strong correctness adds latency, storage, and implementation complexity compared with a thin PSP proxy.",
      "Ambiguous provider outcomes require pending states, reconciliation jobs, and support tooling.",
      "A double-entry ledger is harder to build than mutable balance columns and demands strict operational discipline.",
      "Multi-provider routing becomes sticky after authorization, limiting failover options for captures and refunds.",
      "Fraud checks can reduce conversion if rules are too aggressive or scoring is slow.",
    ],
    alternativesMD: `
Alternative one is a thin PSP wrapper. It is fast to launch and relies on the PSP for idempotency, vaulting, ledger-like reports, and webhooks. It is suitable for a small merchant but weak for marketplaces, multi-provider routing, and custom finance controls.

Alternative two is a wallet or stored-value system where users preload balances and purchases move internal money first. This can reduce card authorization latency for repeat users, but it adds regulatory, custody, and ledger complexity.

Alternative three is direct acquiring integration without a third-party PSP. It can reduce cost and improve control at massive scale, but it requires deeper compliance, certification, dispute handling, and bank relationships.
`,
    whenNotToUseMD: `
Do not build a full payment gateway if the product only needs occasional low-volume checkout in one country. A hosted PSP checkout can provide compliance, fraud tools, and payment method coverage with far less engineering and operational risk. Build the gateway layer when you need multi-merchant orchestration, high volume, custom ledgering, routing control, or deep product integration.
`,
  },
  followUpQuestions: [
    {
      question: "How does the system prevent double charges when the client retries?",
      answerMD: `
Require an idempotency key on every mutating request, store the request fingerprint and first response in a strongly consistent table, and reuse stable provider request IDs. Identical retries return the original resource or pending result. Reuse with different parameters fails.
`,
    },
    {
      question: "What do you do if the provider times out?",
      answerMD: `
Treat the outcome as unknown, not failed. Mark the attempt ambiguous or pending, stop duplicate external attempts, poll the provider with the original request ID, wait for webhooks, and let reconciliation confirm the final state. Blind retry without idempotency can double-charge.
`,
    },
    {
      question: "Why is a double-entry ledger necessary?",
      answerMD: `
Payments need auditable money movement, not just status flags. Double-entry accounting ensures every debit has matching credits by currency, corrections are append-only, and finance can reconcile customer charges, merchant receivables, fees, reserves, refunds, chargebacks, and settlements.
`,
    },
    {
      question: "How would you model partial capture and partial refund?",
      answerMD: `
Keep the original payment intent amount, track captured and refunded totals, and create separate capture or refund attempts with their own idempotency keys. Ledger entries represent each money movement. State can become partially_captured or partially_refunded until the remaining amount is captured, voided, or refunded.
`,
    },
    {
      question: "How do webhooks and reconciliation differ?",
      answerMD: `
Webhooks are near-real-time provider notifications but can be duplicated, delayed, or lost. Reconciliation is the periodic source-of-truth check against provider status APIs and settlement files. A reliable gateway uses both.
`,
    },
    {
      question: "How do you reduce PCI-DSS scope?",
      answerMD: `
Collect card data through hosted fields, SDKs, network tokenization, or a dedicated vault. Core services store only opaque payment method tokens and masked metadata, block sensitive fields from logs, and tightly restrict vault access.
`,
    },
    {
      question: "Can the gateway fail over to another PSP after an authorization timeout?",
      answerMD: `
Usually not immediately. The original PSP may have authorized the card even though the gateway timed out. Failover is safe before creating a provider reference, but after an ambiguous authorization the system should query or reconcile the original PSP before trying another route.
`,
    },
  ],
  companyVariations: [
    {
      company: "Stripe",
      angleMD: `
Stripe-style interviews emphasize API semantics, PaymentIntent state modeling, idempotency, webhooks, ledger correctness, merchant developer experience, and compliance boundaries. Be ready to explain why ambiguous outcomes become pending instead of failed.
`,
    },
    {
      company: "Amazon",
      angleMD: `
Amazon interviewers often probe scale, multi-tenant isolation, DynamoDB or distributed SQL partitioning, operational alarms, reconciliation, and blast-radius control. Discuss how flash-sale traffic, provider outages, and ledger write volume are handled without affecting all merchants.
`,
    },
    {
      company: "Uber",
      angleMD: `
Uber may frame payments around trips, eats orders, regional payment methods, authorization before service, capture after completion, partial refunds, driver payouts, and operational recovery. Emphasize sagas across order, trip, payment, ledger, and payout services.
`,
    },
  ],
  relatedQuestions: [
    {
      slug: "distributed-transaction",
      note: "Payment orchestration is a practical saga and transactional outbox problem.",
    },
    {
      slug: "api-gateway",
      note: "Merchant-facing payment APIs need authentication, rate limits, versioning, and idempotency enforcement.",
    },
    {
      slug: "kafka",
      note: "Webhooks, outbox events, reconciliation jobs, and ledger projections often flow through durable event streams.",
    },
    {
      slug: "distributed-queue",
      note: "Provider retries, webhook deliveries, and dead-letter handling depend on reliable queues.",
    },
    {
      slug: "rate-limiter",
      note: "Payment systems must protect against card testing, retry storms, and abusive refund or checkout traffic.",
    },
  ],
  interviewTips: {
    commonMistakes: [
      "Calling the PSP directly on every retry without an idempotency key.",
      "Treating provider timeout as a definitive failure.",
      "Using mutable balance columns instead of an immutable double-entry ledger.",
      "Ignoring webhook replay, out-of-order events, and settlement reconciliation.",
      "Letting raw card data flow through ordinary application services or logs.",
      "Assuming a distributed transaction is possible across banks, PSPs, and internal services.",
    ],
    redFlags: [
      "No state machine for created, authorized, captured, settled, refunded, and failed.",
      "No explanation of how duplicate charges are prevented.",
      "No ledger or audit trail for money movement.",
      "No plan for ambiguous external outcomes.",
      "No PCI-DSS or tokenization discussion.",
      "No retry, backoff, dead-letter, or reconciliation strategy.",
    ],
    expectations: [
      "State concrete volume assumptions for payment TPS, ledger writes, webhooks, and storage.",
      "Separate synchronous checkout from asynchronous webhooks, retries, and reconciliation.",
      "Use idempotency keys and provider request IDs at every mutating boundary.",
      "Model the payment lifecycle and legal transitions explicitly.",
      "Explain double-entry accounting and why ledger entries are append-only.",
      "Discuss PSP integration, fraud checks, PCI scope reduction, and operational repair workflows.",
    ],
    communicationMD: `
Lead with correctness before scale. Draw the state machine and synchronous authorization path, then add idempotency, fraud, token vault, provider adapters, ledger, webhooks, and reconciliation. When discussing tradeoffs, emphasize that payment systems should prefer pending and recoverable states over ambiguous duplicate money movement.
`,
  },
  revisionNotesMD: `
- Payment lifecycle: created -> authorized -> captured -> settled, with refunded and failed as terminal or side outcomes.
- Idempotency keys are mandatory for create, authorize, capture, and refund. Store request fingerprints and first responses; reject mismatched reuse.
- Exactly-once charge semantics come from layered controls: gateway idempotency, provider idempotency keys, unique ledger source IDs, pending states for ambiguity, and reconciliation.
- A PSP timeout is unknown, not failed. Poll, wait for webhook, or reconcile before retrying externally.
- The ledger is append-only and double-entry. Every money movement balances debits and credits by currency.
- Webhooks are untrusted operational hints until verified, deduplicated, and reconciled.
- Reconciliation compares provider status, settlement files, payment attempts, and ledger entries to find missing or mismatched money movement.
- PCI-DSS scope is reduced through hosted fields, tokenization, vaulting, encryption, masking, and strict logging controls.
- Fraud checks should happen before authorization and should consider velocity, device, merchant, buyer, amount, geography, and dispute history.
- At 100M attempts per day, plan for about 1,160 average payment TPS, about 11,600 peak TPS, and tens of thousands of ledger writes per second at peak.
`,
  flashcards: [
    {
      front: "What is the role of an idempotency key in payments?",
      back: "It lets the gateway return the same result for identical retries instead of creating another charge, capture, or refund.",
    },
    {
      front: "Why is a provider timeout not the same as a failed payment?",
      back: "The provider or bank may have completed the operation even though the gateway lost the response, so the outcome is unknown until webhook, polling, or reconciliation resolves it.",
    },
    {
      front: "What is the core payment state machine?",
      back: "created -> authorized -> captured -> settled, with refunded, partially_refunded, canceled, failed, and chargeback states around that path.",
    },
    {
      front: "Why use a double-entry ledger?",
      back: "It gives immutable, balanced, auditable accounting for captures, refunds, fees, reserves, chargebacks, and settlements.",
    },
    {
      front: "How are duplicate webhooks handled?",
      back: "Verify signatures, store provider event IDs uniquely, and process state transitions idempotently so replays are acknowledged but not reapplied.",
    },
    {
      front: "What reduces PCI-DSS scope?",
      back: "Hosted fields, SDK tokenization, network tokens, a dedicated vault, masking, encryption, and preventing raw card data from entering core services or logs.",
    },
    {
      front: "When is PSP failover safe?",
      back: "Before a provider reference is created. After an ambiguous authorization, reconcile the original provider before trying another route.",
    },
    {
      front: "What belongs in a dead-letter message?",
      back: "Merchant ID, payment ID, provider, operation, provider request ID, payload hash, retry count, and last error so the issue can be repaired.",
    },
  ],
  quiz: [
    {
      question: "What should the gateway do when a client retries the same capture request with the same idempotency key?",
      options: ["Create a new capture", "Return the original capture result or pending state", "Ignore the request without response", "Route the capture to a different PSP"],
      answerIndex: 1,
      explanationMD: `
The idempotency key maps the retry to the original operation. Creating a new capture can double-charge, and routing to another PSP can make ambiguity worse.
`,
    },
    {
      question: "A PSP authorization call times out after the request was sent. What is the safest internal state?",
      options: ["failed", "ambiguous or pending", "refunded", "settled"],
      answerIndex: 1,
      explanationMD: `
Timeout means the gateway does not know whether the provider authorized the payment. Mark it pending or ambiguous and resolve through polling, webhook, or reconciliation.
`,
    },
    {
      question: "Which design best supports auditable accounting?",
      options: ["A mutable balance field on the merchant row", "A daily CSV export only", "An immutable double-entry ledger", "Only PSP dashboard screenshots"],
      answerIndex: 2,
      explanationMD: `
An immutable double-entry ledger records balanced debits and credits for every money movement and preserves correction history.
`,
    },
    {
      question: "Why should raw card data avoid the core payment services?",
      options: ["It makes API responses shorter", "It reduces PCI-DSS scope and limits sensitive data exposure", "It removes the need for refunds", "It guarantees provider uptime"],
      answerIndex: 1,
      explanationMD: `
Tokenization and vaulting keep PAN and CVV out of ordinary services, logs, analytics, and merchant systems, reducing compliance scope and breach impact.
`,
    },
    {
      question: "Which mechanism handles provider webhooks that are duplicated?",
      options: ["Provider event ID deduplication", "Random retry delays only", "Deleting payment attempts", "Changing the payment amount"],
      answerIndex: 0,
      explanationMD: `
Provider event IDs should be unique per provider event. Store them with a uniqueness constraint and process each event effect once.
`,
    },
    {
      question: "At 100M payment attempts per day, what is the approximate average payment TPS?",
      options: ["116 attempts per second", "1,160 attempts per second", "11,600 attempts per second", "116,000 attempts per second"],
      answerIndex: 1,
      explanationMD: `
100M divided by 86,400 seconds is about 1,157 attempts per second, rounded to 1,160.
`,
    },
    {
      question: "What should happen after retries for a webhook delivery are exhausted?",
      options: ["Drop the event silently", "Move it to a dead-letter queue with repair context", "Delete the payment intent", "Retry every millisecond forever"],
      answerIndex: 1,
      explanationMD: `
Dead-letter queues preserve failed messages with enough context for debugging and manual repair while preventing retry storms.
`,
    },
  ],
  cheatSheetMD: `
**Goal**: provide a safe merchant API for authorizing, capturing, refunding, settling, and reconciling payments across unreliable external payment rails.

**State machine**: created -> authorized -> captured -> settled. Side states include failed, canceled, refunded, partially_refunded, chargeback_open, and ambiguous.

**Idempotency**: every mutating operation requires a merchant-scoped idempotency key. Store request fingerprint, resource ID, status, and response. Replays return the same result; mismatched reuse fails.

**Provider calls**: send stable provider request IDs, use PSP idempotency when available, classify errors as hard decline, retryable, or ambiguous, and never blindly retry unknown outcomes.

**Ledger**: append-only double-entry accounting. Captures, refunds, fees, reserves, chargebacks, and settlements create balanced entries. Corrections are new entries, never edits.

**Capacity**: 100M attempts per day is about 1,160 average payment TPS and about 11,600 peak TPS at 10x. Ledger writes can reach 33,000 to 45,000 entries per second at peak.

**Async work**: provider webhooks, merchant webhooks, retries, dead letters, settlement ingestion, and reconciliation run behind queues and workers.

**Reconciliation**: compare provider status, webhook logs, settlement files, payment attempts, and ledger entries. Use it to resolve missing webhooks, duplicate references, and fee or settlement mismatches.

**Compliance and fraud**: use hosted fields, tokenization, vaulting, encryption, masking, least privilege, webhook signatures, velocity checks, device signals, merchant risk tiers, and card testing protection.
`,
  references: [
    {
      title: "Designing Data-Intensive Applications",
      kind: "Book",
      author: "Martin Kleppmann",
    },
    {
      title: "PCI DSS Requirements and Security Assessment Procedures",
      kind: "Docs",
      url: "https://www.pcisecuritystandards.org/document_library",
      author: "PCI Security Standards Council",
    },
    {
      title: "Stripe API Idempotent Requests",
      kind: "Docs",
      url: "https://stripe.com/docs/idempotency",
      author: "Stripe",
    },
    {
      title: "Stripe Payment Intents API",
      kind: "Docs",
      url: "https://stripe.com/docs/payments/payment-intents",
      author: "Stripe",
    },
    {
      title: "Payment Card Industry Data Security Standard",
      kind: "Docs",
      url: "https://www.pcisecuritystandards.org/standards/",
      author: "PCI Security Standards Council",
    },
  ],
};
