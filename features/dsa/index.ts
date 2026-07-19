/**
 * Public API for the DSA learning hub. Route pages and components import from
 * here so the data source (topic registry + per-course content) stays swappable
 * and the rendering layer never reaches into raw arrays.
 */
export * from "./types";
export {
  DSA_TOPICS,
  DSA_TOTALS,
  getTopic,
  publishedTopics,
  comingSoonTopics,
} from "./registry";
export { DSA_ROADMAP, type RoadmapPhase } from "./roadmap";
export {
  COMING_SOON_CONTENT,
  comingSoonContent,
  type ComingSoonContent,
} from "./coming-soon-content";
export { getCourse, allCourses } from "./courses";
export {
  plannedLessonCount,
  lessonsInOrder,
  getLesson,
  getModule,
  lessonsForModule,
  moduleStats,
  adjacentLessons,
  problemLessons,
  authoredProblemCount,
  allTags,
  allCompanies,
  totalMinutes,
  difficultyDistribution,
} from "./course-api";
