import { estimateTokens } from "./azure-llm";
import type {
  ILLMProvider,
  LLMMessage,
  LLMParams,
  LLMResult,
  LLMStreamChunk,
} from "./types";

/**
 * Offline demo provider. Used when Azure OpenAI is not configured (e.g. the live
 * guest-mode deployment) so the LLM Playground always works. It does NOT call a
 * real model — it synthesises a helpful, clearly-labelled response derived from
 * the user's prompt and sampling params, streamed word by word to mimic real
 * token streaming. The UI shows a "Demo mode" badge whenever `demo` is true.
 */
export class DemoLLMProvider implements ILLMProvider {
  readonly id = "demo";
  readonly model = "demo-model";
  readonly demo = true;

  async *stream(
    messages: LLMMessage[],
    params: LLMParams,
  ): AsyncGenerator<LLMStreamChunk, LLMResult, void> {
    const system = messages.find((m) => m.role === "system")?.content?.trim();
    const user = messages.find((m) => m.role === "user")?.content?.trim() ?? "";
    const temp = params.temperature ?? 0.7;

    const answer = buildDemoAnswer({ system, user, temperature: temp });
    const words = answer.split(/(\s+)/); // keep whitespace tokens for natural flow

    let text = "";
    for (const word of words) {
      text += word;
      yield { delta: word };
      // Small delay so the stream is visibly progressive in the UI.
      await sleep(12);
    }

    const inputTokens = estimateTokens(messages.map((m) => m.content).join("\n"));
    const outputTokens = estimateTokens(text);
    return {
      text,
      usage: { inputTokens, outputTokens },
      model: this.model,
      demo: true,
    };
  }
}

function buildDemoAnswer(opts: {
  system?: string;
  user: string;
  temperature: number;
}): string {
  const { system, user, temperature } = opts;
  const persona = system
    ? `Following your system prompt ("${truncate(system, 120)}"), here is a demo response.`
    : "No system prompt was set, so I am answering as a neutral assistant.";

  const tempNote =
    temperature <= 0.2
      ? "Temperature is low, so a real model would answer this almost identically every time."
      : temperature >= 0.9
        ? "Temperature is high, so a real model would vary its wording noticeably between runs."
        : "Temperature is moderate, balancing consistency and variety.";

  const topic = user ? truncate(user, 160) : "your prompt";

  return [
    "Demo mode is active because Azure OpenAI is not configured on this server, so this text is generated locally rather than by a real model.",
    persona,
    `You asked about: ${topic}`,
    "In a live deployment, this response would stream from the model token by token, and the metrics panel would show the real input/output token counts, latency, and cost.",
    tempNote,
    "Set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY to see genuine model output here.",
  ].join(" ");
}

function truncate(s: string, max: number): string {
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
