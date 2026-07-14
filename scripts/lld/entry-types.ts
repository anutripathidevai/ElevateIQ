/**
 * Shared types for the LLD content-authoring pipeline (scripts/lld/*).
 *
 * Each set file exports `ENTRIES: LldEntry[]`. The build script (build.ts)
 * merges them into content/lld.json:
 *  - For an existing problem (isNew falsy), only `solution` is attached.
 *  - For a new problem (isNew true), a full problem object is created from the
 *    provided fields plus `solution`.
 */
import type { LldSolution } from "../../lib/lld/types";

export type { LldSolution };

export interface LldEntry {
  slug: string;
  isNew?: boolean;
  // Required for new problems; ignored for existing ones.
  title?: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  tags?: string[];
  statementMD?: string;
  constraints?: string;
  hints?: string[];
  referenceSolution?: string;
  solution: LldSolution;
}
