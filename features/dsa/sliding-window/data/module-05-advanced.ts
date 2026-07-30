import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "sw-subarrays-with-k-different-integers",
    moduleId: "sw-advanced",
    order: 18,
    title: "Subarrays with K Different Integers",
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/subarrays-with-k-different-integers/",
    tags: ["Sliding Window", "Variable Window", "Hash Map", "Counting", "At Most Trick"],
    companies: ["Google", "Amazon", "Microsoft", "Meta", "Apple"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 28,
    statementMD:
      "Given an integer array **nums** and an integer **k**, return the number of contiguous subarrays that contain exactly **k** distinct integers.",
    constraints: [
      "1 <= nums.length <= 2 * 10^4",
      "1 <= nums[i], k <= nums.length",
    ],
    inputMD: "An integer array **nums** and an integer **k**, the exact number of distinct values a valid subarray must contain.",
    outputMD: "An integer: the count of contiguous subarrays whose distinct-value count is exactly **k**.",
    examples: [
      { input: "nums = [1,2,1,2,3], k = 2", output: "7", explanation: "The valid subarrays are **[1,2]**, **[2,1]**, **[1,2]**, **[2,3]**, **[1,2,1]**, **[2,1,2]**, and **[1,2,1,2]**." },
      { input: "nums = [1,2,1,3,4], k = 3", output: "3", explanation: "The valid subarrays are **[1,2,1,3]**, **[2,1,3]**, and **[1,3,4]**." },
      { input: "nums = [1,1,1], k = 1", output: "6", explanation: "Every non-empty subarray contains exactly one distinct value, so the answer is **3 * 4 / 2 = 6**." },
    ],
    learningObjectives: [
      "Recognise exact distinct-count subarray questions as candidates for **exactly(K) = atMost(K) - atMost(K - 1)**.",
      "Maintain a variable window with a frequency map and a bounded number of distinct values.",
      "Explain why every valid at-most window ending at **right** contributes **right - left + 1** subarrays.",
      "Convert an exact requirement into two monotone at-most counting passes.",
    ],
    intuitionMD:
      "**Pattern Identification**\n\nThe phrase exactly **k** distinct values is the trap. A window with exactly **k** distinct values is not monotone: after you extend the right edge, it may become invalid, and after you shrink the left edge it may become valid again, but counting only exact windows directly is awkward.\n\nThe monotone version is at most **k** distinct values. If a window ending at **right** has at most **k** distinct values, every suffix of that window also has at most **k** distinct values. That gives the reusable identity **exactly(K) = atMost(K) - atMost(K - 1)**. Count all subarrays with at most **k** distinct values, subtract those with at most **k - 1**, and what remains are the subarrays with exactly **k** distinct values.",
    commonMistakes: [
      "Trying to count exact windows directly and adding only one when the window has exactly **k** distinct values.",
      "Forgetting that each valid at-most window ending at **right** contributes **right - left + 1** subarrays, not just one.",
      "Decrementing a frequency to zero but leaving the key in the map, so the distinct count is wrong.",
      "Using a fixed-size window even though the subarray length is unrestricted.",
    ],
    algorithmMD:
      "**Window setup**\n\nBuild a helper **atMost(limit)**. It stores a frequency map for values inside **nums[left..right]**. The invariant is that the map contains at most **limit** distinct keys. When adding **nums[right]** creates too many distinct values, move **left** forward and decrease frequencies until the invariant is restored.\n\n**Window visualization**\n\nFor **nums = [1,2,1,2,3]** and **limit = 2**, when **right = 3**, the valid window is **[1,2,1,2]** from indices **0..3**. Every suffix ending at index **3** is valid: **[2]**, **[1,2]**, **[2,1,2]**, and **[1,2,1,2]**. That is **right - left + 1 = 4** new subarrays. When **right = 4** adds **3**, the window has three distinct values, so **left** advances until only **[2,3]** remains. Now this right edge adds **2** valid subarrays.\n\n**Algorithm**\n\n1. Write **atMost(limit)** and return **0** immediately when **limit < 0**.\n2. Initialise **left = 0**, an empty frequency map, and **total = 0**.\n3. Expand **right** across the array, adding the new value to the frequency map.\n4. While the map has more than **limit** keys, remove **nums[left]** from the map and advance **left**.\n5. After the window is valid, add **right - left + 1** because every suffix of the valid window ending at **right** is valid.\n6. Return **atMost(k) - atMost(k - 1)**.",
    solutions: [
      {
        name: "At-most difference with frequency map",
        approachMD:
          "The exact requirement is handled by subtraction. The helper counts subarrays with at most a given number of distinct values using a standard variable window. Because at-most validity is preserved by taking suffixes, each right edge contributes all starts from **left** through **right**.",
        walkthroughMD:
          "1. Compute **atMost(nums, k)** and **atMost(nums, k - 1)**.\n2. In the helper, add **nums[right]** to the frequency map.\n3. If the number of keys exceeds the limit, move **left** forward and delete keys whose frequency drops to zero.\n4. Once the invariant is restored, add **right - left + 1** to the helper answer.\n5. Subtract the two helper counts to isolate subarrays with exactly **k** distinct values.",
        complexity: { time: "O(n)", space: "O(k)", note: "Each helper pass moves left and right forward at most n times. The map stores at most k plus one distinct values during shrinking." },
        filename: "Solution.java",
        code: `import java.util.HashMap;
import java.util.Map;

class Solution {

    public int subarraysWithKDistinct(int[] nums, int k) {
        return atMost(nums, k) - atMost(nums, k - 1);
    }

    private int atMost(int[] nums, int limit) {
        if (limit < 0) {
            return 0;
        }

        Map<Integer, Integer> frequency = new HashMap<>();
        int left = 0;
        int total = 0;

        for (int right = 0; right < nums.length; right++) {
            int value = nums[right];
            frequency.put(value, frequency.getOrDefault(value, 0) + 1);

            while (frequency.size() > limit) {
                int leftValue = nums[left];
                int count = frequency.get(leftValue) - 1;
                if (count == 0) {
                    frequency.remove(leftValue);
                } else {
                    frequency.put(leftValue, count);
                }
                left++;
            }

            total += right - left + 1;
        }

        return total;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [1,2,1,2,3], k = 2. Count **atMost(2)** and **atMost(1)**, then subtract them to get exactly **2** distinct values.",
      columns: ["phase", "right", "value", "left after shrink", "window state", "subarrays added", "running count", "meaning"],
      rows: [
        ["atMost(2)", "0", "1", "0", "{1:1}", "1", "1", "[1]"],
        ["atMost(2)", "1", "2", "0", "{1:1, 2:1}", "2", "3", "[2], [1,2]"],
        ["atMost(2)", "2", "1", "0", "{1:2, 2:1}", "3", "6", "three valid suffixes"],
        ["atMost(2)", "3", "2", "0", "{1:2, 2:2}", "4", "10", "four valid suffixes"],
        ["atMost(2)", "4", "3", "3", "{2:1, 3:1}", "2", "12", "shrink past the extra distinct value"],
        ["atMost(1)", "0", "1", "0", "{1:1}", "1", "1", "single value only"],
        ["atMost(1)", "1", "2", "1", "{2:1}", "1", "2", "shrink away 1"],
        ["atMost(1)", "2", "1", "2", "{1:1}", "1", "3", "shrink away 2"],
        ["atMost(1)", "3", "2", "3", "{2:1}", "1", "4", "shrink away 1"],
        ["atMost(1)", "4", "3", "4", "{3:1}", "1", "5", "shrink away 2"],
      ],
      narrativeMD: "The helper counts are **atMost(2) = 12** and **atMost(1) = 5**. Their difference is **7**, which is the number of subarrays with exactly **2** distinct integers.",
    },
    interviewTipsMD:
      "Lead with the identity **exactly(K) = atMost(K) - atMost(K - 1)**. Then justify why **atMost** is easy: once the window has at most **K** distinct values, all suffixes ending at the current right edge are also valid. Interviewers look for that counting jump; without it, candidates often write a complicated exact-window loop.",
    followUps: [
      "How would the helper change if values were small enough to use an array instead of a hash map?",
      "How would you count subarrays with exactly **k** odd numbers?",
      "How would you count subarrays with at most **k** distinct values and also return one longest example?",
      "Why does the exact trick work for counts but not directly for longest-window answers?",
    ],
    similarProblems: [
      { title: "Binary Subarrays With Sum", difficulty: "Medium", slug: "sw-binary-subarrays-with-sum", note: "Uses the same at-most subtraction idea on a binary sum." },
      { title: "Count Number of Nice Subarrays", difficulty: "Medium", slug: "sw-count-number-of-nice-subarrays", note: "Maps odd numbers to ones and reuses the exact-count template." },
      { title: "Fruit Into Baskets", difficulty: "Medium", slug: "sw-fruit-into-baskets", note: "Maintains a window with at most two distinct values, but asks for maximum length." },
      { title: "Minimum Window Substring", difficulty: "Hard", slug: "sw-minimum-window-substring", note: "Another frequency-map window with a tighter validity invariant." },
    ],
    keyTakeaways: [
      "Exact distinct-count windows become simple when rewritten as two at-most counts.",
      "For at-most counting, a valid window ending at **right** contributes **right - left + 1** subarrays.",
      "Deleting zero-frequency keys is required to keep the distinct count accurate.",
      "The two-pointer movement is linear because **left** and **right** only move forward.",
    ],
    pattern:
      "Count exact-K subarrays by computing atMost(K) and subtracting atMost(K - 1), where each valid at-most window contributes all of its suffixes ending at right.",
  },
  {
    kind: "problem",
    slug: "sw-binary-subarrays-with-sum",
    moduleId: "sw-advanced",
    order: 19,
    title: "Binary Subarrays With Sum",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/binary-subarrays-with-sum/",
    tags: ["Sliding Window", "Binary Array", "Counting", "Prefix Sum", "At Most Trick"],
    companies: ["Google", "Amazon", "Microsoft", "Meta", "Bloomberg"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 22,
    statementMD:
      "Given a binary array **nums** and an integer **goal**, return the number of non-empty contiguous subarrays whose sum is exactly **goal**.",
    constraints: [
      "1 <= nums.length <= 3 * 10^4",
      "nums[i] is either 0 or 1",
      "0 <= goal <= nums.length",
    ],
    inputMD: "A binary integer array **nums** and an integer **goal**, the exact sum each valid subarray must have.",
    outputMD: "An integer: the number of contiguous subarrays with sum exactly **goal**.",
    examples: [
      { input: "nums = [1,0,1,0,1], goal = 2", output: "4", explanation: "The valid subarrays are **[1,0,1]**, **[1,0,1,0]**, **[0,1,0,1]**, and **[1,0,1]** using their positions in the array." },
      { input: "nums = [0,0,0,0,0], goal = 0", output: "15", explanation: "Every subarray has sum **0**, so the count is **5 * 6 / 2 = 15**." },
      { input: "nums = [1,1,1], goal = 2", output: "2", explanation: "Only the two length-2 subarrays have sum **2**." },
    ],
    learningObjectives: [
      "Recognise exact binary-sum counting as another form of **exactly(K) = atMost(K) - atMost(K - 1)**.",
      "Use a variable window because binary values are non-negative and the window sum shrinks monotonically from the left.",
      "Handle **goal = 0** correctly by returning **0** for **atMost(-1)**.",
      "Explain how zeros create many valid suffixes from one right edge.",
    ],
    intuitionMD:
      "**Pattern Identification**\n\nThe array is binary, so every element is non-negative. That makes **sum <= limit** a monotone window condition: expanding right can only increase or preserve the sum, and shrinking left can only decrease or preserve it.\n\nCounting subarrays with sum exactly **goal** directly is possible with prefix sums, but the advanced sliding-window pattern is cleaner here: count subarrays with sum at most **goal**, subtract those with sum at most **goal - 1**, and the remaining subarrays must have sum exactly **goal**. The guard for negative limits is essential because **goal** may be **0**.",
    commonMistakes: [
      "Forgetting the negative-limit guard, which breaks cases where **goal = 0**.",
      "Using this at-most sum trick on arrays with negative numbers, where the monotone window property no longer holds.",
      "Adding only one valid subarray per right edge instead of **right - left + 1**.",
      "Shrinking while **sum >= limit** instead of only while **sum > limit**, which removes valid windows whose sum equals the limit.",
    ],
    algorithmMD:
      "**Window setup**\n\nBuild **atMost(limit)** for binary sums. Track **left**, **windowSum**, and **total**. After adding **nums[right]**, shrink from the left while **windowSum > limit**. When the window is valid, every suffix ending at **right** also has sum at most **limit**, because removing leading binary values cannot increase the sum.\n\n**Window visualization**\n\nFor **nums = [1,0,1,0,1]** and **limit = 2**, at **right = 3** the window **[1,0,1,0]** has sum **2**. The four suffixes ending there all have sum at most **2**, so this step adds **4**. At **right = 4**, adding another **1** makes the sum **3**. Shrink past the leftmost **1**; the valid window becomes **[0,1,0,1]**, so this step adds **4** more.\n\n**Algorithm**\n\n1. Return **0** from **atMost(limit)** when **limit < 0**.\n2. Expand **right** through the array and add **nums[right]** to **windowSum**.\n3. While **windowSum > limit**, subtract **nums[left]** and move **left** forward.\n4. Add **right - left + 1** to the helper count.\n5. The final answer is **atMost(goal) - atMost(goal - 1)**.",
    solutions: [
      {
        name: "At-most difference on binary sum",
        approachMD:
          "Because all values are **0** or **1**, the at-most sum condition is monotone and supports a standard variable window. The helper counts all subarrays with sum no larger than a target, and subtraction isolates exactly the requested sum.",
        walkthroughMD:
          "1. Compute the number of subarrays with sum at most **goal**.\n2. Compute the number of subarrays with sum at most **goal - 1**.\n3. In each helper pass, expand right and shrink left only while the sum is too large.\n4. Add the valid suffix count **right - left + 1** after every right edge.\n5. Return the difference between the two helper counts.",
        complexity: { time: "O(n)", space: "O(1)", note: "Two linear helper passes are still O(n), and the window stores only counters and pointers." },
        filename: "Solution.java",
        code: `class Solution {

    public int numSubarraysWithSum(int[] nums, int goal) {
        return atMost(nums, goal) - atMost(nums, goal - 1);
    }

    private int atMost(int[] nums, int limit) {
        if (limit < 0) {
            return 0;
        }

        int left = 0;
        int windowSum = 0;
        int total = 0;

        for (int right = 0; right < nums.length; right++) {
            windowSum += nums[right];

            while (windowSum > limit) {
                windowSum -= nums[left];
                left++;
            }

            total += right - left + 1;
        }

        return total;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [1,0,1,0,1], goal = 2. Count **atMost(2)** and **atMost(1)**, then subtract to isolate sum exactly **2**.",
      columns: ["phase", "right", "value", "left after shrink", "window sum", "subarrays added", "running count", "meaning"],
      rows: [
        ["atMost(2)", "0", "1", "0", "1", "1", "1", "[1]"],
        ["atMost(2)", "1", "0", "0", "1", "2", "3", "zero keeps both suffixes valid"],
        ["atMost(2)", "2", "1", "0", "2", "3", "6", "sum reaches the limit"],
        ["atMost(2)", "3", "0", "0", "2", "4", "10", "four suffixes are valid"],
        ["atMost(2)", "4", "1", "1", "2", "4", "14", "shrink past the first one"],
        ["atMost(1)", "0", "1", "0", "1", "1", "1", "single one allowed"],
        ["atMost(1)", "1", "0", "0", "1", "2", "3", "leading zero adds another suffix"],
        ["atMost(1)", "2", "1", "1", "1", "2", "5", "remove the first one"],
        ["atMost(1)", "3", "0", "1", "1", "3", "8", "zero extends all valid suffixes"],
        ["atMost(1)", "4", "1", "3", "1", "2", "10", "remove zero then one until valid"],
      ],
      narrativeMD: "The helper counts are **atMost(2) = 14** and **atMost(1) = 10**. The difference is **4**, exactly the number of subarrays whose binary sum is **2**.",
    },
    interviewTipsMD:
      "Mention both accepted viewpoints: prefix sums with a hash map and sliding window using **atMost**. For this course, emphasize why sliding window is legal: the values are binary, so the sum condition is monotone. If the interviewer changes the array to include negative values, switch to prefix sums because the window invariant no longer behaves monotonically.",
    followUps: [
      "How would you solve the same problem if **nums** could contain negative numbers?",
      "How would the code change if the array contained only non-negative values, not just binary values?",
      "Can you derive the same answer with prefix sums and a frequency map?",
      "Why does **goal = 0** require special care in the at-most helper?",
    ],
    similarProblems: [
      { title: "Subarrays with K Different Integers", difficulty: "Hard", slug: "sw-subarrays-with-k-different-integers", note: "The same exact-count identity with a distinct-value invariant." },
      { title: "Count Number of Nice Subarrays", difficulty: "Medium", slug: "sw-count-number-of-nice-subarrays", note: "Equivalent after mapping odd values to ones." },
      { title: "Minimum Size Subarray Sum", difficulty: "Medium", slug: "sw-minimum-size-subarray-sum", note: "Another non-negative sum window, but it optimizes length instead of count." },
      { title: "Subarray Sum Equals K", difficulty: "Medium", url: "https://leetcode.com/problems/subarray-sum-equals-k/", note: "Requires prefix sums when values may be negative." },
    ],
    keyTakeaways: [
      "Binary arrays make **sum <= limit** a monotone sliding-window invariant.",
      "Exact sum can be counted as **atMost(goal) - atMost(goal - 1)**.",
      "Zeros matter because they create multiple valid suffixes without increasing the sum.",
      "The negative-limit guard makes **goal = 0** work naturally.",
    ],
    pattern:
      "For non-negative exact-sum counting, count subarrays with sum at most target and subtract the count with sum at most target minus one.",
  },
  {
    kind: "problem",
    slug: "sw-count-number-of-nice-subarrays",
    moduleId: "sw-advanced",
    order: 20,
    title: "Count Number of Nice Subarrays",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/count-number-of-nice-subarrays/",
    tags: ["Sliding Window", "Array", "Counting", "Parity", "At Most Trick"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Oracle"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 22,
    statementMD:
      "Given an integer array **nums** and an integer **k**, return the number of contiguous subarrays that contain exactly **k** odd numbers. Such subarrays are called nice subarrays.",
    constraints: [
      "1 <= nums.length <= 5 * 10^4",
      "1 <= nums[i] <= 10^5",
      "1 <= k <= nums.length",
    ],
    inputMD: "An integer array **nums** and an integer **k**, the exact number of odd values required in each valid subarray.",
    outputMD: "An integer: the number of contiguous subarrays containing exactly **k** odd numbers.",
    examples: [
      { input: "nums = [1,1,2,1,1], k = 3", output: "2", explanation: "The nice subarrays are **[1,1,2,1]** and **[1,2,1,1]**." },
      { input: "nums = [2,4,6], k = 1", output: "0", explanation: "There are no odd numbers, so no subarray can contain exactly one odd value." },
      { input: "nums = [2,2,2,1,2,2,1,2,2,2], k = 2", output: "16", explanation: "The two odd values can be surrounded by any of the four even-prefix choices and four even-suffix choices, giving **4 * 4 = 16**." },
    ],
    learningObjectives: [
      "Map parity to a binary signal where odd values behave like **1** and even values behave like **0**.",
      "Reuse **exactly(K) = atMost(K) - atMost(K - 1)** for exact odd-count subarrays.",
      "Maintain a window with at most **k** odd values using two pointers.",
      "Connect this problem directly to Binary Subarrays With Sum.",
    ],
    intuitionMD:
      "**Pattern Identification**\n\nIgnore the actual magnitudes. The problem only cares whether each number is odd. That means the array can be viewed as a binary sequence: odd maps to **1**, even maps to **0**. Now the task is to count subarrays with binary sum exactly **k**.\n\nAs in the previous problem, exact counts are easier through the at-most difference. A window with at most **k** odd values is monotone under removing elements from the left. Therefore **exactly(K) = atMost(K) - atMost(K - 1)** counts exactly the nice subarrays without enumerating every start and end.",
    commonMistakes: [
      "Using the numeric sum of the array instead of counting odd values only.",
      "Trying to reset the window at even numbers, even though evens can be part of many nice subarrays.",
      "Forgetting that every valid at-most window ending at **right** contributes **right - left + 1** suffixes.",
      "Handling **k - 1** without a negative guard in a reusable helper.",
    ],
    algorithmMD:
      "**Window setup**\n\nBuild **atMost(limit)** where the window state is **oddCount**, not a sum of values. When **nums[right]** is odd, increment **oddCount**. While **oddCount > limit**, move **left** forward and decrement **oddCount** whenever an odd value leaves.\n\n**Window visualization**\n\nFor **nums = [1,1,2,1,1]** and **limit = 3**, when **right = 3**, the window **[1,1,2,1]** has exactly three odds and adds **4** valid suffixes. When **right = 4** adds another odd, the window has four odds, so **left** moves past the first odd. The valid window becomes **[1,2,1,1]** and adds **4** suffixes for the at-most count.\n\n**Algorithm**\n\n1. Treat each odd number as contributing **1** to **oddCount** and each even number as contributing **0**.\n2. In **atMost(limit)**, return **0** if **limit < 0**.\n3. Expand **right** and update **oddCount** when the entering number is odd.\n4. While **oddCount > limit**, remove **nums[left]** from the parity count and advance **left**.\n5. Add **right - left + 1** to count all valid suffixes ending at **right**.\n6. Return **atMost(k) - atMost(k - 1)**.",
    solutions: [
      {
        name: "At-most difference on odd count",
        approachMD:
          "This is Binary Subarrays With Sum after a parity transformation. The helper never needs to build a separate binary array; it counts odd values directly while maintaining the at-most invariant.",
        walkthroughMD:
          "1. Call **atMost(nums, k)** to count subarrays with at most **k** odd numbers.\n2. Call **atMost(nums, k - 1)** to count subarrays with too few odd numbers.\n3. During each pass, increment **oddCount** when the right value is odd.\n4. Shrink from the left until **oddCount** is within the limit.\n5. Add **right - left + 1** for each right edge and subtract the two pass totals.",
        complexity: { time: "O(n)", space: "O(1)", note: "Two linear passes with only pointers and an odd counter." },
        filename: "Solution.java",
        code: `class Solution {

    public int numberOfSubarrays(int[] nums, int k) {
        return atMost(nums, k) - atMost(nums, k - 1);
    }

    private int atMost(int[] nums, int limit) {
        if (limit < 0) {
            return 0;
        }

        int left = 0;
        int oddCount = 0;
        int total = 0;

        for (int right = 0; right < nums.length; right++) {
            if (nums[right] % 2 == 1) {
                oddCount++;
            }

            while (oddCount > limit) {
                if (nums[left] % 2 == 1) {
                    oddCount--;
                }
                left++;
            }

            total += right - left + 1;
        }

        return total;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [1,1,2,1,1], k = 3. Count **atMost(3)** and **atMost(2)** by tracking only odd values.",
      columns: ["phase", "right", "value parity", "left after shrink", "odd count", "subarrays added", "running count", "meaning"],
      rows: [
        ["atMost(3)", "0", "odd", "0", "1", "1", "1", "one odd is within limit"],
        ["atMost(3)", "1", "odd", "0", "2", "2", "3", "two odds are within limit"],
        ["atMost(3)", "2", "even", "0", "2", "3", "6", "even extends all suffixes"],
        ["atMost(3)", "3", "odd", "0", "3", "4", "10", "limit reached"],
        ["atMost(3)", "4", "odd", "1", "3", "4", "14", "shrink past the first odd"],
        ["atMost(2)", "0", "odd", "0", "1", "1", "1", "one odd allowed"],
        ["atMost(2)", "1", "odd", "0", "2", "2", "3", "limit reached"],
        ["atMost(2)", "2", "even", "0", "2", "3", "6", "even does not change odd count"],
        ["atMost(2)", "3", "odd", "1", "2", "3", "9", "remove the first odd"],
        ["atMost(2)", "4", "odd", "2", "2", "3", "12", "remove the second odd"],
      ],
      narrativeMD: "The helper counts are **atMost(3) = 14** and **atMost(2) = 12**. The difference is **2**, matching the two nice subarrays.",
    },
    interviewTipsMD:
      "State the transformation first: odd numbers are ones, even numbers are zeros. Then the problem becomes exact binary sum, so the same **atMost(K) - atMost(K - 1)** reasoning applies. This framing is stronger than presenting it as a brand-new trick and helps you generalize to other categorical-count windows.",
    followUps: [
      "How would you solve this with prefix counts of odd numbers instead of sliding window?",
      "How would you count subarrays with exactly **k** even numbers?",
      "How would the solution change if the condition were exactly **k** values divisible by **3**?",
      "How can you compute the answer by multiplying choices around the positions of odd values?",
    ],
    similarProblems: [
      { title: "Binary Subarrays With Sum", difficulty: "Medium", slug: "sw-binary-subarrays-with-sum", note: "This problem becomes identical after odd values are mapped to one." },
      { title: "Subarrays with K Different Integers", difficulty: "Hard", slug: "sw-subarrays-with-k-different-integers", note: "Uses the same exact-count identity with a frequency map." },
      { title: "Max Consecutive Ones III", difficulty: "Medium", slug: "sw-max-consecutive-ones-iii", note: "Also treats a binary condition as the window state, but asks for longest length." },
      { title: "Count Vowels Substrings of a String", difficulty: "Easy", url: "https://leetcode.com/problems/count-vowel-substrings-of-a-string/", note: "Another counting task where categorical membership drives the window." },
    ],
    keyTakeaways: [
      "Parity problems often reduce to binary-array problems.",
      "Nice subarrays are subarrays with binary odd-count sum exactly **k**.",
      "The at-most helper can count odd values directly without materializing a transformed array.",
      "Even numbers are not separators; they multiply the number of valid starts and ends.",
    ],
    pattern:
      "Map the property of interest to a binary count, then count exact-K subarrays by subtracting atMost(K - 1) from atMost(K).",
  },
  {
    kind: "problem",
    slug: "sw-max-consecutive-ones-iii",
    moduleId: "sw-advanced",
    order: 21,
    title: "Max Consecutive Ones III",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/max-consecutive-ones-iii/",
    tags: ["Sliding Window", "Variable Window", "Two Pointers", "Binary Array", "Longest Window"],
    companies: ["Google", "Amazon", "Microsoft", "Meta", "Apple"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 18,
    statementMD:
      "Given a binary array **nums** and an integer **k**, return the maximum number of consecutive **1** values in the array if you may flip at most **k** zeros to ones.",
    constraints: [
      "1 <= nums.length <= 10^5",
      "nums[i] is either 0 or 1",
      "0 <= k <= nums.length",
    ],
    inputMD: "A binary integer array **nums** and an integer **k**, the maximum number of zeros you may flip inside one contiguous window.",
    outputMD: "An integer: the length of the longest contiguous window containing at most **k** zeros.",
    examples: [
      { input: "nums = [1,1,1,0,0,0,1,1,1,1,0], k = 2", output: "6", explanation: "Flip the zeros at indices **5** and **10**, or equivalently choose the window **[0,1,1,1,1,0]** from indices **5..10** after shrinking past the earlier zero." },
      { input: "nums = [0,0,1,1,0,0,1,1,1,0], k = 3", output: "7", explanation: "A best window spans indices **2..8** and contains two zeros, so it can become seven consecutive ones after flips." },
      { input: "nums = [1,1,1], k = 0", output: "3", explanation: "No flips are needed because the entire array already contains only ones." },
    ],
    learningObjectives: [
      "Recognise a longest-window problem with a bounded number of bad elements.",
      "Maintain **zeros <= k** as the window invariant.",
      "Shrink only when the invariant is violated, then update the best valid length.",
      "Distinguish longest at-most windows from exact-count counting problems.",
    ],
    intuitionMD:
      "**Pattern Identification**\n\nThis problem is not asking how many windows have exactly **k** zeros. It asks for the longest window that can be made all ones after at most **k** flips. That means the valid condition is simply **zeros in the window <= k**.\n\nThis is the longest-window-with-at-most-K-bad-values pattern. Expand the right edge to include more positions. If the number of zeros becomes too large, shrink from the left until the window is valid again. Every time the invariant holds, the current length is a candidate answer.",
    commonMistakes: [
      "Using the **atMost(K) - atMost(K - 1)** counting trick even though the goal is maximum length, not an exact count.",
      "Shrinking only once with an **if** when multiple left moves may be needed to remove a zero.",
      "Updating the best length before restoring **zeros <= k**.",
      "Treating flipped zeros as permanently changed, instead of just counting zeros inside the current window.",
    ],
    algorithmMD:
      "**Window setup**\n\nMaintain **left**, **zeros**, and **bestLength**. The active window is **nums[left..right]**. It is valid when it contains at most **k** zeros, because those zeros can be flipped to ones.\n\n**Window visualization**\n\nFor **nums = [1,1,1,0,0,0,1,1,1,1,0]** and **k = 2**, the window grows through indices **0..4** with two zeros and length **5**. Adding index **5** creates a third zero, so **left** moves forward until it passes the zero at index **3**; the valid window becomes **[0,0]** over indices **4..5**. The right edge then extends through four ones, producing a valid window **[0,0,1,1,1,1]** of length **6**.\n\n**Algorithm**\n\n1. Initialise **left = 0**, **zeros = 0**, and **bestLength = 0**.\n2. Expand **right** across the array.\n3. If **nums[right]** is **0**, increment **zeros**.\n4. While **zeros > k**, move **left** forward and decrement **zeros** when a zero leaves.\n5. After the window is valid, update **bestLength** with **right - left + 1**.\n6. Return **bestLength**.",
    solutions: [
      {
        name: "Longest window with at most k zeros",
        approachMD:
          "Track how many zeros are inside the current window. A valid window can be converted to all ones using at most **k** flips, so the answer is the maximum length seen after restoring that invariant.",
        walkthroughMD:
          "1. Move **right** one position at a time and count a zero when it enters.\n2. If the zero count exceeds **k**, advance **left** until enough zeros have left the window.\n3. Once **zeros <= k**, the current window is feasible after flips.\n4. Update the best length using the valid window size.\n5. Continue until every index has served as the right edge once.",
        complexity: { time: "O(n)", space: "O(1)", note: "Both pointers only move forward, and the algorithm stores three integers." },
        filename: "Solution.java",
        code: `class Solution {

    public int longestOnes(int[] nums, int k) {
        int left = 0;
        int zeros = 0;
        int bestLength = 0;

        for (int right = 0; right < nums.length; right++) {
            if (nums[right] == 0) {
                zeros++;
            }

            while (zeros > k) {
                if (nums[left] == 0) {
                    zeros--;
                }
                left++;
            }

            bestLength = Math.max(bestLength, right - left + 1);
        }

        return bestLength;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [1,1,1,0,0,0,1,1,1,1,0], k = 2. Track the longest valid window containing at most two zeros.",
      columns: ["right", "nums[right]", "zeros after shrink", "left after shrink", "valid window", "best length"],
      rows: [
        ["0", "1", "0", "0", "[0..0]", "1"],
        ["1", "1", "0", "0", "[0..1]", "2"],
        ["2", "1", "0", "0", "[0..2]", "3"],
        ["3", "0", "1", "0", "[0..3]", "4"],
        ["4", "0", "2", "0", "[0..4]", "5"],
        ["5", "0", "2", "4", "[4..5]", "5"],
        ["6", "1", "2", "4", "[4..6]", "5"],
        ["7", "1", "2", "4", "[4..7]", "5"],
        ["8", "1", "2", "4", "[4..8]", "5"],
        ["9", "1", "2", "4", "[4..9]", "6"],
        ["10", "0", "2", "5", "[5..10]", "6"],
      ],
      narrativeMD: "The best valid length reaches **6** for windows such as indices **4..9** or **5..10**, each containing at most two zeros that can be flipped.",
    },
    interviewTipsMD:
      "Describe zeros as the cost of the window and **k** as the budget. The window is valid while cost stays within budget. This phrasing generalizes to many interview problems: longest substring after replacing characters, longest subarray after deleting bad values, or longest range under a constraint. Also clarify why there is no subtraction trick here: you are optimizing one best window, not counting exact windows.",
    followUps: [
      "How would the solution change if you had to flip exactly **k** zeros instead of at most **k**?",
      "How would you return the start and end indices of one optimal window?",
      "What if each zero had a different flip cost and the budget were **k**?",
      "How does this relate to Longest Repeating Character Replacement?",
    ],
    similarProblems: [
      { title: "Longest Repeating Character Replacement", difficulty: "Medium", slug: "sw-longest-repeating-character-replacement", note: "Another longest window that allows a bounded number of replacements." },
      { title: "Fruit Into Baskets", difficulty: "Medium", slug: "sw-fruit-into-baskets", note: "Maintains an at-most constraint and maximizes window length." },
      { title: "Binary Subarrays With Sum", difficulty: "Medium", slug: "sw-binary-subarrays-with-sum", note: "Uses the same binary input but counts exact-sum windows instead of maximizing length." },
      { title: "Longest Continuous Subarray With Absolute Diff Less Than or Equal to Limit", difficulty: "Medium", slug: "sw-longest-continuous-subarray-absolute-diff-limit", note: "Another longest valid window with a maintained constraint." },
    ],
    keyTakeaways: [
      "At most **k** zeros is a budgeted-window invariant.",
      "For longest-window problems, update the answer only after the window is valid.",
      "Zeros are counted inside the window; the array itself is never modified.",
      "The exact-count subtraction trick is for counting, not for maximizing length.",
    ],
    pattern:
      "Longest budgeted window: expand right, shrink left while the cost exceeds k, and record the maximum valid window length.",
  },
];
