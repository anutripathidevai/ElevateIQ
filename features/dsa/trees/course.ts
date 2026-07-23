import type { DsaCourseMeta } from "../types";

/** Landing-page metadata for the Trees & BST course. */
export const TREE_COURSE_META: DsaCourseMeta = {
  topic: "tree",
  title: "Trees & BST",
  subtitle:
    "Think recursively: every tree problem is the same question asked of a node and its two children.",
  descriptionMD:
    "This is a premium interview-preparation course on the data structure that shows up in more interviews than any other: the **binary tree**, and its ordered cousin the **binary search tree**. Trees reward a single mental shift — stop thinking about the whole structure and start thinking about one node, its left subtree, and its right subtree. Almost every problem here is solved by asking what a node needs from its children (a bottom-up **depth-first** pass) or what it needs to pass down (a top-down pass), or by sweeping the tree one level at a time (**breadth-first**). You will start with the vocabulary — nodes, height, depth, balance, and the four traversal orders — then work through curated problems grouped by the patterns interviewers test: DFS traversals, BFS level-order, the BST ordering invariant, recursive subtree aggregation, rebuilding a tree from its traversals, and advanced problems that combine these ideas. Every lesson visualises the recursion or the level sweep on a concrete tree before showing a clean Java 17 solution.",
  objectives: [
    "Choose DFS (preorder, inorder, postorder) or BFS level-order based on what each node needs.",
    "Turn a recursive definition into code: base case, recurse on children, combine results.",
    "Exploit the BST ordering invariant to search, insert, delete, and validate in O(h).",
    "Rebuild trees from traversal orders and serialize them for transport.",
  ],
  skills: [
    "Recursion on trees",
    "DFS traversals",
    "BFS / level-order",
    "BST invariants",
    "Subtree aggregation",
    "Tree construction",
  ],
  accent: "emerald",
};
