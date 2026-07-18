import type { Metadata } from "next";
import { Code2, Layers, ListChecks, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/blocks/page-header";
import { SectionHeader, StatTile } from "@/components/blocks/primitives";
import {
  LANGUAGES,
  availableLanguages,
  courseStats,
} from "@/features/languages";
import { LanguageCard } from "@/features/languages/components";

export const metadata: Metadata = {
  title: "Programming Languages",
  description:
    "Premium, interview-focused programming language courses — starting with a deep JavaScript track built for Senior and Staff engineer interviews.",
};

/** Per-language stats for available courses (only JavaScript today). */
function statsFor(slug: string): { modules: number; topics: number } | undefined {
  if (slug === "javascript") {
    const s = courseStats();
    return { modules: s.modules, topics: s.plannedTopics };
  }
  return undefined;
}

export default function LanguagesHubPage() {
  const available = availableLanguages();
  const upcoming = LANGUAGES.filter((l) => l.status === "coming-soon");
  const js = courseStats();

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Learning · Programming Languages"
        title="Master a language the way it's interviewed"
        description="Deep, structured courses that teach intuition first, then theory, then interview-ready implementation. Each language is a self-contained track with modules, an interactive playground, quizzes, and a dedicated interview hub."
        accent="orange"
        icon={Code2}
      />

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={Sparkles} label="Available now" value={available.length} accent="emerald" />
        <StatTile icon={Layers} label="JS modules" value={js.modules} accent="orange" />
        <StatTile icon={ListChecks} label="JS topics" value={js.plannedTopics} accent="blue" />
        <StatTile icon={Code2} label="Languages planned" value={LANGUAGES.length} accent="violet" />
      </section>

      {available.length > 0 && (
        <section className="space-y-4">
          <SectionHeader
            title="Available courses"
            description="Jump in and start learning."
            icon={Sparkles}
            accent="emerald"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {available.map((lang) => (
              <LanguageCard key={lang.slug} language={lang} stats={statsFor(lang.slug)} />
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="space-y-4">
          <SectionHeader
            title="Coming soon"
            description="More languages are on the roadmap. Preview each one's plan."
            icon={Layers}
            accent="violet"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((lang) => (
              <LanguageCard key={lang.slug} language={lang} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
