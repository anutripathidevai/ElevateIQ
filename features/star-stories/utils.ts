import { matchesQuery } from "@/features/shared/utils";
import type {
  GeneratedStarStory,
  StarStory,
  StarStoryContent,
  StarStoryInput,
} from "./types";

/**
 * Pure helpers for STAR stories — normalization, search, and formatting. These
 * have no I/O so they're shared freely between server and client and are the
 * unit-test target for the module.
 */

/** Split a comma/newline list (or array) into trimmed, de-duplicated tags. */
export function normalizeTags(input: string | string[]): string[] {
  const raw = Array.isArray(input) ? input : input.split(/[,\n]/);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of raw) {
    const tag = value.trim();
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(tag);
  }
  return out;
}

/** An empty story used to seed the manual editor. */
export function emptyStoryInput(): StarStoryInput {
  return {
    title: "",
    situation: "",
    task: "",
    action: "",
    result: "",
    skills: [],
    leadershipPrinciples: [],
    suggestedQuestions: [],
    tags: [],
    sourceProject: null,
  };
}

/** Convert a freshly generated story into savable input. */
export function inputFromGenerated(
  story: GeneratedStarStory,
  sourceProject: string | null = null,
): StarStoryInput {
  return {
    title: story.title,
    situation: story.situation,
    task: story.task,
    action: story.action,
    result: story.result,
    skills: story.skills,
    leadershipPrinciples: story.leadershipPrinciples,
    suggestedQuestions: story.suggestedQuestions,
    tags: normalizeTags(story.tags),
    sourceProject,
  };
}

/** Case-insensitive full-text search across the searchable fields of a story. */
export function searchStories(
  stories: readonly StarStory[],
  query: string,
): StarStory[] {
  const q = query.trim();
  if (!q) return [...stories];
  return stories.filter((s) => {
    const haystack = [
      s.title,
      s.situation,
      s.task,
      s.action,
      s.result,
      ...s.skills,
      ...s.leadershipPrinciples,
      ...s.suggestedQuestions,
      ...s.tags,
    ].join(" ");
    return matchesQuery(haystack, q);
  });
}

/** Render a story as plain text suitable for copying into notes / applications. */
export function storyToPlainText(story: StarStoryContent): string {
  const lines = [
    story.title,
    "",
    `Situation: ${story.situation}`,
    `Task: ${story.task}`,
    `Action: ${story.action}`,
    `Result: ${story.result}`,
  ];
  if (story.skills.length) lines.push("", `Skills: ${story.skills.join(", ")}`);
  if (story.leadershipPrinciples.length)
    lines.push(`Leadership principles: ${story.leadershipPrinciples.join(", ")}`);
  if (story.suggestedQuestions.length) {
    lines.push("", "Answers questions like:");
    for (const q of story.suggestedQuestions) lines.push(`- ${q}`);
  }
  return lines.join("\n");
}

/** Extract the editable input from a persisted story (drops id + timestamps). */
export function storyToInput(s: StarStory): StarStoryInput {
  return {
    title: s.title,
    situation: s.situation,
    task: s.task,
    action: s.action,
    result: s.result,
    skills: s.skills,
    leadershipPrinciples: s.leadershipPrinciples,
    suggestedQuestions: s.suggestedQuestions,
    tags: s.tags,
    sourceProject: s.sourceProject,
  };
}

/**
 * Title used when duplicating: appends "(Copy)", or "(Copy 2)", "(Copy 3)" …
 * so repeated duplicates stay unique-ish and readable.
 */
export function duplicateTitle(title: string): string {
  const match = title.match(/^(.*?)\s*\(Copy(?:\s+(\d+))?\)\s*$/);
  if (!match) return `${title} (Copy)`;
  const base = match[1];
  const n = match[2] ? Number(match[2]) + 1 : 2;
  return `${base} (Copy ${n})`;
}
