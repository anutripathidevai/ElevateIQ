"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";

/**
 * Auth-aware primary/secondary calls to action. Labels and destinations adapt
 * to the mock auth state (see {@link useAuth}) exactly as the spec requires:
 *
 *  - Logged out → "Start Preparing" (/signup) · "Explore Learning" (/learning)
 *  - Logged in  → "Continue Learning" (/dashboard) · "Start Mock Interview" (/mock)
 */
export function AuthCtas({
  className,
  size = "lg",
}: {
  className?: string;
  size?: "lg" | "default";
}) {
  const { isAuthenticated } = useAuth();

  const primary = isAuthenticated
    ? { label: "Continue Learning", href: "/dashboard" }
    : { label: "Start Preparing", href: "/signup" };
  const secondary = isAuthenticated
    ? { label: "Start Mock Interview", href: "/mock" }
    : { label: "Explore Learning", href: "/learning" };

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row", className)}>
      <Link
        href={primary.href}
        className={cn(buttonVariants({ size }), "group w-full sm:w-auto")}
      >
        {primary.label}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
      <Link
        href={secondary.href}
        className={cn(
          buttonVariants({ size, variant: "outline" }),
          "group w-full sm:w-auto",
        )}
      >
        {secondary.label}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

/** The compact primary action shown in the navbar. */
export function NavGetStarted({ onClick }: { onClick?: () => void }) {
  const { isAuthenticated } = useAuth();
  const action = isAuthenticated
    ? { label: "Dashboard", href: "/dashboard" }
    : { label: "Get Started", href: "/signup" };

  return (
    <Link
      href={action.href}
      onClick={onClick}
      className={cn(buttonVariants({ size: "sm" }), "group")}
    >
      {action.label}
      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
