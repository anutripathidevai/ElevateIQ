/**
 * Seed the question bank from content/*.json (idempotent — upserts by slug).
 * Run with: npm run db:seed
 */
import { PrismaClient, type TrackKey, type Difficulty } from "@prisma/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const prisma = new PrismaClient();

const SOURCES: { file: string; track: TrackKey }[] = [
  { file: "dsa.json", track: "DSA" },
  { file: "system-design.json", track: "SYSTEM_DESIGN" },
  { file: "lld.json", track: "LLD" },
  { file: "behavioral.json", track: "BEHAVIORAL" },
];

type SeedProblem = {
  slug: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  statementMD: string;
  constraints?: string;
  hints?: string[];
  referenceSolution?: string;
  judge?: unknown;
  solution?: unknown;
};

async function main() {
  const contentDir = join(process.cwd(), "content");
  let total = 0;

  for (const { file, track } of SOURCES) {
    const items = JSON.parse(
      readFileSync(join(contentDir, file), "utf8"),
    ) as SeedProblem[];

    for (const p of items) {
      const data = {
        track,
        title: p.title,
        difficulty: p.difficulty,
        tags: p.tags ?? [],
        statementMD: p.statementMD,
        constraints: p.constraints ?? null,
        hints: p.hints ?? [],
        referenceSolution: p.referenceSolution ?? null,
        judgeSpec: p.judge ?? undefined,
        solution: p.solution ?? undefined,
      };
      await prisma.problem.upsert({
        where: { slug: p.slug },
        create: { slug: p.slug, ...data },
        update: data,
      });
      total++;
    }
    console.log(`  ${track.padEnd(14)} ${items.length} problems (${file})`);
  }

  console.log(`\nSeed complete: ${total} problems upserted.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
