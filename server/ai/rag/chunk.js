// ai/rag/chunk.js
// Paragraph-aware chunker. ~600 tokens per chunk (≈4 chars/token) with ~12% overlap.

const normalize = (t) =>
  String(t)
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

// Break an oversized paragraph on sentence boundaries (hard-split as a last resort).
function splitLong(p, max) {
  const sentences = p.match(/[^.!?\n]+[.!?]*\s*/g) || [p];
  const out = [];
  let cur = "";
  for (const s of sentences) {
    if (s.length > max) {
      if (cur) out.push(cur), (cur = "");
      for (let i = 0; i < s.length; i += max) out.push(s.slice(i, i + max));
    } else if (cur.length + s.length > max) {
      out.push(cur);
      cur = s;
    } else cur += s;
  }
  if (cur) out.push(cur);
  return out.map((x) => x.trim()).filter(Boolean);
}

// Last ~n chars, starting at a word boundary.
function tail(s, n) {
  if (s.length <= n) return s;
  const t = s.slice(-n);
  const i = t.indexOf(" ");
  return i > -1 ? t.slice(i + 1) : t;
}

export function chunkText(text, { maxChars = 2400, overlapChars = 300 } = {}) {
  const unitMax = maxChars - overlapChars;
  const units = normalize(text)
    .split(/\n{2,}/)
    .flatMap((p) => (p.length > unitMax ? splitLong(p, unitMax) : [p]))
    .filter((u) => u.trim());

  const chunks = [];
  let buf = "";
  for (const u of units) {
    if (buf && buf.length + u.length + 2 > maxChars) {
      chunks.push(buf.trim());
      buf = `${tail(buf, overlapChars)}\n\n${u}`;
    } else {
      buf = buf ? `${buf}\n\n${u}` : u;
    }
  }
  if (buf.trim()) chunks.push(buf.trim());
  return chunks;
}
