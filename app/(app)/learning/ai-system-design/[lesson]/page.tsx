import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  AISD_CATALOG,
  AISD_TIERS,
  estimateReadingMinutes,
  getLesson,
  getLessonMeta,
} from "@/features/ai-system-design";
import { ComingSoon, LessonView } from "@/features/ai-system-design/components";

/** Prerender every published lesson. */
export function generateStaticParams() {
  return AISD_CATALOG.filter((q) => q.status === "published").map((q) => ({
    lesson: q.slug,
  }));
}

export function generateMetadata({
  params,
}: {
  params: { lesson: string };
}): Metadata {
  const meta = getLessonMeta(params.lesson);
  if (!meta) return { title: "AI System Design" };
  return {
    title: `${meta.title} · AI System Design`,
    description: meta.summary,
  };
}

function tierLabel(tierId: string): string {
  return AISD_TIERS.find((t) => t.id === tierId)?.label ?? "AI System Design";
}

function tierAccent(tierId: string) {
  return AISD_TIERS.find((t) => t.id === tierId)?.accent ?? "cyan";
}

/**
 * A single AI System Design lesson page. Published lessons render the full
 * `LessonView`; catalog entries without authored content render a polished
 * `ComingSoon` placeholder. Both are driven entirely by the registry.
 */
export default function AISystemDesignLessonPage({
  params,
}: {
  params: { lesson: string };
}) {
  const meta = getLessonMeta(params.lesson);
  if (!meta) notFound();

  const label = tierLabel(meta.tier);

  if (meta.status !== "published") {
    return (
      <ComingSoon meta={meta} tierLabel={label} accent={tierAccent(meta.tier)} />
    );
  }

  const lesson = getLesson(meta.slug);
  if (!lesson) notFound();

  const related = lesson.content.relatedLessons.flatMap((r) => {
    const m = getLessonMeta(r.slug);
    return m ? [{ slug: m.slug, title: m.title, note: r.note }] : [];
  });

  return (
    <LessonView
      meta={lesson.meta}
      content={lesson.content}
      readingMinutes={estimateReadingMinutes(lesson.content)}
      related={related}
      tierLabel={label}
    />
  );
}
