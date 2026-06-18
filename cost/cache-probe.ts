// Part 2 cache probe: makes two identical Messages API calls with the large,
// stable context block from sample-context.md cached, and prints the cache
// usage. The first call is a cold miss (writes the cache); the second is a warm
// hit (reads it). If the volatile first line of sample-context.md is inside the
// cached prefix, relocating it out is what lets the warm hit survive across
// sessions -- the point Part 2 teaches.
//
// Run it (needs your own key; this makes two real, cheap API calls):
//   ANTHROPIC_API_KEY=sk-... npm run cache-probe
//
// Uses Haiku to keep cost negligible. The cached prefix must clear the model's
// minimum cacheable size: Haiku 4.5 / Opus = 4096 tokens, Sonnet 4.6 = 2048.
import { readFileSync } from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { MODELS } from "../config/models";

const MODEL = MODELS.haiku; // Haiku keeps the probe's cost negligible
const CONTEXT_PATH = path.resolve(process.cwd(), "cost/sample-context.md");

async function probe(client: Anthropic, context: string, label: string) {
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 16,
    system: [
      {
        type: "text",
        text: context,
        cache_control: { type: "ephemeral", ttl: "1h" },
      },
    ],
    messages: [{ role: "user", content: "Reply with the single word: ok." }],
  });
  const u = res.usage;
  const created = u.cache_creation_input_tokens ?? 0;
  const read = u.cache_read_input_tokens ?? 0;
  console.log(
    `${label.padEnd(5)} cache_creation=${created}  cache_read=${read}  input=${u.input_tokens}`,
  );
  return { created, read };
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      "ANTHROPIC_API_KEY is not set. This probe makes two real (cheap) API calls.\n" +
        "  ANTHROPIC_API_KEY=sk-... npm run cache-probe",
    );
    process.exit(1);
  }

  const context = readFileSync(CONTEXT_PATH, "utf8");
  const client = new Anthropic();

  console.log(`Probing prompt cache with ${MODEL} over cost/sample-context.md\n`);
  const cold = await probe(client, context, "cold");
  const warm = await probe(client, context, "warm");
  console.log();

  if (cold.created > 0 && warm.read > 0) {
    console.log(
      `Cold call wrote ${cold.created} tokens to cache; warm call read ${warm.read}. Caching works.`,
    );
  } else if (cold.created === 0) {
    console.log(
      `No cache creation. The prefix is likely below ${MODEL}'s ~4096-token cache minimum.`,
    );
  } else {
    console.log(
      "Cold wrote the cache but warm did not read it -- a silent invalidator changed the prefix between calls.",
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
