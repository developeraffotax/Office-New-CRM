import React, { useEffect, useMemo, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import QuillToolbar, { modules, formats } from "./QuillToolbar";

/**
 * Professional Rich Text Editor
 * Features: Modern editorial typography, dynamic character counting, 
 * and high-fidelity focus states.
 */
const CustomEditor = ({ template, setTemplate, label = "Content Template" }) => {
  
  const quillRef = useRef(null); // Ref to access Quill editor
  // Calculate character count memoized for performance
  const charCount = useMemo(() => {
    if (!template) return 0;
    return template.replace(/<[^>]*>/g, "").length;
  }, [template]);


  // Auto-focus the editor on mount
  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor(); // getEditor() returns Quill instance
      editor.focus();
    }
  }, []);
  return (
    <div className="editor-container">
      <EditorStyles />
      
     

      <div className="editor-shell">
        <div className="toolbar-container">
          <QuillToolbar toolbarId="t1" />
        </div>

        <ReactQuill
          ref={quillRef}
          theme="snow"
          modules={modules("t1")}
          formats={formats}
          value={template}
          onChange={setTemplate}
          placeholder="Write your reply..."
          
        />
      </div>

      <footer className="editor-footer">
         
        <div className={`count-badge ${charCount > 500 ? 'limit-near' : ''}`}>
          {charCount.toLocaleString()} characters
        </div>
      </footer>
    </div>
  );
};

// Extracted styles to keep the component logic clean
const EditorStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;1,400&family=Instrument+Sans:wght@400;500;600&display=swap');

    :root {
      --editor-accent: #d4622a;
      --editor-bg: #ffffff;
      --editor-surface: #faf9f7;
      --editor-border: #e8e4e1;
      --editor-text-main: #1c1917;
      --editor-text-soft: #78716c;
      --editor-shadow: 0 4px 12px -2px rgba(28, 25, 23, 0.04), 0 2px 4px -1px rgba(28, 25, 23, 0.02);
      --editor-focus-ring: 0 0 0 4px rgba(212, 98, 42, 0.08);
    }

    .editor-container {
      font-family: 'Instrument Sans', sans-serif;
      max-width: 100%;
      margin: 0 auto;
    }

    /* Header & Label */
    .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 12px;
    }

    .label-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .label-wrapper label {
      font-family: 'Fraunces', serif;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--editor-text-main);
    }

    .accent-dot {
      width: 6px;
      height: 6px;
      background: var(--editor-accent);
      border-radius: 50%;
    }

    .status-indicator {
      font-size: 0.75rem;
      color: var(--editor-text-soft);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* The Main Shell */
    .editor-shell {
      background: var(--editor-bg);
      border: 1px solid var(--editor-border);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: var(--editor-shadow);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .editor-shell:focus-within {
      border-color: var(--editor-accent);
      box-shadow: var(--editor-shadow), var(--editor-focus-ring);
    }

    /* Toolbar Polishing */
    .toolbar-container {
      background: var(--editor-surface);
      border-bottom: 1px solid var(--editor-border);
      padding: 4px 8px;
    }

    .ql-toolbar.ql-snow {
      border: none !important;
      display: flex;
      flex-wrap: wrap;
      gap: 2px;
    }

    .ql-snow .ql-stroke { stroke: var(--editor-text-soft) !important; }
    .ql-snow .ql-fill { fill: var(--editor-text-soft) !important; }
    
    .ql-toolbar button:hover .ql-stroke, 
    .ql-toolbar button.ql-active .ql-stroke { 
      stroke: var(--editor-accent) !important; 
    }

    /* Editor Content Area */
    .ql-container.ql-snow {
      border: none !important;
      font-size: 0.9rem !important;
    }

    .ql-editor {
      min-height: 400px;
      line-height: 1.2;
      padding: 24px !important;
      color: var(--editor-text-main);
    }

    .ql-editor.ql-blank::before {
      font-style: italic;
      color: #b8b0a6;
      left: 24px;
    }

    /* Footer Details */
    .editor-footer {
      display: flex;
      justify-content: end;
      align-items: center;
      margin-top: 12px;
      padding: 0 4px;
    }

    .hint {
      font-size: 0.8rem;
      color: var(--editor-text-soft);
    }

    .hint kbd {
      background: var(--editor-surface);
      border: 1px solid var(--editor-border);
      border-radius: 4px;
      padding: 1px 4px;
      font-size: 0.7rem;
      font-family: sans-serif;
    }

    .count-badge {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--editor-text-soft);
      background: var(--editor-surface);
      padding: 4px 10px;
      border-radius: 20px;
      border: 1px solid var(--editor-border);
    }

    .limit-near {
      color: var(--editor-accent);
      border-color: rgba(212, 98, 42, 0.2);
    }
  `}</style>
);

export default CustomEditor;