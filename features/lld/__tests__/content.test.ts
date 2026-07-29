import { describe, expect, it } from "vitest";
import {
  LLD_CATALOG,
  LLD_CATEGORIES,
  LLD_COMPANIES,
  LLD_DIFFICULTIES,
  LLD_PATTERNS,
  LLD_TIERS,
  getConcept,
  getConceptContent,
  getProblem,
  getProblemContent,
  getPublishedCatalog,
} from "..";
import { LLD_CONCEPT_CONTENT, LLD_PROBLEM_CONTENT } from "../content";
import type { LLDConceptContent, LLDProblemContent } from "../types";

const CATALOG_SLUGS = new Set(LLD_CATALOG.map((q) => q.slug));
const COMPANY_SET = new Set<string>(LLD_COMPANIES);
const TIER_IDS = new Set(LLD_TIERS.map((t) => t.id));
const DIFFICULTY_SET = new Set<string>(LLD_DIFFICULTIES);
const CATEGORY_SET = new Set<string>(LLD_CATEGORIES);
const PATTERN_SET = new Set<string>(LLD_PATTERNS);

/**
 * Prose (Markdown) fields where the house style forbids backticks and `${`.
 * Java (`implementation[].content`, `designSteps[].code`) and Mermaid strings
 * are intentionally EXCLUDED — they legitimately contain those characters.
 */
function problemProse(c: LLDProblemContent): string[] {
  return [
    c.statementMD,
    c.businessContextMD,
    ...c.functionalRequirements,
    ...c.nonFunctionalRequirements.flatMap((d) => [d.label, d.detailMD]),
    ...c.requirementClarification.flatMap((q) => [q.question, q.answerMD]),
    c.classDiagramCaptionMD ?? "",
    c.sequenceDiagramCaptionMD ?? "",
    ...c.entities.flatMap((e) => [e.name, e.responsibilityMD, ...(e.attributes ?? [])]),
    ...c.patternsUsed.flatMap((p) => [String(p.name), p.whyMD]),
    ...c.designSteps.map((s) => s.title),
    ...c.designSteps.map((s) => s.detailMD),
    ...c.classExplanations.flatMap((x) => [x.className, x.detailMD]),
    c.dryRun.inputMD,
    ...c.dryRun.columns,
    ...c.dryRun.rows.flat(),
    c.dryRun.narrativeMD ?? "",
    ...c.complexity.flatMap((r) => [r.operation, r.time, r.space, r.note ?? ""]),
    c.complexityNotesMD ?? "",
    ...c.extensibility.flatMap((d) => [d.label, d.detailMD]),
    ...c.alternativeDesigns.flatMap((a) => [a.name, a.detailMD, a.tradeoffsMD ?? ""]),
    ...c.commonMistakes,
    ...c.followUps.flatMap((f) => [f.question, f.answerMD]),
    ...c.productionConsiderations.flatMap((d) => [d.label, d.detailMD]),
    ...c.interviewNotes,
    ...c.quiz.flatMap((q) => [q.question, ...q.options, q.explanationMD ?? ""]),
    ...c.practiceVariants.flatMap((v) => [v.title, v.detailMD]),
    ...c.flashcards.flatMap((f) => [f.front, f.back]),
    c.cheatSheetMD,
    ...c.references.map((r) => r.title),
    ...c.relatedProblems.map((r) => r.note ?? ""),
  ];
}

function conceptProse(c: LLDConceptContent): string[] {
  return [
    c.introMD,
    ...c.learningObjectives,
    ...c.theory.map((t) => t.title),
    ...c.theory.map((t) => t.detailMD),
    ...(c.diagrams ?? []).flatMap((d) => [d.title, d.captionMD ?? ""]),
    ...(c.comparisons ?? []).flatMap((cmp) => [
      cmp.title,
      ...cmp.columns,
      ...cmp.rows.flat(),
    ]),
    ...c.bestPractices,
    ...c.commonMistakes,
    ...c.quiz.flatMap((q) => [q.question, ...q.options, q.explanationMD ?? ""]),
    ...c.flashcards.flatMap((f) => [f.front, f.back]),
    c.cheatSheetMD,
    ...c.references.map((r) => r.title),
    ...c.relatedProblems.map((r) => r.note ?? ""),
  ];
}

function noBacktick(fields: string[], slug: string) {
  for (const md of fields) {
    expect(md.includes("`"), `${slug} prose backtick`).toBe(false);
    expect(md.includes("${"), `${slug} prose interpolation`).toBe(false);
  }
}

describe("lld catalog", () => {
  it("has unique slugs and valid metadata across the whole catalog", () => {
    expect(new Set(LLD_CATALOG.map((q) => q.slug)).size).toBe(LLD_CATALOG.length);
    for (const q of LLD_CATALOG) {
      const where = `catalog ${q.slug}`;
      expect(q.title, where).toBeTruthy();
      expect(q.summary.length, `${where} summary`).toBeGreaterThan(10);
      expect(["problem", "concept"].includes(q.kind), `${where} kind`).toBe(true);
      expect(TIER_IDS.has(q.tier), `${where} tier`).toBe(true);
      expect(DIFFICULTY_SET.has(q.difficulty), `${where} difficulty`).toBe(true);
      expect(CATEGORY_SET.has(q.category), `${where} category`).toBe(true);
      expect(q.companies.length, `${where} companies`).toBeGreaterThan(0);
      for (const co of q.companies) {
        expect(COMPANY_SET.has(co), `${where} company ${co}`).toBe(true);
      }
      for (const p of q.patterns) {
        expect(PATTERN_SET.has(p), `${where} pattern ${p}`).toBe(true);
      }
      expect(q.tags.length, `${where} tags`).toBeGreaterThan(0);
      expect(q.estimatedMinutes, `${where} minutes`).toBeGreaterThan(0);
      expect(q.addedOrder, `${where} addedOrder`).toBeGreaterThan(0);
    }
  });

  it("publishes the expected exemplar set", () => {
    const published = getPublishedCatalog().map((q) => q.slug);
    for (const slug of [
      "oop-fundamentals",
      "solid-principles",
      "design-principles",
      "parking-lot",
      "vending-machine",
      "coffee-machine",
      "atm",
      "tic-tac-toe",
      "snake-and-ladder",
      "elevator-system",
      "lru-cache",
    ]) {
      expect(published, `published ${slug}`).toContain(slug);
    }
    expect(published.length).toBeGreaterThanOrEqual(11);
  });

  it("gives every tier at least one entry", () => {
    for (const tier of LLD_TIERS) {
      const count = LLD_CATALOG.filter((q) => q.tier === tier.id).length;
      expect(count, `tier ${tier.id}`).toBeGreaterThan(0);
    }
  });
});

describe("published entry ↔ content integrity", () => {
  it("maps every published catalog entry to authored content of the right kind", () => {
    for (const meta of getPublishedCatalog()) {
      if (meta.kind === "concept") {
        const content = getConceptContent(meta.slug);
        expect(content, `concept content for ${meta.slug}`).toBeDefined();
        expect(content!.slug, `${meta.slug} slug match`).toBe(meta.slug);
      } else {
        const content = getProblemContent(meta.slug);
        expect(content, `problem content for ${meta.slug}`).toBeDefined();
        expect(content!.slug, `${meta.slug} slug match`).toBe(meta.slug);
      }
    }
  });

  it("maps every content entry back to a published catalog slug of the right kind", () => {
    for (const slug of Object.keys(LLD_PROBLEM_CONTENT)) {
      expect(CATALOG_SLUGS.has(slug), `problem content ${slug} in catalog`).toBe(true);
      const meta = LLD_CATALOG.find((q) => q.slug === slug)!;
      expect(meta.status, `problem content ${slug} published`).toBe("published");
      expect(meta.kind, `problem content ${slug} kind`).toBe("problem");
    }
    for (const slug of Object.keys(LLD_CONCEPT_CONTENT)) {
      expect(CATALOG_SLUGS.has(slug), `concept content ${slug} in catalog`).toBe(true);
      const meta = LLD_CATALOG.find((q) => q.slug === slug)!;
      expect(meta.status, `concept content ${slug} published`).toBe("published");
      expect(meta.kind, `concept content ${slug} kind`).toBe("concept");
    }
  });
});

describe("authored problem quality", () => {
  const problems = Object.values(LLD_PROBLEM_CONTENT);

  it("populates every required section", () => {
    for (const c of problems) {
      const where = `problem ${c.slug}`;
      expect(c.statementMD.length, `${where} statement`).toBeGreaterThan(40);
      expect(c.businessContextMD.length, `${where} context`).toBeGreaterThan(20);
      expect(c.functionalRequirements.length, `${where} FRs`).toBeGreaterThan(4);
      expect(c.nonFunctionalRequirements.length, `${where} NFRs`).toBeGreaterThan(2);
      expect(c.requirementClarification.length, `${where} clarify`).toBeGreaterThan(2);
      expect(c.classDiagramMermaid.length, `${where} class diagram`).toBeGreaterThan(40);
      expect(c.sequenceDiagramMermaid.length, `${where} seq diagram`).toBeGreaterThan(40);
      expect(c.entities.length, `${where} entities`).toBeGreaterThan(4);
      expect(c.patternsUsed.length, `${where} patterns`).toBeGreaterThan(1);
      expect(c.designSteps.length, `${where} steps`).toBeGreaterThan(3);
      expect(c.implementation.length, `${where} impl files`).toBeGreaterThan(0);
      expect(c.classExplanations.length, `${where} class expl`).toBeGreaterThan(0);
      expect(c.dryRun.columns.length, `${where} dryRun cols`).toBeGreaterThan(1);
      expect(c.dryRun.rows.length, `${where} dryRun rows`).toBeGreaterThan(1);
      expect(c.complexity.length, `${where} complexity`).toBeGreaterThan(1);
      expect(c.extensibility.length, `${where} extensibility`).toBeGreaterThan(1);
      expect(c.alternativeDesigns.length, `${where} alternatives`).toBeGreaterThan(0);
      expect(c.commonMistakes.length, `${where} mistakes`).toBeGreaterThan(2);
      expect(c.followUps.length, `${where} followups`).toBeGreaterThan(2);
      expect(c.productionConsiderations.length, `${where} prod`).toBeGreaterThan(1);
      expect(c.interviewNotes.length, `${where} interview`).toBeGreaterThan(2);
      expect(c.quiz.length, `${where} quiz`).toBeGreaterThan(2);
      expect(c.practiceVariants.length, `${where} variants`).toBeGreaterThan(0);
      expect(c.flashcards.length, `${where} flashcards`).toBeGreaterThan(3);
      expect(c.cheatSheetMD.length, `${where} cheat`).toBeGreaterThan(20);
      expect(c.references.length, `${where} references`).toBeGreaterThan(1);
      expect(c.relatedProblems.length, `${where} related`).toBeGreaterThan(1);
    }
  });

  it("keeps every implementation file non-empty and every class explained", () => {
    for (const c of problems) {
      for (const f of c.implementation) {
        expect(f.filename, `${c.slug} filename`).toBeTruthy();
        expect(f.content.length, `${c.slug} ${f.filename} body`).toBeGreaterThan(10);
      }
      for (const x of c.classExplanations) {
        expect(x.className, `${c.slug} className`).toBeTruthy();
        expect(x.detailMD.length, `${c.slug} ${x.className}`).toBeGreaterThan(10);
      }
    }
  });

  it("keeps every dry-run row aligned with its columns", () => {
    for (const c of problems) {
      for (const row of c.dryRun.rows) {
        expect(row.length, `${c.slug} dryRun row arity`).toBe(
          c.dryRun.columns.length,
        );
      }
    }
  });

  it("keeps quiz answerIndex within range", () => {
    for (const c of problems) {
      for (const q of c.quiz) {
        expect(q.options.length, `${c.slug} quiz options`).toBeGreaterThan(1);
        expect(q.answerIndex, `${c.slug} answerIndex low`).toBeGreaterThanOrEqual(0);
        expect(q.answerIndex, `${c.slug} answerIndex high`).toBeLessThan(
          q.options.length,
        );
      }
    }
  });

  it("references only catalog slugs in relatedProblems", () => {
    for (const c of problems) {
      for (const r of c.relatedProblems) {
        expect(CATALOG_SLUGS.has(r.slug), `${c.slug} -> ${r.slug}`).toBe(true);
      }
    }
  });

  it("uses **bold** instead of backticks in prose (template-literal safe)", () => {
    for (const c of problems) noBacktick(problemProse(c), c.slug);
  });
});

describe("authored concept quality", () => {
  const concepts = Object.values(LLD_CONCEPT_CONTENT);

  it("populates every required section", () => {
    for (const c of concepts) {
      const where = `concept ${c.slug}`;
      expect(c.introMD.length, `${where} intro`).toBeGreaterThan(40);
      expect(c.learningObjectives.length, `${where} objectives`).toBeGreaterThan(2);
      expect(c.theory.length, `${where} theory`).toBeGreaterThan(3);
      expect(c.bestPractices.length, `${where} best`).toBeGreaterThan(2);
      expect(c.commonMistakes.length, `${where} mistakes`).toBeGreaterThan(2);
      expect(c.quiz.length, `${where} quiz`).toBeGreaterThan(3);
      expect(c.flashcards.length, `${where} flashcards`).toBeGreaterThan(3);
      expect(c.cheatSheetMD.length, `${where} cheat`).toBeGreaterThan(20);
      expect(c.references.length, `${where} references`).toBeGreaterThan(1);
      expect(c.relatedProblems.length, `${where} related`).toBeGreaterThan(1);
    }
  });

  it("keeps comparison rows aligned with columns", () => {
    for (const c of concepts) {
      for (const cmp of c.comparisons ?? []) {
        expect(cmp.columns.length, `${c.slug} cmp cols`).toBeGreaterThan(1);
        for (const row of cmp.rows) {
          expect(row.length, `${c.slug} cmp row arity`).toBe(cmp.columns.length);
        }
      }
    }
  });

  it("keeps quiz answerIndex within range", () => {
    for (const c of concepts) {
      for (const q of c.quiz) {
        expect(q.options.length, `${c.slug} quiz options`).toBeGreaterThan(1);
        expect(q.answerIndex, `${c.slug} answerIndex low`).toBeGreaterThanOrEqual(0);
        expect(q.answerIndex, `${c.slug} answerIndex high`).toBeLessThan(
          q.options.length,
        );
      }
    }
  });

  it("references only catalog slugs in relatedProblems", () => {
    for (const c of concepts) {
      for (const r of c.relatedProblems) {
        expect(CATALOG_SLUGS.has(r.slug), `${c.slug} -> ${r.slug}`).toBe(true);
      }
    }
  });

  it("uses **bold** instead of backticks in prose (template-literal safe)", () => {
    for (const c of concepts) noBacktick(conceptProse(c), c.slug);
  });
});

describe("assembly", () => {
  it("assembles each published problem (meta + content)", () => {
    for (const meta of getPublishedCatalog().filter((m) => m.kind === "problem")) {
      const p = getProblem(meta.slug);
      expect(p, `problem ${meta.slug}`).toBeDefined();
      expect(p!.meta.slug).toBe(meta.slug);
      expect(p!.content.slug).toBe(meta.slug);
    }
  });

  it("assembles each published concept (meta + content)", () => {
    for (const meta of getPublishedCatalog().filter((m) => m.kind === "concept")) {
      const c = getConcept(meta.slug);
      expect(c, `concept ${meta.slug}`).toBeDefined();
      expect(c!.meta.slug).toBe(meta.slug);
      expect(c!.content.slug).toBe(meta.slug);
    }
  });
});
