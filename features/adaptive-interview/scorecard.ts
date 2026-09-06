/**
 * Final scorecard aggregation — pure, deterministic (no I/O). Turns the stored
 * per-answer evaluations into the end-of-interview scorecard: overall + per
 * competency scores, evidence, strengths, weaknesses, aggregate confidence, and
 * recommended learning topics mapped from the weakest competencies.
 *
 * The "AI" already happened per answer (evaluator.ts); this layer only
 * aggregates, so it always works and is fully unit-testable.
 */
import type { TrackKey } from "@prisma/client";
import type {
  AdaptiveScorecard,
  AnswerEvaluation,
  AskedQuestion,
  CompetencyFramework,
  CompetencyState,
  LearningRecommendation,
  ScorecardPathStep,
} from "./types";
import { aggregateState, detectGaps, STRONG_THRESHOLD } from "./planner";
import { describeSelection } from "./copy";

/** Base learning route per track (behavioral has no dedicated hub → undefined). */
const TRACK_LEARNING_HREF: Partial<Record<TrackKey, string>> = {
  DSA: "/learning/dsa",
  SYSTEM_DESIGN: "/learning/system-design",
  LLD: "/learning/lld",
};

/** Short, human learning topic per competency, used for recommendations. */
const COMPETENCY_TOPICS: Record<string, string> = {
  // DSA
  problem_solving: "Problem-solving patterns and structured decomposition",
  algorithms: "Core data structures & algorithm selection",
  complexity: "Time & space complexity analysis",
  correctness: "Edge cases and correctness reasoning",
  code_quality: "Writing clean, maintainable interview code",
  // System design
  requirements: "Clarifying functional & non-functional requirements",
  estimation: "Back-of-the-envelope capacity estimation",
  architecture: "High-level architecture and component design",
  data_modeling: "Data modeling and storage selection",
  scalability: "Scaling, sharding, and reliability",
  tradeoffs: "Reasoning about trade-offs (CAP, consistency, latency)",
  // LLD
  oo_modeling: "Object-oriented modeling and responsibilities",
  solid: "SOLID principles in practice",
  design_patterns: "Applying design patterns appropriately",
  extensibility: "Designing for extensibility and change",
  concurrency: "Thread-safety and concurrency edge cases",
  // Behavioral
  star_structure: "Structuring answers with STAR",
  ownership: "Demonstrating ownership and initiative",
  impact: "Quantifying impact and results",
  leadership: "Leadership and influence without authority",
  collaboration: "Collaboration and conflict resolution",
  // Shared
  communication: "Communicating clearly under interview pressure",
};

/** Map the weakest competencies to concrete learning recommendations. */
export function recommendTopics(
  framework: CompetencyFramework,
  states: CompetencyState[],
  limit = 4,
): LearningRecommendation[] {
  const gaps = detectGaps(framework, states);
  const href = TRACK_LEARNING_HREF[framework.track];
  return gaps.slice(0, limit).map((g) => {
    const comp = framework.competencies.find((c) => c.id === g.competencyId);
    const topic = COMPETENCY_TOPICS[g.competencyId] ?? comp?.name ?? g.competencyId;
    const reason =
      g.score === null
        ? "Not demonstrated during the interview — worth practicing."
        : `Scored ${g.score}/100 — below the target bar.`;
    return { competencyId: g.competencyId, topic, reason, href };
  });
}

function nameOf(framework: CompetencyFramework, id: string): string {
  return framework.competencies.find((c) => c.id === id)?.name ?? id;
}

/**
 * Reconstruct the candidate-visible interview path from the asked questions.
 * Each answered question maps to one step explaining (in candidate-safe terms)
 * why it was selected. Trailing unanswered questions are excluded.
 */
function buildPath(
  framework: CompetencyFramework,
  evaluations: AnswerEvaluation[],
  questions: AskedQuestion[],
): ScorecardPathStep[] {
  return questions.slice(0, evaluations.length).map((q, i) => {
    const name = nameOf(framework, q.competencyId);
    return {
      questionNumber: i + 1,
      competencyId: q.competencyId,
      competencyName: name,
      kind: q.kind,
      difficulty: q.difficulty,
      reason: describeSelection(q.kind, name, { first: i === 0 }),
    };
  });
}

/** Build the full end-of-interview scorecard from stored evaluations. */
export function buildScorecard(
  framework: CompetencyFramework,
  evaluations: AnswerEvaluation[],
  questions: AskedQuestion[] = [],
): AdaptiveScorecard {
  const states = aggregateState(framework, evaluations);

  const competencyScores = states.map((s) => {
    const evidence = Array.from(
      new Set(
        evaluations
          .flatMap((e) => e.assessments)
          .filter((a) => a.competencyId === s.competencyId)
          .flatMap((a) => a.evidence),
      ),
    ).slice(0, 3);
    return {
      competencyId: s.competencyId,
      name: nameOf(framework, s.competencyId),
      score: s.score,
      confidence: s.confidence,
      timesAssessed: s.timesAssessed,
      evidence,
      gaps: s.gaps.slice(0, 3),
    };
  });

  // Overall = weight-normalized average over ASSESSED competencies.
  const assessed = states.filter((s) => s.score !== null);
  const weightSum = assessed.reduce(
    (sum, s) => sum + (framework.weights[s.competencyId] ?? 0),
    0,
  );
  const overallScore =
    assessed.length === 0
      ? 0
      : weightSum > 0
        ? Math.round(
            assessed.reduce(
              (sum, s) =>
                sum + (s.score as number) * (framework.weights[s.competencyId] ?? 0),
              0,
            ) / weightSum,
          )
        : Math.round(
            assessed.reduce((sum, s) => sum + (s.score as number), 0) /
              assessed.length,
          );

  const confidence =
    assessed.length === 0
      ? 0
      : Number(
          (
            assessed.reduce((sum, s) => sum + s.confidence, 0) / assessed.length
          ).toFixed(2),
        );

  const strengths = [...assessed]
    .filter((s) => (s.score as number) >= STRONG_THRESHOLD)
    .sort((a, b) => (b.score as number) - (a.score as number))
    .map((s) => `${nameOf(framework, s.competencyId)} (${s.score}/100)`);

  const gapStates = detectGaps(framework, states);
  const weaknesses = gapStates.map((s) =>
    s.score === null
      ? `${nameOf(framework, s.competencyId)} (not assessed)`
      : `${nameOf(framework, s.competencyId)} (${s.score}/100)`,
  );

  return {
    overallScore,
    confidence,
    competencyScores,
    strengths,
    weaknesses,
    recommendedTopics: recommendTopics(framework, states),
    aiGenerated: evaluations.some((e) => e.aiGenerated),
    answeredCount: evaluations.length,
    plannedCount: framework.plannedQuestions,
    path: buildPath(framework, evaluations, questions),
  };
}
