import type OpenAI from "openai";
import type { TrackKey } from "@prisma/client";
import { runChatCompletion, runChatCompletionStream } from "./completion";
import { PROMPT_VERSIONS } from "./prompt-versions";
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
  const kickoff =
    ctx?.mode === "tutor"
      ? "Greet the candidate in 1-2 sentences, say you can explain this problem or run a mock interview on it, and invite their first question."
      : "Please begin the interview with your first question.";
  const { content } = await runChatCompletion({
    temperature: 0.7,
    maxTokens: 300,
    meta: {
      operation: "mock.opening",
      promptVersion: PROMPT_VERSIONS.mockOpening,
    },
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
    content || "Let's begin. Walk me through a problem you'd like to tackle."
  );
}

/** Stream the interviewer's next reply as a plain-text ReadableStream. */
export async function streamMockReply(
  track: TrackKey,
  history: ChatMessage[],
  ctx?: MockContext,
): Promise<ReadableStream<Uint8Array>> {
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

  return runChatCompletionStream({
    temperature: 0.7,
    maxTokens: 500,
    meta: { operation: "mock.reply", promptVersion: PROMPT_VERSIONS.mockReply },
    messages,
  });
}
