import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  GENAI_CATALOG,
  GENAI_TIERS,
  estimateReadingMinutes,
  getLesson,
  getLessonMeta,
} from "@/features/generative-ai";
import { ComingSoon, LessonView } from "@/features/generative-ai/components";
import { Breadcrumbs } from "@/features/shared/components/breadcrumbs";

/** Prerender every published lesson. */
export function generateStaticParams() {
  return GENAI_CATALOG.filter((q) => q.status === "published").map((q) => ({
    lesson: q.slug,
  }));
}

export function generateMetadata({
  params,
}: {
  params: { lesson: string };
}): Metadata {
  const meta = getLessonMeta(params.lesson);
  if (!meta) return { title: "Generative AI" };
  return {
    title: `${meta.title} · Generative AI`,
    description: meta.summary,
  };
}

function tierLabel(tierId: string): string {
  return GENAI_TIERS.find((t) => t.id === tierId)?.label ?? "Generative AI";
}

function tierAccent(tierId: string) {
  return GENAI_TIERS.find((t) => t.id === tierId)?.accent ?? "cyan";
}

/**
 * A single Generative AI lesson page. Published lessons render the full
 * `LessonView`; catalog entries without authored content render a polished
 * `ComingSoon` placeholder. Both are driven entirely by the registry.
 */
export default function GenerativeAiLessonPage({
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
    <>
      <Breadcrumbs
        className="mb-5"
        items={[
          { label: "Learning", href: "/learning" },
          { label: "Generative AI", href: "/learning/generative-ai" },
          { label: lesson.meta.title },
        ]}
      />
      <LessonView
        meta={lesson.meta}
        content={lesson.content}
        readingMinutes={estimateReadingMinutes(lesson.content)}
        related={related}
        tierLabel={label}
      />
    </>
  );
}
