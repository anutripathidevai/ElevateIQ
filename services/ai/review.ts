import type { TrackKey } from "@prisma/client";
import { getAzureClient, MODEL, tuneParams } from "./client";
import { reviewSchema, type Review } from "./schemas";
import { buildReviewPrompt, type ReviewPromptContext } from "./prompts";

/** Strip accidental ```json fences before parsing. */
function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fenced ? fenced[1] : raw).trim();
}

export async function reviewAnswer(
  track: TrackKey,
  ctx: ReviewPromptContext,
): Promise<Review> {
  const client = getAzureClient();
  const { system, user } = buildReviewPrompt(track, ctx);

  const completion = await client.chat.completions.create({
    model: MODEL,
    ...tuneParams({ temperature: 0.2, maxTokens: 1200 }),
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = reviewSchema.safeParse(JSON.parse(extractJson(raw)));
  if (!parsed.success) {
    throw new Error("The AI returned an unexpected format. Please try again.");
  }
  return parsed.data;
}
