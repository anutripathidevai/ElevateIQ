import type { DsaLesson } from "../../types";
import { CONCEPTS as M1 } from "./module-01-fundamentals";
import { PROBLEMS as M2 } from "./module-02-fixed";
import { PROBLEMS as M3 } from "./module-03-variable";
import { PROBLEMS as M4 } from "./module-04-frequency";
import { PROBLEMS as M5 } from "./module-05-advanced";
import { PROBLEMS as M6 } from "./module-06-premium";

/**
 * All authored Sliding Window lessons, concatenated in module order. Module 1
 * contributes concept lessons; modules 2–6 contribute problem lessons. Keeping
 * this as a flat concatenation lets the course API and routes stay generic.
 */
export const SW_LESSONS: DsaLesson[] = [
  ...M1,
  ...M2,
  ...M3,
  ...M4,
  ...M5,
  ...M6,
];
