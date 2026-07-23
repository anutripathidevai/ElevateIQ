import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "tree-construct-preorder-inorder",
    moduleId: "tree-construction",
    order: 24,
    title: "Construct Binary Tree from Preorder and Inorder Traversal",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/",
    tags: ["Tree", "Depth-First Search", "Divide and Conquer", "Hash Table", "Recursion"],
    companies: ["Amazon", "Microsoft", "Google", "Meta", "Bloomberg"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 25,
    statementMD:
      "Given two integer arrays **preorder** and **inorder**, where **preorder** is the preorder traversal of a binary tree and **inorder** is the inorder traversal of the same tree, construct and return the original binary tree.\n\nAll values are unique, so each value can identify exactly one position in the inorder traversal.",
    constraints: [
      "1 <= preorder.length <= 3000",
      "inorder.length == preorder.length",
      "-3000 <= preorder[i], inorder[i] <= 3000",
      "All values in preorder and inorder are unique",
      "preorder and inorder describe the same binary tree",
    ],
    inputMD:
      "Two arrays: **preorder**, which visits **root, left, right**, and **inorder**, which visits **left, root, right**.",
    outputMD:
      "The root of the reconstructed binary tree. The returned pointer shape should match the unique tree described by both traversals.",
    examples: [
      {
        input: "preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]",
        output: "[3,9,20,null,null,15,7]",
        explanation: "Preorder starts with root 3. In inorder, values left of 3 form the left subtree [9], and values right of 3 form the right subtree [15,20,7]. Applying the same rule recursively gives children 9 and 20, with 15 and 7 under 20.",
      },
      {
        input: "preorder = [-1], inorder = [-1]",
        output: "[-1]",
        explanation: "The only preorder value is also the only inorder value, so the tree is a single node.",
      },
    ],
    learningObjectives: [
      "Explain why the first unused preorder value must be the root of the current subtree.",
      "Use the root's inorder index to split left and right subtree ranges.",
      "Avoid array slicing by passing inorder boundaries and advancing one preorder pointer.",
      "Use a hash map to find each root position in O(1).",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is the pair **preorder + inorder**. Preorder gives the root before anything else in that subtree, because its order is **root, left, right**. Inorder does not tell you the root first, but once you know the root value, inorder tells you exactly which values belong to the left subtree and which belong to the right subtree.\n\nThat is why the two traversals complement each other. Preorder answers **what is the next root?** Inorder answers **where does that root split the subtree?** With unique values, a hash map from value to inorder index makes every split constant time. A moving preorder pointer then consumes roots in the same order the recursive construction needs them.",
    commonMistakes: [
      "Searching the inorder array linearly inside every recursive call, which can turn the solution into O(n^2).",
      "Slicing arrays for every subtree instead of passing index boundaries.",
      "Advancing the preorder pointer after building children instead of immediately after choosing the root.",
      "Using preorder lengths incorrectly and assigning values from the right subtree to the left subtree.",
    ],
    algorithmMD:
      "**Key idea**\n\nThe first unused preorder value is the root of the current subtree. Find that value in inorder. Everything to its left in the current inorder window is the left subtree, and everything to its right is the right subtree. Then recursively build the left side first, followed by the right side, because preorder lists left-subtree roots before right-subtree roots.\n\n**Recursion walkthrough**\n\nUse preorder **[3,9,20,15,7]** and inorder **[9,3,15,20,7]**. The first preorder value is 3, so 3 is the root. In inorder, 3 splits the array into left side **[9]** and right side **[15,20,7]**. The next preorder value is 9, which becomes the root of the left window **[9]** and has no children. The next preorder value is 20, which becomes the root of the right window **[15,20,7]**. In inorder, 20 splits that window into **[15]** and **[7]**, so 15 becomes its left child and 7 becomes its right child.\n\n**Algorithm**\n\n1. Build a hash map from each inorder value to its index.\n2. Set **preorderIndex** to **0** so it always points at the next subtree root.\n3. Define a recursive helper over an inorder window **left..right**.\n4. If the window is empty, return **null**.\n5. Read **preorder[preorderIndex]** as the root value, then advance **preorderIndex**.\n6. Look up the root's inorder index to split the current window.\n7. Recursively build the left subtree from the left window, then the right subtree from the right window.\n8. Return the root node.",
    solutions: [
      {
        name: "Preorder pointer plus inorder index map",
        whenToUseMD:
          "Use this whenever values are unique and both preorder and inorder traversals are available. It is the standard interview solution because it avoids repeated scans and avoids allocating sliced arrays.",
        approachMD:
          "Precompute **value -> inorder index**. Then keep one moving pointer into preorder. Each recursive call owns an inorder range. The pointer gives the root value for that range, and the map gives the split point. The helper creates the root, builds the left range, builds the right range, and returns the finished subtree.",
        walkthroughMD:
          "1. Store every inorder value's index in a hash map.\n2. Start **preorderIndex** at **0**.\n3. For a recursive inorder range, return **null** when the range is empty.\n4. Otherwise choose **preorder[preorderIndex]** as the root and advance the pointer.\n5. Split the inorder range around that root's index.\n6. Build the left child from the left range and the right child from the right range.\n7. Return the root after both children are attached.",
        complexity: {
          time: "O(n)",
          space: "O(n)",
          note: "The hash map stores n indices and each node is created once. The recursion stack is O(h), which is O(n) in the worst case.",
        },
        filename: "Solution.java",
        code: `import java.util.*;

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;

    TreeNode(int x){ val = x; }
}

class Solution {
    private int preorderIndex;
    private Map<Integer, Integer> inorderIndexByValue;

    public TreeNode buildTree(int[] preorder, int[] inorder) {
        preorderIndex = 0;
        inorderIndexByValue = new HashMap<>();

        for (int index = 0; index < inorder.length; index++) {
            inorderIndexByValue.put(inorder[index], index);
        }

        return build(preorder, 0, inorder.length - 1);
    }

    private TreeNode build(int[] preorder, int left, int right) {
        if (left > right) {
            return null;
        }

        int rootValue = preorder[preorderIndex];
        preorderIndex++;

        TreeNode root = new TreeNode(rootValue);
        int inorderIndex = inorderIndexByValue.get(rootValue);

        root.left = build(preorder, left, inorderIndex - 1);
        root.right = build(preorder, inorderIndex + 1, right);
        return root;
    }
}`,
      },
    ],
    dryRun: {
      inputMD:
        "preorder = **[3,9,20,15,7]**, inorder = **[9,3,15,20,7]**. Track each recursive inorder window and the root consumed from preorder.",
      columns: ["call", "root", "inorder window", "left inorder", "right inorder"],
      rows: [
        ["build(0,4)", "3", "[9,3,15,20,7]", "[9]", "[15,20,7]"],
        ["build(0,0)", "9", "[9]", "empty", "empty"],
        ["build(2,4)", "20", "[15,20,7]", "[15]", "[7]"],
        ["build(2,2)", "15", "[15]", "empty", "empty"],
        ["build(4,4)", "7", "[7]", "empty", "empty"],
      ],
      narrativeMD:
        "The preorder pointer moves in root order: 3, then 9, then 20, then 15, then 7. The inorder windows decide where each chosen root's left and right children can come from.",
    },
    interviewTipsMD:
      "Say the two traversal roles out loud: preorder selects the root, inorder splits the subtree. Then emphasize that the hash map is not for searching values in the tree; it is for avoiding O(n) scans of inorder during recursion. If asked about duplicates, explain that this exact reconstruction is no longer uniquely determined without additional identity information.",
    followUps: [
      "What changes if values are not unique?",
      "Can you implement the same logic without global fields by passing indices through helper arguments?",
      "How would you construct a tree from preorder and postorder when the tree is full?",
      "How would you serialize the constructed tree to verify it in tests?",
    ],
    similarProblems: [
      { title: "Construct Binary Tree from Inorder and Postorder Traversal", difficulty: "Medium", slug: "tree-construct-inorder-postorder", note: "Uses the same inorder split but consumes roots from the end of postorder." },
      { title: "Serialize and Deserialize Binary Tree", difficulty: "Hard", slug: "tree-serialize-deserialize", note: "Also relies on traversal order to rebuild pointer structure." },
      { title: "Binary Tree Preorder Traversal", difficulty: "Easy", slug: "tree-preorder-traversal", note: "Builds intuition for why preorder exposes roots first." },
      { title: "Construct Binary Tree from Preorder and Postorder Traversal", difficulty: "Medium", url: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-postorder-traversal/", note: "A related reconstruction problem with weaker uniqueness unless shape constraints are known." },
    ],
    keyTakeaways: [
      "Preorder's first unused value is the current subtree root.",
      "Inorder splits a known root into left-subtree values and right-subtree values.",
      "A value-to-index map turns every split into O(1) work.",
      "Passing index boundaries is cleaner and faster than slicing traversal arrays.",
    ],
    pattern:
      "Traversal reconstruction: use one traversal to choose the root, use inorder to split the range, and recurse on the resulting left and right windows.",
  },
  {
    kind: "problem",
    slug: "tree-construct-inorder-postorder",
    moduleId: "tree-construction",
    order: 25,
    title: "Construct Binary Tree from Inorder and Postorder Traversal",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/",
    tags: ["Tree", "Depth-First Search", "Divide and Conquer", "Hash Table", "Recursion"],
    companies: ["Amazon", "Microsoft", "Google", "Meta", "Adobe"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 25,
    statementMD:
      "Given two integer arrays **inorder** and **postorder**, where **inorder** is the inorder traversal of a binary tree and **postorder** is the postorder traversal of the same tree, construct and return the original binary tree.\n\nAll values are unique, so the inorder position of each root value is unambiguous.",
    constraints: [
      "1 <= inorder.length <= 3000",
      "postorder.length == inorder.length",
      "-3000 <= inorder[i], postorder[i] <= 3000",
      "All values in inorder and postorder are unique",
      "inorder and postorder describe the same binary tree",
    ],
    inputMD:
      "Two arrays: **inorder**, which visits **left, root, right**, and **postorder**, which visits **left, right, root**.",
    outputMD:
      "The root of the reconstructed binary tree described by both traversals.",
    examples: [
      {
        input: "inorder = [9,3,15,20,7], postorder = [9,15,7,20,3]",
        output: "[3,9,20,null,null,15,7]",
        explanation: "The last postorder value 3 is the root. In inorder, 3 splits the left subtree [9] from the right subtree [15,20,7]. Moving backward through postorder sees the right subtree root 20 before the left subtree root 9.",
      },
      {
        input: "inorder = [-1], postorder = [-1]",
        output: "[-1]",
        explanation: "A single traversal value creates a single-node tree.",
      },
    ],
    learningObjectives: [
      "Explain why the last unused postorder value is the root of the current subtree.",
      "Build from the end of postorder without reversing the array.",
      "Understand why the right subtree must be built before the left subtree.",
      "Use inorder boundaries and a hash map to reconstruct in linear time.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe pair **inorder + postorder** is the mirror image of the preorder reconstruction problem. Postorder visits **left, right, root**, so the last value of a subtree is its root. Inorder still gives the split: once you know the root, values left of it belong to the left subtree and values right of it belong to the right subtree.\n\nThe ordering subtlety is the whole interview trap. If you consume postorder from the end, after taking the root you encounter the right subtree before the left subtree. Therefore the recursive construction must attach **root.right** before **root.left**. Building left first will consume values from the wrong side and produce an invalid tree.",
    commonMistakes: [
      "Building the left subtree before the right subtree while moving backward through postorder.",
      "Using the first postorder value as the root instead of the last unused value.",
      "Scanning inorder repeatedly instead of using a hash map.",
      "Passing full arrays to every call and accidentally mixing subtree boundaries.",
    ],
    algorithmMD:
      "**Key idea**\n\nThe last unused postorder value is the root of the current subtree. Find that value in the current inorder window to split left and right. Because we are moving backward through postorder, build the right subtree first, then the left subtree.\n\n**Recursion walkthrough**\n\nUse inorder **[9,3,15,20,7]** and postorder **[9,15,7,20,3]**. The last postorder value is 3, so 3 is the root. In inorder, 3 splits the tree into left side **[9]** and right side **[15,20,7]**. Moving backward, the next postorder value is 20, which belongs to the right side. In inorder, 20 splits **[15,20,7]** into left child **[15]** and right child **[7]**. Because backward postorder sees right before left, 7 is built before 15. Only after the right subtree is finished do we build the left subtree rooted at 9.\n\n**Algorithm**\n\n1. Build a hash map from each inorder value to its index.\n2. Set **postorderIndex** to **postorder.length - 1**.\n3. Define a recursive helper over an inorder window **left..right**.\n4. If the window is empty, return **null**.\n5. Read **postorder[postorderIndex]** as the root value, then decrement **postorderIndex**.\n6. Look up the root's inorder index to split the current window.\n7. Recursively build the right subtree from the right window first.\n8. Recursively build the left subtree from the left window second.\n9. Return the root node.",
    solutions: [
      {
        name: "Reverse postorder pointer plus inorder index map",
        whenToUseMD:
          "Use this when inorder and postorder traversals are available and values are unique. It is the direct linear-time construction and highlights the right-before-left ordering subtlety.",
        approachMD:
          "Precompute **value -> inorder index**. Keep **postorderIndex** at the end of postorder. Each recursive call owns an inorder range. The current postorder value is the root for that range, the map gives the split, and the helper must build the right range before the left range because postorder is being consumed backward.",
        walkthroughMD:
          "1. Store every inorder value's index in a hash map.\n2. Start **postorderIndex** at the final position of postorder.\n3. Return **null** for an empty inorder range.\n4. Choose **postorder[postorderIndex]** as the root and move the pointer left.\n5. Split the current inorder range around the root.\n6. Build the right child first from the right range.\n7. Build the left child second from the left range.\n8. Return the root after both children are attached.",
        complexity: {
          time: "O(n)",
          space: "O(n)",
          note: "The hash map stores n indices and each node is created once. The recursion stack is O(h), which can be O(n) for a skewed tree.",
        },
        filename: "Solution.java",
        code: `import java.util.*;

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;

    TreeNode(int x){ val = x; }
}

class Solution {
    private int postorderIndex;
    private Map<Integer, Integer> inorderIndexByValue;

    public TreeNode buildTree(int[] inorder, int[] postorder) {
        postorderIndex = postorder.length - 1;
        inorderIndexByValue = new HashMap<>();

        for (int index = 0; index < inorder.length; index++) {
            inorderIndexByValue.put(inorder[index], index);
        }

        return build(postorder, 0, inorder.length - 1);
    }

    private TreeNode build(int[] postorder, int left, int right) {
        if (left > right) {
            return null;
        }

        int rootValue = postorder[postorderIndex];
        postorderIndex--;

        TreeNode root = new TreeNode(rootValue);
        int inorderIndex = inorderIndexByValue.get(rootValue);

        root.right = build(postorder, inorderIndex + 1, right);
        root.left = build(postorder, left, inorderIndex - 1);
        return root;
    }
}`,
      },
    ],
    dryRun: {
      inputMD:
        "inorder = **[9,3,15,20,7]**, postorder = **[9,15,7,20,3]**. Track the roots consumed from the end of postorder.",
      columns: ["call", "root", "inorder window", "right inorder", "left inorder"],
      rows: [
        ["build(0,4)", "3", "[9,3,15,20,7]", "[15,20,7]", "[9]"],
        ["build(2,4)", "20", "[15,20,7]", "[7]", "[15]"],
        ["build(4,4)", "7", "[7]", "empty", "empty"],
        ["build(2,2)", "15", "[15]", "empty", "empty"],
        ["build(0,0)", "9", "[9]", "empty", "empty"],
      ],
      narrativeMD:
        "The root sequence from the back of postorder is 3, 20, 7, 15, 9. That order proves why the right subtree must be constructed before the left subtree.",
    },
    interviewTipsMD:
      "After explaining that postorder's last value is the root, immediately mention the subtle mirror step: when walking backward, build right before left. Many wrong solutions are identical to preorder construction except for pointer direction, and that is not enough. Also call out that inorder remains the splitter in both reconstruction problems.",
    followUps: [
      "What would break if you built the left subtree before the right subtree?",
      "Can you derive an iterative stack-based reconstruction?",
      "How would duplicates change the uniqueness guarantee?",
      "How would you reconstruct a tree if you were given preorder and postorder instead?",
    ],
    similarProblems: [
      { title: "Construct Binary Tree from Preorder and Inorder Traversal", difficulty: "Medium", slug: "tree-construct-preorder-inorder", note: "The forward-consumption version of the same root-and-split idea." },
      { title: "Serialize and Deserialize Binary Tree", difficulty: "Hard", slug: "tree-serialize-deserialize", note: "Another reconstruction problem driven by traversal order." },
      { title: "Binary Tree Postorder Traversal", difficulty: "Easy", slug: "tree-postorder-traversal", note: "Builds intuition for why the root appears at the end." },
      { title: "Construct Binary Tree from Preorder and Postorder Traversal", difficulty: "Medium", url: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-postorder-traversal/", note: "Explores reconstruction when inorder is not available as a splitter." },
    ],
    keyTakeaways: [
      "Postorder's last unused value is the current subtree root.",
      "Inorder still splits that root into left and right subtree ranges.",
      "When consuming postorder backward, construct right before left.",
      "The same hash-map and boundary technique keeps reconstruction O(n).",
    ],
    pattern:
      "Reverse traversal reconstruction: consume roots from the end of postorder, split with inorder, and recurse right before left.",
  },
  {
    kind: "problem",
    slug: "tree-serialize-deserialize",
    moduleId: "tree-construction",
    order: 26,
    title: "Serialize and Deserialize Binary Tree",
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/",
    tags: ["Tree", "Depth-First Search", "Design", "String", "Recursion"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Netflix"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 35,
    statementMD:
      "Design an algorithm to serialize and deserialize a binary tree. Serialization converts a binary tree into a string. Deserialization converts that string back into the exact same tree structure.\n\nThe encoded format is your choice, but it must preserve both node values and missing child positions so the tree can be reconstructed without ambiguity.",
    constraints: [
      "0 <= number of nodes <= 10^4",
      "-1000 <= Node.val <= 1000",
      "The tree may be empty",
      "Do not rely on shared static state between serialize and deserialize calls",
    ],
    inputMD:
      "For **serialize**, the input is a **TreeNode root**. For **deserialize**, the input is a string produced by the same codec.",
    outputMD:
      "For **serialize**, return a string. For **deserialize**, return the root of a binary tree whose structure and values match the original tree.",
    examples: [
      {
        input: "root = [1,2,3,null,null,4,5]",
        output: "[1,2,3,null,null,4,5]",
        explanation: "One valid serialized string is 1,2,null,null,3,4,null,null,5,null,null. Reading that preorder stream with explicit null markers reconstructs node 1, its leaf child 2, and the right subtree rooted at 3.",
      },
      {
        input: "root = []",
        output: "[]",
        explanation: "The empty tree serializes as the single token null, and deserializing that token returns a null root.",
      },
    ],
    learningObjectives: [
      "Explain why traversal values alone are not enough to preserve arbitrary tree shape.",
      "Use preorder plus explicit null markers as a complete tree encoding.",
      "Deserialize by consuming tokens in the same order they were produced.",
      "Implement a LeetCode-style design class with symmetric serialize and deserialize methods.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThis is a tree reconstruction problem disguised as a design problem. A traversal like preorder gives visit order, but without missing-child markers, multiple different shapes can produce the same value sequence. The signal is that structure matters as much as values.\n\nPreorder with explicit **null** markers uniquely determines the tree. Each real token creates a node, then the next tokens fully describe its left subtree and right subtree. Each **null** token closes one missing child position. Because the stream is consumed in the same recursive order it was written, deserialization does not need a separate inorder traversal.",
    commonMistakes: [
      "Serializing only real node values and losing the shape of missing children.",
      "Using level-order text but forgetting to record enough null positions for sparse trees.",
      "Parsing tokens with a global index that is not reset between calls.",
      "Consuming tokens in a different order during deserialization than the order used during serialization.",
    ],
    algorithmMD:
      "**Key idea**\n\nWrite a preorder DFS stream. For a real node, append its value, then serialize its left subtree, then serialize its right subtree. For a missing child, append the token **null**. Join tokens with the comma delimiter. To deserialize, put the split tokens in a queue and rebuild recursively by consuming one token per call.\n\n**Recursion walkthrough**\n\nFor **[1,2,3,null,null,4,5]**, preorder visits 1 first. The left child 2 is a leaf, so after 2 the stream records **null** for its left child and **null** for its right child. Then the traversal returns to node 1's right child 3. Node 3 writes its left child 4, then two **null** markers, then its right child 5, then two **null** markers. During deserialization, token 1 creates the root, the next tokens completely fill its left subtree, and only then do later tokens fill its right subtree.\n\n**Algorithm**\n\n1. For serialization, create an empty token list.\n2. Run preorder DFS from the root.\n3. If the current node is **null**, append **null** and return.\n4. Otherwise append the node value, then recurse left, then recurse right.\n5. Join tokens using the comma delimiter.\n6. For deserialization, split the data string by comma and store the tokens in a queue.\n7. Pop one token. If it is **null**, return **null**.\n8. Otherwise create a node with that value, recursively build its left child, recursively build its right child, and return the node.",
    solutions: [
      {
        name: "Preorder DFS with null markers",
        whenToUseMD:
          "Use this when the format can be chosen freely. It is compact to implement, easy to reason about, and the serialized stream is self-delimiting because every missing child is represented explicitly.",
        approachMD:
          "Serialization and deserialization are exact mirrors. The writer emits one token for every real node and every missing child in preorder. The reader consumes one token at a time from a queue. A **null** token returns an empty child immediately; a value token creates a node and recursively fills its left and right children.",
        walkthroughMD:
          "1. During serialization, append **null** whenever DFS reaches a missing child.\n2. Append real node values before visiting children so the stream is preorder.\n3. Join the token list with commas to produce the final string.\n4. During deserialization, split by comma and load the tokens into a queue.\n5. Remove the next token for each recursive call.\n6. Return **null** for a **null** token.\n7. For a value token, create a node, then recursively assign its left and right children in preorder order.",
        complexity: {
          time: "O(n)",
          space: "O(n)",
          note: "Serialization and deserialization each process every real node and null marker once. The token list or queue is O(n), and recursion uses O(h) call-stack space.",
        },
        filename: "Codec.java",
        code: `import java.util.*;

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;

    TreeNode(int x){ val = x; }
}

class Codec {
    public String serialize(TreeNode root) {
        List<String> tokens = new ArrayList<>();
        write(root, tokens);
        return String.join(",", tokens);
    }

    private void write(TreeNode node, List<String> tokens) {
        if (node == null) {
            tokens.add("null");
            return;
        }

        tokens.add(String.valueOf(node.val));
        write(node.left, tokens);
        write(node.right, tokens);
    }

    public TreeNode deserialize(String data) {
        Queue<String> tokens = new LinkedList<>(Arrays.asList(data.split(",")));
        return read(tokens);
    }

    private TreeNode read(Queue<String> tokens) {
        String token = tokens.remove();

        if (token.equals("null")) {
            return null;
        }

        TreeNode node = new TreeNode(Integer.parseInt(token));
        node.left = read(tokens);
        node.right = read(tokens);
        return node;
    }
}`,
      },
    ],
    dryRun: {
      inputMD:
        "Serialize and deserialize **[1,2,3,null,null,4,5]** using preorder tokens: **1,2,null,null,3,4,null,null,5,null,null**.",
      columns: ["step", "next token or group", "action", "partial reconstruction"],
      rows: [
        ["1", "1", "create root", "node 1"],
        ["2", "2", "create left child of 1", "1 has left child 2"],
        ["3", "null, null", "finish both children of 2", "2 is a leaf"],
        ["4", "3", "create right child of 1", "1 has right child 3"],
        ["5", "4, null, null", "create left child of 3 and finish it", "4 is a leaf"],
        ["6", "5, null, null", "create right child of 3 and finish it", "5 is a leaf"],
      ],
      narrativeMD:
        "Every recursive read consumes exactly the tokens written by the matching recursive write. The null markers are what tell the reader when to stop a child branch and return to its parent.",
    },
    interviewTipsMD:
      "Clarify that the problem accepts any reversible encoding, then choose preorder with explicit **null** markers because it is simple and proves uniqueness. Point out that plain preorder without **null** markers is ambiguous. Keep the implementation symmetric: one helper writes a node, the other helper reads exactly one node or missing child from the queue.",
    followUps: [
      "How would you serialize with level-order traversal instead?",
      "How would you reduce the output size for a very sparse tree?",
      "How would you handle values that are strings rather than integers?",
      "How would you make the codec iterative to avoid deep recursion?",
    ],
    similarProblems: [
      { title: "Construct Binary Tree from Preorder and Inorder Traversal", difficulty: "Medium", slug: "tree-construct-preorder-inorder", note: "Also reconstructs a tree by consuming traversal information." },
      { title: "Construct Binary Tree from Inorder and Postorder Traversal", difficulty: "Medium", slug: "tree-construct-inorder-postorder", note: "Uses inorder as an external splitter instead of explicit null markers." },
      { title: "Binary Tree Level Order Traversal", difficulty: "Medium", slug: "tree-level-order-traversal", note: "Useful for understanding alternative breadth-first encodings." },
      { title: "Serialize and Deserialize BST", difficulty: "Medium", url: "https://leetcode.com/problems/serialize-and-deserialize-bst/", note: "A specialized codec that can exploit BST ordering." },
    ],
    keyTakeaways: [
      "A tree codec must preserve missing child positions, not just node values.",
      "Preorder plus explicit **null** markers uniquely describes any binary tree.",
      "Deserialization should consume tokens in the exact same recursive order used by serialization.",
      "The codec class should not depend on leftover global state from previous calls.",
    ],
    pattern:
      "Self-delimiting preorder codec: write value or null for every child position, then rebuild by consuming the stream recursively.",
  },
];
