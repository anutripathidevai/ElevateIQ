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
 * maps to a typed `AISDLessonContent` object holding the authored sections.
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
  SDArchitecture as AISDArchitecture,
  SDArchNode as AISDArchNode,
  SDArchEdge as AISDArchEdge,
  SDNodeKind as AISDNodeKind,
  SDQuizItem as AISDQuizItem,
  SDFlashcard as AISDFlashcard,
  SDReference as AISDReference,
} from "@/features/system-design/types";

// ---- Enumerations ----------------------------------------------------------

/** Difficulty band shown on cards and used for filtering. */
export type AISDDifficulty = SDDifficulty;

/** Publish state. Only lessons with authored content are "published". */
export type AISDStatus = SDStatus;

/** How often the topic shows up in real AI interviews (a soft ranking signal). */
export type AISDFrequency = SDFrequency;

/** Topic domains used for the topic filter (the AI-specific vocabulary). */
export type AISDTopic =
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
export type AISDCompany =
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
export type AISDTierId =
  | "ai-foundations"
  | "llm-applications"
  | "rag-systems"
  | "vector-search"
  | "ai-agents"
  | "model-serving"
  | "ai-infrastructure"
  | "ai-safety"
  | "production-ai"
  | "ai-interview-problems";

// ---- Registry / catalog ----------------------------------------------------

/**
 * Card + header metadata for a single lesson. This is the single source of
 * truth for the dashboard (search, filters, sorting, learning path) and the
 * lesson-page header. Authored content lives separately in `AISDLessonContent`
 * so metadata is never duplicated.
 */
export interface AISDLessonMeta {
  /** URL slug, e.g. "design-chatgpt". */
  slug: string;
  /** Display name, e.g. "Design ChatGPT". */
  title: string;
  /** One-line positioning shown on the card. */
  summary: string;
  /** Owning learning-path tier. */
  tier: AISDTierId;
  difficulty: AISDDifficulty;
  topics: AISDTopic[];
  companies: AISDCompany[];
  /** Free-form search / filter tags. */
  tags: string[];
  /** Popularity score 0–100, drives the "Most Popular" sort. */
  popularity: number;
  /** Interview frequency band, drives the "Interview Frequency" sort. */
  frequency: AISDFrequency;
  /** Estimated interview / study time in minutes. */
  estimatedMinutes: number;
  /** Monotonic authoring order, drives the "Newest" sort (higher = newer). */
  addedOrder: number;
  status: AISDStatus;
}

/** Presentation metadata for a learning-path tier. */
export interface AISDTierMeta {
  id: AISDTierId;
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
export interface AISDNamedDetail {
  label: string;
  detailMD: string;
}

/** One numbered step in the request/data-flow walkthrough. */
export interface AISDFlowStep {
  step: string;
  detailMD: string;
}

/** A syntax-highlighted code sample (rendered in a labelled code block). */
export interface AISDCodeSample {
  language: string;
  /** Optional caption above the block. */
  label?: string;
  body: string;
}

/** A hands-on example — prose plus an optional code sample. */
export interface AISDHandsOn {
  title: string;
  detailMD: string;
  code?: AISDCodeSample;
}

/** An illustrative prompt/parameter "playground" (static, no live model call). */
export interface AISDPlayground {
  descriptionMD: string;
  systemPrompt?: string;
  userPrompt?: string;
  parameters: { name: string; value: string; note?: string }[];
  sampleOutputMD?: string;
}

/** A comparison table for the Visual Learning section. */
export interface AISDComparison {
  title: string;
  columns: string[];
  /** Each row must have the same arity as `columns`. */
  rows: string[][];
}

/** A named alternative design considered in the Interview Perspective. */
export interface AISDAlternative {
  name: string;
  detailMD: string;
}

/** The Interview Perspective block. */
export interface AISDInterviewPerspective {
  whatInterviewersLookFor: string[];
  followUps: { question: string; answerMD: string }[];
  alternativeDesigns: AISDAlternative[];
  commonMistakes: string[];
}

// ---- Lesson content (the authored sections) --------------------------------

/**
 * The authored body of a lesson. The header (title, meta, companies) comes from
 * `AISDLessonMeta`; everything below is the teaching content. Optional sections
 * render only when the content provides them, so concept lessons can omit the
 * architecture diagram while full "Design X" lessons include everything.
 */
export interface AISDLessonContent {
  /** Must equal the catalog slug — enforced by the content test. */
  slug: string;

  /** 1 — Introduction. */
  introductionMD: string;
  /** Real-world applications / where this shows up in production. */
  realWorldMD: string;

  /** 2 — Learning objectives. */
  learningObjectives: string[];

  /** 3 — Theory & core concepts (with visual explanations in prose). */
  theory: AISDNamedDetail[];

  /** 4 — Architecture diagram (interactive, pan/zoom, fullscreen). */
  architecture?: SDArchitecture;
  architectureNotesMD?: string;

  /** 5 — Request / data flow. */
  requestFlow: AISDFlowStep[];

  /** 6 — Deep dives (tradeoffs, latency, cost, caching, context, …). */
  deepDives: AISDNamedDetail[];

  /** 7 — Production considerations (monitoring, retries, fallback, cost, …). */
  productionConsiderations: AISDNamedDetail[];

  /** 8 — Interview perspective. */
  interview: AISDInterviewPerspective;

  /** Progressive hints revealed one at a time in Interview Mode. */
  interviewHints: string[];

  /** 9 — Interactive playground (illustrative prompt + parameters). */
  playground?: AISDPlayground;

  /** 10 — Visual learning: comparison tables + an optional decision guide. */
  comparisons: AISDComparison[];
  decisionGuideMD?: string;

  /** 11 — Hands-on examples. */
  handsOn: AISDHandsOn[];

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
export interface AISDLesson {
  meta: AISDLessonMeta;
  content: AISDLessonContent;
}
