import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "tree-lca",
    moduleId: "tree-advanced",
    order: 27,
    title: "Lowest Common Ancestor of a Binary Tree",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/",
    tags: ["Tree", "DFS", "Recursion", "Postorder", "Ancestor"],
    companies: ["Microsoft", "Amazon", "Google", "Meta", "Apple"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 22,
    statementMD:
      "Given the **root** of a binary tree and two distinct nodes **p** and **q** that both exist in the tree, return their lowest common ancestor. The lowest common ancestor is the deepest node that has both **p** and **q** as descendants, where a node can be a descendant of itself.",
    constraints: [
      "2 <= number of nodes <= 10^5",
      "-10^9 <= Node.val <= 10^9",
      "All Node.val values are unique",
      "p and q are different nodes and both exist in the tree",
    ],
    inputMD:
      "The **root** pointer of a general binary tree, plus references to the two target nodes **p** and **q**. This is not a BST problem, so values do not determine direction.",
    outputMD:
      "The tree node that is the deepest shared ancestor of **p** and **q**.",
    examples: [
      {
        input: "root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1",
        output: "3",
        explanation: "Node **5** is in the left subtree of **3** and node **1** is in the right subtree of **3**, so **3** is the first node where the two discoveries meet.",
      },
      {
        input: "root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 4",
        output: "5",
        explanation: "A node can be its own ancestor. Since **4** is inside the subtree rooted at **5**, the lowest common ancestor is **5**.",
      },
    ],
    learningObjectives: [
      "Recognise when a binary-tree LCA problem needs full DFS instead of BST ordering.",
      "Use postorder recursion to bubble target discoveries back to their parent.",
      "Explain why returning **p** or **q** immediately is correct when one target is an ancestor of the other.",
      "Contrast the general-tree solution with the compare-and-branch BST version.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe technique is **postorder bubble-up for LCA**. The signal is a general binary tree where there is no ordering rule, so you cannot decide left or right from values. That is the key difference from **tree-lca-bst**, where BST ordering lets you walk downward by comparing **p.val**, **q.val**, and **root.val**.\n\nIn a general tree, each node asks its children a yes-or-no style question: did your subtree find either target? If the left side returns a target and the right side returns a target, the current node is the lowest place where both targets are seen. If only one side returns a node, bubble that node upward. If the current node is **p** or **q**, return it immediately because it may be the ancestor that absorbs the other target below.",
    commonMistakes: [
      "Using BST comparison logic even though the input is only a binary tree.",
      "Continuing below **p** or **q** before returning it, which complicates the ancestor case unnecessarily.",
      "Returning **null** when only one child finds a target instead of bubbling the non-null side upward.",
      "Thinking the first target found in DFS is the answer; the answer is where the two returned paths meet.",
    ],
    algorithmMD:
      "**Key idea**\n\nRun a postorder DFS. Each recursive call returns one of three meanings: **null** if the subtree found neither target, **p** or **q** if it found exactly one target, or the final LCA if both targets were already found inside that subtree. The parent only needs to combine the left and right returns.\n\n**Recursion walkthrough**\n\nUse **[3,5,1,6,2,0,8,null,null,7,4]** with **p = 5** and **q = 4**. The call at node **5** hits **p**, so it returns **5** immediately to node **3**. The fact that **4** is lower inside the same subtree does not change the answer because **5** is allowed to be an ancestor of itself.\n\nFor **p = 5** and **q = 1** on the same tree, the left recursion from **3** returns **5** and the right recursion returns **1**. Node **3** receives two non-null answers from different sides, so **3** is the first common meeting point and returns itself. Every ancestor above would only bubble **3** upward.\n\n**Algorithm**\n\n1. If **root** is **null**, return **null**.\n2. If **root** is exactly **p** or **q**, return **root**.\n3. Recursively search the left subtree and store the returned node.\n4. Recursively search the right subtree and store the returned node.\n5. If both sides returned non-null nodes, return **root** because the targets split across the two sides.\n6. Otherwise return the non-null side, or **null** if neither side found a target.",
    solutions: [
      {
        name: "Postorder DFS bubble-up",
        whenToUseMD:
          "Use this for the standard general binary-tree LCA problem. It does not assume sorted values and naturally handles the case where one target is an ancestor of the other.",
        approachMD:
          "Search both subtrees before deciding what the current node represents. A non-null return means this subtree has found one target or has already found the answer. When both child calls return non-null, the current node is the LCA.",
        walkthroughMD:
          "1. Return **null** for an empty subtree.\n2. Return **root** immediately when **root** is **p** or **q**.\n3. Ask the left child for a target or completed answer.\n4. Ask the right child for a target or completed answer.\n5. If both answers exist, return **root**.\n6. Otherwise bubble up whichever side is non-null.",
        complexity: { time: "O(n)", space: "O(h)", note: "Every node may be visited once, and the recursion stack height is **h**, which is **n** in a skewed tree." },
        filename: "Solution.java",
        code: `class TreeNode { int val; TreeNode left; TreeNode right; TreeNode(int x){ val = x; } }

class Solution {

    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        if (root == null || root == p || root == q) {
            return root;
        }

        TreeNode left = lowestCommonAncestor(root.left, p, q);
        TreeNode right = lowestCommonAncestor(root.right, p, q);

        if (left != null && right != null) {
            return root;
        }
        if (left != null) {
            return left;
        }
        return right;
    }
}`,
      },
    ],
    dryRun: {
      inputMD:
        "root = **[3,5,1,6,2,0,8,null,null,7,4]**, **p = 5**, **q = 1**. Track the returns into node **3**.",
      columns: ["call", "left return", "right return", "decision", "return"],
      rows: [
        ["node 5", "not needed", "not needed", "current node is **p**", "5"],
        ["node 1", "not needed", "not needed", "current node is **q**", "1"],
        ["node 3", "5", "1", "both sides are non-null", "3"],
      ],
      narrativeMD:
        "The left and right subtrees of **3** each report one target, so **3** is the lowest node where the two paths meet.",
    },
    complexityNote:
      "The general-tree version is linear because no ordering rule lets us discard a subtree. The BST version **tree-lca-bst** can walk one branch per level.",
    interviewTipsMD:
      "Say explicitly whether the tree is a BST. If it is not, avoid value comparisons and describe the postorder contract: each call returns **null**, one found target, or the completed LCA. Interviewers like hearing the ancestor case: when **root == p** or **root == q**, returning **root** lets the other target below confirm that this node is the answer.",
    followUps: [
      "How would the solution change for a Binary Search Tree such as **tree-lca-bst**?",
      "What if either **p** or **q** might be missing from the tree?",
      "How would you find the LCA of more than two target nodes?",
      "How would parent pointers change the strategy?",
    ],
    similarProblems: [
      { title: "Lowest Common Ancestor of a BST", difficulty: "Medium", slug: "tree-lca-bst", note: "Uses BST ordering instead of searching both subtrees." },
      { title: "Binary Tree Maximum Path Sum", difficulty: "Hard", slug: "tree-max-path-sum", note: "Also combines information returned from left and right children." },
      { title: "Diameter of Binary Tree", difficulty: "Easy", slug: "tree-diameter", note: "Another postorder problem where the answer may pass through the current node." },
      { title: "Path Sum", difficulty: "Easy", slug: "tree-path-sum", note: "Practices DFS path reasoning in a binary tree." },
    ],
    keyTakeaways: [
      "General binary-tree LCA is a postorder search, not a BST compare-and-branch walk.",
      "A call returns **null**, a target, or an already discovered LCA.",
      "Two non-null child returns make the current node the lowest meeting point.",
      "Returning **p** or **q** immediately correctly handles ancestor-of-target cases.",
    ],
    pattern:
      "Postorder bubble-up: let each subtree report whether it found a target, and declare the current node the answer when both sides report success.",
  },
  {
    kind: "problem",
    slug: "tree-kth-smallest-bst",
    moduleId: "tree-advanced",
    order: 28,
    title: "Kth Smallest Element in a BST",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/",
    tags: ["Tree", "BST", "DFS", "Inorder", "Stack"],
    companies: ["Microsoft", "Amazon", "Google", "Meta", "Bloomberg"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 22,
    statementMD:
      "Given the **root** of a Binary Search Tree and an integer **k**, return the **kth** smallest value among all nodes in the tree. The tree follows the BST property, so every left subtree value is smaller than the node and every right subtree value is larger.",
    constraints: [
      "1 <= number of nodes <= 10^4",
      "0 <= Node.val <= 10^4",
      "1 <= k <= number of nodes",
      "All Node.val values are unique",
    ],
    inputMD:
      "The **root** pointer of a BST and a positive integer **k** using one-based order.",
    outputMD:
      "An integer value: the **kth** smallest node value in sorted order.",
    examples: [
      {
        input: "root = [3,1,4,null,2], k = 1",
        output: "1",
        explanation: "The inorder order is **1, 2, 3, 4**, so the first smallest value is **1**.",
      },
      {
        input: "root = [5,3,6,2,4,null,null,1], k = 3",
        output: "3",
        explanation: "The inorder order is **1, 2, 3, 4, 5, 6**, so the third smallest value is **3**.",
      },
    ],
    learningObjectives: [
      "Use inorder traversal as the sorted-order stream of a BST.",
      "Stop traversal as soon as the **kth** node is visited.",
      "Compare recursive counter and iterative stack implementations.",
      "Discuss subtree-count augmentation for frequent order-statistic queries.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe technique is **inorder order-statistic traversal**. The signal is a BST plus a rank request such as **kth smallest**. In a BST, inorder traversal visits values in ascending order, so the problem becomes streaming the sorted sequence until the **kth** item appears.\n\nThe common trap is building a full list when the answer may arrive early. Both the recursive counter and iterative stack versions can stop as soon as the counter reaches **k**. For frequent queries on a changing or reused tree, the follow-up is to augment each node with its subtree size so you can jump left, return current, or jump right in **O(h)** per query.",
    commonMistakes: [
      "Using preorder or level order and losing the sorted property.",
      "Treating **k** as zero-based even though the problem uses one-based rank.",
      "Traversing the entire tree after the answer has already been found.",
      "Forgetting that a balanced BST gives small stack height but a skewed BST can use linear stack space.",
    ],
    algorithmMD:
      "**Key idea**\n\nInorder means left subtree, current node, right subtree. For a BST, that exact order is sorted ascending. Count nodes as they are visited in inorder order and stop when the count reaches **k**.\n\n**Recursion walkthrough**\n\nUse **[5,3,6,2,4,null,null,1]** with **k = 3**. Inorder first walks down to **1**, visits it as count **1**, then returns to **2** as count **2**. The next inorder node is **3**, so count becomes **3** and the answer is **3**. The traversal does not need to visit **4**, **5**, or **6**.\n\nThe iterative stack simulates the same call stack. It pushes **5**, **3**, **2**, **1** while going left. It pops **1**, then **2**, then **3**; the third pop is the answer.\n\n**Algorithm**\n\n1. Traverse the BST in inorder order.\n2. Each time a node is visited, decrement a remaining counter or increment a visited count.\n3. When the visited node is the **kth** one, record or return its value immediately.\n4. Avoid exploring the remaining right-side work after the answer is known.\n5. For frequent rank queries, store subtree sizes on nodes and compare **k** with the left subtree size at each step.",
    solutions: [
      {
        name: "Recursive inorder with counter",
        whenToUseMD:
          "Use this when recursion is acceptable and you want the shortest explanation of the BST sorted-order property.",
        approachMD:
          "Perform inorder DFS and keep a remaining counter. Each visited node consumes one rank. When the remaining count becomes **0**, store the value and let later recursive frames return without extra work.",
        walkthroughMD:
          "1. Store **k** in a mutable remaining counter.\n2. Recursively visit the left subtree first.\n3. If the answer was already found, return immediately.\n4. Visit the current node by decrementing the counter.\n5. When the counter reaches **0**, save the current value.\n6. Otherwise continue into the right subtree.",
        complexity: { time: "O(h + k)", space: "O(h)", note: "Early exit visits only the path to the first node plus the first **k** inorder nodes; recursion stack height is **h**." },
        filename: "Solution.java",
        code: `class TreeNode { int val; TreeNode left; TreeNode right; TreeNode(int x){ val = x; } }

class Solution {
    private int remaining;
    private int answer;

    public int kthSmallest(TreeNode root, int k) {
        remaining = k;
        inorder(root);
        return answer;
    }

    private void inorder(TreeNode node) {
        if (node == null || remaining == 0) {
            return;
        }

        inorder(node.left);
        if (remaining == 0) {
            return;
        }

        remaining--;
        if (remaining == 0) {
            answer = node.val;
            return;
        }

        inorder(node.right);
    }
}`,
      },
      {
        name: "Iterative inorder with explicit stack",
        whenToUseMD:
          "Use this when you want to avoid recursion or make the early-exit mechanics very explicit.",
        approachMD:
          "Simulate inorder traversal with a stack. Push the left spine, pop the next smallest node, decrement **k**, and return immediately when that pop is the desired rank.",
        walkthroughMD:
          "1. Start with **current = root** and an empty stack.\n2. Push nodes while walking left until **current** becomes **null**.\n3. Pop the stack to visit the next smallest node.\n4. Decrement the remaining rank and return this value if the rank reaches **0**.\n5. Move to the popped node right child and repeat.",
        complexity: { time: "O(h + k)", space: "O(h)", note: "The stack stores at most one root-to-leaf path, and early exit stops after the **kth** pop." },
        filename: "Solution.java",
        code: `import java.util.ArrayDeque;
import java.util.Deque;

class TreeNode { int val; TreeNode left; TreeNode right; TreeNode(int x){ val = x; } }

class Solution {

    public int kthSmallest(TreeNode root, int k) {
        Deque<TreeNode> stack = new ArrayDeque<>();
        TreeNode current = root;
        int remaining = k;

        while (current != null || !stack.isEmpty()) {
            while (current != null) {
                stack.push(current);
                current = current.left;
            }

            current = stack.pop();
            remaining--;
            if (remaining == 0) {
                return current.val;
            }

            current = current.right;
        }

        return -1;
    }
}`,
      },
    ],
    dryRun: {
      inputMD:
        "root = **[5,3,6,2,4,null,null,1]**, **k = 3**. Track the inorder visits until the answer appears.",
      columns: ["visit order", "node visited", "remaining after visit", "action"],
      rows: [
        ["1", "1", "2", "not enough nodes visited yet"],
        ["2", "2", "1", "continue inorder"],
        ["3", "3", "0", "return **3** immediately"],
      ],
      narrativeMD:
        "Because inorder over a BST is sorted, the third visited node is exactly the third smallest value.",
    },
    complexityNote:
      "Both authored solutions use early exit. Without augmentation, a one-time query is **O(h + k)** time and **O(h)** space; with subtree counts, repeated rank queries can be answered in **O(h)** time.",
    interviewTipsMD:
      "Lead with the BST invariant: inorder is sorted. Then mention early exit so you do not look like you are dumping every value into an array. If the interviewer asks about many **kth** queries, propose storing a subtree node count at each node. The rank of the current node is **leftSize + 1**, which tells you whether to go left, return current, or go right with an adjusted **k**.",
    followUps: [
      "How would you support many **kth** smallest queries efficiently?",
      "How would insertions and deletions update subtree counts?",
      "How would you find the **kth** largest element instead?",
      "What changes if duplicate values are allowed?",
    ],
    similarProblems: [
      { title: "Binary Tree Inorder Traversal", difficulty: "Easy", slug: "tree-inorder-traversal", note: "The traversal order that makes BST values sorted." },
      { title: "Validate Binary Search Tree", difficulty: "Medium", slug: "tree-validate-bst", note: "Also relies on sorted inorder order or range constraints." },
      { title: "Recover Binary Search Tree", difficulty: "Medium", slug: "tree-recover-bst", note: "Uses inorder violations to detect swapped nodes." },
      { title: "Search in a Binary Search Tree", difficulty: "Easy", slug: "tree-search-in-bst", note: "Practices using BST ordering to discard branches." },
    ],
    keyTakeaways: [
      "Inorder traversal of a BST is the sorted sequence of values.",
      "The **kth** smallest value is the **kth** inorder visit.",
      "Early exit avoids unnecessary traversal after the answer is found.",
      "Subtree sizes turn a repeated rank query into an order-statistic search.",
    ],
    pattern:
      "BST order-statistic traversal: stream values in inorder order, count visits, and stop as soon as the requested rank is reached.",
  },
  {
    kind: "problem",
    slug: "tree-recover-bst",
    moduleId: "tree-advanced",
    order: 29,
    title: "Recover Binary Search Tree",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/recover-binary-search-tree/",
    tags: ["Tree", "BST", "DFS", "Inorder", "Recovery"],
    companies: ["Microsoft", "Amazon", "Google", "Meta", "Oracle"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 30,
    statementMD:
      "You are given the **root** of a Binary Search Tree where exactly two nodes have been swapped by mistake. Recover the tree without changing its structure by swapping the two incorrect node values back.",
    constraints: [
      "2 <= number of nodes <= 1000",
      "-2^31 <= Node.val <= 2^31 - 1",
      "Exactly two nodes in the BST have been swapped",
      "All node values are unique",
    ],
    inputMD:
      "The **root** pointer of a BST whose shape is unchanged but whose two node values are in the wrong positions.",
    outputMD:
      "The same tree root after the two incorrect values have been swapped back. The function modifies the tree in place.",
    examples: [
      {
        input: "root = [1,3,null,null,2]",
        output: "[3,1,null,null,2]",
        explanation: "The inorder sequence is **3, 2, 1**, which has two drops. The swapped values are **3** and **1**.",
      },
      {
        input: "root = [3,1,4,null,null,2]",
        output: "[2,1,4,null,null,3]",
        explanation: "The inorder sequence is **1, 3, 2, 4**. The single drop identifies **3** and **2** as the swapped values.",
      },
    ],
    learningObjectives: [
      "Use inorder traversal to expose the sorted sequence of a BST.",
      "Detect one or two inversion points caused by exactly two swapped values.",
      "Track **previous**, **first**, and **second** pointers during traversal.",
      "Explain why swapping values fixes the tree without changing pointers.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe technique is **inorder violation detection**. The signal is a BST whose structure is intact but two values are swapped. Since a correct BST has a strictly increasing inorder sequence, the swapped nodes appear exactly where that sequence drops.\n\nIf the swapped nodes are adjacent in inorder order, there is one drop, such as **1, 3, 2, 4**. The first offender is the previous node **3**, and the second offender is the current node **2**. If the swapped nodes are far apart, there are two drops, such as **3, 2, 1**. The first offender is still the previous node at the first drop, and the second offender is updated to the current node at the second drop.",
    commonMistakes: [
      "Trying to rebuild the BST instead of preserving the original tree structure.",
      "Recording only the first inversion, which fails when the swapped nodes are not adjacent in inorder order.",
      "Comparing a node with its parent instead of with the previous node in inorder order.",
      "Swapping node references instead of swapping values, which can accidentally change the shape.",
    ],
    algorithmMD:
      "**Key idea**\n\nInorder traversal should produce a sorted sequence. Keep **previous**, the node visited immediately before the current node. Whenever **previous.val > current.val**, you found an inversion. On the first inversion, set **first = previous**. On every inversion, set **second = current**. After traversal, swap **first.val** and **second.val**.\n\n**Recursion walkthrough**\n\nUse **[1,3,null,null,2]**. The inorder visit order is **3**, then **2**, then **1**. When visiting **2**, the previous node is **3**, so **3 > 2** is the first inversion. Set **first = 3** and **second = 2**. When visiting **1**, the previous node is **2**, so **2 > 1** is another inversion. Keep **first = 3** and update **second = 1**.\n\nAt the end, swapping values **3** and **1** restores the inorder sequence to **1, 2, 3** and the tree becomes a valid BST again. The Morris traversal follow-up can reduce extra space to **O(1)** by threading the tree temporarily, but the cleaner interview implementation uses the normal **O(h)** recursion stack.\n\n**Algorithm**\n\n1. Initialise **first**, **second**, and **previous** as empty pointers.\n2. Traverse the tree inorder.\n3. Before moving past a node, compare **previous.val** with the current node value if **previous** exists.\n4. If **previous.val > current.val** and **first** is empty, set **first = previous**.\n5. For every inversion, set **second = current**.\n6. Update **previous** to the current node and continue inorder.\n7. Swap **first.val** and **second.val** after traversal.",
    solutions: [
      {
        name: "Inorder DFS with previous pointer",
        whenToUseMD:
          "Use this by default. It is concise, preserves the tree shape, and clearly demonstrates how the sorted inorder invariant exposes the two swapped values.",
        approachMD:
          "Run inorder DFS and compare each node with the previously visited node. The first time order drops, the previous node is the first swapped node. The current node is a candidate for the second swapped node, and it must be updated again if a second drop appears.",
        walkthroughMD:
          "1. Keep fields for **first**, **second**, and **previous**.\n2. Visit the left subtree.\n3. If **previous** exists and **previous.val > node.val**, record an inversion.\n4. On the first inversion, set **first** to **previous**.\n5. On every inversion, set **second** to the current node.\n6. Move **previous** to the current node and visit the right subtree.\n7. Swap the values stored in **first** and **second**.",
        complexity: { time: "O(n)", space: "O(h)", note: "Every node is visited once; recursion uses stack space equal to the tree height." },
        filename: "Solution.java",
        code: `class TreeNode { int val; TreeNode left; TreeNode right; TreeNode(int x){ val = x; } }

class Solution {
    private TreeNode first;
    private TreeNode second;
    private TreeNode previous;

    public void recoverTree(TreeNode root) {
        inorder(root);

        int temp = first.val;
        first.val = second.val;
        second.val = temp;
    }

    private void inorder(TreeNode node) {
        if (node == null) {
            return;
        }

        inorder(node.left);

        if (previous != null && previous.val > node.val) {
            if (first == null) {
                first = previous;
            }
            second = node;
        }

        previous = node;
        inorder(node.right);
    }
}`,
      },
    ],
    dryRun: {
      inputMD:
        "root = **[1,3,null,null,2]**. The inorder stream should be increasing, but it appears as **3, 2, 1**.",
      columns: ["visit order", "current", "previous", "violation", "first", "second"],
      rows: [
        ["1", "3", "none", "no comparison", "none", "none"],
        ["2", "2", "3", "**3 > 2**", "3", "2"],
        ["3", "1", "2", "**2 > 1**", "3", "1"],
      ],
      narrativeMD:
        "After traversal, **first = 3** and **second = 1**. Swapping those values changes the inorder order to **1, 2, 3**.",
    },
    complexityNote:
      "The implemented solution is the standard **O(n)** time and **O(h)** stack approach. Morris inorder traversal is the advanced **O(1)** extra-space follow-up.",
    interviewTipsMD:
      "Use the phrase **inorder should be sorted** before coding. Then explain adjacent versus non-adjacent swaps: one inversion still sets both nodes, while two inversions keep the first previous offender and update the second current offender. Mention Morris traversal as a space follow-up, but code the recursive **O(h)** version unless specifically asked for constant space.",
    followUps: [
      "Can you recover the BST using Morris inorder traversal with **O(1)** extra space?",
      "How would you detect whether a BST is valid without modifying it?",
      "What if more than two nodes were out of order?",
      "How would duplicate values change the inversion comparison?",
    ],
    similarProblems: [
      { title: "Validate Binary Search Tree", difficulty: "Medium", slug: "tree-validate-bst", note: "Also verifies the BST invariant through ranges or inorder order." },
      { title: "Kth Smallest Element in a BST", difficulty: "Medium", slug: "tree-kth-smallest-bst", note: "Uses the same sorted inorder stream." },
      { title: "Binary Tree Inorder Traversal", difficulty: "Easy", slug: "tree-inorder-traversal", note: "The traversal primitive behind the recovery logic." },
      { title: "Construct Binary Tree from Preorder and Inorder Traversal", difficulty: "Medium", slug: "tree-construct-preorder-inorder", note: "Another problem where inorder position carries structural meaning." },
    ],
    keyTakeaways: [
      "A valid BST has a strictly increasing inorder traversal.",
      "Exactly two swapped nodes create one or two inorder inversions.",
      "**first** is the previous node from the first inversion; **second** is the current node from the latest inversion.",
      "Swapping values restores the BST while preserving its structure.",
    ],
    pattern:
      "Inorder invariant repair: scan the sorted-order stream, record inversion endpoints, then swap the two offending values.",
  },
  {
    kind: "problem",
    slug: "tree-house-robber-iii",
    moduleId: "tree-advanced",
    order: 30,
    title: "House Robber III",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/house-robber-iii/",
    tags: ["Tree", "DFS", "Dynamic Programming", "Postorder", "Recursion"],
    companies: ["Microsoft", "Amazon", "Google", "Meta", "Uber"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 28,
    statementMD:
      "The houses form a binary tree. Each node contains money, and directly connected houses cannot both be robbed. Given the **root**, return the maximum amount of money that can be robbed without robbing any parent-child pair together.",
    constraints: [
      "1 <= number of nodes <= 10^4",
      "0 <= Node.val <= 10^4",
      "The input is a binary tree",
    ],
    inputMD:
      "The **root** pointer of a binary tree where each node value is the money in that house.",
    outputMD:
      "An integer: the maximum money that can be robbed without choosing adjacent parent-child nodes.",
    examples: [
      {
        input: "root = [3,2,3,null,3,null,1]",
        output: "7",
        explanation: "Rob the root **3**, skip its children **2** and **3**, and rob grandchildren **3** and **1** for a total of **7**.",
      },
      {
        input: "root = [3,4,5,1,3,null,1]",
        output: "9",
        explanation: "Skip the root and rob nodes **4** and **5** for a total of **9**. Robbing the root would block both children.",
      },
    ],
    learningObjectives: [
      "Model each subtree with two values: rob this root or skip this root.",
      "Use postorder DFS so children are solved before the parent chooses.",
      "Explain the recurrence without relying on linear House Robber indexing.",
      "Connect binary-tree recursion to dynamic programming over subtrees.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe technique is **subtree DP pair**. The signal is a tree with a choose-or-skip constraint between a node and its children. A single value per subtree is not enough, because the parent needs to know two scenarios: what if this child is robbed, and what if this child is skipped?\n\nSo every node returns a pair **[robThis, skipThis]**. If you rob the current node, you must skip both children, so the value is the node money plus each child skip value. If you skip the current node, each child is free to choose its better option, so you add the maximum of each child pair. This is tree DP expressed through postorder recursion.",
    commonMistakes: [
      "Using the linear House Robber recurrence and ignoring that a tree has two child subproblems.",
      "Returning only one best value from a child, which loses whether the child itself was robbed.",
      "Adding child robbed values when robbing the parent, which violates the adjacency rule.",
      "Trying to greedily rob larger-valued nodes without considering grandchildren.",
    ],
    algorithmMD:
      "**Key idea**\n\nFor each node, compute two answers for its entire subtree. **robThis** means the current node is robbed, so children must contribute their skip values. **skipThis** means the current node is skipped, so each child contributes the better of robbing or skipping that child. A postorder traversal guarantees both child pairs are ready before the parent pair is built.\n\n**Recursion walkthrough**\n\nUse **[3,2,3,null,3,null,1]**. The leaf **3** under node **2** returns **[3, 0]** because robbing it gives **3** and skipping it gives **0**. Node **2** sees no left child and that right leaf pair, so robbing **2** gives **2**, while skipping **2** lets the child contribute **3**. It returns **[2, 3]**.\n\nThe right child **3** with leaf **1** returns **[3, 1]**. At the root **3**, robbing the root gives **3 + left.skip 3 + right.skip 1 = 7**. Skipping the root gives **max(2, 3) + max(3, 1) = 6**. The final answer is **7**.\n\n**Algorithm**\n\n1. Define a postorder helper that returns **[robThis, skipThis]** for a subtree.\n2. For an empty node, return **[0, 0]**.\n3. Recursively get the left child pair.\n4. Recursively get the right child pair.\n5. Compute **robThis** as the current value plus the skip values from both children.\n6. Compute **skipThis** as the sum of the better value from each child pair.\n7. Return the pair and take the maximum of the root pair as the final answer.",
    solutions: [
      {
        name: "Postorder subtree DP pair",
        whenToUseMD:
          "Use this as the canonical solution. It is linear, does not need a hash map, and makes the parent-child compatibility rule explicit.",
        approachMD:
          "Let every subtree return two numbers. The first is the best total when the subtree root is robbed. The second is the best total when the subtree root is skipped. Build those two values from the already-solved child pairs.",
        walkthroughMD:
          "1. Return **[0, 0]** for a missing node.\n2. Recursively solve the left child.\n3. Recursively solve the right child.\n4. If robbing the current node, add **node.val** plus the skip values from both children.\n5. If skipping the current node, add the better value from the left child and the better value from the right child.\n6. Return the two-value result to the parent.\n7. At the root, return the larger of robbing or skipping it.",
        complexity: { time: "O(n)", space: "O(h)", note: "Each node creates one constant-size pair; recursion stack height is **h**, which can be **n** for a skewed tree." },
        filename: "Solution.java",
        code: `class TreeNode { int val; TreeNode left; TreeNode right; TreeNode(int x){ val = x; } }

class Solution {

    public int rob(TreeNode root) {
        int[] result = solve(root);
        return Math.max(result[0], result[1]);
    }

    private int[] solve(TreeNode node) {
        if (node == null) {
            return new int[] { 0, 0 };
        }

        int[] left = solve(node.left);
        int[] right = solve(node.right);

        int robThis = node.val + left[1] + right[1];
        int skipThis = Math.max(left[0], left[1]) + Math.max(right[0], right[1]);
        return new int[] { robThis, skipThis };
    }
}`,
      },
    ],
    dryRun: {
      inputMD:
        "root = **[3,2,3,null,3,null,1]**. Each row shows the pair returned after both children are processed.",
      columns: ["node", "left pair", "right pair", "robThis", "skipThis", "returned pair"],
      rows: [
        ["leaf 3 under 2", "[0, 0]", "[0, 0]", "3", "0", "[3, 0]"],
        ["node 2", "[0, 0]", "[3, 0]", "2", "3", "[2, 3]"],
        ["leaf 1", "[0, 0]", "[0, 0]", "1", "0", "[1, 0]"],
        ["right node 3", "[0, 0]", "[1, 0]", "3", "1", "[3, 1]"],
        ["root 3", "[2, 3]", "[3, 1]", "7", "6", "[7, 6]"],
      ],
      narrativeMD:
        "The root returns **[7, 6]**, so the best valid robbery is **7** by robbing the root and the two grandchildren.",
    },
    complexityNote:
      "This is dynamic programming on a tree, but it belongs in the Trees course as a postorder aggregation pattern rather than a DP-course state-table lesson.",
    interviewTipsMD:
      "Avoid saying only **best subtree value** because the parent needs compatibility information. Name the two returned values clearly: **robThis** and **skipThis**. Then derive the recurrence in words: robbing a node forces child skips, while skipping a node lets each child choose its better option. This explanation connects tree recursion directly to DP.",
    followUps: [
      "How would you reconstruct which nodes are robbed, not just the maximum amount?",
      "What changes if grandchildren also cannot both be robbed with a grandparent?",
      "How would the solution change for an n-ary tree?",
      "How is this related to the original House Robber problem on an array?",
    ],
    similarProblems: [
      { title: "Binary Tree Maximum Path Sum", difficulty: "Hard", slug: "tree-max-path-sum", note: "Another postorder problem where each node returns information to its parent." },
      { title: "Diameter of Binary Tree", difficulty: "Easy", slug: "tree-diameter", note: "Also combines left and right subtree values in postorder." },
      { title: "Binary Tree Postorder Traversal", difficulty: "Easy", slug: "tree-postorder-traversal", note: "The traversal order that makes child results available before the parent." },
      { title: "House Robber", difficulty: "Medium", url: "https://leetcode.com/problems/house-robber/", note: "The linear version of the same choose-or-skip family." },
      { title: "Binary Tree Cameras", difficulty: "Hard", url: "https://leetcode.com/problems/binary-tree-cameras/", note: "A harder tree DP with multiple states per node." },
    ],
    keyTakeaways: [
      "Tree DP often returns multiple values per node so the parent can make a compatible choice.",
      "Robbing a node combines with each child skip value.",
      "Skipping a node combines with the best option from each child.",
      "Postorder traversal is what makes the child DP pairs available before computing the parent pair.",
    ],
    pattern:
      "Subtree DP pair: return the best value when taking the current node and when skipping it, then let the parent combine only compatible states.",
  },
];
