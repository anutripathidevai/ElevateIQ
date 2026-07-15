import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { ACCENT_STYLES, type AccentKey } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/**
 * Navigational module tile — an icon chip, title, description and a CTA arrow.
 * Renders as a link to the module hub/route.
 */
export function ModuleCard({
  title,
  description,
  href,
  icon: Icon,
  accent = "blue",
  cta = "Open",
  badge,
}: {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accent?: AccentKey;
  cta?: string;
  badge?: string;
}) {
  const a = ACCENT_STYLES[accent];
  return (
    <Link
      href={href}
      className={cn(
        "group flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
        `hover:${a.border}`,
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", a.bg)}>
          <Icon className={cn("h-5 w-5", a.text)} />
        </span>
        {badge && (
          <span className={cn("rounded-full px-2 py-0.5 text-[0.65rem] font-semibold", a.bg, a.text)}>
            {badge}
          </span>
        )}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 flex-1 text-sm text-muted-foreground">{description}</p>
      <span className={cn("mt-4 inline-flex items-center gap-1 text-sm font-medium", a.text)}>
        {cta}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
