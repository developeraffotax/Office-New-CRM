// ai/agent/tools/attachments.js — work on files the person attached.
// Every tool that changes a spreadsheet writes a NEW file. The original is never touched.
import { getOwnAttachment, saveGenerated } from "../../attachments/attachments.service.js";
import { extractText, findExcerpts } from "../../attachments/textExtract.js";
import { openSheet, gridView, parseA1, colLetter, resolveSheetColumn, normKey } from "../../attachments/sheetTable.js";
import { getDataset, resolveColumn } from "../../datasets/datasetQuery.js";
import { KbDatasetRow } from "../../models/kb.models.js";
import { ToolError } from "../toolkit.js";

const SEP = "\u241f";
const attachmentId = { type: "string", description: "Id from <attached_files>." };
const sheet = { type: "string", description: "Sheet name (default: the first sheet)." };

async function own(id, ctx) {
  const att = await getOwnAttachment(id, ctx.user);
  if (!att) throw new ToolError("Attachment not found. It may have expired; ask the person to attach it again.");
  return att;
}

const joinKey = (parts) => (parts.some((p) => normKey(p) === "") ? "" : parts.map(normKey).join(SEP));

async function publish(ctx, att, t, edits, extra = {}) {
  const buffer = await t.commit(edits);
  const file = await saveGenerated(ctx.user, { buffer, filename: `filled-${att.filename}`, parent: att });
  ctx.emit("file", { ...file, ...extra });
  return file;
}

export const attachmentTools = [
  {
    name: "read_attachment",
    description:
      "Read a file the person attached: PDF, Word, PowerPoint, text (returns text), or spreadsheet/CSV (returns column info and rows). Use `find` to search inside it. view=cells shows a form-style sheet with cell addresses. Images are shown to you directly.",
    parameters: {
      type: "object",
      properties: {
        attachmentId,
        sheet,
        find: { type: "string", description: "Only return rows / passages containing these words." },
        offset: { type: "integer", minimum: 0, description: "Documents: character offset. Sheets: row offset." },
        limit: { type: "integer", minimum: 1, maximum: 8000, description: "Documents: characters (default 6000). Sheets: rows (default 20, max 50)." },
        view: { type: "string", enum: ["table", "cells"], description: "cells = cell addresses of a form-style sheet." },
      },
      required: ["attachmentId"],
    },
    async execute({ attachmentId: id, sheet: sheetName, find, offset = 0, limit, view }, ctx) {
      const att = await own(id, ctx);
      if (att.kind === "image") return { note: "This image is shown to you directly in the conversation." };

      if (att.kind === "xlsx" || att.kind === "csv") {
        const t = await openSheet(att, sheetName);
        if (view === "cells") return gridView(t);
        let rows = t.rows;
        if (find) {
          const needle = find.toLowerCase();
          rows = rows.filter((r) => r.values.some((v) => v != null && String(v).toLowerCase().includes(needle)));
        }
        const cap = Math.min(limit || 20, 50);
        return {
          sheet: t.sheetName,
          sheets: t.sheets,
          headerRow: t.headerRow,
          columns: t.columnInfo(),
          totalRows: t.rows.length,
          ...(find ? { matched: rows.length } : {}),
          offset,
          rows: rows.slice(offset, offset + cap).map((r) => ({ row: r.n, ...t.rowObject(r) })),
          ...(t.truncated ? { warning: "Only the first 100,000 rows are loaded." } : {}),
        };
      }

      const text = await extractText(att);
      if (!text.trim()) return { totalChars: 0, note: att.meta?.scanned ? "This PDF is scanned (no text layer), so I can't read it." : "No readable text." };
      if (find) return { totalChars: text.length, excerpts: findExcerpts(text, find) };
      const cap = Math.min(limit || 6000, 8000);
      return { totalChars: text.length, offset, text: text.slice(offset, offset + cap), more: offset + cap < text.length };
    },
  },

  {
    name: "fill_sheet_from_dataset",
    description:
      "Fill a spreadsheet/CSV the person attached using a stored dataset: for every row, find the matching dataset record (by the match columns) and copy the chosen columns into the sheet. Handles any number of rows in one call. Call read_attachment, then list_datasets / describe_dataset first so you use the right columns. Produces a new file; the original is unchanged.",
    parameters: {
      type: "object",
      properties: {
        attachmentId,
        sheet,
        datasetId: { type: "string", description: "Dataset id from list_datasets." },
        matchOn: {
          type: "array", minItems: 1, maxItems: 3,
          description: "Columns that identify the same record in both (for example name, or company + postcode).",
          items: { type: "object", properties: { sheetColumn: { type: "string" }, datasetColumn: { type: "string" } }, required: ["sheetColumn", "datasetColumn"] },
        },
        fill: {
          type: "array", minItems: 1, maxItems: 20,
          description: "Dataset columns to copy into the sheet. If the sheet has no such column it is added.",
          items: { type: "object", properties: { sheetColumn: { type: "string" }, datasetColumn: { type: "string" } }, required: ["sheetColumn", "datasetColumn"] },
        },
        overwrite: { type: "boolean", description: "Replace values already in the sheet. Default false: only fill empty cells." },
      },
      required: ["attachmentId", "datasetId", "matchOn", "fill"],
    },
    async execute(input, ctx) {
      const att = await own(input.attachmentId, ctx);
      const t = await openSheet(att, input.sheet);
      if (t.truncated) throw new ToolError("This sheet has more than 100,000 rows. Split it into smaller files.");
      const ds = await getDataset(ctx.user, input.datasetId); // role access is checked here

      const matchOn = input.matchOn.map((m) => ({ sc: resolveSheetColumn(t, m.sheetColumn, { mustExist: true }), dc: resolveColumn(ds, m.datasetColumn) }));
      const fills = input.fill.map((f) => ({ label: f.sheetColumn, sc: resolveSheetColumn(t, f.sheetColumn), dc: resolveColumn(ds, f.datasetColumn) }));

      const edits = [];
      let nextCol = t.width + 1;
      for (const f of fills) {
        if (f.sc) continue;
        f.sc = { col: nextCol++, label: f.label, isNew: true };
        edits.push({ row: t.headerRow, col: f.sc.col, value: f.label });
      }

      // Index the dataset by the match columns (streams from Mongo; only the needed fields).
      const projection = { n: 1 };
      for (const c of [...matchOn.map((m) => m.dc), ...fills.map((f) => f.dc)]) projection[`data.${c.key}`] = 1;
      const index = new Map();
      for await (const r of KbDatasetRow.find({ datasetId: ds._id }, projection).lean().cursor()) {
        const key = joinKey(matchOn.map((m) => r.data?.[m.dc.key]));
        if (!key) continue;
        const list = index.get(key);
        if (list) list.push(r);
        else index.set(key, [r]);
      }

      const stats = { sheetRows: t.rows.length, matched: 0, unmatched: 0, ambiguous: 0, noKey: 0, cellsWritten: 0, cellsKeptExisting: 0 };
      const unmatched = [];
      const ambiguous = [];
      const sample = [];
      const show = (row) => matchOn.map((m) => row.values[m.sc.col - 1]).join(" / ");

      for (const row of t.rows) {
        const key = joinKey(matchOn.map((m) => row.values[m.sc.col - 1]));
        if (!key) { stats.noKey++; continue; }
        const hits = index.get(key);
        if (!hits) { stats.unmatched++; if (unmatched.length < 10) unmatched.push(show(row)); continue; }
        if (hits.length > 1) { stats.ambiguous++; if (ambiguous.length < 10) ambiguous.push(`${show(row)} (${hits.length} records)`); continue; }
        stats.matched++;
        for (const f of fills) {
          const value = hits[0].data?.[f.dc.key];
          if (value == null) continue;
          const current = f.sc.isNew ? null : row.values[f.sc.col - 1];
          if (current != null && !input.overwrite) { stats.cellsKeptExisting++; continue; }
          edits.push({ row: row.n, col: f.sc.col, value });
          stats.cellsWritten++;
          if (sample.length < 10) sample.push({ cell: `${colLetter(f.sc.col)}${row.n}`, was: current, now: value });
        }
      }

      if (!stats.cellsWritten) {
        return { status: "nothing_written", ...stats, unmatchedExamples: unmatched, ambiguousExamples: ambiguous, note: "No file was created. Check the match columns and values." };
      }
      const file = await publish(ctx, att, t, edits, { stats, changes: sample });
      return {
        status: "file_ready_for_download", filename: file.filename, ...stats,
        unmatchedExamples: unmatched, ambiguousExamples: ambiguous,
        note: "The person can download the new file from the chat. Tell them how many rows matched and which were left blank.",
      };
    },
  },

  {
    name: "write_sheet_cells",
    description:
      "Write values into specific cells of an attached spreadsheet/CSV (for example C5) and produce a new file. Use it for a few cells, such as a form-style sheet, with values you found in the stored data. For many rows use fill_sheet_from_dataset. Values are plain text or numbers, never formulas.",
    parameters: {
      type: "object",
      properties: {
        attachmentId,
        sheet,
        cells: {
          type: "array", minItems: 1, maxItems: 500,
          items: { type: "object", properties: { cell: { type: "string", description: "Address like C5." }, value: { type: "string" } }, required: ["cell", "value"] },
        },
      },
      required: ["attachmentId", "cells"],
    },
    async execute({ attachmentId: id, sheet: sheetName, cells }, ctx) {
      const att = await own(id, ctx);
      const t = await openSheet(att, sheetName);
      const existing = new Map(t.allRows.map((r) => [r.n, r.values]));
      const edits = cells.map((c) => {
        const { row, col } = parseA1(c.cell);
        const num = /^-?(0|[1-9]\d*)(\.\d+)?$/.test(c.value.trim()) ? Number(c.value) : null; // "0113…" stays text
        return { row, col, value: num ?? c.value, was: existing.get(row)?.[col - 1] ?? null, cell: c.cell.toUpperCase() };
      });
      const file = await publish(ctx, att, t, edits, { changes: edits.slice(0, 20).map((e) => ({ cell: e.cell, was: e.was, now: e.value })) });
      return { status: "file_ready_for_download", filename: file.filename, cellsWritten: edits.length, note: "The person can download the new file from the chat." };
    },
  },
];
