import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { AccountMenu } from "./account-menu";
import { GlobalSearch } from "./global-search";
import { MobileNav } from "./mobile-nav";

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
      <MobileNav />
      <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold">
        <GraduationCap className="h-5 w-5 text-primary" />
        <span className="hidden sm:inline">ElevateIQ</span>
      </Link>
      <div className="flex flex-1 justify-center px-2">
        <GlobalSearch />
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />
        <AccountMenu />
      </div>
    </header>
  );
}
