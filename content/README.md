# Seed Content — Question Bank

Curated starter questions so users can practice immediately on first visit.
These are loaded into the database by `prisma/seed.ts` (added during scaffolding).

## Files
| File | Track (`Track.key`) | Count |
|------|---------------------|-------|
| `dsa.json` | `DSA` | 12 |
| `system-design.json` | `SYSTEM_DESIGN` (HLD) | 6 |
| `lld.json` | `LLD` | 6 |
| `behavioral.json` | `BEHAVIORAL` | 8 |

## Item schema
Each file is a JSON array of objects matching the `Problem` model in `DESIGN.md`:

```jsonc
{
  "slug": "two-sum",              // unique, URL-safe (used in /dsa/[slug])
  "title": "Two Sum",
  "difficulty": "EASY",           // EASY | MEDIUM | HARD
  "tags": ["arrays", "hash-map"],
  "statementMD": "…markdown…",     // rendered as MDX on the solve page
  "constraints": "…",              // optional
  "hints": ["…", "…"],            // progressive hints
  "referenceSolution": "…"         // approach + complexity (DSA) or rubric/key-points (HLD/LLD)
}
```

## Notes
- Statements are **original wording** (not copied from any site) to avoid copyright issues.
- For **HLD/LLD**, `referenceSolution` is a **reference rubric / key discussion points** — it also seeds the AI reviewer's grading criteria.
- To add a question: append an object with a unique `slug`. Keep the same shape.
- Loading is idempotent: seed should **upsert by `slug`** so re-running doesn't duplicate rows.

## Future
Once an admin UI exists, content can move fully into the DB; these files remain the initial seed / fallback.
