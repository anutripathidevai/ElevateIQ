/**
 * Content model for the Programming Languages learning category (lives under
 * Learning). Each language is a premium, interview-focused course made of
 * ordered modules, each module of ordered topics, and each topic a full
 * learning page with up to twelve sections (intro → cheat sheet).
 *
 * Everything is authored as typed data (see `<language>/data/`) — no database
 * required — so courses render identically in guest mode and, later, when a DB
 * is attached. Adding a new language means authoring content, not changing app
 * code: register the language, define its modules, and drop in topic data.
 */

import type { AccentKey } from "@/lib/navigation";

export type LanguageStatus = "available" | "coming-soon";
export type ModuleStatus = "published" | "coming-soon";
export type TopicDifficulty = "Beginner" | "Intermediate" | "Advanced";
export type ExerciseDifficulty = "Easy" | "Medium" | "Hard";

/** Icon keys resolved to a concrete LucideIcon in the UI layer (keeps the data
 * model serialisable and free of React/icon imports). */
export type LanguageIconKey =
  | "javascript"
  | "java"
  | "python"
  | "csharp"
  | "cpp"
  | "go";

/** Registry entry describing a language course and its availability. */
export interface LanguageMeta {
  /** URL slug, e.g. "javascript". */
  slug: string;
  /** Display name, e.g. "JavaScript". */
  name: string;
  /** One-line positioning shown on cards. */
  tagline: string;
  status: LanguageStatus;
  accent: AccentKey;
  iconKey: LanguageIconKey;
}

/** Landing-page metadata for an available course. */
export interface CourseMeta {
  /** Owning language slug. */
  language: string;
  title: string;
  subtitle: string;
  /** Longer overview paragraph (Markdown). */
  descriptionMD: string;
  /** What the learner will be able to do (bulleted). */
  objectives: string[];
  /** Skills / keywords gained. */
  skills: string[];
  /** Estimated total hours to complete. */
  estimatedHours: number;
}

/** A themed group of topics within a course. */
export interface CourseModule {
  /** Stable id, e.g. "fundamentals". */
  id: string;
  /** 1-based module order. */
  order: number;
  title: string;
  /** Short description shown on module cards and the roadmap. */
  summary: string;
  status: ModuleStatus;
  /** Topic slugs, in learning order (all prefixed with the language, e.g. "js-"). */
  topicSlugs: string[];
}

// ---- Topic section building blocks -----------------------------------------

/** A titled code sample (read-only, syntax-highlighted, copyable). */
export interface CodeExample {
  title?: string;
  /** Optional Markdown lead-in above the code. */
  descriptionMD?: string;
  /** Monaco language id, e.g. "javascript". */
  language: string;
  code: string;
}

/** A runnable snippet for the interactive playground. */
export interface PlaygroundExample {
  title: string;
  descriptionMD?: string;
  /** Runnable JavaScript (use console.log to produce output). */
  code: string;
}

/** A visual explanation. Prefer `mermaid`; fall back to a monospace `ascii`
 * block when a diagram is better expressed as text. */
export interface DiagramBlock {
  title: string;
  /** Mermaid source (rendered as a diagram in the UI). */
  mermaid?: string;
  /** Pre-formatted ASCII/text diagram. */
  ascii?: string;
  caption?: string;
}

/** A "predict the output" challenge with a reveal. */
export interface OutputPrediction {
  /** The code whose output the learner must predict. */
  code: string;
  /** The exact expected output. */
  answer: string;
  /** Why the output is what it is (Markdown). */
  explanationMD: string;
}

/** A hands-on coding exercise with a gated solution. */
export interface CodingExercise {
  title: string;
  difficulty: ExerciseDifficulty;
  promptMD: string;
  hints: string[];
  /** Reference solution source. */
  solutionCode: string;
  complexity?: { time: string; space: string };
  explanationMD: string;
}

/** An interview question with a model answer. */
export interface InterviewQuestion {
  question: string;
  answerMD: string;
  companies?: string[];
  followUps?: string[];
}

/** A single multiple-choice quiz question. */
export interface QuizQuestion {
  question: string;
  options: string[];
  /** 0-based index of the correct option. */
  correctIndex: number;
  explanationMD: string;
}

/**
 * A single fully- (or partially-) authored topic page. Only `intro`, `theory`,
 * and `summary` are required; every other section is optional so a topic can be
 * published progressively and the page renders only the sections that exist.
 */
export interface Topic {
  /** Globally-unique slug within the language, prefixed (e.g. "js-event-loop"). */
  slug: string;
  /** Owning module id. */
  moduleId: string;
  /** 1-based position in the overall course learning order. */
  order: number;
  title: string;
  difficulty: TopicDifficulty;
  estimatedReadingMin: number;
  estimatedPracticeMin: number;
  tags: string[];

  // 1. Introduction (required)
  introMD: string;
  // 2. Why this matters (interview relevance, real-world usage)
  whyItMattersMD?: string;
  // 3. Theory (required, the core teaching)
  theoryMD: string;
  // 4. Visual diagrams
  diagrams?: DiagramBlock[];
  // 5. Code examples
  codeExamples?: CodeExample[];
  // 6. Interactive playground
  playground?: PlaygroundExample[];
  // 7. Output prediction
  outputPredictions?: OutputPrediction[];
  // 8. Coding exercises
  codingExercises?: CodingExercise[];
  // 9. Interview questions
  interviewQuestions?: InterviewQuestion[];
  // 10. Quiz
  quiz?: QuizQuestion[];
  // 11. Summary (required, key takeaways)
  summary: string[];
  // 12. Cheat sheet (one-page quick revision, Markdown)
  cheatSheetMD?: string;
}

/** Derived, display-ready stats for a module (computed in index.ts). */
export interface ModuleStats {
  module: CourseModule;
  topics: Topic[];
  topicCount: number;
  /** Sum of reading + practice estimates, in minutes. */
  estimatedMinutes: number;
}

// ---- Interview hub ----------------------------------------------------------

/** A curated interview question for the hub (Top 100), bucketed by difficulty. */
export interface HubQuestion {
  id: string;
  question: string;
  difficulty: ExerciseDifficulty;
  answerMD: string;
  tags?: string[];
}

/** A classic machine-coding / implementation problem with a full walkthrough. */
export interface HubCodingQuestion {
  id: string;
  title: string;
  difficulty: ExerciseDifficulty;
  promptMD: string;
  approachMD: string;
  solutionCode: string;
  complexity?: { time: string; space: string };
  discussionMD: string;
}

/** A section of the searchable cheat sheet. */
export interface CheatSheetSection {
  id: string;
  title: string;
  bodyMD: string;
}

/** The complete interview-prep hub for a language. */
export interface InterviewHub {
  language: string;
  questions: HubQuestion[];
  codingQuestions: HubCodingQuestion[];
  outputPredictions: OutputPrediction[];
  machineCoding: HubCodingQuestion[];
  cheatSheet: CheatSheetSection[];
}
