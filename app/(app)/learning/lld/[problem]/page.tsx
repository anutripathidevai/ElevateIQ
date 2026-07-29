import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  LLD_CATALOG,
  LLD_TIERS,
  estimateConceptMinutes,
  estimateProblemMinutes,
  getConcept,
  getMeta,
  getProblem,
} from "@/features/lld";
import {
  ComingSoon,
  ConceptView,
  ProblemView,
} from "@/features/lld/components";

/** Prerender every published entry (problem or concept). */
export function generateStaticParams() {
  return LLD_CATALOG.filter((q) => q.status === "published").map((q) => ({
    problem: q.slug,
  }));
}

export function generateMetadata({
  params,
}: {
  params: { problem: string };
}): Metadata {
  const meta = getMeta(params.problem);
  if (!meta) return { title: "Low Level Design" };
  return {
    title: `${meta.title} · Low Level Design`,
    description: meta.summary,
  };
}

function tierLabel(tierId: string): string {
  return LLD_TIERS.find((t) => t.id === tierId)?.label ?? "Low Level Design";
}

function tierAccent(tierId: string) {
  return LLD_TIERS.find((t) => t.id === tierId)?.accent ?? "emerald";
}

/**
 * A single Low Level Design entry page. Published problems render the full
 * multi-section `ProblemView`; published concepts render the lighter
 * `ConceptView`; catalog entries without authored content render a polished
 * `ComingSoon` placeholder. Everything is driven by the registry + content map,
 * so this route never changes as content is added.
 */
export default function LldProblemPage({
  params,
}: {
  params: { problem: string };
}) {
  const meta = getMeta(params.problem);
  if (!meta) notFound();

  const label = tierLabel(meta.tier);
  const accent = tierAccent(meta.tier);

  // Concept entry.
  if (meta.kind === "concept") {
    const concept = getConcept(meta.slug);
    if (!concept) {
      return <ComingSoon meta={meta} tierLabel={label} accent={accent} />;
    }
    const related = concept.content.relatedProblems.flatMap((r) => {
      const m = getMeta(r.slug);
      return m ? [{ slug: m.slug, title: m.title, note: r.note }] : [];
    });
    return (
      <ConceptView
        meta={concept.meta}
        content={concept.content}
        readingMinutes={estimateConceptMinutes(concept.content)}
        related={related}
        tierLabel={label}
      />
    );
  }

  // Problem entry.
  const problem = getProblem(meta.slug);
  if (!problem) {
    return <ComingSoon meta={meta} tierLabel={label} accent={accent} />;
  }
  const related = problem.content.relatedProblems.flatMap((r) => {
    const m = getMeta(r.slug);
    return m ? [{ slug: m.slug, title: m.title, note: r.note }] : [];
  });
  return (
    <ProblemView
      meta={problem.meta}
      content={problem.content}
      readingMinutes={estimateProblemMinutes(problem.content)}
      related={related}
      tierLabel={label}
    />
  );
}
