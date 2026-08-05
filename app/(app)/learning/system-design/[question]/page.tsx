import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  SD_CATALOG,
  SD_TIERS,
  estimateReadingMinutes,
  getQuestion,
  getQuestionMeta,
} from "@/features/system-design";
import { ComingSoon, QuestionView } from "@/features/system-design/components";
import { Breadcrumbs } from "@/features/shared/components/breadcrumbs";

/** Prerender every published question. */
export function generateStaticParams() {
  return SD_CATALOG.filter((q) => q.status === "published").map((q) => ({
    question: q.slug,
  }));
}

export function generateMetadata({
  params,
}: {
  params: { question: string };
}): Metadata {
  const meta = getQuestionMeta(params.question);
  if (!meta) return { title: "System Design" };
  return {
    title: `${meta.title} · System Design`,
    description: meta.summary,
  };
}

function tierLabel(tierId: string): string {
  return SD_TIERS.find((t) => t.id === tierId)?.label ?? "System Design";
}

function tierAccent(tierId: string) {
  return SD_TIERS.find((t) => t.id === tierId)?.accent ?? "violet";
}

/**
 * A single System Design question page. Published questions render the full
 * 25-section `QuestionView`; catalog entries without authored content render a
 * polished `ComingSoon` placeholder. Both are driven entirely by the registry.
 */
export default function SystemDesignQuestionPage({
  params,
}: {
  params: { question: string };
}) {
  const meta = getQuestionMeta(params.question);
  if (!meta) notFound();

  const label = tierLabel(meta.tier);

  if (meta.status !== "published") {
    return (
      <ComingSoon meta={meta} tierLabel={label} accent={tierAccent(meta.tier)} />
    );
  }

  const question = getQuestion(meta.slug);
  if (!question) notFound();

  const related = question.content.relatedQuestions.flatMap((r) => {
    const m = getQuestionMeta(r.slug);
    return m ? [{ slug: m.slug, title: m.title, note: r.note }] : [];
  });

  return (
    <>
      <Breadcrumbs
        className="mb-5"
        items={[
          { label: "Learning", href: "/learning" },
          { label: "System Design", href: "/learning/system-design" },
          { label: question.meta.title },
        ]}
      />
      <QuestionView
        meta={question.meta}
        content={question.content}
        readingMinutes={estimateReadingMinutes(question.content)}
        related={related}
        tierLabel={label}
      />
    </>
  );
}
