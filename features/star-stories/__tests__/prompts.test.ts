import { describe, expect, it } from "vitest";
import { buildStarPrompt } from "@/features/star-stories/ai/prompts";
import { starGenerationInputSchema } from "@/features/star-stories/ai/schemas";

describe("star-stories/ai", () => {
  it("input schema enforces a minimum project length", () => {
    expect(starGenerationInputSchema.safeParse({ project: "too short" }).success).toBe(
      false,
    );
    const ok = starGenerationInputSchema.safeParse({
      project: "x".repeat(60),
    });
    expect(ok.success).toBe(true);
    // count defaults to 3
    expect(ok.success && ok.data.count).toBe(3);
  });

  it("prompt includes the requested count, role, and company", () => {
    const { system, user } = buildStarPrompt({
      project: "Built a thing ".repeat(5),
      role: "Staff Engineer",
      company: "Stripe",
      count: 2,
      focus: "Ownership",
    });
    expect(user).toContain("Generate 2 distinct STAR stories");
    expect(user).toContain("Staff Engineer");
    expect(user).toContain("Stripe");
    expect(user).toContain("Ownership");
    expect(system).toContain("STAR");
  });

  it("references Amazon leadership principles when targeting Amazon", () => {
    const { system } = buildStarPrompt({
      project: "y".repeat(60),
      company: "Amazon",
      count: 3,
    });
    expect(system).toContain("Amazon Leadership Principles");
    expect(system).toContain("Customer Obsession");
  });
});
