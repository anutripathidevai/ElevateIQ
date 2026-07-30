import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "heap-merge-k-sorted-lists",
    moduleId: "heap-merge",
    order: 10,
    title: "Merge k Sorted Lists",
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/merge-k-sorted-lists/",
    tags: ["Heap", "Priority Queue", "K-Way Merge", "Linked List", "Merge Sort"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 35,
    statementMD:
      "You are given an array **lists** containing the heads of **k** sorted linked lists. Merge all nodes into one sorted linked list and return the head of the merged list. The merge should reuse existing nodes by rewiring next pointers rather than copying values into a new data structure.",
    constraints: [
      "k == lists.length",
      "0 <= k <= 10^4",
      "0 <= lists[i].length <= 500",
      "-10^4 <= Node.val <= 10^4",
      "lists[i] is sorted in non-decreasing order",
      "The total number of nodes across all lists is at most 10^4",
    ],
    inputMD: "An array **lists** where each entry is the head pointer of a sorted singly linked list. Empty lists may appear as **null** entries.",
    outputMD: "The head pointer of one sorted linked list containing every node from every input list.",
    examples: [
      {
        input: "lists = [[1,4,5],[1,3,4],[2,6]]",
        output: "[1,1,2,3,4,4,5,6]",
        explanation: "The smallest available head is repeatedly selected from the three lists, producing the globally sorted sequence.",
      },
      {
        input: "lists = []",
        output: "[]",
        explanation: "There are no lists and therefore no nodes to merge, so the answer is **null**.",
      },
      {
        input: "lists = [[]]",
        output: "[]",
        explanation: "The only list is empty. The heap starts empty and the merged result is empty as well.",
      },
    ],
    learningObjectives: [
      "Recognise the k-way merge signal: multiple sorted sequences where the next answer is always one of the current heads.",
      "Use a min-heap of at most **k** list heads to avoid scanning all lists for every output node.",
      "Maintain a dummy tail so linked-list output construction has no first-node special case.",
      "Explain the O(N log k) bound from polling and pushing each node through a heap of size **k**.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is **k sorted linked lists** or **merge many sorted streams**. In a normal two-list merge, the next output node must be one of the two heads. With **k** lists, the same idea still holds: the next output node must be the smallest among the **k** current heads.\n\nThe trap is scanning all heads for every node. If there are **N** total nodes, a repeated scan costs O(Nk). A min-heap keeps only the current head of each non-empty list, so finding the smallest head costs O(log k). After that node is appended, only its own list advances, so only that node next pointer needs to be pushed into the heap.",
    commonMistakes: [
      "Putting every node into the heap at once, which works but wastes space and misses the streaming k-way merge pattern.",
      "Forgetting to push the next node from the same list after polling its current head.",
      "Building new nodes unnecessarily instead of splicing the original linked-list nodes into the output.",
      "Returning the dummy node itself instead of **dummy.next**.",
    ],
    algorithmMD:
      "**Key idea**\n\nUse a min-heap ordered by node value. The heap contains at most one active node from each list: the current unmerged head. The heap root is therefore the globally smallest node that can legally come next. Poll it, attach it after the output tail, then push its successor from the same list.\n\n**Heap walkthrough**\n\nFor **lists = [[1,4,5],[1,3,4],[2,6]]**, start by pushing the first node of each list. The heap is **[1 from list 0, 1 from list 1, 2 from list 2]**. Poll **1 from list 0**, append it, and push its next node **4 from list 0**. The heap becomes **[1 from list 1, 2 from list 2, 4 from list 0]**.\n\nNext poll **1 from list 1** and push **3 from list 1**, so the heap becomes **[2 from list 2, 3 from list 1, 4 from list 0]**. Poll **2 from list 2** and push **6 from list 2**, giving **[3 from list 1, 4 from list 0, 6 from list 2]**. The same rule continues until the heap is empty. The output tail has received nodes in sorted order: **1 -> 1 -> 2 -> 3 -> 4 -> 4 -> 5 -> 6**.\n\n**Algorithm**\n\n1. Create a min-heap ordered by **node.val**.\n2. Push the head of every non-empty list into the heap.\n3. Create a dummy node and keep **tail** at the end of the merged output.\n4. While the heap is not empty, poll the smallest node.\n5. Attach that node after **tail** and advance **tail**.\n6. If the polled node has a next node, push that next node into the heap.\n7. Return **dummy.next**.\n\nA divide-and-conquer pairwise merge is another optimal O(N log k) approach, but the heap version is the canonical streaming k-way merge template.",
    solutions: [
      {
        name: "Min-heap k-way merge",
        whenToUseMD:
          "Use this as the default interview solution when the input is already split into sorted streams and you need to repeatedly emit the smallest current head.",
        approachMD:
          "Keep one candidate from each non-empty list in a min-heap. Each poll gives the next output node. Since only the source list of that node changed, push only that node successor back into the heap.",
        walkthroughMD:
          "1. Create a **PriorityQueue** that compares list nodes by value.\n2. Offer every non-null list head into the heap.\n3. Attach polled nodes behind a dummy output node using a moving **tail** pointer.\n4. After attaching a node, offer its **next** node if it exists.\n5. Continue until the heap is empty, then return **dummy.next**.",
        complexity: { time: "O(N log k)", space: "O(k)", note: "Each of the N nodes is polled once, and at most one node per list is stored in the heap." },
        filename: "Solution.java",
        code: `import java.util.*;

class ListNode {
    int val;
    ListNode next;

    ListNode(int x) {
        val = x;
    }
}

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

        return dummy.next;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "lists = [[1,4,5],[1,3,4],[2,6]]. The heap stores only the current head from each non-empty list.",
      columns: ["step", "polled node", "heap after push", "merged output"],
      rows: [
        ["start", "none", "[1 from L0, 1 from L1, 2 from L2]", "empty"],
        ["1", "1 from L0", "[1 from L1, 2 from L2, 4 from L0]", "1"],
        ["2", "1 from L1", "[2 from L2, 3 from L1, 4 from L0]", "1 -> 1"],
        ["3", "2 from L2", "[3 from L1, 4 from L0, 6 from L2]", "1 -> 1 -> 2"],
        ["4", "3 from L1", "[4 from L0, 4 from L1, 6 from L2]", "1 -> 1 -> 2 -> 3"],
        ["5", "4 from L0", "[4 from L1, 5 from L0, 6 from L2]", "1 -> 1 -> 2 -> 3 -> 4"],
        ["6", "4 from L1", "[5 from L0, 6 from L2]", "1 -> 1 -> 2 -> 3 -> 4 -> 4"],
        ["7", "5 from L0", "[6 from L2]", "1 -> 1 -> 2 -> 3 -> 4 -> 4 -> 5"],
        ["8", "6 from L2", "[]", "1 -> 1 -> 2 -> 3 -> 4 -> 4 -> 5 -> 6"],
      ],
      narrativeMD: "Every row removes exactly one node from the heap and appends it to the output. Because the heap always contains the smallest unmerged head from each list, the merged output remains sorted.",
    },
    complexityNote:
      "The heap solution is O(N log k) time and O(k) extra space, excluding the output list that reuses existing nodes.",
    interviewTipsMD:
      "Say the invariant clearly: the heap contains the smallest unmerged node from each list that still has nodes. That invariant proves both correctness and the O(k) space bound. If the interviewer asks for alternatives, mention divide-and-conquer pairwise merging, which also reaches O(N log k) time but uses recursive merge structure instead of a heap.",
    followUps: [
      "How would you solve the same problem with divide-and-conquer pairwise merging?",
      "What changes if the input streams arrive lazily and cannot all be loaded at once?",
      "How would you make the merge stable when equal values appear across different lists?",
      "How would you merge k sorted arrays instead of linked lists?",
    ],
    similarProblems: [
      { title: "Smallest Range Covering Elements from K Lists", difficulty: "Hard", slug: "heap-smallest-range", note: "Uses the same one-active-element-per-list heap invariant." },
      { title: "Kth Largest Element in an Array", difficulty: "Medium", slug: "heap-kth-largest-element", note: "Another problem where a heap keeps only the candidates that matter." },
      { title: "Sliding Window Median", difficulty: "Hard", slug: "heap-sliding-window-median", note: "Maintains ordered frontier elements with heaps under changing membership." },
      { title: "Merge Two Sorted Lists", difficulty: "Easy", url: "https://leetcode.com/problems/merge-two-sorted-lists/", note: "The two-list version of the same sorted merge idea." },
    ],
    keyTakeaways: [
      "For k sorted streams, the next global element must be the smallest current stream head.",
      "A min-heap reduces repeated head selection from O(k) per node to O(log k) per node.",
      "After polling a node, only that node successor can become a new candidate.",
      "A dummy tail keeps linked-list construction simple and avoids first-node edge cases.",
    ],
    pattern:
      "K-way heap merge: keep one current element from each sorted sequence, repeatedly poll the minimum, then advance only the sequence it came from.",
  },
  {
    kind: "problem",
    slug: "heap-smallest-range",
    moduleId: "heap-merge",
    order: 11,
    title: "Smallest Range Covering Elements from K Lists",
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists/",
    tags: ["Heap", "Priority Queue", "K-Way Merge", "Greedy", "Sliding Window"],
    companies: ["Google", "Amazon", "Microsoft", "Meta", "Bloomberg"],
    estimatedReadingMin: 11,
    estimatedSolvingMin: 35,
    statementMD:
      "You are given **k** sorted integer lists. Return the smallest inclusive range **[left, right]** such that at least one number from each list lies inside the range. A range is smaller if it has a shorter length, or if tied, a smaller left endpoint.",
    constraints: [
      "nums.length == k",
      "1 <= k <= 3500",
      "1 <= nums[i].length <= 50",
      "-10^5 <= nums[i][j] <= 10^5",
      "nums[i] is sorted in non-decreasing order",
    ],
    inputMD: "A list of **k** sorted integer lists, where every inner list has at least one value.",
    outputMD: "An integer array **[left, right]** representing the smallest inclusive range that contains at least one value from every list.",
    examples: [
      {
        input: "nums = [[4,10,15,24,26],[0,9,12,20],[5,18,22,30]]",
        output: "[20,24]",
        explanation: "The range includes **24** from the first list, **20** from the second list, and **22** from the third list. No shorter valid range covers all three lists.",
      },
      {
        input: "nums = [[1,2,3],[1,2,3],[1,2,3]]",
        output: "[1,1]",
        explanation: "The value **1** appears in every list, so the zero-width range **[1,1]** already covers all lists.",
      },
    ],
    learningObjectives: [
      "Recognise the range version of k-way merge: keep one active element from each sorted list.",
      "Track a running maximum while the min-heap provides the current minimum.",
      "Explain why advancing the current minimum is the only move that can shrink the active range.",
      "Stop correctly when any list is exhausted because coverage of all lists is no longer possible.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is **k sorted lists** plus a range that must include one element from every list. If you choose one active value from each list, those **k** values define a valid range from their minimum to their maximum. A min-heap can reveal the current minimum, while a running **curMax** remembers the current maximum.\n\nThe key greedy insight is that the only useful move is advancing the list that owns the minimum. The current range is **[min, curMax]**. Advancing any non-minimum element cannot increase the left boundary, so it cannot shrink the range from the left; it can only keep or raise the maximum. To get a tighter range, the minimum must move right, so we poll the minimum and replace it with the next element from that same list.",
    commonMistakes: [
      "Advancing the list with the current maximum, which usually makes the right boundary stay high or move higher without improving the left boundary.",
      "Forgetting to update **curMax** when the pushed next value is larger than every active value seen so far.",
      "Continuing after one list is exhausted, even though the active set no longer covers every list.",
      "Tracking only heap values and not the list index and element index needed to advance the correct list.",
    ],
    algorithmMD:
      "**Key idea**\n\nMaintain exactly one active element from each list. The min-heap is ordered by active value, so its root is the current left boundary. A separate **curMax** is the current right boundary. The active window covers all lists, so it is always a candidate range. After recording it, advance the list that contributed the minimum because that is the only move that can raise the left boundary and possibly shrink the range.\n\n**Heap walkthrough**\n\nFor **nums = [[4,10,15,24,26],[0,9,12,20],[5,18,22,30]]**, initialise with **4 from list 0**, **0 from list 1**, and **5 from list 2**. The heap is **[0 from list 1, 4 from list 0, 5 from list 2]** and **curMax = 5**, so the first candidate is **[0,5]**. Poll the minimum **0** and push **9** from that same list. Now the heap is **[4 from list 0, 5 from list 2, 9 from list 1]** and **curMax = 9**, giving candidate **[4,9]**.\n\nPoll **4** and push **10**, moving **curMax** to **10**. The heap becomes **[5 from list 2, 9 from list 1, 10 from list 0]** and the range is **[5,10]**. Poll **5** and push **18**, so **curMax = 18** and the range widens to **[9,18]**. The process keeps raising the minimum. Eventually the active values become **20 from list 1**, **22 from list 2**, and **24 from list 0**, with **curMax = 24**. The range **[20,24]** is shorter than all previous candidates, so it becomes the answer. Polling **20** would exhaust list 1, so the search stops.\n\n**Algorithm**\n\n1. Create a min-heap of entries containing **value**, **list index**, and **element index**.\n2. Push the first element from every list and set **curMax** to the largest of those first elements.\n3. Initialise the best range from the heap minimum to **curMax**.\n4. While the heap still contains one entry from every list, compare the current range **[heap minimum, curMax]** with the best range.\n5. Poll the heap minimum. If that element has no successor in its list, stop.\n6. Push the successor from the same list and update **curMax** if the successor is larger.\n7. Return the best range recorded.",
    solutions: [
      {
        name: "Min-heap with running maximum",
        whenToUseMD:
          "Use this when every list is sorted and the range must cover all lists simultaneously. It is the standard interview solution because it keeps exactly one active candidate per list.",
        approachMD:
          "Store one entry from each list in a min-heap and track the maximum active value separately. The heap root and **curMax** define the current covering range. After evaluating it, advance the list that owns the minimum and stop as soon as that list has no next value.",
        walkthroughMD:
          "1. Offer the first value from each list into the min-heap, storing its list and element positions.\n2. Track **currentMax** as the largest offered value.\n3. While the heap covers all lists, peek or poll the smallest active value and compare **[smallest, currentMax]** with the best answer.\n4. Advance only the list that supplied the smallest value.\n5. If that list is exhausted, break because a valid range can no longer include every list.\n6. Otherwise offer the next value from that list and update **currentMax**.\n7. Return the best recorded range.",
        complexity: { time: "O(N log k)", space: "O(k)", note: "N total values may each be pushed and polled once, while the heap stores one active value per list." },
        filename: "Solution.java",
        code: `import java.util.*;

class Solution {

    static class Entry {
        int value;
        int listIndex;
        int elementIndex;

        Entry(int value, int listIndex, int elementIndex) {
            this.value = value;
            this.listIndex = listIndex;
            this.elementIndex = elementIndex;
        }
    }

    public int[] smallestRange(List<List<Integer>> nums) {
        PriorityQueue<Entry> minHeap = new PriorityQueue<>((a, b) -> a.value - b.value);
        int currentMax = Integer.MIN_VALUE;

        for (int listIndex = 0; listIndex < nums.size(); listIndex++) {
            int value = nums.get(listIndex).get(0);
            minHeap.offer(new Entry(value, listIndex, 0));
            currentMax = Math.max(currentMax, value);
        }

        int bestStart = minHeap.peek().value;
        int bestEnd = currentMax;

        while (minHeap.size() == nums.size()) {
            Entry smallest = minHeap.poll();

            if (currentMax - smallest.value < bestEnd - bestStart) {
                bestStart = smallest.value;
                bestEnd = currentMax;
            }

            int nextIndex = smallest.elementIndex + 1;
            if (nextIndex == nums.get(smallest.listIndex).size()) {
                break;
            }

            int nextValue = nums.get(smallest.listIndex).get(nextIndex);
            minHeap.offer(new Entry(nextValue, smallest.listIndex, nextIndex));
            currentMax = Math.max(currentMax, nextValue);
        }

        return new int[] { bestStart, bestEnd };
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [[4,10,15,24,26],[0,9,12,20],[5,18,22,30]]. Track one active value from each list, the heap minimum, and **curMax**.",
      columns: ["step", "polled minimum", "heap values after push", "curMax", "best range"],
      rows: [
        ["start", "none", "[0 from L1, 4 from L0, 5 from L2]", "5", "[0,5]"],
        ["1", "0 from L1", "[4 from L0, 5 from L2, 9 from L1]", "9", "[0,5]"],
        ["2", "4 from L0", "[5 from L2, 9 from L1, 10 from L0]", "10", "[0,5]"],
        ["3", "5 from L2", "[9 from L1, 10 from L0, 18 from L2]", "18", "[0,5]"],
        ["4", "9 from L1", "[10 from L0, 12 from L1, 18 from L2]", "18", "[0,5]"],
        ["5", "10 from L0", "[12 from L1, 15 from L0, 18 from L2]", "18", "[0,5]"],
        ["6", "12 from L1", "[15 from L0, 18 from L2, 20 from L1]", "20", "[0,5]"],
        ["7", "15 from L0", "[18 from L2, 20 from L1, 24 from L0]", "24", "[0,5]"],
        ["8", "18 from L2", "[20 from L1, 22 from L2, 24 from L0]", "24", "[20,24]"],
        ["9", "20 from L1", "list L1 exhausted, stop", "24", "[20,24]"],
      ],
      narrativeMD: "The best range only improves when the left boundary has advanced far enough. Once list L1 is exhausted, no future active set can contain one value from every list, so **[20,24]** is final.",
    },
    complexityNote:
      "The active set always has size **k**, so each advancement costs O(log k). Across all values, the total time is O(N log k) and the heap uses O(k) space.",
    interviewTipsMD:
      "Do not present this as a generic sliding window over a flattened array unless you also explain why sorted order by source list matters. The concise proof is the minimum-advance argument: with active values covering every list, moving anything except the minimum cannot improve the left boundary, so the only candidate-changing move that may shrink the range is to advance the list that owns the minimum.",
    followUps: [
      "How would you solve this by flattening all values with their list ids and using a sliding window over the sorted flattened list?",
      "How should ties be handled when two ranges have the same length?",
      "What changes if each list is a lazy stream rather than an in-memory array?",
      "How would you return all minimum-length ranges instead of just one?",
    ],
    similarProblems: [
      { title: "Merge k Sorted Lists", difficulty: "Hard", slug: "heap-merge-k-sorted-lists", note: "Uses the same k-way heap frontier without the running maximum." },
      { title: "K Closest Points to Origin", difficulty: "Medium", slug: "heap-k-closest-points", note: "Another heap problem where only the relevant frontier of candidates is maintained." },
      { title: "Find Median from Data Stream", difficulty: "Hard", slug: "heap-find-median-data-stream", note: "Maintains a dynamic ordered split with heaps instead of a k-way frontier." },
      { title: "Sliding Window Median", difficulty: "Hard", slug: "heap-sliding-window-median", note: "Combines heap ordering with a moving coverage window." },
    ],
    keyTakeaways: [
      "One active value from every list defines a valid covering range.",
      "The min-heap gives the left boundary while **curMax** stores the right boundary.",
      "Advancing the current minimum is the only move that can raise the left boundary and possibly shrink the range.",
      "The search stops when any list is exhausted because coverage of all lists becomes impossible.",
    ],
    pattern:
      "Range over k sorted lists: maintain one active element per list, evaluate [heap minimum, current maximum], then advance only the list that owns the minimum.",
  },
];
