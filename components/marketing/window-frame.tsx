import { cn } from "@/lib/utils";

/**
 * Decorative "app window" chrome used to frame product previews on the landing
 * page. Purely presentational — callers should mark the framed content
 * appropriately for assistive tech.
 */
export function WindowFrame({
  label,
  accentDot = "primary",
  className,
  children,
}: {
  label?: string;
  accentDot?: "primary" | "emerald" | "violet";
  className?: string;
  children: React.ReactNode;
}) {
  const dot =
    accentDot === "emerald"
      ? "bg-emerald-500"
      : accentDot === "violet"
        ? "bg-violet-500"
        : "bg-primary";
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/30",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border bg-background/60 px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
        </span>
        {label && (
          <span className="ml-2 flex items-center gap-1.5 truncate rounded-md bg-muted px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
            <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
            {label}
          </span>
        )}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}
