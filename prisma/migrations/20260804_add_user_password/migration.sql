-- Add optional bcrypt password hash for email/password accounts.
-- Nullable so existing rows and OAuth-only users (e.g. Google) remain valid
-- and account-linking-by-email keeps working.
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;
