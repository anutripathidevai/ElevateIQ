import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "tree-diameter",
    moduleId: "tree-recursive",
    order: 20,
    title: "Diameter of Binary Tree",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/diameter-of-binary-tree/",
    tags: ["Tree", "DFS", "Recursion", "Depth-First Search", "Postorder"],
    companies: ["Amazon", "Microsoft", "Google", "Meta", "Bloomberg"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 18,
    statementMD:
      "Given the **root** of a binary tree, return the length of the diameter of the tree. The diameter is the number of edges on the longest path between any two nodes. The path may or may not pass through the root.",
    constraints: [
      "0 <= number of nodes <= 10^4",
      "-100 <= Node.val <= 100",
    ],
    inputMD: "The **root** pointer of a binary tree, or **null** for an empty tree.",
    outputMD: "An integer: the number of edges on the longest path between any two nodes.",
    examples: [
      {
        input: "root = [1,2,3,4,5]",
        output: "3",
        explanation: "The longest path is **4 -> 2 -> 1 -> 3** or **5 -> 2 -> 1 -> 3**, which uses 3 edges.",
      },
      {
        input: "root = [1,2]",
        output: "1",
        explanation: "The longest path goes from **2** to **1**, so it contains 1 edge.",
      },
      {
        input: "root = []",
        output: "0",
        explanation: "An empty tree has no node-to-node path, so the diameter is 0.",
      },
    ],
    learningObjectives: [
      "Recognise diameter as a best path anywhere in the tree, not necessarily through the root.",
      "Use postorder recursion to compute child heights before combining them at the current node.",
      "Separate the value returned upward from the global best answer tracked across all nodes.",
      "Avoid confusing edge count with node count when computing the path through a node.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is a tree question asking for the best path **anywhere**, while each node can only learn about that path after seeing both subtrees. That is a postorder aggregation problem: ask the left child for a height, ask the right child for a height, then combine those two answers at the current node.\n\nThe important template is **return one value up, track a global best**. The value returned upward is the height of this subtree, because the parent can extend only one downward branch. The global best stores a different value: the longest path that bends through the current node, which is **leftHeight + rightHeight**.",
    commonMistakes: [
      "Returning the diameter upward instead of returning the height the parent needs.",
      "Counting nodes in the final answer even though the problem asks for edges.",
      "Only checking paths through the root and missing a larger diameter inside a subtree.",
      "Recomputing subtree heights from scratch at every node, which wastes time.",
    ],
    algorithmMD:
      "**Key idea**\n\nUse a postorder DFS. Let **height(node)** return the number of nodes on the longest downward chain starting at **node**. A **null** child has height 0. After computing **leftHeight** and **rightHeight**, the best path that passes through this node has **leftHeight + rightHeight** edges, so update a global diameter. Then return **1 + max(leftHeight, rightHeight)** upward.\n\n**Recursion walkthrough**\n\nFor **[1,2,3,4,5]**, visit leaves first. Node **4** has no children, so it returns height **1** and contributes path length **0**. Node **5** does the same. At node **2**, the left and right heights are both **1**, so the path through **2** has length **2**: **4 -> 2 -> 5**. The global diameter becomes **2**, while node **2** returns height **2** upward to node **1**.\n\nNode **3** returns height **1**. At node **1**, the left height is **2** from subtree **2**, and the right height is **1** from node **3**. The path through **1** has length **3**, so the global diameter becomes **3**. Node **1** returns height **3**, but the answer is the global diameter, not that returned height.\n\n**Algorithm**\n\n1. Initialise a global **diameter** to **0**.\n2. Define a recursive helper that returns subtree height.\n3. For a **null** node, return height **0**.\n4. Recursively compute **leftHeight** and **rightHeight**.\n5. Update **diameter** with **leftHeight + rightHeight** because that is the best path through the current node.\n6. Return **1 + max(leftHeight, rightHeight)** so the parent can extend one side.\n7. After DFS finishes, return the global **diameter**.",
    solutions: [
      {
        name: "Postorder height with global diameter",
        whenToUseMD:
          "Use this as the canonical interview solution. It computes every subtree height once and keeps the best cross-node path in a global variable.",
        approachMD:
          "Run a postorder DFS where each node returns its height to its parent. During the unwind, update a global **diameter** with the path that goes from the deepest node in the left subtree, through the current node, to the deepest node in the right subtree.",
        walkthroughMD:
          "1. Start **diameter** at **0**.\n2. Return **0** from the helper when the current node is **null**.\n3. Recursively compute the left and right heights.\n4. Update **diameter** with **leftHeight + rightHeight**.\n5. Return **1 + max(leftHeight, rightHeight)** as the height available to the parent.\n6. Return **diameter** after all nodes have been processed.",
        complexity: { time: "O(n)", space: "O(h)", note: "Each node is visited once; recursion uses stack space proportional to tree height." },
        filename: "Solution.java",
        code: `class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode(int x){ val = x; }
}

class Solution {
    private int diameter;

    public int diameterOfBinaryTree(TreeNode root) {
        diameter = 0;
        height(root);
        return diameter;
    }

    private int height(TreeNode node) {
        if (node == null) {
            return 0;
        }

        int leftHeight = height(node.left);
        int rightHeight = height(node.right);
        diameter = Math.max(diameter, leftHeight + rightHeight);
        return 1 + Math.max(leftHeight, rightHeight);
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "root = [1,2,3,4,5]. Heights use **null = 0**, so **leftHeight + rightHeight** counts edges through a node.",
      columns: ["node", "leftHeight", "rightHeight", "returned height", "globalBest"],
      rows: [
        ["4", "0", "0", "1", "0"],
        ["5", "0", "0", "1", "0"],
        ["2", "1", "1", "2", "2"],
        ["3", "0", "0", "1", "2"],
        ["1", "2", "1", "3", "3"],
      ],
      narrativeMD: "The root returns height **3**, but the answer is the separate global best **3**, representing a path with 3 edges.",
    },
    complexityNote:
      "The optimal recursive solution is O(n) time and O(h) stack space, where **h** is the tree height.",
    interviewTipsMD:
      "Say the separation out loud: the helper returns **height**, while the answer variable stores **diameter**. That prevents the most common bug, returning a forked path to the parent. Also clarify the height convention: with **null = 0**, a leaf returns **1**, and **leftHeight + rightHeight** is already an edge count.",
    followUps: [
      "How would you return the actual nodes on the diameter path?",
      "How would the answer change if the interviewer wanted the number of nodes instead of edges?",
      "How would you compute the diameter of an N-ary tree?",
      "What changes if every edge has a different positive weight?",
    ],
    similarProblems: [
      { title: "Maximum Depth of Binary Tree", difficulty: "Easy", slug: "tree-maximum-depth", note: "The returned height is the same primitive used by diameter." },
      { title: "Balanced Binary Tree", difficulty: "Easy", slug: "tree-balanced-binary-tree", note: "Also returns height upward after checking both children." },
      { title: "Binary Tree Maximum Path Sum", difficulty: "Hard", slug: "tree-max-path-sum", note: "Uses the same return-one-value and track-global-best template with sums." },
      { title: "House Robber III", difficulty: "Medium", slug: "tree-house-robber-iii", note: "Another postorder problem where each node aggregates subtree answers." },
    ],
    keyTakeaways: [
      "Diameter is a global best path, while height is the value a parent needs.",
      "Postorder traversal is natural whenever a node must combine answers from both subtrees.",
      "A path through a node uses **leftHeight + rightHeight** edges under the **null = 0** height convention.",
      "Never return a two-branch path upward; parents can extend only one branch.",
    ],
    pattern:
      "Postorder subtree aggregation: return the single downward value the parent can use, and update a global best for any answer that may live inside the current subtree.",
  },
  {
    kind: "problem",
    slug: "tree-balanced-binary-tree",
    moduleId: "tree-recursive",
    order: 21,
    title: "Balanced Binary Tree",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/balanced-binary-tree/",
    tags: ["Tree", "DFS", "Recursion", "Depth-First Search", "Height"],
    companies: ["Amazon", "Microsoft", "Google", "Meta", "Adobe"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 18,
    statementMD:
      "Given the **root** of a binary tree, determine whether it is height-balanced. A binary tree is height-balanced if, for every node, the heights of its left and right subtrees differ by no more than **1**.",
    constraints: [
      "0 <= number of nodes <= 5000",
      "-10^4 <= Node.val <= 10^4",
    ],
    inputMD: "The **root** pointer of a binary tree, or **null** for an empty tree.",
    outputMD: "A boolean: **true** if every node is height-balanced, otherwise **false**.",
    examples: [
      {
        input: "root = [3,9,20,null,null,15,7]",
        output: "true",
        explanation: "Every node has left and right subtree heights that differ by at most 1.",
      },
      {
        input: "root = [1,2,2,3,3,null,null,4,4]",
        output: "false",
        explanation: "The root has a left subtree of height 3 and a right subtree of height 1, so the difference is greater than 1.",
      },
      {
        input: "root = []",
        output: "true",
        explanation: "An empty tree is balanced because there is no node that violates the height condition.",
      },
    ],
    learningObjectives: [
      "Recognise balance checking as a bottom-up height aggregation problem.",
      "Use a sentinel value to combine height computation and unbalanced detection in one DFS.",
      "Short-circuit recursion as soon as any subtree is known to be unbalanced.",
      "Explain why recomputing heights at every node is avoidable.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is a property that must hold at **every node**, and the property depends on subtree heights. A top-down solution can ask for the height of each subtree repeatedly, but that repeats work on the same descendants. The better pattern is bottom-up: let each child report its height once.\n\nThe twist is failure propagation. If a child subtree is already unbalanced, the parent does not need its exact height anymore. Return a sentinel such as **-1** to mean unbalanced. That sentinel moves upward immediately, giving an O(n) solution instead of repeatedly recomputing heights.",
    commonMistakes: [
      "Checking only whether the root is balanced and ignoring deeper nodes.",
      "Calling a separate height function for every node, which can revisit the same subtree many times.",
      "Returning a normal height after discovering an unbalanced child instead of propagating **-1**.",
      "Using **null** as unbalanced even though **null** should have height **0** and be balanced.",
    ],
    algorithmMD:
      "**Key idea**\n\nUse one recursive function that returns either a real height or the sentinel **-1**. For a **null** node, return height **0**. For a real node, ask the left subtree for its value first. If it returns **-1**, immediately return **-1**. Then do the same for the right subtree. If both sides are valid but their heights differ by more than **1**, return **-1**. Otherwise return the actual height.\n\n**Recursion walkthrough**\n\nFor the balanced tree **[3,9,20,null,null,15,7]**, leaves **9**, **15**, and **7** each return height **1**. Node **20** receives heights **1** and **1**, so it returns **2**. Root **3** receives left height **1** and right height **2**, and the difference is **1**, so the whole tree returns height **3** and the answer is **true**.\n\nFor a skewed subtree such as **[1,2,2,3,null,null,null,4]**, leaf **4** returns **1**, node **3** returns **2**, and the left child **2** sees left height **2** and right height **0**. That difference is **2**, so it returns **-1**. When root **1** receives **-1** from its left child, it can return **-1** without needing the right subtree height.\n\n**Algorithm**\n\n1. Define a helper that returns subtree height, or **-1** if that subtree is unbalanced.\n2. Return **0** for a **null** node.\n3. Recursively compute the left height; if it is **-1**, return **-1** immediately.\n4. Recursively compute the right height; if it is **-1**, return **-1** immediately.\n5. If **abs(leftHeight - rightHeight) > 1**, return **-1**.\n6. Otherwise return **1 + max(leftHeight, rightHeight)**.\n7. The tree is balanced exactly when the helper result is not **-1**.",
    solutions: [
      {
        name: "Bottom-up height with sentinel",
        whenToUseMD:
          "Use this in interviews because it avoids repeated height calculations and makes early failure propagation explicit.",
        approachMD:
          "Compute height bottom-up, but return **-1** instead of a height as soon as a subtree is unbalanced. Parents treat **-1** as a hard failure and propagate it without doing extra work.",
        walkthroughMD:
          "1. Return **0** for **null** because an empty subtree is balanced with height **0**.\n2. Recursively ask the left subtree for a height-or-sentinel value.\n3. If the left value is **-1**, return **-1** immediately.\n4. Recursively ask the right subtree for a height-or-sentinel value.\n5. If the right value is **-1** or the two heights differ by more than **1**, return **-1**.\n6. Otherwise return the normal height **1 + max(leftHeight, rightHeight)**.\n7. Convert the root helper value into a boolean by checking whether it is not **-1**.",
        complexity: { time: "O(n)", space: "O(h)", note: "Each node is visited at most once, and the recursion stack is proportional to tree height." },
        filename: "Solution.java",
        code: `class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode(int x){ val = x; }
}

class Solution {

    public boolean isBalanced(TreeNode root) {
        return heightOrUnbalanced(root) != -1;
    }

    private int heightOrUnbalanced(TreeNode node) {
        if (node == null) {
            return 0;
        }

        int leftHeight = heightOrUnbalanced(node.left);
        if (leftHeight == -1) {
            return -1;
        }

        int rightHeight = heightOrUnbalanced(node.right);
        if (rightHeight == -1) {
            return -1;
        }

        if (Math.abs(leftHeight - rightHeight) > 1) {
            return -1;
        }

        return 1 + Math.max(leftHeight, rightHeight);
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "root = [1,2,2,3,null,null,null,4]. The left subtree becomes unbalanced before the root needs to inspect the right subtree.",
      columns: ["node", "leftHeight", "rightHeight", "returned value", "meaning"],
      rows: [
        ["4", "0", "0", "1", "leaf is balanced"],
        ["3", "1", "0", "2", "height difference is 1"],
        ["2", "2", "0", "-1", "height difference is 2, so this subtree is unbalanced"],
        ["1", "-1", "skipped", "-1", "left sentinel short-circuits the root"],
      ],
      narrativeMD: "The sentinel **-1** means the exact height no longer matters. Once it reaches the root, the final answer is **false**.",
    },
    complexityNote:
      "Bottom-up sentinel propagation is O(n) time and O(h) stack space; the naive repeated-height approach can be much slower on skewed trees.",
    interviewTipsMD:
      "Emphasise that the helper has a dual meaning: non-negative values are real heights, and **-1** means this subtree is already invalid. That lets you short-circuit while still doing a single postorder traversal. Interviewers often look for this because it avoids the common O(n log n) or O(n^2) repeated-height pattern.",
    followUps: [
      "How would you return the first node where the balance condition fails?",
      "How would the condition change for an AVL tree with stored heights?",
      "Can you solve the same check iteratively with an explicit stack?",
      "How would you maintain balance information while inserting into a tree?",
    ],
    similarProblems: [
      { title: "Maximum Depth of Binary Tree", difficulty: "Easy", slug: "tree-maximum-depth", note: "Computes the same height value without the balance sentinel." },
      { title: "Diameter of Binary Tree", difficulty: "Easy", slug: "tree-diameter", note: "Also combines left and right subtree heights in postorder." },
      { title: "Binary Tree Maximum Path Sum", difficulty: "Hard", slug: "tree-max-path-sum", note: "Another bottom-up recursion where invalid or negative contributions are handled before returning upward." },
      { title: "House Robber III", difficulty: "Medium", slug: "tree-house-robber-iii", note: "Postorder aggregation with multiple values returned from each subtree." },
    ],
    keyTakeaways: [
      "Balance must be checked at every node, not just at the root.",
      "A sentinel lets one DFS compute heights and propagate failure together.",
      "Return **-1** immediately when a child subtree is unbalanced.",
      "The optimal solution visits each node once and uses O(h) recursion stack.",
    ],
    pattern:
      "Bottom-up validation with sentinel: return the useful subtree value when valid, but return a failure marker immediately when any descendant violates the condition.",
  },
  {
    kind: "problem",
    slug: "tree-path-sum",
    moduleId: "tree-recursive",
    order: 22,
    title: "Path Sum",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/path-sum/",
    tags: ["Tree", "DFS", "Recursion", "Depth-First Search", "Root-to-Leaf"],
    companies: ["Amazon", "Microsoft", "Google", "Meta", "Apple"],
    estimatedReadingMin: 7,
    estimatedSolvingMin: 15,
    statementMD:
      "Given the **root** of a binary tree and an integer **targetSum**, return **true** if the tree has a root-to-leaf path such that adding up all node values along the path equals **targetSum**. A leaf is a node with no left child and no right child.",
    constraints: [
      "0 <= number of nodes <= 5000",
      "-1000 <= Node.val <= 1000",
      "-1000 <= targetSum <= 1000",
    ],
    inputMD: "The **root** pointer of a binary tree and an integer **targetSum**.",
    outputMD: "A boolean: **true** if at least one root-to-leaf path sums to **targetSum**, otherwise **false**.",
    examples: [
      {
        input: "root = [5,4,8,11,null,13,4,7,2,null,null,null,1], targetSum = 22",
        output: "true",
        explanation: "The path **5 -> 4 -> 11 -> 2** is root-to-leaf and sums to 22.",
      },
      {
        input: "root = [1,2,3], targetSum = 5",
        output: "false",
        explanation: "The path **1 -> 2** sums to 3 and the path **1 -> 3** sums to 4, so no root-to-leaf path reaches 5.",
      },
      {
        input: "root = [], targetSum = 0",
        output: "false",
        explanation: "An empty tree has no root-to-leaf path, so it cannot satisfy the target.",
      },
    ],
    learningObjectives: [
      "Recognise root-to-leaf path questions as top-down recursion with carried state.",
      "Track the remaining target by subtracting the current node value at each step.",
      "Check the target only at a true leaf, where both children are **null**.",
      "Use short-circuiting to stop once any valid path is found.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is a question about a **root-to-leaf** path and a target that changes as you move downward. Unlike diameter, there is no need to combine two children into one answer. The natural state flows top-down: after choosing a node, subtract its value from the remaining sum and ask a child to finish the job.\n\nThe trap is the leaf definition. A path is valid only if it ends at a node with **both** children **null**. You cannot return **true** just because the remaining sum becomes **0** at an internal node, and you cannot treat a missing child as a completed path.",
    commonMistakes: [
      "Checking **remaining == 0** before confirming the current node is a leaf.",
      "Treating a **null** child as a successful endpoint when the remaining sum is **0**.",
      "Subtracting the node value after the recursive calls instead of passing the reduced target downward.",
      "Forgetting that negative values are allowed, so overshooting the target is not a valid pruning rule.",
    ],
    algorithmMD:
      "**Key idea**\n\nCarry one value downward: the remaining sum needed from the current node to some leaf. At each node, subtract **node.val**. If the node is a leaf, return whether the new remaining sum is **0**. If it is not a leaf, recursively ask the left or right child to complete the path.\n\n**Recursion walkthrough**\n\nFor **[5,4,8,11,null,13,4,7,2,null,null,null,1]** with target **22**, start at **5** and reduce the remaining sum to **17**. Move to **4**, reduce to **13**. Move to **11**, reduce to **2**. The leaf **7** would reduce the remaining sum to **-5**, so that branch fails.\n\nThe sibling leaf **2** reduces the remaining sum from **2** to **0**. Because **2** has no left child and no right child, this is a complete root-to-leaf path, so the recursion returns **true**. That success bubbles back through **11**, **4**, and **5** without needing to explore every other branch.\n\n**Algorithm**\n\n1. If **root** is **null**, return **false** because there is no path.\n2. Subtract **root.val** from **targetSum** to get the remaining sum after using this node.\n3. If **root** is a leaf, return whether the remaining sum is **0**.\n4. Recursively check the left child with the remaining sum.\n5. Recursively check the right child with the remaining sum.\n6. Return **true** if either child can complete a valid path.",
    solutions: [
      {
        name: "Top-down remaining target DFS",
        whenToUseMD:
          "Use this direct recursive solution when the problem asks whether any root-to-leaf path satisfies a target.",
        approachMD:
          "Pass the remaining target downward. Each node consumes its own value. Only a leaf is allowed to decide success, because the path must end exactly at a leaf.",
        walkthroughMD:
          "1. Return **false** immediately for an empty tree.\n2. Compute **remaining = targetSum - root.val**.\n3. If the current node is a leaf, return whether **remaining == 0**.\n4. Recursively search the left subtree using **remaining**.\n5. Recursively search the right subtree using **remaining**.\n6. Return the logical OR of the two child results.",
        complexity: { time: "O(n)", space: "O(h)", note: "In the worst case every node is visited once; recursion stack depth is the tree height." },
        filename: "Solution.java",
        code: `class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode(int x){ val = x; }
}

class Solution {

    public boolean hasPathSum(TreeNode root, int targetSum) {
        if (root == null) {
            return false;
        }

        int remaining = targetSum - root.val;
        if (root.left == null && root.right == null) {
            return remaining == 0;
        }

        return hasPathSum(root.left, remaining) || hasPathSum(root.right, remaining);
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "root = [5,4,8,11,null,13,4,7,2,null,null,null,1], targetSum = 22. Follow the successful left-side branch and the failed sibling leaf.",
      columns: ["node", "remaining before", "remaining after subtract", "leaf?", "result returned"],
      rows: [
        ["5", "22", "17", "no", "wait for a child"],
        ["4", "17", "13", "no", "wait for a child"],
        ["11", "13", "2", "no", "wait for a child"],
        ["7", "2", "-5", "yes", "false"],
        ["2", "2", "0", "yes", "true"],
        ["11", "13", "2", "no", "true because leaf 2 succeeds"],
        ["5", "22", "17", "no", "true bubbles to the root"],
      ],
      narrativeMD: "The target check happens at leaf **2**, not at internal nodes. Once that leaf returns **true**, the OR chain short-circuits upward.",
    },
    complexityNote:
      "The DFS is O(n) time and O(h) stack space. It may stop early when a valid path is found.",
    interviewTipsMD:
      "Lead with the invariant: the recursive parameter is the remaining sum needed from the current node down to a leaf. Then state the leaf test precisely as **node.left == null && node.right == null**. This problem is often used to catch candidates who accidentally accept partial paths that end before a leaf.",
    followUps: [
      "How would you return all root-to-leaf paths that sum to the target?",
      "How would you count paths with a target sum if they can start and end anywhere?",
      "How would you solve it iteratively with a stack of nodes and remaining sums?",
      "What changes if node values can be very large and sums may overflow an integer?",
    ],
    similarProblems: [
      { title: "Maximum Depth of Binary Tree", difficulty: "Easy", slug: "tree-maximum-depth", note: "Also follows root-to-leaf depth using DFS." },
      { title: "Binary Tree Maximum Path Sum", difficulty: "Hard", slug: "tree-max-path-sum", note: "A harder path problem where paths may start and end anywhere." },
      { title: "House Robber III", difficulty: "Medium", slug: "tree-house-robber-iii", note: "Another tree recursion that carries a choice through parent-child relationships." },
      { title: "Path Sum II", difficulty: "Medium", url: "https://leetcode.com/problems/path-sum-ii/", note: "Returns all root-to-leaf paths instead of only a boolean." },
    ],
    keyTakeaways: [
      "Root-to-leaf target problems often carry a remaining value downward.",
      "Subtract the current node value before recursing into children.",
      "A valid path must end at a true leaf, where both children are **null**.",
      "Short-circuit OR is safe because the question asks whether any valid path exists.",
    ],
    pattern:
      "Top-down path recursion: carry remaining state from parent to child, and decide success only at the terminal node required by the problem.",
  },
  {
    kind: "problem",
    slug: "tree-max-path-sum",
    moduleId: "tree-recursive",
    order: 23,
    title: "Binary Tree Maximum Path Sum",
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/binary-tree-maximum-path-sum/",
    tags: ["Tree", "DFS", "Recursion", "Depth-First Search", "Postorder", "Hard Combine"],
    companies: ["Amazon", "Google", "Meta", "Microsoft", "Bloomberg", "ByteDance"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 30,
    statementMD:
      "A path in a binary tree is any sequence of connected nodes where each adjacent pair has a parent-child edge, and a node can appear at most once. The path does not need to pass through the root. Given the **root** of a non-empty binary tree, return the maximum possible path sum.",
    constraints: [
      "1 <= number of nodes <= 3 * 10^4",
      "-1000 <= Node.val <= 1000",
    ],
    inputMD: "The **root** pointer of a non-empty binary tree.",
    outputMD: "An integer: the largest sum over any valid connected path in the tree.",
    examples: [
      {
        input: "root = [1,2,3]",
        output: "6",
        explanation: "The best path is **2 -> 1 -> 3**, with sum **2 + 1 + 3 = 6**.",
      },
      {
        input: "root = [-10,9,20,null,null,15,7]",
        output: "42",
        explanation: "The best path is **15 -> 20 -> 7**, with sum **15 + 20 + 7 = 42**.",
      },
      {
        input: "root = [-3]",
        output: "-3",
        explanation: "The path must contain at least one node, so the single negative node is the best available path.",
      },
    ],
    learningObjectives: [
      "Distinguish the downward gain returned to a parent from the bent path considered for the global answer.",
      "Clamp negative child gains to **0** so harmful branches are not included.",
      "Use postorder recursion to combine subtree gains after both children are solved.",
      "Handle all-negative trees by initialising the global best below every possible node value.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is a tree path problem where the best path may start and end anywhere, and may bend through a node. This is the hard version of the same template as diameter: **return one value up, track a global best**. The parent can only extend a single downward chain from a child, but the answer at the current node may use both children and bend through the node.\n\nThe crucial distinction is return-value versus global-best. Return the best downward gain: **node.val** plus the better child gain, because the parent can attach to only one side. Update the global best with the bent path **node.val + leftGain + rightGain**. If a child gain is negative, clamp it to **0** because choosing that branch would only make the path worse.",
    commonMistakes: [
      "Returning a path that uses both left and right children, which cannot be extended by the parent.",
      "Forgetting to clamp negative gains to **0**, causing harmful branches to reduce good paths.",
      "Initialising the global best to **0**, which fails when every node value is negative.",
      "Assuming the best path must include the root.",
    ],
    algorithmMD:
      "**Key idea**\n\nFor each node, compute the best downward gain from its left child and right child. Clamp each gain with **max(0, childGain)** because a negative branch is better ignored. The path that bends through the current node is **node.val + leftGain + rightGain**; use it to update a global best. The value returned upward is **node.val + max(leftGain, rightGain)**, because a parent can continue through only one child branch.\n\n**Recursion walkthrough**\n\nFor **[-10,9,20,null,null,15,7]**, leaf **9** has left gain **0** and right gain **0**. It updates the global best to **9** and returns downward gain **9**. Leaf **15** updates the global best to **15** and returns **15**. Leaf **7** returns **7**, while the global best remains **15**.\n\nAt node **20**, the left gain is **15** and the right gain is **7**. The bent path through **20** is **20 + 15 + 7 = 42**, so the global best becomes **42**. But node **20** returns only **35** upward, representing **20 -> 15** as the best single downward chain.\n\nAt root **-10**, the left gain is **9** and the right gain is **35**. The bent path through the root is **34**, which does not beat **42**. The root returns **25**, but the answer remains the global best **42** from the bend through node **20**.\n\n**Algorithm**\n\n1. Initialise a global **bestSum** to the smallest integer value.\n2. Define a helper that returns the best downward gain starting at the current node.\n3. For **null**, return **0** because an absent child contributes nothing.\n4. Recursively compute left and right gains, clamping each to at least **0**.\n5. Update **bestSum** with **node.val + leftGain + rightGain** for the path bending through this node.\n6. Return **node.val + max(leftGain, rightGain)** so the parent receives one extendable chain.\n7. After DFS finishes, return **bestSum**.",
    solutions: [
      {
        name: "Postorder gain with global best path",
        whenToUseMD:
          "Use this when a tree path may start and end anywhere. It cleanly separates the extendable value returned upward from the complete path scored globally.",
        approachMD:
          "Run postorder DFS. Each node receives the best non-negative gains from its children, updates the global answer with the path that bends through itself, and returns only the best single downward chain to its parent.",
        walkthroughMD:
          "1. Initialise **bestSum** to **Integer.MIN_VALUE** so all-negative trees are handled.\n2. Return **0** for a **null** node.\n3. Recursively compute the left and right child gains.\n4. Clamp each child gain with **max(0, gain)**.\n5. Update **bestSum** with the bent path **node.val + leftGain + rightGain**.\n6. Return the extendable downward gain **node.val + max(leftGain, rightGain)**.",
        complexity: { time: "O(n)", space: "O(h)", note: "Every node contributes one constant-time combine step; recursion stack depth is the tree height." },
        filename: "Solution.java",
        code: `class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode(int x){ val = x; }
}

class Solution {
    private int bestSum;

    public int maxPathSum(TreeNode root) {
        bestSum = Integer.MIN_VALUE;
        maxGain(root);
        return bestSum;
    }

    private int maxGain(TreeNode node) {
        if (node == null) {
            return 0;
        }

        int leftGain = Math.max(0, maxGain(node.left));
        int rightGain = Math.max(0, maxGain(node.right));
        int pathThroughNode = node.val + leftGain + rightGain;
        bestSum = Math.max(bestSum, pathThroughNode);
        return node.val + Math.max(leftGain, rightGain);
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "root = [-10,9,20,null,null,15,7]. Track what each node returns upward versus how it updates the global best.",
      columns: ["node", "leftGain", "rightGain", "returned downward gain", "globalBest"],
      rows: [
        ["9", "0", "0", "9", "9"],
        ["15", "0", "0", "15", "15"],
        ["7", "0", "0", "7", "15"],
        ["20", "15", "7", "35", "42"],
        ["-10", "9", "35", "25", "42"],
      ],
      narrativeMD: "Node **20** returns **35** upward, but the answer is **42** because the complete path may bend through **20** and use both children.",
    },
    complexityNote:
      "The hard part is not complexity; it is preserving the invariant that returned gains are extendable single chains while the global best may be a completed bent path.",
    interviewTipsMD:
      "Use the phrase **extendable chain** for the return value and **complete candidate path** for the global update. That vocabulary prevents the classic bug of returning both children to the parent. Also mention why **bestSum** starts at **Integer.MIN_VALUE**: a tree like **[-3]** should return **-3**, not **0**.",
    followUps: [
      "How would you return the actual nodes on the maximum-sum path?",
      "How would the logic change for an N-ary tree where a path can use at most two child branches at a node?",
      "How would you compute the maximum path sum if every edge also had a weight?",
      "Can you write an iterative postorder version that preserves the same returned-gain invariant?",
    ],
    similarProblems: [
      { title: "Diameter of Binary Tree", difficulty: "Easy", slug: "tree-diameter", note: "The same return-one-value and update-global-best structure with lengths instead of sums." },
      { title: "Path Sum", difficulty: "Easy", slug: "tree-path-sum", note: "A simpler path problem with a top-down remaining target." },
      { title: "House Robber III", difficulty: "Medium", slug: "tree-house-robber-iii", note: "Another tree DP where each node returns information upward after considering children." },
      { title: "Path Sum III", difficulty: "Medium", url: "https://leetcode.com/problems/path-sum-iii/", note: "Counts target-sum paths that may start and end away from the root." },
    ],
    keyTakeaways: [
      "A parent can extend only one downward branch from a child.",
      "The global best may use both child gains and bend through the current node.",
      "Negative child gains should be clamped to **0** because they hurt the path.",
      "Initialise the global best for all-negative inputs, not to **0**.",
    ],
    pattern:
      "Hard postorder combine: return the best extendable downward gain, but update a global answer with the best completed path that may bend at the current node.",
  },
];
