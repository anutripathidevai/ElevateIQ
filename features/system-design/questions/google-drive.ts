import type { SDQuestionContent } from "../types";

export const googleDriveContent: SDQuestionContent = {
  slug: "google-drive",
  statementMD: `
Design Google Drive, a cloud storage and collaboration platform where users can create folders, upload files, edit documents together, share resources with fine-grained permissions, search content, and keep desktop or mobile clients synchronized across devices.

At interview scale, assume billions of files and folders, hundreds of millions of active users, massive metadata QPS, petabytes of blob content, and a mix of workloads: small metadata reads, large uploads and downloads, real-time collaborative document edits, search indexing, permission checks, and change feeds for sync clients.

The core challenge is not simply storing bytes. A strong design separates metadata from blob storage, treats permissions and inherited ACLs as first-class data, supports versioned and deduplicated content, keeps collaboration convergent, and guarantees that sharing or revocation decisions are enforced before content is served.
`,
  businessUseCaseMD: `
Google Drive lets individuals and organizations store files safely, collaborate without emailing attachments, recover previous versions, and access content from any device. It becomes the source of truth for documents, spreadsheets, presentations, PDFs, images, and shared team folders.

For businesses, Drive also provides governance: enterprise permissions, audit logs, retention, data loss prevention, eDiscovery, quota controls, and secure sharing with customers or partners. The product succeeds when storage, collaboration, sync, search, and access control feel like one reliable system.
`,
  functionalRequirements: [
    "Create, rename, move, delete, restore, and list files and folders in a hierarchical namespace.",
    "Upload and download file content with chunking, resumability, deduplication, checksums, and version history.",
    "Create and edit collaborative documents with real-time multi-user convergence.",
    "Share files and folders with users, groups, domains, and links using roles such as viewer, commenter, editor, and owner.",
    "Apply inherited folder permissions while allowing safe overrides and revocation.",
    "Expose a change feed so desktop, mobile, and offline clients can sync deltas from a cursor.",
    "Search by file name, metadata, owner, permissions, and extracted file content.",
    "Track storage quota, retention, trash lifecycle, and per-user or per-organization usage.",
  ],
  nonFunctionalRequirements: [
    {
      label: "Latency",
      detailMD: `
Metadata reads such as listing a folder or opening a file should complete in under 100ms p99 within a region. Permission checks must be in the same latency budget. Collaborative edit operations should be acknowledged in under 150ms p99 so typing feels live. Large downloads can be bandwidth-bound, but time to first byte should be low through CDN and signed origin URLs.
`,
    },
    {
      label: "Availability",
      detailMD: `
Users expect existing files to remain readable even when search, notifications, or collaboration features degrade. Target at least 99.99 percent availability for metadata and content access, and isolate optional systems so indexing lag or notification failure does not block uploads, downloads, or permission enforcement.
`,
    },
    {
      label: "Metadata scalability",
      detailMD: `
The system must handle billions of nodes and very high QPS for folder listing, permission checks, recent files, sync cursors, and search lookups. Metadata services should shard by stable identifiers rather than full path strings, and should avoid expensive recursive operations on hot folders.
`,
    },
    {
      label: "Durability and versioning",
      detailMD: `
Uploaded content and metadata changes must be durable before the client sees success. File content should use checksums, multi-zone replication, immutable blob chunks, version manifests, and background repair. Metadata should retain enough history for restore, audit, conflict resolution, and legal retention.
`,
    },
    {
      label: "Permission correctness",
      detailMD: `
The design should prefer temporary denial over accidental over-sharing. New grants should become visible quickly, but revocations and ownership changes need bounded propagation and cache invalidation so a stale ACL cache cannot serve private content after access was removed.
`,
    },
    {
      label: "Collaboration convergence",
      detailMD: `
Multiple users editing the same document concurrently must converge to the same state. The collaboration layer needs ordering, conflict resolution, session recovery, idempotent operation replay, and periodic snapshots so clients can rejoin without downloading an unbounded operation log.
`,
    },
    {
      label: "Cost and quota efficiency",
      detailMD: `
Storage cost dominates at petabyte scale. Deduplicate chunks, compress where useful, tier cold versions, avoid indexing unnecessary binary data, and maintain quota ledgers that are accurate enough for enforcement without requiring synchronous global accounting on every upload byte.
`,
    },
  ],
  capacityEstimation: {
    assumptionsMD: `
Assume 1B registered users, 300M daily active users, 20B file and folder metadata nodes, 1B metadata mutations per day, and 30B metadata reads per day from web, mobile, desktop sync, and collaboration surfaces.

Assume 50M new file versions per day with an average logical size of 8 MB. Deduplication and compression reduce physical storage by about 35 percent. Assume 1B file downloads per day with an average served size of 3 MB, most of which should come from CDN or regional blob serving. Peak traffic is 10x average for metadata and 8x average for content transfer.
`,
    metrics: [
      {
        label: "Metadata nodes",
        value: "20B files and folders",
        note: "Includes folders, binary files, native docs, shortcuts, and trash entries",
      },
      {
        label: "Metadata storage",
        value: "40 TB raw",
        note: "20B nodes times 2 KB average metadata record before indexes and replicas",
      },
      {
        label: "Replicated metadata",
        value: "180 to 240 TB",
        note: "Indexes, ACL materialization, versions, change history, and 3x to 4x replication",
      },
      {
        label: "Average metadata read QPS",
        value: "347,000 reads per second",
        note: "30B reads per day divided by 86,400 seconds",
      },
      {
        label: "Peak metadata read QPS",
        value: "3.5M reads per second",
        note: "10x peak for login storms, workday starts, and sync catch-up",
      },
      {
        label: "Average metadata write QPS",
        value: "11,600 writes per second",
        note: "1B metadata mutations per day divided by 86,400 seconds",
      },
      {
        label: "New logical content",
        value: "400 TB per day",
        note: "50M new versions times 8 MB average logical size",
      },
      {
        label: "New physical content",
        value: "260 TB per day",
        note: "35 percent savings from chunk deduplication, compression, and sparse versions",
      },
      {
        label: "Download bandwidth",
        value: "35 GB per second average",
        note: "1B downloads per day times 3 MB divided by 86,400 seconds",
      },
      {
        label: "Collaboration operations",
        value: "200,000 ops per second peak",
        note: "1M peak concurrent editors averaging one operation every five seconds",
      },
      {
        label: "Search index",
        value: "100 to 150 TB",
        note: "Metadata, permissions, extracted text, thumbnails, and inverted indexes",
      },
    ],
    calculationsMD: `
- Metadata records: 20B nodes times 2 KB is 40 TB raw. With secondary indexes, ACL-derived fields, change history, and 3x to 4x replication, plan for roughly 180 to 240 TB.
- Metadata reads: 30B reads per day divided by 86,400 seconds is about 347,000 reads per second on average. A 10x peak means about 3.5M reads per second.
- Metadata writes: 1B mutations per day divided by 86,400 seconds is about 11,600 writes per second on average. A 10x peak means about 116,000 writes per second.
- Content ingest: 50M new versions per day times 8 MB is 400M MB per day, or about 400 TB logical. With 35 percent savings, physical ingest is about 260 TB per day before replication.
- Download bandwidth: 1B downloads per day times 3 MB is 3B MB per day, about 3 PB per day. Dividing by 86,400 seconds gives about 35 GB per second average. An 8x peak is about 280 GB per second, mostly handled by CDN and regional blob stores.
- Collaboration: 1M concurrent editors at one operation every five seconds produces 200,000 operations per second. The operations are small, but ordering, fanout, and persistence dominate.
- Change feed: if each metadata mutation and committed collaboration batch emits one event, the feed must absorb more than 1B events per day before retries and backfills.
`,
  },
  apiDesign: {
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/nodes",
        descriptionMD: `
Creates a folder, shortcut, native document, or upload placeholder under a parent folder. Binary file content is uploaded separately so metadata and blob transfer can scale independently.
`,
        request: `
{
  "parentId": "folder_123",
  "name": "Quarterly Plan",
  "nodeType": "document",
  "mimeType": "application/vnd.google-apps.document",
  "clientMutationId": "cm_9f21"
}
`,
        response: `
{
  "nodeId": "file_456",
  "parentId": "folder_123",
  "name": "Quarterly Plan",
  "nodeType": "document",
  "version": 1,
  "createdAt": "2026-07-26T07:10:00Z"
}
`,
        statusCodes: [
          { code: 201, meaning: "Node created" },
          { code: 400, meaning: "Invalid name, parent, or node type" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Caller cannot create under this parent" },
          { code: 409, meaning: "Duplicate client mutation or conflicting name policy" },
          { code: 429, meaning: "Rate limit or quota guard exceeded" },
        ],
      },
      {
        method: "PUT",
        path: "/api/v1/files/{fileId}/content",
        descriptionMD: `
Commits a new binary file version after the client uploads chunks to signed upload URLs. The commit validates checksums, quota, parent permissions, and idempotency.
`,
        request: `
{
  "uploadSessionId": "up_789",
  "chunkManifestId": "manifest_abc",
  "logicalSizeBytes": 8388608,
  "sha256": "a4f1c2...",
  "clientMutationId": "cm_9f22"
}
`,
        response: `
{
  "fileId": "file_456",
  "versionId": "ver_002",
  "logicalSizeBytes": 8388608,
  "deduplicatedBytes": 3145728,
  "quotaBytesCharged": 5242880,
  "committedAt": "2026-07-26T07:12:00Z"
}
`,
        statusCodes: [
          { code: 200, meaning: "Version committed" },
          { code: 400, meaning: "Invalid manifest or checksum mismatch" },
          { code: 403, meaning: "Caller cannot edit this file" },
          { code: 404, meaning: "File or upload session not found" },
          { code: 409, meaning: "Stale base version or duplicate mutation" },
          { code: 413, meaning: "File exceeds product limit" },
          { code: 429, meaning: "Quota exceeded or throttled" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/files/{fileId}/content",
        descriptionMD: `
Returns metadata plus a short-lived signed download URL, or streams the content through the service for small files. The service must authorize the caller before issuing any content URL.
`,
        response: `
{
  "fileId": "file_456",
  "versionId": "ver_002",
  "downloadUrl": "https://download.example.com/signed/ver_002",
  "expiresAt": "2026-07-26T07:22:00Z",
  "etag": "v2-acl17"
}
`,
        statusCodes: [
          { code: 200, meaning: "Authorized download information returned" },
          { code: 304, meaning: "Client cache is still valid" },
          { code: 401, meaning: "Authentication required for private file" },
          { code: 403, meaning: "Caller lacks view permission" },
          { code: 404, meaning: "File not found or hidden by permissions" },
          { code: 410, meaning: "Version deleted or expired by retention policy" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/nodes/{nodeId}/permissions",
        descriptionMD: `
Shares a file or folder with a principal or link policy. Folder grants can be inherited by descendants, but the write must be represented as an ACL version so readers can detect stale authorization data.
`,
        request: `
{
  "principalType": "user",
  "principalId": "user_999",
  "role": "commenter",
  "inheritance": "propagate",
  "message": "Please review"
}
`,
        response: `
{
  "permissionId": "perm_321",
  "nodeId": "file_456",
  "role": "commenter",
  "aclVersion": 18,
  "createdAt": "2026-07-26T07:13:00Z"
}
`,
        statusCodes: [
          { code: 201, meaning: "Permission grant created" },
          { code: 400, meaning: "Invalid role, principal, or inheritance mode" },
          { code: 403, meaning: "Caller cannot share this resource" },
          { code: 404, meaning: "Node not found" },
          { code: 409, meaning: "Conflicting ownership or policy rule" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/changes",
        descriptionMD: `
Returns ordered changes visible to the caller after a cursor. Sync clients use this endpoint to update local state, recover from offline periods, and learn about permission or trash changes.
`,
        response: `
{
  "nextCursor": "cursor_2049",
  "hasMore": true,
  "changes": [
    {
      "sequence": 2048,
      "nodeId": "file_456",
      "changeType": "content_updated",
      "removed": false,
      "modifiedAt": "2026-07-26T07:12:00Z"
    }
  ]
}
`,
        statusCodes: [
          { code: 200, meaning: "Changes returned" },
          { code: 400, meaning: "Cursor is malformed or too old" },
          { code: 401, meaning: "Authentication required" },
          { code: 410, meaning: "Cursor expired and full resync is required" },
          { code: 429, meaning: "Sync client is polling too aggressively" },
        ],
      },
      {
        method: "PATCH",
        path: "/api/v1/docs/{fileId}/operations",
        descriptionMD: `
Submits a batch of collaborative document operations based on a known revision. The collaboration service transforms or merges concurrent operations and returns the committed revision.
`,
        request: `
{
  "baseRevision": 1042,
  "clientId": "client_a",
  "operations": [
    { "type": "insert_text", "position": 188, "text": "Launch plan" }
  ]
}
`,
        response: `
{
  "fileId": "file_456",
  "committedRevision": 1043,
  "transformedOperations": [
    { "type": "insert_text", "position": 192, "text": "Launch plan" }
  ]
}
`,
        statusCodes: [
          { code: 200, meaning: "Operations committed" },
          { code: 400, meaning: "Invalid operation batch" },
          { code: 403, meaning: "Caller cannot edit the document" },
          { code: 409, meaning: "Base revision is too old for incremental transform" },
          { code: 429, meaning: "Document or client is rate limited" },
        ],
      },
    ],
    notesMD: `
Separate metadata APIs from content transfer. Metadata endpoints return stable IDs, versions, ACL versions, cursors, and signed content URLs. Blob uploads and downloads should flow through resumable sessions, CDN, and object storage rather than through one monolithic API service. Collaboration APIs are revision-based so clients can retry safely and recover after disconnects.
`,
  },
  databaseDesign: {
    schemaMD: `
The metadata model is a graph with a dominant tree shape: each node has a stable ID, usually one parent, a name, a type, ownership, timestamps, and a current version pointer. Stable IDs avoid rewriting descendants when folders move or names change.

Permissions are separate from file versions because sharing changes should not rewrite content. Blob data is immutable and addressed by chunk or content hash, while file versions reference manifests that point to those chunks.
`,
    tables: [
      {
        name: "drive_nodes",
        columns: [
          { name: "node_id", type: "uuid", note: "Primary key for files, folders, documents, shortcuts, and trash entries" },
          { name: "owner_id", type: "uuid", note: "Owning user, shared drive, or organization" },
          { name: "parent_id", type: "uuid nullable", note: "Folder parent; null for roots and shared drive roots" },
          { name: "name", type: "varchar(1024)", note: "Display name within the parent namespace" },
          { name: "node_type", type: "varchar(32)", note: "Folder, binary_file, native_doc, shortcut, or shared_drive" },
          { name: "mime_type", type: "varchar(255)", note: "Content type or native document type" },
          { name: "current_version_id", type: "uuid nullable", note: "Head file version for binary content or native document snapshot" },
          { name: "acl_version", type: "bigint", note: "Monotonic value used to invalidate stale permission decisions" },
          { name: "created_at", type: "timestamp", note: "Creation time" },
          { name: "modified_at", type: "timestamp", note: "Metadata or content modification time" },
          { name: "trashed_at", type: "timestamp nullable", note: "Soft-delete marker before retention cleanup" },
        ],
      },
      {
        name: "permissions",
        columns: [
          { name: "permission_id", type: "uuid", note: "Primary key for an explicit grant" },
          { name: "resource_node_id", type: "uuid", note: "File or folder where the grant is attached" },
          { name: "principal_type", type: "varchar(32)", note: "User, group, domain, organization, public_link, or service_account" },
          { name: "principal_id", type: "varchar(255)", note: "Principal identifier or link token hash" },
          { name: "role", type: "varchar(32)", note: "Viewer, commenter, editor, organizer, or owner" },
          { name: "inheritance_mode", type: "varchar(32)", note: "This node only, inherit to descendants, blocked, or owner-only" },
          { name: "expires_at", type: "timestamp nullable", note: "Optional time-bound access grant" },
          { name: "created_by", type: "uuid", note: "Actor that granted access" },
          { name: "revoked_at", type: "timestamp nullable", note: "Soft revoke for audit and cache invalidation" },
        ],
      },
      {
        name: "file_versions",
        columns: [
          { name: "version_id", type: "uuid", note: "Immutable version identifier" },
          { name: "node_id", type: "uuid", note: "File or native document node" },
          { name: "base_version_id", type: "uuid nullable", note: "Previous version for diff and conflict handling" },
          { name: "chunk_manifest_id", type: "uuid", note: "Manifest of ordered blob chunks" },
          { name: "content_hash", type: "char(64)", note: "Hash used for deduplication and integrity" },
          { name: "logical_size_bytes", type: "bigint", note: "Size charged before dedup policy adjustments" },
          { name: "physical_size_bytes", type: "bigint", note: "New bytes actually stored after deduplication" },
          { name: "created_by", type: "uuid", note: "Actor that created the version" },
          { name: "created_at", type: "timestamp", note: "Version commit time" },
          { name: "retention_class", type: "varchar(32)", note: "Active, historical, legal_hold, archived, or expired" },
        ],
      },
      {
        name: "storage_accounts",
        columns: [
          { name: "account_id", type: "uuid", note: "User, shared drive, or organization quota bucket" },
          { name: "quota_bytes", type: "bigint", note: "Allowed logical or billed storage" },
          { name: "used_bytes", type: "bigint", note: "Eventually consistent charged usage" },
          { name: "reserved_bytes", type: "bigint", note: "Bytes reserved by in-flight uploads" },
          { name: "plan", type: "varchar(64)", note: "Free, paid, enterprise, education, or internal" },
          { name: "updated_at", type: "timestamp", note: "Last quota ledger update" },
        ],
      },
      {
        name: "change_log",
        columns: [
          { name: "shard_id", type: "varchar(64)", note: "Change feed partition, often derived from owner or drive ID" },
          { name: "sequence_number", type: "bigint", note: "Monotonic sequence within the shard" },
          { name: "actor_id", type: "uuid", note: "User or service that caused the change" },
          { name: "node_id", type: "uuid", note: "Affected file or folder" },
          { name: "change_type", type: "varchar(64)", note: "Created, moved, renamed, permission_changed, content_updated, trashed, or deleted" },
          { name: "acl_version", type: "bigint", note: "Permission version visible with this change" },
          { name: "payload_pointer", type: "varchar(255)", note: "Pointer to larger event payload if needed" },
          { name: "created_at", type: "timestamp", note: "Event time used for sync and auditing" },
        ],
      },
    ],
    indexesMD: `
- **drive_nodes.node_id** is the primary lookup key for open, update, move, and permission checks.
- **drive_nodes.parent_id, name** supports folder listing and uniqueness rules inside one folder.
- **drive_nodes.owner_id, modified_at** supports recent files and owner-scoped sync.
- **permissions.resource_node_id** supports loading explicit grants for a file or folder.
- **permissions.principal_id, role** supports shared-with-me and enterprise access reviews.
- **file_versions.node_id, created_at** supports version history and restore.
- **change_log.shard_id, sequence_number** supports cursor-based sync with ordered pagination.
- Search should use a separate inverted index because metadata stores are not optimized for full-text ranking.
`,
    relationshipsMD: `
Each node belongs to an owner or shared drive and usually has one parent. Folder inheritance is logical: descendants do not need a copied ACL row for every inherited grant. Permission evaluation combines explicit grants, inherited ancestors, organization policy, and link policy. File versions reference immutable blob manifests, and change_log events reference nodes so clients can sync without scanning the metadata tables.
`,
    noSqlAlternativesMD: `
A production design can use a globally distributed SQL database such as Spanner or FoundationDB for metadata transactions, because moves, shares, and version commits need conditional updates and consistent indexes. Blob chunks belong in object storage such as Colossus, S3, Azure Blob Storage, or a custom distributed file system with replication and erasure coding.

The change feed can live in Bigtable, Kafka, Pulsar, or a log-structured store partitioned by owner or shared drive. The search index should be external, such as Elasticsearch, OpenSearch, Solr, or a custom inverted-index service. ACL-derived fields may be denormalized into the search index, but every content access must still be authorized against a fresh enough permission decision.
`,
  },
  architecture: {
    width: 960,
    height: 560,
    nodes: [
      { id: "client", label: "Clients", kind: "client", x: 70, y: 250, sublabel: "Web, mobile, desktop sync" },
      { id: "cdn", label: "CDN", kind: "cdn", x: 230, y: 110, sublabel: "Downloads, thumbnails" },
      { id: "gateway", label: "API Gateway", kind: "gateway", x: 230, y: 290, sublabel: "Auth, routing, limits" },
      { id: "metadata-service", label: "Metadata Service", kind: "service", x: 430, y: 180, sublabel: "Files, folders, moves" },
      { id: "permission-service", label: "Permission Service", kind: "service", x: 430, y: 340, sublabel: "ACLs, inheritance" },
      { id: "blob-service", label: "Blob Service", kind: "service", x: 430, y: 60, sublabel: "Uploads, versions" },
      { id: "collaboration-service", label: "Collaboration Service", kind: "service", x: 430, y: 470, sublabel: "OT or CRDT sessions" },
      { id: "metadata-store", label: "Metadata Store", kind: "database", x: 650, y: 250, sublabel: "Spanner, FoundationDB" },
      { id: "blob-store", label: "Blob Store", kind: "storage", x: 650, y: 70, sublabel: "Chunks, manifests" },
      { id: "change-feed", label: "Change Feed", kind: "queue", x: 820, y: 360, sublabel: "Sync events" },
      { id: "search-index", label: "Search Index", kind: "search", x: 820, y: 160, sublabel: "Metadata and content" },
    ],
    edges: [
      { from: "client", to: "cdn", label: "download cached content" },
      { from: "client", to: "gateway", label: "metadata, sharing, sync" },
      { from: "cdn", to: "blob-service", label: "origin miss" },
      { from: "gateway", to: "metadata-service", label: "file and folder APIs" },
      { from: "gateway", to: "blob-service", label: "upload and download control" },
      { from: "gateway", to: "collaboration-service", label: "edit sessions" },
      { from: "metadata-service", to: "permission-service", label: "authorize action" },
      { from: "permission-service", to: "metadata-store", label: "read ACL graph" },
      { from: "metadata-service", to: "metadata-store", label: "metadata transactions" },
      { from: "blob-service", to: "blob-store", label: "chunks and manifests" },
      { from: "blob-service", to: "metadata-store", label: "commit version" },
      { from: "metadata-service", to: "change-feed", label: "metadata changes", dashed: true },
      { from: "collaboration-service", to: "change-feed", label: "doc snapshots", dashed: true },
      { from: "change-feed", to: "search-index", label: "index updates", dashed: true },
      { from: "metadata-service", to: "search-index", label: "search query" },
    ],
    captionMD: `
Metadata, permission checks, content blobs, collaboration sessions, search, and sync events are separate planes. The critical safety invariant is that every content URL or edit operation is authorized before access is granted.
`,
  },
  architectureNotesMD: `
The write path starts in the gateway, which authenticates the caller and routes metadata, content, sharing, and collaboration requests to specialized services. The Metadata Service owns file and folder state, the Permission Service owns ACL evaluation, and the Blob Service owns resumable upload, deduplication, version manifests, and download URLs.

The Blob Store is optimized for large immutable chunks and high-throughput transfer, while the Metadata Store is optimized for small strongly consistent records. The Change Feed decouples sync clients, notifications, audit, search indexing, and offline recovery from the user-facing transaction. Search is a derived system, not the source of truth for access control.

Real-time documents use the Collaboration Service because their workload is different from binary uploads. It maintains active sessions, orders or merges operations, creates snapshots, and emits committed changes back to metadata and sync systems.
`,
  requestFlow: [
    {
      title: "Client authenticates and opens a folder",
      detailMD: `
The client sends a folder listing request through the API Gateway. The gateway verifies identity, applies rate limits, and forwards the request to the Metadata Service with caller identity, device state, and requested pagination.
`,
    },
    {
      title: "Metadata service evaluates permissions",
      detailMD: `
The Metadata Service loads the target folder metadata and asks the Permission Service whether the caller can view it. The Permission Service combines explicit ACLs, inherited parent grants, group membership, link policy, domain policy, and the folder ACL version.
`,
    },
    {
      title: "Folder listing is returned",
      detailMD: `
The Metadata Service reads children by parent_id, filters entries the caller cannot see, and returns stable IDs, names, types, modified times, version IDs, and ACL versions. Large folders use pagination and may require specialized indexes or materialized listings.
`,
    },
    {
      title: "Client uploads file chunks",
      detailMD: `
For binary content, the client creates an upload session and uploads chunks to signed URLs. The Blob Service validates chunk checksums, checks deduplication indexes, stores missing chunks, and tracks uploaded ranges so interrupted clients can resume.
`,
    },
    {
      title: "Version commit updates metadata and quota",
      detailMD: `
After all chunks arrive, the Blob Service commits a version manifest and asks the Metadata Service to atomically update the file head, modified time, version history, and quota reservation. The commit is idempotent by client mutation ID.
`,
    },
    {
      title: "Change feed and search are updated asynchronously",
      detailMD: `
The metadata transaction emits a change event. Sync clients later read it from the cursor endpoint, notification workers may alert collaborators, and indexers extract metadata or content text into the search index. Upload success does not wait for search indexing.
`,
    },
    {
      title: "Sharing change bumps ACL version",
      detailMD: `
When a user shares or revokes access, the Permission Service records the grant or revoke and increments the relevant ACL version. Caches and derived indexes use that version to detect stale permission decisions.
`,
    },
    {
      title: "Collaborative edits converge",
      detailMD: `
For a native document, clients send edit operations to the Collaboration Service. It orders, transforms, or merges concurrent operations, persists the operation log, periodically writes snapshots, and emits committed document changes to the Change Feed.
`,
    },
  ],
  coreComponents: [
    {
      name: "Metadata Service",
      kind: "service",
      role: "Owns file and folder hierarchy, node metadata, moves, trash, and version pointers.",
      detailMD: `
This service handles create, rename, move, list, restore, and version-head updates. It should use stable node IDs instead of path-based keys, apply idempotency for client retries, and keep transactions small enough to avoid recursive folder rewrites.
`,
    },
    {
      name: "Permission Service",
      kind: "service",
      role: "Evaluates sharing policies and inherited ACLs before metadata, content, or collaboration access.",
      detailMD: `
The service resolves direct grants, folder inheritance, group membership, link settings, organization policy, ownership, and role hierarchy. It maintains ACL versions so stale caches can be rejected, and it treats revocation as a high-priority invalidation path.
`,
    },
    {
      name: "Blob Service",
      kind: "service",
      role: "Manages resumable uploads, downloads, chunk manifests, deduplication, checksums, and immutable versions.",
      detailMD: `
The Blob Service issues signed upload and download URLs, validates chunk integrity, stores missing chunks, commits version manifests, and enforces file-size limits. It should not decide authorization alone; it receives an authorization decision from metadata and permissions.
`,
    },
    {
      name: "Collaboration Service",
      kind: "service",
      role: "Keeps live document editing sessions convergent and low-latency.",
      detailMD: `
This service stores operation logs, assigns revisions, performs Operational Transform or CRDT merging, broadcasts operations to active collaborators, and writes periodic snapshots. It isolates high-frequency edit operations from the general metadata path.
`,
    },
    {
      name: "Change Feed",
      kind: "queue",
      role: "Provides ordered deltas for sync clients, notifications, audit, and derived indexes.",
      detailMD: `
The feed is partitioned by owner, shared drive, or another stable scope. It must provide durable cursors, replay, compaction rules, and a clear full-resync path when a client cursor is too old.
`,
    },
    {
      name: "Search Index",
      kind: "search",
      role: "Enables name, metadata, and content search with permission-aware filtering.",
      detailMD: `
Indexers consume change events, extract text from supported file formats, tokenize metadata, and attach ACL-derived visibility fields. Search results must still respect current permissions, especially after revocation or group membership changes.
`,
    },
    {
      name: "Metadata Store",
      kind: "database",
      role: "Durable transactional source of truth for nodes, ACLs, version pointers, quota ledgers, and sync cursors.",
      detailMD: `
Use a distributed transactional store for strong conditional updates such as move, share, version commit, and quota reservation. Shard by stable IDs and owner scopes, and keep secondary indexes aligned with the most common access patterns.
`,
    },
    {
      name: "Blob Store",
      kind: "storage",
      role: "Stores immutable chunks, manifests, thumbnails, and cold versions at petabyte scale.",
      detailMD: `
The blob layer should use replication or erasure coding, checksums, background scrubbing, lifecycle tiering, and regional placement. It is optimized for high-throughput transfer and durability rather than folder listing or ACL evaluation.
`,
    },
  ],
  deepDives: [
    {
      topic: "Hierarchy metadata and folder moves",
      detailMD: `
A naive design stores full paths such as /team/plans/q3.docx in every descendant. Moving a large folder would require rewriting all child paths and invalidating huge parts of the index. The better design uses stable node IDs with parent_id references. A move updates only the moved folder parent pointer and name, then emits one change for the moved subtree root.

Folder listing is still hard because large shared folders can have millions of children and many concurrent viewers. Use parent_id plus sorted pagination indexes, cap page sizes, and treat extremely large folders as a special scale case with materialized child lists or partitioned listing tables.

Name uniqueness is a product decision. If names must be unique within a folder, enforce uniqueness with a conditional write on parent_id and normalized name. If duplicates are allowed, folder listing can be simpler, but the UI and sync clients need stable IDs to distinguish same-name files.
`,
    },
    {
      topic: "Permissions, sharing graph, and inherited ACLs",
      detailMD: `
Permissions are the distinguishing part of Drive compared with a simple object store. A file may be visible because of direct user access, a group grant, a domain grant, a public link, ownership, shared drive membership, or inherited folder ACLs. The Permission Service should evaluate these sources in a predictable order and return the effective role.

Do not copy every folder ACL to every descendant for normal inheritance. That makes sharing a folder with a million files too expensive and makes revocation dangerous. Instead, store explicit grants at the folder and evaluate ancestors or maintain compact materialized ACL summaries with an acl_version. Caches are allowed, but the version must let services reject stale decisions.

Revocation is more sensitive than granting. If a user removes access, cached signed URLs, search results, collaboration sessions, and sync clients must stop exposing content within a bounded window. Short-lived download URLs, ACL-versioned cache keys, and high-priority invalidation events are essential.
`,
    },
    {
      topic: "Blob storage, deduplication, versioning, and quota",
      detailMD: `
Binary file content should be stored as immutable chunks and manifests. Chunking enables resumable upload, parallel download, deduplication, and partial retry. Content-addressed chunks let identical bytes be stored once, while manifests define each file version as an ordered list of chunks.

Deduplication has tradeoffs. Global dedup saves the most storage but can leak information if an attacker can infer whether a chunk already exists. Safer designs deduplicate within a tenant or use server-side checks that do not reveal cross-tenant existence. Compression and thumbnail extraction should run asynchronously.

Quota should be charged at version commit time using a reservation model. Reserve expected bytes when upload starts, adjust charged bytes after deduplication, and release reservations on abort. The quota ledger can be eventually consistent for display, but enforcement needs enough atomicity to stop unlimited overage.
`,
    },
    {
      topic: "Real-time collaboration with Operational Transform or CRDTs",
      detailMD: `
Native documents are not just files with frequent saves. Multiple users edit paragraphs, tables, comments, and formatting at the same time. The service receives operations based on different revisions and must produce a convergent document state for every participant.

Operational Transform keeps a server-ordered log and transforms incoming operations against concurrent committed operations. It gives centralized control and mature semantics, but transform functions are complex for rich document structures. CRDTs allow more decentralized merging and offline edits, but can add metadata overhead and need careful compaction.

In an interview, choose a collaboration model and explain why. For a Google Drive style product, a server-mediated OT or server-coordinated CRDT design is practical: active sessions are routed to a collaboration shard, operations are persisted before acknowledgement, snapshots bound replay cost, and offline clients reconcile local edits through operation replay or conflict copies.
`,
    },
    {
      topic: "Change feed, offline sync, and conflict handling",
      detailMD: `
Sync clients cannot scan all files repeatedly. They need a durable change feed scoped to the user or shared drive. Each event has an ordered sequence, affected node, change type, tombstone marker, and enough metadata for the client to update local state or request details.

Clients go offline, miss events, and reconnect with old cursors. The service should retain change history for a defined window, then return a cursor expired response that forces a full or scoped resync. Events should be idempotent because clients may receive duplicates after retries.

Conflicts happen when two offline clients edit or move the same binary file. Metadata conflicts can use last-writer-wins only for safe fields, but content conflicts often require creating a conflict copy or a separate version for user resolution. Native documents can merge operations through the collaboration engine.
`,
    },
    {
      topic: "Search indexing with permission filtering",
      detailMD: `
Search uses derived data: file names, owners, MIME types, timestamps, OCR text, extracted document text, labels, comments, and thumbnails. Indexers consume the change feed and update an inverted index asynchronously, so search freshness is eventually consistent.

Permission filtering must be designed carefully. One option stores ACL-derived visibility tokens in the index and filters candidate documents by the caller's tokens. That is fast but must react to revocation and group changes. Another option performs post-filter authorization against the Permission Service, which is safer but can increase latency and reduce recall if many candidates are filtered.

A balanced design uses visibility tokens for broad filtering, ACL versions for freshness, and final authorization for sensitive downloads. Search can lag after upload, but it must not reveal a private file after access is removed.
`,
    },
  ],
  scaling: [
    {
      stage: "Prototype: single region and simple storage",
      detailMD: `
Start with one API service, a relational database for nodes and permissions, object storage for file content, and basic upload or download APIs. Implement stable file IDs, folder listing, owner-only access, simple sharing, and version history before adding global sync.
`,
    },
    {
      stage: "Growth: split metadata, blob, and search paths",
      detailMD: `
Introduce dedicated Metadata, Blob, Permission, and Search services. Add resumable uploads, signed download URLs, CDN for content, background indexers, and a change feed for desktop and mobile clients. Cache metadata reads but preserve ACL correctness with versioned decisions.
`,
    },
    {
      stage: "Large scale: distributed metadata and partitioned feeds",
      detailMD: `
Move metadata to a distributed transactional store, partition change feeds by owner or shared drive, add quota reservations, deduplicate chunks, and isolate collaboration sessions. Large folders, hot shared documents, and enterprise groups require specialized sharding and cache invalidation.
`,
    },
    {
      stage: "Global scale: regional content and multi-region metadata",
      detailMD: `
Replicate blob content across regions or place it near active users. Route metadata to a home region or use a globally consistent database for critical metadata. Keep signed URLs short-lived, route downloads through CDN, and ensure revocations propagate across regions quickly.
`,
    },
    {
      stage: "Enterprise scale: governance, compliance, and reliability isolation",
      detailMD: `
Add audit pipelines, DLP scanning, eDiscovery, legal holds, tenant-level keys, admin policy engines, and capacity isolation for large organizations. Search, sync, collaboration, and notifications should degrade independently so core file access remains available.
`,
    },
  ],
  bottlenecks: [
    {
      issue: "Hot metadata partitions from large shared folders",
      optimizationMD: `
Partition child listings for huge folders, use stable node IDs, paginate aggressively, cache folder pages, and avoid updating every child when the folder moves or is shared. For team drives, shard by shared drive and subfolder ranges rather than one root key.
`,
    },
    {
      issue: "Permission evaluation and revocation fanout",
      optimizationMD: `
Use compact ACL inheritance, group membership caches with short TTLs, ACL versions, and high-priority invalidation. Do not materialize every inherited grant to every descendant unless a background job can safely rebuild summaries.
`,
    },
    {
      issue: "Blob ingest bandwidth and checksum CPU",
      optimizationMD: `
Upload directly to regional blob endpoints with signed URLs, validate chunks in parallel, use content-defined chunking where helpful, apply backpressure per tenant, and separate upload workers from metadata services.
`,
    },
    {
      issue: "Real-time collaboration hot documents",
      optimizationMD: `
Route each active document to a collaboration shard, use sticky sessions or document ownership leases, batch broadcasts, snapshot frequently, and split very large sessions into substreams for comments, presence, and document operations.
`,
    },
    {
      issue: "Change feed lag during sync storms",
      optimizationMD: `
Partition feeds by owner or shared drive, let clients use exponential backoff, prioritize recent visible changes, compact old events, and provide a full-resync path when cursors expire. Keep search and notification consumers from starving sync consumers.
`,
    },
    {
      issue: "Search index stale or over-broad after permission changes",
      optimizationMD: `
Emit ACL change events with high priority, include ACL versions in index documents, filter by visibility tokens, and perform final authorization for sensitive results. If in doubt, hide stale results until reindexed.
`,
    },
  ],
  failureHandling: [
    {
      scenario: "Metadata store regional failure",
      strategyMD: `
Fail traffic to a healthy region with replicated metadata if available. If strong writes are unavailable, allow read-only access to recently replicated metadata and content while pausing risky operations such as share, move, or delete. Prefer denying edits over causing divergent metadata.
`,
    },
    {
      scenario: "Blob store or CDN outage",
      strategyMD: `
Serve from another replica or origin region, reduce thumbnail and preview quality, and keep metadata operations available. Upload sessions should remain resumable, and clients should retry missing chunks rather than restarting whole files.
`,
    },
    {
      scenario: "Permission cache is stale after revocation",
      strategyMD: `
Use short-lived signed URLs, ACL-versioned cache keys, deny-list invalidation for revoked resources, and a final permission check before issuing new download URLs. If the permission system is uncertain, return 403 instead of serving content.
`,
    },
    {
      scenario: "Collaboration server crashes during an edit session",
      strategyMD: `
Persist operations before acknowledgement, route clients to a replacement session owner, replay from the last snapshot, and deduplicate client operation IDs. Presence can be lost, but committed document operations must not be lost or applied twice.
`,
    },
    {
      scenario: "Change feed consumer lag or corruption",
      strategyMD: `
Keep the primary metadata transaction independent of downstream consumers. Consumers should checkpoint offsets, replay from durable logs, and rebuild derived state from metadata snapshots when needed. Sync clients should receive cursor-expired responses rather than silent gaps.
`,
    },
    {
      scenario: "Quota ledger mismatch",
      strategyMD: `
Use upload reservations to bound overuse, reconcile charged bytes from version manifests, and run periodic ledger repair. If the ledger is temporarily unavailable, allow small trusted uploads within a risk budget and reject large uploads until quota can be verified.
`,
    },
  ],
  security: [
    {
      label: "Authorization on every access",
      detailMD: `
Every metadata read, download URL issuance, upload commit, share change, and collaboration operation must be authorized. Never rely only on hidden URLs or client-side filtering. Use least-privilege service credentials and audit privileged access.
`,
    },
    {
      label: "Safe link sharing",
      detailMD: `
Public or domain links should use unguessable tokens, optional expiration, download restrictions, and admin policy checks. Link token hashes should be stored instead of raw tokens, and revocation should invalidate active links quickly.
`,
    },
    {
      label: "Encryption and key management",
      detailMD: `
Encrypt data in transit and at rest. Large enterprises may need customer-managed keys, per-tenant key isolation, key rotation, and crypto-shredding for deleted or offboarded tenants.
`,
    },
    {
      label: "Malware, abuse, and DLP scanning",
      detailMD: `
Uploaded files and shared links can distribute malware or leak sensitive data. Scan risky files asynchronously, block known-bad content, integrate data loss prevention policies, and support quarantine without deleting evidence needed for audit.
`,
    },
    {
      label: "Privacy-aware search and previews",
      detailMD: `
Search snippets, thumbnails, OCR output, and previews can leak content. Index and render them only for authorized users, redact sensitive fields where policy requires it, and remove derived artifacts when access is revoked or content is deleted.
`,
    },
    {
      label: "Auditability and compliance",
      detailMD: `
Record share, view, download, admin, retention, and ownership events with tamper-resistant logs. Enterprise customers need legal hold, retention windows, eDiscovery exports, and policy evidence during incident investigations.
`,
    },
  ],
  tradeoffs: {
    pros: [
      "Separating metadata from blob storage lets each scale for its own workload.",
      "Stable node IDs make folder moves cheap and avoid path rewrites across descendants.",
      "Versioned immutable blobs improve durability, restore, deduplication, and conflict handling.",
      "ACL versions and short-lived signed URLs reduce the risk of stale permission decisions.",
      "A change feed decouples sync, search, notifications, and audit from user-facing writes.",
    ],
    cons: [
      "Permission inheritance and group membership make authorization more complex than simple object ACLs.",
      "Search and sync are eventually consistent, so the product must explain freshness and cursor behavior.",
      "Global metadata consistency is expensive, especially for moves, ownership changes, and revocation.",
      "Deduplication saves storage but introduces privacy, accounting, and operational complexity.",
      "Real-time collaboration requires a specialized subsystem rather than ordinary file version uploads.",
    ],
    alternativesMD: `
Alternative one is an object-store-first design: put every file in object storage and store minimal metadata in a database. It is simple for personal backup but weak for folder hierarchy, sharing inheritance, search, and collaboration.

Alternative two is a fully path-based file system namespace. It is intuitive but expensive for moves and rename operations across large subtrees. Stable IDs with parent pointers scale better.

Alternative three is a centralized collaboration document store for all content. It works for native docs but is inefficient for large binary files, videos, archives, and offline desktop sync.
`,
    whenNotToUseMD: `
Do not design Google Drive when the requirement is only archival object storage, a CDN-backed static file host, or a database for structured records. Drive is appropriate when users need human-facing hierarchy, sharing, collaboration, sync, versioning, search, and governance over files.
`,
  },
  followUpQuestions: [
    {
      question: "How do you avoid rewriting millions of descendants when a folder moves?",
      answerMD: `
Use stable node IDs and parent_id pointers instead of storing full paths as primary identity. Moving a folder updates one parent pointer and emits a change event. Folder listings compute the visible path from parent links or cached breadcrumbs, and search indexes update derived paths asynchronously.
`,
    },
    {
      question: "How do you enforce inherited folder permissions efficiently?",
      answerMD: `
Store explicit grants at the resource where they are created and evaluate inheritance through ancestor summaries or cached effective ACLs. Use acl_version values to detect stale permission decisions. Avoid copying every inherited permission to every descendant on the synchronous share path.
`,
    },
    {
      question: "How do you revoke access quickly when a file was already shared?",
      answerMD: `
Increment the ACL version, invalidate permission caches, expire or deny existing signed URLs, remove link tokens, notify collaboration sessions, and prioritize search index updates. If a service cannot verify current permissions, it should deny access rather than serve stale content.
`,
    },
    {
      question: "How do offline clients resolve conflicts?",
      answerMD: `
Clients replay local mutations with client mutation IDs when they reconnect. Metadata operations can use conditional versions and safe last-writer policies for simple fields. Binary content conflicts create separate versions or conflict copies. Native docs merge through the collaboration operation log.
`,
    },
    {
      question: "Why not store file bytes in the metadata database?",
      answerMD: `
Metadata records need low-latency transactions and indexes, while file bytes need high-throughput streaming, replication, erasure coding, and lifecycle tiering. Combining them makes both paths harder to scale and more expensive.
`,
    },
    {
      question: "How does search respect permissions at scale?",
      answerMD: `
Index documents with visibility tokens or ACL summaries, filter candidate results by the caller's identity and groups, and use ACL versions to detect stale results. For sensitive content, perform a final permission check before returning previews or download URLs.
`,
    },
    {
      question: "How do you choose between Operational Transform and CRDTs for docs?",
      answerMD: `
Operational Transform is natural for a server-ordered collaboration service and mature for text editing, but rich document transforms are complex. CRDTs handle offline and peer-style merging better but add metadata overhead. A strong answer chooses one, explains convergence, and includes snapshots and operation compaction.
`,
    },
  ],
  companyVariations: [
    {
      company: "Google",
      angleMD: `
Google interviewers are likely to probe global metadata scale, collaboration correctness, permission revocation, search freshness, and the separation of Drive storage from Docs collaboration. Be ready to explain how ACL versions, change feeds, and operation logs interact.
`,
    },
    {
      company: "Microsoft",
      angleMD: `
Microsoft may frame this as OneDrive or SharePoint: enterprise identity, groups, tenant policy, compliance, retention, audit, and Office-style collaboration. Emphasize Azure-style blob storage, Entra ID group membership, legal hold, and admin controls.
`,
    },
    {
      company: "Amazon",
      angleMD: `
Amazon interviewers often push on S3-like durability, DynamoDB or Aurora partitioning, cost, operational alarms, and failure isolation. Discuss direct-to-object-store transfer, quota enforcement, conditional writes, and reducing blast radius across services.
`,
    },
    {
      company: "Meta",
      angleMD: `
Meta may focus on high-QPS metadata serving, media blobs, privacy, graph-based sharing, and realtime collaboration or comments. Expect follow-ups on cache invalidation, privacy reviews, and fanout from popular shared folders.
`,
    },
  ],
  relatedQuestions: [
    {
      slug: "dropbox",
      note: "Closest file-sync comparison, but with less emphasis on live document collaboration and permission graph complexity.",
    },
    {
      slug: "cloud-storage",
      note: "The blob storage layer of Drive relies on object storage durability, chunking, replication, and lifecycle policies.",
    },
    {
      slug: "google-search",
      note: "Drive search uses indexing, ranking, freshness, and permission-aware filtering over private documents.",
    },
    {
      slug: "key-value-store",
      note: "Metadata, ACL caches, change cursors, and blob manifests all rely on scalable key-based access patterns.",
    },
  ],
  interviewTips: {
    commonMistakes: [
      "Designing only an object store and forgetting hierarchy, sharing inheritance, sync, and collaboration.",
      "Serving downloads from signed URLs without rechecking permissions or bounding URL lifetime.",
      "Copying folder ACLs to every descendant synchronously on share or revoke.",
      "Using full paths as primary keys and making folder moves rewrite entire subtrees.",
      "Treating search index results as authoritative for access control.",
    ],
    redFlags: [
      "No concrete capacity math for metadata QPS, blob storage, and download bandwidth.",
      "No answer for offline sync cursors, cursor expiry, and conflict copies.",
      "No versioning or checksum strategy for uploaded content.",
      "No distinction between binary file uploads and real-time native document editing.",
      "No plan for permission revocation and stale cache invalidation.",
    ],
    expectations: [
      "Separate metadata service, blob storage, permission service, collaboration service, change feed, and search index.",
      "Use stable file IDs, parent pointers, version manifests, and immutable chunks.",
      "Explain inherited ACL evaluation and why revocation is safety-critical.",
      "Cover sync clients with durable cursors, tombstones, idempotent events, and full-resync fallback.",
      "Discuss Operational Transform or CRDTs for collaborative documents.",
      "Tie capacity numbers to metadata reads, writes, content ingest, download bandwidth, and collaboration ops.",
    ],
    communicationMD: `
Start by stating that Google Drive is a metadata and permissions problem wrapped around petabyte blob storage, not just a file upload API. Draw the metadata path, permission path, blob path, collaboration path, and change-feed path separately. Then explain the hardest invariants: never serve content without authorization, do not rewrite huge subtrees for moves or shares, keep versions durable, and make offline clients converge.
`,
  },
  revisionNotesMD: `
- Store file and folder identity as stable node IDs with parent_id links. Do not use full paths as primary keys.
- Split the system into Metadata Service, Permission Service, Blob Service, Collaboration Service, Change Feed, Search Index, Metadata Store, and Blob Store.
- Metadata scale is huge: 20B nodes at 2 KB each is about 40 TB raw, and 30B metadata reads per day is about 347,000 read QPS average.
- Content scale is larger in bytes: 50M new versions per day at 8 MB each is about 400 TB logical ingest per day before deduplication.
- Blob content should be immutable chunks plus manifests, with checksums, resumable upload, deduplication, version history, and lifecycle tiering.
- Permissions need explicit grants, inheritance, groups, links, domain policy, ACL versions, short-lived signed URLs, and high-priority revocation invalidation.
- Native documents need a collaboration layer using Operational Transform or CRDTs, persisted operation logs, active session routing, and snapshots.
- Change feeds power sync clients, notifications, audit, and search indexing. Cursors must be durable, idempotent, and able to expire into full resync.
- Search is derived and eventually consistent. It can filter by visibility tokens, but sensitive access still needs permission checks.
- Quota enforcement should reserve bytes during upload and reconcile charged usage after deduplication and version commit.
`,
  flashcards: [
    {
      front: "Why is Google Drive more than blob storage?",
      back: "Because the hard parts are hierarchy metadata, permissions, sharing inheritance, sync, search, versioning, quota, and real-time collaboration around the bytes.",
    },
    {
      front: "Why use stable file IDs instead of full paths?",
      back: "Stable IDs make rename and move operations cheap and avoid rewriting descendants when a folder path changes.",
    },
    {
      front: "What protects against stale permission caches?",
      back: "ACL versions, short-lived signed URLs, revocation invalidation, and final authorization before content access.",
    },
    {
      front: "Why store blobs as chunks and manifests?",
      back: "Chunks enable resumable upload, parallel download, deduplication, checksums, and immutable version manifests.",
    },
    {
      front: "What is the purpose of the change feed?",
      back: "It provides ordered deltas for sync clients, notifications, audit, search indexing, and offline recovery.",
    },
    {
      front: "How should binary file conflicts be handled?",
      back: "Create separate versions or conflict copies for user resolution, while native docs can merge operations through the collaboration engine.",
    },
    {
      front: "Why is revocation harder than granting access?",
      back: "Revocation must invalidate caches, signed URLs, search results, sync state, and collaboration sessions quickly to avoid over-sharing.",
    },
    {
      front: "What makes real-time docs different from normal file uploads?",
      back: "They require convergent operation ordering or merging, active sessions, operation logs, snapshots, and low-latency fanout.",
    },
    {
      front: "Why is search not the source of truth for permissions?",
      back: "Search is a derived and eventually consistent index, so it can filter candidates but content access still needs current authorization.",
    },
  ],
  quiz: [
    {
      question: "What is the best primary identity for files and folders in a Drive-like system?",
      options: ["The full path string", "A stable node ID", "The file name", "The owner's email address"],
      answerIndex: 1,
      explanationMD: `
Stable node IDs avoid rewriting descendants when folders move or names change. Paths and names are mutable metadata, not durable identity.
`,
    },
    {
      question: "Why should file content be stored separately from metadata?",
      options: ["Metadata databases cannot store strings", "Content needs high-throughput blob transfer while metadata needs low-latency transactions and indexes", "It removes the need for permissions", "It makes search unnecessary"],
      answerIndex: 1,
      explanationMD: `
Blob content and metadata have very different access patterns. Splitting them lets each layer scale and optimize independently.
`,
    },
    {
      question: "Which mechanism most directly helps detect stale authorization decisions?",
      options: ["A larger CDN", "ACL versions", "Longer file names", "Random upload session IDs"],
      answerIndex: 1,
      explanationMD: `
ACL versions let services and caches know whether a permission decision was made against current sharing state.
`,
    },
    {
      question: "What should a sync client do when its change cursor is too old?",
      options: ["Ignore missing changes", "Force a scoped or full resync", "Assume files were deleted", "Disable authentication"],
      answerIndex: 1,
      explanationMD: `
If the server no longer retains the old log range, it should return a cursor-expired response and the client should resync from authoritative metadata.
`,
    },
    {
      question: "Which subsystem handles concurrent edits to a native document?",
      options: ["The CDN", "The Collaboration Service", "The quota ledger", "The thumbnail worker"],
      answerIndex: 1,
      explanationMD: `
The Collaboration Service orders, transforms, or merges edit operations and keeps all clients convergent.
`,
    },
    {
      question: "Why is copying inherited ACLs to every descendant during a share problematic?",
      options: ["It prevents downloads from using HTTPS", "It makes large folder shares and revocations expensive and risky", "It disables version history", "It removes the need for search"],
      answerIndex: 1,
      explanationMD: `
Large folders can have millions of descendants. Synchronous ACL fanout is slow, costly, and dangerous during revocation.
`,
    },
  ],
  cheatSheetMD: `
**Goal**: design cloud storage with hierarchy, sharing, versioning, collaboration, search, sync, quota, and secure content delivery.

**Core split**: Metadata Service for nodes and versions, Permission Service for ACLs and inheritance, Blob Service for chunks and manifests, Collaboration Service for native docs, Change Feed for sync and derived systems, Search Index for discovery.

**Scale assumptions**: 20B metadata nodes, 30B metadata reads per day, 1B metadata mutations per day, 50M new file versions per day, 400 TB logical ingest per day, and about 35 GB per second average download bandwidth.

**Metadata model**: stable node_id, parent_id, owner_id, node_type, current_version_id, acl_version, timestamps, and soft-delete state. Avoid path-based primary keys.

**Blob model**: resumable upload sessions, immutable chunks, content hashes, manifests, checksums, deduplication, version history, lifecycle tiering, and short-lived signed download URLs.

**Permissions**: direct grants, inherited folder ACLs, groups, domains, public links, owner policy, ACL versions, cache invalidation, and final authorization before content access.

**Collaboration**: route active documents to collaboration shards, persist operations, use Operational Transform or CRDTs, broadcast to collaborators, and snapshot to bound replay cost.

**Sync**: emit ordered change events with cursors, tombstones, idempotency, cursor expiry, and full-resync fallback. Offline binary conflicts produce conflict copies; native docs merge operations.

**Search**: index metadata and extracted content asynchronously, filter by visibility tokens, track ACL versions, and never treat the index as the source of truth for downloads.

**Reliability**: isolate search, notifications, and previews from core file access. Prefer denying uncertain access over accidentally over-sharing.
`,
  references: [
    {
      title: "Google Drive API Documentation",
      kind: "Docs",
      url: "https://developers.google.com/drive/api/guides/about-sdk",
      author: "Google",
    },
    {
      title: "Google Docs API Documentation",
      kind: "Docs",
      url: "https://developers.google.com/docs/api",
      author: "Google",
    },
    {
      title: "Operational Transformation in Real-Time Group Editors",
      kind: "Paper",
      url: "https://dl.acm.org/doi/10.1145/289444.289469",
      author: "Chengzheng Sun and Clarence Ellis",
    },
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
  ],
};
