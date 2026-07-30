/**
 * Pure data-access helpers over a `DsaCourse`. Route pages and components import
 * from here so the rendering layer never touches raw arrays and every course —
 * Graph, Dynamic Programming, or any future one — is queried the same way.
 */
import type {
  DsaCourse,
  DsaLesson,
  DsaModule,
  DsaModuleStats,
  DsaProblemLesson,
} from "./types";

/** Solving estimate for a lesson (concept lessons use their reading estimate). */
function lessonMinutes(lesson: DsaLesson): number {
  return lesson.kind === "problem"
    ? lesson.estimatedSolvingMin
    : lesson.estimatedReadingMin;
}

/** Number of problems planned across all modules (authored or not). */
export function plannedLessonCount(course: DsaCourse): number {
  return course.modules.reduce((n, m) => n + m.lessonSlugs.length, 0);
}

/** Authored lessons in global learning order (by `order`). */
export function lessonsInOrder(course: DsaCourse): DsaLesson[] {
  return [...course.lessons].sort((a, b) => a.order - b.order);
}

export function getLesson(
  course: DsaCourse,
  slug: string,
): DsaLesson | undefined {
  return course.lessons.find((l) => l.slug === slug);
}

export function getModule(
  course: DsaCourse,
  id: string,
): DsaModule | undefined {
  return course.modules.find((m) => m.id === id);
}

/** Lessons belonging to a module, in the module's declared order. */
export function lessonsForModule(
  course: DsaCourse,
  moduleId: string,
): DsaLesson[] {
  const mod = getModule(course, moduleId);
  if (!mod) return [];
  const bySlug = new Map(course.lessons.map((l) => [l.slug, l]));
  return mod.lessonSlugs
    .map((s) => bySlug.get(s))
    .filter((l): l is DsaLesson => Boolean(l));
}

/** Per-module display stats (only counts authored lessons). */
export function moduleStats(course: DsaCourse): DsaModuleStats[] {
  return course.modules.map((module) => {
    const lessons = lessonsForModule(course, module.id);
    return {
      module,
      lessons,
      lessonCount: lessons.length,
      problemCount: lessons.filter((l) => l.kind === "problem").length,
      estimatedMinutes: lessons.reduce((n, l) => n + lessonMinutes(l), 0),
    };
  });
}

/** Previous/next lesson in the overall learning order (authored lessons only). */
export function adjacentLessons(
  course: DsaCourse,
  slug: string,
): { prev?: DsaLesson; next?: DsaLesson } {
  const ordered = lessonsInOrder(course);
  const idx = ordered.findIndex((l) => l.slug === slug);
  if (idx === -1) return {};
  return {
    prev: idx > 0 ? ordered[idx - 1] : undefined,
    next: idx < ordered.length - 1 ? ordered[idx + 1] : undefined,
  };
}

/** All authored problem lessons (excludes concept pages). */
export function problemLessons(course: DsaCourse): DsaProblemLesson[] {
  return course.lessons.filter(
    (l): l is DsaProblemLesson => l.kind === "problem",
  );
}

/** Count of authored problem lessons. */
export function authoredProblemCount(course: DsaCourse): number {
  return problemLessons(course).length;
}

/** Distinct, sorted tags across all authored lessons. */
export function allTags(course: DsaCourse): string[] {
  const s = new Set<string>();
  for (const l of course.lessons) l.tags.forEach((t) => s.add(t));
  return [...s].sort();
}

/** Distinct, sorted companies across all authored problem lessons. */
export function allCompanies(course: DsaCourse): string[] {
  const s = new Set<string>();
  for (const l of problemLessons(course)) l.companies.forEach((c) => s.add(c));
  return [...s].sort();
}

/** Total estimated study minutes across authored lessons. */
export function totalMinutes(course: DsaCourse): number {
  return course.lessons.reduce((n, l) => n + lessonMinutes(l), 0);
}

/** Difficulty distribution across authored problem lessons. */
export function difficultyDistribution(
  course: DsaCourse,
): { Easy: number; Medium: number; Hard: number } {
  const dist = { Easy: 0, Medium: 0, Hard: 0 };
  for (const p of problemLessons(course)) dist[p.difficulty] += 1;
  return dist;
}
