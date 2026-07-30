import type { DsaLesson } from "../../types";
import { CONCEPTS as M1 } from "./module-01-arrays-fundamentals";
import { CONCEPTS as M2 } from "./module-02-hashing-fundamentals";
import { PROBLEMS as M3 } from "./module-03-prefix-sum";
import { PROBLEMS as M4 } from "./module-04-frequency-map";
import { PROBLEMS as M5 } from "./module-05-advanced-arrays";
import { PROBLEMS as M6 } from "./module-06-advanced-hashing";

/**
 * All authored Arrays & Hashing lessons, concatenated in module order. Modules
 * 1–2 contribute concept lessons; modules 3–6 contribute problem lessons.
 * Keeping this as a flat concatenation lets the course API and routes stay
 * generic.
 */
export const ARR_LESSONS: DsaLesson[] = [
  ...M1,
  ...M2,
  ...M3,
  ...M4,
  ...M5,
  ...M6,
];
