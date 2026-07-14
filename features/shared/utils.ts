/**
 * Small, dependency-free helpers shared across feature modules.
 * Pure functions only — safe to unit test and to use on both server and client.
 */

/** Collision-resistant id with an optional short prefix (e.g. `st_ab12cd34`). */
export function generateId(prefix = "id"): string {
  const rand = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${prefix}_${rand}${time}`;
}

/** English-ish default plural: story→stories, match→matches, tag→tags. */
function defaultPlural(singular: string): string {
  if (/[^aeiou]y$/i.test(singular)) return `${singular.slice(0, -1)}ies`;
  if (/(s|x|z|ch|sh)$/i.test(singular)) return `${singular}es`;
  return `${singular}s`;
}

/** Naive-but-useful pluralizer: `pluralize(1, "story") => "1 story"`. */
export function pluralize(count: number, singular: string, plural?: string): string {
  const word = count === 1 ? singular : plural ?? defaultPlural(singular);
  return `${count} ${word}`;
}

/** Truncate to `max` chars on a word boundary, appending an ellipsis. */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  return `${slice.slice(0, lastSpace > 0 ? lastSpace : max).trimEnd()}…`;
}

/** Case-insensitive "does haystack contain every whitespace-separated token". */
export function matchesQuery(haystack: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const text = haystack.toLowerCase();
  return q.split(/\s+/).every((token) => text.includes(token));
}

/** Stable de-dupe + sort for tag lists. */
export function uniqueSorted(values: Iterable<string>): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

/** Relative time such as "just now", "3h ago", "2d ago", falling back to a date. */
export function timeAgo(date: Date | string, now: Date = new Date()): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.round((now.getTime() - d.getTime()) / 1000);
  if (seconds < 45) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
