/**
 * Prompt builders for the adaptive interview.
 *
 * Two prompts, both versioned in `prompt-versions.ts`:
 *  - the evaluator prompt, which grades one answer against a rubric and returns
 *    structured JSON (evidence / strengths / gaps / score / confidence);
 *  - the interviewer prompt, which produces the single next question targeting a
 *    specific competency and difficulty.
 *
 * Prompts embed the answer/transcript because they are sent to the model — but
 * nothing here logs them; telemetry (see completion.ts) records only metadata.
 */
import type { TrackKey } from "@prisma/client";
import type { Competency, Difficulty, QuestionKind, Seniority } from "../types";
import { SENIORITY_LABELS } from "../types";

const TRACK_FOCUS: Record<TrackKey, string> = {
  DSA: "a data-structures & algorithms coding interview",
  SYSTEM_DESIGN: "a high-level system design interview",
  LLD: "a low-level / object-oriented design interview",
  BEHAVIORAL: "a behavioral interview using the STAR method",
};

function competencyBlock(competencies: Competency[]): string {
  return competencies
    .map(
      (c) =>
        `- ${c.id} (${c.name}): ${c.description} Expected concepts: ${c.expectedConcepts.join(", ")}.`,
    )
    .join("\n");
}

const EVAL_OUTPUT_CONTRACT = `Respond with ONLY a JSON object (no markdown fences) of this exact shape:
{
  "assessments": [
    {
      "competencyId": "<one of the competency ids listed>",
      "score": <integer 0-100, interview readiness for THIS competency>,
      "confidence": <number 0-1, how sure you are given the answer's substance>,
      "matchedConcepts": ["<expected concept the answer demonstrated>", "..."],
      "evidence": ["<short quote or paraphrase from the answer supporting the score>", "..."],
      "strengths": ["<specific strength>", "..."],
      "gaps": ["<specific missing/weak concept>", "..."]
    }
  ]
}
Rules:
- Score reflects interview readiness (60+ = would pass this dimension, 85+ = strong).
- Lower "confidence" when the answer is short, vague, or off-topic.
- Base "evidence" strictly on what the candidate actually said; do not invent quotes.
- Assess the primary competency; you may add adjacent listed competencies only if the answer clearly speaks to them.`;

export function buildEvaluatorPrompt(args: {
  track: TrackKey;
  seniority: Seniority;
  targetCompetency: Competency;
  adjacentCompetencies: Competency[];
  question: string;
  answer: string;
}): { system: string; user: string } {
  const { track, seniority, targetCompetency, adjacentCompetencies } = args;
  const rubric = [targetCompetency, ...adjacentCompetencies];

  const system = [
    `You are a rigorous, fair interviewer evaluating an answer in ${TRACK_FOCUS[track]}.`,
    `The candidate is interviewing at the ${SENIORITY_LABELS[seniority]} level; calibrate your expectations to that bar.`,
    `Evaluate ONLY against these competencies (use their exact ids):`,
    competencyBlock(rubric),
    `The primary competency for this question is "${targetCompetency.id}".`,
    EVAL_OUTPUT_CONTRACT,
  ].join("\n");

  const user = [
    `## Question asked\n${args.question}`,
    `\n## Candidate's answer\n${args.answer}`,
  ].join("\n");

  return { system, user };
}

const KIND_INSTRUCTION: Record<QuestionKind, string> = {
  probe:
    "Ask a fresh question that opens up this competency; the candidate has not been tested on it yet.",
  follow_up:
    "Ask a focused follow-up that drills into the candidate's previous answer to close a specific gap in this competency. Reference what they said.",
  advance:
    "The candidate is doing well; raise the difficulty and stretch them further on this competency.",
};

const DIFFICULTY_INSTRUCTION: Record<Difficulty, string> = {
  easy: "Keep it approachable and foundational.",
  medium: "Aim for a solid mid-level challenge.",
  hard: "Make it genuinely challenging and senior-level.",
};

export function buildInterviewerPrompt(args: {
  track: TrackKey;
  seniority: Seniority;
  competency: Competency;
  difficulty: Difficulty;
  kind: QuestionKind;
  askedQuestions: string[];
  lastAnswer?: string;
  problemTitle?: string | null;
}): { system: string; user: string } {
  const { track, seniority, competency, difficulty, kind } = args;

  const system = [
    `You are conducting ${TRACK_FOCUS[track]} for a candidate at the ${SENIORITY_LABELS[seniority]} level.`,
    `Ask exactly ONE next question. Do not greet, do not evaluate, do not reveal scores, do not answer it yourself.`,
    `Target competency: ${competency.name} — ${competency.description}`,
    KIND_INSTRUCTION[kind],
    DIFFICULTY_INSTRUCTION[difficulty],
    `Keep the question concise (1-3 sentences).`,
    `Respond with ONLY a JSON object: { "question": "<the question>" } (no markdown fences).`,
  ].join("\n");

  const askedBlock =
    args.askedQuestions.length > 0
      ? `\n\nQuestions already asked (do NOT repeat or closely paraphrase these):\n${args.askedQuestions
          .map((q, i) => `${i + 1}. ${q}`)
          .join("\n")}`
      : "";
  const answerBlock =
    kind === "follow_up" && args.lastAnswer
      ? `\n\nThe candidate's most recent answer (use it to craft the follow-up):\n${args.lastAnswer}`
      : "";
  const problemBlock = args.problemTitle
    ? `\n\nThe interview is scoped to this problem: ${args.problemTitle}.`
    : "";

  const user =
    `Produce the next ${difficulty} question targeting "${competency.id}".` +
    problemBlock +
    answerBlock +
    askedBlock;

  return { system, user };
}
