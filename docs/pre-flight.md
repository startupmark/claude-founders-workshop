# Pre-flight checklist

Run this before the session, not during it. Almost every workshop that stumbles does so for the same reason: someone shows up with a laptop that can't do one of the things the first exercise needs, and everyone waits while they fix it.

If you're facilitating, send this to attendees a few days ahead and ask them to reply once they've cleared the setup check at the bottom.

## What this workshop assumes

This workshop is Claude-stack-specific. You'll be configuring Claude Code and making calls to the Anthropic API. If you only use Cursor or Copilot, you can follow the concepts, but the exact `.claude/` mechanics and the API snippets won't run as written. Worth knowing before you arrive, so nobody feels misled.

You'll get the most out of it if you bring your own repo (see the README's "Using your own repo"). If yours isn't a fit, you fork `acme-community` and build against that. Either way works.

## What you need

- **Claude Code, installed and used for a couple of weeks.** Part 1 opens by reading your own usage history off disk. A fresh install has no history, so the hook falls flat. No history yet? The repo ships a synthetic 30-day history in `fixtures/claude-history/` that you can point the tools at instead, so you can still follow along.
- **A repo with a test suite** if you're going the bring-your-own route. Parts 4 and 5 run tests and graded tasks against real code. No suitable repo? Use `acme-community`; it has a hermetic vitest suite ready to go.
- **Node 20 or newer.** Built and pinned on Node 24. Check with `node --version`.
- **git** and a GitHub account (you'll fork the repo).
- **Docker**, but only for one optional path in Part 1 (the local dashboard). There's a hosted, no-Docker path and a no-dashboard fallback, so don't sweat this one if Docker fights your machine.
- **An Anthropic API key** for Parts 2, 4, and 5. If you're attending an organized session, the facilitator usually provides one pre-loaded with a small credit. Otherwise, make one at console.anthropic.com under API keys.

## The five-minute setup check

Clone the repo, switch to the `start` branch, and confirm the gate is green. If these four commands pass, you're ready.

```bash
git clone https://github.com/<your-username>/claude-founders-workshop.git
cd claude-founders-workshop
git checkout start
npm install
npm run ci        # lint -> typecheck -> test
node --version    # expect v20 or newer
```

You should see `npm run ci` finish with the test suite passing and no lint or type errors. If it does, the app and its toolchain work on your machine.

Then confirm `ccusage` can read your history, since Part 1 leans on it:

```bash
npx ccusage@latest daily
```

You should see a table of daily token and cost figures. If it's empty, your Claude Code history is somewhere non-standard or has been cleared. That's fine for the session: Part 1 has you point it at the bundled synthetic history instead.

## Your API key, and the billing trap

Claude Code's auth prefers an `ANTHROPIC_API_KEY` in your environment over your subscription. If the key is set and you approve it when Claude Code prompts at startup, your entire interactive coding session bills against pay-as-you-go API credits, not your plan. The interactive session is the expensive part, far more than the few cents the workshop scripts spend.

What you want: the key sits in your environment so the Part 2, 4, and 5 scripts can read it, but your Claude Code session stays on your subscription. So set the key, and **decline** it when Claude Code asks at launch. Run `/status` inside Claude Code to confirm the session is on your subscription, not the API.

Set the key for the scripts:

```bash
# macOS / Linux (bash or zsh)
export ANTHROPIC_API_KEY="sk-ant-..."
```

```powershell
# Windows (PowerShell) - sets it for the current terminal only
$env:ANTHROPIC_API_KEY = "sk-ant-..."
```

To confirm it's set without printing the secret:

```bash
# macOS / Linux
[ -n "$ANTHROPIC_API_KEY" ] && echo "key is set"
```

```powershell
# Windows (PowerShell)
[bool]$env:ANTHROPIC_API_KEY
```

Never paste the key into a tracked file or into a chat. The repo's secret-scan hook (Part 3) blocks staged keys, but the workshop scripts read the environment variable directly, so the env var is the right home for it.

## Platform notes

The workshop was built and rehearsed on Windows with PowerShell, but most attendees are on macOS or Linux. Throughout the guides, commands are shown in bash/zsh form, with a PowerShell version where the difference actually matters. The translations you'll need most:

- Setting an environment variable for one command: bash uses `VAR=value command`; PowerShell needs `$env:VAR = "value"` on its own line first, then the command.
- Temp directories: `/tmp` on macOS/Linux; on Windows use `$env:TEMP` or any folder you can write to.
- Home-directory paths: `~/.claude` on macOS/Linux; `$HOME\.claude` (or `%USERPROFILE%\.claude`) on Windows.

## If your laptop is locked down

Corporate machines sometimes block `npx`, Docker, or outbound API calls. If you suspect yours does, flag it to the facilitator ahead of time. The usual fallback is a prepared cloud environment (a Codespace or VM) where everything runs without fighting local policy. Sorting this out before the session is far better than discovering it mid-exercise.

## You're ready when

- `npm run ci` passes on the `start` branch.
- `npx ccusage@latest daily` prints a table (yours or, failing that, you know to use the bundled history).
- Your API key is set in your environment and you know to decline it at the Claude Code prompt.
