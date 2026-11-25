// ai/forms/pdfForm.js — analyse and fill PDF forms.
//   pdf_acro: a real fillable PDF (AcroForm). Deterministic: fields are filled by name.
//   pdf_flat: a PDF with no form fields. Best effort: finds "Label: ____" lines and writes text on top.
// npm i pdf-lib
import {
  PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFOptionList, PDFRadioGroup,
  PDFButton, PDFSignature, StandardFonts,
} from "pdf-lib";
import { extractPdfText, groupLines } from "./pdfText.js";
import { ToolError } from "../agent/toolkit.js";

const BLANK_ITEM = /^[\s_.\-–—…]{4,}$/; // an item that is just a line to write on
const BLANKS = /([_]{3,}|\.{4,}|…{2,})/;
const clean = (s) => String(s).replace(/[_]{2,}|\.{4,}|…+/g, " ").replace(/\s+/g, " ").replace(/\s*[:：]\s*$/, "").trim().slice(0, 80);

// ---------- helpers: group text into lines, find the label next to a box ----------
const joinRun = (run) => clean(run.map((x) => x.str).join(" "));

export function labelNear(items, r, { preferRight = false } = {}) {
  const mid = r.y + r.height / 2;
  const sameLine = (it) => Math.abs(it.y + it.h / 2 - mid) <= Math.max(6, r.height * 0.7);

  const fromLeft = () => {
    const left = items.filter((it) => it.x + it.w <= r.x + 3 && sameLine(it)).sort((a, b) => b.x - a.x);
    if (!left.length) return "";
    const run = [left[0]];
    for (const it of left.slice(1)) {
      if (run[run.length - 1].x - (it.x + it.w) < 14) run.push(it);
      else break;
    }
    return joinRun(run.reverse());
  };
  const fromRight = () => {
    const right = items.filter((it) => it.x >= r.x + r.width - 3 && sameLine(it)).sort((a, b) => a.x - b.x);
    if (!right.length || right[0].x - (r.x + r.width) > 14) return "";
    const run = [right[0]];
    for (const it of right.slice(1)) {
      if (it.x - (run[run.length - 1].x + run[run.length - 1].w) < 8) run.push(it);
      else break;
    }
    return joinRun(run);
  };
  const fromAbove = () => {
    const top = r.y + r.height;
    const above = items
      .filter((it) => it.y >= top - 2 && it.y - top <= 26 && it.x <= r.x + r.width && it.x + it.w >= r.x - 30)
      .sort((a, b) => a.y - b.y);
    if (!above.length) return "";
    const row = above.filter((it) => Math.abs(it.y - above[0].y) < 3).sort((a, b) => a.x - b.x);
    return joinRun(row);
  };

  const order = preferRight ? [fromRight, fromLeft, fromAbove] : [fromLeft, fromAbove, fromRight];
  for (const f of order) {
    const label = f();
    if (label) return label;
  }
  return "";
}

const dedupeLabels = (fields) => {
  const seen = new Map();
  for (const f of fields) {
    const n = (seen.get(f.label) ?? 0) + 1;
    seen.set(f.label, n);
    if (n > 1) f.label = `${f.label} (${n})`;
  }
  return fields;
};

// ---------- flat PDFs ----------
export function detectFlatFields(pages) {
  const out = [];
  const add = (pg, x, y, w, label, ctx) => out.push({ page: pg.page, x, y, w, label: label || "", context: ctx });

  for (const pg of pages) {
    for (const line of groupLines(pg.items)) {
      const lineText = line.map((x) => x.str).join(" ").replace(/\s+/g, " ").slice(0, 120);
      line.forEach((it, i) => {
        const prev = line[i - 1];
        const next = line[i + 1];

        if (BLANK_ITEM.test(it.str)) {
          add(pg, it.x, it.y, it.w, prev && !BLANK_ITEM.test(prev.str) ? clean(prev.str) : "", lineText);
          return;
        }
        // "Label: ______" inside one text item (possibly several per item)
        let any = false;
        for (const m of it.str.matchAll(new RegExp(`([^:：_.]{0,50}?)\\s*[:：]?\\s*${BLANKS.source}`, "g"))) {
          const blank = m[2];
          const start = m.index + m[0].length - blank.length;
          const x0 = it.x + it.w * (start / it.str.length);
          const w = it.w * (blank.length / it.str.length);
          add(pg, x0, it.y, w, clean(m[1]) || (prev ? clean(prev.str) : ""), lineText);
          any = true;
        }
        if (any) return;
        // "Label:" followed by empty space
        if (/[:：]\s*$/.test(it.str)) {
          if (next && BLANK_ITEM.test(next.str)) return; // the blank item will claim it
          if (next && next.x - (it.x + it.w) < 40) return; // "Label: value" is static text
          const x0 = it.x + it.w + 4;
          const x1 = next ? next.x - 4 : pg.width - 36;
          if (x1 - x0 >= 40) add(pg, x0, it.y, x1 - x0, clean(it.str), lineText);
        }
      });
    }
  }
  return out;
}

async function analyzeFlat(pages, requireFields) {
  const found = detectFlatFields(pages).slice(0, 200);
  if (!found.length && !requireFields) {
    return { kind: "pdf_flat", fields: [], fill: async () => { throw new ToolError("This PDF has no fields to fill in."); } };
  }
  if (!found.length) {
    const hasText = pages.some((p) => p.items.length);
    throw new ToolError(
      hasText
        ? "I couldn't find any blanks to fill in this PDF (no fillable fields and no 'Label: ____' lines)."
        : "This PDF has no text layer (it looks scanned). Scanned forms aren't supported yet."
    );
  }
  const fields = dedupeLabels(
    found.map((f, i) => ({ name: `f${i + 1}`, label: f.label || `Blank ${i + 1}`, type: "text", page: f.page, context: f.context }))
  );

  return {
    kind: "pdf_flat",
    fields,
    async fill(buffer, values) {
      const pdf = await PDFDocument.load(buffer);
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const skipped = [];
      let applied = 0;
      found.forEach((box, i) => {
        const f = fields[i];
        const v = values[f.name];
        if (v == null || String(v).trim() === "") return;
        const text = String(v).trim();
        try {
          font.encodeText(text); // throws for characters Helvetica can't print
        } catch {
          return skipped.push({ name: f.name, label: f.label, reason: "contains characters this PDF font can't print" });
        }
        let size = 10;
        while (size > 6 && font.widthOfTextAtSize(text, size) > box.w) size -= 0.5;
        if (font.widthOfTextAtSize(text, size) > box.w + 2) {
          return skipped.push({ name: f.name, label: f.label, reason: "too long for the space on the form" });
        }
        pdf.getPage(box.page - 1).drawText(text, { x: box.x + 1, y: box.y + 1.5, size, font });
        applied++;
      });
      return { buffer: Buffer.from(await pdf.save()), skipped, applied };
    },
  };
}

// ---------- fillable PDFs ----------
const typeOf = (f) =>
  f instanceof PDFCheckBox ? "boolean"
  : f instanceof PDFDropdown || f instanceof PDFOptionList || f instanceof PDFRadioGroup ? "select"
  : f instanceof PDFTextField && f.isMultiline() ? "textarea"
  : "text";

async function analyzeAcro(pdf, acroFields, pages) {
  const pageRefs = pdf.getPages().map((p) => String(p.ref));
  const fields = dedupeLabels(
    acroFields.map((f, i) => {
      const w = f.acroField.getWidgets()[0];
      const rect = w?.getRectangle();
      const pageIdx = Math.max(0, pageRefs.indexOf(String(w?.P())));
      const items = pages[pageIdx]?.items ?? [];
      const type = typeOf(f);
      const label = (rect && labelNear(items, rect, { preferRight: type === "boolean" })) || clean(f.getName().split(".").pop().replace(/\[\d+\]/g, ""));
      return {
        name: `f${i + 1}`,
        label,
        type,
        page: pageIdx + 1,
        required: f.isRequired(),
        ...(type === "select" ? { options: f.getOptions() } : {}),
        ...(f instanceof PDFTextField && f.getMaxLength() ? { maxLength: f.getMaxLength() } : {}),
      };
    })
  );
  const refs = acroFields.map((f) => f.getName());

  return {
    kind: "pdf_acro",
    fields,
    async fill(buffer, values) {
      const doc = await PDFDocument.load(buffer);
      const form = doc.getForm();
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const skipped = [];
      let applied = 0;
      for (const [i, f] of fields.entries()) {
        const v = values[f.name];
        if (v == null || v === "") continue;
        try {
          const field = form.getField(refs[i]);
          if (field instanceof PDFTextField) {
            font.encodeText(String(v));
            field.setText(String(v));
          } else if (field instanceof PDFCheckBox) {
            if (v === true || /^(true|yes|1|on)$/i.test(String(v))) field.check();
            else field.uncheck();
          } else if (field instanceof PDFDropdown || field instanceof PDFOptionList || field instanceof PDFRadioGroup) {
            field.select(String(v));
          }
          applied++;
        } catch (e) {
          const reason = /encode|WinAnsi/i.test(e.message) ? "contains characters this PDF font can't print" : String(e.message).slice(0, 120);
          skipped.push({ name: f.name, label: f.label, reason });
        }
      }
      form.updateFieldAppearances(font);
      return { buffer: Buffer.from(await doc.save()), skipped, applied };
    },
  };
}

// ---------- entry point ----------
export async function analyzePdf(buffer, { requireFields = true } = {}) {
  let pdf;
  try {
    pdf = await PDFDocument.load(buffer);
  } catch (e) {
    throw new ToolError(/encrypt/i.test(e.message) ? "This PDF is password-protected. Remove the password and upload it again." : "That PDF couldn't be read.");
  }
  let pages = [];
  try {
    pages = await extractPdfText(buffer);
  } catch (e) {
    console.error("[forms] pdf text extraction failed:", e.message);
  }

  const acro = pdf.getForm().getFields().filter((f) => !(f instanceof PDFButton) && !(f instanceof PDFSignature) && !f.isReadOnly());
  const analysis = acro.length ? await analyzeAcro(pdf, acro, pages) : await analyzeFlat(pages, requireFields);
  return {
    kind: analysis.kind,
    fields: analysis.fields,
    fill: (values) => analysis.fill(buffer, values),
    pageCount: pdf.getPageCount(),
    hasText: pages.some((p) => p.items.length > 0),
  };
}
