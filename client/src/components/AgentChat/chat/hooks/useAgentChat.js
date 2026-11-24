import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { API, http, authHeaders, errMsg } from "../../aiApi.js";
import { readSSE } from "../utils/readSSE.js";

// All chat state + networking: streaming answers, saved chats, attachments, abort.
export default function useAgentChat() {
  const [me, setMe] = useState(null); // { name, role } for the welcome message
  const [conversations, setConversations] = useState([]); // saved chats, newest first
  const [loadingList, setLoadingList] = useState(true);
  const [conversationId, setConversationId] = useState(null); // null = a new chat
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [attachments, setAttachments] = useState([]); // any attached files: [{ id, filename, label, summary }]
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Who is signed in (welcome message) and their saved chats.
  useEffect(() => {
    http.get("/me").then((r) => setMe(r.data)).catch(() => {});
    http
      .get("/conversations")
      .then((r) => setConversations(r.data))
      .catch(() => {}) // the chat still works without the list
      .finally(() => setLoadingList(false));
  }, []);

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

  const patchLast = (fn) => setMessages((all) => (all.length ? [...all.slice(0, -1), fn(all[all.length - 1])] : all));

  // ---- saved chats ----
  const newChat = () => {
    abortRef.current?.abort();
    setConversationId(null);
    setMessages([]);
    setAttachments([]); // attached files belong to the chat they were added in
    setInput("");
  };

  const openConversation = async (id) => {
    if (busy || id === conversationId) return;
    try {
      const { data } = await http.get(`/conversations/${id}/messages`);
      setMessages(data.messages.map((m) => ({ ...m, done: true, tools: [], proposals: [] })));
      setConversationId(id);
      setAttachments([]); // attached files expire after a week, so they are not carried into an old chat
      setInput("");
    } catch (e) {
      toast.error(errMsg(e));
      http.get("/conversations").then((r) => setConversations(r.data)).catch(() => {});
    }
  };

  const removeConversation = async (c) => {
    if (busy) return;
    if (!window.confirm(`Delete "${c.title}"? This cannot be undone.`)) return;
    try {
      await http.delete(`/conversations/${c.id}`);
      setConversations((list) => list.filter((x) => x.id !== c.id));
      if (c.id === conversationId) newChat();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const send = async (text) => {
    const question = text.trim();
    if (!question || busy) return;
    const attached = attachments;
    setMessages((all) => [
      ...all,
      { role: "user", content: question, attachments: attached.map((a) => ({ filename: a.filename })) },
      { role: "assistant", content: "", tools: [], proposals: [], toolsUsed: 0 },
    ]);
    setInput("");
    setBusy(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      // The server keeps the chat history. We only say which chat this message belongs to.
      const res = await fetch(`${API}/agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ question, conversationId, attachmentIds: attached.map((a) => a.id) }),
        signal: ctrl.signal,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Request failed (${res.status})`);
      }
      for await (const { event, data } of readSSE(res)) {
        if (event === "conversation") {
          setConversationId(data.id);
          setConversations((list) => [{ id: data.id, title: data.title, lastMessageAt: new Date().toISOString() }, ...list.filter((c) => c.id !== data.id)]);
        } else if (event === "token") patchLast((m) => ({ ...m, content: m.content + data.t }));
        else if (event === "sources") patchLast((m) => ({ ...m, sources: data }));
        else if (event === "tool")
          patchLast((m) => {
            const rest = m.tools.filter((t) => t.id !== data.id);
            return { ...m, toolsUsed: m.toolsUsed + (data.status === "start" ? 1 : 0), tools: [...rest, { id: data.id, name: data.name, status: data.status }] };
          });
        else if (event === "draft") patchLast((m) => ({ ...m, draft: data }));
        else if (event === "file") patchLast((m) => ({ ...m, files: [...(m.files || []), data] }));
        else if (event === "proposal") patchLast((m) => ({ ...m, proposals: [...m.proposals, data] }));
        else if (event === "error") patchLast((m) => ({ ...m, error: data.message }));
        else if (event === "done") patchLast((m) => ({ ...m, done: true }));
      }
    } catch (e) {
      if (e.name !== "AbortError") {
        patchLast((m) => ({ ...m, error: e.message || "Something went wrong" }));
        if (/not found/i.test(e.message || "")) setConversationId(null); // the saved chat is gone: the next message starts a new one
      }
    } finally {
      patchLast((m) => ({ ...m, done: true, tools: [], partial: m.partial || ctrl.signal.aborted }));
      setBusy(false);
      abortRef.current = null;
    }
  };

  const stop = () => abortRef.current?.abort();

  return {
    me, conversations, loadingList, conversationId, newChat, openConversation, removeConversation,
    messages, input, setInput, busy, attachments, removeAttachment, uploading, fileRef, attach, send, stop,
  };
}