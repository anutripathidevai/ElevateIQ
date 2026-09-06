/**
 * The adaptive question generator. Given the planner's decision (target
 * competency, difficulty, kind), produce the single next question.
 *
 *  - `generateAdaptiveQuestion` uses Azure OpenAI (Phase-1 reliability +
 *    observability, versioned prompt, Zod-validated JSON).
 *  - `heuristicQuestion` picks from the competency's laddered question bank,
 *    avoiding anything already asked — the deterministic, no-network fallback.
 */
import type { TrackKey } from "@prisma/client";
import { runChatCompletion } from "@/services/ai/completion";
import { AiNotConfiguredError } from "@/services/ai/client";
import { PROMPT_VERSIONS } from "@/services/ai/prompt-versions";
import { getCompetency } from "../competencies";
import type { AdaptivePlan, Difficulty, Seniority } from "../types";
import { DIFFICULTIES } from "../types";
import { buildInterviewerPrompt } from "./prompts";
import { nextQuestionSchema } from "./schemas";

function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fenced ? fenced[1] : raw).trim();
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Pick a laddered bank question for the target competency/difficulty that hasn't
 * been asked. Widens across difficulties if the exact band is exhausted, and
 * finally synthesizes a generic prompt so we never fail to produce a question.
 */
export function heuristicQuestion(args: {
  track: TrackKey;
  plan: AdaptivePlan;
  askedQuestions: string[];
}): string {
  const competency = getCompetency(args.track, args.plan.targetCompetencyId);
  const asked = new Set(args.askedQuestions.map(normalize));

  if (competency) {
    // Try the target difficulty first, then adjacent difficulties.
    const order: Difficulty[] = [
      args.plan.difficulty,
      ...DIFFICULTIES.filter((d) => d !== args.plan.difficulty),
    ];
    for (const diff of order) {
      for (const q of competency.questionBank[diff]) {
        if (!asked.has(normalize(q))) return q;
      }
    }
  }

  const name = competency?.name ?? "this area";
  return `Let's go deeper on ${name.toLowerCase()}. Can you walk me through a concrete example that demonstrates your depth here?`;
}

/**
 * Generate the next question via Azure OpenAI, falling back to the heuristic bank
 * when Azure is unconfigured or the response is unusable.
 */
export async function generateAdaptiveQuestion(args: {
  track: TrackKey;
  seniority: Seniority;
  plan: AdaptivePlan;
  askedQuestions: string[];
  lastAnswer?: string;
  problemTitle?: string | null;
}): Promise<{ text: string; aiGenerated: boolean }> {
  const competency = getCompetency(args.track, args.plan.targetCompetencyId);
  if (!competency) {
    return { text: heuristicQuestion(args), aiGenerated: false };
  }

  const { system, user } = buildInterviewerPrompt({
    track: args.track,
    seniority: args.seniority,
    competency,
    difficulty: args.plan.difficulty,
    kind: args.plan.kind,
    askedQuestions: args.askedQuestions,
    lastAnswer: args.lastAnswer,
    problemTitle: args.problemTitle,
  });

  try {
    const { content } = await runChatCompletion({
      temperature: 0.8,
      maxTokens: 300,
      responseFormat: { type: "json_object" },
      meta: {
        operation: "adaptive.question",
        promptVersion: PROMPT_VERSIONS.adaptiveInterviewer,
      },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    const parsed = nextQuestionSchema.safeParse(
      JSON.parse(extractJson(content || "{}")),
    );
    if (!parsed.success) {
      return { text: heuristicQuestion(args), aiGenerated: false };
    }

    // Guard against the model repeating a prior question verbatim.
    const asked = new Set(args.askedQuestions.map(normalize));
    if (asked.has(normalize(parsed.data.question))) {
      return { text: heuristicQuestion(args), aiGenerated: false };
    }
    return { text: parsed.data.question.trim(), aiGenerated: true };
  } catch (err) {
    if (err instanceof AiNotConfiguredError) {
      return { text: heuristicQuestion(args), aiGenerated: false };
    }
    return { text: heuristicQuestion(args), aiGenerated: false };
  }
}
