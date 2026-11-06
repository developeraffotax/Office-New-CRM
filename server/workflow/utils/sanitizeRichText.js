import sanitizeHtml from "sanitize-html";

const OPTIONS = {
  allowedTags: [
    "p", "br", "strong", "b", "em", "i", "u", "s",
    "ul", "ol", "li",
    "h1", "h2", "h3",
    "blockquote", "code", "pre", "hr", "a",
    "span",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    // Allow style on any tag (this is the key change)
    "*": ["style"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", {
      target: "_blank",
      rel: "noopener noreferrer",
    }),
  },
  allowedStyles: {
    "*": {
      color: [
        /^#(0x)?[0-9a-f]+$/i,
        /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/,
      ],
      "background-color": [
        /^#(0x)?[0-9a-f]+$/i,
        /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/,
      ],
    },
  },
};

const TEXT_ONLY = { allowedTags: [], allowedAttributes: {} };

export const cleanRichText = (html = "") => {
  const clean = sanitizeHtml(String(html || ""), OPTIONS).trim();
  if (!clean) return "";
  return sanitizeHtml(clean, TEXT_ONLY).trim() ? clean : "";
};