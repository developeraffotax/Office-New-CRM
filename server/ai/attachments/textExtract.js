// ai/attachments/textExtract.js — plain text from PDF / Word / PowerPoint / text files, plus in-document search.
import fs from "node:fs/promises";
import JSZip from "jszip";
import mammoth from "mammoth";
import { extractPdfText, pagesToText } from "./pdfText.js";
import { ToolError } from "../agent/toolkit.js";

const cache = new Map(); // attachment id → { at, text }  (parsing a big PDF twice is wasteful)
const TTL = 10 * 60 * 1000;

const decode = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");

async function pptxText(buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const slides = Object.keys(zip.files)
    .map((n) => [n, /^ppt\/slides\/slide(\d+)\.xml$/.exec(n)])
    .filter(([, m]) => m)
    .sort((a, b) => Number(a[1][1]) - Number(b[1][1]));
  const out = [];
  for (const [name, m] of slides) {
    const xml = await zip.file(name).async("string");
    const texts = [...xml.matchAll(/<a:t[^>]*>([^<]*)<\/a:t>/g)].map((x) => decode(x[1]));
    out.push(`--- slide ${m[1]} ---\n${texts.join("\n")}`);
  }
  return out.join("\n\n");
}

export async function extractText(att) {
  const key = String(att._id);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.text;

  let text;
  switch (att.kind) {
    case "pdf": text = pagesToText(await extractPdfText(await fs.readFile(att.storagePath))); break;
    case "docx": text = (await mammoth.extractRawText({ path: att.storagePath })).value; break;
    case "pptx": text = await pptxText(await fs.readFile(att.storagePath)); break;
    case "text": text = await fs.readFile(att.storagePath, "utf8"); break;
    default: throw new ToolError(`Can't read a ${att.kind} file as text.`);
  }
  cache.set(key, { at: Date.now(), text });
  if (cache.size > 20) cache.delete(cache.keys().next().value);
  return text;
}

/** Best-matching passages for a query: sliding 600-char windows scored by how many query words they contain. */
export function findExcerpts(text, query, { max = 5, window = 600 } = {}) {
  const terms = [...new Set(String(query).toLowerCase().split(/\s+/).filter((t) => t.length > 1))];
  if (!terms.length) return [];
  const lower = text.toLowerCase();
  const scored = [];
  for (let at = 0; at < text.length; at += window / 2) {
    const chunk = lower.slice(at, at + window);
    const score = terms.filter((t) => chunk.includes(t)).length;
    if (score) scored.push({ at, score });
  }
  scored.sort((a, b) => b.score - a.score || a.at - b.at);
  const picked = [];
  for (const s of scored) {
    if (picked.length >= max) break;
    if (picked.every((p) => Math.abs(p.at - s.at) >= window)) picked.push(s);
  }
  return picked.sort((a, b) => a.at - b.at).map((p) => ({ offset: p.at, text: text.slice(p.at, p.at + window) }));
}
