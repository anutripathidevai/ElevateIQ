import { AMAZON_LEADERSHIP_PRINCIPLES } from "../types";
import type { StarGenerationInput } from "./schemas";

/**
 * Prompt templates for the STAR Story Generator. Kept in a dedicated module so
 * prompt wording can be iterated and reviewed independently of the service and
 * UI code that consume it.
 */

export interface BuiltPrompt {
  system: string;
  user: string;
}

function looksLikeAmazon(company?: string): boolean {
  return Boolean(company && /amazon|aws/i.test(company));
}

export function buildStarPrompt(input: StarGenerationInput): BuiltPrompt {
  const { project, role, company, count, focus } = input;

  const principlesHint = looksLikeAmazon(company)
    ? `The candidate is targeting Amazon, so map each story to the most relevant Amazon Leadership Principles from this list: ${AMAZON_LEADERSHIP_PRINCIPLES.join(", ")}.`
    : "Map each story to widely-recognized leadership values (e.g. Ownership, Customer Focus, Collaboration, Bias for Action, Dealing with Ambiguity).";

  const system = [
    "You are an expert behavioral interview coach for software engineers.",
    "You transform a candidate's raw project notes into polished STAR stories",
    "(Situation, Task, Action, Result) that are specific, quantified, and told",
    "in the first person ('I'/'we', with a clear personal contribution).",
    "",
    "Rules:",
    "- Each story must be genuinely distinct (different angle, challenge, or outcome).",
    "- Prefer concrete metrics and scope; if the notes lack numbers, use realistic,",
    "  clearly-estimated figures the candidate can adjust — never invent specific",
    "  company-confidential facts.",
    "- 'result' must state measurable impact.",
    "- 'skills' lists demonstrated technical and soft skills.",
    "- 'suggestedQuestions' lists behavioral questions the story strongly answers.",
    "- 'tags' are 2-4 short lowercase keywords for search/filtering.",
    `- ${principlesHint}`,
    "",
    'Respond with ONLY valid JSON of the shape: {"stories":[{"title","situation",',
    '"task","action","result","skills":[],"leadershipPrinciples":[],',
    '"suggestedQuestions":[],"tags":[]}]}. No markdown, no commentary.',
  ].join("\n");

  const user = [
    `Generate ${count} distinct STAR ${count === 1 ? "story" : "stories"} from the project below.`,
    role ? `Target role: ${role}.` : null,
    company ? `Target company: ${company}.` : null,
    focus ? `Emphasize these skills/principles where truthful: ${focus}.` : null,
    "",
    "Project notes:",
    project,
  ]
    .filter(Boolean)
    .join("\n");

  return { system, user };
}
