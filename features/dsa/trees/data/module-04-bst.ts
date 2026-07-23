import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "tree-validate-bst",
    moduleId: "tree-bst-pattern",
    order: 15,
    title: "Validate Binary Search Tree",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/validate-binary-search-tree/",
    tags: ["Tree", "BST", "Binary Search Tree", "DFS", "Inorder Traversal"],
    companies: ["Microsoft", "Amazon", "Google", "Meta", "Apple"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 25,
    statementMD:
      "Given the **root** of a binary tree, determine whether it is a valid binary search tree. A valid BST requires every node in the left subtree to be strictly smaller than the current node, every node in the right subtree to be strictly larger, and both subtrees to obey the same rule.",
    constraints: [
      "1 <= number of nodes <= 10^4",
      "-2^31 <= Node.val <= 2^31 - 1",
    ],
    inputMD: "The **root** pointer of a binary tree whose nodes store integer values.",
    outputMD: "A boolean: **true** if the tree satisfies the strict BST ordering rule, otherwise **false**.",
    examples: [
      {
        input: "root = **[2,1,3]**",
        output: "**true**",
        explanation: "The left subtree contains only **1**, which is less than **2**, and the right subtree contains only **3**, which is greater than **2**.",
      },
      {
        input: "root = **[5,1,4,null,null,3,6]**",
        output: "**false**",
        explanation: "The node **4** is in the right subtree of **5**, but its left child **3** is also in that right subtree and is less than **5**, so the global BST range is violated.",
      },
      {
        input: "root = **[2,2,2]**",
        output: "**false**",
        explanation: "BST ordering is strict. Equal values are not allowed on either side of a node.",
      },
    ],
    learningObjectives: [
      "Explain why checking only a node against its direct children is not enough for BST validation.",
      "Carry an exclusive **low** and **high** value range through recursive subtree calls.",
      "Use inorder traversal as an equivalent strictly-increasing validation strategy.",
      "Handle integer boundary values safely with **Long** or nullable bounds.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is any prompt that asks whether a binary tree is a **valid BST**. A BST is not just local parent-child ordering. Every node inherits constraints from all ancestors, so a value deep in the left subtree of **5** must still be less than **5**, even if it is greater than its immediate parent.\n\nThe classic trap is checking only **node.left.val < node.val < node.right.val**. That misses violations that appear lower in the subtree. The reliable pattern is **BST -> compare and branch, inorder is sorted**: either pass down an exclusive **low, high** range during DFS, or perform inorder traversal and require the visited values to be strictly increasing.",
    commonMistakes: [
      "Checking only direct children and ignoring ancestor bounds.",
      "Allowing duplicate values even though the LeetCode BST definition is strict.",
      "Using **Integer.MIN_VALUE** and **Integer.MAX_VALUE** sentinels, then failing when a node has an extreme value.",
      "Using preorder or postorder values as if they must be sorted; only inorder has the sorted property for a BST.",
    ],
    algorithmMD:
      "**Key idea**\n\nEvery recursive call receives the open interval of values that subtree is allowed to contain. The root can be anywhere, so it starts with no lower or upper bound. When moving left, the current node becomes the new upper bound. When moving right, the current node becomes the new lower bound. A node is valid only if it is strictly inside its inherited range.\n\n**Recursion walkthrough**\n\nUse the tree **[5,3,8,2,6,7,9]**. A direct-child check might accept **6** because it is the right child of **3** and **6 > 3**. The range method catches the real problem. Start at **5** with no bounds. Move left to **3**, whose valid range is less than **5**. Move right to **6**, whose valid range is greater than **3** and less than **5**. The value **6** breaks the upper bound **5**, so the whole tree is invalid.\n\nFor a valid tree like **[5,3,8,2,4,7,9]**, the call at **4** carries the range greater than **3** and less than **5**, which **4** satisfies. The call at **7** carries greater than **5** and less than **8**, which **7** satisfies. Every node respects the bounds inherited from its ancestors.\n\n**Algorithm**\n\n1. Start DFS at **root** with **low = null** and **high = null**.\n2. If the current node is **null**, return **true** because an empty subtree is valid.\n3. If **low** exists and **node.val <= low**, return **false**.\n4. If **high** exists and **node.val >= high**, return **false**.\n5. Validate the left subtree with the same **low** and **high = node.val**.\n6. Validate the right subtree with **low = node.val** and the same **high**.\n7. Return **true** only if both subtrees are valid.\n\n**Correctness reasoning**\n\nThe range carried into each call represents exactly the restrictions imposed by all ancestors. The current node must satisfy those restrictions before its children can be considered. Updating the upper bound on the left and the lower bound on the right preserves the BST rule for every descendant. Therefore, if the DFS returns **true**, every node is inside the correct ancestor range; if any node violates the BST definition, it eventually appears in a call whose range excludes it and the DFS returns **false**.",
    solutions: [
      {
        name: "Range DFS with nullable Long bounds",
        whenToUseMD:
          "Use this as the primary interview solution. It states the global BST invariant directly, avoids integer-edge sentinels, and works naturally with recursion.",
        approachMD:
          "Carry an exclusive lower and upper bound into each subtree. The left child tightens the upper bound to the current value, and the right child tightens the lower bound to the current value.",
        walkthroughMD:
          "1. Call the helper with **root**, **null** lower bound, and **null** upper bound.\n2. Return **true** for a **null** node.\n3. Reject the node if it is not strictly greater than the lower bound or not strictly less than the upper bound.\n4. Recurse left with the current value as the new upper bound.\n5. Recurse right with the current value as the new lower bound.\n6. Return the logical AND of the two subtree validations.",
        complexity: { time: "O(n)", space: "O(h)", note: "Every node is visited once. The recursion stack is O(log n) for a balanced tree and O(n) for a skewed tree." },
        filename: "Solution.java",
        code: `class TreeNode { int val; TreeNode left; TreeNode right; TreeNode(int x){ val = x; } }

class Solution {

    public boolean isValidBST(TreeNode root) {
        return isValid(root, null, null);
    }

    private boolean isValid(TreeNode node, Long lower, Long upper) {
        if (node == null) {
            return true;
        }

        long value = node.val;
        if (lower != null && value <= lower) {
            return false;
        }
        if (upper != null && value >= upper) {
            return false;
        }

        return isValid(node.left, lower, value) && isValid(node.right, value, upper);
    }
}`,
      },
      {
        name: "Iterative inorder increasing check",
        whenToUseMD:
          "Use this when you want to lean on the sorted-order property of BST inorder traversal. It is also useful if the interviewer asks for an iterative version.",
        approachMD:
          "Traverse nodes in inorder order with an explicit stack. In a valid BST, each visited value must be strictly greater than the previous visited value.",
        walkthroughMD:
          "1. Push left ancestors until reaching **null**.\n2. Pop the next inorder node from the stack.\n3. Compare its value with the previous inorder value, rejecting if it is not strictly larger.\n4. Store the current value as previous.\n5. Continue with the current node right subtree.\n6. If traversal finishes without a violation, return **true**.",
        complexity: { time: "O(n)", space: "O(h)", note: "The traversal visits each node once. The stack is O(log n) for a balanced tree and O(n) for a skewed tree." },
        filename: "Solution.java",
        code: `import java.util.ArrayDeque;
import java.util.Deque;

class TreeNode { int val; TreeNode left; TreeNode right; TreeNode(int x){ val = x; } }

class Solution {

    public boolean isValidBST(TreeNode root) {
        Deque<TreeNode> stack = new ArrayDeque<>();
        TreeNode current = root;
        Long previous = null;

        while (current != null || !stack.isEmpty()) {
            while (current != null) {
                stack.push(current);
                current = current.left;
            }

            current = stack.pop();
            long value = current.val;
            if (previous != null && value <= previous) {
                return false;
            }
            previous = value;
            current = current.right;
        }

        return true;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "root = **[5,3,8,2,6,7,9]**. The node **6** sits in the left subtree of **5**, so it must be less than **5** even though it is greater than **3**.",
      columns: ["step", "node", "valid range", "decision", "next recursive work"],
      rows: [
        ["1", "5", "no lower bound, no upper bound", "5 is allowed", "check left with upper bound 5 and right with lower bound 5"],
        ["2", "3", "less than 5", "3 is allowed", "check left with upper bound 3 and right with range greater than 3 and less than 5"],
        ["3", "2", "less than 3", "2 is allowed", "both children are null, return true for this branch"],
        ["4", "6", "greater than 3 and less than 5", "6 violates the upper bound 5", "return false immediately"],
      ],
      narrativeMD: "The failure is found at **6** because ancestor **5** still constrains the entire left subtree. A direct-child-only check would miss this violation.",
    },
    complexityNote:
      "Range DFS and inorder traversal are both optimal O(n) validation methods. Their auxiliary space is O(h), which is O(log n) for a balanced tree and O(n) for a skewed tree.",
    interviewTipsMD:
      "Say the global invariant first: every node must be inside the range created by all ancestors, not only by its parent. Then mention the alternative: inorder traversal of a BST is strictly increasing. If node values can be **Integer.MIN_VALUE** or **Integer.MAX_VALUE**, use **Long** or nullable bounds instead of integer sentinels.",
    followUps: [
      "How would the validation change if duplicates were allowed on one chosen side?",
      "Can you validate the BST iteratively without recursion?",
      "How would you find the first pair of swapped nodes in a nearly valid BST?",
      "How would you validate a stream of preorder values as a possible BST preorder traversal?",
    ],
    similarProblems: [
      { title: "Search in a Binary Search Tree", difficulty: "Easy", slug: "tree-search-in-bst", note: "Uses the same ordering invariant to choose one branch." },
      { title: "Insert into a Binary Search Tree", difficulty: "Medium", slug: "tree-insert-into-bst", note: "Maintains the same valid range while adding a new leaf." },
      { title: "Delete Node in a BST", difficulty: "Medium", slug: "tree-delete-node-in-bst", note: "Requires preserving the BST invariant after structural change." },
      { title: "Kth Smallest Element in a BST", difficulty: "Medium", slug: "tree-kth-smallest-bst", note: "Relies on inorder traversal producing sorted values." },
      { title: "Recover Binary Search Tree", difficulty: "Medium", slug: "tree-recover-bst", note: "Finds sorted-order violations in an otherwise BST-shaped tree." },
    ],
    keyTakeaways: [
      "A valid BST is governed by ancestor ranges, not just parent-child comparisons.",
      "Range recursion passes exclusive **low** and **high** bounds downward.",
      "Inorder traversal is a second optimal test because BST values appear strictly increasing.",
      "Nullable **Long** bounds avoid edge failures at integer extremes.",
    ],
    pattern:
      "BST validation: carry inherited exclusive bounds during DFS, or verify that inorder traversal is strictly increasing.",
  },
  {
    kind: "problem",
    slug: "tree-search-in-bst",
    moduleId: "tree-bst-pattern",
    order: 16,
    title: "Search in a Binary Search Tree",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/search-in-a-binary-search-tree/",
    tags: ["Tree", "BST", "Binary Search Tree", "Search", "Iteration"],
    companies: ["Microsoft", "Amazon", "Google", "Meta", "Bloomberg"],
    estimatedReadingMin: 6,
    estimatedSolvingMin: 12,
    statementMD:
      "Given the **root** of a binary search tree and an integer **val**, find the node whose value equals **val** and return the subtree rooted at that node. If **val** does not exist in the tree, return **null**.",
    constraints: [
      "1 <= number of nodes <= 5000",
      "1 <= Node.val <= 10^7",
      "Each node value is unique",
      "1 <= val <= 10^7",
    ],
    inputMD: "A BST **root** and a target integer **val**.",
    outputMD: "The node with value **val**, including its entire subtree, or **null** if the value is absent.",
    examples: [
      {
        input: "root = **[4,2,7,1,3]**, val = **2**",
        output: "**[2,1,3]**",
        explanation: "The value **2** is found as the left child of **4**, so the subtree rooted at **2** is returned.",
      },
      {
        input: "root = **[4,2,7,1,3]**, val = **5**",
        output: "**null**",
        explanation: "The search goes right from **4** toward **7**, then left to an empty child because **5 < 7**. The value is not present.",
      },
    ],
    learningObjectives: [
      "Use the BST ordering rule to discard one entire subtree at every step.",
      "Write the iterative compare-and-branch template with O(1) extra space.",
      "Explain why search time depends on tree height rather than node count in a balanced BST.",
      "Recognise this operation as the building block for insert, delete, and LCA in a BST.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is a lookup in a **binary search tree**. The reusable phrase is **BST -> compare and branch**. At each node, the target either equals the node, must be in the left subtree, or must be in the right subtree. You never need to scan both sides.\n\nThe common trap is treating the tree as a regular binary tree and doing DFS or BFS over every node. That ignores the sorted structure. Search is the smallest BST operation, but it is the building block for insertion, deletion, predecessor-successor questions, and BST lowest common ancestor.",
    commonMistakes: [
      "Searching both subtrees as if the input were an arbitrary binary tree.",
      "Reversing the branch condition and going right when the target is smaller.",
      "Returning only the value instead of the subtree root required by the problem.",
      "Claiming O(log n) time without qualifying that a skewed BST can have height O(n).",
    ],
    algorithmMD:
      "**Key idea**\n\nKeep a pointer at the current candidate node. If the target is smaller than **current.val**, all values in the right subtree are too large, so move left. If the target is larger, all values in the left subtree are too small, so move right. If the pointer becomes **null**, the target is absent.\n\n**Recursion walkthrough**\n\nUse the BST **[5,3,8,2,4,7,9]** and search for **7**. Start at **5**. Since **7 > 5**, the answer cannot be in the left subtree **[3,2,4]**, so branch right to **8**. Since **7 < 8**, branch left to **7**. The value matches, so return the subtree rooted at **7**.\n\nIf searching for **6** in the same tree, the path is **5 -> 8 -> 7**. Since **6 < 7**, the search moves left to **null** and stops. The algorithm never touches the unrelated nodes **2**, **3**, **4**, or **9**.\n\n**Algorithm**\n\n1. Set **current = root**.\n2. While **current** is not **null**, compare **val** with **current.val**.\n3. If they are equal, return **current**.\n4. If **val < current.val**, move **current** to **current.left**.\n5. Otherwise move **current** to **current.right**.\n6. If the loop exits, return **null**.",
    solutions: [
      {
        name: "Iterative compare and branch",
        whenToUseMD:
          "Use this by default. It is the simplest BST operation, avoids recursion stack space, and is the template you will reuse for insert and LCA.",
        approachMD:
          "Walk one downward path. Each comparison discards one subtree and moves to the only child that can still contain the target.",
        walkthroughMD:
          "1. Start **current** at **root**.\n2. If **current** is **null**, the target is absent.\n3. If **current.val** equals **val**, return **current**.\n4. If **val** is smaller, move to **current.left**.\n5. If **val** is larger, move to **current.right**.\n6. Repeat until a match or an empty child is reached.",
        complexity: { time: "O(h)", space: "O(1)", note: "The search follows one root-to-leaf path: O(log n) in a balanced tree and O(n) in a skewed tree." },
        filename: "Solution.java",
        code: `class TreeNode { int val; TreeNode left; TreeNode right; TreeNode(int x){ val = x; } }

class Solution {

    public TreeNode searchBST(TreeNode root, int val) {
        TreeNode current = root;

        while (current != null) {
            if (current.val == val) {
                return current;
            }
            if (val < current.val) {
                current = current.left;
            } else {
                current = current.right;
            }
        }

        return null;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "root = **[5,3,8,2,4,7,9]**, val = **7**. Track the single path chosen by BST ordering.",
      columns: ["step", "current node", "comparison", "branch", "remaining candidate area"],
      rows: [
        ["1", "5", "7 is greater than 5", "go right", "only the subtree rooted at 8 can contain 7"],
        ["2", "8", "7 is less than 8", "go left", "only the subtree rooted at 7 can contain 7"],
        ["3", "7", "7 equals 7", "stop", "return the subtree rooted at 7"],
      ],
      narrativeMD: "Only one path is explored: **5 -> 8 -> 7**. BST ordering eliminates every sibling subtree along the way.",
    },
    complexityNote:
      "BST search is height-bound. It is logarithmic only when the tree is balanced; in the worst skewed shape it becomes linear.",
    interviewTipsMD:
      "Make the branch rule explicit before coding. The interviewer wants to hear that the BST property lets you eliminate half of the remaining tree in a balanced shape. Also be precise about the return value: return the node, not a boolean and not just the integer value.",
    followUps: [
      "How would you implement the same search recursively?",
      "How would you find the closest value if the exact target is absent?",
      "How does search performance change in an unbalanced BST?",
      "How would a self-balancing tree preserve O(log n) search time?",
    ],
    similarProblems: [
      { title: "Insert into a Binary Search Tree", difficulty: "Medium", slug: "tree-insert-into-bst", note: "Searches for the empty child where the new value belongs." },
      { title: "Delete Node in a BST", difficulty: "Medium", slug: "tree-delete-node-in-bst", note: "First searches for the target, then repairs the local subtree." },
      { title: "Lowest Common Ancestor of a Binary Search Tree", difficulty: "Medium", slug: "tree-lca-bst", note: "Uses compare-and-branch with two target values." },
      { title: "Validate Binary Search Tree", difficulty: "Medium", slug: "tree-validate-bst", note: "Checks that the ordering assumptions used by search are globally true." },
    ],
    keyTakeaways: [
      "BST search follows one downward path, not a full tree traversal.",
      "At each node, compare the target and choose exactly one branch.",
      "The complexity is O(h): O(log n) when balanced and O(n) when skewed.",
      "This compare-and-branch loop is the foundation for later BST operations.",
    ],
    pattern:
      "BST lookup: compare target with current value, discard the impossible subtree, and continue down the only viable branch.",
  },
  {
    kind: "problem",
    slug: "tree-insert-into-bst",
    moduleId: "tree-bst-pattern",
    order: 17,
    title: "Insert into a Binary Search Tree",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/insert-into-a-binary-search-tree/",
    tags: ["Tree", "BST", "Binary Search Tree", "Insertion", "Recursion"],
    companies: ["Microsoft", "Amazon", "Google", "Oracle", "Apple"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 18,
    statementMD:
      "Given the **root** of a BST and a value **val** that does not already exist in the tree, insert **val** into the BST and return the root of the updated tree. If the tree is empty, the inserted node becomes the root.",
    constraints: [
      "0 <= number of nodes <= 10^4",
      "-10^8 <= Node.val <= 10^8",
      "All existing node values are unique",
      "-10^8 <= val <= 10^8",
      "val does not exist in the original BST",
    ],
    inputMD: "A BST **root** and a new integer **val** to insert.",
    outputMD: "The root of the BST after attaching a new node with value **val** in the correct position.",
    examples: [
      {
        input: "root = **[4,2,7,1,3]**, val = **5**",
        output: "**[4,2,7,1,3,5]**",
        explanation: "The path is **4 -> 7** because **5 > 4** and **5 < 7**. The left child of **7** is empty, so **5** is attached there.",
      },
      {
        input: "root = **[40,20,60,10,30,50,70]**, val = **25**",
        output: "**[40,20,60,10,30,50,70,null,null,25]**",
        explanation: "The value **25** goes left from **40**, right from **20**, and left from **30**, where an empty child is found.",
      },
      {
        input: "root = **[]**, val = **5**",
        output: "**[5]**",
        explanation: "An empty tree has no root, so the new node becomes the root.",
      },
    ],
    learningObjectives: [
      "Find the only empty child position where the new value can be attached.",
      "Explain why insertion in a BST changes only one root-to-leaf path.",
      "Use recursive returns to reconnect the possibly new subtree root.",
      "Compare recursive insertion with the iterative constant-space version.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is adding one value to an existing **BST**. Because the value does not already exist, the final node must be a new leaf. The BST property tells you exactly which path to follow: smaller values go left, larger values go right.\n\nThe common trap is trying to rebuild or rebalance the whole tree. Plain BST insertion does neither. It walks down one branch until the child pointer that should contain **val** is empty, then attaches a new leaf. In recursive form, each call returns the root of its subtree so the parent link stays correct, including the empty-tree case where the new node is the returned root.",
    commonMistakes: [
      "Forgetting to return **root** after recursive insertion, which disconnects the unchanged ancestors.",
      "Creating a new node but not assigning it to **root.left** or **root.right**.",
      "Ignoring the empty-tree case where the new node is the whole answer.",
      "Assuming insertion automatically balances the BST; this problem preserves shape except for one new leaf.",
    ],
    algorithmMD:
      "**Key idea**\n\nInsertion is search plus attachment. Compare **val** with the current node. If **val** is smaller, insert into the left subtree. If larger, insert into the right subtree. When the recursive call reaches **null**, create and return a new node. Every parent stores the returned subtree root and returns itself upward.\n\n**Recursion walkthrough**\n\nUse **[5,3,8,2,4,7,9]** and insert **6**. Start at **5**. Since **6 > 5**, recurse into the right subtree rooted at **8**. Since **6 < 8**, recurse into the left subtree rooted at **7**. Since **6 < 7**, recurse into **7.left**, which is empty. Create a new node **6** and return it. The call at **7** stores that node as **7.left**, then returns **7**. The calls at **8** and **5** return their unchanged roots, preserving the full tree.\n\n**Algorithm**\n\n1. If **root** is **null**, return a new node containing **val**.\n2. If **val < root.val**, set **root.left** to the result of inserting into **root.left**.\n3. If **val > root.val**, set **root.right** to the result of inserting into **root.right**.\n4. Return **root** so the caller keeps the correct subtree root.\n5. The original caller receives the possibly new overall root.",
    solutions: [
      {
        name: "Recursive subtree return",
        whenToUseMD:
          "Use this when teaching or explaining BST mutation. The return value cleanly handles both normal child insertion and the empty-root case.",
        approachMD:
          "Treat insertion as a recursive operation that returns the root of the updated subtree. The first **null** position on the search path becomes the new leaf.",
        walkthroughMD:
          "1. If the current subtree is **null**, create and return a new node.\n2. If **val** is smaller than **root.val**, recursively insert into the left subtree and store the returned root in **root.left**.\n3. If **val** is larger, recursively insert into the right subtree and store the returned root in **root.right**.\n4. Return **root** from every non-empty call.\n5. The top-level return is the root of the updated BST.",
        complexity: { time: "O(h)", space: "O(h)", note: "Only one search path is visited. The recursion stack is O(log n) for a balanced tree and O(n) for a skewed tree." },
        filename: "Solution.java",
        code: `class TreeNode { int val; TreeNode left; TreeNode right; TreeNode(int x){ val = x; } }

class Solution {

    public TreeNode insertIntoBST(TreeNode root, int val) {
        if (root == null) {
            return new TreeNode(val);
        }

        if (val < root.val) {
            root.left = insertIntoBST(root.left, val);
        } else {
            root.right = insertIntoBST(root.right, val);
        }

        return root;
    }
}`,
      },
      {
        name: "Iterative leaf attachment",
        whenToUseMD:
          "Use this when the interviewer asks for O(1) auxiliary space or when you want to avoid recursion depth on a skewed tree.",
        approachMD:
          "Walk down the BST until the correct child pointer is empty. Attach the new node at that empty pointer and return the original root.",
        walkthroughMD:
          "1. If **root** is **null**, return a new node.\n2. Keep **current** at the node being inspected.\n3. If **val** is smaller and **current.left** is empty, attach the new node there and stop.\n4. If **val** is smaller and **current.left** exists, move left.\n5. Mirror the same logic on the right when **val** is larger.\n6. Return the original **root** after attachment.",
        complexity: { time: "O(h)", space: "O(1)", note: "The loop follows one root-to-leaf path: O(log n) balanced, O(n) skewed." },
        filename: "Solution.java",
        code: `class TreeNode { int val; TreeNode left; TreeNode right; TreeNode(int x){ val = x; } }

class Solution {

    public TreeNode insertIntoBST(TreeNode root, int val) {
        if (root == null) {
            return new TreeNode(val);
        }

        TreeNode current = root;
        while (true) {
            if (val < current.val) {
                if (current.left == null) {
                    current.left = new TreeNode(val);
                    break;
                }
                current = current.left;
            } else {
                if (current.right == null) {
                    current.right = new TreeNode(val);
                    break;
                }
                current = current.right;
            }
        }

        return root;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "root = **[5,3,8,2,4,7,9]**, val = **6**. Follow the recursive calls until an empty child is found.",
      columns: ["step", "current node", "comparison", "recursive direction", "returned subtree root"],
      rows: [
        ["1", "5", "6 is greater than 5", "insert into right subtree", "5 after its right child is updated"],
        ["2", "8", "6 is less than 8", "insert into left subtree", "8 after its left child is updated"],
        ["3", "7", "6 is less than 7", "insert into left subtree", "7 after its left child is updated"],
        ["4", "null", "empty spot found", "create node 6", "new subtree root 6"],
      ],
      narrativeMD: "The new node becomes **7.left**. Every ancestor returns itself, so the final root remains **5** while the tree now includes **6**.",
    },
    complexityNote:
      "Insertion is O(h) because only the search path is touched. Recursive insertion spends O(h) stack space; iterative insertion uses O(1) extra space.",
    interviewTipsMD:
      "State that the inserted value becomes a leaf in a standard BST. Then choose recursive or iterative style based on what the interviewer values. The recursive return pattern is especially important: assigning **root.left** or **root.right** to the returned subtree root is what handles the empty child and preserves ancestors.",
    followUps: [
      "How would insertion change if duplicate values were allowed?",
      "How would you keep the tree balanced after insertion?",
      "Can you insert a batch of values to minimise final tree height?",
      "How would you implement insertion when each node also stores its subtree size?",
    ],
    similarProblems: [
      { title: "Search in a Binary Search Tree", difficulty: "Easy", slug: "tree-search-in-bst", note: "Insertion is search until the next branch is empty." },
      { title: "Delete Node in a BST", difficulty: "Medium", slug: "tree-delete-node-in-bst", note: "The complementary mutation operation that removes a value while preserving order." },
      { title: "Validate Binary Search Tree", difficulty: "Medium", slug: "tree-validate-bst", note: "Confirms that insertions preserved the global BST invariant." },
      { title: "Kth Smallest Element in a BST", difficulty: "Medium", slug: "tree-kth-smallest-bst", note: "Benefits from maintaining BST ordering after insertions." },
    ],
    keyTakeaways: [
      "BST insertion follows exactly one compare-and-branch path.",
      "The new value is attached at the first empty child where the search would continue.",
      "Recursive insertion returns the updated subtree root to reconnect parent pointers.",
      "Insertion does not rebalance the tree unless a separate balancing structure is used.",
    ],
    pattern:
      "BST insertion: search for the missing value, create a leaf at the first null branch, and return updated subtree roots on the way back.",
  },
  {
    kind: "problem",
    slug: "tree-delete-node-in-bst",
    moduleId: "tree-bst-pattern",
    order: 18,
    title: "Delete Node in a BST",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/delete-node-in-a-bst/",
    tags: ["Tree", "BST", "Binary Search Tree", "Deletion", "Recursion"],
    companies: ["Microsoft", "Amazon", "Google", "Meta", "Oracle"],
    estimatedReadingMin: 11,
    estimatedSolvingMin: 30,
    statementMD:
      "Given the **root** of a BST and an integer **key**, delete the node with value **key** if it exists and return the root of the updated BST. If **key** is not present, return the original tree.",
    constraints: [
      "0 <= number of nodes <= 10^4",
      "-10^5 <= Node.val <= 10^5",
      "All node values are unique",
      "-10^5 <= key <= 10^5",
    ],
    inputMD: "A BST **root** and an integer **key** to remove if present.",
    outputMD: "The root of a BST containing every original value except **key**, if **key** existed.",
    examples: [
      {
        input: "root = **[5,3,6,2,4,null,7]**, key = **3**",
        output: "**[5,4,6,2,null,null,7]**",
        explanation: "Node **3** has two children. Its inorder successor is **4**, so **3** is replaced by **4**, and the original **4** node is removed from the right subtree of **3**.",
      },
      {
        input: "root = **[5,3,6,2,4,null,7]**, key = **0**",
        output: "**[5,3,6,2,4,null,7]**",
        explanation: "The search reaches an empty branch without finding **0**, so the tree is unchanged.",
      },
      {
        input: "root = **[]**, key = **5**",
        output: "**[]**",
        explanation: "Deleting from an empty tree still returns an empty tree.",
      },
    ],
    learningObjectives: [
      "Break BST deletion into leaf, one-child, and two-child cases.",
      "Use the inorder successor to preserve ordering when deleting a node with two children.",
      "Reconnect subtree roots correctly through recursive returns.",
      "Explain why deleting the successor after copying its value avoids duplicate values.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is removing a value from a **BST** while preserving sorted order. First use normal BST search to find the node. The hard part begins once the node is found: deletion must return a valid replacement subtree to the parent.\n\nThere are three cases. A leaf can become **null**. A node with one child can be replaced by that child. A node with two children needs a value that fits between the entire left and right subtrees. The inorder successor, the smallest node in the right subtree, is the standard choice because it is greater than everything on the left and no greater than the remaining right subtree values. This is the hardest BST operation because search, structural replacement, and recursive reconnection all happen together.",
    commonMistakes: [
      "Deleting a two-child node by returning only one child and losing the other subtree.",
      "Copying the successor value but forgetting to delete the original successor node, creating a duplicate.",
      "Using the immediate right child as the successor without walking to the leftmost node of the right subtree.",
      "Not assigning **root.left** or **root.right** to the returned subtree after recursive deletion.",
    ],
    algorithmMD:
      "**Key idea**\n\nSearch for **key** using BST ordering. When the node is found, return the subtree that should replace it. No child means **null**. One child means that child. Two children means replace the node value with the inorder successor, then delete that successor from the right subtree so every value appears exactly once.\n\n**Recursion walkthrough**\n\nUse **[5,3,8,2,4,7,9]** and delete **5**. The target is the root and has two children. The right subtree is rooted at **8**. Walk left inside that right subtree to find the smallest value, **7**. Replace the root value **5** with **7**. Now the tree temporarily has two **7** values, so recursively delete **7** from the right subtree. That recursive call goes from **8** to its left child **7**. Since that **7** is a leaf, it returns **null**, and **8.left** becomes **null**. The final tree keeps all values except **5** and remains a BST.\n\nFor a one-child case, if deleting a node whose only child is **4**, the recursive call simply returns **4** to the parent. For a leaf, it returns **null**. These returned roots are what reconnect the tree correctly.\n\n**Algorithm**\n\n1. If **root** is **null**, return **null**.\n2. If **key < root.val**, delete from **root.left** and assign the returned subtree to **root.left**.\n3. If **key > root.val**, delete from **root.right** and assign the returned subtree to **root.right**.\n4. Otherwise the target node is found. If it has no left child, return **root.right**.\n5. If it has no right child, return **root.left**.\n6. If it has two children, find the smallest node in **root.right**.\n7. Copy that successor value into **root.val**.\n8. Delete the successor value from **root.right** and assign the returned subtree to **root.right**.\n9. Return **root**.\n\n**Correctness reasoning**\n\nSearch only descends into the subtree that can contain **key**, so values outside that path remain unchanged. In the leaf and one-child cases, the returned replacement subtree already satisfies all ancestor bounds. In the two-child case, the inorder successor is the smallest value greater than the deleted node, so it is greater than every value in the left subtree and no larger than any remaining value in the right subtree. Removing the original successor prevents duplication. Therefore each case returns a valid BST containing exactly the original values minus **key**.",
    solutions: [
      {
        name: "Recursive deletion with inorder successor",
        whenToUseMD:
          "Use this canonical solution in interviews. It is concise, handles all three structural cases, and makes the successor reasoning explicit.",
        approachMD:
          "Recursively search for the key. Once found, return the correct replacement subtree. For two children, copy the inorder successor value and then delete that successor from the right subtree.",
        walkthroughMD:
          "1. Return **null** for an empty subtree.\n2. Recurse left or right according to the comparison with **key**, assigning the returned subtree back to that child pointer.\n3. When **root.val** equals **key**, handle the zero-child and one-child cases by returning the non-null child, or **null** if none exists.\n4. For two children, find the leftmost node in the right subtree.\n5. Copy the successor value into **root.val**.\n6. Delete the successor value from **root.right** so it appears only once.\n7. Return **root** after its children have been repaired.",
        complexity: { time: "O(h)", space: "O(h)", note: "Search and successor removal follow downward paths. The recursion stack is O(log n) balanced and O(n) skewed." },
        filename: "Solution.java",
        code: `class TreeNode { int val; TreeNode left; TreeNode right; TreeNode(int x){ val = x; } }

class Solution {

    public TreeNode deleteNode(TreeNode root, int key) {
        if (root == null) {
            return null;
        }

        if (key < root.val) {
            root.left = deleteNode(root.left, key);
        } else if (key > root.val) {
            root.right = deleteNode(root.right, key);
        } else {
            if (root.left == null) {
                return root.right;
            }
            if (root.right == null) {
                return root.left;
            }

            TreeNode successor = findMin(root.right);
            root.val = successor.val;
            root.right = deleteNode(root.right, successor.val);
        }

        return root;
    }

    private TreeNode findMin(TreeNode node) {
        while (node.left != null) {
            node = node.left;
        }
        return node;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "root = **[5,3,8,2,4,7,9]**, key = **5**. Deleting the root demonstrates the two-child successor case.",
      columns: ["step", "current node", "comparison or case", "tree action", "subtree returned"],
      rows: [
        ["1", "5", "key equals current node", "node has two children", "must replace with successor"],
        ["2", "right subtree rooted at 8", "find minimum", "walk left to 7", "successor is 7"],
        ["3", "5", "copy successor", "root value becomes 7", "right subtree still contains old 7"],
        ["4", "8", "delete successor 7 from right subtree", "go left", "8 after its left child is updated"],
        ["5", "7", "leaf target", "return null", "8.left becomes null"],
      ],
      narrativeMD: "The final root value is **7**, the old successor leaf is removed, and all values still satisfy the BST ordering.",
    },
    complexityNote:
      "Deletion is O(h) because it searches for the key and may also walk to the successor along a subtree path. Recursive space is O(h), with h equal to tree height.",
    interviewTipsMD:
      "Walk the three cases slowly. Interviewers often care less about typing speed and more about whether you can explain why the successor is safe. After copying the successor value, explicitly delete that successor from the right subtree; otherwise you leave duplicate values and the tree is no longer the requested result.",
    followUps: [
      "Could you use the inorder predecessor from the left subtree instead of the successor?",
      "How would deletion work in an iterative implementation with parent pointers?",
      "How would a self-balancing BST restore balance after deletion?",
      "What extra updates are needed if each node stores subtree size or height?",
    ],
    similarProblems: [
      { title: "Insert into a Binary Search Tree", difficulty: "Medium", slug: "tree-insert-into-bst", note: "The complementary BST mutation that attaches a new leaf." },
      { title: "Search in a Binary Search Tree", difficulty: "Easy", slug: "tree-search-in-bst", note: "Deletion begins by searching for the target path." },
      { title: "Validate Binary Search Tree", difficulty: "Medium", slug: "tree-validate-bst", note: "Useful for reasoning that deletion preserves the global invariant." },
      { title: "Lowest Common Ancestor of a Binary Search Tree", difficulty: "Medium", slug: "tree-lca-bst", note: "Another operation that relies on ancestor ordering." },
      { title: "Recover Binary Search Tree", difficulty: "Medium", slug: "tree-recover-bst", note: "Also reasons about misplaced values and inorder successors." },
    ],
    keyTakeaways: [
      "BST deletion has three structural cases: leaf, one child, and two children.",
      "A one-child node can be replaced directly by its child.",
      "A two-child node is safely replaced by its inorder successor, the smallest node in the right subtree.",
      "After copying the successor value, delete the original successor node to avoid duplicates.",
    ],
    pattern:
      "BST deletion: search for the key, return the correct replacement subtree, and use the inorder successor to repair the two-child case.",
  },
  {
    kind: "problem",
    slug: "tree-lca-bst",
    moduleId: "tree-bst-pattern",
    order: 19,
    title: "Lowest Common Ancestor of a Binary Search Tree",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/",
    tags: ["Tree", "BST", "Binary Search Tree", "Lowest Common Ancestor", "Iteration"],
    companies: ["Microsoft", "Amazon", "Google", "Meta", "Apple"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 18,
    statementMD:
      "Given the **root** of a binary search tree and two nodes **p** and **q** that exist in the tree, return their lowest common ancestor. The lowest common ancestor is the lowest node that has both **p** and **q** as descendants, where a node may be a descendant of itself.",
    constraints: [
      "2 <= number of nodes <= 10^5",
      "-10^9 <= Node.val <= 10^9",
      "All node values are unique",
      "p and q exist in the BST",
      "p != q",
    ],
    inputMD: "A BST **root** and two existing tree nodes **p** and **q**.",
    outputMD: "The node that is the lowest common ancestor of **p** and **q**.",
    examples: [
      {
        input: "root = **[6,2,8,0,4,7,9,null,null,3,5]**, p = **2**, q = **8**",
        output: "**6**",
        explanation: "The targets fall on opposite sides of **6**, so **6** is the split point and therefore the LCA.",
      },
      {
        input: "root = **[6,2,8,0,4,7,9,null,null,3,5]**, p = **2**, q = **4**",
        output: "**2**",
        explanation: "Node **2** is one of the targets and also an ancestor of **4**, so the LCA is **2**.",
      },
    ],
    learningObjectives: [
      "Use BST ordering to move both target values left or right together.",
      "Identify the first split point as the lowest common ancestor.",
      "Handle the case where one target is the ancestor of the other.",
      "Contrast BST LCA with general binary-tree LCA, which cannot use ordering.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is **lowest common ancestor** in a **BST**, not just any binary tree. In a general binary tree LCA problem, you usually need DFS to ask both subtrees whether they contain targets. In a BST, ordering gives a faster path: compare both target values with the current node.\n\nIf both targets are smaller than the current node, their LCA must be in the left subtree. If both are larger, it must be in the right subtree. Otherwise the current node is exactly where the paths split, or it is one of the targets, so it is the LCA. This is **BST -> compare and branch** applied to two values at once.",
    commonMistakes: [
      "Using the general binary-tree LCA DFS and ignoring the BST ordering advantage.",
      "Moving left when only one target is smaller, even though that means the current node is the split point.",
      "Forgetting that if **current** equals **p** or **q**, it can be the LCA of itself and the other node.",
      "Comparing node object references in branch logic instead of comparing their values.",
    ],
    algorithmMD:
      "**Key idea**\n\nAt each node, compare the current value with both targets. If both targets lie on the same side, the LCA lies on that side too. The first node where the targets are not both left and not both right is the split point. That node is lowest because the search moved downward as long as both targets stayed together.\n\n**Recursion walkthrough**\n\nUse **[5,3,8,2,4,7,9]** with **p = 2** and **q = 4**. Start at **5**. Both target values are less than **5**, so the LCA must be in the left subtree; move to **3**. At **3**, one target is less than **3** and the other is greater than **3**. The paths split here, so **3** is the LCA.\n\nFor **p = 4** and **q = 9** in the same tree, start at **5**. One target is less than **5** and the other is greater, so the root itself is the split point. For **p = 3** and **q = 4**, the search reaches **3** and stops because **3** is one target and an ancestor of **4**.\n\n**Algorithm**\n\n1. Store the smaller target value as **low** and the larger as **high**.\n2. Start **current** at **root**.\n3. If **high < current.val**, both targets are left, so move to **current.left**.\n4. Else if **low > current.val**, both targets are right, so move to **current.right**.\n5. Otherwise **current.val** lies between the targets or equals one target, so return **current**.\n6. The problem guarantees both targets exist, so a valid BST input reaches an answer.",
    solutions: [
      {
        name: "Iterative split-point search",
        whenToUseMD:
          "Use this as the default. It is shorter than the general-tree DFS, uses constant extra space, and directly demonstrates the BST ordering advantage.",
        approachMD:
          "Walk downward while both target values are on the same side of the current node. The first node where they are not on the same side is the LCA.",
        walkthroughMD:
          "1. Compute **low** and **high** from **p.val** and **q.val**.\n2. Start at **root**.\n3. If **high** is smaller than **current.val**, move left because both targets are left.\n4. If **low** is greater than **current.val**, move right because both targets are right.\n5. Otherwise return **current** because it is the split point or one of the targets.\n6. Repeat until the answer is found.",
        complexity: { time: "O(h)", space: "O(1)", note: "The search follows one downward path: O(log n) for a balanced BST and O(n) for a skewed BST." },
        filename: "Solution.java",
        code: `class TreeNode { int val; TreeNode left; TreeNode right; TreeNode(int x){ val = x; } }

class Solution {

    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        int low = Math.min(p.val, q.val);
        int high = Math.max(p.val, q.val);
        TreeNode current = root;

        while (current != null) {
            if (high < current.val) {
                current = current.left;
            } else if (low > current.val) {
                current = current.right;
            } else {
                return current;
            }
        }

        return null;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "root = **[5,3,8,2,4,7,9]**, p = **2**, q = **4**. Track when the two target paths stop moving together.",
      columns: ["step", "current node", "target positions", "action", "reason"],
      rows: [
        ["1", "5", "2 and 4 are both less than 5", "move left", "both targets must be in the left subtree"],
        ["2", "3", "2 is less than 3 and 4 is greater than 3", "return 3", "the target paths split at 3"],
      ],
      narrativeMD: "The first split point is **3**, so it is the lowest node that has both **2** and **4** below it or equal to it.",
    },
    complexityNote:
      "BST LCA is height-bound and constant-space in iterative form. The balanced case is logarithmic, but a skewed tree can still require linear time.",
    interviewTipsMD:
      "Start by contrasting this with **tree-lca**, the general binary-tree LCA. In the general problem, you cannot know which subtree contains the targets without searching. In a BST, values tell you whether both targets are left, both are right, or the current node is the split point. That contrast is the whole interview insight.",
    followUps: [
      "How would you solve LCA in a general binary tree without BST ordering?",
      "What changes if one or both target nodes might not exist in the tree?",
      "How would parent pointers change the solution?",
      "How would you answer many LCA queries on a mostly static BST?",
    ],
    similarProblems: [
      { title: "Lowest Common Ancestor of a Binary Tree", difficulty: "Medium", slug: "tree-lca", note: "The general version cannot use BST ordering and needs subtree search." },
      { title: "Search in a Binary Search Tree", difficulty: "Easy", slug: "tree-search-in-bst", note: "Uses the same compare-and-branch movement with one target." },
      { title: "Validate Binary Search Tree", difficulty: "Medium", slug: "tree-validate-bst", note: "Establishes the ordering invariant that makes split-point search valid." },
      { title: "Kth Smallest Element in a BST", difficulty: "Medium", slug: "tree-kth-smallest-bst", note: "Another BST problem that exploits ordering instead of generic tree traversal alone." },
    ],
    keyTakeaways: [
      "In a BST, LCA is the first node where target values split across sides or equal the current node.",
      "If both targets are smaller, move left; if both are larger, move right.",
      "The current node can be the LCA when it is one of the targets.",
      "General binary-tree LCA cannot use this ordering shortcut.",
    ],
    pattern:
      "BST LCA: move while both targets stay on the same side; return the first split point or matching target.",
  },
];
