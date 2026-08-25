import { describe, expect, it } from "vitest";
import {
  AI_LABS_CATALOG,
  AI_LABS_INFO,
  getLab,
  getLabContent,
  getPublishedLabs,
  getPublishedLabSlugs,
} from "..";
import { LAB_CONTENT } from "../content";
import type { LabDifficulty } from "../types";

const DIFFICULTIES: LabDifficulty[] = ["Beginner", "Intermediate", "Advanced"];

describe("AI Labs registry", () => {
  it("has the expected number of labs", () => {
    expect(AI_LABS_CATALOG.length).toBe(AI_LABS_INFO.labCount);
  });

  it("has unique slugs", () => {
    const slugs = AI_LABS_CATALOG.map((l) => l.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has unique, contiguous 1-based orders", () => {
    const orders = AI_LABS_CATALOG.map((l) => l.order).sort((a, b) => a - b);
    expect(orders).toEqual(Array.from({ length: orders.length }, (_, i) => i + 1));
  });

  it("uses valid difficulties and non-empty concepts", () => {
    for (const lab of AI_LABS_CATALOG) {
      expect(DIFFICULTIES).toContain(lab.difficulty);
      expect(lab.concepts.length).toBeGreaterThan(0);
      expect(lab.title.trim().length).toBeGreaterThan(0);
      expect(lab.summary.trim().length).toBeGreaterThan(0);
      expect(lab.estimatedMinutes).toBeGreaterThan(0);
    }
  });

  it("has at least one published lab", () => {
    expect(getPublishedLabs().length).toBeGreaterThan(0);
  });
});

describe("AI Labs content", () => {
  it("every published lab has content with a matching slug", () => {
    for (const slug of getPublishedLabSlugs()) {
      const content = getLabContent(slug);
      expect(content, `missing content for ${slug}`).toBeTruthy();
      expect(content?.slug).toBe(slug);
    }
  });

  it("every content entry maps to a real catalog slug", () => {
    const slugs = new Set(AI_LABS_CATALOG.map((l) => l.slug));
    for (const key of Object.keys(LAB_CONTENT)) {
      expect(slugs.has(key)).toBe(true);
      expect(LAB_CONTENT[key].slug).toBe(key);
    }
  });

  it("published labs assemble via getLab with all required sections", () => {
    for (const slug of getPublishedLabSlugs()) {
      const lab = getLab(slug);
      expect(lab).toBeTruthy();
      if (!lab) continue;
      expect(lab.content.overviewMD.trim().length).toBeGreaterThan(0);
      expect(lab.content.whatYouBuild.length).toBeGreaterThan(0);
      expect(lab.content.learnMD.trim().length).toBeGreaterThan(0);
      expect(lab.content.executionMD.trim().length).toBeGreaterThan(0);
      expect(lab.content.architecture.flow.trim().length).toBeGreaterThan(0);
      expect(lab.content.architecture.nodes.length).toBeGreaterThan(0);
      expect(lab.content.interviewQuestions.length).toBeGreaterThan(0);
    }
  });

  it("architecture nodes have unique ids and complete fields", () => {
    for (const slug of getPublishedLabSlugs()) {
      const content = getLabContent(slug)!;
      const ids = content.architecture.nodes.map((n) => n.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const node of content.architecture.nodes) {
        expect(node.label.trim().length).toBeGreaterThan(0);
        expect(node.whatMD.trim().length).toBeGreaterThan(0);
        expect(node.whyMD.trim().length).toBeGreaterThan(0);
        expect(node.input.trim().length).toBeGreaterThan(0);
        expect(node.output.trim().length).toBeGreaterThan(0);
        expect(node.commonFailure.trim().length).toBeGreaterThan(0);
        expect(node.interviewQuestion.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("interview questions have unique ids, valid difficulty, and key points", () => {
    for (const slug of getPublishedLabSlugs()) {
      const content = getLabContent(slug)!;
      const ids = content.interviewQuestions.map((q) => q.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const q of content.interviewQuestions) {
        expect(DIFFICULTIES).toContain(q.difficulty);
        expect(q.question.trim().length).toBeGreaterThan(0);
        expect(q.answerMD.trim().length).toBeGreaterThan(0);
        expect(q.keyPoints.length).toBeGreaterThan(0);
      }
    }
  });

  it("challenge has a prompt, hints, and expected approach", () => {
    for (const slug of getPublishedLabSlugs()) {
      const { challenge } = getLabContent(slug)!;
      expect(challenge.promptMD.trim().length).toBeGreaterThan(0);
      expect(challenge.hints.length).toBeGreaterThan(0);
      expect(challenge.expectedApproachMD.trim().length).toBeGreaterThan(0);
    }
  });

  it("the demo key matches a valid lab demo", () => {
    for (const slug of getPublishedLabSlugs()) {
      const content = getLabContent(slug)!;
      // Phase 1 ships the llm-playground demo; content.demo must be a known key.
      expect(typeof content.demo).toBe("string");
      expect(content.demo.length).toBeGreaterThan(0);
    }
  });
});
