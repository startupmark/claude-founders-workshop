# Facilitator guide

This guide is for whoever delivers the workshop. It covers setup, timing, what to do in each part, and what tends to go wrong. It does not repeat the step-by-step commands; those are in the [participant guide](participant-guide.md), which you should read first so you know exactly what attendees run.

## How to frame it

Set the stance before Part 1. Founders keep up with every new trick and still cannot answer the basic questions about cost, blast radius, and whether the model is helping. That gap is the point of the session. Say it once at the top and return to it at the end. Using Claude is the easy part. Operating it is the skill, and it is the part that does not expire when the model changes next week.

## Set up four things before you start

Most failures come from one of four things not being ready. Check all four, for every attendee, before the first exercise:

1. **Keys.** Give each attendee an API key with a small amount of credits, set up ahead of time, and test each one (a single `npm run cache-probe` confirms it works). Keep a few spares. Set the spend cap high enough that nobody runs out partway through.
2. **Docker, or not.** Docker is the most common thing to break. Default everyone to the Grafana Cloud dashboard in Part 1, which needs no Docker. Use the local Docker path only if you have confirmed it runs and the images are already pulled.
3. **History.** Part 1 reads each attendee's own Claude Code history. Anyone without about two weeks of it uses the synthetic history in `fixtures/claude-history/`. Know that path.
4. **Repo.** Parts 4 and 5 need real code with tests. Anyone whose repo does not fit uses `acme-community`. Sort out who is on their own repo and who is on the fallback before you begin.

When all four are true for everyone, the rest is teaching. If one is not, fix it before moving on, because an attendee who is half set up falls further behind in every part.

## The thing to get right

Hooks, subagents, and telemetry fail without warning. Nothing throws an error; the feature just does not run, and the attendee thinks it worked. This is the most common way the workshop goes wrong. Every part includes a step where you make the thing run in front of everyone: the guardrail blocks, the cache flips from cold to warm, the verifier's test goes red. Do not skip that step to save time. Watching it work is the only proof that it does.

## Timing

Run it in 60 minutes, or 90 with the red-team and the scoreboard. Parts 2 and 5 take the longest. Part 1 runs long if Docker is involved, which is another reason to default to Grafana Cloud. Set a time limit for each part and move on when you hit it, even if a few people are still finishing. One slow part shortens every part after it.

Each part should leave an attendee with three things: a merged pull request to their fork, a screenshot of the number that changed, and (for Parts 1, 3, and 4) a task added to their golden set for Part 5.

## What to do in each part

The participant guide has the commands. Here is what to show live and what tends to break.

**Part 1, See.** Have everyone run `ccusage` against their own history at the same time. The numbers are usually uncomfortable; let people look before you explain. Then set up one dashboard live so they watch the accept/reject rate appear. Use Grafana Cloud unless you have confirmed Docker works. Make the point that this was all configuration, with no code that calls Claude. To set up Part 2, tell them half the cost problem is one bug in how the prompt is ordered. What tends to break: a blank dashboard (telemetry in the wrong settings file, or no restart), and an empty `ccusage` table (history cleared; switch to the synthetic set).

**Part 2, Save.** Show the volatile prefix on their own Part 1 numbers, then run the cache probe live and have everyone watch the cold call flip to a warm cache read. This is their first direct API call, so point that out. To set up Part 3, note that it is now cheap enough to run unattended, and that an unattended agent has deleted a production database before. What tends to break: both reads come back zero (the prefix is below the cache minimum, or it changes between calls), which is worth showing as its own lesson.

**Part 3, Secure.** Tell a real story of an agent deleting production, then ask what currently stops theirs from doing the same. Build the guards, then run the prove-it step before any red-teaming. In the 90-minute version, the red-team goes here: attendees try to make their own agent do something destructive, in a throwaway sandbox directory only, and you count what the guards caught. Make the point that rules which must be reliable belong in code, not in model judgment. What tends to break: a hook silently not firing (wrong path or name), which is why the prove-it step matters most here.

**Part 4, Verify.** Start from the "almost right but not quite" number in the Stack Overflow survey. Run the scope check against an over-scope diff and show `in_scope` go false, then run the verifier and watch it write a failing test for the divide-by-zero. Show the fraction-of-a-cent cost of the scope call. What tends to break: scope-check run on a clean tree (it needs uncommitted changes), and the subagent failing to load without saying so.

**Part 5, Systematize.** This is the last and hardest part. Start with the ETH Zurich study: their config edits were guesses, and some made things worse. Run config B live against the pre-computed config-A baseline and show the verdict. Then show how the numbers move across iterations and explain why a single run can mislead. Close by pointing out that they have now used all three layers, Extend, Call, and Embed, and that a good setup is mostly knowing which one each job needs. What tends to break: a dirty tree (the harness refuses to run), and "native CLI binary not found" (an SDK binary problem; move that attendee to the cloud environment).

## The optional extras

Both of these turn 60 minutes into 90 minutes. Not needed for the core lesson, but to create more interactivity among participants.

The red-team is the Part 3 exercise: everyone tries to break their own setup, in a sandbox directory only, which you state clearly and often. It is memorable and it produces a count. The scoreboard is a shared leaderboard across the five numbers (highest cache-hit, most destructive actions caught, most near-misses found, and so on). It takes time, because you collect and show everyone's results, but people remember it.

## Platform differences

This was built and rehearsed on Windows with PowerShell. Most attendees will be on macOS or Linux. The participant guide gives commands in bash with PowerShell where it matters, but be ready to translate an environment-variable line on the spot.

Two Windows-specific notes, in case you demo on Windows:

- The scope check used to print a `libuv` assertion about `async.c` after its JSON on Windows. It is fixed now, but on an older checkout it is harmless: the JSON verdict prints first and is correct.
- Once the Part 3 hooks are active, they read the whole command string of every Bash call, including yours. A trigger word like `reset-db` in a command, even inside an `echo` label, blocks your own call. That is the guard doing its job. Put trigger words in a file when you demo, not on the command line.

## Versions

The Claude stack changes often, and a model ID or SDK shape from last month can return a 404 today. Dependencies and Node are pinned, and model IDs are in one file (`config/models.ts`). Re-test Parts 2, 4, and 5 the week you run the session, with your keys and the SDK version you will have on the day.

## FAQ

**How long does it take?** 60 minutes plain, 90 with the red-team and scoreboard. Parts 2 and 5 take the most time.

**An attendee's laptop blocks `npx`, Docker, or outbound calls.** Have a cloud environment (a Codespace or VM) ready and move them into it. Ask about locked-down machines in the pre-flight so you know in advance.

**How do I handle keys?** One per attendee, small credit, set up and tested in advance, with spares and high enough caps. Remind everyone to decline the key at the Claude Code prompt, so their interactive session stays on their subscription.

**Can I run it online?** Yes. Each part is a screen-share plus everyone running the same commands. The scoreboard works over a shared doc.

**Someone has no repo and no history.** `acme-community` and its synthetic history cover both.

## When something breaks

**Conference wifi stalls Docker image pulls.** Use Grafana Cloud, or pre-pull the images, or bring them on a drive. This is the main reason to avoid the local Docker path with a group.

**Several attendees have blank dashboards.** Almost always telemetry in the wrong settings file, or no restart after editing. Have them confirm `CLAUDE_CODE_ENABLE_TELEMETRY=1` in the file they loaded, restart, and wait a minute.

**The eval is too slow or expensive for a group.** Keep the golden set at three to five tasks, cap the iterations, and use the pre-computed baseline so attendees only run the variant. Do not let anyone run config A live.

**A part broke and used up the time.** Use the fallback (Grafana Cloud for Part 1, the cloud environment for Part 5) and move on at your time limit. A part shown on your screen is better than a part everyone is stuck on.

**Everything seemed to work but you are not sure.** Then it probably did not. Go back to the prove-it step for that part and make it run in front of you.
