import { describe, expect, it } from "vitest";
import { createMemoryStore } from "@/features/shared/store/memory-store";

interface Note {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  text: string;
}

describe("shared/memory-store", () => {
  it("creates, reads, lists, updates, and removes per user", () => {
    const store = createMemoryStore<Note>("test-notes", "note");

    const a = store.create({ userId: "u1", text: "first" });
    const b = store.create({ userId: "u1", text: "second" });
    store.create({ userId: "u2", text: "other user" });

    expect(store.get(a.id)?.text).toBe("first");

    const mine = store.listByUser("u1");
    expect(mine).toHaveLength(2);
    // newest first
    expect(mine[0].id).toBe(b.id);

    const updated = store.update(a.id, { text: "edited" });
    expect(updated?.text).toBe("edited");
    expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(
      a.updatedAt.getTime(),
    );

    expect(store.remove(a.id)).toBe(true);
    expect(store.get(a.id)).toBeNull();
    expect(store.listByUser("u1")).toHaveLength(1);
  });

  it("honors the take limit and isolates users", () => {
    const store = createMemoryStore<Note>("test-notes-2", "note");
    for (let i = 0; i < 5; i++) store.create({ userId: "u1", text: `n${i}` });
    expect(store.listByUser("u1", { take: 2 })).toHaveLength(2);
    expect(store.listByUser("nobody")).toHaveLength(0);
  });

  it("returns null when updating or removing a nonexistent id", () => {
    const store = createMemoryStore<Note>("test-notes-3", "note");
    expect(store.update("missing", { text: "x" })).toBeNull();
    expect(store.remove("missing")).toBe(false);
  });
});
