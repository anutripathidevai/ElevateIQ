/**
 * Public API for the Graph Algorithms track: pure data-access helpers over the
 * authored content. UI components and route pages import from here so the data
 * source stays swappable and the rendering layer never touches raw arrays.
 */
import { GRAPH_MODULES } from "./modules";
import { GRAPH_PROBLEMS } from "./data";
import type {
  GraphModule,
  GraphModuleStats,
  GraphProblem,
} from "./types";

export type {
  GraphModule,
  GraphModuleStats,
  GraphProblem,
  GraphSolution,
  GraphDifficulty,
  GraphExample,
  Complexity,
  DryRun,
  SimilarProblem,
} from "./types";
export { GRAPH_MODULES } from "./modules";
export { GRAPH_PROBLEMS } from "./data";

/** Total number of problems planned across all modules (authored or not). */
export const PLANNED_PROBLEM_COUNT = GRAPH_MODULES.reduce(
  (n, m) => n + m.problemSlugs.length,
  0,
);

const BY_SLUG = new Map<string, GraphProblem>(
  GRAPH_PROBLEMS.map((p) => [p.slug, p]),
);

/** Authored problems in global learning order (by `order`, then module order). */
export const PROBLEMS_IN_ORDER: GraphProblem[] = [...GRAPH_PROBLEMS].sort(
  (a, b) => a.order - b.order,
);

export function getProblem(slug: string): GraphProblem | undefined {
  return BY_SLUG.get(slug);
}

export function getModule(id: string): GraphModule | undefined {
  return GRAPH_MODULES.find((m) => m.id === id);
}

/** Problems belonging to a module, in the module's declared order. */
export function problemsForModule(moduleId: string): GraphProblem[] {
  const mod = getModule(moduleId);
  if (!mod) return [];
  return mod.problemSlugs
    .map((s) => BY_SLUG.get(s))
    .filter((p): p is GraphProblem => Boolean(p));
}

/** Per-module display stats (only counts authored problems). */
export function moduleStats(): GraphModuleStats[] {
  return GRAPH_MODULES.map((module) => {
    const problems = problemsForModule(module.id);
    return {
      module,
      problems,
      problemCount: problems.length,
      estimatedMinutes: problems.reduce(
        (n, p) => n + p.estimatedSolvingMin,
        0,
      ),
    };
  });
}

/**
 * Previous/next problem in the overall learning order (authored problems only),
 * so navigation links never point at an unwritten page.
 */
export function adjacentProblems(slug: string): {
  prev?: GraphProblem;
  next?: GraphProblem;
} {
  const idx = PROBLEMS_IN_ORDER.findIndex((p) => p.slug === slug);
  if (idx === -1) return {};
  return {
    prev: idx > 0 ? PROBLEMS_IN_ORDER[idx - 1] : undefined,
    next:
      idx < PROBLEMS_IN_ORDER.length - 1
        ? PROBLEMS_IN_ORDER[idx + 1]
        : undefined,
  };
}

/** Distinct, sorted tags across all authored problems (for the overview). */
export function allTags(): string[] {
  const s = new Set<string>();
  for (const p of GRAPH_PROBLEMS) p.tags.forEach((t) => s.add(t));
  return [...s].sort();
}

/** Distinct, sorted companies across all authored problems. */
export function allCompanies(): string[] {
  const s = new Set<string>();
  for (const p of GRAPH_PROBLEMS) p.companies.forEach((c) => s.add(c));
  return [...s].sort();
}

/** Count of authored problems (may be less than PLANNED_PROBLEM_COUNT). */
export const AUTHORED_PROBLEM_COUNT = GRAPH_PROBLEMS.length;
