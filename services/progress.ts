import { db } from "@/lib/db";
import { isDbConfigured } from "@/lib/env";
import type { ProgressStatus, TrackKey } from "@prisma/client";
import { trackByKey } from "@/lib/tracks";

/**
 * Spaced-repetition scheduler: higher scores push the next review further out.
 */
export function computeNextReview(score: number | null | undefined): Date {
  const days = score == null ? 1 : score >= 85 ? 14 : score >= 60 ? 5 : 1;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export function statusForScore(score: number): ProgressStatus {
  return score >= 60 ? "SOLVED" : "ATTEMPTED";
}

export async function recordAttempt(params: {
  userId: string;
  problemId: string;
  score: number;
}) {
  // Local dev without a database: progress tracking is disabled.
  if (!isDbConfigured) return null;
  const status = statusForScore(params.score);
  const nextReview = computeNextReview(params.score);
  const now = new Date();
  return db.progress.upsert({
    where: {
      userId_problemId: {
        userId: params.userId,
        problemId: params.problemId,
      },
    },
    create: {
      userId: params.userId,
      problemId: params.problemId,
      status,
      lastScore: params.score,
      lastAttempt: now,
      nextReview,
    },
    update: {
      status,
      lastScore: params.score,
      lastAttempt: now,
      nextReview,
    },
  });
}

/**
 * Mark a problem SOLVED — used by the DSA code runner when all tests pass.
 * No-op in DB-less guest mode (solved state then lives in localStorage only).
 */
export async function markSolved(params: {
  userId: string;
  problemId: string;
}) {
  if (!isDbConfigured) return null;
  const now = new Date();
  return db.progress.upsert({
    where: {
      userId_problemId: {
        userId: params.userId,
        problemId: params.problemId,
      },
    },
    create: {
      userId: params.userId,
      problemId: params.problemId,
      status: "SOLVED",
      lastAttempt: now,
      nextReview: computeNextReview(100),
    },
    update: {
      status: "SOLVED",
      lastAttempt: now,
    },
  });
}

export interface DashboardData {
  totals: { solved: number; attempted: number; total: number };
  byTrack: {
    track: TrackKey;
    title: string;
    slug: string;
    solved: number;
    total: number;
  }[];
  dueForReview: {
    slug: string;
    title: string;
    track: TrackKey;
    nextReview: Date | null;
  }[];
  recent: {
    slug: string;
    title: string;
    track: TrackKey;
    score: number | null;
    createdAt: Date;
  }[];
}

export async function getDashboard(userId: string): Promise<DashboardData> {
  const [allProblems, userProgress, dueRows, recentRows] = await Promise.all([
    db.problem.groupBy({ by: ["track"], _count: { _all: true } }),
    db.progress.findMany({
      where: { userId },
      include: { problem: { select: { track: true } } },
    }),
    db.progress.findMany({
      where: { userId, nextReview: { lte: new Date() }, status: { not: "TODO" } },
      orderBy: { nextReview: "asc" },
      take: 8,
      include: { problem: { select: { slug: true, title: true, track: true } } },
    }),
    db.submission.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { problem: { select: { slug: true, title: true, track: true } } },
    }),
  ]);

  const totalByTrack = new Map(
    allProblems.map((p) => [p.track, p._count._all]),
  );
  const solvedByTrack = new Map<TrackKey, number>();
  let solved = 0;
  let attempted = 0;
  for (const p of userProgress) {
    if (p.status === "SOLVED") {
      solved++;
      solvedByTrack.set(
        p.problem.track,
        (solvedByTrack.get(p.problem.track) ?? 0) + 1,
      );
    } else if (p.status === "ATTEMPTED") {
      attempted++;
    }
  }

  const byTrack = Array.from(totalByTrack.entries()).map(([track, total]) => {
    const cfg = trackByKey(track);
    return {
      track,
      title: cfg.shortTitle,
      slug: cfg.slug,
      solved: solvedByTrack.get(track) ?? 0,
      total,
    };
  });

  return {
    totals: {
      solved,
      attempted,
      total: allProblems.reduce((s, p) => s + p._count._all, 0),
    },
    byTrack,
    dueForReview: dueRows.map((r) => ({
      slug: r.problem.slug,
      title: r.problem.title,
      track: r.problem.track,
      nextReview: r.nextReview,
    })),
    recent: recentRows.map((r) => ({
      slug: r.problem.slug,
      title: r.problem.title,
      track: r.problem.track,
      score: r.score,
      createdAt: r.createdAt,
    })),
  };
}
