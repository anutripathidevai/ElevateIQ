import {
  Braces,
  Coffee,
  Hash,
  Binary,
  Gauge,
  FileCode2,
  type LucideIcon,
} from "lucide-react";
import type { AccentKey } from "@/lib/navigation";
import type {
  ExerciseDifficulty,
  LanguageIconKey,
  TopicDifficulty,
} from "../types";

/** Resolve a language icon key (from serialisable data) to a Lucide icon. */
export const LANGUAGE_ICONS: Record<LanguageIconKey, LucideIcon> = {
  javascript: Braces,
  java: Coffee,
  python: FileCode2,
  csharp: Hash,
  cpp: Binary,
  go: Gauge,
};

/** Rotate module accents so adjacent modules look distinct on the roadmap. */
const ACCENT_CYCLE: AccentKey[] = [
  "orange",
  "blue",
  "emerald",
  "violet",
  "rose",
  "cyan",
];

export function moduleAccent(order: number): AccentKey {
  return ACCENT_CYCLE[(order - 1) % ACCENT_CYCLE.length];
}

/** "1h 20m" / "45m" from a minute count. */
export function formatMinutes(total: number): string {
  if (total <= 0) return "0m";
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Badge variant class for topic difficulty. */
export function topicDifficultyClass(d: TopicDifficulty): string {
  switch (d) {
    case "Beginner":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
    case "Intermediate":
      return "bg-orange-500/10 text-orange-500 border-orange-500/30";
    case "Advanced":
      return "bg-rose-500/10 text-rose-500 border-rose-500/30";
  }
}

/** Badge variant class for exercise/question difficulty. */
export function exerciseDifficultyClass(d: ExerciseDifficulty): string {
  switch (d) {
    case "Easy":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
    case "Medium":
      return "bg-orange-500/10 text-orange-500 border-orange-500/30";
    case "Hard":
      return "bg-rose-500/10 text-rose-500 border-rose-500/30";
  }
}
