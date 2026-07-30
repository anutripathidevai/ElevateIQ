/**
 * Feature registry — the single source of truth for ElevateIQ's career modules
 * and app navigation. Adding a new module (Interview History, Study Planner,
 * Resume Builder, …) is a one-entry change here: the sidebar, the landing page,
 * and the career hub all read from this registry.
 *
 * This complements `lib/tracks.ts` (which drives the interview-practice tracks):
 * tracks are "practice" content; modules are standalone career tools.
 */
import {
  Building2,
  CalendarClock,
  FileText,
  GraduationCap,
  History,
  LayoutDashboard,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { TRACK_LIST } from "@/lib/tracks";

/** Whether a module is shipped (`live`) or announced but not built (`soon`). */
export type ModuleStatus = "live" | "soon";

export interface FeatureModule {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  href: string;
  icon: LucideIcon;
  /** Tailwind text-color class used for accents. */
  accent: string;
  status: ModuleStatus;
}

/**
 * Career toolkit modules. `live` entries are fully implemented; `soon` entries
 * are scaffolding placeholders that render as "Coming soon" and demonstrate how
 * cleanly the platform extends.
 */
export const CAREER_MODULES: FeatureModule[] = [
  {
    id: "company-bank",
    title: "Company Question Bank",
    shortTitle: "Question Bank",
    description:
      "Real interview questions across top companies and categories, with expected answers, hints, follow-ups, filtering, bookmarking, and progress tracking.",
    href: "/companies",
    icon: Building2,
    accent: "text-sky-500",
    status: "live",
  },
  {
    id: "star-stories",
    title: "AI STAR Story Generator",
    shortTitle: "STAR Stories",
    description:
      "Turn a project into polished STAR stories — situation, task, action, result, skills, leadership principles, and the behavioral questions each one answers.",
    href: "/star-stories",
    icon: Sparkles,
    accent: "text-amber-500",
    status: "live",
  },
  {
    id: "panel-interview",
    title: "Mock Panel Interview",
    shortTitle: "Panel Interview",
    description:
      "Face a three-persona AI panel — Hiring Manager, Senior Engineer, Principal Engineer — then get a scorecard, per-interviewer feedback, and an improvement plan.",
    href: "/panel",
    icon: Users,
    accent: "text-violet-500",
    status: "live",
  },
  {
    id: "interview-history",
    title: "Interview History",
    shortTitle: "History",
    description:
      "A timeline of every mock and panel interview with scores, strengths, weaknesses, and AI recommendations — plus search and analytics.",
    href: "/history",
    icon: History,
    accent: "text-emerald-500",
    status: "soon",
  },
  {
    id: "study-planner",
    title: "Calendar Study Planner",
    shortTitle: "Study Planner",
    description:
      "A personalized, reschedulable study plan built from your target company, role, interview date, available hours, and weak areas.",
    href: "/planner",
    icon: CalendarClock,
    accent: "text-rose-500",
    status: "soon",
  },
  {
    id: "resume-builder",
    title: "Resume Builder",
    shortTitle: "Resume",
    description:
      "Multiple resumes and templates with AI summaries, ATS optimization, achievement rewriting, and job-description tailoring.",
    href: "/resume",
    icon: FileText,
    accent: "text-indigo-500",
    status: "soon",
  },
];

export const LIVE_MODULES = CAREER_MODULES.filter((m) => m.status === "live");

export function moduleById(id: string): FeatureModule | undefined {
  return CAREER_MODULES.find((m) => m.id === id);
}

// --- Navigation -----------------------------------------------------------

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

/** Grouped sidebar navigation, assembled from tracks + live career modules. */
export const NAV_SECTIONS: NavSection[] = [
  {
    id: "overview",
    label: "Overview",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    id: "practice",
    label: "Practice",
    items: [
      ...TRACK_LIST.map((t) => ({
        href: `/practice/${t.slug}`,
        label: t.shortTitle,
        icon: t.icon,
      })),
      { href: "/mock", label: "Mock Interview", icon: GraduationCap },
    ],
  },
  {
    id: "career",
    label: "Career Toolkit",
    items: LIVE_MODULES.map((m) => ({
      href: m.href,
      label: m.shortTitle,
      icon: m.icon,
    })),
  },
];
