"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "./auth-provider";

function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

/**
 * Wraps protected areas: redirects unauthenticated users to `/login` once the
 * mock auth state has hydrated. Shows a spinner while loading to avoid flashing
 * protected content or bouncing prematurely.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) return <FullPageSpinner />;
  if (!isAuthenticated) return <FullPageSpinner />;
  return <>{children}</>;
}

/**
 * Wraps guest-only pages (login/signup): redirects already-authenticated users
 * to `/dashboard`. Renders children immediately (even while hydrating) so the
 * form appears without a spinner flash for the common unauthenticated visitor;
 * only an authenticated user is briefly held while being redirected away.
 */
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  if (!isLoading && isAuthenticated) return <FullPageSpinner />;
  return <>{children}</>;
}
