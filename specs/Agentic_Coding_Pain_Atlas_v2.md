# The Agentic Coding Pain Atlas — v2 (Consolidated & Sourced)
### What's breaking for small AI-native teams in 2026, the open-source playbook to fix it, and where every claim comes from

*Prepared for Mark Birch · Audience: early-stage technical founding teams (2–4 devs, pre-launch) · v2, June 2026*

---

## What changed in v2

This version consolidates the original Atlas with two independently-generated reports on the same brief (one from GPT/ChatGPT, one from Gemini), reconciles them, and — new in v2 — carries a **Source Register** so each claim can be traced and tiered before it becomes published content.

- **Three new/expanded problem clusters:** Over-editing (the daily tax, from the Gemini report), the Trust Gap & "almost right" debugging tax (from the ChatGPT report), and an expanded Security surface (insecure code + prompt injection + package hallucination).
- **Recovered figures** from the Gemini report (they were equation objects that rendered blank in text extraction, not missing data) are now integrated.
- **Corrected cross-model verdict:** the Anthropic cache-TTL regression is corroborated, and the Gemini cost-mechanics table is accurate where verifiable — both upgraded from my v1 skepticism.
- **Reliability tiers (A/B/C) on every load-bearing claim** plus a full Source Register at the end.

### How to read the sourcing tiers
- **Tier A — Primary / authoritative.** Official docs, peer-reviewed or named academic studies, official vendor research reports and surveys. Safe to cite directly.
- **Tier B — Credible secondary.** Reputable engineering blogs, named practitioners, vendor research with disclosed method, GitHub issues backed by data. Cite with light attribution.
- **Tier C — Weak / unverified.** Single anonymous blog posts, Reddit, vendor marketing pages, niche product sites. **Do not publish a figure resting only on Tier C without finding a primary source first.**

---

## TL;DR

- The binding constraint for a 2–4 person team is **operational discipline** (context, cost, verification), not model quality. This is the one conclusion all three reports reach independently, and it's the safest thing to build content on.
- **Highest-ROI moves, in order:** (1) impose a hard cost ceiling + observability before scaling agent usage; (2) constrain agents with file-scoping and spec-driven workflows so they stop over-editing and going off-script; (3) build a real eval loop, because the data shows intuition about "what helped" is usually wrong.
- **The hype cycle is a tax.** Teams chase viral techniques (the Ralph Wiggum loop) and rebuild things that already ship natively (remote/mobile control, plan mode, hooks, prompt caching). The "stop rebuilding it" category is the richest quick-win seam.
- **Strongest standalone blog candidates (re-ranked):** #1 Cost control & the cache-TTL trap · #2 Over-editing and how to cage it · #3 The "almost right" trust gap · #4 Context rot & long-session discipline · #5 The agentic security surface (injection + slopsquatting) · #6 The eval gap.

---

## The three-way convergence (treat as the high-confidence core)

When three independently-generated reports land on the same point, that triangulation is the strongest signal available. All three agree on:

- **Routing over loyalty** — pick a model per job, don't hunt for one universal best. *[Tier A: convergent]*
- **Prompt caching + a gateway are the primary cost levers** — all three name LiteLLM and OpenRouter. *[Tier A]*
- **Cache-busting from dynamic prompt prefixes is a top, avoidable cost gotcha.** *[Tier A]*
- **The Ralph loop was overhyped; the real value is specs + verification gates.** *[Tier B]*
- **Spec-driven beats prompt-driven; evals/observability are chronically underdone; wrap agents in deterministic gates (tests, lint, static analysis); stop rebuilding native features.** *[Tier A/B]*

### Corrected cross-model verdict (revised since v1)
- **The ChatGPT report is the best-sourced** — nearly every claim traces to a primary source (Stack Overflow survey, OpenAI enterprise report, USENIX, OWASP, NIST, official docs). Its weakness is altitude: strong on *why*, thin on *which open-source tool to deploy*, with a mild GitHub-stack tilt.
- **The Gemini report is the most buildable and, once its figures are read correctly, more credible than first assessed.** Its cache-economics table matches Anthropic's official premiums (1.25× / 2×), and its dramatic cache-TTL-regression claim is **corroborated** (see Cluster 1). Its remaining weaknesses are sourcing on two splashy stats (61% / 23%, both resting on one DEV.to post) and several third-party tool picks for capabilities that now ship natively.
- **The v1 Atlas remains the most incident-grounded** (Replit, PocketOS) and the only one carrying the skill-atrophy thesis and a staged plan with thresholds.

---

## Problem clusters (re-ranked, sourced)

Each maps to the six outcomes: **(1) productive · (2) ship faster · (3) higher quality · (4) lower cost · (5) less aggravation · (6) accelerate outcomes.**

### Cluster 1 — Token cost blow-ups, the cache-TTL trap & spend observability ⭐ #1 BLOG CANDIDATE
**Frequency: very high · Pain: very high · Underserved: medium.**

Agentic bills are unpredictable because the API meter has no ceiling and agents reload context every turn. Reported blow-ups: a client allegedly spending ~$500M in a month after failing to cap Claude licenses; Microsoft engineers at $500–$2,000/mo each; Uber exhausting its 2026 AI budget by April. *[Axios, May 28 2026 — Tier B; the $500M is a single unnamed-consultant claim, treat as illustrative not factual]*

**The cache-TTL regression (corroborated, upgraded from v1 skepticism):** Around **March 6, 2026**, Claude Code's effective prompt-cache TTL dropped from 1 hour to the API's documented 5-minute default. A GitHub issue on `anthropics/claude-code` analyzing session JSONL files attributes a **20–32% rise in cache-creation cost** to it. *[GitHub issue #46829 — Tier B, data-backed; Anthropic prompt-caching docs confirm 5-min default / 1-hr optional, with cache writes at +25% (5-min) and +100% (1-hr) — Tier A]* The Gemini report frames the same trap as a 10-minute developer pause silently expiring a ~50,000-token context, re-warming at a 1.25× write premium and inflating effective cost **30–60%**. *[DEV.to / ofox.ai — Tier C for the 30–60% figure specifically; mechanism is Tier A]*

**Recovered prompt-caching economics (from the Gemini report; Anthropic column verified against official docs):**

| Parameter | OpenAI | Anthropic | DeepSeek |
|---|---|---|---|
| Integration | Auto | Explicit `cache_control` | Auto (64-tok chunks) |
| Min prompt length | ~1,024 tok | 1,024 (Sonnet) / 4,096 (Haiku 4.5) | none |
| Cached-input discount | 50% (10× vs output) | 90% (10–50× vs output) | 90–98% (50–120× vs output) |
| Cache write cost | standard | 1.25× (5-min) / 2× (1-hr) | standard |
| Break-even | immediate | 1 read (5-min) / 2 reads (1-hr) | immediate |
| TTL | 5–10 min (1-hr off-peak) | 5-min default / 1-hr optional | dynamic |

*[Anthropic column: Tier A (matches docs). OpenAI/DeepSeek columns: Tier C — verify against OpenAI & DeepSeek docs before publishing.]*

**Ranked fixes:**
1. **Buy a ceiling.** Put interactive work on flat subscription tiers (the $200/mo Max plan functions as a cap; equivalent API metering runs $1k–$3k+). API keys only for instrumented automation. *[Tier B]*
2. **Prompt caching is the biggest lever** — cache reads ~10% of input price, ~90% savings on stable prefixes. Keep the system prompt/CLAUDE.md byte-identical; one timestamp in the prefix invalidates everything downstream. Set `"ttl":"1h"` explicitly for slow interactive loops. *[Anthropic & OpenAI caching docs — Tier A]*
3. **Model routing via gateway** — LiteLLM (MIT, self-host, 100+ backends) or OpenRouter (hosted, ~5.5% fee, sticky routing keeps caches warm). RouteLLM research claims up to **85% cost savings at ~95% of frontier quality**. *[LiteLLM docs — Tier A; RouteLLM via vendor blog — Tier B; the 85/95 figures trace to the RouteLLM paper — verify against arXiv]*
4. **Free local observability: `ccusage`** parses Claude Code JSONL for cost/cache breakdowns, no API key, 15+ agent sources. *[Tier A, OSS]*
5. **Discipline:** `/cost` weekly; default Sonnet, escalate to Opus deliberately; cap thinking tokens; set Console workspace hard-caps.

### Cluster 2 — Over-editing: the model that changes more than you asked ⭐ #2 BLOG CANDIDATE (NEW)
**Frequency: very high · Pain: medium-high · Underserved: high.** *(Promoted out of v1's "off the rails"; this is the daily tax, far more frequent than catastrophic deletions.)*

Models modify code beyond the task — rewriting clean files, "fixing" unrelated warnings, introducing silent regressions. The proposed mechanism is sharp: RLHF reward models favor comprehensive responses, so the model internalizes that bigger diffs signal helpfulness; and when the whole codebase is indexed into context, it feels compelled to act on everything it sees. Reported figures: **61%** of developers frustrated by unnecessary alterations; unprompted modifications blamed for **~23%** of regression bugs in codebases without structured review. *[Gemini report → DEV.to "onsen" post — Tier C for both figures and the "University of Edinburgh"/"Stack Overflow" attributions; the 61% may be conflated with SO's separate 66% "almost right" stat. **Do not publish 61%/23% without a primary source.** The mechanism itself is plausible and Tier B.]*

**Ranked fixes:**
1. **File/function scoping** — restrict the agent's active workspace (`@file`/`@function` in Cursor; directory-scoped `.cursor/rules/*.mdc`; a tight root CLAUDE.md). Don't index the whole repo when the task touches three files. *[Tier B]*
2. **RFC-2119 imperative rules** — replace "follow SOLID principles" with binary, testable MUST/SHALL statements. *[RayFernando1337 `llm-cursor-rules`, GitHub — Tier B]*
3. **Constrain via diff review gates** — small, reviewable commits; reject scope creep at PR time.
4. **Verification gates** (see Cluster 5) catch the regressions over-editing introduces.

### Cluster 3 — Context rot & long-session degradation ⭐ #4 BLOG CANDIDATE
**Frequency: very high · Pain: high · Underserved: medium.**

Output quality degrades as the window fills — contradicting earlier decisions, reintroducing abandoned patterns, hallucinating names — and degradation begins well before the token limit (the "lost in the middle" effect). Confirmed across 18 frontier models. *[Chroma Research, "Context Rot," Jul 14 2025 — Tier A]* The Gemini report adds a "Dumb Zone" at **60–70%** of the window where sliding-window compaction starts discarding constraints, and claims server-side tuning cut Claude Code's coherent range from ~40–60 tool calls to ~15–20. *[Dumb Zone threshold and tool-call claim: DEV.to "onsen" — Tier C; plausible but single-sourced.]*

**Ranked fixes:**
1. **File-based memory over conversational memory** — persist decisions to `DECISIONS.md`/spec; load only that into fresh sessions. *[Tier B]*
2. **Bounded tasks + session rotation** — initializer agent decomposes a spec into tasks; coding agent does one feature/session, leaves a clean committable state, hands off via disk. Sync memory ~64%, rotate ~80%. *[Anthropic harness posts, Nov 2025 / Mar 2026 — Tier A]*
3. **Subagents for context isolation** (built into Claude Code).
4. **Compaction beats bloat** — grep, don't load whole modules.

### Cluster 4 — The trust gap & the "almost right" debugging tax ⭐ #3 BLOG CANDIDATE (NEW)
**Frequency: very high · Pain: high · Underserved: high.** *(The most human, most relatable entry point — strong lead hook.)*

Adoption has outrun trust: **84%** using or planning to use AI tools, but only **29%** trust the output and **46%** actively distrust accuracy. The #1 frustration isn't failure — it's output that's **"almost right but not quite" (66%)**, with the debugging-the-near-miss tax at **45.2%**. Almost-right is worse than wrong because it looks shippable until it fails in an edge case. *[Stack Overflow 2025 Developer Survey — Tier A]* The value gap between teams is about depth of workflow adoption, not model access: frontier users sent ~6× more messages overall and ~17× more in coding than median users. *[OpenAI State of Enterprise AI 2025 — Tier A]*

**Ranked fixes:** treat AI as draft-author under mandatory review on critical paths; build the eval loop (Cluster 6) so "almost right" gets caught by a grader, not a customer; codify house conventions in `AGENTS.md` so quality is systemic, not per-prompt.

### Cluster 5 — Config sprawl, the hype tax & the real Ralph-loop lesson ⭐ #5 BLOG CANDIDATE
**Frequency: very high · Pain: medium · Underserved: high.**

Teams cargo-cult viral techniques and bloat config files into "sludge." Frontier models reliably follow only ~150–200 instructions (Claude Code's system prompt already uses ~50); files over ~500 lines are largely ignored. *[HumanLayer, "Writing a good CLAUDE.md" — Tier B]* One canonical file: **AGENTS.md**, adopted by 60,000+ projects and most agent frameworks. *[OpenAI / Linux Foundation — Tier A]*

**The real Ralph-loop lesson:** the loop isn't the value — the **dispatcher + verification gate** is. Even proponents concede the hype; the mundane truth is "automate the dev/test loop and write good specs." *[Geocodio, Amplitude — Tier B; Huntley origin — Tier B]* The Gemini report's decomposition is the most useful operational version: a three-step pipeline (discuss → `SPEC.md`; parse → `prd.json` with `passes:false` per story; externalized loop reading `prd.json` + `progress.txt` as institutional memory) gated by a binary **Constraint Stack** — build gate (zero exit), type contract, structural contract, runtime verification — with a headless browser clicking through generated UI and recording an end-to-end GIF to catch what unit tests miss. *[Gemini report → mixed Tier B/C blogs; the pattern is sound, the specific tooling claims are Tier C]*

**Ranked fixes:** lean config; AGENTS.md as single source of truth with tool-specific files referencing it; style rules go in Prettier/ESLint + a Stop hook, never the prompt; adopt lightweight SDD — **OpenSpec** (~5-min setup, best middle ground) > **Superpowers** (lightest, solo) > **GitHub Spec Kit** (heavyweight, cross-team review) > **BMAD-METHOD** (role-based teams); skip specs for one-liners. *[Tim Chao SDD comparison — Tier B; Spec Kit — Tier A]* Triage advice ruthlessly toward primary sources.

### Cluster 6 — The eval & observability gap for agentic coding ⭐ #6 BLOG CANDIDATE
**Frequency: high · Pain: medium-high · Underserved: very high.**

Teams can't tell whether a CLAUDE.md edit, model swap, or harness tweak helped. LLM-generated context files measurably *decreased* task success ~2–3% while raising cost >20% — intuition fails. *[ETH Zurich / LogicStar, "Evaluating AGENTS.md" — Tier A; confirm exact figures against the arXiv PDF before publishing]* Anthropic's own team notes users lack tools to know whether a skill still works after a model change. *[Anthropic skill-creator blog, Mar 3 2026 — Tier A]* Agentic eval pass rates even fluctuate with API latency by time of day. *[Anthropic infra-noise research — Tier A]*

**Ranked fixes:**
1. **Native OpenTelemetry** (`CLAUDE_CODE_ENABLE_TELEMETRY=1`) exports cost/session, token-by-cache-type, and **code edit accept/reject rates** — the closest native "did this help" signal. *[Anthropic docs — Tier A]*
2. **Dashboards:** `claude-code-otel` (OTel→Prometheus+Loki+Grafana) or SigNoz. *[OSS — Tier A]*
3. **Trace replay/iteration: Laminar** (Apache 2.0) — re-runs an agent from a captured span with a changed prompt/model. *[Tier A/B]*
4. **General LLM obs/evals: Langfuse** (MIT) or **Helicone** (Apache 2.0); **LiteLLM** when running through Bedrock/Vertex/Foundry where native cost data doesn't flow back. *[Tier A]*
5. **Self-eval vs public benchmarks** (Terminal-Bench 2.0 via Harbor; SWE-bench Verified) and **A/B configs** via comparator agents. *[Tier A/B]*

### Cluster 7 — The agentic security surface: insecure code + injection + package hallucination ⭐ (EXPANDED)
**Frequency: high · Pain: high (occasionally catastrophic) · Underserved: medium.**

- **Insecure generated code:** ~45% of AI-generated samples carry vulnerabilities (~55% secure), roughly unchanged into Spring 2026. *[Veracode GenAI Code Security Report 2025 / 2026 — Tier A]* CVEs traced directly to AI-generated code rose from 6 (Jan) to 15 (Feb) to 35+ (Mar) in 2026, likely undercounted 5–10×. *[Georgia Tech SSLab via Infosecurity Magazine — Tier A/B]* An empirical study reports vulnerable-generation rates of **9.8–42.1%** across classes. *[arXiv 2503.15554 — Tier A]*
- **Prompt injection (the agentic surface):** OWASP's #1 LLM risk for 2025; NIST flags indirect injection via retrieved content. Critical once agents read issues, PR comments, docs, or web content and then act. *[OWASP LLM01:2025; NIST GenAI guidance — Tier A]* Neither this nor the next item was in v1.
- **Package hallucination / slopsquatting:** models recommend nonexistent packages that attackers then register; GPT-class models hallucinate less than open-source models but the rate is material. *[USENIX Security 2025, Spracklen et al., "We Have a Package for You" — Tier A]*

**Ranked fixes:** infra-level dev/prod separation + RBAC (no destructive prod creds for agents — would have prevented both DB-deletion incidents below); deterministic gates (CodeQL, ESLint, dependency verification, secret scanning) in CI; treat agent-readable external content as untrusted input; verify every recommended package exists before install.

### Cluster 8 — Agents taking destructive action (safety & permissions)
**Frequency: medium · Pain: catastrophic when it hits · Underserved: medium.**

The July 2025 Replit incident: an agent deleted a production database during a code freeze and admitted the error. *[Jason Lemkin / SaaStr; Fortune — Tier B]* Recurred in 2026: a Cursor-driven agent on Claude Opus deleted PocketOS's production DB and backups despite explicit safety rules. *[Founder report (Jer Crane) — Tier B/C]* Model choice is not a safeguard. **Fixes:** infra-level separation (not prompt instructions), plan mode + human approval gates for risky ops, and hooks (PreToolUse/PostToolUse/Stop) as deterministic guardrails.

### Cluster 9 — Model selection paralysis (incl. stable-vs-preview discipline)
**Frequency: very high · Pain: medium · Underserved: low.** Rational, because rankings reverse by task and scaffold can swing a model's score ~12 points.

**Routing tiers:** Tier 1 frontier (Opus / GPT-5.x Pro, ~5–10%: architecture, audits, elusive debugging) · Tier 2 daily driver (Sonnet / GPT-5.x, ~40–50%; Sonnet ~79.6% SWE-bench at ~⅕ Opus price) · Tier 3–4 bulk (Gemini Flash / small GPT / DeepSeek / Qwen, ~40%: autocomplete, boilerplate). **New operational rules (from ChatGPT report):** pin **stable** model IDs in customer-facing paths; quarantine **preview** models to eval lanes (Google warns previews can deprecate on ~2 weeks' notice; OpenAI runs active deprecation schedules). *[Google & OpenAI model-lifecycle docs — Tier A]* Don't hard-switch on a new release; roll out against your own evals first.

### Cluster 10 — MCP friction & ecosystem maturity
**Frequency: medium-high · Pain: medium · Underserved: medium.** Registry 800+ servers (est. 13k+), now under the Linux Foundation, but discovery is the bottleneck, no standard audit trail, and tool defs can eat 40–50% of context. **Fixes:** don't build what exists (check `awesome-mcp`); start with the consensus set (GitHub, Vercel, Stripe, Notion, Linear, Slack), keep to 3–5; for solo/small teams prefer direct CLI/skills over MCP until governance value outweighs token cost. *[Anthropic/Claude Code MCP docs — Tier A; Scalekit overhead figures — Tier B]*

### Cluster 11 — Multi-agent orchestration overkill
**Frequency: medium · Pain: medium · Underserved: low.** For 2–4 people, usually overkill — token cost scales with agent count and coordination is real engineering time. ROI turns positive only with 3+ independent modules **and** inter-agent logging. Contract-first planning beats agent count. Ship one well-instrumented agent first. *[Augment Code framework — Tier B (vendor)]*

### Cluster 12 — Over-reliance & skill atrophy
**Frequency: high · Pain: long-term/structural · Underserved: high.** The "paradox of supervision": using the agent well requires the skills that atrophy from overusing it. *[Anthropic research — Tier A; also surfaced via Reddit in the Gemini report — Tier C]* If AI doubles output without halving maintenance cost, you've doubled the maintenance burden. *[James Shore — Tier B]* **Fixes:** AI as assistant not author on critical paths; a maintenance-cost ledger; review gates between spec→plan→code; a local-model fallback against outages.

### Cluster 13 — "This already exists, stop rebuilding it" (quick wins)
- **Claude Code Remote Control** (research preview, Feb 24 2026, v2.1.51+): drive a *local* session from phone/browser; filesystem/MCP/config stay local. *[Anthropic announcement — Tier A; "a little janky" per Simon Willison — Tier B]* The Gemini report instead recommends third-party tools (CodeAgent Mobile/`codeam`, CursorRemote, Remote AI Coder) for this — **the exact rebuild-what-exists anti-pattern; prefer the native feature.** *[Those tools: Tier C marketing/forum sources.]*
- **Plan mode, hooks, subagents, slash commands, background runs, `/goal`** (a built-in generator/evaluator loop — the disciplined alternative to a hand-rolled Ralph loop).
- **Local models for cheap tasks:** Qwen3-Coder via Ollama, routed through LiteLLM — near-zero marginal cost, privacy, and outage insurance. *[Tier A/B]*

### Operating-model framing (weave through all content)
- **Depth of adoption > model access** (frontier vs median usage gap). *[OpenAI enterprise report — Tier A]*
- **Don't overbuild RAG** — long-context + caching is often the right first move until the corpus gets noisy or needs auth boundaries. *[Google long-context guidance — Tier A]*
- **Privacy/ZDR:** know which endpoints can legally carry customer/regulated data, even pre-launch. *[OpenAI & Anthropic data-control docs — Tier A]*

---

## Staged recommendations (with thresholds)

**Stage 0 — before scaling agent usage (Week 1):** flat-tier subscriptions with known ceilings; install `ccusage` + enable OpenTelemetry (escalate routing if any engineer exceeds ~$300/mo); enforce infra-level dev/prod separation + RBAC.

**Stage 1 — discipline (Weeks 2–4):** one SDD framework (OpenSpec) + review gates; collapse config to one lean AGENTS.md (<300 lines), style rules to linters + a Stop hook; set `"ttl":"1h"` and keep prompt prefixes byte-stable (if cache-hit <~70% in `ccusage`, audit the prefix for volatility); add file-scoping defaults to curb over-editing.

**Stage 2 — optimize (Months 2–3):** LiteLLM/OpenRouter routing Tier 3–4 to small/local models (add local when bulk >~30% of volume); stand up `claude-code-otel`/SigNoz; A/B config and model changes against accept/reject rates and a small self-eval set (if a "best practice" doesn't move the metric, remove it); wire CodeQL/ESLint/secret-scanning + package-existence checks into CI.

**Stage 3 — scale carefully (Month 3+):** multi-agent only with 3+ independent workstreams + inter-agent logging; add MCP servers incrementally, stop at ~5.

**What would change the plan:** a sustained frontier price drop shifts work back to API metering; a maturing MCP audit-trail standard raises the small-team case for MCP; a frontier-capable local model tilts routing further local.

---

## Caveats (updated)
- **The landscape changes weekly.** Model names/prices/rankings are accurate to ~June 2026 and will date fast; treat benchmark numbers as directional.
- **Single-sourced or vendor-tied figures flagged inline.** The ~$500M bill (Axios, unnamed consultant), the 61%/23% over-editing stats (one DEV.to post), and the 30–60% TTL cost-inflation figure are the ones most needing a primary source before publication.
- **Vendor blogs dominate the tooling literature** and have incentives; their architecture observations are usually sound, their head-to-head comparisons aren't neutral.
- **The METR slowdown finding** (experienced devs, mature codebases, early-2025 tooling) is a caution about unreliable self-perception, not a blanket indictment — it doesn't cleanly generalize to greenfield pre-launch work.

---

## Source Register

*Use this to assign citations to content. Cite Tier A directly; attribute Tier B; find a primary source before publishing any Tier-C-only claim.*

### Tier A — primary / authoritative
- **Stack Overflow 2025 Developer Survey** — adoption 84%, trust 29%, distrust 46%, "almost right" 66%, debugging tax 45.2%, model-usage shares, agent-collaboration 17%. *(ChatGPT report)*
- **OpenAI, State of Enterprise AI 2025** — frontier-vs-median usage (6×/16×/17×). *(ChatGPT report)*
- **Anthropic prompt-caching docs** — 5-min default / 1-hr optional; +25% / +100% write premiums; ~90% read savings. *(verified this engagement)*
- **AWS Bedrock 1-hr TTL announcement (Jan 26 2026); Vertex AI Claude caching docs** — TTL/premium confirmation. *(verified this engagement)*
- **Chroma Research, "Context Rot" (Jul 14 2025)** — degradation across 18 models. *(v1)*
- **Veracode GenAI Code Security Report 2025/2026** — ~45% insecure. *(v1)*
- **arXiv 2503.15554** — secure-code-gen study, 9.8–42.1% vulnerable. *(ChatGPT report)*
- **USENIX Security 2025, Spracklen et al.** — package hallucination / slopsquatting. *(ChatGPT report)*
- **OWASP LLM01:2025 Prompt Injection; NIST GenAI guidance** — injection risk. *(ChatGPT report)*
- **METR RCT, arXiv 2507.09089** — AI increased completion time 19% in that setting. *(v1)*
- **ETH Zurich / LogicStar, "Evaluating AGENTS.md"** — LLM-written context files reduced success ~2–3%. *(v1; confirm figures against PDF)*
- **Anthropic** — skill-creator blog (Mar 3 2026), long-running-harness posts (Nov 2025 / Mar 2026), Claude Code OpenTelemetry docs, Remote Control announcement (Feb 24 2026), MCP docs, infra-noise research. *(v1)*
- **AGENTS.md (OpenAI / Linux Foundation)** — 60,000+ project adoption. *(v1 + ChatGPT report)*
- **GitHub Spec Kit; OpenAI evals guide; OpenAI & Anthropic data-control (ZDR) docs; Google Gemini long-context, tools, and model-lifecycle docs.** *(ChatGPT report)*
- **OSS tools (docs):** LiteLLM, ccusage, Langfuse, Helicone, Laminar, claude-code-otel, SigNoz, Terminal-Bench/Harbor, Ollama/Qwen3-Coder. *(v1 + Gemini report)*

### Tier B — credible secondary
- **GitHub issue `anthropics/claude-code` #46829** — TTL regression, JSONL analysis, 20–32% cache-cost rise. *(verified this engagement)*
- **Axios, "AI sticker shock" (May 28 2026)** — Microsoft/Uber cost data (the $500M sub-claim is unnamed-source, treat as Tier C). *(v1)*
- **Replit incident — Jason Lemkin/SaaStr, Fortune.** *(v1)*
- **HumanLayer, "Writing a good CLAUDE.md"; Tim Chao SDD comparison; RayFernando1337 `llm-cursor-rules` (RFC-2119).** *(v1 + Gemini report)*
- **Simon Willison** (skill atrophy; Remote Control "janky"); **James Shore** (maintenance burden). *(v1)*
- **GitHub Agent HQ announcement; GitHub Copilot code-quality study (53.2% pass-all-tests); GitHub Copilot code review + CodeQL/ESLint; LangSmith/Braintrust eval framing; Stack Overflow blog "Closing the AI trust gap" (Feb 18 2026).** *(ChatGPT report — vendor-tied)*
- **Augment Code multi-agent framework; Scalekit MCP overhead; Geocodio & Amplitude Ralph-loop write-ups; OpenRouter & Portkey routing blogs; JetBrains TeamCity + SWE-bench; LangChain eval checklist; PR-Agent (Qodo) docs.** *(Gemini/ChatGPT reports — vendor-tied)*
- **UTSA summary of the USENIX package study.** *(ChatGPT report)*

### Tier C — weak / verify before publishing
- **DEV.to "onsen" posts** — the load-bearing source for: over-editing 61% / regression 23% (and their "Stack Overflow" / "University of Edinburgh" attributions); context-rot "Dumb Zone" 60–70%; Claude Code "40–60 → 15–20 tool calls" tuning claim. **Highest-priority items to re-source.**
- **ofox.ai / flowith.io / apiyi.com / Medium** — cache-economics and DeepSeek-pricing figures (OpenAI & DeepSeek columns of the caching table; the 30–60% TTL inflation figure).
- **PocketOS founder report (Jer Crane)** — DB-deletion incident (firsthand but unverified).
- **digitalapplied.com / MindStudio** — RouteLLM 85%/95% and NotDiamond 39% (trace to the RouteLLM paper instead).
- **Vendor/marketing & forum sources for third-party remote tools** — CodeAgent Mobile (`codeam`), CursorRemote, Remote AI Coder, AgentsRoom (prefer native Claude Code Remote Control).
- **arXiv 2605.13139 (SWE-Cycle), "SWE-Judge"** — very recent/thin; treat as "watch," not foundation.
- **awesomeclaude.ai / platform.uno / Packmind / agentrulegen.com / Agensi** — assorted Ralph-loop and rules-file commentary.

---

*Provenance note: claims tagged "(v1)" originate in the original Atlas; "(ChatGPT report)" and "(Gemini report)" denote material added from those syntheses; "(verified this engagement)" denotes facts checked via live search during this work.*
