/**
 * Orchestration for the adaptive interview. This is the server-side glue that
 * ties the pure pieces (framework, planner, scorecard) to the AI pieces
 * (evaluator, interviewer) and the mock persistence layer.
 *
 * The full turn cycle lives here:
 *   start → ask Q1
 *   submit answer → evaluate (hidden) → detect gap → select + ask next question
 *   finalize → aggregate evaluations → scorecard + learning recommendations
 *
 * Per-answer scores are never returned to the client from `submitAdaptiveAnswer`;
 * they surface only in `finalizeAdaptiveInterview`'s scorecard.
 */
import type { TrackKey } from "@prisma/client";
import type { ChatMessage } from "@/services/ai/mock";
import type { MockRecord } from "@/services/mocks";
import {
  createMock,
  saveMockState,
  saveMockSummary,
} from "@/services/mocks";
import { PROMPT_VERSIONS } from "@/services/ai/prompt-versions";
import { getFramework, getCompetency } from "./competencies";
import { evaluateAnswer } from "./ai/evaluator";
import { generateAdaptiveQuestion } from "./ai/interviewer";
import { selectNext } from "./planner";
import { buildScorecard } from "./scorecard";
import { describeSelection } from "./copy";
import {
  ADAPTIVE_SUMMARY_VERSION,
  isAdaptiveSummary,
  type AdaptiveScorecard,
  type AdaptiveSummary,
  type AskedQuestion,
  type Seniority,
} from "./types";
import { SENIORITY_LABELS } from "./types";

const TRACK_TITLE: Record<TrackKey, string> = {
  DSA: "Data Structures & Algorithms",
  SYSTEM_DESIGN: "System Design",
  LLD: "Low-Level Design",
  BEHAVIORAL: "Behavioral",
};

/**
 * The chat bubble shown for one interviewer question. Kept identical for the
 * live turn and the persisted transcript so a reload looks the same. Includes a
 * clear "Question X of Y", the competency focus, and a candidate-safe reason —
 * never a score.
 */
function formatQuestionMessage(args: {
  number: number;
  total: number;
  focus: string;
  question: string;
  reason: string;
}): string {
  return [
    `**Question ${args.number} of ${args.total}**  ·  _${args.focus}_`,
    args.question,
    `_↳ ${args.reason}_`,
  ].join("\n\n");
}

function buildIntro(args: {
  track: TrackKey;
  seniority: Seniority;
  total: number;
  focus: string;
  question: string;
  reason: string;
}): string {
  const welcome =
    `Welcome to your **Adaptive ${TRACK_TITLE[args.track]}** interview ` +
    `(${SENIORITY_LABELS[args.seniority]}). I'll ask around ${args.total} questions and ` +
    `adapt each one to your answers — think out loud, just like a real interview. ` +
    `You'll get a detailed scorecard at the end.`;
  return [
    welcome,
    formatQuestionMessage({
      number: 1,
      total: args.total,
      focus: args.focus,
      question: args.question,
      reason: args.reason,
    }),
  ].join("\n\n");
}

export interface StartArgs {
  userId: string;
  track: TrackKey;
  seniority: Seniority;
  problemSlug?: string | null;
  problemTitle?: string | null;
}

/** Create an adaptive interview and produce the opening question. */
export async function startAdaptiveInterview(
  args: StartArgs,
): Promise<{ id: string }> {
  const framework = getFramework(args.track, args.seniority);
  const plan = selectNext(framework, []);
  const { text } = await generateAdaptiveQuestion({
    track: args.track,
    seniority: args.seniority,
    plan,
    askedQuestions: [],
    problemTitle: args.problemTitle ?? null,
  });

  const focusName =
    getCompetency(args.track, plan.targetCompetencyId)?.name ?? "your fundamentals";
  const reason = describeSelection(plan.kind, focusName, { first: true });

  const firstQuestion: AskedQuestion = {
    index: 0,
    competencyId: plan.targetCompetencyId,
    difficulty: plan.difficulty,
    kind: plan.kind,
    text,
  };

  const summary: AdaptiveSummary = {
    version: ADAPTIVE_SUMMARY_VERSION,
    kind: "adaptive",
    config: { track: args.track, seniority: args.seniority },
    status: "active",
    plannedQuestions: framework.plannedQuestions,
    questions: [firstQuestion],
    evaluations: [],
    scorecard: null,
    promptVersions: {
      evaluator: PROMPT_VERSIONS.adaptiveEvaluator,
      interviewer: PROMPT_VERSIONS.adaptiveInterviewer,
    },
  };

  const transcript: ChatMessage[] = [
    {
      role: "assistant",
      content: buildIntro({
        track: args.track,
        seniority: args.seniority,
        total: framework.plannedQuestions,
        focus: focusName,
        question: text,
        reason,
      }),
    },
  ];

  return createMock({
    userId: args.userId,
    trackKey: args.track,
    transcript,
    mode: "adaptive",
    problemSlug: args.problemSlug ?? null,
    summary,
  });
}

export interface SubmitResult {
  /** The next question text, or null when the interview is ready to finalize. */
  question: string | null;
  /** Full markdown of the assistant's next turn (question bubble or closing note). */
  assistantMessage: string;
  done: boolean;
  answered: number;
  planned: number;
  /** 1-based number of the next question (when one was asked). */
  questionNumber: number | null;
  /** Competency focus of the next question (candidate-safe). */
  focus: string | null;
  /** Candidate-safe reason the next question was selected (no scores). */
  reason: string | null;
}

/**
 * Evaluate the candidate's answer to the current question (server-side, hidden),
 * then select and ask the next question — or signal that the interview is ready
 * to finalize. Returns only progress + the next question, never scores.
 */
export async function submitAdaptiveAnswer(
  mock: MockRecord,
  message: string,
  opts?: { problemTitle?: string | null },
): Promise<SubmitResult> {
  const summary = mock.summary;
  if (!isAdaptiveSummary(summary)) {
    throw new Error("This session is not an adaptive interview.");
  }
  if (summary.status === "completed") {
    return {
      question: null,
      assistantMessage: "",
      done: true,
      answered: summary.evaluations.length,
      planned: summary.plannedQuestions,
      questionNumber: null,
      focus: null,
      reason: null,
    };
  }

  const { track, seniority } = summary.config;
  const framework = getFramework(track, seniority);

  // The current, still-unanswered question is the last one we asked.
  const current = summary.questions[summary.questions.length - 1];
  const alreadyEvaluated = summary.evaluations.length >= summary.questions.length;

  const transcript: ChatMessage[] = [
    ...mock.transcript,
    { role: "user", content: message },
  ];

  const evaluations = [...summary.evaluations];
  if (current && !alreadyEvaluated) {
    const evaluation = await evaluateAnswer({
      track,
      seniority,
      questionIndex: current.index,
      targetCompetencyId: current.competencyId,
      difficulty: current.difficulty,
      question: current.text,
      answer: message,
    });
    evaluations.push(evaluation);
  }

  const plan = selectNext(framework, evaluations);
  const questions = [...summary.questions];

  let nextText: string | null = null;
  let questionNumber: number | null = null;
  let focus: string | null = null;
  let reason: string | null = null;
  let assistantMessage: string;
  if (plan.done) {
    assistantMessage =
      "That's the end of the questions. Click **Finish & view scorecard** whenever you're ready for your detailed evaluation.";
    transcript.push({ role: "assistant", content: assistantMessage });
  } else {
    const { text } = await generateAdaptiveQuestion({
      track,
      seniority,
      plan,
      askedQuestions: questions.map((q) => q.text),
      lastAnswer: message,
      problemTitle: opts?.problemTitle ?? null,
    });
    nextText = text;
    const nextIndex = questions.length;
    questions.push({
      index: nextIndex,
      competencyId: plan.targetCompetencyId,
      difficulty: plan.difficulty,
      kind: plan.kind,
      text,
    });
    focus = getCompetency(track, plan.targetCompetencyId)?.name ?? "your fundamentals";
    reason = describeSelection(plan.kind, focus, { first: nextIndex === 0 });
    questionNumber = nextIndex + 1;
    assistantMessage = formatQuestionMessage({
      number: questionNumber,
      total: summary.plannedQuestions,
      focus,
      question: text,
      reason,
    });
    transcript.push({ role: "assistant", content: assistantMessage });
  }

  const nextSummary: AdaptiveSummary = {
    ...summary,
    questions,
    evaluations,
  };

  await saveMockState(mock.id, transcript, nextSummary);

  return {
    question: nextText,
    assistantMessage,
    done: plan.done,
    answered: evaluations.length,
    planned: summary.plannedQuestions,
    questionNumber,
    focus,
    reason,
  };
}

/**
 * Aggregate stored evaluations into the final scorecard and mark the interview
 * complete. Idempotent: returns the existing scorecard if already finalized.
 */
export async function finalizeAdaptiveInterview(
  mock: MockRecord,
): Promise<AdaptiveScorecard> {
  const summary = mock.summary;
  if (!isAdaptiveSummary(summary)) {
    throw new Error("This session is not an adaptive interview.");
  }
  if (summary.status === "completed" && summary.scorecard) {
    return summary.scorecard;
  }

  const framework = getFramework(summary.config.track, summary.config.seniority);
  const scorecard = buildScorecard(framework, summary.evaluations, summary.questions);

  const nextSummary: AdaptiveSummary = {
    ...summary,
    status: "completed",
    scorecard,
  };
  await saveMockSummary(mock.id, nextSummary);
  return scorecard;
}
