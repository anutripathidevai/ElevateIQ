/**
 * The AI evaluation engine: grade one candidate answer against a competency
 * rubric and return a structured, validated {@link AnswerEvaluation}.
 *
 * Two implementations behind one entry point:
 *  - `evaluateAnswer` uses Azure OpenAI (through the Phase-1 reliability +
 *    observability wrapper) with a versioned prompt and Zod-validated JSON.
 *  - `heuristicEvaluateAnswer` is a deterministic, no-network fallback (concept
 *    detection + depth signals). It powers DB-less / unconfigured environments
 *    and makes the golden-dataset regression tests hermetic.
 *
 * `evaluateAnswer` transparently falls back to the heuristic when Azure isn't
 * configured (or the model returns an unparseable response), so callers never
 * have to special-case it.
 */
import type { TrackKey } from "@prisma/client";
import { runChatCompletion } from "@/services/ai/completion";
import { AiNotConfiguredError } from "@/services/ai/client";
import { PROMPT_VERSIONS } from "@/services/ai/prompt-versions";
import { getCompetency, getFramework } from "../competencies";
import type {
  AnswerEvaluation,
  CompetencyAssessment,
  Difficulty,
  Seniority,
} from "../types";
import { buildEvaluatorPrompt } from "./prompts";
import { answerEvaluationSchema } from "./schemas";

/** Strip accidental ```json fences before parsing model output. */
function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fenced ? fenced[1] : raw).trim();
}

export interface EvaluateArgs {
  track: TrackKey;
  seniority: Seniority;
  questionIndex: number;
  targetCompetencyId: string;
  difficulty: Difficulty;
  question: string;
  answer: string;
}

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

/**
 * Deterministic evaluator. Scores an answer by (a) how many of the competency's
 * expected concepts it demonstrably references and (b) answer depth, calibrated
 * to seniority. No I/O, fully reproducible — the unit-test / regression target.
 */
export function heuristicEvaluateAnswer(args: EvaluateArgs): AnswerEvaluation {
  const competency = getCompetency(args.track, args.targetCompetencyId);
  const concepts = competency?.expectedConcepts ?? [];
  const haystack = args.answer.toLowerCase();

  const matchedConcepts = concepts.filter((c) =>
    haystack.includes(c.toLowerCase()),
  );
  const coverage = concepts.length > 0 ? matchedConcepts.length / concepts.length : 0;

  const words = wordCount(args.answer);
  // Depth signal: 0 at <=8 words, ramping to 1 around ~90 words.
  const depth = clamp((words - 8) / 82, 0, 1);

  // Concept coverage dominates; depth is a secondary signal. Answers that name
  // several expected concepts AND have substance score highest.
  const raw = 100 * (0.7 * coverage + 0.3 * depth);
  const score = Math.round(clamp(raw, 0, 100));

  // Confidence rises with answer substance; very short answers are unreliable.
  const confidence = Number(clamp(0.25 + 0.6 * depth + 0.15 * Math.min(1, matchedConcepts.length / 3), 0, 1).toFixed(2));

  const missing = concepts.filter((c) => !matchedConcepts.includes(c));
  const evidence =
    matchedConcepts.length > 0
      ? [`Referenced: ${matchedConcepts.slice(0, 5).join(", ")}.`]
      : words > 0
        ? ["Answer did not clearly reference the expected concepts."]
        : [];
  const strengths =
    matchedConcepts.length > 0
      ? [`Touched on ${matchedConcepts.length} of ${concepts.length} key concepts.`]
      : [];
  const gaps =
    missing.length > 0
      ? [`Did not address: ${missing.slice(0, 5).join(", ")}.`]
      : words < 15
        ? ["Answer was too brief to demonstrate the competency."]
        : [];

  const assessment: CompetencyAssessment = {
    competencyId: args.targetCompetencyId,
    score,
    confidence,
    matchedConcepts,
    evidence,
    strengths,
    gaps,
  };

  return {
    questionIndex: args.questionIndex,
    targetCompetencyId: args.targetCompetencyId,
    difficulty: args.difficulty,
    assessments: [assessment],
    aiGenerated: false,
    promptVersion: "heuristic@2026-02",
  };
}

/**
 * Evaluate an answer with Azure OpenAI, validated against {@link answerEvaluationSchema}.
 * Falls back to {@link heuristicEvaluateAnswer} when Azure is unconfigured or the
 * model returns an unusable response — so the adaptive flow is always resilient.
 */
export async function evaluateAnswer(
  args: EvaluateArgs,
): Promise<AnswerEvaluation> {
  const framework = getFramework(args.track, args.seniority);
  const target = getCompetency(args.track, args.targetCompetencyId);
  if (!target) return heuristicEvaluateAnswer(args);

  // Offer the model the target plus a couple of adjacent competencies it may
  // legitimately observe, so a rich answer can inform multiple dimensions.
  const adjacent = framework.competencies
    .filter((c) => c.id !== target.id)
    .slice(0, 2);

  const { system, user } = buildEvaluatorPrompt({
    track: args.track,
    seniority: args.seniority,
    targetCompetency: target,
    adjacentCompetencies: adjacent,
    question: args.question,
    answer: args.answer,
  });

  const validIds = new Set(framework.competencies.map((c) => c.id));

  try {
    const { content } = await runChatCompletion({
      temperature: 0.2,
      maxTokens: 900,
      responseFormat: { type: "json_object" },
      meta: {
        operation: "adaptive.evaluate",
        promptVersion: PROMPT_VERSIONS.adaptiveEvaluator,
      },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    const parsed = answerEvaluationSchema.safeParse(
      JSON.parse(extractJson(content || "{}")),
    );
    if (!parsed.success) return heuristicEvaluateAnswer(args);

    // Keep only assessments for competencies that exist in this track; ensure the
    // target competency is always present (fall back to heuristic for it).
    const assessments = parsed.data.assessments.filter((a) =>
      validIds.has(a.competencyId),
    );
    if (!assessments.some((a) => a.competencyId === target.id)) {
      const h = heuristicEvaluateAnswer(args);
      assessments.push(h.assessments[0]);
    }
    if (assessments.length === 0) return heuristicEvaluateAnswer(args);

    return {
      questionIndex: args.questionIndex,
      targetCompetencyId: args.targetCompetencyId,
      difficulty: args.difficulty,
      assessments: assessments.map((a) => ({
        competencyId: a.competencyId,
        score: Math.round(clamp(a.score, 0, 100)),
        confidence: Number(clamp(a.confidence, 0, 1).toFixed(2)),
        matchedConcepts: a.matchedConcepts,
        evidence: a.evidence,
        strengths: a.strengths,
        gaps: a.gaps,
      })),
      aiGenerated: true,
      promptVersion: PROMPT_VERSIONS.adaptiveEvaluator,
    };
  } catch (err) {
    if (err instanceof AiNotConfiguredError) return heuristicEvaluateAnswer(args);
    // Any transient/model error: degrade gracefully to the heuristic rather than
    // failing the interview turn.
    return heuristicEvaluateAnswer(args);
  }
}
