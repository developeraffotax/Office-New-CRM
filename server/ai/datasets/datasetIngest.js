// ai/datasets/datasetIngest.js
// .xlsx / .csv → typed rows in Mongo. Streams the file, so 30,000+ rows never sit in memory.
// npm i exceljs csv-parse
import fs from "node:fs";
import path from "node:path";
import ExcelJS from "exceljs";
import { parse as parseCsv } from "csv-parse";
import { KbDataset, KbDatasetRow } from "../models/kb.models.js";

const MAX_ROWS = 200_000;
const MAX_COLS = 100;
const SAMPLE = 500; // rows used to infer column types
const BATCH = 1000;

// ---------- cell + type helpers ----------
export function cellValue(v) {
  if (v == null) return null;
  if (v instanceof Date) return v;
  if (typeof v === "object") {
    if ("result" in v) return cellValue(v.result); // formula
    if ("richText" in v) return cellValue(v.richText.map((r) => r.text).join(""));
    if ("text" in v) return cellValue(v.text); // hyperlink
    return null; // errors etc.
  }
  if (typeof v === "string") {
    const t = v.trim();
    return t === "" ? null : t;
  }
  return v;
}

const NUM_RE = /^-?\d{1,3}(,\d{3})*(\.\d+)?$|^-?\d+(\.\d+)?$/;
const ISO_RE = /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/;

export function inferType(values) {
  const v = values.filter((x) => x != null);
  if (!v.length) return "string";
  if (v.every((x) => typeof x === "number" || (typeof x === "string" && NUM_RE.test(x)))) return "number";
  if (v.every((x) => x instanceof Date || (typeof x === "string" && ISO_RE.test(x) && !isNaN(Date.parse(x))))) return "date";
  if (v.every((x) => typeof x === "boolean")) return "boolean";
  return "string";
}

export function coerce(v, type) {
  if (v == null) return null;
  switch (type) {
    case "number":
      if (typeof v === "number") return v;
      { const n = Number(String(v).replace(/,/g, "")); return Number.isFinite(n) ? n : null; }
    case "date":
      if (v instanceof Date) return isNaN(v) ? null : v;
      { const d = new Date(v); return isNaN(d) ? null : d; }
    case "boolean":
      return typeof v === "boolean" ? v : null;
    default:
      if (v instanceof Date) return v.toISOString().slice(0, 10);
      return String(v);
  }
}

export function slugify(label, taken, i) {
  let base =
    String(label).toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || `column_${i + 1}`;
  if (/^\d/.test(base)) base = `c_${base}`;
  let key = base;
  for (let n = 2; taken.has(key); n++) key = `${base}_${n}`;
  taken.add(key);
  return key;
}

// ---------- core: pure streaming pipeline (no database inside, so it is easy to test) ----------
/**
 * rows: async iterable of arrays. The first non-empty row is the header.
 * onSchema(columns) is awaited once, before any rows; onBatch([{ n, data }]) per ~1000 rows.
 */
export async function processSheet(rows, { onSchema, onBatch, maxRows = MAX_ROWS }) {
  let header = null;
  let columns = null;
  const sample = [];
  let batch = [];
  let count = 0;
  let truncated = false;

  const toData = (raw) => {
    const data = {};
    columns.forEach((c, i) => {
      const val = coerce(raw[i], c.type);
      if (val !== null) data[c.key] = val;
    });
    return { n: ++count, data };
  };
  const begin = async () => {
    const width = Math.min(header.length, MAX_COLS);
    const taken = new Set();
    columns = Array.from({ length: width }, (_, i) => {
      const label = String(header[i] ?? `Column ${i + 1}`).trim();
      return { key: slugify(label, taken, i), label, type: inferType(sample.map((r) => r[i])) };
    });
    await onSchema(columns);
    for (const r of sample) batch.push(toData(r));
    sample.length = 0;
  };

  for await (const raw of rows) {
    if (!raw.length || raw.every((v) => v == null)) continue;
    if (!header) {
      header = raw;
      continue;
    }
    if (count + sample.length >= maxRows) {
      truncated = true;
      break;
    }
    if (!columns) {
      sample.push(raw);
      if (sample.length >= SAMPLE) await begin();
    } else {
      batch.push(toData(raw));
    }
    if (columns && batch.length >= BATCH) {
      await onBatch(batch);
      batch = [];
    }
  }
  if (!header) return null;
  if (!columns) await begin();
  if (batch.length) await onBatch(batch);
  return { columns, rowCount: count, truncated };
}

// ---------- file readers ----------
async function* xlsxRows(ws) {
  for await (const row of ws) yield Array.from((row.values || []).slice(1), cellValue);
}

export async function* sheetsFromXlsx(filePath) {
  const wb = new ExcelJS.stream.xlsx.WorkbookReader(filePath, {
    worksheets: "emit",
    sharedStrings: "cache",
    hyperlinks: "ignore",
    styles: "cache", // needed so date cells are read as dates, not serial numbers
    entries: "ignore",
  });
  let i = 0;
  for await (const ws of wb) {
    i++;
    yield { name: ws.name || `Sheet${i}`, rows: xlsxRows(ws) };
  }
}

export function sniffDelimiter(filePath) {
  const head = fs.readFileSync(filePath, { encoding: "utf8" }).slice(0, 4096).split(/\r?\n/)[0] || "";
  const counts = [",", ";", "\t", "|"].map((d) => [d, head.split(d).length - 1]);
  return counts.sort((a, b) => b[1] - a[1])[0][0] || ",";
}

async function* csvRows(filePath) {
  const parser = fs
    .createReadStream(filePath)
    .pipe(parseCsv({ bom: true, relax_column_count: true, skip_empty_lines: true, delimiter: sniffDelimiter(filePath) }));
  for await (const r of parser) yield r.map(cellValue);
}

export async function* sheetsFromCsv(filePath) {
  yield { name: "", rows: csvRows(filePath) };
}

// ---------- database wrapper ----------
export async function removeDatasetsFor(filter) {
  const ids = (await KbDataset.find(filter).select("_id").lean()).map((d) => d._id);
  if (!ids.length) return;
  await KbDatasetRow.deleteMany({ datasetId: { $in: ids } });
  await KbDataset.deleteMany({ _id: { $in: ids } });
}

/** Parse every sheet of the document and store it. Returns { datasets, rows }. */
export async function ingestDatasets({ document, product }) {
  const ext = path.extname(document.filename).toLowerCase();
  const base = document.filename.replace(/\.[^.]+$/, "");
  const sheets = ext === ".csv" ? sheetsFromCsv(document.storagePath) : sheetsFromXlsx(document.storagePath);

  await removeDatasetsFor({ documentId: document._id }); // re-ingest replaces
  const roles = product.allowedRoles?.length ? product.allowedRoles : ["all"];
  let datasets = 0;
  let rows = 0;

  for await (const sheet of sheets) {
    let dataset = null;
    const result = await processSheet(sheet.rows, {
      onSchema: async (columns) => {
        dataset = await KbDataset.create({
          projectId: product.projectId._id,
          productId: product._id,
          documentId: document._id,
          name: sheet.name ? `${base} / ${sheet.name}` : base,
          columns,
          allowedRoles: roles,
          source: { project: product.projectId.name, product: product.name, file: document.filename },
        });
      },
      onBatch: async (batch) => {
        await KbDatasetRow.insertMany(batch.map((r) => ({ datasetId: dataset._id, ...r })), { ordered: false });
      },
    });
    if (!result || !dataset) continue;
    const preview = await KbDatasetRow.find({ datasetId: dataset._id }).sort({ n: 1 }).limit(5).select("n data -_id").lean();
    await KbDataset.updateOne(
      { _id: dataset._id },
      { rowCount: result.rowCount, truncated: result.truncated, preview: preview.map((p) => ({ row: p.n, ...p.data })) }
    );
    datasets++;
    rows += result.rowCount;
  }
  if (!datasets) throw new Error("No data found. The first row of each sheet must contain column headers.");
  return { datasets, rows };
}
