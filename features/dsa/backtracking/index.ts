import type { DsaCourse } from "../types";
import { BT_COURSE_META } from "./course";
import { BT_MODULES } from "./modules";
import { BT_LESSONS } from "./data";

/** The Backtracking course as a shared `DsaCourse`. */
export const backtrackingCourse: DsaCourse = {
  meta: BT_COURSE_META,
  modules: BT_MODULES,
  lessons: BT_LESSONS,
};
