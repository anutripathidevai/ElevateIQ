import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "dp-word-break",
    moduleId: "dp-decision",
    order: 32,
    title: "Word Break",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/word-break/",
    tags: ["Dynamic Programming", "Decision DP", "String", "Hash Set", "Prefix DP"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple", "Bloomberg"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 22,
    statementMD:
      "Given a string **s** and a dictionary **wordDict** containing unique words, return **true** if **s** can be segmented into a space-separated sequence of one or more dictionary words. The same dictionary word may be reused multiple times.",
    constraints: [
      "1 <= s.length <= 300",
      "1 <= wordDict.length <= 1000",
      "1 <= wordDict[i].length <= 20",
      "**s** and **wordDict[i]** consist only of lowercase English letters.",
      "All strings in **wordDict** are unique.",
    ],
    inputMD: "A string **s** and a list of dictionary words **wordDict**.",
    outputMD: "A boolean: **true** if the full string can be segmented into dictionary words, otherwise **false**.",
    examples: [
      {
        input: "s = \"leetcode\", wordDict = [\"leet\", \"code\"]",
        output: "true",
        explanation: "The string splits as leet + code, and both pieces are in the dictionary.",
      },
      {
        input: "s = \"applepenapple\", wordDict = [\"apple\", \"pen\"]",
        output: "true",
        explanation: "The split apple + pen + apple is valid. Reusing apple is allowed.",
      },
      {
        input: "s = \"catsandog\", wordDict = [\"cats\", \"dog\", \"sand\", \"and\", \"cat\"]",
        output: "false",
        explanation: "Every promising prefix eventually leaves a suffix such as og or andog that is not segmentable.",
      },
    ],
    learningObjectives: [
      "Model segmentation as a prefix decision: choose the last word ending at position **i**.",
      "Use **dp[i]** to record whether the first **i** characters are segmentable.",
      "Use a **HashSet** so dictionary membership checks are fast enough inside the DP loops.",
      "Recognise an OR recurrence over all valid cut positions **j < i**.",
    ],
    intuitionMD:
      "Think about the last word in a valid segmentation. If the string prefix ending at index **i** is segmentable, then there must be some earlier cut **j** where the prefix before **j** was already segmentable and the slice from **j** to **i** is one dictionary word.\n\nThat turns the problem into a yes or no question for every prefix length. We do not need to remember the actual sequence of words for this version. We only need to know whether a prefix can be completed. Once **dp[j]** is true, any dictionary word starting at **j** can extend a valid segmentation to a later prefix.\n\nThe empty prefix matters. Setting **dp[0] = true** means a word that starts at the beginning of **s** can be accepted without needing a previous real word.",
    commonMistakes: [
      "Forgetting **dp[0] = true**, which prevents words that start at index 0 from ever being accepted.",
      "Checking dictionary membership with a list scan instead of a **HashSet**, making the nested loops unnecessarily slow.",
      "Treating a failed cut as proof that **dp[i]** is false; you must try every possible cut **j < i** until one works.",
      "Confusing substring boundaries: in Java, **substring(j, i)** includes **j** and excludes **i**.",
      "Assuming each dictionary word can be used once; the problem allows unlimited reuse.",
    ],
    stateDefinitionMD:
      "Let **dp[i]** be **true** when the prefix **s[0..i)**, the first **i** characters of **s**, can be segmented entirely into dictionary words. The answer is **dp[n]**, where **n = s.length()**.",
    stateTransitionMD:
      "For each ending position **i**, try every earlier cut **j < i**. The cut is valid when the prefix before the cut is already segmentable and the new piece is in the dictionary:\n\n**dp[i] = OR over j < i of (dp[j] AND dict.contains(s.substring(j, i)))**\n\nThe base case is **dp[0] = true** because the empty prefix is segmentable by choosing no words. All other states start as **false** until a valid cut proves them reachable.",
    solutions: [
      {
        name: "Bottom-up prefix DP with HashSet",
        whenToUseMD:
          "Use this in interviews as the standard solution: it directly expresses the cut decision, avoids exponential recursion, and is easy to optimise with a maximum word length bound.",
        approachMD:
          "Store the dictionary in a **HashSet**. Sweep the end index from left to right, and for each end index test possible starts of the last word. If **dp[start]** is true and the slice **s[start..end)** is a dictionary word, then **dp[end]** becomes true and we can stop checking that end index.",
        walkthroughMD:
          "1. Convert **wordDict** into a **HashSet** and record the maximum word length so impossible long slices are skipped.\n2. Create a boolean table of length **n + 1** and set **dp[0] = true**.\n3. For each **end** from 1 through **n**, try **start** positions that could form a dictionary word ending at **end**.\n4. When **dp[start]** is true and **s.substring(start, end)** is in the set, mark **dp[end] = true** and break the inner loop.\n5. Return **dp[n]** after every prefix has been considered.",
        complexity: {
          time: "O(n · L²)",
          space: "O(n + D)",
          note: "**L** is the maximum dictionary word length and **D** is the total dictionary storage. Java substring creation costs up to O(L) per candidate.",
        },
        filename: "Solution.java",
        code: `import java.util.HashSet;
import java.util.List;
import java.util.Set;

class Solution {

    public boolean wordBreak(String s, List<String> wordDict) {
        Set<String> words = new HashSet<>(wordDict);
        int maxWordLength = 0;
        for (String word : wordDict) {
            maxWordLength = Math.max(maxWordLength, word.length());
        }

        boolean[] dp = new boolean[s.length() + 1];
        dp[0] = true;

        for (int end = 1; end <= s.length(); end++) {
            int earliestStart = Math.max(0, end - maxWordLength);
            for (int start = end - 1; start >= earliestStart; start--) {
                if (dp[start] && words.contains(s.substring(start, end))) {
                    dp[end] = true;
                    break;
                }
            }
        }

        return dp[s.length()];
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "s = leetcode, wordDict = [leet, code]. Track whether each prefix length can be segmented.",
      columns: ["i", "prefix", "valid cut", "dp[i]", "reason"],
      rows: [
        ["0", "empty", "base", "true", "The empty prefix starts the recurrence."],
        ["1", "l", "none", "false", "No dictionary word completes a segmentable prefix."],
        ["2", "le", "none", "false", "The slice le is not in the dictionary."],
        ["3", "lee", "none", "false", "The slice lee is not in the dictionary."],
        ["4", "leet", "0 | leet", "true", "**dp[0]** is true and leet is a dictionary word."],
        ["5", "leetc", "none", "false", "The remaining suffix c is not a word."],
        ["6", "leetco", "none", "false", "No cut creates a known word after a true prefix."],
        ["7", "leetcod", "none", "false", "cod is not in the dictionary."],
        ["8", "leetcode", "4 | code", "true", "**dp[4]** is true and code is a dictionary word."],
      ],
      narrativeMD: "The table reaches **dp[8] = true** because the valid cut at 4 separates leet from code. Therefore the full string is segmentable.",
    },
    complexityNote:
      "The core DP checks possible last-word cuts for each prefix. The maximum-word-length bound keeps the loop practical for the given constraints while preserving the same recurrence.",
    interviewTipsMD:
      "Lead with the prefix state, then derive the recurrence from the last word of the segmentation. Mention **dp[0] = true** before writing loops; that base case is the most common source of bugs. If asked to return all segmentations, explain that the boolean table becomes a pruning guide and the output itself may be exponential.",
    followUps: [
      "Return one valid segmentation instead of only **true** or **false**.",
      "Return all valid segmentations, as in Word Break II.",
      "How would the solution change if dictionary membership supported wildcard characters?",
      "Can you reduce substring allocation costs by grouping words by length or using a trie?",
    ],
    similarProblems: [
      {
        title: "Decode Ways",
        difficulty: "Medium",
        slug: "dp-decode-ways",
        note: "Another prefix DP where a cut is valid only when the chosen token is allowed.",
      },
      {
        title: "Coin Change",
        difficulty: "Medium",
        slug: "dp-coin-change",
        note: "Also asks whether repeated pieces can build a target, but minimises a count instead of returning a boolean.",
      },
      {
        title: "Word Break II",
        difficulty: "Hard",
        url: "https://leetcode.com/problems/word-break-ii/",
        note: "Extends the same valid-cut idea but must enumerate every sentence.",
      },
      {
        title: "Palindrome Partitioning",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/palindrome-partitioning/",
        note: "Partitions a string into valid pieces, where validity means each piece is a palindrome.",
      },
    ],
    keyTakeaways: [
      "Decision DP often asks whether a prefix can be formed by choosing one valid final piece.",
      "**dp[0] = true** represents the empty prefix and allows the first word to start at index 0.",
      "A **HashSet** turns dictionary validation into a fast predicate inside the cut loop.",
      "Once one cut proves **dp[i]** true, the remaining cuts for that **i** are unnecessary.",
    ],
    pattern:
      "Prefix decision DP: let dp[i] describe the first i characters, try every last cut j, validate the piece from j to i, and OR together the reachable cuts.",
  },
  {
    kind: "problem",
    slug: "dp-perfect-squares",
    moduleId: "dp-decision",
    order: 33,
    title: "Perfect Squares",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/perfect-squares/",
    tags: ["Dynamic Programming", "Decision DP", "Unbounded Knapsack", "Math", "Minimum Count"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple", "Adobe"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 20,
    statementMD:
      "Given an integer **n**, return the least number of perfect square numbers whose sum is **n**. A perfect square is an integer of the form **k * k**, such as 1, 4, 9, or 16.",
    constraints: ["1 <= n <= 10000"],
    inputMD: "A single integer **n**.",
    outputMD: "An integer: the minimum number of perfect squares that sum to **n**.",
    examples: [
      {
        input: "n = 12",
        output: "3",
        explanation: "12 can be written as 4 + 4 + 4, so three squares are enough. No two perfect squares sum to 12.",
      },
      {
        input: "n = 13",
        output: "2",
        explanation: "13 can be written as 4 + 9.",
      },
      {
        input: "n = 1",
        output: "1",
        explanation: "The number 1 is already a perfect square.",
      },
    ],
    learningObjectives: [
      "Recognise perfect squares as reusable pieces for building every amount up to **n**.",
      "Define **dp[i]** as a minimum count rather than a boolean reachability state.",
      "Derive the recurrence by choosing the last square used in the sum.",
      "Connect the problem to unbounded knapsack because each square may be used repeatedly.",
    ],
    intuitionMD:
      "For any target amount **i**, imagine the last square you decide to use. If that square is **k * k**, then the remaining amount is **i - k * k**. The best way to finish that remainder is already stored in **dp[i - k * k]** once we process amounts from small to large.\n\nSo every square gives one candidate answer: solve the remainder optimally, then add this one square. The minimum over all square choices is the best answer for **i**.\n\nThis is unbounded-knapsack-flavoured because using a square does not consume it. After taking 4 once, the subproblem may take 4 again, which is exactly how 12 becomes 4 + 4 + 4.",
    commonMistakes: [
      "Using a greedy largest-square-first strategy; for many values, the locally largest square does not prove optimality.",
      "Forgetting **dp[0] = 0**, the base that makes an exact square cost one piece.",
      "Initialising every **dp[i]** to 0, which makes unsolved states look better than real candidates.",
      "Treating each perfect square as usable only once, even though the same square can appear multiple times.",
      "Looping only over square values already less than **n** and accidentally missing the case where **i** itself is a square.",
    ],
    stateDefinitionMD:
      "Let **dp[i]** be the minimum number of perfect squares needed to sum exactly to **i**. The answer is **dp[n]**.",
    stateTransitionMD:
      "For each amount **i**, try every square **k * k <= i** as the last chosen piece:\n\n**dp[i] = min over k * k <= i of dp[i - k * k] + 1**\n\nThe base case is **dp[0] = 0** because zero squares are needed to make amount 0. All positive states start at a large sentinel value and are improved by valid square choices.",
    solutions: [
      {
        name: "Bottom-up minimum-count DP",
        whenToUseMD:
          "Use this when the interviewer expects a DP derivation. It is deterministic, simple to justify, and mirrors the coin-change minimum-count pattern with square numbers as the coin set.",
        approachMD:
          "Build answers for amounts from 1 through **n**. For each amount, test every square not exceeding it. The candidate count is one chosen square plus the best count for the remaining amount. Keep the smallest candidate.",
        walkthroughMD:
          "1. Create **dp** of size **n + 1** and fill it with **n + 1**, a safe value larger than any possible answer.\n2. Set **dp[0] = 0**.\n3. For each **amount** from 1 to **n**, enumerate bases **base** while **base * base <= amount**.\n4. Let **square = base * base** and relax **dp[amount]** with **dp[amount - square] + 1**.\n5. Return **dp[n]** after all smaller amounts have been solved.",
        complexity: {
          time: "O(n · sqrt(n))",
          space: "O(n)",
          note: "Each amount tries all square numbers up to itself, and the table stores one value per amount.",
        },
        filename: "Solution.java",
        code: `import java.util.Arrays;

class Solution {

    public int numSquares(int n) {
        int[] dp = new int[n + 1];
        Arrays.fill(dp, n + 1);
        dp[0] = 0;

        for (int amount = 1; amount <= n; amount++) {
            for (int base = 1; base * base <= amount; base++) {
                int square = base * base;
                dp[amount] = Math.min(dp[amount], dp[amount - square] + 1);
            }
        }

        return dp[n];
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "n = 12. Build **dp[amount]** from 0 to 12 using square choices 1, 4, and 9 where applicable.",
      columns: ["amount", "squares tried", "best expression", "dp[amount]"],
      rows: [
        ["0", "none", "empty sum", "0"],
        ["1", "1", "1", "1"],
        ["2", "1", "1 + 1", "2"],
        ["3", "1", "1 + 1 + 1", "3"],
        ["4", "1, 4", "4", "1"],
        ["5", "1, 4", "4 + 1", "2"],
        ["6", "1, 4", "4 + 1 + 1", "3"],
        ["7", "1, 4", "4 + 1 + 1 + 1", "4"],
        ["8", "1, 4", "4 + 4", "2"],
        ["9", "1, 4, 9", "9", "1"],
        ["10", "1, 4, 9", "9 + 1", "2"],
        ["11", "1, 4, 9", "9 + 1 + 1", "3"],
        ["12", "1, 4, 9", "4 + 4 + 4", "3"],
      ],
      narrativeMD: "At amount 12, choosing square 4 leaves amount 8, whose best value is 2. Therefore **dp[12] = dp[8] + 1 = 3**.",
    },
    complexityNote:
      "This is the same minimum-count template as unbounded coin change, with the candidate coin list restricted to perfect squares no larger than the current amount.",
    interviewTipsMD:
      "Name the similarity to Coin Change, but be explicit that the generated coins are **1, 4, 9, ...** up to **n**. Explain why greedy is not the proof you want in a DP interview: the recurrence is what guarantees the global minimum. Keep the base case and sentinel initialisation clear before coding.",
    followUps: [
      "How would you return one actual list of squares that achieves the minimum?",
      "Can you solve the problem using shortest-path BFS over amounts?",
      "What changes if only a limited quantity of each square is available?",
      "How would number-theory results affect the asymptotic complexity?",
    ],
    similarProblems: [
      {
        title: "Coin Change",
        difficulty: "Medium",
        slug: "dp-coin-change",
        note: "The same minimum-count recurrence with arbitrary coin values instead of generated squares.",
      },
      {
        title: "Coin Change II",
        difficulty: "Medium",
        slug: "dp-coin-change-ii",
        note: "Uses reusable pieces too, but counts combinations instead of minimising piece count.",
      },
      {
        title: "Integer Break",
        difficulty: "Medium",
        slug: "dp-integer-break",
        note: "Another value-partition DP, but it maximises product instead of minimising count.",
      },
      {
        title: "Combination Sum IV",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/combination-sum-iv/",
        note: "Builds a target from reusable numbers with a different counting objective.",
      },
    ],
    keyTakeaways: [
      "Minimum-count DP chooses one final piece and adds one to the solved remainder.",
      "Perfect Squares is unbounded because the same square may be used repeatedly.",
      "A large sentinel value prevents unsolved states from winning a minimum comparison.",
      "The amount loop guarantees every remainder **i - square** has already been computed.",
    ],
    pattern:
      "Unbounded minimisation DP: let dp[i] be the best cost for value i, try every reusable valid piece not exceeding i, and minimise dp[i - piece] plus one.",
  },
  {
    kind: "problem",
    slug: "dp-integer-break",
    moduleId: "dp-decision",
    order: 34,
    title: "Integer Break",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/integer-break/",
    tags: ["Dynamic Programming", "Decision DP", "Math", "Maximisation", "Partition"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Adobe", "Bloomberg"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 18,
    statementMD:
      "Given an integer **n**, break it into the sum of at least two positive integers and maximise the product of those integers. Return the maximum product you can get.",
    constraints: ["2 <= n <= 58"],
    inputMD: "A single integer **n**.",
    outputMD: "An integer: the largest product obtainable after breaking **n** into at least two positive parts.",
    examples: [
      {
        input: "n = 2",
        output: "1",
        explanation: "The only valid break is 1 + 1, whose product is 1.",
      },
      {
        input: "n = 10",
        output: "36",
        explanation: "One optimal break is 3 + 3 + 4, giving product 36.",
      },
      {
        input: "n = 8",
        output: "18",
        explanation: "Breaking 8 as 3 + 3 + 2 gives product 18.",
      },
    ],
    learningObjectives: [
      "Define a max-product DP while respecting the requirement to make at least one cut.",
      "Derive the transition by choosing the first piece and deciding what to do with the remainder.",
      "Explain why the recurrence compares breaking the remainder with leaving it whole.",
      "Recognise integer partition problems as decision DP over cut positions.",
    ],
    intuitionMD:
      "The first cut separates **i** into a first piece **j** and a remainder **i - j**. That cut is mandatory because the problem requires at least two positive integers.\n\nAfter making that cut, the remainder presents a choice. Sometimes the best product leaves it whole, such as 2 + 2 for **i = 4**. Other times the best product breaks it further, such as taking 3 and then optimally breaking 7 when solving **i = 10**.\n\nThat is why the recurrence must compare both options: **j * (i - j)** for stopping after the current cut, and **j * dp[i - j]** for continuing to break the remainder.",
    commonMistakes: [
      "Using only **j * dp[i - j]** and forgetting the option to leave the remainder unbroken.",
      "Returning **n** for small values, which violates the requirement to break the integer at least once.",
      "Trying to use **dp[0]** as a meaningful product state; the transition only needs positive remainders.",
      "Counting different orders of the same pieces as separate choices, even though only the maximum product matters.",
      "Stopping the inner loop too early without proving symmetry; the full **1..i - 1** loop is easiest and safe.",
    ],
    stateDefinitionMD:
      "Let **dp[i]** be the maximum product obtainable by breaking integer **i** into at least two positive integers. The answer is **dp[n]**.",
    stateTransitionMD:
      "Choose the first piece **j**, where **1 <= j < i**. The remainder is **i - j**. Once this first cut has been made, there are two valid choices for the remainder:\n\n1. Stop breaking it: product **j * (i - j)**.\n2. Break it further using the best known value: product **j * dp[i - j]**.\n\nSo the recurrence is:\n\n**dp[i] = max over 1 <= j < i of max(j * (i - j), j * dp[i - j])**\n\nThe base **dp[1] = 0** means 1 cannot be broken into two positive parts. Values from 2 upward are computed from smaller remainders.",
    solutions: [
      {
        name: "Bottom-up max-product DP",
        whenToUseMD:
          "Use this to demonstrate the decision clearly. The mathematical greedy solution is shorter, but the DP recurrence is the best way to explain why breaking or preserving the remainder must both be considered.",
        approachMD:
          "Compute **dp[total]** for increasing totals. For every possible first piece, evaluate the product if the remainder stays whole and the product if the remainder is broken according to **dp**. The larger of those two is the best product for that first piece, and the maximum across first pieces becomes **dp[total]**.",
        walkthroughMD:
          "1. Create an integer array **dp** of size **n + 1**. The default **dp[1] = 0** is correct because 1 cannot be broken.\n2. For each **total** from 2 through **n**, initialise a local **best** product.\n3. Try every first piece **first** from 1 to **total - 1**.\n4. Compare **first * remainder** with **first * dp[remainder]** to decide whether the remainder should stay whole or be broken further.\n5. Store the best product for this total, then return **dp[n]**.",
        complexity: {
          time: "O(n²)",
          space: "O(n)",
          note: "Every total tries all possible first cuts, and the table stores one best product per total.",
        },
        filename: "Solution.java",
        code: `class Solution {

    public int integerBreak(int n) {
        int[] dp = new int[n + 1];

        for (int total = 2; total <= n; total++) {
            int best = 0;
            for (int first = 1; first < total; first++) {
                int remainder = total - first;
                int stopHere = first * remainder;
                int breakRemainder = first * dp[remainder];
                best = Math.max(best, Math.max(stopHere, breakRemainder));
            }
            dp[total] = best;
        }

        return dp[n];
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "n = 10. Track the best product for each total after considering all first cuts.",
      columns: ["total", "best decision", "dp[total]", "why"],
      rows: [
        ["2", "1 + 1", "1", "Only one valid cut exists."],
        ["3", "1 + 2", "2", "Leaving the remainder whole gives 1 * 2."],
        ["4", "2 + 2", "4", "Stopping at 2 * 2 beats breaking a remainder into 1s."],
        ["5", "2 + 3", "6", "Stopping at 2 * 3 is best."],
        ["6", "3 + 3", "9", "Stopping at 3 * 3 is best."],
        ["7", "3 + 4", "12", "The best product is 3 * 4, also reachable by breaking 4 as 2 + 2."],
        ["8", "3 + break 5", "18", "3 * dp[5] = 18 beats 3 * 5 = 15."],
        ["9", "3 + break 6", "27", "3 * dp[6] uses 3 + 3 + 3."],
        ["10", "3 + break 7", "36", "3 * dp[7] gives 3 + 3 + 4."],
      ],
      narrativeMD: "The answer for **n = 10** is **dp[10] = 36**. The critical step is allowing the remainder 7 to be broken further instead of multiplying by 7 directly.",
    },
    complexityNote:
      "The DP table is small for the given constraints, and the nested cut loop makes the break-or-not-break choice explicit for every integer.",
    interviewTipsMD:
      "Emphasise the phrase at least two positive integers. That requirement is exactly why **dp[i]** means the best product after a break, not the best product where choosing **i** itself is allowed. Then call out the key comparison: leave the remainder whole or replace it with its best broken product.",
    followUps: [
      "Can you derive the O(1) greedy solution based on using as many 3s as possible?",
      "How would you return the actual parts that produce the maximum product?",
      "What changes if exactly **k** parts are required?",
      "How would the recurrence change if each part had to belong to a given allowed set?",
    ],
    similarProblems: [
      {
        title: "Perfect Squares",
        difficulty: "Medium",
        slug: "dp-perfect-squares",
        note: "Both partition an integer by choosing reusable pieces, but this one maximises product.",
      },
      {
        title: "Coin Change",
        difficulty: "Medium",
        slug: "dp-coin-change",
        note: "Another value DP that tries all valid pieces before combining with a solved remainder.",
      },
      {
        title: "House Robber",
        difficulty: "Medium",
        slug: "dp-house-robber",
        note: "A max DP where each state compares competing decisions rather than counting all choices.",
      },
      {
        title: "Maximum Product Subarray",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/maximum-product-subarray/",
        note: "Also reasons about products, though the state tracks contiguous subarrays rather than integer cuts.",
      },
    ],
    keyTakeaways: [
      "Integer Break requires at least one cut, so **dp[i]** should represent a broken integer, not the option to keep **i** whole.",
      "After the first cut, the remainder may be better left whole or broken further.",
      "The recurrence maximises over all first pieces **j** and both remainder choices.",
      "Decision DP can optimise a value, not only answer reachable or unreachable.",
    ],
    pattern:
      "Value-partition maximisation DP: choose a first cut, compare stopping with continuing on the remainder, and keep the best product over all cut positions.",
  },
];
