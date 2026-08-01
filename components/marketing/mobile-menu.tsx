"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Coffee, Menu, X } from "lucide-react";
import { ACCENT_STYLES } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "./brand";
import { NavGetStarted } from "./cta-buttons";
import { NAV_LINKS, NAV_MENUS } from "./marketing-data";
import { ThemeToggle } from "@/components/layout/theme-toggle";

/** Hamburger + slide-in drawer navigation for tablet / mobile. */
export function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col overflow-y-auto border-l border-border bg-background shadow-2xl">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
              <Logo onClick={close} />
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4">
              {NAV_MENUS.map((menu) => (
                <details
                  key={menu.id}
                  className="group border-b border-border/60"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
                    {menu.label}
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="pb-2">
                    {menu.items.map((item) => {
                      const Icon = item.icon;
                      const a = ACCENT_STYLES[item.accent];
                      return (
                        <Link
                          key={item.label + item.href}
                          href={item.href}
                          onClick={close}
                          className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                        >
                          <span
                            className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                              a.bg,
                            )}
                          >
                            <Icon className={cn("h-4 w-4", a.text)} />
                          </span>
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </details>
              ))}

              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className="block border-b border-border/60 py-3 text-sm font-medium text-foreground hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}

              <Link
                href="/contact#support"
                onClick={close}
                className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Coffee className="h-4 w-4" />
                Support the Builder
              </Link>
            </nav>

            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border px-4 py-4">
              <ThemeToggle />
              <div onClick={close}>
                <NavGetStarted />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
