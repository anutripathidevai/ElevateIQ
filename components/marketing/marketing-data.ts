import {
  Binary,
  Boxes,
  BrainCircuit,
  Braces,
  Code2,
  GitBranch,
  GraduationCap,
  Layers,
  LineChart,
  MessagesSquare,
  Network,
  Route,
  ScanSearch,
  Sparkles,
  Target,
  TreePine,
  type LucideIcon,
} from "lucide-react";
import type { AccentKey } from "@/lib/navigation";

/**
 * Content + routing config for the Compile Ready marketing site.
 *
 * Every `href` resolves to a real route in the app (the authenticated pages
 * live under the `(app)` group, the public pages under `(marketing)`), so no
 * navbar or CTA link is ever broken.
 */

export interface MarketingNavItem {
  label: string;
  href: string;
  description: string;
  icon: LucideIcon;
  accent: AccentKey;
}

export interface MarketingNavMenu {
  id: string;
  label: string;
  /** Landing route when the top-level label itself is clicked. */
  href: string;
  items: MarketingNavItem[];
}

export const NAV_MENUS: MarketingNavMenu[] = [
  {
    id: "learn",
    label: "Learn",
    href: "/learning",
    items: [
      {
        label: "DSA",
        href: "/learning/dsa",
        description: "Patterns, data structures & algorithms",
        icon: Layers,
        accent: "blue",
      },
      {
        label: "System Design",
        href: "/learning/system-design",
        description: "Scalable, distributed architecture",
        icon: Network,
        accent: "violet",
      },
      {
        label: "Low-Level Design",
        href: "/learning/lld",
        description: "OOP, SOLID, patterns & machine coding",
        icon: Boxes,
        accent: "emerald",
      },
      {
        label: "Programming",
        href: "/learning/languages",
        description: "Deep dives into core languages",
        icon: Code2,
        accent: "orange",
      },
      {
        label: "Generative AI",
        href: "/learning/generative-ai",
        description: "LLMs, RAG & modern AI engineering",
        icon: BrainCircuit,
        accent: "rose",
      },
      {
        label: "Learning Paths",
        href: "/learning",
        description: "Guided, role-based roadmaps",
        icon: Route,
        accent: "cyan",
      },
    ],
  },
  {
    id: "practice",
    label: "Practice",
    href: "/practice",
    items: [
      {
        label: "Coding Problems",
        href: "/practice/dsa",
        description: "Solve and get instant AI review",
        icon: Code2,
        accent: "blue",
      },
      {
        label: "Interview Patterns",
        href: "/practice#patterns",
        description: "Learn the patterns behind the problems",
        icon: Target,
        accent: "violet",
      },
      {
        label: "Assessments",
        href: "/practice#assessments",
        description: "Timed, interview-style challenges",
        icon: LineChart,
        accent: "emerald",
      },
      {
        label: "Daily Challenge",
        href: "/practice#daily",
        description: "Keep the streak going every day",
        icon: GitBranch,
        accent: "orange",
      },
    ],
  },
  {
    id: "interview-prep",
    label: "AI Interview Prep",
    href: "/mock",
    items: [
      {
        label: "AI Mock Interview",
        href: "/mock",
        description: "Realistic AI-driven mock rounds",
        icon: GraduationCap,
        accent: "blue",
      },
      {
        label: "AI Panel Interview",
        href: "/panel",
        description: "Face a three-persona AI panel",
        icon: MessagesSquare,
        accent: "violet",
      },
      {
        label: "Behavioral Interview",
        href: "/practice/behavioral",
        description: "STAR stories & leadership signals",
        icon: Sparkles,
        accent: "orange",
      },
      {
        label: "Company Preparation",
        href: "/companies",
        description: "Real questions from the companies that matter",
        icon: Target,
        accent: "emerald",
      },
    ],
  },
];

/** Simple top-level links shown after the dropdown menus. */
export const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Pricing", href: "/pricing" },
];

// --- Build / Test / Deploy ------------------------------------------------

export interface JourneyStep {
  index: string;
  kicker: string;
  title: string;
  description: string;
  cta: { label: string; href: string };
  icon: LucideIcon;
  accent: AccentKey;
}

export const JOURNEY_STEPS: JourneyStep[] = [
  {
    index: "01",
    kicker: "Build",
    title: "Build the skills.",
    description:
      "Learn DSA, System Design, LLD, programming, AI and the fundamentals that matter.",
    cta: { label: "Start Learning", href: "/learning" },
    icon: Layers,
    accent: "blue",
  },
  {
    index: "02",
    kicker: "Test",
    title: "Test yourself.",
    description:
      "Practice coding problems, interview patterns, assessments and realistic interview scenarios.",
    cta: { label: "Start Practicing", href: "/practice" },
    icon: Target,
    accent: "violet",
  },
  {
    index: "03",
    kicker: "Deploy",
    title: "Deploy your career.",
    description:
      "Practice mock interviews, identify weaknesses, and prepare for the companies and roles you want.",
    cta: { label: "Get Interview Ready", href: "/mock" },
    icon: GraduationCap,
    accent: "emerald",
  },
];

// --- Learning grid --------------------------------------------------------

export interface LearningCard {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accent: AccentKey;
}

export const LEARNING_CARDS: LearningCard[] = [
  {
    title: "DSA",
    description: "Master problem-solving patterns for coding interviews.",
    href: "/learning/dsa",
    icon: Layers,
    accent: "blue",
  },
  {
    title: "System Design",
    description: "Learn to design scalable, distributed systems.",
    href: "/learning/system-design",
    icon: Network,
    accent: "violet",
  },
  {
    title: "Low-Level Design",
    description: "Master OOP, SOLID, design patterns and machine coding.",
    href: "/learning/lld",
    icon: Boxes,
    accent: "emerald",
  },
  {
    title: "Generative AI",
    description: "Learn modern AI and LLM engineering.",
    href: "/learning/generative-ai",
    icon: BrainCircuit,
    accent: "rose",
  },
];

// --- Practice patterns ----------------------------------------------------

export interface PatternProgress {
  label: string;
  value: number;
  icon: LucideIcon;
  accent: AccentKey;
}

/** Representative pattern coverage shown in the "Practice with purpose" preview. */
export const PATTERNS: PatternProgress[] = [
  { label: "Sliding Window", value: 92, icon: ScanSearch, accent: "blue" },
  { label: "Two Pointers", value: 84, icon: GitBranch, accent: "violet" },
  { label: "Binary Search", value: 78, icon: Binary, accent: "emerald" },
  { label: "Trees & Graphs", value: 71, icon: TreePine, accent: "cyan" },
  { label: "Dynamic Programming", value: 52, icon: Braces, accent: "orange" },
  { label: "Backtracking", value: 46, icon: Route, accent: "rose" },
];

export const PATTERN_TAGS: string[] = [
  "Sliding Window",
  "Two Pointers",
  "Binary Search",
  "Trees",
  "Graphs",
  "Dynamic Programming",
  "Backtracking",
  "Greedy",
  "Monotonic Stack",
];

// --- Companies ------------------------------------------------------------

export const COMPANIES: string[] = [
  "Google",
  "Microsoft",
  "Amazon",
  "Meta",
  "Apple",
  "Netflix",
  "Uber",
  "Adobe",
  "Atlassian",
];

// --- Career levels --------------------------------------------------------

export interface CareerLevel {
  kicker: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: AccentKey;
}

export const CAREER_LEVELS: CareerLevel[] = [
  {
    kicker: "Beginner",
    title: "New to interviews",
    description:
      "Build strong programming and problem-solving fundamentals.",
    icon: Code2,
    accent: "blue",
  },
  {
    kicker: "Software Engineer",
    title: "Landing your next role",
    description:
      "Prepare for coding, LLD, System Design and technical interviews.",
    icon: Target,
    accent: "violet",
  },
  {
    kicker: "Senior / Staff",
    title: "Levelling up",
    description:
      "Master architecture, System Design, distributed systems and leadership.",
    icon: Network,
    accent: "emerald",
  },
];

// --- Readiness ------------------------------------------------------------

export interface ReadinessMetric {
  label: string;
  value: number;
  accent: AccentKey;
}

export const READINESS_OVERALL = 78;

export const READINESS_METRICS: ReadinessMetric[] = [
  { label: "DSA", value: 86, accent: "blue" },
  { label: "System Design", value: 72, accent: "violet" },
  { label: "LLD", value: 81, accent: "emerald" },
  { label: "Coding", value: 89, accent: "orange" },
  { label: "Behavioral", value: 65, accent: "rose" },
];

export const RECOMMENDED_NEXT: string[] = [
  "Dynamic Programming",
  "System Design: Caching",
  "Behavioral: Leadership",
];

// --- FAQ ------------------------------------------------------------------

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQS: FaqItem[] = [
  {
    question: "What is Compile Ready?",
    answer:
      "Compile Ready is a software engineering interview preparation platform. It helps you learn the fundamentals, practice the right problems, and rehearse realistic interviews with AI feedback — so you walk in ready.",
  },
  {
    question: "Who is Compile Ready for?",
    answer:
      "Engineers at every stage — from beginners building fundamentals to senior and staff engineers preparing for architecture and leadership rounds.",
  },
  {
    question: "What topics does Compile Ready cover?",
    answer:
      "Data Structures & Algorithms, System Design (HLD), Low-Level Design (LLD), programming languages, Generative AI, and behavioral interviews, plus company-focused preparation.",
  },
  {
    question: "Can beginners use Compile Ready?",
    answer:
      "Yes. Structured learning paths start with core programming and problem-solving fundamentals and build up to full interview readiness at your own pace.",
  },
  {
    question: "Can I prepare for senior software engineering interviews?",
    answer:
      "Absolutely. Compile Ready covers System Design, distributed systems, low-level design and behavioral leadership signals that senior and staff interviews focus on.",
  },
  {
    question: "Does Compile Ready offer mock interviews?",
    answer:
      "Yes. Practice realistic mock interviews — including a multi-persona AI panel — and get a scorecard, per-interviewer feedback, and a personalized improvement plan.",
  },
  {
    question: "How does AI help with interview preparation?",
    answer:
      "AI reviews your code, designs and answers for correctness, complexity, scalability and trade-offs, simulates interviewers, and pinpoints exactly where to improve next.",
  },
];

// --- Footer ---------------------------------------------------------------

export interface FooterGroup {
  title: string;
  links: { label: string; href: string }[];
}

export const FOOTER_GROUPS: FooterGroup[] = [
  {
    title: "Product",
    links: [
      { label: "Learn", href: "/learning" },
      { label: "Practice", href: "/practice" },
      { label: "Interviews", href: "/mock" },
      { label: "AI", href: "/panel" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "DSA", href: "/learning/dsa" },
      { label: "System Design", href: "/learning/system-design" },
      { label: "LLD", href: "/learning/lld" },
      { label: "Programming", href: "/learning/languages" },
      { label: "Generative AI", href: "/learning/generative-ai" },
      { label: "Blog", href: "/resources" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/contact" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Disclaimer", href: "/disclaimer" },
    ],
  },
];
