import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DSA_TOPICS, getCourse, getLesson, getTopic } from "@/features/dsa";
import { LessonView } from "@/features/dsa/components";
import { Breadcrumbs } from "@/features/shared/components/breadcrumbs";

/** Prerender every authored lesson of every published course. */
export function generateStaticParams() {
  const params: { topic: string; problem: string }[] = [];
  for (const t of DSA_TOPICS) {
    if (t.status !== "published") continue;
    const course = getCourse(t.slug);
    if (!course) continue;
    for (const lesson of course.lessons) {
      params.push({ topic: t.slug, problem: lesson.slug });
    }
  }
  return params;
}

export function generateMetadata({
  params,
}: {
  params: { topic: string; problem: string };
}): Metadata {
  const topic = getTopic(params.topic);
  const course = topic ? getCourse(topic.slug) : undefined;
  const lesson = course ? getLesson(course, params.problem) : undefined;
  if (!topic || !lesson) return { title: "DSA" };
  return {
    title: `${lesson.title} · ${topic.name}`,
    description: lesson.tags.join(", "),
  };
}

/**
 * A single DSA lesson (concept or problem). The generic `LessonView` resolves
 * the owning module, accent, prev/next, and problem position from the course and
 * dispatches to the correct renderer.
 */
export default function DsaLessonPage({
  params,
}: {
  params: { topic: string; problem: string };
}) {
  const topic = getTopic(params.topic);
  if (!topic || topic.status !== "published") notFound();

  const course = getCourse(topic.slug);
  if (!course) notFound();

  const lesson = getLesson(course, params.problem);
  if (!lesson) notFound();

  return (
    <>
      <Breadcrumbs
        className="mb-5"
        items={[
          { label: "Learning", href: "/learning" },
          { label: "DSA", href: "/learning/dsa" },
          { label: topic.name, href: `/learning/dsa/${topic.slug}` },
          { label: lesson.title },
        ]}
      />
      <LessonView
        course={course}
        slug={lesson.slug}
        basePath={`/learning/dsa/${topic.slug}`}
        problemTotal={topic.problemCount}
      />
    </>
  );
}
