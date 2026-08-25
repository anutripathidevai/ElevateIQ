import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAzureConfigured } from "@/lib/env";
import { MODEL } from "@/services/ai/client";
import { Breadcrumbs } from "@/features/shared/components/breadcrumbs";
import {
  getLabContent,
  getLabMeta,
  getPublishedLabSlugs,
} from "@/features/ai-labs";
import { AILabPage, ComingSoon } from "@/features/ai-labs/components";

/** Prerender every published lab. */
export function generateStaticParams() {
  return getPublishedLabSlugs().map((lab) => ({ lab }));
}

export function generateMetadata({ params }: { params: { lab: string } }): Metadata {
  const meta = getLabMeta(params.lab);
  if (!meta) return { title: "AI Labs | Compile Ready" };
  return {
    title: `${meta.title} · AI Labs | Compile Ready`,
    description: meta.summary,
    alternates: { canonical: `/ai-labs/${meta.slug}` },
  };
}

/**
 * A single AI lab. Published labs render the full interactive `AILabPage`;
 * catalog entries without authored content render a polished `ComingSoon`
 * placeholder. Both are driven entirely by the registry.
 */
export default function AILabRoute({ params }: { params: { lab: string } }) {
  const meta = getLabMeta(params.lab);
  if (!meta) notFound();

  if (meta.status !== "published") {
    return <ComingSoon meta={meta} />;
  }

  const content = getLabContent(meta.slug);
  if (!content) notFound();

  const defaultModel = isAzureConfigured ? MODEL : "demo-model";

  return (
    <>
      <Breadcrumbs
        className="mb-5"
        items={[
          { label: "AI Labs", href: "/ai-labs" },
          { label: meta.title },
        ]}
      />
      <AILabPage meta={meta} content={content} defaultModel={defaultModel} />
    </>
  );
}
