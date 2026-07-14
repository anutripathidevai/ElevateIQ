import { NextResponse } from "next/server";
import { isAzureConfigured, isDbConfigured } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Liveness/readiness probe for Azure (Container Apps / App Service).
 * Returns 200 with a small status payload; never touches external services so
 * it stays fast and cheap.
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    db: isDbConfigured,
    ai: isAzureConfigured,
    time: new Date().toISOString(),
  });
}
