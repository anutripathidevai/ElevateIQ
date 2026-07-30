/**
 * Domain types for the Mock Panel Interview module.
 *
 * A panel interview is a turn-based conversation with three AI personas who each
 * have distinct goals and evaluation criteria. When the candidate finishes, the
 * panel produces a scorecard: competency scores, per-interviewer feedback, an
 * overall recommendation, and a personalized improvement plan.
 */

export const PERSONA_IDS = [
  "hiring_manager",
  "senior_engineer",
  "principal_engineer",
] as const;
export type PersonaId = (typeof PERSONA_IDS)[number];

/** A single interviewer persona and how it behaves. */
export interface PanelPersona {
  id: PersonaId;
  name: string;
  title: string;
  /** Short glyph/emoji for avatars. */
  glyph: string;
  /** One-line summary shown in the UI. */
  tagline: string;
  /** What this interviewer is trying to assess. */
  goals: string[];
  /** The competencies this interviewer weighs most. */
  evaluationCriteria: string[];
  /** How this interviewer asks follow-ups (drives the system prompt). */
  followUpStyle: string;
  /** Non-AI fallback question bank so the flow works without Azure. */
  seedQuestions: string[];
}

/** Speaker of a transcript turn: the candidate, or one of the personas. */
export type PanelSpeaker = "candidate" | PersonaId;

export interface PanelTurn {
  speaker: PanelSpeaker;
  content: string;
}

export const PANEL_STATUSES = ["active", "completed"] as const;
export type PanelStatus = (typeof PANEL_STATUSES)[number];

/** Verdict scale shared by per-interviewer feedback and the overall call. */
export const VERDICTS = [
  "strong_hire",
  "hire",
  "lean_hire",
  "no_hire",
] as const;
export type Verdict = (typeof VERDICTS)[number];

export const VERDICT_LABELS: Record<Verdict, string> = {
  strong_hire: "Strong Hire",
  hire: "Hire",
  lean_hire: "Lean Hire",
  no_hire: "No Hire",
};

/** The core competencies the panel scores (1-5 scale). */
export const COMPETENCIES = [
  "Problem Solving",
  "Technical Depth",
  "Communication",
  "Leadership & Ownership",
  "Culture & Collaboration",
] as const;
export type Competency = (typeof COMPETENCIES)[number];

export interface CompetencyScore {
  competency: string;
  /** 1 (poor) – 5 (excellent). */
  score: number;
  rationale: string;
}

export interface InterviewerFeedback {
  personaId: PersonaId;
  strengths: string[];
  improvements: string[];
  verdict: Verdict;
}

export interface ImprovementItem {
  focus: string;
  action: string;
}

/** The full scorecard produced at the end of a panel interview. */
export interface PanelResult {
  competencyScores: CompetencyScore[];
  interviewerFeedback: InterviewerFeedback[];
  overallRecommendation: {
    decision: Verdict;
    summary: string;
  };
  improvementPlan: ImprovementItem[];
  /** False when produced by the heuristic fallback (no AI configured). */
  aiGenerated: boolean;
}

/** A persisted panel interview. Dates are ISO strings for RSC serialization. */
export interface PanelInterview {
  id: string;
  role: string;
  focus: string;
  status: PanelStatus;
  transcript: PanelTurn[];
  result: PanelResult | null;
  createdAt: string;
  updatedAt: string;
}

/** Lightweight row for lists/history. */
export interface PanelInterviewSummary {
  id: string;
  role: string;
  focus: string;
  status: PanelStatus;
  decision: Verdict | null;
  turnCount: number;
  createdAt: string;
  updatedAt: string;
}
