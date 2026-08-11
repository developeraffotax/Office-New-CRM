import { useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import dashboardApi from "../api/dashboardApi";
import { colorsForSeries } from "../utils/userColors";

 

// Fields the API returns that describe the response, not a data series.
// Everything else that's an array gets turned into a chart series
// automatically — see extractSeries below.
const META_FIELDS = new Set(["categories", "interval", "label", "chartKey", "key", "unit"]);

const humanizeKey = (key) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();

const formatByType = (valueType) => (value) => {
  const num = Number(value) || 0;
  const abs = Math.abs(num);

  if (valueType === "percent") {
    return `${num.toFixed(1)}%`;
  }

  let short;
  if (abs >= 1_000_000) short = `${(num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1)}M`;
  else if (abs >= 1_000) short = `${(num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1)}K`;
  else short = num.toString();

  return valueType === "currency" ? `£${short}` : short;
};

/**
 * Pulls every array-valued field out of the payload (besides the known
 * metadata fields above) and turns it into an ApexCharts series. This
 * is deliberately generic rather than hardcoded per chartKey, since the
 * controller source (dashboard.controller.js) wasn't available to check
 * exact field names — it works for both the "single" endpoint (usually
 * one array) and "multi" endpoint (several arrays) as long as each
 * series is a plain array of numbers.
 *
 * If a real response nests series differently (e.g. under a `series`
 * key of {name, data} objects instead of top-level arrays), that's the
 * one thing to adjust here once you've checked an actual payload.
 */
const extractSeries = (payload) => {
  if (!payload) return [];

  if (Array.isArray(payload.series)) {
    // Already in ApexCharts { name, data } shape
    return payload.series;
  }

  const arrayFields = Object.entries(payload).filter(
    ([key, value]) => !META_FIELDS.has(key) && Array.isArray(value)
  );

  // Single-series response with an explicit label from the API — prefer
  // that over the raw field name (e.g. "data" -> "New Sales").
  if (arrayFields.length === 1 && payload.label) {
    const [, value] = arrayFields[0];
    return [{ name: payload.label, data: value }];
  }

  return arrayFields.map(([key, value]) => ({ name: humanizeKey(key), data: value }));
};

export default function ChartPanel({ chartKey, isMulti, valueType = "count", dateRange, type, source, users }) {
  const [categories, setCategories] = useState([]);
  const [series, setSeries] = useState([]);
  const [interval, setIntervalLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchChartData = async () => {
      setLoading(true);
      setError(null);
      const params = {};
      if (dateRange) {
        const [startDate, endDate] = dateRange;
        params.start = startDate.toISOString();
        params.end = endDate.toISOString();
      }

      if(source) {
      params.source = source;
    }

    if (users.length > 0) {
      params.jobHolder = users.join(",");
      if (users.length > 1) {
        // tell backend to break the series out by user instead of
        // by its normal isMulti metric split
        params.breakdown = "user";
      }
    }

      const endpoint = `/api/v1/dashboard/${isMulti ? "multi" : "single"}/${chartKey}`;

      try {
        const { data } = await dashboardApi.get(endpoint, { params });
        if (cancelled) return;
        setCategories(data.labels || []);
        setSeries(extractSeries(data));
        setIntervalLabel(data.interval || "");
      } catch (err) {
        console.error(`Error fetching chart data for ${chartKey}:`, err);
        if (!cancelled) setError("Couldn't load this chart.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchChartData();
    return () => {
      cancelled = true;
    };
  }, [chartKey, isMulti, dateRange, source, users]);

  const formatValue = useMemo(() => formatByType(valueType), [valueType]);

  // ApexCharts silently drops x-axis labels that don't fit
  // (hideOverlappingLabels defaults to true) — that's almost always why
  // a chart looks like it's "missing" categories the API actually sent.
  // Turning that off means every category from the backend renders, but
  // it needs room to do so without the labels smashing into each other,
  // hence the scrollable, count-driven width below.
  // const MIN_PX_PER_CATEGORY = 56;
  // const hasManyCategories = categories.length > 12;
  // const chartWidth = hasManyCategories
  //   ? categories.length * MIN_PX_PER_CATEGORY
  //   : "100%";

  const options = {
    chart: { type, toolbar: { show: false }, width: "100%" },
    xaxis: {
      categories,
      title: { text: interval === "daily" ? "Days" : "Months" },
      labels: {
        rotate: -45,
        hideOverlappingLabels: false,
        trim: false,
        style: { fontSize: "11px" },
      },
      tickPlacement: "on",
    },
    yaxis: {
      labels: { formatter: formatValue },
    },
    stroke: { curve: "smooth" },
    markers: { size: 4 },
    colors: colorsForSeries(series),
    dataLabels: { enabled: true, formatter: formatValue },
    tooltip: { y: { formatter: formatValue } },
    legend: { show: series.length > 1 },
    plotOptions: {
      bar: { columnWidth: series.length > 1 ? "55%" : "40%" },
    },
  };

  if (loading) return <p>Loading chart...</p>;
  if (error) return <p style={{ color: "#dc2626" }}>{error}</p>;

  return (
    <div className="w-full" style={{ overflowX: "hidden", overflowY: "hidden" }}>
      <Chart
        key={`${chartKey}-${type}-${categories.length}`}
        options={options}
        series={series}
        type={type}
        width={"100%"}
        height={400}
      />
    </div>
  );
}