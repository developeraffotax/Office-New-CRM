// ai/forms/pdfText.js — text of a PDF with positions (PDF user space: origin bottom-left, points).
// npm i pdfjs-dist
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const MAX_PAGES = 40;

// Group text items into lines (top to bottom, left to right).
export function groupLines(items) {
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const lines = [];
  for (const it of sorted) {
    const last = lines[lines.length - 1];
    if (last && Math.abs(last.y - it.y) <= 2.5) last.items.push(it);
    else lines.push({ y: it.y, items: [it] });
  }
  return lines.map((l) => l.items.sort((a, b) => a.x - b.x));
}

/** Readable text for the AI: one line per visual line, pages separated. */
export function pagesToText(pages) {
  return pages
    .map((p) => `--- page ${p.page} ---\n${groupLines(p.items).map((l) => l.map((i) => i.str).join(" ")).join("\n")}`)
    .join("\n\n");
}

export async function extractPdfText(buffer) {
  const task = getDocument({
    data: new Uint8Array(buffer), // pdf.js rejects Buffer; it wants a plain Uint8Array
    isEvalSupported: false,
    useSystemFonts: false,
    verbosity: 0,
  });
  const doc = await task.promise;
  try {
    const pages = [];
    for (let n = 1; n <= Math.min(doc.numPages, MAX_PAGES); n++) {
      const page = await doc.getPage(n);
      const [x0, y0, x1, y1] = page.view;
      const content = await page.getTextContent();
      const items = content.items
        .filter((i) => typeof i.str === "string" && i.str.trim() !== "")
        .map((i) => ({ str: i.str, x: i.transform[4], y: i.transform[5], w: i.width, h: i.height || Math.abs(i.transform[3]) }));
      pages.push({ page: n, width: x1 - x0, height: y1 - y0, items });
    }
    return pages;
  } finally {
    await task.destroy();
  }
}
