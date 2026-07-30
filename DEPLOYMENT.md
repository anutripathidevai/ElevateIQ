# ElevateIQ — Azure Deployment Guide

You'll create infra in the **Azure Portal**; this guide lists exactly what to create,
how to containerize the Next.js app, and two ways to deploy (manual CLI or GitHub Actions).

Target runtime: **Azure Container Apps** (scale-to-zero, cheap at low traffic).
Simpler no-container alternative noted at the end.

> Sections 1–10 below describe the full container-based path. **Section 0 documents
> the setup that actually shipped** (App Service Web App + code deploy + guest mode),
> which is simpler and is the recommended low-traffic path.

---

## 0. As-Built: The Working Production Setup ✅

This is the configuration currently running in production. It runs in **guest mode**
(no database) with AI enabled.

### Resources actually used
| Resource | Notes |
|---|---|
| **App Service (Web App)** | Linux, **Node 22 LTS**, Publish = **Code** (no Docker). App Service Plan **B1**. |
| **Azure OpenAI (gpt-5.6-luna)** | Lives in a **different subscription** — that's fine; it's just an HTTPS endpoint + key. Deployment type **Global Standard**. |
| _(No database)_ | App runs in guest mode: DSA/HLD/LLD content served from `content/*.json`. Add Postgres later for accounts/progress. |

### App settings on the Web App (exact keys)
| Name | Value |
|---|---|
| `AZURE_OPENAI_ENDPOINT` | `https://<resource>.services.ai.azure.com/openai/v1` **(v1 API base URL, not `openai.azure.com`)** |
| `AZURE_OPENAI_API_KEY` | *(KEY 1 from the OpenAI resource)* |
| `AZURE_OPENAI_DEPLOYMENT` | `gpt-5.6-luna` *(exact deployment name)* |
| `AZURE_OPENAI_MODEL_FAMILY` | `reasoning` |
| `AUTH_SECRET` | *(a random 32-byte base64 string)* |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `true` |
| `WEBSITE_NODE_DEFAULT_VERSION` | `~22` |

`AZURE_OPENAI_API_VERSION` is **not used** with the v1 endpoint (v1 is versionless).

### Deploy procedure (manual zip — no CLI login needed)
The `az webapp up` CLI path failed because the CLI account had no subscription.
Manual zip deploy via Kudu avoids that entirely:

1. Build a source-only zip (excludes `node_modules`, `.next`, `.git`; Azure rebuilds via Oryx):
   ```powershell
   $src="."; $stage="..\deploy-stage"; $zip="..\interviewprep-deploy.zip"
   Remove-Item $stage,$zip -Recurse -Force -ErrorAction SilentlyContinue
   robocopy $src $stage /E /XD node_modules .next .git .vscode .github /XF "*.zip" ".env" ".env.local" | Out-Null
   Compress-Archive -Path "$stage\*" -DestinationPath $zip -Force
   ```
2. Open `https://<web-app-name>.scm.azurewebsites.net/ZipDeployUI` (signed in with the right account).
3. Drag the zip onto the page. Wait for the Oryx build (`npm install` + `npm run build`) to finish.
4. **Restart** the Web App → verify `https://<web-app-name>.azurewebsites.net/api/health` shows `"ai":true`.

### Key gotchas learned (so we don't repeat them)
- **GPT-5 family requires the v1 API.** The classic `AzureOpenAI` client (with `api-version`)
  returns `404 Resource not found` (wrong endpoint) or `400 API version not supported`.
  `services/ai/client.ts` auto-detects a `services.ai.azure.com` / `/openai/v1` endpoint
  and switches to the standard `OpenAI` client with `baseURL`. Override with
  `AZURE_OPENAI_API_STYLE = "v1" | "classic"`.
- **GPT-5 params:** these models reject `max_tokens` and non-default `temperature`.
  `tuneParams()` sends `max_completion_tokens` and drops `temperature` for reasoning models
  (detected by name or `AZURE_OPENAI_MODEL_FAMILY=reasoning`).
- **The "Project endpoint" in Foundry is NOT the API endpoint.** Use the base URL from the
  deployment's **View code** sample (`.../openai/v1`), not the `.../api/projects/<id>` value.
- **Azure OpenAI quota** on Visual Studio subscriptions is often `0/0 TPM` everywhere — check
  Foundry → Quota (toggle "Show all"). GPT-5 models may only deploy in specific regions.
- **`AUTH_SECRET` is required in production** or Auth.js throws `MissingSecret` on every request.
- Harmless warning: `"next start" does not work with output: standalone`. It still serves fine;
  optionally set the Startup Command to `node .next/standalone/server.js` for the leaner runtime.

---

## 1. Azure Resources to Create (Portal)

Create all of these inside one **Resource Group** (e.g. `rg-interviewprep`, region `East US`).

| # | Resource | Portal → Create | Settings for MVP | What you copy out |
|---|----------|-----------------|------------------|-------------------|
| 1 | **Azure OpenAI** | "Azure OpenAI" | Standard S0. In **Azure AI Foundry / OpenAI Studio → Deployments**, deploy model `gpt-4o-mini` (name it `gpt-4o-mini`) | Endpoint, API key, deployment name, API version (e.g. `2024-08-01-preview`) |
| 2 | **Azure Database for PostgreSQL – Flexible Server** | "Azure Database for PostgreSQL" | Workload = *Development*, **Burstable B1ms**, Postgres 16, create DB `interviewprep`. Networking → **Allow public access** + add firewall rule | `DATABASE_URL` (see below) |
| 3 | **Container Registry (ACR)** | "Container Registry" | **Basic** SKU. Enable **Admin user** (Access keys) | Login server `<name>.azurecr.io`, username, password |
| 4 | **Container Apps Environment** | "Container Apps Environment" | Consumption plan | — |
| 5 | **Container App** | "Container App" | Created after image exists (step 4 below) | App URL |
| 6 | **Application Insights** | "Application Insights" | Workspace-based | Connection string |
| 7 | *(optional)* **Key Vault** | "Key Vault" | Standard | For prod secrets; MVP can use Container App secrets |

**DATABASE_URL format** (note `sslmode=require`):
```
postgresql://<admin>:<password>@<server>.postgres.database.azure.com:5432/interviewprep?sslmode=require
```

---

## 2. OAuth Apps (for Auth.js sign-in)

- **GitHub** → Settings → Developer settings → OAuth Apps → New.
  Callback URL: `https://<your-app-url>/api/auth/callback/github`
- **Google** → Google Cloud Console → Credentials → OAuth client (Web).
  Redirect URI: `https://<your-app-url>/api/auth/callback/google`

(You can start with `http://localhost:3000/...` for local dev and add the Azure URL after the app is deployed.)

---

## 3. Environment Variables (set on the Container App)

| Variable | Source |
|----------|--------|
| `DATABASE_URL` | Postgres (step 1.2) |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | `https://<your-app-url>` |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | GitHub OAuth app |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth client |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI |
| `AZURE_OPENAI_DEPLOYMENT` | `gpt-4o-mini` |
| `AZURE_OPENAI_API_VERSION` | e.g. `2024-08-01-preview` |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | App Insights |

In the portal, put secrets under **Container App → Settings → Secrets**, then reference them from **Environment variables**.

---

## 4. Containerize the App

Both files are **already in the repo and production-ready** — no changes needed:

- `next.config.mjs` → `output: 'standalone'`, security headers, `poweredByHeader: false`.
- `Dockerfile` → multi-stage Alpine build. Key production settings baked in:
  - installs `openssl`/`libc6-compat` and generates the `linux-musl-openssl-3.0.x`
    Prisma engine (see `binaryTargets` in `prisma/schema.prisma`),
  - copies `.prisma` so the query engine is present in the standalone output,
  - sets `ENV HOSTNAME=0.0.0.0` so Azure ingress can reach the container,
  - runs as a non-root user and listens on port **3000**.
- `.dockerignore` excludes `node_modules`, `.next`, `.git`, `.env*`.

**Health probe:** the app exposes `GET /api/health` (returns 200 + `{db, ai}` flags).
Point the Container App's liveness/readiness probe at `/api/health`.

---

## 5. Database Migration & Seed

Versioned migrations live in `prisma/migrations/` (initial migration `0_init`), so
production uses `migrate deploy` (repeatable) rather than `db push`.

Run once from a machine that has the repo + dev dependencies (needed for the seed),
pointed at the Azure DB:
```powershell
$env:DATABASE_URL="postgresql://<admin>:<password>@<server>.postgres.database.azure.com:5432/interviewprep?sslmode=require"
npx prisma migrate deploy   # applies 0_init
npm run db:seed             # loads content/*.json (idempotent upsert by slug)
```
> Re-run `npm run db:seed` anytime you add/edit problems in `content/*.json`.
> For fully automated migrations later, run `prisma migrate deploy` as a
> **Container Apps Job** in the same environment.

---

## 6. Deploy — Option A: Manual (Azure CLI)

```powershell
# login
az login
az acr login --name <acrName>

# build & push image
docker build -t <acrName>.azurecr.io/interviewprep:latest .
docker push <acrName>.azurecr.io/interviewprep:latest

# create the Container App from the image (first time)
az containerapp create `
  --name interviewprep `
  --resource-group rg-interviewprep `
  --environment <containerAppsEnv> `
  --image <acrName>.azurecr.io/interviewprep:latest `
  --registry-server <acrName>.azurecr.io `
  --registry-username <acrUser> --registry-password <acrPass> `
  --target-port 3000 --ingress external `
  --min-replicas 0 --max-replicas 2 `
  --cpu 0.5 --memory 1.0Gi

# set env vars / secrets
az containerapp secret set -n interviewprep -g rg-interviewprep `
  --secrets db-url="postgresql://..." openai-key="..." auth-secret="..."
az containerapp update -n interviewprep -g rg-interviewprep `
  --set-env-vars DATABASE_URL=secretref:db-url AZURE_OPENAI_API_KEY=secretref:openai-key `
    AUTH_SECRET=secretref:auth-secret AUTH_URL=https://<app-url> `
    AZURE_OPENAI_ENDPOINT=... AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini AZURE_OPENAI_API_VERSION=2024-08-01-preview
```
> You can do all of this in the **portal** too: Container App → *Create* → point to the ACR image, set target port `3000`, ingress *external*, min replicas `0`, then add env vars/secrets in the app's settings. Redeploy by pushing a new tag and updating the image.

Grab the app URL from the Container App **Overview**, then update `AUTH_URL` and the OAuth callback URLs (step 2).

---

## 7. Deploy — Option B: GitHub Actions (CI/CD)

A ready-to-use workflow is committed at **`.github/workflows/deploy.yml`**. On every
push to `main` it builds the image in ACR from the `Dockerfile` and deploys to your
Container App (via `azure/container-apps-deploy-action`).

Configure these in **GitHub → repo → Settings → Secrets and variables → Actions**:

- **Secrets:**
  - `AZURE_CREDENTIALS` — from
    `az ad sp create-for-rbac --name interviewprep-ci --role contributor --scopes /subscriptions/<sub-id>/resourceGroups/rg-interviewprep --sdk-auth`
  - `ACR_NAME` — your ACR name (without `.azurecr.io`)
- **Variables:**
  - `RESOURCE_GROUP` — e.g. `rg-interviewprep`
  - `CONTAINER_APP` — e.g. `interviewprep`

App settings (`DATABASE_URL`, `AZURE_OPENAI_*`, `AUTH_SECRET`, OAuth, `AUTH_URL`) are set
once on the Container App itself — not in the workflow.

---

## 8. Post-Deploy Checklist
- [ ] `GET /api/health` returns `{"status":"ok","db":true,"ai":true}`.
- [ ] App URL loads the landing page.
- [ ] Sign in with GitHub/Google works (callback URLs + `AUTH_URL` correct).
- [ ] `prisma migrate deploy` + seed ran; problems appear.
- [ ] DSA review returns AI feedback from Azure OpenAI and saves a Submission.
- [ ] App Insights receives telemetry.
- [ ] Container App **min replicas = 0** confirmed (scales to zero when idle).

---

## 9. Simpler Alternative (No Containers)
Use **Azure App Service (Linux, B1)** with the Node runtime:
- Deploy via `az webapp up` or GitHub Actions (`azure/webapps-deploy`).
- Set the same env vars under **Configuration → Application settings**.
- Startup command: `node server.js` (with standalone) or `npm start`.
- Trade-off: no scale-to-zero (fixed ~$13/mo), but zero Docker overhead.

---

## 10. Cost Reminder (low traffic)
Container Apps (scale-to-zero) $0–15 · Postgres B1ms ~$13 · Azure OpenAI (gpt-4o-mini) $5–20 · ACR/App Insights ~$5 → **~$25–55/mo**.
