import type { LLDProblemContent } from "../types";

export const notificationSystem: LLDProblemContent = {
  slug: "notification-system",

  statementMD: [
    "Design the object model for a **notification system** that accepts product events such as order shipped, password reset, payment failed, or promotion started and delivers them through multiple channels.",
    "",
    "The system must support **email**, **SMS**, and **push** today, render messages from reusable templates, respect per-user channel preferences, retry transient failures with backoff, and allow decorators such as dedupe or rate limiting around any channel.",
    "",
    "The core design goal is extensibility: adding a WhatsApp, in-app, or Slack channel should mean implementing **NotificationChannel** and registering it, not editing the dispatcher that publishes notifications.",
  ].join("\n"),

  businessContextMD: [
    "Notifications are the connective tissue of marketplaces, fintech apps, productivity tools, and delivery platforms. A checkout service, fraud service, or logistics service should publish a business event without knowing provider APIs, templates, retry rules, or opt-in preferences.",
    "",
    "Interviewers like this problem because it compresses several production concerns into a small LLD surface: **Strategy** for channels, **Observer** for pub-sub fan-out, **Factory Method** for channel creation, **Decorator** for cross-cutting delivery controls, and careful boundaries around templates, preferences, and retries.",
  ].join("\n"),

  functionalRequirements: [
    "Accept a notification request containing user id, template name, dynamic template data, and optional explicit channel names.",
    "Render a message from a named template before dispatching it to channels.",
    "Store per-user channel preferences so users can opt into email, SMS, push, or any future channel.",
    "Dispatch each notification to all subscribed channel observers that match the resolved delivery targets.",
    "Provide email, SMS, and push channel implementations behind one **NotificationChannel** interface.",
    "Retry transient channel failures with a bounded exponential backoff policy.",
    "Allow decorators such as dedupe and rate limiting to wrap any channel without changing the channel implementation.",
    "Allow a new channel to be added by registering a supplier and subscribing the channel, with no change to **NotificationService.publish**.",
  ],

  nonFunctionalRequirements: [
    {
      label: "Extensibility",
      detailMD:
        "Channel addition must be additive. The dispatcher depends on **NotificationSubscriber** and **NotificationChannel**, not on concrete classes or switch statements.",
    },
    {
      label: "Reliability",
      detailMD:
        "Transient provider failures should be retried a small number of times with backoff, then surfaced as a delivery failure instead of being silently swallowed.",
    },
    {
      label: "User preference correctness",
      detailMD:
        "A user who opted out of SMS must not receive SMS just because a producer requested all channels. Preference resolution is part of the service boundary.",
    },
    {
      label: "Low coupling",
      detailMD:
        "Business producers publish **Notification** objects; they do not know provider SDKs, template storage, preference storage, decorators, or retry policy.",
    },
    {
      label: "Observability",
      detailMD:
        "Each channel attempt should be measurable by channel, template, user segment, attempt count, success, failure, and dedupe or rate-limit decision.",
    },
  ],

  requirementClarification: [
    {
      question: "Is delivery synchronous or asynchronous?",
      answerMD:
        "For the base LLD, the dispatcher runs in memory and calls subscribers directly so the object model is clear. In production, the same observer boundary can publish jobs to a queue per channel.",
    },
    {
      question: "Do we guarantee exactly once delivery?",
      answerMD:
        "No. Provider APIs and retries usually produce at-least-once behavior. The design includes a dedupe decorator so the system can reduce duplicates for a stable idempotency key.",
    },
    {
      question: "Where are templates and preferences stored?",
      answerMD:
        "Use in-memory maps in the reference implementation. The interfaces are intentionally narrow so a repository or external preference service can replace them later.",
    },
    {
      question: "What happens when a user has no saved preference?",
      answerMD:
        "Default to all subscribed channels unless the notification explicitly requests a smaller channel set. A real product may choose safer defaults based on consent policy.",
    },
    {
      question: "Are provider details like SendGrid, Twilio, or FCM in scope?",
      answerMD:
        "Only as channel implementations. The model treats them as adapters behind **NotificationChannel** so provider SDK details do not leak into the dispatcher.",
    },
  ],

  classDiagramMermaid: [
    "classDiagram",
    "    class Notification {",
    "        -String userId",
    "        -String templateName",
    "        -Map~String,String~ data",
    "        -Set~String~ requestedChannels",
    "        +hasExplicitChannels() boolean",
    "    }",
    "    class NotificationTemplate {",
    "        -String name",
    "        -String body",
    "        +render(Map~String,String~) String",
    "    }",
    "    class NotificationService {",
    "        -Map~String,NotificationTemplate~ templates",
    "        -Map preferences",
    "        -List~NotificationSubscriber~ subscribers",
    "        -RetryPolicy retryPolicy",
    "        +publish(Notification) void",
    "        +subscribeChannel(NotificationChannel) void",
    "    }",
    "    class NotificationSubscriber {",
    "        <<interface>>",
    "        +channelName() String",
    "        +onNotification(Notification,String,RetryPolicy) void",
    "    }",
    "    class ChannelSubscriber",
    "    class NotificationChannel {",
    "        <<interface>>",
    "        +name() String",
    "        +send(Notification,String) void",
    "    }",
    "    class EmailChannel",
    "    class SmsChannel",
    "    class PushChannel",
    "    class ChannelDecorator",
    "    class DedupingChannel",
    "    class RateLimitedChannel",
    "    class ChannelFactory {",
    "        -Map registry",
    "        +register(String,Supplier) void",
    "        +create(String) NotificationChannel",
    "    }",
    "    class RetryPolicy {",
    "        -int maxAttempts",
    "        -Duration initialBackoff",
    "        +execute(String,Runnable) void",
    "    }",
    "    NotificationService o-- NotificationTemplate",
    "    NotificationService o-- NotificationSubscriber",
    "    NotificationService ..> RetryPolicy",
    "    NotificationSubscriber <|.. ChannelSubscriber",
    "    ChannelSubscriber --> NotificationChannel",
    "    NotificationChannel <|.. EmailChannel",
    "    NotificationChannel <|.. SmsChannel",
    "    NotificationChannel <|.. PushChannel",
    "    NotificationChannel <|.. ChannelDecorator",
    "    ChannelDecorator <|-- DedupingChannel",
    "    ChannelDecorator <|-- RateLimitedChannel",
    "    ChannelDecorator o-- NotificationChannel",
    "    ChannelFactory ..> NotificationChannel",
    "    NotificationService ..> Notification",
  ].join("\n"),
  classDiagramCaptionMD:
    "The service owns orchestration, templates, preferences, observers, and retry policy. Concrete channels are strategies, and decorators wrap them without changing **NotificationService**.",

  sequenceDiagramMermaid: [
    "sequenceDiagram",
    "    actor App",
    "    participant Service as NotificationService",
    "    participant Template as NotificationTemplate",
    "    participant Subscriber as ChannelSubscriber",
    "    participant Retry as RetryPolicy",
    "    participant Channel as NotificationChannel",
    "    App->>Service: publish(notification)",
    "    Service->>Template: render(data)",
    "    Template-->>Service: rendered message",
    "    Service->>Service: resolve user preferences",
    "    loop matching subscribers",
    "        Service->>Subscriber: onNotification(notification,message,retryPolicy)",
    "        Subscriber->>Retry: execute(channelName, send)",
    "        Retry->>Channel: send(notification,message)",
    "        alt transient failure",
    "            Channel--xRetry: RuntimeException",
    "            Retry->>Retry: backoff and retry",
    "            Retry->>Channel: send(notification,message)",
    "        end",
    "        Channel-->>Retry: delivered",
    "    end",
    "    Service-->>App: publish completed",
  ].join("\n"),
  sequenceDiagramCaptionMD:
    "Publishing is a pub-sub fan-out: the service renders once, resolves targets once, then lets each observer deliver through its channel strategy and retry policy.",

  entities: [
    {
      name: "Notification",
      responsibilityMD:
        "Immutable request object representing who should be notified, which template to use, which dynamic values to render, and any explicitly requested channels.",
      attributes: ["userId", "templateName", "data", "requestedChannels"],
    },
    {
      name: "NotificationTemplate",
      responsibilityMD:
        "Owns the message body and placeholder replacement. It keeps rendering rules out of channels so channels only deliver already-rendered content.",
      attributes: ["name", "body", "render(values)"],
    },
    {
      name: "NotificationService",
      responsibilityMD:
        "Facade and dispatcher. Stores templates and preferences, resolves delivery targets, and publishes to subscribed observers.",
      attributes: ["templates", "preferences", "subscribers", "retryPolicy"],
    },
    {
      name: "NotificationSubscriber",
      responsibilityMD:
        "Observer interface. A subscriber declares the channel name it handles and reacts when the service publishes a matching notification.",
      attributes: ["channelName", "onNotification"],
    },
    {
      name: "NotificationChannel",
      responsibilityMD:
        "Strategy interface for delivery. Email, SMS, push, and future channels all expose the same **send** operation.",
      attributes: ["name", "send"],
    },
    {
      name: "ChannelFactory",
      responsibilityMD:
        "Registry-backed factory. It maps channel names to suppliers and creates channels without making the dispatcher depend on concrete channel constructors.",
      attributes: ["registry", "register", "create", "createAll"],
    },
    {
      name: "RetryPolicy",
      responsibilityMD:
        "Reusable retry executor that catches transient runtime failures, waits with exponential backoff, and stops after a bounded attempt budget.",
      attributes: ["maxAttempts", "initialBackoff", "execute"],
    },
    {
      name: "ChannelDecorator",
      responsibilityMD:
        "Base wrapper for cross-cutting channel behavior. **DedupingChannel** and **RateLimitedChannel** demonstrate how controls can be layered around any channel.",
      attributes: ["delegate", "send"],
    },
    {
      name: "EmailChannel / SmsChannel / PushChannel",
      responsibilityMD:
        "Concrete strategies for provider-specific delivery. The sample prints to the console, but real implementations would call provider SDKs.",
      attributes: ["name", "send"],
    },
  ],

  patternsUsed: [
    {
      name: "Observer",
      whyMD:
        "**NotificationService** keeps a list of **NotificationSubscriber** observers. Publishing a notification fans out to every subscriber whose channel matches the user's target set.",
    },
    {
      name: "Strategy",
      whyMD:
        "**NotificationChannel** is the delivery strategy. Email, SMS, push, and future channels vary provider behavior behind a single **send** method.",
    },
    {
      name: "Factory Method",
      whyMD:
        "**ChannelFactory.create** is the creation seam. New channel suppliers are registered by name and instantiated through the factory, so callers do not construct concrete channels directly.",
    },
    {
      name: "Decorator",
      whyMD:
        "**DedupingChannel** and **RateLimitedChannel** wrap any **NotificationChannel**. Cross-cutting delivery policy is composed around a channel instead of being copied into each channel class.",
    },
  ],

  designSteps: [
    {
      title: "Model a notification as an immutable command-like value",
      detailMD:
        "The producer supplies user id, template name, template data, and optionally a smaller set of channel names. Empty requested channels means the service should use stored user preferences.",
      code: [
        "Notification notification = Notification.of(",
        "    \"user-7\",",
        "    \"orderReady\",",
        "    Map.of(\"name\", \"Asha\", \"orderId\", \"EIQ-42\"),",
        "    List.of()",
        ");",
      ].join("\n"),
    },
    {
      title: "Represent channels as strategies",
      detailMD:
        "Every provider implements **NotificationChannel**. The dispatcher asks for **name** and calls **send**; it never checks whether the object is email, SMS, push, or a future channel.",
      code: [
        "public interface NotificationChannel {",
        "    String name();",
        "    void send(Notification notification, String message);",
        "}",
      ].join("\n"),
    },
    {
      title: "Render templates before delivery",
      detailMD:
        "**NotificationTemplate** transforms data into a final message once. Channels should not know placeholder syntax, localization rules, or template storage.",
    },
    {
      title: "Use Observer for fan-out",
      detailMD:
        "The service stores **NotificationSubscriber** objects. **publish** resolves target channel names, then notifies matching subscribers. That is the pub-sub boundary that can later become queue publishing.",
      code: [
        "for (NotificationSubscriber subscriber : subscribers) {",
        "    if (targets.contains(subscriber.channelName())) {",
        "        subscriber.onNotification(notification, message, retryPolicy);",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      title: "Create channels through a registry-backed factory",
      detailMD:
        "**ChannelFactory** maps names to suppliers. Adding a new channel means registering **whatsapp** with **WhatsAppChannel::new** and subscribing that channel; **NotificationService.publish** stays closed for modification.",
    },
    {
      title: "Compose retry and decorators around delivery",
      detailMD:
        "**ChannelSubscriber** invokes **RetryPolicy** for each send. Decorators such as **DedupingChannel** and **RateLimitedChannel** can be layered around any channel before subscription.",
    },
  ],

  implementation: [
    {
      filename: "Notification.java",
      language: "java",
      content: [
        "import java.util.Collection;",
        "import java.util.Collections;",
        "import java.util.LinkedHashMap;",
        "import java.util.LinkedHashSet;",
        "import java.util.Map;",
        "import java.util.Objects;",
        "import java.util.Set;",
        "",
        "public final class Notification {",
        "    private final String userId;",
        "    private final String templateName;",
        "    private final Map<String, String> data;",
        "    private final Set<String> requestedChannels;",
        "",
        "    public Notification(",
        "            String userId,",
        "            String templateName,",
        "            Map<String, String> data,",
        "            Collection<String> requestedChannels) {",
        "        this.userId = requireText(userId, \"userId\");",
        "        this.templateName = requireText(templateName, \"templateName\");",
        "        this.data = Collections.unmodifiableMap(new LinkedHashMap<>(Objects.requireNonNull(data, \"data\")));",
        "        this.requestedChannels = Collections.unmodifiableSet(",
        "                new LinkedHashSet<>(Objects.requireNonNull(requestedChannels, \"requestedChannels\")));",
        "    }",
        "",
        "    public static Notification of(",
        "            String userId,",
        "            String templateName,",
        "            Map<String, String> data,",
        "            Collection<String> requestedChannels) {",
        "        return new Notification(userId, templateName, data, requestedChannels);",
        "    }",
        "",
        "    public String userId() {",
        "        return userId;",
        "    }",
        "",
        "    public String templateName() {",
        "        return templateName;",
        "    }",
        "",
        "    public Map<String, String> data() {",
        "        return data;",
        "    }",
        "",
        "    public Set<String> requestedChannels() {",
        "        return requestedChannels;",
        "    }",
        "",
        "    public boolean hasExplicitChannels() {",
        "        return !requestedChannels.isEmpty();",
        "    }",
        "",
        "    private static String requireText(String value, String field) {",
        "        if (value == null || value.isBlank()) {",
        "            throw new IllegalArgumentException(field + \" is required\");",
        "        }",
        "        return value;",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "NotificationChannel.java",
      language: "java",
      content: [
        "public interface NotificationChannel {",
        "    String name();",
        "",
        "    void send(Notification notification, String message);",
        "}",
      ].join("\n"),
    },
    {
      filename: "EmailChannel.java",
      language: "java",
      content: [
        "public final class EmailChannel implements NotificationChannel {",
        "    @Override",
        "    public String name() {",
        "        return \"email\";",
        "    }",
        "",
        "    @Override",
        "    public void send(Notification notification, String message) {",
        "        System.out.println(\"[email] \" + notification.userId() + \" -> \" + message);",
        "    }",
        "}",
        "",
        "final class SmsChannel implements NotificationChannel {",
        "    @Override",
        "    public String name() {",
        "        return \"sms\";",
        "    }",
        "",
        "    @Override",
        "    public void send(Notification notification, String message) {",
        "        System.out.println(\"[sms] \" + notification.userId() + \" -> \" + message);",
        "    }",
        "}",
        "",
        "final class PushChannel implements NotificationChannel {",
        "    @Override",
        "    public String name() {",
        "        return \"push\";",
        "    }",
        "",
        "    @Override",
        "    public void send(Notification notification, String message) {",
        "        System.out.println(\"[push] \" + notification.userId() + \" -> \" + message);",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "ChannelDecorators.java",
      language: "java",
      content: [
        "import java.time.Duration;",
        "import java.time.Instant;",
        "import java.util.HashSet;",
        "import java.util.Objects;",
        "import java.util.Set;",
        "",
        "abstract class ChannelDecorator implements NotificationChannel {",
        "    private final NotificationChannel delegate;",
        "",
        "    protected ChannelDecorator(NotificationChannel delegate) {",
        "        this.delegate = Objects.requireNonNull(delegate, \"delegate\");",
        "    }",
        "",
        "    @Override",
        "    public String name() {",
        "        return delegate.name();",
        "    }",
        "",
        "    protected NotificationChannel delegate() {",
        "        return delegate;",
        "    }",
        "}",
        "",
        "final class DedupingChannel extends ChannelDecorator {",
        "    private final Set<String> deliveredKeys = new HashSet<>();",
        "",
        "    DedupingChannel(NotificationChannel delegate) {",
        "        super(delegate);",
        "    }",
        "",
        "    @Override",
        "    public synchronized void send(Notification notification, String message) {",
        "        String key = notification.userId() + \"|\" + notification.templateName() + \"|\" + name() + \"|\" + message;",
        "        if (deliveredKeys.contains(key)) {",
        "            System.out.println(\"[dedupe] skipped duplicate on \" + name());",
        "            return;",
        "        }",
        "        delegate().send(notification, message);",
        "        deliveredKeys.add(key);",
        "    }",
        "}",
        "",
        "final class RateLimitedChannel extends ChannelDecorator {",
        "    private final Duration minGap;",
        "    private Instant nextAllowedAt = Instant.EPOCH;",
        "",
        "    RateLimitedChannel(NotificationChannel delegate, Duration minGap) {",
        "        super(delegate);",
        "        this.minGap = Objects.requireNonNull(minGap, \"minGap\");",
        "    }",
        "",
        "    @Override",
        "    public synchronized void send(Notification notification, String message) {",
        "        Instant now = Instant.now();",
        "        if (now.isBefore(nextAllowedAt)) {",
        "            throw new RuntimeException(\"rate limit for \" + name());",
        "        }",
        "        nextAllowedAt = now.plus(minGap);",
        "        delegate().send(notification, message);",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "NotificationTemplate.java",
      language: "java",
      content: [
        "import java.util.Map;",
        "import java.util.Objects;",
        "",
        "public final class NotificationTemplate {",
        "    private final String name;",
        "    private final String body;",
        "",
        "    public NotificationTemplate(String name, String body) {",
        "        this.name = requireText(name, \"name\");",
        "        this.body = requireText(body, \"body\");",
        "    }",
        "",
        "    public static NotificationTemplate named(String name, String body) {",
        "        return new NotificationTemplate(name, body);",
        "    }",
        "",
        "    public String name() {",
        "        return name;",
        "    }",
        "",
        "    public String render(Map<String, String> values) {",
        "        String rendered = body;",
        "        for (Map.Entry<String, String> entry : Objects.requireNonNull(values, \"values\").entrySet()) {",
        "            rendered = rendered.replace(\"{{\" + entry.getKey() + \"}}\", entry.getValue());",
        "        }",
        "        return rendered;",
        "    }",
        "",
        "    private static String requireText(String value, String field) {",
        "        if (value == null || value.isBlank()) {",
        "            throw new IllegalArgumentException(field + \" is required\");",
        "        }",
        "        return value;",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "NotificationService.java",
      language: "java",
      content: [
        "import java.time.Duration;",
        "import java.util.ArrayList;",
        "import java.util.Collection;",
        "import java.util.LinkedHashMap;",
        "import java.util.LinkedHashSet;",
        "import java.util.List;",
        "import java.util.Map;",
        "import java.util.Objects;",
        "import java.util.Set;",
        "import java.util.function.Supplier;",
        "",
        "public final class NotificationService {",
        "    private final Map<String, NotificationTemplate> templates = new LinkedHashMap<>();",
        "    private final Map<String, Set<String>> preferences = new LinkedHashMap<>();",
        "    private final List<NotificationSubscriber> subscribers = new ArrayList<>();",
        "    private final RetryPolicy retryPolicy;",
        "",
        "    public NotificationService(RetryPolicy retryPolicy) {",
        "        this.retryPolicy = Objects.requireNonNull(retryPolicy, \"retryPolicy\");",
        "    }",
        "",
        "    public void registerTemplate(NotificationTemplate template) {",
        "        templates.put(template.name(), template);",
        "    }",
        "",
        "    public void setPreferences(String userId, Collection<String> channelNames) {",
        "        preferences.put(requireText(userId, \"userId\"), new LinkedHashSet<>(channelNames));",
        "    }",
        "",
        "    public void subscribe(NotificationSubscriber subscriber) {",
        "        subscribers.add(Objects.requireNonNull(subscriber, \"subscriber\"));",
        "    }",
        "",
        "    public void subscribeChannel(NotificationChannel channel) {",
        "        subscribe(new ChannelSubscriber(channel));",
        "    }",
        "",
        "    public void publish(Notification notification) {",
        "        Objects.requireNonNull(notification, \"notification\");",
        "        NotificationTemplate template = templates.get(notification.templateName());",
        "        if (template == null) {",
        "            throw new IllegalArgumentException(\"Unknown template: \" + notification.templateName());",
        "        }",
        "",
        "        String message = template.render(notification.data());",
        "        Set<String> targets = deliveryTargets(notification);",
        "        for (NotificationSubscriber subscriber : subscribers) {",
        "            if (targets.contains(subscriber.channelName())) {",
        "                subscriber.onNotification(notification, message, retryPolicy);",
        "            }",
        "        }",
        "    }",
        "",
        "    private Set<String> deliveryTargets(Notification notification) {",
        "        if (notification.hasExplicitChannels()) {",
        "            return notification.requestedChannels();",
        "        }",
        "        Set<String> preferred = preferences.get(notification.userId());",
        "        if (preferred != null) {",
        "            return preferred;",
        "        }",
        "        Set<String> all = new LinkedHashSet<>();",
        "        for (NotificationSubscriber subscriber : subscribers) {",
        "            all.add(subscriber.channelName());",
        "        }",
        "        return all;",
        "    }",
        "",
        "    private static String requireText(String value, String field) {",
        "        if (value == null || value.isBlank()) {",
        "            throw new IllegalArgumentException(field + \" is required\");",
        "        }",
        "        return value;",
        "    }",
        "}",
        "",
        "interface NotificationSubscriber {",
        "    String channelName();",
        "",
        "    void onNotification(Notification notification, String message, RetryPolicy retryPolicy);",
        "}",
        "",
        "final class ChannelSubscriber implements NotificationSubscriber {",
        "    private final NotificationChannel channel;",
        "",
        "    ChannelSubscriber(NotificationChannel channel) {",
        "        this.channel = Objects.requireNonNull(channel, \"channel\");",
        "    }",
        "",
        "    @Override",
        "    public String channelName() {",
        "        return channel.name();",
        "    }",
        "",
        "    @Override",
        "    public void onNotification(Notification notification, String message, RetryPolicy retryPolicy) {",
        "        retryPolicy.execute(channel.name(), () -> channel.send(notification, message));",
        "    }",
        "}",
        "",
        "final class RetryPolicy {",
        "    private final int maxAttempts;",
        "    private final Duration initialBackoff;",
        "",
        "    RetryPolicy(int maxAttempts, Duration initialBackoff) {",
        "        if (maxAttempts < 1) {",
        "            throw new IllegalArgumentException(\"maxAttempts must be positive\");",
        "        }",
        "        this.maxAttempts = maxAttempts;",
        "        this.initialBackoff = Objects.requireNonNull(initialBackoff, \"initialBackoff\");",
        "    }",
        "",
        "    public void execute(String channelName, Runnable operation) {",
        "        int attempt = 1;",
        "        Duration wait = initialBackoff;",
        "        while (true) {",
        "            try {",
        "                operation.run();",
        "                System.out.println(\"[delivery] \" + channelName + \" succeeded on attempt \" + attempt);",
        "                return;",
        "            } catch (RuntimeException ex) {",
        "                if (attempt >= maxAttempts) {",
        "                    throw new RuntimeException(\"Delivery failed for \" + channelName + \" after \" + attempt + \" attempts\", ex);",
        "                }",
        "                System.out.println(\"[retry] \" + channelName + \" attempt \" + attempt + \" failed: \" + ex.getMessage());",
        "                sleep(wait);",
        "                wait = wait.multipliedBy(2);",
        "                attempt++;",
        "            }",
        "        }",
        "    }",
        "",
        "    private void sleep(Duration wait) {",
        "        try {",
        "            Thread.sleep(Math.min(wait.toMillis(), 200));",
        "        } catch (InterruptedException ex) {",
        "            Thread.currentThread().interrupt();",
        "            throw new RuntimeException(\"Retry interrupted\", ex);",
        "        }",
        "    }",
        "}",
        "",
        "final class ChannelFactory {",
        "    private final Map<String, Supplier<NotificationChannel>> registry = new LinkedHashMap<>();",
        "",
        "    public void register(String name, Supplier<NotificationChannel> supplier) {",
        "        registry.put(requireText(name, \"name\"), Objects.requireNonNull(supplier, \"supplier\"));",
        "    }",
        "",
        "    public NotificationChannel create(String name) {",
        "        Supplier<NotificationChannel> supplier = registry.get(name);",
        "        if (supplier == null) {",
        "            throw new IllegalArgumentException(\"Unknown channel: \" + name);",
        "        }",
        "        return supplier.get();",
        "    }",
        "",
        "    public List<NotificationChannel> createAll() {",
        "        List<NotificationChannel> channels = new ArrayList<>();",
        "        for (String name : registry.keySet()) {",
        "            channels.add(create(name));",
        "        }",
        "        return channels;",
        "    }",
        "",
        "    public static ChannelFactory defaultFactory() {",
        "        ChannelFactory factory = new ChannelFactory();",
        "        factory.register(\"email\", EmailChannel::new);",
        "        factory.register(\"sms\", SmsChannel::new);",
        "        factory.register(\"push\", PushChannel::new);",
        "        return factory;",
        "    }",
        "",
        "    private static String requireText(String value, String field) {",
        "        if (value == null || value.isBlank()) {",
        "            throw new IllegalArgumentException(field + \" is required\");",
        "        }",
        "        return value;",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "Main.java",
      language: "java",
      content: [
        "import java.time.Duration;",
        "import java.util.List;",
        "import java.util.Map;",
        "",
        "public final class Main {",
        "    private Main() {",
        "    }",
        "",
        "    public static void main(String[] args) {",
        "        ChannelFactory factory = ChannelFactory.defaultFactory();",
        "        NotificationService service = new NotificationService(new RetryPolicy(3, Duration.ofMillis(50)));",
        "",
        "        service.registerTemplate(NotificationTemplate.named(",
        "                \"orderReady\",",
        "                \"Hi {{name}}, order {{orderId}} is ready.\"));",
        "",
        "        for (NotificationChannel channel : factory.createAll()) {",
        "            NotificationChannel guarded = new DedupingChannel(new RateLimitedChannel(channel, Duration.ZERO));",
        "            service.subscribeChannel(guarded);",
        "        }",
        "",
        "        service.setPreferences(\"user-7\", List.of(\"email\", \"push\"));",
        "        Notification notification = Notification.of(",
        "                \"user-7\",",
        "                \"orderReady\",",
        "                Map.of(\"name\", \"Asha\", \"orderId\", \"EIQ-42\"),",
        "                List.of());",
        "",
        "        service.publish(notification);",
        "        service.publish(notification);",
        "    }",
        "}",
      ].join("\n"),
    },
  ],

  classExplanations: [
    {
      className: "Notification",
      detailMD:
        "Immutable input to the dispatcher. It carries the user id, template name, dynamic values, and optional explicit channel names; empty requested channels delegates the choice to preferences.",
    },
    {
      className: "NotificationChannel",
      detailMD:
        "Strategy interface for delivery. Every concrete provider exposes **name** and **send**, keeping provider-specific behavior outside the dispatcher.",
    },
    {
      className: "EmailChannel / SmsChannel / PushChannel",
      detailMD:
        "Concrete channel strategies. The demo prints messages, but real classes would adapt SendGrid, Twilio, FCM, or another provider while keeping the same interface.",
    },
    {
      className: "ChannelDecorator / DedupingChannel / RateLimitedChannel",
      detailMD:
        "Decorator hierarchy. The base wrapper delegates **name** and exposes the wrapped channel; dedupe suppresses repeated keys, while rate limiting rejects sends that arrive too soon.",
    },
    {
      className: "NotificationTemplate",
      detailMD:
        "Template value object that replaces placeholders like **{{name}}** with supplied data. Rendering happens before channel fan-out so every channel receives the same message.",
    },
    {
      className: "NotificationService",
      detailMD:
        "Main facade and dispatcher. It registers templates, stores user preferences, subscribes observers, resolves delivery targets, and publishes matching notifications.",
    },
    {
      className: "NotificationSubscriber / ChannelSubscriber",
      detailMD:
        "Observer abstraction plus the standard adapter from a channel to an observer. **ChannelSubscriber** invokes retry policy around the channel's **send** method.",
    },
    {
      className: "RetryPolicy",
      detailMD:
        "Bounded exponential-backoff executor. It retries runtime failures, doubles the wait after each failure, and throws after the maximum attempt count.",
    },
    {
      className: "ChannelFactory",
      detailMD:
        "Registry-backed factory method implementation. It maps channel names to suppliers, creates all default channels, and lets future channels register without touching the service.",
    },
    {
      className: "Main",
      detailMD:
        "Demonstrates wiring: create the factory and service, register a template, decorate and subscribe channels, store preferences, and publish the same notification twice to show dedupe.",
    },
  ],

  dryRun: {
    inputMD:
      "User **user-7** prefers **email** and **push**. Template **orderReady** renders to **Hi Asha, order EIQ-42 is ready.** The app publishes the same notification twice with no explicit channel override.",
    columns: ["Step", "Dispatcher state", "Channels considered", "Retry or decorator behavior", "Outcome"],
    rows: [
      [
        "1",
        "First publish renders template and resolves preferences",
        "email, SMS, push",
        "Preference filter removes SMS",
        "Targets are email and push",
      ],
      [
        "2",
        "Email subscriber receives the event",
        "email",
        "RetryPolicy attempt 1 wraps DedupingChannel and RateLimitedChannel",
        "Email sends successfully",
      ],
      [
        "3",
        "Push subscriber receives the event",
        "push",
        "RetryPolicy attempt 1 wraps the same decorator chain",
        "Push sends successfully",
      ],
      [
        "4",
        "Second publish renders the same message",
        "email and push",
        "DedupingChannel finds the same user/template/channel/message key",
        "Both duplicate sends are skipped",
      ],
      [
        "5",
        "Later, WhatsAppChannel is registered and subscribed",
        "email, SMS, push, whatsapp",
        "No change to NotificationService.publish",
        "Future notifications can include whatsapp",
      ],
    ],
    narrativeMD:
      "The trace highlights the important boundaries: preferences narrow the target set before fan-out, retry is reusable, and decorators apply uniformly to each channel strategy.",
  },

  complexity: [
    {
      operation: "publish",
      time: "O(K × M + S)",
      space: "O(C)",
      note: "K template values, M message length, S subscribers, C resolved target channels.",
    },
    {
      operation: "setPreferences",
      time: "O(C)",
      space: "O(C)",
      note: "Copies the user's channel names into a set.",
    },
    {
      operation: "registerTemplate",
      time: "O(1)",
      space: "O(1)",
      note: "Hash-map insertion by template name.",
    },
    {
      operation: "retry one channel",
      time: "O(A)",
      space: "O(1)",
      note: "A is the bounded maximum attempt count; sleep time is operational latency, not CPU work.",
    },
  ],
  complexityNotesMD:
    "The in-memory implementation is intentionally simple. At scale, publish should enqueue one delivery job per target channel so provider latency and retry waits do not block the producer thread.",

  extensibility: [
    {
      label: "New channel",
      detailMD:
        "Implement **NotificationChannel**, register a supplier with **ChannelFactory**, and subscribe the created channel. The service loop still sees only **NotificationSubscriber**.",
    },
    {
      label: "New decorator",
      detailMD:
        "Create another **ChannelDecorator** such as audit logging, circuit breaking, consent enforcement, or payload redaction, then wrap channels during wiring.",
    },
    {
      label: "Persistent templates and preferences",
      detailMD:
        "Replace the maps in **NotificationService** with repositories. The publish algorithm remains the same: load template, load preferences, notify subscribers.",
    },
    {
      label: "Asynchronous delivery",
      detailMD:
        "Change **ChannelSubscriber** to enqueue a delivery job instead of calling **send** directly. Workers can reuse **NotificationChannel**, decorators, and **RetryPolicy**.",
    },
  ],

  alternativeDesigns: [
    {
      name: "Switch-based dispatcher",
      detailMD:
        "Put a switch on channel name inside **NotificationService.publish** and call email, SMS, or push directly.",
      tradeoffsMD:
        "Simple for three channels, but every new channel edits the hot dispatcher and mixes provider concerns with orchestration.",
    },
    {
      name: "Queue per channel",
      detailMD:
        "Publish one job per target channel to message queues, and let dedicated workers perform retries and provider calls.",
      tradeoffsMD:
        "Better isolation and throughput, but adds queue infrastructure, idempotency keys, delayed retries, and operational complexity.",
    },
    {
      name: "Rules engine for preferences",
      detailMD:
        "Evaluate channel eligibility through a policy engine using user consent, country, event type, quiet hours, and product rules.",
      tradeoffsMD:
        "Powerful for regulated products, but overkill for a core LLD unless the interviewer asks for advanced preference rules.",
    },
  ],

  commonMistakes: [
    "Hard-coding **if channel == email** logic inside the dispatcher, which violates the open-closed goal.",
    "Letting channels render templates, causing email, SMS, and push to duplicate placeholder logic.",
    "Ignoring user preferences when a producer explicitly requests many channels.",
    "Retrying forever or retrying non-transient failures without a maximum attempt budget.",
    "Copying rate-limit or dedupe logic into every concrete channel instead of using decorators.",
    "Throwing away delivery results and metrics, making provider failures impossible to debug.",
    "Using provider SDK classes as method parameters in the domain model, leaking infrastructure into the core design.",
  ],

  followUps: [
    {
      question: "How do you add WhatsApp without touching existing dispatcher code?",
      answerMD:
        "Create **WhatsAppChannel implements NotificationChannel**, register it in **ChannelFactory**, wrap it with any decorators, and subscribe it. **NotificationService.publish** remains unchanged.",
    },
    {
      question: "How would you make delivery asynchronous?",
      answerMD:
        "Keep **NotificationService** as the target resolver, but have each subscriber enqueue a delivery job to a channel queue. Workers own provider calls, retry delays, dead-letter handling, and metrics.",
    },
    {
      question: "How do you prevent duplicate messages during retries?",
      answerMD:
        "Generate an idempotency key from notification id, user id, template, channel, and rendered payload. Store it in a durable dedupe table or provider idempotency header before sending.",
    },
    {
      question: "Where do quiet hours or consent rules belong?",
      answerMD:
        "In preference resolution or a policy layer before fan-out. Channels should not decide whether a user consented; they should only deliver approved messages.",
    },
    {
      question: "What changes if templates are localized?",
      answerMD:
        "Template lookup becomes keyed by template name plus locale, and rendering may use a richer engine. The service still renders before fan-out and channels stay unchanged.",
    },
  ],

  productionConsiderations: [
    {
      label: "Durable outbox",
      detailMD:
        "Use an outbox table or event log so business transactions and notification publishing cannot get out of sync when a process crashes.",
    },
    {
      label: "Provider isolation",
      detailMD:
        "Run email, SMS, and push workers independently with per-provider rate limits, circuit breakers, credentials, and dashboards.",
    },
    {
      label: "Consent and compliance",
      detailMD:
        "Track opt-ins, unsubscribe state, country restrictions, quiet hours, and audit trails. Preference checks must happen before any provider call.",
    },
    {
      label: "Idempotency and dedupe",
      detailMD:
        "Persist idempotency keys with status so retries, worker restarts, and duplicate events do not spam users.",
    },
    {
      label: "Observability and dead letters",
      detailMD:
        "Emit metrics and structured logs per attempt. After retries are exhausted, move the job to a dead-letter queue with enough context to replay safely.",
    },
  ],

  interviewNotes: [
    "Does the candidate keep channel addition additive through **NotificationChannel** and factory registration?",
    "Do templates and preferences live outside channel implementations?",
    "Is pub-sub fan-out modeled explicitly with an observer/subscriber boundary?",
    "Are retries bounded, observable, and separated from provider code?",
    "Can decorators be composed around any channel without changing concrete channels?",
  ],

  quiz: [
    {
      question: "Which pattern lets email, SMS, and push vary behind the same **send** operation?",
      options: ["Observer", "Strategy", "Composite", "Memento"],
      answerIndex: 1,
      explanationMD:
        "**NotificationChannel** is the Strategy interface; each concrete channel provides a different delivery algorithm.",
    },
    {
      question: "Why does **NotificationService** store **NotificationSubscriber** objects?",
      options: [
        "To implement pub-sub fan-out using Observer",
        "To make templates immutable",
        "To avoid storing user preferences",
        "To force every channel to retry forever",
      ],
      answerIndex: 0,
      explanationMD:
        "Subscribers are observers. The service publishes a notification and each matching subscriber reacts independently.",
    },
    {
      question: "What is the best way to add a rate limit to every channel?",
      options: [
        "Copy rate-limit checks into EmailChannel, SmsChannel, and PushChannel",
        "Add a boolean flag to Notification",
        "Wrap each channel in **RateLimitedChannel** before subscribing",
        "Put a sleep call inside template rendering",
      ],
      answerIndex: 2,
      explanationMD:
        "The Decorator pattern adds cross-cutting behavior around any **NotificationChannel** without editing concrete channels.",
    },
    {
      question: "Why should templates be rendered before channel delivery?",
      options: [
        "So each channel can own user preference storage",
        "So rendering is centralized and channels only deliver final messages",
        "So retries become unnecessary",
        "So the factory can skip channel creation",
      ],
      answerIndex: 1,
      explanationMD:
        "Central rendering avoids duplicating placeholder logic across every channel and keeps provider classes focused on delivery.",
    },
    {
      question: "What should happen when retry attempts are exhausted?",
      options: [
        "Retry forever until the user receives the message",
        "Silently ignore the failure",
        "Surface the failure and, in production, move the job to a dead-letter path",
        "Delete the user's preferences",
      ],
      answerIndex: 2,
      explanationMD:
        "Retries must be bounded. Production systems preserve the failed job for investigation or controlled replay.",
    },
  ],

  practiceVariants: [
    {
      title: "Add WhatsAppChannel",
      detailMD:
        "Implement a new **NotificationChannel**, register it with **ChannelFactory**, add it to a user's preferences, and verify the dispatcher code remains unchanged.",
      difficulty: "Beginner",
    },
    {
      title: "Add quiet hours",
      detailMD:
        "Introduce a preference policy that suppresses non-urgent channels during a user's quiet-hours window while allowing critical alerts.",
      difficulty: "Intermediate",
    },
    {
      title: "Move delivery to queues",
      detailMD:
        "Have each subscriber enqueue a delivery job and build a worker that applies decorators, retry, dead-letter handling, and idempotency.",
      difficulty: "Advanced",
    },
  ],

  flashcards: [
    {
      front: "What is the Strategy in this design?",
      back: "**NotificationChannel**; email, SMS, push, and future channels implement the same **send** contract.",
    },
    {
      front: "What is the Observer boundary?",
      back: "**NotificationService.publish** notifies subscribed **NotificationSubscriber** observers that match the resolved target channels.",
    },
    {
      front: "How is a new channel added?",
      back: "Implement **NotificationChannel**, register a supplier in **ChannelFactory**, decorate if needed, and subscribe it.",
    },
    {
      front: "Why use decorators for dedupe and rate limiting?",
      back: "They apply cross-cutting delivery behavior around any channel without modifying concrete channel classes.",
    },
    {
      front: "Where should user preferences be enforced?",
      back: "Before fan-out in **NotificationService** or a dedicated policy layer, not inside provider-specific channels.",
    },
    {
      front: "What is the production upgrade for synchronous publish?",
      back: "Enqueue one delivery job per target channel and let workers handle provider calls, retries, and dead letters.",
    },
  ],

  cheatSheetMD: [
    "**Entities:** Notification, NotificationTemplate, NotificationService, NotificationSubscriber, NotificationChannel, ChannelFactory, RetryPolicy, ChannelDecorator.",
    "",
    "**Patterns:** Observer for pub-sub fan-out, Strategy for channels, Factory Method for channel creation, Decorator for dedupe and rate limiting.",
    "",
    "**Flow:** producer publishes Notification → service renders template → resolves explicit channels or user preferences → notifies matching subscribers → subscriber invokes retry → channel sends.",
    "",
    "**Open-closed seam:** new channel = implement **NotificationChannel** + register supplier + subscribe. Do not edit **NotificationService.publish**.",
    "",
    "**Reliability:** retries are bounded; production should add durable outbox, idempotency keys, queue workers, metrics, and dead-letter handling.",
    "",
    "**Common smell:** switch statements in the dispatcher for channel type, duplicated template rendering in channels, or unbounded retry loops.",
  ].join("\n"),

  references: [
    {
      title: "Head First Design Patterns",
      kind: "Book",
      author: "Freeman & Robson",
    },
    {
      title: "Enterprise Integration Patterns",
      kind: "Book",
      author: "Gregor Hohpe and Bobby Woolf",
    },
    {
      title: "Refactoring Guru — Observer Pattern",
      kind: "Docs",
      url: "https://refactoring.guru/design-patterns/observer",
    },
    {
      title: "Refactoring Guru — Decorator Pattern",
      kind: "Docs",
      url: "https://refactoring.guru/design-patterns/decorator",
    },
  ],

  relatedProblems: [
    { slug: "logging-framework", note: "Uses fan-out and decorators for cross-cutting output behavior." },
    { slug: "message-queue", note: "Natural production extension for asynchronous notification delivery." },
    { slug: "rate-limiter", note: "Applies directly as a decorator or provider-level delivery guard." },
  ],
};
