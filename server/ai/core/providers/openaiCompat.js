// ai/core/providers/openaiCompat.js
// One adapter for OpenAI AND anything that speaks the OpenAI Chat Completions API
// (Gemini's OpenAI-compatible endpoint, OpenRouter, Groq, Azure, Ollama, ...). Switch via baseURL.
import OpenAI from "openai";
import { randomUUID } from "node:crypto";

export function toOpenAIMessages(system, messages) {
  const out = [{ role: "system", content: system }];
  for (const m of messages) {
    if (typeof m.content === "string") {
      out.push({ role: m.role, content: m.content });
      continue;
    }
    if (m.role === "assistant") {
      const text = m.content.filter((p) => p.type === "text").map((p) => p.text).join("");
      const calls = m.content.filter((p) => p.type === "tool_call");
      out.push({
        role: "assistant",
        content: text || null,
        ...(calls.length
          ? {
              tool_calls: calls.map((c) => ({
                id: c.id,
                type: "function",
                function: { name: c.name, arguments: JSON.stringify(c.input ?? {}) },
              })),
            }
          : {}),
      });
    } else {
      // user turn: tool results become role:"tool" messages, any text stays a user message
      for (const p of m.content) {
        if (p.type === "tool_result") out.push({ role: "tool", tool_call_id: p.id, content: p.content });
      }
      const text = m.content.filter((p) => p.type === "text").map((p) => p.text).join("");
      const images = m.content.filter((p) => p.type === "image");
      if (images.length) {
        out.push({
          role: "user",
          content: [
            ...images.map((p) => ({ type: "image_url", image_url: { url: `data:${p.mediaType};base64,${p.data}` } })),
            { type: "text", text },
          ],
        });
      } else if (text) out.push({ role: "user", content: text });
    }
  }
  return out;
}

export const toOpenAITools = (tools = []) =>
  tools.map((t) => ({ type: "function", function: { name: t.name, description: t.description, parameters: t.parameters } }));

export function openaiCompatProvider({ name = "openai", apiKey, baseURL, maxTokensParam = "max_completion_tokens" }) {
  const client = new OpenAI({ apiKey, baseURL, maxRetries: 2, timeout: 60_000 });

  return {
    name,
    async *stream({ model, system, messages, tools, maxTokens = 1200, signal }) {
      const stream = await client.chat.completions.create(
        {
          model,
          stream: true,
          stream_options: { include_usage: true },
          [maxTokensParam]: maxTokens,
          messages: toOpenAIMessages(system, messages),
          ...(tools?.length ? { tools: toOpenAITools(tools) } : {}),
        },
        { signal }
      );

      const calls = new Map(); // index → { id, name, args }
      let finish = "stop";
      let usage = { input: 0, output: 0, cacheRead: 0 };

      for await (const chunk of stream) {
        if (chunk.usage) {
          usage = {
            input: chunk.usage.prompt_tokens ?? 0,
            output: chunk.usage.completion_tokens ?? 0,
            cacheRead: chunk.usage.prompt_tokens_details?.cached_tokens ?? 0,
          };
        }
        const choice = chunk.choices?.[0];
        if (!choice) continue;
        if (choice.delta?.content) yield { type: "text", delta: choice.delta.content };

        for (const tc of choice.delta?.tool_calls ?? []) {
          // Some compatible servers omit index/id on streamed calls; fall back sensibly.
          const idx = tc.index ?? (tc.id ? calls.size : Math.max(calls.size - 1, 0));
          const cur = calls.get(idx) ?? { id: tc.id || `call_${randomUUID()}`, name: "", args: "" };
          if (tc.id) cur.id = tc.id;
          if (tc.function?.name) cur.name += tc.function.name;
          if (tc.function?.arguments) cur.args += tc.function.arguments;
          calls.set(idx, cur);
        }
        if (choice.finish_reason) finish = choice.finish_reason;
      }

      for (const c of calls.values()) {
        let input = {};
        try {
          input = c.args ? JSON.parse(c.args) : {};
        } catch {
          input = {};
        }
        yield { type: "tool_call", id: c.id, name: c.name, input };
      }
      yield {
        type: "done",
        stopReason: calls.size ? "tool_use" : finish === "length" ? "length" : "end",
        usage,
      };
    },
  };
}
