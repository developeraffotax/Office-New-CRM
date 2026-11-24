// ai/agent/chatTurn.js — one chat turn: run the agent, stream it, and save what the person saw.
import { runAgent } from "./runtime.js";
import { saveAssistant } from "../services/history.service.js";

export async function runChatTurn({ turn, user, question, scope, attachments, images, sse }) {
  const seen = { text: "", sources: [], files: [], tools: 0 };

  // Everything the agent sends to the browser passes through here, so we can store the final answer.
  const tap = {
    signal: sse.signal,
    send(event, data) {
      if (event === "token") seen.text += data.t;
      else if (event === "sources") seen.sources = data;
      else if (event === "file") seen.files.push({ id: data.id, filename: data.filename, stats: data.stats, changes: data.changes });
      else if (event === "tool" && data.status === "start") seen.tools++;
      sse.send(event, data);
    },
  };

  sse.send("conversation", { id: String(turn.conversation._id), title: turn.conversation.title, isNew: turn.isNew });

  let result;
  let failure;
  try {
    result = await runAgent({ user, question, history: turn.history, scope, attachments, images, sse: tap });
  } catch (err) {
    failure = err;
  }

  if (seen.text.trim()) {
    try {
      await saveAssistant({
        conversation: turn.conversation,
        user,
        text: seen.text,
        sources: seen.sources.filter((s) => seen.text.includes(`[${s.n}]`)), // keep only what the answer cited
        files: seen.files,
        toolsUsed: seen.tools,
        partial: Boolean(failure) || Boolean(sse.signal?.aborted), // stopped (the stream may end quietly) or failed part-way
      });
    } catch (e) {
      console.error("[chat history] could not save the answer:", e.message);
    }
  }
  if (failure) throw failure;
  return result;
}