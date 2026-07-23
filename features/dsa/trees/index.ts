import type { DsaCourse } from "../types";
import { TREE_COURSE_META } from "./course";
import { TREE_MODULES } from "./modules";
import { TREE_LESSONS } from "./data";

/** The Trees & BST course as a shared `DsaCourse`. */
export const treesCourse: DsaCourse = {
  meta: TREE_COURSE_META,
  modules: TREE_MODULES,
  lessons: TREE_LESSONS,
};
