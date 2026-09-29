import { TARGET_SUFFIX, getUserColor } from "./constants";
import { formatCompactNumber } from "./utils";

// Flat ApexCharts series list: per user, the target series first (same
// color, dashed/faded) then the actual series.
export const buildChartSeries = ({
  rawSeries,
  metric,
  categories,
  showTargetSeries,
}) => {
  const metricKey = metric === "count" ? "counts" : "values";
  const targetKey = metric === "count" ? "targetCounts" : "targetValues";

  const zeros = () => new Array(categories.length).fill(0);

  const out = [];
  rawSeries.forEach((s, idx) => {
    if (showTargetSeries) {
      out.push({
        name: `${s.user}${TARGET_SUFFIX}`,
        data: Array.isArray(s[targetKey]) ? s[targetKey] : zeros(),
        _color: getUserColor(idx),
        _isTarget: true,
      });
    }
    out.push({
      name: s.user,
      data: Array.isArray(s[metricKey]) ? s[metricKey] : zeros(),
      _color: getUserColor(idx),
      _isTarget: false,
    });
  });
  return out;
};

export const buildChartOptions = ({
  chartType,
  categories,
  chartSeries,
  metric,
  rawSeries,
}) => {
  const isBar = chartType === "bar";

  const dataCount = categories.length;
  let dynamicWidth = "50%";
  if (dataCount === 1) dynamicWidth = "10%";
  else if (dataCount === 2) dynamicWidth = "25%";

  const colors = chartSeries.map((s) => s._color);
  const strokeWidth = chartSeries.map(() => (isBar ? 0 : 3));
  const dashArray = chartSeries.map((s) => (s._isTarget ? 6 : 0));
  const fillOpacity = chartSeries.map((s) => (s._isTarget ? 0.35 : 1));

  return {
    chart: {
      toolbar: { show: true },
      type: chartType,
      animations: { enabled: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: dynamicWidth,
        borderRadius: 0,
        dataLabels: { position: "top" },
      },
    },
    stroke: { width: strokeWidth, dashArray, curve: "smooth" },
    fill: { opacity: fillOpacity },
    xaxis: { categories },
    yaxis: {
      title: { text: metric === "count" ? "Lead Count" : "Total Value (£)" },
      labels: {
        formatter: (val) => {
          if (val === undefined || val === null || Number.isNaN(val)) return "";
          return metric === "count"
            ? val.toFixed(0)
            : `£${val.toLocaleString()}`;
        },
      },
      min: 0,
    },
    colors,
    legend: { show: false },
    dataLabels: {
      enabled: true,
      offsetY: isBar ? -20 : 0,
      style: {
        colors: isBar ? ["#333"] : colors,
        fontSize: "12px",
        fontWeight: "bold",
      },
      background: { enabled: !isBar },
      formatter: (val, opts) => {
        const { seriesIndex, dataPointIndex, w } = opts;
        const name = w.config.series[seriesIndex]?.name || "";

        if (name.endsWith(TARGET_SUFFIX)) return formatCompactNumber(val);

        const targetKey = metric === "count" ? "targetCounts" : "targetValues";
        const targetVal = rawSeries.find((s) => s.user === name)?.[targetKey]?.[
          dataPointIndex
        ];

        if (targetVal) {
          const percent = ((val / targetVal) * 100).toFixed(0);
          return `${formatCompactNumber(val)} (${percent}%)`;
        }
        return formatCompactNumber(val);
      },
    },
  };
};