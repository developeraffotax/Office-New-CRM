import { chartRegistry } from "../charts/chart.registry.js";
import {
  kpiTableRows,
  kpiOnlyMetrics,
  customMetrics,
  TEAM_TOTAL,
  TEAM_KEY,
} from "../charts/kpiTable.registry.js";
import { applyFilters } from "../utils/chartHelpers.js";
import { ApiError } from "../utils/ApiError.js";

const splitList = (v) =>
  v ? String(v).split(",").map((s) => s.trim()).filter(Boolean) : [];

const round2 = (n) => (typeof n === "number" ? Math.round(n * 100) / 100 : n);

const buildDateMatch = (def, start, end) => {
  if (def.rangeOverlap && def.dateEndField) {
    return {
      [def.dateField]: { $lte: end },
      [def.dateEndField]: { $gte: start },
    };
  }
  return { [def.dateField]: { $gte: start, $lte: end } };
};

/** One aggregation per metric, grouped by the model's jobHolder field -> { user: value } */
const aggregateByUser = async (def, { start, end, query }) => {
  const groupField = def.allowedFilters?.find(([q]) => q === "jobHolder")?.[1];
  if (!groupField) throw new ApiError(500, `"${def.label}" has no jobHolder filter, can't split by user`);

  const match = {
    ...applyFilters({ ...def.baseMatch }, query, def.allowedFilters),
    ...buildDateMatch(def, start, end),
  };

  const { type, field } = def.valueConfig;
  const rows = await def.Model.aggregate([
    { $match: match },
    {
      $group: {
        _id: `$${groupField}`,
        value: type === "sum" ? { $sum: `$${field}` } : { $sum: 1 },
      },
    },
  ]);

  const out = {};
  rows.forEach((r) => {
    if (r._id) out[r._id] = r.value;
  });
  return out;
};

const resolveMetric = async (key, ctx) => {
  if (customMetrics[key]) return customMetrics[key](ctx);
  const def = kpiOnlyMetrics[key] || chartRegistry[key];
  if (!def) throw new ApiError(500, `KPI table references unknown metric "${key}"`);
  return aggregateByUser(def, ctx);
};

const AGGREGATORS = {
  avg: (nums) => nums.reduce((a, b) => a + b, 0) / nums.length,
  max: (nums) => Math.max(...nums),
  min: (nums) => Math.min(...nums),
};

/**
 * Returns { columns: [...users, "Team Total"], rows: [{ key, label, format, heat, values: [...] }] }
 * values[i] lines up with columns[i]. null = no data (UI shows "–", Excel leaves it blank).
 */
export const buildKpiTable = async ({ start, end, query }) => {
  const wantedRows = splitList(query.rows);
  const rowDefs = wantedRows.length
    ? kpiTableRows.filter((r) => wantedRows.includes(r.key))
    : kpiTableRows;

  const selectedUsers = splitList(query.jobHolder);
  const ctx = { start, end, query, users: selectedUsers };

  // fetch every metric once, only the ones the requested rows actually need
  const metricKeys = [...new Set(rowDefs.flatMap((r) => (r.metric ? [r.metric] : r.deps)))];
  const metrics = Object.fromEntries(
    await Promise.all(metricKeys.map(async (k) => [k, (await resolveMetric(k, ctx)) || {}])),
  );

  // columns: the selected users, or (nothing selected) everyone who has data
  const users = selectedUsers.length
    ? selectedUsers
    : [
        ...new Set(
          Object.values(metrics).flatMap((m) => Object.keys(m).filter((k) => k !== TEAM_KEY)),
        ),
      ].sort((a, b) => a.localeCompare(b));
  const columns = [...users, TEAM_TOTAL];

  // raw metric value for one user, or for the team (override if the fetcher gave one, else the sum)
  const read = (metricKey, col = TEAM_TOTAL) => {
    const m = metrics[metricKey];
    if (!m) return 0;
    if (col === TEAM_TOTAL) {
      return m[TEAM_KEY] ?? users.reduce((sum, u) => sum + (m[u] || 0), 0);
    }
    return m[col] || 0;
  };

  const cell = (def, col) => {
    if (def.metric) return read(def.metric, col);
    const vals = Object.fromEntries(def.deps.map((d) => [d, read(d, col)]));
    return def.calculate(vals);
  };

  const rows = rowDefs.map((def) => {
    const cells = users.map((u) => cell(def, u));
    const strategy = def.teamTotal;

    let team;
    if (typeof strategy === "function") {
      team = strategy({ cells, users, read });
    } else if (AGGREGATORS[strategy]) {
      const nums = cells.filter((c) => typeof c === "number");
      team = nums.length ? AGGREGATORS[strategy](nums) : null;
    } else {
      team = cell(def, TEAM_TOTAL); // "sum" (default)
    }

    return {
      key: def.key,
      label: def.label,
      format: def.format,
      heat: def.heat,
      values: [...cells, team].map(round2),
    };
  });

  return { columns, rows };
};