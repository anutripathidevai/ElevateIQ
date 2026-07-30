import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "arr-running-sum-of-1d-array",
    moduleId: "arr-prefix-sum",
    order: 12,
    title: "Running Sum of 1d Array",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/running-sum-of-1d-array/",
    tags: ["Array", "Prefix Sum", "In-place Update", "Running Total"],
    companies: ["Amazon", "Google", "Microsoft", "Adobe", "Apple"],
    estimatedReadingMin: 6,
    estimatedSolvingMin: 10,
    statementMD:
      "Given an integer array **nums**, return an array **runningSum** where **runningSum[i]** equals the sum of **nums[0]** through **nums[i]** inclusive.",
    constraints: [
      "1 <= nums.length <= 1000",
      "-10^6 <= nums[i] <= 10^6",
    ],
    inputMD: "An integer array **nums**.",
    outputMD: "An integer array where each index stores the sum of all values from the start through that index.",
    examples: [
      { input: "nums = [1,2,3,4]", output: "[1,3,6,10]", explanation: "The running sums are 1, then 1 + 2 = 3, then 1 + 2 + 3 = 6, then 10." },
      { input: "nums = [1,1,1,1,1]", output: "[1,2,3,4,5]", explanation: "Each position adds one more **1** to the prefix sum." },
      { input: "nums = [3,1,2,10,1]", output: "[3,4,6,16,17]", explanation: "Every output cell reuses the prefix sum immediately before it." },
    ],
    learningObjectives: [
      "Recognise when every answer is the sum of a prefix ending at the current index.",
      "Use the previous prefix sum instead of recomputing from the start each time.",
      "Safely update the input array in place when the original values are no longer needed.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThis is the smallest prefix-sum signal: every result asks for the total from index **0** through the current index. The tempting approach is to recompute that sum for every **i**, which repeats the same additions and turns a simple task into O(n^2) work.\n\nA prefix sum carries history forward. Once you know the sum through **i - 1**, the sum through **i** is just that value plus **nums[i]**. Because the output can overwrite the input, **nums[i - 1]** can become the previous prefix sum and **nums[i]** can be updated directly.",
    commonMistakes: [
      "Starting the loop at index **0** and trying to read **nums[-1]**.",
      "Recomputing the sum from the beginning for every index.",
      "Allocating a second array even when the problem allows returning the modified input array.",
      "Forgetting that negative values still work because addition is accumulated exactly the same way.",
    ],
    algorithmMD:
      "**Key idea**\n\nStore each prefix sum where the current value lives. After processing index **i - 1**, **nums[i - 1]** already equals the sum of all values through **i - 1**. Add it into **nums[i]** to make **nums[i]** the next prefix sum.\n\n**Walkthrough**\n\nFor **nums = [1,2,3,4]**, leave index **0** as **1** because the first prefix contains only the first element. At index **1**, add the previous prefix **1** to get **3**. At index **2**, add the previous prefix **3** to get **6**. At index **3**, add **6** to get **10**. The array has become **[1,3,6,10]**, which is exactly the required answer.\n\n**Algorithm**\n\n1. If the array has one element, it is already its running sum.\n2. Start at index **1** because index **0** has no previous prefix.\n3. For each index, add **nums[i - 1]** into **nums[i]**.\n4. After the loop, return **nums** because every cell now stores its prefix sum.",
    solutions: [
      {
        name: "In-place prefix accumulation",
        approachMD:
          "The input array can become the answer. Once index **i - 1** has been converted into a prefix sum, add it to the current value to create the prefix sum at **i**.",
        walkthroughMD:
          "1. Keep **nums[0]** unchanged because it is already the first prefix sum.\n2. Iterate from index **1** to the end.\n3. Replace **nums[index]** with **nums[index] + nums[index - 1]**.\n4. Return the same array after all prefixes have been written.",
        complexity: { time: "O(n)", space: "O(1)", note: "Each element after the first is updated once, and the input array is reused as the output." },
        filename: "Solution.java",
        code: `class Solution {

    public int[] runningSum(int[] nums) {
        for (int index = 1; index < nums.length; index++) {
            nums[index] += nums[index - 1];
        }

        return nums;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [1,2,3,4]. Track how each current value absorbs the prefix sum on its left.",
      columns: ["index", "value before update", "previous prefix sum", "prefix sum after update", "answer array so far"],
      rows: [
        ["0", "1", "none", "1", "[1,2,3,4]"],
        ["1", "2", "1", "3", "[1,3,3,4]"],
        ["2", "3", "3", "6", "[1,3,6,4]"],
        ["3", "4", "6", "10", "[1,3,6,10]"],
      ],
      narrativeMD: "The final array stores the prefix sum ending at each index, so the answer is **[1,3,6,10]**.",
    },
    interviewTipsMD:
      "Say that this is prefix sum in its simplest in-place form. The important observation is not the loop itself; it is that after index **i - 1** is processed, that cell already contains all information needed for index **i**. Mention that if the input could not be modified, you would write the same recurrence into a new output array.",
    followUps: [
      "How would you solve it if the input array must remain unchanged?",
      "How would you answer many range-sum queries after computing running sums?",
      "How would the idea change for a 2D matrix of prefix sums?",
      "What integer type would you choose if values and array length were much larger?",
    ],
    similarProblems: [
      { title: "Range Sum Query - Immutable", difficulty: "Easy", slug: "arr-range-sum-query", note: "Builds a reusable prefix array so every range query is O(1)." },
      { title: "Subarray Sum Equals K", difficulty: "Medium", slug: "arr-subarray-sum-equals-k", note: "Uses prefix differences to count target-sum subarrays." },
      { title: "Product of Array Except Self", difficulty: "Medium", slug: "arr-product-of-array-except-self", note: "Applies the same left-to-right accumulation idea with products." },
      { title: "Range Sum Query 2D - Immutable", difficulty: "Medium", url: "https://leetcode.com/problems/range-sum-query-2d-immutable/", note: "Extends prefix sums from one dimension to a matrix." },
    ],
    keyTakeaways: [
      "A prefix sum at index **i** is the previous prefix plus the current value.",
      "In-place prefix sums are safe when the original previous value will not be needed again.",
      "Replacing repeated summation with a carried total changes O(n^2) work into O(n).",
    ],
    pattern:
      "For each index, carry the accumulated total from the left and write the new prefix answer immediately.",
  },
  {
    kind: "problem",
    slug: "arr-range-sum-query",
    moduleId: "arr-prefix-sum",
    order: 13,
    title: "Range Sum Query - Immutable",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/range-sum-query-immutable/",
    tags: ["Array", "Prefix Sum", "Design", "Range Query"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Bloomberg"],
    estimatedReadingMin: 7,
    estimatedSolvingMin: 15,
    statementMD:
      "Design a class **NumArray** that is initialized with an integer array **nums** and supports **sumRange(left, right)**, which returns the sum of elements from index **left** through index **right** inclusive.",
    constraints: [
      "1 <= nums.length <= 10^4",
      "-10^5 <= nums[i] <= 10^5",
      "0 <= left <= right < nums.length",
      "At most 10^4 calls will be made to sumRange",
    ],
    inputMD: "A constructor call **NumArray(nums)** followed by zero or more **sumRange(left, right)** queries.",
    outputMD: "For each query, return the integer sum of **nums[left]** through **nums[right]**.",
    examples: [
      { input: "nums = [-2,0,3,-5,2,-1], queries = sumRange(0,2), sumRange(2,5), sumRange(0,5)", output: "1, -1, -3", explanation: "The queried sums are -2 + 0 + 3 = 1, then 3 - 5 + 2 - 1 = -1, then the whole array sum is -3." },
      { input: "nums = [5], queries = sumRange(0,0)", output: "5", explanation: "The only range contains the single value **5**." },
    ],
    learningObjectives: [
      "Recognise many immutable range-sum queries as a prefix-sum preprocessing problem.",
      "Use a leading zero in **prefix** to make inclusive ranges easy to subtract.",
      "Separate constructor preprocessing cost from O(1) query cost.",
      "Explain why immutability makes preprocessing especially powerful.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThis is a prefix-sum design problem because the same array is queried many times and the array never changes. The tempting query implementation loops from **left** to **right** every time, which is acceptable for one query but wasteful for thousands.\n\nPrecompute a prefix array where **prefix[i]** stores the sum of the first **i** numbers. Then every inclusive range can be answered by subtracting the total before the range from the total through the range. The leading **0** at **prefix[0]** removes special cases for ranges that start at index **0**.",
    commonMistakes: [
      "Building **prefix** with the same length as **nums** and then writing extra edge cases for **left = 0**.",
      "Using **prefix[right] - prefix[left]** and accidentally excluding **nums[right]**.",
      "Recomputing the range sum inside every query even though the array is immutable.",
      "Forgetting that negative numbers are fine because subtraction of prefix totals still works.",
    ],
    algorithmMD:
      "**Key idea**\n\nBuild **prefix** with length **n + 1**, where **prefix[0] = 0** and **prefix[i + 1] = prefix[i] + nums[i]**. The sum from **left** through **right** is the total through **right** minus the total before **left**, so **sumRange(left, right) = prefix[right + 1] - prefix[left]**.\n\n**Walkthrough**\n\nFor **nums = [-2,0,3,-5,2,-1]**, the prefix array becomes **[0,-2,-2,1,-4,-2,-3]**. To answer **sumRange(2,5)**, take **prefix[6] - prefix[2] = -3 - -2 = -1**. This subtracts away everything before index **2** and leaves exactly **3,-5,2,-1**.\n\n**Algorithm**\n\n1. In the constructor, allocate **prefix** with one extra slot.\n2. Set **prefix[0] = 0** as the empty prefix before the array begins.\n3. For each index **i**, store **prefix[i + 1] = prefix[i] + nums[i]**.\n4. For **sumRange(left, right)**, return **prefix[right + 1] - prefix[left]**.\n5. Do not modify **prefix** during queries because the original array is immutable.",
    solutions: [
      {
        name: "Precomputed prefix array",
        approachMD:
          "Pay O(n) once in the constructor to build a prefix array with a leading zero. Each range query then becomes one subtraction between two prefix totals.",
        walkthroughMD:
          "1. Allocate **prefix** with **nums.length + 1** entries.\n2. Fill **prefix[index + 1]** from left to right using the previous prefix total.\n3. For a query, read the prefix after **right** and subtract the prefix before **left**.\n4. Return the difference as the inclusive range sum.",
        complexity: { time: "O(n) constructor, O(1) per query", space: "O(n)", note: "The extra prefix array stores one running total for every boundary between elements." },
        filename: "NumArray.java",
        code: `class NumArray {

    private final int[] prefix;

    public NumArray(int[] nums) {
        prefix = new int[nums.length + 1];
        for (int index = 0; index < nums.length; index++) {
            prefix[index + 1] = prefix[index] + nums[index];
        }
    }

    public int sumRange(int left, int right) {
        return prefix[right + 1] - prefix[left];
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [-2,0,3,-5,2,-1]. Build **prefix**, then answer **sumRange(2,5)**.",
      columns: ["step", "index or query", "prefix value", "formula or range", "answer"],
      rows: [
        ["build", "0", "prefix[1] = -2", "0 + -2", "not queried"],
        ["build", "1", "prefix[2] = -2", "-2 + 0", "not queried"],
        ["build", "2", "prefix[3] = 1", "-2 + 3", "not queried"],
        ["build", "3", "prefix[4] = -4", "1 + -5", "not queried"],
        ["build", "4", "prefix[5] = -2", "-4 + 2", "not queried"],
        ["build", "5", "prefix[6] = -3", "-2 + -1", "not queried"],
        ["query", "left = 2, right = 5", "prefix[6] and prefix[2]", "-3 - -2", "-1"],
      ],
      narrativeMD: "The prefix array stores sums at boundaries, so subtracting boundary **2** from boundary **6** isolates indices **2** through **5**.",
    },
    interviewTipsMD:
      "Present this as a tradeoff: O(n) preprocessing buys O(1) queries because the array is immutable. Emphasize the extra leading zero because it is the detail that removes off-by-one edge cases. If the interviewer asks about updates, this exact structure no longer works efficiently and you can discuss Binary Indexed Trees or Segment Trees.",
    followUps: [
      "How would the design change if **nums[index]** could be updated after construction?",
      "How would you support range-sum queries on a 2D matrix?",
      "What if the query asked for the average instead of the sum?",
      "When would you choose a Segment Tree over a prefix array?",
    ],
    similarProblems: [
      { title: "Running Sum of 1d Array", difficulty: "Easy", slug: "arr-running-sum-of-1d-array", note: "The same prefix accumulation, but returned directly instead of stored for queries." },
      { title: "Subarray Sum Equals K", difficulty: "Medium", slug: "arr-subarray-sum-equals-k", note: "Another application of subtracting prefix totals." },
      { title: "Product of Array Except Self", difficulty: "Medium", slug: "arr-product-of-array-except-self", note: "Another preprocessing pattern over prefixes and suffixes." },
      { title: "Range Sum Query 2D - Immutable", difficulty: "Medium", url: "https://leetcode.com/problems/range-sum-query-2d-immutable/", note: "The 2D version of immutable prefix-sum queries." },
      { title: "Range Sum Query - Mutable", difficulty: "Medium", url: "https://leetcode.com/problems/range-sum-query-mutable/", note: "Adds updates, which require a tree-based data structure instead of a static prefix array." },
    ],
    keyTakeaways: [
      "A leading zero makes **prefix[right + 1] - prefix[left]** work for every inclusive range.",
      "Immutable arrays are ideal for preprocessing because query work can be moved to construction.",
      "Prefix sums answer range sums by subtracting away everything before the range.",
      "Updates break the static-prefix assumption and call for different data structures.",
    ],
    pattern:
      "For many immutable range queries, precompute boundary prefix totals once and answer each query by subtracting two boundaries.",
  },
  {
    kind: "problem",
    slug: "arr-subarray-sum-equals-k",
    moduleId: "arr-prefix-sum",
    order: 14,
    title: "Subarray Sum Equals K",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/subarray-sum-equals-k/",
    tags: ["Array", "Hash Map", "Prefix Sum", "Counting", "Subarray"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Bloomberg"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 20,
    statementMD:
      "Given an integer array **nums** and an integer **k**, return the total number of contiguous subarrays whose sum equals **k**.",
    constraints: [
      "1 <= nums.length <= 2 * 10^4",
      "-1000 <= nums[i] <= 1000",
      "-10^7 <= k <= 10^7",
    ],
    inputMD: "An integer array **nums** and an integer target sum **k**.",
    outputMD: "An integer: the number of contiguous subarrays with sum exactly **k**.",
    examples: [
      { input: "nums = [1,1,1], k = 2", output: "2", explanation: "The two matching subarrays are indices **0..1** and **1..2**." },
      { input: "nums = [1,2,3], k = 3", output: "2", explanation: "The matching subarrays are **[1,2]** and **[3]**." },
      { input: "nums = [1,-1,0], k = 0", output: "3", explanation: "The matching subarrays are **[1,-1]**, **[0]**, and **[1,-1,0]**." },
    ],
    learningObjectives: [
      "Recognise target subarray sums as differences between two prefix sums.",
      "Use a frequency map because multiple earlier prefixes can create different valid subarrays.",
      "Seed prefix sum **0** to count subarrays that start at index **0**.",
      "Avoid sliding-window assumptions when negative numbers are allowed.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThis is a prefix-sum-with-hashmap problem because it asks about sums of arbitrary contiguous subarrays, and **nums** can include negative values. A sliding window is not reliable with negatives because expanding can decrease the sum and shrinking can increase it. The direct O(n^2) approach tries every start and recomputes or extends every end.\n\nA subarray ending at the current index has sum **k** exactly when some previous prefix sum equals **currentPrefix - k**. Instead of searching all previous prefixes, store how many times each prefix sum has appeared. When the needed prefix appears multiple times, each occurrence gives a different valid subarray ending here.",
    commonMistakes: [
      "Using a sliding window even though negative numbers break the monotone-sum property.",
      "Storing only whether a prefix sum exists instead of its frequency, which undercounts duplicates.",
      "Forgetting **map.put(0, 1)** and missing subarrays that start at index **0**.",
      "Updating the map before counting, which can incorrectly count an empty subarray when **k = 0**.",
    ],
    algorithmMD:
      "**Key idea**\n\nLet **sum** be the prefix sum through the current index. A previous prefix **p** creates a subarray of sum **k** if **sum - p = k**, so **p = sum - k**. Count how many previous prefixes equal **sum - k**, add that frequency to the answer, then record the current prefix for future indices.\n\n**Walkthrough**\n\nFor **nums = [1,2,3]** and **k = 3**, start with map **{0:1}**. At index **0**, **sum = 1** and the needed prefix is **-2**, which is absent, so the answer stays **0** and map becomes **{0:1, 1:1}**. At index **1**, **sum = 3** and the needed prefix is **0**, present once, so **[1,2]** is counted. At index **2**, **sum = 6** and the needed prefix is **3**, present once, so **[3]** is counted. The final answer is **2**.\n\n**Algorithm**\n\n1. Create a hashmap from prefix sum to frequency.\n2. Seed the map with prefix sum **0** appearing once.\n3. Scan **nums**, maintaining the running prefix **sum**.\n4. For each value, add it to **sum** and compute **needed = sum - k**.\n5. Add the frequency of **needed** to the answer.\n6. Increment the frequency of the current **sum** in the map.\n7. Return the accumulated answer.",
    solutions: [
      {
        name: "Prefix-sum frequencies",
        approachMD:
          "Keep counts of all prefix sums seen before the current index. The number of subarrays ending at the current index is exactly the count of previous prefixes equal to **sum - k**.",
        walkthroughMD:
          "1. Initialise **prefixCount** with **0 -> 1** for the empty prefix.\n2. Sweep left to right, adding each number to **sum**.\n3. Look up **sum - k** and add that frequency to **answer**.\n4. Record the current **sum** after counting so future subarrays can start after this index.\n5. Return **answer** after the scan.",
        complexity: { time: "O(n)", space: "O(n)", note: "Each index performs constant expected-time hashmap operations, and up to n distinct prefix sums may be stored." },
        filename: "Solution.java",
        code: `import java.util.HashMap;

class Solution {

    public int subarraySum(int[] nums, int k) {
        HashMap<Integer, Integer> prefixCount = new HashMap<>();
        prefixCount.put(0, 1);

        int sum = 0;
        int answer = 0;

        for (int value : nums) {
            sum += value;
            answer += prefixCount.getOrDefault(sum - k, 0);
            prefixCount.put(sum, prefixCount.getOrDefault(sum, 0) + 1);
        }

        return answer;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [1,2,3], k = 3. The map starts as **{0:1}** to represent the empty prefix before index 0.",
      columns: ["index", "nums[index]", "prefix sum", "needed prefix sum", "map before update", "answer"],
      rows: [
        ["0", "1", "1", "-2", "{0:1}", "0"],
        ["1", "2", "3", "0", "{0:1, 1:1}", "1"],
        ["2", "3", "6", "3", "{0:1, 1:1, 3:1}", "2"],
      ],
      narrativeMD: "A needed prefix is found while processing index **1** and again while processing index **2**, so two subarrays sum to **3**.",
    },
    interviewTipsMD:
      "Lead with the equation **currentPrefix - previousPrefix = k**. That equation makes the hashmap feel necessary rather than magical. Be explicit that the map stores frequencies, not just membership, because duplicate prefix sums represent different start positions. Also say that the lookup happens before inserting the current prefix to avoid counting empty subarrays.",
    followUps: [
      "How would you return the actual start and end indices for one matching subarray?",
      "How would you count subarrays whose sum is divisible by **k**?",
      "How would the solution change if all numbers were positive and you only needed existence?",
      "What changes if the array is streamed and you need the running count after every new value?",
    ],
    similarProblems: [
      { title: "Continuous Subarray Sum", difficulty: "Medium", slug: "arr-continuous-subarray-sum", note: "Uses prefix remainders instead of raw prefix sums." },
      { title: "Range Sum Query - Immutable", difficulty: "Easy", slug: "arr-range-sum-query", note: "Another application of subtracting prefix totals." },
      { title: "Running Sum of 1d Array", difficulty: "Easy", slug: "arr-running-sum-of-1d-array", note: "The base prefix accumulation pattern." },
      { title: "Two Sum", difficulty: "Easy", slug: "arr-two-sum", note: "Uses the same complement lookup idea in a hashmap." },
      { title: "Subarray Sums Divisible by K", difficulty: "Medium", url: "https://leetcode.com/problems/subarray-sums-divisible-by-k/", note: "Counts subarrays by grouping prefix sums with equal remainders." },
    ],
    keyTakeaways: [
      "A target subarray sum is a difference between two prefix sums.",
      "The required previous prefix at each index is **currentPrefix - k**.",
      "Prefix frequencies are necessary when multiple starts produce valid subarrays.",
      "Seed **0 -> 1** so subarrays beginning at index **0** are counted naturally.",
    ],
    pattern:
      "For target-sum subarrays with possible negatives, scan prefix sums and count prior complements in a hashmap.",
  },
  {
    kind: "problem",
    slug: "arr-continuous-subarray-sum",
    moduleId: "arr-prefix-sum",
    order: 15,
    title: "Continuous Subarray Sum",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/continuous-subarray-sum/",
    tags: ["Array", "Hash Map", "Prefix Sum", "Modulo", "Subarray"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Oracle"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 22,
    statementMD:
      "Given an integer array **nums** and an integer **k**, return **true** if **nums** has a contiguous subarray of length at least **2** whose sum is a multiple of **k**. Otherwise, return **false**.",
    constraints: [
      "1 <= nums.length <= 10^5",
      "0 <= nums[i] <= 10^9",
      "0 <= sum(nums[i]) <= 2^31 - 1",
      "1 <= k <= 2^31 - 1",
    ],
    inputMD: "An integer array **nums** and a positive integer **k**.",
    outputMD: "A boolean indicating whether some contiguous subarray of length at least **2** has a sum divisible by **k**.",
    examples: [
      { input: "nums = [23,2,4,6,7], k = 6", output: "true", explanation: "The subarray **[2,4]** has sum **6**, which is a multiple of **6**." },
      { input: "nums = [23,2,6,4,7], k = 6", output: "true", explanation: "The subarray **[2,6,4]** has sum **12**, which is a multiple of **6**." },
      { input: "nums = [23,2,6,4,7], k = 13", output: "false", explanation: "No length-at-least-2 contiguous subarray has a sum that is a multiple of **13**." },
    ],
    learningObjectives: [
      "Recognise divisibility of a subarray sum as an equal-remainder prefix-sum problem.",
      "Store the first index for each remainder so the length constraint is easiest to check.",
      "Seed remainder **0** at index **-1** to handle subarrays starting at index **0**.",
      "Use modulo carefully and avoid dividing by zero in variants outside the official constraints.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThis is a prefix-sum-with-hashmap problem where the target is divisibility rather than an exact sum. The O(n^2) approach tries every subarray and checks whether its sum is a multiple of **k**. Prefix sums let us avoid recomputing, and modulo lets us avoid storing large sums.\n\nIf two prefix sums have the same remainder after division by **k**, their difference is divisible by **k**. That difference is exactly the sum of the subarray between those prefix boundaries. Because the problem requires length at least **2**, store the earliest index for each remainder and check that the repeated remainder is at least two indices away.",
    commonMistakes: [
      "Checking only whether the running remainder is **0** and missing subarrays that start later.",
      "Storing the latest index for a remainder instead of the first, which can destroy a valid longer distance.",
      "Forgetting the length requirement and returning true for a one-element multiple of **k**.",
      "Forgetting to seed remainder **0** at index **-1** for subarrays starting at the beginning.",
    ],
    algorithmMD:
      "**Key idea**\n\nTrack **prefixSum modulo k**. When a remainder repeats, the sum between the earlier prefix boundary and the current index is divisible by **k**. Store only the first index for each remainder so the distance is as large as possible. Seed remainder **0** at index **-1** so a valid prefix of length at least **2** is handled naturally.\n\n**Walkthrough**\n\nFor **nums = [23,2,4,6,7]** and **k = 6**, start with remainder map **{0:-1}**. At index **0**, the prefix remainder is **5**, so store **5 -> 0**. At index **1**, the remainder becomes **1**, so store **1 -> 1**. At index **2**, the remainder becomes **5** again. Remainder **5** was first seen at index **0**, and **2 - 0 = 2**, so the subarray from index **1** through **2** has length **2** and sum divisible by **6**.\n\n**Algorithm**\n\n1. Create a hashmap from remainder to earliest index.\n2. Insert remainder **0** with index **-1**.\n3. Maintain the running remainder while scanning **nums**.\n4. For each index, update the remainder with the current value modulo **k**.\n5. If the remainder has been seen, check whether the distance from its first index is at least **2**.\n6. If the distance is large enough, return **true**.\n7. If the remainder is new, store the current index as its first occurrence.\n8. Return **false** if no repeated remainder satisfies the length requirement.",
    solutions: [
      {
        name: "First index by prefix remainder",
        approachMD:
          "Use equal prefix remainders to detect a subarray sum divisible by **k**. Keeping the earliest index for each remainder makes the length check straightforward and avoids overwriting a useful start boundary.",
        walkthroughMD:
          "1. Seed **firstIndexByRemainder** with **0 -> -1**.\n2. Scan the array while maintaining the prefix remainder modulo **k**.\n3. If the remainder was seen before, compute the distance from its first index.\n4. Return **true** when that distance is at least **2**.\n5. If the remainder is new, store the current index.\n6. Return **false** after the scan if no valid repeated remainder appears.",
        complexity: { time: "O(n)", space: "O(min(n, k))", note: "Each index is processed once, and there can be at most one stored entry per distinct remainder." },
        filename: "Solution.java",
        code: `import java.util.HashMap;

class Solution {

    public boolean checkSubarraySum(int[] nums, int k) {
        HashMap<Integer, Integer> firstIndexByRemainder = new HashMap<>();
        firstIndexByRemainder.put(0, -1);

        int remainder = 0;
        for (int index = 0; index < nums.length; index++) {
            remainder = (int) (((long) remainder + nums[index]) % k);

            if (firstIndexByRemainder.containsKey(remainder)) {
                int firstIndex = firstIndexByRemainder.get(remainder);
                if (index - firstIndex >= 2) {
                    return true;
                }
            } else {
                firstIndexByRemainder.put(remainder, index);
            }
        }

        return false;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [23,2,4,6,7], k = 6. The map starts with remainder **0** at index **-1**.",
      columns: ["index", "nums[index]", "prefix remainder", "first-index map before update", "distance or action", "answer"],
      rows: [
        ["0", "23", "5", "{0:-1}", "store 5 at 0", "false"],
        ["1", "2", "1", "{0:-1, 5:0}", "store 1 at 1", "false"],
        ["2", "4", "5", "{0:-1, 5:0, 1:1}", "seen at 0, length 2", "true"],
      ],
      narrativeMD: "The repeated remainder **5** means the prefix difference from after index **0** through index **2** is divisible by **6**, giving subarray **[2,4]**.",
    },
    interviewTipsMD:
      "State the modular arithmetic plainly: equal remainders imply the difference is divisible by **k**. Then focus on the length constraint, which is why the map stores the first index and why remainder **0** is seeded at **-1**. Under the official constraints **k** is positive; if an interviewer changes that, discuss how to avoid modulo by zero before applying this template.",
    followUps: [
      "How would you count all subarrays whose sum is divisible by **k** instead of returning a boolean?",
      "How would the solution change if negative numbers were allowed?",
      "How would you return the actual subarray bounds once one is found?",
      "What changes if the minimum required length is **m** instead of **2**?",
    ],
    similarProblems: [
      { title: "Subarray Sum Equals K", difficulty: "Medium", slug: "arr-subarray-sum-equals-k", note: "Uses raw prefix-sum complements instead of equal modulo classes." },
      { title: "Range Sum Query - Immutable", difficulty: "Easy", slug: "arr-range-sum-query", note: "Builds the prefix-sum foundation used by the modulo version." },
      { title: "Running Sum of 1d Array", difficulty: "Easy", slug: "arr-running-sum-of-1d-array", note: "The base running-prefix pattern." },
      { title: "Subarray Sums Divisible by K", difficulty: "Medium", url: "https://leetcode.com/problems/subarray-sums-divisible-by-k/", note: "Counts all matching remainder pairs instead of checking for one valid length." },
      { title: "Make Sum Divisible by P", difficulty: "Medium", url: "https://leetcode.com/problems/make-sum-divisible-by-p/", note: "Another prefix-remainder problem with a shortest-removal objective." },
    ],
    keyTakeaways: [
      "Two equal prefix remainders mean the subarray between them has sum divisible by **k**.",
      "Store the first index for each remainder to preserve the longest possible distance.",
      "Seed **0 -> -1** so prefixes starting at index **0** are checked correctly.",
      "The length-at-least-2 rule must be checked before returning true.",
    ],
    pattern:
      "For divisibility subarrays, scan prefix remainders, remember each remainder's earliest index, and accept a repeat only when the index gap meets the length rule.",
  },
];
