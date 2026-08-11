import type { AccentKey } from "@/lib/navigation";

/**
 * Content model for the Cloud, DevOps & Production Engineering track
 * (Learning → Cloud & DevOps).
 *
 * Like every other learning module (DSA, System Design, LLD, Generative AI),
 * this feature is entirely metadata-driven: a registry of module metadata (see
 * `registry.ts`) powers the landing page and navigation, and each *published*
 * module maps to a typed `CDModuleContent` object holding the authored
 * sections. A separate, flat `CDQuestion` bank holds the 50 senior-level
 * interview questions. Adding a module or a question is a pure data change — no
 * routing or UI edits.
 *
 * Nothing here imports React or icons, so the content stays serialisable and
 * could later be sourced from a database or CMS without changing the model.
 *
 * House style (enforced by the content test): prose/markdown/diagram fields use
 * plain text and **bold** — never backticks or dollar-brace interpolation —
 * because content is authored inside template literals.
 */

// ---- Enumerations ----------------------------------------------------------

/** Seniority band a module/question targets. This is not a beginner course. */
export type CDDifficulty = "Senior" | "Staff" | "Architect";

/** Publish state. Only modules with authored content are "published". */
export type CDStatus = "published" | "coming-soon";

/** The eight interview areas the 50-question bank is distributed across. */
export type CDArea =
  | "Git & CI/CD"
  | "Jenkins & Deployment"
  | "Docker & Kubernetes"
  | "Azure & Infrastructure"
  | "APIs & WebJobs"
  | "Kafka"
  | "Observability"
  | "Production Troubleshooting";

// ---- Registry / catalog ----------------------------------------------------

/**
 * Card + header metadata for a single module. Single source of truth for the
 * landing page and navigation. Authored content lives separately in
 * `CDModuleContent` so metadata is never duplicated.
 */
export interface CDModuleMeta {
  /** URL slug, e.g. "docker-kubernetes". */
  slug: string;
  /** 1-based module number (Module 1 … Module 8). */
  order: number;
  /** Display title, e.g. "Docker & Kubernetes". */
  title: string;
  /** One-line positioning shown on the card. */
  summary: string;
  /** Core topics shown as chips on the card and module header. */
  topics: string[];
  /** Estimated study time in minutes. */
  estimatedMinutes: number;
  /** Accent used for this module's chip/hero tint. */
  accent: AccentKey;
  status: CDStatus;
}

// ---- Section building blocks -----------------------------------------------

/**
 * A simple text diagram (flow / architecture). Rendered verbatim inside a
 * monospace block — NOT through Markdown — so it never needs code fences or
 * backticks. Use arrows and indentation, e.g. "Code -> Git -> Build".
 */
export interface CDDiagram {
  /** Optional caption shown above the block. */
  title?: string;
  /** The pre-formatted diagram body (newlines preserved). */
  body: string;
}

/**
 * One teaching concept inside a module. Follows the house content structure:
 * What is it? / How does it work? / What matters in interviews? / Real-world
 * example. Keep every field short and crisp.
 */
export interface CDConcept {
  /** Stable anchor id for the "On this page" table of contents. */
  id: string;
  /** Concept title, e.g. "Readiness vs Liveness probes". */
  title: string;
  /** What is it? — 2–4 plain sentences (Markdown). */
  whatMD: string;
  /** How does it work? — short prose (Markdown), optional. */
  howMD?: string;
  /** One simple flow/architecture diagram, optional. */
  diagram?: CDDiagram;
  /** What matters in interviews? — 3–6 crisp bullets. */
  interviewPoints: string[];
  /** One practical production example (Markdown), optional. */
  realWorldMD?: string;
  /** One or more senior-level interview questions this concept unlocks. */
  interviewQuestions?: string[];
}

/**
 * A production-incident scenario (Module 7). Concise and framework-driven:
 * Symptoms → What to check → Possible causes → Resolution → Prevention.
 */
export interface CDScenario {
  id: string;
  title: string;
  symptomsMD: string;
  whatToCheck: string[];
  possibleCauses: string[];
  resolutionMD: string;
  preventionMD: string;
}

// ---- Module content (the authored sections) --------------------------------

/**
 * The authored body of a module. The header (title, summary, topics) comes from
 * `CDModuleMeta`; everything below is the teaching content. Optional sections
 * render only when provided, so a concept-only module can omit scenarios while
 * the Production Troubleshooting module includes them.
 */
export interface CDModuleContent {
  /** Must equal the registry slug — enforced by the content test. */
  slug: string;
  /** Short module introduction (Markdown). */
  introMD: string;
  /** The module's core flow diagram (optional). */
  coreFlow?: CDDiagram;
  /** Senior-level focus — what a senior engineer is expected to own. */
  seniorFocus: string[];
  /** The teaching concepts, in reading order. */
  concepts: CDConcept[];
  /** Production-incident scenarios (used by Module 7). */
  scenarios?: CDScenario[];
  /** Crisp closing takeaways. */
  keyTakeaways: string[];
  /** Ids of related questions in the 50-question bank (validated by the test). */
  relatedQuestionIds?: string[];
}

/** A fully-assembled module: metadata + authored content. */
export interface CDModule {
  meta: CDModuleMeta;
  content: CDModuleContent;
}

// ---- Interview question bank ------------------------------------------------

/**
 * A single senior-level, scenario-driven interview question. Designed to be
 * reviewable in ~3–5 minutes: a strong-but-concise answer, key points, and
 * realistic follow-ups. Answers test reasoning, not memorisation.
 */
export interface CDQuestion {
  /** Stable id, e.g. "k8s-503-debug". */
  id: string;
  area: CDArea;
  difficulty: CDDifficulty;
  /** The question prompt. */
  question: string;
  /** What the interviewer is testing — 2–4 bullets. */
  tests: string[];
  /** A concise but technically deep model answer (Markdown). */
  strongAnswerMD: string;
  /** Key points a strong candidate hits — 5–8 bullets. */
  keyPoints: string[];
  /** 1–2 realistic interviewer follow-ups. */
  followUps: string[];
  /** Free-form search/filter tags. */
  tags: string[];
}
