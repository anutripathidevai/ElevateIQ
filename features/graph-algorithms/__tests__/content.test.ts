import { describe, expect, it } from "vitest";
import {
  adjacentProblems,
  allTags,
  AUTHORED_PROBLEM_COUNT,
  getModule,
  getProblem,
  GRAPH_MODULES,
  GRAPH_PROBLEMS,
  moduleStats,
  PLANNED_PROBLEM_COUNT,
  problemsForModule,
  PROBLEMS_IN_ORDER,
} from "..";
import type { GraphProblem } from "../types";

const DIFFICULTIES = new Set(["Easy", "Medium", "Hard"]);

/** All slugs the track plans to ship (authored or not). */
const PLANNED_SLUGS = new Set(
  GRAPH_MODULES.flatMap((m) => m.problemSlugs),
);

/** Markdown fields where the house style forbids backticks (use **bold**). */
function markdownFields(p: GraphProblem): string[] {
  return [
    p.statementMD,
    p.inputMD,
    p.outputMD,
    p.intuitionMD,
    p.algorithmMD,
    p.interviewTipsMD,
    p.dryRun.inputMD,
    p.dryRun.narrativeMD ?? "",
    ...p.solutions.flatMap((s) => [
      s.approachMD,
      s.walkthroughMD,
      s.whenToUseMD ?? "",
    ]),
  ];
}

describe("graph-algorithms module structure", () => {
  it("declares 10 modules with contiguous order 1..10", () => {
    expect(GRAPH_MODULES).toHaveLength(10);
    const orders = GRAPH_MODULES.map((m) => m.order).sort((a, b) => a - b);
    expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("plans exactly 25 problems across all modules", () => {
    expect(PLANNED_PROBLEM_COUNT).toBe(25);
    expect(PLANNED_SLUGS.size).toBe(25);
  });

  it("every planned slug is unique and prefixed 'graph-'", () => {
    const all = GRAPH_MODULES.flatMap((m) => m.problemSlugs);
    expect(new Set(all).size).toBe(all.length);
    for (const slug of all) expect(slug.startsWith("graph-")).toBe(true);
  });
});

describe("graph-algorithms authored content", () => {
  it("has authored every planned problem", () => {
    expect(AUTHORED_PROBLEM_COUNT).toBeGreaterThanOrEqual(5);
    expect(GRAPH_PROBLEMS.length).toBe(AUTHORED_PROBLEM_COUNT);
    expect(AUTHORED_PROBLEM_COUNT).toBe(PLANNED_PROBLEM_COUNT);
    const authored = new Set(GRAPH_PROBLEMS.map((p) => p.slug));
    for (const slug of PLANNED_SLUGS) {
      expect(authored.has(slug), `missing authored problem ${slug}`).toBe(true);
    }
  });

  it("assigns every authored problem a unique slug and order", () => {
    const slugs = new Set<string>();
    const orders = new Set<number>();
    for (const p of GRAPH_PROBLEMS) {
      expect(slugs.has(p.slug)).toBe(false);
      slugs.add(p.slug);
      expect(orders.has(p.order)).toBe(false);
      orders.add(p.order);
    }
  });

  it("links every authored problem to a module that lists its slug", () => {
    for (const p of GRAPH_PROBLEMS) {
      const mod = getModule(p.moduleId);
      expect(mod, `module ${p.moduleId} for ${p.slug}`).toBeDefined();
      expect(mod!.problemSlugs).toContain(p.slug);
    }
  });

  it("populates all required fields for every authored problem", () => {
    for (const p of GRAPH_PROBLEMS) {
      const where = `problem ${p.slug}`;
      expect(p.title, where).toBeTruthy();
      expect(DIFFICULTIES.has(p.difficulty), `${where} difficulty`).toBe(true);
      expect(p.tags.length, `${where} tags`).toBeGreaterThan(0);
      expect(p.companies.length, `${where} companies`).toBeGreaterThan(0);
      expect(p.estimatedReadingMin, where).toBeGreaterThan(0);
      expect(p.estimatedSolvingMin, where).toBeGreaterThan(0);
      expect(p.statementMD.length, where).toBeGreaterThan(20);
      expect(p.constraints.length, `${where} constraints`).toBeGreaterThan(0);
      expect(p.examples.length, `${where} examples`).toBeGreaterThan(0);
      expect(
        p.learningObjectives.length,
        `${where} objectives`,
      ).toBeGreaterThan(0);
      expect(p.commonMistakes.length, `${where} mistakes`).toBeGreaterThan(0);
      expect(p.intuitionMD.length, where).toBeGreaterThan(20);
      expect(p.algorithmMD.length, where).toBeGreaterThan(20);
      expect(p.interviewTipsMD.length, where).toBeGreaterThan(20);
      expect(p.followUps.length, `${where} followUps`).toBeGreaterThan(0);
      expect(p.keyTakeaways.length, `${where} takeaways`).toBeGreaterThan(0);
      expect(p.pattern, `${where} pattern`).toBeTruthy();
    }
  });

  it("gives each problem 1-2 optimal solutions with complexity + Java code", () => {
    for (const p of GRAPH_PROBLEMS) {
      const where = `problem ${p.slug}`;
      expect(p.solutions.length, `${where} solution count`).toBeGreaterThan(0);
      expect(p.solutions.length, `${where} solution count`).toBeLessThanOrEqual(
        2,
      );
      for (const s of p.solutions) {
        expect(s.name, `${where} solution name`).toBeTruthy();
        expect(s.complexity.time, `${where} time`).toBeTruthy();
        expect(s.complexity.space, `${where} space`).toBeTruthy();
        expect(s.filename.endsWith(".java"), `${where} filename`).toBe(true);
        expect(s.code.length, `${where} code`).toBeGreaterThan(40);
        // Java strings live in template literals — must stay literal-safe.
        expect(s.code.includes("`"), `${where} code backtick`).toBe(false);
        expect(s.code.includes("${"), `${where} code interpolation`).toBe(
          false,
        );
        expect(s.code.includes("\\"), `${where} code backslash`).toBe(false);
      }
    }
  });

  it("keeps dry-run rows aligned with their columns", () => {
    for (const p of GRAPH_PROBLEMS) {
      const { columns, rows } = p.dryRun;
      expect(columns.length, `${p.slug} columns`).toBeGreaterThan(0);
      expect(rows.length, `${p.slug} rows`).toBeGreaterThan(0);
      for (const row of rows) {
        expect(row.length, `${p.slug} row width`).toBe(columns.length);
      }
    }
  });

  it("references only valid slugs/urls in similar problems (3-5 each)", () => {
    for (const p of GRAPH_PROBLEMS) {
      const where = `problem ${p.slug}`;
      expect(p.similarProblems.length, `${where} similar count`)
        .toBeGreaterThanOrEqual(3);
      expect(p.similarProblems.length, `${where} similar count`)
        .toBeLessThanOrEqual(5);
      for (const s of p.similarProblems) {
        expect(s.title, `${where} similar title`).toBeTruthy();
        expect(DIFFICULTIES.has(s.difficulty), `${where} similar diff`).toBe(
          true,
        );
        expect(
          Boolean(s.slug) || Boolean(s.url),
          `${where} similar link`,
        ).toBe(true);
        if (s.slug) {
          expect(PLANNED_SLUGS.has(s.slug), `${where} -> ${s.slug}`).toBe(true);
        }
      }
    }
  });

  it("uses **bold** instead of backticks in prose markdown", () => {
    for (const p of GRAPH_PROBLEMS) {
      for (const md of markdownFields(p)) {
        expect(md.includes("`"), `${p.slug} markdown backtick`).toBe(false);
      }
    }
  });
});

describe("graph-algorithms helpers", () => {
  it("orders PROBLEMS_IN_ORDER by ascending order", () => {
    for (let i = 1; i < PROBLEMS_IN_ORDER.length; i++) {
      expect(PROBLEMS_IN_ORDER[i].order).toBeGreaterThan(
        PROBLEMS_IN_ORDER[i - 1].order,
      );
    }
  });

  it("computes prev/next consistently for authored problems", () => {
    for (let i = 0; i < PROBLEMS_IN_ORDER.length; i++) {
      const p = PROBLEMS_IN_ORDER[i];
      const { prev, next } = adjacentProblems(p.slug);
      expect(prev?.slug).toBe(PROBLEMS_IN_ORDER[i - 1]?.slug);
      expect(next?.slug).toBe(PROBLEMS_IN_ORDER[i + 1]?.slug);
    }
  });

  it("returns getProblem for every authored slug", () => {
    for (const p of GRAPH_PROBLEMS) {
      expect(getProblem(p.slug)?.slug).toBe(p.slug);
    }
    expect(getProblem("graph-does-not-exist")).toBeUndefined();
  });

  it("reports module stats that match problemsForModule", () => {
    for (const stat of moduleStats()) {
      expect(stat.problemCount).toBe(stat.problems.length);
      expect(problemsForModule(stat.module.id).length).toBe(stat.problemCount);
      const est = stat.problems.reduce(
        (n, p) => n + p.estimatedSolvingMin,
        0,
      );
      expect(stat.estimatedMinutes).toBe(est);
    }
  });

  it("derives a non-empty tag catalogue", () => {
    expect(allTags().length).toBeGreaterThan(0);
  });
});
