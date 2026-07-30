import { moduleAccent } from "@/features/graph-algorithms/components";
import type { DsaCourse } from "../types";
import { adjacentLessons, getLesson, getModule, lessonsInOrder } from "../course-api";
import { ConceptLessonView } from "./concept-lesson-view";
import { ProblemLessonView } from "./problem-lesson-view";

/**
 * Resolves everything a lesson page needs from the course + slug (owning module,
 * accent, prev/next, problem position) and dispatches to the correct renderer.
 * Route pages stay thin: they only look up the course and hand it to this view.
 */
export function LessonView({
  course,
  slug,
  basePath,
  problemTotal,
}: {
  course: DsaCourse;
  slug: string;
  basePath: string;
  /** Planned number of problems in the course (for the "Problem X of Y" meta). */
  problemTotal: number;
}) {
  const lesson = getLesson(course, slug);
  if (!lesson) return null;

  const mod = getModule(course, lesson.moduleId);
  const accent = mod ? moduleAccent(mod.order) : course.meta.accent;
  const moduleLabel = mod ? `Module ${mod.order} · ${mod.title}` : undefined;

  const { prev, next } = adjacentLessons(course, slug);
  const navPrev = prev ? { slug: prev.slug, title: prev.title } : undefined;
  const navNext = next ? { slug: next.slug, title: next.title } : undefined;

  if (lesson.kind === "concept") {
    return (
      <ConceptLessonView
        lesson={lesson}
        moduleLabel={moduleLabel}
        accent={accent}
        basePath={basePath}
        prev={navPrev}
        next={navNext}
      />
    );
  }

  const problemsInOrder = lessonsInOrder(course).filter(
    (l) => l.kind === "problem",
  );
  const position = problemsInOrder.findIndex((l) => l.slug === slug) + 1;

  return (
    <ProblemLessonView
      lesson={lesson}
      moduleLabel={moduleLabel}
      accent={accent}
      position={position}
      total={Math.max(problemTotal, problemsInOrder.length)}
      basePath={basePath}
      prev={navPrev}
      next={navNext}
    />
  );
}
