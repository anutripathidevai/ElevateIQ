import type { DsaLesson } from "../../types";
import { CONCEPTS as M1 } from "./module-01-fundamentals";
import { PROBLEMS as M2 } from "./module-02-dfs";
import { PROBLEMS as M3 } from "./module-03-bfs";
import { PROBLEMS as M4 } from "./module-04-bst";
import { PROBLEMS as M5 } from "./module-05-recursive";
import { PROBLEMS as M6 } from "./module-06-construction";
import { PROBLEMS as M7 } from "./module-07-advanced";

/**
 * All authored Trees & BST lessons, concatenated in module order. Module 1
 * contributes concept lessons; modules 2–7 contribute problem lessons. Keeping
 * this as a flat concatenation lets the course API and routes stay generic.
 */
export const TREE_LESSONS: DsaLesson[] = [
  ...M1,
  ...M2,
  ...M3,
  ...M4,
  ...M5,
  ...M6,
  ...M7,
];
