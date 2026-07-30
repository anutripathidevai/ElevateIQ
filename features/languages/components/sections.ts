import {
  BookOpen,
  Braces,
  Code2,
  FileText,
  FlaskConical,
  GraduationCap,
  HelpCircle,
  ListChecks,
  Network,
  ScrollText,
  Sparkles,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import type { Topic } from "../types";

/** A top-level, anchored section on a topic page (drives the page and the TOC). */
export interface TopicSectionDef {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Returns true when the topic has content for this section. */
  present: (t: Topic) => boolean;
}

/**
 * The twelve learning sections, in order. Both the topic page and the sticky
 * table of contents derive from this list (filtered by `present`) so they can
 * never drift out of sync. `intro`, `theory`, and `summary` are always present.
 */
export const TOPIC_SECTIONS: TopicSectionDef[] = [
  { id: "introduction", label: "Introduction", icon: BookOpen, present: () => true },
  {
    id: "why",
    label: "Why This Matters",
    icon: Sparkles,
    present: (t) => Boolean(t.whyItMattersMD),
  },
  { id: "theory", label: "Theory", icon: FileText, present: () => true },
  {
    id: "diagrams",
    label: "Visual Diagrams",
    icon: Network,
    present: (t) => Boolean(t.diagrams?.length),
  },
  {
    id: "examples",
    label: "Code Examples",
    icon: Braces,
    present: (t) => Boolean(t.codeExamples?.length),
  },
  {
    id: "playground",
    label: "Playground",
    icon: Terminal,
    present: (t) => Boolean(t.playground?.length),
  },
  {
    id: "output-prediction",
    label: "Output Prediction",
    icon: HelpCircle,
    present: (t) => Boolean(t.outputPredictions?.length),
  },
  {
    id: "exercises",
    label: "Coding Exercises",
    icon: Code2,
    present: (t) => Boolean(t.codingExercises?.length),
  },
  {
    id: "interview",
    label: "Interview Questions",
    icon: GraduationCap,
    present: (t) => Boolean(t.interviewQuestions?.length),
  },
  {
    id: "quiz",
    label: "Quiz",
    icon: FlaskConical,
    present: (t) => Boolean(t.quiz?.length),
  },
  { id: "summary", label: "Summary", icon: ListChecks, present: () => true },
  {
    id: "cheat-sheet",
    label: "Cheat Sheet",
    icon: ScrollText,
    present: (t) => Boolean(t.cheatSheetMD),
  },
];

/** The section ids present for a given topic, in order (drives the TOC). */
export function presentSectionIds(topic: Topic): string[] {
  return TOPIC_SECTIONS.filter((s) => s.present(topic)).map((s) => s.id);
}
