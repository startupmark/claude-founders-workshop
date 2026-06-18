# .claude/hooks/ - Part 3 (Secure)

Three guards plus settings hardening. The two PreToolUse hooks are wired in
`.claude/settings.json`; the secret-scan is a git pre-commit hook you install.

All three are Node scripts (no `jq` dependency, cross-platform) and **fail open**:
any internal error exits 0 silently, so a buggy hook never blocks real work.

## prod-tripwire.mjs (PreToolUse, Bash)

Blocks destructive shell ops (`rm -rf`, `scripts/reset-db`, SQL `DROP`/`TRUNCATE`,
`git push --force`, `git reset --hard`) and production-looking connection strings
(a DB URL containing `prod`, an `*.rds.amazonaws.com` host, a prod `DATABASE_URL`).

It **demands a typed confirmation**: to proceed on purpose, include the token in
the command:

```
CONFIRM_DESTRUCTIVE=YES
```

Its red-team target is the planted `scripts/reset-db.ts`.

## slopsquat-guard.mjs (PreToolUse, Bash)

When a command installs a package (`npm install`, `npm i`, `npm add`, `pnpm add`,
`yarn add`, `bun add`), it verifies the target exists on the npm registry and
clears an age/download floor (default 30 days / 1000 downloads/mo):

- does not exist (404) -> **deny** (the hallucinated-dependency failure),
- exists but too new or too few downloads -> **ask**,
- exists and established -> silent allow.

Its target is the planted `@acme/date-helpers`, which does not exist.

## secret-scan.mjs (git pre-commit)

Claude Code has no native pre-commit event, so this is a plain git hook. It scans
**staged** changes for AWS keys, private-key blocks, Anthropic/OpenAI/GitHub/Slack/
Google tokens, and hardcoded `key = "..."` style secrets, and blocks the commit
(exit 1) if any are found. Install it:

```sh
printf '#!/bin/sh\nexec node "$(git rev-parse --show-toplevel)/.claude/hooks/secret-scan.mjs"\n' \
  > .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
```

Override a false positive with `git commit --no-verify`.

## Counting blocks

When the PreToolUse hooks deny or ask, they append a line to
`.claude/hooks/blocks.log` (git-ignored). Count what fired:

```sh
wc -l .claude/hooks/blocks.log
```

## settings.json hardening

`.claude/settings.json` registers the two PreToolUse hooks and hardens the
session:

- `permissions.deny` keeps secrets unreadable (`.env`, `*.pem`).
- `sandbox.network.allowedDomains` is an **explicit allowlist with no wildcards**
  (npm registry, GitHub, Anthropic API).
- `sandbox.allowUnsandboxedCommands` is `false` - no escape hatch.
- `sandbox.failIfUnavailable` is `false`, so on a platform without sandbox
  support the session still starts (the allowlist simply does not apply there).
