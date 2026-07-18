"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { TOPIC_SECTIONS } from "./sections";

/**
 * Sticky, scroll-spy table of contents for a topic page. Receives the ids of
 * the sections actually present on the page (they vary per topic) and renders
 * only those, in canonical order, highlighting the one currently in view.
 */
export function TopicToc({ sectionIds }: { sectionIds: string[] }) {
  const items = useMemo(
    () => TOPIC_SECTIONS.filter((s) => sectionIds.includes(s.id)),
    [sectionIds],
  );
  const [active, setActive] = useState<string>(items[0]?.id ?? "");

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
    for (const s of items) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="On this page" className="space-y-0.5 text-sm">
      <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        On this page
      </p>
      {items.map(({ id, label, icon: Icon }) => (
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
      ))}
    </nav>
  );
}
