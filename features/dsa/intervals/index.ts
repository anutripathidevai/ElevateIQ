import type { DsaCourse } from "../types";
import { INTERVALS_COURSE_META } from "./course";
import { INTERVALS_MODULES } from "./modules";
import { INTERVALS_LESSONS } from "./data";

/** The Intervals course as a shared `DsaCourse`. */
export const intervalsCourse: DsaCourse = {
  meta: INTERVALS_COURSE_META,
  modules: INTERVALS_MODULES,
  lessons: INTERVALS_LESSONS,
};
