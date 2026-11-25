// ai/routes/kb.routes.js — admin-only knowledge base management.
// npm i multer
import { Router } from "express";
import multer from "multer";
import mongoose from "mongoose";
import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
// Point these at your existing auth middleware.
import { protect, requireAdmin } from "../middleware/aiAuth.js";
import * as kb from "../services/kb.service.js";

const UPLOAD_DIR = process.env.KB_UPLOAD_DIR || "uploads/kb";
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED = new Set([".pdf", ".docx", ".txt", ".md", ".csv", ".xlsx"]);
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${randomUUID()}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 25 * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) =>
    ALLOWED.has(path.extname(file.originalname).toLowerCase())
      ? cb(null, true)
      : cb(new Error(`"${file.originalname}" isn't supported. Use PDF, DOCX, TXT, MD, XLSX or CSV.`)),
});
const uploadFiles = (req, res, next) =>
  upload.array("files", 10)(req, res, (err) => (err ? res.status(400).json({ message: err.message }) : next()));

// Wraps async handlers and maps errors to JSON.
const ah = (fn) => (req, res) =>
  fn(req, res).catch((e) => {
    const status = e.status || (e.name === "ValidationError" ? 400 : 500);
    if (status === 500) console.error("[kb]", e);
    res.status(status).json({ message: status === 500 ? "Server error" : e.message });
  });

const needName = (req, res, next) =>
  String(req.body?.name || "").trim() ? next() : res.status(400).json({ message: "Name is required" });

const router = Router();
router.use(protect, requireAdmin);

for (const p of ["projectId", "productId", "docId"])
  router.param(p, (_req, res, next, id) =>
    mongoose.isValidObjectId(id) ? next() : res.status(400).json({ message: "Invalid id" })
  );

// Role names for the "who can ask about this" chips (from your Role collection)
router.get("/roles", ah(async (_req, res) => {
  const roles = await mongoose.model("Role").find().select("name").sort({ name: 1 }).lean();
  res.json(roles.map((r) => r.name));
}));

// Projects
router.get("/projects", ah(async (_req, res) => res.json(await kb.listProjects())));
router.post("/projects", needName, ah(async (req, res) => res.status(201).json(await kb.createProject(req.body, req.user._id))));
router.patch("/projects/:projectId", ah(async (req, res) => res.json(await kb.updateProject(req.params.projectId, req.body))));
router.delete("/projects/:projectId", ah(async (req, res) => (await kb.deleteProject(req.params.projectId), res.json({ ok: true }))));

// Products
router.get("/projects/:projectId/products", ah(async (req, res) => res.json(await kb.listProducts(req.params.projectId))));
router.post("/projects/:projectId/products", needName, ah(async (req, res) => res.status(201).json(await kb.createProduct(req.params.projectId, req.body, req.user._id))));
router.get("/products/:productId", ah(async (req, res) => res.json(await kb.getProduct(req.params.productId))));
router.patch("/products/:productId", ah(async (req, res) => res.json(await kb.updateProduct(req.params.productId, req.body))));
router.delete("/products/:productId", ah(async (req, res) => (await kb.deleteProduct(req.params.productId), res.json({ ok: true }))));

// Documents
router.post("/products/:productId/documents", uploadFiles, ah(async (req, res) => {
  if (!req.files?.length) return res.status(400).json({ message: "Choose at least one file" });
  res.status(201).json(await kb.addDocuments(req.params.productId, req.files, req.user._id));
}));
router.delete("/documents/:docId", ah(async (req, res) => (await kb.deleteDocument(req.params.docId), res.json({ ok: true }))));
router.post("/documents/:docId/retry", ah(async (req, res) => res.json(await kb.retryDocument(req.params.docId))));

export default router;
