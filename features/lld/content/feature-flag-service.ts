import type { LLDProblemContent } from "../types";

export const featureFlagService: LLDProblemContent = {
  slug: "feature-flag-service",

  statementMD: [
    "Design a **Feature Flag Service** similar to LaunchDarkly. Product teams define flags with named variations, ordered targeting rules, user segments, and optional percentage rollouts. Application code asks the service to evaluate a flag for a given **UserContext** and receives the resolved variation.",
    "",
    "The core LLD challenge is the evaluation engine: it must apply rules in a predictable order while staying closed for modification. Adding a rule such as country targeting, segment targeting, plan targeting, or time-window targeting should mean adding a new rule class, not editing a long evaluator switch statement.",
  ].join("\n"),

  businessContextMD: [
    "Feature flags decouple deployment from release. Teams can ship dormant code, open it to beta users, roll it out to 5% of traffic, kill it quickly, or run an experiment without a redeploy.",
    "",
    "Interviewers use this problem to test whether you can design a small rules engine: deterministic rollout, ordered precedence, stable user bucketing, extensible rule strategies, and change notifications for SDKs or services that cache flag definitions.",
  ].join("\n"),

  functionalRequirements: [
    "Create or update a flag with a key, enabled state, allowed variations, and a default variation.",
    "Evaluate a flag for a user context and return exactly one variation or a caller-supplied fallback when the flag is missing.",
    "Support ordered targeting rules; the first matching rule wins.",
    "Support user segments such as beta-testers, employees, or enterprise-customers.",
    "Support percentage rollouts that deterministically bucket the same user into the same variation for a given flag.",
    "Allow new targeting rule types to be added without changing the evaluation engine.",
    "Notify listeners when a flag is inserted or updated so SDK caches can refresh.",
  ],

  nonFunctionalRequirements: [
    {
      label: "Deterministic evaluation",
      detailMD:
        "The same flag key and user key must resolve to the same rollout bucket until the rollout weights change. Random per-request assignment breaks user experience and experiments.",
    },
    {
      label: "Open for extension",
      detailMD:
        "Rule behavior belongs behind **TargetingRule**. The engine walks an ordered chain and does not know whether a rule checks a segment, attribute, plan, or device.",
    },
    {
      label: "Low latency",
      detailMD:
        "Evaluation should be in-memory and proportional to the number of rules on one flag, not to all flags in the system.",
    },
    {
      label: "Thread safety",
      detailMD:
        "Application threads may evaluate while an admin thread updates a flag. The service uses concurrent collections and immutable flag snapshots.",
    },
    {
      label: "Operational visibility",
      detailMD:
        "Production systems need metrics for evaluated flags, missing flags, rule matches, rollout distribution, and stale SDK caches.",
    },
  ],

  requirementClarification: [
    {
      question: "Are variations only booleans?",
      answerMD:
        "No. Model variations as strings in the base design so boolean flags, experiment variants, and configuration choices all fit. A production version can wrap them in a typed value object.",
    },
    {
      question: "Where does segment membership come from?",
      answerMD:
        "For LLD, segment membership is already present on **UserContext**. A production service may hydrate it from an identity service or segment store before evaluation.",
    },
    {
      question: "What happens when a flag is disabled?",
      answerMD:
        "The evaluator immediately returns the flag's default variation. Disabled means no targeting rules or rollouts are applied.",
    },
    {
      question: "How should percentage rollout be computed?",
      answerMD:
        "Hash **flagKey:userKey** into a stable bucket from 1 to 100, then compare that bucket with cumulative variation weights.",
    },
    {
      question: "Do we need REST APIs, authentication, or persistence?",
      answerMD:
        "Not in the core model. The design focuses on object responsibilities. Persistence, admin APIs, RBAC, and audit logs are production layers around the same domain model.",
    },
  ],

  classDiagramMermaid: [
    "classDiagram",
    "    class FeatureFlag {",
    "        -String key",
    "        -boolean enabled",
    "        -List~String~ variations",
    "        -String defaultVariation",
    "        -List~TargetingRule~ rules",
    "        -PercentageRollout rollout",
    "        +supportsVariation(String) boolean",
    "    }",
    "    class TargetingRule {",
    "        <<interface>>",
    "        +evaluate(UserContext, FeatureFlag) Optional~String~",
    "        +describe() String",
    "    }",
    "    class AttributeEqualsRule",
    "    class SegmentRule",
    "    class PercentageRollout {",
    "        -List~WeightedVariation~ weights",
    "        +add(String, int) PercentageRollout",
    "        +evaluate(String, UserContext, FeatureFlag) Optional~String~",
    "    }",
    "    class UserContext {",
    "        -String userKey",
    "        -Map~String,Object~ attributes",
    "        -Set~String~ segments",
    "        +getAttribute(String) Optional~Object~",
    "        +isInSegment(String) boolean",
    "    }",
    "    class FlagEvaluator {",
    "        +evaluate(FeatureFlag, UserContext) String",
    "    }",
    "    class FeatureFlagService {",
    "        -Map~String,FeatureFlag~ flags",
    "        -FlagEvaluator evaluator",
    "        -List~FlagChangeListener~ listeners",
    "        +getInstance() FeatureFlagService",
    "        +upsertFlag(FeatureFlag) void",
    "        +evaluate(String, UserContext, String) String",
    "    }",
    "    class FlagChangeListener {",
    "        <<interface>>",
    "        +onFlagChanged(FeatureFlag) void",
    "    }",
    "    FeatureFlag o-- TargetingRule",
    "    FeatureFlag o-- PercentageRollout",
    "    TargetingRule <|.. AttributeEqualsRule",
    "    TargetingRule <|.. SegmentRule",
    "    FlagEvaluator ..> TargetingRule",
    "    FlagEvaluator ..> PercentageRollout",
    "    TargetingRule ..> UserContext",
    "    FeatureFlagService o-- FeatureFlag",
    "    FeatureFlagService ..> FlagEvaluator",
    "    FeatureFlagService o-- FlagChangeListener",
  ].join("\n"),
  classDiagramCaptionMD:
    "The flag is an immutable definition; the evaluator is the stable engine; concrete targeting rules are pluggable strategies in an ordered chain; the singleton service owns storage and observer notifications.",

  sequenceDiagramMermaid: [
    "sequenceDiagram",
    "    actor Client",
    "    participant Service as FeatureFlagService",
    "    participant Evaluator as FlagEvaluator",
    "    participant Rule as TargetingRule",
    "    participant Rollout as PercentageRollout",
    "    Client->>Service: evaluate(flagKey, context, fallback)",
    "    Service->>Service: load FeatureFlag",
    "    alt flag missing",
    "        Service-->>Client: fallback variation",
    "    else flag found",
    "        Service->>Evaluator: evaluate(flag, context)",
    "        Evaluator->>Evaluator: return default if disabled",
    "        loop ordered rules",
    "            Evaluator->>Rule: evaluate(context, flag)",
    "            alt rule matches",
    "                Rule-->>Evaluator: variation",
    "            else rule misses",
    "                Rule-->>Evaluator: empty",
    "            end",
    "        end",
    "        alt no rule matched",
    "            Evaluator->>Rollout: evaluate(flagKey, context, flag)",
    "            Rollout-->>Evaluator: optional variation",
    "        end",
    "        Evaluator-->>Service: resolved variation",
    "        Service-->>Client: resolved variation",
    "    end",
  ].join("\n"),
  sequenceDiagramCaptionMD:
    "Evaluation has three precedence levels: disabled flag default, first matching targeting rule, then deterministic percentage rollout, and finally the default variation.",

  entities: [
    {
      name: "FeatureFlag",
      responsibilityMD:
        "Immutable flag definition. Holds the key, enabled state, allowed variations, default variation, ordered targeting rules, and fallback rollout.",
      attributes: ["key", "enabled", "variations", "defaultVariation", "rules", "rollout"],
    },
    {
      name: "TargetingRule",
      responsibilityMD:
        "Strategy interface for a single targeting decision. A rule either returns a variation or returns empty so the next rule can try.",
      attributes: ["evaluate(context, flag)", "describe()"],
    },
    {
      name: "PercentageRollout",
      responsibilityMD:
        "Deterministic bucketing policy. It maps **flagKey:userKey** to bucket 1..100 and selects the variation whose cumulative weight covers that bucket.",
      attributes: ["weights", "add", "evaluate", "bucket"],
    },
    {
      name: "UserContext",
      responsibilityMD:
        "Immutable snapshot of the caller being evaluated: stable user key, custom attributes, and segment membership.",
      attributes: ["userKey", "attributes", "segments"],
    },
    {
      name: "FlagEvaluator",
      responsibilityMD:
        "Stable evaluation engine. It owns precedence and chain traversal but delegates all rule-specific logic to **TargetingRule** implementations.",
      attributes: ["evaluate(flag, context)"],
    },
    {
      name: "FeatureFlagService",
      responsibilityMD:
        "Singleton facade over flag storage, evaluation, and update notifications. Application code talks to this boundary rather than the raw map.",
      attributes: ["flags", "evaluator", "listeners", "getInstance"],
    },
    {
      name: "FlagChangeListener",
      responsibilityMD:
        "Observer contract used by SDK caches, audit sinks, or streaming layers that react to flag changes.",
      attributes: ["onFlagChanged(flag)"],
    },
  ],

  patternsUsed: [
    {
      name: "Strategy",
      whyMD:
        "Each **TargetingRule** is a strategy for one kind of match: segment, attribute, plan, region, time window, or anything added later. The evaluator depends only on the interface.",
    },
    {
      name: "Chain of Responsibility",
      whyMD:
        "A flag owns an ordered chain of targeting rules. The evaluator asks each rule in order and stops at the first returned variation, preserving explicit business priority.",
    },
    {
      name: "Observer",
      whyMD:
        "**FeatureFlagService** notifies **FlagChangeListener** subscribers after a flag is upserted. SDK caches and audit streams react without being hard-coded into the service.",
    },
    {
      name: "Singleton",
      whyMD:
        "The in-memory demo uses one **FeatureFlagService** instance so all callers read the same flag registry. In production, the same boundary could wrap a distributed store.",
    },
  ],

  designSteps: [
    {
      title: "Separate flag definition from flag evaluation",
      detailMD:
        "A **FeatureFlag** is just data: allowed variations, default, rules, and rollout. It does not decide precedence. This keeps mutation, validation, and evaluation responsibilities clean.",
      code: [
        "public final class FeatureFlag {",
        "    private final List<TargetingRule> rules;",
        "    private final PercentageRollout rollout;",
        "    public List<TargetingRule> getRules() { return rules; }",
        "    public PercentageRollout getRollout() { return rollout; }",
        "}",
      ].join("\n"),
    },
    {
      title: "Make every rule a strategy",
      detailMD:
        "The evaluator should never know rule internals. A new rule type implements **TargetingRule** and returns an **Optional** variation. Empty means the chain should continue.",
      code: [
        "public interface TargetingRule {",
        "    Optional<String> evaluate(UserContext context, FeatureFlag flag);",
        "    String describe();",
        "}",
      ].join("\n"),
    },
    {
      title: "Evaluate rules as an ordered chain",
      detailMD:
        "Business teams expect rule order to matter. Put precise allowlists first, broader attribute rules later, and percentage rollout last.",
      code: [
        "for (TargetingRule rule : flag.getRules()) {",
        "    Optional<String> variation = rule.evaluate(context, flag);",
        "    if (variation.isPresent()) {",
        "        return variation.get();",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      title: "Use deterministic percentage rollout",
      detailMD:
        "Hash **flagKey:userKey** into a bucket from 1 to 100. As rollout moves from 10% to 25%, users already in the first 10 buckets remain enabled and only new buckets are added.",
      code: [
        "private int bucket(String flagKey, String userKey) {",
        "    CRC32 crc = new CRC32();",
        "    crc.update((flagKey + \":\" + userKey).getBytes(StandardCharsets.UTF_8));",
        "    return (int) (crc.getValue() % 100) + 1;",
        "}",
      ].join("\n"),
    },
    {
      title: "Expose a singleton service boundary",
      detailMD:
        "The service hides the registry map, validates the missing-flag fallback path, and emits update events. Application code should call **evaluate**, not manipulate flags directly.",
    },
    {
      title: "Notify observers after state changes",
      detailMD:
        "Listeners are called after the new flag snapshot is stored. That ordering prevents subscribers from reading stale state when they refresh their local caches.",
    },
  ],

  implementation: [
    {
      filename: "UserContext.java",
      language: "java",
      content: [
        "import java.util.Collections;",
        "import java.util.HashMap;",
        "import java.util.HashSet;",
        "import java.util.Map;",
        "import java.util.Objects;",
        "import java.util.Optional;",
        "import java.util.Set;",
        "",
        "public final class UserContext {",
        "    private final String userKey;",
        "    private final Map<String, Object> attributes;",
        "    private final Set<String> segments;",
        "",
        "    private UserContext(String userKey, Map<String, Object> attributes, Set<String> segments) {",
        "        this.userKey = Objects.requireNonNull(userKey, \"userKey\");",
        "        this.attributes = Collections.unmodifiableMap(new HashMap<>(attributes));",
        "        this.segments = Collections.unmodifiableSet(new HashSet<>(segments));",
        "    }",
        "",
        "    public static UserContext of(String userKey) {",
        "        return new UserContext(userKey, Collections.emptyMap(), Collections.emptySet());",
        "    }",
        "",
        "    public UserContext withAttribute(String key, Object value) {",
        "        Map<String, Object> copy = new HashMap<>(attributes);",
        "        copy.put(Objects.requireNonNull(key, \"key\"), Objects.requireNonNull(value, \"value\"));",
        "        return new UserContext(userKey, copy, segments);",
        "    }",
        "",
        "    public UserContext withSegment(String segmentKey) {",
        "        Set<String> copy = new HashSet<>(segments);",
        "        copy.add(Objects.requireNonNull(segmentKey, \"segmentKey\"));",
        "        return new UserContext(userKey, attributes, copy);",
        "    }",
        "",
        "    public String getUserKey() {",
        "        return userKey;",
        "    }",
        "",
        "    public Optional<Object> getAttribute(String key) {",
        "        return Optional.ofNullable(attributes.get(key));",
        "    }",
        "",
        "    public boolean isInSegment(String segmentKey) {",
        "        return segments.contains(segmentKey);",
        "    }",
        "",
        "    public Map<String, Object> getAttributes() {",
        "        return attributes;",
        "    }",
        "",
        "    public Set<String> getSegments() {",
        "        return segments;",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "FeatureFlag.java",
      language: "java",
      content: [
        "import java.util.ArrayList;",
        "import java.util.Collections;",
        "import java.util.List;",
        "import java.util.Objects;",
        "",
        "public final class FeatureFlag {",
        "    private final String key;",
        "    private final boolean enabled;",
        "    private final String defaultVariation;",
        "    private final List<String> variations;",
        "    private final List<TargetingRule> rules;",
        "    private final PercentageRollout rollout;",
        "",
        "    public FeatureFlag(String key, boolean enabled, String defaultVariation, List<String> variations, List<TargetingRule> rules, PercentageRollout rollout) {",
        "        this.key = Objects.requireNonNull(key, \"key\");",
        "        this.enabled = enabled;",
        "        this.variations = Collections.unmodifiableList(new ArrayList<>(Objects.requireNonNull(variations, \"variations\")));",
        "        this.defaultVariation = Objects.requireNonNull(defaultVariation, \"defaultVariation\");",
        "        if (this.variations.isEmpty()) {",
        "            throw new IllegalArgumentException(\"A flag needs at least one variation\");",
        "        }",
        "        if (!this.variations.contains(this.defaultVariation)) {",
        "            throw new IllegalArgumentException(\"Default variation must be allowed\");",
        "        }",
        "        List<TargetingRule> safeRules = rules == null ? Collections.emptyList() : rules;",
        "        this.rules = Collections.unmodifiableList(new ArrayList<>(safeRules));",
        "        this.rollout = rollout == null ? PercentageRollout.empty() : rollout;",
        "    }",
        "",
        "    public String getKey() {",
        "        return key;",
        "    }",
        "",
        "    public boolean isEnabled() {",
        "        return enabled;",
        "    }",
        "",
        "    public String getDefaultVariation() {",
        "        return defaultVariation;",
        "    }",
        "",
        "    public boolean supportsVariation(String variation) {",
        "        return variations.contains(variation);",
        "    }",
        "",
        "    public List<TargetingRule> getRules() {",
        "        return rules;",
        "    }",
        "",
        "    public PercentageRollout getRollout() {",
        "        return rollout;",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "TargetingRule.java",
      language: "java",
      content: [
        "import java.util.Objects;",
        "import java.util.Optional;",
        "",
        "public interface TargetingRule {",
        "    Optional<String> evaluate(UserContext context, FeatureFlag flag);",
        "    String describe();",
        "}",
        "",
        "final class AttributeEqualsRule implements TargetingRule {",
        "    private final String attribute;",
        "    private final String expectedValue;",
        "    private final String variation;",
        "",
        "    AttributeEqualsRule(String attribute, String expectedValue, String variation) {",
        "        this.attribute = Objects.requireNonNull(attribute, \"attribute\");",
        "        this.expectedValue = Objects.requireNonNull(expectedValue, \"expectedValue\");",
        "        this.variation = Objects.requireNonNull(variation, \"variation\");",
        "    }",
        "",
        "    @Override",
        "    public Optional<String> evaluate(UserContext context, FeatureFlag flag) {",
        "        boolean matched = context.getAttribute(attribute)",
        "                .map(value -> expectedValue.equals(String.valueOf(value)))",
        "                .orElse(false);",
        "        return matched && flag.supportsVariation(variation) ? Optional.of(variation) : Optional.empty();",
        "    }",
        "",
        "    @Override",
        "    public String describe() {",
        "        return attribute + \" == \" + expectedValue + \" -> \" + variation;",
        "    }",
        "}",
        "",
        "final class SegmentRule implements TargetingRule {",
        "    private final String segmentKey;",
        "    private final String variation;",
        "",
        "    SegmentRule(String segmentKey, String variation) {",
        "        this.segmentKey = Objects.requireNonNull(segmentKey, \"segmentKey\");",
        "        this.variation = Objects.requireNonNull(variation, \"variation\");",
        "    }",
        "",
        "    @Override",
        "    public Optional<String> evaluate(UserContext context, FeatureFlag flag) {",
        "        return context.isInSegment(segmentKey) && flag.supportsVariation(variation)",
        "                ? Optional.of(variation)",
        "                : Optional.empty();",
        "    }",
        "",
        "    @Override",
        "    public String describe() {",
        "        return \"segment \" + segmentKey + \" -> \" + variation;",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "PercentageRollout.java",
      language: "java",
      content: [
        "import java.nio.charset.StandardCharsets;",
        "import java.util.ArrayList;",
        "import java.util.List;",
        "import java.util.Objects;",
        "import java.util.Optional;",
        "import java.util.zip.CRC32;",
        "",
        "public final class PercentageRollout {",
        "    private final List<WeightedVariation> weights = new ArrayList<>();",
        "",
        "    public static PercentageRollout empty() {",
        "        return new PercentageRollout();",
        "    }",
        "",
        "    public PercentageRollout add(String variation, int percent) {",
        "        if (percent < 0 || percent > 100) {",
        "            throw new IllegalArgumentException(\"Percent must be between 0 and 100\");",
        "        }",
        "        int total = percent;",
        "        for (WeightedVariation weight : weights) {",
        "            total += weight.percent;",
        "        }",
        "        if (total > 100) {",
        "            throw new IllegalArgumentException(\"Rollout weights cannot exceed 100\");",
        "        }",
        "        weights.add(new WeightedVariation(variation, percent));",
        "        return this;",
        "    }",
        "",
        "    public Optional<String> evaluate(String flagKey, UserContext context, FeatureFlag flag) {",
        "        if (weights.isEmpty()) {",
        "            return Optional.empty();",
        "        }",
        "        int bucket = bucket(flagKey, context.getUserKey());",
        "        int cumulative = 0;",
        "        for (WeightedVariation weight : weights) {",
        "            cumulative += weight.percent;",
        "            if (bucket <= cumulative && flag.supportsVariation(weight.variation)) {",
        "                return Optional.of(weight.variation);",
        "            }",
        "        }",
        "        return Optional.empty();",
        "    }",
        "",
        "    private int bucket(String flagKey, String userKey) {",
        "        CRC32 crc = new CRC32();",
        "        crc.update((flagKey + \":\" + userKey).getBytes(StandardCharsets.UTF_8));",
        "        return (int) (crc.getValue() % 100) + 1;",
        "    }",
        "",
        "    private static final class WeightedVariation {",
        "        private final String variation;",
        "        private final int percent;",
        "",
        "        private WeightedVariation(String variation, int percent) {",
        "            this.variation = Objects.requireNonNull(variation, \"variation\");",
        "            this.percent = percent;",
        "        }",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "FlagEvaluator.java",
      language: "java",
      content: [
        "import java.util.Objects;",
        "import java.util.Optional;",
        "",
        "public final class FlagEvaluator {",
        "    public String evaluate(FeatureFlag flag, UserContext context) {",
        "        Objects.requireNonNull(flag, \"flag\");",
        "        Objects.requireNonNull(context, \"context\");",
        "",
        "        if (!flag.isEnabled()) {",
        "            return flag.getDefaultVariation();",
        "        }",
        "",
        "        for (TargetingRule rule : flag.getRules()) {",
        "            Optional<String> variation = rule.evaluate(context, flag);",
        "            if (variation.isPresent()) {",
        "                return variation.get();",
        "            }",
        "        }",
        "",
        "        return flag.getRollout()",
        "                .evaluate(flag.getKey(), context, flag)",
        "                .orElse(flag.getDefaultVariation());",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "FeatureFlagService.java",
      language: "java",
      content: [
        "import java.util.List;",
        "import java.util.Objects;",
        "import java.util.Optional;",
        "import java.util.Map;",
        "import java.util.concurrent.ConcurrentHashMap;",
        "import java.util.concurrent.CopyOnWriteArrayList;",
        "",
        "public final class FeatureFlagService {",
        "    private static final FeatureFlagService INSTANCE = new FeatureFlagService();",
        "",
        "    private final Map<String, FeatureFlag> flags = new ConcurrentHashMap<>();",
        "    private final FlagEvaluator evaluator = new FlagEvaluator();",
        "    private final List<FlagChangeListener> listeners = new CopyOnWriteArrayList<>();",
        "",
        "    private FeatureFlagService() {",
        "    }",
        "",
        "    public static FeatureFlagService getInstance() {",
        "        return INSTANCE;",
        "    }",
        "",
        "    public void upsertFlag(FeatureFlag flag) {",
        "        Objects.requireNonNull(flag, \"flag\");",
        "        flags.put(flag.getKey(), flag);",
        "        notifyListeners(flag);",
        "    }",
        "",
        "    public Optional<FeatureFlag> getFlag(String flagKey) {",
        "        return Optional.ofNullable(flags.get(flagKey));",
        "    }",
        "",
        "    public String evaluate(String flagKey, UserContext context, String fallbackVariation) {",
        "        return getFlag(flagKey)",
        "                .map(flag -> evaluator.evaluate(flag, context))",
        "                .orElse(fallbackVariation);",
        "    }",
        "",
        "    public void addListener(FlagChangeListener listener) {",
        "        listeners.add(Objects.requireNonNull(listener, \"listener\"));",
        "    }",
        "",
        "    public void removeListener(FlagChangeListener listener) {",
        "        listeners.remove(listener);",
        "    }",
        "",
        "    private void notifyListeners(FeatureFlag flag) {",
        "        for (FlagChangeListener listener : listeners) {",
        "            listener.onFlagChanged(flag);",
        "        }",
        "    }",
        "}",
        "",
        "interface FlagChangeListener {",
        "    void onFlagChanged(FeatureFlag flag);",
        "}",
      ].join("\n"),
    },
    {
      filename: "Main.java",
      language: "java",
      content: [
        "import java.util.Arrays;",
        "",
        "public final class Main {",
        "    public static void main(String[] args) {",
        "        FeatureFlagService service = FeatureFlagService.getInstance();",
        "        service.addListener(flag -> System.out.println(\"Updated flag: \" + flag.getKey()));",
        "",
        "        PercentageRollout rollout = new PercentageRollout()",
        "                .add(\"on\", 25)",
        "                .add(\"off\", 75);",
        "",
        "        FeatureFlag checkout = new FeatureFlag(",
        "                \"new-checkout\",",
        "                true,",
        "                \"off\",",
        "                Arrays.asList(\"on\", \"off\"),",
        "                Arrays.asList(",
        "                        new SegmentRule(\"beta-testers\", \"on\"),",
        "                        new AttributeEqualsRule(\"country\", \"IN\", \"on\")",
        "                ),",
        "                rollout",
        "        );",
        "",
        "        service.upsertFlag(checkout);",
        "",
        "        UserContext betaUser = UserContext.of(\"maya\")",
        "                .withSegment(\"beta-testers\")",
        "                .withAttribute(\"country\", \"US\");",
        "        UserContext indiaUser = UserContext.of(\"ravi\")",
        "                .withAttribute(\"country\", \"IN\");",
        "        UserContext visitor = UserContext.of(\"alex\")",
        "                .withAttribute(\"country\", \"BR\");",
        "",
        "        System.out.println(\"maya -> \" + service.evaluate(\"new-checkout\", betaUser, \"off\"));",
        "        System.out.println(\"ravi -> \" + service.evaluate(\"new-checkout\", indiaUser, \"off\"));",
        "        System.out.println(\"alex -> \" + service.evaluate(\"new-checkout\", visitor, \"off\"));",
        "    }",
        "}",
      ].join("\n"),
    },
  ],

  classExplanations: [
    {
      className: "FeatureFlag",
      detailMD:
        "Immutable flag snapshot containing all data needed for evaluation: key, enabled state, allowed variations, default, ordered rules, and rollout. It validates the default variation up front.",
    },
    {
      className: "TargetingRule",
      detailMD:
        "Strategy interface plus example rule classes. **AttributeEqualsRule** checks context attributes, while **SegmentRule** checks segment membership. Both return empty when they do not match.",
    },
    {
      className: "PercentageRollout",
      detailMD:
        "Deterministic rollout strategy. It uses CRC32 over **flagKey:userKey**, maps the result to bucket 1..100, and applies cumulative weights.",
    },
    {
      className: "UserContext",
      detailMD:
        "Immutable evaluation input. The fluent methods return new contexts, preventing one request from mutating the attributes or segments used by another request.",
    },
    {
      className: "FlagEvaluator",
      detailMD:
        "Stable engine that enforces precedence: disabled default, ordered targeting chain, percentage rollout, then default. It never switches on rule type.",
    },
    {
      className: "FeatureFlagService",
      detailMD:
        "Singleton facade with an in-memory concurrent registry, evaluation entry point, and observer notification hook for flag changes.",
    },
    {
      className: "Main",
      detailMD:
        "Small demo that registers a flag, adds a listener, defines segment and attribute rules, and evaluates three different user contexts.",
    },
  ],

  dryRun: {
    inputMD:
      "Flag **new-checkout** has variations **on/off**, default **off**, rules **SegmentRule(beta-testers -> on)** then **AttributeEqualsRule(country=IN -> on)**, and rollout **25% on / 75% off**.",
    columns: ["Step", "Context", "Rule chain result", "Rollout result", "Returned variation"],
    rows: [
      ["1", "maya in beta-testers, country=US", "SegmentRule matches", "Skipped", "on"],
      ["2", "ravi not in segment, country=IN", "AttributeEqualsRule matches", "Skipped", "on"],
      ["3", "alex not in segment, country=BR", "No rule matches", "Stable bucket lands in first 25", "on"],
      ["4", "missing flag for chen", "No flag loaded", "Not evaluated", "caller fallback off"],
    ],
    narrativeMD:
      "The run shows the precedence order. Explicit segment targeting beats attribute targeting, attribute targeting beats rollout, and missing flags are handled by the service fallback instead of throwing.",
  },

  complexity: [
    {
      operation: "evaluate flag",
      time: "O(R + W)",
      space: "O(1)",
      note: "R targeting rules are checked until a match; W rollout weight entries are scanned only when no rule matches.",
    },
    {
      operation: "upsert flag",
      time: "O(1 + L)",
      space: "O(1)",
      note: "Concurrent map update plus notifying L listeners.",
    },
    {
      operation: "build user context",
      time: "O(A + S)",
      space: "O(A + S)",
      note: "Immutable copies for A attributes and S segment keys keep evaluation inputs safe.",
    },
    {
      operation: "percentage bucket",
      time: "O(K)",
      space: "O(1)",
      note: "K is the combined length of flag key and user key fed into the hash.",
    },
  ],
  complexityNotesMD:
    "Evaluation is intentionally local to one flag. If a flag accumulates hundreds of rules, index segment rules or compile rules into a decision tree, but keep the public evaluator contract unchanged.",

  extensibility: [
    {
      label: "New rule type",
      detailMD:
        "Add a class such as **PlanRule**, **EmailDomainRule**, or **TimeWindowRule** that implements **TargetingRule**. **FlagEvaluator** stays untouched.",
    },
    {
      label: "Typed variations",
      detailMD:
        "Replace string variations with a **VariationValue** object that can hold boolean, number, string, or JSON-like payloads. The rule contract can still return the selected variation key.",
    },
    {
      label: "External segments",
      detailMD:
        "Resolve segment membership before building **UserContext**, or introduce a **SegmentProvider** used by **SegmentRule**. Keep remote I/O outside the hot evaluator path.",
    },
    {
      label: "Advanced rollout algorithms",
      detailMD:
        "Swap **PercentageRollout** for experiments, prerequisite flags, or mutually exclusive experiments. The evaluator still treats rollout as the final strategy after rules.",
    },
    {
      label: "Persistence and audit",
      detailMD:
        "Store immutable flag versions in a repository and have **FeatureFlagService** upsert snapshots from that repository. Listener events can include old and new versions.",
    },
  ],

  alternativeDesigns: [
    {
      name: "Expression tree rules",
      detailMD:
        "Represent targeting as an expression tree with AND, OR, NOT, and leaf predicates. The evaluator recursively evaluates the tree and returns a variation at matching leaves.",
      tradeoffsMD:
        "More powerful for product teams, but harder to explain and validate in a machine-coding interview than an ordered rule chain.",
    },
    {
      name: "Central decision table",
      detailMD:
        "Flatten rules into table rows with columns for segment, country, plan, and variation. Evaluation scans rows and chooses the first row whose predicates all match.",
      tradeoffsMD:
        "Easy for simple admin UIs, but adding new predicate types often changes the table schema and evaluator logic.",
    },
    {
      name: "Remote SDK cache",
      detailMD:
        "Move storage and evaluation data to a remote control plane. Application SDKs keep an in-memory cache and evaluate locally, refreshing via streaming updates.",
      tradeoffsMD:
        "Better production latency and availability, but introduces distributed cache consistency, streaming retries, and stale-data handling.",
    },
  ],

  commonMistakes: [
    "Putting a switch on rule type inside **FlagEvaluator**, which violates the open-closed goal of the problem.",
    "Using random numbers for percentage rollout, causing a user to flip between variations across requests.",
    "Ignoring rule order and combining all matches, which makes explicit targeting unpredictable.",
    "Returning null for missing flags instead of a clear caller fallback or default variation.",
    "Letting **UserContext** be mutable while multiple threads evaluate flags against it.",
    "Not validating that rules and rollouts return only allowed variations.",
    "Calling observers before storing the new flag snapshot, causing listeners to refresh stale data.",
  ],

  followUps: [
    {
      question: "How would you support multivariate experiments?",
      answerMD:
        "Keep variations as named keys and let **PercentageRollout** hold multiple weighted variations such as A 50%, B 25%, C 25%. Metrics and experiment analysis are separate systems fed by evaluation events.",
    },
    {
      question: "How do you keep rollout stable when increasing from 10% to 25%?",
      answerMD:
        "Use deterministic buckets. Users in buckets 1..10 stay enabled, and buckets 11..25 are newly enabled. Never reshuffle all users on each percentage change.",
    },
    {
      question: "Where do prerequisite flags fit?",
      answerMD:
        "Add a **PrerequisiteFlagRule** that asks an evaluator for another flag's result, with cycle detection and a max depth. The main engine still sees it as a targeting rule.",
    },
    {
      question: "How would you scale this across services?",
      answerMD:
        "Serve flag snapshots from a control plane, let SDKs evaluate locally, and push updates through streaming or polling. The same evaluator can run inside every SDK process.",
    },
    {
      question: "How do you audit flag changes?",
      answerMD:
        "Version every flag update, record actor, timestamp, old value, new value, and change reason. Emit observer events after persistence so audit trails and cache invalidations are consistent.",
    },
  ],

  productionConsiderations: [
    {
      label: "Persistence and versioning",
      detailMD:
        "Store flag definitions as immutable versions. Evaluators should receive a complete snapshot so a request never observes half of an update.",
    },
    {
      label: "SDK caching",
      detailMD:
        "Production SDKs should evaluate locally from a cache and refresh by streaming updates or polling. Remote calls during every request would add latency and outage coupling.",
    },
    {
      label: "Observability",
      detailMD:
        "Emit evaluation counts by flag, variation, rule id, and fallback reason. Alert on sudden missing-flag spikes or unexpected variation distribution.",
    },
    {
      label: "Governance",
      detailMD:
        "Track owners, descriptions, expiry dates, and cleanup status. Stale flags become hidden complexity and can keep dead code alive for years.",
    },
    {
      label: "Security",
      detailMD:
        "Admin mutations need RBAC, approvals for production environments, and audit logs. Client-side SDKs must receive only flags safe to expose to end users.",
    },
  ],

  interviewNotes: [
    "Did you clearly separate flag data, rule strategies, evaluation engine, and service boundary?",
    "Can you add a new rule type without editing **FlagEvaluator**?",
    "Is percentage rollout deterministic per flag and user?",
    "Did you explain rule ordering and first-match-wins semantics?",
    "Did you include cache invalidation or observer notifications for flag updates?",
    "Did you name the missing-flag and disabled-flag fallback behavior?",
  ],

  quiz: [
    {
      question: "Why should **FlagEvaluator** not switch on concrete rule type?",
      options: [
        "Because rule classes should be loaded only through reflection",
        "Because adding a new rule would require editing and retesting the engine",
        "Because switch statements cannot return strings in Java",
        "Because percentage rollout would stop being deterministic",
      ],
      answerIndex: 1,
      explanationMD:
        "The target design is open for extension. New rules should implement **TargetingRule** and join the chain without changing evaluator code.",
    },
    {
      question: "What does first-match-wins mean for targeting rules?",
      options: [
        "All matching rules are merged into one variation",
        "The last rule always has the highest priority",
        "The evaluator returns the variation from the earliest matching rule",
        "Rules are evaluated randomly to spread load",
      ],
      answerIndex: 2,
      explanationMD:
        "Ordered rules behave like a chain of responsibility. The first rule that can handle the context returns the decision.",
    },
    {
      question: "Why hash **flagKey:userKey** for rollout instead of only **userKey**?",
      options: [
        "So different flags can bucket the same user independently",
        "So user keys can be shorter",
        "So disabled flags still run rollout",
        "So segment rules are skipped",
      ],
      answerIndex: 0,
      explanationMD:
        "Including the flag key avoids every flag assigning the same users to the enabled bucket, while still keeping each flag stable.",
    },
    {
      question: "Which pattern is represented by **FlagChangeListener**?",
      options: [
        "Strategy",
        "Observer",
        "Prototype",
        "Object Pool",
      ],
      answerIndex: 1,
      explanationMD:
        "Listeners subscribe to state changes and are notified after updates, which is the Observer pattern.",
    },
    {
      question: "What should happen when a flag is disabled?",
      options: [
        "Evaluate rollout but skip targeting rules",
        "Throw an exception so callers notice",
        "Return the flag's default variation",
        "Delete the flag from storage",
      ],
      answerIndex: 2,
      explanationMD:
        "Disabled flags should be safe and predictable. Returning the default variation avoids partial targeting behavior.",
    },
  ],

  practiceVariants: [
    {
      title: "Add prerequisite flags",
      detailMD:
        "Implement a **PrerequisiteFlagRule** that matches only when another flag resolves to a required variation. Add cycle detection to prevent recursive evaluation loops.",
      difficulty: "Advanced",
    },
    {
      title: "Add rule groups with AND and OR",
      detailMD:
        "Support compound targeting such as country=IN AND plan=PRO, while preserving the same **TargetingRule** contract for the evaluator.",
      difficulty: "Intermediate",
    },
    {
      title: "Add flag version audit events",
      detailMD:
        "Extend the service to persist old and new flag versions, then send observers a structured change event with actor, timestamp, and reason.",
      difficulty: "Advanced",
    },
  ],

  flashcards: [
    {
      front: "What is the core evaluation precedence?",
      back: "Disabled flag returns default; otherwise ordered targeting rules; then percentage rollout; finally default variation.",
    },
    {
      front: "Which abstraction keeps new rule types out of the engine?",
      back: "**TargetingRule**. Each concrete rule decides whether it can return a variation for the given **UserContext**.",
    },
    {
      front: "Why is rollout deterministic?",
      back: "It hashes **flagKey:userKey** to a stable bucket, so the same user keeps the same variation for a flag.",
    },
    {
      front: "Where is Chain of Responsibility used?",
      back: "The ordered list of targeting rules. The first rule that matches handles the request and stops the chain.",
    },
    {
      front: "What does the Observer pattern do here?",
      back: "**FlagChangeListener** subscribers are notified after **FeatureFlagService** stores a new flag snapshot.",
    },
    {
      front: "What is the hot-path complexity of evaluation?",
      back: "O(R + W), where R is rules on the flag and W is rollout weight entries checked only if no rule matches.",
    },
  ],

  cheatSheetMD: [
    "**Entities:** FeatureFlag, TargetingRule, PercentageRollout, UserContext, FlagEvaluator, FeatureFlagService, FlagChangeListener.",
    "",
    "**Patterns:** Strategy for rules, Chain of Responsibility for ordered first-match evaluation, Observer for change notifications, Singleton for the demo service boundary.",
    "",
    "**Evaluation order:** missing flag -> caller fallback; disabled flag -> default; targeting rules -> first matching variation; rollout -> deterministic bucket; otherwise default.",
    "",
    "**Determinism:** hash **flagKey:userKey** into bucket 1..100; cumulative rollout weights choose the variation.",
    "",
    "**Extensibility:** add a new rule by implementing **TargetingRule**. Do not edit **FlagEvaluator** for country, plan, device, segment, or time-window rules.",
    "",
    "**Production:** SDK local cache, immutable flag versions, audit log, RBAC for admin changes, metrics by flag/rule/variation, cleanup workflow for stale flags.",
  ].join("\n"),

  references: [
    {
      title: "LaunchDarkly Documentation — Feature flags and targeting",
      kind: "Docs",
      url: "https://docs.launchdarkly.com/home/flags",
      author: "LaunchDarkly",
    },
    {
      title: "Feature Toggles",
      kind: "Blog",
      url: "https://martinfowler.com/articles/feature-toggles.html",
      author: "Martin Fowler",
    },
    {
      title: "Head First Design Patterns (Strategy and Observer)",
      kind: "Book",
      author: "Freeman & Robson",
    },
    {
      title: "Refactoring Guru — Chain of Responsibility",
      kind: "Docs",
      url: "https://refactoring.guru/design-patterns/chain-of-responsibility",
    },
  ],

  relatedProblems: [
    { slug: "api-gateway", note: "Gateways often use flags for route rollout, canaries, and kill switches." },
    { slug: "rate-limiter", note: "Both systems depend on fast deterministic decisions in the request path." },
    { slug: "rbac-system", note: "Admin permissions and targeting rules both model policy decisions over a user context." },
  ],
};
