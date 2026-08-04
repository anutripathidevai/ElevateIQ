import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Server-side route protection (defense in depth on top of the client
 * {@link AuthGuard}). Runs on the edge and validates the Auth.js session JWT
 * WITHOUT importing the full auth config (which pulls in Prisma + bcrypt and is
 * not edge-compatible).
 *
 * Public content (marketing, /learning, legal, the auth pages themselves and
 * /api/auth) is intentionally NOT matched below, so it stays fully crawlable.
 */

/** Authenticated areas that require a valid session. Mirrors AuthGuard. */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/profile",
  "/panel",
  "/mock",
  "/history",
  "/star-stories",
  "/career",
  "/companies",
  "/practice",
  "/resources",
  "/onboarding",
];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Whether a real auth backend exists. When false (no DB and no OAuth) the app
 * runs in guest/demo mode and we don't gate anything — consistent with the
 * client-side guest provider.
 */
function isAuthAvailable(): boolean {
  const db = Boolean(process.env.DATABASE_URL);
  const google = Boolean(
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
  );
  const github = Boolean(
    process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET,
  );
  return db || google || github;
}

// Treat an empty/whitespace value the same as unset so a blank `AUTH_SECRET=`
// still falls back to the dev secret (kept in sync with lib/auth.ts). In demo
// mode this code path isn't reached (gating is skipped below).
const AUTH_SECRET =
  process.env.AUTH_SECRET?.trim() || "dev-only-insecure-secret-change-me";

async function hasValidSession(req: NextRequest): Promise<boolean> {
  // Auth.js prefixes the cookie with `__Secure-` on HTTPS deployments. Detect
  // which one the browser actually holds so getToken uses the matching salt.
  const secureCookie = req.cookies.has("__Secure-authjs.session-token");
  try {
    const token = await getToken({
      req,
      secret: AUTH_SECRET,
      secureCookie,
    });
    return Boolean(token);
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (!isProtected(pathname)) return NextResponse.next();
  // Demo mode: nothing to authenticate against, so let the app run open.
  if (!isAuthAvailable()) return NextResponse.next();

  if (await hasValidSession(req)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("callbackUrl", `${pathname}${search}`);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/panel/:path*",
    "/mock/:path*",
    "/history/:path*",
    "/star-stories/:path*",
    "/career/:path*",
    "/companies/:path*",
    "/practice/:path*",
    "/resources/:path*",
    "/onboarding/:path*",
  ],
};
