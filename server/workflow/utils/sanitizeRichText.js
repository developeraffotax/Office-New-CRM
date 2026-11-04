import sanitizeHtml from "sanitize-html";

const OPTIONS = {
  allowedTags: [
    "p", "br", "strong", "b", "em", "i", "u", "s",
    "ul", "ol", "li", "h2", "h3", "blockquote", "code", "pre", "hr", "a",
  ],
  allowedAttributes: { a: ["href", "target", "rel"] },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer" }),
  },
};

const TEXT_ONLY = { allowedTags: [], allowedAttributes: {} };

// Returns safe HTML, or "" when the editor is effectively empty (e.g. "<p></p>").
export const cleanRichText = (html = "") => {
  const clean = sanitizeHtml(String(html || ""), OPTIONS).trim();
  if (!clean) return "";
  return sanitizeHtml(clean, TEXT_ONLY).trim() ? clean : "";
};