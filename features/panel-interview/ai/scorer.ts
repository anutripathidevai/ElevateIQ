import { getAzureClient, MODEL, tuneParams } from "@/services/ai/client";
import type { PanelInterview, PanelResult } from "../types";
import { formatTranscript, heuristicScorecard } from "../utils";
import { buildScorecardPrompt } from "./prompts";
import { panelResultSchema } from "./schemas";

/** Strip accidental ```json fences before parsing model output. */
function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fenced ? fenced[1] : raw).trim();
}

/**
 * Produce the end-of-interview scorecard via Azure OpenAI. Throws
 * `AiNotConfiguredError` if Azure isn't configured — callers fall back to
 * {@link heuristicScorecard}.
 */
export async function generateScorecard(
  interview: Pick<PanelInterview, "role" | "focus" | "transcript">,
): Promise<PanelResult> {
  const client = getAzureClient();
  const { system, user } = buildScorecardPrompt(
    { role: interview.role, focus: interview.focus },
    formatTranscript(interview.transcript),
  );

  const completion = await client.chat.completions.create({
    model: MODEL,
    ...tuneParams({ temperature: 0.3, maxTokens: 1800 }),
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = panelResultSchema.safeParse(JSON.parse(extractJson(raw)));
  if (!parsed.success) {
    throw new Error("The AI returned an unexpected format. Please try again.");
  }
  return { ...parsed.data, aiGenerated: true };
}

/** Re-exported so callers have a single scoring entry point. */
export { heuristicScorecard };
