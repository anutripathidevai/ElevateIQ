import type { GraphModule } from "./types";

/**
 * The 10 modules of the Graph Algorithms track, in learning order. Each lists
 * its problem slugs (also in order). Problem content lives in `data/` keyed by
 * these slugs; `index.ts` joins the two and validates that they stay in sync.
 */
export const GRAPH_MODULES: GraphModule[] = [
  {
    id: "traversal",
    order: 1,
    title: "Graph Traversal",
    summary:
      "The foundation: model a grid or adjacency list as a graph and visit every node exactly once with DFS or BFS.",
    pattern: "DFS / BFS over grids and adjacency lists",
    problemSlugs: [
      "graph-number-of-islands",
      "graph-flood-fill",
      "graph-max-area-of-island",
      "graph-clone-graph",
      "graph-find-if-path-exists",
    ],
  },
  {
    id: "connected-components",
    order: 2,
    title: "Connected Components",
    summary:
      "Count and group nodes that are reachable from one another — the first place Union-Find competes with DFS/BFS.",
    pattern: "Component counting with DFS or Union-Find",
    problemSlugs: [
      "graph-number-of-connected-components",
      "graph-number-of-provinces",
      "graph-count-unreachable-pairs",
    ],
  },
  {
    id: "cycle-detection",
    order: 3,
    title: "Cycle Detection",
    summary:
      "Decide whether an undirected graph contains a cycle — the core check behind trees, forests, and safe merges.",
    pattern: "Cycle detection via Union-Find / DFS parent tracking",
    problemSlugs: ["graph-valid-tree", "graph-redundant-connection"],
  },
  {
    id: "topological-sort",
    order: 4,
    title: "Topological Sort",
    summary:
      "Order the nodes of a DAG so every edge points forward — the dependency-resolution pattern interviewers love.",
    pattern: "Kahn's BFS / DFS topological ordering",
    problemSlugs: [
      "graph-course-schedule",
      "graph-course-schedule-ii",
      "graph-alien-dictionary",
      "graph-parallel-courses",
    ],
  },
  {
    id: "union-find",
    order: 5,
    title: "Union Find",
    summary:
      "Disjoint Set Union with path compression and union by rank — near-constant-time grouping and equivalence.",
    pattern: "Disjoint Set Union (path compression + union by rank)",
    problemSlugs: [
      "graph-accounts-merge",
      "graph-most-stones-removed",
      "graph-satisfiability-of-equality-equations",
    ],
  },
  {
    id: "shortest-path",
    order: 6,
    title: "Shortest Path",
    summary:
      "From unweighted BFS to Dijkstra and Bellman-Ford — pick the right shortest-path tool for the edge weights.",
    pattern: "BFS / Dijkstra / Bellman-Ford shortest paths",
    problemSlugs: [
      "graph-shortest-path-in-binary-matrix",
      "graph-network-delay-time",
      "graph-cheapest-flights-within-k-stops",
      "graph-path-with-minimum-effort",
    ],
  },
  {
    id: "mst",
    order: 7,
    title: "Minimum Spanning Tree",
    summary:
      "Connect every node at minimum total cost with Prim's or Kruskal's algorithm.",
    pattern: "Minimum Spanning Tree (Prim / Kruskal)",
    problemSlugs: ["graph-min-cost-to-connect-all-points"],
  },
  {
    id: "grid-graphs",
    order: 8,
    title: "Grid Graphs",
    summary:
      "Multi-source BFS on a grid — spreading fronts, distances, and simultaneous starts.",
    pattern: "Multi-source BFS on grids",
    problemSlugs: ["graph-rotting-oranges"],
  },
  {
    id: "bipartite",
    order: 9,
    title: "Bipartite Graph",
    summary:
      "Two-colour a graph to prove it has no odd cycle — conflict-free partitioning.",
    pattern: "2-colouring with BFS / DFS",
    problemSlugs: ["graph-is-graph-bipartite"],
  },
  {
    id: "advanced",
    order: 10,
    title: "Advanced Graphs",
    summary:
      "Tarjan's bridges and articulation points — the discovery-time / low-link technique for critical edges.",
    pattern: "Tarjan's bridges (DFS discovery + low-link)",
    problemSlugs: ["graph-critical-connections"],
  },
];
