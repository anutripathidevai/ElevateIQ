import { getAzureClient, MODEL, tuneParams } from "@/services/ai/client";
import {
  clampOutputTokens,
  errorLabel,
  getFallbackModel,
  getRetryConfig,
  newStats,
  runResilient,
} from "@/services/ai/reliability";
import { newCorrelationId, recordAiCall } from "@/services/ai/telemetry";
import { PROMPT_VERSIONS } from "@/services/ai/prompt-versions";
import { estimateCost } from "@/services/ai-labs/usage";
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
 *
 * Reliability + observability: stream establishment goes through
 * {@link runResilient} (per-attempt timeout, bounded retry on transient errors,
 * optional model fallback) and every run emits a PII-free telemetry event.
 */
export class AzureLLMProvider implements ILLMProvider {
  readonly id = "azure-openai";
  readonly model = MODEL;
  readonly demo = false;

  async *stream(
    messages: LLMMessage[],
    params: LLMParams,
  ): AsyncGenerator<LLMStreamChunk, LLMResult, void> {
    const tuned = tuneParams({
      temperature: params.temperature,
      maxTokens: clampOutputTokens(params.maxTokens),
    });
    const stats = newStats();
    const correlationId = newCorrelationId();
    const startedAt = Date.now();

    let completion: AsyncIterable<{
      choices?: { delta?: { content?: string | null } }[];
      usage?: { prompt_tokens?: number; completion_tokens?: number } | null;
    }>;
    try {
      completion = await runResilient(
        (model, signal) =>
          getAzureClient().chat.completions.create(
            {
              model,
              messages: messages.map((m) => ({
                role: m.role,
                content: m.content,
              })),
              stream: true,
              stream_options: { include_usage: true },
              ...tuned,
            },
            { signal, maxRetries: 0 },
          ),
        { primaryModel: MODEL, fallbackModel: getFallbackModel() },
        getRetryConfig(),
        stats,
      );
    } catch (err) {
      recordAiCall({
        operation: "ai-labs.llm",
        model: stats.modelUsed ?? MODEL,
        promptVersion: PROMPT_VERSIONS.aiLabsLlm,
        correlationId,
        latencyMs: Date.now() - startedAt,
        success: false,
        retryCount: stats.retryCount,
        fallbackUsed: stats.fallbackUsed,
        streamed: true,
        errorType: errorLabel(err),
      });
      throw err;
    }

    const modelUsed = stats.modelUsed ?? MODEL;
    let text = "";
    let inputTokens = 0;
    let outputTokens = 0;

    try {
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
    } catch (err) {
      recordAiCall({
        operation: "ai-labs.llm",
        model: modelUsed,
        promptVersion: PROMPT_VERSIONS.aiLabsLlm,
        correlationId,
        latencyMs: Date.now() - startedAt,
        success: false,
        retryCount: stats.retryCount,
        fallbackUsed: stats.fallbackUsed,
        streamed: true,
        errorType: errorLabel(err),
      });
      throw err;
    }

    if (inputTokens === 0) {
      inputTokens = estimateTokens(messages.map((m) => m.content).join("\n"));
    }
    if (outputTokens === 0) {
      outputTokens = estimateTokens(text);
    }

    recordAiCall({
      operation: "ai-labs.llm",
      model: modelUsed,
      promptVersion: PROMPT_VERSIONS.aiLabsLlm,
      correlationId,
      latencyMs: Date.now() - startedAt,
      success: true,
      retryCount: stats.retryCount,
      fallbackUsed: stats.fallbackUsed,
      streamed: true,
      inputTokens,
      outputTokens,
      estimatedCostUsd: estimateCost({ inputTokens, outputTokens }, modelUsed),
    });

    return {
      text,
      usage: { inputTokens, outputTokens },
      model: modelUsed,
      demo: false,
    };
  }
}

/** Rough token estimate (~4 characters per token) for when usage is missing. */
export function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}
