import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "arr-product-of-array-except-self",
    moduleId: "arr-advanced-arrays",
    order: 21,
    title: "Product of Array Except Self",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/product-of-array-except-self/",
    tags: ["Array", "Prefix Product", "Suffix Product", "In-Place Thinking", "No Division"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 18,
    statementMD:
      "Given an integer array **nums**, return an array **answer** where **answer[i]** is the product of every value in **nums** except **nums[i]**. You must solve it without using division and in linear time.",
    constraints: [
      "2 <= nums.length <= 10^5",
      "-30 <= nums[i] <= 30",
      "The product of any prefix or suffix of nums fits in a 32-bit signed integer",
      "You must write an algorithm that runs in O(n) time and does not use division",
    ],
    inputMD: "An integer array **nums**.",
    outputMD: "An integer array **answer** where each position stores the product of all numbers except the number at that position.",
    examples: [
      { input: "nums = [1,2,3,4]", output: "[24,12,8,6]", explanation: "For index 0, multiply 2 * 3 * 4 = 24. The same left-and-right product idea gives the remaining values." },
      { input: "nums = [-1,1,0,-3,3]", output: "[0,0,9,0,0]", explanation: "Only the position containing 0 gets the product of all nonzero values. Every other position still includes the zero, so its result is 0." },
      { input: "nums = [0,0]", output: "[0,0]", explanation: "Each answer excludes one zero but still includes the other zero." },
    ],
    learningObjectives: [
      "Recognise when division is tempting but invalid because of zeros and the no-division requirement.",
      "Separate each answer into the product of values strictly to its left and strictly to its right.",
      "Use the output array as prefix-product storage without counting it as extra space.",
      "Explain why two directional passes cover every excluded-self product exactly once.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nEach answer needs everything except the current value. The direct O(n^2) idea recomputes almost the same product for every index, and division is not allowed because zeros create separate cases. The reusable pattern is to split the product around the index: left side times right side.\n\nThe in-place insight is that the output array can first store left products. A second reverse pass carries one running right product and multiplies it into the stored left product. That gives the final answer while using only constant extra variables beyond the required output.",
    commonMistakes: [
      "Using division and then trying to patch zero cases even though the problem explicitly forbids division.",
      "Including **nums[i]** in either the prefix or suffix product for index **i**.",
      "Allocating separate prefix and suffix arrays when the answer array can store the prefix side.",
      "Updating the suffix product before multiplying it into **answer[i]**, which accidentally includes the current value.",
    ],
    algorithmMD:
      "**Key idea**\n\nFor each index, **answer[i] = product of values before i * product of values after i**. Store the left product in **answer[i]** during a forward pass. Then walk backward with a running suffix product and multiply it into each cell before the suffix absorbs the current value.\n\n**Walkthrough**\n\nFor **nums = [1,2,3,4]**, the forward pass writes prefix products before each index: **answer = [1,1,2,6]**. These mean there is no value before index 0, product 1 before index 1, product 1 * 2 before index 2, and product 1 * 2 * 3 before index 3.\n\nNow the suffix pass starts from the right with suffix 1. At index 3, multiply by 1 and then suffix becomes 4. At index 2, multiply the stored 2 by suffix 4 to get 8, then suffix becomes 12. At index 1, 1 * 12 becomes 12. At index 0, 1 * 24 becomes 24. The final array is **[24,12,8,6]**.\n\n**Algorithm**\n\n1. Allocate **answer** with the same length as **nums**.\n2. Set **prefix = 1**.\n3. Scan left to right. Store **prefix** in **answer[i]**, then multiply **prefix** by **nums[i]**.\n4. Set **suffix = 1**.\n5. Scan right to left. Multiply **answer[i]** by **suffix**, then multiply **suffix** by **nums[i]**.\n6. Return **answer**.",
    solutions: [
      {
        name: "Prefix in output plus reverse suffix pass",
        approachMD:
          "The output array stores the product of values to the left of each index. A single reverse pass carries the product of values to the right and multiplies it into the existing output cell.",
        walkthroughMD:
          "1. Create **answer** and set a running **prefix** to 1.\n2. For each index from left to right, write the current **prefix** before multiplying by the current value.\n3. Set a running **suffix** to 1.\n4. For each index from right to left, multiply **answer[index]** by **suffix** before multiplying **suffix** by **nums[index]**.\n5. Return **answer**, which now contains left product times right product for every index.",
        complexity: { time: "O(n)", space: "O(1)", note: "The output array is required by the problem and is not counted as extra space; only two scalar products are stored." },
        filename: "Solution.java",
        code: `class Solution {

    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] answer = new int[n];

        int prefix = 1;
        for (int index = 0; index < n; index++) {
            answer[index] = prefix;
            prefix *= nums[index];
        }

        int suffix = 1;
        for (int index = n - 1; index >= 0; index--) {
            answer[index] *= suffix;
            suffix *= nums[index];
        }

        return answer;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [1,2,3,4]. Track the prefix pass that fills **answer**, then the suffix pass that completes each value.",
      columns: ["pass", "index", "nums[index]", "running product before", "answer[index] after step", "running product after"],
      rows: [
        ["prefix", "0", "1", "1", "1", "1"],
        ["prefix", "1", "2", "1", "1", "2"],
        ["prefix", "2", "3", "2", "2", "6"],
        ["prefix", "3", "4", "6", "6", "24"],
        ["suffix", "3", "4", "1", "6", "4"],
        ["suffix", "2", "3", "4", "8", "12"],
        ["suffix", "1", "2", "12", "12", "24"],
        ["suffix", "0", "1", "24", "24", "24"],
      ],
      narrativeMD: "The answer starts as left products **[1,1,2,6]** and finishes as **[24,12,8,6]** after multiplying by right products.",
    },
    interviewTipsMD:
      "Lead with the split: every index needs the product on the left times the product on the right. Then state why division is not acceptable: zeros make quotient logic branchy and the prompt forbids it. Emphasize that the answer array is not counted as extra space, so using it for prefix products is the intended constant-space optimization.",
    followUps: [
      "How would you handle products that exceed 32-bit integers?",
      "How would the answer change if division were allowed and zeros were present?",
      "Can you return the same result if the input arrives as a stream that can be read only once?",
      "How would you adapt the idea for products modulo a prime?",
    ],
    similarProblems: [
      { title: "First Missing Positive", difficulty: "Hard", slug: "arr-first-missing-positive", note: "Also reuses the array layout to avoid extra storage." },
      { title: "Set Matrix Zeroes", difficulty: "Medium", slug: "arr-set-matrix-zeroes", note: "Another constant-space marking problem." },
      { title: "Contains Duplicate", difficulty: "Easy", slug: "arr-contains-duplicate", note: "Contrasts output-as-storage with hash-backed membership." },
      { title: "Trapping Rain Water", difficulty: "Hard", url: "https://leetcode.com/problems/trapping-rain-water/", note: "Uses left and right aggregate information around each index." },
    ],
    keyTakeaways: [
      "Products except self decompose into left product times right product.",
      "The output array can store intermediate prefix products without extra counted space.",
      "Multiply by the suffix before updating the suffix with the current value.",
      "Avoid division because zeros create invalid quotient assumptions.",
    ],
    pattern:
      "When each answer excludes the current index, precompute one side in the output array and sweep from the other side with a running aggregate.",
  },
  {
    kind: "problem",
    slug: "arr-first-missing-positive",
    moduleId: "arr-advanced-arrays",
    order: 22,
    title: "First Missing Positive",
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/first-missing-positive/",
    tags: ["Array", "Index As Hash", "Cyclic Sort", "In-Place", "Hashing"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 28,
    statementMD:
      "Given an unsorted integer array **nums**, return the smallest positive integer that does not appear in **nums**. The algorithm must run in O(n) time and use O(1) extra space.",
    constraints: [
      "1 <= nums.length <= 10^5",
      "-2^31 <= nums[i] <= 2^31 - 1",
      "The required algorithm must run in O(n) time and use O(1) extra space",
    ],
    inputMD: "An integer array **nums** that may contain negatives, zeros, duplicates, and values larger than the array length.",
    outputMD: "An integer: the smallest positive value missing from the array.",
    examples: [
      { input: "nums = [1,2,0]", output: "3", explanation: "The values 1 and 2 are present, so the first missing positive is 3." },
      { input: "nums = [3,4,-1,1]", output: "2", explanation: "After placing values into their matching indices, 1 is present at index 0 but 2 is missing from index 1." },
      { input: "nums = [7,8,9,11,12]", output: "1", explanation: "No value 1 appears, so the answer is immediately 1." },
    ],
    learningObjectives: [
      "Use the value range **1..n** as the only range that can affect the answer before **n + 1**.",
      "Treat array indices as hash buckets by placing value **v** at index **v - 1**.",
      "Use cyclic swaps safely in the presence of duplicates and out-of-range values.",
      "Prove that a final mismatch at index **i** means **i + 1** is missing.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe smallest missing positive must be between **1** and **n + 1**, where **n** is the array length. Values less than 1 and greater than **n** cannot occupy one of the first **n** positive slots, so they are irrelevant for detecting the first gap.\n\nA hash set would make the scan easy but costs O(n) extra space. Sorting costs O(n log n). The index-as-hash pattern uses the array itself as buckets: if value **v** is in the useful range **1..n**, its home is index **v - 1**. After every possible useful value is placed at home, the first index whose value is not **i + 1** reveals the answer.",
    commonMistakes: [
      "Trying to mark values larger than **n**, even though they cannot change the first missing positive before **n + 1**.",
      "Using an if instead of a while for swaps, which can leave the newly swapped value unprocessed.",
      "Forgetting the duplicate guard **nums[nums[i] - 1] != nums[i]**, causing an infinite swap loop.",
      "Returning **nums[i] + 1** on mismatch instead of returning the expected value **i + 1**.",
    ],
    algorithmMD:
      "**Key idea**\n\nFor an array of length **n**, place each useful value **v** in **1..n** at index **v - 1**. Duplicates, negatives, zeros, and values greater than **n** are ignored. Once the placement pass stabilizes, index **0** should hold 1, index **1** should hold 2, and so on. The first broken position is the first missing positive.\n\n**Walkthrough**\n\nFor **nums = [3,4,-1,1]**, index 0 holds 3, whose home is index 2. Swap to get **[-1,4,3,1]**. Index 0 now has -1, so move on. Index 1 holds 4, whose home is index 3. Swap to get **[-1,1,3,4]**. Index 1 now holds 1, whose home is index 0. Swap to get **[1,-1,3,4]**. The placement pass is done. Scanning from the left, index 0 correctly has 1, but index 1 does not have 2, so the answer is **2**.\n\n**Algorithm**\n\n1. Let **n = nums.length**.\n2. For each index, while **nums[index]** is in **1..n** and is not already at its home, swap it with the value at **nums[index] - 1**.\n3. Continue the while loop because the new value at this index may also need to move.\n4. After placement, scan index **0** through **n - 1**.\n5. Return **index + 1** at the first position where **nums[index] != index + 1**.\n6. If every position is correct, return **n + 1**.",
    solutions: [
      {
        name: "Index-as-hash cyclic placement",
        approachMD:
          "The array becomes a compact hash table for the values **1..n**. Each swap moves at least one useful value into its final home, so even though there is a nested while loop, the total number of swaps is linear.",
        walkthroughMD:
          "1. Iterate over every index in the array.\n2. While the current value is useful and not already sitting in its target position, swap it into that target position.\n3. Use the duplicate guard to avoid swapping equal values forever.\n4. After all useful values have been placed, scan for the first index that does not contain its expected value.\n5. Return the expected value at that mismatch, or **n + 1** if all slots are filled.",
        complexity: { time: "O(n)", space: "O(1)", note: "Each successful swap puts one value into its final index, so the total work across all while loops is linear." },
        filename: "Solution.java",
        code: `class Solution {

    public int firstMissingPositive(int[] nums) {
        int n = nums.length;

        for (int index = 0; index < n; index++) {
            while (nums[index] >= 1 && nums[index] <= n && nums[nums[index] - 1] != nums[index]) {
                int targetIndex = nums[index] - 1;
                int temp = nums[index];
                nums[index] = nums[targetIndex];
                nums[targetIndex] = temp;
            }
        }

        for (int index = 0; index < n; index++) {
            if (nums[index] != index + 1) {
                return index + 1;
            }
        }

        return n + 1;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [3,4,-1,1]. Place each useful value **v** at index **v - 1**, then scan for the first missing slot.",
      columns: ["step", "index", "value inspected", "action", "array after action"],
      rows: [
        ["1", "0", "3", "swap with index 2", "[-1,4,3,1]"],
        ["2", "0", "-1", "out of range, move on", "[-1,4,3,1]"],
        ["3", "1", "4", "swap with index 3", "[-1,1,3,4]"],
        ["4", "1", "1", "swap with index 0", "[1,-1,3,4]"],
        ["5", "1", "-1", "out of range, move on", "[1,-1,3,4]"],
        ["6", "scan index 0", "1", "correct value for positive 1", "[1,-1,3,4]"],
        ["7", "scan index 1", "-1", "expected 2, so return 2", "[1,-1,3,4]"],
      ],
      narrativeMD: "After cyclic placement, the first broken slot is index 1. Since index 1 should contain **2**, the first missing positive is **2**.",
    },
    interviewTipsMD:
      "Start by narrowing the only relevant answer range to **1..n + 1**. Then describe the array as a hash table where value **v** belongs at index **v - 1**. Interviewers care most about the duplicate guard and the reason the nested while loop is still O(n): every successful swap fixes a useful value into its home.",
    followUps: [
      "How would you solve it if O(n) extra space were allowed?",
      "How would the approach change if the array could not be modified?",
      "How would you find the first missing nonnegative integer instead?",
      "How would you return all missing positives in the range **1..n**?",
    ],
    similarProblems: [
      { title: "Product of Array Except Self", difficulty: "Medium", slug: "arr-product-of-array-except-self", note: "Also uses array storage carefully to avoid extra memory." },
      { title: "Longest Consecutive Sequence", difficulty: "Medium", slug: "arr-longest-consecutive-sequence", note: "Another problem about presence of consecutive positive slots, solved with a different membership structure." },
      { title: "Missing Number", difficulty: "Easy", url: "https://leetcode.com/problems/missing-number/", note: "A simpler missing-value problem with a fixed 0..n range." },
      { title: "Find All Numbers Disappeared in an Array", difficulty: "Easy", url: "https://leetcode.com/problems/find-all-numbers-disappeared-in-an-array/", note: "Uses indices as presence markers for values in **1..n**." },
      { title: "Find the Duplicate Number", difficulty: "Medium", url: "https://leetcode.com/problems/find-the-duplicate-number/", note: "Another value-to-index reasoning problem with stricter mutation rules." },
    ],
    keyTakeaways: [
      "The first missing positive can only be in **1..n + 1**.",
      "Index **v - 1** is the natural home for value **v**.",
      "A while loop is required because a swap may bring another useful value into the current index.",
      "The duplicate guard prevents infinite swapping when equal values target the same home.",
    ],
    pattern:
      "When values lie in a bounded 1-based range, use index **value - 1** as the home bucket and scan for the first bucket that does not contain its expected value.",
  },
  {
    kind: "problem",
    slug: "arr-longest-consecutive-sequence",
    moduleId: "arr-advanced-arrays",
    order: 23,
    title: "Longest Consecutive Sequence",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/longest-consecutive-sequence/",
    tags: ["Array", "Hash Set", "Sequence", "Membership", "Linear Scan"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Oracle"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 20,
    statementMD:
      "Given an unsorted integer array **nums**, return the length of the longest sequence of consecutive integer values. The sequence values do not need to appear next to each other in the original array.",
    constraints: [
      "0 <= nums.length <= 10^5",
      "-10^9 <= nums[i] <= 10^9",
      "The required algorithm should run in O(n) time",
    ],
    inputMD: "An integer array **nums**, possibly containing duplicates and values in any order.",
    outputMD: "An integer: the number of values in the longest run of consecutive integers.",
    examples: [
      { input: "nums = [100,4,200,1,3,2]", output: "4", explanation: "The longest run is **[1,2,3,4]**, which has length 4." },
      { input: "nums = [0,3,7,2,5,8,4,6,0,1]", output: "9", explanation: "The values 0 through 8 are all present, so the longest consecutive run has length 9." },
      { input: "nums = []", output: "0", explanation: "With no values, there is no consecutive sequence." },
    ],
    learningObjectives: [
      "Recognise that original order is irrelevant and membership queries are the real operation.",
      "Use a HashSet to deduplicate values and test neighbours in O(1) average time.",
      "Start counting only from values whose predecessor is absent.",
      "Prove that each value is walked as part of a sequence at most once overall.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe phrase consecutive sequence can tempt you to sort, but sorting costs O(n log n). Since the required output ignores original order, the useful operation is fast membership: is **x + 1** present after **x**?\n\nThe HashSet gives O(1) average membership, but starting a walk from every value would still repeat work. The key signal for a true run start is that **x - 1** is absent. Only then should you walk **x, x + 1, x + 2** and count. Every non-start value is skipped because it will be counted by the start of its run.",
    commonMistakes: [
      "Sorting the array even though the prompt asks for an O(n) solution.",
      "Starting a count from every number, which can degrade to O(n^2) on a long run.",
      "Letting duplicates inflate the length of a run.",
      "Confusing consecutive values with consecutive positions in the original array.",
    ],
    algorithmMD:
      "**Key idea**\n\nPut every value into a HashSet. A value **x** is the beginning of a run only when **x - 1** is not in the set. From such starts, walk upward while the next consecutive value exists and update the best length.\n\n**Walkthrough**\n\nFor **nums = [100,4,200,1,3,2]**, the set contains **1,2,3,4,100,200**. Value 1 has no predecessor 0, so it starts a run. Walking 1, 2, 3, 4 gives length 4. Values 2, 3, and 4 are skipped as starts because each has a predecessor in the set. Values 100 and 200 each start length-1 runs. The best remains **4**.\n\n**Algorithm**\n\n1. Insert every number into a HashSet to remove duplicates and support membership tests.\n2. Set **best = 0**.\n3. For each value **x** in the set, check whether **x - 1** is absent.\n4. If **x** is a run start, set **current = x** and **length = 1**.\n5. While **current + 1** exists in the set, advance **current** and increment **length**.\n6. Update **best** with **length**.\n7. Return **best**.",
    solutions: [
      {
        name: "HashSet starts-only scan",
        approachMD:
          "The set turns neighbour lookup into constant average time. The starts-only check prevents repeated walking because each consecutive run is traversed exactly once from its smallest value.",
        walkthroughMD:
          "1. Insert all values into a HashSet so duplicates disappear.\n2. Iterate through the set values.\n3. Skip a value if its predecessor exists because it is inside a run that starts earlier.\n4. For a true start, walk upward while the next value exists, counting the run length.\n5. Update the best length after each completed run.",
        complexity: { time: "O(n)", space: "O(n)", note: "Each unique value is inserted once and belongs to at most one upward walk from a run start." },
        filename: "Solution.java",
        code: `import java.util.HashSet;
import java.util.Set;

class Solution {

    public int longestConsecutive(int[] nums) {
        Set<Integer> values = new HashSet<>();
        for (int num : nums) {
            values.add(num);
        }

        int best = 0;
        for (int num : values) {
            if (!values.contains(num - 1)) {
                int current = num;
                int length = 1;

                while (values.contains(current + 1)) {
                    current++;
                    length++;
                }

                best = Math.max(best, length);
            }
        }

        return best;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [100,4,200,1,3,2]. The HashSet is **{1,2,3,4,100,200}**. Track only true run starts.",
      columns: ["candidate", "predecessor present", "is run start", "sequence walked", "best after candidate"],
      rows: [
        ["1", "no", "yes", "1 -> 2 -> 3 -> 4", "4"],
        ["2", "yes, 1 exists", "no", "skip", "4"],
        ["3", "yes, 2 exists", "no", "skip", "4"],
        ["4", "yes, 3 exists", "no", "skip", "4"],
        ["100", "no", "yes", "100", "4"],
        ["200", "no", "yes", "200", "4"],
      ],
      narrativeMD: "Only value **1** starts the length-4 run. The starts-only rule avoids recounting from 2, 3, and 4.",
    },
    interviewTipsMD:
      "Mention sorting as the obvious O(n log n) baseline, then explain why the required O(n) solution needs membership instead of ordering. The most important sentence is: only count from **x** when **x - 1** is absent. That single guard is what turns repeated neighbour walks into overall linear work.",
    followUps: [
      "How would the solution change if you had to return the actual sequence values?",
      "How would you solve it if memory were limited and sorting were allowed?",
      "How would you handle a stream of numbers and answer after each insertion?",
      "How would duplicates be reported if the output required original indices?",
    ],
    similarProblems: [
      { title: "Contains Duplicate", difficulty: "Easy", slug: "arr-contains-duplicate", note: "The basic HashSet membership pattern." },
      { title: "First Missing Positive", difficulty: "Hard", slug: "arr-first-missing-positive", note: "Also reasons about which positive values are present." },
      { title: "Top K Frequent Elements", difficulty: "Medium", slug: "arr-top-k-frequent-elements", note: "Another problem where hashing summarizes an unsorted array." },
      { title: "Longest Harmonious Subsequence", difficulty: "Easy", url: "https://leetcode.com/problems/longest-harmonious-subsequence/", note: "Uses value counts and neighbour relationships." },
      { title: "Number of Longest Increasing Subsequence", difficulty: "Medium", url: "https://leetcode.com/problems/number-of-longest-increasing-subsequence/", note: "Contrasts arbitrary increasing subsequences with exact consecutive values." },
    ],
    keyTakeaways: [
      "Consecutive sequence length depends on value membership, not original positions.",
      "A HashSet removes duplicates and supports neighbour checks.",
      "Only values without a predecessor should start a run.",
      "The starts-only invariant keeps the total walking work linear.",
    ],
    pattern:
      "For unsorted consecutive-value problems, hash all values, start only at values with no predecessor, and walk forward while successors exist.",
  },
  {
    kind: "problem",
    slug: "arr-set-matrix-zeroes",
    moduleId: "arr-advanced-arrays",
    order: 24,
    title: "Set Matrix Zeroes",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/set-matrix-zeroes/",
    tags: ["Array", "Matrix", "In-Place Marking", "Simulation", "Constant Space"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Adobe"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 22,
    statementMD:
      "Given an **m x n** integer matrix, if an element is 0, set its entire row and column to 0. You must modify the matrix in place.",
    constraints: [
      "1 <= m, n <= 200",
      "-2^31 <= matrix[i][j] <= 2^31 - 1",
      "The matrix must be modified in place",
    ],
    inputMD: "A two-dimensional integer matrix **matrix** with **m** rows and **n** columns.",
    outputMD: "No value is returned. The same matrix object is mutated so every row and column containing an original zero becomes all zeroes.",
    examples: [
      { input: "matrix = [[1,1,1],[1,0,1],[1,1,1]]", output: "[[1,0,1],[0,0,0],[1,0,1]]", explanation: "The original zero is at row 1, column 1, so that entire row and column become zero." },
      { input: "matrix = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]", output: "[[0,0,0,0],[0,4,5,0],[0,3,1,0]]", explanation: "The first row already contains zeroes, and columns 0 and 3 must be zeroed throughout the matrix." },
    ],
    learningObjectives: [
      "Avoid corrupting future decisions by separating marking from zeroing.",
      "Use the first row and first column as marker storage for the rest of the matrix.",
      "Preserve whether the first row and first column themselves need zeroing with two flags.",
      "Apply markers in an order that does not destroy information too early.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe tempting direct approach zeroes a row and column as soon as a zero is seen. That destroys information because newly written zeroes look like original zeroes and can cascade incorrectly. A safer O(m + n) approach stores row and column marker arrays, but the premium in-place trick stores those markers inside the matrix itself.\n\nUse the first cell of each row and each column as marker storage. The complication is that the first row and first column are both data and markers, so two boolean flags remember whether they originally contained a zero. After marking the inner matrix, zero the inner cells from the markers, then handle the first row and first column using the flags.",
    commonMistakes: [
      "Zeroing rows and columns immediately during the discovery pass.",
      "Using the first row and first column as markers without separate flags for their original zero status.",
      "Zeroing the first row before using it to mark inner columns.",
      "Treating a zero created during the zeroing phase as if it were an original zero.",
    ],
    algorithmMD:
      "**Key idea**\n\nUse **matrix[row][0]** to mark that row **row** must be zeroed, and **matrix[0][col]** to mark that column **col** must be zeroed. Two flags record whether row 0 or column 0 originally contained a zero.\n\n**Walkthrough**\n\nFor **matrix = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]**, the first row has zeroes, so **firstRowZero = true**. The first column has a zero at the top-left cell, so **firstColZero = true**. Scanning the inner cells finds no additional zeroes, but the first row markers already show columns 0 and 3 must be zeroed. Applying markers zeroes column 3 in the lower rows and keeps column 0 pending for the final flag step. Finally, **firstRowZero** zeroes the top row and **firstColZero** zeroes the left column.\n\n**Algorithm**\n\n1. Scan the first row and set **firstRowZero** if any value is 0.\n2. Scan the first column and set **firstColZero** if any value is 0.\n3. For every inner cell, if it is 0, mark its row in **matrix[row][0]** and its column in **matrix[0][col]**.\n4. Scan inner cells again. If the row marker or column marker is 0, set that cell to 0.\n5. If **firstRowZero** is true, zero the entire first row.\n6. If **firstColZero** is true, zero the entire first column.",
    solutions: [
      {
        name: "First row and column as markers",
        approachMD:
          "The matrix stores its own row and column markers. The first row and first column are reserved as marker arrays after two flags capture whether those marker areas must also be zeroed at the end.",
        walkthroughMD:
          "1. Check row 0 and column 0 before writing any markers.\n2. Use inner zeroes to mark their row and column by writing zero into the first cell of that row and column.\n3. Zero the inner matrix based on those markers.\n4. Zero row 0 if its flag was set.\n5. Zero column 0 if its flag was set.",
        complexity: { time: "O(mn)", space: "O(1)", note: "The matrix is scanned a constant number of times and only two boolean flags are stored." },
        filename: "Solution.java",
        code: `class Solution {

    public void setZeroes(int[][] matrix) {
        int rows = matrix.length;
        int cols = matrix[0].length;

        boolean firstRowZero = false;
        boolean firstColZero = false;

        for (int col = 0; col < cols; col++) {
            if (matrix[0][col] == 0) {
                firstRowZero = true;
            }
        }

        for (int row = 0; row < rows; row++) {
            if (matrix[row][0] == 0) {
                firstColZero = true;
            }
        }

        for (int row = 1; row < rows; row++) {
            for (int col = 1; col < cols; col++) {
                if (matrix[row][col] == 0) {
                    matrix[row][0] = 0;
                    matrix[0][col] = 0;
                }
            }
        }

        for (int row = 1; row < rows; row++) {
            for (int col = 1; col < cols; col++) {
                if (matrix[row][0] == 0 || matrix[0][col] == 0) {
                    matrix[row][col] = 0;
                }
            }
        }

        if (firstRowZero) {
            for (int col = 0; col < cols; col++) {
                matrix[0][col] = 0;
            }
        }

        if (firstColZero) {
            for (int row = 0; row < rows; row++) {
                matrix[row][0] = 0;
            }
        }
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "matrix = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]. Track the marker flags and marker row or column before applying zeroes.",
      columns: ["phase", "inspection or update", "firstRowZero", "firstColZero", "matrix or markers"],
      rows: [
        ["check row 0", "row 0 contains zeroes at columns 0 and 3", "true", "unknown", "[[0,1,2,0],[3,4,5,2],[1,3,1,5]]"],
        ["check column 0", "column 0 contains a zero at row 0", "true", "true", "[[0,1,2,0],[3,4,5,2],[1,3,1,5]]"],
        ["mark inner cells", "no inner zeroes are found", "true", "true", "markers show column 0 and column 3"],
        ["zero inner cells", "column marker at 3 zeroes lower rows in column 3", "true", "true", "[[0,1,2,0],[3,4,5,0],[1,3,1,0]]"],
        ["apply first row flag", "zero the entire first row", "true", "true", "[[0,0,0,0],[3,4,5,0],[1,3,1,0]]"],
        ["apply first column flag", "zero the entire first column", "true", "true", "[[0,0,0,0],[0,4,5,0],[0,3,1,0]]"],
      ],
      narrativeMD: "The final matrix matches the original zero locations, not the zeroes created during processing.",
    },
    interviewTipsMD:
      "Make the danger explicit: immediate zeroing creates false zeroes. Then present the first row and first column as reusable marker arrays. Be disciplined about order: capture first-row and first-column flags first, mark inner cells second, zero inner cells third, and only then zero the first row or first column.",
    followUps: [
      "How would you solve it with O(m + n) extra space, and why is that simpler?",
      "How would the algorithm change if the matrix were stored in a read-only format?",
      "How would you adapt this for a sparse matrix representation?",
      "What if each zero should affect only its diagonal instead of its row and column?",
    ],
    similarProblems: [
      { title: "Rotate Image", difficulty: "Medium", slug: "arr-rotate-image", note: "Another in-place matrix transformation where operation order matters." },
      { title: "Product of Array Except Self", difficulty: "Medium", slug: "arr-product-of-array-except-self", note: "Also stores intermediate information in an allowed output or input area." },
      { title: "Game of Life", difficulty: "Medium", url: "https://leetcode.com/problems/game-of-life/", note: "Uses in-place state encoding to avoid extra grid storage." },
      { title: "Spiral Matrix", difficulty: "Medium", url: "https://leetcode.com/problems/spiral-matrix/", note: "Another matrix traversal problem that rewards careful boundary control." },
    ],
    keyTakeaways: [
      "Do not zero immediately; mark first, then apply zeroes.",
      "The first row and first column can act as marker arrays.",
      "Two flags are required because the marker row and marker column are also real data.",
      "Apply first-row and first-column zeroing last to preserve marker information.",
    ],
    pattern:
      "For in-place matrix marking, reserve existing boundary cells as marker storage, save any overwritten boundary meaning in flags, and apply mutations after discovery.",
  },
  {
    kind: "problem",
    slug: "arr-rotate-image",
    moduleId: "arr-advanced-arrays",
    order: 25,
    title: "Rotate Image",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/rotate-image/",
    tags: ["Array", "Matrix", "In-Place", "Transpose", "Two Pointers"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 20,
    statementMD:
      "You are given an **n x n** two-dimensional matrix representing an image. Rotate the image by 90 degrees clockwise in place.",
    constraints: [
      "1 <= n <= 20",
      "-1000 <= matrix[i][j] <= 1000",
      "The matrix must be rotated in place without allocating another matrix",
    ],
    inputMD: "A square integer matrix **matrix** with **n** rows and **n** columns.",
    outputMD: "No value is returned. The same matrix is mutated so it represents the image rotated 90 degrees clockwise.",
    examples: [
      { input: "matrix = [[1,2,3],[4,5,6],[7,8,9]]", output: "[[7,4,1],[8,5,2],[9,6,3]]", explanation: "The first column from bottom to top becomes the first row after a clockwise rotation." },
      { input: "matrix = [[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]", output: "[[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]", explanation: "Each value moves from position **row, col** to **col, n - 1 - row**." },
    ],
    learningObjectives: [
      "Map a clockwise rotation from coordinate movement to simpler matrix operations.",
      "Use transposition to swap values across the main diagonal in place.",
      "Reverse each row after transposition to complete the clockwise rotation.",
      "Contrast transpose-and-reverse with the equivalent four-way cycle swap.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nA new matrix would make the coordinate rule easy: old **row, col** moves to new **col, n - 1 - row**. But the prompt requires in-place mutation, so writing directly to target cells would overwrite values that still need to move.\n\nThe clean in-place transformation breaks the rotation into two reversible steps. First transpose the matrix across its main diagonal, turning rows into columns. Then reverse each row, which moves those columns into clockwise order. A layer-by-layer four-way cycle implements the same mapping, but transpose then reverse is usually easier to explain and less error-prone.",
    commonMistakes: [
      "Allocating a second matrix even though the problem requires in-place rotation.",
      "Transposing the full matrix twice by swapping both **row, col** and **col, row**.",
      "Reversing columns instead of rows after transposing, which rotates counterclockwise.",
      "Trying to write every value to its final coordinate directly and overwriting needed values.",
    ],
    algorithmMD:
      "**Key idea**\n\nA 90-degree clockwise rotation equals transpose across the main diagonal, then reverse each row. Transpose changes **matrix[row][col]** with **matrix[col][row]** for cells above the diagonal. Row reversal then puts each transposed row in clockwise order.\n\n**Walkthrough**\n\nFor **matrix = [[1,2,3],[4,5,6],[7,8,9]]**, transposition swaps 2 with 4, 3 with 7, and 6 with 8. The matrix becomes **[[1,4,7],[2,5,8],[3,6,9]]**. Reversing each row gives **[[7,4,1],[8,5,2],[9,6,3]]**, which is the clockwise rotation.\n\nThe same final movement can also be done with a four-way cycle around each layer: top takes left, left takes bottom, bottom takes right, and right takes saved top. In interviews, transpose then reverse is shorter to code and easier to verify.\n\n**Algorithm**\n\n1. Let **n** be the matrix size.\n2. For every **row**, swap cells above the diagonal: columns **row + 1** through **n - 1**.\n3. After transposition, iterate through each row.\n4. Reverse that row in place with two pointers **left** and **right**.\n5. The matrix is now rotated 90 degrees clockwise.",
    solutions: [
      {
        name: "Transpose then reverse rows",
        approachMD:
          "Transposition performs the diagonal swaps without extra storage, and reversing each row completes the clockwise coordinate mapping. Both operations are in-place and deterministic.",
        walkthroughMD:
          "1. Loop over the upper triangle of the matrix and swap each value with its mirrored value across the main diagonal.\n2. For every row, place two pointers at the left and right ends.\n3. Swap the row endpoints and move both pointers inward until the row is reversed.\n4. After all rows are reversed, the matrix has been rotated clockwise.",
        complexity: { time: "O(n^2)", space: "O(1)", note: "Every matrix cell participates in at most a constant number of swaps and no extra matrix is allocated." },
        filename: "Solution.java",
        code: `class Solution {

    public void rotate(int[][] matrix) {
        int n = matrix.length;

        for (int row = 0; row < n; row++) {
            for (int col = row + 1; col < n; col++) {
                int temp = matrix[row][col];
                matrix[row][col] = matrix[col][row];
                matrix[col][row] = temp;
            }
        }

        for (int row = 0; row < n; row++) {
            int left = 0;
            int right = n - 1;
            while (left < right) {
                int temp = matrix[row][left];
                matrix[row][left] = matrix[row][right];
                matrix[row][right] = temp;
                left++;
                right--;
            }
        }
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "matrix = [[1,2,3],[4,5,6],[7,8,9]]. Track the transpose swaps and row reversals.",
      columns: ["phase", "operation", "matrix state"],
      rows: [
        ["start", "original matrix", "[[1,2,3],[4,5,6],[7,8,9]]"],
        ["transpose", "swap 2 with 4", "[[1,4,3],[2,5,6],[7,8,9]]"],
        ["transpose", "swap 3 with 7 and 6 with 8", "[[1,4,7],[2,5,8],[3,6,9]]"],
        ["reverse rows", "reverse row 0", "[[7,4,1],[2,5,8],[3,6,9]]"],
        ["reverse rows", "reverse row 1", "[[7,4,1],[8,5,2],[3,6,9]]"],
        ["reverse rows", "reverse row 2", "[[7,4,1],[8,5,2],[9,6,3]]"],
      ],
      narrativeMD: "Transposition turns columns into rows, and reversing each row changes the order from left-to-right into the clockwise orientation.",
    },
    interviewTipsMD:
      "State the coordinate mapping first, then say you will implement that mapping through transpose plus row reversal. This reassures the interviewer that the trick is not memorized magic. If asked for an alternative, describe the layer-by-layer four-way cycle, but code the transpose version unless specifically requested.",
    followUps: [
      "How would you rotate the matrix 90 degrees counterclockwise?",
      "How would you rotate by 180 degrees in place?",
      "Can this exact in-place method work for a non-square matrix?",
      "How would you implement the layer-by-layer four-way cycle instead?",
    ],
    similarProblems: [
      { title: "Set Matrix Zeroes", difficulty: "Medium", slug: "arr-set-matrix-zeroes", note: "Another in-place matrix problem where write order matters." },
      { title: "Transpose Matrix", difficulty: "Easy", url: "https://leetcode.com/problems/transpose-matrix/", note: "The first half of the rotation trick, without the square in-place constraint." },
      { title: "Spiral Matrix", difficulty: "Medium", url: "https://leetcode.com/problems/spiral-matrix/", note: "Another matrix problem that tests index and boundary control." },
      { title: "Rotate Array", difficulty: "Medium", url: "https://leetcode.com/problems/rotate-array/", note: "Uses reversal as an in-place rotation tool in one dimension." },
    ],
    keyTakeaways: [
      "Clockwise rotation maps **row, col** to **col, n - 1 - row**.",
      "Transpose then reverse each row implements that mapping in place.",
      "Only swap the upper triangle during transpose to avoid undoing swaps.",
      "A four-way layer cycle is equivalent but easier to get wrong under pressure.",
    ],
    pattern:
      "For square matrix rotations, decompose the coordinate movement into simple in-place transforms such as transpose plus row reversal.",
  },
];
