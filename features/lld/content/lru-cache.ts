import type { LLDProblemContent } from "../types";

export const lruCache: LLDProblemContent = {
  slug: "lru-cache",

  statementMD: [
    "Design a **fixed-capacity LRU cache** that supports get and put in O(1) time.",
    "When the cache is full, inserting a new key must evict the entry that has not",
    "been used for the longest time. A successful get and every put for an existing",
    "key both count as usage and must make that key the most recently used entry.",
    "",
    "The interview-standard solution combines a HashMap for direct key lookup with",
    "a doubly linked list for recency ordering. The map gives O(1) access to a node,",
    "and the list lets us remove or move that node in O(1).",
  ].join("\n"),

  businessContextMD: [
    "LRU Cache is the compact version of many production cache designs: API response",
    "caches, database row caches, image caches, and compiler memoization tables all",
    "need bounded memory and predictable eviction. Interviewers like it because it",
    "looks small but forces the candidate to maintain two data structures with one",
    "shared invariant.",
    "",
    "The core lesson is that a cache is not just a map. Without the linked list,",
    "eviction is slow. Without the map, lookup is slow. The design succeeds only",
    "when both structures are updated atomically on every operation.",
  ].join("\n"),

  functionalRequirements: [
    "Initialize the cache with a positive fixed capacity.",
    "Return the cached value for a key in O(1) time when the key exists.",
    "Return a miss value for a key that is absent without changing cache contents.",
    "Insert a new key-value pair in O(1) time when space is available.",
    "Update an existing key in O(1) time and mark it as most recently used.",
    "When inserting into a full cache, evict exactly the least recently used entry.",
    "Maintain recency after both read hits and writes.",
    "Expose a small demonstration that shows recency updates and capacity eviction.",
  ],

  nonFunctionalRequirements: [
    {
      label: "Constant-time operations",
      detailMD:
        "Both get and put must avoid scans. Lookup is through the map; list operations use direct node references.",
    },
    {
      label: "Bounded memory",
      detailMD:
        "The cache stores at most capacity entries. Extra memory is linear in capacity for the map and list nodes.",
    },
    {
      label: "Invariant safety",
      detailMD:
        "The map and linked list must agree: every live key maps to exactly one node that appears between the sentinels.",
    },
    {
      label: "Thread-safety awareness",
      detailMD:
        "The sample implementation synchronizes public operations. In a production cache, this may become a lock strategy or segmented cache decision.",
    },
    {
      label: "Generic key and value support",
      detailMD:
        "The design should work for any key and value types supported by the host language hash map, not only integers.",
    },
  ],

  requirementClarification: [
    {
      question: "What should get return on a miss?",
      answerMD:
        "For the generic Java implementation, return null on a miss and disallow null keys and values so null is unambiguous. In LeetCode 146 with integers, the usual miss value is -1.",
    },
    {
      question: "Do get operations update recency?",
      answerMD:
        "Yes. A successful get means the entry was just used, so its node must move to the front of the recency list.",
    },
    {
      question: "What happens when put is called for an existing key?",
      answerMD:
        "Update the value in the existing node, then move that node to the front. It must not create a second node or change the cache size.",
    },
    {
      question: "Are capacity zero or negative caches valid?",
      answerMD:
        "No for this base design. The constructor rejects non-positive capacity because a cache that can never store entries only complicates the core invariant.",
    },
    {
      question: "Does the base cache need LFU behavior?",
      answerMD:
        "No. LRU evicts by recency only. LFU evicts by access frequency and needs extra bookkeeping, usually frequency buckets plus recency within each bucket.",
    },
  ],

  classDiagramMermaid: [
    "classDiagram",
    "    class LRUCache {",
    "        -int capacity",
    "        -Map~K,Node~ cache",
    "        -Node head",
    "        -Node tail",
    "        +get(K) V",
    "        +put(K,V) void",
    "        +size() int",
    "        -addFront(Node) void",
    "        -remove(Node) void",
    "        -moveToFront(Node) void",
    "        -evictLRU() void",
    "    }",
    "    class Node {",
    "        -K key",
    "        -V value",
    "        -Node prev",
    "        -Node next",
    "    }",
    "    class HashMap {",
    "        +get(K) Node",
    "        +put(K,Node) void",
    "        +remove(K) Node",
    "    }",
    "    class RecencyList {",
    "        -Node head",
    "        -Node tail",
    "        +front mostRecent",
    "        +back leastRecent",
    "    }",
    "    class Main {",
    "        +main(String[]) void",
    "    }",
    "    LRUCache o-- Node",
    "    LRUCache --> HashMap",
    "    LRUCache --> RecencyList",
    "    RecencyList o-- Node",
    "    Main ..> LRUCache",
  ].join("\n"),
  classDiagramCaptionMD:
    "The map points from key to node; the doubly linked list orders the same nodes from most recent at the head side to least recent at the tail side.",

  sequenceDiagramMermaid: [
    "sequenceDiagram",
    "    actor Client",
    "    participant Cache as LRUCache",
    "    participant Map as HashMap",
    "    participant List as RecencyList",
    "    Client->>Cache: get(key)",
    "    Cache->>Map: lookup key",
    "    alt hit",
    "        Map-->>Cache: node",
    "        Cache->>List: moveToFront(node)",
    "        Cache-->>Client: value",
    "    else miss",
    "        Map-->>Cache: null",
    "        Cache-->>Client: null",
    "    end",
    "    Client->>Cache: put(key,value)",
    "    Cache->>Map: lookup key",
    "    alt existing key",
    "        Cache->>Cache: update node value",
    "        Cache->>List: moveToFront(node)",
    "    else new key and full",
    "        Cache->>List: remove tail previous",
    "        Cache->>Map: remove evicted key",
    "        Cache->>List: add new node at front",
    "        Cache->>Map: store key to node",
    "    else new key with space",
    "        Cache->>List: add new node at front",
    "        Cache->>Map: store key to node",
    "    end",
  ].join("\n"),
  sequenceDiagramCaptionMD:
    "Both operations first use the map. On every hit or write, the list is adjusted so the front remains the most recently used position.",

  entities: [
    {
      name: "LRUCache",
      responsibilityMD:
        "Public facade for clients. Owns capacity, the key-to-node map, and the sentinel-headed recency list. It is the only class that mutates both structures together.",
      attributes: ["capacity", "cache", "head", "tail"],
    },
    {
      name: "Node",
      responsibilityMD:
        "Internal entry in the doubly linked list. Stores the key so eviction can remove the matching map entry, stores the value for get, and links to neighbors.",
      attributes: ["key", "value", "prev", "next"],
    },
    {
      name: "HashMap",
      responsibilityMD:
        "Provides direct O(1) average lookup from key to list node. It never stores values directly because the node is the value plus recency position.",
      attributes: ["key to node"],
    },
    {
      name: "Recency list",
      responsibilityMD:
        "Doubly linked list ordered from most recent to least recent. Moving a node to the front and removing the tail-side node are constant-time operations.",
      attributes: ["head sentinel", "tail sentinel"],
    },
    {
      name: "Sentinel nodes",
      responsibilityMD:
        "Dummy head and tail nodes that remove edge cases. Adding to an empty list and removing the last real node use the same pointer wiring as every other case.",
      attributes: ["head", "tail"],
    },
    {
      name: "Client",
      responsibilityMD:
        "Calls get and put without knowing the internal map plus list mechanics. This keeps the data structure usable as a small cache component.",
      attributes: ["get", "put"],
    },
  ],

  patternsUsed: [
    {
      name: "Strategy",
      whyMD:
        "The eviction rule is the policy that varies across cache families. This implementation hardens the LRU policy, but the same boundary can become an EvictionPolicy strategy when comparing LRU with LFU, FIFO, or TTL eviction.",
    },
    {
      name: "Facade",
      whyMD:
        "Clients see only get and put. The cache hides the coordinated HashMap and doubly linked list updates behind a compact API, preventing callers from corrupting recency state.",
    },
  ],

  designSteps: [
    {
      title: "Start from the invariant",
      detailMD:
        "At all times, every cached key appears in the map and exactly once in the list. The list front means most recently used; the node before tail means least recently used.",
    },
    {
      title: "Store key and value inside the list node",
      detailMD:
        "The key is needed during eviction because the tail-side node tells us which map entry to delete. Without the key in the node, eviction would require a scan.",
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
      title: "Use dummy sentinels for simpler pointer wiring",
      detailMD:
        "Dummy head and tail nodes mean every real node has both a previous and next neighbor. Insert and delete do not need special cases for empty, first, or last.",
      code: [
        "head.next = tail;",
        "tail.prev = head;",
        "",
        "private void addFront(Node<K, V> node) {",
        "    Node<K, V> first = head.next;",
        "    node.prev = head;",
        "    node.next = first;",
        "    head.next = node;",
        "    first.prev = node;",
        "}",
      ].join("\n"),
    },
    {
      title: "Make get a lookup plus recency update",
      detailMD:
        "A hit returns the value and moves that node to the front. A miss returns null and does not touch the list.",
      code: [
        "public synchronized V get(K key) {",
        "    Node<K, V> node = cache.get(key);",
        "    if (node == null) {",
        "        return null;",
        "    }",
        "    moveToFront(node);",
        "    return node.value;",
        "}",
      ].join("\n"),
    },
    {
      title: "Make put handle update, insert, and eviction separately",
      detailMD:
        "If the key already exists, update in place and move it to the front. Otherwise evict the tail-side real node only when the cache is already full, then add the new node at the front.",
    },
    {
      title: "Name the concurrency boundary",
      detailMD:
        "The map and list must be updated together. The sample uses synchronized public methods; a higher-throughput production design can replace that with a ReentrantLock, striped locks, or a concurrent cache library.",
    },
  ],

  implementation: [
    {
      filename: "Node.java",
      language: "java",
      content: [
        "final class Node<K, V> {",
        "    final K key;",
        "    V value;",
        "    Node<K, V> prev;",
        "    Node<K, V> next;",
        "",
        "    Node(K key, V value) {",
        "        this.key = key;",
        "        this.value = value;",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "LRUCache.java",
      language: "java",
      content: [
        "import java.util.HashMap;",
        "import java.util.Map;",
        "import java.util.Objects;",
        "",
        "public class LRUCache<K, V> {",
        "    private final int capacity;",
        "    private final Map<K, Node<K, V>> cache;",
        "    private final Node<K, V> head;",
        "    private final Node<K, V> tail;",
        "",
        "    public LRUCache(int capacity) {",
        "        if (capacity <= 0) {",
        "            throw new IllegalArgumentException(\"capacity must be positive\");",
        "        }",
        "        this.capacity = capacity;",
        "        this.cache = new HashMap<>();",
        "        this.head = new Node<>(null, null);",
        "        this.tail = new Node<>(null, null);",
        "        head.next = tail;",
        "        tail.prev = head;",
        "    }",
        "",
        "    public synchronized V get(K key) {",
        "        Objects.requireNonNull(key, \"key\");",
        "        Node<K, V> node = cache.get(key);",
        "        if (node == null) {",
        "            return null;",
        "        }",
        "        moveToFront(node);",
        "        return node.value;",
        "    }",
        "",
        "    public synchronized void put(K key, V value) {",
        "        Objects.requireNonNull(key, \"key\");",
        "        Objects.requireNonNull(value, \"value\");",
        "",
        "        Node<K, V> node = cache.get(key);",
        "        if (node != null) {",
        "            node.value = value;",
        "            moveToFront(node);",
        "            return;",
        "        }",
        "",
        "        if (cache.size() == capacity) {",
        "            evictLRU();",
        "        }",
        "",
        "        Node<K, V> newNode = new Node<>(key, value);",
        "        cache.put(key, newNode);",
        "        addFront(newNode);",
        "    }",
        "",
        "    public synchronized int size() {",
        "        return cache.size();",
        "    }",
        "",
        "    private void addFront(Node<K, V> node) {",
        "        Node<K, V> first = head.next;",
        "        node.prev = head;",
        "        node.next = first;",
        "        head.next = node;",
        "        first.prev = node;",
        "    }",
        "",
        "    private void remove(Node<K, V> node) {",
        "        Node<K, V> previous = node.prev;",
        "        Node<K, V> next = node.next;",
        "        previous.next = next;",
        "        next.prev = previous;",
        "        node.prev = null;",
        "        node.next = null;",
        "    }",
        "",
        "    private void moveToFront(Node<K, V> node) {",
        "        remove(node);",
        "        addFront(node);",
        "    }",
        "",
        "    private void evictLRU() {",
        "        Node<K, V> lru = tail.prev;",
        "        if (lru == head) {",
        "            return;",
        "        }",
        "        remove(lru);",
        "        cache.remove(lru.key);",
        "    }",
        "",
        "    @Override",
        "    public synchronized String toString() {",
        "        StringBuilder builder = new StringBuilder(\"[\");",
        "        Node<K, V> current = head.next;",
        "        while (current != tail) {",
        "            if (builder.length() > 1) {",
        "                builder.append(\", \");",
        "            }",
        "            builder.append(current.key).append(\"=\").append(current.value);",
        "            current = current.next;",
        "        }",
        "        builder.append(\"]\");",
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
        "        LRUCache<Integer, String> cache = new LRUCache<>(2);",
        "",
        "        cache.put(1, \"A\");",
        "        cache.put(2, \"B\");",
        "        System.out.println(\"After put 1 and put 2: \" + cache);",
        "",
        "        System.out.println(\"get(1) = \" + cache.get(1));",
        "        System.out.println(\"After get 1: \" + cache);",
        "",
        "        cache.put(3, \"C\");",
        "        System.out.println(\"After put 3, key 2 is evicted: \" + cache);",
        "        System.out.println(\"get(2) = \" + cache.get(2));",
        "",
        "        cache.put(4, \"D\");",
        "        System.out.println(\"After put 4, key 1 is evicted: \" + cache);",
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
        "Package-private generic list node. It stores key and value plus previous and next links. The key is essential because eviction starts from the least-recent node and then removes the corresponding map entry.",
    },
    {
      className: "LRUCache",
      detailMD:
        "Generic fixed-capacity cache. It owns the HashMap and sentinel-based doubly linked list, exposes synchronized get, put, and size, and keeps helper methods private so list wiring cannot be called out of order.",
    },
    {
      className: "Main",
      detailMD:
        "Small executable demo. It creates a capacity-2 cache, shows that get updates recency, and then inserts new keys to evict the correct least-recently-used entries.",
    },
  ],

  dryRun: {
    inputMD:
      "Capacity 2. Actions: put(1,A), put(2,B), get(1), put(3,C), get(2), put(4,D), get(1), get(3), get(4). The list is shown from most recent to least recent.",
    columns: ["Step", "Operation", "Return", "Map keys", "Recency list", "Explanation"],
    rows: [
      ["1", "put(1,A)", "-", "{1}", "1", "Insert key 1 at the front."],
      ["2", "put(2,B)", "-", "{1,2}", "2 → 1", "Key 2 is newest; key 1 becomes least recent."],
      ["3", "get(1)", "A", "{1,2}", "1 → 2", "Read hit moves key 1 to the front."],
      ["4", "put(3,C)", "-", "{1,3}", "3 → 1", "Cache was full, so key 2 is evicted from the tail side."],
      ["5", "get(2)", "null", "{1,3}", "3 → 1", "Miss does not change recency."],
      ["6", "put(4,D)", "-", "{3,4}", "4 → 3", "Key 1 is now least recent, so it is evicted."],
      ["7", "get(1)", "null", "{3,4}", "4 → 3", "Key 1 was evicted in the previous step."],
      ["8", "get(3)", "C", "{3,4}", "3 → 4", "Read hit makes key 3 most recent."],
      ["9", "get(4)", "D", "{3,4}", "4 → 3", "Read hit makes key 4 most recent."],
    ],
    narrativeMD:
      "The important moment is step 3: reading key 1 protects it from eviction. Therefore step 4 evicts key 2, not key 1.",
  },

  complexity: [
    {
      operation: "get hit",
      time: "O(1)",
      space: "O(1)",
      note: "Map lookup, unlink node, and add node to the front.",
    },
    {
      operation: "get miss",
      time: "O(1)",
      space: "O(1)",
      note: "Map lookup only.",
    },
    {
      operation: "put existing key",
      time: "O(1)",
      space: "O(1)",
      note: "Update node value and move it to the front.",
    },
    {
      operation: "put new key",
      time: "O(1)",
      space: "O(1)",
      note: "Optional tail eviction, map insert, and front insertion.",
    },
    {
      operation: "cache storage",
      time: "-",
      space: "O(capacity)",
      note: "One map entry and one list node per cached key.",
    },
  ],
  complexityNotesMD:
    "The O(1) claim assumes average O(1) hash map operations and that doubly linked list nodes are removed by direct reference, not by searching the list.",

  extensibility: [
    {
      label: "Pluggable eviction policies",
      detailMD:
        "Extract touch, insert, and evict behavior behind an eviction policy interface. LRU uses one list; LFU would use frequency buckets plus recency order within each frequency.",
    },
    {
      label: "Metrics and observability",
      detailMD:
        "Track hits, misses, evictions, and current size. These counters can be updated inside the synchronized public operations without exposing internals.",
    },
    {
      label: "TTL expiration",
      detailMD:
        "Add timestamps to nodes and check expiry during get and put. A background cleaner is optional; correctness can still be enforced lazily on access.",
    },
    {
      label: "Weighted capacity",
      detailMD:
        "Replace entry count with total weight, such as bytes or cost. Eviction may remove multiple tail-side nodes until the cache is under budget.",
    },
    {
      label: "Higher concurrency",
      detailMD:
        "Segment the cache by key hash or use a dedicated lock. This reduces contention compared with synchronizing the entire cache for every operation.",
    },
  ],

  alternativeDesigns: [
    {
      name: "Java LinkedHashMap with access order",
      detailMD:
        "Java already provides a linked hash map that can maintain access order and override removeEldestEntry for capacity eviction.",
      tradeoffsMD:
        "Excellent for production Java, but in interviews it hides the core data-structure reasoning the interviewer wants to see.",
    },
    {
      name: "Array or list scan on every access",
      detailMD:
        "Store entries in a list ordered by recency and scan for keys on get and put.",
      tradeoffsMD:
        "Simple to explain but violates O(1) lookup. It is acceptable only for tiny caches where capacity is known to be very small.",
    },
    {
      name: "Timestamp heap plus map",
      detailMD:
        "Keep last-access timestamps and evict from a min-heap.",
      tradeoffsMD:
        "Eviction becomes O(log n), stale heap entries need cleanup, and updates are more complex than direct list movement.",
    },
    {
      name: "LFU cache",
      detailMD:
        "Evict the least frequently used key instead of the least recently used key, breaking ties by recency.",
      tradeoffsMD:
        "Better for stable hot keys but more stateful: frequency maps, buckets, and min-frequency tracking replace the single LRU list.",
    },
  ],

  commonMistakes: [
    "Updating the map but forgetting to move the node to the front on get.",
    "Creating a new node for an existing key, leaving a stale duplicate in the list.",
    "Evicting from the head side instead of the tail side.",
    "Not storing the key in the node, which makes map removal during eviction impossible without a scan.",
    "Handling empty, first, and last nodes manually instead of using sentinels, leading to null pointer bugs.",
    "Forgetting that put for an existing key also counts as usage.",
    "Claiming thread-safe behavior while updating the map and list without a common lock.",
  ],

  followUps: [
    {
      question: "How would you make the cache thread-safe?",
      answerMD:
        "Guard every operation that touches the map or list with the same lock. The sample uses synchronized methods. For higher throughput, use a ReentrantLock, lock striping, or a mature library cache.",
    },
    {
      question: "How is LRU different from LFU?",
      answerMD:
        "LRU evicts the item with the oldest recent access. LFU evicts the item with the lowest access count, usually using recency only to break ties within the same count.",
    },
    {
      question: "Why do we need a doubly linked list instead of a singly linked list?",
      answerMD:
        "Moving an arbitrary node requires unlinking it from its previous neighbor. The map gives the node, not its previous node, so a singly linked list would need a scan or extra predecessor tracking.",
    },
    {
      question: "Why not store values directly in the HashMap and keep only keys in the list?",
      answerMD:
        "That can work, but the list node still needs the key for eviction and the map still needs to locate the node for movement. Storing key and value together keeps the entry cohesive.",
    },
    {
      question: "What if null values must be supported?",
      answerMD:
        "Return Optional<V>, a custom result object, or a containsKey method so miss can be distinguished from a cached null. The sample disallows null values to keep get simple.",
    },
    {
      question: "How would you support TTL along with LRU?",
      answerMD:
        "Add expiry time to each node. On get, treat expired entries as misses and remove them. On put, evict expired entries opportunistically before applying normal LRU eviction.",
    },
  ],

  productionConsiderations: [
    {
      label: "Lock contention",
      detailMD:
        "A single synchronized cache is correct but serializes all reads and writes. Production caches often segment by key hash or use carefully designed concurrent data structures.",
    },
    {
      label: "Hash collision behavior",
      detailMD:
        "Average O(1) depends on a healthy hash function. Poor key hash implementations can degrade performance, so cache keys should be immutable and have stable equality.",
    },
    {
      label: "Memory accounting",
      detailMD:
        "Entry count is not always enough. Large values may require weighted capacity, admission control, or off-heap storage to prevent memory pressure.",
    },
    {
      label: "Eviction visibility",
      detailMD:
        "Real systems often need eviction listeners for cleanup, metrics, or write-back. The listener must not run while holding a hot lock if it can block.",
    },
    {
      label: "Cache stampede",
      detailMD:
        "A local LRU cache does not prevent many threads from recomputing the same missing value. Add request coalescing or single-flight loading when misses trigger expensive work.",
    },
    {
      label: "Testing pointer invariants",
      detailMD:
        "Unit tests should verify map size, list order, eviction order, update behavior, and repeated get calls. Pointer bugs often pass simple size-only tests.",
    },
  ],

  interviewNotes: [
    "Lead with the two-structure invariant: map for lookup, doubly linked list for recency.",
    "State exactly when recency changes: get hit, put existing key, and put new key.",
    "Use sentinels to simplify pointer operations and reduce bug surface.",
    "During eviction, remove the tail-side real node from the list and remove its key from the map.",
    "Call out that generic get returning null requires null values to be disallowed or a different return type.",
    "Mention thread-safety separately from algorithmic complexity; correctness under concurrency needs a shared lock.",
  ],

  quiz: [
    {
      question: "Why does the cache need both a HashMap and a doubly linked list?",
      options: [
        "The map gives O(1) lookup and the list gives O(1) recency updates and eviction",
        "The map stores old values and the list stores new values",
        "The list is only needed to print the cache",
        "The map is used only when capacity is one",
      ],
      answerIndex: 0,
      explanationMD:
        "The key idea is combining direct lookup with constant-time list movement. Either structure alone misses one of the required O(1) operations.",
    },
    {
      question: "After a successful get, what must happen to the accessed node?",
      options: [
        "It must move to the least-recent position",
        "It must be deleted from the cache",
        "It must move to the most-recent position",
        "Nothing, because reads do not affect LRU order",
      ],
      answerIndex: 2,
      explanationMD:
        "LRU means recently used entries are protected. A read hit is usage, so that node moves to the front.",
    },
    {
      question: "Why is the key stored inside each Node?",
      options: [
        "To make the value immutable",
        "To remove the matching map entry when that node is evicted",
        "To avoid using generics",
        "To make the linked list sorted",
      ],
      answerIndex: 1,
      explanationMD:
        "Eviction starts from the tail-side node. The node must carry its key so the cache can delete the corresponding map entry in O(1).",
    },
    {
      question: "What is the main benefit of dummy head and tail sentinels?",
      options: [
        "They increase the cache capacity",
        "They make HashMap lookups faster",
        "They remove edge cases for inserting and removing list nodes",
        "They allow LFU behavior automatically",
      ],
      answerIndex: 2,
      explanationMD:
        "With sentinels, every real node has a previous and next neighbor, so pointer wiring is uniform.",
    },
    {
      question: "How does LFU differ from LRU?",
      options: [
        "LFU evicts by lowest access frequency while LRU evicts by oldest recent access",
        "LFU is the same as LRU with a larger capacity",
        "LFU never needs a map",
        "LFU can only store integer keys",
      ],
      answerIndex: 0,
      explanationMD:
        "LFU tracks counts; LRU tracks recency. LFU often still uses recency as a tie-breaker inside a frequency bucket.",
    },
  ],

  practiceVariants: [
    {
      title: "Implement integer LeetCode 146 API",
      detailMD:
        "Convert the generic cache to an int-to-int class where get returns -1 on miss. Keep the same map plus doubly linked list design.",
      difficulty: "Beginner",
    },
    {
      title: "Add TTL expiration",
      detailMD:
        "Store expiry time in every node, remove expired nodes on access, and decide whether expired removals should notify eviction listeners.",
      difficulty: "Intermediate",
    },
    {
      title: "Build LFU cache",
      detailMD:
        "Replace the single recency list with frequency buckets, track the minimum frequency, and use recency to break ties within a bucket.",
      difficulty: "Advanced",
    },
  ],

  flashcards: [
    {
      front: "What two data structures power an O(1) LRU cache?",
      back: "A HashMap from key to node and a doubly linked list ordered by recency.",
    },
    {
      front: "Where is the most recently used entry stored?",
      back: "Immediately after the dummy head sentinel.",
    },
    {
      front: "Where is the least recently used entry stored?",
      back: "Immediately before the dummy tail sentinel.",
    },
    {
      front: "Why must Node store the key?",
      back: "Eviction starts from a node, and the cache needs that key to remove the map entry.",
    },
    {
      front: "Does a get hit change LRU order?",
      back: "Yes. The accessed node moves to the front because it is now most recently used.",
    },
    {
      front: "What pattern does the public get and put API resemble?",
      back: "Facade, because it hides the coordinated map and list internals.",
    },
    {
      front: "How is LFU related to LRU?",
      back: "LFU changes the eviction strategy from recency to frequency, often using LRU order to break ties.",
    },
  ],

  cheatSheetMD: [
    "**Goal:** fixed capacity cache with O(1) get and put.",
    "",
    "**Core invariant:** every cached key maps to exactly one node, and every real node in the list appears in the map.",
    "",
    "**Data structures:** HashMap for key to node lookup; doubly linked list for recency order; dummy head and tail sentinels to avoid edge cases.",
    "",
    "**Ordering:** head side is most recent; tail side is least recent.",
    "",
    "**Get:** map lookup; on hit move node to front and return value; on miss return null.",
    "",
    "**Put existing:** update value, move node to front, do not change size.",
    "",
    "**Put new:** if full, evict node before tail and remove its key from the map; then add the new node at the front and map the key to it.",
    "",
    "**Complexity:** O(1) average time for get and put; O(capacity) space.",
    "",
    "**Thread-safety:** map and list mutations must share one lock or an equivalent concurrency strategy.",
  ].join("\n"),

  references: [
    {
      title: "LeetCode 146 — LRU Cache",
      kind: "Docs",
      url: "https://leetcode.com/problems/lru-cache/",
    },
    {
      title: "Java Platform Documentation — LinkedHashMap",
      kind: "Docs",
      url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/LinkedHashMap.html",
      author: "Oracle",
    },
    {
      title: "Effective Java — Item 50 and Item 78",
      kind: "Book",
      author: "Joshua Bloch",
    },
    {
      title: "Designing Data-Intensive Applications",
      kind: "Book",
      author: "Martin Kleppmann",
    },
  ],

  relatedProblems: [
    { slug: "lfu-cache", note: "Natural next step: frequency-based eviction with recency tie-breaking." },
    { slug: "elevator-system", note: "Another design where policy and state transitions must stay consistent." },
    { slug: "parking-lot", note: "Shows Facade and Strategy ideas in a larger object model." },
  ],
};
