import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "ll-merge-k-sorted-lists",
    moduleId: "ll-merge",
    order: 17,
    title: "Merge k Sorted Lists",
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/merge-k-sorted-lists/",
    tags: ["Linked List", "Heap", "Divide and Conquer", "Merge", "Priority Queue"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 35,
    statementMD:
      "You are given an array of **k** linked lists, where each linked list is sorted in ascending order. Merge all the lists into one sorted linked list and return its head.",
    constraints: [
      "0 <= k <= 10^4",
      "0 <= lists[i].length <= 500",
      "-10^4 <= lists[i][j] <= 10^4",
      "Each linked list is sorted in ascending order",
      "The total number of nodes across all lists is at most 10^4",
    ],
    inputMD: "An array **lists** of linked-list heads, where each individual list is already sorted.",
    outputMD: "The head of one sorted linked list containing every node from every input list.",
    examples: [
      {
        input: "lists = [[1 -> 4 -> 5], [1 -> 3 -> 4], [2 -> 6]]",
        output: "1 -> 1 -> 2 -> 3 -> 4 -> 4 -> 5 -> 6",
        explanation: "The merged order repeatedly takes the smallest available head across the three lists.",
      },
      {
        input: "lists = []",
        output: "[]",
        explanation: "There are no lists to merge, so the answer is an empty list.",
      },
      {
        input: "lists = [[]]",
        output: "[]",
        explanation: "The only list is empty, so there are no nodes to return.",
      },
    ],
    learningObjectives: [
      "Recognise **k sorted streams** as a current-head selection problem.",
      "Reuse the merge-two-sorted-lists building block without creating new list nodes.",
      "Compare the min-heap strategy with divide-and-conquer pairwise merging.",
      "Maintain a clean output tail while preserving every remaining next pointer until its node is processed.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is **many already-sorted linked lists**. If there were only two lists, you would use the standard merge-two-sorted-lists pointer template. With **k** lists, the same idea still applies: the next output node must be the smallest among the current heads of all non-empty lists.\n\nScanning all **k** heads for every output node is wasteful. A min-heap stores only the live candidates, one current head per list, so selecting the next node costs **O(log k)** instead of **O(k)**. After removing a node from the heap, push its successor because that successor becomes the new head of that same sorted stream.\n\nA second interview-ready recognition is divide and conquer: repeatedly merge lists in pairs, just like the merge phase of merge sort. This reuses the two-list merge building block and gives the same **O(N log k)** total time while avoiding heap operations.",
    commonMistakes: [
      "Pushing every node into the heap at once instead of only the current heads, which uses unnecessary memory.",
      "Forgetting to push the polled node's successor, which drops the rest of that list.",
      "Creating new nodes and losing the original node identities when the problem only needs pointer rewiring.",
      "Not handling **k = 0** or all-empty lists before returning the final head.",
    ],
    algorithmMD:
      "**Key idea**\n\nKeep one candidate per list. The heap always contains the smallest unmerged node from each list that still has nodes. Polling the heap chooses the globally smallest next node, appending it advances the output tail, and pushing its successor restores the invariant for that list.\n\n**Pointer walkthrough**\n\nUse **A: 1 -> 4 -> 5**, **B: 1 -> 3 -> 4**, and **C: 2 -> 6**. Start with heap heads **A1, B1, C2** and output **dummy**. Poll **A1**, append it, and push **A4**; the output is **dummy -> 1** and the heap is **B1, C2, A4**. Poll **B1**, append it, and push **B3**; the output is **dummy -> 1 -> 1** and the heap is **C2, B3, A4**. Poll **C2**, append it, and push **C6**. Continue polling **B3**, **A4**, **B4**, **A5**, and **C6** until the heap is empty. The output tail always points to the last appended node, and the heap contains the next possible heads.\n\n**Algorithm**\n\n1. Create a min-heap ordered by node value.\n2. Push every non-null list head into the heap.\n3. Create a dummy head and keep **tail** at the end of the merged output.\n4. While the heap is not empty, poll the smallest node.\n5. Append that node after **tail** and move **tail** forward.\n6. If the appended node has a next node, push that successor into the heap.\n7. After the loop, terminate **tail.next** and return **dummy.next**.",
    solutions: [
      {
        name: "Min-heap of current heads",
        whenToUseMD:
          "Use this as the primary interview solution when **k** sorted lists arrive independently and you want the clearest **pick the next smallest head** invariant.",
        approachMD:
          "Store only the current head of each non-empty list in a min-heap. Each poll appends one node to the answer, and that node's successor becomes the new candidate from the same list.",
        walkthroughMD:
          "1. Build a **PriorityQueue** ordered by node value.\n2. Offer each non-null input head to seed the heap with at most **k** candidates.\n3. Use **dummy** and **tail** to build the merged list without special-casing the first node.\n4. Poll the smallest node, append it after **tail**, and advance **tail**.\n5. If the polled node has a successor, offer that successor to the heap.\n6. Set **tail.next** to **null** after all nodes are appended and return **dummy.next**.",
        complexity: { time: "O(N log k)", space: "O(k)", note: "**N** total nodes are polled once, and the heap holds at most one node per list." },
        filename: "Solution.java",
        code: `import java.util.PriorityQueue;

class ListNode { int val; ListNode next; ListNode(int x){ val = x; } }

class Solution {

    public ListNode mergeKLists(ListNode[] lists) {
        PriorityQueue<ListNode> minHeap = new PriorityQueue<>((a, b) -> a.val - b.val);

        for (ListNode head : lists) {
            if (head != null) {
                minHeap.offer(head);
            }
        }

        ListNode dummy = new ListNode(0);
        ListNode tail = dummy;

        while (!minHeap.isEmpty()) {
            ListNode smallest = minHeap.poll();
            tail.next = smallest;
            tail = tail.next;

            if (smallest.next != null) {
                minHeap.offer(smallest.next);
            }
        }

        tail.next = null;
        return dummy.next;
    }
}`,
      },
      {
        name: "Divide and conquer pairwise merge",
        whenToUseMD:
          "Use this when you want to emphasise reuse of the two-list merge primitive and avoid an explicit heap.",
        approachMD:
          "Repeatedly merge lists in pairs: merge list **0** with **1**, **2** with **3**, then double the interval and merge the merged runs. Each node participates in one merge per level.",
        walkthroughMD:
          "1. If the input array is empty, return **null**.\n2. Start with **interval = 1**, meaning adjacent lists are paired.\n3. For each pair **i** and **i + interval**, merge them with the standard two-list dummy-tail routine and store the result at **lists[i]**.\n4. Double **interval** so the next pass merges groups twice as large.\n5. Continue until **interval** reaches the number of lists.\n6. Return **lists[0]**, the fully merged list.",
        complexity: { time: "O(N log k)", space: "O(1)", note: "There are O(log k) merge levels, and every level touches each node once; the input array stores merged heads." },
        filename: "Solution.java",
        code: `class ListNode { int val; ListNode next; ListNode(int x){ val = x; } }

class Solution {

    public ListNode mergeKLists(ListNode[] lists) {
        if (lists == null || lists.length == 0) {
            return null;
        }

        int interval = 1;
        while (interval < lists.length) {
            for (int index = 0; index + interval < lists.length; index += interval * 2) {
                lists[index] = mergeTwoLists(lists[index], lists[index + interval]);
            }
            interval *= 2;
        }

        return lists[0];
    }

    private ListNode mergeTwoLists(ListNode first, ListNode second) {
        ListNode dummy = new ListNode(0);
        ListNode tail = dummy;

        while (first != null && second != null) {
            if (first.val <= second.val) {
                tail.next = first;
                first = first.next;
            } else {
                tail.next = second;
                second = second.next;
            }
            tail = tail.next;
        }

        if (first != null) {
            tail.next = first;
        } else {
            tail.next = second;
        }

        return dummy.next;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "lists = [[1 -> 4 -> 5], [1 -> 3 -> 4], [2 -> 6]]. Track the heap of current heads and the merged output after each poll.",
      columns: ["step", "heap heads before poll", "node appended", "new head pushed", "merged list"],
      rows: [
        ["seed", "A1, B1, C2", "none", "A1, B1, C2", "dummy"],
        ["1", "A1, B1, C2", "A1", "A4", "1"],
        ["2", "B1, C2, A4", "B1", "B3", "1 -> 1"],
        ["3", "C2, B3, A4", "C2", "C6", "1 -> 1 -> 2"],
        ["4", "B3, A4, C6", "B3", "B4", "1 -> 1 -> 2 -> 3"],
        ["5", "A4, B4, C6", "A4", "A5", "1 -> 1 -> 2 -> 3 -> 4"],
        ["6", "B4, A5, C6", "B4", "none", "1 -> 1 -> 2 -> 3 -> 4 -> 4"],
        ["7", "A5, C6", "A5", "none", "1 -> 1 -> 2 -> 3 -> 4 -> 4 -> 5"],
        ["8", "C6", "C6", "none", "1 -> 1 -> 2 -> 3 -> 4 -> 4 -> 5 -> 6"],
      ],
      narrativeMD: "Every row appends the smallest current head and then advances only that source list. When the heap becomes empty, the merged list contains all **8** nodes in sorted order.",
    },
    complexityNote:
      "The heap solution is usually the cleanest primary answer: **O(N log k)** time and **O(k)** heap space. Pairwise divide and conquer reaches the same time with constant extra pointer space beyond the input array.",
    interviewTipsMD:
      "Lead with the two-list merge intuition, then explain why **k** lists need a data structure to choose the next smallest head efficiently. Name **N** as the total node count and **k** as the number of lists; interviewers expect that distinction. If asked for alternatives, describe pairwise merging as merge sort over lists: it is not brute force, it is the same merge primitive applied in balanced levels.",
    followUps: [
      "How would the solution change if the lists arrived as an iterator stream instead of an array?",
      "What if you needed to preserve the original lists and could not relink their nodes?",
      "How would you merge **k** sorted arrays, and what changes compared with linked lists?",
      "When would divide-and-conquer merging be preferable to a heap in production?",
    ],
    similarProblems: [
      { title: "Merge Two Sorted Lists", difficulty: "Easy", slug: "ll-merge-two-sorted-lists", note: "The two-list merge primitive used by both optimal approaches." },
      { title: "Sort List", difficulty: "Medium", slug: "ll-sort-list", note: "Uses repeated two-list merging after splitting one list into sorted runs." },
      { title: "Reverse Nodes in k-Group", difficulty: "Hard", slug: "ll-reverse-nodes-in-k-group", note: "Another linked-list problem where group boundaries and tail pointers matter." },
      { title: "Smallest Range Covering Elements from K Lists", difficulty: "Hard", url: "https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists/", note: "Also keeps one live candidate from each sorted list in a heap." },
    ],
    keyTakeaways: [
      "For **k** sorted lists, the next output node is the smallest among the current heads.",
      "A min-heap reduces repeated head selection from **O(k)** to **O(log k)** per node.",
      "Divide-and-conquer pairwise merging is the natural alternative and reuses Merge Two Sorted Lists.",
      "The output tail should relink existing nodes and finish with a clean **null** tail.",
    ],
    pattern:
      "K-way merge pattern: keep the current frontier from each sorted source, repeatedly emit the smallest frontier node, then advance only that source.",
  },
  {
    kind: "problem",
    slug: "ll-sort-list",
    moduleId: "ll-merge",
    order: 18,
    title: "Sort List",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/sort-list/",
    tags: ["Linked List", "Merge Sort", "Two Pointers", "Divide and Conquer", "Sorting"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Bloomberg"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 30,
    statementMD:
      "Given the head of a linked list, sort the list in ascending order and return the sorted list.",
    constraints: [
      "0 <= number of nodes <= 5 * 10^4",
      "-10^5 <= Node.val <= 10^5",
    ],
    inputMD: "The head of a singly linked list.",
    outputMD: "The head of the same nodes rearranged into ascending order.",
    examples: [
      {
        input: "head = 4 -> 2 -> 1 -> 3",
        output: "1 -> 2 -> 3 -> 4",
        explanation: "Merge sort splits the list into **4 -> 2** and **1 -> 3**, sorts each half, then merges them.",
      },
      {
        input: "head = -1 -> 5 -> 3 -> 4 -> 0",
        output: "-1 -> 0 -> 3 -> 4 -> 5",
        explanation: "Negative and positive values are compared normally while nodes are relinked into sorted order.",
      },
    ],
    learningObjectives: [
      "Recognise linked-list sorting as a merge-sort problem rather than an array quicksort problem.",
      "Use fast and slow pointers to split a list into two halves.",
      "Merge two sorted linked lists with a dummy tail after recursive sorting.",
      "Explain why bottom-up merge sort removes the recursion stack for **O(1)** auxiliary space.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is **sort a linked list in O(n log n)**. Array sorting instincts can be misleading because linked lists do not support random access. Merge sort fits linked lists naturally: splitting only needs fast and slow pointers, and merging only needs next-pointer rewiring.\n\nTop-down merge sort is the clearest interview path. Find the middle, cut the list into two independent halves, recursively sort each half, then reuse the merge-two-sorted-lists routine to stitch them together. The key pointer trap is forgetting to cut **slow.next**; without that cut, the left recursive call still sees the whole list and never shrinks.\n\nIf the interviewer asks for strict **O(1)** auxiliary space, switch the discussion to bottom-up merge sort. It iteratively merges runs of size **1**, then **2**, then **4**, avoiding recursion while keeping the same merge idea.",
    commonMistakes: [
      "Using array-style random indexing, which is inefficient on linked lists.",
      "Finding the middle but forgetting to set **slow.next** to **null**, causing infinite recursion.",
      "Losing the head of the second half while cutting the list.",
      "Claiming top-down merge sort is **O(1)** space even though the recursion stack is **O(log n)**.",
    ],
    algorithmMD:
      "**Key idea**\n\nMerge sort works because each split halves the list and each merge rebuilds sorted order using only pointer comparisons. The top-down invariant is: **sortList(head)** returns a sorted version of exactly the nodes reachable from **head** after the caller has made that segment finite.\n\n**Pointer walkthrough**\n\nFor **4 -> 2 -> 1 -> 3**, start **slow** at **4** and **fast** at **2**. Move **slow** to **2** while **fast** jumps to **3**. Since **fast.next** is now empty, **slow** marks the end of the left half. Save **secondHalf = 1 -> 3**, then cut **2.next** so the halves become **4 -> 2** and **1 -> 3**. Recursively split **4 -> 2** into **4** and **2**, merge into **2 -> 4**. Split **1 -> 3** into **1** and **3**, merge into **1 -> 3**. The final merge compares heads **2** and **1**, emits **1**, then **2**, then **3**, then **4**.\n\n**Algorithm**\n\n1. If the list has zero or one node, return it because it is already sorted.\n2. Use **slow** and **fast** pointers to find the node before the start of the right half.\n3. Save the right-half head and cut **slow.next** to separate the two halves.\n4. Recursively sort the left half and the right half.\n5. Merge the two sorted halves with the standard dummy-tail two-list merge.\n6. Return the merged head.",
    solutions: [
      {
        name: "Top-down linked-list merge sort",
        whenToUseMD:
          "Use this first in interviews because it is concise, clearly uses fast and slow pointers, and mirrors the familiar merge-sort recurrence.",
        approachMD:
          "Recursively split the list at the middle, sort both halves, then merge the sorted halves. The split step must physically break the list so each recursive call receives a smaller segment.",
        walkthroughMD:
          "1. Return **head** immediately when the segment has zero or one node.\n2. Run **slow** and **fast** so **slow** stops just before the right half.\n3. Store **secondHalf = slow.next**, then set **slow.next = null** to cut the segment.\n4. Recursively sort **head** and **secondHalf**.\n5. Merge the two sorted lists by advancing the smaller head each time.\n6. Return **dummy.next** from the merge helper.",
        complexity: { time: "O(n log n)", space: "O(log n)", note: "Each level merges all n nodes, and the balanced recursion stack has depth O(log n)." },
        filename: "Solution.java",
        code: `class ListNode { int val; ListNode next; ListNode(int x){ val = x; } }

class Solution {

    public ListNode sortList(ListNode head) {
        if (head == null || head.next == null) {
            return head;
        }

        ListNode secondHalf = split(head);
        ListNode left = sortList(head);
        ListNode right = sortList(secondHalf);
        return merge(left, right);
    }

    private ListNode split(ListNode head) {
        ListNode slow = head;
        ListNode fast = head.next;

        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }

        ListNode secondHalf = slow.next;
        slow.next = null;
        return secondHalf;
    }

    private ListNode merge(ListNode left, ListNode right) {
        ListNode dummy = new ListNode(0);
        ListNode tail = dummy;

        while (left != null && right != null) {
            if (left.val <= right.val) {
                tail.next = left;
                left = left.next;
            } else {
                tail.next = right;
                right = right.next;
            }
            tail = tail.next;
        }

        if (left != null) {
            tail.next = left;
        } else {
            tail.next = right;
        }

        return dummy.next;
    }
}`,
      },
      {
        name: "Bottom-up iterative merge sort",
        whenToUseMD:
          "Use this as the follow-up when the interviewer asks for **O(1)** auxiliary space and wants recursion removed.",
        approachMD:
          "Count the list length, then merge sorted runs iteratively. First merge runs of size **1**, then **2**, then **4**, doubling until the run size covers the whole list.",
        walkthroughMD:
          "1. Count the total number of nodes.\n2. Attach the list to **dummy** so each pass can rebuild from a stable head.\n3. For each run size, walk the list and split out a left run and a right run of that size.\n4. Merge the two runs after **previousTail** and return the new tail of the merged run.\n5. Continue until every run in the pass is merged.\n6. Double the run size and repeat until the whole list is sorted.",
        complexity: { time: "O(n log n)", space: "O(1)", note: "The algorithm uses iterative run sizes and a constant number of pointers, with no recursion stack." },
        filename: "Solution.java",
        code: `class ListNode { int val; ListNode next; ListNode(int x){ val = x; } }

class Solution {

    public ListNode sortList(ListNode head) {
        if (head == null || head.next == null) {
            return head;
        }

        int length = 0;
        ListNode node = head;
        while (node != null) {
            length++;
            node = node.next;
        }

        ListNode dummy = new ListNode(0);
        dummy.next = head;

        for (int size = 1; size < length; size *= 2) {
            ListNode previousTail = dummy;
            ListNode current = dummy.next;

            while (current != null) {
                ListNode left = current;
                ListNode right = split(left, size);
                current = split(right, size);
                previousTail = merge(left, right, previousTail);
            }
        }

        return dummy.next;
    }

    private ListNode split(ListNode head, int size) {
        if (head == null) {
            return null;
        }

        for (int count = 1; count < size && head.next != null; count++) {
            head = head.next;
        }

        ListNode nextRun = head.next;
        head.next = null;
        return nextRun;
    }

    private ListNode merge(ListNode left, ListNode right, ListNode previousTail) {
        ListNode tail = previousTail;

        while (left != null && right != null) {
            if (left.val <= right.val) {
                tail.next = left;
                left = left.next;
            } else {
                tail.next = right;
                right = right.next;
            }
            tail = tail.next;
        }

        if (left != null) {
            tail.next = left;
        } else {
            tail.next = right;
        }

        while (tail.next != null) {
            tail = tail.next;
        }

        return tail;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "head = 4 -> 2 -> 1 -> 3. Track the top-down splits and merges that produce the final sorted list.",
      columns: ["phase", "left side", "right side", "action", "result"],
      rows: [
        ["split 4 -> 2 -> 1 -> 3", "4 -> 2", "1 -> 3", "slow cuts after 2", "two halves"],
        ["split 4 -> 2", "4", "2", "cut into single nodes", "ready to merge"],
        ["merge 4 and 2", "4", "2", "take 2 then 4", "2 -> 4"],
        ["split 1 -> 3", "1", "3", "cut into single nodes", "ready to merge"],
        ["merge 1 and 3", "1", "3", "take 1 then 3", "1 -> 3"],
        ["final merge", "2 -> 4", "1 -> 3", "take 1, 2, 3, 4", "1 -> 2 -> 3 -> 4"],
      ],
      narrativeMD: "Every split makes smaller finite lists, and every merge consumes two sorted lists. The final merge returns **1 -> 2 -> 3 -> 4**.",
    },
    complexityNote:
      "Top-down merge sort is **O(n log n)** time with **O(log n)** recursion space. Bottom-up merge sort keeps the same time and reaches **O(1)** auxiliary space by merging fixed-size runs iteratively.",
    interviewTipsMD:
      "Explain why merge sort is preferred for linked lists: it does not need random access, and merging is pointer-friendly. Be precise about the split: **fast** starts at **head.next** so **slow** stops before the right half and can cut the list. For the follow-up, mention bottom-up merge sort as the strict **O(1)** space version because it replaces recursion with iterative run sizes.",
    followUps: [
      "How would you implement the bottom-up version if recursion depth were not allowed?",
      "How would you keep the sort stable when equal values appear?",
      "What changes if the list is doubly linked?",
      "Could quicksort be a good choice for linked lists, and why is merge sort usually safer?",
    ],
    similarProblems: [
      { title: "Merge Two Sorted Lists", difficulty: "Easy", slug: "ll-merge-two-sorted-lists", note: "The merge helper is the core building block." },
      { title: "Merge k Sorted Lists", difficulty: "Hard", slug: "ll-merge-k-sorted-lists", note: "Generalises merging from two sorted lists to many sorted lists." },
      { title: "Middle of the Linked List", difficulty: "Easy", slug: "ll-middle-of-linked-list", note: "Uses the same fast and slow pointer split idea." },
      { title: "Insertion Sort List", difficulty: "Medium", url: "https://leetcode.com/problems/insertion-sort-list/", note: "Another linked-list sorting problem with different complexity tradeoffs." },
    ],
    keyTakeaways: [
      "Linked-list sorting naturally points to merge sort because splitting and merging are pointer operations.",
      "Cutting the list at the middle is mandatory before recursive calls.",
      "Top-down merge sort uses **O(log n)** stack space; bottom-up merge sort can reach **O(1)** auxiliary space.",
      "The merge-two-sorted-lists routine is a reusable linked-list primitive.",
    ],
    pattern:
      "Linked-list merge sort: split with fast and slow pointers, recursively sort finite halves, then merge sorted halves with a dummy tail.",
  },
  {
    kind: "problem",
    slug: "ll-partition-list",
    moduleId: "ll-merge",
    order: 19,
    title: "Partition List",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/partition-list/",
    tags: ["Linked List", "Two Pointers", "Dummy Node", "Stable Partition", "Pointer Splicing"],
    companies: ["Amazon", "Microsoft", "Google", "Meta", "Adobe"],
    estimatedReadingMin: 7,
    estimatedSolvingMin: 20,
    statementMD:
      "Given the head of a linked list and a value **x**, partition the list so that all nodes with values less than **x** come before nodes with values greater than or equal to **x**. Preserve the original relative order of the nodes in each partition.",
    constraints: [
      "0 <= number of nodes <= 200",
      "-100 <= Node.val <= 100",
      "-200 <= x <= 200",
    ],
    inputMD: "The head of a singly linked list and an integer pivot **x**.",
    outputMD: "The head of the partitioned list, with nodes less than **x** first and all other nodes after them.",
    examples: [
      {
        input: "head = 1 -> 4 -> 3 -> 2 -> 5 -> 2, x = 3",
        output: "1 -> 2 -> 2 -> 4 -> 3 -> 5",
        explanation: "Nodes **1**, **2**, and **2** are less than **3** and keep their original relative order. Nodes **4**, **3**, and **5** also keep their original relative order after them.",
      },
      {
        input: "head = 2 -> 1, x = 2",
        output: "1 -> 2",
        explanation: "The node **1** moves into the less-than bucket, while **2** stays in the greater-or-equal bucket.",
      },
      {
        input: "head = 1 -> 1 -> 1, x = 5",
        output: "1 -> 1 -> 1",
        explanation: "Every node is less than **5**, so the original order is already the final order.",
      },
    ],
    learningObjectives: [
      "Recognise stable partitioning as a two-dummy-bucket linked-list pattern.",
      "Append each node to exactly one tail while preserving relative order.",
      "Detach or terminate the greater-or-equal tail to avoid accidental cycles.",
      "Splice the less-than list before the greater-or-equal list in constant time.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is **partition while preserving relative order**. If order did not matter, you might swap values or move nodes aggressively. Because stability matters, the clean linked-list pattern is two buckets: one list for nodes less than **x**, and one list for nodes greater than or equal to **x**.\n\nDummy heads remove edge cases. You do not need to know whether the first real node belongs to the less bucket or the greater-or-equal bucket. Each scanned node is appended to the correct tail, and tails always represent the end of their buckets.\n\nThe pointer trap is the original **next** links. If the greater-or-equal tail still points into the old list after splicing, the final list can contain stale nodes or even a cycle. Always terminate the final tail with **null** before returning.",
    commonMistakes: [
      "Swapping node values, which does not demonstrate linked-list pointer control and can break identity-sensitive variants.",
      "Prepending nodes to a bucket, which reverses relative order and violates stability.",
      "Forgetting to connect the less-than tail to the greater-or-equal head at the end.",
      "Not setting the final tail's **next** to **null**, leaving stale links from the original list.",
    ],
    algorithmMD:
      "**Key idea**\n\nBuild two stable lists in one pass. **lessTail** always points to the last node with value less than **x**. **greaterTail** always points to the last node with value greater than or equal to **x**. Appending to tails preserves order inside each group, and the final splice puts the groups together.\n\n**Pointer walkthrough**\n\nFor **1 -> 4 -> 3 -> 2 -> 5 -> 2** with **x = 3**, start with **lessDummy** and **greaterDummy**. Visit **1** and append it to the less bucket: **lessDummy -> 1**. Visit **4** and append it to the greater-or-equal bucket: **greaterDummy -> 4**. Visit **3**, append after **4**: **greaterDummy -> 4 -> 3**. Visit **2**, append after **1**: **lessDummy -> 1 -> 2**. Visit **5**, append after **3**. Visit the final **2**, append after the less bucket's **2**. Now splice **lessTail.next** to **greaterDummy.next**, producing **1 -> 2 -> 2 -> 4 -> 3 -> 5**, and terminate the final greater tail.\n\n**Algorithm**\n\n1. Create **lessDummy** and **greaterDummy**.\n2. Keep **lessTail** and **greaterTail** at the ends of those two lists.\n3. Walk the original list from **head** to **null**.\n4. Save **nextNode** before rewiring the current node.\n5. If **current.val < x**, append current after **lessTail** and advance **lessTail**.\n6. Otherwise append current after **greaterTail** and advance **greaterTail**.\n7. Terminate **greaterTail.next** with **null**, connect **lessTail.next** to **greaterDummy.next**, and return **lessDummy.next**.",
    solutions: [
      {
        name: "Two dummy buckets",
        whenToUseMD:
          "Use this whenever a linked-list problem asks for a stable split into two groups and then a splice.",
        approachMD:
          "Create one dummy-headed list for nodes less than **x** and one for nodes greater than or equal to **x**. Append each original node to exactly one bucket, then connect the less bucket to the greater-or-equal bucket.",
        walkthroughMD:
          "1. Initialise **lessDummy**, **greaterDummy**, **lessTail**, and **greaterTail**.\n2. Traverse with **current** and save **nextNode** before changing any links.\n3. Detach **current.next** so the node is clean before it joins a bucket.\n4. Append **current** to the less bucket if its value is below **x**; otherwise append it to the greater-or-equal bucket.\n5. Move **current** to **nextNode** and continue.\n6. Set **greaterTail.next** to **null**, connect **lessTail.next** to **greaterDummy.next**, and return **lessDummy.next**.",
        complexity: { time: "O(n)", space: "O(1)", note: "Each node is visited and relinked once; the two dummy nodes and tails are constant extra space." },
        filename: "Solution.java",
        code: `class ListNode { int val; ListNode next; ListNode(int x){ val = x; } }

class Solution {

    public ListNode partition(ListNode head, int x) {
        ListNode lessDummy = new ListNode(0);
        ListNode greaterDummy = new ListNode(0);
        ListNode lessTail = lessDummy;
        ListNode greaterTail = greaterDummy;
        ListNode current = head;

        while (current != null) {
            ListNode nextNode = current.next;
            current.next = null;

            if (current.val < x) {
                lessTail.next = current;
                lessTail = current;
            } else {
                greaterTail.next = current;
                greaterTail = current;
            }

            current = nextNode;
        }

        greaterTail.next = null;
        lessTail.next = greaterDummy.next;
        return lessDummy.next;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "head = 1 -> 4 -> 3 -> 2 -> 5 -> 2, x = 3. Track the two buckets as each node is appended.",
      columns: ["node", "comparison", "less bucket", "greater-or-equal bucket", "action"],
      rows: [
        ["1", "1 < 3", "1", "empty", "append to less"],
        ["4", "4 >= 3", "1", "4", "append to greater-or-equal"],
        ["3", "3 >= 3", "1", "4 -> 3", "append to greater-or-equal"],
        ["2", "2 < 3", "1 -> 2", "4 -> 3", "append to less"],
        ["5", "5 >= 3", "1 -> 2", "4 -> 3 -> 5", "append to greater-or-equal"],
        ["2", "2 < 3", "1 -> 2 -> 2", "4 -> 3 -> 5", "append to less"],
        ["splice", "done", "1 -> 2 -> 2", "4 -> 3 -> 5", "connect less tail to greater head"],
      ],
      narrativeMD: "Appending to bucket tails preserves order within both groups. After splicing, the final list is **1 -> 2 -> 2 -> 4 -> 3 -> 5**.",
    },
    complexityNote:
      "The two-bucket dummy-node solution is optimal: one linear pass, no extra data structure, and stable order preserved.",
    interviewTipsMD:
      "Say the word **stable** early. It explains why you append to tails instead of pushing to heads or swapping values. Draw the two dummy heads before coding; this removes the hardest edge cases. End by explicitly setting the final greater-or-equal tail to **null**, because interviewers often look for that stale-link bug.",
    followUps: [
      "How would you partition into three buckets: less than, equal to, and greater than **x**?",
      "What changes if nodes must be copied instead of relinked?",
      "How would you partition a doubly linked list while preserving both **next** and **prev** pointers?",
      "How would you make the partition unstable but possibly reduce pointer assignments?",
    ],
    similarProblems: [
      { title: "Remove Linked List Elements", difficulty: "Easy", slug: "ll-remove-linked-list-elements", note: "Also uses dummy nodes to simplify head-changing operations." },
      { title: "Merge Two Sorted Lists", difficulty: "Easy", slug: "ll-merge-two-sorted-lists", note: "Uses the same dummy-tail appending discipline." },
      { title: "Swap Nodes in Pairs", difficulty: "Medium", slug: "ll-swap-nodes-in-pairs", note: "Another pointer-splicing problem where preserving links matters." },
      { title: "Odd Even Linked List", difficulty: "Medium", url: "https://leetcode.com/problems/odd-even-linked-list/", note: "Also separates a list into two stable chains and then reconnects them." },
    ],
    keyTakeaways: [
      "Stable partitioning is easiest with two dummy-headed buckets.",
      "Appending to tails preserves the original relative order inside each bucket.",
      "Saving **nextNode** before rewiring prevents losing the rest of the original list.",
      "Always terminate the final tail to avoid stale links or cycles.",
    ],
    pattern:
      "Stable two-bucket partition: scan once, append each node to the correct dummy-tail list, terminate the second tail, then splice the buckets together.",
  },
];
