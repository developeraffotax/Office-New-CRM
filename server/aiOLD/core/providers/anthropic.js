// ai/core/providers/anthropic.js
// Adapter contract (same for every provider):
//   stream({ model, system, messages, tools, maxTokens, signal }) → async iterator of
//     { type: "text", delta } | { type: "tool_call", id, name, input } | { type: "done", stopReason, usage }
// Internal message format:
//   { role: "user"|"assistant", content: string | Part[] }
//   Part = { type:"text", text } | { type:"tool_call", id, name, input } | { type:"tool_result", id, content, isError }
import Anthropic from "@anthropic-ai/sdk";

export function toAnthropicMessages(messages) {
  return messages.map((m) => {
    if (typeof m.content === "string") return { role: m.role, content: m.content };
    const content = m.content
      .map((p) => {
        if (p.type === "text") return p.text ? { type: "text", text: p.text } : null;
        if (p.type === "tool_call") return { type: "tool_use", id: p.id, name: p.name, input: p.input ?? {} };
        if (p.type === "tool_result")
          return { type: "tool_result", tool_use_id: p.id, content: p.content, ...(p.isError ? { is_error: true } : {}) };
        if (p.type === "image") return { type: "image", source: { type: "base64", media_type: p.mediaType, data: p.data } };
        return null;
      })
      .filter(Boolean);
    return { role: m.role, content };
  });
}

export const toAnthropicTools = (tools = []) =>
  tools.map((t) => ({ name: t.name, description: t.description, input_schema: t.parameters }));

export function anthropicProvider({ apiKey }) {
  const client = new Anthropic({ apiKey, maxRetries: 2, timeout: 60_000 });

  return {
    name: "anthropic",
    async *stream({ model, system, messages, tools, maxTokens = 1200, signal }) {
      const stream = client.messages.stream(
        {
          model,
          max_tokens: maxTokens,
          // cache breakpoint after tools + system: both are static per profile
          system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
          messages: toAnthropicMessages(messages),
          ...(tools?.length ? { tools: toAnthropicTools(tools) } : {}),
        },
        { signal }
      );

      const pending = new Map(); // content-block index → { id, name, json }
      for await (const ev of stream) {
        if (ev.type === "content_block_start" && ev.content_block.type === "tool_use") {
          pending.set(ev.index, { id: ev.content_block.id, name: ev.content_block.name, json: "" });
        } else if (ev.type === "content_block_delta") {
          if (ev.delta.type === "text_delta") yield { type: "text", delta: ev.delta.text };
          else if (ev.delta.type === "input_json_delta") pending.get(ev.index).json += ev.delta.partial_json;
        } else if (ev.type === "content_block_stop" && pending.has(ev.index)) {
          const t = pending.get(ev.index);
          pending.delete(ev.index);
          let input = {};
          try {
            input = t.json ? JSON.parse(t.json) : {};
          } catch {
            input = {};
          }
          yield { type: "tool_call", id: t.id, name: t.name, input };
        }
      }

      const final = await stream.finalMessage();
      yield {
        type: "done",
        stopReason: final.stop_reason === "tool_use" ? "tool_use" : final.stop_reason === "max_tokens" ? "length" : "end",
        usage: {
          input: final.usage.input_tokens,
          output: final.usage.output_tokens,
          cacheRead: final.usage.cache_read_input_tokens ?? 0,
        },
      };
    },
  };
}