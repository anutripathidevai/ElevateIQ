/**
 * AI Labs — public feature surface.
 *
 * Interactive, run-it-in-the-browser labs that teach how modern AI applications
 * work, from a single LLM call to production AI. Metadata-driven like every
 * other Compile Ready learning module: routes import from here and never reach
 * into internal files.
 */
export * from "./types";
export {
  AI_LABS_CATALOG,
  AI_LABS_INFO,
} from "./registry";
export {
  getLab,
  getLabContent,
  getLabMeta,
  getLabs,
  getLabTotals,
  getPublishedLabSlugs,
  getPublishedLabs,
} from "./content-api";
