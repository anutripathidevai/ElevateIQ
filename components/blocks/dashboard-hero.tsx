"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { AiActions } from "@/components/blocks/ai-actions";
import { useAuth } from "@/components/auth/auth-provider";
import { USER_PROFILE } from "@/lib/data/profile";

/**
 * Personalized dashboard hero. Uses the mock authenticated user when present,
 * falling back to the default profile so the page still renders for guests /
 * during hydration.
 */
export function DashboardHero() {
  const { user } = useAuth();

  const firstName = (user?.fullName ?? USER_PROFILE.name).split(" ")[0];
  const targetRole = user?.targetRole ?? USER_PROFILE.targetRole;
  const targetCompany = user?.targetCompany ?? USER_PROFILE.targetCompany;
  const streak = user?.streakDays ?? 12;

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Targeting{" "}
            <span className="font-medium text-foreground">{targetRole}</span> at{" "}
            <span className="font-medium text-foreground">{targetCompany}</span>{" "}
            · You&apos;re on a{" "}
            <span className="font-medium text-foreground">
              {streak}-day streak
            </span>
            . Keep it going.
          </p>
        </div>
        <Link href="/panel" className={cn(buttonVariants(), "gap-2")}>
          <Sparkles className="h-4 w-4" /> Start AI Mock Interview
        </Link>
      </div>
      <div className="mt-4">
        <AiActions
          actions={[
            "Plan my day",
            "What should I study next?",
            "Analyze my weak areas",
          ]}
          context="Your AI Career Coach"
        />
      </div>
    </section>
  );
}
