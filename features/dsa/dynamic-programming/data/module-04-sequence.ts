import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "dp-longest-increasing-subsequence",
    moduleId: "dp-sequence",
    order: 23,
    title: "Longest Increasing Subsequence",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/longest-increasing-subsequence/",
    tags: ["Dynamic Programming", "Sequence DP", "Binary Search", "Patience Sorting", "Arrays"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple", "Bloomberg"],
    estimatedReadingMin: 12,
    estimatedSolvingMin: 30,
    statementMD:
      "Given an integer array **nums**, return the length of the longest strictly increasing subsequence. A subsequence can delete zero or more elements without changing the order of the remaining elements.",
    constraints: ["1 <= nums.length <= 2500", "-10^4 <= nums[i] <= 10^4"],
    inputMD: "An integer array **nums**.",
    outputMD: "An integer: the length of the longest strictly increasing subsequence.",
    examples: [
      {
        input: "nums = [10,9,2,5,3,7,101,18]",
        output: "4",
        explanation: "One longest increasing subsequence is 2, 3, 7, 101, so the length is 4.",
      },
      {
        input: "nums = [0,1,0,3,2,3]",
        output: "4",
        explanation: "One valid answer is 0, 1, 2, 3. The second 0 can be skipped because subsequences preserve order but do not need to be contiguous.",
      },
      {
        input: "nums = [7,7,7,7,7,7,7]",
        output: "1",
        explanation: "The subsequence must be strictly increasing, so equal values cannot extend each other.",
      },
    ],
    learningObjectives: [
      "Define a sequence DP state by asking what the best subsequence ending at each index looks like.",
      "Distinguish subsequences from subarrays: order is preserved, contiguity is not required.",
      "Use binary search over minimal tail values to improve LIS from O(n^2) to O(n log n).",
      "Explain why the patience-sorting tails array stores lengths, not the exact final subsequence.",
    ],
    intuitionMD:
      "The key question is not just which numbers are in the subsequence; it is where the subsequence ends. If **nums[i]** is the final value, then every previous value smaller than **nums[i]** is a possible predecessor. The best subsequence ending at **i** is one longer than the best predecessor among those candidates.\n\nThat gives the classic quadratic DP. For interviews, it is the safest recurrence to derive because every transition has a clear meaning.\n\nThe faster idea keeps a different summary. For every possible length, store the smallest tail value seen so far. A smaller tail is always better because it leaves more room for future numbers to extend the subsequence. When a new number arrives, binary search the first tail that is at least that number and replace it. Replacing does not claim the exact subsequence exists with those tail values all together; it preserves the best extension opportunity for each length.",
    commonMistakes: [
      "Treating the answer as a longest increasing subarray and requiring contiguous elements.",
      "Using <= instead of <, which accidentally allows equal values in a strictly increasing subsequence.",
      "For the O(n^2) DP, defining **dp[i]** as a global answer so far instead of a subsequence that must end at **i**.",
      "For patience sorting, thinking the **tails** array is always the actual LIS rather than a compact set of best tail candidates.",
      "Returning **tails[0]** or a tail value instead of the number of occupied tail slots.",
    ],
    stateDefinitionMD:
      "For the quadratic DP, let **dp[i]** be the length of the longest strictly increasing subsequence that ends exactly at index **i**. The answer is **max(dp[i])** over all indices.\n\nFor the binary-search solution, let **tails[length - 1]** be the smallest possible tail value of any increasing subsequence of length **length** seen so far. The number of filled entries in **tails** is the current LIS length.",
    stateTransitionMD:
      "Quadratic recurrence:\n\n**dp[i] = 1 + max(dp[j])** over all **j < i** where **nums[j] < nums[i]**. If no such **j** exists, **dp[i] = 1** because **nums[i]** alone is a subsequence.\n\nPatience-sorting transition:\n\nFor each value **x**, binary search the first position **pos** where **tails[pos] >= x**. Set **tails[pos] = x**. If **pos** equals the current filled size, extend the size by one.\n\nThe base state is empty before scanning any number. In the DP form, each **dp[i]** starts at 1.",
    solutions: [
      {
        name: "Quadratic DP by ending index",
        whenToUseMD:
          "Use this when you need the most explainable LIS recurrence, when **n** is only a few thousand, or when a follow-up asks you to reconstruct the subsequence with parent pointers. It is the canonical teaching solution before the O(n log n) optimization.",
        approachMD:
          "Process indices from left to right. For each **i**, scan every earlier **j** and extend only those subsequences whose tail value is smaller than **nums[i]**. Keep the best length that ends at **i**, then update the global answer.",
        walkthroughMD:
          "1. Create an array **dp** of length **n**.\n2. For every index **i**, initialise **dp[i] = 1** because a single element is always an increasing subsequence.\n3. Scan all **j < i**. If **nums[j] < nums[i]**, candidate length **dp[j] + 1** can end at **i**.\n4. Store the best candidate in **dp[i]** and update the answer with **dp[i]**.",
        complexity: {
          time: "O(n^2)",
          space: "O(n)",
          note: "Every ordered pair of indices is considered once, and the DP array stores one value per index.",
        },
        filename: "Solution.java",
        code: `class Solution {

    public int lengthOfLIS(int[] nums) {
        int n = nums.length;
        int[] dp = new int[n];
        int answer = 1;

        for (int i = 0; i < n; i++) {
            dp[i] = 1;
            for (int j = 0; j < i; j++) {
                if (nums[j] < nums[i]) {
                    dp[i] = Math.max(dp[i], dp[j] + 1);
                }
            }
            answer = Math.max(answer, dp[i]);
        }

        return answer;
    }
}`,
      },
      {
        name: "Patience sorting with binary search",
        whenToUseMD:
          "Use this when the interviewer asks for the best asymptotic LIS length algorithm or when **n** is large. It is less direct for reconstruction, but it is the expected optimized solution for LeetCode 300.",
        approachMD:
          "Maintain **tails**, where each slot represents the smallest possible ending value for a subsequence of that length. A new number either extends all known lengths or improves the tail for one existing length. Binary search finds exactly which slot should change.",
        walkthroughMD:
          "1. Start with an empty **tails** array and **size = 0**.\n2. For each number, binary search the first index whose tail is greater than or equal to that number.\n3. Replace that tail with the number. This keeps the tail as small as possible for that subsequence length.\n4. If the replacement happened just after the current last filled slot, increase **size**.\n5. Return **size**, the number of subsequence lengths currently represented.",
        complexity: {
          time: "O(n log n)",
          space: "O(n)",
          note: "Each of the n numbers performs one binary search over the current tail list.",
        },
        filename: "Solution.java",
        code: `class Solution {

    public int lengthOfLIS(int[] nums) {
        int[] tails = new int[nums.length];
        int size = 0;

        for (int num : nums) {
            int left = 0;
            int right = size;

            while (left < right) {
                int mid = left + (right - left) / 2;
                if (tails[mid] < num) {
                    left = mid + 1;
                } else {
                    right = mid;
                }
            }

            tails[left] = num;
            if (left == size) {
                size++;
            }
        }

        return size;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [10,9,2,5,3,7,101,18]. Trace the optimized **tails** representation after each number.",
      columns: ["num", "binary-search position", "tails after update", "current LIS length"],
      rows: [
        ["10", "0", "[10]", "1"],
        ["9", "0", "[9]", "1"],
        ["2", "0", "[2]", "1"],
        ["5", "1", "[2,5]", "2"],
        ["3", "1", "[2,3]", "2"],
        ["7", "2", "[2,3,7]", "3"],
        ["101", "3", "[2,3,7,101]", "4"],
        ["18", "3", "[2,3,7,18]", "4"],
      ],
      narrativeMD:
        "The final length is **4**. The last **tails** array is not necessarily the chosen subsequence from the input; it is the best set of tail values for lengths 1 through 4.",
    },
    complexityNote:
      "The O(n^2) DP is the clearest recurrence and is acceptable for small constraints. The patience-sorting solution is the optimized length-only algorithm at O(n log n).",
    interviewTipsMD:
      "Derive the O(n^2) DP first because it proves you understand the subsequence dependency. Then say that the only information needed for extension is the smallest tail for each length, which motivates binary search. Be explicit that strict increasing means the binary search replaces the first tail greater than or equal to the current number.",
    followUps: [
      "How would you reconstruct one actual LIS instead of only its length?",
      "How does the binary search change if the subsequence can be non-decreasing?",
      "How would you count the number of longest increasing subsequences?",
      "How would you solve the 2D version, Russian Doll Envelopes?",
    ],
    similarProblems: [
      {
        title: "Longest Common Subsequence",
        difficulty: "Medium",
        slug: "dp-longest-common-subsequence",
        note: "Another sequence DP, but indexed by positions in two strings instead of one array.",
      },
      {
        title: "Longest Palindromic Subsequence",
        difficulty: "Medium",
        slug: "dp-longest-palindromic-subsequence",
        note: "Also asks for a longest subsequence, but uses interval dependencies.",
      },
      {
        title: "Number of Longest Increasing Subsequence",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/number-of-longest-increasing-subsequence/",
        note: "Extends the O(n^2) LIS state by tracking counts as well as lengths.",
      },
      {
        title: "Russian Doll Envelopes",
        difficulty: "Hard",
        url: "https://leetcode.com/problems/russian-doll-envelopes/",
        note: "Sort one dimension, then run LIS on the other dimension with a strict tie rule.",
      },
    ],
    keyTakeaways: [
      "A subsequence DP often needs a state tied to the ending index.",
      "For LIS, **dp[i]** means the best increasing subsequence that must end at **i**.",
      "The O(n log n) solution keeps minimal tails, not the exact subsequence.",
      "Strictness matters: equal values should replace a tail, not extend the length.",
    ],
    pattern:
      "Sequence DP by ending position: define the best answer ending at each index, then optimize when the transition only needs a searchable summary of previous states.",
  },
  {
    kind: "problem",
    slug: "dp-longest-common-subsequence",
    moduleId: "dp-sequence",
    order: 24,
    title: "Longest Common Subsequence",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/longest-common-subsequence/",
    tags: ["Dynamic Programming", "Sequence DP", "2D DP", "Strings"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Adobe", "Oracle"],
    estimatedReadingMin: 11,
    estimatedSolvingMin: 28,
    statementMD:
      "Given two strings **text1** and **text2**, return the length of their longest common subsequence. A common subsequence appears in both strings in the same relative order, but the chosen characters do not need to be contiguous.",
    constraints: ["1 <= text1.length, text2.length <= 1000", "text1 and text2 consist of lowercase English letters"],
    inputMD: "Two lowercase strings **text1** and **text2**.",
    outputMD: "An integer: the length of the longest subsequence common to both strings.",
    examples: [
      {
        input: "text1 = abcde, text2 = ace",
        output: "3",
        explanation: "The sequence a, c, e appears in order in both strings.",
      },
      {
        input: "text1 = abc, text2 = abc",
        output: "3",
        explanation: "The full string is common to both inputs.",
      },
      {
        input: "text1 = abc, text2 = def",
        output: "0",
        explanation: "No character can be matched in order, so the common subsequence length is 0.",
      },
    ],
    learningObjectives: [
      "Define a two-sequence DP state over prefixes of both strings.",
      "Separate the matching-character transition from the skip-one-character transition.",
      "Use an extra zero row and zero column to make empty-prefix base cases simple.",
      "Compress a 2D prefix table to one row without losing the diagonal dependency.",
    ],
    intuitionMD:
      "Think about the last characters of two prefixes. If they match, there is no downside to pairing them: any common subsequence before those characters can be extended by one. That gives the diagonal transition.\n\nIf the last characters do not match, they cannot both be used as the final matched character. At least one of them must be skipped. The best answer is therefore the better of skipping the last character of **text1** or skipping the last character of **text2**.\n\nThis is why LCS is the template for two-string DP: every cell represents a pair of prefixes, and each transition either consumes both strings together or consumes one side while keeping the other fixed.",
    commonMistakes: [
      "Confusing subsequence with substring and requiring matched characters to be contiguous.",
      "Using indices directly without accounting for the empty prefix row and column.",
      "When characters differ, taking the diagonal value instead of the maximum of skipping one side.",
      "In the 1D optimization, overwriting the diagonal value before it is used.",
      "Trying to greedily match the first possible equal character, which can block a better later alignment.",
    ],
    stateDefinitionMD:
      "Let **dp[i][j]** be the length of the longest common subsequence between the first **i** characters of **text1** and the first **j** characters of **text2**. The answer is **dp[m][n]**, where **m = text1.length** and **n = text2.length**.",
    stateTransitionMD:
      "Base cases are all empty-prefix cells: **dp[0][j] = 0** and **dp[i][0] = 0** because an empty string has no common characters with any prefix.\n\nFor **i > 0** and **j > 0**:\n\nIf **text1[i - 1] == text2[j - 1]**, then **dp[i][j] = dp[i - 1][j - 1] + 1**.\n\nOtherwise, one last character must be skipped, so **dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])**.",
    solutions: [
      {
        name: "2D prefix tabulation",
        whenToUseMD:
          "Use this as the default interview solution. It is easiest to reason about, easiest to debug, and the full table can be reused if a follow-up asks you to reconstruct one LCS.",
        approachMD:
          "Build a table whose rows are prefixes of **text1** and columns are prefixes of **text2**. The extra row and column represent empty prefixes. Fill the table from top-left to bottom-right so each cell can read its top, left, and diagonal dependencies.",
        walkthroughMD:
          "1. Let **m** and **n** be the two string lengths.\n2. Create **dp** with **m + 1** rows and **n + 1** columns. Java initializes the empty-prefix base cases to zero.\n3. For every **i** from 1 to **m** and every **j** from 1 to **n**, compare the current characters.\n4. If they match, extend the diagonal value. Otherwise, take the better of the top and left cells.\n5. Return **dp[m][n]**.",
        complexity: {
          time: "O(m · n)",
          space: "O(m · n)",
          note: "Every pair of prefix lengths is computed once.",
        },
        filename: "Solution.java",
        code: `class Solution {

    public int longestCommonSubsequence(String text1, String text2) {
        int m = text1.length();
        int n = text2.length();
        int[][] dp = new int[m + 1][n + 1];

        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (text1.charAt(i - 1) == text2.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }

        return dp[m][n];
    }
}`,
      },
      {
        name: "1D rolling row",
        whenToUseMD:
          "Use this after presenting the 2D table when the interviewer asks for space optimization and only the length is needed. Keep the shorter string as columns to minimize memory.",
        approachMD:
          "Each row only needs the previous row and the current row's left value. A one-dimensional array stores the current best values by column, while a separate **diagonal** variable preserves the old **dp[i - 1][j - 1]** value before it is overwritten.",
        walkthroughMD:
          "1. Put the shorter string on the columns so the array is as small as possible.\n2. Iterate through the longer string as rows.\n3. Before updating **dp[j]**, save its old value as **up** because it becomes the next diagonal.\n4. On a match, write **diagonal + 1**. On a mismatch, write the max of the old **dp[j]** and the current **dp[j - 1]**.\n5. Move **diagonal** to **up** at the end of the column step.",
        complexity: {
          time: "O(m · n)",
          space: "O(min(m, n))",
          note: "The same cells are evaluated, but only one row over the shorter string is stored.",
        },
        filename: "Solution.java",
        code: `class Solution {

    public int longestCommonSubsequence(String text1, String text2) {
        String rows = text1;
        String cols = text2;
        if (cols.length() > rows.length()) {
            rows = text2;
            cols = text1;
        }

        int[] dp = new int[cols.length() + 1];

        for (int i = 1; i <= rows.length(); i++) {
            int diagonal = 0;
            for (int j = 1; j <= cols.length(); j++) {
                int up = dp[j];
                if (rows.charAt(i - 1) == cols.charAt(j - 1)) {
                    dp[j] = diagonal + 1;
                } else {
                    dp[j] = Math.max(dp[j], dp[j - 1]);
                }
                diagonal = up;
            }
        }

        return dp[cols.length()];
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "text1 = abcde, text2 = ace. Each row shows the full DP row against prefixes of **ace**, including the empty prefix column.",
      columns: ["i", "text1 prefix", "dp row for prefixes of ace", "current best"],
      rows: [
        ["0", "empty", "[0,0,0,0]", "0"],
        ["1", "a", "[0,1,1,1]", "1"],
        ["2", "ab", "[0,1,1,1]", "1"],
        ["3", "abc", "[0,1,2,2]", "2"],
        ["4", "abcd", "[0,1,2,2]", "2"],
        ["5", "abcde", "[0,1,2,3]", "3"],
      ],
      narrativeMD:
        "The bottom-right value is **3**, representing the matched sequence a, c, e.",
    },
    complexityNote:
      "The full table and rolling-row forms both run in O(m · n). The optimized form reduces memory when reconstruction is not required.",
    interviewTipsMD:
      "Always define the state using prefix lengths rather than raw character indices; it makes the empty-prefix base cases natural. When explaining the mismatch case, say that the optimal answer must skip at least one of the two last characters, so the top and left cells cover all possibilities.",
    followUps: [
      "How would you reconstruct one actual longest common subsequence string?",
      "How would you compute the shortest common supersequence from the LCS table?",
      "How does the solution change for three strings?",
      "Can you reduce the space if you also need reconstruction?",
    ],
    similarProblems: [
      {
        title: "Edit Distance",
        difficulty: "Medium",
        slug: "dp-edit-distance",
        note: "Uses the same two-prefix grid, but cells store minimum edit cost instead of matched length.",
      },
      {
        title: "Longest Palindromic Subsequence",
        difficulty: "Medium",
        slug: "dp-longest-palindromic-subsequence",
        note: "Can be solved as LCS between a string and its reverse.",
      },
      {
        title: "Distinct Subsequences",
        difficulty: "Hard",
        slug: "dp-distinct-subsequences",
        note: "Another two-string subsequence DP with count transitions.",
      },
      {
        title: "Shortest Common Supersequence",
        difficulty: "Hard",
        url: "https://leetcode.com/problems/shortest-common-supersequence/",
        note: "Builds a shortest merged string using LCS structure.",
      },
    ],
    keyTakeaways: [
      "Two-string DP usually means a grid over prefix lengths.",
      "A character match consumes both prefixes and extends the diagonal.",
      "A mismatch skips one side, so the transition takes max of top and left.",
      "Rolling rows require preserving the old diagonal before overwriting a cell.",
    ],
    pattern:
      "Two-sequence prefix DP: let dp[i][j] describe the first i and first j elements, then choose between consuming both sequences or skipping one side.",
  },
  {
    kind: "problem",
    slug: "dp-edit-distance",
    moduleId: "dp-sequence",
    order: 25,
    title: "Edit Distance",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/edit-distance/",
    tags: ["Dynamic Programming", "Sequence DP", "2D DP", "Strings"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple", "Netflix"],
    estimatedReadingMin: 12,
    estimatedSolvingMin: 32,
    statementMD:
      "Given two strings **word1** and **word2**, return the minimum number of operations required to convert **word1** into **word2**. The allowed operations are insert a character, delete a character, or replace a character.",
    constraints: ["0 <= word1.length, word2.length <= 500", "word1 and word2 consist of lowercase English letters"],
    inputMD: "Two lowercase strings **word1** and **word2**.",
    outputMD: "An integer: the minimum number of insert, delete, and replace operations needed to convert **word1** into **word2**.",
    examples: [
      {
        input: "word1 = horse, word2 = ros",
        output: "3",
        explanation: "One optimal sequence is replace h with r, delete r, then delete e.",
      },
      {
        input: "word1 = intention, word2 = execution",
        output: "5",
        explanation: "Five edits are sufficient, and no sequence of fewer edits can align all prefixes under the allowed operations.",
      },
      {
        input: "word1 = empty string, word2 = abc",
        output: "3",
        explanation: "Starting from an empty word, insert a, b, and c.",
      },
    ],
    learningObjectives: [
      "Model edit operations as transitions between prefixes of two strings.",
      "Set empty-prefix base cases for converting to or from an empty string.",
      "Map insert, delete, and replace to the correct neighbouring DP cells.",
      "Recognise edit distance as a minimization version of two-sequence DP.",
    ],
    intuitionMD:
      "Again use prefixes, but now the cell is a cost rather than a length. Suppose you want to convert the first **i** characters of **word1** into the first **j** characters of **word2**.\n\nIf the two last characters already match, they can stay as they are. The cost is whatever it took to convert the smaller prefixes before them.\n\nIf they differ, the final operation in an optimal solution must be one of three choices. Insert the last character of **word2**, delete the last character of **word1**, or replace the last character of **word1**. Each choice reduces the problem to a neighbouring prefix cell plus one operation. Taking the minimum gives the optimal edit count.",
    commonMistakes: [
      "Forgetting that empty strings are valid inputs, so the first row and first column are essential.",
      "Swapping the meaning of insert and delete transitions. The formula can still work, but the explanation becomes inconsistent.",
      "Adding one operation even when the current characters already match.",
      "Using a greedy local replacement whenever characters differ, which misses cases where insert or delete is cheaper.",
      "Returning **dp[m - 1][n - 1]** from a table built with extra prefix rows and columns.",
    ],
    stateDefinitionMD:
      "Let **dp[i][j]** be the minimum number of edits needed to convert the first **i** characters of **word1** into the first **j** characters of **word2**. The answer is **dp[m][n]**.",
    stateTransitionMD:
      "Base cases describe conversion involving an empty prefix:\n\n**dp[i][0] = i** because converting a non-empty prefix to empty requires deleting all **i** characters.\n\n**dp[0][j] = j** because converting empty to a prefix of length **j** requires inserting all **j** characters.\n\nFor **i > 0** and **j > 0**, if **word1[i - 1] == word2[j - 1]**, then **dp[i][j] = dp[i - 1][j - 1]**.\n\nOtherwise:\n\n**dp[i][j] = 1 + min(dp[i][j - 1], dp[i - 1][j], dp[i - 1][j - 1])**\n\nThose three neighbours represent insert, delete, and replace respectively.",
    solutions: [
      {
        name: "2D edit-cost tabulation",
        whenToUseMD:
          "Use this as the standard solution. It is concise, handles empty strings cleanly, and makes each edit operation visible in the recurrence.",
        approachMD:
          "Build a prefix table from smaller prefixes to larger prefixes. The first row and column are direct costs against the empty string. Every other cell either copies the diagonal on a character match or takes one plus the minimum of the insert, delete, and replace predecessor cells.",
        walkthroughMD:
          "1. Let **m** and **n** be the input lengths.\n2. Allocate **dp[m + 1][n + 1]**.\n3. Fill **dp[i][0] = i** and **dp[0][j] = j** for the empty-prefix conversions.\n4. For each pair of non-empty prefixes, compare **word1.charAt(i - 1)** and **word2.charAt(j - 1)**.\n5. Copy the diagonal if they match; otherwise compute one plus the minimum insert, delete, or replace cost.\n6. Return **dp[m][n]**.",
        complexity: {
          time: "O(m · n)",
          space: "O(m · n)",
          note: "The table contains one state for every pair of prefix lengths.",
        },
        filename: "Solution.java",
        code: `class Solution {

    public int minDistance(String word1, String word2) {
        int m = word1.length();
        int n = word2.length();
        int[][] dp = new int[m + 1][n + 1];

        for (int i = 0; i <= m; i++) {
            dp[i][0] = i;
        }
        for (int j = 0; j <= n; j++) {
            dp[0][j] = j;
        }

        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (word1.charAt(i - 1) == word2.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    int insertCost = dp[i][j - 1];
                    int deleteCost = dp[i - 1][j];
                    int replaceCost = dp[i - 1][j - 1];
                    dp[i][j] = 1 + Math.min(replaceCost, Math.min(insertCost, deleteCost));
                }
            }
        }

        return dp[m][n];
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "word1 = horse, word2 = ros. Each row is the DP row against prefixes of **ros**, including the empty-prefix column.",
      columns: ["word1 prefix", "dp row for prefixes of ros", "reason for final cell"],
      rows: [
        ["empty", "[0,1,2,3]", "Insert all target characters"],
        ["h", "[1,1,2,3]", "Replace h with r, then insert as needed"],
        ["ho", "[2,2,1,2]", "The o characters match at column 2"],
        ["hor", "[3,2,2,2]", "The r can match after deleting earlier extra characters"],
        ["hors", "[4,3,3,2]", "The s characters match at column 3"],
        ["horse", "[5,4,4,3]", "Delete the trailing e after reaching ros"],
      ],
      narrativeMD:
        "The bottom-right value is **3**, so horse can be converted to ros in three edits.",
    },
    complexityNote:
      "The full prefix table is O(m · n) time and space. A rolling-row optimization is possible, but the 2D table is clearer and is the expected first interview answer.",
    interviewTipsMD:
      "Name the operation represented by each neighbour. **dp[i][j - 1]** means insert the target character, **dp[i - 1][j]** means delete the source character, and **dp[i - 1][j - 1]** means replace. This prevents the recurrence from sounding memorized.",
    followUps: [
      "Can you reduce the memory to O(min(m, n)) while keeping the same recurrence?",
      "How would the recurrence change if insert, delete, and replace had different costs?",
      "How would you return the actual edit script, not just its length?",
      "What if only insertions and deletions are allowed?",
    ],
    similarProblems: [
      {
        title: "Longest Common Subsequence",
        difficulty: "Medium",
        slug: "dp-longest-common-subsequence",
        note: "Uses the same prefix grid but maximizes matches instead of minimizing edits.",
      },
      {
        title: "Longest Palindromic Subsequence",
        difficulty: "Medium",
        slug: "dp-longest-palindromic-subsequence",
        note: "Another sequence problem where skipping characters is the main decision.",
      },
      {
        title: "Distinct Subsequences",
        difficulty: "Hard",
        slug: "dp-distinct-subsequences",
        note: "Counts ways to form one string from another using subsequence choices.",
      },
      {
        title: "Delete Operation for Two Strings",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/delete-operation-for-two-strings/",
        note: "A restricted edit-distance variant that can be solved through LCS.",
      },
    ],
    keyTakeaways: [
      "Edit distance is a minimum-cost DP over two prefixes.",
      "Empty-prefix base cases encode all insertions or all deletions.",
      "A character match costs nothing and moves diagonally.",
      "A mismatch chooses the cheapest insert, delete, or replace predecessor plus one.",
    ],
    pattern:
      "Two-sequence cost DP: define dp[i][j] as the best cost between prefixes, seed empty-prefix costs, then map each allowed operation to a neighbouring cell.",
  },
  {
    kind: "problem",
    slug: "dp-longest-palindromic-subsequence",
    moduleId: "dp-sequence",
    order: 26,
    title: "Longest Palindromic Subsequence",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/longest-palindromic-subsequence/",
    tags: ["Dynamic Programming", "Sequence DP", "Interval DP", "Strings", "LCS"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Adobe", "Bloomberg"],
    estimatedReadingMin: 12,
    estimatedSolvingMin: 30,
    statementMD:
      "Given a string **s**, return the length of the longest palindromic subsequence in **s**. A subsequence may skip characters, and a palindrome reads the same forward and backward.",
    constraints: ["1 <= s.length <= 1000", "s consists only of lowercase English letters"],
    inputMD: "A lowercase string **s**.",
    outputMD: "An integer: the length of the longest palindromic subsequence.",
    examples: [
      {
        input: "s = bbbab",
        output: "4",
        explanation: "One longest palindromic subsequence is b, b, b, b.",
      },
      {
        input: "s = cbbd",
        output: "2",
        explanation: "The subsequence b, b is the longest palindrome.",
      },
      {
        input: "s = agbdba",
        output: "5",
        explanation: "One longest palindromic subsequence is a, b, d, b, a.",
      },
    ],
    learningObjectives: [
      "Define an interval DP state over the substring boundaries **i** and **j**.",
      "Fill interval states in an order that guarantees inner intervals are already known.",
      "Relate longest palindromic subsequence to LCS between a string and its reverse.",
      "Differentiate palindromic subsequence from palindromic substring.",
    ],
    intuitionMD:
      "A palindrome is controlled by its two ends. For a substring from **i** to **j**, if **s[i]** and **s[j]** match, those two characters can wrap the best palindromic subsequence inside **i + 1** to **j - 1**.\n\nIf the ends do not match, they cannot both be used as the outer pair of the same palindrome. The best answer must skip the left end or skip the right end, so take the better of those two smaller intervals.\n\nThe length is also equivalent to the LCS of **s** and **reverse(s)** because a palindromic subsequence appears in both directions. The interval DP is usually the cleaner explanation for this exact problem, while the LCS view connects it to the previous lesson.",
    commonMistakes: [
      "Solving longest palindromic substring instead of subsequence and requiring contiguous characters.",
      "Filling the table left-to-right by **i** before the inner interval **dp[i + 1][j - 1]** is available.",
      "When ends match, using only 2 and forgetting to add the best inner palindrome.",
      "When ends differ, taking the minimum or diagonal instead of max of skipping one end.",
      "For the LCS formulation, forgetting that the reversed string must preserve order in the opposite direction.",
    ],
    stateDefinitionMD:
      "Let **dp[i][j]** be the length of the longest palindromic subsequence contained in the substring from index **i** through index **j**, inclusive. The answer is **dp[0][n - 1]**.",
    stateTransitionMD:
      "Every single character is a palindrome, so **dp[i][i] = 1**.\n\nFor a longer interval **i..j**:\n\nIf **s[i] == s[j]**, then **dp[i][j] = 2 + dp[i + 1][j - 1]**. For length 2, the inner interval is empty and contributes 0.\n\nIf **s[i] != s[j]**, then **dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])**.\n\nFill by increasing interval length, or equivalently iterate **i** from **n - 1** down to 0 and **j** from **i + 1** up to **n - 1**. This ensures the inner, left-skipped, and right-skipped intervals are already computed.",
    solutions: [
      {
        name: "Interval DP by substring boundaries",
        whenToUseMD:
          "Use this as the primary solution. It directly models the palindrome endpoints and makes the required fill order clear.",
        approachMD:
          "Create a square table where each cell answers one substring interval. Fill from shorter intervals to longer intervals by moving the left boundary backward and the right boundary forward. Matching endpoints wrap the inner answer; non-matching endpoints choose the better skip.",
        walkthroughMD:
          "1. Let **n = s.length** and allocate **dp[n][n]**.\n2. Iterate **i** from **n - 1** down to 0. Set **dp[i][i] = 1** for the single-character interval.\n3. For each **i**, iterate **j** from **i + 1** to **n - 1**.\n4. If the endpoint characters match, store 2 plus the inner interval length.\n5. Otherwise, store the max of skipping the left endpoint and skipping the right endpoint.\n6. Return **dp[0][n - 1]**.",
        complexity: {
          time: "O(n^2)",
          space: "O(n^2)",
          note: "There are O(n^2) intervals and each is computed in O(1).",
        },
        filename: "Solution.java",
        code: `class Solution {

    public int longestPalindromeSubseq(String s) {
        int n = s.length();
        int[][] dp = new int[n][n];

        for (int i = n - 1; i >= 0; i--) {
            dp[i][i] = 1;
            for (int j = i + 1; j < n; j++) {
                if (s.charAt(i) == s.charAt(j)) {
                    int inner = 0;
                    if (i + 1 <= j - 1) {
                        inner = dp[i + 1][j - 1];
                    }
                    dp[i][j] = inner + 2;
                } else {
                    dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
                }
            }
        }

        return dp[0][n - 1];
    }
}`,
      },
      {
        name: "LCS with the reversed string",
        whenToUseMD:
          "Use this when you have just discussed LCS or want a quick reduction. It is equally valid for the length, though the interval DP usually communicates the palindrome-specific reasoning better.",
        approachMD:
          "Reverse **s** and compute the longest common subsequence between **s** and that reversed string. The best common-subsequence length matches the longest palindromic subsequence length in the original string.",
        walkthroughMD:
          "1. Build **reversed** with **new StringBuilder(s).reverse().toString()**.\n2. Run the standard LCS prefix DP between **s** and **reversed**.\n3. A match extends the diagonal; a mismatch skips one side.\n4. Return the bottom-right LCS length.",
        complexity: {
          time: "O(n^2)",
          space: "O(n^2)",
          note: "This is the standard LCS table on two strings of length n.",
        },
        filename: "Solution.java",
        code: `class Solution {

    public int longestPalindromeSubseq(String s) {
        String reversed = new StringBuilder(s).reverse().toString();
        int n = s.length();
        int[][] dp = new int[n + 1][n + 1];

        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= n; j++) {
                if (s.charAt(i - 1) == reversed.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }

        return dp[n][n];
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "s = bbbab. Trace selected interval states in the order smaller intervals become available before larger intervals.",
      columns: ["interval", "substring", "transition", "dp value"],
      rows: [
        ["[0,0]", "b", "single-character base case", "1"],
        ["[0,1]", "bb", "ends match, 2 plus empty middle", "2"],
        ["[1,2]", "bb", "ends match, 2 plus empty middle", "2"],
        ["[0,2]", "bbb", "ends match, 2 + dp[1][1]", "3"],
        ["[2,4]", "bab", "ends match, 2 + dp[3][3]", "3"],
        ["[1,4]", "bbab", "ends match, 2 + dp[2][3]", "3"],
        ["[0,4]", "bbbab", "ends match, 2 + dp[1][3]", "4"],
      ],
      narrativeMD:
        "The full interval **[0,4]** has value **4**, so the longest palindromic subsequence length is 4.",
    },
    complexityNote:
      "Both interval DP and the LCS reduction run in O(n^2) time and O(n^2) space. The interval form is more direct for explaining endpoint choices.",
    interviewTipsMD:
      "Emphasize fill order. The recurrence is simple, but it only works if **dp[i + 1][j - 1]**, **dp[i + 1][j]**, and **dp[i][j - 1]** are already known. A strong answer mentions both valid orders: increasing substring length or left index descending with right index ascending.",
    followUps: [
      "Can you reduce the interval DP to O(n) space?",
      "How would you reconstruct one longest palindromic subsequence?",
      "How is this different from Longest Palindromic Substring?",
      "Why does LCS with the reversed string give the same length?",
    ],
    similarProblems: [
      {
        title: "Longest Common Subsequence",
        difficulty: "Medium",
        slug: "dp-longest-common-subsequence",
        note: "LPS can be reduced to LCS between a string and its reverse.",
      },
      {
        title: "Edit Distance",
        difficulty: "Medium",
        slug: "dp-edit-distance",
        note: "Also uses skip and match decisions over string positions.",
      },
      {
        title: "Palindromic Substrings",
        difficulty: "Medium",
        slug: "dp-palindromic-substrings",
        note: "Palindrome DP over intervals, but asks for contiguous substrings.",
      },
      {
        title: "Longest Palindromic Substring",
        difficulty: "Medium",
        slug: "dp-longest-palindromic-substring",
        note: "Contrasts subsequence skipping with contiguous palindrome expansion.",
      },
    ],
    keyTakeaways: [
      "Interval DP is natural when a decision depends on both ends of a substring.",
      "Matching ends wrap the best inner palindromic subsequence.",
      "Non-matching ends force you to skip one side and take the better interval.",
      "Longest palindromic subsequence is equivalent in length to LCS of the string and its reverse.",
    ],
    pattern:
      "Interval sequence DP: define dp[i][j] on a substring, fill from short intervals to long intervals, and transition by matching or skipping endpoints.",
  },
];
