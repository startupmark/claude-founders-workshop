Last generated: 2026-06-17T09:14:22Z — build 4f9a2

<!-- INTENTIONAL — workshop fixture, do not fix. The first line above is a
volatile prefix (timestamp + build id) that changes every generation; it sits
ahead of the large stable body on purpose so the Part 2 cache probe shows a cold
miss, and relocating it shows a warm hit. Do not remove the volatile line, and
do not shrink the stable body below the ~1,024-token cache minimum. -->

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

## Seeding and demo data

- All seed data is synthetic and obviously fake: placeholder member names and
  round event counts. Nothing resembles a real dataset.
- Seeding is idempotent. It runs only when the members table is empty, so a
  warm database is never doubled up.
- The seed routine lives beside the schema and uses the same query builder as
  the application, so it cannot drift from the table shapes.

## Testing conventions

- The suite is hermetic. A test never touches the filesystem database, an
  external service, or environment configuration.
- Each test constructs an in-memory database, applies migrations, inserts the
  fixtures it needs through the query builder, and asserts on the result.
- Tests cover the intended, happy-path behavior of the metric helpers. Edge
  cases are added deliberately, with intent, rather than reflexively.
- Keep assertions concrete. Assert the exact number a metric should produce, not
  merely that it is defined or truthy.

## The gate

- `npm run ci` runs lint, then typecheck, then test, in that order. It is the
  same sequence continuous integration runs, and it must pass before a push.
- Lint enforces the framework's recommended rules. Typecheck runs the compiler
  with no emit. Test runs the hermetic suite once and exits.
- A red gate blocks a merge. Fix the cause rather than silencing the check, and
  never weaken a rule to make a failure disappear.

## Formatting and naming

- Two-space indentation, double-quoted strings, and trailing commas in
  multi-line literals. A formatter owns these decisions so reviews do not.
- Names say what a thing is. A metric helper is named for the number it returns;
  a table is named for the rows it holds.
- Comments explain why, not what. The code already says what it does; a comment
  earns its place by recording a decision the code cannot show.
- Keep files focused. One concern per file: the schema, the client, the seed,
  and each helper module stay separate.

## Version control

- Work on a branch, open a pull request, get a green gate, then merge. The main
  branch is always releasable.
- Commits are small and self-describing. A commit message says what changed and
  why in plain language, with no tooling attribution.
- Keep generated artifacts out of version control. Dependencies, build output,
  and local databases are ignored, not committed.

## Why this body is here

The Part 2 cache probe sends this document as a large, stable context block with
ephemeral cache control. On the first call the prefix is uncached, so the
provider reports cache-creation tokens — a cold miss. On a second identical call
the prefix is served from cache, so the provider reports cache-read tokens — a
warm hit. The volatile first line defeats this until it is relocated out of the
cached prefix, which is the point the probe demonstrates. The body is sized to
clear the cache minimum so the effect is visible rather than skipped.
