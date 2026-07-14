"use client";

import { CheckCircle2 } from "lucide-react";
import { useSolved } from "@/lib/progress-store";
import { cn } from "@/lib/utils";

/**
 * Green "solved" check that hydrates from localStorage. Renders nothing until
 * the client confirms the problem is solved (SSR-safe — no hydration mismatch).
 */
export function SolvedIndicator({
  slug,
  className,
  showLabel = false,
}: {
  slug: string;
  className?: string;
  showLabel?: boolean;
}) {
  const solved = useSolved(slug);
  if (!solved) return null;
  return (
    <span
      className={cn("inline-flex items-center gap-1 text-success", className)}
      title="Solved"
    >
      <CheckCircle2 className="h-4 w-4" />
      {showLabel && <span className="text-xs font-medium">Solved</span>}
    </span>
  );
}
