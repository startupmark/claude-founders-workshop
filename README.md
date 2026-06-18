# acme-community

Ask a founder what their last feature cost in tokens, or whether the model is actually earning its keep, and most can't answer. Not for lack of caring. Nothing on their screen shows them, so the question never gets asked.

That gap is the whole point of this workshop. The Stack Overflow 2025 survey found that the top frustration with AI coding tools isn't outright failure, it's output that's "almost right but not quite" (66% of developers) -- the kind that looks shippable until it breaks on an edge case. Most teams are using Claude. Very few are operating it: watching the spend, capping the blast radius, catching the near-misses, and proving a config change actually helped instead of guessing.

This repo is the reference build for the **Claude Founders Workshop**, a hands-on, five-part series that takes a small team from using Claude Code to operating it. `acme-community` is the app you operate on: a plain members-and-events tracker, small enough to read in one sitting, real enough to have a test suite and a few bugs worth catching.

## Start here

This repo has two states, and which one you want depends on who you are.

- **Building the workshop?** Fork the repo, then check out the `start` branch. That's the near-empty starting point: the app, its tests, and a few planted problems, with none of the tooling built yet. You add the tooling, one part at a time.
- **Stuck, or just curious how it ends?** This `main` branch is the finished version. Treat it as the answer key. When a part fights you, diff your branch against `main` and see what you missed.

```bash
# 1. Fork on GitHub, then clone your fork
git clone https://github.com/<your-username>/claude-founders-workshop.git
cd claude-founders-workshop

# 2. Switch to the start branch -- what you build on
git checkout start

# 3. Install and confirm the gate is green
npm install
npm run ci          # lint -> typecheck -> test, the same sequence CI runs

# 4. Run the app
npm run dev         # http://localhost:3000
```

You need Node 20 or newer. It was built and pinned on Node 24, so if you use `nvm`, `nvm use` picks that up from `.nvmrc`. Parts 2, 4, and 5 also need an Anthropic API key (more on that below).

## What you build

Five parts, each one a single pull request to your fork. The order follows time-to-visible-win, so the first thing you do is look at a number that's probably uncomfortable.

| Part | Name | What you build | Surface |
|------|------|----------------|---------|
| 1 | See | Cost and usage visibility: `ccusage` against your own history, plus an OpenTelemetry dashboard | Extend |
| 2 | Save | Prompt caching that actually fires, proven in the raw API response, plus a prefix sentinel hook | Call |
| 3 | Secure | Deterministic guardrails: a destructive-op tripwire, a hallucinated-package guard, secret scanning | Extend |
| 4 | Verify | A cheap diff-scope scorer and a verifier subagent that writes adversarial tests | Call |
| 5 | Systematize | A headless A/B eval harness that measures whether a config change actually helped | Embed |

Three surfaces run underneath all of it, and the real skill the workshop teaches is knowing which one a job wants:

- **Extend** -- configure Claude Code (hooks, settings, subagents, telemetry) without writing code that calls Claude. This is where deterministic rules and observability live.
- **Call** -- a direct, stateless Messages API request for one narrow job, like scoring a diff. Cheap, bounded, no agent needed.
- **Embed** -- Claude as an agent inside your own program via the Agent SDK: headless runs, the full tool loop, orchestration.

By the end, your fork looks like this `main` branch: instrumented, guarded, self-checking, and able to grade its own setup.

## Using your own repo instead

`acme-community` is the safe default. It always works, it ships with the planted bugs each part needs, and it carries a ready-made set of eval tasks for Part 5. But the workshop has more impact when you run it against code you actually care about, and most of it works just as well on your own repo.

If you have a real repo with a test suite and a couple of weeks of Claude Code history, build every part against it instead. Part 1 (`ccusage` and the dashboard) reads your own usage, so it's better on your own machine anyway. The Part 3 guardrails and the Part 4 scope scorer are copy-in and run against any codebase. Two things you bring yourself: the verifier in Part 4 needs your repo to have tests, and the Part 5 eval needs a few golden tasks of your own -- which is rather the point, since the best ones come from the near-misses and destructive actions you catch in Parts 3 and 4.

What stays specific to `acme-community` is the planted fixtures. They exist so a guardrail or a verifier has something guaranteed to catch on the day. On your own repo, your real bugs play that role. The participant guide marks the bring-your-own path at each step where it differs.

## The app itself

`acme-community` tracks members and the events they attend: two tables, and three numbers on screen (total members, total events, average events per member). The data is synthetic.

Stack: Next.js (App Router) and TypeScript on Node 24, Drizzle ORM over better-sqlite3. Tests run on vitest and are hermetic -- each spins up an in-memory SQLite database and applies migrations itself, so there's nothing external to set up.

## Some code here is broken on purpose

A few things in this repo are buggy, messy, or unguarded by design. There's a divide-by-zero in `lib/stats.ts`, an unguarded database wipe in `scripts/reset-db.ts`, a clean helper in `lib/format.ts` left with a couple of nits, and a bloated config file. They're teaching fixtures: the workshop uses them to show a guardrail firing, a verifier catching a near-miss, or a bad config costing more for no gain.

Please don't open a pull request to fix them. Each one is marked with a comment that says, in so many words, leave it alone. If something looks broken and isn't marked, that one's probably a real bug, and a report is welcome.

## Docs

- [Participant guide](docs/participant-guide.md) -- the detailed walk-through of all five parts, with what you should see at each step, an FAQ, and troubleshooting. Start here if you're working through the workshop.
- [Facilitator guide](docs/facilitator-guide.md) -- run-of-show, timing, what to demo, and how to handle the setup problems that tend to break a live session.
- [Pre-flight checklist](docs/pre-flight.md) -- prerequisites and a five-minute setup check to run *before* the session. Most live failures trace back to skipping this.

## A word on cost

Parts 1 and 3 ride your existing Claude Code usage and cost nothing extra. Parts 2, 4, and 5 make real API calls and bill per token -- cents, not dollars, for the workshop's tasks.

One trap worth naming up front: if you set `ANTHROPIC_API_KEY` in your shell and then approve it when Claude Code asks, your entire interactive coding session bills against pay-as-you-go API credits instead of your subscription. The dev session is the expensive part. Keep the key in your environment for the scripts to read, but decline it when Claude Code prompts, so the session stays on your plan. The participant guide walks through this for each OS.

Setting the key:

```bash
# macOS / Linux
export ANTHROPIC_API_KEY="sk-ant-..."
```

```powershell
# Windows (PowerShell)
$env:ANTHROPIC_API_KEY = "sk-ant-..."
```

## Versions

The Claude stack ships roughly weekly, and last month's model ID or SDK shape can 404 today. Dependencies and Node are pinned to exact versions (see `package.json` and `.nvmrc`), and model IDs live in one place (`config/models.ts`) rather than scattered through the code. If you're running this more than a week or two after it was last touched, re-test the live parts before a session.

## License

MIT. See [LICENSE](LICENSE). Fork it, run it, change it.
