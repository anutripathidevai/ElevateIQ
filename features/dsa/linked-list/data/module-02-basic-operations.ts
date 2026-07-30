import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "ll-reverse-linked-list",
    moduleId: "ll-basic-operations",
    order: 6,
    title: "Reverse Linked List",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/reverse-linked-list/",
    tags: ["Linked List", "Pointer Reversal", "Three Pointers", "Iteration", "Recursion"],
    companies: ["Microsoft", "Amazon", "Google", "Meta", "Apple"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 15,
    statementMD:
      "Given the **head** of a singly linked list, reverse the list and return the new head. The original links must be rewired so that **1 -> 2 -> 3 -> null** becomes **3 -> 2 -> 1 -> null**.",
    constraints: [
      "0 <= number of nodes <= 5000",
      "-5000 <= Node.val <= 5000",
    ],
    inputMD: "The **head** pointer of a singly linked list, or **null** for an empty list.",
    outputMD: "The head pointer of the reversed linked list.",
    examples: [
      {
        input: "head = **1 -> 2 -> 3 -> 4 -> 5 -> null**",
        output: "**5 -> 4 -> 3 -> 2 -> 1 -> null**",
        explanation: "Every next pointer is redirected to the previous node, so the tail **5** becomes the new head.",
      },
      {
        input: "head = **1 -> 2 -> null**",
        output: "**2 -> 1 -> null**",
        explanation: "The link **1 -> 2** is flipped into **2 -> 1**, and **1.next** becomes **null**.",
      },
      {
        input: "head = **null**",
        output: "**null**",
        explanation: "An empty list has no pointers to reverse, so the answer is still **null**.",
      },
    ],
    learningObjectives: [
      "Master the foundational **prev**, **curr**, and **next** pointer reversal move.",
      "Explain why saving the next node before rewiring prevents losing the rest of the list.",
      "Reason about the reversed prefix and unreversed suffix invariant during a linked-list traversal.",
      "Compare iterative reversal with the recursive call-stack version.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is any prompt that says **reverse a linked list** or asks you to flip node order in place. Arrays can swap values by index, but a singly linked list only moves forward, so the real task is pointer surgery: each node must stop pointing to its next node and start pointing to the node before it.\n\nThe pointer trap is losing access to the remaining suffix. If **curr** points at **2** in **1 -> 2 -> 3**, and you immediately set **curr.next = prev**, the old link to **3** is gone unless you saved it first. The safe template is always: save **next**, reverse **curr.next**, advance **prev**, advance **curr**.",
    commonMistakes: [
      "Reassigning **curr.next** before saving the old next node, which disconnects the rest of the list.",
      "Returning the original **head** instead of **prev**, even though the old head becomes the new tail.",
      "Forgetting to set the old head next pointer to **null**, which can create a cycle.",
      "Advancing **curr** before moving **prev** to the node that was just reversed.",
    ],
    algorithmMD:
      "**Key idea**\n\nMaintain two regions: a reversed prefix ending at **prev**, and an unreversed suffix beginning at **curr**. At each step, move **curr** from the front of the suffix to the front of the reversed prefix. When **curr** becomes **null**, **prev** is the new head.\n\n**Pointer walkthrough**\n\nStart with **1 -> 2 -> 3 -> null**. Initially **prev = null** and **curr = 1**. Save **next = 2**, then point **1.next** back to **null**. Now the reversed prefix is **1 -> null**, and the remaining suffix is **2 -> 3 -> null**. Advance **prev** to **1** and **curr** to **2**.\n\nAt **curr = 2**, save **next = 3** before touching links. Point **2.next** to **1**, producing the prefix **2 -> 1 -> null**, while **next** still remembers the suffix head **3**. Advance again. At **curr = 3**, save **next = null**, point **3.next** to **2**, and the prefix becomes **3 -> 2 -> 1 -> null**. The suffix is empty, so **prev = 3** is returned.\n\n**Algorithm**\n\n1. Set **prev = null** and **curr = head**.\n2. While **curr** is not **null**, save **next = curr.next**.\n3. Reverse the current link by setting **curr.next = prev**.\n4. Move **prev** forward to **curr**.\n5. Move **curr** forward to the saved **next** node.\n6. Return **prev** as the head of the reversed list.",
    solutions: [
      {
        name: "Iterative three-pointer reversal",
        whenToUseMD:
          "Use this in interviews by default. It is iterative, constant-space, and exposes the exact pointer invariant most linked-list problems reuse.",
        approachMD:
          "Sweep through the list once with **prev**, **curr**, and a saved **next** pointer. Each iteration removes **curr** from the unreversed suffix and prepends it to the reversed prefix.",
        walkthroughMD:
          "1. Initialise **prev** to **null** and **curr** to **head**.\n2. Save **curr.next** in **nextNode** before changing any links.\n3. Point **curr.next** backward to **prev**.\n4. Advance **prev** to **curr** and **curr** to **nextNode**.\n5. When the traversal finishes, return **prev** because it points at the old tail, now the new head.",
        complexity: { time: "O(n)", space: "O(1)", note: "Each node is visited once and only three pointers are stored." },
        filename: "Solution.java",
        code: `class ListNode {
    int val;
    ListNode next;

    ListNode(int x) {
        val = x;
    }
}

class Solution {

    public ListNode reverseList(ListNode head) {
        ListNode previous = null;
        ListNode current = head;

        while (current != null) {
            ListNode nextNode = current.next;
            current.next = previous;
            previous = current;
            current = nextNode;
        }

        return previous;
    }
}`,
      },
      {
        name: "Recursive reversal",
        whenToUseMD:
          "Use this when the interviewer asks for a recursive formulation or wants to discuss how the call stack reverses the suffix first. Prefer the iterative version when stack depth matters.",
        approachMD:
          "Recursively reverse the suffix starting at **head.next**, then attach **head** after that reversed suffix. The base case is an empty list or a single node, which is already reversed.",
        walkthroughMD:
          "1. If **head** is **null** or **head.next** is **null**, return **head**.\n2. Recursively reverse the list starting at **head.next** and keep the returned **newHead**.\n3. The node after **head** is now the tail of the reversed suffix, so set **head.next.next = head**.\n4. Set **head.next = null** so the old head becomes the new tail.\n5. Return **newHead** unchanged through the stack.",
        complexity: { time: "O(n)", space: "O(n)", note: "The same nodes are rewired once, but recursion uses one stack frame per node." },
        filename: "Solution.java",
        code: `class ListNode {
    int val;
    ListNode next;

    ListNode(int x) {
        val = x;
    }
}

class Solution {

    public ListNode reverseList(ListNode head) {
        if (head == null || head.next == null) {
            return head;
        }

        ListNode newHead = reverseList(head.next);
        head.next.next = head;
        head.next = null;
        return newHead;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "head = **1 -> 2 -> 3 -> null**. Track how each node moves from the unreversed suffix to the reversed prefix.",
      columns: ["step", "prev before", "curr", "saved next", "list after rewiring"],
      rows: [
        ["start", "null", "1", "not saved", "reversed prefix is empty; suffix is **1 -> 2 -> 3 -> null**"],
        ["1", "null", "1", "2", "**1 -> null** and remaining suffix **2 -> 3 -> null**"],
        ["2", "1", "2", "3", "**2 -> 1 -> null** and remaining suffix **3 -> null**"],
        ["3", "2", "3", "null", "**3 -> 2 -> 1 -> null** and remaining suffix is empty"],
      ],
      narrativeMD: "When **curr** becomes **null**, **prev** points to **3**, which is the new head of **3 -> 2 -> 1 -> null**.",
    },
    complexityNote:
      "The iterative solution is the canonical optimal version: O(n) time and O(1) extra space. The recursive version is elegant but spends O(n) stack space.",
    interviewTipsMD:
      "Name the invariant before coding: **prev** is the head of the reversed prefix, and **curr** is the head of the unreversed suffix. Then say the safety rule out loud: save **curr.next** before rewiring it. Many harder linked-list problems are just this move applied to a sublist, a pair, or a k-sized group.",
    followUps: [
      "How would you reverse only positions **left** through **right**?",
      "How would you reverse nodes in groups of **k**?",
      "How would you detect whether reversing created an accidental cycle during debugging?",
      "Can you write the same reversal recursively, and what stack-space tradeoff does it make?",
    ],
    similarProblems: [
      { title: "Reverse Linked List II", difficulty: "Medium", slug: "ll-reverse-linked-list-ii", note: "Applies the same reversal move inside a bounded sublist." },
      { title: "Reverse Nodes in k-Group", difficulty: "Hard", slug: "ll-reverse-nodes-in-k-group", note: "Repeats the reversal template on fixed-size groups." },
      { title: "Swap Nodes in Pairs", difficulty: "Medium", slug: "ll-swap-nodes-in-pairs", note: "A two-node version of local pointer rewiring." },
      { title: "Palindrome Linked List", difficulty: "Easy", url: "https://leetcode.com/problems/palindrome-linked-list/", note: "Often reverses the second half before comparing values." },
    ],
    keyTakeaways: [
      "The safe reversal order is save **next**, rewire **curr.next**, then advance **prev** and **curr**.",
      "The old head becomes the tail, so its next pointer must end as **null**.",
      "Returning **prev** is correct because it points at the last processed node after the loop.",
      "Sublist, pair, and group reversal problems build on this exact primitive.",
    ],
    pattern:
      "In-place pointer reversal: preserve the forward link, redirect the current node backward, then slide the reversed-prefix boundary forward.",
  },
  {
    kind: "problem",
    slug: "ll-middle-of-linked-list",
    moduleId: "ll-basic-operations",
    order: 7,
    title: "Middle of the Linked List",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/middle-of-the-linked-list/",
    tags: ["Linked List", "Two Pointers", "Fast Slow Pointer", "Traversal"],
    companies: ["Microsoft", "Amazon", "Google", "Meta", "Adobe"],
    estimatedReadingMin: 7,
    estimatedSolvingMin: 12,
    statementMD:
      "Given the **head** of a singly linked list, return the middle node. If the list has two middle nodes, return the second middle node.",
    constraints: [
      "1 <= number of nodes <= 100",
      "1 <= Node.val <= 100",
    ],
    inputMD: "The **head** pointer of a non-empty singly linked list.",
    outputMD: "The node that represents the middle of the list; for even length, return the second middle.",
    examples: [
      {
        input: "head = **1 -> 2 -> 3 -> 4 -> 5 -> null**",
        output: "Node with value **3**",
        explanation: "There are two nodes before **3** and two nodes after **3**, so **3** is the middle.",
      },
      {
        input: "head = **1 -> 2 -> 3 -> 4 -> 5 -> 6 -> null**",
        output: "Node with value **4**",
        explanation: "The two middle nodes are **3** and **4**. The problem convention returns the second middle, so the answer is **4**.",
      },
    ],
    learningObjectives: [
      "Recognise when a fast pointer moving twice as quickly can locate a midpoint in one pass.",
      "Explain why the standard loop condition returns the second middle for even-length lists.",
      "Avoid dereferencing **fast.next** before proving it exists.",
      "Connect middle finding to cycle detection, palindrome checks, and split-list problems.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is a question about the **middle**, **half**, or **split point** of a linked list when you do not have array indexing. A single pass with a counter works, but it usually needs either two passes or stored length. The linked-list pattern is fast and slow pointers: move **slow** one node at a time and **fast** two nodes at a time.\n\nThe pointer trap is the loop guard. You must only read **fast.next.next** after confirming **fast** and **fast.next** are not **null**. With the condition **fast != null && fast.next != null**, **slow** advances once for every two steps of **fast**. On even length, **fast** falls off the list exactly after **slow** steps onto the second middle.",
    commonMistakes: [
      "Using **while fast.next != null** and accidentally returning the first middle or throwing on short lists.",
      "Moving **fast** two steps without checking both **fast** and **fast.next**.",
      "Counting nodes in one pass and then forgetting the problem asks for the second middle on even length.",
      "Returning **fast** instead of **slow**, even though **fast** is only the pace-setting pointer.",
    ],
    algorithmMD:
      "**Key idea**\n\nUse relative speed instead of length. **slow** moves one edge per loop, **fast** moves two edges per loop. When **fast** reaches the end, **slow** has taken half as many steps and therefore sits at the middle. The standard guard naturally returns the second middle for even length.\n\n**Pointer walkthrough**\n\nFor **1 -> 2 -> 3 -> 4 -> 5 -> 6 -> null**, start both pointers at **1**. After one loop, **slow = 2** and **fast = 3**. After two loops, **slow = 3** and **fast = 5**. The guard still allows one more loop because **fast.next** is **6**. After the third loop, **slow = 4** and **fast = null**. The traversal stops and **4** is returned, which is the second middle.\n\nFor odd length **1 -> 2 -> 3 -> 4 -> 5 -> null**, the same loop stops when **fast = 5** because **fast.next** is **null**. At that moment **slow = 3**, the single middle.\n\n**Algorithm**\n\n1. Set both **slow** and **fast** to **head**.\n2. While **fast** is not **null** and **fast.next** is not **null**, advance **slow** by one node.\n3. In the same loop, advance **fast** by two nodes.\n4. When the loop stops, return **slow**.",
    solutions: [
      {
        name: "Fast and slow pointers",
        approachMD:
          "Move **fast** twice as quickly as **slow**. The distance covered by **fast** proves that **slow** has crossed exactly half the list when the traversal ends.",
        walkthroughMD:
          "1. Place **slow** and **fast** at **head**.\n2. Continue while **fast** and **fast.next** both exist.\n3. Move **slow** to **slow.next**.\n4. Move **fast** to **fast.next.next**.\n5. Return **slow**, which is the middle node under the second-middle convention.",
        complexity: { time: "O(n)", space: "O(1)", note: "The list is scanned once and only two pointers are stored." },
        filename: "Solution.java",
        code: `class ListNode {
    int val;
    ListNode next;

    ListNode(int x) {
        val = x;
    }
}

class Solution {

    public ListNode middleNode(ListNode head) {
        ListNode slow = head;
        ListNode fast = head;

        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }

        return slow;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "head = **1 -> 2 -> 3 -> 4 -> 5 -> 6 -> null**. The expected answer is the second middle, node **4**.",
      columns: ["iteration", "slow before", "fast before", "slow after", "fast after"],
      rows: [
        ["start", "1", "1", "1", "1"],
        ["1", "1", "1", "2", "3"],
        ["2", "2", "3", "3", "5"],
        ["3", "3", "5", "4", "null"],
      ],
      narrativeMD: "The loop stops because **fast** is **null**. **slow** is at **4**, so the algorithm returns the second middle node for the even-length list.",
    },
    complexityNote:
      "Fast and slow pointers give the desired node in one pass with constant extra space, avoiding a separate length calculation.",
    interviewTipsMD:
      "State the even-length convention before coding. With both pointers starting at **head** and the guard **fast != null && fast.next != null**, the method returns the second middle. If an interviewer wanted the first middle, you would adjust the stopping condition or initial fast position.",
    followUps: [
      "How would you return the first middle instead of the second middle?",
      "How would you split the list into two halves for merge sort?",
      "How does this template change when detecting a cycle?",
      "How would you find the node one-third of the way through a linked list?",
    ],
    similarProblems: [
      { title: "Linked List Cycle", difficulty: "Easy", slug: "ll-linked-list-cycle", note: "Uses the same fast and slow pointer speeds for cycle detection." },
      { title: "Linked List Cycle II", difficulty: "Medium", slug: "ll-linked-list-cycle-ii", note: "Builds on the meeting point created by fast and slow traversal." },
      { title: "Happy Number", difficulty: "Easy", slug: "ll-happy-number", note: "Applies fast and slow cycle detection to a generated sequence." },
      { title: "Find the Duplicate Number", difficulty: "Medium", slug: "ll-find-duplicate-number", note: "Models array values as next pointers and uses Floyd-style movement." },
      { title: "Remove Nth Node From End of List", difficulty: "Medium", url: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/", note: "Another linked-list problem solved by maintaining a controlled pointer gap." },
    ],
    keyTakeaways: [
      "Fast and slow pointers replace random access when a linked-list midpoint is needed.",
      "The guard **fast != null && fast.next != null** is both a safety check and a convention choice.",
      "For even length, this setup returns the second middle node.",
      "Middle-finding is a setup step for split, palindrome, and merge-sort problems.",
    ],
    pattern:
      "Fast-slow midpoint: advance one pointer twice as fast as the other until the fast pointer reaches the end, then use the slow pointer as the midpoint.",
  },
  {
    kind: "problem",
    slug: "ll-merge-two-sorted-lists",
    moduleId: "ll-basic-operations",
    order: 8,
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/merge-two-sorted-lists/",
    tags: ["Linked List", "Merge", "Dummy Node", "Recursion", "Sorting"],
    companies: ["Microsoft", "Amazon", "Google", "Meta", "Oracle"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 18,
    statementMD:
      "You are given the heads of two sorted linked lists **list1** and **list2**. Merge them into one sorted linked list by splicing together existing nodes, and return the head of the merged list.",
    constraints: [
      "0 <= number of nodes in each list <= 50",
      "-100 <= Node.val <= 100",
      "Both input lists are sorted in non-decreasing order",
    ],
    inputMD: "Two head pointers, **list1** and **list2**, each representing a sorted singly linked list.",
    outputMD: "The head pointer of one sorted linked list containing all nodes from both inputs.",
    examples: [
      {
        input: "list1 = **1 -> 2 -> 4 -> null**, list2 = **1 -> 3 -> 4 -> null**",
        output: "**1 -> 1 -> 2 -> 3 -> 4 -> 4 -> null**",
        explanation: "Repeatedly taking the smaller front node preserves sorted order and includes both **1** values and both **4** values.",
      },
      {
        input: "list1 = **null**, list2 = **0 -> null**",
        output: "**0 -> null**",
        explanation: "When one list is empty, the merged list is simply the other list.",
      },
    ],
    learningObjectives: [
      "Use a dummy head to remove special handling for the first merged node.",
      "Maintain a **tail** pointer that always marks where the next chosen node should be attached.",
      "Explain why attaching the remaining suffix is safe once one list is exhausted.",
      "Compare iterative splicing with the recursive merge formulation.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is **merge two sorted linked lists** or any task where two sorted streams must be combined while preserving order. Since the smallest remaining value must be at the head of one of the lists, each step compares only **list1.val** and **list2.val**.\n\nThe pointer trap is mishandling the first node of the result. Without a dummy node, you need separate logic for an empty merged list versus later appends. A dummy head gives **tail** a stable starting point. You attach the smaller node to **tail.next**, advance that source list, and move **tail** forward. Another trap is creating unnecessary new nodes; the expected linked-list solution splices existing nodes.",
    commonMistakes: [
      "Writing special-case code for the first node instead of using a dummy head.",
      "Advancing **tail** before attaching **tail.next**, which can lose the merged chain.",
      "Forgetting to attach the non-empty remainder after the main comparison loop.",
      "Allocating new nodes when the problem expects existing nodes to be rewired.",
    ],
    algorithmMD:
      "**Key idea**\n\nKeep a dummy node before the merged list and a **tail** pointer at the last merged node. The invariant is that **dummy.next -> ... -> tail** is sorted, and **list1** plus **list2** contain the remaining unmerged nodes. Append the smaller front node and advance only the list it came from.\n\n**Pointer walkthrough**\n\nFor **list1 = 1 -> 2 -> 4 -> null** and **list2 = 1 -> 3 -> 4 -> null**, begin with **dummy -> null** and **tail = dummy**. Compare the two heads, both **1**. Choose the first list on ties, so **dummy -> 1** and **list1** moves to **2**. Now compare **2** and **1**. Attach the **1** from **list2**, so the merged prefix is **dummy -> 1 -> 1** and **list2** moves to **3**.\n\nNext compare **2** and **3**, attach **2** and move **list1** to **4**. Compare **4** and **3**, attach **3** and move **list2** to **4**. Compare **4** and **4**, attach the **4** from **list1**. Now **list1** is empty, so attach the remaining **4 -> null** from **list2** directly after **tail**. Return **dummy.next**, which skips the placeholder.\n\n**Algorithm**\n\n1. Create **dummy** and set **tail = dummy**.\n2. While both **list1** and **list2** are not **null**, compare their values.\n3. Attach the smaller head node to **tail.next** and advance that source list.\n4. Move **tail** to **tail.next** after each attachment.\n5. When one list becomes empty, set **tail.next** to the other list.\n6. Return **dummy.next**.",
    solutions: [
      {
        name: "Dummy head with tail splicing",
        whenToUseMD:
          "Use this as the default interview solution. It is iterative, stable on equal values when you choose **list1** first, and uses constant extra space.",
        approachMD:
          "Build the merged list behind a dummy head. At each step, splice the smaller current node after **tail**, advance that input pointer, then advance **tail**. After the loop, attach the remaining suffix in one operation.",
        walkthroughMD:
          "1. Create a dummy node and set **tail** to it.\n2. While both input lists have nodes, compare **list1.val** and **list2.val**.\n3. Link **tail.next** to the smaller node.\n4. Advance the list pointer that supplied the node.\n5. Advance **tail** to the node just attached.\n6. Attach the remaining non-empty list and return **dummy.next**.",
        complexity: { time: "O(m + n)", space: "O(1)", note: "Every node is appended once, and the algorithm stores only a dummy and a tail pointer." },
        filename: "Solution.java",
        code: `class ListNode {
    int val;
    ListNode next;

    ListNode(int x) {
        val = x;
    }
}

class Solution {

    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        ListNode dummy = new ListNode(0);
        ListNode tail = dummy;

        while (list1 != null && list2 != null) {
            if (list1.val <= list2.val) {
                tail.next = list1;
                list1 = list1.next;
            } else {
                tail.next = list2;
                list2 = list2.next;
            }

            tail = tail.next;
        }

        if (list1 != null) {
            tail.next = list1;
        } else {
            tail.next = list2;
        }

        return dummy.next;
    }
}`,
      },
      {
        name: "Recursive sorted merge",
        whenToUseMD:
          "Use this when the interviewer wants the shortest recursive expression of the merge relation. Avoid it for extremely long lists because recursion uses stack space.",
        approachMD:
          "Choose the smaller head as the head of the merged result, then recursively merge its next pointer with the other list. The base case returns the non-empty list when the other one is exhausted.",
        walkthroughMD:
          "1. If **list1** is **null**, return **list2**.\n2. If **list2** is **null**, return **list1**.\n3. If **list1.val <= list2.val**, set **list1.next** to the merge of **list1.next** and **list2**, then return **list1**.\n4. Otherwise set **list2.next** to the merge of **list1** and **list2.next**, then return **list2**.",
        complexity: { time: "O(m + n)", space: "O(m + n)", note: "Each node participates in one recursive decision, and the call stack can grow to the merged length." },
        filename: "Solution.java",
        code: `class ListNode {
    int val;
    ListNode next;

    ListNode(int x) {
        val = x;
    }
}

class Solution {

    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        if (list1 == null) {
            return list2;
        }
        if (list2 == null) {
            return list1;
        }

        if (list1.val <= list2.val) {
            list1.next = mergeTwoLists(list1.next, list2);
            return list1;
        }

        list2.next = mergeTwoLists(list1, list2.next);
        return list2;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "list1 = **1 -> 2 -> 4 -> null**, list2 = **1 -> 3 -> 4 -> null**. Track the merged prefix after each splice.",
      columns: ["step", "list1 head", "list2 head", "node attached", "merged prefix"],
      rows: [
        ["start", "1", "1", "none", "**dummy -> null**"],
        ["1", "1", "1", "1 from list1", "**dummy -> 1**"],
        ["2", "2", "1", "1 from list2", "**dummy -> 1 -> 1**"],
        ["3", "2", "3", "2 from list1", "**dummy -> 1 -> 1 -> 2**"],
        ["4", "4", "3", "3 from list2", "**dummy -> 1 -> 1 -> 2 -> 3**"],
        ["5", "4", "4", "4 from list1", "**dummy -> 1 -> 1 -> 2 -> 3 -> 4**"],
        ["attach remainder", "null", "4", "remaining list2", "**dummy -> 1 -> 1 -> 2 -> 3 -> 4 -> 4 -> null**"],
      ],
      narrativeMD: "The dummy node is not part of the answer. Returning **dummy.next** yields **1 -> 1 -> 2 -> 3 -> 4 -> 4 -> null**.",
    },
    complexityNote:
      "The iterative dummy-head merge is optimal for interviews: linear in the total number of nodes and constant extra space.",
    interviewTipsMD:
      "Emphasise that **tail** always points to the last node in the merged prefix. Once one input list is empty, the other list is already sorted, so there is no reason to keep comparing or copying nodes. If asked about stability, choosing **list1** when values are equal preserves the relative order of equal nodes from the first list before equal nodes from the second.",
    followUps: [
      "How would you merge **k** sorted linked lists?",
      "How would you sort one unsorted linked list using merge sort?",
      "What changes if the merged list must allocate brand-new nodes instead of reusing existing ones?",
      "How would you merge lists in descending order?",
    ],
    similarProblems: [
      { title: "Merge k Sorted Lists", difficulty: "Hard", slug: "ll-merge-k-sorted-lists", note: "Generalises the two-list merge using a heap or divide and conquer." },
      { title: "Sort List", difficulty: "Medium", slug: "ll-sort-list", note: "Uses middle splitting and the same merge primitive." },
      { title: "Partition List", difficulty: "Medium", slug: "ll-partition-list", note: "Also builds linked-list chains with dummy heads and tails." },
      { title: "Add Two Numbers", difficulty: "Medium", url: "https://leetcode.com/problems/add-two-numbers/", note: "Another two-list traversal that appends nodes behind a moving tail." },
    ],
    keyTakeaways: [
      "A dummy head turns first-node insertion into the same operation as every later insertion.",
      "The **tail** pointer marks the end of the merged prefix and moves after each splice.",
      "After one list ends, the remaining suffix can be attached directly.",
      "Merging sorted lists is the core primitive behind linked-list merge sort and k-way merge.",
    ],
    pattern:
      "Dummy-tail merge: keep a placeholder before the answer, repeatedly splice the smaller front node after tail, then append the leftover sorted suffix.",
  },
  {
    kind: "problem",
    slug: "ll-remove-linked-list-elements",
    moduleId: "ll-basic-operations",
    order: 9,
    title: "Remove Linked List Elements",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/remove-linked-list-elements/",
    tags: ["Linked List", "Dummy Node", "Deletion", "Traversal"],
    companies: ["Microsoft", "Amazon", "Google", "Apple", "Adobe"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 15,
    statementMD:
      "Given the **head** of a linked list and an integer **val**, remove every node whose value equals **val** and return the new head of the list.",
    constraints: [
      "0 <= number of nodes <= 10000",
      "1 <= Node.val <= 50",
      "0 <= val <= 50",
    ],
    inputMD: "The **head** pointer of a singly linked list and an integer **val** to remove.",
    outputMD: "The head pointer of the list after all nodes with value **val** have been removed.",
    examples: [
      {
        input: "head = **1 -> 2 -> 6 -> 3 -> 4 -> 5 -> 6 -> null**, val = 6",
        output: "**1 -> 2 -> 3 -> 4 -> 5 -> null**",
        explanation: "Both nodes with value **6** are skipped while all other nodes keep their original order.",
      },
      {
        input: "head = **7 -> 7 -> 7 -> 7 -> null**, val = 7",
        output: "**null**",
        explanation: "Every node matches **val**, including the original head, so the returned list is empty.",
      },
      {
        input: "head = **1 -> 2 -> 3 -> null**, val = 4",
        output: "**1 -> 2 -> 3 -> null**",
        explanation: "No node has value **4**, so no links are changed.",
      },
    ],
    learningObjectives: [
      "Use a dummy head to make deleting the original head identical to deleting an interior node.",
      "Maintain **prev** as the last kept node and **curr** as the node being inspected.",
      "Explain why **prev** should not advance when **curr** is deleted.",
      "Preserve the relative order of all nodes that are not removed.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is **remove nodes** from a singly linked list, especially when the removable node might be the head. Deleting a node requires changing the previous node next pointer, but the original head has no previous node. A dummy head creates a safe previous node before the real list.\n\nThe pointer trap is advancing **prev** after a deletion. If **curr** is removed, **prev.next** has been redirected to the next candidate, so **prev** must stay where it is. This is what correctly removes consecutive matches such as **7 -> 7 -> 7**. Advance **prev** only when **curr** is kept.",
    commonMistakes: [
      "Handling head deletions with repeated special cases instead of using a dummy node.",
      "Advancing **prev** after deleting **curr**, which skips over consecutive nodes that should also be removed.",
      "Returning the original **head** even though the first one or more nodes may have been deleted.",
      "Changing **curr.next** without first using **prev.next** to bypass the node from the kept chain.",
    ],
    algorithmMD:
      "**Key idea**\n\nPlace **dummy** before **head** so every deletion has a previous node. Keep **prev** at the last node known to remain in the answer and **curr** at the node under inspection. If **curr.val** matches **val**, bypass it with **prev.next = curr.next**. Otherwise, move **prev** forward to **curr**.\n\n**Pointer walkthrough**\n\nFor **dummy -> 1 -> 2 -> 6 -> 6 -> 3 -> null** with **val = 6**, start **prev = dummy** and **curr = 1**. Since **1** stays, move both pointers forward so **prev = 1** and **curr = 2**. **2** also stays, so **prev = 2** and **curr = 6**.\n\nNow **curr** matches. Set **prev.next** from the first **6** to the second **6**, producing **dummy -> 1 -> 2 -> 6 -> 3 -> null**. Do not move **prev**; it must remain at **2** because the new **prev.next** may also need deletion. Inspect the second **6**, match again, and set **prev.next = 3**. Only when **curr = 3** is kept does **prev** move to **3**. Return **dummy.next** to handle head removals correctly.\n\n**Algorithm**\n\n1. Create **dummy** and set **dummy.next = head**.\n2. Set **prev = dummy** and **curr = head**.\n3. While **curr** is not **null**, compare **curr.val** with **val**.\n4. If they match, bypass **curr** by setting **prev.next = curr.next**.\n5. If they do not match, advance **prev** to **curr**.\n6. In both cases, advance **curr** to the next node to inspect.\n7. Return **dummy.next** as the possibly new head.",
    solutions: [
      {
        name: "Dummy head with prev and curr",
        approachMD:
          "Use a dummy node before the list so removing the head uses the same bypass operation as removing any other node. **prev** tracks the last kept node, while **curr** scans candidates.",
        walkthroughMD:
          "1. Create **dummy** and link it to **head**.\n2. Set **previous** to **dummy** and **current** to **head**.\n3. If **current.val** equals **val**, set **previous.next** to **current.next** and keep **previous** in place.\n4. Otherwise move **previous** to **current** because the node is kept.\n5. Move **current** to **current.next** and repeat.\n6. Return **dummy.next** after the traversal.",
        complexity: { time: "O(n)", space: "O(1)", note: "Each node is inspected once, and only a dummy plus two pointers are stored." },
        filename: "Solution.java",
        code: `class ListNode {
    int val;
    ListNode next;

    ListNode(int x) {
        val = x;
    }
}

class Solution {

    public ListNode removeElements(ListNode head, int val) {
        ListNode dummy = new ListNode(0);
        dummy.next = head;

        ListNode previous = dummy;
        ListNode current = head;

        while (current != null) {
            if (current.val == val) {
                previous.next = current.next;
            } else {
                previous = current;
            }

            current = current.next;
        }

        return dummy.next;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "head = **1 -> 2 -> 6 -> 6 -> 3 -> null**, val = 6. Consecutive removals show why **prev** must stay still after deletion.",
      columns: ["step", "prev", "curr", "action", "list from dummy"],
      rows: [
        ["start", "dummy", "1", "initialise", "**dummy -> 1 -> 2 -> 6 -> 6 -> 3 -> null**"],
        ["1", "dummy", "1", "keep 1, move prev", "**dummy -> 1 -> 2 -> 6 -> 6 -> 3 -> null**"],
        ["2", "1", "2", "keep 2, move prev", "**dummy -> 1 -> 2 -> 6 -> 6 -> 3 -> null**"],
        ["3", "2", "6", "delete first 6, prev stays", "**dummy -> 1 -> 2 -> 6 -> 3 -> null**"],
        ["4", "2", "6", "delete second 6, prev stays", "**dummy -> 1 -> 2 -> 3 -> null**"],
        ["5", "2", "3", "keep 3, move prev", "**dummy -> 1 -> 2 -> 3 -> null**"],
      ],
      narrativeMD: "Returning **dummy.next** gives **1 -> 2 -> 3 -> null**. The same return would also work if the original head had been removed.",
    },
    complexityNote:
      "The dummy-node traversal is the optimal single-pass deletion pattern with constant extra space.",
    interviewTipsMD:
      "Lead with the dummy node. It shows you understand that head removal should not be a special case. Then be precise about the invariant: **prev** always points to the last kept node. When **curr** is deleted, **prev** does not move because its new next node still has not been inspected.",
    followUps: [
      "How would you remove the nth node from the end in one pass?",
      "How would you remove duplicates from a sorted linked list?",
      "How would you partition a list around a value while preserving relative order?",
      "How would deletion change in a doubly linked list?",
    ],
    similarProblems: [
      { title: "Partition List", difficulty: "Medium", slug: "ll-partition-list", note: "Uses dummy heads to build kept chains based on a value test." },
      { title: "Merge Two Sorted Lists", difficulty: "Easy", slug: "ll-merge-two-sorted-lists", note: "Also relies on a dummy node to simplify head management." },
      { title: "Remove Nth Node From End of List", difficulty: "Medium", url: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/", note: "Another deletion problem where a dummy head avoids head-edge cases." },
      { title: "Delete Node in a Linked List", difficulty: "Medium", url: "https://leetcode.com/problems/delete-node-in-a-linked-list/", note: "Contrasts deletion when you are given the node itself instead of the head." },
    ],
    keyTakeaways: [
      "A dummy head makes deleting the original head look like deleting any interior node.",
      "**prev** means last kept node, not simply the node before the traversal cursor in time.",
      "After deleting **curr**, keep **prev** fixed so consecutive matches are not skipped.",
      "Return **dummy.next** because the real head may have changed.",
    ],
    pattern:
      "Dummy-node deletion: anchor a fake predecessor before head, keep prev on the last retained node, bypass matches, and return dummy.next.",
  },
];
