import type { DsaModule } from "../types";

/**
 * The 7 modules of the Trees & BST course, in learning order. Module 1 is
 * concept lessons (the vocabulary and traversal orders); modules 2–7 are
 * curated interview problems grouped by pattern. Lesson content lives in
 * `data/` keyed by these slugs; the course API joins the two.
 */
export const TREE_MODULES: DsaModule[] = [
  {
    id: "tree-fundamentals",
    order: 1,
    title: "Tree Fundamentals",
    summary:
      "The vocabulary every tree problem assumes: binary trees, the BST ordering invariant, height vs depth, balance, and the four traversal orders.",
    pattern: "One node, a left subtree, and a right subtree",
    lessonSlugs: [
      "tree-binary-tree",
      "tree-bst",
      "tree-height",
      "tree-depth",
      "tree-balanced-tree",
      "tree-traversals",
    ],
  },
  {
    id: "tree-dfs",
    order: 2,
    title: "DFS Traversals",
    summary:
      "Depth-first order in code: inorder, preorder, and postorder, plus the postorder combine step that computes a subtree's height.",
    pattern: "Recurse left, visit, recurse right (reorder as needed)",
    lessonSlugs: [
      "tree-inorder-traversal",
      "tree-preorder-traversal",
      "tree-postorder-traversal",
      "tree-maximum-depth",
    ],
  },
  {
    id: "tree-bfs",
    order: 3,
    title: "BFS Pattern",
    summary:
      "Sweep the tree one level at a time with a queue: level order, zigzag, the rightmost node per level, and per-level aggregates.",
    pattern: "Queue holds one level; process it, enqueue the next",
    lessonSlugs: [
      "tree-level-order-traversal",
      "tree-zigzag-level-order",
      "tree-right-side-view",
      "tree-average-of-levels",
    ],
  },
  {
    id: "tree-bst-pattern",
    order: 4,
    title: "BST Pattern",
    summary:
      "Use the left-smaller / right-larger invariant to validate, search, insert, delete, and find a lowest common ancestor in O(h).",
    pattern: "Compare with the node, then go left or right",
    lessonSlugs: [
      "tree-validate-bst",
      "tree-search-in-bst",
      "tree-insert-into-bst",
      "tree-delete-node-in-bst",
      "tree-lca-bst",
    ],
  },
  {
    id: "tree-recursive",
    order: 5,
    title: "Recursive Tree Problems",
    summary:
      "Aggregate information from subtrees: diameter, balance, root-to-leaf path sums, and the maximum path sum that bends through a node.",
    pattern: "Return one value up; track a global best on the side",
    lessonSlugs: [
      "tree-diameter",
      "tree-balanced-binary-tree",
      "tree-path-sum",
      "tree-max-path-sum",
    ],
  },
  {
    id: "tree-construction",
    order: 6,
    title: "Tree Construction",
    summary:
      "Rebuild a tree from its traversals and turn a tree into a string and back — the interview test of whether you truly understand traversal order.",
    pattern: "Preorder/postorder picks the root; inorder splits the sides",
    lessonSlugs: [
      "tree-construct-preorder-inorder",
      "tree-construct-inorder-postorder",
      "tree-serialize-deserialize",
    ],
  },
  {
    id: "tree-advanced",
    order: 7,
    title: "Advanced Trees",
    summary:
      "Problems that combine the patterns: lowest common ancestor of any binary tree, order statistics on a BST, repairing a broken BST, and tree DP.",
    pattern: "Compose DFS, BST order, and subtree DP",
    lessonSlugs: [
      "tree-lca",
      "tree-kth-smallest-bst",
      "tree-recover-bst",
      "tree-house-robber-iii",
    ],
  },
];
