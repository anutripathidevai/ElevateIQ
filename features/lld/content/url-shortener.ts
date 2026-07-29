import type { LLDProblemContent } from "../types";

/**
 * Full LLD problem walkthrough — Design a URL Shortener.
 *
 * Fresh Java implementation focused on the object model: strategy-based key
 * generation, repository-backed storage, collision handling, expiry, and hit
 * counts.
 */
export const urlShortener: LLDProblemContent = {
  slug: "url-shortener",

  statementMD: [
    "Design the low-level object model for a **URL shortener**. A client submits",
    "a long URL and receives a compact code; later, resolving that code returns",
    "the original URL if the mapping still exists and has not expired.",
    "",
    "Keep the interview scope at **LLD/OOD depth**: classes, interfaces,",
    "ownership, invariants, and extension seams. Do not spend time on distributed",
    "key generation, regional replication, CDN routing, or analytics pipelines.",
  ].join("\n"),

  businessContextMD: [
    "URL Shortener is a common Amazon, Microsoft, and Flipkart interview problem",
    "because it looks simple but quickly reveals design maturity. A strong answer",
    "separates key-generation policy from persistence, handles collisions",
    "explicitly, models expiry and hit counts cleanly, and exposes a small service",
    "facade instead of leaking map operations to callers.",
  ].join("\n"),

  functionalRequirements: [
    "Shorten a valid HTTP or HTTPS URL into a compact code.",
    "Resolve a code back to the original URL when the mapping is active.",
    "Support expiring mappings using a TTL supplied at shorten time or a default TTL.",
    "Track the number of successful resolves per shortened URL.",
    "Handle generated-code collisions by retrying a bounded number of times.",
    "Support a custom alias path where the caller supplies the desired code.",
    "Allow different shortening strategies, such as Base62 counter encoding or random tokens, without changing the service flow.",
  ],

  nonFunctionalRequirements: [
    {
      label: "Correctness",
      detailMD:
        "A code must map to at most one active URL. Collision handling must be part of the shorten flow, not a best-effort assumption.",
    },
    {
      label: "Extensibility",
      detailMD:
        "New strategies such as random tokens, custom aliases, or branded prefixes should be additive classes behind **ShorteningStrategy**.",
    },
    {
      label: "Low latency",
      detailMD:
        "The base design uses an in-memory map, so shorten and resolve are expected to be constant-time for interview-scale data.",
    },
    {
      label: "Testability",
      detailMD:
        "Inject the repository, strategy, and clock so expiry, collisions, and code generation can be tested deterministically.",
    },
    {
      label: "Encapsulation",
      detailMD:
        "Hit counts, expiry checks, and repository writes should be hidden behind domain objects and a service facade.",
    },
  ],

  requirementClarification: [
    {
      question: "Are we designing a distributed tiny URL service?",
      answerMD:
        "No. This walkthrough is the object-design view. We model the service, repository, mapping, and generation strategy; distributed ID allocation is a production extension.",
    },
    {
      question: "Do custom aliases need special validation?",
      answerMD:
        "Yes. The sample accepts only alphanumeric characters plus hyphen and underscore. A real product can plug in stricter brand, abuse, or reserved-word rules.",
    },
    {
      question: "What happens when a code expires?",
      answerMD:
        "Resolve treats it as missing, deletes it from the repository, and does not increment the hit count. Cleanup can also be run asynchronously in production.",
    },
    {
      question: "Should hit count include failed resolves?",
      answerMD:
        "No. The base model increments hits only after a non-expired mapping successfully resolves.",
    },
    {
      question: "Is Base62 generation deterministic?",
      answerMD:
        "Yes. The repository owns a monotonic counter and **Base62Strategy** encodes each numeric id. Random and custom-alias strategies share the same service contract.",
    },
  ],

  classDiagramMermaid: [
    "classDiagram",
    "    class UrlShortenerService {",
    "        -UrlRepository repository",
    "        -ShorteningStrategy strategy",
    "        -Duration defaultTtl",
    "        -Clock clock",
    "        +withBase62Defaults() UrlShortenerService",
    "        +shorten(String) String",
    "        +shorten(String, String, Duration) String",
    "        +resolve(String) Optional~String~",
    "        +hitCount(String) long",
    "    }",
    "    class UrlRepository {",
    "        <<interface>>",
    "        +findByCode(String) Optional~UrlMapping~",
    "        +saveIfAbsent(UrlMapping) boolean",
    "        +exists(String) boolean",
    "        +delete(String) void",
    "        +nextId() long",
    "    }",
    "    class InMemoryUrlRepository {",
    "        -Map~String,UrlMapping~ byCode",
    "        -AtomicLong sequence",
    "    }",
    "    class UrlMapping {",
    "        -String code",
    "        -String longUrl",
    "        -Instant createdAt",
    "        -Instant expiresAt",
    "        -long hitCount",
    "        +isExpired(Instant) boolean",
    "        +recordHit() long",
    "    }",
    "    class ShorteningStrategy {",
    "        <<interface>>",
    "        +generateCode(String, String, UrlRepository) String",
    "        +random(int) ShorteningStrategy",
    "        +customAlias() ShorteningStrategy",
    "    }",
    "    class Base62Strategy {",
    "        +generateCode(String, String, UrlRepository) String",
    "        +encode(long) String",
    "        +decode(String) long",
    "    }",
    "    class RandomTokenStrategy",
    "    class CustomAliasStrategy",
    "    UrlShortenerService ..> ShorteningStrategy",
    "    UrlShortenerService ..> UrlRepository",
    "    UrlShortenerService ..> UrlMapping",
    "    UrlRepository <|.. InMemoryUrlRepository",
    "    ShorteningStrategy <|.. Base62Strategy",
    "    ShorteningStrategy <|.. RandomTokenStrategy",
    "    ShorteningStrategy <|.. CustomAliasStrategy",
    "    InMemoryUrlRepository o-- UrlMapping",
  ].join("\n"),
  classDiagramCaptionMD:
    "The service is a facade over two seams: **ShorteningStrategy** chooses candidate codes, and **UrlRepository** owns persistence. **UrlMapping** owns lifecycle state such as expiry and hit count.",

  sequenceDiagramMermaid: [
    "sequenceDiagram",
    "    actor Client",
    "    participant Service as UrlShortenerService",
    "    participant Strategy as ShorteningStrategy",
    "    participant Repo as UrlRepository",
    "    participant Mapping as UrlMapping",
    "    Client->>Service: shorten(longUrl, alias, ttl)",
    "    Service->>Strategy: generateCode(longUrl, alias, repo)",
    "    Strategy->>Repo: nextId() or use alias",
    "    Strategy-->>Service: candidate code",
    "    Service->>Mapping: new UrlMapping(code, url, now, expiry)",
    "    Service->>Repo: saveIfAbsent(mapping)",
    "    alt collision",
    "        Repo-->>Service: false",
    "        Service->>Strategy: retry candidate",
    "    else saved",
    "        Repo-->>Service: true",
    "        Service-->>Client: code",
    "    end",
    "    Note over Client,Service: later",
    "    Client->>Service: resolve(code)",
    "    Service->>Repo: findByCode(code)",
    "    Repo-->>Service: Optional mapping",
    "    Service->>Mapping: isExpired(now)?",
    "    alt active",
    "        Service->>Mapping: recordHit()",
    "        Service-->>Client: longUrl",
    "    else expired or missing",
    "        Service->>Repo: delete(code)",
    "        Service-->>Client: empty",
    "    end",
  ].join("\n"),
  sequenceDiagramCaptionMD:
    "Collision handling stays in the service loop. The repository provides an atomic save-if-absent operation, and resolve increments hits only after expiry is checked.",

  entities: [
    {
      name: "UrlShortenerService",
      responsibilityMD:
        "Facade for the use cases. It validates input, asks a strategy for a candidate code, saves atomically through the repository, resolves active mappings, and exposes hit counts.",
      attributes: ["repository", "strategy", "defaultTtl", "clock", "maxAttempts"],
    },
    {
      name: "UrlMapping",
      responsibilityMD:
        "Domain record for one shortened URL. It stores the code, long URL, creation time, optional expiry, and successful hit count.",
      attributes: ["code", "longUrl", "createdAt", "expiresAt", "hitCount"],
    },
    {
      name: "ShorteningStrategy",
      responsibilityMD:
        "Policy interface for producing candidate codes. The service does not know whether the code came from a Base62 counter, random token, or caller-supplied alias.",
      attributes: ["generateCode(longUrl, customAlias, repository)"],
    },
    {
      name: "Base62Strategy",
      responsibilityMD:
        "Deterministic strategy that asks the repository for the next numeric id and encodes it using a fixed Base62 alphabet.",
      attributes: ["alphabet", "encode", "decode"],
    },
    {
      name: "RandomTokenStrategy",
      responsibilityMD:
        "Alternative strategy that builds fixed-length random tokens. Collisions are possible, so the service retry loop remains necessary.",
      attributes: ["length", "secureRandom"],
    },
    {
      name: "CustomAliasStrategy",
      responsibilityMD:
        "Alternative strategy that returns the caller-provided alias after validation. A collision becomes an alias-taken error instead of a silent overwrite.",
      attributes: ["customAlias"],
    },
    {
      name: "UrlRepository",
      responsibilityMD:
        "Repository abstraction for code lookup, atomic insertion, deletion, existence checks, and sequence allocation.",
      attributes: ["findByCode", "saveIfAbsent", "exists", "delete", "nextId"],
    },
    {
      name: "InMemoryUrlRepository",
      responsibilityMD:
        "Interview-friendly repository backed by a concurrent map and atomic counter. It can be replaced by SQL, Redis, or another durable store without changing service logic.",
      attributes: ["byCode", "sequence"],
    },
  ],

  patternsUsed: [
    {
      name: "Strategy",
      whyMD:
        "**ShorteningStrategy** isolates code-generation policy. Base62 counter encoding, random tokens, and custom aliases implement the same method and can be injected into the service.",
    },
    {
      name: "Repository",
      whyMD:
        "**UrlRepository** hides storage details and exposes domain-friendly operations such as **saveIfAbsent** and **nextId**. The service does not depend on a map directly.",
    },
    {
      name: "Factory Method",
      whyMD:
        "Static factory methods such as **withBase62Defaults**, **ShorteningStrategy.random**, and **ShorteningStrategy.customAlias** create configured variants without spreading constructor wiring across clients.",
    },
  ],

  designSteps: [
    {
      title: "Make the shortened URL a domain object",
      detailMD:
        "**UrlMapping** is more than a pair of strings. It owns creation time, optional expiry, and hit count, so lifecycle rules do not leak into controllers.",
      code: [
        "public boolean isExpired(Instant now) {",
        "    Objects.requireNonNull(now, \"now\");",
        "    return expiresAt != null && !expiresAt.isAfter(now);",
        "}",
        "",
        "public synchronized long recordHit() {",
        "    hitCount++;",
        "    return hitCount;",
        "}",
      ].join("\n"),
    },
    {
      title: "Put code generation behind a strategy",
      detailMD:
        "The service asks for a candidate code and does not care whether it came from a sequence, random generator, or custom alias. This keeps the orchestration stable.",
      code: [
        "public interface ShorteningStrategy {",
        "    String generateCode(String longUrl, String customAlias, UrlRepository repository);",
        "}",
      ].join("\n"),
    },
    {
      title: "Implement Base62 with a fixed alphabet",
      detailMD:
        "**Base62Strategy** must encode and decode consistently. The decode path multiplies by 62 and adds the digit value, exactly reversing positional encoding.",
      code: [
        "public String encode(long number) {",
        "    if (number == 0) {",
        "        return \"0\";",
        "    }",
        "    StringBuilder encoded = new StringBuilder();",
        "    while (number > 0) {",
        "        encoded.append(ALPHABET.charAt((int) (number % BASE)));",
        "        number = number / BASE;",
        "    }",
        "    return encoded.reverse().toString();",
        "}",
      ].join("\n"),
    },
    {
      title: "Use repository save-if-absent as the collision boundary",
      detailMD:
        "Checking **exists** and then saving is not enough under concurrency. The repository exposes **saveIfAbsent** so insert is atomic and the service can retry on false.",
      code: [
        "if (repository.saveIfAbsent(mapping)) {",
        "    return code;",
        "}",
        "if (hasCustomAlias(customAlias)) {",
        "    throw new IllegalArgumentException(\"custom alias already exists: \" + code);",
        "}",
      ].join("\n"),
    },
    {
      title: "Resolve by checking expiry before counting hits",
      detailMD:
        "An expired code should behave like a miss and should not inflate analytics. Resolve removes expired mappings opportunistically and returns empty.",
    },
    {
      title: "Expose factory methods for common configurations",
      detailMD:
        "**UrlShortenerService.withBase62Defaults** gives demos and clients a safe default, while constructors still allow tests to inject a clock, repository, and strategy.",
    },
  ],

  implementation: [
    {
      filename: "UrlMapping.java",
      language: "java",
      content: [
        "import java.time.Instant;",
        "import java.util.Objects;",
        "",
        "public final class UrlMapping {",
        "    private final String code;",
        "    private final String longUrl;",
        "    private final Instant createdAt;",
        "    private final Instant expiresAt;",
        "    private long hitCount;",
        "",
        "    public UrlMapping(String code, String longUrl, Instant createdAt, Instant expiresAt) {",
        "        this.code = requireText(code, \"code\");",
        "        this.longUrl = requireText(longUrl, \"longUrl\");",
        "        this.createdAt = Objects.requireNonNull(createdAt, \"createdAt\");",
        "        this.expiresAt = expiresAt;",
        "    }",
        "",
        "    public String getCode() {",
        "        return code;",
        "    }",
        "",
        "    public String getLongUrl() {",
        "        return longUrl;",
        "    }",
        "",
        "    public Instant getCreatedAt() {",
        "        return createdAt;",
        "    }",
        "",
        "    public Instant getExpiresAt() {",
        "        return expiresAt;",
        "    }",
        "",
        "    public boolean isExpired(Instant now) {",
        "        Objects.requireNonNull(now, \"now\");",
        "        return expiresAt != null && !expiresAt.isAfter(now);",
        "    }",
        "",
        "    public synchronized long recordHit() {",
        "        hitCount++;",
        "        return hitCount;",
        "    }",
        "",
        "    public synchronized long getHitCount() {",
        "        return hitCount;",
        "    }",
        "",
        "    private static String requireText(String value, String fieldName) {",
        "        if (value == null || value.isBlank()) {",
        "            throw new IllegalArgumentException(fieldName + \" is required\");",
        "        }",
        "        return value.trim();",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "ShorteningStrategy.java",
      language: "java",
      content: [
        "import java.security.SecureRandom;",
        "import java.util.Objects;",
        "",
        "public interface ShorteningStrategy {",
        "    String generateCode(String longUrl, String customAlias, UrlRepository repository);",
        "",
        "    static ShorteningStrategy random(int length) {",
        "        return new RandomTokenStrategy(length);",
        "    }",
        "",
        "    static ShorteningStrategy customAlias() {",
        "        return new CustomAliasStrategy();",
        "    }",
        "}",
        "",
        "final class RandomTokenStrategy implements ShorteningStrategy {",
        "    private static final String ALPHABET = \"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz\";",
        "",
        "    private final SecureRandom random = new SecureRandom();",
        "    private final int length;",
        "",
        "    RandomTokenStrategy(int length) {",
        "        if (length <= 0) {",
        "            throw new IllegalArgumentException(\"length must be positive\");",
        "        }",
        "        this.length = length;",
        "    }",
        "",
        "    @Override",
        "    public String generateCode(String longUrl, String customAlias, UrlRepository repository) {",
        "        Objects.requireNonNull(repository, \"repository\");",
        "        char[] code = new char[length];",
        "        for (int i = 0; i < length; i++) {",
        "            int index = random.nextInt(ALPHABET.length());",
        "            code[i] = ALPHABET.charAt(index);",
        "        }",
        "        return new String(code);",
        "    }",
        "}",
        "",
        "final class CustomAliasStrategy implements ShorteningStrategy {",
        "    @Override",
        "    public String generateCode(String longUrl, String customAlias, UrlRepository repository) {",
        "        Objects.requireNonNull(repository, \"repository\");",
        "        if (customAlias == null || customAlias.isBlank()) {",
        "            throw new IllegalArgumentException(\"custom alias is required\");",
        "        }",
        "        return customAlias.trim();",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "Base62Strategy.java",
      language: "java",
      content: [
        "import java.util.Objects;",
        "",
        "public final class Base62Strategy implements ShorteningStrategy {",
        "    private static final String ALPHABET = \"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz\";",
        "    private static final int BASE = ALPHABET.length();",
        "",
        "    @Override",
        "    public String generateCode(String longUrl, String customAlias, UrlRepository repository) {",
        "        Objects.requireNonNull(repository, \"repository\");",
        "        return encode(repository.nextId());",
        "    }",
        "",
        "    public String encode(long number) {",
        "        if (number < 0) {",
        "            throw new IllegalArgumentException(\"number must be non-negative\");",
        "        }",
        "        if (number == 0) {",
        "            return \"0\";",
        "        }",
        "",
        "        StringBuilder encoded = new StringBuilder();",
        "        long current = number;",
        "        while (current > 0) {",
        "            int digit = (int) (current % BASE);",
        "            encoded.append(ALPHABET.charAt(digit));",
        "            current = current / BASE;",
        "        }",
        "        return encoded.reverse().toString();",
        "    }",
        "",
        "    public long decode(String code) {",
        "        if (code == null || code.isBlank()) {",
        "            throw new IllegalArgumentException(\"code is required\");",
        "        }",
        "",
        "        long number = 0;",
        "        for (int i = 0; i < code.length(); i++) {",
        "            int digit = ALPHABET.indexOf(code.charAt(i));",
        "            if (digit < 0) {",
        "                throw new IllegalArgumentException(\"invalid Base62 character: \" + code.charAt(i));",
        "            }",
        "            if (number > (Long.MAX_VALUE - digit) / BASE) {",
        "                throw new IllegalArgumentException(\"Base62 value is too large\");",
        "            }",
        "            number = number * BASE + digit;",
        "        }",
        "        return number;",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "UrlRepository.java",
      language: "java",
      content: [
        "import java.util.Objects;",
        "import java.util.Optional;",
        "import java.util.concurrent.ConcurrentHashMap;",
        "import java.util.concurrent.ConcurrentMap;",
        "import java.util.concurrent.atomic.AtomicLong;",
        "",
        "public interface UrlRepository {",
        "    Optional<UrlMapping> findByCode(String code);",
        "",
        "    boolean saveIfAbsent(UrlMapping mapping);",
        "",
        "    boolean exists(String code);",
        "",
        "    void delete(String code);",
        "",
        "    long nextId();",
        "}",
        "",
        "final class InMemoryUrlRepository implements UrlRepository {",
        "    private final ConcurrentMap<String, UrlMapping> byCode = new ConcurrentHashMap<>();",
        "    private final AtomicLong sequence = new AtomicLong(100_000L);",
        "",
        "    @Override",
        "    public Optional<UrlMapping> findByCode(String code) {",
        "        Objects.requireNonNull(code, \"code\");",
        "        return Optional.ofNullable(byCode.get(code));",
        "    }",
        "",
        "    @Override",
        "    public boolean saveIfAbsent(UrlMapping mapping) {",
        "        Objects.requireNonNull(mapping, \"mapping\");",
        "        return byCode.putIfAbsent(mapping.getCode(), mapping) == null;",
        "    }",
        "",
        "    @Override",
        "    public boolean exists(String code) {",
        "        Objects.requireNonNull(code, \"code\");",
        "        return byCode.containsKey(code);",
        "    }",
        "",
        "    @Override",
        "    public void delete(String code) {",
        "        Objects.requireNonNull(code, \"code\");",
        "        byCode.remove(code);",
        "    }",
        "",
        "    @Override",
        "    public long nextId() {",
        "        return sequence.incrementAndGet();",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "UrlShortenerService.java",
      language: "java",
      content: [
        "import java.net.URI;",
        "import java.time.Clock;",
        "import java.time.Duration;",
        "import java.time.Instant;",
        "import java.util.Objects;",
        "import java.util.Optional;",
        "",
        "public final class UrlShortenerService {",
        "    private static final int DEFAULT_MAX_ATTEMPTS = 5;",
        "",
        "    private final UrlRepository repository;",
        "    private final ShorteningStrategy strategy;",
        "    private final Duration defaultTtl;",
        "    private final Clock clock;",
        "    private final int maxAttempts;",
        "",
        "    public UrlShortenerService(",
        "            UrlRepository repository,",
        "            ShorteningStrategy strategy,",
        "            Duration defaultTtl,",
        "            Clock clock) {",
        "        this(repository, strategy, defaultTtl, clock, DEFAULT_MAX_ATTEMPTS);",
        "    }",
        "",
        "    public UrlShortenerService(",
        "            UrlRepository repository,",
        "            ShorteningStrategy strategy,",
        "            Duration defaultTtl,",
        "            Clock clock,",
        "            int maxAttempts) {",
        "        if (maxAttempts <= 0) {",
        "            throw new IllegalArgumentException(\"maxAttempts must be positive\");",
        "        }",
        "        this.repository = Objects.requireNonNull(repository, \"repository\");",
        "        this.strategy = Objects.requireNonNull(strategy, \"strategy\");",
        "        this.defaultTtl = defaultTtl;",
        "        this.clock = Objects.requireNonNull(clock, \"clock\");",
        "        this.maxAttempts = maxAttempts;",
        "    }",
        "",
        "    public static UrlShortenerService withBase62Defaults() {",
        "        return new UrlShortenerService(",
        "                new InMemoryUrlRepository(),",
        "                new Base62Strategy(),",
        "                Duration.ofDays(30),",
        "                Clock.systemUTC());",
        "    }",
        "",
        "    public static UrlShortenerService withStrategy(ShorteningStrategy strategy) {",
        "        return new UrlShortenerService(",
        "                new InMemoryUrlRepository(),",
        "                strategy,",
        "                Duration.ofDays(30),",
        "                Clock.systemUTC());",
        "    }",
        "",
        "    public String shorten(String longUrl) {",
        "        return shorten(longUrl, null, defaultTtl);",
        "    }",
        "",
        "    public String shorten(String longUrl, String customAlias, Duration ttl) {",
        "        validateLongUrl(longUrl);",
        "        Instant now = clock.instant();",
        "        Instant expiresAt = calculateExpiry(now, ttl);",
        "",
        "        for (int attempt = 0; attempt < maxAttempts; attempt++) {",
        "            String code = strategy.generateCode(longUrl, customAlias, repository);",
        "            validateCode(code);",
        "",
        "            UrlMapping mapping = new UrlMapping(code, longUrl, now, expiresAt);",
        "            if (repository.saveIfAbsent(mapping)) {",
        "                return code;",
        "            }",
        "",
        "            if (hasCustomAlias(customAlias)) {",
        "                throw new IllegalArgumentException(\"custom alias already exists: \" + code);",
        "            }",
        "        }",
        "",
        "        throw new IllegalStateException(\"could not allocate a unique short code\");",
        "    }",
        "",
        "    public Optional<String> resolve(String code) {",
        "        validateCode(code);",
        "        Optional<UrlMapping> mapping = repository.findByCode(code);",
        "        if (mapping.isEmpty()) {",
        "            return Optional.empty();",
        "        }",
        "",
        "        UrlMapping found = mapping.get();",
        "        if (found.isExpired(clock.instant())) {",
        "            repository.delete(code);",
        "            return Optional.empty();",
        "        }",
        "",
        "        found.recordHit();",
        "        return Optional.of(found.getLongUrl());",
        "    }",
        "",
        "    public long hitCount(String code) {",
        "        validateCode(code);",
        "        return repository.findByCode(code)",
        "                .map(UrlMapping::getHitCount)",
        "                .orElse(0L);",
        "    }",
        "",
        "    private Instant calculateExpiry(Instant now, Duration ttl) {",
        "        Duration effectiveTtl = ttl == null ? defaultTtl : ttl;",
        "        if (effectiveTtl == null) {",
        "            return null;",
        "        }",
        "        if (effectiveTtl.isZero() || effectiveTtl.isNegative()) {",
        "            throw new IllegalArgumentException(\"ttl must be positive\");",
        "        }",
        "        return now.plus(effectiveTtl);",
        "    }",
        "",
        "    private static boolean hasCustomAlias(String customAlias) {",
        "        return customAlias != null && !customAlias.isBlank();",
        "    }",
        "",
        "    private static void validateLongUrl(String longUrl) {",
        "        if (longUrl == null || longUrl.isBlank()) {",
        "            throw new IllegalArgumentException(\"longUrl is required\");",
        "        }",
        "",
        "        URI uri;",
        "        try {",
        "            uri = URI.create(longUrl);",
        "        } catch (IllegalArgumentException ex) {",
        "            throw new IllegalArgumentException(\"longUrl is not a valid URI\", ex);",
        "        }",
        "",
        "        String scheme = uri.getScheme();",
        "        boolean supportedScheme = \"http\".equalsIgnoreCase(scheme) || \"https\".equalsIgnoreCase(scheme);",
        "        if (!supportedScheme || uri.getHost() == null) {",
        "            throw new IllegalArgumentException(\"only absolute HTTP and HTTPS URLs are supported\");",
        "        }",
        "    }",
        "",
        "    private static void validateCode(String code) {",
        "        if (code == null || code.isBlank()) {",
        "            throw new IllegalArgumentException(\"code is required\");",
        "        }",
        "        for (int i = 0; i < code.length(); i++) {",
        "            char ch = code.charAt(i);",
        "            boolean valid = Character.isLetterOrDigit(ch) || ch == '-' || ch == '_';",
        "            if (!valid) {",
        "                throw new IllegalArgumentException(\"code contains unsupported character: \" + ch);",
        "            }",
        "        }",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "Main.java",
      language: "java",
      content: [
        "import java.time.Clock;",
        "import java.time.Duration;",
        "",
        "public class Main {",
        "    public static void main(String[] args) {",
        "        UrlShortenerService service = UrlShortenerService.withBase62Defaults();",
        "",
        "        String code = service.shorten(\"https://example.com/articles/design-url-shortener\");",
        "        System.out.println(\"Generated code: \" + code);",
        "        System.out.println(\"Resolved URL: \" + service.resolve(code).orElse(\"missing\"));",
        "        System.out.println(\"Hits after one resolve: \" + service.hitCount(code));",
        "",
        "        UrlRepository aliasRepository = new InMemoryUrlRepository();",
        "        UrlShortenerService aliasService = new UrlShortenerService(",
        "                aliasRepository,",
        "                ShorteningStrategy.customAlias(),",
        "                Duration.ofDays(7),",
        "                Clock.systemUTC());",
        "        String alias = aliasService.shorten(",
        "                \"https://example.com/careers\",",
        "                \"jobs\",",
        "                Duration.ofDays(7));",
        "        System.out.println(\"Custom alias: \" + alias);",
        "        System.out.println(\"Alias resolves to: \" + aliasService.resolve(\"jobs\").orElse(\"missing\"));",
        "",
        "        Base62Strategy base62 = new Base62Strategy();",
        "        String encoded = base62.encode(125);",
        "        System.out.println(\"Base62 125 = \" + encoded);",
        "        System.out.println(\"Decode \" + encoded + \" = \" + base62.decode(encoded));",
        "    }",
        "}",
      ].join("\n"),
    },
  ],

  classExplanations: [
    {
      className: "UrlMapping",
      detailMD:
        "Immutable identity and lifecycle fields plus a synchronized hit counter. It owns the expiry predicate and only increments hits through **recordHit**.",
    },
    {
      className: "ShorteningStrategy",
      detailMD:
        "Strategy interface for candidate-code generation. It also exposes factory methods for random-token and custom-alias strategies so clients can choose policies without newing concrete helpers directly.",
    },
    {
      className: "RandomTokenStrategy",
      detailMD:
        "Package-private strategy returned by **ShorteningStrategy.random**. It uses **SecureRandom** and a Base62 alphabet, so collisions are possible but rare and handled by the service retry loop.",
    },
    {
      className: "CustomAliasStrategy",
      detailMD:
        "Package-private strategy returned by **ShorteningStrategy.customAlias**. It requires a caller-supplied alias and lets the service turn duplicate aliases into a clear error.",
    },
    {
      className: "Base62Strategy",
      detailMD:
        "Deterministic strategy that calls **repository.nextId** and converts the number to Base62. Its **decode** method validates characters and reverses the positional encoding safely.",
    },
    {
      className: "UrlRepository",
      detailMD:
        "Repository abstraction for lookup, atomic insert, deletion, existence checks, and numeric id allocation. This is the persistence seam for replacing memory with a database later.",
    },
    {
      className: "InMemoryUrlRepository",
      detailMD:
        "Concurrent-map implementation of **UrlRepository**. **putIfAbsent** makes collision handling atomic and **AtomicLong** provides the counter used by Base62 generation.",
    },
    {
      className: "UrlShortenerService",
      detailMD:
        "Facade that orchestrates validation, candidate-code generation, collision retries, expiry calculation, resolve, and hit-count reads. It depends only on the strategy and repository interfaces.",
    },
    {
      className: "Main",
      detailMD:
        "Executable demo that shows Base62 default shortening, custom-alias shortening, successful resolve hit counting, and Base62 encode/decode round-tripping.",
    },
  ],

  dryRun: {
    inputMD:
      "Repository starts with sequence 100000 and no mappings. Default TTL is 30 days. Actions: shorten a product URL with Base62, resolve it twice, shorten a careers URL with custom alias **jobs**, then try the same alias again.",
    columns: ["Step", "Action", "Candidate code", "Repository state", "Hit count", "Result"],
    rows: [
      ["1", "shorten(product URL)", "Q0v", "{Q0v -> product}", "0", "Returns Q0v"],
      ["2", "resolve(Q0v)", "Q0v", "{Q0v -> product}", "1", "Returns product URL"],
      ["3", "resolve(Q0v)", "Q0v", "{Q0v -> product}", "2", "Returns product URL again"],
      ["4", "shorten(careers URL, jobs)", "jobs", "{Q0v -> product, jobs -> careers}", "0", "Returns jobs"],
      ["5", "shorten(other URL, jobs)", "jobs", "unchanged", "0", "Throws alias already exists"],
      ["6", "resolve(expired Q0v)", "Q0v", "{jobs -> careers}", "2", "Returns empty and deletes Q0v"],
    ],
    narrativeMD:
      "Step 1 uses Base62 for repository id 100001, which encodes to **Q0v** with the chosen alphabet. Steps 2 and 3 increment hits only on active resolves. Step 5 shows custom alias collision behavior, and step 6 shows expiry cleanup.",
  },

  complexity: [
    {
      operation: "shorten with Base62",
      time: "O(maxAttempts × codeLength)",
      space: "O(1)",
      note: "Each attempt generates a short code and performs an atomic map insert. With a monotonic counter, collisions should be exceptional.",
    },
    {
      operation: "shorten with random token",
      time: "O(maxAttempts × tokenLength)",
      space: "O(1)",
      note: "Random generation can collide, so the retry bound matters.",
    },
    {
      operation: "resolve active code",
      time: "O(1)",
      space: "O(1)",
      note: "Map lookup, expiry check, synchronized hit increment, and return.",
    },
    {
      operation: "resolve expired code",
      time: "O(1)",
      space: "O(1)",
      note: "Map lookup plus delete. No hit is recorded.",
    },
    {
      operation: "repository storage",
      time: "-",
      space: "O(N)",
      note: "One mapping per active short code.",
    },
  ],
  complexityNotesMD:
    "The constant-time claims rely on average O(1) map operations and small codes. In production, durable stores, indexes, and cross-node coordination would dominate the latency model, but the object design remains the same.",

  extensibility: [
    {
      label: "New key strategy",
      detailMD:
        "Add a new **ShorteningStrategy** implementation, such as hash-based slugs, tenant-prefixed aliases, or dictionary words. The service loop still validates and saves atomically.",
    },
    {
      label: "Durable repository",
      detailMD:
        "Implement **UrlRepository** using SQL, Redis, or a document store. Preserve **saveIfAbsent** as a uniqueness constraint or compare-and-set operation.",
    },
    {
      label: "Custom alias policies",
      detailMD:
        "Add an alias validator or reservation list before **CustomAliasStrategy** returns a code. This handles profanity, brand names, and security-sensitive words.",
    },
    {
      label: "Analytics events",
      detailMD:
        "Keep the synchronous hit counter for quick reads, then publish a resolve event to an analytics pipeline outside the core service.",
    },
    {
      label: "Clock-driven tests",
      detailMD:
        "Because **Clock** is injected, tests can advance time deterministically and verify expiry without sleeping.",
    },
  ],

  alternativeDesigns: [
    {
      name: "Hash the long URL",
      detailMD:
        "Generate the code from a hash of the long URL instead of a counter or random token. Identical URLs can naturally produce the same code if desired.",
      tradeoffsMD:
        "Deterministic, but collisions still exist and the code can become longer if you need stronger collision resistance.",
    },
    {
      name: "Separate analytics service",
      detailMD:
        "Move hit counting out of **UrlMapping** and emit resolve events to an **AnalyticsService** or queue.",
      tradeoffsMD:
        "Better write throughput and richer analytics, but eventual consistency means hit count reads may lag.",
    },
    {
      name: "Code allocator object",
      detailMD:
        "Extract retry and collision handling into a **CodeAllocator** that owns strategy plus repository uniqueness checks.",
      tradeoffsMD:
        "Useful when allocation rules become complex, but it adds another abstraction to a problem whose core flow is already small.",
    },
  ],

  commonMistakes: [
    "Mixing Base62, random, and custom-alias logic in one giant **if** statement inside the service.",
    "Checking **exists** and then saving without an atomic insert, which can overwrite a mapping under concurrency.",
    "Incrementing hit count before checking expiry, causing expired links to look popular.",
    "Treating a custom alias collision like a random collision and silently choosing a different code.",
    "Letting repository callers mutate the internal map directly instead of exposing domain operations.",
    "Spending the entire answer on distributed HLD concerns and never naming the classes or patterns.",
    "Using a Base62 decoder that ignores invalid characters or overflows silently.",
  ],

  followUps: [
    {
      question: "How would you make the repository durable?",
      answerMD:
        "Implement **UrlRepository** with a database table keyed by code. **saveIfAbsent** becomes an insert with a unique constraint; **nextId** can come from a sequence.",
    },
    {
      question: "How do you support per-user quotas?",
      answerMD:
        "Add an owner field to **UrlMapping** and check a **QuotaPolicy** before saving. Keep quota policy separate from code generation.",
    },
    {
      question: "What changes for random-code generation?",
      answerMD:
        "Inject **ShorteningStrategy.random(length)**. The service already retries when **saveIfAbsent** returns false, so the collision path is shared.",
    },
    {
      question: "How do you prevent abusive custom aliases?",
      answerMD:
        "Add an alias validator or moderation policy before save. Reject reserved words, trademarks, path traversal tokens, and suspicious Unicode confusables.",
    },
    {
      question: "How would you return analytics without slowing resolve?",
      answerMD:
        "Return the URL after the local hit increment and publish an asynchronous event for detailed analytics. The core resolve path stays short.",
    },
  ],

  productionConsiderations: [
    {
      label: "Uniqueness guarantee",
      detailMD:
        "Back **saveIfAbsent** with a database unique index, Redis SETNX, or another atomic primitive. This is the critical correctness boundary.",
    },
    {
      label: "Abuse and safety",
      detailMD:
        "Validate destination URLs, block malware domains, rate-limit creation, and moderate custom aliases before exposing them publicly.",
    },
    {
      label: "Expiry cleanup",
      detailMD:
        "Resolve can delete expired mappings opportunistically, but production systems should also run scheduled cleanup to control storage growth.",
    },
    {
      label: "Observability",
      detailMD:
        "Track shorten success rate, collision retries, alias conflicts, expired resolves, and p95 resolve latency.",
    },
    {
      label: "Migration path",
      detailMD:
        "The repository boundary lets you start in memory for interviews, move to SQL for correctness, then add cache layers without changing the facade.",
    },
  ],

  interviewNotes: [
    "Did you keep key generation behind **ShorteningStrategy** instead of hard-coding Base62 in the service?",
    "Did you model **saveIfAbsent** as the collision boundary rather than a fragile check-then-put?",
    "Did you explain custom alias behavior separately from random collision retries?",
    "Did you check expiry before incrementing hit count?",
    "Can you swap the in-memory repository for a durable implementation without changing service logic?",
    "Did you keep the answer focused on LLD and avoid drifting into full distributed-system design?",
  ],

  quiz: [
    {
      question: "Why is **ShorteningStrategy** an interface?",
      options: [
        "So the service can switch between Base62, random, and custom-alias generation without changing orchestration",
        "So repository lookups become faster",
        "So expired links delete themselves automatically",
        "So Java can compile multiple public classes in one file",
      ],
      answerIndex: 0,
      explanationMD:
        "Strategy isolates the varying algorithm. The service still owns validation, retry, save, and resolve behavior.",
    },
    {
      question: "What is the purpose of **saveIfAbsent**?",
      options: [
        "It compresses the long URL",
        "It atomically saves a mapping only if the code is still unused",
        "It increments the hit count",
        "It deletes expired mappings on a schedule",
      ],
      answerIndex: 1,
      explanationMD:
        "The collision boundary must be atomic. A separate exists check followed by save can race.",
    },
    {
      question: "When should hit count be incremented?",
      options: [
        "Before repository lookup",
        "Whenever a code string is syntactically valid",
        "After the mapping is found and confirmed not expired",
        "Only when a custom alias is used",
      ],
      answerIndex: 2,
      explanationMD:
        "Only successful active resolves count as hits. Missing or expired codes should not inflate analytics.",
    },
    {
      question: "Why is a duplicate custom alias handled differently from a random collision?",
      options: [
        "Because aliases are always longer than random codes",
        "Because Base62 cannot decode aliases",
        "Because the caller requested that exact public code and should receive an alias-taken error",
        "Because custom aliases do not need validation",
      ],
      answerIndex: 2,
      explanationMD:
        "A random collision can be retried transparently. A custom alias collision means the requested user-facing code is unavailable.",
    },
    {
      question: "What does **Base62Strategy.decode** do conceptually?",
      options: [
        "It hashes the URL to a number",
        "It multiplies the accumulated value by 62 and adds each character's digit value",
        "It checks whether a code exists in the repository",
        "It removes expired mappings",
      ],
      answerIndex: 1,
      explanationMD:
        "Base62 is positional notation. Decode walks left to right and reconstructs the numeric value using base 62.",
    },
  ],

  practiceVariants: [
    {
      title: "Add user-owned links",
      detailMD:
        "Add **ownerId** to **UrlMapping**, require owners to resolve management APIs, and enforce per-user creation quotas.",
      difficulty: "Intermediate",
    },
    {
      title: "Add an alias validator",
      detailMD:
        "Introduce an **AliasPolicy** that rejects reserved words, unsafe characters, too-short aliases, and profanity before the custom alias strategy returns.",
      difficulty: "Beginner",
    },
    {
      title: "Add a durable SQL repository",
      detailMD:
        "Implement **UrlRepository** with a SQL table, unique index on code, a sequence for ids, and tests proving duplicate inserts fail cleanly.",
      difficulty: "Advanced",
    },
  ],

  flashcards: [
    {
      front: "Which pattern makes Base62, random, and custom-alias generation interchangeable?",
      back: "Strategy — **ShorteningStrategy** defines **generateCode**, and each algorithm implements it.",
    },
    {
      front: "What method is the collision boundary?",
      back: "**UrlRepository.saveIfAbsent** because it performs the uniqueness check and insert atomically.",
    },
    {
      front: "What does **UrlMapping** own?",
      back: "The short code, long URL, creation time, optional expiry time, and successful hit count.",
    },
    {
      front: "When does resolve delete a mapping?",
      back: "When the mapping exists but **isExpired(now)** returns true; it then returns empty.",
    },
    {
      front: "Why inject **Clock**?",
      back: "It makes expiry deterministic in tests and avoids sleeping or relying on wall-clock timing.",
    },
    {
      front: "Factory methods in this design?",
      back: "**UrlShortenerService.withBase62Defaults**, **ShorteningStrategy.random**, and **ShorteningStrategy.customAlias**.",
    },
  ],

  cheatSheetMD: [
    "**Core model:** UrlShortenerService facade, UrlMapping domain object, UrlRepository abstraction, InMemoryUrlRepository storage, ShorteningStrategy interface.",
    "",
    "**Patterns:** Strategy for code generation, Repository for storage, Factory Method for preconfigured service and strategy creation.",
    "",
    "**Shorten flow:** validate URL → calculate expiry → generate candidate code → create UrlMapping → saveIfAbsent → retry or return code.",
    "",
    "**Resolve flow:** validate code → find mapping → if missing return empty → if expired delete and return empty → record hit → return long URL.",
    "",
    "**Base62:** encode repeatedly divides by 62 and reverses digits; decode multiplies accumulated value by 62 and adds the next digit.",
    "",
    "**Invariants:** one code maps to at most one URL; custom alias collision is an error; expired links do not count as hits; repository insert is atomic.",
    "",
    "**Complexity:** shorten O(maxAttempts × codeLength), resolve O(1), storage O(N).",
  ].join("\n"),

  references: [
    {
      title: "Design Patterns: Elements of Reusable Object-Oriented Software",
      kind: "Book",
      author: "Gamma, Helm, Johnson, Vlissides",
    },
    {
      title: "Effective Java — Item 1 and Item 17",
      kind: "Book",
      author: "Joshua Bloch",
    },
    {
      title: "Refactoring Guru — Strategy Pattern",
      kind: "Docs",
      url: "https://refactoring.guru/design-patterns/strategy",
    },
    {
      title: "Martin Fowler — Repository",
      kind: "Blog",
      url: "https://martinfowler.com/eaaCatalog/repository.html",
      author: "Martin Fowler",
    },
  ],

  relatedProblems: [
    { slug: "rate-limiter", note: "Adds quota and abuse-control thinking around the shorten endpoint." },
    { slug: "lru-cache", note: "Useful if you layer a resolve cache in front of the repository." },
    { slug: "api-gateway", note: "Shows how URL routing and request policies surround a facade-like service." },
  ],
};
