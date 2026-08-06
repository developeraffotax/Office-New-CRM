import { chartRegistry, multiChartRegistry } from "../charts/chart.registry.js";
import { getTimeSeriesData, getMultiSeriesData } from "../services/chart.service.js";
import { parseDateRange, applyFilters } from "../utils/chartHelpers.js";
import { ApiError } from "../utils/ApiError.js";

const respondWithChart = (res, { start, end, groupUnit, labels, series, user }) => {
  res.status(200).json({
    success: true,
    filters: { start, end, user: user || "all", groupBy: groupUnit },
    labels,
    series,
  });
};

const handleChartError = (res, error) => {
  console.error(error);
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Error fetching chart data",
  });
};

/**
 * Handles single-series charts dynamically via chartRegistry
 */
export const getChartData = async (req, res) => {
  try {
    const { chartKey } = req.params;
    const definition = chartRegistry[chartKey];
    if (!definition) throw new ApiError(404, `Unknown chart: ${chartKey}`);

    const { start, end } = parseDateRange(req.query);
    const { groupBy, dateField } = req.query;

    const matchQuery = applyFilters({ ...definition.baseMatch }, req.query, definition.allowedFilters);

    const { labels, data, groupUnit } = await getTimeSeriesData({
      Model: definition.Model,
      dateField: dateField || definition.dateField, // Allows query parameter override
      dateEndField: definition.dateEndField,
      rangeOverlap: definition.rangeOverlap,
      matchQuery,
      start,
      end,
      groupBy,
      valueConfig: definition.valueConfig,
    });

    respondWithChart(res, {
      start,
      end,
      groupUnit,
      labels,
      series: [{ name: definition.label, data }],
      user: req.query.jobHolder || req.query.user,
    });
  } catch (error) {
    handleChartError(res, error);
  }
};

/**
 * Handles composite / multi-series charts dynamically via multiChartRegistry
 */
export const getMultiChartData = async (req, res) => {
  try {
    const { chartKey } = req.params;
    const composite = multiChartRegistry[chartKey];
    if (!composite) throw new ApiError(404, `Unknown chart: ${chartKey}`);

    const { start, end } = parseDateRange(req.query);
    const { groupBy } = req.query;

    const seriesDefs = composite.series.map(({ name, chartKey: subKey, overrides = {} }) => {
      const sub = chartRegistry[subKey];
      if (!sub) throw new ApiError(500, `Composite chart "${chartKey}" references unknown chart "${subKey}"`);

      const matchQuery = applyFilters({ ...sub.baseMatch }, req.query, sub.allowedFilters);
      return {
        name,
        params: {
          Model: sub.Model,
          dateField: sub.dateField,
          dateEndField: sub.dateEndField,
          rangeOverlap: sub.rangeOverlap,
          matchQuery,
          start,
          end,
          groupBy,
          valueConfig: sub.valueConfig,
          ...overrides, // Explicit divergence applied last
        },
      };
    });

    let result = await getMultiSeriesData(seriesDefs);

    // Run custom composite calculations if present (e.g. conversion percentage)
    if (typeof composite.transform === "function") {
      result = composite.transform(result);
    }

    respondWithChart(res, {
      start,
      end,
      groupUnit: result.groupUnit,
      labels: result.labels,
      series: result.series,
      user: req.query.jobHolder || req.query.user,
    });
  } catch (error) {
    handleChartError(res, error);
  }
};