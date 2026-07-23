import type { DsaConceptLesson } from "../../types";

export const CONCEPTS: DsaConceptLesson[] = [
  {
    kind: "concept",
    slug: "tree-binary-tree",
    moduleId: "tree-fundamentals",
    order: 1,
    title: "Binary Tree",
    estimatedReadingMin: 7,
    tags: ["Tree", "Binary Tree", "Foundations"],
    summaryMD:
      "A binary tree is a recursive node structure where each node owns at most two child links, making it the base shape behind most tree interview patterns.",
    sections: [
      {
        heading: "The Core Shape",
        bodyMD:
          "A binary tree is either empty or a **node** with a value, a **node.left** child, and a **node.right** child. The top node is the **root**. A node with no children is a **leaf**. A node with at least one child is an **internal node**. A link from parent to child is an **edge**, and every child has exactly one parent except the root, which has none.\n\nThe recursive definition is what makes tree problems feel different from array problems. Each child is itself the root of a smaller binary tree, so most algorithms ask the same question of the left subtree and the right subtree, then combine those answers at the current node.",
      },
      {
        heading: "Reading a Tree From Levels",
        bodyMD:
          "Interview platforms often write trees in level order. For example, **[3,9,20,null,null,15,7]** means the root is **3**, its children are **9** and **20**, **9** has no children, and **20** has children **15** and **7**. The word **null** marks a missing child position, not a real node.\n\nThis representation is compact, but the actual pointer shape still matters. A traversal does not jump by array index unless the tree is intentionally stored in an array. The node object points to its children, and missing children are represented by **null** references.",
      },
      {
        heading: "Full, Complete, and Perfect",
        bodyMD:
          "Three shape words show up constantly. A **full** binary tree is one where every node has either zero children or two children. A **complete** binary tree has all levels filled except possibly the last, and the last level is filled from left to right. A **perfect** binary tree has every internal node with two children and every leaf at the same depth.\n\nThese terms are not interchangeable. Heaps are usually complete trees because the array layout depends on no gaps before the end. Perfect trees enable clean formulas such as **n = 2^(h + 1) - 1** under the convention that leaf height is **0**. Full trees restrict branching but do not guarantee compact levels.",
      },
      {
        heading: "Pointer Representation vs Array Representation",
        bodyMD:
          "The pointer representation stores each node as an object with **val**, **left**, and **right**. It is flexible: sparse trees, changing shapes, and recursive algorithms are natural. Most LeetCode tree problems use this representation, so you receive a **TreeNode root** and follow child references.\n\nThe array representation stores positions by index, usually with children at **2i + 1** and **2i + 2** for zero-based arrays. It works best for complete trees such as heaps because no space is wasted on many missing positions. For arbitrary sparse binary trees, a pointer representation is usually simpler and smaller.",
      },
      {
        heading: "Where Binary Trees Show Up",
        bodyMD:
          "Binary trees appear as expression trees, decision trees, parse trees, binary search trees, heaps, segment trees, and game trees. The same vocabulary carries across all of them: root, child, parent, subtree, leaf, edge, depth, and height.\n\nIn interviews, the most important mental move is to see one node plus two independent subtrees. If you can state what the current node needs from its children, the recursion or traversal order usually follows.",
      },
    ],
    codeExamples: [
      {
        title: "Minimal binary tree node",
        language: "java",
        code: `class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;

    TreeNode(int x){ val = x; }
}`,
        captionMD:
          "This is the standard interview shape: a value plus two child references, where **null** means the child is missing.",
      },
    ],
    keyTakeaways: [
      "A binary tree is a recursive structure: each child is the root of another binary tree or **null**.",
      "Level-order notation such as **[3,9,20,null,null,15,7]** describes positions, while pointer code follows child references.",
      "Full, complete, and perfect describe different shape guarantees and should not be used interchangeably.",
      "Most interview solutions start by deciding what one node should do with its left and right subtrees.",
    ],
  },
  {
    kind: "concept",
    slug: "tree-bst",
    moduleId: "tree-fundamentals",
    order: 2,
    title: "Binary Search Tree (BST)",
    estimatedReadingMin: 8,
    tags: ["Tree", "BST", "Search"],
    summaryMD:
      "A binary search tree adds a recursive ordering invariant to a binary tree so search, insertion, deletion, and sorted traversal all follow from compare-and-branch reasoning.",
    sections: [
      {
        heading: "The Recursive Ordering Invariant",
        bodyMD:
          "A binary search tree is a binary tree with an ordering rule at every node: all keys in the left subtree are less than the node value, and all keys in the right subtree are greater than the node value. The rule is recursive, so it must hold for every descendant subtree, not just the immediate children.\n\nThat recursive part is the common interview trap. A tree with root **10**, left child **5**, and a right child **12** under **5** is not a valid BST if **12** sits anywhere in the left subtree of **10**. The node **12** is greater than its parent **5**, but it violates the ancestor bound from **10**.",
      },
      {
        heading: "Why Operations Are O(h)",
        bodyMD:
          "Search in a BST asks one comparison at each level. If the target is less than the current node, the entire right subtree can be ignored. If it is greater, the entire left subtree can be ignored. Insert follows the same path until it finds a missing child position. Delete also starts with the same search path, then handles the local structural case at the found node.\n\nThe cost is **O(h)**, where **h** is the height of the tree. The invariant removes half of the remaining candidate direction at each balanced level, but the formal bound is about height, not the number of nodes directly.",
      },
      {
        heading: "Inorder Means Sorted",
        bodyMD:
          "Inorder traversal visits **left subtree**, then **node**, then **right subtree**. In a BST, everything in the left subtree is smaller, and everything in the right subtree is larger, so inorder traversal emits values in sorted ascending order.\n\nThis property is more than trivia. It powers kth-smallest queries, validation checks, range reporting, and many conversions between BSTs and sorted arrays. When a problem says BST and sorted output, your first instinct should be inorder.",
      },
      {
        heading: "Balanced vs Skewed Height",
        bodyMD:
          "A balanced BST with **n** nodes has height **O(log n)**, so search, insert, and delete are **O(log n)**. A skewed BST can have height **O(n)**, such as inserting **1, 2, 3, 4, 5** into an ordinary BST without rebalancing. It becomes a linked list leaning right.\n\nThis is why interview answers should say **O(h)** first, then specialize it: **O(log n)** if balanced, **O(n)** if skewed. That phrasing shows you understand both the data structure invariant and its operational risk.",
      },
    ],
    keyTakeaways: [
      "A BST requires every node to satisfy the left-less and right-greater rule across entire subtrees.",
      "Search, insert, and delete follow one root-to-leaf path, so their natural bound is **O(h)**.",
      "Inorder traversal of a BST produces sorted ascending values.",
      "Balanced trees give **O(log n)** height, while skewed trees degrade to **O(n)** height.",
    ],
  },
  {
    kind: "concept",
    slug: "tree-height",
    moduleId: "tree-fundamentals",
    order: 3,
    title: "Height",
    estimatedReadingMin: 7,
    tags: ["Tree", "Height", "Postorder"],
    summaryMD:
      "Height measures the longest downward edge path to a leaf, so it is computed bottom-up by asking children for their heights before answering for the parent.",
    sections: [
      {
        heading: "Definition and Convention",
        bodyMD:
          "The height of a node is the number of edges on the longest downward path from that node to any leaf in its subtree. The height of the tree is the height of the root. In this course, a leaf has height **0**, and an empty child contributes height **-1** inside recursive formulas.\n\nThat convention makes the recurrence clean. If a node has no children, both child heights are **-1**, so its height is **1 + max(-1, -1) = 0**. Some textbooks count nodes instead of edges, but interviews are safest when you state your convention before using it.",
      },
      {
        heading: "Bottom-Up Postorder Thinking",
        bodyMD:
          "Height is a bottom-up value. A parent cannot know its height until it knows the heights of both children. That is exactly postorder traversal: compute the left subtree, compute the right subtree, then process the node.\n\nFor **[3,9,20,null,null,15,7]**, nodes **9**, **15**, and **7** are leaves with height **0**. Node **20** has child heights **0** and **0**, so its height is **1**. Root **3** has child heights **0** and **1**, so the tree height is **2**.",
      },
      {
        heading: "The Recurrence",
        bodyMD:
          "The recurrence is: **height(node) = 1 + max(height(node.left), height(node.right))**. The base value for **null** is **-1** under the leaf-height-zero convention. This base value is not arbitrary; it makes the parent of two empty children become height **0**.\n\nMany recursive tree problems reuse this exact shape. Maximum depth, balanced-tree checks, diameter, and several subtree aggregation problems all start by returning information from children to parent.",
      },
      {
        heading: "Common Interview Mistakes",
        bodyMD:
          "The first mistake is mixing edge height and node height halfway through the solution. If **null** returns **0**, then a leaf returns **1**, which is node-count height. That is also valid if stated clearly, but it changes examples and balance calculations by one.\n\nThe second mistake is trying to compute height top-down without stored information. Depth is naturally top-down because it counts from the root. Height is naturally bottom-up because it depends on the deepest leaf below the node.",
      },
    ],
    codeExamples: [
      {
        title: "Recursive height with leaf height zero",
        language: "java",
        code: `class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;

    TreeNode(int x){ val = x; }
}

class Solution {
    int height(TreeNode root) {
        if (root == null) {
            return -1;
        }

        int leftHeight = height(root.left);
        int rightHeight = height(root.right);
        return 1 + Math.max(leftHeight, rightHeight);
    }
}`,
        captionMD:
          "Returning **-1** for **null** makes a leaf compute to height **0**, matching the edge-count convention used in this lesson.",
      },
    ],
    keyTakeaways: [
      "Height is the longest downward edge-path from a node to a leaf.",
      "This course uses leaf height **0**, so **null** contributes **-1** in the recurrence.",
      "Height is computed bottom-up with postorder because a parent needs child heights first.",
      "The same child-aggregate pattern appears in balance, diameter, and many recursive tree problems.",
    ],
  },
  {
    kind: "concept",
    slug: "tree-depth",
    moduleId: "tree-fundamentals",
    order: 4,
    title: "Depth",
    estimatedReadingMin: 7,
    tags: ["Tree", "Depth", "BFS"],
    summaryMD:
      "Depth measures how far a node is from the root, so it is naturally computed top-down or level-by-level rather than by aggregating child answers.",
    sections: [
      {
        heading: "Definition and Level Convention",
        bodyMD:
          "The depth of a node is the number of edges from the root down to that node. The root has depth **0**. Its children have depth **1**. Their children have depth **2**, and so on. Many interviewers use the word level for the same idea, though some one-index levels in UI descriptions; always clarify the starting value.\n\nFor **[3,9,20,null,null,15,7]**, node **3** is depth **0**, nodes **9** and **20** are depth **1**, and nodes **15** and **7** are depth **2**.",
      },
      {
        heading: "Top-Down Computation",
        bodyMD:
          "Depth is top-down because the answer is carried from the root to the current node. A recursive helper receives the current depth, processes the node, then calls the left and right children with **depth + 1**.\n\nThis direction is the opposite of height. The child does not need to inspect its descendants to know its depth; it only needs to know how far its parent already was from the root.",
      },
      {
        heading: "Level-Order Framing",
        bodyMD:
          "Breadth-first search makes depth visible as levels. Put the root in a queue at depth **0**. Process exactly the current queue size to finish one level, then enqueue children for the next level. After one full layer is consumed, the depth counter increases.\n\nThis framing is useful for problems that ask for right side view, averages by level, zigzag order, minimum depth, or nearest target. If the prompt is about levels, a queue is often more natural than recursion.",
      },
      {
        heading: "Height vs Depth",
        bodyMD:
          "Height and depth are classic interview confusion points. **Depth** looks upward to the root and counts how many edges were used to reach the node. **Height** looks downward to the deepest leaf and counts how much subtree remains below the node.\n\nA leaf can have large depth and height **0** at the same time. In a long skewed tree, the last node is far from the root, so its depth is large, but it has no children, so its height is **0**. Keeping the direction clear prevents off-by-one and wrong-traversal bugs.",
      },
    ],
    keyTakeaways: [
      "Depth is the number of edges from the root to a node, with root depth **0**.",
      "Depth is naturally top-down: pass **depth + 1** from parent to children.",
      "BFS processes one queue layer per depth, which matches level-order problems.",
      "Depth counts distance from the root; height counts distance down to the deepest leaf.",
    ],
  },
  {
    kind: "concept",
    slug: "tree-balanced-tree",
    moduleId: "tree-fundamentals",
    order: 5,
    title: "Balanced Tree",
    estimatedReadingMin: 8,
    tags: ["Tree", "Balanced Tree", "Height"],
    summaryMD:
      "A balanced tree keeps height small enough that root-to-leaf operations stay logarithmic instead of degenerating into linked-list scans.",
    sections: [
      {
        heading: "Height-Balanced Meaning",
        bodyMD:
          "A binary tree is height-balanced when every node's left and right subtree heights differ by at most **1**. The every node part matters. It is not enough for the root to look balanced if a deeper subtree is badly skewed.\n\nUsing the leaf-height-zero convention, a missing child has height **-1** inside calculations. A leaf is balanced because both child heights are **-1**. A node with one leaf child and one missing child is also balanced because the difference is **1**.",
      },
      {
        heading: "Why Balance Protects Performance",
        bodyMD:
          "Operations that follow a root-to-leaf path are bounded by height. In a balanced tree with **n** nodes, height is **O(log n)**, so BST search, insertion, deletion, and many navigation tasks are logarithmic. In a skewed tree, height can become **O(n)**, and those same operations become linear.\n\nThis is why the phrase **O(h)** is precise and the phrase **O(log n)** needs a balance assumption. Balance is the structural reason logarithmic performance is possible.",
      },
      {
        heading: "Self-Balancing Trees",
        bodyMD:
          "Ordinary binary search trees do not automatically stay balanced. If values arrive in sorted order, the tree can lean into a chain. Self-balancing BSTs such as AVL trees and red-black trees add rotation rules after insertions and deletions so height remains logarithmic.\n\nYou usually do not implement those rotations in a basic tree interview unless the problem asks for it. Still, knowing the purpose matters: rotations preserve the BST ordering invariant while changing shape to reduce height.",
      },
      {
        heading: "Checking Balance Bottom-Up",
        bodyMD:
          "To check whether a tree is balanced, compute heights bottom-up. For each node, ask the left and right subtrees for their heights. If either subtree is already unbalanced, propagate failure. Otherwise, compare the two heights and return the current height.\n\nThis combines two tasks in one postorder traversal: validate the balance rule and compute the height needed by the parent. The common efficient pattern returns a sentinel such as **-2** or a pair containing height and balance status, avoiding repeated height recomputation.",
      },
    ],
    keyTakeaways: [
      "Height-balanced means every node has left and right subtree heights differing by at most **1**.",
      "Balance keeps height **O(log n)**, which protects path-based operations from becoming **O(n)**.",
      "AVL and red-black trees use rotations to maintain balance while preserving BST order.",
      "Balance checks are best done bottom-up so each subtree height is computed once.",
    ],
  },
  {
    kind: "concept",
    slug: "tree-traversals",
    moduleId: "tree-fundamentals",
    order: 6,
    title: "Traversals",
    estimatedReadingMin: 9,
    tags: ["Tree", "Traversal", "DFS", "BFS"],
    summaryMD:
      "Tree traversal is about choosing when to visit the node relative to its children, which determines whether the algorithm sees roots first, sorted BST values, subtree results, or complete levels.",
    sections: [
      {
        heading: "The Four Core Orders",
        bodyMD:
          "Depth-first traversal has three main orders. **Preorder** is **node, left, right**. **Inorder** is **left, node, right**. **Postorder** is **left, right, node**. Breadth-first traversal, also called **level-order**, visits nodes by depth from top to bottom using a queue.\n\nFor a tree like **[1,2,3,null,4]**, preorder sees the root before descendants, inorder places the root between left and right sides, postorder waits until subtrees finish, and BFS sees **1**, then **2** and **3**, then **4**.",
      },
      {
        heading: "When Each Order Is Used",
        bodyMD:
          "Use inorder when a BST should produce sorted output or when you need predecessor, successor, or kth-smallest behavior. Use postorder when the node needs completed child answers first, such as height, balance, diameter, subtree deletion, or freeing nodes. Use preorder when the root decision should happen before children, such as copying a tree, serializing with null markers, or passing inherited state downward.\n\nUse level-order when the problem speaks in levels: right side view, averages of each level, zigzag traversal, minimum depth, nearest target, or any prompt where the first layer found is important.",
      },
      {
        heading: "Recursive vs Iterative DFS",
        bodyMD:
          "Recursive DFS uses the call stack as the traversal stack. The code is short because each function call represents one pending node and its unfinished children. The trade-off is stack depth: a skewed tree can use **O(n)** call stack space.\n\nIterative DFS makes that stack explicit. Preorder is especially direct with a stack because you pop a node, visit it, then push right before left so left is processed next. Inorder iterative traversal walks left while pushing ancestors, then pops and moves right. Postorder iterative traversal usually needs a previous pointer, two stacks, or a modified preorder strategy.",
      },
      {
        heading: "BFS With a Queue",
        bodyMD:
          "BFS uses a queue because nodes are processed in the order they are discovered. Start with the root, repeatedly remove the front node, and add its children to the back. To separate levels, capture the queue size before processing a layer; exactly that many nodes belong to the current depth.\n\nQueue invariants are powerful in interviews. At the start of each outer loop, the queue contains exactly the nodes for the next level. After processing that many nodes, it contains exactly the children for the following level.",
      },
      {
        heading: "Choosing the Traversal",
        bodyMD:
          "Do not memorize traversal names in isolation. Ask what information the current node needs. If it needs ancestor information, preorder or top-down DFS is natural. If it needs child summaries, postorder is natural. If the tree is a BST and sorted order matters, inorder is natural. If the question is organized by depth, BFS is natural.\n\nThis pattern-recognition step is often the difference between a clean interview solution and a forced one. The traversal order should match the dependency direction of the data you are computing.",
      },
    ],
    codeExamples: [
      {
        title: "Recursive inorder traversal",
        language: "java",
        code: `import java.util.ArrayList;
import java.util.List;

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;

    TreeNode(int x){ val = x; }
}

class Solution {
    List<Integer> inorderTraversal(TreeNode root) {
        List<Integer> result = new ArrayList<>();
        inorder(root, result);
        return result;
    }

    private void inorder(TreeNode node, List<Integer> result) {
        if (node == null) {
            return;
        }

        inorder(node.left, result);
        result.add(node.val);
        inorder(node.right, result);
    }
}`,
        captionMD:
          "Inorder visits the left subtree, then the node, then the right subtree; on a BST, that produces sorted ascending values.",
      },
      {
        title: "BFS level-order template",
        language: "java",
        code: `import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;
import java.util.Queue;

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;

    TreeNode(int x){ val = x; }
}

class Solution {
    List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> levels = new ArrayList<>();
        if (root == null) {
            return levels;
        }

        Queue<TreeNode> queue = new ArrayDeque<>();
        queue.offer(root);

        while (!queue.isEmpty()) {
            int levelSize = queue.size();
            List<Integer> level = new ArrayList<>();

            for (int i = 0; i < levelSize; i++) {
                TreeNode node = queue.poll();
                level.add(node.val);

                if (node.left != null) {
                    queue.offer(node.left);
                }
                if (node.right != null) {
                    queue.offer(node.right);
                }
            }

            levels.add(level);
        }

        return levels;
    }
}`,
        captionMD:
          "Capturing **levelSize** before the inner loop keeps one BFS iteration aligned with exactly one tree depth.",
      },
    ],
    keyTakeaways: [
      "Preorder visits **node, left, right**; inorder visits **left, node, right**; postorder visits **left, right, node**.",
      "Inorder is the sorted-order traversal for BSTs, while postorder is the natural order for subtree aggregation.",
      "Recursive DFS uses the call stack; iterative DFS uses an explicit stack to control the same pending work.",
      "BFS uses a queue and is the right default when a problem asks about levels.",
    ],
  },
];
