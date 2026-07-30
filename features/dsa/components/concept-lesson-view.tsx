import { BookOpen, KeyRound, Lightbulb } from "lucide-react";
import { CodeViewer } from "@/components/practice/code-viewer";
import { Markdown } from "@/components/practice/markdown";
import { Badge } from "@/components/ui/badge";
import { ACCENT_STYLES, type AccentKey } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { GraphSection, MarkComplete, ProblemNav } from "@/features/graph-algorithms/components";
import { ReadingLayout } from "@/components/focus-mode";
import type { DsaConceptLesson } from "../types";
import { conceptSections } from "./lesson-sections";
import { RecursionTree } from "./recursion-tree";

interface NavTarget {
  slug: string;
  title: string;
}

/**
 * Renders a concept lesson (an idea rather than a problem, e.g. "Memoization"):
 * a summary, a sequence of titled Markdown sections, optional copyable code
 * samples and an explanation-only recursion tree, then key takeaways — using the
 * same section/TOC/nav chrome as problem lessons so the two feel identical.
 */
export function ConceptLessonView({
  lesson,
  moduleLabel,
  accent,
  basePath,
  prev,
  next,
}: {
  lesson: DsaConceptLesson;
  moduleLabel?: string;
  accent: AccentKey;
  basePath: string;
  prev?: NavTarget;
  next?: NavTarget;
}) {
  const a = ACCENT_STYLES[accent];
  const sections = conceptSections(lesson);

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        {moduleLabel && (
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-2.5 py-0.5 text-xs font-medium",
              a.bg,
              a.text,
            )}
          >
            {moduleLabel}
          </div>
        )}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {lesson.title}
          </h1>
          <MarkComplete slug={lesson.slug} />
        </div>
        <div className="text-muted-foreground">
          <Markdown>{lesson.summaryMD}</Markdown>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" /> {lesson.estimatedReadingMin} min read
          </span>
          <Badge variant="outline">Concept</Badge>
        </div>
        {lesson.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {lesson.tags.map((t) => (
              <Badge key={t} variant="outline">
                {t}
              </Badge>
            ))}
          </div>
        )}
      </header>

      <ReadingLayout sections={sections}>
        <div className="min-w-0 space-y-5">
          {lesson.sections.map((s, i) => (
            <GraphSection
              key={i}
              id={`section-${i}`}
              title={s.heading}
              accent={accent}
            >
              <Markdown>{s.bodyMD}</Markdown>
            </GraphSection>
          ))}

          {lesson.recursionTree && (
            <div className="space-y-2 rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {lesson.recursionTree.rootLabel}
              </h3>
              <RecursionTree root={lesson.recursionTree.root} accent={accent} />
              {lesson.recursionTree.captionMD && (
                <div className="text-xs text-muted-foreground">
                  <Markdown>{lesson.recursionTree.captionMD}</Markdown>
                </div>
              )}
            </div>
          )}

          {lesson.codeExamples?.map((ex, i) => (
            <div key={i} className="space-y-2">
              {ex.title && <h3 className="text-sm font-semibold">{ex.title}</h3>}
              <CodeViewer
                files={[
                  {
                    filename:
                      ex.language === "java" ? "Example.java" : `example.${ex.language}`,
                    language: ex.language,
                    content: ex.code,
                  },
                ]}
              />
              {ex.captionMD && (
                <div className="text-xs text-muted-foreground">
                  <Markdown>{ex.captionMD}</Markdown>
                </div>
              )}
            </div>
          ))}

          <GraphSection
            id="takeaways"
            title="Key Takeaways"
            icon={KeyRound}
            accent={accent}
          >
            <ul className="space-y-2">
              {lesson.keyTakeaways.map((k, i) => (
                <li key={i} className="flex gap-2.5 text-sm">
                  <Lightbulb className={cn("mt-0.5 h-4 w-4 shrink-0", a.text)} />
                  <span>{k}</span>
                </li>
              ))}
            </ul>
          </GraphSection>

          <ProblemNav prev={prev} next={next} basePath={basePath} />
        </div>
      </ReadingLayout>
    </div>
  );
}
