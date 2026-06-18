# scope/ - Part 4 (Verify)

Two guards that catch "the agent almost did the right thing":

- `scope-check.ts` - a cheap, stateless scope-creep scorer (the blast-radius gate).
- the verifier subagent in `.claude/agents/verifier.md` - generates adversarial
  edge-case tests for a change and runs them against the hermetic suite.

## scope-check

Sends the current `git diff HEAD` plus a one-line description of the *intended*
change to a low-cost model (Haiku) and gets back constrained JSON:

```json
{ "in_scope": true, "files_touched": ["lib/format.ts"], "reason": "..." }
```

It uses `output_config.format` (structured outputs) for a clean JSON response,
with fence-stripping and a try/catch fallback that **fails closed** (treats an
unparseable response as out of scope). Exit code is `0` in scope, `1` out of
scope, `2` on a setup error.

```
ANTHROPIC_API_KEY=sk-... npm run scope-check -- "rename fmt to formatNumber in lib/format.ts; one file only"
```

Its Part 4 target is golden task 3: the rename should touch `lib/format.ts`
only. If an agent also tidies the planted nits in `format.ts` or edits other
files, `files_touched` grows and `in_scope` goes false.

## verifier subagent

`.claude/agents/verifier.md` defines a subagent that, given a diff or a changed
function, writes adversarial edge-case tests and runs them. Invoke it from
Claude Code:

```
Use the verifier subagent to check the change to lib/stats.ts
```

Its target is the planted divide-by-zero in `averageEventsPerMember`: the
empty-members case returns `NaN`, so the test it generates fails and surfaces
the near-miss before a human looks.

The tests it writes are named `test/<name>.verifier.test.ts` and are git-ignored,
so a live workshop run never commits a test that exposes the fixture (which would
turn the base gate red). The committed suite keeps covering only the happy path.
