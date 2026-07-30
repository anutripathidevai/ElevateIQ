import { Badge } from "@/components/ui/badge";
import { getPersona } from "../personas";
import {
  VERDICT_LABELS,
  type PanelResult,
  type Verdict,
} from "../types";

function verdictVariant(
  v: Verdict,
): "success" | "warning" | "danger" | "outline" {
  switch (v) {
    case "strong_hire":
      return "success";
    case "hire":
      return "success";
    case "lean_hire":
      return "warning";
    case "no_hire":
      return "danger";
  }
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, (score / 5) * 100));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Renders the full panel scorecard produced at the end of an interview. */
export function PanelScorecard({ result }: { result: PanelResult }) {
  return (
    <div className="space-y-6">
      {!result.aiGenerated && (
        <p className="rounded-md border border-warning/30 bg-warning/5 px-3 py-2 text-sm text-muted-foreground">
          This is a <strong>heuristic estimate</strong> generated without AI. It
          reflects engagement and answer depth, not a qualitative assessment.
          Configure Azure OpenAI for a full panel evaluation.
        </p>
      )}

      {/* Overall recommendation */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Overall recommendation</h2>
          <Badge variant={verdictVariant(result.overallRecommendation.decision)}>
            {VERDICT_LABELS[result.overallRecommendation.decision]}
          </Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {result.overallRecommendation.summary}
        </p>
      </section>

      {/* Competency scores */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">Scores by competency</h2>
        <ul className="mt-4 space-y-4">
          {result.competencyScores.map((c) => (
            <li key={c.competency}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{c.competency}</span>
                <span className="tabular-nums text-muted-foreground">
                  {c.score.toFixed(1)} / 5
                </span>
              </div>
              <div className="mt-1.5">
                <ScoreBar score={c.score} />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {c.rationale}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Per-interviewer feedback */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Interviewer feedback</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {result.interviewerFeedback.map((fb) => {
            const persona = getPersona(fb.personaId);
            return (
              <div
                key={fb.personaId}
                className="flex flex-col rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span aria-hidden className="text-lg">
                      {persona.glyph}
                    </span>
                    <div>
                      <p className="text-sm font-semibold leading-tight">
                        {persona.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {persona.title}
                      </p>
                    </div>
                  </div>
                  <Badge variant={verdictVariant(fb.verdict)}>
                    {VERDICT_LABELS[fb.verdict]}
                  </Badge>
                </div>

                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Strengths
                </p>
                <ul className="mt-1 space-y-1 text-sm">
                  {fb.strengths.map((s, i) => (
                    <li key={i} className="flex gap-1.5">
                      <span aria-hidden className="text-success">
                        +
                      </span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  To improve
                </p>
                <ul className="mt-1 space-y-1 text-sm">
                  {fb.improvements.map((s, i) => (
                    <li key={i} className="flex gap-1.5">
                      <span aria-hidden className="text-warning">
                        →
                      </span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Improvement plan */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">Your improvement plan</h2>
        <ol className="mt-4 space-y-3">
          {result.improvementPlan.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span
                aria-hidden
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
              >
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-medium">{item.focus}</p>
                <p className="text-sm text-muted-foreground">{item.action}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
