// ai/rag/ingest.js
// Documents → text → chunks → embeddings → KbChunk (for RAG).
// Spreadsheets (.xlsx/.csv) → datasets (rows), handled in datasets/datasetIngest.js.
// npm i pdf-parse@1.1.1 mammoth
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import pdf from "pdf-parse/lib/pdf-parse.js"; // lib file directly: avoids pdf-parse's debug-mode bug under ESM
import mammoth from "mammoth";
import { KbDocument, KbProduct, KbChunk } from "../models/kb.models.js";
import { chunkText } from "./chunk.js";
import { embed, EMBED_ID } from "../core/llm.js";
import { ingestDatasets } from "../datasets/datasetIngest.js";

const TEXT_EXT = new Set([".txt", ".md", ".json"]);
export const SPREADSHEET_EXT = new Set([".xlsx", ".csv"]);

async function extractText(filePath, filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".pdf") return (await pdf(await fs.readFile(filePath))).text;
  if (ext === ".docx") return (await mammoth.extractRawText({ path: filePath })).value;
  if (TEXT_EXT.has(ext)) return fs.readFile(filePath, "utf8");
  throw new Error(`Unsupported file type "${ext}". Use PDF, DOCX, TXT, MD, XLSX or CSV.`);
}

// Insert the new chunks first, then delete the old ones, so search never sees a gap.
async function writeChunks({ document, product, label, text }) {
  const pieces = chunkText(text);
  if (!pieces.length) throw new Error("No readable text found (scanned PDFs need OCR first).");

  // Prefixing product + file name gives each chunk context and improves retrieval.
  const vectors = await embed(pieces.map((p) => `${product.name} | ${label}\n${p}`), "document");

  const ingestId = randomUUID();
  const roles = product.allowedRoles?.length ? product.allowedRoles : ["all"];
  await KbChunk.insertMany(
    pieces.map((p, i) => ({
      projectId: product.projectId._id,
      productId: product._id,
      documentId: document._id,
      ingestId,
      embeddingModel: EMBED_ID,
      position: i,
      text: p,
      embedding: vectors[i],
      allowedRoles: roles,
      source: { project: product.projectId.name, product: product.name, file: label },
    })),
    { ordered: false }
  );
  await KbChunk.deleteMany({ documentId: document._id, ingestId: { $ne: ingestId } });
  return pieces.length;
}

const loadProduct = (id) => KbProduct.findById(id).populate("projectId", "name");

/** Index an uploaded file (document → chunks, spreadsheet → datasets). Safe to retry. */
export async function ingestDocument(documentId) {
  const document = await KbDocument.findById(documentId);
  if (!document) return; // deleted before the worker got to it
  await KbDocument.updateOne({ _id: documentId }, { status: "processing", error: null });
  try {
    const product = await loadProduct(document.productId);
    if (!product) throw new Error("Product no longer exists");

    if (document.isDataset) {
      const { rows } = await ingestDatasets({ document, product });
      await KbDocument.updateOne({ _id: documentId }, { status: "ready", rowCount: rows, chunkCount: 0 });
    } else {
      const text = await extractText(document.storagePath, document.filename);
      const chunkCount = await writeChunks({ document, product, label: document.filename, text });
      await KbDocument.updateOne({ _id: documentId }, { status: "ready", chunkCount });
    }
  } catch (err) {
    await KbDocument.updateOne({ _id: documentId }, { status: "failed", error: err.message });
    throw err; // let BullMQ retry
  }
}

/** (Re)index a product's description text as its own source. */
export async function ingestProductDescription(productId) {
  const product = await loadProduct(productId);
  if (!product) return;
  const text = (product.description || "").trim();
  let document = await KbDocument.findOne({ productId, kind: "description" });

  if (!text) {
    if (document) {
      await KbChunk.deleteMany({ documentId: document._id });
      await document.deleteOne();
    }
    return;
  }
  document ||= await KbDocument.create({
    projectId: product.projectId._id,
    productId,
    kind: "description",
    filename: "Product description",
    status: "processing",
  });
  const chunkCount = await writeChunks({ document, product, label: "Product description", text });
  await KbDocument.updateOne({ _id: document._id }, { status: "ready", chunkCount, error: null });
}