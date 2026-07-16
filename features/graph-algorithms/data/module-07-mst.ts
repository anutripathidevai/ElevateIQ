import type { GraphProblem } from "../types";

export const PROBLEMS: GraphProblem[] = [
  {
    slug: "graph-min-cost-to-connect-all-points",
    moduleId: "mst",
    order: 22,
    title: "Min Cost to Connect All Points",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/min-cost-to-connect-all-points/",
    tags: ["Graph", "Minimum Spanning Tree", "Union Find", "Heap", "Geometry"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 30,
    statementMD: "You are given **n** points on a 2D plane, where points[i] = [xi, yi]. The cost of connecting two points is the **Manhattan distance** between them: abs(xi - xj) + abs(yi - yj).\n\nReturn the minimum total cost needed to connect **all** points so that every point is reachable from every other point. You may choose any set of edges, but the final network must be connected.",
    constraints: [
      "1 <= points.length <= 1000",
      "-10^6 <= xi, yi <= 10^6",
      "All pairs (xi, yi) are distinct",
    ],
    inputMD: "A 2D integer array **points**, where each entry is a coordinate pair [x, y].",
    outputMD: "An integer: the minimum possible total Manhattan distance to connect all points.",
    examples: [
      {
        input: "points = [[0,0],[2,2],[3,10],[5,2],[7,0]]",
        output: "20",
        explanation: "One optimal network connects edges with costs 4, 3, 4, and 9, for a total of 20. The exact shape may vary, but any valid answer must be a minimum spanning tree.",
      },
      {
        input: "points = [[3,12],[-2,5],[-4,1]]",
        output: "18",
        explanation: "Connect [-2,5] to [-4,1] with cost 6 and [3,12] to [-2,5] with cost 12.",
      },
    ],
    learningObjectives: [
      "Recognise that connecting all points with minimum total edge cost is a **minimum spanning tree** problem.",
      "Understand why this graph is complete and dense even though the input only lists points.",
      "Compare Prim's dense-graph view with Kruskal's edge-sorting plus Union-Find view.",
    ],
    intuitionMD: "The input does not hand you edges, but every pair of points can be connected. That means the hidden graph is **complete**: n vertices and roughly n squared possible edges, each weighted by Manhattan distance. We need the cheapest connected network over all vertices, which is exactly a **minimum spanning tree**.\n\nTwo MST mindsets solve it cleanly. **Prim's algorithm** grows one connected tree. At any moment, every outside point has a cheapest known edge into the tree; repeatedly add the outside point with the smallest such cost and relax distances from it. Because the graph is dense, the simple O(n squared) array version is often better than building a huge heap of all possible edges.\n\n**Kruskal's algorithm** looks globally instead: generate every possible edge, sort by cost, and use Union-Find to accept only edges that connect two different components. It is very reusable, but here sorting O(n squared) edges is heavier than dense Prim.",
    commonMistakes: [
      "Trying shortest-path algorithms like Dijkstra. We are not finding a path between two points; we are choosing a cheapest connected network.",
      "Building only nearby-looking edges. Manhattan distance does not let you safely ignore arbitrary pairs without a specialised geometric proof.",
      "Stopping Prim after n - 1 loop iterations instead of adding all n vertices. The first vertex contributes cost 0, so the loop naturally runs n times.",
      "In Kruskal, adding an edge before checking whether its endpoints are already in the same component, which creates cycles and overpays.",
    ],
    algorithmMD: "**Prim:** Treat the points as vertices of a complete weighted graph. Start from any point with connection cost 0. Maintain minDist[i], the cheapest edge currently known from point i into the growing tree. Repeatedly choose the unvisited point with the smallest minDist, add that cost to the answer, then update every remaining point using the Manhattan distance from the newly added point.\n\n**Kruskal:** Generate all n(n - 1) / 2 edges with their Manhattan weights. Sort them ascending by weight. Scan the sorted list, unioning endpoints when they belong to different components. Every successful union adds one MST edge; stop after n - 1 accepted edges.",
    solutions: [
      {
        name: "Prim's algorithm (dense array scan)",
        whenToUseMD: "Prefer this for this exact LeetCode problem. The graph is complete, so an O(n squared) scan avoids materialising and sorting O(n squared) edges.",
        approachMD: "Grow one tree from an arbitrary start. For every point outside the tree, keep only its cheapest edge into the tree, then repeatedly absorb the cheapest outside point.",
        walkthroughMD: "1. Initialise minDist[0] = 0 and every other minDist to infinity.\n2. Repeat n times: choose the unvisited index with the smallest minDist, mark it inside the tree, and add minDist[index] to the total.\n3. For every still-unvisited point, compute its Manhattan distance to the newly added point and lower minDist if this new edge is cheaper.\n4. When all points are inside the tree, the accumulated total is the MST cost.",
        complexity: {
          time: "O(n^2)",
          space: "O(n)",
          note: "The complete graph is explored lazily; every chosen point relaxes distances to all other points.",
        },
        filename: "Solution.java",
        code: `import java.util.Arrays;
class Solution {
    public int minCostConnectPoints(int[][] points) {
        int n = points.length;
        boolean[] inTree = new boolean[n];
        int[] minDist = new int[n];
        Arrays.fill(minDist, Integer.MAX_VALUE);
        minDist[0] = 0;
        int totalCost = 0;
        for (int added = 0; added < n; added++) {
            int next = -1;
            for (int i = 0; i < n; i++) {
                if (!inTree[i] && (next == -1 || minDist[i] < minDist[next])) {
                    next = i;
                }
            }
            inTree[next] = true;
            totalCost += minDist[next];
            for (int i = 0; i < n; i++) {
                if (!inTree[i]) {
                    int cost = manhattan(points[next], points[i]);
                    if (cost < minDist[i]) {
                        minDist[i] = cost;
                    }
                }
            }
        }
        return totalCost;
    }
    private int manhattan(int[] a, int[] b) {
        return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    }
}`,
      },
      {
        name: "Kruskal's algorithm with Union-Find",
        whenToUseMD: "Use this when the edge list is already explicit, when you want the most general MST template, or when sorting edges is acceptable.",
        approachMD: "Generate every possible pair as a weighted edge, sort by cost, and let Union-Find prevent cycles while accepting the cheapest edges that merge components.",
        walkthroughMD: "1. Build a list of edges [cost, u, v] for every pair of points.\n2. Sort the edge list by cost ascending.\n3. Scan edges from cheapest to most expensive. If union(u, v) succeeds, add the cost and count one chosen edge.\n4. Stop once n - 1 edges have been chosen, because a connected tree on n vertices has exactly n - 1 edges.",
        complexity: {
          time: "O(n^2 log n)",
          space: "O(n^2)",
          note: "There are O(n squared) candidate edges to store and sort; Union-Find operations are near constant amortised time.",
        },
        filename: "Solution.java",
        code: `import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
class Solution {
    public int minCostConnectPoints(int[][] points) {
        int n = points.length;
        List<int[]> edges = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                int cost = manhattan(points[i], points[j]);
                edges.add(new int[]{cost, i, j});
            }
        }
        Collections.sort(edges, (a, b) -> Integer.compare(a[0], b[0]));
        UnionFind unionFind = new UnionFind(n);
        int totalCost = 0;
        int chosen = 0;
        for (int[] edge : edges) {
            if (unionFind.union(edge[1], edge[2])) {
                totalCost += edge[0];
                chosen++;
                if (chosen == n - 1) {
                    break;
                }
            }
        }
        return totalCost;
    }
    private int manhattan(int[] a, int[] b) {
        return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    }
    private static class UnionFind {
        private final int[] parent;
        private final int[] rank;
        UnionFind(int n) {
            parent = new int[n];
            rank = new int[n];
            for (int i = 0; i < n; i++) {
                parent[i] = i;
            }
        }
        boolean union(int a, int b) {
            int rootA = find(a);
            int rootB = find(b);
            if (rootA == rootB) {
                return false;
            }
            if (rank[rootA] < rank[rootB]) {
                parent[rootA] = rootB;
            } else if (rank[rootA] > rank[rootB]) {
                parent[rootB] = rootA;
            } else {
                parent[rootB] = rootA;
                rank[rootA]++;
            }
            return true;
        }
        private int find(int x) {
            if (parent[x] != x) {
                parent[x] = find(parent[x]);
            }
            return parent[x];
        }
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "Prim trace for points = [[0,0],[2,2],[3,10],[5,2],[7,0]]. Points are labelled 0 through 4.",
      columns: ["Step", "Point added", "Cost added", "Best outside costs after relax", "Total"],
      rows: [
        ["0", "0 = [0,0]", "0", "1:4, 2:13, 3:7, 4:7", "0"],
        ["1", "1 = [2,2]", "4", "2:9, 3:3, 4:7", "4"],
        ["2", "3 = [5,2]", "3", "2:9, 4:4", "7"],
        ["3", "4 = [7,0]", "4", "2:9", "11"],
        ["4", "2 = [3,10]", "9", "none", "20"],
      ],
      narrativeMD: "Prim never needs to remember every edge. It only keeps the cheapest way each outside point can attach to the current tree. The chosen attachment costs are 0, 4, 3, 4, and 9, so the minimum total is **20**.",
    },
    interviewTipsMD: "Say the phrase **minimum spanning tree** early. Then justify the algorithm choice from input shape: this is a dense complete graph created by points, not a sparse edge list. That makes O(n squared) Prim especially attractive. If you present Kruskal too, mention that it is correct but pays to generate and sort about n squared edges. Interviewers often reward that trade-off more than a memorised implementation.",
    followUps: [
      "Return the actual selected edges in the minimum spanning tree, not just the cost.",
      "What changes if the graph is sparse and the input already provides weighted edges?",
      "Can you solve a dynamic version where points are added one at a time?",
      "How would the answer change if distance were Euclidean instead of Manhattan?",
    ],
    similarProblems: [
      {
        title: "Graph Valid Tree",
        difficulty: "Medium",
        slug: "graph-valid-tree",
        note: "A spanning tree must connect all vertices without cycles.",
      },
      {
        title: "Redundant Connection",
        difficulty: "Medium",
        slug: "graph-redundant-connection",
        note: "Uses Union-Find to detect whether an edge would create a cycle.",
      },
      {
        title: "Path With Minimum Effort",
        difficulty: "Medium",
        slug: "graph-path-with-minimum-effort",
        note: "Another weighted-graph problem where edge costs come from coordinates.",
      },
      {
        title: "Connecting Cities With Minimum Cost",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/connecting-cities-with-minimum-cost/",
      },
    ],
    keyTakeaways: [
      "Minimum cost to connect all vertices is the signature of an MST problem.",
      "For a complete graph over points, dense O(n squared) Prim is usually the cleanest optimal answer.",
      "Kruskal is the general edge-sorting MST template; Union-Find is what keeps it cycle-free.",
      "The first Prim vertex contributes cost 0; every later vertex pays its cheapest attachment into the tree.",
    ],
    pattern: "MST on a complete implicit graph: either grow the tree with dense Prim and best attachment costs, or sort all pair edges and accept cycle-free edges with Union-Find.",
  },
];
