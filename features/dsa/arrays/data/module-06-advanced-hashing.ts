import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "arr-insert-delete-getrandom-o1",
    moduleId: "arr-advanced-hashing",
    order: 26,
    title: "Insert Delete GetRandom O(1)",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/insert-delete-getrandom-o1/",
    tags: ["Design", "Hash Map", "Array", "Randomized", "Data Structure"],
    companies: ["Amazon", "Google", "Meta", "Microsoft", "Bloomberg"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 25,
    statementMD:
      "Design a **RandomizedSet** data structure that supports **insert**, **remove**, and **getRandom** in average **O(1)** time. **insert(val)** adds **val** if it is not present. **remove(val)** deletes **val** if it is present. **getRandom()** returns a random element from the current set, where every stored element must have the same probability of being chosen.",
    constraints: [
      "-2^31 <= val <= 2^31 - 1",
      "At most 2 * 10^5 calls will be made to insert, remove, and getRandom",
      "There will be at least one element in the data structure when getRandom is called",
    ],
    inputMD: "A sequence of calls to **RandomizedSet**, **insert(val)**, **remove(val)**, and **getRandom()**.",
    outputMD: "For the constructor output **null**. For **insert** and **remove**, output whether the operation changed the set. For **getRandom**, output one uniformly random value currently stored.",
    examples: [
      {
        input: "operations = [RandomizedSet, insert, insert, getRandom, remove, getRandom], arguments = [[], [1], [2], [], [1], []]",
        output: "One valid output is [null, true, true, 2, true, 2]",
        explanation: "After inserting 1 and 2, either value may be returned by the first random call. Removing 1 leaves only 2, so the final random call must return 2.",
      },
      {
        input: "operations = [RandomizedSet, insert, insert, remove, remove, insert], arguments = [[], [5], [5], [7], [5], [5]]",
        output: "[null, true, false, false, true, true]",
        explanation: "The duplicate insert of 5 fails, removing absent 7 fails, removing present 5 succeeds, and inserting 5 again succeeds because it is no longer stored.",
      },
    ],
    learningObjectives: [
      "Combine an array and a hash map so each operation receives the guarantee it needs.",
      "Explain why uniform random choice requires direct index-based access.",
      "Use swap-with-last deletion to remove an arbitrary array element in O(1).",
      "Maintain the invariant that every stored value maps to its current array index.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe required operations pull in different directions. **getRandom** wants an array because a random index gives uniform access in O(1). **insert** and **remove** want a hash map because membership and location lookup must also be O(1). The design signal is that no single basic structure gives all three guarantees.\n\nThe tempting approach is a hash set alone, but a hash set cannot choose the kth stored element uniformly without walking through elements. An array alone gives random access but cannot find a value to remove quickly. The pattern is hash-backed indexing: store values in a dense array and store each value's index in a map.",
    commonMistakes: [
      "Removing from the middle of an array by shifting elements, which makes remove O(n).",
      "Forgetting to update the moved last element's index after swapping.",
      "Using a hash set alone and then iterating to implement getRandom.",
      "Producing a random value from the value range instead of from the stored array indices.",
    ],
    algorithmMD:
      "**Key idea**\n\nKeep **values**, a dense array list of the elements, and **indexByValue**, a hash map from each value to its current index in **values**. Insert appends to the end. Remove swaps the target with the last element, pops the last slot, and fixes the moved value's index. Random selection chooses an index from **0** through **values.size() - 1**.\n\n**Walkthrough**\n\nStart empty. After **insert(10)**, **values = [10]** and the map is **10 -> 0**. After **insert(20)**, **values = [10,20]** and the map is **10 -> 0, 20 -> 1**. To **remove(10)**, find index 0, move the last value 20 into index 0, update **20 -> 0**, pop the old last slot, and delete 10 from the map. Now **values = [20]**, so **getRandom** must return 20.\n\n**Algorithm**\n\n1. For **insert(val)**, if **val** is already in the map, return **false**.\n2. Otherwise map **val** to **values.size()**, append it to the array list, and return **true**.\n3. For **remove(val)**, if **val** is absent, return **false**.\n4. Read the target index and the last value in the array list.\n5. Write the last value into the target index, update its map entry, remove the final array slot, then delete **val** from the map.\n6. For **getRandom()**, choose a random array index and return the value stored there.",
    solutions: [
      {
        name: "Array list plus value-to-index map",
        approachMD:
          "The array list stores a dense collection for uniform random index selection. The hash map stores where each value currently lives, so arbitrary removal can be converted into a constant-time swap with the last slot.",
        walkthroughMD:
          "1. Store every inserted value at the end of the array list and remember its index in the map.\n2. When removing a value, look up its index directly from the map.\n3. Move the last array value into that index so the array remains dense.\n4. Update the moved value's index in the map, pop the last slot, and remove the deleted value's map entry.\n5. Generate a random integer bounded by the current list size and return the value at that index.",
        complexity: { time: "Average O(1) per operation", space: "O(n)", note: "The array list and map each store one entry per active value." },
        filename: "RandomizedSet.java",
        code: `import java.util.*;

class RandomizedSet {
    private final List<Integer> values;
    private final Map<Integer, Integer> indexByValue;
    private final Random random;

    public RandomizedSet() {
        values = new ArrayList<>();
        indexByValue = new HashMap<>();
        random = new Random();
    }

    public boolean insert(int val) {
        if (indexByValue.containsKey(val)) {
            return false;
        }

        indexByValue.put(val, values.size());
        values.add(val);
        return true;
    }

    public boolean remove(int val) {
        Integer targetIndex = indexByValue.get(val);
        if (targetIndex == null) {
            return false;
        }

        int lastIndex = values.size() - 1;
        int lastValue = values.get(lastIndex);
        values.set(targetIndex, lastValue);
        indexByValue.put(lastValue, targetIndex);
        values.remove(lastIndex);
        indexByValue.remove(val);
        return true;
    }

    public int getRandom() {
        int index = random.nextInt(values.size());
        return values.get(index);
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "Operations: **insert(10)**, **insert(20)**, **remove(10)**, **getRandom()**. Track the dense array and map after each call.",
      columns: ["operation", "argument", "structure state", "result"],
      rows: [
        ["insert", "10", "values = [10], map = {10 -> 0}", "true"],
        ["insert", "20", "values = [10,20], map = {10 -> 0, 20 -> 1}", "true"],
        ["remove", "10", "move 20 to index 0, values = [20], map = {20 -> 0}", "true"],
        ["getRandom", "none", "only index 0 is available", "20"],
      ],
      narrativeMD: "The remove operation never shifts a range of elements. It only overwrites one slot, pops the last slot, and fixes one map entry.",
    },
    interviewTipsMD:
      "Lead with the reason two structures are necessary: the array provides uniform random indexing, while the map provides O(1) membership and index lookup. The critical invariant is that the array is dense and the map always points to current positions. When explaining remove, explicitly handle the case where the removed value is already the last value; the same swap code still works.",
    followUps: [
      "How would you support duplicate values while preserving random probability by occurrence?",
      "How would you make getRandom reproducible for tests without changing asymptotic complexity?",
      "How would you support getRandomWeighted where each value has a weight?",
      "How would you make the structure thread-safe?",
    ],
    similarProblems: [
      { title: "LRU Cache", difficulty: "Medium", slug: "arr-lru-cache", note: "Another design problem that combines a hash map with a second structure for O(1) operations." },
      { title: "Design HashMap", difficulty: "Easy", slug: "arr-design-hashmap", note: "Focuses on the hash table portion of this design." },
      { title: "Two Sum", difficulty: "Easy", slug: "arr-two-sum", note: "The classic value-to-index hash lookup pattern." },
      { title: "Insert Delete GetRandom O(1) - Duplicates Allowed", difficulty: "Hard", url: "https://leetcode.com/problems/insert-delete-getrandom-o1-duplicates-allowed/", note: "Extends the same design by mapping values to sets of indices." },
      { title: "Random Pick with Weight", difficulty: "Medium", url: "https://leetcode.com/problems/random-pick-with-weight/", note: "Changes uniform random indexing into weighted random selection." },
    ],
    keyTakeaways: [
      "Use an array list when random access by index is part of the requirement.",
      "Use a hash map to turn value lookup and arbitrary deletion into O(1) expected time.",
      "Swap-with-last deletion keeps the array dense without shifting.",
      "After every mutation, the map must match the array's current indices.",
    ],
    pattern:
      "Hash-backed dense array: store items contiguously for index operations, and store item-to-index mappings for constant-time updates.",
  },
  {
    kind: "problem",
    slug: "arr-lru-cache",
    moduleId: "arr-advanced-hashing",
    order: 27,
    title: "LRU Cache",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/lru-cache/",
    tags: ["Design", "Hash Map", "Linked List", "Cache", "Data Structure"],
    companies: ["Amazon", "Google", "Meta", "Microsoft", "Oracle", "Netflix"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 30,
    statementMD:
      "Design an **LRUCache** with positive capacity. **get(key)** returns the value for **key** if it exists, otherwise **-1**. **put(key, value)** inserts or updates the key. Whenever the cache exceeds capacity, it must evict the least recently used key. Both operations must run in **O(1)** average time.",
    constraints: [
      "1 <= capacity <= 3000",
      "0 <= key <= 10^4",
      "0 <= value <= 10^5",
      "At most 2 * 10^5 calls will be made to get and put",
    ],
    inputMD: "A constructor call **LRUCache(capacity)** followed by a sequence of **get(key)** and **put(key, value)** calls.",
    outputMD: "For the constructor and **put**, output **null**. For **get**, output the stored value or **-1** if the key is missing.",
    examples: [
      {
        input: "operations = [LRUCache, put, put, get, put, get, put, get, get, get], arguments = [[2], [1,1], [2,2], [1], [3,3], [2], [4,4], [1], [3], [4]]",
        output: "[null, null, null, 1, null, -1, null, -1, 3, 4]",
        explanation: "Accessing key 1 makes it most recent. Adding key 3 evicts key 2. Adding key 4 later evicts key 1.",
      },
      {
        input: "operations = [LRUCache, put, put, get, put, put, get], arguments = [[2], [2,1], [2,2], [2], [1,1], [4,1], [2]]",
        output: "[null, null, null, 2, null, null, -1]",
        explanation: "Updating key 2 refreshes it. After key 1 is added, inserting key 4 evicts key 2 because key 1 was more recently inserted.",
      },
    ],
    learningObjectives: [
      "Combine a hash map with a doubly linked list to satisfy lookup and recency requirements.",
      "Maintain most-recent and least-recent positions after every get and put.",
      "Implement O(1) node removal when given a direct node reference.",
      "Explain why a singly linked list or queue alone cannot support all operations efficiently.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThis design has two independent requirements. Finding a key needs a hash map. Evicting the least recently used item and moving an accessed item to most recent need an ordered structure with O(1) removal from the middle. A doubly linked list supplies that second guarantee when the map points directly to list nodes.\n\nThe tempting approach is a hash map plus timestamps or a queue. Timestamps make eviction require a scan or heap cleanup, and a queue cannot remove an updated key from the middle in O(1). The pattern is hash map to node plus a recency list: head means most recent, tail means least recent.",
    commonMistakes: [
      "Refreshing recency on put but forgetting to refresh it on get.",
      "Using a singly linked list, then needing O(n) time to remove a middle node.",
      "Evicting after adding without removing the evicted key from the map.",
      "Not handling updates separately, causing duplicate nodes for the same key.",
    ],
    algorithmMD:
      "**Key idea**\n\nStore each key in a hash map that points to a node in a doubly linked list. Keep dummy **head** and **tail** sentinels so insertion and removal do not need edge-case branches. The node after **head** is most recently used, and the node before **tail** is least recently used.\n\n**Walkthrough**\n\nWith capacity 2, **put(1,1)** creates list **1**. **put(2,2)** moves 2 to the front, so recency is **2, 1**. **get(1)** returns 1 and moves key 1 to the front, making **1, 2**. **put(3,3)** adds 3 at the front, temporarily **3, 1, 2**, then evicts the tail-side key 2. The map and list now contain keys 3 and 1.\n\n**Algorithm**\n\n1. The constructor creates the map and connects dummy **head** directly to dummy **tail**.\n2. For **get(key)**, look up the node. If absent, return **-1**.\n3. If present, detach the node from its current position, insert it after **head**, and return its value.\n4. For **put(key, value)**, if the key exists, update the node's value and move it after **head**.\n5. If the key is new, create a node, add it to the map, and insert it after **head**.\n6. If the map size is now above capacity, remove the node before **tail** and delete its key from the map.",
    solutions: [
      {
        name: "Hash map plus custom doubly linked list",
        approachMD:
          "The map gives direct access to the node for a key. The doubly linked list gives O(1) detach and O(1) insertion at the most-recent end. Dummy sentinels make the list operations uniform.",
        walkthroughMD:
          "1. On every successful get, move the accessed node to the front because it is now most recent.\n2. On put for an existing key, update the value and move that node to the front.\n3. On put for a new key, insert a new node at the front and store it in the map.\n4. If capacity is exceeded, remove the node immediately before the tail sentinel.\n5. Delete the evicted node's key from the map so future lookups correctly miss.",
        complexity: { time: "Average O(1) per get and put", space: "O(capacity)", note: "The map and linked list store at most capacity live nodes." },
        filename: "LRUCache.java",
        code: `import java.util.*;

class LRUCache {
    private final int capacity;
    private final Map<Integer, Node> nodesByKey;
    private final Node head;
    private final Node tail;

    public LRUCache(int capacity) {
        this.capacity = capacity;
        nodesByKey = new HashMap<>();
        head = new Node(0, 0);
        tail = new Node(0, 0);
        head.next = tail;
        tail.prev = head;
    }

    public int get(int key) {
        Node node = nodesByKey.get(key);
        if (node == null) {
            return -1;
        }

        moveToFront(node);
        return node.value;
    }

    public void put(int key, int value) {
        Node node = nodesByKey.get(key);
        if (node != null) {
            node.value = value;
            moveToFront(node);
            return;
        }

        Node created = new Node(key, value);
        nodesByKey.put(key, created);
        addAfterHead(created);

        if (nodesByKey.size() > capacity) {
            Node leastRecent = removeTailNode();
            nodesByKey.remove(leastRecent.key);
        }
    }

    private void moveToFront(Node node) {
        removeNode(node);
        addAfterHead(node);
    }

    private void addAfterHead(Node node) {
        Node first = head.next;
        node.prev = head;
        node.next = first;
        head.next = node;
        first.prev = node;
    }

    private void removeNode(Node node) {
        Node before = node.prev;
        Node after = node.next;
        before.next = after;
        after.prev = before;
    }

    private Node removeTailNode() {
        Node leastRecent = tail.prev;
        removeNode(leastRecent);
        return leastRecent;
    }

    private static class Node {
        private final int key;
        private int value;
        private Node prev;
        private Node next;

        private Node(int key, int value) {
            this.key = key;
            this.value = value;
        }
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "Capacity is **2**. Operations: **put(1,1)**, **put(2,2)**, **get(1)**, **put(3,3)**, **get(2)**.",
      columns: ["operation", "argument", "structure state", "result"],
      rows: [
        ["put", "1,1", "recency = [1], map keys = {1}", "null"],
        ["put", "2,2", "recency = [2, 1], map keys = {1, 2}", "null"],
        ["get", "1", "move 1 to front, recency = [1, 2]", "1"],
        ["put", "3,3", "insert 3 then evict tail 2, recency = [3, 1]", "null"],
        ["get", "2", "2 is absent from the map", "-1"],
      ],
      narrativeMD: "The list order changes on reads as well as writes. That is what makes key 2 the least recently used item when key 3 is inserted.",
    },
    interviewTipsMD:
      "Name the two invariants before coding: the map points to every live node, and the list is ordered from most recent near **head** to least recent near **tail**. Use helper methods for add, remove, and move so the main get and put logic stays small. Interviewers often probe whether get refreshes recency; say yes immediately.",
    followUps: [
      "How would the implementation change with Java **LinkedHashMap** and access order?",
      "How would you implement LFU eviction instead of LRU eviction?",
      "How would you make the cache safe for concurrent readers and writers?",
      "How would you add a time-to-live expiration policy?",
    ],
    similarProblems: [
      { title: "Insert Delete GetRandom O(1)", difficulty: "Medium", slug: "arr-insert-delete-getrandom-o1", note: "Also combines a hash map with a second structure to meet O(1) requirements." },
      { title: "Design HashMap", difficulty: "Easy", slug: "arr-design-hashmap", note: "The lookup component of an LRU cache." },
      { title: "LFU Cache", difficulty: "Hard", url: "https://leetcode.com/problems/lfu-cache/", note: "A harder cache eviction design with frequency buckets." },
      { title: "Design Linked List", difficulty: "Medium", url: "https://leetcode.com/problems/design-linked-list/", note: "Practices the pointer operations used by the recency list." },
      { title: "Design Browser History", difficulty: "Medium", url: "https://leetcode.com/problems/design-browser-history/", note: "Another stateful design problem centered on ordered navigation." },
    ],
    keyTakeaways: [
      "A hash map gives key lookup but not recency order.",
      "A doubly linked list gives O(1) movement and tail eviction when nodes are known.",
      "Successful get and put both make a key most recent.",
      "Capacity overflow evicts the node next to the tail sentinel and removes it from the map.",
    ],
    pattern:
      "Hash map to linked-list node: look up directly by key, mutate recency order in O(1), and evict from the least-recent end.",
  },
  {
    kind: "problem",
    slug: "arr-design-hashmap",
    moduleId: "arr-advanced-hashing",
    order: 28,
    title: "Design HashMap",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/design-hashmap/",
    tags: ["Design", "Hash Map", "Array", "Linked List", "Hashing"],
    companies: ["Amazon", "Google", "Microsoft", "Apple", "Adobe"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 20,
    statementMD:
      "Design a **MyHashMap** without using any built-in hash table libraries. It must support **put(key, value)** to insert or update a mapping, **get(key)** to return the value for a key or **-1** if absent, and **remove(key)** to delete a key if it exists.",
    constraints: [
      "0 <= key <= 10^6",
      "0 <= value <= 10^6",
      "At most 10^4 calls will be made to put, get, and remove",
      "Do not use built-in hash table libraries",
    ],
    inputMD: "A sequence of calls to **MyHashMap**, **put(key, value)**, **get(key)**, and **remove(key)**.",
    outputMD: "For the constructor, **put**, and **remove**, output **null**. For **get**, output the stored value or **-1** if the key is not present.",
    examples: [
      {
        input: "operations = [MyHashMap, put, put, get, get, put, get, remove, get], arguments = [[], [1,1], [2,2], [1], [3], [2,1], [2], [2], [2]]",
        output: "[null, null, null, 1, -1, null, 1, null, -1]",
        explanation: "Key 2 is updated from value 2 to value 1, then removed, so the final lookup misses.",
      },
      {
        input: "operations = [MyHashMap, put, put, get, remove, get, put, get], arguments = [[], [0,7], [1009,8], [0], [0], [0], [1009,9], [1009]]",
        output: "[null, null, null, 7, null, -1, null, 9]",
        explanation: "The map stores independent keys, supports deletion of one key without affecting another, and updates an existing key's value.",
      },
    ],
    learningObjectives: [
      "Implement a hash table using an array of buckets.",
      "Resolve collisions with separate chaining through linked entries.",
      "Distinguish inserting a new key from updating an existing key.",
      "Perform deletion correctly for head, middle, and absent entries in a bucket chain.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nA map needs fast key-to-value lookup, but the key range can be much larger than the number of calls. A direct array of size **10^6 + 1** is possible for this exact constraint, but it hides the real hash table design lesson. The reusable pattern is an array of buckets plus a hash function that maps many possible keys into a manageable index range.\n\nCollisions are unavoidable when multiple keys land in the same bucket. Separate chaining handles that by storing a small linked list of entries in each bucket. Expected O(1) comes from spreading keys across many buckets so each chain stays short.",
    commonMistakes: [
      "Appending a duplicate key instead of updating the existing entry's value.",
      "Removing the head entry incorrectly and losing the rest of the chain.",
      "Assuming the hash function prevents collisions entirely.",
      "Returning a default value such as 0 for missing keys instead of -1.",
    ],
    algorithmMD:
      "**Key idea**\n\nUse a fixed bucket array. Hash each key with **key % bucketCount**. Each bucket points to the head of a linked list of entries containing **key**, **value**, and **next**. Every operation hashes once, then searches only that bucket's chain.\n\n**Walkthrough**\n\nSuppose bucket count is 1009. **put(1,10)** goes to bucket 1 and creates entry **1 -> 10**. **put(1010,20)** also hashes to bucket 1, so it is linked into the same bucket chain. **get(1)** scans that chain and returns 10. **put(1,30)** finds key 1 already present and changes its value to 30 instead of adding another entry. **remove(1010)** relinks around that entry while preserving key 1.\n\n**Algorithm**\n\n1. Create an array of bucket heads.\n2. Compute a bucket index as **key % bucketCount** for every operation.\n3. For **put**, scan the bucket. If the key exists, update its value and stop.\n4. If **put** does not find the key, create a new entry and insert it at the bucket head.\n5. For **get**, scan the bucket and return the matching value, or **-1** if no entry matches.\n6. For **remove**, scan with **previous** and **current** pointers, then unlink the matching entry if found.",
    solutions: [
      {
        name: "Separate chaining hash map",
        approachMD:
          "A bucket array handles hashing, and a linked list in each bucket handles collisions. The implementation stores both key and value in every entry so collisions can be searched and updated correctly.",
        walkthroughMD:
          "1. Hash the key to choose exactly one bucket.\n2. For put, walk the bucket chain looking for the key; update it if found.\n3. If no existing key is found, prepend a new entry to the bucket's chain.\n4. For get, walk the same chain and return the matching value or **-1**.\n5. For remove, track the previous node so the matching entry can be unlinked from the chain.",
        complexity: { time: "Expected O(1) per operation, O(k) within one bucket", space: "O(B + n)", note: "B is the fixed bucket count and n is the number of stored keys." },
        filename: "MyHashMap.java",
        code: `import java.util.*;

class MyHashMap {
    private static final int SIZE = 1009;
    private final Entry[] buckets;

    public MyHashMap() {
        buckets = new Entry[SIZE];
    }

    public void put(int key, int value) {
        int bucketIndex = index(key);
        Entry current = buckets[bucketIndex];

        while (current != null) {
            if (current.key == key) {
                current.value = value;
                return;
            }
            current = current.next;
        }

        Entry entry = new Entry(key, value);
        entry.next = buckets[bucketIndex];
        buckets[bucketIndex] = entry;
    }

    public int get(int key) {
        Entry current = buckets[index(key)];

        while (current != null) {
            if (current.key == key) {
                return current.value;
            }
            current = current.next;
        }

        return -1;
    }

    public void remove(int key) {
        int bucketIndex = index(key);
        Entry previous = null;
        Entry current = buckets[bucketIndex];

        while (current != null) {
            if (current.key == key) {
                if (previous == null) {
                    buckets[bucketIndex] = current.next;
                } else {
                    previous.next = current.next;
                }
                return;
            }

            previous = current;
            current = current.next;
        }
    }

    private int index(int key) {
        return key % SIZE;
    }

    private static class Entry {
        private final int key;
        private int value;
        private Entry next;

        private Entry(int key, int value) {
            this.key = key;
            this.value = value;
        }
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "Use a bucket array with chaining. Operations: **put(1,10)**, **put(1010,20)**, **get(1)**, **put(1,30)**, **remove(1010)**.",
      columns: ["operation", "argument", "structure state", "result"],
      rows: [
        ["put", "1,10", "bucket 1 contains 1:10", "null"],
        ["put", "1010,20", "bucket 1 contains 1010:20 -> 1:10", "null"],
        ["get", "1", "scan bucket 1 and find 1:10", "10"],
        ["put", "1,30", "update existing entry, bucket 1 contains 1010:20 -> 1:30", "null"],
        ["remove", "1010", "unlink head, bucket 1 contains 1:30", "null"],
      ],
      narrativeMD: "The collision does not break correctness because every entry keeps its original key and the chain is searched by key equality.",
    },
    interviewTipsMD:
      "Clarify whether the interviewer wants the educational hash table design or the direct-address array shortcut. For this course, use separate chaining because it demonstrates real collision handling. While coding, say that updates must search before insertion, and removals need to handle deleting the first entry in a bucket.",
    followUps: [
      "How would you resize and rehash when the load factor becomes too high?",
      "How would open addressing with linear probing change deletion?",
      "How would you support negative keys?",
      "How would you make this generic over key and value types?",
    ],
    similarProblems: [
      { title: "Design HashSet", difficulty: "Easy", slug: "arr-design-hashset", note: "The key-only version of the same bucket and chaining design." },
      { title: "LRU Cache", difficulty: "Medium", slug: "arr-lru-cache", note: "Uses a built-in map concept as one component of a cache design." },
      { title: "Two Sum", difficulty: "Easy", slug: "arr-two-sum", note: "A practical use case for key-to-value lookup." },
      { title: "Design Twitter", difficulty: "Medium", url: "https://leetcode.com/problems/design-twitter/", note: "A larger design problem built around maps, sets, and ordered data." },
    ],
    keyTakeaways: [
      "A hash map is an array of buckets plus collision handling.",
      "Separate chaining stores colliding keys in a linked list at the same bucket.",
      "Put must update an existing key instead of adding a duplicate.",
      "Remove must relink the bucket chain without damaging unrelated entries.",
    ],
    pattern:
      "Bucketed hash table with separate chaining: hash to one bucket, then search or mutate only that bucket's linked entries.",
  },
  {
    kind: "problem",
    slug: "arr-design-hashset",
    moduleId: "arr-advanced-hashing",
    order: 29,
    title: "Design HashSet",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/design-hashset/",
    tags: ["Design", "Hash Set", "Array", "Linked List", "Hashing"],
    companies: ["Amazon", "Google", "Microsoft", "Adobe", "Bloomberg"],
    estimatedReadingMin: 7,
    estimatedSolvingMin: 18,
    statementMD:
      "Design a **MyHashSet** without using any built-in hash table libraries. It must support **add(key)**, **remove(key)**, and **contains(key)**. **add** stores a key if it is not already present, **remove** deletes it if present, and **contains** reports whether the key is currently stored.",
    constraints: [
      "0 <= key <= 10^6",
      "At most 10^4 calls will be made to add, remove, and contains",
      "Do not use built-in hash table libraries",
    ],
    inputMD: "A sequence of calls to **MyHashSet**, **add(key)**, **remove(key)**, and **contains(key)**.",
    outputMD: "For the constructor, **add**, and **remove**, output **null**. For **contains**, output **true** or **false**.",
    examples: [
      {
        input: "operations = [MyHashSet, add, add, contains, contains, add, contains, remove, contains], arguments = [[], [1], [2], [1], [3], [2], [2], [2], [2]]",
        output: "[null, null, null, true, false, null, true, null, false]",
        explanation: "Adding key 2 twice still stores one copy. After removing 2, contains returns false.",
      },
      {
        input: "operations = [MyHashSet, contains, add, contains, remove, contains, remove], arguments = [[], [42], [42], [42], [42], [42], [42]]",
        output: "[null, false, null, true, null, false, null]",
        explanation: "The set initially misses 42, stores it after add, and safely ignores removing it again after it is gone.",
      },
    ],
    learningObjectives: [
      "Implement set membership with a bucket array and separate chaining.",
      "Prevent duplicate keys from being inserted into the same set.",
      "Handle collisions by searching a linked list inside one bucket.",
      "Delete keys from a chain while preserving other keys that share the bucket.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nA set only needs membership, not associated values. The hashing signal is the same as a map: keys come from a large range, operations must be fast, and built-in hash tables are disallowed. Use a hash function to route each key to one bucket, then handle collisions inside that bucket.\n\nCompared with **MyHashMap**, each node stores only a key. That makes the design simpler, but the invariants are the same: no duplicate keys in a bucket chain, and every remove must unlink only the matching key.",
    commonMistakes: [
      "Adding the same key multiple times and creating duplicate nodes.",
      "Assuming two keys with the same bucket index are the same key.",
      "Removing a key by clearing the whole bucket and deleting unrelated colliding keys.",
      "Forgetting that removing an absent key should be a no-op.",
    ],
    algorithmMD:
      "**Key idea**\n\nUse an array of bucket heads. Compute **key % bucketCount** to choose a bucket. Each bucket is a linked list of keys that hash to that index. Membership, insertion, and deletion only inspect that one chain.\n\n**Walkthrough**\n\nWith bucket count 1009, **add(1)** puts key 1 into bucket 1. **add(1010)** also lands in bucket 1, so it is linked next to key 1 instead of overwriting it. **contains(1)** scans bucket 1 and finds 1. **remove(1010)** unlinks only 1010, leaving key 1 in the same bucket. A later **contains(1010)** returns false.\n\n**Algorithm**\n\n1. Create a fixed-size array of bucket heads.\n2. For every operation, compute **bucketIndex = key % bucketCount**.\n3. For **contains**, scan the selected bucket chain for the key.\n4. For **add**, first call the same search logic; if the key already exists, stop.\n5. If the key is new, prepend a node to the selected bucket.\n6. For **remove**, scan with previous and current pointers and unlink the matching node if found.",
    solutions: [
      {
        name: "Separate chaining hash set",
        approachMD:
          "The bucket array provides the first level of lookup, and each bucket chain stores keys that collide. Before adding, the chain is searched to preserve set semantics: one key appears at most once.",
        walkthroughMD:
          "1. Hash the key to choose its bucket.\n2. For contains, walk that bucket's nodes until the key is found or the chain ends.\n3. For add, reuse membership search and return immediately if the key already exists.\n4. If absent, create a new node and link it at the bucket head.\n5. For remove, walk the chain with a previous pointer and unlink only the matching node.",
        complexity: { time: "Expected O(1) per operation, O(k) within one bucket", space: "O(B + n)", note: "B is the bucket count and n is the number of stored keys." },
        filename: "MyHashSet.java",
        code: `import java.util.*;

class MyHashSet {
    private static final int SIZE = 1009;
    private final Node[] buckets;

    public MyHashSet() {
        buckets = new Node[SIZE];
    }

    public void add(int key) {
        int bucketIndex = index(key);
        Node current = buckets[bucketIndex];

        while (current != null) {
            if (current.key == key) {
                return;
            }
            current = current.next;
        }

        Node node = new Node(key);
        node.next = buckets[bucketIndex];
        buckets[bucketIndex] = node;
    }

    public void remove(int key) {
        int bucketIndex = index(key);
        Node previous = null;
        Node current = buckets[bucketIndex];

        while (current != null) {
            if (current.key == key) {
                if (previous == null) {
                    buckets[bucketIndex] = current.next;
                } else {
                    previous.next = current.next;
                }
                return;
            }

            previous = current;
            current = current.next;
        }
    }

    public boolean contains(int key) {
        Node current = buckets[index(key)];

        while (current != null) {
            if (current.key == key) {
                return true;
            }
            current = current.next;
        }

        return false;
    }

    private int index(int key) {
        return key % SIZE;
    }

    private static class Node {
        private final int key;
        private Node next;

        private Node(int key) {
            this.key = key;
        }
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "Use separate chaining. Operations: **add(1)**, **add(1010)**, **contains(1)**, **remove(1010)**, **contains(1010)**.",
      columns: ["operation", "argument", "structure state", "result"],
      rows: [
        ["add", "1", "bucket 1 contains 1", "null"],
        ["add", "1010", "bucket 1 contains 1010 -> 1", "null"],
        ["contains", "1", "scan bucket 1 and find 1", "true"],
        ["remove", "1010", "unlink head, bucket 1 contains 1", "null"],
        ["contains", "1010", "scan bucket 1 and do not find 1010", "false"],
      ],
      narrativeMD: "Colliding keys share a bucket but remain distinct because every node stores the original key and comparisons use equality.",
    },
    interviewTipsMD:
      "State that this is the key-only form of a hash table. The main edge cases are duplicate add, absent remove, and removing the first node in a bucket chain. If the interviewer asks why not allocate a huge boolean array, explain that direct addressing is constraint-specific, while hashing and chaining is the reusable implementation strategy.",
    followUps: [
      "How would you resize the set when too many keys collide?",
      "How would open addressing change contains and remove?",
      "How would you implement iteration over all keys in the set?",
      "How would you adapt this set to store generic object keys?",
    ],
    similarProblems: [
      { title: "Design HashMap", difficulty: "Easy", slug: "arr-design-hashmap", note: "Adds values to the same bucket and chaining idea." },
      { title: "Contains Duplicate", difficulty: "Easy", slug: "arr-contains-duplicate", note: "A common application of set membership." },
      { title: "Two Sum", difficulty: "Easy", slug: "arr-two-sum", note: "Uses hash membership to answer complement queries quickly." },
      { title: "Happy Number", difficulty: "Easy", url: "https://leetcode.com/problems/happy-number/", note: "Uses a set to detect repeated states in a process." },
    ],
    keyTakeaways: [
      "A hash set stores keys only; no value field is needed.",
      "Collisions require searching a bucket chain by actual key equality.",
      "Add must be idempotent: adding an existing key does not create another node.",
      "Remove should change only the matching node and leave colliding keys intact.",
    ],
    pattern:
      "Hash set with separate chaining: hash each key to a bucket, search the bucket for membership, and mutate only that chain.",
  },
];
