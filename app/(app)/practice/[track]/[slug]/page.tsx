import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lightbulb } from "lucide-react";
import { getUserId } from "@/lib/current-user";
import { isAzureConfigured } from "@/lib/env";
import { trackBySlug } from "@/lib/tracks";
import { getProblemBySlug, getJudgeSpec, getSolution } from "@/services/problems";
import { Markdown } from "@/components/practice/markdown";
import { DifficultyBadge } from "@/components/practice/difficulty-badge";
import { Badge } from "@/components/ui/badge";
import { AnswerPanel } from "@/components/practice/answer-panel";
import { CodeRunnerPanel } from "@/components/practice/code-runner-panel";
import { SolvedIndicator } from "@/components/practice/solved-indicator";
import { LldSolutionSection } from "@/components/practice/lld-solution";
import { ProblemAiActions } from "@/components/practice/problem-ai-actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { track: string; slug: string };
}) {
  const problem = await getProblemBySlug(params.slug);
  return { title: problem ? problem.title : "Problem" };
}

export default async function SolvePage({
  params,
}: {
  params: { track: string; slug: string };
}) {
  const cfg = trackBySlug(params.track);
  if (!cfg) notFound();

  const problem = await getProblemBySlug(params.slug);
  if (!problem || problem.track !== cfg.key) notFound();

  const userId = await getUserId();
  const judge =
    cfg.key === "DSA" ? await getJudgeSpec(params.slug) : null;
  const solution =
    cfg.key === "LLD" ? await getSolution(params.slug) : null;

  return (
    <div className="space-y-4">
      <Link
        href={`/practice/${cfg.slug}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {cfg.title}
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold">{problem.title}</h1>
            <DifficultyBadge difficulty={problem.difficulty} />
            <SolvedIndicator slug={problem.slug} showLabel />
          </div>

          {problem.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {problem.tags.map((t) => (
                <Badge key={t} variant="outline">
                  {t}
                </Badge>
              ))}
            </div>
          )}

          <Markdown>{problem.statementMD}</Markdown>

          {problem.constraints && (
            <div>
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Constraints
              </h2>
              <Markdown>{problem.constraints}</Markdown>
            </div>
          )}

          {problem.hints.length > 0 && (
            <div className="space-y-2">
              {problem.hints.map((hint, i) => (
                <details
                  key={i}
                  className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm"
                >
                  <summary className="flex cursor-pointer items-center gap-2 font-medium">
                    <Lightbulb className="h-4 w-4 text-warning" />
                    Hint {i + 1}
                  </summary>
                  <div className="pt-2 text-muted-foreground">{hint}</div>
                </details>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          {judge ? (
            <CodeRunnerPanel
              slug={problem.slug}
              judge={judge}
              canSubmit={Boolean(userId)}
              aiConfigured={isAzureConfigured}
            />
          ) : (
            <AnswerPanel
              slug={problem.slug}
              inputMode={cfg.inputMode}
              inputLabel={cfg.inputLabel}
              ctaLabel={cfg.ctaLabel}
              canSubmit={Boolean(userId)}
              aiConfigured={isAzureConfigured}
            />
          )}

          {cfg.key === "LLD" && (
            <ProblemAiActions
              track={cfg.key}
              slug={problem.slug}
              canSubmit={Boolean(userId)}
              aiConfigured={isAzureConfigured}
            />
          )}
        </div>
      </div>

      {solution && (
        <section className="space-y-4 border-t border-border pt-6">
          <h2 className="text-xl font-bold">Solution walkthrough</h2>
          <LldSolutionSection solution={solution} />
        </section>
      )}
    </div>
  );
}
