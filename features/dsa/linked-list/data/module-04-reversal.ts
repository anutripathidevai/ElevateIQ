import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "ll-reverse-linked-list-ii",
    moduleId: "ll-reversal",
    order: 14,
    title: "Reverse Linked List II",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/reverse-linked-list-ii/",
    tags: ["Linked List", "In-Place Reversal", "Dummy Node", "Pointer Manipulation", "One Pass"],
    companies: ["Amazon", "Microsoft", "Google", "Meta", "Bloomberg"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 20,
    statementMD:
      "Given the **head** of a singly linked list and two positions **left** and **right**, reverse the nodes from position **left** through position **right** in place and return the modified list. Positions are 1-indexed, and the rest of the list must keep its original order.",
    constraints: [
      "The number of nodes is n",
      "1 <= n <= 500",
      "-500 <= Node.val <= 500",
      "1 <= left <= right <= n",
    ],
    inputMD: "The head of a singly linked list and two 1-indexed positions **left** and **right**.",
    outputMD: "The head of the same list after reversing only the segment from **left** to **right**.",
    examples: [
      {
        input: "head = 1 -> 2 -> 3 -> 4 -> 5, left = 2, right = 4",
        output: "1 -> 4 -> 3 -> 2 -> 5",
        explanation: "Only the segment **2 -> 3 -> 4** is reversed. The node before the segment stays connected to **4**, and the old segment head **2** reconnects to **5**.",
      },
      {
        input: "head = 1 -> 2 -> 3, left = 1, right = 2",
        output: "2 -> 1 -> 3",
        explanation: "The segment begins at the head, so the dummy node protects the new head while **1 -> 2** is reversed to **2 -> 1**.",
      },
    ],
    learningObjectives: [
      "Recognise sublist reversal as a boundary-reconnection problem, not just a full-list reversal.",
      "Use a dummy head to make reversing from position 1 behave like every other case.",
      "Apply head insertion to reverse a fixed segment in one pass.",
      "Track the node before the segment and the original segment head so both boundaries reconnect correctly.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is a request to reverse only a contiguous part of a linked list. That means the hard part is not reversing pointers inside the segment; it is preserving the two outside boundaries. You need the node before **left** so the reversed segment can be attached back to the prefix, and you need the original **left** node because it becomes the tail of the reversed segment and must point to the suffix after **right**.\n\nA dummy head removes the special case where **left = 1**. Once **beforeSublist** is positioned before **left**, the clean one-pass trick is head insertion: repeatedly detach the node immediately after **sublistTail** and insert it right after **beforeSublist**. Each insertion grows the reversed prefix of the segment while **sublistTail** remains the tail and keeps the suffix reachable.",
    commonMistakes: [
      "Starting reversal at **left** without saving the node before it, which makes it impossible to attach the reversed segment to the prefix cleanly.",
      "Advancing **sublistTail** during head insertion; the original left node should stay as the segment tail.",
      "Forgetting to reconnect the segment tail to the node after **right**, which drops the suffix.",
      "Handling **left = 1** with separate fragile logic instead of using a dummy head.",
    ],
    algorithmMD:
      "**Key idea**\n\nKeep **beforeSublist** on the node before position **left** and keep **sublistTail** on the original **left** node. Then repeat **right - left** times: take the node after **sublistTail** and insert it immediately after **beforeSublist**. This reverses the segment by front-loading nodes while the prefix and suffix remain reachable.\n\n**Pointer walkthrough**\n\nFor **head = 1 -> 2 -> 3 -> 4 -> 5**, **left = 2**, and **right = 4**, start with **dummy -> 1 -> 2 -> 3 -> 4 -> 5**. Move **beforeSublist** to **1**, so **sublistTail** is **2** and **nodeToMove** is **3**. Detach **3** from after **2** and insert it after **1**, producing **dummy -> 1 -> 3 -> 2 -> 4 -> 5**. Now **nodeToMove** is **4**. Detach **4** and insert it after **1**, producing **dummy -> 1 -> 4 -> 3 -> 2 -> 5**. The left boundary **1** points to the new segment head **4**, and the segment tail **2** still points to the suffix **5**.\n\n**Algorithm**\n\n1. Create **dummy** and set **dummy.next** to **head**.\n2. Walk **beforeSublist** from **dummy** until it is immediately before position **left**.\n3. Set **sublistTail = beforeSublist.next** and **nodeToMove = sublistTail.next**.\n4. Repeat **right - left** times: detach **nodeToMove**, insert it after **beforeSublist**, and advance **nodeToMove** to **sublistTail.next**.\n5. Return **dummy.next** as the possibly new head.",
    solutions: [
      {
        name: "One-pass head insertion inside the sublist",
        approachMD:
          "Use a dummy head, walk to the node before the reversal window, then perform local head insertions within that window. Because each node is moved directly behind the left boundary, the segment reverses without needing an extra pass or an auxiliary stack.",
        walkthroughMD:
          "1. Return early when **left** and **right** are the same because no pointer needs to change.\n2. Create **dummy** so the list has a stable node before the real head.\n3. Move **beforeSublist** exactly **left - 1** times so it lands before the segment.\n4. Keep **sublistTail** on the original first node of the segment.\n5. For each remaining node in the segment, detach it from after **sublistTail** and insert it after **beforeSublist**.\n6. Return **dummy.next** after all boundary pointers have been updated.",
        complexity: { time: "O(n)", space: "O(1)", note: "The pointer walk and the in-place reversals touch each relevant node at most once while using a constant number of references." },
        filename: "Solution.java",
        code: `class ListNode {
    int val;
    ListNode next;

    ListNode(int x) {
        val = x;
    }
}

class Solution {

    public ListNode reverseBetween(ListNode head, int left, int right) {
        if (left == right) {
            return head;
        }

        ListNode dummy = new ListNode(0);
        dummy.next = head;
        ListNode beforeSublist = dummy;

        for (int position = 1; position < left; position++) {
            beforeSublist = beforeSublist.next;
        }

        ListNode sublistTail = beforeSublist.next;
        ListNode nodeToMove = sublistTail.next;

        for (int move = 0; move < right - left; move++) {
            sublistTail.next = nodeToMove.next;
            nodeToMove.next = beforeSublist.next;
            beforeSublist.next = nodeToMove;
            nodeToMove = sublistTail.next;
        }

        return dummy.next;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "head = 1 -> 2 -> 3 -> 4 -> 5, left = 2, right = 4. Track the head-insertion moves after **beforeSublist** reaches node **1**.",
      columns: ["move", "beforeSublist", "sublistTail", "node moved", "list state", "boundary note"],
      rows: [
        ["initial", "1", "2", "none", "dummy -> 1 -> 2 -> 3 -> 4 -> 5", "ready to move 3 after 1"],
        ["1", "1", "2", "3", "dummy -> 1 -> 3 -> 2 -> 4 -> 5", "2 remains tail and points to 4"],
        ["2", "1", "2", "4", "dummy -> 1 -> 4 -> 3 -> 2 -> 5", "2 reconnects to suffix 5"],
      ],
      narrativeMD: "After **right - left = 2** moves, the reversed segment is **4 -> 3 -> 2**. Returning **dummy.next** gives **1 -> 4 -> 3 -> 2 -> 5**.",
    },
    complexityNote:
      "The optimal solution is one pass over the list with constant extra space; the dummy node and head insertion remove special-case pointer logic.",
    interviewTipsMD:
      "Name the two boundary pointers before writing code: **beforeSublist** and **sublistTail**. Interviewers watch whether you can reverse the middle without losing the suffix. Explain that **sublistTail** is intentionally not advanced during head insertion because it becomes the tail of the reversed segment.",
    followUps: [
      "How would you reverse several disjoint ranges in the same list?",
      "How would this change for a doubly linked list where **prev** pointers must also be fixed?",
      "Can you solve it recursively, and what stack space would that use?",
      "How would you validate **left** and **right** if the input positions were not guaranteed to be valid?",
    ],
    similarProblems: [
      { title: "Reverse Linked List", difficulty: "Easy", slug: "ll-reverse-linked-list", note: "The full-list version of the same pointer reversal idea." },
      { title: "Reverse Nodes in k-Group", difficulty: "Hard", slug: "ll-reverse-nodes-in-k-group", note: "Repeats bounded segment reversal across the whole list." },
      { title: "Swap Nodes in Pairs", difficulty: "Medium", slug: "ll-swap-nodes-in-pairs", note: "A fixed two-node segment reversal pattern." },
      { title: "Reorder List", difficulty: "Medium", url: "https://leetcode.com/problems/reorder-list/", note: "Combines midpoint search, reversal, and careful boundary weaving." },
    ],
    keyTakeaways: [
      "Sublist reversal is primarily a boundary-management problem.",
      "A dummy head makes reversal from the real head identical to reversal from the middle.",
      "Head insertion reverses a bounded segment while keeping the suffix reachable through the original segment head.",
      "The original **left** node becomes the tail of the reversed segment and must reconnect to the node after **right**.",
    ],
    pattern:
      "Bounded in-place reversal: anchor the node before the segment, keep the original segment head as the tail, move following nodes to the front, and return through a dummy head.",
  },
  {
    kind: "problem",
    slug: "ll-reverse-nodes-in-k-group",
    moduleId: "ll-reversal",
    order: 15,
    title: "Reverse Nodes in k-Group",
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/reverse-nodes-in-k-group/",
    tags: ["Linked List", "In-Place Reversal", "Dummy Node", "Pointer Manipulation", "Group Processing"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple", "Bloomberg"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 30,
    statementMD:
      "Given the **head** of a singly linked list, reverse the nodes of the list **k** at a time and return the modified list. Nodes must be reversed in place by changing links, not by changing values. If the remaining number of nodes is less than **k**, leave those trailing nodes in their original order.",
    constraints: [
      "The number of nodes is n",
      "1 <= k <= n <= 5000",
      "0 <= Node.val <= 1000",
    ],
    inputMD: "The head of a singly linked list and an integer **k**, the required group size.",
    outputMD: "The head of the list after every complete group of **k** nodes has been reversed and any shorter trailing group has been left unchanged.",
    examples: [
      {
        input: "head = 1 -> 2 -> 3 -> 4 -> 5, k = 2",
        output: "2 -> 1 -> 4 -> 3 -> 5",
        explanation: "The complete groups are **1 -> 2** and **3 -> 4**. Each group is reversed, while the trailing **5** is shorter than **k** and stays as-is.",
      },
      {
        input: "head = 1 -> 2 -> 3 -> 4 -> 5, k = 3",
        output: "3 -> 2 -> 1 -> 4 -> 5",
        explanation: "Only the first three nodes form a complete group. The remaining **4 -> 5** has fewer than three nodes, so it is not reversed.",
      },
    ],
    learningObjectives: [
      "Detect whether a complete group of **k** nodes exists before reversing it.",
      "Reverse one bounded group while preserving the pointer to the next group.",
      "Relink the previous group, reversed group, and next group without losing nodes.",
      "Use **groupPrev**, **kth**, and **groupNext** as stable names for group boundaries.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is repeated fixed-size segment reversal. Unlike Reverse Linked List II, the segment boundaries are not given by one pair of positions; you must discover each complete block of **k** nodes, reverse exactly that block, then advance to the next block. The trailing remainder rule is important: if fewer than **k** nodes remain, those nodes are not touched.\n\nThe pointer trap is losing the next group while reversing the current group. Before changing any links, find the **kth** node and save **groupNext = kth.next**. During reversal, seed **previous** with **groupNext** so the old group head will point to the next group when it becomes the tail. After reversal, connect **groupPrev.next** to the old **kth** node and move **groupPrev** to the old group head.",
    commonMistakes: [
      "Reversing a final partial group even though the problem says it must remain unchanged.",
      "Not saving **groupNext** before rewiring, which can disconnect the rest of the list.",
      "Moving **groupPrev** to the wrong node after a group; it must become the old group head, now the tail.",
      "Trying to reverse by swapping values, which violates the pointer-focused intent of the problem.",
    ],
    algorithmMD:
      "**Key idea**\n\nTreat each complete group as a closed interval from **groupPrev.next** through **kth**, with **groupNext** saved as the first node after the interval. Reverse nodes until **current** reaches **groupNext**, then splice the reversed group between **groupPrev** and **groupNext**. The old group head becomes the tail and the next **groupPrev**.\n\n**Pointer walkthrough**\n\nFor **head = 1 -> 2 -> 3 -> 4 -> 5** and **k = 2**, start with **dummy -> 1 -> 2 -> 3 -> 4 -> 5** and **groupPrev = dummy**. The first **kth** node is **2**, so **groupNext** is **3**. Reverse from **1** up to but not including **3**, seeding **previous** as **3**. The group becomes **2 -> 1 -> 3**, then **groupPrev.next** is set to **2** and **groupPrev** moves to **1**. For the next group, **kth** is **4** and **groupNext** is **5**. Reverse **3 -> 4** into **4 -> 3**, connect **1 -> 4**, and move **groupPrev** to **3**. Only **5** remains, so no complete group exists and it stays attached.\n\n**Algorithm**\n\n1. Create **dummy** and set **dummy.next** to **head**.\n2. Keep **groupPrev** as the node before the next group to consider.\n3. Find the **kth** node after **groupPrev**. If it does not exist, stop and return **dummy.next**.\n4. Save **groupNext = kth.next** and reverse nodes from **groupPrev.next** until **groupNext** is reached.\n5. Save the old group head as **groupTail**, connect **groupPrev.next** to **kth**, then move **groupPrev** to **groupTail**.\n6. Repeat until fewer than **k** nodes remain.",
    solutions: [
      {
        name: "Iterative group reversal with saved boundaries",
        whenToUseMD:
          "Use this version in interviews when the requirement is O(1) extra space and the interviewer wants explicit pointer bookkeeping. It avoids recursion stack space and makes the incomplete trailing group rule easy to enforce.",
        approachMD:
          "Before each reversal, scan exactly **k** nodes from **groupPrev** to confirm a complete group and identify **kth**. Save **groupNext**, reverse the group with the standard previous-current loop, then reconnect the previous group to the new group head and advance to the new tail.",
        walkthroughMD:
          "1. Create **dummy** and initialise **groupPrev** to it.\n2. Call a helper to find the **kth** node after **groupPrev**.\n3. If no such node exists, the remaining nodes are fewer than **k**, so stop.\n4. Save **groupNext = kth.next** and reverse the current group by pointing each node back toward **previous**, which starts at **groupNext**.\n5. Save the old group head as **groupTail**, connect **groupPrev.next** to **kth**, and move **groupPrev** to **groupTail**.\n6. Continue with the next group and finally return **dummy.next**.",
        complexity: { time: "O(n)", space: "O(1)", note: "Each node participates in a bounded scan and one reversal step, and only a constant number of pointers are stored." },
        filename: "Solution.java",
        code: `class ListNode {
    int val;
    ListNode next;

    ListNode(int x) {
        val = x;
    }
}

class Solution {

    public ListNode reverseKGroup(ListNode head, int k) {
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        ListNode groupPrev = dummy;

        while (true) {
            ListNode kth = getKth(groupPrev, k);
            if (kth == null) {
                break;
            }

            ListNode groupNext = kth.next;
            ListNode previous = groupNext;
            ListNode current = groupPrev.next;

            while (current != groupNext) {
                ListNode next = current.next;
                current.next = previous;
                previous = current;
                current = next;
            }

            ListNode groupTail = groupPrev.next;
            groupPrev.next = kth;
            groupPrev = groupTail;
        }

        return dummy.next;
    }

    private ListNode getKth(ListNode start, int k) {
        ListNode current = start;
        for (int step = 0; step < k && current != null; step++) {
            current = current.next;
        }
        return current;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "head = 1 -> 2 -> 3 -> 4 -> 5, k = 2. Track each complete group and the saved node after that group.",
      columns: ["group", "groupPrev before", "kth", "groupNext", "reversed segment", "list after relink"],
      rows: [
        ["1", "dummy", "2", "3", "1 -> 2 becomes 2 -> 1", "dummy -> 2 -> 1 -> 3 -> 4 -> 5"],
        ["2", "1", "4", "5", "3 -> 4 becomes 4 -> 3", "dummy -> 2 -> 1 -> 4 -> 3 -> 5"],
        ["stop", "3", "not found", "none", "5 has fewer than k nodes", "dummy -> 2 -> 1 -> 4 -> 3 -> 5"],
      ],
      narrativeMD: "The final partial group contains only **5**, so the loop stops before reversing it. Returning **dummy.next** gives **2 -> 1 -> 4 -> 3 -> 5**.",
    },
    complexityNote:
      "The iterative boundary-based solution is the expected optimal form: O(n) time, O(1) extra space, and no reversal of incomplete trailing groups.",
    interviewTipsMD:
      "Talk through the boundary names before coding: **groupPrev** is before the group, **kth** is the last node in the group, and **groupNext** is the first node after it. The safest reversal loop stops at **groupNext**, not at a counter, because **groupNext** is the stable boundary saved before rewiring.",
    followUps: [
      "How would you write the recursive version, and what extra space would the recursion stack use?",
      "How would the solution change if the final short group also had to be reversed?",
      "Can you reverse alternating groups of **k** nodes while leaving every other group unchanged?",
      "How would you adapt the algorithm for a doubly linked list where **prev** pointers must also be updated?",
    ],
    similarProblems: [
      { title: "Reverse Linked List", difficulty: "Easy", slug: "ll-reverse-linked-list", note: "The inner reversal loop is the same core primitive." },
      { title: "Reverse Linked List II", difficulty: "Medium", slug: "ll-reverse-linked-list-ii", note: "Reverses one bounded segment instead of repeated fixed-size groups." },
      { title: "Swap Nodes in Pairs", difficulty: "Medium", slug: "ll-swap-nodes-in-pairs", note: "The special case where each group has size two." },
      { title: "Reverse Nodes in Even Length Groups", difficulty: "Medium", url: "https://leetcode.com/problems/reverse-nodes-in-even-length-groups/", note: "A variable-size group variant with conditional reversal." },
    ],
    keyTakeaways: [
      "Always prove a complete group exists before reversing it.",
      "Save **groupNext** before changing any links inside the group.",
      "The old group head becomes the new group tail and the next **groupPrev**.",
      "Seeding **previous** with **groupNext** reconnects the tail during the reversal itself.",
    ],
    pattern:
      "Repeated segment reversal: find a complete block, save the node after it, reverse up to that boundary, splice the block back, and advance from the new tail.",
  },
  {
    kind: "problem",
    slug: "ll-swap-nodes-in-pairs",
    moduleId: "ll-reversal",
    order: 16,
    title: "Swap Nodes in Pairs",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/swap-nodes-in-pairs/",
    tags: ["Linked List", "Pair Swapping", "Dummy Node", "Pointer Manipulation", "In-Place Reversal"],
    companies: ["Amazon", "Microsoft", "Google", "Meta", "Adobe"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 16,
    statementMD:
      "Given the **head** of a singly linked list, swap every two adjacent nodes and return the modified list. The node values must not be changed; only links may be rewired. If the list has an odd number of nodes, the final node remains in place.",
    constraints: [
      "The number of nodes is in the range 0 to 100",
      "0 <= Node.val <= 100",
    ],
    inputMD: "The head of a singly linked list, possibly empty.",
    outputMD: "The head of the list after every adjacent pair has been swapped in place.",
    examples: [
      {
        input: "head = 1 -> 2 -> 3 -> 4",
        output: "2 -> 1 -> 4 -> 3",
        explanation: "The pair **1 -> 2** becomes **2 -> 1**, and the pair **3 -> 4** becomes **4 -> 3**.",
      },
      {
        input: "head = 1 -> 2 -> 3",
        output: "2 -> 1 -> 3",
        explanation: "The first pair is swapped, and the trailing **3** has no partner, so it remains unchanged.",
      },
    ],
    learningObjectives: [
      "Recognise pair swapping as the **k = 2** version of fixed-size segment reversal.",
      "Use a dummy head and a **previous** pointer to reconnect each swapped pair.",
      "Update the three links of a pair in an order that never loses the remaining list.",
      "Explain why an odd trailing node should be left untouched.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe phrase **swap every two adjacent nodes** is a tiny in-place reversal problem repeated across the list. Each pair is a two-node segment: reverse it, reconnect the node before the pair, then move to the next pair. Because the head may change after the first swap, a dummy node keeps the code uniform.\n\nThe pointer trap is overwriting the link to the rest of the list. For each pair, name **first = previous.next** and **second = first.next**. Save the pair relationship before rewiring: **first.next** must become the node after **second**, **second.next** must become **first**, and **previous.next** must become **second**. After that, **first** is the tail of the swapped pair, so it becomes the new **previous**.",
    commonMistakes: [
      "Swapping node values instead of rewiring nodes, which misses the linked-list pointer skill being tested.",
      "Forgetting to connect **previous.next** to the second node, causing the swapped pair to be unreachable from the head.",
      "Advancing **previous** to the second node after a swap; the correct next boundary is the first node, now the pair tail.",
      "Entering the loop when only one node remains and then reading **first.next** when it is null.",
    ],
    algorithmMD:
      "**Key idea**\n\nUse **previous** as the stable node before the pair. Let **first = previous.next** and **second = first.next**. Rewire the pair so **second** comes before **first**, attach **previous** to **second**, and then move **previous** to **first**, which is now the tail of the swapped pair.\n\n**Pointer walkthrough**\n\nFor **head = 1 -> 2 -> 3 -> 4**, start with **dummy -> 1 -> 2 -> 3 -> 4** and **previous = dummy**. The first pair is **first = 1** and **second = 2**. Set **1.next** to **3**, set **2.next** to **1**, and set **dummy.next** to **2**, giving **dummy -> 2 -> 1 -> 3 -> 4**. Move **previous** to **1**. The next pair is **3** and **4**. After the same rewiring, the list is **dummy -> 2 -> 1 -> 4 -> 3**.\n\n**Algorithm**\n\n1. Create **dummy** and set **dummy.next** to **head**.\n2. Initialise **previous** to **dummy**.\n3. While **previous.next** and **previous.next.next** both exist, identify **first** and **second**.\n4. Point **first.next** to the node after **second**.\n5. Point **second.next** to **first**, then point **previous.next** to **second**.\n6. Move **previous** to **first** and continue with the next pair.\n7. Return **dummy.next**.",
    solutions: [
      {
        name: "Iterative dummy-head pair swap",
        whenToUseMD:
          "Use this as the primary interview solution because it runs in O(1) extra space and makes every pair reconnection explicit.",
        approachMD:
          "Process one adjacent pair at a time. The dummy node owns the head edge case, and **previous** always points to the node before the next pair. Rewire exactly three links, then advance to the tail of the swapped pair.",
        walkthroughMD:
          "1. Create **dummy** and set **previous** to it.\n2. Continue only while two nodes exist after **previous**.\n3. Name the pair **first** and **second** so the rewiring order is readable.\n4. Connect **first.next** to the node after **second** to preserve the suffix.\n5. Place **second** before **first** and connect **previous** to **second**.\n6. Move **previous** to **first**, which is now the tail of the swapped pair.\n7. Return **dummy.next**.",
        complexity: { time: "O(n)", space: "O(1)", note: "Each node is visited a constant number of times and the algorithm stores only a few pointers." },
        filename: "Solution.java",
        code: `class ListNode {
    int val;
    ListNode next;

    ListNode(int x) {
        val = x;
    }
}

class Solution {

    public ListNode swapPairs(ListNode head) {
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        ListNode previous = dummy;

        while (previous.next != null && previous.next.next != null) {
            ListNode first = previous.next;
            ListNode second = first.next;

            first.next = second.next;
            second.next = first;
            previous.next = second;

            previous = first;
        }

        return dummy.next;
    }
}`,
      },
      {
        name: "Recursive pair swap",
        whenToUseMD:
          "Use this when the interviewer asks for a recursive formulation or when explaining the self-similar structure matters more than constant stack space.",
        approachMD:
          "Swap the first two nodes, then recursively swap the rest of the list and attach that swapped suffix after the original first node. The recursion naturally leaves an empty list or a single trailing node unchanged.",
        walkthroughMD:
          "1. If **head** is null or **head.next** is null, return **head** because there is no complete pair.\n2. Let **second** be **head.next** and remember the remaining suffix after **second**.\n3. Point **second.next** to **head** so the first pair is swapped.\n4. Set **head.next** to the result of recursively swapping the remaining suffix.\n5. Return **second** as the new head of this swapped pair.",
        complexity: { time: "O(n)", space: "O(n)", note: "Each node is processed once, and the recursion stack can contain one frame per pair." },
        filename: "Solution.java",
        code: `class ListNode {
    int val;
    ListNode next;

    ListNode(int x) {
        val = x;
    }
}

class Solution {

    public ListNode swapPairs(ListNode head) {
        if (head == null || head.next == null) {
            return head;
        }

        ListNode second = head.next;
        ListNode remaining = second.next;

        second.next = head;
        head.next = swapPairs(remaining);

        return second;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "head = 1 -> 2 -> 3 -> 4. Track **previous**, the two nodes in the current pair, and the list after each swap.",
      columns: ["pair", "previous before", "first", "second", "list after swap", "next previous"],
      rows: [
        ["1", "dummy", "1", "2", "dummy -> 2 -> 1 -> 3 -> 4", "1"],
        ["2", "1", "3", "4", "dummy -> 2 -> 1 -> 4 -> 3", "3"],
        ["stop", "3", "none", "none", "dummy -> 2 -> 1 -> 4 -> 3", "no complete pair remains"],
      ],
      narrativeMD: "Each completed pair moves **previous** to the pair tail. After **4 -> 3**, there are no two nodes after **previous**, so returning **dummy.next** gives **2 -> 1 -> 4 -> 3**.",
    },
    complexityNote:
      "The iterative dummy-head solution is optimal for interviews because it preserves O(1) extra space; the recursive version is equally linear but spends stack space.",
    interviewTipsMD:
      "Present this as the smallest segment-reversal template. Say that **previous** is the node before the segment, **first** becomes the tail, and **second** becomes the head. That framing makes the relationship to Reverse Nodes in k-Group obvious and helps avoid value-swapping shortcuts.",
    followUps: [
      "How does this generalise to reversing nodes in groups of **k**?",
      "How would you swap every other pair instead of every pair?",
      "How would the recursive solution behave on a very long list?",
      "How would you update the algorithm for a doubly linked list?",
    ],
    similarProblems: [
      { title: "Reverse Nodes in k-Group", difficulty: "Hard", slug: "ll-reverse-nodes-in-k-group", note: "This problem is the **k = 2** version of group reversal." },
      { title: "Reverse Linked List II", difficulty: "Medium", slug: "ll-reverse-linked-list-ii", note: "Also reverses a bounded segment and reconnects both boundaries." },
      { title: "Reverse Linked List", difficulty: "Easy", slug: "ll-reverse-linked-list", note: "The primitive full-list reversal behind all segment reversal problems." },
      { title: "Odd Even Linked List", difficulty: "Medium", url: "https://leetcode.com/problems/odd-even-linked-list/", note: "Another pointer-rewiring problem that groups nodes without changing values." },
    ],
    keyTakeaways: [
      "Swapping pairs is fixed-size segment reversal with **k = 2**.",
      "A dummy head handles changes to the real head after the first swap.",
      "After a pair swap, the original first node becomes the tail and the next **previous**.",
      "Always preserve the suffix by setting **first.next** before redirecting the pair head.",
    ],
    pattern:
      "Pair reversal template: use a dummy node, name the two nodes after **previous**, rewire them into reversed order, then advance **previous** to the new pair tail.",
  },
];
