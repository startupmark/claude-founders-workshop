Last generated: 2026-06-17T09:14:22Z — build 4f9a2

<!-- INTENTIONAL — workshop fixture, do not fix. The first line above is a
volatile prefix (timestamp + build id) that changes every generation; it sits
ahead of the large stable body on purpose so the Part 2 cache probe shows a cold
miss, and relocating it shows a warm hit. Do not remove the volatile line, and
do not shrink the stable body below the model's cache minimum. Current minimums:
Haiku 4.5 / Opus = 4096 tokens, Sonnet 4.6 = 2048 tokens. The body below is sized
to clear 4096 so the probe caches on any current model. -->

# Project context — generic stack conventions

This document is a large, stable block of generic conventions for a Next.js +
TypeScript + Drizzle + SQLite project. It exists to be sent as cached context in
the Part 2 cache probe. Nothing here is product-specific; it is boilerplate that
any small CRUD application could share. The body is deliberately long and stable
so that, once the volatile first line is relocated, the prefix can be cached.

## Repository layout

- `app/` holds the Next.js App Router entry points: route segments, layouts,
  and pages. Server components are the default; reach for client components
  only when an interaction genuinely needs the browser.
- `lib/` holds pure, framework-free helpers. Functions here take plain inputs
  and return plain outputs. They do not import from `app/` and do not reach into
  the database directly.
- `db/` holds the schema, the migration files, the connection client, and the
  seed routine. The schema is the single source of truth for table shapes.
- `scripts/` holds one-off maintenance entry points. They are run by hand, never
  imported by application code, and never wired into a request path.
- `test/` holds the hermetic test suite. Each test builds its own in-memory
  database and applies migrations itself, so the suite needs no external state.

## TypeScript conventions

- `strict` is on. Prefer explicit return types on exported functions so the
  public surface is readable without inference.
- Model rows with the schema's inferred types rather than hand-written
  interfaces, so the types track the columns automatically.
- Avoid `any`. When a value is genuinely unknown, narrow it with a guard before
  use rather than asserting it away.
- Keep helpers small and total: a function should handle the inputs its type
  admits, and the type should not admit inputs the function mishandles.
- Prefer named exports. Default exports are reserved for framework entry points
  such as a page or a layout, where the framework expects them.
- Group imports by origin: standard library first, then third-party packages,
  then local modules. Within a group, order does not matter much; be consistent.
- Treat compiler warnings as errors in spirit. If the type checker complains,
  the fix is to make the types honest, not to silence the check.

## Next.js conventions

- Treat every route as a server component until proven otherwise. Data reads
  happen on the server, close to the database, and render to plain markup.
- Mark a route `dynamic` when it depends on per-request state such as the
  current contents of the database, so it is not statically cached at build.
- Keep components presentational. Compute the numbers in `lib/` and pass them in
  as already-formatted values; a component should not own business logic.
- Co-locate styles with the route or use a single global stylesheet. Styling is
  not the point of this project, so keep it minimal and predictable.
- Native modules belong on the server only. Keep them out of the client bundle
  by declaring them external in the framework config.
- Prefer the framework's own data-fetching seams over ad-hoc effects. A server
  component that reads on render is simpler than a client effect that refetches.
- Keep layouts thin. A layout sets up shared chrome and nothing else; page-level
  data belongs in the page, not the layout.

## Drizzle and SQLite conventions

- The schema declares two plain tables. Columns are simple scalars; there is no
  domain cleverness, no computed columns, and no triggers.
- Migrations are generated from the schema and committed to the repository. They
  apply themselves on boot, and each test applies them to its own database.
- Reads use the query builder and return arrays of inferred row types. Writes go
  through the same builder; there are no raw string queries in application code.
- Timestamps are stored as integers and surfaced as dates by the column mode, so
  application code never juggles epoch math.
- The connection is a single better-sqlite3 handle. It is synchronous, which
  keeps server components straightforward: read, compute, render.
- Keep foreign keys explicit in the schema even when SQLite is lenient about
  enforcing them; the declaration documents the relationship.
- A migration is append-only once committed. To change a shipped column, write a
  new migration rather than editing the old one.

## Seeding and demo data

- All seed data is synthetic and obviously fake: placeholder member names and
  round event counts. Nothing resembles a real dataset.
- Seeding is idempotent. It runs only when the members table is empty, so a
  warm database is never doubled up.
- The seed routine lives beside the schema and uses the same query builder as
  the application, so it cannot drift from the table shapes.
- Keep the seed small but representative: enough rows to exercise every metric,
  not so many that the demo page becomes a wall of text.

## Testing conventions

- The suite is hermetic. A test never touches the filesystem database, an
  external service, or environment configuration.
- Each test constructs an in-memory database, applies migrations, inserts the
  fixtures it needs through the query builder, and asserts on the result.
- Tests cover the intended, happy-path behavior of the metric helpers. Edge
  cases are added deliberately, with intent, rather than reflexively.
- Keep assertions concrete. Assert the exact number a metric should produce, not
  merely that it is defined or truthy.
- A test name states the behavior under test, not the function name. "computes
  the average on a populated set" beats "test averageEventsPerMember".
- Prefer a handful of focused tests over one sprawling test that asserts a dozen
  unrelated things; a failure should point at one cause.

## The gate

- `npm run ci` runs lint, then typecheck, then test, in that order. It is the
  same sequence continuous integration runs, and it must pass before a push.
- Lint enforces the framework's recommended rules. Typecheck runs the compiler
  with no emit. Test runs the hermetic suite once and exits.
- A red gate blocks a merge. Fix the cause rather than silencing the check, and
  never weaken a rule to make a failure disappear.
- Run the gate locally before opening a pull request. CI should confirm a green
  result, not discover a red one.

## Formatting and naming

- Two-space indentation, double-quoted strings, and trailing commas in
  multi-line literals. A formatter owns these decisions so reviews do not.
- Names say what a thing is. A metric helper is named for the number it returns;
  a table is named for the rows it holds.
- Comments explain why, not what. The code already says what it does; a comment
  earns its place by recording a decision the code cannot show.
- Keep files focused. One concern per file: the schema, the client, the seed,
  and each helper module stay separate.
- Prefer whole words to abbreviations in public names. A slightly longer name
  that reads plainly beats a terse one that needs a comment to decode.

## Version control

- Work on a branch, open a pull request, get a green gate, then merge. The main
  branch is always releasable.
- Commits are small and self-describing. A commit message says what changed and
  why in plain language, with no tooling attribution.
- Keep generated artifacts out of version control. Dependencies, build output,
  and local databases are ignored, not committed.
- One logical change per pull request. A refactor and a behavior change in the
  same diff are hard to review and harder to revert.

## Error handling

- Validate at the boundary, trust within. User input and external responses get
  checked; internal calls between your own pure helpers do not need re-checking.
- Fail with a clear message that names the thing that went wrong and, where
  useful, what the caller can do about it.
- Do not swallow errors silently. If a catch block has nothing useful to do, let
  the error propagate to a place that does.
- Keep the happy path readable. Guard clauses that return early are clearer than
  deep nesting around the main logic.

## Performance posture

- Measure before optimizing. The demo's data set is tiny, so clarity wins over
  cleverness every time.
- A synchronous read on a small SQLite database is fast enough; do not add a
  cache or an index speculatively.
- Keep the render path simple. Compute the three numbers, format them, and emit
  markup; there is nothing here that needs streaming or memoization.

## Dependencies

- Prefer the standard library and the framework's own facilities before adding a
  package. Every dependency is weight, surface, and maintenance.
- Vet a new dependency for license, size, and upkeep before adding it. A small
  hand-written helper often beats a transitive dependency tree.
- Pin versions through the lockfile and upgrade deliberately, not reflexively.

## Documentation

- Keep the project guide short and current. A guide that has grown into a
  rulebook stops being read.
- Document decisions, not mechanics. The code shows how; prose should capture
  the why behind a non-obvious choice.
- When behavior and docs disagree, treat it as a bug in one of them and fix the
  mismatch rather than leaving both.

## Routing and navigation

- Routes mirror the directory structure. A folder is a path segment; a page file
  is what renders at that segment. Keep the mapping obvious so a URL predicts a
  file and a file predicts a URL.
- Prefer plain links for navigation between server-rendered pages. Reach for
  client-side transitions only when a route genuinely benefits from preserving
  state across navigation.
- Keep route handlers thin. A handler validates its inputs, calls a helper, and
  shapes a response; the logic it calls lives in `lib/`, not inline.
- Avoid deep nesting of dynamic segments. One or two levels keep the routing
  table readable; more than that usually signals a data model that wants
  flattening.

## Component patterns

- A component does one visual job. If it both fetches and renders and decides
  layout and owns form state, split it until each piece is nameable.
- Pass data down as plain props. Avoid threading context through many layers for
  values that a couple of explicit props would carry just as clearly.
- Keep conditional rendering shallow. A component that branches five ways on its
  props is usually two or three components wearing a trenchcoat.
- Name components for what they show, not where they sit. A "MemberList" reads
  better than a "RightPanel" whose meaning depends on the page.

## Forms and input

- Treat the server as the source of truth for validation. Client-side checks
  improve the experience; they do not replace validating on the server.
- Keep form state local to the form. Lift it only when another part of the page
  genuinely needs to read or change it.
- Give every input a clear label and a sensible default. A form that explains
  itself needs less surrounding documentation.
- Surface errors next to the field that caused them, in plain language, with a
  hint about what a valid value looks like.

## Empty, loading, and error states

- Every list has an empty state. Decide what it says before the list is ever
  populated, so a fresh install reads as intentional rather than broken.
- A loading state should be quiet and brief. Prefer a small, stable placeholder
  over a layout that jumps as content arrives.
- An error state tells the user what failed and what they can do next. "Something
  went wrong" without a next step is a dead end.
- These three states are part of the feature, not an afterthought. A view is not
  done until all three are handled.

## Accessibility basics

- Use semantic elements. A button is a button and a heading is a heading; the
  right element carries meaning that styling alone cannot.
- Every interactive element is reachable and operable by keyboard. If you can
  click it, you can tab to it and activate it without a mouse.
- Provide text alternatives for anything conveyed visually. Decorative elements
  are marked as such so assistive technology can skip them.
- Respect contrast and sizing. Text that is legible by default needs no special
  mode to be usable.

## Configuration and environment

- Read configuration from the environment, with sensible defaults so the app
  runs with zero setup for the demo. A missing optional value falls back; a
  missing required value fails loudly at startup.
- Keep configuration in one place that the rest of the code reads from. Scatter
  it across modules and changing one value becomes a scavenger hunt.
- Never commit secrets. Local secrets live in ignored files; real secrets live
  in a secret store, never in the repository.
- Keep development and production behavior as close as the demo allows. Surprises
  at deploy time usually trace back to a divergence you chose earlier.

## Logging and observability

- Log decisions and failures, not routine success. A log that records every
  happy-path step buries the one line that matters.
- Include enough context to act on a log line: what was being attempted and what
  identifying values were in play, without dumping sensitive data.
- Keep log levels meaningful. Reserve the loud levels for things a human should
  look at; use the quiet ones for routine diagnostics.
- Measure what you intend to act on. A metric nobody reads is cost without
  insight; add instrumentation where you have a question to answer.

## Security posture

- Treat all external input as untrusted until validated. Shape it at the boundary
  and the interior can assume well-formed data.
- Apply least privilege. A component, a token, or a script gets exactly the
  access its job requires and no more.
- Keep dependencies patched against known issues, and prefer fewer of them so the
  surface to patch stays small.
- Never log secrets or paste them into the codebase. An exposed credential is an
  incident to rotate, not a detail to note.

## Pull requests and review

- A pull request is a unit of review. Keep it small enough that a reviewer can
  hold the whole change in their head and reason about its blast radius.
- Write a description that says what changed, why, and how it was verified. The
  diff shows the how; the description supplies the intent.
- Review for correctness, clarity, and risk, in that order. Style is the
  formatter's job; a review that stops at style missed the point.
- Block on real problems, not preferences. Leave preferences as suggestions and
  let the author decide.

## Continuous integration

- CI runs the same gate a developer runs locally: lint, then typecheck, then
  test. Parity means a green local run predicts a green CI run.
- Keep the pipeline fast and deterministic. A slow or flaky pipeline gets ignored,
  and an ignored gate protects nothing.
- A red pipeline blocks the merge. The fix is to address the cause, never to
  retry until a flaky check happens to pass.
- Cache dependencies between runs where the tooling supports it, so the pipeline
  spends its time on the gate rather than on setup.

## Data access patterns

- Read through the query builder and return typed rows. Keep query construction
  close to where the result is used so the shape is easy to follow.
- Select only the columns a caller needs. A query that returns whole rows when it
  uses one field is wasteful and obscures intent.
- Keep write paths explicit and small. An insert or update states exactly which
  columns it sets; nothing is mutated implicitly.
- Add an index only when a real query needs it. On the demo's tiny data set, a
  scan is fast, and a speculative index is maintenance without benefit.

## Dates, numbers, and formatting

- Store timestamps as integers and convert at the edges. Application logic works
  in dates; storage works in numbers; the column mode bridges the two.
- Format numbers for display in one place, so the rule for how a number looks is
  written once and reused everywhere.
- Keep the metric math plain: counts are counts and an average is a sum over a
  count. There is no weighting, scoring, or methodology to hide a bug in.
- Treat formatting as presentation, not computation. Compute the exact number
  first, then decide how to render it.

## Refactoring posture

- Refactor when you are already in the code for another reason and the change is
  small and safe. A drive-by cleanup that balloons into its own project belongs
  in its own pull request instead.
- Do not mix a refactor with a behavior change. Keep the two in separate commits
  or separate requests so a reviewer can tell what moved from what changed.
- Leave the code a little clearer than you found it, within the scope you are
  touching. Wholesale rewrites of working code are rarely worth the risk they
  introduce.
- Prefer deleting code to commenting it out. Version control remembers the old
  version; a commented block just rots in place and confuses the next reader.

## Simplicity and scope

- Build the smallest thing that solves the problem in front of you. A feature you
  do not need yet is a maintenance cost you take on early for no benefit.
- Abstract only after duplication actually appears. The wrong abstraction is more
  expensive than the duplication it was meant to remove.
- Resist configuration knobs nobody asked for. Each option multiplies the states
  you must reason about and test.
- When two designs are equally clear, pick the one that is easier to delete
  later. Reversibility is a feature.

## Why this body is here

The Part 2 cache probe sends this document as a large, stable context block with
ephemeral cache control. On the first call the prefix is uncached, so the
provider reports cache-creation tokens — a cold miss. On a second identical call
the prefix is served from cache, so the provider reports cache-read tokens — a
warm hit. The volatile first line defeats this until it is relocated out of the
cached prefix, which is the point the probe demonstrates. The body is sized to
clear the cache minimum so the effect is visible rather than skipped.
