import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isDbConfigured } from "@/lib/env";
import { signupSchema, validate } from "@/lib/auth-validation";
import { hashPassword } from "@/lib/password";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Email/password account registration.
 *
 * Security notes:
 *  - Passwords are validated server-side (authoritative) then bcrypt-hashed;
 *    plaintext is never stored, logged, or returned.
 *  - The response never includes the password hash or other sensitive fields.
 *  - Registration requires a database. When none is configured we say so plainly
 *    rather than pretending to create an account.
 *
 * After a 200 the client completes sign-in via the Credentials provider, so this
 * endpoint deliberately does not issue a session itself.
 */
export async function POST(req: Request) {
  if (!isDbConfigured) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Account sign-up is temporarily unavailable. Please try again shortly.",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 400 },
    );
  }

  const result = validate(signupSchema, body);
  if (!result.success) {
    return NextResponse.json(
      { ok: false, error: "Please check your details.", fields: result.errors },
      { status: 400 },
    );
  }

  const { fullName, email, password } = result.data;

  try {
    const existing = await db.user.findUnique({
      where: { email },
      select: { id: true, passwordHash: true },
    });

    if (existing?.passwordHash) {
      // An email/password account already exists. This is standard signup UX;
      // login stays generic to avoid enumeration there.
      return NextResponse.json(
        {
          ok: false,
          error:
            "An account with this email already exists. Please sign in instead.",
        },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);

    if (existing) {
      // A row exists without a password (e.g. previously signed in with Google).
      // Attach a password to the SAME account instead of creating a duplicate —
      // this links email/password to the existing OAuth identity.
      await db.user.update({
        where: { id: existing.id },
        data: { passwordHash, name: fullName },
      });
    } else {
      await db.user.create({
        data: { email, name: fullName, passwordHash },
      });
    }

    // Return only non-sensitive fields.
    return NextResponse.json({ ok: true, user: { email, name: fullName } });
  } catch (error) {
    console.error("[auth] register failed:", error);
    return NextResponse.json(
      {
        ok: false,
        error:
          "We're temporarily unable to create your account. Please try again shortly.",
      },
      { status: 503 },
    );
  }
}
