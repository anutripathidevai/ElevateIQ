import { ThemeToggle } from "./theme-toggle";
import { AccountMenu } from "./account-menu";
import { GlobalSearch } from "./global-search";
import { MobileNav } from "./mobile-nav";
import { Logo } from "@/components/marketing/brand";

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
      <MobileNav />
      <Logo className="shrink-0" />
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
