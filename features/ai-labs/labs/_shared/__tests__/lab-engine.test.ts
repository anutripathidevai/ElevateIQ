import { describe, expect, it } from "vitest";
import {
  chunkText,
  cosine,
  estimateTokens,
  rankBySimilarity,
  schemaToSignature,
  tokenize,
  toyEmbed,
  validateAgainstSchema,
  type SchemaField,
} from "../lab-engine";

describe("lab-engine: tokens & tokenize", () => {
  it("estimates tokens at ~4 chars each", () => {
    expect(estimateTokens("")).toBe(0);
    expect(estimateTokens("abcd")).toBe(1);
    expect(estimateTokens("abcdefgh")).toBe(2);
  });

  it("tokenizes to lowercase alphanumeric words", () => {
    expect(tokenize("Hello, World! 123")).toEqual(["hello", "world", "123"]);
  });
});

describe("lab-engine: embeddings & cosine", () => {
  it("produces a fixed-length, deterministic vector", () => {
    const a = toyEmbed("database indexing speeds up reads");
    const b = toyEmbed("database indexing speeds up reads");
    expect(a.length).toBe(96);
    expect(a).toEqual(b);
  });

  it("cosine of identical vectors is ~1 and of disjoint text is lower", () => {
    const q = toyEmbed("make database reads faster with an index");
    const near = toyEmbed("database indexes make reads faster");
    const far = toyEmbed("bake a chocolate cake with butter and sugar");
    expect(cosine(q, q)).toBeCloseTo(1, 5);
    expect(cosine(q, near)).toBeGreaterThan(cosine(q, far));
  });

  it("ranks the most similar item first", () => {
    const docs = [
      { item: "cats and dogs are pets", v: toyEmbed("cats and dogs are pets") },
      { item: "database indexing and query performance", v: toyEmbed("database indexing and query performance") },
      { item: "load balancing across servers", v: toyEmbed("load balancing across servers") },
    ];
    const query = toyEmbed("how to speed up database queries with indexes");
    const ranked = rankBySimilarity(
      query,
      docs.map((d) => ({ item: d.item, vector: d.v })),
      2,
    );
    expect(ranked).toHaveLength(2);
    expect(ranked[0].item).toBe("database indexing and query performance");
    expect(ranked[0].score).toBeGreaterThanOrEqual(ranked[1].score);
  });
});

describe("lab-engine: chunkText", () => {
  it("returns [] for empty text", () => {
    expect(chunkText("   ")).toEqual([]);
    expect(chunkText("")).toEqual([]);
  });

  it("splits into overlapping windows and covers all words", () => {
    const words = Array.from({ length: 100 }, (_, i) => `w${i}`).join(" ");
    const chunks = chunkText(words, 40, 10);
    expect(chunks.length).toBeGreaterThan(1);
    // First chunk has `size` words; consecutive chunks step by size - overlap.
    expect(chunks[0].words).toBe(40);
    expect(chunks[0].text.split(" ")[30]).toBe(chunks[1].text.split(" ")[0]); // 30 = size - overlap
  });

  it("handles text shorter than one chunk", () => {
    const chunks = chunkText("only a few words here", 40, 8);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].words).toBe(5);
  });
});

describe("lab-engine: schema validation", () => {
  const fields: SchemaField[] = [
    { name: "name", type: "string", required: true },
    { name: "age", type: "number" },
    { name: "tags", type: "string[]" },
    { name: "active", type: "boolean" },
  ];

  it("passes a well-formed object", () => {
    const res = validateAgainstSchema(
      { name: "Ada", age: 36, tags: ["a", "b"], active: true },
      fields,
    );
    expect(res.ok).toBe(true);
    expect(res.errors).toEqual([]);
  });

  it("flags a missing required field", () => {
    const res = validateAgainstSchema({ age: 1 }, fields);
    expect(res.ok).toBe(false);
    expect(res.errors.some((e) => e.includes("name"))).toBe(true);
  });

  it("flags type mismatches", () => {
    const res = validateAgainstSchema({ name: "x", age: "old", tags: "nope" }, fields);
    expect(res.ok).toBe(false);
    expect(res.errors.some((e) => e.includes("age"))).toBe(true);
    expect(res.errors.some((e) => e.includes("tags"))).toBe(true);
  });

  it("rejects non-objects", () => {
    expect(validateAgainstSchema(null, fields).ok).toBe(false);
    expect(validateAgainstSchema([1, 2], fields).ok).toBe(false);
    expect(validateAgainstSchema("str", fields).ok).toBe(false);
  });

  it("renders a readable signature", () => {
    const sig = schemaToSignature(fields);
    expect(sig).toContain("name: string;");
    expect(sig).toContain("age?: number;");
  });
});
