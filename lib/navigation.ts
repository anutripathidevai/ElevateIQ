import {
  Award,
  Bookmark,
  Boxes,
  Brain,
  Briefcase,
  BookOpen,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  BrainCircuit,
  Cloud,
  Code2,
  FileText,
  FolderOpen,
  Flame,
  GraduationCap,
  History,
  LayoutDashboard,
  Library,
  Linkedin,
  Mail,
  Map,
  MessageSquareText,
  MessagesSquare,
  Network,
  Newspaper,
  NotebookPen,
  Route,
  ScanLine,
  Scissors,
  ScrollText,
  Search,
  Settings,
  Layers,
  Sparkles,
  Star,
  Table2,
  Target,
  Trophy,
  TrendingUp,
  User,
  type LucideIcon,
} from "lucide-react";

/**
 * Modular sidebar navigation — the single source of truth for the app shell's
 * grouped, collapsible navigation. Every `href` resolves to a real page (module
 * hubs use `#anchors` to reach in-page sections) so no link is ever broken.
 *
 * Each group carries an `accent` key; `ACCENT_STYLES` maps it to concrete
 * Tailwind classes (kept as full literal strings so they survive purging).
 */

export type AccentKey =
  | "blue"
  | "violet"
  | "emerald"
  | "orange"
  | "rose"
  | "cyan"
  | "slate";

export interface AccentStyle {
  /** Icon / text color. */
  text: string;
  /** Soft background for icon chips and highlights. */
  bg: string;
  /** Border tint. */
  border: string;
  /** Solid dot / progress fill. */
  solid: string;
  /** Gradient pair for hero surfaces. */
  gradient: string;
}

export const ACCENT_STYLES: Record<AccentKey, AccentStyle> = {
  blue: {
    text: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    solid: "bg-blue-500",
    gradient: "from-blue-500/15 to-blue-500/0",
  },
  violet: {
    text: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    solid: "bg-violet-500",
    gradient: "from-violet-500/15 to-violet-500/0",
  },
  emerald: {
    text: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    solid: "bg-emerald-500",
    gradient: "from-emerald-500/15 to-emerald-500/0",
  },
  orange: {
    text: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    solid: "bg-orange-500",
    gradient: "from-orange-500/15 to-orange-500/0",
  },
  rose: {
    text: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    solid: "bg-rose-500",
    gradient: "from-rose-500/15 to-rose-500/0",
  },
  cyan: {
    text: "text-cyan-500",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    solid: "bg-cyan-500",
    gradient: "from-cyan-500/15 to-cyan-500/0",
  },
  slate: {
    text: "text-slate-400",
    bg: "bg-slate-400/10",
    border: "border-slate-400/30",
    solid: "bg-slate-400",
    gradient: "from-slate-400/15 to-slate-400/0",
  },
};

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Badge shown on the right of the item (e.g. "New", a count). */
  badge?: string;
}

export interface NavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  accent: AccentKey;
  /** Landing route for the group header (its hub). */
  href: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    accent: "blue",
    href: "/dashboard",
    items: [],
  },
  {
    id: "interview-prep",
    label: "Interview Prep",
    icon: Target,
    accent: "violet",
    href: "/practice/dsa",
    items: [
      { href: "/practice/dsa", label: "DSA Practice", icon: Code2 },
      { href: "/practice/system-design", label: "System Design / HLD", icon: Network },
      { href: "/practice/lld", label: "Low Level Design / LLD", icon: Boxes },
      { href: "/practice/behavioral", label: "Behavioral", icon: MessagesSquare },
      { href: "/mock", label: "Mock Interview", icon: GraduationCap },
      { href: "/panel", label: "Panel Interview", icon: MessagesSquare },
      { href: "/history", label: "Interview History", icon: History },
    ],
  },
  {
    id: "learning",
    label: "Learning",
    icon: BookOpen,
    accent: "emerald",
    href: "/learning",
    items: [
      { href: "/learning", label: "Courses", icon: BookOpen },
      {
        href: "/learning/dsa",
        label: "DSA",
        icon: Layers,
        badge: "New",
      },
      {
        href: "/learning/system-design",
        label: "System Design",
        icon: Network,
        badge: "New",
      },
      {
        href: "/learning/generative-ai",
        label: "Generative AI",
        icon: BrainCircuit,
        badge: "New",
      },
      {
        href: "/learning/languages",
        label: "Programming Languages",
        icon: Code2,
        badge: "New",
      },
      { href: "/learning#azure", label: "Azure", icon: Cloud },
      { href: "/learning#aws", label: "AWS", icon: Cloud },
      { href: "/learning#ml", label: "Machine Learning", icon: Brain },
      { href: "/learning#paths", label: "Learning Paths", icon: Route },
      { href: "/learning#certificates", label: "Certificates", icon: Award },
    ],
  },
  {
    id: "career",
    label: "Career Tools",
    icon: Briefcase,
    accent: "orange",
    href: "/career",
    items: [
      { href: "/career#resume-builder", label: "Resume Builder", icon: FileText },
      { href: "/career#ats", label: "ATS Checker", icon: ScanLine },
      { href: "/career#tailoring", label: "Resume Tailoring", icon: Scissors },
      { href: "/career#cover-letter", label: "Cover Letter Generator", icon: Mail },
      { href: "/career#linkedin", label: "LinkedIn Review", icon: Linkedin },
      { href: "/career#job-search", label: "Job Search", icon: Search },
      { href: "/career#job-tracker", label: "Job Tracker", icon: Table2 },
    ],
  },
  {
    id: "practice",
    label: "Practice",
    icon: Flame,
    accent: "rose",
    href: "/practice",
    items: [
      { href: "/practice#daily", label: "Daily Challenge", icon: CalendarDays },
      { href: "/practice#weekly", label: "Weekly Challenge", icon: CalendarRange },
      { href: "/practice#planner", label: "Study Planner", icon: CalendarClock },
      { href: "/practice#progress", label: "Progress Tracking", icon: TrendingUp },
      { href: "/practice#streak", label: "Practice Streak", icon: Flame },
    ],
  },
  {
    id: "resources",
    label: "Resources",
    icon: Library,
    accent: "cyan",
    href: "/resources",
    items: [
      { href: "/resources#blogs", label: "Blogs", icon: Newspaper },
      { href: "/resources#experiences", label: "Interview Experiences", icon: MessageSquareText },
      { href: "/resources#notes", label: "System Design Notes", icon: NotebookPen },
      { href: "/resources#guides", label: "Architecture Guides", icon: Network },
      { href: "/resources#cheatsheets", label: "Cheat Sheets", icon: ScrollText },
      { href: "/resources#roadmaps", label: "Career Roadmaps", icon: Map },
    ],
  },
  {
    id: "profile",
    label: "Profile",
    icon: User,
    accent: "slate",
    href: "/profile",
    items: [
      { href: "/profile#certificates", label: "Certificates", icon: Award },
      { href: "/profile#achievements", label: "Achievements", icon: Trophy },
      { href: "/profile#saved-questions", label: "Saved Questions", icon: Bookmark },
      { href: "/star-stories", label: "Saved STAR Stories", icon: Star },
      { href: "/profile#resume-library", label: "Resume Library", icon: FolderOpen },
      { href: "/profile#learning", label: "Learning Progress", icon: TrendingUp },
      { href: "/history", label: "Interview History", icon: History },
      { href: "/profile#settings", label: "Settings", icon: Settings },
    ],
  },
];
