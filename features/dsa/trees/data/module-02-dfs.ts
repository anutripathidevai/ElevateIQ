import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "tree-inorder-traversal",
    moduleId: "tree-dfs",
    order: 7,
    title: "Binary Tree Inorder Traversal",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/binary-tree-inorder-traversal/",
    tags: ["Tree", "DFS", "Inorder", "Stack", "Recursion"],
    companies: ["Microsoft", "Amazon", "Google", "Meta", "Bloomberg"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 15,
    statementMD:
      "Given the **root** of a binary tree, return the inorder traversal of its node values. In inorder traversal, visit the left subtree, then the current node, then the right subtree.",
    constraints: [
      "0 <= number of nodes <= 100",
      "-100 <= Node.val <= 100",
    ],
    inputMD: "The **root** pointer of a binary tree, or **null** for an empty tree.",
    outputMD: "A list of integers in left, node, right order.",
    examples: [
      {
        input: "root = [1,null,2,3]",
        output: "[1,3,2]",
        explanation: "Node **1** is visited after its empty left subtree. Node **2** waits for left child **3**, so **3** appears before **2**.",
      },
      {
        input: "root = []",
        output: "[]",
        explanation: "An empty tree has no nodes to visit.",
      },
    ],
    learningObjectives: [
      "Recognise inorder as the left, node, right DFS order.",
      "Explain that visiting means appending a node value only after its left subtree finishes.",
      "Convert the recursive call stack into an explicit stack.",
      "Connect inorder traversal with sorted output in a BST.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is **inorder traversal**, **left, root, right**, or a BST task that needs values in sorted order. Visiting a node means appending its value to the answer list. In inorder, the visit is delayed until the left subtree has completely finished.\n\nThe common trap is appending the node too early. If the value is added before the left call, the traversal becomes preorder. In the iterative version, the stack stores ancestors while the traversal keeps walking left.",
    commonMistakes: [
      "Appending before traversing the left subtree, which changes the order to preorder.",
      "Forgetting to move to the right child after popping a node from the stack.",
      "Pushing **null** into **ArrayDeque** instead of checking children first.",
      "Ignoring the O(h) recursion stack used by the recursive solution.",
    ],
    algorithmMD:
      "**Key idea**\n\nInorder treats every node as the middle of a three-part sequence: left subtree, node, right subtree. The recursive version writes those three actions directly. The iterative version simulates the same delayed visit by pushing nodes while moving left, then popping the next node whose left side is done.\n\n**Recursion walkthrough**\n\nUse **[1,null,2,3]**. Start at **1** and recurse left; that child is **null**, so return and visit **1**, giving **[1]**. Move right to **2**. Before **2** can be visited, recurse left to **3**. Node **3** has no left child, so visit **3**, giving **[1,3]**. Return to **2**, visit it, and finish with **[1,3,2]**. The explicit stack mirrors the same pauses: push **1**, pop and visit it, push **2**, push **3**, visit **3**, then visit **2**.\n\n**Algorithm**\n\n1. For recursion, return on **null**.\n2. Recurse into **node.left**.\n3. Append **node.val**.\n4. Recurse into **node.right**.\n5. For iteration, push nodes while walking left.\n6. Pop one node, append it, then move to its right child.\n7. Stop when there is no current node and the stack is empty.",
    solutions: [
      {
        name: "Recursive inorder DFS",
        whenToUseMD:
          "Use this when recursion is allowed. It is the clearest expression of left, node, right.",
        approachMD:
          "Run a helper that returns on **null**, recursively finishes the left subtree, appends the current value, then recursively finishes the right subtree.",
        walkthroughMD:
          "1. Create an empty result list.\n2. Call **dfs(root, result)**.\n3. If **node** is **null**, return.\n4. Recurse on **node.left**.\n5. Add **node.val** to the result.\n6. Recurse on **node.right** and return the list.",
        complexity: { time: "O(n)", space: "O(h)", note: "Every node is visited once; the recursion stack grows to tree height **h**, which is O(n) for a skewed tree." },
        filename: "Solution.java",
        code: `import java.util.*;

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;

    TreeNode(int x) {
        val = x;
    }
}

class Solution {

    public List<Integer> inorderTraversal(TreeNode root) {
        List<Integer> values = new ArrayList<>();
        dfs(root, values);
        return values;
    }

    private void dfs(TreeNode node, List<Integer> values) {
        if (node == null) {
            return;
        }

        dfs(node.left, values);
        values.add(node.val);
        dfs(node.right, values);
    }
}`,
      },
      {
        name: "Iterative inorder with explicit stack",
        whenToUseMD:
          "Use this when recursion depth is a concern or the interviewer asks for a manual stack.",
        approachMD:
          "Walk left while pushing ancestors. When left is exhausted, pop the next ancestor, visit it, and then explore its right subtree.",
        walkthroughMD:
          "1. Create an empty result list and stack.\n2. Set **current** to **root**.\n3. While **current** exists, push it and move left.\n4. Pop the stack when the left chain ends.\n5. Append the popped node value.\n6. Move **current** to the popped node right child and repeat.",
        complexity: { time: "O(n)", space: "O(h)", note: "Each node is pushed and popped once; the explicit stack holds a path of height **h**, O(n) in the worst case." },
        filename: "Solution.java",
        code: `import java.util.*;

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;

    TreeNode(int x) {
        val = x;
    }
}

class Solution {

    public List<Integer> inorderTraversal(TreeNode root) {
        List<Integer> values = new ArrayList<>();
        Deque<TreeNode> stack = new ArrayDeque<>();
        TreeNode current = root;

        while (current != null || !stack.isEmpty()) {
            while (current != null) {
                stack.push(current);
                current = current.left;
            }

            current = stack.pop();
            values.add(current.val);
            current = current.right;
        }

        return values;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "root = **[1,null,2,3]**. Track the iterative stack; the top is shown on the right.",
      columns: ["step", "current", "action", "stack", "result"],
      rows: [
        ["start", "1", "begin", "[]", "[]"],
        ["1", "1", "push and move left", "[1]", "[]"],
        ["2", "null", "pop and visit 1", "[]", "[1]"],
        ["3", "2", "push 2, then push 3", "[2,3]", "[1]"],
        ["4", "null", "pop and visit 3", "[2]", "[1,3]"],
        ["5", "null", "pop and visit 2", "[]", "[1,3,2]"],
      ],
      narrativeMD: "A node is appended only after its left side has finished. That is why **3** appears before **2**.",
    },
    complexityNote:
      "Both solutions are O(n) time. Recursion uses O(h) call-stack space; iteration uses O(h) explicit-stack space.",
    interviewTipsMD:
      "State the order before coding: **left, node, right**. For BSTs, inorder streams values in sorted order, which leads directly to validation and kth-smallest follow-ups. If asked about O(1) auxiliary space, mention **Morris traversal**, which temporarily rewires predecessor links, but do not code it unless requested.",
    followUps: [
      "How does inorder traversal produce sorted values in a BST?",
      "Can you stop after the kth visited node?",
      "Can you write the traversal without recursion?",
      "What tradeoff does Morris traversal make to reach O(1) auxiliary space?",
    ],
    similarProblems: [
      { title: "Binary Tree Preorder Traversal", difficulty: "Easy", slug: "tree-preorder-traversal", note: "Same DFS skeleton with the node visited before both children." },
      { title: "Binary Tree Postorder Traversal", difficulty: "Easy", slug: "tree-postorder-traversal", note: "Moves the visit after both children." },
      { title: "Kth Smallest Element in a BST", difficulty: "Medium", slug: "tree-kth-smallest-bst", note: "Uses inorder traversal to stream sorted BST values." },
      { title: "Validate Binary Search Tree", difficulty: "Medium", slug: "tree-validate-bst", note: "Related through inorder ordering and BST invariants." },
    ],
    keyTakeaways: [
      "Inorder means **left, node, right**.",
      "The current node is visited after its left subtree completes.",
      "The explicit stack stores ancestors while the traversal walks left.",
      "Inorder is the traversal most closely tied to BST sorted order.",
    ],
    pattern:
      "Inorder DFS: process the left subtree, visit the node, then process the right subtree.",
  },
  {
    kind: "problem",
    slug: "tree-preorder-traversal",
    moduleId: "tree-dfs",
    order: 8,
    title: "Binary Tree Preorder Traversal",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/binary-tree-preorder-traversal/",
    tags: ["Tree", "DFS", "Preorder", "Stack", "Recursion"],
    companies: ["Microsoft", "Amazon", "Google", "Meta", "Apple"],
    estimatedReadingMin: 7,
    estimatedSolvingMin: 15,
    statementMD:
      "Given the **root** of a binary tree, return the preorder traversal of its node values. In preorder traversal, visit the current node first, then the left subtree, then the right subtree.",
    constraints: [
      "0 <= number of nodes <= 100",
      "-100 <= Node.val <= 100",
    ],
    inputMD: "The **root** pointer of a binary tree, or **null** for an empty tree.",
    outputMD: "A list of integers in node, left, right order.",
    examples: [
      {
        input: "root = [1,null,2,3]",
        output: "[1,2,3]",
        explanation: "Visit **1** immediately, then visit **2** before its left child **3** because preorder visits the node before descendants.",
      },
      {
        input: "root = []",
        output: "[]",
        explanation: "There is no root to visit, so the traversal is empty.",
      },
    ],
    learningObjectives: [
      "Recognise preorder as the node, left, right DFS order.",
      "Use preorder when parent work must happen before child work.",
      "Implement iterative preorder by pushing right before left.",
      "Explain how stack insertion order controls traversal order.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is **preorder traversal**, **root, left, right**, serialization, copying, or tree construction where a parent must be handled before its children. Visiting a node means appending its value immediately when the traversal arrives.\n\nThe stack trap is subtle: a stack is last-in, first-out. To process the left child next, push the right child first and the left child second. If you push left first, the right subtree comes out before the left subtree.",
    commonMistakes: [
      "Traversing left before appending the node, which no longer produces preorder.",
      "Pushing the left child before the right child in the iterative version.",
      "Pushing **null** children into **ArrayDeque**.",
      "Forgetting that recursive preorder still uses O(h) call-stack space.",
    ],
    algorithmMD:
      "**Key idea**\n\nPreorder is announce first, descend second. Visit the node, then traverse the left subtree, then traverse the right subtree. The iterative stack stores future work; push right before left so left is popped first.\n\n**Recursion walkthrough**\n\nUse **[1,null,2,3]**. Start at **1** and visit it immediately, so the result is **[1]**. The left child is **null**, so return. Move to right child **2** and visit it, giving **[1,2]**. Then recurse into **2**'s left child **3**, visit **3**, and finish with **[1,2,3]** after all **null** child calls return. The stack version pops **1**, pushes **2**, then pops **2** and pushes **3** so **3** is next.\n\n**Algorithm**\n\n1. For recursion, return on **null**.\n2. Append **node.val** immediately.\n3. Recurse into **node.left**.\n4. Recurse into **node.right**.\n5. For iteration, push **root** if it exists.\n6. Pop a node, append it, push its right child, then push its left child.\n7. Stop when the stack is empty.",
    solutions: [
      {
        name: "Recursive preorder DFS",
        whenToUseMD:
          "Use this when recursion is allowed and you want the clearest node, left, right implementation.",
        approachMD:
          "Visit the current node before making child calls, then recurse left and right in that order.",
        walkthroughMD:
          "1. Create an empty result list.\n2. Call a helper on **root**.\n3. Return immediately for **null**.\n4. Append **node.val**.\n5. Recurse on **node.left**.\n6. Recurse on **node.right** and return the list.",
        complexity: { time: "O(n)", space: "O(h)", note: "Every node is visited once; the recursion stack contains at most one root-to-leaf path, O(h) and O(n) when skewed." },
        filename: "Solution.java",
        code: `import java.util.*;

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;

    TreeNode(int x) {
        val = x;
    }
}

class Solution {

    public List<Integer> preorderTraversal(TreeNode root) {
        List<Integer> values = new ArrayList<>();
        dfs(root, values);
        return values;
    }

    private void dfs(TreeNode node, List<Integer> values) {
        if (node == null) {
            return;
        }

        values.add(node.val);
        dfs(node.left, values);
        dfs(node.right, values);
    }
}`,
      },
      {
        name: "Iterative preorder with stack",
        whenToUseMD:
          "Use this when recursion is disallowed. The key detail to say aloud is **push right then left**.",
        approachMD:
          "Keep a stack of nodes waiting to be visited. Pop one node, append it, then push its right child before its left child so the left child is processed next.",
        walkthroughMD:
          "1. Create an empty result list and stack.\n2. Push **root** if it is not **null**.\n3. Pop the top node.\n4. Append its value.\n5. Push **node.right** if it exists.\n6. Push **node.left** if it exists.\n7. Repeat until the stack is empty.",
        complexity: { time: "O(n)", space: "O(h)", note: "Each node is pushed and popped once; the stack stores the DFS frontier, bounded by height **h** and O(n) worst-case." },
        filename: "Solution.java",
        code: `import java.util.*;

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;

    TreeNode(int x) {
        val = x;
    }
}

class Solution {

    public List<Integer> preorderTraversal(TreeNode root) {
        List<Integer> values = new ArrayList<>();
        if (root == null) {
            return values;
        }

        Deque<TreeNode> stack = new ArrayDeque<>();
        stack.push(root);

        while (!stack.isEmpty()) {
            TreeNode node = stack.pop();
            values.add(node.val);

            if (node.right != null) {
                stack.push(node.right);
            }
            if (node.left != null) {
                stack.push(node.left);
            }
        }

        return values;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "root = **[1,null,2,3]**. Track iterative preorder; the top of the stack is shown on the right.",
      columns: ["step", "popped", "children pushed", "stack", "result"],
      rows: [
        ["start", "none", "push root 1", "[1]", "[]"],
        ["1", "1", "push right child 2", "[2]", "[1]"],
        ["2", "2", "push left child 3 after checking right", "[3]", "[1,2]"],
        ["3", "3", "no children", "[]", "[1,2,3]"],
      ],
      narrativeMD: "The result grows as soon as a node is popped. Pushing right before left preserves node, left, right order.",
    },
    complexityNote:
      "Both implementations are O(n) time. The recursive one uses O(h) call-stack space; the iterative one uses O(h) explicit-stack space.",
    interviewTipsMD:
      "Preorder is parent-first. That makes it natural for serialization with null markers, cloning, and reconstruction when paired with inorder. In the iterative solution, say **push right then left** before writing code; it shows you understand how the stack determines order.",
    followUps: [
      "How would you include **null** markers to serialize a tree with preorder?",
      "How does preorder plus inorder reconstruct a unique tree?",
      "Can you write the traversal with an explicit stack?",
      "How would you collect root-to-leaf paths using a preorder DFS?",
    ],
    similarProblems: [
      { title: "Binary Tree Inorder Traversal", difficulty: "Easy", slug: "tree-inorder-traversal", note: "Same DFS skeleton but the visit happens between child traversals." },
      { title: "Binary Tree Postorder Traversal", difficulty: "Easy", slug: "tree-postorder-traversal", note: "Delays the node visit until after both children." },
      { title: "Maximum Depth of Binary Tree", difficulty: "Easy", slug: "tree-maximum-depth", note: "Uses DFS recursion to return subtree information." },
      { title: "Construct Binary Tree from Preorder and Inorder Traversal", difficulty: "Medium", slug: "tree-construct-preorder-inorder", note: "Preorder reveals each subtree root during construction." },
    ],
    keyTakeaways: [
      "Preorder means **node, left, right**.",
      "Visiting happens immediately when the traversal reaches a node.",
      "The iterative stack must push right before left.",
      "Preorder is the parent-first traversal used in serialization and construction.",
    ],
    pattern:
      "Preorder DFS: visit the current node first, then process the left subtree before the right subtree.",
  },
  {
    kind: "problem",
    slug: "tree-postorder-traversal",
    moduleId: "tree-dfs",
    order: 9,
    title: "Binary Tree Postorder Traversal",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/binary-tree-postorder-traversal/",
    tags: ["Tree", "DFS", "Postorder", "Stack", "Recursion"],
    companies: ["Microsoft", "Amazon", "Google", "Meta", "Adobe"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 18,
    statementMD:
      "Given the **root** of a binary tree, return the postorder traversal of its node values. In postorder traversal, visit the left subtree, then the right subtree, then the current node.",
    constraints: [
      "0 <= number of nodes <= 100",
      "-100 <= Node.val <= 100",
    ],
    inputMD: "The **root** pointer of a binary tree, or **null** for an empty tree.",
    outputMD: "A list of integers in left, right, node order.",
    examples: [
      {
        input: "root = [1,null,2,3]",
        output: "[3,2,1]",
        explanation: "Node **3** is visited before **2**, and **1** waits until its entire right subtree is complete.",
      },
      {
        input: "root = []",
        output: "[]",
        explanation: "An empty tree contributes no values.",
      },
    ],
    learningObjectives: [
      "Recognise postorder as the left, right, node DFS order.",
      "Explain why parents wait until both child subtrees finish.",
      "Use postorder as the bridge from traversal to subtree aggregation.",
      "Implement an iterative reverse-preorder or two-stack solution.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is **postorder traversal**, **left, right, root**, or any task where a node needs both child results before acting. Visiting a node means appending its value after both the left and right subtrees have already been visited.\n\nThe common trap is visiting after only the left subtree. That produces inorder, not postorder. Postorder is children-before-parent, which is why it appears in height, diameter, balance, deletion, and tree DP problems.",
    commonMistakes: [
      "Appending the node between left and right calls, which produces inorder.",
      "Appending immediately in a stack loop without reversing or tracking completion.",
      "Using the wrong child push order for reverse preorder.",
      "Forgetting the O(h) recursion stack in the recursive version.",
    ],
    algorithmMD:
      "**Key idea**\n\nPostorder makes the parent last. Recursively process **node.left**, then **node.right**, then visit **node**. Iteratively, a compact trick is to generate node, right, left order and add every visited value to the front, reversing the stream into left, right, node.\n\n**Recursion walkthrough**\n\nUse **[1,null,2,3]**. Start at **1** and recurse left; that **null** returns. Recurse right to **2**. At **2**, recurse left to **3**. Node **3** has two **null** children, so it can be visited first and the result becomes **[3]**. Return to **2**, finish its right **null**, then visit **2** for **[3,2]**. Return to **1** and visit it last, producing **[3,2,1]**. With reverse preorder, the pop stream is **1,2,3**, and adding each value to the front produces **[3,2,1]**.\n\n**Algorithm**\n\n1. For recursion, return on **null**.\n2. Recurse into **node.left**.\n3. Recurse into **node.right**.\n4. Append **node.val** after both calls return.\n5. For reverse preorder, push **root** if it exists.\n6. Pop a node, add its value to the front, push left, then push right.\n7. Stop when the stack is empty.",
    solutions: [
      {
        name: "Recursive postorder DFS",
        whenToUseMD:
          "Use this when recursion is allowed. It directly communicates that the parent waits for both children.",
        approachMD:
          "Run a helper that returns on **null**, recursively finishes the left subtree, recursively finishes the right subtree, and only then appends the current value.",
        walkthroughMD:
          "1. Create an empty result list.\n2. Call a helper on **root**.\n3. Return immediately for **null**.\n4. Recurse on **node.left**.\n5. Recurse on **node.right**.\n6. Add **node.val** after both child calls finish.\n7. Return the list.",
        complexity: { time: "O(n)", space: "O(h)", note: "Each node is visited once; the recursion stack grows to height **h**, O(n) for a skewed tree." },
        filename: "Solution.java",
        code: `import java.util.*;

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;

    TreeNode(int x) {
        val = x;
    }
}

class Solution {

    public List<Integer> postorderTraversal(TreeNode root) {
        List<Integer> values = new ArrayList<>();
        dfs(root, values);
        return values;
    }

    private void dfs(TreeNode node, List<Integer> values) {
        if (node == null) {
            return;
        }

        dfs(node.left, values);
        dfs(node.right, values);
        values.add(node.val);
    }
}`,
      },
      {
        name: "Iterative reverse-preorder stack",
        whenToUseMD:
          "Use this when recursion is not allowed and a concise iterative postorder is preferred over a visited-flag stack.",
        approachMD:
          "Process nodes in node, right, left order while inserting each value at the front of the answer. Front insertion reverses that stream into left, right, node.",
        walkthroughMD:
          "1. Create a linked list for results and return it if **root** is **null**.\n2. Push **root** onto the stack.\n3. Pop a node and add its value to the front.\n4. Push **node.left** if it exists.\n5. Push **node.right** if it exists, so right is popped before left.\n6. Repeat until the stack is empty.",
        complexity: { time: "O(n)", space: "O(h)", note: "Each node is pushed and popped once; the explicit stack stores O(h) pending nodes, O(n) in the worst case." },
        filename: "Solution.java",
        code: `import java.util.*;

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;

    TreeNode(int x) {
        val = x;
    }
}

class Solution {

    public List<Integer> postorderTraversal(TreeNode root) {
        LinkedList<Integer> values = new LinkedList<>();
        if (root == null) {
            return values;
        }

        Deque<TreeNode> stack = new ArrayDeque<>();
        stack.push(root);

        while (!stack.isEmpty()) {
            TreeNode node = stack.pop();
            values.addFirst(node.val);

            if (node.left != null) {
                stack.push(node.left);
            }
            if (node.right != null) {
                stack.push(node.right);
            }
        }

        return values;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "root = **[1,null,2,3]**. Track reverse preorder; values are inserted at the front.",
      columns: ["step", "popped", "children pushed", "stack", "result after addFirst"],
      rows: [
        ["start", "none", "push root 1", "[1]", "[]"],
        ["1", "1", "push right child 2 after checking left", "[2]", "[1]"],
        ["2", "2", "push left child 3", "[3]", "[2,1]"],
        ["3", "3", "no children", "[]", "[3,2,1]"],
      ],
      narrativeMD: "The stack pop order is node, right, left. Adding to the front reverses it into the required left, right, node order.",
    },
    complexityNote:
      "Both solutions are O(n) time. Recursion uses O(h) call-stack space; reverse preorder uses O(h) explicit-stack space plus the required output list.",
    interviewTipsMD:
      "Describe postorder as **children before parent**. That phrase explains traversal and harder aggregation problems. For iterative code, name the reverse-preorder trick and justify the push order; a one-stack visited-flag solution is also valid, but longer.",
    followUps: [
      "How would you implement iterative postorder with one stack and a visited marker?",
      "Why is postorder useful for computing height or deleting a tree?",
      "How does postorder help check whether a tree is balanced?",
      "Can the traversal return a value from each subtree instead of appending values?",
    ],
    similarProblems: [
      { title: "Binary Tree Inorder Traversal", difficulty: "Easy", slug: "tree-inorder-traversal", note: "Moves only the position of the node visit." },
      { title: "Binary Tree Preorder Traversal", difficulty: "Easy", slug: "tree-preorder-traversal", note: "Visits the node before either child." },
      { title: "Maximum Depth of Binary Tree", difficulty: "Easy", slug: "tree-maximum-depth", note: "Uses postorder to return depth values upward." },
      { title: "Diameter of Binary Tree", difficulty: "Easy", slug: "tree-diameter", note: "Combines child heights after both subtrees return." },
    ],
    keyTakeaways: [
      "Postorder means **left, right, node**.",
      "The parent is visited only after both subtrees complete.",
      "Reverse preorder plus front insertion is a compact iterative postorder.",
      "Postorder is the default order for subtree aggregation.",
    ],
    pattern:
      "Postorder DFS: finish both child subtrees, then visit or compute the parent result.",
  },
  {
    kind: "problem",
    slug: "tree-maximum-depth",
    moduleId: "tree-dfs",
    order: 10,
    title: "Maximum Depth of Binary Tree",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
    tags: ["Tree", "DFS", "Postorder", "Recursion", "Subtree Aggregation"],
    companies: ["Microsoft", "Amazon", "Google", "Meta", "Apple", "Bloomberg"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 15,
    statementMD:
      "Given the **root** of a binary tree, return its maximum depth. The maximum depth is the number of nodes along the longest path from the root node down to any leaf node.",
    constraints: [
      "0 <= number of nodes <= 10000",
      "-100 <= Node.val <= 100",
    ],
    inputMD: "The **root** pointer of a binary tree, or **null** for an empty tree.",
    outputMD: "An integer representing the maximum number of nodes on any root-to-leaf path.",
    examples: [
      {
        input: "root = [3,9,20,null,null,15,7]",
        output: "3",
        explanation: "The longest paths are **3 -> 20 -> 15** and **3 -> 20 -> 7**, each with three nodes.",
      },
      {
        input: "root = [1,null,2]",
        output: "2",
        explanation: "The longest path is **1 -> 2**, which contains two nodes.",
      },
      {
        input: "root = []",
        output: "0",
        explanation: "An empty tree has depth **0**.",
      },
    ],
    learningObjectives: [
      "Recognise maximum depth as postorder subtree aggregation.",
      "Use **null -> 0** as the base case.",
      "Combine child depths with **1 + max(left, right)**.",
      "Distinguish counting nodes from counting edges.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is **maximum depth**, **height**, or longest downward root-to-leaf path. This is a traversal where visiting means computing and returning a value for the current subtree, not appending to a list.\n\nA node cannot know its own answer until it knows the best answer from both children. That makes the order postorder: get the left depth, get the right depth, then return **1 + max(left, right)**. The common trap is returning **1** for **null**, which overcounts missing children.",
    commonMistakes: [
      "Returning **1** for a **null** child instead of **0**.",
      "Taking **min(left, right)** instead of **max(left, right)**.",
      "Counting edges when the problem asks for nodes on the path.",
      "Using a global variable even though the return value already carries the depth.",
    ],
    algorithmMD:
      "**Key idea**\n\nMaximum depth introduces subtree aggregation. A **null** subtree contributes **0**. A real node asks both children for their maximum depths and returns **1 + max(leftDepth, rightDepth)**, where **1** counts the current node.\n\n**Recursion walkthrough**\n\nUse **[3,9,20,null,null,15,7]**. Root **3** first asks left child **9**. Node **9** sees two **null** children, gets depths **0** and **0**, and returns **1**. Then **3** asks right child **20**. Node **20** asks **15** and **7**; both leaves return **1** for the same reason. Node **20** returns **1 + max(1, 1) = 2**. Finally **3** combines left depth **1** and right depth **2**, returning **1 + max(1, 2) = 3**. This is postorder because every parent returns after its children.\n\n**Algorithm**\n\n1. If **root** is **null**, return **0**.\n2. Recursively compute **leftDepth** from **root.left**.\n3. Recursively compute **rightDepth** from **root.right**.\n4. Return **1 + max(leftDepth, rightDepth)**.\n5. The value returned by the original root is the maximum depth.",
    solutions: [
      {
        name: "Postorder recursive depth aggregation",
        whenToUseMD:
          "Use this as the default solution. It mirrors the definition of maximum depth and sets up harder height-based problems.",
        approachMD:
          "Treat each subtree as the same problem. A **null** subtree returns **0**. A non-null node returns one plus the larger depth returned by its two children.",
        walkthroughMD:
          "1. If **root** is **null**, return **0**.\n2. Compute **leftDepth** by calling the function on **root.left**.\n3. Compute **rightDepth** by calling the function on **root.right**.\n4. Choose the larger child depth.\n5. Return **1 + max(leftDepth, rightDepth)**.",
        complexity: { time: "O(n)", space: "O(h)", note: "Every node performs one constant-time combine; the recursion stack is O(h), which becomes O(n) for a skewed tree." },
        filename: "Solution.java",
        code: `class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;

    TreeNode(int x) {
        val = x;
    }
}

class Solution {

    public int maxDepth(TreeNode root) {
        if (root == null) {
            return 0;
        }

        int leftDepth = maxDepth(root.left);
        int rightDepth = maxDepth(root.right);
        return 1 + Math.max(leftDepth, rightDepth);
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "root = **[3,9,20,null,null,15,7]**. Track postorder returns from leaves up to the root.",
      columns: ["node", "left depth", "right depth", "returned depth"],
      rows: [
        ["9", "0", "0", "1"],
        ["15", "0", "0", "1"],
        ["7", "0", "0", "1"],
        ["20", "1", "1", "2"],
        ["3", "1", "2", "3"],
      ],
      narrativeMD: "Leaves return **1** because they count themselves above two **null** depths. The root chooses the deeper right subtree and returns **3**.",
    },
    complexityNote:
      "The optimal DFS inspects every node once and stores only the current recursion path, O(h).",
    interviewTipsMD:
      "Call this a postorder aggregation, not just a traversal. The child calls return complete subtree answers, and the parent combines them. Be precise about **null -> 0** and about counting nodes, not edges; that prevents the common off-by-one mistakes.",
    followUps: [
      "How would minimum depth differ when one child is missing?",
      "How would you check whether the tree is height-balanced?",
      "How would you compute the diameter using returned child depths?",
      "Can you compute maximum depth with BFS level order?",
    ],
    similarProblems: [
      { title: "Binary Tree Postorder Traversal", difficulty: "Easy", slug: "tree-postorder-traversal", note: "Uses the same children-before-parent order." },
      { title: "Balanced Binary Tree", difficulty: "Easy", slug: "tree-balanced-binary-tree", note: "Also returns subtree heights while checking a condition." },
      { title: "Diameter of Binary Tree", difficulty: "Easy", slug: "tree-diameter", note: "Uses child depths to update a longest path." },
      { title: "Binary Tree Level Order Traversal", difficulty: "Medium", slug: "tree-level-order-traversal", note: "A BFS alternative can count levels instead of using recursion." },
    ],
    keyTakeaways: [
      "Maximum depth is postorder subtree aggregation.",
      "The base case is **null -> 0**.",
      "Each node returns **1 + max(leftDepth, rightDepth)**.",
      "The same combine template powers balance and diameter problems.",
    ],
    pattern:
      "Postorder aggregation: collect answers from the left and right subtrees, combine them locally, and return the subtree answer upward.",
  },
];
