import type OpenAI from "openai";
import {
  runChatCompletion,
  runChatCompletionStream,
} from "@/services/ai/completion";
import { PROMPT_VERSIONS } from "@/services/ai/prompt-versions";
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
  const { content } = await runChatCompletion({
    temperature: 0.7,
    maxTokens: 220,
    meta: {
      operation: "panel.opening",
      promptVersion: PROMPT_VERSIONS.panelOpening,
    },
    messages: [
      { role: "system", content: buildPersonaSystemPrompt(persona, ctx) },
      { role: "user", content: OPENING_INSTRUCTION },
    ],
  });
  return content || persona.seedQuestions[0];
}

/** Stream a persona's next question as a plain-text ReadableStream. */
export async function streamPersonaReply(
  persona: PanelPersona,
  ctx: InterviewContext,
  transcript: readonly PanelTurn[],
): Promise<ReadableStream<Uint8Array>> {
  return runChatCompletionStream({
    temperature: 0.75,
    maxTokens: 320,
    meta: {
      operation: "panel.reply",
      promptVersion: PROMPT_VERSIONS.panelReply,
    },
    messages: toChatMessages(persona, ctx, transcript),
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
