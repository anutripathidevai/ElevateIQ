import { describe, expect, it } from "vitest";
import {
  AISD_CATALOG,
  AISD_COMPANIES,
  AISD_DIFFICULTIES,
  AISD_TIERS,
  AISD_TOPICS,
  getLesson,
  getLessonContent,
  getPublishedCatalog,
} from "..";
import { AISD_CONTENT } from "../questions";
import type { AISDLessonContent } from "../types";

const CATALOG_SLUGS = new Set(AISD_CATALOG.map((q) => q.slug));
const COMPANY_SET = new Set<string>(AISD_COMPANIES);
const TIER_IDS = new Set(AISD_TIERS.map((t) => t.id));
const DIFFICULTY_SET = new Set<string>(AISD_DIFFICULTIES);
const TOPIC_SET = new Set<string>(AISD_TOPICS);

const EXEMPLARS = [
  "design-chatgpt",
  "design-rag-pipeline",
  "design-vector-database",
];

/**
 * Every multi-line / prose / code / prompt field where the house style forbids
 * raw backticks and `${` interpolation (all such fields are template-literal
 * delimited in the authored content, so a stray backtick would not even
 * compile — this test keeps them prose-safe and interpolation-free too).
 */
function proseFields(c: AISDLessonContent): string[] {
  return [
    c.introductionMD,
    c.realWorldMD,
    ...c.learningObjectives,
    ...c.theory.flatMap((t) => [t.label, t.detailMD]),
    c.architectureNotesMD ?? "",
    ...c.requestFlow.flatMap((s) => [s.step, s.detailMD]),
    ...c.deepDives.flatMap((d) => [d.label, d.detailMD]),
    ...c.productionConsiderations.flatMap((d) => [d.label, d.detailMD]),
    ...c.interview.whatInterviewersLookFor,
    ...c.interview.followUps.flatMap((f) => [f.question, f.answerMD]),
    ...c.interview.alternativeDesigns.flatMap((a) => [a.name, a.detailMD]),
    ...c.interview.commonMistakes,
    ...c.interviewHints,
    ...(c.playground
      ? [
          c.playground.descriptionMD,
          c.playground.systemPrompt ?? "",
          c.playground.userPrompt ?? "",
          c.playground.sampleOutputMD ?? "",
          ...c.playground.parameters.flatMap((p) => [
            p.name,
            p.value,
            p.note ?? "",
          ]),
        ]
      : []),
    ...c.comparisons.flatMap((cmp) => [
      cmp.title,
      ...cmp.columns,
      ...cmp.rows.flat(),
    ]),
    c.decisionGuideMD ?? "",
    ...c.handsOn.flatMap((h) => [
      h.title,
      h.detailMD,
      h.code?.label ?? "",
      h.code?.body ?? "",
    ]),
    ...c.quiz.flatMap((q) => [q.question, ...q.options, q.explanationMD ?? ""]),
    ...c.flashcards.flatMap((f) => [f.front, f.back]),
    c.cheatSheetMD,
    ...c.relatedLessons.map((r) => r.note ?? ""),
  ];
}

describe("ai-system-design catalog", () => {
  it("has unique slugs and valid metadata across the whole catalog", () => {
    expect(new Set(AISD_CATALOG.map((q) => q.slug)).size).toBe(
      AISD_CATALOG.length,
    );
    for (const q of AISD_CATALOG) {
      const where = `catalog ${q.slug}`;
      expect(q.title, where).toBeTruthy();
      expect(q.summary.length, `${where} summary`).toBeGreaterThan(10);
      expect(TIER_IDS.has(q.tier), `${where} tier`).toBe(true);
      expect(DIFFICULTY_SET.has(q.difficulty), `${where} difficulty`).toBe(true);
      expect(q.topics.length, `${where} topics`).toBeGreaterThan(0);
      for (const t of q.topics) {
        expect(TOPIC_SET.has(t), `${where} topic ${t}`).toBe(true);
      }
      expect(q.companies.length, `${where} companies`).toBeGreaterThan(0);
      for (const co of q.companies) {
        expect(COMPANY_SET.has(co), `${where} company ${co}`).toBe(true);
      }
      expect(q.tags.length, `${where} tags`).toBeGreaterThan(0);
      expect(q.estimatedMinutes, `${where} minutes`).toBeGreaterThan(0);
      expect(q.addedOrder, `${where} addedOrder`).toBeGreaterThan(0);
    }
  });

  it("has at least the three published exemplars", () => {
    const published = getPublishedCatalog().map((q) => q.slug);
    for (const slug of EXEMPLARS) {
      expect(published, `published ${slug}`).toContain(slug);
    }
  });

  it("gives every tier at least one lesson", () => {
    for (const tier of AISD_TIERS) {
      const count = AISD_CATALOG.filter((q) => q.tier === tier.id).length;
      expect(count, `tier ${tier.id}`).toBeGreaterThan(0);
    }
  });
});

describe("published lesson ↔ content integrity", () => {
  it("maps every published catalog entry to authored content (and vice versa)", () => {
    for (const meta of getPublishedCatalog()) {
      const content = getLessonContent(meta.slug);
      expect(content, `content for ${meta.slug}`).toBeDefined();
      expect(content!.slug, `${meta.slug} slug match`).toBe(meta.slug);
    }
    for (const slug of Object.keys(AISD_CONTENT)) {
      expect(CATALOG_SLUGS.has(slug), `content ${slug} in catalog`).toBe(true);
      const meta = AISD_CATALOG.find((q) => q.slug === slug)!;
      expect(meta.status, `content ${slug} published`).toBe("published");
    }
  });
});

describe("authored content quality", () => {
  const entries = Object.values(AISD_CONTENT);

  it("populates every required section", () => {
    for (const c of entries) {
      const where = `content ${c.slug}`;
      expect(c.introductionMD.length, `${where} intro`).toBeGreaterThan(40);
      expect(c.realWorldMD.length, `${where} realWorld`).toBeGreaterThan(20);
      expect(
        c.learningObjectives.length,
        `${where} objectives`,
      ).toBeGreaterThan(2);
      expect(c.theory.length, `${where} theory`).toBeGreaterThan(2);
      expect(c.requestFlow.length, `${where} flow`).toBeGreaterThan(2);
      expect(c.deepDives.length, `${where} deep dives`).toBeGreaterThan(2);
      expect(
        c.productionConsiderations.length,
        `${where} production`,
      ).toBeGreaterThan(1);
      expect(
        c.interview.whatInterviewersLookFor.length,
        `${where} interview signals`,
      ).toBeGreaterThan(1);
      expect(
        c.interview.followUps.length,
        `${where} interview followups`,
      ).toBeGreaterThan(1);
      expect(
        c.interview.alternativeDesigns.length,
        `${where} alternatives`,
      ).toBeGreaterThan(0);
      expect(
        c.interview.commonMistakes.length,
        `${where} mistakes`,
      ).toBeGreaterThan(1);
      expect(c.interviewHints.length, `${where} hints`).toBeGreaterThan(1);
      expect(c.comparisons.length, `${where} comparisons`).toBeGreaterThan(0);
      expect(c.handsOn.length, `${where} handsOn`).toBeGreaterThan(0);
      expect(c.quiz.length, `${where} quiz`).toBeGreaterThan(3);
      expect(c.flashcards.length, `${where} flashcards`).toBeGreaterThan(3);
      expect(c.cheatSheetMD.length, `${where} cheat sheet`).toBeGreaterThan(20);
      expect(c.references.length, `${where} references`).toBeGreaterThan(1);
      expect(
        c.relatedLessons.length,
        `${where} related`,
      ).toBeGreaterThan(1);
    }
  });

  it("gives each design exemplar an architecture diagram", () => {
    for (const slug of EXEMPLARS) {
      const c = getLessonContent(slug);
      expect(c, `content ${slug}`).toBeDefined();
      expect(c!.architecture, `${slug} architecture`).toBeDefined();
      expect(
        c!.architecture!.nodes.length,
        `${slug} nodes`,
      ).toBeGreaterThan(3);
      expect(
        c!.architecture!.edges.length,
        `${slug} edges`,
      ).toBeGreaterThan(2);
    }
  });

  it("keeps every architecture edge pointing at a real node", () => {
    for (const c of entries) {
      if (!c.architecture) continue;
      const ids = new Set(c.architecture.nodes.map((n) => n.id));
      expect(
        new Set(c.architecture.nodes.map((n) => n.id)).size,
        `${c.slug} unique node ids`,
      ).toBe(c.architecture.nodes.length);
      for (const e of c.architecture.edges) {
        expect(ids.has(e.from), `${c.slug} edge from ${e.from}`).toBe(true);
        expect(ids.has(e.to), `${c.slug} edge to ${e.to}`).toBe(true);
      }
    }
  });

  it("keeps quiz answerIndex within range", () => {
    for (const c of entries) {
      for (const q of c.quiz) {
        expect(q.options.length, `${c.slug} quiz options`).toBeGreaterThan(1);
        expect(
          q.answerIndex,
          `${c.slug} answerIndex low`,
        ).toBeGreaterThanOrEqual(0);
        expect(q.answerIndex, `${c.slug} answerIndex high`).toBeLessThan(
          q.options.length,
        );
      }
    }
  });

  it("keeps comparison rows aligned with their columns", () => {
    for (const c of entries) {
      for (const cmp of c.comparisons) {
        expect(cmp.columns.length, `${c.slug} ${cmp.title} columns`).toBeGreaterThan(
          1,
        );
        for (const row of cmp.rows) {
          expect(row.length, `${c.slug} ${cmp.title} row arity`).toBe(
            cmp.columns.length,
          );
        }
      }
    }
  });

  it("references only catalog slugs in relatedLessons", () => {
    for (const c of entries) {
      for (const r of c.relatedLessons) {
        expect(CATALOG_SLUGS.has(r.slug), `${c.slug} -> ${r.slug}`).toBe(true);
      }
    }
  });

  it("uses **bold** instead of backticks in prose (template-literal safe)", () => {
    for (const c of entries) {
      for (const md of proseFields(c)) {
        expect(md.includes("`"), `${c.slug} field backtick`).toBe(false);
        expect(md.includes("${"), `${c.slug} field interpolation`).toBe(false);
      }
    }
  });

  it("assembles a full lesson (meta + content) for each exemplar", () => {
    for (const slug of EXEMPLARS) {
      const lesson = getLesson(slug);
      expect(lesson, `lesson ${slug}`).toBeDefined();
      expect(lesson!.meta.slug).toBe(slug);
      expect(lesson!.content.slug).toBe(slug);
    }
  });
});
