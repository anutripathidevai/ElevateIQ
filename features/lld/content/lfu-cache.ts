import type { LLDProblemContent } from "../types";

export const lfuCache: LLDProblemContent = {
  slug: "lfu-cache",

  statementMD: [
    "Design a **fixed-capacity LFU cache** that supports get and put in O(1) average time.",
    "When the cache is full, inserting a new key must evict the entry with the lowest access frequency.",
    "If multiple entries share that minimum frequency, evict the least recently used entry among only that frequency bucket.",
    "",
    "The interview-standard design combines three maps: key to node for direct lookup, key to frequency for the current count, and frequency to a recency-ordered doubly linked list. A **minFreq** pointer tells eviction which bucket to inspect without scanning counts.",
  ].join("\n"),

  businessContextMD: [
    "LFU Cache is the harder cousin of LRU. It appears in cache-heavy interviews because it tests whether the candidate can preserve O(1) operations while maintaining more than one ordering dimension: frequency first, recency second.",
    "",
    "Real services use frequency-aware policies when stable hot keys should survive short bursts. A product-catalog cache, feature-flag cache, or recommendation cache may prefer an object read thousands of times yesterday over an object touched once just now. The key lesson is that eviction policy is part of the data model, not an afterthought bolted onto a HashMap.",
  ].join("\n"),

  functionalRequirements: [
    "Initialize the cache with a positive fixed capacity.",
    "Return the cached value for an existing key in O(1) average time.",
    "Return a miss value for an absent key without changing cache state.",
    "Increment a key's frequency after every successful get.",
    "Insert a new key-value pair with frequency 1 when capacity is available.",
    "Update an existing key's value and treat the update as an access.",
    "When full, evict the key with the smallest frequency.",
    "Break equal-frequency ties by LRU order inside that frequency bucket.",
    "Maintain **minFreq** so eviction never scans all buckets.",
    "Expose a small demo that proves frequency promotion and recency tie-breaking.",
  ],

  nonFunctionalRequirements: [
    {
      label: "O(1) average operations",
      detailMD:
        "Get and put must use HashMap lookup plus constant-time list movement. No operation should scan all entries, all frequencies, or a whole bucket.",
    },
    {
      label: "Correct eviction",
      detailMD:
        "The victim must come from the current **minFreq** bucket, and specifically from that bucket's least-recent side. Frequency order has priority over global recency.",
    },
    {
      label: "Bounded memory",
      detailMD:
        "The cache stores at most capacity entries. Auxiliary state is linear in capacity: one node, one key-to-node entry, one key-to-frequency entry, and membership in one frequency list per cached key.",
    },
    {
      label: "Invariant safety",
      detailMD:
        "A key must appear in exactly one frequency bucket at a time, and **keyToFrequency** must agree with that bucket. Promotion is remove from old bucket, update count, add to new bucket.",
    },
    {
      label: "Thread-safety awareness",
      detailMD:
        "The reference implementation synchronizes public methods so the three maps and frequency lists are updated atomically. Production systems may replace this with lock striping or segmented caches.",
    },
    {
      label: "Generic key and value support",
      detailMD:
        "The cache should work with any immutable, hashable key and non-null value type supported by Java's HashMap.",
    },
  ],

  requirementClarification: [
    {
      question: "What should get return on a miss?",
      answerMD:
        "The generic Java implementation returns null and rejects null values, so null unambiguously means miss. An integer interview API can return -1 instead.",
    },
    {
      question: "Does put for an existing key increase frequency?",
      answerMD:
        "Yes. Updating an existing key is a cache access. It changes the value, promotes the key to the next frequency, and makes it most recent in the new bucket.",
    },
    {
      question: "How are ties resolved among keys with the same frequency?",
      answerMD:
        "Use LRU order inside each frequency bucket. The most recently touched key is stored near the front; eviction removes from the tail side of the **minFreq** bucket.",
    },
    {
      question: "Can we scan frequencies during eviction?",
      answerMD:
        "No. Scanning breaks the O(1) requirement. The cache maintains **minFreq** eagerly whenever a key is inserted, promoted, or evicted.",
    },
    {
      question: "What happens when the cache capacity is zero or negative?",
      answerMD:
        "The constructor rejects non-positive capacity. A zero-capacity variant can be built, but it distracts from the core LFU invariants in an interview.",
    },
    {
      question: "Why not use only a HashMap from key to value and key to count?",
      answerMD:
        "Counts alone identify the minimum frequency but not the least-recent key inside that frequency. The frequency-to-list map supplies constant-time tie-breaking.",
    },
  ],

  classDiagramMermaid: [
    "classDiagram",
    "    class LFUCache {",
    "        -int capacity",
    "        -Map~K,Node~ keyToNode",
    "        -Map~K,Integer~ keyToFrequency",
    "        -Map~Integer,DoublyLinkedList~ frequencyToNodes",
    "        -int minFrequency",
    "        +get(K) V",
    "        +put(K,V) void",
    "        +size() int",
    "        -promote(K,Node) void",
    "        -evictLeastFrequentlyUsed() void",
    "    }",
    "    class Node {",
    "        -K key",
    "        -V value",
    "        -Node prev",
    "        -Node next",
    "        +setValue(V) void",
    "    }",
    "    class DoublyLinkedList {",
    "        -Node head",
    "        -Node tail",
    "        -int size",
    "        +addMostRecent(Node) void",
    "        +remove(Node) void",
    "        +removeLeastRecent() Node",
    "        +iterator() Iterator",
    "    }",
    "    class Iterator {",
    "        +hasNext() boolean",
    "        +next() Node",
    "    }",
    "    class HashMap {",
    "        +get(Object) Object",
    "        +put(Object,Object) Object",
    "        +remove(Object) Object",
    "    }",
    "    class Main {",
    "        +main(String[]) void",
    "    }",
    "    LFUCache o-- Node",
    "    LFUCache o-- DoublyLinkedList",
    "    LFUCache --> HashMap",
    "    DoublyLinkedList o-- Node",
    "    DoublyLinkedList ..> Iterator",
    "    Main ..> LFUCache",
  ].join("\n"),
  classDiagramCaptionMD:
    "The cache owns three coordinated indexes. **keyToNode** retrieves values, **keyToFrequency** stores counts, **frequencyToNodes** stores recency order within each count, and **minFrequency** points directly to the eviction bucket.",

  sequenceDiagramMermaid: [
    "sequenceDiagram",
    "    actor Client",
    "    participant Cache as LFUCache",
    "    participant NodeMap as KeyNodeMap",
    "    participant FreqMap as KeyFrequencyMap",
    "    participant Buckets as FrequencyBuckets",
    "    Client->>Cache: get(key)",
    "    Cache->>NodeMap: lookup key",
    "    alt hit",
    "        NodeMap-->>Cache: node",
    "        Cache->>FreqMap: read old frequency",
    "        Cache->>Buckets: remove node from old bucket",
    "        Cache->>FreqMap: store old plus one",
    "        Cache->>Buckets: add node to new bucket front",
    "        Cache-->>Client: value",
    "    else miss",
    "        NodeMap-->>Cache: null",
    "        Cache-->>Client: null",
    "    end",
    "    Client->>Cache: put(newKey,value)",
    "    alt cache full",
    "        Cache->>Buckets: remove tail from minFrequency bucket",
    "        Cache->>NodeMap: remove victim key",
    "        Cache->>FreqMap: remove victim key",
    "    end",
    "    Cache->>NodeMap: store new node",
    "    Cache->>FreqMap: set frequency to 1",
    "    Cache->>Buckets: add to frequency 1 front",
    "    Cache->>Cache: minFrequency = 1",
  ].join("\n"),
  sequenceDiagramCaptionMD:
    "A hit is a promotion between buckets. A new insert starts at frequency 1, and a full insert evicts from the tail of the current **minFrequency** bucket.",

  entities: [
    {
      name: "LFUCache",
      responsibilityMD:
        "Public facade and invariant owner. It coordinates the three maps, owns **minFrequency**, and exposes synchronized **get**, **put**, and **size** methods.",
      attributes: ["capacity", "keyToNode", "keyToFrequency", "frequencyToNodes", "minFrequency"],
    },
    {
      name: "Node",
      responsibilityMD:
        "Internal cache entry stored inside exactly one frequency list. It carries the key for eviction cleanup, the value for reads, and previous/next pointers for O(1) movement.",
      attributes: ["key", "value", "prev", "next"],
    },
    {
      name: "DoublyLinkedList",
      responsibilityMD:
        "Recency bucket for one frequency. Its front side is most recent and its tail side is least recent, so tie-breaking inside a frequency is constant-time.",
      attributes: ["head sentinel", "tail sentinel", "size"],
    },
    {
      name: "keyToNode map",
      responsibilityMD:
        "Maps each key to its node so get, update, and promotion start in O(1) average time.",
      attributes: ["K to Node"],
    },
    {
      name: "keyToFrequency map",
      responsibilityMD:
        "Stores the current access count for every key. It avoids placing frequency state in external scans and makes promotion a direct old-count lookup.",
      attributes: ["K to Integer"],
    },
    {
      name: "frequencyToNodes map",
      responsibilityMD:
        "Maps each frequency to its recency-ordered bucket. Empty buckets are removed so **minFrequency** points only at a live bucket.",
      attributes: ["Integer to DoublyLinkedList"],
    },
    {
      name: "minFrequency pointer",
      responsibilityMD:
        "Tracks the smallest frequency currently present in the cache. Insert resets it to 1; promotion advances it only when the old minimum bucket becomes empty.",
      attributes: ["minimum live frequency"],
    },
    {
      name: "Client",
      responsibilityMD:
        "Uses the cache through a simple get and put API without manipulating buckets, counts, or list nodes directly.",
      attributes: ["get", "put"],
    },
  ],

  patternsUsed: [
    {
      name: "Strategy",
      whyMD:
        "LFU is an eviction strategy: choose the smallest frequency first, then LRU within that bucket. Naming it as a strategy helps compare it cleanly with LRU, FIFO, TTL, and weighted policies.",
    },
    {
      name: "Iterator",
      whyMD:
        "Each frequency bucket exposes an iterator for diagnostics and demos without exposing mutable pointers. The core operations still remove by node reference, while traversal is a safe read-only view.",
    },
    {
      name: "Facade",
      whyMD:
        "Clients see only **get** and **put**. The cache hides three maps, frequency buckets, promotion, and eviction behind one compact API so callers cannot corrupt internal state.",
    },
  ],

  designSteps: [
    {
      title: "Start with the LFU invariant",
      detailMD:
        "Every live key must have one node, one frequency count, and membership in exactly one list whose frequency equals that count. **minFrequency** must equal the smallest non-empty bucket.",
    },
    {
      title: "Store entries as removable list nodes",
      detailMD:
        "The key is stored in the node because eviction starts from a list tail and then must delete the matching map entries in O(1).",
      code: [
        "final class Node<K, V> {",
        "    final K key;",
        "    V value;",
        "    Node<K, V> prev;",
        "    Node<K, V> next;",
        "}",
      ].join("\n"),
    },
    {
      title: "Make each frequency bucket an LRU list",
      detailMD:
        "Inside a frequency, most recent entries are added after the head sentinel and eviction removes from the tail sentinel side. This is the same tie-breaker idea as an LRU cache, scoped to one count.",
      code: [
        "void addMostRecent(Node<K, V> node) {",
        "    Node<K, V> first = head.next;",
        "    node.prev = head;",
        "    node.next = first;",
        "    head.next = node;",
        "    first.prev = node;",
        "    size++;",
        "}",
      ].join("\n"),
    },
    {
      title: "Promote on every hit or update",
      detailMD:
        "Promotion removes the node from its old frequency bucket, increments **keyToFrequency**, and inserts the node as most recent in the next bucket. If the old bucket was **minFrequency** and becomes empty, advance **minFrequency** by one.",
      code: [
        "private void promote(K key, Node<K, V> node) {",
        "    int oldFrequency = keyToFrequency.get(key);",
        "    DoublyLinkedList<K, V> oldList = frequencyToNodes.get(oldFrequency);",
        "    oldList.remove(node);",
        "    if (oldList.isEmpty()) {",
        "        frequencyToNodes.remove(oldFrequency);",
        "        if (oldFrequency == minFrequency) {",
        "            minFrequency++;",
        "        }",
        "    }",
        "    int newFrequency = oldFrequency + 1;",
        "    keyToFrequency.put(key, newFrequency);",
        "    bucketFor(newFrequency).addMostRecent(node);",
        "}",
      ].join("\n"),
    },
    {
      title: "Evict from the minimum frequency bucket",
      detailMD:
        "When inserting into a full cache, look up the **minFrequency** bucket and remove its least-recent node. This picks the LFU victim and handles equal-frequency ties in one constant-time step.",
    },
    {
      title: "Reset the minimum on new insert",
      detailMD:
        "Every new key starts with frequency 1. After inserting it, **minFrequency** must be set to 1, even if the previous minimum was higher because all old keys had been promoted.",
    },
    {
      title: "Keep synchronization at the public boundary",
      detailMD:
        "The three maps and bucket lists form one logical state machine. The sample synchronizes **get**, **put**, **size**, and debug reads so no caller can observe a half-promoted key.",
    },
  ],

  implementation: [
    {
      filename: "Node.java",
      language: "java",
      content: [
        "final class Node<K, V> {",
        "    private final K key;",
        "    private V value;",
        "    Node<K, V> prev;",
        "    Node<K, V> next;",
        "",
        "    Node(K key, V value) {",
        "        this.key = key;",
        "        this.value = value;",
        "    }",
        "",
        "    K getKey() {",
        "        return key;",
        "    }",
        "",
        "    V getValue() {",
        "        return value;",
        "    }",
        "",
        "    void setValue(V value) {",
        "        this.value = value;",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "DoublyLinkedList.java",
      language: "java",
      content: [
        "import java.util.Iterator;",
        "import java.util.NoSuchElementException;",
        "",
        "final class DoublyLinkedList<K, V> implements Iterable<Node<K, V>> {",
        "    private final Node<K, V> head;",
        "    private final Node<K, V> tail;",
        "    private int size;",
        "",
        "    DoublyLinkedList() {",
        "        this.head = new Node<>(null, null);",
        "        this.tail = new Node<>(null, null);",
        "        head.next = tail;",
        "        tail.prev = head;",
        "    }",
        "",
        "    void addMostRecent(Node<K, V> node) {",
        "        Node<K, V> first = head.next;",
        "        node.prev = head;",
        "        node.next = first;",
        "        head.next = node;",
        "        first.prev = node;",
        "        size++;",
        "    }",
        "",
        "    void remove(Node<K, V> node) {",
        "        Node<K, V> previous = node.prev;",
        "        Node<K, V> next = node.next;",
        "        if (previous == null || next == null) {",
        "            throw new IllegalStateException(\"node is not linked\");",
        "        }",
        "        previous.next = next;",
        "        next.prev = previous;",
        "        node.prev = null;",
        "        node.next = null;",
        "        size--;",
        "    }",
        "",
        "    Node<K, V> removeLeastRecent() {",
        "        if (isEmpty()) {",
        "            return null;",
        "        }",
        "        Node<K, V> victim = tail.prev;",
        "        remove(victim);",
        "        return victim;",
        "    }",
        "",
        "    boolean isEmpty() {",
        "        return size == 0;",
        "    }",
        "",
        "    int size() {",
        "        return size;",
        "    }",
        "",
        "    @Override",
        "    public Iterator<Node<K, V>> iterator() {",
        "        return new Iterator<>() {",
        "            private Node<K, V> current = head.next;",
        "",
        "            @Override",
        "            public boolean hasNext() {",
        "                return current != tail;",
        "            }",
        "",
        "            @Override",
        "            public Node<K, V> next() {",
        "                if (!hasNext()) {",
        "                    throw new NoSuchElementException();",
        "                }",
        "                Node<K, V> node = current;",
        "                current = current.next;",
        "                return node;",
        "            }",
        "        };",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "LFUCache.java",
      language: "java",
      content: [
        "import java.util.ArrayList;",
        "import java.util.Collections;",
        "import java.util.HashMap;",
        "import java.util.List;",
        "import java.util.Map;",
        "import java.util.Objects;",
        "",
        "public class LFUCache<K, V> {",
        "    private final int capacity;",
        "    private final Map<K, Node<K, V>> keyToNode;",
        "    private final Map<K, Integer> keyToFrequency;",
        "    private final Map<Integer, DoublyLinkedList<K, V>> frequencyToNodes;",
        "    private int minFrequency;",
        "",
        "    public LFUCache(int capacity) {",
        "        if (capacity <= 0) {",
        "            throw new IllegalArgumentException(\"capacity must be positive\");",
        "        }",
        "        this.capacity = capacity;",
        "        this.keyToNode = new HashMap<>();",
        "        this.keyToFrequency = new HashMap<>();",
        "        this.frequencyToNodes = new HashMap<>();",
        "        this.minFrequency = 0;",
        "    }",
        "",
        "    public synchronized V get(K key) {",
        "        Objects.requireNonNull(key, \"key\");",
        "        Node<K, V> node = keyToNode.get(key);",
        "        if (node == null) {",
        "            return null;",
        "        }",
        "        promote(key, node);",
        "        return node.getValue();",
        "    }",
        "",
        "    public synchronized void put(K key, V value) {",
        "        Objects.requireNonNull(key, \"key\");",
        "        Objects.requireNonNull(value, \"value\");",
        "",
        "        Node<K, V> existing = keyToNode.get(key);",
        "        if (existing != null) {",
        "            existing.setValue(value);",
        "            promote(key, existing);",
        "            return;",
        "        }",
        "",
        "        if (keyToNode.size() == capacity) {",
        "            evictLeastFrequentlyUsed();",
        "        }",
        "",
        "        Node<K, V> node = new Node<>(key, value);",
        "        keyToNode.put(key, node);",
        "        keyToFrequency.put(key, 1);",
        "        bucketFor(1).addMostRecent(node);",
        "        minFrequency = 1;",
        "    }",
        "",
        "    public synchronized int size() {",
        "        return keyToNode.size();",
        "    }",
        "",
        "    public synchronized Integer frequencyOf(K key) {",
        "        Objects.requireNonNull(key, \"key\");",
        "        return keyToFrequency.get(key);",
        "    }",
        "",
        "    private void promote(K key, Node<K, V> node) {",
        "        int oldFrequency = keyToFrequency.get(key);",
        "        DoublyLinkedList<K, V> oldList = frequencyToNodes.get(oldFrequency);",
        "        oldList.remove(node);",
        "",
        "        if (oldList.isEmpty()) {",
        "            frequencyToNodes.remove(oldFrequency);",
        "            if (oldFrequency == minFrequency) {",
        "                minFrequency++;",
        "            }",
        "        }",
        "",
        "        int newFrequency = oldFrequency + 1;",
        "        keyToFrequency.put(key, newFrequency);",
        "        bucketFor(newFrequency).addMostRecent(node);",
        "    }",
        "",
        "    private void evictLeastFrequentlyUsed() {",
        "        DoublyLinkedList<K, V> minList = frequencyToNodes.get(minFrequency);",
        "        Node<K, V> victim = minList.removeLeastRecent();",
        "        if (victim == null) {",
        "            return;",
        "        }",
        "        keyToNode.remove(victim.getKey());",
        "        keyToFrequency.remove(victim.getKey());",
        "        if (minList.isEmpty()) {",
        "            frequencyToNodes.remove(minFrequency);",
        "        }",
        "    }",
        "",
        "    private DoublyLinkedList<K, V> bucketFor(int frequency) {",
        "        return frequencyToNodes.computeIfAbsent(frequency, ignored -> new DoublyLinkedList<>());",
        "    }",
        "",
        "    @Override",
        "    public synchronized String toString() {",
        "        StringBuilder builder = new StringBuilder(\"{\");",
        "        List<Integer> frequencies = new ArrayList<>(frequencyToNodes.keySet());",
        "        Collections.sort(frequencies);",
        "        boolean firstEntry = true;",
        "",
        "        for (Integer frequency : frequencies) {",
        "            DoublyLinkedList<K, V> list = frequencyToNodes.get(frequency);",
        "            if (list == null || list.isEmpty()) {",
        "                continue;",
        "            }",
        "            if (!firstEntry) {",
        "                builder.append(\"; \");",
        "            }",
        "            firstEntry = false;",
        "            builder.append(\"f\").append(frequency).append(\"=[\");",
        "            boolean firstNode = true;",
        "            for (Node<K, V> node : list) {",
        "                if (!firstNode) {",
        "                    builder.append(\", \");",
        "                }",
        "                firstNode = false;",
        "                builder.append(node.getKey()).append(\"=\").append(node.getValue());",
        "            }",
        "            builder.append(\"]\");",
        "        }",
        "",
        "        builder.append(\"}, minFreq=\").append(minFrequency);",
        "        return builder.toString();",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "Main.java",
      language: "java",
      content: [
        "public class Main {",
        "    public static void main(String[] args) {",
        "        LFUCache<Integer, String> cache = new LFUCache<>(2);",
        "",
        "        cache.put(1, \"A\");",
        "        cache.put(2, \"B\");",
        "        System.out.println(\"After put 1 and put 2: \" + cache);",
        "",
        "        System.out.println(\"get(1) = \" + cache.get(1));",
        "        System.out.println(\"After get 1, key 1 has frequency 2: \" + cache);",
        "",
        "        cache.put(3, \"C\");",
        "        System.out.println(\"After put 3, key 2 is evicted: \" + cache);",
        "        System.out.println(\"get(2) = \" + cache.get(2));",
        "",
        "        System.out.println(\"get(3) = \" + cache.get(3));",
        "        System.out.println(\"After get 3, keys 1 and 3 both have frequency 2: \" + cache);",
        "",
        "        cache.put(4, \"D\");",
        "        System.out.println(\"After put 4, key 1 loses the LRU tie and is evicted: \" + cache);",
        "        System.out.println(\"get(1) = \" + cache.get(1));",
        "        System.out.println(\"get(3) = \" + cache.get(3));",
        "        System.out.println(\"get(4) = \" + cache.get(4));",
        "    }",
        "}",
      ].join("\n"),
    },
  ],

  classExplanations: [
    {
      className: "Node",
      detailMD:
        "Package-private generic cache entry. It stores key and value plus previous and next links. Frequency intentionally lives in **keyToFrequency** so the design mirrors the three-map LFU invariant.",
    },
    {
      className: "DoublyLinkedList",
      detailMD:
        "One recency bucket for one frequency. It uses dummy head and tail sentinels, supports O(1) add, remove, and remove-least-recent, and implements **Iterable** for safe diagnostics.",
    },
    {
      className: "LFUCache",
      detailMD:
        "Generic fixed-capacity LFU cache. It coordinates **keyToNode**, **keyToFrequency**, **frequencyToNodes**, and **minFrequency** so get, update, insert, promotion, and eviction remain O(1) average time.",
    },
    {
      className: "Main",
      detailMD:
        "Executable demo that creates a capacity-2 cache, promotes keys through reads, evicts the only frequency-1 key, then demonstrates LRU tie-breaking among keys with frequency 2.",
    },
  ],

  dryRun: {
    inputMD:
      "Capacity 2. Actions: put(1,A), put(2,B), get(1), put(3,C), get(3), put(4,D), get(1), get(3), get(4). Buckets are shown most recent to least recent within each frequency.",
    columns: ["Step", "Operation", "Return", "minFreq", "Frequency buckets", "Explanation"],
    rows: [
      ["1", "put(1,A)", "-", "1", "f1: [1]", "Insert key 1 with frequency 1."],
      ["2", "put(2,B)", "-", "1", "f1: [2, 1]", "Key 2 is most recent inside frequency 1."],
      ["3", "get(1)", "A", "1", "f1: [2]; f2: [1]", "Key 1 moves from frequency 1 to frequency 2."],
      ["4", "put(3,C)", "-", "1", "f1: [3]; f2: [1]", "Cache was full; key 2 was the only key in minFreq bucket 1, so it was evicted."],
      ["5", "get(3)", "C", "2", "f2: [3, 1]", "The frequency 1 bucket becomes empty, so minFreq advances to 2."],
      ["6", "put(4,D)", "-", "1", "f1: [4]; f2: [3]", "Keys 1 and 3 both had frequency 2; key 1 was less recent, so it was evicted before inserting key 4."],
      ["7", "get(1)", "null", "1", "f1: [4]; f2: [3]", "Miss after eviction; state does not change."],
      ["8", "get(3)", "C", "1", "f1: [4]; f3: [3]", "Key 3 is promoted from frequency 2 to frequency 3."],
      ["9", "get(4)", "D", "2", "f2: [4]; f3: [3]", "Key 4 leaves frequency 1, so minFreq advances to 2."],
    ],
    narrativeMD:
      "Step 6 is the core LFU moment. Frequency chooses the bucket first, and recency breaks the tie inside that bucket. Even though key 3 was read more recently than key 1 at the same frequency, key 1 is the victim.",
  },

  complexity: [
    {
      operation: "get hit",
      time: "O(1) average",
      space: "O(1)",
      note: "HashMap lookup plus one constant-time removal and one constant-time insertion between frequency buckets.",
    },
    {
      operation: "get miss",
      time: "O(1) average",
      space: "O(1)",
      note: "Only keyToNode lookup is needed.",
    },
    {
      operation: "put existing key",
      time: "O(1) average",
      space: "O(1)",
      note: "Update the value, then run the same promotion path as a hit.",
    },
    {
      operation: "put new key with space",
      time: "O(1) average",
      space: "O(1)",
      note: "Create one node, write two key maps, add to frequency 1, and set minFreq to 1.",
    },
    {
      operation: "put new key when full",
      time: "O(1) average",
      space: "O(1)",
      note: "Remove the tail of the minFreq bucket, delete its map entries, then insert the new key at frequency 1.",
    },
    {
      operation: "cache storage",
      time: "-",
      space: "O(capacity)",
      note: "One node, two key-based map entries, and one bucket membership per cached key.",
    },
  ],
  complexityNotesMD:
    "The O(1) claim assumes average O(1) HashMap operations and direct node removal from doubly linked lists. The diagnostic **toString** sorts frequencies for readability and is intentionally outside the cache API complexity guarantee.",

  extensibility: [
    {
      label: "Pluggable eviction policy",
      detailMD:
        "Extract promotion and eviction behind an **EvictionPolicy** interface. LFU, LRU, FIFO, TTL, and weighted policies can then share a storage layer while changing only policy behavior.",
    },
    {
      label: "LinkedHashSet buckets",
      detailMD:
        "For interview pseudocode, a map from frequency to **LinkedHashSet** of keys is a compact alternative: remove and add keys in O(1), and evict the first key in the minimum-frequency set.",
    },
    {
      label: "Metrics",
      detailMD:
        "Add hit, miss, promotion, and eviction counters inside the synchronized methods. This is useful for validating whether LFU is actually outperforming LRU.",
    },
    {
      label: "TTL or expiry",
      detailMD:
        "Add expiry metadata to nodes and treat expired entries as misses. Expiry cleanup must remove from all three maps and the frequency bucket just like eviction.",
    },
    {
      label: "Weighted capacity",
      detailMD:
        "Replace entry count with total weight, such as bytes. Eviction may need to remove several LFU victims until the cache is under budget.",
    },
    {
      label: "Concurrency scaling",
      detailMD:
        "Segment the cache by key hash so independent keys do not share one lock. Each segment keeps its own maps, buckets, and **minFrequency**.",
    },
  ],

  alternativeDesigns: [
    {
      name: "HashMap plus frequency to LinkedHashSet",
      detailMD:
        "Store values in a key map, counts in a key-to-frequency map, and each frequency bucket as a **LinkedHashSet** of keys. The set's iteration order supplies LRU tie-breaking.",
      tradeoffsMD:
        "This is concise in Java but less explicit about node removal. The custom doubly linked list is clearer for pointer-invariant interviews and supports storing values directly in nodes.",
    },
    {
      name: "Single ordered tree by frequency and timestamp",
      detailMD:
        "Maintain all entries in a balanced tree ordered by frequency first and timestamp second.",
      tradeoffsMD:
        "Eviction is easy to reason about, but get and put become O(log n) because every access removes and reinserts an entry with a new ordering key.",
    },
    {
      name: "Min-heap of frequency records",
      detailMD:
        "Push a record every time a key changes frequency and lazily discard stale heap entries during eviction.",
      tradeoffsMD:
        "This avoids list wiring but gives O(log n) updates, needs stale-entry cleanup, and makes exact recency tie-breaking more error-prone.",
    },
    {
      name: "Plain LRU cache",
      detailMD:
        "Evict the least recently used key globally, ignoring frequency.",
      tradeoffsMD:
        "LRU is simpler and often good for recency-heavy workloads, but it can evict a historically hot key after a short burst of one-time reads.",
    },
  ],

  commonMistakes: [
    "Scanning all keys to find the minimum frequency, which violates O(1).",
    "Tracking frequency counts but forgetting recency order inside the same count.",
    "Forgetting to update **minFrequency** when the old minimum bucket becomes empty.",
    "Not resetting **minFrequency** to 1 after inserting a new key.",
    "Creating a new node for an existing key instead of updating and promoting the old node.",
    "Removing a victim from the bucket but forgetting to remove it from both key maps.",
    "Leaving empty frequency buckets around and later evicting from an empty list.",
    "Claiming thread safety while promotion updates three structures without a shared lock.",
    "Treating a put update as value-only and not increasing the frequency.",
  ],

  followUps: [
    {
      question: "Why is **minFrequency** necessary?",
      answerMD:
        "Without it, eviction would need to scan frequencies to find the smallest non-empty bucket. **minFrequency** makes the victim bucket a direct O(1) lookup.",
    },
    {
      question: "How exactly do you update **minFrequency** during promotion?",
      answerMD:
        "After removing the node from its old bucket, if that bucket is empty and the old frequency equals **minFrequency**, increment **minFrequency**. The promoted key moves to old plus one, so the next possible minimum is one higher unless a new key is inserted.",
    },
    {
      question: "Why is LRU tie-breaking needed inside a frequency bucket?",
      answerMD:
        "LFU alone can identify a lowest count but not a unique victim. Recency gives deterministic, fair eviction among keys with equal frequency and is expected by the standard LFU cache problem.",
    },
    {
      question: "How does LFU differ from LRU?",
      answerMD:
        "LFU evicts the lowest access count and uses recency only as a tie-breaker. LRU ignores counts and evicts the globally oldest recent access.",
    },
    {
      question: "Can the frequency counter overflow?",
      answerMD:
        "Yes in a very long-running process. Production caches may periodically age counters, cap frequencies, or use windowed LFU so ancient popularity does not dominate forever.",
    },
    {
      question: "How would you make this cache highly concurrent?",
      answerMD:
        "Use lock striping or segmented LFU caches so unrelated keys mutate separate map and bucket sets. Exact global LFU under high concurrency is expensive, so production designs often accept approximate policies.",
    },
  ],

  productionConsiderations: [
    {
      label: "Counter aging",
      detailMD:
        "Pure LFU can keep old hot keys forever. Add decay, reset windows, or TinyLFU-style admission so recent workload changes can replace stale winners.",
    },
    {
      label: "Lock contention",
      detailMD:
        "A synchronized cache is correct and interview-friendly but serializes all hits. High-throughput systems use segments, striped locks, or specialized libraries.",
    },
    {
      label: "Memory pressure",
      detailMD:
        "Each entry carries node pointers and two key maps. For large caches, consider primitive-specialized maps, weighted capacity, or off-heap storage.",
    },
    {
      label: "Observability",
      detailMD:
        "Expose hit rate, miss rate, eviction count, average frequency, and frequency-bucket sizes. LFU is only worth its complexity if these metrics beat simpler policies.",
    },
    {
      label: "Key equality",
      detailMD:
        "Keys must be immutable with stable **equals** and **hashCode**. A mutable key can make map lookup fail even though a node still exists in a bucket.",
    },
    {
      label: "Eviction callbacks",
      detailMD:
        "Real caches often notify listeners or release resources on eviction. Run blocking callbacks outside the hot lock, or enqueue them for asynchronous processing.",
    },
    {
      label: "Testing invariants",
      detailMD:
        "Tests should verify map size, bucket membership, **minFrequency**, promotion after get, promotion after update, and LRU tie-breaking at equal frequency.",
    },
  ],

  interviewNotes: [
    "Lead with the three maps and **minFrequency**; this proves you know how O(1) eviction works.",
    "State the invariant that a key appears in exactly one frequency bucket.",
    "Explain promotion carefully: remove old bucket, maybe advance **minFrequency**, then add to new bucket front.",
    "Make tie-breaking explicit: tail of the minimum-frequency bucket is the victim.",
    "Mention that new inserts always start at frequency 1 and reset **minFrequency** to 1.",
    "Call out the average-case HashMap assumption behind O(1).",
    "Discuss concurrency separately from algorithmic complexity; three structures need one atomic mutation boundary.",
  ],

  quiz: [
    {
      question: "Which data structures are sufficient for the standard O(1) LFU cache?",
      options: [
        "A key-to-node map, a key-to-frequency map, frequency-to-recency buckets, and a minFreq pointer",
        "Only a HashMap from key to value",
        "A sorted array of keys and a queue of values",
        "A stack for recent keys and a heap for old keys",
      ],
      answerIndex: 0,
      explanationMD:
        "Direct key lookup, direct count lookup, per-frequency recency buckets, and **minFreq** together avoid all scans.",
    },
    {
      question: "When a get hits an existing key, what must happen?",
      options: [
        "The value is returned and the key stays in the same bucket",
        "The key is removed from the cache because it was already used",
        "The key is promoted from frequency f to f plus 1 and becomes most recent in the new bucket",
        "The whole cache is sorted by value",
      ],
      answerIndex: 2,
      explanationMD:
        "A successful read is an access. It increments the count and refreshes recency within the new count.",
    },
    {
      question: "If the minimum-frequency bucket has keys [A, B] ordered most recent to least recent, which key is evicted?",
      options: [
        "A, because it is first",
        "B, because it is least recent inside the minimum-frequency bucket",
        "Whichever key has the larger value",
        "Neither; the cache must scan higher frequencies first",
      ],
      answerIndex: 1,
      explanationMD:
        "LFU chooses the minimum-frequency bucket first. Within that bucket, LRU tie-breaking removes the least-recent tail-side key.",
    },
    {
      question: "Why must **minFrequency** be reset to 1 after inserting a new key?",
      options: [
        "Because every new key starts with frequency 1 and is now the minimum",
        "Because Java maps require frequency 1",
        "Because it makes values immutable",
        "Because frequency 0 is reserved for evicted nodes",
      ],
      answerIndex: 0,
      explanationMD:
        "A new entry has exactly one access from insertion. Regardless of old counts, the cache now contains a frequency-1 key.",
    },
    {
      question: "What is the most common reason an LFU implementation accidentally becomes O(n)?",
      options: [
        "Using generics",
        "Returning null on miss",
        "Scanning keys or buckets to find the minimum frequency or tie-break victim",
        "Using a demo main method",
      ],
      answerIndex: 2,
      explanationMD:
        "The entire design exists to avoid scans. **minFreq** and per-frequency lists make the victim a direct lookup plus tail removal.",
    },
    {
      question: "How is LFU different from LRU?",
      options: [
        "LFU evicts by lowest access count first; LRU evicts by oldest recent access first",
        "LFU never updates state during get",
        "LRU needs three maps and LFU needs only one list",
        "They are identical when capacity is greater than one",
      ],
      answerIndex: 0,
      explanationMD:
        "LFU's primary ordering is frequency. LRU's primary ordering is recency. LFU may still use LRU order only to break equal-frequency ties.",
    },
  ],

  practiceVariants: [
    {
      title: "Implement LeetCode 460 integer API",
      detailMD:
        "Convert the generic cache to int keys and values where get returns -1 on miss. Keep the same three-map plus min-frequency design.",
      difficulty: "Advanced",
    },
    {
      title: "Use LinkedHashSet buckets",
      detailMD:
        "Replace custom doubly linked lists with a map from frequency to **LinkedHashSet** of keys and a separate key-to-value map. Compare readability and control over invariants.",
      difficulty: "Intermediate",
    },
    {
      title: "Add expiring entries",
      detailMD:
        "Attach expiry time to each node. On get and put, remove expired keys from all maps and buckets before applying normal LFU behavior.",
      difficulty: "Advanced",
    },
    {
      title: "Build windowed LFU",
      detailMD:
        "Add counter aging so old popularity decays. Explain how this changes eviction correctness and why production caches prefer approximate LFU variants.",
      difficulty: "Expert",
    },
  ],

  flashcards: [
    {
      front: "What is the core LFU eviction rule?",
      back: "Evict the key with the lowest access frequency; if tied, evict the least recently used key within that frequency.",
    },
    {
      front: "What does **minFreq** store?",
      back: "The smallest frequency currently present in the cache, so eviction can find the victim bucket in O(1).",
    },
    {
      front: "What are the three main maps in this design?",
      back: "**keyToNode**, **keyToFrequency**, and **frequencyToNodes**.",
    },
    {
      front: "What happens to a key on a get hit?",
      back: "It is removed from its old frequency bucket, its count increases by one, and it is added as most recent in the new bucket.",
    },
    {
      front: "Where is the eviction victim located?",
      back: "At the least-recent side of the **minFreq** bucket.",
    },
    {
      front: "Why does a new insert set **minFreq** to 1?",
      back: "A newly inserted key has frequency 1 and is therefore the minimum frequency in the cache.",
    },
    {
      front: "Why is LFU more complex than LRU?",
      back: "LRU tracks one ordering, recency. LFU tracks frequency buckets plus recency within each bucket.",
    },
    {
      front: "What bug appears if empty buckets are not removed?",
      back: "**minFreq** can point to an empty list, causing wrong eviction or a null removal.",
    },
  ],

  cheatSheetMD: [
    "**Goal:** fixed-capacity LFU cache with O(1) average get and put.",
    "",
    "**Data structures:** key to node HashMap, key to frequency HashMap, frequency to doubly linked list HashMap, and **minFreq**.",
    "",
    "**Bucket order:** each frequency bucket is an LRU list. Front is most recent; tail side is eviction candidate within that frequency.",
    "",
    "**Get hit:** lookup node, remove from old frequency bucket, increment frequency, add to new bucket front, update **minFreq** if the old bucket emptied.",
    "",
    "**Get miss:** return null and leave state unchanged.",
    "",
    "**Put existing:** update value, then promote exactly like get hit.",
    "",
    "**Put new with space:** create node, store frequency 1, add to bucket 1 front, set **minFreq** to 1.",
    "",
    "**Put new when full:** remove tail of **minFreq** bucket, delete victim from both key maps, then insert the new key at frequency 1.",
    "",
    "**Invariants:** one node per key; one frequency per key; key appears in exactly one bucket; no empty bucket is used for eviction.",
    "",
    "**Complexity:** O(1) average time for get and put; O(capacity) space.",
  ].join("\n"),

  references: [
    {
      title: "LeetCode 460 — LFU Cache",
      kind: "Docs",
      url: "https://leetcode.com/problems/lfu-cache/",
    },
    {
      title: "Java Platform Documentation — HashMap",
      kind: "Docs",
      url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/HashMap.html",
      author: "Oracle",
    },
    {
      title: "Java Platform Documentation — LinkedHashSet",
      kind: "Docs",
      url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/LinkedHashSet.html",
      author: "Oracle",
    },
    {
      title: "Effective Java — equals, hashCode, and synchronization guidance",
      kind: "Book",
      author: "Joshua Bloch",
    },
  ],

  relatedProblems: [
    { slug: "lru-cache", note: "The simpler recency-only cache and the best baseline comparison for LFU." },
    { slug: "java-collections-for-lld", note: "Covers HashMap, LinkedHashSet, iterators, and collection tradeoffs used by this design." },
    { slug: "rate-limiter", note: "Another stateful O(1)-oriented design that depends on precise eviction and time-window invariants." },
  ],
};
