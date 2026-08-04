"use client";

import { useEffect, useState } from "react";
import { getProviders, signIn } from "next-auth/react";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Simple brand marks for providers lucide-react doesn't ship. */
function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 3.4 14.7 2.5 12 2.5 6.9 2.5 2.8 6.6 2.8 12S6.9 21.5 12 21.5c5.3 0 8.8-3.7 8.8-8.9 0-.6-.06-1-.15-1.4H12z"
      />
    </svg>
  );
}

const PROVIDER_META: Record<
  string,
  { label: string; icon: React.ReactNode }
> = {
  google: { label: "Continue with Google", icon: <GoogleMark /> },
  github: { label: "Continue with GitHub", icon: <Github className="h-4 w-4" /> },
};

/**
 * Real OAuth sign-in buttons. Discovers the configured providers at RUNTIME via
 * Auth.js `getProviders()` (hitting `/api/auth/providers`), so a provider added
 * to the deployment shows up without a rebuild, and one that isn't configured is
 * never rendered. Renders nothing (including its own divider) when no OAuth
 * provider is available. Clicking starts the real Auth.js OAuth redirect flow.
 */
export function SocialAuthButtons() {
  const [ids, setIds] = useState<string[] | null>(null);

  useEffect(() => {
    let active = true;
    getProviders()
      .then((providers) => {
        if (!active) return;
        const all = providers ? Object.keys(providers) : [];
        setIds(all.filter((id) => id in PROVIDER_META));
      })
      .catch(() => {
        if (active) setIds([]);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!ids || ids.length === 0) return null;

  return (
    <>
      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="grid gap-2">
        {ids.map((id) => {
          const meta = PROVIDER_META[id];
          return (
            <Button
              key={id}
              type="button"
              variant="outline"
              className="w-full justify-center"
              onClick={() => signIn(id, { callbackUrl: "/dashboard" })}
            >
              {meta.icon}
              {meta.label}
            </Button>
          );
        })}
      </div>
    </>
  );
}
