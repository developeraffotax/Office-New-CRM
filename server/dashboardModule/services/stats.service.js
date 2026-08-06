import moment from "moment";

function percentChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;

  return Number((((current - previous) / previous) * 100).toFixed(1));
}

async function runStat({
  Model,
  dateField,
  matchQuery = {},
  valueConfig,
  start,
  end,
  buildPipeline,
}) {
  const query = {
    ...matchQuery,
    [dateField]: {
      $gte: start.toDate(),
      $lte: end.toDate(),
    },
  };

  // Custom pipeline
  if (typeof buildPipeline === "function") {
    const pipeline = buildPipeline({
      query,
      start,
      end,
      matchQuery,
    });

    const result = await Model.aggregate(pipeline);

    return result?.[0]?.value || 0;
  }

  switch (valueConfig.type) {
    case "count":
      return Model.countDocuments(query);

    case "sum": {
      const [result] = await Model.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            value: {
              $sum: {
                $convert: {
                  input: `$${valueConfig.field}`,
                  to: "double",
                  onError: 0,
                  onNull: 0,
                },
              },
            },
          },
        },
      ]);

      return result?.value || 0;
    }

    default:
      throw new Error(`Unsupported stat type "${valueConfig.type}"`);
  }
}

export const getStatsData = async (definitions) => {
  const stats = {};

  // --------------------------------------------------
  // 1. Execute all database-backed stats
  // --------------------------------------------------

  const normalDefinitions = definitions.filter(
    ({ definition }) => definition.type !== "computed"
  );

  await Promise.all(
    normalDefinitions.map(async ({ key, definition, params }) => {
      const startDate = moment(params.start).startOf("day");
      const endDate = moment(params.end).endOf("day");

      const duration = endDate.diff(startDate);

      const previousEnd = startDate.clone().subtract(1, "millisecond");
      const previousStart = previousEnd.clone().subtract(duration, "millisecond");

      const [current, previous] = await Promise.all([
        runStat({
          ...params,
          start: startDate,
          end: endDate,
        }),

        runStat({
          ...params,
          start: previousStart,
          end: previousEnd,
        }),
      ]);

      stats[key] = {
        value: current,
        previous,
        change: percentChange(current, previous),
      };
    })
  );

  // --------------------------------------------------
  // 2. Execute computed stats
  // --------------------------------------------------

  definitions
    .filter(({ definition }) => definition.type === "computed")
    .forEach(({ key, definition }) => {
      const { value, previous } = definition.calculate(stats);

      stats[key] = {
        value,
        previous,
        change: percentChange(value, previous),
      };
    });

  // --------------------------------------------------
  // 3. Remove internal fields
  // --------------------------------------------------

  return Object.fromEntries(
    Object.entries(stats).map(([key, value]) => [
      key,
      {
        value: Number(value.value.toFixed?.(2) ?? value.value),
        change: value.change,
      },
    ])
  );
};