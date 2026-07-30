import type { DsaCourse } from "../types";
import { DP_COURSE_META } from "./course";
import { DP_MODULES } from "./modules";
import { DP_LESSONS } from "./data";

/** The Dynamic Programming course as a shared `DsaCourse`. */
export const dpCourse: DsaCourse = {
  meta: DP_COURSE_META,
  modules: DP_MODULES,
  lessons: DP_LESSONS,
};
