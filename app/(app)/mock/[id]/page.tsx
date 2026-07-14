import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getUserId } from "@/lib/current-user";
import { trackByKey } from "@/lib/tracks";
import { getMock } from "@/services/mocks";
import { SignInPrompt } from "@/components/layout/sign-in-prompt";
import { MockChat } from "@/components/mock/chat";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mock Interview" };

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

      <MockChat
        id={mock.id}
        initialMessages={initial}
        placeholder={placeholder}
      />
    </div>
  );
}
