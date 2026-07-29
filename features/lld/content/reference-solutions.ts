/**
 * Bridges the LLD *learning* content files to the reference Java solutions that
 * already ship in `content/lld.json` (used by the `/practice/lld` track).
 *
 * Reusing the exact, reviewed Java keeps the two surfaces in lock-step and avoids
 * transcription drift — an authored learning problem references its solution by
 * the practice slug (e.g. `design-parking-lot`) instead of duplicating hundreds
 * of lines of code.
 */
import lldBank from "@/content/lld.json";
import type { SolutionFile } from "../types";

interface RawCodeFile {
  filename: string;
  language: string;
  content: string;
}

interface RawLldEntry {
  slug: string;
  solution?: { code?: RawCodeFile[] };
}

const BANK = lldBank as unknown as RawLldEntry[];

/**
 * Returns the reference implementation files for a practice-bank slug
 * (e.g. `design-parking-lot`), shaped for the Monaco multi-file viewer.
 * Throws if the slug is unknown so authoring mistakes fail fast in tests.
 */
export function referenceFiles(practiceSlug: string): SolutionFile[] {
  const entry = BANK.find((e) => e.slug === practiceSlug);
  if (!entry?.solution?.code?.length) {
    throw new Error(
      `No reference solution found in content/lld.json for slug "${practiceSlug}"`,
    );
  }
  return entry.solution.code.map((f) => ({
    filename: f.filename,
    language: f.language,
    content: f.content,
  }));
}
