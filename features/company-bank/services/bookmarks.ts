/**
 * Per-user bookmarks for company questions. Dual backend: Prisma when a
 * database is configured, an in-memory store otherwise (local/demo mode).
 * Bookmarks reference the content question id (questions live in JSON).
 */
import { db } from "@/lib/db";
import { isDbConfigured } from "@/lib/env";
import {
  createMemoryStore,
  type StoredEntity,
} from "@/features/shared/store/memory-store";

interface MemBookmark extends StoredEntity {
  questionId: string;
}

const memStore = createMemoryStore<MemBookmark>("company-bookmarks", "bm");

export async function listBookmarkIds(userId: string): Promise<Set<string>> {
  if (!isDbConfigured) {
    return new Set(memStore.listByUser(userId).map((b) => b.questionId));
  }
  const rows = await db.questionBookmark.findMany({
    where: { userId },
    select: { questionId: true },
  });
  return new Set(rows.map((r) => r.questionId));
}

export async function isBookmarked(
  userId: string,
  questionId: string,
): Promise<boolean> {
  const ids = await listBookmarkIds(userId);
  return ids.has(questionId);
}

/** Toggle a bookmark; resolves to the new bookmarked state. */
export async function toggleBookmark(
  userId: string,
  questionId: string,
): Promise<boolean> {
  if (!isDbConfigured) {
    const existing = memStore
      .listByUser(userId)
      .find((b) => b.questionId === questionId);
    if (existing) {
      memStore.remove(existing.id);
      return false;
    }
    memStore.create({ userId, questionId });
    return true;
  }

  const existing = await db.questionBookmark.findUnique({
    where: { userId_questionId: { userId, questionId } },
    select: { id: true },
  });
  if (existing) {
    await db.questionBookmark.delete({ where: { id: existing.id } });
    return false;
  }
  await db.questionBookmark.create({ data: { userId, questionId } });
  return true;
}
