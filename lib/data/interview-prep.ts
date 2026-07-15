import type { Question, InterviewProblem } from "@/lib/types";

/**
 * Sample company question bank rows (DB-ready shape). The deep company-bank
 * feature lives under `features/company-bank`; this is a lightweight sample
 * used by search and future dashboards.
 */
export const SAMPLE_QUESTIONS: Question[] = [
  {
    id: "q1",
    company: "Microsoft",
    category: "System Design",
    difficulty: "Hard",
    experienceLevel: "Senior Engineer",
    tags: ["scalability", "rate-limiting"],
    prompt: "Design a distributed rate limiter for a global API gateway.",
    href: "/companies",
  },
  {
    id: "q2",
    company: "Google",
    category: "DSA",
    difficulty: "Medium",
    experienceLevel: "Intermediate",
    tags: ["graphs", "cycle-detection"],
    prompt: "Detect a cycle in a directed graph.",
    href: "/practice/dsa",
  },
  {
    id: "q3",
    company: "Amazon",
    category: "Behavioral",
    difficulty: "Medium",
    experienceLevel: "Senior Engineer",
    tags: ["leadership-principles", "conflict"],
    prompt: "Tell me about a time you disagreed with your manager.",
    href: "/practice/behavioral",
  },
];

export const SAMPLE_PROBLEMS: InterviewProblem[] = [
  { id: "ip1", slug: "course-schedule-ii", track: "dsa", title: "Course Schedule II", difficulty: "Medium", tags: ["graphs", "topo-sort"], solved: true, href: "/practice/dsa" },
  { id: "ip2", slug: "word-ladder", track: "dsa", title: "Word Ladder", difficulty: "Hard", tags: ["graphs", "bfs"], solved: false, href: "/practice/dsa" },
  { id: "ip3", slug: "url-shortener", track: "system-design", title: "Design a URL Shortener", difficulty: "Medium", tags: ["hashing", "storage"], solved: false, href: "/practice/system-design" },
  { id: "ip4", slug: "parking-lot", track: "lld", title: "Design a Parking Lot", difficulty: "Medium", tags: ["oop", "state"], solved: false, href: "/practice/lld" },
];
