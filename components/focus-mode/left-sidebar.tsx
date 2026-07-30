"use client";

import { PanelLeft, PanelLeftClose } from "lucide-react";
import { NavContent } from "@/components/layout/nav-content";
import { cn } from "@/lib/utils";
import { useFocusMode } from "./focus-mode-context";
import { SidebarToggle } from "./sidebar-toggle";

/**
 * Collapsible desktop/tablet left navigation. Wraps the shared {@link NavContent}
 * and animates its width to zero when hidden, letting the main content reclaim
 * the space. When collapsed, a sticky floating toggle on the left edge restores
 * it. Below `md` the sidebar is hidden entirely — the hamburger `MobileNav` in
 * the top bar owns navigation there.
 */
export function LeftSidebar() {
  const { leftOpen, toggleLeft, mounted } = useFocusMode();

  return (
    <>
      <aside
        id="left-sidebar"
        aria-label="Learning navigation"
        aria-hidden={!leftOpen}
        className={cn(
          "hidden shrink-0 overflow-hidden border-r border-border md:block",
          mounted && "transition-[width,opacity] duration-300 ease-in-out",
          leftOpen ? "w-64 opacity-100" : "pointer-events-none w-0 opacity-0",
        )}
      >
        <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] w-64 overflow-y-auto">
          <div className="flex items-center justify-between px-3 pt-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Navigation
            </span>
            <SidebarToggle
              icon={PanelLeftClose}
              label="Hide navigation"
              onClick={toggleLeft}
              tooltipSide="right"
              expanded
              controls="left-sidebar"
            />
          </div>
          <NavContent />
        </div>
      </aside>

      {!leftOpen && (
        <div className="fixed left-3 top-20 z-30 hidden md:block">
          <SidebarToggle
            icon={PanelLeft}
            label="Show navigation"
            onClick={toggleLeft}
            tooltipSide="right"
            expanded={false}
            controls="left-sidebar"
          />
        </div>
      )}
    </>
  );
}
