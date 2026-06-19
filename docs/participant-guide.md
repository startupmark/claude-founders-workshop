# Participant guide

This is the detailed walk-through of the Claude Founders Workshop: five parts, what you build in each, the commands you run, and what you should see when it works. If you only read one doc, read this one.

If you haven't done the setup yet, start with the [pre-flight checklist](pre-flight.md). It takes five minutes and saves you from discovering a broken dependency mid-exercise.

## The idea behind the five parts

Most teams are using Claude. Fewer are operating it. Using it means typing prompts and accepting diffs. Operating it means knowing what a feature cost, capping what an agent is allowed to break, catching the change that's almost right but not quite, and proving a config tweak actually helped instead of guessing. That's the gap these five parts close, in the order that gives you a visible win soonest.

The order is **See, Save, Secure, Verify, Systematize**. Underneath, you're learning to reach for one of three layers depending on the job:

- **Extend** is configuring Claude Code itself: hooks, settings, subagents, telemetry. No code that calls Claude. This is where rules that must be reliable live, because they run as deterministic code, not as requests in a prompt.
- **Call** is a single, stateless request to the Messages API for one narrow job, like scoring a diff. Cheap and bounded; no agent.
- **Embed** is Claude as an agent inside your own program, through the Agent SDK: headless runs, the full tool loop.

You'll touch Extend in Parts 1 and 3, Call in Parts 2 and 4, and Embed in Part 5. By the end the SDK reads as the obvious next step rather than a cold reveal.

## How to work through it

Fork the repo and check out the `start` branch. Each part is one pull request to your fork, so your git history ends up reading like the curriculum. When a part fights you, diff your branch against `main`, which is the finished version, and see what you missed.

A few conventions that hold throughout:

- **The gate.** `npm run ci` runs lint, then typecheck, then test, the same sequence CI runs. Run it before you push. Keep it green.
- **The `!` trick.** Inside a Claude Code session, type a command with a leading `!` (for example `! npm run cache-probe`) to run it in the session shell so its output lands in your transcript. The child process reads your `ANTHROPIC_API_KEY` and bills the key, while your session stays on your subscription.
- **Bring your own repo.** Each part below has a "On your own repo" note where the steps differ from running against `acme-community`.

Commands are written for macOS and Linux (bash or zsh). Where Windows PowerShell differs in a way that matters, the PowerShell version follows. See the platform notes in the pre-flight doc for the common translations.

---

## Part 1 - See

**The pain.** How much did your last feature cost? What's your cache-hit rate? Is the model's output even worth keeping? Most people can't say, because nothing shows it. `/cost` is per-session and forgotten on exit. So you start by looking at your own history, which is usually a little uncomfortable.

**What you build.** Two pictures of your usage from two different sources.

First, the historical picture from `ccusage`, which reads the JSONL session logs Claude Code already writes to disk and reconstructs spend and cache-hit rate across all your history:

```bash
npx ccusage@latest daily
```

If you have no history (or want everyone to see the same numbers), point it at the synthetic 30-day history the repo ships:

```bash
mkdir -p /tmp/cc/projects/acme-community
cp fixtures/claude-history/*.jsonl /tmp/cc/projects/acme-community/
CLAUDE_CONFIG_DIR=/tmp/cc npx ccusage@latest daily
```

```powershell
# Windows (PowerShell)
$dir = "$env:TEMP\cc\projects\acme-community"
New-Item -ItemType Directory -Force $dir | Out-Null
Copy-Item fixtures/claude-history/*.jsonl $dir
$env:CLAUDE_CONFIG_DIR = "$env:TEMP\cc"; npx ccusage@latest daily
```

Second, the live picture from OpenTelemetry, which is where the code-edit accept/reject rate comes from (that signal is not in `ccusage`). Merge the `env` block from `observability/settings.telemetry.json` into your `.claude/settings.json`, then restart Claude Code. `CLAUDE_CODE_ENABLE_TELEMETRY=1` is the only required variable; the rest select the OTLP exporter and a local endpoint. Then pick one of three dashboard paths, described in `observability/README.md`:

- The Docker Compose bundle from `anthropics/claude-code-monitoring-guide` (fastest to a full local stack).
- Your own OTel collector plus a Grafana community dashboard (most control).
- Grafana Cloud, hosted, with no Docker at all (lowest friction, and the one to pick if Docker gives you trouble).

**Prove it works.** `ccusage` prints a non-empty table within seconds. Whichever dashboard you chose shows data within about a minute of running a Claude Code command. A blank dashboard means telemetry isn't flowing, not that you have no usage; see troubleshooting.

**What you should see.** Against the synthetic history: roughly 40% cache-hit, two expensive cache-poor Opus sessions dominating a total around $15. On the live dashboard, your accept/reject rate, probably for the first time.

**On your own repo.** This part is better on your own machine, because `ccusage` reads your real usage regardless of which repo you're in. Nothing to adapt.

---

## Part 2 - Save

**The pain.** Pull up your Part 1 numbers. If cache-hit is around 40% when it could be 90%, something at the top of your prompt is busting the cache on every call. Prompt caching is a prefix match: the cached block has to be byte-identical across calls, so a single timestamp or build id at the top of a context file invalidates everything downstream. Cache reads cost about a tenth of the input price, so this is most of the cost lever, and it's broken on a lot of setups.

**What you build.** Two things, one Extend and one Call.

The prefix sentinel is a small script that flags a volatile first line in a context file before it costs you cache hits:

```bash
npm run prefix-sentinel            # checks cost/sample-context.md
```

Against the planted `sample-context.md` it fires on the `Last generated: ...` line and exits non-zero. Wire it as a pre-commit or Claude Code hook to keep volatile content out of your cached prefix.

The cache probe is your first direct Messages API call. It sends `sample-context.md` as a cached system block and prints the token usage across two identical calls, using Haiku and a one-hour cache TTL, so it makes two real but very cheap calls:

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
npm run cache-probe
```

```powershell
# Windows (PowerShell)
$env:ANTHROPIC_API_KEY = "sk-ant-..."
npm run cache-probe
```

**Prove it works.** The output has two lines. The cold call should show `cache_creation` greater than zero and `cache_read` at zero; the warm call should flip to `cache_creation` zero and `cache_read` greater than zero. That flip is caching working: the cold call paid to write the prefix, the warm call read it back for about a tenth of the price.

**What you should see.** If both reads come back zero, the prefix is below the model's cache minimum (the stable body has to clear 4096 tokens for Haiku), or it's volatile across calls. The sentinel points you at the volatile-line fix: move the timestamp out of the cached prefix.

**On your own repo.** Point the sentinel at your real `CLAUDE.md` or context files (`node cost/prefix-sentinel.mjs path/to/your.md`). The cache probe reads `sample-context.md`, so either keep using it to see the mechanism, or swap in your own large stable context block.

---

## Part 3 - Secure

**The pain.** Your agent has a shell. Right now, what stops it from running `rm -rf` or dropping your database? In practice, not much. There have been real incidents of agents deleting production databases, in at least one case while running a top model with explicit written safety rules. Model choice is not a safeguard. And about 45% of AI-generated code samples carry a vulnerability (Veracode's GenAI Code Security Report), while prompt injection sits at the top of the OWASP LLM risk list. Safety belongs at the tool layer, as deterministic code.

**What you build.** Three guards plus settings hardening, all as Node scripts (no `jq`, cross-platform). The two PreToolUse hooks are wired in `.claude/settings.json`:

- The prod tripwire blocks destructive shell ops (`rm -rf`, the planted `scripts/reset-db`, SQL `DROP`/`TRUNCATE`, force pushes, hard resets) and production-looking connection strings. To proceed on purpose, you include a typed token, `CONFIRM_DESTRUCTIVE=YES`, in the command.
- The slopsquat guard checks that any package an install command names actually exists on the npm registry and clears an age and download floor. A nonexistent package (the planted `@acme/date-helpers`) is denied; a real but very new one prompts; an established one passes silently.

The secret-scan hook is a plain git pre-commit hook, since Claude Code has no native pre-commit event. It scans staged changes for keys and tokens and blocks the commit if it finds any. Install it (this one is shell, so on Windows run it in Git Bash):

```sh
printf '#!/bin/sh\nexec node "$(git rev-parse --show-toplevel)/.claude/hooks/secret-scan.mjs"\n' \
  > .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
```

The settings hardening locks the session down: secrets unreadable, an explicit network allowlist with no wildcards, and no unsandboxed-command escape hatch.

**Prove it works, before you red-team.** This is the step people skip and regret. The hooks fail open by design, meaning any internal error exits silently, so a mis-pathed or mis-named hook protects nothing and says nothing. Confirm the fire before you trust the shield: trigger each guard once and watch it block. Aim the prod tripwire at `scripts/reset-db`, try to install `@acme/date-helpers`, and stage a fake key. When a PreToolUse hook denies or asks, it appends a line to `.claude/hooks/blocks.log`. Count what fired:

```bash
wc -l .claude/hooks/blocks.log
```

```powershell
# Windows (PowerShell)
(Get-Content .claude/hooks/blocks.log | Measure-Object -Line).Lines
```

**A gotcha worth knowing.** Once these hooks are live, they scan the whole command string of every Bash call, including your own. If you put a trigger word like `reset-db` in a command, even inside an `echo` label, your own call gets blocked. That's the guard working, not a bug. When you want to demo a trigger string without tripping it, put the string in a file and feed the file in, rather than typing it on the command line.

**On your own repo.** Copy `.claude/hooks/` and the relevant parts of `.claude/settings.json` into your repo. The guards run against any codebase. Tune the slopsquat thresholds if your stack pulls in legitimately new packages.

---

## Part 4 - Verify

**The pain.** A good CI gate catches lint, types, and tests, and most teams don't even have that. But it won't catch the model changing more than you asked, and it won't catch the edge case the model swore it handled. The Stack Overflow 2025 Developer Survey found the top frustration with AI tools isn't failure, it's output that's "almost right but not quite," reported by 66% of developers. Almost-right is worse than wrong, because it looks shippable until it fails on an edge case.

**What you build.** Two catchers, one Call and one Extend.

The scope check is a cheap, stateless scorer: it sends your current `git diff HEAD` plus a one-line description of what you *meant* to change to Haiku, and gets back constrained JSON. It needs a dirty working tree, since it scores the diff:

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
npm run scope-check -- "rename fmt to formatNumber in lib/format.ts; one file only"
```

You get back something like `{ "in_scope": true, "files_touched": ["lib/format.ts"], "reason": "..." }`. The exit code is 0 for in-scope, 1 for out-of-scope, 2 for a setup error. Its Part 4 target is the rename task: if the agent also tidies the planted nits in `format.ts` or touches other files, `files_touched` grows and `in_scope` flips to false. The scorer fails closed, treating an unparseable response as out-of-scope, so a confused model errs toward flagging rather than waving things through.

The verifier subagent (defined in `.claude/agents/verifier.md`) writes adversarial edge-case tests aimed at a specific change and runs them against the hermetic suite. Invoke it from inside Claude Code:

```
Use the verifier subagent to check the change to lib/stats.ts
```

Its target is the planted divide-by-zero in `averageEventsPerMember`, which returns `NaN` on an empty members list. The verifier generates a test for the empty case, the test fails, and the near-miss shows up before a human looks. The tests it writes are named `test/<name>.verifier.test.ts` and are git-ignored, so a live run never commits a test that would expose the fixture and turn the base gate red.

**Prove it works.** Run `scope-check` against a diff you know is over-scope and confirm `in_scope` comes back false with the extra files listed. Run the verifier against `lib/stats.ts` and confirm it writes a test that fails on the empty-members case. Both the hook and the subagent can fail to load silently, so confirm they're actually registered.

**On your own repo.** The scope check runs against any diff, so it works as-is on your own code. The verifier needs your repo to have a test suite to run against. The over-scope edits and near-miss bugs you catch here are exactly the material for your Part 5 golden set, so keep track of them.

---

## Part 5 - Systematize

**The pain.** You've edited your `CLAUDE.md` more than once. Did any of it help? You don't actually know. A study from ETH Zurich and LogicStar evaluating `AGENTS.md`-style context files found that LLM-written context files measurably *lowered* task success while raising cost by more than 20%. Some of your tweaks made things worse, and intuition can't tell you which. The fix is to stop guessing and measure.

**What you build.** An A/B harness on the Agent SDK, the Embed layer, that runs a small golden set under two project configs and reports pass-rate and cost with variance. The two configs are the lean baseline (`.claude/config-a/CLAUDE.md`, about 40 lines) and the sludge fixture (`.claude/config-b/CLAUDE.md`, about 566 lines of vague, overlapping advice).

It needs a key and a clean working tree, since each run executes in an isolated git worktree at HEAD. The config-A baseline is pre-computed and shipped, so you only run the variant live:

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
npm run eval -- --iterations 3
```

To regenerate the config-A baseline against real runs (do this if you've changed config A, or at rehearsal):

```bash
npm run eval -- --config a --iterations 3 --write-baseline
```

**Prove it works.** A run returns, per task, a `result` with a non-null cost and a pass/fail from the checker, then an aggregate verdict. If it hangs or throws "native CLI binary not found," that's the SDK's binary resolution, not your code; see troubleshooting.

**What you should see.** A verdict, not a guess: pass-rate and mean cost for each config, side by side. In our own rehearsal, the bloated config B cost about 1.26 times config A for no better pass-rate. Run several iterations and look at the spread, because a single A-versus-B run can show a gap that's pure time-of-day API-latency noise. Teaching yourself to read that variance is part of the lesson, not a footnote.

**On your own repo.** Bring your own golden tasks, ideally the near-misses and destructive actions you caught in Parts 3 and 4. Point config A at your real lean `CLAUDE.md` and config B at whatever you suspect is bloated, and let the numbers settle the argument.

---

## FAQ

**Will this cost me money?** Parts 1 and 3 ride your existing Claude Code usage. Parts 2, 4, and 5 make real API calls billed per token, on the order of cents for the workshop's tasks. Keep your key out of the interactive session (decline it at the prompt) so only the scripts spend.

**Can I use my own repo instead of `acme-community`?** Yes, and it's the better experience if your repo has tests and you have some Claude Code history. See the "On your own repo" note in each part, and the README section.

**I have no Claude Code history. Can I still do Part 1?** Yes. Point `ccusage` at the bundled synthetic history in `fixtures/claude-history/`, as shown in Part 1.

**Which dashboard path should I pick in Part 1?** If Docker is reliable on your machine, the Compose bundle is fastest. If it isn't, use Grafana Cloud, which needs no Docker at all. You can also skip the dashboard entirely and still get the cost and cache hook from `ccusage` alone; you just lose the live accept/reject view.

**The gate is green, but you said there are bugs. How?** The planted bugs sit on paths the committed tests don't cover. The divide-by-zero, for instance, only triggers on an empty members list, and the base test checks the happy path. That's the point: a normal CI gate stays green while the bug waits. Parts 4 and 5 are what expose it.

**Do I commit the test the verifier writes?** No. Those tests are git-ignored on purpose, so a live run never turns the base gate red by committing a test that exposes a fixture.

**Why is the eval so small?** Three to five tasks, capped iterations, and a pre-computed baseline keep it fast and cheap enough to run live. A bigger set would be slower and pricier without changing the lesson.

---

## Troubleshooting

Most of these failures are quiet. Nothing errors; the thing just doesn't work and you assume it did. That's why each part above has a "prove it works" step.

**`ccusage` prints an empty table.** Your history is in a non-standard location or has been cleared. Use the bundled synthetic history (Part 1). On a clean demo machine, note that `ccusage` also reads Codex logs from `~/.codex` regardless of `CLAUDE_CONFIG_DIR`, which can add a stray line; move or ignore that folder.

**The dashboard is blank.** Telemetry isn't flowing. Confirm `CLAUDE_CODE_ENABLE_TELEMETRY=1` is in the settings file you actually loaded, that you restarted Claude Code after editing it, and that the OTLP endpoint matches where your collector is listening. Give it about a minute after running a command.

**The cache probe shows `cache_read=0` on both lines.** The prefix is below the cache minimum (the stable body must clear 4096 tokens for Haiku) or it's changing between calls. Check that nothing volatile sits above the cache breakpoint.

**A hook didn't fire.** Hooks fail open, so a mistake is silent. Check the path and event name in `.claude/settings.json`, confirm the script runs on its own, and restart Claude Code so it reloads settings. Then re-run the "prove it works" trigger.

**My own Bash command got blocked.** Expected, if it contained a trigger word like `reset-db` or `rm -rf`, even inside a label or comment. The prod tripwire scans the whole command string. Put the trigger text in a file instead of on the command line.

**`scope-check` exits 2 or says the tree is clean.** It scores `git diff HEAD`, so it needs uncommitted changes. Make the edit first, leave it uncommitted, then run it.

**`scope-check` prints an assertion about `async.c` after the JSON (Windows).** Cosmetic, and addressed in the current code. The JSON verdict prints first and is correct; the line is harmless teardown noise.

**The eval refuses to run.** It needs a clean working tree, since it snapshots HEAD into a worktree. Commit or stash your changes first.

**"native CLI binary not found" from the eval.** That's the Agent SDK's binary resolution failing, common on locked-down setups. Reinstall dependencies, and if it persists, run that part in the prepared cloud environment.

**A model ID returns a 404.** The stack ships roughly weekly and IDs drift. Model IDs live in `config/models.ts`; update them there against the current Anthropic docs.
