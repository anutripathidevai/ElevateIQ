import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { guardAndCount, settleUsage } from "../gateway";
import {
  __resetUsage,
  estimateCost,
  getTodayUsage,
  recordUsage,
} from "../usage";
import { ExecutionTrace } from "../execution";

describe("AI Labs usage + gateway", () => {
  beforeEach(() => {
    __resetUsage();
    delete process.env.AI_LABS_DAILY_LIMIT;
  });
  afterEach(() => {
    __resetUsage();
    delete process.env.AI_LABS_DAILY_LIMIT;
  });

  it("counts requests and reports remaining quota", () => {
    process.env.AI_LABS_DAILY_LIMIT = "3";
    const user = "u1";
    expect(getTodayUsage(user).used).toBe(0);

    const first = guardAndCount(user);
    expect(first.ok).toBe(true);
    expect(first.usage.used).toBe(1);
    expect(first.usage.remaining).toBe(2);

    guardAndCount(user);
    const third = guardAndCount(user);
    expect(third.ok).toBe(true);
    expect(third.usage.remaining).toBe(0);
  });

  it("blocks once the daily limit is reached", () => {
    process.env.AI_LABS_DAILY_LIMIT = "2";
    const user = "u2";
    guardAndCount(user);
    guardAndCount(user);
    const blocked = guardAndCount(user);
    expect(blocked.ok).toBe(false);
    expect(blocked.reason).toMatch(/limit/i);
  });

  it("tracks limits per user independently", () => {
    process.env.AI_LABS_DAILY_LIMIT = "1";
    expect(guardAndCount("a").ok).toBe(true);
    expect(guardAndCount("a").ok).toBe(false);
    expect(guardAndCount("b").ok).toBe(true);
  });

  it("accumulates token usage and cost", () => {
    const user = "u3";
    guardAndCount(user);
    settleUsage(user, { inputTokens: 1000, outputTokens: 500 }, "gpt-4o");
    const snap = getTodayUsage(user);
    expect(snap.inputTokens).toBe(1000);
    expect(snap.outputTokens).toBe(500);
    expect(snap.costUsd).toBeGreaterThan(0);
  });

  it("records zero cost for the demo model", () => {
    const user = "u4";
    recordUsage(user, { inputTokens: 500, outputTokens: 500 }, "demo-model");
    expect(getTodayUsage(user).costUsd).toBe(0);
  });

  it("estimates cost from tokens and model pricing", () => {
    const cost = estimateCost({ inputTokens: 1000, outputTokens: 1000 }, "gpt-4o");
    // 1K in @ 0.005 + 1K out @ 0.015 = 0.02
    expect(cost).toBeCloseTo(0.02, 5);
    expect(estimateCost({ inputTokens: 1000, outputTokens: 0 }, "demo-model")).toBe(0);
  });
});

describe("ExecutionTrace", () => {
  it("records ordered steps with non-decreasing timestamps", () => {
    const trace = new ExecutionTrace();
    trace.step("a");
    trace.step("b", "detail");
    const errStep = trace.step("c", "boom", "error");

    const snap = trace.snapshot();
    expect(snap.steps.map((s) => s.label)).toEqual(["a", "b", "c"]);
    expect(errStep.status).toBe("error");
    expect(snap.steps[1].detail).toBe("detail");
    expect(snap.totalMs).toBeGreaterThanOrEqual(0);
    for (let i = 1; i < snap.steps.length; i++) {
      expect(snap.steps[i].atMs).toBeGreaterThanOrEqual(snap.steps[i - 1].atMs);
    }
  });
});
