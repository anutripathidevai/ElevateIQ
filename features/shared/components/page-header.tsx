import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Consistent page header used across feature screens: optional accent icon,
 * title, supporting description, and a right-aligned actions slot.
 */
export function PageHeader({
  icon,
  title,
  description,
  actions,
  className,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          {icon}
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        </div>
        {description && (
          <p className="max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
