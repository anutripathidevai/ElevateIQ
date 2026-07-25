import type { AccentKey } from "@/lib/navigation";

/**
 * Shared content model for the System Design (HLD) learning module (Learning →
 * System Design).
 *
 * Like the DSA hub, this module is metadata-driven: a registry/catalog of
 * question metadata (see `registry.ts`) powers the dashboard, filters and
 * learning path, and each *published* question maps to a typed
 * `SDQuestionContent` object holding the 25 authored sections. Adding a new
 * System Design question means authoring data (a catalog entry + a content
 * file) — never touching routing or UI. The dynamic `[question]` route renders
 * any question that conforms to this model.
 *
 * Nothing here imports React or icons, so the content stays serialisable and
 * can later be sourced from a database or CMS without changing the model.
 */

// ---- Enumerations ----------------------------------------------------------

/** Difficulty band shown on cards and used for filtering. */
export type SDDifficulty = "Beginner" | "Intermediate" | "Advanced";

/** Publish state. Only questions with authored content are "published". */
export type SDStatus = "published" | "coming-soon";

/** How often the question shows up in real interviews (a soft ranking signal). */
export type SDFrequency = "Very High" | "High" | "Medium" | "Low";

/** Problem domains used for the category filter. */
export type SDCategory =
  | "Storage"
  | "Messaging"
  | "Social Media"
  | "AI"
  | "Distributed Systems"
  | "Infrastructure"
  | "Video"
  | "Search"
  | "E-Commerce"
  | "Maps"
  | "Monitoring"
  | "Payments"
  | "Scheduling";

/** Companies used for the company filter. */
export type SDCompany =
  | "Google"
  | "Meta"
  | "Amazon"
  | "Microsoft"
  | "Netflix"
  | "Uber"
  | "Airbnb"
  | "Stripe"
  | "Databricks"
  | "OpenAI"
  | "Snowflake"
  | "LinkedIn";

/** Learning-path tier ids (the coloured sections on the dashboard). */
export type SDTierId =
  | "foundations"
  | "common"
  | "advanced"
  | "staff"
  | "ai";

// ---- Registry / catalog ----------------------------------------------------

/**
 * Card + header metadata for a single question. This is the single source of
 * truth for the dashboard (search, filters, sorting, learning path) and the
 * question-page header. Authored content lives separately in `SDQuestionContent`
 * so metadata is never duplicated.
 */
export interface SDQuestionMeta {
  /** URL slug, e.g. "url-shortener". */
  slug: string;
  /** Display name, e.g. "URL Shortener". */
  title: string;
  /** One-line positioning shown on the card. */
  summary: string;
  /** Owning learning-path tier. */
  tier: SDTierId;
  difficulty: SDDifficulty;
  categories: SDCategory[];
  companies: SDCompany[];
  /** Free-form search / filter tags. */
  tags: string[];
  /** Popularity score 0–100, drives the "Most Popular" sort. */
  popularity: number;
  /** Interview frequency band, drives the "Interview Frequency" sort. */
  frequency: SDFrequency;
  /** Estimated interview / study time in minutes. */
  estimatedMinutes: number;
  /** Monotonic authoring order, drives the "Newest" sort (higher = newer). */
  addedOrder: number;
  status: SDStatus;
}

/** Presentation metadata for a learning-path tier. */
export interface SDTierMeta {
  id: SDTierId;
  /** e.g. "Foundations". */
  label: string;
  /** Short emoji shown before the label (matches the source brief). */
  emoji: string;
  accent: AccentKey;
  /** One-line description of what this tier covers. */
  description: string;
  /** 1-based display order. */
  order: number;
}

// ---- Architecture diagram (interactive, pan + zoom) ------------------------

/**
 * Node kind → drives colour + icon in the diagram renderer. Kept as a small
 * closed vocabulary so every question's diagram is visually consistent.
 */
export type SDNodeKind =
  | "client"
  | "cdn"
  | "loadBalancer"
  | "gateway"
  | "service"
  | "worker"
  | "cache"
  | "database"
  | "queue"
  | "storage"
  | "search"
  | "monitoring"
  | "analytics"
  | "external";

/** A positioned box in the high-level architecture diagram. */
export interface SDArchNode {
  id: string;
  label: string;
  kind: SDNodeKind;
  /** Grid/logical coordinates (unitless); the renderer scales them to pixels. */
  x: number;
  y: number;
  /** Optional short sublabel, e.g. "Redis". */
  sublabel?: string;
}

/** A directed connection between two nodes. */
export interface SDArchEdge {
  from: string;
  to: string;
  /** Optional edge label, e.g. "read-through". */
  label?: string;
  /** Render as a dashed line (e.g. async / best-effort). */
  dashed?: boolean;
}

/** A full interactive architecture diagram, authored as data. */
export interface SDArchitecture {
  nodes: SDArchNode[];
  edges: SDArchEdge[];
  /** Logical canvas size; defaults are applied by the renderer when omitted. */
  width?: number;
  height?: number;
  /** Optional caption / legend note (Markdown). */
  captionMD?: string;
}

// ---- Section building blocks -----------------------------------------------

/** A labelled non-functional requirement (Latency, Availability, …). */
export interface SDNamedDetail {
  label: string;
  detailMD: string;
}

/** A single capacity metric row (e.g. QPS, Storage/day). */
export interface SDCapacityMetric {
  label: string;
  value: string;
  note?: string;
}

export interface SDCapacityEstimation {
  /** Assumptions the numbers are based on (Markdown). */
  assumptionsMD: string;
  metrics: SDCapacityMetric[];
  /** Worked calculations behind the metrics (Markdown). */
  calculationsMD: string;
}

/** One REST endpoint in the API design. */
export interface SDApiEndpoint {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  descriptionMD: string;
  /** Example request payload / query (plain text, rendered in a code block). */
  request?: string;
  /** Example response payload (plain text, rendered in a code block). */
  response?: string;
  statusCodes?: { code: number; meaning: string }[];
}

export interface SDApiDesign {
  endpoints: SDApiEndpoint[];
  notesMD?: string;
}

/** One column of a relational table. */
export interface SDTableColumn {
  name: string;
  type: string;
  note?: string;
}

/** One relational table in the database design. */
export interface SDTable {
  name: string;
  columns: SDTableColumn[];
}

export interface SDDatabaseDesign {
  schemaMD: string;
  tables: SDTable[];
  indexesMD?: string;
  relationshipsMD?: string;
  noSqlAlternativesMD?: string;
}

/** A numbered request-flow step. */
export interface SDFlowStep {
  title: string;
  detailMD: string;
}

/** A core component explanation. */
export interface SDComponent {
  name: string;
  /** Node kind for its icon/colour (reuses the diagram vocabulary). */
  kind: SDNodeKind;
  /** One-line role. */
  role: string;
  detailMD: string;
}

/** A deep-dive topic (caching, sharding, consistency, …). */
export interface SDDeepDive {
  topic: string;
  detailMD: string;
}

/** How the system evolves at a given scale stage. */
export interface SDScalingStage {
  /** e.g. "1K users", "10M users". */
  stage: string;
  detailMD: string;
}

/** A bottleneck and its optimization. */
export interface SDBottleneck {
  issue: string;
  optimizationMD: string;
}

/** A failure scenario and the recovery strategy. */
export interface SDFailureCase {
  scenario: string;
  strategyMD: string;
}

/** Tradeoffs summary. */
export interface SDTradeoffs {
  pros: string[];
  cons: string[];
  alternativesMD: string;
  whenNotToUseMD: string;
}

/** A common interviewer follow-up and its answer. */
export interface SDFollowUp {
  question: string;
  answerMD: string;
}

/** How a specific company tends to frame the question. */
export interface SDCompanyVariation {
  company: SDCompany;
  angleMD: string;
}

/** An internal link to a related question (must be a slug in the catalog). */
export interface SDRelated {
  slug: string;
  note?: string;
}

/** Interview guidance block. */
export interface SDInterviewTips {
  commonMistakes: string[];
  redFlags: string[];
  expectations: string[];
  communicationMD: string;
}

/** A revision flashcard. */
export interface SDFlashcard {
  front: string;
  back: string;
}

/** A quiz multiple-choice question. */
export interface SDQuizItem {
  question: string;
  options: string[];
  /** 0-based index into `options` of the correct answer. */
  answerIndex: number;
  explanationMD?: string;
}

/** A reference resource. */
export interface SDReference {
  title: string;
  kind: "Book" | "Blog" | "Paper" | "Docs";
  url?: string;
  author?: string;
}

// ---- Question content (the 25 sections) ------------------------------------

/**
 * The authored body of a question — sections 2–25 (section 1, the header, is
 * derived from `SDQuestionMeta`). Most fields are optional so a question can be
 * authored incrementally; the renderer shows only the sections that are present.
 * Fully-authored exemplars populate every field.
 */
export interface SDQuestionContent {
  /** Must equal the catalog slug this content belongs to. */
  slug: string;

  // 2 — Problem statement
  statementMD: string;
  businessUseCaseMD: string;

  // 3 — Functional requirements
  functionalRequirements: string[];

  // 4 — Non-functional requirements
  nonFunctionalRequirements: SDNamedDetail[];

  // 5 — Capacity estimation
  capacityEstimation: SDCapacityEstimation;

  // 6 — API design
  apiDesign: SDApiDesign;

  // 7 — Database design
  databaseDesign: SDDatabaseDesign;

  // 8 — High-level architecture (interactive diagram)
  architecture: SDArchitecture;
  architectureNotesMD?: string;

  // 9 — Request flow
  requestFlow: SDFlowStep[];

  // 10 — Core components
  coreComponents: SDComponent[];

  // 11 — Deep dive
  deepDives: SDDeepDive[];

  // 12 — Scaling
  scaling: SDScalingStage[];

  // 13 — Bottlenecks
  bottlenecks: SDBottleneck[];

  // 14 — Failure handling
  failureHandling: SDFailureCase[];

  // 15 — Security
  security: SDNamedDetail[];

  // 16 — Tradeoffs
  tradeoffs: SDTradeoffs;

  // 17 — Follow-up questions
  followUpQuestions: SDFollowUp[];

  // 18 — Company variations
  companyVariations: SDCompanyVariation[];

  // 19 — Related questions
  relatedQuestions: SDRelated[];

  // 20 — Interview tips
  interviewTips: SDInterviewTips;

  // 21 — Revision notes
  revisionNotesMD: string;

  // 22 — Flashcards
  flashcards: SDFlashcard[];

  // 23 — Quiz
  quiz: SDQuizItem[];

  // 24 — Cheat sheet
  cheatSheetMD: string;

  // 25 — References
  references: SDReference[];
}

/** A fully-assembled question: catalog metadata + authored content. */
export interface SDQuestion {
  meta: SDQuestionMeta;
  content: SDQuestionContent;
}
