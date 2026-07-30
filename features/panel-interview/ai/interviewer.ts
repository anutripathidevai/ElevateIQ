import type OpenAI from "openai";
import { getAzureClient, MODEL, tuneParams } from "@/services/ai/client";
import { PANEL_PERSONAS } from "../personas";
import type { PanelPersona, PanelTurn } from "../types";
import {
  buildPersonaSystemPrompt,
  OPENING_INSTRUCTION,
  type InterviewContext,
} from "./prompts";

/** Map a stored transcript to chat messages from the current persona's view. */
function toChatMessages(
  persona: PanelPersona,
  ctx: InterviewContext,
  transcript: readonly PanelTurn[],
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: buildPersonaSystemPrompt(persona, ctx) },
  ];
  for (const turn of transcript) {
    if (turn.speaker === "candidate") {
      messages.push({ role: "user", content: turn.content });
    } else {
      const title = PANEL_PERSONAS[turn.speaker].title;
      messages.push({ role: "assistant", content: `[${title}] ${turn.content}` });
    }
  }
  return messages;
}

/** Generate a persona's opening question (non-streaming). */
export async function generatePersonaOpening(
  persona: PanelPersona,
  ctx: InterviewContext,
): Promise<string> {
  const client = getAzureClient();
  const completion = await client.chat.completions.create({
    model: MODEL,
    ...tuneParams({ temperature: 0.7, maxTokens: 220 }),
    messages: [
      { role: "system", content: buildPersonaSystemPrompt(persona, ctx) },
      { role: "user", content: OPENING_INSTRUCTION },
    ],
  });
  return (
    completion.choices[0]?.message?.content ?? persona.seedQuestions[0]
  );
}

/** Stream a persona's next question as a plain-text ReadableStream. */
export async function streamPersonaReply(
  persona: PanelPersona,
  ctx: InterviewContext,
  transcript: readonly PanelTurn[],
): Promise<ReadableStream<Uint8Array>> {
  const client = getAzureClient();
  const stream = await client.chat.completions.create({
    model: MODEL,
    ...tuneParams({ temperature: 0.75, maxTokens: 320 }),
    stream: true,
    messages: toChatMessages(persona, ctx, transcript),
  });

  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) controller.enqueue(encoder.encode(delta));
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });
}

/**
 * Non-adaptive fallback question used when Azure OpenAI isn't configured, so the
 * panel flow still works end-to-end. Cycles through the persona's seed bank.
 */
export function fallbackPersonaQuestion(
  persona: PanelPersona,
  askedCount: number,
): string {
  const bank = persona.seedQuestions;
  return bank[askedCount % bank.length];
}
