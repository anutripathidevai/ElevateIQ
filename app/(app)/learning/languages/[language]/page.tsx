import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  GraduationCap,
  Layers,
  ListChecks,
  Map as MapIcon,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/blocks/page-header";
import { SectionHeader, StatTile } from "@/components/blocks/primitives";
import {
  JS_COURSE,
  LANGUAGES,
  courseStats,
  getLanguage,
  getModule,
  moduleStats,
  TOPICS_IN_ORDER,
} from "@/features/languages";
import {
  Breadcrumb,
  ComingSoon,
  CourseProgress,
  Roadmap,
  TopicIndex,
  formatMinutes,
  type ModuleView,
  type TopicIndexItem,
} from "@/features/languages/components";

/** What each upcoming language's course will cover (for its Coming Soon page). */
const COMING_SOON_HIGHLIGHTS: Record<string, string[]> = {
  java: [
    "OOP done right: classes, interfaces, generics",
    "The JVM, memory model, and garbage collection",
    "Collections framework and streams",
    "Concurrency, threads, and the executor framework",
    "Common interview algorithms in idiomatic Java",
    "Spring & enterprise patterns overview",
  ],
  python: [
    "Pythonic idioms and data model (dunder methods)",
    "Lists, dicts, sets, and comprehensions",
    "Generators, iterators, and decorators",
    "Concurrency: asyncio, threading, multiprocessing",
    "Typing, dataclasses, and clean code",
    "Interview favourites and gotchas",
  ],
  csharp: [
    "Modern C# language features and records",
    "LINQ and functional patterns",
    "async/await and the Task model",
    "The CLR, memory, and value vs reference types",
    ".NET collections and generics",
    "Interview-ready problem solving",
  ],
  cpp: [
    "Memory model, pointers, and references",
    "RAII and smart pointers",
    "The STL: containers and algorithms",
    "Move semantics and performance",
    "Templates and modern C++ (11/14/17/20)",
    "Systems-level interview questions",
  ],
  go: [
    "Go fundamentals and idioms",
    "Goroutines and channels",
    "Interfaces and composition",
    "Error handling patterns",
    "The standard library for backends",
    "Concurrency-focused interview problems",
  ],
};

export function generateStaticParams() {
  return LANGUAGES.map((l) => ({ language: l.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { language: string };
}): Metadata {
  const lang = getLanguage(params.language);
  if (!lang) return { title: "Language" };
  return {
    title: lang.status === "available" ? `${lang.name} Course` : `${lang.name} (Coming Soon)`,
    description: lang.tagline,
  };
}

/** Build the lightweight roadmap view-models from the authored course data. */
function buildModuleViews(): ModuleView[] {
  return moduleStats().map((s) => ({
    id: s.module.id,
    order: s.module.order,
    title: s.module.title,
    summary: s.module.summary,
    status: s.module.status,
    plannedCount: s.module.topicSlugs.length,
    estimatedMinutes: s.estimatedMinutes,
    topics: s.topics.map((t) => ({
      slug: t.slug,
      title: t.title,
      difficulty: t.difficulty,
    })),
  }));
}

function buildTopicIndex(): TopicIndexItem[] {
  return TOPICS_IN_ORDER.map((t) => ({
    slug: t.slug,
    title: t.title,
    difficulty: t.difficulty,
    moduleTitle: getModule(t.moduleId)?.title ?? "",
    tags: t.tags,
  }));
}

export default function LanguageCoursePage({
  params,
}: {
  params: { language: string };
}) {
  const lang = getLanguage(params.language);
  if (!lang) notFound();

  // Coming-soon languages get the polished preview page.
  if (lang.status !== "available") {
    return (
      <ComingSoon
        language={lang}
        highlights={COMING_SOON_HIGHLIGHTS[lang.slug] ?? []}
      />
    );
  }

  // Available course (JavaScript today).
  const stats = courseStats();
  const modules = buildModuleViews();
  const topicItems = buildTopicIndex();
  const authoredSlugs = TOPICS_IN_ORDER.map((t) => t.slug);
  const totalMinutes = modules.reduce((n, m) => n + m.estimatedMinutes, 0);

  return (
    <div className="space-y-10">
      <Breadcrumb
        items={[
          { label: "Learning", href: "/learning" },
          { label: "Languages", href: "/learning/languages" },
          { label: lang.name },
        ]}
      />

      <PageHeader
        eyebrow="JavaScript Interview Mastery"
        title={JS_COURSE.title}
        description={JS_COURSE.subtitle}
        accent={lang.accent}
        icon={Sparkles}
      />

      <section id="overview" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={Layers} label="Modules" value={stats.modules} accent="orange" />
        <StatTile icon={ListChecks} label="Topics" value={stats.plannedTopics} accent="blue" />
        <StatTile icon={Clock} label="Est. study time" value={formatMinutes(totalMinutes)} accent="emerald" />
        <StatTile icon={GraduationCap} label="Interview Qs" value={stats.interviewQuestions} accent="violet" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            What you&apos;ll learn
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {JS_COURSE.objectives.map((o) => (
              <li key={o} className="flex items-start gap-2 text-sm">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </div>
        <Link
          href="/learning/languages/javascript/interview"
          className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-5 transition-colors hover:bg-primary/10"
        >
          <GraduationCap className="h-8 w-8 text-primary" />
          <div>
            <p className="font-semibold">Interview Hub</p>
            <p className="text-sm text-muted-foreground">
              Top questions, machine coding & cheat sheets
            </p>
          </div>
        </Link>
      </section>

      <section id="progress">
        <CourseProgress topicSlugs={authoredSlugs} />
      </section>

      <section id="roadmap" className="space-y-4">
        <SectionHeader
          title="Learning roadmap"
          description="Work top to bottom. Published modules are ready now; more unlock over time."
          icon={MapIcon}
          accent="blue"
        />
        <Roadmap language={lang.slug} modules={modules} />
      </section>

      {topicItems.length > 0 && (
        <section id="topics" className="space-y-4">
          <SectionHeader
            title="All topics"
            description={`${stats.authoredTopics} topics available in learning order.`}
            icon={ListChecks}
            accent="orange"
          />
          <TopicIndex language={lang.slug} items={topicItems} />
        </section>
      )}
    </div>
  );
}
