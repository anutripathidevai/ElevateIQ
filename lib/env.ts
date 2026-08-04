/**
 * Central, typed access to environment variables + feature flags.
 * Features degrade gracefully when optional integrations are unconfigured.
 */

/**
 * Normalize a base URL that may arrive without a scheme. Azure's portal often
 * yields a bare hostname (e.g. "app.azurewebsites.net") when copying the
 * default domain, but Auth.js calls `new URL(AUTH_URL)`, which throws
 * `ERR_INVALID_URL` without a protocol. Prepend https:// when the scheme is
 * missing so a scheme-less value still works.
 */
export function normalizeBaseUrl(
  value: string | undefined,
): string | undefined {
  if (!value) return value;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

// Auth.js reads AUTH_URL / NEXTAUTH_URL directly from process.env and crashes on
// a scheme-less value; normalize them once at module load (this module is
// imported by lib/auth.ts before NextAuth() runs).
for (const key of ["AUTH_URL", "NEXTAUTH_URL"] as const) {
  const normalized = normalizeBaseUrl(process.env[key]);
  if (normalized && normalized !== process.env[key]) {
    process.env[key] = normalized;
  }
}

/**
 * Read an environment variable, treating empty or whitespace-only values as
 * unset. Deploy platforms (and blank .env templates) often define a key with an
 * empty value (e.g. `AUTH_SECRET=`); without this, `env.authSecret` would be
 * `""`, which is not caught by `?? fallback` and silently disables the dev
 * secret fallback / half-configures optional integrations.
 */
function readEnv(key: string): string | undefined {
  const raw = process.env[key];
  if (raw == null) return undefined;
  const trimmed = raw.trim();
  return trimmed === "" ? undefined : trimmed;
}

export const env = {
  databaseUrl: readEnv("DATABASE_URL"),

  authSecret: readEnv("AUTH_SECRET"),
  githubId: readEnv("AUTH_GITHUB_ID"),
  githubSecret: readEnv("AUTH_GITHUB_SECRET"),
  googleId: readEnv("AUTH_GOOGLE_ID"),
  googleSecret: readEnv("AUTH_GOOGLE_SECRET"),

  azureEndpoint: readEnv("AZURE_OPENAI_ENDPOINT"),
  azureApiKey: readEnv("AZURE_OPENAI_API_KEY"),
  azureDeployment: readEnv("AZURE_OPENAI_DEPLOYMENT") ?? "gpt-4o-mini",
  azureApiVersion: readEnv("AZURE_OPENAI_API_VERSION") ?? "2024-08-01-preview",

  // Transactional email (for password reset, etc.). Unset → the app never
  // pretends to have sent an email it cannot actually deliver.
  emailFrom: readEnv("AUTH_EMAIL_FROM"),
  resendApiKey: readEnv("RESEND_API_KEY"),
  smtpUrl: readEnv("SMTP_URL"),

  dailyAiLimit: Number(readEnv("DAILY_AI_LIMIT") ?? "50"),
} as const;

export const isAzureConfigured = Boolean(env.azureEndpoint && env.azureApiKey);
export const isDbConfigured = Boolean(env.databaseUrl);
export const isGithubConfigured = Boolean(env.githubId && env.githubSecret);
export const isGoogleConfigured = Boolean(env.googleId && env.googleSecret);
export const isAuthConfigured = isGithubConfigured || isGoogleConfigured;
/** Whether an email delivery channel is configured (for password resets, etc.). */
export const isEmailConfigured = Boolean(
  env.emailFrom && (env.resendApiKey || env.smtpUrl),
);

// Guard against accidentally shipping to production without a database — the
// app would silently run in guest mode with no persistence. Skipped during
// `next build` (where DATABASE_URL is legitimately absent).
if (
  process.env.NODE_ENV === "production" &&
  process.env.NEXT_PHASE !== "phase-production-build" &&
  !isDbConfigured
) {
  console.warn(
    "[env] DATABASE_URL is not set in production. Running without persistence " +
      "(guest mode). Set DATABASE_URL to enable auth, progress, and history.",
  );
}
