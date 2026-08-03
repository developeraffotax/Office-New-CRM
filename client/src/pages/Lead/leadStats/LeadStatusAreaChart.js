import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";

const LeadAreaChart = ({ start, end, lead_Source, setLeadSource, department, setDepartment }) => {
  const [chartData, setChartData] = useState({ series: [], labels: [] });
  const [loading, setLoading] = useState(false);
  const [groupBy, setGroupBy] = useState("auto");
  const [effectiveGroupBy, setEffectiveGroupBy] = useState("day");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/leads/won-lost-stats`,
          { params: { start, end, lead_Source, department, groupBy } }
        );

        if (data.success) {
          setChartData({ series: data.series, labels: data.labels });
          setEffectiveGroupBy(data.filters?.groupBy || "day");
        }
      } catch (error) {
        console.error("Error fetching lead stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (start && end) {
      fetchData();
    }
  }, [start, end, lead_Source, department, groupBy]);

  const options = {
    chart: {
      type: "area",
      toolbar: { show: false },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    xaxis: {
      categories: chartData.labels,
      labels: {
        rotate: -45,
        style: { fontSize: "12px" },
      },
    },
    yaxis: {
      title: { text: "Leads" },
    },
    colors: ["#10B981", "#EF4444"],
    tooltip: {
      x: {
        show: true,
        ...(effectiveGroupBy === "day" ? { format: "dd MMM yyyy" } : {}),
      },
    },
    legend: { position: "top" },
  };

  return (
    <div className="w-full bg-white p-4 shadow rounded-lg border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Won vs Lost Leads</h2>
        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
          className="border rounded px-3 py-1 text-sm"
        >
          <option value="auto">Auto</option>
          <option value="day">Daily</option>
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[350px]">
          <FaSpinner className="animate-spin text-gray-500 text-3xl" />
        </div>
      ) : (
        <Chart options={options} series={chartData.series} type="area" height={350} />
      )}
    </div>
  );
};

export default LeadAreaChart;