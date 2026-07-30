import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "heap-find-median-data-stream",
    moduleId: "heap-median",
    order: 15,
    title: "Find Median from Data Stream",
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/find-median-from-data-stream/",
    tags: ["Heap", "Priority Queue", "Two Heaps", "Design", "Data Stream"],
    companies: ["Amazon", "Google", "Meta", "Microsoft", "Bloomberg", "Apple"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 30,
    statementMD:
      "Design a **MedianFinder** data structure that receives integers one at a time. **addNum(num)** adds a number from the stream, and **findMedian()** returns the median of all numbers seen so far. If the count is even, the median is the average of the two middle numbers.",
    constraints: [
      "-10^5 <= num <= 10^5",
      "At most 5 * 10^4 calls will be made to addNum and findMedian",
      "At least one number has been added before findMedian is called",
    ],
    inputMD: "A constructor call **MedianFinder()** followed by a sequence of **addNum(num)** and **findMedian()** calls.",
    outputMD: "For the constructor and **addNum**, output **null**. For **findMedian**, output the current median as a double.",
    examples: [
      {
        input: "operations = [MedianFinder, addNum, addNum, findMedian, addNum, findMedian], arguments = [[], [1], [2], [], [3], []]",
        output: "[null, null, null, 1.5, null, 2.0]",
        explanation: "After adding 1 and 2, the median is the average 1.5. After adding 3, the sorted values are [1,2,3], so the median is 2.",
      },
      {
        input: "operations = [MedianFinder, addNum, findMedian, addNum, addNum, findMedian], arguments = [[], [5], [], [15], [1], []]",
        output: "[null, null, 5.0, null, null, 5.0]",
        explanation: "A single value has median 5. After adding 15 and 1, the values are [1,5,15], so the middle value is still 5.",
      },
    ],
    learningObjectives: [
      "Recognise the running-median signal in a data stream problem.",
      "Split values into a lower half max-heap and an upper half min-heap.",
      "Maintain ordering and size invariants after every insertion.",
      "Compute an odd or even median directly from heap roots in O(1).",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is a stream of numbers with repeated median queries. Sorting after every insertion is too expensive, and inserting into the middle of an array shifts many elements. The median only needs the boundary between the smaller half and the larger half, not a fully sorted list.\n\nUse two heaps split around that boundary. A max-heap named **low** stores the lower half so its root is the largest small value. A min-heap named **high** stores the upper half so its root is the smallest large value. If the halves are balanced, those one or two roots are exactly the median candidates.",
    commonMistakes: [
      "Keeping one sorted list and paying O(n) insertion for every **addNum**.",
      "Letting one heap grow by more than one element, which moves the root away from the median boundary.",
      "Putting the larger half in a max-heap or the lower half in a min-heap, then peeking at the wrong boundary.",
      "Averaging two integer roots before converting to double, which can truncate or overflow on related variants.",
    ],
    algorithmMD:
      "**Key idea**\n\nKeep two heaps with two precise invariants. First, every value in **low** is less than or equal to every value in **high**. Second, **low.size()** is either equal to **high.size()** or exactly one larger. This implementation lets **low** hold the extra value when the count is odd. Therefore **findMedian()** returns **low.peek()** for odd counts, and the average of **low.peek()** and **high.peek()** for even counts. More generally, the median is the root of the larger heap or the average of both roots when sizes match.\n\n**Heap walkthrough**\n\nTrace the stream **[5,15,1,3]**. Add 5 into **low**, so **low = [5]**, **high = []**, and the median is 5. Add 15 into **high**, giving **low = [5]**, **high = [15]**, so the median is the average of the two roots. Add 1 into **low** because it belongs to the smaller half; now **low = [5,1]**, **high = [15]**, and the median is the root 5. Add 3 into **low**, making it too large: **low = [5,1,3]**, **high = [15]**. Rebalance by moving root 5 from **low** to **high**, leaving **low = [3,1]**, **high = [5,15]**, so the median is **(3 + 5) / 2 = 4**.\n\n**Algorithm**\n\n1. Store the lower half in a max-heap **low** and the upper half in a min-heap **high**.\n2. For **addNum(num)**, insert into **low** if **low** is empty or **num <= low.peek()**; otherwise insert into **high**.\n3. If **low** has more than one extra element, move **low.peek()** to **high**.\n4. If **high** has more elements than **low**, move **high.peek()** to **low**.\n5. For **findMedian()**, return **low.peek()** when **low** is larger; otherwise return the double average of the two roots.",
    solutions: [
      {
        name: "Two heaps with balanced halves",
        whenToUseMD:
          "Use this when numbers arrive online and every query must be answered without re-sorting the full prefix.",
        approachMD:
          "The max-heap **low** exposes the largest value in the lower half, while the min-heap **high** exposes the smallest value in the upper half. Rebalancing after each insert keeps the median at one or two roots.",
        walkthroughMD:
          "1. Initialise **low** as a max-heap and **high** as a min-heap.\n2. Insert each new number into the heap whose half it belongs to by comparing against **low.peek()**.\n3. Move one root across if the size invariant is broken.\n4. When asked for the median, use **low.peek()** if the total count is odd.\n5. When the heaps are equal in size, return the double average of both roots.",
        complexity: {
          time: "addNum: O(log n), findMedian: O(1)",
          space: "O(n)",
          note: "Each inserted number lives in exactly one heap; rebalancing moves at most one root.",
        },
        filename: "MedianFinder.java",
        code: `import java.util.*;

class MedianFinder {
    private final PriorityQueue<Integer> low;
    private final PriorityQueue<Integer> high;

    public MedianFinder() {
        low = new PriorityQueue<>(Collections.reverseOrder());
        high = new PriorityQueue<>();
    }

    public void addNum(int num) {
        if (low.isEmpty() || num <= low.peek()) {
            low.offer(num);
        } else {
            high.offer(num);
        }

        if (low.size() > high.size() + 1) {
            high.offer(low.poll());
        } else if (high.size() > low.size()) {
            low.offer(high.poll());
        }
    }

    public double findMedian() {
        if (low.size() == high.size()) {
            return ((double) low.peek() + (double) high.peek()) / 2.0;
        }
        return low.peek();
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "Stream: **addNum(5)**, **addNum(15)**, **addNum(1)**, **addNum(3)**. Heaps are shown with their root first.",
      columns: ["op", "low", "high", "median"],
      rows: [
        ["addNum(5)", "[5]", "[]", "5.0"],
        ["addNum(15)", "[5]", "[15]", "10.0"],
        ["addNum(1)", "[5,1]", "[15]", "5.0"],
        ["addNum(3)", "[3,1]", "[5,15]", "4.0"],
      ],
      narrativeMD: "After the final insertion, rebalancing moved 5 to **high**, so the two roots 3 and 5 frame the middle and average to **4.0**.",
    },
    complexityNote:
      "The data structure pays logarithmic time only when changing the heaps; median queries are root reads.",
    interviewTipsMD:
      "Say the invariants before coding: **low** contains the lower half, **high** contains the upper half, every **low** value is <= every **high** value, and sizes differ by at most one. Then the median formula becomes obvious. Use a safe average expression in Java even if this problem's value range is small, because interviewers often widen the range in follow-ups.",
    followUps: [
      "How would you remove an arbitrary old value when the stream becomes a sliding window?",
      "How would the design change if you needed the 25th percentile instead of the median?",
      "Could a balanced binary search tree replace the two heaps?",
      "How would you make **findMedian()** thread-safe while insertions continue?",
    ],
    similarProblems: [
      { title: "Sliding Window Median", difficulty: "Hard", slug: "heap-sliding-window-median", note: "Adds deletions to the same two-heap median boundary." },
      { title: "Kth Largest Element in an Array", difficulty: "Medium", slug: "heap-kth-largest-element", note: "Also keeps only the boundary element needed for an order statistic." },
      { title: "Merge k Sorted Lists", difficulty: "Hard", slug: "heap-merge-k-sorted-lists", note: "Uses heap roots as the next important boundary among many ordered sources." },
      { title: "IPO", difficulty: "Hard", slug: "heap-ipo", note: "Another problem where a heap exposes the best currently available candidate." },
    ],
    keyTakeaways: [
      "A running median does not require fully sorting every prefix.",
      "The lower half needs a max-heap and the upper half needs a min-heap.",
      "The size invariant is what keeps the median at one or two roots.",
      "Insertions are O(log n), while median queries are O(1).",
    ],
    pattern:
      "Two heaps split around the middle: keep lower values in a max-heap, upper values in a min-heap, rebalance sizes, and read the median from the roots.",
  },
  {
    kind: "problem",
    slug: "heap-sliding-window-median",
    moduleId: "heap-median",
    order: 16,
    title: "Sliding Window Median",
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/sliding-window-median/",
    tags: ["Heap", "Priority Queue", "Two Heaps", "Sliding Window", "Lazy Deletion"],
    companies: ["Google", "Amazon", "Meta", "Microsoft", "Bloomberg", "Apple"],
    estimatedReadingMin: 12,
    estimatedSolvingMin: 40,
    statementMD:
      "Given an integer array **nums** and an integer **k**, move a window of size **k** from left to right across the array. Return an array where each entry is the median of the current window. If **k** is even, the median is the average of the two middle values.",
    constraints: [
      "1 <= k <= nums.length <= 10^5",
      "-2^31 <= nums[i] <= 2^31 - 1",
    ],
    inputMD: "An integer array **nums** and a window size **k**.",
    outputMD: "A double array containing the median for every contiguous window of length **k**, in left-to-right order.",
    examples: [
      {
        input: "nums = [1,3,-1,-3,5,3,6,7], k = 3",
        output: "[1.0,-1.0,-1.0,3.0,5.0,6.0]",
        explanation: "The first window [1,3,-1] has median 1. As the window slides, each outgoing value is removed logically and each incoming value is added before reading the next median.",
      },
      {
        input: "nums = [1,2,3,4], k = 2",
        output: "[1.5,2.5,3.5]",
        explanation: "Every window has two values, so each median is the average of its two sorted middle values.",
      },
    ],
    learningObjectives: [
      "Extend the two-heaps median pattern from a growing stream to a fixed-size window.",
      "Use lazy deletion to avoid O(k) arbitrary removal from Java **PriorityQueue**.",
      "Maintain logical heap sizes separately from physical heap contents.",
      "Compute even-length medians with **long** or **double** arithmetic to avoid integer overflow.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe prompt combines two signals: median queries and a sliding window. The median signal suggests the same lower-half max-heap and upper-half min-heap split. The sliding-window signal adds deletion, because the oldest value leaves when a new value enters.\n\nThe trap is calling **PriorityQueue.remove(value)** on every slide. That searches the heap linearly, destroying the intended complexity. Lazy deletion fixes this: when a value leaves the window, record it in a delayed-removal map and decrement the logical size of the heap it belongs to. The actual heap node is removed only when it reaches the root, right before a root would be trusted for a rebalance or median.",
    commonMistakes: [
      "Using **PriorityQueue.remove(value)** for the outgoing element, which costs O(k) per slide.",
      "Counting stale delayed elements in heap sizes after they have left the window logically.",
      "Reading **peek()** without first pruning delayed roots from that heap.",
      "Averaging two **int** roots directly, which can overflow before becoming a double.",
    ],
    algorithmMD:
      "**Key idea**\n\nUse **low**, a max-heap for the lower half of the current window, and **high**, a min-heap for the upper half. Track **lowSize** and **highSize** as counts of valid window elements, excluding values scheduled in the delayed-removal map. The invariant after every slide is **lowSize >= highSize** and **lowSize - highSize <= 1**. For odd **k**, **low** holds one extra valid value and its root is the median. For even **k**, average the two roots using **long** or **double** arithmetic. A TreeMap or two-multiset approach can also remove by key in O(log k), but lazy deletion keeps the implementation close to the PriorityQueue version of running median.\n\n**Heap walkthrough**\n\nUse **nums = [1,3,-1,-3,5,3]** and **k = 3**. Build the first window by adding 1, 3, and -1: **low = [1,-1]**, **high = [3]**, median 1. Slide right by adding -3; it enters **low**, then root 1 moves to **high** because **low** is too large: **low = [-1,-3]**, **high = [1,3]**. Now outgoing 1 is scheduled in the delayed map. Since it is at the **high** root, prune it immediately, leaving **high = [3]** and median -1. Next add 5 into **high**, then schedule outgoing 3. Because 3 is the **high** root, prune it and keep **low = [-1,-3]**, **high = [5]**, median -1. Next add 3 into **high** and schedule outgoing -1. The outgoing -1 is at the **low** root, so pruning removes it, then rebalancing moves 3 from **high** to **low**. The heaps become **low = [3,-3]**, **high = [5]**, median 3.\n\n**Algorithm**\n\n1. Initialise **low**, **high**, a **delayed** count map, and logical sizes **lowSize** and **highSize**.\n2. Add the first **k** numbers with the normal two-heap insertion and rebalance after each add.\n3. Record the first median from the valid heap roots.\n4. For each next index, add the incoming value, then schedule the outgoing value in **delayed**.\n5. Decrement **lowSize** if the outgoing value is <= **low.peek()**, otherwise decrement **highSize**.\n6. Prune a heap while its root has a positive delayed count.\n7. Rebalance until **lowSize >= highSize** and **lowSize - highSize <= 1**, pruning roots after moving between heaps.\n8. Record the next median from **low.peek()** or the average of both roots.",
    solutions: [
      {
        name: "Two heaps with lazy deletion",
        whenToUseMD:
          "Use this when the language heap supports fast root removal but not fast arbitrary deletion. In Java, **PriorityQueue** needs the delayed map to keep every slide logarithmic amortized.",
        approachMD:
          "The structure is the running-median design plus a delayed-removal map. Values that leave the window are marked stale and removed only when they reach the top of a heap. Logical sizes drive balancing; physical heap sizes may temporarily include stale values below the root.",
        walkthroughMD:
          "1. Add the first **k** values using the same two-heap insertion as MedianFinder.\n2. For each slide, add the incoming value and mark the outgoing value in **delayed**.\n3. Decide which logical size to decrement by comparing the outgoing value with **low.peek()**.\n4. Prune delayed roots from any heap before trusting its root.\n5. Rebalance by moving roots until **low** has either the same valid size as **high** or one extra valid value.\n6. Write the median as **low.peek()** for odd **k**, or as **((long) low.peek() + (long) high.peek()) / 2.0** for even **k**.",
        complexity: {
          time: "O(n log k)",
          space: "O(k) logical window state, O(n) worst-case lazy heap storage",
          note: "Each add and root move costs O(log k) logically; stale values are pruned when they surface at a root.",
        },
        filename: "Solution.java",
        code: `import java.util.*;

class Solution {
    private PriorityQueue<Integer> low;
    private PriorityQueue<Integer> high;
    private Map<Integer, Integer> delayed;
    private int lowSize;
    private int highSize;

    public double[] medianSlidingWindow(int[] nums, int k) {
        low = new PriorityQueue<>(Collections.reverseOrder());
        high = new PriorityQueue<>();
        delayed = new HashMap<>();
        lowSize = 0;
        highSize = 0;

        for (int index = 0; index < k; index++) {
            add(nums[index]);
        }

        double[] medians = new double[nums.length - k + 1];
        medians[0] = median(k);

        int outputIndex = 1;
        for (int index = k; index < nums.length; index++) {
            add(nums[index]);
            remove(nums[index - k]);
            medians[outputIndex] = median(k);
            outputIndex++;
        }

        return medians;
    }

    private void add(int num) {
        if (low.isEmpty() || num <= low.peek()) {
            low.offer(num);
            lowSize++;
        } else {
            high.offer(num);
            highSize++;
        }
        rebalance();
    }

    private void remove(int num) {
        delayed.put(num, delayed.getOrDefault(num, 0) + 1);

        if (!low.isEmpty() && num <= low.peek()) {
            lowSize--;
            if (num == low.peek()) {
                prune(low);
            }
        } else {
            highSize--;
            if (!high.isEmpty() && num == high.peek()) {
                prune(high);
            }
        }

        rebalance();
    }

    private void rebalance() {
        if (lowSize > highSize + 1) {
            high.offer(low.poll());
            lowSize--;
            highSize++;
            prune(low);
        } else if (lowSize < highSize) {
            low.offer(high.poll());
            highSize--;
            lowSize++;
            prune(high);
        }
    }

    private void prune(PriorityQueue<Integer> heap) {
        while (!heap.isEmpty()) {
            int num = heap.peek();
            Integer count = delayed.get(num);
            if (count == null) {
                return;
            }

            if (count == 1) {
                delayed.remove(num);
            } else {
                delayed.put(num, count - 1);
            }
            heap.poll();
        }
    }

    private double median(int k) {
        if (k % 2 == 1) {
            return low.peek();
        }
        return ((long) low.peek() + (long) high.peek()) / 2.0;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [1,3,-1,-3,5,3], k = 3. Heaps show valid values after pruning delayed roots, with **low** allowed one extra value.",
      columns: ["op", "low", "high", "median"],
      rows: [
        ["add 1", "[1]", "[]", "window incomplete"],
        ["add 3", "[1]", "[3]", "window incomplete"],
        ["add -1", "[1,-1]", "[3]", "1.0"],
        ["add -3, remove 1", "[-1,-3]", "[3]", "-1.0"],
        ["add 5, remove 3", "[-1,-3]", "[5]", "-1.0"],
        ["add 3, remove -1", "[3,-3]", "[5]", "3.0"],
      ],
      narrativeMD: "The delayed map lets removal wait until a stale value reaches a heap root. Each recorded median is read only after pruning and rebalancing restore the valid two-heap split.",
    },
    complexityNote:
      "Lazy deletion preserves logarithmic slide operations while acknowledging that Java heaps may temporarily contain stale values below the root.",
    interviewTipsMD:
      "Separate physical heap contents from logical window contents. The interviewer wants to hear that **lowSize** and **highSize** ignore delayed values, and that **peek()** is safe only after pruning stale roots. Also mention the balanced-tree alternative: two TreeMaps or multisets remove outgoing values directly in O(log k), often with cleaner space bounds but more bookkeeping.",
    followUps: [
      "How would a TreeMap-based two-multiset solution differ from lazy deletion?",
      "How would you support a variable window size where **k** changes over time?",
      "How would you return the lower median instead of the average for even windows?",
      "How would you handle a stream so large that stale heap entries must be periodically compacted?",
    ],
    similarProblems: [
      { title: "Find Median from Data Stream", difficulty: "Hard", slug: "heap-find-median-data-stream", note: "The base two-heap median structure before deletions are added." },
      { title: "Kth Largest Element in an Array", difficulty: "Medium", slug: "heap-kth-largest-element", note: "Another order-statistic problem solved by maintaining a heap boundary." },
      { title: "K Closest Points to Origin", difficulty: "Medium", slug: "heap-k-closest-points", note: "Uses heap size control while scanning a sequence." },
      { title: "Merge k Sorted Lists", difficulty: "Hard", slug: "heap-merge-k-sorted-lists", note: "Practices trusting only heap roots as the next ordered boundary." },
    ],
    keyTakeaways: [
      "Sliding-window median is running median plus deletion.",
      "Java **PriorityQueue** needs lazy deletion because arbitrary removal is not logarithmic.",
      "Logical heap sizes, not physical sizes, maintain the balance invariant.",
      "Use **long** or **double** before averaging two roots to avoid overflow.",
    ],
    pattern:
      "Sliding two heaps with lazy deletion: add the incoming value, mark the outgoing value delayed, prune stale roots, rebalance valid sizes, and read the median from the roots.",
  },
];
