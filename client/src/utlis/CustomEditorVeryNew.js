import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FiAlignLeft, FiCode, FiEdit3 } from "react-icons/fi";
import QuillToolbar, { modules, formats } from "./QuillToolbar";

let editorUid = 0; // every instance needs its own toolbar id (several editors can share a page)

// Newlines between block tags only, so inline spacing is never changed
const BLOCK = "p|div|h[1-6]|ul|ol|li|blockquote|pre";
const prettyHtml = (html = "") =>
  html
    .replace(new RegExp(`(</(?:${BLOCK})>)\\s*(?=<(?:${BLOCK})\\b)`, "gi"), "$1\n")
    .replace(/(<(?:ul|ol)\b[^>]*>)\s*(?=<li\b)/gi, "$1\n")
    .replace(/(<\/li>)\s*(?=<\/(?:ul|ol)>)/gi, "$1\n")
    .trim();

/**
 * Rich text editor with a Visual / raw HTML toggle.
 * Props: template (HTML string), setTemplate (called with the new HTML),
 *        label, placeholder, minHeight, softLimit, autoFocus
 */
const CustomEditor = ({
  template,
  setTemplate,
  label = "",
  placeholder = "Write your reply...",
  minHeight = 300,
  softLimit = 500,
  autoFocus = true,
}) => {
  useEditorStyles();

  const quillRef = useRef(null);
  const sourceRef = useRef(null);

  const [toolbarId] = useState(() => `ce-toolbar-${++editorUid}`);
  const quillModules = useMemo(() => modules(toolbarId), [toolbarId]);

  const [mode, setMode] = useState("visual"); // "visual" | "html"
  const [source, setSource] = useState("");

  const { chars, words } = useMemo(() => {
    if (!template) return { chars: 0, words: 0 };
    return {
      chars: template.replace(/<[^>]*>/g, "").length,
      words: (template.replace(/<[^>]*>/g, " ").match(/\S+/g) || []).length,
    };
  }, [template]);

  // Focus whichever editor is showing
  useEffect(() => {
    if (!autoFocus) return;
    if (mode === "visual") quillRef.current?.getEditor?.().focus();
    else sourceRef.current?.focus();
  }, [mode, autoFocus]);

  const openSource = () => {
    if (mode === "html") return;
    setSource(prettyHtml(template || ""));
    setMode("html");
  };

  const onSourceChange = (e) => {
    setSource(e.target.value);
    setTemplate(e.target.value); // raw HTML goes to the parent exactly as typed
  };

  const formatSource = () => {
    const pretty = prettyHtml(source);
    setSource(pretty);
    setTemplate(pretty);
  };

  return (
    <div className="ce-root" style={{ "--ce-min-h": `${minHeight}px` }}>
      {label && <span className="ce-label">{label}</span>}

      <div className="ce-shell">
        <div className="ce-topbar">
          <span className="ce-title">
            {mode === "visual" ? "Compose" : "HTML source"}
          </span>

          <div className="ce-tabs" role="tablist" aria-label="Editor mode">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "visual"}
              className="ce-tab"
              onClick={() => setMode("visual")}
            >
              <FiEdit3 /> Visual
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "html"}
              className="ce-tab"
              onClick={openSource}
            >
              <FiCode /> HTML
            </button>
          </div>
        </div>

        {mode === "visual" ? (
          <>
            <div className="ce-toolbar">
              <QuillToolbar toolbarId={toolbarId} />
            </div>
            <ReactQuill
              ref={quillRef}
              theme="snow"
              modules={quillModules}
              formats={formats}
              value={template}
              onChange={setTemplate}
              placeholder={placeholder}
            />
          </>
        ) : (
          <>
            <div className="ce-sourcebar">
              <span>Edit the raw HTML. Switching back to Visual may simplify unsupported markup.</span>
              <button type="button" className="ce-btn" onClick={formatSource}>
                <FiAlignLeft /> Format
              </button>
            </div>
            <textarea
              ref={sourceRef}
              className="ce-source"
              value={source}
              onChange={onSourceChange}
              spellCheck={false}
              aria-label="HTML source"
            />
          </>
        )}

        <div className="ce-footer">
          <span>
            {mode === "html" ? "Unsupported markup is cleaned before sending" : ""}
          </span>
          <span className={`ce-count ${chars > softLimit ? "near" : ""}`}>
            {words.toLocaleString()} words · {chars.toLocaleString()} characters
          </span>
        </div>
      </div>
    </div>
  );
};

/* ---------------- styles (injected once, scoped to .ce-root) ---------------- */

const STYLE_ID = "custom-editor-styles";

function useEditorStyles() {
  useLayoutEffect(() => {
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement("style");
    el.id = STYLE_ID;
    el.textContent = EDITOR_CSS;
    document.head.appendChild(el);
  }, []);
}

const EDITOR_CSS = `
.ce-root {
  --ce-accent: #f97316;
  --ce-accent-soft: #fff7ed;
  --ce-border: #e5e7eb;
  --ce-surface: #f9fafb;
  --ce-text: #111827;
  --ce-muted: #6b7280;
  --ce-min-h: 300px;
  width: 100%;
  font-family: inherit;
}
.ce-root * { box-sizing: border-box; }

.ce-label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ce-text);
}

/* Shell */
.ce-shell {
  background: #fff;
  border: 1px solid var(--ce-border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.05);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.ce-shell:focus-within {
  border-color: var(--ce-accent);
  box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.12);
}

/* Top bar + mode toggle */
.ce-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  background: var(--ce-surface);
  border-bottom: 1px solid var(--ce-border);
}
.ce-title {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ce-muted);
}
.ce-tabs {
  display: inline-flex;
  gap: 2px;
  padding: 3px;
  background: #eceff3;
  border-radius: 10px;
}
.ce-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--ce-muted);
  background: transparent;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.ce-tab:hover { color: var(--ce-text); }
.ce-tab[aria-selected="true"] {
  background: #fff;
  color: var(--ce-text);
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.12);
}

/* Quill toolbar */
.ce-root .ql-toolbar.ql-snow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  row-gap: 4px;
  padding: 8px 10px;
  background: #fff;
  border: 0 !important;
  border-bottom: 1px solid var(--ce-border) !important;
}
.ce-root .ql-toolbar.ql-snow .ql-formats {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-right: 8px;
  padding-right: 8px;
  border-right: 1px solid var(--ce-border);
}
.ce-root .ql-toolbar.ql-snow .ql-formats:last-child {
  margin-right: 0;
  padding-right: 0;
  border-right: 0;
}
.ce-root .ql-toolbar.ql-snow button {
  width: 30px;
  height: 30px;
  padding: 6px;
  border-radius: 8px;
  transition: background 0.15s ease;
}
.ce-root .ql-toolbar.ql-snow button:hover,
.ce-root .ql-toolbar.ql-snow button.ql-active,
.ce-root .ql-toolbar.ql-snow .ql-picker-label:hover,
.ce-root .ql-toolbar.ql-snow .ql-picker-label.ql-active {
  background: var(--ce-accent-soft);
}
.ce-root .ql-toolbar.ql-snow .ql-picker-label { border-radius: 8px; }
.ce-root .ql-snow .ql-stroke { stroke: var(--ce-muted) !important; }
.ce-root .ql-snow .ql-fill { fill: var(--ce-muted) !important; }
.ce-root .ql-snow .ql-picker { color: var(--ce-muted); }
.ce-root .ql-toolbar button:hover .ql-stroke,
.ce-root .ql-toolbar button.ql-active .ql-stroke { stroke: var(--ce-accent) !important; }
.ce-root .ql-toolbar button:hover .ql-fill,
.ce-root .ql-toolbar button.ql-active .ql-fill { fill: var(--ce-accent) !important; }
.ce-root .ql-snow .ql-picker-options {
  border: 1px solid var(--ce-border) !important;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(16, 24, 40, 0.12);
}

/* Visual editing area */
.ce-root .ql-container.ql-snow {
  border: 0 !important;
  font-family: inherit;
  font-size: 0.95rem;
}
.ce-root .ql-editor {
  min-height: var(--ce-min-h);
  padding: 20px 24px;
  line-height: 1.6;
  color: var(--ce-text);
}
.ce-root .ql-editor.ql-blank::before {
  left: 24px;
  right: 24px;
  font-style: normal;
  color: #9ca3af;
}
.ce-root .ql-editor a { color: #2563eb; }

/* HTML source mode */
.ce-sourcebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  background: #fff;
  border-bottom: 1px solid var(--ce-border);
  font-size: 0.75rem;
  color: var(--ce-muted);
}
.ce-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 5px 10px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #374151;
  background: #fff;
  border: 1px solid var(--ce-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.ce-btn:hover { border-color: var(--ce-accent); color: var(--ce-accent); }
.ce-source {
  display: block;
  width: 100%;
  min-height: var(--ce-min-h);
  padding: 20px 24px;
  border: 0;
  outline: 0;
  resize: vertical;
  background: #0f172a;
  color: #e2e8f0;
  caret-color: var(--ce-accent);
  font: 13px/1.7 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  tab-size: 2;
  white-space: pre-wrap;
  word-break: break-word;
}
.ce-source::selection { background: rgba(249, 115, 22, 0.35); }

/* Footer */
.ce-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 14px;
  background: var(--ce-surface);
  border-top: 1px solid var(--ce-border);
  font-size: 0.72rem;
  color: var(--ce-muted);
}
.ce-count { font-variant-numeric: tabular-nums; }
.ce-count.near { color: var(--ce-accent); font-weight: 600; }
`;

export default CustomEditor;