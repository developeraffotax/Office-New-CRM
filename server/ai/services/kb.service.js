// ai/services/kb.service.js
// Business logic for projects / products / documents. Routes stay thin.
import fs from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";
import { KbProject, KbProduct, KbDocument, KbChunk, KbDataset } from "../models/kb.models.js";
import { removeDatasetsFor } from "../datasets/datasetIngest.js";
import { enqueueDocument, enqueueDescription } from "../queue/ingest.queue.js";

const oid = (id) => new mongoose.Types.ObjectId(String(id));
const notFound = (what = "Item") => Object.assign(new Error(`${what} not found`), { status: 404 });
const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));
const sameSet = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
const removeFiles = (docs) => Promise.allSettled(docs.filter((d) => d.storagePath).map((d) => fs.unlink(d.storagePath)));
const SHEET_EXT = new Set([".xlsx", ".csv"]);

// Removes everything the AI knows for a filter: chunks, datasets + rows, document records.
async function purge(filter) {
  await Promise.all([KbChunk.deleteMany(filter), removeDatasetsFor(filter), KbDocument.deleteMany(filter)]);
}

// ---------- Projects ----------
export async function listProjects() {
  const [projects, counts] = await Promise.all([
    KbProject.find().sort({ name: 1 }).lean(),
    KbProduct.aggregate([{ $group: { _id: "$projectId", n: { $sum: 1 } } }]),
  ]);
  const byId = new Map(counts.map((c) => [String(c._id), c.n]));
  return projects.map((p) => ({ ...p, productCount: byId.get(String(p._id)) || 0 }));
}

export const createProject = (data, userId) =>
  KbProject.create({ name: data.name, description: data.description, createdBy: userId });

export async function updateProject(id, data) {
  const project = await KbProject.findByIdAndUpdate(id, clean({ name: data.name, description: data.description }), {
    new: true,
    runValidators: true,
  });
  if (!project) throw notFound("Project");
  if (data.name) {
    const set = { $set: { "source.project": project.name } };
    await Promise.all([KbChunk.updateMany({ projectId: id }, set), KbDataset.updateMany({ projectId: id }, set)]);
  }
  return project;
}

export async function deleteProject(id) {
  const docs = await KbDocument.find({ projectId: id }).select("storagePath").lean();
  await purge({ projectId: id });
  await KbProduct.deleteMany({ projectId: id });
  await KbProject.findByIdAndDelete(id);
  await removeFiles(docs);
}

// ---------- Products ----------
export async function listProducts(projectId) {
  const [products, counts] = await Promise.all([
    KbProduct.find({ projectId }).sort({ name: 1 }).lean(),
    KbDocument.aggregate([
      { $match: { projectId: oid(projectId), kind: "file" } },
      { $group: { _id: "$productId", n: { $sum: 1 } } },
    ]),
  ]);
  const byId = new Map(counts.map((c) => [String(c._id), c.n]));
  return products.map((p) => ({ ...p, documentCount: byId.get(String(p._id)) || 0 }));
}

export async function createProduct(projectId, data, userId) {
  if (!(await KbProject.exists({ _id: projectId }))) throw notFound("Project");
  const product = await KbProduct.create({
    projectId,
    name: data.name,
    description: data.description || "",
    allowedRoles: data.allowedRoles || [],
    createdBy: userId,
  });
  if (product.description.trim()) await enqueueDescription(product._id);
  return product;
}

export async function getProduct(id) {
  const product = await KbProduct.findById(id).lean();
  if (!product) throw notFound("Product");
  const documents = await KbDocument.find({ productId: id, kind: "file" }).sort({ createdAt: -1 }).lean();
  return { product, documents };
}

export async function updateProduct(id, data) {
  const product = await KbProduct.findById(id);
  if (!product) throw notFound("Product");
  const before = { name: product.name, description: product.description, roles: [...product.allowedRoles] };

  if (data.name !== undefined) product.name = data.name;
  if (data.description !== undefined) product.description = data.description;
  if (data.allowedRoles !== undefined) product.allowedRoles = data.allowedRoles;
  await product.save();

  // Keep the denormalised copies (chunks AND datasets) in sync.
  const both = (set) => Promise.all([KbChunk.updateMany({ productId: id }, set), KbDataset.updateMany({ productId: id }, set)]);
  if (product.name !== before.name) await both({ $set: { "source.product": product.name } });
  if (!sameSet(product.allowedRoles, before.roles))
    await both({ $set: { allowedRoles: product.allowedRoles.length ? product.allowedRoles : ["all"] } });
  if (product.description !== before.description) await enqueueDescription(id);
  return product;
}

export async function deleteProduct(id) {
  const docs = await KbDocument.find({ productId: id }).select("storagePath").lean();
  await purge({ productId: id });
  await KbProduct.findByIdAndDelete(id);
  await removeFiles(docs);
}

// ---------- Documents ----------
export async function addDocuments(productId, files, userId) {
  const product = await KbProduct.findById(productId).lean();
  if (!product) {
    await removeFiles(files.map((f) => ({ storagePath: f.path })));
    throw notFound("Product");
  }
  const docs = await KbDocument.insertMany(
    files.map((f) => ({
      projectId: product.projectId,
      productId,
      kind: "file",
      isDataset: SHEET_EXT.has(path.extname(f.originalname).toLowerCase()),
      filename: f.originalname,
      mimeType: f.mimetype,
      size: f.size,
      storagePath: f.path,
      status: "queued",
      uploadedBy: userId,
    }))
  );
  await Promise.all(docs.map((d) => enqueueDocument(d._id)));
  return docs;
}

export async function deleteDocument(id) {
  const doc = await KbDocument.findById(id);
  if (!doc) throw notFound("Document");
  await Promise.all([KbChunk.deleteMany({ documentId: id }), removeDatasetsFor({ documentId: id })]);
  await doc.deleteOne();
  await removeFiles([doc]);
}

export async function retryDocument(id) {
  const doc = await KbDocument.findByIdAndUpdate(id, { status: "queued", error: null }, { new: true });
  if (!doc) throw notFound("Document");
  await enqueueDocument(id);
  return doc;
}
