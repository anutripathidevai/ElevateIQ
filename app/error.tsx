"use client";

/**
 * Global error boundary for the app. Catches unexpected runtime errors thrown
 * while rendering a route and offers a recovery path (retry) plus a safe exit
 * back to the homepage. Rendered within the root layout, so it provides its own
 * minimal branded chrome.
 */
import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Logo } from "@/components/marketing/brand";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Logo className="mb-8" />
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-danger/10 text-danger">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <h1 className="mt-6 text-2xl font-bold tracking-tight">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        An unexpected error occurred. You can try again, or head back to the
        homepage and pick up where you left off.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-muted-foreground/70">
          Reference: {error.digest}
        </p>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className={cn(buttonVariants({ size: "lg" }))}
        >
          <RotateCw className="h-4 w-4" />
          Try again
        </button>
        <Link
          href="/"
          className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
