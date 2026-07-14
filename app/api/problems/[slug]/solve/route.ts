import { NextResponse } from "next/server";
import { getUserId } from "@/lib/current-user";
import { isDbConfigured } from "@/lib/env";
import { getProblemBySlug } from "@/services/problems";
import { markSolved } from "@/services/progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Records a problem as solved for the signed-in user.
 *
 * In DB-less guest mode this is a best-effort no-op — the client persists
 * solved state in localStorage — so the code runner works with zero infra and
 * this endpoint becomes meaningful once a database is attached.
 */
export async function POST(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  if (!isDbConfigured) {
    return NextResponse.json({ ok: false, reason: "guest" });
  }

  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json(
      { ok: false, reason: "unauthenticated" },
      { status: 401 },
    );
  }

  const problem = await getProblemBySlug(params.slug);
  if (!problem) {
    return NextResponse.json(
      { ok: false, reason: "not-found" },
      { status: 404 },
    );
  }

  await markSolved({ userId, problemId: problem.id });
  return NextResponse.json({ ok: true });
}
