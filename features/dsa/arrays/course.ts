import type { DsaCourseMeta } from "../types";

/** Landing-page metadata for the Arrays & Hashing course. */
export const ARR_COURSE_META: DsaCourseMeta = {
  topic: "arrays",
  title: "Arrays & Hashing",
  subtitle:
    "The bedrock of coding interviews: turn linear scans, prefix sums, and hash lookups into instant answers.",
  descriptionMD:
    "This is a premium interview-preparation course on the two data structures every other topic is built on: the **array** and the **hash table**. Most interview problems reduce to one question — can you avoid re-computing something you already know? Arrays let you scan and transform in place; a **prefix sum** turns any range query into two lookups; a **frequency map** or **hash set** trades a little memory for O(1) membership and counting, collapsing an O(n^2) search into O(n). You will start with the mental models (how dynamic arrays amortise growth, why hashing is expected O(1), how collisions are handled), then work through curated problems grouped by the patterns interviewers actually test: prefix sums, frequency maps, in-place array transformations, and hash-backed data-structure design. Every lesson recognises the pattern first, dry-runs a concrete example, then shows a clean Java 17 implementation.",
  objectives: [
    "Recognise when a prefix sum or difference array replaces repeated range work with O(1) lookups.",
    "Reach for a hash map or set the moment a problem needs membership, counting, or grouping in O(1).",
    "Transform arrays in place — marking, sign tricks, and index-as-hash — to hit O(1) extra space.",
    "Design hash-backed structures (LRU, RandomizedSet, HashMap) that combine maps with arrays or lists.",
  ],
  skills: [
    "Prefix & difference arrays",
    "Frequency maps",
    "Hash set membership",
    "In-place transformation",
    "Index-as-hash",
    "Hash-backed design",
  ],
  accent: "blue",
};
