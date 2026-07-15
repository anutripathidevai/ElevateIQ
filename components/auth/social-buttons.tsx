"use client";

import { useRouter } from "next/navigation";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "./auth-provider";

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

function MicrosoftMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#F25022" d="M3 3h8.5v8.5H3z" />
      <path fill="#7FBA00" d="M12.5 3H21v8.5h-8.5z" />
      <path fill="#00A4EF" d="M3 12.5h8.5V21H3z" />
      <path fill="#FFB900" d="M12.5 12.5H21V21h-8.5z" />
    </svg>
  );
}

const PROVIDERS = [
  { id: "google", label: "Continue with Google", icon: <GoogleMark /> },
  { id: "github", label: "Continue with GitHub", icon: <Github className="h-4 w-4" /> },
  { id: "microsoft", label: "Continue with Microsoft", icon: <MicrosoftMark /> },
];

/**
 * Mock social sign-in buttons. Each performs a local mock login and routes to
 * the dashboard — no real OAuth is performed yet.
 */
export function SocialAuthButtons() {
  const { login } = useAuth();
  const router = useRouter();

  function handle(provider: string) {
    login(`demo@${provider}.elevateiq.dev`, "mock");
    router.push("/dashboard");
  }

  return (
    <div className="grid gap-2">
      {PROVIDERS.map((p) => (
        <Button
          key={p.id}
          type="button"
          variant="outline"
          className="w-full justify-center"
          onClick={() => handle(p.id)}
        >
          {p.icon}
          {p.label}
        </Button>
      ))}
    </div>
  );
}
