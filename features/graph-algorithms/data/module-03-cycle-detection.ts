import type { GraphProblem } from "../types";

export const PROBLEMS: GraphProblem[] = [
  {
    slug: "graph-valid-tree",
    moduleId: "cycle-detection",
    order: 9,
    title: "Graph Valid Tree",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/graph-valid-tree/",
    tags: ["Graph", "Union Find", "DFS", "BFS"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Bloomberg"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 20,
    statementMD: "You are given **n** vertices labelled **0** to **n - 1** and an undirected edge list **edges**, where each edge connects two vertices.\n\nReturn **true** if these edges form a valid tree, otherwise return **false**.\n\nA valid tree must satisfy both properties: it is **connected** so every vertex can reach every other vertex, and it is **acyclic** so there is exactly one simple path between any pair of vertices.",
    constraints: [
      "1 <= n <= 2000",
      "0 <= edges.length <= 5000",
      "edges[i].length == 2",
      "0 <= ai, bi < n",
      "ai != bi",
      "There are no repeated edges."
    ],
    inputMD: "An integer **n** and an undirected edge list **edges** over vertices **0..n - 1**.",
    outputMD: "A boolean: **true** if the graph is one connected acyclic component, otherwise **false**.",
    examples: [
      {
        input: "n = 5, edges = [[0,1],[0,2],[0,3],[1,4]]",
        output: "true",
        explanation: "There are exactly 4 edges for 5 nodes, every node is reachable from 0, and no edge closes a cycle."
      },
      {
        input: "n = 5, edges = [[0,1],[1,2],[2,3],[1,3],[1,4]]",
        output: "false",
        explanation: "The edge [1,3] closes the cycle 1 - 2 - 3 - 1, so the graph is not a tree even though all nodes are connected."
      },
      {
        input: "n = 4, edges = [[0,1],[2,3]]",
        output: "false",
        explanation: "The graph has two separate components, so it is disconnected. It also has fewer than n - 1 edges."
      }
    ],
    learningObjectives: [
      "Recognise the tree invariant for undirected graphs: **n - 1 edges plus connectedness** is enough.",
      "Use Union-Find to detect whether an undirected edge closes a cycle while tracking component count.",
      "Use traversal with parent tracking to distinguish a real cycle from the harmless edge back to the parent.",
      "Learn when an edge-count precheck can simplify both correctness and runtime."
    ],
    intuitionMD: "A tree is the sparsest possible connected graph. With **n** vertices it uses exactly **n - 1** edges: fewer edges cannot connect everything, and extra edges must create at least one cycle. That gives the fastest first filter: if **edges.length != n - 1**, the answer is immediately **false**.\n\nAfter that, you only need one structural check. You can prove the graph is a tree by showing it is connected, or by showing no edge creates a cycle. Union-Find phrases the question as components: start with **n** separate sets and merge endpoints. If an edge tries to merge two vertices already in the same set, it found a cycle. Traversal phrases it as reachability: start from node 0, avoid walking directly back to the parent, and make sure every node is reached without seeing an already visited non-parent neighbor.\n\n**Senior interview framing:** say the invariant first. The implementation is short because the invariant does the heavy lifting; you are not merely running DFS, you are proving connected plus acyclic with the minimum necessary checks.",
    commonMistakes: [
      "Only checking **edges.length == n - 1**. That is necessary, but without connectivity or acyclicity reasoning it is not a complete proof in code interviews.",
      "Treating the parent edge in an undirected traversal as a cycle. When you move from 0 to 1, seeing 0 in 1's adjacency list is expected.",
      "Forgetting the edge-count short-circuit and doing extra work on obviously impossible inputs.",
      "Returning true after no Union-Find cycle but never verifying that all vertices ended in one component.",
      "Starting traversal at node 0 and returning true when the queue empties, without checking how many nodes were actually reached."
    ],
    algorithmMD: "**Union-Find path.** First reject any graph whose edge count is not **n - 1**. Then create one set per vertex and process each edge. If the endpoints already share a root, the edge closes a cycle and the graph cannot be a tree. Otherwise merge the two components. At the end, require exactly one component.\n\n**Traversal path.** The same edge-count precheck still applies. Build an undirected adjacency list, then BFS or DFS from vertex 0 while carrying the parent vertex for each state. A visited neighbor that is not the parent is a cycle. If traversal finishes without a cycle, the graph is a tree only when the reachable count equals **n**.\n\nUnion-Find is especially clean when edges are the natural input. Traversal is better when you already need adjacency lists, a reachable-node count, or a follow-up that asks for paths.",
    solutions: [
      {
        name: "Union-Find with component count",
        whenToUseMD: "Prefer this when the input is an edge list and the interviewer cares about the tree invariant more than the actual traversal order. It short-circuits impossible edge counts, detects cycles online, and keeps connectivity as a component count.",
        approachMD: "A valid tree with **n** nodes must have **n - 1** edges. After that precheck, every successful union reduces the component count by one. If an edge's endpoints already have the same root, adding it would create a cycle. The graph is valid only if all unions succeed and one component remains.",
        walkthroughMD: "1. If **edges.length != n - 1**, return **false** immediately.\n2. Initialise parent and rank arrays with **components = n**.\n3. For each edge **[u, v]**, call union. If **u** and **v** already share a root, return **false** because a cycle was found.\n4. Each successful union decrements the component count.\n5. Return whether **components == 1**.",
        complexity: {
          time: "O(E · α(V))",
          space: "O(V)",
          note: "The edge-count precheck is O(1); path compression and union by rank make each union nearly constant time."
        },
        filename: "Solution.java",
        code: `class Solution {

    public boolean validTree(int n, int[][] edges) {
        if (edges.length != n - 1) {
            return false;
        }

        UnionFind unionFind = new UnionFind(n);
        for (int[] edge : edges) {
            if (!unionFind.union(edge[0], edge[1])) {
                return false;
            }
        }
        return unionFind.getComponents() == 1;
    }

    private static class UnionFind {
        private final int[] parent;
        private final int[] rank;
        private int components;

        UnionFind(int n) {
            parent = new int[n];
            rank = new int[n];
            components = n;
            for (int i = 0; i < n; i++) {
                parent[i] = i;
            }
        }

        int getComponents() {
            return components;
        }

        int find(int node) {
            if (parent[node] != node) {
                parent[node] = find(parent[node]);
            }
            return parent[node];
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
            components--;
            return true;
        }
    }
}`
      },
      {
        name: "BFS with parent tracking",
        whenToUseMD: "Prefer this when you want to demonstrate the graph-traversal view, or when a follow-up may ask which nodes were reached or how to recover a path. It is also intuitive for candidates who have just practised connected-component BFS.",
        approachMD: "Build the undirected adjacency list and traverse from node 0. Carry the parent with every queued node so the edge back to the parent is ignored. Any other visited neighbor is a cycle; if no cycle appears, the final reachable count must still be **n**.",
        walkthroughMD: "1. Reject immediately unless there are exactly **n - 1** edges.\n2. Add every edge in both directions to an adjacency list.\n3. Start BFS from **0** with parent **-1**, mark on enqueue, and count nodes when dequeued.\n4. For each neighbor, skip only the parent. If a non-parent neighbor is already visited, return **false**.\n5. After the queue drains, return whether the traversal saw all **n** vertices.",
        complexity: {
          time: "O(V + E)",
          space: "O(V + E)",
          note: "The adjacency list stores two directed entries per undirected edge; visited and queue are O(V)."
        },
        filename: "Solution.java",
        code: `import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;
import java.util.Queue;

class Solution {

    public boolean validTree(int n, int[][] edges) {
        if (edges.length != n - 1) {
            return false;
        }

        List<List<Integer>> graph = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            graph.add(new ArrayList<>());
        }
        for (int[] edge : edges) {
            graph.get(edge[0]).add(edge[1]);
            graph.get(edge[1]).add(edge[0]);
        }

        boolean[] visited = new boolean[n];
        Queue<int[]> queue = new ArrayDeque<>();
        queue.offer(new int[]{0, -1});
        visited[0] = true;
        int seen = 0;

        while (!queue.isEmpty()) {
            int[] state = queue.poll();
            int node = state[0];
            int parent = state[1];
            seen++;

            for (int next : graph.get(node)) {
                if (next == parent) {
                    continue;
                }
                if (visited[next]) {
                    return false;
                }
                visited[next] = true;
                queue.offer(new int[]{next, node});
            }
        }
        return seen == n;
    }
}`
      }
    ],
    dryRun: {
      inputMD: "Union-Find trace for **n = 5**, **edges = [[0,1],[0,2],[0,3],[1,4]]**. The precheck passes because there are **4 = n - 1** edges.",
      columns: ["Step", "Edge", "Roots before", "Action", "Components"],
      rows: [
        ["Start", "-", "0, 1, 2, 3, 4", "Each node is its own set", "5"],
        ["1", "[0,1]", "0 and 1", "Union them", "4"],
        ["2", "[0,2]", "0 and 2", "Union them", "3"],
        ["3", "[0,3]", "0 and 3", "Union them", "2"],
        ["4", "[1,4]", "0 and 4", "Union them", "1"],
        ["End", "-", "One root", "No cycle and all nodes connected", "1"]
      ],
      narrativeMD: "Every edge merged two previously separate components, so no cycle appeared. The component count reached **1**, therefore the graph is connected and acyclic: return **true**."
    },
    interviewTipsMD: "Lead with the invariant: **a tree on n nodes has exactly n - 1 edges and is connected**. That sentence often earns more signal than jumping into code. Then choose the implementation based on the conversation: Union-Find is concise for edge lists and streaming edges; BFS or DFS is natural if the interviewer asks about reachability, parent tracking, or returning nodes in the component. If challenged on the final component check after the edge precheck, explain that it makes the proof explicit and protects the code if the precheck is later refactored away.",
    followUps: [
      "Return the edge that creates the cycle if the graph is not a tree.",
      "The graph is directed: what definition of tree or arborescence should be used?",
      "Edges arrive one at a time; report when the graph first stops being a valid tree.",
      "Count how many edges must be added to connect all components."
    ],
    similarProblems: [
      {
        title: "Redundant Connection",
        difficulty: "Medium",
        slug: "graph-redundant-connection",
        note: "Find the one edge that breaks the tree property."
      },
      {
        title: "Number of Connected Components",
        difficulty: "Medium",
        slug: "graph-number-of-connected-components",
        note: "Connectivity without the acyclicity requirement."
      },
      {
        title: "Find if Path Exists in Graph",
        difficulty: "Easy",
        slug: "graph-find-if-path-exists",
        note: "Single reachability query in an undirected graph."
      },
      {
        title: "Course Schedule",
        difficulty: "Medium",
        slug: "graph-course-schedule",
        note: "Cycle detection in a directed graph."
      }
    ],
    keyTakeaways: [
      "Tree validation is **connectivity + acyclicity**, not just a traversal template.",
      "The **n - 1** edge count is a powerful necessary condition and simplifies the rest of the proof.",
      "Union-Find detects undirected cycles when an edge connects two vertices already in the same set.",
      "In undirected BFS or DFS, ignore the parent edge but reject any other visited neighbor."
    ],
    pattern: "Undirected tree check: first require **E = V - 1**, then prove either one connected component or no cycle."
  },
  {
    slug: "graph-redundant-connection",
    moduleId: "cycle-detection",
    order: 10,
    title: "Redundant Connection",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/redundant-connection/",
    tags: ["Graph", "Union Find", "DFS"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple", "Bloomberg"],
    estimatedReadingMin: 7,
    estimatedSolvingMin: 15,
    statementMD: "You are given an undirected graph that started as a tree with **n** nodes labelled **1** to **n**. Then one extra edge was added between two different nodes that were not already directly connected.\n\nReturn the edge that can be removed so the remaining graph is again a tree. If more than one edge could be removed, return the one that appears **last** in the input.",
    constraints: [
      "n == edges.length",
      "3 <= n <= 1000",
      "edges[i].length == 2",
      "1 <= ai < bi <= n",
      "ai != bi",
      "There are no repeated edges.",
      "The input graph is connected and contains exactly one cycle."
    ],
    inputMD: "An edge list **edges** for an undirected graph whose node labels are **1..n** and whose length is **n**.",
    outputMD: "The redundant edge **[u, v]** whose removal restores a valid tree.",
    examples: [
      {
        input: "edges = [[1,2],[1,3],[2,3]]",
        output: "[2,3]",
        explanation: "Edges [1,2] and [1,3] already connect 2 to 3 through node 1, so [2,3] closes the cycle."
      },
      {
        input: "edges = [[1,2],[2,3],[3,4],[1,4],[1,5]]",
        output: "[1,4]",
        explanation: "The first three edges build a path 1 - 2 - 3 - 4. Edge [1,4] closes that cycle; [1,5] is just a tree edge to a new node."
      }
    ],
    learningObjectives: [
      "Recognise that a tree plus one edge creates exactly one cycle.",
      "Use Union-Find to identify the first edge whose endpoints were already connected by earlier edges.",
      "Explain why processing edges in input order satisfies the last removable edge requirement for the single-cycle input model.",
      "Separate cycle detection from path recovery: the redundant edge is enough, not the full cycle."
    ],
    intuitionMD: "Imagine building the original tree back from left to right. Every normal tree edge connects two components that were previously separate. The extra edge is different: by the time it appears, its two endpoints already have a path between them through earlier edges. Adding it would create the only cycle.\n\nThat is exactly what Union-Find tracks. Each set represents one connected component formed by edges processed so far. If **u** and **v** have different roots, the edge is useful and we merge the sets. If they have the same root, the edge is redundant because a path already exists without it.\n\nThe input guarantee matters. Since the graph is a tree plus one edge, there is one cycle. The edge returned by the left-to-right Union-Find scan is the cycle edge that appears after the rest of its connecting path has already appeared, which is the required removable edge under LeetCode's ordering rule.",
    commonMistakes: [
      "Allocating Union-Find for **edges.length** instead of **edges.length + 1** even though labels start at 1.",
      "Returning the first edge that shares a direct endpoint with another edge. Sharing a vertex is normal; sharing a connected component is the cycle signal.",
      "Unioning before checking whether the endpoints already have the same root.",
      "Using DFS from scratch for every edge in code, which is correct but noisier and slower than the intended Union-Find pattern.",
      "Forgetting path compression or rank, then describing near-constant time without actually implementing it."
    ],
    algorithmMD: "1. Create a Union-Find structure sized for labels **1..n**.\n2. Process edges in the given order.\n3. For edge **[u, v]**, compare roots. If the roots match, **u** and **v** were already connected, so this edge closes the cycle and is the answer.\n4. Otherwise union the two roots and continue.\n5. The problem guarantees an answer, so the loop will return from the cycle-closing edge.\n\nA DFS-per-edge alternative can test whether **u** already reaches **v** before adding the edge, but it rebuilds or repeatedly searches adjacency. Union-Find is the cleaner optimal solution for an undirected incremental connectivity question.",
    solutions: [
      {
        name: "Union-Find with path compression and rank",
        whenToUseMD: "Use this whenever an undirected graph is built edge by edge and the question is whether the next edge connects vertices that are already connected. It is the intended optimal pattern here and avoids repeated graph searches.",
        approachMD: "Maintain connected components for the prefix of edges already accepted. A successful edge merges two components. A failing edge has both endpoints in the same component, meaning the earlier accepted edges already contain a path between them; return that edge immediately.",
        walkthroughMD: "1. Initialise **parent[i] = i** for labels **1..n** and keep a rank array.\n2. For each edge, find both roots with path compression.\n3. If the roots match, return the edge because adding it would close a cycle.\n4. Otherwise attach the shallower tree under the deeper one.\n5. The guaranteed single extra edge ensures the method returns during the scan.",
        complexity: {
          time: "O(N · α(N))",
          space: "O(N)",
          note: "N is the number of edges and nodes; α is effectively constant for interview-sized inputs."
        },
        filename: "Solution.java",
        code: `class Solution {

    public int[] findRedundantConnection(int[][] edges) {
        UnionFind unionFind = new UnionFind(edges.length + 1);
        for (int[] edge : edges) {
            if (!unionFind.union(edge[0], edge[1])) {
                return edge;
            }
        }
        return new int[0];
    }

    private static class UnionFind {
        private final int[] parent;
        private final int[] rank;

        UnionFind(int size) {
            parent = new int[size];
            rank = new int[size];
            for (int i = 0; i < size; i++) {
                parent[i] = i;
            }
        }

        int find(int node) {
            if (parent[node] != node) {
                parent[node] = find(parent[node]);
            }
            return parent[node];
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
    }
}`
      }
    ],
    dryRun: {
      inputMD: "Union-Find trace for **edges = [[1,2],[2,3],[3,4],[1,4],[1,5]]**.",
      columns: ["Step", "Edge", "Roots before", "Decision"],
      rows: [
        ["1", "[1,2]", "1 and 2", "Different roots, union"],
        ["2", "[2,3]", "1 and 3", "Different roots, union"],
        ["3", "[3,4]", "1 and 4", "Different roots, union"],
        ["4", "[1,4]", "1 and 1", "Same root, return [1,4]"],
        ["5", "[1,5]", "not processed", "The answer has already been found"]
      ],
      narrativeMD: "By step 4, vertices 1 and 4 are connected through 1 - 2 - 3 - 4. Adding [1,4] would create a cycle, so it is the redundant connection."
    },
    interviewTipsMD: "Say why Union-Find is enough: we do not need to output the whole cycle, only the edge that first connects two vertices already in the same component. If the interviewer asks for an alternative, describe DFS-per-edge: before adding **[u, v]**, search whether **u** already reaches **v** in the graph built so far. That works but costs more repeated traversal and is not the implementation to lead with. Also call out the 1-indexed labels before allocating arrays.",
    followUps: [
      "Return every edge on the cycle, not just the redundant edge.",
      "What changes if the graph is directed? Compare with Redundant Connection II.",
      "Support a stream of edge additions and report whether each one creates a cycle.",
      "After removing the redundant edge, verify that the remaining graph is a valid tree."
    ],
    similarProblems: [
      {
        title: "Graph Valid Tree",
        difficulty: "Medium",
        slug: "graph-valid-tree",
        note: "The inverse question: decide whether no redundant edge exists and all nodes are connected."
      },
      {
        title: "Number of Connected Components",
        difficulty: "Medium",
        slug: "graph-number-of-connected-components",
        note: "Union-Find or traversal over undirected components."
      },
      {
        title: "Course Schedule",
        difficulty: "Medium",
        slug: "graph-course-schedule",
        note: "Directed cycle detection uses DFS colors or topological sorting instead of Union-Find."
      },
      {
        title: "Accounts Merge",
        difficulty: "Medium",
        slug: "graph-accounts-merge",
        note: "Another component-merging problem where Union-Find is natural."
      }
    ],
    keyTakeaways: [
      "A tree plus one undirected edge creates exactly one cycle.",
      "The redundant edge is the edge whose endpoints already share a Union-Find root.",
      "For 1-indexed node labels, allocate parent arrays with one extra slot.",
      "Union-Find is the optimal fit when edges arrive incrementally and only connectivity matters."
    ],
    pattern: "Incremental undirected cycle detection: union each edge; the first edge whose endpoints already share a root is redundant."
  }
];