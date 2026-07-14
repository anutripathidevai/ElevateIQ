# ElevateIQ

An **AI-powered career platform for software engineers**. ElevateIQ brings interview
practice and career tooling into one modular product:

- **Practice tracks** — DSA, System Design (HLD), Low-Level Design (LLD), and Behavioral
  rounds with instant, rubric-based AI feedback.
- **Company Question Bank** — real interview questions across companies and categories, with
  expected answers, hints, follow-ups, filtering, search, bookmarking, and progress tracking.
- **AI STAR Story Generator** — turn a project into polished STAR stories with the skills,
  leadership principles, and behavioral questions each one answers. Save, edit, duplicate, reuse.
- **Mock Panel Interview** — a three-persona AI panel (Hiring Manager, Senior Engineer,
  Principal Engineer) that produces a competency scorecard, per-interviewer feedback, an
  overall recommendation, and a personalized improvement plan.
- _Coming soon:_ Interview History, Calendar Study Planner, Resume Builder — already wired
  into the feature registry.

Built to be **modular, readable, and extendable**. Practice tracks are one enum value + one
content file + one registry entry; each career module is an isolated `features/<name>/` slice.

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
  (marketing)/page.tsx        Public landing page (hero + career toolkit + tracks)
  (app)/                      Authenticated shell (topbar + sidebar)
    dashboard/                Progress, review queue, recent activity
    practice/[track]/         Problem list (generic, per track)
    practice/[track]/[slug]/  Solve view + AI review panel
    mock/                     Mock-interview picker + session
    companies/                Company Question Bank (landing + per-company explorer)
    star-stories/             AI STAR Story Generator
    panel/                    Mock Panel Interview (setup + session + scorecard)
  api/                        Route handlers (auth, review, mock + panel streams)
  actions/                    Server actions
components/
  ui/                         Primitives (button, card, badge, input, tabs, ...)
  layout/                     Sidebar, topbar, theme, user menu, sign-in prompt
  practice/                   Problem list, filters, editor, review panel
  mock/                       Streaming chat UI
features/                     ★ Feature-based career modules (Phase 2)
  shared/                     Reusable states/hooks/memory-store used by all modules
  company-bank/               types · services · components · utils · __tests__
  star-stories/               types · ai (prompts+schemas) · services · components · __tests__
  panel-interview/            types · personas · ai · services · components · __tests__
lib/
  tracks.ts                   ★ Practice-track registry
  features.ts                 ★ Career-module + navigation registry (Phase 2)
  auth.ts  db.ts  env.ts  current-user.ts  validation.ts  rate-limit.ts  utils.ts
services/
  problems.ts  submissions.ts  progress.ts  mocks.ts
  ai/                         client, prompts, schemas, review, mock
content/                      Seed question banks (JSON, per track + companies)
prisma/                       schema.prisma + migrations + seed.ts
```

### Two registries

ElevateIQ has **two complementary registries**, each a single source of truth:

- **`lib/tracks.ts`** — practice tracks. A single `Problem` model carries a `track` field;
  the registry defines each track's slug, title, input mode (`code` vs `text`), labels,
  icon, accent, and prompt selection. Nav, list pages, the solve view, and prompts read
  from it.
- **`lib/features.ts`** — career modules + grouped navigation. Every module (live or
  "coming soon") is one `FeatureModule` entry; the landing page, sidebar, and career hub
  are generated from it.

**To add a new practice track:**

1. Add a value to `enum TrackKey` in `prisma/schema.prisma`.
2. Add a `content/<track>.json` file (see `content/README.md` for the schema).
3. Add one entry to `TRACKS` in `lib/tracks.ts`.

### Feature modules (`features/`)

Each career module is a **self-contained vertical slice** so features can be added without
restructuring the app. A module owns its own domain and never reaches into another module's
internals:

```
features/<module>/
  types.ts          Domain types + shared constants (single source of truth)
  services/         Persistence (dual backend) + business logic — no React
  ai/               Prompt templates + Zod schemas + AI calls (isolated, testable)
  components/       Presentational + client components (loading/empty/error states)
  utils.ts          Pure helpers (the unit-test target)
  actions.ts        "use server" entry points the UI calls
  __tests__/        Vitest specs for utils / prompts / personas
  index.ts          Public module API (barrel)
```

Cross-cutting building blocks live in **`features/shared/`**: `LoadingState` /
`EmptyState` / `ErrorState`, `PageHeader`, hooks (`useLocalStorage`, `useDebouncedValue`,
`useAsyncAction`, `useCopyToClipboard`), and `createMemoryStore<T>()` — the in-memory
backend used when there's no database.

**Dual-backend persistence.** Every service checks `isDbConfigured`: with a `DATABASE_URL`
it uses Prisma/Postgres; without one it uses `createMemoryStore<T>()`. The same module works
end-to-end in local/demo mode, and AI-dependent modules degrade gracefully (e.g. the panel
falls back to a seed question bank and a heuristic scorecard when Azure isn't configured).

**To add a new career module:**

1. Scaffold `features/<module>/` with the slice layout above.
2. Add a Prisma model (+ migration) if it persists user data; the memory store mirrors it.
3. Add a thin route under `app/(app)/<module>/` that imports from the module.
4. Add one `FeatureModule` entry to `lib/features.ts` (flip `status` from `"soon"` to
   `"live"`). The nav and landing page update automatically.

That's it — no existing module changes.

**To add a new track:** see the practice-track steps above.

Routes, filters, dashboard, and the mock/career pickers all pick new entries up
automatically.

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
| `npm run lint`       | `next lint`                                   |
| `npm run test`       | Vitest unit tests (`features/**/__tests__`)   |
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
- **Panel interviews** — `createInterviewAction` opens a session with the Hiring Manager's
  opening question. `POST /api/panel/[id]/message` streams the next persona's turn (rotating
  Hiring Manager → Senior → Principal) while a teed branch persists the transcript;
  `finishInterviewAction` generates the scorecard (AI when configured, otherwise a
  deterministic heuristic).
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

Practice tracks + AI review + mock and panel interviews + the Company Question Bank and STAR
Story Generator are live. The next feature-registry entries — **Interview History**,
**Calendar Study Planner**, and **Resume Builder** — are already wired in as "coming soon"
and each ships as an isolated `features/<name>/` slice. See `PLAN.md`.
