import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import LinkedIn from "next-auth/providers/linkedin";
import Credentials from "next-auth/providers/credentials";
import type { Provider } from "next-auth/providers";
import { db } from "@/lib/db";
import {
  env,
  isDbConfigured,
  isGithubConfigured,
  isGoogleConfigured,
  isLinkedinConfigured,
} from "@/lib/env";
import { loginSchema } from "@/lib/auth-validation";
import { verifyPassword } from "@/lib/password";

// Providers are added only when configured, so the app runs (browse-only)
// without any OAuth credentials.
const providers: Provider[] = [];
if (isGithubConfigured) {
  providers.push(
    GitHub({ clientId: env.githubId!, clientSecret: env.githubSecret! }),
  );
}
if (isGoogleConfigured) {
  providers.push(
    Google({ clientId: env.googleId!, clientSecret: env.googleSecret! }),
  );
}
if (isLinkedinConfigured) {
  providers.push(
    LinkedIn({
      clientId: env.linkedinId!,
      clientSecret: env.linkedinSecret!,
    }),
  );
}

// Email/password sign-in. Available whenever a database is configured (it needs
// to read the stored bcrypt hash); dormant in DB-less guest mode.
if (isDbConfigured) {
  providers.push(
    Credentials({
      id: "credentials",
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        // Validate shape first; never reveal which part failed.
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        try {
          const user = await db.user.findUnique({ where: { email } });
          // Same generic outcome whether the user is missing, is OAuth-only
          // (no hash), or the password is wrong — this avoids account
          // enumeration and user-existence leaks.
          if (!user || !(await verifyPassword(password, user.passwordHash))) {
            return null;
          }
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          // Database unavailable/transient — fail closed without leaking details.
          console.error("[auth] credentials authorize failed:", error);
          return null;
        }
      },
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  // Behind Azure's reverse proxy (Container Apps / App Service) Auth.js must
  // trust the forwarded host to build correct OAuth callback URLs.
  trustHost: true,
  // In production a real AUTH_SECRET is required; locally we fall back to an
  // insecure dev secret so the app runs with a blank .env.
  secret:
    env.authSecret ??
    (process.env.NODE_ENV === "production"
      ? undefined
      : "dev-only-insecure-secret-change-me"),
  // JWT sessions avoid a DB round-trip per request and keep the schema lean
  // (no adapter tables). The user record is upserted on sign-in below.
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      // Only runs at sign-in (when `user` is set); subsequent requests reuse the
      // token with no DB round-trip, so protected pages don't depend on the DB.
      if (user?.email) {
        try {
          const dbUser = await db.user.upsert({
            where: { email: user.email },
            create: { email: user.email, name: user.name, image: user.image },
            update: { name: user.name, image: user.image },
          });
          token.uid = dbUser.id;
        } catch (error) {
          // Transient DB issue at sign-in: fall back to the id we already have
          // (Credentials provides the real DB id) rather than dropping the login.
          console.error("[auth] jwt upsert failed:", error);
          if (user.id) token.uid = user.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.uid) {
        session.user.id = token.uid as string;
      }
      return session;
    },
  },
});

/** Convenience: the signed-in user's id, or null. */
export async function currentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
