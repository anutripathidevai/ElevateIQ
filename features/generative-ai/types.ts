import type { AccentKey } from "@/lib/navigation";
import type {
  SDArchitecture,
  SDDifficulty,
  SDFlashcard,
  SDFrequency,
  SDQuizItem,
  SDReference,
  SDStatus,
} from "@/features/system-design/types";

/**
 * Content model for the AI System Design learning module (Learning → AI System
 * Design).
 *
 * Like the System Design (HLD) and DSA modules, this feature is entirely
 * metadata-driven: a registry/catalog of lesson metadata (see `registry.ts`)
 * powers the dashboard, filters and learning path, and each *published* lesson
 * maps to a typed `GenAILessonContent` object holding the authored sections.
 * Adding a new lesson means authoring data (a catalog entry + a content file)
 * — never touching routing or UI. The dynamic `[lesson]` route renders any
 * lesson that conforms to this model.
 *
 * The interactive architecture diagram, quiz, flashcard and reference shapes
 * are re-used verbatim from the System Design module so the two modules share
 * the same battle-tested renderers. Nothing here imports React or icons, so the
 * content stays serialisable and can later be sourced from a database or CMS
 * without changing the model.
 */

// Re-export the shared primitives so content files import everything from one
// place and the two modules never drift apart.
export type {
  SDArchitecture as GenAIArchitecture,
  SDArchNode as GenAIArchNode,
  SDArchEdge as GenAIArchEdge,
  SDNodeKind as GenAINodeKind,
  SDQuizItem as GenAIQuizItem,
  SDFlashcard as GenAIFlashcard,
  SDReference as GenAIReference,
} from "@/features/system-design/types";

// ---- Enumerations ----------------------------------------------------------

/** Difficulty band shown on cards and used for filtering. */
export type GenAIDifficulty = SDDifficulty;

/** Publish state. Only lessons with authored content are "published". */
export type GenAIStatus = SDStatus;

/** How often the topic shows up in real AI interviews (a soft ranking signal). */
export type GenAIFrequency = SDFrequency;

/** Topic domains used for the topic filter (the AI-specific vocabulary). */
export type GenAITopic =
  | "LLM Fundamentals"
  | "Prompt Engineering"
  | "RAG"
  | "Embeddings"
  | "Vector Databases"
  | "AI Agents"
  | "Model Serving"
  | "Fine-Tuning"
  | "AI Infrastructure"
  | "AI Evaluation"
  | "AI Security"
  | "AI Observability"
  | "Multi-Agent Systems";

/** Companies used for the company filter (AI labs + AI-heavy orgs). */
export type GenAICompany =
  | "OpenAI"
  | "Anthropic"
  | "Google DeepMind"
  | "Meta"
  | "Microsoft"
  | "Amazon"
  | "NVIDIA"
  | "Databricks"
  | "Cohere"
  | "Perplexity";

/** Learning-path tier ids (the coloured sections on the dashboard). */
export type GenAITierId =
  | "l1-foundations"
  | "l2-working-with-llms"
  | "l3-rag"
  | "l4-vector-databases"
  | "l5-agents"
  | "l6-ai-system-design"
  | "l7-production-ai"
  | "l8-advanced-ai"
  | "l9-interview-prep"
  | "l10-projects";

// ---- Registry / catalog ----------------------------------------------------

/**
 * Card + header metadata for a single lesson. This is the single source of
 * truth for the dashboard (search, filters, sorting, learning path) and the
 * lesson-page header. Authored content lives separately in `GenAILessonContent`
 * so metadata is never duplicated.
 */
export interface GenAILessonMeta {
  /** URL slug, e.g. "design-chatgpt". */
  slug: string;
  /** Display name, e.g. "Design ChatGPT". */
  title: string;
  /** One-line positioning shown on the card. */
  summary: string;
  /** Owning learning-path tier. */
  tier: GenAITierId;
  difficulty: GenAIDifficulty;
  topics: GenAITopic[];
  companies: GenAICompany[];
  /** Free-form search / filter tags. */
  tags: string[];
  /** Popularity score 0–100, drives the "Most Popular" sort. */
  popularity: number;
  /** Interview frequency band, drives the "Interview Frequency" sort. */
  frequency: GenAIFrequency;
  /** Estimated interview / study time in minutes. */
  estimatedMinutes: number;
  /** Monotonic authoring order, drives the "Newest" sort (higher = newer). */
  addedOrder: number;
  status: GenAIStatus;
}

/** Presentation metadata for a learning-path tier. */
export interface GenAITierMeta {
  id: GenAITierId;
  /** e.g. "AI & LLM Foundations". */
  label: string;
  /** Short emoji shown before the label. */
  emoji: string;
  accent: AccentKey;
  /** One-line description of what this tier covers. */
  description: string;
  /** 1-based display order. */
  order: number;
}

// ---- Section building blocks -----------------------------------------------

/** A labelled block of prose (Theory concept, Deep Dive topic, …). */
export interface GenAINamedDetail {
  label: string;
  detailMD: string;
}

/** One numbered step in the request/data-flow walkthrough. */
export interface GenAIFlowStep {
  step: string;
  detailMD: string;
}

/** A syntax-highlighted code sample (rendered in a labelled code block). */
export interface GenAICodeSample {
  language: string;
  /** Optional caption above the block. */
  label?: string;
  body: string;
}

/** A hands-on example — prose plus an optional code sample. */
export interface GenAIHandsOn {
  title: string;
  detailMD: string;
  code?: GenAICodeSample;
}

/** An illustrative prompt/parameter "playground" (static, no live model call). */
export interface GenAIPlayground {
  descriptionMD: string;
  systemPrompt?: string;
  userPrompt?: string;
  parameters: { name: string; value: string; note?: string }[];
  sampleOutputMD?: string;
}

/** A comparison table for the Visual Learning section. */
export interface GenAIComparison {
  title: string;
  columns: string[];
  /** Each row must have the same arity as `columns`. */
  rows: string[][];
}

/** A named alternative design considered in the Interview Perspective. */
export interface GenAIAlternative {
  name: string;
  detailMD: string;
}

/** The Interview Perspective block. */
export interface GenAIInterviewPerspective {
  whatInterviewersLookFor: string[];
  followUps: { question: string; answerMD: string }[];
  alternativeDesigns: GenAIAlternative[];
  commonMistakes: string[];
}

// ---- Lesson content (the authored sections) --------------------------------

/**
 * The authored body of a lesson. The header (title, meta, companies) comes from
 * `GenAILessonMeta`; everything below is the teaching content. Optional sections
 * render only when the content provides them, so concept lessons can omit the
 * architecture diagram while full "Design X" lessons include everything.
 */
export interface GenAILessonContent {
  /** Must equal the catalog slug — enforced by the content test. */
  slug: string;

  /** 1 — Introduction. */
  introductionMD: string;
  /** Real-world applications / where this shows up in production. */
  realWorldMD: string;

  /** 2 — Learning objectives. */
  learningObjectives: string[];

  /** 3 — Theory & core concepts (with visual explanations in prose). */
  theory: GenAINamedDetail[];

  /** 4 — Architecture diagram (interactive, pan/zoom, fullscreen). */
  architecture?: SDArchitecture;
  architectureNotesMD?: string;

  /** 5 — Request / data flow. */
  requestFlow: GenAIFlowStep[];

  /** 6 — Deep dives (tradeoffs, latency, cost, caching, context, …). */
  deepDives: GenAINamedDetail[];

  /** 7 — Production considerations (monitoring, retries, fallback, cost, …). */
  productionConsiderations: GenAINamedDetail[];

  /** 8 — Interview perspective. */
  interview: GenAIInterviewPerspective;

  /** Progressive hints revealed one at a time in Interview Mode. */
  interviewHints: string[];

  /** 9 — Interactive playground (illustrative prompt + parameters). */
  playground?: GenAIPlayground;

  /** 10 — Visual learning: comparison tables + an optional decision guide. */
  comparisons: GenAIComparison[];
  decisionGuideMD?: string;

  /** 11 — Hands-on examples. */
  handsOn: GenAIHandsOn[];

  /** 12 — Quiz. */
  quiz: SDQuizItem[];

  /** 13 — Flashcards. */
  flashcards: SDFlashcard[];

  /** 14 — Cheat sheet (Markdown). */
  cheatSheetMD: string;

  /** 15 — References. */
  references: SDReference[];

  /** Cross-links to other lessons (validated against the catalog). */
  relatedLessons: { slug: string; note?: string }[];
}

/** A fully-assembled lesson: metadata + authored content. */
export interface GenAILesson {
  meta: GenAILessonMeta;
  content: GenAILessonContent;
}
