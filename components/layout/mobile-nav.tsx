"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NavContent } from "./nav-content";
import { Logo } from "@/components/marketing/brand";

/** Mobile hamburger that opens a slide-over drawer with the full navigation. */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 top-0 h-full w-72 overflow-y-auto border-r border-border bg-background shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <Logo onClick={() => setOpen(false)} />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
                className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavContent onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
