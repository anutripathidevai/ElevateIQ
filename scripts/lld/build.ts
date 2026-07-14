/**
 * Merge authored LLD solutions into content/lld.json.
 *
 *   npx tsx scripts/lld/build.ts          # validate only (dry run)
 *   npx tsx scripts/lld/build.ts --write  # validate, then write content/lld.json
 *
 * Existing problems get a `solution` attached (other fields untouched). New
 * problems are appended as full problem objects. Java in solutions is
 * reference/illustrative content — it is not compiled or executed.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { LldEntry } from "./entry-types";
import { ENTRIES as SET_A } from "./set-a";
import { ENTRIES as SET_B } from "./set-b";
import { ENTRIES as SET_C } from "./set-c";
import { ENTRIES as SET_D } from "./set-d";

const ALL: LldEntry[] = [...SET_A, ...SET_B, ...SET_C, ...SET_D];

type RawProblem = {
  slug: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  tags?: string[];
  statementMD: string;
  constraints?: string;
  hints?: string[];
  referenceSolution?: string;
  judge?: unknown;
  solution?: unknown;
};

function validate(e: LldEntry): void {
  const s = e.solution;
  if (!s) throw new Error(`${e.slug}: missing solution`);
  if (!s.approachMD?.trim()) throw new Error(`${e.slug}: empty approachMD`);
  if (!Array.isArray(s.steps) || s.steps.length < 3)
    throw new Error(`${e.slug}: expected >=3 steps`);
  for (const st of s.steps) {
    if (!st.title?.trim() || !st.detailMD?.trim())
      throw new Error(`${e.slug}: step missing title/detail`);
  }
  if (!Array.isArray(s.code) || s.code.length < 2)
    throw new Error(`${e.slug}: expected >=2 code files`);
  for (const f of s.code) {
    if (!f.filename?.trim() || !f.content?.trim())
      throw new Error(`${e.slug}: code file missing filename/content`);
    if (f.language !== "java")
      throw new Error(`${e.slug}: ${f.filename} language must be java`);
  }
  if (e.isNew) {
    if (!e.title || !e.statementMD || !e.difficulty)
      throw new Error(`${e.slug}: new problem missing title/statement/difficulty`);
  }
}

function main() {
  const write = process.argv.includes("--write");
  const file = join(process.cwd(), "content", "lld.json");
  const problems = JSON.parse(readFileSync(file, "utf8")) as RawProblem[];
  const bySlug = new Map(problems.map((p) => [p.slug, p]));

  const seen = new Set<string>();
  for (const e of ALL) {
    if (seen.has(e.slug)) throw new Error(`duplicate entry: ${e.slug}`);
    seen.add(e.slug);
    validate(e);

    const existing = bySlug.get(e.slug);
    if (existing) {
      existing.solution = e.solution;
    } else {
      if (!e.isNew)
        throw new Error(`${e.slug}: not in lld.json and not marked isNew`);
      const created: RawProblem = {
        slug: e.slug,
        title: e.title!,
        difficulty: e.difficulty!,
        tags: e.tags ?? [],
        statementMD: e.statementMD!,
        constraints: e.constraints,
        hints: e.hints ?? [],
        referenceSolution: e.referenceSolution,
        solution: e.solution,
      };
      problems.push(created);
      bySlug.set(e.slug, created);
    }
  }

  const withSolution = problems.filter((p) => p.solution).length;
  console.log(
    `Entries: ${ALL.length} | problems total: ${problems.length} | with solution: ${withSolution}`,
  );

  if (write) {
    writeFileSync(file, JSON.stringify(problems, null, 2) + "\n", "utf8");
    console.log(`Wrote ${file}`);
  } else {
    console.log("Dry run OK (pass --write to persist).");
  }
}

main();
