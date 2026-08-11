import moment from "moment";
import { dateFormatMap, resolveGroupBy, buildDateBuckets } from "../utils/chartHelpers.js";

 
// export const getTimeSeriesData = async ({
//   Model,
//   dateField,
//   matchQuery = {},
//   start,
//   end,
//   groupBy,
//   valueConfig = { type: "count" },
// }) => {
//   const startDate = moment(start).startOf("day");
//   const endDate = moment(end).endOf("day");
//   const groupUnit = resolveGroupBy(groupBy, startDate, endDate);

//   const finalMatch = {
//     ...matchQuery,
//     [dateField]: { $gte: startDate.toDate(), $lte: endDate.toDate() },
//   };

//   const groupStage = {
//     _id: { $dateToString: { format: dateFormatMap[groupUnit], date: `$${dateField}` } },
//   };

//   if (valueConfig.type === "sum") {
//     // fee/totalHours etc are stored as String in these schemas, so cast
//     // safely — bad/empty strings fall back to 0 instead of throwing.
//     groupStage.value = {
//       $sum: {
//         $convert: {
//           input: `$${valueConfig.field}`,
//           to: "double",
//           onError: 0,
//           onNull: 0,
//         },
//       },
//     };
//   } else {
//     groupStage.value = { $sum: 1 };
//   }

//   const pipeline = [{ $match: finalMatch }, { $group: groupStage }, { $sort: { _id: 1 } }];

//   const results = await Model.aggregate(pipeline);

//   const statsMap = {};
//   results.forEach((r) => {
//     statsMap[r._id] = r.value;
//   });

//   const { keys, labels } = buildDateBuckets(startDate, endDate, groupUnit);
//   const data = keys.map((k) => Number((statsMap[k] || 0).toFixed(2)));

//   return { labels, data, groupUnit };
// };





















/**
 * Generic time-series aggregator. Every chart is processed by this function.
 * Supports standard sum/count, custom group accumulators, and full custom pipeline overrides.
 *
 * @param {Object} opts
 * @param {mongoose.Model} opts.Model         - Mongoose model to aggregate
 * @param {string} [opts.dateField]          - field to bucket by, e.g. "currentDate"
 * @param {Object} [opts.matchQuery]         - extra $match filters (without dates)
 * @param {string} opts.start                - ISO date string
 * @param {string} opts.end                  - ISO date string
 * @param {string} [opts.groupBy]            - "day" | "week" | "month" | "auto"
 * @param {Object} [opts.valueConfig]        - { type: "count" } | { type: "sum", field: "fee" } | { type: "custom", accumulator: Object }
 * @param {Function} [opts.buildPipeline]    - Optional custom pipeline generator: ({ matchQuery, finalMatch, startDate, endDate, groupUnit, dateFormat, dateField }) => PipelineArray
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
  buildPipeline,
  breakdownField,   // NEW: e.g. "jobHolder" or "job.jobHolder" — also group by this
  breakdownValues,  // NEW: expected values, so a user with zero rows still gets a zero-filled series
}) => {
  const startDate = moment(start).startOf("day");
  const endDate = moment(end).endOf("day");
  const groupUnit = resolveGroupBy(groupBy, startDate, endDate);
  const dateFormat = dateFormatMap[groupUnit];

  const finalMatch = {
    ...matchQuery,
    ...(dateField ? { [dateField]: { $gte: startDate.toDate(), $lte: endDate.toDate() } } : {}),
  };

  let pipeline;

  if (typeof buildPipeline === "function") {
    pipeline = buildPipeline({ matchQuery, finalMatch, startDate, endDate, groupUnit, dateFormat, dateField });
  } else {
    const groupStage = breakdownField
      ? {
          _id: {
            date: { $dateToString: { format: dateFormat, date: `$${dateField}` } },
            group: `$${breakdownField}`,
          },
        }
      : {
          _id: { $dateToString: { format: dateFormat, date: `$${dateField}` } },
        };

    if (valueConfig.type === "sum") {
      groupStage.value = {
        $sum: { $convert: { input: `$${valueConfig.field}`, to: "double", onError: 0, onNull: 0 } },
      };
    } else if (valueConfig.type === "custom" && valueConfig.accumulator) {
      groupStage.value = valueConfig.accumulator;
    } else {
      groupStage.value = { $sum: 1 };
    }

    pipeline = [
      { $match: finalMatch },
      { $group: groupStage },
      { $sort: breakdownField ? { "_id.date": 1 } : { _id: 1 } },
    ];
  }

  const results = await Model.aggregate(pipeline);
  const { keys, labels } = buildDateBuckets(startDate, endDate, groupUnit);

  // --- NEW: grouped/multi-series reshape ---
  if (breakdownField) {
    const byGroup = {};
    results.forEach((r) => {
      const groupKey = String(r._id.group ?? "Unassigned");
      (byGroup[groupKey] ??= {})[r._id.date] = r.value;
    });

    const groupKeys = breakdownValues?.length ? breakdownValues.map(String) : Object.keys(byGroup);

    const series = groupKeys.map((groupKey) => ({
      name: groupKey,
      data: keys.map((k) => Number((byGroup[groupKey]?.[k] || 0).toFixed(2))),
    }));

    return { labels, series, groupUnit };
  }

  // --- existing single-series path, unchanged ---
  const statsMap = {};
  results.forEach((r) => { statsMap[r._id] = r.value; });
  const data = keys.map((k) => Number((statsMap[k] || 0).toFixed(2)));
  return { labels, data, groupUnit };
};

/**
 * Runs several getTimeSeriesData calls in parallel and returns them as
 * aligned chart series sharing one label set.
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


/**
 * Like getMultiSeriesData, but when a breakdownField is given, computes
 * each sub-chart already grouped by that field, then re-groups by value
 * (e.g. by user) so composite.transform can run once per group against
 * an unmodified { labels, groupUnit, series } bundle — exactly the shape
 * it already expects.
 */
export const getMultiSeriesDataByUser = async (seriesDefs, breakdownValues) => {
  const results = await Promise.all(
    seriesDefs.map(({ params, breakdownField }) =>
      getTimeSeriesData({ ...params, breakdownField, breakdownValues })
    )
  );

  const labels = results[0]?.labels || [];
  const groupUnit = results[0]?.groupUnit;
  const groupKeys = breakdownValues?.length
    ? breakdownValues.map(String)
    : Array.from(new Set(results.flatMap((r) => r.series.map((s) => s.name))));

  return groupKeys.map((groupKey) => ({
    groupKey,
    bundle: {
      labels,
      groupUnit,
      series: seriesDefs.map(({ name }, i) => {
        const s = results[i].series.find((s) => s.name === groupKey);
        return { name, data: s ? s.data : labels.map(() => 0) };
      }),
    },
  }));
};







/**
 * Runs several getTimeSeriesData calls in parallel and returns them as
 * aligned chart series sharing one label set — for charts that overlay
 * multiple lines/bars (e.g. Total Sales vs Subscription Sales).
 *
 * @param {Array<{name: string, params: Object}>} seriesDefs
 */
// export const getMultiSeriesData = async (seriesDefs) => {
//   const results = await Promise.all(
//     seriesDefs.map(({ params }) => getTimeSeriesData(params))
//   );

//   return {
//     labels: results[0]?.labels || [],
//     groupUnit: results[0]?.groupUnit,
//     series: results.map((r, i) => ({ name: seriesDefs[i].name, data: r.data })),
//   };
// };