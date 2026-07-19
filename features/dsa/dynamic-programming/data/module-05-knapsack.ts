import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "dp-partition-equal-subset-sum",
    moduleId: "dp-knapsack",
    order: 27,
    title: "Partition Equal Subset Sum",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/partition-equal-subset-sum/",
    tags: ["Dynamic Programming", "0/1 Knapsack", "Subset Sum", "1D DP"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Adobe"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 25,
    statementMD:
      "Given an integer array **nums**, return **true** if you can partition the array into two subsets whose sums are equal. Each number must belong to exactly one of the two subsets.",
    constraints: [
      "1 <= nums.length <= 200",
      "1 <= nums[i] <= 100",
    ],
    inputMD: "An integer array **nums** containing positive values.",
    outputMD: "A boolean: **true** if the array can be split into two equal-sum subsets, otherwise **false**.",
    examples: [
      {
        input: "nums = [1,5,11,5]",
        output: "true",
        explanation: "The total is 22, so each subset must sum to 11. One valid subset is [11], and the remaining values [1, 5, 5] also sum to 11.",
      },
      {
        input: "nums = [1,2,3,5]",
        output: "false",
        explanation: "The total is 11, which is odd. Two integer subset sums cannot both equal half of an odd total.",
      },
      {
        input: "nums = [2,2,3,5]",
        output: "false",
        explanation: "The total is 12, so the target is 6, but no subset can make exactly 6 from these values.",
      },
    ],
    learningObjectives: [
      "Reduce equal partition to the classic subset-sum target **total / 2**.",
      "Use a 1D boolean DP array to represent reachable capacities after each item prefix.",
      "Explain why 0/1 knapsack scans capacity descending so an item is not reused in the same iteration.",
      "Recognise the parity check as an early impossibility test before building DP state.",
    ],
    intuitionMD:
      "If the array can be split into two subsets with equal sum, the total sum must be even. Once that is true, the entire problem becomes one question: can we pick some numbers whose sum is exactly **total / 2**? The other numbers automatically form the second half.\n\nThis is a choose-or-skip problem. For each number, either it participates in the target subset or it does not. That is the 0/1 knapsack pattern: every item is available once, and capacity is the target sum.\n\nThe subtle part is compressing the item dimension into one array. When processing a number, scanning capacities from high to low preserves the previous row for smaller capacities. If you scan upward, **dp[num]** can become true and then immediately help set **dp[2 * num]** during the same number, which accidentally changes 0/1 knapsack into unbounded knapsack.",
    commonMistakes: [
      "Starting DP without checking whether the total sum is odd.",
      "Scanning capacity ascending and accidentally allowing the same number to be used multiple times.",
      "Treating the problem as two independent subset searches instead of one target subset search.",
      "Using a 2D table when the previous item row can be safely compressed into one descending scan.",
    ],
    stateDefinitionMD:
      "Let **dp[c]** mean whether some subset of the numbers processed so far can make sum exactly **c**. The answer is **dp[target]**, where **target = total / 2**.",
    stateTransitionMD:
      "For a new number **num** and capacity **c**, there are two choices. Skip it, so **dp[c]** stays true if it was already true. Take it, which is possible when **c >= num** and the previous row could make **c - num**.\n\nThe compressed recurrence is **dp[c] = dp[c] OR dp[c - num]** for **c** from **target** down to **num**.\n\nBase case: **dp[0] = true**, because the empty subset makes sum 0. The descending capacity loop is essential: it keeps **dp[c - num]** from being updated by the current **num**, so each number is used at most once.",
    solutions: [
      {
        name: "1D 0/1 subset-sum DP",
        approachMD:
          "Compute the half-sum target, then maintain which capacities are reachable while processing each number once. The outer loop chooses the item, and the inner loop scans capacity descending to preserve 0/1 usage.",
        walkthroughMD:
          "1. Sum the array and return false immediately if the total is odd.\n2. Set **target = total / 2** and initialise **dp[0] = true**.\n3. For every **num**, scan capacities from **target** down to **num**.\n4. Mark **dp[c]** reachable if it was already reachable or if **c - num** was reachable before this number.\n5. Return **dp[target]** after all numbers are processed.",
        complexity: {
          time: "O(n · target)",
          space: "O(target)",
          note: "There are n numbers and each updates at most target capacities once.",
        },
        filename: "Solution.java",
        code: `class Solution {

    public boolean canPartition(int[] nums) {
        int total = 0;
        for (int num : nums) {
            total += num;
        }

        if ((total & 1) == 1) {
            return false;
        }

        int target = total / 2;
        boolean[] dp = new boolean[target + 1];
        dp[0] = true;

        for (int num : nums) {
            for (int capacity = target; capacity >= num; capacity--) {
                dp[capacity] = dp[capacity] || dp[capacity - num];
            }
        }

        return dp[target];
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [1, 5, 11, 5]. The total is 22, so the subset target is 11.",
      columns: ["item", "capacity scan", "reachable sums after item", "reason"],
      rows: [
        ["1", "11 down to 1", "{0, 1}", "Only sum 1 becomes newly reachable from 0."],
        ["5", "11 down to 5", "{0, 1, 5, 6}", "Taking 5 alone makes 5; taking it with 1 makes 6."],
        ["11", "11 down to 11", "{0, 1, 5, 6, 11}", "The target 11 becomes reachable, so an equal partition exists."],
        ["5", "11 down to 5", "{0, 1, 5, 6, 10, 11}", "The answer stays true; descending order still uses this final 5 only once."],
      ],
      narrativeMD: "The first time **11** appears in the reachable set, we have found one half of the partition. The remaining numbers must sum to the other half because the total is exactly **22**.",
    },
    complexityNote:
      "The optimal interview solution is the compressed 0/1 subset-sum table. The key correctness point is descending capacity iteration, not just the recurrence.",
    interviewTipsMD:
      "Start by saying that equal partition is subset sum with target **total / 2**. Then make the loop direction explicit: because every number can be chosen at most once, the capacity loop must go downward. Interviewers often use this problem to check whether you understand why 1D knapsack compression works.",
    followUps: [
      "Return one actual subset that forms the equal partition.",
      "Count how many subsets sum to **total / 2** instead of returning a boolean.",
      "What changes if each number may be used unlimited times?",
      "How would you minimise the absolute difference between the two subset sums?",
    ],
    similarProblems: [
      {
        title: "Target Sum",
        difficulty: "Medium",
        slug: "dp-target-sum",
        note: "Transforms signs into a subset-sum count and uses the same descending 0/1 loop.",
      },
      {
        title: "Ones and Zeroes",
        difficulty: "Medium",
        slug: "dp-ones-and-zeroes",
        note: "The same choose-or-skip rule with two capacities instead of one.",
      },
      {
        title: "Perfect Squares",
        difficulty: "Medium",
        slug: "dp-perfect-squares",
        note: "A target-sum DP where each square can be reused, so the loop direction changes.",
      },
      {
        title: "Last Stone Weight II",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/last-stone-weight-ii/",
        note: "Another partition-style problem that searches for a subset close to half the total.",
      },
    ],
    keyTakeaways: [
      "Equal partition reduces to finding one subset with sum **total / 2**.",
      "0/1 knapsack compression scans capacity descending to avoid reusing the current item.",
      "The empty subset base case **dp[0] = true** starts all reachable-sum DP tables.",
      "An odd total makes the problem impossible before DP begins.",
    ],
    pattern:
      "0/1 subset-sum DP: reduce the question to a target capacity, seed dp[0], process each item once, and scan capacities descending.",
  },
  {
    kind: "problem",
    slug: "dp-target-sum",
    moduleId: "dp-knapsack",
    order: 28,
    title: "Target Sum",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/target-sum/",
    tags: ["Dynamic Programming", "0/1 Knapsack", "Counting", "Subset Sum"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Bloomberg"],
    estimatedReadingMin: 11,
    estimatedSolvingMin: 28,
    statementMD:
      "You are given an integer array **nums** and an integer **target**. Assign either a plus sign or a minus sign to every number, then concatenate the signed numbers into an expression. Return the number of different sign assignments that evaluate to **target**.",
    constraints: [
      "1 <= nums.length <= 20",
      "0 <= nums[i] <= 1000",
      "0 <= sum(nums[i]) <= 1000",
      "-1000 <= target <= 1000",
    ],
    inputMD: "An integer array **nums** and an integer **target**.",
    outputMD: "An integer: the number of sign assignments whose expression value equals **target**.",
    examples: [
      {
        input: "nums = [1,1,1,1,1], target = 3",
        output: "5",
        explanation: "Choose exactly four numbers to be positive and one number to be negative. There are 5 choices for which one is negative.",
      },
      {
        input: "nums = [1], target = 1",
        output: "1",
        explanation: "Only the positive assignment reaches 1.",
      },
      {
        input: "nums = [0,0,0,0,0,0,0,0,1], target = 1",
        output: "256",
        explanation: "The eight zeroes can each receive either sign without changing the total, and the final 1 must be positive.",
      },
    ],
    learningObjectives: [
      "Derive the algebra that turns signed choices into a subset-sum count.",
      "Use 1D counting DP where each number is processed exactly once.",
      "Explain why descending iteration is still required even though the DP stores counts instead of booleans.",
      "Handle impossible parity and out-of-range target cases before tabulation.",
    ],
    intuitionMD:
      "A direct recursion chooses plus or minus for each number. That is a binary tree, but many branches only differ by which subset of numbers ended up positive.\n\nLet **P** be the sum of numbers assigned plus, and **N** be the sum of numbers assigned minus. The expression value is **P - N = target**. The total sum is **P + N = total**. Add the equations and you get **2P = total + target**, so **P = (total + target) / 2**.\n\nNow the problem is no longer about signs. It asks how many subsets have sum **(total + target) / 2**. Each number can be assigned once, so this is a 0/1 knapsack count. The capacity loop goes downward for the same reason as Partition Equal Subset Sum: a number cannot be counted twice in one sign assignment.",
    commonMistakes: [
      "Forgetting to reject cases where **abs(target) > total**.",
      "Forgetting that **total + target** must be even for the subset target to be an integer.",
      "Scanning sums ascending, which lets one number contribute multiple times to a single assignment.",
      "Mishandling zeroes; a zero doubles the count for every reachable sum because plus zero and minus zero are distinct assignments.",
    ],
    stateDefinitionMD:
      "Let **dp[s]** be the number of ways to choose a subset from the numbers processed so far whose sum is exactly **s**. After the algebraic transformation, the answer is **dp[subset]**, where **subset = (total + target) / 2**.",
    stateTransitionMD:
      "For each number **num**, every existing subset count can either skip **num** or take **num**. Taking it contributes all ways that previously made **s - num**.\n\nThe recurrence is **dp[s] = dp[s] + dp[s - num]** for **s** from **subset** down to **num**.\n\nBase case: **dp[0] = 1**, the empty subset. Descending iteration keeps the update 0/1. When **num = 0**, the loop still runs once for every sum and doubles **dp[s]**, correctly representing plus zero and minus zero.",
    solutions: [
      {
        name: "1D 0/1 subset count",
        approachMD:
          "Convert the sign equation into a subset target, then count subsets with that sum. This avoids exponential sign recursion while preserving the fact that each array element is used once.",
        walkthroughMD:
          "1. Sum all numbers.\n2. If **target** is outside **[-total, total]**, return 0.\n3. If **total + target** is odd, return 0 because no integer subset sum exists.\n4. Initialise **dp[0] = 1** and process each number.\n5. Scan sums descending and add **dp[s - num]** into **dp[s]**.\n6. Return **dp[subset]**.",
        complexity: {
          time: "O(n · subset)",
          space: "O(subset)",
          note: "The transformed target is at most the total sum of nums.",
        },
        filename: "Solution.java",
        code: `class Solution {

    public int findTargetSumWays(int[] nums, int target) {
        int total = 0;
        for (int num : nums) {
            total += num;
        }

        if (Math.abs(target) > total) {
            return 0;
        }

        int shifted = total + target;
        if ((shifted & 1) == 1) {
            return 0;
        }

        int subset = shifted / 2;
        int[] dp = new int[subset + 1];
        dp[0] = 1;

        for (int num : nums) {
            for (int sum = subset; sum >= num; sum--) {
                dp[sum] += dp[sum - num];
            }
        }

        return dp[subset];
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [1, 1, 1, 1, 1], target = 3. Here **total = 5**, so **subset = (5 + 3) / 2 = 4**.",
      columns: ["number processed", "sum scan", "dp[0..4] after processing", "meaning"],
      rows: [
        ["first 1", "4 down to 1", "[1, 1, 0, 0, 0]", "One way to make sum 1."],
        ["second 1", "4 down to 1", "[1, 2, 1, 0, 0]", "Two choices make sum 1; one choice makes sum 2."],
        ["third 1", "4 down to 1", "[1, 3, 3, 1, 0]", "Counts match choosing k ones from three."],
        ["fourth 1", "4 down to 1", "[1, 4, 6, 4, 1]", "There is one way to choose all four processed ones."],
        ["fifth 1", "4 down to 1", "[1, 5, 10, 10, 5]", "There are 5 subsets of sum 4, so there are 5 target expressions."],
      ],
      narrativeMD: "The target expression count equals the number of subsets with positive sum **4**. That final value is **dp[4] = 5**.",
    },
    complexityNote:
      "The expensive sign tree collapses into a pseudo-polynomial subset count over the total sum. The correctness hinges on the algebra and on descending 0/1 iteration.",
    interviewTipsMD:
      "Derive **P = (total + target) / 2** out loud. That algebra is the interview signal that you are not just memorising a DP table. Then call out the zero case and the descending loop; both are common sources of wrong accepted-looking solutions.",
    followUps: [
      "Return one valid sign assignment instead of only the count.",
      "What if each number could be assigned plus, minus, or unused?",
      "How would you solve it if the total sum were too large for pseudo-polynomial DP?",
      "How does the answer change when all numbers are positive and distinct?",
    ],
    similarProblems: [
      {
        title: "Partition Equal Subset Sum",
        difficulty: "Medium",
        slug: "dp-partition-equal-subset-sum",
        note: "The same subset-sum table, but boolean instead of counting.",
      },
      {
        title: "Coin Change II",
        difficulty: "Medium",
        slug: "dp-coin-change-ii",
        note: "Also counts ways to reach a target, but coins are unbounded and use ascending iteration.",
      },
      {
        title: "Ones and Zeroes",
        difficulty: "Medium",
        slug: "dp-ones-and-zeroes",
        note: "Another 0/1 selection problem, extended to two capacity dimensions.",
      },
      {
        title: "Expression Add Operators",
        difficulty: "Hard",
        url: "https://leetcode.com/problems/expression-add-operators/",
        note: "Also reasons about expressions, but requires backtracking rather than subset-sum DP.",
      },
    ],
    keyTakeaways: [
      "Signed target problems can often be transformed into subset-sum equations.",
      "For Target Sum, count subsets with sum **(total + target) / 2**.",
      "Counting DP still needs descending capacity iteration when each item is 0/1.",
      "Zero values double counts because plus zero and minus zero are different assignments.",
    ],
    pattern:
      "0/1 subset-count DP: transform the target, seed dp[0] = 1, and scan sums descending while adding previous counts.",
  },
  {
    kind: "problem",
    slug: "dp-coin-change",
    moduleId: "dp-knapsack",
    order: 29,
    title: "Coin Change",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/coin-change/",
    tags: ["Dynamic Programming", "Unbounded Knapsack", "Minimization", "1D DP"],
    companies: ["Amazon", "Google", "Microsoft", "Apple", "Bloomberg"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 25,
    statementMD:
      "You are given an integer array **coins** representing coin denominations and an integer **amount**. Return the fewest number of coins needed to make up **amount**. If that amount cannot be made by any combination of the coins, return **-1**. You may use each coin denomination an unlimited number of times.",
    constraints: [
      "1 <= coins.length <= 12",
      "1 <= coins[i] <= 2^31 - 1",
      "0 <= amount <= 10^4",
    ],
    inputMD: "An array **coins** of positive denominations and a target **amount**.",
    outputMD: "An integer: the minimum number of coins needed, or **-1** if no combination can form the amount.",
    examples: [
      {
        input: "coins = [1,2,5], amount = 11",
        output: "3",
        explanation: "The minimum is 3 coins: 5 + 5 + 1.",
      },
      {
        input: "coins = [2], amount = 3",
        output: "-1",
        explanation: "Only even amounts can be formed with coin 2, so amount 3 is unreachable.",
      },
      {
        input: "coins = [1], amount = 0",
        output: "0",
        explanation: "Zero coins are needed to form amount 0.",
      },
    ],
    learningObjectives: [
      "Recognise minimum-coin change as unbounded knapsack minimisation.",
      "Initialise unreachable states with a large sentinel and protect updates from impossible predecessors.",
      "Use ascending amount iteration because the same coin may be reused within one outer-loop iteration.",
      "Differentiate minimum-count DP from number-of-ways DP even though both use the coin-change family.",
    ],
    intuitionMD:
      "For every amount **a**, imagine asking for the best last coin. If the last coin is **coin**, then before taking it we must have formed **a - coin**. So a candidate answer is **dp[a - coin] + 1**.\n\nBecause coins can be reused forever, this is unbounded knapsack. That changes the loop direction from the previous 0/1 problems. When processing a coin, we scan amounts upward so **dp[a - coin]** may already include the current coin. That is not a bug here; it is exactly how 5 + 5 becomes available while processing coin 5.\n\nUnreachable amounts need a sentinel. Using **amount + 1** works because no valid answer can require more than **amount** coins when all coin values are positive and coin 1 is the worst possible valid case.",
    commonMistakes: [
      "Scanning amounts descending, which treats each coin denomination as usable once and breaks unbounded reuse.",
      "Initialising the table with zero for all amounts, making every amount look reachable.",
      "Returning the sentinel instead of converting unreachable amounts to -1.",
      "Confusing this minimisation problem with Coin Change II, which counts combinations rather than minimising coins.",
    ],
    stateDefinitionMD:
      "Let **dp[a]** be the minimum number of coins needed to form amount **a** using the coin denominations processed so far, with unlimited copies of those denominations. The answer is **dp[amount]** unless it remains unreachable.",
    stateTransitionMD:
      "Base case: **dp[0] = 0** because zero coins form amount 0. All other states start as a large sentinel.\n\nFor each **coin**, scan **a** from **coin** up to **amount** and apply **dp[a] = min(dp[a], dp[a - coin] + 1)** when **dp[a - coin]** is reachable.\n\nThe ascending scan is the core unbounded-knapsack detail. Since **a - coin < a**, the smaller amount may have been updated earlier in the same coin iteration, allowing the current coin to be used repeatedly. A descending scan would preserve the previous row and incorrectly make each coin denomination 0/1.",
    solutions: [
      {
        name: "1D unbounded minimisation DP",
        approachMD:
          "Process each denomination and relax every amount from low to high. The low-to-high scan lets the current coin feed future amounts in the same iteration, which models unlimited supply.",
        walkthroughMD:
          "1. Create a **dp** array of length **amount + 1**.\n2. Fill it with **amount + 1** as the unreachable sentinel, then set **dp[0] = 0**.\n3. For each coin, scan amounts from **coin** through **amount**.\n4. If **a - coin** is reachable, try taking one more copy of this coin.\n5. Return **-1** if **dp[amount]** is still the sentinel; otherwise return **dp[amount]**.",
        complexity: {
          time: "O(coins.length · amount)",
          space: "O(amount)",
          note: "Each coin relaxes every relevant amount once.",
        },
        filename: "Solution.java",
        code: `import java.util.Arrays;

class Solution {

    public int coinChange(int[] coins, int amount) {
        int impossible = amount + 1;
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, impossible);
        dp[0] = 0;

        for (int coin : coins) {
            for (int current = coin; current <= amount; current++) {
                if (dp[current - coin] != impossible) {
                    dp[current] = Math.min(dp[current], dp[current - coin] + 1);
                }
            }
        }

        return dp[amount] == impossible ? -1 : dp[amount];
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "coins = [1, 2, 5], amount = 11. The table stores the minimum coins for each amount from 0 to 11.",
      columns: ["coin", "amount scan", "dp[0..11] after coin", "key effect"],
      rows: [
        ["start", "none", "[0, ∞, ∞, ∞, ∞, ∞, ∞, ∞, ∞, ∞, ∞, ∞]", "Only amount 0 is reachable before any coin is processed."],
        ["1", "1 up to 11", "[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]", "Ascending scan reuses coin 1 for every amount."],
        ["2", "2 up to 11", "[0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6]", "Amounts like 4 improve to 2 + 2 because coin 2 can be reused."],
        ["5", "5 up to 11", "[0, 1, 1, 2, 2, 1, 2, 2, 3, 3, 2, 3]", "Amount 11 improves to 3 using 5 + 5 + 1."],
      ],
      narrativeMD: "The final cell is **dp[11] = 3**. If it had stayed at the sentinel, the correct return value would be **-1**.",
    },
    complexityNote:
      "This is pseudo-polynomial in the amount, not in the numeric size of the input encoding. For standard interview constraints, O(coins.length · amount) is expected.",
    interviewTipsMD:
      "Say the phrase **unbounded knapsack** and immediately contrast it with 0/1: here the amount loop goes upward because reusing the same coin is allowed. Also explain the sentinel choice; it prevents impossible states from looking like zero-coin solutions.",
    followUps: [
      "Return the actual coins used in one minimum solution.",
      "What if every coin denomination had a limited inventory?",
      "How would you count all combinations instead of minimising the number of coins?",
      "How would the solution change if coin order mattered?",
    ],
    similarProblems: [
      {
        title: "Coin Change II",
        difficulty: "Medium",
        slug: "dp-coin-change-ii",
        note: "Same unbounded capacity loop, but counts combinations instead of minimising coins.",
      },
      {
        title: "Perfect Squares",
        difficulty: "Medium",
        slug: "dp-perfect-squares",
        note: "Minimum number of reusable square values that sum to a target.",
      },
      {
        title: "Partition Equal Subset Sum",
        difficulty: "Medium",
        slug: "dp-partition-equal-subset-sum",
        note: "The 0/1 counterpart where descending capacity prevents reuse.",
      },
      {
        title: "Minimum Cost For Tickets",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/minimum-cost-for-tickets/",
        note: "Another minimisation DP where each state chooses the best previous coverage option.",
      },
    ],
    keyTakeaways: [
      "Coin Change is unbounded knapsack minimisation over the target amount.",
      "Use a sentinel for unreachable amounts and convert it to **-1** at the end.",
      "Amount iteration is ascending because the current coin may be reused immediately.",
      "The recurrence takes a minimum over the previous amount plus one coin.",
    ],
    pattern:
      "Unbounded minimisation DP: seed dp[0] = 0, fill the rest with a sentinel, process each reusable choice, and scan capacity ascending.",
  },
  {
    kind: "problem",
    slug: "dp-coin-change-ii",
    moduleId: "dp-knapsack",
    order: 30,
    title: "Coin Change II",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/coin-change-ii/",
    tags: ["Dynamic Programming", "Unbounded Knapsack", "Counting", "Combinations"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Adobe"],
    estimatedReadingMin: 11,
    estimatedSolvingMin: 28,
    statementMD:
      "You are given an integer **amount** and an array **coins** of distinct denominations. Return the number of combinations that make up that amount. You may use each coin denomination unlimited times. The order of coins inside a combination does not matter.",
    constraints: [
      "1 <= coins.length <= 300",
      "1 <= coins[i] <= 5000",
      "All values in coins are distinct",
      "0 <= amount <= 5000",
      "The answer fits in a signed 32-bit integer",
    ],
    inputMD: "A target **amount** and an array **coins** of positive, distinct denominations.",
    outputMD: "An integer: the number of unordered coin combinations that sum to **amount**.",
    examples: [
      {
        input: "amount = 5, coins = [1,2,5]",
        output: "4",
        explanation: "The combinations are 5, 2 + 2 + 1, 2 + 1 + 1 + 1, and 1 + 1 + 1 + 1 + 1.",
      },
      {
        input: "amount = 3, coins = [2]",
        output: "0",
        explanation: "No number of coin 2 can make the odd amount 3.",
      },
      {
        input: "amount = 10, coins = [10]",
        output: "1",
        explanation: "There is exactly one combination: use one coin of value 10.",
      },
    ],
    learningObjectives: [
      "Model coin-combination counting as unbounded knapsack counting.",
      "Use coin-outer and amount-ascending loops to count each unordered combination once.",
      "Explain why amount-outer and coin-inner loops count permutations, not combinations.",
      "Contrast the counting recurrence with Coin Change minimisation.",
    ],
    intuitionMD:
      "Coin Change II looks close to Coin Change, but the value stored in the DP table changes. We no longer want the fewest coins; we want the number of combinations.\n\nA combination should not be counted again just because the same coins are written in a different order. The standard trick is to process coin types one at a time. After processing coin 1 and coin 2, the table represents combinations that use only those coin types. When coin 5 arrives, it appends one or more 5s to combinations that were already counted with earlier coins and current 5s.\n\nThe loop direction is still ascending because coins are unlimited. The loop order is the part that prevents permutations. If you scan amount outside and try every coin inside, then amount 3 with coins 1 and 2 counts 1 + 2 and 2 + 1 separately. That is the Combination Sum IV pattern, not this problem.",
    commonMistakes: [
      "Using amount as the outer loop and counting ordered sequences instead of unordered combinations.",
      "Scanning amount descending, which prevents reusing the same coin and turns the problem into 0/1 counting.",
      "Initialising **dp[0]** to 0; there is exactly one way to make amount 0, by choosing no coins.",
      "Copying the Coin Change minimisation recurrence instead of adding counts.",
    ],
    stateDefinitionMD:
      "Let **dp[a]** be the number of combinations that form amount **a** using only the coin denominations processed so far. The answer is **dp[amount]** after all coins are processed.",
    stateTransitionMD:
      "Base case: **dp[0] = 1**, the empty combination. For each **coin**, scan **a** from **coin** up to **amount** and add combinations that end with one more copy of this coin:\n\n**dp[a] = dp[a] + dp[a - coin]**\n\nThe amount scan is ascending so **dp[a - coin]** may already include the current coin, enabling unlimited copies. The coin loop is outside so combinations are generated in coin-type order. This counts 1 + 2 + 2 once, while an amount-outer loop would count multiple coin orders like Combination Sum IV.",
    solutions: [
      {
        name: "1D unbounded combination count",
        approachMD:
          "Keep one count array over amounts. For each coin type, sweep amounts upward and add the number of ways to make the remaining amount after taking that coin.",
        walkthroughMD:
          "1. Initialise **dp[0] = 1** because the empty selection forms amount 0.\n2. For each coin, scan amounts from **coin** to **amount**.\n3. Add **dp[current - coin]** into **dp[current]**.\n4. Because the coin loop is outside, every combination is counted when its latest coin type is processed, not once per ordering.\n5. Return **dp[amount]**.",
        complexity: {
          time: "O(coins.length · amount)",
          space: "O(amount)",
          note: "Each coin updates every amount at most once.",
        },
        filename: "Solution.java",
        code: `class Solution {

    public int change(int amount, int[] coins) {
        int[] dp = new int[amount + 1];
        dp[0] = 1;

        for (int coin : coins) {
            for (int current = coin; current <= amount; current++) {
                dp[current] += dp[current - coin];
            }
        }

        return dp[amount];
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "amount = 5, coins = [1, 2, 5]. Track the combination counts for amounts 0 through 5.",
      columns: ["coin", "amount scan", "dp[0..5] after coin", "new combinations for amount 5"],
      rows: [
        ["start", "none", "[1, 0, 0, 0, 0, 0]", "No positive amount is reachable yet."],
        ["1", "1 up to 5", "[1, 1, 1, 1, 1, 1]", "One combination: five 1 coins."],
        ["2", "2 up to 5", "[1, 1, 2, 2, 3, 3]", "Add combinations using at least one 2: 2 + 1 + 1 + 1 and 2 + 2 + 1."],
        ["5", "5 up to 5", "[1, 1, 2, 2, 3, 4]", "Add the single combination 5."],
      ],
      narrativeMD: "The final value **dp[5] = 4** counts unordered combinations. No separate row appears for 1 + 2 + 2 versus 2 + 1 + 2 because coin types were processed in a fixed order.",
    },
    complexityNote:
      "The same O(coins.length · amount) shape appears in both Coin Change problems, but the recurrence and loop-order meaning are different: minimisation uses min, counting uses addition.",
    interviewTipsMD:
      "Be very explicit about combinations versus permutations. Say: coins outer prevents reordering duplicates; amount ascending permits unlimited copies. Then mention that reversing the loop nesting gives Combination Sum IV-style ordered counts.",
    followUps: [
      "How would you count ordered sequences instead of unordered combinations?",
      "What if each coin had a limited count?",
      "How would you reconstruct all combinations for a small amount?",
      "What changes if coin denominations are not distinct?",
    ],
    similarProblems: [
      {
        title: "Coin Change",
        difficulty: "Medium",
        slug: "dp-coin-change",
        note: "Same unbounded family, but minimises the number of coins.",
      },
      {
        title: "Target Sum",
        difficulty: "Medium",
        slug: "dp-target-sum",
        note: "Another target-counting problem, but each item is used at most once.",
      },
      {
        title: "Perfect Squares",
        difficulty: "Medium",
        slug: "dp-perfect-squares",
        note: "Uses unbounded choices to optimise rather than count.",
      },
      {
        title: "Combination Sum IV",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/combination-sum-iv/",
        note: "Counts ordered sequences, so it intentionally uses amount outer and coin inner loops.",
      },
    ],
    keyTakeaways: [
      "Coin Change II counts combinations, not minimum coins and not permutations.",
      "Unbounded reuse requires ascending amount iteration.",
      "Coin-outer loop order ensures each unordered combination is counted once.",
      "The base **dp[0] = 1** represents the empty combination.",
    ],
    pattern:
      "Unbounded combination-count DP: process choices in a fixed outer order, scan capacity ascending, and add dp[capacity - choice] into dp[capacity].",
  },
  {
    kind: "problem",
    slug: "dp-ones-and-zeroes",
    moduleId: "dp-knapsack",
    order: 31,
    title: "Ones and Zeroes",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/ones-and-zeroes/",
    tags: ["Dynamic Programming", "0/1 Knapsack", "2D DP", "Two Capacities"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Oracle"],
    estimatedReadingMin: 12,
    estimatedSolvingMin: 30,
    statementMD:
      "You are given an array **strs** of binary strings and two integers **m** and **n**. Return the size of the largest subset of **strs** with at most **m** zeroes and at most **n** ones. Each string can be used at most once.",
    constraints: [
      "1 <= strs.length <= 600",
      "1 <= strs[i].length <= 100",
      "strs[i] consists only of 0 and 1",
      "1 <= m, n <= 100",
    ],
    inputMD: "An array of binary strings **strs**, a zero budget **m**, and a one budget **n**.",
    outputMD: "An integer: the maximum number of strings that can be selected without exceeding either budget.",
    examples: [
      {
        input: "strs = ['10','0001','111001','1','0'], m = 5, n = 3",
        output: "4",
        explanation: "Choose 10, 0001, 1, and 0. Together they use 5 zeroes and 3 ones.",
      },
      {
        input: "strs = ['10','0','1'], m = 1, n = 1",
        output: "2",
        explanation: "Choose 0 and 1, or choose 10. The largest subset size is 2.",
      },
      {
        input: "strs = ['10','0001','111001'], m = 3, n = 4",
        output: "1",
        explanation: "The string 111001 fits exactly within the one budget, but no pair of strings fits both budgets.",
      },
    ],
    learningObjectives: [
      "Extend 0/1 knapsack from one capacity to two capacities: zeroes and ones.",
      "Precompute each string's resource cost before updating the DP table.",
      "Scan both capacity dimensions descending so the current string cannot be reused.",
      "Interpret **dp[z][o]** as a best subset size under two simultaneous budgets.",
    ],
    intuitionMD:
      "Each string is an item. Its value is 1 because selecting it increases the subset size by one. Its cost is two-dimensional: a number of zeroes and a number of ones. We want the maximum value without exceeding either capacity.\n\nThat is still knapsack. The only difference is that capacity is now a grid instead of a line. A state **dp[z][o]** answers: with zero budget **z** and one budget **o**, what is the largest number of strings we can keep from the prefix processed so far?\n\nBecause every string can be chosen at most once, both capacity loops must go downward. If either axis went upward, the same string could update a smaller state and then be read again for a larger state in the same outer iteration. Descending in both dimensions preserves the previous item row, exactly like 1D 0/1 knapsack.",
    commonMistakes: [
      "Using ascending loops for zeroes or ones and accidentally selecting the same string multiple times.",
      "Counting the string length as one capacity instead of separating zeroes and ones.",
      "Treating **m** and **n** as exact requirements rather than upper bounds.",
      "Using a 3D table over string index, zeroes, and ones when a descending 2D table is enough.",
    ],
    stateDefinitionMD:
      "Let **dp[z][o]** be the maximum number of strings selectable from the processed prefix using at most **z** zeroes and at most **o** ones. The answer is **dp[m][n]**.",
    stateTransitionMD:
      "For a string with **zeroCost** zeroes and **oneCost** ones, either skip it or take it if both budgets can pay the cost.\n\nThe recurrence is **dp[z][o] = max(dp[z][o], 1 + dp[z - zeroCost][o - oneCost])** for **z >= zeroCost** and **o >= oneCost**.\n\nAll states start at 0, meaning the empty subset is always valid. Scan **z** from **m** down to **zeroCost** and **o** from **n** down to **oneCost**. The double descending loop is the two-capacity version of 0/1 knapsack compression.",
    solutions: [
      {
        name: "2D 0/1 knapsack DP",
        approachMD:
          "Count zeroes and ones for each string, then update a 2D capacity table from high budgets down to low budgets. Each update asks whether taking the current string improves the best subset size for that budget pair.",
        walkthroughMD:
          "1. Create **dp[m + 1][n + 1]** initialised to 0.\n2. For each string, count its zeroes and ones.\n3. Iterate **zeroCap** from **m** down to the string's zero count.\n4. For each zero capacity, iterate **oneCap** from **n** down to the string's one count.\n5. Update the state by either skipping the string or taking it on top of the remaining budgets.\n6. Return **dp[m][n]**.",
        complexity: {
          time: "O(strs.length · m · n · L)",
          space: "O(m · n)",
          note: "L is the average string length used to count zeroes and ones; the DP update is O(strs.length · m · n).",
        },
        filename: "Solution.java",
        code: `class Solution {

    public int findMaxForm(String[] strs, int m, int n) {
        int[][] dp = new int[m + 1][n + 1];

        for (String str : strs) {
            int zeroes = 0;
            int ones = 0;

            for (char bit : str.toCharArray()) {
                if (bit == '0') {
                    zeroes++;
                } else {
                    ones++;
                }
            }

            for (int zeroCap = m; zeroCap >= zeroes; zeroCap--) {
                for (int oneCap = n; oneCap >= ones; oneCap--) {
                    dp[zeroCap][oneCap] = Math.max(
                            dp[zeroCap][oneCap],
                            1 + dp[zeroCap - zeroes][oneCap - ones]);
                }
            }
        }

        return dp[m][n];
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "strs = ['10', '0001', '111001', '1', '0'], m = 5, n = 3. Track the best value at the full budget and the decisive states.",
      columns: ["string", "zeroes, ones", "best at (5,3)", "important state after processing"],
      rows: [
        ["10", "1, 1", "1", "Any budget with at least 1 zero and 1 one can select one string."],
        ["0001", "3, 1", "2", "State (4,2) becomes 2 by taking 10 and 0001."],
        ["111001", "2, 4", "2", "It needs 4 ones, so it cannot fit within one budget 3."],
        ["1", "0, 1", "3", "State (4,3) becomes 3 by adding 1 to 10 and 0001."],
        ["0", "1, 0", "4", "State (5,3) becomes 4 by adding 0 to the previous best at (4,3)."],
      ],
      narrativeMD: "The best subset at full capacity uses exactly 5 zeroes and 3 ones: 10, 0001, 1, and 0. Descending updates ensure each of those strings is counted once.",
    },
    complexityNote:
      "This is the standard 0/1 knapsack compression with two capacity axes. The memory drops from an item-indexed 3D table to a 2D table because both axes are scanned descending.",
    interviewTipsMD:
      "Frame each string as an item with value 1 and two costs. Then stress that both capacity loops go downward. If an interviewer asks why, use the same explanation as 1D 0/1 knapsack: the current item must read from the previous row, not from states it just updated.",
    followUps: [
      "Return one largest subset, not just its size.",
      "What if each string had a different value instead of value 1?",
      "How would you handle three resource capacities instead of two?",
      "What if strings could be reused unlimited times?",
    ],
    similarProblems: [
      {
        title: "Partition Equal Subset Sum",
        difficulty: "Medium",
        slug: "dp-partition-equal-subset-sum",
        note: "The 1D version of 0/1 capacity compression.",
      },
      {
        title: "Target Sum",
        difficulty: "Medium",
        slug: "dp-target-sum",
        note: "Another 0/1 selection problem where descending iteration protects single-use items.",
      },
      {
        title: "Coin Change",
        difficulty: "Medium",
        slug: "dp-coin-change",
        note: "A useful contrast: unbounded items scan capacity ascending instead.",
      },
      {
        title: "Profitable Schemes",
        difficulty: "Hard",
        url: "https://leetcode.com/problems/profitable-schemes/",
        note: "A higher-dimensional knapsack count with people and profit capacities.",
      },
    ],
    keyTakeaways: [
      "Ones and Zeroes is 0/1 knapsack with two capacity dimensions.",
      "Each string has value 1 and costs equal to its zero and one counts.",
      "Both capacity loops must scan descending to avoid reusing the current string.",
      "A 2D table is enough because descending updates preserve the previous item row.",
    ],
    pattern:
      "Multi-capacity 0/1 knapsack: compute each item's resource costs, scan every capacity axis descending, and maximise value from remaining budgets.",
  },
];
