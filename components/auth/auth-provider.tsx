"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AuthUser, ExperienceLevel } from "@/lib/types";

const STORAGE_KEY = "elevateiq_auth_user";

/** Payload collected by the signup form. */
export interface SignupInput {
  fullName: string;
  email: string;
  password: string;
  targetRole: string;
  targetCompany: string;
  experienceLevel: ExperienceLevel;
  dailyStudyHours: number;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** True until localStorage has been read on the client (avoids hydration flashes). */
  isLoading: boolean;
  login: (email: string, password: string) => AuthUser;
  signup: (input: SignupInput) => AuthUser;
  logout: () => void;
  updateProfile: (patch: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function makeId() {
  return `u_${Math.random().toString(36).slice(2, 10)}`;
}

/** Turn "ada.lovelace@x.com" into "Ada Lovelace" for returning mock logins. */
function nameFromEmail(email: string) {
  const local = email.split("@")[0] ?? "";
  return (
    local
      .split(/[._-]+/)
      .filter(Boolean)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ") || "Compile Ready User"
  );
}

function baseProfile(): Omit<AuthUser, "id" | "fullName" | "email" | "createdAt"> {
  return {
    avatarUrl: null,
    targetRole: "Senior Software Engineer",
    targetCompany: "Microsoft",
    experienceLevel: "Senior Engineer",
    dailyStudyHours: 2,
    interviewDate: null,
    weakAreas: [],
    learningTopics: [],
    location: "",
    headline: "",
    skills: [],
    streakDays: 0,
    onboarded: false,
  };
}

/**
 * Mock authentication provider backed by localStorage.
 *
 * This intentionally mimics the *shape* of a real auth system (a persisted
 * user, loading state, login/signup/logout/updateProfile actions) so that
 * swapping in a real backend later is a matter of changing the implementation
 * of these callbacks — consumers keep using {@link useAuth} unchanged.
 */
export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from localStorage once on mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as AuthUser);
    } catch {
      // Corrupt/unavailable storage — treat as logged out.
    }
    setIsLoading(false);
  }, []);

  const persist = useCallback((next: AuthUser | null) => {
    setUser(next);
    try {
      if (next) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage write failures in mock mode.
    }
  }, []);

  const login = useCallback(
    (email: string, _password: string) => {
      const next: AuthUser = {
        id: makeId(),
        fullName: nameFromEmail(email),
        email,
        createdAt: new Date().toISOString(),
        ...baseProfile(),
        // A returning user has already onboarded.
        onboarded: true,
        streakDays: 6,
      };
      persist(next);
      return next;
    },
    [persist],
  );

  const signup = useCallback(
    (input: SignupInput) => {
      const next: AuthUser = {
        id: makeId(),
        fullName: input.fullName,
        email: input.email,
        createdAt: new Date().toISOString(),
        ...baseProfile(),
        targetRole: input.targetRole,
        targetCompany: input.targetCompany,
        experienceLevel: input.experienceLevel,
        dailyStudyHours: input.dailyStudyHours,
        onboarded: false,
      };
      persist(next);
      return next;
    },
    [persist],
  );

  const logout = useCallback(() => persist(null), [persist]);

  const updateProfile = useCallback((patch: Partial<AuthUser>) => {
    setUser((current) => {
      if (!current) return current;
      const next = { ...current, ...patch };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore.
      }
      return next;
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      signup,
      logout,
      updateProfile,
    }),
    [user, isLoading, login, signup, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Access the mock auth state + actions. Must be used within {@link MockAuthProvider}. */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within a MockAuthProvider");
  }
  return ctx;
}
