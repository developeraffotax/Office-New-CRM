import { chartRegistry, multiChartRegistry } from "../charts/chart.registry.js";
import { getTimeSeriesData, getMultiSeriesData, getMultiSeriesDataByUser } from "../services/chart.service.js";
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
    const { groupBy, dateField, breakdown, jobHolder } = req.query;

    const matchQuery = applyFilters({ ...definition.baseMatch }, req.query, definition.allowedFilters);

    const jobHolderValues = jobHolder ? jobHolder.split(",").map((v) => v.trim()).filter(Boolean) : [];
    const wantsUserBreakdown = breakdown === "user" && jobHolderValues.length > 1;

    let breakdownField;
    if (wantsUserBreakdown) {
      const jobHolderFilter = definition.allowedFilters.find(([q]) => q === "jobHolder");
      if (!jobHolderFilter) throw new ApiError(400, `Chart "${chartKey}" doesn't support a per-user breakdown`);
      breakdownField = jobHolderFilter[1]; // "jobHolder" or "job.jobHolder"
    }

    const result = await getTimeSeriesData({
      Model: definition.Model,
      dateField: dateField || definition.dateField,
      dateEndField: definition.dateEndField,
      rangeOverlap: definition.rangeOverlap,
      matchQuery,
      start,
      end,
      groupBy,
      valueConfig: definition.valueConfig,
      breakdownField,
      breakdownValues: wantsUserBreakdown ? jobHolderValues : undefined,
    });

    respondWithChart(res, {
      start, end, groupUnit: result.groupUnit, labels: result.labels,
      series: result.series || [{ name: definition.label, data: result.data }],
      user: jobHolder || req.query.user,
    });
  } catch (error) {
    handleChartError(res, error);
  }
};

export const getMultiChartData = async (req, res) => {
  try {
    const { chartKey } = req.params;
    const composite = multiChartRegistry[chartKey];
    if (!composite) throw new ApiError(404, `Unknown chart: ${chartKey}`);

    const { start, end } = parseDateRange(req.query);
    const { groupBy, breakdown, jobHolder } = req.query;

    const jobHolderValues = jobHolder ? jobHolder.split(",").map((v) => v.trim()).filter(Boolean) : [];
    const wantsUserBreakdown = breakdown === "user" && jobHolderValues.length > 1;

    const seriesDefs = composite.series.map(({ name, chartKey: subKey, overrides = {} }) => {
      const sub = chartRegistry[subKey];
      if (!sub) throw new ApiError(500, `Composite chart "${chartKey}" references unknown chart "${subKey}"`);
      const matchQuery = applyFilters({ ...sub.baseMatch }, req.query, sub.allowedFilters);
      // NEW: this sub-chart's own jobHolder field path (differs per model)
      const breakdownField = sub.allowedFilters.find(([q]) => q === "jobHolder")?.[1];
      return {
        name,
        breakdownField,
        params: {
          Model: sub.Model, dateField: sub.dateField, dateEndField: sub.dateEndField,
          rangeOverlap: sub.rangeOverlap, matchQuery, start, end, groupBy,
          valueConfig: sub.valueConfig, ...overrides,
        },
      };
    });

    let labels, groupUnit, series;

    if (wantsUserBreakdown) {
      const missing = seriesDefs.find((s) => !s.breakdownField);
      if (missing) {
        throw new ApiError(400, `Chart "${chartKey}" doesn't support a per-user breakdown (sub-chart "${missing.name}" has no jobHolder filter)`);
      }

      const perUser = await getMultiSeriesDataByUser(seriesDefs, jobHolderValues);
      labels = perUser[0]?.bundle.labels || [];
      groupUnit = perUser[0]?.bundle.groupUnit;

      series = perUser.map(({ groupKey, bundle }) => {
        const transformed = typeof composite.transform === "function" ? composite.transform(bundle) : bundle;
        const [resultSeries] = transformed.series;
        return { name: groupKey, data: resultSeries?.data || [] };
      });
    } else {
      let result = await getMultiSeriesData(seriesDefs);
      if (typeof composite.transform === "function") result = composite.transform(result);
      ({ labels, groupUnit, series } = result);
    }

    respondWithChart(res, { start, end, groupUnit, labels, series, user: jobHolder || req.query.user });
  } catch (error) {
    handleChartError(res, error);
  }
};