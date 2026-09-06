import Link from "next/link";
import { notFound } from "next/navigation";
import type { TrackKey } from "@prisma/client";
import { ArrowLeft } from "lucide-react";
import { getUserId } from "@/lib/current-user";
import { trackByKey } from "@/lib/tracks";
import { getMock, listAdaptiveScores } from "@/services/mocks";
import { SignInPrompt } from "@/components/layout/sign-in-prompt";
import { MockChat } from "@/components/mock/chat";
import { AdaptiveInterview } from "@/features/adaptive-interview/components/adaptive-interview";
import {
  AdaptiveScorecardView,
  type ScorecardMeta,
} from "@/features/adaptive-interview/components/adaptive-scorecard";
import { AdaptiveProgress } from "@/features/adaptive-interview/components/adaptive-progress";
import { answerHint } from "@/features/adaptive-interview/copy";
import {
  isAdaptiveSummary,
  SENIORITY_LABELS,
} from "@/features/adaptive-interview/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mock Interview" };

/** Learning hub per track; behavioral has no dedicated hub → general resources. */
const LEARN_HREF: Record<TrackKey, string> = {
  DSA: "/learning/dsa",
  SYSTEM_DESIGN: "/learning/system-design",
  LLD: "/learning/lld",
  BEHAVIORAL: "/resources",
};

export default async function MockSessionPage({
  params,
}: {
  params: { id: string };
}) {
  const userId = await getUserId();
  if (!userId) {
    return (
      <div className="mx-auto max-w-2xl">
        <SignInPrompt message="Sign in to view this mock interview." />
      </div>
    );
  }

  const mock = await getMock(params.id);
  if (!mock || mock.userId !== userId) notFound();

  const cfg = trackByKey(mock.trackKey);
  const initial = mock.transcript.filter(
    (m) => m.role === "user" || m.role === "assistant",
  );

  // Adaptive interview: competency-scored, adaptive question flow + scorecard.
  if (mock.mode === "adaptive" && isAdaptiveSummary(mock.summary)) {
    const s = mock.summary;
    const answered = s.evaluations.length;
    const doneAsking = answered >= s.plannedQuestions;

    const header = (
      <div className="flex items-center justify-between">
        <Link
          href="/mock"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All interviews
        </Link>
        <span className="text-sm font-medium text-muted-foreground">
          {cfg.shortTitle} · Adaptive · {SENIORITY_LABELS[s.config.seniority]}
        </span>
      </div>
    );

    // Completed: the server renders the full scorecard + score-over-time trend.
    if (s.status === "completed" && s.scorecard) {
      const meta: ScorecardMeta = {
        trackTitle: cfg.title,
        seniorityLabel: SENIORITY_LABELS[s.config.seniority],
        practiceHref: `/practice/${cfg.slug}`,
        learnHref: LEARN_HREF[mock.trackKey],
        retakeTrack: mock.trackKey,
        retakeSeniority: s.config.seniority,
      };
      const history = await listAdaptiveScores(userId, mock.trackKey);
      return (
        <div className="mx-auto max-w-3xl space-y-6">
          {header}
          <AdaptiveScorecardView scorecard={s.scorecard} meta={meta} />
          <AdaptiveProgress
            entries={history.map((h) => ({
              id: h.id,
              overallScore: h.overallScore,
              createdAt: h.createdAt,
            }))}
            currentId={mock.id}
          />
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-3xl space-y-4">
        {header}
        <AdaptiveInterview
          id={mock.id}
          trackTitle={cfg.title}
          seniorityLabel={SENIORITY_LABELS[s.config.seniority]}
          answerHint={answerHint(s.config.seniority)}
          planned={s.plannedQuestions}
          initialMessages={initial}
          initialAnswered={answered}
          initialDone={doneAsking}
        />
      </div>
    );
  }

  const isTutor = mock.mode === "tutor";
  const label = isTutor
    ? `${cfg.shortTitle} · Tutor`
    : mock.problemSlug
      ? `${cfg.shortTitle} · Mock`
      : cfg.title;
  const placeholder = isTutor
    ? "Ask a question… (Enter to send, Shift+Enter for newline)"
    : "Type your answer… (Enter to send, Shift+Enter for newline)";

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/mock"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All interviews
        </Link>
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
      </div>

      <MockChat id={mock.id} initialMessages={initial} placeholder={placeholder} />
    </div>
  );
}
