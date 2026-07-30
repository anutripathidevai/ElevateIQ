import { Cloud, Code2, MessagesSquare, Network } from "lucide-react";
import type {
  ChallengeItem,
  WeeklyChallenge,
  StreakDay,
  ProgressTrack,
  StudyPlan,
} from "@/lib/types";

export const TODAYS_CHALLENGE: ChallengeItem[] = [
  { id: "d1", title: "Word Ladder", category: "DSA Problem", meta: "Medium · Graphs", accent: "violet", icon: Code2, href: "/practice/dsa" },
  { id: "d2", title: "Design a URL Shortener", category: "System Design", meta: "Intermediate", accent: "violet", icon: Network, href: "/practice/system-design" },
  { id: "d3", title: "Tell me about a conflict", category: "Behavioral", meta: "STAR format", accent: "orange", icon: MessagesSquare, href: "/practice/behavioral" },
  { id: "d4", title: "Azure Storage Quiz", category: "Learning Quiz", meta: "10 questions", accent: "emerald", icon: Cloud, href: "/learning#azure" },
];

export const WEEKLY_CHALLENGE: WeeklyChallenge = {
  title: "Distributed Systems Week",
  description: "Complete 5 system design problems and 2 mock interviews focused on scale.",
  progress: 40,
  daysLeft: 4,
  reward: "150 XP + Systems Thinker badge",
};

export const STREAK_WEEK: StreakDay[] = [
  { day: "M", active: true },
  { day: "T", active: true },
  { day: "W", active: true },
  { day: "T", active: true },
  { day: "F", active: true },
  { day: "S", active: false },
  { day: "S", active: false },
];

export const PROGRESS_TRACKS: ProgressTrack[] = [
  { label: "DSA", solved: 128, total: 300, accent: "violet" },
  { label: "System Design", solved: 22, total: 45, accent: "violet" },
  { label: "LLD", solved: 9, total: 20, accent: "emerald" },
  { label: "Behavioral", solved: 14, total: 30, accent: "orange" },
];

/** A sample AI-generated study plan (DB-ready shape). */
export const SAMPLE_STUDY_PLAN: StudyPlan = {
  id: "plan_demo",
  userId: "u_demo",
  targetCompany: "Microsoft",
  targetRole: "Senior Software Engineer",
  interviewDate: "2026-08-15",
  dailyStudyHours: 3,
  weakAreas: ["System Design", "Behavioral", "Graphs"],
  createdAt: "2026-07-14T09:00:00.000Z",
  weeks: [
    { week: "Week 1", focus: "Graphs & Trees", detail: "2 problems/day + 1 mock", accent: "violet", done: false },
    { week: "Week 2", focus: "System Design", detail: "Rate limiter, URL shortener, feed", accent: "blue", done: false },
    { week: "Week 3", focus: "Behavioral + STAR", detail: "6 stories, 2 panel mocks", accent: "orange", done: false },
    { week: "Week 4", focus: "Full Mocks & Review", detail: "3 panel interviews, fix gaps", accent: "emerald", done: false },
  ],
};
