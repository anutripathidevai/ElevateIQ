import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Unit-test config. Tests cover pure logic, services (via the DB-less memory
 * backend), AI prompt builders, and Zod schemas — no DOM required, so we run in
 * the fast Node environment. The `@/` alias mirrors tsconfig paths.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["features/**/*.test.ts", "lib/**/*.test.ts"],
    globals: false,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});
