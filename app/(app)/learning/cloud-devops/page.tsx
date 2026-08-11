import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Cloud,
  Layers,
  ListChecks,
  MessageSquareText,
  Trophy,
} from "lucide-react";
import { StatTile } from "@/components/blocks/primitives";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, courseJsonLd } from "@/lib/structured-data";
import {
  CD_COURSE,
  CD_DIFFICULTIES,
  getModules,
  getTotals,
} from "@/features/cloud-devops";
import { CourseModules } from "@/features/cloud-devops/components";

export const metadata: Metadata = {
  title: "Cloud, DevOps & Production Engineering | Compile Ready",
  description:
    "Senior → Staff → Architect interview preparation for how modern applications reach production — Git & CI/CD, Jenkins, Docker & Kubernetes, Azure, APIs, WebJobs, Kafka, and observability — with 50 scenario-based interview questions.",
  alternates: { canonical: "/learning/cloud-devops" },
};

/**
 * The Cloud, DevOps & Production Engineering hub. Fully metadata-driven: it
 * renders the eight-module roadmap and course stats from the registry. Adding or
 * publishing a module is a data change in `features/cloud-devops` — this page
 * needs no edits.
 */
export default function CloudDevopsHubPage() {
  const totals = getTotals();
  const modules = getModules();

  return (
    <div className="space-y-8">
      <JsonLd
        data={[
          courseJsonLd({
            name: CD_COURSE.title,
            description: CD_COURSE.description,
            path: "/learning/cloud-devops",
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Learning", path: "/learning" },
            { name: "Cloud & DevOps", path: "/learning/cloud-devops" },
          ]),
        ]}
      />

      {/* Hero */}
      <section className="overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-500/15 to-rose-500/0 p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-rose-400">
          <span>Learning</span>
          <span>/</span>
          <span>Cloud &amp; DevOps</span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/15">
            <Cloud className="h-6 w-6 text-rose-400" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {CD_COURSE.title}
          </h1>
        </div>
        <p className="mt-1 text-sm font-medium text-rose-400">
          {CD_COURSE.subtitle}
        </p>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {CD_COURSE.description} Every module is short and crisp — concepts,
          diagrams, and the senior-level reasoning interviewers actually probe —
          so you can go from code to production with confidence.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile icon={Layers} label="Modules" value={CD_COURSE.moduleCount} accent="rose" />
          <StatTile icon={ListChecks} label="Study time" value={CD_COURSE.hours} accent="orange" />
          <StatTile icon={MessageSquareText} label="Questions" value={CD_COURSE.questionCount} accent="violet" />
          <StatTile icon={Trophy} label="Levels" value="Senior–Architect" accent="blue" />
        </div>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {CD_COURSE.technologies.map((t) => (
            <span
              key={t}
              className="rounded-full border border-rose-500/20 bg-card px-2.5 py-1 text-xs text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href={`/learning/cloud-devops/${modules[0]?.slug ?? ""}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white transition-transform hover:translate-x-0.5"
          >
            Start learning <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/learning/cloud-devops/questions"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/50"
          >
            <MessageSquareText className="h-4 w-4" /> {totals.questions} interview
            questions
          </Link>
        </div>
      </section>

      {/* Module roadmap */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-rose-500" />
          <h2 className="text-lg font-semibold tracking-tight">
            Course modules
          </h2>
          <span className="text-sm text-muted-foreground">
            {totals.publishedModules} of {totals.modules} available now
          </span>
        </div>
        <CourseModules modules={modules} />
      </section>

      {/* Difficulty note */}
      <section className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">
          This track targets{" "}
          <span className="font-medium text-foreground">
            {CD_DIFFICULTIES.join(" → ")}
          </span>{" "}
          interviews. It assumes you can already code — the focus is how systems
          are built, shipped, observed, scaled, and recovered in production.
        </p>
      </section>
    </div>
  );
}
