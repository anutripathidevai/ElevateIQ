"use client";

import { useCallback, useState } from "react";

/** Copy text to the clipboard and expose a transient `copied` flag. */
export function useCopyToClipboard(resetMs = 1500): [boolean, (text: string) => Promise<void>] {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), resetMs);
      } catch {
        setCopied(false);
      }
    },
    [resetMs],
  );

  return [copied, copy];
}
