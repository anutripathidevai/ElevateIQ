import { NextResponse } from "next/server";
import { getUserId } from "@/lib/current-user";
import { reviewRequestSchema } from "@/lib/validation";
import { checkDailyAiLimit } from "@/lib/rate-limit";
import { getProblemBySlug } from "@/services/problems";
import { reviewAnswer } from "@/services/ai/review";
import { AiNotConfiguredError } from "@/services/ai/client";
import { createSubmission } from "@/services/submissions";
import { recordAttempt } from "@/services/progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { slug: string } },
) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json(
      { error: "Please sign in to get an AI review." },
      { status: 401 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = reviewRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  const problem = await getProblemBySlug(params.slug);
  if (!problem) {
    return NextResponse.json({ error: "Problem not found." }, { status: 404 });
  }

  const limit = await checkDailyAiLimit(userId);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Daily AI limit reached (${limit.limit}). Try again tomorrow.` },
      { status: 429 },
    );
  }

  try {
    const review = await reviewAnswer(problem.track, {
      title: problem.title,
      statementMD: problem.statementMD,
      constraints: problem.constraints,
      referenceSolution: problem.referenceSolution,
      language: parsed.data.language,
      answer: parsed.data.content,
    });

    await createSubmission({
      userId,
      problemId: problem.id,
      language: parsed.data.language,
      content: parsed.data.content,
      review,
    });
    await recordAttempt({ userId, problemId: problem.id, score: review.score });

    return NextResponse.json({ review });
  } catch (err) {
    if (err instanceof AiNotConfiguredError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error("Review error:", err);
    return NextResponse.json(
      { error: "The AI review failed. Please try again." },
      { status: 500 },
    );
  }
}
