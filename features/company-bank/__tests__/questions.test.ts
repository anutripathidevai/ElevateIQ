import { describe, expect, it } from "vitest";
import {
  allQuestions,
  getCompany,
  getQuestion,
  listCompanies,
  questionsForCompany,
} from "@/features/company-bank/services/questions";

/**
 * Integration-ish test: exercises the real content loader against the shipped
 * content/companies/*.json files, so malformed content or a broken schema fails
 * the build.
 */
describe("company-bank/questions loader", () => {
  it("loads companies from content and injects company fields", () => {
    const companies = listCompanies();
    expect(companies.length).toBeGreaterThanOrEqual(3);
    for (const c of companies) {
      expect(c.slug).toBeTruthy();
      expect(c.questionCount).toBeGreaterThan(0);
      expect(c.categories.length).toBeGreaterThan(0);
    }
  });

  it("every question carries its company and a unique id", () => {
    const questions = allQuestions();
    expect(questions.length).toBeGreaterThan(0);
    const ids = new Set<string>();
    for (const q of questions) {
      expect(q.company).toBeTruthy();
      expect(q.companySlug).toBeTruthy();
      expect(ids.has(q.id)).toBe(false);
      ids.add(q.id);
    }
  });

  it("resolves a specific company and its questions", () => {
    const google = getCompany("google");
    expect(google?.name).toBe("Google");
    expect(questionsForCompany("google").length).toBeGreaterThan(0);
  });

  it("looks up a question by id", () => {
    const first = allQuestions()[0];
    expect(getQuestion(first.id)?.id).toBe(first.id);
    expect(getQuestion("does-not-exist")).toBeNull();
  });
});
