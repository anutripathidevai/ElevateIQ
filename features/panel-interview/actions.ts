"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getUserId } from "@/lib/current-user";
import { isAzureConfigured } from "@/lib/env";
import { PANEL_PERSONAS } from "./personas";
import {
  fallbackPersonaQuestion,
  generatePersonaOpening,
} from "./ai/interviewer";
import { generateScorecard, heuristicScorecard } from "./ai/scorer";
import {
  completeInterview,
  createInterview,
  deleteInterview,
  getInterview,
} from "./services/interviews";
import type { PanelTurn } from "./types";

const ROUTE = "/panel";

export interface CreateInterviewResult {
  ok: boolean;
  id?: string;
  error?: string;
  needsAuth?: boolean;
}

export interface MutationResult {
  ok: boolean;
  error?: string;
  needsAuth?: boolean;
}

const setupSchema = z.object({
  role: z.string().trim().min(1, "Enter the role you're interviewing for.").max(160),
  focus: z.string().trim().max(200).optional(),
});

export async function createInterviewAction(
  input: unknown,
): Promise<CreateInterviewResult> {
  const userId = await getUserId();
  if (!userId) return { ok: false, needsAuth: true, error: "Please sign in to start a panel interview." };

  const parsed = setupSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid setup." };
  }
  const role = parsed.data.role;
  const focus = parsed.data.focus ?? "";
  const opener = PANEL_PERSONAS.hiring_manager;

  let opening: string;
  if (isAzureConfigured) {
    try {
      opening = await generatePersonaOpening(opener, { role, focus });
    } catch {
      opening = fallbackPersonaQuestion(opener, 0);
    }
  } else {
    opening = fallbackPersonaQuestion(opener, 0);
  }

  const transcript: PanelTurn[] = [
    { speaker: "hiring_manager", content: opening },
  ];
  const interview = await createInterview(userId, { role, focus, transcript });
  revalidatePath(ROUTE);
  return { ok: true, id: interview.id };
}

export async function finishInterviewAction(id: string): Promise<MutationResult> {
  const userId = await getUserId();
  if (!userId) return { ok: false, needsAuth: true, error: "Please sign in." };

  const interview = await getInterview(userId, id);
  if (!interview) return { ok: false, error: "Interview not found." };
  if (interview.status === "completed") {
    return { ok: true };
  }

  let result;
  if (isAzureConfigured) {
    try {
      result = await generateScorecard(interview);
    } catch {
      result = heuristicScorecard(interview);
    }
  } else {
    result = heuristicScorecard(interview);
  }

  const completed = await completeInterview(userId, id, result);
  if (!completed) return { ok: false, error: "Could not save the scorecard." };

  revalidatePath(ROUTE);
  revalidatePath(`${ROUTE}/${id}`);
  return { ok: true };
}

export async function deleteInterviewAction(id: string): Promise<MutationResult> {
  const userId = await getUserId();
  if (!userId) return { ok: false, needsAuth: true, error: "Please sign in." };
  const ok = await deleteInterview(userId, id);
  if (!ok) return { ok: false, error: "Interview not found." };
  revalidatePath(ROUTE);
  return { ok: true };
}
