import type { SDQuestionContent } from "../types";

export const netflixContent: SDQuestionContent = {
  slug: "netflix",
  statementMD: `
Design Netflix, a global video-on-demand streaming platform. Users browse a personalized catalog, start playback on many device types, and watch high-quality video with minimal buffering from the nearest healthy edge cache.

At interview scale, assume hundreds of millions of subscribers, tens of millions of simultaneous streams at peak, a catalog measured in petabytes after encoding, and peak egress measured in hundreds of terabits per second. The hard parts are not CRUD APIs; they are offline media processing, pre-positioning popular content into ISP-embedded caches, steering each playback session to the right edge, adapting bitrate in real time, enforcing licensing and DRM, and keeping recommendations and continue-watching fresh.

A strong design separates the cloud control plane from the video data plane. Cloud APIs authenticate users, serve catalog metadata, compute recommendations, authorize playback, and return manifests and edge choices. The video bytes should flow directly from CDN edge caches to the client so the control plane never sits in the hot path for segment delivery.
`,
  businessUseCaseMD: `
Netflix turns a large licensed content catalog into a personalized, reliable entertainment product. Users expect instant browsing, resume across devices, high quality on fast networks, graceful degradation on slow networks, and correct regional availability.

For the business, the platform must maximize viewing quality and engagement while controlling bandwidth cost. That means encoding every title efficiently, caching demand close to viewers before it peaks, ranking the catalog per member, honoring studio rights, and collecting playback telemetry to improve both recommendations and streaming quality.
`,
  functionalRequirements: [
    "Let users browse catalog rows, title detail pages, search results, and personalized recommendations.",
    "Start a playback session only when the member, profile, device, region, and title entitlement are valid.",
    "Return a device-appropriate adaptive bitrate manifest, subtitles, audio tracks, and DRM information.",
    "Stream video segments from edge caches with adaptive bitrate switching on the client.",
    "Track viewing history, playback position, completion, thumbs, and continue-watching state across devices.",
    "Ingest studio masters and produce per-title, per-codec, per-device encoding ladders offline.",
    "Pre-position hot titles and new releases onto ISP-embedded edge caches before expected demand.",
    "Collect QoE telemetry such as startup time, rebuffering, bitrate, errors, edge server, and device type.",
  ],
  nonFunctionalRequirements: [
    {
      label: "Playback startup latency",
      detailMD: `
The time from pressing play to first frame should be under 2 seconds for healthy broadband connections and under 5 seconds for constrained mobile networks. The control plane should return playback authorization and manifest metadata in a few hundred milliseconds, while segment downloads come from nearby CDN caches.
`,
    },
    {
      label: "Availability",
      detailMD: `
Playback should target 99.99 percent availability or better for already-published popular titles. Browse and recommendation features can degrade to cached rows, but active playback must continue even when personalization, analytics, or parts of the catalog management plane are impaired.
`,
    },
    {
      label: "Scalability",
      detailMD: `
The system must handle tens of millions of concurrent players, millions of manifest requests per minute, and hundreds of terabits per second of video egress. Scale the control plane horizontally, but scale the data plane through distributed edge caches and ISP peering rather than central cloud bandwidth.
`,
    },
    {
      label: "Consistency and freshness",
      detailMD: `
Catalog rights, maturity ratings, and device playback rules must be strongly enforced at session start. Viewing history, recommendations, and popularity signals can be eventually consistent within seconds or minutes because stale rows are annoying but not usually unsafe.
`,
    },
    {
      label: "Content durability",
      detailMD: `
Studio masters, mezzanine files, encoded renditions, manifests, subtitle assets, and key metadata are expensive to recreate. Store them in replicated origin storage with versioning, checksums, and disaster recovery. Edge caches may be disposable because they can refill from origin.
`,
    },
    {
      label: "Cost efficiency",
      detailMD: `
Bandwidth dominates cost. Use per-title encoding to avoid wasting bits, pre-position popular assets to ISP caches, steer users away from congested or expensive paths, and fetch from cloud origin only on misses or long-tail demand.
`,
    },
    {
      label: "Device compatibility",
      detailMD: `
The platform must serve phones, tablets, browsers, smart TVs, set-top boxes, and game consoles. Each device may support different codecs, resolutions, HDR formats, DRM systems, audio layouts, subtitle formats, and buffer behavior.
`,
    },
  ],
  capacityEstimation: {
    assumptionsMD: `
Assume 300M subscribers, 120M daily active viewers, and 40M peak concurrent streams during prime time and major releases. Average delivered bitrate across mobile, HD, and 4K sessions is 5 Mbps, while high-end 4K sessions can exceed 15 Mbps.

Assume 250K hours of watchable catalog after including movies, episodes, trailers, dubs, and regional variants. If one catalog hour produces about 80 GB across H.264, HEVC, AV1, multiple resolutions, audio tracks, subtitles, thumbnails, manifests, and packaging overhead, the encoded origin catalog is about 20 PB before replication. With three durable copies plus metadata and staging assets, plan for 60 PB or more at origin.

A playback client downloads segments in small chunks, commonly 2 to 6 seconds each. With 40M concurrent streams and one segment request every 4 seconds, the CDN sees about 10M segment requests per second at peak, plus manifest refreshes, subtitle fetches, and telemetry.
`,
    metrics: [
      {
        label: "Subscribers",
        value: "300M members",
        note: "Large global paid service assumption",
      },
      {
        label: "Daily active viewers",
        value: "120M viewers per day",
        note: "About 40 percent of members watch on a busy day",
      },
      {
        label: "Peak concurrent streams",
        value: "40M streams",
        note: "Prime-time global peak and new-release spikes",
      },
      {
        label: "Average stream bitrate",
        value: "5 Mbps",
        note: "Blended across mobile, HD, and 4K sessions",
      },
      {
        label: "Peak video egress",
        value: "200 Tbps",
        note: "40M streams times 5 Mbps before protocol overhead",
      },
      {
        label: "Segment request rate",
        value: "10M requests per second",
        note: "40M players fetching one segment about every 4 seconds",
      },
      {
        label: "Encoded origin catalog",
        value: "20 PB raw encoded assets",
        note: "250K hours times about 80 GB per catalog hour",
      },
      {
        label: "Replicated origin storage",
        value: "60 PB plus overhead",
        note: "Three durable copies, manifests, subtitles, thumbnails, and staging headroom",
      },
      {
        label: "Hot CDN footprint",
        value: "5 to 10 PB near users",
        note: "Pre-position the hottest regional catalog slice across ISP edge caches",
      },
      {
        label: "Playback telemetry",
        value: "40M to 80M events per minute at peak",
        note: "One or two client QoE events per active player per minute",
      },
    ],
    calculationsMD: `
- Peak egress: 40M concurrent streams times 5 Mbps is 200M Mbps, which is 200 Tbps before TLS, TCP, and retry overhead. A real platform reserves substantial headroom because major releases and sports-like events create correlated demand.
- Segment requests: if each player fetches a segment every 4 seconds, 40M concurrent players divided by 4 seconds is 10M segment requests per second. This traffic must terminate at CDN edge caches, not at the cloud APIs.
- Catalog storage: 250K catalog hours times 80 GB per encoded hour is 20,000,000 GB, or about 20 PB. Three durable copies make this about 60 PB before indexes, previews, artwork, and temporary encoding outputs.
- CDN footprint: the hottest 20 percent of regional titles may drive 80 percent of streaming. Keeping 5 to 10 PB of hot assets inside ISP edge caches can remove most origin traffic while allowing long-tail titles to fill on demand.
- Telemetry: 40M players sending one to two QoE events per minute means 40M to 80M events per minute, or roughly 667K to 1.33M events per second. This belongs in a streaming pipeline, not a synchronous playback API.
- Control plane load: playback starts are much lower than segment traffic. If 120M daily viewers start three sessions each, that is 360M playback starts per day, or about 4,200 starts per second on average. A 20x peak gives about 84K starts per second, which is large but manageable with stateless APIs and caches.
`,
  },
  apiDesign: {
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/profiles/{profileId}/home",
        descriptionMD: `
Returns personalized home rows, continue-watching titles, trending rows, and editorial collections for a profile. This reads cached ranking output and catalog metadata rather than scoring the entire catalog synchronously.
`,
        response: `
{
  "profileId": "profile_123",
  "rows": [
    {
      "rowId": "continue_watching",
      "title": "Continue Watching",
      "items": [
        {
          "titleId": "title_987",
          "displayName": "Example Series",
          "resumeSeconds": 1840,
          "artworkUrl": "https://images.example.net/art/title_987.jpg"
        }
      ]
    }
  ],
  "generatedAt": "2026-07-26T07:24:47Z"
}
`,
        statusCodes: [
          { code: 200, meaning: "Home rows returned" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Profile does not belong to the account" },
          { code: 503, meaning: "Serve cached fallback rows if personalization is unavailable" },
        ],
      },
      {
        method: "GET",
        path: "/api/v1/titles/{titleId}",
        descriptionMD: `
Returns title detail metadata including synopsis, artwork, episode list, maturity rating, supported audio and subtitle tracks, and whether the title is playable in the viewer's region.
`,
        response: `
{
  "titleId": "title_987",
  "name": "Example Series",
  "type": "series",
  "maturityRating": "TV-14",
  "isPlayable": true,
  "seasons": [
    {
      "seasonNumber": 1,
      "episodes": [
        { "episodeId": "episode_001", "runtimeSeconds": 3120 }
      ]
    }
  ],
  "audioTracks": ["en-US", "hi-IN"],
  "subtitleTracks": ["en-US", "es-ES"]
}
`,
        statusCodes: [
          { code: 200, meaning: "Title metadata returned" },
          { code: 404, meaning: "Unknown title" },
          { code: 451, meaning: "Unavailable due to regional rights" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/playback/sessions",
        descriptionMD: `
Creates a playback session. The Playback and Steering API checks subscription state, profile rules, regional rights, device capabilities, DRM support, CDN health, and cache availability before returning a manifest URL and selected edge host.
`,
        request: `
{
  "profileId": "profile_123",
  "titleId": "episode_001",
  "deviceId": "device_tv_456",
  "network": {
    "asn": 64500,
    "country": "US",
    "region": "CA"
  },
  "capabilities": {
    "codecs": ["av1", "hevc", "h264"],
    "maxResolution": "4k",
    "hdr": true,
    "drm": "widevine"
  }
}
`,
        response: `
{
  "playbackSessionId": "play_789",
  "manifestUrl": "https://edge-17.isp-cache.example.net/manifests/episode_001/av1/master.mpd",
  "edgeServerId": "edge-17",
  "drmLicenseUrl": "https://api.example.net/api/v1/drm/licenses",
  "expiresAt": "2026-07-26T10:24:47Z",
  "tracks": {
    "audio": ["en-US", "hi-IN"],
    "subtitles": ["en-US", "es-ES"]
  }
}
`,
        statusCodes: [
          { code: 201, meaning: "Playback session created" },
          { code: 400, meaning: "Unsupported device capability or malformed request" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Not entitled to play this title" },
          { code: 451, meaning: "Title not licensed in the viewer's region" },
          { code: 503, meaning: "No healthy edge available for the requested asset" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/drm/licenses",
        descriptionMD: `
Exchanges a device DRM challenge for a short-lived content key license. The service validates the playback session, device identity, title entitlement, and requested key ids before issuing the license.
`,
        request: `
{
  "playbackSessionId": "play_789",
  "deviceId": "device_tv_456",
  "drmSystem": "widevine",
  "licenseChallenge": "base64-device-challenge"
}
`,
        response: `
{
  "license": "base64-drm-license",
  "expiresAt": "2026-07-26T10:24:47Z",
  "renewalSeconds": 1800
}
`,
        statusCodes: [
          { code: 200, meaning: "License issued" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Playback session or device is not authorized" },
          { code: 429, meaning: "License request rate limited" },
        ],
      },
      {
        method: "PUT",
        path: "/api/v1/profiles/{profileId}/history/{titleId}",
        descriptionMD: `
Updates viewing progress and completion state. The write is acknowledged quickly, emitted to the event stream, and later folded into continue-watching, recommendations, and engagement analytics.
`,
        request: `
{
  "playbackSessionId": "play_789",
  "positionSeconds": 1840,
  "durationSeconds": 3120,
  "state": "playing",
  "updatedAt": "2026-07-26T07:54:47Z"
}
`,
        response: `
{
  "profileId": "profile_123",
  "titleId": "episode_001",
  "positionSeconds": 1840,
  "continueWatching": true
}
`,
        statusCodes: [
          { code: 200, meaning: "Progress stored" },
          { code: 401, meaning: "Authentication required" },
          { code: 403, meaning: "Profile does not belong to the account" },
          { code: 409, meaning: "Older progress update ignored" },
        ],
      },
      {
        method: "POST",
        path: "/api/v1/playback/telemetry",
        descriptionMD: `
Receives batched QoE events from clients. These events drive edge health scoring, ABR tuning, alerting, and recommendation features, but playback must not depend on this endpoint being available.
`,
        request: `
{
  "playbackSessionId": "play_789",
  "events": [
    {
      "type": "rebuffer",
      "timestamp": "2026-07-26T07:55:12Z",
      "bitrateKbps": 4300,
      "bufferSeconds": 1.2,
      "edgeServerId": "edge-17"
    }
  ]
}
`,
        response: `
{
  "accepted": true
}
`,
        statusCodes: [
          { code: 202, meaning: "Telemetry accepted" },
          { code: 400, meaning: "Invalid telemetry batch" },
          { code: 429, meaning: "Client should sample or back off" },
        ],
      },
    ],
    notesMD: `
The APIs above are control-plane APIs. They authorize users, shape catalog views, return manifests, issue DRM licenses, and capture state. They should never proxy the actual video segments.

The segment URLs in the manifest point at CDN edge caches. If the control plane is briefly degraded after playback starts, the player should continue downloading already-authorized segments until tokens expire or the manifest needs renewal.
`,
  },
  databaseDesign: {
    schemaMD: `
Netflix needs several logical stores rather than one monolithic database. Catalog metadata is read-heavy and region-aware. Playback sessions and entitlements require strong checks at session start. Viewing history is write-heavy but compact. Recommendation features and telemetry flow through event and analytical stores.

The serving path should avoid joins. Playback authorization can read a small entitlement and title availability record, then return signed manifest and segment URLs. Video assets themselves live in object storage and CDN caches, not in the metadata database.
`,
    tables: [
      {
        name: "catalog_titles",
        columns: [
          { name: "title_id", type: "varchar(64)", note: "Primary identifier for movie, series, season, episode, trailer, or bonus asset" },
          { name: "parent_title_id", type: "varchar(64) nullable", note: "Series or season hierarchy" },
          { name: "display_name", type: "varchar(512)", note: "Localized through a separate translations document" },
          { name: "runtime_seconds", type: "int", note: "Runtime for playable assets" },
          { name: "maturity_rating", type: "varchar(32)", note: "Used for profile and parental controls" },
          { name: "available_regions", type: "json", note: "Compact region and license window metadata" },
          { name: "artwork_refs", type: "json", note: "Pointers to images, previews, and trailers" },
          { name: "updated_at", type: "timestamp", note: "Used for cache invalidation and search indexing" },
        ],
      },
      {
        name: "encoded_assets",
        columns: [
          { name: "asset_id", type: "varchar(96)", note: "Primary key for a packaged rendition set" },
          { name: "title_id", type: "varchar(64)", note: "Playable title or episode" },
          { name: "codec", type: "varchar(32)", note: "H.264, HEVC, AV1, or future codec" },
          { name: "device_profile", type: "varchar(64)", note: "TV, mobile, browser, game console, or low-power class" },
          { name: "ladder", type: "json", note: "ABR bitrates, resolutions, segment duration, and quality scores" },
          { name: "manifest_uri", type: "text", note: "Origin path for DASH or HLS manifest" },
          { name: "origin_prefix", type: "text", note: "Object storage prefix for segments" },
          { name: "drm_key_set_id", type: "varchar(96)", note: "Reference to encrypted content keys" },
          { name: "status", type: "varchar(32)", note: "Encoding, validating, published, deprecated, or withdrawn" },
        ],
      },
      {
        name: "playback_sessions",
        columns: [
          { name: "playback_session_id", type: "varchar(96)", note: "Primary key for a start playback authorization" },
          { name: "profile_id", type: "varchar(64)", note: "Viewer profile" },
          { name: "title_id", type: "varchar(64)", note: "Playable asset" },
          { name: "device_id", type: "varchar(96)", note: "Registered or anonymous device identity" },
          { name: "edge_server_id", type: "varchar(64)", note: "Selected edge for initial manifest and segment URLs" },
          { name: "drm_system", type: "varchar(32)", note: "Widevine, PlayReady, FairPlay, or clear for non-premium assets" },
          { name: "created_at", type: "timestamp", note: "Session creation time" },
          { name: "expires_at", type: "timestamp", note: "Token and license renewal boundary" },
        ],
      },
      {
        name: "viewing_history",
        columns: [
          { name: "profile_id", type: "varchar(64)", note: "Partition key for continue-watching reads" },
          { name: "title_id", type: "varchar(64)", note: "Episode or movie" },
          { name: "position_seconds", type: "int", note: "Latest known playback position" },
          { name: "duration_seconds", type: "int", note: "Known duration at update time" },
          { name: "state", type: "varchar(32)", note: "Playing, paused, completed, removed, or expired" },
          { name: "last_played_at", type: "timestamp", note: "Sort key for continue watching" },
          { name: "device_id", type: "varchar(96)", note: "Last device that updated progress" },
        ],
      },
    ],
    indexesMD: `
- **catalog_titles.title_id** is the primary key for detail pages and playback checks.
- **catalog_titles.available_regions** should be indexed or pre-materialized by region because availability filtering is frequent.
- **encoded_assets.title_id, codec, device_profile** selects the right ABR ladder at playback start.
- **playback_sessions.playback_session_id** supports DRM license checks and telemetry correlation.
- **viewing_history.profile_id, last_played_at** powers continue-watching rows without scanning a profile's full history.
`,
    relationshipsMD: `
A catalog title can have many encoded assets because each title may be packaged for several codecs, devices, bitrates, audio languages, subtitles, and DRM key sets. A playback session references one profile, one playable title, one selected asset family, and one initial edge server. Viewing history is keyed by profile and title so multiple devices converge on one resume position.
`,
    noSqlAlternativesMD: `
Use document stores or wide-column stores for localized catalog documents, regional availability snapshots, and profile viewing history. Use object storage for encoded media segments. Use a streaming platform for telemetry and watch events. Use an analytical warehouse or feature store for recommendation features and ranking outputs.

For playback session state, a low-latency replicated key-value store is usually better than a relational database because license checks and telemetry correlation are point lookups by session id. The exact product can vary, but the principle is to keep the video-serving data path independent from catalog joins and recommendation scoring.
`,
  },
  architecture: {
    width: 980,
    height: 580,
    nodes: [
      { id: "client-player", label: "Client Player", kind: "client", x: 70, y: 260, sublabel: "TV, mobile, browser" },
      { id: "playback-api", label: "Playback and Steering API", kind: "service", x: 420, y: 120, sublabel: "Entitlement, edge choice" },
      { id: "catalog-api", label: "Catalog Metadata Service", kind: "service", x: 420, y: 245, sublabel: "Titles, rights, artwork" },
      { id: "personalization-service", label: "Recommendation and History", kind: "service", x: 420, y: 370, sublabel: "Rows, resume state" },
      { id: "metadata-store", label: "Metadata and Session Stores", kind: "database", x: 635, y: 230, sublabel: "Catalog, sessions, history" },
      { id: "event-stream", label: "Event Stream", kind: "queue", x: 635, y: 400, sublabel: "Watch and QoE events" },
      { id: "ranking-pipeline", label: "Ranking Pipeline", kind: "analytics", x: 820, y: 395, sublabel: "Features, models, rows" },
      { id: "encoding-farm", label: "Offline Encoding Farm", kind: "worker", x: 640, y: 70, sublabel: "Per-title ABR ladders" },
      { id: "origin-storage", label: "Origin Media Storage", kind: "storage", x: 820, y: 105, sublabel: "PB-scale objects" },
      { id: "isp-edge-cdn", label: "ISP Edge Caches", kind: "cdn", x: 230, y: 465, sublabel: "Open Connect style" },
      { id: "drm-license", label: "DRM License Service", kind: "service", x: 635, y: 540, sublabel: "Keys, entitlements" },
    ],
    edges: [
      { from: "client-player", to: "playback-api", label: "start playback" },
      { from: "client-player", to: "catalog-api", label: "catalog reads" },
      { from: "client-player", to: "personalization-service", label: "home rows, history" },
      { from: "playback-api", to: "metadata-store", label: "rights, session, device" },
      { from: "catalog-api", to: "metadata-store", label: "title metadata" },
      { from: "personalization-service", to: "metadata-store", label: "history and rows" },
      { from: "personalization-service", to: "event-stream", label: "watch updates", dashed: true },
      { from: "event-stream", to: "ranking-pipeline", label: "features", dashed: true },
      { from: "ranking-pipeline", to: "personalization-service", label: "ranked results", dashed: true },
      { from: "encoding-farm", to: "origin-storage", label: "renditions, manifests" },
      { from: "origin-storage", to: "isp-edge-cdn", label: "pre-position hot assets", dashed: true },
      { from: "client-player", to: "isp-edge-cdn", label: "video segments" },
      { from: "isp-edge-cdn", to: "origin-storage", label: "cache fill on miss", dashed: true },
      { from: "client-player", to: "drm-license", label: "license challenge" },
      { from: "drm-license", to: "metadata-store", label: "session entitlement" },
    ],
    captionMD: `
The control plane runs in cloud services and handles catalog, personalization, entitlement, playback steering, sessions, DRM, and telemetry. The data plane is the heavy path: video segments flow from ISP edge caches to players, with origin storage used for pre-positioning and rare cache misses.
`,
  },
  architectureNotesMD: `
The architecture has two very different traffic profiles. Cloud control-plane services handle relatively small JSON requests for browse, recommendations, session creation, DRM, and history. They need low latency and correctness, but their traffic is tiny compared with the video data plane.

Video bytes should be served from an Open Connect style CDN with appliances embedded in or near ISPs. The offline encoding farm writes packaged renditions to origin storage. A control system predicts demand, pre-positions hot assets onto edge caches, and feeds health and capacity signals to the Playback and Steering API.

During playback, the client mostly talks to the edge cache. It only returns to the control plane for manifest renewal, license renewal, history updates, and telemetry. This protects the cloud APIs from hundreds of terabits per second of video egress and lets the CDN scale independently.
`,
  requestFlow: [
    {
      title: "Content is prepared offline",
      detailMD: `
A studio master arrives as a high-quality mezzanine file. The encoding farm analyzes complexity per scene and per title, chooses codec and device profiles, creates ABR ladders, packages segments and manifests, encrypts assets, validates quality, and writes published renditions to origin storage.
`,
    },
    {
      title: "Popular assets are pre-positioned",
      detailMD: `
Before a launch window or regional peak, the CDN control system pushes likely hot segments, manifests, subtitles, and artwork from origin storage into ISP edge caches. Placement uses regional demand forecasts, catalog availability, edge disk capacity, and historical viewing patterns.
`,
    },
    {
      title: "Home and catalog rows are served",
      detailMD: `
The client requests the home page through the control plane. The Catalog Metadata Service supplies title facts and rights filters, while the Recommendation and History service returns ranked rows and continue-watching state from precomputed outputs and recent profile activity.
`,
    },
    {
      title: "Playback session is authorized",
      detailMD: `
When the user presses play, the Playback and Steering API validates authentication, subscription, profile maturity controls, regional license windows, device capabilities, DRM support, and concurrent stream policy. It creates a short-lived playback session.
`,
    },
    {
      title: "Best edge and ABR ladder are selected",
      detailMD: `
The steering logic chooses an edge server and manifest based on the viewer's ISP, geography, edge health, cache residency, device codec support, measured QoE, and content rights. It returns signed manifest and segment URLs plus DRM license information.
`,
    },
    {
      title: "DRM license is acquired",
      detailMD: `
The player sends a device challenge to the DRM License Service. The service checks the playback session and entitlement, then issues a short-lived license for the encrypted content keys needed by that title, device, and DRM system.
`,
    },
    {
      title: "Segments stream from the edge data plane",
      detailMD: `
The client downloads small video segments directly from the selected edge cache. On a cache hit, bytes come from the ISP appliance. On a miss, the edge fills from origin or an upstream cache, then serves the segment and keeps it according to cache policy.
`,
    },
    {
      title: "Client adapts bitrate continuously",
      detailMD: `
The player measures throughput, buffer depth, dropped frames, viewport, device limits, and recent errors. It switches up or down the ABR ladder every few segments to maximize quality while avoiding rebuffering. The server does not push a fixed bitrate.
`,
    },
    {
      title: "History and telemetry feed learning loops",
      detailMD: `
The client periodically sends progress and QoE events. Viewing history updates continue-watching quickly, while event streams feed recommendation features, edge health scoring, encoding quality analysis, and operational alerting.
`,
    },
  ],
  coreComponents: [
    {
      name: "Client Player",
      kind: "client",
      role: "Runs playback, buffering, DRM integration, and ABR decisions on each device.",
      detailMD: `
The player parses manifests, downloads segments, estimates network throughput, manages buffer targets, switches bitrate, decodes video, reports QoE telemetry, and handles license renewal. It must work across TVs, phones, browsers, consoles, and low-power devices with different codec and DRM support.
`,
    },
    {
      name: "Playback and Steering API",
      kind: "service",
      role: "Authorizes playback and selects the best manifest and edge cache.",
      detailMD: `
This stateless service sits in the control plane. It checks account state, profile rules, regional rights, device capabilities, DRM requirements, CDN cache residency, edge health, and network path quality before returning signed URLs and a playback session.
`,
    },
    {
      name: "Offline Encoding Farm",
      kind: "worker",
      role: "Transforms source media into optimized renditions for many devices.",
      detailMD: `
Encoding workers analyze each title, generate per-title and per-device ABR ladders, create HLS or DASH segments, encrypt outputs, run objective and human quality checks, and publish manifests and segments to origin storage. The farm can be huge but is not in the user-facing playback path.
`,
    },
    {
      name: "ISP Edge CDN",
      kind: "cdn",
      role: "Serves the overwhelming majority of video bytes close to viewers.",
      detailMD: `
Edge appliances embedded in ISP networks store popular segments and manifests. They reduce last-mile latency, avoid expensive cloud egress, and absorb peak demand. They should expose health, disk, cache hit ratio, and throughput signals to the steering system.
`,
    },
    {
      name: "Catalog Metadata Service",
      kind: "service",
      role: "Serves title facts, artwork, hierarchy, ratings, and regional availability.",
      detailMD: `
The catalog service stores localized title documents, license windows, maturity rules, artwork references, cast, genres, search fields, and episode hierarchy. It feeds browse pages, title detail pages, search indexes, playback authorization, and recommendation features.
`,
    },
    {
      name: "Recommendation and Ranking Pipeline",
      kind: "analytics",
      role: "Ranks titles and rows for each profile using behavior and content signals.",
      detailMD: `
Batch and streaming jobs build user, title, context, and freshness features. Ranking models produce home rows, similarity lists, trending content, and fallback rows. Online services serve precomputed results with lightweight re-ranking rather than scoring the full catalog per request.
`,
    },
    {
      name: "Viewing History Service",
      kind: "database",
      role: "Maintains resume position, completion, and watch state across devices.",
      detailMD: `
This service writes frequent progress updates, resolves out-of-order device events, exposes continue-watching rows, and emits durable events for recommendations and analytics. It should be partitioned by profile because reads and writes are profile-centric.
`,
    },
    {
      name: "DRM and Entitlement Service",
      kind: "service",
      role: "Protects licensed content and issues playback keys only to authorized sessions.",
      detailMD: `
The service verifies playback sessions, devices, subscription state, region, and title rights before returning licenses for Widevine, PlayReady, FairPlay, or similar systems. Keys are short-lived and tied to encrypted renditions and device security levels.
`,
    },
  ],
  deepDives: [
    {
      topic: "Control plane versus data plane",
      detailMD: `
The most important architectural split is that cloud APIs decide whether and how a user may play a title, while CDN caches deliver the bytes. The control plane includes authentication, catalog, recommendations, playback session creation, steering, DRM, history, telemetry intake, cache placement decisions, and operational dashboards.

The data plane is the high-bandwidth path from edge cache to player. At 40M concurrent streams and a 5 Mbps blended bitrate, the data plane carries about 200 Tbps. Putting this through application servers would be financially and operationally impossible. Instead, the Playback API returns signed edge URLs and then gets out of the way.

This split also changes failure behavior. If recommendations are down, the client can show cached rows. If telemetry intake is down, playback can continue. If the selected edge is down, steering or the player can fail over to another edge. Only entitlement, DRM, and manifest authorization are truly blocking at start time.
`,
    },
    {
      topic: "Offline encoding farm and ABR ladders",
      detailMD: `
A naive system would encode every title into the same fixed ladder, such as 240p through 4K at predetermined bitrates. That wastes bandwidth on simple animation and underserves visually complex content. A premium design uses per-title and often per-scene analysis to choose bitrates that hit quality targets for each title.

The farm starts from mezzanine assets, runs complexity analysis, selects codec families such as H.264, HEVC, and AV1, creates ladders for device classes, packages DASH or HLS segments, encrypts content, generates subtitles and audio variants, and validates artifacts. Outputs are immutable versioned assets so cache keys and manifests remain stable.

The tradeoff is storage and compute. More ladders improve quality and device coverage, but they multiply origin storage and cache footprint. The design should keep enough variants for major device and network classes, then rely on ABR switching to adapt within each ladder rather than generating every possible combination.
`,
    },
    {
      topic: "Pre-positioning content onto ISP edge caches",
      detailMD: `
Open Connect style caching places appliances inside or near ISP networks. Rather than waiting for users to request a new release and stampede origin, the control system predicts demand and pushes likely hot titles to the right regions ahead of time.

Placement uses signals such as release calendar, regional popularity, language, device mix, trending velocity, historical rewatch patterns, marketing campaigns, and available edge disk. Caches keep complete segment ranges for hot titles and partial ranges for medium-demand titles. Long-tail misses are filled from origin or upstream caches.

This reduces latency and cost, but it creates cache allocation tradeoffs. A title may be hot globally but unavailable in some regions due to licensing. A new release may need aggressive prefill even before there is watch history. Cache churn must be controlled so pre-positioning one title does not evict other high-value assets.
`,
    },
    {
      topic: "Playback steering and edge selection",
      detailMD: `
The steering API should not simply choose the geographically nearest server. It considers ISP, autonomous system, edge health, cache residency, live throughput, packet loss, historical QoE by device class, regional rights, token scope, and failover policy.

At session creation, the API can return a primary edge and backup choices through manifest URLs or DNS-style indirection. If the player sees repeated segment failures or poor throughput, it can request a refreshed manifest or switch to alternate hosts if the manifest permits it.

The key tradeoff is stability versus optimization. Aggressively moving players between edges may improve short-term throughput but can destroy cache locality and cause visible stalls. A good answer uses hysteresis, health thresholds, canaries, and QoE feedback loops rather than per-segment centralized steering.
`,
    },
    {
      topic: "Adaptive bitrate switching on the client",
      detailMD: `
The server publishes multiple renditions, but the player chooses the next segment. It estimates available bandwidth, buffer depth, decode performance, dropped frames, startup phase, device constraints, and viewport resolution. It starts conservatively to reach first frame quickly, then ramps quality when confidence increases.

ABR algorithms must avoid oscillation. If a player jumps to 4K after one fast segment and then immediately falls back, users see quality shifts and rebuffering. Practical players use smoothed throughput, buffer-based rules, safety margins, and caps from the manifest and device.

Client telemetry closes the loop. Rebuffer rate, startup delay, bitrate distribution, and failed segment requests tell the platform whether an edge is unhealthy, a ladder is too aggressive, or a device profile is wrong. This telemetry should influence future steering and encoding decisions, not block current playback.
`,
    },
    {
      topic: "Catalog, recommendations, and viewing history",
      detailMD: `
The catalog service answers what can be shown and played: title hierarchy, artwork, metadata, localization, maturity ratings, and regional license windows. The recommendation system answers what should be shown first for a profile and context. These must be connected but separately scalable.

Viewing history is a critical bridge. Resume position powers continue-watching, completion feeds satisfaction features, recent watches affect ranking, and explicit feedback adjusts personalization. Writes are frequent and may arrive out of order from multiple devices, so use version timestamps, idempotent updates, and profile-partitioned storage.

Ranking should be precomputed or nearline for most rows. The online request path can blend cached personalized rows, fresh continue-watching, regional trends, editorial campaigns, and fallback popularity. Scoring the full catalog synchronously for every home request is too slow and too costly.
`,
    },
    {
      topic: "Licensing, DRM, and regional rights",
      detailMD: `
Streaming rights vary by country, time window, device type, subscription plan, maturity rules, and studio contract. The playback API must enforce these rules before returning a playable manifest. The catalog may hide unavailable titles earlier, but playback authorization remains the source of truth.

DRM protects encrypted content keys. The player obtains a license after proving device capability and referencing an authorized playback session. Licenses should be short-lived, scoped to the title and key ids, and renewable during long sessions. Key material should be isolated from general application services.

The tradeoff is latency and strictness. Overly chatty DRM flows hurt startup time, but weak enforcement risks contract violations. Cache safe entitlement decisions for a short time, sign manifests and segments with bounded expiry, and fail closed for premium content when license validation is uncertain.
`,
    },
  ],
  scaling: [
    {
      stage: "Prototype: one region and cloud CDN",
      detailMD: `
Start with catalog APIs, simple playback authorization, object storage for encoded assets, a managed CDN, and basic fixed encoding ladders. Recommendations can be editorial or popularity-based, and viewing history can be stored in a relational database keyed by profile and title.
`,
    },
    {
      stage: "Growth: multi-region control plane and better encoding",
      detailMD: `
Deploy stateless control APIs in several regions, replicate catalog and entitlement data, move history to a profile-partitioned store, add streaming telemetry, and introduce per-title encoding. Use CDN logs and watch events to drive cache prefill decisions.
`,
    },
    {
      stage: "Global scale: ISP edge caches and steering",
      detailMD: `
Place edge appliances near viewers, pre-position hot assets by region, and build a playback steering service that understands edge health and cache residency. Keep all segment bytes on the CDN data plane and use origin only for long-tail cache fills and publishing.
`,
    },
    {
      stage: "Mature platform: personalization and QoE feedback loops",
      detailMD: `
Add feature stores, offline and nearline ranking pipelines, contextual re-ranking, A/B experimentation, QoE-based steering, encoding quality optimization, automated cache placement, regional launch playbooks, and strong observability across every playback stage.
`,
    },
    {
      stage: "Extreme peak: global releases and correlated demand",
      detailMD: `
For a major title launch, prefill caches ahead of release, reserve egress headroom, freeze risky deployments, canary manifests and DRM rules, monitor startup and rebuffer metrics by ISP, and prepare fallback rows and alternate edges. The system should survive demand that rises within minutes rather than hours.
`,
    },
  ],
  bottlenecks: [
    {
      issue: "Origin storage overload from cache misses",
      optimizationMD: `
Prefill hot assets into edge caches, use regional mid-tier caches, protect origin with request coalescing, and avoid cache churn before launches. Cache misses should be rare for popular titles and acceptable for long-tail assets.
`,
    },
    {
      issue: "Inefficient encoding wastes bandwidth",
      optimizationMD: `
Use per-title and per-scene ladder selection, codec-aware quality metrics, device-specific profiles, and continuous analysis of QoE telemetry. Reducing the average delivered bitrate from 6 Mbps to 5 Mbps at 40M peak streams saves about 40 Tbps of egress.
`,
    },
    {
      issue: "Playback steering chooses unhealthy edges",
      optimizationMD: `
Feed real-time edge health, cache hit ratio, ISP path quality, and client QoE into steering. Use canaries, hysteresis, backup hosts, and fast withdrawal of bad edges from manifests and DNS responses.
`,
    },
    {
      issue: "Recommendation scoring is too expensive online",
      optimizationMD: `
Precompute candidate sets and row rankings offline or nearline. The online service should fetch cached rows, blend fresh continue-watching and trends, and apply lightweight re-ranking instead of scoring the full catalog per request.
`,
    },
    {
      issue: "Viewing history receives out-of-order updates",
      optimizationMD: `
Make progress writes idempotent, include event timestamps and playback session ids, reject older offsets when appropriate, and use merge rules for completion versus resume state. Keep profile-level history reads fast for continue-watching.
`,
    },
    {
      issue: "DRM license service becomes a startup bottleneck",
      optimizationMD: `
Scale license issuance horizontally, keep entitlement checks as point lookups, cache safe session validations briefly, rate-limit abusive devices, and support license renewal without forcing full playback reauthorization.
`,
    },
  ],
  failureHandling: [
    {
      scenario: "Selected edge cache fails during playback",
      strategyMD: `
The player retries idempotent segment requests, then switches to backup hosts or requests a refreshed manifest. Steering removes the unhealthy edge, while cache control avoids sending new sessions there until health recovers.
`,
    },
    {
      scenario: "Cloud control plane is partially unavailable",
      strategyMD: `
Existing playback should continue using already issued signed URLs and licenses until expiry. Browse can serve cached catalog and fallback rows. New playback starts may fail closed if entitlement cannot be verified, especially for premium or region-restricted titles.
`,
    },
    {
      scenario: "Encoding job produces bad renditions",
      strategyMD: `
Validate renditions before publishing, keep versioned manifests, run canary playback on representative devices, and roll back manifest pointers to the previous known-good asset set. Do not mutate existing cache keys in place.
`,
    },
    {
      scenario: "Origin region or object store outage",
      strategyMD: `
Serve hot content from existing edge caches and replicated origin buckets. Freeze cache evictions for high-demand assets if possible, reroute miss fills to a healthy origin, and degrade long-tail titles before disrupting popular cached playback.
`,
    },
    {
      scenario: "Recommendation pipeline lags",
      strategyMD: `
Show cached personalized rows, regional trending rows, editorial collections, and continue-watching from the history store. Mark ranking output freshness internally but do not block browse or playback on model freshness.
`,
    },
    {
      scenario: "DRM or entitlement provider degrades",
      strategyMD: `
Use short-lived cached session validations only when policy allows, prioritize license renewals for active playback, shed suspicious or high-rate devices, and fail closed for new sessions when rights cannot be established.
`,
    },
  ],
  security: [
    {
      label: "DRM and key isolation",
      detailMD: `
Encrypt premium content and keep content keys in isolated key services. Licenses should be scoped to device, title, key ids, playback session, and expiry. Application logs must never contain raw keys or licenses.
`,
    },
    {
      label: "Signed manifests and segment URLs",
      detailMD: `
Manifest and segment URLs should carry short-lived tokens or signatures tied to the playback session, asset, region, and device class. This reduces hotlinking and makes leaked URLs expire quickly.
`,
    },
    {
      label: "Regional rights enforcement",
      detailMD: `
Catalog display, playback authorization, DRM licensing, and cache placement must all respect licensing windows. A title should not be pre-positioned or served from a region where it is not licensed.
`,
    },
    {
      label: "Account and profile protection",
      detailMD: `
Protect profile changes, parental controls, stream limits, and device registration with authentication, device trust, risk scoring, and rate limits. Playback APIs should not reveal another profile's history or recommendations.
`,
    },
    {
      label: "Telemetry privacy",
      detailMD: `
Viewing history and QoE telemetry are sensitive. Minimize raw identifiers, apply retention windows, separate analytics access from serving access, and honor regional privacy requirements for profile data and watch behavior.
`,
    },
    {
      label: "Abuse and credential sharing controls",
      detailMD: `
Detect abnormal concurrent streams, impossible travel, automated license scraping, and token replay. Use risk-based challenges and device limits without creating false positives that interrupt legitimate household viewing.
`,
    },
  ],
  tradeoffs: {
    pros: [
      "Separating control plane from data plane keeps cloud APIs out of the high-bandwidth segment path.",
      "Per-title encoding improves quality per bit and reduces CDN egress cost.",
      "ISP-embedded edge caches reduce latency, origin load, and transit cost for popular titles.",
      "Precomputed recommendations and continue-watching keep browse latency low while still personalizing the experience.",
      "Client-side ABR adapts to real network and device conditions without central coordination.",
    ],
    cons: [
      "Offline encoding and cache pre-positioning add operational complexity before a title can be published.",
      "Many device, codec, DRM, audio, and subtitle variants multiply testing and storage footprint.",
      "Edge placement decisions can be wrong, causing cache misses or evicting valuable regional content.",
      "Strict DRM and licensing checks can increase startup latency and create hard failure modes.",
      "Personalization depends on sensitive viewing data and requires strong privacy controls.",
    ],
    alternativesMD: `
Alternative one is to rely entirely on a third-party CDN. This is faster to launch and simpler operationally, but it gives less control over ISP placement, cache prefill, cost, and playback telemetry feedback.

Alternative two is to stream through application servers. This is acceptable only for a prototype or tiny catalog because application servers would become the video data plane and collapse under terabits of egress.

Alternative three is to use one fixed encoding ladder for all titles and devices. It reduces encoding complexity but wastes bandwidth on easy-to-encode titles and lowers quality for complex titles.
`,
    whenNotToUseMD: `
Do not build this full architecture for a small internal training video portal, a low-traffic course site, or an app with a tiny catalog. Use object storage, a managed CDN, simple encoding presets, and basic access tokens until bandwidth, device diversity, rights complexity, and personalization justify the added machinery.
`,
  },
  followUpQuestions: [
    {
      question: "Why not serve video through the Playback API?",
      answerMD: `
The Playback API handles authorization and steering, but segment egress is hundreds of terabits per second at peak. Serving bytes through application servers would be too expensive and fragile. The API should return signed URLs, while edge caches deliver segments directly to clients.
`,
    },
    {
      question: "How does the system choose which edge server a client should use?",
      answerMD: `
Use ISP and geography, edge health, cache residency, observed throughput, packet loss, device class, title rights, and recent QoE telemetry. The nearest edge is not always best if it is congested, missing the asset, or on a poor network path.
`,
    },
    {
      question: "What makes per-title encoding better than a fixed ladder?",
      answerMD: `
Different titles need different bitrates for the same perceived quality. Animation, dark scenes, grain, and fast motion behave differently. Per-title encoding spends bits where they improve quality and saves bandwidth where simpler content can look good at lower bitrates.
`,
    },
    {
      question: "How should continue-watching handle updates from two devices?",
      answerMD: `
Progress updates should include timestamps, playback session ids, and positions. The history service applies deterministic merge rules, ignores stale events, preserves completed state when appropriate, and exposes the latest resume position by profile and title.
`,
    },
    {
      question: "What happens if a title is not cached at the selected edge?",
      answerMD: `
For long-tail content, the edge can fill from origin or an upstream cache. For popular content, repeated misses indicate bad pre-positioning or steering. The system should coalesce fills, monitor miss rate, and adjust placement before origin becomes overloaded.
`,
    },
    {
      question: "Where do recommendations run: online or offline?",
      answerMD: `
Most expensive candidate generation and ranking should run offline or nearline. The online service fetches cached rows, blends fresh continue-watching and regional trends, and does lightweight re-ranking. Full catalog scoring on every request is too slow.
`,
    },
    {
      question: "How do DRM and signed URLs work together?",
      answerMD: `
Signed URLs limit who can fetch encrypted segments and for how long. DRM licenses give authorized devices the keys needed to decrypt those segments. Both are needed: signed URLs reduce theft and hotlinking, while DRM protects the content after bytes reach the device.
`,
    },
  ],
  companyVariations: [
    {
      company: "Netflix",
      angleMD: `
Netflix interviewers expect depth on Open Connect style edge caching, per-title encoding, playback QoE, ABR behavior, catalog rights, and personalization. Be explicit that cloud APIs are the control plane and edge caches are the data plane.
`,
    },
    {
      company: "Amazon",
      angleMD: `
Amazon may frame this around Prime Video scale, AWS services, multi-region resiliency, cost, object storage, CDN economics, and operational ownership. Expect follow-ups on origin protection, rights enforcement, and how to keep the control plane available during large releases.
`,
    },
    {
      company: "Google",
      angleMD: `
Google often probes global serving, YouTube-like video infrastructure, ranking quality, client adaptation, storage efficiency, and tail latency. Be ready to discuss codec choices, cache hierarchy, feature pipelines, and data-driven QoE optimization.
`,
    },
  ],
  relatedQuestions: [
    {
      slug: "youtube",
      note: "Shares video ingestion, encoding, playback, CDN, recommendations, and QoE challenges.",
    },
    {
      slug: "distributed-cache",
      note: "Edge cache placement, cache hit ratio, and origin protection are central to video streaming cost and latency.",
    },
    {
      slug: "global-load-balancer",
      note: "Playback steering resembles global routing using health, geography, and path quality signals.",
    },
    {
      slug: "control-plane",
      note: "Netflix is a strong example of separating cloud control APIs from a high-bandwidth data plane.",
    },
    {
      slug: "model-serving-platform",
      note: "Recommendation ranking uses offline and online model outputs to personalize the catalog.",
    },
  ],
  interviewTips: {
    commonMistakes: [
      "Routing video bytes through API servers instead of CDN edge caches.",
      "Ignoring offline encoding, per-title ladders, and device compatibility.",
      "Treating recommendations as a simple database query instead of a ranking pipeline.",
      "Forgetting licensing, regional rights, DRM, and signed segment URLs.",
      "Not giving concrete capacity numbers for egress, segment requests, and catalog storage.",
    ],
    redFlags: [
      "No separation between control plane and data plane.",
      "No explanation of how the player switches bitrate or recovers from poor networks.",
      "No cache pre-positioning or origin protection strategy for new releases.",
      "No plan for continue-watching consistency across devices.",
      "No privacy or security treatment for viewing history and DRM keys.",
    ],
    expectations: [
      "Start with playback and egress scale, then draw the control and data plane split.",
      "Explain the offline media pipeline before the live playback request path.",
      "Use edge caches, origin storage, steering, DRM, catalog, recommendations, and history as separate concerns.",
      "Give realistic math for subscribers, concurrent streams, petabytes of catalog, and terabits of egress.",
      "Discuss tradeoffs among quality, startup time, cache footprint, rights enforcement, and cost.",
    ],
    communicationMD: `
Lead with the core insight: Netflix is a video data-plane problem wrapped by a rich control plane. Draw the path from client to edge cache for segments, then add the cloud services that authorize and personalize that path. Make the offline encoding and cache pre-positioning story explicit before diving into recommendations or databases. Use concrete numbers to show why the CDN design is necessary.
`,
  },
  revisionNotesMD: `
- Design around two planes: control plane APIs in cloud, video data plane from CDN edge caches to clients.
- At 40M concurrent streams and 5 Mbps average delivered bitrate, peak egress is about 200 Tbps.
- If players fetch 4-second segments, 40M active streams generate about 10M segment requests per second.
- A 250K-hour catalog at 80 GB per encoded hour is about 20 PB before replication and about 60 PB with three durable copies.
- Offline encoding creates per-title, per-device ABR ladders for codecs, resolutions, audio, subtitles, packaging, and DRM.
- ISP-embedded edge caches should be prefilled with regionally hot assets before demand arrives.
- Playback steering chooses an edge using health, ISP, cache residency, rights, device capabilities, and QoE telemetry.
- The client performs adaptive bitrate switching based on bandwidth, buffer, decode performance, and errors.
- Catalog metadata controls what can be shown and played; recommendations decide what should be ranked first.
- Viewing history powers continue-watching and personalization, but it can be eventually consistent with deterministic merge rules.
- DRM licenses and signed URLs protect content and enforce regional and device entitlements.
`,
  flashcards: [
    {
      front: "What is the main control plane versus data plane split in Netflix?",
      back: "Cloud APIs authorize, personalize, and steer playback; CDN edge caches deliver the actual video segments to clients.",
    },
    {
      front: "Why use per-title encoding?",
      back: "Different titles need different bitrates for the same quality, so per-title ladders improve quality per bit and reduce egress cost.",
    },
    {
      front: "What does playback steering choose?",
      back: "It chooses a device-compatible manifest and edge cache using entitlement, region, ISP, edge health, cache residency, and QoE signals.",
    },
    {
      front: "Why pre-position content into ISP edge caches?",
      back: "Prefill keeps hot segments close to viewers before demand spikes, reducing startup latency, origin load, and transit cost.",
    },
    {
      front: "Who decides the next bitrate during playback?",
      back: "The client player decides using throughput, buffer depth, device limits, dropped frames, and recent segment performance.",
    },
    {
      front: "How big is 40M streams at 5 Mbps each?",
      back: "About 200 Tbps of peak video egress before protocol overhead.",
    },
    {
      front: "Why not score the full catalog on every home request?",
      back: "It is too slow and expensive; use offline or nearline candidate generation and ranking, then serve cached rows with light online blending.",
    },
    {
      front: "What protects premium video after bytes reach the device?",
      back: "DRM licenses provide decryption keys only to authorized playback sessions and supported devices.",
    },
    {
      front: "What store powers continue-watching?",
      back: "A profile-partitioned viewing history store that tracks title, position, state, and last played time.",
    },
  ],
  quiz: [
    {
      question: "Why should Netflix not proxy video segments through the Playback API?",
      options: ["The Playback API cannot authenticate users", "Video egress is massive and should be served by CDN edge caches", "Catalog metadata must be stored in the player", "DRM works only when segments pass through APIs"],
      answerIndex: 1,
      explanationMD: `
The Playback API is control plane. At peak, segment delivery can reach hundreds of terabits per second, so the CDN data plane must serve bytes directly to clients.
`,
    },
    {
      question: "What is the main purpose of per-title encoding?",
      options: ["Make every title use the same bitrate ladder", "Improve quality per bit by tailoring ladders to content complexity", "Remove the need for subtitles", "Avoid content encryption"],
      answerIndex: 1,
      explanationMD: `
Per-title encoding analyzes each title and chooses bitrates that achieve good quality without wasting bandwidth on easy-to-encode content.
`,
    },
    {
      question: "Given 40M concurrent streams at 5 Mbps each, what is the approximate peak video egress?",
      options: ["20 Gbps", "2 Tbps", "200 Tbps", "2,000 PB per second"],
      answerIndex: 2,
      explanationMD: `
40M times 5 Mbps is 200M Mbps, which is 200 Tbps before overhead.
`,
    },
    {
      question: "Which component should make adaptive bitrate decisions during playback?",
      options: ["The client player", "The catalog database", "The billing service", "The offline encoder after playback starts"],
      answerIndex: 0,
      explanationMD: `
The client observes current throughput, buffer, dropped frames, and device constraints, so it is best positioned to choose the next segment bitrate.
`,
    },
    {
      question: "What is the best way to serve continue-watching quickly?",
      options: ["Scan all watch events on every home request", "Use a profile-partitioned viewing history store with latest positions", "Ask the CDN cache for watch history", "Store progress only in client memory"],
      answerIndex: 1,
      explanationMD: `
Continue-watching is profile-centric. A compact history record by profile and title avoids expensive event scans and works across devices.
`,
    },
    {
      question: "Why pre-position a new season before release time?",
      options: ["To avoid all users fetching the first segments from origin at once", "To bypass regional licensing checks", "To make recommendations unnecessary", "To remove DRM encryption"],
      answerIndex: 0,
      explanationMD: `
Prefilling popular assets into edge caches prevents origin stampedes and gives users faster startup when demand arrives at the same time.
`,
    },
  ],
  cheatSheetMD: `
**Goal**: stream licensed VOD content globally with fast startup, low buffering, high quality, correct rights enforcement, and personalized discovery.

**Scale**: 300M subscribers, 120M daily active viewers, 40M peak concurrent streams, about 200 Tbps peak egress, and about 10M segment requests per second with 4-second segments.

**Storage**: 250K catalog hours times about 80 GB per encoded hour is about 20 PB of encoded origin assets. With three durable copies, plan for 60 PB plus metadata, artwork, subtitles, and staging outputs.

**Offline pipeline**: ingest mezzanine files, analyze content complexity, generate per-title and per-device ABR ladders, package HLS or DASH, encrypt, validate, and publish immutable assets to origin storage.

**CDN**: pre-position hot regional assets into ISP-embedded edge caches. Edge caches serve segment bytes; origin handles publishing, prefill, and long-tail misses.

**Playback start**: client calls the Playback and Steering API. The API checks subscription, profile, region, device, rights, DRM, edge health, and cache availability, then returns signed manifest and segment URLs.

**ABR**: client chooses the next rendition based on throughput, buffer, device decode ability, viewport, dropped frames, and recent errors.

**Catalog and personalization**: catalog determines what can be shown and played; ranking decides ordering. Viewing history powers continue-watching and feeds recommendation features.

**Security**: enforce regional rights, signed URLs, DRM licenses, key isolation, parental controls, stream limits, privacy controls, and abuse detection.

**Reliability**: existing playback should survive partial control-plane outages. Edge failures require retry, alternate hosts, manifest refresh, and fast steering withdrawal.
`,
  references: [
    {
      title: "Open Connect",
      kind: "Docs",
      url: "https://openconnect.netflix.com/en/",
      author: "Netflix",
    },
    {
      title: "Per-Title Encode Optimization",
      kind: "Blog",
      url: "https://netflixtechblog.com/per-title-encode-optimization-7e99442b62a2",
      author: "Netflix Technology Blog",
    },
    {
      title: "Dynamic Optimizer - A Perceptual Video Encoding Optimization Framework",
      kind: "Blog",
      url: "https://netflixtechblog.com/dynamic-optimizer-a-perceptual-video-encoding-optimization-framework-e19f1e3a277f",
      author: "Netflix Technology Blog",
    },
    {
      title: "Designing Data-Intensive Applications",
      kind: "Book",
      author: "Martin Kleppmann",
    },
  ],
};
