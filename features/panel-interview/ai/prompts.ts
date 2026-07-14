import { COMPETENCIES, type PanelPersona } from "../types";
import { PANEL_PERSONAS } from "../personas";

/**
 * Prompt templates for the panel interview, kept separate from the service and
 * UI so wording can be iterated independently. One template drives an
 * individual persona's questioning; the other drives the final scorecard.
 */

export interface InterviewContext {
  role: string;
  focus: string;
}

export interface BuiltPrompt {
  system: string;
  user: string;
}

/** System prompt that makes the model role-play a single interviewer persona. */
export function buildPersonaSystemPrompt(
  persona: PanelPersona,
  ctx: InterviewContext,
): string {
  return [
    `You are ${persona.name}, a ${persona.title} conducting a panel interview.`,
    `The candidate is interviewing for: ${ctx.role || "a software engineering role"}.`,
    ctx.focus ? `Interview focus: ${ctx.focus}.` : null,
    "",
    "Your goals:",
    ...persona.goals.map((g) => `- ${g}`),
    "",
    `Your questioning style: ${persona.followUpStyle}`,
    "",
    "Rules:",
    "- Stay fully in character as this interviewer.",
    "- Ask exactly ONE question per turn — either a follow-up to the candidate's",
    "  last answer or a new question that advances your evaluation.",
    "- Keep it to 2-4 sentences. Be realistic, not robotic.",
    "- Do NOT answer for the candidate or reveal a model answer.",
    "- Earlier messages prefixed with [Role] were asked by your fellow panelists;",
    "  build on them rather than repeating them.",
    "- Do not narrate scores or say you're evaluating — just interview.",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Kickoff instruction used to generate a persona's opening question. */
export const OPENING_INSTRUCTION =
  "Begin the interview. Briefly introduce yourself in one short sentence, then ask your first question.";

/** Build the scorecard prompt from the completed transcript. */
export function buildScorecardPrompt(
  ctx: InterviewContext,
  transcript: string,
): BuiltPrompt {
  const personaLines = Object.values(PANEL_PERSONAS)
    .map(
      (p) =>
        `- ${p.id} — ${p.title} (${p.name}); weighs: ${p.evaluationCriteria.join(", ")}`,
    )
    .join("\n");

  const system = [
    "You are the calibration lead for a software engineering interview panel.",
    "Given the full transcript, produce a fair, evidence-based scorecard.",
    "",
    "The panel personas are:",
    personaLines,
    "",
    `Score each of these competencies on a 1-5 scale (1 poor, 5 excellent): ${COMPETENCIES.join(", ")}.`,
    "Base every score and comment strictly on evidence in the transcript; if the",
    "candidate barely engaged, say so and score accordingly. Provide per-persona",
    "feedback (strengths, improvements, verdict), an overall recommendation, and a",
    "personalized improvement plan.",
    "",
    "Respond with ONLY valid JSON of this exact shape:",
    '{"competencyScores":[{"competency","score","rationale"}],',
    '"interviewerFeedback":[{"personaId","strengths":[],"improvements":[],"verdict"}],',
    '"overallRecommendation":{"decision","summary"},',
    '"improvementPlan":[{"focus","action"}]}',
    'where verdict/decision is one of "strong_hire" | "hire" | "lean_hire" | "no_hire"',
    "and personaId is one of hiring_manager | senior_engineer | principal_engineer.",
    "No markdown, no commentary.",
  ].join("\n");

  const user = [
    `Role: ${ctx.role || "Software Engineer"}`,
    ctx.focus ? `Focus: ${ctx.focus}` : null,
    "",
    "Transcript:",
    transcript,
  ]
    .filter(Boolean)
    .join("\n");

  return { system, user };
}
