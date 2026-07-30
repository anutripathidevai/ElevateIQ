"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe media-query hook. Returns `false` on the server and during the first
 * client render (so markup matches), then reflects the real match after mount.
 * Subscribes to changes so the value stays live across viewport resizes.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);

  return matches;
}
