import { useMemo, useRef, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./RichText.css";

// Full set of formats
const FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "code-block",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
  "color",
  "background",
  "align",
  "clean",
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Instructions for this step…",
  maxChars = 2000, // optional soft limit for the badge color
}) {
  const quillRef = useRef(null);

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
        [{ align: [] }],
        ["blockquote", "code-block"],
        ["link", "image"],
        ["clean"],
      ],
    }),
    []
  );

  // Character count (strip HTML tags)
  const charCount = useMemo(() => {
    if (!value) return 0;
    return value.replace(/<[^>]*>/g, "").length;
  }, [value]);

  // Optional: auto-focus on mount
  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      // Uncomment if you want auto-focus:
      // editor.focus();
    }
  }, []);

  return (
    <div className="rt-editor">
      <div className="rt-shell">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value || ""}
          modules={modules}
          formats={FORMATS}
          placeholder={placeholder}
          onChange={(html, _delta, _source, editor) =>
            onChange(editor.getText().trim() ? html : "")
          }
        />
      </div>

      {/* <div className="rt-footer">
        <div
          className={`rt-count ${charCount > maxChars ? "rt-count--near" : ""}`}
        >
          {charCount.toLocaleString()} characters
        </div>
      </div> */}
    </div>
  );
}