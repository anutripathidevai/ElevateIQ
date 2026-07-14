import type { TrackKey } from "@prisma/client";
import {
  Code2,
  Network,
  Boxes,
  MessagesSquare,
  type LucideIcon,
} from "lucide-react";

export type InputMode = "code" | "text";

/**
 * Metadata describing a practice track. This registry is the single source of
 * truth that drives navigation, list/solve pages, input mode, and AI prompt
 * selection. To add a new track: add a `TrackKey` in schema.prisma, a content
 * file (content/README.md), and one entry here.
 */
export interface TrackConfig {
  key: TrackKey;
  /** URL segment, e.g. /practice/dsa */
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  inputMode: InputMode;
  inputLabel: string;
  ctaLabel: string;
  icon: LucideIcon;
  /** Tailwind text-color class used for accents. */
  accent: string;
}

export const TRACKS: Record<TrackKey, TrackConfig> = {
  DSA: {
    key: "DSA",
    slug: "dsa",
    title: "Data Structures & Algorithms",
    shortTitle: "DSA",
    description:
      "Sharpen problem-solving with curated coding problems. Paste your solution and get AI feedback on correctness, complexity, and edge cases.",
    inputMode: "code",
    inputLabel: "Your solution",
    ctaLabel: "Get AI Review",
    icon: Code2,
    accent: "text-sky-500",
  },
  SYSTEM_DESIGN: {
    key: "SYSTEM_DESIGN",
    slug: "system-design",
    title: "System Design (HLD)",
    shortTitle: "System Design",
    description:
      "Practice high-level design. Sketch your architecture in text and get feedback on components, scalability, and trade-offs.",
    inputMode: "text",
    inputLabel: "Your design",
    ctaLabel: "Get AI Review",
    icon: Network,
    accent: "text-violet-500",
  },
  LLD: {
    key: "LLD",
    slug: "lld",
    title: "Low-Level Design (LLD)",
    shortTitle: "LLD",
    description:
      "Object-oriented design and design patterns. Describe your class model and get feedback on SOLID principles and extensibility.",
    inputMode: "text",
    inputLabel: "Your design",
    ctaLabel: "Get AI Review",
    icon: Boxes,
    accent: "text-emerald-500",
  },
  BEHAVIORAL: {
    key: "BEHAVIORAL",
    slug: "behavioral",
    title: "Behavioral",
    shortTitle: "Behavioral",
    description:
      "Craft strong STAR-format answers. Write your response and get feedback on structure, ownership, and impact.",
    inputMode: "text",
    inputLabel: "Your answer",
    ctaLabel: "Get AI Feedback",
    icon: MessagesSquare,
    accent: "text-amber-500",
  },
};

export const TRACK_LIST: TrackConfig[] = Object.values(TRACKS);

export function trackBySlug(slug: string): TrackConfig | undefined {
  return TRACK_LIST.find((t) => t.slug === slug);
}

export function trackByKey(key: TrackKey): TrackConfig {
  return TRACKS[key];
}
