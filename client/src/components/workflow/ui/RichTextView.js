import DOMPurify from "dompurify"; // already in your client; the server also sanitizes before saving
import "./RichText.css";

export default function RichTextView({ html, className = "" }) {
  if (!html) return null;
  return (
    <div
      className={`rich-text-content text-sm text-stone-700 ${className}`}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html, { ADD_ATTR: ["target"] }) }}
    />
  );
}