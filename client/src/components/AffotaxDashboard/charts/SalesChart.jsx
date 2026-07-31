import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import affotaxApi from "../api/affotaxApi";

const formatCurrency = (value) => {
  if (value >= 1_000_000) {
    return `£${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (value >= 1_000) {
    return `£${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}K`;
  }
  return `£${value}`;
};

export default function SalesChart({ dateRange, type }) {
  const [chartData, setChartData] = useState({
    categories: [],
    count: [],
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
        const { data } = await affotaxApi.get("/api/chart/orders/sales", { params });

        setChartData({
          categories: data.categories,
          count: data.sales,
          interval: data.interval,
        });
      } catch (err) {
        console.error("Error fetching chart data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [dateRange]);

  const options = {
    chart: {
      type: type,
      toolbar: { show: false },
    },
    xaxis: {
      categories: chartData.categories,
      title: { text: chartData.interval === "daily" ? "Days" : "Months" },
      labels: { rotate: -45 },
    },
    yaxis: {
      title: { text: "Sales" },
      labels: {
        formatter: formatCurrency,
      },
    },
    stroke: { curve: "smooth" },
    markers: { size: 4 },
    colors: ["#14B8A6"],
    dataLabels: {
      enabled: true,
      formatter: formatCurrency,
    },
    tooltip: {
      y: {
        formatter: (val) => `${formatCurrency(val)} sales`,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "40%",
      },
    },
  };

  const series = [
    {
      name: "Sales",
      data: chartData.count,
    },
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
