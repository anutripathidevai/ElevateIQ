import { describe, expect, it } from "vitest";
import {
  adjacentTopics,
  AUTHORED_TOPIC_COUNT,
  getModule,
  getTopic,
  JS_INTERVIEW_HUB,
  JS_MODULES,
  JS_TOPICS,
  moduleStats,
  PLANNED_TOPIC_COUNT,
  publishedModuleIds,
  topicsForModule,
  TOPICS_IN_ORDER,
} from "..";
import type { Topic } from "../types";

const TOPIC_DIFFICULTIES = new Set(["Beginner", "Intermediate", "Advanced"]);
const EXERCISE_DIFFICULTIES = new Set(["Easy", "Medium", "Hard"]);

/**
 * Code fields are authored as backtick template literals in the source data, so
 * they must never contain a literal backtick or a `${` interpolation — either
 * would break compilation or silently corrupt the sample.
 */
function assertRunnableCodeSafe(code: string, where: string) {
  expect(code.includes("`"), `${where} contains backtick`).toBe(false);
  expect(code.includes("${"), `${where} contains interpolation`).toBe(false);
}

/** Every runnable/code string on a topic (playground, examples, exercises…). */
function topicCodeFields(t: Topic): { code: string; where: string }[] {
  const out: { code: string; where: string }[] = [];
  t.codeExamples?.forEach((c, i) =>
    out.push({ code: c.code, where: `${t.slug} codeExamples[${i}]` }),
  );
  t.playground?.forEach((p, i) =>
    out.push({ code: p.code, where: `${t.slug} playground[${i}]` }),
  );
  t.outputPredictions?.forEach((p, i) =>
    out.push({ code: p.code, where: `${t.slug} outputPredictions[${i}].code` }),
  );
  t.codingExercises?.forEach((e, i) =>
    out.push({
      code: e.solutionCode,
      where: `${t.slug} codingExercises[${i}].solutionCode`,
    }),
  );
  t.diagrams?.forEach((d, i) => {
    if (d.ascii) out.push({ code: d.ascii, where: `${t.slug} diagrams[${i}].ascii` });
  });
  return out;
}

describe("javascript course structure", () => {
  it("declares 14 modules with contiguous order 1..14", () => {
    expect(JS_MODULES).toHaveLength(14);
    const orders = JS_MODULES.map((m) => m.order).sort((a, b) => a - b);
    expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  });

  it("gives every module a unique id and non-empty topic list", () => {
    const ids = new Set<string>();
    for (const m of JS_MODULES) {
      expect(ids.has(m.id), `duplicate module id ${m.id}`).toBe(false);
      ids.add(m.id);
      expect(m.topicSlugs.length, `${m.id} topics`).toBeGreaterThan(0);
    }
  });

  it("uses unique, js-prefixed slugs across the whole curriculum", () => {
    const all = JS_MODULES.flatMap((m) => m.topicSlugs);
    expect(new Set(all).size, "duplicate topic slug").toBe(all.length);
    for (const slug of all) expect(slug.startsWith("js-"), slug).toBe(true);
    expect(PLANNED_TOPIC_COUNT).toBe(all.length);
  });

  it("publishes exactly modules 1-3", () => {
    expect(publishedModuleIds().sort()).toEqual(
      ["fundamentals", "scope-closures", "variables-data-types"].sort(),
    );
  });
});

describe("javascript authored content", () => {
  it("authors every topic of every published module", () => {
    const authored = new Set(JS_TOPICS.map((t) => t.slug));
    for (const id of publishedModuleIds()) {
      const mod = getModule(id)!;
      for (const slug of mod.topicSlugs) {
        expect(authored.has(slug), `missing authored topic ${slug}`).toBe(true);
      }
    }
  });

  it("keeps AUTHORED_TOPIC_COUNT in sync with JS_TOPICS", () => {
    expect(AUTHORED_TOPIC_COUNT).toBe(JS_TOPICS.length);
    expect(AUTHORED_TOPIC_COUNT).toBeGreaterThanOrEqual(26);
  });

  it("assigns every authored topic a unique slug and order", () => {
    const slugs = new Set<string>();
    const orders = new Set<number>();
    for (const t of JS_TOPICS) {
      expect(slugs.has(t.slug), `dup slug ${t.slug}`).toBe(false);
      slugs.add(t.slug);
      expect(orders.has(t.order), `dup order ${t.order} (${t.slug})`).toBe(false);
      orders.add(t.order);
    }
  });

  it("links every authored topic to a module that lists its slug", () => {
    for (const t of JS_TOPICS) {
      const mod = getModule(t.moduleId);
      expect(mod, `module ${t.moduleId} for ${t.slug}`).toBeDefined();
      expect(mod!.topicSlugs, `${t.slug} not in ${t.moduleId}`).toContain(
        t.slug,
      );
    }
  });

  it("populates all required fields for every authored topic", () => {
    for (const t of JS_TOPICS) {
      const where = `topic ${t.slug}`;
      expect(t.title, where).toBeTruthy();
      expect(TOPIC_DIFFICULTIES.has(t.difficulty), `${where} difficulty`).toBe(
        true,
      );
      expect(t.estimatedReadingMin, `${where} reading`).toBeGreaterThan(0);
      expect(t.estimatedPracticeMin, `${where} practice`).toBeGreaterThanOrEqual(
        0,
      );
      expect(t.tags.length, `${where} tags`).toBeGreaterThan(0);
      expect(t.introMD.length, `${where} intro`).toBeGreaterThan(20);
      expect(t.theoryMD.length, `${where} theory`).toBeGreaterThan(40);
      expect(t.summary.length, `${where} summary`).toBeGreaterThan(0);
    }
  });

  it("keeps all runnable/code fields free of backticks and interpolation", () => {
    for (const t of JS_TOPICS) {
      for (const { code, where } of topicCodeFields(t)) {
        assertRunnableCodeSafe(code, where);
      }
    }
  });

  it("uses valid difficulties for coding exercises", () => {
    for (const t of JS_TOPICS) {
      for (const e of t.codingExercises ?? []) {
        expect(
          EXERCISE_DIFFICULTIES.has(e.difficulty),
          `${t.slug} exercise "${e.title}" difficulty`,
        ).toBe(true);
      }
    }
  });

  it("keeps every quiz correctIndex inside the option range", () => {
    for (const t of JS_TOPICS) {
      for (const q of t.quiz ?? []) {
        expect(q.options.length, `${t.slug} quiz options`).toBeGreaterThan(1);
        expect(q.correctIndex, `${t.slug} quiz correctIndex`).toBeGreaterThanOrEqual(
          0,
        );
        expect(
          q.correctIndex,
          `${t.slug} quiz correctIndex out of range`,
        ).toBeLessThan(q.options.length);
      }
    }
  });

  it("gives output predictions both an answer and an explanation", () => {
    for (const t of JS_TOPICS) {
      for (const p of t.outputPredictions ?? []) {
        expect(p.code.length, `${t.slug} prediction code`).toBeGreaterThan(0);
        expect(p.answer.length, `${t.slug} prediction answer`).toBeGreaterThan(0);
        expect(
          p.explanationMD.length,
          `${t.slug} prediction explanation`,
        ).toBeGreaterThan(0);
      }
    }
  });
});

describe("javascript course helpers", () => {
  it("orders TOPICS_IN_ORDER by ascending order", () => {
    for (let i = 1; i < TOPICS_IN_ORDER.length; i++) {
      expect(TOPICS_IN_ORDER[i].order).toBeGreaterThan(
        TOPICS_IN_ORDER[i - 1].order,
      );
    }
  });

  it("computes prev/next consistently across authored topics", () => {
    for (let i = 0; i < TOPICS_IN_ORDER.length; i++) {
      const t = TOPICS_IN_ORDER[i];
      const { prev, next } = adjacentTopics(t.slug);
      expect(prev?.slug).toBe(TOPICS_IN_ORDER[i - 1]?.slug);
      expect(next?.slug).toBe(TOPICS_IN_ORDER[i + 1]?.slug);
    }
  });

  it("resolves getTopic for every authored slug and misses cleanly", () => {
    for (const t of JS_TOPICS) {
      expect(getTopic(t.slug)?.slug).toBe(t.slug);
    }
    expect(getTopic("js-does-not-exist")).toBeUndefined();
  });

  it("reports module stats that match topicsForModule", () => {
    for (const stat of moduleStats()) {
      expect(stat.topicCount).toBe(stat.topics.length);
      expect(topicsForModule(stat.module.id).length).toBe(stat.topicCount);
      const est = stat.topics.reduce(
        (n, t) => n + t.estimatedReadingMin + t.estimatedPracticeMin,
        0,
      );
      expect(stat.estimatedMinutes).toBe(est);
    }
  });
});

describe("javascript interview hub", () => {
  it("targets the javascript language", () => {
    expect(JS_INTERVIEW_HUB.language).toBe("javascript");
  });

  it("has curated questions with valid difficulties", () => {
    expect(JS_INTERVIEW_HUB.questions.length).toBeGreaterThan(0);
    const ids = new Set<string>();
    for (const q of JS_INTERVIEW_HUB.questions) {
      expect(ids.has(q.id), `dup hub question id ${q.id}`).toBe(false);
      ids.add(q.id);
      expect(EXERCISE_DIFFICULTIES.has(q.difficulty), `${q.id} difficulty`).toBe(
        true,
      );
      expect(q.answerMD.length, `${q.id} answer`).toBeGreaterThan(0);
    }
  });

  it("keeps coding + machine-coding solution code literal-safe", () => {
    const coding = [
      ...JS_INTERVIEW_HUB.codingQuestions,
      ...JS_INTERVIEW_HUB.machineCoding,
    ];
    expect(coding.length).toBeGreaterThan(0);
    for (const c of coding) {
      expect(EXERCISE_DIFFICULTIES.has(c.difficulty), `${c.id} difficulty`).toBe(
        true,
      );
      assertRunnableCodeSafe(c.solutionCode, `hub ${c.id} solutionCode`);
    }
  });

  it("keeps hub output predictions literal-safe with answers", () => {
    for (const p of JS_INTERVIEW_HUB.outputPredictions) {
      assertRunnableCodeSafe(p.code, "hub prediction");
      expect(p.answer.length).toBeGreaterThan(0);
    }
  });
});
