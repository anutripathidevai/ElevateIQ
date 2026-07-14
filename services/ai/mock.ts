import type OpenAI from "openai";
import type { TrackKey } from "@prisma/client";
import { getAzureClient, MODEL, tuneParams } from "./client";
import { buildMockSystemPrompt, type MockProblemContext } from "./prompts";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** Optional context that scopes a session to a problem and sets the persona. */
export interface MockContext {
  mode?: "interview" | "tutor";
  problem?: MockProblemContext;
}

/** Non-streaming opening question used when a mock interview is created. */
export async function generateOpening(
  track: TrackKey,
  ctx?: MockContext,
): Promise<string> {
  const client = getAzureClient();
  const kickoff =
    ctx?.mode === "tutor"
      ? "Greet the candidate in 1-2 sentences, say you can explain this problem or run a mock interview on it, and invite their first question."
      : "Please begin the interview with your first question.";
  const completion = await client.chat.completions.create({
    model: MODEL,
    ...tuneParams({ temperature: 0.7, maxTokens: 300 }),
    messages: [
      {
        role: "system",
        content: buildMockSystemPrompt(track, {
          mode: ctx?.mode,
          problem: ctx?.problem,
        }),
      },
      { role: "user", content: kickoff },
    ],
  });
  return (
    completion.choices[0]?.message?.content ??
    "Let's begin. Walk me through a problem you'd like to tackle."
  );
}

/** Stream the interviewer's next reply as a plain-text ReadableStream. */
export async function streamMockReply(
  track: TrackKey,
  history: ChatMessage[],
  ctx?: MockContext,
): Promise<ReadableStream<Uint8Array>> {
  const client = getAzureClient();

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: buildMockSystemPrompt(track, {
        mode: ctx?.mode,
        problem: ctx?.problem,
      }),
    },
    ...history.map((m) => ({ role: m.role, content: m.content })),
  ];

  const stream = await client.chat.completions.create({
    model: MODEL,
    ...tuneParams({ temperature: 0.7, maxTokens: 500 }),
    stream: true,
    messages,
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
