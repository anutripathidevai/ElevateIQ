import { describe, expect, it } from "vitest";
import {
  generateId,
  matchesQuery,
  pluralize,
  timeAgo,
  truncate,
  uniqueSorted,
} from "@/features/shared/utils";

describe("shared/utils", () => {
  it("generateId produces unique, prefixed ids", () => {
    const a = generateId("st");
    const b = generateId("st");
    expect(a).not.toBe(b);
    expect(a.startsWith("st_")).toBe(true);
  });

  it("pluralize respects count", () => {
    expect(pluralize(1, "story")).toBe("1 story");
    expect(pluralize(3, "story")).toBe("3 stories");
    expect(pluralize(2, "match", "matches")).toBe("2 matches");
  });

  it("truncate cuts on a word boundary and adds an ellipsis", () => {
    expect(truncate("hello world", 20)).toBe("hello world");
    const out = truncate("the quick brown fox jumps", 12);
    expect(out.endsWith("…")).toBe(true);
    expect(out.length).toBeLessThanOrEqual(13);
  });

  it("matchesQuery requires every token, case-insensitively", () => {
    expect(matchesQuery("Design a URL shortener", "url short")).toBe(true);
    expect(matchesQuery("Design a URL shortener", "URL")).toBe(true);
    expect(matchesQuery("Design a URL shortener", "graph")).toBe(false);
    expect(matchesQuery("anything", "  ")).toBe(true);
  });

  it("uniqueSorted de-dupes and sorts", () => {
    expect(uniqueSorted(["b", "a", "b", "c"])).toEqual(["a", "b", "c"]);
  });

  it("timeAgo describes recent and older times", () => {
    const now = new Date("2026-01-10T12:00:00Z");
    expect(timeAgo(new Date("2026-01-10T11:59:40Z"), now)).toBe("just now");
    expect(timeAgo(new Date("2026-01-10T11:30:00Z"), now)).toBe("30m ago");
    expect(timeAgo(new Date("2026-01-10T09:00:00Z"), now)).toBe("3h ago");
    expect(timeAgo(new Date("2026-01-08T12:00:00Z"), now)).toBe("2d ago");
  });
});
