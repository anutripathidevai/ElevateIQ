/**
 * Reusable in-memory, per-user store used as the DB-less backend for feature
 * services (mirrors the pattern in services/mocks.ts, minus the boilerplate).
 *
 * Data lives on `globalThis` keyed by namespace so it survives Next.js hot
 * reloads within a single dev process. It is intentionally ephemeral — the
 * real backend is Prisma when `DATABASE_URL` is set. This keeps every feature
 * fully usable in local/demo mode without a database.
 */
import { generateId } from "@/features/shared/utils";

export interface StoredEntity {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateInput<T extends StoredEntity> = Omit<
  T,
  "id" | "createdAt" | "updatedAt"
> &
  Partial<Pick<T, "id" | "createdAt" | "updatedAt">>;

export type UpdatePatch<T extends StoredEntity> = Partial<
  Omit<T, "id" | "userId" | "createdAt" | "updatedAt">
>;

export interface MemoryStore<T extends StoredEntity> {
  create(data: CreateInput<T>): T;
  get(id: string): T | null;
  listByUser(userId: string, opts?: { take?: number }): T[];
  update(id: string, patch: UpdatePatch<T>): T | null;
  remove(id: string): boolean;
}

interface StoreRegistry {
  [namespace: string]: Map<string, StoredEntity>;
}

const globalForStores = globalThis as unknown as {
  __featureMemoryStores?: StoreRegistry;
};

function registry(): StoreRegistry {
  return (globalForStores.__featureMemoryStores ??= {});
}

export function createMemoryStore<T extends StoredEntity>(
  namespace: string,
  idPrefix = "mem",
): MemoryStore<T> {
  const reg = registry();
  const map = (reg[namespace] ??= new Map<string, StoredEntity>()) as Map<
    string,
    T
  >;

  return {
    create(data) {
      const now = new Date();
      const entity = {
        ...data,
        id: data.id ?? generateId(idPrefix),
        createdAt: data.createdAt ?? now,
        updatedAt: data.updatedAt ?? now,
      } as T;
      map.set(entity.id, entity);
      return entity;
    },

    get(id) {
      return map.get(id) ?? null;
    },

    listByUser(userId, opts) {
      // Map preserves insertion order (oldest→newest); reverse to newest-first,
      // then stable-sort by createdAt desc so equal timestamps keep newest-first.
      const items = Array.from(map.values())
        .filter((e) => e.userId === userId)
        .reverse()
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return typeof opts?.take === "number" ? items.slice(0, opts.take) : items;
    },

    update(id, patch) {
      const existing = map.get(id);
      if (!existing) return null;
      const next = { ...existing, ...patch, updatedAt: new Date() } as T;
      map.set(id, next);
      return next;
    },

    remove(id) {
      return map.delete(id);
    },
  };
}
