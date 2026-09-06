/**
 * High-level chat-completion entry points that every AI call site routes
 * through. They compose the existing Azure client + `tuneParams` with the
 * reliability layer (timeout / retry / fallback / token limits) and telemetry,
 * so individual call sites stay declarative: they pass semantic options
 * (messages, temperature, budget, operation metadata) and get back a result or
 * a byte stream, exactly as before.
 *
 * Backward compatibility: these helpers preserve the pre-existing behaviour of
 * every call site — `getAzureClient()` still throws `AiNotConfiguredError` when
 * Azure is unconfigured, and that error is *non-transient*, so it propagates
 * immediately to the caller's existing graceful-fallback path (503 / seed
 * questions / demo provider). No public function signature changed.
 */
import type OpenAI from "openai";
import { getAzureClient, MODEL, tuneParams } from "./client";
import {
  assertInputWithinBudget,
  clampOutputTokens,
  errorLabel,
  getFallbackModel,
  getRetryConfig,
  newStats,
  runResilient,
} from "./reliability";
import { newCorrelationId, recordAiCall } from "./telemetry";
import { estimateCost } from "@/services/ai-labs/usage";

type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

export interface AiCallMeta {
  /** Logical operation label for telemetry, e.g. "review.answer". */
  operation: string;
  /** Prompt version (see prompt-versions.ts). */
  promptVersion: string;
  /** Optional caller-supplied correlation id; generated when omitted. */
  correlationId?: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  /** Pass `{ type: "json_object" }` for JSON-mode responses. */
  responseFormat?: { type: "json_object" };
  meta: AiCallMeta;
}

export interface ChatCompletionResult {
  content: string;
  modelUsed: string;
  fallbackUsed: boolean;
  retryCount: number;
  correlationId: string;
  usage?: { inputTokens: number; outputTokens: number };
}

/** Non-streaming completion with reliability + telemetry. */
export async function runChatCompletion(
  req: ChatCompletionRequest,
): Promise<ChatCompletionResult> {
  const correlationId = req.meta.correlationId ?? newCorrelationId();
  const stats = newStats();
  const primaryModel = MODEL;
  const startedAt = Date.now();

  try {
    assertInputWithinBudget(req.messages);
    const completion = await runResilient(
      (model, signal) =>
        getAzureClient().chat.completions.create(
          {
            model,
            ...tuneParams({
              temperature: req.temperature,
              maxTokens: clampOutputTokens(req.maxTokens),
            }),
            ...(req.responseFormat
              ? { response_format: req.responseFormat }
              : {}),
            messages: req.messages,
          },
          { signal, maxRetries: 0 },
        ),
      { primaryModel, fallbackModel: getFallbackModel() },
      getRetryConfig(),
      stats,
    );

    const modelUsed = stats.modelUsed ?? primaryModel;
    const usage = completion.usage
      ? {
          inputTokens: completion.usage.prompt_tokens ?? 0,
          outputTokens: completion.usage.completion_tokens ?? 0,
        }
      : undefined;

    recordAiCall({
      operation: req.meta.operation,
      model: modelUsed,
      promptVersion: req.meta.promptVersion,
      correlationId,
      latencyMs: Date.now() - startedAt,
      success: true,
      retryCount: stats.retryCount,
      fallbackUsed: stats.fallbackUsed,
      streamed: false,
      inputTokens: usage?.inputTokens,
      outputTokens: usage?.outputTokens,
      estimatedCostUsd: usage ? estimateCost(usage, modelUsed) : undefined,
    });

    return {
      content: completion.choices[0]?.message?.content ?? "",
      modelUsed,
      fallbackUsed: stats.fallbackUsed,
      retryCount: stats.retryCount,
      correlationId,
      usage,
    };
  } catch (err) {
    recordAiCall({
      operation: req.meta.operation,
      model: stats.modelUsed ?? primaryModel,
      promptVersion: req.meta.promptVersion,
      correlationId,
      latencyMs: Date.now() - startedAt,
      success: false,
      retryCount: stats.retryCount,
      fallbackUsed: stats.fallbackUsed,
      streamed: false,
      errorType: errorLabel(err),
    });
    throw err;
  }
}

export type ChatCompletionStreamRequest = Omit<
  ChatCompletionRequest,
  "responseFormat"
>;

/**
 * Streaming completion. Returns a plain-text `ReadableStream<Uint8Array>` (same
 * contract every streaming call site already exposes). Reliability covers
 * stream *establishment*; telemetry — including token usage captured via
 * `stream_options.include_usage` — is recorded when the stream closes or errors.
 *
 * Establishment errors are thrown (so the caller's try/catch fallback runs);
 * mid-stream errors surface via `controller.error`, matching prior behaviour.
 */
export async function runChatCompletionStream(
  req: ChatCompletionStreamRequest,
): Promise<ReadableStream<Uint8Array>> {
  const correlationId = req.meta.correlationId ?? newCorrelationId();
  const stats = newStats();
  const primaryModel = MODEL;
  const startedAt = Date.now();

  const establish = (model: string, signal: AbortSignal) =>
    getAzureClient().chat.completions.create(
      {
        model,
        ...tuneParams({
          temperature: req.temperature,
          maxTokens: clampOutputTokens(req.maxTokens),
        }),
        stream: true,
        stream_options: { include_usage: true },
        messages: req.messages,
      },
      { signal, maxRetries: 0 },
    );

  let stream: Awaited<ReturnType<typeof establish>>;
  try {
    assertInputWithinBudget(req.messages);
    stream = await runResilient(
      establish,
      { primaryModel, fallbackModel: getFallbackModel() },
      getRetryConfig(),
      stats,
    );
  } catch (err) {
    recordAiCall({
      operation: req.meta.operation,
      model: stats.modelUsed ?? primaryModel,
      promptVersion: req.meta.promptVersion,
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

  const modelUsed = stats.modelUsed ?? primaryModel;
  const encoder = new TextEncoder();
  let outText = "";
  let inputTokens = 0;
  let outputTokens = 0;

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices?.[0]?.delta?.content;
          if (delta) {
            outText += delta;
            controller.enqueue(encoder.encode(delta));
          }
          if (chunk.usage) {
            inputTokens = chunk.usage.prompt_tokens ?? inputTokens;
            outputTokens = chunk.usage.completion_tokens ?? outputTokens;
          }
        }
        if (inputTokens === 0) {
          inputTokens = estimatePromptTokensFromMessages(req.messages);
        }
        if (outputTokens === 0) {
          outputTokens = Math.max(1, Math.ceil(outText.length / 4));
        }
        recordAiCall({
          operation: req.meta.operation,
          model: modelUsed,
          promptVersion: req.meta.promptVersion,
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
        controller.close();
      } catch (err) {
        recordAiCall({
          operation: req.meta.operation,
          model: modelUsed,
          promptVersion: req.meta.promptVersion,
          correlationId,
          latencyMs: Date.now() - startedAt,
          success: false,
          retryCount: stats.retryCount,
          fallbackUsed: stats.fallbackUsed,
          streamed: true,
          errorType: errorLabel(err),
        });
        controller.error(err);
      }
    },
  });
}

function estimatePromptTokensFromMessages(messages: ChatMessage[]): number {
  return messages.reduce((sum, m) => {
    const len = typeof m.content === "string" ? m.content.length : 0;
    return sum + Math.ceil(len / 4);
  }, 0);
}
