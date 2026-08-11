/**
 * Cloud, DevOps & Production Engineering learning module — public barrel.
 *
 * A metadata-driven track (Learning → Cloud & DevOps) whose registry drives the
 * landing page and navigation, and whose dynamic `[module]` route renders any
 * module conforming to `CDModuleContent`. A separate flat question bank powers
 * the `/questions` route. Adding a module or question is a pure data change —
 * no route or UI edits. Targets Senior → Staff → Architect interview prep.
 */
export * from "./types";
export {
  CD_MODULES,
  CD_DIFFICULTIES,
  CD_AREAS,
  CD_COURSE,
  CD_AREA_TARGETS,
} from "./registry";
export {
  getModules,
  getPublishedModules,
  getModuleMeta,
  getModuleContent,
  getModule,
  getQuestions,
  getQuestion,
  filterQuestions,
  getAreaCounts,
  getTotals,
  estimateReadingMinutes,
  type CDQuestionFilters,
  type CDTotals,
} from "./content-api";
export { CD_MODULE_CONTENT } from "./content";
export { CD_QUESTIONS } from "./questions";
