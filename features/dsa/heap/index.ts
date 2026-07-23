import type { DsaCourse } from "../types";
import { HEAP_COURSE_META } from "./course";
import { HEAP_MODULES } from "./modules";
import { HEAP_LESSONS } from "./data";

/** The Heap / Priority Queue course as a shared `DsaCourse`. */
export const heapCourse: DsaCourse = {
  meta: HEAP_COURSE_META,
  modules: HEAP_MODULES,
  lessons: HEAP_LESSONS,
};
