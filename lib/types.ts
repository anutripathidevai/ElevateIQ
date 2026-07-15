import type { LucideIcon } from "lucide-react";
import type { AccentKey } from "./navigation";

/**
 * Central, database-ready domain types for ElevateIQ.
 *
 * These interfaces are the single source of truth for the shape of the app's
 * data. Today they back static mock data (see `lib/data/*`), but they are
 * deliberately modelled the way a relational/ORM schema would be — stable
 * string `id`s, ISO-8601 timestamp strings, and foreign-key style references
 * (`userId`, `courseId`, …) — so wiring them to a real database later is a
 * drop-in change rather than a rewrite.
 *
 * UI-only presentation hints (`icon`, `accent`) are kept optional where they
 * don't belong in persisted data, and separated out where they do.
 */

export type { AccentKey };

// ---------------------------------------------------------------------------
// Identity & profile
// ---------------------------------------------------------------------------

export type ExperienceLevel =
  | "Beginner"
  | "Intermediate"
  | "Senior Engineer"
  | "Staff Engineer"
  | "Engineering Manager";

export const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  "Beginner",
  "Intermediate",
  "Senior Engineer",
  "Staff Engineer",
  "Engineering Manager",
];

export const TARGET_ROLES = [
  "Software Engineer",
  "Senior Software Engineer",
  "Staff Software Engineer",
  "Principal Engineer",
  "Engineering Manager",
] as const;

export const WEAK_AREA_OPTIONS = [
  "DSA",
  "System Design",
  "Low Level Design",
  "Behavioral",
  "Resume",
  "Cloud",
  "Machine Learning",
] as const;

export const LEARNING_TOPIC_OPTIONS = [
  "Azure",
  "AWS",
  "Generative AI",
  "Machine Learning",
  "System Design",
  "DSA",
  "Kubernetes",
] as const;

/** A persisted account. */
export interface User {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  createdAt: string;
}

/** Per-user career profile (1:1 with {@link User}). */
export interface UserProfile {
  userId: string;
  targetRole: string;
  targetCompany: string;
  experienceLevel: ExperienceLevel;
  dailyStudyHours: number;
  interviewDate: string | null;
  weakAreas: string[];
  learningTopics: string[];
  location?: string;
  headline?: string;
  skills: string[];
  streakDays: number;
  onboarded: boolean;
}

/**
 * The mock authenticated user persisted to localStorage. A flattened union of
 * {@link User} and {@link UserProfile} for convenient client-side access; when
 * a real backend lands this splits back into the two tables above.
 */
export interface AuthUser extends User, Omit<UserProfile, "userId"> {}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export interface ScoreStat {
  id: string;
  label: string;
  value: number;
  unit: "percent" | "days";
  accent: AccentKey;
  icon: LucideIcon;
  hint: string;
}

/** Aggregated headline metrics for a user's dashboard. */
export interface DashboardStats {
  interviewReadiness: number;
  resumeScore: number;
  learningProgress: number;
  studyStreakDays: number;
}

export interface PlanTask {
  id: string;
  title: string;
  meta: string;
  accent: AccentKey;
  icon: LucideIcon;
  done: boolean;
  href: string;
}

export interface ContinueItem {
  id: string;
  title: string;
  subtitle: string;
  progress: number;
  accent: AccentKey;
  icon: LucideIcon;
  href: string;
}

export interface UpcomingInterview {
  company: string;
  role: string;
  round: string;
  date: string;
  countdownDays: number;
  focus: string[];
  href: string;
}

export interface WeakArea {
  id: string;
  label: string;
  score: number;
  accent: AccentKey;
  href: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  accent: AccentKey;
  icon: LucideIcon;
}

export interface RecommendedItem {
  id: string;
  title: string;
  kind: string;
  meta: string;
  accent: AccentKey;
  icon: LucideIcon;
  href: string;
}

export interface Achievement {
  id: string;
  label: string;
  description: string;
  accent: AccentKey;
  icon: LucideIcon;
  earned: boolean;
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export type SearchCategory =
  | "Courses"
  | "Interview Questions"
  | "Blogs"
  | "Resume"
  | "Mock Interviews"
  | "AI Tools";

export interface SearchResult {
  id: string;
  label: string;
  category: SearchCategory;
  href: string;
  icon: LucideIcon;
}

// ---------------------------------------------------------------------------
// Learning
// ---------------------------------------------------------------------------

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

/** A single lesson within a {@link Course}. */
export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  durationMinutes: number;
  type: "video" | "reading" | "lab" | "quiz";
  completed: boolean;
  order: number;
}

export interface LearningPath {
  id: string;
  title: string;
  courses: string[];
  duration: string;
  accent: AccentKey;
  icon: LucideIcon;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  status: "earned" | "in-progress";
}

// ---------------------------------------------------------------------------
// Interview prep
// ---------------------------------------------------------------------------

export type Difficulty = "Easy" | "Medium" | "Hard";

/** A company/behavioral interview question in the bank. */
export interface Question {
  id: string;
  company: string;
  category: string;
  difficulty: Difficulty;
  experienceLevel: ExperienceLevel;
  tags: string[];
  prompt: string;
  href: string;
}

/** A practice problem (DSA / design). */
export interface InterviewProblem {
  id: string;
  slug: string;
  track: "dsa" | "system-design" | "lld" | "behavioral";
  title: string;
  difficulty: Difficulty;
  tags: string[];
  solved: boolean;
  href: string;
}

/** A completed or scheduled mock/panel interview. */
export interface MockInterview {
  id: string;
  userId: string;
  title: string;
  type: string;
  date: string;
  score: number;
  verdict: string;
  accent: AccentKey;
  strengths: string[];
  weaknesses: string[];
}

// ---------------------------------------------------------------------------
// Career tools
// ---------------------------------------------------------------------------

export interface CareerTool {
  id: string;
  anchor: string;
  title: string;
  description: string;
  cta: string;
  icon: LucideIcon;
  aiActions: string[];
}

export interface AtsMetric {
  label: string;
  value: number;
  accent: AccentKey;
}

/** The result of scanning a resume against a job description. */
export interface ATSReport {
  id: string;
  resumeVersionId: string;
  overallScore: number;
  metrics: AtsMetric[];
  missingKeywords: string[];
  generatedAt: string;
}

/** A stored resume version in a user's library. */
export interface ResumeVersion {
  id: string;
  userId: string;
  name: string;
  updatedAt: string;
  atsScore: number;
}

export type JobStatus =
  | "Applied"
  | "Interviewing"
  | "Offer"
  | "Rejected"
  | "Saved";

export interface JobRow {
  id: string;
  company: string;
  role: string;
  status: JobStatus;
  resumeVersion: string;
  interviewDate: string;
  notes: string;
}

// ---------------------------------------------------------------------------
// Practice
// ---------------------------------------------------------------------------

export interface ChallengeItem {
  id: string;
  title: string;
  category: string;
  meta: string;
  accent: AccentKey;
  icon: LucideIcon;
  href: string;
}

export interface WeeklyChallenge {
  title: string;
  description: string;
  progress: number;
  daysLeft: number;
  reward: string;
}

export interface StreakDay {
  day: string;
  active: boolean;
}

export interface ProgressTrack {
  label: string;
  solved: number;
  total: number;
  accent: AccentKey;
}

/** A generated, reschedulable study plan toward an interview date. */
export interface StudyPlan {
  id: string;
  userId: string;
  targetCompany: string;
  targetRole: string;
  interviewDate: string;
  dailyStudyHours: number;
  weakAreas: string[];
  weeks: StudyPlanWeek[];
  createdAt: string;
}

export interface StudyPlanWeek {
  week: string;
  focus: string;
  detail: string;
  accent: AccentKey;
  done: boolean;
}

// ---------------------------------------------------------------------------
// Resources & profile
// ---------------------------------------------------------------------------

export interface ResourceGroup {
  id: string;
  anchor: string;
  title: string;
  description: string;
  accent: AccentKey;
  icon: LucideIcon;
  items: string[];
}

export interface ReadinessMetric {
  label: string;
  value: number;
  accent: AccentKey;
}

/** Backwards-compatible alias for {@link MockInterview}. */
export type InterviewRecord = MockInterview;

/** A bookmarked question, course, blog, or resource. */
export interface SavedItem {
  id: string;
  userId: string;
  kind: "question" | "course" | "blog" | "resource" | "story";
  label: string;
  context: string;
  href: string;
  savedAt: string;
}
