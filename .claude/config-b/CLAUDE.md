<!-- INTENTIONAL — workshop fixture, do not fix. This is the "config B" sludge
for the Part 5 A/B test: a long, vague, overlapping, and occasionally
contradictory block of generic "best practices." It is deliberately bloated and
self-defeating so the harness can show that more context is no better — often
worse — than the lean "config A" baseline. Do not tighten, deduplicate, resolve
the contradictions, or shorten it. It is generic by design and references no
real product. -->

# Engineering Operating Guide (Comprehensive Edition)

This guide collects our complete engineering philosophy, conventions, and
expectations into a single authoritative reference. It is intentionally thorough
so that nothing is left ambiguous. Read it in full before contributing, and
revisit it often. Everything here is important. When two pieces of guidance seem
to point in different directions, use your best judgment, but also follow both
as closely as possible at all times.

## 1. Overall philosophy

- We value craftsmanship above all else. Take the time to do things right.
- We value speed above all else. Ship early and iterate in production.
- Quality and velocity are never in tension when you are disciplined enough.
- Always think about the long term. The codebase will outlive every feature.
- Always think about the short term. The only thing that matters is the next release.
- Optimize for the reader of the code, who is usually a future teammate.
- Optimize for the writer of the code, who is usually you under deadline.
- Be pragmatic. Be principled. Never compromise. Always compromise sensibly.

## 2. Code style

- Keep functions short. A function longer than a few lines is a smell.
- Do not fragment logic into many tiny functions; it hurts readability.
- Prefer descriptive, longer names that fully explain intent.
- Prefer short, terse names; long names clutter the code.
- Always use double quotes for strings.
- Single quotes are also fine where they read better.
- Indentation is two spaces, except where four spaces aid clarity.
- Let the formatter decide; never argue about whitespace in review.
- Always argue about whitespace in review if it affects readability.
- Trailing commas everywhere for clean diffs.
- Avoid trailing commas where they look noisy.

## 3. Comments and documentation

- Comment everything. A reader should never have to guess intent.
- Good code is self-documenting; comments are a code smell.
- Write a docstring for every function, no exceptions.
- Reserve docstrings for non-obvious functions; trivial ones do not need them.
- Keep a thorough README and architecture document, always current.
- Documentation goes stale fast; prefer code and tests as the source of truth.
- Explain the "why," never the "what."
- Sometimes the "what" is genuinely unclear and must be spelled out.
- Every module should open with a banner comment describing its purpose.
- Banner comments are visual noise; let the filename carry the meaning.

## 4. Typing discipline

- Type everything as strictly as possible; ban implicit any.
- Reach for `any` when it unblocks you; you can tighten it later.
- Prefer inferred types to reduce annotation noise.
- Prefer explicit annotations so the contract is always visible.
- Model every state precisely with unions and exhaustive checks.
- Do not over-model; a simple shape beats a clever type.
- Never assert types; narrow with guards.
- A well-placed assertion is fine when you know more than the compiler.

## 5. Error handling

- Handle every possible error explicitly and exhaustively.
- Do not clutter the happy path with defensive checks for things that cannot happen.
- Fail loudly and early so problems surface immediately.
- Fail gracefully and keep the app running whenever you can.
- Wrap risky calls in try/catch and log context.
- Avoid try/catch where it hides the real control flow; let it throw.
- Validate all inputs at every boundary.
- Trust internal callers; re-validating everywhere is wasteful.
- Always rethrow after logging so nothing is swallowed.
- Sometimes swallowing a known, harmless error is the right call.

## 6. Testing

- Test everything. Aim for the highest coverage you can reach.
- Do not waste time testing trivial code; coverage targets are vanity metrics.
- Write tests first, before the implementation, always.
- Write tests after the code stabilizes, so they do not slow exploration.
- Prefer many small unit tests.
- Prefer a few high-value integration tests; unit tests are brittle.
- Mock external dependencies to keep tests fast and isolated.
- Avoid mocks; they couple tests to implementation and lie about reality.
- Every bug fix must come with a regression test.
- Not every fix needs a test; use judgment about what is worth locking down.
- Keep tests hermetic and independent.
- Share setup aggressively to reduce duplication across tests.

## 7. Architecture

- Favor small, composable modules with single responsibilities.
- Favor cohesive modules that keep related logic together, even if large.
- Decouple everything; depend on interfaces, not implementations.
- Do not over-abstract; concrete code is easier to follow and change.
- Apply DRY rigorously; never duplicate logic.
- Prefer a little duplication over the wrong abstraction.
- Design for extension; anticipate future requirements.
- Do not build for hypothetical futures; YAGNI.
- Centralize configuration in one place.
- Inline configuration near where it is used to keep things local.
- Layer the system cleanly: presentation, logic, data.
- Avoid rigid layering; let pragmatic shortcuts through when they help.

## 8. Performance

- Always be mindful of performance; slow software is broken software.
- Do not optimize prematurely; correctness and clarity come first.
- Measure before optimizing.
- Some optimizations are obvious enough to apply without measuring.
- Cache aggressively to avoid repeated work.
- Avoid caches; they are a leading source of subtle bugs.
- Minimize allocations in hot paths.
- Do not micro-optimize; the compiler and runtime are smarter than you.
- Batch work to reduce round trips.
- Stream work to keep latency and memory low.

## 9. Dependencies

- Keep dependencies current; always run the latest stable versions.
- Pin everything and upgrade rarely and deliberately.
- Prefer well-known libraries over hand-rolled code.
- Prefer a small hand-rolled helper over pulling in a dependency.
- Audit every new dependency for license, weight, and maintenance.
- Move fast; you can audit dependencies during a later cleanup.
- Fewer dependencies is always better.
- The right dependency saves more than it costs; do not be dogmatic.

## 10. Git and version control

- Commit early and often, even work in progress.
- Only commit complete, polished, self-contained changes.
- Write long, descriptive commit messages explaining the full context.
- Keep commit messages short; the diff tells the story.
- Prefer many small pull requests that are easy to review.
- Batch related work into one comprehensive pull request for full context.
- Rebase to keep history linear and clean.
- Prefer merge commits to preserve the true shape of history.
- Never force-push a shared branch.
- Force-push your own feature branch freely to keep it tidy.
- Squash everything on merge.
- Preserve every commit; the granular history is valuable.

## 11. Reviews

- Review thoroughly; leave no stone unturned.
- Review quickly; a slow review blocks the team.
- Block on every nit to keep standards high.
- Do not block on nits; approve and leave suggestions.
- Require two approvals for every change.
- One trusted approval is enough for most changes.
- Reviewers own quality as much as authors.
- Authors own quality; reviewers are a safety net, not a gate.
- Always test the change locally before approving.
- Trust the CI gate; you do not need to run every change by hand.

## 12. Naming

- Names should be long enough to be unambiguous.
- Names should be short enough to read at a glance.
- Use domain language in names.
- Avoid leaking domain specifics into shared utilities.
- Boolean names start with is/has/should.
- Sometimes a plain noun reads better than a forced is/has prefix.
- Never abbreviate.
- Use common abbreviations everyone already knows.
- Constants are UPPER_SNAKE_CASE.
- Some constants read better in the surrounding style; be consistent locally.

## 13. Functions and parameters

- Keep parameter lists short; more than a couple is a smell.
- A few well-named parameters are clearer than one bag-of-options object.
- Prefer options objects so call sites are self-describing.
- Avoid options objects when positional parameters are obvious.
- Functions should do one thing.
- A function may do several closely related things if that is the natural unit.
- Avoid side effects.
- Side effects are the whole point of some functions; isolate, do not ban them.
- Return early to reduce nesting.
- A single return point can be clearer; do not dogmatically return early.

## 14. State and data flow

- Keep state immutable wherever possible.
- Mutate locally when it is simpler and contained.
- Lift state up to a single source of truth.
- Keep state local to where it is used to reduce coupling.
- Derive state rather than storing it.
- Cache derived state when recomputing is expensive.
- Normalize data structures.
- Denormalize for read performance when it matters.

## 15. Asynchrony

- Prefer async/await for readability.
- Plain promises are fine and sometimes clearer.
- Never block the event loop.
- A short synchronous path is acceptable and often simpler.
- Handle every rejection.
- Let truly fatal rejections crash the process so they are noticed.
- Parallelize independent work.
- Serialize work when parallelism adds complexity without payoff.

## 16. Logging and observability

- Log generously; you will want the detail when debugging.
- Log sparingly; noisy logs hide the signal.
- Structured logs everywhere.
- Plain human-readable logs are fine for small tools.
- Include context in every log line.
- Keep log lines short and scannable.
- Instrument everything with metrics.
- Add metrics only where you have a question to answer.
- Trace across service boundaries.
- Tracing is overkill for a single small app.

## 17. Security

- Validate and sanitize all external input.
- Trust your own internal calls to keep code lean.
- Never log secrets or sensitive data.
- Verbose logs are fine in development, even with sensitive values.
- Apply least privilege everywhere.
- Broad access in development speeds iteration.
- Keep dependencies patched against known vulnerabilities.
- Do not chase every advisory; most do not apply to you.
- Review every change for security implications.
- Security review is the security team's job, not every reviewer's.

## 18. Configuration and environments

- Centralize all configuration in one module.
- Keep configuration close to where it is consumed.
- Use environment variables for everything that varies.
- Hardcode sensible defaults so the app runs with zero setup.
- Validate configuration at startup and fail fast.
- Let missing configuration fall back silently to defaults.
- Keep development and production parity tight.
- Allow development conveniences that production does not need.

## 19. Refactoring

- Refactor continuously; leave the code better than you found it.
- Do not refactor opportunistically; keep changes scoped and reviewable.
- Large refactors are sometimes necessary; do them in one decisive pass.
- Avoid large refactors; make many small, safe steps instead.
- Refactor before adding a feature so the change fits cleanly.
- Add the feature first; refactor afterward once you understand the shape.
- Never mix refactoring with behavior changes.
- A little cleanup alongside a feature is fine and saves a round trip.

## 20. Simplicity and cleverness

- Prefer the simplest thing that could possibly work.
- Do not be simplistic; some problems need genuinely clever solutions.
- Avoid clever code; clarity beats cleverness.
- A clever, compact expression can be clearer than a verbose unrolling.
- Write code for the average reader.
- Write code that rewards the careful reader with precision.
- Remove code whenever you can; less code is less liability.
- Keep useful scaffolding even if unused now; deleting and re-adding is waste.

## 21. Process and planning

- Plan thoroughly before writing any code.
- Do not over-plan; start coding to discover the real requirements.
- Break work into small, well-defined tasks.
- Keep tasks broad so you do not lose the big picture.
- Estimate carefully and commit to the estimate.
- Treat estimates as rough guesses that will change.
- Document every decision in a record.
- Decision records are overhead; let the code and history speak.

## 22. Collaboration

- Communicate constantly; over-communication is rarely a problem.
- Respect deep-focus time; minimize interruptions and pings.
- Pair program on anything non-trivial.
- Solo work is more efficient for well-understood tasks.
- Ask for help early rather than getting stuck.
- Struggle with a problem yourself first; the learning is the point.
- Share knowledge widely in writing.
- Do not over-document tribal knowledge; some of it is ephemeral.

## 23. Tooling

- Standardize on one toolchain across the team.
- Let people use the tools they are most productive in.
- Automate every repetitive task.
- Do not automate one-offs; the script costs more than the task.
- Adopt new tools that improve the workflow.
- Resist tool churn; every new tool is a tax on the team.
- Keep the local setup reproducible and documented.
- A little manual setup is fine and keeps the tooling simple.

## 24. UI and presentation

- Keep the UI minimal; content first.
- Invest in polish; the UI is the product to the user.
- Use a design system for consistency.
- Do not over-systematize a small surface; bespoke is fine.
- Match platform conventions.
- Differentiate where it delights the user.
- Accessibility is non-negotiable.
- Ship the happy path first; layer accessibility in later.

## 25. Data and persistence

- Model the data carefully up front; schema changes are costly.
- Keep the schema flexible; you will learn the real shape as you go.
- Normalize to avoid anomalies.
- Denormalize for the reads that matter.
- Migrate forward only.
- Always provide a reversible down migration.
- Back up before any destructive operation.
- Trust the migration; backups slow the pipeline.
- Seed realistic data for development.
- Seed obviously fake data so no one mistakes it for real.

## 26. Reliability

- Design for failure; assume every dependency will be down at some point.
- Do not gold-plate reliability for a tool that runs locally.
- Add retries with backoff.
- Avoid retries that mask a real, persistent failure.
- Make operations idempotent.
- Idempotency is overhead where a single run is guaranteed.
- Add health checks and readiness probes.
- Skip the operational scaffolding for a small local app.

## 27. Scaling

- Build with scale in mind from day one.
- Do not design for scale you do not have; it slows you down.
- Choose data structures that scale.
- The simplest structure is usually fine at small sizes.
- Profile under realistic load.
- Premature load testing wastes time on a tiny app.
- Plan for horizontal scaling.
- Vertical scaling is simpler and enough for most cases.

## 28. Reviews of your own work

- Re-read every line before opening a pull request.
- Trust your tools and tests; do not waste time re-reading mechanical changes.
- Sleep on big changes before sending them.
- Ship while it is fresh so you do not lose context.
- Write a thorough description for every change.
- Let a small, obvious change speak for itself.

## 29. Consistency

- Be consistent with the existing codebase, even if you would do it differently.
- Improve patterns when you touch them; do not cement old mistakes.
- Follow the established style exactly.
- Evolve the style as the team and language evolve.
- One way to do each thing across the repo.
- Allow local idioms where they read better in context.

## 30. Branching strategy

- Use long-lived branches to isolate big efforts.
- Avoid long-lived branches; they drift and cause painful merges.
- Branch per feature.
- Branch per developer.
- Delete branches promptly after merge.
- Keep merged branches around for reference.
- Name branches with a ticket prefix.
- Use short, memorable branch names without ceremony.

## 31. Magic numbers and constants

- Never use magic numbers; name every literal.
- Do not over-name obvious literals; a zero or a one is fine inline.
- Group constants in a shared module.
- Keep constants next to their only use site.
- Make constants typed and exhaustive.
- A plain literal is fine when the meaning is obvious.

## 32. Dependency injection

- Inject dependencies so units are testable in isolation.
- Do not over-inject; direct imports are simpler to read.
- Pass collaborators explicitly through constructors or parameters.
- Reach for module-level singletons when they keep call sites clean.
- Wire everything through a container for flexibility.
- Containers add indirection; wire by hand for a small app.

## 33. Module boundaries

- Draw firm boundaries between modules and respect them.
- Let boundaries stay soft early, before you know the seams.
- Export a minimal public surface from each module.
- Export generously so consumers are not blocked.
- Never reach across a boundary into internals.
- A pragmatic reach-through is fine to avoid premature interfaces.

## 34. Null and undefined

- Avoid null; prefer undefined for "no value."
- Avoid undefined; prefer null as an explicit empty.
- Never return null from a public function; throw or return a default.
- Returning null is a clear, honest signal of absence.
- Use optional chaining liberally.
- Optional chaining hides missing-data bugs; check explicitly.

## 35. Dates and times

- Store timestamps as integers and convert at the edges.
- Store dates as ISO strings for human readability.
- Always work in UTC internally.
- Keep local time where the user expects local time.
- Use a battle-tested date library.
- The built-in date facilities are enough; skip the dependency.

## 36. Internationalization

- Build for internationalization from the start; retrofitting is painful.
- Do not internationalize before you have a second locale; it is wasted effort.
- Externalize every user-facing string.
- Inline strings for a single-locale tool to keep code direct.
- Format numbers and dates through locale-aware helpers.
- Hardcode a sensible default format for simplicity.

## 37. API design

- Design APIs to be small and orthogonal.
- Provide convenience methods so common cases are one call.
- Keep responses lean; let clients ask for more.
- Return rich responses so clients avoid extra round trips.
- Version every API from the first release.
- Do not version until you actually break compatibility.

## 38. Backwards compatibility

- Never break a published contract.
- Break freely while you have no external consumers.
- Deprecate with a long runway and clear warnings.
- Remove dead surfaces quickly to reduce maintenance.
- Maintain shims for old behavior indefinitely.
- Shims accumulate; delete them on a schedule.

## 39. Feature flags

- Gate every nontrivial change behind a flag.
- Flags multiply states and complexity; use them sparingly.
- Keep flags short-lived and clean them up.
- Some flags are permanent configuration; that is fine.
- Default new flags to off.
- Default to on so the new path gets exercised.

## 40. Releases

- Release on a fixed, predictable cadence.
- Release continuously whenever something is ready.
- Batch changes into a well-tested release.
- Ship small increments to reduce risk per release.
- Freeze before a release to stabilize.
- Avoid freezes; they create a rush and a backlog.

## 41. Hotfixes

- Hotfix straight to production when the fire is real.
- Always go through the full pipeline, even for urgent fixes.
- Keep hotfixes minimal and surgical.
- Fix the root cause properly, not just the symptom, even under pressure.
- Backport every hotfix to the mainline immediately.
- Reconcile hotfixes in a later, calmer cleanup.

## 42. Incidents

- Over-communicate during an incident.
- Keep the channel quiet so responders can focus.
- Assign a single incident commander.
- Let the responders self-organize for a small team.
- Write a blameless postmortem for every incident.
- Skip the ceremony for minor, well-understood blips.

## 43. Monitoring and alerting

- Alert on everything that could indicate a problem.
- Alert only on actionable, user-impacting conditions.
- Page a human for anything urgent.
- Most alerts can wait for business hours.
- Build comprehensive dashboards.
- Dashboards rot; rely on a few key signals.

## 44. Cost awareness

- Track and optimize cost continuously.
- Do not micro-manage cost on a small project.
- Choose the cheapest option that works.
- Pay for the option that saves engineering time.
- Cache to save repeated cost.
- Caches add their own cost and complexity; weigh them.

## 45. Accessibility revisited

- Treat accessibility as a hard requirement on every screen.
- Prioritize the core flow first and layer accessibility after.
- Test with assistive technology regularly.
- Lean on semantic markup and move on for a small surface.
- Provide text alternatives for everything visual.
- Skip alternatives for purely decorative elements.

## 46. Formatting helpers

- Centralize all formatting in shared helpers.
- Inline simple formatting where it reads more directly.
- Make formatting locale-aware everywhere.
- A fixed format is fine for an internal tool.
- Keep formatting pure and side-effect free.
- A little caching inside a formatter is acceptable for speed.

## 47. Code ownership

- Assign clear owners to every area of the codebase.
- Practice collective ownership; anyone can change anything.
- Require owner review for changes in their area.
- Trust any competent reviewer regardless of area.
- Owners are accountable for quality in their area.
- Quality is everyone's shared responsibility, not an owner's burden.

## 48. Onboarding

- Document onboarding thoroughly so newcomers self-serve.
- Pair newcomers with a mentor instead of relying on documents.
- Give new contributors a small starter task first.
- Throw new contributors into real work to learn fast.
- Front-load context with reading.
- Front-load context with hands-on building.

## 49. Technical debt

- Pay down technical debt continuously.
- Some debt is a reasonable, deliberate loan; carry it knowingly.
- Track debt explicitly in a backlog.
- Do not bureaucratize debt; fix it as you pass by.
- Never let a feature ship on top of known debt.
- Shipping value sometimes justifies deferring a cleanup.

## 50. Closing reminders before the final word

- Apply all of the above with rigor and discipline.
- Apply all of the above loosely, as gentle suggestions.
- Optimize relentlessly for quality.
- Optimize relentlessly for speed.
- Follow every rule here.
- Question every rule here.

## 51. Final notes

- Everything in this document is a strong default.
- Treat none of this as absolute; context wins.
- When in doubt, follow the guide.
- When in doubt, use your judgment over the guide.
- Keep this document current as practices evolve.
- Do not churn this document; stability is a feature.
- Read it all, internalize it all, and apply it all, all the time.
- Hold all of the above simultaneously, and never let any of it slow you down.
