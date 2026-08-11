import { describe, expect, it } from "vitest";
import {
  CD_AREAS,
  CD_DIFFICULTIES,
  CD_MODULES,
  CD_MODULE_CONTENT,
  CD_QUESTIONS,
  getModule,
  getModuleContent,
  getPublishedModules,
  getQuestion,
} from "..";
import type {
  CDConcept,
  CDModuleContent,
  CDQuestion,
  CDScenario,
} from "../types";

const MODULE_SLUGS = new Set(CD_MODULES.map((m) => m.slug));
const QUESTION_IDS = new Set(CD_QUESTIONS.map((q) => q.id));
const AREA_SET = new Set<string>(CD_AREAS);
const DIFFICULTY_SET = new Set<string>(CD_DIFFICULTIES);

/** Every prose/diagram field where the house style forbids backticks / `${`. */
function moduleProseFields(c: CDModuleContent): string[] {
  const conceptFields = (concept: CDConcept): string[] => [
    concept.title,
    concept.whatMD,
    concept.howMD ?? "",
    concept.diagram?.title ?? "",
    concept.diagram?.body ?? "",
    ...concept.interviewPoints,
    concept.realWorldMD ?? "",
    ...(concept.interviewQuestions ?? []),
  ];
  const scenarioFields = (s: CDScenario): string[] => [
    s.title,
    s.symptomsMD,
    ...s.whatToCheck,
    ...s.possibleCauses,
    s.resolutionMD,
    s.preventionMD,
  ];
  return [
    c.introMD,
    c.coreFlow?.title ?? "",
    c.coreFlow?.body ?? "",
    ...c.seniorFocus,
    ...c.concepts.flatMap(conceptFields),
    ...(c.scenarios ?? []).flatMap(scenarioFields),
    ...c.keyTakeaways,
  ];
}

function questionProseFields(q: CDQuestion): string[] {
  return [
    q.question,
    ...q.tests,
    q.strongAnswerMD,
    ...q.keyPoints,
    ...q.followUps,
    ...q.tags,
  ];
}

describe("cloud-devops registry", () => {
  it("has unique module slugs and valid metadata", () => {
    expect(new Set(CD_MODULES.map((m) => m.slug)).size).toBe(CD_MODULES.length);
    const orders = CD_MODULES.map((m) => m.order);
    expect(new Set(orders).size, "unique orders").toBe(CD_MODULES.length);
    for (const m of CD_MODULES) {
      const where = `module ${m.slug}`;
      expect(m.title, where).toBeTruthy();
      expect(m.summary.length, `${where} summary`).toBeGreaterThan(20);
      expect(m.topics.length, `${where} topics`).toBeGreaterThan(0);
      expect(m.estimatedMinutes, `${where} minutes`).toBeGreaterThan(0);
      expect(m.order, `${where} order`).toBeGreaterThan(0);
      expect(["published", "coming-soon"], `${where} status`).toContain(
        m.status,
      );
    }
  });

  it("has at least one published module", () => {
    expect(getPublishedModules().length).toBeGreaterThan(0);
  });
});

describe("published module ↔ content integrity", () => {
  it("maps every published module to authored content (and vice versa)", () => {
    for (const meta of getPublishedModules()) {
      const content = getModuleContent(meta.slug);
      expect(content, `content for ${meta.slug}`).toBeDefined();
      expect(content!.slug, `${meta.slug} slug match`).toBe(meta.slug);
    }
    for (const slug of Object.keys(CD_MODULE_CONTENT)) {
      expect(MODULE_SLUGS.has(slug), `content ${slug} in registry`).toBe(true);
      const meta = CD_MODULES.find((m) => m.slug === slug)!;
      expect(meta.status, `content ${slug} published`).toBe("published");
    }
  });
});

describe("authored module content quality", () => {
  const entries = Object.values(CD_MODULE_CONTENT);

  it("populates every required section", () => {
    for (const c of entries) {
      const where = `content ${c.slug}`;
      expect(c.introMD.length, `${where} intro`).toBeGreaterThan(40);
      expect(c.seniorFocus.length, `${where} seniorFocus`).toBeGreaterThan(1);
      expect(c.concepts.length, `${where} concepts`).toBeGreaterThan(1);
      expect(c.keyTakeaways.length, `${where} takeaways`).toBeGreaterThan(1);
      for (const concept of c.concepts) {
        const cw = `${where} concept ${concept.id}`;
        expect(concept.title, `${cw} title`).toBeTruthy();
        expect(concept.whatMD.length, `${cw} whatMD`).toBeGreaterThan(20);
        expect(
          concept.interviewPoints.length,
          `${cw} interviewPoints`,
        ).toBeGreaterThan(1);
      }
    }
  });

  it("keeps concept ids unique within a module (TOC anchors)", () => {
    for (const c of entries) {
      const ids = c.concepts.map((x) => x.id);
      expect(new Set(ids).size, `${c.slug} unique concept ids`).toBe(
        ids.length,
      );
    }
  });

  it("resolves every relatedQuestionId to a real question", () => {
    for (const c of entries) {
      for (const id of c.relatedQuestionIds ?? []) {
        expect(QUESTION_IDS.has(id), `${c.slug} -> question ${id}`).toBe(true);
      }
    }
  });

  it("uses **bold** instead of backticks in prose (template-literal safe)", () => {
    for (const c of entries) {
      for (const md of moduleProseFields(c)) {
        expect(md.includes("`"), `${c.slug} field backtick`).toBe(false);
        expect(md.includes("${"), `${c.slug} field interpolation`).toBe(false);
      }
    }
  });

  it("assembles a full module (meta + content) for each published slug", () => {
    for (const meta of getPublishedModules()) {
      const module = getModule(meta.slug);
      expect(module, `module ${meta.slug}`).toBeDefined();
      expect(module!.meta.slug).toBe(meta.slug);
      expect(module!.content.slug).toBe(meta.slug);
    }
  });
});

describe("interview question bank", () => {
  it("has unique ids and valid metadata", () => {
    expect(new Set(CD_QUESTIONS.map((q) => q.id)).size).toBe(
      CD_QUESTIONS.length,
    );
    for (const q of CD_QUESTIONS) {
      const where = `question ${q.id}`;
      expect(AREA_SET.has(q.area), `${where} area`).toBe(true);
      expect(DIFFICULTY_SET.has(q.difficulty), `${where} difficulty`).toBe(true);
      expect(q.question.length, `${where} question`).toBeGreaterThan(20);
      expect(q.tests.length, `${where} tests`).toBeGreaterThan(0);
      expect(q.strongAnswerMD.length, `${where} answer`).toBeGreaterThan(80);
      expect(q.keyPoints.length, `${where} keyPoints`).toBeGreaterThan(2);
      expect(q.followUps.length, `${where} followUps`).toBeGreaterThan(0);
      expect(q.tags.length, `${where} tags`).toBeGreaterThan(0);
    }
  });

  it("looks up a question by id", () => {
    const first = CD_QUESTIONS[0];
    expect(getQuestion(first.id)?.id).toBe(first.id);
    expect(getQuestion("does-not-exist")).toBeUndefined();
  });

  it("uses **bold** instead of backticks in prose (template-literal safe)", () => {
    for (const q of CD_QUESTIONS) {
      for (const md of questionProseFields(q)) {
        expect(md.includes("`"), `${q.id} field backtick`).toBe(false);
        expect(md.includes("${"), `${q.id} field interpolation`).toBe(false);
      }
    }
  });
});
