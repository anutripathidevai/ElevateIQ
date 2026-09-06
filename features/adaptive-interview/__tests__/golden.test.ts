import { describe, it, expect } from "vitest";
import { GOLDEN_CASES } from "../golden/dataset";
import { heuristicEvaluateAnswer } from "../ai/evaluator";
import { getCompetency } from "../competencies";

const STRONG_FLOOR = 50; // strong answers must clear this
const WEAK_CEILING = 45; // weak answers must stay under this

function scoreOf(c: (typeof GOLDEN_CASES)[number]): number {
  return heuristicEvaluateAnswer({
    track: c.track,
    seniority: c.seniority,
    questionIndex: 0,
    targetCompetencyId: c.competencyId,
    difficulty: c.difficulty,
    question: c.question,
    answer: c.answer,
  }).assessments[0].score;
}

describe("golden dataset integrity", () => {
  it("has 30-50 cases with unique ids and both qualities represented", () => {
    expect(GOLDEN_CASES.length).toBeGreaterThanOrEqual(30);
    expect(GOLDEN_CASES.length).toBeLessThanOrEqual(50);
    const ids = GOLDEN_CASES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(GOLDEN_CASES.some((c) => c.quality === "strong")).toBe(true);
    expect(GOLDEN_CASES.some((c) => c.quality === "weak")).toBe(true);
  });

  it("references valid competencies and well-formed score bands", () => {
    for (const c of GOLDEN_CASES) {
      const comp = getCompetency(c.track, c.competencyId);
      expect(comp, `${c.id} -> ${c.track}/${c.competencyId}`).toBeDefined();
      const [min, max] = c.expectedScore;
      expect(min).toBeGreaterThanOrEqual(0);
      expect(max).toBeLessThanOrEqual(100);
      expect(min).toBeLessThanOrEqual(max);
    }
  });

  it("only lists expected concepts that belong to the target competency", () => {
    for (const c of GOLDEN_CASES) {
      const valid = (getCompetency(c.track, c.competencyId)?.expectedConcepts ?? []).map(
        (x) => x.toLowerCase(),
      );
      for (const concept of c.expectedConcepts) {
        expect(valid, `${c.id}: "${concept}"`).toContain(concept.toLowerCase());
      }
    }
  });
});

describe("evaluator golden regression", () => {
  it("recalls every expected concept in strong answers", () => {
    for (const c of GOLDEN_CASES.filter((x) => x.quality === "strong")) {
      const evaluation = heuristicEvaluateAnswer({
        track: c.track,
        seniority: c.seniority,
        questionIndex: 0,
        targetCompetencyId: c.competencyId,
        difficulty: c.difficulty,
        question: c.question,
        answer: c.answer,
      });
      const matched = evaluation.assessments[0].matchedConcepts.map((m) => m.toLowerCase());
      for (const concept of c.expectedConcepts) {
        expect(matched, `${c.id}: "${concept}"`).toContain(concept.toLowerCase());
      }
    }
  });

  it("scores strong answers high and weak answers low", () => {
    for (const c of GOLDEN_CASES) {
      const score = scoreOf(c);
      if (c.quality === "strong") {
        expect(score, `${c.id} (strong)`).toBeGreaterThanOrEqual(STRONG_FLOOR);
      } else {
        expect(score, `${c.id} (weak)`).toBeLessThanOrEqual(WEAK_CEILING);
      }
    }
  });

  it("separates the strong and weak populations", () => {
    const strong = GOLDEN_CASES.filter((c) => c.quality === "strong").map(scoreOf);
    const weak = GOLDEN_CASES.filter((c) => c.quality === "weak").map(scoreOf);
    expect(Math.min(...strong)).toBeGreaterThan(Math.max(...weak));
  });
});
