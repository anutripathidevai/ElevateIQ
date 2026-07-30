"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, GraduationCap } from "lucide-react";
import { NavContent } from "./nav-content";

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
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 font-semibold"
              >
                <GraduationCap className="h-5 w-5 text-primary" />
                ElevateIQ
              </Link>
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
