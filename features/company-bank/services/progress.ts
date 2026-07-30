/**
 * Per-user progress for company questions (TODO / ATTEMPTED / SOLVED). Dual
 * backend: Prisma when configured, in-memory store otherwise.
 */
import type { ProgressStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { isDbConfigured } from "@/lib/env";
import {
  createMemoryStore,
  type StoredEntity,
} from "@/features/shared/store/memory-store";

interface MemProgress extends StoredEntity {
  questionId: string;
  status: ProgressStatus;
}

const memStore = createMemoryStore<MemProgress>("company-progress", "qp");

export async function getProgressMap(
  userId: string,
): Promise<Map<string, ProgressStatus>> {
  if (!isDbConfigured) {
    return new Map(
      memStore.listByUser(userId).map((p) => [p.questionId, p.status]),
    );
  }
  const rows = await db.questionProgress.findMany({
    where: { userId },
    select: { questionId: true, status: true },
  });
  return new Map(rows.map((r) => [r.questionId, r.status]));
}

/**
 * Set a question's status. `TODO` clears the record so the progress map stays
 * compact and "reset" behaves intuitively.
 */
export async function setQuestionStatus(
  userId: string,
  questionId: string,
  status: ProgressStatus,
): Promise<void> {
  if (!isDbConfigured) {
    const existing = memStore
      .listByUser(userId)
      .find((p) => p.questionId === questionId);
    if (status === "TODO") {
      if (existing) memStore.remove(existing.id);
      return;
    }
    if (existing) memStore.update(existing.id, { status });
    else memStore.create({ userId, questionId, status });
    return;
  }

  if (status === "TODO") {
    await db.questionProgress.deleteMany({ where: { userId, questionId } });
    return;
  }
  await db.questionProgress.upsert({
    where: { userId_questionId: { userId, questionId } },
    create: { userId, questionId, status },
    update: { status },
  });
}
