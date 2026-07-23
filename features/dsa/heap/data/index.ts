import type { DsaLesson } from "../../types";
import { CONCEPTS as M1 } from "./module-01-fundamentals";
import { PROBLEMS as M2 } from "./module-02-top-k";
import { PROBLEMS as M3 } from "./module-03-merge";
import { PROBLEMS as M4 } from "./module-04-scheduling";
import { PROBLEMS as M5 } from "./module-05-median";
import { PROBLEMS as M6 } from "./module-06-advanced";

/**
 * All authored Heap / Priority Queue lessons, concatenated in module order.
 * Module 1 contributes concept lessons; modules 2–6 contribute problem
 * lessons. Keeping this as a flat concatenation lets the course API and routes
 * stay generic.
 */
export const HEAP_LESSONS: DsaLesson[] = [
  ...M1,
  ...M2,
  ...M3,
  ...M4,
  ...M5,
  ...M6,
];
