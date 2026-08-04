import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";
import { DSA_TOPICS, getCourse } from "@/features/dsa";
import { SD_CATALOG } from "@/features/system-design";
import { LLD_CATALOG } from "@/features/lld";
import { GENAI_CATALOG } from "@/features/generative-ai";
import {
  LANGUAGES,
  availableLanguages,
  TOPICS_IN_ORDER,
} from "@/features/languages";

type Entry = MetadataRoute.Sitemap[number];

/**
 * sitemap.xml (served at /sitemap.xml). Enumerates every publicly indexable URL:
 * the marketing pages, the legal pages, and the full published learning catalog.
 * Learning URLs mirror each dynamic route's `generateStaticParams` exactly, so
 * the sitemap and the prerendered pages never drift. Gated/private routes
 * (dashboard, mock, panel, auth, etc.) are intentionally excluded.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const url = (path: string, priority: number, changeFrequency: Entry["changeFrequency"]): Entry => ({
    url: `${siteConfig.url}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });

  // --- Marketing + legal -------------------------------------------------
  const marketing: Entry[] = [
    url("/", 1.0, "weekly"),
    url("/pricing", 0.7, "monthly"),
    url("/contact", 0.6, "monthly"),
    url("/privacy-policy", 0.3, "yearly"),
    url("/terms", 0.3, "yearly"),
    url("/disclaimer", 0.3, "yearly"),
  ];

  // --- Learning hubs -----------------------------------------------------
  const hubs: Entry[] = [
    url("/learning", 0.9, "weekly"),
    url("/learning/dsa", 0.9, "weekly"),
    url("/learning/system-design", 0.9, "weekly"),
    url("/learning/lld", 0.9, "weekly"),
    url("/learning/generative-ai", 0.9, "weekly"),
    url("/learning/languages", 0.9, "weekly"),
  ];

  // --- DSA: topics + published problems ----------------------------------
  const dsaTopics: Entry[] = DSA_TOPICS.map((t) =>
    url(`/learning/dsa/${t.slug}`, 0.8, "monthly"),
  );
  const dsaProblems: Entry[] = [];
  for (const t of DSA_TOPICS) {
    if (t.status !== "published") continue;
    const course = getCourse(t.slug);
    if (!course) continue;
    for (const lesson of course.lessons) {
      dsaProblems.push(
        url(`/learning/dsa/${t.slug}/${lesson.slug}`, 0.7, "monthly"),
      );
    }
  }

  // --- System Design / LLD / Generative AI (published entries) -----------
  const systemDesign: Entry[] = SD_CATALOG.filter(
    (q) => q.status === "published",
  ).map((q) => url(`/learning/system-design/${q.slug}`, 0.7, "monthly"));

  const lld: Entry[] = LLD_CATALOG.filter((q) => q.status === "published").map(
    (q) => url(`/learning/lld/${q.slug}`, 0.7, "monthly"),
  );

  const genai: Entry[] = GENAI_CATALOG.filter(
    (q) => q.status === "published",
  ).map((q) => url(`/learning/generative-ai/${q.slug}`, 0.7, "monthly"));

  // --- Languages: language hubs, JS topics, interview hubs ----------------
  const languageHubs: Entry[] = LANGUAGES.map((l) =>
    url(`/learning/languages/${l.slug}`, 0.7, "monthly"),
  );
  const languageTopics: Entry[] = [];
  for (const lang of availableLanguages()) {
    if (lang.slug === "javascript") {
      for (const topic of TOPICS_IN_ORDER) {
        languageTopics.push(
          url(`/learning/languages/${lang.slug}/${topic.slug}`, 0.6, "monthly"),
        );
      }
    }
  }
  const languageInterviews: Entry[] = LANGUAGES.filter(
    (l) => l.status === "available",
  ).map((l) => url(`/learning/languages/${l.slug}/interview`, 0.6, "monthly"));

  return [
    ...marketing,
    ...hubs,
    ...dsaTopics,
    ...dsaProblems,
    ...systemDesign,
    ...lld,
    ...genai,
    ...languageHubs,
    ...languageTopics,
    ...languageInterviews,
  ];
}
