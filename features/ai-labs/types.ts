import type { AccentKey } from "@/lib/navigation";

/**
 * Content model for the AI Labs module — an interactive, run-it-in-the-browser
 * platform for learning how modern AI applications work (LLMs → RAG → Agents →
 * Production AI).
 *
 * Like every other learning feature in Compile Ready, AI Labs is metadata-driven:
 * a registry of lab metadata (see `registry.ts`) powers the landing page and
 * navigation, and each *published* lab maps to a typed `LabContent` object that
 * holds the authored sections (overview, architecture, execution notes, learn,
 * challenge, interview questions). The live demo for a lab is selected by a
 * serialisable `demo` key that the UI resolves to a real interactive component.
 *
 * Nothing here imports React, so the content stays serialisable and can be
 * passed from a Server Component straight into the client lab shell.
 */

// ---- Enumerations ----------------------------------------------------------

export type LabDifficulty = "Beginner" | "Intermediate" | "Advanced";

/** Publish state. Only labs with authored content + a wired demo are published. */
export type LabStatus = "published" | "coming-soon";

/** Free vs premium positioning shown as a badge on the card. */
export type LabTier = "free" | "premium";

/**
 * Identifies which interactive demo component the Run Demo tab renders. Kept as
 * a string union (not a component ref) so lab content stays serialisable; the
 * client shell maps the key to a real component.
 */
export type LabDemoKey =
  | "llm-playground"
  | "structured-output"
  | "semantic-search"
  | "rag-pipeline"
  | "skill-builder"
  | "tool-calling"
  | "ai-agent"
  | "ai-memory"
  | "multi-agent"
  | "ai-evaluation"
  | "ai-guardrails"
  | "production-ai";

/** The seven tabs every lab page exposes. */
export type LabTab =
  | "overview"
  | "architecture"
  | "demo"
  | "trace"
  | "learn"
  | "challenge"
  | "interview";

// ---- Registry / catalog ----------------------------------------------------

/**
 * Card + header metadata for a single lab. Single source of truth for the
 * landing roadmap and navigation. Authored content lives separately in
 * `LabContent`, so metadata is never duplicated.
 */
export interface LabMeta {
  /** URL slug, e.g. "llm-playground". */
  slug: string;
  /** 1-based lab number (Lab 1 … Lab 12), also the roadmap order. */
  order: number;
  /** Display title, e.g. "LLM Playground". */
  title: string;
  /** One-line positioning shown on the card. */
  summary: string;
  /** Concepts covered, shown as chips on the card and lab header. */
  concepts: string[];
  /** Estimated completion time in minutes. */
  estimatedMinutes: number;
  difficulty: LabDifficulty;
  tier: LabTier;
  /** Lucide icon name, resolved to a component in the card (keeps types icon-free). */
  icon: string;
  accent: AccentKey;
  status: LabStatus;
}

// ---- Section building blocks -----------------------------------------------

/**
 * One node in a lab's architecture diagram. Every node is clickable and reveals
 * what it does, why it exists, its I/O, a common failure, and an interview
 * question — so the diagram doubles as a study aid.
 */
export interface LabArchitectureNode {
  /** Stable id (diagram anchor / click target). Unique within a lab. */
  id: string;
  label: string;
  /** What it does. */
  whatMD: string;
  /** Why it is needed. */
  whyMD: string;
  input: string;
  output: string;
  commonFailure: string;
  interviewQuestion: string;
}

/** A senior-level interview question tied to the lab's topic. */
export interface LabInterviewQuestion {
  id: string;
  question: string;
  difficulty: LabDifficulty;
  answerMD: string;
  keyPoints: string[];
  followUps: string[];
}

/** A small engineering challenge the user attempts after running the demo. */
export interface LabChallenge {
  promptMD: string;
  hints: string[];
  expectedApproachMD: string;
}

/**
 * The authored body of a lab. The header (title, concepts, difficulty) comes
 * from `LabMeta`; everything here is teaching content plus the `demo` key that
 * selects the interactive component.
 */
export interface LabContent {
  /** Must equal the registry slug — enforced by the registry test. */
  slug: string;
  /** What it is / why it exists / where it is used / what you'll build (Markdown). */
  overviewMD: string;
  /** Concrete bullets of what the user will build/experience. */
  whatYouBuild: string[];
  architecture: {
    title?: string;
    /** Plain-text flow rendered in a monospace block (no backticks needed). */
    flow: string;
    nodes: LabArchitectureNode[];
  };
  /** Which interactive demo to render in the Run Demo tab. */
  demo: LabDemoKey;
  /** Explains what the Execution Trace shows and why it matters (Markdown). */
  executionMD: string;
  /** Deeper explanation for the Learn tab (Markdown). */
  learnMD: string;
  challenge: LabChallenge;
  interviewQuestions: LabInterviewQuestion[];
}

/** A fully-assembled lab: metadata + authored content. */
export interface Lab {
  meta: LabMeta;
  content: LabContent;
}
