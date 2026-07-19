/**
 * Adapts the pre-existing Graph Algorithms content into the shared `DsaCourse`
 * model so it renders through the same DSA hub, landing, and lesson routes as
 * Dynamic Programming. No graph content is re-authored: this is a thin, typed
 * projection over `features/graph-algorithms` data.
 */
import { GRAPH_MODULES } from "@/features/graph-algorithms/modules";
import { GRAPH_PROBLEMS } from "@/features/graph-algorithms/data";
import type { GraphProblem } from "@/features/graph-algorithms/types";
import type {
  DsaCourse,
  DsaModule,
  DsaProblemLesson,
} from "../types";

function toLesson(p: GraphProblem): DsaProblemLesson {
  return {
    kind: "problem",
    slug: p.slug,
    moduleId: p.moduleId,
    order: p.order,
    title: p.title,
    difficulty: p.difficulty,
    leetcodeUrl: p.leetcodeUrl,
    tags: p.tags,
    companies: p.companies,
    estimatedReadingMin: p.estimatedReadingMin,
    estimatedSolvingMin: p.estimatedSolvingMin,
    statementMD: p.statementMD,
    constraints: p.constraints,
    inputMD: p.inputMD,
    outputMD: p.outputMD,
    examples: p.examples,
    learningObjectives: p.learningObjectives,
    intuitionMD: p.intuitionMD,
    commonMistakes: p.commonMistakes,
    // Graph uses a single "Algorithm Explanation" section rather than the DP
    // state definition / transition split.
    algorithmMD: p.algorithmMD,
    solutions: p.solutions,
    dryRun: p.dryRun,
    interviewTipsMD: p.interviewTipsMD,
    followUps: p.followUps,
    similarProblems: p.similarProblems,
    keyTakeaways: p.keyTakeaways,
    pattern: p.pattern,
  };
}

function toModule(m: (typeof GRAPH_MODULES)[number]): DsaModule {
  return {
    id: m.id,
    order: m.order,
    title: m.title,
    summary: m.summary,
    pattern: m.pattern,
    lessonSlugs: m.problemSlugs,
  };
}

export const graphCourse: DsaCourse = {
  meta: {
    topic: "graph-algorithms",
    title: "Graph Algorithms",
    subtitle:
      "An intuition-first track of 25 curated graph problems, from grid traversal to Tarjan's bridges.",
    descriptionMD:
      "A premium, interview-focused graph course. Every problem teaches the pattern first, then the algorithm, then a clean Java 17 implementation — with dry runs and interview guidance. You will progress from modelling a grid as a graph all the way to advanced techniques like union-find, Dijkstra, and articulation points.",
    objectives: [
      "Model grids, matrices, and relationships as graphs and traverse them with DFS and BFS.",
      "Choose the right shortest-path tool for the edge weights: BFS, Dijkstra, or Bellman-Ford.",
      "Apply union-find with path compression for near-constant-time grouping and cycle detection.",
      "Recognise topological-sort, bipartite, and advanced-graph patterns under interview pressure.",
    ],
    skills: [
      "Graph modelling",
      "DFS / BFS",
      "Union-Find",
      "Topological Sort",
      "Dijkstra",
      "Minimum Spanning Tree",
    ],
    accent: "violet",
  },
  modules: GRAPH_MODULES.map(toModule),
  lessons: GRAPH_PROBLEMS.map(toLesson),
};
