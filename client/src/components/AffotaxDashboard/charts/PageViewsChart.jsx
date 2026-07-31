import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import affotaxApi from "../api/affotaxApi";

const formatNumber = (value) => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}K`;
  }
  return value.toString();
};

export default function PageViewsChart({ dateRange, type }) {
  const [chartData, setChartData] = useState({
    categories: [],
    views: [],
    uniqueVisitors: [],
    interval: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      const params = {};
      if (dateRange) {
        const [startDate, endDate] = dateRange;
        params.start = startDate.toISOString();
        params.end = endDate.toISOString();
      }

      try {
        const { data } = await affotaxApi.get("/api/chart/site/pageviews/count", { params });
        setChartData(data);
      } catch (err) {
        console.error("Error fetching page views chart data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [dateRange]);

  const options = {
    chart: { type, toolbar: { show: false } },
    xaxis: {
      categories: chartData.categories,
      title: { text: chartData.interval === "daily" ? "Days" : "Months" },
      labels: { rotate: -45 },
    },
    yaxis: {
      title: { text: "Count" },
      labels: {
        formatter: formatNumber,
      },
    },
    stroke: { curve: "smooth" },
    markers: { size: 4 },
    colors: ["#6366F1", "#DB2777"],
    dataLabels: {
      enabled: true,
      formatter: formatNumber,
    },
    tooltip: {
      y: {
        formatter: formatNumber,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "40%",
      },
    },
  };

  const series = [
    { name: "Page Views", data: chartData.views },
    { name: "Unique Visitors", data: chartData.uniqueVisitors },
  ];

  if (loading) return <p>Loading chart...</p>;

  return (
    <div className="w-full">
      <Chart
        key={`${type}-${chartData.categories.length}`}
        options={options}
        series={series}
        type={type}
        height={400}
      />
    </div>
  );
}
