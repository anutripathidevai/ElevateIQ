"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "./auth-provider";
import { SignupPrompt } from "./signup-prompt";

function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

/**
 * Path prefixes rendered inside the app shell that are nonetheless PUBLIC —
 * educational content that should be readable by everyone (including logged-out
 * visitors and search-engine crawlers) so it is fully indexable. Everything else
 * under `(app)` stays gated. Keep this list conservative: only non-personal,
 * content-driven routes belong here.
 */
const PUBLIC_APP_PREFIXES = ["/learning"];

function isPublicAppPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return PUBLIC_APP_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Wraps protected areas: redirects unauthenticated users to `/login` once the
 * mock auth state has hydrated. Shows a spinner while loading to avoid flashing
 * protected content or bouncing prematurely.
 *
 * Public content paths (see {@link PUBLIC_APP_PREFIXES}) are exempt from the
 * gate: their content renders on the server for everyone so crawlers can index
 * it, while logged-out visitors get a soft, dismissible sign-up prompt instead
 * of a hard redirect.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isPublic = isPublicAppPath(pathname);

  useEffect(() => {
    if (!isPublic && !isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isPublic, isLoading, isAuthenticated, router]);

  if (isPublic) {
    return (
      <>
        {children}
        <SignupPrompt />
      </>
    );
  }

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
