"use client";

import { useState } from "react";
import { Sparkles, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * AI-first action buttons used across modules. UI-only for now: clicking an
 * action simulates a short "thinking" delay and reveals a canned, on-brand AI
 * response so the experience feels real without a backend call.
 */
export function AiActions({
  actions,
  context,
  className,
  size = "sm",
}: {
  actions: string[];
  context?: string;
  className?: string;
  size?: "sm" | "xs";
}) {
  const [active, setActive] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function run(action: string) {
    setActive(action);
    setLoading(true);
    window.setTimeout(() => setLoading(false), 700);
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-1.5">
        {actions.map((action) => (
          <button
            key={action}
            type="button"
            onClick={() => run(action)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 font-medium text-primary transition-colors hover:bg-primary/10",
              size === "sm" ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[0.7rem]",
            )}
          >
            <Sparkles className="h-3 w-3" />
            {action}
          </button>
        ))}
      </div>

      {active && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
          <div className="mb-1 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> {active}
            </span>
            <button
              type="button"
              onClick={() => setActive(null)}
              aria-label="Dismiss"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          {loading ? (
            <p className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…
            </p>
          ) : (
            <p className="text-muted-foreground">
              {context ? `${context}: ` : ""}Here&apos;s an AI-generated
              starting point. Connect Azure OpenAI to get a full, personalized
              response tailored to your profile and goals.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
