/**
 * Mock-interview persistence with two backends chosen at runtime:
 *  - Prisma/Postgres when DATABASE_URL is set.
 *  - An in-memory Map when it isn't (local dev). The Map lives on globalThis so
 *    it survives Next.js hot reloads within the same dev process. Transcripts
 *    are lost on restart, which is fine for local testing.
 */
import type { Prisma, TrackKey } from "@prisma/client";
import { db } from "@/lib/db";
import { isDbConfigured } from "@/lib/env";
import type { ChatMessage } from "@/services/ai/mock";

/** Session persona: a scored interview, or a helpful tutor conversation. */
export type MockMode = "interview" | "tutor";

export interface MockRecord {
  id: string;
  userId: string;
  trackKey: TrackKey;
  /** Optional problem this session is scoped to (LLD discuss / mock). */
  problemSlug: string | null;
  mode: MockMode;
  transcript: ChatMessage[];
  createdAt: Date;
}

const globalForMocks = globalThis as unknown as {
  __mockStore?: Map<string, MockRecord>;
};
const memStore = globalForMocks.__mockStore ?? new Map<string, MockRecord>();
globalForMocks.__mockStore = memStore;

function genId(): string {
  return "m_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export async function createMock(input: {
  userId: string;
  trackKey: TrackKey;
  transcript: ChatMessage[];
  problemSlug?: string | null;
  mode?: MockMode;
}): Promise<{ id: string }> {
  const problemSlug = input.problemSlug ?? null;
  const mode: MockMode = input.mode ?? "interview";
  if (!isDbConfigured) {
    const id = genId();
    memStore.set(id, {
      id,
      createdAt: new Date(),
      userId: input.userId,
      trackKey: input.trackKey,
      transcript: input.transcript,
      problemSlug,
      mode,
    });
    return { id };
  }
  const row = await db.mockInterview.create({
    data: {
      userId: input.userId,
      trackKey: input.trackKey,
      problemSlug,
      mode,
      transcript: input.transcript as unknown as Prisma.InputJsonValue,
    },
    select: { id: true },
  });
  return { id: row.id };
}

export async function getMock(id: string): Promise<MockRecord | null> {
  if (!isDbConfigured) return memStore.get(id) ?? null;
  const row = await db.mockInterview.findUnique({ where: { id } });
  if (!row) return null;
  return {
    id: row.id,
    userId: row.userId,
    trackKey: row.trackKey,
    problemSlug: row.problemSlug ?? null,
    mode: (row.mode as MockMode) ?? "interview",
    transcript: (row.transcript as unknown as ChatMessage[]) ?? [],
    createdAt: row.createdAt,
  };
}

export async function saveTranscript(
  id: string,
  transcript: ChatMessage[],
): Promise<void> {
  if (!isDbConfigured) {
    const rec = memStore.get(id);
    if (rec) rec.transcript = transcript;
    return;
  }
  await db.mockInterview.update({
    where: { id },
    data: { transcript: transcript as unknown as Prisma.InputJsonValue },
  });
}

export async function listRecentMocks(
  userId: string,
  take = 6,
): Promise<
  { id: string; trackKey: TrackKey; problemSlug: string | null; mode: MockMode; createdAt: Date }[]
> {
  if (!isDbConfigured) {
    return Array.from(memStore.values())
      .filter((m) => m.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, take)
      .map(({ id, trackKey, problemSlug, mode, createdAt }) => ({
        id,
        trackKey,
        problemSlug,
        mode,
        createdAt,
      }));
  }
  const rows = await db.mockInterview.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      trackKey: true,
      problemSlug: true,
      mode: true,
      createdAt: true,
    },
  });
  return rows.map((r) => ({
    id: r.id,
    trackKey: r.trackKey,
    problemSlug: r.problemSlug ?? null,
    mode: (r.mode as MockMode) ?? "interview",
    createdAt: r.createdAt,
  }));
}
