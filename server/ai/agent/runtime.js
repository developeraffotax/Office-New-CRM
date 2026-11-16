// ai/agent/runtime.js — the one agent loop.
//   auth → profile → pre-retrieval → [LLM turn → run tools in parallel]* → answer, with an audit row.
// npm i ajv
import Ajv from "ajv";
import { streamLLM, resolveModel } from "../core/llm.js";
import { aiConfig } from "../config.js";
import { BASE_SYSTEM, buildFirstTurn, sourcesForClient } from "../core/prompts.js";
import { retrieve } from "../rag/retrieve.js";
import { profileFor } from "./profiles.js";
import { toolsFor } from "./tools/index.js";
import { ToolError, withTimeout } from "./toolkit.js";
import { AiAudit } from "../models/agent.models.js";

const ajv = new Ajv({ allErrors: true, coerceTypes: true, useDefaults: true, strict: false });
const MAX_TOOL_CHARS = 12_000;
const TOOL_TIMEOUT_MS = 20_000;

export async function runAgent({ user, question, history = [], scope = {}, attachments = [], images = [], sse }) {
  const profile = profileFor(user);
  const tools = toolsFor(profile.tools);
  const validators = new Map(tools.map((t) => [t.name, ajv.compile(t.parameters)]));
  const toolSpecs = tools.map(({ name, description, parameters }) => ({ name, description, parameters }));
  const system = `${BASE_SYSTEM}\n\n${profile.system}`;

  const t0 = Date.now();
  const audit = { tools: [], steps: 0, usage: { input: 0, output: 0, cacheRead: 0 } };
  let outcome = "ok";

  // Numbered sources shared by pre-retrieval and search_knowledge, so [n] citations stay consistent.
  const sources = [];
  const ctx = {
    user,
    scope,
    attachments, // files attached to this request: [{ id, filename, kind, label, summary, fieldCount }]
    emit: sse.send,
    addSources(chunks) {
      const numbered = chunks.map((chunk) => {
        let i = sources.findIndex((s) => String(s._id) === String(chunk._id));
        if (i === -1) i = sources.push(chunk) - 1;
        return { n: i + 1, chunk };
      });
      sse.send("sources", sourcesForClient(sources));
      return numbered;
    },
  };

  try {
    // 1. Pre-retrieval: one fast vector+keyword search before the model starts.
    if (question.length >= 4) {
      const prev = [...history].reverse().find((m) => m.role === "user")?.content;
      const query = prev ? `${prev}\n${question}` : question;
      const chunks = await retrieve({ query, user, ...scope }).catch((e) => (console.error("[agent] retrieval:", e.message), []));
      ctx.addSources(chunks);
    }

    const first = buildFirstTurn({ question, chunks: sources, files: attachments });
    const messages = [...history, { role: "user", content: images.length ? [...images, { type: "text", text: first }] : first }];

    // 2. The loop.
    let finished = false;
    for (let step = 0; step < profile.maxSteps && !finished; step++) {
      audit.steps++;
      const calls = [];
      let text = "";

      for await (const ev of streamLLM({ tier: profile.tier, system, messages, tools: toolSpecs, maxTokens: profile.maxTokens, signal: sse.signal })) {
        if (ev.type === "text") {
          text += ev.delta;
          sse.send("token", { t: ev.delta });
        } else if (ev.type === "tool_call") calls.push(ev);
        else if (ev.type === "done") {
          audit.usage.input += ev.usage?.input ?? 0;
          audit.usage.output += ev.usage?.output ?? 0;
          audit.usage.cacheRead += ev.usage?.cacheRead ?? 0;
        }
      }

      if (!calls.length) {
        finished = true;
        break;
      }

      messages.push({
        role: "assistant",
        content: [...(text ? [{ type: "text", text }] : []), ...calls.map((c) => ({ type: "tool_call", id: c.id, name: c.name, input: c.input }))],
      });
      const results = await Promise.all(calls.map((c) => runTool(c)));
      messages.push({ role: "user", content: results });
    }

    if (!finished) {
      outcome = "max_steps";
      sse.send("token", { t: "\n\nI couldn't finish this in the steps I'm allowed. Try a narrower question." });
    }

    async function runTool(call) {
      const tool = tools.find((t) => t.name === call.name);
      const started = Date.now();
      sse.send("tool", { id: call.id, name: call.name, status: "start" });
      let ok = true;
      let out;
      try {
        if (!tool) throw new ToolError(`Unknown tool "${call.name}".`);
        const input = structuredClone(call.input ?? {});
        const validate = validators.get(call.name);
        if (!validate(input)) throw new ToolError(`Invalid arguments: ${ajv.errorsText(validate.errors)}`);
        out = await withTimeout(tool.execute(input, ctx), TOOL_TIMEOUT_MS, call.name);
      } catch (err) {
        ok = false;
        if (err instanceof ToolError) out = { error: err.message };
        else {
          console.error(`[agent] tool ${call.name} failed:`, err);
          out = { error: "The tool failed unexpectedly." }; // never leak internals to the model
        }
      }
      let content = JSON.stringify(out ?? null);
      const chars = content.length;
      if (chars > MAX_TOOL_CHARS) content = `${content.slice(0, MAX_TOOL_CHARS)} …[truncated]`;
      const ms = Date.now() - started;
      audit.tools.push({ name: call.name, ms, ok, args: JSON.stringify(call.input ?? {}).slice(0, 300), resultChars: chars });
      sse.send("tool", { id: call.id, name: call.name, status: ok ? "end" : "error", ms });
      return { type: "tool_result", id: call.id, content, isError: !ok };
    }
  } catch (err) {
    outcome = sse.signal.aborted ? "aborted" : "error";
    throw err;
  } finally {
    AiAudit.create({
      userId: user._id,
      role: user.role,
      profile: profile.name,
      provider: aiConfig.provider,
      model: (() => { try { return resolveModel(profile.tier); } catch { return null; } })(),
      question: question.slice(0, 500),
      steps: audit.steps,
      tools: audit.tools,
      usage: audit.usage,
      ms: Date.now() - t0,
      outcome,
    }).catch((e) => console.error("[agent] audit:", e.message));
  }
  return { ms: Date.now() - t0 };
}
