import type { SDQuestionContent } from "../types";

export const redditContent: SDQuestionContent = {
  slug: "reddit",
  statementMD: `
Design Reddit, a community-based forum platform where users join communities, submit posts, discuss them in nested comment trees, and vote content up or down. The platform must expose fresh community listings, personalized home feeds, and deep discussion threads while keeping reads fast and votes responsive.

At interview scale, assume hundreds of millions of users, millions of communities, billions of daily listing and thread reads, and extremely spiky voting on viral posts. The core challenge is not simple CRUD; it is ranking content with time decay, maintaining vote counts without turning hot posts into write bottlenecks, rendering deep comment trees efficiently, and keeping cached listings fresh enough for users.

The default design should optimize for high read throughput, eventual but trustworthy vote counters, safe moderation, and low-latency ranking reads. Exact global ordering is less important than stable pagination, abuse resistance, and graceful degradation during viral traffic or ranking pipeline lag.
`,
  businessUseCaseMD: `
Reddit-like forums create durable interest-based communities. Users return because each community has its own norms, moderators, ranking dynamics, and discussion history. The product value comes from surfacing the right post at the right time and making comments easy to navigate even when a thread becomes massive.

For businesses, the same design powers community support forums, enterprise knowledge communities, creator fan spaces, and social discovery products. Ranking, moderation, and personalization determine trust and engagement as much as raw storage or API throughput.
`,
  functionalRequirements: [
    "Create, update, and browse communities with names, rules, visibility, moderators, and subscriber counts.",
    "Create posts with text, link, media metadata, tags, and community membership validation.",
    "Create nested comments under posts or other comments and render deep discussion trees with pagination.",
    "Allow authenticated users to upvote, downvote, change, or remove one active vote per post or comment.",
    "Show subreddit listings sorted by hot, new, top, controversial, and optionally rising.",
    "Show personalized home feeds composed from subscribed communities and user interests.",
    "Support moderation actions such as remove, lock, approve, report review, spam quarantine, and user bans.",
    "Expose approximate counts for score, upvotes, downvotes, comments, subscribers, and active users.",
  ],
  nonFunctionalRequirements: [
    {
      label: "Latency",
      detailMD: `
Community and home listing reads should return in under 150ms p99 from cache or a precomputed listing store. Comment thread first page should return in under 200ms p99. Vote acknowledgement should target under 100ms p99 because voting feels interactive, but final aggregate counters may lag by seconds.
`,
    },
    {
      label: "Availability",
      detailMD: `
Reading communities and comment threads should remain available during ranking, moderation enrichment, or analytics degradation. Voting can degrade to durable queue acceptance with delayed counters, but users should not see the entire site fail because one ranking pipeline is behind.
`,
    },
    {
      label: "Read-heavy scalability",
      detailMD: `
Listings and comment pages dominate traffic. The architecture should serve most reads from CDN, edge caches, Redis, and materialized listing stores while scaling write-heavy vote ingestion separately through append logs and sharded counters.
`,
    },
    {
      label: "Eventual consistency",
      detailMD: `
Scores, comment counts, subscriber counts, and rankings can be eventually consistent. The system must still enforce per-user vote uniqueness, avoid double-counting repeated vote retries, and preserve read-your-own-vote in the UI.
`,
    },
    {
      label: "Ranking freshness",
      detailMD: `
Hot and best rankings should react to new votes within seconds for active content and within minutes for cold content. Ranking freshness can be tiered so viral communities receive more frequent recomputation than inactive communities.
`,
    },
    {
      label: "Abuse resistance",
      detailMD: `
The platform must resist spam posts, vote brigading, bot accounts, harassment, and moderator abuse. Rate limits, trust scores, anti-sybil features, audit logs, and policy queues are first-class requirements, not add-ons.
`,
    },
    {
      label: "Durability",
      detailMD: `
Posts, comments, moderation decisions, and vote intent should be durably stored before acknowledgement. Derived rankings, caches, counters, and feeds may be rebuilt from primary content records and vote events.
`,
    },
  ],
  capacityEstimation: {
    assumptionsMD: `
Assume 500M monthly active users, 100M daily active users, 2M active communities, 10M new posts per day, 100M new comments per day, and 1B vote mutations per day. Each daily active user reads about 50 listing pages and 25 comment pages per day.

Assume an average post serving record is 2 KB, an average comment record is 1 KB, and each retained vote mutation or dedupe record averages 120 bytes before replication and indexing. Peak site traffic is 10 times average, while a single viral post or comment can experience much higher target-local vote contention.
`,
    metrics: [
      {
        label: "Daily active users",
        value: "100M DAU",
        note: "Large global social product scale",
      },
      {
        label: "Listing reads",
        value: "5B pages per day",
        note: "100M users times 50 listing pages per day",
      },
      {
        label: "Average listing QPS",
        value: "58,000 reads per second",
        note: "5B divided by 86,400 seconds",
      },
      {
        label: "Peak listing QPS",
        value: "580,000 reads per second",
        note: "10x average peak across home and community feeds",
      },
      {
        label: "Comment thread reads",
        value: "2.5B pages per day",
        note: "100M users times 25 comment pages per day",
      },
      {
        label: "Average comment read QPS",
        value: "29,000 reads per second",
        note: "2.5B divided by 86,400 seconds",
      },
      {
        label: "Post writes",
        value: "116 writes per second average",
        note: "10M posts per day divided by 86,400 seconds",
      },
      {
        label: "Comment writes",
        value: "1,200 writes per second average",
        note: "100M comments per day divided by 86,400 seconds, rounded up",
      },
      {
        label: "Vote mutations",
        value: "11,600 writes per second average",
        note: "1B votes per day divided by 86,400 seconds",
      },
      {
        label: "Peak vote mutations",
        value: "116,000 writes per second",
        note: "10x average peak before single-target viral amplification",
      },
      {
        label: "Daily raw content storage",
        value: "120 GB per day",
        note: "10M posts times 2 KB plus 100M comments times 1 KB",
      },
      {
        label: "Daily vote storage",
        value: "120 GB per day",
        note: "1B vote dedupe or mutation records times 120 bytes",
      },
      {
        label: "Replicated annual storage",
        value: "250 to 350 TB per year",
        note: "Content plus vote records with 3x replication, indexes, and compaction overhead",
      },
      {
        label: "Listing cache memory",
        value: "1 to 2 TB",
        note: "Hot listings for active communities, home-feed slices, cursors, and Redis object overhead",
      },
    ],
    calculationsMD: `
- Listing reads: 100M daily active users times 50 listing pages is 5B listing page reads per day. 5B divided by 86,400 seconds is about 57,870 reads per second, rounded to 58,000. A 10x peak gives about 580,000 listing reads per second.
- Comment reads: 100M daily active users times 25 comment pages is 2.5B comment page reads per day. 2.5B divided by 86,400 seconds is about 28,935 reads per second, rounded to 29,000.
- Posts: 10M posts per day divided by 86,400 seconds is about 116 posts per second on average.
- Comments: 100M comments per day divided by 86,400 seconds is about 1,157 comments per second, rounded to 1,200. Peak comment writes at 10x are about 12,000 per second.
- Votes: 1B vote mutations per day divided by 86,400 seconds is about 11,574 votes per second, rounded to 11,600. A 10x peak is about 116,000 vote writes per second.
- Content storage: 10M posts times 2 KB is about 20 GB per day. 100M comments times 1 KB is about 100 GB per day. Together that is about 120 GB raw per day.
- Vote storage: 1B vote records times 120 bytes is about 120 GB raw per day. If the system keeps both latest vote state and immutable vote events, budget more.
- Annual storage: 240 GB raw per day for content plus votes is about 88 TB raw per year. With 3x replication, secondary indexes, materialized views, tombstones, and compaction headroom, plan for roughly 250 to 350 TB per year.
- Listing cache: if 2M active communities keep 500 listing entries per common sort and each cached entry plus metadata averages a few hundred bytes, raw listing snapshots can reach hundreds of GB. Redis overhead, home-feed slices, and replication make 1 to 2 TB a reasonable hot cache budget.
`,
  },
  apiDesign: {
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/communities",
        descriptionMD: `
Creates a community with a globally unique name, initial rules, visibility, and moderator owner. The name claim must be atomic because community names are user-visible.
`,
        request: `
{
  "name": "systems",
  "title": "System Design Discussions",
  "description": "Architecture tradeoffs and design reviews",
  "visibility": "public",
  "rules": ["Be respectful", "No spam"]
}
`,
        response: `
{
  "communityId": "sub_123",
  "name": "systems",
  "createdAt": "2026-07-26T07:10:00Z",
  "moderators": ["user_123"]
}
`,
        statusCodes: [
          { code: 201, meaning: "Community created" },
          { code: 400, meaning: "Invalid name, rules, or visibility" },
          { code: 401, meaning: "Authentication required" },
          { code: 409, meaning: "Community name already exists" },
          { code: 429, meaning: "Rate limit exceeded" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/communities/{communityName}/posts",
        descriptionMD: `
Creates a post in a community. The write path validates membership, community rules, spam signals, media metadata, and moderator restrictions before storing the post and emitting ranking events.
`,
        request: `
{
  "authorId": "user_123",
  "title": "How should vote counters be sharded?",
  "type": "text",
  "body": "Looking for tradeoffs between exact and approximate counters.",
  "tags": ["discussion"]
}
`,
        response: `
{
  "postId": "post_789",
  "communityName": "systems",
  "score": 1,
  "commentCount": 0,
  "createdAt": "2026-07-26T07:11:00Z",
  "status": "visible"
}
`,
        statusCodes: [
          { code: 201, meaning: "Post created" },
          { code: 400, meaning: "Invalid post payload" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "User cannot post in this community" },
          { code: 429, meaning: "Rate limit exceeded" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/posts/{postId}/comments",
        descriptionMD: `
Creates a top-level or nested comment. The parentCommentId is omitted for top-level comments and supplied for replies. The service returns a path and cursor metadata so the client can place the comment optimistically.
`,
        request: `
{
  "authorId": "user_456",
  "parentCommentId": "comment_111",
  "body": "A sharded counter plus periodic compaction works well."
}
`,
        response: `
{
  "commentId": "comment_222",
  "postId": "post_789",
  "parentCommentId": "comment_111",
  "path": "0001.0004.0002",
  "depth": 3,
  "score": 1,
  "createdAt": "2026-07-26T07:12:00Z"
}
`,
        statusCodes: [
          { code: 201, meaning: "Comment created" },
          { code: 400, meaning: "Invalid comment or parent" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Post locked or user banned" },
          { code: 404, meaning: "Post or parent comment not found" },
        ],
      },
      {
        method: "PATCH",
        path: "/api/v1/votes",
        descriptionMD: `
Sets the caller's active vote on a post or comment. Direction is 1 for upvote, -1 for downvote, and 0 to remove the vote. The operation is idempotent for the same user, target, and requestId.
`,
        request: `
{
  "userId": "user_123",
  "targetType": "post",
  "targetId": "post_789",
  "direction": 1,
  "requestId": "req_abc"
}
`,
        response: `
{
  "targetId": "post_789",
  "myVote": 1,
  "scoreEstimate": 342,
  "counterFreshnessMs": 1800
}
`,
        statusCodes: [
          { code: 200, meaning: "Vote updated" },
          { code: 400, meaning: "Invalid target type or direction" },
          { code: 401, meaning: "Authentication required" },
          { code: 404, meaning: "Target not found" },
          { code: 429, meaning: "Vote rate limit exceeded" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/communities/{communityName}/posts",
        descriptionMD: `
Returns a paginated community listing sorted by hot, new, top, controversial, or rising. The cursor encodes sort, score boundary, time bucket, and tie-breaker post id to keep pagination stable.
`,
        response: `
{
  "communityName": "systems",
  "sort": "hot",
  "items": [
    {
      "postId": "post_789",
      "title": "How should vote counters be sharded?",
      "score": 342,
      "commentCount": 91,
      "rank": 1
    }
  ],
  "nextCursor": "hot_20260726_rank_001"
}
`,
        statusCodes: [
          { code: 200, meaning: "Listing returned" },
          { code: 400, meaning: "Invalid sort or cursor" },
          { code: 404, meaning: "Community not found" },
          { code: 429, meaning: "Read rate limit exceeded" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/posts/{postId}/comments",
        descriptionMD: `
Returns a comment tree page for a post. The response includes top-level comments, a bounded number of descendants per branch, and continuation cursors for collapsed children.
`,
        response: `
{
  "postId": "post_789",
  "sort": "best",
  "comments": [
    {
      "commentId": "comment_111",
      "parentCommentId": null,
      "depth": 0,
      "score": 88,
      "children": [
        {
          "commentId": "comment_222",
          "parentCommentId": "comment_111",
          "depth": 1,
          "score": 31
        }
      ],
      "hasMoreChildren": true
    }
  ],
  "nextCursor": "best_comment_111_child_050"
}
`,
        statusCodes: [
          { code: 200, meaning: "Comment tree returned" },
          { code: 400, meaning: "Invalid sort or cursor" },
          { code: 404, meaning: "Post not found" },
          { code: 410, meaning: "Post removed or unavailable" },
        ],
      },
    ],
    notesMD: `
Separate the interactive write APIs from the read-optimized listing APIs. A vote response can include an estimate for immediate UI feedback, but authoritative ranking should be updated asynchronously through the vote event pipeline.

Listing and comment APIs should return stable cursors rather than offset pagination. Offset pagination breaks when hot rankings shift, while cursor pagination can preserve user experience even as scores change.
`,
  },
  databaseDesign: {
    schemaMD: `
The primary data model separates durable content, vote identity, and derived rankings. Posts and comments are immutable or append-friendly records with status fields for edits, removals, locks, and moderation. Votes require a uniqueness constraint per user and target, while counters and rankings are derived from vote mutations.

For a relational starter design, use tables for communities, posts, comments, and votes. At scale, the same logical entities become several partitioned NoSQL tables and materialized views optimized for community listings, comment pagination, and vote dedupe.
`,
    tables: [
      {
        name: "communities",
        columns: [
          { name: "community_id", type: "uuid", note: "Primary key" },
          { name: "name", type: "varchar(64)", note: "Globally unique community name" },
          { name: "title", type: "varchar(200)", note: "Display title" },
          { name: "visibility", type: "varchar(20)", note: "Public, restricted, private, or quarantined" },
          { name: "rules_json", type: "json", note: "Community rules and posting constraints" },
          { name: "subscriber_count_approx", type: "bigint", note: "Eventually consistent aggregate" },
          { name: "created_at", type: "timestamp", note: "Creation time" },
          { name: "status", type: "varchar(20)", note: "Active, locked, quarantined, or banned" },
        ],
      },
      {
        name: "posts",
        columns: [
          { name: "post_id", type: "uuid", note: "Primary key" },
          { name: "community_id", type: "uuid", note: "Partition and listing key" },
          { name: "author_id", type: "uuid", note: "Post creator" },
          { name: "title", type: "varchar(300)", note: "Post title" },
          { name: "body_pointer", type: "text", note: "Pointer to text or media metadata object" },
          { name: "created_at", type: "timestamp", note: "Used for new and hot ranking" },
          { name: "score_approx", type: "bigint", note: "Upvotes minus downvotes after aggregation" },
          { name: "upvote_count_approx", type: "bigint", note: "Approximate aggregate count" },
          { name: "downvote_count_approx", type: "bigint", note: "Approximate aggregate count" },
          { name: "comment_count_approx", type: "bigint", note: "Approximate aggregate count" },
          { name: "hot_score", type: "double", note: "Materialized time-decay rank score" },
          { name: "status", type: "varchar(20)", note: "Visible, removed, locked, spam, or deleted" },
        ],
      },
      {
        name: "comments",
        columns: [
          { name: "comment_id", type: "uuid", note: "Primary key" },
          { name: "post_id", type: "uuid", note: "Thread partition key" },
          { name: "parent_comment_id", type: "uuid nullable", note: "Null for top-level comments" },
          { name: "path", type: "varchar(512)", note: "Materialized path for tree ordering and subtree pagination" },
          { name: "depth", type: "int", note: "Tree depth used for rendering limits" },
          { name: "author_id", type: "uuid", note: "Comment creator" },
          { name: "body_pointer", type: "text", note: "Pointer to comment body or edit history" },
          { name: "created_at", type: "timestamp", note: "Creation time" },
          { name: "score_approx", type: "bigint", note: "Approximate upvotes minus downvotes" },
          { name: "best_score", type: "double", note: "Wilson confidence based ranking score" },
          { name: "status", type: "varchar(20)", note: "Visible, removed, collapsed, spam, or deleted" },
        ],
      },
      {
        name: "votes",
        columns: [
          { name: "user_id", type: "uuid", note: "Voter identity" },
          { name: "target_type", type: "varchar(20)", note: "Post or comment" },
          { name: "target_id", type: "uuid", note: "Post id or comment id" },
          { name: "direction", type: "smallint", note: "1, -1, or 0 for removed vote" },
          { name: "updated_at", type: "timestamp", note: "Latest vote update time" },
          { name: "request_id", type: "varchar(80)", note: "Idempotency key for retries" },
          { name: "version", type: "bigint", note: "Monotonic version used to order updates" },
        ],
      },
    ],
    indexesMD: `
- **communities.name** is unique and supports direct community routing.
- **posts.community_id, created_at, post_id** supports new listings and backfills.
- **posts.community_id, hot_score, post_id** supports precomputed hot listing materialization or ranking repair.
- **comments.post_id, path** supports loading comment subtrees in deterministic tree order.
- **comments.post_id, parent_comment_id, best_score** supports fetching the next page of children for a collapsed branch.
- **votes.user_id, target_type, target_id** is the logical primary key for one active vote per target per user.
- **votes.target_type, target_id** is useful for offline repair but should not be the synchronous counter path for viral targets.
`,
    relationshipsMD: `
A community owns many posts. A post owns many comments, and each comment may point to one parent comment in the same post. Users can cast at most one active vote per post or comment. Moderation status is stored on content records so read paths can filter or collapse removed content without querying moderation history.
`,
    noSqlAlternativesMD: `
At scale, split the logical schema into access-pattern tables. Use **CommunitiesByName** for name lookup, **PostsByCommunityAndTime** for new listings, **CommentsByPostAndPath** for tree retrieval, **VoteStateByUserTarget** for idempotent vote state, **VoteCounterShardsByTarget** for hot counter aggregation, and **ListingItemsByCommunitySortBucket** for hot, top, and rising pages.

Cassandra, DynamoDB, Bigtable, or ScyllaDB fit the high-write, partitioned access patterns. Use an append-only event log for post, comment, vote, and moderation events so ranking stores, search indexes, and analytics can be rebuilt. Keep personalized home feeds and subreddit listings as derived stores, not as the source of truth.
`,
  },
  architecture: {
    width: 960,
    height: 560,
    nodes: [
      { id: "client", label: "Client", kind: "client", x: 80, y: 230, sublabel: "Web, mobile" },
      { id: "cdn", label: "CDN and Edge", kind: "cdn", x: 230, y: 110, sublabel: "Static, cached pages" },
      { id: "api-gateway", label: "API Gateway", kind: "gateway", x: 250, y: 310, sublabel: "Auth, limits" },
      { id: "content-service", label: "Post and Comment Service", kind: "service", x: 440, y: 185, sublabel: "Communities, threads" },
      { id: "vote-service", label: "Vote Service", kind: "service", x: 440, y: 360, sublabel: "Dedupe, deltas" },
      { id: "social-store", label: "Social Graph Store", kind: "database", x: 625, y: 230, sublabel: "Posts, comments, votes" },
      { id: "event-stream", label: "Event Stream", kind: "queue", x: 625, y: 410, sublabel: "Kafka, Kinesis" },
      { id: "ranking-worker", label: "Ranking Workers", kind: "worker", x: 790, y: 360, sublabel: "Hot, best, top" },
      { id: "listing-cache", label: "Listing Cache", kind: "cache", x: 790, y: 120, sublabel: "Redis, edge keys" },
      { id: "feed-store", label: "Feed Store", kind: "database", x: 890, y: 245, sublabel: "Subreddit and home" },
      { id: "moderation-service", label: "Moderation Service", kind: "external", x: 625, y: 70, sublabel: "Spam, rules, bans" },
    ],
    edges: [
      { from: "client", to: "cdn", label: "read listings" },
      { from: "client", to: "api-gateway", label: "writes and votes" },
      { from: "cdn", to: "api-gateway", label: "cache miss" },
      { from: "api-gateway", to: "content-service", label: "posts, comments" },
      { from: "api-gateway", to: "vote-service", label: "vote intent" },
      { from: "api-gateway", to: "listing-cache", label: "feed lookup" },
      { from: "api-gateway", to: "feed-store", label: "page cursor" },
      { from: "content-service", to: "social-store", label: "content records" },
      { from: "vote-service", to: "social-store", label: "vote state" },
      { from: "content-service", to: "event-stream", label: "content event", dashed: true },
      { from: "vote-service", to: "event-stream", label: "vote delta" },
      { from: "event-stream", to: "ranking-worker", label: "consume changes" },
      { from: "ranking-worker", to: "feed-store", label: "materialize ranks" },
      { from: "ranking-worker", to: "listing-cache", label: "refresh hot pages" },
      { from: "content-service", to: "moderation-service", label: "scan and policy", dashed: true },
    ],
    captionMD: `
The read path prefers CDN, listing cache, and materialized feed stores. Posts, comments, votes, and moderation events flow through an event stream so ranking workers can update hot listings, home feeds, and comment best ordering asynchronously.
`,
  },
  architectureNotesMD: `
Reddit has three core workloads: durable content creation, extremely high-volume reads, and vote-driven ranking updates. The content service owns communities, posts, comments, and moderation status. The vote service owns idempotent vote intent and emits deltas instead of synchronously recalculating every listing.

The ranking pipeline consumes content and vote events, computes hot, best, top, controversial, and home-feed candidates, then writes materialized pages into feed stores and listing caches. This turns expensive ranking queries into bounded page reads. The tradeoff is freshness: users may see a vote reflected in their local UI immediately while global rankings catch up a few seconds later.

Moderation is present in the write path and the event path. Obvious spam can be blocked before publication, while uncertain content can be published with lower rank, queued for review, or hidden from default listings until trust signals improve.
`,
  requestFlow: [
    {
      title: "User opens a community listing",
      detailMD: `
The client requests a community page with a sort such as hot or new. CDN or edge cache serves static shell assets and may serve short-lived listing responses for anonymous traffic. Authenticated or personalized reads continue to the API gateway.
`,
    },
    {
      title: "Listing cache is checked",
      detailMD: `
The API gateway or listing service checks Redis using a key made from community, sort, time bucket, audience safety flags, and cursor. On a hit, the response includes post summaries, approximate scores, comment counts, and a stable next cursor.
`,
    },
    {
      title: "Feed store fills cache misses",
      detailMD: `
On a miss, the service reads a materialized listing page from the feed store rather than scanning posts and computing rank on demand. The page is placed into cache with a short TTL that depends on community activity and sort type.
`,
    },
    {
      title: "User creates a post",
      detailMD: `
The API gateway authenticates the user, checks community membership, applies rate limits, and sends the request to the content service. The content service stores the post with visible or pending status, initializes counters, and emits a post-created event.
`,
    },
    {
      title: "Moderation and spam checks run",
      detailMD: `
Rule checks, reputation scoring, duplicate detection, link scanning, and moderator configuration evaluate the post. High-confidence spam can be removed immediately. Borderline content can remain visible only in limited surfaces until review.
`,
    },
    {
      title: "User votes on a post or comment",
      detailMD: `
The vote service reads or conditionally updates the caller's vote state for the target. It computes the delta from the previous direction to the new direction, acknowledges the request, and emits an ordered vote mutation event.
`,
    },
    {
      title: "Counter shards and rankings update",
      detailMD: `
Consumers aggregate vote deltas into sharded counters and periodically compact them into target-level score estimates. Ranking workers recompute affected hot posts and best comment branches, then update the feed store and listing cache.
`,
    },
    {
      title: "Comment thread is rendered",
      detailMD: `
The comment API reads top-level comments sorted by best or new, fetches a bounded number of descendants per branch using materialized paths, filters removed content based on viewer permissions, and returns continuation cursors for deeper branches.
`,
    },
    {
      title: "Home feed mixes subscribed communities",
      detailMD: `
For the home feed, the service combines pre-ranked candidates from subscribed communities, user interests, freshness constraints, and safety filters. Heavy users may receive precomputed slices, while long-tail users can use fanout-on-read from community listing stores.
`,
    },
  ],
  coreComponents: [
    {
      name: "Post and Comment Service",
      kind: "service",
      role: "Owns communities, posts, comments, thread structure, and content status.",
      detailMD: `
This service validates community rules, stores durable content records, maintains comment tree metadata such as parent, path, and depth, and exposes read APIs for posts and threads. It should not compute expensive rankings inline for every request.
`,
    },
    {
      name: "Vote Service",
      kind: "service",
      role: "Accepts idempotent votes and emits score deltas.",
      detailMD: `
The vote service enforces one active vote per user per target, handles changes from upvote to downvote as a delta of negative two, stores latest vote state, and publishes vote mutations to the event stream. It prioritizes correctness of vote intent over immediate exact counters.
`,
    },
    {
      name: "Ranking Workers",
      kind: "worker",
      role: "Compute hot posts, best comments, top windows, and home-feed candidates.",
      detailMD: `
Workers consume post, comment, vote, and moderation events. They update sharded counters, calculate time-decay hot scores for posts, Wilson confidence scores for comments, and materialized listing pages for each active community and personalized feed segment.
`,
    },
    {
      name: "Listing Cache",
      kind: "cache",
      role: "Serves hot community and home-feed pages with low latency.",
      detailMD: `
Redis, Memcached, and edge caches store first pages and cursor pages for active listings. TTLs are short for hot communities and longer for cold communities. Cache entries include safety state so removed or quarantined content can be invalidated quickly.
`,
    },
    {
      name: "Feed Store",
      kind: "database",
      role: "Holds materialized listing pages and personalized feed slices.",
      detailMD: `
The feed store is optimized for reading ordered pages by community, sort, bucket, and cursor. It is derived from the event stream, so it can be rebuilt when ranking formulas or safety rules change.
`,
    },
    {
      name: "Social Graph Store",
      kind: "database",
      role: "Durable source of truth for content, communities, subscriptions, and vote state.",
      detailMD: `
A distributed store such as Cassandra, DynamoDB, Bigtable, or a sharded relational system stores primary records. Access patterns should be single-partition when possible: post by id, comments by post and path, and vote state by user and target.
`,
    },
    {
      name: "Moderation Service",
      kind: "external",
      role: "Detects spam, abuse, unsafe content, and policy violations.",
      detailMD: `
Moderation combines automatic rules, machine-learning risk scores, trust signals, user reports, and human review. It writes status changes and audit events that ranking workers use to demote, remove, or quarantine content.
`,
    },
    {
      name: "Event Stream",
      kind: "queue",
      role: "Decouples writes from ranking, counters, notifications, search, and analytics.",
      detailMD: `
Kafka, Kinesis, Pub/Sub, or Pulsar stores ordered events for content creation, vote changes, comments, moderation, and subscriptions. Consumers can replay events to repair counters, rebuild listing stores, or backfill new ranking models.
`,
    },
  ],
  deepDives: [
    {
      topic: "Hot, top, best, and controversial ranking",
      detailMD: `
A strong Reddit design explains that each sort has a different purpose. New is primarily created_at descending. Top is score over a time window, such as hour, day, week, month, year, or all time. Controversial rewards high activity with a near-even split between upvotes and downvotes. Hot combines score and time decay so a fresh post with fast early votes can outrank an older post with more total votes.

A classic hot formula uses the sign of upvotes minus downvotes, the log of absolute score, and an age term divided by a decay constant. The exact constants are product choices. The point is to balance freshness and popularity while making the score monotonic enough for stable pagination.

Comments often use best ranking based on the Wilson lower bound confidence interval. A comment with 8 upvotes and 0 downvotes should not automatically outrank a comment with 5,000 upvotes and 500 downvotes if the confidence calculation says the larger sample is more reliable. This prevents tiny samples from dominating early.
`,
    },
    {
      topic: "Vote counting under hot-post contention",
      detailMD: `
The naive design updates the post row on every vote. That fails because a viral post becomes a single hot row, causing lock contention, write amplification, and high tail latency. Instead, store the caller's latest vote state separately from aggregate counters.

On each vote, read or conditionally update the vote state for user and target, compute the delta from the previous value, and append the mutation to the event stream. Counter consumers aggregate deltas into many shards chosen by target id plus random or time bucket. Reads sum recent shards or read compacted totals, accepting a small freshness delay.

This design supports retries and vote changes. If a user changes from downvote to upvote, the score delta is plus two. If a user repeats the same upvote with the same request id, the service returns success without double counting. For a viral target, batching shard updates every few hundred milliseconds is more important than exact per-request counters.
`,
    },
    {
      topic: "Nested comment tree storage and rendering",
      detailMD: `
A thread can have a few comments or hundreds of thousands. Storing comments only as an adjacency list is simple but expensive when rendering large subtrees. Storing only a nested set is painful for inserts. A practical design combines parent_comment_id with a materialized path such as fixed-width sortable segments per level.

The comment API should never return the entire tree for a large thread. Return top-level comments sorted by best, include a bounded number of children per branch, and include continuation cursors for more replies. Deep levels can be collapsed by default to protect clients and servers.

Edits and removals should not break tree shape. A removed comment can remain as a tombstone if it has children, while its body is hidden. Moderators and authors may see different status details, so the read path needs viewer-aware filtering without changing the stable path order.
`,
    },
    {
      topic: "Community feed and personalized home feed",
      detailMD: `
Community feeds are easier because all users share the same ranked candidate set, modulo safety, localization, and blocked users. Ranking workers can maintain materialized pages per community, sort, and time window. The first page of hot and new receives the shortest TTL and the highest refresh priority.

The personalized home feed is harder because it mixes many subscribed communities. Fanout-on-write to every subscriber is too expensive for very large communities and unnecessary for inactive users. Fanout-on-read from subscribed community candidate pools is simpler but can be slow for users subscribed to thousands of communities.

A hybrid design works well: precompute home slices for active users and heavy sessions, use fanout-on-read for long-tail users, and cap per-community dominance so one active community does not flood the feed. The home feed store can be rebuilt from subscription and ranking events.
`,
    },
    {
      topic: "Caching hot listings without lying too much",
      detailMD: `
Listings are expensive to compute and cheap to serve, so cache them aggressively but with explicit freshness boundaries. Cache keys should include community, sort, cursor, viewer safety class, locale if relevant, and time bucket. Hot first pages might live for 5 to 15 seconds, while cold community pages can live for minutes.

Vote counts shown on cached pages can be approximate. The UI can show the user's own vote immediately and reconcile aggregate counts later. If a moderator removes a post, cache invalidation must be faster than normal TTL. Maintain a small removal or deny-list cache checked before returning cached listing items.

Stable pagination is critical. If the rank of every item shifts after each vote, users will see duplicates or missing posts. Cursor tokens should include rank boundary and tie-breaker ids, and the backend should tolerate slightly stale rank snapshots for a browsing session.
`,
    },
    {
      topic: "Moderation, spam, and trust signals",
      detailMD: `
A Reddit-like system is attacked through spam posts, coordinated voting, ban evasion, link abuse, harassment, and compromised moderator accounts. Moderation must be part of content creation, voting, ranking, and visibility decisions.

Signals include account age, karma history, device and IP reputation, community-specific rules, duplicate text similarity, link reputation, velocity of votes, reports, and moderator actions. Low-trust content can be rate-limited, shadow queued, demoted, or hidden pending review.

Moderator actions need auditability. The system should record who removed or approved content, which rule was applied, and whether automation or a human made the decision. Ranking workers must consume these events so removed content leaves hot listings quickly.
`,
    },
  ],
  scaling: [
    {
      stage: "Prototype: single region with relational storage",
      detailMD: `
Start with a relational database for communities, posts, comments, and votes. Use adjacency list comments, simple score sorting, and a Redis cache for hot community pages. This proves product semantics: community names, posting, comments, votes, and moderation status.
`,
    },
    {
      stage: "Growth: materialized listings and asynchronous votes",
      detailMD: `
Move vote aggregation and ranking to an event stream. Store materialized community listing pages in Redis or a feed table. Add comment tree pagination, sharded counters for active posts, and background workers for hot, top, and best rankings.
`,
    },
    {
      stage: "Large scale: partitioned content stores and feed services",
      detailMD: `
Partition posts by community and time, comments by post and path, and vote state by user and target. Maintain separate feed stores for community listings and personalized home feeds. Use cache warming for popular communities and adaptive TTLs based on activity.
`,
    },
    {
      stage: "Global scale: regional reads and replicated events",
      detailMD: `
Serve listing and thread reads from regional caches and read replicas. Route writes to a home region or multi-region write service depending on product requirements. Replicate events globally so ranking stores and moderation removals converge quickly.
`,
    },
    {
      stage: "Extreme scale: specialized ranking and abuse platforms",
      detailMD: `
Use dedicated ranking infrastructure, stream processors, feature stores, trust graphs, and abuse-detection models. Add hot-key isolation for viral posts, per-community workload isolation, automated ranking rollback, and replayable pipelines for formula changes.
`,
    },
  ],
  bottlenecks: [
    {
      issue: "Viral post vote hot spot",
      optimizationMD: `
Do not update one post row on every vote. Store vote state separately, append vote deltas to a log, aggregate into sharded counters, batch compacted totals, and let ranking consume approximate scores with freshness metadata.
`,
    },
    {
      issue: "Expensive ranking on every feed read",
      optimizationMD: `
Precompute materialized listing pages by community, sort, time window, and cursor. Serve from Redis or a feed store, and refresh asynchronously when vote or content events arrive.
`,
    },
    {
      issue: "Deep comment threads with huge fanout",
      optimizationMD: `
Use materialized paths, per-parent child pagination, depth limits, collapsed branches, and lazy loading. Cache first-page comment trees for hot posts while invalidating removed comments quickly.
`,
    },
    {
      issue: "Home feed over thousands of subscriptions",
      optimizationMD: `
Use a hybrid model: precompute feed slices for active users, fanout-on-read for long-tail users, maintain per-community candidate pools, and cap the number of items one community can contribute.
`,
    },
    {
      issue: "Cache stampede after ranking refresh",
      optimizationMD: `
Apply request coalescing, jittered TTLs, stale-while-revalidate behavior, and prewarming for active communities. Keep last-known-good listing pages if ranking workers lag.
`,
    },
    {
      issue: "Spam and vote manipulation overwhelming ranking",
      optimizationMD: `
Rate-limit new accounts, score vote trust, detect coordinated bursts, quarantine suspicious content, and let ranking consume trust-adjusted scores instead of raw votes only.
`,
    },
  ],
  failureHandling: [
    {
      scenario: "Listing cache outage",
      strategyMD: `
Fall back to the feed store with strict rate limits and circuit breakers. Serve stale cached pages from surviving nodes or edge caches where possible. Temporarily disable expensive personalized refinements before failing community listings.
`,
    },
    {
      scenario: "Event stream lag or partition",
      strategyMD: `
Accept durable writes if the primary content and vote stores are healthy, but mark ranking freshness as degraded. Vote responses can show local estimates while global scores lag. Consumers should resume from offsets and repair counters after recovery.
`,
    },
    {
      scenario: "Counter shard corruption",
      strategyMD: `
Rebuild aggregate counters from vote state snapshots and immutable vote events. Keep per-target freshness and confidence metadata so the UI and ranking can down-weight suspicious or stale counters during repair.
`,
    },
    {
      scenario: "Primary content store regional failure",
      strategyMD: `
Serve reads from regional replicas and cached listing pages. Route writes to a failover region if consistency rules allow it, or degrade posting and voting while keeping browsing available. Use replayable events to reconcile after failback.
`,
    },
    {
      scenario: "Bad ranking deployment",
      strategyMD: `
Canary ranking workers by community cohort, compare output distributions against the previous formula, and maintain a fast rollback to last-known-good ranking snapshots. Do not delete old materialized pages until the new ranking is proven.
`,
    },
    {
      scenario: "Moderation service degraded",
      strategyMD: `
Continue trusted reads and low-risk writes while applying conservative limits to new accounts, suspicious links, and high-risk communities. Cache deny lists locally and queue uncertain items for delayed review.
`,
    },
  ],
  security: [
    {
      label: "Authentication and session protection",
      detailMD: `
Posting, commenting, voting, moderation, and subscriptions require authenticated sessions. Protect state-changing actions with CSRF defenses for web clients, token binding where appropriate, device risk checks, and account compromise detection.
`,
    },
    {
      label: "Vote manipulation and sybil resistance",
      detailMD: `
Use account age, verified signals, device reputation, IP ranges, velocity checks, graph relationships, and community-specific trust rules to detect coordinated voting. Ranking can weight or delay suspicious votes instead of treating every vote equally.
`,
    },
    {
      label: "Spam and malicious content",
      detailMD: `
Scan links, media metadata, duplicate text, banned phrases, and known spam campaigns. Rate-limit posts and comments by account, IP, community, and trust tier. Keep high-risk content out of default rankings until it is reviewed.
`,
    },
    {
      label: "Access control for private communities",
      detailMD: `
Private and restricted communities require membership checks on listings, posts, comments, search indexing, notifications, and cached responses. Cache keys must include viewer authorization class to avoid leaking private content.
`,
    },
    {
      label: "Moderator permissions and audit logs",
      detailMD: `
Moderators can remove content, ban users, lock threads, and change rules. Enforce role-based permissions, require stronger checks for destructive actions, and record immutable audit logs for trust and safety review.
`,
    },
    {
      label: "Privacy and data retention",
      detailMD: `
Votes may reveal sensitive preferences. Limit raw vote access, aggregate analytics, set retention policies for deleted content where legally required, and avoid exposing detailed voter identities to moderators or other users.
`,
    },
  ],
  tradeoffs: {
    pros: [
      "Materialized listings make high-read community and home feeds fast.",
      "Asynchronous vote aggregation avoids hot-row contention on viral posts.",
      "Separating vote state from counters preserves idempotency and repairability.",
      "Materialized comment paths enable efficient subtree pagination.",
      "Replayable events let rankings, counters, search, and analytics be rebuilt.",
    ],
    cons: [
      "Scores and rankings are eventually consistent rather than exact in real time.",
      "Materialized feed stores increase storage and operational complexity.",
      "Cache invalidation for moderation removals must be carefully designed.",
      "Personalized home feeds are harder to explain and debug than community feeds.",
      "Trust-adjusted ranking can be opaque and requires strong observability.",
    ],
    alternativesMD: `
Alternative one is synchronous exact counters on posts and comments. It is simple and accurate for small systems but collapses under viral vote contention.

Alternative two is query-time ranking from the primary posts table. It avoids feed-store complexity but makes every listing read expensive and unpredictable.

Alternative three is full fanout-on-write personalized feeds. It provides fast home-feed reads for active users but is extremely expensive for huge communities and inactive subscribers.

Alternative four is pure fanout-on-read home feed composition. It is simpler and cheaper for inactive users, but high-subscription users may experience high latency unless candidate pools are cached aggressively.
`,
    whenNotToUseMD: `
Do not use a Reddit-style public ranking forum when the product requires strict chronological delivery, private one-to-one communication, or authoritative workflow state. For chat, collaboration, customer support tickets, or regulated records, design systems around access control, ordering guarantees, and audit requirements rather than popularity ranking.
`,
  },
  followUpQuestions: [
    {
      question: "How would you compute the hot score for posts?",
      answerMD: `
Use a time-decay formula that combines vote score and age. A common shape uses the sign of upvotes minus downvotes, the logarithm of the absolute score, and an age term divided by a decay constant. The important interview point is that hot rewards both early engagement and freshness, so old high-score posts eventually give way to newer active posts.
`,
    },
    {
      question: "Why use Wilson score for best comments?",
      answerMD: `
Wilson lower bound ranks by confidence, not raw average. It prevents a comment with a tiny number of perfect votes from outranking a comment with many positive votes and a few negative votes. This is useful for comments because early samples are noisy.
`,
    },
    {
      question: "How do you handle a user changing from downvote to upvote?",
      answerMD: `
Store the user's latest vote state for the target. When the direction changes from -1 to 1, the score delta is plus two. When the same vote is retried, idempotency should return success without emitting another delta.
`,
    },
    {
      question: "How do you render a thread with 100,000 comments?",
      answerMD: `
Do not render the full tree. Fetch top-level comments by rank, include a bounded number of descendants, collapse deep or wide branches, and return continuation cursors. Store comments by post and materialized path so subtree reads are efficient.
`,
    },
    {
      question: "How do you keep moderation removals from leaking through caches?",
      answerMD: `
Emit moderation events that invalidate affected listing and comment caches. Also keep a small deny-list or status cache checked before serving cached items. For severe policy cases, bypass stale-while-revalidate behavior and force removal from edge caches.
`,
    },
    {
      question: "Would you fan out home feed items on write or on read?",
      answerMD: `
Use a hybrid. Fanout-on-read from community candidate pools is simpler and works for long-tail users. Precompute slices for active users and high-traffic sessions. Avoid fanout-on-write to every subscriber of massive communities because it creates huge write amplification.
`,
    },
    {
      question: "How exact do vote counts need to be?",
      answerMD: `
The vote state for one user and one target should be correct and idempotent. Public aggregate counts can be approximate and eventually consistent, especially on viral targets. Display freshness or fuzzing if needed, and use offline repair from vote events.
`,
    },
  ],
  companyVariations: [
    {
      company: "Amazon",
      angleMD: `
Amazon interviewers may push on DynamoDB-style partition keys, hot partitions, operational alarms, and cost. Be ready to explain vote counter sharding, conditional writes for vote state, cache failure behavior, and how materialized feed stores are rebuilt from streams.
`,
    },
    {
      company: "Meta",
      angleMD: `
Meta will likely emphasize ranking quality, feed generation, abuse prevention, experimentation, and social graph effects. Discuss home-feed candidate generation, freshness versus engagement, trust-weighted votes, and how to run ranking experiments safely.
`,
    },
    {
      company: "Google",
      angleMD: `
Google tends to probe global scale, tail latency, storage layout, and correctness under failure. Expect follow-ups on comment tree indexing, hot-key mitigation, cache invalidation, replayable event pipelines, and ranking freshness metrics.
`,
    },
    {
      company: "LinkedIn",
      angleMD: `
LinkedIn may frame this as professional communities and knowledge discussions. Emphasize identity trust, moderation auditability, spam control, feed relevance, and enterprise-safe access controls for private groups.
`,
    },
  ],
  relatedQuestions: [
    {
      slug: "twitter",
      note: "Shares feed ranking, fanout choices, hot content, and abuse controls.",
    },
    {
      slug: "facebook-feed",
      note: "Personalized home feed generation and ranking tradeoffs are closely related.",
    },
    {
      slug: "distributed-cache",
      note: "Hot listings and comment pages depend on cache keys, TTLs, invalidation, and stampede control.",
    },
    {
      slug: "key-value-store",
      note: "Posts, comments, vote state, counter shards, and feed pages map to partitioned KV access patterns.",
    },
    {
      slug: "autocomplete",
      note: "Community and subreddit search often use autocomplete over names, tags, and trending communities.",
    },
  ],
  interviewTips: {
    commonMistakes: [
      "Updating the post row synchronously on every vote.",
      "Sorting hot feeds from the primary posts table on every request.",
      "Returning an entire deep comment tree in one API response.",
      "Ignoring vote changes, retries, and one active vote per user per target.",
      "Forgetting that moderation removals must invalidate cached rankings quickly.",
    ],
    redFlags: [
      "No distinction between vote state, counters, and ranking materializations.",
      "No concrete capacity math for listing reads, comments, votes, or storage.",
      "No strategy for viral hot keys and cache stampedes.",
      "No explanation of hot versus best versus top ranking.",
      "No abuse, spam, or moderation model for a public forum.",
    ],
    expectations: [
      "State assumptions and calculate reads, writes, vote QPS, storage, and cache size.",
      "Design separate paths for content writes, vote ingestion, ranking, and feed reads.",
      "Use materialized listings and cursor pagination instead of query-time ranking.",
      "Explain sharded counters and idempotent vote state clearly.",
      "Discuss comment tree storage, deep thread rendering, and moderation invalidation.",
    ],
    communicationMD: `
Lead with the workload split: browsing is read-heavy, voting is write-spiky, and ranking is derived. Draw the read path first, then the vote event path, then the ranking workers that refresh feed stores and caches. When discussing consistency, be explicit: user vote state should be correct immediately, while public counters and rankings can lag by seconds.
`,
  },
  revisionNotesMD: `
- Reddit is a community forum with posts, nested comments, votes, ranked listings, personalized feeds, and moderation.
- At 100M DAU, 50 listing pages per user per day creates about 5B listing reads per day, or roughly 58,000 average listing QPS and 580,000 peak QPS at 10x.
- Votes are the main write hotspot: 1B vote mutations per day is about 11,600 average vote QPS and 116,000 peak QPS before viral amplification.
- Do not update a post or comment row on every vote. Store per-user vote state, emit vote deltas, aggregate into sharded counters, and compact totals asynchronously.
- Hot post ranking combines score and time decay. Top uses score over a window. Best comments should use confidence such as Wilson lower bound instead of raw average.
- Comment trees need parent ids plus path metadata, bounded child pages, collapsed branches, and tombstones for removed comments with replies.
- Community feeds can be materialized per community and sort. Home feeds need a hybrid of precomputed slices and fanout-on-read from candidate pools.
- Cache hot listings with short TTLs, stable cursors, stale-while-revalidate, and fast moderation invalidation.
- Moderation and anti-abuse are part of the core design: spam scoring, rate limits, trust signals, audit logs, and removal events affect rankings.
`,
  flashcards: [
    {
      front: "Why is a Reddit-like system read-heavy?",
      back: "Users browse many listing and comment pages for each post or comment they create, so feed and thread reads dominate traffic.",
    },
    {
      front: "Why not update the post row for every vote?",
      back: "A viral post becomes a hot row. Use per-user vote state, vote events, sharded counters, and asynchronous aggregation instead.",
    },
    {
      front: "What does hot ranking balance?",
      back: "Hot ranking balances popularity and freshness by combining vote score with a time-decay term.",
    },
    {
      front: "Why use Wilson score for best comments?",
      back: "It ranks by confidence, reducing the chance that tiny vote samples outrank comments with more reliable larger samples.",
    },
    {
      front: "How should deep comment trees be loaded?",
      back: "Load bounded pages by parent and path, collapse deep or wide branches, and return continuation cursors instead of the full tree.",
    },
    {
      front: "What is the durable source for rebuilding rankings?",
      back: "Primary content records plus append-only post, comment, vote, moderation, and subscription events.",
    },
    {
      front: "How should moderation removals affect caches?",
      back: "Emit removal events, invalidate listing and comment caches, and check a small deny-list before serving cached items.",
    },
    {
      front: "What home-feed strategy works at scale?",
      back: "Use a hybrid: precompute slices for active users and use fanout-on-read from community candidate pools for long-tail users.",
    },
  ],
  quiz: [
    {
      question: "What is the biggest problem with synchronously incrementing a post score on every vote?",
      options: ["It makes reads impossible", "It creates a hot-row bottleneck on viral posts", "It prevents users from changing votes", "It removes the need for moderation"],
      answerIndex: 1,
      explanationMD: `
Viral posts can receive huge vote bursts. Updating one row for every vote causes contention and tail latency, so votes should be aggregated through sharded counters and events.
`,
    },
    {
      question: "Which ranking approach is most appropriate for best comments?",
      options: ["Raw average rating only", "Wilson lower bound confidence", "Alphabetical order", "Random order per request"],
      answerIndex: 1,
      explanationMD: `
Wilson confidence accounts for sample size and uncertainty, preventing comments with very few positive votes from dominating too early.
`,
    },
    {
      question: "What should the vote service store to enforce one active vote per user per target?",
      options: ["Only a global score integer", "A latest vote state keyed by user and target", "Only the post title", "Only a daily analytics row"],
      answerIndex: 1,
      explanationMD: `
Latest vote state keyed by user and target lets the service dedupe retries, compute deltas, and handle vote changes correctly.
`,
    },
    {
      question: "Why are stable cursors better than offset pagination for hot listings?",
      options: ["Offsets are encrypted", "Ranks can shift between requests and cause duplicates or missing items", "Cursors require exact counters", "Offsets cannot return JSON"],
      answerIndex: 1,
      explanationMD: `
Hot rankings change as votes arrive. Cursor tokens with rank boundaries and tie-breakers make pagination more stable than offsets.
`,
    },
    {
      question: "What is the best way to render a massive comment thread?",
      options: ["Return every comment recursively", "Return bounded branches with continuation cursors", "Disable replies after 10 comments", "Sort only by author id"],
      answerIndex: 1,
      explanationMD: `
Large threads need pagination by branch and depth. Returning the whole tree is slow, expensive, and hard for clients to render.
`,
    },
    {
      question: "Which store should be considered derived and rebuildable?",
      options: ["User password store", "Materialized hot listing feed store", "Primary comment body store", "Community name registry"],
      answerIndex: 1,
      explanationMD: `
Materialized ranking pages are derived from content, vote, and moderation events. They should be rebuildable after formula changes or corruption.
`,
    },
    {
      question: "What must happen quickly after a moderator removes a post?",
      options: ["The post must receive an automatic upvote", "Listing and comment caches must be invalidated or checked against removal state", "All communities must be deleted", "Vote counters must become exact forever"],
      answerIndex: 1,
      explanationMD: `
Cached listings can otherwise keep showing removed content. Removal events and deny-list checks keep moderation decisions reflected quickly.
`,
    },
  ],
  cheatSheetMD: `
**Goal**: design Reddit with communities, posts, nested comments, votes, ranked feeds, personalized home, and moderation.

**Workload**: 100M DAU, 5B listing reads per day, 2.5B comment page reads per day, 10M posts per day, 100M comments per day, and 1B vote mutations per day.

**Capacity**: about 58,000 average listing QPS, 29,000 average comment read QPS, 1,200 average comment write QPS, and 11,600 average vote QPS. Peak traffic at 10x makes listing reads and vote writes the core scaling concern.

**Data model**: communities, posts, comments, and vote state. Comments use parent ids plus materialized paths. Votes use latest state keyed by user and target plus append-only mutations.

**Ranking**: hot posts use score plus time decay. Top uses score in a time window. Best comments use Wilson confidence. Controversial uses high activity with mixed positive and negative votes.

**Read path**: client to CDN or API gateway to listing cache. On cache miss, read materialized feed pages from feed store. Avoid ranking from the primary posts table on request.

**Vote path**: API gateway to vote service to vote state store and event stream. Consumers update sharded counters, compact totals, recompute rankings, and refresh listing caches.

**Comments**: never return the whole tree for huge threads. Page by top-level comment, child branch, depth, and cursor. Keep tombstones for removed comments with replies.

**Caching**: cache first pages of hot listings, short TTLs for active communities, longer TTLs for cold communities, jitter to avoid stampedes, and fast invalidation for moderation.

**Moderation**: rate limits, spam scoring, link scanning, trust signals, reports, moderator actions, audit logs, and ranking demotion are core requirements.

**Tradeoff**: user vote state should be immediately correct; public scores and rankings can be approximate and eventually consistent.
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
      title: "How Reddit ranking algorithms work",
      kind: "Blog",
      url: "https://medium.com/hacking-and-gonzo/how-reddit-ranking-algorithms-work-ef111e33d0d9",
      author: "Amir Salihefendic",
    },
    {
      title: "How Not To Sort By Average Rating",
      kind: "Blog",
      url: "https://www.evanmiller.org/how-not-to-sort-by-average-rating.html",
      author: "Evan Miller",
    },
    {
      title: "The Tail at Scale",
      kind: "Paper",
      url: "https://research.google/pubs/the-tail-at-scale/",
      author: "Jeffrey Dean and Luiz Andre Barroso",
    },
  ],
};
