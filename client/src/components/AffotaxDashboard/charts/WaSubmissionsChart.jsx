import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import affotaxApi from "../api/affotaxApi";

export default function WaSubmissionsChart({ dateRange, type }) {
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
        const { data } = await affotaxApi.get("/api/chart/site/wa_submissions/count", { params });
        setChartData(data);
      } catch (err) {
        console.error("Error fetching WhatsApp submissions chart data:", err);
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
    yaxis: { title: { text: "No. of WhatsApp Submissions" } },
    stroke: { curve: "smooth" },
    markers: { size: 4 },
    colors: ["#F27941"],
    dataLabels: { enabled: true },
    tooltip: { y: { formatter: (val) => `${val} submissions` } },
    plotOptions: { bar: { columnWidth: "40%" } },
  };

  const series = [{ name: "WhatsApp Submissions", data: chartData.count }];

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
