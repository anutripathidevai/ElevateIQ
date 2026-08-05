"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SearchResult } from "@/lib/types";
import { SEARCH_INDEX, SEARCH_CATEGORY_ORDER } from "@/lib/data/search";

/**
 * Global omni-search in the top bar.
 *
 * Renders a compact, scrollable dropdown (not a full-screen overlay) below the
 * input. Results are grouped by category in a fixed order and support full
 * keyboard navigation (↑/↓ to move, Enter to open, Esc to close). The panel
 * closes on outside click, Escape, or selecting a result.
 */
export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Flat, ordered (by category) list of matches — drives keyboard navigation.
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? SEARCH_INDEX.filter(
          (r) =>
            r.label.toLowerCase().includes(q) ||
            r.category.toLowerCase().includes(q),
        )
      : SEARCH_INDEX;

    const order = (c: SearchResult["category"]) => {
      const idx = SEARCH_CATEGORY_ORDER.indexOf(c);
      return idx === -1 ? SEARCH_CATEGORY_ORDER.length : idx;
    };
    const ordered = [...matches].sort((a, b) => order(a.category) - order(b.category));
    // Cap the list so the (large) learning corpus stays fast and scannable:
    // a short suggestion set when idle, more once the user starts typing.
    return q ? ordered.slice(0, 40) : ordered.slice(0, 8);
  }, [query]);

  // Group the ordered flat list back into category sections for display, while
  // remembering each item's index in the flat list for highlight/keyboard sync.
  const grouped = useMemo(() => {
    const map = new Map<string, { result: SearchResult; index: number }[]>();
    results.forEach((result, index) => {
      const bucket = map.get(result.category) ?? [];
      bucket.push({ result, index });
      map.set(result.category, bucket);
    });
    return Array.from(map.entries());
  }, [results]);

  const hasResults = results.length > 0;

  // Reset the active row whenever the result set changes.
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function select(result: SearchResult) {
    setOpen(false);
    setQuery("");
    router.push(result.href);
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (hasResults ? (i + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) =>
        hasResults ? (i - 1 + results.length) % results.length : 0,
      );
    } else if (e.key === "Enter") {
      const active = results[activeIndex];
      if (active) {
        e.preventDefault();
        select(active);
      }
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={onInputKeyDown}
          placeholder="Search lessons, questions, tools…"
          aria-label="Global search"
          aria-expanded={open}
          aria-controls="global-search-results"
          role="combobox"
          className="h-9 w-full rounded-lg border border-border bg-muted/40 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary/50 focus:bg-background"
        />
      </div>

      {open && (
        <div
          id="global-search-results"
          role="listbox"
          className="absolute left-0 top-11 z-50 w-[min(92vw,560px)] max-h-[420px] overflow-y-auto rounded-xl border border-border bg-card p-2 text-card-foreground shadow-2xl shadow-black/30"
        >
          {hasResults ? (
            grouped.map(([category, rows]) => (
              <div key={category} className="mb-1.5 last:mb-0">
                <p className="px-2 py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
                  {category}
                </p>
                {rows.map(({ result, index }) => {
                  const Icon = result.icon;
                  const active = index === activeIndex;
                  return (
                    <Link
                      key={result.id}
                      href={result.href}
                      role="option"
                      aria-selected={active}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => select(result)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors",
                        active
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent/60",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate">{result.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))
          ) : (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              No results found. Try searching for courses, questions, resumes,
              or blogs.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
