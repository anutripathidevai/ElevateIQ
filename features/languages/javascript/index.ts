import type { CourseModule, ModuleStats, Topic } from "../types";
import { JS_COURSE } from "./course";
import { JS_MODULES } from "./modules";
import { JS_TOPICS } from "./data";
import { JS_INTERVIEW_HUB } from "./interview-hub";

export { JS_COURSE, JS_MODULES, JS_TOPICS, JS_INTERVIEW_HUB };

/** Total topics planned across the whole curriculum (published + coming-soon). */
export const PLANNED_TOPIC_COUNT = JS_MODULES.reduce(
  (n, m) => n + m.topicSlugs.length,
  0,
);

/** Topics that have real authored content today. */
export const AUTHORED_TOPIC_COUNT = JS_TOPICS.length;

/** Authored topics in global learning order. */
export const TOPICS_IN_ORDER: Topic[] = [...JS_TOPICS].sort(
  (a, b) => a.order - b.order,
);

export function getModule(id: string): CourseModule | undefined {
  return JS_MODULES.find((m) => m.id === id);
}

export function getTopic(slug: string): Topic | undefined {
  return JS_TOPICS.find((t) => t.slug === slug);
}

/** Authored topics belonging to a module, in the module's declared order. */
export function topicsForModule(moduleId: string): Topic[] {
  const mod = getModule(moduleId);
  if (!mod) return [];
  const order = new Map(mod.topicSlugs.map((slug, i) => [slug, i]));
  return JS_TOPICS.filter((t) => t.moduleId === moduleId).sort(
    (a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0),
  );
}

/** Previous/next authored topic in global learning order. */
export function adjacentTopics(slug: string): {
  prev?: Topic;
  next?: Topic;
} {
  const i = TOPICS_IN_ORDER.findIndex((t) => t.slug === slug);
  if (i === -1) return {};
  return {
    prev: i > 0 ? TOPICS_IN_ORDER[i - 1] : undefined,
    next: i < TOPICS_IN_ORDER.length - 1 ? TOPICS_IN_ORDER[i + 1] : undefined,
  };
}

/** Display-ready stats per module (authored topics + estimated minutes). */
export function moduleStats(): ModuleStats[] {
  return JS_MODULES.map((module) => {
    const topics = topicsForModule(module.id);
    const estimatedMinutes = topics.reduce(
      (n, t) => n + t.estimatedReadingMin + t.estimatedPracticeMin,
      0,
    );
    return {
      module,
      topics,
      topicCount: topics.length,
      estimatedMinutes,
    };
  });
}

/** All published module ids (used to gate topic routing/rendering). */
export function publishedModuleIds(): string[] {
  return JS_MODULES.filter((m) => m.status === "published").map((m) => m.id);
}

/** Aggregate course stats for the landing hero. */
export function courseStats() {
  const codingExercises = JS_TOPICS.reduce(
    (n, t) => n + (t.codingExercises?.length ?? 0),
    0,
  );
  const quizzes = JS_TOPICS.reduce((n, t) => n + (t.quiz?.length ? 1 : 0), 0);
  const interviewQuestions =
    JS_TOPICS.reduce((n, t) => n + (t.interviewQuestions?.length ?? 0), 0) +
    JS_INTERVIEW_HUB.questions.length;
  return {
    modules: JS_MODULES.length,
    plannedTopics: PLANNED_TOPIC_COUNT,
    authoredTopics: AUTHORED_TOPIC_COUNT,
    codingExercises,
    quizzes,
    interviewQuestions,
  };
}
