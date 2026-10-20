import { TARGET_SUFFIX, getUserColor, JOB_METRIC_LABELS } from "./constants";
import { formatCompactNumber } from "./utils";
 

// Per user: target series first (same colour, dashed/faded), then the actual series.
// `metric` is prepared | reviewed | filed — all are counts.
export const buildChartSeries = ({ rawSeries, categories, showTargetSeries }) => {
  const zeros = () => new Array(categories.length).fill(0);

  const out = [];
  rawSeries.forEach((s, idx) => {
    if (showTargetSeries) {
      out.push({
        name: `${s.user}${TARGET_SUFFIX}`,
        data: Array.isArray(s.targetCounts) ? s.targetCounts : zeros(),
        _color: getUserColor(idx),
        _isTarget: true,
      });
    }
    out.push({
      name: s.user,
      data: Array.isArray(s.counts) ? s.counts : zeros(),
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
      title: { text: JOB_METRIC_LABELS[metric] || "Jobs" },
      labels: {
        formatter: (val) => {
          if (val === undefined || val === null || Number.isNaN(val)) return "";
          // daily targets are prorated, so they can be fractional
          return Number.isInteger(val) ? val.toFixed(0) : val.toFixed(1);
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

        const targetVal = rawSeries.find((s) => s.user === name)?.targetCounts?.[
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