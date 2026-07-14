/**
 * Central, typed access to environment variables + feature flags.
 * Features degrade gracefully when optional integrations are unconfigured.
 */
export const env = {
  databaseUrl: process.env.DATABASE_URL,

  authSecret: process.env.AUTH_SECRET,
  githubId: process.env.AUTH_GITHUB_ID,
  githubSecret: process.env.AUTH_GITHUB_SECRET,
  googleId: process.env.AUTH_GOOGLE_ID,
  googleSecret: process.env.AUTH_GOOGLE_SECRET,

  azureEndpoint: process.env.AZURE_OPENAI_ENDPOINT,
  azureApiKey: process.env.AZURE_OPENAI_API_KEY,
  azureDeployment: process.env.AZURE_OPENAI_DEPLOYMENT ?? "gpt-4o-mini",
  azureApiVersion: process.env.AZURE_OPENAI_API_VERSION ?? "2024-08-01-preview",

  dailyAiLimit: Number(process.env.DAILY_AI_LIMIT ?? "50"),
} as const;

export const isAzureConfigured = Boolean(env.azureEndpoint && env.azureApiKey);
export const isDbConfigured = Boolean(env.databaseUrl);
export const isGithubConfigured = Boolean(env.githubId && env.githubSecret);
export const isGoogleConfigured = Boolean(env.googleId && env.googleSecret);
export const isAuthConfigured = isGithubConfigured || isGoogleConfigured;

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
