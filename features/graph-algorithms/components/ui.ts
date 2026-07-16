import type { AccentKey } from "@/lib/navigation";

/**
 * Per-module accent cycle. The 10 modules cycle through the shared accent
 * palette so each module gets a stable, distinct colour on cards, the roadmap,
 * and section chips without hard-coding a colour into the content data.
 */
export const MODULE_ACCENTS: AccentKey[] = [
  "blue",
  "violet",
  "emerald",
  "orange",
  "rose",
  "cyan",
  "blue",
  "violet",
  "emerald",
  "orange",
];

/** Deterministic accent for a module given its 1-based order. */
export function moduleAccent(order: number): AccentKey {
  return MODULE_ACCENTS[(order - 1) % MODULE_ACCENTS.length] ?? "blue";
}

/** Format a minute count as a compact human string, e.g. "1h 20m" or "45m". */
export function formatMinutes(min: number): string {
  if (min <= 0) return "0m";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
