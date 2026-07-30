import type { LLDProblemContent } from "../types";
import { referenceFiles } from "./reference-solutions";

export const rateLimiter: LLDProblemContent = {
  slug: "rate-limiter",

  statementMD: [
    "Design the object model for an **in-memory rate limiter** that decides whether a request from a client should be allowed or rejected.",
    "",
    "The design must keep the public API small, keep mutable state isolated per client, and make the limiting algorithm pluggable. The target algorithm family includes **fixed window**, **sliding window log**, **sliding window counter**, **token bucket**, and **leaky bucket**. The provided reference implementation demonstrates the core Strategy seam with **TokenBucketRateLimiter** and **SlidingWindowRateLimiter**.",
    "",
    "This is the **object-design** view of rate limiting. Stay inside one service process: no Redis, no distributed counters, no gateway routing, and no cross-region consistency problem.",
  ].join("\n"),

  businessContextMD: [
    "Rate limiting appears in API gateways, SaaS tenant throttling, login protection, webhooks, and internal platform quotas. Interviewers use it as an advanced LLD problem because it combines algorithm tradeoffs with object boundaries: Strategy for algorithms, a factory for construction, a shared configured limiter instance, and careful thread-safety around per-client mutable state.",
    "",
    "A strong answer does not jump straight to a distributed cache. It first shows that the candidate can model **RateLimiter**, **RateLimitConfig**, per-client state, and a construction seam cleanly enough that new algorithms can be added without changing callers.",
  ].join("\n"),

  functionalRequirements: [
    "Expose a single decision API: allow or reject a request for a given client id.",
    "Maintain independent rate-limit state for each client key.",
    "Support algorithms behind a common strategy interface: fixed window, sliding window log, sliding window counter, token bucket, and leaky bucket.",
    "Provide a factory that builds the correct limiter from an algorithm choice and configuration.",
    "Support configurable capacity, refill rate, request window, and maximum requests.",
    "Make request decisions thread safe when multiple threads call the same limiter.",
    "Create per-client state lazily when the first request from that client arrives.",
    "Keep callers unaware of algorithm-specific state such as token counts or timestamp logs.",
  ],

  nonFunctionalRequirements: [
    {
      label: "Thread-safety",
      detailMD:
        "Two concurrent requests for the same client must not both pass by racing on the same bucket or timestamp deque. Different clients should still proceed in parallel.",
    },
    {
      label: "Extensibility",
      detailMD:
        "A new algorithm should be a new **RateLimiter** implementation plus a factory case, not a rewrite of application code.",
    },
    {
      label: "Per-client isolation",
      detailMD:
        "Client A exhausting its quota must not affect Client B because their mutable state lives in different map entries.",
    },
    {
      label: "Low latency",
      detailMD:
        "The hot path should do only a map lookup, a small synchronized state update, and a constant or window-bounded calculation.",
    },
    {
      label: "Memory discipline",
      detailMD:
        "Timestamp-based strategies can grow with recent traffic; the design should make state ownership clear so cleanup and eviction can be added.",
    },
  ],

  requirementClarification: [
    {
      question: "Is this an in-process limiter or a distributed limiter?",
      answerMD:
        "Assume one service instance and in-memory state. Distributed counters, Redis, sharding, and replication are HLD extensions, not part of this LLD scope.",
    },
    {
      question: "What identifies a client?",
      answerMD:
        "A **String clientId** is enough for the base design. In production it might be an API key, tenant id, user id, IP address, or a composite key.",
    },
    {
      question: "Should rejection include retry metadata?",
      answerMD:
        "The reference API returns a boolean to keep the core object model focused. A richer result object with retry-after and remaining-quota fields is an easy extension.",
    },
    {
      question: "Do all algorithms need exact fairness?",
      answerMD:
        "No. Sliding window log is exact but can store many timestamps. Token bucket allows bursts. Fixed window is simple but has boundary spikes. Sliding counter smooths boundaries approximately. Leaky bucket smooths output rate.",
    },
    {
      question: "Can limits change while the process is running?",
      answerMD:
        "The reference **RateLimitConfig** is immutable. Dynamic config can be layered later with a config provider or by swapping the shared limiter instance at the composition root.",
    },
  ],

  classDiagramMermaid: [
    "classDiagram",
    "    class RateLimiter {",
    "        <<interface>>",
    "        +allowRequest(String) boolean",
    "    }",
    "    class RateLimitConfig {",
    "        -int capacity",
    "        -double refillPerSecond",
    "        -long windowMillis",
    "        -int maxRequests",
    "        +getCapacity() int",
    "        +getRefillPerSecond() double",
    "        +getWindowMillis() long",
    "        +getMaxRequests() int",
    "    }",
    "    class TokenBucket {",
    "        -int capacity",
    "        -double refillPerSecond",
    "        -double tokens",
    "        -long lastRefillNanos",
    "        +tryConsume() boolean",
    "    }",
    "    class TokenBucketRateLimiter {",
    "        -RateLimitConfig config",
    "        -ConcurrentMap~String,TokenBucket~ buckets",
    "        +allowRequest(String) boolean",
    "    }",
    "    class SlidingWindowRateLimiter {",
    "        -RateLimitConfig config",
    "        -ConcurrentMap~String,Deque~ requests",
    "        +allowRequest(String) boolean",
    "    }",
    "    class RateLimiterFactory {",
    "        +create(Algorithm, RateLimitConfig) RateLimiter",
    "    }",
    "    class Algorithm {",
    "        <<enumeration>>",
    "        TOKEN_BUCKET",
    "        SLIDING_WINDOW_LOG",
    "    }",
    "    RateLimiter <|.. TokenBucketRateLimiter",
    "    RateLimiter <|.. SlidingWindowRateLimiter",
    "    TokenBucketRateLimiter o-- RateLimitConfig",
    "    TokenBucketRateLimiter o-- TokenBucket",
    "    SlidingWindowRateLimiter o-- RateLimitConfig",
    "    RateLimiterFactory ..> Algorithm",
    "    RateLimiterFactory ..> TokenBucketRateLimiter",
    "    RateLimiterFactory ..> SlidingWindowRateLimiter",
  ].join("\n"),
  classDiagramCaptionMD:
    "The stable dependency is from callers to **RateLimiter**. Concrete strategies own their per-client state, while **RateLimiterFactory** centralizes construction from the **Algorithm** choice.",

  sequenceDiagramMermaid: [
    "sequenceDiagram",
    "    actor Caller",
    "    participant Factory as RateLimiterFactory",
    "    participant Limiter as TokenBucketRateLimiter",
    "    participant Buckets as BucketsMap",
    "    participant Bucket as TokenBucket",
    "    Caller->>Factory: create(TOKEN_BUCKET, config)",
    "    Factory-->>Caller: RateLimiter",
    "    Caller->>Limiter: allowRequest(clientA)",
    "    Limiter->>Buckets: computeIfAbsent(clientA)",
    "    Buckets-->>Limiter: TokenBucket",
    "    Limiter->>Bucket: tryConsume()",
    "    Bucket->>Bucket: refill from elapsed time",
    "    alt token available",
    "        Bucket-->>Limiter: true",
    "        Limiter-->>Caller: allow",
    "    else no token",
    "        Bucket-->>Limiter: false",
    "        Limiter-->>Caller: reject",
    "    end",
  ].join("\n"),
  sequenceDiagramCaptionMD:
    "The factory is used at startup or composition time. The request path performs a per-client lookup and synchronizes only inside the selected client's mutable state.",

  entities: [
    {
      name: "RateLimiter",
      responsibilityMD:
        "Strategy interface. It defines the only operation the application needs: **allowRequest(clientId)**.",
      attributes: ["allowRequest(clientId)"],
    },
    {
      name: "RateLimitConfig",
      responsibilityMD:
        "Immutable configuration object carrying all tuning knobs used by the concrete algorithms. It validates that capacity, refill rate, window, and request limit are positive.",
      attributes: ["capacity", "refillPerSecond", "windowMillis", "maxRequests"],
    },
    {
      name: "TokenBucket",
      responsibilityMD:
        "Per-client mutable state for token bucket limiting. It refills from elapsed nanoseconds, caps tokens at capacity, and atomically consumes one token when available.",
      attributes: ["capacity", "refillPerSecond", "tokens", "lastRefillNanos"],
    },
    {
      name: "TokenBucketRateLimiter",
      responsibilityMD:
        "Concrete **RateLimiter** strategy for burst-friendly limits. It stores a concurrent map from client id to **TokenBucket** and delegates the critical update to the bucket.",
      attributes: ["config", "buckets"],
    },
    {
      name: "SlidingWindowRateLimiter",
      responsibilityMD:
        "Concrete **RateLimiter** strategy for exact sliding windows. It stores a recent timestamp deque per client, prunes expired entries, and appends the current request only when under limit.",
      attributes: ["config", "requests"],
    },
    {
      name: "RateLimiterFactory",
      responsibilityMD:
        "Creation boundary. It maps **Algorithm** values to concrete **RateLimiter** implementations so callers never directly choose constructors.",
      attributes: ["create(algorithm, config)", "Algorithm"],
    },
  ],

  patternsUsed: [
    {
      name: "Strategy",
      whyMD:
        "**RateLimiter** is the strategy interface. **TokenBucketRateLimiter** and **SlidingWindowRateLimiter** implement different algorithms behind the same method, and fixed window, sliding counter, or leaky bucket can be added the same way.",
    },
    {
      name: "Factory Method",
      whyMD:
        "**RateLimiterFactory.create** centralizes algorithm selection. Application code asks for an algorithm by enum and receives a **RateLimiter**, keeping constructors and switch logic out of callers.",
    },
    {
      name: "Singleton",
      whyMD:
        "A service should share one configured limiter instance per quota policy so per-client maps are not fragmented. The reference factory is stateless with a private constructor; in a larger app the composition root or provider exposes the selected limiter as a singleton.",
    },
  ],

  designSteps: [
    {
      title: "Define the stable strategy interface",
      detailMD:
        "The caller should not know if the active algorithm is token bucket, sliding log, fixed window, sliding counter, or leaky bucket. One boolean method keeps integration narrow.",
      code: [
        "public interface RateLimiter {",
        "    boolean allowRequest(String clientId);",
        "}",
      ].join("\n"),
    },
    {
      title: "Capture algorithm knobs in an immutable config",
      detailMD:
        "**RateLimitConfig** holds capacity, refill rate, window length, and max requests. Validating once at construction keeps every strategy from repeating defensive checks.",
      code: [
        "public RateLimitConfig(int capacity, double refillPerSecond, long windowMillis, int maxRequests) {",
        "    if (capacity <= 0 || refillPerSecond <= 0 || windowMillis <= 0 || maxRequests <= 0) {",
        "        throw new IllegalArgumentException(\"Rate limit values must be positive\");",
        "    }",
        "    this.capacity = capacity;",
        "    this.refillPerSecond = refillPerSecond;",
        "    this.windowMillis = windowMillis;",
        "    this.maxRequests = maxRequests;",
        "}",
      ].join("\n"),
    },
    {
      title: "Model token bucket state per client",
      detailMD:
        "**TokenBucket** owns the mutable token count for one client. **tryConsume** is synchronized, so refill and decrement happen as one critical section.",
      code: [
        "public synchronized boolean tryConsume() {",
        "    refill();",
        "    if (tokens < 1.0) {",
        "        return false;",
        "    }",
        "    tokens -= 1.0;",
        "    return true;",
        "}",
      ].join("\n"),
    },
    {
      title: "Use a concurrent map for lazy client state",
      detailMD:
        "**TokenBucketRateLimiter** uses **ConcurrentHashMap.computeIfAbsent** so client buckets are created only when needed and different clients can be looked up concurrently.",
      code: [
        "public boolean allowRequest(String clientId) {",
        "    TokenBucket bucket = buckets.computeIfAbsent(",
        "        clientId,",
        "        key -> new TokenBucket(config.getCapacity(), config.getRefillPerSecond())",
        "    );",
        "    return bucket.tryConsume();",
        "}",
      ].join("\n"),
    },
    {
      title: "Implement exact sliding window with a per-client deque",
      detailMD:
        "**SlidingWindowRateLimiter** removes timestamps outside the current window, checks the deque size, and appends the current timestamp only when the client is still under quota.",
      code: [
        "synchronized (clientLog) {",
        "    long cutoff = now - config.getWindowMillis();",
        "    while (!clientLog.isEmpty() && clientLog.peekFirst() <= cutoff) {",
        "        clientLog.removeFirst();",
        "    }",
        "    if (clientLog.size() >= config.getMaxRequests()) {",
        "        return false;",
        "    }",
        "    clientLog.addLast(now);",
        "    return true;",
        "}",
      ].join("\n"),
    },
    {
      title: "Keep algorithm selection in the factory",
      detailMD:
        "**RateLimiterFactory** maps an enum to a concrete strategy. Adding fixed window, sliding window counter, or leaky bucket means adding a new implementation and a new enum case.",
      code: [
        "public static RateLimiter create(Algorithm algorithm, RateLimitConfig config) {",
        "    switch (algorithm) {",
        "        case TOKEN_BUCKET:",
        "            return new TokenBucketRateLimiter(config);",
        "        case SLIDING_WINDOW_LOG:",
        "            return new SlidingWindowRateLimiter(config);",
        "        default:",
        "            throw new IllegalArgumentException(\"Unknown algorithm: \" + algorithm);",
        "    }",
        "}",
      ].join("\n"),
    },
  ],

  implementation: referenceFiles("design-rate-limiter-lld"),

  classExplanations: [
    {
      className: "RateLimiter",
      detailMD:
        "The strategy interface. It keeps every caller dependent on **allowRequest(String)** rather than on a specific algorithm, which is the core seam for plugging in more limiters.",
    },
    {
      className: "RateLimitConfig",
      detailMD:
        "Immutable value object for algorithm tuning. It validates that all numeric limits are positive and exposes read-only getters for capacity, refill rate, window size, and max requests.",
    },
    {
      className: "TokenBucket",
      detailMD:
        "Per-client token state. It starts full, computes refill from elapsed nanoseconds, caps tokens at capacity, and synchronizes **tryConsume** so no two threads overspend the same token.",
    },
    {
      className: "TokenBucketRateLimiter",
      detailMD:
        "Concrete burst-friendly strategy. It stores **ConcurrentMap<String, TokenBucket>** conceptually as client id to bucket, creates buckets lazily, and delegates the critical decision to the bucket.",
    },
    {
      className: "SlidingWindowRateLimiter",
      detailMD:
        "Concrete exact-window strategy. It stores a timestamp deque per client, synchronizes on that deque, prunes expired timestamps, checks **maxRequests**, and records the allowed request.",
    },
    {
      className: "RateLimiterFactory",
      detailMD:
        "Static construction boundary with a private constructor and nested **Algorithm** enum. It returns **TokenBucketRateLimiter** or **SlidingWindowRateLimiter** based on the selected algorithm.",
    },
  ],

  dryRun: {
    inputMD:
      "Token bucket config: capacity **3**, refill **1 token/sec**. Client A sends four immediate requests, Client B sends one request, then Client A retries after two seconds.",
    columns: ["Step", "Time", "Client", "State before", "Decision", "State after"],
    rows: [
      ["1", "t=0", "A", "3.0 tokens", "Allow", "2.0 tokens"],
      ["2", "t=0", "A", "2.0 tokens", "Allow", "1.0 tokens"],
      ["3", "t=0", "A", "1.0 tokens", "Allow", "0.0 tokens"],
      ["4", "t=0", "A", "0.0 tokens", "Reject", "0.0 tokens"],
      ["5", "t=0", "B", "new bucket with 3.0 tokens", "Allow", "B has 2.0 tokens"],
      ["6", "t=2s", "A", "refills to 2.0 tokens", "Allow", "1.0 token"],
    ],
    narrativeMD:
      "Client A and Client B do not share quota. A is rejected only after its own bucket is empty, while B receives a fresh bucket. The retry after two seconds shows elapsed-time refill before consumption.",
  },

  complexity: [
    {
      operation: "TokenBucketRateLimiter.allowRequest",
      time: "O(1)",
      space: "O(C)",
      note: "C is number of active clients; each client stores one TokenBucket.",
    },
    {
      operation: "SlidingWindowRateLimiter.allowRequest",
      time: "O(E)",
      space: "O(C × R)",
      note: "E expired timestamps may be pruned; R is max requests retained per active client window.",
    },
    {
      operation: "RateLimiterFactory.create",
      time: "O(1)",
      space: "O(1)",
      note: "Switches on the enum and returns one concrete strategy instance.",
    },
    {
      operation: "Adding a new strategy",
      time: "O(1) caller impact",
      space: "Strategy-specific",
      note: "Callers stay unchanged because they depend on RateLimiter.",
    },
  ],
  complexityNotesMD:
    "Token bucket is constant-time per request and memory-light. Sliding window log is exact but can spend time pruning and stores recent timestamps. Fixed window and sliding counter reduce storage, while leaky bucket smooths throughput with queue-like state.",

  extensibility: [
    {
      label: "Fixed window strategy",
      detailMD:
        "Add a **FixedWindowRateLimiter** with per-client window start and count. It is simple and memory-light but allows bursts at window boundaries.",
    },
    {
      label: "Sliding window counter strategy",
      detailMD:
        "Add current and previous window counters per client, then weight the previous count by overlap. This lowers memory versus a full timestamp log.",
    },
    {
      label: "Leaky bucket strategy",
      detailMD:
        "Add a per-client queue or next-allowed-time state that drains at a constant rate. This smooths output rather than allowing token-bucket bursts.",
    },
    {
      label: "Richer decision response",
      detailMD:
        "Replace boolean with **RateLimitResult** containing allowed, remaining, reset time, and retry-after. Existing strategies can compute those fields from their state.",
    },
    {
      label: "Client state cleanup",
      detailMD:
        "Introduce last-access timestamps and a background eviction policy so maps do not retain inactive clients forever.",
    },
  ],

  alternativeDesigns: [
    {
      name: "Fixed window counter",
      detailMD:
        "Store **windowStart** and **count** for each client. Reset the count when the current time crosses the window boundary.",
      tradeoffsMD:
        "Very fast and tiny memory footprint, but a client can send nearly two windows worth of requests around a boundary.",
    },
    {
      name: "Sliding window counter",
      detailMD:
        "Store counts for current and previous windows, then estimate usage as current count plus previous count weighted by overlap.",
      tradeoffsMD:
        "Smoother than fixed window and much smaller than sliding log, but it is approximate rather than exact.",
    },
    {
      name: "Leaky bucket queue",
      detailMD:
        "Model each client as a queue drained at a fixed rate or as a next-allowed timestamp. Requests are accepted only if the queue is not full.",
      tradeoffsMD:
        "Excellent for smoothing traffic, but less natural when the product explicitly wants burst capacity.",
    },
    {
      name: "Global synchronized limiter",
      detailMD:
        "Synchronize the entire **allowRequest** method and keep one map for all client state.",
      tradeoffsMD:
        "Easiest to reason about, but all clients contend on one monitor, so unrelated tenants block one another.",
    },
  ],

  commonMistakes: [
    "Putting every algorithm in one giant **if** or **switch** inside a single limiter class instead of using Strategy.",
    "Using a plain **HashMap** for client state while multiple threads call **allowRequest**.",
    "Synchronizing the entire limiter and accidentally serializing all clients.",
    "Sharing one **TokenBucket** across all clients, turning a per-client limit into a global limit.",
    "Forgetting to prune old timestamps in the sliding window log before checking size.",
    "Letting the factory return different limiter instances for the same policy on every request, fragmenting state.",
    "Claiming token bucket and leaky bucket are identical; one permits bursts up to capacity, the other smooths output.",
  ],

  followUps: [
    {
      question: "How would you add fixed window without changing callers?",
      answerMD:
        "Create **FixedWindowRateLimiter implements RateLimiter**, keep per-client count and window start, add a **FIXED_WINDOW** enum value, and add one factory case.",
    },
    {
      question: "Why synchronize on the bucket or deque instead of the whole limiter?",
      answerMD:
        "Only requests for the same client compete for the same mutable state. Per-client locking preserves correctness while allowing different clients to proceed concurrently.",
    },
    {
      question: "How do you prevent client maps from growing forever?",
      answerMD:
        "Track last-access time in each client state and periodically evict entries that are idle beyond a retention window. The state owner makes this extension straightforward.",
    },
    {
      question: "When would you choose sliding window log over token bucket?",
      answerMD:
        "Choose sliding window log when exact count within the last N milliseconds matters more than memory. Choose token bucket when burst tolerance and constant-time decisions matter more.",
    },
    {
      question: "Where does Singleton fit without hiding dependencies?",
      answerMD:
        "Keep construction explicit at startup, then share one configured **RateLimiter** instance per policy through dependency injection or a provider. Avoid a hard global that tests cannot replace.",
    },
  ],

  productionConsiderations: [
    {
      label: "Clock control",
      detailMD:
        "Inject a clock for deterministic tests and consistent time calculations. The reference uses system time directly to keep the practice code compact.",
    },
    {
      label: "State lifecycle",
      detailMD:
        "Add idle-client eviction, maximum map size, and metrics around active client count so abusive or forgotten client ids do not leak memory.",
    },
    {
      label: "Observability",
      detailMD:
        "Emit allow count, reject count, decision latency, active clients, and per-policy saturation. These metrics reveal whether limits are too strict or too loose.",
    },
    {
      label: "Configuration rollout",
      detailMD:
        "Treat config as a versioned policy. If limits change, decide whether existing client state is migrated, reset, or allowed to drain naturally.",
    },
    {
      label: "Boundary behavior",
      detailMD:
        "Document each algorithm's fairness tradeoff. Fixed windows have boundary spikes; token bucket has bursts; sliding log is exact but memory-heavy.",
    },
  ],

  interviewNotes: [
    "Did the candidate separate the stable **RateLimiter** API from algorithm-specific state?",
    "Can they explain why per-client state needs synchronization even when the map is concurrent?",
    "Do they know the tradeoffs among fixed window, sliding log, sliding counter, token bucket, and leaky bucket?",
    "Is the factory used as a construction boundary rather than scattered constructor calls?",
    "Do they understand why one shared configured limiter instance matters for consistent quota state?",
    "Can they keep the discussion at LLD scope and avoid jumping to distributed storage too early?",
  ],

  quiz: [
    {
      question: "Why does the design make **RateLimiter** an interface?",
      options: [
        "So callers can use different algorithms without changing their integration code",
        "So Java can store more requests in memory",
        "So all clients share one token bucket",
        "So the factory can be removed",
      ],
      answerIndex: 0,
      explanationMD:
        "The interface is the Strategy seam. Callers depend on one method while concrete algorithms vary independently.",
    },
    {
      question: "What does **ConcurrentHashMap** protect in the reference design?",
      options: [
        "All mutations inside each TokenBucket",
        "Thread-safe lookup and lazy creation of per-client state entries",
        "The exact order of timestamps inside every deque",
        "The factory switch statement",
      ],
      answerIndex: 1,
      explanationMD:
        "The concurrent map makes entry lookup and creation safe. The mutable bucket or deque still needs its own synchronization.",
    },
    {
      question: "Why is **TokenBucket.tryConsume** synchronized?",
      options: [
        "To make **System.nanoTime** faster",
        "To ensure refill and token decrement happen atomically for one client",
        "To prevent other clients from using their own buckets",
        "To make the factory return a singleton",
      ],
      answerIndex: 1,
      explanationMD:
        "The race is within one client's token state. Refill, availability check, and decrement must be one critical section.",
    },
    {
      question: "Which algorithm is exact but can store many timestamps per active client?",
      options: [
        "Fixed window counter",
        "Sliding window log",
        "Token bucket",
        "Factory method",
      ],
      answerIndex: 1,
      explanationMD:
        "Sliding window log records recent request times exactly, then prunes expired timestamps on each decision.",
    },
    {
      question: "What is the main risk of creating a new limiter instance for every request?",
      options: [
        "The Java compiler rejects the interface",
        "Per-client state is fragmented, so quotas are not enforced consistently",
        "The factory cannot use an enum",
        "Sliding window log becomes a token bucket",
      ],
      answerIndex: 1,
      explanationMD:
        "The limiter owns client state. Recreating it per request resets or splits that state, effectively bypassing the quota.",
    },
  ],

  practiceVariants: [
    {
      title: "Add **FixedWindowRateLimiter**",
      detailMD:
        "Implement per-client window start and count, add **FIXED_WINDOW** to the factory enum, and document the boundary-burst tradeoff.",
      difficulty: "Beginner",
    },
    {
      title: "Return rich limit results",
      detailMD:
        "Replace boolean with a result object that includes allowed, remaining quota, retry-after millis, and reset time without breaking strategy boundaries.",
      difficulty: "Intermediate",
    },
    {
      title: "Inject a test clock",
      detailMD:
        "Refactor both token bucket and sliding window strategies to use an injected clock so tests can advance time deterministically.",
      difficulty: "Intermediate",
    },
    {
      title: "Add idle-client eviction",
      detailMD:
        "Track last access on each client state and evict idle entries safely without blocking the hot path for all clients.",
      difficulty: "Advanced",
    },
  ],

  flashcards: [
    {
      front: "What is the Strategy interface in this design?",
      back: "**RateLimiter** with **allowRequest(clientId)**.",
    },
    {
      front: "Where is token bucket mutable state stored?",
      back: "Inside one **TokenBucket** per client, held by **TokenBucketRateLimiter**.",
    },
    {
      front: "Why is a concurrent map not enough by itself?",
      back: "It protects map operations, but the per-client bucket or deque still has multi-step mutable updates that need synchronization.",
    },
    {
      front: "What does **RateLimiterFactory** hide?",
      back: "The mapping from **Algorithm** values to concrete limiter constructors.",
    },
    {
      front: "Which algorithm is exact for the last window?",
      back: "Sliding window log, because it stores and prunes real request timestamps.",
    },
    {
      front: "Why share one configured limiter instance?",
      back: "The limiter owns per-client state; sharing it keeps quota decisions consistent across calls in the same process.",
    },
  ],

  cheatSheetMD: [
    "**Core API:** RateLimiter.allowRequest(clientId) returns allow or reject.",
    "",
    "**Reference classes:** RateLimiter, RateLimitConfig, TokenBucket, TokenBucketRateLimiter, SlidingWindowRateLimiter, RateLimiterFactory.",
    "",
    "**Patterns:** Strategy for algorithms; Factory Method for construction; Singleton at composition root for one shared configured limiter per policy.",
    "",
    "**Thread-safety:** ConcurrentHashMap for per-client state lookup; synchronize the bucket or deque for same-client mutation.",
    "",
    "**Algorithm tradeoffs:** fixed window is simple but spiky; sliding log is exact but memory-heavy; sliding counter is approximate; token bucket allows bursts; leaky bucket smooths output.",
    "",
    "**Complexity:** token bucket O(1) per request; sliding log O(E) prune work; memory grows with active clients and retained per-client state.",
    "",
    "**Extensions:** add new strategies behind RateLimiter, expand Algorithm enum, enrich decision result, inject clock, evict idle clients.",
  ].join("\n"),

  references: [
    {
      title: "Design Patterns: Elements of Reusable Object-Oriented Software",
      kind: "Book",
      author: "Gamma, Helm, Johnson, Vlissides",
    },
    {
      title: "Effective Java — Item 34 Enums and Item 78 Synchronize Access to Shared Mutable Data",
      kind: "Book",
      author: "Joshua Bloch",
    },
    {
      title: "Refactoring Guru — Strategy Pattern",
      kind: "Docs",
      url: "https://refactoring.guru/design-patterns/strategy",
    },
    {
      title: "Java Platform Docs — ConcurrentHashMap",
      kind: "Docs",
      url: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html",
      author: "Oracle",
    },
  ],

  relatedProblems: [
    { slug: "api-gateway", note: "Rate limiting is commonly applied at gateway boundaries." },
    { slug: "logging-framework", note: "Another strategy-heavy, thread-safe infrastructure component." },
    { slug: "lru-cache", note: "Also centers on bounded per-key state and careful eviction semantics." },
  ],
};
