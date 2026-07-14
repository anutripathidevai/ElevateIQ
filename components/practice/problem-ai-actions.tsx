import { MessageCircle, Mic } from "lucide-react";
import type { TrackKey } from "@prisma/client";
import { startProblemSession } from "@/app/actions/mock";
import { Button } from "@/components/ui/button";

/**
 * Problem-scoped AI entry points: chat with a tutor about this problem, or take
 * a mock interview focused on it. Both post to the startProblemSession action.
 */
export function ProblemAiActions({
  track,
  slug,
  canSubmit,
  aiConfigured,
}: {
  track: TrackKey;
  slug: string;
  canSubmit: boolean;
  aiConfigured: boolean;
}) {
  const disabled = !canSubmit || !aiConfigured;

  return (
    <div className="rounded-lg border border-border p-4">
      <h2 className="mb-1 text-sm font-semibold">Practice with AI</h2>
      <p className="mb-3 text-sm text-muted-foreground">
        Ask questions to understand the design, or take a focused mock interview
        on this problem.
      </p>
      <div className="flex flex-wrap gap-2">
        <form action={startProblemSession}>
          <input type="hidden" name="track" value={track} />
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="mode" value="tutor" />
          <Button type="submit" variant="outline" disabled={disabled}>
            <MessageCircle className="h-4 w-4" /> Discuss with AI
          </Button>
        </form>
        <form action={startProblemSession}>
          <input type="hidden" name="track" value={track} />
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="mode" value="interview" />
          <Button type="submit" disabled={disabled}>
            <Mic className="h-4 w-4" /> Mock interview
          </Button>
        </form>
      </div>
      {!canSubmit && (
        <p className="mt-2 text-xs text-muted-foreground">
          Sign in to start an AI session.
        </p>
      )}
      {canSubmit && !aiConfigured && (
        <p className="mt-2 text-xs text-warning">
          AI isn&apos;t configured on this deployment.
        </p>
      )}
    </div>
  );
}
