"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getUserId } from "@/lib/current-user";
import { isAzureConfigured } from "@/lib/env";
import { AiNotConfiguredError } from "@/services/ai/client";
import { generateStarStories } from "./ai/generator";
import { starGenerationInputSchema } from "./ai/schemas";
import {
  createStory,
  deleteStory,
  duplicateStory,
  updateStory,
} from "./services/stories";
import type { GeneratedStarStory, StarStory, StarStoryInput } from "./types";
import { normalizeTags } from "./utils";

const ROUTE = "/star-stories";

export interface GenerateResult {
  ok: boolean;
  stories?: GeneratedStarStory[];
  error?: string;
  needsAuth?: boolean;
  needsAi?: boolean;
}

export interface StoryResult {
  ok: boolean;
  story?: StarStory;
  error?: string;
  needsAuth?: boolean;
}

export interface MutationResult {
  ok: boolean;
  error?: string;
  needsAuth?: boolean;
}

const cleanList = (values: string[]): string[] =>
  values.map((v) => v.trim()).filter(Boolean);

const storyInputSchema = z.object({
  title: z.string().trim().min(1, "Give the story a title."),
  situation: z.string().trim().min(1, "Situation is required."),
  task: z.string().trim().min(1, "Task is required."),
  action: z.string().trim().min(1, "Action is required."),
  result: z.string().trim().min(1, "Result is required."),
  skills: z.array(z.string()).default([]),
  leadershipPrinciples: z.array(z.string()).default([]),
  suggestedQuestions: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  sourceProject: z.string().nullable().default(null),
});

function normalizeInput(input: unknown):
  | { ok: true; value: StarStoryInput }
  | { ok: false; error: string } {
  const parsed = storyInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid story." };
  }
  const d = parsed.data;
  return {
    ok: true,
    value: {
      title: d.title,
      situation: d.situation,
      task: d.task,
      action: d.action,
      result: d.result,
      skills: cleanList(d.skills),
      leadershipPrinciples: cleanList(d.leadershipPrinciples),
      suggestedQuestions: cleanList(d.suggestedQuestions),
      tags: normalizeTags(d.tags),
      sourceProject: d.sourceProject?.trim() ? d.sourceProject.trim() : null,
    },
  };
}

export async function generateStoriesAction(
  rawInput: unknown,
): Promise<GenerateResult> {
  const userId = await getUserId();
  if (!userId) return { ok: false, needsAuth: true, error: "Please sign in to generate stories." };
  if (!isAzureConfigured) {
    return {
      ok: false,
      needsAi: true,
      error:
        "AI generation isn't configured in this environment. You can still add stories manually.",
    };
  }
  const parsed = starGenerationInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid request." };
  }
  try {
    const stories = await generateStarStories(parsed.data);
    return { ok: true, stories };
  } catch (err) {
    if (err instanceof AiNotConfiguredError) {
      return { ok: false, needsAi: true, error: err.message };
    }
    const error = err instanceof Error ? err.message : "Generation failed. Please try again.";
    return { ok: false, error };
  }
}

export async function saveStoryAction(input: unknown): Promise<StoryResult> {
  const userId = await getUserId();
  if (!userId) return { ok: false, needsAuth: true, error: "Please sign in to save stories." };
  const normalized = normalizeInput(input);
  if (!normalized.ok) return { ok: false, error: normalized.error };
  const story = await createStory(userId, normalized.value);
  revalidatePath(ROUTE);
  return { ok: true, story };
}

export async function updateStoryAction(
  id: string,
  input: unknown,
): Promise<StoryResult> {
  const userId = await getUserId();
  if (!userId) return { ok: false, needsAuth: true, error: "Please sign in to edit stories." };
  const normalized = normalizeInput(input);
  if (!normalized.ok) return { ok: false, error: normalized.error };
  const story = await updateStory(userId, id, normalized.value);
  if (!story) return { ok: false, error: "Story not found." };
  revalidatePath(ROUTE);
  return { ok: true, story };
}

export async function duplicateStoryAction(id: string): Promise<StoryResult> {
  const userId = await getUserId();
  if (!userId) return { ok: false, needsAuth: true, error: "Please sign in." };
  const story = await duplicateStory(userId, id);
  if (!story) return { ok: false, error: "Story not found." };
  revalidatePath(ROUTE);
  return { ok: true, story };
}

export async function deleteStoryAction(id: string): Promise<MutationResult> {
  const userId = await getUserId();
  if (!userId) return { ok: false, needsAuth: true, error: "Please sign in." };
  const ok = await deleteStory(userId, id);
  if (!ok) return { ok: false, error: "Story not found." };
  revalidatePath(ROUTE);
  return { ok: true };
}
