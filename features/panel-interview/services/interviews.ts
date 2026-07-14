/**
 * Panel interview persistence with the project's dual backend:
 *  - Prisma/Postgres when DATABASE_URL is set.
 *  - An in-memory per-user store otherwise (local/demo mode).
 *
 * All access is ownership-scoped by userId. Dates are returned as ISO strings
 * and the JSON transcript / result columns are typed on the way in and out.
 */
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { isDbConfigured } from "@/lib/env";
import {
  createMemoryStore,
  type StoredEntity,
} from "@/features/shared/store/memory-store";
import type {
  PanelInterview,
  PanelInterviewSummary,
  PanelResult,
  PanelStatus,
  PanelTurn,
} from "../types";

interface StoredPanel extends StoredEntity {
  role: string;
  focus: string;
  status: PanelStatus;
  transcript: PanelTurn[];
  result: PanelResult | null;
}

const memStore = createMemoryStore<StoredPanel>("panel-interviews", "pi");

interface PanelRow {
  id: string;
  role: string;
  focus: string;
  status: string;
  transcript: unknown;
  result: unknown;
  createdAt: Date;
  updatedAt: Date;
}

function toDto(row: PanelRow): PanelInterview {
  return {
    id: row.id,
    role: row.role,
    focus: row.focus,
    status: (row.status as PanelStatus) ?? "active",
    transcript: (row.transcript as PanelTurn[] | null) ?? [],
    result: (row.result as PanelResult | null) ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toSummary(i: PanelInterview): PanelInterviewSummary {
  return {
    id: i.id,
    role: i.role,
    focus: i.focus,
    status: i.status,
    decision: i.result?.overallRecommendation.decision ?? null,
    turnCount: i.transcript.length,
    createdAt: i.createdAt,
    updatedAt: i.updatedAt,
  };
}

export async function createInterview(
  userId: string,
  input: { role: string; focus: string; transcript: PanelTurn[] },
): Promise<PanelInterview> {
  if (!isDbConfigured) {
    const row = memStore.create({
      userId,
      role: input.role,
      focus: input.focus,
      status: "active",
      transcript: input.transcript,
      result: null,
    });
    return toDto(row);
  }
  const row = await db.panelInterview.create({
    data: {
      userId,
      role: input.role,
      focus: input.focus,
      status: "active",
      transcript: input.transcript as unknown as Prisma.InputJsonValue,
    },
  });
  return toDto(row);
}

export async function getInterview(
  userId: string,
  id: string,
): Promise<PanelInterview | null> {
  if (!isDbConfigured) {
    const row = memStore.get(id);
    return row && row.userId === userId ? toDto(row) : null;
  }
  const row = await db.panelInterview.findFirst({ where: { id, userId } });
  return row ? toDto(row) : null;
}

export async function listInterviews(
  userId: string,
): Promise<PanelInterviewSummary[]> {
  if (!isDbConfigured) {
    return memStore.listByUser(userId).map((r) => toSummary(toDto(r)));
  }
  const rows = await db.panelInterview.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map((r) => toSummary(toDto(r)));
}

export async function saveTranscript(
  userId: string,
  id: string,
  transcript: PanelTurn[],
): Promise<boolean> {
  if (!isDbConfigured) {
    const row = memStore.get(id);
    if (!row || row.userId !== userId) return false;
    return Boolean(memStore.update(id, { transcript }));
  }
  const res = await db.panelInterview.updateMany({
    where: { id, userId },
    data: { transcript: transcript as unknown as Prisma.InputJsonValue },
  });
  return res.count > 0;
}

export async function completeInterview(
  userId: string,
  id: string,
  result: PanelResult,
): Promise<PanelInterview | null> {
  if (!isDbConfigured) {
    const row = memStore.get(id);
    if (!row || row.userId !== userId) return null;
    const updated = memStore.update(id, { status: "completed", result });
    return updated ? toDto(updated) : null;
  }
  const res = await db.panelInterview.updateMany({
    where: { id, userId },
    data: {
      status: "completed",
      result: result as unknown as Prisma.InputJsonValue,
    },
  });
  if (res.count === 0) return null;
  return getInterview(userId, id);
}

export async function deleteInterview(
  userId: string,
  id: string,
): Promise<boolean> {
  if (!isDbConfigured) {
    const row = memStore.get(id);
    if (!row || row.userId !== userId) return false;
    return memStore.remove(id);
  }
  const res = await db.panelInterview.deleteMany({ where: { id, userId } });
  return res.count > 0;
}
