import { PANEL_PERSONA_ORDER, PANEL_PERSONAS } from "./personas";
import {
  COMPETENCIES,
  type PanelInterview,
  type PanelResult,
  type PanelTurn,
  type PersonaId,
  type Verdict,
} from "./types";

/**
 * Pure helpers for the panel interview: persona rotation, transcript formatting,
 * and the heuristic scorecard used when AI isn't configured. No I/O, so these
 * are the unit-test target for the module.
 */

/** Number of interviewer (non-candidate) turns in a transcript. */
export function countInterviewerTurns(transcript: readonly PanelTurn[]): number {
  return transcript.filter((t) => t.speaker !== "candidate").length;
}

/** Which persona should speak for the given interviewer-turn index. */
export function personaForTurn(turnIndex: number): PersonaId {
  const order = PANEL_PERSONA_ORDER;
  return order[((turnIndex % order.length) + order.length) % order.length];
}

/** Which persona should ask the next question, given the current transcript. */
export function nextPersona(transcript: readonly PanelTurn[]): PersonaId {
  return personaForTurn(countInterviewerTurns(transcript));
}

/** How many questions a given persona has already asked. */
export function personaQuestionCount(
  transcript: readonly PanelTurn[],
  personaId: PersonaId,
): number {
  return transcript.filter((t) => t.speaker === personaId).length;
}

/** Render the transcript as a labeled string for the scorer prompt. */
export function formatTranscript(transcript: readonly PanelTurn[]): string {
  return transcript
    .map((t) => {
      if (t.speaker === "candidate") return `Candidate: ${t.content}`;
      const p = PANEL_PERSONAS[t.speaker];
      return `${p.title} (${p.name}): ${t.content}`;
    })
    .join("\n\n");
}

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

/** Map an average 1-5 competency score to a hire verdict. */
export function verdictFromScore(avg: number): Verdict {
  if (avg >= 4.3) return "strong_hire";
  if (avg >= 3.5) return "hire";
  if (avg >= 2.75) return "lean_hire";
  return "no_hire";
}

export function averageScore(scores: readonly number[]): number {
  if (scores.length === 0) return 0;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

/**
 * Deterministic, transcript-based scorecard used when Azure OpenAI isn't
 * configured. It rewards engagement (answering more questions in more depth)
 * rather than fabricating a qualitative assessment, and is clearly flagged with
 * `aiGenerated: false` so the UI can label it as a heuristic estimate.
 */
export function heuristicScorecard(
  interview: Pick<PanelInterview, "transcript">,
): PanelResult {
  const answers = interview.transcript.filter((t) => t.speaker === "candidate");
  const answered = answers.length;
  const avgWords =
    answered === 0
      ? 0
      : answers.reduce((sum, a) => sum + a.content.trim().split(/\s+/).length, 0) /
        answered;

  const depth = avgWords >= 60 ? 2 : avgWords >= 25 ? 1 : 0;
  const breadth = answered >= 4 ? 1 : answered >= 2 ? 0 : -1;
  const base = clamp(3 + depth + breadth, 1, 5);

  const competencyScores = COMPETENCIES.map((competency) => ({
    competency,
    score: base,
    rationale:
      answered === 0
        ? "No answers were recorded, so this is a baseline estimate."
        : `Estimated from ${answered} answer(s) averaging ~${Math.round(avgWords)} words. Enable AI scoring for a qualitative assessment.`,
  }));

  const avg = averageScore(competencyScores.map((c) => c.score));
  const decision = verdictFromScore(avg);

  const interviewerFeedback = PANEL_PERSONA_ORDER.map((personaId) => {
    const p = PANEL_PERSONAS[personaId];
    return {
      personaId,
      strengths:
        answered > 0
          ? [`Engaged with ${p.title.toLowerCase()} questions.`]
          : ["—"],
      improvements: [
        `Add more specific, quantified detail for ${p.evaluationCriteria[0]}.`,
      ],
      verdict: decision,
    };
  });

  const improvementPlan = [
    {
      focus: "Structure",
      action:
        "Answer behavioral questions with the STAR framework so impact is explicit.",
    },
    {
      focus: "Depth",
      action:
        "Quantify results and name the trade-offs you weighed in each decision.",
    },
    {
      focus: "Coverage",
      action:
        "Answer at least four questions across all three interviewers before finishing.",
    },
  ];

  return {
    competencyScores,
    interviewerFeedback,
    overallRecommendation: {
      decision,
      summary:
        "Heuristic estimate based on engagement and answer depth. Configure Azure OpenAI for a full qualitative panel evaluation.",
    },
    improvementPlan,
    aiGenerated: false,
  };
}
