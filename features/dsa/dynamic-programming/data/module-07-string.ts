import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "dp-distinct-subsequences",
    moduleId: "dp-string",
    order: 35,
    title: "Distinct Subsequences",
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/distinct-subsequences/",
    tags: ["Dynamic Programming", "String DP", "Counting", "Subsequence", "2D DP"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple", "Bloomberg"],
    estimatedReadingMin: 11,
    estimatedSolvingMin: 30,
    statementMD:
      "Given two strings **s** and **t**, return the number of distinct subsequences of **s** that equal **t**. A subsequence is formed by deleting zero or more characters without changing the relative order of the remaining characters.",
    constraints: [
      "1 <= s.length, t.length <= 1000",
      "s and t consist of English letters.",
      "The answer fits in a signed 32-bit integer.",
    ],
    inputMD: "Two strings **s** and **t**.",
    outputMD: "An integer: the number of subsequences of **s** that exactly form **t**.",
    examples: [
      {
        input: "s = rabbbit, t = rabbit",
        output: "3",
        explanation: "There are three ways to delete one of the three middle **b** characters and keep the remaining letters in order.",
      },
      {
        input: "s = babgbag, t = bag",
        output: "5",
        explanation: "Each valid answer chooses a **b**, then a later **a**, then a later **g**. Five such ordered choices exist.",
      },
      {
        input: "s = abc, t = abc",
        output: "1",
        explanation: "The only matching subsequence keeps every character.",
      },
    ],
    learningObjectives: [
      "Model subsequence counting as a DP over two prefixes, one from the source and one from the target.",
      "Separate the two choices for each source character: skip it, or use it when it matches the next target character.",
      "Anchor counting DP with the empty target base case **dp[i][0] = 1**.",
      "Compress the table to one row by iterating target positions from right to left.",
    ],
    intuitionMD:
      "Think of scanning **s** from left to right while trying to build **t**. When the current character of **s** does not match the current character of **t**, it cannot help that target position, so the only choice is to skip it.\n\nWhen the characters do match, two disjoint groups of subsequences appear. Some skip this character of **s** and were already counted before. Others use this character as the final character of the current target prefix, so everything before it must have formed the previous target prefix. Adding those two groups counts every valid subsequence exactly once.",
    commonMistakes: [
      "Using substring matching instead of subsequence matching; characters in **s** may be skipped but order must stay fixed.",
      "Forgetting that the empty target has one match in every prefix of **s**: choose nothing.",
      "Updating a 1D table from left to right, which lets the same source character satisfy multiple target positions.",
      "Using **dp[i - 1][j - 1]** alone on a match and accidentally dropping the skip-this-character choices.",
      "Returning 0 when **t** is empty; the correct count is 1.",
    ],
    stateDefinitionMD:
      "Let **dp[i][j]** be the number of subsequences of the prefix **s[0..i)** that equal the prefix **t[0..j)**. The answer is **dp[m][n]**, where **m = s.length** and **n = t.length**.",
    stateTransitionMD:
      "Base cases: **dp[i][0] = 1** for every **i**, because the empty target is formed by deleting everything. Also **dp[0][j] = 0** for every positive **j**, because an empty source cannot form a non-empty target.\n\nFor **i > 0** and **j > 0**, first carry over the subsequences that skip **s[i - 1]**: **dp[i - 1][j]**. If **s[i - 1] == t[j - 1]**, we can also use that source character to finish the target prefix, adding **dp[i - 1][j - 1]**.\n\nSo the recurrence is **dp[i][j] = dp[i - 1][j] + dp[i - 1][j - 1]** on a character match, otherwise **dp[i][j] = dp[i - 1][j]**.",
    solutions: [
      {
        name: "Bottom-up 2D table",
        approachMD:
          "Build the prefix table directly. Each row adds one more character from **s**, and each column asks how many ways that source prefix can form a target prefix.",
        walkthroughMD:
          "1. Create a table with **m + 1** rows and **n + 1** columns.\n2. Fill column 0 with 1 because every source prefix forms the empty target once.\n3. For every source index **i** and target index **j**, copy **dp[i - 1][j]** for the skip case.\n4. If the current characters match, add **dp[i - 1][j - 1]** for the use case.\n5. Return **dp[m][n]**.",
        complexity: {
          time: "O(m · n)",
          space: "O(m · n)",
          note: "Every pair of source and target prefix lengths is computed once.",
        },
        filename: "Solution.java",
        code: `class Solution {

    public int numDistinct(String s, String t) {
        int m = s.length();
        int n = t.length();
        long[][] dp = new long[m + 1][n + 1];

        for (int i = 0; i <= m; i++) {
            dp[i][0] = 1;
        }

        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                dp[i][j] = dp[i - 1][j];
                if (s.charAt(i - 1) == t.charAt(j - 1)) {
                    dp[i][j] += dp[i - 1][j - 1];
                }
            }
        }

        return (int) dp[m][n];
    }
}`,
      },
      {
        name: "Space-optimized 1D table",
        whenToUseMD:
          "Use this after explaining the 2D recurrence when the interviewer asks for memory optimisation or when **t** is much shorter than **s**.",
        approachMD:
          "A row only depends on the previous row. Keep one array where **dp[j]** means the count for target prefix length **j** after processing the current source prefix. Iterate **j** descending so **dp[j - 1]** still belongs to the previous row.",
        walkthroughMD:
          "1. Initialise **dp[0] = 1** for the empty target.\n2. Scan each character of **s** from left to right.\n3. For target positions from **n** down to 1, add **dp[j - 1]** into **dp[j]** when the characters match.\n4. Descending order preserves the previous-row value needed by the use case.\n5. Return **dp[n]** after all source characters are processed.",
        complexity: {
          time: "O(m · n)",
          space: "O(n)",
          note: "Only the previous target-prefix counts are kept.",
        },
        filename: "Solution.java",
        code: `class Solution {

    public int numDistinct(String s, String t) {
        int n = t.length();
        long[] dp = new long[n + 1];
        dp[0] = 1;

        for (int i = 1; i <= s.length(); i++) {
            for (int j = n; j >= 1; j--) {
                if (s.charAt(i - 1) == t.charAt(j - 1)) {
                    dp[j] += dp[j - 1];
                }
            }
        }

        return (int) dp[n];
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "s = rabbbit, t = rabbit. The 1D row is shown after each processed source character for target prefixes empty, r, ra, rab, rabb, rabbi, rabbit.",
      columns: ["i", "source char", "processed prefix", "dp row", "note"],
      rows: [
        ["0", "none", "empty", "[1,0,0,0,0,0,0]", "Empty target has one match before scanning **s**."],
        ["1", "r", "r", "[1,1,0,0,0,0,0]", "The first character can form target prefix r."],
        ["2", "a", "ra", "[1,1,1,0,0,0,0]", "The prefix ra is now formed once."],
        ["3", "b", "rab", "[1,1,1,1,0,0,0]", "The first **b** can finish rab."],
        ["4", "b", "rabb", "[1,1,1,2,1,0,0]", "Two ways now form rab, and one way forms rabb."],
        ["5", "b", "rabbb", "[1,1,1,3,3,0,0]", "Any two of the three **b** positions can serve the two target **b** positions."],
        ["6", "i", "rabbbi", "[1,1,1,3,3,3,0]", "Each rabb match can extend to rabbi."],
        ["7", "t", "rabbbit", "[1,1,1,3,3,3,3]", "Each rabbi match extends to the full target."],
      ],
      narrativeMD: "The final count for the full target is **3**, matching the three possible choices of which middle **b** to skip.",
    },
    complexityNote:
      "Both solutions use the same O(m · n) recurrence. The 1D form is the interview-ready optimisation once the 2D table is understood.",
    interviewTipsMD:
      "Derive the recurrence from the current source character: skip it always, and use it only when it matches the current target character. Say the empty target base case out loud, because it is the most common missing row or column. If you present the 1D optimisation, emphasise descending target iteration to avoid reusing one source character twice.",
    followUps: [
      "How would you return the count modulo a large prime if the answer did not fit in 32 bits?",
      "How would you reconstruct one actual subsequence of **s** that forms **t**?",
      "What changes if **s** is streamed one character at a time?",
      "How would you count distinct subsequences for many target strings against the same source?",
    ],
    similarProblems: [
      {
        title: "Longest Common Subsequence",
        difficulty: "Medium",
        slug: "dp-longest-common-subsequence",
        note: "Also uses a two-prefix string DP table, but optimises length instead of counting matches.",
      },
      {
        title: "Edit Distance",
        difficulty: "Medium",
        slug: "dp-edit-distance",
        note: "Another pair-position DP where each state compares prefixes of two strings.",
      },
      {
        title: "Decode Ways",
        difficulty: "Medium",
        slug: "dp-decode-ways",
        note: "A counting DP with carefully defined base cases.",
      },
      {
        title: "Interleaving String",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/interleaving-string/",
        note: "Uses two indices to decide whether prefixes can form a target prefix.",
      },
    ],
    keyTakeaways: [
      "Two-string counting DP usually tracks how many ways one prefix can form another prefix.",
      "A match creates two disjoint groups: skip the source character or use it.",
      "The empty target base case contributes one way for every source prefix.",
      "1D compression requires descending target iteration.",
    ],
    pattern:
      "Prefix-pair counting DP: define dp over source and target prefixes, carry skip choices forward, add use choices on a character match, and compress by scanning the target backward.",
  },
  {
    kind: "problem",
    slug: "dp-palindromic-substrings",
    moduleId: "dp-string",
    order: 36,
    title: "Palindromic Substrings",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/palindromic-substrings/",
    tags: ["Dynamic Programming", "String DP", "Palindrome", "Interval DP", "Two Pointers"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Adobe", "Bloomberg"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 24,
    statementMD:
      "Given a string **s**, return the number of palindromic substrings in it. A substring is contiguous, and two substrings with the same text count separately if they start at different positions.",
    constraints: [
      "1 <= s.length <= 1000",
      "s consists of lowercase English letters.",
    ],
    inputMD: "A string **s**.",
    outputMD: "An integer: the total number of palindromic substrings in **s**.",
    examples: [
      {
        input: "s = abc",
        output: "3",
        explanation: "Only the three single-character substrings are palindromes.",
      },
      {
        input: "s = aaa",
        output: "6",
        explanation: "The palindromic substrings are three single **a** substrings, two **aa** substrings, and one **aaa** substring.",
      },
      {
        input: "s = ababa",
        output: "9",
        explanation: "There are five single characters, three length-3 palindromes, and the full length-5 palindrome.",
      },
    ],
    learningObjectives: [
      "Define an interval DP state that answers whether **s[i..j]** is a palindrome.",
      "Fill substring states by increasing length so the inner interval is already known.",
      "Count each true interval exactly once, including duplicates at different positions.",
      "Recognise center expansion as the O(1)-space version of the same palindrome structure.",
    ],
    intuitionMD:
      "A palindrome is controlled by its outside characters and its inside substring. For a substring **s[i..j]** to be a palindrome, the endpoints must match. If the substring has length 1 or 2, matching endpoints are enough. For longer substrings, the inside **s[i + 1..j - 1]** must already be a palindrome.\n\nThat naturally creates interval DP. Short substrings answer questions for longer substrings. Once an interval becomes true, increment the count immediately, because the problem counts substrings by position rather than by unique text.",
    commonMistakes: [
      "Counting unique palindrome texts instead of all palindromic positions.",
      "Filling by start index in an order where **dp[i + 1][j - 1]** has not been computed yet.",
      "Forgetting that every one-character substring is a palindrome.",
      "Mishandling even-length palindromes such as **aa**.",
      "Using subsequence logic; this problem is about contiguous substrings only.",
    ],
    stateDefinitionMD:
      "Let **dp[i][j]** be true when the substring **s[i..j]** is a palindrome. The answer is the number of pairs **(i, j)** for which **dp[i][j]** is true.",
    stateTransitionMD:
      "For every substring length from 1 to **n**, evaluate all starts **i** and ends **j = i + length - 1**.\n\nA substring is a palindrome when the endpoints match and the inside is valid: **s[i] == s[j]** and either **length <= 2** or **dp[i + 1][j - 1]** is true. Length 1 is automatically true through this rule because the endpoint is the same character. Length 2 only needs matching endpoints. Each time the condition is true, set **dp[i][j] = true** and add 1 to the answer.",
    solutions: [
      {
        name: "Interval DP by substring length",
        approachMD:
          "Fill a boolean table from shorter substrings to longer substrings. The table tells whether each interval is a palindrome, and the answer increments as soon as an interval becomes true.",
        walkthroughMD:
          "1. Create a **n x n** boolean table.\n2. Iterate **length** from 1 to **n**.\n3. For each start, compute the end of that length.\n4. If endpoints match and the inside is already palindromic, mark the interval true and increment **count**.\n5. Return **count** after all lengths are processed.",
        complexity: {
          time: "O(n^2)",
          space: "O(n^2)",
          note: "There are O(n^2) substrings, and each state is checked in O(1).",
        },
        filename: "Solution.java",
        code: `class Solution {

    public int countSubstrings(String s) {
        int n = s.length();
        boolean[][] dp = new boolean[n][n];
        int count = 0;

        for (int length = 1; length <= n; length++) {
            for (int start = 0; start + length <= n; start++) {
                int end = start + length - 1;
                if (s.charAt(start) == s.charAt(end)
                        && (length <= 2 || dp[start + 1][end - 1])) {
                    dp[start][end] = true;
                    count++;
                }
            }
        }

        return count;
    }
}`,
      },
      {
        name: "Expand around every center",
        whenToUseMD:
          "Use this when only the count is needed and you want the same O(n^2) time with O(1) extra space. It is often the cleanest interview implementation after you explain the interval relationship.",
        approachMD:
          "Every palindrome has a center: either one character for odd length or a gap between two characters for even length. Expanding from each center counts all palindromes that share that center.",
        walkthroughMD:
          "1. For each index, expand once with **left = right** for odd-length palindromes.\n2. Expand again with **right = left + 1** for even-length palindromes.\n3. During expansion, each successful matching pair identifies one palindromic substring.\n4. Sum the counts from all centers and return the total.",
        complexity: {
          time: "O(n^2)",
          space: "O(1)",
          note: "Each expansion can grow across the string, and there are O(n) centers.",
        },
        filename: "Solution.java",
        code: `class Solution {

    public int countSubstrings(String s) {
        int total = 0;

        for (int center = 0; center < s.length(); center++) {
            total += expand(s, center, center);
            total += expand(s, center, center + 1);
        }

        return total;
    }

    private int expand(String s, int left, int right) {
        int count = 0;

        while (left >= 0 && right < s.length()
                && s.charAt(left) == s.charAt(right)) {
            count++;
            left--;
            right++;
        }

        return count;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "s = aaa. Fill the interval DP table by increasing substring length and count every true interval.",
      columns: ["length", "substrings checked", "new palindromes", "count after length", "why"],
      rows: [
        ["1", "a at 0; a at 1; a at 2", "3", "3", "Every one-character substring is a palindrome."],
        ["2", "aa at 0..1; aa at 1..2", "2", "5", "Both adjacent pairs have matching endpoints."],
        ["3", "aaa at 0..2", "1", "6", "Endpoints match and the inner substring at 1..1 is true."],
      ],
      narrativeMD: "The total is **6**: three length-1 palindromes, two length-2 palindromes, and one length-3 palindrome.",
    },
    complexityNote:
      "The interval DP and center-expansion solutions both take O(n^2) time. Center expansion is preferable when you only need the count; interval DP is useful when later logic needs reusable palindrome states.",
    interviewTipsMD:
      "Clarify that duplicate text at different indices counts multiple times. Then present the endpoint-and-inside recurrence and fill by increasing length. If you switch to center expansion, connect it back to the same idea: expanding keeps validating matching endpoints around an already valid center.",
    followUps: [
      "How would you return the longest palindromic substring instead of the count?",
      "How would you count only palindromes of length at least **k**?",
      "How would you list all palindromic substrings without duplicates by text?",
      "What changes if the input can contain uppercase letters and punctuation?",
    ],
    similarProblems: [
      {
        title: "Longest Palindromic Substring",
        difficulty: "Medium",
        slug: "dp-longest-palindromic-substring",
        note: "Uses the same interval truth table but tracks the best range instead of counting every true range.",
      },
      {
        title: "Longest Palindromic Subsequence",
        difficulty: "Medium",
        slug: "dp-longest-palindromic-subsequence",
        note: "Also uses palindrome structure over ranges, but it may skip characters instead of requiring contiguity.",
      },
      {
        title: "Palindrome Partitioning",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/palindrome-partitioning/",
        note: "Often precomputes the same palindrome table before backtracking over cuts.",
      },
      {
        title: "Count Different Palindromic Subsequences",
        difficulty: "Hard",
        url: "https://leetcode.com/problems/count-different-palindromic-subsequences/",
        note: "A harder counting problem where duplicates by text must be handled carefully.",
      },
    ],
    keyTakeaways: [
      "Palindromic substring DP is an interval DP over **s[i..j]**.",
      "Shorter intervals must be solved before longer intervals because the transition reads the inside substring.",
      "The answer counts true positions, not distinct palindrome values.",
      "Center expansion is the O(1)-space counterpart when the table is not needed later.",
    ],
    pattern:
      "Palindrome interval DP: solve substrings by increasing length, require matching endpoints plus a valid inside, and count or record every interval that becomes true.",
  },
  {
    kind: "problem",
    slug: "dp-longest-palindromic-substring",
    moduleId: "dp-string",
    order: 37,
    title: "Longest Palindromic Substring",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/longest-palindromic-substring/",
    tags: ["Dynamic Programming", "String DP", "Palindrome", "Interval DP", "Two Pointers"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple", "Adobe"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 25,
    statementMD:
      "Given a string **s**, return the longest palindromic substring in **s**. If there are multiple answers with the same maximum length, returning any one of them is acceptable.",
    constraints: [
      "1 <= s.length <= 1000",
      "s consists of digits and English letters.",
    ],
    inputMD: "A string **s**.",
    outputMD: "A string: any longest contiguous substring of **s** that is a palindrome.",
    examples: [
      {
        input: "s = babad",
        output: "bab",
        explanation: "The substring **aba** is also a valid answer because it has the same maximum length.",
      },
      {
        input: "s = cbbd",
        output: "bb",
        explanation: "The longest palindrome is the even-length substring **bb**.",
      },
      {
        input: "s = a",
        output: "a",
        explanation: "A one-character string is already a palindrome.",
      },
    ],
    learningObjectives: [
      "Reuse interval palindrome states to identify valid substrings.",
      "Track the best start and length while filling the DP table.",
      "Handle both odd-length and even-length palindromes.",
      "Compare interval DP with center expansion for the same problem.",
    ],
    intuitionMD:
      "This is the optimisation version of counting palindromic substrings. The validity question is the same: do the endpoints match, and is the inside already a palindrome? The difference is that we do not count every true interval; we keep the longest true interval seen so far.\n\nFilling by increasing length is important. When considering **s[i..j]**, the state for **s[i + 1..j - 1]** must already be known. Each time an interval is true and longer than the current best, update the saved start and length. At the end, slice that range from the original string.",
    commonMistakes: [
      "Solving longest palindromic subsequence instead; this problem requires a contiguous substring.",
      "Checking endpoints without verifying that the inside substring is also a palindrome.",
      "Ignoring even-length palindromes such as **bb**.",
      "Updating the best range before confirming the interval is valid.",
      "Returning only the length when the problem asks for the substring.",
    ],
    stateDefinitionMD:
      "Let **dp[i][j]** be true when substring **s[i..j]** is a palindrome. Alongside the table, maintain **bestStart** and **bestLength** for the longest true interval found so far.",
    stateTransitionMD:
      "Process lengths from 1 to **n**. For each interval **i..j**, set **dp[i][j]** to true if **s[i] == s[j]** and either **length <= 2** or **dp[i + 1][j - 1]** is true.\n\nBase behavior is built into the length rule: length 1 substrings are palindromes, and length 2 substrings are palindromes only when their two characters match. Whenever **dp[i][j]** becomes true and **length > bestLength**, update the best range to **i..j**. The final answer is **s.substring(bestStart, bestStart + bestLength)**.",
    solutions: [
      {
        name: "Interval DP tracking the best range",
        approachMD:
          "Use a boolean palindrome table just like Palindromic Substrings, but instead of counting all true states, remember the longest true interval.",
        walkthroughMD:
          "1. Initialise **bestStart = 0** and **bestLength = 1** because every non-empty string has a one-character palindrome.\n2. Iterate substring lengths from 1 to **n**.\n3. Mark **dp[start][end]** true when endpoints match and the inside is valid.\n4. If the valid interval is longer than the saved best, update **bestStart** and **bestLength**.\n5. Return the substring represented by the best range.",
        complexity: {
          time: "O(n^2)",
          space: "O(n^2)",
          note: "Every substring interval is checked once, and the table stores O(n^2) booleans.",
        },
        filename: "Solution.java",
        code: `class Solution {

    public String longestPalindrome(String s) {
        int n = s.length();
        boolean[][] dp = new boolean[n][n];
        int bestStart = 0;
        int bestLength = 1;

        for (int length = 1; length <= n; length++) {
            for (int start = 0; start + length <= n; start++) {
                int end = start + length - 1;
                if (s.charAt(start) == s.charAt(end)
                        && (length <= 2 || dp[start + 1][end - 1])) {
                    dp[start][end] = true;
                    if (length > bestLength) {
                        bestStart = start;
                        bestLength = length;
                    }
                }
            }
        }

        return s.substring(bestStart, bestStart + bestLength);
    }
}`,
      },
      {
        name: "Expand around every center",
        whenToUseMD:
          "Use this when the interviewer wants the simplest O(1)-space implementation. It is usually preferred in production unless another part of the solution needs the full palindrome table.",
        approachMD:
          "Every palindrome expands from a center. Try each character as an odd center and each gap as an even center, then keep the longest expansion seen.",
        walkthroughMD:
          "1. Start with the first character as the best palindrome.\n2. For each center index, compute the longest odd palindrome and the longest even palindrome around that center.\n3. Convert the winning length back to start and end indices.\n4. Update the saved range only when the new palindrome is longer.\n5. Return the substring covered by the saved range.",
        complexity: {
          time: "O(n^2)",
          space: "O(1)",
          note: "There are O(n) centers, and each expansion can scan O(n) characters in the worst case.",
        },
        filename: "Solution.java",
        code: `class Solution {

    public String longestPalindrome(String s) {
        int bestStart = 0;
        int bestEnd = 0;

        for (int center = 0; center < s.length(); center++) {
            int oddLength = expand(s, center, center);
            if (oddLength > bestEnd - bestStart + 1) {
                int radius = oddLength / 2;
                bestStart = center - radius;
                bestEnd = center + radius;
            }

            int evenLength = expand(s, center, center + 1);
            if (evenLength > bestEnd - bestStart + 1) {
                int radius = evenLength / 2;
                bestStart = center - radius + 1;
                bestEnd = center + radius;
            }
        }

        return s.substring(bestStart, bestEnd + 1);
    }

    private int expand(String s, int left, int right) {
        while (left >= 0 && right < s.length()
                && s.charAt(left) == s.charAt(right)) {
            left--;
            right++;
        }

        return right - left - 1;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "s = babad. The interval DP is filled by increasing length while tracking the first longest palindrome found.",
      columns: ["length", "ranges that become true", "best after length", "reason"],
      rows: [
        ["1", "b, a, b, a, d", "b", "Single characters initialise valid palindromes."],
        ["2", "none", "b", "No adjacent equal pair exists."],
        ["3", "bab at 0..2; aba at 1..3", "bab", "Both ranges have matching endpoints and true one-character interiors; the first length-3 range remains best."],
        ["4", "none", "bab", "Every length-4 candidate fails an endpoint or inside check."],
        ["5", "none", "bab", "The full string has different endpoints, so it is not a palindrome."],
      ],
      narrativeMD: "The saved range is **bab**, so the method returns **bab**. A tie policy that updates on equal length could return **aba**, which is also valid.",
    },
    complexityNote:
      "Both authored approaches are O(n^2) time. Interval DP spends O(n^2) space to reuse states; center expansion keeps only the best range and is the usual space-optimised answer.",
    interviewTipsMD:
      "Start by distinguishing substring from subsequence. Then give the interval recurrence and mention that increasing length guarantees the inner state is ready. If you choose center expansion in code, still explain both odd and even centers; missing even centers is the classic bug.",
    followUps: [
      "How would you return the number of palindromic substrings instead of the longest one?",
      "How would you return all longest palindromic substrings if there are ties?",
      "Can you solve this in linear time with Manacher's algorithm, and why is it rarely expected in interviews?",
      "How would the answer change if you were allowed to delete characters, making it a subsequence problem?",
    ],
    similarProblems: [
      {
        title: "Palindromic Substrings",
        difficulty: "Medium",
        slug: "dp-palindromic-substrings",
        note: "Same palindrome-validity state, but the goal is counting every true interval.",
      },
      {
        title: "Longest Palindromic Subsequence",
        difficulty: "Medium",
        slug: "dp-longest-palindromic-subsequence",
        note: "Contrasts contiguous substrings with subsequences that may skip characters.",
      },
      {
        title: "Palindrome Partitioning",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/palindrome-partitioning/",
        note: "Uses palindrome intervals as a preprocessing step before choosing cuts.",
      },
      {
        title: "Shortest Palindrome",
        difficulty: "Hard",
        url: "https://leetcode.com/problems/shortest-palindrome/",
        note: "Another palindrome-boundary problem with a different string-matching technique.",
      },
    ],
    keyTakeaways: [
      "Longest Palindromic Substring is interval DP plus best-range tracking.",
      "A valid longer palindrome needs matching endpoints and a valid inner substring.",
      "Even-length palindromes must be handled explicitly.",
      "Center expansion gives the same O(n^2) time with O(1) extra space.",
    ],
    pattern:
      "Best-range palindrome DP: validate intervals from short to long, update the saved range on true states, and return the substring represented by the longest range.",
  },
];
