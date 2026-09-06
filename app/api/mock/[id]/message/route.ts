import { getUserId } from "@/lib/current-user";
import { mockMessageSchema } from "@/lib/validation";
import { AiNotConfiguredError } from "@/services/ai/client";
import { streamMockReply, type ChatMessage } from "@/services/ai/mock";
import { getMock, saveTranscript } from "@/services/mocks";
import { buildProblemContext } from "@/services/mock-context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const userId = await getUserId();
  if (!userId) return json({ error: "Please sign in." }, 401);

  const body = await req.json().catch(() => null);
  const parsed = mockMessageSchema.safeParse(body);
  if (!parsed.success) return json({ error: "Invalid message." }, 400);

  const mock = await getMock(params.id);
  if (!mock || mock.userId !== userId) {
    return json({ error: "Interview not found." }, 404);
  }
  if (mock.mode === "adaptive") {
    return json(
      { error: "Adaptive interviews use a different endpoint." },
      400,
    );
  }

  const history = mock.transcript ?? [];
  const withUser: ChatMessage[] = [
    ...history,
    { role: "user", content: parsed.data.message },
  ];

  try {
    const problem = mock.problemSlug
      ? await buildProblemContext(mock.problemSlug)
      : null;
    const stream = await streamMockReply(mock.trackKey, withUser, {
      mode: mock.mode,
      problem: problem ?? undefined,
    });
    // Tee: one branch streams to the client, the other accumulates to persist.
    const [clientStream, saveStream] = stream.tee();

    void (async () => {
      const reader = saveStream.getReader();
      const decoder = new TextDecoder();
      let full = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value);
      }
      const finalHistory: ChatMessage[] = [
        ...withUser,
        { role: "assistant", content: full },
      ];
      await saveTranscript(mock.id, finalHistory);
    })().catch((e) => console.error("Persist mock transcript failed:", e));

    return new Response(clientStream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    if (err instanceof AiNotConfiguredError) {
      return json({ error: err.message }, 503);
    }
    console.error("Mock message error:", err);
    return json({ error: "The interview AI failed. Please try again." }, 500);
  }
}
