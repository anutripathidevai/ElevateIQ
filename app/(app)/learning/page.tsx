import Link from "next/link";
import { ArrowRight, Award, BookOpen, CheckCircle2, Clock, Code2, Layers, Route } from "lucide-react";
import {
  COURSES,
  LEARNING_PATHS,
  CERTIFICATES,
} from "@/lib/dashboard-data";
import { ACCENT_STYLES } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { CourseCard } from "@/components/blocks/course-card";
import { AiActions } from "@/components/blocks/ai-actions";
import { DashboardCard, SectionHeader } from "@/components/blocks/primitives";
import { PageHeader } from "@/components/blocks/page-header";

export const metadata = { title: "Learning" };

export default function LearningPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Learning"
        title="Courses & Learning Paths"
        description="Structured courses across cloud, AI, and engineering — with quizzes, hands-on labs, and certificates."
        accent="emerald"
        icon={BookOpen}
        aiActions={["Recommend a course", "Build a learning path", "Quiz me"]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Link
          href="/learning/dsa"
          className="group flex flex-col gap-4 overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/15 to-blue-500/0 p-6 transition-colors hover:border-blue-500/50 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/15">
              <Layers className="h-6 w-6 text-blue-500" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold tracking-tight">
                  Data Structures &amp; Algorithms
                </h2>
                <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-xs font-medium text-blue-500">
                  New
                </span>
              </div>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                A structured, interview-focused DSA path — Dynamic Programming and
                Graph Algorithms are live, with 15 more topics on the roadmap.
              </p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-transform group-hover:translate-x-0.5">
            Explore <ArrowRight className="h-4 w-4" />
          </span>
        </Link>

        <Link
          href="/learning/languages"
          className="group flex flex-col gap-4 overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-500/15 to-orange-500/0 p-6 transition-colors hover:border-orange-500/50 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/15">
              <Code2 className="h-6 w-6 text-orange-500" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold tracking-tight">
                  Programming Languages
                </h2>
                <span className="rounded-full bg-orange-500/15 px-2 py-0.5 text-xs font-medium text-orange-500">
                  New
                </span>
              </div>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Interview-focused language courses starting with a deep JavaScript
                track — the event loop, closures, async, and machine coding, with
                an interactive playground.
              </p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-transform group-hover:translate-x-0.5">
            Explore <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </div>

      <section className="space-y-4">
        <SectionHeader
          id="courses"
          title="Your Courses"
          description="Pick up where you left off"
          icon={BookOpen}
          accent="emerald"
        />
        <div className="grid gap-5 md:grid-cols-2">
          {COURSES.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          id="paths"
          title="Learning Paths"
          description="Curated multi-course tracks toward a role"
          icon={Route}
          accent="violet"
        />
        <div className="grid gap-4 md:grid-cols-3">
          {LEARNING_PATHS.map((path) => {
            const a = ACCENT_STYLES[path.accent];
            const Icon = path.icon;
            return (
              <div
                key={path.id}
                className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", a.bg)}>
                    <Icon className={cn("h-5 w-5", a.text)} />
                  </span>
                  <div>
                    <h3 className="font-semibold leading-tight">{path.title}</h3>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {path.duration}
                    </p>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {path.courses.map((c) => (
                    <li key={c} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className={cn("h-1.5 w-1.5 rounded-full", a.solid)} /> {c}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          id="certificates"
          title="Certificates"
          description="Earn shareable certificates as you complete courses"
          icon={Award}
          accent="orange"
        />
        <DashboardCard>
          <ul className="divide-y divide-border">
            {CERTIFICATES.map((cert) => (
              <li key={cert.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    cert.status === "earned" ? "bg-emerald-500/10" : "bg-muted",
                  )}
                >
                  <Award
                    className={cn(
                      "h-5 w-5",
                      cert.status === "earned" ? "text-emerald-500" : "text-muted-foreground",
                    )}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{cert.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {cert.issuer} · {cert.date}
                  </p>
                </div>
                {cert.status === "earned" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-500">
                    <CheckCircle2 className="h-3 w-3" /> Earned
                  </span>
                ) : (
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                    In progress
                  </span>
                )}
              </li>
            ))}
          </ul>
        </DashboardCard>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-emerald-500" />
          <h3 className="text-sm font-semibold">AI Study Assistant</h3>
        </div>
        <p className="mb-3 mt-1 text-sm text-muted-foreground">
          Turn any topic into notes, flashcards, or a quiz.
        </p>
        <AiActions
          actions={["Explain a concept", "Generate flashcards", "Create a quiz", "Summarize a lesson"]}
          context="Learning"
        />
      </section>

      <p className="text-center text-sm text-muted-foreground">
        Looking for something specific?{" "}
        <Link href="/resources" className="font-medium text-primary hover:underline">
          Browse resources
        </Link>
      </p>
    </div>
  );
}
