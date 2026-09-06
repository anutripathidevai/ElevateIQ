import { describe, it, expect } from "vitest";
import {
  describeSelection,
  selectionKindLabel,
  answerHint,
} from "../copy";
import { QUESTION_KINDS } from "../types";

describe("describeSelection", () => {
  it("never leaks scores, numbers, or internal grading language", () => {
    // Build the exhaustive set of candidate-facing strings.
    const strings: string[] = [
      describeSelection("probe", "Algorithms", { first: true }),
      ...QUESTION_KINDS.map((k) => describeSelection(k, "Algorithms")),
      ...QUESTION_KINDS.map((k) => describeSelection(k, "Algorithms", { first: true })),
    ];
    for (const s of strings) {
      expect(s).not.toMatch(/\d/); // no digits at all
      expect(s.toLowerCase()).not.toContain("score");
      expect(s.toLowerCase()).not.toContain("confidence");
      expect(s.toLowerCase()).not.toContain("rubric");
      // the competency name is included, and copy is non-trivial
      expect(s).toContain("Algorithms");
      expect(s.length).toBeGreaterThan(10);
    }
  });

  it("uses a distinct opener for the first question", () => {
    const first = describeSelection("probe", "Data Modeling", { first: true });
    expect(first.toLowerCase()).toContain("starting with");
  });

  it("differentiates follow-ups from new areas and stretches", () => {
    expect(describeSelection("follow_up", "SOLID").toLowerCase()).toContain("deeper");
    expect(describeSelection("probe", "SOLID").toLowerCase()).toContain("new area");
    expect(describeSelection("advance", "SOLID").toLowerCase()).toMatch(/challenge|well/);
  });
});

describe("selectionKindLabel", () => {
  it("labels every question kind", () => {
    for (const k of QUESTION_KINDS) {
      expect(selectionKindLabel(k).length).toBeGreaterThan(0);
    }
    expect(selectionKindLabel("follow_up")).toBe("Follow-up");
  });
});

describe("answerHint", () => {
  it("returns a non-empty hint for every seniority (and a default)", () => {
    for (const s of ["junior", "mid", "senior", "staff", "unknown"]) {
      expect(answerHint(s).length).toBeGreaterThan(0);
    }
    // scales up for staff
    expect(answerHint("staff")).toMatch(/trade-offs/i);
  });
});
