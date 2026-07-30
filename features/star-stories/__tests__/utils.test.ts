import { describe, expect, it } from "vitest";
import type { GeneratedStarStory, StarStory } from "@/features/star-stories/types";
import {
  duplicateTitle,
  emptyStoryInput,
  inputFromGenerated,
  normalizeTags,
  searchStories,
  storyToInput,
  storyToPlainText,
} from "@/features/star-stories/utils";

const generated: GeneratedStarStory = {
  title: "Scaled ingestion pipeline",
  situation: "The pipeline fell over at peak load.",
  task: "I owned making it reliable.",
  action: "I redesigned it around a queue.",
  result: "Throughput rose 5x with zero data loss.",
  skills: ["distributed systems", "kafka"],
  leadershipPrinciples: ["Ownership"],
  suggestedQuestions: ["Tell me about a scaling challenge."],
  tags: ["Scaling", "scaling", "  reliability  "],
};

function story(overrides: Partial<StarStory> = {}): StarStory {
  return {
    id: "s1",
    title: "T",
    situation: "sit",
    task: "task",
    action: "act",
    result: "res",
    skills: ["go"],
    leadershipPrinciples: ["Bias for Action"],
    suggestedQuestions: ["q?"],
    tags: ["perf"],
    sourceProject: "notes",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
    ...overrides,
  };
}

describe("star-stories/utils", () => {
  it("normalizeTags trims, drops empties, de-dupes case-insensitively", () => {
    expect(normalizeTags("Scaling, scaling,  reliability , ,")).toEqual([
      "Scaling",
      "reliability",
    ]);
    expect(normalizeTags(["a", "A", "b"])).toEqual(["a", "b"]);
  });

  it("inputFromGenerated normalizes tags and carries sourceProject", () => {
    const input = inputFromGenerated(generated, "raw project");
    expect(input.tags).toEqual(["Scaling", "reliability"]);
    expect(input.sourceProject).toBe("raw project");
    expect(input.title).toBe(generated.title);
  });

  it("emptyStoryInput is blank", () => {
    const empty = emptyStoryInput();
    expect(empty.title).toBe("");
    expect(empty.skills).toEqual([]);
    expect(empty.sourceProject).toBeNull();
  });

  it("storyToInput drops id and timestamps", () => {
    const input = storyToInput(story());
    expect(input).not.toHaveProperty("id");
    expect(input).not.toHaveProperty("createdAt");
    expect(input.title).toBe("T");
  });

  it("searchStories matches across fields and tokens", () => {
    const list = [
      story({ id: "a", title: "Latency win", tags: ["performance"] }),
      story({ id: "b", title: "Mentorship", skills: ["coaching"] }),
    ];
    expect(searchStories(list, "performance").map((s) => s.id)).toEqual(["a"]);
    expect(searchStories(list, "coaching").map((s) => s.id)).toEqual(["b"]);
    expect(searchStories(list, "")).toHaveLength(2);
    expect(searchStories(list, "nope")).toHaveLength(0);
  });

  it("storyToPlainText renders STAR labels", () => {
    const text = storyToPlainText(story());
    expect(text).toContain("Situation: sit");
    expect(text).toContain("Result: res");
    expect(text).toContain("Skills: go");
  });

  it("duplicateTitle increments copy suffix", () => {
    expect(duplicateTitle("My story")).toBe("My story (Copy)");
    expect(duplicateTitle("My story (Copy)")).toBe("My story (Copy 2)");
    expect(duplicateTitle("My story (Copy 2)")).toBe("My story (Copy 3)");
  });
});
