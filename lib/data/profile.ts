import type {
  ReadinessMetric,
  InterviewRecord,
  SavedItem,
} from "@/lib/types";

/**
 * Default profile used to render the experience before a user personalizes it
 * (and as a fallback when the mock auth user has no value for a field).
 */
export const USER_PROFILE = {
  name: "Alex Morgan",
  initials: "AM",
  targetRole: "Senior Software Engineer",
  targetCompany: "Microsoft",
  headline: "Backend & distributed systems",
  location: "Remote · Bengaluru, IN",
  skills: [
    "TypeScript",
    "Node.js",
    "Distributed Systems",
    "System Design",
    "React",
    "PostgreSQL",
    "Kubernetes",
  ],
};

export const CAREER_READINESS: ReadinessMetric[] = [
  { label: "Career Readiness", value: 78, accent: "blue" },
  { label: "Interview Prep", value: 74, accent: "violet" },
  { label: "Learning", value: 52, accent: "emerald" },
  { label: "Resume", value: 82, accent: "orange" },
  { label: "Practice Consistency", value: 65, accent: "rose" },
];

export const INTERVIEW_HISTORY: InterviewRecord[] = [
  {
    id: "h1",
    userId: "u_demo",
    title: "Senior SWE — Panel",
    type: "Mock Panel",
    date: "Jul 12, 2026",
    score: 72,
    verdict: "Lean Hire",
    accent: "violet",
    strengths: ["Clear communication", "Solid coding"],
    weaknesses: ["System design depth", "Quantifying impact"],
  },
  {
    id: "h2",
    userId: "u_demo",
    title: "System Design — Rate Limiter",
    type: "Mock Interview",
    date: "Jul 8, 2026",
    score: 68,
    verdict: "Borderline",
    accent: "violet",
    strengths: ["Good API design"],
    weaknesses: ["Scaling trade-offs", "Failure modes"],
  },
  {
    id: "h3",
    userId: "u_demo",
    title: "Behavioral — Leadership",
    type: "Mock Interview",
    date: "Jul 3, 2026",
    score: 81,
    verdict: "Hire",
    accent: "orange",
    strengths: ["Strong STAR structure", "Ownership"],
    weaknesses: ["Be more concise"],
  },
];

export const SAVED_QUESTIONS: SavedItem[] = [
  { id: "sq1", userId: "u_demo", kind: "question", label: "Design a distributed rate limiter", context: "Microsoft · System Design", href: "/companies", savedAt: "2026-07-10" },
  { id: "sq2", userId: "u_demo", kind: "question", label: "Detect a cycle in a directed graph", context: "Google · DSA", href: "/practice/dsa", savedAt: "2026-07-09" },
  { id: "sq3", userId: "u_demo", kind: "question", label: "Tell me about a time you disagreed with your manager", context: "Amazon · Behavioral", href: "/practice/behavioral", savedAt: "2026-07-07" },
];
