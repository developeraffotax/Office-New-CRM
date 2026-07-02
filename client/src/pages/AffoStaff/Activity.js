import dayjs from "dayjs";
import React from "react";
import Chart from "react-apexcharts";

const Activity = ({ screenshots, loading, filterType }) => {
  if (!screenshots.length) return null;

  // -----------------------------
  // 1) SORT by timestamp
  // -----------------------------
  const sorted = [...screenshots].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  // -----------------------------
  // 2A) GROUP INTO 30-MIN WINDOWS (single day view)
  // -----------------------------
  const groupByWindow = () => {
    const grouped = [];
    let windowStart = dayjs(sorted[0].timestamp);
    let windowEnd = windowStart.add(30, "minute");
    let buffer = [];

    sorted.forEach((shot) => {
      const time = dayjs(shot.timestamp);

      if (time.isBefore(windowEnd)) {
        buffer.push(shot);
      } else {
        if (buffer.length > 0) grouped.push(buffer);

        while (time.isAfter(windowEnd)) {
          windowStart = windowStart.add(30, "minute");
          windowEnd = windowStart.add(30, "minute");
        }

        buffer = [shot];
      }
    });

    if (buffer.length > 0) grouped.push(buffer);

    return grouped
      .map((chunk) => {
        const valid = chunk.filter((s) => s.activity);
        if (valid.length === 0) return null;

        const avg = (key) =>
          valid.reduce((sum, s) => sum + s.activity[key], 0) / valid.length;

        return {
          label: dayjs(chunk[0].timestamp).format("hh:mm A"),
          overall: Math.round(avg("overallActivityPercent")),
          keyboard: Math.round(avg("keyboardActivityPercent")),
          mouse: Math.round(avg("mouseActivityPercent")),
        };
      })
      .filter(Boolean);
  };

  // -----------------------------
  // 2B) GROUP BY DAY (range view)
  // -----------------------------
  const groupByDay = () => {
    const dayMap = {};

    sorted.forEach((shot) => {
      if (!shot.activity) return;
      const dayKey = dayjs(shot.timestamp).format("YYYY-MM-DD");

      if (!dayMap[dayKey]) dayMap[dayKey] = [];
      dayMap[dayKey].push(shot);
    });

    return Object.keys(dayMap)
      .sort((a, b) => new Date(a) - new Date(b))
      .map((dayKey) => {
        const valid = dayMap[dayKey];

        const avg = (key) =>
          valid.reduce((sum, s) => sum + s.activity[key], 0) / valid.length;

        return {
          label: dayjs(dayKey).format("MMM D"),
          overall: Math.round(avg("overallActivityPercent")),
          keyboard: Math.round(avg("keyboardActivityPercent")),
          mouse: Math.round(avg("mouseActivityPercent")),
        };
      });
  };

  const windowData = filterType === "range" ? groupByDay() : groupByWindow();

  // -----------------------------
  // 3) CHART DATA
  // -----------------------------
  const labels = windowData.map((w) => w.label);
  const overall = windowData.map((w) => w.overall);
  // const keyboard = windowData.map((w) => w.keyboard);
  // const mouse = windowData.map((w) => w.mouse);

  const chartOptions = {
    chart: {
      id: "activity-chart",
      toolbar: { show: false },
      animations: { easing: "easeinout", speed: 500 },
      foreColor: "#6b7280",
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 0.5,
        opacityFrom: 0.4,
        opacityTo: 0.1,
      },
    },
    colors: ["#2563eb", "#f59e0b", "#10b981"],
    xaxis: {
      categories: labels,
      title: {
        text: filterType === "range" ? "Date" : "Time (30-minute windows)",
      },
    },
    yaxis: {
      title: { text: "Activity (%)" },
      max: 100,
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
    },
    tooltip: {
      theme: "light",
      y: { formatter: (val) => `${val}%` },
    },
    grid: {
      borderColor: "#e5e7eb",
      strokeDashArray: 4,
    },
  };

  const chartSeries = [{ name: "Overall", data: overall }];

  return (
    <div className="w-[70%] bg-white p-4 rounded-xl shadow border max-w-6xl min-h-[400px]">
      <h3 className="font-semibold mb-2">
        {filterType === "range" ? "Activity (Per Day)" : "Activity (30-Minute Windows)"}
      </h3>

      {loading ? (
        <div className="animate-pulse mt-6">
          <div className="w-full h-64 bg-gray-200 rounded-lg"></div>
          <div className="flex justify-between mt-4">
            <div className="w-10 h-3 bg-gray-200 rounded"></div>
            <div className="w-10 h-3 bg-gray-200 rounded"></div>
            <div className="w-10 h-3 bg-gray-200 rounded"></div>
            <div className="w-10 h-3 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : (
        <Chart options={chartOptions} series={chartSeries} type="area" height={320} />
      )}
    </div>
  );
};

export default Activity;