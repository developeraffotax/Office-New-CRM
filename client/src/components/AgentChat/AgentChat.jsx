// src/pages/AgentChat.jsx
// One chat for everyone. Streams answers over SSE and shows: sources, tool progress,
// a draft form the person reviews and submits, and confirm/cancel cards for proposed changes.
// Stack: React, Tailwind, axios, react-hot-toast. Auth: see aiApi.js (getToken).
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { API, http, authHeaders, errMsg } from "./aiApi.js";

const TOOL_LABELS = {
  search_knowledge: "Searching the knowledge base",
  list_datasets: "Looking up spreadsheets",
  describe_dataset: "Reading spreadsheet columns",
  query_dataset: "Searching a spreadsheet",
  aggregate_dataset: "Calculating totals",
  get_form_schema: "Reading the form",
  propose_form_fill: "Filling in the form",
  find_user: "Finding the person",
  get_task_stats: "Counting tasks",
  list_jobs: "Looking up jobs",
};
const toolLabel = (n) => TOOL_LABELS[n] || n.replaceAll("_", " ");

const inputCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200";
const primaryBtn =
  "rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:cursor-not-allowed disabled:opacity-50";

// Minimal SSE reader for fetch() (EventSource can't POST).
async function* readSSE(res) {
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf("\n\n")) !== -1) {
      const frame = buf.slice(0, i);
      buf = buf.slice(i + 2);
      let event = "message";
      let data = "";
      for (const line of frame.split("\n")) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) data += line.slice(5).trim();
      }
      if (data) yield { event, data: JSON.parse(data) };
    }
  }
}

function DraftForm({ draft }) {
  const { form, sources = {}, errors: initialErrors = {} } = draft;
  const isFile = form.mode === "file"; // an uploaded PDF/Word form → download; a CRM form → submit
  const [values, setValues] = useState(draft.values || {});
  const [errors, setErrors] = useState(initialErrors);
  const [missing, setMissing] = useState(draft.missing || []);
  const [state, setState] = useState("idle"); // idle | saving | done
  const [file, setFile] = useState(null); // { blob, name } of the last filled file
  const [skipped, setSkipped] = useState([]);
  const set = (name, v) => setValues((x) => ({ ...x, [name]: v }));

  const download = (blob, name) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const submit = async (e) => {
    e.preventDefault();
    setState("saving");
    try {
      if (isFile) {
        const res = await http.post(`/attachments/${form.id}/fill`, { values }, { responseType: "blob" });
        const header = res.headers["x-skipped"];
        setSkipped(header ? JSON.parse(decodeURIComponent(header)) : []);
        const name = `filled-${form.title}`;
        setFile({ blob: res.data, name });
        download(res.data, name);
      } else {
        await http.post(`/forms/${form.id}/submit`, { values });
        toast.success(`${form.title} submitted`);
      }
      setErrors({});
      setMissing([]);
      setState("done");
    } catch (err) {
      setState("idle");
      let data = err.response?.data;
      if (data instanceof Blob) data = await data.text().then(JSON.parse).catch(() => ({})); // blob responses hide the JSON error
      setErrors(data?.errors || {});
      setMissing(data?.missing || []);
      toast.error(data?.message || errMsg(err));
    }
  };

  if (state === "done")
    return (
      <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
        {isFile ? (
          <>
            <p>Your filled form was downloaded.</p>
            {skipped.length > 0 && (
              <div className="mt-2 rounded-lg bg-amber-50 p-2 text-amber-900">
                <p className="font-medium">Left blank, please fill by hand:</p>
                <ul className="list-disc pl-5">
                  {skipped.map((s) => <li key={s.name}>{s.label}: {s.reason}</li>)}
                </ul>
              </div>
            )}
            <div className="mt-2 flex gap-3">
              <button type="button" className="font-medium underline" onClick={() => download(file.blob, file.name)}>Download again</button>
              <button type="button" className="font-medium underline" onClick={() => setState("idle")}>Edit and download again</button>
            </div>
          </>
        ) : (
          <p>{form.title} submitted.</p>
        )}
      </div>
    );

  const renderField = (f) => {
    const bad = errors[f.name] || (missing.includes(f.name) && "Required, not found in your data");
    const common = {
      id: `f-${form.id}-${f.name}`,
      value: values[f.name] ?? "",
      onChange: (e) => set(f.name, e.target.value),
      className: `${inputCls} ${bad ? "border-red-400" : ""}`,
    };
    return (
      <div key={f.name}>
        <label htmlFor={common.id} className="block text-xs font-medium text-gray-700">
          {f.label}
          {f.required && <span className="text-red-500"> *</span>}
        </label>
        {f.type === "select" ? (
          <select {...common}>
            <option value="">Select…</option>
            {f.options.map((o) => <option key={o}>{o}</option>)}
          </select>
        ) : f.type === "textarea" ? (
          <textarea rows={3} {...common} />
        ) : f.type === "boolean" ? (
          <select {...common} value={values[f.name] === undefined ? "" : String(values[f.name])}>
            <option value="">Not set</option>
            <option value="true">Yes / ticked</option>
            <option value="false">No / unticked</option>
          </select>
        ) : (
          <input type={{ number: "text", date: "date", email: "email" }[f.type] || "text"} inputMode={f.type === "number" ? "decimal" : undefined} {...common} />
        )}
        {bad && <p className="mt-0.5 text-xs text-red-600">{bad}</p>}
        {sources[f.name] && !bad && <p className="mt-0.5 text-xs text-gray-400">From: {sources[f.name]}</p>}
      </div>
    );
  };

  // Uploaded forms can have dozens of fields: show what was filled first, the rest tucked away.
  const filled = form.fields.filter((f) => values[f.name] !== undefined && values[f.name] !== "");
  const rest = form.fields.filter((f) => !filled.includes(f));
  const primary = isFile ? filled : form.fields;

  return (
    <form onSubmit={submit} className="mt-3 space-y-3 rounded-xl border border-orange-200 bg-white p-4">
      <div>
        <p className="text-sm font-semibold text-gray-900">{form.title} (draft)</p>
        <p className="text-xs text-gray-500">
          Filled in by the assistant: {filled.length} of {form.fields.length} fields. Check every value before {isFile ? "downloading" : "submitting"}.
        </p>
      </div>
      {primary.map(renderField)}
      {isFile && rest.length > 0 && (
        <details className="rounded-lg border border-gray-200 p-3">
          <summary className="cursor-pointer text-xs font-medium text-gray-600">Fields not filled ({rest.length}). Add any yourself.</summary>
          <div className="mt-3 space-y-3">{rest.map(renderField)}</div>
        </details>
      )}
      <div className="flex justify-end">
        <button className={primaryBtn} disabled={state === "saving"}>
          {state === "saving" ? (isFile ? "Filling…" : "Submitting…") : isFile ? "Download filled form" : "Submit"}
        </button>
      </div>
    </form>
  );
}

function ProposalCard({ proposal }) {
  const [state, setState] = useState("pending"); // pending | working | done | cancelled | failed
  const act = async (decision) => {
    setState("working");
    try {
      const { data } = await http.post(`/actions/${proposal.id}/${decision}`);
      setState(data.status === "done" ? "done" : data.status === "cancelled" ? "cancelled" : "failed");
      if (data.status === "failed") toast.error(data.error || "That didn't work");
    } catch (e) {
      setState("pending");
      toast.error(errMsg(e));
    }
  };
  return (
    <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm">
      <p className="font-medium text-gray-900">Waiting for your confirmation</p>
      <p className="mt-0.5 text-gray-700">{proposal.summary}</p>
      {state === "pending" || state === "working" ? (
        <div className="mt-3 flex gap-2">
          <button className={primaryBtn} disabled={state === "working"} onClick={() => act("confirm")}>Confirm</button>
          <button className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-white" disabled={state === "working"} onClick={() => act("cancel")}>Cancel</button>
        </div>
      ) : (
        <p className="mt-2 text-xs text-gray-600">{{ done: "Done.", cancelled: "Cancelled.", failed: "Failed." }[state]}</p>
      )}
    </div>
  );
}

function FileCard({ file }) {
  const [busy, setBusy] = useState(false);
  const s = file.stats;
  const download = async () => {
    setBusy(true);
    try {
      const res = await http.get(`/attachments/${file.id}/download`, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };
  const fmt = (v) => (v == null || v === "" ? "empty" : v instanceof Date || /^\d{4}-\d{2}-\d{2}T/.test(String(v)) ? String(v).slice(0, 10) : String(v));
  return (
    <div className="mt-3 rounded-xl border border-orange-200 bg-white p-4 text-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-gray-900" title={file.filename}>{file.filename}</p>
          {s && (
            <p className="text-xs text-gray-600">
              {s.matched.toLocaleString()} of {s.sheetRows.toLocaleString()} rows filled
              {s.unmatched > 0 && ` · ${s.unmatched.toLocaleString()} not found`}
              {s.ambiguous > 0 && ` · ${s.ambiguous.toLocaleString()} matched more than one record`}
              {s.noKey > 0 && ` · ${s.noKey.toLocaleString()} had no value to match on`}
            </p>
          )}
        </div>
        <button className={primaryBtn} onClick={download} disabled={busy}>{busy ? "Preparing…" : "Download"}</button>
      </div>
      {file.changes?.length > 0 && (
        <details className="mt-2 text-xs text-gray-600">
          <summary className="cursor-pointer">What changed (first {file.changes.length})</summary>
          <ul className="mt-1 space-y-0.5">
            {file.changes.map((c, i) => (
              <li key={i}><span className="font-mono">{c.cell}</span>: {fmt(c.was)} → {fmt(c.now)}</li>
            ))}
          </ul>
        </details>
      )}
      <p className="mt-2 text-xs text-gray-400">This is a new copy. Your original file is unchanged.</p>
    </div>
  );
}

function Message({ m }) {
  if (m.role === "user")
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl bg-orange-500 px-4 py-2 text-sm text-white">{m.content}</div>
      </div>
    );
  const running = (m.tools || []).filter((t) => t.status === "start");
  return (
    <div className="max-w-[90%]">
      {running.map((t) => (
        <p key={t.id} className="mb-1 flex items-center gap-2 text-xs text-gray-500">
          <span className="h-2 w-2 animate-pulse rounded-full bg-orange-400" />
          {toolLabel(t.name)}…
        </p>
      ))}
      {(m.content || m.error) && (
        <div className={`whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${m.error ? "bg-red-50 text-red-700" : "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"}`}>
          {m.error || m.content}
        </div>
      )}
      {m.draft && <DraftForm draft={m.draft} />}
      {m.files?.map((f) => <FileCard key={f.id} file={f} />)}
      {m.proposals?.map((p) => <ProposalCard key={p.id} proposal={p} />)}
      {m.sources?.length > 0 && m.done && (
        <details className="mt-1 text-xs text-gray-500">
          <summary className="cursor-pointer">Sources ({m.sources.length})</summary>
          <ul className="mt-1 space-y-0.5">
            {m.sources.map((s) => (
              <li key={s.n}>[{s.n}] {s.project} › {s.product} › {s.file}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

export default function AgentChat({ suggestions = ["What's our process for onboarding a new client?", "Which spreadsheets can you look things up in?"] }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [attachments, setAttachments] = useState([]); // any attached files: [{ id, filename, label, summary }]
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const abortRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages]);
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

  return (
    <div className="flex h-full min-h-[500px] flex-col bg-gray-50">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="mx-auto mt-16 max-w-md text-center">
            <h1 className="text-lg font-semibold text-gray-900">Ask me anything</h1>
            <p className="mt-1 text-sm text-gray-600">I can answer from your company's documents and spreadsheets. Attach a PDF, Word, Excel, CSV or image and I'll read it, fill it in from your stored data, or work on it.</p>
            <div className="mt-4 flex flex-col gap-2">
              {suggestions.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-200">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => <Message key={i} m={m} />)
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={(e) => (e.preventDefault(), send(input))} className="border-t bg-white p-3">
        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {attachments.map((a) => (
              <span key={a.id} className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs text-orange-800">
                {a.filename}{a.summary ? ` · ${a.summary}` : ""}
                <button type="button" aria-label={`Remove ${a.filename}`} className="ml-1 font-bold hover:text-orange-950" onClick={() => setAttachments((x) => x.filter((y) => y.id !== a.id))}>×</button>
              </span>
            ))}
          </div>
        )}
        <div className="flex items-end gap-2">
        <input ref={fileRef} type="file" accept=".pdf,.docx,.xlsx,.csv,.pptx,.txt,.md,.json,.png,.jpg,.jpeg,.webp,.gif" className="hidden" onChange={(e) => attach(e.target.files?.[0])} />
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading || busy} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:opacity-50">
          {uploading ? "Reading…" : "Attach file"}
        </button>
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
          placeholder={attachments.length ? "What should I do with the file? e.g. Fill in the fees from our stored data" : "Ask a question…"}
          aria-label="Message"
          className={`${inputCls} max-h-32 resize-none`}
        />
        {busy ? (
          <button type="button" onClick={() => abortRef.current?.abort()} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Stop</button>
        ) : (
          <button className={primaryBtn} disabled={!input.trim()}>Send</button>
        )}
        </div>
      </form>
    </div>
  );
}
