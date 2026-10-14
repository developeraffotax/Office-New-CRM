import moment from "moment";
import { kpiTableRows, kpiMetrics, TEAM_TOTAL } from "../tables/table.registry.js";
import { applyFilters } from "../utils/helpers.js";
import { ApiError } from "../utils/ApiError.js";

const splitList = (v) =>
  v ? String(v).split(",").map((s) => s.trim()).filter(Boolean) : [];

const round2 = (n) => (typeof n === "number" ? Math.round(n * 100) / 100 : n);

/**
 * Date match built exactly like getTimeSeriesData does it:
 * real Date objects (aggregate() doesn't cast), from start-of-day to end-of-day.
 */
const buildDateMatch = (def, start, end) => {
  const startDate = moment(start).startOf("day").toDate();
  const endDate = moment(end).endOf("day").toDate();

  if (def.rangeOverlap && def.dateEndField) {
    return {
      [def.dateField]: { $lte: endDate },
      [def.dateEndField]: { $gte: startDate },
    };
  }
  return { [def.dateField]: { $gte: startDate, $lte: endDate } };
};

/** One aggregation per metric, grouped by the model's jobHolder field -> { user: value } */
const aggregateByUser = async (def, { start, end, query }) => {
  const groupField = def.allowedFilters?.find(([q]) => q === "jobHolder")?.[1];
  if (!groupField) {
    throw new ApiError(500, `"${def.label}" has no jobHolder filter, can't split by user`);
  }

  const match = {
    ...applyFilters({ ...def.baseMatch }, query, def.allowedFilters),
    ...buildDateMatch(def, start, end),
  };

  const { type, field } = def.valueConfig;
  // same $convert the chart uses, so amounts stored as strings still add up
  const value =
    type === "sum"
      ? { $sum: { $convert: { input: `$${field}`, to: "double", onError: 0, onNull: 0 } } }
      : { $sum: 1 };

  const rows = await def.Model.aggregate([
    { $match: match },
    { $group: { _id: `$${groupField}`, value } },
  ]);

  const out = {};
  rows.forEach((r) => {
    if (r._id) out[r._id] = r.value;
  });
  return out;
};

const resolveMetric = async (key, ctx) => {
  const def = kpiMetrics[key];
  if (!def) throw new ApiError(500, `KPI table references unknown metric "${key}"`);
  if (typeof def.fetch === "function") return (await def.fetch(ctx)) || {}; // custom source (e.g. targets)
  return aggregateByUser(def, ctx);
};

const AGGREGATORS = {
  avg: (nums) => nums.reduce((a, b) => a + b, 0) / nums.length,
  max: (nums) => Math.max(...nums),
  min: (nums) => Math.min(...nums),
};

/**
 * Returns { columns: [...users, "Team Total"], rows: [{ key, label, format, values: [...] }] }
 * values[i] lines up with columns[i]. null = no data (UI shows "–", Excel leaves it blank).
 */
export const buildKpiTable = async ({ start, end, query }) => {
  const wantedRows = splitList(query.rows);
  const unknownRows = wantedRows.filter((k) => !kpiTableRows.some((r) => r.key === k));
  if (unknownRows.length) {
    throw new ApiError(400, `Unknown KPI row(s): ${unknownRows.join(", ")}`);
  }
  const rowDefs = wantedRows.length
    ? kpiTableRows.filter((r) => wantedRows.includes(r.key))
    : kpiTableRows;

  const selectedUsers = splitList(query.jobHolder);
  const ctx = { start, end, query, users: selectedUsers };

  // fetch every metric once, only the ones the requested rows actually need
  const metricKeys = [...new Set(rowDefs.flatMap((r) => (r.metric ? [r.metric] : r.deps)))];
  const metrics = Object.fromEntries(
    await Promise.all(metricKeys.map(async (k) => [k, await resolveMetric(k, ctx)])),
  );

  // columns: the selected users, or (nothing selected) everyone who has data
  const users = selectedUsers.length
    ? selectedUsers
    : [...new Set(Object.values(metrics).flatMap((m) => Object.keys(m)))].sort((a, b) =>
        a.localeCompare(b),
      );
  const columns = [...users, TEAM_TOTAL];

  // raw metric value for one user, or for the team (sum of the users)
  const read = (metricKey, col = TEAM_TOTAL) => {
    const m = metrics[metricKey];
    if (!m) return 0;
    return col === TEAM_TOTAL
      ? users.reduce((sum, u) => sum + (m[u] || 0), 0)
      : m[col] || 0;
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
      group: def.group,
      groupLabel: def.groupLabel,
      groupColor: def.groupColor,
      values: [...cells, team].map(round2),
    };
  });

  return { columns, rows };
};

/** Row definitions only (no data) - lets the UI render pickers / empty states without a data query. */
export const listKpiRows = () =>
  kpiTableRows.map(({ key, label, format, group, groupLabel, groupColor }) => ({
    key,
    label,
    format,
    group,
    groupLabel,
    groupColor,
  }));