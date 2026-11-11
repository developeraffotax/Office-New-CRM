import { useEffect } from "react";
import { TARGET_SUFFIX } from "../constants";

// Hidden USER names are owned by the parent (so saved views can store/restore
// them). Hiding a user hides their actual and target series together.
export default function useLegendVisibility({
  chartRef,
  chartSeries,
  hiddenSeries,
  setHiddenSeries,
  chartType,
  metric,
  hasLoadedOnce,
}) {
  const toggleSeries = (name) =>
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });

  const toggleSeriesGroup = (names) =>
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      const allHidden = names.every((n) => next.has(n));
      names.forEach((n) => (allHidden ? next.delete(n) : next.add(n)));
      return next;
    });

  // Apply hidden state to the actual chart
  useEffect(() => {
    const chart = chartRef.current?.chart;
    if (!chart) return;
    chartSeries.forEach((s) => {
      const user = s._isTarget ? s.name.slice(0, -TARGET_SUFFIX.length) : s.name;
      hiddenSeries.has(user)
        ? chart.hideSeries(s.name)
        : chart.showSeries(s.name);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hiddenSeries, chartSeries, chartType, metric, hasLoadedOnce]);

  return { toggleSeries, toggleSeriesGroup };
}