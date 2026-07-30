/**
 * Public barrel for the Low Level Design (LLD) learning module.
 *
 * Consumers (routes, nav, learning hub) should import from here rather than
 * reaching into individual files, so the module's internals can evolve freely.
 */
export * from "./types";
export {
  LLD_TIERS,
  LLD_DIFFICULTIES,
  LLD_CATEGORIES,
  LLD_COMPANIES,
  LLD_PATTERNS,
  LLD_CATALOG,
} from "./registry";
export * from "./content-api";
