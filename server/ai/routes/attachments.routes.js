// ai/routes/attachments.routes.js — attach any file, download results.
//   POST /attachments            upload (PDF, Word, Excel, CSV, PowerPoint, text, images)
//   POST /attachments/:id/fill   fill a PDF/Word form with reviewed values → file
//   GET  /attachments/:id/download
import { Router } from "express";
import multer from "multer";
import mongoose from "mongoose";
import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { protect } from "../middleware/aiAuth.js";
import { rateLimit } from "../core/rateLimit.js";
import { ToolError } from "../agent/toolkit.js";
import {
  ATTACH_DIR, SUPPORTED_EXT, SUPPORTED_LABEL, createAttachment, fillAttachmentForm, getOwnAttachment, mimeFor,
} from "../attachments/attachments.service.js";

fs.mkdirSync(ATTACH_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: ATTACH_DIR,
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 25 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (SUPPORTED_EXT.has(ext)) return cb(null, true);
    cb(new Error(ext === ".doc" || ext === ".xls" ? `Old ${ext} files aren't supported. Save as ${ext}x and try again.` : `Attach a ${SUPPORTED_LABEL} file.`));
  },
});
const uploadOne = (req, res, next) => upload.single("file")(req, res, (err) => (err ? res.status(400).json({ message: err.message }) : next()));

const ah = (fn) => (req, res) =>
  fn(req, res).catch((e) => {
    const status = e.status || (e instanceof ToolError ? 422 : 500);
    if (status === 500) console.error("[attachments]", e);
    res.status(status).json({ message: status === 500 ? "Server error" : e.message, errors: e.errors });
  });
const validId = (req, res, next) => (mongoose.isValidObjectId(req.params.id) ? next() : res.status(400).json({ message: "Invalid id" }));

const router = Router();

router.post("/attachments", protect, rateLimit({ name: "attach", limit: 15, windowSec: 60 }), uploadOne, ah(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: `Choose a ${SUPPORTED_LABEL} file` });
  res.status(201).json(await createAttachment(req.file, req.user));
}));

router.post("/attachments/:id/fill", protect, validId, rateLimit({ name: "fill", limit: 20, windowSec: 60 }), ah(async (req, res) => {
  const out = await fillAttachmentForm(req.params.id, req.user, req.body?.values);
  res.set("Access-Control-Expose-Headers", "X-Skipped, Content-Disposition");
  res.set("X-Skipped", encodeURIComponent(JSON.stringify(out.skipped)));
  res.attachment(out.filename);
  res.type(out.mime).send(out.buffer);
}));

router.get("/attachments/:id/download", protect, validId, ah(async (req, res) => {
  const doc = await getOwnAttachment(req.params.id, req.user);
  if (!doc) return res.status(404).json({ message: "That file has expired." });
  res.set("Access-Control-Expose-Headers", "Content-Disposition");
  res.type(mimeFor(doc.filename));
  res.download(path.resolve(doc.storagePath), doc.filename);
}));

export default router;
