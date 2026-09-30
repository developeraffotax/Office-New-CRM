import { useCallback, useEffect, useState } from "react";
import { DEFAULTS, VIEW } from "../constants";

export default function useLeadChartView({ dailyAllowed }) {
  const [chartType, setChartType] = useState(DEFAULTS.chartType);
  const [metric, setMetric] = useState(DEFAULTS.metric);
  const [view, setView] = useState(DEFAULTS.view);
  const [showStats, setShowStats] = useState(DEFAULTS.showStats);
  const [showTargets, setShowTargets] = useState(DEFAULTS.showTargets);

  // Daily view is only valid for short ranges; fall back if range grows
  useEffect(() => {
    if (view === VIEW.DAILY && !dailyAllowed) setView(VIEW.MONTHLY);
  }, [view, dailyAllowed]);

  const toggleStats = useCallback(() => setShowStats((v) => !v), []);
  const toggleTargets = useCallback(() => setShowTargets((v) => !v), []);
  const resetView = useCallback(() => setView(DEFAULTS.view), []);

  return {
    chartType, setChartType,
    metric, setMetric,
    view, setView,
    showStats, toggleStats,
    showTargets, toggleTargets,
    resetView,
  };
}