/**
 * Structured solution model for Low-Level Design (LLD) problems.
 *
 * Stored on each LLD problem (content/lld.json → `solution`, mirrored by the
 * Prisma `Problem.solution Json?` column). Powers the step-by-step solution
 * walkthrough and the read-only Java class viewer on the solve page. This is
 * reference/illustrative content — LLD is not auto-executed like DSA.
 */

/** A single class/file shown in the code viewer. */
export interface SolutionFile {
  /** e.g. "ParkingLot.java" */
  filename: string;
  /** Monaco language id, e.g. "java". */
  language: string;
  content: string;
}

/** One step of the guided walkthrough (explanation, optional code snippet). */
export interface SolutionStep {
  title: string;
  /** Markdown explanation for this step. */
  detailMD: string;
  /** Optional inline snippet illustrating the step. */
  code?: SolutionFile;
}

/** A design pattern applied in the solution and why. */
export interface SolutionPattern {
  name: string;
  why: string;
}

export interface LldSolution {
  /** How to approach the problem in an interview (Markdown). */
  approachMD: string;
  /** Ordered, explained steps toward the solution. */
  steps: SolutionStep[];
  /** Design patterns used (optional bonus panel). */
  patterns?: SolutionPattern[];
  /** Full reference classes for the code viewer. */
  code: SolutionFile[];
}
