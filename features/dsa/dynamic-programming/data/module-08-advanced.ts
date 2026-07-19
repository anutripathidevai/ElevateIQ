import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "dp-burst-balloons",
    moduleId: "dp-advanced",
    order: 38,
    title: "Burst Balloons",
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/burst-balloons/",
    tags: ["Dynamic Programming", "Interval DP", "Bottom-Up", "Partition DP"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple", "Adobe"],
    estimatedReadingMin: 14,
    estimatedSolvingMin: 45,
    statementMD:
      "You are given **n** balloons, indexed from **0** to **n - 1**. Each balloon has a number on it. When you burst balloon **i**, you earn **nums[left] * nums[i] * nums[right]** coins, where **left** and **right** are the nearest still-unburst balloons on each side. If there is no balloon on one side, treat that boundary value as **1**. Return the maximum coins you can collect by bursting all balloons.",
    constraints: [
      "1 <= nums.length <= 300",
      "0 <= nums[i] <= 100",
    ],
    inputMD: "An integer array **nums**, where **nums[i]** is the value written on the **i-th** balloon.",
    outputMD: "An integer: the maximum number of coins obtainable after bursting every balloon.",
    examples: [
      {
        input: "nums = [3,1,5,8]",
        output: "167",
        explanation: "One optimal order is to eventually leave balloon value 8 as the last real balloon. The best total after considering all interval choices is 167 coins.",
      },
      {
        input: "nums = [1,5]",
        output: "10",
        explanation: "Burst value 1 first for 1 * 1 * 5 = 5 coins, then burst value 5 for 1 * 5 * 1 = 5 more coins.",
      },
      {
        input: "nums = [9]",
        output: "9",
        explanation: "The only balloon is multiplied by the two virtual boundaries, so the result is 1 * 9 * 1 = 9.",
      },
    ],
    learningObjectives: [
      "Recognise why choosing the first balloon is hard but choosing the last balloon creates independent subproblems.",
      "Model an interval DP with fixed outside boundaries and open intervals inside them.",
      "Fill interval states by increasing width so every smaller subinterval is already solved.",
      "Use padding with boundary value 1 to remove edge-case logic from the recurrence.",
    ],
    intuitionMD:
      "The trap is thinking forward. If you decide which balloon to burst first, its neighbours change immediately, and the value of every later choice depends on a shifting array. That makes the subproblems feel tangled.\n\nTurn the timeline around. For any interval, ask which balloon is burst **last** inside that interval. At that exact moment, every balloon between the two interval boundaries is already gone, so the last balloon sees the same two fixed neighbours: the left boundary and the right boundary. That means its final gain is known: **values[left] * values[last] * values[right]**.\n\nNow the work on the left side and the work on the right side are independent. Bursting balloons strictly between **left** and **last** can never affect balloons strictly between **last** and **right**, because **last** remains in place until the end and acts as a wall between them. This is the non-obvious modelling move that makes the DP possible.",
    commonMistakes: [
      "Choosing the first balloon in the recurrence, which leaves changing neighbours and does not split cleanly.",
      "Defining closed intervals over original indices and then struggling with missing boundary values.",
      "Forgetting that **dp[left][right]** covers balloons strictly between the boundaries, not including the boundaries themselves.",
      "Filling intervals in the wrong order before smaller left and right intervals are available.",
      "Multiplying by original adjacent indices instead of the fixed interval boundaries after padding.",
    ],
    stateDefinitionMD:
      "Pad the input into **values** by adding **1** at the beginning and end. Let **dp[left][right]** be the maximum coins obtainable by bursting every balloon strictly between boundary indices **left** and **right** in **values**. The boundaries themselves are not burst inside this subproblem. The final answer is **dp[0][n + 1]**.",
    stateTransitionMD:
      "Choose the balloon **last** that will be the final burst inside **(left, right)**. Everything left of **last** and right of **last** has already been burst, so the gain from this final burst is fixed by the two boundaries:\n\n**dp[left][right] = max over left < last < right of dp[left][last] + values[left] * values[last] * values[right] + dp[last][right]**\n\nBase case: if there is no balloon strictly between **left** and **right**, then **dp[left][right] = 0**. Fill states by increasing gap **right - left**, starting from gap 2.",
    solutions: [
      {
        name: "Bottom-up interval DP",
        whenToUseMD:
          "Use this when the score of an action depends on its current neighbours. Reframing around the last action often freezes those neighbours and turns the problem into interval DP.",
        approachMD:
          "Pad the array with virtual boundary value **1**, then solve every open interval. For each interval, try every possible last balloon and combine the best result from the left subinterval, the final burst gain, and the best result from the right subinterval.",
        walkthroughMD:
          "1. Copy **nums** into **values[1..n]** and set **values[0]** and **values[n + 1]** to 1.\n2. Create a square DP table where empty intervals default to 0.\n3. Iterate **gap** from 2 through **n + 1**, because a gap smaller than 2 contains no real balloon.\n4. For each boundary pair **left** and **right**, try every **last** index strictly between them.\n5. Store the best combination of left interval, final burst, and right interval. Return **dp[0][n + 1]**.",
        complexity: {
          time: "O(n^3)",
          space: "O(n^2)",
          note: "There are O(n^2) intervals and each interval tries O(n) choices for the last balloon.",
        },
        filename: "Solution.java",
        code: `class Solution {

    public int maxCoins(int[] nums) {
        int n = nums.length;
        int[] values = new int[n + 2];
        values[0] = 1;
        values[n + 1] = 1;

        for (int i = 0; i < n; i++) {
            values[i + 1] = nums[i];
        }

        int[][] dp = new int[n + 2][n + 2];

        for (int gap = 2; gap < n + 2; gap++) {
            for (int left = 0; left + gap < n + 2; left++) {
                int right = left + gap;
                for (int last = left + 1; last < right; last++) {
                    int coins = dp[left][last]
                            + values[left] * values[last] * values[right]
                            + dp[last][right];
                    dp[left][right] = Math.max(dp[left][right], coins);
                }
            }
        }

        return dp[0][n + 1];
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [3,1,5,8], so **values = [1,3,1,5,8,1]**. The table stores open intervals between boundary indices.",
      columns: ["gap", "subproblem", "last choice", "best formula", "dp value"],
      rows: [
        ["2", "dp[0][2]", "last = 1, value 3", "0 + 1 * 3 * 1 + 0", "3"],
        ["2", "dp[2][4]", "last = 3, value 5", "0 + 1 * 5 * 8 + 0", "40"],
        ["3", "dp[1][4]", "last = 3, value 5", "15 + 3 * 5 * 8 + 0", "135"],
        ["3", "dp[2][5]", "last = 4, value 8", "40 + 1 * 8 * 1 + 0", "48"],
        ["4", "dp[0][4]", "last = 1, value 3", "0 + 1 * 3 * 8 + 135", "159"],
        ["5", "dp[0][5]", "last = 4, value 8", "159 + 1 * 8 * 1 + 0", "167"],
      ],
      narrativeMD: "The final row represents the whole padded interval. Choosing value 8 as the last real balloon combines the best way to clear everything before it with the final boundary gain, giving **167**.",
    },
    complexityNote:
      "The O(n^3) interval DP is the expected optimal approach for the given constraints. The important optimisation is conceptual: pick the last balloon so the subintervals become independent.",
    interviewTipsMD:
      "Say explicitly that a forward order is hard because neighbours mutate. Then present the reverse-time insight: in a fixed interval, the last balloon sees fixed boundaries, so the left and right intervals no longer interact. That sentence is usually what the interviewer is testing for.",
    followUps: [
      "Can you reconstruct one optimal burst order, not just the maximum score?",
      "How would the recurrence change if boundary balloons had custom values instead of 1?",
      "What other interval problems become easier when you choose the last action rather than the first?",
      "Can the O(n^3) time be reduced for this recurrence, and why is that difficult here?",
    ],
    similarProblems: [
      {
        title: "Stone Game",
        difficulty: "Medium",
        slug: "dp-stone-game",
        note: "Another interval DP where choices at the ends define smaller ranges.",
      },
      {
        title: "Longest Palindromic Subsequence",
        difficulty: "Medium",
        slug: "dp-longest-palindromic-subsequence",
        note: "A classic interval table filled by increasing length.",
      },
      {
        title: "Minimum Score Triangulation of Polygon",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/minimum-score-triangulation-of-polygon/",
        note: "Very similar split-on-a-pivot interval recurrence.",
      },
      {
        title: "Remove Boxes",
        difficulty: "Hard",
        url: "https://leetcode.com/problems/remove-boxes/",
        note: "A harder interval DP with extra state for carried equal boxes.",
      },
    ],
    keyTakeaways: [
      "When neighbours change after each operation, consider defining the recurrence by the last operation.",
      "Open intervals with fixed outside boundaries make the left and right subproblems independent.",
      "Padding with sentinel boundaries often removes special cases from interval DP.",
      "Interval DP tables are usually filled from small gaps to large gaps.",
    ],
    pattern:
      "Interval DP by last action: define dp[left][right] over the open interval, try every final pivot, and combine the two solved subintervals plus the pivot contribution.",
  },
  {
    kind: "problem",
    slug: "dp-stone-game",
    moduleId: "dp-advanced",
    order: 39,
    title: "Stone Game",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/stone-game/",
    tags: ["Dynamic Programming", "Interval DP", "Game Theory", "Minimax"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Bloomberg", "Adobe"],
    estimatedReadingMin: 12,
    estimatedSolvingMin: 35,
    statementMD:
      "Alice and Bob take turns removing an entire pile of stones from either the left end or the right end of a row. Alice moves first. Both players play optimally, and the total number of stones is odd so there cannot be a tie. Return whether Alice wins.",
    constraints: [
      "2 <= piles.length <= 500",
      "piles.length is even",
      "1 <= piles[i] <= 500",
      "sum(piles) is odd",
    ],
    inputMD: "An integer array **piles**, where **piles[i]** is the number of stones in the **i-th** pile.",
    outputMD: "A boolean: **true** if Alice can finish with more stones than Bob, otherwise **false**.",
    examples: [
      {
        input: "piles = [5,3,4,5]",
        output: "true",
        explanation: "Alice can guarantee a positive final score difference. The DP computes a best difference of 1 for the full interval.",
      },
      {
        input: "piles = [3,7,2,3]",
        output: "true",
        explanation: "Alice can force a win by choosing an end that leaves Bob with a worse remaining interval.",
      },
    ],
    learningObjectives: [
      "Model a two-player optimal game as a score difference instead of tracking both totals separately.",
      "Understand why subtracting the next state captures the opponent becoming the current player.",
      "Use interval DP for games where choices remove items from the ends.",
      "Distinguish the LeetCode parity shortcut from the reusable DP technique.",
    ],
    intuitionMD:
      "For this specific problem, there is a famous parity observation: because the number of piles is even, Alice can commit to taking either all originally even-indexed piles or all originally odd-indexed piles, whichever has the larger total. That proves Alice always wins.\n\nBut that shortcut is narrow. The interview-useful technique is a game DP that works even when constraints change. Instead of storing Alice score and Bob score, store one number: the best score difference the player to move can achieve from the current interval.\n\nIf the current player takes the left pile, they gain **piles[left]** immediately. Then the opponent becomes the current player on the smaller interval and can achieve **dp[left + 1][right]** advantage over us. So our net difference for taking left is **piles[left] - dp[left + 1][right]**. The same logic applies to taking the right pile. Choose the better of the two.",
    commonMistakes: [
      "Returning true only because of the parity shortcut without being able to derive the general recurrence.",
      "Trying to store absolute Alice and Bob totals, which makes turns and perspective harder to manage.",
      "Forgetting that **dp[i][j]** is from the current player's perspective, not always Alice's perspective.",
      "Adding the future DP value instead of subtracting it; the future advantage belongs to the opponent.",
      "Using greedy larger-end selection, which is not reliable in adversarial games.",
    ],
    stateDefinitionMD:
      "Let **dp[left][right]** be the maximum score difference the current player can achieve over the other player using only piles from index **left** through **right**. A positive value means the player whose turn it is can finish ahead by that many stones from this interval.",
    stateTransitionMD:
      "The current player has two choices:\n\n- Take **piles[left]**, then the opponent plays optimally on **left + 1..right**, producing a future advantage of **dp[left + 1][right]** against the current player.\n- Take **piles[right]**, then the opponent plays optimally on **left..right - 1**, producing **dp[left][right - 1]** against the current player.\n\nTherefore:\n\n**dp[left][right] = max(piles[left] - dp[left + 1][right], piles[right] - dp[left][right - 1])**\n\nBase case: **dp[i][i] = piles[i]**, because the current player takes the only pile. Alice wins when **dp[0][n - 1] > 0**.",
    solutions: [
      {
        name: "Interval DP with score difference",
        whenToUseMD:
          "Use this for take-from-ends games where both players are optimal. The score-difference state removes the need for a separate turn dimension.",
        approachMD:
          "Build intervals from length 1 upward. For each interval, compute the best net advantage from taking the left end or the right end. Because the next state is from the opponent's perspective, subtract that state from the stones just taken.",
        walkthroughMD:
          "1. Initialise **dp[i][i]** to **piles[i]**.\n2. Increase interval length from 2 to **n**.\n3. For each interval, compute the net result of taking the left pile and the net result of taking the right pile.\n4. Store the larger difference.\n5. Return whether the full interval difference is positive.",
        complexity: {
          time: "O(n^2)",
          space: "O(n^2)",
          note: "Every interval is solved once and each state does O(1) work.",
        },
        filename: "Solution.java",
        code: `class Solution {

    public boolean stoneGame(int[] piles) {
        int n = piles.length;
        int[][] dp = new int[n][n];

        for (int i = 0; i < n; i++) {
            dp[i][i] = piles[i];
        }

        for (int length = 2; length <= n; length++) {
            for (int left = 0; left + length - 1 < n; left++) {
                int right = left + length - 1;
                int takeLeft = piles[left] - dp[left + 1][right];
                int takeRight = piles[right] - dp[left][right - 1];
                dp[left][right] = Math.max(takeLeft, takeRight);
            }
        }

        return dp[0][n - 1] > 0;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "piles = [5,3,4,5]. Each cell stores the best score difference for the player to move on that interval.",
      columns: ["interval", "take left", "take right", "dp difference", "meaning"],
      rows: [
        ["[0,1] = [5,3]", "5 - 3 = 2", "3 - 5 = -2", "2", "current player wins this interval by 2"],
        ["[1,2] = [3,4]", "3 - 4 = -1", "4 - 3 = 1", "1", "current player prefers the right pile"],
        ["[2,3] = [4,5]", "4 - 5 = -1", "5 - 4 = 1", "1", "current player prefers the right pile"],
        ["[0,2] = [5,3,4]", "5 - 1 = 4", "4 - 2 = 2", "4", "best advantage is 4"],
        ["[1,3] = [3,4,5]", "3 - 1 = 2", "5 - 1 = 4", "4", "best advantage is 4"],
        ["[0,3] = [5,3,4,5]", "5 - 4 = 1", "5 - 4 = 1", "1", "Alice wins by 1"],
      ],
      narrativeMD: "The full interval has positive difference **1**, so Alice can force more stones than Bob. The parity shortcut also says Alice wins, but the DP explains how optimal play is evaluated.",
    },
    complexityNote:
      "The DP is O(n^2), even though this exact LeetCode version can be answered in O(1) using parity. The DP is the reusable solution for variants without the parity guarantee.",
    interviewTipsMD:
      "Mention the parity proof briefly, then say you will implement the general game-theory DP because it survives follow-up changes. Emphasise that **dp** is always from the current player's perspective; that is why the recurrence subtracts the next state.",
    followUps: [
      "How would the solution change if the number of piles were odd and ties were possible?",
      "Can you reduce the interval table to O(n) space?",
      "What if a player could take one or two piles from either end?",
      "How would you return the first move Alice should make under optimal play?",
    ],
    similarProblems: [
      {
        title: "Burst Balloons",
        difficulty: "Hard",
        slug: "dp-burst-balloons",
        note: "Another interval DP, but it splits by the last action instead of end choices.",
      },
      {
        title: "Longest Palindromic Subsequence",
        difficulty: "Medium",
        slug: "dp-longest-palindromic-subsequence",
        note: "Same increasing-interval table shape without adversarial turns.",
      },
      {
        title: "Predict the Winner",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/predict-the-winner/",
        note: "The closest version of this score-difference recurrence.",
      },
      {
        title: "Stone Game II",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/stone-game-ii/",
        note: "Adds another state variable for the changing move limit.",
      },
    ],
    keyTakeaways: [
      "For two-player optimal games, score difference is often cleaner than two separate totals.",
      "The next DP state is subtracted because it is the opponent's advantage after the current move.",
      "End-picking games naturally form interval DP states.",
      "Know the parity shortcut, but lead with the general recurrence for interviews.",
    ],
    pattern:
      "Game interval DP: define dp[left][right] as the current player's best score difference, try each legal move, and subtract the opponent's resulting advantage.",
  },
  {
    kind: "problem",
    slug: "dp-cherry-pickup",
    moduleId: "dp-advanced",
    order: 40,
    title: "Cherry Pickup",
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/cherry-pickup/",
    tags: ["Dynamic Programming", "Grid DP", "3D DP", "Multi-Agent DP"],
    companies: ["Google", "Amazon", "Microsoft", "Meta", "Apple", "Bloomberg"],
    estimatedReadingMin: 16,
    estimatedSolvingMin: 50,
    statementMD:
      "You are given an **n x n** grid. Each cell is **1** for a cherry, **0** for empty, or **-1** for a thorn that cannot be crossed. Starting at the top-left cell, move only right or down to reach the bottom-right cell, then return to the top-left cell by moving only left or up. Collect cherries along the way, and a cherry can be collected at most once. Return the maximum cherries collectable. If no valid round trip exists, return **0**.",
    constraints: [
      "n == grid.length",
      "n == grid[i].length",
      "1 <= n <= 50",
      "grid[i][j] is -1, 0, or 1",
      "grid[0][0] is not -1",
      "grid[n - 1][n - 1] is not -1",
    ],
    inputMD: "A square integer grid containing cherries, empty cells, and blocked thorn cells.",
    outputMD: "An integer: the maximum number of cherries collectable over a valid trip from start to end and back, or 0 if no valid trip exists.",
    examples: [
      {
        input: "grid = [[0,1,-1],[1,0,-1],[1,1,1]]",
        output: "5",
        explanation: "The best round trip collects five cherries. Thinking of the return path in reverse turns it into a second top-left-to-bottom-right path.",
      },
      {
        input: "grid = [[1,1,-1],[1,-1,1],[-1,1,1]]",
        output: "0",
        explanation: "No valid path can reach the bottom-right cell from the top-left cell, so a round trip is impossible.",
      },
      {
        input: "grid = [[1,1],[1,1]]",
        output: "4",
        explanation: "The two paths can split through the two middle cells and together collect all four cherries, counting the shared start and end once.",
      },
    ],
    learningObjectives: [
      "Reformulate a go-and-return path as two simultaneous forward paths.",
      "Derive one coordinate from the shared step count to reduce a 4D state to 3D.",
      "Handle blocked cells and same-cell collisions inside the transition.",
      "Use a negative sentinel for impossible DP states and clamp the final answer to zero.",
    ],
    intuitionMD:
      "The direct story is awkward: one path goes from top-left to bottom-right, then another path comes back and must remember which cherries were already taken. That sounds like the first path changes the grid for the second path, which is too much state.\n\nReverse the return trip. A path that returns from bottom-right to top-left using left and up is the same sequence, reversed, as a path from top-left to bottom-right using right and down. So instead of one person going out and back, imagine **two people walking from the top-left to the bottom-right at the same time**.\n\nAfter **t** moves, both people have taken exactly **t** steps, so if person one is at **(r1, c1)** and person two is at **(r2, c2)**, then **r1 + c1 = r2 + c2 = t**. This lets us derive **c2** from **t** and **r2**, avoiding a full four-dimensional table. When both people stand on the same cell, count its cherry once; otherwise count both cells. Thorn cells make that state impossible.",
    commonMistakes: [
      "Trying to greedily choose the first trip and then solve the return trip on the modified grid.",
      "Using four independent coordinates even though the two walkers always share the same step count.",
      "Double-counting a cherry when both walkers land on the same cell at the same step.",
      "Allowing transitions through cells with value -1 or through coordinates outside the grid.",
      "Returning a negative sentinel when no complete path exists instead of returning 0.",
    ],
    stateDefinitionMD:
      "Let **t = r1 + c1 = r2 + c2** be the number of steps both walkers have taken. Define **dp[r1][c1][r2]** as the maximum cherries collected after **t** steps when walker one is at **(r1, c1)** and walker two is at **(r2, c2)**, where **c2 = t - r2**. Invalid coordinates, thorn cells, and unreachable states are treated as impossible.",
    stateTransitionMD:
      "At the previous step, each walker came either from above or from the left. Therefore each state considers four predecessor pairs:\n\n- walker one from above, walker two from above\n- walker one from above, walker two from left\n- walker one from left, walker two from above\n- walker one from left, walker two from left\n\nLet **gain** be **grid[r1][c1]** plus **grid[r2][c2]** if the two cells are different, or just one copy if they are the same cell. Then:\n\n**dp[r1][c1][r2] = gain + max(valid predecessor states)**\n\nBase case: both walkers start at **(0, 0)**, so **dp[0][0][0] = grid[0][0]**. The answer is **max(0, dp[n - 1][n - 1][n - 1])**.",
    solutions: [
      {
        name: "Step-by-step DP with two walkers",
        whenToUseMD:
          "Use this for the original Cherry Pickup constraints. It keeps the 3D state idea but stores only the previous step and current step, reducing memory to O(n^2).",
        approachMD:
          "Process the two walkers by shared step count. For each step, enumerate valid rows for walker one and walker two, derive both columns, skip thorns, then combine the best of the four predecessor row pairs with the cherries gained at the current cells.",
        walkthroughMD:
          "1. If the start or end is blocked, no round trip is possible.\n2. Store DP for the previous shared step as a 2D table indexed by the two row positions.\n3. For each step from 1 to **2n - 2**, create a fresh current table filled with a large negative impossible value.\n4. Enumerate **row1** and **row2** values that keep derived columns inside the grid.\n5. Skip states where either cell is a thorn, take the best predecessor among four move combinations, add one or two cherries, and save the result.\n6. After the final step, clamp the destination value at zero.",
        complexity: {
          time: "O(n^3)",
          space: "O(n^2)",
          note: "There are O(n) step layers, each with O(n^2) row-pair states and O(1) transition work.",
        },
        filename: "Solution.java",
        code: `import java.util.Arrays;

class Solution {

    public int cherryPickup(int[][] grid) {
        int n = grid.length;
        if (grid[0][0] == -1 || grid[n - 1][n - 1] == -1) {
            return 0;
        }

        int negative = -1_000_000_000;
        int[][] previous = new int[n][n];
        for (int[] row : previous) {
            Arrays.fill(row, negative);
        }
        previous[0][0] = grid[0][0];

        for (int step = 1; step <= 2 * n - 2; step++) {
            int[][] current = new int[n][n];
            for (int[] row : current) {
                Arrays.fill(row, negative);
            }

            int rowMin = Math.max(0, step - (n - 1));
            int rowMax = Math.min(n - 1, step);

            for (int row1 = rowMin; row1 <= rowMax; row1++) {
                int col1 = step - row1;
                if (grid[row1][col1] == -1) {
                    continue;
                }

                for (int row2 = rowMin; row2 <= rowMax; row2++) {
                    int col2 = step - row2;
                    if (grid[row2][col2] == -1) {
                        continue;
                    }

                    int best = previous[row1][row2];
                    if (row1 > 0) {
                        best = Math.max(best, previous[row1 - 1][row2]);
                    }
                    if (row2 > 0) {
                        best = Math.max(best, previous[row1][row2 - 1]);
                    }
                    if (row1 > 0 && row2 > 0) {
                        best = Math.max(best, previous[row1 - 1][row2 - 1]);
                    }
                    if (best <= negative / 2) {
                        continue;
                    }

                    int cherries = grid[row1][col1];
                    if (row1 != row2) {
                        cherries += grid[row2][col2];
                    }

                    current[row1][row2] = best + cherries;
                }
            }

            previous = current;
        }

        return Math.max(0, previous[n - 1][n - 1]);
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "grid = [[0,1,-1],[1,0,-1],[1,1,1]]. One optimal pair of simultaneous paths is shown, with both walkers taking the same step number.",
      columns: ["step", "walker one", "walker two", "cherries added", "best total"],
      rows: [
        ["0", "(0,0)", "(0,0)", "0, same cell", "0"],
        ["1", "(1,0)", "(0,1)", "1 + 1", "2"],
        ["2", "(2,0)", "(1,1)", "1 + 0", "3"],
        ["3", "(2,1)", "(2,1)", "1, same cell", "4"],
        ["4", "(2,2)", "(2,2)", "1, same cell", "5"],
      ],
      narrativeMD: "The two walkers represent the outgoing trip and the reversed return trip. Shared cells are counted once, so the best total for the round trip is **5** cherries.",
    },
    complexityNote:
      "The full conceptual state is 3D, but iterating by shared step lets the implementation store only two O(n^2) layers. Time remains O(n^3), which fits n up to 50.",
    interviewTipsMD:
      "Spend time on the reformulation before writing the recurrence. Say: the return path reversed is another forward path, so two walkers move together from the start. Then derive **c2** from the shared step count. This explanation usually matters more than the code mechanics.",
    followUps: [
      "How would the solution change for Cherry Pickup II, where two robots start in different columns of the top row?",
      "Can you return the actual two paths that collect the maximum cherries?",
      "What if cells contained arbitrary non-negative cherry counts instead of only 0 or 1?",
      "How would obstacles that change over time affect the state definition?",
    ],
    similarProblems: [
      {
        title: "Unique Paths II",
        difficulty: "Medium",
        slug: "dp-unique-paths-ii",
        note: "A simpler blocked-grid DP before adding the second walker dimension.",
      },
      {
        title: "Minimum Path Sum",
        difficulty: "Medium",
        slug: "dp-minimum-path-sum",
        note: "Another grid DP where each cell combines top and left predecessors.",
      },
      {
        title: "Dungeon Game",
        difficulty: "Hard",
        slug: "dp-dungeon-game",
        note: "Hard grid DP where the direction of modelling is the key challenge.",
      },
      {
        title: "Cherry Pickup II",
        difficulty: "Hard",
        url: "https://leetcode.com/problems/cherry-pickup-ii/",
        note: "A related two-agent grid DP with a different movement model.",
      },
    ],
    keyTakeaways: [
      "A go-and-return path can often be modelled as two forward paths moving simultaneously.",
      "Shared step count removes one coordinate from a two-agent grid state.",
      "When two agents visit the same cell at the same time, count the reward once.",
      "Impossible states should use a negative sentinel and never participate in valid transitions.",
    ],
    pattern:
      "Two-agent synchronized DP: move both agents one step at a time, derive one coordinate from the shared time, combine all predecessor move pairs, and handle collisions explicitly.",
  },
  {
    kind: "problem",
    slug: "dp-best-time-to-buy-and-sell-stock-iv",
    moduleId: "dp-advanced",
    order: 41,
    title: "Best Time to Buy and Sell Stock IV",
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/",
    tags: ["Dynamic Programming", "State Machine", "Stock Trading", "Transaction DP"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple", "Bloomberg"],
    estimatedReadingMin: 14,
    estimatedSolvingMin: 45,
    statementMD:
      "You are given an integer **k** and an array **prices**, where **prices[i]** is the price of a stock on day **i**. You may complete at most **k** transactions. One transaction is one buy followed by one sell, and you may not hold more than one share at a time. Return the maximum profit you can achieve.",
    constraints: [
      "0 <= k <= 100",
      "0 <= prices.length <= 1000",
      "0 <= prices[i] <= 1000",
    ],
    inputMD: "An integer **k** and an integer array **prices** representing daily stock prices.",
    outputMD: "An integer: the maximum profit achievable with at most **k** completed transactions.",
    examples: [
      {
        input: "k = 2, prices = [2,4,1]",
        output: "2",
        explanation: "Buy at 2 and sell at 4 for profit 2. A second transaction is not useful.",
      },
      {
        input: "k = 2, prices = [3,2,6,5,0,3]",
        output: "7",
        explanation: "Buy at 2, sell at 6, then buy at 0 and sell at 3 for total profit 7.",
      },
      {
        input: "k = 4, prices = [1,2,3,4,5]",
        output: "4",
        explanation: "When **k** is large enough, this becomes the unlimited-transactions version and collects every positive day-to-day increase.",
      },
    ],
    learningObjectives: [
      "Model stock trading as a state machine with holding and not-holding states.",
      "Track transaction count by completed sells while updating buy and sell arrays.",
      "Recognise the unlimited-transactions shortcut when **k >= n / 2**.",
      "Compress the day dimension so the solution uses O(k) memory.",
    ],
    intuitionMD:
      "A transaction has two phases: buy, then sell. The hard part is remembering both how many transactions remain and whether you are currently holding a share. That is exactly a state machine.\n\nFor each transaction number **t**, keep two best profits after processing the current day. **buy[t]** means the best profit while holding one share after starting the **t-th** transaction. **sell[t]** means the best profit while holding no share after completing at most **t** transactions.\n\nOn each price, you either keep your previous state or take the transition edge. To enter **buy[t]**, you must come from **sell[t - 1]** and pay today's price. To enter **sell[t]**, you must come from **buy[t]** and receive today's price. This gives a compact O(n * k) state-machine DP.\n\nIf **k >= n / 2**, the transaction limit cannot bind, because each transaction needs at least a buy day and a later sell day. Then the answer is simply the sum of all positive adjacent price increases.",
    commonMistakes: [
      "Treating **k** as the number of buys instead of the number of completed buy-sell transactions.",
      "Forgetting the holding state and trying to choose transactions as independent intervals greedily.",
      "Missing the unlimited-transactions shortcut, which can waste work when **k** is large.",
      "Initialising buy states to 0, which pretends you can hold a stock without paying for it.",
      "Returning a holding state instead of **sell[k]**; final profit should not include an unsold stock.",
    ],
    stateDefinitionMD:
      "After processing days up to the current day, let **buy[t]** be the maximum profit while holding one share after buying for the **t-th** transaction. Let **sell[t]** be the maximum profit while holding no share after completing at most **t** transactions. The answer after all days is **sell[k]**.",
    stateTransitionMD:
      "For each day price **p** and each transaction count **t** from 1 to **k**:\n\n**buy[t] = max(buy[t], sell[t - 1] - p)**\n\nThis either keeps holding from before or buys today using profit from one fewer completed transaction.\n\n**sell[t] = max(sell[t], buy[t] + p)**\n\nThis either keeps not holding from before or sells today to complete the **t-th** transaction.\n\nBase cases: **sell[0] = 0** because zero transactions with no stock earns zero profit. Each **buy[t]** starts as **-prices[0]**, representing buying on day 0. If there are no prices or **k = 0**, return 0.",
    solutions: [
      {
        name: "O(k) state-machine DP",
        whenToUseMD:
          "Use this for the general at-most-k stock problem. It handles small and moderate **k**, while the early unlimited-transactions branch handles very large **k** efficiently.",
        approachMD:
          "Maintain two arrays for the current best holding and not-holding profits for every transaction count. Each price relaxes the buy edge and sell edge of the state machine. Because the current day only depends on previous best values, the day dimension is compressed away.",
        walkthroughMD:
          "1. Return 0 when there are no prices or no allowed transactions.\n2. If **k >= n / 2**, sum every positive adjacent increase because the limit cannot restrict trading.\n3. Initialise every **buy[t]** to **-prices[0]** and every **sell[t]** to 0.\n4. For each later day, update **buy[t]** from **sell[t - 1] - price**, then update **sell[t]** from **buy[t] + price**.\n5. Return **sell[k]**, the best profit while not holding after at most **k** transactions.",
        complexity: {
          time: "O(n * k)",
          space: "O(k)",
          note: "The unlimited branch runs in O(n) time and O(1) space when k is large.",
        },
        filename: "Solution.java",
        code: `class Solution {

    public int maxProfit(int k, int[] prices) {
        int n = prices.length;
        if (n == 0 || k == 0) {
            return 0;
        }

        if (k >= n / 2) {
            return unlimitedProfit(prices);
        }

        int[] buy = new int[k + 1];
        int[] sell = new int[k + 1];

        for (int transaction = 1; transaction <= k; transaction++) {
            buy[transaction] = -prices[0];
        }

        for (int day = 1; day < n; day++) {
            int price = prices[day];
            for (int transaction = 1; transaction <= k; transaction++) {
                buy[transaction] = Math.max(buy[transaction], sell[transaction - 1] - price);
                sell[transaction] = Math.max(sell[transaction], buy[transaction] + price);
            }
        }

        return sell[k];
    }

    private int unlimitedProfit(int[] prices) {
        int profit = 0;
        for (int day = 1; day < prices.length; day++) {
            if (prices[day] > prices[day - 1]) {
                profit += prices[day] - prices[day - 1];
            }
        }
        return profit;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "k = 2, prices = [3,2,6,5,0,3]. Track the best holding and not-holding profits after each day.",
      columns: ["day", "price", "buy[1]", "sell[1]", "buy[2]", "sell[2]"],
      rows: [
        ["0", "3", "-3", "0", "-3", "0"],
        ["1", "2", "-2", "0", "-2", "0"],
        ["2", "6", "-2", "4", "-2", "4"],
        ["3", "5", "-2", "4", "-1", "4"],
        ["4", "0", "0", "4", "4", "4"],
        ["5", "3", "0", "4", "4", "7"],
      ],
      narrativeMD: "After the last day, **sell[2] = 7**, representing profit 4 from buying at 2 and selling at 6, plus profit 3 from buying at 0 and selling at 3.",
    },
    complexityNote:
      "The state-machine DP is O(n * k) time and O(k) space. The large-k branch prevents the algorithm from doing unnecessary transaction-state work when the problem has effectively unlimited trades.",
    interviewTipsMD:
      "Describe the DP as a state machine, not as a collection of ad hoc formulas. Name the two states, explain the transition into each state, and clarify that a transaction is counted when a sell completes. Then mention the **k >= n / 2** shortcut before coding.",
    followUps: [
      "How would you modify the state machine for a one-day cooldown after selling?",
      "How would a fixed transaction fee change the sell transition?",
      "Can you solve the special case of at most two transactions with constant space variables?",
      "How would you return the actual buy and sell days for an optimal strategy?",
    ],
    similarProblems: [
      {
        title: "Ones and Zeroes",
        difficulty: "Medium",
        slug: "dp-ones-and-zeroes",
        note: "Another DP where resource counts become state dimensions.",
      },
      {
        title: "Target Sum",
        difficulty: "Medium",
        slug: "dp-target-sum",
        note: "A count dimension is transformed into a compact DP state.",
      },
      {
        title: "Best Time to Buy and Sell Stock III",
        difficulty: "Hard",
        url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/",
        note: "The fixed k = 2 version of the same state machine.",
      },
      {
        title: "Best Time to Buy and Sell Stock with Cooldown",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/",
        note: "Adds a cooldown state to the buy and sell transitions.",
      },
      {
        title: "Best Time to Buy and Sell Stock with Transaction Fee",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/",
        note: "Adds a fee to the sell transition while keeping the state-machine framing.",
      },
    ],
    keyTakeaways: [
      "Stock DP becomes manageable when modelled as holding versus not-holding states.",
      "The transaction count advances on sell, because a full buy-sell pair has completed.",
      "When **k >= n / 2**, the at-most-k limit is equivalent to unlimited transactions.",
      "The day dimension can be compressed because each state only needs previous best profits.",
    ],
    pattern:
      "Transaction state-machine DP: for each transaction count, update hold from the previous sell state and update sold from the hold state, with special handling when the transaction limit cannot bind.",
  },
];
