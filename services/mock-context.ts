/**
 * Build the problem context injected into a problem-scoped mock/tutor session.
 * Shared by the start-session server action and the streaming message route so
 * both rebuild the same prompt context from a problem slug.
 */
import { getProblemBySlug, getSolution } from "@/services/problems";
import type { MockProblemContext } from "@/services/ai/prompts";

export async function buildProblemContext(
  slug: string,
): Promise<MockProblemContext | null> {
  const problem = await getProblemBySlug(slug);
  if (!problem) return null;

  const solution = await getSolution(slug);
  let solutionOutline: string | null = null;
  if (solution) {
    const patterns = (solution.patterns ?? [])
      .map((p) => `- ${p.name}: ${p.why}`)
      .join("\n");
    solutionOutline = [
      solution.approachMD,
      patterns ? `Patterns:\n${patterns}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  return {
    title: problem.title,
    statementMD: problem.statementMD,
    constraints: problem.constraints,
    solutionOutline,
  };
}
