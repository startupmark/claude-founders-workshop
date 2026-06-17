# The Claude Founders Kit — Workshop Series Scaffolding (v3)
### A hands-on, five-part series that takes a startup team from "using Claude" to "operating Claude" — across the three surfaces you can build on: **Extend · Call · Embed**

*Prepared for Mark Birch · Field + virtual founder workshops · Reference implementation: TribeROI / TribeSights*

> **What's new in v3.** Corrected the `/cost`-vs-`ccusage` distinction and the accept/reject-rate source (it comes from OpenTelemetry, not ccusage). Presented the **observability layer as three interchangeable paths** (local `claude-code-otel` bundle / official Grafana dashboards / hosted Grafana Cloud) rather than a single tool, with an honest trust note and a prompt-logging privacy caveat. Added explicit **prerequisites**, a mandatory **canonical fallback repo**, a **golden set built across the series** (so Part 5 never depends on a thin repo), a **"prove it's working" verification beat** in every part (the silent-failure killer), and a comprehensive **Failure points & recovery** section.

---

## How to use this doc

Five parts, each a standalone ~60–90 min hands-on workshop, each one pull request to a single repo the team forks in Part 1 and completes by Part 5. Every part follows the same beats so it's repeatable and teachable:

1. **Before** — their own pain, quantified on their own machine.
2. **Build** — what they install/write themselves, in ~20–35 min.
3. **Verify** — the explicit "prove it's actually working" check. *(New in v3 — every component here can fail silently; never skip this.)*
4. **After** — the number that moved.
5. **Why** — one paragraph they can repeat to a cofounder.
6. **Cliffhanger** — the pain the next part solves.

The spine — **See → Save → Secure → Verify → Systematize** — is ordered by *time-to-visible-win* and *pedagogical dependency*, not by build difficulty.

---

## The core idea taught across the series: three surfaces

The most valuable thing a founder leaves with isn't a tool — it's knowing **which of the three surfaces fits which job.**

| Surface | What it is | When to reach for it | Cost model |
|---|---|---|---|
| **Extend** (config surface) | Hooks, `settings.json`, slash commands, subagents, telemetry — you extend Claude Code without writing code that calls Claude | Deterministic rules, guardrails, observability — anything the harness should just *do* | Rides existing Claude Code usage |
| **Call** (Messages API) | Direct, stateless calls via `@anthropic-ai/sdk` for one narrow job | Cheap, bounded tasks: classify a diff, score scope, summarize — where a full agent is overkill | Per-token on an API key |
| **Embed** (Agent SDK) | Claude *as an agent* in your own program via `@anthropic-ai/claude-agent-sdk` — headless sessions, the full tool loop, orchestration | Driving Claude from your software: eval harnesses, automation, multi-step workflows | Per-token on an API key (subscription Agent SDK usage draws from a separate credit pool as of June 2026) |

**Escalation through the series:** Part 1 *Extend* → Part 2 **first raw API call** (*Call*) → Part 3 *Extend* → Part 4 **API for a cheap job** (*Call*) → Part 5 **Agent SDK** (*Embed*). By the capstone the SDK reads as the natural next step, not a cold reveal.

---

## Prerequisites & who this is for

This series assumes a specific baseline. State it as an **admission requirement**, not a hope — most live failures trace back to an attendee who didn't meet it.

**Required per attendee:**
- **An active Claude Code install with real history** (≥ ~2 weeks of actual use). Part 1's entire hook is "look at your own scary number," which reads from on-disk session logs. A brand-new install has no history and the hook falls flat. *(Mitigation for newcomers: a sample log dataset they can load — see fallback repo.)*
- **A real working repo** they develop in — ideally with a test suite. Parts 4 and 5 run generated tests and golden tasks against a codebase. *(Mitigation: the canonical fallback repo below.)*
- **Node 20+, git, and Docker** (Docker only for Part 1's dashboard; there's a no-Docker path).
- **The workshop-provided API key** (Parts 2, 4, 5).

**Honest scope note:** the kit is **Claude-stack-specific** (Claude Code config surface + Claude API/SDK). Cursor/Copilot-only attendees will follow the concepts but won't run the exact `.claude/` mechanics. Say this up front so nobody feels mis-sold.

---

## The kit (the through-line)

One repo the cohort forks empty in Part 1 and completes by Part 5 — working name **`claude-founders-kit`**, mirroring a real production `.claude/` layout:

```
claude-founders-kit/
├── .claude/
│   ├── settings.json        ← grows each part (telemetry → hardening)
│   ├── hooks/               ← Part 2 (prefix sentinel) + Part 3 (guardrails) + Part 4 (blast-radius)
│   └── agents/              ← Part 4 (verifier subagent)
├── observability/           ← Part 1: dashboard path of choice (Compose bundle / own stack / Grafana Cloud)   [Extend]
├── cost/
│   ├── prefix-sentinel.*     ← Part 2: hook flagging dynamic prefixes        [Extend]
│   ├── cache-probe.ts        ← Part 2: raw Messages API, watch usage         [Call]
│   └── litellm.config.yaml   ← Part 2: tiered routing gateway
├── scope/
│   └── scope-check.ts        ← Part 4: raw Messages API, cheap diff scorer   [Call]
├── eval/
│   ├── harness.ts            ← Part 5: Agent SDK headless runner             [Embed]
│   └── golden/               ← golden task set, seeded across Parts 1–4
└── README.md                 ← the scoreboard + "what you've installed so far"
```

The **content** stacks (each part needs the last) and so does the **artifact** — they leave each session with running code and a moving number, and finish owning a complete, opinionated Claude setup.

---

## The canonical fallback repo (mandatory safety net)

**The biggest "great on paper, dies in the room" risk is that an attendee's own repo is too thin to demo against** — no tests, brand-new, or unrepresentative. Part 5 especially depends on having something real to evaluate. So ship a **canonical fallback repo**: a small but realistic app (a few features, a hermetic test suite in the TribeSights vitest shape, and a handful of deliberately tricky tasks with known edge cases). Anyone whose own codebase isn't suitable uses it instead.

This isn't optional polish — it's what guarantees the session works regardless of what walks in the door, and it widens the audience to teams that don't yet have a mature codebase. Bundle a **sample Claude Code JSONL dataset** with it too, so newcomers without usage history can still run Part 1's hook.

---

## The golden task set is built *across* the series (not pulled from thin air)

Part 5 compares config A vs. B against a "golden task set." Rather than hoping the attendee's repo has good material on capstone day, **each earlier part deposits a task or two** into `eval/golden/`:

- **Part 1** — a task pulled from their accept/reject logs where the model did poorly.
- **Part 3** — the destructive action the guardrail caught (becomes a "must refuse / must gate" case).
- **Part 4** — the near-miss bug the verifier caught and the scope-creep example.

By Part 5 the golden set already exists and is theirs. The dependency becomes a feature: "remember those tasks we caught along the way? *That's* your eval set." The fallback repo ships with its own ready-made golden set for anyone who needs it.

---

## A note on keys & billing (workshop logistics)

The workshop **provides each attendee an API key pre-loaded with a small credit** on sign-up/attendance.

- **Parts 1 & 3** (Extend) ride their existing Claude Code usage — no key needed.
- **Parts 2, 4, 5** (Call/Embed) use the provided API key and bill **per token** — cents per relevant call. Show the spend live so they feel how cheap "Call" is.
- API-key usage bills per token, separate from subscription Agent SDK credit pools, so the workshop keys behave predictably and never touch an attendee's personal plan.

---

## Part 1 — SEE *(observability)* · Surface: **Extend**

**Before.** "How much did your last feature actually cost? What's your cache-hit rate? Is the model even helping?" Nobody knows. Have them run `npx ccusage@latest` against their *real* Claude Code history — instant, personal, slightly horrifying.

**Build (~20 min).** Two distinct data sources — be clear they're different:
- **`ccusage` → cost & cache.** It reads the **local JSONL session logs** Claude Code writes to disk and reconstructs spend, cache-hit rate, and per-model/per-day breakdowns across *all* history. Because it only reads files already on disk, it sees usage from **before it was installed** — it isn't logging anything itself; it parses what Claude Code already wrote. Dependency: the logs exist and haven't been cleared.
- **OpenTelemetry → the accept/reject signal.** Set `CLAUDE_CODE_ENABLE_TELEMETRY=1` + an OTLP block in a version-controlled `.claude/settings.json`, then point it at a dashboard. **This is where the code-edit accept/reject rate comes from — not ccusage.**

*The OTel pipeline (whichever option you pick):* Claude Code emits telemetry → an **OTel Collector** receives it → **Prometheus** stores the metrics (tokens, cost, accept/reject counts) and **Loki** stores the logs → **Grafana** draws the dashboard. The telemetry source is Claude Code's **native, official** OpenTelemetry support, and the four pipeline components are all major, widely-trusted open-source projects (CNCF / Grafana Labs).

*Pick one of three dashboard paths — they trade ops-friction against control:*
1. **`claude-code-otel`** (`ColeMurray/claude-code-otel`, MIT) — a pre-wired Docker Compose bundle: one command, four containers, a dashboard you keep. Fastest to a full local stack. Honest trust note: it's **one practitioner's repo, not a widely-vetted standard** like ccusage — but it's MIT, local-only, inspectable in a few minutes, and only glue (a Compose file + dashboard JSON), not a daemon phoning home. `NikiforovAll/ccdashboard` is a comparable alternative.
2. **Official Grafana community dashboards** (Grafana Labs dashboard IDs 25052 / 25255) dropped onto your own Collector + Prometheus — most reputable source, slightly more assembly.
3. **Grafana Cloud (hosted, free tier)** — lowest-ops, **no Docker**, native OTLP endpoint. The path I'd lean on for a room, since Docker is the single most fragile live-failure point.

*Privacy note worth teaching, not just noting:* prompt text is **not** logged by default, but `OTEL_LOG_USER_PROMPTS=1` (and `OTEL_LOG_TOOL_DETAILS=1`) will capture it. For a shared/team dashboard, decide redaction and access control before enabling those. In a room of strangers, leave prompt logging **off** — which is the default.

*`/cost` vs. `ccusage`:* native `/cost` is a built-in command for the **current session only** — passive, forgotten on exit, and on a flat Max/Pro plan it shows token counts rather than a real dollar picture. `ccusage` is **historical and analytical** across every session. Different tools.

*Is ccusage safe?* It's open source (MIT, by ryoppippi), widely used, **local-only, needs no API key, and sends your logs nowhere** — it's inspectable and low-risk. It is *not* an Anthropic product and *not* formally security-audited, so in a corporate setting vet the version like any `npx` dependency.

**Verify (prove it's working).** ccusage prints a non-empty table within seconds. Whichever dashboard path you chose, it shows live data within ~60s of running a Claude Code command — if it's blank, telemetry isn't flowing (see failure points).

**After.** Their 30-day spend, cache-hit %, and — the metric that matters most — **code-edit accept/reject rate**, surfaced for the first time.

**Why.** "You can't optimize what you can't see. `/cost` is passive and per-session; this is your whole history plus the accept/reject signal that tells you whether the model is earning its tokens."

**Surface lesson.** "All of that was *Extend* — you made Claude Code emit what you need without writing a line that calls Claude. Next time we make our first direct API call."

**Golden-set deposit:** a task from the accept/reject logs where the model did poorly.

**Maps to:** Cluster 1 (cost) + Cluster 6 (eval). **Outcomes:** productive, lower cost.

**Cliffhanger.** "You found the leak. Half of it is one dumb bug in how your prompt is *ordered* — and next time you'll watch the fix land in the raw API response itself."

---

## Part 2 — SAVE *(cost discipline)* · Surface: **Call** (first raw API call) + Extend

**Before.** Pull up their Part 1 dashboard: "Cache-hit is 40%. It should be 90%. Here's the timestamp at the top of your prompt nuking it on every call." Show prefix volatility live.

**Build (~30 min).**
1. **Prefix sentinel** *(Extend)* — a hook that scans the assembled prompt/CLAUDE.md for dynamic content (timestamps, UUIDs, reordered tool defs) ahead of the stable prefix and flags/relocates it to the tail.
2. **The first raw API call** *(Call)* — ~20 lines that make them *see caching work in the response*, because the cost lever and the API response are the same lesson:

```ts
// cost/cache-probe.ts — the "Call" surface: a direct Messages API request
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "node:fs";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY (the workshop key)
const stablePrefix = readFileSync("CLAUDE.md", "utf8"); // your big, stable context

async function call(label: string) {
  const res = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 128,
    system: [{
      type: "text",
      text: stablePrefix,
      cache_control: { type: "ephemeral", ttl: "1h" }, // ← the lever (1-hour TTL)
    }],
    messages: [{ role: "user", content: "One-line summary of the build gate." }],
  });
  console.log(label, {
    write: res.usage.cache_creation_input_tokens, // tokens written to cache
    read:  res.usage.cache_read_input_tokens,     // tokens served from cache (~10% price)
  });
}

await call("cold"); // expect write > 0, read = 0  → cache miss, you paid the write
await call("warm"); // expect write = 0, read > 0  → cache hit, ~90% cheaper
```

3. **Explicit `"ttl":"1h"`** for slow interactive loops — counters the corroborated 5-minute-TTL regression that silently expires the cache while you read a diff.
4. **Tiered routing** via **LiteLLM** (the optional stretch goal) so bulk work goes to Haiku/local and only hard reasoning hits Opus.

**Verify (prove it's working).** The probe's `cold` line shows `write > 0, read = 0`; the `warm` line shows `write = 0, read > 0`. If both reads are 0, the prefix is below the cache minimum or volatile (see failure points).

**After.** Re-run `ccusage` against the Part 1 baseline: cache-hit climbs (40% → 85%+), cost-per-task drops, write-premium events → 0. Same dashboard, numbers now moving.

**Why.** "Caching is ~90% of the cost lever. One dynamic token at the top invalidates everything downstream, and a 5-minute TTL expires while you read a diff. The API's `usage` object is your receipt — read it."

**Surface lesson.** "That was *Call* — a direct, stateless API request. No agent, just one call and its response. In Part 4 we'll use a *Call* to do a real job."

**Maps to:** Cluster 1. **Outcomes:** lower cost, productive, accelerate.

**Cliffhanger.** "It's cheap now — cheap enough you'll want to let it run unattended. Would you? The last person who did had it delete production. Next: we make that impossible."

---

## Part 3 — SECURE *(guardrails)* · Surface: **Extend**

**Before.** Tell the Replit and PocketOS stories — production databases deleted, the second one *running the best model with explicit safety rules*. Then: "Your agent has a shell. Right now, what stops it from `rm -rf` or dropping your DB? Vibes."

**Build (~25 min)** — the guardrails bundle as deterministic hooks in a version-controlled `.claude/hooks/`:
- **Prod tripwire** (PreToolUse): block destructive ops / prod connection strings; demand a typed confirmation.
- **Slopsquat guard** (PreToolUse): verify every `npm/pip/uv install` package actually exists, with an age/download floor, before it runs.
- **Secret-scan** pre-commit hook.
- **`settings.json` hardening**: explicit `allowedDomains` (no wildcards), `allowUnsandboxedCommands: false` for unattended runs.

**Verify (prove it's working) — do this BEFORE the red-team.** Deliberately trigger each guardrail once (a harmless `rm` against a sandbox path, an install of a known-nonexistent package) and confirm it blocks. A hook that's mis-pathed or mis-named fails *silently* — which is worse than no hook, because you'll trust protection you don't have. Confirm the fire before you trust the shield.

**After.** A live "try to make it nuke something" red-team (in a throwaway sandbox dir only): destructive ops intercepted, hallucinated installs blocked — counted on the board.

**Why.** "Model choice is not a safeguard — the best model with explicit rules deleted prod anyway. Safety belongs at the tool layer as deterministic hooks, not as polite requests in CLAUDE.md."

**Surface lesson.** "Back on *Extend* — and notice: rules that must be reliable are code (hooks), never model judgment. *Extend* is where determinism lives."

**Golden-set deposit:** the destructive action the guardrail caught, as a "must gate / must refuse" case.

**Maps to:** Cluster 7 (security) + Cluster 8 (destructive action). **Outcomes:** higher quality, less aggravation.

**Cliffhanger.** "Now it's safe to run. But safe isn't *correct*. Your agent says 'done' — and it's 'almost right but not quite' two times out of three. Next: catch the near-misses before they reach your branch, using the API to do a real job."

*This is the viral module.* A slopsquat guard blocking a real hallucinated package is a perfect tweet; "open-source guardrails that stop your AI from nuking prod" spreads itself.

---

## Part 4 — VERIFY *(quality gates)* · Surface: **Call** (API for a cheap job) + Extend

**Before.** "A good CI gate catches lint, types, and tests — real, and most teams don't even have that. But it doesn't catch the model changing more than you asked, and it doesn't catch the edge case the model swore it handled. Stack Overflow says that's the #1 frustration: 66% 'almost right but not quite.' The bug's already merged."

**Build (~30 min)** — two components:
1. **Blast-radius gate** *(Call)* — a PostToolUse hook that, on each change, makes a **cheap, stateless API call** to score the diff for scope creep. The canonical "use the raw API for one narrow job, not a whole agent" lesson:

```ts
// scope/scope-check.ts — the "Call" surface doing a real job: a cheap, disposable scorer
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic();

export async function scopeScore(taskSpec: string, diff: string) {
  const res = await client.messages.create({
    model: "claude-haiku-4-5",            // cheap + fast: right tool for a bounded job
    max_tokens: 200,
    system:
      "You score code diffs for scope creep. Reply ONLY with JSON: " +
      '{"in_scope": boolean, "out_of_scope": string[], "risk": "low"|"med"|"high"}.',
    messages: [{ role: "user", content: `TASK:\n${taskSpec}\n\nDIFF:\n${diff}` }],
  });
  const raw = res.content.find((b) => b.type === "text")?.text ?? "{}";
  const clean = raw.replace(/```json|```/g, "").trim(); // strip fences
  try { return JSON.parse(clean); } catch { return { in_scope: true, out_of_scope: [], risk: "low" }; }
}
```

2. **Almost-right catcher** *(Extend)* — a verifier subagent in `.claude/agents/` that, after an implementation, generates adversarial edge-case tests aimed at *that specific diff* and runs them against a hermetic suite before a human looks.

**Verify (prove it's working).** Run `scope-check.ts` against a deliberately out-of-scope diff and confirm it returns `risk: "high"` with populated `out_of_scope`. Run the verifier subagent against the curated known-near-miss task and confirm it generates and fails a test. (Both the subagent and the hook can fail to load silently — confirm registration.)

**After.** Near-miss bugs caught pre-review and out-of-scope edits flagged; the scope-check call costing a fraction of a cent shown live.

**Why.** "'Almost right' is worse than wrong — it's shippable until it isn't, so a grader should catch it, not your customer. And the model changes more than you ask; gate the scope. The cheapest way to do both is a single Haiku call, not a whole agent."

**Surface lesson.** "*Call* isn't just for cost demos — it's a workhorse for cheap, bounded jobs in your pipeline. Next time we graduate to the third surface and let Claude drive itself."

**Golden-set deposit:** the near-miss bug and the scope-creep example.

**Maps to:** Cluster 2 (over-editing) + Cluster 4 (trust gap). **Outcomes:** higher quality, productive.

**Cliffhanger.** "Four tools, four numbers. But you edited your CLAUDE.md last week — did it actually help? You have no idea, and some 'best practices' make things *worse*. Next time we stop guessing — by letting Claude run itself, headless, from our own code."

---

## Part 5 — SYSTEMATIZE *(eval — the capstone)* · Surface: **Embed** (Agent SDK)

**Before.** The AGENTS.md study: LLM-written context files measurably *hurt* task success while raising cost ~20%. "Every CLAUDE.md tweak you've made was a guess. Statistically, some made it worse — and you can't tell which." The reframe from "using Claude" to "operating Claude."

**Build (~35 min)** — the **config A/B harness** on the **Claude Agent SDK** (the *Embed* surface):

```ts
// eval/harness.ts — the "Embed" surface: drive headless Claude agents from your code
import { query } from "@anthropic-ai/claude-agent-sdk";

async function runTask(task: GoldenTask, configDir: string) {
  let cost = 0;
  for await (const msg of query({
    prompt: task.prompt,
    options: { cwd: task.repoPath, settingSources: [configDir] }, // ← config A or config B
  })) {
    if (msg.type === "result") cost = msg.total_cost_usd ?? 0;
  }
  const passed = await task.check(task.repoPath); // reuse the verifier/tests from Part 4
  return { passed, cost };
}

// Run the golden set under config A and config B, N times each (control for infra noise),
// then compare pass-rate and cost. Output a verdict, not a vibe.
```

The golden set is the one **assembled across Parts 1–4** (or the fallback repo's ready-made set). **Keep it tiny — 3–5 tasks — and pre-compute the baseline (config A) before the session** so attendees only run the variant live; otherwise the run is too slow and too expensive across a whole room.

**Verify (prove it's working).** A dry-run task returns a `result` message with a non-null `total_cost_usd` and a pass/fail from the checker. If the harness hangs or throws "native CLI binary not found," it's the SDK binary-resolution issue (see failure points) — switch that attendee to the cloud fallback env.

**After.** A *verdict* on a change they actually made: "config B: +8% pass, −12% cost — ship it," or "no significant difference — revert it and stop cargo-culting." **Run N iterations and show the variance** — a single A-vs-B run can show a difference that's pure time-of-day API-latency noise, which Anthropic's own research flags. Teaching that caveat *is* part of the lesson.

**Why.** "Intuition about what helps is measurably wrong. Once you can A/B your own setup against your own tasks — headless, from your own code — you've stopped chasing X threads and started running an engineering org. That's *operating* Claude."

**Surface lesson (the payoff).** "You've now used all three surfaces: *Extend* it (Parts 1, 3), *Call* it (Parts 2, 4), and *Embed* it (today). A well-engineered Claude setup is just knowing which surface each job wants — and now you do."

**Maps to:** Cluster 6 (eval) + Cluster 9 (model selection) + the hype-tax. **Outcomes:** all six, especially accelerate.

**Closer (series payoff).** "You forked an empty kit in Part 1. You now own a complete, instrumented, safe, self-verifying, self-evaluating Claude setup that touches all three surfaces — the same shape a working team runs in production. Five sessions, five numbers that moved, one repo that's your proof."

---

## The connective tissue

**Your product as the reference implementation.** Open each part with 30 seconds of the kit running in TribeSights — real `ccusage` output, the actual `.claude/hooks/`, the hermetic test gate, the ntfy.sh stop hook, the real reviewer subagent. The TribeROI Eng OS doc is the source material; the workshop is its generalization.

**The engagement layer — and what "red-team and scoreboard" means.** Both are *optional, time-extending* activities that turn a 60-minute lean session into a 90-minute one. They're load-bearing for excitement, not for the learning.
- **Red-team** is the Part 3 exercise: attendees deliberately try to make their agent do something destructive — `rm -rf`, drop a table, install a hallucinated package — to *prove the guardrails fire*. It's adversarial, hands-on, memorable, and produces a count for the board. It adds time because everyone's trying to break their own setup (in a sandbox only).
- **Scoreboard** is the cross-cohort leaderboard across the five numbers (highest cache-hit, most destructive ops caught, most near-miss bugs trapped). It adds time because you collect and display everyone's results — but it's the engagement engine, and a shared persistence layer can power a live room-wide board.

**The advanced track (Parts 6+, evergreen).** Moonshots so the core stays tight: economic governor, cross-machine session teleport, release-day regression radar (golden set auto-runs against each new Claude model), agent flight recorder, skill-atrophy meter.

---

## Failure points & recovery (the full sweep)

A hands-on workshop lives or dies here. Organized by where it bites; each has the failure mode and the pre-empt. **The throughline: most of these fail *silently*, and the fix is the per-part "Verify" beat plus the fallback repo.**

### Part 0 — entry (before anything runs)
- **No Claude Code history.** New users have no JSONL → Part 1's hook is empty. *Pre-empt:* state "active Claude Code user, 2+ weeks history" as admission req; ship a sample JSONL dataset so they can still follow.
- **Wrong tool entirely.** Cursor/Copilot-only attendees can't run the Claude-Code-specific config surface. *Pre-empt:* state the Claude-stack scope up front.
- **Corporate lockdown.** Locked-down laptops block `npx`, Docker, or outbound API calls. *Pre-empt:* a pre-flight checklist sent ahead; a prepared cloud env (Codespace/VM) for anyone whose machine fights them.
- **API key not provisioned / capped.** Keys don't arrive in time or hit a spend cap mid-session. *Pre-empt:* provision and smoke-test keys before the room sits; keep spares; set caps high enough to finish.

### Part 1 — See
- **Docker not installed/running** (the most common live failure — the local Compose bundle needs four containers up healthy). *Pre-empt, in escalating order:* (1) default the room to **Grafana Cloud (hosted, no Docker)** to sidestep this entirely; (2) if local, Docker in the pre-flight check + pre-pulled images to dodge conference-wifi stalls; (3) ultimate fallback — **ccusage alone still delivers the cost/cache hook**, you only lose the live accept/reject dashboard.
- **Telemetry env var not picked up** (set in the wrong shell/scope → no data). *Pre-empt:* a verified copy-paste block + the 60-second "you should see data" check.
- **Cleared or relocated JSONL** (some setups prune logs; paths differ by OS). *Pre-empt:* know the per-OS paths; sample-dataset fallback.
- **Conference wifi** stalls image pulls across a room (local path only). *Pre-empt:* prefer Grafana Cloud; or pre-pull / local mirror / images on USB.
- **Prompt-logging left on for a shared board.** `OTEL_LOG_USER_PROMPTS=1` would push prompt text into a dashboard others can see. *Pre-empt:* leave it off (the default); only enable with redaction + access control decided first.

### Part 2 — Save
- **Empty or tiny stable prefix** → caching saves nothing, before/after is flat, the whole payoff vanishes. *Pre-empt:* seed a realistically large CLAUDE.md.
- **Below the cache minimum** (~1,024 tokens, Sonnet) → no cache at all. *Pre-empt:* ensure the seed prefix clears the threshold.
- **Already-good cache** → no dramatic climb. *Pre-empt:* a seed scenario with deliberately bad prefix ordering so the fix visibly works.
- **Model ID drift** → a deprecated model string 404s. *Pre-empt:* confirm current IDs the week of; keep them in one config variable.
- **LiteLLM routing misconfig.** *Pre-empt:* ship a known-good `litellm.config.yaml`; treat routing as the optional stretch, not required to show the cache win.

### Part 3 — Secure
- **Hooks silently not firing** (wrong path/event name, non-executable script, JSON typo) — worse than no guardrail because they trust protection they don't have. *Pre-empt:* the "make it fire on purpose" Verify step **before** the red-team.
- **OS shell differences** (bash vs. PowerShell — TribeSights is PowerShell/Windows, many attendees on macOS). *Pre-empt:* provide both; assume no single shell.
- **Slopsquat false positives** (a real but new/niche package fails the age/download floor). *Pre-empt:* tunable thresholds + a demoed allowlist escape hatch.
- **Red-team against something real.** *Pre-empt:* sandbox-dir-only, stated loudly.

### Part 4 — Verify
- **Non-JSON from the scorer** (model wraps JSON in prose/fences → `JSON.parse` throws). *Pre-empt:* hard-constrain output, strip fences, try/catch — shown in the snippet above as part of the lesson.
- **No tests in their repo** (the almost-right catcher needs a suite). *Pre-empt:* fallback repo's hermetic suite.
- **Subagent/hook not loading** (silent again). *Pre-empt:* a "confirm it's registered" check.
- **Flaky or trivial generated tests.** *Pre-empt:* a curated task where a near-miss is *known* to exist, so the catch is guaranteed to demo.

### Part 5 — Systematize (highest-risk)
- **Thin/unsuitable golden set** (the headline risk). *Pre-empt:* the series-seeded golden set + the fallback repo's ready-made set.
- **Infra noise swamps the signal** (pass-rates fluctuate with API latency by time of day). *Pre-empt:* run N iterations, show variance/significance — and teach it as the point, not a footnote.
- **Too slow / too expensive across a room.** *Pre-empt:* tiny golden set (3–5 tasks), capped iterations, pre-computed baseline so they only run the variant.
- **Agent SDK native-binary resolution** ("native CLI binary not found" on locked-down or unusual setups). *Pre-empt:* pre-flight the SDK install specifically; cloud fallback env on standby.
- **SDK API drift** (`query()` options or result-message shape changed since the snippet). *Pre-empt:* pin the SDK version for the cohort; test the harness against that pin the week of.

### Cross-cutting
- **The silent-success trap.** Hooks, subagents, and telemetry all fail *quietly* — nothing errors, it just doesn't work, and attendees believe they succeeded. *Pre-empt:* the explicit "Verify / prove it's working" beat in every part. This matters more than any single piece of content.
- **Version drift generally** (the stack ships ~weekly; last month's snippet 404s today). *Pre-empt:* pin versions for the cohort, re-test the week of, keep all model IDs/versions in one place.
- **Time overrun** (any failure above eats the clock and rushes later parts). *Pre-empt:* the 60/90 split; a documented 2-minute fallback for each heavy step (esp. Docker and the SDK).

---

## Facilitator notes

- **Prerequisites per attendee:** see the Prerequisites section — active Claude Code install with history, a real repo (or the fallback), Node 20+, Docker (Part 1), git, the workshop API key (Parts 2, 4, 5).
- **Timing:** 60 min lean / 90 min with red-team and scoreboard (both defined above). Parts 2 and 5 are the long ones.
- **Per-part deliverable:** one merged PR to their fork + one screenshot of the moved number + (Parts 1, 3, 4) a golden-set task deposited.
- **Run order of safety nets:** confirm keys → confirm Docker (or switch to no-Docker path) → confirm Claude Code history (or load sample) → confirm repo suitability (or switch to fallback repo). Settle all four before teaching.

---

## Appendix — specifics to re-check before running (the stack ships ~weekly)

- **Packages:** `@anthropic-ai/sdk` (raw Messages API, the *Call* surface) and `@anthropic-ai/claude-agent-sdk` (the *Embed* surface; renamed from the old Claude Code SDK; bundles a native Claude Code binary).
- **Model IDs in snippets** (`claude-opus-4-8`, `claude-sonnet-4-6`, `claude-haiku-4-5`) are illustrative — confirm current IDs against the docs the week you run it.
- **Cache fields:** `usage.cache_creation_input_tokens` / `usage.cache_read_input_tokens`; `cache_control: { type: "ephemeral", ttl: "1h" }`.
- **Observability paths (Part 1):** `ColeMurray/claude-code-otel` (MIT Docker bundle; one practitioner's repo, inspect before relying) or `NikiforovAll/ccdashboard`; official Grafana community dashboards (IDs 25052 / 25255) on your own Collector + Prometheus; or Grafana Cloud (hosted, no Docker). Telemetry source is Claude Code's native OTel; `OTEL_LOG_USER_PROMPTS` is off by default — keep it off for shared boards.
- **Agent SDK shape:** `query({ prompt, options })` is an async generator ending in a `result` message; confirm `settingSources`, `total_cost_usd`, and the result-message shape against the current TypeScript SDK reference.
- **Billing:** API-key usage bills per token; subscription Agent SDK / `claude -p` usage draws from a separate monthly Agent SDK credit pool (in effect since June 15 2026). Workshop keys are API keys → per-token, predictable.

*Surface model: **Extend** (config) · **Call** (Messages API) · **Embed** (Agent SDK). Spine: **See → Save → Secure → Verify → Systematize**.*
