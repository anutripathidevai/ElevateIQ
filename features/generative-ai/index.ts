/**
 * Generative AI learning module — public barrel.
 *
 * The single source of truth for all AI learning in ElevateIQ (Learning →
 * Generative AI): a metadata-driven track whose registry/catalog drives the
 * dashboard and whose dynamic `[lesson]` route renders any lesson conforming to
 * `GenAILessonContent`. Adding a lesson = author data (a catalog entry + a
 * content file); no route or UI changes required. Formerly the standalone "AI
 * System Design" module, now consolidated here as the Level 6 track.
 */
export * from "./types";
export {
  GENAI_TIERS,
  GENAI_DIFFICULTIES,
  GENAI_TOPICS,
  GENAI_COMPANIES,
  GENAI_CATALOG,
} from "./registry";
export {
  getCatalog,
  getPublishedCatalog,
  getLesson,
  getLessonMeta,
  getLessonContent,
  getTierGroups,
  getTotals,
  filterLessons,
  sortLessons,
  getAllTags,
  estimateReadingMinutes,
  type GenAISort,
  type GenAIFilters,
  type GenAITierGroup,
  type GenAITotals,
} from "./content-api";
export { GENAI_CONTENT } from "./questions";
