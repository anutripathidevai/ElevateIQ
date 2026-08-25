import { getTodayUsage, recordRequest, recordUsage, type UsageSnapshot } from "./usage";
import type { LLMUsage } from "./providers/types";

/**
 * Usage gateway — the single choke point every AI Labs run passes through before
 * spending tokens. It enforces the per-user daily limit and records usage, so
 * routes never touch the counter directly. Kept separate from the provider so
 * the policy (limits, quotas) is independent of the model.
 */

export interface GuardResult {
  ok: boolean;
  usage: UsageSnapshot;
  /** Present when ok is false. */
  reason?: string;
}

/**
 * Check the daily limit and, if allowed, atomically count the request. Returns
 * the post-increment snapshot so callers can surface remaining quota.
 */
export function guardAndCount(userId: string): GuardResult {
  const current = getTodayUsage(userId);
  if (current.remaining <= 0) {
    return {
      ok: false,
      usage: current,
      reason: `Daily AI Labs limit reached (${current.limit} runs). Try again tomorrow.`,
    };
  }
  return { ok: true, usage: recordRequest(userId) };
}

/** Record token usage + cost after a completion finishes. */
export function settleUsage(userId: string, usage: LLMUsage, model: string): void {
  recordUsage(userId, usage, model);
}
