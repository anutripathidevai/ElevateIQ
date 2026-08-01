"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { ACCENT_STYLES } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { MarketingNavMenu } from "./marketing-data";

/**
 * Accessible navbar dropdown. Opens on hover (desktop pointers) and on
 * click/keyboard, closes on Escape, blur, or outside pointer. Each entry is a
 * real link into the app.
 */
export function NavDropdown({ menu }: { menu: MarketingNavMenu }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuId = useId();

  const clearTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const openNow = () => {
    clearTimer();
    setOpen(true);
  };
  const closeSoon = () => {
    clearTimer();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onPointer(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  useEffect(() => () => clearTimer(), []);

  const twoCols = menu.items.length > 4;

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
      onBlur={(e) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node)) {
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          open
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {menu.label}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      <div
        id={menuId}
        role="menu"
        aria-label={menu.label}
        className={cn(
          "absolute left-0 top-full z-50 pt-2 transition duration-150",
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-1 opacity-0",
        )}
      >
        <div
          className={cn(
            "grid gap-1 rounded-xl border border-border bg-card p-2 shadow-xl shadow-black/20",
            twoCols ? "w-[34rem] grid-cols-2" : "w-[20rem] grid-cols-1",
          )}
        >
          {menu.items.map((item) => {
            const Icon = item.icon;
            const a = ACCENT_STYLES[item.accent];
            return (
              <Link
                key={item.label + item.href}
                href={item.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="group/item flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    a.bg,
                  )}
                >
                  <Icon className={cn("h-[18px] w-[18px]", a.text)} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">
                    {item.label}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {item.description}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
