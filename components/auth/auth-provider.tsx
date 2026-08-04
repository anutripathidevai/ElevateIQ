"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  SessionProvider,
  signIn,
  signOut,
  getSession,
  useSession,
} from "next-auth/react";
import type { AuthUser, ExperienceLevel } from "@/lib/types";

/**
 * The rich career profile lives client-side, keyed by the real account id,
 * while identity (id/name/email/image) always comes from the server session.
 * Persisting the profile to the database is a later phase.
 */
const PROFILE_PREFIX = "cr_profile:";

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

/** Result of an async auth action — never throws to the caller. */
export type AuthActionResult = { ok: true } | { ok: false; error: string };

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** True while the session is still resolving on the client. */
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthActionResult>;
  signup: (input: SignupInput) => Promise<AuthActionResult>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Turn "ada.lovelace@x.com" into "Ada Lovelace" for a friendly fallback name. */
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

/** The mutable career-profile fields (everything on AuthUser except identity). */
type StoredProfile = Omit<AuthUser, "id" | "fullName" | "email">;

function baseProfile(): StoredProfile {
  return {
    avatarUrl: null,
    createdAt: new Date().toISOString(),
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

function readProfile(userId: string): Partial<StoredProfile> {
  try {
    const raw = window.localStorage.getItem(PROFILE_PREFIX + userId);
    return raw ? (JSON.parse(raw) as Partial<StoredProfile>) : {};
  } catch {
    return {};
  }
}

function writeProfile(userId: string, profile: Partial<StoredProfile>) {
  try {
    window.localStorage.setItem(
      PROFILE_PREFIX + userId,
      JSON.stringify(profile),
    );
  } catch {
    // Storage unavailable — profile edits simply won't persist locally.
  }
}

// ---------------------------------------------------------------------------
// Session-backed provider
// ---------------------------------------------------------------------------

function InnerAuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<Partial<StoredProfile> | null>(null);

  const userId = session?.user?.id ?? null;

  // Load (or reset) the local profile whenever the signed-in identity changes.
  useEffect(() => {
    if (status === "authenticated" && userId) {
      setProfile(readProfile(userId));
    } else if (status === "unauthenticated") {
      setProfile(null);
    }
  }, [status, userId]);

  const user = useMemo<AuthUser | null>(() => {
    if (status !== "authenticated" || !session?.user?.id) return null;
    const su = session.user;
    const stored = profile ?? {};
    return {
      ...baseProfile(),
      ...stored,
      // Identity always comes from the server session — never overridable by
      // the locally-stored profile blob.
      id: su.id,
      fullName: su.name ?? nameFromEmail(su.email ?? ""),
      email: su.email ?? "",
      avatarUrl: stored.avatarUrl ?? su.image ?? null,
    };
  }, [status, session, profile]);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthActionResult> => {
      try {
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (!res || res.error) {
          return { ok: false, error: "Invalid email or password." };
        }
        return { ok: true };
      } catch {
        return {
          ok: false,
          error: "Something went wrong. Please try again shortly.",
        };
      }
    },
    [],
  );

  const signup = useCallback(
    async (input: SignupInput): Promise<AuthActionResult> => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: input.fullName,
            email: input.email,
            password: input.password,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          error?: string;
        };
        if (!res.ok || !data.ok) {
          return {
            ok: false,
            error: data.error ?? "We couldn't create your account.",
          };
        }

        const signInRes = await signIn("credentials", {
          email: input.email,
          password: input.password,
          redirect: false,
        });
        if (!signInRes || signInRes.error) {
          // Account exists but auto sign-in failed — send them to login.
          return {
            ok: false,
            error: "Account created. Please sign in to continue.",
          };
        }

        // Persist the rich profile captured at signup, keyed by the real id.
        const fresh = await getSession();
        const uid = fresh?.user?.id;
        if (uid) {
          writeProfile(uid, {
            ...baseProfile(),
            targetRole: input.targetRole,
            targetCompany: input.targetCompany,
            experienceLevel: input.experienceLevel,
            dailyStudyHours: input.dailyStudyHours,
            onboarded: false,
          });
          setProfile(readProfile(uid));
        }
        return { ok: true };
      } catch {
        return {
          ok: false,
          error: "Something went wrong. Please try again shortly.",
        };
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    await signOut({ redirect: false });
  }, []);

  const updateProfile = useCallback(
    (patch: Partial<AuthUser>) => {
      if (!userId) return;
      setProfile((current) => {
        const next: Partial<StoredProfile> = {
          ...baseProfile(),
          ...(current ?? {}),
          ...patch,
        };
        // Identity fields never live in the profile blob.
        delete (next as Partial<AuthUser>).id;
        delete (next as Partial<AuthUser>).fullName;
        delete (next as Partial<AuthUser>).email;
        writeProfile(userId, next);
        return next;
      });
    },
    [userId],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: status === "authenticated",
      isLoading: status === "loading",
      login,
      signup,
      logout,
      updateProfile,
    }),
    [user, status, login, signup, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Auth provider for the whole app. Uses server-issued Auth.js sessions (JWT
 * strategy) so identity is real and validated server-side. Session discovery is
 * done at runtime by {@link SessionProvider} (via `/api/auth/session`), so the
 * app reflects the deployed auth configuration without needing a rebuild.
 *
 * When no backend is configured there is simply no session: public content
 * stays readable (see AuthGuard) and sign-in surfaces an honest error rather
 * than a fake login.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <InnerAuthProvider>{children}</InnerAuthProvider>
    </SessionProvider>
  );
}

/** Access the auth state + actions. Must be used within {@link AuthProvider}. */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
