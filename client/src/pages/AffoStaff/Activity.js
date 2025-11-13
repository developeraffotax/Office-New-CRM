import dayjs from "dayjs";
import React from "react";
import Chart from "react-apexcharts";
const Activity = ({ screenshots }) => {
  // --- Apex chart data ---
  const times = screenshots.map((s) => dayjs(s.timestamp).format("HH:mm"));
  const overall = screenshots.map((s) => s.activity?.overallActivityPercent);
  const keyboard = screenshots.map((s) => s.activity?.keyboardActivityPercent);
  const mouse = screenshots.map((s) => s.activity?.mouseActivityPercent);

  const chartOptions = {
    chart: {
      id: "activity-chart",
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { easing: "easeinout", speed: 500 },
      foreColor: "#6b7280",
    },
    xaxis: {
      categories: times,
      title: { text: "Time" },
    },
    yaxis: {
      title: { text: "Activity (%)" },
      max: 100,
    },
    stroke: {
      curve: "smooth",
      width: [3, 2, 2],
    },
    colors: ["#2563eb", "#f59e0b", "#10b981"],
    legend: {
      position: "top",
      horizontalAlign: "right",
    },
    tooltip: {
      theme: "light",
      y: {
        formatter: (val) => `${val}%`,
      },
    },
    grid: {
      borderColor: "#e5e7eb",
      strokeDashArray: 4,
    },
  };

  const chartSeries = [
    { name: "Overall", data: overall },
    { name: "Keyboard", data: keyboard },
    { name: "Mouse", data: mouse },
  ];

  return (
    <div className="bg-white p-4 rounded-xl shadow border">
      <h3 className="font-semibold mb-2">Activity Over Time</h3>
      <Chart
        options={chartOptions}
        series={chartSeries}
        type="line"
        height={300}
      />
    </div>
  );
};

export default Activity;
