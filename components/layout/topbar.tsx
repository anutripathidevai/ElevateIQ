import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu, type SessionUser } from "./user-menu";

export function TopBar({
  user,
  providers,
}: {
  user: SessionUser | null;
  providers: string[];
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <GraduationCap className="h-5 w-5 text-primary" />
        InterviewPrep
      </Link>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <UserMenu user={user} providers={providers} />
      </div>
    </header>
  );
}
