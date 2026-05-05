import { useState, useRef } from "react";
import { Icon } from "./Icon";

export function EditorModal({ sig, onSave, onClose, saving }) {
  const [name,      setName]      = useState(sig?.name || "");
  const [company, setCompany] = useState(sig?.company || "");
  const [html,      setHtml]      = useState(sig?.html || "");
  const [tagsInput, setTagsInput] = useState(sig?.tags?.join(", ") || "");
  const [isDefault, setIsDefault] = useState(sig?.is_default || false);
  const [tab,       setTab]       = useState("code");
  const textareaRef               = useRef();

  const handleSave = () => {
    onSave({ 
      name,
      html, 
      company,
      is_default: isDefault });
  };

  const disabled = saving || !name.trim() || !html.trim();

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6"
         style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
      <div
        className="w-full max-w-[840px] max-h-[90vh] flex flex-col overflow-hidden font-google"
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.5) inset",
        }}
      >
        {/* Modal Header */}
        <div
          className="px-6 py-4 flex items-center gap-3"
          style={{
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            background: "linear-gradient(to bottom, #fafafa, #f5f5f5)",
          }}
        >
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ background: "rgba(234,88,12,0.1)" }}
          >
            <Icon name={sig ? "edit-2" : "plus"} size={15} style={{ color: "#ea580c" }} />
          </div>
          <span className="flex-1 font-semibold text-[15px]" style={{ color: "#111", letterSpacing: "-0.01em" }}>
            {sig ? "Edit Signature" : "New Signature"}
          </span>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#888",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.06)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">

          {/* Row: Name + Company + Default */}
          <div className="flex gap-4 items-start">

            {/* Signature Name */}
            <div className="flex-1 flex flex-col gap-1.5">
              <label style={{ fontSize: "11px", fontWeight: 600, color: "#888", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                Signature Name
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Sales Team Footer"
                style={{
                  width: "100%",
                  background: "#f8f8f8",
                  border: "1px solid #e8e8e8",
                  borderRadius: "10px",
                  color: "#111",
                  fontSize: "13.5px",
                  padding: "10px 14px",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                  fontFamily: "inherit",
                }}
                onFocus={e => {
                  e.target.style.borderColor = "#ea580c";
                  e.target.style.boxShadow = "0 0 0 3px rgba(234,88,12,0.1)";
                  e.target.style.background = "#fff";
                }}
                onBlur={e => {
                  e.target.style.borderColor = "#e8e8e8";
                  e.target.style.boxShadow = "none";
                  e.target.style.background = "#f8f8f8";
                }}
              />
            </div>

            {/* Company Toggle */}
            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: "11px", fontWeight: 600, color: "#888", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                Company
              </label>
              <div
                style={{
                  display: "flex",
                  padding: "3px",
                  background: "#f0f0f0",
                  borderRadius: "10px",
                  border: "1px solid #e8e8e8",
                  gap: "2px",
                }}
              >
                {["affotax", "outsource"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setCompany(c)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 600,
                      textTransform: "capitalize",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      letterSpacing: "-0.01em",
                      ...(company === c
                        ? { background: "#fff", color: "#111", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
                        : { background: "transparent", color: "#999" }),
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Default Toggle */}
            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: "11px", fontWeight: 600, color: "#888", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                Default
              </label>
              <div
                className="flex items-center gap-2 cursor-pointer"
                style={{ paddingTop: "8px" }}
                onClick={() => setIsDefault(v => !v)}
              >
                <div
                  style={{
                    width: "38px",
                    height: "22px",
                    borderRadius: "11px",
                    position: "relative",
                    transition: "background 0.2s",
                    background: isDefault ? "#ea580c" : "#d1d1d1",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "3px",
                      left: isDefault ? "19px" : "3px",
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      background: "#fff",
                      transition: "left 0.2s",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }}
                  />
                </div>
                <span style={{ fontSize: "12.5px", color: isDefault ? "#ea580c" : "#999", fontWeight: 500, transition: "color 0.2s", userSelect: "none" }}>
                  {isDefault ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          {/* Code / Preview tabs */}
          <div className="flex flex-col gap-3">
            {/* Tab bar */}
            <div style={{ display: "flex", gap: "4px" }}>
              {["code", "preview"].map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "7px 14px",
                    borderRadius: "9px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    letterSpacing: "-0.01em",
                    ...(tab === t
                      ? {
                          background: "#111",
                          color: "#fff",
                          border: "1px solid #111",
                        }
                      : {
                          background: "transparent",
                          color: "#888",
                          border: "1px solid #e8e8e8",
                        }),
                  }}
                >
                  <Icon name={t === "code" ? "code" : "eye"} size={12} />
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {tab === "code" ? (
              <textarea
                ref={textareaRef}
                value={html}
                onChange={e => setHtml(e.target.value)}
                 
                placeholder="Paste your HTML signature here…"
                style={{
                  width: "100%",
                  
                  background: "#fff",
                  border: "1px solid #222",
                  borderRadius: "12px",
                  
                  
                  fontSize: "12px",
                  padding: "16px",
                  outline: "none",
                  boxSizing: "border-box",
                  lineHeight: "1.7",
                  resize: "vertical",
                  height: "500px",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => e.target.style.borderColor = "#ea580c"}
                onBlur={e => e.target.style.borderColor = "#222"}
              />
            ) : (
              <div
                style={{
                  border: "1px solid #e8e8e8",
                  borderRadius: "12px",
                  background: "#fff",
                  minHeight: "500px",
                  padding: "20px",
                  overflow: "auto",
                }}
              >
                {html ? (
                  <div dangerouslySetInnerHTML={{ __html: html }} />
                ) : (
                  <span style={{ color: "#bbb", fontSize: "13px", fontFamily: "monospace" }}>
                    Nothing to preview yet…
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex justify-end gap-3"
          style={{
            borderTop: "1px solid rgba(0,0,0,0.06)",
            background: "linear-gradient(to top, #fafafa, #f5f5f5)",
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid #e0e0e0",
              borderRadius: "10px",
              color: "#555",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 500,
              padding: "9px 20px",
              transition: "all 0.15s",
              fontFamily: "inherit",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#f5f5f5"; e.currentTarget.style.borderColor = "#ccc"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#e0e0e0"; }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={disabled}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              border: "none",
              borderRadius: "10px",
              padding: "9px 20px",
              fontSize: "13px",
              fontWeight: 600,
              transition: "all 0.15s",
              letterSpacing: "-0.01em",
              fontFamily: "inherit",
              cursor: disabled ? "not-allowed" : "pointer",
              ...(disabled
                ? { background: "#f0f0f0", color: "#bbb" }
                : { background: "#ea580c", color: "#fff" }),
            }}
            onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = "#c2410c"; }}
            onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = "#ea580c"; }}
          >
            <Icon name="save" size={14} />
            {saving ? "Saving…" : "Save Signature"}
          </button>
        </div>
      </div>
    </div>
  );
}