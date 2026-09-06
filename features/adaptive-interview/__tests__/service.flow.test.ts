/**
 * End-to-end flow test for the adaptive interview service, exercised in the
 * database-less + no-Azure path (in-memory store + heuristic evaluator). This is
 * the "verify the complete flow" check:
 *   Configure → Ask → Answer → Evaluate → Select next → Complete → Scorecard.
 */
import { describe, it, expect } from "vitest";
import {
  startAdaptiveInterview,
  submitAdaptiveAnswer,
  finalizeAdaptiveInterview,
} from "../service";
import { getMock, listAdaptiveScores } from "@/services/mocks";
import { isAdaptiveSummary } from "../types";

const USER = "flow-test-user";

const SAMPLE_ANSWER =
  "I'd start by clarifying the requirements and constraints, then pick a hash map " +
  "for O(1) lookups. I'd walk through the time and space complexity, handle the " +
  "edge cases like empty input and duplicates, and finally test with a couple of " +
  "examples to confirm correctness before optimizing.";

describe("adaptive interview — full flow (heuristic mode)", () => {
  it("runs configure → ask → answer → evaluate → next → complete → scorecard", async () => {
    const { id } = await startAdaptiveInterview({
      userId: USER,
      track: "DSA",
      seniority: "senior",
    });

    let mock = await getMock(id);
    expect(mock).not.toBeNull();
    expect(isAdaptiveSummary(mock!.summary)).toBe(true);

    const planned = (mock!.summary as { plannedQuestions: number }).plannedQuestions;
    expect(planned).toBeGreaterThan(1);

    // The opening turn shows "Question 1 of N".
    expect(mock!.transcript[0].content).toContain(`Question 1 of ${planned}`);

    // Answer questions until the planner says we're done.
    let lastResult = await submitAdaptiveAnswer(mock!, SAMPLE_ANSWER);
    let guard = 0;
    while (!lastResult.done && guard < 12) {
      // Each non-final turn returns a candidate-safe next-question message with
      // a numbered header, a focus, and a reason — but never a score/number in
      // the reason line.
      expect(lastResult.assistantMessage).toContain("Question");
      expect(lastResult.focus).toBeTruthy();
      expect(lastResult.reason).toBeTruthy();
      expect(lastResult.reason!).not.toMatch(/\d/);
      // The result must not carry any per-answer score fields.
      expect(lastResult).not.toHaveProperty("score");
      expect(lastResult).not.toHaveProperty("overallScore");

      mock = await getMock(id);
      lastResult = await submitAdaptiveAnswer(mock!, SAMPLE_ANSWER);
      guard += 1;
    }
    expect(lastResult.done).toBe(true);
    expect(lastResult.answered).toBe(planned);

    // Finalize → scorecard with path + counts.
    mock = await getMock(id);
    const scorecard = await finalizeAdaptiveInterview(mock!);
    expect(scorecard.overallScore).toBeGreaterThanOrEqual(0);
    expect(scorecard.overallScore).toBeLessThanOrEqual(100);
    expect(scorecard.answeredCount).toBe(planned);
    expect(scorecard.plannedCount).toBe(planned);
    expect(scorecard.path).toBeTruthy();
    expect(scorecard.path!.length).toBe(planned);
    for (const step of scorecard.path!) {
      expect(step.reason).not.toMatch(/\d/);
      expect(step.competencyName.length).toBeGreaterThan(0);
    }

    // The completed interview is now discoverable in the score history.
    const history = await listAdaptiveScores(USER, "DSA");
    expect(history.length).toBeGreaterThanOrEqual(1);
    const entry = history.find((h) => h.id === id);
    expect(entry).toBeTruthy();
    expect(entry!.overallScore).toBe(scorecard.overallScore);
  });

  it("finalize is idempotent", async () => {
    const { id } = await startAdaptiveInterview({
      userId: USER,
      track: "LLD",
      seniority: "mid",
    });
    let mock = await getMock(id);
    let res = await submitAdaptiveAnswer(mock!, SAMPLE_ANSWER);
    let guard = 0;
    while (!res.done && guard < 12) {
      mock = await getMock(id);
      res = await submitAdaptiveAnswer(mock!, SAMPLE_ANSWER);
      guard += 1;
    }
    mock = await getMock(id);
    const first = await finalizeAdaptiveInterview(mock!);
    const again = await finalizeAdaptiveInterview((await getMock(id))!);
    expect(again.overallScore).toBe(first.overallScore);
  });
});
