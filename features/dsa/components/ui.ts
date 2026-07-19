import {
  ArrowLeftRight,
  Binary,
  BookMarked,
  Boxes,
  Braces,
  Brackets,
  GitBranch,
  Grid3x3,
  Hash,
  Layers,
  LayoutGrid,
  ListTree,
  Network,
  Repeat,
  Route,
  Search,
  SlidersHorizontal,
  Split,
  TableProperties,
  Trees,
  type LucideIcon,
} from "lucide-react";
import type { DsaIconKey } from "../types";

/**
 * Resolves a serialisable topic `iconKey` to a concrete Lucide icon. Kept out of
 * the data model so registry entries stay free of React/icon imports.
 */
export const DSA_ICONS: Record<DsaIconKey, LucideIcon> = {
  arrays: LayoutGrid,
  "two-pointers": ArrowLeftRight,
  "binary-search": Binary,
  sorting: SlidersHorizontal,
  hashmap: Hash,
  "linked-list": Braces,
  stack: Layers,
  queue: Repeat,
  tree: Trees,
  trie: ListTree,
  heap: Boxes,
  intervals: Brackets,
  "sliding-window": Search,
  backtracking: Split,
  greedy: Route,
  "dynamic-programming": TableProperties,
  graph: Network,
};

/** Fallback icons that read well when a specific one is missing. */
export const DSA_FALLBACK_ICON = Grid3x3;
export const DSA_ROADMAP_ICON = GitBranch;
export const DSA_LESSON_ICON = BookMarked;
export const DSA_TREE_ICON = Trees;

/** Format an hour count as a compact human string, e.g. "16h" or "1h 30m". */
export function formatHours(hours: number): string {
  if (hours <= 0) return "0h";
  const whole = Math.floor(hours);
  const mins = Math.round((hours - whole) * 60);
  if (mins === 0) return `${whole}h`;
  return `${whole}h ${mins}m`;
}
