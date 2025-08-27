import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";

const LeadDonutChart = ({ start, end,  lead_Source ,
             setLeadSource ,
             department ,
             setDepartment }) => {
  const [series, setSeries] = useState([0, 0, 0]);
  const [labels, setLabels] = useState(["Progress", "Won", "Lost"]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/leads/status-stats`,
          {
            params: { start, end, lead_Source, department },
          }
        );
        if (data.success) {
          setSeries(data.series);
          setLabels(data.labels);
        }
      } catch (error) {
        console.error("Error fetching donut chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (start && end) fetchStats();
  }, [start, end, lead_Source, department]);

  const options = {
    chart: {
      type: "donut",
    },
    labels: labels,
    colors: ["#fbbf24", "#22c55e", "#ef4444"], // amber, green, red
    legend: {
      position: "bottom",
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(1)}%`,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Leads",
              formatter: () =>
                series.reduce((acc, curr) => acc + curr, 0).toString(),
            },
          },
        },
      },
    },
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white border p-4 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4 text-center">
        Leads Status Breakdown
      </h2>

      {loading ? (
        <div className="flex items-center justify-center h-[350px]">
          <FaSpinner className="animate-spin text-gray-500 text-3xl" />
        </div>
      ) : (
        <Chart options={options} series={series} type="donut" height={350} />
      )}
    </div>
  );
};

export default LeadDonutChart;
