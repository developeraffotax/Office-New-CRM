// ai/core/providers/index.js — picks the adapter from config. Add a provider = add one line here.
import { aiConfig } from "../../config.js";
import { anthropicProvider } from "./anthropic.js";
import { openaiCompatProvider } from "./openaiCompat.js";
import { openaiResponsesProvider } from "./openaiResponses.js";

const env = process.env;

const factories = {
  anthropic: () => anthropicProvider({ apiKey: env.ANTHROPIC_API_KEY }),
  openai: () =>
    env.OPENAI_API === "responses"
      ? // Responses API: tools AND reasoning together (set OPENAI_API=responses)
        openaiResponsesProvider({
          apiKey: env.OPENAI_API_KEY,
          reasoningEffort: { fast: env.OPENAI_FAST_REASONING ?? "none", smart: env.OPENAI_SMART_REASONING ?? "medium" },
        })
      : openaiCompatProvider({
      name: "openai",
      apiKey: env.OPENAI_API_KEY,
      maxTokensParam: "max_completion_tokens",
      reasoningEffort: env.OPENAI_REASONING_EFFORT ?? "none", // tools + reasoning need the Responses API; "none" works on chat/completions
    }),
  google: () =>
    openaiCompatProvider({
      name: "google",
      apiKey: env.GOOGLE_API_KEY,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      maxTokensParam: "max_tokens",
      reasoningEffort: env.GOOGLE_REASONING_EFFORT, // unset = not sent
    }),
  compat: () =>
    openaiCompatProvider({
      name: "compat",
      apiKey: env.COMPAT_API_KEY,
      baseURL: env.COMPAT_BASE_URL,
      maxTokensParam: "max_tokens",
      reasoningEffort: env.COMPAT_REASONING_EFFORT,
    }),
};

const cache = new Map();
export function getProvider(name = aiConfig.provider) {
  if (!factories[name]) throw new Error(`Unknown AI provider "${name}". Use one of: ${Object.keys(factories).join(", ")}`);
  if (!cache.has(name)) cache.set(name, factories[name]());
  return cache.get(name);
}