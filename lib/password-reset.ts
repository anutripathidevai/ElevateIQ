import { isEmailConfigured } from "@/lib/env";

/**
 * Password reset service abstraction.
 *
 * The product requirement is explicit: never claim a reset email was sent when
 * the app cannot actually send one. Today no transactional-email provider is
 * configured, so {@link requestPasswordReset} reports the channel as
 * "unavailable" and the UI guides the user to support instead of showing a fake
 * confirmation.
 *
 * When an email provider is later configured (see `isEmailConfigured` in
 * lib/env), this is the single place to implement token generation + delivery —
 * callers and the UI won't need to change their contract.
 */
export type PasswordResetOutcome =
  | { delivery: "email" }
  | { delivery: "unavailable"; reason: "email-not-configured" };

export async function requestPasswordReset(
  _email: string,
): Promise<PasswordResetOutcome> {
  if (!isEmailConfigured) {
    return { delivery: "unavailable", reason: "email-not-configured" };
  }

  // TODO: when email is configured, generate a signed, expiring reset token,
  // persist it, and send the reset link. Intentionally not implemented with a
  // fake success today.
  return { delivery: "email" };
}
