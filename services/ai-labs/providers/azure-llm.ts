import { getAzureClient, MODEL, tuneParams } from "@/services/ai/client";
import type {
  ILLMProvider,
  LLMMessage,
  LLMParams,
  LLMResult,
  LLMStreamChunk,
} from "./types";

/**
 * Real Azure OpenAI provider. Wraps the shared Azure client + `tuneParams`
 * (which handles reasoning-model quirks) behind the provider interface and
 * streams tokens. Requests `stream_options.include_usage` so the final chunk
 * carries exact token counts; if the model omits usage we estimate from text
 * length (~4 chars/token) so the metrics readout always has a value.
 */
export class AzureLLMProvider implements ILLMProvider {
  readonly id = "azure-openai";
  readonly model = MODEL;
  readonly demo = false;

  async *stream(
    messages: LLMMessage[],
    params: LLMParams,
  ): AsyncGenerator<LLMStreamChunk, LLMResult, void> {
    const client = getAzureClient();
    const tuned = tuneParams({
      temperature: params.temperature,
      maxTokens: params.maxTokens,
    });

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: true,
      stream_options: { include_usage: true },
      ...tuned,
    });

    let text = "";
    let inputTokens = 0;
    let outputTokens = 0;

    for await (const chunk of completion) {
      const delta = chunk.choices?.[0]?.delta?.content ?? "";
      if (delta) {
        text += delta;
        yield { delta };
      }
      const usage = chunk.usage;
      if (usage) {
        inputTokens = usage.prompt_tokens ?? inputTokens;
        outputTokens = usage.completion_tokens ?? outputTokens;
      }
    }

    if (inputTokens === 0) {
      inputTokens = estimateTokens(messages.map((m) => m.content).join("\n"));
    }
    if (outputTokens === 0) {
      outputTokens = estimateTokens(text);
    }

    return { text, usage: { inputTokens, outputTokens }, model: MODEL, demo: false };
  }
}

/** Rough token estimate (~4 characters per token) for when usage is missing. */
export function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}
