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
import { isAdaptiveSummary } from "@/features/adaptive-interview/types";

/**
 * Session persona: a scored interview, a helpful tutor conversation, or an
 * adaptive, competency-scored interview.
 */
export type MockMode = "interview" | "tutor" | "adaptive";

export interface MockRecord {
  id: string;
  userId: string;
  trackKey: TrackKey;
  /** Optional problem this session is scoped to (LLD discuss / mock). */
  problemSlug: string | null;
  mode: MockMode;
  transcript: ChatMessage[];
  /**
   * Free-form session state stored in the `summary` JSON column. Used by the
   * adaptive interview to persist competency evaluations + the final scorecard
   * (see features/adaptive-interview). Null for classic interview/tutor sessions.
   */
  summary: unknown | null;
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
  summary?: unknown;
}): Promise<{ id: string }> {
  const problemSlug = input.problemSlug ?? null;
  const mode: MockMode = input.mode ?? "interview";
  const summary = input.summary ?? null;
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
      summary,
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
      ...(summary === null
        ? {}
        : { summary: summary as unknown as Prisma.InputJsonValue }),
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
    summary: (row.summary as unknown) ?? null,
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

/**
 * Persist an adaptive session's transcript and its evaluation/scorecard state
 * (the `summary` JSON column) together, so the two never drift apart.
 */
export async function saveMockState(
  id: string,
  transcript: ChatMessage[],
  summary: unknown,
): Promise<void> {
  if (!isDbConfigured) {
    const rec = memStore.get(id);
    if (rec) {
      rec.transcript = transcript;
      rec.summary = summary;
    }
    return;
  }
  await db.mockInterview.update({
    where: { id },
    data: {
      transcript: transcript as unknown as Prisma.InputJsonValue,
      summary: summary as unknown as Prisma.InputJsonValue,
    },
  });
}

/** Persist only the `summary` JSON (e.g. when finalizing a scorecard). */
export async function saveMockSummary(id: string, summary: unknown): Promise<void> {
  if (!isDbConfigured) {
    const rec = memStore.get(id);
    if (rec) rec.summary = summary;
    return;
  }
  await db.mockInterview.update({
    where: { id },
    data: { summary: summary as unknown as Prisma.InputJsonValue },
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

/** One completed adaptive interview, reduced to its headline score over time. */
export interface AdaptiveScoreEntry {
  id: string;
  trackKey: TrackKey;
  seniority: string;
  overallScore: number;
  createdAt: Date;
}

function toAdaptiveScoreEntry(rec: {
  id: string;
  trackKey: TrackKey;
  summary: unknown;
  createdAt: Date;
}): AdaptiveScoreEntry | null {
  const summary = rec.summary;
  if (!isAdaptiveSummary(summary)) return null;
  if (summary.status !== "completed" || !summary.scorecard) return null;
  return {
    id: rec.id,
    trackKey: rec.trackKey,
    seniority: summary.config.seniority,
    overallScore: summary.scorecard.overallScore,
    createdAt: rec.createdAt,
  };
}

/**
 * Completed adaptive interviews for a user (optionally scoped to one track),
 * reduced to their overall score and sorted oldest-first for trend charts.
 */
export async function listAdaptiveScores(
  userId: string,
  track?: TrackKey,
): Promise<AdaptiveScoreEntry[]> {
  if (!isDbConfigured) {
    return Array.from(memStore.values())
      .filter((m) => m.userId === userId && m.mode === "adaptive")
      .filter((m) => (track ? m.trackKey === track : true))
      .map((m) =>
        toAdaptiveScoreEntry({
          id: m.id,
          trackKey: m.trackKey,
          summary: m.summary,
          createdAt: m.createdAt,
        }),
      )
      .filter((e): e is AdaptiveScoreEntry => e !== null)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  const rows = await db.mockInterview.findMany({
    where: { userId, mode: "adaptive", ...(track ? { trackKey: track } : {}) },
    orderBy: { createdAt: "asc" },
    select: { id: true, trackKey: true, summary: true, createdAt: true },
  });
  return rows
    .map((r) =>
      toAdaptiveScoreEntry({
        id: r.id,
        trackKey: r.trackKey,
        summary: (r.summary as unknown) ?? null,
        createdAt: r.createdAt,
      }),
    )
    .filter((e): e is AdaptiveScoreEntry => e !== null);
}
