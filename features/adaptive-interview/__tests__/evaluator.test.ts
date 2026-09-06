import { describe, it, expect } from "vitest";
import { heuristicEvaluateAnswer } from "../ai/evaluator";
import { getCompetency } from "../competencies";
import type { EvaluateArgs } from "../ai/evaluator";

const base: Omit<EvaluateArgs, "answer"> = {
  track: "DSA",
  seniority: "senior",
  questionIndex: 2,
  targetCompetencyId: "problem_solving",
  difficulty: "medium",
  question: "How do you approach a new problem?",
};

const concepts = getCompetency("DSA", "problem_solving")!.expectedConcepts;

describe("heuristicEvaluateAnswer", () => {
  it("detects the expected concepts an answer references", () => {
    const answer =
      "I clarify the input and walk through examples, describe a brute force baseline, " +
      "look for a pattern, refine my approach, and keep an invariant so each step is provably correct.";
    const evaluation = heuristicEvaluateAnswer({ ...base, answer });
    const a = evaluation.assessments[0];
    for (const c of concepts) {
      expect(a.matchedConcepts.map((m) => m.toLowerCase())).toContain(c.toLowerCase());
    }
    expect(a.score).toBeGreaterThanOrEqual(70);
  });

  it("scores a vague, short answer low with low confidence", () => {
    const evaluation = heuristicEvaluateAnswer({ ...base, answer: "I'm not sure, maybe try stuff." });
    const a = evaluation.assessments[0];
    expect(a.score).toBeLessThan(40);
    expect(a.confidence).toBeLessThan(0.5);
    expect(a.gaps.length).toBeGreaterThan(0);
  });

  it("produces a well-formed, deterministic evaluation", () => {
    const answer = "I clarify the requirements and think about the approach and pattern.";
    const first = heuristicEvaluateAnswer({ ...base, answer });
    const second = heuristicEvaluateAnswer({ ...base, answer });
    expect(first).toEqual(second); // deterministic

    expect(first.aiGenerated).toBe(false);
    expect(first.promptVersion).toBe("heuristic@2026-02");
    expect(first.questionIndex).toBe(2);
    expect(first.targetCompetencyId).toBe("problem_solving");
    expect(first.difficulty).toBe("medium");

    const a = first.assessments[0];
    expect(a.competencyId).toBe("problem_solving");
    expect(a.score).toBeGreaterThanOrEqual(0);
    expect(a.score).toBeLessThanOrEqual(100);
    expect(a.confidence).toBeGreaterThanOrEqual(0);
    expect(a.confidence).toBeLessThanOrEqual(1);
  });

  it("ranks a concept-rich answer above a concept-poor one", () => {
    const rich = heuristicEvaluateAnswer({
      ...base,
      answer:
        "I clarify constraints, review examples, start from brute force, find a pattern, and set an invariant to shape my approach.",
    });
    const poor = heuristicEvaluateAnswer({
      ...base,
      answer:
        "I would just write some code and see if it works after a while of trying things out on the computer.",
    });
    expect(rich.assessments[0].score).toBeGreaterThan(poor.assessments[0].score);
  });
});
