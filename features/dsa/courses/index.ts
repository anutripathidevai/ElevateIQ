/**
 * Maps a published topic slug to its `DsaCourse`. This is the one place a new
 * *published* course is wired up; coming-soon topics need no entry (they render
 * from registry metadata + coming-soon content). Keeping this tiny and explicit
 * lets the dynamic routes stay fully generic.
 */
import type { DsaCourse } from "../types";
import { graphCourse } from "./graph";
import { dpCourse } from "../dynamic-programming";
import { greedyCourse } from "../greedy";
import { slidingWindowCourse } from "../sliding-window";
import { backtrackingCourse } from "../backtracking";
import { arraysCourse } from "../arrays";
import { linkedListCourse } from "../linked-list";
import { treesCourse } from "../trees";
import { heapCourse } from "../heap";

const COURSES: Record<string, DsaCourse> = {
  "graph-algorithms": graphCourse,
  "dynamic-programming": dpCourse,
  greedy: greedyCourse,
  "sliding-window": slidingWindowCourse,
  backtracking: backtrackingCourse,
  arrays: arraysCourse,
  "linked-list": linkedListCourse,
  tree: treesCourse,
  "heap-priority-queue": heapCourse,
};

export function getCourse(topicSlug: string): DsaCourse | undefined {
  return COURSES[topicSlug];
}

/** All published courses, in registry-independent object order. */
export function allCourses(): DsaCourse[] {
  return Object.values(COURSES);
}
