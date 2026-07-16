import type { GraphProblem } from "../types";

/**
 * Module 1 — Graph Traversal.
 *
 * The foundation of the track: recognise that a grid or an adjacency list is a
 * graph, then visit every reachable node exactly once with DFS or BFS. Every
 * later module builds on this traversal skeleton.
 */
export const PROBLEMS: GraphProblem[] = [
  // 1 ─────────────────────────────────────────────────────────────────────
  {
    slug: "graph-number-of-islands",
    moduleId: "traversal",
    order: 1,
    title: "Number of Islands",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/number-of-islands/",
    tags: ["Graph", "DFS", "BFS", "Matrix", "Union Find"],
    companies: ["Amazon", "Microsoft", "Google", "Meta", "Bloomberg"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 20,
    statementMD:
      "You are given an **m x n** 2D grid of characters where **'1'** represents land and **'0'** represents water. An *island* is a group of land cells connected **4-directionally** (up, down, left, right) and is surrounded by water.\n\nReturn the number of islands in the grid.",
    constraints: [
      "m == grid.length",
      "n == grid[i].length",
      "1 <= m, n <= 300",
      "grid[i][j] is '0' or '1'",
    ],
    inputMD:
      "A 2D char array **grid** of '0' and '1' values. The border of the grid is implicitly surrounded by water.",
    outputMD: "An integer: the count of distinct islands.",
    examples: [
      {
        input:
          "grid = [\n  ['1','1','0','0'],\n  ['1','1','0','0'],\n  ['0','0','1','0'],\n  ['0','0','0','1']\n]",
        output: "3",
        explanation:
          "The top-left block of four 1s is one island; the single 1 in the middle is another; the bottom-right 1 is a third.",
      },
      {
        input:
          "grid = [\n  ['1','1','1'],\n  ['0','1','0'],\n  ['1','0','1']\n]",
        output: "3",
        explanation:
          "The top plus-shape is one island (the center connects the top row down). The two bottom corners are isolated, giving three total.",
      },
    ],
    learningObjectives: [
      "See a 2D grid as an implicit graph where each land cell is a node with up to four neighbours.",
      "Use DFS or BFS to discover and 'sink' an entire connected component in one sweep.",
      "Understand why marking cells visited in-place (or with a visited set) prevents infinite loops and double counting.",
    ],
    intuitionMD:
      "Think of the grid as a map. Every time you spot land you have not seen before, you have found a **new island** — so you increment your counter and then walk the *entire* island to mark every one of its cells as visited. That walk is a graph traversal: from a land cell you move to its land neighbours, and from those to theirs, until the whole connected blob is consumed.\n\nThe key realisation is that the outer double loop only *starts* a traversal at fresh land. Any land already swallowed by a previous traversal is now water (or marked), so it can never start a second island. That is what guarantees each island is counted exactly once.\n\n**Recognise the pattern:** whenever a problem asks you to count or size connected regions in a grid, reach for grid DFS/BFS with in-place marking.",
    commonMistakes: [
      "Forgetting to mark a cell visited *before* (or as) you enqueue it, causing the same cell to be processed many times and the BFS queue to explode.",
      "Counting diagonally-connected cells as one island — this problem is 4-directional only.",
      "Mutating the grid but the interviewer wanted it preserved; use a separate boolean[][] visited if the input must stay intact.",
      "Recursion depth: a 300x300 all-land grid can recurse ~90,000 deep and overflow the stack — mention BFS as the safe alternative.",
    ],
    algorithmMD:
      "1. Initialise a counter to 0.\n2. Scan every cell (r, c) of the grid.\n3. When you find a '1', it is the seed of an undiscovered island: increment the counter and launch a traversal from (r, c).\n4. The traversal visits the seed and every land cell reachable from it, flipping each visited land cell to '0' (sinking it) so it is never revisited.\n5. After the full scan, the counter equals the number of islands.\n\nBoth DFS and BFS explore the same set of cells; they differ only in the order and in whether the call stack or an explicit queue holds the frontier.",
    solutions: [
      {
        name: "DFS (sink the island)",
        whenToUseMD:
          "The most concise approach and the natural first answer in an interview. Prefer it when the grid is small-to-medium and stack depth is not a concern.",
        approachMD:
          "From each unvisited land cell, recurse into its four neighbours, sinking every land cell you touch. Recursion implicitly manages the frontier of cells still to explore.",
        walkthroughMD:
          "1. Loop over all cells; on a '1', increment the count and call sink(r, c).\n2. sink returns immediately if (r, c) is out of bounds or is water — this single guard handles every edge of the grid.\n3. Otherwise mark the cell '0' and recurse in all four directions.\n4. Because the cell is sunk before recursing, the traversal cannot bounce back into it.",
        complexity: {
          time: "O(m · n)",
          space: "O(m · n)",
          note: "Every cell is visited once; worst-case recursion depth is the size of the largest island.",
        },
        filename: "Solution.java",
        code: `class Solution {

    public int numIslands(char[][] grid) {
        if (grid == null || grid.length == 0) {
            return 0;
        }
        int islands = 0;
        for (int row = 0; row < grid.length; row++) {
            for (int col = 0; col < grid[0].length; col++) {
                if (grid[row][col] == '1') {
                    islands++;
                    sink(grid, row, col);
                }
            }
        }
        return islands;
    }

    // Flip the whole connected island of land cells to water.
    private void sink(char[][] grid, int row, int col) {
        if (row < 0 || col < 0 || row >= grid.length || col >= grid[0].length
                || grid[row][col] != '1') {
            return;
        }
        grid[row][col] = '0';
        sink(grid, row + 1, col);
        sink(grid, row - 1, col);
        sink(grid, row, col + 1);
        sink(grid, row, col - 1);
    }
}`,
      },
      {
        name: "BFS (iterative queue)",
        whenToUseMD:
          "Preferred when the grid is large enough that recursion could overflow the stack (e.g. a 300x300 solid-land grid). Trades the call stack for an explicit queue.",
        approachMD:
          "When you find fresh land, mark it visited and push it onto a queue. Repeatedly pop a cell and enqueue its unvisited land neighbours until the queue drains — that empties exactly one island.",
        walkthroughMD:
          "1. On a '1', increment the count and start a BFS from that cell.\n2. Mark a cell '0' at the moment you enqueue it, never when you dequeue it — this is what keeps each cell out of the queue more than once.\n3. Use a fixed DIRECTIONS array to iterate the four neighbours cleanly.",
        complexity: {
          time: "O(m · n)",
          space: "O(min(m, n))",
          note: "Queue holds at most one BFS 'frontier', which is bounded by the smaller grid dimension.",
        },
        filename: "Solution.java",
        code: `import java.util.ArrayDeque;
import java.util.Queue;

class Solution {

    private static final int[][] DIRECTIONS = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

    public int numIslands(char[][] grid) {
        if (grid == null || grid.length == 0) {
            return 0;
        }
        int islands = 0;
        for (int row = 0; row < grid.length; row++) {
            for (int col = 0; col < grid[0].length; col++) {
                if (grid[row][col] == '1') {
                    islands++;
                    bfs(grid, row, col);
                }
            }
        }
        return islands;
    }

    private void bfs(char[][] grid, int startRow, int startCol) {
        Queue<int[]> queue = new ArrayDeque<>();
        grid[startRow][startCol] = '0';           // mark on enqueue
        queue.offer(new int[]{startRow, startCol});

        while (!queue.isEmpty()) {
            int[] cell = queue.poll();
            for (int[] dir : DIRECTIONS) {
                int nextRow = cell[0] + dir[0];
                int nextCol = cell[1] + dir[1];
                if (nextRow >= 0 && nextCol >= 0
                        && nextRow < grid.length && nextCol < grid[0].length
                        && grid[nextRow][nextCol] == '1') {
                    grid[nextRow][nextCol] = '0';
                    queue.offer(new int[]{nextRow, nextCol});
                }
            }
        }
    }
}`,
      },
    ],
    dryRun: {
      inputMD:
        "Trace the DFS on this 3x3 grid (rows and cols are 0-indexed):\n\nRow 0: 1 1 0\nRow 1: 0 1 0\nRow 2: 1 0 1",
      columns: ["Scan cell", "grid value", "Action", "Islands so far"],
      rows: [
        ["(0,0)", "1", "New island → sink (0,0),(0,1),(1,1)", "1"],
        ["(0,1)", "0", "Already sunk, skip", "1"],
        ["(0,2)", "0", "Water, skip", "1"],
        ["(1,0)", "0", "Water, skip", "1"],
        ["(1,1)", "0", "Already sunk, skip", "1"],
        ["(2,0)", "1", "New island → sink (2,0)", "2"],
        ["(2,1)", "0", "Water, skip", "2"],
        ["(2,2)", "1", "New island → sink (2,2)", "3"],
      ],
      narrativeMD:
        "The first sink swallows the connected L-shape of three cells, so scanning (0,1) and (1,1) later finds only water. The two lone corners each seed their own island. Final answer: **3**.",
    },
    interviewTipsMD:
      "Start by explicitly stating the grid-as-graph insight and the sink-on-visit trick — interviewers want to hear *why* it counts each island once. Mention up front that you can either mutate the grid or keep a visited matrix, and ask which they prefer. If they hint at very large grids, pivot to BFS to avoid stack overflow. Finish by noting Union-Find as a third option, which shines when islands can *merge dynamically* (the follow-up below).",
    followUps: [
      "Number of Islands II — cells turn to land one at a time and you must report the island count after each addition (Union-Find).",
      "What if connectivity were 8-directional (including diagonals)? Extend the DIRECTIONS array.",
      "Return the size of the largest island instead of the count (see Max Area of Island).",
      "The grid is too large to fit in memory — how would you stream it row by row?",
    ],
    similarProblems: [
      {
        title: "Max Area of Island",
        difficulty: "Medium",
        slug: "graph-max-area-of-island",
        note: "Same traversal, but return the largest component size.",
      },
      {
        title: "Flood Fill",
        difficulty: "Easy",
        slug: "graph-flood-fill",
        note: "Single-source version of the same grid DFS.",
      },
      {
        title: "Rotting Oranges",
        difficulty: "Medium",
        slug: "graph-rotting-oranges",
        note: "Multi-source BFS on a grid.",
      },
      {
        title: "Surrounded Regions",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/surrounded-regions/",
      },
    ],
    keyTakeaways: [
      "A grid is a graph: each cell is a node with up to four neighbours.",
      "Count components by starting a traversal only at unvisited seeds and consuming the whole component.",
      "Mark cells visited at enqueue time (BFS) or before recursing (DFS) to avoid reprocessing.",
      "Reach for BFS when recursion depth is a risk on large inputs.",
    ],
    pattern:
      "Grid DFS/BFS: outer loop seeds a traversal at each unvisited land cell; the traversal sinks the whole connected component.",
  },

  // 2 ─────────────────────────────────────────────────────────────────────
  {
    slug: "graph-flood-fill",
    moduleId: "traversal",
    order: 2,
    title: "Flood Fill",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/flood-fill/",
    tags: ["Graph", "DFS", "BFS", "Matrix"],
    companies: ["Amazon", "Microsoft", "Adobe"],
    estimatedReadingMin: 6,
    estimatedSolvingMin: 12,
    statementMD:
      "You are given an image represented by an **m x n** integer grid, plus a starting pixel **(sr, sc)** and a new **color**.\n\nPerform a *flood fill*: starting from (sr, sc), change the color of that pixel and every pixel connected to it **4-directionally** that shares the *original* color of the starting pixel. Return the modified image.\n\nThis is exactly how the paint-bucket tool works in an image editor.",
    constraints: [
      "m == image.length",
      "n == image[i].length",
      "1 <= m, n <= 50",
      "0 <= image[i][j], color < 2^16",
      "0 <= sr < m, 0 <= sc < n",
    ],
    inputMD:
      "A 2D int grid **image**, start coordinates **sr** and **sc**, and the target **color**.",
    outputMD: "The same grid after the fill has been applied in place.",
    examples: [
      {
        input:
          "image = [[1,1,1],[1,1,0],[1,0,1]], sr = 1, sc = 1, color = 2",
        output: "[[2,2,2],[2,2,0],[2,0,1]]",
        explanation:
          "Starting from the center (value 1), every 1 reachable 4-directionally from it becomes 2. The bottom-right 1 is not connected through same-colored pixels, so it stays 1.",
      },
      {
        input: "image = [[0,0,0],[0,0,0]], sr = 0, sc = 0, color = 0",
        output: "[[0,0,0],[0,0,0]]",
        explanation:
          "The new color equals the starting color, so nothing changes — and we must avoid an infinite loop here.",
      },
    ],
    learningObjectives: [
      "Apply single-source grid traversal (no outer scan — the start pixel is given).",
      "Recognise and handle the base case where the new color equals the original color.",
      "Practise the exact same DFS skeleton used for connected components.",
    ],
    intuitionMD:
      "Flood fill is Number of Islands with the outer loop removed: you are handed the exact starting cell, so you traverse *one* region and recolor it. From the start pixel you spread to any neighbour that still holds the **original** color, then to that neighbour's neighbours, and so on.\n\nThe one subtlety is the stop condition. If the requested color is the same as the pixel's current color, filling would repaint cells to a color they already have, and a naive DFS would revisit them forever. Detecting that up front (and returning immediately) is the whole trick.",
    commonMistakes: [
      "Infinite recursion when color equals the starting color — always short-circuit that case first.",
      "Comparing against the new color instead of capturing the original color before you start mutating.",
      "Reading the starting color after the first pixel has already been recolored.",
    ],
    algorithmMD:
      "1. Record startColor = image[sr][sc].\n2. If startColor already equals the target color, return immediately (nothing to do, and this prevents an infinite loop).\n3. Otherwise DFS/BFS from (sr, sc): whenever a cell equals startColor, repaint it to the new color and recurse into its four neighbours.\n4. The bounds/color check is the base case that ends each branch.",
    solutions: [
      {
        name: "DFS (recursive fill)",
        approachMD:
          "Capture the original color, guard the no-op case, then recursively repaint every same-colored 4-directional neighbour.",
        walkthroughMD:
          "1. startColor holds the region's color before any change.\n2. The early return handles startColor == color.\n3. fill repaints the current cell and recurses; the guard (out of bounds OR not startColor) stops each branch. Because a repainted cell no longer equals startColor, the traversal never loops back onto it.",
        complexity: {
          time: "O(m · n)",
          space: "O(m · n)",
          note: "Each pixel is repainted at most once; recursion depth is bounded by the region size.",
        },
        filename: "Solution.java",
        code: `class Solution {

    public int[][] floodFill(int[][] image, int sr, int sc, int color) {
        int startColor = image[sr][sc];
        if (startColor == color) {         // nothing to fill; avoid infinite loop
            return image;
        }
        fill(image, sr, sc, startColor, color);
        return image;
    }

    private void fill(int[][] image, int row, int col, int startColor, int color) {
        if (row < 0 || col < 0 || row >= image.length || col >= image[0].length
                || image[row][col] != startColor) {
            return;
        }
        image[row][col] = color;
        fill(image, row + 1, col, startColor, color);
        fill(image, row - 1, col, startColor, color);
        fill(image, row, col + 1, startColor, color);
        fill(image, row, col - 1, startColor, color);
    }
}`,
      },
    ],
    dryRun: {
      inputMD:
        "image = [[1,1,1],[1,1,0],[1,0,1]], start = (1,1), color = 2. startColor = 1.",
      columns: ["Call", "Cell", "image[cell]", "Action"],
      rows: [
        ["fill(1,1)", "(1,1)", "1", "Paint to 2, recurse 4 dirs"],
        ["fill(2,1)", "(2,1)", "0", "Not startColor, return"],
        ["fill(0,1)", "(0,1)", "1", "Paint to 2, recurse"],
        ["fill(0,0)", "(0,0)", "1", "Paint to 2"],
        ["fill(0,2)", "(0,2)", "1", "Paint to 2"],
        ["fill(1,0)", "(1,0)", "1", "Paint to 2"],
        ["fill(2,0)", "(2,0)", "1", "Paint to 2"],
        ["fill(1,2)", "(1,2)", "0", "Not startColor, return"],
      ],
      narrativeMD:
        "All 1s connected to the center are repainted to 2. The 0s block the spread, and the isolated bottom-right 1 is never reached. Result: **[[2,2,2],[2,2,0],[2,0,1]]**.",
    },
    interviewTipsMD:
      "This is a warm-up, so nail the edge case: state out loud that startColor == color must return early, and explain *why* (otherwise the fill revisits cells endlessly). Mention that BFS with a queue is an equally valid iterative version if they prefer no recursion. Interviewers often follow up by asking how flood fill relates to connected-components counting — the answer is that it is the inner traversal without the outer seeding loop.",
    followUps: [
      "Convert to an iterative BFS using a queue.",
      "Support 8-directional filling.",
      "Count how many pixels were changed.",
    ],
    similarProblems: [
      {
        title: "Number of Islands",
        difficulty: "Medium",
        slug: "graph-number-of-islands",
        note: "Flood fill run from every unvisited seed.",
      },
      {
        title: "Max Area of Island",
        difficulty: "Medium",
        slug: "graph-max-area-of-island",
      },
      {
        title: "Island Perimeter",
        difficulty: "Easy",
        url: "https://leetcode.com/problems/island-perimeter/",
      },
    ],
    keyTakeaways: [
      "Single-source fill = grid DFS/BFS without the outer seeding loop.",
      "Always capture the original color before mutating anything.",
      "Guard the no-op case (new color == old color) to avoid infinite loops.",
    ],
    pattern:
      "Single-source grid DFS: repaint the start cell and spread to same-colored neighbours; stop at bounds or a different color.",
  },

  // 3 ─────────────────────────────────────────────────────────────────────
  {
    slug: "graph-max-area-of-island",
    moduleId: "traversal",
    order: 3,
    title: "Max Area of Island",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/max-area-of-island/",
    tags: ["Graph", "DFS", "BFS", "Matrix"],
    companies: ["Amazon", "Google", "Microsoft", "Meta"],
    estimatedReadingMin: 6,
    estimatedSolvingMin: 15,
    statementMD:
      "You are given an **m x n** binary grid where **1** is land and **0** is water. An island is a 4-directionally connected group of 1s.\n\nReturn the **area** (number of cells) of the largest island. If there is no island, return **0**.",
    constraints: [
      "m == grid.length",
      "n == grid[i].length",
      "1 <= m, n <= 50",
      "grid[i][j] is 0 or 1",
    ],
    inputMD: "A 2D int grid of 0s and 1s.",
    outputMD: "An integer: the maximum island area (0 if there is none).",
    examples: [
      {
        input:
          "grid = [\n  [0,0,1,0,0],\n  [0,1,1,1,0],\n  [0,0,1,0,0],\n  [1,1,0,0,0]\n]",
        output: "5",
        explanation:
          "The plus-shaped island in the upper middle has 5 cells; the pair in the bottom-left has 2. The maximum is 5.",
      },
      {
        input: "grid = [[0,0,0],[0,0,0]]",
        output: "0",
        explanation: "No land at all, so the answer is 0.",
      },
    ],
    learningObjectives: [
      "Have a traversal *return a value* (the component size) instead of just marking cells.",
      "Aggregate per-component results into a global maximum.",
      "Reinforce that summing 1 + area(neighbours) counts the connected cells.",
    ],
    intuitionMD:
      "This is Number of Islands with a twist: instead of counting islands, you measure each one and keep the biggest. The traversal is identical — you still sink each island so it is counted once — but now the DFS **returns the number of cells it sank**. A land cell contributes 1 for itself plus whatever its four recursive calls report.\n\nThink of it as the DFS bubbling a size back up the call stack: leaves return their single cell, and each parent adds up the sizes of the regions below it. The outer loop simply tracks the largest value any single traversal produced.",
    commonMistakes: [
      "Returning early without adding the current cell, so the count is off by the component's cell count.",
      "Forgetting to reset or compare against the running maximum for every seed.",
      "Not sinking the cell before recursing, which double-counts cells and inflates the area.",
    ],
    algorithmMD:
      "1. Keep a running max, initially 0.\n2. For each unvisited land cell, run a DFS that returns the size of its island.\n3. The DFS returns 0 for water/out-of-bounds; otherwise it sinks the cell and returns 1 + the sum of the four recursive calls.\n4. Update max with each island's returned size.\n5. Return max.",
    solutions: [
      {
        name: "DFS returning component size",
        approachMD:
          "Run the standard sink-DFS, but let it return the count of cells it consumed. The largest returned value across all seeds is the answer.",
        walkthroughMD:
          "1. area(r, c) returns 0 when the cell is out of bounds or water.\n2. Otherwise it marks the cell 0 (so it is not recounted) and returns 1 plus the areas of its four neighbours.\n3. The main loop takes the max over every seed's returned area.",
        complexity: {
          time: "O(m · n)",
          space: "O(m · n)",
          note: "Each cell is visited once; recursion depth is bounded by the largest island.",
        },
        filename: "Solution.java",
        code: `class Solution {

    public int maxAreaOfIsland(int[][] grid) {
        int maxArea = 0;
        for (int row = 0; row < grid.length; row++) {
            for (int col = 0; col < grid[0].length; col++) {
                if (grid[row][col] == 1) {
                    maxArea = Math.max(maxArea, area(grid, row, col));
                }
            }
        }
        return maxArea;
    }

    // Sinks the island and returns the number of cells it contained.
    private int area(int[][] grid, int row, int col) {
        if (row < 0 || col < 0 || row >= grid.length || col >= grid[0].length
                || grid[row][col] != 1) {
            return 0;
        }
        grid[row][col] = 0;
        return 1
                + area(grid, row + 1, col)
                + area(grid, row - 1, col)
                + area(grid, row, col + 1)
                + area(grid, row, col - 1);
    }
}`,
      },
    ],
    dryRun: {
      inputMD:
        "Trace area() on the bottom-left island of grid = [[0,0],[1,1]] seeded at (1,0).",
      columns: ["Call", "Cell", "Returns", "Running max"],
      rows: [
        ["area(1,0)", "(1,0)", "1 + area(neighbours)", "-"],
        ["area(2,0)", "out of bounds", "0", "-"],
        ["area(0,0)", "(0,0) = 0", "0", "-"],
        ["area(1,1)", "(1,1) = 1", "1 + ...", "-"],
        ["area(1,1) kids", "all 0/oob", "0 each", "-"],
        ["area(1,1)", "resolves", "1", "-"],
        ["area(1,0)", "resolves", "1 + 0 + 0 + 1 + 0 = 2", "2"],
      ],
      narrativeMD:
        "The seed cell (1,0) counts itself (1) and its only land neighbour (1,1) which returns 1, giving an island area of **2**. The running max becomes 2.",
    },
    interviewTipsMD:
      "The delta from Number of Islands is tiny — say so explicitly and show that you understand the traversal by having it return a value. Interviewers use this to check whether you can adapt a known template rather than memorise a single answer. A common follow-up asks for the *count of distinct island shapes*, which needs canonical shape hashing — mention it if you have time.",
    followUps: [
      "Return the number of islands whose area is at least k.",
      "Count distinct island shapes (normalise each island's relative coordinates).",
      "Solve it with BFS or with Union-Find and compare.",
    ],
    similarProblems: [
      {
        title: "Number of Islands",
        difficulty: "Medium",
        slug: "graph-number-of-islands",
      },
      {
        title: "Flood Fill",
        difficulty: "Easy",
        slug: "graph-flood-fill",
      },
      {
        title: "Count Sub Islands",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/count-sub-islands/",
      },
      {
        title: "Number of Closed Islands",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/number-of-closed-islands/",
      },
    ],
    keyTakeaways: [
      "A traversal can return an aggregate (size, sum, depth), not just mark visited.",
      "Component size = 1 + the sizes returned by the recursive neighbour calls.",
      "Track a global maximum across all component seeds.",
    ],
    pattern:
      "Size-returning grid DFS: area = 1 + area(up) + area(down) + area(left) + area(right); take the max over all seeds.",
  },

  // 4 ─────────────────────────────────────────────────────────────────────
  {
    slug: "graph-clone-graph",
    moduleId: "traversal",
    order: 4,
    title: "Clone Graph",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/clone-graph/",
    tags: ["Graph", "DFS", "BFS", "Hash Table"],
    companies: ["Amazon", "Google", "Meta", "Microsoft", "Uber"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 25,
    statementMD:
      "Given a reference to a node in a **connected undirected graph**, return a **deep copy** (clone) of the graph. Each node contains an integer value and a list of its neighbours.\n\nThe clone must be entirely independent of the original: cloning a node means creating a brand-new node with the same value and cloned neighbour references — no node from the original graph may appear in the copy.",
    constraints: [
      "The number of nodes is in the range [0, 100].",
      "1 <= Node.val <= 100, and Node.val is unique for each node.",
      "There are no repeated edges and no self-loops.",
      "The graph is connected, so all nodes are reachable from the given node.",
    ],
    inputMD:
      "A reference to one Node of the graph (or null for an empty graph). On LeetCode the graph is given as an adjacency list, but your function receives a single starting Node.",
    outputMD: "A reference to the corresponding node in the fully cloned graph.",
    examples: [
      {
        input: "adjList = [[2,4],[1,3],[2,4],[1,3]]",
        output: "[[2,4],[1,3],[2,4],[1,3]]",
        explanation:
          "A 4-node cycle 1-2-3-4-1. The clone has the same structure but every node is a new object.",
      },
      {
        input: "adjList = [[]]",
        output: "[[]]",
        explanation: "A single node with no neighbours.",
      },
      {
        input: "adjList = []",
        output: "[]",
        explanation: "An empty graph; return null.",
      },
    ],
    learningObjectives: [
      "Traverse a general (non-grid) graph given only a starting node reference.",
      "Use a hash map from original node to its clone to handle cycles and shared neighbours.",
      "See why the visited map does double duty: it prevents infinite loops AND wires up shared references correctly.",
    ],
    intuitionMD:
      "You cannot just recurse into neighbours blindly — the graph has cycles, so a naive DFS would clone the same node again and again forever. The fix is a **map from each original node to its single clone**. Before cloning a node, check the map: if a clone already exists, return it; otherwise create the clone, record it in the map *immediately* (before touching neighbours), then clone the neighbours.\n\nRecording the clone before recursing is the crucial ordering. It means that when the traversal eventually loops back to a node it is midway through cloning, it finds the already-created clone in the map and links to it instead of spiralling into infinite recursion. The map is simultaneously your visited-set and your original→copy lookup table.",
    commonMistakes: [
      "Putting the node into the map *after* cloning its neighbours — with a cycle this recurses forever.",
      "Returning null for a single isolated node instead of a cloned node (only the empty-graph case is null).",
      "Sharing neighbour lists between original and clone, which leaks references from the original graph into the copy.",
      "Using node value as the map key when values are not guaranteed unique — key by the node object itself unless uniqueness is stated.",
    ],
    algorithmMD:
      "1. If the start node is null, return null.\n2. Keep a map originalToClone.\n3. To clone a node: if it is already in the map, return its clone. Otherwise create a new node with the same value, store it in the map, then recurse to clone each neighbour and append the clones to the new node's neighbour list.\n4. Because every node is inserted into the map before its neighbours are processed, each node is cloned exactly once even in the presence of cycles.",
    solutions: [
      {
        name: "DFS with a clone map",
        whenToUseMD:
          "The cleanest formulation and easy to reason about. Prefer it unless recursion depth is a concern for very large graphs.",
        approachMD:
          "Recursively clone the start node, memoising each clone in a HashMap keyed by the original node so cycles resolve to the existing copy.",
        walkthroughMD:
          "1. cloneGraph(node) returns null for null and the memoised clone if present.\n2. Otherwise it creates the copy, stores original→copy in the map before recursing (this breaks cycles), then clones each neighbour.\n3. The map ensures every node and edge is copied exactly once.",
        complexity: {
          time: "O(V + E)",
          space: "O(V)",
          note: "Every node and edge is processed once; the map and recursion stack hold O(V).",
        },
        filename: "Solution.java",
        code: `import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// Provided by LeetCode:
class Node {
    public int val;
    public List<Node> neighbors;

    public Node() {
        this.val = 0;
        this.neighbors = new ArrayList<>();
    }

    public Node(int val) {
        this.val = val;
        this.neighbors = new ArrayList<>();
    }
}

class Solution {

    private final Map<Node, Node> originalToClone = new HashMap<>();

    public Node cloneGraph(Node node) {
        if (node == null) {
            return null;
        }
        Node existing = originalToClone.get(node);
        if (existing != null) {
            return existing;                 // already cloned — breaks cycles
        }
        Node copy = new Node(node.val);
        originalToClone.put(node, copy);     // record BEFORE recursing
        for (Node neighbor : node.neighbors) {
            copy.neighbors.add(cloneGraph(neighbor));
        }
        return copy;
    }
}`,
      },
      {
        name: "BFS with a clone map",
        whenToUseMD:
          "Preferred when you want to avoid recursion on large graphs. Creates all clones first, then wires up neighbours level by level.",
        approachMD:
          "Clone the start node, then BFS: for each dequeued original, ensure each neighbour has a clone (create + enqueue if new) and attach the neighbour's clone to the current node's clone.",
        walkthroughMD:
          "1. Seed the map with start→clone(start) and enqueue start.\n2. Pop an original node; for every neighbour, create its clone and enqueue it the first time you see it.\n3. Always append the neighbour's clone to the current clone's neighbour list.\n4. The map guarantees one clone per node; the queue guarantees each node's edges are wired once.",
        complexity: {
          time: "O(V + E)",
          space: "O(V)",
          note: "Queue and map are both bounded by the number of nodes.",
        },
        filename: "Solution.java",
        code: `import java.util.ArrayDeque;
import java.util.HashMap;
import java.util.Map;
import java.util.Queue;

// Node is defined as in Solution 1.
class Solution {

    public Node cloneGraph(Node node) {
        if (node == null) {
            return null;
        }
        Map<Node, Node> originalToClone = new HashMap<>();
        originalToClone.put(node, new Node(node.val));

        Queue<Node> queue = new ArrayDeque<>();
        queue.offer(node);

        while (!queue.isEmpty()) {
            Node current = queue.poll();
            for (Node neighbor : current.neighbors) {
                if (!originalToClone.containsKey(neighbor)) {
                    originalToClone.put(neighbor, new Node(neighbor.val));
                    queue.offer(neighbor);
                }
                originalToClone.get(current).neighbors.add(originalToClone.get(neighbor));
            }
        }
        return originalToClone.get(node);
    }
}`,
      },
    ],
    dryRun: {
      inputMD:
        "Graph: 1 — 2 and 1 — 3 and 2 — 3 (a triangle). DFS starting at node 1.",
      columns: ["Step", "Cloning", "Map (orig → clone)", "Action"],
      rows: [
        ["1", "node 1", "{1→1'}", "Create 1', recurse into 2"],
        ["2", "node 2", "{1→1', 2→2'}", "Create 2', recurse into 1"],
        ["3", "node 1", "hit", "1' already in map, link 2'→1'"],
        ["4", "node 3", "{...,3→3'}", "Create 3' from node 2, recurse into 1,2"],
        ["5", "nodes 1,2", "hit, hit", "Both cloned; link 3'→1', 3'→2'"],
        ["6", "back to node 1", "hit", "Link 1'→2', 1'→3'"],
      ],
      narrativeMD:
        "Every node is created exactly once. When the recursion revisits an already-cloned node it reads the clone from the map and links to it, so the triangle's cycle resolves without infinite recursion.",
    },
    interviewTipsMD:
      "Lead with the cycle problem and the map-before-recurse insight — that is the entire point of the question. Be explicit that the map key should be the node object (not its value) unless the interviewer guarantees unique values. Expect a follow-up on how this generalises to serialising/deserialising a graph, or copying a linked list with random pointers (same memoisation idea).",
    followUps: [
      "Copy List with Random Pointer — the same original→copy map technique on a linked list.",
      "Serialize and deserialize the graph to a string and back.",
      "What changes if the graph is directed or disconnected? (You would need an outer loop over all nodes.)",
    ],
    similarProblems: [
      {
        title: "Copy List with Random Pointer",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/copy-list-with-random-pointer/",
        note: "Same memoised original→clone map.",
      },
      {
        title: "Find if Path Exists in Graph",
        difficulty: "Easy",
        slug: "graph-find-if-path-exists",
        note: "Adjacency-list traversal from a start node.",
      },
      {
        title: "Number of Connected Components",
        difficulty: "Medium",
        slug: "graph-number-of-connected-components",
      },
    ],
    keyTakeaways: [
      "A HashMap from original node to clone is the standard tool for deep-copying graphs.",
      "Insert into the map before recursing into neighbours to break cycles.",
      "The clone map doubles as the visited set for a general graph.",
    ],
    pattern:
      "Memoised graph traversal: map[original] = clone recorded before neighbour recursion; reuse the map to resolve cycles and shared refs.",
  },

  // 5 ─────────────────────────────────────────────────────────────────────
  {
    slug: "graph-find-if-path-exists",
    moduleId: "traversal",
    order: 5,
    title: "Find if Path Exists in Graph",
    difficulty: "Easy",
    leetcodeUrl:
      "https://leetcode.com/problems/find-if-path-exists-in-graph/",
    tags: ["Graph", "DFS", "BFS", "Union Find"],
    companies: ["Amazon", "Microsoft", "Google"],
    estimatedReadingMin: 7,
    estimatedSolvingMin: 15,
    statementMD:
      "There is a **bi-directional** graph with **n** vertices labelled 0..n-1. You are given a 2D array **edges** where each edges[i] = [u, v] connects u and v. Each pair of vertices is connected by at most one edge, and no vertex connects to itself.\n\nGiven **source** and **destination**, return **true** if a valid path exists from source to destination, otherwise **false**.",
    constraints: [
      "1 <= n <= 2 * 10^5",
      "0 <= edges.length <= 2 * 10^5",
      "edges[i].length == 2",
      "0 <= u, v, source, destination < n",
      "There are no duplicate edges and no self-loops.",
    ],
    inputMD:
      "An integer **n**, an edge list **edges**, and two vertices **source** and **destination**.",
    outputMD: "A boolean: whether source and destination are connected.",
    examples: [
      {
        input: "n = 3, edges = [[0,1],[1,2],[2,0]], source = 0, destination = 2",
        output: "true",
        explanation: "0 → 2 directly, or 0 → 1 → 2. Either way a path exists.",
      },
      {
        input:
          "n = 6, edges = [[0,1],[0,2],[3,5],[5,4],[4,3]], source = 0, destination = 5",
        output: "false",
        explanation:
          "Vertices {0,1,2} form one component and {3,4,5} another. There is no path between the two.",
      },
    ],
    learningObjectives: [
      "Build an adjacency list from an edge list — the standard first step for non-grid graphs.",
      "Answer a reachability query with BFS/DFS from a single source.",
      "Meet Union-Find as an alternative that answers connectivity without an explicit traversal.",
    ],
    intuitionMD:
      "The question is pure reachability: are source and destination in the same connected component? Two natural strategies:\n\n**Traversal.** Convert the edge list to an adjacency list, then BFS/DFS outward from source, marking visited vertices. If you ever reach destination, the path exists. This is the direct, intuitive answer.\n\n**Union-Find.** Notice you do not actually need the path — only whether the two vertices are connected. Union every edge's endpoints into the same set, then simply check whether source and destination share a root. This is the pattern to reach for when a problem asks *only* about connectivity, especially if edges arrive incrementally.",
    commonMistakes: [
      "Adding edges in only one direction — the graph is undirected, so add both u→v and v→u.",
      "Marking a vertex visited when you dequeue it instead of when you enqueue it, allowing duplicates in the queue.",
      "Recursive DFS overflowing the stack for n up to 2·10^5 — prefer BFS or an explicit stack, or Union-Find.",
      "Forgetting the trivial case source == destination (both approaches handle it, but say so).",
    ],
    algorithmMD:
      "**BFS:** build adjacency lists, enqueue source (marked visited), and repeatedly pop a vertex and enqueue its unvisited neighbours; return true if destination is reached.\n\n**Union-Find:** initialise each vertex as its own parent, union both endpoints of every edge, then return whether find(source) == find(destination). With path compression and union by rank each operation is near O(1) amortised.",
    solutions: [
      {
        name: "BFS over an adjacency list",
        whenToUseMD:
          "Great default; also lets you recover the actual path if asked. Use an explicit queue to stay safe on large inputs.",
        approachMD:
          "Turn edges into adjacency lists, then breadth-first search from source, returning true the moment destination is dequeued or discovered.",
        walkthroughMD:
          "1. Build adj as a list of lists and add each edge in both directions.\n2. BFS from source with a visited array, marking on enqueue.\n3. If a popped vertex equals destination, return true; if the queue empties first, return false.",
        complexity: {
          time: "O(V + E)",
          space: "O(V + E)",
          note: "Adjacency list stores every edge; the queue and visited array are O(V).",
        },
        filename: "Solution.java",
        code: `import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;
import java.util.Queue;

class Solution {

    public boolean validPath(int n, int[][] edges, int source, int destination) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            adj.add(new ArrayList<>());
        }
        for (int[] edge : edges) {
            adj.get(edge[0]).add(edge[1]);
            adj.get(edge[1]).add(edge[0]);
        }

        boolean[] visited = new boolean[n];
        Queue<Integer> queue = new ArrayDeque<>();
        queue.offer(source);
        visited[source] = true;

        while (!queue.isEmpty()) {
            int node = queue.poll();
            if (node == destination) {
                return true;
            }
            for (int next : adj.get(node)) {
                if (!visited[next]) {
                    visited[next] = true;
                    queue.offer(next);
                }
            }
        }
        return false;
    }
}`,
      },
      {
        name: "Union-Find (Disjoint Set Union)",
        whenToUseMD:
          "Preferred when you only need connectivity (not the path), when there are many connectivity queries, or when edges are added incrementally.",
        approachMD:
          "Union both endpoints of every edge, then check whether source and destination resolve to the same root. Path compression keeps find nearly constant time.",
        walkthroughMD:
          "1. parent[i] = i initially: every vertex is its own set.\n2. find follows parents to the root, compressing the path by pointing each node at its grandparent.\n3. union links the root of one set under the other.\n4. After unioning all edges, source and destination are connected iff they share a root.",
        complexity: {
          time: "O(V + E · α(V))",
          space: "O(V)",
          note: "α is the inverse-Ackermann function — effectively constant.",
        },
        filename: "Solution.java",
        code: `class Solution {

    public boolean validPath(int n, int[][] edges, int source, int destination) {
        int[] parent = new int[n];
        for (int i = 0; i < n; i++) {
            parent[i] = i;
        }
        for (int[] edge : edges) {
            union(parent, edge[0], edge[1]);
        }
        return find(parent, source) == find(parent, destination);
    }

    private int find(int[] parent, int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];   // path compression (halving)
            x = parent[x];
        }
        return x;
    }

    private void union(int[] parent, int a, int b) {
        parent[find(parent, a)] = find(parent, b);
    }
}`,
      },
    ],
    dryRun: {
      inputMD:
        "n = 6, edges = [[0,1],[0,2],[3,5],[5,4],[4,3]], source = 0, destination = 5. Union-Find trace (root after each union):",
      columns: ["Edge", "union", "parent snapshot (roots)", "Note"],
      rows: [
        ["[0,1]", "0 ~ 1", "{0,1}→0  2→2  3→3  4→4  5→5", "component A grows"],
        ["[0,2]", "0 ~ 2", "{0,1,2}→0  3,4,5 singletons", "A = {0,1,2}"],
        ["[3,5]", "3 ~ 5", "{3,5}→3  4→4", "component B starts"],
        ["[5,4]", "5 ~ 4", "{3,4,5}→3", "B = {3,4,5}"],
        ["[4,3]", "4 ~ 3", "no change", "already same set"],
      ],
      narrativeMD:
        "find(0) = 0 and find(5) = 3. The roots differ, so source and destination are in different components → return **false**.",
    },
    interviewTipsMD:
      "Offer both approaches and explain the trade-off: BFS/DFS if they might ask for the actual path, Union-Find if the question is purely connectivity or if edges stream in over time. Emphasise building the adjacency list in *both* directions for an undirected graph. On huge inputs, call out the recursion-depth risk and default to iterative BFS or Union-Find.",
    followUps: [
      "Return the actual shortest path, not just whether one exists (BFS with a parent array).",
      "Support online edge additions with connectivity queries interleaved (Union-Find shines).",
      "Count the number of connected components (next module).",
    ],
    similarProblems: [
      {
        title: "Number of Connected Components",
        difficulty: "Medium",
        slug: "graph-number-of-connected-components",
        note: "Count components instead of querying one pair.",
      },
      {
        title: "Number of Provinces",
        difficulty: "Medium",
        slug: "graph-number-of-provinces",
      },
      {
        title: "Graph Valid Tree",
        difficulty: "Medium",
        slug: "graph-valid-tree",
        note: "Connectivity plus an acyclicity check.",
      },
    ],
    keyTakeaways: [
      "Reachability = 'are these two nodes in the same component?'",
      "Build undirected adjacency lists by adding each edge in both directions.",
      "Union-Find answers connectivity without building or walking an adjacency list.",
      "Prefer iterative BFS or Union-Find when n is large to avoid stack overflow.",
    ],
    pattern:
      "Connectivity query: BFS/DFS from source over an adjacency list, or union all edges and compare roots of source and destination.",
  },
];
