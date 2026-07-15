import * as React from "react";
import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { ACCENT_STYLES, type AccentKey } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/** Section title with optional icon, description and an action on the right. */
export function SectionHeader({
  title,
  description,
  icon: Icon,
  accent = "blue",
  id,
  action,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  accent?: AccentKey;
  id?: string;
  action?: React.ReactNode;
}) {
  const a = ACCENT_STYLES[accent];
  return (
    <div
      id={id}
      className="flex flex-wrap items-end justify-between gap-3 scroll-mt-20"
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", a.bg)}>
            <Icon className={cn("h-5 w-5", a.text)} />
          </span>
        )}
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

/** Generic content card with an optional titled header + action link. */
export function DashboardCard({
  title,
  icon: Icon,
  accent = "blue",
  action,
  className,
  bodyClassName,
  children,
}: {
  title?: string;
  icon?: LucideIcon;
  accent?: AccentKey;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  const a = ACCENT_STYLES[accent];
  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-card text-card-foreground shadow-sm",
        className,
      )}
    >
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            {Icon && <Icon className={cn("h-4 w-4", a.text)} />}
            {title && <h3 className="text-sm font-semibold">{title}</h3>}
          </div>
          {action}
        </header>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

/** A "See all →" style link used in card headers. */
export function CardLink({ href, label = "See all" }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
    >
      {label} <ArrowRight className="h-3 w-3" />
    </Link>
  );
}

/** Horizontal progress bar tinted by accent. */
export function ProgressBar({
  value,
  accent = "blue",
  className,
}: {
  value: number;
  accent?: AccentKey;
  className?: string;
}) {
  const a = ACCENT_STYLES[accent];
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className={cn("h-full rounded-full transition-all", a.solid)}
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}

/** Circular score ring rendered with inline SVG (color via accent). */
export function ScoreRing({
  value,
  accent = "blue",
  size = 72,
  label,
}: {
  value: number;
  accent?: AccentKey;
  size?: number;
  label?: string;
}) {
  const a = ACCENT_STYLES[accent];
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const offset = c - (pct / 100) * c;
  return (
    <div className={cn("relative inline-flex", a.text)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          stroke="currentColor"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-bold text-foreground">
          {label ?? `${pct}%`}
        </span>
      </span>
    </div>
  );
}

/** Compact labelled stat with an icon chip. */
export function StatTile({
  icon: Icon,
  label,
  value,
  accent = "blue",
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  accent?: AccentKey;
}) {
  const a = ACCENT_STYLES[accent];
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
      <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", a.bg)}>
        <Icon className={cn("h-5 w-5", a.text)} />
      </span>
      <div className="min-w-0">
        <p className="text-xl font-bold leading-tight">{value}</p>
        <p className="truncate text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
