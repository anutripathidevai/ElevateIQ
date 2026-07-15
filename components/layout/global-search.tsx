"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  MessagesSquare,
  Newspaper,
  FileText,
  GraduationCap,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  label: string;
  category: string;
  href: string;
  icon: LucideIcon;
}

const INDEX: SearchResult[] = [
  { label: "Azure Fundamentals Course", category: "Courses", href: "/learning#azure", icon: BookOpen },
  { label: "AWS Fundamentals Course", category: "Courses", href: "/learning#aws", icon: BookOpen },
  { label: "Generative AI Essentials", category: "Courses", href: "/learning#genai", icon: BookOpen },
  { label: "Azure Interview Questions", category: "Interview Questions", href: "/companies", icon: MessagesSquare },
  { label: "System Design Questions", category: "Interview Questions", href: "/companies", icon: MessagesSquare },
  { label: "Behavioral Questions", category: "Interview Questions", href: "/practice/behavioral", icon: MessagesSquare },
  { label: "Cracking the Behavioral Round", category: "Blogs", href: "/resources#blogs", icon: Newspaper },
  { label: "Reading System Design Papers", category: "Blogs", href: "/resources#blogs", icon: Newspaper },
  { label: "Azure Resume Tips", category: "Resume", href: "/career#resume-builder", icon: FileText },
  { label: "ATS Resume Checker", category: "Resume", href: "/career#ats", icon: FileText },
  { label: "Azure Mock Interview", category: "Mock Interviews", href: "/panel", icon: GraduationCap },
  { label: "Senior Engineer Panel", category: "Mock Interviews", href: "/panel", icon: GraduationCap },
  { label: "Generate a STAR Story", category: "AI Tools", href: "/star-stories", icon: Sparkles },
];

/** Global omni-search in the top bar. Filters a sample index of everything. */
export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? INDEX.filter(
          (r) =>
            r.label.toLowerCase().includes(q) ||
            r.category.toLowerCase().includes(q),
        )
      : INDEX;
    return matches.reduce<Record<string, SearchResult[]>>((acc, r) => {
      (acc[r.category] ??= []).push(r);
      return acc;
    }, {});
  }, [query]);

  const hasResults = Object.keys(grouped).length > 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-md"
      onBlur={(e) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node)) {
          setOpen(false);
        }
      }}
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search courses, questions, resumes, blogs…"
          aria-label="Global search"
          className="h-9 w-full rounded-lg border border-border bg-muted/40 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary/50 focus:bg-background"
        />
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-11 z-50 max-h-[70vh] overflow-y-auto rounded-xl border border-border bg-popover p-2 shadow-lg">
          {hasResults ? (
            Object.entries(grouped).map(([category, results]) => (
              <div key={category} className="mb-1.5 last:mb-0">
                <p className="px-2 py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
                  {category}
                </p>
                {results.map((r) => {
                  const Icon = r.icon;
                  return (
                    <Link
                      key={`${r.category}-${r.label}`}
                      href={r.href}
                      onClick={() => {
                        setOpen(false);
                        setQuery("");
                      }}
                      className="flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 truncate">{r.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))
          ) : (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              No results for “{query}”.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
