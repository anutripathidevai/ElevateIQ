import Link from "next/link";
import { CalendarClock, CheckCircle2, Database, ListChecks, Target } from "lucide-react";
import { auth } from "@/lib/auth";
import { isDbConfigured } from "@/lib/env";
import { getDashboard } from "@/services/progress";
import { trackByKey } from "@/lib/tracks";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SignInPrompt } from "@/components/layout/sign-in-prompt";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  if (!isDbConfigured) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <Database className="h-8 w-8 text-muted-foreground" />
            <p className="max-w-sm text-sm text-muted-foreground">
              Progress tracking, scores, and the review queue need a database.
              They light up automatically once you deploy with{" "}
              <code className="rounded bg-muted px-1">DATABASE_URL</code> set.
            </p>
            <Link
              href="/practice/dsa"
              className="text-sm font-medium text-primary hover:underline"
            >
              Meanwhile, head to Practice →
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const session = await auth();
  if (!session?.user) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
        <SignInPrompt message="Sign in to track your progress, review scores, and see what's due for spaced-repetition review." />
      </div>
    );
  }

  const data = await getDashboard(session.user.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5 text-success" />}
          label="Solved"
          value={data.totals.solved}
        />
        <StatCard
          icon={<Target className="h-5 w-5 text-warning" />}
          label="Attempted"
          value={data.totals.attempted}
        />
        <StatCard
          icon={<ListChecks className="h-5 w-5 text-primary" />}
          label="Total problems"
          value={data.totals.total}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progress by track</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.byTrack.map((t) => {
            const pct = t.total > 0 ? Math.round((t.solved / t.total) * 100) : 0;
            return (
              <div key={t.track}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <Link
                    href={`/practice/${t.slug}`}
                    className="font-medium hover:underline"
                  >
                    {t.title}
                  </Link>
                  <span className="text-muted-foreground">
                    {t.solved}/{t.total}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" /> Due for review
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.dueForReview.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing due. Keep practicing to build your review queue.
              </p>
            ) : (
              <ul className="space-y-2">
                {data.dueForReview.map((r) => {
                  const cfg = trackByKey(r.track);
                  return (
                    <li key={`${r.track}-${r.slug}`}>
                      <Link
                        href={`/practice/${cfg.slug}/${r.slug}`}
                        className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent/50"
                      >
                        <span className="min-w-0 truncate">{r.title}</span>
                        <Badge variant="outline">{cfg.shortTitle}</Badge>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No submissions yet. Solve a problem to get started.
              </p>
            ) : (
              <ul className="space-y-2">
                {data.recent.map((r, i) => {
                  const cfg = trackByKey(r.track);
                  return (
                    <li key={i}>
                      <Link
                        href={`/practice/${cfg.slug}/${r.slug}`}
                        className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent/50"
                      >
                        <span className="min-w-0 truncate">{r.title}</span>
                        <span className="flex shrink-0 items-center gap-2 text-muted-foreground">
                          {r.score != null && (
                            <span className="font-medium text-foreground">
                              {r.score}
                            </span>
                          )}
                          <span className="text-xs">
                            {formatDate(r.createdAt)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-5">
        <div className="rounded-lg border border-border p-2">{icon}</div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
