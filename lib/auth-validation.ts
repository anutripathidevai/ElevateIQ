import { z } from "zod";

/**
 * Shared authentication validation — used by both the client forms (for instant
 * feedback) and the server (as the authoritative check). Keeping a single source
 * of truth prevents client/server drift and account-creation bypasses.
 */

/** Minimum password length. Kept usable per the product spec (not overly strict). */
export const PASSWORD_MIN_LENGTH = 8;

/** Normalize an email consistently: trim + lowercase. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Reasonable email shape check. Intentionally permissive to avoid false negatives. */
export const emailSchema = z
  .string()
  .trim()
  .min(1, "Please enter your email address.")
  .email("Please enter a valid email address.")
  .transform(normalizeEmail);

/**
 * Password policy: at least 8 characters, with at least one letter and one
 * number. Deliberately avoids unusual symbol requirements that hurt usability.
 */
export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`)
  .regex(/[A-Za-z]/, "Password must contain at least one letter and one number.")
  .regex(/[0-9]/, "Password must contain at least one letter and one number.");

/** Signup payload validated server-side before any account is created. */
export const signupSchema = z
  .object({
    fullName: z.string().trim().min(1, "Please enter your name.").max(120),
    email: emailSchema,
    password: passwordSchema,
  })
  .strip();

export type SignupValues = z.infer<typeof signupSchema>;

/** Login payload — presence only; never reveal which field/account is wrong. */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Please enter your password."),
});

/**
 * Run a schema and return the first error message per field, in a shape that is
 * convenient for form state. Returns `{ success, data?, errors? }`.
 */
export function validate<T>(
  schema: z.ZodType<T>,
  input: unknown,
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(input);
  if (result.success) return { success: true, data: result.data };
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!errors[key]) errors[key] = issue.message;
  }
  return { success: false, errors };
}
