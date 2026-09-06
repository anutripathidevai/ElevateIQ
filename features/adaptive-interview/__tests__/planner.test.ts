import { describe, it, expect } from "vitest";
import { getFramework } from "../competencies";
import {
  aggregateState,
  detectGaps,
  nextDifficulty,
  selectNext,
} from "../planner";
import type { AnswerEvaluation, CompetencyFramework, Difficulty } from "../types";

const fw = getFramework("DSA", "senior"); // 6 competencies, planned 6, baseline "medium"
const ids = fw.competencies.map((c) => c.id);

function highestWeight(f: CompetencyFramework): string {
  return [...f.competencies].sort(
    (a, b) => (f.weights[b.id] ?? 0) - (f.weights[a.id] ?? 0),
  )[0].id;
}

/** Build a synthetic evaluation. `scores` maps competencyId -> [score, confidence]. */
function mkEval(
  target: string,
  scores: Record<string, [number, number]>,
  difficulty: Difficulty = "medium",
): AnswerEvaluation {
  return {
    questionIndex: 0,
    targetCompetencyId: target,
    difficulty,
    assessments: Object.entries(scores).map(([competencyId, [score, confidence]]) => ({
      competencyId,
      score,
      confidence,
      matchedConcepts: [],
      evidence: [],
      strengths: [],
      gaps: [],
    })),
    aiGenerated: false,
    promptVersion: "test",
  };
}

function assessAll(value: [number, number]): Record<string, [number, number]> {
  return Object.fromEntries(ids.map((id) => [id, value]));
}

describe("aggregateState", () => {
  it("marks never-assessed competencies as unknown (score null)", () => {
    const states = aggregateState(fw, []);
    expect(states).toHaveLength(ids.length);
    for (const s of states) {
      expect(s.score).toBeNull();
      expect(s.timesAssessed).toBe(0);
      expect(s.confidence).toBe(0);
    }
  });

  it("computes a confidence-weighted score per competency", () => {
    const evals = [
      mkEval(ids[0], { [ids[0]]: [40, 0.2] }),
      mkEval(ids[0], { [ids[0]]: [90, 0.8] }),
    ];
    const s = aggregateState(fw, evals).find((x) => x.competencyId === ids[0])!;
    // Weighted: (40*0.2 + 90*0.8) / (0.2+0.8) = 80
    expect(s.score).toBe(80);
    expect(s.timesAssessed).toBe(2);
  });
});

describe("detectGaps", () => {
  it("returns unknown competencies before weak ones", () => {
    // Assess only one competency, weakly; the rest are unknown.
    const evals = [mkEval(ids[1], { [ids[1]]: [30, 0.7] })];
    const states = aggregateState(fw, evals);
    const gaps = detectGaps(fw, states);
    const unknownCount = states.filter((s) => s.score === null).length;
    // The first `unknownCount` gaps are the unknown ones; the weak one comes last.
    expect(gaps.slice(0, unknownCount).every((g) => g.score === null)).toBe(true);
    expect(gaps[gaps.length - 1].competencyId).toBe(ids[1]);
  });

  it("excludes strong competencies from gaps", () => {
    const evals = [mkEval(ids[0], assessAll([85, 0.8]))];
    const gaps = detectGaps(fw, aggregateState(fw, evals));
    expect(gaps).toHaveLength(0);
  });
});

describe("nextDifficulty", () => {
  it("raises difficulty after a strong answer, lowers after a weak one", () => {
    const strong = [mkEval("complexity", { complexity: [90, 0.9] })];
    const weak = [mkEval("complexity", { complexity: [30, 0.5] })];
    const mid = [mkEval("complexity", { complexity: [60, 0.6] })];
    expect(nextDifficulty(fw, strong, "complexity")).toBe("hard"); // medium -> hard
    expect(nextDifficulty(fw, weak, "complexity")).toBe("easy"); // medium -> easy
    expect(nextDifficulty(fw, mid, "complexity")).toBe("medium");
  });

  it("never exceeds the difficulty ladder bounds", () => {
    const junior = getFramework("DSA", "junior"); // baseline "easy"
    const weak = [mkEval("problem_solving", { problem_solving: [10, 0.4] })];
    expect(nextDifficulty(junior, weak, "problem_solving")).toBe("easy");
  });
});

describe("selectNext", () => {
  it("probes the highest-weight unknown competency first", () => {
    const plan = selectNext(fw, []);
    expect(plan.done).toBe(false);
    expect(plan.kind).toBe("probe");
    expect(plan.targetCompetencyId).toBe(highestWeight(fw));
  });

  it("is done once the planned question count is reached", () => {
    const evals = Array.from({ length: fw.plannedQuestions }, (_, i) =>
      mkEval(ids[i % ids.length], assessAll([80, 0.8])),
    );
    expect(selectNext(fw, evals).done).toBe(true);
  });

  it("advances (raises difficulty) when the candidate is strong everywhere", () => {
    const plan = selectNext(fw, [mkEval(ids[0], assessAll([88, 0.85]))]);
    expect(plan.done).toBe(false);
    expect(plan.kind).toBe("advance");
  });

  it("produces a focused follow-up on a weak, confidently-assessed competency", () => {
    // All competencies assessed; only `algorithms` is weak, targeted last.
    const scores = assessAll([82, 0.8]);
    scores["algorithms"] = [48, 0.7];
    const plan = selectNext(fw, [mkEval("algorithms", scores)]);
    expect(plan.targetCompetencyId).toBe("algorithms");
    expect(plan.kind).toBe("follow_up");
  });

  it("avoids hammering the same competency more than twice in a row", () => {
    // Two answers in a row on `algorithms` (still weak); other competencies unknown.
    const evals = [
      mkEval("algorithms", { algorithms: [40, 0.7] }),
      mkEval("algorithms", { algorithms: [42, 0.7] }),
    ];
    const plan = selectNext(fw, evals);
    expect(plan.targetCompetencyId).not.toBe("algorithms");
  });
});
