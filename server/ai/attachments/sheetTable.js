// ai/attachments/sheetTable.js — open an .xlsx / .csv attachment as a table, read it, and write edits to a NEW copy.
// The original file is never modified. Writes are values only (no formulas), so cell contents can't run code.
import fs from "node:fs";
import ExcelJS from "exceljs";
import { parse as parseCsv } from "csv-parse/sync";
import { cellValue, sniffDelimiter } from "../datasets/datasetIngest.js";
import { ToolError } from "../agent/toolkit.js";

const MAX_ROWS = 100_000;
const MAX_COLS = 200;

export const colLetter = (n) => {
  let s = "";
  for (; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
};
export const colIndex = (letters) => [...letters.toUpperCase()].reduce((a, c) => a * 26 + c.charCodeAt(0) - 64, 0);

export function parseA1(a1) {
  const m = /^([A-Za-z]{1,3})(\d{1,7})$/.exec(String(a1).trim());
  if (!m) throw new ToolError(`"${a1}" isn't a cell address like C5.`);
  return { row: Number(m[2]), col: colIndex(m[1]) };
}

/** Case-insensitive, whitespace-insensitive key for joining two tables. */
export function normKey(v) {
  if (v == null) return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).trim().toLowerCase().replace(/\s+/g, " ");
}

function guessHeaderRow(rows) {
  for (const r of rows.slice(0, 20)) {
    const filled = r.values.filter((v) => v != null);
    const strings = filled.filter((v) => typeof v === "string");
    if (filled.length >= 2 && strings.length >= filled.length * 0.8) return r.n;
  }
  return rows[0]?.n ?? 1;
}

function build({ kind, sheetName, sheets, allRows, truncated, commit }) {
  const headerRow = guessHeaderRow(allRows);
  const hdr = allRows.find((r) => r.n === headerRow)?.values ?? [];
  let width = hdr.length;
  while (width > 0 && hdr[width - 1] == null) width--;

  const used = new Set();
  const columns = Array.from({ length: width }, (_, i) => {
    const label = hdr[i] == null ? "" : String(hdr[i]).trim();
    let key = label || colLetter(i + 1);
    while (used.has(key)) key = `${key} (${colLetter(i + 1)})`;
    used.add(key);
    return { col: i + 1, letter: colLetter(i + 1), label, key };
  });
  const rows = allRows.filter((r) => r.n > headerRow);

  return {
    kind, sheetName, sheets, headerRow, columns, width, allRows, rows, truncated, commit,
    columnInfo: () => columns.map((c) => ({ col: c.letter, label: c.label || undefined, emptyCells: rows.filter((r) => r.values[c.col - 1] == null).length })),
    rowObject: (r) => {
      const o = {};
      for (const c of columns) if (r.values[c.col - 1] != null) o[c.key] = r.values[c.col - 1];
      return o;
    },
  };
}

/** Find a column by its header text, or by letter (A, B, ...). */
export function resolveSheetColumn(t, name, { mustExist = false } = {}) {
  const n = String(name ?? "").trim().toLowerCase();
  const byLabel = t.columns.find((c) => c.label.toLowerCase() === n || c.key.toLowerCase() === n);
  if (byLabel) return byLabel;
  if (/^[a-z]{1,3}$/.test(n) && colIndex(n) <= t.width) return t.columns[colIndex(n) - 1];
  if (mustExist) throw new ToolError(`No column "${name}" in the sheet. Columns: ${t.columns.map((c) => c.key).join(", ")}`);
  return null;
}

// ---------- xlsx ----------
async function openXlsx(att, sheetName) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(att.storagePath);
  const names = wb.worksheets.map((w) => w.name);
  const ws = sheetName ? wb.worksheets.find((w) => w.name.toLowerCase() === String(sheetName).toLowerCase()) : wb.worksheets[0];
  if (!ws) throw new ToolError(`No sheet "${sheetName}". Sheets: ${names.join(", ")}`);

  // Width comes from the data itself: actualColumnCount only counts columns that have values, so a label in
  // column D with nothing in B and C would be cut off, and columnCount can be huge on styled sheets.
  const raw = [];
  let truncated = false;
  ws.eachRow({ includeEmpty: false }, (row, n) => {
    if (raw.length >= MAX_ROWS) return void (truncated = true);
    raw.push({ n, vals: row.values });
  });
  const width = Math.min(Math.max(0, ...raw.map((r) => r.vals.length - 1)), MAX_COLS);
  const allRows = [];
  for (const { n, vals } of raw) {
    const values = Array.from({ length: width }, (_, i) => cellValue(vals[i + 1]));
    if (values.some((v) => v != null)) allRows.push({ n, values });
  }

  return build({
    kind: "xlsx", sheetName: ws.name, sheets: names, allRows, truncated,
    async commit(edits) {
      for (const e of edits) {
        const cell = ws.getCell(e.row, e.col);
        cell.value = e.value;
        if (e.value instanceof Date && !cell.numFmt) cell.numFmt = "yyyy-mm-dd";
      }
      return Buffer.from(await wb.xlsx.writeBuffer());
    },
  });
}

// ---------- csv ----------
const csvSafe = (v) => {
  if (v == null) return "";
  let s = v instanceof Date ? v.toISOString().slice(0, 10) : String(v);
  if (typeof v === "string" && /^[=+\-@\t\r]/.test(s)) s = `'${s}`; // stop spreadsheet apps treating text as a formula
  return s;
};
const toCsv = (rows, d) =>
  rows.map((r) => r.map((v) => { const s = csvSafe(v); return /[",\n\r]/.test(s) || s.includes(d) ? `"${s.replace(/"/g, '""')}"` : s; }).join(d)).join("\r\n");

async function openCsv(att) {
  const delimiter = sniffDelimiter(att.storagePath);
  const raw = parseCsv(fs.readFileSync(att.storagePath, "utf8"), { bom: true, relax_column_count: true, skip_empty_lines: true, delimiter });
  const truncated = raw.length > MAX_ROWS;
  const grid = raw.slice(0, MAX_ROWS).map((r) => r.slice(0, MAX_COLS).map(cellValue));
  const width = Math.max(0, ...grid.map((r) => r.length));
  const allRows = grid.map((values, i) => ({ n: i + 1, values: Array.from({ length: width }, (_, c) => values[c] ?? null) }));
  return build({
    kind: "csv", sheetName: "CSV", sheets: ["CSV"], allRows, truncated,
    async commit(edits) {
      for (const e of edits) {
        while (grid.length < e.row) grid.push([]);
        const r = grid[e.row - 1];
        while (r.length < e.col) r.push(null);
        r[e.col - 1] = e.value;
      }
      return Buffer.from("\uFEFF" + toCsv(grid, delimiter), "utf8");
    },
  });
}

export const openSheet = (att, sheetName) => {
  if (att.kind === "csv") return openCsv(att);
  if (att.kind === "xlsx") return openXlsx(att, sheetName);
  throw new ToolError("That file isn't a spreadsheet.");
};

/** For form-style sheets (label in one cell, blank cell beside it): cell addresses plus blanks next to labels. */
export function gridView(t) {
  const cells = [];
  const blanks = [];
  for (const r of t.allRows.slice(0, 80)) {
    r.values.forEach((v, i) => {
      if (v != null && cells.length < 300) cells.push({ cell: `${colLetter(i + 1)}${r.n}`, value: v });
      if (typeof v === "string" && v.length <= 80 && i + 1 < MAX_COLS && r.values[i + 1] == null && blanks.length < 100) {
        blanks.push({ label: v.replace(/\s*[:：]\s*$/, ""), blankCell: `${colLetter(i + 2)}${r.n}` });
      }
    });
  }
  return { sheet: t.sheetName, sheets: t.sheets, cells, candidateBlanks: blanks, note: "candidateBlanks are empty cells right of a text label." };
}
