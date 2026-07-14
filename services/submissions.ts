import { db } from "@/lib/db";
import { isDbConfigured } from "@/lib/env";
import type { Prisma } from "@prisma/client";
import type { Review } from "@/services/ai/schemas";

export interface CreateSubmissionInput {
  userId: string;
  problemId: string;
  language?: string;
  content: string;
  review: Review;
}

export async function createSubmission(input: CreateSubmissionInput) {
  // Local dev without a database: skip persistence, still return the review flow.
  if (!isDbConfigured) return null;
  return db.submission.create({
    data: {
      userId: input.userId,
      problemId: input.problemId,
      language: input.language,
      content: input.content,
      aiFeedback: input.review as unknown as Prisma.InputJsonValue,
      score: input.review.score,
    },
  });
}

export async function listUserSubmissions(userId: string, problemId?: string) {
  return db.submission.findMany({
    where: { userId, problemId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function getLatestSubmission(userId: string, problemId: string) {
  return db.submission.findFirst({
    where: { userId, problemId },
    orderBy: { createdAt: "desc" },
  });
}
