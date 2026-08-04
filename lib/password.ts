import bcrypt from "bcryptjs";

/**
 * Password hashing (server-only). Uses bcryptjs — pure JavaScript, so it builds
 * cleanly on the Alpine container and on Windows without native toolchains.
 *
 * A cost factor of 12 is a sensible 2020s default: strong against offline
 * cracking while keeping sign-in latency acceptable.
 */
const BCRYPT_COST = 12;

/** Hash a plaintext password. Never store or log the plaintext. */
export function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, BCRYPT_COST);
}

/**
 * Verify a plaintext password against a stored bcrypt hash. Returns false (never
 * throws) for a missing hash so OAuth-only accounts fail closed.
 */
export async function verifyPassword(
  plaintext: string,
  hash: string | null | undefined,
): Promise<boolean> {
  if (!hash) return false;
  try {
    return await bcrypt.compare(plaintext, hash);
  } catch {
    return false;
  }
}
