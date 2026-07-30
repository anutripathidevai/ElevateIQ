import {
  BookOpen,
  FileText,
  GraduationCap,
  MessagesSquare,
  Newspaper,
  Sparkles,
} from "lucide-react";
import type { SearchResult } from "@/lib/types";

/**
 * The searchable index behind the global omni-search. Grouped by category in
 * the UI. Kept flat here so it maps cleanly to a future full-text search table.
 */
export const SEARCH_INDEX: SearchResult[] = [
  { id: "s1", label: "Azure Fundamentals Course", category: "Courses", href: "/learning#azure", icon: BookOpen },
  { id: "s2", label: "AWS Fundamentals Course", category: "Courses", href: "/learning#aws", icon: BookOpen },
  { id: "s3", label: "Generative AI", category: "Courses", href: "/learning/generative-ai", icon: BookOpen },
  { id: "s4", label: "Azure Interview Questions", category: "Interview Questions", href: "/companies", icon: MessagesSquare },
  { id: "s5", label: "System Design Questions", category: "Interview Questions", href: "/practice/system-design", icon: MessagesSquare },
  { id: "s6", label: "Behavioral Questions", category: "Interview Questions", href: "/practice/behavioral", icon: MessagesSquare },
  { id: "s7", label: "Cracking the Behavioral Round", category: "Blogs", href: "/resources#blogs", icon: Newspaper },
  { id: "s8", label: "Reading System Design Papers", category: "Blogs", href: "/resources#blogs", icon: Newspaper },
  { id: "s9", label: "Azure Resume Tips", category: "Resume", href: "/career#resume-builder", icon: FileText },
  { id: "s10", label: "ATS Resume Checker", category: "Resume", href: "/career#ats", icon: FileText },
  { id: "s11", label: "Azure Mock Interview", category: "Mock Interviews", href: "/panel", icon: GraduationCap },
  { id: "s12", label: "Senior Engineer Panel", category: "Mock Interviews", href: "/panel", icon: GraduationCap },
  { id: "s13", label: "AI STAR Story Generator", category: "AI Tools", href: "/star-stories", icon: Sparkles },
];

/** Category display order for the search dropdown. */
export const SEARCH_CATEGORY_ORDER = [
  "Courses",
  "Interview Questions",
  "Blogs",
  "Resume",
  "Mock Interviews",
  "AI Tools",
] as const;
