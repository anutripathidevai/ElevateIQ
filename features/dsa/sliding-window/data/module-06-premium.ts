import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "sw-sliding-window-maximum",
    moduleId: "sw-premium",
    order: 22,
    title: "Sliding Window Maximum",
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/sliding-window-maximum/",
    tags: ["Sliding Window", "Monotonic Queue", "Deque", "Array", "Data Structures"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 28,
    statementMD:
      "You are given an integer array **nums** and an integer **k**. A sliding window of size **k** moves from the left side of the array to the right side, one index at a time. Return the maximum value in each window.",
    constraints: [
      "1 <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4",
      "1 <= k <= nums.length",
    ],
    inputMD: "An integer array **nums** and an integer **k**, the fixed window length.",
    outputMD: "An integer array where each element is the maximum value for one contiguous window of length **k**.",
    examples: [
      { input: "nums = [1,3,-1,-3,5,3,6,7], k = 3", output: "[3,3,5,5,6,7]", explanation: "The windows are **[1,3,-1]**, **[3,-1,-3]**, **[-1,-3,5]**, **[-3,5,3]**, **[5,3,6]**, and **[3,6,7]**. Their maximums are **3, 3, 5, 5, 6, 7**." },
      { input: "nums = [1], k = 1", output: "[1]", explanation: "There is only one window and its maximum is **1**." },
      { input: "nums = [9,11], k = 2", output: "[11]", explanation: "The single window contains both values, and **11** is the maximum." },
    ],
    learningObjectives: [
      "Recognise when a fixed-size window needs the best value under constant movement.",
      "Maintain a monotonic decreasing deque of candidate maximum indices.",
      "Explain why dominated values can be discarded permanently from the back of the deque.",
      "Handle stale indices cleanly as the left edge of the window advances.",
    ],
    intuitionMD:
      "This is a fixed-size sliding window problem, but the expensive part is not moving the window. The expensive part is repeatedly asking for the maximum inside it. Recomputing that maximum by scanning each window loses the core pattern and can degrade to quadratic work.\n\nThe pattern identification is a monotonic deque. The deque stores indices, not only values, because indices tell us when a candidate leaves the window. Values inside the deque are kept in decreasing order, so the front is always the current maximum. When a new value arrives, every smaller value behind it becomes useless: the new value is larger and will stay in the window longer. That is the key interview insight.",
    commonMistakes: [
      "Storing values instead of indices, which makes it hard to know when a value leaves the window.",
      "Removing stale indices only after reading the maximum, causing expired values to appear in the answer.",
      "Keeping smaller values behind a new larger value even though they can never become maximum while the new value is present.",
      "Using a deque in increasing order by accident and reading the minimum instead of the maximum.",
    ],
    algorithmMD:
      "**Window setup**\n\nKeep a deque of indices whose corresponding values are in decreasing order from front to back. The front index is the maximum for the current window. The current window ending at **right** starts at **right - k + 1** once the first full window exists.\n\n**Window visualization**\n\nFor **nums = [1,3,-1,-3,5,3,6,7]** and **k = 3**, start with index **0** in the deque as **[0:1]**. When index **1** with value **3** arrives, value **1** is smaller and sits behind a newer larger value, so it is popped and the deque becomes **[1:3]**. Index **2** with value **-1** is added behind **3**, producing the first output **3**. At index **4**, the old index **1** has left the window and the new value **5** removes **-1** and **-3** from the back, leaving **[4:5]**. The deque is always the compressed list of possible maximums.\n\n**Algorithm**\n\n1. Create an empty deque of indices and an answer array of size **n - k + 1**.\n2. For each index **right**, first remove deque front indices that are outside the current window.\n3. While the deque back points to a value less than or equal to **nums[right]**, remove it because the new value dominates it.\n4. Add **right** to the deque back.\n5. Once **right >= k - 1**, write **nums[deque front]** into the next answer slot.\n6. Return the answer array.",
    solutions: [
      {
        name: "Monotonic decreasing deque",
        approachMD:
          "The deque stores only candidates that can still become a window maximum. It removes stale indices from the front and removes dominated smaller values from the back, so each index is inserted once and removed at most once.",
        walkthroughMD:
          "1. Allocate the result array with one slot per full window.\n2. Sweep **right** from **0** to **n - 1**.\n3. Remove any deque front index that is more than **k** positions behind **right**.\n4. Pop from the back while the incoming value is greater than or equal to the stored back value.\n5. Push the incoming index.\n6. After the first full window forms, read the maximum from the deque front.",
        complexity: { time: "O(n)", space: "O(k)", note: "Every index enters and leaves the deque at most once, and the deque holds only current-window candidates." },
        filename: "Solution.java",
        code: `import java.util.ArrayDeque;

class Solution {

    public int[] maxSlidingWindow(int[] nums, int k) {
        int n = nums.length;
        int[] result = new int[n - k + 1];
        ArrayDeque<Integer> decreasing = new ArrayDeque<>();

        for (int right = 0; right < n; right++) {
            while (!decreasing.isEmpty() && decreasing.peekFirst() <= right - k) {
                decreasing.pollFirst();
            }

            while (!decreasing.isEmpty() && nums[decreasing.peekLast()] <= nums[right]) {
                decreasing.pollLast();
            }

            decreasing.offerLast(right);

            if (right >= k - 1) {
                result[right - k + 1] = nums[decreasing.peekFirst()];
            }
        }

        return result;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [1,3,-1,-3,5,3,6,7], k = 3. Trace the decreasing deque of **index:value** pairs after each right index is processed.",
      columns: ["right", "nums[right]", "left boundary", "deque after processing", "output appended"],
      rows: [
        ["0", "1", "0", "[0:1]", "none"],
        ["1", "3", "0", "[1:3]", "none"],
        ["2", "-1", "0", "[1:3, 2:-1]", "3"],
        ["3", "-3", "1", "[1:3, 2:-1, 3:-3]", "3"],
        ["4", "5", "2", "[4:5]", "5"],
        ["5", "3", "3", "[4:5, 5:3]", "5"],
        ["6", "6", "4", "[6:6]", "6"],
        ["7", "7", "5", "[7:7]", "7"],
      ],
      narrativeMD: "The output values are collected exactly when a full window exists: **[3,3,5,5,6,7]**. The deque never stores an index that is outside the current window or dominated by a newer larger value.",
    },
    interviewTipsMD:
      "Name the invariant early: indices in the deque are inside the window, and their values decrease from front to back. That one sentence explains why the front is the maximum and why back removals are safe. A max-heap can also solve the problem in **O(n log n)** with lazy removal, but the monotonic deque is the expected premium answer because it is linear.",
    followUps: [
      "How would you return the minimum for each window instead?",
      "How would you support both maximum and minimum queries for the same moving window?",
      "What changes if the window size varies instead of staying fixed?",
      "How would a heap-based solution remove stale indices lazily?",
    ],
    similarProblems: [
      { title: "Longest Continuous Subarray with Absolute Diff Less Than or Equal to Limit", difficulty: "Medium", slug: "sw-longest-continuous-subarray-absolute-diff-limit", note: "Uses two monotonic deques to maintain both extremes of a variable window." },
      { title: "Minimum Window Substring", difficulty: "Hard", slug: "sw-minimum-window-substring", note: "Another advanced window where compact state replaces rescanning." },
      { title: "Max Consecutive Ones III", difficulty: "Medium", slug: "sw-max-consecutive-ones-iii", note: "A variable-window version where validity is maintained while the boundary moves." },
      { title: "Sliding Window Median", difficulty: "Hard", url: "https://leetcode.com/problems/sliding-window-median/", note: "Maintains an order statistic instead of only the maximum." },
    ],
    keyTakeaways: [
      "A monotonic deque is the linear-time structure for fixed-window maximums.",
      "Store indices so stale candidates can be removed as the window moves.",
      "A new larger value permanently dominates smaller values behind it.",
      "The deque front is always the answer for the current full window.",
    ],
    pattern:
      "For each fixed-size window, keep candidate extremes in a monotonic deque, evict stale indices from the front, and evict dominated values from the back.",
  },
  {
    kind: "problem",
    slug: "sw-longest-continuous-subarray-absolute-diff-limit",
    moduleId: "sw-premium",
    order: 23,
    title: "Longest Continuous Subarray with Absolute Diff Less Than or Equal to Limit",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit/",
    tags: ["Sliding Window", "Monotonic Queue", "Deque", "Two Pointers", "Array"],
    companies: ["Google", "Amazon", "Microsoft", "Meta", "Bloomberg"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 25,
    statementMD:
      "Given an integer array **nums** and an integer **limit**, return the size of the longest non-empty contiguous subarray such that the absolute difference between any two elements in that subarray is less than or equal to **limit**.",
    constraints: [
      "1 <= nums.length <= 10^5",
      "1 <= nums[i] <= 10^9",
      "0 <= limit <= 10^9",
    ],
    inputMD: "An integer array **nums** and an integer **limit** that bounds the allowed difference between the window maximum and minimum.",
    outputMD: "An integer: the maximum length of a contiguous subarray whose largest and smallest values differ by at most **limit**.",
    examples: [
      { input: "nums = [8,2,4,7], limit = 4", output: "2", explanation: "The longest valid subarrays have length **2**, such as **[2,4]** and **[4,7]**. The full window would have max-min **8 - 2 = 6**, which is too large." },
      { input: "nums = [10,1,2,4,7,2], limit = 5", output: "4", explanation: "The subarray **[2,4,7,2]** has maximum **7**, minimum **2**, and difference **5**, so length **4** is valid." },
      { input: "nums = [4,2,2,2,4,4,2,2], limit = 0", output: "3", explanation: "With limit **0**, every value in the window must be equal. The longest equal run is **[2,2,2]**." },
    ],
    learningObjectives: [
      "Recognise that checking every pair is unnecessary because only the window maximum and minimum matter.",
      "Maintain two monotonic deques to read max and min in constant amortized time.",
      "Shrink the left boundary only while the current window violates **max - min <= limit**.",
      "Explain why a variable window remains valid after removing enough leftmost elements.",
    ],
    intuitionMD:
      "The phrase absolute difference between any two elements sounds like many pairwise checks, but inside a window the worst pair is always the maximum and the minimum. Therefore the validity test is just **current max - current min <= limit**.\n\nThis is a variable-size sliding window: expand right to search for longer answers, and shrink left only when the max-min range becomes too large. The hard part is maintaining both extremes while values enter and leave. A decreasing deque gives the maximum, and an increasing deque gives the minimum. Together they make each validity check constant amortized time.",
    commonMistakes: [
      "Checking adjacent differences instead of the difference between the window maximum and minimum.",
      "Using only one deque and losing the opposite extreme needed for the validity test.",
      "Shrinking the window once when invalid instead of continuing until **max - min <= limit** again.",
      "Removing deque fronts by value rather than by index, which breaks when duplicate values appear.",
    ],
    algorithmMD:
      "**Window setup**\n\nMaintain **left**, a decreasing max-deque of indices, and an increasing min-deque of indices. The max-deque front points to the largest value in the current window. The min-deque front points to the smallest value. The window is valid exactly when their value difference is at most **limit**.\n\n**Window visualization**\n\nFor **nums = [10,1,2,4,7,2]** and **limit = 5**, index **0** gives max **10** and min **10**. Adding **1** makes the range **9**, so the window is invalid and **left** moves past **10**. The window grows through **[1,2,4]** with range **3**. Adding **7** gives **[1,2,4,7]** with range **6**, so **left** moves past **1** and the valid window becomes **[2,4,7]**. Adding the final **2** keeps max **7** and min **2**, producing **[2,4,7,2]** of length **4**.\n\n**Algorithm**\n\n1. Initialise **left = 0**, **best = 0**, and two empty deques of indices.\n2. For each **right**, insert it into the max-deque after removing smaller or equal values from the back.\n3. Insert it into the min-deque after removing larger or equal values from the back.\n4. While the current max minus current min exceeds **limit**, remove **left** from deque fronts if present, then increment **left**.\n5. Update **best** with the current valid window length **right - left + 1**.\n6. Return **best**.",
    solutions: [
      {
        name: "Two monotonic deques",
        approachMD:
          "Use one deque to summarize the maximum and another to summarize the minimum. The window may expand optimistically, but whenever the range exceeds **limit**, move **left** until both deques again describe a valid window.",
        walkthroughMD:
          "1. Keep the max-deque decreasing by value, so its front is the maximum.\n2. Keep the min-deque increasing by value, so its front is the minimum.\n3. After inserting **right**, test the current range with the two deque fronts.\n4. If the range is too large, advance **left** and discard any deque front equal to the old **left** index.\n5. Once valid, record the longest length seen.",
        complexity: { time: "O(n)", space: "O(n)", note: "Each index is pushed and popped from each deque at most once. In the worst case a deque can hold many window indices." },
        filename: "Solution.java",
        code: `import java.util.ArrayDeque;

class Solution {

    public int longestSubarray(int[] nums, int limit) {
        ArrayDeque<Integer> maxDeque = new ArrayDeque<>();
        ArrayDeque<Integer> minDeque = new ArrayDeque<>();
        int left = 0;
        int best = 0;

        for (int right = 0; right < nums.length; right++) {
            while (!maxDeque.isEmpty() && nums[maxDeque.peekLast()] <= nums[right]) {
                maxDeque.pollLast();
            }
            maxDeque.offerLast(right);

            while (!minDeque.isEmpty() && nums[minDeque.peekLast()] >= nums[right]) {
                minDeque.pollLast();
            }
            minDeque.offerLast(right);

            while (nums[maxDeque.peekFirst()] - nums[minDeque.peekFirst()] > limit) {
                if (maxDeque.peekFirst() == left) {
                    maxDeque.pollFirst();
                }
                if (minDeque.peekFirst() == left) {
                    minDeque.pollFirst();
                }
                left++;
            }

            best = Math.max(best, right - left + 1);
        }

        return best;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [10,1,2,4,7,2], limit = 5. Trace both deques as **index:value** pairs after inserting **right** and shrinking until the window is valid.",
      columns: ["right", "nums[right]", "left after shrink", "max deque", "min deque", "best length"],
      rows: [
        ["0", "10", "0", "[0:10]", "[0:10]", "1"],
        ["1", "1", "1", "[1:1]", "[1:1]", "1"],
        ["2", "2", "1", "[2:2]", "[1:1, 2:2]", "2"],
        ["3", "4", "1", "[3:4]", "[1:1, 2:2, 3:4]", "3"],
        ["4", "7", "2", "[4:7]", "[2:2, 3:4, 4:7]", "3"],
        ["5", "2", "2", "[4:7, 5:2]", "[5:2]", "4"],
      ],
      narrativeMD: "The best valid window is **[2,4,7,2]** from indices **2** through **5**. Its maximum is **7**, its minimum is **2**, and the difference is exactly **5**.",
    },
    interviewTipsMD:
      "Reduce the condition to the extremes before discussing data structures. Interviewers want to hear that the pairwise absolute difference requirement is equivalent to bounding **max - min**. Then describe the two deque invariants. If asked for alternatives, a balanced tree or multiset also works in **O(n log n)**, but the two-deque version is the linear sliding-window answer.",
    followUps: [
      "How would you return the actual subarray instead of only its length?",
      "How would the solution change if negative values were allowed?",
      "What if the limit changed for every right index?",
      "Can you solve it with a TreeMap, and what complexity would that have?",
    ],
    similarProblems: [
      { title: "Sliding Window Maximum", difficulty: "Hard", slug: "sw-sliding-window-maximum", note: "The same monotonic-deque maximum idea appears as one half of this solution." },
      { title: "Fruit Into Baskets", difficulty: "Medium", slug: "sw-fruit-into-baskets", note: "Another longest valid window where the constraint is summarized by compact state." },
      { title: "Max Consecutive Ones III", difficulty: "Medium", slug: "sw-max-consecutive-ones-iii", note: "Shrinks the left boundary while a validity budget is exceeded." },
      { title: "Contains Duplicate III", difficulty: "Medium", url: "https://leetcode.com/problems/contains-duplicate-iii/", note: "Also combines a sliding window with ordered value constraints." },
    ],
    keyTakeaways: [
      "For any window, the largest absolute pair difference is **max - min**.",
      "Two monotonic deques maintain both extremes in linear time.",
      "Expand right first, then shrink left until the window becomes valid again.",
      "Duplicate values are safest when tracked by index, not by value alone.",
    ],
    pattern:
      "For a longest window constrained by max-min, maintain decreasing and increasing deques, shrink while the range is invalid, and record the best valid length.",
  },
  {
    kind: "problem",
    slug: "sw-minimum-operations-to-reduce-x-to-zero",
    moduleId: "sw-premium",
    order: 24,
    title: "Minimum Operations to Reduce X to Zero",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/minimum-operations-to-reduce-x-to-zero/",
    tags: ["Sliding Window", "Prefix Sum", "Two Pointers", "Array", "Reframing"],
    companies: ["Amazon", "Microsoft", "Google", "Meta", "Adobe"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 22,
    statementMD:
      "You are given an integer array **nums** and an integer **x**. In one operation, remove either the leftmost or rightmost element from **nums** and subtract its value from **x**. Return the minimum number of operations needed to reduce **x** exactly to **0**. If it is impossible, return **-1**.",
    constraints: [
      "1 <= nums.length <= 10^5",
      "1 <= nums[i] <= 10^4",
      "1 <= x <= 10^9",
    ],
    inputMD: "An integer array **nums** of positive values and an integer **x** to remove from the two ends.",
    outputMD: "An integer: the fewest end-removal operations that make **x** exactly **0**, or **-1** if no such removal sequence exists.",
    examples: [
      { input: "nums = [1,1,4,2,3], x = 5", output: "2", explanation: "Remove **2** and **3** from the right. Equivalently, keep the longest middle subarray **[1,1,4]** with sum **6**." },
      { input: "nums = [5,6,7,8,9], x = 4", output: "-1", explanation: "Every number is greater than **4**, and no combination of end removals can sum exactly to **4**." },
      { input: "nums = [3,2,20,1,1,3], x = 10", output: "5", explanation: "The best plan keeps the middle subarray **[20]**. The removed values sum to **10**, so **5** operations are required." },
    ],
    learningObjectives: [
      "Reframe end removals as keeping one contiguous middle subarray.",
      "Convert minimum removals into maximum kept length.",
      "Use the positivity of **nums** to find the longest subarray with a target sum by sliding window.",
      "Handle impossible, remove-all, and exact-target cases without special-case confusion.",
    ],
    intuitionMD:
      "The direct view is awkward because each operation can happen on either end, creating many prefix-suffix combinations. The reframing trick is to look at what remains. After removing some prefix and some suffix, the leftover elements, if any, form one contiguous middle subarray.\n\nIf the removed elements must sum to **x**, then the kept middle subarray must sum to **totalSum - x**. To minimize removals, maximize how many elements you keep. Since all numbers are positive, the longest subarray with a target sum can be found with a standard variable sliding window: expand to increase the sum, shrink to decrease it.",
    commonMistakes: [
      "Trying to greedily remove the larger end, which can miss the best prefix-suffix combination.",
      "Searching for a subarray that sums to **x** instead of **totalSum - x**.",
      "Returning the longest kept length instead of converting it to **n - longestLength** operations.",
      "Forgetting that **target = 0** means every element must be removed, so the answer is **n**.",
    ],
    algorithmMD:
      "**Window setup**\n\nCompute **target = totalSum - x**. The window represents the middle subarray we keep, and its sum should equal **target**. Because all values are positive, increasing **right** only increases the window sum, and moving **left** only decreases it.\n\n**Window visualization**\n\nFor **nums = [1,1,4,2,3]** and **x = 5**, the total is **11**, so the target kept sum is **6**. The window grows as **[1]**, then **[1,1]**, then **[1,1,4]** with sum **6**, giving kept length **3**. Later **2** makes the sum too large, so the left edge moves twice and finds **[4,2]** with sum **6**, but that length is only **2**. The longest kept window remains length **3**, so the answer is **5 - 3 = 2** removals.\n\n**Algorithm**\n\n1. Sum all values and compute **target = totalSum - x**.\n2. If **target < 0**, return **-1** because even removing everything is not enough.\n3. If **target == 0**, return **n** because the whole array must be removed.\n4. Use a positive-number sliding window with **left**, **right**, and **windowSum**.\n5. Add **nums[right]**, then shrink from the left while **windowSum > target**.\n6. Whenever **windowSum == target**, update the longest kept length.\n7. Return **n - longestLength**, or **-1** if no target-sum window was found.",
    solutions: [
      {
        name: "Longest middle window with target sum",
        approachMD:
          "Instead of simulating removals, preserve the longest middle subarray whose sum is **totalSum - x**. The array is positive, so a two-pointer window can find that longest target-sum subarray in one pass.",
        walkthroughMD:
          "1. Compute the total sum and derive the target kept sum.\n2. Reject **target < 0** and return **n** when **target == 0**.\n3. Expand **right** and add each value to the current window sum.\n4. While the sum is too large, subtract **nums[left]** and move **left** forward.\n5. When the sum equals the target, record the longest window length.\n6. Convert the longest kept length into operations by subtracting it from **n**.",
        complexity: { time: "O(n)", space: "O(1)", note: "Each pointer only moves forward, and the algorithm stores a few integer variables." },
        filename: "Solution.java",
        code: `class Solution {

    public int minOperations(int[] nums, int x) {
        int total = 0;
        for (int value : nums) {
            total += value;
        }

        int target = total - x;
        if (target < 0) {
            return -1;
        }
        if (target == 0) {
            return nums.length;
        }

        int left = 0;
        int windowSum = 0;
        int longest = -1;

        for (int right = 0; right < nums.length; right++) {
            windowSum += nums[right];

            while (windowSum > target && left <= right) {
                windowSum -= nums[left];
                left++;
            }

            if (windowSum == target) {
                longest = Math.max(longest, right - left + 1);
            }
        }

        if (longest == -1) {
            return -1;
        }
        return nums.length - longest;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [1,1,4,2,3], x = 5. The total is **11**, so the target kept middle-window sum is **6**.",
      columns: ["right", "nums[right]", "left after shrink", "window sum", "longest target window", "answer if finished"],
      rows: [
        ["0", "1", "0", "1", "none", "not found"],
        ["1", "1", "0", "2", "none", "not found"],
        ["2", "4", "0", "6", "[0..2], length 3", "2"],
        ["3", "2", "2", "6", "[0..2], length 3", "2"],
        ["4", "3", "3", "5", "[0..2], length 3", "2"],
      ],
      narrativeMD: "The longest kept middle subarray has length **3**, so the fewest removals is **5 - 3 = 2**. Those removals are the suffix values **2** and **3**.",
    },
    interviewTipsMD:
      "This problem is mostly about reframing. Say that removing from the two ends leaves one contiguous middle segment, so the question becomes longest subarray with sum **totalSum - x**. Also mention that the sliding-window solution depends on all numbers being positive; if negatives were allowed, you would need a prefix-sum hash map instead.",
    followUps: [
      "How would you solve it if **nums** could contain negative numbers?",
      "How would you return the actual sequence of left and right removals?",
      "What if each removal had a different cost and you wanted minimum total cost?",
      "Can you solve the prefix-suffix version directly with prefix sums and a hash map?",
    ],
    similarProblems: [
      { title: "Minimum Size Subarray Sum", difficulty: "Medium", slug: "sw-minimum-size-subarray-sum", note: "Also uses positive-number window sums, but optimizes a shortest valid window." },
      { title: "Binary Subarrays With Sum", difficulty: "Medium", slug: "sw-binary-subarrays-with-sum", note: "Counts target-sum windows using a related sum transformation." },
      { title: "Max Consecutive Ones III", difficulty: "Medium", slug: "sw-max-consecutive-ones-iii", note: "Transforms a budget condition into a longest kept window." },
      { title: "Subarray Sum Equals K", difficulty: "Medium", url: "https://leetcode.com/problems/subarray-sum-equals-k/", note: "The prefix-sum alternative when values are not all positive." },
    ],
    keyTakeaways: [
      "End removals leave one contiguous middle subarray.",
      "Minimum operations equals **n - longest kept length**.",
      "The kept window must sum to **totalSum - x**, not **x**.",
      "Positive values make target-sum longest-window solvable with two pointers.",
    ],
    pattern:
      "Reframe prefix-suffix removals as keeping the longest middle subarray with a derived target sum, then answer with total length minus kept length.",
  },
];
