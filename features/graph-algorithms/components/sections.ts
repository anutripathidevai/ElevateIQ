import {
  Code2,
  FileText,
  KeyRound,
  Lightbulb,
  MessagesSquare,
  Network,
  PlayCircle,
  Target,
  Workflow,
  type LucideIcon,
} from "lucide-react";

/** A top-level, anchored section on a problem page (drives both the page and the TOC). */
export interface ProblemSection {
  id: string;
  label: string;
  icon: LucideIcon;
}

/**
 * The ordered learning sections rendered on every Graph problem page. Shared by
 * the page (which renders the anchors) and the sticky table of contents (which
 * links to them), so the two can never drift out of sync.
 */
export const PROBLEM_SECTIONS: ProblemSection[] = [
  { id: "statement", label: "Problem Statement", icon: FileText },
  { id: "objectives", label: "Learning Objectives", icon: Target },
  { id: "intuition", label: "Intuition", icon: Lightbulb },
  { id: "algorithm", label: "Algorithm Explanation", icon: Workflow },
  { id: "solutions", label: "Solutions", icon: Code2 },
  { id: "dry-run", label: "Dry Run", icon: PlayCircle },
  { id: "interview-tips", label: "Interview Tips", icon: MessagesSquare },
  { id: "similar", label: "Similar Problems", icon: Network },
  { id: "takeaways", label: "Key Takeaways", icon: KeyRound },
];
