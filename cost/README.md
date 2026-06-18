# cost/ - Part 2 (Save)

The "Save" kit: see prompt caching work, and catch the thing that silently
breaks it. Prompt caching is a prefix match - the cached block must be
byte-identical across calls, so a timestamp or build id at the top of a context
file busts the cache every generation.

## Files

- `sample-context.md` - a large, stable generic context block with a **volatile
  first line** (a timestamp + build id). The cache lure. Its stable body is
  sized to clear the model cache minimum (Haiku 4.5 / Opus = 4096 tokens,
  Sonnet 4.6 = 2048).
- `prefix-sentinel.mjs` - flags the volatile first line so you catch it before
  it costs you cache hits.
- `cache-probe.ts` - a direct Messages API call that measures cache creation vs.
  cache read across a cold then warm call.
- `litellm.config.yaml` - optional tiered-routing config (Haiku / Sonnet / Opus).

## 1. Prefix sentinel

Flags a volatile first line in a context file. Exits non-zero when it fires.

```
npm run prefix-sentinel            # checks cost/sample-context.md
node cost/prefix-sentinel.mjs path/to/other.md
```

Against the planted `sample-context.md` it fires on the `Last generated: ...`
line. Wire it as a pre-commit hook or a Claude Code hook to keep volatile
prefixes out of cached context.

## 2. Cache probe

Sends `sample-context.md` as a cached system block and prints the usage across
two identical calls. It uses Haiku and `cache_control: { type: "ephemeral", ttl:
"1h" }`, so it makes two real but very cheap API calls.

```
ANTHROPIC_API_KEY=sk-... npm run cache-probe
```

Expected shape:

```
cold  cache_creation=<n>  cache_read=0     input=<small>
warm  cache_creation=0    cache_read=<n>   input=<small>
```

The cold call writes the prefix to cache; the warm call reads it back. If
`cache_creation` is 0, the prefix is below the model's cache minimum - the
stable body must clear 4096 tokens for Haiku/Opus.

The volatile first line is what defeats this across sessions: every generation
rewrites the timestamp, so the cached prefix changes and the next session's
first call is cold again. Relocating the volatile line out of the cached prefix
(below the `cache_control` breakpoint, or out of the file) is the fix the
sentinel points you toward.

## 3. LiteLLM (optional)

`litellm.config.yaml` maps `claude-haiku` / `claude-sonnet` / `claude-opus` to
current model ids for tiered routing through a LiteLLM proxy. Nothing in the app
depends on it; it is a cost-control convenience.

```
litellm --config cost/litellm.config.yaml
```

Never commit a real key. All three configs read `ANTHROPIC_API_KEY` from the
environment.
