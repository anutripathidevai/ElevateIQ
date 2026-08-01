import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Compile Ready wordmark + code-style logo mark.
 *
 * The mark (`</>`) doubles as a compact mobile icon when `compact` is set, and
 * is the single source of truth for the brand across the marketing site, the
 * app shell top bar, the mobile drawer, and the auth screens.
 */
export function Logo({
  href = "/",
  compact = false,
  className,
  markClassName,
  onClick,
}: {
  href?: string | null;
  /** Render only the icon mark (no wordmark) — used on very small screens. */
  compact?: boolean;
  className?: string;
  markClassName?: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span
        aria-hidden
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono text-[13px] font-bold leading-none tracking-tighter text-primary ring-1 ring-inset ring-primary/25",
          markClassName,
        )}
      >
        &lt;/&gt;
      </span>
      {!compact && (
        <span className="text-[15px] font-semibold tracking-tight text-foreground">
          Compile <span className="text-foreground/90">Ready</span>
        </span>
      )}
    </>
  );

  const base =
    "inline-flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  if (href === null) {
    return (
      <span className={cn(base, className)} aria-label="Compile Ready">
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label="Compile Ready — home"
      className={cn(base, className)}
    >
      {content}
    </Link>
  );
}
