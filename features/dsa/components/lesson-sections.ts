import type { DsaConceptLesson, DsaProblemLesson } from "../types";

/**
 * Icon keys for lesson sections. Kept as strings (not icon components) so the
 * section list is serialisable and can cross the server → client boundary into
 * the `LessonToc` client component, which resolves them to Lucide icons.
 */
export type SectionIconKey =
  | "statement"
  | "objectives"
  | "intuition"
  | "state-definition"
  | "state-transition"
  | "algorithm"
  | "solutions"
  | "dry-run"
  | "complexity"
  | "interview-tips"
  | "similar"
  | "takeaways"
  | "section";

/** A top-level, anchored section on a lesson page (drives the page and the TOC). */
export interface LessonSection {
  id: string;
  label: string;
  iconKey: SectionIconKey;
}

/**
 * Computes the ordered, anchored sections for a problem lesson. The list adapts
 * to the content that exists: DP problems surface State Definition, State
 * Transition, and a Complexity section; Graph problems surface a single
 * Algorithm Explanation section. Shared by the page and its sticky TOC so the
 * two never drift.
 */
export function problemSections(lesson: DsaProblemLesson): LessonSection[] {
  const isDp = Boolean(lesson.stateDefinitionMD || lesson.stateTransitionMD);
  const sections: LessonSection[] = [
    { id: "statement", label: "Problem Statement", iconKey: "statement" },
    { id: "objectives", label: "Learning Objectives", iconKey: "objectives" },
    { id: "intuition", label: "Intuition", iconKey: "intuition" },
  ];
  if (lesson.stateDefinitionMD) {
    sections.push({
      id: "state-definition",
      label: "State Definition",
      iconKey: "state-definition",
    });
  }
  if (lesson.stateTransitionMD) {
    sections.push({
      id: "state-transition",
      label: "State Transition",
      iconKey: "state-transition",
    });
  }
  if (lesson.algorithmMD) {
    sections.push({
      id: "algorithm",
      label: "Algorithm Explanation",
      iconKey: "algorithm",
    });
  }
  sections.push(
    { id: "solutions", label: "Solutions", iconKey: "solutions" },
    { id: "dry-run", label: "Dry Run", iconKey: "dry-run" },
  );
  if (isDp) {
    sections.push({
      id: "complexity",
      label: "Complexity Analysis",
      iconKey: "complexity",
    });
  }
  sections.push(
    { id: "interview-tips", label: "Interview Tips", iconKey: "interview-tips" },
    { id: "similar", label: "Similar Problems", iconKey: "similar" },
    { id: "takeaways", label: "Key Takeaways", iconKey: "takeaways" },
  );
  return sections;
}

/** Computes the anchored sections for a concept lesson from its headings. */
export function conceptSections(lesson: DsaConceptLesson): LessonSection[] {
  const sections: LessonSection[] = lesson.sections.map((_, i) => ({
    id: `section-${i}`,
    label: lesson.sections[i].heading,
    iconKey: "section" as const,
  }));
  sections.push({ id: "takeaways", label: "Key Takeaways", iconKey: "takeaways" });
  return sections;
}
