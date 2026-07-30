/**
 * Print row counts for the key ElevateIQ tables using the generated Prisma
 * client. Reads DATABASE_URL from the environment. Used by the Azure runbook
 * scripts (migrate-and-seed / validate-db) to confirm the schema + seed.
 *
 * Usage:
 *   $env:DATABASE_URL = 'postgresql://...sslmode=require'
 *   node scripts/azure/db-counts.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const tables = [
  "problem",
  "user",
  "submission",
  "starStory",
  "panelInterview",
  "questionBookmark",
];

try {
  for (const t of tables) {
    const count = await prisma[t].count();
    console.log(`  ${t.padEnd(18)} ${count}`);
  }
} catch (err) {
  console.error("DB count failed:", err.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
