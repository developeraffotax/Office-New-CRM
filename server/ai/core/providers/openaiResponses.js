// ai/core/providers/openaiResponses.js — OpenAI Responses API (POST /v1/responses).
// Unlike /chat/completions, this allows function tools WITH reasoning. Between tool steps the model's reasoning
// items must be sent back unchanged, so each assistant turn is stored as raw items (a "provider_state" part)
// and replayed as-is. Stateless: store:false, with encrypted reasoning returned to us (no data kept at OpenAI).
import OpenAI from "openai";

/** Our normalised messages → Responses API input items. */
export function toResponsesInput(messages) {
  const input = [];
  for (const m of messages) {
    if (typeof m.content === "string") {
      input.push({ role: m.role, content: m.content });
      continue;
    }
    if (m.role === "assistant") {
      const state = m.content.find((p) => p.type === "provider_state" && p.provider === "openai_responses");
      if (state) {
        input.push(...state.items); // the turn exactly as the model produced it (reasoning + calls + text)
        continue;
      }
      const text = m.content.filter((p) => p.type === "text").map((p) => p.text).join("");
      if (text) input.push({ role: "assistant", content: text });
      for (const c of m.content.filter((p) => p.type === "tool_call")) {
        input.push({ type: "function_call", call_id: c.id, name: c.name, arguments: JSON.stringify(c.input ?? {}) });
      }
    } else {
      for (const p of m.content) {
        if (p.type === "tool_result") input.push({ type: "function_call_output", call_id: p.id, output: p.content });
      }
      const parts = m.content
        .filter((p) => (p.type === "text" && p.text) || p.type === "image")
        .map((p) => (p.type === "image" ? { type: "input_image", image_url: `data:${p.mediaType};base64,${p.data}` } : { type: "input_text", text: p.text }));
      if (parts.length) input.push({ role: "user", content: parts });
    }
  }
  return input;
}

// Reasoning tokens count toward max_output_tokens, so leave room for them or the answer gets cut off.
const REASONING_ROOM = { low: 4000, medium: 8000, high: 16000 };

/**
 * reasoningEffort: { fast, smart } per tier. "none" = no thinking, "omit" = don't send the setting,
 * otherwise low | medium | high (whatever the model accepts).
 */
export function openaiResponsesProvider({ apiKey, baseURL, reasoningEffort = {} }) {
  const client = new OpenAI({ apiKey, baseURL, maxRetries: 2, timeout: 120_000 });

  return {
    name: "openai",
    async *stream({ model, tier = "fast", system, messages, tools, maxTokens = 1200, signal }) {
      const effort = reasoningEffort[tier];
      const sendEffort = effort && effort !== "omit";
      const thinking = sendEffort && effort !== "none";

      const stream = await client.responses.create(
        {
          model,
          instructions: system,
          input: toResponsesInput(messages),
          stream: true,
          store: false,
          max_output_tokens: maxTokens + (thinking ? REASONING_ROOM[effort] ?? 8000 : 0),
          ...(sendEffort ? { reasoning: { effort } } : {}),
          ...(thinking ? { include: ["reasoning.encrypted_content"] } : {}),
          ...(tools?.length
            ? { tools: tools.map((t) => ({ type: "function", name: t.name, description: t.description, parameters: t.parameters, strict: false })) }
            : {}),
        },
        { signal }
      );

      let final = null;
      for await (const ev of stream) {
        if (ev.type === "response.output_text.delta") yield { type: "text", delta: ev.delta };
        else if (ev.type === "response.completed" || ev.type === "response.incomplete") final = ev.response;
        else if (ev.type === "response.failed") throw new Error(ev.response?.error?.message || "OpenAI response failed");
        else if (ev.type === "error") throw new Error(ev.message || "OpenAI stream error");
      }
      if (!final) throw new Error("OpenAI stream ended without a final response");

      const items = final.output ?? [];
      const calls = items.filter((i) => i.type === "function_call");
      for (const c of calls) {
        let input = {};
        try {
          input = c.arguments ? JSON.parse(c.arguments) : {};
        } catch {
          input = {};
        }
        yield { type: "tool_call", id: c.call_id, name: c.name, input };
      }
      yield { type: "state", provider: "openai_responses", items }; // the runtime keeps this for the next step
      yield {
        type: "done",
        stopReason: calls.length ? "tool_use" : final.status === "incomplete" ? "length" : "end",
        usage: {
          input: final.usage?.input_tokens ?? 0,
          output: final.usage?.output_tokens ?? 0,
          cacheRead: final.usage?.input_tokens_details?.cached_tokens ?? 0,
        },
      };
    },
  };
}