import type { GraphProblem } from "../types";

export const PROBLEMS: GraphProblem[] = [
  {
    slug: "graph-critical-connections",
    moduleId: "advanced",
    order: 25,
    title: "Critical Connections in a Network",
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/critical-connections-in-a-network/",
    tags: ["Graph", "DFS", "Tarjan", "Low Link", "Bridge"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Oracle"],
    estimatedReadingMin: 13,
    estimatedSolvingMin: 40,
    statementMD: "There are **n** servers labelled 0 through n - 1 connected by undirected network cables. You are given connections, where connections[i] = [a, b] means server a and server b are directly connected. The network is initially connected.\n\nA **critical connection** is an edge whose removal makes some server unable to reach another server. Return all critical connections in any order. In graph terms, return all **bridges** of the undirected graph.",
    constraints: [
      "2 <= n <= 10^5",
      "n - 1 <= connections.length <= 10^5",
      "connections[i].length == 2",
      "0 <= ai, bi < n",
      "ai != bi",
      "There are no repeated connections",
      "The network is connected before removing any edge",
    ],
    inputMD: "An integer **n** and a list of undirected edges **connections**.",
    outputMD: "A list of edges [u, v] whose removal disconnects the graph. The edges may be returned in any order and either orientation.",
    examples: [
      {
        input: "n = 4, connections = [[0,1],[1,2],[2,0],[1,3]]",
        output: "[[1,3]]",
        explanation: "The edge 1-3 is the only cable to server 3. Removing it disconnects server 3. The triangle edges 0-1, 1-2, and 2-0 are protected by alternate routes.",
      },
      {
        input: "n = 2, connections = [[0,1]]",
        output: "[[0,1]]",
        explanation: "With only one edge, removing it separates the two servers.",
      },
    ],
    learningObjectives: [
      "Understand bridges as edges that are not part of any cycle.",
      "Use discovery times and low-link values to detect whether a subtree can reach an ancestor without using its parent edge.",
      "Implement Tarjan's bridge-finding DFS in O(V + E) time.",
    ],
    intuitionMD: "An edge is safe from being critical if there is another way around it. In an undirected graph, that means the edge lies on a cycle: remove one side of the cycle and the remaining path still connects the endpoints. A bridge is exactly an edge that no cycle protects.\n\nTarjan's algorithm turns that idea into one DFS. Each node gets a **discovery time** when DFS first enters it. The DFS tree edge u-v is suspicious because v's entire subtree may depend on u to reach the rest of the graph. To answer that, compute low[v]: the earliest discovery time reachable from v's subtree by taking zero or more tree edges downward and at most one back edge upward.\n\nIf low[v] <= disc[u], then v's subtree can climb back to u or to an ancestor of u through some alternate edge. The edge u-v is part of a cycle or has a bypass, so it is not critical. If low[v] > disc[u], then nothing in v's subtree can reach u or above without using u-v. Removing u-v cuts the subtree away, so u-v is a bridge.\n\nThe parent edge needs special handling. In an undirected adjacency list, when DFS goes from u to v, v will immediately see u as a neighbour. That is not an alternate back edge; it is the same edge we just used. Skip only the immediate parent edge, and use all other visited neighbours to lower the low-link value.",
    commonMistakes: [
      "Using ordinary cycle detection and trying to remove edges one by one, which is too slow for 10^5 edges.",
      "Updating low[node] with low[visitedNeighbour] for a back edge. For an already visited non-parent neighbour, use discovery[neighbour].",
      "Forgetting to skip the immediate parent edge in an undirected graph, which makes every tree edge look protected by itself.",
      "Checking low[child] >= discovery[parent]. The bridge condition is strictly greater: low[child] > discovery[parent].",
      "Assuming recursion depth is always safe. Java recursion can overflow on a long chain; mention an iterative DFS or increased stack in production.",
    ],
    algorithmMD: "1. Build an undirected adjacency list.\n2. Maintain discovery[node], low[node], and a global increasing time. A discovery value of 0 can mean unvisited if time starts at 1.\n3. DFS from node with parent. Set discovery[node] = low[node] = time, then increment time.\n4. For each neighbour: skip the parent. If the neighbour is unvisited, DFS into it, then update low[node] = min(low[node], low[neighbour]). If low[neighbour] > discovery[node], the edge node-neighbour is a bridge.\n5. If the neighbour was already discovered and is not the parent, it is a back edge, so update low[node] = min(low[node], discovery[neighbour]).\n6. Return every bridge collected by the DFS.",
    solutions: [
      {
        name: "Tarjan's bridge-finding DFS",
        approachMD: "Run one DFS that records when each node was first seen and the earliest ancestor reachable from each node's subtree. A tree edge is critical exactly when the child subtree cannot reach the parent or any ancestor by a back edge.",
        walkthroughMD: "1. Build adjacency lists because the input is an edge list.\n2. discovery[node] stores the DFS entry timestamp; low[node] starts equal to discovery[node].\n3. After visiting an unvisited child, fold low[child] into low[node]. This passes the child's best back-edge information upward.\n4. If low[child] is still greater than discovery[node], the child subtree has no alternate route to node or above, so record [node, child].\n5. For a visited non-parent neighbour, lower low[node] with discovery[neighbour], because that edge jumps directly to an ancestor already on the DFS path.",
        complexity: {
          time: "O(V + E)",
          space: "O(V + E)",
          note: "The adjacency list stores the graph; discovery, low, output, and recursion stack are linear.",
        },
        filename: "Solution.java",
        code: `import java.util.ArrayList;
import java.util.List;

class Solution {

    private int time;
    private List<List<Integer>> graph;
    private List<List<Integer>> bridges;
    private int[] discovery;
    private int[] low;

    public List<List<Integer>> criticalConnections(int n, List<List<Integer>> connections) {
        graph = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            graph.add(new ArrayList<>());
        }
        for (List<Integer> edge : connections) {
            int a = edge.get(0);
            int b = edge.get(1);
            graph.get(a).add(b);
            graph.get(b).add(a);
        }

        time = 1;
        discovery = new int[n];
        low = new int[n];
        bridges = new ArrayList<>();

        for (int node = 0; node < n; node++) {
            if (discovery[node] == 0) {
                dfs(node, -1);
            }
        }
        return bridges;
    }

    private void dfs(int node, int parent) {
        discovery[node] = time;
        low[node] = time;
        time++;

        for (int next : graph.get(node)) {
            if (next == parent) {
                continue;
            }

            if (discovery[next] == 0) {
                dfs(next, node);
                low[node] = Math.min(low[node], low[next]);
                if (low[next] > discovery[node]) {
                    List<Integer> bridge = new ArrayList<>();
                    bridge.add(node);
                    bridge.add(next);
                    bridges.add(bridge);
                }
            } else {
                low[node] = Math.min(low[node], discovery[next]);
            }
        }
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "n = 4, connections = [[0,1],[1,2],[2,0],[1,3]]. DFS order: 0 → 1 → 2, then back to 1 → 3.",
      columns: ["Step", "DFS event", "discovery", "low after event", "Bridge decision"],
      rows: [
        ["1", "Enter 0", "disc[0]=1", "low[0]=1", "none"],
        ["2", "Tree edge 0-1, enter 1", "disc[1]=2", "low[1]=2", "pending"],
        ["3", "Tree edge 1-2, enter 2", "disc[2]=3", "low[2]=3", "pending"],
        ["4", "Back edge 2-0", "disc[0]=1", "low[2]=1", "2 can reach ancestor 0"],
        ["5", "Return 2 to 1", "disc[1]=2", "low[1]=1", "low[2]=1 <= disc[1], so 1-2 is not bridge"],
        ["6", "Tree edge 1-3, enter 3", "disc[3]=4", "low[3]=4", "pending"],
        ["7", "Return 3 to 1", "disc[1]=2", "low[1]=1", "low[3]=4 > disc[1], so 1-3 is bridge"],
        ["8", "Return 1 to 0", "disc[0]=1", "low[0]=1", "low[1]=1 <= disc[0], so 0-1 is not bridge"],
      ],
      narrativeMD: "The triangle 0-1-2 gives node 2 a back edge to discovery time 1, so its low value flows back and protects the triangle edges. Node 3 has no back edge at all: low[3] remains 4, greater than disc[1] = 2, so **1-3** is critical.",
    },
    interviewTipsMD: "For this hard problem, spend time on the invariant before coding: low[x] is the earliest discovery time reachable from x's DFS subtree without using the parent edge. Once that sentence is clear, the bridge test low[child] > disc[parent] feels inevitable. Also mention the recursion-depth caveat in Java for a 10^5-node chain; the recursive version is acceptable for explaining the algorithm, but production systems may use an iterative DFS or a larger stack.",
    followUps: [
      "Find articulation points: vertices whose removal disconnects the graph.",
      "Return 2-edge-connected components after removing all bridges.",
      "Implement the bridge search iteratively to avoid recursion depth limits.",
      "How would the algorithm change for directed strongly connected components?",
    ],
    similarProblems: [
      {
        title: "Redundant Connection",
        difficulty: "Medium",
        slug: "graph-redundant-connection",
        note: "Cycle reasoning in an undirected graph, but with Union-Find instead of low-link values.",
      },
      {
        title: "Graph Valid Tree",
        difficulty: "Medium",
        slug: "graph-valid-tree",
        note: "Another undirected connectivity and cycle problem.",
      },
      {
        title: "Course Schedule",
        difficulty: "Medium",
        slug: "graph-course-schedule",
        note: "Directed cycle detection; Tarjan's bridge logic is for undirected edges.",
      },
      {
        title: "Network Delay Time",
        difficulty: "Medium",
        slug: "graph-network-delay-time",
        note: "A contrasting network problem focused on shortest paths rather than resilience.",
      },
      {
        title: "Find Critical and Pseudo-Critical Edges in Minimum Spanning Tree",
        difficulty: "Hard",
        url: "https://leetcode.com/problems/find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree/",
        note: "Also asks which edges are structurally important, but in an MST setting.",
      },
    ],
    keyTakeaways: [
      "A bridge is an edge not protected by any cycle.",
      "discovery records when DFS first saw a node; low records the earliest ancestor reachable from its subtree.",
      "For a DFS tree edge parent-child, low[child] > discovery[parent] means the edge is critical.",
      "In undirected DFS, skip the immediate parent edge but treat other visited neighbours as back edges.",
      "Tarjan's bridge algorithm finds all critical connections in one linear pass.",
    ],
    pattern: "Tarjan bridge DFS: assign discovery and low-link times, propagate low values upward, and report tree edge u-v when low[v] > discovery[u].",
  },
];
