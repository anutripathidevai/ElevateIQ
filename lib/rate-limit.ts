import { db } from "@/lib/db";
import { env, isDbConfigured } from "@/lib/env";

/**
 * Lightweight per-user daily cap on AI calls, backed by submission history.
 * Keeps Azure OpenAI cost bounded. Swap for Redis if you need cross-window
 * precision at higher traffic.
 */
export async function checkDailyAiLimit(
  userId: string,
): Promise<{ ok: boolean; used: number; limit: number }> {
  // No database (local dev): nothing to count against, so always allow.
  if (!isDbConfigured) return { ok: true, used: 0, limit: env.dailyAiLimit };
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const used = await db.submission.count({
    where: { userId, createdAt: { gte: since } },
  });
  return { ok: used < env.dailyAiLimit, used, limit: env.dailyAiLimit };
}
