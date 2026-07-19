import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "dp-unique-paths",
    moduleId: "dp-grid",
    order: 18,
    title: "Unique Paths",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/unique-paths/",
    tags: ["Dynamic Programming", "Grid DP", "Matrix", "Combinatorics"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 18,
    statementMD:
      "A robot starts in the top-left corner of an **m x n** grid and wants to reach the bottom-right corner. The robot may move only **down** or **right** at any point. Return the number of distinct paths from start to finish.",
    constraints: [
      "1 <= m, n <= 100",
      "The answer is guaranteed to be less than or equal to **2 * 10^9**",
    ],
    inputMD: "Two integers **m** and **n**, the grid dimensions.",
    outputMD: "An integer: the number of valid paths from the top-left cell to the bottom-right cell.",
    examples: [
      {
        input: "m = 3, n = 7",
        output: "28",
        explanation: "There are 28 different orders of right and down moves that take the robot from the start to the finish.",
      },
      {
        input: "m = 3, n = 2",
        output: "3",
        explanation: "The paths are down, down, right; down, right, down; and right, down, down.",
      },
      {
        input: "m = 1, n = 5",
        output: "1",
        explanation: "With only one row, the robot can only keep moving right, so there is exactly one path.",
      },
    ],
    learningObjectives: [
      "Define a grid DP state where each cell stores the number of ways to reach it.",
      "Derive the recurrence from the only two incoming neighbours: top and left.",
      "Seed the first row and first column correctly because edge cells have only one incoming direction.",
      "Compress a 2D grid table into a single 1D row array.",
    ],
    intuitionMD:
      "Focus on the final step into a cell. Because the robot can only move down or right, any path that reaches cell **(i, j)** must have arrived from **(i - 1, j)** or **(i, j - 1)**. Those two groups are disjoint because their final move is different.\n\nThat means every cell can be solved after its top and left neighbours are known. The first row and first column are special: there is only one straight-line way to reach any of those cells.\n\nFor space, notice that when scanning left to right, **ways[j]** still holds the value from the previous row, which is the top neighbour, while **ways[j - 1]** has already been updated for the current row, which is the left neighbour. Adding them gives the current cell.",
    commonMistakes: [
      "Leaving the first row or first column as zero, which makes every later cell undercount.",
      "Thinking diagonal moves are allowed; the recurrence only uses top and left neighbours.",
      "Updating the 1D row from right to left, which would use stale left-neighbour values.",
      "Trying to enumerate paths explicitly instead of counting them with DP.",
    ],
    stateDefinitionMD:
      "Let **dp[i][j]** be the number of distinct paths from the top-left cell **(0, 0)** to cell **(i, j)**. The answer is **dp[m - 1][n - 1]**.\n\nFor the space-optimized version, let **ways[j]** be the current row value for column **j** after processing the current row.",
    stateTransitionMD:
      "Base cases: **dp[0][0] = 1**, every cell in the first row is **1**, and every cell in the first column is **1** because there is only one straight path along an edge.\n\nFor every inner cell:\n\n**dp[i][j] = dp[i - 1][j] + dp[i][j - 1]**\n\nIn the 1D row version, the same recurrence becomes **ways[j] = ways[j] + ways[j - 1]**, where the old **ways[j]** is the top neighbour and **ways[j - 1]** is the left neighbour.",
    solutions: [
      {
        name: "Space-optimized row DP",
        approachMD:
          "Store only one row of path counts. Initialise the top row to all ones, then sweep each later row left to right so the current cell can reuse the top value and the already-updated left value.",
        walkthroughMD:
          "1. Create an array **ways** of length **n**.\n2. Fill it with **1** because the top row has exactly one path to every column.\n3. For each later row, scan columns from **1** to **n - 1**.\n4. Add the left value **ways[col - 1]** into the top value **ways[col]**.\n5. Return **ways[n - 1]**, the number of paths to the bottom-right cell.",
        complexity: {
          time: "O(m · n)",
          space: "O(n)",
          note: "Every cell is processed once, and only the current row of counts is stored.",
        },
        filename: "Solution.java",
        code: `import java.util.Arrays;

class Solution {

    public int uniquePaths(int m, int n) {
        int[] ways = new int[n];
        Arrays.fill(ways, 1);

        for (int row = 1; row < m; row++) {
            for (int col = 1; col < n; col++) {
                ways[col] += ways[col - 1];
            }
        }

        return ways[n - 1];
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "m = 3, n = 4. Start with the top row already seeded as one path to every column.",
      columns: ["row", "col", "top value", "left value", "ways after update"],
      rows: [
        ["top row", "-", "-", "-", "[1,1,1,1]"],
        ["1", "1", "1", "1", "[1,2,1,1]"],
        ["1", "2", "1", "2", "[1,2,3,1]"],
        ["1", "3", "1", "3", "[1,2,3,4]"],
        ["2", "1", "2", "1", "[1,3,3,4]"],
        ["2", "2", "3", "3", "[1,3,6,4]"],
        ["2", "3", "4", "6", "[1,3,6,10]"],
      ],
      narrativeMD: "The bottom-right value is **10**, so a 3 x 4 grid has 10 unique paths. Each update combines the path count from above with the path count from the left.",
    },
    complexityNote:
      "The 1D row compression keeps the same O(m · n) time as the full grid table while reducing memory from O(m · n) to O(n).",
    interviewTipsMD:
      "Derive the recurrence from the last move into a cell. Once the interviewer sees **top plus left**, immediately mention that the first row and first column are all ones, then show the row-array optimization. If asked for a combinatorics shortcut, acknowledge it, but DP is the safer pattern for follow-ups with obstacles or costs.",
    followUps: [
      "How does the recurrence change when some cells are blocked by obstacles?",
      "How would you compute the minimum-cost path instead of the number of paths?",
      "Can you solve the same problem using combinations of down and right moves?",
      "What changes if the robot can also move diagonally?",
    ],
    similarProblems: [
      {
        title: "Unique Paths II",
        difficulty: "Medium",
        slug: "dp-unique-paths-ii",
        note: "Adds blocked cells, which reset the path count to zero.",
      },
      {
        title: "Minimum Path Sum",
        difficulty: "Medium",
        slug: "dp-minimum-path-sum",
        note: "Uses the same top-left grid sweep but minimises cost instead of counting paths.",
      },
      {
        title: "Climbing Stairs",
        difficulty: "Easy",
        slug: "dp-climbing-stairs",
        note: "Another counting recurrence built from the possible previous states.",
      },
      {
        title: "Triangle",
        difficulty: "Medium",
        slug: "dp-triangle",
        note: "A triangular grid where each state depends on adjacent cells in the next row.",
      },
    ],
    keyTakeaways: [
      "Grid path counting often asks how many ways can reach this cell.",
      "When movement is only down and right, every inner cell receives paths from top and left.",
      "The first row and first column are base-case edges with exactly one path each.",
      "A row scan can compress the DP table to O(n) space.",
    ],
    pattern:
      "Top-left grid counting DP: seed the reachable edges, sweep row by row, combine top and left neighbours, and compress rows when only the previous row is needed.",
  },
  {
    kind: "problem",
    slug: "dp-unique-paths-ii",
    moduleId: "dp-grid",
    order: 19,
    title: "Unique Paths II",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/unique-paths-ii/",
    tags: ["Dynamic Programming", "Grid DP", "Matrix", "Obstacles"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Oracle"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 22,
    statementMD:
      "A robot starts in the top-left corner of an **m x n** grid and wants to reach the bottom-right corner. The robot may move only **down** or **right**. Some cells contain obstacles and cannot be used. Return the number of distinct valid paths.",
    constraints: [
      "m == obstacleGrid.length",
      "n == obstacleGrid[i].length",
      "1 <= m, n <= 100",
      "obstacleGrid[i][j] is **0** or **1**",
      "**0** means empty and **1** means blocked",
    ],
    inputMD: "A 2D integer grid **obstacleGrid**, where **1** marks a blocked cell and **0** marks an open cell.",
    outputMD: "An integer: the number of valid paths from the top-left cell to the bottom-right cell without stepping on obstacles.",
    examples: [
      {
        input: "obstacleGrid = [[0,0,0],[0,1,0],[0,0,0]]",
        output: "2",
        explanation: "The center obstacle blocks paths that pass through it, leaving one route around the top-right side and one route around the bottom-left side.",
      },
      {
        input: "obstacleGrid = [[0,1],[0,0]]",
        output: "1",
        explanation: "The top-right cell is blocked, so the only valid route goes down first and then right.",
      },
      {
        input: "obstacleGrid = [[1]]",
        output: "0",
        explanation: "The start cell itself is blocked, so no path can begin.",
      },
    ],
    learningObjectives: [
      "Extend grid path counting by treating blocked cells as zero-way states.",
      "Handle blocked start and finish cells naturally through the recurrence.",
      "Update a 1D row array without letting paths flow through obstacles.",
      "Explain why an obstacle resets the current cell rather than subtracting paths later.",
    ],
    intuitionMD:
      "This is the same top-and-left path-counting problem, except blocked cells cannot receive or send paths. A blocked cell has exactly **0** ways to stand on it, regardless of how many paths could reach its top or left neighbours.\n\nThat local reset is the simplest way to think about obstacles. When processing a free cell, add top and left as usual. When processing an obstacle, overwrite the cell count with **0** so future cells do not accidentally inherit paths through it.\n\nThe 1D version uses the same meaning as Unique Paths. Before the update, **ways[j]** is the number of paths from the cell above. After the update, it becomes the number of paths to the current cell. If the current cell is blocked, setting **ways[j] = 0** cuts off both this cell and any cells that would use it as their left neighbour.",
    commonMistakes: [
      "Only checking obstacles after computing the answer, which allows paths to pass through blocked cells.",
      "Forgetting that a blocked start cell should produce zero paths.",
      "Leaving **ways[col]** unchanged at an obstacle, which leaks paths from the row above.",
      "Initialising the whole first row to one without stopping after the first obstacle.",
      "Using right-to-left 1D updates, which breaks the left-neighbour dependency.",
    ],
    stateDefinitionMD:
      "Let **dp[i][j]** be the number of valid paths from **(0, 0)** to cell **(i, j)** without stepping on any obstacle. If **obstacleGrid[i][j] = 1**, then **dp[i][j] = 0**. The answer is **dp[m - 1][n - 1]**.\n\nFor the space-optimized version, **ways[j]** stores the current row value for column **j** after obstacles have been applied.",
    stateTransitionMD:
      "If the current cell is blocked, the transition is forced:\n\n**dp[i][j] = 0**\n\nOtherwise, paths come from top and left:\n\n**dp[i][j] = dp[i - 1][j] + dp[i][j - 1]**\n\nOut-of-bounds neighbours contribute **0**, while the start cell contributes **1** only if it is open. In the 1D version, each free non-first-column cell performs **ways[j] = ways[j] + ways[j - 1]**; each obstacle performs **ways[j] = 0**.",
    solutions: [
      {
        name: "Space-optimized row DP with obstacle resets",
        approachMD:
          "Use one row of path counts and scan every cell from left to right. Free cells add the top count and left count; obstacle cells reset the current column to zero immediately.",
        walkthroughMD:
          "1. Create **ways** with one entry per column and set **ways[0] = 1** as the potential starting path.\n2. Visit every cell row by row.\n3. If a cell is blocked, set **ways[col] = 0**.\n4. Otherwise, if **col > 0**, add **ways[col - 1]** into **ways[col]**.\n5. Return **ways[cols - 1]** after the last row is processed.",
        complexity: {
          time: "O(m · n)",
          space: "O(n)",
          note: "Each grid cell is processed once, and the DP state stores one row.",
        },
        filename: "Solution.java",
        code: `class Solution {

    public int uniquePathsWithObstacles(int[][] obstacleGrid) {
        int rows = obstacleGrid.length;
        int cols = obstacleGrid[0].length;
        int[] ways = new int[cols];
        ways[0] = 1;

        for (int row = 0; row < rows; row++) {
            for (int col = 0; col < cols; col++) {
                if (obstacleGrid[row][col] == 1) {
                    ways[col] = 0;
                } else if (col > 0) {
                    ways[col] += ways[col - 1];
                }
            }
        }

        return ways[cols - 1];
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "obstacleGrid = [[0,0,0],[0,1,0],[0,0,0]]. The middle cell blocks all paths through row 1, column 1.",
      columns: ["cell", "blocked", "top value", "left value", "ways after update"],
      rows: [
        ["(0,0)", "no", "1", "none", "[1,0,0]"],
        ["(0,1)", "no", "0", "1", "[1,1,0]"],
        ["(0,2)", "no", "0", "1", "[1,1,1]"],
        ["(1,0)", "no", "1", "none", "[1,1,1]"],
        ["(1,1)", "yes", "1", "1", "[1,0,1]"],
        ["(1,2)", "no", "1", "0", "[1,0,1]"],
        ["(2,0)", "no", "1", "none", "[1,0,1]"],
        ["(2,1)", "no", "0", "1", "[1,1,1]"],
        ["(2,2)", "no", "1", "1", "[1,1,2]"],
      ],
      narrativeMD: "The obstacle at **(1, 1)** resets the middle column to zero for that row. By the bottom-right cell, the two surviving routes contribute **2** paths.",
    },
    complexityNote:
      "Obstacle handling does not change the asymptotic cost. The only new operation is a constant-time reset to zero when a blocked cell is encountered.",
    interviewTipsMD:
      "Present this as Unique Paths with a blocking rule. The most important implementation detail is that an obstacle must overwrite the current DP value with zero immediately. That one line correctly handles obstacles in the first row, first column, start cell, and finish cell without special-case branches.",
    followUps: [
      "What if obstacles can appear after each move and the grid changes over time?",
      "How would you return one actual valid path instead of the count?",
      "How does the solution change if the robot can move up or left as well?",
      "Can you count paths modulo a large prime when the answer may be huge?",
    ],
    similarProblems: [
      {
        title: "Unique Paths",
        difficulty: "Medium",
        slug: "dp-unique-paths",
        note: "The same path-counting recurrence without blocked cells.",
      },
      {
        title: "Minimum Path Sum",
        difficulty: "Medium",
        slug: "dp-minimum-path-sum",
        note: "Same grid traversal order, but each cell contributes cost instead of a path count.",
      },
      {
        title: "Word Break",
        difficulty: "Medium",
        slug: "dp-word-break",
        note: "Another problem where invalid states contribute zero ways to future states.",
      },
      {
        title: "Perfect Squares",
        difficulty: "Medium",
        slug: "dp-perfect-squares",
        note: "Uses reachable states and blocked-like impossible states in a 1D DP table.",
      },
    ],
    keyTakeaways: [
      "A blocked cell is a DP state with zero valid paths.",
      "Reset obstacle cells immediately so later cells cannot inherit invalid paths.",
      "The 1D row update still works because top and left remain the only dependencies.",
      "A careful recurrence can eliminate most obstacle edge cases.",
    ],
    pattern:
      "Obstacle grid DP: sweep row by row, set blocked states to zero, otherwise combine top and left neighbours, and let the same rule handle edges and endpoints.",
  },
  {
    kind: "problem",
    slug: "dp-minimum-path-sum",
    moduleId: "dp-grid",
    order: 20,
    title: "Minimum Path Sum",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/minimum-path-sum/",
    tags: ["Dynamic Programming", "Grid DP", "Matrix", "Shortest Path"],
    companies: ["Amazon", "Google", "Microsoft", "Apple", "Bloomberg"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 20,
    statementMD:
      "You are given an **m x n** grid filled with non-negative numbers. Starting at the top-left cell, move only **down** or **right** until you reach the bottom-right cell. Return the minimum possible sum of values along the path, including both endpoints.",
    constraints: [
      "m == grid.length",
      "n == grid[i].length",
      "1 <= m, n <= 200",
      "0 <= grid[i][j] <= 200",
    ],
    inputMD: "A 2D integer grid **grid** containing non-negative cell costs.",
    outputMD: "An integer: the minimum path sum from the top-left cell to the bottom-right cell.",
    examples: [
      {
        input: "grid = [[1,3,1],[1,5,1],[4,2,1]]",
        output: "7",
        explanation: "The minimum path is 1 -> 3 -> 1 -> 1 -> 1, with total cost 7.",
      },
      {
        input: "grid = [[1,2,3],[4,5,6]]",
        output: "12",
        explanation: "The best path is 1 -> 2 -> 3 -> 6, with total cost 12.",
      },
    ],
    learningObjectives: [
      "Convert a grid path problem from counting paths to minimising accumulated cost.",
      "Define each state as the best cost to reach a cell from the start.",
      "Handle first-row and first-column base cases as forced paths.",
      "Compress the table to a 1D row while preserving top and left dependencies.",
    ],
    intuitionMD:
      "The robot still reaches each cell from only two possible neighbours: top or left. The difference from Unique Paths is the value we store. Instead of asking how many ways reach this cell, ask what is the cheapest total cost to reach this cell.\n\nIf the cheapest path into the top neighbour is known and the cheapest path into the left neighbour is known, then the cheapest path into the current cell must take the smaller of those two and add the current cell cost. Non-negative costs are not even essential for this recurrence; the acyclic movement direction is what makes the local choice safe.\n\nFor a 1D row, **best[col]** before the update is the cheapest cost from above, and **best[col - 1]** after its update is the cheapest cost from the left. Taking their minimum gives the best predecessor.",
    commonMistakes: [
      "Using addition of top and left as in path counting instead of taking the minimum.",
      "Forgetting to add the current grid value after choosing the cheaper predecessor.",
      "Initialising edge cells to zero instead of the cumulative forced path cost.",
      "Updating the first column with a minimum even though it can only come from above.",
      "Treating the problem as general shortest path even though the movement direction makes DP sufficient.",
    ],
    stateDefinitionMD:
      "Let **dp[i][j]** be the minimum path sum needed to reach cell **(i, j)** from **(0, 0)** using only down and right moves. The answer is **dp[m - 1][n - 1]**.\n\nIn the 1D version, **best[j]** stores the minimum path sum to reach column **j** in the current row after it has been processed.",
    stateTransitionMD:
      "Base case: **dp[0][0] = grid[0][0]**. Cells in the first row can only come from the left, and cells in the first column can only come from above.\n\nFor every inner cell:\n\n**dp[i][j] = grid[i][j] + min(dp[i - 1][j], dp[i][j - 1])**\n\nIn the 1D version, update **best[j] = grid[i][j] + min(best[j], best[j - 1])**, where the old **best[j]** is the top neighbour and **best[j - 1]** is the current-row left neighbour.",
    solutions: [
      {
        name: "Space-optimized row DP",
        approachMD:
          "Keep one row of best costs. Build the first row as cumulative sums, then process each later row left to right using the smaller of the top and left costs.",
        walkthroughMD:
          "1. Set **best[0]** to the starting cell cost.\n2. Fill the first row by cumulative addition because only right moves are possible there.\n3. For each new row, update **best[0]** by adding the first-column cost because only down moves are possible.\n4. For each inner column, add the current grid value to the smaller of **best[col]** from above and **best[col - 1]** from the left.\n5. Return **best[cols - 1]**.",
        complexity: {
          time: "O(m · n)",
          space: "O(n)",
          note: "The algorithm visits each cell once and stores one row of minimum costs.",
        },
        filename: "Solution.java",
        code: `class Solution {

    public int minPathSum(int[][] grid) {
        int rows = grid.length;
        int cols = grid[0].length;
        int[] best = new int[cols];

        best[0] = grid[0][0];
        for (int col = 1; col < cols; col++) {
            best[col] = best[col - 1] + grid[0][col];
        }

        for (int row = 1; row < rows; row++) {
            best[0] += grid[row][0];
            for (int col = 1; col < cols; col++) {
                best[col] = grid[row][col] + Math.min(best[col], best[col - 1]);
            }
        }

        return best[cols - 1];
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "grid = [[1,3,1],[1,5,1],[4,2,1]]. First initialise the top row as cumulative costs.",
      columns: ["step", "cell cost", "top cost", "left cost", "best after update"],
      rows: [
        ["top row", "1, 3, 1", "-", "forced", "[1,4,5]"],
        ["(1,0)", "1", "1", "none", "[2,4,5]"],
        ["(1,1)", "5", "4", "2", "[2,7,5]"],
        ["(1,2)", "1", "5", "7", "[2,7,6]"],
        ["(2,0)", "4", "2", "none", "[6,7,6]"],
        ["(2,1)", "2", "7", "6", "[6,8,6]"],
        ["(2,2)", "1", "6", "8", "[6,8,7]"],
      ],
      narrativeMD: "The bottom-right value becomes **7**, matching the path 1 -> 3 -> 1 -> 1 -> 1. Each inner update chooses the cheaper predecessor, then pays the current cell cost.",
    },
    complexityNote:
      "The row-array solution is optimal for this DP dependency pattern: O(m · n) time to inspect all costs and O(n) auxiliary space for the previous row.",
    interviewTipsMD:
      "Make the contrast with Unique Paths explicit: the structure is identical, but the aggregation changes from sum to minimum plus current cost. Interviewers like to see that you can reuse the grid-DP template while swapping the meaning of the state.",
    followUps: [
      "How would you reconstruct one minimum-cost path after computing the cost?",
      "What if some cells are blocked and cannot be used?",
      "What if movement were allowed in four directions instead of only down and right?",
      "Can you modify the solution when the grid is streamed row by row?",
    ],
    similarProblems: [
      {
        title: "Unique Paths",
        difficulty: "Medium",
        slug: "dp-unique-paths",
        note: "Same grid sweep, but counts paths instead of minimising cost.",
      },
      {
        title: "Unique Paths II",
        difficulty: "Medium",
        slug: "dp-unique-paths-ii",
        note: "Adds blocked states to the same top-left traversal pattern.",
      },
      {
        title: "Triangle",
        difficulty: "Medium",
        slug: "dp-triangle",
        note: "Another minimum path problem with adjacent-row dependencies.",
      },
      {
        title: "Dungeon Game",
        difficulty: "Hard",
        slug: "dp-dungeon-game",
        note: "Looks like a path-cost grid, but must be solved backward because the state asks for required future health.",
      },
    ],
    keyTakeaways: [
      "Minimum path grid DP stores the best cost to reach each cell.",
      "The transition uses current cost plus the cheaper of top and left.",
      "Edge cells are forced paths and must be initialised cumulatively.",
      "The previous-row dependency compresses naturally to O(n) space.",
    ],
    pattern:
      "Top-left grid minimisation DP: define the best cost to reach each cell, seed forced edges, then use current value plus min(top, left) while compressing to one row.",
  },
  {
    kind: "problem",
    slug: "dp-triangle",
    moduleId: "dp-grid",
    order: 21,
    title: "Triangle",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/triangle/",
    tags: ["Dynamic Programming", "Triangle DP", "Bottom-Up DP", "Array"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Adobe"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 20,
    statementMD:
      "You are given a triangle array. Starting at the top, move to adjacent numbers on the row below. Return the minimum path sum from the top to any value in the last row.",
    constraints: [
      "1 <= triangle.length <= 200",
      "triangle[0].length == 1",
      "triangle[i].length == triangle[i - 1].length + 1",
      "-10^4 <= triangle[i][j] <= 10^4",
    ],
    inputMD: "A list of rows **triangle**, where row **i** has **i + 1** integers.",
    outputMD: "An integer: the minimum total from the top row to the bottom row using adjacent downward moves.",
    examples: [
      {
        input: "triangle = [[2],[3,4],[6,5,7],[4,1,8,3]]",
        output: "11",
        explanation: "The minimum path is 2 -> 3 -> 5 -> 1, with total cost 11.",
      },
      {
        input: "triangle = [[-10]]",
        output: "-10",
        explanation: "There is only one value, so it is both the start and the minimum total.",
      },
    ],
    learningObjectives: [
      "Recognise that each triangle position has two possible children in the next row.",
      "Define a bottom-up state as the minimum suffix cost from a cell to the bottom.",
      "Use the last row as the base case for upward processing.",
      "Compress the DP to a single row of length equal to the triangle height.",
    ],
    intuitionMD:
      "A forward view asks for the cheapest cost to reach each position from the top. That works, but it needs careful edge handling because each row has a different length.\n\nThe cleaner interview solution looks from the bottom upward. If you already know the minimum cost from each child to the bottom, then the best path from the current value is simply the current value plus the cheaper child. By the time you reach the top, the whole triangle has collapsed into one number.\n\nThis is why a 1D array is natural. **dp[j]** and **dp[j + 1]** represent the two child choices directly below the current cell. Updating **dp[j]** from left to right within a row is safe because both child values come from the row below before they are overwritten for this row.",
    commonMistakes: [
      "Using the rectangular grid recurrence with top and left neighbours; a triangle cell depends on two adjacent children when solved bottom-up.",
      "Returning the minimum value in the last row after a top-down pass without ensuring all path sums were updated correctly.",
      "Processing bottom-up from right to left and then accidentally reading an already-updated child value.",
      "Forgetting that values can be negative, so greedy local choices from the top are not reliable.",
    ],
    stateDefinitionMD:
      "Let **dp[i][j]** be the minimum path sum starting at triangle cell **(i, j)** and ending anywhere in the last row. The answer is **dp[0][0]**.\n\nFor the compressed version, after processing row **i**, **dp[j]** stores that same minimum suffix sum for cell **(i, j)**.",
    stateTransitionMD:
      "Base case: every last-row state is the cell value itself, so **dp[last][j] = triangle[last][j]**.\n\nFor rows above the last row:\n\n**dp[i][j] = triangle[i][j] + min(dp[i + 1][j], dp[i + 1][j + 1])**\n\nIn the 1D version, process rows from bottom to top and update **dp[j] = triangle[i][j] + min(dp[j], dp[j + 1])**. Before the update, **dp[j]** and **dp[j + 1]** are the two child costs from the row below.",
    solutions: [
      {
        name: "Bottom-up 1D DP",
        approachMD:
          "Collapse the triangle from the bottom row upward. A sentinel-sized array starts at zero below the triangle, and each row overwrites the entries that correspond to its cells.",
        walkthroughMD:
          "1. Let **n** be the number of rows and create **best** with length **n + 1** filled with zero.\n2. Iterate **row** from **n - 1** down to **0**.\n3. For each column in that row, compute the current value plus the smaller of the two child costs **best[col]** and **best[col + 1]**.\n4. Store the result back into **best[col]**.\n5. After the top row is processed, return **best[0]**.",
        complexity: {
          time: "O(n^2)",
          space: "O(n)",
          note: "The number of triangle entries is O(n^2), and the DP stores one row of child costs.",
        },
        filename: "Solution.java",
        code: `import java.util.List;

class Solution {

    public int minimumTotal(List<List<Integer>> triangle) {
        int n = triangle.size();
        int[] best = new int[n + 1];

        for (int row = n - 1; row >= 0; row--) {
            List<Integer> values = triangle.get(row);
            for (int col = 0; col <= row; col++) {
                best[col] = values.get(col) + Math.min(best[col], best[col + 1]);
            }
        }

        return best[0];
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "triangle = [[2],[3,4],[6,5,7],[4,1,8,3]]. The array has one extra sentinel zero at the end.",
      columns: ["row", "values", "best before row", "updates", "best after row"],
      rows: [
        ["3", "[4,1,8,3]", "[0,0,0,0,0]", "4+min(0,0), 1+min(0,0), 8+min(0,0), 3+min(0,0)", "[4,1,8,3,0]"],
        ["2", "[6,5,7]", "[4,1,8,3,0]", "6+min(4,1)=7, 5+min(1,8)=6, 7+min(8,3)=10", "[7,6,10,3,0]"],
        ["1", "[3,4]", "[7,6,10,3,0]", "3+min(7,6)=9, 4+min(6,10)=10", "[9,10,10,3,0]"],
        ["0", "[2]", "[9,10,10,3,0]", "2+min(9,10)=11", "[11,10,10,3,0]"],
      ],
      narrativeMD: "After the top row collapses, **best[0] = 11**. Each row reuses the row below as its two-child lookup table.",
    },
    complexityNote:
      "A triangle with **n** rows contains O(n^2) values, so reading all values already costs O(n^2). The bottom-up row compression keeps auxiliary space to O(n).",
    interviewTipsMD:
      "Lead with the bottom-up interpretation. It avoids awkward top-row edge cases and makes the transition almost visual: current value plus the cheaper of the two children below. Emphasise that negative numbers defeat greedy choices, but not DP, because DP keeps the full best suffix for every position.",
    followUps: [
      "How would you solve it top-down with memoization?",
      "How would you reconstruct the actual minimum path values?",
      "What if each move could go to any of the next row positions within distance two?",
      "Can you update the triangle in place if mutation is allowed?",
    ],
    similarProblems: [
      {
        title: "Minimum Path Sum",
        difficulty: "Medium",
        slug: "dp-minimum-path-sum",
        note: "Another minimum path problem, but on a rectangular grid with top and left predecessors.",
      },
      {
        title: "Dungeon Game",
        difficulty: "Hard",
        slug: "dp-dungeon-game",
        note: "Also benefits from solving backward from future requirements.",
      },
      {
        title: "Min Cost Climbing Stairs",
        difficulty: "Easy",
        slug: "dp-min-cost-climbing-stairs",
        note: "A 1D minimum-cost recurrence over adjacent next choices.",
      },
      {
        title: "Stone Game",
        difficulty: "Medium",
        slug: "dp-stone-game",
        note: "Uses interval-style future choices rather than grid-like child choices.",
      },
    ],
    keyTakeaways: [
      "Triangle DP can be solved cleanly by defining the state as minimum suffix cost.",
      "Bottom-up processing turns each cell into current value plus the cheaper child.",
      "The last row is the natural base case because no more moves are needed there.",
      "A single array is enough because each row only needs the row directly below it.",
    ],
    pattern:
      "Bottom-up triangular DP: define the best suffix from each cell, seed from the bottom row, collapse upward with current value plus min(child, child), and return the top state.",
  },
  {
    kind: "problem",
    slug: "dp-dungeon-game",
    moduleId: "dp-grid",
    order: 22,
    title: "Dungeon Game",
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/dungeon-game/",
    tags: ["Dynamic Programming", "Grid DP", "Reverse DP", "Matrix"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Bloomberg"],
    estimatedReadingMin: 11,
    estimatedSolvingMin: 30,
    statementMD:
      "A knight starts in the top-left cell of a dungeon and must rescue the princess in the bottom-right cell. The knight may move only **right** or **down**. Each cell either removes health with a negative value, adds health with a positive value, or does nothing with zero. The knight dies immediately if health ever drops to **0** or below. Return the minimum initial health needed to guarantee rescue.",
    constraints: [
      "m == dungeon.length",
      "n == dungeon[i].length",
      "1 <= m, n <= 200",
      "-1000 <= dungeon[i][j] <= 1000",
    ],
    inputMD: "A 2D integer grid **dungeon**, where negative values are damage and positive values are healing.",
    outputMD: "An integer: the minimum initial health the knight needs before entering the top-left cell.",
    examples: [
      {
        input: "dungeon = [[-2,-3,3],[-5,-10,1],[10,30,-5]]",
        output: "7",
        explanation: "With 7 initial health, the knight can follow a route that never drops below 1 and reaches the princess. Any smaller starting health fails on every valid route.",
      },
      {
        input: "dungeon = [[0]]",
        output: "1",
        explanation: "The knight must always have at least 1 health, even when the only room has no effect.",
      },
      {
        input: "dungeon = [[100]]",
        output: "1",
        explanation: "A healing start still requires at least 1 initial health before entering the room.",
      },
    ],
    learningObjectives: [
      "Define a reverse DP state as the health required before entering a cell.",
      "Explain why forward accumulated-sum DP is insufficient for this problem.",
      "Derive the bottom-right to top-left recurrence from future health requirements.",
      "Use sentinel values to implement a 1D reverse grid DP cleanly.",
    ],
    intuitionMD:
      "This problem is tricky because the best prefix is not enough information. A forward DP that stores maximum health gained so far, minimum damage so far, or best remaining health can choose a path that looks good early but fails after a later deep negative room. The required starting health at a cell depends on what must be true after leaving that cell, so it depends on the future.\n\nReverse the question. Instead of asking how much health do I have when I reach this cell, ask how much health must I have before entering this cell so that I can still survive from here to the princess. Now the future is already known if we fill from bottom-right to top-left.\n\nIf the cheaper future requirement among right and down is **nextNeed**, then entering the current cell with **nextNeed - dungeon[i][j]** health is enough after applying the room value. But health can never be below **1**, so every state is clamped with **max(1, ...)**.",
    commonMistakes: [
      "Trying to solve forward with one value per cell; different paths can have the same current sum but very different worst future damage.",
      "Maximising total health collected instead of minimising the initial health needed to never die.",
      "Forgetting to clamp each state to at least **1**.",
      "Using top and left predecessors even though the correct dependency is future cells: down and right.",
      "Initialising the princess cell as its raw dungeon value instead of the health required before entering it.",
    ],
    stateDefinitionMD:
      "Let **dp[i][j]** be the minimum health required before entering cell **(i, j)** so that the knight can reach the princess alive from that cell. The answer is **dp[0][0]**.\n\nThis definition is intentionally future-facing. It stores a requirement, not a reward collected so far.",
    stateTransitionMD:
      "At the princess cell, the knight must leave the room alive, so the required health is **max(1, 1 - dungeon[m - 1][n - 1])**.\n\nFor any other cell, choose the easier future between moving down and moving right:\n\n**dp[i][j] = max(1, min(dp[i + 1][j], dp[i][j + 1]) - dungeon[i][j])**\n\nWe fill from bottom-right to top-left because **dp[i][j]** needs future states. A forward recurrence from top and left fails because it cannot summarise both current health and the minimum health ever seen along the path in one safe scalar without knowing future damage.",
    solutions: [
      {
        name: "Reverse 1D DP with sentinels",
        approachMD:
          "Store one row of required health values while scanning from bottom-right to top-left. Sentinel values make cells outside the dungeon impossible, except for one virtual cell next to the princess that represents needing 1 health after rescue.",
        walkthroughMD:
          "1. Create **need** with **cols + 1** entries and fill it with a very large value.\n2. Set **need[cols - 1] = 1** so the princess cell can choose a valid virtual exit requirement.\n3. Process rows from bottom to top and columns from right to left.\n4. Let **nextNeed** be the smaller of the down requirement **need[col]** and the right requirement **need[col + 1]**.\n5. Set **need[col] = max(1, nextNeed - dungeon[row][col])**.\n6. Return **need[0]** after the top-left cell is processed.",
        complexity: {
          time: "O(m · n)",
          space: "O(n)",
          note: "Every cell is processed once, and the DP stores required health for one row plus a sentinel.",
        },
        filename: "Solution.java",
        code: `import java.util.Arrays;

class Solution {

    public int calculateMinimumHP(int[][] dungeon) {
        int rows = dungeon.length;
        int cols = dungeon[0].length;
        int impossible = 1_000_000_000;
        int[] need = new int[cols + 1];
        Arrays.fill(need, impossible);
        need[cols - 1] = 1;

        for (int row = rows - 1; row >= 0; row--) {
            for (int col = cols - 1; col >= 0; col--) {
                int nextNeed = Math.min(need[col], need[col + 1]);
                need[col] = Math.max(1, nextNeed - dungeon[row][col]);
            }
        }

        return need[0];
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "dungeon = [[-2,-3,3],[-5,-10,1],[10,30,-5]]. The array includes an impossible sentinel at the far right and starts with need[2] = 1 for the virtual exit beside the princess.",
      columns: ["cell", "dungeon value", "down need", "right need", "need after update"],
      rows: [
        ["(2,2)", "-5", "1", "inf", "[inf,inf,6,inf]"],
        ["(2,1)", "30", "inf", "6", "[inf,1,6,inf]"],
        ["(2,0)", "10", "inf", "1", "[1,1,6,inf]"],
        ["(1,2)", "1", "6", "inf", "[1,1,5,inf]"],
        ["(1,1)", "-10", "1", "5", "[1,11,5,inf]"],
        ["(1,0)", "-5", "1", "11", "[6,11,5,inf]"],
        ["(0,2)", "3", "5", "inf", "[6,11,2,inf]"],
        ["(0,1)", "-3", "11", "2", "[6,5,2,inf]"],
        ["(0,0)", "-2", "6", "5", "[7,5,2,inf]"],
      ],
      narrativeMD: "The top-left requirement becomes **7**. The table stores how much health is needed before entering each cell, so positive rooms can reduce the requirement but never below **1**.",
    },
    complexityNote:
      "The reverse DP is O(m · n) time and O(n) space. The direction is not an optimization detail; it is required by the meaning of the state because each cell depends on future survival requirements.",
    interviewTipsMD:
      "Spend time explaining why forward DP fails. A single forward value cannot decide between paths without knowing the worst future damage still ahead. Once you define the state as health needed before entering a cell, the backward recurrence becomes straightforward and shows strong DP judgment.",
    followUps: [
      "How would you reconstruct a path that works with the minimum initial health?",
      "What if the knight could move right, down, or diagonally down-right?",
      "What if health were capped at a maximum value after healing rooms?",
      "Can the same reverse-state idea help with other survival threshold problems?",
    ],
    similarProblems: [
      {
        title: "Minimum Path Sum",
        difficulty: "Medium",
        slug: "dp-minimum-path-sum",
        note: "A forward grid minimisation problem that highlights why Dungeon Game needs a different state.",
      },
      {
        title: "Triangle",
        difficulty: "Medium",
        slug: "dp-triangle",
        note: "Also solves from future choices backward to the current state.",
      },
      {
        title: "Unique Paths II",
        difficulty: "Medium",
        slug: "dp-unique-paths-ii",
        note: "Same grid boundary discipline, but with forward counting instead of reverse requirements.",
      },
      {
        title: "Cherry Pickup",
        difficulty: "Hard",
        slug: "dp-cherry-pickup",
        note: "Another hard grid DP where choosing the right state is the main challenge.",
      },
    ],
    keyTakeaways: [
      "Dungeon Game is solved backward because the state depends on future survival needs.",
      "Define **dp[i][j]** as required health before entering a cell, not health collected so far.",
      "The recurrence chooses the easier future move and subtracts the current room value.",
      "Every required-health state must be clamped to at least **1**.",
    ],
    pattern:
      "Reverse grid requirement DP: define what must be true before entering each cell, seed the destination, fill from bottom-right to top-left, and clamp survival requirements to valid bounds.",
  },
];
