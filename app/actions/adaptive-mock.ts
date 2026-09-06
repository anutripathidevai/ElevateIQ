"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getUserId } from "@/lib/current-user";
import { senioritySchema, trackKeySchema } from "@/lib/validation";
import { getMock } from "@/services/mocks";
import { buildProblemContext } from "@/services/mock-context";
import {
  finalizeAdaptiveInterview,
  startAdaptiveInterview,
  submitAdaptiveAnswer,
  type SubmitResult,
} from "@/features/adaptive-interview/service";
import type { AdaptiveScorecard } from "@/features/adaptive-interview/types";

/** Start a new adaptive interview from the mock landing page form. */
export async function startAdaptive(formData: FormData) {
  const userId = await getUserId();
  if (!userId) redirect("/mock");

  const track = trackKeySchema.parse(formData.get("track"));
  const seniority = senioritySchema.parse(formData.get("seniority"));
  const slug = String(formData.get("slug") ?? "").trim() || null;

  const problem = slug ? await buildProblemContext(slug) : null;

  const { id } = await startAdaptiveInterview({
    userId,
    track,
    seniority,
    problemSlug: slug,
    problemTitle: problem?.title ?? null,
  });

  redirect(`/mock/${id}`);
}

/** Submit an answer; returns progress + the next question (never scores). */
export async function submitAdaptiveAnswerAction(
  id: string,
  message: string,
): Promise<SubmitResult> {
  const userId = await getUserId();
  if (!userId) throw new Error("Please sign in.");

  const mock = await getMock(id);
  if (!mock || mock.userId !== userId) throw new Error("Interview not found.");
  if (mock.mode !== "adaptive") throw new Error("Not an adaptive interview.");

  const trimmed = message.trim();
  if (!trimmed) throw new Error("Please enter an answer.");

  const problem = mock.problemSlug
    ? await buildProblemContext(mock.problemSlug)
    : null;

  const result = await submitAdaptiveAnswer(mock, trimmed.slice(0, 4000), {
    problemTitle: problem?.title ?? null,
  });
  revalidatePath(`/mock/${id}`);
  return result;
}

/** Finalize the interview and return the aggregated scorecard. */
export async function finalizeAdaptiveAction(
  id: string,
): Promise<AdaptiveScorecard> {
  const userId = await getUserId();
  if (!userId) throw new Error("Please sign in.");

  const mock = await getMock(id);
  if (!mock || mock.userId !== userId) throw new Error("Interview not found.");
  if (mock.mode !== "adaptive") throw new Error("Not an adaptive interview.");

  const scorecard = await finalizeAdaptiveInterview(mock);
  revalidatePath(`/mock/${id}`);
  return scorecard;
}
