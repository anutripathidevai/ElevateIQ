"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, X } from "lucide-react";
import { useAuth } from "./auth-provider";

const DISMISS_KEY = "cr_signup_prompt_dismissed";

/**
 * A soft, dismissible sign-up prompt shown to logged-out visitors on public
 * content pages (e.g. the learning catalog). It never blocks the content — the
 * page is fully readable and crawlable — it simply invites visitors to create a
 * free account to track progress. Rendered client-side only (after mount) so it
 * never appears in the server HTML and cannot cause hydration mismatches or hide
 * content from search engines.
 */
export function SignupPrompt() {
  const { isAuthenticated, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      /* sessionStorage unavailable — show the prompt */
    }
  }, []);

  if (!mounted || isLoading || isAuthenticated || dismissed) return null;

  function dismiss() {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-3 sm:px-4 sm:pb-4">
      <div className="pointer-events-auto flex w-full max-w-3xl items-center gap-3 rounded-xl border border-border bg-card/95 p-3 shadow-lg shadow-black/20 backdrop-blur sm:gap-4 sm:p-4">
        <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary sm:flex">
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">
            Free to read — sign up to save your progress
          </p>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Track completed lessons, bookmark problems, and run AI mock
            interviews.
          </p>
        </div>
        <Link
          href="/signup"
          className="inline-flex h-9 shrink-0 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Sign up free
        </Link>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss sign-up prompt"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
