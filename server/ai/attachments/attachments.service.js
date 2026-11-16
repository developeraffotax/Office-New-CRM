// ai/attachments/attachments.service.js — any file attached in the chat: store it, describe it, fill it, hand back results.
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { AiAttachment } from "../models/agent.models.js";
import { analyzePdf } from "./pdfForm.js";
import { analyzeDocx } from "./docxForm.js";
import { sheetsFromXlsx, sheetsFromCsv } from "../datasets/datasetIngest.js";
import { validateValues } from "../agent/forms/registry.js";
import { ToolError } from "../agent/toolkit.js";

export const ATTACH_DIR = process.env.AI_ATTACHMENT_DIR || "uploads/attachments";
const TTL_MS = 7 * 24 * 3600 * 1000;
const IMAGE_MAX = 8 * 1024 * 1024;
const VISION_MAX = 5 * 1024 * 1024;

export const EXT_KIND = {
  ".pdf": "pdf", ".docx": "docx", ".xlsx": "xlsx", ".csv": "csv", ".pptx": "pptx",
  ".txt": "text", ".md": "text", ".json": "text",
  ".png": "image", ".jpg": "image", ".jpeg": "image", ".webp": "image", ".gif": "image",
};
export const SUPPORTED_EXT = new Set(Object.keys(EXT_KIND));
export const SUPPORTED_LABEL = "PDF, Word, Excel, CSV, PowerPoint, text or image";

const MIME = {
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".csv": "text/csv", ".txt": "text/plain", ".md": "text/markdown", ".json": "application/json",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif",
};
export const mimeFor = (filename) => MIME[path.extname(filename).toLowerCase()] || "application/octet-stream";

const httpError = (msg, status, extra = {}) => Object.assign(new ToolError(msg), { status, ...extra });
const unlinkQuiet = (p) => fs.unlink(p).catch(() => {});

// ---------- describing ----------
async function sheetMeta(kind, filePath) {
  const sheets = [];
  for await (const s of kind === "csv" ? sheetsFromCsv(filePath) : sheetsFromXlsx(filePath)) {
    let rows = 0;
    const preview = [];
    for await (const r of s.rows) {
      if (r.every((v) => v == null)) continue;
      rows++;
      if (preview.length < 4) preview.push(r.slice(0, 12).map((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v)));
    }
    sheets.push({ name: s.name || "CSV", rows, preview });
  }
  return { sheets };
}

const LABEL = { pdf: "PDF", docx: "Word document", xlsx: "spreadsheet", csv: "CSV", pptx: "PowerPoint", text: "text file", image: "image" };

export function summarize(d) {
  const m = d.meta || {};
  const parts = [];
  if (m.sheets) parts.push(`${m.sheets.length} sheet${m.sheets.length === 1 ? "" : "s"}, ${m.sheets.reduce((a, s) => a + s.rows, 0).toLocaleString()} rows`);
  if (m.pages) parts.push(`${m.pages} page${m.pages === 1 ? "" : "s"}${m.scanned ? ", scanned (no text)" : ""}`);
  if (d.generated) parts.push("generated");
  if (d.fields?.length) parts.push(`${d.fields.length} form fields`);
  return parts.join(", ");
}

export const publicAttachment = (d) => ({
  id: String(d._id),
  filename: d.filename,
  kind: d.kind,
  label: LABEL[d.kind],
  formKind: d.formKind || null,
  fieldCount: d.fields?.length || 0,
  summary: summarize(d),
});

// ---------- upload ----------
export async function createAttachment(file, user) {
  const ext = path.extname(file.originalname).toLowerCase();
  const kind = EXT_KIND[ext];
  try {
    if (!kind) throw httpError(`Unsupported file. Attach a ${SUPPORTED_LABEL} file.`, 422);
    if (kind === "image" && file.size > IMAGE_MAX) throw httpError("Images can be up to 8 MB.", 422);

    let fields = [];
    let formKind = null;
    let meta = {};
    if (kind === "pdf" || kind === "docx") {
      const buffer = await fs.readFile(file.path);
      const a = kind === "pdf" ? await analyzePdf(buffer, { requireFields: false }) : await analyzeDocx(buffer, { requireFields: false });
      fields = a.fields;
      formKind = fields.length ? a.kind : null;
      if (kind === "pdf") meta = { pages: a.pageCount, scanned: !a.hasText };
    } else if (kind === "xlsx" || kind === "csv") {
      try {
        meta = await sheetMeta(kind, file.path);
      } catch {
        throw httpError(`That ${LABEL[kind]} couldn't be read. Is the file damaged?`, 422);
      }
    }

    const doc = await AiAttachment.create({
      userId: user._id, filename: file.originalname, kind, formKind, size: file.size,
      storagePath: file.path, fields, meta, expiresAt: new Date(Date.now() + TTL_MS),
    });
    return publicAttachment(doc);
  } catch (err) {
    await unlinkQuiet(file.path);
    throw err instanceof ToolError && !err.status ? Object.assign(err, { status: 422 }) : err;
  }
}

/** Only the owner can reach an attachment. Returns null if it doesn't exist or has expired. */
export const getOwnAttachment = (id, user) => AiAttachment.findOne({ _id: id, userId: user._id, expiresAt: { $gt: new Date() } });

// ---------- results the agent creates (a filled copy of a sheet, etc.) ----------
export async function saveGenerated(user, { buffer, filename, parent, meta = {} }) {
  const ext = path.extname(filename).toLowerCase();
  await fs.mkdir(ATTACH_DIR, { recursive: true });
  const storagePath = path.join(ATTACH_DIR, `${Date.now()}-${randomUUID()}${ext}`);
  await fs.writeFile(storagePath, buffer);
  const doc = await AiAttachment.create({
    userId: user._id, filename, kind: EXT_KIND[ext], size: buffer.length, storagePath, generated: true,
    parentId: parent?._id, meta, fields: [], expiresAt: new Date(Date.now() + TTL_MS),
  });
  return publicAttachment(doc);
}

// ---------- form fill (PDF / Word with fields) ----------
export async function fillAttachmentForm(id, user, rawValues) {
  const doc = await getOwnAttachment(id, user);
  if (!doc) throw httpError("That file has expired. Attach it again.", 404);
  if (!doc.formKind) throw httpError("This file has no form fields to fill.", 400);

  const { values, errors } = validateValues({ fields: doc.fields }, rawValues);
  if (Object.keys(errors).length) throw httpError("Please fix the highlighted fields", 400, { errors });

  let buffer;
  try {
    buffer = await fs.readFile(doc.storagePath);
  } catch {
    throw httpError("That file has expired. Attach it again.", 404);
  }
  const analysis = await (doc.kind === "pdf" ? analyzePdf(buffer) : analyzeDocx(buffer)); // deterministic, so field names line up
  const out = await analysis.fill(values);
  return { ...out, filename: `filled-${doc.filename}`, mime: mimeFor(doc.filename) };
}

/** Images attached to this request, as vision parts for the model. */
export async function loadImageParts(docs) {
  if (process.env.AI_VISION === "false") return [];
  const parts = [];
  for (const d of docs.filter((x) => x.kind === "image" && x.size <= VISION_MAX).slice(0, 3)) {
    try {
      parts.push({ type: "image", mediaType: mimeFor(d.filename), data: (await fs.readFile(d.storagePath)).toString("base64") });
    } catch {
      /* expired or missing: skip */
    }
  }
  return parts;
}

// ---------- cleanup ----------
export async function purgeExpiredAttachments() {
  const old = await AiAttachment.find({ expiresAt: { $lte: new Date() } }).select("storagePath").limit(200).lean();
  if (!old.length) return;
  await Promise.all(old.map((d) => unlinkQuiet(d.storagePath)));
  await AiAttachment.deleteMany({ _id: { $in: old.map((d) => d._id) } });
}

export function startAttachmentCleanup() {
  const run = () => purgeExpiredAttachments().catch((e) => console.error("[attachments] cleanup:", e.message));
  run();
  const timer = setInterval(run, 3600 * 1000);
  timer.unref();
  return timer;
}
