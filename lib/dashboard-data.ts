/**
 * Backwards-compatible barrel for the app's mock data.
 *
 * The data now lives in focused, database-ready modules under `lib/data/*`
 * and the domain types live in `lib/types`. This file re-exports both so
 * existing `@/lib/dashboard-data` imports keep working; new code should import
 * directly from `@/lib/data/*` and `@/lib/types`.
 */

export * from "./types";

export * from "./data/dashboard";
export * from "./data/learning";
export * from "./data/career-tools";
export * from "./data/practice";
export * from "./data/resources";
export * from "./data/profile";
export * from "./data/search";
export * from "./data/interview-prep";
