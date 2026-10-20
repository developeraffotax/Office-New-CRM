import React, { memo, useRef } from "react";
import Chart from "react-apexcharts";
import { Box } from "@mui/material";
import UserLeadLegend from "./UserLegend";
import useChartModel from "../hooks/useChartModel";
import useLegendVisibility from "../hooks/useLegendVisibility";
import { CHART_HEIGHT } from "../constants";
import { getChartKey } from "../utils";
import { loadingSx } from "../styles";

function ChartCanvas({
  rawSeries,
  categories,
  hasLoadedOnce,
  chartType,
  metric,
  showTargets,
  selectedUsers,
  userTeamMap,
}) {
  const chartRef = useRef(null);

  const { chartSeries, options } = useChartModel({
    rawSeries,
    categories,
    metric,
    chartType,
    showTargets,
  });

  const { hiddenSeries, toggleSeries, toggleSeriesGroup } = useLegendVisibility({
    chartRef,
    chartSeries,
    selectedUsers,
    showTargetSeries: showTargets,
    chartType,
    metric,
    hasLoadedOnce,
  });

  if (!hasLoadedOnce) {
    return (
      <Box sx={loadingSx} className="animate-pulse">
        Loading chart…
      </Box>
    );
  }

  return (
    <Box>
      <Chart
        key={getChartKey({ chartType, metric, showTargets, rawSeries })}
        ref={chartRef}
        options={options}
        series={chartSeries}
        type={chartType}
        height={CHART_HEIGHT}
      />
      <UserLeadLegend
        series={chartSeries}
        hidden={hiddenSeries}
        onToggleOne={toggleSeries}
        onToggleGroup={toggleSeriesGroup}
        userTeamMap={userTeamMap}
      />
    </Box>
  );
}

export default memo(ChartCanvas);