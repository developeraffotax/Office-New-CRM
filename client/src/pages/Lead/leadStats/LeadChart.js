import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";
 

const LeadsChart = ({ start, end, status }) => {
  const [series, setSeries] = useState([{ name: "Leads", data: [] }]);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);

  // const formattedLabels =  labels.map((d) => dayjs(d).format("DD MMM"));
  const fetchData = async () => {
    if (!start || !end) return;
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/leads/stats`,
        { params: { start, end, status } }
      );
      setLabels(data.labels);
      setSeries(data.series);
    } catch (err) {
      console.error("Error fetching lead stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
  }, [start, end, status]);

  const options = {
    chart: { id: "leads-chart", type: "line", toolbar: { show: false } },
    xaxis: { categories: labels },
    yaxis: { title: { text: "Lead Count" } },
    stroke: { curve: "smooth" },
    dataLabels: { enabled: true },
    tooltip: { x: { format: "yyyy-MM-dd" } },
  };

  return (
    <div className="p-4 bg-white shadow rounded-xl border">
      <h2 className="text-xl font-semibold mb-4">Lead Statistics</h2>
      

      {loading ? (
              <div className="flex items-center justify-center h-[350px]">
                <FaSpinner className="animate-spin text-gray-500 text-3xl" />
              </div>
            ) : (
              <Chart options={options} series={series} type="line" height={350} />
            )}


      
    </div>
  );
};

export default LeadsChart;
