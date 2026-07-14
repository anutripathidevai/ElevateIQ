# InterviewPrep

An AI-powered, single-place platform to prepare for software engineering interviews:
**DSA**, **System Design (HLD)**, **Low-Level Design (LLD)**, and **Behavioral** rounds.

Browse a curated problem bank, write your solution/answer, and get instant, structured
AI feedback (score + rubric-based breakdown + concrete suggestions). Run adaptive AI
**mock interviews** that ask one question at a time and follow up on your answers.

Built to be **modular, readable, and extendable** — adding a whole new track is roughly
one enum value + one content file + one registry entry.

---

## Tech stack

| Layer      | Choice                                                             |
| ---------- | ----------------------------------------------------------------- |
| Framework  | Next.js 14 (App Router) + React 18 + TypeScript                   |
| Styling    | Tailwind CSS, dark mode via `next-themes`                         |
| Database   | PostgreSQL via Prisma ORM                                         |
| Auth       | Auth.js (NextAuth v5), JWT sessions, GitHub/Google OAuth          |
| AI         | Azure OpenAI (`openai` SDK `AzureOpenAI`) — JSON reviews + streaming mock |
| Editor     | Monaco (`@monaco-editor/react`) for code tracks                   |

---

## Project structure

```
app/
  (marketing)/page.tsx        Public landing page
  (app)/                      Authenticated shell (topbar + sidebar)
    dashboard/                Progress, review queue, recent activity
    practice/[track]/         Problem list (generic, per track)
    practice/[track]/[slug]/  Solve view + AI review panel
    mock/                     Mock-interview picker + session
  api/                        Route handlers (auth, review, mock stream)
  actions/                    Server actions
components/
  ui/                         Primitives (button, card, badge, ...)
  layout/                     Sidebar, topbar, theme, user menu
  practice/                   Problem list, filters, editor, review panel
  mock/                       Streaming chat UI
lib/
  tracks.ts                   ★ Central track registry (drives everything)
  auth.ts  db.ts  env.ts  validation.ts  rate-limit.ts  utils.ts
services/
  problems.ts  submissions.ts  progress.ts
  ai/                         client, prompts, schemas, review, mock
content/                      Seed question banks (JSON, per track)
prisma/                       schema.prisma + seed.ts
```

### The track registry (`lib/tracks.ts`)

A single `Problem` model carries a `track` field, and `lib/tracks.ts` is the source of
truth for each track's slug, title, input mode (`code` vs `text`), labels, icon, accent
color, and AI prompt selection. Nav, list pages, the solve view, and prompts all read
from it.

**To add a new track:**

1. Add a value to `enum TrackKey` in `prisma/schema.prisma`.
2. Add a `content/<track>.json` file (see `content/README.md` for the schema).
3. Add one entry to `TRACKS` in `lib/tracks.ts`.

That's it — routes, filters, dashboard, and mock picker pick it up automatically.

---

## Getting started (local)

### Fastest: run with no database

For quick local testing you don't need Postgres, Azure, or OAuth at all:

```bash
npm install
Copy-Item .env.example .env    # leave DATABASE_URL blank
npm run dev                    # http://localhost:3000
```

When `DATABASE_URL` is blank the app runs in **DB-less local mode**:

- Problems are served straight from `content/*.json` — browse every track, open
  problems, read statements/constraints/hints.
- You're treated as a local **guest**, so the AI review and mock-interview flows
  are usable without signing in. Nothing is persisted.
- Add your Azure OpenAI keys to `.env` to exercise the real AI review + mock;
  without them those features show a clear "not configured" notice instead of
  erroring.
- Progress tracking and the dashboard need a database, so they show a short
  notice and light up automatically once you deploy with `DATABASE_URL` set.

### Full setup (with database)

**Prerequisites:** Node 20+, a PostgreSQL database (local or Azure).

```bash
# 1. Install deps
npm install

# 2. Configure env
cp .env.example .env
#    Fill in DATABASE_URL, AUTH_SECRET (openssl rand -base64 32),
#    and Azure OpenAI settings. OAuth + Azure are optional in dev:
#    - Without OAuth: browsing works; sign-in buttons are hidden.
#    - Without Azure OpenAI: AI review/mock are disabled with a notice.

# 3. Create schema + seed the question bank
npm run db:push
npm run db:seed

# 4. Run it
npm run dev            # http://localhost:3000
```

### Useful scripts

| Script               | What it does                                  |
| -------------------- | --------------------------------------------- |
| `npm run dev`        | Dev server                                    |
| `npm run build`      | `prisma generate` + production build          |
| `npm run start`      | Start the production build                    |
| `npm run typecheck`  | `tsc --noEmit`                                |
| `npm run db:push`    | Push schema to the DB (no migration history)  |
| `npm run db:migrate` | Create + apply a dev migration                |
| `npm run db:seed`    | Idempotent upsert of `content/*.json`         |

---

## How it works

- **Reviews** — `POST /api/problems/[slug]/review` validates input, enforces a per-user
  daily AI cap, calls Azure OpenAI in JSON mode, validates the response with Zod, then
  persists the submission and updates spaced-repetition progress.
- **Mock interviews** — `startMock` server action creates a session with an AI-generated
  opening question. `POST /api/mock/[id]/message` streams the interviewer's reply to the
  browser while a teed branch accumulates and persists the transcript.
- **Auth** — Auth.js v5 with JWT sessions and no DB adapter; the user is upserted in the
  `jwt` callback. Browsing is public; AI review, dashboard, and mock require sign-in.
- **Graceful degradation** — Missing Azure/OAuth config disables just those features
  instead of breaking the app. DB-reading pages are `force-dynamic`, so `npm run build`
  succeeds without a database.

---

## Deployment (Azure)

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the full walkthrough (Azure Postgres Flexible
Server, Azure OpenAI, and either Azure App Service via the included `Dockerfile` or Static
Web Apps). Product scope and roadmap live in **[PLAN.md](./PLAN.md)**; architecture
details in **[DESIGN.md](./DESIGN.md)**.

---

## Roadmap

Curated banks + AI review + mock interviews are the MVP. Planned extensions: job search,
ATS-friendly resume tooling, referral requests, and interview-experience-driven study
plans. See `PLAN.md`.
