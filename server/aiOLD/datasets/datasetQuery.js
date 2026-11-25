// ai/datasets/datasetQuery.js
// Safe, typed querying of datasets. The model never writes Mongo: it passes column names, operators
// and values, and this file turns them into a validated query.
import { KbDataset, KbDatasetRow } from "../models/kb.models.js";
import { ToolError } from "../agent/toolkit.js";

export const OPS = ["eq", "ne", "gt", "gte", "lt", "lte", "contains", "starts_with", "in", "is_empty", "not_empty"];
export const METRICS = ["count", "sum", "avg", "min", "max"];
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const bad = (m) => new ToolError(m);

// ---------- access ----------
export function datasetAccessFilter(user) {
  return user.role === "admin" ? {} : { allowedRoles: { $in: [user.role, "all"] } };
}

export function listDatasets(user, { productId, projectId } = {}) {
  const f = { ...datasetAccessFilter(user) };
  if (productId) f.productId = productId;
  if (projectId) f.projectId = projectId;
  return KbDataset.find(f).sort({ name: 1 }).limit(50).select("name rowCount columns source").lean();
}

export async function getDataset(user, datasetId) {
  const ds = await KbDataset.findOne({ _id: datasetId, ...datasetAccessFilter(user) }).lean();
  if (!ds) throw bad("Dataset not found, or you don't have access to it.");
  return ds;
}

// ---------- columns / values ----------
export function resolveColumn(dataset, name) {
  const n = String(name ?? "").trim().toLowerCase();
  const col = dataset.columns.find((c) => c.key === n || c.label.toLowerCase() === n);
  if (!col) {
    throw bad(`Unknown column "${name}". Columns: ${dataset.columns.map((c) => c.key).join(", ")}`);
  }
  return col;
}

function cast(col, v) {
  switch (col.type) {
    case "number": {
      const n = Number(String(v).replace(/,/g, ""));
      if (!Number.isFinite(n)) throw bad(`"${v}" is not a number (column ${col.key})`);
      return n;
    }
    case "date": {
      const d = new Date(v);
      if (isNaN(d)) throw bad(`"${v}" is not a valid date (column ${col.key}). Use YYYY-MM-DD.`);
      return d;
    }
    case "boolean":
      if (/^(true|yes|1)$/i.test(String(v))) return true;
      if (/^(false|no|0)$/i.test(String(v))) return false;
      throw bad(`"${v}" is not true/false (column ${col.key})`);
    default:
      return String(v);
  }
}

const exact = (v) => new RegExp(`^${esc(v)}$`, "i");

export function buildMatch(dataset, filters = []) {
  if (filters.length > 10) throw bad("Too many filters (max 10).");
  const clauses = filters.map((f) => {
    const col = resolveColumn(dataset, f.column);
    const p = `data.${col.key}`;
    const isStr = col.type === "string";
    const needValue = !["is_empty", "not_empty", "in"].includes(f.op);
    if (needValue && (f.value == null || f.value === "")) throw bad(`Filter on ${col.key} needs a value.`);
    if (f.value && String(f.value).length > 200) throw bad("Filter value too long.");

    switch (f.op) {
      case "eq": return { [p]: isStr ? { $regex: exact(f.value) } : cast(col, f.value) };
      case "ne": return { [p]: isStr ? { $not: exact(f.value) } : { $ne: cast(col, f.value) } };
      case "gt": case "gte": case "lt": case "lte":
        if (!["number", "date"].includes(col.type)) throw bad(`${f.op} only works on number or date columns (${col.key} is ${col.type}).`);
        return { [p]: { [`$${f.op}`]: cast(col, f.value) } };
      case "contains":
        if (!isStr) throw bad(`contains only works on text columns (${col.key} is ${col.type}).`);
        return { [p]: { $regex: esc(f.value), $options: "i" } };
      case "starts_with":
        if (!isStr) throw bad(`starts_with only works on text columns (${col.key} is ${col.type}).`);
        return { [p]: { $regex: `^${esc(f.value)}`, $options: "i" } };
      case "in": {
        const vals = (f.values ?? []).slice(0, 100);
        if (!vals.length) throw bad(`Filter "in" on ${col.key} needs values.`);
        return { [p]: { $in: vals.map((v) => (isStr ? exact(v) : cast(col, v))) } };
      }
      case "is_empty": return { $or: [{ [p]: { $exists: false } }, { [p]: null }, { [p]: "" }] };
      case "not_empty": return { [p]: { $exists: true, $nin: [null, ""] } };
      default: throw bad(`Unknown operator "${f.op}". Use one of: ${OPS.join(", ")}`);
    }
  });
  return { datasetId: dataset._id, ...(clauses.length ? { $and: clauses } : {}) };
}

// ---------- operations ----------
export function describe(dataset) {
  return {
    id: String(dataset._id),
    name: dataset.name,
    rowCount: dataset.rowCount,
    truncated: dataset.truncated || undefined,
    columns: dataset.columns.map((c) => ({ key: c.key, label: c.label, type: c.type })),
    preview: dataset.preview,
  };
}

export async function queryRows(dataset, { filters = [], select, sort, limit = 20 } = {}) {
  const match = buildMatch(dataset, filters);
  const cols = select?.length ? select.map((c) => resolveColumn(dataset, c)) : dataset.columns;
  const projection = { _id: 0, n: 1 };
  cols.forEach((c) => (projection[`data.${c.key}`] = 1));

  let q = KbDatasetRow.find(match, projection).limit(Math.min(Math.max(limit, 1), 50));
  if (sort?.column) {
    const col = resolveColumn(dataset, sort.column);
    q = q.sort({ [`data.${col.key}`]: sort.direction === "desc" ? -1 : 1, n: 1 });
  } else q = q.sort({ n: 1 });

  const [rows, total] = await Promise.all([q.lean(), KbDatasetRow.countDocuments(match)]);
  return { total, returned: rows.length, rows: rows.map((r) => ({ row: r.n, ...r.data })) };
}

const round = (x) => (typeof x === "number" ? Math.round(x * 100) / 100 : x);

export async function aggregateRows(dataset, { filters = [], groupBy = [], metrics = [{ op: "count" }], limit = 50 } = {}) {
  if (groupBy.length > 3) throw bad("Group by at most 3 columns.");
  if (metrics.length > 5) throw bad("At most 5 metrics.");
  const match = buildMatch(dataset, filters);
  const gcols = groupBy.map((c) => resolveColumn(dataset, c));

  const group = { _id: gcols.length ? Object.fromEntries(gcols.map((c) => [c.key, `$data.${c.key}`])) : null };
  const names = [];
  for (const m of metrics) {
    if (!METRICS.includes(m.op)) throw bad(`Unknown metric "${m.op}". Use: ${METRICS.join(", ")}`);
    const col = m.column ? resolveColumn(dataset, m.column) : null;
    const name = `${m.op}${col ? `_${col.key}` : ""}`;
    names.push(name);
    if (m.op === "count") {
      group[name] = col
        ? { $sum: { $cond: [{ $eq: [{ $ifNull: [`$data.${col.key}`, null] }, null] }, 0, 1] } }
        : { $sum: 1 };
    } else {
      if (!col) throw bad(`${m.op} needs a column.`);
      const okType = m.op === "min" || m.op === "max" ? ["number", "date"] : ["number"];
      if (!okType.includes(col.type)) throw bad(`${m.op} needs a ${okType.join("/")} column (${col.key} is ${col.type}).`);
      group[name] = { [`$${m.op}`]: `$data.${col.key}` };
    }
  }

  const cap = Math.min(Math.max(limit, 1), 100);
  const out = await KbDatasetRow.aggregate([
    { $match: match },
    { $group: group },
    { $sort: { [names[0]]: -1 } },
    { $limit: cap + 1 },
  ]).allowDiskUse(true);

  return {
    truncated: out.length > cap || undefined,
    rows: out.slice(0, cap).map((g) => {
      const row = { ...(g._id ?? {}) };
      names.forEach((n) => (row[n] = round(g[n])));
      return row;
    }),
  };
}