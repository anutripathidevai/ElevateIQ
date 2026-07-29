import type { LLDProblemContent } from "../types";

export const messageQueue: LLDProblemContent = {
  slug: "message-queue",

  statementMD: [
    "Design an **in-memory message queue / pub-sub broker** where producers publish",
    "messages to named topics and subscribers consume each topic independently.",
    "Every subscriber tracks its own offset, so one slow consumer never moves or",
    "blocks another consumer's progress.",
    "",
    "The design must support publish, subscribe, per-subscriber acknowledgement,",
    "redelivery of unacknowledged messages, and safe concurrent access from many",
    "producer and subscriber threads. The core learning goal is the Observer-style",
    "fan-out model plus offset tracking per subscriber.",
  ].join("\n"),

  businessContextMD: [
    "Message queues and pub-sub brokers sit between services that produce events",
    "and services that react to them: order created, payment captured, email sent,",
    "index document, refresh cache. They decouple availability and throughput, but",
    "they also introduce delivery semantics that a candidate must state clearly.",
    "",
    "For LLD interviews, this problem tests whether you can model a topic log,",
    "consumer offsets, acknowledgement, duplicate-safe at-least-once delivery, and",
    "thread-safety without jumping straight to a distributed Kafka clone.",
  ].join("\n"),

  functionalRequirements: [
    "Create or reuse named topics on demand.",
    "Allow producers to publish payloads to a topic and receive the assigned message offset.",
    "Allow many subscribers to subscribe to the same topic.",
    "Fan out every topic message to every subscriber registered on that topic.",
    "Track an independent next offset for each subscriber, per topic.",
    "Advance a subscriber's offset only when that subscriber acknowledges the message.",
    "Redeliver an unacknowledged message to the same subscriber without losing ordering.",
    "Make publish, subscribe, acknowledgement, offset inspection, and redelivery safe under concurrent access.",
  ],

  nonFunctionalRequirements: [
    {
      label: "Thread-safe correctness",
      detailMD:
        "The topic log, subscriber map, in-flight flag, and offsets are shared mutable state. Mutations must be protected so two publishers cannot assign the same offset and two acknowledgements cannot corrupt progress.",
    },
    {
      label: "Per-subscriber ordering",
      detailMD:
        "A subscriber should observe messages in topic offset order. If offset 5 is unacknowledged, offset 6 waits for that subscriber even if other subscribers move ahead.",
    },
    {
      label: "At-least-once delivery",
      detailMD:
        "The broker may deliver a message more than once, but it must not mark the message consumed for a subscriber until the subscriber explicitly acknowledges it.",
    },
    {
      label: "In-memory simplicity",
      detailMD:
        "The base design stores topic logs and offsets in process memory. Durability, replay after restart, and cross-node replication are production extensions.",
    },
    {
      label: "Extensible retry policy",
      detailMD:
        "Delivery and redelivery decisions should sit behind a strategy so fixed retry, backoff, and dead-letter behavior can be added without rewriting topic state management.",
    },
  ],

  requirementClarification: [
    {
      question: "Is this a work queue where one consumer gets a message, or pub-sub where every subscriber gets it?",
      answerMD:
        "Use pub-sub for the base problem: every subscriber registered to a topic should receive every message, each at its own offset.",
    },
    {
      question: "Do we need durable storage or recovery after process restart?",
      answerMD:
        "No. Keep the implementation in memory. We still design clean seams where a durable append-only log and offset repository could replace the in-memory collections.",
    },
    {
      question: "What does acknowledgement mean?",
      answerMD:
        "Acknowledgement is subscriber-specific. When subscriber **billing** acknowledges offset 10, only billing's next offset advances to 11; other subscribers are unaffected.",
    },
    {
      question: "Can duplicates happen?",
      answerMD:
        "Yes. At-least-once delivery means a subscriber may see the same message again if it processed the message but crashed before acknowledging. Consumers should be idempotent.",
    },
    {
      question: "Should delivery be synchronous or asynchronous?",
      answerMD:
        "The reference implementation invokes subscriber callbacks synchronously to keep the LLD focused. A production broker would place delivery work on executors and use timers for retry.",
    },
  ],

  classDiagramMermaid: [
    "classDiagram",
    "    class Broker {",
    "        -Broker INSTANCE",
    "        -ConcurrentMap~String,Topic~ topics",
    "        -DeliveryStrategy deliveryStrategy",
    "        +getInstance() Broker",
    "        +publish(String,String) Message",
    "        +subscribe(String,Subscriber) void",
    "        +redeliverUnacked(String) void",
    "        +offsets(String) Map",
    "    }",
    "    class Topic {",
    "        -String name",
    "        -List~Message~ messages",
    "        -Map~String,Subscription~ subscriptions",
    "        -DeliveryStrategy deliveryStrategy",
    "        +publish(String) Message",
    "        +subscribe(Subscriber) void",
    "        +redeliverUnacked() void",
    "        +offsets() Map",
    "    }",
    "    class Message {",
    "        -long offset",
    "        -String payload",
    "        -Instant publishedAt",
    "        +offset() long",
    "        +payload() String",
    "    }",
    "    class Subscriber {",
    "        <<interface>>",
    "        +id() String",
    "        +onMessage(String,Message,Runnable) void",
    "    }",
    "    class DeliveryStrategy {",
    "        <<interface>>",
    "        +shouldDeliver(String,Message,int) boolean",
    "        +atLeastOnce() DeliveryStrategy",
    "    }",
    "    class Producer {",
    "        -Broker broker",
    "        +publish(String,String) Message",
    "    }",
    "    class Subscription {",
    "        -String subscriberId",
    "        -Subscriber subscriber",
    "        -long nextOffset",
    "        -boolean inFlight",
    "        -Map~Long,Integer~ attempts",
    "    }",
    "    class Main {",
    "        +main(String[]) void",
    "    }",
    "    Broker --> Topic",
    "    Broker ..> DeliveryStrategy",
    "    Topic o-- Message",
    "    Topic o-- Subscription",
    "    Topic ..> DeliveryStrategy",
    "    Subscription --> Subscriber",
    "    Producer --> Broker",
    "    Main ..> Producer",
    "    Main ..> Subscriber",
  ].join("\n"),
  classDiagramCaptionMD:
    "The broker owns topic lookup; each topic owns its append-only in-memory log and per-subscriber offset state. Subscriber callbacks are observers of a topic, while acknowledgement advances only that observer's cursor.",

  sequenceDiagramMermaid: [
    "sequenceDiagram",
    "    actor ProducerClient",
    "    participant Producer",
    "    participant Broker",
    "    participant Topic",
    "    participant Sub as Subscriber",
    "    ProducerClient->>Producer: publish(topic, payload)",
    "    Producer->>Broker: publish(topic, payload)",
    "    Broker->>Topic: publish(payload)",
    "    Topic->>Topic: append Message at next offset",
    "    Topic->>Sub: onMessage(topic, message, ack)",
    "    alt subscriber acknowledges",
    "        Sub->>Topic: ack offset",
    "        Topic->>Topic: nextOffset = offset plus one",
    "    else subscriber fails before acknowledgement",
    "        Topic->>Topic: keep nextOffset unchanged",
    "        Broker->>Topic: redeliverUnacked(topic)",
    "        Topic->>Sub: onMessage(same offset, ack)",
    "    end",
  ].join("\n"),
  sequenceDiagramCaptionMD:
    "Publish appends once to the topic log, then the topic notifies subscribers. The acknowledgement callback is the only path that advances a subscriber's offset.",

  entities: [
    {
      name: "Broker",
      responsibilityMD:
        "Singleton facade and topic registry. It exposes publish, subscribe, redelivery, and offset inspection while delegating topic-level state to **Topic** objects.",
      attributes: ["INSTANCE", "topics", "deliveryStrategy"],
    },
    {
      name: "Topic",
      responsibilityMD:
        "Owns the ordered message log for one topic and all subscriptions on that topic. It assigns offsets, snapshots deliveries, records in-flight messages, and applies acknowledgements.",
      attributes: ["name", "messages", "subscriptions", "deliveryStrategy"],
    },
    {
      name: "Message",
      responsibilityMD:
        "Immutable event stored in a topic log. The offset is assigned by the topic and becomes the ordering and acknowledgement handle for subscribers.",
      attributes: ["offset", "payload", "publishedAt"],
    },
    {
      name: "Subscriber",
      responsibilityMD:
        "Observer callback interface. A subscriber receives a topic name, a message, and an acknowledgement function it must call only after successful processing.",
      attributes: ["id", "onMessage"],
    },
    {
      name: "Subscription",
      responsibilityMD:
        "Topic-owned per-subscriber state: subscriber identity, next offset to deliver, whether that offset is in flight, and delivery attempts for redelivery policy.",
      attributes: ["subscriberId", "nextOffset", "inFlight", "attempts"],
    },
    {
      name: "DeliveryStrategy",
      responsibilityMD:
        "Policy seam for whether a delivery attempt should happen. The default always allows redelivery for at-least-once behavior; later strategies can add backoff or dead letters.",
      attributes: ["shouldDeliver"],
    },
    {
      name: "Producer",
      responsibilityMD:
        "Small client wrapper that publishes payloads through the broker. It keeps producer code independent from topic lookup and fan-out details.",
      attributes: ["broker"],
    },
  ],

  patternsUsed: [
    {
      name: "Observer",
      whyMD:
        "Subscribers register interest in a topic and are notified when the topic has a message for their offset. The topic is the subject; each **Subscriber** is an observer with its own cursor and acknowledgement callback.",
    },
    {
      name: "Producer-Consumer",
      whyMD:
        "Producers append work to topics while subscribers consume it later through callbacks. The broker decouples production from consumption and supports slow consumers through independent offsets.",
    },
    {
      name: "Singleton",
      whyMD:
        "**Broker.getInstance** provides one in-memory topic registry for the process. In real systems this would usually be dependency-injected, but Singleton is useful here to make the shared broker boundary explicit.",
    },
    {
      name: "Strategy",
      whyMD:
        "**DeliveryStrategy** isolates the redelivery decision from topic bookkeeping. Retry limits, exponential backoff, and dead-letter routing become new strategy implementations rather than edits to **Topic**.",
    },
  ],

  designSteps: [
    {
      title: "Represent a topic as an ordered log",
      detailMD:
        "Publishing appends an immutable **Message** to a topic. The array index becomes the message offset, and subscribers acknowledge that offset when processing succeeds.",
      code: [
        "public final class Message {",
        "    private final long offset;",
        "    private final String payload;",
        "",
        "    Message(long offset, String payload) {",
        "        this.offset = offset;",
        "        this.payload = payload;",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      title: "Track offsets per subscriber, not per topic",
      detailMD:
        "A pub-sub broker cannot keep one global consumed offset. Each subscriber needs a **Subscription** record with its own next offset, in-flight flag, and attempt counts.",
      code: [
        "private static final class Subscription {",
        "    final String subscriberId;",
        "    final Subscriber subscriber;",
        "    long nextOffset;",
        "    boolean inFlight;",
        "    final Map<Long, Integer> attempts = new HashMap<>();",
        "}",
      ].join("\n"),
    },
    {
      title: "Advance only after acknowledgement",
      detailMD:
        "Delivery passes a callback to the subscriber. The callback is idempotent for old offsets and advances only when the acknowledged offset equals that subscriber's current next offset.",
      code: [
        "private void acknowledge(String subscriberId, long offset) {",
        "    Subscription subscription = subscriptions.get(subscriberId);",
        "    if (subscription != null && subscription.nextOffset == offset) {",
        "        subscription.nextOffset++;",
        "        subscription.inFlight = false;",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      title: "Guard shared state inside Topic",
      detailMD:
        "**Topic** protects the message list and subscription map with synchronized blocks. It snapshots delivery work under the lock, then invokes subscriber callbacks outside the lock so user code cannot freeze the broker.",
    },
    {
      title: "Use a thread-safe singleton broker registry",
      detailMD:
        "**Broker** keeps topics in a **ConcurrentHashMap** and creates missing topics atomically with **computeIfAbsent**. Topic-level correctness remains inside each **Topic**.",
      code: [
        "private Topic topic(String topicName) {",
        "    return topics.computeIfAbsent(",
        "        topicName,",
        "        name -> new Topic(name, deliveryStrategy)",
        "    );",
        "}",
      ].join("\n"),
    },
    {
      title: "Make redelivery policy pluggable",
      detailMD:
        "The default strategy always permits another attempt, which gives at-least-once delivery. Production strategies can add maximum attempts, delay, jitter, or dead-letter routing.",
    },
  ],

  implementation: [
    {
      filename: "Message.java",
      language: "java",
      content: [
        "import java.time.Instant;",
        "import java.util.Objects;",
        "",
        "public final class Message {",
        "    private final long offset;",
        "    private final String payload;",
        "    private final Instant publishedAt;",
        "",
        "    Message(long offset, String payload) {",
        "        if (offset < 0) {",
        "            throw new IllegalArgumentException(\"offset must be non-negative\");",
        "        }",
        "        this.offset = offset;",
        "        this.payload = Objects.requireNonNull(payload, \"payload\");",
        "        this.publishedAt = Instant.now();",
        "    }",
        "",
        "    public long offset() {",
        "        return offset;",
        "    }",
        "",
        "    public String payload() {",
        "        return payload;",
        "    }",
        "",
        "    public Instant publishedAt() {",
        "        return publishedAt;",
        "    }",
        "",
        "    @Override",
        "    public String toString() {",
        "        return \"Message{offset=\" + offset + \", payload='\" + payload + \"'}\";",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "Subscriber.java",
      language: "java",
      content: [
        "public interface Subscriber {",
        "    String id();",
        "",
        "    void onMessage(String topicName, Message message, Runnable ack);",
        "}",
      ].join("\n"),
    },
    {
      filename: "DeliveryStrategy.java",
      language: "java",
      content: [
        "public interface DeliveryStrategy {",
        "    boolean shouldDeliver(String subscriberId, Message message, int deliveryAttempt);",
        "",
        "    static DeliveryStrategy atLeastOnce() {",
        "        return new AlwaysRedeliverStrategy();",
        "    }",
        "}",
        "",
        "final class AlwaysRedeliverStrategy implements DeliveryStrategy {",
        "    @Override",
        "    public boolean shouldDeliver(String subscriberId, Message message, int deliveryAttempt) {",
        "        return true;",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "Topic.java",
      language: "java",
      content: [
        "import java.util.ArrayList;",
        "import java.util.HashMap;",
        "import java.util.LinkedHashMap;",
        "import java.util.List;",
        "import java.util.Map;",
        "import java.util.Objects;",
        "",
        "final class Topic {",
        "    private final String name;",
        "    private final List<Message> messages = new ArrayList<>();",
        "    private final Map<String, Subscription> subscriptions = new LinkedHashMap<>();",
        "    private final DeliveryStrategy deliveryStrategy;",
        "",
        "    Topic(String name, DeliveryStrategy deliveryStrategy) {",
        "        this.name = Objects.requireNonNull(name, \"name\");",
        "        this.deliveryStrategy = Objects.requireNonNull(deliveryStrategy, \"deliveryStrategy\");",
        "    }",
        "",
        "    Message publish(String payload) {",
        "        Message message;",
        "        synchronized (this) {",
        "            message = new Message(messages.size(), payload);",
        "            messages.add(message);",
        "        }",
        "        deliverAvailable();",
        "        return message;",
        "    }",
        "",
        "    void subscribe(Subscriber subscriber) {",
        "        Objects.requireNonNull(subscriber, \"subscriber\");",
        "        String subscriberId = Objects.requireNonNull(subscriber.id(), \"subscriber id\");",
        "        synchronized (this) {",
        "            subscriptions.putIfAbsent(subscriberId, new Subscription(subscriberId, subscriber));",
        "        }",
        "        deliverAvailable();",
        "    }",
        "",
        "    void redeliverUnacked() {",
        "        deliver(collectDeliveries(true));",
        "    }",
        "",
        "    synchronized Map<String, Long> offsets() {",
        "        Map<String, Long> snapshot = new LinkedHashMap<>();",
        "        for (Subscription subscription : subscriptions.values()) {",
        "            snapshot.put(subscription.subscriberId, subscription.nextOffset);",
        "        }",
        "        return snapshot;",
        "    }",
        "",
        "    private void deliverAvailable() {",
        "        deliver(collectDeliveries(false));",
        "    }",
        "",
        "    private List<Delivery> collectDeliveries(boolean redeliveryOnly) {",
        "        List<Delivery> deliveries = new ArrayList<>();",
        "        synchronized (this) {",
        "            for (Subscription subscription : subscriptions.values()) {",
        "                if (subscription.nextOffset >= messages.size()) {",
        "                    continue;",
        "                }",
        "                if (redeliveryOnly != subscription.inFlight) {",
        "                    continue;",
        "                }",
        "",
        "                Message message = messages.get((int) subscription.nextOffset);",
        "                int attempt = subscription.attempts.getOrDefault(message.offset(), 0) + 1;",
        "                if (!deliveryStrategy.shouldDeliver(subscription.subscriberId, message, attempt)) {",
        "                    continue;",
        "                }",
        "",
        "                subscription.inFlight = true;",
        "                subscription.attempts.put(message.offset(), attempt);",
        "                deliveries.add(new Delivery(",
        "                    name,",
        "                    subscription.subscriber,",
        "                    message,",
        "                    () -> acknowledge(subscription.subscriberId, message.offset())",
        "                ));",
        "            }",
        "        }",
        "        return deliveries;",
        "    }",
        "",
        "    private void deliver(List<Delivery> deliveries) {",
        "        for (Delivery delivery : deliveries) {",
        "            delivery.send();",
        "        }",
        "    }",
        "",
        "    private void acknowledge(String subscriberId, long offset) {",
        "        boolean advanced = false;",
        "        synchronized (this) {",
        "            Subscription subscription = subscriptions.get(subscriberId);",
        "            if (subscription != null && subscription.nextOffset == offset) {",
        "                subscription.nextOffset++;",
        "                subscription.inFlight = false;",
        "                subscription.attempts.remove(offset);",
        "                advanced = true;",
        "            }",
        "        }",
        "        if (advanced) {",
        "            deliverAvailable();",
        "        }",
        "    }",
        "",
        "    private static final class Subscription {",
        "        final String subscriberId;",
        "        final Subscriber subscriber;",
        "        long nextOffset;",
        "        boolean inFlight;",
        "        final Map<Long, Integer> attempts = new HashMap<>();",
        "",
        "        Subscription(String subscriberId, Subscriber subscriber) {",
        "            this.subscriberId = subscriberId;",
        "            this.subscriber = subscriber;",
        "        }",
        "    }",
        "",
        "    private static final class Delivery {",
        "        private final String topicName;",
        "        private final Subscriber subscriber;",
        "        private final Message message;",
        "        private final Runnable ack;",
        "",
        "        Delivery(String topicName, Subscriber subscriber, Message message, Runnable ack) {",
        "            this.topicName = topicName;",
        "            this.subscriber = subscriber;",
        "            this.message = message;",
        "            this.ack = ack;",
        "        }",
        "",
        "        void send() {",
        "            try {",
        "                subscriber.onMessage(topicName, message, ack);",
        "            } catch (RuntimeException ex) {",
        "                System.err.println(\"subscriber \" + subscriber.id() + \" failed at offset \" + message.offset() + \": \" + ex.getMessage());",
        "            }",
        "        }",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "Broker.java",
      language: "java",
      content: [
        "import java.util.Map;",
        "import java.util.Objects;",
        "import java.util.concurrent.ConcurrentHashMap;",
        "import java.util.concurrent.ConcurrentMap;",
        "",
        "public final class Broker {",
        "    private static final Broker INSTANCE = new Broker(DeliveryStrategy.atLeastOnce());",
        "",
        "    private final ConcurrentMap<String, Topic> topics = new ConcurrentHashMap<>();",
        "    private final DeliveryStrategy deliveryStrategy;",
        "",
        "    private Broker(DeliveryStrategy deliveryStrategy) {",
        "        this.deliveryStrategy = Objects.requireNonNull(deliveryStrategy, \"deliveryStrategy\");",
        "    }",
        "",
        "    public static Broker getInstance() {",
        "        return INSTANCE;",
        "    }",
        "",
        "    public void createTopic(String topicName) {",
        "        topic(topicName);",
        "    }",
        "",
        "    public Message publish(String topicName, String payload) {",
        "        return topic(topicName).publish(payload);",
        "    }",
        "",
        "    public void subscribe(String topicName, Subscriber subscriber) {",
        "        topic(topicName).subscribe(subscriber);",
        "    }",
        "",
        "    public void redeliverUnacked(String topicName) {",
        "        topic(topicName).redeliverUnacked();",
        "    }",
        "",
        "    public Map<String, Long> offsets(String topicName) {",
        "        return topic(topicName).offsets();",
        "    }",
        "",
        "    private Topic topic(String topicName) {",
        "        Objects.requireNonNull(topicName, \"topicName\");",
        "        return topics.computeIfAbsent(topicName, name -> new Topic(name, deliveryStrategy));",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "Producer.java",
      language: "java",
      content: [
        "import java.util.Objects;",
        "",
        "public final class Producer {",
        "    private final Broker broker;",
        "",
        "    public Producer(Broker broker) {",
        "        this.broker = Objects.requireNonNull(broker, \"broker\");",
        "    }",
        "",
        "    public Message publish(String topicName, String payload) {",
        "        return broker.publish(topicName, payload);",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "Main.java",
      language: "java",
      content: [
        "public final class Main {",
        "    public static void main(String[] args) {",
        "        Broker broker = Broker.getInstance();",
        "        Producer producer = new Producer(broker);",
        "",
        "        Subscriber audit = new Subscriber() {",
        "            @Override",
        "            public String id() {",
        "                return \"audit\";",
        "            }",
        "",
        "            @Override",
        "            public void onMessage(String topicName, Message message, Runnable ack) {",
        "                System.out.println(\"audit received offset \" + message.offset() + \" from \" + topicName);",
        "                ack.run();",
        "            }",
        "        };",
        "",
        "        Subscriber billing = new Subscriber() {",
        "            private int attempts;",
        "",
        "            @Override",
        "            public String id() {",
        "                return \"billing\";",
        "            }",
        "",
        "            @Override",
        "            public void onMessage(String topicName, Message message, Runnable ack) {",
        "                attempts++;",
        "                System.out.println(\"billing attempt \" + attempts + \" for offset \" + message.offset());",
        "                if (attempts > 1) {",
        "                    ack.run();",
        "                }",
        "            }",
        "        };",
        "",
        "        broker.subscribe(\"orders\", audit);",
        "        broker.subscribe(\"orders\", billing);",
        "",
        "        producer.publish(\"orders\", \"order-100-created\");",
        "        broker.redeliverUnacked(\"orders\");",
        "        producer.publish(\"orders\", \"order-101-created\");",
        "",
        "        System.out.println(\"Offsets: \" + broker.offsets(\"orders\"));",
        "    }",
        "}",
      ].join("\n"),
    },
  ],

  classExplanations: [
    {
      className: "Message",
      detailMD:
        "Immutable value object for one log entry. **Topic** assigns the offset, records the payload, and timestamps publication so subscribers can reason about order and age.",
    },
    {
      className: "Subscriber",
      detailMD:
        "Observer interface. Implementations return a stable id and process messages through **onMessage**. They call the supplied acknowledgement function only after successful work.",
    },
    {
      className: "DeliveryStrategy",
      detailMD:
        "Strategy interface for delivery attempts. The bundled **AlwaysRedeliverStrategy** returns true for every attempt, which implements at-least-once semantics for the in-memory broker.",
    },
    {
      className: "Topic",
      detailMD:
        "Core aggregate. It stores the ordered message list, per-subscriber **Subscription** state, and delivery attempt counts. It synchronizes shared state, snapshots deliveries, and invokes callbacks outside the lock.",
    },
    {
      className: "Broker",
      detailMD:
        "Singleton facade over a thread-safe topic registry. It creates topics atomically and routes publish, subscribe, redelivery, and offset inspection calls to the right **Topic**.",
    },
    {
      className: "Producer",
      detailMD:
        "Client-side helper that depends only on **Broker**. It keeps producer code small and makes the producer role explicit in the Producer-Consumer pattern.",
    },
    {
      className: "Main",
      detailMD:
        "Demonstrates two subscribers on the same topic. **audit** acknowledges immediately; **billing** skips its first acknowledgement, then receives the same offset again during redelivery.",
    },
  ],

  dryRun: {
    inputMD:
      "Topic **orders** with subscribers **audit** and **billing**. **audit** acknowledges immediately. **billing** fails before acknowledging the first delivery, then succeeds on redelivery.",
    columns: ["Step", "Action", "audit next offset", "billing next offset", "Result"],
    rows: [
      ["1", "subscribe audit and billing", "0", "0", "Both subscribers start at offset 0."],
      ["2", "publish M0", "1", "0", "audit acks M0; billing receives M0 but does not ack."],
      ["3", "redeliver unacked", "1", "1", "billing receives M0 again and acknowledges it."],
      ["4", "publish M1", "2", "2", "Both subscribers receive and ack the next message."],
      ["5", "inspect offsets", "2", "2", "Offsets show each subscriber's next message to read."],
    ],
    narrativeMD:
      "The key observation is that **audit** and **billing** move independently. **billing** stays at offset 0 until its own acknowledgement, so the broker safely redelivers M0 without rewinding **audit**.",
  },

  complexity: [
    {
      operation: "publish",
      time: "O(S)",
      space: "O(1) plus message storage",
      note: "Appending is O(1); collecting immediate deliveries scans S subscribers for the topic.",
    },
    {
      operation: "subscribe",
      time: "O(S) after registration",
      space: "O(1)",
      note: "Registration is O(1) average; the implementation then scans subscribers to deliver any available message.",
    },
    {
      operation: "acknowledge",
      time: "O(S)",
      space: "O(1)",
      note: "Updating one subscriber is O(1); triggering the next delivery scans subscribers in this simple design.",
    },
    {
      operation: "redeliverUnacked",
      time: "O(S)",
      space: "O(S)",
      note: "The topic scans subscribers and builds a delivery snapshot for those with in-flight messages.",
    },
    {
      operation: "offsets",
      time: "O(S)",
      space: "O(S)",
      note: "Returns a snapshot of each subscriber's next offset.",
    },
  ],
  complexityNotesMD:
    "S is the number of subscribers on a topic. Message storage is O(M) per topic, where M is the number of retained messages. A production broker would add retention windows, partitioning, async dispatch queues, and more granular locks.",

  extensibility: [
    {
      label: "Durable topic log",
      detailMD:
        "Replace the in-memory **messages** list with an append-only file, database table, or replicated log. Offsets can be restored from a **SubscriptionRepository** on restart.",
    },
    {
      label: "Consumer groups",
      detailMD:
        "Add a group id to **Subscription** and assign each message partition to one member of a group while still fanning out across different groups.",
    },
    {
      label: "Retry and dead-letter policy",
      detailMD:
        "Implement new **DeliveryStrategy** classes for maximum attempts, exponential backoff, jitter, and routing exhausted messages to a dead-letter topic.",
    },
    {
      label: "Asynchronous delivery",
      detailMD:
        "Move callback invocation to an executor per topic or per subscriber. The topic state machine stays the same, but delivery snapshots become tasks.",
    },
    {
      label: "Filtering and routing",
      detailMD:
        "Add subscription predicates so a subscriber receives only matching messages, or add routing keys that map producers to topics without changing acknowledgement semantics.",
    },
  ],

  alternativeDesigns: [
    {
      name: "Competing-consumer work queue",
      detailMD:
        "Store one queue per topic and let each message be claimed by exactly one consumer. This is useful for background jobs where work should not be duplicated.",
      tradeoffsMD:
        "Simpler offset state, but it is not pub-sub. Multiple downstream systems cannot independently replay every event.",
    },
    {
      name: "Per-subscriber physical queues",
      detailMD:
        "On publish, copy the message reference into each subscriber's queue. Each subscriber then consumes from its own simple queue.",
      tradeoffsMD:
        "Delivery is easy and slow subscribers are isolated, but subscribe and publish need more memory and fan-out bookkeeping.",
    },
    {
      name: "Partitioned append-only log",
      detailMD:
        "Hash messages into partitions and track offsets per subscriber per partition, similar to large-scale brokers.",
      tradeoffsMD:
        "Higher throughput and parallelism, but ordering is only guaranteed within a partition and the LLD becomes significantly larger.",
    },
  ],

  commonMistakes: [
    "Using one global consumed offset for the whole topic, which breaks pub-sub because one subscriber's acknowledgement hides messages from others.",
    "Advancing the offset before the subscriber finishes processing, which silently loses messages on failure.",
    "Claiming exactly-once delivery from an in-memory callback design. At-least-once permits duplicates and requires idempotent consumers.",
    "Invoking arbitrary subscriber code while holding the topic lock, causing deadlocks or blocking all producers behind one slow consumer.",
    "Using unsynchronized **ArrayList** and **HashMap** mutations from multiple threads without a clear lock boundary.",
    "Forgetting to define the starting offset for a new subscriber: beginning of log, latest offset, or a caller-provided replay point.",
    "Letting a failed subscriber receive later offsets before it acknowledges the current one, which breaks per-subscriber ordering.",
  ],

  followUps: [
    {
      question: "How would you add consumer groups?",
      answerMD:
        "Introduce **groupId** and partitions. A message is delivered once within a group but once per group overall. Offsets become keyed by topic, partition, group, and subscriber assignment.",
    },
    {
      question: "How do you prevent a slow subscriber from keeping messages forever?",
      answerMD:
        "Add retention and backpressure policies: max retained messages, max subscriber lag, pause producers, drop or dead-letter for specific subscribers, and alert on lag.",
    },
    {
      question: "Can this design provide exactly-once delivery?",
      answerMD:
        "Not by itself. Exactly-once needs coordinated durable offset commits plus idempotent or transactional consumers. In interviews, state that this design is intentionally at-least-once.",
    },
    {
      question: "Where would retries be scheduled?",
      answerMD:
        "A retry scheduler or executor would periodically ask each topic for eligible in-flight messages, using **DeliveryStrategy** to decide delay and maximum attempts.",
    },
    {
      question: "How would you scale beyond one process?",
      answerMD:
        "Persist the log, partition topics, elect partition leaders, replicate messages, store offsets durably, and route producers and subscribers through a cluster-aware broker facade.",
    },
  ],

  productionConsiderations: [
    {
      label: "Durability and recovery",
      detailMD:
        "Persist messages before acknowledging publish success, and persist subscriber offsets after processing. On restart, rebuild topic state from the log and offset store.",
    },
    {
      label: "Retry, timeout, and dead letters",
      detailMD:
        "An in-flight message needs a timeout. Repeated failures should move to a dead-letter topic with error metadata so poison messages do not block the subscriber forever.",
    },
    {
      label: "Backpressure and retention",
      detailMD:
        "Bound memory by topic retention, max message size, max subscriber lag, and producer throttling. Without bounds, one offline subscriber can grow the in-memory log indefinitely.",
    },
    {
      label: "Observability",
      detailMD:
        "Track publish rate, delivery rate, acknowledgement latency, subscriber lag, redelivery count, in-flight count, and dead-letter count per topic and subscriber.",
    },
    {
      label: "Security and tenancy",
      detailMD:
        "Authorize publish and subscribe per topic, isolate tenants with quotas, and validate payload size before accepting messages into memory.",
    },
  ],

  interviewNotes: [
    "Did you explicitly choose pub-sub fan-out rather than competing consumers?",
    "Did you track offsets per subscriber and advance them only after acknowledgement?",
    "Did you call out at-least-once duplicates and the need for idempotent consumers?",
    "Did you make the broker and topic state thread-safe without overcomplicating the model?",
    "Did you avoid mixing retry policy with core topic state by using a strategy seam?",
  ],

  quiz: [
    {
      question: "Why does each subscriber need its own offset?",
      options: [
        "Because every subscriber consumes the topic independently",
        "Because offsets make message payloads smaller",
        "Because Java maps require a numeric value",
        "Because the Singleton pattern needs per-object counters",
      ],
      answerIndex: 0,
      explanationMD:
        "In pub-sub, each subscriber should see every message. One global offset would let one subscriber's acknowledgement hide messages from all others.",
    },
    {
      question: "When should a subscriber's offset advance?",
      options: [
        "Immediately when the broker sends the message",
        "Only after the subscriber calls the acknowledgement callback",
        "When any other subscriber acknowledges the same offset",
        "When the producer publishes the next message",
      ],
      answerIndex: 1,
      explanationMD:
        "Acknowledgement is the commit point. Advancing before acknowledgement creates message loss if the subscriber fails while processing.",
    },
    {
      question: "What does at-least-once delivery imply?",
      options: [
        "A message can never be duplicated",
        "A subscriber may receive the same message more than once",
        "Messages do not need offsets",
        "Publish must block until every subscriber finishes forever",
      ],
      answerIndex: 1,
      explanationMD:
        "If a subscriber processes a message but fails before acknowledging, the broker should redeliver. That makes duplicates possible by design.",
    },
    {
      question: "Which state must be protected for thread safety inside a topic?",
      options: [
        "Only the producer object",
        "Only the immutable message payload string",
        "The message list, subscription map, offsets, in-flight flags, and attempts",
        "Only the console output in Main",
      ],
      answerIndex: 2,
      explanationMD:
        "The topic owns mutable shared state. Protecting those structures keeps offset assignment, acknowledgement, and redelivery consistent.",
    },
    {
      question: "Which pattern best describes subscribers registering with a topic and being notified of messages?",
      options: [
        "Observer",
        "Prototype",
        "Composite",
        "Visitor",
      ],
      answerIndex: 0,
      explanationMD:
        "The topic acts as the subject. Subscribers register interest and receive notifications through their **onMessage** callback.",
    },
  ],

  practiceVariants: [
    {
      title: "Add consumer groups",
      detailMD:
        "Extend subscriptions with a group id so each message is delivered once per group, not once per subscriber, while preserving pub-sub across groups.",
      difficulty: "Advanced",
    },
    {
      title: "Add retry backoff and dead letters",
      detailMD:
        "Implement a **DeliveryStrategy** that delays redelivery, stops after N attempts, and publishes exhausted messages to a dead-letter topic.",
      difficulty: "Intermediate",
    },
    {
      title: "Add durable replay",
      detailMD:
        "Persist messages and offsets so subscribers can restart and continue from their last acknowledged offset.",
      difficulty: "Advanced",
    },
  ],

  flashcards: [
    {
      front: "What is the central difference between pub-sub and a competing-consumer queue?",
      back: "Pub-sub delivers each message to every subscriber; a competing-consumer queue delivers each message to only one consumer in a group.",
    },
    {
      front: "What state does each subscription need?",
      back: "A stable subscriber id, a next offset, an in-flight marker, and usually delivery attempt metadata.",
    },
    {
      front: "What is the acknowledgement commit point?",
      back: "The subscriber's offset advances only when the subscriber calls the acknowledgement callback for its current offset.",
    },
    {
      front: "Why can at-least-once delivery create duplicates?",
      back: "If processing succeeds but acknowledgement is lost, the broker keeps the old offset and redelivers the same message.",
    },
    {
      front: "Which pattern models topic notifications?",
      back: "Observer: the topic is the subject and subscribers are observers receiving message callbacks.",
    },
    {
      front: "Where does retry policy belong?",
      back: "Behind **DeliveryStrategy**, not mixed into the core topic log and offset bookkeeping.",
    },
  ],

  cheatSheetMD: [
    "**Entities:** Broker, Topic, Message, Subscriber, Subscription, DeliveryStrategy, Producer.",
    "",
    "**Core invariant:** each topic has one ordered log; each subscriber has its own next offset into that log.",
    "",
    "**Publish:** append message at next offset, snapshot eligible subscribers, notify them outside the lock.",
    "",
    "**Ack:** if ack offset equals the subscriber's next offset, advance it and clear in-flight state.",
    "",
    "**Delivery:** at-least-once means unacknowledged messages are redelivered; duplicates are possible and consumers should be idempotent.",
    "",
    "**Thread safety:** broker uses a concurrent topic registry; topic protects log and subscription state with synchronization.",
    "",
    "**Patterns:** Observer, Producer-Consumer, Singleton, Strategy.",
  ].join("\n"),

  references: [
    {
      title: "Enterprise Integration Patterns",
      kind: "Book",
      author: "Gregor Hohpe and Bobby Woolf",
    },
    {
      title: "Designing Data-Intensive Applications",
      kind: "Book",
      author: "Martin Kleppmann",
    },
    {
      title: "Apache Kafka Documentation",
      kind: "Docs",
      url: "https://kafka.apache.org/documentation/",
    },
  ],

  relatedProblems: [
    { slug: "notification-system", note: "Subscriber fan-out and retry behavior appear again when delivering notifications." },
    { slug: "task-scheduler", note: "Retry timing, delayed execution, and worker coordination extend the broker's delivery model." },
    { slug: "api-gateway", note: "A gateway often publishes events asynchronously to decouple request handling from downstream consumers." },
  ],
};
