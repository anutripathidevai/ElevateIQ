import {
  Award,
  BookOpen,
  Cloud,
  Code2,
  FileText,
  Flame,
  MessagesSquare,
  Network,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import type {
  ScoreStat,
  PlanTask,
  ContinueItem,
  UpcomingInterview,
  WeakArea,
  ActivityItem,
  RecommendedItem,
  Achievement,
} from "@/lib/types";

/** Headline KPI cards on the dashboard. */
export const SCORE_STATS: ScoreStat[] = [
  { id: "readiness", label: "Interview Readiness", value: 74, unit: "percent", accent: "violet", icon: Target, hint: "+6% this week" },
  { id: "resume", label: "Resume Score", value: 82, unit: "percent", accent: "orange", icon: FileText, hint: "ATS optimized" },
  { id: "learning", label: "Learning Progress", value: 48, unit: "percent", accent: "emerald", icon: BookOpen, hint: "3 courses active" },
  { id: "streak", label: "Study Streak", value: 12, unit: "days", accent: "rose", icon: Flame, hint: "Personal best: 21" },
];

export const TODAY_PLAN: PlanTask[] = [
  { id: "p1", title: "Solve 2 Graph problems", meta: "DSA · ~40 min", accent: "violet", icon: Code2, done: true, href: "/practice/dsa" },
  { id: "p2", title: "Design a Rate Limiter", meta: "System Design · ~30 min", accent: "violet", icon: Network, done: false, href: "/practice/system-design" },
  { id: "p3", title: "Record a STAR story on Conflict", meta: "Behavioral · ~15 min", accent: "violet", icon: MessagesSquare, done: false, href: "/star-stories" },
  { id: "p4", title: "Azure IAM lesson + quiz", meta: "Learning · ~25 min", accent: "emerald", icon: Cloud, done: false, href: "/learning#azure" },
];

export const CONTINUE_LEARNING: ContinueItem[] = [
  { id: "c1", title: "Azure Fundamentals", subtitle: "Next: Identity and Access Management", progress: 48, accent: "emerald", icon: Cloud, href: "/learning#azure" },
  { id: "c2", title: "Generative AI Essentials", subtitle: "Next: Retrieval-Augmented Generation", progress: 32, accent: "emerald", icon: Sparkles, href: "/learning#genai" },
  { id: "c3", title: "System Design Roadmap", subtitle: "Next: Consistent Hashing", progress: 61, accent: "violet", icon: Network, href: "/practice/system-design" },
];

export const UPCOMING_INTERVIEW: UpcomingInterview = {
  company: "Microsoft",
  role: "Senior Software Engineer",
  round: "Mock Panel Interview",
  date: "Fri, Jul 18 · 4:00 PM",
  countdownDays: 3,
  focus: ["System Design", "Behavioral", "Coding"],
  href: "/panel",
};

export const WEAK_AREAS: WeakArea[] = [
  { id: "w1", label: "Behavioral", score: 58, accent: "orange", href: "/practice/behavioral" },
  { id: "w2", label: "System Design", score: 62, accent: "violet", href: "/practice/system-design" },
  { id: "w3", label: "Graph Problems", score: 51, accent: "rose", href: "/practice/dsa" },
];

export const RECENT_ACTIVITY: ActivityItem[] = [
  { id: "a1", title: "Solved “Course Schedule II”", detail: "DSA · Score 88", time: "2h ago", accent: "violet", icon: Code2 },
  { id: "a2", title: "Completed Azure lesson: Storage", detail: "Learning · Quiz 9/10", time: "5h ago", accent: "emerald", icon: Cloud },
  { id: "a3", title: "Panel interview scored: Lean Hire", detail: "Mock Panel · Senior SWE", time: "Yesterday", accent: "violet", icon: MessagesSquare },
  { id: "a4", title: "Resume tailored for Microsoft", detail: "ATS 82% · +6 keywords", time: "Yesterday", accent: "orange", icon: FileText },
  { id: "a5", title: "7-day streak milestone", detail: "Practice · Keep it up!", time: "2d ago", accent: "rose", icon: Flame },
];

export const RECOMMENDED: RecommendedItem[] = [
  { id: "r1", title: "Design a Notification System", kind: "System Design", meta: "Intermediate · 30 min", accent: "violet", icon: Network, href: "/practice/system-design" },
  { id: "r2", title: "Behavioral: Handling Failure", kind: "STAR Story", meta: "Generate with AI", accent: "orange", icon: Sparkles, href: "/star-stories" },
  { id: "r3", title: "Kubernetes for Engineers", kind: "Course", meta: "New · 14 lessons", accent: "emerald", icon: Cloud, href: "/learning" },
  { id: "r4", title: "Graph Algorithms Cheat Sheet", kind: "Resource", meta: "5 min read", accent: "cyan", icon: BookOpen, href: "/resources#cheatsheets" },
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: "ac1", label: "First Blood", description: "Solved your first problem", accent: "violet", icon: Zap, earned: true },
  { id: "ac2", label: "Streak Keeper", description: "10-day study streak", accent: "rose", icon: Flame, earned: true },
  { id: "ac3", label: "Resume Pro", description: "ATS score above 80%", accent: "orange", icon: FileText, earned: true },
  { id: "ac4", label: "Course Crusher", description: "Completed a full course", accent: "emerald", icon: Award, earned: true },
  { id: "ac5", label: "Panel Survivor", description: "Finished a panel interview", accent: "violet", icon: MessagesSquare, earned: true },
  { id: "ac6", label: "Century", description: "Solve 100 problems", accent: "cyan", icon: Trophy, earned: false },
];
