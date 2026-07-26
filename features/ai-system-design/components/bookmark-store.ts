"use client";

/**
 * Client-side bookmark + recently-viewed tracking for AI System Design lessons,
 * backed by localStorage (mirrors `lib/progress-store.ts`). Works fully in guest
 * mode — no database or sign-in required. Uses its own storage keys so it never
 * collides with the System Design (HLD) module.
 */
import { useSyncExternalStore } from "react";

const BOOKMARK_KEY = "elevateiq:aisd:bookmarks:v1";
const RECENT_KEY = "elevateiq:aisd:recent:v1";
const EVENT = "elevateiq:aisd:store";
const RECENT_LIMIT = 8;

function readList(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const arr: unknown = JSON.parse(raw);
    return Array.isArray(arr)
      ? arr.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

function writeList(key: string, list: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(list));
  } catch {
    /* storage unavailable — ignore */
  }
  window.dispatchEvent(new Event(EVENT));
}

// ---- Bookmarks -------------------------------------------------------------

export function isBookmarked(slug: string): boolean {
  return readList(BOOKMARK_KEY).includes(slug);
}

export function toggleBookmark(slug: string): void {
  const list = readList(BOOKMARK_KEY);
  const next = list.includes(slug)
    ? list.filter((s) => s !== slug)
    : [slug, ...list];
  writeList(BOOKMARK_KEY, next);
}

// ---- Recently viewed -------------------------------------------------------

export function recordRecentlyViewed(slug: string): void {
  const list = readList(RECENT_KEY).filter((s) => s !== slug);
  writeList(RECENT_KEY, [slug, ...list].slice(0, RECENT_LIMIT));
}

// ---- Reactive hooks --------------------------------------------------------

function subscribe(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

const EMPTY: readonly string[] = [];

// Cached snapshots keep useSyncExternalStore stable between real changes.
let bmRaw: string | null = null;
let bmCache: readonly string[] = EMPTY;
let rcRaw: string | null = null;
let rcCache: readonly string[] = EMPTY;

function bookmarkSnapshot(): readonly string[] {
  if (typeof window === "undefined") return EMPTY;
  const raw = window.localStorage.getItem(BOOKMARK_KEY) ?? "";
  if (raw !== bmRaw) {
    bmRaw = raw;
    bmCache = readList(BOOKMARK_KEY);
  }
  return bmCache;
}

function recentSnapshot(): readonly string[] {
  if (typeof window === "undefined") return EMPTY;
  const raw = window.localStorage.getItem(RECENT_KEY) ?? "";
  if (raw !== rcRaw) {
    rcRaw = raw;
    rcCache = readList(RECENT_KEY);
  }
  return rcCache;
}

/** Reactive list of bookmarked slugs (most-recent first). */
export function useBookmarks(): readonly string[] {
  return useSyncExternalStore(subscribe, bookmarkSnapshot, () => EMPTY);
}

/** Reactive boolean for a single slug's bookmark state. */
export function useIsBookmarked(slug: string): boolean {
  return useSyncExternalStore(
    subscribe,
    () => bookmarkSnapshot().includes(slug),
    () => false,
  );
}

/** Reactive list of recently-viewed slugs (most-recent first). */
export function useRecentlyViewed(): readonly string[] {
  return useSyncExternalStore(subscribe, recentSnapshot, () => EMPTY);
}
