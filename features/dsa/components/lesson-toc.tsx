"use client";

import { useEffect, useState } from "react";
import {
  ArrowRightLeft,
  Boxes,
  Code2,
  FileText,
  Gauge,
  KeyRound,
  Lightbulb,
  MessagesSquare,
  Network,
  PlayCircle,
  Target,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LessonSection, SectionIconKey } from "./lesson-sections";

const SECTION_ICONS: Record<SectionIconKey, LucideIcon> = {
  statement: FileText,
  objectives: Target,
  intuition: Lightbulb,
  "state-definition": Boxes,
  "state-transition": ArrowRightLeft,
  algorithm: Workflow,
  solutions: Code2,
  "dry-run": PlayCircle,
  complexity: Gauge,
  "interview-tips": MessagesSquare,
  similar: Network,
  takeaways: KeyRound,
  section: FileText,
};

/**
 * Sticky table of contents with scroll-spy, generic over a section list so it
 * serves both problem and concept lessons. Highlights the section currently in
 * view via an IntersectionObserver and lets the learner jump between sections.
 */
export function LessonToc({ sections }: { sections: LessonSection[] }) {
  const [active, setActive] = useState<string>(sections[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) setActive(visible[0].target.id);
      },
      { rootMargin: "-88px 0px -65% 0px", threshold: 0 },
    );
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav aria-label="On this page" className="space-y-0.5 text-sm">
      <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        On this page
      </p>
      {sections.map(({ id, label, iconKey }) => {
        const Icon = SECTION_ICONS[iconKey];
        return (
          <a
            key={id}
            href={`#${id}`}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors",
              active === id
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{label}</span>
          </a>
        );
      })}
    </nav>
  );
}
