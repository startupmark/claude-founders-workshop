// Single source of truth for the Claude model IDs the kit's live scripts use:
// the Part 2 cache probe, the Part 4 scope-check, and the Part 5 eval harness.
//
// Why one place: BUILD_SPEC's "Versions to pin" step wants the model IDs in one
// config value, not scattered across scripts. Update them here and every script
// follows. When you rehearse the workshop (Stage 6), pin these to dated IDs.
//
// Two consumers can't import TypeScript and so name this file instead of reading
// from it: cost/litellm.config.yaml (its strings must match the values below)
// and .claude/agents/verifier.md (which uses the `sonnet` subagent alias).
export const MODELS = {
  opus: "claude-opus-4-8",
  sonnet: "claude-sonnet-4-6",
  haiku: "claude-haiku-4-5",
} as const;
