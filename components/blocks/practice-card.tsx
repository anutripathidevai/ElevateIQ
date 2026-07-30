import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ChallengeItem } from "@/lib/dashboard-data";
import { ACCENT_STYLES } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/** Compact challenge/problem tile used across the practice hub and dashboard. */
export function PracticeCard({ item }: { item: ChallengeItem }) {
  const a = ACCENT_STYLES[item.accent];
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", a.bg)}>
        <Icon className={cn("h-5 w-5", a.text)} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{item.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {item.category} · {item.meta}
        </p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
    </Link>
  );
}
