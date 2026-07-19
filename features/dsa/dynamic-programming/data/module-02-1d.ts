import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "dp-fibonacci-number",
    moduleId: "dp-1d",
    order: 12,
    title: "Fibonacci Number",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/fibonacci-number/",
    tags: ["Dynamic Programming", "1D DP", "Fibonacci", "Math"],
    companies: ["Amazon", "Google", "Microsoft", "Adobe", "Apple"],
    estimatedReadingMin: 7,
    estimatedSolvingMin: 12,
    statementMD:
      "The Fibonacci numbers are defined by **F(0) = 0**, **F(1) = 1**, and **F(n) = F(n - 1) + F(n - 2)** for **n > 1**. Given **n**, return **F(n)**.",
    constraints: ["0 <= n <= 30"],
    inputMD: "A single integer **n**, the Fibonacci index to compute.",
    outputMD: "An integer: the value of **F(n)**.",
    examples: [
      { input: "n = 2", output: "1", explanation: "**F(2) = F(1) + F(0) = 1 + 0 = 1**." },
      { input: "n = 3", output: "2", explanation: "**F(3) = F(2) + F(1) = 1 + 1 = 2**." },
      { input: "n = 4", output: "3", explanation: "**F(4) = F(3) + F(2) = 2 + 1 = 3**." },
    ],
    learningObjectives: [
      "Recognise the simplest two-term 1D DP recurrence.",
      "Translate a mathematical recurrence into an iterative bottom-up loop.",
      "Compress a DP table to two rolling variables when only the previous two states are needed.",
    ],
    intuitionMD:
      "The definition already tells us the dependency graph: every Fibonacci value needs exactly the two values before it. If you try to compute it with plain recursion, the same smaller values are recomputed again and again. Dynamic programming removes that waste by building the values once, in increasing order.\n\nFor **F(n)**, the only live information needed at step **i** is **F(i - 2)** and **F(i - 1)**. Once **F(i)** is computed, the older value **F(i - 2)** will never be used again. That is why the full array is unnecessary: two rolling variables represent the last two DP cells.",
    commonMistakes: [
      "Using exponential recursion even though the recurrence has overlapping subproblems.",
      "Returning **1** for **n = 0** because of a copied climbing-stairs base case.",
      "Updating the rolling variables in the wrong order and losing the old previous value.",
      "Allocating an array for every input even though each state only needs two previous values.",
    ],
    stateDefinitionMD:
      "Let **dp[i]** be the Fibonacci value **F(i)**. The answer we want is **dp[n]**.",
    stateTransitionMD:
      "Each Fibonacci value is the sum of the two immediately previous values:\n\n**dp[i] = dp[i - 1] + dp[i - 2]** for **i >= 2**.\n\nBase cases anchor the sequence: **dp[0] = 0** and **dp[1] = 1**.",
    solutions: [
      {
        name: "Bottom-up with two rolling variables",
        approachMD:
          "Because **dp[i]** depends only on **dp[i - 1]** and **dp[i - 2]**, keep those two values and sweep forward from **2** to **n**.",
        walkthroughMD:
          "1. Return **n** directly for **n = 0** or **n = 1**.\n2. Initialise **twoNumbersBack = 0** for **F(0)** and **oneNumberBack = 1** for **F(1)**.\n3. For each index from **2** through **n**, compute the current Fibonacci value as their sum.\n4. Shift the rolling window forward so the current value becomes the new previous value.",
        complexity: { time: "O(n)", space: "O(1)", note: "One loop computes each Fibonacci index once while storing only two values." },
        filename: "Solution.java",
        code: `class Solution {

    public int fib(int n) {
        if (n <= 1) {
            return n;
        }

        int twoNumbersBack = 0;
        int oneNumberBack = 1;

        for (int index = 2; index <= n; index++) {
            int current = oneNumberBack + twoNumbersBack;
            twoNumbersBack = oneNumberBack;
            oneNumberBack = current;
        }

        return oneNumberBack;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "n = 6. Track the two rolling variables as the loop computes **F(2)** through **F(6)**.",
      columns: ["i", "twoNumbersBack", "oneNumberBack", "current"],
      rows: [
        ["2", "0", "1", "1"],
        ["3", "1", "1", "2"],
        ["4", "1", "2", "3"],
        ["5", "2", "3", "5"],
        ["6", "3", "5", "8"],
      ],
      narrativeMD: "After index 6, **oneNumberBack** holds **8**, so **F(6) = 8**.",
    },
    complexityNote:
      "The rolling-variable form is the expected optimal solution: linear time and constant space.",
    interviewTipsMD:
      "Use this problem to show the DP template cleanly: define a state, name the recurrence, seed the base cases, then compress space because the dependency window has size two. Be explicit that this is not the same base case as Climbing Stairs; Fibonacci starts at **0, 1**, while Climbing Stairs counts ways and starts from **1, 1**.",
    followUps: [
      "How would you return the whole Fibonacci sequence up to **n**?",
      "How would you compute **F(n)** modulo a large number?",
      "Can this recurrence be solved faster than O(n) using matrix exponentiation?",
      "How does this recurrence change when modelling Climbing Stairs?",
    ],
    similarProblems: [
      { title: "Climbing Stairs", difficulty: "Easy", slug: "dp-climbing-stairs", note: "Same two-term recurrence with counting base cases." },
      { title: "Min Cost Climbing Stairs", difficulty: "Easy", slug: "dp-min-cost-climbing-stairs", note: "Keeps a two-state window but minimises cost instead of summing counts." },
      { title: "House Robber", difficulty: "Medium", slug: "dp-house-robber", note: "Another constant-window 1D recurrence." },
      { title: "Decode Ways", difficulty: "Medium", slug: "dp-decode-ways", note: "A counting recurrence with conditional one-step and two-step moves." },
    ],
    keyTakeaways: [
      "Fibonacci is the smallest example of overlapping subproblems in 1D DP.",
      "The recurrence is **dp[i] = dp[i - 1] + dp[i - 2]** with base cases **0** and **1**.",
      "A constant dependency window can be compressed to rolling variables.",
    ],
    pattern:
      "Linear 1D DP with a fixed two-cell dependency window: seed the first two states, compute each next state once, and roll the variables forward.",
  },
  {
    kind: "problem",
    slug: "dp-climbing-stairs",
    moduleId: "dp-1d",
    order: 13,
    title: "Climbing Stairs",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/climbing-stairs/",
    tags: ["Dynamic Programming", "1D DP", "Fibonacci", "Math"],
    companies: ["Amazon", "Google", "Microsoft", "Adobe", "Apple"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 15,
    statementMD:
      "You are climbing a staircase that takes **n** steps to reach the top. Each time you can climb either **1** or **2** steps. In how many distinct ways can you climb to the top?",
    constraints: ["1 <= n <= 45"],
    inputMD: "A single integer **n**, the number of steps to the top.",
    outputMD: "An integer: the number of distinct ways to reach step **n**.",
    examples: [
      { input: "n = 2", output: "2", explanation: "Two ways: 1 + 1, or a single 2-step." },
      { input: "n = 3", output: "3", explanation: "Three ways: 1 + 1 + 1, 1 + 2, and 2 + 1." },
    ],
    learningObjectives: [
      "Model a counting problem as a sum of smaller counting subproblems.",
      "Recognise the Fibonacci recurrence hiding inside a step-counting question.",
      "Reduce a 1D table to two rolling variables for O(1) space.",
    ],
    intuitionMD:
      "Ask one focused question: how can you arrive at step **n**? Your very last move was either a single step from **n - 1** or a double step from **n - 2**. There is no other way to land on **n**.\n\nThose two groups never overlap, because they end with a different final move. So the number of ways to reach **n** is exactly the number of ways to reach **n - 1** plus the number of ways to reach **n - 2**. That is the Fibonacci recurrence, and recognising it is the whole problem.",
    commonMistakes: [
      "Trying to enumerate every path explicitly, which grows exponentially.",
      "Getting the base cases wrong: there is exactly one way to stand at step 0 and do nothing.",
      "Adding a factor for order; the two groups are already separated by their final move.",
    ],
    stateDefinitionMD:
      "Let **dp[i]** be the number of distinct ways to reach step **i** from the ground. The answer we want is **dp[n]**.",
    stateTransitionMD:
      "The final move onto step **i** came from step **i - 1** as a 1-step or step **i - 2** as a 2-step:\n\n**dp[i] = dp[i - 1] + dp[i - 2]**\n\nBase cases anchor the recurrence: **dp[0] = 1** for the empty climb and **dp[1] = 1** for a single 1-step.",
    solutions: [
      {
        name: "Bottom-up with two rolling variables",
        approachMD:
          "Because **dp[i]** depends only on the previous two values, you never need the whole array. Keep two variables for **dp[i - 2]** and **dp[i - 1]** and roll them forward.",
        walkthroughMD:
          "1. Handle the tiny cases where **n** is **1** or **2** directly.\n2. Initialise **twoStepsBack** as the ways to reach step 1 and **oneStepBack** as the ways to reach step 2.\n3. Sweep from step **3** up to **n**, each time computing the current ways as the sum of the previous two.\n4. After the loop, **oneStepBack** holds **dp[n]**.",
        complexity: { time: "O(n)", space: "O(1)", note: "A single pass with two integer variables." },
        filename: "Solution.java",
        code: `class Solution {

    public int climbStairs(int n) {
        if (n <= 2) {
            return n;
        }

        int twoStepsBack = 1;
        int oneStepBack = 2;

        for (int step = 3; step <= n; step++) {
            int current = oneStepBack + twoStepsBack;
            twoStepsBack = oneStepBack;
            oneStepBack = current;
        }

        return oneStepBack;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "n = 5. Track the two rolling variables as the window slides from step 3 to step 5.",
      columns: ["step", "twoStepsBack", "oneStepBack", "current"],
      rows: [
        ["3", "1", "2", "3"],
        ["4", "2", "3", "5"],
        ["5", "3", "5", "8"],
      ],
      narrativeMD: "The final value of **oneStepBack** is **8**, so there are 8 distinct ways to climb 5 steps.",
    },
    complexityNote:
      "The rolling-variable form runs in linear time and constant space, which is what an interviewer expects once you spot the Fibonacci structure.",
    interviewTipsMD:
      "State up front that this is Fibonacci in disguise. Derive the recurrence from the last move, name the base cases, then mention you can drop the array to two variables. Interviewers often follow up by changing the allowed step sizes, which turns the two-term recurrence into a wider window.",
    followUps: [
      "What if you can climb 1, 2, or 3 steps at a time?",
      "What if each step has a cost and you want the minimum-cost climb?",
      "How would you count ways when some steps are broken and cannot be used?",
    ],
    similarProblems: [
      { title: "Fibonacci Number", difficulty: "Easy", slug: "dp-fibonacci-number", note: "The same recurrence with different base cases." },
      { title: "Min Cost Climbing Stairs", difficulty: "Easy", slug: "dp-min-cost-climbing-stairs", note: "Adds a cost to each step and asks for a minimum." },
      { title: "House Robber", difficulty: "Medium", slug: "dp-house-robber", note: "Another two-term recurrence with a choice at each index." },
      { title: "Decode Ways", difficulty: "Medium", slug: "dp-decode-ways", note: "Counting paths where each step is conditionally valid." },
    ],
    keyTakeaways: [
      "Counting problems often decompose into a sum over the possible last moves.",
      "Climbing Stairs is the Fibonacci recurrence **dp[i] = dp[i - 1] + dp[i - 2]**.",
      "When **dp[i]** depends only on a fixed window, reduce the array to a few variables.",
    ],
    pattern:
      "Linear-scan 1D DP: define dp[i] from a constant number of previous cells, seed the base cases, then compress to rolling variables for O(1) space.",
  },
  {
    kind: "problem",
    slug: "dp-min-cost-climbing-stairs",
    moduleId: "dp-1d",
    order: 14,
    title: "Min Cost Climbing Stairs",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/min-cost-climbing-stairs/",
    tags: ["Dynamic Programming", "1D DP", "Array", "Minimization"],
    companies: ["Amazon", "Google", "Microsoft", "Adobe", "Apple"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 17,
    statementMD:
      "You are given an integer array **cost** where **cost[i]** is the cost of stepping on stair **i**. After paying the cost for a stair, you may climb either **1** or **2** steps. You may start from stair **0** or stair **1**. Return the minimum cost to reach the top, which is just beyond the last stair.",
    constraints: [
      "2 <= cost.length <= 1000",
      "0 <= cost[i] <= 999",
    ],
    inputMD: "An integer array **cost**, where each value is the cost of landing on that stair.",
    outputMD: "An integer: the minimum total cost required to reach the top beyond the final stair.",
    examples: [
      { input: "cost = [10,15,20]", output: "15", explanation: "Start at stair 1, pay 15, then take a 2-step to the top." },
      { input: "cost = [1,100,1,1,1,100,1,1,100,1]", output: "6", explanation: "The cheapest route pays the low-cost stairs and avoids the expensive 100-cost stairs where possible." },
    ],
    learningObjectives: [
      "Turn a path-counting staircase recurrence into a minimum-cost recurrence.",
      "Define state as the best cost to land on a stair, not the best cost after leaving it.",
      "Use the top position as a final choice between the last two reachable stairs.",
      "Compress the 1D minimum table to two rolling values.",
    ],
    intuitionMD:
      "The top has no cost, so the important question is the minimum cost to stand on each real stair. To land on stair **i**, your previous stair was either **i - 1** or **i - 2**. You must pay **cost[i]** when you land, so the best cost for **i** is its own cost plus the cheaper of those two previous best costs.\n\nAt the end, you do not have to land on a special top stair. You can jump to the top from either of the last two stairs, and jumping itself is free. That is why the answer is the minimum of the final two stair states.",
    commonMistakes: [
      "Treating the top as if it has the same cost as the last stair.",
      "Returning only the cost to land on the last stair, even though the second-to-last stair can jump directly to the top.",
      "Forgetting that you may start at stair 0 or stair 1.",
      "Using the climbing-stairs counting base cases instead of cost-based base cases.",
    ],
    stateDefinitionMD:
      "Let **dp[i]** be the minimum total cost required to land on stair **i**. The final answer is **min(dp[n - 1], dp[n - 2])** because the top can be reached from either of the last two stairs.",
    stateTransitionMD:
      "To land on stair **i**, come from **i - 1** or **i - 2**, then pay **cost[i]**:\n\n**dp[i] = cost[i] + min(dp[i - 1], dp[i - 2])** for **i >= 2**.\n\nBase cases are the costs of choosing the starting stair: **dp[0] = cost[0]** and **dp[1] = cost[1]**.",
    solutions: [
      {
        name: "Bottom-up with two rolling costs",
        approachMD:
          "The recurrence only needs the previous two landing costs. Store **dp[i - 2]** and **dp[i - 1]**, compute the current landing cost, and roll the window forward.",
        walkthroughMD:
          "1. Seed **twoStepsBack** with **cost[0]** and **oneStepBack** with **cost[1]**.\n2. For each stair from index **2** to the end, compute the minimum cost to land there.\n3. Shift the two rolling values after each stair.\n4. Return **min(oneStepBack, twoStepsBack)** because the top is reachable from either of the final two stairs.",
        complexity: { time: "O(n)", space: "O(1)", note: "Each stair is processed once and only two previous costs are stored." },
        filename: "Solution.java",
        code: `class Solution {

    public int minCostClimbingStairs(int[] cost) {
        int twoStepsBack = cost[0];
        int oneStepBack = cost[1];

        for (int step = 2; step < cost.length; step++) {
            int current = cost[step] + Math.min(oneStepBack, twoStepsBack);
            twoStepsBack = oneStepBack;
            oneStepBack = current;
        }

        return Math.min(oneStepBack, twoStepsBack);
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "cost = [1,100,1,1,1,100,1,1,100,1]. Start with **dp[0] = 1** and **dp[1] = 100**.",
      columns: ["step", "cost[step]", "twoStepsBack before", "oneStepBack before", "current cost to land"],
      rows: [
        ["2", "1", "1", "100", "2"],
        ["3", "1", "100", "2", "3"],
        ["4", "1", "2", "3", "3"],
        ["5", "100", "3", "3", "103"],
        ["6", "1", "3", "103", "4"],
        ["7", "1", "103", "4", "5"],
        ["8", "100", "4", "5", "104"],
        ["9", "1", "5", "104", "6"],
      ],
      narrativeMD: "After the last stair, the final two landing costs are **104** and **6**. The top is free to enter from either, so the answer is **6**.",
    },
    complexityNote:
      "This is a minimum version of the Climbing Stairs recurrence, with the same O(n) time and O(1) space after compression.",
    interviewTipsMD:
      "Emphasise what the state means: **dp[i]** is the cost to land on stair **i**, not the cost to reach the top from **i**. Then the final return becomes intuitive: the top is one move beyond the array and can be reached from either of the last two stairs without paying an extra cost.",
    followUps: [
      "What if you can climb up to **k** steps at a time?",
      "What if some stairs are blocked and cannot be stepped on?",
      "How would you recover the actual minimum-cost path, not just the cost?",
      "How would the recurrence change if jumping two steps had an extra cost?",
    ],
    similarProblems: [
      { title: "Climbing Stairs", difficulty: "Easy", slug: "dp-climbing-stairs", note: "Same movement model, but counts ways instead of minimising cost." },
      { title: "Fibonacci Number", difficulty: "Easy", slug: "dp-fibonacci-number", note: "The same two-previous-state dependency window." },
      { title: "Minimum Path Sum", difficulty: "Medium", slug: "dp-minimum-path-sum", note: "A grid version of choosing the cheaper predecessor plus local cost." },
      { title: "House Robber", difficulty: "Medium", slug: "dp-house-robber", note: "Another rolling recurrence that chooses between two previous outcomes." },
    ],
    keyTakeaways: [
      "For cost DP, define whether the cost is paid when entering or leaving a state.",
      "The top has no cost, so the answer is **min(dp[n - 1], dp[n - 2])**.",
      "Minimum recurrences often mirror counting recurrences with **min** replacing addition over choices.",
      "A two-cell dependency window compresses naturally to O(1) space.",
    ],
    pattern:
      "Cost-based 1D DP: define the best cost to land at index i, add the local cost to the best valid predecessor, then handle the destination as a final choice.",
  },
  {
    kind: "problem",
    slug: "dp-house-robber",
    moduleId: "dp-1d",
    order: 15,
    title: "House Robber",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/house-robber/",
    tags: ["Dynamic Programming", "1D DP", "Array", "Decision DP"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 20,
    statementMD:
      "You are a robber planning to rob houses along a street. Each house has some money, but adjacent houses have connected security systems. If you rob two adjacent houses, the alarm triggers. Given **nums**, where **nums[i]** is the money in house **i**, return the maximum amount you can rob without robbing adjacent houses.",
    constraints: [
      "1 <= nums.length <= 100",
      "0 <= nums[i] <= 400",
    ],
    inputMD: "An integer array **nums**, where each value is the money available in one house.",
    outputMD: "An integer: the maximum money that can be robbed without choosing adjacent houses.",
    examples: [
      { input: "nums = [1,2,3,1]", output: "4", explanation: "Rob houses 0 and 2 for a total of 1 + 3 = 4." },
      { input: "nums = [2,7,9,3,1]", output: "12", explanation: "Rob houses 0, 2, and 4 for a total of 2 + 9 + 1 = 12." },
    ],
    learningObjectives: [
      "Model a choose-or-skip decision as a 1D DP recurrence.",
      "Understand why choosing the current house forces the previous house to be skipped.",
      "Compress the best-prefix table to two rolling values.",
      "Explain the difference between local greed and global optimality.",
    ],
    intuitionMD:
      "At each house, there are only two meaningful choices. Skip the current house and keep the best answer from the previous index, or rob the current house and add its money to the best answer from two houses back. You cannot combine the current house with the previous house, so those are the only valid options.\n\nA greedy rule like always take the larger neighbour fails because early choices affect later compatibility. DP works because the decision at index **i** only needs two already-solved prefixes: best through **i - 1** and best through **i - 2**.",
    commonMistakes: [
      "Choosing the locally larger of each adjacent pair, which can miss better combinations across the whole array.",
      "Using **dp[i - 1] + nums[i]**, which illegally robs adjacent houses.",
      "Forgetting that skipping the current house is a valid choice and may be optimal.",
      "Writing special cases for many array lengths instead of using neutral base values of **0**.",
    ],
    stateDefinitionMD:
      "Let **dp[i]** be the maximum money that can be robbed from houses **0** through **i**, inclusive, without robbing adjacent houses. The answer is **dp[n - 1]**.",
    stateTransitionMD:
      "For house **i**, either skip it or rob it:\n\n- Skip house **i**: keep **dp[i - 1]**.\n- Rob house **i**: take **nums[i] + dp[i - 2]**.\n\nSo **dp[i] = max(dp[i - 1], dp[i - 2] + nums[i])**.\n\nUse base values **dp[-1] = 0** and **dp[-2] = 0** conceptually, which lets the rolling implementation handle the first houses cleanly.",
    solutions: [
      {
        name: "Bottom-up choose-or-skip with rolling values",
        approachMD:
          "Track the best answer up to the previous house and the best answer up to two houses back. For each current house, compare skipping it with robbing it.",
        walkthroughMD:
          "1. Initialise **twoHousesBack** and **oneHouseBack** to **0**, representing empty prefixes.\n2. For each house value, compute **robCurrent = twoHousesBack + value** and **skipCurrent = oneHouseBack**.\n3. The best answer through this house is **max(robCurrent, skipCurrent)**.\n4. Shift the rolling values so the current best becomes the previous best for the next iteration.",
        complexity: { time: "O(n)", space: "O(1)", note: "Each house is considered once with two stored prefix answers." },
        filename: "Solution.java",
        code: `class Solution {

    public int rob(int[] nums) {
        int twoHousesBack = 0;
        int oneHouseBack = 0;

        for (int money : nums) {
            int robCurrent = twoHousesBack + money;
            int skipCurrent = oneHouseBack;
            int current = Math.max(skipCurrent, robCurrent);
            twoHousesBack = oneHouseBack;
            oneHouseBack = current;
        }

        return oneHouseBack;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [2,7,9,3,1]. Start with empty-prefix values **twoHousesBack = 0** and **oneHouseBack = 0**.",
      columns: ["index", "nums[index]", "rob current", "skip current", "best up to index"],
      rows: [
        ["0", "2", "2", "0", "2"],
        ["1", "7", "7", "2", "7"],
        ["2", "9", "11", "7", "11"],
        ["3", "3", "10", "11", "11"],
        ["4", "1", "12", "11", "12"],
      ],
      narrativeMD: "The best final prefix value is **12**, achieved by robbing houses 0, 2, and 4.",
    },
    complexityNote:
      "The optimal recurrence is linear and constant-space because each decision needs only the two previous prefix answers.",
    interviewTipsMD:
      "Frame this as a choose-or-skip DP, not as a greedy pairing problem. Say that robbing house **i** forces the previous compatible prefix to end at **i - 2**, while skipping house **i** keeps the best prefix through **i - 1**. This explanation also sets up House Robber II cleanly.",
    followUps: [
      "What changes if the houses are arranged in a circle?",
      "How would you return the indices of the robbed houses?",
      "What if you must rob exactly **k** houses?",
      "What if houses form a binary tree instead of a line?",
    ],
    similarProblems: [
      { title: "House Robber II", difficulty: "Medium", slug: "dp-house-robber-ii", note: "Adds one circular dependency and solves two linear robber ranges." },
      { title: "Climbing Stairs", difficulty: "Easy", slug: "dp-climbing-stairs", note: "Another two-term recurrence, but counting instead of maximising." },
      { title: "Min Cost Climbing Stairs", difficulty: "Easy", slug: "dp-min-cost-climbing-stairs", note: "Uses the same rolling-state idea for minimisation." },
      { title: "Delete and Earn", difficulty: "Medium", url: "https://leetcode.com/problems/delete-and-earn/", note: "Transforms values into a House Robber style choose-or-skip recurrence." },
    ],
    keyTakeaways: [
      "Choose-or-skip problems often become **max(skip, take)** recurrences.",
      "Taking the current house combines with **dp[i - 2]**, not **dp[i - 1]**.",
      "Neutral base values of **0** simplify prefix DP edge cases.",
      "The full table can be compressed to the previous two prefix answers.",
    ],
    pattern:
      "Choose-or-skip 1D DP: for each index, compare carrying the previous best with taking the current value plus the best compatible earlier state.",
  },
  {
    kind: "problem",
    slug: "dp-house-robber-ii",
    moduleId: "dp-1d",
    order: 16,
    title: "House Robber II",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/house-robber-ii/",
    tags: ["Dynamic Programming", "1D DP", "Array", "Circular Array"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 22,
    statementMD:
      "The houses are arranged in a circle, so the first and last houses are also adjacent. Each house contains money, and robbing adjacent houses triggers the alarm. Given **nums**, return the maximum amount you can rob without robbing adjacent houses.",
    constraints: [
      "1 <= nums.length <= 100",
      "0 <= nums[i] <= 1000",
    ],
    inputMD: "An integer array **nums**, where the first and last entries are neighbouring houses because the street is circular.",
    outputMD: "An integer: the maximum money that can be robbed without choosing adjacent circular neighbours.",
    examples: [
      { input: "nums = [2,3,2]", output: "3", explanation: "You cannot rob both 2-value houses because they are first and last, so rob the middle house." },
      { input: "nums = [1,2,3,1]", output: "4", explanation: "Rob houses 0 and 2. The circular constraint only forbids taking houses 0 and 3 together." },
      { input: "nums = [1,2,3]", output: "3", explanation: "The best valid choice is the last house with value 3." },
    ],
    learningObjectives: [
      "Break a circular adjacency constraint into two linear subproblems.",
      "Reuse the House Robber recurrence on a selected inclusive range.",
      "Handle the single-house edge case before splitting ranges.",
      "Explain why excluding first or excluding last covers every valid solution.",
    ],
    intuitionMD:
      "The only new conflict is between the first and last houses. A valid robbery plan cannot include both. Therefore every valid plan belongs to one of two groups: plans that exclude the first house, or plans that exclude the last house. Those two groups cover all possibilities.\n\nOnce one endpoint is excluded, the remaining houses form a normal line. So we do not need a new recurrence. We run the linear House Robber helper twice, once on houses **0** through **n - 2** and once on houses **1** through **n - 1**, then take the better result.",
    commonMistakes: [
      "Running the original House Robber recurrence on the whole array and accidentally allowing both endpoints.",
      "Excluding both the first and last houses, which is too restrictive.",
      "Forgetting the single-house case, where both split ranges would be invalid or empty.",
      "Trying to track circular state inside one complicated DP instead of reducing to two clean linear runs.",
    ],
    stateDefinitionMD:
      "For a linear range **start...end**, let **dp[i]** be the maximum money that can be robbed from that range up to house **i** without robbing adjacent houses. The circular answer is **max(linear(0, n - 2), linear(1, n - 1))**.",
    stateTransitionMD:
      "Inside either linear range, the recurrence is the same as House Robber:\n\n**dp[i] = max(dp[i - 1], dp[i - 2] + nums[i])**.\n\nThe circular base case is **n = 1**, where the answer is **nums[0]**. For longer arrays, one linear pass excludes the last house and the other excludes the first house, so the endpoint conflict disappears.",
    solutions: [
      {
        name: "Two linear robber passes",
        approachMD:
          "Split the circle into two lines: one range that cannot use the last house, and one range that cannot use the first house. Reuse an O(1)-space linear robber helper for both ranges.",
        walkthroughMD:
          "1. If there is only one house, return its value immediately.\n2. Compute the best linear robbery from index **0** through **n - 2**.\n3. Compute the best linear robbery from index **1** through **n - 1**.\n4. Return the maximum of the two results because every valid circular plan excludes at least one endpoint.",
        complexity: { time: "O(n)", space: "O(1)", note: "Two linear passes over overlapping ranges still take linear time and constant extra space." },
        filename: "Solution.java",
        code: `class Solution {

    public int rob(int[] nums) {
        int n = nums.length;
        if (n == 1) {
            return nums[0];
        }

        int excludeLast = robLinear(nums, 0, n - 2);
        int excludeFirst = robLinear(nums, 1, n - 1);
        return Math.max(excludeLast, excludeFirst);
    }

    private int robLinear(int[] nums, int start, int end) {
        int twoHousesBack = 0;
        int oneHouseBack = 0;

        for (int index = start; index <= end; index++) {
            int current = Math.max(oneHouseBack, twoHousesBack + nums[index]);
            twoHousesBack = oneHouseBack;
            oneHouseBack = current;
        }

        return oneHouseBack;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [1,2,3,1]. Run the linear helper twice: exclude the last house, then exclude the first house.",
      columns: ["pass", "index", "house value", "twoHousesBack before", "oneHouseBack before", "current best"],
      rows: [
        ["exclude last", "0", "1", "0", "0", "1"],
        ["exclude last", "1", "2", "0", "1", "2"],
        ["exclude last", "2", "3", "1", "2", "4"],
        ["exclude first", "1", "2", "0", "0", "2"],
        ["exclude first", "2", "3", "0", "2", "3"],
        ["exclude first", "3", "1", "2", "3", "3"],
      ],
      narrativeMD: "The best range excluding the last house is **4**. The best range excluding the first house is **3**. Taking the maximum gives **4**.",
    },
    complexityNote:
      "The circle is handled by two O(n) linear passes, not by a new higher-dimensional DP table.",
    interviewTipsMD:
      "The key interview move is the reduction: first and last cannot both be chosen, so solve one case without the first and one case without the last. After that, reuse the original House Robber recurrence. Mention the **n = 1** edge case before forming ranges.",
    followUps: [
      "What if houses are arranged in a binary tree instead of a circle?",
      "How would you return which houses were robbed for the chosen circular plan?",
      "What if at least one house must be robbed even when all values are zero?",
      "How would the solution change if houses within distance 2 could not both be robbed?",
    ],
    similarProblems: [
      { title: "House Robber", difficulty: "Medium", slug: "dp-house-robber", note: "The linear helper is exactly the original problem." },
      { title: "Min Cost Climbing Stairs", difficulty: "Easy", slug: "dp-min-cost-climbing-stairs", note: "Another constant-space recurrence over a line." },
      { title: "Stone Game", difficulty: "Medium", slug: "dp-stone-game", note: "A different game-style DP where endpoints matter." },
      { title: "Delete and Earn", difficulty: "Medium", url: "https://leetcode.com/problems/delete-and-earn/", note: "Another problem that reduces to House Robber after preprocessing." },
    ],
    keyTakeaways: [
      "A circular endpoint conflict can often be split into exclude-first and exclude-last cases.",
      "After removing one endpoint, the original linear DP recurrence applies unchanged.",
      "Handle **n = 1** before creating the two ranges.",
      "Two linear passes are still O(n) time and O(1) space.",
    ],
    pattern:
      "Circular 1D DP reduction: break the endpoint conflict into two linear ranges, solve each with the original recurrence, and take the better result.",
  },
  {
    kind: "problem",
    slug: "dp-decode-ways",
    moduleId: "dp-1d",
    order: 17,
    title: "Decode Ways",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/decode-ways/",
    tags: ["Dynamic Programming", "1D DP", "String", "Counting"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Bloomberg"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 25,
    statementMD:
      "A message containing digits is encoded by mapping **A** to **1**, **B** to **2**, and so on through **Z** to **26**. Given a digit string **s**, return the number of ways to decode it. A group with a leading zero is invalid, and **0** can only appear as part of **10** or **20**.",
    constraints: [
      "1 <= s.length <= 100",
      "s contains only digits and may contain leading zeroes",
    ],
    inputMD: "A digit string **s**.",
    outputMD: "An integer: the number of valid decodings of the entire string.",
    examples: [
      { input: "s = 12", output: "2", explanation: "The valid decodings are 1 + 2 and 12." },
      { input: "s = 226", output: "3", explanation: "The valid decodings are 2 + 2 + 6, 22 + 6, and 2 + 26." },
      { input: "s = 06", output: "0", explanation: "A leading zero cannot be decoded alone, and 06 is not a valid two-digit code." },
    ],
    learningObjectives: [
      "Define DP over prefix length rather than over the current character alone.",
      "Add contributions only when the one-digit or two-digit choice is valid.",
      "Handle zeroes correctly without special-case explosions.",
      "Compress the prefix-count table to two rolling counts.",
    ],
    intuitionMD:
      "Think of decoding as walking through the string. At position **i**, the final decoded letter could use just the last digit, or it could use the last two digits. Those are the only possibilities because codes are from **1** through **26**.\n\nThe tricky part is validity. A single digit contributes only if it is **1** through **9**. A two-digit group contributes only if it is between **10** and **26**. When a choice is valid, it appends one letter to every decoding of the remaining prefix, so it adds the count from the matching earlier prefix.",
    commonMistakes: [
      "Treating **0** as a valid single-digit code.",
      "Accepting two-digit groups like **06** or **30**.",
      "Defining **dp[i]** as ending at index **i** and then mixing it with prefix-length indices.",
      "Replacing addition with max; this problem counts all valid choices, not the best choice.",
      "Forgetting that **dp[0] = 1** represents the empty prefix needed by valid two-digit decodings at the start.",
    ],
    stateDefinitionMD:
      "Let **dp[i]** be the number of ways to decode the prefix of length **i**, meaning **s[0...i - 1]**. The answer is **dp[n]**.",
    stateTransitionMD:
      "For prefix length **i**, consider the final one or two digits:\n\n- If **s[i - 1]** is between **1** and **9**, add **dp[i - 1]**.\n- If **s[i - 2...i - 1]** is between **10** and **26**, add **dp[i - 2]**.\n\nSo **dp[i]** is the sum of the valid contributions. Base cases are **dp[0] = 1** for the empty prefix and **dp[1] = 1** only if the first character is not **0**, otherwise **0**.",
    solutions: [
      {
        name: "Prefix DP with two rolling counts",
        approachMD:
          "Keep the number of decodings for the previous prefix length and the prefix length two positions back. Each new position adds one or both counts depending on valid one-digit and two-digit endings.",
        walkthroughMD:
          "1. Initialise **twoPositionsBack = 1** for the empty prefix.\n2. Initialise **onePositionBack** based on whether the first digit is nonzero.\n3. For each prefix length from **2** to **n**, start **current** at **0**.\n4. Add **onePositionBack** if the last digit is valid alone, and add **twoPositionsBack** if the last two digits form a valid code.\n5. Roll the two counts forward and return the final previous-prefix count.",
        complexity: { time: "O(n)", space: "O(1)", note: "Each character is examined a constant number of times with two stored counts." },
        filename: "Solution.java",
        code: `class Solution {

    public int numDecodings(String s) {
        int n = s.length();
        int twoPositionsBack = 1;
        int onePositionBack = s.charAt(0) == '0' ? 0 : 1;

        for (int index = 2; index <= n; index++) {
            int current = 0;
            char single = s.charAt(index - 1);
            if (single != '0') {
                current += onePositionBack;
            }

            int twoDigit = (s.charAt(index - 2) - '0') * 10 + (s.charAt(index - 1) - '0');
            if (twoDigit >= 10 && twoDigit <= 26) {
                current += twoPositionsBack;
            }

            twoPositionsBack = onePositionBack;
            onePositionBack = current;
        }

        return onePositionBack;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "s = 226. Use prefix lengths, with **dp[0] = 1** and **dp[1] = 1** for the prefix 2.",
      columns: ["i", "prefix", "single digit contribution", "two digit contribution", "dp[i]"],
      rows: [
        ["2", "22", "2 is valid, add 1", "22 is valid, add 1", "2"],
        ["3", "226", "6 is valid, add 2", "26 is valid, add 1", "3"],
      ],
      narrativeMD: "The final prefix count is **3**, representing 2 + 2 + 6, 22 + 6, and 2 + 26.",
    },
    complexityNote:
      "Decode Ways is still a constant-window 1D DP, but the recurrence is conditional because zeroes and values above 26 are invalid.",
    interviewTipsMD:
      "Say that **dp[i]** counts decodings of a prefix of length **i**. That avoids off-by-one confusion and makes the two contributions obvious. Spend extra time explaining zero: **0** is never valid alone, while **10** and **20** are valid two-digit codes.",
    followUps: [
      "How would you return the actual decoded strings for small inputs?",
      "What changes if the mapping extends beyond 26?",
      "How would you handle wildcard characters that can represent any digit?",
      "How would you validate the input early if non-digit characters were allowed?",
    ],
    similarProblems: [
      { title: "Climbing Stairs", difficulty: "Easy", slug: "dp-climbing-stairs", note: "Also counts ways using one-step and two-step moves." },
      { title: "Fibonacci Number", difficulty: "Easy", slug: "dp-fibonacci-number", note: "The unconditional version of the same two-previous-count recurrence." },
      { title: "Word Break", difficulty: "Medium", slug: "dp-word-break", note: "Another prefix DP where a transition is allowed only when a substring is valid." },
      { title: "Distinct Subsequences", difficulty: "Hard", slug: "dp-distinct-subsequences", note: "A more advanced string-counting DP." },
    ],
    keyTakeaways: [
      "Prefix-length state makes string DP transitions cleaner than raw character indices.",
      "Single-digit and two-digit endings contribute only when they are valid codes.",
      "The empty prefix count **dp[0] = 1** is essential for two-digit decodings at the beginning.",
      "Zero handling is the core edge case: **0** alone is invalid, but **10** and **20** are valid.",
    ],
    pattern:
      "Conditional prefix-count DP: for each prefix length, add the counts from valid one-step and two-step predecessor prefixes, then roll the two counts forward.",
  },
];
