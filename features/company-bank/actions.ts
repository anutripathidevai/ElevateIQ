"use server";

import { z } from "zod";
import type { ProgressStatus } from "@prisma/client";
import { getUserId } from "@/lib/current-user";
import { toggleBookmark } from "./services/bookmarks";
import { setQuestionStatus } from "./services/progress";

const statusSchema = z.enum(["TODO", "ATTEMPTED", "SOLVED"]);

export interface BookmarkActionResult {
  ok: boolean;
  bookmarked?: boolean;
  needsAuth?: boolean;
}

export interface StatusActionResult {
  ok: boolean;
  status?: ProgressStatus;
  needsAuth?: boolean;
}

export async function toggleBookmarkAction(
  questionId: string,
): Promise<BookmarkActionResult> {
  const userId = await getUserId();
  if (!userId) return { ok: false, needsAuth: true };
  const bookmarked = await toggleBookmark(userId, questionId);
  return { ok: true, bookmarked };
}

export async function setQuestionStatusAction(
  questionId: string,
  status: ProgressStatus,
): Promise<StatusActionResult> {
  const userId = await getUserId();
  if (!userId) return { ok: false, needsAuth: true };
  const parsed = statusSchema.parse(status);
  await setQuestionStatus(userId, questionId, parsed);
  return { ok: true, status: parsed };
}
