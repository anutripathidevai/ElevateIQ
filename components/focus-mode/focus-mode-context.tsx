"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useMediaQuery } from "./use-media-query";

const STORAGE_KEY = "elevateiq_focus_mode";

/** Shape persisted to localStorage. */
interface PersistedFocusMode {
  leftSidebar: boolean;
  rightSidebar: boolean;
}

export interface FocusModeContextValue {
  /** Whether the left navigation sidebar is expanded (desktop preference). */
  leftOpen: boolean;
  /** Whether the right "On this page" panel is expanded (desktop preference). */
  rightOpen: boolean;
  toggleLeft: () => void;
  toggleRight: () => void;
  /** Hide both when either is open, otherwise show both. */
  toggleFocus: () => void;
  setLeft: (open: boolean) => void;
  setRight: (open: boolean) => void;
  /** Mobile/tablet bottom-sheet table of contents. */
  mobileTocOpen: boolean;
  openMobileToc: () => void;
  closeMobileToc: () => void;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  /** True once the stored preference has been hydrated (gates animations). */
  mounted: boolean;
}

const FocusModeContext = createContext<FocusModeContextValue | null>(null);

function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el || typeof el.tagName !== "string") return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (el.isContentEditable) return true;
  // Never hijack shortcuts (e.g. Ctrl+[) while typing in a code editor.
  return Boolean(el.closest?.(".monaco-editor, [role='textbox']"));
}

/**
 * Owns focus-mode state for the app shell: which sidebars are visible, the
 * mobile TOC sheet, persistence, keyboard shortcuts, and responsive breakpoints.
 * A single provider wraps the authenticated layout so the left sidebar and every
 * learning page's right TOC share one source of truth.
 */
export function FocusModeProvider({ children }: { children: React.ReactNode }) {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isDesktop = useMediaQuery("(min-width: 1280px)");
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1279px)");
  const isMobile = useMediaQuery("(max-width: 767px)");

  // Keep live refs so `toggleFocus` can read both values without re-creating.
  const leftRef = useRef(leftOpen);
  const rightRef = useRef(rightOpen);
  leftRef.current = leftOpen;
  rightRef.current = rightOpen;

  // Hydrate the stored preference after mount to avoid SSR mismatch.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistedFocusMode>;
        if (typeof parsed.leftSidebar === "boolean") setLeftOpen(parsed.leftSidebar);
        if (typeof parsed.rightSidebar === "boolean") setRightOpen(parsed.rightSidebar);
      }
    } catch {
      /* ignore malformed storage */
    }
    setMounted(true);
  }, []);

  // Persist whenever the preference changes (after hydration).
  useEffect(() => {
    if (!mounted) return;
    try {
      const payload: PersistedFocusMode = {
        leftSidebar: leftOpen,
        rightSidebar: rightOpen,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* storage may be unavailable (private mode) */
    }
  }, [leftOpen, rightOpen, mounted]);

  const toggleLeft = useCallback(() => setLeftOpen((v) => !v), []);
  const toggleRight = useCallback(() => setRightOpen((v) => !v), []);
  const setLeft = useCallback((open: boolean) => setLeftOpen(open), []);
  const setRight = useCallback((open: boolean) => setRightOpen(open), []);
  const toggleFocus = useCallback(() => {
    const next = !(leftRef.current || rightRef.current);
    setLeftOpen(next);
    setRightOpen(next);
  }, []);
  const openMobileToc = useCallback(() => setMobileTocOpen(true), []);
  const closeMobileToc = useCallback(() => setMobileTocOpen(false), []);

  // Global keyboard shortcuts + ESC to close the mobile sheet.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileTocOpen(false);
        return;
      }
      const mod = e.ctrlKey || e.metaKey;
      if (!mod || isEditableTarget(e.target)) return;

      if (e.shiftKey && (e.key === "f" || e.key === "F")) {
        e.preventDefault();
        toggleFocus();
      } else if (e.key === "[") {
        e.preventDefault();
        toggleLeft();
      } else if (e.key === "]") {
        e.preventDefault();
        toggleRight();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleFocus, toggleLeft, toggleRight]);

  // Close the mobile sheet once we grow back to a desktop TOC.
  useEffect(() => {
    if (isDesktop) setMobileTocOpen(false);
  }, [isDesktop]);

  const value = useMemo<FocusModeContextValue>(
    () => ({
      leftOpen,
      rightOpen,
      toggleLeft,
      toggleRight,
      toggleFocus,
      setLeft,
      setRight,
      mobileTocOpen,
      openMobileToc,
      closeMobileToc,
      isMobile,
      isTablet,
      isDesktop,
      mounted,
    }),
    [
      leftOpen,
      rightOpen,
      toggleLeft,
      toggleRight,
      toggleFocus,
      setLeft,
      setRight,
      mobileTocOpen,
      openMobileToc,
      closeMobileToc,
      isMobile,
      isTablet,
      isDesktop,
      mounted,
    ],
  );

  return (
    <FocusModeContext.Provider value={value}>
      {children}
    </FocusModeContext.Provider>
  );
}

/** Access focus-mode state. Must be used within a {@link FocusModeProvider}. */
export function useFocusMode(): FocusModeContextValue {
  const ctx = useContext(FocusModeContext);
  if (!ctx) {
    throw new Error("useFocusMode must be used within a FocusModeProvider");
  }
  return ctx;
}
