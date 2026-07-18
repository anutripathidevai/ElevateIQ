import { notFound } from "next/navigation";
import type { AccentKey } from "@/lib/navigation";
import { ACCENT_STYLES } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Markdown } from "@/components/practice/markdown";
import type { CourseModule, Topic } from "../types";
import { TOPIC_SECTIONS, presentSectionIds, type TopicSectionDef } from "./sections";
import { moduleAccent } from "./ui";
import { Breadcrumb } from "./breadcrumb";
import { TopicMeta } from "./topic-meta";
import { TopicToc } from "./topic-toc";
import { TopicNav } from "./topic-nav";
import { TopicSection } from "./topic-section";
import { MarkComplete } from "./mark-complete";
import { Diagrams } from "./diagram";
import { CodeExamples } from "./code-example";
import { Playground } from "./playground";
import { OutputPredictions } from "./output-prediction";
import { CodingExercises } from "./coding-exercise";
import { InterviewQuestions } from "./interview-questions";
import { Quiz } from "./quiz";
import { CheatSheet } from "./cheat-sheet";

const SECTION_BY_ID = new Map<string, TopicSectionDef>(
  TOPIC_SECTIONS.map((s) => [s.id, s]),
);

/** Renders one section (wrapper + body) if the topic has content for it. */
function Section({
  id,
  topic,
  accent,
  children,
}: {
  id: string;
  topic: Topic;
  accent: AccentKey;
  children: React.ReactNode;
}) {
  const def = SECTION_BY_ID.get(id);
  if (!def || !def.present(topic)) return null;
  return (
    <TopicSection id={def.id} title={def.label} icon={def.icon} accent={accent}>
      {children}
    </TopicSection>
  );
}

/**
 * The full topic learning page, assembled from a topic's authored sections. Only
 * sections with content render (and appear in the TOC), so partially-authored
 * topics still produce a clean page. Reused by the topic route for every
 * language and topic.
 */
export function TopicPage({
  languageName,
  languageSlug,
  module,
  topic,
  prev,
  next,
}: {
  languageName: string;
  languageSlug: string;
  module?: CourseModule;
  topic: Topic;
  prev?: Topic;
  next?: Topic;
}) {
  if (!topic) notFound();

  const accent = moduleAccent(module?.order ?? 1);
  const a = ACCENT_STYLES[accent];
  const sectionIds = presentSectionIds(topic);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Learning", href: "/learning" },
          { label: "Languages", href: "/learning/languages" },
          { label: languageName, href: `/learning/languages/${languageSlug}` },
          { label: topic.title },
        ]}
      />

      <header className="space-y-3">
        {module && (
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-2.5 py-0.5 text-xs font-medium",
              a.bg,
              a.text,
            )}
          >
            Module {module.order} · {module.title}
          </div>
        )}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {topic.title}
          </h1>
          <MarkComplete slug={topic.slug} />
        </div>
        <TopicMeta topic={topic} />
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="min-w-0 space-y-5">
          <Section id="introduction" topic={topic} accent={accent}>
            <Markdown>{topic.introMD}</Markdown>
          </Section>

          <Section id="why" topic={topic} accent={accent}>
            <Markdown>{topic.whyItMattersMD ?? ""}</Markdown>
          </Section>

          <Section id="theory" topic={topic} accent={accent}>
            <Markdown>{topic.theoryMD}</Markdown>
          </Section>

          <Section id="diagrams" topic={topic} accent={accent}>
            <Diagrams diagrams={topic.diagrams ?? []} />
          </Section>

          <Section id="examples" topic={topic} accent={accent}>
            <CodeExamples examples={topic.codeExamples ?? []} />
          </Section>

          <Section id="playground" topic={topic} accent={accent}>
            <Playground examples={topic.playground ?? []} />
          </Section>

          <Section id="output-prediction" topic={topic} accent={accent}>
            <OutputPredictions items={topic.outputPredictions ?? []} />
          </Section>

          <Section id="exercises" topic={topic} accent={accent}>
            <CodingExercises items={topic.codingExercises ?? []} />
          </Section>

          <Section id="interview" topic={topic} accent={accent}>
            <InterviewQuestions items={topic.interviewQuestions ?? []} />
          </Section>

          <Section id="quiz" topic={topic} accent={accent}>
            <Quiz questions={topic.quiz ?? []} />
          </Section>

          <Section id="summary" topic={topic} accent={accent}>
            <ul className="space-y-2">
              {topic.summary.map((s, i) => (
                <li key={i} className="flex gap-2.5 text-sm">
                  <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", a.solid)} />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="cheat-sheet" topic={topic} accent={accent}>
            <CheatSheet md={topic.cheatSheetMD ?? ""} />
          </Section>

          <TopicNav language={languageSlug} prev={prev} next={next} />
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <TopicToc sectionIds={sectionIds} />
          </div>
        </aside>
      </div>
    </div>
  );
}
