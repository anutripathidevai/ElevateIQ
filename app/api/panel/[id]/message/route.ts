import { z } from "zod";
import { getUserId } from "@/lib/current-user";
import { isAzureConfigured } from "@/lib/env";
import { AiNotConfiguredError } from "@/services/ai/client";
import { PANEL_PERSONAS } from "@/features/panel-interview/personas";
import {
  fallbackPersonaQuestion,
  streamPersonaReply,
} from "@/features/panel-interview/ai/interviewer";
import {
  getInterview,
  saveTranscript,
} from "@/features/panel-interview/services/interviews";
import type { PanelTurn } from "@/features/panel-interview/types";
import {
  nextPersona,
  personaQuestionCount,
} from "@/features/panel-interview/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({ message: z.string().trim().min(1).max(6000) });

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function textResponse(body: BodyInit) {
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const userId = await getUserId();
  if (!userId) return json({ error: "Please sign in." }, 401);

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Invalid message." }, 400);

  const interview = await getInterview(userId, params.id);
  if (!interview) return json({ error: "Interview not found." }, 404);
  if (interview.status === "completed") {
    return json({ error: "This interview is already complete." }, 400);
  }

  const withCandidate: PanelTurn[] = [
    ...interview.transcript,
    { speaker: "candidate", content: parsed.data.message },
  ];
  const personaId = nextPersona(withCandidate);
  const persona = PANEL_PERSONAS[personaId];
  const ctx = { role: interview.role, focus: interview.focus };

  if (isAzureConfigured) {
    try {
      const stream = await streamPersonaReply(persona, ctx, withCandidate);
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
        await saveTranscript(userId, interview.id, [
          ...withCandidate,
          { speaker: personaId, content: full },
        ]);
      })().catch((e) => console.error("Persist panel transcript failed:", e));

      return textResponse(clientStream);
    } catch (err) {
      if (!(err instanceof AiNotConfiguredError)) {
        console.error("Panel message stream error:", err);
      }
      // Fall through to the non-adaptive seed-question fallback.
    }
  }

  const asked = personaQuestionCount(withCandidate, personaId);
  const content = fallbackPersonaQuestion(persona, asked);
  await saveTranscript(userId, interview.id, [
    ...withCandidate,
    { speaker: personaId, content },
  ]);
  return textResponse(content);
}
