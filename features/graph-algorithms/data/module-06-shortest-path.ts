import type { GraphProblem } from "../types";

export const PROBLEMS: GraphProblem[] = [
  {
    slug: "graph-shortest-path-in-binary-matrix",
    moduleId: "shortest-path",
    order: 18,
    title: "Shortest Path in Binary Matrix",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/shortest-path-in-binary-matrix/",
    tags: ["Graph", "Shortest Path", "BFS", "Matrix", "Queue"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 22,
    statementMD: "You are given an **n x n** binary matrix **grid** where **0** means open and **1** means blocked.\n\nA clear path starts at the top-left cell **(0, 0)**, ends at the bottom-right cell **(n - 1, n - 1)**, and only moves through open cells. From a cell you may move in **8 directions**: horizontal, vertical, or diagonal.\n\nReturn the length of the shortest clear path, measured as the **number of cells** in the path. Return **-1** if no clear path exists.",
    constraints: [
      "n == grid.length",
      "n == grid[i].length",
      "1 <= n <= 100",
      "grid[i][j] is 0 or 1",
    ],
    inputMD: "A square integer matrix **grid** containing only 0 and 1. The start is **grid[0][0]** and the target is **grid[n - 1][n - 1]**.",
    outputMD: "An integer: the minimum number of cells in any valid 8-directional clear path, or **-1** when no such path exists.",
    examples: [
      {
        input: "grid = [[0,1],[1,0]]",
        output: "2",
        explanation: "The diagonal move from (0,0) to (1,1) is allowed, so the path uses two cells.",
      },
      {
        input: "grid = [[0,0,0],[1,1,0],[1,1,0]]",
        output: "4",
        explanation: "One shortest route is (0,0) → (0,1) → (1,2) → (2,2). Diagonal movement is what keeps the path short.",
      },
      {
        input: "grid = [[1,0,0],[1,1,0],[1,1,0]]",
        output: "-1",
        explanation: "The starting cell is blocked, so no clear path can begin.",
      },
    ],
    learningObjectives: [
      "Recognise a binary grid as an unweighted graph where open cells are nodes and valid moves are edges.",
      "Use BFS to guarantee the first time the target is reached is the shortest path length.",
      "Handle 8-directional movement cleanly with a fixed neighbour array instead of writing eight separate checks.",
      "Decide whether to mark visited in-place or with a separate boolean matrix based on whether mutation is acceptable.",
    ],
    intuitionMD: "Every open cell is a room, and each allowed move is a hallway with the same cost: one step into the next cell. When all edges have equal weight, BFS is the right mental model because it explores in expanding rings: first every cell at distance 1, then every cell at distance 2, and so on.\n\nThat ring property is the whole proof. If the target is popped from the queue at distance d, every path with fewer than d cells would have been discovered in an earlier ring. There is no need for Dijkstra because there are no different edge weights to compare.\n\nThe detail that changes this from many grid BFS problems is the neighbour set. This problem is **8-directional**, so diagonals count. A two-by-two grid with open opposite corners has answer 2, not -1 and not 3.\n\n**Recognise the pattern:** shortest path in an unweighted grid or graph means BFS with distance stored by level or carried in the queue.",
    commonMistakes: [
      "Using only four directions and accidentally rejecting valid diagonal paths.",
      "Returning the number of moves instead of the number of cells. The start cell counts, so a 1x1 open grid returns 1.",
      "Marking visited when a cell is dequeued instead of when it is enqueued, allowing the same cell to enter the queue many times.",
      "Forgetting to reject a blocked start or blocked target before starting BFS.",
      "Using DFS and hoping the first path found is shortest; DFS has no shortest-path guarantee in an unweighted graph.",
    ],
    algorithmMD: "1. Let **n** be the grid size. If the start or target cell is blocked, return -1.\n2. Create a queue of states containing row, column, and distance. Seed it with **(0, 0, 1)** because the path already includes the start cell.\n3. Mark the start visited immediately. The shown solution mutates the grid by setting visited open cells to 1; a separate visited matrix is equivalent.\n4. Repeatedly pop the next cell. If it is the target, return its distance.\n5. For each of the eight directions, if the neighbour is inside the grid and still open, mark it visited and enqueue it with distance + 1.\n6. If the queue empties, every reachable open cell was explored and the target was not reached, so return -1.",
    solutions: [
      {
        name: "BFS with 8-directional moves",
        whenToUseMD: "Use this whenever every move has the same cost. It is optimal, simpler than Dijkstra, and directly matches the unweighted shortest-path guarantee.",
        approachMD: "Treat each open cell as a node in an unweighted graph. BFS expands cells by increasing path length, so the first time the target is removed from the queue is the shortest clear path. Mutating open cells to 1 is a compact visited marker; use boolean[][] visited if the input must be preserved.",
        walkthroughMD: "1. Reject blocked endpoints.\n2. Push the start with distance 1 and mark it visited.\n3. Pop cells from the queue in FIFO order.\n4. For each of the eight directions, enqueue unvisited open neighbours with distance + 1.\n5. Return as soon as the target is popped; otherwise return -1 after the queue drains.",
        complexity: {
          time: "O(n²)",
          space: "O(n²)",
          note: "Each cell is enqueued at most once, and the queue can hold O(n²) cells in the worst case.",
        },
        filename: "Solution.java",
        code: `import java.util.ArrayDeque;
import java.util.Queue;

class Solution {

    private static final int[][] DIRECTIONS = {
            {-1, -1}, {-1, 0}, {-1, 1},
            {0, -1},           {0, 1},
            {1, -1},  {1, 0},  {1, 1}
    };

    public int shortestPathBinaryMatrix(int[][] grid) {
        int n = grid.length;
        if (grid[0][0] == 1 || grid[n - 1][n - 1] == 1) {
            return -1;
        }

        Queue<int[]> queue = new ArrayDeque<>();
        queue.offer(new int[]{0, 0, 1});
        grid[0][0] = 1;

        while (!queue.isEmpty()) {
            int[] state = queue.poll();
            int row = state[0];
            int col = state[1];
            int distance = state[2];

            if (row == n - 1 && col == n - 1) {
                return distance;
            }

            for (int[] dir : DIRECTIONS) {
                int nextRow = row + dir[0];
                int nextCol = col + dir[1];
                if (nextRow >= 0 && nextCol >= 0
                        && nextRow < n && nextCol < n
                        && grid[nextRow][nextCol] == 0) {
                    grid[nextRow][nextCol] = 1;
                    queue.offer(new int[]{nextRow, nextCol, distance + 1});
                }
            }
        }

        return -1;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "Trace BFS on **grid = [[0,0,0],[1,1,0],[1,1,0]]**.",
      columns: ["Step", "Popped cell", "Distance", "New cells enqueued", "Queue after step"],
      rows: [
        ["1", "(0,0)", "1", "(0,1)", "[(0,1,d=2)]"],
        ["2", "(0,1)", "2", "(0,2), (1,2)", "[(0,2,d=3), (1,2,d=3)]"],
        ["3", "(0,2)", "3", "none, neighbours are blocked or visited", "[(1,2,d=3)]"],
        ["4", "(1,2)", "3", "(2,2)", "[(2,2,d=4)]"],
        ["5", "(2,2)", "4", "target reached", "return 4"],
      ],
      narrativeMD: "The queue processes all distance-2 cells before any distance-3 cell, and all distance-3 cells before distance 4. Therefore reaching (2,2) at distance **4** proves that no shorter clear path exists.",
    },
    interviewTipsMD: "Say the phrase **unweighted shortest path** early, then state that BFS is optimal because it explores by increasing distance. Confirm whether you may mutate the grid; if not, use a visited matrix without changing the algorithm. Call out the 8-directional neighbour array explicitly because many candidates lose the diagonal moves. For follow-ups with different move costs, explain that the solution would move from BFS to Dijkstra.",
    followUps: [
      "Return the actual path, not only its length. Store a parent coordinate for each visited cell and reconstruct from the target.",
      "What if diagonal moves cost more than horizontal moves? Use Dijkstra because edges are no longer uniform.",
      "What if some cells are unlocked after collecting keys? Add the key mask to the BFS state.",
      "Can you solve without mutating grid? Replace in-place marking with a boolean visited matrix.",
    ],
    similarProblems: [
      {
        title: "Rotting Oranges",
        difficulty: "Medium",
        slug: "graph-rotting-oranges",
        note: "Another grid BFS where levels correspond to elapsed time.",
      },
      {
        title: "Path With Minimum Effort",
        difficulty: "Medium",
        slug: "graph-path-with-minimum-effort",
        note: "Grid shortest path with weighted edges, so BFS becomes Dijkstra.",
      },
      {
        title: "Flood Fill",
        difficulty: "Easy",
        slug: "graph-flood-fill",
        note: "Single-source traversal without shortest-path distance.",
      },
      {
        title: "Shortest Path to Get All Keys",
        difficulty: "Hard",
        url: "https://leetcode.com/problems/shortest-path-to-get-all-keys/",
        note: "BFS with extra state beyond row and column.",
      },
    ],
    keyTakeaways: [
      "BFS is the shortest-path algorithm for unweighted graphs.",
      "The path length counts cells, so the start contributes distance 1.",
      "Mark visited when enqueuing to prevent duplicate frontier entries.",
      "The neighbour set is part of the graph definition; here it has eight directions.",
    ],
    pattern: "Unweighted grid shortest path: BFS from the start, carry distance by level, mark on enqueue, and return when the target is first reached.",
  },
  {
    slug: "graph-network-delay-time",
    moduleId: "shortest-path",
    order: 19,
    title: "Network Delay Time",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/network-delay-time/",
    tags: ["Graph", "Shortest Path", "Dijkstra", "Heap", "Bellman-Ford"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Uber"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 30,
    statementMD: "You are given a directed weighted graph with **n** nodes labelled **1..n**. Each entry **times[i] = [u, v, w]** means a signal can travel from node **u** to node **v** in **w** time.\n\nA signal is sent from source node **k**. Return the minimum time needed for **all** nodes to receive the signal. If at least one node is unreachable, return **-1**.",
    constraints: [
      "1 <= k <= n <= 100",
      "1 <= times.length <= 6000",
      "times[i].length == 3",
      "1 <= u, v <= n",
      "u != v",
      "0 <= w <= 100",
      "All edges are directed.",
    ],
    inputMD: "An edge list **times**, the number of nodes **n**, and the source node **k**.",
    outputMD: "An integer: the maximum shortest-path distance from **k** to any node, or **-1** if some node cannot be reached.",
    examples: [
      {
        input: "times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2",
        output: "2",
        explanation: "Nodes 1 and 3 receive the signal after 1 time unit. Node 4 receives it through 2 → 3 → 4 after 2 time units, so the whole network is done at time 2.",
      },
      {
        input: "times = [[1,2,1]], n = 2, k = 1",
        output: "1",
        explanation: "The only other node receives the signal after 1 time unit.",
      },
      {
        input: "times = [[1,2,1]], n = 2, k = 2",
        output: "-1",
        explanation: "The edge points from 1 to 2, not from 2 to 1, so node 1 is unreachable from the source.",
      },
    ],
    learningObjectives: [
      "Translate network propagation into single-source shortest paths on a directed weighted graph.",
      "Use Dijkstra with a min-heap when edge weights are non-negative.",
      "Understand Bellman-Ford as a relaxation-based alternative for single-source shortest paths.",
      "Compute the final answer as the maximum finite shortest distance, not the distance to one target.",
    ],
    intuitionMD: "The signal reaches each node as soon as the fastest route from **k** to that node finishes. So the problem is not asking for one path; it asks for **all shortest distances from one source**. Once those distances are known, the network delay is simply the slowest arrival time among them.\n\nFor non-negative edge weights, Dijkstra is the fastest standard fit. It repeatedly settles the currently closest unsettled node. That is safe because any alternative route to that node would have to add a non-negative edge after an already equal-or-larger distance.\n\nBellman-Ford thinks differently: instead of always expanding the closest node, it repeatedly relaxes every edge. After one full pass it knows best paths using at most one edge; after two passes, at most two edges; after **n - 1** passes, every simple shortest path is covered. It is slower, but the relaxation idea is foundational and handles the more general single-source shortest-path template.\n\nThe last step is easy to miss: return the **maximum** shortest distance. If any distance stayed infinite, the signal never reaches every node.",
    commonMistakes: [
      "Treating the graph as undirected even though every edge is directed.",
      "Returning the distance to the last processed node instead of max over all nodes.",
      "Forgetting nodes are labelled 1..n and accidentally sizing arrays for 0..n - 1 only.",
      "Marking a node permanently visited before its minimum heap entry is popped; stale heap entries should be skipped by comparing with dist.",
      "Using plain BFS on weighted edges. BFS only works when every edge has equal cost.",
    ],
    algorithmMD: "**Dijkstra:** build an adjacency list, initialise dist[k] = 0, and use a min-heap ordered by current known distance. Pop the closest state; if it is stale, skip it. Otherwise relax each outgoing edge and push improved distances. After the heap drains, return the max dist or -1 if any node is still unreachable.\n\n**Bellman-Ford:** initialise distances the same way, then relax every directed edge up to n - 1 times. A pass that makes no changes can stop early. Finally compute the same max-or-unreachable answer.\n\nDijkstra is preferred here because weights are non-negative and the graph may have many edges. Bellman-Ford is valuable when you want the simplest relaxation skeleton or when a variant may introduce negative edges.",
    solutions: [
      {
        name: "Dijkstra with a min-heap",
        whenToUseMD: "Use this as the interview default for directed graphs with non-negative weights. It is faster than Bellman-Ford on sparse and medium-dense graphs and naturally returns all shortest distances from the source.",
        approachMD: "Store outgoing edges in an adjacency list. The priority queue always gives the currently smallest known arrival time. Relaxing an edge means asking whether reaching the neighbour through the current node improves its best known arrival time.",
        walkthroughMD: "1. Build graph[u] as pairs of neighbour and travel time.\n2. Fill dist with infinity and set dist[k] = 0.\n3. Push source into a priority queue ordered by time.\n4. Pop the smallest time. If it is larger than dist[node], it is stale and can be ignored.\n5. Relax all outgoing edges.\n6. Scan dist[1..n]; if any node is infinity return -1, otherwise return the maximum distance.",
        complexity: {
          time: "O((n + E) log n)",
          space: "O(n + E)",
          note: "E is times.length. The adjacency list stores E directed edges and the heap stores candidate distances.",
        },
        filename: "Solution.java",
        code: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.PriorityQueue;

class Solution {

    public int networkDelayTime(int[][] times, int n, int k) {
        List<List<int[]>> graph = new ArrayList<>();
        for (int i = 0; i <= n; i++) {
            graph.add(new ArrayList<>());
        }
        for (int[] time : times) {
            graph.get(time[0]).add(new int[]{time[1], time[2]});
        }

        int[] dist = new int[n + 1];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[k] = 0;

        PriorityQueue<int[]> heap = new PriorityQueue<>(
                (a, b) -> Integer.compare(a[1], b[1]));
        heap.offer(new int[]{k, 0});

        while (!heap.isEmpty()) {
            int[] state = heap.poll();
            int node = state[0];
            int time = state[1];
            if (time > dist[node]) {
                continue;
            }

            for (int[] edge : graph.get(node)) {
                int next = edge[0];
                int nextTime = time + edge[1];
                if (nextTime < dist[next]) {
                    dist[next] = nextTime;
                    heap.offer(new int[]{next, nextTime});
                }
            }
        }

        int answer = 0;
        for (int node = 1; node <= n; node++) {
            if (dist[node] == Integer.MAX_VALUE) {
                return -1;
            }
            answer = Math.max(answer, dist[node]);
        }
        return answer;
    }
}`,
      },
      {
        name: "Bellman-Ford edge relaxation",
        whenToUseMD: "Use this when you want a compact relaxation template, when the graph representation is already an edge list, or in variants where negative weights might appear. It is slower but very robust conceptually.",
        approachMD: "A shortest simple path in a graph with n nodes uses at most n - 1 edges. Repeatedly relaxing every edge propagates best distances one edge farther per round until no improvement remains.",
        walkthroughMD: "1. Set all distances to infinity except dist[k] = 0.\n2. For up to n - 1 rounds, scan every edge [u, v, w].\n3. If u is reachable and dist[u] + w improves dist[v], update dist[v].\n4. Stop early if a full round changes nothing.\n5. Return max distance, or -1 if any node is unreachable.",
        complexity: {
          time: "O(n · E)",
          space: "O(n)",
          note: "At most n - 1 full edge-relaxation passes are needed.",
        },
        filename: "Solution.java",
        code: `import java.util.Arrays;

class Solution {

    public int networkDelayTime(int[][] times, int n, int k) {
        int infinity = 1_000_000_000;
        int[] dist = new int[n + 1];
        Arrays.fill(dist, infinity);
        dist[k] = 0;

        for (int round = 1; round <= n - 1; round++) {
            boolean changed = false;
            for (int[] edge : times) {
                int from = edge[0];
                int to = edge[1];
                int weight = edge[2];
                if (dist[from] != infinity && dist[from] + weight < dist[to]) {
                    dist[to] = dist[from] + weight;
                    changed = true;
                }
            }
            if (!changed) {
                break;
            }
        }

        int answer = 0;
        for (int node = 1; node <= n; node++) {
            if (dist[node] == infinity) {
                return -1;
            }
            answer = Math.max(answer, dist[node]);
        }
        return answer;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "Dijkstra trace for **times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2**.",
      columns: ["Step", "Heap pop", "Relaxed edges", "dist after step", "Heap after step"],
      rows: [
        ["1", "(2,0)", "2 → 1 gives 1; 2 → 3 gives 1", "{1:1, 2:0, 3:1, 4:∞}", "[(1,1), (3,1)]"],
        ["2", "(1,1)", "node 1 has no outgoing edges", "{1:1, 2:0, 3:1, 4:∞}", "[(3,1)]"],
        ["3", "(3,1)", "3 → 4 gives 2", "{1:1, 2:0, 3:1, 4:2}", "[(4,2)]"],
        ["4", "(4,2)", "node 4 has no outgoing edges", "{1:1, 2:0, 3:1, 4:2}", "[]"],
        ["5", "scan distances", "all nodes reachable", "max = 2", "return 2"],
      ],
      narrativeMD: "The shortest arrival times are 0 for source 2, 1 for nodes 1 and 3, and 2 for node 4. The network is complete only when the slowest reachable node receives the signal, so the answer is **2**.",
    },
    interviewTipsMD: "Lead with **single-source shortest paths**, then choose Dijkstra because weights are non-negative. Be explicit that the final answer is not a particular target distance; it is the maximum of all shortest distances. If asked for alternatives, give Bellman-Ford and explain the n - 1 relaxation rounds. If the interviewer mentions negative edges, Dijkstra is no longer safe; that is the cue for Bellman-Ford.",
    followUps: [
      "Return the actual path tree that delivers the signal fastest to every node.",
      "What changes if edge weights can be negative? Use Bellman-Ford and detect negative cycles if relevant.",
      "What if the graph is undirected? Add both directions to the adjacency list.",
      "What if many sources send the signal at time 0? Seed Dijkstra with all sources at distance 0.",
    ],
    similarProblems: [
      {
        title: "Cheapest Flights Within K Stops",
        difficulty: "Medium",
        slug: "graph-cheapest-flights-within-k-stops",
        note: "Weighted shortest path with an extra stop constraint.",
      },
      {
        title: "Path With Minimum Effort",
        difficulty: "Medium",
        slug: "graph-path-with-minimum-effort",
        note: "Dijkstra where the path score is a maximum edge, not a sum.",
      },
      {
        title: "Find if Path Exists in Graph",
        difficulty: "Easy",
        slug: "graph-find-if-path-exists",
        note: "Unweighted reachability before edge weights are introduced.",
      },
      {
        title: "Swim in Rising Water",
        difficulty: "Hard",
        url: "https://leetcode.com/problems/swim-in-rising-water/",
        note: "A grid version of minimising the maximum value along a path.",
      },
    ],
    keyTakeaways: [
      "Network delay is max shortest distance from the source.",
      "Dijkstra is correct for non-negative weighted edges because the smallest unsettled distance cannot later improve.",
      "Bellman-Ford relaxes all edges repeatedly and is the general edge-list single-source template.",
      "Directed edges must not be mirrored unless the problem says the graph is undirected.",
    ],
    pattern: "Single-source weighted shortest path: compute dist from the source, then aggregate the distances according to the question, often max or one target.",
  },
  {
    slug: "graph-cheapest-flights-within-k-stops",
    moduleId: "shortest-path",
    order: 20,
    title: "Cheapest Flights Within K Stops",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/cheapest-flights-within-k-stops/",
    tags: ["Graph", "Shortest Path", "Bellman-Ford", "Dijkstra", "Heap"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Uber", "Apple"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 32,
    statementMD: "There are **n** cities labelled **0..n - 1** and a list of directed flights **flights[i] = [from, to, price]**.\n\nGiven **src**, **dst**, and **k**, return the cheapest price from **src** to **dst** using at most **k stops**. A route with k stops uses at most **k + 1 edges**. Return **-1** if no such route exists.",
    constraints: [
      "1 <= n <= 100",
      "0 <= flights.length <= n * (n - 1)",
      "flights[i].length == 3",
      "0 <= from, to < n",
      "from != to",
      "1 <= price <= 10000",
      "0 <= src, dst < n",
      "src != dst",
      "0 <= k < n",
    ],
    inputMD: "The number of cities **n**, directed weighted edges **flights**, source **src**, destination **dst**, and maximum allowed stops **k**.",
    outputMD: "An integer: the minimum feasible route cost from **src** to **dst**, or **-1** if every route exceeds the stop limit or is disconnected.",
    examples: [
      {
        input: "n = 4, flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src = 0, dst = 3, k = 1",
        output: "700",
        explanation: "The route 0 → 1 → 3 costs 700 and uses one stop. The cheaper-looking route through 2 would use two stops, which is not allowed.",
      },
      {
        input: "n = 3, flights = [[0,1,100],[1,2,100],[0,2,500]], src = 0, dst = 2, k = 1",
        output: "200",
        explanation: "With one stop allowed, 0 → 1 → 2 costs 200 and beats the direct flight costing 500.",
      },
      {
        input: "n = 3, flights = [[0,1,100],[1,2,100],[0,2,500]], src = 0, dst = 2, k = 0",
        output: "500",
        explanation: "No intermediate stops are allowed, so only the direct edge 0 → 2 is feasible.",
      },
    ],
    learningObjectives: [
      "Convert the stop limit into an edge limit: at most k stops means at most k + 1 flights.",
      "Use limited Bellman-Ford rounds to model paths with bounded edge counts.",
      "Understand why a clone of the distance array is required in each relaxation round.",
      "Model shortest path with state when cost alone is not enough; here the state is city plus edges used.",
    ],
    intuitionMD: "This looks like a normal cheapest-path problem, but the stop constraint changes the state space. A route that is cheapest to reach an intermediate city may already have used too many flights, while a slightly more expensive prefix with fewer edges may still be the one that reaches the destination legally.\n\nThat is why naive Dijkstra keyed only by city is wrong. If you keep one best cost per city, you can discard a route that is more expensive so far but uses fewer stops, and that discarded route may be the only feasible way to finish.\n\nThe cleanest fix is limited Bellman-Ford. After one relaxation round, distances represent best costs using at most one edge. After two rounds, at most two edges. Therefore after **k + 1** rounds, distances exactly match the stop constraint. The clone matters: within a single round, every update must be based on distances from the previous round, otherwise one round could chain multiple flights and silently violate the edge budget.\n\nA second optimal framing is Dijkstra over expanded state: **city + edges used**. In that graph, the same city reached with different edge counts is treated as different state, so the algorithm never confuses cheap-but-too-long with feasible.",
    commonMistakes: [
      "Running ordinary Dijkstra with one dist per city, which ignores the stop dimension and can prune the correct answer.",
      "Doing k relaxation rounds instead of k + 1. Stops are intermediate cities; edges are flights.",
      "Updating the Bellman-Ford distance array in place during a round, allowing paths with multiple new edges to appear in the same round.",
      "Treating flights as undirected; every flight is directed from source to destination.",
      "Returning a route that reaches dst cheaply but uses more than k stops.",
    ],
    algorithmMD: "**Limited Bellman-Ford:** keep dist as best costs using at most the number of edges processed so far. For each of k + 1 rounds, clone dist into next, relax every flight from the old dist into next, then replace dist with next. The clone enforces that one round adds at most one flight.\n\n**Priority queue over state:** build an adjacency list and push states ordered by total cost. A state contains city and edges used. You may expand it only if edges used is less than k + 1. Track best[city][edgesUsed] so revisiting a city with a different edge count remains possible.\n\nUse limited Bellman-Ford when you want the shortest, hardest-to-get-wrong solution. Use the stateful heap when you want early exit on many inputs or when you need to extend the state with more constraints.",
    solutions: [
      {
        name: "Limited Bellman-Ford with cloned rounds",
        whenToUseMD: "Use this as the cleanest interview solution. It directly maps k stops to k + 1 edge-relaxation rounds and avoids the subtle pruning bugs of naive Dijkstra.",
        approachMD: "Each round allows paths to use one more flight. By relaxing from the previous round's dist into a cloned next array, every update in that round uses at most one additional edge, preserving the stop limit exactly.",
        walkthroughMD: "1. Set all costs to infinity except dist[src] = 0.\n2. Repeat k + 1 times, once for each allowed edge count.\n3. Clone dist into next before scanning flights.\n4. For each flight from u to v, if u was reachable before this round, improve next[v].\n5. Assign dist = next and continue.\n6. Return dist[dst], or -1 if it is still infinity.",
        complexity: {
          time: "O((k + 1) · E)",
          space: "O(n)",
          note: "E is flights.length. Each round scans the edge list once and keeps two distance arrays.",
        },
        filename: "Solution.java",
        code: `import java.util.Arrays;

class Solution {

    public int findCheapestPrice(int n, int[][] flights, int src, int dst, int k) {
        int infinity = 1_000_000_000;
        int[] dist = new int[n];
        Arrays.fill(dist, infinity);
        dist[src] = 0;

        int maxEdges = k + 1;
        for (int edges = 1; edges <= maxEdges; edges++) {
            int[] next = dist.clone();
            for (int[] flight : flights) {
                int from = flight[0];
                int to = flight[1];
                int price = flight[2];
                if (dist[from] != infinity && dist[from] + price < next[to]) {
                    next[to] = dist[from] + price;
                }
            }
            dist = next;
        }

        return dist[dst] == infinity ? -1 : dist[dst];
    }
}`,
      },
      {
        name: "Priority queue over city and edge count",
        whenToUseMD: "Use this when you want a Dijkstra-style early exit, or when the problem adds more state such as coupons, fuel, or remaining transfers. The important difference from naive Dijkstra is that the state includes edges used.",
        approachMD: "Run a best-first search by cost, but keep separate best costs for each city and number of edges used. A city reached with two different edge counts can lead to different feasible futures, so both states may be worth keeping.",
        walkthroughMD: "1. Build a directed adjacency list of flights.\n2. best[city][edges] stores the cheapest cost to reach city using exactly edges flights.\n3. Push (0 cost, src, 0 edges) into the heap.\n4. Pop the cheapest state. If it is dst, return its cost because the heap is ordered by cost among feasible states.\n5. If the state already used k + 1 edges, do not expand it.\n6. Otherwise relax outgoing flights into states with edges + 1.",
        complexity: {
          time: "O((k + 1) · E · log(n · (k + 2)))",
          space: "O(n · (k + 2) + E)",
          note: "The expanded graph has one layer per allowed edge count.",
        },
        filename: "Solution.java",
        code: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.PriorityQueue;

class Solution {

    public int findCheapestPrice(int n, int[][] flights, int src, int dst, int k) {
        List<List<int[]>> graph = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            graph.add(new ArrayList<>());
        }
        for (int[] flight : flights) {
            graph.get(flight[0]).add(new int[]{flight[1], flight[2]});
        }

        int maxEdges = k + 1;
        int infinity = 1_000_000_000;
        int[][] best = new int[n][maxEdges + 1];
        for (int city = 0; city < n; city++) {
            Arrays.fill(best[city], infinity);
        }
        best[src][0] = 0;

        PriorityQueue<int[]> heap = new PriorityQueue<>(
                (a, b) -> Integer.compare(a[0], b[0]));
        heap.offer(new int[]{0, src, 0});

        while (!heap.isEmpty()) {
            int[] state = heap.poll();
            int cost = state[0];
            int city = state[1];
            int edgesUsed = state[2];

            if (cost > best[city][edgesUsed]) {
                continue;
            }
            if (city == dst) {
                return cost;
            }
            if (edgesUsed == maxEdges) {
                continue;
            }

            for (int[] flight : graph.get(city)) {
                int nextCity = flight[0];
                int nextCost = cost + flight[1];
                int nextEdges = edgesUsed + 1;
                if (nextCost < best[nextCity][nextEdges]) {
                    best[nextCity][nextEdges] = nextCost;
                    heap.offer(new int[]{nextCost, nextCity, nextEdges});
                }
            }
        }

        return -1;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "Limited Bellman-Ford trace for **n = 3, flights = [[0,1,100],[1,2,100],[0,2,500]], src = 0, dst = 2, k = 1**. Because k = 1, at most 2 edges are allowed.",
      columns: ["Round", "Allowed edges", "dist before", "Updates from previous round", "dist after"],
      rows: [
        ["0", "0", "[0, ∞, ∞]", "source only", "[0, ∞, ∞]"],
        ["1", "1", "[0, ∞, ∞]", "0 → 1 gives 100; 0 → 2 gives 500", "[0, 100, 500]"],
        ["2", "2", "[0, 100, 500]", "1 → 2 gives 200 using previous 100", "[0, 100, 200]"],
        ["answer", "up to 2", "[0, 100, 200]", "dst cost is finite", "return 200"],
      ],
      narrativeMD: "The clone prevents the first round from using 0 → 1 and then immediately 1 → 2. That two-flight route becomes legal only in round 2, exactly matching the edge budget.",
    },
    interviewTipsMD: "This problem is a trap for candidates who recite Dijkstra without checking the state. Explain why one best cost per city is insufficient, then present the limited Bellman-Ford solution because it is short and rigorous. Emphasise **clone per round** and **k + 1 edges**. If you choose the heap solution, repeatedly say that city alone is not the node in the search graph; city plus edges used is.",
    followUps: [
      "Return the route itself. Store predecessor information per city and edge count.",
      "What if there are discount coupons that can be used on up to d flights? Add coupons used to the state dimension.",
      "What if k is very large? The problem approaches ordinary single-source shortest path with non-negative weights.",
      "Can prices be negative? Use Bellman-Ford style relaxation and discuss cycle constraints.",
    ],
    similarProblems: [
      {
        title: "Network Delay Time",
        difficulty: "Medium",
        slug: "graph-network-delay-time",
        note: "Standard single-source shortest path without the stop dimension.",
      },
      {
        title: "Path With Minimum Effort",
        difficulty: "Medium",
        slug: "graph-path-with-minimum-effort",
        note: "Another case where the meaning of path cost changes the algorithm.",
      },
      {
        title: "Course Schedule",
        difficulty: "Medium",
        slug: "graph-course-schedule",
        note: "Different directed-graph constraint reasoning: acyclicity instead of cheapest route.",
      },
      {
        title: "Minimum Cost to Reach City With Discounts",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/minimum-cost-to-reach-city-with-discounts/",
        note: "Dijkstra over expanded state with remaining discounts.",
      },
    ],
    keyTakeaways: [
      "At most k stops means at most k + 1 edges.",
      "Limited Bellman-Ford is often the cleanest way to enforce an edge budget.",
      "Clone the distance array each round so one round cannot chain multiple new flights.",
      "Naive Dijkstra by city alone is wrong when feasibility depends on stops used.",
    ],
    pattern: "Constrained shortest path: add the constraint to the state, or use bounded relaxation rounds when the constraint is path length in edges.",
  },
  {
    slug: "graph-path-with-minimum-effort",
    moduleId: "shortest-path",
    order: 21,
    title: "Path With Minimum Effort",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/path-with-minimum-effort/",
    tags: ["Graph", "Shortest Path", "Dijkstra", "Binary Search", "BFS", "Heap", "Matrix"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple", "Uber"],
    estimatedReadingMin: 11,
    estimatedSolvingMin: 35,
    statementMD: "You are given a rectangular grid **heights**. You start at the top-left cell and want to reach the bottom-right cell. You may move **4-directionally**.\n\nThe effort of a path is the **maximum absolute height difference** between two consecutive cells on that path. Return the minimum possible effort over all valid paths.",
    constraints: [
      "rows == heights.length",
      "cols == heights[i].length",
      "1 <= rows, cols <= 100",
      "1 <= heights[i][j] <= 1000000",
      "Movement is 4-directional only.",
    ],
    inputMD: "A 2D integer grid **heights** where each value is the height of that cell.",
    outputMD: "An integer: the smallest possible maximum edge difference along any path from top-left to bottom-right.",
    examples: [
      {
        input: "heights = [[1,2,2],[3,8,2],[5,3,5]]",
        output: "2",
        explanation: "A path can avoid the steep jump to 8. The best route has edge differences at most 2, and no route can keep every step below 2.",
      },
      {
        input: "heights = [[1,2,3],[3,8,4],[5,3,5]]",
        output: "1",
        explanation: "There is a path whose every consecutive height difference is at most 1.",
      },
      {
        input: "heights = [[1,2,1,1,1],[1,2,1,2,1],[1,2,1,2,1],[1,1,1,2,1]]",
        output: "0",
        explanation: "A route exists through only cells of height 1, so the maximum step difference is 0.",
      },
    ],
    learningObjectives: [
      "Distinguish additive path cost from bottleneck path cost.",
      "Adapt Dijkstra by changing the relaxation formula from sum to max.",
      "Use binary search on the answer when feasibility is monotonic.",
      "Recognise that both shortest-path and threshold-reachability views can solve the same problem optimally.",
    ],
    intuitionMD: "The path score is not the sum of all climbs. A long gentle route can be better than a short route with one huge jump because the only thing that matters is the **worst single edge** on the path.\n\nDijkstra still works if you redefine what distance means. Instead of dist[cell] being the minimum total cost to reach the cell, let it be the minimum possible **maximum edge difference** seen so far. When moving to a neighbour, the candidate effort is max(current effort, edge difference). If that candidate improves the neighbour, relax it. The same greedy proof applies: when the smallest effort state is popped, no later path can reach it with a smaller maximum edge because all future candidates are at least as large as the popped key.\n\nThere is also a powerful alternative. Ask: if I allow only steps with difference at most x, can I reach the target? If yes for x, then yes for any larger limit. If no for x, then no for any smaller limit. That monotonic yes/no property lets us binary search the answer and run BFS or DFS as the feasibility check.\n\nDijkstra usually has the better interview flow because it returns the exact answer in one pass. Binary search plus BFS is excellent when you spot a monotonic threshold and want a reusable decision-problem pattern.",
    commonMistakes: [
      "Summing height differences instead of minimising the maximum difference.",
      "Using plain BFS without considering effort values; edges have different effective costs.",
      "Marking a cell visited once globally before its best effort is known. Dijkstra should skip stale states using the effort matrix.",
      "Allowing diagonal moves. The problem is 4-directional only.",
      "In binary search, forgetting to reset the visited matrix for each feasibility check.",
    ],
    algorithmMD: "**Dijkstra-style bottleneck path:** effort[r][c] is the best known maximum edge difference needed to reach that cell. Start with effort[0][0] = 0. Pop the cell with smallest effort from a min-heap. For each 4-directional neighbour, compute candidate = max(current effort, absolute height difference). If candidate improves the neighbour, update and push it. The first time the target is popped, return its effort.\n\n**Binary search + BFS feasibility:** effort limits are monotonic. For a proposed limit mid, run BFS using only edges whose height difference is at most mid. If the target is reachable, try a smaller limit; otherwise try a larger one. The final low value is the minimum feasible effort.\n\nDijkstra is a direct one-pass shortest-path adaptation. Binary search separates optimisation from reachability and is useful when the answer range is small or the feasibility test is easier than deriving a custom relaxation.",
    solutions: [
      {
        name: "Dijkstra with max-edge relaxation",
        whenToUseMD: "Use this as the primary solution. It is a true shortest-path algorithm over a bottleneck cost and avoids the extra logarithmic factor over the height range.",
        approachMD: "Store the best effort known for every cell. The relaxation from a cell to a neighbour takes the maximum of the current path effort and the new edge difference. The heap always expands the currently easiest cell to reach.",
        walkthroughMD: "1. Initialise all efforts to infinity and effort[0][0] = 0.\n2. Push the start into a min-heap ordered by effort.\n3. Pop the smallest effort state and skip it if stale.\n4. If it is the target, return the effort immediately.\n5. For each 4-directional neighbour, compute max(current effort, abs height difference).\n6. If that candidate improves the neighbour, store it and push a new heap state.",
        complexity: {
          time: "O(rows · cols · log(rows · cols))",
          space: "O(rows · cols)",
          note: "Each cell can be improved and pushed into the heap; stale entries are skipped.",
        },
        filename: "Solution.java",
        code: `import java.util.Arrays;
import java.util.PriorityQueue;

class Solution {

    private static final int[][] DIRECTIONS = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

    public int minimumEffortPath(int[][] heights) {
        int rows = heights.length;
        int cols = heights[0].length;

        int[][] effort = new int[rows][cols];
        for (int row = 0; row < rows; row++) {
            Arrays.fill(effort[row], Integer.MAX_VALUE);
        }
        effort[0][0] = 0;

        PriorityQueue<int[]> heap = new PriorityQueue<>(
                (a, b) -> Integer.compare(a[0], b[0]));
        heap.offer(new int[]{0, 0, 0});

        while (!heap.isEmpty()) {
            int[] state = heap.poll();
            int currentEffort = state[0];
            int row = state[1];
            int col = state[2];

            if (currentEffort > effort[row][col]) {
                continue;
            }
            if (row == rows - 1 && col == cols - 1) {
                return currentEffort;
            }

            for (int[] dir : DIRECTIONS) {
                int nextRow = row + dir[0];
                int nextCol = col + dir[1];
                if (nextRow < 0 || nextCol < 0 || nextRow >= rows || nextCol >= cols) {
                    continue;
                }

                int edge = Math.abs(heights[row][col] - heights[nextRow][nextCol]);
                int nextEffort = Math.max(currentEffort, edge);
                if (nextEffort < effort[nextRow][nextCol]) {
                    effort[nextRow][nextCol] = nextEffort;
                    heap.offer(new int[]{nextEffort, nextRow, nextCol});
                }
            }
        }

        return 0;
    }
}`,
      },
      {
        name: "Binary search on effort with BFS",
        whenToUseMD: "Use this when you notice the monotonic threshold property quickly or when explaining optimisation via feasibility checks. It is slightly less direct but very reusable.",
        approachMD: "For a candidate effort limit, ignore every edge whose height difference is larger than the limit. A BFS then answers whether top-left can reach bottom-right. Because reachability only becomes easier as the limit grows, binary search finds the smallest feasible limit.",
        walkthroughMD: "1. Binary search low = 0 and high = 1000000, the maximum possible height gap.\n2. For mid, run canReach(mid).\n3. canReach performs BFS from the start and only crosses edges with difference <= mid.\n4. If target is reachable, mid is feasible, so move high down.\n5. Otherwise mid is too small, so move low up.\n6. When low == high, it is the minimum effort.",
        complexity: {
          time: "O(rows · cols · log C)",
          space: "O(rows · cols)",
          note: "C is the height range, at most 1000000. Each feasibility check is one BFS.",
        },
        filename: "Solution.java",
        code: `import java.util.ArrayDeque;
import java.util.Queue;

class Solution {

    private static final int[][] DIRECTIONS = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

    public int minimumEffortPath(int[][] heights) {
        int low = 0;
        int high = 1_000_000;

        while (low < high) {
            int mid = low + (high - low) / 2;
            if (canReach(heights, mid)) {
                high = mid;
            } else {
                low = mid + 1;
            }
        }

        return low;
    }

    private boolean canReach(int[][] heights, int limit) {
        int rows = heights.length;
        int cols = heights[0].length;
        boolean[][] seen = new boolean[rows][cols];
        Queue<int[]> queue = new ArrayDeque<>();
        queue.offer(new int[]{0, 0});
        seen[0][0] = true;

        while (!queue.isEmpty()) {
            int[] cell = queue.poll();
            int row = cell[0];
            int col = cell[1];
            if (row == rows - 1 && col == cols - 1) {
                return true;
            }

            for (int[] dir : DIRECTIONS) {
                int nextRow = row + dir[0];
                int nextCol = col + dir[1];
                if (nextRow < 0 || nextCol < 0 || nextRow >= rows || nextCol >= cols
                        || seen[nextRow][nextCol]) {
                    continue;
                }

                int edge = Math.abs(heights[row][col] - heights[nextRow][nextCol]);
                if (edge <= limit) {
                    seen[nextRow][nextCol] = true;
                    queue.offer(new int[]{nextRow, nextCol});
                }
            }
        }

        return false;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "Dijkstra trace for **heights = [[1,2,2],[3,8,2],[5,3,5]]**.",
      columns: ["Step", "Heap pop", "Neighbour relaxations", "Best efforts changed", "Reason"],
      rows: [
        ["1", "(0 effort, 0,0)", "(0,1) edge 1; (1,0) edge 2", "(0,1)=1, (1,0)=2", "Start has no effort yet"],
        ["2", "(1 effort, 0,1)", "(0,2) max 1; (1,1) max 6", "(0,2)=1, (1,1)=6", "The jump to 8 is expensive"],
        ["3", "(1 effort, 0,2)", "(1,2) edge 0 keeps effort 1", "(1,2)=1", "Flat move stays cheap"],
        ["4", "(1 effort, 1,2)", "(2,2) edge 3 gives effort 3", "(2,2)=3", "Target found but not final until popped"],
        ["5", "(2 effort, 1,0)", "(2,0) max 2", "(2,0)=2", "A different route keeps bottleneck 2"],
        ["6", "(2 effort, 2,0)", "(2,1) max 2", "(2,1)=2", "Route around the 8 improves path"],
        ["7", "(2 effort, 2,1)", "(2,2) max 2 improves 3", "(2,2)=2", "Target effort lowered"],
        ["8", "(2 effort, 2,2)", "target popped", "answer 2", "Smallest possible effort is settled"],
      ],
      narrativeMD: "The first route to the target has effort 3, but Dijkstra does not stop when a target is merely discovered. It stops when the target is popped with the smallest unsettled effort, which happens at **2**.",
    },
    interviewTipsMD: "Start by saying this is a **bottleneck shortest path**, not an additive shortest path. That phrase tells the interviewer you understand the twist. Then present Dijkstra with max(current, edge) relaxation. If time permits, add the binary-search view: a threshold x is feasible if BFS can reach the target using only edges of size at most x. Contrasting these two approaches is a strong Senior-level signal because it shows both algorithm adaptation and monotonic reasoning.",
    followUps: [
      "Return one minimum-effort path. Store parent coordinates whenever effort improves.",
      "Solve with Union-Find by sorting edges by difference and connecting cells until start and target share a component.",
      "What if movement included diagonals? Extend the direction array and keep the same algorithms.",
      "What if the path score were the sum of differences instead? Use ordinary Dijkstra with additive relaxation.",
    ],
    similarProblems: [
      {
        title: "Network Delay Time",
        difficulty: "Medium",
        slug: "graph-network-delay-time",
        note: "Standard Dijkstra with additive edge weights.",
      },
      {
        title: "Cheapest Flights Within K Stops",
        difficulty: "Medium",
        slug: "graph-cheapest-flights-within-k-stops",
        note: "Another weighted shortest-path problem where state and path cost need care.",
      },
      {
        title: "Shortest Path in Binary Matrix",
        difficulty: "Medium",
        slug: "graph-shortest-path-in-binary-matrix",
        note: "Unweighted grid shortest path; compare BFS with weighted-grid Dijkstra.",
      },
      {
        title: "Swim in Rising Water",
        difficulty: "Hard",
        url: "https://leetcode.com/problems/swim-in-rising-water/",
        note: "Very similar bottleneck path structure with time as the threshold.",
      },
    ],
    keyTakeaways: [
      "Not every path cost is a sum; this problem minimises the maximum edge on the path.",
      "Dijkstra can be adapted when the relaxation preserves a monotonic best-known key.",
      "Binary search works because reachability under an effort limit is monotonic.",
      "Do not stop when the target is first discovered in Dijkstra; stop when it is popped as the best unsettled state.",
    ],
    pattern: "Bottleneck path: relax neighbours with max(current path cost, edge cost), or binary search the allowed edge threshold and test reachability.",
  },
];
