import type { Metadata } from "next";
import { MessageSquareText } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd } from "@/lib/structured-data";
import {
  CD_AREAS,
  CD_DIFFICULTIES,
  getQuestions,
  getTotals,
} from "@/features/cloud-devops";
import { QuestionBank } from "@/features/cloud-devops/components";
import { Breadcrumbs } from "@/features/shared/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Cloud & DevOps Interview Questions | Compile Ready",
  description:
    "Senior-level, scenario-based Cloud, DevOps & Production Engineering interview questions across CI/CD, Docker & Kubernetes, Azure, Kafka, and observability — with strong model answers, key points, and follow-ups.",
  alternates: { canonical: "/learning/cloud-devops/questions" },
};

/**
 * The Cloud & DevOps interview question bank page. Fully data-driven: it reads
 * the question set + facets from the registry and renders the interactive
 * `QuestionBank`. Adding a question is a data change — this page needs no edits.
 */
export default function CloudDevopsQuestionsPage() {
  const questions = getQuestions();
  const totals = getTotals();

  return (
    <div className="space-y-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Learning", path: "/learning" },
          { name: "Cloud & DevOps", path: "/learning/cloud-devops" },
          { name: "Questions", path: "/learning/cloud-devops/questions" },
        ])}
      />

      <Breadcrumbs
        items={[
          { label: "Learning", href: "/learning" },
          { label: "Cloud & DevOps", href: "/learning/cloud-devops" },
          { label: "Interview Questions" },
        ]}
      />

      <header className="overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-500/15 to-rose-500/0 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/15">
            <MessageSquareText className="h-6 w-6 text-rose-400" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Interview Questions
            </h1>
            <p className="text-sm text-muted-foreground">
              {totals.questions} senior-level, scenario-based questions across{" "}
              {CD_AREAS.length} areas
            </p>
          </div>
        </div>
      </header>

      <QuestionBank
        questions={questions}
        areas={CD_AREAS}
        difficulties={CD_DIFFICULTIES}
      />
    </div>
  );
}
