/**
 * AI System Design learning module — public barrel.
 *
 * A metadata-driven Learning track (Learning → AI System Design) mirroring the
 * System Design (HLD) module: a registry/catalog drives the dashboard and the
 * dynamic `[lesson]` route renders any lesson conforming to `AISDLessonContent`.
 * Adding a lesson = author data (a catalog entry + a content file); no route or
 * UI changes required.
 */
export * from "./types";
export {
  AISD_TIERS,
  AISD_DIFFICULTIES,
  AISD_TOPICS,
  AISD_COMPANIES,
  AISD_CATALOG,
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
  type AISDSort,
  type AISDFilters,
  type AISDTierGroup,
  type AISDTotals,
} from "./content-api";
export { AISD_CONTENT } from "./questions";
