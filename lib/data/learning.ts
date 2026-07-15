import { Brain, Cloud, Network, Sparkles } from "lucide-react";
import type { Course, LearningPath, Certificate, Lesson } from "@/lib/types";

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

/** Representative lessons for the Azure course (DB-ready shape). */
export const AZURE_LESSONS: Lesson[] = [
  { id: "az-1", courseId: "azure", title: "What is Azure?", durationMinutes: 8, type: "video", completed: true, order: 1 },
  { id: "az-2", courseId: "azure", title: "Core Compute Services", durationMinutes: 14, type: "video", completed: true, order: 2 },
  { id: "az-3", courseId: "azure", title: "Storage Options", durationMinutes: 12, type: "reading", completed: true, order: 3 },
  { id: "az-4", courseId: "azure", title: "Identity and Access Management", durationMinutes: 18, type: "video", completed: false, order: 4 },
  { id: "az-5", courseId: "azure", title: "IAM Hands-on Lab", durationMinutes: 25, type: "lab", completed: false, order: 5 },
  { id: "az-6", courseId: "azure", title: "Module Quiz", durationMinutes: 10, type: "quiz", completed: false, order: 6 },
];

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

export const CERTIFICATES: Certificate[] = [
  { id: "cert1", title: "Azure Fundamentals (in progress)", issuer: "ElevateIQ", date: "48% complete", status: "in-progress" },
  { id: "cert2", title: "System Design Foundations", issuer: "ElevateIQ", date: "Jun 2026", status: "earned" },
  { id: "cert3", title: "DSA Problem Solving", issuer: "ElevateIQ", date: "May 2026", status: "earned" },
];
