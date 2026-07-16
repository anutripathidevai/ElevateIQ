import type { GraphProblem } from "../types";

export const PROBLEMS: GraphProblem[] = [
  {
    slug: "graph-rotting-oranges",
    moduleId: "grid-graphs",
    order: 23,
    title: "Rotting Oranges",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/rotting-oranges/",
    tags: ["Graph", "BFS", "Matrix", "Queue", "Simulation"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Oracle"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 22,
    statementMD: "You are given an **m x n** grid where each cell is one of three values: **0** means empty, **1** means a fresh orange, and **2** means a rotten orange.\n\nEvery minute, each rotten orange rots all 4-directionally adjacent fresh oranges. Return the minimum number of minutes until no fresh orange remains. If some fresh orange can never rot, return **-1**.",
    constraints: [
      "m == grid.length",
      "n == grid[i].length",
      "1 <= m, n <= 10",
      "grid[i][j] is 0, 1, or 2",
    ],
    inputMD: "A 2D integer grid containing empty cells, fresh oranges, and rotten oranges.",
    outputMD: "An integer: the number of minutes needed to rot every reachable fresh orange, or -1 if impossible.",
    examples: [
      {
        input: "grid = [[2,1,1],[1,1,0],[0,1,1]]",
        output: "4",
        explanation: "The initial rotten orange at the top-left spreads one layer per minute. The farthest fresh orange rots after 4 minutes.",
      },
      {
        input: "grid = [[2,1,1],[0,1,1],[1,0,1]]",
        output: "-1",
        explanation: "The fresh orange in the bottom-left is isolated by empty cells, so it can never be reached by rot.",
      },
      {
        input: "grid = [[0,2]]",
        output: "0",
        explanation: "There are no fresh oranges at the start, so zero minutes are needed.",
      },
    ],
    learningObjectives: [
      "Recognise simultaneous spread as **multi-source BFS**, not repeated single-source searches.",
      "Count BFS levels as elapsed minutes while all initial rotten oranges start at distance 0.",
      "Use a remaining fresh count to decide whether the process succeeded or was blocked.",
    ],
    intuitionMD: "Rot spreads like a wave. If there are several rotten oranges at time 0, they all expand **simultaneously**. That is the key: you should not BFS from one rotten orange, finish it, then BFS from the next. Doing so would pretend time runs separately for each source and can overcount minutes.\n\nInstead, put **all initially rotten cells into the same queue** before the BFS starts. They are all distance 0. The first layer of neighbours rots at minute 1, the next layer at minute 2, and so on. This is the same shortest-distance idea as normal BFS, except the queue has multiple starting points.\n\nTracking fresh oranges turns the end condition into a simple check. Every time a fresh orange is enqueued, immediately mark it rotten and decrement fresh. If fresh reaches 0, the current minute count is enough. If the queue drains while fresh is still positive, those oranges were separated by empty cells and the answer is -1.",
    commonMistakes: [
      "Starting BFS from each rotten orange independently instead of seeding one queue with all sources.",
      "Incrementing minutes after every cell rather than after every BFS layer.",
      "Marking an orange rotten only when it is dequeued, allowing the same fresh orange to be enqueued by multiple neighbours.",
      "Returning the number of processed layers even when fresh oranges remain unreachable.",
      "Returning 1 for a grid that starts with no fresh oranges; the correct answer is 0.",
    ],
    algorithmMD: "1. Scan the grid once. Count fresh oranges and enqueue every initially rotten cell.\n2. Run BFS while the queue is non-empty and fresh > 0. Each loop iteration represents one minute and processes exactly the current queue size.\n3. For each rotten cell in that layer, examine its four neighbours. When a neighbour is fresh, mark it rotten immediately, decrement fresh, and enqueue it for the next minute.\n4. After the BFS, return minutes if fresh == 0; otherwise return -1.",
    solutions: [
      {
        name: "Multi-source BFS by minute",
        approachMD: "Seed the queue with all rotten oranges at once, then process one queue layer per minute so the earliest rot time for every cell is computed automatically.",
        walkthroughMD: "1. The initial scan collects all sources and counts fresh oranges.\n2. The outer BFS loop runs only while there is still fresh fruit to rot; this prevents an extra minute when the queue contains no useful frontier.\n3. The current queue size freezes the layer for this minute. Newly rotten oranges are enqueued but processed in the next minute.\n4. Marking grid[nextRow][nextCol] = 2 before enqueueing prevents duplicate work and duplicate fresh decrements.",
        complexity: {
          time: "O(m · n)",
          space: "O(m · n)",
          note: "Every cell is scanned once and each orange enters the queue at most once.",
        },
        filename: "Solution.java",
        code: `import java.util.ArrayDeque;
import java.util.Queue;

class Solution {

    private static final int[][] DIRECTIONS = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

    public int orangesRotting(int[][] grid) {
        int rows = grid.length;
        int cols = grid[0].length;
        Queue<int[]> queue = new ArrayDeque<>();
        int fresh = 0;

        for (int row = 0; row < rows; row++) {
            for (int col = 0; col < cols; col++) {
                if (grid[row][col] == 2) {
                    queue.offer(new int[]{row, col});
                } else if (grid[row][col] == 1) {
                    fresh++;
                }
            }
        }

        int minutes = 0;
        while (!queue.isEmpty() && fresh > 0) {
            int layerSize = queue.size();
            for (int i = 0; i < layerSize; i++) {
                int[] cell = queue.poll();
                for (int[] direction : DIRECTIONS) {
                    int nextRow = cell[0] + direction[0];
                    int nextCol = cell[1] + direction[1];
                    if (nextRow >= 0 && nextCol >= 0
                            && nextRow < rows && nextCol < cols
                            && grid[nextRow][nextCol] == 1) {
                        grid[nextRow][nextCol] = 2;
                        fresh--;
                        queue.offer(new int[]{nextRow, nextCol});
                    }
                }
            }
            minutes++;
        }

        return fresh == 0 ? minutes : -1;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "grid = [[2,1,1],[1,1,0],[0,1,1]]. Queue starts with all initially rotten cells, so only (0,0) is present at minute 0.",
      columns: ["Minute", "Queue at start", "Fresh before", "Newly rotten", "Fresh after"],
      rows: [
        ["0", "[(0,0)]", "6", "(1,0), (0,1)", "4"],
        ["1", "[(1,0), (0,1)]", "4", "(1,1), (0,2)", "2"],
        ["2", "[(1,1), (0,2)]", "2", "(2,1)", "1"],
        ["3", "[(2,1)]", "1", "(2,2)", "0"],
        ["4", "stop", "0", "none", "0"],
      ],
      narrativeMD: "The queue represents the current wavefront of rot. The last fresh orange rots during the fourth processed minute, so the answer is **4**. A blocked orange would remain fresh after the queue empties, producing -1.",
    },
    interviewTipsMD: "Lead with **multi-source BFS**. Say that all rotten oranges are time 0 sources, then each BFS layer is exactly one minute. This framing avoids the most common bug: doing separate BFS runs and combining them incorrectly. Be precise about when minutes increments: after processing the current layer, and only while fresh oranges remain.",
    followUps: [
      "Return the minute at which each orange rots, not just the final time.",
      "Allow diagonal rotting as well as 4-directional rotting.",
      "What if some walls block spread but are represented by a separate value?",
      "How would you solve the same spread process on a general graph instead of a grid?",
    ],
    similarProblems: [
      {
        title: "Number of Islands",
        difficulty: "Medium",
        slug: "graph-number-of-islands",
        note: "Same grid-neighbour mechanics, but connected components instead of time layers.",
      },
      {
        title: "Shortest Path in Binary Matrix",
        difficulty: "Medium",
        slug: "graph-shortest-path-in-binary-matrix",
        note: "BFS levels represent distance in a grid.",
      },
      {
        title: "Flood Fill",
        difficulty: "Easy",
        slug: "graph-flood-fill",
        note: "Single-source spread; Rotting Oranges is the multi-source version.",
      },
      {
        title: "Walls and Gates",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/walls-and-gates/",
      },
    ],
    keyTakeaways: [
      "Simultaneous spread from many cells is multi-source BFS.",
      "All initial sources enter the queue before the first minute starts.",
      "Process queue layers, not individual cells, when time increments by rounds.",
      "A fresh counter gives a clean success or impossible check at the end.",
    ],
    pattern: "Multi-source grid BFS: enqueue every starting source at distance 0, process one layer per minute, mark neighbours when enqueued, and verify no target cells remain.",
  },
];
