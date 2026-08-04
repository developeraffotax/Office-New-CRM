import moment from "moment";
import { dateFormatMap, resolveGroupBy, buildDateBuckets } from "../utils/chartHelpers.js";

/**
 * Generic time-series aggregator. Every chart (sales, subscriptions,
 * orders, leads, ...) is just this function called with a different
 * Model / dateField / matchQuery / valueConfig — so adding a new chart
 * later is a controller function, not a new pipeline.
 *
 * @param {Object} opts
 * @param {mongoose.Model} opts.Model      - model to aggregate
 * @param {string} opts.dateField          - field to bucket by, e.g. "currentDate"
 * @param {Object} [opts.matchQuery]       - extra $match filters (date range is added automatically)
 * @param {string} opts.start              - ISO date string
 * @param {string} opts.end                - ISO date string
 * @param {string} [opts.groupBy]          - "day" | "week" | "month" | "auto"
 * @param {Object} [opts.valueConfig]      - { type: "count" } | { type: "sum", field: "fee" }
 * @returns {Promise<{labels: string[], data: number[], groupUnit: string}>}
 */
export const getTimeSeriesData = async ({
  Model,
  dateField,
  matchQuery = {},
  start,
  end,
  groupBy,
  valueConfig = { type: "count" },
}) => {
  const startDate = moment(start).startOf("day");
  const endDate = moment(end).endOf("day");
  const groupUnit = resolveGroupBy(groupBy, startDate, endDate);

  const finalMatch = {
    ...matchQuery,
    [dateField]: { $gte: startDate.toDate(), $lte: endDate.toDate() },
  };

  const groupStage = {
    _id: { $dateToString: { format: dateFormatMap[groupUnit], date: `$${dateField}` } },
  };

  if (valueConfig.type === "sum") {
    // fee/totalHours etc are stored as String in these schemas, so cast
    // safely — bad/empty strings fall back to 0 instead of throwing.
    groupStage.value = {
      $sum: {
        $convert: {
          input: `$${valueConfig.field}`,
          to: "double",
          onError: 0,
          onNull: 0,
        },
      },
    };
  } else {
    groupStage.value = { $sum: 1 };
  }

  const pipeline = [{ $match: finalMatch }, { $group: groupStage }, { $sort: { _id: 1 } }];

  const results = await Model.aggregate(pipeline);

  const statsMap = {};
  results.forEach((r) => {
    statsMap[r._id] = r.value;
  });

  const { keys, labels } = buildDateBuckets(startDate, endDate, groupUnit);
  const data = keys.map((k) => Number((statsMap[k] || 0).toFixed(2)));

  return { labels, data, groupUnit };
};

/**
 * Runs several getTimeSeriesData calls in parallel and returns them as
 * aligned chart series sharing one label set — for charts that overlay
 * multiple lines/bars (e.g. Total Sales vs Subscription Sales).
 *
 * @param {Array<{name: string, params: Object}>} seriesDefs
 */
export const getMultiSeriesData = async (seriesDefs) => {
  const results = await Promise.all(
    seriesDefs.map(({ params }) => getTimeSeriesData(params))
  );

  return {
    labels: results[0]?.labels || [],
    groupUnit: results[0]?.groupUnit,
    series: results.map((r, i) => ({ name: seriesDefs[i].name, data: r.data })),
  };
};