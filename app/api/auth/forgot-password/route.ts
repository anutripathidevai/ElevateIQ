import { NextResponse } from "next/server";
import { emailSchema, validate } from "@/lib/auth-validation";
import { requestPasswordReset } from "@/lib/password-reset";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Start a password reset.
 *
 * We never reveal whether an account exists (no enumeration). We DO honestly
 * report whether the email channel is available so the UI can avoid claiming a
 * reset email was sent when it wasn't.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 400 },
    );
  }

  const result = validate(emailSchema, (body as { email?: unknown })?.email);
  if (!result.success) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const outcome = await requestPasswordReset(result.data);
  return NextResponse.json({ ok: true, delivery: outcome.delivery });
}
