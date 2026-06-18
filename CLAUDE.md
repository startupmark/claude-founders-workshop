# acme-community — project guide

What this repo is: the canonical fallback/demo repo for the Claude Founders Kit workshop — a small, generic members-and-events app used to teach a five-part Claude setup series. The finished repo is also the answer key the workshop is rehearsed against.

This file is loaded every session. It is short on purpose; keep it that way.

## Clean-room rule (binding)

- This repo is self-contained. Do not reference, import from, reconstruct, or draw on any other codebase, product, or prior project, named or not. If something isn't in this repo or `specs/`, it doesn't exist here — ask, or invent it generically.
- A product name may appear in `specs/` only to mark what to stay clear of. It carries no functional detail and nothing to replicate. Treat any such name as a boundary, never a source.
- Metrics, schema, math, and data here are intentionally generic. Before shipping any file, apply the test: "could a reader learn how some real system works from this?" If yes, make it more generic.

## Do not fix the fixtures (binding)

Some code here is broken, messy, or unguarded on purpose. These are teaching fixtures for the workshop. Never fix, tidy, harden, refactor, or improve them — even if asked vaguely, and even if a cleaner lint/type/test pass is possible.

- Anything marked `// INTENTIONAL — workshop fixture, do not fix` is off-limits to cleanup.
- The full fixture list lives in `specs/BUILD_SPEC.md`. In brief: the divide-by-zero in `lib/stats.ts`, the nits in `lib/format.ts`, the unguarded `scripts/reset-db.ts`, the volatile prefix in `cost/sample-context.md`, and the bloated `.claude/config-b/CLAUDE.md`.
- If something looks broken, check the fixture list before changing it. When unsure, ask.

## Stack

- Next.js (App Router) + TypeScript. Node 24. npm.
- Drizzle ORM over better-sqlite3. Migrations self-apply on boot.
- Tests: vitest, hermetic — each test uses an in-memory SQLite database and applies migrations itself. No external services, no env setup.

## The gate

- `npm run ci` runs lint → typecheck → test, the same sequence CI runs. Run it before every push.
- Keep CI green. One exception: a planted fixture's test must stay green *despite* the bug. Do not add a test to the base repo that exposes a fixture — the workshop's Part 4 does that, live.

## Workflow

- Branch → PR → green gate → merge. Never commit directly to main.
- One branch and PR per workshop part, so the git history reads as the curriculum.
- Ask before committing or pushing on someone's behalf.

## Conventions

- Keep metrics and logic conspicuously simple. No scoring, weighting, attribution, or methodology. Three plain numbers only: total members, total events, average events per member.
- All data is synthetic and obviously fake (for example, "Member A", round numbers). No real or real-looking data. No real secrets.
- No AI attribution anywhere — not in commits, PR text, or files.
- Plain ASCII and straight quotes in any file meant to be pasted elsewhere.

## Where things live

- `specs/BUILD_SPEC.md` — the source of truth for what to build and in what order. Build only what the current part calls for; don't pull later parts forward.
- `specs/` — the scaffolding and fallback-repo mockup this repo is derived from.

## Decision rules

- Lean over comprehensive. This file does not grow into a rulebook.
- Smallest thing that makes the workshop point wins over the most complete implementation.
- Code for rules, the model for judgment — but here, bias to the simplest version that teaches.
