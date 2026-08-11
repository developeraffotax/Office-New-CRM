import moment from "moment";

/**
 * Mongo $dateToString format per group unit.
 * "week" uses ISO week-year (%G) + ISO week number (%V) so it lines up
 * with moment's isoWeek()/isoWeekYear() used below.
 */
export const dateFormatMap = {
  day: "%Y-%m-%d",
  week: "%G-W%V",
  month: "%Y-%m",
};

/**
 * Decide which bucket unit to group by.
 * - Explicit "day" | "week" | "month" is always respected.
 * - "auto" (or anything else/missing) picks a sensible unit based on
 *   the span of the range so a 1-year query doesn't return 365 bars.
 */
export const resolveGroupBy = (groupBy, startDate, endDate) => {
  if (groupBy && ["day", "week", "month"].includes(groupBy)) return groupBy;

  const diffDays = endDate.diff(startDate, "days");

  if (diffDays <= 31) return "day";
  if (diffDays <= 180) return "week";
  return "month";
};

/**
 * Walks the [startDate, endDate] range in steps of `groupUnit` and returns
 * two parallel arrays:
 *  - keys: bucket keys that match what $dateToString produces (used to
 *          line up aggregation results, including empty buckets as 0)
 *  - labels: human readable labels for the x-axis
 */
export const buildDateBuckets = (startDate, endDate, groupUnit) => {
  const keys = [];
  const labels = [];
  let current = startDate.clone();

  if (groupUnit === "day") {
    while (current.isSameOrBefore(endDate, "day")) {
      keys.push(current.format("YYYY-MM-DD"));
      labels.push(current.format("DD MMM"));
      current.add(1, "day");
    }
  } else if (groupUnit === "week") {
    current = current.clone().startOf("isoWeek");
    while (current.isSameOrBefore(endDate, "day")) {
      keys.push(`${current.isoWeekYear()}-W${String(current.isoWeek()).padStart(2, "0")}`);
      const weekEnd = current.clone().endOf("isoWeek");
      labels.push(`${current.format("DD MMM")} - ${weekEnd.format("DD MMM")}`);
      current.add(1, "week");
    }
  } else {
    current = current.clone().startOf("month");
    while (current.isSameOrBefore(endDate, "day")) {
      keys.push(current.format("YYYY-MM"));
      labels.push(current.format("MMM YYYY"));
      current.add(1, "month");
    }
  }

  return { keys, labels };
};

/**
 * Pulls start/end out of req.query and throws a 400-flagged error if
 * either is missing, so controllers can stay one-liners.
 */
export const parseDateRange = (query) => {
  const { start, end } = query;
  if (!start || !end) {
    const err = new Error("Start and end dates are required");
    err.statusCode = 400;
    throw err;
  }
  return { start, end };
};

/**
 * Applies a list of [queryKey, matchKey] filters to a match object,
 * skipping "all"/empty values. Keeps controllers free of repeated
 * `if (x && x !== "all")` blocks.
 *
 * Example:
 *   applyFilters(matchQuery, req.query, [
 *     ["source", "source"],
 *     ["clientType", "clientType"],
 *     ["department", "job.jobHolder"],
 *   ]);
 */
export const applyFilters = (matchQuery, query, filterMap) => {
  filterMap.forEach(([queryKey, matchKey]) => {
    const value = query[queryKey];
    if (value && value !== "all") {
      const values = String(value).split(",").map((v) => v.trim()).filter(Boolean);
      matchQuery[matchKey] = values.length > 1 ? { $in: values } : values[0];
    }
  });
  return matchQuery;
};