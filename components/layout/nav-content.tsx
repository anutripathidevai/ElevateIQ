"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { NAV_GROUPS, ACCENT_STYLES } from "@/lib/navigation";
import { cn } from "@/lib/utils";

function basePath(href: string) {
  return href.split("#")[0];
}

/**
 * Shared collapsible navigation body used by both the desktop sidebar and the
 * mobile drawer. Groups auto-expand when they contain the active route; the
 * Dashboard group has no children and renders as a single link.
 */
export function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  const isGroupActive = (groupHref: string, items: { href: string }[]) => {
    const paths = [basePath(groupHref), ...items.map((i) => basePath(i.href))];
    return paths.some(
      (p) => pathname === p || (p !== "/" && pathname.startsWith(`${p}/`)),
    );
  };

  return (
    <nav className="space-y-1.5 p-3">
      {NAV_GROUPS.map((group) => {
        const accent = ACCENT_STYLES[group.accent];
        const GroupIcon = group.icon;
        const groupActive = isGroupActive(group.href, group.items);

        if (group.items.length === 0) {
          const active = pathname === basePath(group.href);
          return (
            <Link
              key={group.id}
              href={group.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? cn(accent.bg, accent.text)
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              <GroupIcon className="h-4 w-4" />
              {group.label}
            </Link>
          );
        }

        return (
          <NavGroupBlock
            key={group.id}
            groupId={group.id}
            label={group.label}
            href={group.href}
            groupIcon={GroupIcon}
            accentText={accent.text}
            accentBg={accent.bg}
            defaultOpen={groupActive}
            items={group.items}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        );
      })}
    </nav>
  );
}

function NavGroupBlock({
  label,
  href,
  groupIcon: GroupIcon,
  accentText,
  accentBg,
  defaultOpen,
  items,
  pathname,
  onNavigate,
}: {
  groupId: string;
  label: string;
  href: string;
  groupIcon: React.ComponentType<{ className?: string }>;
  accentText: string;
  accentBg: string;
  defaultOpen: boolean;
  items: { href: string; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string }[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent/50"
      >
        <span className={cn("flex h-6 w-6 items-center justify-center rounded-md", accentBg)}>
          <GroupIcon className={cn("h-4 w-4", accentText)} />
        </span>
        <span className="flex-1 text-left">{label}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="mt-1 space-y-0.5 pl-4">
          {items.map((item) => {
            const itemPath = basePath(item.href);
            const hasHash = item.href.includes("#");
            const active = !hasHash && pathname === itemPath;
            const ItemIcon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-1.5 text-sm transition-colors",
                  active
                    ? cn(accentBg, accentText, "font-medium")
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                <ItemIcon className="h-3.5 w-3.5" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className={cn("rounded-full px-1.5 py-0.5 text-[0.6rem] font-semibold", accentBg, accentText)}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
