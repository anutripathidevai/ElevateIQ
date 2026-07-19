import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  comingSoonContent,
  DSA_TOPICS,
  getCourse,
  getTopic,
} from "@/features/dsa";
import { CourseLanding, DsaComingSoon } from "@/features/dsa/components";

/** Prerender a page for every topic in the registry (published or coming-soon). */
export function generateStaticParams() {
  return DSA_TOPICS.map((t) => ({ topic: t.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { topic: string };
}): Metadata {
  const topic = getTopic(params.topic);
  if (!topic) return { title: "DSA" };
  return {
    title: `${topic.name} · DSA`,
    description: topic.description,
  };
}

/**
 * A DSA topic page. Published topics render the generic course landing; every
 * other topic renders a polished coming-soon page. Both are driven entirely by
 * registry data + optional course/coming-soon content — no per-topic code.
 */
export default function DsaTopicPage({
  params,
}: {
  params: { topic: string };
}) {
  const topic = getTopic(params.topic);
  if (!topic) notFound();

  if (topic.status === "published") {
    const course = getCourse(topic.slug);
    if (course) {
      return (
        <CourseLanding
          topic={topic}
          course={course}
          basePath={`/learning/dsa/${topic.slug}`}
        />
      );
    }
  }

  return <DsaComingSoon topic={topic} content={comingSoonContent(topic.slug)} />;
}
