import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CD_MODULES,
  estimateReadingMinutes,
  getModule,
  getModuleMeta,
} from "@/features/cloud-devops";
import { ComingSoon, ModuleView } from "@/features/cloud-devops/components";
import { Breadcrumbs } from "@/features/shared/components/breadcrumbs";

/** Prerender every published module. */
export function generateStaticParams() {
  return CD_MODULES.filter((m) => m.status === "published").map((m) => ({
    module: m.slug,
  }));
}

export function generateMetadata({
  params,
}: {
  params: { module: string };
}): Metadata {
  const meta = getModuleMeta(params.module);
  if (!meta) return { title: "Cloud & DevOps | Compile Ready" };
  return {
    title: `${meta.title} · Cloud & DevOps | Compile Ready`,
    description: meta.summary,
  };
}

/**
 * A single Cloud & DevOps module page. Published modules render the full
 * `ModuleView`; catalog entries without authored content render a polished
 * `ComingSoon` placeholder. Both are driven entirely by the registry.
 */
export default function CloudDevopsModulePage({
  params,
}: {
  params: { module: string };
}) {
  const meta = getModuleMeta(params.module);
  if (!meta) notFound();

  if (meta.status !== "published") {
    return <ComingSoon meta={meta} accent={meta.accent} />;
  }

  const module = getModule(meta.slug);
  if (!module) notFound();

  return (
    <>
      <Breadcrumbs
        className="mb-5"
        items={[
          { label: "Learning", href: "/learning" },
          { label: "Cloud & DevOps", href: "/learning/cloud-devops" },
          { label: module.meta.title },
        ]}
      />
      <ModuleView
        meta={module.meta}
        content={module.content}
        readingMinutes={estimateReadingMinutes(module.content)}
      />
    </>
  );
}
