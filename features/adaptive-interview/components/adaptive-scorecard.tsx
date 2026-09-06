import Link from "next/link";
import type { TrackKey } from "@prisma/client";
import {
  GraduationCap,
  Dumbbell,
  RotateCcw,
  Target,
  Route as RouteIcon,
  Quote,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { startAdaptive } from "@/app/actions/adaptive-mock";
import type { AdaptiveScorecard, Seniority } from "../types";
import { selectionKindLabel } from "../copy";

export interface ScorecardMeta {
  trackTitle: string;
  seniorityLabel: string;
  practiceHref: string;
  learnHref: string;
  retakeTrack: TrackKey;
  retakeSeniority: Seniority;
}

function band(score: number): {
  label: string;
  variant: "success" | "warning" | "danger";
} {
  if (score >= 82) return { label: "Strong", variant: "success" };
  if (score >= 68) return { label: "Solid", variant: "success" };
  if (score >= 52) return { label: "Borderline", variant: "warning" };
  return { label: "Needs work", variant: "danger" };
}

function confidenceLabel(confidence: number): { label: string; sentence: string } {
  if (confidence >= 0.75) {
    return {
      label: "High",
      sentence:
        "Your answers were detailed enough to assess each competency with confidence.",
    };
  }
  if (confidence >= 0.5) {
    return {
      label: "Moderate",
      sentence:
        "Some answers were brief, so treat these scores as a solid but indicative read.",
    };
  }
  return {
    label: "Low",
    sentence:
      "Short answers limited how much we could assess — treat these scores as directional.",
  };
}

function ScoreBar({ score }: { score: number | null }) {
  const pct = score === null ? 0 : Math.max(0, Math.min(100, score));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Big circular readiness gauge for the hero. */
function ReadinessRing({
  score,
  variant,
}: {
  score: number;
  variant: "success" | "warning" | "danger";
}) {
  const pct = Math.max(0, Math.min(100, score));
  const color =
    variant === "success"
      ? "hsl(var(--success, 142 71% 45%))"
      : variant === "warning"
        ? "hsl(var(--warning, 38 92% 50%))"
        : "hsl(var(--danger, 0 84% 60%))";
  return (
    <div
      className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(${color} ${pct * 3.6}deg, hsl(var(--muted)) 0deg)`,
      }}
      aria-hidden
    >
      <div className="flex h-[5.5rem] w-[5.5rem] flex-col items-center justify-center rounded-full bg-card">
        <span className="text-2xl font-bold tabular-nums leading-none">{score}</span>
        <span className="text-[0.65rem] text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

/** Renders the final adaptive-interview scorecard. Score scale is 0-100. */
export function AdaptiveScorecardView({
  scorecard,
  meta,
}: {
  scorecard: AdaptiveScorecard;
  meta: ScorecardMeta;
}) {
  const overall = band(scorecard.overallScore);
  const conf = confidenceLabel(scorecard.confidence);

  const answered = scorecard.answeredCount ?? scorecard.competencyScores.length;
  const plannedCount = scorecard.plannedCount ?? answered;
  const isPartial = answered < plannedCount;

  const assessed = scorecard.competencyScores.filter((c) => c.score !== null);
  const topStrength = assessed.length
    ? assessed.reduce((a, b) => ((b.score ?? 0) > (a.score ?? 0) ? b : a))
    : null;
  const topGap = assessed.length
    ? assessed.reduce((a, b) => ((b.score ?? 0) < (a.score ?? 0) ? b : a))
    : null;
  const evidenceHighlights = Array.from(
    new Set(scorecard.competencyScores.flatMap((c) => c.evidence)),
  ).slice(0, 2);

  return (
    <div className="space-y-6">
      {!scorecard.aiGenerated && (
        <p className="rounded-md border border-warning/30 bg-warning/5 px-3 py-2 text-sm text-muted-foreground">
          This is a <strong>heuristic estimate</strong> generated without AI. It
          reflects concept coverage and answer depth, not a full qualitative
          assessment. Configure Azure OpenAI for AI-graded evaluations.
        </p>
      )}

      {/* Hero: overall readiness */}
      <section className="rounded-2xl border border-border bg-gradient-to-br from-primary/[0.06] to-transparent p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <ReadinessRing score={scorecard.overallScore} variant={overall.variant} />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold">Overall readiness</h2>
              <Badge variant={overall.variant}>{overall.label}</Badge>
              <Badge variant={isPartial ? "warning" : "success"}>
                {isPartial
                  ? `Partial · ${answered} of ${plannedCount} answered`
                  : "Completed"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {meta.trackTitle} · {meta.seniorityLabel}
            </p>
            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Confidence:{" "}
                  <span className="font-medium text-foreground">{conf.label}</span>{" "}
                  ({Math.round(scorecard.confidence * 100)}%)
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{conf.sentence}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why this score? */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold">Why this score?</h2>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Your readiness of{" "}
          <span className="font-medium text-foreground">
            {scorecard.overallScore}/100
          </span>{" "}
          is a weighted average across {assessed.length} competenc
          {assessed.length === 1 ? "y" : "ies"} assessed over {answered} answer
          {answered === 1 ? "" : "s"}.
          {topStrength && (
            <>
              {" "}
              It&apos;s lifted by{" "}
              <span className="font-medium text-foreground">
                {topStrength.name}
              </span>
              {topGap && topGap.competencyId !== topStrength.competencyId && (
                <>
                  {" "}
                  and held back by{" "}
                  <span className="font-medium text-foreground">
                    {topGap.name}
                  </span>
                </>
              )}
              .
            </>
          )}
        </p>
        {evidenceHighlights.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Evidence from your answers
            </p>
            {evidenceHighlights.map((e, i) => (
              <div
                key={i}
                className="flex gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm"
              >
                <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="italic text-muted-foreground">{e}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Strengths & gaps */}
      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Strengths
          </h3>
          {scorecard.strengths.length > 0 ? (
            <ul className="mt-3 space-y-1.5 text-sm">
              {scorecard.strengths.map((s, i) => (
                <li key={i} className="flex gap-1.5">
                  <span aria-hidden className="text-success">
                    +
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              No standout strengths yet — keep practicing to build them.
            </p>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Competency gaps
          </h3>
          {scorecard.weaknesses.length > 0 ? (
            <ul className="mt-3 space-y-1.5 text-sm">
              {scorecard.weaknesses.map((s, i) => (
                <li key={i} className="flex gap-1.5">
                  <span aria-hidden className="text-warning">
                    →
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Strong across the board — nice work.
            </p>
          )}
        </section>
      </div>

      {/* Competency scores */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">Scores by competency</h2>
        <ul className="mt-4 space-y-4">
          {scorecard.competencyScores.map((c) => (
            <li key={c.competencyId}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{c.name}</span>
                <span className="tabular-nums text-muted-foreground">
                  {c.score === null ? "—" : `${c.score} / 100`}
                </span>
              </div>
              <div className="mt-1.5">
                <ScoreBar score={c.score} />
              </div>
              {c.score === null ? (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Not assessed during this interview.
                </p>
              ) : (
                <>
                  {c.evidence.length > 0 && (
                    <ul className="mt-1.5 space-y-0.5">
                      {c.evidence.map((e, i) => (
                        <li
                          key={i}
                          className="flex gap-1.5 text-xs text-muted-foreground"
                        >
                          <span aria-hidden className="text-success">
                            ✓
                          </span>
                          <span>{e}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {c.gaps.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      {c.gaps.map((g, i) => (
                        <li
                          key={i}
                          className="flex gap-1.5 text-xs text-muted-foreground"
                        >
                          <span aria-hidden className="text-warning">
                            →
                          </span>
                          <span>{g}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Adaptive path */}
      {scorecard.path && scorecard.path.length > 0 && (
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <RouteIcon className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold">Your adaptive path</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            How the interview adapted to your answers, question by question.
          </p>
          <ol className="mt-4 space-y-3">
            {scorecard.path.map((step) => (
              <li key={step.questionNumber} className="flex gap-3">
                <span
                  aria-hidden
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
                >
                  {step.questionNumber}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">
                      {step.competencyName}
                    </span>
                    <Badge variant="outline">{selectionKindLabel(step.kind)}</Badge>
                    <span className="text-xs capitalize text-muted-foreground">
                      {step.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{step.reason}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Recommended learning */}
      {scorecard.recommendedTopics.length > 0 && (
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-lg font-semibold">Recommended learning</h2>
          <ol className="mt-4 space-y-3">
            {scorecard.recommendedTopics.map((t, i) => (
              <li key={t.competencyId} className="flex gap-3">
                <span
                  aria-hidden
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
                >
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium">
                    {t.href ? (
                      <Link
                        href={t.href}
                        className="text-primary underline-offset-2 hover:underline"
                      >
                        {t.topic}
                      </Link>
                    ) : (
                      t.topic
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">{t.reason}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Next actions */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">What&apos;s next?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Turn this feedback into progress.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={meta.practiceHref} className={buttonVariants()}>
            <Dumbbell className="mr-1.5 h-4 w-4" /> Practice
          </Link>
          <Link
            href={meta.learnHref}
            className={buttonVariants({ variant: "outline" })}
          >
            <GraduationCap className="mr-1.5 h-4 w-4" /> Learn
          </Link>
          <form action={startAdaptive}>
            <input type="hidden" name="track" value={meta.retakeTrack} />
            <input type="hidden" name="seniority" value={meta.retakeSeniority} />
            <Button type="submit" variant="outline">
              <RotateCcw className="mr-1.5 h-4 w-4" /> Retake interview
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
