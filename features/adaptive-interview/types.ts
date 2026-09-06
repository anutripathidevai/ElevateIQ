/**
 * Domain types for the Adaptive Mock Interview.
 *
 * An adaptive interview extends the existing Mock Interview: the interviewer asks
 * one question at a time, each candidate answer is evaluated server-side against a
 * competency rubric (hidden from the candidate), and the next question is selected
 * dynamically from the competency the candidate is weakest / least-proven on. When
 * the candidate finishes, the stored per-answer evaluations are aggregated into a
 * final scorecard with recommended learning topics.
 *
 * Persistence note: all of this state is stored in the existing (previously unused)
 * `MockInterview.summary` JSON column — no schema migration is required and the
 * in-memory (DB-less) backend mirrors it. The visible transcript keeps only the
 * chat messages, exactly as before.
 */
import type { TrackKey } from "@prisma/client";

/** Candidate seniority — drives competency weights, difficulty, and length. */
export const SENIORITY_LEVELS = ["junior", "mid", "senior", "staff"] as const;
export type Seniority = (typeof SENIORITY_LEVELS)[number];

export const SENIORITY_LABELS: Record<Seniority, string> = {
  junior: "Junior (L3 / SDE I)",
  mid: "Mid (L4 / SDE II)",
  senior: "Senior (L5 / SDE III)",
  staff: "Staff+ (L6+)",
};

/** Question difficulty ladder. */
export const DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

/** How the next question relates to what came before. */
export const QUESTION_KINDS = ["probe", "follow_up", "advance"] as const;
export type QuestionKind = (typeof QUESTION_KINDS)[number];

/** A single scored competency within a track's rubric. */
export interface Competency {
  id: string;
  name: string;
  /** One-line description of what "good" looks like. */
  description: string;
  /**
   * Concepts a strong answer is expected to touch. Used both as an evaluator hint
   * and by the deterministic heuristic evaluator for concept detection.
   */
  expectedConcepts: string[];
  /**
   * Non-AI question bank, laddered by difficulty. Guarantees the flow works with
   * no Azure configured and gives the AI interviewer concrete anchors to vary.
   */
  questionBank: Record<Difficulty, string[]>;
}

/** A resolved rubric for one (track, seniority): competencies + their weights. */
export interface CompetencyFramework {
  track: TrackKey;
  seniority: Seniority;
  /** Number of questions the interview plans to ask. */
  plannedQuestions: number;
  /** Difficulty the interview opens at for this seniority. */
  baselineDifficulty: Difficulty;
  competencies: Competency[];
  /** competencyId -> normalized weight (weights sum to 1). */
  weights: Record<string, number>;
}

/** Evaluation of one candidate answer against one competency. */
export interface CompetencyAssessment {
  competencyId: string;
  /** 0-100 interview-readiness score for this competency on this answer. */
  score: number;
  /** 0-1 confidence in the score (low when the answer is too short/ambiguous). */
  confidence: number;
  /** Concepts from the rubric the answer actually demonstrated. */
  matchedConcepts: string[];
  /** Short verbatim-ish evidence quotes pulled from the answer. */
  evidence: string[];
  strengths: string[];
  gaps: string[];
}

/** The full evaluation of one answer (may cover the target + adjacent competencies). */
export interface AnswerEvaluation {
  questionIndex: number;
  /** The competency the question primarily targeted. */
  targetCompetencyId: string;
  difficulty: Difficulty;
  assessments: CompetencyAssessment[];
  /** True when produced by the LLM; false for the deterministic heuristic. */
  aiGenerated: boolean;
  /** Prompt version used, stored for observability / regression tracking. */
  promptVersion: string;
}

/** A question the interviewer has asked (parallels an assistant transcript turn). */
export interface AskedQuestion {
  index: number;
  competencyId: string;
  difficulty: Difficulty;
  kind: QuestionKind;
  text: string;
}

/** The planner's decision about what to ask next. */
export interface AdaptivePlan {
  done: boolean;
  targetCompetencyId: string;
  difficulty: Difficulty;
  kind: QuestionKind;
  /** Human-readable reason (for telemetry / debugging; never shown as a score). */
  rationale: string;
}

/** Aggregated per-competency state across all answers so far. */
export interface CompetencyState {
  competencyId: string;
  /** Weighted-average score across answers, or null when never assessed. */
  score: number | null;
  confidence: number;
  timesAssessed: number;
  matchedConcepts: string[];
  gaps: string[];
}

/** A learning recommendation mapped from a weak competency. */
export interface LearningRecommendation {
  competencyId: string;
  topic: string;
  reason: string;
  /** Optional in-app deep link to relevant learning content. */
  href?: string;
}

/** One step in the adaptive interview path, for the after-the-fact journey view. */
export interface ScorecardPathStep {
  questionNumber: number;
  competencyId: string;
  competencyName: string;
  kind: QuestionKind;
  difficulty: Difficulty;
  /** Candidate-safe reason the question was selected (no scores). */
  reason: string;
}

/** Final scorecard rendered after the interview. */
export interface AdaptiveScorecard {
  overallScore: number;
  /** 0-1 aggregate confidence. */
  confidence: number;
  competencyScores: {
    competencyId: string;
    name: string;
    score: number | null;
    confidence: number;
    timesAssessed: number;
    evidence: string[];
    gaps: string[];
  }[];
  strengths: string[];
  weaknesses: string[];
  recommendedTopics: LearningRecommendation[];
  /** True when at least one answer was scored by the LLM. */
  aiGenerated: boolean;
  /** Number of answers actually evaluated. Optional for legacy scorecards. */
  answeredCount?: number;
  /** Number of questions the interview planned to ask. Optional for legacy. */
  plannedCount?: number;
  /** The adaptive question path (why each question was chosen). Optional for legacy. */
  path?: ScorecardPathStep[];
}

export const ADAPTIVE_SUMMARY_VERSION = 1 as const;

/**
 * Everything persisted for an adaptive interview, stored in
 * `MockInterview.summary`. Backward compatible: absent/legacy summaries are
 * simply treated as a non-adaptive session.
 */
export interface AdaptiveSummary {
  version: typeof ADAPTIVE_SUMMARY_VERSION;
  kind: "adaptive";
  config: { track: TrackKey; seniority: Seniority };
  status: "active" | "completed";
  plannedQuestions: number;
  questions: AskedQuestion[];
  evaluations: AnswerEvaluation[];
  scorecard: AdaptiveScorecard | null;
  promptVersions: { evaluator: string; interviewer: string };
}

/** Type guard for reading an unknown `summary` JSON value safely. */
export function isAdaptiveSummary(value: unknown): value is AdaptiveSummary {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { kind?: unknown }).kind === "adaptive"
  );
}
