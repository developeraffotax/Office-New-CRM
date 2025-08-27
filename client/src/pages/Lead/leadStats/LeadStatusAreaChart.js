import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";

const LeadAreaChart = ({ start, end,  lead_Source ,
             setLeadSource ,
             department ,
             setDepartment }) => {
  const [chartData, setChartData] = useState({ series: [], labels: [] });
  const [loading, setLoading] = useState(false);

    
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/leads/won-lost-stats`,
          { params: { start, end, lead_Source, department  } }
        );

        if (data.success) {
          setChartData({
            series: data.series,
            labels: data.labels,
          });
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
  }, [start, end, lead_Source, department]);

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
    colors: ["#10B981", "#EF4444"], // green for Won, red for Lost
    tooltip: {
      x: { format: "yyyy-MM-dd" },
    },
    legend: { position: "top" },
  };

  return (
    <div className="w-full bg-white p-4 shadow rounded-lg border">
      <h2 className="text-lg font-semibold mb-4">Won vs Lost Leads</h2>
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
