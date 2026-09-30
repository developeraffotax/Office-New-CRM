import { useMemo } from "react";
import { buildChartOptions, buildChartSeries } from "../chartConfig";

export default function useLeadChartModel({
  rawSeries,
  categories,
  metric,
  chartType,
  showTargets,
}) {
  const chartSeries = useMemo(
    () =>
      buildChartSeries({
        rawSeries,
        metric,
        categories,
        showTargetSeries: showTargets,
      }),
    [rawSeries, metric, categories, showTargets],
  );

  const options = useMemo(
    () => buildChartOptions({ chartType, categories, chartSeries, metric, rawSeries }),
    [chartType, categories, chartSeries, metric, rawSeries],
  );

  return { chartSeries, options };
}