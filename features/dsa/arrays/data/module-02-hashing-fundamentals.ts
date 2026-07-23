import type { DsaConceptLesson } from "../../types";

export const CONCEPTS: DsaConceptLesson[] = [
  {
    kind: "concept",
    slug: "arr-hash-functions",
    moduleId: "arr-hashing-fundamentals",
    order: 8,
    title: "Hash Functions",
    estimatedReadingMin: 8,
    tags: ["Hashing", "Hash Functions", "Java", "Complexity"],
    summaryMD:
      "A hash function converts a key into a stable numeric hash so an array-backed table can jump directly to the bucket where that key should live.",
    sections: [
      {
        heading: "From Key to Bucket",
        bodyMD:
          "A hash table is built on top of an array. The hash function is the bridge between the key you care about and the array index the implementation can access quickly. Given a key such as an integer, string, or object, the table computes a hash value, mixes it, and maps it to a bucket index.\n\nThe goal is not to sort keys or preserve their original meaning. The goal is to distribute keys across buckets so lookup can inspect a small local area instead of scanning the whole collection. That is why a HashMap can usually answer **containsKey(x)** or **get(x)** in expected **O(1)** time.",
      },
      {
        heading: "Properties of a Good Hash",
        bodyMD:
          "A good hash function is **deterministic**, **uniform**, and **fast**. Deterministic means the same key produces the same hash whenever the table asks for it. Uniform means common inputs spread broadly across buckets rather than clustering in a few locations. Fast means hashing is cheap enough that it does not dominate the cost of the operation.\n\nUniformity matters because a hash table is only as balanced as its buckets. If many unrelated keys map to the same bucket, lookup begins to look like a local search inside that bucket. In interviews, this is the reason hash-table operations are called expected **O(1)** rather than guaranteed **O(1)** for every possible input.",
      },
      {
        heading: "Java hashCode and equals",
        bodyMD:
          "Java separates identity into two methods: **hashCode()** chooses the bucket family, and **equals()** confirms whether two keys are actually the same key. The required contract is: if **a.equals(b)** is true, then **a.hashCode() == b.hashCode()** must also be true. The reverse is not required, because different keys are allowed to collide.\n\nThis contract is a correctness rule, not a performance detail. If two equal objects produce different hashes, a HashMap may store them in different buckets and fail to find an existing key. If many unequal objects produce the same hash, the map can still be correct, but it becomes slower because collisions increase.",
      },
      {
        heading: "Bucket Index and Capacity",
        bodyMD:
          "Many hash tables keep the internal array capacity as a power of two. That allows the bucket index to be computed with **index = hash & (capacity - 1)**, which is a fast way to keep only the low bits that fit inside the current array. The implementation may also mix the hash first so information from high bits can affect the final bucket.\n\nThe number of filled entries compared with the number of buckets is the **load factor**. A load factor near zero wastes memory but makes collisions rare. A high load factor saves memory but increases bucket crowding. Java HashMap commonly resizes when the table grows past its threshold, trading occasional rehashing work for consistently low expected lookup cost.",
      },
    ],
    codeExamples: [
      {
        title: "Object keys need matching hashCode and equals",
        language: "java",
        code: `import java.util.Objects;

class GridPoint {
    private final int row;
    private final int col;

    GridPoint(int row, int col) {
        this.row = row;
        this.col = col;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof GridPoint)) {
            return false;
        }
        GridPoint that = (GridPoint) other;
        return row == that.row && col == that.col;
    }

    @Override
    public int hashCode() {
        return Objects.hash(row, col);
    }
}`,
        captionMD:
          "When custom objects become map keys or set elements, **equals()** defines key equality and **hashCode()** must agree with it.",
      },
    ],
    keyTakeaways: [
      "A hash function maps a key to a numeric hash, then the table maps that hash to a bucket index.",
      "Good hashes are deterministic, uniform enough for the input distribution, and fast to compute.",
      "In Java, equal keys must have equal hash codes, while unequal keys may still collide.",
      "Load factor controls the memory versus collision trade-off and triggers resizing when the table gets crowded.",
    ],
  },
  {
    kind: "concept",
    slug: "arr-collision-handling",
    moduleId: "arr-hashing-fundamentals",
    order: 9,
    title: "Collision Handling",
    estimatedReadingMin: 8,
    tags: ["Hashing", "Collisions", "HashMap", "Complexity"],
    summaryMD:
      "Collision handling is the set of strategies a hash table uses when two different keys map to the same bucket.",
    sections: [
      {
        heading: "Why Collisions Are Inevitable",
        bodyMD:
          "A collision happens when two distinct keys land in the same bucket. Collisions are not a sign that hashing is broken. They are unavoidable because the universe of possible keys is usually much larger than the number of buckets in the table.\n\nThe important question is how the table behaves after the collision. A strong hash table keeps collisions local, resolves them predictably, and resizes before bucket crowding becomes the normal case. That is what preserves expected **O(1)** insert, lookup, and delete.",
      },
      {
        heading: "Separate Chaining",
        bodyMD:
          "Separate chaining stores a small collection at each bucket. If several keys map to the same bucket, the table searches only that bucket collection and uses equality checks to find the exact key. Conceptually, each bucket can be a linked list of entries.\n\nJava HashMap uses chaining, and since Java 8, very crowded buckets can be converted into balanced trees under specific conditions. This treeification reduces the impact of pathological collision chains, but it is a safety mechanism rather than the expected everyday path. In normal use, good hashing and resizing keep bucket sizes small.",
      },
      {
        heading: "Open Addressing",
        bodyMD:
          "Open addressing stores entries directly inside the bucket array. When a bucket is occupied by a different key, the table probes other positions according to a rule. Linear probing checks nearby buckets in sequence. Quadratic probing jumps by growing offsets. Other variants use a second hash to choose the probe step.\n\nThe trade-off is locality versus clustering. Open addressing can be memory efficient and cache friendly because entries live in one array, but high load factors make probe sequences longer. Deletion also needs care, because removing an entry must not break the search path for keys inserted later.",
      },
      {
        heading: "Resizing and Rehashing",
        bodyMD:
          "As the table fills, collisions become more frequent. Resizing allocates a larger bucket array and reassigns existing entries to new bucket positions. This is often called rehashing because bucket indices depend on the current capacity, even if each key hash stays the same.\n\nThe resize itself costs **O(n)** for the entries moved, but it happens occasionally. Spread across many operations, that cost is amortized, so individual operations remain expected **O(1)**. This is why interview answers can safely use HashMap and HashSet for linear-time algorithms while still acknowledging occasional resizing.",
      },
      {
        heading: "Worst-Case Behavior",
        bodyMD:
          "The expected bound assumes the keys are reasonably distributed. If many keys collide into the same bucket or probe cluster, operations can degrade. With simple chaining, a lookup through one long bucket can be **O(n)**. With open addressing, a nearly full table can require many probes.\n\nIn interviews, mention the expected and worst case precisely: hash tables give expected **O(1)** operations with good hashing and controlled load factor, but adversarial collisions can make operations **O(n)** unless the implementation has extra protections.",
      },
    ],
    keyTakeaways: [
      "Collisions are inevitable because many possible keys share a finite bucket array.",
      "Separate chaining keeps a per-bucket collection, while open addressing probes alternative positions in the same array.",
      "Resizing and rehashing keep load factor under control, preserving expected **O(1)** operations over time.",
      "Many collisions can still degrade performance to **O(n)** in the worst case.",
    ],
  },
  {
    kind: "concept",
    slug: "arr-hashmap-vs-hashset",
    moduleId: "arr-hashing-fundamentals",
    order: 10,
    title: "HashMap vs HashSet",
    estimatedReadingMin: 7,
    tags: ["HashMap", "HashSet", "Java", "Pattern Choice"],
    summaryMD:
      "HashMap stores a value for each key, while HashSet stores only distinct keys, so the right choice depends on whether you need associated information or only membership.",
    sections: [
      {
        heading: "The Data Model Difference",
        bodyMD:
          "A HashMap stores **key -> value** pairs. The key is used for hashing and equality, and the value is the information attached to that key. In array interviews, common values include counts, last seen indices, first seen indices, lists of grouped words, or prefix-sum frequencies.\n\nA HashSet stores keys only. It answers questions like whether an item has appeared before, whether a value is forbidden, or whether a candidate exists in a precomputed collection. If you never need extra information beyond presence, a set is usually the clearer and lighter abstraction.",
      },
      {
        heading: "Operations and Complexity",
        bodyMD:
          "Both HashMap and HashSet provide expected **O(1)** insertion, lookup, and removal under normal hashing assumptions. For a map, the common operations are **put**, **get**, **containsKey**, and **remove**. For a set, the common operations are **add**, **contains**, and **remove**.\n\nThe important interview habit is to name what the structure stores. Saying use a hash table is less precise than saying use a map from value to frequency or use a set of values already seen. That precision often reveals the invariant and prevents accidental overwrites.",
      },
      {
        heading: "When to Use Each",
        bodyMD:
          "Use a HashSet when the problem is about **membership**, **deduplication**, or **seen before** checks. Contains Duplicate, longest consecutive sequence membership, and visited-state tracking are classic examples. The set represents a yes-or-no fact for each key.\n\nUse a HashMap when the problem needs a value attached to each key. Two Sum needs value to index, frequency counting needs value to count, anagram grouping needs canonical key to list of strings, and prefix-sum counting needs sum to number of previous occurrences. The map represents a relationship, not just existence.",
      },
      {
        heading: "Useful Variants",
        bodyMD:
          "Java provides variants when ordinary hashing is not enough. LinkedHashMap maintains insertion order and can also maintain access order, which is why it is useful for LRU cache designs. It still has hash-table style expected lookup while adding a predictable iteration order.\n\nTreeMap is different: it stores keys in sorted order and gives operations in **O(log n)** time. Use it when the interview problem needs ordered queries such as nearest smaller key, range iteration, or sorted traversal. Do not use TreeMap just because it sounds more powerful; the logarithmic cost is unnecessary for plain membership and counting.",
      },
    ],
    codeExamples: [
      {
        title: "Counting with HashMap and membership with HashSet",
        language: "java",
        code: `import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

class Solution {
    public int countTarget(int[] nums, int target) {
        Map<Integer, Integer> frequency = new HashMap<>();
        for (int num : nums) {
            frequency.put(num, frequency.getOrDefault(num, 0) + 1);
        }
        return frequency.getOrDefault(target, 0);
    }

    public boolean containsDuplicate(int[] nums) {
        Set<Integer> seen = new HashSet<>();
        for (int num : nums) {
            if (!seen.add(num)) {
                return true;
            }
        }
        return false;
    }
}`,
        captionMD:
          "The map keeps a count per value. The set only records whether each value has appeared.",
      },
    ],
    keyTakeaways: [
      "Use HashSet for membership, deduplication, and seen-before checks.",
      "Use HashMap when each key needs an attached value such as a count, index, list, or cached answer.",
      "Both structures provide expected **O(1)** add and contains behavior with good hashing.",
      "LinkedHashMap adds predictable order, while TreeMap adds sorted keys at **O(log n)** cost.",
    ],
  },
  {
    kind: "concept",
    slug: "arr-hashing-common-patterns",
    moduleId: "arr-hashing-fundamentals",
    order: 11,
    title: "Common Hashing Interview Patterns",
    estimatedReadingMin: 9,
    tags: ["Hashing", "Patterns", "Arrays", "Interview Framework"],
    summaryMD:
      "Most hashing interview problems reduce a scan from quadratic to linear by storing exactly the past information needed to answer the current question.",
    sections: [
      {
        heading: "The Core Pattern",
        bodyMD:
          "Hashing is most powerful when the brute-force solution repeatedly asks the same lookup question. Instead of scanning all previous items for each current item, store a searchable summary of the past. Then each new element can ask the hash table for the one fact it needs.\n\nThe mental move is: what would I search for in the left side if I were doing the slow solution? That searched-for thing often becomes the hash key. The attached value, if any, is whatever information the future needs after the match is found.",
      },
      {
        heading: "Complement Lookup",
        bodyMD:
          "The signal for complement lookup is a target relationship between two values. In Two Sum, when the current number is **x**, the missing earlier value is **target - x**. A map from value to index lets the scan answer whether that complement already appeared.\n\nThe ordering matters. Usually you check for the complement before inserting the current value so an element is not paired with itself. This pattern also appears in pair counts, fixed-difference questions, and problems where the current item determines exactly which previous key would complete the answer.",
      },
      {
        heading: "Frequency, Membership, and Dedup",
        bodyMD:
          "Frequency counting is the right signal when the problem asks for most common, exactly once, same multiset, or how many occurrences. The key is the item being counted, and the value is its count. Valid Anagram, Top K Frequent Elements, and many voting-style array tasks start with this move.\n\nMembership and deduplication use a set when counts do not matter. The signal is any phrasing like already seen, exists, unique, duplicate, or visited. A set is also useful as a precomputation step: load all values, then test candidate neighbors or complements in expected **O(1)** time.",
      },
      {
        heading: "Canonical Grouping and Prefix Sums",
        bodyMD:
          "Grouping by a canonical key appears when different raw inputs should be treated as equivalent. Group Anagrams converts each word into a canonical representation, then maps that representation to all words with the same signature. The key design is the whole problem: sorted letters, character counts, or another stable signature.\n\nPrefix-sum plus hashmap appears when the question asks about subarrays with a target sum. If the current prefix is **sum**, then a previous prefix **sum - k** marks a subarray ending here with sum **k**. The map stores how many times each previous prefix has occurred, not just whether it occurred, because multiple starts can lead to multiple valid subarrays.",
      },
      {
        heading: "Caching and Memoization",
        bodyMD:
          "Caching is the hashing pattern for repeated expensive questions. The signal is that the same input state or computed key can be requested more than once. A map from state to answer turns repeated work into a lookup.\n\nThis can appear inside dynamic programming, graph search, string processing, and design problems. In arrays and hashing interviews, it often shows up as memoizing normalized forms, caching expensive transformations, or building an LRU-style structure where HashMap lookup is paired with another structure that maintains order.",
      },
    ],
    codeExamples: [
      {
        title: "Complement lookup for Two Sum",
        language: "java",
        code: `import java.util.HashMap;
import java.util.Map;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> indexByValue = new HashMap<>();

        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (indexByValue.containsKey(complement)) {
                return new int[] { indexByValue.get(complement), i };
            }
            indexByValue.put(nums[i], i);
        }

        return new int[] { -1, -1 };
    }
}`,
        captionMD:
          "Each step asks whether the exact value needed to pair with the current number has already appeared.",
      },
    ],
    keyTakeaways: [
      "Use complement lookup when the current item determines the exact previous key that would complete a target relationship.",
      "Use frequency maps for counts and multisets; use sets for membership, deduplication, and visited checks.",
      "Use canonical keys when different inputs should be grouped as equivalent, such as anagrams.",
      "Use prefix-sum maps and caches when the answer depends on repeated historical states rather than only raw elements.",
    ],
  },
];
