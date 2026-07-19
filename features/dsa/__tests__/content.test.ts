import { describe, expect, it } from "vitest";
import {
  allCourses,
  getCourse,
  publishedTopics,
  authoredProblemCount,
  plannedLessonCount,
  lessonsInOrder,
  moduleStats,
  adjacentLessons,
} from "..";
import { dpCourse } from "../dynamic-programming";
import type {
  DsaConceptLesson,
  DsaCourse,
  DsaLesson,
  DsaProblemLesson,
} from "../types";

const DIFFICULTIES = new Set(["Easy", "Medium", "Hard"]);

/** All lesson slugs a course plans to ship, across every module. */
function plannedSlugs(course: DsaCourse): Set<string> {
  return new Set(course.modules.flatMap((m) => m.lessonSlugs));
}

/** Prose Markdown fields where the house style forbids backticks (use **bold**). */
function markdownFields(lesson: DsaLesson): string[] {
  if (lesson.kind === "concept") {
    return [
      lesson.summaryMD,
      ...lesson.sections.flatMap((s) => [s.heading, s.bodyMD]),
      lesson.recursionTree?.captionMD ?? "",
      ...(lesson.codeExamples?.map((e) => e.captionMD ?? "") ?? []),
    ];
  }
  return [
    lesson.statementMD,
    lesson.inputMD,
    lesson.outputMD,
    lesson.intuitionMD,
    lesson.stateDefinitionMD ?? "",
    lesson.stateTransitionMD ?? "",
    lesson.algorithmMD ?? "",
    lesson.complexityNote ?? "",
    lesson.interviewTipsMD,
    lesson.dryRun.inputMD,
    lesson.dryRun.narrativeMD ?? "",
    lesson.recursionTree?.captionMD ?? "",
    ...lesson.solutions.flatMap((s) => [
      s.approachMD,
      s.walkthroughMD,
      s.whenToUseMD ?? "",
    ]),
  ];
}

/** Every Java code block on a lesson (must stay template-literal-safe). */
function codeBlocks(lesson: DsaLesson): string[] {
  return lesson.kind === "concept"
    ? (lesson.codeExamples?.map((e) => e.code) ?? [])
    : lesson.solutions.map((s) => s.code);
}

function assertLiteralSafe(code: string, where: string): void {
  expect(code.includes("`"), `${where} code backtick`).toBe(false);
  expect(code.includes("${"), `${where} code interpolation`).toBe(false);
  expect(code.includes("\\"), `${where} code backslash`).toBe(false);
}

describe("dynamic-programming course structure", () => {
  it("declares 8 modules with contiguous order 1..8", () => {
    expect(dpCourse.modules).toHaveLength(8);
    const orders = dpCourse.modules.map((m) => m.order).sort((a, b) => a - b);
    expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("plans exactly 41 lessons, all uniquely slugged and 'dp-' prefixed", () => {
    const all = dpCourse.modules.flatMap((m) => m.lessonSlugs);
    expect(all).toHaveLength(41);
    expect(new Set(all).size).toBe(41);
    for (const slug of all) expect(slug.startsWith("dp-")).toBe(true);
  });

  it("authors every planned lesson (11 concepts + 30 problems)", () => {
    const planned = plannedSlugs(dpCourse);
    const authored = new Set(dpCourse.lessons.map((l) => l.slug));
    expect(dpCourse.lessons).toHaveLength(41);
    for (const slug of planned) {
      expect(authored.has(slug), `missing lesson ${slug}`).toBe(true);
    }
    const concepts = dpCourse.lessons.filter((l) => l.kind === "concept");
    const problems = dpCourse.lessons.filter((l) => l.kind === "problem");
    expect(concepts).toHaveLength(11);
    expect(problems).toHaveLength(30);
  });

  it("assigns unique, contiguous global orders 1..41", () => {
    const orders = dpCourse.lessons.map((l) => l.order).sort((a, b) => a - b);
    expect(new Set(orders).size).toBe(41);
    expect(orders[0]).toBe(1);
    expect(orders[40]).toBe(41);
    for (let i = 1; i < orders.length; i++) {
      expect(orders[i]).toBe(orders[i - 1] + 1);
    }
  });

  it("links every lesson to a module that lists its slug", () => {
    for (const l of dpCourse.lessons) {
      const mod = dpCourse.modules.find((m) => m.id === l.moduleId);
      expect(mod, `module ${l.moduleId} for ${l.slug}`).toBeDefined();
      expect(mod!.lessonSlugs).toContain(l.slug);
    }
  });
});

describe("all published courses render-ready", () => {
  it("wires a course for every published topic and fully authors it", () => {
    for (const topic of publishedTopics()) {
      const course = getCourse(topic.slug);
      expect(course, `course for ${topic.slug}`).toBeDefined();
      // Every planned lesson is authored.
      const planned = plannedSlugs(course!);
      const authored = new Set(course!.lessons.map((l) => l.slug));
      for (const slug of planned) {
        expect(authored.has(slug), `${topic.slug} missing ${slug}`).toBe(true);
      }
      expect(course!.lessons.length).toBe(plannedLessonCount(course!));
      // Registry estimates match the authored reality.
      expect(course!.lessons.length, `${topic.slug} lessonCount`).toBe(
        topic.lessonCount,
      );
      expect(authoredProblemCount(course!), `${topic.slug} problemCount`).toBe(
        topic.problemCount,
      );
    }
  });

  it("orders lessons and computes consistent prev/next per course", () => {
    for (const course of allCourses()) {
      const ordered = lessonsInOrder(course);
      for (let i = 1; i < ordered.length; i++) {
        expect(ordered[i].order).toBeGreaterThan(ordered[i - 1].order);
      }
      for (let i = 0; i < ordered.length; i++) {
        const { prev, next } = adjacentLessons(course, ordered[i].slug);
        expect(prev?.slug).toBe(ordered[i - 1]?.slug);
        expect(next?.slug).toBe(ordered[i + 1]?.slug);
      }
    }
  });

  it("reports module stats that match the module lesson lists", () => {
    for (const course of allCourses()) {
      for (const stat of moduleStats(course)) {
        expect(stat.lessonCount).toBe(stat.lessons.length);
        expect(stat.problemCount).toBe(
          stat.lessons.filter((l) => l.kind === "problem").length,
        );
      }
    }
  });
});

describe("lesson content quality (every published course)", () => {
  const lessons = allCourses().flatMap((c) => c.lessons);

  it("populates required fields on every concept lesson", () => {
    for (const l of lessons.filter(
      (x): x is DsaConceptLesson => x.kind === "concept",
    )) {
      const where = `concept ${l.slug}`;
      expect(l.title, where).toBeTruthy();
      expect(l.estimatedReadingMin, where).toBeGreaterThan(0);
      expect(l.tags.length, `${where} tags`).toBeGreaterThan(0);
      expect(l.summaryMD.length, `${where} summary`).toBeGreaterThan(10);
      expect(l.sections.length, `${where} sections`).toBeGreaterThan(0);
      for (const s of l.sections) {
        expect(s.heading, `${where} section heading`).toBeTruthy();
        expect(s.bodyMD.length, `${where} section body`).toBeGreaterThan(20);
      }
      expect(l.keyTakeaways.length, `${where} takeaways`).toBeGreaterThan(0);
    }
  });

  it("populates required fields on every problem lesson", () => {
    for (const l of lessons.filter(
      (x): x is DsaProblemLesson => x.kind === "problem",
    )) {
      const where = `problem ${l.slug}`;
      expect(l.title, where).toBeTruthy();
      expect(DIFFICULTIES.has(l.difficulty), `${where} difficulty`).toBe(true);
      expect(l.tags.length, `${where} tags`).toBeGreaterThan(0);
      expect(l.companies.length, `${where} companies`).toBeGreaterThan(0);
      expect(l.estimatedReadingMin, where).toBeGreaterThan(0);
      expect(l.estimatedSolvingMin, where).toBeGreaterThan(0);
      expect(l.statementMD.length, where).toBeGreaterThan(20);
      expect(l.constraints.length, `${where} constraints`).toBeGreaterThan(0);
      expect(l.examples.length, `${where} examples`).toBeGreaterThan(0);
      expect(l.learningObjectives.length, `${where} objectives`).toBeGreaterThan(0);
      expect(l.commonMistakes.length, `${where} mistakes`).toBeGreaterThan(0);
      expect(l.intuitionMD.length, where).toBeGreaterThan(20);
      expect(l.interviewTipsMD.length, where).toBeGreaterThan(20);
      expect(l.followUps.length, `${where} followUps`).toBeGreaterThan(0);
      expect(l.keyTakeaways.length, `${where} takeaways`).toBeGreaterThan(0);
      expect(l.pattern, `${where} pattern`).toBeTruthy();
    }
  });

  it("requires DP state definition + transition on Dynamic Programming problems", () => {
    for (const l of dpCourse.lessons.filter(
      (x): x is DsaProblemLesson => x.kind === "problem",
    )) {
      const where = `problem ${l.slug}`;
      expect(l.stateDefinitionMD?.length ?? 0, `${where} state def`).toBeGreaterThan(
        15,
      );
      expect(
        l.stateTransitionMD?.length ?? 0,
        `${where} state transition`,
      ).toBeGreaterThan(15);
    }
  });

  it("gives each problem 1-2 optimal solutions with complexity + Java code", () => {
    for (const l of lessons.filter(
      (x): x is DsaProblemLesson => x.kind === "problem",
    )) {
      const where = `problem ${l.slug}`;
      expect(l.solutions.length, `${where} solution count`).toBeGreaterThan(0);
      expect(l.solutions.length, `${where} solution count`).toBeLessThanOrEqual(2);
      for (const s of l.solutions) {
        expect(s.name, `${where} solution name`).toBeTruthy();
        expect(s.complexity.time, `${where} time`).toBeTruthy();
        expect(s.complexity.space, `${where} space`).toBeTruthy();
        expect(s.filename.endsWith(".java"), `${where} filename`).toBe(true);
        expect(s.code.length, `${where} code`).toBeGreaterThan(40);
        assertLiteralSafe(s.code, where);
      }
    }
  });

  it("keeps dry-run rows aligned with their columns", () => {
    for (const l of lessons.filter(
      (x): x is DsaProblemLesson => x.kind === "problem",
    )) {
      const { columns, rows } = l.dryRun;
      expect(columns.length, `${l.slug} columns`).toBeGreaterThan(0);
      expect(rows.length, `${l.slug} rows`).toBeGreaterThan(0);
      for (const row of rows) {
        expect(row.length, `${l.slug} row width`).toBe(columns.length);
      }
    }
  });

  it("references only valid slugs/urls in similar problems (3-5 each)", () => {
    for (const course of allCourses()) {
      const planned = plannedSlugs(course);
      for (const l of course.lessons.filter(
        (x): x is DsaProblemLesson => x.kind === "problem",
      )) {
        const where = `problem ${l.slug}`;
        expect(
          l.similarProblems.length,
          `${where} similar count`,
        ).toBeGreaterThanOrEqual(3);
        expect(
          l.similarProblems.length,
          `${where} similar count`,
        ).toBeLessThanOrEqual(5);
        for (const s of l.similarProblems) {
          expect(s.title, `${where} similar title`).toBeTruthy();
          expect(DIFFICULTIES.has(s.difficulty), `${where} similar diff`).toBe(
            true,
          );
          expect(Boolean(s.slug) || Boolean(s.url), `${where} similar link`).toBe(
            true,
          );
          if (s.slug) {
            expect(planned.has(s.slug), `${where} -> ${s.slug}`).toBe(true);
          }
        }
      }
    }
  });

  it("uses **bold** instead of backticks in prose, and literal-safe code", () => {
    for (const l of lessons) {
      for (const md of markdownFields(l)) {
        expect(md.includes("`"), `${l.slug} markdown backtick`).toBe(false);
      }
      for (const code of codeBlocks(l)) {
        assertLiteralSafe(code, `${l.slug} example`);
      }
    }
  });
});
