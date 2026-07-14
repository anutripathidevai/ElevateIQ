"use client";

import { Github, LogOut } from "lucide-react";
import { login, logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

const PROVIDER_LABELS: Record<string, string> = {
  github: "GitHub",
  google: "Google",
};

export function UserMenu({
  user,
  providers,
}: {
  user: SessionUser | null;
  providers: string[];
}) {
  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="hidden max-w-[160px] truncate text-sm text-muted-foreground sm:inline">
          {user.name ?? user.email}
        </span>
        <form action={logout}>
          <Button variant="ghost" size="icon" aria-label="Sign out" type="submit">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <span className="text-xs text-muted-foreground">
        Sign-in not configured
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {providers.map((provider) => (
        <form key={provider} action={login.bind(null, provider)}>
          <Button variant="outline" size="sm" type="submit">
            {provider === "github" && <Github className="h-4 w-4" />}
            Sign in with {PROVIDER_LABELS[provider] ?? provider}
          </Button>
        </form>
      ))}
    </div>
  );
}
