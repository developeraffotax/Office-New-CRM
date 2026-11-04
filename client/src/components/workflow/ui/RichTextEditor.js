import { useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./RichText.css";

// Uses the react-quill already in your client app. No new packages needed.
// value / onChange work with an HTML string ("" when the editor is empty).
const FORMATS = ["header", "bold", "italic", "list", "bullet", "link"];

export default function RichTextEditor({ value, onChange, placeholder = "Instructions for this step…" }) {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [2, 3, false] }],
        ["bold", "italic"],
        [{ list: "bullet" }, { list: "ordered" }],
        ["link"],
        ["clean"],
      ],
    }),
    []
  );

  return (
    <div className="rt-editor rounded-md border border-stone-300 bg-white focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
      <ReactQuill
        theme="snow"
        value={value || ""}
        modules={modules}
        formats={FORMATS}
        placeholder={placeholder}
        // Quill reports an empty editor as "<p><br></p>", so normalise that to "".
        onChange={(html, _delta, _source, editor) => onChange(editor.getText().trim() ? html : "")}
      />
    </div>
  );
}