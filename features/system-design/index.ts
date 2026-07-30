/**
 * System Design (HLD) learning module — public barrel.
 *
 * The dashboard route and the dynamic `[question]` route import from here only.
 * Adding a question is a pure data change (a catalog entry in `registry.ts` plus
 * a content file under `questions/`); no route or component edits are required.
 */
export * from "./types";
export {
  SD_TIERS,
  SD_CATEGORIES,
  SD_COMPANIES,
  SD_DIFFICULTIES,
  SD_CATALOG,
} from "./registry";
export {
  getCatalog,
  getPublishedCatalog,
  getQuestion,
  getQuestionMeta,
  getQuestionContent,
  getTierGroups,
  getTotals,
  getAllTags,
  filterQuestions,
  sortQuestions,
  estimateReadingMinutes,
} from "./content-api";
export type { SDTierGroup, SDTotals, SDSort, SDFilters } from "./content-api";
