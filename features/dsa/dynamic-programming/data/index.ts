import type { DsaLesson } from "../../types";
import { CONCEPTS as M1 } from "./module-01-fundamentals";
import { PROBLEMS as M2 } from "./module-02-1d";
import { PROBLEMS as M3 } from "./module-03-grid";
import { PROBLEMS as M4 } from "./module-04-sequence";
import { PROBLEMS as M5 } from "./module-05-knapsack";
import { PROBLEMS as M6 } from "./module-06-decision";
import { PROBLEMS as M7 } from "./module-07-string";
import { PROBLEMS as M8 } from "./module-08-advanced";

/**
 * All authored Dynamic Programming lessons, concatenated in module order.
 * Modules are filled in incrementally; unauthored modules contribute an empty
 * array, so this list only ever contains real, renderable pages.
 */
export const DP_LESSONS: DsaLesson[] = [
  ...M1,
  ...M2,
  ...M3,
  ...M4,
  ...M5,
  ...M6,
  ...M7,
  ...M8,
];
