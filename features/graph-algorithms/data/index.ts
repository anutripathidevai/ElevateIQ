import type { GraphProblem } from "../types";
import { PROBLEMS as M1 } from "./module-01-traversal";
import { PROBLEMS as M2 } from "./module-02-connected-components";
import { PROBLEMS as M3 } from "./module-03-cycle-detection";
import { PROBLEMS as M4 } from "./module-04-topological-sort";
import { PROBLEMS as M5 } from "./module-05-union-find";
import { PROBLEMS as M6 } from "./module-06-shortest-path";
import { PROBLEMS as M7 } from "./module-07-mst";
import { PROBLEMS as M8 } from "./module-08-grid-graphs";
import { PROBLEMS as M9 } from "./module-09-bipartite";
import { PROBLEMS as M10 } from "./module-10-advanced";

/**
 * All authored Graph Algorithms problems, concatenated in module order. Modules
 * are filled in incrementally; unauthored modules contribute an empty array, so
 * this list only ever contains real, renderable pages.
 */
export const GRAPH_PROBLEMS: GraphProblem[] = [
  ...M1,
  ...M2,
  ...M3,
  ...M4,
  ...M5,
  ...M6,
  ...M7,
  ...M8,
  ...M9,
  ...M10,
];
