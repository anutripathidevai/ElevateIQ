import type { LanguageMeta } from "./types";

/**
 * The single source of truth for which language courses exist and their
 * availability. Only JavaScript is authored today; the rest render a polished
 * "Coming Soon" page. Adding a language = appending an entry here and (when
 * ready) flipping its status to "available" once its course content exists.
 */
export const LANGUAGES: LanguageMeta[] = [
  {
    slug: "javascript",
    name: "JavaScript",
    tagline:
      "Master the language of the web — from the event loop to closures — the way top companies interview it.",
    status: "available",
    accent: "orange",
    iconKey: "javascript",
  },
  {
    slug: "java",
    name: "Java",
    tagline: "Enterprise-grade OOP, the JVM, collections, and concurrency.",
    status: "coming-soon",
    accent: "rose",
    iconKey: "java",
  },
  {
    slug: "python",
    name: "Python",
    tagline: "Readable, powerful, and everywhere — from scripting to ML.",
    status: "coming-soon",
    accent: "blue",
    iconKey: "python",
  },
  {
    slug: "csharp",
    name: "C#",
    tagline: "Modern .NET, LINQ, async/await, and the CLR.",
    status: "coming-soon",
    accent: "violet",
    iconKey: "csharp",
  },
  {
    slug: "cpp",
    name: "C++",
    tagline: "Systems programming, memory, the STL, and performance.",
    status: "coming-soon",
    accent: "cyan",
    iconKey: "cpp",
  },
  {
    slug: "go",
    name: "Go",
    tagline: "Simple, concurrent, and fast — built for modern backends.",
    status: "coming-soon",
    accent: "emerald",
    iconKey: "go",
  },
];

export function getLanguage(slug: string): LanguageMeta | undefined {
  return LANGUAGES.find((l) => l.slug === slug);
}

export function availableLanguages(): LanguageMeta[] {
  return LANGUAGES.filter((l) => l.status === "available");
}
