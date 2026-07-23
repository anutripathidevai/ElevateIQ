import type { DsaLesson } from "../../types";
import { CONCEPTS as M1 } from "./module-01-fundamentals";
import { PROBLEMS as M2 } from "./module-02-merge";
import { PROBLEMS as M3 } from "./module-03-scheduling";
import { PROBLEMS as M4 } from "./module-04-greedy";
import { PROBLEMS as M5 } from "./module-05-advanced";

/**
 * All authored Intervals lessons, concatenated in module order. Module 1
 * contributes concept lessons; modules 2–5 contribute problem lessons. Keeping
 * this as a flat concatenation lets the course API and routes stay generic.
 */
export const INTERVALS_LESSONS: DsaLesson[] = [
  ...M1,
  ...M2,
  ...M3,
  ...M4,
  ...M5,
];
