import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getUserId } from "@/lib/current-user";
import { isAzureConfigured } from "@/lib/env";
import { SignInPrompt } from "@/components/layout/sign-in-prompt";
import { getInterview } from "@/features/panel-interview/services/interviews";
import { PanelChat } from "@/features/panel-interview/components/panel-chat";
import { PanelScorecard } from "@/features/panel-interview/components/panel-scorecard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Panel Interview" };

export default async function PanelSessionPage({
  params,
}: {
  params: { id: string };
}) {
  const userId = await getUserId();
  if (!userId) {
    return (
      <div className="mx-auto max-w-2xl">
        <SignInPrompt message="Sign in to view this panel interview." />
      </div>
    );
  }

  const interview = await getInterview(userId, params.id);
  if (!interview) notFound();

  const isComplete = interview.status === "completed" && interview.result;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/panel"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All interviews
        </Link>
        <span className="truncate text-sm font-medium text-muted-foreground">
          {interview.role}
          {interview.focus ? ` · ${interview.focus}` : ""}
        </span>
      </div>

      {isComplete && interview.result ? (
        <PanelScorecard result={interview.result} />
      ) : (
        <PanelChat
          id={interview.id}
          initialTranscript={interview.transcript}
          aiEnabled={isAzureConfigured}
        />
      )}
    </div>
  );
}
