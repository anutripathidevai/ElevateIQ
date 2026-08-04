"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";

function initialsFor(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join("") || "U"
  );
}

/**
 * Account dropdown in the top bar, driven by the mock auth state. Shows the
 * signed-in user's initials, name, and a menu with Profile and Logout.
 */
export function AccountMenu() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (isLoading) {
    return <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-medium hover:bg-accent"
      >
        Sign in
      </Link>
    );
  }

  async function handleLogout() {
    await logout();
    setOpen(false);
    router.replace("/login");
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-9 items-center gap-2 rounded-full border border-border pl-1 pr-2 hover:bg-accent"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {initialsFor(user.fullName)}
        </span>
        <span className="hidden max-w-[120px] truncate text-sm sm:inline">
          {user.fullName.split(" ")[0]}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-11 z-50 w-56 overflow-hidden rounded-xl border border-border bg-card p-1 text-card-foreground shadow-2xl shadow-black/30"
        >
          <div className="border-b border-border px-3 py-2.5">
            <p className="truncate text-sm font-medium">{user.fullName}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <MenuLink href="/profile" icon={UserIcon} onSelect={() => setOpen(false)}>
            Profile
          </MenuLink>
          <MenuLink href="/profile#settings" icon={Settings} onSelect={() => setOpen(false)}>
            Settings
          </MenuLink>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-danger transition-colors hover:bg-danger/10"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  onSelect,
  children,
}: {
  href: string;
  icon: typeof UserIcon;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onSelect}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
      )}
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      {children}
    </Link>
  );
}
