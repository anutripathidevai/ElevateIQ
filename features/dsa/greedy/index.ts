import type { DsaCourse } from "../types";
import { GREEDY_COURSE_META } from "./course";
import { GREEDY_MODULES } from "./modules";
import { GREEDY_LESSONS } from "./data";

/** The Greedy Algorithms course as a shared `DsaCourse`. */
export const greedyCourse: DsaCourse = {
  meta: GREEDY_COURSE_META,
  modules: GREEDY_MODULES,
  lessons: GREEDY_LESSONS,
};
