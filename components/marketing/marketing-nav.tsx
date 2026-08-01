"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Coffee } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./brand";
import { NavDropdown } from "./nav-dropdown";
import { MobileMenu } from "./mobile-menu";
import { NavGetStarted } from "./cta-buttons";
import { NAV_LINKS, NAV_MENUS } from "./marketing-data";
import { ThemeToggle } from "@/components/layout/theme-toggle";

/** Sticky, translucent marketing navbar with dropdown menus and auth-aware CTA. */
export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-colors duration-200",
        scrolled
          ? "border-border bg-background/80 backdrop-blur"
          : "border-transparent bg-background/60 backdrop-blur",
      )}
    >
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center gap-2 px-4 sm:px-6 lg:px-8">
        <Logo className="mr-1 shrink-0" />

        <nav
          aria-label="Primary"
          className="hidden flex-1 items-center gap-0.5 lg:flex"
        >
          {NAV_MENUS.map((menu) => (
            <NavDropdown key={menu.id} menu={menu} />
          ))}
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 lg:gap-2">
          <Link
            href="/contact#support"
            className="hidden items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground xl:inline-flex"
          >
            <Coffee className="h-4 w-4" />
            <span>Support the Builder</span>
          </Link>
          <ThemeToggle />
          <div className="hidden lg:block">
            <NavGetStarted />
          </div>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
