import Link from "next/link";
import { AlertTriangle, MessageSquare } from "lucide-react";
import { getUserId } from "@/lib/current-user";
import { isAzureConfigured } from "@/lib/env";
import { TRACK_LIST, trackByKey } from "@/lib/tracks";
import { startMock } from "@/app/actions/mock";
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
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Mock Interview</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Pick a track and the AI interviewer will ask you questions one at a
          time, following up on your answers — just like a real interview.
        </p>
      </header>

      {!isAzureConfigured && (
        <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 p-3 text-sm text-warning">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          AI mock interviews require Azure OpenAI to be configured on this
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
                  <Button type="submit" disabled={!isAzureConfigured}>
                    Start {t.shortTitle} interview
                  </Button>
                </form>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {recent.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Recent interviews</h2>
          <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
            {recent.map((m) => {
              const cfg = trackByKey(m.trackKey);
              const kind =
                m.mode === "tutor"
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
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">{cfg.title}</span>
                    <Badge variant="outline">{kind}</Badge>
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
    </div>
  );
}
