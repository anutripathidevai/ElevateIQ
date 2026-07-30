"use client";

import { TopBar } from "@/components/layout/topbar";
import { cn } from "@/lib/utils";
import { FocusModeProvider, useFocusMode } from "./focus-mode-context";
import { LeftSidebar } from "./left-sidebar";

/** Inner shell that can read focus-mode state to widen the reading column. */
function ShellBody({ children }: { children: React.ReactNode }) {
  const { leftOpen, rightOpen, mounted } = useFocusMode();
  const focusMode = !leftOpen && !rightOpen;

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <div
        className={cn(
          "mx-auto flex w-full flex-1",
          mounted && "transition-[max-width] duration-300 ease-in-out",
          // Both sidebars hidden → let the article breathe (max reading width).
          focusMode ? "max-w-screen-2xl" : "max-w-7xl",
        )}
      >
        <LeftSidebar />
        <main className="min-w-0 flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}

/**
 * Authenticated application shell. Provides focus-mode state to the whole
 * subtree and composes the top bar, collapsible left navigation, and main
 * content region.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <FocusModeProvider>
      <ShellBody>{children}</ShellBody>
    </FocusModeProvider>
  );
}
