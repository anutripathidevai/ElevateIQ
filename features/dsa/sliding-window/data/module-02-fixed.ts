import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "sw-maximum-average-subarray-i",
    moduleId: "sw-fixed",
    order: 8,
    title: "Maximum Average Subarray I",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/maximum-average-subarray-i/",
    tags: ["Sliding Window", "Fixed Window", "Array", "Running Sum"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Bloomberg"],
    estimatedReadingMin: 7,
    estimatedSolvingMin: 12,
    statementMD:
      "Given an integer array **nums** and an integer **k**, find a contiguous subarray of length exactly **k** that has the maximum average value. Return that maximum average value.",
    constraints: [
      "1 <= k <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4",
    ],
    inputMD: "An integer array **nums** and an integer **k**, the required fixed window length.",
    outputMD: "A decimal number: the maximum average among all contiguous subarrays of length **k**.",
    examples: [
      { input: "nums = [1,12,-5,-6,50,3], k = 4", output: "12.75000", explanation: "The best length-4 subarray is **[12,-5,-6,50]** with sum **51**, so the average is **51 / 4 = 12.75**." },
      { input: "nums = [5], k = 1", output: "5.00000", explanation: "The only valid window contains **5**, so both the best sum and best average come from that one element." },
      { input: "nums = [-1,-12,-5,-6], k = 2", output: "-5.50000", explanation: "All averages are negative. The largest comes from **[-5,-6]**, whose average is **-5.5**." },
    ],
    learningObjectives: [
      "Recognise an exactly **k** sized contiguous subarray as a fixed-window problem.",
      "Replace repeated window re-summing with one running sum that updates in O(1).",
      "Track the best sum first, then convert it to an average only once at the end.",
      "Handle negative values by initialising the best answer from the first complete window.",
    ],
    intuitionMD:
      "The pattern signal is strong: the problem asks for a contiguous subarray with length exactly **k**. That means every candidate window has the same size, and each next window differs from the previous one by only two values: one leaves from the left and one enters from the right.\n\nA tempting approach is to compute the sum of every length-**k** subarray from scratch. That repeats almost all of the same additions. Fixed window removes the waste: compute the first window once, then slide one step at a time by subtracting the leaving value and adding the entering value.",
    commonMistakes: [
      "Recomputing every length-**k** sum from scratch, which wastes O(k) work per window.",
      "Dividing on every slide and comparing floating-point values instead of comparing integer sums.",
      "Initialising the best sum to **0**, which fails when every possible window has a negative sum.",
      "Removing the wrong left element after the right pointer advances.",
    ],
    algorithmMD:
      "**Window setup**\n\nMaintain **windowSum**, the sum of the current length-**k** window. Because the window size never changes, maximising the average is the same as maximising the sum. Initialise **windowSum** with the first **k** elements and set **bestSum** to that value.\n\n**Window visualization**\n\nFor **nums = [1,12,-5,-6,50,3]** and **k = 4**, the first window is **[1,12,-5,-6]** with sum **2**. Slide right by one position: **1** leaves, **50** enters, and the new window **[12,-5,-6,50]** has sum **51**. Slide again: **12** leaves, **3** enters, and **[-5,-6,50,3]** has sum **42**. The best sum is **51**, so the best average is **51 / 4 = 12.75**.\n\n**Algorithm**\n\n1. Sum the first **k** elements to form the first complete window.\n2. Store that sum as **bestSum**.\n3. For each right index from **k** to the end of the array, add **nums[right]** to include the entering value.\n4. Subtract **nums[right - k]** to remove the value that just left the window.\n5. Update **bestSum** if the current window sum is larger.\n6. Return **bestSum / k** as a double.",
    solutions: [
      {
        name: "Fixed-size running sum",
        approachMD:
          "Use one running sum for the current length-**k** window. Each slide updates that sum in constant time by adding the new right value and subtracting the old left value.",
        walkthroughMD:
          "1. Compute the sum of indices **0** through **k - 1**.\n2. Set **bestSum** to the first complete window sum so negative arrays are handled correctly.\n3. Starting at index **k**, slide the window right by adding the entering element and subtracting the element **k** positions behind it.\n4. Keep the largest window sum seen.\n5. Convert the best sum to a decimal average in the return statement.",
        complexity: { time: "O(n)", space: "O(1)", note: "Each element enters the running sum once and leaves it at most once." },
        filename: "Solution.java",
        code: `class Solution {

    public double findMaxAverage(int[] nums, int k) {
        int windowSum = 0;
        for (int index = 0; index < k; index++) {
            windowSum += nums[index];
        }

        int bestSum = windowSum;
        for (int right = k; right < nums.length; right++) {
            windowSum += nums[right];
            windowSum -= nums[right - k];
            bestSum = Math.max(bestSum, windowSum);
        }

        return (double) bestSum / k;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [1,12,-5,-6,50,3], k = 4. Track the fixed window sum as each slide removes one value and adds one value.",
      columns: ["step", "entering value", "leaving value", "window sum", "best sum"],
      rows: [
        ["initial window [1,12,-5,-6]", "1, 12, -5, -6", "none", "2", "2"],
        ["right = 4", "50", "1", "51", "51"],
        ["right = 5", "3", "12", "42", "51"],
      ],
      narrativeMD: "The largest length-4 window sum is **51**, so the maximum average is **51 / 4 = 12.75**.",
    },
    interviewTipsMD:
      "Say the key reduction out loud: for a fixed **k**, the denominator never changes, so maximising average is equivalent to maximising sum. This avoids floating-point comparison during the scan. Also call out the all-negative case, because correct initialisation from the first complete window is a common interview check.",
    followUps: [
      "How would the answer change if the window size could be at most **k** instead of exactly **k**?",
      "How would you return the start index of the best window as well as the average?",
      "How would you process the same query for many different values of **k**?",
      "What if the input arrives as a stream and you need the best length-**k** average seen so far?",
    ],
    similarProblems: [
      { title: "Maximum Sum Subarray of Size K", difficulty: "Easy", slug: "sw-maximum-sum-subarray-of-size-k", note: "The same fixed window without the final division by k." },
      { title: "Contains Duplicate II", difficulty: "Easy", slug: "sw-contains-duplicate-ii", note: "Maintains a fixed-size window of the last k indices using a set." },
      { title: "Minimum Size Subarray Sum", difficulty: "Medium", slug: "sw-minimum-size-subarray-sum", note: "A variable-size version where the window shrinks after reaching a target." },
      { title: "Sliding Window Maximum", difficulty: "Hard", slug: "sw-sliding-window-maximum", note: "Uses a fixed window plus a deque to track the maximum value." },
    ],
    keyTakeaways: [
      "Exactly **k** elements is the strongest signal for a fixed-size window.",
      "Adjacent fixed windows differ by one leaving value and one entering value.",
      "Compare sums while scanning, then divide once to produce the average.",
      "Initialise from the first real window, not from a neutral value like **0**.",
    ],
    pattern:
      "Fixed-size window over an array: build the first k elements, slide by subtracting the leaving element and adding the entering element, and update the best answer after each slide.",
  },
  {
    kind: "problem",
    slug: "sw-maximum-sum-subarray-of-size-k",
    moduleId: "sw-fixed",
    order: 9,
    title: "Maximum Sum Subarray of Size K",
    difficulty: "Easy",
    tags: ["Sliding Window", "Fixed Window", "Array", "Running Sum"],
    companies: ["Amazon", "Google", "Microsoft", "Adobe", "Oracle"],
    estimatedReadingMin: 7,
    estimatedSolvingMin: 13,
    statementMD:
      "Given an integer array **nums** and an integer **k**, return the maximum sum of any contiguous subarray whose length is exactly **k**.",
    constraints: [
      "1 <= k <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4",
    ],
    inputMD: "An integer array **nums** and an integer **k**, the exact number of elements each candidate subarray must contain.",
    outputMD: "An integer: the largest sum among all contiguous subarrays of length **k**.",
    examples: [
      { input: "nums = [2,1,5,1,3,2], k = 3", output: "9", explanation: "The best length-3 window is **[5,1,3]**, whose sum is **9**." },
      { input: "nums = [2,3,4,1,5], k = 2", output: "7", explanation: "The maximum length-2 sum is from **[3,4]**, which totals **7**." },
      { input: "nums = [-3,-2,-5,-1], k = 2", output: "-5", explanation: "The best window is **[-3,-2]**. Initialising from the first window is necessary because every sum is negative." },
    ],
    learningObjectives: [
      "Identify a fixed-size window when the subarray length is exactly **k**.",
      "Maintain a running sum instead of recomputing each candidate window.",
      "Update the window in the correct add-entering, remove-leaving sequence.",
      "Correctly handle arrays containing negative values.",
    ],
    intuitionMD:
      "The phrase contiguous subarray of length exactly **k** tells you every candidate covers a fixed number of neighbouring elements. If the window starting at index **0** is known, the window starting at index **1** is almost the same: it drops **nums[0]** and gains **nums[k]**.\n\nThe wasteful idea is to loop over every start index and sum the next **k** values again. That turns overlapping work into repeated work. A fixed sliding window keeps the overlapping part of the sum and only updates the two values that changed.",
    commonMistakes: [
      "Using Kadane's algorithm, which finds any-length subarrays instead of exactly length **k**.",
      "Starting **bestSum** at **0**, which is wrong when the maximum valid sum is negative.",
      "Updating the best answer before the window has reached size **k**.",
      "Subtracting **nums[right - k + 1]** instead of the element that actually left the window.",
    ],
    algorithmMD:
      "**Window setup**\n\nKeep **windowSum** for the current length-**k** window and **bestSum** for the largest complete window sum seen so far. The window is valid only after it contains exactly **k** elements.\n\n**Window visualization**\n\nFor **nums = [2,1,5,1,3,2]** and **k = 3**, the first window **[2,1,5]** has sum **8**. Slide right: **2** leaves, **1** enters, and **[1,5,1]** has sum **7**. Slide again: **1** leaves, **3** enters, and **[5,1,3]** has sum **9**. The final slide removes **5**, adds **2**, and gives **[1,3,2]** with sum **6**. The best sum is **9**.\n\n**Algorithm**\n\n1. Add the first **k** elements to create the first complete window.\n2. Initialise **bestSum** with that first window sum.\n3. Move the right edge from index **k** to the end.\n4. Add the entering value at **right**.\n5. Remove the leaving value at **right - k**.\n6. Update **bestSum** with the larger of the current best and current window sum.\n7. Return **bestSum**.",
    solutions: [
      {
        name: "Fixed-size running sum",
        approachMD:
          "The optimal solution is the fixed-window template. Build the first length-**k** sum once, then slide the window across the array in O(1) time per position.",
        walkthroughMD:
          "1. Sum the first **k** elements.\n2. Save that sum as **bestSum** so negative-only inputs are handled correctly.\n3. For every later index, add the entering value on the right.\n4. Subtract the value exactly **k** positions behind the right edge.\n5. Keep the maximum complete-window sum and return it.",
        complexity: { time: "O(n)", space: "O(1)", note: "The scan performs constant work for each array element." },
        filename: "Solution.java",
        code: `class Solution {

    public int maxSumSubarray(int[] nums, int k) {
        int windowSum = 0;
        for (int index = 0; index < k; index++) {
            windowSum += nums[index];
        }

        int bestSum = windowSum;
        for (int right = k; right < nums.length; right++) {
            windowSum += nums[right];
            windowSum -= nums[right - k];
            bestSum = Math.max(bestSum, windowSum);
        }

        return bestSum;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [2,1,5,1,3,2], k = 3. Trace each complete window and the best sum seen so far.",
      columns: ["step", "entering value", "leaving value", "window sum", "best sum"],
      rows: [
        ["initial window [2,1,5]", "2, 1, 5", "none", "8", "8"],
        ["right = 3", "1", "2", "7", "8"],
        ["right = 4", "3", "1", "9", "9"],
        ["right = 5", "2", "5", "6", "9"],
      ],
      narrativeMD: "The maximum complete-window sum is **9**, produced by the subarray **[5,1,3]**.",
    },
    interviewTipsMD:
      "Distinguish this from maximum subarray immediately. Kadane's algorithm optimises over any length, while this problem fixes the length at **k**. The interviewer wants to hear that each slide preserves **k - 1** old elements and changes only the entering and leaving values.",
    followUps: [
      "How would you also return the subarray boundaries for the best window?",
      "How would you find the minimum sum subarray of size **k**?",
      "What changes if the required window size can vary between **1** and **k**?",
      "How would you answer many fixed-window sum queries on the same array?",
    ],
    similarProblems: [
      { title: "Maximum Average Subarray I", difficulty: "Easy", slug: "sw-maximum-average-subarray-i", note: "Uses the identical window sum and divides the final best sum by k." },
      { title: "Contains Duplicate II", difficulty: "Easy", slug: "sw-contains-duplicate-ii", note: "Another fixed-width window, but the state is a set instead of a sum." },
      { title: "Sliding Window Maximum", difficulty: "Hard", slug: "sw-sliding-window-maximum", note: "Fixed window with a monotonic deque for max queries." },
      { title: "Subarray Product Less Than K", difficulty: "Medium", url: "https://leetcode.com/problems/subarray-product-less-than-k/", note: "A variable-window product problem where feasibility changes with window size." },
    ],
    keyTakeaways: [
      "Exactly length **k** means every candidate can be generated by sliding one position.",
      "The running sum changes by adding the entering value and subtracting the leaving value.",
      "Use the first full window as the initial best answer.",
      "Do not use any-length subarray algorithms when the length is fixed.",
    ],
    pattern:
      "For an exact-size-k aggregate, compute the first window once, slide by one element at a time, update the aggregate in constant time, and record the best complete window.",
  },
  {
    kind: "problem",
    slug: "sw-contains-duplicate-ii",
    moduleId: "sw-fixed",
    order: 10,
    title: "Contains Duplicate II",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/contains-duplicate-ii/",
    tags: ["Sliding Window", "Fixed Window", "Hash Set", "Array", "Duplicate Detection"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 15,
    statementMD:
      "Given an integer array **nums** and an integer **k**, return **true** if there are two distinct indices **i** and **j** such that **nums[i] == nums[j]** and **abs(i - j) <= k**. Otherwise, return **false**.",
    constraints: [
      "1 <= nums.length <= 10^5",
      "-10^9 <= nums[i] <= 10^9",
      "0 <= k <= 10^5",
    ],
    inputMD: "An integer array **nums** and an integer **k**, the maximum allowed distance between duplicate values.",
    outputMD: "A boolean: **true** if any duplicate pair appears within distance **k**, otherwise **false**.",
    examples: [
      { input: "nums = [1,2,3,1], k = 3", output: "true", explanation: "The two **1** values are at indices **0** and **3**, and their distance is **3**." },
      { input: "nums = [1,0,1,1], k = 1", output: "true", explanation: "The values at indices **2** and **3** are both **1**, and their distance is **1**." },
      { input: "nums = [1,2,3,1,2,3], k = 2", output: "false", explanation: "Every repeated value is exactly **3** indices apart, which is larger than **k = 2**." },
    ],
    learningObjectives: [
      "Reframe the distance condition as a fixed window of the last **k** indices.",
      "Use a HashSet to test whether the current value already appears in that window.",
      "Remove the leaving value so the set never represents indices too far away.",
      "Handle **k = 0** without creating a false duplicate match.",
    ],
    intuitionMD:
      "The pattern signal is the bound **abs(i - j) <= k**. For a current index **j**, only the previous **k** indices can form a valid pair with it. Anything farther left is irrelevant and must not remain in the active window.\n\nA wasteful approach compares each index with up to **k** previous indices. Sliding window turns that range of previous indices into a set. If the current value is already in the set, a valid nearby duplicate exists. If not, add it and remove the value that falls more than **k** positions behind.",
    commonMistakes: [
      "Keeping every value ever seen, which solves Contains Duplicate but ignores the distance limit.",
      "Removing the leaving value before checking the current value when the intended window is the previous **k** indices.",
      "Forgetting that **k = 0** can never produce distinct indices within distance zero.",
      "Using a set but allowing it to grow beyond **k** elements, which can report duplicates that are too far apart.",
    ],
    algorithmMD:
      "**Window setup**\n\nMaintain a HashSet named **window** containing values from the previous at most **k** indices. Before processing **nums[right]**, the set represents exactly the values that are close enough to pair with **right**.\n\n**Window visualization**\n\nFor **nums = [1,2,3,1]** and **k = 3**, start with an empty window. At index **0**, **1** is not present, so add it. At index **1**, the window is **[1]** and **2** is new, so add it. At index **2**, the window is **[1,2]** and **3** is new, so add it. At index **3**, the window is **[1,2,3]** and the entering value **1** is already present. That duplicate is within the last **3** indices, so return **true**.\n\n**Algorithm**\n\n1. Create an empty HashSet for the active window.\n2. Scan **nums** from left to right with index **right**.\n3. If **nums[right]** is already in the set, return **true**.\n4. Add **nums[right]** to the set.\n5. If the set now contains more than **k** indices worth of values, remove **nums[right - k]** because it will be too far away for the next index.\n6. If the scan finishes without a match, return **false**.",
    solutions: [
      {
        name: "HashSet of the last k values",
        approachMD:
          "Keep only the values whose indices are close enough to the current index. The set gives O(1) average lookup for whether the current value has appeared within the last **k** positions.",
        walkthroughMD:
          "1. Create an empty HashSet named **window**.\n2. For each index **right**, first check whether **nums[right]** is already in **window**.\n3. If it is present, return **true** because the matching index is within the previous **k** positions.\n4. Add the current value to the window.\n5. When the window grows beyond **k** values, remove the value at **right - k** so future checks cannot match an index that is too far away.\n6. Return **false** after scanning every element.",
        complexity: { time: "O(n)", space: "O(min(n, k))", note: "Each value is added once, removed at most once, and looked up once in the HashSet." },
        filename: "Solution.java",
        code: `import java.util.HashSet;
import java.util.Set;

class Solution {

    public boolean containsNearbyDuplicate(int[] nums, int k) {
        Set<Integer> window = new HashSet<>();

        for (int right = 0; right < nums.length; right++) {
            if (window.contains(nums[right])) {
                return true;
            }

            window.add(nums[right]);

            if (window.size() > k) {
                window.remove(nums[right - k]);
            }
        }

        return false;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [1,2,3,1], k = 3. The active set contains values from the previous at most three indices before checking the current value.",
      columns: ["index", "incoming value", "window before check", "decision", "window after step"],
      rows: [
        ["0", "1", "empty", "1 is not present, so add it.", "[1]"],
        ["1", "2", "[1]", "2 is not present, so add it.", "[1,2]"],
        ["2", "3", "[1,2]", "3 is not present, so add it.", "[1,2,3]"],
        ["3", "1", "[1,2,3]", "1 is already present, so return true.", "match found"],
      ],
      narrativeMD: "At index **3**, the value **1** matches index **0**, and **3 - 0 = 3**, which satisfies **k = 3**.",
    },
    interviewTipsMD:
      "Explain the set as a distance filter, not just a duplicate detector. The current index only cares about the previous **k** positions, so removing stale values is what makes the answer respect the distance constraint. If asked for an alternative, mention a HashMap from value to latest index; it also runs in O(n), but the fixed-window set mirrors the pattern more directly.",
    followUps: [
      "How would you return the duplicate pair of indices instead of a boolean?",
      "How would you solve it with a HashMap of latest indices?",
      "How would the solution change if values arrived as a stream?",
      "How would you count all nearby duplicate pairs rather than stopping at the first one?",
    ],
    similarProblems: [
      { title: "Maximum Sum Subarray of Size K", difficulty: "Easy", slug: "sw-maximum-sum-subarray-of-size-k", note: "Also maintains exactly the last k positions, but aggregates a sum." },
      { title: "Longest Substring Without Repeating Characters", difficulty: "Medium", slug: "sw-longest-substring-without-repeating-characters", note: "Uses a set to enforce uniqueness with a variable-size window." },
      { title: "Permutation in String", difficulty: "Medium", slug: "sw-permutation-in-string", note: "Maintains a fixed-length frequency window over a string." },
      { title: "Contains Duplicate", difficulty: "Easy", url: "https://leetcode.com/problems/contains-duplicate/", note: "The simpler duplicate check without the distance-limited window." },
    ],
    keyTakeaways: [
      "The distance limit **k** means only the previous **k** indices matter.",
      "A HashSet turns duplicate lookup inside that active window into O(1) average time.",
      "Removing stale values is essential; otherwise the solution ignores the distance constraint.",
      "For **k = 0**, the window is always empty before each check, so no distinct pair can match.",
    ],
    pattern:
      "Fixed-size membership window: before processing index j, keep only candidates from the previous k indices, test the incoming value, add it, then remove the value that becomes too old.",
  },
];
