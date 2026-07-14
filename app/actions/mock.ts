"use server";

import { redirect } from "next/navigation";
import { getUserId } from "@/lib/current-user";
import { isAzureConfigured } from "@/lib/env";
import { trackKeySchema } from "@/lib/validation";
import { generateOpening, type ChatMessage } from "@/services/ai/mock";
import { createMock, type MockMode } from "@/services/mocks";
import { buildProblemContext } from "@/services/mock-context";

export async function startMock(formData: FormData) {
  const userId = await getUserId();
  if (!userId) redirect("/mock");

  const track = trackKeySchema.parse(formData.get("track"));

  let opening =
    "AI mock interviews require Azure OpenAI to be configured on this deployment.";
  if (isAzureConfigured) {
    try {
      opening = await generateOpening(track);
    } catch {
      opening = "Sorry, I couldn't start the interview. Please try again.";
    }
  }

  const transcript: ChatMessage[] = [{ role: "assistant", content: opening }];
  const { id } = await createMock({ userId, trackKey: track, transcript });

  redirect(`/mock/${id}`);
}

/**
 * Start a session scoped to a specific problem — either a "tutor" chat to
 * understand the problem, or a problem-focused mock "interview".
 */
export async function startProblemSession(formData: FormData) {
  const userId = await getUserId();
  if (!userId) redirect("/mock");

  const track = trackKeySchema.parse(formData.get("track"));
  const slug = String(formData.get("slug") ?? "");
  const mode: MockMode =
    formData.get("mode") === "tutor" ? "tutor" : "interview";
  if (!slug) redirect("/mock");

  const problem = await buildProblemContext(slug);

  let opening =
    "AI sessions require Azure OpenAI to be configured on this deployment.";
  if (isAzureConfigured) {
    try {
      opening = await generateOpening(track, {
        mode,
        problem: problem ?? undefined,
      });
    } catch {
      opening = "Sorry, I couldn't start the session. Please try again.";
    }
  }

  const transcript: ChatMessage[] = [{ role: "assistant", content: opening }];
  const { id } = await createMock({
    userId,
    trackKey: track,
    transcript,
    problemSlug: slug,
    mode,
  });

  redirect(`/mock/${id}`);
}
