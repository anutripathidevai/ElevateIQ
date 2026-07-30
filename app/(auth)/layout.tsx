import Link from "next/link";
import { GraduationCap } from "lucide-react";

/**
 * Minimal, centered shell for authentication flows (login, signup, forgot
 * password, onboarding). Deliberately has no sidebar/topbar so these routes
 * stand apart from the authenticated app shell.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,hsl(var(--primary)/0.14),transparent_70%)]"
      />
      <Link
        href="/"
        className="relative z-10 mb-8 flex items-center gap-2 text-lg font-semibold"
      >
        <GraduationCap className="h-6 w-6 text-primary" />
        ElevateIQ
      </Link>
      <main className="relative z-10 w-full max-w-2xl">{children}</main>
      <p className="relative z-10 mt-8 max-w-md text-center text-xs text-muted-foreground">
        AI-powered career platform for software engineers.
      </p>
    </div>
  );
}
