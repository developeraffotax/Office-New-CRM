import { useState, useEffect, useCallback, useRef } from "react";

// ── Config ────────────────────────────────────────────────────────────────────
const API_BASE = "http://localhost:3001/api/signatures";

// ── API helpers ───────────────────────────────────────────────────────────────
const api = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}${qs ? `?${qs}` : ""}`).then((r) => r.json());
  },
  get: (id) => fetch(`${API_BASE}/${id}`).then((r) => r.json()),
  create: (body) =>
    fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json()),
  update: (id, body) =>
    fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json()),
  remove: (id) =>
    fetch(`${API_BASE}/${id}`, { method: "DELETE" }).then((r) => r.json()),
  setDefault: (id) =>
    fetch(`${API_BASE}/${id}/set-default`, { method: "POST" }).then((r) =>
      r.json()
    ),
};

// ── Icons (inline SVG) ────────────────────────────────────────────────────────
const Icon = ({ name, size = 16 }) => {
  const icons = {
    plus: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    edit: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    trash: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
      </svg>
    ),
    star: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    starOutline: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    eye: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    code: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    save: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
      </svg>
    ),
    x: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    search: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    copy: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
    ),
  };
  return icons[name] || null;
};

// ── Toast ─────────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = (msg, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  };
  return { toasts, toast: push };
}

function Toaster({ toasts }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          background: t.type === "error" ? "#ff4444" : "#f3f2ef",
          color: "#fff",
          padding: "10px 16px",
          borderRadius: 8,
          fontSize: 13,
          fontFamily: "'DM Mono', monospace",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          animation: "slideUp 0.2s ease",
          borderLeft: `3px solid ${t.type === "error" ? "#ff8888" : "#8b5cf6"}`,
        }}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ── Signature Card ────────────────────────────────────────────────────────────
function SignatureCard({ sig, onEdit, onDelete, onSetDefault }) {
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyHtml = () => {
    navigator.clipboard.writeText(sig.html);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{
      background: "#111",
      border: "1px solid #222",
      borderRadius: 12,
      overflow: "hidden",
      transition: "border-color 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "#333"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "#222"}
    >
      {/* Header */}
      <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #f3f2ef" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, color: "#1a1916", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {sig.name}
            </span>
            {sig.is_default && (
              <span style={{ background: "#ede9fb", color: "#a78bfa", fontSize: 10, padding: "2px 7px", borderRadius: 99, fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>
                DEFAULT
              </span>
            )}
          </div>
          {sig.tags?.length > 0 && (
            <div style={{ display: "flex", gap: 4, marginTop: 5, flexWrap: "wrap" }}>
              {sig.tags.map(tag => (
                <span key={tag} style={{ background: "#f3f2ef", color: "#666", fontSize: 10, padding: "1px 7px", borderRadius: 99, fontFamily: "'DM Mono', monospace", border: "1px solid #e4e2dc" }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <Btn icon="copy" title={copied ? "Copied!" : "Copy HTML"} onClick={copyHtml} active={copied} />
          <Btn icon="eye" title="Toggle preview" onClick={() => setShowPreview(v => !v)} active={showPreview} />
          <Btn icon={sig.is_default ? "star" : "starOutline"} title="Set as default" onClick={() => onSetDefault(sig.id)} accent={sig.is_default} />
          <Btn icon="edit" title="Edit" onClick={() => onEdit(sig)} />
          <Btn icon="trash" title="Delete" onClick={() => onDelete(sig)} danger />
        </div>
      </div>

      {/* Preview */}
      {showPreview && (
        <div style={{ background: "#fff", padding: 20, borderTop: "1px solid #f3f2ef" }}>
          <div dangerouslySetInnerHTML={{ __html: sig.html }} />
        </div>
      )}

      {/* Meta */}
      <div style={{ padding: "8px 16px", display: "flex", justifyContent: "flex-end" }}>
        <span style={{ fontSize: 10, color: "#444", fontFamily: "'DM Mono', monospace" }}>
          {new Date(sig.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      </div>
    </div>
  );
}

function Btn({ icon, title, onClick, active, accent, danger }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: active ? "#1e1040" : "transparent",
        border: "1px solid",
        borderColor: active ? "#5b35c7" : danger ? "transparent" : "#e4e2dc",
        borderRadius: 7,
        color: danger ? "#ff5555" : accent ? "#f59e0b" : active ? "#a78bfa" : "#555",
        cursor: "pointer",
        padding: "5px 7px",
        display: "flex",
        alignItems: "center",
        transition: "all 0.15s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = danger ? "#2a0a0a" : active ? "#250f5a" : "#f3f2ef";
        e.currentTarget.style.color = danger ? "#ff7777" : accent ? "#fbbf24" : active ? "#c4b5fd" : "#888";
        e.currentTarget.style.borderColor = danger ? "#5a0000" : active ? "#5b35c7" : "#333";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = active ? "#1e1040" : "transparent";
        e.currentTarget.style.color = danger ? "#ff5555" : accent ? "#f59e0b" : active ? "#a78bfa" : "#555";
        e.currentTarget.style.borderColor = active ? "#5b35c7" : danger ? "transparent" : "#e4e2dc";
      }}
    >
      <Icon name={icon} size={14} />
    </button>
  );
}

// ── Editor Modal ──────────────────────────────────────────────────────────────
function EditorModal({ sig, onSave, onClose, saving }) {
  const [name, setName] = useState(sig?.name || "");
  const [html, setHtml] = useState(sig?.html || "");
  const [tagsInput, setTagsInput] = useState(sig?.tags?.join(", ") || "");
  const [isDefault, setIsDefault] = useState(sig?.is_default || false);
  const [tab, setTab] = useState("code");
  const textareaRef = useRef();

  const handleSave = () => {
    const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
    onSave({ name, html, tags, is_default: isDefault });
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      backdropFilter: "blur(4px)",
    }}>
      <div style={{
        background: "#ffffff",
        border: "1px solid #222",
        borderRadius: 16,
        width: "100%",
        maxWidth: 820,
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
      }}>
        {/* Modal Header */}
        <div style={{ padding: "18px 20px", borderBottom: "1px solid #f3f2ef", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#5b35c7" }} />
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15, color: "#1a1916", flex: 1 }}>
            {sig ? "Edit Signature" : "New Signature"}
          </span>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#555", cursor: "pointer", padding: 4, display: "flex" }}>
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Form */}
        <div style={{ padding: "20px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Name + Default row */}
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Signature Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Sales Team Footer"
                style={inputStyle}
              />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", paddingBottom: 10, color: "#888", fontSize: 13, fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>
              <div
                onClick={() => setIsDefault(v => !v)}
                style={{
                  width: 36, height: 20, borderRadius: 99, background: isDefault ? "#5b35c7" : "#222",
                  position: "relative", transition: "background 0.2s", cursor: "pointer", flexShrink: 0,
                  border: "1px solid",
                  borderColor: isDefault ? "#9f67ff" : "#333",
                }}
              >
                <div style={{
                  position: "absolute", top: 2, left: isDefault ? 17 : 2, width: 14, height: 14,
                  borderRadius: "50%", background: "#fff", transition: "left 0.2s",
                }} />
              </div>
              Set as default
            </label>
          </div>

          {/* Tags */}
          <div>
            <label style={labelStyle}>Tags <span style={{ color: "#444" }}>(comma separated)</span></label>
            <input
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="e.g. sales, newsletter, support"
              style={inputStyle}
            />
          </div>

          {/* Code / Preview Tabs */}
          <div>
            <div style={{ display: "flex", gap: 2, marginBottom: 10 }}>
              {["code", "preview"].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  background: tab === t ? "#1a1040" : "transparent",
                  border: "1px solid",
                  borderColor: tab === t ? "#5b35c7" : "#e4e2dc",
                  color: tab === t ? "#c4b5fd" : "#555",
                  borderRadius: 8,
                  padding: "6px 14px",
                  cursor: "pointer",
                  fontSize: 12,
                  fontFamily: "'DM Mono', monospace",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.15s",
                }}>
                  <Icon name={t === "code" ? "code" : "eye"} size={12} />
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {tab === "code" ? (
              <textarea
                ref={textareaRef}
                value={html}
                onChange={e => setHtml(e.target.value)}
                placeholder="Paste your HTML signature here…"
                style={{
                  ...inputStyle,
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 12,
                  height: 260,
                  resize: "vertical",
                  lineHeight: 1.6,
                  color: "#c4b5fd",
                }}
              />
            ) : (
              <div style={{
                border: "1px solid #e4e2dc",
                borderRadius: 10,
                background: "#fff",
                minHeight: 260,
                padding: 20,
                overflow: "auto",
              }}>
                {html ? (
                  <div dangerouslySetInnerHTML={{ __html: html }} />
                ) : (
                  <div style={{ color: "#bbb", fontSize: 13, fontFamily: "'DM Mono', monospace" }}>
                    Nothing to preview yet…
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid #f3f2ef", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} style={{ ...ghostBtnStyle }}>Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim() || !html.trim()}
            style={{
              background: saving || !name.trim() || !html.trim() ? "#2a1f4a" : "#5b35c7",
              color: saving || !name.trim() || !html.trim() ? "#6d5ea0" : "#fff",
              border: "none",
              borderRadius: 9,
              padding: "9px 20px",
              cursor: saving || !name.trim() || !html.trim() ? "not-allowed" : "pointer",
              fontFamily: "'DM Mono', monospace",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 7,
              transition: "all 0.15s",
            }}
          >
            <Icon name="save" size={14} />
            {saving ? "Saving…" : "Save Signature"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm ────────────────────────────────────────────────────────────
function DeleteConfirm({ sig, onConfirm, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#ffffff", border: "1px solid #3a0000", borderRadius: 14, padding: 28, maxWidth: 400, width: "100%", margin: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
        <div style={{ fontSize: 15, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: "#ff5555", marginBottom: 8 }}>
          Delete signature?
        </div>
        <div style={{ fontSize: 13, color: "#666", fontFamily: "'DM Mono', monospace", marginBottom: 24, lineHeight: 1.6 }}>
          <span style={{ color: "#999" }}>"{sig.name}"</span> will be permanently removed.
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={ghostBtnStyle}>Cancel</button>
          <button onClick={onConfirm} style={{ background: "#7a0000", color: "#ff8888", border: "1px solid #aa0000", borderRadius: 9, padding: "9px 18px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const labelStyle = {
  display: "block",
  fontFamily: "'DM Mono', monospace",
  fontSize: 11,
  color: "#555",
  marginBottom: 6,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
};

const inputStyle = {
  width: "100%",
  background: "#f8f7f5",
  border: "1px solid #e4e2dc",
  borderRadius: 10,
  color: "#d0d0d0",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 13,
  padding: "10px 14px",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

const ghostBtnStyle = {
  background: "transparent",
  border: "1px solid #e4e2dc",
  borderRadius: 9,
  color: "#555",
  cursor: "pointer",
  fontFamily: "'DM Mono', monospace",
  fontSize: 13,
  padding: "9px 18px",
  transition: "all 0.15s",
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function SignaturesModule() {
  const [signatures, setSignatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState(null); // null | "new" | sig object
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const { toasts, toast } = useToast();

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = useCallback(async (q = "") => {
    setLoading(true);
    try {
      const res = await api.list(q ? { search: q } : {});
      setSignatures(res.data || []);
    } catch {
      toast("Failed to load signatures", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // debounced search
  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
  }, [search, load]);

  // ── CRUD Handlers ─────────────────────────────────────────────────────────
  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (editTarget === "new") {
        const res = await api.create(data);
        if (res.error) throw new Error(res.error);
        toast("Signature created ✓");
      } else {
        const res = await api.update(editTarget.id, data);
        if (res.error) throw new Error(res.error);
        toast("Signature updated ✓");
      }
      setEditTarget(null);
      load(search);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.remove(deleteTarget.id);
      toast("Signature deleted");
      setDeleteTarget(null);
      load(search);
    } catch {
      toast("Delete failed", "error");
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await api.setDefault(id);
      toast("Default updated ✓");
      load(search);
    } catch {
      toast("Failed to set default", "error");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
 
      <div style={{ minHeight: "100vh", background: "#f8f7f5", color: "#1a1916", fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── Top Bar ── */}
        <div style={{ borderBottom: "1px solid #161616", padding: "0 28px", display: "flex", alignItems: "center", gap: 16, height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #5b35c7, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#1a1916", letterSpacing: "-0.01em" }}>
              Signatures
            </span>
          </div>

          {/* Search */}
          <div style={{ flex: 1, maxWidth: 340, position: "relative" }}>
            <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#444", pointerEvents: "none" }}>
              <Icon name="search" size={14} />
            </span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search signatures…"
              style={{ ...inputStyle, paddingLeft: 34, background: "#0e0e0e", fontSize: 12, height: 36 }}
            />
          </div>

          <div style={{ marginLeft: "auto" }}>
            <button
              onClick={() => setEditTarget("new")}
              style={{
                background: "#5b35c7",
                color: "#fff",
                border: "none",
                borderRadius: 9,
                padding: "8px 16px",
                cursor: "pointer",
                fontFamily: "'DM Mono', monospace",
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#6d28d9"}
              onMouseLeave={e => e.currentTarget.style.background = "#5b35c7"}
            >
              <Icon name="plus" size={14} />
              New Signature
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ padding: "28px", maxWidth: 1100, margin: "0 auto" }}>
          {/* Stats strip */}
          <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
            {[
              { label: "Total", value: signatures.length },
              { label: "Default", value: signatures.filter(s => s.is_default).length ? "Set" : "None" },
              { label: "Tagged", value: signatures.filter(s => s.tags?.length).length },
            ].map(s => (
              <div key={s.label} style={{ background: "#0e0e0e", border: "1px solid #f3f2ef", borderRadius: 10, padding: "10px 18px" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#c4b5fd", fontFamily: "'DM Mono', monospace" }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#444", marginTop: 2, fontFamily: "'DM Mono', monospace" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#333", fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
              Loading…
            </div>
          ) : signatures.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ color: "#e4e2dc", fontSize: 48, marginBottom: 16 }}>✉</div>
              <div style={{ color: "#444", fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
                {search ? "No signatures match your search" : "No signatures yet — create one to get started"}
              </div>
              {!search && (
                <button onClick={() => setEditTarget("new")} style={{ ...ghostBtnStyle, marginTop: 20, color: "#5b35c7", borderColor: "#3a2070" }}>
                  + Create first signature
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 14 }}>
              {signatures.map(sig => (
                <div key={sig.id} style={{ animation: "fadeIn 0.2s ease" }}>
                  <SignatureCard
                    sig={sig}
                    onEdit={setEditTarget}
                    onDelete={setDeleteTarget}
                    onSetDefault={handleSetDefault}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {editTarget && (
        <EditorModal
          sig={editTarget === "new" ? null : editTarget}
          onSave={handleSave}
          onClose={() => setEditTarget(null)}
          saving={saving}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          sig={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      <Toaster toasts={toasts} />
    </>
  );
}
