import { getUserId } from "@/lib/current-user";
import { aiLabsLlmSchema } from "@/lib/validation";
import { AiNotConfiguredError } from "@/services/ai/client";
import { getLLMProvider } from "@/services/ai-labs/providers";
import type { LLMMessage } from "@/services/ai-labs/providers/types";
import { guardAndCount, settleUsage } from "@/services/ai-labs/gateway";
import { estimateCost } from "@/services/ai-labs/usage";
import { ExecutionTrace } from "@/services/ai-labs/execution";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * POST /api/ai-labs/llm — Lab 1 LLM Playground.
 *
 * Streams the model response as newline-delimited JSON (NDJSON) events so the
 * client can render tokens, a live execution trace, and final usage:
 *   {"type":"trace", step:{label,atMs,durationMs,status,detail}}
 *   {"type":"token", text}
 *   {"type":"done",  model, demo, inputTokens, outputTokens, latencyMs, costUsd, usage:{used,limit,remaining}}
 *   {"type":"error", message}
 *
 * Works with or without Azure configured (falls back to a labelled demo
 * provider) so the lab runs in the guest-mode deployment. Usage is guarded and
 * counted in-memory per user (no DB in Phase 1).
 */
export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return json({ error: "Please sign in to run AI Labs." }, 401);

  const body = await req.json().catch(() => null);
  const parsed = aiLabsLlmSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, 400);
  }

  const guard = guardAndCount(userId);
  if (!guard.ok) {
    return json({ error: guard.reason, usage: guard.usage }, 429);
  }

  const { systemPrompt, userPrompt, temperature, maxTokens } = parsed.data;
  const messages: LLMMessage[] = [];
  if (systemPrompt && systemPrompt.trim()) {
    messages.push({ role: "system", content: systemPrompt.trim() });
  }
  messages.push({ role: "user", content: userPrompt });

  const encoder = new TextEncoder();
  const trace = new ExecutionTrace();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: unknown) =>
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      const sendStep = (label: string, detail?: string) =>
        send({ type: "trace", step: trace.step(label, detail) });

      try {
        sendStep("Validate + usage guard", `Run ${guard.usage.used}/${guard.usage.limit} today`);

        const provider = getLLMProvider();
        sendStep(
          "Select provider",
          provider.demo ? "Azure not configured — using demo provider" : `Azure OpenAI (${provider.model})`,
        );

        const iterator = provider.stream(messages, { temperature, maxTokens });
        let firstToken = true;
        let next = await iterator.next();
        while (!next.done) {
          if (firstToken) {
            sendStep("First token", "Model started responding");
            firstToken = false;
          }
          send({ type: "token", text: next.value.delta });
          next = await iterator.next();
        }
        const result = next.value;

        sendStep("Stream complete", `${result.usage.outputTokens} output tokens`);
        settleUsage(userId, result.usage, result.model);

        const costUsd = estimateCost(result.usage, result.model);
        send({
          type: "done",
          model: result.model,
          demo: result.demo,
          inputTokens: result.usage.inputTokens,
          outputTokens: result.usage.outputTokens,
          latencyMs: trace.totalMs(),
          costUsd,
          usage: {
            used: guard.usage.used,
            limit: guard.usage.limit,
            remaining: guard.usage.remaining,
          },
        });
        controller.close();
      } catch (err) {
        const message =
          err instanceof AiNotConfiguredError
            ? err.message
            : "The AI request failed. Please try again.";
        if (!(err instanceof AiNotConfiguredError)) {
          console.error("AI Labs LLM error:", err);
        }
        try {
          send({ type: "trace", step: trace.step("Error", message, "error") });
          send({ type: "error", message });
        } catch {
          /* controller already closed */
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
    },
  });
}
