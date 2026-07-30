import { BookOpen, Boxes, FileText, MessagesSquare, Network, Target } from "lucide-react";
import type { ResourceGroup } from "@/lib/types";

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
