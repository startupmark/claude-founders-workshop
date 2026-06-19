# acme-community (workshop start)

You're on the `start` branch: the near-empty starting point you build on during
the Claude Founders Workshop. The app and its tests are here; the tooling is not.
You add it one part at a time.

The full instructions live on the `main` branch:

- Participant guide: `docs/participant-guide.md`
- Pre-flight checklist: `docs/pre-flight.md`
- Facilitator guide: `docs/facilitator-guide.md`

## Quick start

```bash
npm install
npm run ci        # lint -> typecheck -> test, should pass
npm run dev       # http://localhost:3000
```

Node 20 or newer (built on 24). Parts 2, 4, and 5 need an Anthropic API key: set
it in your environment and decline it when Claude Code prompts, so your session
stays on your subscription. The participant guide covers this.

## What you're forking

`acme-community` tracks members and events: two tables, three numbers, small
enough to read over a cup of coffee. The data is synthetic. Some code is broken
on purpose -- a divide-by-zero, an unguarded reset, a bloated config -- and those
are teaching fixtures, so leave them be. By the last part, your repo looks like
`main`: instrumented, guarded, self-checking.

Prefer to build against your own repo? The participant guide explains that path.

## License

MIT. See [LICENSE](LICENSE). Fork it, run it, change it, and enjoy.
