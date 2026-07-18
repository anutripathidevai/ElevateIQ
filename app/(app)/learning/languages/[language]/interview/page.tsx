import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/blocks/page-header";
import {
  JS_INTERVIEW_HUB,
  LANGUAGES,
  getLanguage,
} from "@/features/languages";
import { Breadcrumb, InterviewHubView } from "@/features/languages/components";

export function generateStaticParams() {
  return LANGUAGES.filter((l) => l.status === "available").map((l) => ({
    language: l.slug,
  }));
}

export function generateMetadata({
  params,
}: {
  params: { language: string };
}): Metadata {
  const lang = getLanguage(params.language);
  return {
    title: lang ? `${lang.name} Interview Hub` : "Interview Hub",
    description: "Top interview questions, coding challenges, and cheat sheets.",
  };
}

export default function LanguageInterviewHubPage({
  params,
}: {
  params: { language: string };
}) {
  const lang = getLanguage(params.language);
  if (!lang || lang.status !== "available") notFound();

  // JavaScript is the only available course today.
  const hub = JS_INTERVIEW_HUB;

  return (
    <div className="space-y-8">
      <Breadcrumb
        items={[
          { label: "Learning", href: "/learning" },
          { label: "Languages", href: "/learning/languages" },
          { label: lang.name, href: `/learning/languages/${lang.slug}` },
          { label: "Interview Hub" },
        ]}
      />

      <PageHeader
        eyebrow={`${lang.name} · Interview Prep`}
        title="Interview Hub"
        description="The questions, coding challenges, output puzzles, and cheat sheets that show up again and again — curated for Senior and Staff interviews."
        accent={lang.accent}
        icon={GraduationCap}
      />

      <InterviewHubView hub={hub} />
    </div>
  );
}
