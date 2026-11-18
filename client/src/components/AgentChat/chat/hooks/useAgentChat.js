import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { API, http, authHeaders, errMsg } from "../../aiApi.js";
import { readSSE } from "../utils/readSSE.js";

// All chat state + networking: streaming answers, attachments, abort.
export default function useAgentChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [attachments, setAttachments] = useState([]); // any attached files: [{ id, filename, label, summary }]
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const attach = async (file) => {
    if (!file) return;
    const body = new FormData();
    body.append("file", file);
    setUploading(true);
    try {
      const { data } = await http.post("/attachments", body);
      setAttachments((a) => [...a.slice(-4), data]); // up to 5 at a time
      toast.success(`Added ${data.filename}${data.summary ? ` (${data.summary})` : ""}`);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeAttachment = (id) => setAttachments((x) => x.filter((y) => y.id !== id));

  const patchLast = (fn) => setMessages((all) => [...all.slice(0, -1), fn(all[all.length - 1])]);

  const send = async (text) => {
    const question = text.trim();
    if (!question || busy) return;
    const history = messages.filter((m) => m.content && !m.error).map((m) => ({ role: m.role, content: m.content }));
    setMessages((all) => [...all, { role: "user", content: question }, { role: "assistant", content: "", tools: [], proposals: [] }]);
    setInput("");
    setBusy(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch(`${API}/agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ question, history, attachmentIds: attachments.map((a) => a.id) }),
        signal: ctrl.signal,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Request failed (${res.status})`);
      }
      for await (const { event, data } of readSSE(res)) {
        if (event === "token") patchLast((m) => ({ ...m, content: m.content + data.t }));
        else if (event === "sources") patchLast((m) => ({ ...m, sources: data }));
        else if (event === "tool")
          patchLast((m) => {
            const rest = m.tools.filter((t) => t.id !== data.id);
            return { ...m, tools: [...rest, { id: data.id, name: data.name, status: data.status }] };
          });
        else if (event === "draft") patchLast((m) => ({ ...m, draft: data }));
        else if (event === "file") patchLast((m) => ({ ...m, files: [...(m.files || []), data] }));
        else if (event === "proposal") patchLast((m) => ({ ...m, proposals: [...m.proposals, data] }));
        else if (event === "error") patchLast((m) => ({ ...m, error: data.message }));
        else if (event === "done") patchLast((m) => ({ ...m, done: true }));
      }
    } catch (e) {
      if (e.name !== "AbortError") patchLast((m) => ({ ...m, error: e.message || "Something went wrong" }));
    } finally {
      patchLast((m) => ({ ...m, done: true, tools: [] }));
      setBusy(false);
      abortRef.current = null;
    }
  };

  const stop = () => abortRef.current?.abort();

  return { messages, input, setInput, busy, attachments, removeAttachment, uploading, fileRef, attach, send, stop };
}
