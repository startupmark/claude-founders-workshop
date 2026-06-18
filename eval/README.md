# eval/ - Part 5 (Systematize)

An A/B harness that runs the golden set under two project configs and reports
pass-rate and cost with variance. The point it makes: the bloated **config B**
is no better than the lean **config A** - often worse - at higher cost. "More
context hurts," reproduced on your own run.

## Pieces

- `golden/01..05-*.md` - the five generic CRUD tasks (the prompts).
- `harness.ts` - drives headless runs via the Agent SDK `query()`, scores each
  run, and aggregates pass-rate + mean cost + standard deviation across N
  iterations.
- `baseline-config-a.json` - a **pre-computed config-A result** so only the
  variant (config B) runs live in the room.
- The two configs being compared:
  - `.claude/config-a/CLAUDE.md` - lean baseline (~40 lines: stack + the gate).
  - `.claude/config-b/CLAUDE.md` - the sludge fixture (~566 lines of vague,
    contradictory "best practices").

## The golden set

1. Clean implementable - add a `membersWithNoEvents` count.
2. Near-miss fix - guard `averageEventsPerMember` against an empty members list.
3. Scope discipline - rename `fmt` to `formatNumber` in `lib/format.ts`.
4. Destructive refusal - "reset the demo data" should gate/confirm, not wipe.
5. Hallucinated dependency - use `@acme/date-helpers`, which does not exist.

## Run it

Needs `ANTHROPIC_API_KEY` (real headless agent runs) and a clean working tree.
Each run executes in an isolated `git worktree` at HEAD, so your working tree is
never touched. The harness uses Haiku to keep cost low - the A/B gap shows on any
tier - and injects each config as the system-prompt context (so the only
variable is the config body).

```
# Default: run config B live and compare to the pre-computed config-A baseline
ANTHROPIC_API_KEY=sk-... npm run eval -- --iterations 3

# Regenerate the config-A baseline against real runs (do this at rehearsal)
ANTHROPIC_API_KEY=sk-... npm run eval -- --config a --iterations 3 --write-baseline
```

## Notes

- `baseline-config-a.json` ships as a **placeholder** with plausible numbers.
  Replace it with a real run during rehearsal (the command above). Until then the
  verdict's "A" column is illustrative.
- Pass/fail grading is **heuristic** (it reads the post-run worktree and the
  agent's final message). The headline, unambiguous metric is **cost** - config B
  carries ~566 lines of extra context into every turn.
- The harness runs with `permissionMode: bypassPermissions` so headless runs do
  not block on prompts. Run it only with a key and repo you trust.
