import { describe, expect, it } from "vitest";
import type { CompanyQuestion } from "@/features/company-bank/types";
import {
  collectCategories,
  collectTags,
  filterQuestions,
  sortQuestions,
  summarizeProgress,
} from "@/features/company-bank/utils";

function q(overrides: Partial<CompanyQuestion>): CompanyQuestion {
  return {
    id: "id",
    company: "Test",
    companySlug: "test",
    category: "CODING",
    difficulty: "MEDIUM",
    experienceLevel: "MID",
    tags: [],
    question: "Question?",
    expectedAnswer: "Answer.",
    hints: [],
    followUps: [],
    resources: [],
    ...overrides,
  };
}

const fixture: CompanyQuestion[] = [
  q({ id: "a", category: "CODING", difficulty: "HARD", experienceLevel: "SENIOR", tags: ["graph"], question: "Shortest path in a weighted graph" }),
  q({ id: "b", category: "BEHAVIORAL", difficulty: "EASY", experienceLevel: "ENTRY", tags: ["ownership"], question: "Tell me about ownership" }),
  q({ id: "c", category: "CODING", difficulty: "EASY", experienceLevel: "INTERN", tags: ["arrays", "graph"], question: "Merge two arrays" }),
];

describe("company-bank/utils", () => {
  it("filters by category", () => {
    const out = filterQuestions(fixture, { category: "CODING" });
    expect(out.map((x) => x.id).sort()).toEqual(["a", "c"]);
  });

  it("filters by difficulty and experience level", () => {
    expect(filterQuestions(fixture, { difficulty: "EASY" })).toHaveLength(2);
    expect(
      filterQuestions(fixture, { experienceLevel: "SENIOR" }).map((x) => x.id),
    ).toEqual(["a"]);
  });

  it("treats ALL as no constraint", () => {
    expect(
      filterQuestions(fixture, { category: "ALL", difficulty: "ALL" }),
    ).toHaveLength(3);
  });

  it("filters by tag", () => {
    expect(filterQuestions(fixture, { tag: "graph" }).map((x) => x.id).sort()).toEqual([
      "a",
      "c",
    ]);
  });

  it("searches question text and tags, token-wise", () => {
    expect(filterQuestions(fixture, { search: "graph" })).toHaveLength(2);
    expect(filterQuestions(fixture, { search: "merge arrays" })).toHaveLength(1);
    expect(filterQuestions(fixture, { search: "nonexistent" })).toHaveLength(0);
  });

  it("filters to bookmarked only", () => {
    const out = filterQuestions(fixture, {
      bookmarkedOnly: true,
      bookmarkedIds: new Set(["b"]),
    });
    expect(out.map((x) => x.id)).toEqual(["b"]);
  });

  it("sorts by difficulty then seniority then text", () => {
    const sorted = sortQuestions(fixture).map((x) => x.id);
    // EASY(INTERN) c, EASY(ENTRY) b, HARD a
    expect(sorted).toEqual(["c", "b", "a"]);
  });

  it("collects unique sorted tags and categories", () => {
    expect(collectTags(fixture)).toEqual(["arrays", "graph", "ownership"]);
    expect(collectCategories(fixture)).toEqual(["BEHAVIORAL", "CODING"]);
  });

  it("summarizes progress", () => {
    const status = new Map<string, "TODO" | "ATTEMPTED" | "SOLVED">([
      ["a", "SOLVED"],
      ["b", "ATTEMPTED"],
    ]);
    const summary = summarizeProgress(fixture, status);
    expect(summary).toEqual({
      solved: 1,
      attempted: 1,
      total: 3,
      percent: 33,
    });
  });
});
