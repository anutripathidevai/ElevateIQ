import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  adjacentTopics,
  availableLanguages,
  getLanguage,
  getModule,
  getTopic,
  TOPICS_IN_ORDER,
} from "@/features/languages";
import { TopicPage } from "@/features/languages/components";

/**
 * Prerender every authored topic for each available language. Today only
 * JavaScript is available; new languages join automatically once their course
 * data exists and their status flips to "available".
 */
export function generateStaticParams() {
  const params: { language: string; topic: string }[] = [];
  for (const lang of availableLanguages()) {
    // Only JavaScript has authored topics wired in currently.
    if (lang.slug === "javascript") {
      for (const t of TOPICS_IN_ORDER) {
        params.push({ language: lang.slug, topic: t.slug });
      }
    }
  }
  return params;
}

export function generateMetadata({
  params,
}: {
  params: { language: string; topic: string };
}): Metadata {
  const topic = getTopic(params.topic);
  const lang = getLanguage(params.language);
  if (!topic || !lang) return { title: "Topic" };
  return {
    title: `${topic.title} · ${lang.name}`,
    description: topic.tags.join(", "),
  };
}

export default function TopicDetailPage({
  params,
}: {
  params: { language: string; topic: string };
}) {
  const lang = getLanguage(params.language);
  if (!lang || lang.status !== "available") notFound();

  const topic = getTopic(params.topic);
  if (!topic) notFound();

  const module = getModule(topic.moduleId);
  const { prev, next } = adjacentTopics(topic.slug);

  return (
    <TopicPage
      languageName={lang.name}
      languageSlug={lang.slug}
      module={module}
      topic={topic}
      prev={prev}
      next={next}
    />
  );
}
