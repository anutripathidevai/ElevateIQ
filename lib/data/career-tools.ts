import { ClipboardCheck, FileText, Rocket, Target } from "lucide-react";
import type {
  CareerTool,
  AtsMetric,
  JobRow,
  ATSReport,
  ResumeVersion,
} from "@/lib/types";

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

/** Full ATS report (DB-ready shape) composed from the metrics above. */
export const LATEST_ATS_REPORT: ATSReport = {
  id: "ats_report_1",
  resumeVersionId: "resume_v3",
  overallScore: 82,
  metrics: ATS_METRICS,
  missingKeywords: ATS_MISSING_KEYWORDS,
  generatedAt: "2026-07-14T10:00:00.000Z",
};

export const RESUME_LIBRARY: ResumeVersion[] = [
  { id: "resume_v3", userId: "u_demo", name: "v3 — Azure focused", updatedAt: "2026-07-14", atsScore: 82 },
  { id: "resume_v2", userId: "u_demo", name: "v2 — Backend generalist", updatedAt: "2026-06-30", atsScore: 76 },
  { id: "resume_v1", userId: "u_demo", name: "v1 — General SWE", updatedAt: "2026-05-12", atsScore: 68 },
];

export const JOB_ROWS: JobRow[] = [
  { id: "j1", company: "Microsoft", role: "Senior SWE", status: "Interviewing", resumeVersion: "v3 — Azure", interviewDate: "Jul 18", notes: "Panel: SD + Behavioral" },
  { id: "j2", company: "Google", role: "SWE III", status: "Applied", resumeVersion: "v2 — Backend", interviewDate: "—", notes: "Referral pending" },
  { id: "j3", company: "Stripe", role: "Backend Engineer", status: "Saved", resumeVersion: "v3 — Azure", interviewDate: "—", notes: "Payments team" },
  { id: "j4", company: "Amazon", role: "SDE II", status: "Rejected", resumeVersion: "v1 — General", interviewDate: "Jun 30", notes: "Retry in 6 months" },
];
