import { getAzureClient, MODEL, tuneParams } from "@/services/ai/client";
import type { GeneratedStarStory } from "../types";
import { buildStarPrompt } from "./prompts";
import {
  starGenerationInputSchema,
  starGenerationResultSchema,
  type StarGenerationInput,
} from "./schemas";

/** Strip accidental ```json fences before parsing model output. */
function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fenced ? fenced[1] : raw).trim();
}

/**
 * Generate STAR stories from a project description via Azure OpenAI.
 * Throws `AiNotConfiguredError` when Azure isn't configured — callers surface a
 * friendly message and the module still supports fully-manual story authoring.
 */
export async function generateStarStories(
  rawInput: StarGenerationInput,
): Promise<GeneratedStarStory[]> {
  const input = starGenerationInputSchema.parse(rawInput);
  const client = getAzureClient();
  const { system, user } = buildStarPrompt(input);

  const completion = await client.chat.completions.create({
    model: MODEL,
    ...tuneParams({ temperature: 0.6, maxTokens: 2200 }),
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = starGenerationResultSchema.safeParse(
    JSON.parse(extractJson(raw)),
  );
  if (!parsed.success) {
    throw new Error("The AI returned an unexpected format. Please try again.");
  }
  return parsed.data.stories;
}
