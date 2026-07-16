# Azure Database Integration — ElevateIQ on App Service

This runbook takes the **already-deployed** ElevateIQ App Service from *guest mode*
(`/api/health` → `"db": false`) to a real **Azure Database for PostgreSQL Flexible
Server** with schema, seed data, and validation.

> The main `DEPLOYMENT.md` describes a Container Apps path. This document is the
> **App Service (Web App)** variant and only covers the database.

---

## 0. How the database plugs in (nothing to code)

ElevateIQ already ships full DB support; a single env var flips it on:

| Signal | File | Behavior |
|---|---|---|
| `DATABASE_URL` unset | `lib/env.ts` → `isDbConfigured=false` | **Guest mode**: problems served from `content/*.json`, nothing persisted. |
| `DATABASE_URL` set | Prisma `datasource db` (`prisma/schema.prisma`) | **DB mode**: services read/write Postgres; `/api/health` reports `db:true`. |

- Migrations already exist: `prisma/migrations/0_init` and `20260714_phase2_career_modules`.
- Scripts already exist: `npm run db:deploy` (`prisma migrate deploy`), `npm run db:seed`.
- The acting user is resolved by `getUserId()` (`lib/current-user.ts`) → NextAuth session id, or `null` when anonymous.

**No application code changes are required** to integrate the database.

---

## 1. Prerequisites

- **Azure CLI** logged in: `az login`, then `az account set --subscription <id>`.
- Your **App Service** name and its **resource group** (`az webapp list -o table`).
- Node deps installed locally for the one-time migrate/seed: `npm install`.

---

## 2. Provision the PostgreSQL Flexible Server

### Option A — scripted (recommended)

```powershell
./scripts/azure/provision-postgres.ps1 `
    -ResourceGroup rg-elevateiq `
    -Location eastus `
    -ServerName elevateiq-pg-9f3a `   # must be globally unique, lowercase
    -AdminUser eiqadmin
# (omit -AdminPassword to auto-generate one — copy it from the output)
```

The script creates a **Burstable B1ms / PostgreSQL 16** server + database
`elevateiq`, opens the firewall to **Azure services** (so the App Service can
connect) and to **your current IP** (temporary, for migrations), then prints the
`DATABASE_URL`.

### Option B — portal (step by step)

1. **Create a resource** → search **"Azure Database for PostgreSQL flexible server"** → **Create**.
2. **Basics**:
   - Subscription + **Resource group** = the same RG as your App Service.
   - **Server name** = globally unique (e.g. `elevateiq-pg-9f3a`).
   - **Region** = same region as the App Service.
   - **PostgreSQL version** = **16**.
   - **Workload type** = *Development* → this preselects **Burstable, Standard_B1ms**
     (Compute + storage → confirm B1ms, 32 GiB).
   - **Authentication** = *PostgreSQL authentication only*; set **admin username** +
     **password** (save them).
3. **Networking**:
   - Connectivity method = **Public access (allowed IP addresses)**.
   - Tick **Allow public access from any Azure service within Azure to this server**
     (lets the App Service connect).
   - Click **Add current client IP address** (temporary — for running migrations).
4. **Review + create** → **Create** (provisioning takes a few minutes).
5. **Create the database**: open the server → **Settings → Databases** → **Add** →
   name it **`elevateiq`** → Save.
6. Build the connection string (server → **Settings → Connect** gives the host):
   ```
   postgresql://<admin>:<url-encoded-password>@<server>.postgres.database.azure.com:5432/elevateiq?sslmode=require
   ```

### DATABASE_URL format (note `sslmode=require`)

```
postgresql://<admin>:<url-encoded-password>@<server>.postgres.database.azure.com:5432/elevateiq?sslmode=require
```

> Flexible Server uses a plain `<admin>` username (no `admin@server` suffix — that
> was the old Single Server). URL-encode any special characters in the password.

---

## 3. Apply schema + seed (one-time, from your machine)

```powershell
$env:DATABASE_URL = 'postgresql://...sslmode=require'   # value from step 2
./scripts/azure/migrate-and-seed.ps1
```

This runs:
1. `prisma migrate deploy` — creates all tables (`User`, `Problem`, `Submission`,
   `Progress`, `MockInterview`, `StarStory`, `PanelInterview`, `QuestionBookmark`,
   `QuestionProgress`, …).
2. `npm run db:seed` — loads `content/*.json` into `Problem` (idempotent upsert by
   slug). Re-run the seed anytime you change content.

> **Why local?** The App Service Oryx build only runs `npm run build`
> (`prisma generate && next build`); it does **not** run migrations. Run them here
> once, or later wire `prisma migrate deploy` into a CI/release step.

---

## 4. Point the App Service at the database

### Option A — scripted

```powershell
./scripts/azure/set-appservice-config.ps1 `
    -ResourceGroup rg-elevateiq `
    -AppName elevateiq-web `
    -DatabaseUrl $env:DATABASE_URL
# Optional AI: -AzureOpenAiEndpoint 'https://<res>.openai.azure.com' -AzureOpenAiApiKey '<key>'
```

Sets `DATABASE_URL`, `AUTH_SECRET` (generated if omitted — **required in prod**),
and `AUTH_URL` (defaults to the app's `https://<app>.azurewebsites.net`), then
restarts the app.

### Option B — portal / CLI by hand

App Service → **Settings → Environment variables → App settings**:

| Setting | Value |
|---|---|
| `DATABASE_URL` | from step 2 (`...sslmode=require`) |
| `AUTH_SECRET` | `openssl rand -base64 32` (**required in production**) |
| `AUTH_URL` | `https://<app>.azurewebsites.net` |
| `AZURE_OPENAI_ENDPOINT` / `AZURE_OPENAI_API_KEY` | *(optional — enables AI)* |

Then **Restart** the app.

---

## 5. Validate

```powershell
./scripts/azure/validate-db.ps1 -AppUrl https://elevateiq-web.azurewebsites.net -DatabaseUrl $env:DATABASE_URL
```

Checks:
- `GET /api/health` → `{ "status":"ok", "db": true, ... }` (polls through the restart).
- Direct row counts — expect `Problem > 0` after seeding; user tables start at 0.

Manual spot checks:
- Open the app; browse the problem bank / companies — data now comes from Postgres.
- `az postgres flexible-server execute -n <server> -d elevateiq -u <admin> -p <pass> --querytext '\dt'`
  (or `npx prisma studio` with `DATABASE_URL` set) to inspect tables.

---

## 6. Clean up & harden

- **Remove the temporary local-IP firewall rule** once migrations succeed:
  ```powershell
  az postgres flexible-server firewall-rule delete -g rg-elevateiq -n <server> -r TempLocalMigrate --yes
  ```
- Keep secrets in **App Service settings** (encrypted at rest) or reference **Key
  Vault** (`@Microsoft.KeyVault(...)`).
- For stronger isolation later: disable public access and use **VNet integration +
  Private Endpoint** instead of the "Allow Azure services" rule.
- Consider a least-privileged application DB role instead of the admin for runtime.

---

## 7. Important caveat — persistence needs a real auth session

In production DB mode, `getUserId()` returns the **NextAuth** session id (or `null`
for anonymous). The current UI login is a **client-side mock** (localStorage key
`elevateiq_auth_user`) and does **not** create a NextAuth session. Consequences:

- The **problem bank** (now DB-backed) and the `db:true` health flag work immediately.
- **Per-user persistence** (progress, history, saved STAR stories, panel interviews,
  bookmarks) will not attach to a user until real sign-in exists.

To enable per-user persistence, configure a NextAuth provider (recommended
follow-up):
- **OAuth**: set `AUTH_GITHUB_ID/SECRET` and/or `AUTH_GOOGLE_ID/SECRET` (+ callback
  URLs `https://<app>/api/auth/callback/{github|google}`), **or**
- add a **Credentials** provider so the existing email/password form creates a real
  session.

This is intentionally out of scope for DB provisioning; the database is fully ready
for it.

---

## Cost (approx.)

PostgreSQL Flexible Server **B1ms** ≈ **$13/mo** + storage. Stop the server when not
in use to save cost (`az postgres flexible-server stop`).
