import type { DsaLesson } from "../../types";
import { CONCEPTS as M1 } from "./module-01-fundamentals";
import { PROBLEMS as M2 } from "./module-02-intervals";
import { PROBLEMS as M3 } from "./module-03-scheduling";
import { PROBLEMS as M4 } from "./module-04-array";
import { PROBLEMS as M5 } from "./module-05-string";
import { PROBLEMS as M6 } from "./module-06-heap";
import { PROBLEMS as M7 } from "./module-07-advanced";

/**
 * All authored Greedy Algorithms lessons, concatenated in module order. Module 1
 * contributes concept lessons; modules 2–7 contribute problem lessons. Keeping
 * this as a flat concatenation lets the course API and routes stay generic.
 */
export const GREEDY_LESSONS: DsaLesson[] = [
  ...M1,
  ...M2,
  ...M3,
  ...M4,
  ...M5,
  ...M6,
  ...M7,
];
