// ai/models/kb.models.js
// Project > Product > Documents. A document is either indexed as text (chunks, for RAG)
// or, for spreadsheets, stored as a queryable dataset (rows).
import mongoose from "mongoose";
const { Schema } = mongoose;

const KbProject = mongoose.model(
  "KbProject",
  new Schema(
    {
      name: { type: String, required: true, trim: true, maxlength: 120 },
      description: { type: String, default: "", maxlength: 500 },
      createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
  )
);

const KbProduct = mongoose.model(
  "KbProduct",
  new Schema(
    {
      projectId: { type: Schema.Types.ObjectId, ref: "KbProject", required: true, index: true },
      name: { type: String, required: true, trim: true, maxlength: 120 },
      description: { type: String, default: "", maxlength: 20000 }, // indexed as its own source
      allowedRoles: { type: [String], default: [] }, // empty = everyone
      createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
  )
);

const KbDocument = mongoose.model(
  "KbDocument",
  new Schema(
    {
      projectId: { type: Schema.Types.ObjectId, ref: "KbProject", required: true, index: true },
      productId: { type: Schema.Types.ObjectId, ref: "KbProduct", required: true, index: true },
      kind: { type: String, enum: ["file", "description"], default: "file" },
      isDataset: { type: Boolean, default: false }, // .xlsx / .csv → rows, not chunks
      filename: { type: String, required: true },
      mimeType: String,
      size: Number,
      storagePath: String, // swap for an S3 key in production
      status: { type: String, enum: ["queued", "processing", "ready", "failed"], default: "queued" },
      error: String,
      chunkCount: { type: Number, default: 0 }, // documents
      rowCount: { type: Number, default: 0 }, // spreadsheets (all sheets)
      uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
  )
);

const KbChunk = mongoose.model(
  "KbChunk",
  new Schema(
    {
      projectId: { type: Schema.Types.ObjectId, required: true },
      productId: { type: Schema.Types.ObjectId, required: true, index: true },
      documentId: { type: Schema.Types.ObjectId, required: true, index: true },
      ingestId: String, // swap old chunks for new ones without a gap
      embeddingModel: { type: String, index: true }, // e.g. "voyage:voyage-3.5-lite:1024"
      position: Number,
      text: { type: String, required: true },
      embedding: { type: [Number], select: false },
      allowedRoles: { type: [String], default: ["all"] }, // ACL, copied from the product
      source: { project: String, product: String, file: String }, // denormalised for citations
    },
    { timestamps: true }
  )
);

// One dataset per sheet. Rows live in KbDatasetRow so a 30,000-row file is just 30,000 small docs.
const KbDataset = mongoose.model(
  "KbDataset",
  new Schema(
    {
      projectId: { type: Schema.Types.ObjectId, required: true, index: true },
      productId: { type: Schema.Types.ObjectId, required: true, index: true },
      documentId: { type: Schema.Types.ObjectId, required: true, index: true },
      name: { type: String, required: true }, // "Clients.xlsx / Sheet1"
      columns: [{ _id: false, key: String, label: String, type: { type: String } }],
      preview: { type: [Schema.Types.Mixed], default: [] }, // first rows, shown by describe_dataset
      rowCount: { type: Number, default: 0 },
      truncated: { type: Boolean, default: false },
      allowedRoles: { type: [String], default: ["all"] },
      source: { project: String, product: String, file: String },
    },
    { timestamps: true }
  )
);

const KbDatasetRow = mongoose.model(
  "KbDatasetRow",
  new Schema(
    {
      datasetId: { type: Schema.Types.ObjectId, required: true, index: true },
      n: Number, // row number in the sheet (1 = first data row)
      data: Schema.Types.Mixed, // { column_key: value }
    },
    { minimize: false }
  )
);

export { KbProject, KbProduct, KbDocument, KbChunk, KbDataset, KbDatasetRow };