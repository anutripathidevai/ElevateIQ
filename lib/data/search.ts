import {
  BookOpen,
  FileText,
  GraduationCap,
  MessagesSquare,
  Newspaper,
  Sparkles,
} from "lucide-react";
import type { SearchResult } from "@/lib/types";
import { LEARNING_SEARCH_INDEX } from "@/lib/data/learning-search";

/**
 * Hand-curated app entries (tools, blogs, career, mock interviews). Learning
 * content is appended from the per-track registries via `LEARNING_SEARCH_INDEX`
 * so every published lesson/problem/question is discoverable without hardcoding.
 */
const APP_SEARCH_INDEX: SearchResult[] = [
  { id: "s1", label: "Azure Fundamentals Course", category: "Courses", href: "/learning#azure", icon: BookOpen },
  { id: "s2", label: "AWS Fundamentals Course", category: "Courses", href: "/learning#aws", icon: BookOpen },
  { id: "s4", label: "Company Question Bank", category: "Interview Questions", href: "/companies", icon: MessagesSquare },
  { id: "s6", label: "Behavioral Questions", category: "Interview Questions", href: "/practice/behavioral", icon: MessagesSquare },
  { id: "s7", label: "Cracking the Behavioral Round", category: "Blogs", href: "/resources#blogs", icon: Newspaper },
  { id: "s8", label: "Reading System Design Papers", category: "Blogs", href: "/resources#blogs", icon: Newspaper },
  { id: "s9", label: "Azure Resume Tips", category: "Resume", href: "/career#resume-builder", icon: FileText },
  { id: "s10", label: "ATS Resume Checker", category: "Resume", href: "/career#ats", icon: FileText },
  { id: "s11", label: "AI Panel Interview", category: "Mock Interviews", href: "/panel", icon: GraduationCap },
  { id: "s12", label: "Mock Interview", category: "Mock Interviews", href: "/mock", icon: GraduationCap },
  { id: "s13", label: "AI STAR Story Generator", category: "AI Tools", href: "/star-stories", icon: Sparkles },
];

/**
 * The searchable index behind the global omni-search. Grouped by category in
 * the UI. Kept flat here so it maps cleanly to a future full-text search table.
 */
export const SEARCH_INDEX: SearchResult[] = [
  ...APP_SEARCH_INDEX,
  ...LEARNING_SEARCH_INDEX,
];

/** Category display order for the search dropdown. */
export const SEARCH_CATEGORY_ORDER = [
  "Courses",
  "DSA",
  "System Design",
  "Low Level Design",
  "Generative AI",
  "Programming Languages",
  "Interview Questions",
  "Blogs",
  "Resume",
  "Mock Interviews",
  "AI Tools",
] as const;
