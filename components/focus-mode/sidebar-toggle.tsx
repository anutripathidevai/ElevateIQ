"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type TooltipSide = "top" | "bottom" | "left" | "right";

const TOOLTIP_POSITION: Record<TooltipSide, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

export interface SidebarToggleProps {
  icon: LucideIcon;
  /** Used as both the accessible name and the visible tooltip text. */
  label: string;
  onClick: () => void;
  className?: string;
  tooltipSide?: TooltipSide;
  /** Reflects the state of the region this control expands/collapses. */
  expanded?: boolean;
  /** id of the region this control toggles (aria-controls). */
  controls?: string;
}

/**
 * Accessible icon toggle used for every collapse/expand affordance in focus
 * mode (inline collapse buttons and floating edge toggles). Ships an aria-label,
 * aria-expanded/controls wiring, a visible focus ring, and a hover/focus
 * tooltip so it works with pointer, keyboard, and assistive tech alike.
 */
export function SidebarToggle({
  icon: Icon,
  label,
  onClick,
  className,
  tooltipSide = "top",
  expanded,
  controls,
}: SidebarToggleProps) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-expanded={expanded}
        aria-controls={controls}
        title={label}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background/90 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className,
        )}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </button>
      <span
        role="tooltip"
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100",
          TOOLTIP_POSITION[tooltipSide],
        )}
      >
        {label}
      </span>
    </span>
  );
}
