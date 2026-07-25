import { describe, expect, it } from "vitest";
import {
  SD_CATALOG,
  SD_CATEGORIES,
  SD_COMPANIES,
  SD_DIFFICULTIES,
  SD_TIERS,
  getPublishedCatalog,
  getQuestion,
  getQuestionContent,
} from "..";
import { SD_CONTENT } from "../questions";
import type { SDQuestionContent } from "../types";

const CATALOG_SLUGS = new Set(SD_CATALOG.map((q) => q.slug));
const COMPANY_SET = new Set<string>(SD_COMPANIES);
const TIER_IDS = new Set(SD_TIERS.map((t) => t.id));
const DIFFICULTY_SET = new Set<string>(SD_DIFFICULTIES);
const CATEGORY_SET = new Set<string>(SD_CATEGORIES);

/** All multi-line Markdown fields where the house style forbids backticks. */
function markdownFields(c: SDQuestionContent): string[] {
  return [
    c.statementMD,
    c.businessUseCaseMD,
    ...c.functionalRequirements,
    ...c.nonFunctionalRequirements.flatMap((d) => [d.label, d.detailMD]),
    c.capacityEstimation.assumptionsMD,
    c.capacityEstimation.calculationsMD,
    ...c.apiDesign.endpoints.map((e) => e.descriptionMD),
    c.apiDesign.notesMD ?? "",
    c.databaseDesign.schemaMD,
    c.databaseDesign.indexesMD ?? "",
    c.databaseDesign.relationshipsMD ?? "",
    c.databaseDesign.noSqlAlternativesMD ?? "",
    c.architecture.captionMD ?? "",
    c.architectureNotesMD ?? "",
    ...c.requestFlow.flatMap((s) => [s.title, s.detailMD]),
    ...c.coreComponents.flatMap((x) => [x.role, x.detailMD]),
    ...c.deepDives.flatMap((d) => [d.topic, d.detailMD]),
    ...c.scaling.flatMap((s) => [s.stage, s.detailMD]),
    ...c.bottlenecks.flatMap((b) => [b.issue, b.optimizationMD]),
    ...c.failureHandling.flatMap((f) => [f.scenario, f.strategyMD]),
    ...c.security.flatMap((d) => [d.label, d.detailMD]),
    ...c.tradeoffs.pros,
    ...c.tradeoffs.cons,
    c.tradeoffs.alternativesMD,
    c.tradeoffs.whenNotToUseMD,
    ...c.followUpQuestions.flatMap((f) => [f.question, f.answerMD]),
    ...c.companyVariations.map((v) => v.angleMD),
    ...c.interviewTips.commonMistakes,
    ...c.interviewTips.redFlags,
    ...c.interviewTips.expectations,
    c.interviewTips.communicationMD,
    c.revisionNotesMD,
    ...c.flashcards.flatMap((f) => [f.front, f.back]),
    ...c.quiz.flatMap((q) => [q.question, ...q.options, q.explanationMD ?? ""]),
    c.cheatSheetMD,
  ];
}

describe("system-design catalog", () => {
  it("has unique slugs and valid metadata across the whole catalog", () => {
    expect(new Set(SD_CATALOG.map((q) => q.slug)).size).toBe(SD_CATALOG.length);
    for (const q of SD_CATALOG) {
      const where = `catalog ${q.slug}`;
      expect(q.title, where).toBeTruthy();
      expect(q.summary.length, `${where} summary`).toBeGreaterThan(10);
      expect(TIER_IDS.has(q.tier), `${where} tier`).toBe(true);
      expect(DIFFICULTY_SET.has(q.difficulty), `${where} difficulty`).toBe(true);
      expect(q.categories.length, `${where} categories`).toBeGreaterThan(0);
      for (const cat of q.categories) {
        expect(CATEGORY_SET.has(cat), `${where} category ${cat}`).toBe(true);
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
    expect(published).toContain("url-shortener");
    expect(published).toContain("rate-limiter");
    expect(published).toContain("distributed-cache");
  });

  it("gives every tier at least one question", () => {
    for (const tier of SD_TIERS) {
      const count = SD_CATALOG.filter((q) => q.tier === tier.id).length;
      expect(count, `tier ${tier.id}`).toBeGreaterThan(0);
    }
  });
});

describe("published question ↔ content integrity", () => {
  it("maps every published catalog entry to authored content (and vice versa)", () => {
    for (const meta of getPublishedCatalog()) {
      const content = getQuestionContent(meta.slug);
      expect(content, `content for ${meta.slug}`).toBeDefined();
      expect(content!.slug, `${meta.slug} slug match`).toBe(meta.slug);
    }
    for (const slug of Object.keys(SD_CONTENT)) {
      expect(CATALOG_SLUGS.has(slug), `content ${slug} in catalog`).toBe(true);
      const meta = SD_CATALOG.find((q) => q.slug === slug)!;
      expect(meta.status, `content ${slug} published`).toBe("published");
    }
  });
});

describe("authored content quality", () => {
  const entries = Object.values(SD_CONTENT);

  it("populates every required section", () => {
    for (const c of entries) {
      const where = `content ${c.slug}`;
      expect(c.statementMD.length, `${where} statement`).toBeGreaterThan(40);
      expect(c.businessUseCaseMD.length, `${where} business`).toBeGreaterThan(20);
      expect(c.functionalRequirements.length, `${where} FRs`).toBeGreaterThan(2);
      expect(
        c.nonFunctionalRequirements.length,
        `${where} NFRs`,
      ).toBeGreaterThan(2);
      expect(
        c.capacityEstimation.metrics.length,
        `${where} metrics`,
      ).toBeGreaterThan(1);
      expect(c.apiDesign.endpoints.length, `${where} endpoints`).toBeGreaterThan(0);
      expect(c.databaseDesign.tables.length, `${where} tables`).toBeGreaterThan(0);
      expect(c.architecture.nodes.length, `${where} nodes`).toBeGreaterThan(3);
      expect(c.architecture.edges.length, `${where} edges`).toBeGreaterThan(2);
      expect(c.requestFlow.length, `${where} flow`).toBeGreaterThan(2);
      expect(c.coreComponents.length, `${where} components`).toBeGreaterThan(2);
      expect(c.deepDives.length, `${where} deep dives`).toBeGreaterThan(2);
      expect(c.scaling.length, `${where} scaling`).toBeGreaterThan(1);
      expect(c.bottlenecks.length, `${where} bottlenecks`).toBeGreaterThan(1);
      expect(c.failureHandling.length, `${where} failures`).toBeGreaterThan(1);
      expect(c.security.length, `${where} security`).toBeGreaterThan(1);
      expect(c.tradeoffs.pros.length, `${where} pros`).toBeGreaterThan(1);
      expect(c.tradeoffs.cons.length, `${where} cons`).toBeGreaterThan(1);
      expect(c.followUpQuestions.length, `${where} followups`).toBeGreaterThan(2);
      expect(
        c.companyVariations.length,
        `${where} companyVariations`,
      ).toBeGreaterThan(1);
      expect(c.relatedQuestions.length, `${where} related`).toBeGreaterThan(1);
      expect(c.flashcards.length, `${where} flashcards`).toBeGreaterThan(3);
      expect(c.quiz.length, `${where} quiz`).toBeGreaterThan(3);
      expect(c.cheatSheetMD.length, `${where} cheat sheet`).toBeGreaterThan(20);
      expect(c.references.length, `${where} references`).toBeGreaterThan(1);
    }
  });

  it("keeps every architecture edge pointing at a real node", () => {
    for (const c of entries) {
      const ids = new Set(c.architecture.nodes.map((n) => n.id));
      expect(new Set(c.architecture.nodes.map((n) => n.id)).size).toBe(
        c.architecture.nodes.length,
      );
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
        expect(q.answerIndex, `${c.slug} answerIndex low`).toBeGreaterThanOrEqual(
          0,
        );
        expect(q.answerIndex, `${c.slug} answerIndex high`).toBeLessThan(
          q.options.length,
        );
      }
    }
  });

  it("references only catalog slugs in relatedQuestions and valid companies", () => {
    for (const c of entries) {
      for (const r of c.relatedQuestions) {
        expect(CATALOG_SLUGS.has(r.slug), `${c.slug} -> ${r.slug}`).toBe(true);
      }
      for (const v of c.companyVariations) {
        expect(COMPANY_SET.has(v.company), `${c.slug} company ${v.company}`).toBe(
          true,
        );
      }
    }
  });

  it("uses **bold** instead of backticks in prose (template-literal safe)", () => {
    for (const c of entries) {
      for (const md of markdownFields(c)) {
        expect(md.includes("`"), `${c.slug} markdown backtick`).toBe(false);
        expect(md.includes("${"), `${c.slug} markdown interpolation`).toBe(false);
      }
    }
  });

  it("assembles a full question (meta + content) for each exemplar", () => {
    for (const slug of ["url-shortener", "rate-limiter", "distributed-cache"]) {
      const q = getQuestion(slug);
      expect(q, `question ${slug}`).toBeDefined();
      expect(q!.meta.slug).toBe(slug);
      expect(q!.content.slug).toBe(slug);
    }
  });
});
