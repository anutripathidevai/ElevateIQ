import type { DsaCourse } from "../types";
import { ARR_COURSE_META } from "./course";
import { ARR_MODULES } from "./modules";
import { ARR_LESSONS } from "./data";

/** The Arrays & Hashing course as a shared `DsaCourse`. */
export const arraysCourse: DsaCourse = {
  meta: ARR_COURSE_META,
  modules: ARR_MODULES,
  lessons: ARR_LESSONS,
};
