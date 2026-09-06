import { describe, it, expect } from "vitest";
import { getFramework } from "../competencies";
import { buildScorecard, recommendTopics } from "../scorecard";
import { aggregateState } from "../planner";
import type { AnswerEvaluation, AskedQuestion, Difficulty } from "../types";

const fw = getFramework("DSA", "senior");
const ids = fw.competencies.map((c) => c.id);

function mkEval(
  target: string,
  scores: Record<string, [number, number]>,
  aiGenerated = false,
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
      evidence: [`evidence for ${competencyId}`],
      strengths: [],
      gaps: [`gap in ${competencyId}`],
    })),
    aiGenerated,
    promptVersion: "test",
  };
}

const allScores = (v: [number, number]): Record<string, [number, number]> =>
  Object.fromEntries(ids.map((id) => [id, v]));

describe("buildScorecard", () => {
  it("computes a weighted overall over assessed competencies", () => {
    const card = buildScorecard(fw, [mkEval(ids[0], allScores([80, 0.8]))]);
    expect(card.overallScore).toBe(80); // all equal -> weighted avg is 80
    expect(card.confidence).toBeCloseTo(0.8, 2);
    expect(card.competencyScores).toHaveLength(ids.length);
  });

  it("lists strong competencies as strengths and hides weak ones", () => {
    const card = buildScorecard(fw, [mkEval(ids[0], allScores([88, 0.85]))]);
    expect(card.strengths.length).toBe(ids.length);
    expect(card.weaknesses).toHaveLength(0);
    expect(card.strengths[0]).toMatch(/\(88\/100\)/);
  });

  it("surfaces unknown competencies as weaknesses, not strengths", () => {
    // Assess only one competency (weakly); the rest stay unknown.
    const card = buildScorecard(fw, [mkEval(ids[0], { [ids[0]]: [30, 0.7] })]);
    const unknown = card.competencyScores.filter((c) => c.score === null);
    expect(unknown.length).toBe(ids.length - 1);
    expect(card.weaknesses.some((w) => /not assessed/.test(w))).toBe(true);
    expect(card.weaknesses.some((w) => /\(30\/100\)/.test(w))).toBe(true);
    expect(card.overallScore).toBe(30);
  });

  it("carries through the aiGenerated flag", () => {
    expect(buildScorecard(fw, [mkEval(ids[0], allScores([70, 0.7]), true)]).aiGenerated).toBe(
      true,
    );
    expect(buildScorecard(fw, [mkEval(ids[0], allScores([70, 0.7]), false)]).aiGenerated).toBe(
      false,
    );
  });

  it("attaches evidence to competency scores", () => {
    const card = buildScorecard(fw, [mkEval(ids[0], { [ids[0]]: [70, 0.7] })]);
    const entry = card.competencyScores.find((c) => c.competencyId === ids[0])!;
    expect(entry.evidence.length).toBeGreaterThan(0);
  });

  it("reports answered/planned counts", () => {
    const card = buildScorecard(fw, [
      mkEval(ids[0], allScores([70, 0.7])),
      mkEval(ids[1], allScores([70, 0.7])),
    ]);
    expect(card.answeredCount).toBe(2);
    expect(card.plannedCount).toBe(fw.plannedQuestions);
  });

  it("builds an adaptive path aligned to answered questions only", () => {
    const evals = [
      mkEval(ids[0], allScores([70, 0.7])),
      mkEval(ids[1], allScores([70, 0.7])),
    ];
    const questions: AskedQuestion[] = [
      { index: 0, competencyId: ids[0], difficulty: "medium", kind: "probe", text: "Q1" },
      { index: 1, competencyId: ids[1], difficulty: "medium", kind: "follow_up", text: "Q2" },
      // A trailing, unanswered question that must NOT appear in the path.
      { index: 2, competencyId: ids[0], difficulty: "hard", kind: "advance", text: "Q3" },
    ];
    const card = buildScorecard(fw, evals, questions);
    expect(card.path).toHaveLength(2);
    expect(card.path![0].questionNumber).toBe(1);
    expect(card.path![0].competencyId).toBe(ids[0]);
    expect(card.path![1].kind).toBe("follow_up");
    // Reasons are candidate-safe: no digits.
    for (const step of card.path!) {
      expect(step.reason).not.toMatch(/\d/);
      expect(step.reason.length).toBeGreaterThan(10);
    }
  });

  it("defaults to an empty path when no questions are provided", () => {
    const card = buildScorecard(fw, [mkEval(ids[0], allScores([70, 0.7]))]);
    expect(card.path).toEqual([]);
  });
});

describe("recommendTopics", () => {
  it("maps the weakest competencies to learning topics with a track href", () => {
    const states = aggregateState(fw, [mkEval(ids[0], { [ids[0]]: [20, 0.7] })]);
    const recs = recommendTopics(fw, states);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.length).toBeLessThanOrEqual(4);
    for (const r of recs) {
      expect(r.topic.length).toBeGreaterThan(0);
      expect(r.reason.length).toBeGreaterThan(0);
      expect(r.href).toBe("/learning/dsa");
    }
  });

  it("returns nothing to recommend when every competency is strong", () => {
    const states = aggregateState(fw, [mkEval(ids[0], allScores([90, 0.9]))]);
    expect(recommendTopics(fw, states)).toHaveLength(0);
  });
});
