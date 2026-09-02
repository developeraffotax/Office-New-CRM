// utils/extractQuoteDetails.js

export function isQuoteEmail(html = "", subject = "") {
  const content = html.toLowerCase();
  const subj = subject.toLowerCase();

  return (
    content.includes("affotax_quote_email_v1") || 
    subj.includes("instant quote")
  );
}

export function extractFromCtaLink(html = "") {
  // Matches: /leads/create?name=...&email=...
  const match = html.match(/leads\/create\?([^"'>\s]+)/i);
  if (!match) return null;

  try {
    const params = new URLSearchParams(match[1]);
    return {
      name: params.get("name") ? decodeURIComponent(params.get("name")) : "",
      email: params.get("email") ? decodeURIComponent(params.get("email")) : "",
    };
  } catch {
    return null;
  }
}

export function extractQuoteDetails(html = "", subject = "") {
  if (!isQuoteEmail(html, subject)) {
    return null; // Not a quote email
  }

  // 1. Prefer the CTA link (most reliable)
  const fromCta = extractFromCtaLink(html);
  if (fromCta?.name || fromCta?.email) {
    return {
      name: fromCta.name,
      email: fromCta.email,
      // phone: extractField(html, "Phone") || extractField(html, "Phone Number"),
      // source: "cta",
    };
  }

  // 2. Fallback: parse the table
  return {
    name: extractField(html, "Name"),
    email: extractField(html, "Email") || extractEmailFromMailto(html),
    // phone: extractField(html, "Phone") || extractField(html, "Phone Number"),
    // source: "table",
  };
}

// ---------- helpers ----------

function extractField(html, label) {
  const patterns = [
    // HTML table style
    new RegExp(`${label}:</td>\\s*<td[^>]*>([^<]+)`, "i"),
    // Plain text
    new RegExp(`${label}:\\s*([^\\n<]+)`, "i"),
  ];

  for (const re of patterns) {
    const match = html.match(re);
    if (match?.[1]) return match[1].trim();
  }
  return "";
}

function extractEmailFromMailto(html) {
  const match = html.match(/mailto:([^"'>\s]+)/i);
  return match ? decodeURIComponent(match[1]) : "";
}