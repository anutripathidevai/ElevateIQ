/**
 * Company Question Bank content provider. Reads every `content/companies/*.json`
 * file (one per company), validates it against the Zod schema, flattens the
 * questions with their company fields injected, and caches the result. This is
 * pure reference data, so it works identically with or without a database.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  companyFileSchema,
  type CompanyQuestion,
  type CompanySummary,
  type QuestionCategory,
} from "../types";
import { collectCategories } from "../utils";

interface LoadedCompany {
  summary: Omit<CompanySummary, "questionCount" | "categories">;
  questions: CompanyQuestion[];
}

let cache: LoadedCompany[] | null = null;

function contentDir(): string {
  return join(process.cwd(), "content", "companies");
}

function load(): LoadedCompany[] {
  if (cache) return cache;
  const dir = contentDir();
  const companies: LoadedCompany[] = [];

  let files: string[] = [];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  } catch {
    files = [];
  }

  for (const file of files.sort()) {
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(readFileSync(join(dir, file), "utf8"));
    } catch {
      continue;
    }
    const result = companyFileSchema.safeParse(parsedJson);
    if (!result.success) {
      // Fail loudly in dev; skip the bad file rather than crash the whole app.
      console.error(`[company-bank] Invalid content file ${file}:`, result.error.issues);
      continue;
    }
    const { company, slug, glyph, blurb, questions } = result.data;
    companies.push({
      summary: {
        slug,
        name: company,
        glyph: glyph ?? company.charAt(0).toUpperCase(),
        blurb,
      },
      questions: questions.map((q) => ({
        ...q,
        company,
        companySlug: slug,
      })),
    });
  }

  cache = companies;
  return companies;
}

/** All questions across every company. */
export function allQuestions(): CompanyQuestion[] {
  return load().flatMap((c) => c.questions);
}

/** Company cards for the landing grid, with per-company counts + categories. */
export function listCompanies(): CompanySummary[] {
  return load()
    .map(({ summary, questions }) => ({
      ...summary,
      questionCount: questions.length,
      categories: collectCategories(questions),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getCompany(slug: string): CompanySummary | null {
  return listCompanies().find((c) => c.slug === slug) ?? null;
}

export function questionsForCompany(slug: string): CompanyQuestion[] {
  return load().find((c) => c.summary.slug === slug)?.questions ?? [];
}

export function getQuestion(id: string): CompanyQuestion | null {
  return allQuestions().find((q) => q.id === id) ?? null;
}

export function totalQuestionCount(): number {
  return allQuestions().length;
}

export function categoryCounts(): Record<QuestionCategory, number> {
  const counts = { CODING: 0, SYSTEM_DESIGN: 0, BEHAVIORAL: 0, DOMAIN: 0 };
  for (const q of allQuestions()) counts[q.category]++;
  return counts;
}
