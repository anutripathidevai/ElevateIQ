import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "ll-copy-list-with-random-pointer",
    moduleId: "ll-advanced",
    order: 20,
    title: "Copy List with Random Pointer",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/copy-list-with-random-pointer/",
    tags: ["Linked List", "Hash Map", "Deep Copy", "Pointer", "Graph Clone"],
    companies: ["Amazon", "Google", "Meta", "Microsoft", "Bloomberg", "Apple"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 30,
    statementMD:
      "You are given the **head** of a linked list where each node has two pointers: **next** points to the next node in the ordinary chain, and **random** points to any node in the list or to **null**. Return the head of a deep copy of the list. Every copied node must be a brand-new node with the same value, and its **next** and **random** pointers must point only to copied nodes, never to original nodes.",
    constraints: [
      "0 <= n <= 1000",
      "-10^4 <= Node.val <= 10^4",
      "Node.random is null or points to one of the nodes in the linked list",
    ],
    inputMD:
      "The **head** of a linked list. Each node is represented by its value and the index of the node its **random** pointer targets, or **null** if it has no random target.",
    outputMD:
      "Return the **head** of a deep-copied linked list with identical values, identical **next** order, and identical **random** relationships among the copied nodes.",
    examples: [
      {
        input: "head = [[7,null],[13,0],[11,4],[10,2],[1,0]]",
        output: "[[7,null],[13,0],[11,4],[10,2],[1,0]]",
        explanation: "The output has the same value and random-index shape, but every node is newly allocated. For example, the copied 13 points randomly to the copied 7, not the original 7.",
      },
      {
        input: "head = [[1,1],[2,1]]",
        output: "[[1,1],[2,1]]",
        explanation: "The copied first node points randomly to the copied second node, and the copied second node points randomly to itself.",
      },
    ],
    learningObjectives: [
      "Recognise when a linked list behaves like a small graph because pointers can jump outside the next chain.",
      "Use a hash map to preserve the one-to-one relationship between original nodes and copied nodes.",
      "Wire structural pointers only after all copied nodes exist, avoiding references back into the original list.",
      "Understand the O(1)-extra-space interleaving trick and why it must restore the original list.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is that each node has identity, not just value. Two different nodes may store the same value, and **random** can point forward, backward, to itself, or to **null**. That makes the list feel like a graph with two outgoing references per node, so a value-based copy is not enough. You need a stable mapping from each original node object to its copied node object.\n\nThe pointer trap is wiring too early. If you create a copy of the current node and immediately assign **random** by following the original pointer, the target copy may not exist yet. The clean pattern is either two passes with a map, or temporarily weaving copies between originals so every original can find its copy through **original.next**.",
    commonMistakes: [
      "Copying only values and next pointers while leaving random pointers aimed at original nodes.",
      "Using node values as map keys even though values are not guaranteed to be unique.",
      "Trying to wire random pointers before every copied node has been created.",
      "In the interleaving solution, forgetting to unweave the lists and restore the original next chain.",
    ],
    algorithmMD:
      "**Key idea**\n\nBuild a one-to-one relationship from each original node to its clone. Once every clone exists, pointer wiring becomes a lookup problem: **copy.next** is the clone of **original.next**, and **copy.random** is the clone of **original.random**. A hash map makes both lookups direct and keeps object identity separate from node values.\n\n**Pointer walkthrough**\n\nTake **A -> B -> C**, with **A.random -> C**, **B.random -> A**, and **C.random -> B**. First pass creates detached nodes **A'**, **B'**, and **C'**, and records **A -> A'**, **B -> B'**, **C -> C'** in the map. Second pass stands on **B** and reads its pointers: **B.next -> C** and **B.random -> A**. The copy **B'** therefore gets **B'.next -> C'** and **B'.random -> A'**. The same local rule works even for self-random pointers and **null** random pointers.\n\n**Algorithm**\n\n1. If **head** is **null**, return **null**.\n2. Traverse the original list once and create one new node for every original node. Store **original -> copy** in a hash map.\n3. Traverse the original list again. For each original node, fetch its copy from the map.\n4. Assign the copy's **next** pointer to the mapped copy of **original.next**.\n5. Assign the copy's **random** pointer to the mapped copy of **original.random**.\n6. Return the copy mapped from the original **head**.",
    solutions: [
      {
        name: "Two-pass hash map by node identity",
        whenToUseMD:
          "Use this in interviews as the primary answer. It is direct, easy to prove correct, and makes the identity mapping explicit before any pointer wiring begins.",
        approachMD:
          "Create all copied nodes in the first pass and remember them in a **HashMap** keyed by the original node object. In the second pass, wire each copy's **next** and **random** fields by looking up the copied target for the original target.",
        walkthroughMD:
          "1. Return **null** immediately for an empty input list.\n2. Walk the original **next** chain and allocate a copy node for each original node.\n3. Store every pair as **original -> copy** so later pointer targets are resolved by object identity.\n4. Walk the original chain again and use the map to assign **next** and **random** for each copy.\n5. Return the copy corresponding to the original **head**.",
        complexity: {
          time: "O(n)",
          space: "O(n)",
          note: "The two passes touch each node a constant number of times, and the map stores one entry per original node.",
        },
        filename: "Solution.java",
        code: `import java.util.*;

class Node {
    int val;
    Node next;
    Node random;

    Node(int val) {
        this.val = val;
    }
}

class Solution {
    public Node copyRandomList(Node head) {
        if (head == null) {
            return null;
        }

        Map<Node, Node> copiesByOriginal = new HashMap<>();
        Node current = head;

        while (current != null) {
            copiesByOriginal.put(current, new Node(current.val));
            current = current.next;
        }

        current = head;
        while (current != null) {
            Node copy = copiesByOriginal.get(current);
            copy.next = copiesByOriginal.get(current.next);
            copy.random = copiesByOriginal.get(current.random);
            current = current.next;
        }

        return copiesByOriginal.get(head);
    }
}`,
      },
      {
        name: "Interleave copies for O(1) extra space",
        whenToUseMD:
          "Use this when the interviewer asks for less auxiliary space and accepts temporarily modifying the list during the algorithm. Be explicit that the original list is restored before returning.",
        approachMD:
          "Weave each copied node immediately after its original node, so **original.next** temporarily becomes the copy. Then **original.random.next** identifies the copied random target. After random pointers are wired, separate the woven chain into the restored original list and the copied list.",
        walkthroughMD:
          "1. For every original node, create its copy and insert it directly after the original.\n2. Walk the woven list and set each copy's **random** to **original.random.next** when **original.random** exists.\n3. Walk the woven list again, restoring each original node's **next** pointer.\n4. At the same time, connect copied nodes to form the copied list.\n5. Return the copied head from the separated clone chain.",
        complexity: {
          time: "O(n)",
          space: "O(1)",
          note: "The algorithm uses only a few pointers beyond the output nodes, while temporarily weaving copies into the original chain.",
        },
        filename: "Solution.java",
        code: `class Node {
    int val;
    Node next;
    Node random;

    Node(int val) {
        this.val = val;
    }
}

class Solution {
    public Node copyRandomList(Node head) {
        if (head == null) {
            return null;
        }

        Node current = head;
        while (current != null) {
            Node copy = new Node(current.val);
            copy.next = current.next;
            current.next = copy;
            current = copy.next;
        }

        current = head;
        while (current != null) {
            Node copy = current.next;
            if (current.random != null) {
                copy.random = current.random.next;
            }
            current = copy.next;
        }

        Node dummy = new Node(0);
        Node copyTail = dummy;
        current = head;

        while (current != null) {
            Node copy = current.next;
            Node nextOriginal = copy.next;

            copyTail.next = copy;
            copyTail = copy;
            current.next = nextOriginal;
            current = nextOriginal;
        }

        return dummy.next;
    }
}`,
      },
    ],
    dryRun: {
      inputMD:
        "Original list: **A -> B -> C**. Random pointers: **A.random -> C**, **B.random -> A**, **C.random -> B**. Trace the two-pass hash map solution.",
      columns: ["step", "current original", "map or pointer action", "copied pointer result"],
      rows: [
        ["1", "A", "Create A' and store A -> A'", "A' has value A"],
        ["2", "B", "Create B' and store B -> B'", "B' has value B"],
        ["3", "C", "Create C' and store C -> C'", "C' has value C"],
        ["4", "A", "Use A.next -> B and A.random -> C", "A'.next -> B', A'.random -> C'"],
        ["5", "B", "Use B.next -> C and B.random -> A", "B'.next -> C', B'.random -> A'"],
        ["6", "C", "Use C.next -> null and C.random -> B", "C'.next -> null, C'.random -> B'"],
      ],
      narrativeMD:
        "The copied list has the same shape as the original, but every outgoing pointer lands on a copied node because each assignment goes through the original-to-copy map.",
    },
    complexityNote:
      "The hash map version is the clearest optimal interview answer. The interleaving version keeps auxiliary space constant by using the original next chain as a temporary lookup structure.",
    interviewTipsMD:
      "Start by saying values cannot identify nodes; object identity must be preserved. Then describe the invariant **map[original] = copy** before writing code. If you present the interleaving follow-up, say out loud that it has three phases: weave, wire random, unweave. Interviewers care that the original list is not left mutated.",
    followUps: [
      "How would you copy the list if each node had several arbitrary extra pointers?",
      "How would this change if random pointers could point outside the given list?",
      "Can you explain the O(1)-space interleaving approach without using a hash map?",
      "How would you test that no copied pointer still references an original node?",
    ],
    similarProblems: [
      {
        title: "Flatten a Multilevel Doubly Linked List",
        difficulty: "Medium",
        slug: "ll-flatten-multilevel-doubly-linked-list",
        note: "Also requires preserving multiple pointer relationships while rewiring nodes.",
      },
      {
        title: "Doubly Linked List",
        difficulty: "Easy",
        slug: "ll-doubly-linked-list",
        note: "Builds the pointer-identity mental model needed for richer node structures.",
      },
      {
        title: "LFU Cache",
        difficulty: "Hard",
        slug: "ll-lfu-cache",
        note: "Another advanced problem where hash maps point to node objects rather than values.",
      },
      {
        title: "Clone Graph",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/clone-graph/",
        note: "The graph version of mapping original objects to cloned objects.",
      },
    ],
    keyTakeaways: [
      "Random pointers make node identity more important than node value.",
      "A hash map from original node to copied node turns pointer wiring into direct lookup.",
      "The interleaving trick uses **original.next** as a temporary route to the copy.",
      "A deep copy is correct only when copied pointers never reference original nodes.",
    ],
    pattern:
      "Object-identity clone: create every copied node first, remember original-to-copy, then wire all outgoing pointers through that mapping.",
  },
  {
    kind: "problem",
    slug: "ll-flatten-multilevel-doubly-linked-list",
    moduleId: "ll-advanced",
    order: 21,
    title: "Flatten a Multilevel Doubly Linked List",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/flatten-a-multilevel-doubly-linked-list/",
    tags: ["Linked List", "Doubly Linked List", "Depth-First Search", "Stack", "Pointer"],
    companies: ["Amazon", "Google", "Meta", "Microsoft", "Oracle"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 30,
    statementMD:
      "You are given the **head** of a multilevel doubly linked list. Each node has **prev**, **next**, and **child** pointers. A child pointer may point to the head of another doubly linked list, which may also contain child pointers. Flatten the structure so that all nodes appear in depth-first order in one doubly linked list. Every **child** pointer in the result must be **null**.",
    constraints: [
      "The number of nodes is between 0 and 1000",
      "1 <= Node.val <= 10^5",
      "There are no cycles in next, prev, or child pointers",
    ],
    inputMD:
      "The **head** of a multilevel doubly linked list. The ordinary chain uses **next** and **prev**, while **child** points to the head of a nested list.",
    outputMD:
      "Return the **head** of a single-level doubly linked list in depth-first order, with correct **prev** and **next** links and every **child** pointer set to **null**.",
    examples: [
      {
        input: "head = 1 -> 2 -> 3 -> 4 -> 5 -> 6, with 3.child = 7 -> 8 -> 9 -> 10 and 8.child = 11 -> 12",
        output: "1 -> 2 -> 3 -> 7 -> 8 -> 11 -> 12 -> 9 -> 10 -> 4 -> 5 -> 6",
        explanation: "Depth-first order visits node 3's child list before returning to node 4, and visits node 8's child list before returning to node 9.",
      },
      {
        input: "head = 1 -> 2, with 1.child = 3 -> 4",
        output: "1 -> 3 -> 4 -> 2",
        explanation: "The child list of 1 is spliced between 1 and its original next node 2, and 2's prev pointer is updated to point back to 4.",
      },
    ],
    learningObjectives: [
      "Recognise a multilevel linked list as a depth-first traversal problem over node references.",
      "Splice a child list between a node and its original next node without losing either side.",
      "Maintain both directions of a doubly linked list after every local mutation.",
      "Use a stack to simulate recursion while preserving the correct return point.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is the word flatten combined with **child** pointers. The result is not breadth-first by levels; it is preorder depth-first: visit the current node, then its child chain, then the original next chain. That means whenever a node has a child, the child list must be inserted before the node's saved next pointer.\n\nThe pointer trap is losing the saved next node. If **curr.next** is overwritten by **curr.child** before the original next is remembered, the algorithm has no way to return to the sibling chain. A stack solves this cleanly: push the original next before descending into the child, so the child chain is fully consumed before the sibling continues.",
    commonMistakes: [
      "Forgetting to set **child** to **null** after splicing a child list into the main chain.",
      "Updating next pointers but not fixing the matching prev pointers.",
      "Losing the original next node when replacing it with the child head.",
      "Flattening by breadth-first levels instead of the required depth-first order.",
    ],
    algorithmMD:
      "**Key idea**\n\nPerform a preorder depth-first traversal and rebuild the list as one doubly linked chain. A stack stores nodes that should be visited later. Push **current.next** first, then **current.child**, so the child is popped and processed before the sibling. A dummy predecessor lets every visited node be appended with the same two pointer assignments.\n\n**Pointer walkthrough**\n\nConsider **1 -> 2 -> 3**, where **2.child -> 4 -> 5**. When the traversal reaches **2**, the original next node **3** is the return point, so it is saved on the stack. The child head **4** is processed next and linked as **2 <-> 4 <-> 5**. After **5** finishes, the stack brings back **3**, and the chain becomes **1 <-> 2 <-> 4 <-> 5 <-> 3**. During this splice, **2.child** is set to **null**, **4.prev -> 2**, and **3.prev -> 5**.\n\n**Algorithm**\n\n1. If **head** is **null**, return **null**.\n2. Create a dummy node and set **previous** to the dummy. Push **head** onto a stack.\n3. While the stack is not empty, pop the next node to visit.\n4. Append it after **previous** by setting **previous.next** and **current.prev**.\n5. Push **current.next** if it exists, because it must be resumed after the child chain.\n6. Push **current.child** if it exists, then set **current.child** to **null**.\n7. Move **previous** to **current**. After the loop, detach the dummy and return the real head.",
    solutions: [
      {
        name: "Iterative depth-first splice with stack",
        whenToUseMD:
          "Use this when you want explicit control over traversal order and want to avoid relying on the call stack for deeply nested child lists.",
        approachMD:
          "The stack holds future nodes in reverse visit order. By pushing the original **next** before the **child**, the child chain is processed first. Each popped node is appended to the flattened tail, its **prev** pointer is repaired, and its **child** pointer is cleared.",
        walkthroughMD:
          "1. Use a dummy node as the predecessor before the flattened list.\n2. Push **head**, then repeatedly pop the next node in depth-first order.\n3. Link the popped node after the current flattened tail with both **next** and **prev** pointers.\n4. Push the popped node's original **next** pointer before pushing its **child** pointer.\n5. Clear the **child** pointer and advance the flattened tail.\n6. Detach the dummy by setting the real head's **prev** to **null** before returning.",
        complexity: {
          time: "O(n)",
          space: "O(n)",
          note: "Every node is popped and linked once; the stack can hold return points for many pending sibling chains.",
        },
        filename: "Solution.java",
        code: `import java.util.*;

class Node {
    int val;
    Node prev;
    Node next;
    Node child;
}

class Solution {
    public Node flatten(Node head) {
        if (head == null) {
            return null;
        }

        Node dummy = new Node();
        Node previous = dummy;
        Deque<Node> stack = new ArrayDeque<>();
        stack.push(head);

        while (!stack.isEmpty()) {
            Node current = stack.pop();
            previous.next = current;
            current.prev = previous;

            if (current.next != null) {
                stack.push(current.next);
            }
            if (current.child != null) {
                stack.push(current.child);
                current.child = null;
            }

            previous = current;
        }

        Node flattenedHead = dummy.next;
        flattenedHead.prev = null;
        return flattenedHead;
    }
}`,
      },
    ],
    dryRun: {
      inputMD:
        "Input: **1 -> 2 -> 3**, with **2.child -> 4 -> 5**. Track the iterative stack solution. The top of the stack is shown first.",
      columns: ["step", "popped node", "stack after pushes", "pointer action", "flattened prefix"],
      rows: [
        ["1", "1", "empty", "Append 1 after dummy", "1"],
        ["2", "2", "4, 3", "Append 2, save 3, descend to child 4, clear 2.child", "1 <-> 2"],
        ["3", "4", "5, 3", "Append 4, save its next 5", "1 <-> 2 <-> 4"],
        ["4", "5", "3", "Append 5, no child remains", "1 <-> 2 <-> 4 <-> 5"],
        ["5", "3", "empty", "Append saved sibling 3 and set 3.prev to 5", "1 <-> 2 <-> 4 <-> 5 <-> 3"],
      ],
      narrativeMD:
        "The stack preserves the return point **3** while the child chain **4 -> 5** is flattened. Every appended node receives a matching **prev** link, so the final list works in both directions.",
    },
    complexityNote:
      "The iterative DFS solution is linear time. Its auxiliary space is proportional to the number of pending return points, which is O(n) in the worst case.",
    interviewTipsMD:
      "Draw the splice before coding. Say that when **current.child** exists, the child list must come before the saved **current.next** chain. With the stack approach, emphasize push order: push next first, child second. Also call out the two required cleanup steps, setting **child** to **null** and detaching the dummy's **prev** link from the real head.",
    followUps: [
      "How would you implement the same depth-first flattening recursively by returning the tail of each flattened child list?",
      "How would the output change if the interviewer asked for breadth-first flattening instead?",
      "How would you detect invalid input that contains a cycle through child pointers?",
      "Can you flatten in place while preserving a way to reconstruct the original multilevel structure?",
    ],
    similarProblems: [
      {
        title: "Doubly Linked List",
        difficulty: "Easy",
        slug: "ll-doubly-linked-list",
        note: "The core pointer skill is maintaining both prev and next during local rewiring.",
      },
      {
        title: "Dummy Node Pattern",
        difficulty: "Easy",
        slug: "ll-dummy-node-pattern",
        note: "The flattening implementation uses a sentinel predecessor to simplify appending nodes.",
      },
      {
        title: "Copy List with Random Pointer",
        difficulty: "Medium",
        slug: "ll-copy-list-with-random-pointer",
        note: "Another advanced node structure with more than one outgoing pointer.",
      },
      {
        title: "Flatten Binary Tree to Linked List",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/flatten-binary-tree-to-linked-list/",
        note: "Uses preorder flattening over a different pointer structure.",
      },
    ],
    keyTakeaways: [
      "Flattening is a depth-first traversal problem, not a level-order traversal problem.",
      "Save the original next pointer before descending into a child chain.",
      "Doubly linked rewiring must update both **next** and **prev** every time.",
      "Every child pointer must be cleared in the final single-level list.",
    ],
    pattern:
      "Depth-first splice: save the sibling return point, process the child chain first, then reconnect the sibling after the child tail.",
  },
  {
    kind: "problem",
    slug: "ll-lfu-cache",
    moduleId: "ll-advanced",
    order: 22,
    title: "LFU Cache",
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/lfu-cache/",
    tags: ["Design", "Hash Map", "Doubly Linked List", "Cache", "Linked List", "Frequency"],
    companies: ["Amazon", "Google", "Meta", "Microsoft", "Oracle", "Netflix"],
    estimatedReadingMin: 12,
    estimatedSolvingMin: 40,
    statementMD:
      "Design an **LFUCache** data structure. **get(key)** returns the value for **key** if it exists, otherwise **-1**. **put(key, value)** inserts or updates the value for **key**. When the cache is full, it must evict the least frequently used key. If multiple keys share the lowest frequency, evict the least recently used key among them. Both operations must run in **O(1)** average time.",
    constraints: [
      "0 <= capacity <= 10^4",
      "0 <= key <= 10^5",
      "0 <= value <= 10^9",
      "At most 2 * 10^5 calls will be made to get and put",
    ],
    inputMD:
      "A constructor call **LFUCache(capacity)** followed by a sequence of **get(key)** and **put(key, value)** operations.",
    outputMD:
      "For the constructor and **put**, output **null**. For **get**, output the stored value or **-1** if the key is absent.",
    examples: [
      {
        input: "operations = [LFUCache, put, put, get, put, get, get, put, get, get, get], arguments = [[2], [1,1], [2,2], [1], [3,3], [2], [3], [4,4], [1], [3], [4]]",
        output: "[null, null, null, 1, null, -1, 3, null, -1, 3, 4]",
        explanation: "Key 1 is used twice before key 3 is inserted, so key 2 is evicted first. Later keys 1 and 3 tie on frequency, so the older key 1 is evicted when key 4 is inserted.",
      },
      {
        input: "operations = [LFUCache, put, put, put, get, get, get], arguments = [[2], [2,1], [2,2], [3,3], [2], [3], [4]]",
        output: "[null, null, null, null, 2, 3, -1]",
        explanation: "Updating key 2 changes its value and increases its frequency. Key 3 is still present because capacity has not been exceeded after the update and insert sequence.",
      },
    ],
    learningObjectives: [
      "Separate key lookup, frequency lookup, and recency ordering into cooperating structures.",
      "Maintain a **minFreq** tracker so eviction never scans all frequencies.",
      "Use doubly linked lists as frequency buckets to evict the least recent node inside the lowest frequency.",
      "Handle design edge cases such as capacity zero, value updates, and frequency promotion.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is a cache design with two eviction rules: frequency first, recency as the tie-breaker. A plain hash map gives lookup but no eviction order. A single LRU list gives recency but not frequency. A heap can find low frequency but cannot update arbitrary nodes in strict O(1). The O(1) design needs two maps and linked buckets.\n\nThink of every cache entry as a node that lives inside exactly one frequency bucket. The key map finds the node immediately. The frequency map finds the doubly linked list for that node's current count. Inside one frequency, the list is ordered by recency. **minFreq** points to the lowest non-empty frequency bucket, so eviction removes the tail-side node from that bucket without scanning.",
    commonMistakes: [
      "Tracking frequency counts but not recency within the same frequency bucket.",
      "Scanning all keys or all frequencies during eviction, which breaks O(1).",
      "Forgetting that successful get and updating put both increase a key's frequency.",
      "Not updating **minFreq** when the last node leaves the current minimum-frequency bucket.",
    ],
    algorithmMD:
      "**Key idea**\n\nUse **nodesByKey** for direct key lookup, **listsByFreq** for frequency buckets, and **minFreq** for the current eviction bucket. Each bucket is a doubly linked list ordered from most recent near the head to least recent near the tail. Accessing a node removes it from its old bucket, increments its frequency, and inserts it at the most-recent end of the new bucket.\n\n**Pointer walkthrough**\n\nCapacity is 2. After **put(1,1)** and **put(2,2)**, bucket **freq 1** is **2 -> 1** from most recent to least recent, and **minFreq = 1**. Calling **get(1)** removes node 1 from **freq 1**, increments it, and inserts it into **freq 2**, so buckets are **freq 1: 2** and **freq 2: 1**. **minFreq** stays 1 because key 2 is still in **freq 1**. Now **put(3,3)** must evict from **freq 1**, and within that bucket the least recent node is key 2, so key 2 is removed before key 3 enters **freq 1**.\n\n**Algorithm**\n\n1. The constructor stores **capacity**, creates the key map, creates the frequency map, and sets **minFreq** to **0**.\n2. For **get(key)**, return **-1** if the key is absent. Otherwise promote the node's frequency and return its value.\n3. For **put(key, value)**, return immediately when **capacity** is **0**.\n4. If the key already exists, update its value, promote its frequency, and stop.\n5. If the cache is full, remove the least-recent node from the bucket at **minFreq** and delete its key from the key map.\n6. Create a new node with frequency **1**, insert it at the most-recent end of bucket **1**, store it in the key map, and set **minFreq = 1**.",
    solutions: [
      {
        name: "Two hash maps plus frequency buckets",
        whenToUseMD:
          "Use this design when the interviewer requires strict O(1) average get and put. It is the standard LFU cache architecture and directly connects cache eviction to doubly linked list operations.",
        approachMD:
          "Each cache entry is a node containing **key**, **value**, **freq**, **prev**, and **next**. **nodesByKey** maps keys to nodes. **listsByFreq** maps a frequency count to a doubly linked list of nodes with that count, ordered by recency. Promoting a node is an O(1) remove from one list and O(1) insert into another. Eviction uses **minFreq** to choose the bucket and removes that bucket's least-recent tail node.",
        walkthroughMD:
          "1. Keep dummy head and tail sentinels inside every frequency bucket so add and remove are uniform.\n2. On get, find the node by key. If it is missing, return **-1**.\n3. If present, remove it from its current frequency list and update **minFreq** if that list became empty.\n4. Increment the node's frequency and insert it at the most-recent end of the new frequency list.\n5. On put for an existing key, update the value and run the same promotion logic.\n6. On put for a new key, evict from the **minFreq** bucket if capacity is full, then insert the new node into frequency **1** and reset **minFreq** to **1**.",
        complexity: {
          time: "Average O(1) per get and put",
          space: "O(capacity)",
          note: "The key map stores one node per live key, and frequency buckets together store the same nodes once.",
        },
        filename: "LFUCache.java",
        code: `import java.util.*;

class LFUCache {
    private final int capacity;
    private int minFreq;
    private final Map<Integer, Node> nodesByKey;
    private final Map<Integer, DoublyLinkedList> listsByFreq;

    public LFUCache(int capacity) {
        this.capacity = capacity;
        minFreq = 0;
        nodesByKey = new HashMap<>();
        listsByFreq = new HashMap<>();
    }

    public int get(int key) {
        Node node = nodesByKey.get(key);
        if (node == null) {
            return -1;
        }

        increaseFrequency(node);
        return node.value;
    }

    public void put(int key, int value) {
        if (capacity == 0) {
            return;
        }

        Node node = nodesByKey.get(key);
        if (node != null) {
            node.value = value;
            increaseFrequency(node);
            return;
        }

        if (nodesByKey.size() == capacity) {
            DoublyLinkedList minList = listsByFreq.get(minFreq);
            Node evicted = minList.removeLeastRecent();
            nodesByKey.remove(evicted.key);
        }

        Node created = new Node(key, value);
        nodesByKey.put(key, created);
        minFreq = 1;
        listsByFreq.computeIfAbsent(1, ignored -> new DoublyLinkedList()).addMostRecent(created);
    }

    private void increaseFrequency(Node node) {
        int oldFreq = node.freq;
        DoublyLinkedList oldList = listsByFreq.get(oldFreq);
        oldList.remove(node);

        if (oldFreq == minFreq && oldList.isEmpty()) {
            minFreq++;
        }

        node.freq++;
        listsByFreq.computeIfAbsent(node.freq, ignored -> new DoublyLinkedList()).addMostRecent(node);
    }

    private static class Node {
        private final int key;
        private int value;
        private int freq;
        private Node prev;
        private Node next;

        private Node(int key, int value) {
            this.key = key;
            this.value = value;
            freq = 1;
        }
    }

    private static class DoublyLinkedList {
        private final Node head;
        private final Node tail;
        private int size;

        private DoublyLinkedList() {
            head = new Node(0, 0);
            tail = new Node(0, 0);
            head.next = tail;
            tail.prev = head;
            size = 0;
        }

        private void addMostRecent(Node node) {
            Node first = head.next;
            node.prev = head;
            node.next = first;
            head.next = node;
            first.prev = node;
            size++;
        }

        private void remove(Node node) {
            Node before = node.prev;
            Node after = node.next;
            before.next = after;
            after.prev = before;
            node.prev = null;
            node.next = null;
            size--;
        }

        private Node removeLeastRecent() {
            Node leastRecent = tail.prev;
            remove(leastRecent);
            return leastRecent;
        }

        private boolean isEmpty() {
            return size == 0;
        }
    }
}`,
      },
    ],
    dryRun: {
      inputMD:
        "Capacity is **2**. Operations: **put(1,1)**, **put(2,2)**, **get(1)**, **put(3,3)**, **get(2)**, **get(3)**. Buckets list most recent first.",
      columns: ["operation", "return", "frequency buckets after operation", "minFreq", "eviction note"],
      rows: [
        ["put(1,1)", "null", "freq 1: 1", "1", "none"],
        ["put(2,2)", "null", "freq 1: 2 -> 1", "1", "none"],
        ["get(1)", "1", "freq 1: 2; freq 2: 1", "1", "key 1 promoted"],
        ["put(3,3)", "null", "freq 1: 3; freq 2: 1", "1", "evict key 2 from lowest-frequency bucket"],
        ["get(2)", "-1", "freq 1: 3; freq 2: 1", "1", "key 2 is absent"],
        ["get(3)", "3", "freq 2: 3 -> 1", "2", "key 3 promoted and freq 1 becomes empty"],
      ],
      narrativeMD:
        "The cache never scans all keys. Eviction reads **minFreq**, removes the tail-side node from that frequency's list, and updates the maps in constant time.",
    },
    complexityNote:
      "Strict LFU requires both frequency tracking and recency tracking. The two-map design keeps every lookup, promotion, insertion, and eviction O(1) on average.",
    interviewTipsMD:
      "Name the invariants before coding: every key maps to exactly one node, every node lives in exactly one frequency list, each frequency list is ordered by recency, and **minFreq** points to the lowest non-empty frequency. When explaining updates, say that **put** on an existing key counts as a use and must promote frequency. Mention capacity zero early because it prevents accidental eviction from an empty bucket.",
    followUps: [
      "How would you implement the same policy with Java **LinkedHashSet** per frequency bucket?",
      "How would you add time-to-live expiration while preserving fast eviction?",
      "How would you make this cache safe under concurrent get and put calls?",
      "How would you expose metrics such as hit rate, evictions, and current frequency distribution?",
    ],
    similarProblems: [
      {
        title: "Doubly Linked List",
        difficulty: "Easy",
        slug: "ll-doubly-linked-list",
        note: "LFU buckets depend on O(1) removal and insertion of known doubly linked nodes.",
      },
      {
        title: "Copy List with Random Pointer",
        difficulty: "Medium",
        slug: "ll-copy-list-with-random-pointer",
        note: "Both designs use hash maps that point to node objects rather than storing values alone.",
      },
      {
        title: "Flatten a Multilevel Doubly Linked List",
        difficulty: "Medium",
        slug: "ll-flatten-multilevel-doubly-linked-list",
        note: "Practices the prev and next pointer discipline used inside LFU frequency buckets.",
      },
      {
        title: "LRU Cache",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/lru-cache/",
        note: "The recency-only cache that becomes one bucket inside the LFU design.",
      },
      {
        title: "Design Twitter",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/design-twitter/",
        note: "Another system-style data-structure design problem combining maps and ordered retrieval.",
      },
    ],
    keyTakeaways: [
      "LFU eviction needs frequency first and recency as a tie-breaker.",
      "A key map gives direct node lookup; a frequency map groups nodes by usage count.",
      "Each frequency bucket is a doubly linked list ordered by recency for O(1) tie-breaking.",
      "The **minFreq** tracker is what prevents eviction from scanning all frequencies.",
    ],
    pattern:
      "Two-map cache design: map keys to nodes, map frequencies to recency lists, and update minFreq whenever the lowest bucket changes.",
  },
];
