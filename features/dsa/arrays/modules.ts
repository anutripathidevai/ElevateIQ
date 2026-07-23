import type { DsaModule } from "../types";

/**
 * The 6 modules of the Arrays & Hashing course, in learning order. Modules 1–2
 * are concept lessons (the array and hashing mental models); modules 3–6 are
 * curated interview problems grouped by pattern. Lesson content lives in `data/`
 * keyed by these slugs; the course API joins the two.
 */
export const ARR_MODULES: DsaModule[] = [
  {
    id: "arr-fundamentals",
    order: 1,
    title: "Arrays Fundamentals",
    summary:
      "How arrays store and resize data, the true cost of each operation, and the prefix-sum and difference-array tricks that answer range questions in O(1).",
    pattern: "Scan, prefix-sum, and count in place",
    lessonSlugs: [
      "arr-array-basics",
      "arr-static-vs-dynamic",
      "arr-time-complexities",
      "arr-common-patterns",
      "arr-prefix-sum",
      "arr-difference-array",
      "arr-frequency-counting",
    ],
  },
  {
    id: "arr-hashing-fundamentals",
    order: 2,
    title: "HashMap & HashSet Fundamentals",
    summary:
      "Why hashing gives expected O(1) lookups, how collisions are resolved, and when to choose a map over a set.",
    pattern: "Trade memory for O(1) lookup",
    lessonSlugs: [
      "arr-hash-functions",
      "arr-collision-handling",
      "arr-hashmap-vs-hashset",
      "arr-hashing-common-patterns",
    ],
  },
  {
    id: "arr-prefix-sum",
    order: 3,
    title: "Prefix Sum Pattern",
    summary:
      "Precompute cumulative sums so any range or subarray-sum question becomes a constant-time lookup or a single hash-map pass.",
    pattern: "Prefix sums + hash map of seen sums",
    lessonSlugs: [
      "arr-running-sum-of-1d-array",
      "arr-range-sum-query",
      "arr-subarray-sum-equals-k",
      "arr-continuous-subarray-sum",
    ],
  },
  {
    id: "arr-frequency-map",
    order: 4,
    title: "Frequency Map Pattern",
    summary:
      "Use a hash map or set to count, look up complements, and group items — the workhorse pattern behind Two Sum and anagram problems.",
    pattern: "Hash map for counts, complements, grouping",
    lessonSlugs: [
      "arr-two-sum",
      "arr-contains-duplicate",
      "arr-top-k-frequent-elements",
      "arr-group-anagrams",
      "arr-valid-anagram",
    ],
  },
  {
    id: "arr-advanced-arrays",
    order: 5,
    title: "Advanced Arrays",
    summary:
      "In-place transformations and index tricks: prefix/suffix products, using the array as its own hash, and rotating a matrix without extra space.",
    pattern: "In-place marking and index-as-hash",
    lessonSlugs: [
      "arr-product-of-array-except-self",
      "arr-first-missing-positive",
      "arr-longest-consecutive-sequence",
      "arr-set-matrix-zeroes",
      "arr-rotate-image",
    ],
  },
  {
    id: "arr-advanced-hashing",
    order: 6,
    title: "Advanced Hashing",
    summary:
      "Design problems that combine a hash map with an array or linked list to hit O(1) operations — RandomizedSet, LRU cache, and building a hash table from scratch.",
    pattern: "Hash map + array/list for O(1) design",
    lessonSlugs: [
      "arr-insert-delete-getrandom-o1",
      "arr-lru-cache",
      "arr-design-hashmap",
      "arr-design-hashset",
    ],
  },
];
