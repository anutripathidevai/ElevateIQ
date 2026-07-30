import type { GraphProblem } from "../types";

export const PROBLEMS: GraphProblem[] = [
  {
    slug: "graph-is-graph-bipartite",
    moduleId: "bipartite",
    order: 24,
    title: "Is Graph Bipartite?",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/is-graph-bipartite/",
    tags: ["Graph", "BFS", "DFS", "Coloring"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 24,
    statementMD: "You are given an undirected graph as an adjacency list, where graph[u] contains every vertex adjacent to vertex u. The graph may be disconnected.\n\nReturn **true** if the graph is **bipartite**: its vertices can be split into two groups such that every edge connects a vertex from one group to a vertex in the other group. Equivalently, the graph is 2-colorable and contains no odd-length cycle.",
    constraints: [
      "graph.length == n",
      "1 <= n <= 100",
      "0 <= graph[u].length < n",
      "0 <= graph[u][i] <= n - 1",
      "graph[u] does not contain u",
      "All values in graph[u] are unique",
      "If v is in graph[u], then u is in graph[v]",
    ],
    inputMD: "A 0-indexed adjacency list **graph** for an undirected graph, possibly with multiple connected components.",
    outputMD: "A boolean: true if every component can be colored with two colors without an edge inside one color, otherwise false.",
    examples: [
      {
        input: "graph = [[1,2,3],[0,2],[0,1,3],[0,2]]",
        output: "false",
        explanation: "Vertices 0, 1, and 2 form a triangle. A 3-cycle is odd, so two colors cannot satisfy all edges.",
      },
      {
        input: "graph = [[1,3],[0,2],[1,3],[0,2]]",
        output: "true",
        explanation: "One valid split is {0,2} and {1,3}; every edge crosses between the two groups.",
      },
    ],
    learningObjectives: [
      "Translate bipartite testing into a two-color graph traversal problem.",
      "Detect an odd cycle through a color conflict rather than explicitly searching for cycles.",
      "Remember to start a traversal from every uncolored vertex because the graph can be disconnected.",
    ],
    intuitionMD: "A bipartite graph is one where every edge crosses between two sides. If you place one vertex on the left side, all of its neighbours must go on the right side. Then their neighbours must go back on the left, and so on. That forced alternation is exactly a BFS or DFS coloring process.\n\nThe only way coloring fails is if an edge asks two adjacent vertices to have the same color. That conflict means some path already forced both vertices onto the same side, and the edge between them closes an odd cycle. You do not need to construct the odd cycle; the contradiction is enough.\n\nDisconnected components are the trap. A graph can have several islands of vertices, and an unvisited component has no relationship to colors used elsewhere. Start a fresh coloring traversal from every still-uncolored vertex and treat it as color 0.",
    commonMistakes: [
      "Coloring only from vertex 0 and returning true while another disconnected component contains an odd cycle.",
      "Using a visited boolean without storing colors; visited alone cannot detect same-side edges.",
      "Assigning a neighbour's color but not checking whether an already-colored neighbour conflicts.",
      "Thinking every cycle is invalid. Even cycles are bipartite; odd cycles are the obstruction.",
      "For recursive DFS, forgetting that very large graphs can overflow the call stack, even though this LeetCode constraint is small.",
    ],
    algorithmMD: "Use an int array color with -1 meaning uncolored and values 0 or 1 for the two sides. For each vertex, if it is uncolored, start a BFS or DFS and color it 0. Whenever you traverse edge u-v, v must have color 1 - color[u]. If v is uncolored, assign that color and continue. If v is already colored the same as u, return false. If all components finish without conflict, return true.",
    solutions: [
      {
        name: "BFS coloring",
        whenToUseMD: "A safe default because it is iterative and naturally exposes the level-by-level alternation of colors.",
        approachMD: "For each uncolored component, use a queue to propagate opposite colors along edges. Any edge connecting equal colors proves the graph is not bipartite.",
        walkthroughMD: "1. Fill color with -1.\n2. For every uncolored start vertex, color it 0 and enqueue it.\n3. Pop a vertex; for each neighbour, either assign the opposite color and enqueue it, or detect a conflict if it already has the same color.\n4. If no component reports a conflict, return true.",
        complexity: {
          time: "O(V + E)",
          space: "O(V)",
          note: "Every vertex is colored once and every adjacency-list entry is inspected once.",
        },
        filename: "Solution.java",
        code: `import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Queue;

class Solution {

    public boolean isBipartite(int[][] graph) {
        int n = graph.length;
        int[] color = new int[n];
        Arrays.fill(color, -1);

        for (int start = 0; start < n; start++) {
            if (color[start] != -1) {
                continue;
            }

            Queue<Integer> queue = new ArrayDeque<>();
            queue.offer(start);
            color[start] = 0;

            while (!queue.isEmpty()) {
                int node = queue.poll();
                for (int next : graph[node]) {
                    if (color[next] == -1) {
                        color[next] = 1 - color[node];
                        queue.offer(next);
                    } else if (color[next] == color[node]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
}`,
      },
      {
        name: "DFS coloring",
        whenToUseMD: "Use this when you prefer the compact recursive formulation or when a traversal stack is already part of your template. Mention stack depth if constraints grow.",
        approachMD: "Recursively demand a color for each vertex. If the vertex was already colored, it is valid only when the existing color matches the demanded color.",
        walkthroughMD: "1. Iterate through all vertices so disconnected components are included.\n2. dfs(node, wantedColor) returns false if node already has a different color.\n3. Otherwise it colors node and recursively asks every neighbour to take the opposite color.\n4. Any recursive false bubbles up immediately as a global conflict.",
        complexity: {
          time: "O(V + E)",
          space: "O(V)",
          note: "The color array is O(V); recursion depth can reach O(V) in a long chain.",
        },
        filename: "Solution.java",
        code: `import java.util.Arrays;

class Solution {

    public boolean isBipartite(int[][] graph) {
        int n = graph.length;
        int[] color = new int[n];
        Arrays.fill(color, -1);

        for (int start = 0; start < n; start++) {
            if (color[start] == -1 && !dfs(graph, color, start, 0)) {
                return false;
            }
        }
        return true;
    }

    private boolean dfs(int[][] graph, int[] color, int node, int wantedColor) {
        if (color[node] != -1) {
            return color[node] == wantedColor;
        }

        color[node] = wantedColor;
        for (int next : graph[node]) {
            if (!dfs(graph, color, next, 1 - wantedColor)) {
                return false;
            }
        }
        return true;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "BFS on graph = [[1,2,3],[0,2],[0,1,3],[0,2]]. The triangle 0-1-2-0 will force a conflict.",
      columns: ["Step", "Node popped", "Color[node]", "Neighbour action", "Queue after"],
      rows: [
        ["1", "0", "0", "Color 1, 2, 3 as 1", "[1,2,3]"],
        ["2", "1", "1", "Neighbour 0 is 0, OK; neighbour 2 is 1, conflict", "stop"],
        ["3", "not reached", "-", "Same-color edge 1-2 proves not bipartite", "false"],
      ],
      narrativeMD: "Vertex 0 forces vertices 1 and 2 to color 1. But 1 and 2 are adjacent, so an edge would stay inside the same side. That contradiction is the odd cycle, and the algorithm returns **false**.",
    },
    interviewTipsMD: "Define bipartite in the interview as **2-colorable** and immediately connect it to traversal. Then call out disconnected components before writing code. If you choose DFS, mention the recursion trade-off; if you choose BFS, emphasise that levels alternate colors. The correctness proof is simple: every edge enforces opposite colors, and a same-color edge is exactly the contradiction.",
    followUps: [
      "Return the two partitions when the graph is bipartite.",
      "If the graph is not bipartite, return one odd cycle that proves it.",
      "Solve Possible Bipartition, where dislikes form the edges.",
      "Handle a streaming sequence of edges and detect when bipartiteness first breaks.",
    ],
    similarProblems: [
      {
        title: "Satisfiability of Equality Equations",
        difficulty: "Medium",
        slug: "graph-satisfiability-of-equality-equations",
        note: "Another constraints-as-graph problem, solved with Union-Find rather than coloring.",
      },
      {
        title: "Course Schedule",
        difficulty: "Medium",
        slug: "graph-course-schedule",
        note: "Cycle detection in directed graphs; bipartite is the undirected coloring counterpart.",
      },
      {
        title: "Graph Valid Tree",
        difficulty: "Medium",
        slug: "graph-valid-tree",
        note: "Undirected graph reasoning with components and cycles.",
      },
      {
        title: "Possible Bipartition",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/possible-bipartition/",
      },
    ],
    keyTakeaways: [
      "Bipartite means every edge crosses between two colors.",
      "BFS and DFS both work because they propagate forced opposite colors through each component.",
      "A same-color edge during traversal is an odd-cycle certificate.",
      "Always loop over every vertex so disconnected components are checked.",
    ],
    pattern: "Two-coloring traversal: for each uncolored component, assign a start color, force neighbours to the opposite color, and reject on any same-color edge.",
  },
];
