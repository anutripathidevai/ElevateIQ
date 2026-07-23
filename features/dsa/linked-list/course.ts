import type { DsaCourseMeta } from "../types";

/** Landing-page metadata for the Linked List course. */
export const LL_COURSE_META: DsaCourseMeta = {
  topic: "linked-list",
  title: "Linked List",
  subtitle:
    "Pointer surgery done cleanly: reverse, detect cycles, and merge lists without ever losing the thread.",
  descriptionMD:
    "This is a premium interview-preparation course on the data structure that separates people who are comfortable with pointers from people who are not. A **linked list** trades O(1) random access for O(1) splicing — you can insert, delete, and rearrange nodes just by rewiring **next** (and **prev**) references, without shifting anything. The catch is that a single dropped pointer loses the rest of the list, so the whole game is manipulating references in the right order. You will start with the mental models (singly, doubly, and circular lists, the fast and slow pointer, and the dummy-node trick that removes edge cases), then work through curated problems grouped by the patterns interviewers actually test: in-place reversal, cycle detection, k-group and pair reversal, merging and sorting, and advanced pointer-heavy design. Every lesson visualises the pointers, dry-runs a concrete example, then shows a clean Java 17 implementation.",
  objectives: [
    "Rewire next and prev pointers in the correct order so no node is ever orphaned.",
    "Apply the fast and slow pointer to find midpoints, detect cycles, and locate cycle entries.",
    "Use a dummy head to make insertions, deletions, and merges edge-case free.",
    "Reverse sublists, k-groups, and pairs in place with O(1) extra space.",
  ],
  skills: [
    "Pointer manipulation",
    "Fast & slow pointer",
    "Dummy-node technique",
    "In-place reversal",
    "Merging & sorting",
    "Cycle detection",
  ],
  accent: "rose",
};
