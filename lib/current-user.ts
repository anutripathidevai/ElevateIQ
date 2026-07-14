import { auth } from "@/lib/auth";
import { isDbConfigured } from "@/lib/env";

/** Sentinel id for the local, database-less dev guest. */
export const LOCAL_GUEST_ID = "local-guest";

/**
 * Resolve the acting user id. Signed-in users get their real id. When no
 * database is configured (local dev / demo mode) we fall back to a guest id so
 * AI review and mock interviews remain testable without OAuth — nothing is
 * persisted in that mode. In production (DATABASE_URL set) this returns null
 * for anonymous visitors, so auth gates behave normally.
 */
export async function getUserId(): Promise<string | null> {
  const session = await auth();
  if (session?.user?.id) return session.user.id;
  if (!isDbConfigured) return LOCAL_GUEST_ID;
  return null;
}
