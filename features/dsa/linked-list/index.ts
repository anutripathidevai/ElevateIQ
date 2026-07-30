import type { DsaCourse } from "../types";
import { LL_COURSE_META } from "./course";
import { LL_MODULES } from "./modules";
import { LL_LESSONS } from "./data";

/** The Linked List course as a shared `DsaCourse`. */
export const linkedListCourse: DsaCourse = {
  meta: LL_COURSE_META,
  modules: LL_MODULES,
  lessons: LL_LESSONS,
};
