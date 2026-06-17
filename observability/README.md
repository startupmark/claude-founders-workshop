# observability/ - Part 1 (See)

The "See" kit for the workshop: turn on Claude Code's usage telemetry and read
two pictures of your spend.

- A historical cost/cache picture from `ccusage`, pointed at the synthetic
  history in `fixtures/claude-history/` (see below).
- A live dashboard fed by Claude Code's OpenTelemetry (OTel) export.

Nothing here is product-specific. Endpoints and tokens are placeholders.

## 1. The historical picture (ccusage)

`ccusage` reads Claude Code session JSONL and aggregates tokens, cache, and cost.
This repo ships a fabricated 30-day history so a first-time attendee has data.

Copy the fixture into a config dir and point `ccusage` at it:

```
mkdir -p /tmp/cc/projects/acme-community
cp fixtures/claude-history/*.jsonl /tmp/cc/projects/acme-community/
CLAUDE_CONFIG_DIR=/tmp/cc npx ccusage@latest daily
```

Expect an unflattering profile: ~40% overall cache-hit and two expensive,
cache-poor Opus sessions dominating a ~$15 total.

Caveat: `ccusage` also reads Codex logs from `~/.codex` regardless of
`CLAUDE_CONFIG_DIR`. Ignore or move those for a clean demo.

## 2. The live picture (OpenTelemetry)

Enable telemetry by merging `settings.telemetry.json` into your Claude Code
settings - either the project file `.claude/settings.json` or the user file
`~/.claude/settings.json`. The block lives under `env`:

```json
{
  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "OTEL_METRICS_EXPORTER": "otlp",
    "OTEL_LOGS_EXPORTER": "otlp",
    "OTEL_EXPORTER_OTLP_PROTOCOL": "grpc",
    "OTEL_EXPORTER_OTLP_ENDPOINT": "http://localhost:4317",
    "OTEL_METRIC_EXPORT_INTERVAL": "10000",
    "OTEL_LOGS_EXPORT_INTERVAL": "5000"
  }
}
```

`CLAUDE_CODE_ENABLE_TELEMETRY=1` is the only required variable; the rest select
the OTLP exporter and a local collector endpoint. The export intervals are
lowered from their 60s/5s defaults to 10s/5s so data shows up fast in a demo.
Restart Claude Code after editing settings.

### What you get

Once a session runs, the backend receives (metric names are stable as of
Claude Code v2.1.x):

- `claude_code.cost.usage` (USD, by `model`, `query_source`, `skill.name`, ...)
- `claude_code.token.usage` (by `type`: input / output / cacheRead / cacheCreation)
- `claude_code.session.count`
- `claude_code.code_edit_tool.decision` (by `decision`: accept / reject) - the
  edit accept/reject signal. This is what surfaces a "reject dip" live; it is
  not in the `ccusage` history, because it is a telemetry event, not a usage
  record.

## 3. Three dashboard paths

Pick one. All three consume the same OTLP export above.

### a. Compose bundle (fastest)

Anthropic's monitoring guide ships a docker-compose stack - an OTel Collector
plus Prometheus and Grafana with prebuilt Claude Code dashboards.

- Repo: https://github.com/anthropics/claude-code-monitoring-guide
- `docker compose up`, then keep the settings above (endpoint
  `http://localhost:4317`). Dashboards populate within a minute or two.

### b. Your own collector + Grafana community dashboards

Run an OTel Collector you control and visualize with Grafana.

- Collector receives OTLP on `:4317` (grpc) / `:4318` (http) and exports to
  Prometheus (for metrics) and/or Loki (for log events).
- Add the Prometheus datasource in Grafana and import a community
  "OpenTelemetry" / "Claude Code" dashboard, or build panels on the metric
  names above.

### c. Grafana Cloud (hosted, no local backend)

Send OTLP straight to Grafana Cloud. Swap the endpoint and add an auth header:

```json
{
  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "OTEL_METRICS_EXPORTER": "otlp",
    "OTEL_LOGS_EXPORTER": "otlp",
    "OTEL_EXPORTER_OTLP_PROTOCOL": "http/protobuf",
    "OTEL_EXPORTER_OTLP_ENDPOINT": "https://otlp-gateway-<region>.grafana.net/otlp",
    "OTEL_EXPORTER_OTLP_HEADERS": "Authorization=Bearer <grafana-cloud-token>"
  }
}
```

The endpoint is region-specific; copy yours from the Grafana Cloud OTLP
connection page, and generate the token there. Never commit a real token.
