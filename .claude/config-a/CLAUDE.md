# acme-community — project guide (lean baseline)

A small members-and-events app. Next.js (App Router) + TypeScript, Drizzle over
better-sqlite3, vitest. Keep changes small and the gate green.

## Stack

- Next.js App Router + TypeScript, Node 24, npm.
- Drizzle ORM over better-sqlite3; migrations self-apply on boot.
- Tests: vitest, hermetic — each test builds its own in-memory SQLite database
  and applies migrations itself. No external services, no env setup.

## The gate

- `npm run ci` runs lint → typecheck → test, in that order. It must pass before
  a push. Fix the cause of a failure; never weaken a check to make it pass.

## Where things live

- `app/` — minimal UI (members list + three number cards).
- `lib/stats.ts` — the three metrics: total members, total events, average
  events per member. That is the whole metric surface.
- `lib/format.ts` — number formatting helper.
- `db/` — schema, migrations, client, seed.
- `test/` — the hermetic suite.

## Conventions

- Keep metrics conspicuously simple: plain counts and one average. No scoring,
  weighting, or methodology.
- All data is synthetic and obviously fake ("Member A", round numbers).
- Server components by default; compute numbers in `lib/`, render in `app/`.
- One concern per file; explicit return types on exported functions.

## Workflow

- Branch → PR → green gate → merge. Never commit directly to main.
- Make the smallest change that does the job. Do not refactor unrelated code or
  add abstractions, error handling, or files the task did not ask for.
