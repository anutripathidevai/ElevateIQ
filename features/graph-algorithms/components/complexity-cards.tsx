import { Clock, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Complexity } from "../types";

/** Time & space complexity shown as a pair of compact cards. */
export function ComplexityCards({
  complexity,
  className,
}: {
  complexity: Complexity;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> Time
          </div>
          <p className="mt-1 font-mono text-base font-semibold">
            {complexity.time}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Cpu className="h-3.5 w-3.5" /> Space
          </div>
          <p className="mt-1 font-mono text-base font-semibold">
            {complexity.space}
          </p>
        </div>
      </div>
      {complexity.note && (
        <p className="text-xs text-muted-foreground">{complexity.note}</p>
      )}
    </div>
  );
}
