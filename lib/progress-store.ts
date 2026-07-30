"use client";

/**
 * Client-side "solved" tracking backed by localStorage. This makes the DSA code
 * runner fully functional in guest mode (no database, no sign-in). When a
 * database is later attached, `markSolved` also fires a best-effort POST to
 * /api/problems/[slug]/solve so progress syncs server-side for signed-in users.
 */
import { useSyncExternalStore } from "react";

const KEY = "interviewprep:solved:v1";
const EVENT = "interviewprep:progress";

function read(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return new Set();
    const arr: unknown = JSON.parse(raw);
    return Array.isArray(arr)
      ? new Set(arr.filter((x): x is string => typeof x === "string"))
      : new Set();
  } catch {
    return new Set();
  }
}

function persist(set: Set<string>) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify([...set]));
  } catch {
    /* storage full / unavailable — ignore */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function isSolved(slug: string): boolean {
  return read().has(slug);
}

export function getSolvedSlugs(): string[] {
  return [...read()];
}

export function markSolved(slug: string): void {
  const set = read();
  if (!set.has(slug)) {
    set.add(slug);
    persist(set);
  }
  // Best-effort server sync (no-ops in guest mode / when unauthenticated).
  void fetch(`/api/problems/${slug}/solve`, { method: "POST" }).catch(() => {});
}

export function unmarkSolved(slug: string): void {
  const set = read();
  if (set.delete(slug)) persist(set);
}

function subscribe(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/**
 * Reactive hook. Returns false during SSR and the first client render (matching
 * the server) to avoid hydration mismatches, then updates to the real value.
 */
export function useSolved(slug: string): boolean {
  return useSyncExternalStore(
    subscribe,
    () => read().has(slug),
    () => false,
  );
}

// Cached snapshot so `useSolvedSet` returns a stable reference between changes
// (required by useSyncExternalStore to avoid render loops).
const EMPTY_SET: ReadonlySet<string> = new Set();
let cachedRaw: string | null = null;
let cachedSet: ReadonlySet<string> = EMPTY_SET;

function getSetSnapshot(): ReadonlySet<string> {
  if (typeof window === "undefined") return EMPTY_SET;
  const raw = window.localStorage.getItem(KEY) ?? "";
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSet = read();
  }
  return cachedSet;
}

/** Reactive set of all solved slugs. Use for aggregate progress (counts, %). */
export function useSolvedSet(): ReadonlySet<string> {
  return useSyncExternalStore(subscribe, getSetSnapshot, () => EMPTY_SET);
}
