// ai/core/embeddings.js — switchable embeddings. Every chunk stores EMBED_ID so vectors from
// different models are never compared with each other.
import OpenAI from "openai";
import { aiConfig } from "../config.js";

const { provider, model, dims } = aiConfig.embeddings;
export const EMBED_ID = `${provider}:${model}:${dims}`;
const BATCH = 64;
const env = process.env;

async function voyage(texts, inputType) {
  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.VOYAGE_API_KEY}` },
    body: JSON.stringify({ input: texts, model, input_type: inputType, output_dimension: dims }),
  });
  if (!res.ok) throw new Error(`Voyage embeddings failed (${res.status}): ${await res.text()}`);
  const json = await res.json();
  return json.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
}

const clients = {};
async function openaiLike(texts, key, opts) {
  clients[key] ??= new OpenAI({ maxRetries: 2, ...opts });
  const res = await clients[key].embeddings.create({ model, input: texts, dimensions: dims });
  return res.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
}

const impl = {
  voyage,
  openai: (t) => openaiLike(t, "openai", { apiKey: env.OPENAI_API_KEY }),
  google: (t) =>
    openaiLike(t, "google", {
      apiKey: env.GOOGLE_API_KEY,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    }),
};

/** inputType: "document" when indexing, "query" when searching (only some providers use it). */
export async function embed(texts, inputType = "document") {
  const run = impl[provider];
  if (!run) throw new Error(`Unknown EMBED_PROVIDER "${provider}"`);
  const list = Array.isArray(texts) ? texts : [texts];
  const out = [];
  for (let i = 0; i < list.length; i += BATCH) out.push(...(await run(list.slice(i, i + BATCH), inputType)));
  return out;
}

export const embedQuery = async (q) => (await embed(q, "query"))[0];
