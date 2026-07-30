import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "tree-level-order-traversal",
    moduleId: "tree-bfs",
    order: 11,
    title: "Binary Tree Level Order Traversal",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
    tags: ["Tree", "Binary Tree", "BFS", "Queue", "Level Order"],
    companies: ["Amazon", "Microsoft", "Google", "Meta", "Bloomberg"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 15,
    statementMD:
      "Given the **root** of a binary tree, return the values of its nodes level by level from top to bottom, and from left to right within each level.",
    constraints: [
      "0 <= number of nodes <= 2000",
      "-1000 <= Node.val <= 1000",
    ],
    inputMD: "The **root** of a binary tree, usually shown in level order such as **[3,9,20,null,null,15,7]**.",
    outputMD: "A list of lists where each inner list contains the node values from one level of the tree.",
    examples: [
      {
        input: "root = [3,9,20,null,null,15,7]",
        output: "[[3],[9,20],[15,7]]",
        explanation: "The root forms level 0, its children form level 1, and the children of **20** form level 2.",
      },
      {
        input: "root = [1]",
        output: "[[1]]",
        explanation: "There is only one node, so there is one level containing **1**.",
      },
      {
        input: "root = []",
        output: "[]",
        explanation: "An empty tree has no levels to report.",
      },
    ],
    learningObjectives: [
      "Recognise the level-sweep signal in binary tree prompts.",
      "Use a queue to preserve left-to-right breadth-first order.",
      "Process exactly the current queue size so each output list represents one level.",
      "Use the base BFS template that zigzag, right-side view, and level aggregates specialise.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is any tree prompt that asks for nodes **level by level**, **top to bottom**, **breadth first**, or asks you to do something once per depth. Depth-first recursion is good for subtree answers, but this problem cares about horizontal layers. A queue naturally stores the frontier in the same order we should visit it.\n\nThe common trap is letting levels bleed together. If you keep polling until the queue is empty, newly enqueued children are processed in the same pass as their parents. The fix is the canonical BFS template: record the queue size at the start of a level, process exactly that many nodes, and enqueue their children for the next level.",
    commonMistakes: [
      "Using one flat list and losing where each level starts and ends.",
      "Looping until the queue is empty inside a level, which mixes children into the parent level.",
      "Forgetting to return an empty list when **root** is **null**.",
      "Enqueuing right before left when the required output is left-to-right.",
    ],
    algorithmMD:
      "**Key idea**\n\nThe queue represents the next nodes to process in breadth-first order. At the start of each outer loop, the queue contains exactly one full level. Save that size, remove exactly those nodes, collect their values, and enqueue their non-null children. After those fixed removals, the queue contains exactly the next level.\n\n**Level-by-level walkthrough**\n\nUse the tree **[3,9,20,null,null,15,7]**. Start with queue **[3]**. The level size is **1**, so remove only **3**, collect **[3]**, and enqueue its children **9** and **20**. The queue becomes **[9,20]** for the next level.\n\nNow the level size is **2**. Remove **9** first, collect it, and enqueue no children. Remove **20**, collect it, and enqueue **15** then **7**. The level output is **[9,20]**, and the queue for the next round is **[15,7]**.\n\nThe last level size is **2**. Remove **15** and **7**, collect **[15,7]**, and enqueue no children. The queue is empty, so the traversal ends with **[[3],[9,20],[15,7]]**.\n\n**Algorithm**\n\n1. Create an empty answer list.\n2. If **root** is **null**, return the empty answer.\n3. Add **root** to a queue.\n4. While the queue is not empty, store **levelSize = queue.size()**.\n5. Poll exactly **levelSize** nodes, append their values to the current level, and enqueue their left child then right child when present.\n6. Append the completed level list to the answer.\n7. Return the answer after all levels are processed.",
    solutions: [
      {
        name: "Queue BFS by fixed level size",
        whenToUseMD:
          "Use this as the default template for binary tree BFS. It is simple, iterative, and keeps each level separated without storing depth on every node.",
        approachMD:
          "Run breadth-first search with a queue. Before processing a level, snapshot the current queue size; those nodes are the entire current level, while any children enqueued during the loop belong to the next level.",
        walkthroughMD:
          "1. Return an empty list when **root** is **null**.\n2. Add **root** to the queue.\n3. While the queue has nodes, save the current queue size as **levelSize**.\n4. Poll exactly **levelSize** nodes, add each value to a fresh **level** list, and enqueue children left-to-right.\n5. Add **level** to the answer and continue until the queue is empty.",
        complexity: { time: "O(n)", space: "O(width)", note: "Every node is visited once, and the queue holds at most one level plus part of the next level." },
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

    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> result = new ArrayList<>();
        if (root == null) {
            return result;
        }

        Queue<TreeNode> queue = new ArrayDeque<>();
        queue.offer(root);

        while (!queue.isEmpty()) {
            int levelSize = queue.size();
            List<Integer> level = new ArrayList<>();

            for (int index = 0; index < levelSize; index++) {
                TreeNode node = queue.poll();
                level.add(node.val);

                if (node.left != null) {
                    queue.offer(node.left);
                }
                if (node.right != null) {
                    queue.offer(node.right);
                }
            }

            result.add(level);
        }

        return result;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "root = **[3,9,20,null,null,15,7]**. Track the queue at the start of each level and the answer after that level is completed.",
      columns: ["level", "queue before level", "nodes processed", "level output", "result so far"],
      rows: [
        ["0", "[3]", "3", "[3]", "[[3]]"],
        ["1", "[9,20]", "9, 20", "[9,20]", "[[3],[9,20]]"],
        ["2", "[15,7]", "15, 7", "[15,7]", "[[3],[9,20],[15,7]]"],
      ],
      narrativeMD: "Each row processes exactly the queue size captured at the start of that level. Children are saved for the following row, which keeps the level boundaries clean.",
    },
    complexityNote:
      "The canonical BFS level template is O(n) time and O(width) queue space, where **width** is the maximum number of nodes on any level.",
    interviewTipsMD:
      "Say the invariant before coding: at the start of the outer loop, the queue contains the current level. Then save **queue.size()** and process exactly that many nodes. This one sentence prevents the most common bug and sets up every BFS follow-up in this module.",
    followUps: [
      "How would you print the same levels from bottom to top?",
      "How would you return the largest value on each level?",
      "How would you include **null** placeholders to preserve the exact tree shape?",
      "How would this change for an n-ary tree?",
    ],
    similarProblems: [
      { title: "Binary Tree Zigzag Level Order Traversal", difficulty: "Medium", slug: "tree-zigzag-level-order", note: "Uses the same level-size BFS but flips the output order on alternating levels." },
      { title: "Binary Tree Right Side View", difficulty: "Medium", slug: "tree-right-side-view", note: "Uses the last node seen in each BFS level." },
      { title: "Average of Levels in Binary Tree", difficulty: "Easy", slug: "tree-average-of-levels", note: "Replaces level collection with a per-level sum and average." },
      { title: "Maximum Depth of Binary Tree", difficulty: "Easy", slug: "tree-maximum-depth", note: "Can be computed by counting levels during BFS or by DFS height." },
    ],
    keyTakeaways: [
      "Level-order traversal is the base BFS pattern for binary trees.",
      "Snapshot **queue.size()** before the inner loop to isolate one level.",
      "Enqueue children left-to-right to preserve the required output order.",
      "Most tree BFS variants keep this skeleton and change what is collected per level.",
    ],
    pattern:
      "BFS level sweep: queue the root, process exactly the current queue size, enqueue children for the next layer, and record one answer item per level.",
  },
  {
    kind: "problem",
    slug: "tree-zigzag-level-order",
    moduleId: "tree-bfs",
    order: 12,
    title: "Binary Tree Zigzag Level Order Traversal",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/",
    tags: ["Tree", "Binary Tree", "BFS", "Queue", "Deque"],
    companies: ["Amazon", "Microsoft", "Google", "Meta", "Apple"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 18,
    statementMD:
      "Given the **root** of a binary tree, return the zigzag level order traversal of its node values. The first level is read left-to-right, the next level right-to-left, and the direction alternates after every level.",
    constraints: [
      "0 <= number of nodes <= 2000",
      "-100 <= Node.val <= 100",
    ],
    inputMD: "The **root** of a binary tree, such as **[3,9,20,null,null,15,7]**.",
    outputMD: "A list of lists where each level is included, but adjacent levels alternate their output direction.",
    examples: [
      {
        input: "root = [3,9,20,null,null,15,7]",
        output: "[[3],[20,9],[15,7]]",
        explanation: "Level 0 reads **3** left-to-right, level 1 reads **20** then **9**, and level 2 returns to left-to-right as **15** then **7**.",
      },
      {
        input: "root = [1,2,3,4,null,null,5]",
        output: "[[1],[3,2],[4,5]]",
        explanation: "Only the output direction flips. The children are still discovered left-to-right, so the third level remains **4** then **5**.",
      },
    ],
    learningObjectives: [
      "Reuse the fixed-size BFS level template from level order traversal.",
      "Separate traversal order from output order.",
      "Use a deque to build each level in the desired direction without reversing the whole tree traversal.",
      "Explain why children should still be enqueued left-to-right.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is still **do something per level**, so the outer structure is the same BFS level sweep. The word **zigzag** changes only how each completed level is reported. It does not mean the queue should traverse the tree right-to-left on alternate levels.\n\nThe common trap is enqueuing children in different orders on different levels. That mutates the discovery order for later levels and can scramble grandchildren. Keep the queue boring and consistent: always enqueue left child before right child. Flip only the current level output, either by adding values to the front of a deque on right-to-left levels or by reversing odd levels after collection.",
    commonMistakes: [
      "Alternating the child enqueue order instead of only alternating the output order.",
      "Forgetting to toggle the direction after every completed level.",
      "Reversing the entire answer instead of just the current odd-numbered level.",
      "Using repeated insertion at the front of an array list, which can add unnecessary shifting cost.",
    ],
    algorithmMD:
      "**Key idea**\n\nThe queue invariant is unchanged from normal level order: it holds the next level in left-to-right discovery order. For the output of the current level, use a deque. If the direction is left-to-right, append each value at the back. If the direction is right-to-left, insert each value at the front. Children are always enqueued left child then right child.\n\n**Level-by-level walkthrough**\n\nUse **[3,9,20,null,null,15,7]**. Start with queue **[3]** and direction left-to-right. Process **3**, add it to the back of the level deque, and enqueue **9** then **20**. The first output level is **[3]**, and the next queue is **[9,20]**.\n\nNow the direction is right-to-left. The queue is still **[9,20]**, so poll **9** before **20**. Add **9** to the front of the level deque, then add **20** to the front, producing **[20,9]**. While doing that, enqueue **15** then **7** from node **20**. The next queue is **[15,7]**.\n\nToggle back to left-to-right. Process **15** then **7**, add both to the back, and get **[15,7]**. The final answer is **[[3],[20,9],[15,7]]**.\n\n**Algorithm**\n\n1. Return an empty answer when **root** is **null**.\n2. Add **root** to the queue and set **leftToRight** to **true**.\n3. For each level, save **levelSize = queue.size()** and create an empty deque for that level values.\n4. Poll exactly **levelSize** nodes from the queue.\n5. If **leftToRight** is true, add the value to the back of the deque; otherwise add it to the front.\n6. Enqueue each node left child then right child when present.\n7. Convert the deque to a list, append it to the answer, and toggle **leftToRight**.",
    solutions: [
      {
        name: "Queue BFS with deque level output",
        whenToUseMD:
          "Use this when you want to avoid reversing level lists. The queue still follows standard BFS, and the deque controls only the presentation of each level.",
        approachMD:
          "Run the normal fixed-level BFS. For each level, store values in a deque: add to the back on left-to-right levels and to the front on right-to-left levels. Always enqueue children left-to-right.",
        walkthroughMD:
          "1. Return an empty list when **root** is **null**.\n2. Start a queue with **root** and a boolean direction flag set to left-to-right.\n3. For the current level, snapshot **queue.size()** and create a deque.\n4. Poll exactly that many nodes; place each value at the back or front of the deque based on the flag.\n5. Enqueue left child then right child for every node.\n6. Append the deque values as one list and flip the direction flag.",
        complexity: { time: "O(n)", space: "O(width)", note: "Each node is processed once, and the queue plus current level deque are bounded by the maximum tree width." },
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

    public List<List<Integer>> zigzagLevelOrder(TreeNode root) {
        List<List<Integer>> result = new ArrayList<>();
        if (root == null) {
            return result;
        }

        Queue<TreeNode> queue = new ArrayDeque<>();
        queue.offer(root);
        boolean leftToRight = true;

        while (!queue.isEmpty()) {
            int levelSize = queue.size();
            Deque<Integer> levelValues = new ArrayDeque<>();

            for (int index = 0; index < levelSize; index++) {
                TreeNode node = queue.poll();
                if (leftToRight) {
                    levelValues.addLast(node.val);
                } else {
                    levelValues.addFirst(node.val);
                }

                if (node.left != null) {
                    queue.offer(node.left);
                }
                if (node.right != null) {
                    queue.offer(node.right);
                }
            }

            result.add(new ArrayList<>(levelValues));
            leftToRight = !leftToRight;
        }

        return result;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "root = **[3,9,20,null,null,15,7]**. The queue always discovers nodes left-to-right; only the level output changes direction.",
      columns: ["level", "queue before level", "direction", "level output", "result so far"],
      rows: [
        ["0", "[3]", "left-to-right", "[3]", "[[3]]"],
        ["1", "[9,20]", "right-to-left", "[20,9]", "[[3],[20,9]]"],
        ["2", "[15,7]", "left-to-right", "[15,7]", "[[3],[20,9],[15,7]]"],
      ],
      narrativeMD: "Notice that the second row still polls **9** before **20**. The output becomes **[20,9]** only because values are inserted at the front of the level deque.",
    },
    complexityNote:
      "The traversal remains the same O(n) BFS as normal level order. The extra space is O(width) for the queue and the current level output.",
    interviewTipsMD:
      "Be explicit that zigzag changes the output direction, not the child enqueue order. Interviewers often look for this distinction because alternating enqueue order can accidentally affect the next level rather than only the current one.",
    followUps: [
      "How would you implement the same idea by reversing odd levels after collection?",
      "How would you print the zigzag traversal as one flat list instead of grouped levels?",
      "How would this adapt to an n-ary tree?",
      "Can you do a spiral traversal without storing every level in the final answer?",
    ],
    similarProblems: [
      { title: "Binary Tree Level Order Traversal", difficulty: "Medium", slug: "tree-level-order-traversal", note: "The base fixed-size BFS template used here." },
      { title: "Binary Tree Right Side View", difficulty: "Medium", slug: "tree-right-side-view", note: "Another level-order specialisation that changes what is recorded per level." },
      { title: "Average of Levels in Binary Tree", difficulty: "Easy", slug: "tree-average-of-levels", note: "Keeps normal queue order and records a numeric aggregate per level." },
      { title: "Binary Tree Vertical Order Traversal", difficulty: "Medium", url: "https://leetcode.com/problems/binary-tree-vertical-order-traversal/", note: "Also uses BFS while controlling output grouping order." },
    ],
    keyTakeaways: [
      "Zigzag traversal is ordinary BFS plus alternating level presentation.",
      "The queue should still enqueue children left-to-right.",
      "A deque lets you build reversed levels without a separate reverse pass.",
      "Toggle the direction once per completed level, not once per node.",
    ],
    pattern:
      "BFS with output transformation: keep traversal order stable, process one level at a time, and change how that level is written to the answer.",
  },
  {
    kind: "problem",
    slug: "tree-right-side-view",
    moduleId: "tree-bfs",
    order: 13,
    title: "Binary Tree Right Side View",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/binary-tree-right-side-view/",
    tags: ["Tree", "Binary Tree", "BFS", "DFS", "Queue"],
    companies: ["Amazon", "Microsoft", "Google", "Meta", "LinkedIn"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 18,
    statementMD:
      "Given the **root** of a binary tree, imagine standing on the right side of it. Return the values of the nodes you can see from top to bottom.",
    constraints: [
      "0 <= number of nodes <= 100",
      "-100 <= Node.val <= 100",
    ],
    inputMD: "The **root** of a binary tree, such as **[1,2,3,null,5,null,4]**.",
    outputMD: "A list containing one visible value per depth, ordered from the root level down to the deepest visible level.",
    examples: [
      {
        input: "root = [1,2,3,null,5,null,4]",
        output: "[1,3,4]",
        explanation: "From the right side, level 0 shows **1**, level 1 shows **3**, and level 2 shows **4**.",
      },
      {
        input: "root = [1,null,3]",
        output: "[1,3]",
        explanation: "The root is visible, and its right child **3** is visible on the next level.",
      },
      {
        input: "root = []",
        output: "[]",
        explanation: "There are no nodes to see in an empty tree.",
      },
    ],
    learningObjectives: [
      "Recognise right-side view as one value per BFS level.",
      "Use the last node processed in each fixed-size level as the visible node.",
      "Understand the equivalent DFS strategy: visit right before left and record the first node at each depth.",
      "Explain why a left subtree can still contribute to the right-side view when no right-side node exists at that depth.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe prompt says **right side**, but the answer is still organised by depth: exactly one visible node per level. That is a level-sweep signal. If you perform normal BFS left-to-right, the rightmost visible node for a level is simply the last node removed from that level.\n\nThe common trap is following only right pointers. A node deep in a left subtree may be visible if there is no right-subtree node at that same depth. The rule is not **always go right**; the rule is **for each depth, take the rightmost node that exists**. BFS does that by taking the last node of each level. DFS can also do it by visiting right children first and recording the first value seen at each depth.",
    commonMistakes: [
      "Walking only through **node.right** and missing visible nodes that live in left subtrees.",
      "Taking the first node of each left-to-right BFS level instead of the last.",
      "Adding every leaf instead of one node per depth.",
      "Forgetting the empty-tree case and returning a list containing a placeholder.",
    ],
    algorithmMD:
      "**Key idea**\n\nUse the standard BFS level sweep. At each level, the nodes are processed left-to-right. The final node processed in that fixed-size level is the rightmost node at that depth, so append only that value. The queue still enqueues left child then right child.\n\n**Level-by-level walkthrough**\n\nUse **[1,2,3,null,5,null,4]**. Start with queue **[1]**. The level size is **1**, so **1** is both first and last; append **1**. Enqueue **2** then **3**, so the next queue is **[2,3]**.\n\nThe next level size is **2**. Poll **2** first and enqueue **5**. Poll **3** second and enqueue **4**. Because **3** was the last node of this level, append **3**. The next queue is **[5,4]**.\n\nAt the final level, poll **5** then **4**. The last node is **4**, so append **4**. The visible list is **[1,3,4]**. Notice that **5** was still visited, but it was hidden by **4** at the same depth.\n\n**Algorithm**\n\n1. Create an empty answer list.\n2. If **root** is **null**, return it.\n3. Add **root** to a queue.\n4. While the queue is not empty, save the current **levelSize**.\n5. Poll exactly **levelSize** nodes from left to right, enqueueing each node left child then right child.\n6. When the loop index is the final node of the level, append that node value to the answer.\n7. Return the answer after all levels finish.",
    solutions: [
      {
        name: "BFS taking the last node per level",
        whenToUseMD:
          "Use this as the primary interview solution when the level-order pattern is obvious. It is iterative and mirrors the visual definition of rightmost node per depth.",
        approachMD:
          "Run the fixed-size BFS level template. Within each level, process nodes left-to-right and append the value only when the current index is the last index of that level.",
        walkthroughMD:
          "1. Return an empty list for a **null** root.\n2. Add **root** to the queue.\n3. For each level, store **levelSize = queue.size()**.\n4. Poll exactly **levelSize** nodes and enqueue children left-to-right.\n5. If the node is at index **levelSize - 1**, append its value because it is the rightmost node for that level.",
        complexity: { time: "O(n)", space: "O(width)", note: "Every node is visited once, and the BFS queue is bounded by the maximum level width." },
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

    public List<Integer> rightSideView(TreeNode root) {
        List<Integer> view = new ArrayList<>();
        if (root == null) {
            return view;
        }

        Queue<TreeNode> queue = new ArrayDeque<>();
        queue.offer(root);

        while (!queue.isEmpty()) {
            int levelSize = queue.size();

            for (int index = 0; index < levelSize; index++) {
                TreeNode node = queue.poll();
                if (index == levelSize - 1) {
                    view.add(node.val);
                }

                if (node.left != null) {
                    queue.offer(node.left);
                }
                if (node.right != null) {
                    queue.offer(node.right);
                }
            }
        }

        return view;
    }
}`,
      },
      {
        name: "DFS right-first by depth",
        whenToUseMD:
          "Use this when the interviewer asks for a recursive solution or when you want to show the depth-first view of the same invariant.",
        approachMD:
          "Visit the right subtree before the left subtree. The first time DFS reaches a depth, that node is the rightmost node seen from that level, so record it and ignore later nodes at the same depth.",
        walkthroughMD:
          "1. Start DFS at **root** with depth **0** and an empty view list.\n2. If the current node is **null**, return.\n3. If **depth** equals the current size of the view list, append the node value because this is the first node reached at that depth.\n4. Recurse into **node.right** first.\n5. Recurse into **node.left** second so it fills only depths not already covered by the right side.",
        complexity: { time: "O(n)", space: "O(h)", note: "Every node is visited once, and recursion uses stack space proportional to the tree height." },
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

    public List<Integer> rightSideView(TreeNode root) {
        List<Integer> view = new ArrayList<>();
        collectRightFirst(root, 0, view);
        return view;
    }

    private void collectRightFirst(TreeNode node, int depth, List<Integer> view) {
        if (node == null) {
            return;
        }

        if (depth == view.size()) {
            view.add(node.val);
        }

        collectRightFirst(node.right, depth + 1, view);
        collectRightFirst(node.left, depth + 1, view);
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "root = **[1,2,3,null,5,null,4]**. BFS records the last node processed at each level.",
      columns: ["level", "queue before level", "nodes processed", "last node", "view after level"],
      rows: [
        ["0", "[1]", "1", "1", "[1]"],
        ["1", "[2,3]", "2, 3", "3", "[1,3]"],
        ["2", "[5,4]", "5, 4", "4", "[1,3,4]"],
      ],
      narrativeMD: "The value **5** is visited, but **4** appears later in the same level, so **4** is the node visible from the right at depth 2.",
    },
    complexityNote:
      "The BFS solution uses O(width) queue space. The DFS variant uses O(h) recursion stack space, which is O(n) in a skewed tree and O(log n) in a balanced tree.",
    interviewTipsMD:
      "Lead with BFS because the phrase **right side view** is one visible value per level. Then mention the elegant DFS variant: visit right first, and when **depth == answer.size()**, record the node. Also say why walking only right pointers is wrong: a left subtree can be visible when the right side is missing at that depth.",
    followUps: [
      "How would you return the left side view instead?",
      "How would you return both the leftmost and rightmost values of every level?",
      "How would the DFS variant change if you wanted the left side view?",
      "Can you compute the right side view while streaming level order output?",
    ],
    similarProblems: [
      { title: "Binary Tree Level Order Traversal", difficulty: "Medium", slug: "tree-level-order-traversal", note: "The BFS skeleton is the same; only the per-level recorded value changes." },
      { title: "Binary Tree Zigzag Level Order Traversal", difficulty: "Medium", slug: "tree-zigzag-level-order", note: "Another level-order variant that changes output presentation." },
      { title: "Average of Levels in Binary Tree", difficulty: "Easy", slug: "tree-average-of-levels", note: "Also records one computed result per level." },
      { title: "Maximum Depth of Binary Tree", difficulty: "Easy", slug: "tree-maximum-depth", note: "Uses depth as the key measurement, either with BFS levels or DFS recursion." },
    ],
    keyTakeaways: [
      "Right side view is a per-level selection problem, not a right-pointer walk.",
      "In left-to-right BFS, the last node of each level is the visible rightmost node.",
      "The DFS alternative visits right before left and records the first node at each depth.",
      "A left subtree can contribute to the view when no right-side node exists at that depth.",
    ],
    pattern:
      "Per-level representative: run BFS by fixed level size and record the node that satisfies the level rule, such as the last node for right side view.",
  },
  {
    kind: "problem",
    slug: "tree-average-of-levels",
    moduleId: "tree-bfs",
    order: 14,
    title: "Average of Levels in Binary Tree",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/average-of-levels-in-binary-tree/",
    tags: ["Tree", "Binary Tree", "BFS", "Queue", "Aggregation"],
    companies: ["Amazon", "Microsoft", "Google", "Meta", "Adobe"],
    estimatedReadingMin: 7,
    estimatedSolvingMin: 12,
    statementMD:
      "Given the **root** of a binary tree, return the average value of the nodes on each level, ordered from top to bottom.",
    constraints: [
      "1 <= number of nodes <= 10^4",
      "-2^31 <= Node.val <= 2^31 - 1",
      "Answers within 10^-5 of the actual value are accepted",
    ],
    inputMD: "The **root** of a non-empty binary tree, such as **[3,9,20,null,null,15,7]**.",
    outputMD: "A list of decimal values where each entry is the arithmetic mean of one tree level.",
    examples: [
      {
        input: "root = [3,9,20,null,null,15,7]",
        output: "[3.00000,14.50000,11.00000]",
        explanation: "The level averages are **3 / 1 = 3**, **(9 + 20) / 2 = 14.5**, and **(15 + 7) / 2 = 11**.",
      },
      {
        input: "root = [3,9,20,15,7]",
        output: "[3.00000,14.50000,11.00000]",
        explanation: "Level 0 contains **3**, level 1 contains **9** and **20**, and level 2 contains **15** and **7**.",
      },
    ],
    learningObjectives: [
      "Recognise per-level aggregation as a BFS level-sweep problem.",
      "Use the fixed queue-size template to count exactly the nodes in one level.",
      "Compute each level sum with a long accumulator to avoid integer overflow.",
      "Return decimal averages after dividing by the captured level size.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe phrase **average of levels** is a direct level-sweep signal. We do not need a full traversal order list; we need one aggregate per depth. BFS is the cleanest fit because the queue can isolate one level, giving both the values to sum and the count to divide by.\n\nThe common trap is using an **int** sum. Node values can be as large as 32-bit integers, and a level can contain many nodes. Even if the final average fits in a double, the intermediate sum can overflow an int. Use a **long** accumulator, then cast to double for the division.",
    commonMistakes: [
      "Using an **int** accumulator and overflowing before the average is computed.",
      "Dividing after every node instead of summing the whole level first.",
      "Using the changing queue size after enqueueing children instead of the captured level size.",
      "Forgetting that the result type must contain decimal averages, not integer division.",
    ],
    algorithmMD:
      "**Key idea**\n\nThis is the canonical BFS level template with the per-level action changed from collecting values to computing an aggregate. At the start of a level, capture **levelSize**. Poll exactly that many nodes, add their values to a **long** sum, enqueue their children, and append **sum / levelSize** as a decimal average.\n\n**Level-by-level walkthrough**\n\nUse **[3,9,20,null,null,15,7]**. Start with queue **[3]**. The level size is **1**. Poll **3**, sum becomes **3**, and enqueue **9** then **20**. The average is **3 / 1 = 3.0**, and the next queue is **[9,20]**.\n\nThe next level size is **2**. Poll **9**, sum becomes **9**. Poll **20**, sum becomes **29**, and enqueue **15** then **7**. The average is **29 / 2 = 14.5**, and the next queue is **[15,7]**.\n\nThe final level size is **2**. Poll **15** and **7**, sum becomes **22**, and the average is **22 / 2 = 11.0**. The queue is empty, so the answer is **[3.0,14.5,11.0]**.\n\n**Algorithm**\n\n1. Create an empty list of averages.\n2. Add **root** to a queue if it is present.\n3. While the queue is not empty, save **levelSize = queue.size()** and set **sum = 0** as a long value.\n4. Poll exactly **levelSize** nodes, adding each value to **sum**.\n5. Enqueue each node left child then right child when present.\n6. Append **sum / levelSize** as a double value.\n7. Return the averages after all levels are processed.",
    solutions: [
      {
        name: "Queue BFS with long level sum",
        whenToUseMD:
          "Use this as the default solution. It is the level-order template with a safer numeric accumulator and one average emitted per level.",
        approachMD:
          "Process the tree one level at a time with a queue. For each level, capture the size, sum exactly those node values in a **long**, then divide by the captured count to produce the average.",
        walkthroughMD:
          "1. Return an empty list if **root** is **null**.\n2. Add **root** to a queue.\n3. For each level, store the current queue size and initialise a **long** sum.\n4. Poll exactly that many nodes, add their values to the sum, and enqueue children left-to-right.\n5. Divide the sum by the level size using double arithmetic and append the average.",
        complexity: { time: "O(n)", space: "O(width)", note: "Each node contributes to exactly one level sum, and the queue is bounded by the maximum tree width." },
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

    public List<Double> averageOfLevels(TreeNode root) {
        List<Double> averages = new ArrayList<>();
        if (root == null) {
            return averages;
        }

        Queue<TreeNode> queue = new ArrayDeque<>();
        queue.offer(root);

        while (!queue.isEmpty()) {
            int levelSize = queue.size();
            long sum = 0L;

            for (int index = 0; index < levelSize; index++) {
                TreeNode node = queue.poll();
                sum += node.val;

                if (node.left != null) {
                    queue.offer(node.left);
                }
                if (node.right != null) {
                    queue.offer(node.right);
                }
            }

            averages.add((double) sum / levelSize);
        }

        return averages;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "root = **[3,9,20,null,null,15,7]**. Capture the level size before enqueueing children, then compute one average per row.",
      columns: ["level", "queue before level", "sum", "count", "average", "result so far"],
      rows: [
        ["0", "[3]", "3", "1", "3.0", "[3.0]"],
        ["1", "[9,20]", "29", "2", "14.5", "[3.0,14.5]"],
        ["2", "[15,7]", "22", "2", "11.0", "[3.0,14.5,11.0]"],
      ],
      narrativeMD: "The count is the saved level size, not the queue size after children are enqueued. That is why the second level divides **29** by **2**, even though the next queue also contains two nodes.",
    },
    complexityNote:
      "The solution is O(n) time and O(width) space. The numeric detail is important: the level sum should be a long even though the returned averages are doubles.",
    interviewTipsMD:
      "Mention the overflow trap proactively. A strong answer says that the BFS structure is standard, but the accumulator should be **long** because many large 32-bit node values can appear on the same level. Also make clear that division happens after the level is complete.",
    followUps: [
      "How would you return the maximum value on each level instead of the average?",
      "How would you compute the average using DFS by tracking sum and count per depth?",
      "How would you handle a streaming tree source where a full level may be very wide?",
      "How would the solution change for an n-ary tree?",
    ],
    similarProblems: [
      { title: "Binary Tree Level Order Traversal", difficulty: "Medium", slug: "tree-level-order-traversal", note: "The same BFS skeleton, but it stores every value in each level." },
      { title: "Binary Tree Right Side View", difficulty: "Medium", slug: "tree-right-side-view", note: "Another problem that emits one result per level." },
      { title: "Maximum Depth of Binary Tree", difficulty: "Easy", slug: "tree-maximum-depth", note: "Can be solved by counting how many BFS levels exist." },
      { title: "Find Largest Value in Each Tree Row", difficulty: "Medium", url: "https://leetcode.com/problems/find-largest-value-in-each-tree-row/", note: "A closely related per-level aggregate that uses max instead of average." },
    ],
    keyTakeaways: [
      "Per-level aggregates are natural BFS level-sweep problems.",
      "Capture **queue.size()** before processing a level so the count is correct.",
      "Use a **long** sum to avoid overflow from many large node values.",
      "Convert to double only when computing the final average for the level.",
    ],
    pattern:
      "BFS level aggregation: isolate one level with a saved queue size, accumulate the metric for those nodes, then emit one aggregate before moving to the next level.",
  },
];
