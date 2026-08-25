import type { LLMUsage } from "./providers/types";

/**
 * In-memory usage tracking for AI Labs.
 *
 * Phase 1 is intentionally database-free so it works in the live guest-mode
 * deployment. Usage is counted per user id in a process-local map with a daily
 * (24h) window. This is best-effort (resets on redeploy, not shared across
 * instances) — good enough to prevent runaway cost in a single-instance demo,
 * and swappable for a Prisma-backed counter later without changing callers.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

interface UsageBucket {
  windowStart: number;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

const buckets = new Map<string, UsageBucket>();

/** Default daily request cap; overridable via AI_LABS_DAILY_LIMIT. */
export function getDailyLimit(): number {
  const raw = Number(process.env.AI_LABS_DAILY_LIMIT ?? "");
  return Number.isFinite(raw) && raw > 0 ? raw : 100;
}

function freshBucket(now: number): UsageBucket {
  return { windowStart: now, requests: 0, inputTokens: 0, outputTokens: 0, costUsd: 0 };
}

function currentBucket(userId: string, now: number): UsageBucket {
  const existing = buckets.get(userId);
  if (!existing || now - existing.windowStart >= DAY_MS) {
    const fresh = freshBucket(now);
    buckets.set(userId, fresh);
    return fresh;
  }
  return existing;
}

export interface UsageSnapshot {
  used: number;
  limit: number;
  remaining: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

/** Read today's usage for a user without mutating it. */
export function getTodayUsage(userId: string): UsageSnapshot {
  const now = Date.now();
  const bucket = currentBucket(userId, now);
  const limit = getDailyLimit();
  return {
    used: bucket.requests,
    limit,
    remaining: Math.max(0, limit - bucket.requests),
    inputTokens: bucket.inputTokens,
    outputTokens: bucket.outputTokens,
    costUsd: bucket.costUsd,
  };
}

/** Increment the request counter (call once a run is authorised). */
export function recordRequest(userId: string): UsageSnapshot {
  const now = Date.now();
  const bucket = currentBucket(userId, now);
  bucket.requests += 1;
  return getTodayUsage(userId);
}

/** Record token usage + cost after a run completes. */
export function recordUsage(userId: string, usage: LLMUsage, model: string): void {
  const now = Date.now();
  const bucket = currentBucket(userId, now);
  bucket.inputTokens += usage.inputTokens;
  bucket.outputTokens += usage.outputTokens;
  bucket.costUsd += estimateCost(usage, model);
}

/**
 * Rough USD cost estimate. Prices are per 1K tokens and intentionally
 * approximate — the readout is for intuition, not billing. Unknown models fall
 * back to a sensible mid-range default.
 */
export function estimateCost(usage: LLMUsage, model: string): number {
  const { input, output } = priceFor(model);
  return (usage.inputTokens / 1000) * input + (usage.outputTokens / 1000) * output;
}

function priceFor(model: string): { input: number; output: number } {
  const m = model.toLowerCase();
  if (m.includes("demo")) return { input: 0, output: 0 };
  if (m.includes("mini") || m.includes("flash")) return { input: 0.00015, output: 0.0006 };
  if (m.includes("gpt-4o") || m.includes("4o")) return { input: 0.005, output: 0.015 };
  if (m.includes("gpt-5") || m.includes("luna") || m.includes("sol") || m.includes("terra"))
    return { input: 0.005, output: 0.015 };
  return { input: 0.003, output: 0.009 };
}

/** Test-only: clear all buckets. */
export function __resetUsage(): void {
  buckets.clear();
}
