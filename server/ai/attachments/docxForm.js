// ai/forms/docxForm.js — analyse and fill Word (.docx) forms.
// Finds, in document order:
//   1. content controls (text / dropdown / date)
//   2. table cells: "Label | (empty cell)", and header rows with an empty row beneath
//   3. paragraphs: "Label: ____", "Label ____", "Label:" at the end of a short line, and ☐ checkboxes
// npm i jszip @xmldom/xmldom
import JSZip from "jszip";
import { DOMParser, XMLSerializer } from "@xmldom/xmldom";
import { ToolError } from "../agent/toolkit.js";

const W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const MAX_FIELDS = 300;

const all = (node, tag) => Array.from(node.getElementsByTagNameNS(W, tag));
const kids = (node, tag) => Array.from(node.childNodes).filter((n) => n.nodeType === 1 && n.namespaceURI === W && n.localName === tag);
const kid = (node, tag) => (node ? kids(node, tag)[0] : undefined);
const wAttr = (el, name) => (el ? el.getAttributeNS(W, name) || el.getAttribute(`w:${name}`) || "" : "");

const pText = (p) => all(p, "t").map((t) => t.textContent).join("");
const flat = (s) => String(s).replace(/\s+/g, " ").trim();
const cleanLabel = (s) => flat(s).replace(/\s*[:：]\s*$/, "").slice(0, 80);
const ancestor = (node, localName) => {
  for (let n = node.parentNode; n; n = n.parentNode) if (n.namespaceURI === W && n.localName === localName) return n;
  return null;
};

// ---------- editing helpers ----------
function setNodeText(doc, t, text) {
  while (t.firstChild) t.removeChild(t.firstChild);
  t.appendChild(doc.createTextNode(text));
  t.setAttribute("xml:space", "preserve");
}

// Replace characters [start, end) of a paragraph's text with `text`, across run boundaries.
function replaceRange(doc, p, start, end, text) {
  let pos = 0;
  let placed = false;
  for (const t of all(p, "t")) {
    const s = t.textContent;
    const from = Math.max(pos, start);
    const to = Math.min(pos + s.length, end);
    if (from < to) {
      const a = from - pos;
      const b = to - pos;
      setNodeText(doc, t, s.slice(0, a) + (placed ? "" : text) + s.slice(b));
      placed = true;
    }
    pos += s.length;
  }
}

function newRun(doc, text, like) {
  const r = doc.createElementNS(W, "w:r");
  const rPr = like && kid(like, "rPr");
  if (rPr) r.appendChild(rPr.cloneNode(true));
  const t = doc.createElementNS(W, "w:t");
  setNodeText(doc, t, text);
  r.appendChild(t);
  return r;
}

function appendToParagraph(doc, p, text) {
  const runs = kids(p, "r");
  p.appendChild(newRun(doc, text, runs[runs.length - 1]));
}

function fillCell(doc, tc, text) {
  const p = kids(tc, "p")[0] || tc.appendChild(doc.createElementNS(W, "w:p"));
  appendToParagraph(doc, p, text);
}

function setSdtText(doc, content, text) {
  const ts = all(content, "t");
  if (ts.length) {
    setNodeText(doc, ts[0], text);
    ts.slice(1).forEach((t) => setNodeText(doc, t, ""));
    return;
  }
  const p = all(content, "p")[0];
  if (p) appendToParagraph(doc, p, text);
  else content.appendChild(newRun(doc, text));
}

// ---------- detection ----------
function detect(doc) {
  const body = all(doc, "body")[0];
  if (!body) throw new ToolError("That Word file couldn't be read.");

  // document order, so fields come out top-to-bottom
  const order = new Map();
  let counter = 0;
  (function walk(n) {
    order.set(n, counter++);
    for (const c of Array.from(n.childNodes)) if (c.nodeType === 1) walk(c);
  })(body);

  const found = []; // { anchor, sub, label, type, options, context, apply(value) }
  const consumed = new Set(); // paragraphs already used as a label or a target
  const add = (f) => found.push({ sub: 0, type: "text", ...f });

  // 1. content controls
  for (const sdt of all(body, "sdt")) {
    const content = kid(sdt, "sdtContent");
    if (!content || all(content, "sdt").length) continue;
    const pr = kid(sdt, "sdtPr");
    if (pr && Array.from(pr.childNodes).some((n) => n.localName === "checkbox")) continue; // not supported
    const dd = kid(pr, "dropDownList") || kid(pr, "comboBox");
    const options = dd ? all(dd, "listItem").map((li) => wAttr(li, "displayText") || wAttr(li, "value")).filter(Boolean) : undefined;
    const p = ancestor(sdt, "p") || all(content, "p")[0];
    if (p) consumed.add(p);
    const before = (() => { // text in the same paragraph before the control, else the previous paragraph
      const own = p ? pText(p).replace(pText(sdt.parentNode === p ? sdt : p), "") : "";
      if (flat(own)) return own;
      for (let n = (p || sdt).previousSibling; n; n = n.previousSibling) {
        const t = n.nodeType === 1 ? flat(n.textContent) : "";
        if (t) return t;
      }
      return "";
    })();
    add({
      anchor: sdt,
      label: cleanLabel(wAttr(kid(pr, "alias"), "val") || wAttr(kid(pr, "tag"), "val") || before) || "Field",
      ...(options ? { type: "select", options } : {}),
      context: flat(before).slice(0, 120),
      apply(v) {
        setSdtText(doc, content, v);
        const ph = kid(pr, "showingPlcHdr");
        if (ph) pr.removeChild(ph);
      },
    });
  }

  const cellText = (tc) => flat(kids(tc, "p").map(pText).join(" "));
  const isEmptyCell = (tc) => !cellText(tc) && !all(tc, "sdt").length;

  // 2. tables
  for (const tbl of all(body, "tbl")) {
    const rows = kids(tbl, "tr");
    rows.forEach((tr, ri) => {
      const tcs = kids(tr, "tc");
      const rowCtx = tcs.map(cellText).filter(Boolean).join(" | ").slice(0, 120);
      // label cell followed by an empty cell
      for (let i = 0; i < tcs.length - 1; i++) {
        const label = cellText(tcs[i]);
        if (!label || label.length > 80 || !isEmptyCell(tcs[i + 1])) continue;
        const target = tcs[i + 1]; // capture now: the closure must not see the later i++
        kids(tcs[i], "p").forEach((p) => consumed.add(p));
        kids(target, "p").forEach((p) => consumed.add(p));
        add({ anchor: target, label: cleanLabel(label), context: rowCtx, apply: (v) => fillCell(doc, target, v) });
        i++;
      }
      // header row with an empty row beneath
      const next = rows[ri + 1] && kids(rows[ri + 1], "tc");
      if (tcs.length >= 2 && next && next.length === tcs.length && tcs.every((c) => cellText(c) && cellText(c).length < 40) && next.every(isEmptyCell)) {
        tcs.forEach((tc, i) => {
          kids(tc, "p").forEach((p) => consumed.add(p));
          kids(next[i], "p").forEach((p) => consumed.add(p));
          add({ anchor: next[i], label: cleanLabel(cellText(tc)), context: `column "${cellText(tc)}"`, apply: (v) => fillCell(doc, next[i], v) });
        });
      }
    });
  }

  // 3. paragraphs
  for (const p of all(body, "p")) {
    if (consumed.has(p) || ancestor(p, "sdtContent")) continue;
    const text = pText(p);
    if (!text.trim()) continue;
    const ctx = flat(text).slice(0, 120);
    let sub = 0;
    let matchedBlank = false;

    for (const m of text.matchAll(/([^:：_.\n]{2,60}?)\s*[:：]?\s*(_{3,}|\.{4,}|…{2,})/g)) {
      const blankStart = m.index + m[0].length - m[2].length;
      const blankEnd = m.index + m[0].length;
      add({ anchor: p, sub: sub++, label: cleanLabel(m[1]), context: ctx, apply: (v) => replaceRange(doc, p, blankStart, blankEnd, v) });
      matchedBlank = true;
    }
    for (const m of text.matchAll(/([☐□])\s*([^☐□☒☑\n]{1,60})/g)) {
      const at = m.index;
      add({ anchor: p, sub: sub++, label: cleanLabel(m[2]), type: "boolean", context: ctx, apply: (v) => /^(true|yes|1|on)$/i.test(String(v)) && replaceRange(doc, p, at, at + 1, "☒") });
      matchedBlank = true;
    }
    if (!matchedBlank) {
      const m = text.match(/^\s*([^:：\n]{2,40}?)\s*[:：]\s*$/);
      if (m && m[1].trim().split(/\s+/).length <= 6) {
        add({ anchor: p, label: cleanLabel(m[1]), context: ctx, apply: (v) => appendToParagraph(doc, p, ` ${v}`) });
      }
    }
  }

  found.sort((a, b) => order.get(a.anchor) - order.get(b.anchor) || a.sub - b.sub);
  return found.slice(0, MAX_FIELDS);
}

const dedupe = (fields) => {
  const seen = new Map();
  for (const f of fields) {
    const n = (seen.get(f.label) ?? 0) + 1;
    seen.set(f.label, n);
    if (n > 1) f.label = `${f.label} (${n})`;
  }
  return fields;
};

// ---------- entry point ----------
export async function analyzeDocx(buffer, { requireFields = true } = {}) {
  let zip, xml;
  try {
    zip = await JSZip.loadAsync(buffer);
    xml = await zip.file("word/document.xml")?.async("string");
  } catch {
    /* handled below */
  }
  if (!xml) throw new ToolError("That Word file couldn't be read. Save it as .docx and try again.");

  const analyse = () => {
    const doc = new DOMParser().parseFromString(xml, "text/xml");
    return { doc, fields: detect(doc) };
  };

  const { fields: found } = analyse();
  if (!found.length && requireFields) {
    throw new ToolError("I couldn't find anything to fill in this Word file (no content controls, empty table cells, or 'Label: ____' lines).");
  }
  const fields = dedupe(found.map((f, i) => ({ name: `f${i + 1}`, label: f.label || `Field ${i + 1}`, type: f.type, ...(f.options ? { options: f.options } : {}), context: f.context })));

  return {
    kind: "docx",
    fields,
    async fill(values) {
      const { doc, fields: live } = analyse(); // fresh DOM: detection is deterministic, so indexes line up
      let applied = 0;
      const skipped = [];
      // apply bottom-up so several blanks in one paragraph keep their offsets
      for (let i = live.length - 1; i >= 0; i--) {
        const v = values[`f${i + 1}`];
        if (v == null || v === "") continue;
        try {
          live[i].apply(String(v));
          applied++;
        } catch (e) {
          skipped.push({ name: `f${i + 1}`, label: fields[i]?.label, reason: String(e.message).slice(0, 120) });
        }
      }
      const out = new JSZip();
      for (const [name, file] of Object.entries(zip.files)) {
        if (file.dir) continue;
        out.file(name, name === "word/document.xml" ? new XMLSerializer().serializeToString(doc) : await file.async("nodebuffer"));
      }
      return { buffer: await out.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }), skipped, applied };
    },
  };
}
