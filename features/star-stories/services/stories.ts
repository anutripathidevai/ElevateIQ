/**
 * STAR story persistence with the project's dual backend:
 *  - Prisma/Postgres when DATABASE_URL is set.
 *  - An in-memory per-user store otherwise (local/demo mode).
 *
 * All mutations are ownership-scoped by userId so a user can only read or change
 * their own stories. Dates are returned as ISO strings for RSC serialization.
 */
import { db } from "@/lib/db";
import { isDbConfigured } from "@/lib/env";
import {
  createMemoryStore,
  type StoredEntity,
} from "@/features/shared/store/memory-store";
import type { StarStory, StarStoryInput } from "../types";
import { duplicateTitle } from "../utils";

interface StoredStarStory extends StoredEntity, StarStoryInput {}

const memStore = createMemoryStore<StoredStarStory>("star-stories", "st");

/** Shape shared by a Prisma row and an in-memory entity. */
interface StoryRow extends StarStoryInput {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

function toDto(row: StoryRow): StarStory {
  return {
    id: row.id,
    title: row.title,
    situation: row.situation,
    task: row.task,
    action: row.action,
    result: row.result,
    skills: row.skills,
    leadershipPrinciples: row.leadershipPrinciples,
    suggestedQuestions: row.suggestedQuestions,
    tags: row.tags,
    sourceProject: row.sourceProject ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listStories(userId: string): Promise<StarStory[]> {
  if (!isDbConfigured) {
    return memStore.listByUser(userId).map(toDto);
  }
  const rows = await db.starStory.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(toDto);
}

export async function getStory(
  userId: string,
  id: string,
): Promise<StarStory | null> {
  if (!isDbConfigured) {
    const row = memStore.get(id);
    return row && row.userId === userId ? toDto(row) : null;
  }
  const row = await db.starStory.findFirst({ where: { id, userId } });
  return row ? toDto(row) : null;
}

export async function createStory(
  userId: string,
  input: StarStoryInput,
): Promise<StarStory> {
  if (!isDbConfigured) {
    return toDto(memStore.create({ userId, ...input }));
  }
  const row = await db.starStory.create({
    data: { userId, ...input, sourceProject: input.sourceProject ?? null },
  });
  return toDto(row);
}

export async function updateStory(
  userId: string,
  id: string,
  input: StarStoryInput,
): Promise<StarStory | null> {
  if (!isDbConfigured) {
    const existing = memStore.get(id);
    if (!existing || existing.userId !== userId) return null;
    const row = memStore.update(id, { ...input });
    return row ? toDto(row) : null;
  }
  const result = await db.starStory.updateMany({
    where: { id, userId },
    data: { ...input, sourceProject: input.sourceProject ?? null },
  });
  if (result.count === 0) return null;
  return getStory(userId, id);
}

export async function deleteStory(
  userId: string,
  id: string,
): Promise<boolean> {
  if (!isDbConfigured) {
    const existing = memStore.get(id);
    if (!existing || existing.userId !== userId) return false;
    return memStore.remove(id);
  }
  const result = await db.starStory.deleteMany({ where: { id, userId } });
  return result.count > 0;
}

export async function duplicateStory(
  userId: string,
  id: string,
): Promise<StarStory | null> {
  const s = await getStory(userId, id);
  if (!s) return null;
  return createStory(userId, {
    title: duplicateTitle(s.title),
    situation: s.situation,
    task: s.task,
    action: s.action,
    result: s.result,
    skills: s.skills,
    leadershipPrinciples: s.leadershipPrinciples,
    suggestedQuestions: s.suggestedQuestions,
    tags: s.tags,
    sourceProject: s.sourceProject,
  });
}
