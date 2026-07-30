"use client";

import { useEffect, useState } from "react";
import { ListTree, PanelRight, PanelRightClose, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFocusMode } from "./focus-mode-context";
import { SidebarToggle } from "./sidebar-toggle";

/** A single anchored section rendered in the "On this page" table of contents. */
export interface TocSection {
  id: string;
  label: string;
}

/**
 * Scroll-spy over the given section anchors. Highlights whichever section is
 * currently in view. Kept as a hook so it runs independently in the desktop
 * panel and the mobile sheet, and so tracking continues even while the panel is
 * visually collapsed (the component stays mounted).
 */
function useScrollSpy(sections: TocSection[]): string {
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
    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  return active;
}

function TocList({
  sections,
  active,
  onNavigate,
}: {
  sections: TocSection[];
  active: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="On this page" className="space-y-0.5 border-l border-border">
      {sections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          onClick={onNavigate}
          aria-current={active === s.id ? "location" : undefined}
          className={cn(
            "-ml-px block border-l-2 px-3 py-1 text-sm transition-colors",
            active === s.id
              ? "border-primary font-medium text-foreground"
              : "border-transparent text-muted-foreground hover:border-primary/50 hover:text-foreground",
          )}
        >
          {s.label}
        </a>
      ))}
    </nav>
  );
}

/** Desktop panel body: header with collapse control, then the scroll-spy list. */
function OnThisPage({ sections }: { sections: TocSection[] }) {
  const { toggleRight } = useFocusMode();
  const active = useScrollSpy(sections);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          On this page
        </p>
        <SidebarToggle
          icon={PanelRightClose}
          label="Hide table of contents"
          onClick={toggleRight}
          tooltipSide="left"
          expanded
          controls="on-this-page"
        />
      </div>
      <div className="max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
        <TocList sections={sections} active={active} />
      </div>
    </div>
  );
}

/** Slide-up bottom sheet used for the TOC on mobile/tablet. */
function MobileTocSheet({
  sections,
  onClose,
}: {
  sections: TocSection[];
  onClose: () => void;
}) {
  const active = useScrollSpy(sections);

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="On this page"
    >
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-0 max-h-[70vh] overflow-y-auto rounded-t-2xl border-t border-border bg-background p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">On this page</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close table of contents"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <TocList sections={sections} active={active} onNavigate={onClose} />
      </div>
    </div>
  );
}

export interface ReadingLayoutProps {
  /** Anchored sections that make up the table of contents. */
  sections: TocSection[];
  /** The main article content. */
  children: React.ReactNode;
  className?: string;
}

/**
 * Two-pane reading layout used across every learning detail page. The main
 * column flexes to fill available space while the right "On this page" panel can
 * be collapsed independently (see {@link useFocusMode}). Collapsing animates the
 * panel width to zero and reveals a floating edge toggle; on mobile/tablet the
 * TOC is reached through a floating button that opens a bottom sheet. The panel
 * stays mounted while collapsed so active-section tracking is never lost.
 */
export function ReadingLayout({
  sections,
  children,
  className,
}: ReadingLayoutProps) {
  const {
    rightOpen,
    toggleRight,
    mounted,
    mobileTocOpen,
    openMobileToc,
    closeMobileToc,
  } = useFocusMode();

  const hasSections = sections.length > 0;

  return (
    <div className={cn("relative", className)}>
      <div className="flex gap-8">
        <div className="min-w-0 flex-1">{children}</div>

        {hasSections && (
          <aside
            id="on-this-page"
            aria-label="On this page"
            aria-hidden={!rightOpen}
            className={cn(
              "hidden shrink-0 overflow-hidden lg:block",
              mounted && "transition-[width,opacity] duration-300 ease-in-out",
              rightOpen
                ? "w-60 opacity-100"
                : "pointer-events-none w-0 opacity-0",
            )}
          >
            <div className="sticky top-20 w-60">
              <OnThisPage sections={sections} />
            </div>
          </aside>
        )}
      </div>

      {hasSections && !rightOpen && (
        <div className="fixed right-3 top-20 z-30 hidden lg:block">
          <SidebarToggle
            icon={PanelRight}
            label="Show table of contents"
            onClick={toggleRight}
            tooltipSide="left"
            expanded={false}
            controls="on-this-page"
          />
        </div>
      )}

      {hasSections && (
        <button
          type="button"
          onClick={openMobileToc}
          className="fixed bottom-4 right-4 z-30 flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium shadow-lg transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:hidden"
        >
          <ListTree className="h-4 w-4" aria-hidden="true" />
          On this page
        </button>
      )}

      {hasSections && mobileTocOpen && (
        <MobileTocSheet sections={sections} onClose={closeMobileToc} />
      )}
    </div>
  );
}
