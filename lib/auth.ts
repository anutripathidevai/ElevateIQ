import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import type { Provider } from "next-auth/providers";
import { db } from "@/lib/db";
import {
  env,
  isGithubConfigured,
  isGoogleConfigured,
} from "@/lib/env";

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
      if (user?.email) {
        const dbUser = await db.user.upsert({
          where: { email: user.email },
          create: { email: user.email, name: user.name, image: user.image },
          update: { name: user.name, image: user.image },
        });
        token.uid = dbUser.id;
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
