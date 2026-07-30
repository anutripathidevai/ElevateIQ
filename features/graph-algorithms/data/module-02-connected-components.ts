import type { GraphProblem } from "../types";
export const PROBLEMS: GraphProblem[] = [
  {
    slug: "graph-number-of-connected-components",
    moduleId: "connected-components",
    order: 6,
    title: "Number of Connected Components in an Undirected Graph",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/",
    tags: ["Graph", "Union Find", "DFS", "BFS"],
    companies: ["Amazon", "Microsoft", "Google", "Meta", "Bloomberg"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 20,
    statementMD: "You are given **n** nodes labelled **0..n-1** and an undirected edge list **edges**, where edges[i] = [a, b] means there is a bidirectional connection between a and b.\n\nReturn the number of connected components in the graph. A connected component is a maximal group of nodes where every node can reach every other node in that group through some path.",
    constraints: [
      "1 <= n <= 2000",
      "0 <= edges.length <= 5000",
      "edges[i].length == 2",
      "0 <= ai, bi < n",
      "ai != bi",
      "There are no repeated edges.",
    ],
    inputMD: "An integer **n** and a 2D integer array **edges** representing an undirected graph over nodes 0..n-1.",
    outputMD: "An integer: the number of connected components.",
    examples: [
      {
        input: "n = 5, edges = [[0,1],[1,2],[3,4]]",
        output: "2",
        explanation: "Nodes {0,1,2} form one component, and nodes {3,4} form another.",
      },
      {
        input: "n = 5, edges = [[0,1],[1,2],[2,3],[3,4]]",
        output: "1",
        explanation: "Every node is connected through the chain 0-1-2-3-4, so the whole graph is one component.",
      },
    ],
    learningObjectives: [
      "Recognise connected-components counting as repeated reachability over an undirected graph.",
      "Use Union-Find to maintain components by merging sets and decrementing the component count only on successful merges.",
      "Build an adjacency list and count how many BFS or DFS traversals are needed to cover all vertices.",
      "Choose between Union-Find and traversal based on whether edges are streaming or the graph is already materialised.",
    ],
    intuitionMD: "A connected component is a **group identity**: all nodes inside it are mutually reachable, and no edge connects it to another group. Initially, with no edges processed, every node is its own group, so the answer starts at **n**. Each edge can do only one meaningful thing: if its endpoints are in different groups, it merges those groups and the component count drops by one; if they are already in the same group, it adds a cycle and the count does not change.\n\nThat observation is exactly what Union-Find models. It lets you process edges one by one without building the whole graph, which is why it is excellent for streaming or incremental connectivity questions.\n\nThe traversal view is equally important: build the adjacency list, then every time the outer loop finds an unvisited node, that node is the seed of a new component. One BFS or DFS from that seed marks the entire component, so the number of seeds you needed is the number of components.\n\n**Recognise the pattern:** if a problem asks how many separate groups exist in an undirected edge list, either union endpoints and count merges, or traverse from each unvisited seed.",
    commonMistakes: [
      "Decrementing the component count for every edge instead of only for edges whose endpoints were in different components.",
      "Building an adjacency list in only one direction even though the graph is undirected.",
      "Assuming components equal n - edges.length; cycles make that formula wrong.",
      "Forgetting isolated nodes: a node with no incident edges is still a component.",
      "Using recursive DFS without discussing stack depth when n can be large; iterative BFS or Union-Find is safer.",
    ],
    algorithmMD: "**Union-Find:** start with components = n. Each node is its own parent. For every edge [u, v], find the roots of u and v. If the roots differ, union the smaller-rank tree under the larger-rank tree and decrement components. At the end, components is the answer.\n\n**Traversal:** build an adjacency list with both directions for every edge. Keep a visited array. Scan nodes 0..n-1; when a node is unvisited, increment components and BFS or DFS from it to mark every reachable node. The number of traversals started is the answer.",
    solutions: [
      {
        name: "Union-Find with rank and path compression",
        whenToUseMD: "Ideal when edges arrive incrementally, when you may need to answer many connectivity questions, or when you want to count components without storing adjacency lists.",
        approachMD: "Represent each component by a root. Path compression makes future root lookups fast, and union by rank keeps trees shallow. The key invariant is that **components** decreases exactly once per successful merge.",
        walkthroughMD: "1. Initialise parent[i] = i and rank[i] = 0 for every node.\n2. Set components = n.\n3. For each edge, find both roots. If they match, the edge stays inside one component, so do nothing.\n4. If roots differ, attach the lower-rank root under the higher-rank root, increasing rank on ties, and decrement components.\n5. Return components after all edges are processed.",
        complexity: {
          time: "O(n + E · α(n))",
          space: "O(n)",
          note: "α is the inverse-Ackermann function, effectively constant for interview-sized inputs.",
        },
        filename: "Solution.java",
        code: `class Solution {

    public int countComponents(int n, int[][] edges) {
        UnionFind unionFind = new UnionFind(n);
        int components = n;
        for (int[] edge : edges) {
            if (unionFind.union(edge[0], edge[1])) {
                components--;
            }
        }
        return components;
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

        private int find(int node) {
            if (parent[node] != node) {
                parent[node] = find(parent[node]);
            }
            return parent[node];
        }
    }
}`,
      },      {
        name: "BFS over an adjacency list",
        whenToUseMD: "Simplest when the graph is already built or when follow-ups may ask for actual members of each component. It is also easy to adapt to return the component lists.",
        approachMD: "Build neighbours for every node, then run an iterative BFS from each unvisited seed. Each BFS consumes exactly one component, so the number of BFS launches is the answer.",
        walkthroughMD: "1. Create an empty list of neighbours for each node.\n2. Add each undirected edge in both directions.\n3. Scan every node. If it is already visited, it belongs to a component discovered earlier.\n4. If it is unvisited, increment the component count and BFS from it, marking neighbours at enqueue time.\n5. Return the total number of BFS launches.",
        complexity: {
          time: "O(n + E)",
          space: "O(n + E)",
          note: "The adjacency list stores each undirected edge twice; visited and queue are O(n).",
        },
        filename: "Solution.java",
        code: `import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;
import java.util.Queue;

class Solution {

    public int countComponents(int n, int[][] edges) {
        List<List<Integer>> graph = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            graph.add(new ArrayList<>());
        }
        for (int[] edge : edges) {
            graph.get(edge[0]).add(edge[1]);
            graph.get(edge[1]).add(edge[0]);
        }

        boolean[] visited = new boolean[n];
        int components = 0;
        for (int node = 0; node < n; node++) {
            if (!visited[node]) {
                components++;
                bfs(graph, visited, node);
            }
        }
        return components;
    }

    private void bfs(List<List<Integer>> graph, boolean[] visited, int start) {
        Queue<Integer> queue = new ArrayDeque<>();
        visited[start] = true;
        queue.offer(start);

        while (!queue.isEmpty()) {
            int node = queue.poll();
            for (int neighbor : graph.get(node)) {
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    queue.offer(neighbor);
                }
            }
        }
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "n = 5, edges = [[0,1],[1,2],[3,4]]. Union-Find starts with five singleton components: {0}, {1}, {2}, {3}, {4}.",
      columns: ["Edge", "Operation", "Components", "Reason"],
      rows: [
        ["start", "none", "5", "Every node is isolated."],
        ["[0,1]", "union 0 and 1", "4", "Two singleton components merge."],
        ["[1,2]", "union root(1) with 2", "3", "Node 2 joins {0,1}."],
        ["[3,4]", "union 3 and 4", "2", "A second component forms."],
        ["done", "return", "2", "Components are {0,1,2} and {3,4}."],
      ],
      narrativeMD: "Each successful union reduces the count by one. No edge connects the two groups, so the final answer is **2**.",
    },
    interviewTipsMD: "Lead with the invariant: **each successful merge reduces the number of components by one**. That single sentence explains why Union-Find is correct. Then mention the traversal alternative, because some interviewers prefer the adjacency-list view and may ask for the actual groups. For Senior/Staff interviews, explicitly contrast the two: Union-Find is operationally better for streaming edges and many queries; BFS or DFS is better when you already have the graph and need to enumerate component members.",
    followUps: [
      "Return the list of nodes in each connected component, not just the count.",
      "Edges arrive online and after each insertion you must report the current component count.",
      "Support deletion of edges; why is plain Union-Find no longer enough?",
      "Determine whether the graph is a valid tree by combining component count with the edge-count condition.",
    ],
    similarProblems: [
      {
        title: "Number of Provinces",
        difficulty: "Medium",
        slug: "graph-number-of-provinces",
        note: "Same component counting, but the graph is given as an adjacency matrix.",
      },
      {
        title: "Find if Path Exists in Graph",
        difficulty: "Easy",
        slug: "graph-find-if-path-exists",
        note: "Single-pair connectivity instead of counting all components.",
      },
      {
        title: "Graph Valid Tree",
        difficulty: "Medium",
        slug: "graph-valid-tree",
        note: "A tree must be connected and have exactly n - 1 edges.",
      },
      {
        title: "Redundant Connection",
        difficulty: "Medium",
        slug: "graph-redundant-connection",
        note: "Union-Find detects the edge that tries to merge nodes already connected.",
      },
    ],
    keyTakeaways: [
      "Connected components are maximal reachability groups.",
      "Union-Find count starts at n and decreases only on successful unions.",
      "Traversal count increments once per unvisited seed, then marks the whole component.",
      "Cycles do not change the number of components.",
    ],
    pattern: "Connected-components count: union every undirected edge and count successful merges, or run one BFS or DFS from each unvisited seed.",
  },  {
    slug: "graph-number-of-provinces",
    moduleId: "connected-components",
    order: 7,
    title: "Number of Provinces",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/number-of-provinces/",
    tags: ["Graph", "DFS", "Union Find", "Matrix"],
    companies: ["Amazon", "Microsoft", "Google", "Meta", "Oracle"],
    estimatedReadingMin: 7,
    estimatedSolvingMin: 18,
    statementMD: "There are **n** cities. You are given an **n x n** matrix **isConnected** where isConnected[i][j] = 1 means city i and city j are directly connected, and 0 means they are not directly connected.\n\nA **province** is a group of directly or indirectly connected cities with no connection to cities outside the group. Return the total number of provinces.",
    constraints: [
      "n == isConnected.length",
      "n == isConnected[i].length",
      "1 <= n <= 200",
      "isConnected[i][j] is 0 or 1",
      "isConnected[i][i] == 1",
      "isConnected[i][j] == isConnected[j][i]",
    ],
    inputMD: "A symmetric adjacency matrix **isConnected**. Row i tells you which cities are directly connected to city i.",
    outputMD: "An integer: the number of provinces, which is the number of connected components among the cities.",
    examples: [
      {
        input: "isConnected = [[1,1,0],[1,1,0],[0,0,1]]",
        output: "2",
        explanation: "Cities 0 and 1 are connected to each other. City 2 is isolated, so there are two provinces.",
      },
      {
        input: "isConnected = [[1,0,0],[0,1,0],[0,0,1]]",
        output: "3",
        explanation: "No city is connected to any other city, so each city is its own province.",
      },
    ],
    learningObjectives: [
      "Translate an adjacency matrix into the same connected-components idea from an edge list.",
      "Traverse directly over matrix rows instead of first building adjacency lists.",
      "Use Union-Find over the upper triangle of a symmetric matrix to avoid duplicate work.",
      "Explain why direct and indirect connections belong to the same province.",
    ],
    intuitionMD: "This is the same question as counting connected components, but the representation changed. Problem 1 gave you an **edge list**: only existing edges were listed. Here you get an **adjacency matrix**: for a city i, every column j answers whether i has a direct road to j. That means finding neighbours costs a scan across row i.\n\nThe province definition is transitive. If 0 is connected to 1 and 1 is connected to 2, then all three cities belong to one province even if isConnected[0][2] is 0. A DFS captures that naturally: starting from one unvisited city, scan its row, recursively visit every directly connected city, and let those cities reveal indirect connections through their own rows.\n\nUnion-Find tells the same story through merges. Because the matrix is symmetric and the diagonal is always 1, you only need to inspect the upper triangle where j > i. Every 1 there is one undirected edge. Union those endpoints and count successful merges from an initial n provinces.\n\n**Recognise the distinction:** edge-list problems are O(E) to scan; matrix problems are usually O(n²) because every possible city pair is present as a matrix cell.",
    commonMistakes: [
      "Treating isConnected as a list of edges instead of a square matrix and indexing it incorrectly.",
      "Counting only direct neighbours of city 0 rather than transitive reachability through intermediate cities.",
      "Scanning both matrix triangles and then decrementing province count without checking whether union actually merged two sets.",
      "Forgetting that isConnected[i][i] is 1 by definition and should not create a new province or special case.",
      "Building an adjacency list unnecessarily; it works, but the matrix can be traversed directly.",
    ],
    algorithmMD: "**DFS over the matrix:** keep a visited array. Scan cities 0..n-1; each unvisited city starts a new province. DFS marks the city and scans all possible neighbours in its row. For every connected and unvisited neighbour, recurse.\n\n**Union-Find over the upper triangle:** initialise n singleton sets. For each pair (i, j) with j > i, if isConnected[i][j] == 1, union i and j. Decrement the province count only when union returns true. Return the final count.",
    solutions: [
      {
        name: "DFS over the adjacency matrix",
        whenToUseMD: "Best first answer for this exact input shape. The matrix is already built, n is small enough for recursion, and DFS maps directly to the province definition.",
        approachMD: "Scan every city. When you find one that has not been visited, it is the first city of a new province. DFS from it by scanning its matrix row and visiting every connected unvisited city.",
        walkthroughMD: "1. Create visited[n] and provinces = 0.\n2. For each city, if visited[city] is false, increment provinces and call dfs(city).\n3. dfs(city) marks the city visited, then scans neighbour = 0..n-1.\n4. If isConnected[city][neighbor] == 1 and neighbour is unvisited, recurse into neighbour.\n5. One DFS marks one whole province, including indirect connections.",
        complexity: {
          time: "O(n²)",
          space: "O(n)",
          note: "Each DFS row scan costs O(n), and every city is visited once; recursion depth is O(n).",
        },
        filename: "Solution.java",
        code: `class Solution {

    public int findCircleNum(int[][] isConnected) {
        int n = isConnected.length;
        boolean[] visited = new boolean[n];
        int provinces = 0;

        for (int city = 0; city < n; city++) {
            if (!visited[city]) {
                provinces++;
                dfs(isConnected, visited, city);
            }
        }
        return provinces;
    }

    private void dfs(int[][] isConnected, boolean[] visited, int city) {
        visited[city] = true;
        for (int neighbor = 0; neighbor < isConnected.length; neighbor++) {
            if (isConnected[city][neighbor] == 1 && !visited[neighbor]) {
                dfs(isConnected, visited, neighbor);
            }
        }
    }
}`,
      },      {
        name: "Union-Find over the upper triangle",
        whenToUseMD: "Useful when you want the same component-counting template as edge-list problems, or when the interviewer pivots to dynamic additions of city connections.",
        approachMD: "Read each matrix 1 above the diagonal as an undirected edge and union its two cities. The diagonal and lower triangle do not add new information.",
        walkthroughMD: "1. Start with provinces = n and each city as its own parent.\n2. For every i, inspect j from i + 1 to n - 1.\n3. When isConnected[i][j] == 1, union i and j.\n4. If the union merged two previously separate roots, decrement provinces.\n5. Return provinces after all possible pairs have been considered.",
        complexity: {
          time: "O(n² · α(n))",
          space: "O(n)",
          note: "The matrix scan dominates; Union-Find operations are effectively constant amortised time.",
        },
        filename: "Solution.java",
        code: `class Solution {

    public int findCircleNum(int[][] isConnected) {
        int n = isConnected.length;
        UnionFind unionFind = new UnionFind(n);
        int provinces = n;

        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (isConnected[i][j] == 1 && unionFind.union(i, j)) {
                    provinces--;
                }
            }
        }
        return provinces;
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

        private int find(int node) {
            if (parent[node] != node) {
                parent[node] = find(parent[node]);
            }
            return parent[node];
        }
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "isConnected = [[1,1,0,0],[1,1,0,0],[0,0,1,1],[0,0,1,1]]. DFS scans cities in order.",
      columns: ["Scan city", "Visited before", "Action", "Provinces"],
      rows: [
        ["0", "none", "New province; DFS visits 0 then 1", "1"],
        ["1", "0,1", "Already visited through city 0", "1"],
        ["2", "0,1", "New province; DFS visits 2 then 3", "2"],
        ["3", "0,1,2,3", "Already visited through city 2", "2"],
        ["done", "all cities", "Return province count", "2"],
      ],
      narrativeMD: "The outer scan starts exactly two DFS traversals: one for cities {0,1} and one for cities {2,3}. Therefore the matrix contains **2** provinces.",
    },
    interviewTipsMD: "Call out the representation difference immediately: this is not an edge list, so a neighbour lookup is a row scan. That prevents many off-by-one and shape mistakes. For the DFS answer, emphasise transitive connectivity; for the Union-Find answer, mention scanning only the upper triangle because the matrix is symmetric. If asked for production-scale behaviour, note that a sparse graph should not be stored as an n x n matrix because O(n²) space is wasteful.",
    followUps: [
      "Return the cities in each province as groups.",
      "The matrix is sparse and huge; how would you store and traverse it more efficiently?",
      "Connections are added over time and you must update the province count after each addition.",
      "What changes if the matrix is directed rather than symmetric?",
    ],
    similarProblems: [
      {
        title: "Number of Connected Components in an Undirected Graph",
        difficulty: "Medium",
        slug: "graph-number-of-connected-components",
        note: "Same concept with an edge-list representation.",
      },
      {
        title: "Accounts Merge",
        difficulty: "Medium",
        slug: "graph-accounts-merge",
        note: "Union-Find groups records that share an email address.",
      },
      {
        title: "Most Stones Removed with Same Row or Column",
        difficulty: "Medium",
        slug: "graph-most-stones-removed",
        note: "Components determine how many stones can be removed.",
      },
      {
        title: "Satisfiability of Equality Equations",
        difficulty: "Medium",
        slug: "graph-satisfiability-of-equality-equations",
        note: "Union equal variables, then verify inequalities across components.",
      },
    ],
    keyTakeaways: [
      "A province is just a connected component under a city graph.",
      "Adjacency matrices make neighbour discovery an O(n) row scan.",
      "For symmetric matrices, the upper triangle contains every undirected edge exactly once.",
      "Transitive connectivity matters: direct links can pull indirect cities into the same province.",
    ],
    pattern: "Matrix components: each unvisited row seed starts one DFS, or each upper-triangle 1 becomes a Union-Find merge.",
  },  {
    slug: "graph-count-unreachable-pairs",
    moduleId: "connected-components",
    order: 8,
    title: "Count Unreachable Pairs of Nodes in an Undirected Graph",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/count-unreachable-pairs-of-nodes-in-an-undirected-graph/",
    tags: ["Graph", "Union Find", "DFS", "Combinatorics"],
    companies: ["Amazon", "Google", "Meta", "Microsoft", "Apple"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 25,
    statementMD: "You are given an integer **n** representing nodes labelled **0..n-1** and an undirected edge list **edges**.\n\nReturn the number of unordered pairs of different nodes **(a, b)** such that there is no path between a and b. In other words, count how many node pairs belong to different connected components.",
    constraints: [
      "1 <= n <= 10^5",
      "0 <= edges.length <= 2 * 10^5",
      "edges[i].length == 2",
      "0 <= ai, bi < n",
      "ai != bi",
      "There are no repeated edges.",
    ],
    inputMD: "An integer **n** and an undirected edge list **edges**.",
    outputMD: "A long integer: the number of unordered pairs of nodes that cannot reach each other.",
    examples: [
      {
        input: "n = 3, edges = [[0,1],[0,2],[1,2]]",
        output: "0",
        explanation: "All three nodes are in one component, so every pair is reachable.",
      },
      {
        input: "n = 7, edges = [[0,2],[0,5],[2,4],[1,6]]",
        output: "14",
        explanation: "The component sizes are 4 for {0,2,4,5}, 2 for {1,6}, and 1 for {3}. Unreachable pairs are 4·2 + 4·1 + 2·1 = 14.",
      },
    ],
    learningObjectives: [
      "Move from counting components to using component sizes in a combinatorial formula.",
      "Use Union-Find by size so every root knows how many nodes its component contains.",
      "Avoid double-counting pairs by using a running total of nodes seen in previous components.",
      "Use long for pair counts because n choose 2 can exceed 32-bit integer range.",
    ],
    intuitionMD: "Once the graph is split into components, the edges inside a component no longer matter. A node can reach exactly the nodes in its own component and cannot reach any node outside it. So the entire problem reduces to: **given component sizes, how many pairs choose nodes from two different sizes?**\n\nFor a component of size s, there are s · (n - s) ordered-looking cross choices with nodes outside it, but if you sum that over every component, each unordered pair is counted twice: once from each side. That gives one correct formula: sum s · (n - s) / 2.\n\nThe cleaner interview trick is a running total. Process component sizes one by one. Suppose you have already seen **seen** nodes in earlier components. A new component of size s forms exactly **s · seen** unreachable pairs with those earlier nodes. Add that to the answer, then set seen += s. This counts every cross-component pair exactly once and never needs a division.\n\nUnion-Find by size is a natural fit because after all edges are unioned, each root already stores its component size. DFS component sizing also works, but Union-Find keeps the counting phase compact.",
    commonMistakes: [
      "Using int for the answer; with 100,000 isolated nodes the answer is about 5 billion.",
      "Summing s · (n - s) and forgetting to divide by 2, which double-counts every pair.",
      "Reading component size from every node rather than only from roots, causing duplicate counts.",
      "Counting reachable pairs instead of unreachable pairs, or subtracting from total pairs with integer overflow.",
      "Trying to reason from the number of edges; only component sizes determine the answer.",
    ],
    algorithmMD: "1. Build a Union-Find with parent[i] = i and size[i] = 1.\n2. Union every edge using union by size; when two roots merge, add the smaller component size into the larger root.\n3. Iterate nodes 0..n-1. A node whose root is itself represents one completed component.\n4. Let s be that root's component size. Add s · seen to the answer, where seen is the number of nodes in earlier components.\n5. Increase seen by s and continue. Return the answer as a long.",
    solutions: [
      {
        name: "Union-Find by size plus running total",
        approachMD: "Union all reachable nodes into components while maintaining each root's size. Then process root sizes once, adding size · seen so each pair across two different components is counted exactly once.",
        walkthroughMD: "1. parent tracks the representative root for each node; size[root] tracks the number of nodes in that root's component.\n2. For every edge, union its endpoints. If they are already in the same component, ignore the edge.\n3. After all unions, scan nodes. Only roots should contribute a component size.\n4. For each root size s, add s * seen to answer because every node in this component is unreachable from every node in all earlier components.\n5. Add s to seen and continue until all roots are processed.",
        complexity: {
          time: "O((n + E) · α(n))",
          space: "O(n)",
          note: "Union-Find operations are effectively constant amortised time; arrays store parent and size.",
        },
        filename: "Solution.java",        code: `class Solution {

    public long countPairs(int n, int[][] edges) {
        UnionFind unionFind = new UnionFind(n);
        for (int[] edge : edges) {
            unionFind.union(edge[0], edge[1]);
        }

        long answer = 0;
        long seen = 0;
        for (int node = 0; node < n; node++) {
            if (unionFind.find(node) == node) {
                long componentSize = unionFind.componentSize(node);
                answer += componentSize * seen;
                seen += componentSize;
            }
        }
        return answer;
    }

    private static class UnionFind {
        private final int[] parent;
        private final int[] size;

        UnionFind(int n) {
            parent = new int[n];
            size = new int[n];
            for (int i = 0; i < n; i++) {
                parent[i] = i;
                size[i] = 1;
            }
        }

        void union(int a, int b) {
            int rootA = find(a);
            int rootB = find(b);
            if (rootA == rootB) {
                return;
            }
            if (size[rootA] < size[rootB]) {
                int temp = rootA;
                rootA = rootB;
                rootB = temp;
            }
            parent[rootB] = rootA;
            size[rootA] += size[rootB];
        }

        int find(int node) {
            if (parent[node] != node) {
                parent[node] = find(parent[node]);
            }
            return parent[node];
        }

        int componentSize(int root) {
            return size[root];
        }
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "n = 7, edges = [[0,2],[0,5],[2,4],[1,6]]. After unions, component sizes are 4 for {0,2,4,5}, 2 for {1,6}, and 1 for {3}.",
      columns: ["Component", "Size", "seen before", "Pairs added", "Answer"],
      rows: [
        ["{0,2,4,5}", "4", "0", "4 * 0 = 0", "0"],
        ["{1,6}", "2", "4", "2 * 4 = 8", "8"],
        ["{3}", "1", "6", "1 * 6 = 6", "14"],
        ["done", "7 nodes seen", "-", "return", "14"],
      ],
      narrativeMD: "The running-total method pairs each new component only with components already processed, so no unreachable pair is missed or counted twice. Final answer: **14**.",
    },
    interviewTipsMD: "Do not stop at component counting; say explicitly that the real target is **cross-component pairs**. Derive the formula before coding: either sum s · (n - s) and divide by two, or use answer += s · seen. The running-total version sounds cleaner and avoids a final division. Also mention long early — it is a common hidden failure on this problem and a strong signal that you checked constraints.",
    followUps: [
      "Return the number of reachable pairs instead, and derive it from component sizes.",
      "Solve with DFS component sizes rather than Union-Find and compare memory trade-offs.",
      "Edges are added one at a time; maintain the number of unreachable pairs after each addition.",
      "Count unreachable ordered pairs instead of unordered pairs.",
    ],
    similarProblems: [
      {
        title: "Number of Connected Components in an Undirected Graph",
        difficulty: "Medium",
        slug: "graph-number-of-connected-components",
        note: "First find components; this problem adds size-based counting.",
      },
      {
        title: "Number of Provinces",
        difficulty: "Medium",
        slug: "graph-number-of-provinces",
      },
      {
        title: "Accounts Merge",
        difficulty: "Medium",
        slug: "graph-accounts-merge",
        note: "Another Union-Find grouping problem where component membership matters.",
      },
      {
        title: "Most Stones Removed with Same Row or Column",
        difficulty: "Medium",
        slug: "graph-most-stones-removed",
        note: "Component sizes drive the final count after grouping.",
      },
    ],
    keyTakeaways: [
      "After components are known, only their sizes matter for unreachable pair counts.",
      "answer += size * seen counts each cross-component pair exactly once.",
      "Use long whenever pair counts can approach n choose 2.",
      "Union-Find by size maintains component sizes during merges.",
    ],
    pattern: "Component-size counting: find each connected component size, then aggregate cross-component pairs with answer += size * nodesSeenSoFar.",
  },
];