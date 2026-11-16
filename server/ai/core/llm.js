// ai/core/llm.js — the only LLM entry point the rest of the app uses.
import { aiConfig } from "../config.js";
import { getProvider } from "./providers/index.js";
export { embed, embedQuery, EMBED_ID } from "./embeddings.js";

export function resolveModel(tier = "fast", provider = aiConfig.provider) {
  const model = aiConfig.models[provider]?.[tier];
  if (!model) {
    throw new Error(`No "${tier}" model configured for provider "${provider}". Set the ${provider.toUpperCase()}_${tier.toUpperCase()}_MODEL env var.`);
  }
  return model;
}

/** Stream one model turn. Yields text / tool_call / done events (see providers/anthropic.js). */
export function streamLLM({ tier = "fast", provider = aiConfig.provider, ...opts }) {
  return getProvider(provider).stream({ model: resolveModel(tier, provider), ...opts });
}
