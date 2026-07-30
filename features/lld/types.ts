import type { AccentKey } from "@/lib/navigation";
import type { SolutionFile } from "@/lib/lld/types";
import type { Complexity, DryRun } from "@/features/graph-algorithms/types";

/**
 * Shared content model for the Low Level Design (LLD) learning module
 * (Learning → Low Level Design).
 *
 * Like the System Design (HLD) hub, this module is metadata-driven: a
 * registry/catalog of problem + concept metadata (see `registry.ts`) powers the
 * dashboard, filters and roadmap, and each *published* entry maps to a typed
 * content object — `LLDProblemContent` (a full ~20-section design walkthrough)
 * or `LLDConceptContent` (a lighter theory lesson for OOP/SOLID/patterns/…).
 *
 * Adding a new LLD problem or concept means authoring data (a catalog entry + a
 * content file) — never touching routing or UI. The dynamic `[problem]` route
 * renders any entry that conforms to this model.
 *
 * Nothing here imports React or icons, so content stays serialisable and can
 * later be sourced from a database or CMS without changing the model. We reuse
 * `SolutionFile` (the Monaco multi-file viewer shape) and the `Complexity` /
 * `DryRun` shapes from existing modules so authored data drops straight into the
 * proven renderers.
 */

// ---- Enumerations ----------------------------------------------------------

/** Difficulty band shown on cards and used for filtering. */
export type LLDDifficulty = "Beginner" | "Intermediate" | "Advanced" | "Expert";

/** Publish state. Only entries with authored content are "published". */
export type LLDStatus = "published" | "coming-soon";

/** How often the problem shows up in real interviews (a soft ranking signal). */
export type LLDFrequency = "Very High" | "High" | "Medium" | "Low";

/**
 * Whether an entry is a full design problem or a theory concept. Drives which
 * renderer the `[problem]` route uses (ProblemView vs ConceptView).
 */
export type LLDKind = "problem" | "concept";

/** Problem domains used for the category filter (matches the source brief). */
export type LLDCategory =
  | "Concepts"
  | "Core Systems"
  | "Games"
  | "Real-world Systems"
  | "Advanced Systems"
  | "Expert Systems";

/** Companies used for the company filter. */
export type LLDCompany =
  | "Google"
  | "Meta"
  | "Amazon"
  | "Microsoft"
  | "Netflix"
  | "Uber"
  | "Airbnb"
  | "Atlassian"
  | "Flipkart"
  | "Swiggy"
  | "Oracle"
  | "Adobe"
  | "PayPal"
  | "LinkedIn";

/** Learning-path tier ids (the coloured sections / roadmap on the dashboard). */
export type LLDTierId =
  | "concepts"
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert";

/**
 * The classic Gang-of-Four (plus a few modern) design patterns an LLD solution
 * can showcase. Kept as a closed vocabulary so the pattern filter and badges
 * stay consistent. Free-form pattern notes still live in the content.
 */
export type LLDPattern =
  // Creational
  | "Singleton"
  | "Factory Method"
  | "Abstract Factory"
  | "Builder"
  | "Prototype"
  // Structural
  | "Adapter"
  | "Bridge"
  | "Composite"
  | "Decorator"
  | "Facade"
  | "Flyweight"
  | "Proxy"
  // Behavioral
  | "Chain of Responsibility"
  | "Command"
  | "Iterator"
  | "Mediator"
  | "Memento"
  | "Observer"
  | "State"
  | "Strategy"
  | "Template Method"
  | "Visitor"
  // Concurrency / modern
  | "Producer-Consumer"
  | "Object Pool"
  | "Dependency Injection"
  | "Repository";

// ---- Registry / catalog ----------------------------------------------------

/**
 * Card + header metadata for a single LLD entry (problem or concept). This is
 * the single source of truth for the dashboard (search, filters, sorting,
 * roadmap) and the entry-page header. Authored content lives separately in
 * `LLDProblemContent` / `LLDConceptContent` so metadata is never duplicated.
 */
export interface LLDProblemMeta {
  /** URL slug, e.g. "parking-lot". */
  slug: string;
  /** Display name, e.g. "Design a Parking Lot". */
  title: string;
  /** One-line positioning shown on the card. */
  summary: string;
  /** Problem vs concept — picks the renderer. */
  kind: LLDKind;
  /** Owning learning-path tier. */
  tier: LLDTierId;
  category: LLDCategory;
  difficulty: LLDDifficulty;
  companies: LLDCompany[];
  /** Design patterns showcased — drives the pattern filter + badges. */
  patterns: LLDPattern[];
  /** Free-form search / filter tags. */
  tags: string[];
  /** Popularity score 0–100, drives the "Most Popular" sort. */
  popularity: number;
  /** Interview frequency band, drives the "Interview Frequency" sort. */
  frequency: LLDFrequency;
  /** Estimated interview / study time in minutes. */
  estimatedMinutes: number;
  /** Monotonic authoring order, drives the "Newest" sort (higher = newer). */
  addedOrder: number;
  status: LLDStatus;
}

/** Presentation metadata for a learning-path tier. */
export interface LLDTierMeta {
  id: LLDTierId;
  /** e.g. "Beginner". */
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

/** A labelled detail (Non-functional requirement, extensibility point, …). */
export interface LLDNamedDetail {
  label: string;
  detailMD: string;
}

/** A requirement-clarification Q&A the candidate should raise up-front. */
export interface LLDClarification {
  question: string;
  answerMD: string;
}

/** A domain entity / class identified during design. */
export interface LLDEntity {
  name: string;
  responsibilityMD: string;
  /** Optional key attributes / fields, shown as chips. */
  attributes?: string[];
}

/** A design pattern applied in the solution, with the rationale. */
export interface LLDPatternUse {
  /** A known pattern id, or a free-form label for modern/composite patterns. */
  name: LLDPattern | string;
  whyMD: string;
}

/** One numbered step of the step-by-step design narrative. */
export interface LLDDesignStep {
  title: string;
  detailMD: string;
  /** Optional illustrative snippet (Java) rendered in a code block. */
  code?: string;
}

/** An explanation of one class in the reference implementation. */
export interface LLDClassExplanation {
  className: string;
  detailMD: string;
}

/** One row of the per-operation complexity table. */
export interface LLDComplexityRow {
  operation: string;
  time: string;
  space: string;
  note?: string;
}

/** An alternative design the candidate could propose, with tradeoffs. */
export interface LLDAlternativeDesign {
  name: string;
  detailMD: string;
  tradeoffsMD?: string;
}

/** A common interviewer follow-up and its answer. */
export interface LLDFollowUp {
  question: string;
  answerMD: string;
}

/** A practice variant / extension the learner can attempt next. */
export interface LLDPracticeVariant {
  title: string;
  detailMD: string;
  difficulty?: LLDDifficulty;
}

/** An internal link to a related entry (must be a slug in the catalog). */
export interface LLDRelated {
  slug: string;
  note?: string;
}

/** A revision flashcard. */
export interface LLDFlashcard {
  front: string;
  back: string;
}

/** A quiz multiple-choice question. */
export interface LLDQuizItem {
  question: string;
  options: string[];
  /** 0-based index into `options` of the correct answer. */
  answerIndex: number;
  explanationMD?: string;
}

/** A reference resource. */
export interface LLDReference {
  title: string;
  kind: "Book" | "Blog" | "Paper" | "Docs" | "Video";
  url?: string;
  author?: string;
}

/** A text-based UML / sequence diagram authored as Mermaid source. */
export interface LLDDiagram {
  title: string;
  /** Mermaid diagram source (classDiagram / sequenceDiagram / stateDiagram). */
  mermaid: string;
  captionMD?: string;
}

/** A comparison / decision table (e.g. pattern A vs B). */
export interface LLDComparison {
  title: string;
  columns: string[];
  /** Each row's cell count must equal `columns.length`. */
  rows: string[][];
}

// ---- Problem content (the ~20 sections) ------------------------------------

/**
 * The authored body of a design problem — the sections after the header (the
 * header is derived from `LLDProblemMeta`). Prose fields are Markdown; `code`
 * and `implementation[].content` hold Java and are exempt from the
 * template-literal-safe prose checks. The renderer shows only the sections that
 * are present, so a problem can be authored incrementally; fully-authored
 * exemplars populate every field.
 */
export interface LLDProblemContent {
  /** Must equal the catalog slug this content belongs to. */
  slug: string;

  // 1 — Problem statement
  statementMD: string;
  businessContextMD: string;

  // 2 — Functional requirements
  functionalRequirements: string[];

  // 3 — Non-functional requirements
  nonFunctionalRequirements: LLDNamedDetail[];

  // 4 — Requirement clarification
  requirementClarification: LLDClarification[];

  // 5 — UML class diagram (Mermaid)
  classDiagramMermaid: string;
  classDiagramCaptionMD?: string;

  // 6 — Sequence diagram (Mermaid)
  sequenceDiagramMermaid: string;
  sequenceDiagramCaptionMD?: string;

  // 7 — Entity identification
  entities: LLDEntity[];

  // 8 — Design patterns used
  patternsUsed: LLDPatternUse[];

  // 9 — Step-by-step design
  designSteps: LLDDesignStep[];

  // 10 — Complete implementation (multi-file Java)
  implementation: SolutionFile[];

  // 11 — Explanation of every class
  classExplanations: LLDClassExplanation[];

  // 12 — Dry run
  dryRun: DryRun;

  // 13 — Complexity analysis
  complexity: LLDComplexityRow[];
  complexityNotesMD?: string;

  // 14 — Extensibility
  extensibility: LLDNamedDetail[];

  // 15 — Alternative designs
  alternativeDesigns: LLDAlternativeDesign[];

  // 16 — Common mistakes
  commonMistakes: string[];

  // 17 — Follow-up interview questions
  followUps: LLDFollowUp[];

  // 18 — Production considerations
  productionConsiderations: LLDNamedDetail[];

  // 19 — What interviewers look for
  interviewNotes: string[];

  // 20 — Quiz
  quiz: LLDQuizItem[];

  // 21 — Practice variants
  practiceVariants: LLDPracticeVariant[];

  // 22 — Flashcards
  flashcards: LLDFlashcard[];

  // 23 — Cheat sheet
  cheatSheetMD: string;

  // 24 — References
  references: LLDReference[];

  // 25 — Related problems
  relatedProblems: LLDRelated[];
}

// ---- Concept content (lighter theory lesson) -------------------------------

/**
 * The authored body of a concept lesson (OOP, SOLID, a design pattern, UML,
 * concurrency, Java collections, best practices). Lighter than a full problem:
 * theory blocks, optional diagrams/comparisons, best practices, quiz, cheat
 * sheet. The header is derived from `LLDProblemMeta`.
 */
export interface LLDConceptContent {
  /** Must equal the catalog slug this content belongs to. */
  slug: string;

  introMD: string;
  learningObjectives: string[];

  /** Core theory, each block optionally illustrated with a Java snippet. */
  theory: LLDDesignStep[];

  /** Optional Mermaid diagrams (UML, state machines, …). */
  diagrams?: LLDDiagram[];

  /** Optional comparison / decision tables. */
  comparisons?: LLDComparison[];

  bestPractices: string[];
  commonMistakes: string[];

  quiz: LLDQuizItem[];
  flashcards: LLDFlashcard[];
  cheatSheetMD: string;
  references: LLDReference[];
  relatedProblems: LLDRelated[];
}

/** A fully-assembled problem: catalog metadata + authored content. */
export interface LLDProblem {
  meta: LLDProblemMeta;
  content: LLDProblemContent;
}

/** A fully-assembled concept: catalog metadata + authored content. */
export interface LLDConcept {
  meta: LLDProblemMeta;
  content: LLDConceptContent;
}

// Re-export the borrowed shapes so authored content files import everything
// from one place.
export type { SolutionFile } from "@/lib/lld/types";
export type { Complexity, DryRun } from "@/features/graph-algorithms/types";
