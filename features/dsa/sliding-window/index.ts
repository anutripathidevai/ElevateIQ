import type { DsaCourse } from "../types";
import { SW_COURSE_META } from "./course";
import { SW_MODULES } from "./modules";
import { SW_LESSONS } from "./data";

/** The Sliding Window course as a shared `DsaCourse`. */
export const slidingWindowCourse: DsaCourse = {
  meta: SW_COURSE_META,
  modules: SW_MODULES,
  lessons: SW_LESSONS,
};
