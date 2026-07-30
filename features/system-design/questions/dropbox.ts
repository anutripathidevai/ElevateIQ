import type { SDQuestionContent } from "../types";

export const dropboxContent: SDQuestionContent = {
  slug: "dropbox",
  statementMD: `
Design Dropbox, a cloud file storage and synchronization service. Users install clients on laptops and phones, create or edit files locally, and expect those changes to appear on every device and for collaborators with low delay. The system must store file contents durably, preserve file versions, support sharing and permissions, and recover deleted or overwritten data.

At interview scale, assume hundreds of millions of users, billions of file mutations per day, exabytes of stored data, and many clients that are intermittently offline. The central challenge is not just uploading whole files. A strong design chunks files into blocks, stores blocks by content hash for deduplication, tracks file metadata and version histories separately, syncs only changed blocks, and notifies clients quickly when remote changes happen.

The default design should optimize for durable storage, bandwidth-efficient sync, metadata correctness, and predictable conflict resolution. Optional features such as selective sync, team folders, shared links, ransomware recovery, and CDN acceleration should layer on top without weakening the core invariant that file versions map to immutable block lists.
`,
  businessUseCaseMD: `
Dropbox lets users and businesses treat cloud storage as an always-available folder. It improves productivity by making files available across devices, allowing teams to collaborate without manual email attachments, and protecting users from local disk failure.

For enterprises, the same platform becomes a managed content layer with audit logs, sharing controls, data retention, device management, and restore workflows. Efficient sync and deduplication directly reduce storage, bandwidth, and support costs at exabyte scale.
`,
  functionalRequirements: [
    "Upload new files and modified file contents from desktop, mobile, and web clients.",
    "Download files and keep multiple devices synchronized with the latest visible version.",
    "Chunk files into blocks and upload or download only missing or changed blocks.",
    "Store and restore historical file versions and deleted files within a retention window.",
    "Support shared folders, shared links, permissions, and owner or admin revocation.",
    "Detect remote changes through notification, long-poll, or streaming sync channels.",
    "Handle concurrent edits with deterministic conflict resolution and user-visible conflicted copies.",
    "Support selective sync and offline clients that later reconcile with the server.",
  ],
  nonFunctionalRequirements: [
    {
      label: "Sync latency",
      detailMD: `
Small metadata changes should become visible to online peer clients in under 5 seconds p95. Small file edits should finish upload, commit, notification, and first download start in under 30 seconds p95 on a healthy network.
`,
    },
    {
      label: "Durability",
      detailMD: `
Committed file versions must not be lost. Store metadata in replicated databases, store blocks in object storage with multi-zone durability or erasure coding, verify block hashes, and keep backups or journal replay for metadata recovery.
`,
    },
    {
      label: "Availability",
      detailMD: `
Users should still read already-synced local files during server outages, and cloud downloads should target 99.99 percent availability. Metadata writes can degrade more carefully than reads, but the system must avoid accepting commits that cannot be durably recovered.
`,
    },
    {
      label: "Scalability",
      detailMD: `
Scale metadata, block upload, block download, notification fanout, and background compaction independently. File metadata operations are small and consistency-sensitive, while block storage is bandwidth-heavy and object-store-oriented.
`,
    },
    {
      label: "Bandwidth efficiency",
      detailMD: `
Clients should avoid re-uploading bytes the service already has. Use file chunking, content-addressed block hashes, server-side missing-block checks, compression where appropriate, and CDN downloads for popular shared content.
`,
    },
    {
      label: "Consistency",
      detailMD: `
Each file path needs a clear latest version, atomic metadata commits, and monotonic change tokens per namespace. Cross-device propagation can be eventually consistent, but clients must converge to the same ordered journal after reconnecting.
`,
    },
    {
      label: "Security and privacy",
      detailMD: `
The service stores sensitive personal and enterprise data. Enforce authentication, namespace permissions, secure shared links, encryption in transit and at rest, auditability, and careful deduplication boundaries to avoid cross-tenant information leakage.
`,
    },
  ],
  capacityEstimation: {
    assumptionsMD: `
Assume 800M registered users, 100M daily active users, 2B file change commits per day, an average logical changed payload of 2 MB per commit, a 4 MB maximum block size, and 1.2 changed block references per commit after chunking small and medium files.

Assume deduplication, compression, failed-upload cleanup, and version retention reduce unique physical block ingestion to 40 percent of logical changed bytes. Use a 5x peak multiplier over average for upload and metadata traffic. Assume 50M concurrently connected clients and 2 devices notified per committed change on average.
`,
    metrics: [
      {
        label: "Daily active users",
        value: "100M",
        note: "Users with at least one client or web session active that day",
      },
      {
        label: "File commits",
        value: "2B per day",
        note: "Creates, updates, deletes, moves, and restores that produce metadata journal entries",
      },
      {
        label: "Average commit QPS",
        value: "23,000 commits per second",
        note: "2B divided by 86,400 seconds",
      },
      {
        label: "Peak commit QPS",
        value: "115,000 commits per second",
        note: "5x average peak",
      },
      {
        label: "Logical changed data",
        value: "4 PB per day",
        note: "2B commits times 2 MB average changed payload",
      },
      {
        label: "Unique physical ingest",
        value: "1.6 PB per day",
        note: "40 percent of logical bytes after deduplication, compression, and cleanup",
      },
      {
        label: "Block references",
        value: "2.4B per day",
        note: "2B commits times 1.2 block references per commit",
      },
      {
        label: "Notification fanout",
        value: "46,000 events per second average",
        note: "2B commits times 2 devices divided by 86,400 seconds",
      },
      {
        label: "Metadata growth",
        value: "2 to 3 TB per day raw",
        note: "Version records, block references, path journal, shares, and indexes before replication",
      },
      {
        label: "Annual physical block growth",
        value: "580 PB raw before redundancy",
        note: "1.6 PB per day times 365 days; accumulated fleet storage reaches exabytes",
      },
    ],
    calculationsMD: `
- Commits: 2B file commits per day divided by 86,400 seconds is about 23,148 commits per second, rounded to 23,000.
- Peak metadata writes: applying a 5x multiplier gives about 115,000 commits per second.
- Logical changed data: 2B commits times 2 MB is 4B MB per day, which is about 4 PB per day.
- Deduplication savings: if only 40 percent becomes unique stored blocks, object storage ingests about 1.6 PB per day instead of 4 PB. That implies about 60 percent savings from duplicate files, repeated blocks, compression, and abandoned upload cleanup.
- Block references: 2B commits times 1.2 block references is 2.4B ordered references per day. At roughly 64 bytes per reference before indexes, block-reference metadata alone is about 154 GB per day raw.
- Version metadata: if each commit stores about 1 KB of path, actor, timestamps, permissions snapshot pointer, and version metadata, 2B commits add about 2 TB per day raw before replication and indexing.
- Notifications: 2B commits times 2 target devices is 4B device notifications per day. 4B divided by 86,400 seconds is about 46,000 notification events per second average, with peaks around 230,000 per second.
- Storage: 1.6 PB per day times 365 days is about 584 PB per year before redundancy. With erasure coding, replication, thumbnails, indexes, and retention, a mature service plans in exabytes.
- Long-poll load: 50M connected clients renewing a long-poll every 60 seconds would create about 833,000 renewals per second if implemented naively, so persistent connections, jitter, and regional notification shards are required.
`,
  },
  apiDesign: {
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/upload-sessions",
        descriptionMD: `
Starts an upload session for a file mutation. The server returns the block hashes it already has so the client uploads only missing blocks.
`,
        request: `
{
  "namespaceId": "ns_123",
  "path": "/Designs/spec.pdf",
  "clientBaseRev": "rev_9182",
  "fileSizeBytes": 9437184,
  "blockSizeBytes": 4194304,
  "blockHashes": ["sha256_a", "sha256_b", "sha256_c"]
}
`,
        response: `
{
  "uploadSessionId": "upl_456",
  "missingBlockHashes": ["sha256_b"],
  "expiresAt": "2026-07-26T13:10:48Z"
}
`,
        statusCodes: [
          { code: 201, meaning: "Upload session created" },
          { code: 400, meaning: "Invalid path, revision, or block manifest" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "No write permission for the namespace or path" },
          { code: 409, meaning: "Client base revision is stale and requires conflict handling" },
          { code: 429, meaning: "Upload rate limit exceeded" },
        ],
      },
      {
        method: "PUT",
        path: "/api/v1/blocks/{blockHash}",
        descriptionMD: `
Uploads one missing content-addressed block. The server verifies that the uploaded bytes hash to the requested block hash before making the block available for commit.
`,
        request: `
Binary block payload up to 4 MB with headers:
Content-Type: application/octet-stream
Upload-Session-Id: upl_456
Block-Hash: sha256_b
`,
        response: `
{
  "blockHash": "sha256_b",
  "sizeBytes": 4194304,
  "stored": true
}
`,
        statusCodes: [
          { code: 200, meaning: "Block already existed or was stored successfully" },
          { code: 400, meaning: "Payload hash or size does not match" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Upload session is not authorized for this block" },
          { code: 413, meaning: "Block exceeds maximum size" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/files/commit",
        descriptionMD: `
Commits the metadata change after all required blocks exist. This creates a new file version and appends an ordered journal entry for sync clients.
`,
        request: `
{
  "uploadSessionId": "upl_456",
  "namespaceId": "ns_123",
  "path": "/Designs/spec.pdf",
  "clientBaseRev": "rev_9182",
  "blockHashes": ["sha256_a", "sha256_b", "sha256_c"],
  "mode": "overwrite-if-current"
}
`,
        response: `
{
  "fileId": "file_789",
  "newRev": "rev_9183",
  "journalSeq": 23881231,
  "conflict": false
}
`,
        statusCodes: [
          { code: 201, meaning: "New file version committed" },
          { code: 400, meaning: "Commit manifest is invalid" },
          { code: 403, meaning: "Caller lacks write permission" },
          { code: 409, meaning: "Base revision conflict; caller should create a conflicted copy or merge" },
          { code: 422, meaning: "One or more referenced blocks are missing" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/sync/delta",
        descriptionMD: `
Returns ordered changes for a namespace after the client's last known cursor. Clients use this endpoint after reconnecting or after receiving a notification.
`,
        response: `
{
  "namespaceId": "ns_123",
  "fromCursor": "cur_abc",
  "nextCursor": "cur_def",
  "hasMore": true,
  "changes": [
    {
      "journalSeq": 23881231,
      "type": "file_updated",
      "fileId": "file_789",
      "path": "/Designs/spec.pdf",
      "rev": "rev_9183"
    }
  ]
}
`,
        statusCodes: [
          { code: 200, meaning: "Delta returned" },
          { code: 400, meaning: "Cursor is invalid or too old" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "No read permission for namespace" },
          { code: 410, meaning: "Cursor expired; client must rescan the namespace" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/files/{fileId}/download",
        descriptionMD: `
Returns the latest visible file version, a selected historical revision, or signed block download URLs. Large downloads can be served by object storage and CDN.
`,
        response: `
{
  "fileId": "file_789",
  "rev": "rev_9183",
  "sizeBytes": 9437184,
  "blockSizeBytes": 4194304,
  "blocks": [
    {
      "blockHash": "sha256_a",
      "sizeBytes": 4194304,
      "downloadUrl": "https://cdn.example.com/blocks/sha256_a"
    }
  ]
}
`,
        statusCodes: [
          { code: 200, meaning: "Download manifest returned" },
          { code: 206, meaning: "Partial byte range returned by block download endpoint" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "No read permission" },
          { code: 404, meaning: "File or version not found" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/shares",
        descriptionMD: `
Creates a shared folder permission or shared link. The metadata service records the policy and later enforces it on list, sync, and download operations.
`,
        request: `
{
  "resourceId": "file_789",
  "resourceType": "file",
  "principal": "user@example.com",
  "role": "viewer",
  "expiresAt": "2026-08-26T00:00:00Z"
}
`,
        response: `
{
  "shareId": "shr_321",
  "resourceId": "file_789",
  "role": "viewer",
  "status": "active"
}
`,
        statusCodes: [
          { code: 201, meaning: "Share created" },
          { code: 400, meaning: "Invalid principal or role" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Caller cannot share this resource" },
          { code: 409, meaning: "Conflicting share policy already exists" },
        ],
      },
    ],
    notesMD: `
Separate block transfer from metadata commit. A block upload is idempotent and content-addressed, while a file commit is a consistency-sensitive metadata transaction. Clients should be able to retry upload sessions, resume missing blocks, and commit only after the server confirms that all referenced blocks exist.

For sync, clients should not poll entire folder trees. They keep a namespace cursor, receive a notification that the cursor has advanced, and call the delta API to fetch ordered changes. Download APIs can return signed block URLs so large bytes flow through object storage and CDN instead of the metadata service.
`,
  },
  databaseDesign: {
    schemaMD: `
Store file bytes and file metadata separately. Blocks are immutable objects addressed by cryptographic hash. File versions are metadata records that point to ordered block references. A namespace journal gives every client a monotonic stream of changes to replay.

The metadata database must support transactional updates per namespace or per file path, compare-and-swap on base revisions, and efficient listing by parent folder. The block index must support existence checks, reference accounting, and garbage collection without blocking the commit path.
`,
    tables: [
      {
        name: "namespaces",
        columns: [
          { name: "namespace_id", type: "uuid", note: "Primary key for a user root, team space, or shared folder" },
          { name: "owner_id", type: "uuid", note: "User or team that owns the namespace" },
          { name: "root_folder_id", type: "uuid", note: "Root folder node" },
          { name: "current_journal_seq", type: "bigint", note: "Latest committed sequence for delta sync" },
          { name: "created_at", type: "timestamp", note: "Namespace creation time" },
          { name: "status", type: "varchar(20)", note: "Active, suspended, locked, or deleted" },
        ],
      },
      {
        name: "file_nodes",
        columns: [
          { name: "file_id", type: "uuid", note: "Stable logical identity across renames and versions" },
          { name: "namespace_id", type: "uuid", note: "Partition and permission boundary" },
          { name: "parent_folder_id", type: "uuid nullable", note: "Folder hierarchy parent" },
          { name: "name", type: "varchar(255)", note: "Current display name within parent folder" },
          { name: "node_type", type: "varchar(16)", note: "File or folder" },
          { name: "latest_rev", type: "varchar(64)", note: "Current visible revision" },
          { name: "deleted_at", type: "timestamp nullable", note: "Soft delete marker for restore" },
          { name: "updated_at", type: "timestamp", note: "Last metadata mutation time" },
        ],
      },
      {
        name: "file_versions",
        columns: [
          { name: "rev", type: "varchar(64)", note: "Primary key for an immutable version" },
          { name: "file_id", type: "uuid", note: "Logical file identity" },
          { name: "namespace_id", type: "uuid", note: "Used for partition-local journal ordering" },
          { name: "actor_user_id", type: "uuid", note: "User or service that created the version" },
          { name: "size_bytes", type: "bigint", note: "Logical file size" },
          { name: "content_hash", type: "varchar(64)", note: "Hash over the ordered block list and file length" },
          { name: "created_at", type: "timestamp", note: "Commit time" },
          { name: "journal_seq", type: "bigint", note: "Namespace sequence emitted to sync clients" },
        ],
      },
      {
        name: "version_blocks",
        columns: [
          { name: "rev", type: "varchar(64)", note: "File version that owns this ordered reference" },
          { name: "block_index", type: "int", note: "0-based order in the file" },
          { name: "block_hash", type: "varchar(64)", note: "Cryptographic hash of immutable block bytes" },
          { name: "offset_bytes", type: "bigint", note: "Logical byte offset" },
          { name: "size_bytes", type: "int", note: "Block length, usually up to 4 MB" },
        ],
      },
      {
        name: "blocks",
        columns: [
          { name: "block_hash", type: "varchar(64)", note: "Primary key for content-addressed storage" },
          { name: "size_bytes", type: "int", note: "Stored block size" },
          { name: "storage_uri", type: "text", note: "Object-store bucket and key or erasure-coded location" },
          { name: "ref_count_estimate", type: "bigint", note: "Approximate references for garbage collection" },
          { name: "first_seen_at", type: "timestamp", note: "First successful verified upload" },
          { name: "encryption_key_id", type: "varchar(128)", note: "Key envelope or tenant key reference" },
        ],
      },
      {
        name: "shares",
        columns: [
          { name: "share_id", type: "uuid", note: "Primary key for shared link or explicit ACL entry" },
          { name: "resource_id", type: "uuid", note: "File, folder, or namespace being shared" },
          { name: "principal_id", type: "uuid nullable", note: "Target user, group, team, or null for link share" },
          { name: "role", type: "varchar(32)", note: "Viewer, editor, owner, or admin" },
          { name: "expires_at", type: "timestamp nullable", note: "Optional link or permission expiration" },
          { name: "created_by", type: "uuid", note: "Actor who created the share" },
          { name: "status", type: "varchar(20)", note: "Active, revoked, expired, or disabled" },
        ],
      },
    ],
    indexesMD: `
- **file_nodes.namespace_id, parent_folder_id, name** supports folder listing and enforces unique names inside a folder.
- **file_nodes.namespace_id, latest_rev** supports lookup of the current visible file version.
- **file_versions.file_id, created_at** supports version history and restore.
- **file_versions.namespace_id, journal_seq** supports delta sync by namespace cursor.
- **version_blocks.rev, block_index** returns the ordered block list for a file version.
- **blocks.block_hash** is the primary lookup for deduplication and missing-block checks.
- **shares.resource_id** and **shares.principal_id** support permission evaluation and user sharing dashboards.
`,
    relationshipsMD: `
A namespace contains file nodes and a journal sequence. A file node points to one latest revision, while file_versions stores immutable historical revisions. Each revision has many ordered version_blocks, and each version block points to one immutable block object. Shares attach permissions to files, folders, or namespaces and are evaluated before metadata or block download access is granted.
`,
    noSqlAlternativesMD: `
At large scale, split the logical schema across stores. Metadata can live in Spanner, FoundationDB, CockroachDB, or a sharded relational system because commits need transactions and ordered namespace journals. Block existence and reference metadata fit DynamoDB, Bigtable, or Cassandra keyed by block hash. Actual bytes belong in object storage such as S3, Azure Blob Storage, GCS, or an internal erasure-coded blob store.

Avoid putting object bytes in the metadata database. Also avoid relying on one global transaction for block upload and file commit. The commit only needs to verify that referenced blocks are durably present, then append metadata and journal entries atomically within the namespace.
`,
  },
  architecture: {
    width: 960,
    height: 560,
    nodes: [
      { id: "client", label: "Sync Clients", kind: "client", x: 80, y: 230, sublabel: "Desktop, mobile, web" },
      { id: "edge-cdn", label: "CDN and Edge", kind: "cdn", x: 240, y: 90, sublabel: "Block downloads" },
      { id: "api-gateway", label: "API Gateway", kind: "gateway", x: 240, y: 250, sublabel: "Auth, routing, limits" },
      { id: "sync-service", label: "Sync Service", kind: "service", x: 420, y: 250, sublabel: "Delta, commit orchestration" },
      { id: "metadata-service", label: "Metadata Service", kind: "service", x: 600, y: 185, sublabel: "Versions, journal, ACLs" },
      { id: "block-service", label: "Block Service", kind: "service", x: 600, y: 345, sublabel: "Missing blocks, verify hash" },
      { id: "notification-service", label: "Notification Service", kind: "service", x: 420, y: 440, sublabel: "Long-poll, streams" },
      { id: "metadata-db", label: "Metadata DB", kind: "database", x: 790, y: 150, sublabel: "Sharded transactions" },
      { id: "block-index-db", label: "Block Index", kind: "database", x: 790, y: 300, sublabel: "Hash to object" },
      { id: "object-store", label: "Object Store", kind: "storage", x: 790, y: 445, sublabel: "Immutable blocks" },
      { id: "event-queue", label: "Change Event Queue", kind: "queue", x: 600, y: 60, sublabel: "Kafka, Pub/Sub" },
    ],
    edges: [
      { from: "client", to: "api-gateway", label: "metadata and upload APIs" },
      { from: "client", to: "edge-cdn", label: "download blocks" },
      { from: "edge-cdn", to: "object-store", label: "origin fetch" },
      { from: "api-gateway", to: "sync-service", label: "route sync request" },
      { from: "sync-service", to: "metadata-service", label: "commit or list delta" },
      { from: "sync-service", to: "block-service", label: "check or upload blocks" },
      { from: "metadata-service", to: "metadata-db", label: "transactional metadata" },
      { from: "block-service", to: "block-index-db", label: "block hash lookup" },
      { from: "block-service", to: "object-store", label: "store verified block" },
      { from: "metadata-service", to: "block-index-db", label: "verify block presence" },
      { from: "metadata-service", to: "event-queue", label: "journal event", dashed: true },
      { from: "event-queue", to: "notification-service", label: "fanout signal", dashed: true },
      { from: "notification-service", to: "client", label: "cursor advanced", dashed: true },
    ],
    captionMD: `
The metadata path commits file versions and namespace journal entries. The data path moves immutable content-addressed blocks through the Block Service, Object Store, and CDN. Notifications tell clients when to fetch deltas, but clients still use the metadata journal as the source of truth.
`,
  },
  architectureNotesMD: `
Dropbox has two very different planes. The control plane is metadata: paths, folders, revisions, permissions, cursors, and journals. It needs transactions, clear conflict handling, and ordered per-namespace changes. The data plane is block transfer: large immutable chunks addressed by hash, stored in object storage, and downloaded through CDN when possible.

Clients are active participants in the design. They watch local filesystem changes, split files into blocks, compute hashes, ask the server which blocks are missing, upload only missing blocks, and then commit a new metadata version. Remote changes are discovered through notification channels, but correctness comes from replaying the delta journal using cursors.

This separation lets the system scale cheaply. Popular blocks can be cached at the edge, duplicate blocks are stored once, metadata services can be sharded by namespace, and notification outages do not corrupt state because clients can always fall back to polling delta cursors.
`,
  requestFlow: [
    {
      title: "Client detects a local file change",
      detailMD: `
The desktop or mobile sync engine receives an OS filesystem event, waits briefly to avoid reading a file still being written, and scans the changed file. It records the local path, previous known revision, file size, modified time, and user namespace.
`,
    },
    {
      title: "Client chunks the file and computes hashes",
      detailMD: `
The client splits the file into blocks, commonly up to 4 MB each, computes a cryptographic hash for every block, and computes a file content hash over the ordered block list. Only changed blocks need to be uploaded.
`,
    },
    {
      title: "Server reports missing blocks",
      detailMD: `
The client starts an upload session with the block hash manifest. The Block Service checks the block index and returns hashes that are not already present or not visible to this upload session. Existing blocks are reused through deduplication.
`,
    },
    {
      title: "Client uploads missing blocks",
      detailMD: `
For each missing block, the client uploads bytes to the Block Service. The server streams the payload, recomputes the hash, rejects mismatches, writes the block to object storage, and records the block hash in the block index.
`,
    },
    {
      title: "Metadata commit creates a new version",
      detailMD: `
After all blocks are present, the client calls the commit endpoint with the base revision and ordered block list. The Metadata Service performs a compare-and-swap against the current file revision, creates a new immutable file version, updates the file node, and appends a namespace journal entry.
`,
    },
    {
      title: "Conflict is handled if the base revision is stale",
      detailMD: `
If another client already committed a different version, the server returns a conflict. The client can create a conflicted copy with a deterministic name, ask the user to merge, or apply product-specific merge logic for simple file types.
`,
    },
    {
      title: "Remote clients receive a notification",
      detailMD: `
The metadata commit publishes a change event to a queue. Notification shards wake connected clients that subscribe to the affected namespace and tell them that their cursor has advanced. The notification does not contain all file bytes.
`,
    },
    {
      title: "Remote clients fetch deltas and download blocks",
      detailMD: `
Each client calls the delta API with its last cursor, updates its local metadata view, compares block hashes against its local block cache, and downloads only missing blocks through signed URLs, object storage, or CDN.
`,
    },
    {
      title: "Version history and restore remain available",
      detailMD: `
Historical file_versions and block references are retained according to policy. A restore operation creates a new metadata commit pointing to an older version's block list rather than mutating history in place.
`,
    },
  ],
  coreComponents: [
    {
      name: "Sync Client",
      kind: "client",
      role: "Watches local changes and reconciles them with cloud state.",
      detailMD: `
The client owns filesystem watching, chunking, hashing, local block cache, upload retries, download scheduling, offline queues, and user-visible conflict copies. It should be conservative: never delete local data solely because a notification was missed, and always reconcile against server cursors.
`,
    },
    {
      name: "Sync Service",
      kind: "service",
      role: "Coordinates upload sessions, delta sync, and client state transitions.",
      detailMD: `
This stateless service accepts manifests, routes block checks to the Block Service, routes commits to the Metadata Service, returns delta pages, and applies rate limits. It keeps metadata operations separate from bulk block transfer.
`,
    },
    {
      name: "Metadata Service",
      kind: "service",
      role: "Maintains the authoritative file tree, versions, permissions, and journals.",
      detailMD: `
The Metadata Service performs transactional commits per namespace, verifies base revisions, enforces ACLs, updates latest file pointers, appends journal entries, and supports restore. It is the source of truth for what file version is visible.
`,
    },
    {
      name: "Block Service",
      kind: "service",
      role: "Stores and verifies immutable content-addressed blocks.",
      detailMD: `
The Block Service checks whether a block hash is already present, verifies uploaded bytes against the declared hash, writes blocks to object storage, records storage locations, and exposes signed download manifests. It should be horizontally scalable and bandwidth-aware.
`,
    },
    {
      name: "Object Store",
      kind: "storage",
      role: "Durably stores immutable block payloads.",
      detailMD: `
Object storage holds the actual bytes, usually with multi-zone replication or erasure coding. Blocks are immutable, so CDN caching is safe. Lifecycle policies move cold versions to cheaper tiers while preserving restore windows.
`,
    },
    {
      name: "Notification Service",
      kind: "service",
      role: "Wakes clients when subscribed namespaces have new changes.",
      detailMD: `
Notification shards maintain long-poll or streaming connections, map users and devices to namespaces, consume change events, and notify clients that a cursor advanced. They do not decide correctness; clients still fetch deltas from the Metadata Service.
`,
    },
    {
      name: "Block Index",
      kind: "database",
      role: "Maps block hashes to object locations and lifecycle metadata.",
      detailMD: `
The block index supports deduplication, missing-block checks, reference accounting, integrity scans, and garbage collection. It should be partitioned by block hash and designed for high read and conditional-write throughput.
`,
    },
    {
      name: "Change Event Queue",
      kind: "queue",
      role: "Decouples metadata commits from notification fanout and background workflows.",
      detailMD: `
Kafka, Pub/Sub, Kinesis, or a similar log receives durable change events. Consumers drive notifications, search indexing, audit logs, ransomware detection, thumbnail generation, and analytics without slowing the commit transaction.
`,
    },
  ],
  deepDives: [
    {
      topic: "File chunking strategy",
      detailMD: `
Chunking determines bandwidth efficiency, deduplication ratio, and client CPU cost. Fixed-size blocks such as 4 MB are simple: a changed 20 MB file becomes about five blocks, and a small edit often affects one block. The drawback is boundary shift. If a byte is inserted near the beginning of a large file, every following fixed block may change even though most content is identical.

Content-defined chunking uses a rolling hash to choose boundaries based on the data itself. It improves deduplication for insertions and shifted content, but it adds CPU cost, more complicated manifests, and variable block sizes. Many interview answers choose fixed 4 MB blocks for operational simplicity, then mention content-defined chunking for workloads where insertions in large files are common.

The client should keep a local block cache and avoid recomputing hashes for unchanged files when reliable filesystem metadata is available. Still, correctness must rely on content hashes, not only timestamps, because clocks and filesystem events can be unreliable.
`,
    },
    {
      topic: "Content-addressable storage and deduplication",
      detailMD: `
Each block is named by a cryptographic hash of its bytes. If two users upload the same block, the Block Service can store one physical copy and let multiple file versions reference it. This is powerful for common binaries, shared team files, synced photos, and repeated edits that preserve most blocks.

Deduplication has boundaries. Global dedup maximizes savings but can leak information if an attacker can infer that a block already exists. Safer designs deduplicate within a tenant, within a storage region, or only after authorization checks. The server must also verify uploaded bytes because clients cannot be trusted to claim arbitrary hashes.

Hash collisions are extremely unlikely with SHA-256, but the system should still treat the hash as an integrity check, store block size, and optionally verify stronger content fingerprints for critical paths. Blocks should be immutable once written; a new byte sequence gets a new hash and a new object.
`,
    },
    {
      topic: "Metadata commits, journals, and versioning",
      detailMD: `
The file tree is not stored as mutable bytes in object storage. It is metadata: namespace, folder hierarchy, file nodes, latest revision pointers, historical revisions, permissions, and journal sequence numbers. A commit should atomically create the version record, attach ordered block references, update the file node, and append a journal event.

The namespace journal is the sync source of truth. A client with cursor 100 asks for changes after 100, receives ordered events, applies them locally, and stores the next cursor. If the cursor is too old because compaction removed old journal pages, the client performs a full rescan of metadata for that namespace.

Restores should not mutate old history. Restoring a prior version creates a new latest revision that points to the old block list. This keeps auditability clear and avoids races with clients that already observed newer revisions.
`,
    },
    {
      topic: "Delta sync and download planning",
      detailMD: `
Delta sync means only changed metadata and missing blocks move over the network. Upload starts with a manifest of hashes, the server returns missing hashes, and the client uploads only those blocks. Download starts with the delta journal, then the client compares the required block hashes against its local block cache.

Clients need a scheduler. User-opened files and small metadata changes should download first. Large media, cold folders, and selective-sync excluded paths can wait. The scheduler should pause on metered networks, resume partial downloads, back off on errors, and avoid monopolizing user bandwidth.

For very large files, block-level resume is essential. A 10 GB file should not restart from zero after a laptop sleeps. The manifest, block hashes, and committed revision give the client a precise checklist of what remains.
`,
    },
    {
      topic: "Notifications, long-poll, and convergence",
      detailMD: `
The Notification Service improves latency but should not be required for correctness. It tells clients that something changed, usually by namespace and cursor watermark. Clients then call the delta API to fetch authoritative ordered changes.

Long-poll is common because it works through firewalls and mobile networks. A client opens a request that waits until a change occurs or a timeout expires. To scale to tens of millions of clients, shard connections by user or namespace, use jittered reconnects, and keep payloads tiny. WebSockets or HTTP streaming can reduce reconnect churn but add connection management complexity.

If notifications are dropped, clients still converge through periodic delta polling. If duplicate notifications arrive, the cursor makes processing idempotent. This separation prevents the notification layer from corrupting file state.
`,
    },
    {
      topic: "Conflict resolution for concurrent edits",
      detailMD: `
Concurrent edits are unavoidable because clients work offline. The server compares the client's base revision with the current latest revision. If they match, the commit advances the file. If they differ, the server rejects overwrite-if-current and asks the client to create a conflicted copy or run a merge flow.

A typical default is last writer does not silently win for opaque binary files. Instead, create a filename such as spec conflicted copy from Alice laptop and preserve both versions. For text documents or product-owned collaborative formats, a higher-level merge engine can combine changes, but generic Dropbox-style storage should not assume it can safely merge arbitrary bytes.

Conflicts should be visible in the metadata journal so every device converges to the same files. Users can later delete, rename, or manually merge the conflicted copy.
`,
    },
  ],
  scaling: [
    {
      stage: "Prototype: single region with whole-file uploads",
      detailMD: `
Start with a web API, relational metadata database, object storage for complete files, and simple per-user folders. This proves auth, upload, download, listing, and sharing, but it wastes bandwidth on repeated whole-file uploads.
`,
    },
    {
      stage: "Growth: chunking, deduplication, and delta sync",
      detailMD: `
Introduce client chunking, block hashes, upload sessions, content-addressed block storage, and a metadata commit step. Add a namespace journal and delta endpoint so clients sync changes instead of rescanning all files.
`,
    },
    {
      stage: "Large scale: sharded metadata and object-store data plane",
      detailMD: `
Shard metadata by namespace or team, move blocks to a dedicated object-store data plane, partition the block index by hash, and deploy block upload workers independently from metadata services. Use CDN for downloads and queues for notifications and indexing.
`,
    },
    {
      stage: "Global scale: regional sync and exabyte storage",
      detailMD: `
Place clients in the nearest region, keep metadata home regions for namespaces, replicate block objects across regions or fetch on demand, and serve downloads from regional object storage plus CDN. Use erasure coding and lifecycle tiers to control exabyte-scale cost.
`,
    },
    {
      stage: "Enterprise scale: governance, recovery, and tenant isolation",
      detailMD: `
Add team namespaces, admin policy engines, audit logs, legal holds, malware scanning, data loss prevention, device trust, ransomware detection, and tenant-aware dedup boundaries. Isolate noisy tenants with quotas and per-namespace rate limits.
`,
    },
  ],
  bottlenecks: [
    {
      issue: "Metadata hot namespaces",
      optimizationMD: `
A large shared folder or enterprise namespace can concentrate commits, list operations, and journal reads. Partition by namespace and, for very large namespaces, subpartition by folder or journal range. Use per-namespace write leaders, cache folder listings, and isolate team spaces that create hot spots.
`,
    },
    {
      issue: "Object-store bandwidth and upload spikes",
      optimizationMD: `
Block uploads and downloads dominate bandwidth. Scale the Block Service separately, support direct-to-object-store uploads with signed URLs after authorization, use regional ingress, apply client backoff, and serve popular downloads through CDN.
`,
    },
    {
      issue: "Block index write amplification",
      optimizationMD: `
Every uploaded block checks and possibly updates the block index. Batch missing-block checks, use partitioning by hash, keep idempotent conditional writes, and make reference counts approximate so commits do not synchronously update a hot counter.
`,
    },
    {
      issue: "Notification reconnect storms",
      optimizationMD: `
Mobile networks, regional outages, or deployments can cause millions of clients to reconnect. Use jitter, exponential backoff, connection draining, regional shards, lightweight tokens, and periodic polling fallback instead of immediate reconnect loops.
`,
    },
    {
      issue: "Small-file metadata overhead",
      optimizationMD: `
Many tiny files create more metadata and journal pressure than storage pressure. Batch client commits where safe, compress metadata pages, optimize folder listing indexes, and avoid forcing each small file through heavyweight global transactions.
`,
    },
    {
      issue: "Cold version retention cost",
      optimizationMD: `
Versioning keeps old block references and can preserve blocks long after users stop reading them. Use lifecycle tiers, retention policies by plan, garbage collection after legal holds expire, and restore manifests that can read from cold storage asynchronously.
`,
    },
  ],
  failureHandling: [
    {
      scenario: "Client crashes or loses network during upload",
      strategyMD: `
Upload sessions are resumable and expire after a bounded time. Already uploaded blocks remain content-addressed and idempotent. The file is not visible until the metadata commit succeeds, so partial uploads cannot create corrupt latest versions.
`,
    },
    {
      scenario: "Object store write succeeds but metadata commit fails",
      strategyMD: `
The block remains unreferenced and safe. A background garbage collector later removes blocks that are not referenced by any committed version and are older than the upload-session grace period. The client retries commit or restarts the session.
`,
    },
    {
      scenario: "Metadata database partition",
      strategyMD: `
Prefer correctness over accepting conflicting writes. Route a namespace to its metadata leader or quorum. If the leader is unavailable, pause commits for that namespace and continue serving cached reads or local client files where possible. Replay the journal after recovery.
`,
    },
    {
      scenario: "Notification service outage",
      strategyMD: `
Clients fall back to periodic delta polling with exponential backoff. Metadata commits continue because notification fanout is asynchronous. When the service recovers, clients compare cursors and fetch any missed changes from the journal.
`,
    },
    {
      scenario: "Corrupt or missing block detected",
      strategyMD: `
Block downloads verify hashes. If verification fails, the client retries another replica or region. Server-side integrity scanners compare object bytes to block hashes and repair from replicas. Metadata should never point to blocks that failed commit-time existence checks.
`,
    },
    {
      scenario: "Regional outage",
      strategyMD: `
Route users to a healthy region for reads when replicated blocks and metadata are available. For namespaces homed in the failed region, allow read-only access from replicas if safe and queue writes or fail over leadership only through a controlled recovery process that preserves journal ordering.
`,
    },
  ],
  security: [
    {
      label: "Authentication and authorization",
      detailMD: `
Every metadata and block operation must authenticate the user or device and authorize access to the namespace, file, folder, or shared link. Signed block URLs should be short-lived and scoped to specific blocks and versions.
`,
    },
    {
      label: "Encryption and key management",
      detailMD: `
Use TLS for all traffic and encrypt blocks and metadata at rest. Large enterprises may require tenant-specific keys, key rotation, device revocation, and integration with customer-managed key systems.
`,
    },
    {
      label: "Deduplication privacy",
      detailMD: `
Global deduplication can reveal whether another user has a known file if APIs expose block-exists behavior too freely. Restrict missing-block checks to authenticated upload sessions, consider tenant-scoped dedup, and avoid returning sensitive existence signals.
`,
    },
    {
      label: "Shared link controls",
      detailMD: `
Shared links need unguessable tokens, optional passwords, expiration, download limits, domain restrictions, revocation, and audit logs. Revocation should invalidate cached download manifests and signed URLs quickly.
`,
    },
    {
      label: "Malware and abuse scanning",
      detailMD: `
Public links can distribute malware or illegal content. Scan uploads and popular shared downloads asynchronously, quarantine suspicious files, block known-bad hashes, and support abuse takedown workflows.
`,
    },
    {
      label: "Ransomware and mass deletion protection",
      detailMD: `
Detect unusual bulk renames, encryptions, deletes, and version churn. Alert users or admins, slow suspicious clients, and provide point-in-time restore using version history and namespace journals.
`,
    },
  ],
  tradeoffs: {
    pros: [
      "Block-level sync dramatically reduces bandwidth for edits to large files.",
      "Content-addressable storage enables deduplication and strong integrity checks.",
      "Separating metadata from block storage lets each plane scale independently.",
      "Namespace journals give clients a clean convergence model after offline periods.",
      "Immutable versions make restore, audit, and conflict handling easier to reason about.",
    ],
    cons: [
      "Chunking and hashing add client CPU, battery, implementation, and debugging complexity.",
      "Metadata correctness is harder than simple object upload because paths, versions, shares, and cursors interact.",
      "Global deduplication improves cost but raises privacy and tenant-isolation concerns.",
      "Notification infrastructure for millions of clients is operationally complex even though it is not the source of truth.",
      "Version retention and restore windows increase storage cost and garbage-collection complexity.",
    ],
    alternativesMD: `
Alternative one is whole-file storage. It is simple and works for small products, but re-uploading a 2 GB file for a tiny edit is unacceptable at scale.

Alternative two is file-system-level replication with a distributed consensus group per folder. It gives strong semantics for narrow workloads but is too heavy for hundreds of millions of consumer clients that are often offline.

Alternative three is application-specific collaboration, such as a document editor with operational transform or CRDTs. That can merge text edits in real time, but Dropbox must store arbitrary files where the service cannot understand the content safely.
`,
    whenNotToUseMD: `
Do not use a generic Dropbox-style file sync system when the product requires real-time multi-user editing of structured documents, low-latency transactional databases, or strict POSIX filesystem semantics across machines. Those require collaboration engines, databases, or distributed filesystems with different consistency and locking models.
`,
  },
  followUpQuestions: [
    {
      question: "Why split files into blocks instead of uploading whole files?",
      answerMD: `
Blocks make sync bandwidth proportional to changed bytes rather than total file size. If a 2 GB video project changes one 4 MB block, the client can upload one block plus metadata instead of 2 GB. Blocks also enable deduplication across versions and users.
`,
    },
    {
      question: "How do you know whether the server already has a block?",
      answerMD: `
The client computes block hashes and sends the manifest during an upload session. The Block Service checks the block index by hash and returns only missing hashes. The server still verifies uploaded bytes against the hash before storing them.
`,
    },
    {
      question: "How is a concurrent edit handled?",
      answerMD: `
Each commit includes the client's base revision. If the current server revision still equals that base, the commit succeeds. If not, the client creates a conflicted copy or invokes a merge flow. The system should not silently overwrite arbitrary binary data.
`,
    },
    {
      question: "What is the source of truth for remote changes?",
      answerMD: `
The namespace delta journal is the source of truth. Notifications only wake clients and tell them to fetch deltas. If a notification is missed, the client later polls with its cursor and still converges.
`,
    },
    {
      question: "How do you delete blocks safely when versions share them?",
      answerMD: `
Treat blocks as immutable and reference-counted or mark-and-sweeped through version metadata. A block can be garbage-collected only after no retained file version, shared link, legal hold, or upload session references it.
`,
    },
    {
      question: "How should shared folders affect sync?",
      answerMD: `
A shared folder is usually a namespace or namespace mount with its own journal and ACLs. Members subscribe to that namespace, receive cursor notifications, and sync only changes they are permitted to see. Permission changes must also appear in the journal.
`,
    },
    {
      question: "How do you recover from ransomware that encrypts many files?",
      answerMD: `
Use anomaly detection on bulk rewrites and deletes, slow or quarantine suspicious clients, and provide point-in-time restore. Since every rewrite creates versions, the system can restore a namespace to a clean cursor before the attack if retention has not expired.
`,
    },
  ],
  companyVariations: [
    {
      company: "Amazon",
      angleMD: `
Amazon interviewers may push on S3-style object durability, DynamoDB-style partitioning for block indexes, cost controls, lifecycle tiers, and failure isolation. Be ready to discuss direct uploads, conditional metadata commits, and how deduplication reduces exabyte storage spend.
`,
    },
    {
      company: "Microsoft",
      angleMD: `
Microsoft often frames this around OneDrive, SharePoint, Teams, enterprise identity, compliance, and Windows clients. Emphasize ACL inheritance, tenant isolation, audit logs, device management, customer keys, and conflict behavior for Office and non-Office files.
`,
    },
    {
      company: "Google",
      angleMD: `
Google tends to probe global metadata consistency, tail latency, efficient sync at massive scale, and operational simplicity. Expect follow-ups on namespace journals, chunking strategy, cross-region replication, and the difference between Drive-like storage and Docs-like collaboration.
`,
    },
    {
      company: "Meta",
      angleMD: `
Meta may focus on media-heavy uploads, CDN downloads, privacy boundaries, abuse scanning, and high fanout notifications. Discuss hot shared content, photo and video deduplication, async pipelines, and resilient mobile sync.
`,
    },
    {
      company: "Databricks",
      angleMD: `
Databricks can angle the question toward large datasets, data lake storage, metadata catalogs, consistency of manifests, and cost-aware object storage. Explain why immutable blocks and version manifests resemble snapshot-based data systems.
`,
    },
  ],
  relatedQuestions: [
    {
      slug: "google-drive",
      note: "Closely related cloud file storage with additional collaboration and document semantics.",
    },
    {
      slug: "cloud-storage",
      note: "Dropbox relies on durable object storage, lifecycle tiers, and multi-region replication.",
    },
    {
      slug: "key-value-store",
      note: "Block indexes and metadata shards rely on fast key-based lookups and partitioning.",
    },
    {
      slug: "distributed-cache",
      note: "Download manifests, folder listings, and hot block metadata benefit from careful caching.",
    },
    {
      slug: "notification-service",
      note: "Sync clients need scalable long-poll or push notification when remote changes arrive.",
    },
  ],
  interviewTips: {
    commonMistakes: [
      "Uploading whole files on every edit and ignoring block-level delta sync.",
      "Mixing file bytes and metadata in one transactional database.",
      "Using notifications as the source of truth instead of a replayable delta journal.",
      "Silently applying last-writer-wins to arbitrary concurrent file edits.",
      "Ignoring deduplication privacy and shared-link authorization.",
    ],
    redFlags: [
      "No concrete capacity math for block storage, metadata growth, or notification fanout.",
      "No plan for offline clients and stale base revisions.",
      "No distinction between immutable blocks and mutable file metadata.",
      "No restore, versioning, or garbage-collection strategy.",
      "No answer for large shared folders or hot namespaces.",
    ],
    expectations: [
      "State assumptions and compute commits per second, logical ingest, unique block ingest, metadata growth, and fanout.",
      "Draw separate metadata, block, object-store, CDN, and notification paths.",
      "Explain chunking, content-addressed blocks, deduplication, and hash verification.",
      "Use metadata commits with base revisions and namespace journals for convergence.",
      "Discuss conflict copies, version restore, sharing permissions, and security controls.",
      "Call out scaling and failure modes for clients, metadata shards, object storage, and notifications.",
    ],
    communicationMD: `
Lead with the core invariant: a file version is an immutable ordered list of block hashes plus metadata. Then draw the client-driven upload flow: chunk, hash, check missing blocks, upload missing blocks, commit metadata, publish journal, notify other clients. This communicates bandwidth efficiency and correctness before adding CDN, sharing, restore, and enterprise features.

When tradeoffs appear, tie them to the workload. Fixed blocks are simpler than content-defined chunks, global dedup saves storage but affects privacy, notifications improve latency but journals provide correctness, and conflict copies are safer than pretending the service can merge arbitrary bytes.
`,
  },
  revisionNotesMD: `
- Dropbox-style sync separates **metadata** from **block bytes**. Metadata tracks paths, versions, permissions, and journals; object storage holds immutable content-addressed blocks.
- Clients chunk files, commonly around 4 MB per block, compute block hashes, and upload only missing blocks. This enables delta sync and deduplication.
- A file version is an immutable ordered list of block hashes plus size and metadata. Restoring a version creates a new commit pointing to an older block list.
- The Metadata Service must commit version records, latest pointers, and namespace journal entries atomically within a namespace.
- The namespace journal and cursor are the source of truth for sync. Notifications only wake clients so they can fetch deltas.
- Capacity is dominated by block storage and bandwidth: with 2B commits per day and 2 MB average changed payload, logical ingress is about 4 PB per day. At 40 percent unique physical storage, that is about 1.6 PB per day.
- Deduplication saves exabytes over time, but global dedup can leak information. Tenant-scoped or authorization-aware dedup is safer for enterprise workloads.
- Concurrent edits should compare against a base revision. For arbitrary files, create conflicted copies rather than silently overwriting.
- Large-scale bottlenecks include hot namespaces, object-store bandwidth, block index pressure, notification reconnect storms, and cold version retention.
- Security requires strong auth, ACLs, encrypted storage, short-lived signed URLs, shared-link controls, malware scanning, audit logs, and ransomware recovery.
`,
  flashcards: [
    {
      front: "What is the core data model for a Dropbox file version?",
      back: "An immutable metadata version that points to an ordered list of content-addressed block hashes, plus size, timestamps, actor, and journal sequence.",
    },
    {
      front: "Why chunk files into blocks?",
      back: "Chunking lets clients upload and download only changed or missing blocks, reducing bandwidth and enabling deduplication across files and versions.",
    },
    {
      front: "What does content-addressable storage mean?",
      back: "A block is identified by a cryptographic hash of its bytes. The same bytes produce the same hash and can be stored once and referenced many times.",
    },
    {
      front: "Why are notifications not the source of truth?",
      back: "Notifications can be delayed, duplicated, or dropped. The replayable namespace delta journal and cursor determine the authoritative ordered changes.",
    },
    {
      front: "How does Dropbox handle concurrent edits to binary files?",
      back: "It compares the client base revision to the current revision and creates a conflicted copy or merge flow instead of silently overwriting arbitrary bytes.",
    },
    {
      front: "What is the purpose of the block index?",
      back: "It maps block hashes to storage locations and lifecycle metadata so the service can check missing blocks, deduplicate, verify integrity, and garbage-collect safely.",
    },
    {
      front: "Why separate metadata storage from object storage?",
      back: "Metadata needs transactions and ordered journals, while object bytes need cheap durable high-bandwidth storage and CDN delivery.",
    },
    {
      front: "How does version restore work?",
      back: "A restore creates a new metadata commit pointing to an older retained block list, preserving history instead of mutating old versions.",
    },
  ],
  quiz: [
    {
      question: "What is the best reason to split files into blocks for Dropbox-style sync?",
      options: ["It removes the need for metadata", "It lets clients sync only changed or missing bytes", "It guarantees no user ever has conflicts", "It makes object storage unnecessary"],
      answerIndex: 1,
      explanationMD: `
Block-level sync makes bandwidth proportional to changed blocks rather than whole file size. Metadata, conflicts, and object storage are still required.
`,
    },
    {
      question: "Which component is the source of truth for remote changes missed while a client was offline?",
      options: ["CDN cache", "Notification connection", "Namespace delta journal", "Local filesystem timestamp"],
      answerIndex: 2,
      explanationMD: `
The namespace delta journal provides ordered replay from a cursor. Notifications only tell the client to check for new journal entries.
`,
    },
    {
      question: "Why should the server verify a block hash after upload?",
      options: ["Clients may be buggy or malicious", "It reduces the number of metadata tables", "It disables deduplication", "It replaces authentication"],
      answerIndex: 0,
      explanationMD: `
The server cannot trust a client-provided hash. It must hash the received bytes and confirm that the payload matches the declared content address before storing or committing it.
`,
    },
    {
      question: "What should happen when a client commits based on a stale file revision?",
      options: ["Always overwrite the latest version", "Delete the older version immediately", "Return a conflict and create a conflicted copy or merge flow", "Store the file without a journal entry"],
      answerIndex: 2,
      explanationMD: `
For arbitrary files, silent last-writer-wins can lose data. Comparing base revisions lets the system preserve both edits and expose a conflict.
`,
    },
    {
      question: "Given 2B commits per day, what is the approximate average commit QPS?",
      options: ["2,300 per second", "23,000 per second", "230,000 per second", "2.3M per second"],
      answerIndex: 1,
      explanationMD: `
2B divided by 86,400 seconds is about 23,148 commits per second, rounded to 23,000.
`,
    },
    {
      question: "What is a major privacy concern with global block deduplication?",
      options: ["It makes blocks mutable", "It may reveal whether another tenant already has known content", "It prevents restore", "It requires all files to be public"],
      answerIndex: 1,
      explanationMD: `
If APIs expose whether a hash already exists globally, an attacker may infer that another user or tenant has a known file. Tenant-scoped or authorization-aware dedup reduces that risk.
`,
    },
    {
      question: "Why is object storage a good fit for block payloads?",
      options: ["Blocks are immutable and large compared with metadata records", "Object storage provides per-file path transactions", "It eliminates encryption needs", "It stores notification cursors faster than databases"],
      answerIndex: 0,
      explanationMD: `
Immutable blocks are durable byte objects that can be stored cheaply, replicated or erasure-coded, and served through CDN. Metadata transactions remain in a separate database.
`,
    },
  ],
  cheatSheetMD: `
**Goal**: design Dropbox, a cloud file sync and storage system with block-level delta sync, durable versions, sharing, and low-latency cross-device propagation.

**Core idea**: clients chunk files into blocks, compute hashes, upload only missing blocks, then commit metadata. A file version is an ordered list of immutable block hashes.

**Data plane**: Block Service verifies hashes, stores immutable blocks in object storage, records block hash to object location, and serves downloads through signed URLs and CDN.

**Control plane**: Metadata Service stores namespaces, folder tree, latest revisions, version history, shares, and namespace journals. Commits use base revisions to detect conflicts.

**Sync flow**: local change detected, chunk and hash, ask server for missing blocks, upload missing blocks, commit version, append journal, publish notification, remote clients fetch deltas and download missing blocks.

**Capacity**: with 2B commits per day and 2 MB average changed payload, logical ingress is about 4 PB per day. At 40 percent unique physical data, store about 1.6 PB per day before redundancy, reaching exabytes over time.

**Consistency**: notifications are best-effort wakeups. Cursors and namespace journals provide correctness and convergence for offline clients.

**Conflicts**: compare client base revision to latest revision. If stale, create a conflicted copy or explicit merge flow. Do not silently overwrite arbitrary files.

**Storage optimization**: fixed 4 MB chunks are simple; content-defined chunks improve insertion dedup but cost more CPU. Dedup saves storage, but respect tenant privacy.

**Security**: enforce auth and ACLs, encrypt at rest and in transit, scope signed URLs, secure shared links, scan malware, audit enterprise access, and support ransomware restore.
`,
  references: [
    {
      title: "Designing Data-Intensive Applications",
      kind: "Book",
      author: "Martin Kleppmann",
    },
    {
      title: "Dropbox Tech Blog Infrastructure",
      kind: "Blog",
      url: "https://dropbox.tech/infrastructure",
      author: "Dropbox",
    },
    {
      title: "Amazon S3 User Guide",
      kind: "Docs",
      url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html",
      author: "Amazon Web Services",
    },
    {
      title: "The Tail at Scale",
      kind: "Paper",
      url: "https://research.google/pubs/the-tail-at-scale/",
      author: "Jeffrey Dean and Luiz Andre Barroso",
    },
  ],
};
