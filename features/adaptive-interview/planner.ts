/**
 * The adaptive planner — pure, deterministic logic (no I/O) that drives which
 * question comes next. It is the primary unit-test target.
 *
 * Given the resolved framework and the evaluations gathered so far, it:
 *  1. aggregates per-competency state (weighted score, confidence, coverage),
 *  2. detects gaps (unknown or weak competencies), and
 *  3. selects the next competency, difficulty, and question "kind":
 *     - probe an UNKNOWN competency (highest weight first),
 *     - follow_up / probe the WEAKEST assessed competency to close a gap,
 *     - advance (raise difficulty) when the candidate is strong across the board.
 *
 * Difficulty adapts to recent performance, and repetition is avoided by not
 * hammering the same competency more than twice in a row while gaps remain.
 */
import type {
  AdaptivePlan,
  AnswerEvaluation,
  CompetencyFramework,
  CompetencyState,
  Difficulty,
} from "./types";
import { DIFFICULTIES } from "./types";

export const WEAK_THRESHOLD = 65;
export const STRONG_THRESHOLD = 75;
const LOW_THRESHOLD = 45;
const MAX_CONSECUTIVE_SAME = 2;

/** Aggregate all assessments into per-competency state, in framework order. */
export function aggregateState(
  framework: CompetencyFramework,
  evaluations: AnswerEvaluation[],
): CompetencyState[] {
  return framework.competencies.map((comp) => {
    const assessments = evaluations.flatMap((e) =>
      e.assessments.filter((a) => a.competencyId === comp.id),
    );
    if (assessments.length === 0) {
      return {
        competencyId: comp.id,
        score: null,
        confidence: 0,
        timesAssessed: 0,
        matchedConcepts: [],
        gaps: [],
      };
    }
    const confSum = assessments.reduce((s, a) => s + a.confidence, 0);
    const score =
      confSum > 0
        ? assessments.reduce((s, a) => s + a.score * a.confidence, 0) / confSum
        : assessments.reduce((s, a) => s + a.score, 0) / assessments.length;
    const confidence = confSum / assessments.length;
    const matchedConcepts = Array.from(
      new Set(assessments.flatMap((a) => a.matchedConcepts)),
    );
    const gaps = Array.from(new Set(assessments.flatMap((a) => a.gaps)));
    return {
      competencyId: comp.id,
      score: Math.round(score),
      confidence: Number(confidence.toFixed(2)),
      timesAssessed: assessments.length,
      matchedConcepts,
      gaps,
    };
  });
}

/** Competencies that are unknown (never assessed) or weak, worst first. */
export function detectGaps(
  framework: CompetencyFramework,
  states: CompetencyState[],
): CompetencyState[] {
  const weightOf = (id: string) => framework.weights[id] ?? 0;
  const unknown = states.filter((s) => s.score === null);
  const weak = states.filter((s) => s.score !== null && s.score < WEAK_THRESHOLD);

  unknown.sort((a, b) => weightOf(b.competencyId) - weightOf(a.competencyId));
  // Weakest gaps first, prioritized by importance (weight) and deficit.
  weak.sort((a, b) => {
    const da = weightOf(a.competencyId) * (WEAK_THRESHOLD - (a.score ?? 0));
    const db = weightOf(b.competencyId) * (WEAK_THRESHOLD - (b.score ?? 0));
    return db - da;
  });
  return [...unknown, ...weak];
}

function difficultyIndex(d: Difficulty): number {
  return DIFFICULTIES.indexOf(d);
}

/** Adapt difficulty from the baseline using the most recent target-competency score. */
export function nextDifficulty(
  framework: CompetencyFramework,
  evaluations: AnswerEvaluation[],
  targetCompetencyId: string,
): Difficulty {
  let idx = difficultyIndex(framework.baselineDifficulty);
  // Most recent assessment of the target competency, if any.
  for (let i = evaluations.length - 1; i >= 0; i--) {
    const a = evaluations[i].assessments.find(
      (x) => x.competencyId === targetCompetencyId,
    );
    if (a) {
      if (a.score >= STRONG_THRESHOLD) idx += 1;
      else if (a.score <= LOW_THRESHOLD) idx -= 1;
      break;
    }
  }
  idx = Math.max(0, Math.min(DIFFICULTIES.length - 1, idx));
  return DIFFICULTIES[idx];
}

/** How many of the last questions targeted this competency (consecutively). */
function consecutiveTargeting(
  evaluations: AnswerEvaluation[],
  competencyId: string,
): number {
  let n = 0;
  for (let i = evaluations.length - 1; i >= 0; i--) {
    if (evaluations[i].targetCompetencyId === competencyId) n++;
    else break;
  }
  return n;
}

/**
 * Decide the next question. `evaluations` are the answers scored so far (its
 * length is the number of questions already answered).
 */
export function selectNext(
  framework: CompetencyFramework,
  evaluations: AnswerEvaluation[],
): AdaptivePlan {
  const answered = evaluations.length;
  if (answered >= framework.plannedQuestions) {
    return {
      done: true,
      targetCompetencyId: framework.competencies[0]?.id ?? "",
      difficulty: framework.baselineDifficulty,
      kind: "probe",
      rationale: "Planned question count reached.",
    };
  }

  const states = aggregateState(framework, evaluations);
  const gaps = detectGaps(framework, states);
  const lastTarget = evaluations[answered - 1]?.targetCompetencyId;

  // Prefer a gap the interview hasn't just hammered repeatedly.
  const pickable = gaps.filter(
    (g) => consecutiveTargeting(evaluations, g.competencyId) < MAX_CONSECUTIVE_SAME,
  );
  const chosen = pickable[0] ?? gaps[0];

  if (chosen) {
    const state = states.find((s) => s.competencyId === chosen.competencyId)!;
    const unknown = state.score === null;
    const difficulty = nextDifficulty(framework, evaluations, chosen.competencyId);
    const isFollowUp =
      !unknown && lastTarget === chosen.competencyId && state.confidence >= 0.4;
    return {
      done: false,
      targetCompetencyId: chosen.competencyId,
      difficulty,
      kind: isFollowUp ? "follow_up" : "probe",
      rationale: unknown
        ? "Probing an unassessed competency."
        : `Closing a gap in ${chosen.competencyId} (score ${state.score}).`,
    };
  }

  // No gaps: candidate is strong everywhere assessed. Stretch on the
  // highest-weight competency at a raised difficulty.
  const byWeight = [...framework.competencies].sort(
    (a, b) => (framework.weights[b.id] ?? 0) - (framework.weights[a.id] ?? 0),
  );
  const target =
    byWeight.find(
      (c) => consecutiveTargeting(evaluations, c.id) < MAX_CONSECUTIVE_SAME,
    ) ?? byWeight[0];
  return {
    done: false,
    targetCompetencyId: target.id,
    difficulty: nextDifficulty(framework, evaluations, target.id),
    kind: "advance",
    rationale: "Candidate strong across competencies; raising difficulty.",
  };
}
