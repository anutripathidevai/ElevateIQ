import Link from "next/link";
import {
  AlertTriangle,
  MessageSquare,
  Sparkles,
  Gauge,
  Route as RouteIcon,
  GraduationCap,
} from "lucide-react";
import { getUserId } from "@/lib/current-user";
import { isAzureConfigured } from "@/lib/env";
import { TRACK_LIST, trackByKey } from "@/lib/tracks";
import { startMock } from "@/app/actions/mock";
import { startAdaptive } from "@/app/actions/adaptive-mock";
import {
  SENIORITY_LEVELS,
  SENIORITY_LABELS,
} from "@/features/adaptive-interview/types";
import { listRecentMocks } from "@/services/mocks";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SignInPrompt } from "@/components/layout/sign-in-prompt";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mock Interview" };

export default async function MockPage() {
  const userId = await getUserId();
  if (!userId) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">Mock Interview</h1>
        <SignInPrompt message="Sign in to start an AI-driven mock interview and have your conversation saved." />
      </div>
    );
  }

  const recent = await listRecentMocks(userId, 6);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Mock Interview</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Practice with an AI interviewer that asks one question at a time and
          follows up on your answers — just like the real thing.
        </p>
      </header>

      {/* Featured: adaptive interview. Works instantly on the built-in heuristic
          engine; Azure OpenAI upgrades it to fully AI-graded evaluations. */}
      <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/[0.07] to-transparent">
        <CardContent className="flex flex-col gap-5 py-6">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </span>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Adaptive interview</h2>
                <Badge variant="success">Recommended</Badge>
              </div>
              <p className="max-w-2xl text-sm text-muted-foreground">
                A competency-scored interview that evaluates every answer and
                adapts the next question to your weak spots. Finish to get a
                detailed scorecard with strengths, gaps, evidence, and what to
                learn next.
              </p>
            </div>
          </div>

          <ul className="grid gap-2 sm:grid-cols-3">
            {[
              { icon: Gauge, text: "Scores each answer against a role rubric" },
              { icon: RouteIcon, text: "Adapts every question to your gaps" },
              { icon: GraduationCap, text: "Scorecard + a learning plan" },
            ].map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-start gap-2 rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-xs text-muted-foreground"
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{text}</span>
              </li>
            ))}
          </ul>

          <form
            action={startAdaptive}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Track</span>
              <select
                name="track"
                defaultValue="DSA"
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {TRACK_LIST.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Level</span>
              <select
                name="seniority"
                defaultValue="senior"
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {SENIORITY_LEVELS.map((s) => (
                  <option key={s} value={s}>
                    {SENIORITY_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit">Start adaptive interview</Button>
          </form>
          {!isAzureConfigured && (
            <p className="text-xs text-muted-foreground">
              Running on the built-in evaluator. Configure Azure OpenAI for
              richer, AI-graded feedback.
            </p>
          )}
        </CardContent>
      </Card>

      {recent.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Recent interviews</h2>
          <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
            {recent.map((m) => {
              const cfg = trackByKey(m.trackKey);
              const kind =
                m.mode === "adaptive"
                  ? "Adaptive"
                  : m.mode === "tutor"
                    ? "Tutor"
                    : m.problemSlug
                      ? "Mock (problem)"
                      : cfg.shortTitle;
              return (
                <li key={m.id}>
                  <Link
                    href={`/mock/${m.id}`}
                    className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-accent/50"
                  >
                    {m.mode === "adaptive" ? (
                      <Sparkles className="h-4 w-4 text-primary" />
                    ) : (
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="flex-1">{cfg.title}</span>
                    <Badge variant={m.mode === "adaptive" ? "success" : "outline"}>
                      {kind}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(m.createdAt)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Classic single-track interview: free-form Q&A on one track. */}
      <section className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Classic single-track interview</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            A focused, free-form conversation on one track — no scoring. Great for
            quick, open-ended practice.
          </p>
        </div>

        {!isAzureConfigured && (
          <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 p-3 text-sm text-warning">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            Classic interviews require Azure OpenAI to be configured on this
            deployment.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {TRACK_LIST.map((t) => {
            const Icon = t.icon;
            return (
              <Card key={t.key}>
                <CardContent className="flex flex-col gap-3 py-5">
                  <div className="flex items-center gap-3">
                    <Icon className={cn("h-6 w-6", t.accent)} />
                    <h3 className="font-semibold">{t.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{t.description}</p>
                  <form action={startMock}>
                    <input type="hidden" name="track" value={t.key} />
                    <Button
                      type="submit"
                      variant="outline"
                      disabled={!isAzureConfigured}
                    >
                      Start {t.shortTitle} interview
                    </Button>
                  </form>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
