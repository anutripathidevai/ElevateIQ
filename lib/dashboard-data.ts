import {
  Award,
  Boxes,
  Brain,
  Cloud,
  Code2,
  FileText,
  MessagesSquare,
  Network,
  Sparkles,
  Trophy,
  Flame,
  Target,
  BookOpen,
  Rocket,
  Zap,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";
import type { AccentKey } from "./navigation";

/**
 * Static, UI-only content for the dashboard-first experience. Real modules
 * (practice, panel, star-stories) keep their own data/services; this module
 * powers the personalized dashboard and the new hub pages with representative
 * mock data so the product feels complete end-to-end.
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

export interface ScoreStat {
  id: string;
  label: string;
  value: number;
  unit: "percent" | "days";
  accent: AccentKey;
  icon: LucideIcon;
  hint: string;
}

export const SCORE_STATS: ScoreStat[] = [
  {
    id: "readiness",
    label: "Interview Readiness",
    value: 74,
    unit: "percent",
    accent: "violet",
    icon: Target,
    hint: "+6% this week",
  },
  {
    id: "resume",
    label: "Resume Score",
    value: 82,
    unit: "percent",
    accent: "orange",
    icon: FileText,
    hint: "ATS optimized",
  },
  {
    id: "learning",
    label: "Learning Progress",
    value: 48,
    unit: "percent",
    accent: "emerald",
    icon: BookOpen,
    hint: "3 courses active",
  },
  {
    id: "streak",
    label: "Study Streak",
    value: 12,
    unit: "days",
    accent: "rose",
    icon: Flame,
    hint: "Personal best: 21",
  },
];

export interface PlanTask {
  id: string;
  title: string;
  meta: string;
  accent: AccentKey;
  icon: LucideIcon;
  done: boolean;
  href: string;
}

export const TODAY_PLAN: PlanTask[] = [
  {
    id: "p1",
    title: "Solve 2 Graph problems",
    meta: "DSA · ~40 min",
    accent: "violet",
    icon: Code2,
    done: true,
    href: "/practice/dsa",
  },
  {
    id: "p2",
    title: "Design a Rate Limiter",
    meta: "System Design · ~30 min",
    accent: "violet",
    icon: Network,
    done: false,
    href: "/practice/system-design",
  },
  {
    id: "p3",
    title: "Record a STAR story on Conflict",
    meta: "Behavioral · ~15 min",
    accent: "violet",
    icon: MessagesSquare,
    done: false,
    href: "/star-stories",
  },
  {
    id: "p4",
    title: "Azure IAM lesson + quiz",
    meta: "Learning · ~25 min",
    accent: "emerald",
    icon: Cloud,
    done: false,
    href: "/learning#azure",
  },
];

export interface ContinueItem {
  id: string;
  title: string;
  subtitle: string;
  progress: number;
  accent: AccentKey;
  icon: LucideIcon;
  href: string;
}

export const CONTINUE_LEARNING: ContinueItem[] = [
  {
    id: "c1",
    title: "Azure Fundamentals",
    subtitle: "Next: Identity and Access Management",
    progress: 48,
    accent: "emerald",
    icon: Cloud,
    href: "/learning#azure",
  },
  {
    id: "c2",
    title: "Generative AI Essentials",
    subtitle: "Next: Retrieval-Augmented Generation",
    progress: 32,
    accent: "emerald",
    icon: Sparkles,
    href: "/learning#genai",
  },
  {
    id: "c3",
    title: "System Design Roadmap",
    subtitle: "Next: Consistent Hashing",
    progress: 61,
    accent: "violet",
    icon: Network,
    href: "/practice/system-design",
  },
];

export const UPCOMING_INTERVIEW = {
  company: "Microsoft",
  role: "Senior Software Engineer",
  round: "Mock Panel Interview",
  date: "Fri, Jul 18 · 4:00 PM",
  countdownDays: 3,
  focus: ["System Design", "Behavioral", "Coding"],
  href: "/panel",
};

export interface WeakArea {
  id: string;
  label: string;
  score: number;
  accent: AccentKey;
  href: string;
}

export const WEAK_AREAS: WeakArea[] = [
  { id: "w1", label: "Behavioral", score: 58, accent: "orange", href: "/practice/behavioral" },
  { id: "w2", label: "System Design", score: 62, accent: "violet", href: "/practice/system-design" },
  { id: "w3", label: "Graph Problems", score: 51, accent: "rose", href: "/practice/dsa" },
];

export interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  accent: AccentKey;
  icon: LucideIcon;
}

export const RECENT_ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    title: "Solved “Course Schedule II”",
    detail: "DSA · Score 88",
    time: "2h ago",
    accent: "violet",
    icon: Code2,
  },
  {
    id: "a2",
    title: "Completed Azure lesson: Storage",
    detail: "Learning · Quiz 9/10",
    time: "5h ago",
    accent: "emerald",
    icon: Cloud,
  },
  {
    id: "a3",
    title: "Panel interview scored: Lean Hire",
    detail: "Mock Panel · Senior SWE",
    time: "Yesterday",
    accent: "violet",
    icon: MessagesSquare,
  },
  {
    id: "a4",
    title: "Resume tailored for Microsoft",
    detail: "ATS 82% · +6 keywords",
    time: "Yesterday",
    accent: "orange",
    icon: FileText,
  },
  {
    id: "a5",
    title: "7-day streak milestone",
    detail: "Practice · Keep it up!",
    time: "2d ago",
    accent: "rose",
    icon: Flame,
  },
];

export interface RecommendedItem {
  id: string;
  title: string;
  kind: string;
  meta: string;
  accent: AccentKey;
  icon: LucideIcon;
  href: string;
}

export const RECOMMENDED: RecommendedItem[] = [
  {
    id: "r1",
    title: "Design a Notification System",
    kind: "System Design",
    meta: "Intermediate · 30 min",
    accent: "violet",
    icon: Network,
    href: "/practice/system-design",
  },
  {
    id: "r2",
    title: "Behavioral: Handling Failure",
    kind: "STAR Story",
    meta: "Generate with AI",
    accent: "orange",
    icon: Sparkles,
    href: "/star-stories",
  },
  {
    id: "r3",
    title: "Kubernetes for Engineers",
    kind: "Course",
    meta: "New · 14 lessons",
    accent: "emerald",
    icon: Cloud,
    href: "/learning",
  },
  {
    id: "r4",
    title: "Graph Algorithms Cheat Sheet",
    kind: "Resource",
    meta: "5 min read",
    accent: "cyan",
    icon: BookOpen,
    href: "/resources#cheatsheets",
  },
];

export interface Achievement {
  id: string;
  label: string;
  description: string;
  accent: AccentKey;
  icon: LucideIcon;
  earned: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "ac1", label: "First Blood", description: "Solved your first problem", accent: "violet", icon: Zap, earned: true },
  { id: "ac2", label: "Streak Keeper", description: "10-day study streak", accent: "rose", icon: Flame, earned: true },
  { id: "ac3", label: "Resume Pro", description: "ATS score above 80%", accent: "orange", icon: FileText, earned: true },
  { id: "ac4", label: "Course Crusher", description: "Completed a full course", accent: "emerald", icon: Award, earned: true },
  { id: "ac5", label: "Panel Survivor", description: "Finished a panel interview", accent: "violet", icon: MessagesSquare, earned: true },
  { id: "ac6", label: "Century", description: "Solve 100 problems", accent: "cyan", icon: Trophy, earned: false },
];

// ---- Learning module ------------------------------------------------------

export interface Course {
  id: string;
  anchor: string;
  title: string;
  category: string;
  description: string;
  progress: number;
  next: string;
  lessons: number;
  quizzes: number;
  labs: number;
  certificate: boolean;
  accent: AccentKey;
  icon: LucideIcon;
}

export const COURSES: Course[] = [
  {
    id: "azure",
    anchor: "azure",
    title: "Azure Fundamentals",
    category: "Cloud",
    description: "Core Azure services, identity, storage, networking, and governance.",
    progress: 48,
    next: "Identity and Access Management",
    lessons: 12,
    quizzes: 4,
    labs: 3,
    certificate: true,
    accent: "emerald",
    icon: Cloud,
  },
  {
    id: "aws",
    anchor: "aws",
    title: "AWS Fundamentals",
    category: "Cloud",
    description: "EC2, S3, IAM, VPC, and the core building blocks of AWS.",
    progress: 20,
    next: "S3 Storage Classes",
    lessons: 14,
    quizzes: 5,
    labs: 4,
    certificate: true,
    accent: "emerald",
    icon: Cloud,
  },
  {
    id: "genai",
    anchor: "genai",
    title: "Generative AI Essentials",
    category: "AI",
    description: "LLMs, prompting, embeddings, RAG, and building AI-powered apps.",
    progress: 32,
    next: "Retrieval-Augmented Generation",
    lessons: 10,
    quizzes: 3,
    labs: 5,
    certificate: true,
    accent: "emerald",
    icon: Sparkles,
  },
  {
    id: "ml",
    anchor: "ml",
    title: "Machine Learning",
    category: "AI",
    description: "Supervised learning, evaluation, feature engineering, and deployment.",
    progress: 12,
    next: "Linear Regression",
    lessons: 16,
    quizzes: 6,
    labs: 6,
    certificate: true,
    accent: "emerald",
    icon: Brain,
  },
];

export interface LearningPath {
  id: string;
  title: string;
  courses: string[];
  duration: string;
  accent: AccentKey;
  icon: LucideIcon;
}

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: "cloud-engineer",
    title: "Cloud Engineer Path",
    courses: ["Azure Fundamentals", "AWS Fundamentals", "Kubernetes"],
    duration: "~24 hours",
    accent: "emerald",
    icon: Cloud,
  },
  {
    id: "ai-engineer",
    title: "AI Engineer Path",
    courses: ["Generative AI Essentials", "Machine Learning", "MLOps"],
    duration: "~30 hours",
    accent: "violet",
    icon: Sparkles,
  },
  {
    id: "backend",
    title: "Backend Specialist Path",
    courses: ["System Design", "Databases", "Distributed Systems"],
    duration: "~28 hours",
    accent: "orange",
    icon: Network,
  },
];

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  status: "earned" | "in-progress";
}

export const CERTIFICATES: Certificate[] = [
  { id: "cert1", title: "Azure Fundamentals (in progress)", issuer: "ElevateIQ", date: "48% complete", status: "in-progress" },
  { id: "cert2", title: "System Design Foundations", issuer: "ElevateIQ", date: "Jun 2026", status: "earned" },
  { id: "cert3", title: "DSA Problem Solving", issuer: "ElevateIQ", date: "May 2026", status: "earned" },
];

// ---- Career tools ---------------------------------------------------------

export interface CareerTool {
  id: string;
  anchor: string;
  title: string;
  description: string;
  cta: string;
  icon: LucideIcon;
  aiActions: string[];
}

export const CAREER_TOOLS: CareerTool[] = [
  {
    id: "resume-builder",
    anchor: "resume-builder",
    title: "Resume Builder",
    description: "Craft ATS-friendly resumes from reusable sections and templates.",
    cta: "Open Builder",
    icon: FileText,
    aiActions: ["Generate Summary", "Rewrite Achievements", "Improve Resume"],
  },
  {
    id: "ats",
    anchor: "ats",
    title: "ATS Resume Checker",
    description: "Scan your resume against a job description and fix gaps.",
    cta: "Run ATS Scan",
    icon: ClipboardCheck,
    aiActions: ["Analyze Resume", "Find Missing Keywords"],
  },
  {
    id: "tailoring",
    anchor: "tailoring",
    title: "Resume Tailoring",
    description: "Auto-tailor your resume to a specific role and company.",
    cta: "Tailor Resume",
    icon: Target,
    aiActions: ["Tailor to Job", "Match Keywords"],
  },
  {
    id: "cover-letter",
    anchor: "cover-letter",
    title: "Cover Letter Generator",
    description: "Generate a personalized cover letter in your voice.",
    cta: "Generate Letter",
    icon: FileText,
    aiActions: ["Generate Draft", "Adjust Tone"],
  },
  {
    id: "linkedin",
    anchor: "linkedin",
    title: "LinkedIn Profile Review",
    description: "Get AI feedback on your headline, about, and experience.",
    cta: "Review Profile",
    icon: Rocket,
    aiActions: ["Review Profile", "Rewrite Headline"],
  },
  {
    id: "job-search",
    anchor: "job-search",
    title: "Job Search",
    description: "Find roles matched to your target and skills.",
    cta: "Search Jobs",
    icon: Target,
    aiActions: ["Match Jobs", "Explain Fit"],
  },
];

export interface AtsMetric {
  label: string;
  value: number;
  accent: AccentKey;
}

export const ATS_METRICS: AtsMetric[] = [
  { label: "ATS Score", value: 82, accent: "orange" },
  { label: "Keyword Match", value: 76, accent: "violet" },
  { label: "Formatting", value: 90, accent: "emerald" },
  { label: "Impact", value: 70, accent: "rose" },
  { label: "Readability", value: 85, accent: "cyan" },
];

export const ATS_MISSING_KEYWORDS = [
  "Distributed Systems",
  "Kubernetes",
  "Observability",
  "Cost Optimization",
];

export interface JobRow {
  id: string;
  company: string;
  role: string;
  status: "Applied" | "Interviewing" | "Offer" | "Rejected" | "Saved";
  resumeVersion: string;
  interviewDate: string;
  notes: string;
}

export const JOB_ROWS: JobRow[] = [
  { id: "j1", company: "Microsoft", role: "Senior SWE", status: "Interviewing", resumeVersion: "v3 — Azure", interviewDate: "Jul 18", notes: "Panel: SD + Behavioral" },
  { id: "j2", company: "Google", role: "SWE III", status: "Applied", resumeVersion: "v2 — Backend", interviewDate: "—", notes: "Referral pending" },
  { id: "j3", company: "Stripe", role: "Backend Engineer", status: "Saved", resumeVersion: "v3 — Azure", interviewDate: "—", notes: "Payments team" },
  { id: "j4", company: "Amazon", role: "SDE II", status: "Rejected", resumeVersion: "v1 — General", interviewDate: "Jun 30", notes: "Retry in 6 months" },
];

// ---- Practice hub ---------------------------------------------------------

export interface ChallengeItem {
  id: string;
  title: string;
  category: string;
  meta: string;
  accent: AccentKey;
  icon: LucideIcon;
  href: string;
}

export const TODAYS_CHALLENGE: ChallengeItem[] = [
  { id: "d1", title: "Word Ladder", category: "DSA Problem", meta: "Medium · Graphs", accent: "violet", icon: Code2, href: "/practice/dsa" },
  { id: "d2", title: "Design a URL Shortener", category: "System Design", meta: "Intermediate", accent: "violet", icon: Network, href: "/practice/system-design" },
  { id: "d3", title: "Tell me about a conflict", category: "Behavioral", meta: "STAR format", accent: "orange", icon: MessagesSquare, href: "/practice/behavioral" },
  { id: "d4", title: "Azure Storage Quiz", category: "Learning Quiz", meta: "10 questions", accent: "emerald", icon: Cloud, href: "/learning#azure" },
];

export const WEEKLY_CHALLENGE = {
  title: "Distributed Systems Week",
  description: "Complete 5 system design problems and 2 mock interviews focused on scale.",
  progress: 40,
  daysLeft: 4,
  reward: "150 XP + Systems Thinker badge",
};

export interface StreakDay {
  day: string;
  active: boolean;
}

export const STREAK_WEEK: StreakDay[] = [
  { day: "M", active: true },
  { day: "T", active: true },
  { day: "W", active: true },
  { day: "T", active: true },
  { day: "F", active: true },
  { day: "S", active: false },
  { day: "S", active: false },
];

export const PROGRESS_TRACKS = [
  { label: "DSA", solved: 128, total: 300, accent: "violet" as AccentKey },
  { label: "System Design", solved: 22, total: 45, accent: "violet" as AccentKey },
  { label: "LLD", solved: 9, total: 20, accent: "emerald" as AccentKey },
  { label: "Behavioral", solved: 14, total: 30, accent: "orange" as AccentKey },
];

// ---- Resources ------------------------------------------------------------

export interface ResourceGroup {
  id: string;
  anchor: string;
  title: string;
  description: string;
  accent: AccentKey;
  icon: LucideIcon;
  items: string[];
}

export const RESOURCE_GROUPS: ResourceGroup[] = [
  {
    id: "blogs",
    anchor: "blogs",
    title: "Blogs",
    description: "Deep-dives on engineering, interviews, and career growth.",
    accent: "cyan",
    icon: BookOpen,
    items: ["Cracking the Behavioral Round", "From Mid to Senior in 12 months", "Reading System Design Papers"],
  },
  {
    id: "experiences",
    anchor: "experiences",
    title: "Interview Experiences",
    description: "Real, structured interview write-ups by company and role.",
    accent: "cyan",
    icon: MessagesSquare,
    items: ["Microsoft — Senior SWE (Onsite)", "Google — L4 System Design", "Stripe — Backend Loop"],
  },
  {
    id: "notes",
    anchor: "notes",
    title: "System Design Notes",
    description: "Concise notes on core distributed-systems building blocks.",
    accent: "cyan",
    icon: Network,
    items: ["Consistent Hashing", "CAP Theorem in Practice", "Caching Strategies"],
  },
  {
    id: "guides",
    anchor: "guides",
    title: "Architecture Guides",
    description: "End-to-end reference architectures with trade-offs.",
    accent: "cyan",
    icon: Boxes,
    items: ["Event-Driven Architecture", "Multi-Region Failover", "Read-Heavy Systems"],
  },
  {
    id: "cheatsheets",
    anchor: "cheatsheets",
    title: "Cheat Sheets",
    description: "One-page references you can skim before an interview.",
    accent: "cyan",
    icon: FileText,
    items: ["Graph Algorithms", "Big-O Complexity", "SQL vs NoSQL"],
  },
  {
    id: "roadmaps",
    anchor: "roadmaps",
    title: "Career Roadmaps",
    description: "Step-by-step paths for roles and specializations.",
    accent: "cyan",
    icon: Target,
    items: ["Backend Engineer", "Cloud / DevOps", "AI Engineer"],
  },
];

export const RESOURCE_AI_ACTIONS = [
  "Summarize",
  "Generate Notes",
  "Create Flashcards",
  "Create Interview Questions",
  "Save to Study Plan",
];

// ---- Profile --------------------------------------------------------------

export interface ReadinessMetric {
  label: string;
  value: number;
  accent: AccentKey;
}

export const CAREER_READINESS: ReadinessMetric[] = [
  { label: "Career Readiness", value: 78, accent: "blue" },
  { label: "Interview Prep", value: 74, accent: "violet" },
  { label: "Learning", value: 52, accent: "emerald" },
  { label: "Resume", value: 82, accent: "orange" },
  { label: "Practice Consistency", value: 65, accent: "rose" },
];

// ---- Interview history ----------------------------------------------------

export interface InterviewRecord {
  id: string;
  title: string;
  type: string;
  date: string;
  score: number;
  verdict: string;
  accent: AccentKey;
  strengths: string[];
  weaknesses: string[];
}

export const INTERVIEW_HISTORY: InterviewRecord[] = [
  {
    id: "h1",
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
